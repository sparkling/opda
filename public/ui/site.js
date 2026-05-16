/* OPDA Knowledge Base — site.js
 * Two top-level sections: Governance and Modelling.
 * Each page declares its section via OPDA.init({ page, section }).
 * Header renders a horizontal global menu with the two sections.
 * Sidebar renders only the items in the current section (contextual).
 */

(function () {
  'use strict';

  // Seven top-level sections + a small Reference group surfaced in the footer area.
  // Each item's `loc` is 'root' (docs/) or 'pages' (docs/pages/).
  const SECTIONS = {
    governance: {
      title: 'Governance',
      summary: 'How OPDA is governed, who governs it, the UK government initiative it sits inside, and the published rules that make the standard authoritative.',
      groups: [
        { heading: 'UK initiative context', items: [
          { id: 'uk-initiative',        file: '01-uk-initiative.html',        title: 'UK initiative — overview' },
          { id: 'legislation',          file: '02-legislation.html',          title: 'Legislation & policy' },
          { id: 'departments',          file: '03-departments.html',          title: 'Departments & bodies' },
          { id: 'steering-forums',      file: '04-steering-forums.html',      title: 'Steering & coordination' },
          { id: 'opda-members',         file: '11-opda-members.html',         title: 'OPDA member firms' },
          { id: 'sandbox',              file: '05-sandbox.html',              title: 'Trust Framework Sandbox' },
        ]},
        { heading: 'Governance framework', items: [
          { id: 'toip-governance',      file: '07-toip-governance.html',      title: 'ToIP governance model' },
          { id: 'strategic-alignment',  file: '08-strategic-alignment.html',  title: 'Strategic alignment' },
          { id: 'conformance-scheme',   file: '20-conformance-scheme.html',   title: 'Conformance & certification' },
          { id: 'change-management',    file: '21-change-management.html',    title: 'Change management' },
          { id: 'lifecycle-versioning', file: '22-lifecycle-versioning.html', title: 'Lifecycle & versioning' },
          { id: 'risk-liability',       file: '23-risk-liability.html',       title: 'Risk & liability' },
        ]},
      ],
    },
    modelling: {
      title: 'Modelling',
      summary: 'The technical semantic modelling work: standards stack, bounded contexts, data dictionary, business glossary, ontology, SHACL shapes, and the JSON-LD mappings that link them.',
      groups: [
        { heading: 'Foundations', items: [
          { id: 'standards-stack',      file: '06-standards-stack.html',      title: 'Standards stack' },
          { id: 'bounded-contexts',     file: '12-bounded-contexts.html',     title: 'Bounded contexts (DDD)' },
          { id: 'overlays',             file: '16-overlays.html',             title: 'Overlays' },
        ]},
        { heading: 'Vocabulary & dictionary', items: [
          { id: 'data-dictionary',      file: '13-data-dictionary.html',      title: 'Data dictionary' },
          { id: 'business-glossary',    file: '14-business-glossary.html',    title: 'Business glossary' },
          { id: 'concept-taxonomy',     file: '30-concept-taxonomy.html',     title: 'Concept scheme' },
        ]},
        { heading: 'Formal semantic layer', items: [
          { id: 'ontology',             file: '31-ontology.html',             title: 'Ontology (OWL)' },
          { id: 'shacl-shapes',         file: '32-shacl-shapes.html',         title: 'SHACL shapes' },
          { id: 'jsonld-mappings',      file: '33-jsonld-mappings.html',      title: 'JSON-LD mappings' },
        ]},
      ],
    },
    schema: {
      title: 'Schema',
      summary: 'The structured story of the PDTF data model — every leaf placed on its canonical home page, organised by aggregate (lifecycle and authority), with declaration / evidence / derivation badges and overlay chips on every field.',
      groups: [
        { heading: 'Overview', items: [
          { id: 'schema-overview',         file: '34-physical-architecture.html',         title: 'Section overview' },
        ]},
        { heading: 'Process', items: [
          { id: 'transaction-participants', file: '35-transaction-participants.html',     title: 'Transaction & participants' },
          { id: 'chain-milestones',         file: '36-chain-milestones-contracts.html',   title: 'Chain, milestones & contracts' },
        ]},
        { heading: 'Property', items: [
          { id: 'property',                            file: '37-property.html',           title: 'Property identity' },
          { title: 'Legal estate & title', children: [
            { id: 'legal-estate',                      file: '38-legal-estate-title.html',  title: 'Overview' },
            { id: 'legal-estate-tenure',               file: '38a-tenure.html',             title: 'Tenure' },
            { title: 'Title', children: [
              { title: 'OC summary', children: [
                { id: 'legal-estate-title-oc-summary', file: '38b-title-oc-summary.html',           title: 'Overview' },
                { id: 'title-number',                  file: '38b1-title-number.html',              title: 'Number & extents' },
                { id: 'title-oc-meta',                 file: '38b2-title-oc-meta.html',             title: 'Metadata & property' },
                { id: 'title-oc-owners',               file: '38b3-title-oc-owners.html',           title: 'Proprietorship & lease' },
                { id: 'title-oc-charges-main',         file: '38b4-title-oc-charges-main.html',     title: 'Charges (main)' },
                { id: 'title-oc-charges-other',        file: '38b5-title-oc-charges-other.html',    title: 'Other charges & restrictions' },
                { id: 'title-oc-notices-main',         file: '38b6-title-oc-notices-main.html',     title: 'Notices' },
                { id: 'title-oc-notices-other',        file: '38b7-title-oc-notices-other.html',    title: 'Cautions, bankruptcy, rights' },
              ]},
              { id: 'legal-estate-title-oc-full',      file: '38c-title-oc-full.html',              title: 'OC full register' },
            ]},
            { title: 'Ownership', children: [
              { id: 'legal-estate-ownership-freehold', file: '38d-ownership-freehold.html',         title: 'Freehold' },
              { title: 'Leasehold', children: [
                { id: 'legal-estate-ownership-leasehold', file: '38e-ownership-leasehold.html',     title: 'Overview' },
                { id: 'lease-term',                    file: '38e1-lease-term.html',                title: 'Term & shared ownership' },
                { id: 'lease-contacts-list',           file: '38e2-lease-contacts-list.html',       title: 'Contact list' },
                { id: 'lease-contacts-roles',          file: '38e3-lease-contacts-roles.html',      title: 'Service-contact roles' },
                { id: 'lease-management',              file: '38e4-lease-management.html',          title: 'Management' },
                { id: 'lease-rent',                    file: '38e5-lease-rent.html',                title: 'Ground rent' },
                { title: 'Service charge & insurance', children: [
                  { id: 'lease-charges',               file: '38e6-lease-charges.html',             title: 'Overview' },
                  { id: 'lease-service-charge',        file: '38e6a-lease-service-charge.html',     title: 'Service charge' },
                  { id: 'lease-buildings-insurance',   file: '38e6b-lease-buildings-insurance.html',title: 'Buildings insurance' },
                ]},
                { title: 'Consents, restrictions, alterations', children: [
                  { id: 'lease-legal',                 file: '38e7-lease-legal.html',               title: 'Overview' },
                  { id: 'lease-consents-alterations',  file: '38e7a-lease-consents-alterations.html', title: 'Consents & alterations' },
                  { id: 'lease-restrictions-enfranchisement', file: '38e7b-lease-restrictions-enfranchisement.html', title: 'Restrictions & enfranchisement' },
                  { id: 'lease-building-safety',       file: '38e7c-lease-building-safety.html',    title: 'Building Safety Act' },
                  { id: 'lease-transfer',              file: '38e7d-lease-transfer.html',           title: 'Transfer & registration' },
                ]},
                { title: 'Disputes, general, documents', children: [
                  { id: 'lease-misc',                  file: '38e8-lease-misc.html',                title: 'Overview' },
                  { id: 'lease-disputes',              file: '38e8a-lease-disputes.html',           title: 'Disputes' },
                  { id: 'lease-general',               file: '38e8b-lease-general.html',            title: 'General & confirmation' },
                  { id: 'lease-required-docs',         file: '38e8c-lease-required-docs.html',      title: 'Required documents' },
                ]},
              ]},
              { title: 'Managed', children: [
                { id: 'legal-estate-ownership-managed', file: '38f-ownership-managed.html',         title: 'Overview' },
                { id: 'managed-contacts',              file: '38f1-managed-contacts.html',          title: 'Contacts' },
                { id: 'managed-transfer',              file: '38f2-managed-transfer.html',          title: 'Transfer & confirmation' },
                { id: 'managed-service-charge',       file: '38f3-managed-service-charge.html',     title: 'Service charge' },
                { id: 'managed-insurance',             file: '38f4-managed-insurance.html',         title: 'Insurance' },
                { id: 'managed-disputes-docs',         file: '38f5-managed-disputes-docs.html',     title: 'Disputes & documents' },
              ]},
            ]},
            { id: 'legal-estate-boundaries-rights',    file: '38g-boundaries-rights.html',          title: 'Boundaries & rights' },
          ]},
          { title: 'Built form, condition & valuation', children: [
            { id: 'built-form',                        file: '39-built-form-condition-valuation.html', title: 'Overview' },
            { id: 'built-form-form',                   file: '39a-built-form.html',                 title: 'Built form' },
            { id: 'built-form-condition',              file: '39b-condition.html',                  title: 'Condition' },
            { title: 'Fixtures & fittings', children: [
              { id: 'built-form-fixtures',             file: '39c-fixtures.html',                   title: 'Overview' },
              { id: 'fixtures-summary',                file: '39c1-fixtures-summary.html',          title: 'Items to include / remove' },
              { id: 'fixtures-basic',                  file: '39c2-fixtures-basic.html',            title: 'Basic fittings' },
              { id: 'fixtures-kitchen',                file: '39c3-fixtures-kitchen.html',          title: 'Kitchen' },
              { id: 'fixtures-bathroom',               file: '39c4-fixtures-bathroom.html',         title: 'Bathroom' },
              { id: 'fixtures-carpets',                file: '39c5-fixtures-carpets.html',          title: 'Carpets' },
              { id: 'fixtures-curtains',               file: '39c6-fixtures-curtains.html',         title: 'Curtains & rails' },
              { id: 'fixtures-lights',                 file: '39c7-fixtures-lights.html',           title: 'Light fittings' },
              { id: 'fixtures-units',                  file: '39c8-fixtures-units.html',            title: 'Fitted units' },
              { id: 'fixtures-outdoor',                file: '39c9-fixtures-outdoor.html',          title: 'Outdoor' },
              { id: 'fixtures-services',               file: '39c10-fixtures-services.html',        title: 'TV / telephone / fuel / other' },
            ]},
            { title: 'Surveys', children: [
              { id: 'built-form-surveys',              file: '39d-surveys.html',                    title: 'Overview' },
              { id: 'survey-meta',                     file: '39d1-survey-meta.html',               title: 'Report metadata & declaration' },
              { id: 'survey-grounds',                  file: '39d2-survey-grounds.html',            title: 'Grounds' },
              { id: 'survey-inside-structure',         file: '39d3-survey-inside-structure.html',   title: 'Inside · structure' },
              { id: 'survey-inside-features',          file: '39d4-survey-inside-features.html',    title: 'Inside · features' },
              { id: 'survey-inside-finishes',          file: '39d5-survey-inside-finishes.html',    title: 'Inside · finishes' },
              { id: 'survey-outside-roof',             file: '39d6-survey-outside-roof.html',       title: 'Outside · roof' },
              { id: 'survey-outside-envelope',         file: '39d7-survey-outside-envelope.html',   title: 'Outside · envelope' },
              { id: 'survey-outside-extras',           file: '39d8-survey-outside-extras.html',     title: 'Outside · extras' },
              { id: 'survey-services-energy',          file: '39d9-survey-services-energy.html',    title: 'Services · energy' },
              { id: 'survey-services-water',           file: '39d10-survey-services-water.html',    title: 'Services · water' },
              { id: 'survey-legal',                    file: '39d11-survey-legal.html',             title: 'Legal & guarantees' },
              { id: 'survey-valuation',                file: '39d12-survey-valuation.html',         title: 'Valuation block' },
              { id: 'survey-advice',                   file: '39d13-survey-advice.html',            title: 'Advice, risks & MLA' },
            ]},
            { id: 'built-form-valuation',              file: '39e-valuation.html',                  title: 'Valuation' },
          ]},
        ]},
        { heading: 'Property pack content', items: [
          { id: 'utilities-energy',                    file: '45-utilities-energy.html',            title: 'Utilities & energy' },
          { title: 'Local context & searches', children: [
            { id: 'local-context',                     file: '46-local-context-searches.html',      title: 'Overview' },
            { title: 'Local authority (CON29R)', children: [
              { id: 'local-context-con29r',            file: '46a-con29r.html',                     title: 'Overview' },
              { id: 'local-authority-identity',        file: '46a1-local-authority-identity.html',  title: 'LA identity' },
              { title: 'LA searches', children: [
                { id: 'local-authority-searches',      file: '46a2-local-authority-searches.html',  title: 'Overview' },
                { id: 'la-planning-building',          file: '46a2a-la-planning-building.html',     title: 'Planning & building regs' },
                { id: 'la-roads',                      file: '46a2b-la-roads.html',                 title: 'Roads & public rights' },
                { id: 'la-other-planning-notices',     file: '46a2c-la-other-planning-notices.html',title: 'Other · planning notices' },
                { id: 'la-other-finance',              file: '46a2d-la-other-finance.html',         title: 'Other · finance & assets' },
                { id: 'la-other-road-rail',            file: '46a2e-la-other-road-rail.html',       title: 'Other · road & rail' },
                { id: 'la-other-environmental',        file: '46a2f-la-other-environmental.html',   title: 'Other · environmental' },
                { id: 'la-other-compulsory',           file: '46a2g-la-other-compulsory.html',      title: 'Other · compulsory & public' },
              ]},
              { id: 'listing-conservation',            file: '46a4-listing-conservation.html',      title: 'Listing & conservation' },
            ]},
            { id: 'local-context-llc1',                file: '46c-llc1.html',                       title: 'Local Land Charges (LLC1)' },
            { title: 'Environmental', children: [
              { id: 'local-context-environmental',     file: '46d-environmental.html',              title: 'Overview' },
              { id: 'env-flooding',                    file: '46d1-flooding.html',                  title: 'Flooding' },
              { id: 'env-mining-ground',               file: '46d2-mining-ground.html',             title: 'Mining & ground' },
              { id: 'env-pollution-radon',             file: '46d3-pollution-radon.html',           title: 'Pollution & radon' },
              { id: 'env-coast-climate',               file: '46d4-coast-climate.html',             title: 'Coast & climate' },
              { id: 'env-infra-policy',                file: '46d5-infra-policy.html',              title: 'Infra & policy' },
            ]},
          ]},
          { title: 'Encumbrances & completion', children: [
            { id: 'encumbrances',                      file: '47-encumbrances-completion.html',     title: 'Overview' },
            { id: 'encumbrances-council-tax-insurance',file: '47a-council-tax-insurance.html',      title: 'Council tax & insurance' },
            { id: 'encumbrances-guarantees',           file: '47b-guarantees.html',                 title: 'Guarantees & warranties' },
            { id: 'encumbrances-occupiers',            file: '47c-occupiers-notices.html',          title: 'Occupiers & notices' },
            { id: 'encumbrances-letting-completion',   file: '47d-letting-completion.html',         title: 'Letting & completion' },
          ]},
        ]},
        { heading: 'Cross-cutting', items: [
          { title: 'Evidence, documents & declarations', children: [
            { id: 'evidence-documents',                file: '48-evidence-documents-declarations.html', title: 'Overview' },
            { id: 'evidence-documents-attachments',    file: '48a-documents.html',                  title: 'Documents & attachments' },
            { id: 'evidence-declarations',             file: '48b-declarations.html',               title: 'Sale-ready declarations' },
            { id: 'evidence-additional',               file: '48c-additional.html',                 title: 'Additional info' },
            { id: 'evidence-disputes',                 file: '48d-disputes.html',                   title: 'Disputes & complaints' },
            { id: 'evidence-specialist',               file: '48e-specialist.html',                 title: 'Specialist & other' },
          ]},
          { id: 'overlays-tasks',           file: '49-overlays-tasks-crosscuts.html',     title: 'Overlays, tasks & cross-cuts' },
        ]},
      ],
    },
    engagement: {
      title: 'Engagement',
      summary: 'Where the work happens: working groups, steering group meetings, member updates, video content, and the activity log of the programme.',
      groups: [
        { heading: 'Activity', items: [
          { id: 'engagement-overview',  file: '40-engagement-overview.html',  title: 'Overview' },
          { id: 'meetings-decisions',   file: '41-meetings-decisions.html',   title: 'Meetings & decisions' },
          { id: 'working-groups',       file: '42-working-groups.html',       title: 'DPMSG working groups' },
        ]},
        { heading: 'Content', items: [
          { id: 'video-library',        file: '43-video-library.html',        title: 'Video library' },
          { id: 'transcripts',          file: '44-transcripts.html',          title: 'Transcripts index' },
        ]},
      ],
    },
    adoption: {
      title: 'Adoption',
      summary: 'Who is implementing PDTF, what they have built, lessons learned, and the public evidence that the framework works in practice.',
      groups: [
        { heading: 'Pilots & implementations', items: [
          { id: 'adoption-overview',    file: '50-adoption-overview.html',    title: 'Overview' },
          { id: 'member-implementations', file: '51-member-implementations.html', title: 'Member implementations' },
          { id: 'sandbox-pilots',       file: '54-sandbox-pilots.html',       title: 'Sandbox pilots' },
        ]},
        { heading: 'Programmes', items: [
          { id: 'smart-data-challenge', file: '52-smart-data-challenge.html', title: 'Smart Data Challenge' },
          { id: 'hmlr-llc',             file: '53-hmlr-llc.html',             title: 'HMLR LLC programme' },
        ]},
      ],
    },
    implementation: {
      title: 'Implementation',
      summary: 'How to build with PDTF: install the schemas package, compose overlays, validate transactions, work with verified claims and JSON-LD.',
      groups: [
        { heading: 'Getting started', items: [
          { id: 'impl-overview',        file: '60-implementation-overview.html', title: 'Overview' },
          { id: 'quickstart',           file: '61-quickstart.html',           title: 'Quickstart' },
        ]},
        { heading: 'Working with schemas', items: [
          { id: 'schema-composition',   file: '62-schema-composition.html',   title: 'Schema composition' },
          { id: 'validation',           file: '63-validation.html',           title: 'Validation' },
          { id: 'verified-claims',      file: '64-verified-claims.html',      title: 'Verified claims' },
        ]},
      ],
    },
    strategy: {
      title: 'Strategy',
      summary: 'The strategic context — UK Industrial Strategy, Smart Data Scheme sequencing, OPDA programme phases, and the project roadmap.',
      groups: [
        { heading: 'Plans', items: [
          { id: 'strategy-overview',    file: '70-strategy-overview.html',    title: 'Overview' },
          { id: 'project-roadmap',      file: '09-project-roadmap.html',      title: 'Project roadmap' },
          { id: 'programme-phases',     file: '71-programme-phases.html',     title: 'Programme phases' },
        ]},
        { heading: 'Wider context', items: [
          { id: 'industrial-strategy',  file: '72-industrial-strategy.html',  title: 'UK Industrial Strategy' },
        ]},
      ],
    },
    library: {
      title: 'Library',
      summary: 'A curated index of every document, transcript, recording, and external reference held in the project archive.',
      groups: [
        { heading: 'Holdings', items: [
          { id: 'library-overview',     file: '80-library-overview.html',     title: 'Overview' },
          { id: 'documents',            file: '81-document-archive.html',     title: 'Document archive' },
          { id: 'transcripts-archive',  file: '82-transcript-archive.html',   title: 'Transcript archive' },
        ]},
        { heading: 'External', items: [
          { id: 'external-references',  file: '83-external-references.html',  title: 'External references' },
        ]},
      ],
    },
  };

  // Items not in either section — accessible from the footer area on the home page.
  const REFERENCE_ITEMS = [
    { id: 'project-roadmap', file: '09-project-roadmap.html', title: 'Project roadmap',  loc: 'pages' },
    { id: 'glossary',        file: '10-glossary.html',        title: 'Glossary (acronyms)', loc: 'pages' },
    { id: 'design-system',   file: 'design-system.html',      title: 'Design system',    loc: 'root'  },
  ];

  // ── Path utilities ────────────────────────────────────────────────────────
  function detectLocation() {
    return window.location.pathname.includes('/pages/') ? 'pages' : 'root';
  }

  // Resolve href from current location to target item.
  // Section items live under pages/; landing pages (governance.html, modelling.html)
  // and index.html live at root.
  function hrefForPage(file, currentLoc) {
    return currentLoc === 'pages' ? file : 'pages/' + file;
  }
  function hrefForRoot(file, currentLoc) {
    return currentLoc === 'root' ? file : '../' + file;
  }
  function hrefForSection(sectionKey, currentLoc) {
    // Section landing pages live at root: governance.html, modelling.html
    return hrefForRoot(sectionKey + '.html', currentLoc);
  }

  function escape(s) {
    return String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  }

  // ── Header (with horizontal global menu) ──────────────────────────────────
  function renderHeader(activeSection, currentLoc) {
    const homeHref = hrefForRoot('index.html', currentLoc);
    const cls = (s) => activeSection === s ? ' class="active" aria-current="page"' : '';
    return (
      '<header class="app-header">' +
        '<a href="' + homeHref + '" class="brand-link">' +
          '<span class="brand-mark">OPDA</span>' +
          '<span class="brand-sub">Knowledge base</span>' +
        '</a>' +
        '<nav class="global-nav">' +
          // Logical flow: Why → Authority → Activity → What → How → Evidence → Archive
          '<a href="' + hrefForSection('strategy',       currentLoc) + '"' + cls('strategy')       + '>Strategy</a>' +
          '<a href="' + hrefForSection('governance',     currentLoc) + '"' + cls('governance')     + '>Governance</a>' +
          '<a href="' + hrefForSection('engagement',     currentLoc) + '"' + cls('engagement')     + '>Engagement</a>' +
          '<a href="' + hrefForSection('modelling',      currentLoc) + '"' + cls('modelling')      + '>Modelling</a>' +
          '<a href="' + hrefForSection('schema',         currentLoc) + '"' + cls('schema')         + '>Schema</a>' +
          '<a href="' + hrefForSection('implementation', currentLoc) + '"' + cls('implementation') + '>Implementation</a>' +
          '<a href="' + hrefForSection('adoption',       currentLoc) + '"' + cls('adoption')       + '>Adoption</a>' +
          '<a href="' + hrefForSection('library',        currentLoc) + '"' + cls('library')        + '>Library</a>' +
        '</nav>' +
        '<button class="menu-toggle" aria-label="Toggle sidebar" id="menu-toggle">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>' +
        '</button>' +
        '<nav class="header-nav">' +
          '<a href="https://openpropdata.org.uk" target="_blank" rel="noopener">openpropdata.org.uk</a>' +
          '<a href="https://propdata.org.uk" target="_blank" rel="noopener">propdata.org.uk</a>' +
          '<a href="https://github.com/Property-Data-Trust-Framework" target="_blank" rel="noopener">GitHub</a>' +
        '</nav>' +
        '<button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode" title="Toggle light/dark mode">' +
          '<svg class="theme-icon theme-icon--sun"  viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.42-1.42M4.92 19.08l1.42-1.42m11.32 0l1.42 1.42M4.92 4.92l1.42 1.42M12 7a5 5 0 100 10 5 5 0 000-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '<svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
        '</button>' +
      '</header>'
    );
  }

  // ── Theme toggle ──────────────────────────────────────────────────────────
  // Resolves the active theme from localStorage (if user toggled) or the
  // system preference (otherwise). Sets data-theme on <html> so CSS variables
  // remap. Mermaid is re-rendered after a switch.
  function resolveTheme() {
    var stored = null;
    try { stored = localStorage.getItem('opda-theme'); } catch (e) {}
    if (stored === 'light' || stored === 'dark') return stored;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
  function persistTheme(theme) {
    try { localStorage.setItem('opda-theme', theme); } catch (e) {}
  }
  function bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || resolveTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      persistTheme(next);
      // Mermaid renders the diagrams once at init; reset and re-run with new theme vars.
      restartMermaid();
    });
  }
  // Re-render Mermaid diagrams with current theme. Uses cached source text
  // so we can wipe the already-rendered SVG and ask mermaid to re-run.
  function restartMermaid() {
    if (!window.mermaid) return;
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.dataset.mermaidSrc && !el.dataset.processed) {
        el.dataset.mermaidSrc = el.textContent.trim();
      }
      if (el.dataset.mermaidSrc) {
        el.textContent = el.dataset.mermaidSrc;
        el.removeAttribute('data-processed');
      }
    });
    runMermaid();
  }

  // ── Sidebar (contextual: only the current section's groups) ───────────────
  function renderSidebar(activeId, activeSection, currentLoc) {
    if (!activeSection || !SECTIONS[activeSection]) return ''; // No sidebar on home

    const section = SECTIONS[activeSection];
    if (section.sidebar === false) return ''; // Section explicitly opts out (e.g. single-page sections)

    // Tree view: each item is either a LEAF ({id, file, title}) or a
    // FOLDER ({title, children:[...]}). Folders nest arbitrarily; we
    // don't force a level when only one item exists. Folders that
    // contain the active page (or any descendant active page) are
    // open by default; the user can collapse them via the chevron.
    function containsActive(item) {
      if (item.id && item.id === activeId) return true;
      if (item.children) {
        for (const c of item.children) if (containsActive(c)) return true;
      }
      return false;
    }
    function renderItem(item) {
      const isLeaf = !item.children;
      if (isLeaf) {
        const cls = item.id === activeId ? ' class="active" aria-current="page"' : '';
        return '<li class="tree-leaf"><a href="' + hrefForPage(item.file, currentLoc) + '"' + cls + '>' +
               escape(item.title) + '</a></li>';
      }
      const open = containsActive(item);
      const childrenHtml = item.children.map(renderItem).join('');
      // Inline Lucide chevron-right SVG. Rotates 90° via CSS when the
      // folder is open. Uses currentColor so it inherits text colour.
      const chevron =
        '<svg class="tree-caret" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.25" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
          '<polyline points="9 18 15 12 9 6"/>' +
        '</svg>';
      return '<li class="tree-folder' + (open ? ' is-open' : '') + '">' +
               '<button type="button" class="tree-toggle" aria-expanded="' + (open ? 'true' : 'false') + '">' +
                 chevron +
                 '<span class="tree-label">' + escape(item.title) + '</span>' +
               '</button>' +
               '<ul class="tree-children">' + childrenHtml + '</ul>' +
             '</li>';
    }
    const groupsHtml = section.groups.map(function (group) {
      return '<div class="nav-group">' +
               '<h3>' + escape(group.heading) + '</h3>' +
               '<ul class="tree">' + (group.items || []).map(renderItem).join('') + '</ul>' +
             '</div>';
    }).join('');

    return '<aside class="app-sidebar" id="app-sidebar">' +
             '<nav class="sidebar-nav">' +
               groupsHtml +
             '</nav>' +
           '</aside>';
  }

  function mountChrome(activeId, activeSection) {
    const root = document.getElementById('app');
    if (!root) { console.error('[OPDA] #app element not found'); return; }
    const currentLoc = detectLocation();
    const mainContent = root.innerHTML;

    try {
      const sidebar = renderSidebar(activeId, activeSection, currentLoc);
      root.innerHTML =
        renderHeader(activeSection, currentLoc) +
        '<div class="app-body' + (sidebar ? '' : ' no-sidebar') + '">' +
          sidebar +
          '<main class="app-main">' + mainContent + '</main>' +
        '</div>';
    } catch (err) {
      console.error('[OPDA] mountChrome failed; restoring original content', err);
      root.innerHTML = mainContent;
      return;
    }

    // Mobile sidebar toggle
    const toggle = document.getElementById('menu-toggle');
    const aside = document.getElementById('app-sidebar');
    if (toggle && aside) {
      toggle.addEventListener('click', function () { aside.classList.toggle('open'); });
      aside.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { aside.classList.remove('open'); });
      });
    }

    // Tree folder expand/collapse — each .tree-toggle button toggles
    // .is-open on its parent <li.tree-folder>. Default state is set
    // server-side by renderItem() (folders containing the active page
    // are open; others closed).
    if (aside) {
      aside.querySelectorAll('.tree-toggle').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const li = btn.closest('.tree-folder');
          if (!li) return;
          const opening = !li.classList.contains('is-open');
          li.classList.toggle('is-open', opening);
          btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
        });
      });
    }
  }

  function enhanceHeadings() {
    document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(function (h) {
      const link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'heading-anchor';
      link.setAttribute('aria-label', 'Permalink');
      link.textContent = '#';
      h.appendChild(link);
    });
  }

  // Right-rail TOC — auto-built from h2/h3/h4 headings with ids.
  // Sticky on wide screens; hidden under 1280px (handled by CSS).
  function renderToc() {
    const article = document.querySelector('.prose');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id], h4[id]');
    if (headings.length < 3) return; // skip short pages

    const toc = document.createElement('aside');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'On this page');

    const titleEl = document.createElement('div');
    titleEl.className = 'toc-title';
    titleEl.textContent = 'On this page';
    toc.appendChild(titleEl);

    const ul = document.createElement('ul');
    headings.forEach(function (h) {
      const li = document.createElement('li');
      li.className = 'toc-level-' + h.tagName.toLowerCase(); // toc-level-h2 etc.
      const a  = document.createElement('a');
      a.href = '#' + h.id;
      // Use first text node only, so the appended "#" anchor (if any) is excluded.
      let label = '';
      for (let i = 0; i < h.childNodes.length; i++) {
        const n = h.childNodes[i];
        if (n.nodeType === 3) label += n.textContent;            // text
        else if (n.nodeType === 1 && !n.classList.contains('heading-anchor')) {
          label += n.textContent;                                // element (but not the # anchor)
        }
      }
      a.textContent = label.trim();
      a.setAttribute('data-toc-target', h.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);

    // Mount as a sibling of .app-main inside .app-body — third grid column.
    const body = document.querySelector('.app-body');
    if (body) {
      body.appendChild(toc);
      body.classList.add('with-toc');
    } else {
      // Fallback: float right inside .prose (legacy positioning)
      article.insertBefore(toc, article.firstChild);
    }

    // Active-section highlight via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const linkById = {};
      toc.querySelectorAll('a[data-toc-target]').forEach(function (a) {
        linkById[a.getAttribute('data-toc-target')] = a;
      });
      let lastActive = null;
      const observer = new IntersectionObserver(function (entries) {
        // Pick the first heading currently in the upper portion of the viewport
        const visible = entries.filter(e => e.isIntersecting)
                               .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const top = visible[0].target.id;
        const link = linkById[top];
        if (!link || link === lastActive) return;
        if (lastActive) lastActive.classList.remove('active');
        link.classList.add('active');
        lastActive = link;
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  // Lazy-load Mermaid 11 + the ELK layout engine from CDN, once per page.
  // Mermaid 11 ships as an ESM module, so it's imported on demand rather than
  // via a <script> tag. registerLayoutLoaders wires in ELK, letting any diagram
  // opt into the ELK layout engine with `config: { layout: elk }` frontmatter.
  // Returns a Promise that resolves once window.mermaid is usable.
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve();
    if (!document.querySelector('.mermaid')) return Promise.resolve();   // page has no diagrams
    if (window.__mermaidLoading) return window.__mermaidLoading;

    window.__mermaidLoading = Promise.all([
      import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'),
      import('https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs'),
    ]).then(function (mods) {
      var mermaid = mods[0].default;
      mermaid.registerLayoutLoaders(mods[1].default);
      window.mermaid = mermaid;
    }).catch(function (e) {
      throw new Error('Mermaid CDN failed to load: ' + e.message);
    });
    return window.__mermaidLoading;
  }

  function runMermaid() {
    return ensureMermaid().then(function () {
      if (!window.mermaid) return;
      // Wait one paint frame so the surrounding grid (sidebar / TOC / main)
      // has finished its first layout pass — otherwise Mermaid measures a
      // zero/tiny container and pins the SVG max-width to that value.
      // We use requestAnimationFrame but fall back to setTimeout because RAF
      // is throttled in background / automated tabs, which would block our
      // first render entirely until the tab is focused.
      return new Promise(function (resolve) {
        var done = false;
        function go() {
          if (done) return; done = true;
          _runMermaidInner();
          installMermaidResizeObserver();
          resolve();
        }
        requestAnimationFrame(function () {
          requestAnimationFrame(go);
        });
        // Safety net: if RAF doesn't fire (background/throttled tab), run
        // after one task tick anyway.
        setTimeout(go, 50);
      });
    }).catch(function (err) {
      console.warn('[OPDA] mermaid load failed:', err);
    });
  }

  // Re-render Mermaid blocks whose container width changes meaningfully.
  // Guards against Gantt + large flowcharts that get squashed when measured
  // during page load — a later resize fixes them automatically.
  function installMermaidResizeObserver() {
    if (window.__mermaidResizeObserved) return;
    window.__mermaidResizeObserved = true;
    if (typeof ResizeObserver === 'undefined') return;

    var lastWidth = new WeakMap();
    var debounce = null;
    function scheduleRerun() {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        document.querySelectorAll('.mermaid').forEach(function (el) {
          if (el.dataset.mermaidSrc) {
            el.textContent = el.dataset.mermaidSrc;
            el.removeAttribute('data-processed');
          }
        });
        _runMermaidInner();
      }, 200);
    }

    var ro = new ResizeObserver(function (entries) {
      var rerunNeeded = false;
      entries.forEach(function (e) {
        var w = Math.round(e.contentRect.width);
        var prev = lastWidth.get(e.target) || 0;
        // Re-render on any meaningful change OR when starting from a tiny value
        if (Math.abs(w - prev) >= 30 || (prev < 200 && w >= 200)) rerunNeeded = true;
        lastWidth.set(e.target, w);
      });
      if (rerunNeeded) scheduleRerun();
    });

    document.querySelectorAll('.mermaid').forEach(function (el) {
      lastWidth.set(el, el.getBoundingClientRect().width);
      ro.observe(el);
    });

    // Also re-run on window load (full resource load) — guards against initial
    // mermaid render happening while images/fonts/grid are still settling.
    if (document.readyState !== 'complete') {
      window.addEventListener('load', scheduleRerun, { once: true });
    }
  }

  // Build a single-line `%%{init: {...}}%%` directive from a themeVariables
  // dict and inject it into every .mermaid element. When the diagram has a
  // YAML frontmatter (`---\n...\n---\n`) the directive must go AFTER it —
  // putting `%%init%%` first makes Mermaid swallow the `---` as a comment
  // remnant and choke on the next `---`.
  function injectInlineThemeDirective(themeVars) {
    if (!themeVars) return;
    var keys = Object.keys(themeVars);
    var pairs = [];
    for (var i = 0; i < keys.length; i++) {
      var v = themeVars[keys[i]];
      if (typeof v !== 'string') continue;
      pairs.push("'" + keys[i] + "':'" + v + "'");
    }
    var directive = "%%{init: { 'theme':'base', 'themeVariables': { " + pairs.join(', ') + " } }}%%\n";
    document.querySelectorAll('.mermaid').forEach(function (el) {
      var src = (el.dataset.mermaidSrc || el.textContent || '').trim();
      // Strip any prior init directive (could be anywhere — we may have
      // placed it after a frontmatter on a previous theme-toggle pass).
      src = src.replace(/%%\{init:[^}]*\}\}%%\s*\n?/g, '');
      src = src.replace(/^\s+/, '');
      if (!src) return;
      var fm = src.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
      if (fm) {
        el.textContent = fm[0] + directive + src.slice(fm[0].length);
      } else {
        el.textContent = directive + src;
      }
      el.removeAttribute('data-processed');
    });
  }

  function _runMermaidInner() {
    // Theme: explicit data-theme attribute wins; fall back to system preference.
    const themeAttr = document.documentElement.getAttribute('data-theme');
    const isDark = themeAttr
      ? themeAttr === 'dark'
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Pin Mermaid font-size to a fixed px (not relative to the 109% root) so
    // node box measurements don't drift and clip the labels.
    const fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    const fontSize   = '14px';

    // Theme variables for light + dark — Mermaid uses the same key names.
    // Warm-canvas palette aligned with docs/ui/design-tokens.css.
    // Cream surface + terracotta borders + ink text (light); espresso surface
    // + cream-on-dark text + terracotta accent (dark).
    const lightTheme = {
      /* Core fills */
      primaryColor:        '#EFE9DE',  /* surface-card */
      primaryBorderColor:  '#CC785C',  /* terracotta-500 */
      primaryTextColor:    '#141413',  /* ink */
      secondaryColor:      '#F5F0E8',  /* surface-soft */
      tertiaryColor:       '#E8E0D2',  /* cream-strong */
      /* Edges + decorations */
      lineColor:           '#6C6A64',  /* stone-700 */
      arrowheadColor:      '#6C6A64',
      edgeLabelBackground: '#FAF9F5',  /* canvas — match page bg */
      /* Cluster (subgraph) */
      clusterBkg:          '#FAF9F5',
      clusterBorder:       '#E6DFD0',
      /* Notes */
      noteBkgColor:        '#FBF3EE',  /* terracotta-50 */
      noteBorderColor:     '#CC785C',
      noteTextColor:       '#141413',
      /* Typography */
      titleColor:          '#141413',
      labelColor:          '#3D3D3A',
      nodeTextColor:       '#141413',
      /* Sequence / flow specifics */
      actorBkg:            '#EFE9DE',
      actorBorder:         '#CC785C',
      actorTextColor:      '#141413',
      actorLineColor:      '#6C6A64',
      signalColor:         '#3D3D3A',
      signalTextColor:     '#141413',
      /* Gantt — sections keep the warm site palette so the chart fits the
         page; task states use the Cagle Status palette from the diagramming
         skill (09-STYLING-GUIDE.md §"Gantt Chart" + Status table) so
         done/active/crit are immediately recognisable cross-diagram. */
      sectionBkgColor:     '#F5F0E8',  /* surface-soft */
      sectionBkgColor2:    '#E8E0D2',  /* cream-strong */
      altSectionBkgColor:  '#FAF9F5',  /* canvas (alt rows 1+3 fall back to this in Mermaid Gantt) */
      excludeBkgColor:     '#F0EBE0',  /* weekends / excluded */
      /* Task states — Cagle Light Status palette (WCAG AA, CVD-safe) */
      taskBkgColor:        '#ECEFF1',  /* neutral (default task) */
      taskBorderColor:     '#455A64',
      /* All task fills in light mode are pale pastels, so every text
         variant uses ink black. Setting taskTextLightColor to white was
         a WCAG fail for crit tasks (white on #FFCDD2 ≈ 1.3:1). */
      taskTextColor:       '#141413',
      taskTextLightColor:  '#141413',
      taskTextDarkColor:   '#141413',
      taskTextOutsideColor:'#141413',
      taskTextClickableColor:'#141413',
      textColor:           '#3D3D3A',  /* axis tick + grid labels */
      activeTaskBkgColor:  '#BBDEFB',  /* Info (skill §Gantt example) */
      activeTaskBorderColor:'#1565C0',
      doneTaskBkgColor:    '#C8E6C9',  /* Success (skill §Gantt example) */
      doneTaskBorderColor: '#2E7D32',
      critBkgColor:        '#FFCDD2',  /* Error (skill §Gantt example) */
      critBorderColor:     '#C62828',
      todayLineColor:      '#C62828',  /* Error stroke — high-attention */
      gridColor:           '#ECEFF1',  /* skill default; subtle on cream */
      /* ER */
      attributeBackgroundColorOdd:  '#FAF9F5',
      attributeBackgroundColorEven: '#F4F1E8',
      fontFamily, fontSize,
    };
    const darkTheme = {
      /* Espresso surface, on-dark text, terracotta accent stays warm. */
      primaryColor:        '#211F1C',  /* surface-dark-alt */
      primaryBorderColor:  '#CC785C',  /* terracotta-500 (accent in dark too) */
      primaryTextColor:    '#F7F3E9',  /* on-dark */
      secondaryColor:      '#2B2925',  /* surface-dark-tint */
      tertiaryColor:       '#34302B',
      lineColor:           '#A8A097',  /* on-dark muted */
      arrowheadColor:      '#A8A097',
      edgeLabelBackground: '#181715',  /* surface-dark — match canvas */
      clusterBkg:          '#181715',
      clusterBorder:       '#34302B',
      noteBkgColor:        '#3A261D',  /* terracotta-100 (dark-flipped) */
      noteBorderColor:     '#CC785C',
      noteTextColor:       '#F7F3E9',
      titleColor:          '#F7F3E9',
      labelColor:          '#E8E2D4',
      nodeTextColor:       '#F7F3E9',
      actorBkg:            '#211F1C',
      actorBorder:         '#CC785C',
      actorTextColor:      '#F7F3E9',
      actorLineColor:      '#A8A097',
      signalColor:         '#E8E2D4',
      signalTextColor:     '#F7F3E9',
      /* Gantt — sections keep the warm espresso palette so the chart fits
         the page; task states use the Cagle Dark Status palette from the
         diagramming skill (09-STYLING-GUIDE.md §"Dark Cagle Palette"
         Status table — WCAG 2.2 AA+ audited, CVD-safe per Council 163). */
      sectionBkgColor:     '#211F1C',  /* surface-dark-alt */
      sectionBkgColor2:    '#2B2925',  /* surface-dark-tint */
      altSectionBkgColor:  '#181715',  /* canvas — the deepest (overrides Mermaid's white default for sections 1+3) */
      excludeBkgColor:     '#34302B',  /* weekends / excluded */
      /* Task states — Cagle Dark Status palette (skill: WCAG 2.2 AA+, CVD-safe).
         All bar fills are deep, so EVERY text variant must be light. Note
         that Mermaid uses `taskTextDarkColor` for `.doneText*` /
         `.activeText*` inside-bar labels regardless of fill luminance —
         it's "the darker of the two text colors", not "for dark fills" —
         so it must be light here too or the labels disappear. */
      taskBkgColor:        '#1E1E1E',  /* Neutral fill — default task */
      taskBorderColor:     '#9E9E9E',  /* Neutral stroke */
      taskTextColor:       '#F7F3E9',  /* on-dark text — matches rest of dark theme */
      taskTextLightColor:  '#F7F3E9',
      taskTextDarkColor:   '#F7F3E9',  /* used for .doneText + .activeText labels on dark bars */
      taskTextOutsideColor:'#F7F3E9',
      taskTextClickableColor:'#90CAF9',
      textColor:           '#E8E2D4',  /* axis tick + grid labels — matches labelColor */
      activeTaskBkgColor:  '#0D2137',  /* Info fill */
      activeTaskBorderColor:'#42A5F5', /* Info stroke */
      doneTaskBkgColor:    '#0D2818',  /* Success fill */
      doneTaskBorderColor: '#66BB6A',  /* Success stroke */
      critBkgColor:        '#2A0A0A',  /* Error fill */
      critBorderColor:     '#EF5350',  /* Error stroke */
      todayLineColor:      '#EF5350',  /* Error stroke — high-attention marker */
      gridColor:           '#3d2e6b',  /* skill: cluster-border tone, muted on canvas */
      attributeBackgroundColorOdd:  '#211F1C',
      attributeBackgroundColorEven: '#181715',
      fontFamily, fontSize,
    };

    try {
      var activeTheme = isDark ? darkTheme : lightTheme;

      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: activeTheme,
        flowchart: {
          curve: 'basis',
          useMaxWidth: true,
          htmlLabels: true,
          padding: 18,        // breathing room inside each node box
          nodeSpacing: 36,
          rankSpacing: 50,
        },
        sequence:  { useMaxWidth: true, mirrorActors: false },
        gantt:     { useMaxWidth: true },
        er:        { useMaxWidth: true },
      });

      // Inject `%%{init: {…}}%%` per-diagram. Mermaid 11 has cases where
      // themeVariables passed via initialize() don't reach the renderer
      // (notably the Gantt section/task palette). Inline directives are
      // honoured deterministically. See diagramming skill 09-STYLING-GUIDE.
      injectInlineThemeDirective(activeTheme);

      window.mermaid.run({ querySelector: '.mermaid' })
        .then(function () {
          applyMermaidClassDefOverrides(isDark);
          scheduleEnhanceDiagrams();
        })
        .catch(function (err) {
          // Mermaid rejects the whole batch if ANY block fails to parse,
          // but the others still render successfully. Run the enhancements
          // anyway so the working SVGs get their zoom button + clicks.
          console.warn('[OPDA] mermaid.run error (continuing):', err);
          try { applyMermaidClassDefOverrides(isDark); scheduleEnhanceDiagrams(); } catch (_) {}
        });
    } catch (err) {
      console.warn('[OPDA] mermaid failed:', err);
    }
  }

  // Mermaid renders per-classDef styles inside each SVG with a selector like
  //   #mermaid-{id} .primary > * { fill:#eef4f8 !important; }
  // The #id raises specificity above anything we can write in our external CSS
  // file, so the only reliable override is inline style — which is what this
  // walker does. Runs once after each mermaid.run() completes.
  function applyMermaidClassDefOverrides(isDark) {
    if (!isDark) {
      // Light mode: strip any inline fills + text colours we set in a previous dark render
      document.querySelectorAll('.mermaid svg .node, .mermaid svg .cluster').forEach(function (n) {
        n.querySelectorAll('rect, polygon, circle, ellipse, path').forEach(function (s) {
          s.style.removeProperty('fill');
          s.style.removeProperty('stroke');
        });
        n.querySelectorAll('foreignObject *, .nodeLabel, .cluster-label, .cluster-label *, text, tspan').forEach(function (t) {
          t.style.removeProperty('color');
          t.style.removeProperty('fill');
        });
      });
      return;
    }
    // Mapping of classDef name → dark-mode fill (and optional stroke).
    var DARK_FILL = {
      // government / policy / forum
      gov: '#172554', act: '#172554', policy: '#172554', forum: '#172554',
      body: '#172554', regulator: '#172554',
      // outputs / delivery
      out: '#052e16', del: '#052e16', ops: '#052e16', tech: '#052e16',
      // forms / process — deep amber
      form: '#431407', proc: '#431407', step: '#431407',
      // phase clusters (project roadmap subgraphs) + their task children
      phase: '#13315c', task: '#0b1220', milestone: '#431407',
      // primary / source / std / etc.
      src: '#0b2545', std: '#0b2545', ext: '#0b2545', primary: '#0b2545',
      proptech: '#0b2545', conv: '#0b2545', portal: '#0b2545', search: '#0b2545',
      root: '#1a4d80', strat: '#0b2545', tier: '#0b2545', sg: '#0b2545',
      wg: '#0b2545', lender: '#0b2545',
      // accents
      opda: '#13315c', pl: '#13315c', l4: '#13315c',
      l1: '#13315c', l2: '#13315c', l3: '#1a4d80',
      // schema physical-architecture page
      base: '#0b2545', overlay: '#431407', engine: '#134e4a',
      api: '#1e1b4b', trust: '#3b0764',
      // overlays page: bounded context, main overlay, extension overlay, done
      ctx: '#13315c', ovl: '#2b2925', extn: '#5f342a', done: '#052e16',
    };
    var DARK_STROKE = {
      opda: '#7aaecf', pl: '#7aaecf', l4: '#7aaecf',
      phase: '#4a90c2', task: '#475569',
      ctx: '#7aaecf', ovl: '#a8a39a', extn: '#d4877a', done: '#7aaecf',
      // concept-taxonomy hierarchy: root accent, l1 muted edge that echoes root fill
      root: '#2d6494', l1: '#1a4d80',
    };

    // Walk both nodes AND clusters (subgraphs render as .cluster, not .node).
    document.querySelectorAll('.mermaid svg .node, .mermaid svg .cluster').forEach(function (node) {
      var classes = (node.getAttribute('class') || '').split(/\s+/);
      var fill = null, stroke = null;
      for (var i = 0; i < classes.length; i++) {
        if (DARK_FILL[classes[i]])   { fill   = DARK_FILL[classes[i]]; }
        if (DARK_STROKE[classes[i]]) { stroke = DARK_STROKE[classes[i]]; }
        if (fill) break;
      }
      if (!fill) return;
      node.querySelectorAll('rect, polygon, circle, ellipse, path').forEach(function (shape) {
        // Must use setProperty(name, value, 'important') — Mermaid's internal
        // .className > * { fill: X !important; } rule beats inline styles
        // unless our inline style also carries !important.
        shape.style.setProperty('fill', fill, 'important');
        if (stroke) shape.style.setProperty('stroke', stroke, 'important');
      });
      // Also force a readable label colour. The classDef's `color:` is set on
      // the parent .label element via Mermaid's internal !important CSS, so we
      // need !important inline on every text-bearing descendant.
      var TEXT = '#eef4f8';
      node.querySelectorAll('foreignObject *, .nodeLabel, .cluster-label, .cluster-label *').forEach(function (t) {
        t.style.setProperty('color', TEXT, 'important');
      });
      node.querySelectorAll('text, tspan').forEach(function (t) {
        t.style.setProperty('fill', TEXT, 'important');
      });
    });
  }

  // Public-ish handle to the lightbox open() function, set during binding so
  // the per-diagram zoom-button can trigger it without a DOM dispatch.
  let openLightbox = null;

  // Click any rendered diagram to open a fullscreen pan/zoom viewer.
  // Ported from the diagramming-skill markdown-export HTML viewer, adapted for
  // inline SVG (so the .mermaid-scoped dark-mode CSS still applies to the clone).
  // Controls: wheel = zoom centred on cursor, drag = pan, dbl-click = fit/1:1,
  //           Esc / × button / Close button = close, +/-/0/1 keys mirror the
  //           control bar. Pinch + drag for touch.
  function bindDiagramLightbox() {
    let overlay, canvas, label, content;
    let scale = 1, panX = 0, panY = 0;
    let isDragging = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
    let natW = 0, natH = 0;
    let lastTouches = null;

    function build() {
      if (overlay) return;
      overlay = document.createElement('div');
      overlay.className = 'diagram-lightbox';
      overlay.innerHTML =
        '<button type="button" class="viewer-close" aria-label="Close (Esc)" title="Close (Esc)">&times;</button>' +
        '<div class="viewer-canvas"></div>' +
        '<div class="viewer-controls">' +
          '<button type="button" data-act="out" title="Zoom out (-)">&minus;</button>' +
          '<button type="button" data-act="fit" title="Fit to screen (0)">Fit</button>' +
          '<span class="viewer-zoom-label">100%</span>' +
          '<button type="button" data-act="in"  title="Zoom in (+)">+</button>' +
          '<button type="button" data-act="one" title="Actual size (1)">1:1</button>' +
        '</div>';
      document.body.appendChild(overlay);
      canvas = overlay.querySelector('.viewer-canvas');
      label  = overlay.querySelector('.viewer-zoom-label');

      overlay.querySelector('.viewer-close').addEventListener('click', close);
      overlay.querySelector('.viewer-controls').addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const a = btn.getAttribute('data-act');
        if (a === 'out') zoom(-1);
        else if (a === 'in') zoom(1);
        else if (a === 'fit') reset();
        else if (a === 'one') setZoom(1);
      });
      canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('dblclick', function () {
        if (Math.abs(scale - 1) < 0.01) reset(); else setZoom(1);
      });
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd);
    }
    function update() {
      if (!content) return;
      content.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
      if (label) label.textContent = Math.round(scale * 100) + '%';
    }
    function open(svg) {
      build();
      canvas.querySelectorAll('.mermaid').forEach(function (m) { m.remove(); });
      // Read the rendered size BEFORE cloning so pan/zoom has a stable base.
      const r = svg.getBoundingClientRect();
      natW = r.width  || 800;
      natH = r.height || 600;
      // Wrap in .mermaid so the dark-mode CSS rules (row-rect overrides etc.)
      // still match inside the lightbox.
      const wrap = document.createElement('div');
      wrap.className = 'mermaid';
      const clone = svg.cloneNode(true);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.style.display = 'block';
      // Pin the clone to the natural rendered size so transform: scale() is
      // multiplicative on a known base.
      wrap.style.width  = natW + 'px';
      wrap.style.height = natH + 'px';
      wrap.appendChild(clone);
      canvas.appendChild(wrap);
      content = wrap;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Defer fit until after layout so canvas.clientWidth/Height are populated.
      requestAnimationFrame(reset);
    }
    function close() {
      if (!overlay) return;
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if (canvas) canvas.querySelectorAll('.mermaid').forEach(function (m) { m.remove(); });
      content = null;
    }
    function reset() {
      if (!canvas || !content) return;
      const vw = canvas.clientWidth, vh = canvas.clientHeight;
      // SVGs are vector — allow scaling above 1.0 to fill the viewport.
      const fitScale = Math.min(vw / natW, vh / natH) * 0.95;
      scale = fitScale;
      panX  = (vw - natW * scale) / 2;
      panY  = (vh - natH * scale) / 2;
      update();
    }
    function zoom(dir) {
      const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
      const factor = dir > 0 ? 1.25 : 0.8;
      const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
      panX = cx - (cx - panX) * (newScale / scale);
      panY = cy - (cy - panY) * (newScale / scale);
      scale = newScale;
      update();
    }
    function setZoom(z) {
      const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
      panX = cx - (cx - panX) * (z / scale);
      panY = cy - (cy - panY) * (z / scale);
      scale = z;
      update();
    }
    function onDown(e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startPanX = panX; startPanY = panY;
      canvas.classList.add('dragging');
      e.preventDefault();
    }
    function onMove(e) {
      if (!isDragging) return;
      panX = startPanX + (e.clientX - startX);
      panY = startPanY + (e.clientY - startY);
      update();
    }
    function onUp() {
      isDragging = false;
      if (canvas) canvas.classList.remove('dragging');
    }
    function onWheel(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
      panX = mx - (mx - panX) * (newScale / scale);
      panY = my - (my - panY) * (newScale / scale);
      scale = newScale;
      update();
    }
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startPanX = panX; startPanY = panY;
      }
      lastTouches = Array.from(e.touches);
      e.preventDefault();
    }
    function onTouchMove(e) {
      if (e.touches.length === 1 && isDragging) {
        panX = startPanX + (e.touches[0].clientX - startX);
        panY = startPanY + (e.touches[0].clientY - startY);
        update();
      } else if (e.touches.length === 2 && lastTouches && lastTouches.length === 2) {
        const oldDist = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
        const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const factor = newDist / oldDist;
        let mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = canvas.getBoundingClientRect();
        mx -= rect.left; my -= rect.top;
        const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
        panX = mx - (mx - panX) * (newScale / scale);
        panY = my - (my - panY) * (newScale / scale);
        scale = newScale;
        update();
        lastTouches = Array.from(e.touches);
      }
      e.preventDefault();
    }
    function onTouchEnd() {
      isDragging = false;
      lastTouches = null;
    }
    // Expose for the zoom-button click handler (added by enhanceDiagrams()).
    // The lightbox is now opened *only* via that explicit button; click on
    // the diagram body no longer triggers it (avoids conflict with the
    // ER entity-click navigation).
    openLightbox = open;
    document.addEventListener('keydown', function (e) {
      if (!overlay || !overlay.classList.contains('open')) return;
      if (e.key === 'Escape')                         close();
      else if (e.key === '+' || e.key === '=')        zoom(1);
      else if (e.key === '-')                         zoom(-1);
      else if (e.key === '0')                         reset();
      else if (e.key === '1')                         setZoom(1);
    });
  }

  // ── Per-diagram enhancements ────────────────────────────────────────
  //   - Top-right zoom-icon button (explicit affordance for the lightbox).
  //   - ER entity nodes wired up to navigate to their canonical home: a
  //     local table (h2 with matching id) if one exists on this page,
  //     otherwise the entity's owning page from window.OPDA_ER_REGISTRY.
  // Called after every Mermaid render so it re-runs on theme switch /
  // resize re-renders (previous buttons are replaced when we wipe the
  // .mermaid container in restartMermaid).
  //
  // ZOOM icon SVG (Lucide "expand"): outer corner brackets.
  const ZOOM_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="15 3 21 3 21 9"/>' +
    '<polyline points="9 21 3 21 3 15"/>' +
    '<line x1="21" y1="3" x2="14" y2="10"/>' +
    '<line x1="3" y1="21" x2="10" y2="14"/>' +
    '</svg>';

  let __erRegistryLoading = null;
  function loadErRegistry() {
    if (window.OPDA_ER_REGISTRY) return Promise.resolve(window.OPDA_ER_REGISTRY);
    if (__erRegistryLoading) return __erRegistryLoading;
    __erRegistryLoading = new Promise(function (resolve) {
      // Resolve the registry path relative to current page depth so that
      // it works under /docs/pages/ as well as /docs/.
      var s = document.createElement('script');
      var loc = detectLocation && detectLocation();
      var prefix = (loc === 'pages' ? '../' : '');
      s.src = prefix + 'data/schema-er-registry.js';
      s.async = true;
      s.onload  = function () { resolve(window.OPDA_ER_REGISTRY || {}); };
      s.onerror = function () { window.OPDA_ER_REGISTRY = {}; resolve({}); };
      document.head.appendChild(s);
    });
    return __erRegistryLoading;
  }

  // Possible id forms for a Mermaid entity name. Tries common
  // singular/plural variants because ER entity names use UPPER_SNAKE
  // singular forms (PARTICIPANT) while section ids are often plural
  // (participants) or singular (transaction).
  function entityNameForms(name) {
    var lower = name.toLowerCase();
    var forms = [lower, lower + 's', lower.replace(/-/g, '_')];
    if (lower.length > 1 && lower.charAt(lower.length - 1) === 's') {
      forms.push(lower.slice(0, -1));
    }
    return forms;
  }

  function findLocalSectionTarget(entityName) {
    var forms = entityNameForms(entityName);
    // 1) Direct id match — h2/h3/h4 anchor named exactly like the entity.
    for (var i = 0; i < forms.length; i++) {
      var el = document.getElementById(forms[i]);
      if (el && /^H[1-6]$/.test(el.tagName)) return forms[i];
    }
    // 2) Fallback: object-table headers stamp data-display-id with the
    // short ER box name. Multiple object tables can share that label
    // (e.g. two "Report" objects from different paths); scroll to the
    // first one. Return the element's own `id` so navigation works.
    for (var j = 0; j < forms.length; j++) {
      var el2 = document.querySelector('[data-display-id="' + forms[j] + '"]');
      if (el2 && el2.id) return el2.id;
    }
    return null;
  }

  // Parse an erDiagram source into { blocks, relations }.
  //   blocks    – Set of entity names that have an attribute block `{ … }`
  //               on this page. These are entities "defined" here.
  //   relations – Array of [A, B] pairs from each relation line.
  // Robust to comments, blank lines, and `erDiagram` header.
  function parseErDiagram(src) {
    var blocks    = Object.create(null);
    var relations = [];
    var lines = (src || '').split('\n');
    var inBlock = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === '%') continue;
      if (line === 'erDiagram' || /^erDiagram\b/.test(line)) continue;
      if (inBlock) {
        if (line === '}') inBlock = false;
        continue;
      }
      var bm = line.match(/^([A-Z][A-Z_0-9]*)\s*\{/);
      if (bm) { blocks[bm[1]] = true; inBlock = true; continue; }
      // Relationship form: NAME <cardinality> NAME : "label"
      // Cardinality is a punct cluster like ||--o{ , }o--|| , etc.
      var rm = line.match(/^([A-Z][A-Z_0-9]+)\s+([|}{o.-]+)\s+([A-Z][A-Z_0-9]+)/);
      if (rm) relations.push([rm[1], rm[3]]);
    }
    return { blocks: blocks, relations: relations };
  }

  // Walk relationships from `name` looking for a related entity that has a
  // local section target on the current page. Returns the section id or null.
  function findRelatedLocalSection(name, erMeta) {
    var seen = Object.create(null);
    var queue = [name];
    seen[name] = true;
    while (queue.length) {
      var cur = queue.shift();
      for (var i = 0; i < erMeta.relations.length; i++) {
        var r = erMeta.relations[i];
        var other = null;
        if (r[0] === cur) other = r[1];
        else if (r[1] === cur) other = r[0];
        if (!other || seen[other]) continue;
        seen[other] = true;
        var local = findLocalSectionTarget(other);
        if (local) return local;
        queue.push(other);
      }
    }
    return null;
  }

  function resolveErTarget(name, erMeta, registry) {
    // 1) Exact local section match — covers entities whose name maps to an
    //    h2 on this page (TRANSACTION → #transaction, PARTICIPANT → #participants).
    var localId = findLocalSectionTarget(name);
    if (localId) return { kind: 'local', anchor: localId };

    // 2) If this entity has an attribute block on the current page (= is
    //    "defined" here as sub-data of something), walk its relationships
    //    to find a neighbour with a local section target. This handles
    //    IDENTITY/ROLE/CAPACITY → the participants section they belong to.
    if (erMeta.blocks[name]) {
      var related = findRelatedLocalSection(name, erMeta);
      if (related) return { kind: 'local', anchor: related };
    }

    // 3) Cross-page canonical home (ADDRESS → page 37, ATTACHMENT → page 48).
    if (registry && registry[name]) {
      return { kind: 'cross', page: registry[name].page, anchor: registry[name].anchor };
    }
    return null;
  }

  function attachZoomButton(figure) {
    if (figure.querySelector('.diagram-zoom-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diagram-zoom-btn';
    btn.setAttribute('aria-label', 'Open fullscreen viewer');
    btn.title = 'Open fullscreen viewer';
    btn.innerHTML = ZOOM_ICON_SVG;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var svg = figure.querySelector('.mermaid svg');
      if (svg && typeof openLightbox === 'function') openLightbox(svg);
    });
    figure.appendChild(btn);
  }

  // Find every ER entity group in the SVG and wire a click handler.
  // Mermaid 11 (ER + ELK layout) emits entity nodes as
  //   <g class="node default" id="mermaid-<digits>-entity-<NAME>-<n>">
  // Older Mermaid versions used `id="entity-<NAME>-<n>"`. We accept both.
  // Entity name is parsed out of the id since the inner label may not be
  // populated for entities with no attribute block.
  function attachErEntityClicks(figure) {
    var svg = figure.querySelector('.mermaid svg');
    if (!svg || svg.getAttribute('class') !== 'erDiagram') return;
    // Match both `mermaid-…-entity-NAME-N` and `entity-NAME-N` id forms.
    var nodes = svg.querySelectorAll('g.node[id*="entity-"], g[id^="entity-"]');
    if (!nodes.length) return;

    // Parse the original Mermaid source so we know which entities have
    // attribute blocks here and what they're connected to. The source is
    // cached on the .mermaid container by OPDA.init().
    var mermaidEl = figure.querySelector('.mermaid');
    var src = (mermaidEl && (mermaidEl.dataset.mermaidSrc || mermaidEl.textContent)) || '';
    var erMeta = parseErDiagram(src);

    // Capture once; resolution is cheap (no fetch beyond the one promise)
    loadErRegistry().then(function (registry) {
      nodes.forEach(function (g) {
        if (g.classList.contains('er-clickable')) return;
        // Pull entity name out of the id — Mermaid 11 format is
        //   `mermaid-<digits>-entity-<NAME>-<index>`, older was
        //   `entity-<NAME>-<index>`. NAME is UPPER_SNAKE so the regex
        //   matches `[A-Z][A-Z_0-9]*`.
        var idMatch = (g.id || '').match(/entity-([A-Z][A-Z_0-9]*)-\d+$/);
        var raw = idMatch ? idMatch[1] : '';
        if (!raw) {
          // Fallback: read text label content (older Mermaid).
          var label = g.querySelector('text.entityLabel, .entityLabel, .label.name text, .label.name');
          raw = label ? (label.textContent || '').trim() : '';
        }
        if (!raw) return;
        // Mermaid sometimes renders underscores as spaces. Normalise.
        var name = raw.toUpperCase().replace(/\s+/g, '_');

        var target = resolveErTarget(name, erMeta, registry);
        if (!target) return;

        g.classList.add('er-clickable');
        g.setAttribute('role', 'link');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label',
          target.kind === 'local'
            ? 'Jump to ' + target.anchor + ' section'
            : 'Go to ' + target.page + (target.anchor ? '#' + target.anchor : ''));

        function navigate(e) {
          e.preventDefault();
          e.stopPropagation();
          if (target.kind === 'local') {
            var el = document.getElementById(target.anchor);
            if (el) {
              history.pushState(null, '', '#' + target.anchor);
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            // Resolve relative to current location depth.
            var loc = detectLocation && detectLocation();
            var prefix = (loc === 'pages' ? '' : 'pages/');
            window.location.href = prefix + target.page + (target.anchor ? '#' + target.anchor : '');
          }
        }
        g.addEventListener('click', navigate);
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') navigate(e);
        });
      });
    });
  }

  // Schedule enhanceDiagrams() across a few short delays so the call
  // succeeds even when mermaid.run() resolves before SVGs land in the DOM
  // (notably under the ELK layout engine, which can take several hundred
  // ms past the .then() resolution to actually mount each SVG). Uses
  // setTimeout rather than requestAnimationFrame so it still runs in
  // background / throttled tabs. Caps total wait at ~6s.
  function scheduleEnhanceDiagrams() {
    var attempts = 0;
    var max = 30;
    function tick() {
      attempts += 1;
      enhanceDiagrams();
      var diagrams = document.querySelectorAll('.diagram');
      var anyMissingButton = false;
      diagrams.forEach(function (fig) {
        if (fig.querySelector('.mermaid svg') && !fig.querySelector('.diagram-zoom-btn')) {
          anyMissingButton = true;
        }
      });
      if (anyMissingButton && attempts < max) {
        setTimeout(tick, 200);
      } else {
        // After buttons are in place, check for mis-measured diagrams
        // (most common: Gantt + ER under ELK rendered before the grid
        //  column settled, so the SVG is stuck at the initial ~300px).
        setTimeout(correctMisrenderedDiagrams, 300);
      }
    }
    setTimeout(tick, 0);
  }

  // Detect diagrams whose SVG is significantly narrower than its container
  // and re-render those once with the correct width. Runs after the initial
  // mermaid pass has settled. Each container is re-measured at request time
  // so a window resize or sidebar mount won't be missed.
  var __misrenderRecheckOnce = false;
  function correctMisrenderedDiagrams() {
    // ONE corrective re-render per page load — full stop. Was previously a
    // post-check that didn't actually block the re-run, so a diagram whose
    // natural width is below the 60% threshold (now common for ER blocks
    // that only contain pure-container objects) would loop and produce a
    // visible flicker.
    if (__misrenderRecheckOnce) return;
    __misrenderRecheckOnce = true;

    var toFix = [];
    document.querySelectorAll('.mermaid').forEach(function (el) {
      var svg = el.querySelector('svg');
      if (!svg || !el.dataset.mermaidSrc) return;
      var containerW = el.getBoundingClientRect().width;
      var svgW = svg.getBoundingClientRect().width;
      // If the container has plenty of room but the SVG is < 60% of it,
      // mermaid mis-measured. Threshold is generous because some diagrams
      // are legitimately narrow (e.g. a tiny state machine).
      if (containerW >= 500 && svgW < containerW * 0.6 && svgW < 500) {
        toFix.push(el);
      }
    });
    if (!toFix.length) return;
    toFix.forEach(function (el) {
      el.textContent = el.dataset.mermaidSrc;
      el.removeAttribute('data-processed');
    });
    if (window.mermaid && window.mermaid.run) {
      window.mermaid.run({ querySelector: '.mermaid:not([data-processed])' })
        .then(function () {
          // Re-apply zoom buttons / ER click wiring on the freshly-rendered
          // SVGs (they were thrown away when we wiped the container).
          var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          try { applyMermaidClassDefOverrides(isDark); } catch (_) {}
          scheduleEnhanceDiagrams();
        })
        .catch(function () { /* a sibling block may fail; ignore */ });
    }
  }

  function enhanceDiagrams() {
    document.querySelectorAll('.diagram').forEach(function (figure) {
      // The CSS rule sets .diagram { position: relative; } so absolute-positioned
      // buttons land in the right corner. Skip elements without a rendered SVG
      // (Mermaid hasn't run yet) — we'll be called again on the next tick.
      if (!figure.querySelector('.mermaid svg')) return;
      attachZoomButton(figure);
      attachErEntityClicks(figure);
    });
  }

  // Helper: auto-detect section from active page id. Walks the tree of
  // items (each item is leaf or folder-with-children) so any nesting depth
  // resolves to the right section.
  function sectionForPage(pageId) {
    function itemMatch(item) {
      if (item.id === pageId) return true;
      if (item.children) {
        for (const c of item.children) if (itemMatch(c)) return true;
      }
      return false;
    }
    for (const key in SECTIONS) {
      for (const group of SECTIONS[key].groups) {
        for (const item of (group.items || [])) {
          if (itemMatch(item)) return key;
        }
      }
    }
    return null;
  }

  window.OPDA = {
    init: function (opts) {
      const page = (opts && opts.page) || '';
      const section = (opts && opts.section) || sectionForPage(page);
      try {
        // Apply theme BEFORE mountChrome so any data-theme-aware CSS catches up
        applyTheme(resolveTheme());
        // Stamp the page + section ids on <html> so CSS can scope per page.
        document.documentElement.setAttribute('data-page', page);
        if (section) document.documentElement.setAttribute('data-section', section);
        mountChrome(page, section);
        bindThemeToggle();
        renderToc();       // before enhanceHeadings so heading text is clean
        enhanceHeadings();
        // Cache original Mermaid source BEFORE rendering so theme toggle can re-run
        document.querySelectorAll('.mermaid').forEach(function (el) {
          if (!el.dataset.mermaidSrc) el.dataset.mermaidSrc = el.textContent.trim();
        });
        runMermaid();
        bindDiagramLightbox();
      } catch (err) {
        console.error('[OPDA] init failed:', err);
      }
    },
    // Exposed for index.html / landing pages to render content dynamically
    SECTIONS: SECTIONS,
    REFERENCE_ITEMS: REFERENCE_ITEMS,
  };
})();
