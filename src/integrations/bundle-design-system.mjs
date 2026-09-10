/**
 * Collapse and whitespace-minify the reviewable CSS module facade into one
 * production response. Source modules stay separate; only Astro's copied dist
 * facade is replaced after the static build is complete.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { designSystemOutputVersion } from '../lib/design-system-version.mjs';

// Use Astro's declared build dependency, including under pnpm's strict layout.
const requireFromAstro = createRequire(import.meta.resolve('astro/package.json'));
const { transform } = requireFromAstro('esbuild');

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
  const { code, warnings } = await transform(chunks.join(''), {
    loader: 'css',
    sourcefile: facadePath,
    // Preserve the cascade, fallback syntax, identifiers and all selectors.
    minifyWhitespace: true,
    minifySyntax: false,
    minifyIdentifiers: false,
    legalComments: 'inline',
    charset: 'utf8',
    logLevel: 'silent',
  });
  // CSS syntax recovery can change meaning; never publish a repaired stylesheet.
  if (warnings.length > 0) {
    throw new Error(`CSS minification refused: ${warnings.map((warning) => warning.text).join('; ')}`);
  }
  return { output: code, imports };
}

async function writeBundledDesignSystem(result, outputDir) {
  const outputPath = path.resolve(outputDir, 'ui', 'design-system.css');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.output);
  return { ...result, outputPath };
}

export async function bundleDesignSystem({ publicDir, outputDir }) {
  return writeBundledDesignSystem(await renderBundledDesignSystem({ publicDir }), outputDir);
}

export function designSystemBundler() {
  let productionBundle;
  return {
    name: 'opda-design-system-bundler',
    hooks: {
      'astro:config:setup': async ({ config, command, updateConfig }) => {
        // Reusing the integration instance must never reuse another build's CSS.
        productionBundle = undefined;
        if (command !== 'build') return;
        productionBundle = renderBundledDesignSystem({ publicDir: config.publicDir });
        const { output } = await productionBundle;
        updateConfig({
          vite: {
            define: { __OPDA_DESIGN_SYSTEM_VERSION__: JSON.stringify(designSystemOutputVersion(output)) },
          },
        });
      },
      'astro:build:done': async ({ dir }) => {
        if (!productionBundle) throw new Error('design-system bundle is missing production setup');
        try {
          // Emit exactly the snapshot hashed into every generated page's CSS URL.
          const result = await writeBundledDesignSystem(await productionBundle, fileURLToPath(dir));
          console.log(`[design-system] bundled and minified ${result.imports.length} modules into one production stylesheet.`);
        } finally {
          productionBundle = undefined;
        }
      },
    },
  };
}
