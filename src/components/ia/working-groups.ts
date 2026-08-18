export interface WorkingGroupRecord {
  slug: string;
  name: string;
  kind: 'bounded context' | 'scheme group' | 'peer group';
  scope: string;
  status: string;
  note?: string;
}

export const WORKING_GROUPS: readonly WorkingGroupRecord[] = Object.freeze([
  {
    slug: 'finance-and-banking',
    name: 'Finance and Banking',
    kind: 'bounded context',
    scope: 'Mortgage journey, lending decisions, parties, evidence, risk and finance-data exchange.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'conveyancing',
    name: 'Conveyancing',
    kind: 'bounded context',
    scope: 'Instruction, legal transfer, enquiries, searches, exchange and completion.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'estate-agency',
    name: 'Estate Agency',
    kind: 'bounded context',
    scope: 'Marketing, listings, material information, viewings, offers and seller information.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'surveying-and-valuation',
    name: 'Surveying and Valuation',
    kind: 'bounded context',
    scope: 'Inspection, condition, valuation, professional evidence and property risk.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'property-data-services',
    name: 'Property Data Services',
    kind: 'bounded context',
    scope: 'Registries, searches, authoritative sources, provenance, currency and reuse.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'property-technology',
    name: 'Property Technology',
    kind: 'bounded context',
    scope: 'Platforms, workflow, integration, APIs, implementation and operational feedback.',
    status: 'Scope defined; convening status to be confirmed.',
  },
  {
    slug: 'dbt-smart-data',
    name: 'DBT Smart Data',
    kind: 'scheme group',
    scope: 'Participants, roles, trust, consent, authorisation, accreditation, liability and cross-sector alignment.',
    status: 'OPDA-internal scheme-design scope; government status is not claimed.',
    note: 'This is not a government-established property-scheme body and does not confer statutory or government-approved status on SPDTF.',
  },
  {
    slug: 'interoperability',
    name: 'Interoperability Working Group',
    kind: 'peer group',
    scope: 'Small common boundary, context map, cross-context mappings and shared exchange conventions.',
    status: 'Peer remit defined; representatives and convening status to be confirmed.',
    note: 'Interoperability is a peer of the domain and scheme groups, not a child of one group.',
  },
]);

const requiredSlugs = new Set([
  'finance-and-banking', 'conveyancing', 'estate-agency', 'surveying-and-valuation',
  'property-data-services', 'property-technology', 'dbt-smart-data', 'interoperability',
]);
if (WORKING_GROUPS.length !== requiredSlugs.size || WORKING_GROUPS.some((group) => !requiredSlugs.has(group.slug))) {
  throw new Error('SPDTF working-group registry must contain the exact eight accepted groups');
}

export function getWorkingGroup(slug: string): WorkingGroupRecord | undefined {
  return WORKING_GROUPS.find((group) => group.slug === slug);
}
