# Gandon + Guizzardi — Formal-pair position on S004 (Gandon as Queen of this session)

*Joint pair voice. Gandon-led on URI/namespace/graph topology (Q1, Q3, Q7) and the URI side of Q2; Guizzardi-led on the UFO Kind/Role naming discipline encoded in Q2. Pair-joint on Q4, Q5, Q6. Per ODR-0001 §Roles, Gandon is Queen of S004 and will write the synthesis separately; this file is the pair's *position*, not the synthesis.*

## Pair summary (≤100 words)

ODR-0004 is `kind: architecture` and falls squarely under the A9-relaxed regime adopted yesterday — no UFO meta-category commitments, no ICs over hard cases. This is artefact-engineering: URI policy, graph topology, ontology-header convention, term-sourcing precedence, generator policy. We endorse all eight Rules as drafted but ground each against W3C standards and S001 transcripts. The four depth questions (Q1, Q2, Q3, Q7) cluster on URI architecture: hash over slash; Kind/Role legibility from the URI; three-graph separation as a W3C-rec composition pattern; versioned-ontology-resource as the artefact identity test the A9 amendment requires. The Knublauch DA attacks we anticipate land on operational composition cost (Q3) and generator-output divergence (Q5); both have W3C-grounded counters.

## Per-question positions

### Q1 — Hash vs slash (Gandon depth)

**Gandon (Queen).** Hash for the OPDA TBox at its current scale. The W3C TAG "Hash vs Slash" Note (Berners-Lee, Connolly, eds., 2008; updated through *Cool URIs for the Semantic Web*, Sauermann & Cyganiak 2008, W3C Interest Group Note) is unambiguous on this: hash URIs serve small *whole-document* vocabularies — one dereference fetches the entire TBox, and the consumer's RDF parser carves out the term identified by the fragment. Slash URIs are the textbook answer when the vocabulary is large enough that per-term content negotiation is a real cost — when fetching `…/Property` and `…/Person` and `…/Title` as separate documents reduces network and parse load. OPDA's foundation is a few hundred terms; the whole-document model is the textbook hash case.

The slash decision is speculative this round — no OPDA consumer demands per-term content negotiation; none of the published WG outputs (BASPI5 profile, TA6/7/10 overlays, PROV-O claims slice) need it; no scale projection forecasts when it would. Speculative URI architecture is precisely what the Linked Data Principles (Berners-Lee 2006; codified in Heath & Bizer 2011, *Linked Data: Evolving the Web into a Global Data Space*, Ch. 2 Principle 3) warn against — "useful information" is what dereferencing must yield, not an unconstrained future optionality. The hash decision is reversible (a future scale-out can re-host the terms at slash URIs and `owl:sameAs`-link the originals); the slash decision now is irreversible without breaking link integrity.

Operationally: hash satisfies LDP Principle 3 (`HTTP GET` on `https://opda.uk/ns/` returns the TBox; `#Property` selects the term) with one dereferenceable resource. The OPDA web team's persistence commitment (per Rule 5 of ODR-0004 — "don't ship URIs you don't serve") binds to *one* document, not to N. That is the cheapest dereferenceability commitment OPDA can make while satisfying LDP.

**The fragment-vs-303 distinction** that *Cool URIs* §4.1–4.2 (Sauermann & Cyganiak 2008) draws is the load-bearing technical detail. With slash URIs and 303 redirection, a dereference on `…/ns/Property` triggers a 303 redirect to `…/ns/Property.html` (human-readable) or `…/ns/Property.ttl` (machine-readable); content negotiation on `Accept:` header decides. With hash URIs, the fragment is client-side — the consumer fetches `…/ns/` once and parses the fragment locally; no server-side content negotiation infrastructure is required. For OPDA's deployment (Astro static site, Cloudflare Pages — per the deploy-via-CI conventions in the repo), the hash URI is operationally cheaper: a single `foundation.ttl` (or `foundation.html` with embedded RDFa per RDFa 1.1 Primer) served as a static asset. The 303-redirect infrastructure of slash URIs requires server-side content-negotiation logic that the current OPDA stack does not have and would not earn its keep at the foundation scale.

