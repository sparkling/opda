import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { parse } from 'parse5';

const ENTRY = /\.(?:css|js)$/u;
const BINARY = /\.(?:woff2?|ttf|otf|svg|png|jpe?g|webp|avif|gif|ico)$/u;
const FILE_LOADERS = Object.fromEntries(['woff2', 'woff', 'ttf', 'otf', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico'].map(ext => [`.${ext}`, 'file']));
const URL_ATTRIBUTES = new Set(['href', 'src', 'poster', 'data-src', 'data-light', 'data-dark']);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.')) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(filename));
    else if (entry.isFile()) result.push(filename);
  }
  return result;
}

function publicUrl(root, filename) {
  const relative = path.relative(root, filename).split(path.sep).join('/');
  if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error(`UI asset escapes output directory: ${filename}`);
  return `/${relative}`;
}

function mappedUrl(value, urls, pageUrl) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(value)) return value;
  const parsed = new URL(value, `https://opda.invalid${pageUrl}`);
  const target = urls[parsed.pathname];
  if (!target) return value;
  parsed.searchParams.delete('v');
  return `${target}${parsed.search}${parsed.hash}`;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

async function rewriteInlineCss(source, urls) {
  if (!source.includes('/ui/')) return source;
  const result = await build({
    stdin: { contents: source, loader: 'css', sourcefile: 'inline.css' },
    bundle: true, write: false, minifyWhitespace: true, logLevel: 'silent',
    plugins: [{ name: 'opda-inline-ui-urls', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => ({ path: mappedUrl(args.path, urls, '/'), external: true }));
    } }],
  });
  if (result.warnings.length) throw new Error('Refusing to rewrite invalid inline CSS');
  return result.outputFiles[0].text.trim();
}

async function rewriteHtml(filename, root, urls) {
  const source = await readFile(filename, 'utf8');
  if (!source.includes('/ui/') && !source.includes('ui/') && !source.includes('/_astro/')) return false;
  const document = parse(source, { sourceCodeLocationInfo: true });
  const replacements = [];
  const pageUrl = publicUrl(root, filename);
  async function visit(node) {
    const locations = node.sourceCodeLocation;
    const attrs = node.attrs ?? [];
    let newResource;
    for (const attr of attrs) {
      if (!URL_ATTRIBUTES.has(attr.name)) continue;
      const next = mappedUrl(attr.value, urls, pageUrl);
      if (next === attr.value) continue;
      const location = locations?.attrs?.[attr.name];
      if (!location) throw new Error(`Missing HTML source location in ${filename}`);
      replacements.push({ start: location.startOffset, end: location.endOffset, text: `${attr.name}="${escapeAttribute(next)}"` });
      if (attr.name === 'src' || attr.name === 'href') newResource = next.split(/[?#]/u)[0];
    }
    const integrity = attrs.find(attr => attr.name === 'integrity');
    if (integrity && newResource) {
      const bytes = await readFile(path.join(root, newResource.slice(1)));
      const value = integrity.value.split(/\s+/u).map(token => {
        const algorithm = token.split('-')[0];
        if (!['sha256', 'sha384', 'sha512'].includes(algorithm)) throw new Error(`Unsupported local-asset integrity algorithm: ${algorithm}`);
        return `${algorithm}-${createHash(algorithm).update(bytes).digest('base64')}`;
      }).join(' ');
      const location = locations.attrs.integrity;
      replacements.push({ start: location.startOffset, end: location.endOffset, text: `integrity="${value}"` });
    }
    if (node.tagName === 'style' && locations?.startTag && locations?.endTag) {
      const start = locations.startTag.endOffset;
      const end = locations.endTag.startOffset;
      const css = source.slice(start, end);
      const next = await rewriteInlineCss(css, urls);
      if (next !== css) replacements.push({ start, end, text: next });
    }
    for (const child of node.childNodes ?? []) await visit(child);
    if (node.content) await visit(node.content);
  }
  await visit(document);
  if (!replacements.length) return false;
  let output = source;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, replacement.start) + replacement.text + output.slice(replacement.end);
  }
  await writeFile(filename, output);
  return true;
}

