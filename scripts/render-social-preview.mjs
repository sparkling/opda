#!/usr/bin/env node
/**
 * Render the site-wide social preview card (Open Graph / Twitter image) from
 * the supplied brand assets: the white wordmark on the brand-deep ground with
 * the campaign hero's yellow rule. It is a brand card, not a placement
 * illustration, so every page without artwork of its own may share it.
 *
 * Usage: node scripts/render-social-preview.mjs --fonts <dir>
 * The directory holds RobotoSlab[wght].ttf and SourceSans3[wght].ttf (Google
 * Fonts, Apache-2.0 / OFL). Text is converted to outlines with fontkitten, so
 * the raster needs no installed fonts and renders identically everywhere.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as fontkitten from 'fontkitten';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = 'public/images/social/opda-site-preview.png';
const DEEP = '#131224';
const YELLOW = '#fec92b';
const VIOLET = '#a9a0ff';
const PAPER = '#e3e1e9';

const fontsIndex = process.argv.indexOf('--fonts');
const fonts = fontsIndex > 0 ? resolve(process.argv[fontsIndex + 1]) : null;
if (!fonts) {
  console.error('Pass --fonts <dir> holding RobotoSlab[wght].ttf and SourceSans3[wght].ttf');
  process.exit(2);
}
const face = (file, wght) => fontkitten.create(readFileSync(resolve(fonts, file))).getVariation({ wght });
const slab = face('RobotoSlab[wght].ttf', 600);
const sansSemibold = face('SourceSans3[wght].ttf', 600);
const sansMedium = face('SourceSans3[wght].ttf', 500);

/** Lay out runs of text as glyph outlines; runs share a baseline and are centred on x. */
function line(runs, { x, y, size, tracking = 0 }) {
  const shaped = runs.map(({ font, text, fill }) => {
    const glyphs = font.glyphsForString(text);
    const scale = size / font.unitsPerEm;
    const width = glyphs.reduce((sum, glyph) => sum + glyph.advanceWidth * scale + tracking, -tracking);
    return { glyphs, scale, width, fill };
  });
  let cursor = x - shaped.reduce((sum, run) => sum + run.width, 0) / 2;
  const paths = [];
  for (const { glyphs, scale, fill } of shaped) {
    for (const glyph of glyphs) {
      const d = glyph.path.toSVG();
      if (d) paths.push(`<path fill="${fill}" transform="translate(${cursor.toFixed(2)} ${y}) scale(${scale.toFixed(5)} ${(-scale).toFixed(5)})" d="${d}"/>`);
      cursor += glyph.advanceWidth * scale + tracking;
    }
  }
  return paths.join('\n');
}

const wordmark = readFileSync('public/ui/brand/opda-wordmark-white.svg', 'utf8')
  .replace(/<\?xml[^>]*\?>/u, '').replace(/<!--.*?-->/gsu, '')
  .replace('<svg id="Layer_1"', '<svg x="340" y="90" width="520" height="147.5"');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.65">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${DEEP}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  ${wordmark}
  <rect x="540" y="282" width="120" height="5" fill="${YELLOW}"/>
  ${line([{ font: slab, text: 'A shared language', fill: '#ffffff' }], { x: 600, y: 372, size: 58 })}
  ${line([{ font: slab, text: 'for ', fill: '#ffffff' }, { font: slab, text: 'property data', fill: YELLOW }], { x: 600, y: 440, size: 58 })}
  ${line([{ font: sansSemibold, text: 'Smart Property Data Trust Framework', fill: PAPER }], { x: 600, y: 504, size: 28, tracking: 1 })}
  ${line([{ font: sansMedium, text: 'opda.org.uk', fill: VIOLET }], { x: 600, y: 578, size: 24, tracking: 0.5 })}
  <rect x="0" y="${HEIGHT - 8}" width="${WIDTH}" height="8" fill="${YELLOW}"/>
</svg>`;

await sharp(Buffer.from(svg), { density: 144 }).resize(WIDTH, HEIGHT).png({ compressionLevel: 9 }).toFile(OUTPUT);
console.log(`wrote ${OUTPUT} (${WIDTH}x${HEIGHT})`);
