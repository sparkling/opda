/** Canonical, versioned workspace contract for SPDTF 2.0 Development. */
export const SEMANTIC_PACKAGE_MANIFEST = Object.freeze({
  id: 'https://opda.org.uk/spdtf-2/semantic-package/workspace-contract',
  version: '1.0.0',
  status: 'workspace contract — no domain candidate approved',
  authority: 'Accepted IA; domain meaning remains subject to working-group review',
  standardsProfileVersion: '0.1-development',
  canonicalSource: '/spdtf-2/ontologies/semantic-package',
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
  'finance-and-banking': ['/v2/contexts/finance-and-banking', '/programme'],
  conveyancing: ['/v2/contexts/conveyancing', '/pdtf-1'],
  'estate-agency': ['/v2/contexts/estate-agency', '/pdtf-1'],
  'surveying-and-valuation': ['/v2/contexts/surveying-and-valuation', '/pdtf-1'],
  'property-data-services': ['/v2/contexts/property-data-services', '/resources'],
  'property-technology': ['/v2/contexts/property-technology', '/pdtf-1'],
  'dbt-smart-data': ['/dbt-smart-data', '/programme'],
  interoperability: ['/spdtf-2/ontologies/bounded-contexts', '/spdtf-2/ontologies/evidence-and-mappings'],
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

export function getWorkspaceRecord(slug) {
  const inputPaths = workspaceInputs[slug];
  if (!inputPaths) return null;
  return Object.freeze({
    slug,
    manifestId: SEMANTIC_PACKAGE_MANIFEST.id,
    manifestVersion: SEMANTIC_PACKAGE_MANIFEST.version,
    workspaceVersion: '0.1.0-pre-convening',
    status: 'scope defined; working group not confirmed as convened',
    decisionOwner: 'To be recorded when the group is convened',
    evidence: Object.freeze(inputPaths.map((href, index) => Object.freeze({
      id: `${slug}-input-${index + 1}`,
      href,
      status: 'attributed development input — no group review recorded',
    }))),
    competencyQuestions: Object.freeze(questions[slug]),
    coverageReceipt: Object.freeze(FORMAL_CONCERNS.map((concern) => Object.freeze({
      concern,
      disposition: null,
      status: 'not assessed — group decision required',
    }))),
    candidate: null,
    candidateDiff: null,
    feedbackDispositions: Object.freeze([]),
  });
}

export const WORKSPACE_SLUGS = Object.freeze(Object.keys(workspaceInputs));

