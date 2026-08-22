/**
 * Executable information-architecture contract for the SPDTF website.
 *
 * Global destinations describe reader tasks and authority. They deliberately do
 * not replace the existing SECTIONS route taxonomy. site-navigation.ts
 * composes those stable routes into current sidebars and page sequences.
 */

export const GLOBAL_DESTINATIONS = Object.freeze([
  { key: 'programme', title: 'Programme', url: '/programme' },
  { key: 'spdtf', title: 'SPDTF', url: '/spdtf' },
  { key: 'working-groups', title: 'Working groups', url: '/spdtf/working-groups' },
  { key: 'pdtf-schema', title: 'PDTF schema', url: '/pdtf-schema' },
  { key: 'governance', title: 'Governance', url: '/governance' },
  { key: 'resources', title: 'Resources', url: '/resources' },
]);

export const IA_STATUS_FIELDS = Object.freeze([
  'workArea', 'authority', 'maturity', 'version', 'provenance',
]);

export const IA_STATUS_REGISTRY_VERSION = '2026-08-22';

export const DESTINATION_SHORTCUTS = Object.freeze({
  'working-groups': Object.freeze({
    target: '/spdtf/working-groups',
    contentOwner: 'spdtf',
  }),
});

export const ROUTE_FAMILY_OWNERS = Object.freeze({
  programme: 'programme',
  strategy: 'programme',
  'dbt-smart-data': 'programme',
  'spdtf': 'spdtf',
  'working-groups': 'working-groups',
  engagement: 'resources',
  presentation: 'working-groups',
  presentations: 'spdtf',
  'pdtf-schema': 'pdtf-schema',
  pdtf: 'pdtf-schema',
  modelling: 'pdtf-schema',
  model: 'pdtf-schema',
  ontology: 'pdtf-schema',
  mapping: 'pdtf-schema',
  schema: 'pdtf-schema',
  implementation: 'pdtf-schema',
  adoption: 'pdtf-schema',
  manual: 'pdtf-schema',
  governance: 'governance',
  council: 'governance',
  resources: 'resources',
  resource: 'resources',
  library: 'resources',
  glossary: 'resources',
});

export const ROUTE_OWNER_OVERRIDES = Object.freeze([
  { pattern: /^\/$/u, owner: 'programme' },
  { pattern: /^\/home$/u, owner: 'programme' },
  { pattern: /^\/(?:search|design-system|404)$/u, owner: 'resources' },
  { pattern: /^\/modelling\/(?:adr|odr)(?:\/|$)/u, owner: 'governance' },
  { pattern: /^\/engagement\/meetings-decisions(?:\/|$)/u, owner: 'governance' },
  { pattern: /^\/engagement\/working-groups(?:\/|$)/u, owner: 'programme' },
]);

