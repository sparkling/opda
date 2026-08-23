import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createCaptureEvidence } from '../scripts/lib/ia-capture-evidence.mjs';
import { blockInventory } from '../scripts/lib/ia-preservation-contract.mjs';
import {
  generatedFamily, sha256,
} from '../scripts/lib/ia-preservation-primitives.mjs';
import { retentionReceiptFailures } from '../scripts/lib/ia-retention-validator.mjs';
import {
  PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST,
  loadPdtfSchemaInputSourceRouteManifest,
} from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES,
  PDTF_SCHEMA_INPUT_ROUTE_MIGRATION,
  composePdtfSchemaInputMigrationReceipt,
} from '../scripts/lib/pdtf-schema-input-route-contract.mjs';
import {
  getAcceptedRoute, getAcceptedRouteFile, getDeclaredRouteReplacement, getLegacyCommentKey,
} from '../src/lib/site-route-migrations.mjs';

const projectRoot = new URL('..', import.meta.url).pathname;
const sourceManifest = loadPdtfSchemaInputSourceRouteManifest(projectRoot).manifest;

function projectSource() {
  const project = (record) => {
    const acceptedRoute = getDeclaredRouteReplacement(record.acceptedRoute)
      ?? record.acceptedRoute;
    return {
      ...structuredClone(record),
      acceptedRoute,
      acceptedFile: getAcceptedRouteFile(record.acceptedRoute, record.acceptedFile),
      acceptedGeneratedFamily: generatedFamily(acceptedRoute),
    };
  };
  return {
    records: sourceManifest.routes.map(project),
    addedRecords: sourceManifest.addedRoutes.map(project),
  };
}

function compose(projection, overrides = {}) {
  return composePdtfSchemaInputMigrationReceipt({
    ...projection,
    sourceManifest,
    sourceContract: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST,
    migration: PDTF_SCHEMA_INPUT_ROUTE_MIGRATION,
    replacementRoute: getDeclaredRouteReplacement,
    replacementFile: getAcceptedRouteFile,
    commentKey: getLegacyCommentKey,
    informationReframes: [],
    ...overrides,
  });
}

test('schema-v8 is a frozen, complete source for the SPDTF input cut', () => {
  assert.deepEqual(PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST, {
    commit: 'b827653b2c5b600120c36a2535b35b25da826902',
    path: 'src/data/ia-route-baseline.json',
    blob: '9f2a79f934ba8c885f960b17788bf2a0b07a96b9',
    sha256: '3a75aa2889d64d9529ad554dee126888b9795ddd94318cc3188fe04a9b5d2732',
    schemaVersion: 8,
    baselineCommit: 'bab150838f86c07edc758545dd88c07d89eb5d8a',
    acceptedCommit: '2689f79920da57cb5bd6db0ed6165299b5c9b0d0',
    routeCount: 3209,
    addedRouteCount: 76,
    retiredRouteCount: 227,
    acceptedRouteCount: 3285,
    pdtfSchemaRoot: '/pdtf-schema',
    pdtfSchemaRouteCount: 1264,
    pdtfSchemaBaselineRouteCount: 1255,
    pdtfSchemaAddedRouteCount: 9,
    retainedRouteCount: 2021,
    pdtfIdentifierRouteCount: 1090,
    generatedToolRouteCount: 652,
    navigationFragmentIdCount: 37,
    navigationFragmentOccurrenceCount: 22607,
    navigationFragmentInventorySha256: '6a67a1671b894042c8a7325d09db682ed8397b4b4884499e4da7adedfa23ede9',
    commentKeyCount: 1264,
    commentKeyPairsSha256: '5d840155c49723947dc9ba271d078bb25255a04cd37473969372ac9971c85447',
    historicalCommentKeysSha256: '34fcab218a3856c0d54f5ff5fe0d8ea610b536f16a98eb2a94b238ee66364fce',
  });
});

