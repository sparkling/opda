# Council Session 045 — Resolving the graph/classes observations: the bridge, the floaters, layer separation, the mass (Full Council)

- **Date:** 2026-06-16
- **Records:** No new ODR ratified by this council (it shapes proposals). Routes to: a **Q1/Q3 extractor-and-view ODR proposal** (graph derivation + `opda:layer`), a **Q2 Relator-spine modelling proposal** (assert `opda:mediates`/`founds`; ADR-0006/ODR-0006 lineage), and two **verified extractor-bug fixes** (`skos:topConceptOf` drop; `usesSchemes` `rdfs:range`-only). Engages ADR-0043/0047, ODR-0006/0011/0027/0030/0031, session-036.
- **Queen:** Dean Allemang (*Semantic Web for the Working Ontologist* 3rd ed. — pragmatic RDF, "the simplest model that serves the consumer"; composes the synthesis and votes).
- **Devil's Advocate:** Kurt Cagle (SHACL-first — "a `sh:in` is a validation constraint, not a relation; SKOS concepts are values, not graph citizens; the graph is largely correct and *enriching* it misrepresents the semantics" — genuinely opposed to the "connect/enrich" framing).
- **Panel:** Giancarlo Guizzardi (NEMO/UniLu — identity/rigidity/class-vs-value) · Nicola Guarino (ISTC-CNR — OntoClean, identity criteria) · Holger Knublauch (TopQuadrant — SHACL) · Antoine Isaac (SKOS Reference co-editor) · Jim Hendler (RPI/W3C — OWL semantics/web-architecture) · Ian Davis (BBC/UK-Gov — linked-data deployment realism).
- **Voices:** 8 (7 spawned teammates + the Queen seat).
- **`consensus-mode`:** `agent-fan-out` (per-question votes independent; no conditional verdicts). Cross-talk transport: `SendMessage` via Agent Teams (`council-045`); full DMs mirrored into each `working/session-045/<persona>.md`.
- **Format:** Full Council (~8 runs).
- **Input:** `working/session-045/EVIDENCE.md`; `scripts/ontology-graph.mjs`, `scripts/ontology-model.mjs`, `src/data/ontology-model.json`, `public/data/ontology-graph-elements.json`, `public/ontology/artefacts/opda-{merged,shapes-merged}.ttl`, `source/03-standards/ontology/*.ttl`, `src/components/ontology/ClassDetail.astro`.

## Context

Three operator observations on `/ontology/graph` (the ADR-0043/0047 8-engine bake-off) and `/ontology/classes`: **(1)** a huge amount of unconnected entities; **(2)** very few entities; **(3)** the graph conflates domain / SHACL / SKOS / gUFO. A prior viz change (facets→filter, colour→type, edgeless-external hiding) addressed only the colour-noise *symptom* of #3. This council decides the *substance*: what to change in the graph extractor, the model extractor, and the ontology — versus what is correct-by-doctrine.

