#!/usr/bin/env node
/**
 * Load all opda ontology TTLs into Fuseki dataset 'opda'.
 * Usage: node scripts/fuseki-load.mjs [--fuseki-url http://localhost:3030] [--clear]
 *
 * ADR-0021: build-time triplestore population.
 * Mirrors hm/semantic-modelling Makefile fuseki-load target.
 */

import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ONTOLOGY_DIR = resolve(__dirname, '..', 'source', '03-standards', 'ontology');

const args = process.argv.slice(2);
const FUSEKI_URL = (() => {
  const idx = args.indexOf('--fuseki-url');
  return idx >= 0 ? args[idx + 1] : (process.env.FUSEKI_URL || 'http://localhost:3031');
})();
const DATASET = 'opda';
const ENDPOINT_DATA = `${FUSEKI_URL}/${DATASET}/data`;
const ENDPOINT_QUERY = `${FUSEKI_URL}/${DATASET}/sparql`;
const ADMIN_PASSWORD = process.env.FUSEKI_ADMIN_PASSWORD || 'admin';
const SHOULD_CLEAR = args.includes('--clear');

const BASIC_AUTH = 'Basic ' + Buffer.from(`admin:${ADMIN_PASSWORD}`).toString('base64');

/** Wait until Fuseki's /$/server responds OK. */
async function waitForFuseki(maxRetries = 30, delayMs = 2000) {
  const serverUrl = `${FUSEKI_URL}/$/server`;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(serverUrl, {
        headers: { Authorization: BASIC_AUTH, Accept: 'application/json' },
      });
      if (res.ok) { console.log(`[fuseki-load] Fuseki is up (attempt ${i})`); return; }
    } catch { /* not ready yet */ }
    console.log(`[fuseki-load] Waiting for Fuseki… attempt ${i}/${maxRetries}`);
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(`Fuseki not reachable at ${FUSEKI_URL} after ${maxRetries} attempts`);
}

/** Ensure the dataset exists; create it if not. */
async function ensureDataset() {
  const listUrl = `${FUSEKI_URL}/$/datasets`;
  const listRes = await fetch(listUrl, { headers: { Authorization: BASIC_AUTH } });
  if (!listRes.ok) throw new Error(`Cannot list datasets: ${listRes.status}`);
  const json = await listRes.json();
  const datasets = (json.datasets || []).map(d => d['ds.name'].replace(/^\//, ''));
  if (datasets.includes(DATASET)) {
    console.log(`[fuseki-load] Dataset '${DATASET}' already exists`);
    return;
  }
  console.log(`[fuseki-load] Creating dataset '${DATASET}'`);
  const createRes = await fetch(`${FUSEKI_URL}/$/datasets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: BASIC_AUTH,
    },
    body: new URLSearchParams({ dbName: DATASET, dbType: 'tdb2' }),
  });
  if (createRes.status === 409) {
    // The docker-compose FUSEKI_DATASET_1 env auto-registers the dataset on
    // startup; the listing above can race that registration on a fresh
    // container (CI), so a 409 here means "already exists" — proceed.
    console.log(`[fuseki-load] Dataset '${DATASET}' already registered (409) — proceeding`);
    return;
  }
  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Dataset creation failed: ${createRes.status} ${body}`);
  }
  console.log(`[fuseki-load] Dataset '${DATASET}' created`);
}

/** Clear all triples from the dataset. */
async function clearDataset() {
  console.log(`[fuseki-load] Clearing dataset '${DATASET}'`);
  const res = await fetch(`${FUSEKI_URL}/${DATASET}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-update',
      Authorization: BASIC_AUTH,
    },
    body: 'CLEAR ALL',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CLEAR ALL failed: ${res.status} ${body}`);
  }
  console.log(`[fuseki-load] Dataset cleared`);
}

/**
 * Derive a named-graph IRI from a TTL filename.
 * opda-agent.ttl → https://w3id.org/opda/graph/agent
 * foundation.ttl → https://w3id.org/opda/graph/foundation
 * opda-classes.ttl → https://w3id.org/opda/graph/foundation
 *   (classes are the foundation cross-module classes; normalise to 'foundation'
 *    so entity module routes match docs/manual/{tier}/foundation/*)
 */
function graphIriFromFilename(fileName) {
  if (fileName === 'opda-classes.ttl') {
    return 'https://w3id.org/opda/graph/foundation';
  }
  const base = fileName.replace('.ttl', '').replace(/^opda-/, '');
  return `https://w3id.org/opda/graph/${base}`;
}

/** Upload a single TTL file via GSP POST to a named graph (module identity). */
async function uploadTtl(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const fileName = filePath.split('/').pop();
  const graphIri = graphIriFromFilename(fileName);
  const url = `${ENDPOINT_DATA}?graph=${encodeURIComponent(graphIri)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/turtle',
      Authorization: BASIC_AUTH,
    },
    body: content,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed for ${fileName}: ${res.status} ${body}`);
  }
  return fileName;
}

/** Count total triples in the dataset. */
async function countTriples() {
  const res = await fetch(ENDPOINT_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/sparql-results+json',
      Authorization: BASIC_AUTH,
    },
    // TTLs load into named graphs, so count across all graphs (the default
    // graph is empty) — otherwise this reports 0 despite a successful load.
    body: 'SELECT (COUNT(*) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } }',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return +(json.results?.bindings?.[0]?.n?.value ?? 0);
}

// ── Main ───────────────────────────────────────────────────────────────────

await waitForFuseki();
await ensureDataset();
if (SHOULD_CLEAR) await clearDataset();

const entries = await readdir(ONTOLOGY_DIR);
const ttlFiles = entries.filter(f => f.endsWith('.ttl')).sort();

console.log(`[fuseki-load] Loading ${ttlFiles.length} TTL files from ${ONTOLOGY_DIR}`);

let loaded = 0;
let errors = 0;
for (const file of ttlFiles) {
  const filePath = join(ONTOLOGY_DIR, file);
  try {
    await uploadTtl(filePath);
    console.log(`[fuseki-load]   OK  ${file}`);
    loaded++;
  } catch (err) {
    console.error(`[fuseki-load]  ERR  ${file}: ${err.message}`);
    errors++;
  }
}

const total = await countTriples();
console.log(`\n[fuseki-load] Done: ${loaded} files loaded, ${errors} errors`);
if (total != null) console.log(`[fuseki-load] Total triples in dataset: ${total}`);

if (errors > 0) process.exit(1);