test('the complete schema-v8 route set moves bijectively without reminting comments', () => {
  const receipt = compose(projectSource());
  assert.deepEqual(receipt, {
    policy: 'pdtf-schema-input-route-composition-v1',
    sourceCommit: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST.commit,
    sourcePath: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST.path,
    sourceBlob: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST.blob,
    sourceSha256: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST.sha256,
    sourceSchemaVersion: 8,
    sourceAcceptedCommit: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST.acceptedCommit,
    sourceRoot: '/pdtf-schema',
    targetRoot: '/spdtf/inputs/pdtf-schema',
    sourceRouteCount: 3285,
    movedRouteCount: 1264,
    movedBaselineRouteCount: 1255,
    movedAddedRouteCount: 9,
    retainedRouteCount: 2021,
    pdtfIdentifierRouteCount: 1090,
    generatedToolRouteCount: 652,
    movedReaderRouteCount: 612,
    informationReframeRouteCount: 0,
    informationReframeBlockCount: 0,
    informationReframeRoutesSha256: sha256(''),
    informationReframesSha256: sha256('[]'),
    postSourceAdditionRouteCount: 0,
    acceptedSiteRouteCount: 3285,
    sourceRoutesSha256: '6029702cd3e12ef480c0dfe5d7b7dbad78e3a3e2490a877e0fd61d3a5c0a82a6',
    targetRoutesSha256: '949d18d904597a0d0713a841be95e4b08346812a5fe257de0d7118f1f3f2ad3e',
    sourceFilesSha256: '773e464c7465410841bbc56f7879def777a547465691af9f17e313d67dc4fc09',
    targetFilesSha256: 'a18a1d8508bc42af3bd171b95f449fcb51f1ced0abd89ac6277b8797ea3f2219',
    movedRoutePairsSha256: 'd35e58cb3880f291b1ef1bdaea5071c2be3e7a78ac0f634ebe5d436659514a43',
    retainedRoutePairsSha256: '997be67c1a727684b1e22ed248651d1c2bae63c94f5882c43a6b708315d8d10c',
    allRoutePairsSha256: '14a43903aee938d5512743605b1584f4bd80240b86a7f36f994b594a6f8546d0',
    stableIdentifierRoutesSha256: 'cf2e83c5290fe5b5b2fe2f5b25e31d2d8f53d8be90cd533e5e43de8ff30a88be',
    stableIdentifierRouteFilesSha256: '8e4ae10bd810e0d1624a47c6993c2a0e7bcb51c2a31436147207d7d0567baea6',
    stableIdentifierInformationSha256: 'd1c9964ab63eaf80df9d71f0903ba4ad164e244fa817f7d450098404d6ff7eda',
    sourceRouteFragmentsSha256: '928a0f7ed93168efe599e838fc757cb79925a2fb959b3c2af78e875210e26faf',
    retainedTargetFragmentsSha256: '964ac6c5377e61ff1f1645d6b8dff8c17397d535602f5c474062fb7ad3f44b6d',
    missingNavigationFragmentCount: 0,
    missingNavigationFragmentIds: 0,
    missingNavigationFragmentsSha256: sha256(''),
    commentKeyCount: 1264,
    distinctCommentKeyCount: 1264,
    commentKeyPairsSha256: '5d840155c49723947dc9ba271d078bb25255a04cd37473969372ac9971c85447',
    historicalCommentKeysSha256: '34fcab218a3856c0d54f5ff5fe0d8ea610b536f16a98eb2a94b238ee66364fce',
    postSourceAdditionRoutesSha256: sha256(''),
    redirects: false,
  });
});

test('reviewed input-scope and route-path reframes are exact and hash bound', () => {
  const projection = projectSource();
  const acceptedByRoute = new Map([...projection.records, ...projection.addedRecords]
    .map((record) => [record.acceptedRoute, record]));
  for (const reframe of PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES) {
    const target = acceptedByRoute.get(reframe.targetRoute);
    target.acceptedContentSha256 = reframe.targetContentSha256;
    target.acceptedBlockInventorySha256 = reframe.targetBlockInventorySha256;
  }
  const receipt = compose(projection, {
    informationReframes: PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES,
  });
  assert.equal(receipt.informationReframeRouteCount, 4);
  assert.equal(receipt.informationReframeBlockCount, 7);
  assert.notEqual(receipt.informationReframeRoutesSha256, sha256(''));
  assert.notEqual(receipt.informationReframesSha256, sha256('[]'));
  const additive = PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES.find(({ sourceRoute }) => (
    sourceRoute.endsWith('/jsonld-mappings')
  ));
  assert.equal(additive.replacements.length, 0);
  assert.equal(additive.additions.length, 1);

  const forged = structuredClone(PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES);
  forged[0].targetContentSha256 = 'f'.repeat(64);
  assert.throws(() => compose(projection, { informationReframes: forged }),
    /changed without a staged receipt/u);
});

test('the input-cut receipt rejects route, file, information, and identifier drift', () => {
  const projection = projectSource();
  const flat = projection.records.find(({ acceptedFile }) => (
    acceptedFile.endsWith('.html') && !acceptedFile.endsWith('/index.html')
  ));
  flat.acceptedFile = `${flat.acceptedRoute.slice(1)}/index.html`;
  assert.throws(() => compose(projection), /file projection changed/u);

  const information = projectSource();
  const moved = information.records.find(({ acceptedRoute }) => (
    acceptedRoute.startsWith('/spdtf/inputs/pdtf-schema/')
  ));
  moved.acceptedContentSha256 = '0'.repeat(64);
  assert.throws(() => compose(information), /information changed without a staged receipt/u);

  const stableMove = (route) => route === '/pdtf/LeaseTerm'
    ? '/pdtf/leaseTerm' : getDeclaredRouteReplacement(route);
  assert.throws(() => compose(projectSource(), { replacementRoute: stableMove }),
    /stable PDTF identifier route moved/u);

  const stableInformation = projectSource();
  const stable = stableInformation.records.find(({ acceptedRoute }) => (
    acceptedRoute === '/pdtf/LeaseTerm'
  ));
  stable.acceptedContentSha256 = 'f'.repeat(64);
  assert.throws(() => compose(stableInformation), /stable PDTF identifier information changed/u);
});

