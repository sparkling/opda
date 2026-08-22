/** Canonical PDTF schema documentation-route hierarchy. */
export const PDTF1_ROUTES = Object.freeze({
  root: '/pdtf-schema',
  original: '/pdtf-schema/schema-and-supporting-material',
  extracted: '/pdtf-schema/schema-derived-ontology',
  lineage: '/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification',
  historicalModelling: '/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling',
  schemaVerification: '/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification',
  modelViews: '/pdtf-schema/schema-derived-ontology/model-views-by-audience',
  concepts: '/pdtf-schema/schema-derived-ontology/concepts-and-architecture',
  terms: '/pdtf-schema/schema-derived-ontology/terms-and-model-resources',
  validation: '/pdtf-schema/schema-derived-ontology/validation-and-examples',
  trust: '/pdtf-schema/schema-derived-ontology/trust-governance-and-limitations',
  use: '/pdtf-schema/schema-derived-ontology/use-and-tooling',
});

export const PDTF1_ROUTE_MIGRATION = Object.freeze({
  canonicalRoot: PDTF1_ROUTES.root,
  intermediateRoot: '/pdtf-1',
  retiredRoots: Object.freeze([
    '/schema', '/implementation', '/adoption', '/model', '/ontology', '/mapping', '/manual',
  ]),
  sourceRouteCount: 3500,
  movedCanonicalRouteCount: 1264,
  movedBaselineRouteCount: 1255,
  movedAddedRouteCount: 9,
  movedFamilyRouteCounts: Object.freeze({
    adoption: 6,
    implementation: 6,
    mapping: 163,
    model: 227,
    modelling: 10,
    ontology: 746,
    'pdtf-1': 2,
    schema: 104,
  }),
  retiredAliasRouteCount: 227,
  stableIdentifierRouteCount: 1090,
  generatedToolRouteCount: 652,
  ontologyArtefactHtmlRouteCount: 1,
  canonicalFamilyRouteCount: 1264,
  sourceReframeRouteCount: 3,
  sourceReframeTotalBlockCount: 354,
  sourceReframeExactBlockCount: 347,
  sourceReframeSemanticBlockCount: 7,
  sourceReframeNonInformationBlockCount: 0,
  sourceReframeRoutesSha256: '201b26d42fa6abec654a4a7b01b4a77da1a29cf886aa94bc7c98d46bdc81fc0f',
  postSourceAdditionRouteCount: 1,
  acceptedSiteRouteCount: 3274,
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

/** `/manual/**` was a zero-information redirect family and is not reminted. */
export function isRetiredPdtf1ManualAlias(value) {
  const path = normalizePath(value);
  return path === '/manual' || path.startsWith('/manual/');
}

/** `/pdtf/**` is the stable, dereferenceable ontology identifier namespace. */
export function isStablePdtfIdentifierRoute(value) {
  const path = normalizePath(value);
  return path === '/pdtf' || path.startsWith('/pdtf/');
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

/** Return the new canonical route for a retired PDTF schema documentation URL. */
export function getPdtf1ReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === '/pdtf-1') return PDTF1_ROUTES.root;
  if (path === '/pdtf-1/original-standard') return PDTF1_ROUTES.original;
  if (path.startsWith('/pdtf-1/original-standard/')) {
    return `${PDTF1_ROUTES.original}${path.slice('/pdtf-1/original-standard'.length)}`;
  }
  if (path === '/pdtf-1/extracted-ontology') return PDTF1_ROUTES.extracted;
  if (path.startsWith('/pdtf-1/extracted-ontology/')) {
    return `${PDTF1_ROUTES.extracted}${path.slice('/pdtf-1/extracted-ontology'.length)}`;
  }
  const exact = exactRoutes.get(path);
  if (exact) return exact;
  for (const [source, target] of prefixRoutes) {
    const replacement = replacePrefix(path, source, target);
    if (replacement) return replacement;
  }
  return null;
}

/** True only for documentation URLs removed by this cut, never `/pdtf/**`. */
export function isRetiredPdtf1DocumentationRoute(value) {
  return !isStablePdtfIdentifierRoute(value)
    && (isRetiredPdtf1ManualAlias(value) || getPdtf1ReplacementRoute(value) !== null);
}

/** Preserve the physical filename of moved static ontology HTML outputs. */
export function getPdtf1ReplacementFile(value) {
  const file = String(value || '').replace(/^\/+|\/+$/gu, '');
  if (file === 'pdtf-1') return PDTF1_ROUTES.root.slice(1);
  if (file === 'pdtf-1/original-standard') return PDTF1_ROUTES.original.slice(1);
  if (file.startsWith('pdtf-1/original-standard/')) {
    return `${PDTF1_ROUTES.original.slice(1)}${file.slice('pdtf-1/original-standard'.length)}`;
  }
  if (file === 'pdtf-1/extracted-ontology') return PDTF1_ROUTES.extracted.slice(1);
  if (file.startsWith('pdtf-1/extracted-ontology/')) {
    return `${PDTF1_ROUTES.extracted.slice(1)}${file.slice('pdtf-1/extracted-ontology'.length)}`;
  }
  for (const [source, target] of [
    ['ontology/tools', `${PDTF1_ROUTES.use.slice(1)}/tools`],
    ['ontology/artefacts', `${PDTF1_ROUTES.use.slice(1)}/artefacts`],
  ]) {
    if (file === source) return target;
    if (file.startsWith(`${source}/`)) return `${target}${file.slice(source.length)}`;
  }
  return null;
}

/** Preserve current comment threads while the old reader URL itself returns 404. */
export function getPdtf1LegacyCommentKey(value) {
  const path = normalizePath(value);
  if (path === PDTF1_ROUTES.root) return '/pdtf-1';
  if (path === PDTF1_ROUTES.original) return '/pdtf-1/original-standard';
  if (path === PDTF1_ROUTES.extracted) return '/ontology';
  const intermediateOnly = new Map([
    [PDTF1_ROUTES.lineage, '/pdtf-1/extracted-ontology/lineage-provenance-and-verification'],
    [PDTF1_ROUTES.concepts, '/pdtf-1/extracted-ontology/concepts-and-architecture'],
    [`${PDTF1_ROUTES.concepts}/contexts`, '/pdtf-1/extracted-ontology/concepts-and-architecture/contexts'],
    [PDTF1_ROUTES.terms, '/pdtf-1/extracted-ontology/terms-and-model-resources'],
    [PDTF1_ROUTES.validation, '/pdtf-1/extracted-ontology/validation-and-examples'],
    [PDTF1_ROUTES.trust, '/pdtf-1/extracted-ontology/trust-governance-and-limitations'],
    [PDTF1_ROUTES.use, '/pdtf-1/extracted-ontology/use-and-tooling'],
  ]);
  const intermediate = intermediateOnly.get(path);
  if (intermediate) return intermediate;
  for (const [legacy, canonical] of exactRoutes) {
    if (path === canonical) return legacy;
  }
  for (const [legacy, canonical] of prefixRoutes
    .filter(([source]) => source !== '/manual')
    .sort(([, left], [, right]) => right.length - left.length)) {
    if (path === canonical) return legacy;
    if (path.startsWith(`${canonical}/`)) return `${legacy}${path.slice(canonical.length)}`;
  }
  return path;
}
