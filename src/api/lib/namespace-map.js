/**
 * Namespace map for opda — resolves opda: and standard W3C prefixes.
 * Adapted from hm/semantic-modelling for opda (ADR-0021).
 *
 * opda: prefix = https://opda.org.uk/pdtf/
 * (confirmed from @prefix opda: <https://opda.org.uk/pdtf/> in opda TTLs)
 */

/** Standard prefixes used by the opda ontology TTLs. */
const W3C_PREFIXES = {
  rdf:   'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs:  'http://www.w3.org/2000/01/rdf-schema#',
  owl:   'http://www.w3.org/2002/07/owl#',
  xsd:   'http://www.w3.org/2001/XMLSchema#',
  skos:  'http://www.w3.org/2004/02/skos/core#',
  sh:    'http://www.w3.org/ns/shacl#',
  dct:   'http://purl.org/dc/terms/',
  prov:  'http://www.w3.org/ns/prov#',
  vann:  'http://purl.org/vocab/vann/',
  time:  'http://www.w3.org/2006/time#',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  // opda kind-namespace split (ADR-0006 as-built; the longest-first sort below
  // makes these sub-namespaces win over the flat term base).
  'opda-scheme':  'https://opda.org.uk/pdtf/scheme/',
  'opda-shape':   'https://opda.org.uk/pdtf/shape/',
  'opda-graph':   'https://opda.org.uk/pdtf/graph/',
  'opda-harness': 'https://opda.org.uk/pdtf/harness/',
  opda:  'https://opda.org.uk/pdtf/',
};

// Sort longest-first so most specific prefix wins
let PREFIX_MAP = Object.entries(W3C_PREFIXES).sort((a, b) => b[1].length - a[1].length);
let prefixObject = { ...W3C_PREFIXES };

/**
 * Initialise namespace map — for opda the prefixes are static/well-known.
 * In future this could query Fuseki for vann: declarations.
 */
export async function initNamespaceMap() {
  // opda prefixes are fixed; no Fuseki query needed for the static set.
  // This hook is kept for API parity with the hm version.
  console.log(`[namespace-map] Loaded ${PREFIX_MAP.length} prefixes (static opda set)`);
}

/**
 * Resolve a full URI to { context, localName }.
 * @param {string} uri
 * @returns {{ context: string, localName: string } | null}
 */
export function resolveUri(uri) {
  if (!uri) return null;
  for (const [prefix, namespace] of PREFIX_MAP) {
    if (uri.startsWith(namespace)) {
      return { context: prefix, localName: uri.slice(namespace.length) };
    }
  }
  return null;
}

/**
 * Return the current prefix → namespace map.
 * @returns {Record<string, string>}
 */
export function getNamespaces() {
  return { ...prefixObject };
}

/**
 * Build a full URI from prefix + localName (reverse of resolveUri).
 * @param {string} prefix
 * @param {string} localName
 * @returns {string|null}
 */
export function buildUri(prefix, localName) {
  if (!prefix || !localName) return null;
  const lower = prefix.toLowerCase();
  for (const [p, ns] of PREFIX_MAP) {
    if (p.toLowerCase() === lower) return ns + localName;
  }
  return null;
}
