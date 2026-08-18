/**
 * Executable information-architecture contract for the SPDTF website.
 *
 * Global destinations describe reader tasks and authority. They deliberately do
 * not replace the existing SECTIONS registry, which continues to own stable
 * routes, local sidebars and previous/next navigation during migration.
 */

export const GLOBAL_DESTINATIONS = Object.freeze([
  { key: 'programme', title: 'Programme', url: '/programme' },
  { key: 'spdtf-2', title: 'SPDTF 2.0 Development', url: '/spdtf-2' },
  { key: 'working-groups', title: 'Working groups', url: '/spdtf-2/working-groups' },
  { key: 'pdtf-1', title: 'PDTF 1.0', url: '/pdtf-1' },
  { key: 'governance', title: 'Governance', url: '/governance' },
  { key: 'resources', title: 'Resources', url: '/resources' },
]);

export const IA_STATUS_FIELDS = Object.freeze([
  'workArea', 'authority', 'maturity', 'version', 'provenance',
]);

/** The third destination is a navigation shortcut, not a second content owner. */
export const DESTINATION_SHORTCUTS = Object.freeze({
  'working-groups': Object.freeze({
    target: '/spdtf-2/working-groups',
    contentOwner: 'spdtf-2',
  }),
});

/** Current and transitional first path segments mapped to one global owner. */
export const ROUTE_FAMILY_OWNERS = Object.freeze({
  programme: 'programme',
  strategy: 'programme',
  'dbt-smart-data': 'programme',
  'spdtf-2': 'spdtf-2',
  v2: 'spdtf-2',
  'working-groups': 'working-groups',
  engagement: 'working-groups',
  presentation: 'working-groups',
  'pdtf-1': 'pdtf-1',
  pdtf: 'pdtf-1',
  modelling: 'pdtf-1',
  model: 'pdtf-1',
  ontology: 'pdtf-1',
  mapping: 'pdtf-1',
  schema: 'pdtf-1',
  implementation: 'pdtf-1',
  adoption: 'pdtf-1',
  governance: 'governance',
  council: 'governance',
  resources: 'resources',
  resource: 'resources',
  library: 'resources',
  glossary: 'resources',
});

export const AUTHORITY_BY_DESTINATION = Object.freeze({
  programme: {
    workArea: 'Cross-programme',
    authority: 'Programme context; source authority remains with each cited body',
    maturity: 'Maintained context',
    version: 'Current programme view',
    provenance: 'OPDA records and attributed external sources',
  },
  'spdtf-2': {
    workArea: 'SPDTF 2.0 development',
    authority: 'Human working groups own domain meaning; governance controls promotion',
    maturity: 'In development — not an adopted standard',
    version: 'Context-owned candidates vary',
    provenance: 'Participant evidence, recognised sources and attributed PDTF 1.0 evidence',
  },
  'working-groups': {
    workArea: 'SPDTF 2.0 development',
    authority: 'Each group charter identifies its decision owner',
    maturity: 'Participation and candidate review',
    version: 'Candidate-specific',
    provenance: 'Participant-supplied and facilitator-maintained records',
  },
  'pdtf-1': {
    workArea: 'PDTF 1.0',
    authority: 'Published schema implementation; each derived child keeps its own status',
    maturity: 'Published implementation with mixed-maturity derived artefacts',
    version: 'PDTF 1.0',
    provenance: 'Committed schemas, dictionaries, documents and derived semantic corpus',
  },
  governance: {
    workArea: 'Cross-programme',
    authority: 'Governance records define decision rights and lifecycle',
    maturity: 'Ratified, practised and proposed rules are distinguished',
    version: 'Decision-specific',
    provenance: 'ADR, ODR, council and governance records',
  },
  resources: {
    workArea: 'Cross-programme',
    authority: 'Evidence registry; listing does not confer standards authority',
    maturity: 'Source-specific',
    version: 'Immutable source or generated-manifest identifier',
    provenance: 'Attributed participant, programme, policy and technical sources',
  },
});

