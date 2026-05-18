#!/usr/bin/env node
/**
 * Per-page migration helper for the idiomatic-Astro refactor.
 *
 * Usage:
 *   node scripts/migrate-page.mjs <file>
 *
 * Transforms an already-moved .astro file:
 *   1. Rewrites Layout/PageMeta/PageFooter/Diagram imports to @/ alias paths.
 *   2. Updates Layout import to @/layouts/ (since the new Layout lives there).
 *   3. Removes the PageFooter import line (PageFooter is auto-included by Layout).
 *   4. Drops `page=`, `section=` props from the Layout opening tag.
 *   5. Removes the `<PageFooter prev={...} next={...} />` block at end of body
 *      (Layout now renders PageFooter automatically with derived prev/next).
 *   6. Rewrites internal `href="NN-slug.html"` references to new slug URLs
 *      using the URL_MAP below.
 *
 * Idempotent — re-running on a migrated file is a no-op.
 */
import fs from 'node:fs';
import path from 'node:path';

// Old filename -> new URL. Built from src/lib/site.ts SECTIONS data.
const URL_MAP = {
  // Strategy
  '09-project-roadmap.html':        '/strategy/project-roadmap',
  '70-strategy-overview.html':      '/strategy/strategy-overview',
  '71-programme-phases.html':       '/strategy/programme-phases',
  '72-industrial-strategy.html':    '/strategy/industrial-strategy',
  // Governance
  '01-uk-initiative.html':          '/governance/uk-initiative',
  '02-legislation.html':            '/governance/legislation',
  '03-departments.html':            '/governance/departments',
  '04-steering-forums.html':        '/governance/steering-forums',
  '05-sandbox.html':                '/governance/sandbox',
  '07-toip-governance.html':        '/governance/toip-governance',
  '08-strategic-alignment.html':    '/governance/strategic-alignment',
  '11-opda-members.html':           '/governance/opda-members',
  '20-conformance-scheme.html':     '/governance/conformance-scheme',
  '21-change-management.html':      '/governance/change-management',
  '22-lifecycle-versioning.html':   '/governance/lifecycle-versioning',
  '23-risk-liability.html':         '/governance/risk-liability',
  '24-data-stewardship.html':       '/governance/data-stewardship',
  '25-meetings-and-feedback.html':  '/governance/meetings-and-feedback',
  '26-stakeholder-engagement.html': '/governance/stakeholder-engagement',
  // Engagement
  '40-engagement-overview.html': '/engagement/engagement-overview',
  '41-meetings-decisions.html':  '/engagement/meetings-decisions',
  '42-working-groups.html':      '/engagement/working-groups',
  '43-video-library.html':       '/engagement/video-library',
  '44-transcripts.html':         '/engagement/transcripts',
  // Modelling
  '06-standards-stack.html':  '/modelling/standards-stack',
  '12-bounded-contexts.html': '/modelling/bounded-contexts',
  '13-data-dictionary.html':  '/modelling/data-dictionary',
  '14-business-glossary.html':'/modelling/business-glossary',
  '16-overlays.html':         '/modelling/overlays',
  '30-concept-taxonomy.html': '/modelling/concept-taxonomy',
  '31-ontology.html':         '/modelling/ontology',
  '32-shacl-shapes.html':     '/modelling/shacl-shapes',
  '33-jsonld-mappings.html':  '/modelling/jsonld-mappings',
  // Schema (section landing was 34-physical-architecture)
  '34-physical-architecture.html':  '/schema',
  '35-transaction-participants.html': '/schema/transaction-participants',
  '36-chain-milestones-contracts.html': '/schema/chain-milestones',
  '37-property.html':                '/schema/property',
  '38-legal-estate-title.html':      '/schema/legal-estate',
  '38a-tenure.html':                 '/schema/legal-estate/tenure',
  '38b-title-oc-summary.html':       '/schema/legal-estate/title/oc-summary',
  '38b1-title-number.html':          '/schema/legal-estate/title/oc-summary/title-number',
  '38b2-title-oc-meta.html':         '/schema/legal-estate/title/oc-summary/oc-meta',
  '38b3-title-oc-owners.html':       '/schema/legal-estate/title/oc-summary/oc-owners',
  '38b4-title-oc-charges-main.html': '/schema/legal-estate/title/oc-summary/oc-charges-main',
  '38b5-title-oc-charges-other.html':'/schema/legal-estate/title/oc-summary/oc-charges-other',
  '38b6-title-oc-notices-main.html': '/schema/legal-estate/title/oc-summary/oc-notices-main',
  '38b7-title-oc-notices-other.html':'/schema/legal-estate/title/oc-summary/oc-notices-other',
  '38c-title-oc-full.html':          '/schema/legal-estate/title/oc-full',
  '38d-ownership-freehold.html':     '/schema/legal-estate/ownership/freehold',
  '38e-ownership-leasehold.html':    '/schema/legal-estate/ownership/leasehold',
  '38e1-lease-term.html':            '/schema/legal-estate/ownership/leasehold/lease-term',
  '38e2-lease-contacts-list.html':   '/schema/legal-estate/ownership/leasehold/lease-contacts-list',
  '38e3-lease-contacts-roles.html':  '/schema/legal-estate/ownership/leasehold/lease-contacts-roles',
  '38e4-lease-management.html':      '/schema/legal-estate/ownership/leasehold/lease-management',
  '38e5-lease-rent.html':            '/schema/legal-estate/ownership/leasehold/lease-rent',
  '38e6-lease-charges.html':         '/schema/legal-estate/ownership/leasehold/lease-charges',
  '38e6a-lease-service-charge.html': '/schema/legal-estate/ownership/leasehold/lease-charges/service-charge',
  '38e6b-lease-buildings-insurance.html': '/schema/legal-estate/ownership/leasehold/lease-charges/buildings-insurance',
  '38e7-lease-legal.html':           '/schema/legal-estate/ownership/leasehold/lease-legal',
  '38e7a-lease-consents-alterations.html': '/schema/legal-estate/ownership/leasehold/lease-legal/consents-alterations',
  '38e7b-lease-restrictions-enfranchisement.html': '/schema/legal-estate/ownership/leasehold/lease-legal/restrictions-enfranchisement',
  '38e7c-lease-building-safety.html':'/schema/legal-estate/ownership/leasehold/lease-legal/building-safety',
  '38e7d-lease-transfer.html':       '/schema/legal-estate/ownership/leasehold/lease-legal/lease-transfer',
  '38e8-lease-misc.html':            '/schema/legal-estate/ownership/leasehold/lease-misc',
  '38e8a-lease-disputes.html':       '/schema/legal-estate/ownership/leasehold/lease-misc/disputes',
  '38e8b-lease-general.html':        '/schema/legal-estate/ownership/leasehold/lease-misc/general',
  '38e8c-lease-required-docs.html':  '/schema/legal-estate/ownership/leasehold/lease-misc/required-docs',
  '38f-ownership-managed.html':      '/schema/legal-estate/ownership/managed',
  '38f1-managed-contacts.html':      '/schema/legal-estate/ownership/managed/contacts',
  '38f2-managed-transfer.html':      '/schema/legal-estate/ownership/managed/transfer',
  '38f3-managed-service-charge.html':'/schema/legal-estate/ownership/managed/service-charge',
  '38f4-managed-insurance.html':     '/schema/legal-estate/ownership/managed/insurance',
  '38f5-managed-disputes-docs.html': '/schema/legal-estate/ownership/managed/disputes-docs',
  '38g-boundaries-rights.html':      '/schema/legal-estate/boundaries-rights',
  '39-built-form-condition-valuation.html': '/schema/built-form',
  '39a-built-form.html':         '/schema/built-form/built-form-form',
  '39b-condition.html':          '/schema/built-form/condition',
  '39c-fixtures.html':           '/schema/built-form/fixtures',
  '39c1-fixtures-summary.html':  '/schema/built-form/fixtures/fixtures-summary',
  '39c2-fixtures-basic.html':    '/schema/built-form/fixtures/basic',
  '39c3-fixtures-kitchen.html':  '/schema/built-form/fixtures/kitchen',
  '39c4-fixtures-bathroom.html': '/schema/built-form/fixtures/bathroom',
  '39c5-fixtures-carpets.html':  '/schema/built-form/fixtures/carpets',
  '39c6-fixtures-curtains.html': '/schema/built-form/fixtures/curtains',
  '39c7-fixtures-lights.html':   '/schema/built-form/fixtures/lights',
  '39c8-fixtures-units.html':    '/schema/built-form/fixtures/units',
  '39c9-fixtures-outdoor.html':  '/schema/built-form/fixtures/outdoor',
  '39c10-fixtures-services.html':'/schema/built-form/fixtures/services',
  '39d-surveys.html':            '/schema/built-form/surveys',
  '39d1-survey-meta.html':       '/schema/built-form/surveys/meta',
  '39d2-survey-grounds.html':    '/schema/built-form/surveys/grounds',
  '39d3-survey-inside-structure.html': '/schema/built-form/surveys/inside-structure',
  '39d4-survey-inside-features.html':  '/schema/built-form/surveys/inside-features',
  '39d5-survey-inside-finishes.html':  '/schema/built-form/surveys/inside-finishes',
  '39d6-survey-outside-roof.html':     '/schema/built-form/surveys/outside-roof',
  '39d7-survey-outside-envelope.html': '/schema/built-form/surveys/outside-envelope',
  '39d8-survey-outside-extras.html':   '/schema/built-form/surveys/outside-extras',
  '39d9-survey-services-energy.html':  '/schema/built-form/surveys/services-energy',
  '39d10-survey-services-water.html':  '/schema/built-form/surveys/services-water',
  '39d11-survey-legal.html':           '/schema/built-form/surveys/legal',
  '39d12-survey-valuation.html':       '/schema/built-form/surveys/valuation',
  '39d13-survey-advice.html':          '/schema/built-form/surveys/advice',
  '39e-valuation.html':                '/schema/built-form/valuation',
  '45-utilities-energy.html':          '/schema/utilities-energy',
  '46-local-context-searches.html':    '/schema/local-context',
  '46a-con29r.html':                   '/schema/local-context/con29r',
  '46a1-local-authority-identity.html':'/schema/local-context/con29r/identity',
  '46a2-local-authority-searches.html':'/schema/local-context/con29r/searches',
  '46a2a-la-planning-building.html':   '/schema/local-context/con29r/searches/planning-building',
  '46a2b-la-roads.html':               '/schema/local-context/con29r/searches/roads',
  '46a2c-la-other-planning-notices.html':'/schema/local-context/con29r/searches/other-planning-notices',
  '46a2d-la-other-finance.html':       '/schema/local-context/con29r/searches/other-finance',
  '46a2e-la-other-road-rail.html':     '/schema/local-context/con29r/searches/other-road-rail',
  '46a2f-la-other-environmental.html': '/schema/local-context/con29r/searches/other-environmental',
  '46a2g-la-other-compulsory.html':    '/schema/local-context/con29r/searches/other-compulsory',
  '46a4-listing-conservation.html':    '/schema/local-context/con29r/listing-conservation',
  '46c-llc1.html':                     '/schema/local-context/llc1',
  '46d-environmental.html':            '/schema/local-context/environmental',
  '46d1-flooding.html':                '/schema/local-context/environmental/flooding',
  '46d2-mining-ground.html':           '/schema/local-context/environmental/mining-ground',
  '46d3-pollution-radon.html':         '/schema/local-context/environmental/pollution-radon',
  '46d4-coast-climate.html':           '/schema/local-context/environmental/coast-climate',
  '46d5-infra-policy.html':            '/schema/local-context/environmental/infra-policy',
  '47-encumbrances-completion.html':   '/schema/encumbrances',
  '47a-council-tax-insurance.html':    '/schema/encumbrances/council-tax-insurance',
  '47b-guarantees.html':               '/schema/encumbrances/guarantees',
  '47c-occupiers-notices.html':        '/schema/encumbrances/occupiers-notices',
  '47d-letting-completion.html':       '/schema/encumbrances/letting-completion',
  '48-evidence-documents-declarations.html': '/schema/evidence',
  '48a-documents.html':                '/schema/evidence/documents',
  '48b-declarations.html':             '/schema/evidence/declarations',
  '48c-additional.html':               '/schema/evidence/additional',
  '48d-disputes.html':                 '/schema/evidence/disputes',
  '48e-specialist.html':               '/schema/evidence/specialist',
  '49-overlays-tasks-crosscuts.html':  '/schema/overlays-tasks',
  // Adoption
  '50-adoption-overview.html':         '/adoption/adoption-overview',
  '51-member-implementations.html':    '/adoption/member-implementations',
  '52-smart-data-challenge.html':      '/adoption/smart-data-challenge',
  '53-hmlr-llc.html':                  '/adoption/hmlr-llc',
  '54-sandbox-pilots.html':            '/adoption/sandbox-pilots',
  // Implementation
  '60-implementation-overview.html':   '/implementation/implementation-overview',
  '61-quickstart.html':                '/implementation/quickstart',
  '62-schema-composition.html':        '/implementation/schema-composition',
  '63-validation.html':                '/implementation/validation',
  '64-verified-claims.html':           '/implementation/verified-claims',
  // Library
  '80-library-overview.html':          '/library/library-overview',
  '81-document-archive.html':          '/library/document-archive',
  '82-transcript-archive.html':        '/library/transcript-archive',
  '83-external-references.html':       '/library/external-references',
  // Top-level
  '10-glossary.html':                  '/glossary',
};

