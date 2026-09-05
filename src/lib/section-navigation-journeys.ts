import type { Item } from './site.ts';

export const SEMANTIC_MODELLING_JOURNEYS: Item[] = [
  {
    url: '/semantic-modelling/why-ontologies',
    title: 'Understand ontologies',
    children: [
      { url: '/semantic-modelling/benefits', title: 'Why shared meaning matters' },
      { url: '/semantic-modelling/taking-part', title: 'Take part through the website' },
      { url: '/semantic-modelling/reading-the-model', title: 'How to read the model' },
      { url: '/semantic-modelling/questions', title: 'Common questions' },
    ],
  },
  {
    url: '/semantic-modelling/modelling-method',
    title: 'How we model SPDTF',
    children: [
      { url: '/semantic-modelling/principles', title: 'Our modelling manifesto' },
      { url: '/semantic-modelling/coverage', title: 'What we model' },
      { url: '/semantic-modelling/bounded-contexts', title: 'Contexts and common boundary' },
      { url: '/semantic-modelling/context-maps', title: 'Context maps and bridges' },
      { url: '/semantic-modelling/identity-roles-and-phases', title: 'Identity, roles and phases' },
      { url: '/semantic-modelling/modelling-patterns', title: 'Practical modelling patterns' },
      { url: '/semantic-modelling/modelling-rules', title: 'Modelling rules and lenses' },
      { url: '/semantic-modelling/linked-data-languages', title: 'Linked-data languages' },
      { url: '/semantic-modelling/semantic-package', title: 'The semantic package' },
      { url: '/semantic-modelling/evidence-and-mappings', title: 'Evidence and mappings' },
      { url: '/semantic-modelling/validation', title: 'Validation and projections' },
      { url: '/semantic-modelling/standards', title: 'Standards profile' },
      { url: '/semantic-modelling/decision-basis', title: 'The decisions behind the method' },
    ],
  },
];

export const GOVERNANCE_FRAMEWORK_ITEMS: Item[] = [
  {
    url: '/governance/uk-initiative',
    title: 'UK initiative context',
    children: [
      { url: '/governance/legislation', title: 'Legislation and policy' },
      { url: '/governance/departments', title: 'Departments and bodies' },
      { url: '/governance/steering-forums', title: 'Steering and coordination' },
    ],
  },
  {
    url: '/governance/opda-organisation',
    title: 'OPDA organisation',
    children: [
      { url: '/governance/opda-members', title: 'OPDA member firms' },
      { url: '/governance/sandbox', title: 'Trust Framework Sandbox' },
    ],
  },
  {
    url: '/governance/standards-landscape',
    title: 'Standards landscape',
    children: [
      { url: '/governance/toip-governance', title: 'ToIP governance model' },
      { url: '/governance/strategic-alignment', title: 'Strategic alignment' },
    ],
  },
  {
    url: '/governance/opda-rules',
    title: 'OPDA rules',
    children: [
      { url: '/governance/standards-lifecycle', title: 'Standards lifecycle' },
      { url: '/governance/change-management', title: 'Change management' },
      { url: '/governance/lifecycle-versioning', title: 'Release versioning and retirement' },
      { url: '/governance/conformance-scheme', title: 'Conformance and certification' },
      { url: '/governance/accreditation-directory', title: 'Accreditation Directory' },
      { url: '/governance/risk-liability', title: 'Risk and liability' },
      { url: '/governance/deferred-work', title: 'Deferred work register' },
      { url: '/governance/council', title: 'Council sessions' },
    ],
  },
  {
    url: '/governance/operating-model',
    title: 'Operating Model',
    children: [
      { url: '/governance/data-stewardship', title: 'Data stewardship and decision rights' },
      { url: '/governance/meetings-and-feedback', title: 'Meetings and feedback' },
      { url: '/governance/stakeholder-engagement', title: 'Stakeholder engagement' },
      { url: '/governance/overlay-attachments', title: 'Overlay attachments' },
    ],
  },
  {
    url: '/governance/quality-and-security',
    title: 'Quality and security',
    children: [
      { url: '/governance/data-quality', title: 'Data quality framework' },
      { url: '/governance/data-security', title: 'Data security framework' },
    ],
  },
];

export const WORKING_GROUP_MEMBER_GUIDE_ITEMS: Item[] = [
  { url: '/development/working-groups/member-guide/getting-started', title: 'Getting started' },
  { url: '/development/working-groups/member-guide/teams-and-discussions', title: 'Teams and discussions' },
  {
    url: '/development/working-groups/member-guide/source-material-and-sharepoint',
    title: 'Source material and SharePoint',
  },
  { url: '/development/working-groups/member-guide/meetings-and-records', title: 'Meetings and records' },
  {
    url: '/development/working-groups/member-guide/model-review-and-decisions',
    title: 'Model review and decisions',
  },
];
