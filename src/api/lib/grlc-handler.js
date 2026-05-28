/**
 * Generic GRLC request handler for opda.
 * Ported from hm/semantic-modelling (ADR-0021).
 * Supports three endpoint types: listing (SELECT+pagination), detail (SELECT→JSON),
 * aggregate (SELECT, no pagination).
 *
 * opda detail endpoints use SELECT queries (not CONSTRUCT) to avoid JSON-LD
 * compaction complexity — the handler assembles the contract shape directly
 * from SELECT bindings.
 */
import { executeSelect, executeSparqlDirect } from './sparql-client.js';
import { buildPagination, buildListResponse } from './envelope.js';

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 100;

// ── GRLC parameter binding ─────────────────────────────────────────────────

function sparqlEscape(value) {
  if (value == null) return '';
  return String(value)
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    .replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

/**
 * Inject GRLC-style bindings into a SPARQL query.
 * ?_param_literal → direct text substitution (penetrates subqueries).
 * ?_param_iri     → VALUES clause after WHERE {.
 * Pagination → LIMIT/OFFSET appended.
 */
export function bindGrlcParams(queryText, bindings, pagination) {
  let query = queryText;

  const valuesClauses = [];
  for (const [param, value] of Object.entries(bindings)) {
    if (value == null || value === '') continue;
    const litVar = `?_${param}_literal`;
    const iriVar = `?_${param}_iri`;
    if (query.includes(litVar)) {
      query = query.replaceAll(`!BOUND(${litVar})`, 'false');
      query = query.replaceAll(litVar, `"${sparqlEscape(String(value))}"`);
    } else if (query.includes(iriVar)) {
      const escaped = sparqlEscape(String(value));
      valuesClauses.push(`  VALUES (${iriVar}) { ("${escaped}") }`);
    }
  }

  if (valuesClauses.length > 0) {
    const m = query.match(/WHERE\s*\{/i);
    if (m) {
      const pos = m.index + m[0].length;
      query = query.slice(0, pos) + '\n' + valuesClauses.join('\n') + '\n' + query.slice(pos);
    }
  }

  if (pagination) {
    query = query.trimEnd() + `\nLIMIT ${pagination.limit}\nOFFSET ${pagination.offset}`;
  }

  return query;
}

// ── RFC 7807 helpers ───────────────────────────────────────────────────────

function sendNotFound(res, detail, instance) {
  return res.status(404).set('Content-Type', 'application/problem+json').json({
    type: 'https://w3id.org/opda/problems/not-found',
    title: 'Resource Not Found', status: 404, detail, instance,
  });
}

function sendBadRequest(res, detail, instance) {
  return res.status(400).set('Content-Type', 'application/problem+json').json({
    type: 'https://w3id.org/opda/problems/bad-request',
    title: 'Bad Request', status: 400, detail, instance,
  });
}

// ── val helper ────────────────────────────────────────────────────────────

const val = (b, key) => b[key]?.value ?? undefined;

// ── Listing handler ────────────────────────────────────────────────────────

function createListingHandler(config) {
  const { listQueryText, countQueryText, basePath, listType, filterParams = [] } = config;

  return async (req, res, next) => {
    try {
      const { page = 1, pageSize } = req.query;
      const validatedPage = Math.max(1, Math.floor(+page) || 1);
      const rawSize = Math.floor(+(pageSize ?? DEFAULT_PAGE_SIZE));
      const validatedPageSize = Math.max(1, Math.min(MAX_PAGE_SIZE, isNaN(rawSize) ? DEFAULT_PAGE_SIZE : rawSize));
      const { offset, limit } = buildPagination(validatedPage, validatedPageSize);

      const bindings = {};
      for (const param of filterParams) {
        if (req.query[param] != null) bindings[param] = req.query[param];
      }

      const [listResult, countResult] = await Promise.all([
        executeSelect(bindGrlcParams(listQueryText, bindings, { offset, limit })),
        countQueryText
          ? executeSelect(bindGrlcParams(countQueryText, bindings))
          : Promise.resolve({ results: { bindings: [] } }),
      ]);

      const items = listResult.results.bindings.map(b => mapEntityListItem(b));
      const totalCount = countResult.results.bindings.length > 0
        ? +(countResult.results.bindings[0].total?.value ?? 0) : items.length;

      res.json(buildListResponse({
        items, totalCount, page: validatedPage, pageSize: validatedPageSize,
        basePath, query: req.query, listType,
      }));
    } catch (err) { next(err); }
  };
}

/** Map a SELECT binding row to the EntityList item shape. */
function mapEntityListItem(b) {
  const uri = val(b, 'uri') || '';
  const localName = val(b, 'localName') || uri.replace(/.*[/#]/, '');
  const tiers = [];
  // concept + logical always present; physical-ontology where class block exists
  if (val(b, 'hasConcept') === 'true') tiers.push('concept');
  if (val(b, 'hasLogical') === 'true') tiers.push('logical');
  if (val(b, 'hasPhysicalOntology') === 'true') tiers.push('physical-ontology');
  return {
    uri, localName,
    label: val(b, 'label') || localName,
    module: val(b, 'module') || '',
    tiers: tiers.length > 0 ? tiers : ['concept', 'logical'],
  };
}

// ── Detail handler ─────────────────────────────────────────────────────────
// opda detail uses SELECT (not CONSTRUCT→JSON-LD) for clarity.
// The handler assembles the structured contract shape from bindings.

function createDetailHandler(config) {
  const { queryText, basePath, paramNames = [], resourceLabel } = config;

  return async (req, res, next) => {
    try {
      const bindings = {};
      for (const param of paramNames) {
        if (req.params[param] != null) bindings[param] = req.params[param];
      }

      // Multi-part SELECT approach: run the main query for core + attributes +
      // relationships + constraints all in one or via companion queries.
      // The .rq file does it all via UNION blocks returning typed rows.
      const boundQuery = bindGrlcParams(queryText, bindings);
      const result = await executeSelect(boundQuery);
      const rows = result.results.bindings;

      if (rows.length === 0) {
        const identifier = paramNames.map(p => req.params[p]).join('/');
        return sendNotFound(res,
          `${resourceLabel || 'Entity'} '${identifier}' not found`, req.originalUrl);
      }

      const entity = assembleEntityDetail(rows, req.params);
      res.json(entity);
    } catch (err) { next(err); }
  };
}

/**
 * Assemble the entity detail contract from typed SELECT rows.
 * Each row has a ?rowType discriminator:
 *   'core'         → uri, label, module, summary, scopeNote
 *   'attribute'    → attrName, attrLabel, attrType, minCount, maxCount, attrDescription
 *   'relationship' → predLocalName, predLabel, targetLocalName, targetLabel, inverseLocalName, relDescription
 *   'constraint'   → constraintMessage, constraintSeverity, shapeName
 *   'source'       → dctSourceUri
 */
function assembleEntityDetail(rows, params) {
  const { tier, module, localName } = params;
  let core = null;
  const attributes = [];
  const relationships = [];
  const constraints = [];
  const dctSources = [];
  const seenAttrs = new Set();
  const seenRels = new Set();
  const seenConstraints = new Set();
  const seenSources = new Set();

  for (const b of rows) {
    const rowType = val(b, 'rowType');

    if (rowType === 'core' && !core) {
      core = {
        uri:       val(b, 'uri') || '',
        localName: val(b, 'localName') || localName,
        label:     val(b, 'label') || localName,
        module:    val(b, 'module') || module,
        tier:      tier,
        summary:   val(b, 'summary') || '',
        scopeNote: val(b, 'scopeNote') || null,
      };
    }

    if (rowType === 'source') {
      const src = val(b, 'dctSourceUri');
      if (src && !seenSources.has(src)) { dctSources.push(src); seenSources.add(src); }
    }

    if (rowType === 'attribute') {
      const attrName = val(b, 'attrName') || '';
      if (!attrName || seenAttrs.has(attrName)) continue;
      seenAttrs.add(attrName);
      const minCount = val(b, 'minCount');
      const maxCount = val(b, 'maxCount');
      let cardinality = '0..*';
      if (minCount != null && maxCount != null) cardinality = `${minCount}..${maxCount}`;
      else if (minCount != null) cardinality = `${minCount}..*`;
      else if (maxCount != null) cardinality = `0..${maxCount}`;
      attributes.push({
        localName:   attrName,
        label:       val(b, 'attrLabel') || attrName,
        type:        val(b, 'attrType') || 'xsd:string',
        cardinality,
        required:    minCount != null && +minCount >= 1,
        description: val(b, 'attrDescription') || '',
      });
    }

    if (rowType === 'relationship') {
      const predLocalName = val(b, 'predLocalName') || '';
      if (!predLocalName || seenRels.has(predLocalName)) continue;
      seenRels.add(predLocalName);
      relationships.push({
        predicate:   predLocalName,
        target:      val(b, 'targetLocalName') || val(b, 'targetLabel') || '',
        cardinality: val(b, 'relCardinality') || '0..*',
        inverse:     val(b, 'inverseLocalName') || null,
        description: val(b, 'relDescription') || '',
      });
    }

    if (rowType === 'constraint') {
      const msg = val(b, 'constraintMessage') || '';
      if (!msg || seenConstraints.has(msg)) continue;
      seenConstraints.add(msg);
      constraints.push({
        message:  msg,
        severity: val(b, 'constraintSeverity')?.replace('http://www.w3.org/ns/shacl#', '') || 'Violation',
        shape:    val(b, 'shapeName') || '',
      });
    }
  }

  if (!core) return null;

  return {
    ...core,
    dctSource:     dctSources,
    attributes,
    relationships,
    constraints,
    crossTier: buildCrossTierLinks(core.localName, core.module),
  };
}

/**
 * Convert a PascalCase local name to a kebab-case URL slug.
 * Examples: "LegalEstate" → "legal-estate", "DPVMappingRecord" → "dpv-mapping-record".
 */
function pascalToKebab(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Build cross-tier URL map for a given entity.
 * concept + logical always exist; physical-ontology: per-module classes page.
 * physical-database: not yet generated by this phase.
 */
function buildCrossTierLinks(localName, module) {
  if (!localName || !module) return { concept: null, logical: null, physicalOntology: null, physicalDatabase: null };
  const slug = pascalToKebab(localName);
  const mod = module.toLowerCase();
  return {
    concept:          `/manual/concept/${mod}/${slug}`,
    logical:          `/manual/logical/${mod}/${slug}`,
    physicalOntology: `/manual/physical-ontology/${mod}/classes#${localName}`,
    physicalDatabase: null,
  };
}

// ── Aggregate handler ──────────────────────────────────────────────────────

function createAggregateHandler(config) {
  const { queryText, basePath, listType, filterParams = [] } = config;

  return async (req, res, next) => {
    try {
      const bindings = {};
      for (const param of filterParams) {
        if (req.query[param] != null) bindings[param] = req.query[param];
      }
      const result = await executeSelect(bindGrlcParams(queryText, bindings));
      const items = result.results.bindings.map(b => {
        const item = {};
        for (const [key, node] of Object.entries(b)) {
          if (!node?.value) continue;
          item[key] = node.value;
        }
        return item;
      });
      res.json({ '@type': listType || 'Collection', items, _links: { self: { href: basePath } } });
    } catch (err) { next(err); }
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

export function createHandler(config) {
  switch (config.type) {
    case 'listing':   return createListingHandler(config);
    case 'detail':    return createDetailHandler(config);
    case 'aggregate': return createAggregateHandler(config);
    default:
      throw new Error(`Unknown handler type '${config.type}'`);
  }
}
