// @ts-check
import { defineConfig, passthroughImageService, logHandlers } from 'astro/config';
// Astro 7 makes the Rust "Sätteri" processor the default for Markdown. This
// site's build relies on custom remark/rehype plugins (below), so opt back into
// the unified (remark/rehype) pipeline via @astrojs/markdown-remark.
import { unified } from '@astrojs/markdown-remark';
import fs from 'node:fs';
import path from 'node:path';

// ADR-0018: build-time remark + rehype plugins for the manual content collection
import { remarkUnwrapMermaidDetails } from './src/lib/remark/unwrap-mermaid-details.ts';
import { remarkRewriteManualLinks } from './src/lib/remark/rewrite-manual-links.ts';
// ADR-0024: convert plain ```mermaid fences (ODR markdown) → <div class="mermaid">
import { remarkMermaidFence } from './src/lib/remark/mermaid-fence.ts';
import { rehypeFrontmatterUriExtraction } from './src/lib/remark/frontmatter-uri-extraction.ts';

// ADR-0021 §"Separate task": generate static HTML for embedded meta-reports
// (validation report) at build/dev start; the page serves the generated output.
import { reportGenerator } from './src/integrations/generate-report-html.mjs';

// ADR-0022: generate diagram-links manifest (public/data/diagram-links.json)
// at build/dev start so client.js can wire SVG node clicks to entity routes.
import { diagramLinksGenerator } from './src/integrations/generate-diagram-links.mjs';

// Surface the council-session corpus: copy docs/ontology/odr/council/ → public/council/
// (so it ships to dist/) and emit src/data/council-manifest.json at build/dev start.
import { councilGenerator } from './src/integrations/generate-council.mjs';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Dev-only Vite plugin: expose project sub-trees (source/, _build/) that
// live OUTSIDE publicDir so the resource viewer can fetch them at
// http://localhost:4330/source/...  Production builds don't ship these.
const MIME = {
  md:   'text/markdown; charset=utf-8',
  ttl:  'text/turtle; charset=utf-8',
  rdf:  'application/rdf+xml; charset=utf-8',
  xml:  'application/xml; charset=utf-8',
  yaml: 'text/yaml; charset=utf-8',
  yml:  'text/yaml; charset=utf-8',
  json: 'application/json; charset=utf-8',
  csv:  'text/csv; charset=utf-8',
  tsv:  'text/tab-separated-values; charset=utf-8',
  txt:  'text/plain; charset=utf-8',
  log:  'text/plain; charset=utf-8',
  py:   'text/x-python; charset=utf-8',
  js:   'application/javascript; charset=utf-8',
  ts:   'application/typescript; charset=utf-8',
  css:  'text/css; charset=utf-8',
  html: 'text/html; charset=utf-8',
  pdf:  'application/pdf',
  // Image types — useful when source/ contains screenshots etc.
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  gif:  'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg:  'image/svg+xml',
  ico:  'image/x-icon',
};

const SERVED_ROOTS = ['source', '_build'];

// Files and folders we never want to expose, even under a served root.
const SKIP_NAMES = new Set([
  '.DS_Store', '.git', '.gitignore', '.gitkeep',
  'node_modules', '.venv', '.cache', '.next', '.astro',
]);

function shouldSkip(name) {
  if (SKIP_NAMES.has(name)) return true;
  // Anything dot-prefixed is hidden by convention; allow opt-in later.
  if (name.startsWith('.')) return true;
  return false;
}