**Empirical findings the panel verified** (and the Queen independently cross-checked): 40 owl:Class, 28 object-property edges, only **15/40 classes connected** (25 orphans); ~16 edges are spokes into MonetaryAmount; the SKOS layer is **49 schemes + 323 concepts** with **0 `skos:broader`**; the OWL and SKOS layers share **no edge**; `usesSchemes` is empty on all 40 classes; coded values bind via SHACL `sh:in`, not `rdfs:range`. **Two extractor bugs surfaced and were Queen-verified:** the model extractor drops **22 `skos:topConceptOf`** roots (queries only `hasTopConcept` — 0 of those exist; `ontology-model.mjs:184`), and derives `usesSchemes` from `rdfs:range ∈ schemes` only (`:274-276`), which never matches. **Citation note (Queen verification):** there are **0 asserted `skos:exactMatch` triples** (the 8 textual hits are prose inside `scopeNote`/`definition` literals — the Queen's interim "8 triples" was a mis-grep, retracted to Isaac); `sh:in` is **SHACL §4.8.3** (not §4.6.1); `skos:topConceptOf` is **SKOS S8** (`owl:inverseOf hasTopConcept`) + **S7** (sub-property of `inScheme`); `skos:Concept`≠`owl:Class` is **SKOS §3.5.1**; SKOS "is not a formal KR language" is **§1.3** — all web-verified against the specs 2026-06-16.

## Question 1 — Recover a class→vocabulary bridge from SHACL `sh:in`?

**REVISE — 8–0–0 FOR. DA: WITHDRAWN (conditional on 4 guardrails).**

The decisive verified fact (Knublauch, confirmed by Guarino, Hendler, the Queen): `sh:in` splits two ways. **(A) ~21 string-literal enums** (`sh:datatype xsd:string` + `sh:in ("Freehold" "Cable" …)`) name their scheme **only in `sh:message`/`rdfs:comment` prose** — no machine link. The clincher (Davis-verified): the only candidate join, string-literal → concept by `prefLabel`/`notation` → scheme, is **non-injective** — of 264 distinct prefLabels, **24 are ambiguous** ("Freehold"/"Leasehold"/"Commonhold" each ∈ 2 schemes; "Other" ∈ 8; "Yes"/"No" ∈ 6; EPC/council-tax bands ∈ 3) — so a bare string literal **cannot deterministically select its scheme**. Recovering it needs prose-parsing or a hardcoded table (fabrication; breaks the drift gate). `rdfs:comment` names the scheme but as a curie *substring in an English sentence*, not a triple (OWL2 Primer §8.1 — annotations carry no formal meaning a transform may rely on). **(B) 2 IRI-valued enums** (currency, peril) whose members are dereferenceable concept IRIs each `skos:inScheme` their scheme — recoverable by the deterministic join `sh:in`-member → `skos:inScheme` → scheme over triples that already exist.

**Cagle (DA):** opened **REJECT** — *"Drawing a `class → skos:ConceptScheme` edge 'recovered' from a SHACL `sh:in` enumeration is a category error … a shape does not assert a fact; it validates"* (SHACL §4.8.3, §2.1/§1.1). On verifying the A/B split and the panel's *derived-not-asserted* construction, **WITHDREW**: *"my objection was never to showing the recoverable dependency; it was to (a) minting an asserted relation from a validation condition and (b) scraping `sh:message` prose. The agreed construction does neither."*
**Knublauch:** REVISE/FOR-narrow — derive **`opda:constrainedByScheme`** (renamed from `usesScheme` at Guizzardi's prompting — *"'uses' reads relator-shaped"*) for case (B) only, via the `sh:in`→`skos:inScheme` join; REJECT any string-derived edge; REFER making (A) machine-readable upstream. SHACL §1.5 (a shape is a closed expectation over *data*, not T-Box meaning) + SKOS §8.1.
**Guarino:** REVISE/FOR (IRI-grounded only) — *"draw only relations that hold"* (Welty & Guarino 2001, *DKE* 39(1)); the 23 string enums' scheme-governance is a **presentation** concern → a per-class "constrained-by" panel, not an edge.
**Guizzardi:** REVISE/FOR (derived, dashed) / AGAINST `usesScheme`-as-relation — *"a `sh:in` on a quality-value property is a value-space constraint … promoting it to a first-class edge reifies a value-space membership into a relator-shaped edge with no relator"* (Guizzardi 2005 Ch.4 §4.3; the inverse of ODR-0031 "classified-under, not is-a").
**Isaac:** REVISE/FOR (IRI-resolvable subset) — faithful only where the value-space resolves through asserted `skos:inScheme` (SKOS §8.1); string cases → fix the source.
**Hendler:** REVISE/FOR — 2 cases as a *derived, badged* view edge, **never emitted to a loaded TTL**; OWL2 Primer §4.2 (relations asserted, not conjured).
**Davis:** REVISE/FOR — recover as a **derived `opda:constrainedByScheme`** that lights the already-built dereferenceable page (`ClassDetail.astro:115` renders a "SKOS schemes used" section keyed on `usesSchemes`) **and** the graph incidentally; *determinism caveat:* byte-deterministic for IRI cases; for string cases use a **declared gated convention or scope out**, never `sh:message` parsing (would break `make ci-ontology-graph`).
**Allemang (Queen):** REVISE/FOR — the IRI-grounded derived edge is the simplest faithful win, and it pays double because it fills the empty `usesSchemes` slot the `/pdtf` page already renders. Reuse over re-engineering; the string-enum binding is a modelling change, out of scope here.

**Vote Q1: 8–0–0** REVISE (recover **`opda:constrainedByScheme`**, IRI-grounded case-B only, as a derived dashed view edge; REJECT string-derived edges; REFER the emitter change upstream). DA WITHDRAWN under guardrails.

## Question 2 — Is the disconnection honest, or should the floaters be connected?

**AFFIRM (extractor honest) + REVISE (assert the Relator mediation in source) — 6–0–2 FOR. DA: HELD (guard).**

**Cagle (DA):** AFFIRM the disconnection / AGAINST synthetic edges — *"the disconnection is the model refusing to lie … there is no `roleOf`/`playedBy` object property anywhere in the 30 object properties, so 'surface the relator-mediation edges' has no referent."* **HELD**, with the withdrawal condition that *is* the panel's REVISE: *"I withdraw this HOLD the moment the ontology is ENRICHED with genuine, asserted UFO mediation object properties … until such triples are asserted, the floaters stay unconnected and honest."*
**Guizzardi:** AFFIRM (extractor) + REVISE (ontology)/FOR — verified `opda:roleOf`/`playedBy`/`mediates`/`founds` are declared **nowhere** in source; the orphan is honest (anti-rigid Roles have no monadic edge; no `rdf:type→gUFO` — ODR-0031 never-reasoned red line). But the Relator spine's mediation *is* genuine and **ODR-0006 §Q3 specifies it (diagram + prose + an illustrative `SellerShape`) — none ever emitted**. *"Under-realisation, not over-reification."* (Guizzardi 2005 Ch.4 §4.4.)
**Guarino (OntoClean ruling for the Queen):** AFFIRM + FOR a narrow REVISE — *"this is a genuine ontological relation, NOT over-reification. Mediation is constitutive of a Relator's identity … the model names the mediation three times in prose while asserting it as zero triples. A datatype count (`numberOfSellers`) is a quality of the relator, categorially not the mediation relation."* Distinguished from Q1: *"the test is — does the relation obtain in the world? Mediation obtains; a bare-string `sh:in`→scheme link does not."* Guardrails: Relator-spine only; `sh:minCount 2`; design-time + SHACL-validated, **never reasoned**; assert-first-draw-second. (Welty & Guarino 2001 §3; Guarino & Welty 2009.)
**Hendler:** AFFIRM/FOR — honest open-world (OWL2 Primer §2); `ufoCategory` is an annotation with "no formal meaning" (§8.1); the fix is to **assert** the mediation (a WG completeness task), not fabricate it.
**Davis:** AFFIRM/FOR — no data/TBox changes by the viz; *"a sparse honest graph beats a dense lie"* (ODR-0011 Option-C rejection). The mediation assertion is a modelling proposal, not viz.
**Allemang (Queen):** AFFIRM honest + FOR the assert-mediation REVISE — the Relator spine is load-bearing and the relation is true; asserting it is good modelling, not gold-plating. Never let the extractor infer it.
**Knublauch, Isaac:** **ABSTAIN** (explicitly outside their SHACL/SKOS seats; recorded per §Session-protocol rule 6).

**Vote Q2: 6–0–2** FOR (AFFIRM the orphan disconnection as honest — no synthetic/`gUFO`/subclass edges; REVISE = a modelling proposal to assert `opda:mediates`/`founds` on the Relator spine). **Primary evidence (Guarino/Guizzardi, corpus-verified):** the merged TTL *names* the mediation three times in prose while asserting it as **zero triples** — `opda-merged.ttl:4437` (Relator comment: Transaction "founds" Seller/Buyer; Proprietorship "binds" Proprietor Roles), `:4438` (cites Guizzardi 2005 §4.4 "mediates two or more bearers"), `numberOfSellers:1398` ("the owner-set the Proprietorship Relator mediates"); ODR-0006 §Q3 corroborates. **Keystone:** *counting relata ≠ relating to them* — `numberOfSellers` is a quality of the relator (how many), categorially not the mediation relation, so ODR-0031 Rule 5's "already realised as class topology" warrant has dissolved. **Five co-signed guardrails for the operator's proposal:** (1) the relation genuinely holds (assert = write-down, not invent — the categorical line vs Q1's `sh:in`, which does *not* hold); (2) Relator spine only, no general `roleOf`; (3) `sh:minCount 2`; (4) design-time + SHACL-validated, **never reasoned** (ODR-0029/0031); (5) `mediates` categorially distinct from `subClassOf` (so it connects orphans without rigid-subsumes-anti-rigid). Assert-first-draw-second; the extractor never synthesises `mediates` from prose. 2 ABSTAIN (Knublauch, Isaac — out of seat). DA HELD as a guard against extractor-inferred edges.

## Question 3 — Layer separation vs one unified canvas?

**REVISE → separate by register — 8–0–0 FOR. DA: HELD (proponent of the stronger horn).**

**Cagle (DA):** REVISE/FOR — *"the conflation IS the error; the fix is separation, not richer unification … a controlled vocabulary's natural instrument is a tree/sunburst, an OWL T-Box's is a class diagram."* **HELD** as proponent — re-open trigger: *"if the adopted design keeps the unified force-directed canvas as the PRIMARY instrument with layer merely a colour/filter … a colour/filter on one canvas does not discharge the layer-conflation finding."* DA duty line: *do not manufacture `skos:broader` to make the tree look less flat — a flat scheme is honestly flat.*
**Isaac:** REVISE→separation/FOR — a node-link graph is the wrong instrument for a SKOS (poly)hierarchy (Europeana/EuroVoc/AGROVOC/GEMET; SKOS Play! ships tree+sunburst); SKOS concepts ≠ OWL classes (SKOS §3.5.1). **Precondition:** fix the dropped `skos:topConceptOf` roots (S7/S8) or a tree has no roots to draw.
**Hendler (locked spine):** REVISE/FOR — `layer` ∈ {owl,skos,shacl,external} as a first-class facet; OWL T-Box **default**; SKOS its **own** instrument; SHACL as badges; only inter-stratum edges are the 2 IRI bridges; gUFO a facet, never a node; the all-layers canvas survives only as a labelled "everything, unlayered" diagnostic tab.
**Guarino:** REVISE/FOR (strong horn — moved by Hendler) — *"the SKOS Reference itself refuses to identify the strata: §3.5.1 … §1.3 'SKOS is not a formal knowledge representation language'"* (web-verified); a force-directed layout *misrepresents* a `broader` poly-hierarchy.
**Guizzardi:** AFFIRM separation/FOR — three registers; a flat canvas *"buries the 40 categorial entities under the value mass — backwards."*
**Knublauch:** AFFIRM separation/FOR — SHACL is a meta-layer *about* the data graph (SHACL §2); must not co-plot with OWL+SKOS.
**Davis:** REVISE/FOR **cheaply** — the layers are **already separated as published typed indexes** (`/ontology/classes`, `/vocabularies`, `/shapes`, `/datatypes`); add a `layer` node facet + cross-link to them; **0 `broader` confirms a flat typed index is right and already ships** — no bespoke per-layer viz machinery.
**Allemang (Queen):** REVISE/FOR — layer-by-register, leaning on the deployed typed indexes; build the `layer` facet and demote the union canvas to a diagnostic tab; don't over-build a sunburst the site can serve as a list.

**Vote Q3: 8–0–0** REVISE (an `opda:layer` facet {owl,skos,shacl,external}; OWL T-Box as default; SKOS lifted to its **own instrument — the existing flat `/ontology/vocabularies` index**, since all 49 schemes are verified **depth-1 (0 `broader`/`narrower`/`broaderTransitive` edges)**, so a bespoke tree/sunburst is over-engineering (Isaac↔Davis convergence); SHACL as badges; gUFO a facet not a node; the 2 IRI bridges the only default cross-stratum edges; the unified canvas demoted to a diagnostic tab; **precondition: fix the `topConceptOf` drop** — ≥22 asserted `topConceptOf` (Hendler counts 66 in a wider scope), **0 of 49 schemes carry roots** in the committed model). DA HELD against the "layer-as-mere-colour-on-one-canvas" backslide.

## Question 4 — "Too few entities" / surface the 225 props + 325 shapes?

**AFFIRM 40-is-correct-by-doctrine + presentation-only REVISE — 8–0–0 FOR (mechanism abstentions footnoted). DA: HELD (against node-count inflation).**

**Cagle (DA):** REJECT the "promote the mass to nodes" framing / AGAINST node promotion — *"'40 classes is too few' reads a deliberate modelling outcome as a deficiency … a datatype property is a column, not a node."* **HELD** — re-open only on a demonstrated consumer need a badge/panel cannot serve; opposes any node-count inflation. Bounded concession: on-node badges + expandable attribute panel are fine (attributes *as* attributes).
**Guizzardi:** AFFIRM by-doctrine + REVISE (presentation)/FOR — *"40 is the count a disciplined model should have"*; subclass-per-value is the OntoUML atomic-class-collapse anti-pattern (Sales & Guizzardi; ODR-0027 §R1, ODR-0011 §8a).
**Guarino:** AFFIRM/FOR the inheres-in constraint, **ABSTAIN on mechanism** — datatype properties are qualities that inhere in their bearer, never peer nodes; badge-on-graph + UML-attribute-compartment-on-detail both satisfy this (mechanism is an HCI call).
**Knublauch:** REVISE/FOR badges, AGAINST nodes — a constraint qualifies a focus node, not a peer subject (SHACL §1.4).
**Hendler:** AFFIRM + presentation REVISE/FOR — count badges + attribute list on the detail page + the existing `hasShape` decoration; promoting coded values manufactures spurious universals (SKOS §3.5.1).
**Isaac:** AFFIRM (SKOS slice)/FOR — the 323 concepts are correctly **not** subclasses; thinness is partly the doctrine working; **ABSTAIN** on whether datatype-props/shapes specifically surface as nodes/badges.
**Davis:** AFFIRM/FOR — communication problem, not a defect; the mass is already published at `/datatypes`, `/shapes`, per-term `/pdtf`; cheapest fix = honest caption + links; keep the `hasShape` badge.
**Allemang (Queen):** AFFIRM/FOR — the model is good; the page should *say* why 40 is right and where the mass lives. Presentational fix, zero re-modelling.

**Vote Q4: 8–0–0** FOR (40 is correct-by-doctrine; keep the 225 datatype properties + 325 shapes + 323 concepts **off** the relational graph; remedy is presentational — count badges on class nodes + the existing attribute compartment / detail page + `hasShape` decoration + an honest by-doctrine caption). Footnote: Guarino ABSTAINs on the badge-vs-compartment mechanism (FOR the inheres-in constraint); Isaac ABSTAINs on datatype-property/shape surfacing specifically. DA HELD against node-count inflation.

## Synthesis (Queen — Allemang)

The operator's three observations are **all correct as observations**, and the council's resolution is sharp: **two are presentation/extractor problems with cheap, faithful fixes; one is a real but bounded modelling gap; and the "thinness" is the doctrine working.** The unifying principle the whole bench converged on — and the DA's attack forged — is **assert-first, draw-second**: the viz and extractor may *recover and report* what the corpus asserts, but must never *synthesise* relations the ontology does not hold.

**On #1 (disconnection) and the bridge (Q1).** The two islands never touch because the class↔vocabulary binding is real but **under-asserted**: it lives in SHACL `sh:in` + property-comment doctrine, not in RDF relations. The faithful, deterministic, in-scope fix is narrow — derive **`opda:constrainedByScheme`** (Knublauch's name; Guizzardi's correction of "uses") for the **2 IRI-grounded cases** via the `sh:in`-member → `skos:inScheme` → scheme join, rendered as a **distinct dashed, separately-legended, uncounted, never-asserted** view edge. The ~21 string-literal enums draw **nothing** — their scheme-governance is a per-class "constrained-by" panel, not an edge (Guarino), and making them machine-readable is an **emitter change referred to a modelling council** (the DA's WITHDRAWAL rests on exactly this line). Crucially (Davis, Queen-verified): the same one-line extractor fix that fills `usesSchemes` (broken by the `rdfs:range`-only derivation) **lights up the already-deployed `/pdtf` "SKOS schemes used" section** — so the highest-leverage change serves the *dereferenceable page* (the primary linked-data resource) and the graph only incidentally.

**On the floaters (Q2).** The disconnection is **honest and must stay** — there is no `roleOf`/`playedBy` triple to draw, and `ufoCategory` is a string facet, not an `rdf:type` edge; faking either is the fabrication the DA and both foundational voices reject outright. The **one real gap** is that the Relator spine's existential **mediation is constitutive but unwritten** — Guarino's OntoClean ruling is decisive: *mediation obtains in the world* (it is what makes a class a Relator), `numberOfSellers` is a count not the relation, and **ODR-0006 §Q3 already specifies `founds`/`playedBy` and the artefact never emitted them**. The fix is to **assert** `opda:mediates`/`founds` on the Relator spine (design-time, `sh:minCount 2`, SHACL-validated, never reasoned) — a **modelling proposal**, not this council's to ship; once asserted, the orphan Roles connect *the way UFO says they connect — through their Relator*, and the DA's HOLD self-withdraws.

**On conflation (#3 / Q3).** The single untyped canvas is a genuine **register confusion** — the SKOS Reference itself declines to identify `skos:Concept` with `owl:Class` (§3.5.1, §1.3, web-verified). The fix is **separation by register, not richer unification**: a first-class `opda:layer` facet {owl,skos,shacl,external}; **OWL T-Box as the default** instrument; **SKOS lifted to its own instrument — the existing flat `/ontology/vocabularies` index** (the panel sharpened this from "tree/sunburst" to a flat index on verifying **every one of the 49 schemes is depth-1 — 0 hierarchy edges** — so a bespoke sunburst would be over-engineering); **SHACL as badges**; gUFO a facet, never a node; the 2 IRI bridges the only honest cross-stratum edges on the default; the all-layers force graph demoted to a labelled diagnostic tab. **Precondition:** the extractor must stop dropping the `skos:topConceptOf` roots — **0 of 49 schemes carry roots** in the committed model (the inverse `hasTopConcept` is queried; the asserted `topConceptOf`, S7/S8, is not) — a flat index/tree cannot render roots a model discarded. The DA's HELD dissent is the implementation guardrail: *layer-as-mere-colour on one canvas does not discharge the finding.*

**On thinness (#2 / Q4).** "40 classes" is **correct-by-doctrine** — coded discriminators are SKOS values, not subclasses (ODR-0027 §R1, ODR-0011 §8a, session-036); a class-per-code model would be the atomic-class-collapse anti-pattern. The 225 datatype properties (qualities that inhere in their bearer), 325 shapes (constraints), and 323 concepts (values) are **correctly not graph nodes**; they are already published at `/datatypes`, `/shapes`, `/vocabularies`, and per-term `/pdtf`. The remedy is **presentational**: count badges on class nodes + the existing attribute compartment/detail page + the `hasShape` decoration + an honest caption stating *why* 40 is right and *where* the mass lives. No re-modelling.

**Net footprint the council endorses** (all extractor changes stay pure byte-deterministic transforms inside `make ci-ontology-graph`; nothing ships without the operator):

1. **Model-extractor fixes (independent, do regardless):** (a) materialise `skos:topConceptOf` (the inverse of `hasTopConcept`, S7/S8) — recovers 22 dropped roots; (b) derive `usesSchemes`/`constrainedByScheme` from the IRI `sh:in`→`skos:inScheme` join, not `rdfs:range` — fills the empty `/pdtf` section.
2. **Graph-extractor + view (Q1/Q3):** the 2 IRI `constrainedByScheme` derived edges under guardrails 1–4; an `opda:layer` facet; OWL default; SKOS to its own instrument/index; SHACL badges; union canvas → diagnostic tab.
3. **Page (Q4):** count badges + honest by-doctrine caption + cross-links to the typed indexes.
4. **Modelling proposal (Q2, REFERRED):** assert `opda:mediates`/`founds` on the Relator spine (ODR-0006 §Q3) — operator/modelling-council decision, never the viz.

**Citations** were Queen-verified; section numbers tightened where panellists were loose (`sh:in` §4.8.3 not §4.6.1; `topConceptOf` S7/S8 not §8.x). One Queen error was caught and retracted (the "8 `exactMatch` triples" mis-grep — there are 0 asserted; Isaac was right). No position rested on an unverifiable citation; no abstention was padded (Knublauch/Isaac abstained out-of-seat on Q2 explicitly).

**Status:** proposed. The operator ratifies adoption. Held-as-live DA dissents (Q2/Q3/Q4) carry named re-open triggers and are recorded below and must be carried into any produced ODR's §Held dissent.

## Tally appendix

| Voice | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| Allemang (Queen) | FOR | FOR | FOR | FOR |
| Guizzardi | FOR | FOR | FOR | FOR |
| Guarino | FOR | FOR | FOR | FOR¹ |
| Knublauch | FOR | ABSTAIN² | FOR | FOR |
| Isaac | FOR | ABSTAIN² | FOR | FOR³ |
| Hendler | FOR | FOR | FOR | FOR |
| Davis | FOR | FOR | FOR | FOR |
| Cagle (DA) | FOR⁴ | FOR⁵ | FOR⁶ | FOR⁷ |
| **Tally** | **8–0–0** | **6–0–2** | **8–0–0** | **8–0–0** |

¹ Guarino: FOR the inheres-in constraint; ABSTAIN on the badge-vs-UML-compartment *mechanism*.
² Knublauch, Isaac: explicit out-of-seat abstention on Q2 (UFO/identity, not SHACL/SKOS).
³ Isaac: FOR the doctrine verdict; ABSTAIN on whether datatype-properties/shapes specifically surface.
⁴ Cagle Q1: ballot FOR the narrow IRI-derived view (his fallback = the verdict); disposition WITHDRAWN.
⁵ Cagle Q2: ballot FOR the AFFIRM-honest verdict; HELD as a guard (re-open if edges are inferred not asserted).
⁶ Cagle Q3: ballot FOR separation (he is its proponent); HELD against the colour-on-one-canvas backslide.
⁷ Cagle Q4: ballot FOR keeping the mass off the graph; HELD against node-count inflation.

### DA scorecard (Kurt Cagle)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** | Won over by the *derived-not-asserted* construction (SHACL co-editor Knublauch's case-B + the Queen's "draws-values-from view, not a TBox triple"). **Re-open trigger:** any string-`sh:in`/`sh:message`-derived edge; OR the derived edge rendered/counted as an asserted `owl:ObjectProperty` (no distinct dashed styling, own legend, exclusion from the object-property count); OR `opda:constrainedByScheme` minted as a TBox `owl:ObjectProperty`; OR the derivation reads anything but the deterministic `sh:in`-IRI → `skos:inScheme` → scheme join. |
| Q2 | **HELD** (guard, same direction) | Principled: an extractor draws only relations that hold; no derived role/gUFO edges. **Re-open/withdraw trigger:** withdraws the moment genuine `opda:mediates`/`founds`/`roleOf` UFO object properties are **asserted in the corpus** — then drawing them is faithful. Until asserted, floaters stay honest. |
| Q3 | **HELD** (proponent of the stronger horn) | **Re-open trigger:** if the adopted design keeps the unified force-directed canvas as the PRIMARY instrument with `layer` merely a colour/filter, rather than giving SKOS its own tree/index and OWL its own class view. Also: do not manufacture `skos:broader` to dress up a flat scheme. |
| Q4 | **HELD** (against inflation) | **Re-open trigger:** withdraws only on a demonstrated consumer need a badge/panel cannot serve; opposes promoting datatype-properties/shapes/concepts to first-class nodes to make the graph "look less thin." |

**Held-as-live dissent (carry into any produced ODR §Held dissent):**
- **Q2:** *No Q2 outcome may surface derived/inferred role or gUFO-category edges; the mediation must be asserted in source first.* Re-open trigger: assertion of the Relator-spine mediation properties.
- **Q3:** *A colour/filter on one canvas does not discharge the layer-conflation finding.* Re-open trigger: union canvas kept primary with layer as mere styling.
- **Q4:** *Datatype properties / shapes / concepts must not become first-class graph nodes.* Re-open trigger: node-count inflation.
- **Recorded caveat (not a blocker):** the `currency`/`peril` object properties' `rdfs:range` points at a bare generic `skos:Concept`, not the scheme — an emitter under-specification the derived join routes around but does not fix; flagged for a modelling council.

### Per-question count

Q1 **8–0–0** · Q2 **6–0–2** · Q3 **8–0–0** · Q4 **8–0–0**. Lowest FOR count: Q2 (6, with 2 explicit out-of-seat abstentions — above the comfort threshold; no AGAINST on any question). Unusually clean convergence: the DA's attack hardened the guardrails rather than splitting the vote.

## Discussion transcript

Full verbatim deliberation (openings → every cross-talk DM mirrored → finals) is preserved, committed (not scratch), under `docs/ontology/odr/council/working/session-045/`: `cagle-da.md`, `guizzardi.md`, `guarino.md`, `knublauch.md`, `isaac.md`, `hendler.md`, `davis.md`, plus the shared `EVIDENCE.md`. Notable recorded self-corrections (citation integrity): Guizzardi relocated a `playedBy` claim (ODR-prose-only, not a dangling emitted shape); Isaac verified the `exactMatch`/`topConceptOf` counts; the Queen retracted an erroneous "8 exactMatch triples" correction.

## Disposition routing (Step 5)

- **Q1 + Q3 → produce an ODR proposal** (`status: proposed`, `council: session-045`): the graph-extractor derivation (`opda:constrainedByScheme`, IRI-only, guardrails 1–4) + a per-class **"constrained-by" panel** for the string-enum cases (field→scheme from SHACL structure, not an edge) + the `opda:layer` view dimension with SKOS routed to the **existing flat `/ontology/vocabularies` index** (no bespoke sunburst) + the two model-extractor bug-fixes (`topConceptOf`, `usesSchemes`).
- **Q2 → REFER** a Relator-spine modelling proposal (assert `opda:mediates`/`founds`; ODR-0006 §Q3 lineage; the 5 guardrails above) — operator/modelling-council decision.
- **Referred to a modelling council (out of scope here):** (a) promoting the string-enum `sh:in` binding to an asserted triple (concept-IRI `sh:in`, or an explicit `opda:constrainedByScheme` annotation property) so case (A) joins by the case-(B) rule; (b) the `currency`/`peril` `rdfs:range` under-specification — **Hendler's OWL caution:** do **not** assert `rdfs:range CurrencyScheme` (a scheme is a `skos:inScheme` aggregation, not a class of `rdf:type` instances); keep `range skos:Concept` + SHACL scoping (plausibly the intended design), or define a scheme-typed `Concept` subclass.
- **Q4 → presentation change** (badges/caption/links) under the same ODR or a page-level note; no model change.
- **Held dissent + re-open triggers** recorded above; copy into the produced ODR's §Held dissent / §Alternatives.
- **Operator handoff:** all proposed; nothing ships from this council. The two extractor bug-fixes are the cheapest, lowest-risk, highest-leverage start.
