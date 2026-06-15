#!/usr/bin/env node
/**
 * Phase 1 of ADR-0044 (ontology-as-web-pages) — the build-time SPARQL
 * extraction. Queries the live Fuseki dataset and materialises ONE committed
 * model, `src/data/ontology-model.json`, that drives:
 *   • the per-entity detail pages (ADR-0044) — class / property / shape /
 *     concept / scheme / context, with INCOMING and outgoing connections; and
 *   • the on-page graph diagrams (ADR-0043) — same extraction, one source.
 *
 * Operator decisions (ADR-0044 §Decisions, 2026-06-15):
 *   • data comes from the live Fuseki + GRLC stack — `build:data` REQUIRED
 *     (this script fails loudly if the endpoint is unreachable);
 *   • the result is still committed (deterministic, sorted, no timestamp) so
 *     the doc-drift gate can diff it and ADR-0043 can share it.
 *
 * Namespace (ADR-0006 as-built kind-split):
 *   terms   https://opda.org.uk/pdtf/<LocalName>
 *   SKOS    https://opda.org.uk/pdtf/scheme/<…>
 *   SHACL   https://opda.org.uk/pdtf/shape/<…>
 *   graphs  https://opda.org.uk/pdtf/graph/<module>   (loaded by fuseki-load.mjs)
 *
 * The ASSERTED schema only — the inferred entailment graph is excluded so the
 * model never shows inferred-as-asserted (ODR-0029 / ADR-0035 discipline; the
 * Safe-Group closure is 0-delta on the TBox anyway).
 *
 * Usage:  node scripts/ontology-model.mjs [--out src/data/ontology-model.json]
 *         FUSEKI_ENDPOINT overrides the SPARQL URL.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO = resolve(__dirname, '..');

const ENDPOINT =
  process.env.FUSEKI_ENDPOINT || process.env.OPDA_SPARQL ||
  'http://localhost:3031/opda/sparql';

const args = process.argv.slice(2);
const OUT = resolve(REPO, (() => {
  const i = args.indexOf('--out');
  return i >= 0 ? args[i + 1] : 'src/data/ontology-model.json';
})());

// ── Namespace (ADR-0006 as-built) ───────────────────────────────────────────
const BASE = 'https://opda.org.uk/pdtf/';
const GRAPH_NS = BASE + 'graph/';
const ENTAILMENT = BASE + 'graph/inferred/entailment';

const PREFIXES = `
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX sh:   <http://www.w3.org/ns/shacl#>
PREFIX dct:  <http://purl.org/dc/terms/>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX opda: <${BASE}>
`;

// Read across every asserted named graph (Jena loads each TTL into one), never
// the inferred entailment graph. `?g` doubles as the bounded-context module.
const GRAPH = (body) =>
  `GRAPH ?g { ${body} } FILTER(?g != <${ENTAILMENT}>)`;

// ── SPARQL client (self-contained; mirrors src/api/lib/sparql-client.js) ─────
async function select(query) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
      },
      body: PREFIXES + query,
    });
  } catch (err) {
    throw new Error(
      `[ADR-0044] Fuseki unreachable at ${ENDPOINT}. ` +
      `Start the stack first: \`make serve-data\` (or \`npm run build:data\`). ` +
      `Cause: ${err.message}`,
    );
  }
  if (!res.ok) {
    throw new Error(`[ADR-0044] SPARQL ${res.status} ${res.statusText}\n${await res.text()}`);
  }
  const json = await res.json();
  return json.results.bindings.map((row) => {
    const o = {};
    for (const k of Object.keys(row)) o[k] = row[k].value;
    return o;
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Path after the opda base — the stable id + URL slug (e.g. "Property", "scheme/Foo"). */
const id = (uri) => (uri && uri.startsWith(BASE) ? uri.slice(BASE.length) : uri);
/** Last path segment — the display local name. */
const local = (uri) => (uri ? uri.replace(/^.*[/#]/, '') : uri);
/** Module (bounded context) from the named-graph IRI; strip -shapes/-annotations. */
const moduleOf = (g) =>
  g ? g.replace(GRAPH_NS, '').replace(/-(shapes|annotations)$/, '') : null;
const isOpda = (uri) => uri && uri.startsWith(BASE);

/** Group bindings into a Map keyed by `key(row)`, collecting via `collect`. */
function index(rows, key, collect) {
  const m = new Map();
  for (const r of rows) {
    const k = key(r);
    if (!m.has(k)) m.set(k, collect.init(r));
    collect.add(m.get(k), r);
  }
  return m;
}

async function main() {
  console.log(`[ontology-model] querying ${ENDPOINT}`);

  // 1. Classes -------------------------------------------------------------
  const classRows = await select(`
    SELECT ?cls ?g ?label ?comment ?scope WHERE {
      ${GRAPH('?cls a owl:Class')}
      FILTER(STRSTARTS(STR(?cls), "${BASE}"))
      OPTIONAL { GRAPH ?lg { ?cls rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?cls rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?sg { ?cls skos:scopeNote ?scope } }
    }`);

  // 2. Object + 3. datatype properties (domain/range/inverse) --------------
  const objRows = await select(`
    SELECT ?p ?g ?label ?comment ?domain ?range ?inverse WHERE {
      ${GRAPH('?p a owl:ObjectProperty')}
      OPTIONAL { GRAPH ?lg { ?p rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?p rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?dg { ?p rdfs:domain ?domain } }
      OPTIONAL { GRAPH ?rg { ?p rdfs:range ?range } }
      OPTIONAL { GRAPH ?ig { ?p owl:inverseOf ?inverse } }
    }`);
  const dataRows = await select(`
    SELECT ?p ?g ?label ?comment ?domain ?range WHERE {
      ${GRAPH('?p a owl:DatatypeProperty')}
      OPTIONAL { GRAPH ?lg { ?p rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?p rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?dg { ?p rdfs:domain ?domain } }
      OPTIONAL { GRAPH ?rg { ?p rdfs:range ?range } }
    }`);

  // 4. SHACL node shapes + property constraints ----------------------------
  const shapeRows = await select(`
    SELECT ?shape ?g ?target ?targetSOf ?path ?datatype ?clazz ?min ?max ?severity ?message WHERE {
      ${GRAPH('?shape a sh:NodeShape')}
      OPTIONAL { GRAPH ?tg { ?shape sh:targetClass ?target } }
      OPTIONAL { GRAPH ?tsg { ?shape sh:targetSubjectsOf ?targetSOf } }
      OPTIONAL {
        GRAPH ?pg { ?shape sh:property ?ps . ?ps sh:path ?path }
        OPTIONAL { GRAPH ?d1 { ?ps sh:datatype ?datatype } }
        OPTIONAL { GRAPH ?d2 { ?ps sh:class ?clazz } }
        OPTIONAL { GRAPH ?d3 { ?ps sh:minCount ?min } }
        OPTIONAL { GRAPH ?d4 { ?ps sh:maxCount ?max } }
        OPTIONAL { GRAPH ?d5 { ?ps sh:severity ?severity } }
        OPTIONAL { GRAPH ?d6 { ?ps sh:message ?message } }
      }
    }`);

  // 5. SKOS concepts + 6. schemes ------------------------------------------
  const conceptRows = await select(`
    SELECT ?c ?g ?pref ?def ?scheme ?broader WHERE {
      ${GRAPH('?c a skos:Concept')}
      OPTIONAL { GRAPH ?pg { ?c skos:prefLabel ?pref } }
      OPTIONAL { GRAPH ?dg { ?c skos:definition ?def } }
      OPTIONAL { GRAPH ?sg { ?c skos:inScheme ?scheme } }
      OPTIONAL { GRAPH ?bg { ?c skos:broader ?broader } }
    }`);
  const schemeRows = await select(`
    SELECT ?s ?g ?pref ?top WHERE {
      ${GRAPH('?s a skos:ConceptScheme')}
      OPTIONAL { GRAPH ?pg { ?s skos:prefLabel ?pref } }
      OPTIONAL { GRAPH ?tg { ?s skos:hasTopConcept ?top } }
    }`);

  // 7. dct:source provenance for every term --------------------------------
  const srcRows = await select(`
    SELECT ?s ?src WHERE { ${GRAPH('?s dct:source ?src')} FILTER(STRSTARTS(STR(?s), "${BASE}")) }`);
  const sources = new Map();
  for (const r of srcRows) {
    if (!sources.has(r.s)) sources.set(r.s, new Set());
    sources.get(r.s).add(id(r.src));
  }
  const srcOf = (uri) => [...(sources.get(uri) || [])].sort();

  // ── Assemble ───────────────────────────────────────────────────────────
  // Index properties (collapsing the OPTIONAL row-fan into one record each).
  const collectProp = {
    init: (r) => ({ uri: r.p, id: id(r.p), localName: local(r.p),
      label: r.label || local(r.p), comment: r.comment || '',
      module: moduleOf(r.g), domain: new Set(), range: new Set(), inverse: r.inverse || null }),
    add: (o, r) => { if (r.domain) o.domain.add(r.domain); if (r.range) o.range.add(r.range);
      if (r.inverse) o.inverse = r.inverse; },
  };
  const objProps = index(objRows, (r) => r.p, collectProp);
  const dataProps = index(dataRows, (r) => r.p, collectProp);

  // Index node shapes.
  const shapes = index(shapeRows, (r) => r.shape, {
    init: (r) => ({ uri: r.shape, id: id(r.shape), localName: local(r.shape),
      module: moduleOf(r.g), target: r.target || null, targetSubjectsOf: r.targetSOf || null,
      constraints: [] }),
    add: (o, r) => {
      if (r.target) o.target = r.target;
      if (r.targetSOf) o.targetSubjectsOf = r.targetSOf;
      if (r.path) o.constraints.push({ path: r.path, pathLocal: local(r.path),
        datatype: r.datatype ? local(r.datatype) : null, class: r.clazz || null,
        minCount: r.min ?? null, maxCount: r.max ?? null,
        severity: r.severity ? local(r.severity) : null, message: r.message || null });
    },
  });

  // Index concepts + schemes.
  const concepts = index(conceptRows, (r) => r.c, {
    init: (r) => ({ uri: r.c, id: id(r.c), localName: local(r.c),
      prefLabel: r.pref || local(r.c), definition: r.def || '', module: moduleOf(r.g),
      schemes: new Set(), broader: new Set(), narrower: new Set() }),
    add: (o, r) => { if (r.scheme) o.schemes.add(r.scheme); if (r.broader) o.broader.add(r.broader); },
  });
  const schemes = index(schemeRows, (r) => r.s, {
    init: (r) => ({ uri: r.s, id: id(r.s), localName: local(r.s),
      prefLabel: r.pref || local(r.s), module: moduleOf(r.g), topConcepts: new Set(), concepts: new Set() }),
    add: (o, r) => { if (r.top) o.topConcepts.add(r.top); },
  });
  // narrower = inverse of broader; scheme membership rollup.
  for (const c of concepts.values()) {
    for (const b of c.broader) concepts.get(b)?.narrower.add(c.uri);
    for (const s of c.schemes) schemes.get(s)?.concepts.add(c.uri);
  }

  const classSet = new Set(classRows.map((r) => r.cls));
  const schemeSet = new Set([...schemes.keys()]);
  const refLabel = (uri) =>
    objProps.get(uri)?.label || dataProps.get(uri)?.label ||
    [...concepts.values(), ...schemes.values()].find((x) => x.uri === uri)?.prefLabel || local(uri);

  // Classes: attach attributes / outgoing / incoming / shapes / schemes.
  const allProps = [...objProps.values(), ...dataProps.values()];
  const shapesByTarget = new Map();
  for (const s of shapes.values()) if (s.target) {
    if (!shapesByTarget.has(s.target)) shapesByTarget.set(s.target, []);
    shapesByTarget.get(s.target).push({ id: s.id, localName: s.localName });
  }

  const classes = new Map();
  for (const r of classRows) {
    if (classes.has(r.cls)) continue;
    const uri = r.cls;
    const outgoing = [...objProps.values()].filter((p) => p.domain.has(uri))
      .map((p) => ({ predicate: p.id, predicateLabel: p.label, predicateLocal: p.localName,
        targets: [...p.range].map((t) => ({ id: id(t), localName: local(t),
          kind: classSet.has(t) ? 'class' : schemeSet.has(t) ? 'scheme' : 'external' })),
        inverse: p.inverse ? id(p.inverse) : null, description: p.comment }));
    const incoming = [...objProps.values()].filter((p) => p.range.has(uri))
      .map((p) => ({ predicate: p.id, predicateLabel: p.label, predicateLocal: p.localName,
        sources: [...p.domain].map((s) => ({ id: id(s), localName: local(s) })),
        inverse: p.inverse ? id(p.inverse) : null, description: p.comment }));
    const attributes = [...dataProps.values()].filter((p) => p.domain.has(uri))
      .map((p) => ({ localName: p.localName, id: p.id, label: p.label,
        type: [...p.range].map(local)[0] || null, description: p.comment }));
    // SKOS schemes referenced by this class's coded (scheme-ranged) properties.
    const usesSchemes = new Set();
    for (const p of allProps) if (p.domain.has(uri)) for (const rg of p.range)
      if (schemeSet.has(rg)) usesSchemes.add(rg);

    classes.set(uri, {
      uri, id: id(uri), localName: local(uri), label: r.label || local(uri),
      comment: r.comment || '', scopeNote: r.scope || '',
      module: moduleOf(r.g), context: moduleOf(r.g),
      attributes: attributes.sort((a, b) => a.localName.localeCompare(b.localName)),
      outgoing: outgoing.sort((a, b) => a.predicate.localeCompare(b.predicate)),
      incoming: incoming.sort((a, b) => a.predicate.localeCompare(b.predicate)),
      shapes: (shapesByTarget.get(uri) || []).sort((a, b) => a.id.localeCompare(b.id)),
      usesSchemes: [...usesSchemes].map((s) => ({ id: id(s), localName: local(s) }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      dctSource: srcOf(uri),
    });
  }

  // Properties: subjects (domain) + objects (range) + constraining shapes.
  const shapesByPath = new Map();
  for (const s of shapes.values()) for (const c of s.constraints) {
    if (!shapesByPath.has(c.path)) shapesByPath.set(c.path, []);
    shapesByPath.get(c.path).push({ shape: s.id, ...c });
  }
  function finishProp(p, kind) {
    return {
      uri: p.uri, id: p.id, localName: p.localName, label: p.label, comment: p.comment,
      kind, module: p.module,
      subjects: [...p.domain].map((d) => ({ id: id(d), localName: local(d),
        kind: classSet.has(d) ? 'class' : 'external' })).sort((a, b) => a.id.localeCompare(b.id)),
      objects: [...p.range].map((rg) => ({ id: id(rg), localName: local(rg),
        kind: kind === 'datatype' ? 'datatype'
          : classSet.has(rg) ? 'class' : schemeSet.has(rg) ? 'scheme' : 'external' }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      inverse: p.inverse ? { id: id(p.inverse), localName: local(p.inverse) } : null,
      constraints: (shapesByPath.get(p.uri) || []).sort((a, b) => a.shape.localeCompare(b.shape)),
      dctSource: srcOf(p.uri),
    };
  }

  // contexts (bounded contexts) = the module grouping, with member rollups.
  const contexts = new Map();
  const ctxAdd = (m, bucket, ref) => {
    if (!m) return;
    if (!contexts.has(m)) contexts.set(m, { id: m, localName: m,
      classes: [], objectProperties: [], datatypeProperties: [], shapes: [], schemes: [] });
    contexts.get(m)[bucket].push(ref);
  };
  for (const c of classes.values()) ctxAdd(c.module, 'classes', { id: c.id, localName: c.localName });
  for (const p of objProps.values()) ctxAdd(p.module, 'objectProperties', { id: p.id, localName: p.localName });
  for (const p of dataProps.values()) ctxAdd(p.module, 'datatypeProperties', { id: p.id, localName: p.localName });
  for (const s of shapes.values()) ctxAdd(s.module, 'shapes', { id: s.id, localName: s.localName });
  for (const s of schemes.values()) ctxAdd(s.module, 'schemes', { id: s.id, localName: s.localName });

  // ── Serialise (deterministic: sorted keys + arrays, no timestamp) ────────
  const objFrom = (map, finish) => {
    const out = {};
    for (const key of [...map.keys()].sort((a, b) => id(a).localeCompare(id(b)))) {
      const v = finish ? finish(map.get(key)) : map.get(key);
      out[v.id] = v;
    }
    return out;
  };
  const setToRefs = (set) => [...set].map((u) => ({ id: id(u), localName: local(u) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const model = {
    namespace: BASE,
    counts: {
      classes: classes.size, objectProperties: objProps.size, datatypeProperties: dataProps.size,
      shapes: shapes.size, concepts: concepts.size, schemes: schemes.size, contexts: contexts.size,
    },
    classes: objFrom(classes),
    objectProperties: objFrom(objProps, (p) => finishProp(p, 'object')),
    datatypeProperties: objFrom(dataProps, (p) => finishProp(p, 'datatype')),
    shapes: objFrom(shapes, (s) => ({ ...s,
      target: s.target ? { id: id(s.target), localName: local(s.target) } : null,
      constraints: s.constraints.sort((a, b) => (a.pathLocal || '').localeCompare(b.pathLocal || '')) })),
    concepts: objFrom(concepts, (c) => ({ uri: c.uri, id: c.id, localName: c.localName,
      prefLabel: c.prefLabel, definition: c.definition, module: c.module,
      schemes: setToRefs(c.schemes), broader: setToRefs(c.broader), narrower: setToRefs(c.narrower),
      dctSource: srcOf(c.uri) })),
    schemes: objFrom(schemes, (s) => ({ uri: s.uri, id: s.id, localName: s.localName,
      prefLabel: s.prefLabel, module: s.module,
      topConcepts: setToRefs(s.topConcepts), concepts: setToRefs(s.concepts) })),
    contexts: objFrom(contexts, (c) => ({ ...c,
      classes: c.classes.sort((a, b) => a.id.localeCompare(b.id)),
      objectProperties: c.objectProperties.sort((a, b) => a.id.localeCompare(b.id)),
      datatypeProperties: c.datatypeProperties.sort((a, b) => a.id.localeCompare(b.id)),
      shapes: c.shapes.sort((a, b) => a.id.localeCompare(b.id)),
      schemes: c.schemes.sort((a, b) => a.id.localeCompare(b.id)) })),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(model, null, 2) + '\n', 'utf8');
  const c = model.counts;
  console.log(`[ontology-model] wrote ${OUT}`);
  console.log(`[ontology-model] ${c.classes} classes · ${c.objectProperties} obj + ${c.datatypeProperties} data props · ` +
    `${c.shapes} shapes · ${c.concepts} concepts · ${c.schemes} schemes · ${c.contexts} contexts`);
  if (c.classes === 0) {
    throw new Error('[ADR-0044] 0 classes extracted — is the dataset loaded? Run `make jena-load` after `make serve-data`.');
  }
}

await main();
