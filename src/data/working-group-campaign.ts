export interface WorkingGroupContext {
  value: string;
  label: string;
  scope: string;
  campaignCopy: readonly [string, string];
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
  paragraphs?: readonly string[];
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
    campaignCopy: [
      'Mortgage advice, lending decisions, security and affordability depend on information supplied by many organisations at different points in a property transaction.',
      'Share where evidence is duplicated, unclear or unavailable, and help define what lenders, advisers and customers need to make confident, timely decisions.',
    ],
  },
  {
    value: 'conveyancing',
    label: 'Conveyancing',
    scope: 'The legal transfer of property, including title, searches, enquiries and completion.',
    campaignCopy: [
      'Property transfer brings together title, searches, enquiries, contracts and completion. The meaning and authority of each item matters throughout the transaction.',
      'Show where information becomes difficult to establish, interpret or pass on, and help make the resulting standard work for real cases as well as straightforward ones.',
    ],
  },
  {
    value: 'estate-agency',
    label: 'Estate Agency',
    scope: 'Marketing, listing, negotiation and the progression of a sale.',
    campaignCopy: [
      'Estate agents connect sellers, buyers and professionals while property information changes, grows and moves between organisations during a sale.',
      'Help clarify what people need to know, when they need it and how it can stay accurate from instruction and marketing through negotiation and progression.',
    ],
  },
  {
    value: 'surveying-and-valuation',
    label: 'Surveying and Valuation',
    scope: 'Property condition, measurement, inspection, valuation and professional opinion.',
    campaignCopy: [
      'Surveyors and valuers turn inspection, measurement and professional judgement into findings that other people rely on when making important decisions.',
      'Help distinguish what was observed, how it was assessed and which qualifications or uncertainties must travel with the resulting information.',
    ],
  },
  {
    value: 'property-data-services',
    label: 'Property Data Services',
    scope: 'The sourcing, assurance, exchange and interpretation of property information.',
    campaignCopy: [
      'Property data services collect, match, assure and exchange records from sources with different coverage, authority, formats and update cycles.',
      'Help make provenance, quality and limitations visible so people can understand where information came from, what it describes and how safely it can be used.',
    ],
  },
  {
    value: 'property-technology',
    label: 'Property Technology',
    scope: 'Products, platforms and integrations that support the property journey.',
    campaignCopy: [
      'Technology teams connect products, platforms and services across a property journey that already contains many systems, users and operational constraints.',
      'Bring practical integration experience and help identify where clearer definitions and more consistent exchange can reduce friction without disrupting useful work.',
    ],
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