/**
 * The production compiler owns CSS/JS dependency discovery and content hashes.
 * HTML is rewritten by parsed attribute locations, never by a JS-string regex.
 * Stable /ui URLs remain available; only page-owned resource references change.
 */
export async function publishImmutableUiAssets({ outputDir }) {
  const root = path.resolve(outputDir);
  const uiRoot = path.join(root, 'ui');
  const inputs = await filesIn(uiRoot);
  const entries = inputs.filter(filename => ENTRY.test(filename));
  // A few page-owned Vite stylesheets (for example the presentation) reference
  // public fonts. Re-emit those under a new hash too; never overwrite a previously
  // content-addressed _astro filename with different CSS bytes.
  for (const filename of await filesIn(path.join(root, '_astro'))) {
    if (filename.endsWith('.css') && (await readFile(filename, 'utf8')).includes('/ui/')) entries.push(filename);
  }
  if (!entries.length) return { urls: {}, rewrittenPages: 0 };
  const immutableRoot = path.join(root, '_ui');
  const result = await build({
    absWorkingDir: root,
    entryPoints: entries.map(filename => ({
      in: filename,
      out: path.relative(uiRoot, filename).startsWith('..')
        ? `astro/${path.basename(filename, path.extname(filename))}`
        : path.relative(uiRoot, filename).slice(0, -path.extname(filename).length),
    })),
    outbase: uiRoot, outdir: immutableRoot,
    entryNames: '[dir]/[name].[hash]', assetNames: 'assets/[name].[hash]',
    bundle: true, write: false, metafile: true, platform: 'browser',
    publicPath: '/_ui', loader: FILE_LOADERS, charset: 'utf8',
    minifyWhitespace: true, minifySyntax: false, minifyIdentifiers: false,
    legalComments: 'inline', logLevel: 'silent',
    plugins: [{ name: 'opda-root-relative-ui-assets', setup(builder) {
      builder.onResolve({ filter: /^\// }, args => {
        if (args.kind === 'entry-point') return undefined;
        if (args.path.startsWith('//')) return { path: args.path, external: true };
        const localPath = args.path.split(/[?#]/u)[0];
        const target = path.resolve(root, `.${localPath}`);
        publicUrl(root, target);
        return { path: target, suffix: args.path.slice(localPath.length) };
      });
    } }],
  });
  if (result.warnings.length) {
    throw new Error(`Immutable UI build refused: ${result.warnings.map(warning => warning.text).join('; ')}`);
  }
  const urls = {};
  for (const [outputName, metadata] of Object.entries(result.metafile.outputs)) {
    const output = path.resolve(root, outputName);
    const input = metadata.entryPoint ?? (BINARY.test(output) ? Object.keys(metadata.inputs)[0] : null);
    if (input) urls[publicUrl(root, path.resolve(root, input))] = publicUrl(root, output);
  }
  for (const output of result.outputFiles) {
    await mkdir(path.dirname(output.path), { recursive: true });
    await writeFile(output.path, output.contents);
  }
  // HTML-only brand/font references need the same immutable guarantee, including
  // assets that no currently selected stylesheet imports.
  for (const filename of inputs.filter(value => BINARY.test(value))) {
    const originalUrl = publicUrl(root, filename);
    if (urls[originalUrl]) continue;
    const bytes = await readFile(filename);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const extension = path.extname(filename);
    const name = `${path.basename(filename, extension)}.${hash}${extension}`;
    const output = path.join(immutableRoot, 'assets', name);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, bytes);
    urls[originalUrl] = publicUrl(root, output);
  }
  let rewrittenPages = 0;
  for (const filename of await filesIn(root)) {
    if (filename.endsWith('.html') && await rewriteHtml(filename, root, urls)) rewrittenPages++;
  }
  return { urls: Object.fromEntries(Object.entries(urls).sort()), rewrittenPages };
}
