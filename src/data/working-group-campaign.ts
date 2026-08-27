export interface WorkingGroupContext {
  value: string;
  label: string;
  scope: string;
  localTerm: string;
  definition: string;
  heading: string;
  explanation: string;
}

export interface ContributionOption {
  value: string;
  label: string;
  description: string;
}

export const workingGroupContexts: WorkingGroupContext[] = [
  {
    value: 'finance-and-banking',
    label: 'Finance and Banking',
    scope: 'Mortgage advice, lending decisions, security, affordability and the systems that support them.',
    localTerm: 'Mortgage security',
    definition: 'An asset assessed for lending, affordability and risk.',
    heading: 'Property becomes security for lending',
    explanation: 'Value, affordability, eligibility and risk determine how the property supports a mortgage.',
  },
  {
    value: 'conveyancing',
    label: 'Conveyancing',
    scope: 'The legal transfer of property, including title, searches, enquiries and completion.',
    localTerm: 'Legal title',
    definition: 'Rights, restrictions and the asset being transferred.',
    heading: 'Property becomes a legal interest',
    explanation: 'Title, parties, searches, enquiries and completion need their own precise meaning.',
  },
  {
    value: 'estate-agency',
    label: 'Estate Agency',
    scope: 'Marketing, listing, negotiation and the progression of a sale.',
    localTerm: 'Listing',
    definition: 'A place to market, price and negotiate.',
    heading: 'Property means something marketable',
    explanation: 'Descriptions, asking price, tenure and readiness for sale shape the view.',
  },
  {
    value: 'surveying-and-valuation',
    label: 'Surveying and Valuation',
    scope: 'Property condition, measurement, inspection, valuation and professional opinion.',
    localTerm: 'Subject asset',
    definition: 'Condition, measurement and professional opinion.',
    heading: 'Property becomes an object of inspection and value',
    explanation: 'The facts that matter shift again when condition, risk and valuation enter the journey.',
  },
  {
    value: 'property-data-services',
    label: 'Property Data Services',
    scope: 'The sourcing, assurance, exchange and interpretation of property information.',
    localTerm: 'Evidence',
    definition: 'Sourced information with provenance and assurance.',
    heading: 'Property becomes a body of sourced evidence',
    explanation: 'Coverage, provenance, quality and permissions determine whether information can be trusted.',
  },
  {
    value: 'property-technology',
    label: 'Property Technology',
    scope: 'Products, platforms and integrations that support the property journey.',
    localTerm: 'Resource',
    definition: 'Structured meaning ready for products and integrations.',
    heading: 'Property becomes something systems must exchange',
    explanation: 'Products need stable identifiers, schemas, validation and mappings to make the journey work.',
  },
];

export const contributionOptions: ContributionOption[] = [
  {
    value: 'share-source-material',
    label: 'Share authorised source material',
    description: 'Existing glossaries, schemas, forms, guidance or other evidence that your organisation is entitled to share.',
  },
  {
    value: 'explain-domain-language-and-rules',
    label: 'Explain domain language and rules',
    description: 'Help us understand what terms mean in practice and where context changes their meaning.',
  },
  {
    value: 'review-model-candidates',
    label: 'Review model candidates',
    description: 'Challenge definitions, relationships and assumptions in clear, human-readable drafts.',
  },
  {
    value: 'test-schemas-and-integrations',
    label: 'Test schemas and integrations',
    description: 'Try familiar generated outputs and tell us whether they work in real implementations.',
  },
  {
    value: 'contribute-consumer-accessibility-regulatory-public-interest-experience',
    label: 'Contribute consumer, accessibility, regulatory or public-interest experience',
    description: 'Help identify exclusions, harms, obligations and needs that a technical model might otherwise miss.',
  },
];
