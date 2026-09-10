/**
 * Collapse the reviewable design-system CSS module facade into one production
 * response. Source modules stay separate; only Astro's copied dist facade is
 * replaced after the static build is complete.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCAL_IMPORT = /@import\s+url\((["'])([^"'?]+\.css)(?:\?v=[a-f0-9]+)?\1\);/gu;
const CSS_URL = /url\(\s*(?:(["'])(.*?)\1|([^"')]+))\s*\)/gu;

function inside(directory, target) {
  const relative = path.relative(directory, target);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function rebaseModuleUrls(source, modulePath, facadePath) {
  return source.replace(CSS_URL, (match, quote = '', quotedValue, bareValue) => {
    const value = quotedValue ?? bareValue.trim();
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/iu.test(value)) return match;

    const suffixAt = value.search(/[?#]/u);
    const pathname = suffixAt === -1 ? value : value.slice(0, suffixAt);
    const suffix = suffixAt === -1 ? '' : value.slice(suffixAt);
    const target = path.resolve(path.dirname(modulePath), pathname);
    let relative = path.relative(path.dirname(facadePath), target).replaceAll(path.sep, '/');
    if (!relative.startsWith('.')) relative = `./${relative}`;
    return `url(${quote}${relative}${suffix}${quote})`;
  });
}

export async function renderBundledDesignSystem({ publicDir }) {
  const publicPath = path.resolve(publicDir instanceof URL ? fileURLToPath(publicDir) : publicDir);
  const uiRoot = path.join(publicPath, 'ui');
  const facadePath = path.join(uiRoot, 'design-system.css');
  const source = await readFile(facadePath, 'utf8');
  const matches = [...source.matchAll(LOCAL_IMPORT)];
  if (matches.length === 0) throw new Error('design-system.css contains no local CSS imports');

  const imports = [];
  const chunks = [];
  let offset = 0;
  for (const match of matches) {
    chunks.push(source.slice(offset, match.index));
    const relativeImport = match[2];
    const modulePath = path.resolve(path.dirname(facadePath), relativeImport);
    if (!inside(uiRoot, modulePath)) {
      throw new Error(`design-system import escapes public/ui: ${relativeImport}`);
    }
    const moduleSource = await readFile(modulePath, 'utf8');
    const moduleName = path.relative(uiRoot, modulePath).replaceAll(path.sep, '/');
    imports.push(relativeImport);
    chunks.push(`/* bundled from ${moduleName} */\n${rebaseModuleUrls(moduleSource, modulePath, facadePath)}`);
    offset = match.index + match[0].length;
  }
  chunks.push(source.slice(offset));
  return { output: chunks.join(''), imports };
}

export async function bundleDesignSystem({ publicDir, outputDir }) {
  const result = await renderBundledDesignSystem({ publicDir });
  const outputPath = path.resolve(outputDir, 'ui', 'design-system.css');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.output);
  return { ...result, outputPath };
}

export function designSystemBundler() {
  let publicDir;
  return {
    name: 'opda-design-system-bundler',
    hooks: {
      'astro:config:done': ({ config }) => {
        publicDir = fileURLToPath(config.publicDir);
      },
      'astro:build:done': async ({ dir }) => {
        const result = await bundleDesignSystem({ publicDir, outputDir: fileURLToPath(dir) });
        console.log(`[design-system] bundled ${result.imports.length} modules into one production stylesheet.`);
      },
    },
  };
}
