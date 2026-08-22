import { sha256 } from './ia-preservation-primitives.mjs';

const acceptedSourceRecords = (manifest) => [
  ...(manifest?.routes ?? []), ...(manifest?.addedRoutes ?? []),
];
const routeWithin = (route, root) => route === root || route?.startsWith(`${root}/`);
const routeSetDigest = (values) => sha256([...values].sort().join('\n'));

/**
 * Compose the immutable intermediate reader-route cut into the final
 * schema-to-scheme hierarchy. Information retention remains governed by the
 * existing per-record receipts; this receipt binds route identity and scope.
 */
export function composeSchemaToSchemeRouteReceipt({
  records, addedRecords, sourceManifest, sourceAdditions = [], sourceContract, replacementRoute,
}) {
  const manifestSource = acceptedSourceRecords(sourceManifest);
  const source = [...manifestSource, ...sourceAdditions];
  const accepted = [...records, ...addedRecords];
  const byRoute = new Map(accepted.map((record) => [record.acceptedRoute, record]));
  if (manifestSource.length !== sourceContract?.manifestAcceptedRouteCount
    || sourceAdditions.length !== sourceContract?.supplementalRouteCount
    || source.length !== sourceContract?.acceptedRouteCount
    || sourceManifest.schemaVersion !== sourceContract.schemaVersion
    || sourceManifest.baselineCommit !== sourceContract.baselineCommit
    || sourceManifest.acceptedCommit !== sourceContract.acceptedCommit
    || new Set(source.map(({ acceptedRoute }) => acceptedRoute)).size !== source.length
    || new Set(source.map(({ acceptedFile }) => acceptedFile)).size !== source.length
    || byRoute.size !== accepted.length
    || new Set(accepted.map(({ acceptedFile }) => acceptedFile)).size !== accepted.length) {
    throw new Error('schema-to-scheme route inventories are incomplete or duplicated');
  }
  const accounted = new Set();
  const moved = [];
  const retained = [];
  const pdtfIdentifiers = [];
  const propertyPack = [];
  for (const sourceRecord of source) {
    const sourceRoute = sourceRecord.acceptedRoute;
    const fromPdtfSchema = routeWithin(sourceRoute, '/pdtf-1');
    const fromSpdtf = routeWithin(sourceRoute, '/spdtf-2');
    const stablePdtfIdentifier = routeWithin(sourceRoute, '/pdtf');
    const replacement = replacementRoute(sourceRoute);
    if (stablePdtfIdentifier && replacement) {
      throw new Error(`stable PDTF identifier route moved during schema-to-scheme composition: ${sourceRoute}`);
    }
    if ((fromPdtfSchema || fromSpdtf) !== Boolean(replacement)) {
      throw new Error(`schema-to-scheme route has an undeclared disposition: ${sourceRoute}`);
    }
    const targetRoute = replacement ?? sourceRoute;
    const target = byRoute.get(targetRoute);
    if (!target || accounted.has(targetRoute) || (replacement && byRoute.has(sourceRoute))) {
      throw new Error(`schema-to-scheme route is missing, duplicated, or retained at its old URL: ${sourceRoute}`);
    }
    if ((fromPdtfSchema && !routeWithin(targetRoute, '/pdtf-schema'))
      || (fromSpdtf && !routeWithin(targetRoute, '/spdtf'))) {
      throw new Error(`schema-to-scheme route escaped its final hierarchy: ${sourceRoute} -> ${targetRoute}`);
    }
    accounted.add(targetRoute);
    (replacement ? moved : retained).push({ source: sourceRecord, target });
    if (stablePdtfIdentifier) pdtfIdentifiers.push({ source: sourceRecord, target });
    if (routeWithin(sourceRoute, '/spdtf-2/property-pack')) {
      propertyPack.push({ source: sourceRecord, target });
    }
  }
  const pdtfSchema = moved.filter(({ source: record }) => routeWithin(record.acceptedRoute, '/pdtf-1'));
  const spdtf = moved.filter(({ source: record }) => routeWithin(record.acceptedRoute, '/spdtf-2'));
  if (pdtfSchema.length !== sourceContract.pdtfSchemaSourceRouteCount
    || spdtf.length !== sourceContract.spdtfSourceRouteCount
    || pdtfIdentifiers.length !== sourceContract.pdtfIdentifierRouteCount
    || propertyPack.length !== sourceContract.propertyPackSourceRouteCount
    || moved.length !== pdtfSchema.length + spdtf.length) {
    throw new Error('schema-to-scheme route-family counts differ from the frozen source cut');
  }
  const postSourceAdditions = accepted.filter(({ acceptedRoute }) => !accounted.has(acceptedRoute));
  if (postSourceAdditions.some(({ acceptedRoute, kind, introducedBy }) => (
    routeWithin(acceptedRoute, '/pdtf-1') || routeWithin(acceptedRoute, '/spdtf-2')
      || kind !== 'new-authority-route' || typeof introducedBy !== 'string' || !introducedBy
  ))) {
    throw new Error('schema-to-scheme post-source additions are unclassified or use retired routes');
  }
  return {
    policy: 'schema-to-scheme-route-composition-v1',
    sourceCommit: sourceContract.commit,
    sourcePath: sourceContract.path,
    sourceBlob: sourceContract.blob,
    sourceSha256: sourceContract.sha256,
    sourceSupplementalRoutesSha256: sourceContract.supplementalRoutesSha256,
    sourceManifestRouteCount: manifestSource.length,
    sourceSupplementalRouteCount: sourceAdditions.length,
    sourceRouteCount: source.length,
    movedRouteCount: moved.length,
    pdtfSchemaRouteCount: pdtfSchema.length,
    spdtfRouteCount: spdtf.length,
    propertyPackRouteCount: propertyPack.length,
    pdtfIdentifierRouteCount: pdtfIdentifiers.length,
    retainedRouteCount: retained.length,
    postSourceAdditionRouteCount: postSourceAdditions.length,
    acceptedSiteRouteCount: accepted.length,
    routePairsSha256: routeSetDigest(source.map((before) => {
      const afterRoute = replacementRoute(before.acceptedRoute) ?? before.acceptedRoute;
      const after = byRoute.get(afterRoute);
      return `${before.acceptedRoute}\0${afterRoute}\0${before.acceptedFile}\0${after.acceptedFile}`;
    })),
    pdtfIdentifierRoutesSha256: routeSetDigest(pdtfIdentifiers.map(({ source: record }) => (
      record.acceptedRoute
    ))),
    postSourceAdditionRoutesSha256: routeSetDigest(postSourceAdditions.map(({ acceptedRoute }) => (
      acceptedRoute
    ))),
    redirects: false,
  };
}