**Guizzardi.** Concur. The hash URI preserves the dereferenceable identity of the foundation as one resource — a property the A9 amendment's artefact identity test relies on (same `owl:versionIRI` lineage → same artefact). The URI architecture is the *artefact*, not the *commitment*; the Kind/Role distinction the ODR-0005 IC depends on (per the A9 §Per-kind discipline) lives in `## Rules` content, not in the URI shape. Hash URIs do not encode UFO commitments — they encode a publishing convention. That separation is correct.

**Pair vote.** **Hash, single `opda:` namespace.** Endorses ODR-0004 Rule 1 as drafted. Confirms S001 Q7's 9-0 in favour. Per the A9 §Artefact identity test (§Operational rule for extracting `pattern` records): the namespace string is artefact-engineering content; the Kind/Role distinction it labels is the `pattern` content recorded in ODR-0005 and cited from 0004 via `implements`.

---

### Q2 — Layer-segregated naming (Gandon URI lead + Guizzardi UFO Kind/Role discipline)

**Gandon (Queen).** URI-pattern legibility is good Web design *if and only if* the convention is enforced. The W3C TAG "Cool URIs Don't Change" Note (Berners-Lee 1998) and the linked-data convention codified in Heath & Bizer 2011 Ch. 3 ("Patterns for Publishing Linked Data") both endorse URI patterns that telegraph the layer of the term — `…/ns/Property` (Kind) vs `…/ns/Seller` (Role) carries information a consumer can parse without dereferencing. The discipline is honest: it documents the modeller's intent in the URI itself, which is the cheapest form of self-documentation available on the Web.

Hendler's S001 Q1 framing — "the deliberation is about *which things get URIs*" — is the load-bearing constraint here. The Kind/Role distinction is exactly the kind of thing that gets URIs; the URI shape labels it; review enforces it. Per Hendler's S001 Q1 position and his S001 Q4 sub-position ("a rigid Kind with `owl:hasKey` is at most a secondary semantic annotation"), the enforcement is operational, not just decorative: reviewers reading a PR can spot a Role-as-Kind conflation from the URI alone. That is the URI architecture earning its keep.

**Guizzardi.** The Kind/Role distinction the URI carries reflects the UFO meta-category that ODR-0005 (and downstream `kind: pattern` ODRs per the A9 amendment landed yesterday) will commit to. The naming convention is *artefact-encoding* of a `pattern`-level commitment that lives elsewhere: ODR-0004's Rule 2 is artefact-engineering because it is the rule about *how the URI labels the distinction*; ODR-0005's Rule (when authored) is the `pattern`-level commitment about *which entities are Kinds vs Roles in the OPDA domain*. The A9 amendment confirms this split: ODR-0004's `kind: architecture` discipline does not require an inline UFO commitment; the URI just labels what the `pattern` ODR commits to.

The withdrawal condition I lodged in S001 Q3 — "no naming discipline conceals the Kind/Role distinction the ontology exists to make, invites role-as-Kind conflation, and is therefore unacceptable" — was met by Rule 2 of ODR-0004 as drafted. The examples table in Rule 2 (Property, Person, RegisteredTitle as Sortal Kinds carrying identity; Seller, Proprietor, Buyer as Role/Phase borrowing identity) is the canonical Guizzardi 2005 distinction (UFO Substance Kind vs Role-as-anti-rigid-class — *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4) made operationally visible in the URI surface. The commitment itself — that Property *is* a Substance Kind, that Seller *is* a Role — is reserved for ODR-0005 per the A9 amendment's §Per-kind discipline. ODR-0004 just encodes the discipline; ODR-0005 makes the commitment.

**Pair vote.** **Endorse Rule 2 as drafted.** Layer-segregated naming with the Kind/Role distinction legible from the URI. The UFO commitment that grounds the distinction is `pattern`-level content of ODR-0005, cited from 0004 via `implements` per the A9 §Artefact identity test (cross-`architecture` rule-borrowing → candidate for `pattern` extraction; the rule is already extracted, so 0004 cites it).

---

### Q3 — Three-graph separation (Gandon depth — Q3 of Session 001 carried this argument)

**Gandon (Queen).** This is W3C composition methodology, not OPDA invention. The compositional rule cleanly states: build-step graph-union; the consumer reads both graphs into one SPARQL endpoint, but the *authoring* keeps them separate. The three graphs are:

