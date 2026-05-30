# Session 022 — Dean Allemang

*Lens: pragmatic / idiomatic-minimal / derive-don't-declare / model-the-data-you-have. Grounding per ODR-0001: Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist*, 3rd ed. (Morgan Kaufmann 2020) — esp. Ch. 3 (RDF is data, not schema-first), Ch. 10 (counting, sets, SHACL as the shape/validation layer distinct from the OWL inference layer), Ch. 13 (good vs bad modelling: single source of truth, "don't model what you can't populate", prefer the standard predicate to a bespoke one). I co-authored SHACL-AF (`sh:rule` / `sh:SPARQLRule`); a **derived relation is a rule, not stored data** is my own published position, not a borrowed one.*

> The architect's complaint — "S021 invented and over-engineered" — is my instinct stated by someone else. I will not reflexively side with it; in S021 I myself accepted the generated-from-provenance home (the un-gating carried 6–3 over my minimal reading). But the architect has narrowed the target since S021, and on the narrowed target the architect is **substantially right**. My job here is to say *exactly which* part is over-engineered and *exactly which* standard predicate replaces it — and to defend the part that is not (the SKOS scheme; the derivation rule).

---

## Verified facts I am reasoning from (read in this session, not assumed)

These four facts decide my votes. I checked the corpus, not my memory.

1. **`dct:source` is already pervasive and already carries originating-provenance.** `opda-property.ttl` carries 33 `dct:source`; `opda-claim.ttl` 14; `opda-agent.ttl` 12; `opda-vocabularies.ttl` 138. Every minted term already has a `dct:source` anchor (today pointing at the ODR section that minted it, e.g. `dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1>`; the descriptive walk will point each leaf at its form-question IRI). **Origin-provenance is not a gap — it is already emitted on essentially every term.**
2. **`rdfs:isDefinedBy` is used ZERO times in the entire emitted ontology.** Not once across 23 TTL files. The single standard RDFS predicate for *"which vocabulary/resource defines this term"* — the textbook vocabulary-of-origin handle (SWWO 3e Ch. 13; RDF Schema §5.4.1) — is sitting **completely unused**. The architect's Q3 claim that `definedInContext` "reinvents `rdfs:isDefinedBy`" is therefore not rhetoric; the convention exists, is standard, and OPDA has simply not reached for it.
3. **`definedInContext`, `servesContext`, `consumesFrom`, `overlaysContext` are emitted ZERO times.** The entire bounded-context apparatus is on paper (ODR-0019/0020 + ADR-0026/0028/0029); **nothing is built**. Dropping or demoting a predicate here costs *zero* migration — there is no instance data, no consumer, no emitted triple to break. This is the cheapest possible moment to cut.
4. **`opda:requires` today targets seven *classes*, not leaf properties** (`profiles.py:244–249`), and `opda:overlaysContext` points at a profile-LAYER IRI (`…/profiles/foundation`, `profiles.py:250`), not an industry context. So the existing `ValidationContext`+`requires`+`overlaysContext` triple is real, ratified (S010 12–0), and *works as a profile reification* — but as a **membership source** it is currently class-grain and mis-targeted. Both halves of the architect's worry have a factual footing.

My governing rule for this session: **the simplest thing that is also conventional.** Where a W3C-standard predicate already says what a bespoke predicate would say, the standard wins (SWWO 3e Ch. 13: "every term you mint is a term you must govern, document, and defend to a stranger — mint none you can borrow"). Where a relation is computable from data the term already carries, it is a **rule**, not a stored fact (my SHACL-AF position).

---

## Q1 — Form ↔ base association

**Stance.** A SHACL profile *is* first-class RDF — the architect is correct on that, and it is exactly the Knublauch/Cagle position ratified at S010. But "first-class RDF" does **not** mean "invent a vocabulary for it." The idiomatic-minimal representation of *"this profile constrains that base"* has two standard layers, and OPDA already sits on the lower one:

- **Targeting (the SHACL-native association).** A profile shape associates with the base by `sh:targetClass` / `sh:targetNode` / `sh:targetObjectsOf` (SHACL §2.1). *That* is how a SHACL graph says "I constrain `opda:Property`." It is standard, it is what `profiles.py` already emits, and it needs no `opda:` predicate at all. SWWO 3e Ch. 10: the shapes layer targets the class layer; the link is the target declaration, not a new relation.
- **Profile-as-resource (the catalogue layer).** "BASPI5 is a profile *of* the PDTF base; here is its base, its role-played resources (shapes graph, form), its guidance" is exactly what **W3C PROF** (the Profiles Vocabulary, W3C Rec 2019) was standardised to say: `prof:Profile`, `prof:isProfileOf`, `prof:hasResource` / `prof:ResourceDescriptor` / `prof:hasRole`. DCAT-AP / DCAT Application Profiles use this pattern. If OPDA wants a first-class "profile" object beyond the bare shapes, **PROF is the convention**, not a bespoke type.

