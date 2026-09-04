/**
 * One index, one ranking function, one presentation vocabulary.
 *
 * The build-generated corpus at /data/site-search-index.json covers every
 * emitted page. The editorial entries below add alternative terms and remain
 * the dev-server fallback. Both /search and the quick-search dialog rank
 * through `searchEntries` and describe cards through `describeRecord`.
 */
import { GLOBAL_DESTINATIONS, getActiveDestination, getRouteStatus } from './site-ia.mjs';
import {
  COLLECTIONS, DOMAINS, FACETS, KINDS, PAGE_TYPES, RESULT_TYPES, STATUSES,
  SEARCH_INDEX_SCHEMA_VERSION, SEARCH_INDEX_URL,
  classifyRoute, labelFor, normaliseSearchFilters, optionFor,
} from './site-search-model.mjs';

const destinationTitles = new Map(GLOBAL_DESTINATIONS.map(({ key, title }) => [key, title]));
const destinationKeys = new Set(destinationTitles.keys());

function facetFor(url) {
  if (url === '/development/inputs/pdtf-schema' || url.startsWith('/development/inputs/pdtf-schema/schema-and-supporting-material')) {
    return 'PDTF schema';
  }
  if (url.startsWith('/development/inputs/pdtf-schema/schema-derived-ontology')) return 'Schema-derived ontology';
  return destinationTitles.get(getActiveDestination(url)) ?? 'Resources';
}

const entry = (title, url, summary, aliases = []) => {
  const destination = getActiveDestination(url);
  if (!destinationKeys.has(destination)) throw new Error(`Search entry has no canonical destination: ${url}`);
  return Object.freeze({ title, url, summary, aliases: Object.freeze(aliases), facet: facetFor(url), destination });
};

