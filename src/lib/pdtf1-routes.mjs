/** Canonical PDTF 1.0 documentation-route hierarchy. */
export const PDTF1_ROUTES = Object.freeze({
  root: '/pdtf-1',
  original: '/pdtf-1/original-standard',
  extracted: '/pdtf-1/extracted-ontology',
  lineage: '/pdtf-1/extracted-ontology/lineage-provenance-and-verification',
  historicalModelling: '/pdtf-1/extracted-ontology/lineage-provenance-and-verification/historical-modelling',
  schemaVerification: '/pdtf-1/extracted-ontology/lineage-provenance-and-verification/schema-to-ontology-verification',
  modelViews: '/pdtf-1/extracted-ontology/model-views-by-audience',
  concepts: '/pdtf-1/extracted-ontology/concepts-and-architecture',
  terms: '/pdtf-1/extracted-ontology/terms-and-model-resources',
  validation: '/pdtf-1/extracted-ontology/validation-and-examples',
  trust: '/pdtf-1/extracted-ontology/trust-governance-and-limitations',
  use: '/pdtf-1/extracted-ontology/use-and-tooling',
});

export const PDTF1_ROUTE_MIGRATION = Object.freeze({
  canonicalRoot: PDTF1_ROUTES.root,
  retiredRoots: Object.freeze([
    '/schema', '/implementation', '/adoption', '/model', '/ontology', '/mapping', '/manual',
  ]),
  redirects: false,
  stableIdentifierRoot: '/pdtf',
});

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

function replacePrefix(path, source, target) {
  if (path === source) return target;
  return path.startsWith(`${source}/`) ? `${target}${path.slice(source.length)}` : null;
}

const exactRoutes = new Map([
  ['/modelling/data-dictionary', `${PDTF1_ROUTES.original}/data-dictionary`],
  ['/modelling/business-glossary', `${PDTF1_ROUTES.original}/business-glossary`],
  ['/modelling/overlays', `${PDTF1_ROUTES.original}/schema/overlays`],
  ['/modelling', PDTF1_ROUTES.historicalModelling],
  ['/modelling/standards-stack', `${PDTF1_ROUTES.historicalModelling}/standards-stack`],
  ['/modelling/bounded-contexts', `${PDTF1_ROUTES.historicalModelling}/bounded-contexts`],
  ['/modelling/concept-taxonomy', `${PDTF1_ROUTES.historicalModelling}/concept-taxonomy`],
  ['/modelling/ontology', `${PDTF1_ROUTES.historicalModelling}/ontology`],
  ['/modelling/shacl-shapes', `${PDTF1_ROUTES.historicalModelling}/shacl-shapes`],
  ['/modelling/jsonld-mappings', `${PDTF1_ROUTES.historicalModelling}/jsonld-mappings`],
  ['/ontology', PDTF1_ROUTES.extracted],
  ['/ontology/lineage-and-verification', PDTF1_ROUTES.lineage],
  ['/ontology/provenance', `${PDTF1_ROUTES.lineage}/decision-provenance`],
  ['/ontology/concepts-and-architecture', PDTF1_ROUTES.concepts],
  ['/ontology/foundation', `${PDTF1_ROUTES.concepts}/foundation`],
  ['/ontology/identity', `${PDTF1_ROUTES.concepts}/identity`],
  ['/ontology/contexts', `${PDTF1_ROUTES.concepts}/contexts`],
  ['/ontology/foundational-ontology', `${PDTF1_ROUTES.concepts}/foundational-ontology`],
  ['/ontology/modelling-frameworks', `${PDTF1_ROUTES.concepts}/modelling-frameworks`],
  ['/ontology/terms-and-model-resources', PDTF1_ROUTES.terms],
  ['/ontology/graph', `${PDTF1_ROUTES.terms}/graph`],
  ['/ontology/classes', `${PDTF1_ROUTES.terms}/classes`],
  ['/ontology/properties', `${PDTF1_ROUTES.terms}/properties`],
  ['/ontology/datatypes', `${PDTF1_ROUTES.terms}/datatypes`],
  ['/ontology/vocabularies', `${PDTF1_ROUTES.terms}/vocabularies`],
  ['/ontology/glossary', `${PDTF1_ROUTES.terms}/glossary`],
  ['/ontology/validation-and-examples', PDTF1_ROUTES.validation],
  ['/ontology/shapes', `${PDTF1_ROUTES.validation}/shapes`],
  ['/ontology/profiles', `${PDTF1_ROUTES.validation}/profiles`],
  ['/ontology/exemplars', `${PDTF1_ROUTES.validation}/exemplars`],
  ['/ontology/trust-and-governance', PDTF1_ROUTES.trust],
  ['/ontology/claims', `${PDTF1_ROUTES.trust}/claims`],
  ['/ontology/governance', `${PDTF1_ROUTES.trust}/governance`],
  ['/ontology/known-issues', `${PDTF1_ROUTES.trust}/known-issues`],
  ['/ontology/use-and-tooling', PDTF1_ROUTES.use],
  ['/ontology/usage', `${PDTF1_ROUTES.use}/usage`],
  ['/ontology/namespaces', `${PDTF1_ROUTES.use}/namespaces`],
  ['/ontology/bake-off', `${PDTF1_ROUTES.use}/bake-off`],
]);

const prefixRoutes = [
  ['/ontology/context', `${PDTF1_ROUTES.concepts}/contexts`],
  ['/ontology/category', `${PDTF1_ROUTES.terms}/categories`],
  ['/ontology/profile', `${PDTF1_ROUTES.validation}/profiles`],
  ['/ontology/exemplar', `${PDTF1_ROUTES.validation}/exemplars`],
  ['/ontology/tools', `${PDTF1_ROUTES.use}/tools`],
  ['/ontology/artefacts', `${PDTF1_ROUTES.use}/artefacts`],
  ['/schema', `${PDTF1_ROUTES.original}/schema`],
  ['/implementation', `${PDTF1_ROUTES.original}/implementation`],
  ['/adoption', `${PDTF1_ROUTES.original}/adoption`],
  ['/mapping', PDTF1_ROUTES.schemaVerification],
  ['/model', PDTF1_ROUTES.modelViews],
  ['/manual', PDTF1_ROUTES.modelViews],
].sort(([left], [right]) => right.length - left.length);

/** Return the new canonical route for a retired PDTF 1.0 documentation URL. */
export function getPdtf1ReplacementRoute(value) {
  const path = normalizePath(value);
  const exact = exactRoutes.get(path);
  if (exact) return exact;
  for (const [source, target] of prefixRoutes) {
    const replacement = replacePrefix(path, source, target);
    if (replacement) return replacement;
  }
  return null;
}

/** Preserve current comment threads while the old reader URL itself returns 404. */
export function getPdtf1LegacyCommentKey(value) {
  const path = normalizePath(value);
  for (const [legacy, canonical] of exactRoutes) {
    if (path === canonical) return legacy;
  }
  for (const [legacy, canonical] of prefixRoutes
    .filter(([source]) => source !== '/manual')
    .sort(([, left], [, right]) => right.length - left.length)) {
    if (path.startsWith(`${canonical}/`)) return `${legacy}${path.slice(canonical.length)}`;
  }
  return path;
}
