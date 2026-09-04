/** Canonical PDTF schema documentation-route hierarchy. */
export const PDTF1_ROUTES = Object.freeze({
  inputRoot: '/development/inputs',
  root: '/development/inputs/pdtf-schema',
  original: '/development/inputs/pdtf-schema/schema-and-supporting-material',
  extracted: '/development/inputs/pdtf-schema/schema-derived-ontology',
  lineage: '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification',
  historicalModelling: '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling',
  schemaVerification: '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification',
  modelViews: '/development/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience',
  concepts: '/development/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture',
  terms: '/development/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources',
  validation: '/development/inputs/pdtf-schema/schema-derived-ontology/validation-and-examples',
  trust: '/development/inputs/pdtf-schema/schema-derived-ontology/trust-governance-and-limitations',
  use: '/development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling',
});

export const PDTF1_ROUTE_MIGRATION = Object.freeze({
  canonicalRoot: PDTF1_ROUTES.root,
  intermediateRoot: '/pdtf-1',
  schemaToSchemeIntermediateRoot: '/pdtf-schema',
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
  sourceReframeRouteCount: 47,
  sourceReframeTotalBlockCount: 6251,
  sourceReframeExactBlockCount: 6132,
  sourceReframeSemanticBlockCount: 119,
  sourceReframeNonInformationBlockCount: 0,
  sourceReframeRoutesSha256: '021f6ab746f1210bea1819266d7102a1a1e63707fb9609416a202a2228116a5c',
  outOfScopeSourceRouteCount: 919,
  outOfScopeSourceRoutesSha256: 'e9c7cfdbabac6c676e0560925d70b627af7d0a50e2d23f18957e1345187cd49c',
  redirects: false,
  stableIdentifierRoot: '/pdtf',
});

/**
 * Fragment identifiers that changed with the Chair-authorised schema-to-scheme
 * route cut. These are explicit replacements, not compatibility aliases: old
 * documentation URLs still return 404 and the live DOM emits only the new IDs.
 */
