#!/usr/bin/env node
// Run a SINGLE Astro dev server for this project on the canonical port 4330.
// Two servers on one project share one Vite cache and corrupt it, so we never
// start a second when one is already running.
//
// Astro 7 added a native, per-project dev-server lockfile (.astro/dev.json) plus
// `astro dev status|stop|logs` and background mode. This wrapper now leans on
// that lockfile for the "already running?" check (authoritative across the whole
// 4330-4339 range, not just one probed port) and is background-mode aware: when
// Astro detects it's running inside an AI agent it starts the server in the
// background (logging to .astro/dev.log) and the foreground process exits — we
// surface that instead of looking like the server died.
//
// Works on any platform that has Node (no bash / lsof / ss dependency).
// Run via `npm run dev`, `npm start`, or `make dev`.

import net from 'node:net';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LOCKFILE = path.join(ROOT, '.astro', 'dev.json');
const PORT_RANGE = [4330, 4331, 4332, 4333, 4334, 4335, 4336, 4337, 4338, 4339];

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

// Astro 7's native dev-server lockfile, keyed to this project root. Returns the
// running server's record ({ pid, port, url, background, ... }) or null if there
// is none / the lockfile is stale (the recorded PID is no longer alive).
function runningServer() {
  try {
    const data = JSON.parse(readFileSync(LOCKFILE, 'utf8'));
    if (typeof data?.pid !== 'number') return null;
    try {
      process.kill(data.pid, 0); // throws if the process is gone
      return data;
    } catch {
      return null; // stale lockfile — Astro will clean it up on next start
    }
  } catch {
    return null; // no lockfile
  }
}

(async function main() {
  // ── Guard against the #1 cause of broken dev pages: a SECOND `astro dev`
  //    server on this same project. Both share one Vite optimize cache
  //    (node_modules/.vite/deps); each re-optimization invalidates the other's
  //    dependency hashes, so the browser 504s on "Outdated Optimize Dep" and
  //    static data scripts (e.g. /data/properties.js) fail to load mid-reload.
  //    Astro's lockfile detects a running server on ANY port in the range
  //    (and a backgrounded one in another shell), so reuse it.
  const existing = runningServer();
  if (existing) {
    console.log(`✓ A dev server is already running at ${existing.url}`);
    console.log('  Reusing it — NOT starting a second server.');
    console.log('  (Two astro dev servers on one project corrupt the shared Vite');
    console.log('   cache → intermittent "504 Outdated Optimize Dep" + broken data pages.)');
    console.log('  Manage it:  astro dev status  |  astro dev stop  |  astro dev logs');
    console.log('  Need a fresh one? `astro dev stop` first, then re-run.');
    process.exit(0);
  }

  // ── Pick the first genuinely free port in the canonical range.
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
  console.log(`▸ Starting Astro dev on port ${port} …`);
  console.log(`▸ Open http://localhost:${port}/ once Astro reports ready`);
  console.log('');

  // Forward all CLI args (e.g. --host, --open). When run by an AI agent, Astro 7
  // auto-detects the agentic env and runs the server in the background; otherwise
  // it runs in the foreground exactly as before.
  const extraArgs = process.argv.slice(2);
  const child = spawn(
    'npx',
    ['astro', 'dev', '--port', String(port), ...extraArgs],
    { cwd: ROOT, stdio: 'inherit' }
  );

  child.on('exit', (code) => {
    // Foreground exit with code 0 + a live background lockfile ⇒ Astro detached
    // the server (agent mode). Confirm it so the run doesn't look like a failure.
    if ((code ?? 0) === 0) {
      const bg = runningServer();
      if (bg?.background) {
        console.log(`\n✓ Dev server running in the background at ${bg.url}`);
        console.log('  Manage it:  astro dev status  |  astro dev stop  |  astro dev logs');
      }
    }
    process.exit(code ?? 0);
  });

  // Forward Ctrl-C cleanly (foreground / human runs).
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      if (!child.killed) child.kill(sig);
    });
  }
})();
