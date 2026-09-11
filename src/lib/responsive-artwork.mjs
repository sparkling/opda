import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const ARTWORK_SIZES = '(max-width: 768px) calc(100vw - 32px), 1024px';
const pending = new Map();
// Bound CPU and memory while Astro renders many routes concurrently.
let active = 0;
const waiting = [];
async function bounded(task) {
  if (active >= 4) await new Promise(resolve => waiting.push(resolve));
  else active++;
  try { return await task(); }
  finally {
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}

export async function responsiveArtwork(src, { enabled = true, root = process.cwd() } = {}) {
  if (!enabled || !src || !/^\/images\/.+\.(?:webp|png|jpe?g|avif)$/iu.test(src)) return undefined;
  const key = root + ':' + src;
  if (!pending.has(key)) pending.set(key, bounded(async () => {
    const publicRoot = await realpath(path.join(root, 'public'));
    const filename = await realpath(path.join(publicRoot, src));
    if (!filename.startsWith(publicRoot + path.sep)) throw new Error('Artwork escapes public directory');
    const original = await readFile(filename);
    const metadata = await sharp(original).metadata();
    if (!metadata.width || (metadata.pages ?? 1) > 1) return undefined;
    const digest = createHash('sha256').update(original).update('webp-q82-v1').digest('hex').slice(0, 20);
    const cache = path.join(root, '_build', 'responsive-artwork');
    await mkdir(cache, { recursive: true });
    const candidates = [];
    for (const width of [480, 768, 1024].filter(width => width < metadata.width)) {
      const name = `${digest}-${width}.webp`;
      const destination = path.join(cache, name);
      try { await readFile(destination); }
      catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await writeFile(destination, await sharp(original).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer());
      }
      candidates.push(`/_images/${name} ${width}w`);
    }
    candidates.push(`${src} ${metadata.width}w`);
    return candidates.join(', ');
  }));
  return pending.get(key);
}
