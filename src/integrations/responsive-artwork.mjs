import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function responsiveArtworkPublisher() {
  return { name: 'opda-responsive-artwork', hooks: {
    'astro:build:done': async ({ dir }) => {
      const output = fileURLToPath(dir);
      const used = new Set();
      // Publish only renditions referenced by this exact build, not old cache files.
      for (const entry of await readdir(output, { recursive: true })) {
        if (!entry.endsWith('.html')) continue;
        const html = await readFile(path.join(output, entry), 'utf8');
        for (const match of html.matchAll(/\/_images\/([a-f0-9]{20}-\d+\.webp)/gu)) used.add(match[1]);
      }
      if (!used.size) return;
      await mkdir(path.join(output, '_images'), { recursive: true });
      for (const name of used) await copyFile(path.join(process.cwd(), '_build/responsive-artwork', name), path.join(output, '_images', name));
      console.log(`[artwork] published ${used.size} responsive renditions; originals preserved.`);
    },
  } };
}
