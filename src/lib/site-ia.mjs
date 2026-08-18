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
    owner: 'resources',
    preservedAt: '/data/**',
    consumers: ['generated pages', 'client-side data views', 'validation'],
    verification: 'deterministic regeneration, checksum and consumer inventory',
    disposition: 'regenerate-equivalently',
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

export function normalizeIaPath(path) {
  const pathname = String(path || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

export function getActiveDestination(path) {
  const segment = normalizeIaPath(path).split('/').filter(Boolean)[0];
  return segment ? ROUTE_FAMILY_OWNERS[segment] ?? null : null;
}

export function getDestination(key) {
  return GLOBAL_DESTINATIONS.find((destination) => destination.key === key) ?? null;
}
