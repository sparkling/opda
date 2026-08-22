import { createHash } from 'node:crypto';

import {
  PDTF_SCHEMA_FRAGMENT_REPLACEMENTS, isRetiredPdtf1ManualAlias,
} from '../../src/lib/pdtf1-routes.mjs';
import { getAcceptedRoute } from '../../src/lib/site-route-migrations.mjs';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function migrationUsage(pairs, label) {
  const counts = new Map(PDTF_SCHEMA_FRAGMENT_REPLACEMENTS.map(([source]) => [source, 0]));
  for (const { sourceRoute, sourceFragments, acceptedFragments } of pairs) {
    const accepted = new Set(acceptedFragments ?? []);
    for (const fragment of sourceFragments ?? []) {
      if (accepted.has(fragment)) continue;
      const replacement = PDTF_SCHEMA_FRAGMENT_REPLACEMENTS
        .find(([source]) => source === fragment)?.[1];
      if (!replacement || !accepted.has(replacement)) {
        throw new Error(`${label} fragment has no declared replacement: ${sourceRoute}#${fragment}`);
      }
      counts.set(fragment, counts.get(fragment) + 1);
    }
  }
  return counts;
}

/** Compose the closed receipt for fragment identifiers renamed by the route cut. */
export function composePdtfSchemaFragmentMigrationReceipt({
  records, addedRecords, sourceRecords, sourceTargetRoute = (sourceRoute) => {
    if (isRetiredPdtf1ManualAlias(sourceRoute)) return null;
    return getAcceptedRoute(sourceRoute);
  },
}) {
  const acceptedByRoute = new Map(
    [...records, ...addedRecords].map((record) => [record.acceptedRoute, record]),
  );
  const baselinePairs = records.map((record) => ({
    sourceRoute: record.baselineRoute,
    sourceFragments: record.baselineFragments,
    acceptedFragments: record.acceptedFragments,
  }));
  const sourcePairs = sourceRecords.flatMap((record) => {
    const targetRoute = sourceTargetRoute(record.acceptedRoute);
    if (!targetRoute) return [];
    const target = acceptedByRoute.get(targetRoute);
    if (!target) throw new Error(`fragment migration target is absent: ${record.acceptedRoute}`);
    return [{
      sourceRoute: record.acceptedRoute,
      sourceFragments: record.acceptedFragments,
      acceptedFragments: target.acceptedFragments,
    }];
  });
  const baseline = migrationUsage(baselinePairs, 'baseline');
  const source = migrationUsage(sourcePairs, 'PDTF schema source');
  const mappings = PDTF_SCHEMA_FRAGMENT_REPLACEMENTS.map(([sourceFragment, acceptedFragment]) => ({
    sourceFragment,
    acceptedFragment,
    baselineOccurrences: baseline.get(sourceFragment),
    sourceOccurrences: source.get(sourceFragment),
  }));
  if (new Set(mappings.map(({ sourceFragment }) => sourceFragment)).size !== mappings.length
    || new Set(mappings.map(({ acceptedFragment }) => acceptedFragment)).size !== mappings.length
    || mappings.some(({ baselineOccurrences, sourceOccurrences }) => (
      baselineOccurrences + sourceOccurrences < 1
    ))) {
    throw new Error('fragment migration mappings are duplicate, non-bijective, or unused');
  }
  const mappingsSha256 = sha256(mappings.map((entry) => [
    entry.sourceFragment, entry.acceptedFragment,
    entry.baselineOccurrences, entry.sourceOccurrences,
  ].join('\0')).join('\n'));
  return {
    policy: 'explicit-schema-to-scheme-fragment-replacement-v1',
    mappingCount: mappings.length,
    baselineRouteCount: baselinePairs.length,
    sourceRouteCount: sourcePairs.length,
    baselineMigratedFragmentCount: [...baseline.values()].reduce((sum, count) => sum + count, 0),
    sourceMigratedFragmentCount: [...source.values()].reduce((sum, count) => sum + count, 0),
    mappingsSha256,
    mappings,
  };
}

export function validatePdtfSchemaFragmentMigrationReceipt(
  receipt, records, addedRecords, sourceRecords,
) {
  const actual = composePdtfSchemaFragmentMigrationReceipt({
    records, addedRecords, sourceRecords,
  });
  if (JSON.stringify(actual) !== JSON.stringify(receipt)) {
    throw new Error('PDTF schema fragment migration receipt is inconsistent');
  }
}
