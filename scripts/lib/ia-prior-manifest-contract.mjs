import { execFileSync } from 'node:child_process';

import { sha256 } from './ia-preservation-contract.mjs';

export const PRIOR_IA_ROUTE_MANIFEST = Object.freeze({
  commit: '487f6a4ba2684a75d30c0699823de7f5d4f4e121',
  path: 'src/data/ia-route-baseline.json',
  blob: '5c4443134d55a4718b51af471d977abd77c840d1',
  sha256: '84fa44000acf4a780faf4b9930d208807247756acf7868149c53c2e4a344132a',
  schemaVersion: 5,
  baselineCommit: 'bab150838f86c07edc758545dd88c07d89eb5d8a',
  acceptedCommit: 'd896b0d1b743078ca55649403b4337c638a5af38',
  routeCount: 3436,
  externalRetainCount: 650,
  missingPhysicalRouteCount: 651,
  missingPhysicalRecordsSha256: '0a8b78f893bcf85a063e06a8a97fe823a657cf94a5cf4d1ab0420bc7725bc93b',
  manifestRetainedRouteCount: 658,
  manifestRetainedRecordsSha256: '4b5d98709ee6709ccf208e83fda65ed168f36ca186755d987887557c102bcdb6',
});
export const PRIOR_IA_FAMILY_MANIFEST = Object.freeze({
  commit: PRIOR_IA_ROUTE_MANIFEST.commit,
  path: 'src/data/ia-preservation-baseline.json',
  blob: '104daa7acf9f3ef3d6540b85124186cd00834843',
  sha256: '04c162bbb4f53609044ff5574b7f8c66dec5285028871f70bc6d8be32874d7b7',
  schemaVersion: 1,
  familyCount: 8,
});

const gitOptions = (root) => ({
  cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' },
});
const git = (root, args) => execFileSync('git', args, gitOptions(root)).trim();

function requireAncestor(root, ancestor, descendant) {
  try { execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], gitOptions(root)); }
  catch { throw new Error(`required Git ancestry is absent: ${ancestor} -> ${descendant}`); }
}

function loadPinnedManifest(root, source) {
  const object = `${source.commit}:${source.path}`;
  if (git(root, ['rev-parse', object]) !== source.blob) throw new Error(`prior IA manifest blob changed: ${source.path}`);
  const raw = execFileSync('git', ['show', object], gitOptions(root));
  if (sha256(raw) !== source.sha256) throw new Error(`prior IA manifest bytes changed: ${source.path}`);
  return { raw, manifest: JSON.parse(raw) };
}

export function loadPriorIaRouteManifest(root) {
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.baselineCommit, PRIOR_IA_ROUTE_MANIFEST.commit);
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.acceptedCommit, PRIOR_IA_ROUTE_MANIFEST.commit);
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, PRIOR_IA_ROUTE_MANIFEST);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  if (manifest.schemaVersion !== PRIOR_IA_ROUTE_MANIFEST.schemaVersion
    || manifest.baselineCommit !== PRIOR_IA_ROUTE_MANIFEST.baselineCommit
    || manifest.acceptedCommit !== PRIOR_IA_ROUTE_MANIFEST.acceptedCommit
    || manifest.routeCount !== PRIOR_IA_ROUTE_MANIFEST.routeCount || routes.length !== manifest.routeCount
    || manifest.externalRetainCount !== PRIOR_IA_ROUTE_MANIFEST.externalRetainCount
    || new Set(routes.map(({ route }) => route)).size !== routes.length
    || new Set(routes.map(({ file }) => file)).size !== routes.length) {
    throw new Error('prior IA route manifest does not match its frozen contract');
  }
  return result;
}

export function loadPriorIaFamilyManifest(root) {
  const result = loadPinnedManifest(root, PRIOR_IA_FAMILY_MANIFEST);
  if (result.manifest.schemaVersion !== PRIOR_IA_FAMILY_MANIFEST.schemaVersion
    || result.manifest.families?.length !== PRIOR_IA_FAMILY_MANIFEST.familyCount) {
    throw new Error('prior IA family manifest does not match its frozen contract');
  }
  return result;
}

export function verifyBaselineRootCommit(root) {
  if (git(root, ['rev-parse', 'HEAD']) !== PRIOR_IA_ROUTE_MANIFEST.baselineCommit) {
    throw new Error('baseline root is not the frozen IA baseline commit');
  }
}

export function priorRouteRecordDigest(record) {
  return sha256(JSON.stringify(record));
}

export function missingPhysicalRecordsDigest(records) {
  return sha256([...records].sort((a, b) => a.route.localeCompare(b.route))
    .map((record) => [record.route, record.file, record.kind, record.baselineRawSha256].join('\0')).join('\n'));
}

export function manifestRetainedRecordsDigest(records) {
  return sha256([...records].sort((a, b) => a.baselineRoute.localeCompare(b.baselineRoute))
    .map((record) => [record.baselineRoute, record.baselineFile,
      record.baselineEvidence?.policy, record.baselineEvidence?.sourceRecordSha256].join('\0')).join('\n'));
}

