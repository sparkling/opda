/**
 * OPDA Knowledge Base — canonical site data.
 *
 * Single source of truth for sections, sidebar groups, and pages.
 * Imported by Astro components at build time; no runtime parsing.
 *
 * URL convention (per docs/adr/0002 folder hierarchy):
 *   • Bare slug, no .html, no trailing slash.
 *   • Section root:   /{section}              (e.g. /governance)
 *   • Section page:   /{section}/{slug}       (e.g. /governance/data-stewardship)
 *   • Nested page:    /{section}/.../{slug}   (deep hierarchy in schema)
 */

// ODR corpus sidebar items are generated from the registry so every ODR page is
// registered for navigation (drives the left sidebar via getActiveSection →
// findPage). Adding an ODR to ODR_REGISTRY surfaces it in the nav automatically.
import { ODR_REGISTRY } from './odr-pages.mjs';
import { ADR_REGISTRY } from './adr-pages.mjs';

export type Item = {
  /** Canonical URL — matches Astro.url.pathname (no trailing slash). */
  url: string;
  /** Display label in sidebar and breadcrumbs. */
  title: string;
  /** Nested items (used by the schema section's deep tree only). */
  children?: Item[];
};

export type Group = {
  heading: string;
  items: Item[];
};

export type Section = {
  /** URL-path segment, e.g. 'governance'. Section root URL is `/${key}`. */
  key: string;
  /** Display title, e.g. 'Governance'. */
  title: string;
  /** One-paragraph section summary, shown on the landing and the header. */
  summary: string;
  /** Sidebar groups. The "Overview" pseudo-group links back to /{key}. */
  groups: Group[];
};

/** Global header ordering — left to right. */
export const HEADER_ORDER = [
  'strategy',
  'governance',
  'engagement',
  'modelling',
  'model',
  'ontology',
  'schema',
  'implementation',
  'adoption',
  'library',
] as const;

