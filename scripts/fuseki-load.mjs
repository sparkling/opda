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
 * opda-agent.ttl → https://opda.org.uk/pdtf/graph/agent
 * foundation.ttl → https://opda.org.uk/pdtf/graph/foundation
 * opda-classes.ttl → https://opda.org.uk/pdtf/graph/foundation
 *   (classes are the foundation cross-module classes; normalise to 'foundation'
 *    so entity module routes match docs/manual/{tier}/foundation/*)
 */
function graphIriFromFilename(fileName) {
  if (fileName === 'opda-classes.ttl') {
    return 'https://opda.org.uk/pdtf/graph/foundation';
  }
  const base = fileName.replace('.ttl', '').replace(/^opda-/, '');
  return `https://opda.org.uk/pdtf/graph/${base}`;
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

// ── Load-time inference (ADR-0035; ODR-0025/0026 OWL-RL-safe closure) ────────

const ENDPOINT_UPDATE = `${FUSEKI_URL}/${DATASET}/update`;
const ENTAILMENT_GRAPH = 'https://opda.org.uk/pdtf/graph/inferred/entailment';
// Jena's built-in union-of-all-named-graphs pseudo-graph: lets the rule
// WHERE-clauses read across every module graph (and the inferred graph itself,
// for the FILTER NOT EXISTS idempotency check) without reconfiguring the
// dataset to unionDefaultGraph. Faithful to hm's materialisation, dataset-config-free.
const UNION = 'urn:x-arq:UnionGraph';

const PFX =
  'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
  'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n';

// The 7 Safe-Group rules (ODR-0025 §R1 / config/opda-rdfs-plus.rules), each
// as an idempotent INSERT … FILTER NOT EXISTS, in dependency order: schema
// closure first, then propagation, then data rules.
const SAFE_RULES = [
  // 1. rdfs:subClassOf transitivity
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?x rdfs:subClassOf ?z } }
   WHERE { GRAPH <${UNION}> { ?x rdfs:subClassOf ?y . ?y rdfs:subClassOf ?z }
           FILTER(?x != ?z) FILTER NOT EXISTS { GRAPH <${UNION}> { ?x rdfs:subClassOf ?z } } }`,
  // 2. rdfs:subPropertyOf transitivity
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?p rdfs:subPropertyOf ?r } }
   WHERE { GRAPH <${UNION}> { ?p rdfs:subPropertyOf ?q . ?q rdfs:subPropertyOf ?r }
           FILTER(?p != ?r) FILTER NOT EXISTS { GRAPH <${UNION}> { ?p rdfs:subPropertyOf ?r } } }`,
  // 3. rdfs:subPropertyOf value propagation
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?x ?q ?y } }
   WHERE { GRAPH <${UNION}> { ?p rdfs:subPropertyOf ?q . ?x ?p ?y }
           FILTER(?p != ?q) FILTER NOT EXISTS { GRAPH <${UNION}> { ?x ?q ?y } } }`,
  // 4. rdfs:subClassOf type propagation
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?v rdf:type ?y } }
   WHERE { GRAPH <${UNION}> { ?v rdf:type ?x . ?x rdfs:subClassOf ?y }
           FILTER(?x != ?y) FILTER NOT EXISTS { GRAPH <${UNION}> { ?v rdf:type ?y } } }`,
  // 5a. owl:inverseOf (forward)
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?y ?q ?x } }
   WHERE { GRAPH <${UNION}> { ?p owl:inverseOf ?q . ?x ?p ?y }
           FILTER NOT EXISTS { GRAPH <${UNION}> { ?y ?q ?x } } }`,
  // 5b. owl:inverseOf (reverse)
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?y ?p ?x } }
   WHERE { GRAPH <${UNION}> { ?p owl:inverseOf ?q . ?x ?q ?y }
           FILTER NOT EXISTS { GRAPH <${UNION}> { ?y ?p ?x } } }`,
  // 6. owl:SymmetricProperty
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?y ?p ?x } }
   WHERE { GRAPH <${UNION}> { ?p a owl:SymmetricProperty . ?x ?p ?y }
           FILTER NOT EXISTS { GRAPH <${UNION}> { ?y ?p ?x } } }`,
  // 7. owl:TransitiveProperty
  `INSERT { GRAPH <${ENTAILMENT_GRAPH}> { ?x ?p ?z } }
   WHERE { GRAPH <${UNION}> { ?p a owl:TransitiveProperty . ?x ?p ?y . ?y ?p ?z }
           FILTER(?x != ?z) FILTER NOT EXISTS { GRAPH <${UNION}> { ?x ?p ?z } } }`,
];

/** Run a SPARQL UPDATE against the dataset. */
async function sparqlUpdate(update) {
  const res = await fetch(ENDPOINT_UPDATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-update',
      Authorization: BASIC_AUTH,
    },
    body: update,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SPARQL UPDATE failed: ${res.status} ${body}`);
  }
}