const serveProjectRoots = {
  name: 'serve-project-roots',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      const [urlPath, urlQuery] = url.split('?');
      const rawUrl = urlPath.split('#')[0];
      const segs = rawUrl.split('/').filter(Boolean);
      if (!segs.length || !SERVED_ROOTS.includes(segs[0])) return next();

      const root = process.cwd();
      const safe = segs.filter(s => s && s !== '..' && s !== '.');
      const targetPath = path.join(root, ...safe);
      if (!targetPath.startsWith(root + path.sep)) return next();

      const params = new URLSearchParams(urlQuery || '');
      const wantIndex = params.has('index');

      fs.stat(targetPath, (err, stats) => {
        if (err) return next();

        // ── Directory: return JSON index when ?index=1, otherwise let
        //    Astro's default 404 handler take over so we don't accidentally
        //    expose listings to plain navigation.
        if (stats.isDirectory()) {
          if (!wantIndex) return next();
          fs.readdir(targetPath, { withFileTypes: true }, (rerr, dirents) => {
            if (rerr) return next();
            const entries = [];
            let pending = dirents.length;
            const finish = () => {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(JSON.stringify({
                path: rawUrl.replace(/\/$/, ''),
                entries,
              }));
            };
            if (!pending) return finish();
            dirents.forEach((d) => {
              const name = d.name;
              if (shouldSkip(name)) {
                pending--;
                if (!pending) finish();
                return;
              }
              const childPath = path.join(targetPath, name);
              fs.stat(childPath, (cerr, cstats) => {
                if (!cerr && cstats) {
                  const isDir = cstats.isDirectory();
                  const e = {
                    name,
                    kind: isDir ? 'dir' : 'file',
                    size: isDir ? null : cstats.size,
                    mtime: cstats.mtime ? cstats.mtime.toISOString() : null,
                  };
                  if (isDir) {
                    try {
                      e.children = fs.readdirSync(childPath).filter(n => !shouldSkip(n)).length;
                    } catch (_e) { /* swallow */ }
                  }
                  entries.push(e);
                }
                pending--;
                if (!pending) finish();
              });
            });
          });
          return;
        }

        if (!stats.isFile()) return next();
        const ext = path.extname(targetPath).slice(1).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        fs.createReadStream(targetPath).pipe(res);
      });
    });
  },
};

