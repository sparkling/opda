#!/usr/bin/env node
// Run a SINGLE Astro dev server for this project on the canonical port 4330.
// If 4330 is already serving (an existing dev server), reuse it rather than
// starting a second — two servers share one Vite cache and corrupt it.
// Works on any platform that has Node (no bash / lsof / ss dependency).
//
// Run via `npm run dev`, `npm start`, or `make dev`.

import net from 'node:net';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT_RANGE = [4330, 4331, 4332, 4333, 4334, 4335, 4336, 4337, 4338, 4339];

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

// True if something already answers HTTP on this port (≈ a dev server we
// should reuse rather than duplicate). 1.5s cap so startup never hangs.
function httpPing(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/', timeout: 1500 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

(async function main() {
  const CANONICAL = PORT_RANGE[0];

  // Guard against the #1 cause of broken dev pages: a SECOND `astro dev`
  // server on this same project. Both share one Vite optimize cache
  // (node_modules/.vite/deps); each re-optimization invalidates the other's
  // dependency hashes, so the browser 504s on "Outdated Optimize Dep" and
  // static data scripts (e.g. /data/properties.js) fail to load mid-reload.
  // If the canonical port is already serving HTTP it's almost certainly an
  // existing opda dev server — reuse it instead of starting a competitor.
  if (!(await isPortFree(CANONICAL)) && (await httpPing(CANONICAL))) {
    console.log(`✓ A dev server is already running at http://localhost:${CANONICAL}`);
    console.log('  Reusing it — NOT starting a second server.');
    console.log('  (Two astro dev servers on one project corrupt the shared Vite');
    console.log('   cache → intermittent "504 Outdated Optimize Dep" + broken data pages.)');
    console.log('  Need a fresh one? Stop that server first, then re-run — or pick a');
    console.log('  separate port explicitly:  npx astro dev --port 4332');
    process.exit(0);
  }

  // Canonical port is free, or held by a NON-web process (an unrelated tool).
  // Fall back to the first genuinely free port in the range.
  let port = null;
  const occupied = [];
  for (const p of PORT_RANGE) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(p)) { port = p; break; }
    occupied.push(p);
  }
  if (!port) {
    console.error(`✗ All ports ${PORT_RANGE[0]}–${PORT_RANGE.at(-1)} are occupied.`);
    console.error('  Free one or run:  npx astro dev --port <port>');
    process.exit(1);
  }

  if (occupied.length) {
    console.log(`Skipped occupied: ${occupied.join(', ')}`);
  }
  console.log(`▸ Using port ${port}`);
  console.log(`▸ Open http://localhost:${port}/ once Astro reports ready`);
  console.log('');

  // Forward all CLI args (e.g. --host, --open)
  const extraArgs = process.argv.slice(2);
  const child = spawn(
    'npx',
    ['astro', 'dev', '--port', String(port), ...extraArgs],
    { cwd: ROOT, stdio: 'inherit' }
  );

  child.on('exit', (code) => process.exit(code ?? 0));

  // Forward Ctrl-C cleanly
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      if (!child.killed) child.kill(sig);
    });
  }
})();