1. **OWL/RDFS class graph** — open-world; Kind/Role classes; `rdfs:subClassOf`, `owl:Class`, datatype/object property declarations. Targeted by reasoners that materialise inferences.
2. **SHACL shapes graph** — closed-world; constraint contracts; `sh:NodeShape`, `sh:PropertyShape`, `sh:targetClass`, severity assignments. Targeted by SHACL processors that produce validation reports.
3. **Advisory annotation graph** — neither open-world entailment nor closed-world validation; metadata-on-the-graph (the exiled `opda:aiHint` from S001 Q5, retrieval hints, generator notes). Keyed by shape IRI or class IRI; loaded only by consumers that opt in.

The composition rule is the load-bearing piece. Per SHACL Core §6.5 (W3C Recommendation, Knublauch & Kontokostas, eds., 2017; SHACL 1.2 lineage per ODR-0002 Core-tier pin), `sh:targetClass` is the *only* relation between the shapes graph and the class graph: the shape "targets the class via its URI" without importing the class graph's axioms. This is the textbook open-world / closed-world separation:

- **Open-world (OWL).** If the class graph declares `opda:Property rdfs:subClassOf opda:Endurant`, a reasoner can derive `opda:RegisteredTitle rdfs:subClassOf opda:Endurant` via transitive `rdfs:subClassOf`. The absence of an explicit triple does not entail its negation.
- **Closed-world (SHACL).** If a shape declares `sh:property [ sh:path opda:uprn ; sh:minCount 1 ]`, the absence of a `opda:uprn` value on an instance produces a `sh:Violation`. The absence *is* the failure.

Mixing these two graphs is the SHACL-1.0-era mistake that Knublauch's own SHACL 1.2 errata warn against: if the shapes graph were imported via `owl:imports`, a reasoner would treat the SHACL axioms as OWL axioms, and the closed-world cardinalities would leak into the class graph as `owl:Restriction` cardinalities — producing nonsense (an instance violating `sh:minCount 1` would be inferred to be inconsistent in OWL, when in fact it just fails a SHACL contract). The composition discipline (`sh:targetClass` not `owl:imports`) is precisely the discipline that prevents this leak.

ODR-0002's new normative subsection landed yesterday — `### Reference-not-import (normative)` (Session 002 Q4, 9-0 with Cagle DA full withdrawal) — codifies the parallel rule for vocabulary catalogue: `reference-only` is the MUST default; `slice-import` is the per-row justified exception; `full-import` is Core-tier only. The three-graph separation in ODR-0004 Rule 3 is the *intra-OPDA* application of that same discipline: shapes graph references the class graph via `sh:targetClass`; never imports it.

The advisory annotation graph (keyed by shape IRI) is the third leg: `opda:aiHint` and any other LLM-consumer hints (S001 Q5: Cagle wanted inline; Knublauch and I prevailed; Cagle dissent recorded ~7-2). Keyed by shape IRI means a consumer reading the shape can find the annotation via the shape's URI, without the shape itself carrying an invented term that could masquerade as a SHACL constraint. The annotation graph is *opt-in* — a SHACL processor never sees it; an LLM retriever fetches it explicitly.

**Knublauch will press on operational composition cost** — runtime materialisation, repeated graph union per request, the SHACL processor needing to load N graphs for each profile validation. Counter: build-step graph-union is trivial — `cat foundation.ttl shapes.ttl annotations.ttl > runtime.ttl` is the cheap form; the SHACL processor handles `sh:targetClass` natively via class-IRI lookup against the imported class graph (per SHACL Core §6.5). The operational case where composition cost *matters* is the *profile* composition at ODR-0010 (overlay profile build: base shapes ∪ profile slice → composed profile graph). That is a Knublauch-owned ODR; the cost lives there. ODR-0004 is the substrate that makes the cost trivial: separate authoring graphs are the cheap form; the profile build is the only place where graph-union runs.

**The enforcement clauses** Rule 3 stipulates — "no `owl:imports` from shapes to classes; no property with both `owl:` cardinality and `sh:` count as if equivalent; advisory annotations absent from the shapes graph" — are mechanically checkable. A reviewer (or a SHACL-on-SHACL lint) can run a SPARQL query against the shapes graph: `ASK { ?s a sh:NodeShape . ?s owl:imports ?g }` → fails if non-empty. The same for the cardinality drift: `ASK { ?p a owl:DatatypeProperty . ?p owl:cardinality ?n . ?ps sh:path ?p . ?ps sh:minCount|sh:maxCount ?m }` → flags candidate duplications for review. Enforcement does not need a separate ODR; it lives in the shapes graph's own review discipline.

