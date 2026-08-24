const PDTF_ROOT = '/pdtf';

const classRoute = `${PDTF_ROOT}/classes/lease-term`;
const propertyRoute = `${PDTF_ROOT}/object-properties/lease-term`;

/**
 * LeaseTerm and leaseTerm remain distinct source-model IRIs, but their static
 * representation documents use type-scoped paths that differ by more than
 * letter case. The former case-only paths are retired, not aliased.
 */
export const LEASE_TERM_RESOURCE_ROUTES = Object.freeze({
  policy: 'type-scoped-resource-document-pair-v1',
  legacyClassRoute: `${PDTF_ROOT}/LeaseTerm`,
  legacyPropertyRoute: `${PDTF_ROOT}/leaseTerm`,
  classRoute,
  propertyRoute,
  classFile: `${classRoute.slice(1)}/index.html`,
  propertyFile: `${propertyRoute.slice(1)}/index.html`,
  classTtlFile: `${classRoute.slice(1)}.ttl`,
  propertyTtlFile: `${propertyRoute.slice(1)}.ttl`,
  legacyClassFile: `${PDTF_ROOT.slice(1)}/LeaseTerm/index.html`,
  legacyPropertyFile: `${PDTF_ROOT.slice(1)}/leaseTerm/index.html`,
  legacyClassTtlFile: `${PDTF_ROOT.slice(1)}/LeaseTerm.ttl`,
  legacyPropertyTtlFile: `${PDTF_ROOT.slice(1)}/leaseTerm.ttl`,
  classIri: 'https://opda.org.uk/pdtf/LeaseTerm',
  propertyIri: 'https://opda.org.uk/pdtf/leaseTerm',
  redirects: false,
});

/** Return the canonical static representation route for an ontology model id. */
export function pdtfResourcePath(id) {
  if (id === 'LeaseTerm') return LEASE_TERM_RESOURCE_ROUTES.classRoute;
  if (id === 'leaseTerm') return LEASE_TERM_RESOURCE_ROUTES.propertyRoute;
  return `${PDTF_ROOT}/${id}`;
}

/** Return the catch-all slug beneath `/pdtf/` for an ontology model id. */
export function pdtfResourceSlug(id) {
  return pdtfResourcePath(id).slice(`${PDTF_ROOT}/`.length);
}

/** Return the Turtle alternate route for an ontology model id. */
export function pdtfResourceTurtlePath(id) {
  return `${pdtfResourcePath(id)}.ttl`;
}

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

/** Resolve only the two explicitly retired case-only representation routes. */
export function getPdtfResourceReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === LEASE_TERM_RESOURCE_ROUTES.legacyClassRoute) {
    return LEASE_TERM_RESOURCE_ROUTES.classRoute;
  }
  if (path === LEASE_TERM_RESOURCE_ROUTES.legacyPropertyRoute) {
    return LEASE_TERM_RESOURCE_ROUTES.propertyRoute;
  }
  if (path === `${LEASE_TERM_RESOURCE_ROUTES.legacyClassRoute}.ttl`) {
    return `${LEASE_TERM_RESOURCE_ROUTES.classRoute}.ttl`;
  }
  if (path === `${LEASE_TERM_RESOURCE_ROUTES.legacyPropertyRoute}.ttl`) {
    return `${LEASE_TERM_RESOURCE_ROUTES.propertyRoute}.ttl`;
  }
  return null;
}