On `opda:ValidationContext` itself: I do **not** move to drop it. It earned its keep at S010 for a specific, non-cosmetic reason — Guarino's "no fixed model theory" objection. A bare `sh:minCount 1` floating in a graph is "required (depending on which files the build loaded)"; reifying it as a constraint *of a named context* gives it a truth-maker. That is a real modelling job a standard predicate did not cover in 2020 (PROF describes a profile-as-document; it does not reify "required relative to this validation context" as a constraint truth-bearer). So `ValidationContext` is **not** over-engineering — it is the minimum that answered a real objection. **But it is a profile-reification node; it must not be reused as a membership authority** (that is Q3).

**The architect's specific Q1 charge — "used-by is redundant with `overlaysContext`+`requires`, a rule not stored" — is CORRECT and is already conceded in the design.** ODR-0020 Rule 5 derives `servesContext` by a `CONSTRUCT` over `overlaysContext`+`requires`; ADR-0026 work-item 4 ships it as a rule, not a stored triple; the F3 CI guard forbids any hand-authored `servesContext` in source TTL. So on Q1 there is **no live dispute**: usage-association *is* a rule. My only correction is to name the standard for the profile-*object* layer (PROF) so OPDA does not grow a bespoke `opda:profileLayer`/`opda:overlaysContext` family where `prof:isProfileOf` + `sh:targetClass` already suffice.

