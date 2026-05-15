#!/usr/bin/env node
// Run Astro dev on the first free port in 4330–4339.
// Works on any platform that has Node (no bash / lsof / ss dependency).
//
// Run via `npm run dev`, `npm start`, or `make dev`.

import net from 'node:net';
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

(async function main() {
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
