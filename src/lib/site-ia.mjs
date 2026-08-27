/**
 * Executable information-architecture contract for the SPDTF website.
 *
 * Global destinations describe reader tasks and authority. They deliberately do
 * not replace the existing SECTIONS route taxonomy. site-navigation.ts
 * composes those stable routes into current sidebars and page sequences.
 */

export const GLOBAL_DESTINATIONS = Object.freeze([
  { key: 'programme', title: 'Programme', url: '/programme' },
  { key: 'governance', title: 'Governance', url: '/governance' },
  { key: 'semantic-modelling', title: 'Semantic modelling', url: '/semantic-modelling' },
  { key: 'spdtf', title: 'SPDTF Development', url: '/spdtf' },
  { key: 'working-groups', title: 'Working groups', url: '/spdtf/working-groups' },
  { key: 'resources', title: 'Resources', url: '/resources' },
]);

const DESTINATION_CARD_DETAILS = Object.freeze({
  programme: {
    audience: 'For programme leaders and new readers',
    description: 'Understand the purpose, current direction, roadmap and policy context for a shared property-data scheme.',
  },
  governance: {
    audience: 'For decision-makers and reviewers',
    description: 'See who can decide, what is under review, and how authority, maturity and lifecycle are recorded.',
  },
  'semantic-modelling': {
    audience: 'For domain experts and ontology learners',
    description: 'Learn why ontologies are used, then follow the evidence-up method, contextual boundaries and mapping approach.',
  },
  spdtf: {
    audience: 'For implementers, stewards and interoperability leads',
    description: 'Review collaborative work products, candidates, open questions, outputs and attributed third-party inputs.',
  },
  'working-groups': {
    audience: 'For contributors and facilitators',
    description: 'Find group scopes, member guidance, contribution routes and the workspaces where domain meaning is reviewed.',
  },
  resources: {
    audience: 'For researchers and auditors',
    description: 'Trace terms, source records, standards, recordings and historical material with their provenance and maturity.',
  },
});

export const GLOBAL_DESTINATION_CARDS = Object.freeze(GLOBAL_DESTINATIONS.map((destination) => Object.freeze({
  ...destination,
  ...DESTINATION_CARD_DETAILS[destination.key],
})));

export const IA_STATUS_FIELDS = Object.freeze([
  'workArea', 'authority', 'maturity', 'version', 'provenance',
]);

export const IA_STATUS_REGISTRY_VERSION = '2026-08-23';

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
  'semantic-modelling': 'semantic-modelling',
  'spdtf': 'spdtf',
  engagement: 'resources',
  presentation: 'working-groups',
  presentations: 'spdtf',
  pdtf: 'spdtf',
  modelling: 'spdtf',
  model: 'spdtf',
  ontology: 'spdtf',
  mapping: 'spdtf',
  schema: 'spdtf',
  implementation: 'spdtf',
  adoption: 'spdtf',
  manual: 'spdtf',
  governance: 'governance',
  council: 'governance',
  resources: 'resources',
  resource: 'resources',
  library: 'resources',
  glossary: 'resources',
});