export const SECTIONS: Record<string, Section> = {
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
      "How OPDA is governed, who governs it, the UK government initiative it sits inside, and the published rules that make the standard authoritative.",
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
        { url: '/governance/conformance-scheme',     title: 'Conformance & certification' },
        { url: '/governance/accreditation-directory',title: 'Accreditation Directory' },
        { url: '/governance/change-management',      title: 'Change management' },
        { url: '/governance/lifecycle-versioning',   title: 'Lifecycle & versioning' },
        { url: '/governance/risk-liability',         title: 'Risk & liability' },
        { url: '/governance/deferred-work',          title: 'Deferred work register' },
        { url: '/governance/council',                title: 'Council sessions' },
      ]},
      { heading: 'Operating Model', items: [
        { url: '/governance/data-stewardship',       title: 'Data stewardship & decision rights' },
        { url: '/governance/meetings-and-feedback',  title: 'Meeting cadence & feedback' },
        { url: '/governance/stakeholder-engagement', title: 'Stakeholder engagement' },
        { url: '/governance/overlay-attachments',    title: 'Overlay attachments' },
      ]},
      { heading: 'Quality & security', items: [
        { url: '/governance/data-quality',           title: 'Data quality framework' },
        { url: '/governance/data-security',          title: 'Data security framework' },
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

  modelling: {
    key: 'modelling',
    title: 'Modelling',
    summary:
      'The technical semantic modelling work: standards stack, bounded contexts, data dictionary, business glossary, ontology, SHACL shapes, and the JSON-LD mappings that link them.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/modelling', title: 'Section overview' },
      ]},
      { heading: 'Foundations', items: [
        { url: '/modelling/standards-stack',  title: 'Standards stack' },
        { url: '/modelling/bounded-contexts', title: 'Bounded contexts (DDD)' },
        { url: '/modelling/overlays',         title: 'Overlays' },
      ]},
      { heading: 'Vocabulary & dictionary', items: [
        { url: '/modelling/data-dictionary',   title: 'Data dictionary' },
        { url: '/modelling/business-glossary', title: 'Business glossary' },
        { url: '/modelling/concept-taxonomy',  title: 'Concept scheme' },
      ]},
      { heading: 'Formal semantic layer', items: [
        { url: '/modelling/ontology',         title: 'Ontology (OWL)' },
        { url: '/modelling/shacl-shapes',     title: 'SHACL shapes' },
        { url: '/modelling/jsonld-mappings',  title: 'JSON-LD mappings' },
      ]},
      { heading: 'ODR corpus', items: [
        { url: '/modelling/odr', title: 'All ODRs (index)' },
        ...ODR_REGISTRY.map((o) => ({
          url: `/modelling/odr/${o.id}`,
          title: `ODR-${o.number} · ${o.title}`,
        })),
      ]},
      { heading: 'ADR corpus', items: [
        { url: '/modelling/adr', title: 'All ADRs (index)' },
        ...ADR_REGISTRY.map((a) => ({
          url: `/modelling/adr/${a.id}`,
          title: `ADR-${a.number} · ${a.title}`,
        })),
      ]},
    ],
  },

  model: {
    key: 'model',
    title: 'Model',
    summary:
      'Four-tier presentation of the OPDA ontology model — concept narrative for SMEs, logical entity-relationship view for engineers, physical deployment topology for triplestore operators, and physical-ontology Turtle for ontology engineers.',
    groups: [
      {
        heading: 'Overview',
        items: [
          { url: '/model',                            title: 'Section overview' },
          { url: '/model/information-architecture',   title: 'Information architecture' },
          { url: '/model/validation-report',          title: 'Validation report' },
        ],
      },
      {
        heading: 'Concept tier — for SMEs',
        items: [
          { url: '/model/concept',                    title: 'Tier overview' },
          { url: '/model/concept/foundation',         title: 'Foundation' },
          { url: '/model/concept/property',           title: 'Property' },
          { url: '/model/concept/agent',              title: 'Agent' },
          { url: '/model/concept/transaction',        title: 'Transaction' },
          { url: '/model/concept/claim',              title: 'Claim' },
          { url: '/model/concept/governance',         title: 'Governance' },
          { url: '/model/concept/descriptive',        title: 'Descriptive' },
        ],
      },
      {
        heading: 'Logical tier — for engineers',
        items: [
          { url: '/model/logical',                    title: 'Tier overview' },
          { url: '/model/logical/foundation',         title: 'Foundation' },
          { url: '/model/logical/property',           title: 'Property' },
          { url: '/model/logical/agent',              title: 'Agent' },
          { url: '/model/logical/transaction',        title: 'Transaction' },
          { url: '/model/logical/claim',              title: 'Claim' },
          { url: '/model/logical/governance',         title: 'Governance' },
          { url: '/model/logical/descriptive',        title: 'Descriptive' },
        ],
      },
      {
        heading: 'Physical — deployment',
        items: [
          { url: '/model/physical-database',                              title: 'Tier overview' },
          { url: '/model/physical-database/named-graphs',                 title: 'Named graphs' },
          { url: '/model/physical-database/derived-profiles',             title: 'Derived profiles' },
          { url: '/model/physical-database/content-negotiation',          title: 'Content negotiation' },
          { url: '/model/physical-database/overlay-deployment/baspi5',    title: 'BASPI5 deployment' },
          { url: '/model/physical-database/operations',                   title: 'CI gates' },
          { url: '/model/physical-database/modules',                      title: 'Per-module deployment views' },
        ],
      },
      {
        heading: 'Physical — ontology',
        items: [
          { url: '/model/physical-ontology',                              title: 'Tier overview' },
          { url: '/model/physical-ontology/three-graph-separation',       title: 'Three-graph separation' },
          { url: '/model/physical-ontology/severity-tiers',               title: 'Severity tiers' },
          { url: '/model/physical-ontology/shacl-af-rules',               title: 'SHACL-AF rules' },
          { url: '/model/physical-ontology/vocabularies',                 title: 'SKOS schemes' },
          { url: '/model/physical-ontology/profiles/baspi5',              title: 'BASPI5 profile' },
          { url: '/model/physical-ontology/exemplars',                    title: 'Diagnostic exemplars' },
        ],
      },
      {
        heading: 'Physical — relational',
        items: [
          { url: '/model/physical-relational',             title: 'Tier overview' },
          { url: '/model/physical-relational/foundation',  title: 'Foundation' },
          { url: '/model/physical-relational/property',    title: 'Property' },
          { url: '/model/physical-relational/agent',       title: 'Agent' },
          { url: '/model/physical-relational/transaction', title: 'Transaction' },
          { url: '/model/physical-relational/claim',       title: 'Claim' },
          { url: '/model/physical-relational/governance',  title: 'Governance' },
          { url: '/model/physical-relational/descriptive', title: 'Descriptive' },
        ],
      },
    ],
  },

  ontology: {
    key: 'ontology',
    title: 'Ontology',
    summary:
      'The published, authoritative reference of the OPDA PDTF ontology — generated from the committed TTL corpus and guarded by the doc-drift CI gate. The canonical specification to link people to: term reference, SHACL shapes, SKOS schemes, overlay profiles, exemplars, governance/provenance, and the known-issues register.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/ontology', title: 'Section overview' },
      ]},
      { heading: 'Understand the model', items: [
        { url: '/ontology/foundation', title: 'Foundations & architecture' },
        { url: '/ontology/identity',   title: 'Identity & classification' },
        { url: '/ontology/foundational-ontology', title: 'Foundational ontology — critique' },
        { url: '/ontology/modelling-frameworks', title: 'Modelling frameworks & upper ontology' },
      ]},
      { heading: 'Browse the model', items: [
        { url: '/ontology/graph',        title: 'Interactive graph' },
        { url: '/ontology/classes',      title: 'Classes' },
        { url: '/ontology/category',     title: 'UFO categories' },
        { url: '/ontology/properties',   title: 'Properties' },
        { url: '/ontology/vocabularies', title: 'Vocabularies (SKOS)' },
        { url: '/ontology/shapes',       title: 'SHACL shapes' },
        { url: '/ontology/profiles',     title: 'Overlay profiles & gaps' },
        { url: '/ontology/exemplars',    title: 'Exemplars' },
        { url: '/ontology/glossary',     title: 'Index & glossary (A–Z)' },
      ]},
      { heading: 'Trust & governance', items: [
        { url: '/ontology/claims',       title: 'Claims, evidence & provenance' },
        { url: '/ontology/governance',   title: 'Governance & PII' },
      ]},
      { heading: 'About this reference', items: [
        { url: '/ontology/provenance',   title: 'Decision provenance' },
        { url: '/ontology/known-issues', title: 'Known issues' },
      ]},
      { heading: 'Use & compare', items: [
        { url: '/ontology/usage',    title: 'Consume the ontology' },
        { url: '/ontology/bake-off', title: 'Tool bake-off & scorecard' },
      ]},
    ],
  },

  schema: {
    key: 'schema',
    title: 'Schema',
    summary:
      'The structured story of the PDTF data model — every leaf placed on its canonical home page, organised by aggregate (lifecycle and authority), with declaration / evidence / derivation badges and overlay chips on every field.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/schema', title: 'Section overview' },
      ]},
      { heading: 'Process', items: [
        { url: '/schema/transaction-participants', title: 'Transaction & participants' },
        { url: '/schema/chain-milestones',         title: 'Chain, milestones & contracts' },
      ]},
      { heading: 'Property', items: [
        { url: '/schema/property', title: 'Property identity' },
        { title: 'Legal estate & title', url: '/schema/legal-estate', children: [
          { url: '/schema/legal-estate/tenure', title: 'Tenure' },
          { title: 'Title', url: '/schema/legal-estate/title', children: [
            { title: 'OC summary', url: '/schema/legal-estate/title/oc-summary', children: [
              { url: '/schema/legal-estate/title/oc-summary/title-number',  title: 'Number & extents' },
              { url: '/schema/legal-estate/title/oc-summary/oc-meta',       title: 'Metadata & property' },
              { url: '/schema/legal-estate/title/oc-summary/oc-owners',     title: 'Proprietorship & lease' },
              { url: '/schema/legal-estate/title/oc-summary/oc-charges-main',   title: 'Charges (main)' },
              { url: '/schema/legal-estate/title/oc-summary/oc-charges-other',  title: 'Other charges & restrictions' },
              { url: '/schema/legal-estate/title/oc-summary/oc-notices-main',   title: 'Notices' },
              { url: '/schema/legal-estate/title/oc-summary/oc-notices-other', title: 'Cautions, bankruptcy, rights' },
            ]},
            { url: '/schema/legal-estate/title/oc-full', title: 'OC full register' },
          ]},
          { title: 'Ownership', url: '/schema/legal-estate/ownership', children: [
            { url: '/schema/legal-estate/ownership/freehold', title: 'Freehold' },
            { title: 'Leasehold', url: '/schema/legal-estate/ownership/leasehold', children: [
              { url: '/schema/legal-estate/ownership/leasehold/lease-term',          title: 'Term & shared ownership' },
              { url: '/schema/legal-estate/ownership/leasehold/lease-contacts-list', title: 'Contact list' },
              { url: '/schema/legal-estate/ownership/leasehold/lease-contacts-roles',title: 'Service-contact roles' },
              { url: '/schema/legal-estate/ownership/leasehold/lease-management',    title: 'Management' },
              { url: '/schema/legal-estate/ownership/leasehold/lease-rent',          title: 'Ground rent' },
              { title: 'Service charge & insurance', url: '/schema/legal-estate/ownership/leasehold/lease-charges', children: [
                { url: '/schema/legal-estate/ownership/leasehold/lease-charges/service-charge',      title: 'Service charge' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-charges/buildings-insurance', title: 'Buildings insurance' },
              ]},
              { title: 'Consents, restrictions, alterations', url: '/schema/legal-estate/ownership/leasehold/lease-legal', children: [
                { url: '/schema/legal-estate/ownership/leasehold/lease-legal/consents-alterations',     title: 'Consents & alterations' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-legal/restrictions-enfranchisement', title: 'Restrictions & enfranchisement' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-legal/building-safety',           title: 'Building Safety Act' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-legal/lease-transfer',            title: 'Transfer & registration' },
              ]},
              { title: 'Disputes, general, documents', url: '/schema/legal-estate/ownership/leasehold/lease-misc', children: [
                { url: '/schema/legal-estate/ownership/leasehold/lease-misc/disputes',       title: 'Disputes' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-misc/general',        title: 'General & confirmation' },
                { url: '/schema/legal-estate/ownership/leasehold/lease-misc/required-docs',  title: 'Required documents' },
              ]},
            ]},
            { title: 'Managed', url: '/schema/legal-estate/ownership/managed', children: [
              { url: '/schema/legal-estate/ownership/managed/contacts',       title: 'Contacts' },
              { url: '/schema/legal-estate/ownership/managed/transfer',       title: 'Transfer & confirmation' },
              { url: '/schema/legal-estate/ownership/managed/service-charge', title: 'Service charge' },
              { url: '/schema/legal-estate/ownership/managed/insurance',      title: 'Insurance' },
              { url: '/schema/legal-estate/ownership/managed/disputes-docs',  title: 'Disputes & documents' },
            ]},
          ]},
          { url: '/schema/legal-estate/boundaries-rights', title: 'Boundaries & rights' },
        ]},
        { title: 'Built form, condition & valuation', url: '/schema/built-form', children: [
          { url: '/schema/built-form/built-form-form', title: 'Built form' },
          { url: '/schema/built-form/condition',       title: 'Condition' },
          { title: 'Fixtures & fittings', url: '/schema/built-form/fixtures', children: [
            { url: '/schema/built-form/fixtures/fixtures-summary', title: 'Items to include / remove' },
            { url: '/schema/built-form/fixtures/basic',            title: 'Basic fittings' },
            { url: '/schema/built-form/fixtures/kitchen',          title: 'Kitchen' },
            { url: '/schema/built-form/fixtures/bathroom',         title: 'Bathroom' },
            { url: '/schema/built-form/fixtures/carpets',          title: 'Carpets' },
            { url: '/schema/built-form/fixtures/curtains',         title: 'Curtains & rails' },
            { url: '/schema/built-form/fixtures/lights',           title: 'Light fittings' },
            { url: '/schema/built-form/fixtures/units',            title: 'Fitted units' },
            { url: '/schema/built-form/fixtures/outdoor',          title: 'Outdoor' },
            { url: '/schema/built-form/fixtures/services',         title: 'TV / telephone / fuel / other' },
          ]},
          { title: 'Surveys', url: '/schema/built-form/surveys', children: [
            { url: '/schema/built-form/surveys/meta',             title: 'Report metadata & declaration' },
            { url: '/schema/built-form/surveys/grounds',          title: 'Grounds' },
            { url: '/schema/built-form/surveys/inside-structure', title: 'Inside · structure' },
            { url: '/schema/built-form/surveys/inside-features',  title: 'Inside · features' },
            { url: '/schema/built-form/surveys/inside-finishes',  title: 'Inside · finishes' },
            { url: '/schema/built-form/surveys/outside-roof',     title: 'Outside · roof' },
            { url: '/schema/built-form/surveys/outside-envelope', title: 'Outside · envelope' },
            { url: '/schema/built-form/surveys/outside-extras',   title: 'Outside · extras' },
            { url: '/schema/built-form/surveys/services-energy',  title: 'Services · energy' },
            { url: '/schema/built-form/surveys/services-water',   title: 'Services · water' },
            { url: '/schema/built-form/surveys/legal',            title: 'Legal & guarantees' },
            { url: '/schema/built-form/surveys/valuation',        title: 'Valuation block' },
            { url: '/schema/built-form/surveys/advice',           title: 'Advice, risks & MLA' },
          ]},
          { url: '/schema/built-form/valuation', title: 'Valuation' },
        ]},
      ]},
      { heading: 'Property pack content', items: [
        { url: '/schema/utilities-energy', title: 'Utilities & energy' },
        { title: 'Local context & searches', url: '/schema/local-context', children: [
          { title: 'Local authority (CON29R)', url: '/schema/local-context/con29r', children: [
            { url: '/schema/local-context/con29r/identity', title: 'LA identity' },
            { title: 'LA searches', url: '/schema/local-context/con29r/searches', children: [
              { url: '/schema/local-context/con29r/searches/planning-building',       title: 'Planning & building regs' },
              { url: '/schema/local-context/con29r/searches/roads',                   title: 'Roads & public rights' },
              { url: '/schema/local-context/con29r/searches/other-planning-notices',  title: 'Other · planning notices' },
              { url: '/schema/local-context/con29r/searches/other-finance',           title: 'Other · finance & assets' },
              { url: '/schema/local-context/con29r/searches/other-road-rail',         title: 'Other · road & rail' },
              { url: '/schema/local-context/con29r/searches/other-environmental',     title: 'Other · environmental' },
              { url: '/schema/local-context/con29r/searches/other-compulsory',        title: 'Other · compulsory & public' },
            ]},
            { url: '/schema/local-context/con29r/listing-conservation', title: 'Listing & conservation' },
          ]},
          { url: '/schema/local-context/llc1', title: 'Local Land Charges (LLC1)' },
          { title: 'Environmental', url: '/schema/local-context/environmental', children: [
            { url: '/schema/local-context/environmental/flooding',       title: 'Flooding' },
            { url: '/schema/local-context/environmental/mining-ground',  title: 'Mining & ground' },
            { url: '/schema/local-context/environmental/pollution-radon',title: 'Pollution & radon' },
            { url: '/schema/local-context/environmental/coast-climate',  title: 'Coast & climate' },
            { url: '/schema/local-context/environmental/infra-policy',   title: 'Infra & policy' },
          ]},
        ]},
        { title: 'Encumbrances & completion', url: '/schema/encumbrances', children: [
          { url: '/schema/encumbrances/council-tax-insurance', title: 'Council tax & insurance' },
          { url: '/schema/encumbrances/guarantees',            title: 'Guarantees & warranties' },
          { url: '/schema/encumbrances/occupiers-notices',     title: 'Occupiers & notices' },
          { url: '/schema/encumbrances/letting-completion',    title: 'Letting & completion' },
        ]},
      ]},
      { heading: 'Cross-cutting', items: [
        { title: 'Evidence, documents & declarations', url: '/schema/evidence', children: [
          { url: '/schema/evidence/documents',     title: 'Documents & attachments' },
          { url: '/schema/evidence/declarations',  title: 'Sale-ready declarations' },
          { url: '/schema/evidence/additional',    title: 'Additional info' },
          { url: '/schema/evidence/disputes',      title: 'Disputes & complaints' },
          { url: '/schema/evidence/specialist',    title: 'Specialist & other' },
        ]},
        { url: '/schema/overlays-tasks', title: 'Overlays, tasks & cross-cuts' },
      ]},
    ],
  },

  implementation: {
    key: 'implementation',
    title: 'Implementation',
    summary:
      'How to build with PDTF: install the schemas package, compose overlays, validate transactions, work with verified claims and JSON-LD.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/implementation', title: 'Section overview' },
      ]},
      { heading: 'Getting started', items: [
        { url: '/implementation/implementation-overview', title: 'Overview' },
        { url: '/implementation/quickstart',              title: 'Quickstart' },
      ]},
      { heading: 'Working with schemas', items: [
        { url: '/implementation/schema-composition', title: 'Schema composition' },
        { url: '/implementation/validation',         title: 'Validation' },
        { url: '/implementation/verified-claims',    title: 'Verified claims' },
      ]},
    ],
  },

  adoption: {
    key: 'adoption',
    title: 'Adoption',
    summary:
      'Who is implementing PDTF, what they have built, lessons learned, and the public evidence that the framework works in practice.',
    groups: [
      { heading: 'Overview', items: [
        { url: '/adoption', title: 'Section overview' },
      ]},
      { heading: 'Pilots & implementations', items: [
        { url: '/adoption/adoption-overview',       title: 'Overview' },
        { url: '/adoption/member-implementations',  title: 'Member implementations' },
        { url: '/adoption/sandbox-pilots',          title: 'Sandbox pilots' },
      ]},
      { heading: 'Programmes', items: [
        { url: '/adoption/smart-data-challenge', title: 'Smart Data Challenge' },
        { url: '/adoption/hmlr-llc',             title: 'HMLR LLC programme' },
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

/** Top-level reference items (cross-section utilities). */
export const REFERENCE_ITEMS = [
  { url: '/glossary',      title: 'Glossary (acronyms)' },
  { url: '/design-system', title: 'Design system' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Walk an item tree depth-first, yielding every leaf and folder.
 * Used by find/flatten/getPrevNext.
 */
function* walkItems(items: Item[]): Generator<Item> {
  for (const item of items) {
    yield item;
    if (item.children) yield* walkItems(item.children);
  }
}

/**
 * Find the section + group + item that owns a given URL.
 * Returns null for URLs not in any section (top-level reference items,
 * 404s, externally-linked pages).
 */
export function findPage(path: string):
  { section: Section; group?: Group; item?: Item } | null {
  const norm = normalizeUrl(path);
  for (const key of Object.keys(SECTIONS)) {
    const section = SECTIONS[key];
    if (norm === `/${key}`) return { section };
    for (const group of section.groups) {
      for (const item of walkItems(group.items)) {
        if (normalizeUrl(item.url) === norm) return { section, group, item };
      }
    }
  }
  return null;
}

/** Which section does this URL belong to? */
export function getActiveSection(path: string): string | null {
  const found = findPage(path);
  return found?.section.key ?? null;
}

/**
 * Flatten a section's sidebar into a sequential reading order.
 * Used to compute prev/next links.
 */
export function flatten(section: Section): Item[] {
  const out: Item[] = [];
  for (const group of section.groups) {
    for (const item of walkItems(group.items)) {
      out.push(item);
    }
  }
  return out;
}

/**
 * Prev/next links for the given page within its section's sidebar order.
 * Returns undefined for either when at the start/end of the section.
 */
export function getPrevNext(path: string): { prev?: Item; next?: Item } {
  const found = findPage(path);
  if (!found) return {};
  const flat = flatten(found.section);
  const norm = normalizeUrl(path);
  const idx = flat.findIndex(i => normalizeUrl(i.url) === norm);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

/** Normalize for comparison: strip trailing slash (except root). */
export function normalizeUrl(url: string): string {
  if (url === '/') return url;
  return url.replace(/\/$/, '');
}
