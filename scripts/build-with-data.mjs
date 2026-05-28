#!/usr/bin/env node
/**
 * ADR-0021: build orchestration — start Fuseki, load TTLs, start GRLC API,
 * run `astro build` (queries the API at build time), tear down services.
 *
 * Usage:
 *   node scripts/build-with-data.mjs
 *   # or via npm script:
 *   npm run build:data
 *
 * Prerequisites:
 *   - Docker + `docker compose` (V2) in PATH
 *   - W-API deliverables in place:
 *       docker-compose.yml  (W-API owns this)
 *       scripts/fuseki-load (W-API owns this)
 *       src/api/server.js   (W-API owns this)
 *
 * Environment:
 *   OPDA_API   — base URL for the GRLC API (default http://localhost:3000)
 *   FUSEKI_PORT — Fuseki SPARQL port (default 3030)
 *   API_PORT    — GRLC API port (default 3000)
 *
 * CI: the GitHub Actions deploy job (.github/workflows/deploy.yml) runs this
 * whole orchestration via `npm run build:data` on ubuntu-latest (Docker is
 * available there). Fuseki + the GRLC API are therefore build-exclusive and
 * ephemeral — bound to localhost on the runner, torn down at job end, never
 * deployed; only dist/ ships to Cloudflare Pages (ADR-0021 §CI integration).
 * The defaults below (API :3002, Fuseki :3031) match docker-compose.yml.
 */

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API_PORT = process.env.API_PORT || '3002';
const OPDA_API = process.env.OPDA_API || `http://localhost:${API_PORT}`;
const FUSEKI_PORT = process.env.FUSEKI_PORT || '3031';

// How long (ms) to wait for each service to be ready.
const READY_TIMEOUT = 60_000;
const POLL_INTERVAL = 2_000;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function waitForUrl(url, label) {
  const deadline = Date.now() + READY_TIMEOUT;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) {
        console.log(`  [ready] ${label}`);
        return;
      }
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

let apiProcess = null;

async function main() {
  console.log('build:data — Phase 2 full pipeline (ADR-0021)\n');

  // 1. Bring Fuseki up (W-API docker-compose.yml owns this service).
  console.log('1. docker compose up fuseki -d');
  await run('docker', ['compose', 'up', 'fuseki', '-d']);
  await waitForUrl(
    `http://localhost:${FUSEKI_PORT}/$/ping`,
    `Fuseki :${FUSEKI_PORT}`,
  );

  // 2. Load TTLs (W-API script; path may vary).
  console.log('2. Load TTLs into Fuseki');
  // --clear ensures no stale named graphs from a previous run.
  const fusekiLoad = path.join(ROOT, 'scripts', 'fuseki-load.mjs');
  await run('node', [fusekiLoad, '--clear']);

  // 3. Start GRLC API server (W-API src/api/server.js).
  console.log('3. Start GRLC API');
  // INTEGRATION POINT (Phase 2): W-API delivers src/api/server.js.
  const apiServer = path.join(ROOT, 'src', 'api', 'server.js');
  apiProcess = spawn('node', [apiServer], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, PORT: API_PORT },
  });
  await waitForUrl(`${OPDA_API}/api/entities`, 'GRLC API /api/entities');

  // 4. Run astro build with the API live.
  console.log('4. astro build (OPDA_API=' + OPDA_API + ')');
  await run('pnpm', ['run', 'build'], {
    env: { ...process.env, OPDA_API },
  });

  console.log('\nbuild:data complete — dist/ is ready for deployment.');
}

main()
  .catch((err) => {
    console.error('\nbuild:data FAILED:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    // 5. Tear down services.
    if (apiProcess && !apiProcess.killed) {
      console.log('Stopping GRLC API');
      apiProcess.kill();
    }
    try {
      execSync('docker compose down fuseki', { cwd: ROOT, stdio: 'inherit' });
    } catch {
      // best-effort
    }
  });
