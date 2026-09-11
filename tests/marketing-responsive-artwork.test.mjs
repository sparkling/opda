import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import { responsiveArtwork } from '../src/lib/responsive-artwork.mjs';

test('responsive artwork preserves originals and emits smaller aspect-correct mobile renditions', async () => {
  const src = '/images/modelling/style-variants/2026-09/riso/method-risograph-light.webp';
  const original = await readFile(path.join('public', src));
  const info = await sharp(original).metadata();
  const result = await responsiveArtwork(src);
  assert.ok(result.endsWith(`${src} ${info.width}w`));
  const candidates = result.split(', ').slice(0, -1);
  assert.equal(candidates.length, 3);
  for (const candidate of candidates) {
    const [url, descriptor] = candidate.split(' ');
    const bytes = await readFile(path.join('_build/responsive-artwork', path.basename(url)));
    const dimensions = await sharp(bytes).metadata();
    const width = Number(descriptor.slice(0, -1));
    assert.equal(dimensions.width, width);
    assert.ok(Math.abs(dimensions.height - info.height * width / info.width) <= 1);
    assert.ok(bytes.length < original.length);
  }
  assert.deepEqual(await readFile(path.join('public', src)), original);
  assert.equal(await responsiveArtwork(src), result, 'repeated placements do not re-encode');
});

test('dev mode and vector/external resources are not transformed', async () => {
  for (const src of [undefined, '/images/diagram.svg', 'https://example.test/image.webp']) {
    assert.equal(await responsiveArtwork(src), undefined);
  }
  assert.equal(await responsiveArtwork('/images/not-present.webp', { enabled: false }), undefined);
});