/** COUNT helper for the union of all named graphs (asserted + inferred). */
async function countUnion() {
  const res = await fetch(ENDPOINT_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
      Authorization: BASIC_AUTH,
    },
    body: 'SELECT (COUNT(*) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } }',
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return +(json.results?.bindings?.[0]?.n?.value ?? 0);
}

/** COUNT helper for an arbitrary ASK-style violation query (returns the count). */
async function countQuery(query) {
  const res = await fetch(ENDPOINT_QUERY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
      Authorization: BASIC_AUTH,
    },
    body: query,
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return +(json.results?.bindings?.[0]?.c?.value ?? 0);
}

/**
 * Materialise the ODR-0025 §R1 OWL-RL-safe closure into the derived
 * entailment graph (ADR-0035). Idempotent rebuild: DROP the graph, then run
 * the 7 rules to a fixpoint (re-run until a pass adds 0 triples; guard 10).
 * Runs on every load — `--clear` and incremental alike.
 */
async function materializeEntailments() {
  console.log(`[fuseki-load] Materialising OWL-RL-safe closure → <${ENTAILMENT_GRAPH}>`);
  await sparqlUpdate(`DROP SILENT GRAPH <${ENTAILMENT_GRAPH}>`);
  let pass = 0;
  for (;;) {
    pass++;
    const before = await countUnion();
    for (const rule of SAFE_RULES) {
      await sparqlUpdate(PFX + rule);
    }
    const after = await countUnion();
    const added = after - before;
    console.log(`[fuseki-load]   pass ${pass}: +${added} triples`);
    if (added === 0) break;
    if (pass >= 10) {
      console.warn('[fuseki-load]   WARNING: fixpoint not reached after 10 passes');
      break;
    }
  }
  const inferred = await countQuery(
    `SELECT (COUNT(*) AS ?c) WHERE { GRAPH <${ENTAILMENT_GRAPH}> { ?s ?p ?o } }`,
  );
  console.log(`[fuseki-load]   inferred: ${inferred} triples`);
}

/**
 * Post-load consistency gate (ADR-0035 §Rules): owl:disjointWith violations
 * fail the load. Validates the R2-disabled disjointness construct WITHOUT
 * entailing it ("disjointness as validation, not materialisation").
 */
async function consistencyGate() {
  const disjoint = await countQuery(
    'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
    'SELECT (COUNT(*) AS ?c) WHERE { GRAPH ?g1 { ?c1 owl:disjointWith ?c2 } ' +
    'GRAPH ?g2 { ?x rdf:type ?c1 } GRAPH ?g3 { ?x rdf:type ?c2 } FILTER(?c1 != ?c2) }',
  );
  if (disjoint > 0) {
    throw new Error(`Consistency gate FAILED: ${disjoint} owl:disjointWith violation(s)`);
  }
  console.log('[fuseki-load]   consistency gate: OK (0 disjointness violations)');
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

if (errors > 0) {
  console.error(`\n[fuseki-load] ${errors} upload error(s) — skipping inference`);
  process.exit(1);
}

// ADR-0035: materialise the OWL-RL-safe closure, then run the consistency gate.
await materializeEntailments();
await consistencyGate();

const total = await countTriples();
console.log(`\n[fuseki-load] Done: ${loaded} files loaded, ${errors} errors`);
if (total != null) console.log(`[fuseki-load] Total triples in dataset (asserted + inferred): ${total}`);