export const PDTF_SCHEMA_FRAGMENT_REPLACEMENTS = Object.freeze([
  ['-current-scheme-definitive--2026-06-02', '-current-identifier-scheme-definitive--amended-2026-08-22'],
  ['dbt-smart-data-top-level-section--track-the-guidebook-and-the-pdtf-overlap-it-creates', 'dbt-smart-data-implications-for-spdtf-and-pdtf-schema-lineage'],
  ['domain-led-bounded-context-working-groups-for-the-next-modelling-phase', 'domain-led-bounded-context-working-groups-for-spdtf-development'],
  ['legacy', 'identifiers'],
  ['linked-data-model-as-the-foundation-and-direction-of-pdtf-standards-development', 'linked-data-model-as-the-foundation-and-direction-of-spdtf-development'],
  ['organise-the-site-around-spdtf-20-and-pdtf-10', 'organise-the-site-around-spdtf-and-the-pdtf-schema'],
  ['use-the-standard', 'use-the-schema'],
  ['section-nav-group-pdtf-1-adoption', 'section-nav-group-pdtf-schema-usage'],
  ['section-nav-group-pdtf-1-implementation', 'section-nav-group-pdtf-schema-implementation'],
  ['section-nav-group-pdtf-1-mapping', 'section-nav-group-pdtf-schema-mapping'],
  ['section-nav-group-pdtf-1-model', 'section-nav-group-pdtf-schema-model'],
  ['section-nav-group-pdtf-1-modelling', 'section-nav-group-pdtf-schema-modelling'],
  ['section-nav-group-pdtf-1-ontology', 'section-nav-group-pdtf-schema-schema-derived-ontology'],
  ['section-nav-group-pdtf-1-pdtf-1-original-standard', 'section-nav-group-pdtf-schema-schema-and-supporting-material'],
  ['section-nav-group-pdtf-1-schema', 'section-nav-group-pdtf-schema-schema'],
  ['section-nav-ontology-concepts-and-architecture', 'section-nav-pdtf-schema-schema-derived-ontology-concepts-and-architecture'],
  ['section-nav-ontology-lineage-and-verification', 'section-nav-pdtf-schema-schema-derived-ontology-lineage-provenance-and-verification'],
  ['section-nav-ontology-terms-and-model-resources', 'section-nav-pdtf-schema-schema-derived-ontology-terms-and-model-resources'],
  ['section-nav-ontology-trust-and-governance', 'section-nav-pdtf-schema-schema-derived-ontology-trust-governance-and-limitations'],
  ['section-nav-ontology-use-and-tooling', 'section-nav-pdtf-schema-schema-derived-ontology-use-and-tooling'],
  ['section-nav-ontology-validation-and-examples', 'section-nav-pdtf-schema-schema-derived-ontology-validation-and-examples'],
  ['section-nav-model-concept', 'section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-concept'],
  ['section-nav-model-logical', 'section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-logical'],
  ['section-nav-model-physical-database', 'section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-physical-database'],
  ['section-nav-model-physical-ontology', 'section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-physical-ontology'],
  ['section-nav-model-physical-relational', 'section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-physical-relational'],
  ['section-nav-schema-built-form', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-built-form'],
  ['section-nav-schema-built-form-fixtures', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-built-form-fixtures'],
  ['section-nav-schema-built-form-surveys', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-built-form-surveys'],
  ['section-nav-schema-encumbrances', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-encumbrances'],
  ['section-nav-schema-evidence', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-evidence'],
  ['section-nav-schema-legal-estate', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate'],
  ['section-nav-schema-legal-estate-ownership', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership'],
  ['section-nav-schema-legal-estate-ownership-leasehold', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership-leasehold'],
  ['section-nav-schema-legal-estate-ownership-leasehold-lease-charges', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership-leasehold-lease-charges'],
  ['section-nav-schema-legal-estate-ownership-leasehold-lease-legal', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership-leasehold-lease-legal'],
  ['section-nav-schema-legal-estate-ownership-leasehold-lease-misc', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership-leasehold-lease-misc'],
  ['section-nav-schema-legal-estate-ownership-managed', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-ownership-managed'],
  ['section-nav-schema-legal-estate-title', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-title'],
  ['section-nav-schema-legal-estate-title-oc-summary', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-legal-estate-title-oc-summary'],
  ['section-nav-schema-local-context', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-local-context'],
  ['section-nav-schema-local-context-con29r', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-local-context-con29r'],
  ['section-nav-schema-local-context-con29r-searches', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-local-context-con29r-searches'],
  ['section-nav-schema-local-context-environmental', 'section-nav-pdtf-schema-schema-and-supporting-material-schema-local-context-environmental'],
  ['pdtf-10-to-property-pack-crosswalk', 'pdtf-schema-to-property-pack-crosswalk'],
  ['treat-the-property-pack-ontology-as-an-accelerated-spdtf-20-component', 'treat-the-property-pack-ontology-as-an-accelerated-spdtf-component'],
  ['continuation', 'progression'],
  ...['section-nav-group-spdtf-2-spdtf-2', 'section-nav-group-spdtf-2-spdtf-2-ontologies',
    'section-nav-group-spdtf-2-spdtf-2-property-pack',
    'section-nav-spdtf-2-ontologies-modelling-method', 'section-nav-spdtf-2-ontologies-why-ontologies',
    'section-nav-spdtf-2-property-pack-contexts', 'section-nav-spdtf-2-property-pack-coverage',
    'section-nav-spdtf-2-property-pack-model'].map((source) => [source, source.replaceAll('spdtf-2', 'spdtf')]),
  ...['section-nav-group-working-groups-spdtf-2-working-groups',
    'section-nav-spdtf-2-working-groups-conveyancing', 'section-nav-spdtf-2-working-groups-dbt-smart-data',
    'section-nav-spdtf-2-working-groups-estate-agency',
    'section-nav-spdtf-2-working-groups-finance-and-banking',
    'section-nav-spdtf-2-working-groups-interoperability',
    'section-nav-spdtf-2-working-groups-property-data-services',
    'section-nav-spdtf-2-working-groups-property-technology',
    'section-nav-spdtf-2-working-groups-surveying-and-valuation']
    .map((source) => [source, source.replaceAll('spdtf-2', 'spdtf')]),
  ['section-nav-group-governance-modelling-adr', 'section-nav-governance-modelling-adr'],
  ['section-nav-group-governance-modelling-odr', 'section-nav-governance-modelling-odr'],
].map((entry) => Object.freeze(entry)));

const fragmentReplacements = new Map(PDTF_SCHEMA_FRAGMENT_REPLACEMENTS);

export function getPdtfSchemaFragmentReplacement(fragment) {
  return fragmentReplacements.get(String(fragment)) ?? null;
}

export function fragmentsPreservedByPdtfSchemaMigration(sourceFragments, acceptedFragments) {
  const accepted = new Set(acceptedFragments ?? []);
  return (sourceFragments ?? []).every((fragment) => accepted.has(fragment)
    || accepted.has(getPdtfSchemaFragmentReplacement(fragment)));
}

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

function replacePrefix(path, source, target) {
  if (path === source) return target;
  return path.startsWith(`${source}/`) ? `${target}${path.slice(source.length)}` : null;
}

const PDTF_SCHEMA_INTERMEDIATE_ROOT = '/pdtf-schema';

/** Move only the former PDTF-schema documentation cut into SPDTF inputs. */
export function getPdtfSchemaInputReplacementRoute(value) {
  const path = normalizePath(value);
  return replacePrefix(path, PDTF_SCHEMA_INTERMEDIATE_ROOT, PDTF1_ROUTES.root);
}

/** Reverse the current input cut for source-cut receipts and comment identity. */
export function getPdtfSchemaInputSourceRoute(value) {
  const path = normalizePath(value);
  return replacePrefix(path, PDTF1_ROUTES.root, PDTF_SCHEMA_INTERMEDIATE_ROOT);
}

/** `/manual/**` was a zero-information redirect family and is not reminted. */
export function isRetiredPdtf1ManualAlias(value) {
  const path = normalizePath(value);
  return path === '/manual' || path.startsWith('/manual/');
}

/** `/pdtf/**` is the separately governed ontology identifier/representation family. */
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
  const currentInputRoute = getPdtfSchemaInputReplacementRoute(path);
  if (currentInputRoute) return currentInputRoute;
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

/**
 * Reconstruct the schema-v8 destination before the final input-hosting cut.
 * This is intentionally separate from the current public route resolver.
 */
export function getPdtf1IntermediateReplacementRoute(value) {
  const replacement = getPdtf1ReplacementRoute(value);
  return replacement ? getPdtfSchemaInputSourceRoute(replacement) ?? replacement : null;
}

/** True only for documentation URLs removed by this cut, never `/pdtf/**`. */
export function isRetiredPdtf1DocumentationRoute(value) {
  return !isStablePdtfIdentifierRoute(value)
    && (isRetiredPdtf1ManualAlias(value) || getPdtf1ReplacementRoute(value) !== null);
}

/** Preserve the physical filename of moved static ontology HTML outputs. */
export function getPdtf1ReplacementFile(value) {
  const file = String(value || '').replace(/^\/+|\/+$/gu, '');
  if (file === 'pdtf-schema') return PDTF1_ROUTES.root.slice(1);
  if (file.startsWith('pdtf-schema/')) {
    return `${PDTF1_ROUTES.root.slice(1)}${file.slice('pdtf-schema'.length)}`;
  }
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

/** Preserve the schema-v8 file projection before moving it below SPDTF inputs. */
export function getPdtf1IntermediateReplacementFile(value) {
  const replacement = getPdtf1ReplacementFile(value);
  if (!replacement) return null;
  const source = getPdtfSchemaInputSourceRoute(`/${replacement}`);
  return source?.slice(1) ?? replacement;
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

/** Resolve comment identity for the schema-v8 route before the input-hosting cut. */
export function getPdtfSchemaInputLegacyCommentKey(value) {
  const intermediate = getPdtfSchemaInputSourceRoute(value);
  if (!intermediate) return normalizePath(value);
  const currentEquivalent = `${PDTF1_ROUTES.root}${intermediate.slice(PDTF_SCHEMA_INTERMEDIATE_ROOT.length)}`;
  return getPdtf1LegacyCommentKey(currentEquivalent);
}