test('only exact PDTF sidebar-shell fragment loss may be classified by this cut', () => {
  const authored = projectSource();
  const authoredTarget = authored.records.find(({ acceptedRoute, acceptedFragments }) => (
    acceptedRoute.startsWith('/spdtf/inputs/pdtf-schema/')
      && acceptedFragments.some((fragment) => !fragment.startsWith('section-nav-'))
  ));
  const authoredFragment = authoredTarget.acceptedFragments.find((fragment) => (
    !fragment.startsWith('section-nav-')
  ));
  authoredTarget.acceptedFragments = authoredTarget.acceptedFragments
    .filter((fragment) => fragment !== authoredFragment);
  authoredTarget.acceptedFragmentCount = authoredTarget.acceptedFragments.length;
  authoredTarget.acceptedFragmentSha256 = sha256(authoredTarget.acceptedFragments.join('\n'));
  assert.throws(() => compose(authored), /content fragment is absent/u);

  const stableAuthored = projectSource();
  const stableTarget = stableAuthored.records.find(({ acceptedRoute }) => (
    acceptedRoute === '/pdtf/LeaseTerm'
  ));
  stableTarget.acceptedFragments = stableTarget.acceptedFragments
    .filter((fragment) => fragment !== 'auth-login-btn');
  stableTarget.acceptedFragmentCount = stableTarget.acceptedFragments.length;
  stableTarget.acceptedFragmentSha256 = sha256(stableTarget.acceptedFragments.join('\n'));
  assert.throws(() => compose(stableAuthored), /content fragment is absent/u);

  const shell = projectSource();
  const shellTarget = shell.records.find(({ acceptedRoute, acceptedFragments }) => (
    acceptedRoute.startsWith('/spdtf/inputs/pdtf-schema/')
      && acceptedFragments.some((fragment) => fragment.startsWith('section-nav-pdtf-schema-'))
  ));
  const shellFragment = shellTarget.acceptedFragments.find((fragment) => (
    fragment.startsWith('section-nav-pdtf-schema-')
  ));
  shellTarget.acceptedFragments = shellTarget.acceptedFragments
    .filter((fragment) => fragment !== shellFragment);
  shellTarget.acceptedFragmentCount = shellTarget.acceptedFragments.length;
  shellTarget.acceptedFragmentSha256 = sha256(shellTarget.acceptedFragments.join('\n'));
  const receipt = compose(shell);
  assert.equal(receipt.missingNavigationFragmentCount, 1);
  assert.equal(receipt.missingNavigationFragmentIds, 1);
  assert.notEqual(receipt.missingNavigationFragmentsSha256, sha256(''));
});

test('post-source routes require explicit new-authority classification', () => {
  const projection = projectSource();
  projection.addedRecords.push({
    acceptedRoute: '/spdtf/inputs',
    acceptedFile: 'spdtf/inputs/index.html',
    kind: 'new-authority-route',
    introducedBy: 'authority-cut',
  });
  const receipt = compose(projection);
  assert.equal(receipt.postSourceAdditionRouteCount, 1);
  assert.equal(receipt.acceptedSiteRouteCount, 3286);
  assert.equal(receipt.postSourceAdditionRoutesSha256,
    '65a643569e6a99881404a05910a904d3358ed3b4cedfd9cf53d3ff103d9f5e7a');

  projection.addedRecords.at(-1).kind = 'bundle';
  assert.throws(() => compose(projection), /post-source additions are unclassified/u);

  const injected = projectSource();
  injected.addedRecords.push({
    acceptedRoute: '/spdtf/inputs/pdtf-schema/unreviewed',
    acceptedFile: 'spdtf/inputs/pdtf-schema/unreviewed/index.html',
    kind: 'new-authority-route', introducedBy: 'unreviewed',
  });
  assert.throws(() => compose(injected), /post-source additions are unclassified/u);
});

