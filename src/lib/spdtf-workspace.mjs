/** Canonical, versioned workspace contract for SPDTF development. */
export const SEMANTIC_PACKAGE_MANIFEST = Object.freeze({
  id: 'https://opda.org.uk/spdtf/semantic-package/workspace-contract',
  version: '2026-08-22',
  supersedes: Object.freeze({
    id: 'https://opda.org.uk/spdtf-2/semantic-package/workspace-contract',
    version: '1.0.0',
    reason: 'Chair-authorised correction from an unendorsed versioned draft label to the first collaborative SPDTF scheme draft',
  }),
  status: 'workspace contract — no domain candidate approved',
  authority: 'Accepted IA; domain meaning remains subject to working-group review',
  standardsProfileVersion: '0.2-development',
  canonicalSource: '/semantic-modelling/semantic-package',
  outputs: Object.freeze([
    'Business glossary',
    'Data dictionary',
    'Taxonomies',
    'Controlled vocabularies',
    'Resources',
    'Relationships',
  ]),
  projections: Object.freeze([
    'RDF/OWL and SKOS technical view',
    'SHACL validation view',
    'JSON Schema',
    'JSON-LD context',
    'Forms and APIs',
    'Website, PDF and Markdown documentation',
  ]),
  synchronizationRule: 'Every output and projection cites this manifest version; a projection never becomes an independent source of meaning.',
});

export const FORMAL_CONCERNS = Object.freeze([
  'Domain structure',
  'Vocabulary and taxonomy',
  'Classification metadata',
  'Provenance and quality',
  'Access control and data sensitivity',
  'Validation and constraints',
  'Temporal state and history',
  'Cross-domain mappings',
]);

export const ALLOWED_DISPOSITIONS = Object.freeze([
  'model here',
  'reuse shared',
  'boundary contribution',
  'not applicable',
]);

const workspaceInputs = Object.freeze({
  'finance-and-banking': ['/spdtf/property-pack/contexts/finance-and-banking', '/programme'],
  conveyancing: ['/spdtf/property-pack/contexts/conveyancing', '/spdtf/inputs/pdtf-schema'],
  'estate-agency': ['/spdtf/property-pack/contexts/estate-agency', '/spdtf/inputs/pdtf-schema'],
  'surveying-and-valuation': ['/spdtf/property-pack/contexts/surveying-and-valuation', '/spdtf/inputs/pdtf-schema'],
  'property-data-services': ['/spdtf/property-pack/contexts/property-data-services', '/resources'],
  'property-technology': ['/spdtf/property-pack/contexts/property-technology', '/spdtf/inputs/pdtf-schema'],
  'dbt-smart-data': ['/dbt-smart-data', '/programme'],
  interoperability: ['/semantic-modelling/bounded-contexts', '/semantic-modelling/evidence-and-mappings'],
});

const questions = Object.freeze({
  'finance-and-banking': [
    'Which lending decisions require shared property meaning, and which remain lender-local?',
    'What evidence, provenance and permitted-use semantics must travel with finance data?',
  ],
  conveyancing: [
    'Which facts change legal meaning between instruction, exchange and completion?',
    'Which enquiries and evidence must remain attributable to their issuing authority?',
  ],
  'estate-agency': [
    'Which listing and material-information meanings must be consistent across participants?',
    'How should offers, viewings and seller-supplied evidence retain provenance and status?',
  ],
  'surveying-and-valuation': [
    'How are inspection observations distinguished from professional conclusions?',
    'Which temporal and evidential conditions govern valuation and condition statements?',
  ],
  'property-data-services': [
    'Which source is authoritative for each fact, and how are currency and derivation recorded?',
    'Which reuse restrictions or quality conditions must accompany supplied data?',
  ],
  'property-technology': [
    'Which shared semantics are required for reliable workflow and API interoperability?',
    'Which implementation feedback represents a semantic gap rather than a local interface choice?',
  ],
  'dbt-smart-data': [
    'Which participant, trust, consent and authorisation concepts would a property scheme need?',
    'Which questions are statutory scheme design rather than SPDTF semantic-model decisions?',
  ],
  interoperability: [
    'Which meaning is genuinely shared and belongs in the deliberately small common boundary?',
    'Which qualified mapping preserves intent without collapsing distinct domain concepts?',
  ],
});

const charterExclusions = Object.freeze([
  'No candidate, definition or coverage disposition may be approved before the group is convened.',
  'The workspace cannot make cross-programme governance, statutory or government decisions.',
  'Meaning outside the group remit stays with the owning context or the Interoperability Working Group.',
]);

function evidenceRecord(slug, href, index) {
  return Object.freeze({
    id: `${slug}-input-${index + 1}`,
    href,
    sourceType: href.startsWith('/spdtf/property-pack/') ? 'machine-generated Property Pack ontology candidate' : 'maintained OPDA documentation route',
    recordedDate: '2026-08-19',
    version: `route view at workspace contract ${SEMANTIC_PACKAGE_MANIFEST.version}`,
    submitter: 'OPDA documentation team',
    permission: 'Public OPDA route reference; linked source terms remain controlling',
    sensitivity: 'Public route only; linked records retain their own classification',
    status: 'attributed candidate evidence — no group review recorded',
  });
}

export function getWorkspaceRecord(slug) {
  const inputPaths = workspaceInputs[slug];
  if (!inputPaths) return null;
  return Object.freeze({
    slug,
    manifestId: SEMANTIC_PACKAGE_MANIFEST.id,
    manifestVersion: SEMANTIC_PACKAGE_MANIFEST.version,
    workspaceVersion: '0.1.0-pre-convening',
    status: 'scope defined; working group not confirmed as convened',
    charter: Object.freeze({
      status: 'draft scope record — pre-convening',
      scopeSource: `/spdtf/working-groups/${slug}`,
      exclusions: charterExclusions,
    }),
    decisionOwner: null,
    decisionEligible: false,
    decisionOccurred: false,
    decisionAuthority: 'No person or role may decide until a convened charter names an accountable decision owner.',
    participation: Object.freeze({
      interestRoute: '/join',
      meetingRoute: null,
      status: 'Expression of interest is available; no participant roster or meeting route is recorded.',
    }),
    meetings: Object.freeze([]),
    evidence: Object.freeze(inputPaths.map((href, index) => evidenceRecord(slug, href, index))),
    competencyQuestions: Object.freeze(questions[slug]),
    outputRegister: Object.freeze(SEMANTIC_PACKAGE_MANIFEST.outputs.map((output) => Object.freeze({
      output,
      status: 'not started — no group record',
    }))),
    coverageReceipt: Object.freeze(FORMAL_CONCERNS.map((concern) => Object.freeze({
      concern,
      disposition: null,
      status: 'not assessed — group decision required',
    }))),
    candidate: null,
    candidateVersions: Object.freeze([]),
    candidateDiff: null,
    feedbackDispositions: Object.freeze([]),
    changeHistory: Object.freeze([]),
    sessionRecords: Object.freeze([]),
    technicalExports: Object.freeze([]),
    challengeAction: Object.freeze({
      available: true,
      href: `mailto:smartdata@openpropdata.org.uk?subject=${encodeURIComponent(`SPDTF workspace challenge: ${slug}`)}`,
      status: 'Evidence and question challenges are accepted; formal candidate disposition is disabled.',
      privacyBoundary: 'Identify the page and question only. Do not email confidential, personal, customer or transaction data before OPDA confirms a protected intake route.',
    }),
  });
}

export const WORKSPACE_SLUGS = Object.freeze(Object.keys(workspaceInputs));