/** Families that must survive the IA migration without information loss. */
export const PRESERVATION_LEDGER = Object.freeze([
  {
    currentPath: '/resources/** and /resource?path=source/**',
    kind: 'source-records',
    expectedCount: 1620,
    owner: 'resources',
    preservedAt: '/resources/**',
    consumers: ['resource viewer', 'source citations', 'downloads'],
    verification: 'path, checksum, provenance, rights and open/download parity',
    disposition: 'preserve',
  },
  {
    currentPath: '/council/** and generated council manifest',
    kind: 'generated-records',
    expectedCount: 261,
    owner: 'governance',
    preservedAt: '/council/**',
    consumers: ['governance decisions', 'raw session evidence', 'ADR and ODR links'],
    verification: 'deterministic generation, manifest and rewritten-link crawl',
    disposition: 'regenerate-equivalently',
  },
  {
    currentPath: '/ontology/artefacts/**',
    kind: 'machine-representations',
    expectedCount: 27,
    owner: 'pdtf-1',
    preservedAt: '/ontology/artefacts/**',
    consumers: ['ontology downloads', 'technical references'],
    verification: 'path and byte/checksum identity',
    disposition: 'preserve',
  },
  {
    currentPath: '/data/**',
    kind: 'generated-data',
    expectedCount: 46,
    minimumCount: 45,
    owner: 'resources',
    preservedAt: '/data/**',
    consumers: ['generated pages', 'client-side data views', 'validation'],
    verification: 'deterministic regeneration, checksum and consumer inventory',
    disposition: 'regenerate-equivalently',
  },
  {
    currentPath: '/v2/**',
    kind: 'SPDTF 2.0 development input',
    owner: 'spdtf-2',
    preservedAt: '/v2/**',
    consumers: ['candidate register', 'immutable seed references', 'legacy links'],
    verification: 'stable route/representation identity and reframe-equivalent context; no duplicate seed',
    disposition: 'reframe-equivalent',
  },
  {
    currentPath: '/pdtf/**, /ontology/tools/** and generated semantic routes',
    kind: 'stable-technical-identifiers',
    owner: 'pdtf-1',
    preservedAt: 'current stable paths',
    consumers: ['linked-data clients', 'implementers', 'search and citations'],
    verification: 'route, representation and fragment crawl',
    disposition: 'preserve',
  },
  {
    currentPath: 'authentication, comments and working-group submissions',
    kind: 'runtime-services',
    owner: 'governance',
    preservedAt: 'existing service endpoints and journeys',
    consumers: ['members', 'reviewers', 'working-group participants'],
    verification: 'dependency, permission, privacy and end-to-end journey tests',
    disposition: 'preserve',
  },
  {
    currentPath: '/ui/** and /images/**',
    kind: 'support-assets',
    owner: 'resources',
    preservedAt: 'verified equivalent asset paths',
    consumers: ['all rendered route families'],
    verification: 'consumer inventory, visual parity and interaction tests',
    disposition: 'preserve',
  },
]);

/**
 * Route-family migration ledger. Entries are deliberately family-level: moving
 * one generated record must not silently omit its siblings or representation.
 */
export const ROUTE_DISPOSITION_LEDGER = Object.freeze([
  ...[
    ['programme', 'programme', 'reframe'],
    ['spdtf-2', 'spdtf-2', 'reframe'],
    ['working-groups', 'working-groups', 'reframe'],
    ['pdtf-1', 'pdtf-1', 'reframe'],
    ['strategy', 'programme', 'reframe'],
    ['governance', 'governance', 'keep'],
    ['dbt-smart-data', 'programme', 'reframe'],
    ['engagement', 'working-groups', 'reframe'],
    ['modelling', 'pdtf-1', 'reframe'],
    ['model', 'pdtf-1', 'reframe'],
    ['v2', 'spdtf-2', 'reframe'],
    ['ontology', 'pdtf-1', 'reframe'],
    ['mapping', 'pdtf-1', 'reframe'],
    ['schema', 'pdtf-1', 'reframe'],
    ['implementation', 'pdtf-1', 'reframe'],
    ['adoption', 'pdtf-1', 'reframe'],
    ['resources', 'resources', 'reframe'],
    ['library', 'resources', 'reframe'],
  ].map(([path, owner, disposition]) => ({
    currentPath: `/${path}/**`, owner, disposition,
    preservedAt: `/${path}/**`, statusSource: 'governance status registry',
  })),
  ...[
    ['/', 'programme', 'reframe'],
    ['/spdtf-2/working-groups/**', 'working-groups', 'reframe'],
    ['/home', 'programme', 'reframe'],
    ['/glossary', 'resources', 'reframe'],
    ['/design-system', 'resources', 'keep'],
    ['/presentation/**', 'working-groups', 'reframe'],
    ['/working-groups/join/**', 'working-groups', 'keep'],
    ['/modelling/property-pack', 'spdtf-2', 'reframe'],
    ['/ontology/datatypes', 'pdtf-1', 'keep'],
    ['/ontology/namespaces', 'pdtf-1', 'keep'],
    ['/resource', 'resources', 'keep'],
    ['/404', 'resources', 'keep'],
    ['/mapping/triplesmaps/**', 'pdtf-1', 'keep'],
    ['/model/information-architecture/**', 'pdtf-1', 'keep'],
    ['/model/concept/**', 'pdtf-1', 'keep'],
    ['/model/logical/**', 'pdtf-1', 'keep'],
    ['/model/physical-database/**', 'pdtf-1', 'keep'],
    ['/model/physical-ontology/**', 'pdtf-1', 'keep'],
    ['/model/physical-relational/**', 'pdtf-1', 'keep'],
    ['/modelling/adr/**', 'governance', 'reframe'],
    ['/modelling/odr/**', 'governance', 'reframe'],
    ['/ontology/category/**', 'pdtf-1', 'keep'],
    ['/ontology/context/**', 'pdtf-1', 'keep'],
    ['/ontology/exemplar/**', 'pdtf-1', 'keep'],
    ['/ontology/profile/**', 'pdtf-1', 'keep'],
    ['/pdtf/**', 'pdtf-1', 'keep'],
    ['/v2/contexts/**', 'spdtf-2', 'reframe'],
    ['/v2/data-dictionary/**', 'spdtf-2', 'reframe'],
    ['/v2/resources/**', 'spdtf-2', 'reframe'],
    ['/v2/shapes/**', 'spdtf-2', 'reframe'],
    ['/v2/vocabularies/**', 'spdtf-2', 'reframe'],
    ['/ontology/artefacts/**', 'pdtf-1', 'keep'],
    ['/ontology/tools/**', 'pdtf-1', 'keep'],
    ['/data/**', 'resources', 'keep'],
    ['/ui/**', 'resources', 'keep'],
    ['/images/**', 'resources', 'keep'],
    ['/council/**', 'governance', 'keep'],
  ].map(([currentPath, owner, disposition]) => ({
    currentPath, owner, disposition, preservedAt: currentPath,
    statusSource: 'governance status registry',
  })),
]);

