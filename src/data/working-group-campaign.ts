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

export interface CampaignCard {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  darkImage?: string;
  href?: string;
  linkLabel?: string;
  registerContext?: string;
}

export const motivationCards: CampaignCard[] = [
  { eyebrow: 'Commercial operators', title: 'Protect the operating reality', description: 'Bring the costs, incentives, supplier dependencies and implementation pressures that a proposal must understand to be viable.' },
  { eyebrow: 'Professionals', title: 'Make practice workable', description: 'Help ensure definitions, evidence and processes reflect real cases—not only the straightforward ones on paper.' },
  { eyebrow: 'Technology and data teams', title: 'Build for the systems people use', description: 'Test whether new information can be exchanged reliably, proportionately and affordably across existing services.' },
  { eyebrow: 'Public-interest voices', title: 'Design in trust and inclusion', description: 'Make consumer outcomes, accessibility, safeguards and non-digital needs visible from the beginning.' },
];

export const policyCards: CampaignCard[] = [
  { eyebrow: 'Direction', title: 'Home-buying reform and Smart Data policy are moving forward.' },
  { eyebrow: 'Opportunity', title: 'Property-specific rules and standards are still being explored.' },
  { eyebrow: 'Role', title: 'Working groups test what will be useful, proportionate and trusted.' },
];

export const participationCards: CampaignCard[] = [
  { eyebrow: '01', title: 'Define what matters', description: 'Make the language, evidence and outcomes that matter in your field clear.' },
  { eyebrow: '02', title: 'Review the proposal', description: 'Check draft definitions, examples and questions against everyday practice.' },
  { eyebrow: '03', title: 'Challenge weak assumptions', description: 'Identify missing rules, hidden costs, edge cases and unintended consequences.' },
  { eyebrow: '04', title: 'Test a practical result', description: 'Tell us whether future guidance, data outputs and services make sense in real work.' },
];

export const evidenceCards: CampaignCard[] = [
  { eyebrow: 'Practice', title: 'Explain the real meaning', description: 'Make language, rules and exceptions visible beyond your field.' },
  { eyebrow: 'Commercial reality', title: 'Surface the trade-offs', description: 'Make sure cost, operational impact and incentives are part of the conversation.' },
  { eyebrow: 'Public interest', title: 'Protect people and outcomes', description: 'Bring consumer, accessibility, regulatory and public-interest needs into the work.' },
  { eyebrow: 'Practical value', title: 'Test what will be useful', description: 'Check whether the intended result can support familiar work and services.' },
];

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
