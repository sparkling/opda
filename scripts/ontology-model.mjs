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
  // skos:definition (ADR-0049 decision-4) is the PRIMARY meaning of every term;
  // it lives in the class graph ?cg alongside rdfs:comment (the short hint).
  const classRows = await select(`
    SELECT ?cls ?g ?label ?comment ?definition ?scope ?ufo WHERE {
      ${GRAPH('?cls a owl:Class')}
      FILTER(STRSTARTS(STR(?cls), "${BASE}"))
      OPTIONAL { GRAPH ?lg { ?cls rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?cls rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?fg { ?cls skos:definition ?definition } }
      OPTIONAL { GRAPH ?sg { ?cls skos:scopeNote ?scope } }
      OPTIONAL { GRAPH ?ug { ?cls opda:ufoCategory ?ufo } }
    }`);

  // 2. Object + 3. datatype properties (domain/range/inverse) --------------
  const objRows = await select(`
    SELECT ?p ?g ?label ?comment ?definition ?domain ?range ?inverse WHERE {
      ${GRAPH('?p a owl:ObjectProperty')}
      OPTIONAL { GRAPH ?lg { ?p rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?p rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?fg { ?p skos:definition ?definition } }
      OPTIONAL { GRAPH ?dg { ?p rdfs:domain ?domain } }
      OPTIONAL { GRAPH ?rg { ?p rdfs:range ?range } }
      OPTIONAL { GRAPH ?ig { ?p owl:inverseOf ?inverse } }
    }`);
  const dataRows = await select(`
    SELECT ?p ?g ?label ?comment ?definition ?domain ?range WHERE {
      ${GRAPH('?p a owl:DatatypeProperty')}
      OPTIONAL { GRAPH ?lg { ?p rdfs:label ?label . FILTER(LANG(?label)="en"||LANG(?label)="") }}
      OPTIONAL { GRAPH ?cg { ?p rdfs:comment ?comment } }
      OPTIONAL { GRAPH ?fg { ?p skos:definition ?definition } }
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
    SELECT ?s ?g ?pref ?def ?ufo ?top WHERE {
      ${GRAPH('?s a skos:ConceptScheme')}
      OPTIONAL { GRAPH ?pg { ?s skos:prefLabel ?pref } }
      OPTIONAL { GRAPH ?dg { ?s skos:definition ?def } }
      OPTIONAL { GRAPH ?ug { ?s opda:ufoCategory ?ufo } }
      # Top concepts assert via EITHER direction: the corpus uses the inverse
      # skos:topConceptOf (SKOS Reference S8: owl:inverseOf hasTopConcept; S7:
      # rdfs:subPropertyOf inScheme), which a hasTopConcept-only query silently
      # dropped — every scheme root was lost (council session-045/046).
      OPTIONAL {
        { GRAPH ?tg { ?s skos:hasTopConcept ?top } }
        UNION
        { GRAPH ?tg2 { ?top skos:topConceptOf ?s } }
      }
    }`);

  // 6b. sh:in IRI members per property-path -------------------------------
  // Recovers the class→scheme binding for IRI-valued coded properties
  // (currency/peril) via member skos:inScheme scheme. String-literal sh:in is
  // excluded (isIRI) — its binding is doctrine (ODR-0011 §7a), not an asserted
  // triple, and the prefLabel join is non-injective (council session-046). A
  // pure asserted-triple join: sh:in-member(IRI) → skos:inScheme → scheme.
  const shInRows = await select(`
    SELECT DISTINCT ?path ?member WHERE {
      ${GRAPH('?shape a sh:NodeShape ; sh:property ?ps . ?ps sh:path ?path ; sh:in ?list . ?list rdf:rest*/rdf:first ?member')}
      FILTER(isIRI(?member) && STRSTARTS(STR(?member), "${BASE}"))
    }`);

  // 6c. SHACL-derived object-property edges — belt-and-braces (ADR-0049 / Council
  // session-050 Q4 keep-decision; supersedes the session-047 framing).
  // founds/mediates/playedBy/plays/hasParticipant/hasAddress NOW carry documentary
  // rdfs:domain/range (authored AI-signal, NEVER entailed — the frozen closure adds
  // zero domain/range triples, ADR-0035), so the class→class diagram (/ontology/classes)
  // and the graph derive the single-class edges NATIVELY. This SHACL recovery is
  // RETAINED as belt-and-braces, NOT reverted, because the DISJUNCTIVE ("any-of")
  // properties (playedBy/plays/hasParticipant/hasAddress) carry their authoritative
  // per-class typing in SHACL sh:or, and documentary multi-domain/range alone
  // under-determines the precise per-class edge — so recovering the sh:or members
  // keeps every relationship class connected. The merge is idempotent with the native
  // domain/range edges. Recover effective subject/object classes from the shapes
  // graph (opda-base IRIs only) and merge into the object properties' domain/range.
  const inBase =
    `FILTER(isIRI(?cls) && STRSTARTS(STR(?cls), "${BASE}") && STRSTARTS(STR(?p), "${BASE}"))`;
  // Subject (domain) classes: a node shape's sh:targetClass that carries a
  // property path ?p (e.g. SellerShape targetClass Seller + sh:path playedBy →
  // Seller plays); OR a sh:targetSubjectsOf ?p shape's node-level sh:class /
  // sh:or members (RolePlaySubjectShape, RelatorSpineSubjectShape, HasAddressBearerShape).
  const shaclSubjRows = await select(`
    SELECT DISTINCT ?p ?cls WHERE {
      GRAPH ?g {
        ?shape a sh:NodeShape .
        { ?shape sh:targetClass ?cls ; sh:property ?ps . ?ps sh:path ?p . }
        UNION { ?shape sh:targetSubjectsOf ?p ; sh:class ?cls . }
        UNION { ?shape sh:targetSubjectsOf ?p ; sh:or ?l . ?l rdf:rest*/rdf:first ?m . ?m sh:class ?cls . }
      }
      FILTER(?g != <${ENTAILMENT}>)
      ${inBase}
    }`);
  // Object (range) classes: a sh:targetObjectsOf ?p shape's node-level sh:class /
  // sh:or members (FoundsRangeShape, PlaysRangeShape, HasParticipantRangeShape);
  // OR a property shape sh:path ?p carrying sh:class / sh:or members (the
  // SellerShape / RolePlayShape / ProprietorshipMediationShape co-domain pin).
  const shaclObjRows = await select(`
    SELECT DISTINCT ?p ?cls WHERE {
      GRAPH ?g {
        ?shape a sh:NodeShape .
        { ?shape sh:targetObjectsOf ?p ; sh:class ?cls . }
        UNION { ?shape sh:targetObjectsOf ?p ; sh:or ?l . ?l rdf:rest*/rdf:first ?m . ?m sh:class ?cls . }
        UNION { ?shape sh:property ?ps . ?ps sh:path ?p ; sh:class ?cls . }
        UNION { ?shape sh:property ?ps . ?ps sh:path ?p ; sh:or ?l . ?l rdf:rest*/rdf:first ?m . ?m sh:class ?cls . }
      }
      FILTER(?g != <${ENTAILMENT}>)
      ${inBase}
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
      label: r.label || local(r.p), comment: r.comment || '', definition: r.definition || '',
      module: moduleOf(r.g), domain: new Set(), range: new Set(), inverse: r.inverse || null }),
    add: (o, r) => { if (r.domain) o.domain.add(r.domain); if (r.range) o.range.add(r.range);
      if (r.definition) o.definition = r.definition;
      if (r.inverse) o.inverse = r.inverse; },
  };
  const objProps = index(objRows, (r) => r.p, collectProp);
  const dataProps = index(dataRows, (r) => r.p, collectProp);

  // Merge SHACL-derived subject/object classes into the object properties'
  // domain/range (Council session-047 / ADR-0048): the relationship-layer edges
  // pinned in SHACL (founds/mediates/playedBy/hasParticipant/hasAddress) become
  // visible as class→class edges on /ontology/classes + the graph, without
  // re-introducing the OWL domain/range entailment the council avoided. Only
  // affects object properties (datatype shapes don't match these patterns).
  for (const r of shaclSubjRows) objProps.get(r.p)?.domain.add(r.cls);
  for (const r of shaclObjRows) objProps.get(r.p)?.range.add(r.cls);

  // Index node shapes.
  const shapes = index(shapeRows, (r) => r.shape, {
    init: (r) => ({ uri: r.shape, id: id(r.shape), localName: local(r.shape),
      module: moduleOf(r.g), target: r.target || null, targetSubjectsOf: r.targetSOf || null,
      constraints: [] }),
    add: (o, r) => {
      if (r.target) o.target = r.target;
      // A shape may carry several sh:targetSubjectsOf (e.g. RelatorSpineSubjectShape
      // → founds, mediates). The field is scalar, so pick deterministically — the
      // lexicographically smallest — otherwise the kept value follows SPARQL row
      // order and drifts between environments (ADR-0044 doc-drift gate).
      if (r.targetSOf && (o.targetSubjectsOf == null || r.targetSOf < o.targetSubjectsOf)) o.targetSubjectsOf = r.targetSOf;
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
      prefLabel: r.pref || local(r.s), definition: r.def || '', ufoCategory: r.ufo || '',
      module: moduleOf(r.g), topConcepts: new Set(), concepts: new Set() }),
    add: (o, r) => { if (r.top) o.topConcepts.add(r.top); if (r.def) o.definition = r.def; if (r.ufo) o.ufoCategory = r.ufo; },
  });
  // narrower = inverse of broader; scheme membership rollup.
  for (const c of concepts.values()) {
    for (const b of c.broader) concepts.get(b)?.narrower.add(c.uri);
    for (const s of c.schemes) schemes.get(s)?.concepts.add(c.uri);
  }

  // Constrained-property path → scheme(s): a coded property whose SHACL sh:in
  // lists concept IRIs draws values from those concepts' scheme(s) (the faithful
  // class→scheme recovery for the IRI cases; council session-046).
  const schemesByPath = new Map();
  for (const r of shInRows) {
    const memberSchemes = concepts.get(r.member)?.schemes;
    if (!memberSchemes || memberSchemes.size === 0) continue;
    if (!schemesByPath.has(r.path)) schemesByPath.set(r.path, new Set());
    for (const sc of memberSchemes) schemesByPath.get(r.path).add(sc);
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

  // A class can fan into several rows (rdfs:comment lives in BOTH the main and
  // the -annotations graph for some classes), and any single row may leave an
  // OPTIONAL var unbound. Collapse the optional literals across every row first
  // so first-row ordering can't drop a class's definition / comment / scopeNote.
  const classMeta = new Map();
  for (const r of classRows) {
    const m = classMeta.get(r.cls) || {};
    if (r.definition && !m.definition) m.definition = r.definition;
    if (r.comment && !m.comment) m.comment = r.comment;
    if (r.scope && !m.scope) m.scope = r.scope;
    if (r.ufo && !m.ufo) m.ufo = r.ufo;
    if (r.label && !m.label) m.label = r.label;
    classMeta.set(r.cls, m);
  }

  const classes = new Map();
  for (const r of classRows) {
    if (classes.has(r.cls)) continue;
    const uri = r.cls;
    const meta = classMeta.get(uri) || {};
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
    // SKOS schemes this class's coded properties draw values from — recovered
    // two ways: a direct scheme-typed range (rare), and the real binding, a
    // property whose SHACL sh:in lists concept IRIs that skos:inScheme a scheme
    // (currency/peril). rdfs:range alone never matched — that was the bug.
    const usesSchemes = new Set();
    for (const p of allProps) if (p.domain.has(uri)) {
      for (const rg of p.range) if (schemeSet.has(rg)) usesSchemes.add(rg);
      for (const sc of (schemesByPath.get(p.uri) || [])) usesSchemes.add(sc);
    }

    classes.set(uri, {
      uri, id: id(uri), localName: local(uri), label: meta.label || local(uri),
      comment: meta.comment || '', definition: meta.definition || '', scopeNote: meta.scope || '', ufoCategory: meta.ufo || '',
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
      definition: p.definition || '', kind, module: p.module,
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
  // The module key derives from the named graph, so the cross-cutting graphs
  // (opda-shapes / opda-vocabularies / opda-contexts) would otherwise masquerade
  // as bounded contexts. The canonical model has exactly the 7 PDTF bounded
  // contexts — agent, claim, descriptive, foundation, governance, property,
  // transaction (ODR-0019/0020); SHACL, SKOS, and the context-definition graph
  // are cross-cutting concerns, not contexts. Exclude them so `contexts` is the
  // canonical 7 (per-context shapes still roll in via the `<ctx>-shapes`
  // normalisation in moduleOf; cross-cutting schemes stay in `schemes` only).
  const CROSS_CUTTING_MODULES = new Set(['shapes', 'vocabularies', 'contexts']);
  const contexts = new Map();
  const ctxAdd = (m, bucket, ref) => {
    if (!m || CROSS_CUTTING_MODULES.has(m)) return;
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
      prefLabel: s.prefLabel, definition: s.definition || '', ufoCategory: s.ufoCategory || '', module: s.module,
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
