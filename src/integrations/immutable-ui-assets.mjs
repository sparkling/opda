import { fileURLToPath } from 'node:url';
import { publishImmutableUiAssets } from '../lib/immutable-ui-assets.mjs';

/** Must run after the CSS bundler and all integrations that rewrite page HTML. */
export function immutableUiAssets() {
  return {
    name: 'opda-immutable-ui-assets',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const result = await publishImmutableUiAssets({ outputDir: fileURLToPath(dir) });
        console.log(`[immutable-ui] published ${Object.keys(result.urls).length} content-addressed resources; updated ${result.rewrittenPages} pages.`);
      },
    },
  };
}