test('baseline retention evidence composes through the staged input-hosting reframe', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-staged-retention-'));
  const ledgerPath = path.join(directory, 'ledger.json');
  const stagedRoute = PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES[1];
  const stagedBlock = stagedRoute.replacements[0];
  const sourceText = 'Legacy tool-location evidence.';
  const sourceHash = sha256(`p\0${sourceText}`);
  const intermediateHash = sha256(`${stagedBlock.sourceTag}\0${stagedBlock.sourceText}`);
  const finalHash = sha256(`${stagedBlock.targetTag}\0${stagedBlock.targetText}`);
  const sourceRoute = '/legacy-tool-location';
  const baselineCommit = 'a'.repeat(40);
  writeFileSync(ledgerPath, JSON.stringify({
    schemaVersion: 1,
    baselineCommit,
    entries: [{
      sourceBlockSha256: sourceHash, sourceTag: 'p', sourceText,
      sourceRoute, sourceRoutes: [sourceRoute],
      replacementRoute: stagedRoute.sourceRoute,
      replacementBlockSha256: intermediateHash,
      replacementTag: stagedBlock.sourceTag, replacementText: stagedBlock.sourceText,
      classification: 'scope-and-maturity-clarification',
      reviewNote: `Reviewed ${sourceText} → ${stagedBlock.sourceText}`,
    }],
  }));
  try {
    const acceptedContracts = new Map([
      [sourceRoute, { contentSha256: sha256('retained target'), blockHashes: [] }],
      [stagedRoute.targetRoute, { contentSha256: sha256('final target'), blockHashes: [finalHash] }],
    ]);
    const before = { contentSha256: sha256('baseline'), blockHashes: [sourceHash], blockCount: 1 };
    const { captureRetentionReceipt } = createCaptureEvidence({
      semanticLedgerPath: ledgerPath, baselineCommit,
    });
    const receipt = captureRetentionReceipt(sourceRoute, before, acceptedContracts, new Map());
    assert.deepEqual(receipt.semanticReframeBlocks.map((entry) => ({
      route: entry.replacementRoute, hash: entry.replacementBlockSha256,
      text: entry.replacementText,
    })), [{ route: stagedRoute.targetRoute, hash: finalHash, text: stagedBlock.targetText }]);
    const classified = new Map([...acceptedContracts].map(([route, contract]) => [route, {
      acceptedContentSha256: contract.contentSha256,
      acceptedBlockInventorySha256: blockInventory(contract.blockHashes).sha256,
    }]));
    assert.deepEqual(retentionReceiptFailures({
      baselineRoute: sourceRoute,
      equivalenceReceipt: {
        baselineBlocks: 1,
        baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
      },
      retentionReceipt: receipt,
    }, classified), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('navigation supersession evidence composes through the final input route', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-navigation-composition-'));
  const ledgerPath = path.join(directory, 'ledger.json');
  const sourceRoute = '/legacy-navigation';
  const sourceText = 'Quickstart';
  const sourceHash = sha256(`li\0${sourceText}`);
  const baselineCommit = 'b'.repeat(40);
  writeFileSync(ledgerPath, JSON.stringify({
    schemaVersion: 1,
    baselineCommit,
    entries: [{
      sourceBlockSha256: sourceHash, sourceTag: 'li', sourceText,
      sourceRoute, sourceRoutes: [sourceRoute], classification: 'superseded-navigation-copy',
      navigationDestinations: [{
        sourceRoute, originalDestinationRoute: '/implementation',
        destinationRoute: '/pdtf-1', sourceEvidence: 'containing-link',
        supersessionReason: '"Quickstart" formerly selected "/implementation"; its canonical replacement was "/pdtf-1".',
      }],
    }],
  }));
  try {
    const finalRoute = getAcceptedRoute('/pdtf-1');
    const acceptedContracts = new Map([
      [sourceRoute, { contentSha256: sha256('navigation source'), blockHashes: [] }],
      [finalRoute, { contentSha256: sha256('navigation target'), blockHashes: [sha256('target block')] }],
    ]);
    const before = { contentSha256: sha256('baseline'), blockHashes: [sourceHash], blockCount: 1 };
    const { captureRetentionReceipt } = createCaptureEvidence({
      semanticLedgerPath: ledgerPath, baselineCommit,
    });
    const receipt = captureRetentionReceipt(sourceRoute, before, acceptedContracts,
      new Map([[sourceHash, new Set(['/implementation'])]]));
    assert.deepEqual(receipt.nonInformationBlocks.map((entry) => ({
      route: entry.destinationRoute, policy: entry.destinationPolicy,
    })), [{ route: finalRoute, policy: 'canonical-equivalent' }]);
    const classified = new Map([...acceptedContracts].map(([route, contract]) => [route, {
      acceptedContentSha256: contract.contentSha256,
      acceptedBlockInventorySha256: blockInventory(contract.blockHashes).sha256,
    }]));
    assert.deepEqual(retentionReceiptFailures({
      baselineRoute: sourceRoute,
      equivalenceReceipt: {
        baselineBlocks: 1,
        baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
      },
      retentionReceipt: receipt,
    }, classified), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
