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
 * Fuseki runtime (ADR-0036/0037 — full hm parity, NO Docker): the build runs a
 * local Apache Jena Fuseki 6.1.0 binary launched against config/fuseki-config.ttl.
 * The dist is self-provisioned (downloaded + sha512-verified into .fuseki/) when
 * absent, so dev and CI both need only Java 17+ and network access — no Docker.
 * Honour an external install via FUSEKI_HOME (must contain fuseki-server.jar).
 *
 * Environment:
 *   OPDA_API    — base URL for the GRLC API (default http://localhost:3002)
 *   FUSEKI_PORT — Fuseki SPARQL port (default 3031)
 *   API_PORT    — GRLC API port (default 3002)
 *   FUSEKI_HOME — optional path to a pre-installed Fuseki (skips the download)
 *
 * CI: the GitHub Actions deploy job (.github/workflows/deploy.yml) runs this via
 * `npm run build:data` on ubuntu-latest with a JDK provisioned by setup-java.
 * Fuseki + the GRLC API are build-exclusive and ephemeral — bound to localhost,
 * torn down at job end, never deployed; only dist/ ships to Cloudflare Pages.
 */

import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API_PORT = process.env.API_PORT || '3002';
const OPDA_API = process.env.OPDA_API || `http://localhost:${API_PORT}`;
const FUSEKI_PORT = process.env.FUSEKI_PORT || '3031';

// --serve: bring Fuseki + the GRLC API up and keep them running (skip the astro
// build + teardown) so the ontology API / SPARQL endpoint can be used locally —
// e.g. run `npm run dev` against it. Ctrl-C stops both services.
const SERVE = process.argv.includes('--serve');

// Apache Jena Fuseki 6.1.0, built from the official Apache binary distribution.
const FUSEKI_VERSION = '6.1.0';
const FUSEKI_TARBALL = `apache-jena-fuseki-${FUSEKI_VERSION}.tar.gz`;
const FUSEKI_DOWNLOAD = `https://archive.apache.org/dist/jena/binaries/${FUSEKI_TARBALL}`;
const FUSEKI_SHA512 =
  '75457f45d14397876a41ed51abe7ae5d2f1e708dfe1315765f858158bc5c6813bc036ec1539ddc4dffd26201f5cc31fadec299ca5c3dc2548b723513ed31d326';
const CACHE_DIR = path.join(ROOT, '.fuseki');

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

/**
 * Resolve a Fuseki 6.1.0 `fuseki-server.jar`, downloading + verifying the
 * Apache dist into .fuseki/ if neither FUSEKI_HOME nor a prior cache exists.
 */
async function ensureFuseki() {
  if (process.env.FUSEKI_HOME) {
    const jar = path.join(process.env.FUSEKI_HOME, 'fuseki-server.jar');
    if (existsSync(jar)) return jar;
    throw new Error(`FUSEKI_HOME set but ${jar} not found`);
  }
  const home = path.join(CACHE_DIR, `apache-jena-fuseki-${FUSEKI_VERSION}`);
  const jar = path.join(home, 'fuseki-server.jar');
  if (existsSync(jar)) return jar;

  mkdirSync(CACHE_DIR, { recursive: true });
  const tarball = path.join(CACHE_DIR, FUSEKI_TARBALL);
  console.log(`  [provision] downloading Apache Jena Fuseki ${FUSEKI_VERSION}`);
  const res = await fetch(FUSEKI_DOWNLOAD);
  if (!res.ok) throw new Error(`Fuseki download failed: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tarball));

  const digest = crypto.createHash('sha512').update(await readFile(tarball)).digest('hex');
  if (digest !== FUSEKI_SHA512) {
    throw new Error(`Fuseki ${FUSEKI_TARBALL} sha512 mismatch — refusing to use`);
  }
  execSync(`tar xzf "${FUSEKI_TARBALL}" -C .`, { cwd: CACHE_DIR, stdio: 'inherit' });
  if (!existsSync(jar)) throw new Error(`fuseki-server.jar missing after extract: ${jar}`);
  return jar;
}

let apiProcess = null;
let fusekiProcess = null;

function stopServices() {
  if (apiProcess && !apiProcess.killed) { console.log('Stopping GRLC API'); apiProcess.kill(); }
  if (fusekiProcess && !fusekiProcess.killed) { console.log('Stopping Fuseki'); fusekiProcess.kill(); }
}

// In --serve mode main() never resolves, so teardown happens here on Ctrl-C.
process.on('SIGINT', () => { stopServices(); process.exit(0); });
process.on('SIGTERM', () => { stopServices(); process.exit(0); });

async function main() {
  console.log('build:data — Phase 2 full pipeline (ADR-0021)\n');

  // 1. Launch local Fuseki 6.1.0 against the assembler config (no Docker).
  console.log('1. Start Apache Jena Fuseki 6.1.0');
  const fusekiJar = await ensureFuseki();
  const fusekiBase = path.join(ROOT, 'run', 'fuseki');
  mkdirSync(fusekiBase, { recursive: true });
  mkdirSync(path.join(ROOT, 'run', 'databases'), { recursive: true });
  fusekiProcess = spawn(
    'java',
    [
      process.env.FUSEKI_JVM_ARGS || '-Xmx2g',
      '-jar', fusekiJar,
      '--config', path.join(ROOT, 'config', 'fuseki-config.ttl'),
      '--port', FUSEKI_PORT,
    ],
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env, FUSEKI_BASE: fusekiBase } },
  );
  await waitForUrl(`http://localhost:${FUSEKI_PORT}/$/ping`, `Fuseki :${FUSEKI_PORT}`);

  // 2. Load TTLs into the declared `opda` dataset (--clear drops stale graphs).
  console.log('2. Load TTLs into Fuseki');
  const fusekiLoad = path.join(ROOT, 'scripts', 'fuseki-load.mjs');
  await run('node', [fusekiLoad, '--clear'], {
    env: { ...process.env, FUSEKI_URL: `http://localhost:${FUSEKI_PORT}` },
  });

  // 3. Start GRLC API server (src/api/server.js).
  console.log('3. Start GRLC API');
  const apiServer = path.join(ROOT, 'src', 'api', 'server.js');
  apiProcess = spawn('node', [apiServer], {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: API_PORT,
      // lib/sparql-client.js reads FUSEKI_ENDPOINT — point it at our local
      // Fuseki's /opda/sparql (not the stale 3030 default; hm's Fuseki uses 3030).
      FUSEKI_ENDPOINT: `http://localhost:${FUSEKI_PORT}/opda/sparql`,
    },
  });
  await waitForUrl(`${OPDA_API}/api/entities`, 'GRLC API /api/entities');

  if (SERVE) {
    console.log(
      `\nServices up — leave this running:\n` +
      `  Fuseki SPARQL : http://localhost:${FUSEKI_PORT}/opda/sparql\n` +
      `  GRLC API      : ${OPDA_API}/api/entities\n\n` +
      `Run \`npm run dev\` (or set OPDA_API=${OPDA_API}) in another shell to develop\n` +
      `pages against the live API. Ctrl-C to stop.\n`,
    );
    await new Promise(() => {}); // keep services alive until SIGINT/SIGTERM
    return;
  }

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
    // 5. Tear down services (build mode). --serve mode tears down via SIGINT/SIGTERM.
    if (!SERVE) stopServices();
  });
