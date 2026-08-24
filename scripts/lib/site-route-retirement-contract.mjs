import { sha256 } from './ia-preservation-contract.mjs';
import { retentionReceiptFailures } from './ia-retention-validator.mjs';
import {
  SITE_ROUTE_RETIREMENT_SOURCE_ROUTE_MANIFEST,
  loadSiteRouteRetirementSourceRouteManifest,
} from './ia-prior-manifest-contract.mjs';
import { SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS } from './semantic-modelling-route-contract.mjs';

export const SITE_ROUTE_RETIREMENTS = Object.freeze([
  Object.freeze({ sourceRoute: '/home', replacementRoute: '/' }),
]);

const acceptedRecords = (manifest) => [
  ...(manifest?.routes ?? []), ...(manifest?.addedRoutes ?? []),
];
const digest = (values) => sha256([...values].sort().join('\n'));

/** A retired route is absent from the current output, never redirected. */
export function isSiteRouteRetired(route) {
  return SITE_ROUTE_RETIREMENTS.some(({ sourceRoute }) => route === sourceRoute);
}

/** Preserve a source-cut receipt while recording a separately reviewed retirement. */
export function composeSiteRouteRetirementReceipt({
  records,
  addedRecords,
  sourceManifest,
  sourceContract = SITE_ROUTE_RETIREMENT_SOURCE_ROUTE_MANIFEST,
}) {
  const source = acceptedRecords(sourceManifest);
  const current = [...records, ...addedRecords];
  const sourceByRoute = new Map(source.map((record) => [record.acceptedRoute, record]));
  const currentByRoute = new Map(current.map((record) => [record.acceptedRoute, record]));
  if (sourceManifest.schemaVersion !== sourceContract.schemaVersion
    || sourceManifest.baselineCommit !== sourceContract.baselineCommit
    || sourceManifest.acceptedCommit !== sourceContract.acceptedCommit
    || sourceManifest.routeCount !== sourceContract.routeCount
    || sourceManifest.addedRouteCount !== sourceContract.addedRouteCount
    || sourceManifest.retiredRouteCount !== sourceContract.retiredRouteCount
    || source.length !== sourceContract.acceptedRouteCount
    || sourceByRoute.size !== source.length || currentByRoute.size !== current.length) {
    throw new Error('site-route retirement inventories are incomplete or duplicated');
  }
  for (const { sourceRoute } of SITE_ROUTE_RETIREMENTS) {
    const sourceRecord = sourceByRoute.get(sourceRoute);
    if (!sourceRecord || sourceRecord.acceptedFile !== 'home/index.html'
      || currentByRoute.has(sourceRoute)) {
      throw new Error(`site-route retirement is missing or retained: ${sourceRoute}`);
    }
    const failures = retentionReceiptFailures(sourceRecord, sourceByRoute, {
      label: `retired site route ${sourceRoute}`,
    });
    if (failures.length) throw new Error(failures.join('; '));
  }
  const retirements = SITE_ROUTE_RETIREMENTS.map(({ sourceRoute, replacementRoute }) => {
    const sourceRecord = sourceByRoute.get(sourceRoute);
    if (!currentByRoute.has(replacementRoute)) {
      throw new Error(`site-route retirement lacks a replacement: ${sourceRoute}`);
    }
    const retainedDestinations = [...new Set(sourceRecord.retentionReceipt.targetEvidence
      .map(({ route }) => (route === sourceRoute ? replacementRoute : route)))].sort();
    if (retainedDestinations.some((route) => !currentByRoute.has(route))) {
      throw new Error(`site-route retirement lacks a retained destination: ${sourceRoute}`);
    }
    return {
      policy: 'site-route-retirement-v1',
      sourceRoute,
      sourceFile: sourceRecord.acceptedFile,
      sourceRecordSha256: sha256(JSON.stringify(sourceRecord)),
      sourceContentSha256: sourceRecord.acceptedContentSha256,
      sourceBlockInventorySha256: sourceRecord.acceptedBlockInventorySha256,
      sourceFragmentSha256: sourceRecord.acceptedFragmentSha256,
      sourceFragmentCount: sourceRecord.acceptedFragmentCount,
      replacementRoute,
      redirects: false,
      retainedDestinationRouteCount: retainedDestinations.length,
      retainedDestinationRoutesSha256: digest(retainedDestinations),
      informationRetention: {
        policy: sourceRecord.retentionReceipt.policy,
        baselineBlockCount: sourceRecord.retentionReceipt.baselineBlockCount,
        baselineBlockInventorySha256: sourceRecord.retentionReceipt.baselineBlockInventorySha256,
        exactRetainedBlocks: sourceRecord.retentionReceipt.exactRetainedBlocks,
        semanticReframeBlockCount: sourceRecord.retentionReceipt.semanticReframeBlockCount,
        nonInformationBlockCount: sourceRecord.retentionReceipt.nonInformationBlockCount,
      },
    };
  });
  return {
    policy: 'site-route-retirement-composition-v1',
    sourceCommit: sourceContract.commit,
    sourcePath: sourceContract.path,
    sourceBlob: sourceContract.blob,
    sourceSha256: sourceContract.sha256,
    sourceSchemaVersion: sourceContract.schemaVersion,
    sourceAcceptedCommit: sourceContract.acceptedCommit,
    retirementCount: retirements.length,
    retiredRoutesSha256: digest(retirements.map(({ sourceRoute }) => sourceRoute)),
    replacementRoutesSha256: digest(retirements.map(({ replacementRoute }) => replacementRoute)),
    retainedDestinationRouteCount: retirements.reduce((total, receipt) => (
      total + receipt.retainedDestinationRouteCount
    ), 0),
    retiredOutputCount: 0,
    redirects: false,
    retirements,
  };
}

/** Validate only schema-v11 retirement evidence, preserving all prior receipts. */
export function validateSiteRouteRetirementManifest(root, manifest, records, addedRecords) {
  const { manifest: sourceManifest } = loadSiteRouteRetirementSourceRouteManifest(root);
  for (const field of [...SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS, 'semanticModellingMigration']) {
    if (JSON.stringify(manifest[field]) !== JSON.stringify(sourceManifest[field])) {
      throw new Error(`schema-v10 ${field} receipt was rewritten by the site-route retirement cut`);
    }
  }
  const actual = composeSiteRouteRetirementReceipt({ records, addedRecords, sourceManifest });
  if (JSON.stringify(actual) !== JSON.stringify(manifest.siteRouteRetirements)) {
    throw new Error('site-route retirement receipt is inconsistent');
  }
}