export const ROUTE_OWNER_OVERRIDES = Object.freeze([
  { pattern: /^\/$/u, owner: 'programme' },
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
  'semantic-modelling': {
    workArea: 'SPDTF semantic modelling',
    authority: 'Human working groups own domain meaning; governance controls promotion',
    maturity: 'Teaching and implementation guidance for work in development',
    version: 'Current modelling method and candidate-specific examples',
    provenance: 'Accepted modelling decisions, participant evidence and attributed technical sources',
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
  workArea: 'SPDTF input · OPDA-derived evidence',
  authority: 'OPDA-produced technical derivation of a third-party PDTF schema input; non-normative, not SPDTF or third-party authored',
  maturity: 'Draft semantic corpus — under review',
  version: 'schema-derived draft',
  provenance: 'OPDA generation from the attributed PDTF schema, dictionary, glossary, documents and recorded derivations',
});

const PDTF_METHOD_STATUS = Object.freeze({
  ...PDTF_DERIVED_DRAFT_STATUS,
  authority: 'Historical modelling record for the OPDA-produced schema-derived ontology; page-level decisions retain their recorded status',
  maturity: 'Mixed-maturity method and working records',
});

const PDTF_MAPPING_STATUS = Object.freeze({
  ...PDTF_DERIVED_DRAFT_STATUS,
  authority: 'OPDA-produced PDTF schema-to-ontology verification evidence; not an SPDTF semantic mapping',
  maturity: 'Implemented verification evidence for a draft semantic corpus',
});

const PDTF_ADOPTION_STATUS = Object.freeze({
  workArea: 'SPDTF input · implementation evidence',
  authority: 'Attributed implementation evidence; it does not establish SPDTF adoption',
  maturity: 'Evidence record — source-specific',
  version: 'PDTF schema evidence',
  provenance: 'Attributed member, pilot, registry and programme sources',
});

/** Route-level exceptions prevent a parent label from overstating child authority. */
export const ROUTE_STATUS_OVERRIDES = Object.freeze([
  {
    pattern: /^\/spdtf\/inputs$/u,
    status: {
      workArea: 'SPDTF inputs',
      authority: 'Curated external inputs; inclusion informs review and does not confer SPDTF authority or adoption',
      maturity: 'Source-specific inputs',
      version: 'Source-specific',
      provenance: 'Attributed external technical and policy sources',
    },
  },
  {
    pattern: /^\/spdtf\/inputs\/pdtf-schema\/schema-derived-ontology\/lineage-provenance-and-verification\/historical-modelling(?:\/|$)/u,
    status: PDTF_METHOD_STATUS,
  },
  {
    pattern: /^\/spdtf\/inputs\/pdtf-schema\/schema-derived-ontology\/lineage-provenance-and-verification\/schema-to-ontology-verification(?:\/|$)/u,
    status: PDTF_MAPPING_STATUS,
  },
  {
    pattern: /^\/spdtf\/inputs\/pdtf-schema\/schema-and-supporting-material\/adoption(?:\/|$)/u,
    status: PDTF_ADOPTION_STATUS,
  },
  {
    pattern: /^\/spdtf\/inputs\/pdtf-schema(?:$|\/schema-and-supporting-material(?:\/|$))/u,
    status: {
      workArea: 'SPDTF input · PDTF schema',
      authority: 'Third-party Digital Property Pack JSON Schema input; inclusion does not confer OPDA endorsement or SPDTF authority',
      maturity: 'Existing schema implementation; supporting artefacts vary',
      version: 'PDTF schema v3.5.0',
      provenance: 'Attributed third-party schemas, overlays, dictionary and glossary; accompanying records retain their own provenance',
    },
  },
  {
    pattern: /^\/spdtf\/inputs\/pdtf-schema\/schema-derived-ontology(?:\/|$)/u,
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
    pattern: /^\/spdtf\/working-groups\/join(?:\/|$)/u,
    status: {
      workArea: 'SPDTF participation',
      authority: 'Expression-of-interest route; registration does not confer membership or decision rights',
      maturity: 'Recruitment and privacy information',
      version: 'Form-specific',
      provenance: 'OPDA participation and privacy records',
    },
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
    currentPath: '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**',
    kind: 'machine-representations',
    expectedCount: 27,
    owner: 'spdtf',
    preservedAt: '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**',
    consumers: ['ontology downloads', 'technical references'],
    verification: 'path and byte/checksum identity',
    checksumSource: 'public/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts',
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
    owner: 'spdtf',
    preservedAt: '/pdtf/** and /spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/**',
    consumers: ['linked-data clients', 'implementers', 'search and citations'],
    verification: 'route, representation and fragment crawl',
    checksumSource: 'dist/pdtf and dist/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling',
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
  const related = owner === 'spdtf' || owner === 'semantic-modelling'
    ? ['pdtf-schema:evidence', 'governance:authority', 'resources:provenance']
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
    ['semantic-modelling', 'semantic-modelling', 'reframe'],
    ['spdtf', 'spdtf', 'reframe'],
    ['presentations', 'spdtf', 'reframe'],
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
    ['/spdtf/inputs/**', 'spdtf', 'reframe'],
    ['/spdtf/inputs/pdtf-schema/**', 'spdtf', 'reframe'],
    ['/glossary', 'resources', 'reframe'],
    ['/search', 'resources', 'keep'],
    ['/design-system', 'resources', 'keep'],
    ['/presentation/**', 'spdtf', 'reframe'],
    ['/spdtf/working-groups/join/**', 'spdtf', 'keep'],
    ['/engagement/meetings-decisions/**', 'governance', 'reframe'],
    ['/engagement/working-groups/**', 'programme', 'reframe'],
    ['/spdtf/property-pack/**', 'spdtf', 'reframe'],
    ['/resource', 'resources', 'keep'],
    ['/404', 'resources', 'keep'],
    ['/modelling/adr/**', 'governance', 'reframe'],
    ['/modelling/odr/**', 'governance', 'reframe'],
    ['/pdtf/**', 'spdtf', 'keep'],
    ['/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**', 'spdtf', 'keep'],
    ['/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/**', 'spdtf', 'keep'],
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

const RETIRED_ROUTE_PATTERNS = Object.freeze([
  /^\/home$/u,
  /^\/working-groups\/join(?:\/|$)/u,
  /^\/spdtf(?:-2)?\/ontologies(?:\/|$)/u,
]);

export function getActiveDestination(path) {
  const normalized = normalizeIaPath(path);
  if (RETIRED_ROUTE_PATTERNS.some((pattern) => pattern.test(normalized))) return null;
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
  if (RETIRED_ROUTE_PATTERNS.some((pattern) => pattern.test(normalized))) return null;
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
  if (RETIRED_ROUTE_PATTERNS.some((pattern) => pattern.test(normalizeIaPath(path)))) return null;
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
  if (GLOBAL_DESTINATIONS.length !== 6) throw new Error('IA requires exactly six global destinations');
  if (GLOBAL_DESTINATION_CARDS.length !== GLOBAL_DESTINATIONS.length) {
    throw new Error('Every global destination requires one shared destination card');
  }
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
  for (const [index, card] of GLOBAL_DESTINATION_CARDS.entries()) {
    const destination = GLOBAL_DESTINATIONS[index];
    if (card.key !== destination.key || card.title !== destination.title || card.url !== destination.url
      || !card.audience || !card.description) {
      throw new Error(`Invalid shared destination card: ${destination.key}`);
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
