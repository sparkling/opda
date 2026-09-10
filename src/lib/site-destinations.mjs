/** Canonical content destinations and the primary navigation order. */
export const GLOBAL_DESTINATIONS = Object.freeze([
  { key: 'programme', title: 'Programme', url: '/programme' },
  { key: 'governance', title: 'Governance', url: '/governance' },
  { key: 'semantic-modelling', title: 'Modelling', url: '/semantic-modelling' },
  { key: 'spdtf', title: 'Development', url: '/development' },
  { key: 'working-groups', title: 'Groups', url: '/development/working-groups' },
  { key: 'resources', title: 'Resources', url: '/resources' },
  { key: 'marketing', title: 'Marketing', url: '/marketing' },
]);

/** Search remains a utility after the seven content destinations. */
export const GLOBAL_NAVIGATION_ITEMS = Object.freeze([
  ...GLOBAL_DESTINATIONS,
  Object.freeze({ key: 'search', title: 'Search', url: '/search' }),
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
  marketing: {
    audience: 'For members, partners and prospective contributors',
    description: 'Use approved promotion and recruitment materials without treating campaign copy as standards authority.',
  },
});

export const GLOBAL_DESTINATION_CARDS = Object.freeze(GLOBAL_DESTINATIONS.map((destination) => Object.freeze({
  ...destination,
  ...DESTINATION_CARD_DETAILS[destination.key],
})));

export const IA_STATUS_FIELDS = Object.freeze([
  'workArea', 'authority', 'maturity', 'version', 'provenance',
]);

/** Default authority metadata for each canonical destination. */
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
  spdtf: {
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
  marketing: {
    workArea: 'Cross-programme recruitment and communications',
    authority: 'Approved recruitment and communication material; it does not confer standards authority',
    maturity: 'Maintained campaign toolkit',
    version: 'Campaign-specific',
    provenance: 'OPDA engagement materials and accepted recruitment decisions',
  },
});
