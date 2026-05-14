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
  vite: {
    server: {
      // Don't auto-open browser when running `astro dev`
      open: false,
    },
  },
});