/** Editorial entries: alternative terms merged into the generated index, and the dev fallback. */
export const SITE_SEARCH_ENTRIES = Object.freeze([
  entry('Programme', '/programme', 'Purpose, schema-to-scheme progression, roadmap and UK Smart Data context', ['PDTF', 'SPDTF']),
  entry('Development', '/development', 'First collaboratively authored scheme draft, using domain-led and evidence-up semantic modelling', ['SPDTF', 'PDTF', 'ontology']),
  entry('Property Pack ontology', '/development/property-pack', 'Accelerated SPDTF component awaiting Technical Working Group determination', ['Property Pack', 'PDTF', 'ontology']),
  entry('Property Pack definition and scope', '/development/property-pack/definition-and-scope', 'Interactive catalogue of all 451 required source items and candidate dispositions', ['Property Pack', 'data dictionary']),
  entry('PDTF schema to Property Pack lineage', '/development/property-pack/pdtf-schema-lineage', 'Schema coverage and the incomplete ontology semantic crosswalk', ['Property Pack', 'PDTF', 'crosswalk']),
  entry('Property Pack technical determination', '/development/property-pack/technical-working-group-determination', 'End-of-September 2026 Technical Working Group milestone and pending decision record', ['Property Pack', 'Technical Working Group']),
  entry('Groups', '/development/working-groups', 'Canonical participant workspaces and review routes', ['PDTF', 'participants']),
  entry('Join a working group', '/join', 'Register an expression of interest in contributing domain knowledge to SPDTF working groups', ['participation', 'register', 'sign up']),
  entry('Working-group privacy notice', '/join/privacy', 'How OPDA uses personal information supplied through the working-group expression-of-interest form', ['privacy', 'registration']),
  entry('Working-group member guide', '/development/working-groups/member-guide', 'How members join, discuss, share evidence, attend meetings and review models', ['Teams', 'SharePoint', 'participants']),
  entry('Accessibility statement', '/accessibility', 'How accessible the OPDA knowledge base is, known limitations and how to report an accessibility problem', ['accessibility', 'WCAG', 'reasonable adjustment']),
  entry('Getting started in a working group', '/development/working-groups/member-guide/getting-started', 'Membership, access, roles and the first-day checklist', ['Teams', 'SharePoint', 'invitation']),
  entry('Teams and working-group discussions', '/development/working-groups/member-guide/teams-and-discussions', 'Channels, threads, page comments, email and discussion etiquette', ['Microsoft Teams', 'comments']),
  entry('Source material and SharePoint', '/development/working-groups/member-guide/source-material-and-sharepoint', 'Private organisation intake, evidence formats, provenance and submission boundaries', ['evidence', 'upload', 'SharePoint']),
  entry('Meetings and records', '/development/working-groups/member-guide/meetings-and-records', 'Preparing for meetings, asynchronous follow-up, transcripts and durable records', ['minutes', 'transcripts', 'feedback']),
  entry('Model review and decisions', '/development/working-groups/member-guide/model-review-and-decisions', 'How members review candidates and how human authority differs from AI assistance', ['candidate', 'review', 'decisions']),
  entry('Candidate register', '/development/candidates', 'Status of context-owned candidates, owners and immutable diffs', ['PDTF']),
  entry('Open questions and changes', '/development/questions', 'Competency questions grouped by semantic owner', ['PDTF']),
  entry('Outputs and validation evidence', '/development/outputs', 'Versioned semantic package and projection status', ['PDTF']),
  entry('Modelling', '/semantic-modelling', 'Choose a plain-language ontology guide or the SPDTF implementation documentation', ['PDTF', 'ontology', 'ontologies and semantic modelling', 'RDF', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Understand ontologies', '/semantic-modelling/why-ontologies', 'What an ontology is and why SPDTF uses connected semantic modelling', ['PDTF', 'ontology']),
  entry('How to read the model', '/semantic-modelling/reading-the-model', 'Identifiers, resources, classes, properties, values, shapes and provenance', ['ontology']),
  entry('How we model SPDTF', '/semantic-modelling/modelling-method', 'Evidence-up modelling, competency questions, review and authority boundaries', ['PDTF', 'ontology', 'method']),
  entry('Six-part semantic package', '/semantic-modelling/semantic-package', 'Glossary, dictionary, taxonomies, vocabularies, resources and relationships', ['PDTF', 'ontology', 'RDF', 'OWL', 'SKOS', 'SHACL']),
  entry('Contexts and common boundary', '/semantic-modelling/bounded-contexts', 'Semantic homes, context ownership, interoperability and the Property Pack profile', ['ontology', 'bounded context', 'bounded contexts', 'context map', 'taxonomy', 'taxonomies']),
  entry('Modelling rules and lenses', '/semantic-modelling/modelling-rules', 'Identity, classes, values, relationships, reuse and candidate upper-ontology methods', ['ontology', 'upper ontology', 'UFO', 'gUFO', 'OntoClean']),
  entry('Coverage checklist', '/semantic-modelling/coverage', 'Six outputs, eleven workshop themes, eight formal concerns and four dispositions', ['PDTF', 'ontology']),
  entry('Standards profile', '/semantic-modelling/standards', 'Actual implementation, specification maturity, targets, candidates and deferred options', ['PDTF', 'ontology', 'RDF', 'RDFS', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Evidence and qualified mappings', '/semantic-modelling/evidence-and-mappings', 'Competency questions, provenance, Category 8 cross-context mapping, SKOS predicates and the deferred SSSOM candidate', ['ontology', 'ontology mapping', 'cross-context mapping', 'cross-domain mapping', 'SKOS mapping', 'SSSOM', 'SEMAPV', 'Category 8']),
  entry('Validation, review and projections', '/semantic-modelling/validation', 'SHACL, competency queries, semantic review, governance and generated outputs', ['ontology']),
  entry('Third-party inputs', '/development/inputs', 'Sources considered as evidence, compatibility material or modelling input; inclusion does not imply adoption or authority', ['inputs', 'evidence']),
  entry('PDTF schema', '/development/inputs/pdtf-schema', 'Third-party Digital Property Pack schema input; inclusion does not confer OPDA endorsement or SPDTF authority', ['PDTF', 'third-party input']),
  entry('PDTF schema and supporting material', '/development/inputs/pdtf-schema/schema-and-supporting-material', 'Third-party JSON Schemas, overlays, data dictionary and business glossary, with separately attributed implementation and usage evidence', ['PDTF', 'JSON Schema', 'data dictionary', 'business glossary']),
  entry('Schema-derived ontology modelling material', '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling', 'Historical modelling documentation for the ontology derived from the PDTF schema', ['PDTF']),
  entry('Model views by audience', '/development/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience', 'Schema-derived concept, logical, ontology, deployment and relational presentations', ['PDTF', 'derived model']),
  entry('Schema-derived ontology', '/development/inputs/pdtf-schema/schema-derived-ontology', 'OPDA-produced non-normative technical derivation of the third-party PDTF schema input', ['PDTF', 'derived evidence']),
  entry('Lineage, provenance and verification', '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification', 'How the schema-derived ontology was modelled, traced and checked against the schema', ['PDTF', 'RML', 'provenance']),
  entry('Concepts and architecture', '/development/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture', 'Identity, semantic contexts, foundations and modelling frameworks in the schema-derived ontology', ['PDTF', 'ontology contexts']),
  entry('Schema-derived ontology contexts', '/development/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture/contexts', 'Context modules in the draft ontology extracted from PDTF schema evidence', ['PDTF', 'bounded contexts']),
  entry('Terms and model resources', '/development/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources', 'Classes, properties, datatypes, vocabularies and the generated term reference', ['PDTF', 'ontology terms']),
  entry('Validation and examples', '/development/inputs/pdtf-schema/schema-derived-ontology/validation-and-examples', 'SHACL shapes, overlay profiles and diagnostic exemplars for the schema-derived ontology', ['PDTF', 'SHACL']),
  entry('Trust, governance and limitations', '/development/inputs/pdtf-schema/schema-derived-ontology/trust-governance-and-limitations', 'Claims, evidence, governance, PII and known limitations of the draft derived ontology', ['PDTF', 'ontology governance']),
  entry('Use and tooling', '/development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling', 'Namespaces, consumption guidance and tool compatibility evidence', ['PDTF', 'ontology tools']),
  entry('PDTF schema RML schema–ontology verification', '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification', 'Bidirectional verification mapping between the schema and the derived ontology', ['PDTF', 'mapping']),
  entry('PDTF schema JSON Schema', '/development/inputs/pdtf-schema/schema-and-supporting-material/schema', 'Published JSON Schema and overlay implementation', ['PDTF']),
  entry('PDTF schema implementation guidance', '/development/inputs/pdtf-schema/schema-and-supporting-material/implementation', 'Implementation material for the existing schema', ['PDTF']),
  entry('PDTF schema usage and implementation evidence', '/development/inputs/pdtf-schema/schema-and-supporting-material/adoption', 'Attributed implementation, pilot and usage records', ['PDTF']),
  entry('Governance', '/governance', 'Authority, status, lifecycle and decisions', ['PDTF', 'SPDTF']),
  entry('Decisions', '/governance/decisions', 'Architecture, ontology and programme records explaining what was decided and why', ['decision records', 'ADR', 'ODR']),
  entry('UK initiative context', '/governance/uk-initiative', 'Legislation, public bodies and steering arrangements around property-data reform', ['government', 'policy']),
  entry('OPDA organisation', '/governance/opda-organisation', 'Member firms and the Trust Framework Sandbox', ['governance', 'members']),
  entry('Standards landscape', '/governance/standards-landscape', 'External trust-framework alignment and strategic context', ['ToIP', 'governance']),
  entry('OPDA rules', '/governance/opda-rules', 'Current, draft and proposed rules with their own status', ['lifecycle', 'conformance', 'risk']),
  entry('Operating Model', '/governance/operating-model', 'Stewardship, meetings, engagement and attachment handling', ['governance', 'decision rights']),
  entry('Quality and security', '/governance/quality-and-security', 'Data-quality and data-security framework records', ['assurance', 'controls']),
  entry('Resources', '/resources', 'Source registry, glossary and machine-readable manifests', ['PDTF', 'SPDTF']),
]);

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLocaleLowerCase('en-GB')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Coerce any index record (schema 1 or 2, editorial or generated) into the canonical shape. */
export function normaliseSearchRecord(record) {
  const url = String(record.url ?? '');
  const defaults = classifyRoute(url);
  const destination = record.destination ?? getActiveDestination(url) ?? 'resources';
  const type = optionFor(RESULT_TYPES, record.type)?.key ?? defaults.type;
  return Object.freeze({
    title: String(record.title ?? ''),
    url,
    summary: String(record.summary ?? ''),
    identifier: String(record.identifier ?? ''),
    aliases: Object.freeze(Array.isArray(record.aliases) ? record.aliases.map(String) : []),
    type,
    collection: optionFor(COLLECTIONS, record.collection)?.key ?? defaults.collection,
    kind: type === 'ontology' ? (optionFor(KINDS, record.kind)?.key ?? defaults.kind) : '',
    domain: optionFor(DOMAINS, record.domain)?.key ?? defaults.domain,
    pageType: type === 'page' ? (optionFor(PAGE_TYPES, record.pageType)?.key ?? defaults.pageType) : '',
    status: optionFor(STATUSES, record.status)?.key ?? '',
    context: String(record.context ?? ''),
    date: String(record.date ?? ''),
    destination,
    area: String(record.area ?? destinationTitles.get(destination) ?? 'Resources'),
    facet: String(record.facet ?? facetFor(url)),
  });
}

const FALLBACK_SEARCH_ENTRIES = Object.freeze(SITE_SEARCH_ENTRIES.map(normaliseSearchRecord));
let indexPromise;

/** Fetch the build-generated corpus, retaining the compact editorial fallback in dev. */
export function loadSearchIndex() {
  indexPromise ??= fetch(SEARCH_INDEX_URL, { headers: { Accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
      const payload = await response.json();
      if (!payload || payload.schemaVersion !== SEARCH_INDEX_SCHEMA_VERSION || !Array.isArray(payload.entries)) {
        throw new TypeError('Search index has an unsupported shape.');
      }
      const entries = payload.entries.map(normaliseSearchRecord).filter(({ title, url }) => title && url.startsWith('/'));
      if (entries.length === 0) throw new TypeError('Search index is empty.');
      return Object.freeze(entries);
    })
    .catch(() => FALLBACK_SEARCH_ENTRIES);
  return indexPromise;
}

const words = (value) => normalizeSearchText(value).split(' ').filter(Boolean);
const hasWord = (list, token) => list.some((word) => word.startsWith(token));
const textCache = new WeakMap();

function textOf(record) {
  let text = textCache.get(record);
  if (text) return text;
  const meta = [
    labelFor(KINDS, record.kind, 'singular'), labelFor(DOMAINS, record.domain),
    labelFor(COLLECTIONS, record.collection), record.area,
    record.context, labelFor(STATUSES, record.status), record.facet,
  ].filter(Boolean).join(' ');
  text = {
    title: normalizeSearchText(record.title),
    identifier: normalizeSearchText(record.identifier),
    aliases: record.aliases.map(normalizeSearchText),
    titleWords: words(record.title),
    identifierWords: words(record.identifier),
    aliasWords: record.aliases.flatMap(words),
    metaWords: words(meta),
    summaryWords: words(record.summary),
    pathWords: words(record.url),
  };
  text.words = [...text.titleWords, ...text.identifierWords, ...text.aliasWords, ...text.metaWords, ...text.summaryWords, ...text.pathWords];
  textCache.set(record, text);
  return text;
}

/** Lower is better; null means no match. Whole-word prefixes match, so "pdtf" never matches "spdtf". */
function relevance(record, phrase, tokens) {
  const text = textOf(record);
  if (!tokens.every((token) => hasWord(text.words, token))) return null;
  if (text.title === phrase || text.identifier === phrase) return 0;
  if (text.title.startsWith(phrase)) return 10;
  if (text.identifier.startsWith(phrase) || text.aliases.some((alias) => alias === phrase)) return 20;
  if (text.title.includes(phrase)) return 30;
  if (text.aliases.some((alias) => alias.startsWith(phrase))) return 40;
  return 50 + tokens.reduce((score, token) => {
    if (hasWord(text.titleWords, token)) return score + (text.title.startsWith(token) ? 0 : 2);
    if (hasWord(text.identifierWords, token)) return score + 3;
    if (hasWord(text.aliasWords, token)) return score + 4;
    if (hasWord(text.metaWords, token)) return score + 6;
    if (hasWord(text.summaryWords, token)) return score + 8;
    return score + 10;
  }, 0);
}

export function matchesFilters(record, filters) {
  const selected = normaliseSearchFilters(filters);
  return (selected.pageType.length === 0 || selected.pageType.includes(record.pageType))
    && FACETS.every((facet) => selected[facet.key].length === 0 || selected[facet.key].includes(record[facet.key]));
}

function scored(query, entries) {
  const phrase = normalizeSearchText(query);
  const tokens = phrase ? phrase.split(' ') : [];
  return entries
    .map((record, index) => ({ record, index, score: tokens.length ? relevance(record, phrase, tokens) : 0 }))
    .filter(({ score }) => score !== null);
}

/** Rank matching entries: exact and prefix matches first, then shorter titles, then index order. */
export function searchEntries(query, filters = {}, entries = FALLBACK_SEARCH_ENTRIES) {
  const selected = normaliseSearchFilters(filters);
  const ranked = scored(query, entries).filter(({ record }) => matchesFilters(record, selected));
  const byTitleLength = normalizeSearchText(query) ? (a, b) => a.record.title.length - b.record.title.length : () => 0;
  return ranked
    .sort((a, b) => a.score - b.score || byTitleLength(a, b) || a.index - b.index)
    .map(({ record }) => record);
}

/** Convenience for consumers that only need the shared index: the dialog and tests. */
export async function searchSite(query, filters = {}) {
  return searchEntries(query, filters, await loadSearchIndex());
}

/** Option counts per facet, each computed with that facet's own selection removed. */
export function facetCounts(query, filters, entries) {
  const selected = normaliseSearchFilters(filters);
  const matches = scored(query, entries).map(({ record }) => record);
  const counts = {};
  for (const facet of FACETS) {
    const others = { ...selected, [facet.key]: [] };
    const tally = Object.fromEntries(facet.options.map(({ key }) => [key, 0]));
    for (const record of matches) {
      if (record[facet.key] in tally && matchesFilters(record, others)) tally[record[facet.key]] += 1;
    }
    counts[facet.key] = tally;
  }
  return counts;
}

const unique = (values) => [...new Set(values.filter(Boolean))];

/**
 * The shared card vocabulary. The dialog shows `eyebrow` above the title;
 * /search adds the badge and facts. Page authority and maturity come from
 * the IA status registry rather than from the index.
 */
export function describeRecord(record) {
  const collection = optionFor(COLLECTIONS, record.collection);
  const domain = labelFor(DOMAINS, record.domain);
  const status = optionFor(STATUSES, record.status);
  const badge = status ? { label: status.label, tone: status.tone } : null;
  if (record.type === 'ontology') {
    return {
      variant: 'ontology',
      eyebrow: unique([labelFor(KINDS, record.kind, 'singular') || 'Ontology resource', domain || record.context]).join(' · '),
      badge,
      facts: [
        record.identifier ? { label: 'Identifier', value: record.identifier, code: true } : null,
        collection ? { label: 'Collection', value: collection.short } : null,
      ].filter(Boolean),
    };
  }
  if (record.type === 'decision') {
    return {
      variant: 'decision',
      eyebrow: unique([record.identifier, collection?.short ?? 'Decision record']).join(' · '),
      badge,
      facts: [
        record.date ? { label: 'Recorded', value: record.date } : null,
        record.context ? { label: 'Kind', value: record.context } : null,
      ].filter(Boolean),
    };
  }
  if (record.type === 'group') {
    return {
      variant: 'group',
      eyebrow: unique(['Working group', record.context.charAt(0).toUpperCase() + record.context.slice(1)]).join(' · '),
      badge,
      facts: domain ? [{ label: 'Domain', value: domain }] : [],
    };
  }
  const routeStatus = getRouteStatus(record.url);
  return {
    variant: 'page',
    eyebrow: collection?.short || record.area || 'Page',
    badge: null,
    facts: routeStatus ? [
      { label: 'Authority', value: routeStatus.authority },
      { label: 'Maturity', value: routeStatus.maturity },
    ] : [],
  };
}
