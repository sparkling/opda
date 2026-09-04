/**
 * Shared search data model for the OPDA site.
 *
 * One vocabulary serves three consumers that must never drift: pages that
 * declare their own search metadata (Layout `search` prop → <meta> tags), the
 * build-time indexer that reads every emitted page, and the runtime that
 * filters and renders results on /search and in the quick-search dialog.
 *
 * Every exposed facet value below is emitted by at least one current template.
 * The only ontology collections are the Property Pack candidate and the PDTF
 * schema-derived draft; nothing here implies a wider SPDTF ontology. Retired
 * page-type metadata remains readable for schema-3 index and URL compatibility,
 * but is not exposed because its route-derived values duplicated section/collection.
 */
import { GLOBAL_DESTINATIONS } from './site-ia.mjs';

export const SEARCH_INDEX_SCHEMA_VERSION = 3;
export const SEARCH_INDEX_URL = '/data/site-search-index.json';

const option = (key, label, extra = {}) => Object.freeze({ key, label, ...extra });

/** The primary scope. A record has exactly one type. */
export const RESULT_TYPES = Object.freeze([
  option('ontology', 'Ontology resources', { singular: 'Ontology resource' }),
  option('decision', 'Decision records', { singular: 'Decision record' }),
  option('group', 'Working groups', { singular: 'Working group' }),
  option('page', 'Guides and pages', { singular: 'Page' }),
]);
const ALL_RESULT_TYPES = Object.freeze(RESULT_TYPES.map(({ key }) => key));

/** The six horizontal-navigation destinations, reused directly as search sections. */
export const DESTINATIONS = Object.freeze(GLOBAL_DESTINATIONS.map(({ key, title }) => option(key, title)));

/** Corpus membership: the two model deliveries, the third-party schema input and the two decision registers. */
export const COLLECTIONS = Object.freeze([
  option('property-pack', 'Property Pack ontology candidate', { short: 'Property Pack candidate' }),
  option('pdtf-derived', 'PDTF schema-derived ontology (draft)', { short: 'PDTF-derived draft' }),
  option('pdtf-schema', 'PDTF JSON Schema (third-party input)', { short: 'PDTF schema input' }),
  option('adr', 'Architecture decisions (ADR)', { short: 'Architecture decision' }),
  option('odr', 'Ontology decisions (ODR)', { short: 'Ontology decision' }),
]);

/** Working groups and the semantic homes of the Property Pack candidate. */
export const DOMAINS = Object.freeze([
  option('finance-and-banking', 'Finance and Banking'),
  option('conveyancing', 'Conveyancing'),
  option('estate-agency', 'Estate Agency'),
  option('surveying-and-valuation', 'Surveying and Valuation'),
  option('property-data-services', 'Property Data Services'),
  option('property-technology', 'Property Technology'),
  option('common', 'Common boundary'),
  option('dbt-smart-data', 'DBT Smart Data'),
  option('interoperability', 'Interoperability'),
]);

/** Generated ontology page kinds. Concept pages exist only in the PDTF-derived draft. */
export const KINDS = Object.freeze([
  option('class', 'Classes', { singular: 'Class' }),
  option('object-property', 'Object properties', { singular: 'Object property' }),
  option('datatype-property', 'Datatype properties', { singular: 'Datatype property' }),
  option('node-shape', 'Node shapes', { singular: 'SHACL node shape' }),
  option('concept-scheme', 'Concept schemes', { singular: 'SKOS concept scheme' }),
  option('concept', 'Concepts', { singular: 'SKOS concept' }),
  option('context', 'Semantic contexts', { singular: 'Semantic context' }),
  option('data-point', 'Source data points', { singular: 'Source data point' }),
]);

const tab = (key, label, filters, facets) => Object.freeze({
  key,
  label,
  filters: Object.freeze(Object.fromEntries(Object.entries(filters).map(([name, values]) => [name, Object.freeze([...values])]))),
  facets: Object.freeze([...facets]),
});

