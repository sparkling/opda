import {
  linkedInformationBlocks, nonInformationBlocksDigest, semanticBlocksDigest, sha256,
} from './ia-preservation-contract.mjs';
import { getAcceptedRoute } from '../../src/lib/site-route-migrations.mjs';

const HASH = /^[a-f0-9]{64}$/u;
const SEMANTIC_CLASSES = new Set([
  'terminology-and-scope-reframe', 'authority-and-label-reframe',
  'decision-status-update', 'presentation-structure-reframe',
  'scope-and-maturity-clarification',
  'source-inventory-metadata-refresh',
]);
const NON_INFORMATION_CLASS = 'superseded-navigation-copy';
const NAVIGATION_EVIDENCE = new Set(['containing-link', 'declared-original-destination']);
const NAVIGATION_CANONICAL_EQUIVALENTS = Object.freeze({
  '/strategy': ['/programme'], '/model': ['/pdtf-schema'], '/implementation': ['/pdtf-schema'],
  '/library': ['/resources'], '/engagement': ['/resources', '/spdtf/working-groups'],
  '/home': ['/'],
  '/v2': ['/spdtf/property-pack'],
});

function localRouteFromHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/')) return null;
  const pathname = href.split(/[?#]/u, 1)[0];
  return pathname.length > 1 ? pathname.replace(/\/+$/u, '') : '/';
}

function validNavigationDestination(entry) {
  return (entry.destinationPolicy === 'same-retained-route'
    && entry.destinationRoute === entry.originalDestinationRoute)
    || (entry.destinationPolicy === 'canonical-equivalent'
      && (getAcceptedRoute(entry.originalDestinationRoute) === entry.destinationRoute
        || NAVIGATION_CANONICAL_EQUIVALENTS[entry.originalDestinationRoute]
          ?.some((equivalent) => getAcceptedRoute(equivalent) === entry.destinationRoute)));
}

/** Return every structural or source/hash-binding defect in one retention receipt. */
export function retentionReceiptFailures(record, classifiedByRoute, options = {}) {
  const failures = [];
  const receipt = options.receipt ?? record?.retentionReceipt;
  const policy = options.policy ?? 'explicit-route-block-retention-v1';
  const baselineBlockCount = options.baselineBlockCount ?? record?.equivalenceReceipt?.baselineBlocks;
  const baselineBlockInventorySha256 = options.baselineBlockInventorySha256
    ?? record?.equivalenceReceipt?.baselineBlockInventorySha256;
  const label = options.label ?? record?.baselineRoute ?? '(missing route)';
  const sourceRoute = options.sourceRoute ?? record?.baselineRoute;
  if (!receipt || receipt.policy !== policy || receipt.baselineBlockCount !== baselineBlockCount
    || receipt.baselineBlockInventorySha256 !== baselineBlockInventorySha256
    || !Array.isArray(receipt.targetEvidence) || !receipt.targetEvidence.length
    || !Array.isArray(receipt.semanticReframeBlocks) || !Array.isArray(receipt.nonInformationBlocks)
    || !Number.isSafeInteger(receipt.exactRetainedBlocks) || receipt.exactRetainedBlocks < 0
    || !Number.isSafeInteger(receipt.semanticReframeBlockCount) || receipt.semanticReframeBlockCount < 0
    || !Number.isSafeInteger(receipt.nonInformationBlockCount) || receipt.nonInformationBlockCount < 0
    || !HASH.test(receipt.semanticReframeBlocksSha256 ?? '')
    || !HASH.test(receipt.nonInformationBlocksSha256 ?? '')) {
    return [`route lacks an explicit block-retention receipt: ${label}`];
  }
  const targetRoutes = new Set();
  for (const target of receipt.targetEvidence) {
    const classified = classifiedByRoute.get(target?.route);
    if (!classified || targetRoutes.has(target.route)
      || !HASH.test(target.acceptedContentSha256 ?? '')
      || !HASH.test(target.acceptedBlockInventorySha256 ?? '')
      || target.acceptedContentSha256 !== classified.acceptedContentSha256
      || target.acceptedBlockInventorySha256 !== classified.acceptedBlockInventorySha256) {
      failures.push(`retention target evidence is invalid: ${label} -> ${target?.route ?? '(missing route)'}`);
    } else targetRoutes.add(target.route);
  }
  const resolutions = new Set();
  let semanticCount = 0;
  for (const entry of receipt.semanticReframeBlocks) {
    const key = `${entry?.sourceRoute}\0${entry?.sourceBlockSha256}\0${entry?.replacementRoute}\0${entry?.replacementBlockSha256}`;
    const target = classifiedByRoute.get(entry?.replacementRoute);
    if (entry?.sourceRoute !== sourceRoute
      || !HASH.test(entry?.sourceBlockSha256 ?? '') || !HASH.test(entry?.replacementBlockSha256 ?? '')
      || !Number.isSafeInteger(entry?.occurrences) || entry.occurrences < 1
      || resolutions.has(key) || !targetRoutes.has(entry.replacementRoute)
      || entry.replacementContentSha256 !== target?.acceptedContentSha256
      || !SEMANTIC_CLASSES.has(entry.classification)
      || typeof entry.reviewNote !== 'string' || !entry.reviewNote.trim()
      || typeof entry.sourceTag !== 'string' || typeof entry.replacementTag !== 'string'
      || typeof entry.sourceText !== 'string' || typeof entry.replacementText !== 'string'
      || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
      || sha256(`${entry.replacementTag}\0${entry.replacementText}`) !== entry.replacementBlockSha256
      || !entry.reviewNote.includes(entry.sourceText) || !entry.reviewNote.includes(entry.replacementText)) {
      failures.push(`semantic reframe block is incomplete or unbound: ${label}`);
    } else {
      resolutions.add(key);
      semanticCount += entry.occurrences;
    }
  }
  if (semanticCount !== receipt.semanticReframeBlockCount
    || semanticBlocksDigest(receipt.semanticReframeBlocks) !== receipt.semanticReframeBlocksSha256) {
    failures.push(`semantic reframe block receipt checksum is inconsistent: ${label}`);
  }
  const nonInformation = new Set();
  let nonInformationCount = 0;
  for (const entry of receipt.nonInformationBlocks) {
    const target = classifiedByRoute.get(entry?.destinationRoute);
    if (entry?.sourceRoute !== sourceRoute
      || !HASH.test(entry?.sourceBlockSha256 ?? '') || !Number.isSafeInteger(entry?.occurrences)
      || entry.occurrences < 1 || nonInformation.has(entry.sourceBlockSha256)
      || entry.classification !== NON_INFORMATION_CLASS || !target
      || entry.destinationContentSha256 !== target.acceptedContentSha256
      || typeof entry.sourceTag !== 'string' || typeof entry.sourceText !== 'string'
      || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
      || !entry.originalDestinationRoute?.startsWith('/') || !entry.destinationRoute?.startsWith('/')
      || !validNavigationDestination(entry) || !NAVIGATION_EVIDENCE.has(entry.sourceEvidence)
      || (entry.sourceEvidence === 'containing-link'
        ? localRouteFromHref(entry.baselineLinkHref) !== entry.originalDestinationRoute
        : entry.baselineLinkHref !== null)
      || typeof entry.supersessionReason !== 'string' || !entry.supersessionReason.includes(entry.sourceText)
      || !entry.supersessionReason.includes(entry.originalDestinationRoute)
      || (!entry.supersessionReason.includes(entry.destinationRoute)
        && getAcceptedRoute(entry.originalDestinationRoute) !== entry.destinationRoute)) {
      failures.push(`non-information supersession is incomplete or unbound: ${label}`);
    } else {
      nonInformation.add(entry.sourceBlockSha256);
      nonInformationCount += entry.occurrences;
    }
  }
  if (nonInformationCount !== receipt.nonInformationBlockCount
    || nonInformationBlocksDigest(receipt.nonInformationBlocks) !== receipt.nonInformationBlocksSha256) {
    failures.push(`non-information supersession receipt checksum is inconsistent: ${label}`);
  }
  if (receipt.exactRetainedBlocks + receipt.semanticReframeBlockCount
    + receipt.nonInformationBlockCount !== receipt.baselineBlockCount) {
    failures.push(`baseline information blocks are not fully accounted for: ${label}`);
  }
  return failures;
}

export function baselineNavigationEvidenceFailures(record, html) {
  const failures = [];
  const sourceLinks = new Map();
  for (const { hash, containingLink } of linkedInformationBlocks(html)) {
    if (!sourceLinks.has(hash)) sourceLinks.set(hash, new Set());
    sourceLinks.get(hash).add(containingLink || null);
  }
  for (const entry of record.retentionReceipt?.nonInformationBlocks ?? []) {
    const hrefs = sourceLinks.get(entry.sourceBlockSha256) ?? new Set();
    const actualHref = hrefs.values().next().value;
    const supported = entry.sourceEvidence === 'containing-link'
      ? hrefs.size === 1 && actualHref === entry.baselineLinkHref
        && localRouteFromHref(actualHref) === entry.originalDestinationRoute
      : hrefs.size === 1 && actualHref === null;
    if (!supported) {
      failures.push(`baseline navigation provenance changed or is ambiguous: ${record.baselineRoute}#${entry.sourceBlockSha256}`);
    }
  }
  return failures;
}
