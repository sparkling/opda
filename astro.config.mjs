// @ts-check
import { defineConfig } from 'astro/config';

// The existing static docs at /docs/ are the "public" assets.
// Astro passes them through as-is and adds a few generated routes
// (sitemap.xml, 404.html). Output lands in /dist/ for Cloudflare Pages.
export default defineConfig({
  site:      'https://opda-kb.pages.dev',
  publicDir: './docs',
  outDir:    './dist',
  build: {
    format: 'file',
  },
  server: {
    // 4321 conflicts with other tools on this machine — use 4330 instead.
    // dev.sh probes 4330-4339 and picks the first free one if 4330 is busy too.
    port: 4330,
    host: false,
  },
  vite: {
    server: {
      // Don't auto-open browser when running `astro dev`
      open: false,
    },
  },
});
