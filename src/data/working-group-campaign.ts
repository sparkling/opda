export interface WorkingGroupContext {
  value: string;
  label: string;
  scope: string;
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
  },
  {
    value: 'conveyancing',
    label: 'Conveyancing',
    scope: 'The legal transfer of property, including title, searches, enquiries and completion.',
  },
  {
    value: 'estate-agency',
    label: 'Estate Agency',
    scope: 'Marketing, listing, negotiation and the progression of a sale.',
  },
  {
    value: 'surveying-and-valuation',
    label: 'Surveying and Valuation',
    scope: 'Property condition, measurement, inspection, valuation and professional opinion.',
  },
  {
    value: 'property-data-services',
    label: 'Property Data Services',
    scope: 'The sourcing, assurance, exchange and interpretation of property information.',
  },
  {
    value: 'property-technology',
    label: 'Property Technology',
    scope: 'Products, platforms and integrations that support the property journey.',
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
    label: 'Review draft definitions and proposals',
    description: 'Challenge definitions, examples and assumptions in clear, human-readable drafts.',
  },
  {
    value: 'test-schemas-and-integrations',
    label: 'Test practical outputs',
    description: 'Check whether proposed guidance and data outputs work with familiar forms, services and systems.',
  },
  {
    value: 'represent-commercial-interests',
    label: 'Represent commercial interests',
    description: 'Explain commercial needs, opportunities, costs and implementation impacts for organisations operating across the property market.',
  },
  {
    value: 'represent-public-interests',
    label: 'Represent public interests',
    description: 'Bring consumer, accessibility, regulatory and wider public-interest perspectives so proposals account for people, obligations and potential harms.',
  },
];