/**
 * Search tabs are the reader-facing sections of the knowledge base, plus the
 * two cross-cutting result sets that need their own treatment. A tab applies
 * its fixed scope and reveals only meaningful, orthogonal refinements.
 */
export const SEARCH_TABS = Object.freeze([
  tab('all', 'All', {}, ['type', 'destination', 'collection', 'kind', 'domain', 'status']),
  tab('ontology', 'Ontology resources', { type: ['ontology'] }, ['collection', 'kind', 'domain']),
  tab('decision', 'Decisions', { type: ['decision'] }, ['collection', 'status']),
  tab('programme', 'Programme', { type: ['page'], destination: ['programme'] }, []),
  tab('governance', 'Governance', { type: ['page'], destination: ['governance'] }, ['collection']),
  tab('modelling', 'Modelling', { type: ['page'], destination: ['semantic-modelling'] }, []),
  tab('development', 'Development', { destination: ['spdtf'] }, ['type', 'collection', 'kind', 'domain']),
  tab('working-groups', 'Working groups', { destination: ['working-groups'] }, ['type', 'domain']),
  tab('resources', 'Resources', { type: ['page'], destination: ['resources'] }, []),
]);
export const SEARCH_TAB_PARAM = 'tab';
export const tabFor = (key) => SEARCH_TABS.find((candidate) => candidate.key === key) ?? SEARCH_TABS[0];

/**
 * Retired schema-3 page-family values. These remain valid input metadata so
 * existing emitted pages and cached indexes normalise safely. They are not an
 * exposed facet or card label: the values describe route families rather than
 * an independent, consistently authored page taxonomy.
 */
export const PAGE_TYPES = Object.freeze([
  option('programme', 'Programme material'),
  option('governance', 'Governance material'),
  option('guide', 'Semantic modelling guidance'),
  option('development', 'Development material'),
  option('model-documentation', 'Model reference'),
  option('mapping', 'Schema-to-ontology verification'),
  option('schema', 'PDTF schema material'),
  option('participation', 'Participation and service page'),
  option('library', 'Resources and engagement record'),
]);

/** Status is filterable only for decision records; other values label cards. */
export const STATUSES = Object.freeze([
  option('accepted', 'Accepted', { tone: 'success', filter: true }),
  option('implemented', 'Implemented', { tone: 'success', filter: true }),
  option('proposed', 'Proposed', { tone: 'warn', filter: true }),
  option('superseded', 'Superseded', { tone: 'info', filter: true }),
  option('rejected', 'Rejected', { tone: 'neutral', filter: true }),
  option('machine-proposed', 'Machine-proposed', { tone: 'warn', filter: false }),
  option('draft', 'Draft, under review', { tone: 'info', filter: false }),
  option('scope-defined', 'Scope defined; convening to be confirmed', { tone: 'info', filter: false }),
]);

/**
 * Facet groups in display order. `scopes` lists the content types for which a
 * group is meaningful. The tab model above owns which of these groups is
 * exposed for each result category.
 */
export const FACETS = Object.freeze([
  Object.freeze({ key: 'type', param: 'type', label: 'Content type', options: RESULT_TYPES, scopes: ALL_RESULT_TYPES }),
  Object.freeze({ key: 'destination', param: 'section', label: 'Section', options: DESTINATIONS, scopes: ALL_RESULT_TYPES }),
  Object.freeze({ key: 'collection', param: 'collection', label: 'Collection', options: COLLECTIONS, scopes: Object.freeze(['ontology', 'decision', 'page']) }),
  Object.freeze({ key: 'kind', param: 'kind', label: 'Resource kind', options: KINDS, scopes: Object.freeze(['ontology']) }),
  Object.freeze({ key: 'domain', param: 'domain', label: 'Working group or domain', options: DOMAINS, scopes: Object.freeze(['ontology', 'group']) }),
  Object.freeze({ key: 'status', param: 'status', label: 'Decision status', options: STATUSES.filter((status) => status.filter), scopes: Object.freeze(['decision']) }),
]);