// Standard Astro layout:
//   src/pages/   — page routes (static HTML + a few .astro / endpoints)
//   public/      — unprocessed assets (ui/, data/) served at /ui/, /data/
//   source/      — research archive, dev-only via the serveProjectRoots
//                  middleware below; not in the production bundle.
export default defineConfig({
  site:    'https://opda.org.uk',
  outDir:  './dist',
  // ADR-0021 §"Separate task": the report generator emits static HTML for
  // embedded meta-reports before build/dev resolves the page imports.
  // @astrojs/sitemap auto-generates /sitemap-index.xml (+ /sitemap-0.xml) from
  // every built route, using `site` above for absolute URLs — replaces the
  // former hand-maintained src/pages/sitemap.xml.js (stale page list + the dead
  // opda-kb.pages.dev domain). Drop the utility 404/resource-viewer routes.
  integrations: [reportGenerator(), diagramLinksGenerator(), councilGenerator(), sitemap({
    filter: (page) => !/\/(404|resource)\/?$/.test(page),
  })],
  // No sharp installed; pass PNG/JPG through without optimisation.
  // Manual content collection renders PNG images from docs/manual/ diagrams/;
  // pre-existing site pages also triggered this. ADR-0016.
  image: { service: passthroughImageService() },
  // ADR-0018: unwrap <details>-wrapped mermaid blocks → <div class="mermaid">,
  // rewrite relative .md cross-links to /model/ routes, and extract OPDA
  // entity URIs from markdown body into frontmatter.
  markdown: {
    // Astro 7: opt back into the unified remark/rehype pipeline (default is now
    // the Rust "Sätteri" processor, which does not run these plugins). The
    // plugins are passed to `unified({...})` directly — the top-level
    // `markdown.remarkPlugins`/`rehypePlugins` keys are deprecated in Astro 7.
    processor: unified({
      remarkPlugins: [remarkUnwrapMermaidDetails, remarkRewriteManualLinks, remarkMermaidFence],
      rehypePlugins: [rehypeFrontmatterUriExtraction],
    }),
  },
  // Directory format + bare-slug URLs per docs/adr/ADR-0002 (folder hierarchy).
  // `format: 'directory'` outputs `foo/index.html` so URLs canonicalise to
  // `/foo` without a `.html` suffix; `trailingSlash: 'never'` makes Astro's
  // internal links use the bare form. Cloudflare Pages serves both `/foo`
  // and `/foo/` from the same file by default.
  build: {
    format: 'directory',
  },
  trailingSlash: 'never',
  // Astro 7 changed the default to 'jsx' (strips whitespace between inline
  // elements JSX-style). Pin to the Astro 6 behaviour to avoid output drift.
  compressHTML: true,
  // Astro 7 AI/structured logging (https://astro.build/blog/astro-7/#ai-enhancements).
  // Console stays human-readable; set OPDA_JSON_LOGS=1 to ALSO emit machine-
  // parseable JSON (for agents / log aggregators). Gated, not unconditional:
  // the JSON handler writes to the SAME stdout/stderr as the console handler, so
  // an always-on `compose()` would double every line of `make build` / CI output
  // (~1600 lines). Agents already get JSON automatically for `astro dev` (Astro
  // detects the agentic env), so this only matters for builds / human dev.
  ...(process.env.OPDA_JSON_LOGS === '1'
    ? { logger: logHandlers.compose(logHandlers.console(), logHandlers.json()) }
    : {}),
  // ADR-0042: the `/manual` section was renamed to `/model` (URL-only). Keep old
  // external `/manual/*` links alive by redirecting them to their `/model/*` route.
  // Astro requires each redirect destination to match an existing route pattern,
  // so the per-tier dynamic routes are redirected individually (there is no single
  // `/model/[...slug]` route — the section is split into per-tier `[...slug]` routes).
  redirects: {
    // ADR-0062: `/governance/smart-data-guidebook` (a single page, created when only
    // Chapter 5 had been circulated) became the `/dbt-smart-data` section once the
    // full Guidebook arrived. The old URL was e-mailed to the OPDA chair and to
    // DBT-adjacent stakeholders, so it must keep resolving.
    '/governance/smart-data-guidebook': '/dbt-smart-data',
    '/manual': '/model',
    '/manual/validation-report': '/model/validation-report',
    '/manual/information-architecture': '/model/information-architecture',
    '/manual/information-architecture/[spec]': '/model/information-architecture/[spec]',
    '/manual/concept/[...slug]': '/model/concept/[...slug]',
    '/manual/logical/[...slug]': '/model/logical/[...slug]',
    '/manual/physical-database/[...slug]': '/model/physical-database/[...slug]',
    '/manual/physical-ontology/[...slug]': '/model/physical-ontology/[...slug]',
    '/manual/physical-relational/[...slug]': '/model/physical-relational/[...slug]',
  },
  server: {
    // 4321 conflicts with other tools on this machine — use 4330 instead.
    // dev.sh probes 4330-4339 and picks the first free one if 4330 is busy too.
    port: 4330,
    host: false,
  },
  vite: {
    plugins: [serveProjectRoots, tailwindcss()],
    server: {
      // Don't auto-open browser when running `astro dev`
      open: false,
      fs: {
        // Allow Vite to read files in the workspace root.
        allow: ['..', '.'],
      },
    },
    // Astro 7 = Vite 8. `mermaid` + `@mermaid-js/layout-elk` are ESM-only and
    // are dynamically import()ed by the GraphDiagram island (src/scripts/
    // graph-diagram-mermaid.ts). Pre-bundle them so Vite's on-demand
    // re-optimisation can't race an already-loaded chunk at runtime — that race
    // surfaces as a "504 Outdated Optimize Dep" and a broken Mermaid render
    // (the same pre-bundling the hm/semantic-app config relies on under Vite 5).
    optimizeDeps: {
      include: ['mermaid', '@mermaid-js/layout-elk'],
    },
  },
});