**Vote Q1: FOR** keeping `opda:ValidationContext` (S010 12–0 stands; it answers Guarino's truth-maker objection that no standard predicate covers). **FOR** the architect's point that form↔base *association* is targeting (`sh:targetClass`) + a derivation rule, not a stored "used-by" predicate. **Named convention:** SHACL targeting (W3C SHACL §2.1) for the constrain-link; **W3C PROF** (`prof:isProfileOf`, `prof:hasResource`) for the profile-as-resource layer if a first-class profile object is wanted; reserve `opda:overlaysContext` for the one thing PROF/SHACL do not give — pointing a `ValidationContext` at its *industry context concept* (Q3).

---

## Q2 — Metadata on a SHACL / profile definition

**Stance.** A shape is a node; a node takes annotations like any other resource — this is trivially true and needs **no bespoke vocabulary at all**. The minimal idiomatic metadata set, in priority order:

| Need | Standard predicate | Source |
|---|---|---|
| Human label / definition of the profile or shape | `rdfs:label`, `skos:definition` / `rdfs:comment`, `dct:title`, `dct:description` | RDFS, SKOS, DCTERMS |
| Where this shape/leaf came from (form question, ODR) | **`dct:source`** (already emitted) | DCTERMS |
| Which vocabulary/resource *defines* this term | **`rdfs:isDefinedBy`** (currently unused — should be the home handle, see Q3) | RDF Schema §5.4.1 |
| Who minted it / when / activity | `prov:wasAttributedTo`, `prov:wasGeneratedBy`, `dct:created` | PROV-O, DCTERMS |
| Profile role / base / constituent resources | `prof:isProfileOf`, `prof:hasRole`, `prof:hasResource` | W3C PROF |
| Severity, target, UI | `sh:severity`, `sh:targetClass`, `dash:*` | SHACL, DASH (already emitted) |

**What counts as gold-plating** (SWWO 3e Ch. 13 — "don't model what you can't populate, and don't mint what you can borrow"): a *new* `opda:` annotation property whose meaning is already covered by `dct:`/`prov:`/`rdfs:`/`prof:`. Concretely: `opda:definedInContext` (Q3 — covered by `dct:source` + `rdfs:isDefinedBy`); any `opda:profileLayer`/`opda:profileMetadata` family (covered by PROF); any `opda:hasSteward` *where `dct:publisher`/`prov:wasAttributedTo` would serve* — though I note `opda:hasSteward` is already minted and reused (ODR-0011 house style), so that ship has sailed and re-litigating it is *itself* churn; I leave it.

**Minimal rule:** a shape carries `dct:title`/`dct:description` (or `skos:definition`), `dct:source`, `sh:severity`/`sh:target*`, and `dash:*` for UI. Provenance of *minting* is `prov:`/`dct:created`. **Nothing bespoke.** The shapes graph stays a clean SHACL+DASH+DCT+PROV graph a stranger's SHACL processor reads without surprise — which is the S010 graph-purity commitment (advisory `opda:aiHint` was already exiled to a separate graph for exactly this reason; do not now re-pollute with `opda:`-metadata that DCT/PROF cover).

**Vote Q2: FOR** a metadata set drawn entirely from `dct:` + `prov:` + `rdfs:` + `prof:` + `sh:`/`dash:`. **AGAINST** any new `opda:` metadata predicate whose sense a standard already carries. **Named convention:** DCTERMS (Dublin Core) + PROV-O + W3C PROF + RDFS — the "describe a resource with the smallest sufficient standard vocabulary" discipline (SWWO 3e Ch. 13).

---

## Q3 — "Which context a term belongs to" (the sharp adjudication)

This question has two predicates and they get **opposite verdicts**. I will be blunt because the brief asks me to be.

### `opda:servesContext` (usage) — CORRECT as a rule. KEEP it, as a rule, never stored.

Yes. A term's *usage* across contexts — "which communities of practice ask for this leaf" — is **read off the profiles**: `?vc opda:overlaysContext ?ctx ; opda:requires ?term`. That is precisely a derived relation, and a derived relation is a **`sh:rule` / SPARQL `CONSTRUCT`**, not a hand-authored triple. This is my own SHACL-AF position (SWWO 3e Ch. 10–11; SHACL-AF §1 `sh:SPARQLRule`). The design already has this right: ODR-0020 Rule 5's CONSTRUCT, ADR-0026 work-item 4 dormant rule, the F3 "no hand-authored `servesContext` in source" CI guard. **No change.** The only precondition is the term-grain `requires` fix (ADR-0028 work-item 3) — until `requires` targets leaves not just seven classes, the rule yields coarse class-grain usage. That is a *plumbing* fix, not a modelling change. `servesContext`-as-rule: **YES, correct, retain.**

### `opda:definedInContext` (home) — REINVENTS provenance. DROP it as a stored authored predicate.

The architect is right, and I will give the argument the design's own machinery cannot dodge:

1. **It is generated from `dct:source`.** ADR-0028 work-item 4 and ADR-0026 amendment 1 both state `definedInContext` is "**generated from each term's `dct:source` provenance**." A fact mechanically generated from `dct:source` is **a view of `dct:source`** — by construction. By my own derive-don't-declare rule (the one I deployed in S021), *a relation computed from data the term already carries is a rule, not a stored fact.* The design applied that rule to `servesContext` and then **failed to apply it to `definedInContext`** — it derived `servesContext` but *materialised* `definedInContext`. That is the inconsistency at the heart of the over-engineering charge. Either both are rules, or the design has a double standard.

2. **The home it records is exactly what two standard predicates already say.** "Which context/vocabulary *defines* (is the home of) this term" is `rdfs:isDefinedBy` (RDF Schema §5.4.1 — the *definitional-origin* predicate). "Which source the term came from" is `dct:source` (already emitted on every term). The home-pass's mechanical default — *single-source → that overlay's industry context; multi-source/`propertyPack`-level → foundation/shared-kernel* — is a **function of `dct:source`**. So:
   - the *home concept* is reachable as `rdfs:isDefinedBy` → the context `skos:Concept` (or the module), and
   - the *evidence for that home* is the `dct:source` the term already carries.
   `opda:definedInContext` adds **a third predicate that says what those two already say**, and is *populated from one of them*. That is the textbook bespoke-predicate-for-a-standard-relation antipattern (SWWO 3e Ch. 13).

3. **The S021 "home vs usage are different relations" argument survives — but it argues for `rdfs:isDefinedBy`, not for a bespoke predicate.** Guizzardi/Evans-Vernon were right that *home* (quasi-functional, definitional) and *usage* (anti-rigid, many-valued) are different relations and must not be conflated. I agreed then and agree now. **But that distinction is honoured by using two predicates of the right cardinality — and the right *home* predicate is the standard `rdfs:isDefinedBy` (functional-ish, definitional), not a freshly-minted `opda:definedInContext`.** The S021 synthesis correctly separated the relations; it incorrectly minted a bespoke term for the one a W3C predicate already names. The corpus proves the cost of the miss: `rdfs:isDefinedBy` used **zero** times while a bespoke synonym is specced into three ADRs.

### My Q3 recommendation (concrete)

- **Drop `opda:definedInContext` as a stored, emitted predicate.** It is not built (fact 3) — dropping costs nothing.
- **Record home with the standard predicate**: emit `<term> rdfs:isDefinedBy <contextConcept>` (or the defining module IRI) where a home assertion is genuinely wanted, **generated from `dct:source` in the same home-pass** ADR-0028 already specs — same generator code, standard predicate, zero new vocabulary. The S021 generated-from-provenance mechanism is *retained wholesale*; only the predicate IRI changes from `opda:definedInContext` to `rdfs:isDefinedBy`.
- **Keep `dct:source`** as the per-term provenance evidence (already emitted; it is the *basis* of the home computation and the audit trail).
- If the WG judges that `rdfs:isDefinedBy → a skos:Concept` is a semantic stretch (isDefinedBy classically points at a *vocabulary/ontology document*, not a SKOS context concept — a fair objection): then the home is simply **not stored at all** and is a **query over `dct:source`** (a `CONSTRUCT`/SPARQL view, exactly like `servesContext`). Either way the bespoke predicate goes. My order of preference: (a) `rdfs:isDefinedBy` to the module/context if the WG accepts the target; (b) a derived view over `dct:source` if it does not. **(c) a bespoke stored `opda:definedInContext` is the option I am voting against.**

**Vote Q3: `servesContext`-as-rule — FOR (correct, retain).** **`definedInContext` as a stored authored predicate — AGAINST (drop; it reinvents `rdfs:isDefinedBy` + `dct:source` and is itself generated from `dct:source`).** **Named convention:** `rdfs:isDefinedBy` (RDF Schema §5.4.1, vocabulary/definition-of-origin) + `dct:source` (DCTERMS provenance), with usage derived by SHACL-AF `sh:SPARQLRule`. This is the "don't mint what you can borrow / derive what you can compute" discipline (SWWO 3e Ch. 13 + my SHACL-AF authorship).

---

## Q4 — Over-engineering verdict + minimal idiomatic design

**Verdict: PARTIALLY over-engineered. One bespoke predicate must be dropped; the SKOS scheme and the derivation rule are sound and idiomatic. The verdict is surgical, not a teardown.**

I separate the three artefacts the architect lumped together, because conflating them is itself an error:

### (1) The bespoke `opda:BoundedContextScheme` (SKOS, 6 concepts) — NOT over-engineering. KEEP.

A controlled, authored list of six bounded contexts, each a `skos:Concept` in one `skos:ConceptScheme`, is the **most conventional possible** way to represent a small enumerated set of perspectival categories (SWWO 3e Ch. 9 — SKOS is the standard for exactly this; OPDA already runs 23 value-schemes in this house style). It is **authored reference data**, not derived, and rightly so — the six contexts are a deliberate editorial fact about the UK PDTF landscape, not something computable from any artifact. "Bespoke" here only means "OPDA-minted instances of a standard vocabulary," which is what every concept scheme on earth is. **This is not the over-engineering; it is the load-bearing standard part.** Davis (DA / over-engineering ally) and I should not let the SKOS scheme get swept out with the bathwater — it is the one thing here that is unambiguously right.

### (2) `opda:servesContext` — NOT over-engineering, *as a rule*. KEEP as a rule.

Covered in Q3. A derived view via SHACL-AF. Idiomatic. The only failure mode would be *storing* it (forbidden by F3) or *hand-authoring* it (forbidden by ODR-0019/0020). As specced, fine.

### (3) `opda:definedInContext` — THIS is the over-engineering. DROP (→ `rdfs:isDefinedBy` / `dct:source`).

Covered in Q3. A bespoke stored predicate that (a) duplicates `rdfs:isDefinedBy`, (b) duplicates the `dct:source` it is generated from, and (c) is materialised when its sibling `servesContext` is (correctly) derived — an internal inconsistency. This single predicate is the legitimate core of the architect's "invented / over-engineered" complaint.

### The minimal idiomatic design, stated plainly

> **Keep** the `skos:ConceptScheme` of six contexts (authored reference data — standard SKOS).
> **Keep** `opda:overlaysContext` as the *one* small bespoke predicate that points a `ValidationContext` at its industry context concept (PROF/SHACL do not give this exact link; it earns its keep) — and **fix it** to target the context concept, not the profile-layer IRI (ADR-0028/ODR-0020 Rule 6 plumbing).
> **Keep** `opda:consumesFrom` for upstream authorities → `opda:Organisation` (this is the DDD Conformist link to an *agent*; `dct:source`/`prov:wasAttributedTo` give provenance but not the "we conform to this organisation's model" relationship — it earns its keep, and ODR-0020 Rule 2 is right that an upstream authority is an Organisation, not a context).
> **Derive** usage (`servesContext`) by a SHACL-AF `CONSTRUCT` over `overlaysContext`+`requires` — never stored.
> **Record** home with **`rdfs:isDefinedBy`** (→ context concept or defining module), generated from `dct:source` in the existing home-pass — **drop the bespoke `opda:definedInContext`**.
> **Provenance** stays `dct:source` (already emitted, already the home-computation basis).

Net change versus S021/ADR-0026-28: **delete one bespoke predicate (`definedInContext`), substitute the standard `rdfs:isDefinedBy`, keep everything else.** That is the smallest cut that answers the architect without throwing away the genuinely-conventional SKOS scheme or the genuinely-correct derivation rule. It is *not* "drop the bespoke scheme + lean on namespace alone" (that would lose the authored six-context editorial fact, which is real and not derivable) — so I disagree with the *maximal* reading of the architect's complaint while granting its core.

### Impact on the records

- **ODR-0019**: Rule 5 (`opda:definedInContext`) and Rule 8's S021 carve-out (the un-gated home annotation) **amend** — replace the bespoke predicate with `rdfs:isDefinedBy` (or a `dct:source`-derived view). The *home-vs-usage distinction* and the *generated-from-provenance* mechanism are **retained** (S021 was right on the relation; wrong on the predicate IRI). One-predicate amendment, not a rewrite.
- **ODR-0020**: Rule 4 ownership layer + Rule 5 firewall **amend** to speak of `rdfs:isDefinedBy` (home) / derived `servesContext` (usage); the four-bucket mapping, the firewall F1/F2, the upstream-as-Organisation Rule 2, and the `overlaysContext` Rule 6 fix **all stand**.
- **ADR-0026**: amendment 1 (declaring `definedInContext` authoritative) and work-item 2 (declaring the predicate) **change** — declare *no* `definedInContext`; use `rdfs:isDefinedBy`. The dormant `servesContext` CONSTRUCT (work-item 4), the cross-check shape (amendment 2 — re-aimed at "`servesContext` with no `rdfs:isDefinedBy` backing"), and the total-cover CI (amendment 3 — "every term has `rdfs:isDefinedBy` OR `consumesFrom` OR is on the D2 allow-list") **stand with the predicate renamed**.
- **ADR-0028**: work-item 4 (the home-pass) **keeps its generator logic verbatim** and changes only the emitted predicate (`opda:definedInContext` → `rdfs:isDefinedBy`). The 935-leaf walk, term-grain `requires`, range-restraint, flat-default — **all unaffected.** This is the cleanest possible landing: the most expensive work item (the walk) does not move at all.
- **ADR-0029** (profile rollout): **unaffected** — it emits profiles + per-leaf `requires`, which both stand.

**Vote Q4: PARTIAL over-engineering — FOR dropping `opda:definedInContext` (→ `rdfs:isDefinedBy`/`dct:source`); AGAINST scrapping the SKOS scheme or the derivation rule (both standard and correct).** **Named convention:** SKOS (concept scheme) + RDFS (`rdfs:isDefinedBy` home) + DCTERMS (`dct:source` provenance) + SHACL-AF (`sh:SPARQLRule` derived usage) + W3C PROF (profile-as-resource, Q1). Minimal-sufficient-standard-vocabulary; derive-don't-declare; don't-mint-what-you-can-borrow (SWWO 3e Ch. 13).

---

## Summary table

| Q | Stance | Vote | Named convention |
|---|---|---|---|
| **Q1 Form↔base** | `ValidationContext` earns its keep (Guarino truth-maker); association = targeting + rule, not a stored used-by; use PROF for the profile-object layer | **FOR** (keep VC; FOR architect's "used-by is a rule") | SHACL targeting §2.1; W3C PROF; `opda:overlaysContext` only for VC→context link |
| **Q2 Metadata on a shape** | Minimal set from standard vocabs; no bespoke metadata predicate | **FOR** standard-only; **AGAINST** new `opda:` metadata terms | DCTERMS + PROV-O + PROF + RDFS + SHACL/DASH |
| **Q3 Which context a term belongs to** | `servesContext`-as-rule correct; `definedInContext` reinvents provenance + is generated from `dct:source` — drop it. *Post-evidence (Kendall):* `rdfs:isDefinedBy` → **module** (concern), not context; context-home **fully derived** from `servesContext` degree, stored nowhere | `servesContext` **FOR**; `definedInContext` (stored) **AGAINST**; context-home **DERIVED** | `rdfs:isDefinedBy`→module (concern) + `dct:source` (provenance) + SHACL-AF rule (usage); context-home = `servesContext` degree |
| **Q4 Over-engineering** | Partial: drop one bespoke predicate; keep SKOS scheme + derivation rule. *Post-evidence:* context-home is not a stored fact at all (no authored signal exists — module=concern, dct:source=provenance) | **PARTIAL** — FOR dropping `definedInContext`; AGAINST scrapping scheme/rule | SKOS + RDFS (`isDefinedBy`→module) + DCTERMS + SHACL-AF + PROF |

---

## Cross-talk resolution (post-rebuttal — REFINES Q3/Q4 toward *more* derivation)

Kendall (Queen S019/020) pushed back FOR going further than my opening: delete `definedInContext` **and** the `dct:source`→home generation step, and record home as `rdfs:isDefinedBy → the module the term is emitted into` (the generator knows it at emit time, zero inference). She handed me one stress-test: *is there a real signal in `dct:source`-derived-home that `rdfs:isDefinedBy`-to-module loses?* I answered it from the corpus, not the armchair, and the evidence **refines both our positions**:

**Verified finding 1 — the seven TTL modules are by ONTOLOGICAL CONCERN, not by industry context.** `opda-property` / `opda-agent` / `opda-claim` / `opda-transaction` / `opda-governance` / `opda-descriptive` / `opda-classes` (each `dct:title "OPDA <Concern> Module"`). This is exactly ODR-0019 Rule 1's namespace-by-module-of-*definition*. It is **not** the six industry bounded contexts. So `rdfs:isDefinedBy → module` records the *concern* (Property-ness), which is real, standard, and free — but it does **not** answer "which bounded context owns this term."

**Verified finding 2 — `dct:source` today carries provenance, not context.** Host tally across all module TTLs: 58× `data-dictionary`, then ODR-section anchors (`ODR-0008#Q5a` ×33, `ODR-0005#3b`, …), then external authorities (`saa.gov.uk` ×10, `gov.uk/council-tax` ×9, EPC guidance ×8, OIDC ×4, eIDAS ×4, GDPR ×1). So `dct:source` is **decision-provenance + external-source-provenance**. Mapping `saa.gov.uk` or `ODR-0008#Q5a` → `PropertyDataServicesContext` is a **brittle invented function** — Kendall's "strictly less + a drift-prone mapping" charge against the S021 home-pass is **confirmed by the data**. That generation step *is* the over-modelling.

**The resolution: three orthogonal axes, each named by the predicate that already fits, and context-home FULLY DERIVED.** The corpus shows there is **no reliable non-derived signal for context-home** (module = concern; `dct:source` = provenance; neither is context). Therefore context-home is not a stored fact at all — it is **read off the derived `servesContext` set**:

| Axis | What it answers | Predicate | Status |
|---|---|---|---|
| **Ontological concern** | "what *kind* of thing is this term about" (Property/Claim/Agent…) | `rdfs:isDefinedBy` → the **module** ontology IRI | KEEP — standard, FIBO-idiomatic, emitted **0×** today, free at emit time |
| **Provenance** | "where did this term/decision/fact come from" | `dct:source` (already on every term) | KEEP unchanged |
| **Bounded-context USAGE** | "which communities of practice ask for it" | derived `servesContext` (SHACL-AF `sh:SPARQLRule`) | KEEP as a rule |
| **Bounded-context HOME** | "which context owns it" | **NONE** — `servesContext` degree (1 = single-context home; ≥2 = shared kernel; 0 = kernel/scaffolding) | **DERIVED, stored nowhere** |

**Net (leaner than my opening AND leaner than S021):** delete `opda:definedInContext`; delete the `dct:source`→context-home generation step (the brittle bit); adopt `rdfs:isDefinedBy → module` for the concern axis (genuinely missing, standard, free); keep `dct:source` (provenance) and the derived `servesContext` (usage); **let context-home fall out of `servesContext` degree — no stored home predicate, bespoke or standard.** Every remaining edge is `rdfs:` / `dct:` / a derived rule. The two small bespoke predicates I still hold the line on — `opda:overlaysContext` (ValidationContext→industry context, the rule's *input*) and `opda:consumesFrom` (DDD Conformist→Organisation) — survive because nothing standard covers them and they are the derivation's substrate, not redundant annotations.

**Correction to my opening Q3/Q4:** I originally proposed `rdfs:isDefinedBy → the context concept` as the home substitute. The evidence shows that target is wrong — `rdfs:isDefinedBy` belongs on the **module** (concern), and context-home should be **derived from `servesContext`, not stored**. This is not a reversal; it is my own derive-don't-declare rule applied one notch harder once the data showed no authored signal exists. The total-cover CI (ADR-0026 amendment 3) re-expresses as: every owned term has `rdfs:isDefinedBy` (a module) AND resolves under the `servesContext`/`consumesFrom`/D2-allow-list partition — `definedInContext` drops out of the assertion entirely.

---

## Cross-talk resolution 2 (post-Davis — the PROF concession + the `servesContext` cut)

Davis (DA) answered my opening with the **invention test** and moved me on two further points my first two passes had not fully conceded. I checked `profiles.py:240-254` and the SHACL/PROF convention before agreeing — not just re-stated a prior vote.

**CONCESSION 1 — `opda:ValidationContext` → W3C PROF (I withdraw my Q1 "keep it").** My opening defended `ValidationContext` as earning its keep because it answered Guarino's "no fixed model theory" (S010) by reifying "required *relative to* a named context." On re-examination that defense does **not** require a bespoke *type*. Guarino's objection is satisfied by making the requirement relative to *a named, dereferenceable resource* — and `prof:Profile` **is** that resource, standardised by W3C in 2019. The five `ValidationContext` predicates map to standards: `profileURI` → the `prof:Profile` IRI itself; the form↔base link `overlaysContext` → `prof:isProfileOf`; `sourcedFrom` → `prof:hasResource`[`role:guidance`] / `prov:wasAttributedTo`; `formVersion` → `dct:hasVersion`; and `requires` is *already* the SHACL `sh:minCount 1` shapes (ODR-0010 Rule 1) — the profile need only point at the shapes via `prof:hasResource`[`role:Validation`] + `dct:conformsTo <shacl>`, not re-list them. Davis's killer detail, which I verify as correct: PROF supplies the fixed-model-theory **as a standard axiom** — `dct:conformsTo owl:propertyChainAxiom ( prof:isProfileOf dct:conformsTo )` (conform to the profile ⇒ conform to the base). SHACL itself has **no** native "conditional-on-context" construct; conditionality is the build-step graph-union (which shapes you load), per ODR-0010 — never a predicate. So the truth-maker is the named profile, and PROF is the standard one. **`opda:ValidationContext` → `prof:Profile`; concede.**

**CONCESSION 2 — `opda:servesContext` (the rule) → CUT, not "keep as a rule" (I withdraw my Q3 defense of it).** This is the sharpest correction to my own position, and Davis was right that I was inconsistent. Derive-don't-declare means *don't hand-author what's derivable*; it does **not** mean *materialise and ship every derivable view*. A dormant SHACL-AF CONSTRUCT with **no named consumer**, shipped behind a Rule-8 gate that literally says "don't build until a consumer queries," is **YAGNI-violating dead code**, not a view anyone reads — S021 Q1's "name the consumer" challenge got no answer. The **capability** to ask "which contexts use term X" survives for free as an on-demand SPARQL query over `prof:isProfileOf` + the SHACL shapes, written *when* a consumer needs it. So: **don't ship the dormant rule artifact, the cross-check `sh:Warning` shape, or the F3 firewall** — they exist only to police a predicate with no consumer. `servesContext` as stored triple or shipped dormant rule: **CUT**. As a latent query: free, needs no artifact. (Gandon's precision, which I adopt: the PROF chain axiom does *not* subsume `servesContext` — it infers "payload conforms to base," not "term serves context"; the correct statement is "`servesContext`'s useful half is free via the axiom and the rest has no consumer," not "the axiom replaces it.")

**WHERE I REFINE DAVIS — the SKOS context scheme is NOT the same resource as a `prof:Profile` (one context : many profiles).** Davis floated that "if each context is already a `prof:Profile`, the SKOS concept may be the same resource." **Verified false:** the **Conveyancing** context owns **four** profiles — TA6, TA7, TA10, LPE1 (`/modelling/bounded-contexts`, ODR-0020 Rule 1). A bounded *context* is a community of practice (with a distinct steward — Law Society/SRA/CLC) at a **one-context-to-many-profiles** cardinality; a `prof:Profile` is a single form overlay. They are different resources at different grain and must stay distinct. This is exactly why the **SKOS six-context scheme survives** as authored reference data: it carries the steward + the "what it owns" gloss that no `prof:Profile` and no IRI string encodes, AND — under single-namespace (ODR-0004) — the six context IRIs are the **mandatory targets** for the home relation (OPDA can't read home off the IRI as FIBO does). Arguing the scheme away would argue my own home-relation position away. Davis concedes the same on his three verified facts; we agree.

**THE HOME TARGET, settled across all three exchanges.** `rdfs:isDefinedBy` records the term's **home**, and the corpus shows two legitimate, non-derived targets the generator commits to at mint time: the **module** (ontological concern — `opda-property.ttl` etc.; what the emitter literally writes the term into) and, where a single owning community of practice applies, the **context concept** (the SKOS resource carrying the steward). Both are real `rdfs:isDefinedBy` targets; neither is `dct:source` (provenance) and neither needs the brittle `dct:source`→context synthesis S021 specced. Bounded-context *usage* is a query, not a stored fact.

### Final converged minimal design (joint with Davis; converges with Kendall + Gandon)

| Layer | Convention | Bespoke? |
|---|---|---|
| Form↔base + profile/SHACL metadata (Q1/Q2) | **W3C PROF**: `prof:Profile` ; `prof:isProfileOf <base>` ; `prof:hasResource [ prof:hasRole role:Validation ; prof:hasArtifact <shapes.ttl> ; dct:conformsTo <shacl> ; dct:source <form-q> ; prov:wasAttributedTo <steward> ; dct:hasVersion ]` | **No** — standard |
| Term home / "belongs to" (Q3) | **`rdfs:isDefinedBy`** → the **module** ontology IRI (concern; *always*) ; **`dct:subject`** → the SKOS **context** concept (community-ownership; *only* on the unambiguous single-community subset, absent otherwise) ; **`dct:source`** → authority/origin (already present) | **No** — three standards (Kendall/Gandon three-Rec split) |
| Term usage (Q3/Q4) | **on-demand SPARQL query** over `prof:isProfileOf` + shapes — **not stored, not a shipped rule** | **No** — query |
| Upstream Conformist (Q4) | **`opda:consumesFrom`** (`rdfs:subPropertyOf prov:wasInfluencedBy`) → `opda:Organisation` | **Yes** — the one DDD relationship no standard names |
| The six contexts (Q4) | **`skos:ConceptScheme`** of 6 `skos:Concept` (steward + gloss; the mandatory `dct:subject` community-ownership targets) | SKOS used as-is (zero-novelty house style) |

**DELETED (7 bespoke terms + the dormant machinery):** `opda:ValidationContext`, `opda:profileURI`, `opda:overlaysContext`, `opda:sourcedFrom`, `opda:formVersion` (→ PROF + DCMI/PROV); `opda:definedInContext` (→ `rdfs:isDefinedBy`); `opda:servesContext` + its SHACL-AF CONSTRUCT + the S021 cross-check `sh:Warning` shape + the F3 firewall (→ on-demand query). **KEPT:** `opda:consumesFrom` + the SKOS context scheme. The `profiles.py:250` "bug" is **mooted** — delete `overlaysContext` and the mis-target defect disappears with the construct that had it.

**SURVIVING WORK:** ADR-0028's 935-leaf descriptive walk and ADR-0029's profile-emitter rollout **survive on their own merits** — they emit **PROF + `rdfs:isDefinedBy` + SHACL shapes**, not the bespoke `ValidationContext` family. The expensive walk does not move; only the small set of predicates it co-emits changes to standards.

**The one honest caveat I name (DA duty, per Gandon):** **PROF is a 2019 W3C Working Group Note, not a Recommendation.** That is the single legitimate objection to the Q1/Q2 PROF move, and Knublauch/Kendall may raise it. It does not change my vote: PROF rides DCAT + DCMI (both Recs, both in OPDA's adoption catalogue), and the *alternative* to PROF is not "a Rec" — it is "a bespoke `opda:` vocabulary," strictly worse on stability and tooling. The mitigation is a one-page **baspi5 PROF-fit spike**: re-express baspi5's profile as `prof:Profile` + `prof:hasResource`, confirm the ODR-0010 §Q7 round-trip holds and the chain axiom satisfies Guarino. **Q1/Q2 are spike-gated HOLDs; Q3 is unconditional** (it stands on RDFS/DCMI Recs alone — `rdfs:isDefinedBy` + `dct:subject` + `dct:source`, the Kendall/Gandon three-Rec split — with zero PROF dependency, so even a PROF-skeptic must concede Q3).

---

**One-line verdict (final, post-cross-talk — converged with Davis, Kendall, Gandon):** *Over-engineered on the invention axis. The boring standards already exist inside OPDA's adoption universe: **W3C PROF** for form↔base + profile metadata (Q1/Q2) and **`rdfs:isDefinedBy` + `dct:source`** for term home (Q3) — retiring `opda:ValidationContext` + its five predicates and `opda:definedInContext`. **`opda:servesContext` is cut** (dormant, no named consumer — YAGNI/Rule 8): usage is an on-demand query, not a shipped rule. **Kept:** the SKOS six-context scheme (authored steward/gloss + the mandatory home-targets under single-namespace; a context owns many profiles, so it is NOT a `prof:Profile`) and `opda:consumesFrom` (the one DDD Conformist relationship no standard names). Q3 is unconditional (RDFS/DCMI Recs); Q1/Q2 are gated on a one-page baspi5 PROF-fit spike, because PROF is a W3C Note not a Rec — but the alternative to a community Note is a bespoke vocabulary, which is strictly worse.*
