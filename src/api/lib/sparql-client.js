/**
 * SPARQL client for Apache Jena Fuseki.
 * Uses native fetch (Node 22+) — no external HTTP dependencies.
 * Adapted from hm/semantic-modelling for opda (ADR-0021).
 */

const DEFAULT_ENDPOINT = process.env.FUSEKI_ENDPOINT || 'http://localhost:3031/opda/sparql';

/**
 * Execute a SELECT query and return parsed SPARQL JSON results.
 * @param {string} queryString
 * @returns {Promise<{results: {bindings: Array}}>}
 */
export async function executeSelect(queryString) {
  const res = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/sparql-results+json',
    },
    body: queryString,
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`SPARQL SELECT failed: ${res.status} ${res.statusText}`);
    err.status = 502;
    err.code = 'sparql-error';
    err.detail = body;
    throw err;
  }
  return res.json();
}

/**
 * Execute a CONSTRUCT/DESCRIBE query and return raw serialized RDF.
 * @param {string} queryString
 * @param {string} [accept='application/ld+json']
 * @returns {Promise<string>}
 */
export async function executeConstruct(queryString, accept = 'application/ld+json') {
  const res = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      'Accept': accept,
    },
    body: queryString,
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`SPARQL CONSTRUCT failed: ${res.status} ${res.statusText}`);
    err.status = 502;
    err.code = 'sparql-error';
    err.detail = body;
    throw err;
  }
  return res.text();
}

/**
 * Check if a CONSTRUCT result is empty (no triples).
 * @param {string} body
 * @param {string} contentType
 * @returns {boolean}
 */
export function isEmptyConstruct(body, contentType) {
  if (!body) return true;
  if (contentType.includes('json')) {
    const stripped = body.replace(/\s/g, '');
    return stripped === '{}' || stripped === '[]' || stripped === '[{}]';
  }
  const lines = body.split('\n').filter(l => l.trim() && !l.trim().startsWith('@prefix') && !l.trim().startsWith('PREFIX'));
  return lines.length === 0;
}

/**
 * Execute any SPARQL query, returning raw body + content-type.
 * Used by the /sparql proxy endpoint.
 */
export async function executeSparqlDirect(queryString, accept = 'application/sparql-results+json') {
  const res = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      'Accept': accept,
    },
    body: queryString,
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`SPARQL query failed: ${res.status} ${res.statusText}`);
    err.status = 502;
    err.code = 'sparql-error';
    err.detail = body;
    throw err;
  }
  const body = await res.text();
  const contentType = res.headers.get('content-type') || accept;
  return { body, contentType };
}
