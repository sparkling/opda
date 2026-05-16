// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

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
  site:    'https://opda-kb.pages.dev',
  outDir:  './dist',
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
    plugins: [serveProjectRoots],
    server: {
      // Don't auto-open browser when running `astro dev`
      open: false,
      fs: {
        // Allow Vite to read files in the workspace root.
        allow: ['..', '.'],
      },
    },
  },
});
