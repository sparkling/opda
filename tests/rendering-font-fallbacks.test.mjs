import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// FontTools hhea/head/hmtx measurements at instantiated 400/600/700 weights.
// Local fallback: macOS Arial/Arial Bold and Georgia Bold. No local font files
// are distributed. Widths use this representative English sample, not OS/2's
// xAvgCharWidth (which can be stale after subsetting):
// The Open Property Data Association and organisations across the property
// industry are developing a shared language for property data. Bring experience.
// Improve the proposal. Change what will matter. Working groups help people share
// information and understand the meaning of common terms.
const measurements = [
  {
    family: 'Source Sans 3', file: 'SourceSans3', ascent: 1.024, descent: 0.400,
    hash: 'ac057a5593cbe3df0d2585da5dd5f33b8efa84aa30550c710fe061b37fc5c54b',
    widths: [94.12563237961696, 89.94118294966407, 92.41193964092963],
  },
  {
    family: 'Atkinson Hyperlegible Next', file: 'AtkinsonHyperlegibleNext', ascent: 0.984, descent: 0.316,
    hash: '1e4cea71d75ec427581d6259fc07148a2e60d60d16cabf4b4f5360487b3f9dc3',
    widths: [99.38205707460207, 96.94953188677167, 99.01425267099901],
  },
  {
    family: 'Roboto Slab', file: 'RobotoSlab', ascent: 2146 / 2048, descent: 555 / 2048,
    hash: '317b2dafcfcd18ae868e7cb3c5a33a323999bc4c3c400e237801efc2a3a74aac',
    widths: [92.43051373474937, 92.67299475208627],
  },
];

test('fallback overrides match measured vertical font metrics at each served weight', async () => {
  const css = await readFile(new URL('../public/ui/fonts.css', import.meta.url), 'utf8');
  for (const measured of measurements) {
    const bytes = await readFile(new URL(`../public/ui/fonts/${measured.file}-Variable-latin.woff2`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), measured.hash,
      `remeasure fallback metrics if the ${measured.family} font binary changes`);
    const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/gu)]
      .map((match) => match[1]).filter((face) => face.includes(`'${measured.family} Fallback'`));
    assert.equal(faces.length, measured.widths.length);
    faces.forEach((face, index) => {
      const metric = (name) => Number(face.match(new RegExp(`${name}:\\s*([\\d.]+)%`, 'u'))?.[1]) / 100;
      const size = metric('size-adjust');
      assert.ok(Math.abs(size * 100 - measured.widths[index]) < 0.0001, 'retain the measured width adjustment');
      assert.ok(Math.abs(metric('ascent-override') * size - measured.ascent) < 0.000002);
      assert.ok(Math.abs(metric('descent-override') * size - measured.descent) < 0.000002);
      assert.equal(metric('line-gap-override'), 0);
      assert.match(face, /src:\s*local\(/u);
      assert.doesNotMatch(face, /url\(/u, 'a fallback must not create another network dependency');
      assert.match(face, /font-display:\s*swap/u);
    });
  }
});

test('approved web fonts remain first, with measured local faces ahead of generic fallbacks', async () => {
  const css = await readFile(new URL('../public/ui/design-tokens.css', import.meta.url), 'utf8');
  for (const { family } of measurements) {
    assert.ok(css.includes(`'${family}', '${family} Fallback',`));
  }
  assert.match(css, /--font-mono:\s*'Roboto Mono'/u, 'the lower-page poster typeface is not silently replaced');
});