export const AUTHORITY_BY_DESTINATION = Object.freeze({
  programme: {
    workArea: 'Cross-programme',
    authority: 'Programme context; source authority remains with each cited body',
    maturity: 'Maintained context',
    version: 'Current programme view',
    provenance: 'OPDA records and attributed external sources',
  },
  'spdtf': {
    workArea: 'SPDTF',
    authority: 'Human working groups own domain meaning; governance controls promotion',
    maturity: 'In development — not an adopted standard',
    version: 'Context-owned candidates vary',
    provenance: 'Participant evidence, recognised sources and attributed PDTF schema evidence',
  },
  'working-groups': {
    workArea: 'SPDTF',
    authority: 'Each group charter identifies its decision owner',
    maturity: 'Participation and candidate review',
    version: 'Candidate-specific',
    provenance: 'Participant-supplied and facilitator-maintained records',
  },
  'pdtf-schema': {
    workArea: 'PDTF schema',
    authority: 'Existing Digital Property Pack schema; supporting and derived artefacts keep their own status',
    maturity: 'Existing schema with mixed-maturity supporting and derived artefacts',
    version: 'PDTF schema v3.5.0',
    provenance: 'Committed JSON Schemas, overlays, dictionary, glossary and separately derived semantic corpus',
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

const PDTF_DERIVED_DRAFT_STATUS = Object.freeze({
  workArea: 'PDTF schema',
  authority: 'Semantic artefact derived from the PDTF schema; not an endorsed scheme',
  maturity: 'Draft semantic corpus — under review',
  version: 'schema-derived draft',
  provenance: 'PDTF schema, dictionary, glossary, documents and recorded derivations',
});

const PDTF_METHOD_STATUS = Object.freeze({
  ...PDTF_DERIVED_DRAFT_STATUS,
  authority: 'Historical PDTF schema modelling record; page-level decisions retain their recorded status',
  maturity: 'Mixed-maturity method and working records',
});

const PDTF_MAPPING_STATUS = Object.freeze({
  ...PDTF_DERIVED_DRAFT_STATUS,
  authority: 'PDTF schema-to-ontology verification evidence; not an SPDTF semantic mapping',
  maturity: 'Implemented verification evidence for a draft semantic corpus',
});

const PDTF_ADOPTION_STATUS = Object.freeze({
  workArea: 'PDTF schema',
  authority: 'Attributed implementation evidence; it does not establish SPDTF adoption',
  maturity: 'Evidence record — source-specific',
  version: 'PDTF schema evidence',
  provenance: 'Attributed member, pilot, registry and programme sources',
});

/** Route-level exceptions prevent a parent label from overstating child authority. */
export const ROUTE_STATUS_OVERRIDES = Object.freeze([
  {
    pattern: /^\/pdtf-schema\/schema-and-supporting-material$/u,
    status: {
      workArea: 'PDTF schema',
      authority: 'Gateway to the existing Digital Property Pack JSON Schema and status-labelled supporting records',
      maturity: 'Existing schema implementation; supporting artefacts vary',
      version: 'PDTF schema v3.5.0',
      provenance: 'Committed schemas, overlays, dictionaries, glossary and attributed implementation evidence',
    },
  },
  {
    pattern: /^\/pdtf-schema\/schema-derived-ontology\/lineage-provenance-and-verification\/historical-modelling(?:\/|$)/u,
    status: PDTF_METHOD_STATUS,
  },
  {
    pattern: /^\/pdtf-schema\/schema-derived-ontology\/lineage-provenance-and-verification\/schema-to-ontology-verification(?:\/|$)/u,
    status: PDTF_MAPPING_STATUS,
  },
  {
    pattern: /^\/pdtf-schema\/schema-and-supporting-material\/adoption(?:\/|$)/u,
    status: PDTF_ADOPTION_STATUS,
  },
  {
    pattern: /^\/pdtf-schema\/schema-derived-ontology(?:\/|$)/u,
    status: PDTF_DERIVED_DRAFT_STATUS,
  },
  {
    pattern: /^\/spdtf\/property-pack(?:\/|$)/u,
    status: {
      workArea: 'SPDTF · Property Pack ontology',
      authority: 'Machine-generated candidate; Technical Working Group determination pending',
      maturity: 'Non-normative candidate under accelerated technical review',
      version: '0.1.0-draft candidate cut',
      provenance: 'Property Pack definition, attributed PDTF schema evidence and generated semantic model',
    },
  },
  {
    pattern: /^\/modelling\/(?:adr|odr)(?:\/|$)/u,
    status: AUTHORITY_BY_DESTINATION.governance,
  },
  {
    pattern: /^\/pdtf(?:\/|$)/u,
    status: PDTF_DERIVED_DRAFT_STATUS,
  },
  {
    pattern: /^\/spdtf\/working-groups\/member-guide(?:\/|$)/u,
    status: {
      workArea: 'SPDTF participation',
      authority: 'Operational guidance derived from accepted participation and workspace decisions; group-specific invitations and charters control access',
      maturity: 'Current member guidance; proposed modelling and lifecycle rules are labelled',
      version: 'Member guide 2026-08-21',
      provenance: 'Accepted ADR-0063, ADR-0069, ADR-0070 and ADR-0072; proposed ADR-0065 and ADR-0068 where identified',
    },
  },
  {
    pattern: /^\/spdtf\/working-groups(?:\/|$)/u,
    status: {
      workArea: 'SPDTF',
      authority: 'Workspace scope only; a convened group and its recorded decision owner govern domain meaning',
      maturity: 'Scope defined; convening status unconfirmed',
      version: 'Workspace contract 1.0; no candidate version',
      provenance: 'Accepted IA, working-group roster and explicitly labelled future records',
    },
  },
  {
    pattern: /^\/presentations?(?:\/|$)/u,
    status: {
      workArea: 'SPDTF',
      authority: 'Facilitation material; participant review and governance records control decisions',
      maturity: 'Workshop presentation — not a candidate or standard',
      version: 'Presentation-specific',
      provenance: 'Accepted IA, attributed programme evidence and presentation source',
    },
  },
  {
    pattern: /^\/working-groups\/join(?:\/|$)/u,
    status: {
      workArea: 'SPDTF',
      authority: 'Expression-of-interest route; registration does not confer membership or decision rights',
      maturity: 'Recruitment and privacy information',
      version: 'Form-specific',
      provenance: 'OPDA participation and privacy records',
    },
  },
]);

/** Families that must survive the IA migration without information loss. */
export const PRESERVATION_LEDGER = Object.freeze([
  {
    currentPath: '/resources/** and /resource?path=source/**',
    kind: 'source-records',
    expectedCount: 1620, // exact archive; 848 allowlisted public entries are independently checked below
    indexedCount: 848,
    owner: 'resources',
    preservedAt: '/resources/**',
    consumers: ['resource viewer', 'source citations', 'downloads'],
    verification: 'path, checksum, provenance, rights and open/download parity',
    checksumSource: 'src/data/resources-manifest.json',
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
    checksumSource: 'src/data/council-manifest.json',
    disposition: 'regenerate-equivalently',
  },
  {
    currentPath: '/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**',
    kind: 'machine-representations',
    expectedCount: 27,
    owner: 'pdtf-schema',
    preservedAt: '/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**',
    consumers: ['ontology downloads', 'technical references'],
    verification: 'path and byte/checksum identity',
    checksumSource: 'public/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts',
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
    checksumSource: 'public/data',
    disposition: 'regenerate-equivalently',
  },
  {
    currentPath: 'former /v2/** and /modelling/property-pack',
    kind: 'Property Pack route migration',
    owner: 'spdtf',
    preservedAt: '/spdtf/property-pack/**',
    consumers: ['Technical Working Group review', 'candidate register', 'source catalogue', 'ontology reference'],
    verification: 'old-to-new route, information-block, fragment and comment-identity receipts; old paths absent',
    checksumSource: 'source/03-standards/ontology-candidates/property-pack/0.1/candidate-manifest.json',
    disposition: 'reframe-equivalent',
  },
  {
    currentPath: '/pdtf/** and canonical PDTF schema generated semantic routes',
    kind: 'stable-technical-identifiers',
    owner: 'pdtf-schema',
    preservedAt: '/pdtf/** and /pdtf-schema/schema-derived-ontology/use-and-tooling/**',
    consumers: ['linked-data clients', 'implementers', 'search and citations'],
    verification: 'route, representation and fragment crawl',
    checksumSource: 'dist/pdtf and dist/pdtf-schema/schema-derived-ontology/use-and-tooling',
    disposition: 'preserve',
  },
  {
    currentPath: 'authentication, comments and working-group submissions',
    kind: 'runtime-services',
    owner: 'governance',
    preservedAt: 'existing service endpoints and journeys',
    consumers: ['members', 'reviewers', 'working-group participants'],
    endpoints: ['/api/auth/**', '/api/working-group-interest', 'comments service'],
    verification: 'dependency, permission, privacy and end-to-end journey tests',
    checksumSource: 'implementation and infrastructure tests',
    disposition: 'preserve',
  },
  {
    currentPath: '/ui/** and /images/**',
    kind: 'support-assets',
    owner: 'resources',
    preservedAt: 'verified equivalent asset paths',
    consumers: ['all rendered route families'],
    verification: 'consumer inventory, visual parity and interaction tests',
    checksumSource: 'public/ui and public/images',
    disposition: 'preserve',
  },
]);

/**
 * Route-family migration ledger. Entries are deliberately family-level: moving
 * one generated record must not silently omit its siblings or representation.
 */
function routeDisposition(currentPath, owner, disposition, preservedAt = currentPath) {
  const related = owner === 'spdtf'
    ? ['pdtf-schema:evidence', 'governance:authority', 'resources:provenance']
    : owner === 'pdtf-schema'
      ? ['spdtf:input-or-comparison', 'governance:status']
      : [`${owner}:canonical-owner`];
  return Object.freeze({
    currentPath,
    owner,
    disposition,
    preservedAt,
    statusSource: `IA status registry ${IA_STATUS_REGISTRY_VERSION}`,
    governanceOwner: AUTHORITY_BY_DESTINATION[owner].authority,
    consumers: Object.freeze(['readers', 'deep links', 'search and citations']),
    endpoints: Object.freeze([preservedAt]),
    crossWorkArea: Object.freeze(related),
    checksumPolicy: disposition === 'redirect' ? 'semantic-equivalence receipt' : 'route crawl and content manifest',
    search: Object.freeze({
      workArea: AUTHORITY_BY_DESTINATION[owner].workArea,
      historicalAliases: owner === 'spdtf' ? ['PDTF'] : [],
    }),
  });
}

export const ROUTE_DISPOSITION_LEDGER = Object.freeze([
  ...[
    ['programme', 'programme', 'reframe'],
    ['spdtf', 'spdtf', 'reframe'],
    ['working-groups', 'spdtf', 'reframe'],
    ['presentations', 'spdtf', 'reframe'],
    ['pdtf-schema', 'pdtf-schema', 'reframe'],
    ['strategy', 'programme', 'reframe'],
    ['governance', 'governance', 'keep'],
    ['dbt-smart-data', 'programme', 'reframe'],
    ['engagement', 'resources', 'reframe'],
    ['resources', 'resources', 'reframe'],
    ['library', 'resources', 'reframe'],
  ].map(([path, owner, disposition]) => routeDisposition(`/${path}/**`, owner, disposition)),
  ...[
    ['/', 'programme', 'reframe'],
    ['/spdtf/working-groups/**', 'spdtf', 'reframe'],
    ['/home', 'programme', 'reframe'],
    ['/glossary', 'resources', 'reframe'],
    ['/search', 'resources', 'keep'],
    ['/design-system', 'resources', 'keep'],
    ['/presentation/**', 'spdtf', 'reframe'],
    ['/working-groups/join/**', 'spdtf', 'keep'],
    ['/engagement/meetings-decisions/**', 'governance', 'reframe'],
    ['/engagement/working-groups/**', 'programme', 'reframe'],
    ['/spdtf/property-pack/**', 'spdtf', 'reframe'],
    ['/resource', 'resources', 'keep'],
    ['/404', 'resources', 'keep'],
    ['/modelling/adr/**', 'governance', 'reframe'],
    ['/modelling/odr/**', 'governance', 'reframe'],
    ['/pdtf/**', 'pdtf-schema', 'keep'],
    ['/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**', 'pdtf-schema', 'keep'],
    ['/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/**', 'pdtf-schema', 'keep'],
    ['/data/**', 'resources', 'keep'],
    ['/ui/**', 'resources', 'keep'],
    ['/images/**', 'resources', 'keep'],
    ['/council/**', 'governance', 'keep'],
  ].map(([currentPath, owner, disposition]) => routeDisposition(currentPath, owner, disposition)),
]);

export function normalizeIaPath(path) {
  const pathname = String(path || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

export function getActiveDestination(path) {
  const normalized = normalizeIaPath(path);
  if (normalized === '/spdtf/working-groups'
    || normalized.startsWith('/spdtf/working-groups/')) return 'working-groups';
  const override = ROUTE_OWNER_OVERRIDES.find(({ pattern }) => pattern.test(normalized));
  if (override) return override.owner;
  const segment = normalized.split('/').filter(Boolean)[0];
  return segment ? ROUTE_FAMILY_OWNERS[segment] ?? null : null;
}

/** Content ownership remains SPDTF for the working-groups shortcut family. */
export function getContentOwner(path) {
  const active = getActiveDestination(path);
  return DESTINATION_SHORTCUTS[active]?.contentOwner ?? active;
}

export function getRouteStatus(path) {
  const normalized = normalizeIaPath(path);
  const override = ROUTE_STATUS_OVERRIDES.find(({ pattern }) => pattern.test(normalized));
  if (override) return override.status;
  const owner = getActiveDestination(normalized);
  return AUTHORITY_BY_DESTINATION[owner] ?? AUTHORITY_BY_DESTINATION.resources;
}

function ledgerPatternMatches(pattern, path) {
  const normalized = normalizeIaPath(path);
  if (pattern === normalized) return true;
  if (pattern.endsWith('/**')) {
    const base = pattern.slice(0, -3);
    return normalized === base || normalized.startsWith(`${base}/`);
  }
  return false;
}

export function getRouteDisposition(path) {
  const matches = ROUTE_DISPOSITION_LEDGER.filter((entry) => ledgerPatternMatches(entry.currentPath, path));
  return matches.sort((a, b) => b.currentPath.length - a.currentPath.length)[0] ?? null;
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
      || !entry.preservedAt || !entry.statusSource || !entry.governanceOwner
      || !entry.consumers?.length || !entry.endpoints?.length || !entry.crossWorkArea?.length
      || !entry.checksumPolicy || !entry.search?.workArea) {
      throw new Error(`Invalid route disposition: ${entry.currentPath || '(missing path)'}`);
    }
  }
  for (const entry of PRESERVATION_LEDGER) {
    if (!entry.checksumSource || !entry.consumers?.length || !entry.verification) {
      throw new Error(`Incomplete preservation record: ${entry.currentPath}`);
    }
  }
  return true;
}

export function getDestination(key) {
  return GLOBAL_DESTINATIONS.find((destination) => destination.key === key) ?? null;
}
