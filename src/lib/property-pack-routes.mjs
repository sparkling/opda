/** Canonical route and retained comment-identity contract for Property Pack. */
export const PROPERTY_PACK_ROUTE_MIGRATION = Object.freeze({
  canonicalRoot: '/spdtf-2/property-pack',
  retiredRoots: Object.freeze(['/v2', '/modelling/property-pack']),
  technicalRouteCount: 690,
  movedCatalogueRouteCount: 1,
  lifecycleAdditionCount: 2,
  redirects: false,
});

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

export function getPropertyPackReplacementRoute(value) {
  const path = normalizePath(value);
  const root = PROPERTY_PACK_ROUTE_MIGRATION.canonicalRoot;
  if (path === '/v2') return root;
  if (path === '/v2/comparison') return `${root}/pdtf-1-lineage`;
  if (path.startsWith('/v2/')) return `${root}${path.slice(3)}`;
  if (path === '/modelling/property-pack') return `${root}/definition-and-scope`;
  return null;
}

/** Keep existing Artalk thread identities while retired page URLs return 404. */
export function getPropertyPackLegacyCommentKey(value) {
  const path = normalizePath(value);
  const root = PROPERTY_PACK_ROUTE_MIGRATION.canonicalRoot;
  if (path === root) return '/v2';
  if (path === `${root}/pdtf-1-lineage`) return '/v2/comparison';
  if (path === `${root}/definition-and-scope`) return '/modelling/property-pack';
  if (path === `${root}/technical-working-group-determination`
    || path === `${root}/review-and-releases`) return path;
  if (path.startsWith(`${root}/`)) return `/v2${path.slice(root.length)}`;
  return path;
}