export const QUERY_PARAM = 'q';
const LEGACY_PAGE_TYPE_PARAM = 'pagetype';

export function optionFor(options, key) {
  return options.find((candidate) => candidate.key === key) ?? null;
}

export function labelFor(options, key, field = 'label') {
  return optionFor(options, key)?.[field] ?? '';
}

/** Page-declared fields and the <meta> names the indexer reads. */
export const SEARCH_META_NAMES = Object.freeze([
  ['type', 'opda:search-type'],
  ['collection', 'opda:search-collection'],
  ['kind', 'opda:search-kind'],
  ['domain', 'opda:search-domain'],
  // Retained while schema-3 pages still emit the retired page-family field.
  ['pageType', 'opda:search-page-type'],
  ['status', 'opda:search-status'],
  ['identifier', 'opda:search-identifier'],
  ['title', 'opda:search-title'],
  ['context', 'opda:search-context'],
  ['date', 'opda:search-date'],
]);

export const SEARCH_ALIAS_META_NAME = 'opda:search-alias';

/** Turn a page's declared search metadata into [name, content] meta pairs. */
export function searchMetaEntries(search) {
  if (!search || typeof search !== 'object') return [];
  const entries = [];
  for (const [field, name] of SEARCH_META_NAMES) {
    const value = search[field];
    if (typeof value === 'string' && value.trim()) entries.push([name, value.trim()]);
  }
  for (const alias of Array.isArray(search.aliases) ? search.aliases : []) {
    const value = String(alias ?? '').trim();
    if (value) entries.push([SEARCH_ALIAS_META_NAME, value]);
  }
  return entries;
}

const GROUP_SLUGS = DOMAINS.map(({ key }) => key).filter((key) => key !== 'common');
const DERIVED = '/development/inputs/pdtf-schema/schema-derived-ontology';
const PROPERTY_PACK = '/development/property-pack';
const page = (pageType, collection = '') => ({ type: 'page', collection, pageType, kind: '', domain: '' });
const ontology = (collection, kind = '') => ({ type: 'ontology', collection, kind, pageType: '', domain: '' });

/**
 * Route-based defaults for every emitted page. Generated templates declare
 * finer metadata (kind, domain, identifier, status) through Layout's `search`
 * prop; these defaults guarantee every page still lands in one scope.
 */
