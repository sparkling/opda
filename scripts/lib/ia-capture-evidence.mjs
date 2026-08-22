import { readFileSync } from 'node:fs';

import {
  blockInventory, linkedInformationBlocks, nonInformationBlocksDigest,
  semanticBlocksDigest, sha256,
} from './ia-preservation-contract.mjs';
import {
  getAcceptedRoute, getDeclaredRouteReplacement,
} from '../../src/lib/site-route-migrations.mjs';
import { LEASE_TERM_CASE_COLLISION } from '../../src/lib/ontology-case-collision.mjs';

const HASH = /^[a-f0-9]{64}$/u;
const SEMANTIC_CLASSES = new Set([
  'terminology-and-scope-reframe',
  'authority-and-label-reframe',
  'decision-status-update',
  'scope-and-maturity-clarification',
]);
const NON_INFORMATION_CLASS = 'superseded-navigation-copy';
const NAVIGATION_EVIDENCE = new Set(['containing-link', 'declared-original-destination']);
const NAVIGATION_CANONICAL_EQUIVALENTS = Object.freeze({
  '/strategy': ['/programme'],
  '/model': ['/pdtf-schema'],
  '/implementation': ['/pdtf-schema'],
  '/mapping': ['/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification'],
  '/adoption': ['/pdtf-schema/schema-and-supporting-material/adoption'],
  '/library': ['/resources'],
  '/engagement': ['/resources', '/spdtf/working-groups'],
  '/v2': ['/spdtf/property-pack'],
});
const RETENTION_TARGETS = Object.freeze({
  '/': ['/', '/spdtf'],
  '/home': ['/home', '/spdtf'],
  // The frozen case-insensitive cut emitted the lowercase object property's
  // information at the uppercase path. Both identifiers now remain stable;
  // the old information follows the property while the class keeps its route.
  [LEASE_TERM_CASE_COLLISION.classRoute]: [
    LEASE_TERM_CASE_COLLISION.classRoute,
    LEASE_TERM_CASE_COLLISION.propertyRoute,
  ],
});

function localRouteFromHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/')) return null;
  const pathname = href.split(/[?#]/u, 1)[0];
  return pathname.length > 1 ? pathname.replace(/\/+$/u, '') : '/';
}

export function baselineLinkEvidence(html) {
  const evidence = new Map();
  for (const { hash, containingLink } of linkedInformationBlocks(html)) {
    if (!evidence.has(hash)) evidence.set(hash, new Set());
    evidence.get(hash).add(containingLink || null);
  }
  return evidence;
}

/** Load and validate the source-hash-bound semantic reframe ledger. */
export function createCaptureEvidence({ semanticLedgerPath, baselineCommit }) {
  const ledger = JSON.parse(readFileSync(semanticLedgerPath, 'utf8'));
  if (ledger.schemaVersion !== 1 || ledger.baselineCommit !== baselineCommit
    || !Array.isArray(ledger.entries)) {
    throw new Error('semantic reframe ledger has an invalid baseline contract');
  }
  const semanticReframes = new Map();
  for (const entry of ledger.entries) {
    const commonInvalid = !HASH.test(entry.sourceBlockSha256 ?? '')
      || typeof entry.sourceTag !== 'string' || typeof entry.sourceText !== 'string'
      || !entry.sourceRoute?.startsWith('/') || !Array.isArray(entry.sourceRoutes)
      || !entry.sourceRoutes.length || new Set(entry.sourceRoutes).size !== entry.sourceRoutes.length
      || entry.sourceRoutes.some((route) => typeof route !== 'string' || !route.startsWith('/'))
      || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
      || semanticReframes.has(entry.sourceBlockSha256);
    const semanticInvalid = SEMANTIC_CLASSES.has(entry.classification) && (
      !HASH.test(entry.replacementBlockSha256 ?? '') || typeof entry.replacementTag !== 'string'
      || typeof entry.replacementText !== 'string' || !entry.replacementRoute?.startsWith('/')
      || typeof entry.reviewNote !== 'string'
      || sha256(`${entry.replacementTag}\0${entry.replacementText}`) !== entry.replacementBlockSha256
      || !entry.reviewNote.includes(entry.sourceText) || !entry.reviewNote.includes(entry.replacementText)
    );
    const nonInformationInvalid = entry.classification === NON_INFORMATION_CLASS && (
      !Array.isArray(entry.navigationDestinations) || !entry.navigationDestinations.length
      || new Set(entry.navigationDestinations.map(({ sourceRoute }) => sourceRoute)).size
        !== entry.navigationDestinations.length
      || entry.navigationDestinations.some((resolution) => (
        !entry.sourceRoutes.includes(resolution?.sourceRoute)
        || !resolution.originalDestinationRoute?.startsWith('/')
        || !resolution.destinationRoute?.startsWith('/')
        || !NAVIGATION_EVIDENCE.has(resolution.sourceEvidence)
        || typeof resolution.supersessionReason !== 'string'
        || !resolution.supersessionReason.includes(entry.sourceText)
        || !resolution.supersessionReason.includes(resolution.originalDestinationRoute)
        || !resolution.supersessionReason.includes(resolution.destinationRoute)
      ))
    );
    if (commonInvalid || semanticInvalid || nonInformationInvalid
      || (!SEMANTIC_CLASSES.has(entry.classification) && entry.classification !== NON_INFORMATION_CLASS)) {
      throw new Error(`semantic reframe ledger entry is invalid: ${entry.sourceBlockSha256 ?? '(missing source hash)'}`);
    }
    semanticReframes.set(entry.sourceBlockSha256, entry);
  }

  function navigationResolution(entry, route) {
    const resolution = entry.navigationDestinations?.find(({ sourceRoute }) => sourceRoute === route);
    if (!resolution) {
      throw new Error(`navigation-copy supersession has no source-route resolution: ${route}#${entry.sourceBlockSha256}`);
    }
    const destinationRoute = getAcceptedRoute(resolution.destinationRoute);
    const policy = destinationRoute === resolution.originalDestinationRoute
      ? 'same-retained-route'
      : getDeclaredRouteReplacement(resolution.originalDestinationRoute) === destinationRoute
        || NAVIGATION_CANONICAL_EQUIVALENTS[resolution.originalDestinationRoute]?.includes(destinationRoute)
        ? 'canonical-equivalent' : null;
    if (!policy) {
      throw new Error(`navigation-copy supersession has no canonical destination proof: ${route}#${entry.sourceBlockSha256}`);
    }
    return { ...resolution, destinationRoute, destinationPolicy: policy };
  }

  function retentionTargets(route, before) {
    const targets = [
      ...(RETENTION_TARGETS[route] ?? [getAcceptedRoute(route)]),
      ...blockInventory(before.blockHashes).records.map(({ hash }) => {
        const resolution = semanticReframes.get(hash);
        if (resolution?.replacementRoute) return getAcceptedRoute(resolution.replacementRoute);
        return resolution?.classification === NON_INFORMATION_CLASS
          && resolution.navigationDestinations.some(({ sourceRoute }) => sourceRoute === route)
          ? navigationResolution(resolution, route).destinationRoute : null;
      }).filter(Boolean),
    ];
    const unique = [...new Set(targets)];
    if (!unique.length || unique.some((target) => typeof target !== 'string' || !target.startsWith('/'))) {
      throw new Error(`retention targets contain an invalid route: ${route}`);
    }
    return unique;
  }

  function captureRetentionReceipt(route, before, acceptedContracts, sourceLinks, options = {}) {
    const targets = retentionTargets(route, before);
    const available = new Map();
    const targetEvidence = targets.map((targetRoute) => {
      const target = acceptedContracts.get(targetRoute);
      if (!target) throw new Error(`retention target does not exist: ${route} -> ${targetRoute}`);
      available.set(targetRoute, new Map(
        blockInventory(target.blockHashes).records.map(({ hash, count }) => [hash, count]),
      ));
      return {
        route: targetRoute,
        acceptedContentSha256: target.contentSha256,
        acceptedBlockInventorySha256: blockInventory(target.blockHashes).sha256,
      };
    });
    const semanticReframeBlocks = [];
    const nonInformationBlocks = [];
    const exactRetainedBlockRecords = [];
    const exactTargets = options.exactTargetRoute
      ? targetEvidence.filter(({ route: targetRoute }) => targetRoute === options.exactTargetRoute)
      : targetEvidence;
    if (options.exactTargetRoute && exactTargets.length !== 1) {
      throw new Error(`exact retention target is absent or duplicated: ${route} -> ${options.exactTargetRoute}`);
    }
    let exactRetainedBlocks = 0;
    for (const { hash, count } of blockInventory(before.blockHashes).records) {
      let remaining = count;
      for (const { route: targetRoute } of exactTargets) {
        const target = available.get(targetRoute);
        const matched = Math.min(remaining, target.get(hash) ?? 0);
        exactRetainedBlocks += matched;
        remaining -= matched;
        if (matched) {
          target.set(hash, (target.get(hash) ?? 0) - matched);
          exactRetainedBlockRecords.push({ hash, count: matched, targetRoute });
        }
        if (!remaining) break;
      }
      if (!remaining) continue;
      const semantic = semanticReframes.get(hash);
      const navigation = semantic?.classification === NON_INFORMATION_CLASS
        ? navigationResolution(semantic, route) : null;
      const targetRoute = semantic?.replacementRoute
        ? getAcceptedRoute(semantic.replacementRoute) : navigation?.destinationRoute;
      const target = targetEvidence.find(({ route: candidate }) => candidate === targetRoute);
      if (!semantic || !semantic.sourceRoutes.includes(route) || !target) {
        throw new Error(`no concrete retention resolution is declared for ${route}#${hash}`);
      }
      if (semantic.classification === NON_INFORMATION_CLASS) {
        const hrefs = sourceLinks.get(hash) ?? new Set();
        if (navigation.sourceEvidence === 'containing-link') {
          const href = hrefs.values().next().value;
          if (hrefs.size !== 1 || !href || localRouteFromHref(href) !== navigation.originalDestinationRoute) {
            throw new Error(`navigation-copy evidence does not match the baseline: ${route}#${hash}`);
          }
        } else if (hrefs.size !== 1 || hrefs.values().next().value !== null) {
          throw new Error(`declared destination conflicts with baseline link evidence: ${route}#${hash}`);
        }
        nonInformationBlocks.push({
          sourceRoute: route, sourceBlockSha256: hash,
          sourceTag: semantic.sourceTag, sourceText: semantic.sourceText,
          occurrences: remaining, classification: semantic.classification,
          originalDestinationRoute: navigation.originalDestinationRoute,
          destinationRoute: navigation.destinationRoute, destinationPolicy: navigation.destinationPolicy,
          sourceEvidence: navigation.sourceEvidence,
          baselineLinkHref: navigation.sourceEvidence === 'containing-link'
            ? hrefs.values().next().value : null,
          destinationContentSha256: target.acceptedContentSha256,
          supersessionReason: navigation.supersessionReason,
        });
      } else {
        const replacementInventory = available.get(targetRoute);
        if ((replacementInventory.get(semantic.replacementBlockSha256) ?? 0) < remaining) {
          throw new Error(`semantic replacement multiplicity is insufficient: ${route}#${hash}`);
        }
        replacementInventory.set(
          semantic.replacementBlockSha256,
          replacementInventory.get(semantic.replacementBlockSha256) - remaining,
        );
        semanticReframeBlocks.push({
          sourceRoute: route, sourceBlockSha256: hash,
          sourceTag: semantic.sourceTag, sourceText: semantic.sourceText,
          occurrences: remaining, replacementRoute: targetRoute,
          replacementBlockSha256: semantic.replacementBlockSha256,
          replacementTag: semantic.replacementTag, replacementText: semantic.replacementText,
          replacementContentSha256: target.acceptedContentSha256,
          classification: semantic.classification, reviewNote: semantic.reviewNote,
        });
      }
    }
    const semanticReframeBlockCount = semanticReframeBlocks
      .reduce((total, { occurrences }) => total + occurrences, 0);
    const nonInformationBlockCount = nonInformationBlocks
      .reduce((total, { occurrences }) => total + occurrences, 0);
    return {
      policy: 'explicit-route-block-retention-v1',
      baselineBlockCount: before.blockCount,
      baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
      targetEvidence, exactRetainedBlocks,
      ...(options.includeAllocation ? { exactRetainedBlockRecords } : {}),
      semanticReframeBlockCount, semanticReframeBlocks,
      semanticReframeBlocksSha256: semanticBlocksDigest(semanticReframeBlocks),
      nonInformationBlockCount, nonInformationBlocks,
      nonInformationBlocksSha256: nonInformationBlocksDigest(nonInformationBlocks),
    };
  }

  return { baselineLinkEvidence, captureRetentionReceipt, semanticReframes };
}