**Guizzardi.** Concur. Three-graph separation maps to UFO's class/instance/Mode separation (Guizzardi 2005, Ch. 4):

- The **class graph** (Kind/SubKind/Role/Phase declarations) is the *ontology of types*. It is open-world because the type structure of the domain is potentially-extensible; future modules may extend the Kind hierarchy without invalidating existing entailments.
- The **shapes graph** (SHACL constraints) is the *closed-world contract* against instances. It is what the consuming application validates against; cardinality, datatype, value-set membership. The instance-shaped commitments belong here.
- The **annotation graph** (metadata-on-the-graph) is the *Mode* layer in UFO terms — properties of the artefact itself, not properties of the modelled domain. `opda:aiHint`, generator notes, retrieval hints are Modes inhering in the *artefact*, not in the domain entities the artefact describes.

Three distinct artefact roles. Each has a different open-world / closed-world commitment, a different consumer (reasoner / SHACL processor / opt-in retriever), a different versioning lineage. Conflating them produces the "loaded profile = active ontology" error Guarino DA attacked in S001 Q5 — and which the panel resolved with `opda:ValidationContext` reification (the Q5 amendment). The three-graph separation is the substrate that makes ValidationContext coherent: a profile *is* a triple-of-graphs, not a single soup.

**Pair vote.** **Endorse Rule 3 as drafted.** Three-graph separation per S001 Q3 panel consensus (Gandon + Knublauch lead; Guizzardi UFO grounding) and S001 Q5 advisory-annotations-to-separate-graph (Knublauch + Gandon prevail ~7-2; Cagle dissent recorded).

---

### Q4 — Term-sourcing precedence (pair joint)

**Gandon.** Precedence: **W3C/external spec > business glossary > schema-leaf annotation.** Standards-body authority is foundational; the W3C Process Document and FIBO's authority hierarchy (Allemang & Hendler 2020, *Semantic Web for the Working Ontologist*, 3rd ed., Ch. 13) both treat external standards as the ceiling — when a term has a W3C definition, the W3C definition is the dereferent. The OPDA business glossary is the project's *ubiquitous language* (Eric Evans, *Domain-Driven Design*, 2003, Ch. 14 — "the ubiquitous language is the language all team members use") and serves as the second-rank authority for terms not governed by an external spec. The data-dictionary schema-leaf annotation is the lowest-trust layer — it is the JSON-Schema documentation accident OPDA is converting away from; it provides `rdfs:comment`, datatype ranges, and cardinality, but its label semantics are derivative.

The `dct:source` link is the operationalisation: every minted term carries a triple `<opda:Term> dct:source <authoritative-source>` where the source resolves to the W3C spec (when admitted), the glossary row (when not), or the schema-leaf path (when neither). The reviewer can trace the term's semantic provenance in one hop.

**Guizzardi.** Concur with one caveat: where the W3C spec uses a label that conflicts with the project's ubiquitous language — e.g. `cred:VerifiableCredential` (W3C VCDM 2.0, admitted to Defer per Scope-Check 1 Q7c) carries a label that overlaps OPDA's domain terminology around "claim" — the conflict is recorded in a Change Log row (per ODR-0002's new §Change log governance pattern landed yesterday in Session 002 Q4). The W3C label is the authoritative URI dereferent (the term *is* `cred:VerifiableCredential`); the project may use a `skos:altLabel` for downstream rendering (per ODR-0011's SKOS-for-enumerations programme).

This caveat reflects the A9-relaxed regime: ODR-0004's `kind: architecture` does not commit to *which* terms get which UFO category — that is `pattern`-level content. ODR-0004 just fixes the *precedence rule* for sourcing the term's human-readable definition. The UFO commitment lives in the `pattern` ODR that adopts the term; the conflict-resolution rule lives here.

**Operational triple shape.** Per Rule 7's enforcement clause ("every minted class/property carries a `dct:source` resolving to a glossary row or canonical leaf path; labels/definitions on glossary-named concepts match the glossary"), the per-term provenance triple is:

```turtle
opda:Property
    a owl:Class ;
    rdfs:label "Property"@en ;
    skos:prefLabel "Property"@en ;
    rdfs:comment "A physical real-property unit identified by its UPRN where assigned." ;
    dct:source <https://opda.uk/glossary#property> ;
    skos:definition "..."  # from glossary row
    .
```

