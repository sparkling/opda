import type { Section } from './site.ts';

/** Site sections outside the PDTF schema documentation source families. */
export const CONTEXT_SOURCE_SECTIONS: Record<string, Section> = {
  strategy: {
    key: 'strategy',
    title: 'Strategy',
    summary:
      'The strategic context — UK Industrial Strategy, Smart Data Scheme sequencing, OPDA programme phases, and the project roadmap.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/strategy', title: 'Section overview' },
      ]},
      { heading: 'Plans', items: [
        { url: '/strategy/strategy-overview', title: 'Overview' },
        { url: '/strategy/project-roadmap',   title: 'Project roadmap' },
        { url: '/strategy/programme-phases',  title: 'Programme phases' },
      ]},
      { heading: 'Wider context', items: [
        { url: '/strategy/industrial-strategy', title: 'UK Industrial Strategy' },
        { url: '/strategy/mhclg-roadmap',       title: 'MHCLG Reform Roadmap' },
        { url: '/strategy/reading-list',        title: 'Reading list' },
      ]},
    ],
  },

  governance: {
    key: 'governance',
    title: 'Governance',
    summary:
      "How OPDA is governed, who has authority, how standards are developed, and which rules are ratified, practised or proposed.",
    groups: [
      { heading: 'Overview', items: [
        { url: '/governance', title: 'Section overview' },
      ]},
      { heading: 'UK initiative context', items: [
        { url: '/governance/uk-initiative',   title: 'UK initiative — overview' },
        { url: '/governance/legislation',     title: 'Legislation & policy' },
        { url: '/governance/departments',     title: 'Departments & bodies' },
        { url: '/governance/steering-forums', title: 'Steering & coordination' },
      ]},
      { heading: 'OPDA the organisation', items: [
        { url: '/governance/opda-members', title: 'OPDA member firms' },
        { url: '/governance/sandbox',      title: 'Trust Framework Sandbox' },
      ]},
      { heading: 'Standards landscape', items: [
        { url: '/governance/toip-governance',     title: 'ToIP governance model' },
        { url: '/governance/strategic-alignment', title: 'Strategic alignment' },
      ]},
      { heading: "OPDA's rules", items: [
        { url: '/governance/standards-lifecycle',     title: 'Standards lifecycle' },
        { url: '/governance/change-management',      title: 'Change management' },
        { url: '/governance/lifecycle-versioning',   title: 'Release versioning' },
        { url: '/governance/conformance-scheme',     title: 'Conformance & certification' },
        { url: '/governance/accreditation-directory',title: 'Accreditation Directory' },
        { url: '/governance/risk-liability',         title: 'Risk & liability' },
        { url: '/governance/deferred-work',          title: 'Deferred work register' },
        { url: '/governance/council',                title: 'Council sessions' },
      ]},
      { heading: 'Operating Model', items: [
        { url: '/governance/data-stewardship',       title: 'Data stewardship & decision rights' },
        { url: '/governance/meetings-and-feedback',  title: 'Meetings & feedback' },
        { url: '/governance/stakeholder-engagement', title: 'Stakeholder engagement' },
        { url: '/governance/overlay-attachments',    title: 'Overlay attachments' },
      ]},
      { heading: 'Quality & security', items: [
        { url: '/governance/data-quality',           title: 'Data quality framework' },
        { url: '/governance/data-security',          title: 'Data security framework' },
      ]},
    ],
  },

  'dbt-smart-data': {
    key: 'dbt-smart-data',
    title: 'DBT Smart Data',
    summary:
      "DBT's cross-sector Smart Data Guidebook — the Preamble and five chapters that will shape how every UK Smart Data scheme operates under the Data (Use and Access) Act 2025 — and, the reason this section exists, the analysis of which of its asks PDTF must be able to encode.",
    groups: [
      { heading: 'Overview', items: [
        { url: '/dbt-smart-data', title: 'Section overview' },
      ]},
      // Sidebar labels are the shortest unique handle, not a summary — the page
      // <h1> does the explaining. Site median is ~16 chars; anything past ~20
      // wraps to two lines in the sidebar. The chapter number is kept (readers
      // say "Chapter 3"); the "Ch." prefix and em-dash were pure width cost.
      { heading: 'The Guidebook', items: [
        { url: '/dbt-smart-data/preamble',                   title: 'Preamble' },
        { url: '/dbt-smart-data/identity',                   title: '1. Identity & trust' },
        { url: '/dbt-smart-data/governance-compliance',      title: '2. Governance & law' },
        { url: '/dbt-smart-data/user-lifecycle',             title: '3. User lifecycle' },
        { url: '/dbt-smart-data/stewardship-privacy-ethics', title: '4. Data stewardship' },
        { url: '/dbt-smart-data/security-risk-fraud',        title: '5. Security & fraud' },
      ]},
      { heading: 'PDTF alignment', items: [
        { url: '/dbt-smart-data/pdtf-overlap',  title: 'What it asks of PDTF' },
        { url: '/dbt-smart-data/gap-register',  title: 'Gap register' },
      ]},
    ],
  },

  engagement: {
    key: 'engagement',
    title: 'Engagement',
    summary:
      'Where the work happens: working groups, steering group meetings, member updates, video content, and the activity log of the programme.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/engagement', title: 'Section overview' },
      ]},
      { heading: 'Activity', items: [
        { url: '/engagement/engagement-overview', title: 'Overview' },
        { url: '/engagement/meetings-decisions',  title: 'Meetings & decisions' },
        { url: '/engagement/working-groups',      title: 'DPMSG working groups' },
      ]},
      { heading: 'Content', items: [
        { url: '/engagement/video-library', title: 'Video library' },
        { url: '/engagement/transcripts',   title: 'Transcripts index' },
      ]},
    ],
  },

  'property-pack': {
    key: 'property-pack',
    title: 'Property Pack ontology',
    summary:
      'The accelerated SPDTF Property Pack ontology candidate, its 451-item definition, PDTF schema lineage, model, technical determination and later review path.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/development/property-pack', title: 'Property Pack ontology' },
        { url: '/development/property-pack/definition-and-scope', title: 'Definition and 451-item scope' },
        { url: '/development/property-pack/pdtf-schema-lineage', title: 'PDTF schema lineage' },
      ]},
      { heading: 'Model atlas', items: [
        { url: '/development/property-pack/model', title: 'Complete model' },
        { url: '/development/property-pack/contexts', title: 'Context overview' },
        { url: '/development/property-pack/contexts/common', title: 'Common boundary' },
        { url: '/development/property-pack/contexts/conveyancing', title: 'Conveyancing' },
        { url: '/development/property-pack/contexts/estate-agency', title: 'Estate agency' },
        { url: '/development/property-pack/contexts/finance-and-banking', title: 'Finance and banking' },
        { url: '/development/property-pack/contexts/property-data-services', title: 'Property data services' },
        { url: '/development/property-pack/contexts/property-technology', title: 'Property technology' },
        { url: '/development/property-pack/contexts/surveying-and-valuation', title: 'Surveying and valuation' },
        { url: '/development/property-pack/contexts/dbt-smart-data', title: 'DBT Smart Data candidate semantic context' },
      ]},
      { heading: 'Meaning & constraints', items: [
        { url: '/development/property-pack/resources', title: 'Ontology resources' },
        { url: '/development/property-pack/relationships', title: 'Relationships' },
        { url: '/development/property-pack/data-dictionary', title: 'Data dictionary' },
        { url: '/development/property-pack/vocabularies', title: 'Controlled vocabularies' },
        { url: '/development/property-pack/shapes', title: 'SHACL shapes' },
      ]},
      { heading: 'Evidence & assurance', items: [
        { url: '/development/property-pack/coverage', title: 'Candidate source coverage' },
        { url: '/development/property-pack/standards', title: 'Standards profile' },
        { url: '/development/property-pack/validation', title: 'Validation evidence' },
        { url: '/development/property-pack/artefacts', title: 'Generated artefacts' },
      ]},
      { heading: 'Governance & lifecycle', items: [
        { url: '/development/property-pack/technical-working-group-determination', title: 'Technical Working Group determination' },
        { url: '/development/property-pack/review-and-releases', title: 'Later review and releases' },
      ]},
    ],
  },

  library: {
    key: 'library',
    title: 'Library',
    summary:
      'A curated index of every document, transcript, recording, and external reference held in the project archive.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/library', title: 'Section overview' },
      ]},
      { heading: 'Holdings', items: [
        { url: '/library/library-overview',     title: 'Overview' },
        { url: '/library/document-archive',     title: 'Document archive' },
        { url: '/library/transcript-archive',   title: 'Transcript archive' },
        { url: '/library/resources',            title: 'Resource index' },
      ]},
      { heading: 'External', items: [
        { url: '/library/external-references', title: 'External references' },
      ]},
    ],
  },
};
