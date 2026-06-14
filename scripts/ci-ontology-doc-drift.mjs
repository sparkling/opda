#!/usr/bin/env node
/**
 * Doc-drift CI gate (ADR-0041 §Confirmation / B1).
 *
 * The custom `opda-gen` documentation output is the one PRE-generated, committed
 * artefact in the /ontology composition (the live-count Astro pages regenerate at
 * every `astro build`, so they cannot drift; the third-party tool renderings are
 * version-pinned). This gate enforces byte-identity over the custom layer: it
 * regenerates the custom output from the committed TTL corpus and fails if the
 * committed file differs — i.e. if someone changed the ontology without
 * regenerating the reference.
 *
 * Pass: regenerated output == committed. Fail: drift (exit 1).
 * Run: node scripts/ci-ontology-doc-drift.mjs
 */
import { execSync } from 'node:child_process';

const TRACKED = 'public/ontology/tools/custom/index.html';

function sh(cmd) { return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }

try {
  // 1. Regenerate (deterministic — no wall-clock).
  execSync('node scripts/gen-ontology-custom.mjs', { stdio: 'inherit' });
  // 2. Byte-compare the committed custom output against the regenerated one.
  sh(`git diff --exit-code -- ${TRACKED}`);
  console.log(`\n[doc-drift] PASS — ${TRACKED} is byte-identical to the regenerated corpus output.`);
  process.exit(0);
} catch (err) {
  if (err.stdout || err.status) {
    console.error(`\n[doc-drift] FAIL — ${TRACKED} has drifted from the committed corpus.`);
    console.error('Fix: node scripts/gen-ontology-custom.mjs  &&  git add ' + TRACKED + '  &&  commit.');
    if (err.stdout) console.error('\n--- drift ---\n' + err.stdout.toString().slice(0, 4000));
  } else {
    console.error(`\n[doc-drift] FAIL — generator error:\n${err.message}`);
  }
  process.exit(1);
}
