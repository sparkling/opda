import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loadPdtf1SourceRouteManifest } from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  pdtf1SourceEvidenceMatches,
  semanticBlocksDigest,
} from '../scripts/lib/ia-preservation-primitives.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const checker = fileURLToPath(new URL('../scripts/check-ia-preservation.mjs', import.meta.url));
const routes = JSON.parse(readFileSync(
  new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8',
));
const families = JSON.parse(readFileSync(
  new URL('../src/data/ia-preservation-baseline.json', import.meta.url), 'utf8',
));
const sourceManifest = loadPdtf1SourceRouteManifest(projectRoot).manifest;
const sourceByRoute = new Map(
  [...sourceManifest.routes, ...sourceManifest.addedRoutes]
    .map((record) => [record.acceptedRoute, record]),
);
const acceptedByRoute = new Map(
  [...routes.routes, ...routes.addedRoutes]
    .map((record) => [record.acceptedRoute, record]),
);

function movedReceipt() {
  const accepted = [...acceptedByRoute.values()]
    .find(({ pdtf1SourceRetentionReceipt: receipt }) => (
      receipt?.semanticReframeBlocks?.length >= 3
    ));
  return {
    source: sourceByRoute.get(accepted.pdtf1SourceRetentionReceipt.sourceRoute),
    accepted,
  };
}

test('PDTF source and tool reframes are a closed, hash-bound set', () => {
  const tools = families.families.find(({ id }) => id === 'ontology-tools');
  assert.deepEqual({
    policy: tools.policy,
    receiptPolicy: tools.reframeReceipt.policy,
    exact: tools.reframeReceipt.byteIdenticalFileCount,
    reframed: tools.reframeReceipt.reframedFileCount,
    files: tools.reframeReceipt.reframedFiles.map(({ path: file }) => file),
  }, {
    policy: 'reframe-equivalent',
    receiptPolicy: 'closed-file-reframe-v1',
    exact: 833,
    reframed: 4,
    files: ['COMPARISON.md', 'custom/index.html', 'custom/README.md', 'skosmos/README.md'],
  });
  const sourceReceipts = [...routes.routes, ...routes.addedRoutes]
    .filter(({ pdtf1SourceRetentionReceipt }) => pdtf1SourceRetentionReceipt);
  assert.equal(sourceReceipts.length, 3);
  assert.deepEqual(sourceReceipts.map(({ pdtf1SourceRetentionReceipt: receipt }) => (
    receipt.sourceRoute
  )).sort(), ['/ontology/bake-off', '/ontology/provenance', '/ontology/tools/custom']);
  assert.deepEqual({
    routes: routes.pdtf1Migration.sourceReframeRouteCount,
    blocks: routes.pdtf1Migration.sourceReframeTotalBlockCount,
    exact: routes.pdtf1Migration.sourceReframeExactBlockCount,
    semantic: routes.pdtf1Migration.sourceReframeSemanticBlockCount,
    nonInformation: routes.pdtf1Migration.sourceReframeNonInformationBlockCount,
    digest: routes.pdtf1Migration.sourceReframeRoutesSha256,
  }, {
    routes: 3, blocks: 354, exact: 347, semantic: 7, nonInformation: 0,
    digest: '201b26d42fa6abec654a4a7b01b4a77da1a29cf886aa94bc7c98d46bdc81fc0f',
  });
});

test('preservation checker rejects a forged PDTF source-retention receipt', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-ia-preservation-'));
  const fixture = path.join(directory, 'route-baseline.json');
  try {
    const candidate = structuredClone(routes);
    const sourceReceipt = [...candidate.routes, ...candidate.addedRoutes]
      .map(({ pdtf1SourceRetentionReceipt }) => pdtf1SourceRetentionReceipt)
      .find(Boolean);
    sourceReceipt.semanticReframeBlocks[0].replacementBlockSha256 = '0'.repeat(64);
    writeFileSync(fixture, JSON.stringify(candidate));
    const result = spawnSync(process.execPath, [
      checker, '--manifest-only', `--route-manifest=${fixture}`,
    ], { cwd: projectRoot, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /PDTF 1\.0 migration|semantic reframe block/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('source evidence rejects a semantic allocation bound to the wrong source route', () => {
  const { source, accepted } = movedReceipt();
  const candidate = structuredClone(accepted);
  candidate.pdtf1SourceRetentionReceipt.semanticReframeBlocks[0].sourceRoute = '/pdtf/Property';
  candidate.pdtf1SourceRetentionReceipt.semanticReframeBlocksSha256 = semanticBlocksDigest(
    candidate.pdtf1SourceRetentionReceipt.semanticReframeBlocks,
  );
  assert.equal(pdtf1SourceEvidenceMatches(source, candidate), false);
});

test('source evidence rejects a semantic block relabelled as exact retention', () => {
  const { source, accepted } = movedReceipt();
  const candidate = structuredClone(accepted);
  const receipt = candidate.pdtf1SourceRetentionReceipt;
  const [removed] = receipt.semanticReframeBlocks.splice(0, 1);
  receipt.semanticReframeBlockCount -= removed.occurrences;
  receipt.exactRetainedBlocks += removed.occurrences;
  receipt.exactRetainedBlockRecords.push({
    hash: removed.sourceBlockSha256,
    count: removed.occurrences,
    targetRoute: candidate.acceptedRoute,
  });
  receipt.exactRetainedBlockRecords.sort((left, right) => left.hash.localeCompare(right.hash));
  receipt.semanticReframeBlocksSha256 = semanticBlocksDigest(receipt.semanticReframeBlocks);
  assert.equal(pdtf1SourceEvidenceMatches(source, candidate), false);
});

test('source evidence rejects two semantic claims sharing one target occurrence', () => {
  const { source, accepted } = movedReceipt();
  const candidate = structuredClone(accepted);
  const receipt = candidate.pdtf1SourceRetentionReceipt;
  const [first, second] = receipt.semanticReframeBlocks;
  Object.assign(second, {
    replacementRoute: first.replacementRoute,
    replacementBlockSha256: first.replacementBlockSha256,
    replacementTag: first.replacementTag,
    replacementText: first.replacementText,
    replacementContentSha256: first.replacementContentSha256,
  });
  receipt.semanticReframeBlocksSha256 = semanticBlocksDigest(receipt.semanticReframeBlocks);
  const targetCount = receipt.targetBlockInventories[0].records
    .find(({ hash }) => hash === first.replacementBlockSha256)?.count;
  assert.equal(targetCount, 1);
  assert.equal(pdtf1SourceEvidenceMatches(source, candidate), false);
});

test('stable PDTF identifier pages reject an unnecessary source receipt', () => {
  const stableSource = sourceByRoute.get('/pdtf/Property');
  const stableAccepted = structuredClone(acceptedByRoute.get('/pdtf/Property'));
  stableAccepted.pdtf1SourceRetentionReceipt = structuredClone(
    movedReceipt().accepted.pdtf1SourceRetentionReceipt,
  );
  assert.equal(pdtf1SourceEvidenceMatches(stableSource, stableAccepted), false);
});