export function classifyRoute(path) {
  const route = String(path ?? '/').split(/[?#]/u, 1)[0].replace(/\/+$/u, '') || '/';
  const group = /^\/development\/working-groups\/([^/]+)(?:\/|$)/u.exec(route)?.[1];
  if (group && GROUP_SLUGS.includes(group)) {
    return { type: 'group', collection: '', kind: '', pageType: '', domain: group };
  }
  if (/^\/pdtf\//u.test(route)) return ontology('pdtf-derived');
  if (/^\/modelling\/adr\/adr-/u.test(route)) return { type: 'decision', collection: 'adr', kind: '', pageType: '', domain: '' };
  if (/^\/modelling\/odr\/odr-/u.test(route)) return { type: 'decision', collection: 'odr', kind: '', pageType: '', domain: '' };
  if (route === '/modelling/adr') return page('governance', 'adr');
  if (route === '/modelling/odr') return page('governance', 'odr');
  if (route.startsWith(`${PROPERTY_PACK}/resources/`)) return ontology('property-pack');
  if (route.startsWith(`${PROPERTY_PACK}/shapes/`)) return ontology('property-pack', 'node-shape');
  if (route.startsWith(`${PROPERTY_PACK}/vocabularies/`)) return ontology('property-pack', 'concept-scheme');
  if (/^\/development\/property-pack\/contexts\/[^/]+$/u.test(route)) return ontology('property-pack', 'context');
  if (route.startsWith(`${PROPERTY_PACK}/data-dictionary/`)) return ontology('property-pack', 'data-point');
  if (route === PROPERTY_PACK || route.startsWith(`${PROPERTY_PACK}/`)) return page('model-documentation', 'property-pack');
  if (/^\/development\/inputs\/pdtf-schema\/schema-derived-ontology\/concepts-and-architecture\/contexts\/[^/]+$/u.test(route)) {
    return ontology('pdtf-derived', 'context');
  }
  if (route.startsWith(`${DERIVED}/lineage-provenance-and-verification/schema-to-ontology-verification`)) {
    return page('mapping', 'pdtf-derived');
  }
  if (route === DERIVED || route.startsWith(`${DERIVED}/`)) return page('model-documentation', 'pdtf-derived');
  if (/^\/development\/inputs\/pdtf-schema(?:\/|$)/u.test(route)) return page('schema', 'pdtf-schema');
  if (/^\/development\/working-groups(?:\/|$)/u.test(route)) return page('participation');
  if (/^\/(?:join|subscribe|accessibility|presentations?)(?:\/|$)/u.test(route)) return page('participation');
  if (/^\/development(?:\/|$)/u.test(route)) return page('development');
  if (/^\/semantic-modelling(?:\/|$)/u.test(route)) return page('guide');
  if (/^\/governance(?:\/|$)/u.test(route)) return page('governance');
  if (route === '/' || /^\/(?:programme|strategy|dbt-smart-data)(?:\/|$)/u.test(route)) return page('programme');
  return page('library');
}

/** Validate filter input from URLs or callers: unknown keys and values are dropped. */
export function normaliseSearchFilters(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const filters = {};
  for (const facet of FACETS) {
    const raw = source[facet.key] ?? source[facet.param];
    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const accepted = [...new Set(values.map(String).filter((value) => optionFor(facet.options, value)))];
    filters[facet.key] = accepted;
  }
  const legacyRaw = source.pageType ?? source[LEGACY_PAGE_TYPE_PARAM];
  const legacyValues = Array.isArray(legacyRaw) ? legacyRaw : legacyRaw ? [legacyRaw] : [];
  filters.pageType = [...new Set(legacyValues.map(String).filter((value) => optionFor(PAGE_TYPES, value)))];
  return filters;
}

export function hasActiveFilters(filters) {
  const selected = normaliseSearchFilters(filters);
  return selected.pageType.length > 0 || FACETS.some((facet) => selected[facet.key].length > 0);
}

/** Read the shareable /search URL contract. */
export function parseSearchParams(params) {
  const search = params instanceof URLSearchParams ? params : new URLSearchParams(params ?? '');
  const raw = {};
  for (const facet of FACETS) raw[facet.key] = search.getAll(facet.param);
  raw.pageType = search.getAll(LEGACY_PAGE_TYPE_PARAM);
  return {
    query: (search.get(QUERY_PARAM) ?? '').trim(),
    tab: tabFor(search.get(SEARCH_TAB_PARAM)).key,
    filters: normaliseSearchFilters(raw),
  };
}

/** Write the shareable /search URL contract; empty state yields no parameters. */
export function searchParamsFor(query, filters = {}, tabKey = 'all') {
  const params = new URLSearchParams();
  const trimmed = String(query ?? '').trim();
  if (trimmed) params.set(QUERY_PARAM, trimmed);
  const selected = normaliseSearchFilters(filters);
  const activeTab = tabFor(tabKey);
  for (const facet of FACETS) {
    const locked = activeTab.filters[facet.key] ?? [];
    for (const value of selected[facet.key].filter((value) => !locked.includes(value))) params.append(facet.param, value);
  }
  for (const value of selected.pageType) params.append(LEGACY_PAGE_TYPE_PARAM, value);
  if (activeTab.key !== 'all') params.set(SEARCH_TAB_PARAM, activeTab.key);
  return params;
}
