#!/usr/bin/env node
/**
 * OPDA Accreditation Directory — build-time aggregator (STUB).
 *
 * Per ADR 0004 §5 and ADR 0005 item C1, this script will:
 *   1. Discover all current-quarter member-firm Verifiable Credentials under
 *      `source/04-governance-bodies/accreditation/credentials/{firm-did}/{YYYY-Qn}.json`.
 *   2. Validate each VC signature against the OPDA Trust Registry (verifying
 *      issuer DID, signature, and not-revoked status).
 *   3. Parse per-capability Engagement / Process / Evidence scores (1-6 per
 *      DCAM dimension) plus AL coverage and evidence-tier artefact refs.
 *   4. Aggregate per firm: capability scores, section averages (~8 sections),
 *      stale flag (data > 9 months old), spot-check audit-trail entries.
 *   5. Emit `src/data/accreditation/current.json` for the Astro Directory page
 *      at `/governance/accreditation-directory` to consume at build time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BLOCKED — DO NOT RUN.
 *
 *   - No member-firm VCs exist yet. The credentials directory
 *     `source/04-governance-bodies/accreditation/credentials/` has not been
 *     created.
 *   - The Trust Registry signature-verification helper has not been built.
 *   - The capability bundles (DQ, Security) that define which `key`s are valid
 *     have not shipped (ADR 0005 items A1, A2).
 *
 * This stub documents the intended pipeline so it can be picked up when those
 * upstream triggers fire. Calling `main()` will throw; every function below
 * throws `Not implemented` deliberately.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Downstream (ADR 0005):
 *   - C2 — member-firm VC submission tooling (CLI helper or web form).
 *   - C3 — first quarterly publish (depends on A1–A4 + C1 + C2).
 *
 * Usage (future):
 *   node scripts/build-accreditation-directory.mjs --quarter Q2-2026
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CREDENTIALS_DIR = path.join(
  ROOT,
  'source',
  '04-governance-bodies',
  'accreditation',
  'credentials',
);
const OUTPUT_PATH = path.join(
  ROOT,
  'src',
  'data',
  'accreditation',
  'current.json',
);

/**
 * Discover all VC files for a given quarter tag (e.g. "Q2-2026").
 * Walks {CREDENTIALS_DIR}/{firm-did}/{YYYY-Qn}.json and returns absolute paths.
 *
 * @param {string} quarterTag - Quarter identifier, e.g. "Q2-2026".
 * @returns {Promise<string[]>} Absolute paths to VC files for the quarter.
 */
// eslint-disable-next-line no-unused-vars
async function discoverCredentials(quarterTag) {
  // TODO: glob {CREDENTIALS_DIR}/*/{quarterTag}.json once the directory exists.
  // TODO: log a warning if a firm-DID directory exists without a current-quarter file (stale candidate).
  throw new Error('Not implemented — see TODO');
}

/**
 * Verify a VC's signature against the OPDA Trust Registry.
 * Checks issuer DID is listed, signature is valid, and credential is not revoked.
 *
 * @param {string} vcPath - Absolute path to a VC JSON file.
 * @returns {Promise<{ valid: boolean, vc: object, reason?: string }>}
 */
// eslint-disable-next-line no-unused-vars
async function verifyCredentialSignature(vcPath) {
  // TODO: load the VC JSON.
  // TODO: call the Trust Registry verification helper (not yet built — depends
  //       on `source/03-standards/trust-framework/docs/governance.md` machinery).
  // TODO: return { valid: false, reason } for unknown issuer / bad signature / revoked.
  throw new Error('Not implemented — see TODO');
}

/**
 * Extract per-capability Engagement / Process / Evidence scores from a verified VC.
 * Returns the capability rows ready to be folded into a per-firm aggregate.
 *
 * @param {object} vc - A verified Verifiable Credential object (see ADR 0004 §5 shape).
 * @returns {Array<{ key: string, engagement: number, process: number, evidence: number, evidenceRefs: string[] }>}
 */
// eslint-disable-next-line no-unused-vars
function parseCapabilityScores(vc) {
  // TODO: read vc.credentialSubject.capabilities[].
  // TODO: validate each capability `key` against the published capability bundles
  //       (DQ + Security + Governance + Architecture + …). Unknown keys → warn + skip.
  // TODO: clamp scores to 1-6; flag out-of-range as a data-quality issue.
  throw new Error('Not implemented — see TODO');
}

/**
 * Aggregate verified VCs into per-firm rows for the Directory render.
 * Computes section averages (unweighted mean, one decimal) and stale flags.
 *
 * @param {Array<{ vc: object, capabilities: object[] }>} verifiedVcs
 * @returns {{ quarter: string, generatedAt: string, firms: object[] }}
 */
// eslint-disable-next-line no-unused-vars
function aggregatePerFirm(verifiedVcs) {
  // TODO: group by firm DID.
  // TODO: compute per-section unweighted mean (~8 sections per ADR 0004 §2).
  // TODO: mark stale = true when issuanceDate is > 9 months old (ADR 0004 §4).
  // TODO: deliberately do NOT compute an "overall firm maturity score" (ADR 0004 §2).
  throw new Error('Not implemented — see TODO');
}

/**
 * Write the aggregated Directory JSON to disk.
 * Creates the output directory if missing; writes atomically.
 *
 * @param {object} aggregate - Output of aggregatePerFirm().
 * @param {string} outPath - Absolute path to write (defaults to OUTPUT_PATH).
 */
// eslint-disable-next-line no-unused-vars
function writeDirectoryJson(aggregate, outPath = OUTPUT_PATH) {
  // TODO: fs.mkdirSync(path.dirname(outPath), { recursive: true }).
  // TODO: write to {outPath}.tmp then rename for atomic publish.
  // TODO: also write a `previous.json` snapshot so we can serve a fallback on Trust Registry downtime (ADR 0004 risk note).
  throw new Error('Not implemented — see TODO');
}

/**
 * Orchestrator: parse argv, run the pipeline, write the output.
 *
 * Usage: node scripts/build-accreditation-directory.mjs --quarter Q2-2026
 */
async function main() {
  const args = process.argv.slice(2);
  const quarterIdx = args.indexOf('--quarter');
  const quarterTag = quarterIdx >= 0 ? args[quarterIdx + 1] : null;

  if (!quarterTag) {
    console.error('Usage: node scripts/build-accreditation-directory.mjs --quarter Q2-2026');
    process.exit(1);
  }

  // The pipeline below is the intended shape; every call throws today.
  const vcPaths = await discoverCredentials(quarterTag);
  const verified = [];
  for (const vcPath of vcPaths) {
    const result = await verifyCredentialSignature(vcPath);
    if (!result.valid) {
      console.warn(`  skipped (invalid): ${vcPath} — ${result.reason}`);
      continue;
    }
    const capabilities = parseCapabilityScores(result.vc);
    verified.push({ vc: result.vc, capabilities });
  }
  const aggregate = aggregatePerFirm(verified);
  writeDirectoryJson(aggregate, OUTPUT_PATH);

  console.log(`▸ Directory built for ${quarterTag}: ${aggregate.firms.length} firms → ${path.relative(ROOT, OUTPUT_PATH)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

export {
  discoverCredentials,
  verifyCredentialSignature,
  parseCapabilityScores,
  aggregatePerFirm,
  writeDirectoryJson,
  main,
};