A reviewer can trace `dct:source` to a glossary row that itself cites the W3C spec (if any), so the precedence is checkable transitively without the ODR-0004 reviewer needing to know which terms are W3C-governed — the glossary tracks that.

**Pair vote.** **Endorse Rule 7 as drafted** (precedence: W3C > glossary > schema leaf; `dct:source` link mandatory; downstream consumers ODR-0008, ODR-0011, ODR-0013).

---

### Q5 — Generator-first policy (pair joint)

Concur with Allemang's S001 Q1 amendment. The mechanical half — named slot with scalar datatype → `opda:` `DatatypeProperty` with `xsd:` range, `rdfs:domain` enclosing-object class — is *generated*, not hand-authored. Council and module-ODR cycles are reserved for genuinely ambiguous moves (aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state).

**Operational shape (proposed):**

- **Generator input:** `source/00-deliverables/semantic-models/data-dictionary-canonical.json` (1,557 unique leaves; 935 annotated).
- **Generator location:** `tools/generator/` (peer to `schemas/`).
- **Runner:** `npm run generate:ontology` — calls a Node-based generator script (or equivalent; the choice of runtime is a build-engineering decision delegated to the OPDA web team's tooling preferences).
- **Output:** `source/03-standards/ontology/foundation.ttl` — the mechanical class skeleton plus `DatatypeProperty` declarations with `xsd:` ranges, `rdfs:domain`, and `rdfs:comment` from the data dictionary.
- **Diff:** reviewable in PR — generator output is TTL, the diff shows added/changed terms alongside dictionary changes, the reviewer reads both in one hop.

The generator's *specification* (the deterministic mapping from dictionary entry to TTL fragment) is a sibling document under `tools/generator/SPECIFICATION.md` (or analogous), version-pinned via `owl:versionIRI` on the generator output. A change to the spec is a Change Log row in ODR-0004's references; a change to the dictionary is a PR against `data-dictionary-canonical.json`.

**What stays out of the generator.** Per Allemang's S001 Q1 framing, the genuinely ambiguous moves are reserved for Council:

- **Aggregate boundaries.** When does an `address` sub-object become its own class vs a structured value? Not generator output — that is a UFO Mode-vs-Substance commitment per ODR-0005's IC discipline.
- **Cross-overlay synonymy.** When does `nts:applicant` align with `baspi:buyer`? Not generator output — that is `dct:source` cross-reference work owned by ODR-0010.
- **`oneOf`-as-subclass-vs-state.** When does `sellersCapacity = "LegalOwner"` become a `Phase`, and when does it become a `Role`? Not generator output — that is the discriminator-as-Role-vs-Phase distinction owned by ODR-0006.

The generator handles the mechanical 80%; the Council handles the genuinely ontological 20%. That ratio (Moreau's S001 Q6 finding that ~80% of verifiedClaims maps natively to PROV-O; the remaining 20% requires bespoke modelling) is the precedent — and it is reproducible.

**Knublauch will attack generator output divergence** — what if two runs of the generator on the same input produce different TTL? Counter: deterministic generator (no LLM-in-the-loop; pure-function dictionary → TTL) + version-pinned input = reproducible output. The version-pin is the `owl:versionIRI` on the generator's specification document; if the generator is changed, the version-IRI is bumped; the prior output remains accessible via the prior version-IRI. This is the W3C versioning discipline applied to the build pipeline.

**Pair vote.** **Endorse Rule 6 as drafted.** Generator-first; mechanical slot → `DatatypeProperty` deterministic; ambiguous moves reserved for Council.

---

### Q6 — Diagnostic-exemplar policy (pair joint)

Concur with S001 Q1 Guarino amendment (admitted 11-0-1; Guarino withdrew on the diagnostic-exemplar resolution).

**Operational shape (proposed):**

- **Storage:** `source/03-standards/ontology/exemplars/{name}.ttl` (peer to `foundation.ttl` and `shapes.ttl`).
- **Filename:** descriptive kebab-case — `registered-freehold-house.ttl`, `unregistered-pre-first-registration-house.ttl`, `split-uprn-flat.ttl`.
- **Citation:** ODR-0005's `## Rules` cites the exemplars by path; the IC over hard cases (per the A9 §Per-kind discipline) is *tested* against the exemplars, not just stated abstractly.
- **TBox status:** not folded into the deliverable TBox; the exemplars are the *thinking* boundary, not the *deliverable* boundary. Gitignored from the deliverable build (the build artefact does not include exemplars); committed to the repo for the Council's audit trail.

**Why the exemplar discipline matters for ODR-0004 specifically.** The A9 amendment's §Per-kind discipline (landed yesterday) requires `kind: pattern` ODRs to state ICs over named hard cases. The diagnostic-exemplar harness is what *operationalises* that requirement: ODR-0005 cannot just assert "Property's IC is spatial-material continuity over demolition / subdivision / merger"; it must *test* that IC against the three exemplars and record the test outcomes in `## Rules`. The exemplars are the falsifier — without them, the IC is decorative (per Guarino DA's A9 §"What Gandon *is* right about" / §"What Guizzardi *is* right about" position: "a UFO meta-category without IC is decoration").

ODR-0004's role here is to fix *where the harness lives* and *how it is cited*. The commitment about *what the exemplars test* lives in ODR-0005. The artefact-vs-commitment split (per A9) is observed: 0004 fixes the substrate (harness location, filename convention, citation path); 0005 makes the commitment (which IC the exemplars test).

**Pair vote.** **Endorse Rule 8 as drafted.** Three exemplars per S001 Q1; harness location per the operational shape above; IC discharge per ODR-0005.

---

### Q7 — Namespace string + version scheme (Gandon depth)

**Gandon (Queen).** This is the most load-bearing artefact decision in ODR-0004 — the namespace string is the project's commitment to long-term dereferenceability. The W3C TAG "Cool URIs Don't Change" Note (Berners-Lee 1998) and the Heath & Bizer Ch. 2 Principle 4 ("include links to other URIs") both make this normative: a URI that breaks invalidates every triple that uses it. The persistence commitment binds for the lifetime of every consumer that has dereferenced the URI.

The WG's trade-off, per the open questions in ODR-0004 Rule 1:

- **`https://opda.uk/ns/`** — couples to the OPDA project's own domain. OPDA owns the domain; OPDA controls the dereference; OPDA's lifecycle is the namespace's lifecycle. Risk: OPDA project lifecycle (the WG itself) is the failure mode — if OPDA winds down, the namespace breaks.
- **`https://trust.propdata.org.uk/ontology/`** — couples to the trust-framework's lifecycle. The trust framework may have a shorter lifespan than the OPDA project, but it may also have wider adoption (more consumers). Risk: trust-framework governance changes can affect dereferenceability.

**Recommend `https://opda.uk/ns/`.** OPDA project owns the dereference; the trust framework is a *consumer* of the ontology, not the publisher. The publisher's domain is the right home for the namespace. This is the FIBO discipline (Allemang & Hendler 2020, Ch. 13: "the publisher of the ontology owns the namespace; consumers reference it"). The trust framework can `dct:conformsTo` the OPDA ontology under its own domain without owning the namespace string.

**Versioning.** Hash URIs make `owl:versionIRI` the version-pin — the namespace itself is *unversioned* (consumers dereference `…/ns/` and get the current version), but the ontology resource carries `owl:versionIRI` (e.g. `https://opda.uk/ns/2026-q3`). A consumer that wants to pin to a specific version dereferences the `owl:versionIRI` URI; the dereferent at that URI is frozen.

**Calendar versioning (`2026-q3`)** for the evolving foundation. Reasoning (per FIBO's Production-tier discipline; Kendall & Davis at the FIBO Modelling Team): an evolving foundation has no stable semantic-version contract — there is no "v1.0 = stable; v2.0 = breaking change" lineage because the foundation is being authored, not maintained. Calendar versioning is honest about the lifecycle ("this is the 2026-q3 snapshot; the 2026-q4 snapshot may differ in any way") and the consumer can pin to the snapshot they tested against.

**Semantic versioning (`1.0.0`)** for individual modules — once the BASPI5 profile, the PROV-O claims slice, or any other ODR-0010-vintage profile graph stabilises, its `owl:versionIRI` can carry a semantic version. This matches the schema 3.4.0 lineage (the PDTF v3 base schema is at 3.4.0; semantic versioning is the established discipline for the schemas).

**Worked example.** For the 2026-q3 foundation snapshot:

```turtle
@prefix opda: <https://opda.uk/ns/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix vann: <http://purl.org/vocab/vann/> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .

<https://opda.uk/ns/>
    a owl:Ontology ;
    owl:versionIRI <https://opda.uk/ns/2026-q3> ;
    vann:preferredNamespacePrefix "opda" ;
    vann:preferredNamespaceUri "https://opda.uk/ns/" ;
    dct:title "OPDA PDTF Foundation Ontology" ;
    dct:creator <https://opda.uk/wg> ;
    dct:issued "2026-09-30"^^xsd:date ;
    dct:modified "2026-09-30"^^xsd:date ;
    sh:declare [
        sh:prefix "opda" ;
        sh:namespace "https://opda.uk/ns/"^^xsd:anyURI
    ] .
```

The consumer dereferences `https://opda.uk/ns/` and receives this document; the parser sees the `owl:Ontology` declaration with `owl:versionIRI` pointing at the snapshot; the consumer that wants to pin to 2026-q3 dereferences `https://opda.uk/ns/2026-q3` instead. Both URIs dereference to the same content during the snapshot's lifetime; when the 2026-q4 snapshot publishes, `https://opda.uk/ns/` follows it while `https://opda.uk/ns/2026-q3` is frozen.

**Guizzardi.** Concur. The versioned-ontology-resource discipline is exactly what the A9 amendment's artefact identity test (per ODR-0001 §Artefact identity test landed yesterday) requires. The three-part test:

1. **Same dereferenceable resource.** Same `owl:versionIRI` lineage = same artefact = same ODR.
2. **Same prefix and target topology.** Same `vann:preferredNamespacePrefix` and same graph-import topology = same artefact.
3. **Re-instantiability.** Same convention applied to another artefact = candidate for `pattern` extraction.

Calendar versioning on the foundation means: each quarterly snapshot is a distinct artefact with its own `owl:versionIRI`; the ODR records the *current* foundation; supersession is recorded inline in `## Rules` (per ODR-0001 §Self-amendment process) or via a successor ODR if the namespace string itself changes (which would be a breaking change requiring a new identity).

The artefact identity test gives the right answer to the supersession question: a new `owl:versionIRI` is a new artefact, but it may *or may not* require a new ODR — the test is whether the rules in `## Rules` change. If the rules are stable across versions (the namespace policy, the graph-separation rule, the term-sourcing precedence), one ODR covers all versions of the artefact; the version-IRI is what the artefact carries, not what the ODR partitions on.

**Note on Rule 4 (ontology header).** Rule 4 specifies the `owl:Ontology` header carries `dct:title`/`creator`/`issued`/`modified`, `vann:preferredNamespacePrefix`/`Uri`, `owl:versionIRI`, and an `sh:prefixes` declaration node. The worked example above instantiates all of these. The `sh:prefixes` node (Knublauch's S001 Q1 contribution) is load-bearing for SHACL-SPARQL — without it, the UPRN uniqueness check in ODR-0005 (`sh:sparql`-based) would silently fail to resolve the `opda:` prefix. Header lint is mechanically reviewable once the base URI is fixed — a SPARQL `ASK` against `?ont a owl:Ontology . ?ont vann:preferredNamespacePrefix ?p . ?ont owl:versionIRI ?v` flags any header missing a required term.

**Pair vote.** **Recommend `https://opda.uk/ns/`** as the base namespace string. **Calendar versioning on `owl:versionIRI`** for the foundation; semantic versioning for downstream modules once stabilised. Rule 1's "WG-owned" status holds — the pair recommends; the WG ratifies.

---

## Replies to anticipated DA attacks

**Knublauch will attack Q3 on operational SHACL composition cost.** His likely line: "Three graphs to compose for every validation pass is operational overhead; one graph is cheaper to load and process."

**Reply (Gandon).** Build-step composition is trivial — file concatenation or named-graph union via `LOAD` directives. The operational case Knublauch is worried about is the *profile* composition (overlay graphs merging into a profile graph), which is ODR-0010's territory and where SHACL processors handle `sh:targetClass` natively via class-IRI lookup. ODR-0004 makes the substrate cheap: separate authoring graphs are the cheap form; the profile build (one place) is where composition runs; the validation pass uses the composed graph. The W3C TAG and the SHACL Rec both endorse this pattern (SHACL Core §6.5 — `sh:targetClass` is the canonical relation; `owl:imports` from shapes to classes is explicitly out of scope).

**Knublauch will attack Q5 on generator output divergence.** His likely line: "Deterministic generators are aspirational; in practice generators evolve and outputs drift; the runtime artefact may not match the spec it was generated from."

**Reply (Gandon).** Deterministic generator (no LLM-in-the-loop; pure-function dictionary → TTL) + version-pinned input = reproducible output. The version-pin is the `owl:versionIRI` on the generator's specification document; if the generator is changed, the version-IRI is bumped; the prior output remains accessible via the prior version-IRI. This is the W3C versioning discipline (RDF 1.1 Concepts §1.5; *Cool URIs* Sauermann & Cyganiak 2008) applied to the build pipeline. Knublauch is right that *non-deterministic* generators drift; the answer is to keep the generator deterministic.

---

## Pair votes (depth questions)

| Question | Vote |
|---|---|
| Q1 — Hash vs slash | **Hash, single `opda:` namespace.** Endorses Rule 1; confirms S001 Q7 9-0. |
| Q2 — Layer-segregated naming | **Endorse Rule 2 as drafted.** Kind/Role URI legibility; commitment lives in ODR-0005 cited via `implements`. |
| Q3 — Three-graph separation | **Endorse Rule 3 as drafted.** OWL ⊥ SHACL ⊥ annotation; `sh:targetClass` not `owl:imports`; advisory annotations in separate graph keyed to shape IRIs. |
| Q7 — Namespace string + version scheme | **`https://opda.uk/ns/`** + **calendar versioning on `owl:versionIRI`** for the foundation; semantic versioning for stabilised modules. Rule 1's "WG-owned" status holds — pair recommends, WG ratifies. |

## Pair closing remark

ODR-0004 reads as a clean `kind: architecture` exemplar under the A9-relaxed regime. The eight Rules cohere as a substrate decision: URI policy (1, 2, 5), graph topology (3), header convention (4), term-sourcing (7), generator policy (6), exemplar harness (8). None requires UFO meta-category commitments or ICs inline — those live in ODR-0005 (`pattern`) and downstream `pattern` ODRs cited via `implements`. The A9 amendment's artefact identity test gives 0004 a coherent identity: one TBox file, one `owl:versionIRI` lineage, one `vann:preferredNamespacePrefix`. The depth questions (Q1, Q2, Q3, Q7) all anchor in W3C Recommendations and Working Group Notes (Hash vs Slash; Cool URIs; SHACL Core §6.5; RDF 1.1 Concepts §1.5); the joint questions (Q4, Q5, Q6) operationalise S001 precedent without disturbing it. The pair's stance is endorse-as-drafted with W3C-grounded rationale; the Knublauch DA attacks land on operational cost (Q3) and divergence (Q5), both with counters that defer the load to ODR-0010 (profile composition) and the generator's deterministic-spec discipline.

## References

- Berners-Lee, T. (2006). *Linked Data — Design Issues*. W3C.
- Heath, T. & Bizer, C. (2011). *Linked Data: Evolving the Web into a Global Data Space*. Ch. 2 (Principles), Ch. 3 (Patterns for Publishing).
- Berners-Lee, T. & Connolly, D., eds. (2008). W3C TAG Note: "Hash vs Slash". Updated through Sauermann, L. & Cyganiak, R. (2008), *Cool URIs for the Semantic Web*, W3C Interest Group Note.
- Berners-Lee, T. (1998). W3C TAG Note: "Cool URIs Don't Change".
- W3C (2014). *RDF 1.1 Concepts and Abstract Syntax*, Recommendation. §1.5.
- W3C (2013). *SPARQL 1.1 Query Language*, Recommendation.
- W3C (2017). *SHACL Core*, Recommendation. Knublauch & Kontokostas, eds. §6.5 (`sh:targetClass`).
- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind, Role, Phase, Relator taxonomy).
- Allemang, D. & Hendler, J. (2020). *Semantic Web for the Working Ontologist*, 3rd ed. Ch. 13 (FIBO and Enterprise Ontologies).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment landed 2026-05-27.
- ODR-0002 §Reference-not-import (normative) — Session 002 Q4 amendment landed 2026-05-27.
- ODR-0004 — the architecture spike under review (S001 Q1, Q3, Q5, Q7 anchored).
- S001 transcript — Q1 (genuine modelling + generator-first), Q3 (partition by ontological concern + three-graph separation), Q5 (advisory annotations exiled to separate graph), Q7 (single `opda:` hash 9-0).
