import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');

test('large documentation collections use Astro chunked storage', () => {
  assert.equal(packageJson.dependencies.astro, '^7.2.4');
  assert.match(
    astroConfig,
    /collectionStorage:\s*\{\s*type:\s*'chunked',\s*chunkSize:\s*1024\s*\*\s*1024,?\s*\}/su,
  );

  for (const collection of ['manual', 'odr', 'adr']) {
    assert.match(contentConfig, new RegExp(`const ${collection} = defineCollection\\(`, 'u'));
  }
  assert.match(contentConfig, /export const collections = \{ manual, odr, adr \};/u);
});
