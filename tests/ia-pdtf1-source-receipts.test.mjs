import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loadPdtf1SourceRouteManifest } from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  pdtf1SourceEvidenceMatches,
  semanticBlocksDigest,
  sha256,
} from '../scripts/lib/ia-preservation-primitives.mjs';
import {
  PDTF1_TOOL_REFRAMES, composePdtf1ToolReframeReceipt,
} from '../scripts/lib/pdtf1-tool-reframes.mjs';
import {
  SOURCE_ARCHIVE_REFRAMES, composeSourceArchiveReframeReceipt,
} from '../scripts/lib/source-archive-reframes.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const checker = fileURLToPath(new URL('../scripts/check-ia-preservation.mjs', import.meta.url));
const routes = JSON.parse(readFileSync(
  new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8',
));
const families = JSON.parse(readFileSync(
  new URL('../src/data/ia-preservation-baseline.json', import.meta.url), 'utf8',
));
const resources = JSON.parse(readFileSync(
  new URL('../src/data/resources-manifest.json', import.meta.url), 'utf8',
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

function inventoryWithTrackedReframes(baseline, relative, declarations) {
  const byPath = new Map(declarations.map((entry) => [entry.path, entry]));
  const records = baseline.records.map((record) => {
    const declaration = byPath.get(record.path);
    if (!declaration) return record;
    const file = path.join(projectRoot, relative, record.path);
    const accepted = { path: record.path, size: statSync(file).size, sha256: sha256(readFileSync(file)) };
    assert.equal(accepted.sha256, declaration.acceptedSha256);
    return accepted;
  });
  return {
    count: records.length,
    treeSha256: sha256(records.map((record) => (
      `${record.path}\0${record.size}\0${record.sha256}`
    )).join('\n')),
    records,
  };
}

function inventoryWithSizeMutation(inventory, file) {
  const records = inventory.records.map((record) => (
    record.path === file ? { ...record, size: record.size + 1 } : record
  ));
  return {
    count: records.length,
    treeSha256: sha256(records.map((record) => (
      `${record.path}\0${record.size}\0${record.sha256}`
    )).join('\n')),
    records,
  };
}

test('PDTF source and tool reframes are a closed, hash-bound set', () => {
  const sourceArchive = families.families.find(({ id }) => id === 'source-archive');
  const currentSourceArchive = inventoryWithTrackedReframes(
    sourceArchive.baseline, 'source', SOURCE_ARCHIVE_REFRAMES,
  );
  const sourceReceipt = composeSourceArchiveReframeReceipt(
    sourceArchive.baseline, currentSourceArchive,
  );
  const resourceSizes = new Map(resources.map(({ path: resourcePath, sizeBytes }) => (
    [resourcePath, sizeBytes]
  )));
  for (const entry of sourceReceipt.reframedFiles) {
    assert.equal(resourceSizes.get(`source/${entry.path}`), entry.acceptedSize);
  }
  assert.deepEqual({
    exact: sourceReceipt.byteIdenticalFileCount,
    reframed: sourceReceipt.reframedFileCount,
    files: sourceReceipt.reframedFiles.map(({ path: file }) => file),
  }, {
    exact: 1611,
    reframed: 9,
    files: [
      '00-deliverables/semantic-models/README.md',
      '03-standards/ontology/exemplars/README.md',
      '03-standards/rml/CONTRACT.md',
      '03-standards/rml/ONTOLOGY-COVERAGE.md',
      '03-standards/rml/README.md',
      '03-standards/rml/gap-register.md',
      '03-standards/rml/testdata/MANIFEST.md',
      'README.md',
      '_content/schema/48-evidence-documents-declarations.md',
    ],
  });
  const tools = families.families.find(({ id }) => id === 'ontology-tools');
  const currentTools = inventoryWithTrackedReframes(
    tools.baseline, 'public/pdtf-schema/schema-derived-ontology/use-and-tooling/tools',
    PDTF1_TOOL_REFRAMES,
  );
  const toolReceipt = composePdtf1ToolReframeReceipt(tools.baseline, currentTools);
  assert.deepEqual({
    policy: 'reframe-equivalent',
    receiptPolicy: toolReceipt.policy,
    exact: toolReceipt.byteIdenticalFileCount,
    reframed: toolReceipt.reframedFileCount,
    files: toolReceipt.reframedFiles.map(({ path: file }) => file),
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

test('closed file reframes reject size-only drift in reviewed and untouched records', () => {
  const sourceArchive = families.families.find(({ id }) => id === 'source-archive');
  const currentSourceArchive = inventoryWithTrackedReframes(
    sourceArchive.baseline, 'source', SOURCE_ARCHIVE_REFRAMES,
  );
  assert.throws(() => composeSourceArchiveReframeReceipt(
    sourceArchive.baseline,
    inventoryWithSizeMutation(currentSourceArchive, 'README.md'),
  ), /source archive reframe bytes changed/u);
  assert.throws(() => composeSourceArchiveReframeReceipt(
    sourceArchive.baseline,
    inventoryWithSizeMutation(currentSourceArchive, '_content/schema/35-transaction-participants.md'),
  ), /outside the reviewed authority-note set/u);

  const tools = families.families.find(({ id }) => id === 'ontology-tools');
  const currentTools = inventoryWithTrackedReframes(
    tools.baseline, 'public/pdtf-schema/schema-derived-ontology/use-and-tooling/tools',
    PDTF1_TOOL_REFRAMES,
  );
  assert.throws(() => composePdtf1ToolReframeReceipt(
    tools.baseline,
    inventoryWithSizeMutation(currentTools, 'COMPARISON.md'),
  ), /tool reframe bytes changed/u);
  assert.throws(() => composePdtf1ToolReframeReceipt(
    tools.baseline,
    inventoryWithSizeMutation(currentTools, 'lode/README.md'),
  ), /outside the reviewed file set/u);
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
    assert.match(`${result.stdout}${result.stderr}`, /PDTF schema source migration|semantic reframe block/u);
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

test('source evidence validates semantic replacements on more than one declared target', () => {
  const { source, accepted } = movedReceipt();
  const candidate = structuredClone(accepted);
  const receipt = candidate.pdtf1SourceRetentionReceipt;
  const secondaryRoute = '/secondary-schema-derived-target';
  const secondaryEvidence = structuredClone(receipt.targetEvidence[0]);
  const secondaryInventory = structuredClone(receipt.targetBlockInventories[0]);
  secondaryEvidence.route = secondaryRoute;
  secondaryInventory.route = secondaryRoute;
  receipt.targetEvidence.push(secondaryEvidence);
  receipt.targetBlockInventories.push(secondaryInventory);
  receipt.semanticReframeBlocks[0].replacementRoute = secondaryRoute;
  receipt.semanticReframeBlocksSha256 = semanticBlocksDigest(receipt.semanticReframeBlocks);

  assert.equal(pdtf1SourceEvidenceMatches(source, candidate), true);
});

test('stable PDTF identifier pages reject an unnecessary source receipt', () => {
  const stableSource = sourceByRoute.get('/pdtf/Property');
  const stableAccepted = structuredClone(acceptedByRoute.get('/pdtf/Property'));
  stableAccepted.pdtf1SourceRetentionReceipt = structuredClone(
    movedReceipt().accepted.pdtf1SourceRetentionReceipt,
  );
  assert.equal(pdtf1SourceEvidenceMatches(stableSource, stableAccepted), false);
});