export function normalizeIaPath(path) {
  const pathname = String(path || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

export function getActiveDestination(path) {
  const normalized = normalizeIaPath(path);
  if (normalized === '/spdtf-2/working-groups'
    || normalized.startsWith('/spdtf-2/working-groups/')) return 'working-groups';
  const segment = normalized.split('/').filter(Boolean)[0];
  return segment ? ROUTE_FAMILY_OWNERS[segment] ?? null : null;
}

/** Content ownership remains SPDTF 2.0 for the working-groups shortcut family. */
export function getContentOwner(path) {
  const active = getActiveDestination(path);
  return DESTINATION_SHORTCUTS[active]?.contentOwner ?? active;
}

const FORBIDDEN_PRIMARY_LABELS = Object.freeze([
  /\bPhase\s+[12]\b/iu,
  /\bPublished\s+baseline\b/iu,
  /\bDevelop\s+SPDTF\b/iu,
  /\bProperty\s+Pack\s+V2\b/iu,
]);

/** Find stale reader-facing vocabulary; immutable historical records may opt out. */
export function findForbiddenIaLabels(text, { historical = false } = {}) {
  if (historical) return [];
  const value = String(text ?? '');
  return FORBIDDEN_PRIMARY_LABELS
    .filter((pattern) => pattern.test(value))
    .map((pattern) => pattern.source);
}

export function validateIaContract() {
  if (GLOBAL_DESTINATIONS.length !== 6) throw new Error('IA requires exactly six destinations');
  const keys = GLOBAL_DESTINATIONS.map(({ key }) => key);
  const labels = GLOBAL_DESTINATIONS.map(({ title }) => title);
  const urls = GLOBAL_DESTINATIONS.map(({ url }) => url);
  for (const [name, values] of [['keys', keys], ['labels', labels], ['URLs', urls]]) {
    if (new Set(values).size !== values.length) throw new Error(`IA ${name} must be unique`);
  }
  for (const destination of GLOBAL_DESTINATIONS) {
    const metadata = AUTHORITY_BY_DESTINATION[destination.key];
    if (!metadata || JSON.stringify(Object.keys(metadata)) !== JSON.stringify(IA_STATUS_FIELDS)) {
      throw new Error(`IA metadata is incomplete for ${destination.key}`);
    }
    if (IA_STATUS_FIELDS.some((field) => typeof metadata[field] !== 'string' || !metadata[field].trim())) {
      throw new Error(`IA metadata contains an empty field for ${destination.key}`);
    }
  }
  const destinationKeys = new Set(keys);
  for (const entry of ROUTE_DISPOSITION_LEDGER) {
    if (!entry.currentPath || !destinationKeys.has(entry.owner)
      || !['keep', 'reframe', 'redirect'].includes(entry.disposition)
      || !entry.preservedAt || !entry.statusSource) {
      throw new Error(`Invalid route disposition: ${entry.currentPath || '(missing path)'}`);
    }
  }
  return true;
}

export function getDestination(key) {
  return GLOBAL_DESTINATIONS.find((destination) => destination.key === key) ?? null;
}