export function composePriorManifestReceipt(records, missingRecords) {
  const receipt = {
    policy: 'composed-schema-v5-baseline-v1', commit: PRIOR_IA_ROUTE_MANIFEST.commit,
    path: PRIOR_IA_ROUTE_MANIFEST.path, blob: PRIOR_IA_ROUTE_MANIFEST.blob,
    sha256: PRIOR_IA_ROUTE_MANIFEST.sha256, routeCount: PRIOR_IA_ROUTE_MANIFEST.routeCount,
    missingPhysicalRouteCount: missingRecords.length,
    missingPhysicalRecordsSha256: missingPhysicalRecordsDigest(missingRecords),
    manifestRetainedRouteCount: records.length,
    manifestRetainedRecordsSha256: manifestRetainedRecordsDigest(records),
  };
  validatePriorManifestReceipt(receipt, records);
  if (receipt.missingPhysicalRouteCount !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || receipt.missingPhysicalRecordsSha256 !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRecordsSha256) {
    throw new Error('prior IA missing-physical receipt is invalid');
  }
  return receipt;
}

export function validatePriorManifestReceipt(receipt, records) {
  for (const field of ['commit', 'path', 'blob', 'sha256', 'routeCount', 'missingPhysicalRouteCount',
    'missingPhysicalRecordsSha256', 'manifestRetainedRouteCount', 'manifestRetainedRecordsSha256']) {
    if (receipt?.[field] !== PRIOR_IA_ROUTE_MANIFEST[field]) {
      throw new Error(`prior IA manifest composition receipt has invalid ${field}`);
    }
  }
  const byteEvidence = records.filter(({ baselineEvidence }) => (
    baselineEvidence?.policy === 'prior-schema-v5-byte-identity-v1'
  ));
  const informationEvidence = records.filter(({ baselineEvidence }) => (
    baselineEvidence?.policy === 'prior-schema-v5-information-identity-v1'
  ));
  if (receipt.policy !== 'composed-schema-v5-baseline-v1' || records.length !== receipt.manifestRetainedRouteCount
    || byteEvidence.length !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || informationEvidence.length !== PRIOR_IA_ROUTE_MANIFEST.manifestRetainedRouteCount
      - PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || manifestRetainedRecordsDigest(records) !== receipt.manifestRetainedRecordsSha256) {
    throw new Error('prior IA manifest composition receipt is invalid');
  }
}

export function manifestRetainedRecordMatches(record, prior) {
  const evidence = record.baselineEvidence;
  const projectionMatches = priorRouteRecordDigest(prior) === evidence?.sourceRecordSha256
    && record.baselineRoute === prior?.route && record.baselineFile === prior?.file
    && evidence.sourceKind === prior?.kind && record.baselineCommit === prior?.baselineCommit
    && record.baselineGeneratedFamily === prior?.generatedFamily
    && record.baselineRawSha256 === prior?.baselineRawSha256
    && record.baselineContentSha256 === prior?.baselineContentSha256
    && record.baselineFragmentSha256 === prior?.baselineFragmentSha256
    && record.baselineFragmentCount === prior?.baselineFragmentCount
    && JSON.stringify(record.baselineFragments) === JSON.stringify(prior?.baselineFragments)
    && record.equivalenceReceipt?.baselineBlockInventorySha256
      === prior?.equivalenceReceipt?.baselineBlockInventorySha256;
  if (!projectionMatches) return false;
  if (evidence.policy === 'prior-schema-v5-byte-identity-v1') {
    return record.acceptedRawSha256 === record.baselineRawSha256;
  }
  return evidence.policy === 'prior-schema-v5-information-identity-v1'
    && record.acceptedContentSha256 === record.baselineContentSha256
    && record.acceptedBlockInventorySha256 === prior.equivalenceReceipt.baselineBlockInventorySha256;
}

function retainedFamiliesDigest(families) {
  return sha256(families.map((family) => [family.id, family.baselineEvidence?.sourceFamilyId,
    family.baselineEvidence?.sourceFamilySha256].join('\0')).sort().join('\n'));
}

export function composePriorFamilyReceipt(families) {
  return {
    policy: 'composed-schema-v1-family-baseline-v1', commit: PRIOR_IA_FAMILY_MANIFEST.commit,
    path: PRIOR_IA_FAMILY_MANIFEST.path, blob: PRIOR_IA_FAMILY_MANIFEST.blob,
    sha256: PRIOR_IA_FAMILY_MANIFEST.sha256, familyCount: PRIOR_IA_FAMILY_MANIFEST.familyCount,
    retainedFamiliesSha256: retainedFamiliesDigest(families),
  };
}

export function validatePriorFamilyReceipt(receipt, families) {
  for (const field of ['commit', 'path', 'blob', 'sha256', 'familyCount']) {
    if (receipt?.[field] !== PRIOR_IA_FAMILY_MANIFEST[field]) throw new Error('prior IA family composition receipt is invalid');
  }
  if (receipt.policy !== 'composed-schema-v1-family-baseline-v1' || families.length !== receipt.familyCount
    || receipt.retainedFamiliesSha256 !== retainedFamiliesDigest(families)) {
    throw new Error('prior IA family composition receipt is invalid');
  }
}

export function priorFamilyMatches(family, prior) {
  return family.baselineEvidence?.policy === 'prior-schema-v1-family-v1'
    && family.baselineEvidence.sourceFamilySha256 === sha256(JSON.stringify(prior))
    && JSON.stringify(family.baseline) === JSON.stringify(prior?.baseline);
}
