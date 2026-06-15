#!/usr/bin/env node
/**
 * Ontology-model doc-drift gate (ADR-0044 Phase 7 / ODR-0004 §6a).
 *
 * `src/data/ontology-model.json` is SPARQL-extracted from the live triplestore
 * (operator decision b) and committed so the per-entity /pdtf pages, the typed
 * indexes, the .ttl alternates, and the ADR-0043 graph all read one deterministic
 * artefact. This gate guards it against drift: it regenerates the model from a
 * running Fuseki into a temp file and byte-compares it to the committed copy.
 *
 * Pass: identical. Fail (exit 1): drift — the corpus changed without the model
 * being regenerated + committed.
 *
 * Requires a running Fuseki (FUSEKI_ENDPOINT, default :3031) — run after
 * `make serve-data`. In CI the deploy workflow enforces the same invariant with a
 * `git diff` after `npm run build:data` (which regenerates the model in place).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const COMMITTED = 'src/data/ontology-model.json';
const REGEN = join(tmpdir(), 'opda-ontology-model.regen.json');

try {
  execSync(`node scripts/ontology-model.mjs --out "${REGEN}"`, { stdio: 'inherit' });
  const committed = readFileSync(COMMITTED, 'utf8');
  const regen = readFileSync(REGEN, 'utf8');
  if (committed !== regen) {
    console.error(`\n[model-drift] FAIL — ${COMMITTED} has drifted from a fresh regeneration.`);
    console.error('Fix: (with the stack up) `make ontology-model` && `git add ' + COMMITTED + '` && commit.');
    process.exit(1);
  }
  console.log(`\n[model-drift] PASS — ${COMMITTED} is byte-identical to a fresh Fuseki regeneration.`);
  process.exit(0);
} catch (err) {
  console.error(`\n[model-drift] FAIL — ${err.message || err}`);
  process.exit(1);
}