function transform(content) {
  let out = content;

  // 1. Imports — rewrite to @/ alias paths and drop PageFooter import.
  out = out.replace(
    /^import Layout from ['"][^'"]+Layout\.astro['"];?\s*$/m,
    "import Layout from '@/layouts/Layout.astro';",
  );
  out = out.replace(
    /^import PageMeta from ['"][^'"]+PageMeta\.astro['"];?\s*$/m,
    "import PageMeta from '@/components/PageMeta.astro';",
  );
  out = out.replace(
    /^import Diagram from ['"][^'"]+Diagram\.astro['"];?\s*$/m,
    "import Diagram from '@/components/Diagram.astro';",
  );
  // Remove PageFooter import — PageFooter is now included by Layout automatically.
  out = out.replace(
    /^import PageFooter from ['"][^'"]+PageFooter\.astro['"];?\s*\n/m,
    '',
  );

  // 2. Layout opening tag — drop page=, section= props.
  out = out.replace(/\s*page=\{?["'][^"']*["']\}?/g, '');
  out = out.replace(/\s*section=\{?["'][^"']*["']\}?/g, '');

  // 3. PageFooter block at the bottom of the body — remove.
  //    Matches: <PageFooter\n  prev={{...}}\n  next={{...}}\n/>
  //    Or a single-line variant.
  out = out.replace(
    /\s*<PageFooter\b[^>]*\/?>(?:[\s\S]*?<\/PageFooter>)?\n?/g,
    '\n',
  );

  // 4. Cross-references — rewrite NN-slug.html occurrences using URL_MAP.
  //    Match href="NN-slug.html" (with optional #anchor or query string).
  //    The replacement keeps the anchor / query if present.
  out = out.replace(
    /href=["']([^"']+\.html)([#?][^"']*)?["']/g,
    (match, oldUrl, suffix) => {
      // Strip leading path so we can look up by basename.
      const basename = oldUrl.replace(/^.*\//, '');
      const mapped = URL_MAP[basename];
      if (!mapped) return match; // Unknown URL — leave as-is.
      return `href="${mapped}${suffix || ''}"`;
    },
  );

  return out;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/migrate-page.mjs <file>');
    process.exit(1);
  }
  const abs = path.resolve(file);
  const src = fs.readFileSync(abs, 'utf-8');
  const out = transform(src);
  if (src === out) {
    console.log('  no changes:', file);
    return;
  }
  fs.writeFileSync(abs, out, 'utf-8');
  console.log('  migrated:  ', file);
}

main();
