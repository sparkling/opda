# Session 022 — Holger Knublauch (SHACL / TopBraid EDG)

**Lens:** what SHACL *is*, and what a shape legitimately carries — grounded in the SHACL Core W3C Recommendation (2017), the SHACL Advanced Features W3C Working Group Note (SHACL-AF), DASH (datashapes.org), and TopBraid EDG / TopBraid Composer practice. The architect's complaint is that S021 *invented* where convention already exists. My job is to cite the convention, not reason from scratch.

**One-line thesis:** opda's *form-as-SHACL-profile* is already 95 % idiomatic — `baspi5.ttl` is a textbook SHACL+DASH overlay. The 5 % that is invented (`opda:ValidationContext` and the bounded-context membership predicates) sits *outside* the shapes and is where the over-engineering lives. The architect is substantially right; the corrective is to delete reinvention, not to add more.

---

## What the emitted artefact actually is (the ground truth)

`source/03-standards/ontology/profiles/baspi5.ttl` (the only emitted profile) is, line for line, canonical SHACL Core + DASH:

- `opda:Baspi5_AddressShape a sh:NodeShape ; sh:targetClass opda:Address` — **a NodeShape REFERENCING a base class by `sh:targetClass`** (SHACL Core §2.1.2). The shape does not constitute `opda:Address`; it targets it. This is the whole game.
- Per-leaf property shapes carrying `sh:minCount`, `sh:maxCount`, `sh:in`, `sh:path`, `sh:message`, `sh:severity sh:Violation` (Core §2.1.3, §4.x, §6.5).
- `sh:xone` for the `sellersCapacity` discriminated union (Core §4.6.2) — ODR-0010 already chose `sh:xone` correctly.
- `dash:editor`/`dash:viewer`, `sh:order`, `sh:group`/`sh:PropertyGroup` — DASH form metadata (the W3C-adjacent de-facto UI vocabulary TopBraid ships).
- `dct:source <https://www.basp.uk/forms/baspi5#A1.1>` per shape — Dublin Core identification/provenance back to the form question.

**Verdict on the substrate:** this is exactly how TopBraid EDG models an "application profile / data-entry form over a domain model" — shapes target the model, constrain presence/vocabulary, and carry DASH UI hints + `dct:` traceability. ODR-0010 (Knublauch's own canonical mapping, ratified 12-0 at S001 / S010) got the mechanism right. **Nothing in the shapes themselves is over-engineered.** The dispute is entirely about the wrapper and the context-membership layer bolted around them.

---

## Q1 — Form↔base-ontology association: convention?

**Convention (cited).**
- A **form-as-profile is a set of `sh:NodeShape`s** whose `sh:targetClass`/`sh:targetNode`/`sh:targetSubjectsOf` (SHACL Core §2.1, "Targets") points at the *base* classes. The association *is* the target declaration. There is no separate "association" construct in SHACL — targeting **is** the association. (Skill 06-TARGETS: "Targets determine which nodes in the data graph are validated against a shape"; the shape *references* the model.)
- "Constrain a base vocabulary for an application" is the textbook **Description Set Profile / DCAP** intent, and in 2026 the constraint language of a DCAP **is SHACL** (DC Tabular Application Profiles / DCTAP compile to SHACL; this is the Baker lineage — see cross-talk). The DSP's old RDF-reification vocabulary is superseded by SHACL shapes.
- The **profile graph as an artefact** is identified by an `owl:Ontology` header (`baspi5.ttl` already has one: `<…/profiles/baspi5> a owl:Ontology ; owl:imports …; dct:title; dct:description`) and, if a *typed profile object* is genuinely wanted, by **W3C PROF** (`prof:Profile`, `prof:isProfileOf`, `prof:hasResource`/`prof:ResourceDescriptor`) — the standard "this artefact is a profile of that base" vocabulary.

**Is `opda:ValidationContext`/`overlaysContext`/`requires` idiomatic?** *Partly reinvention.* Breaking it down against convention:

| opda construct | What it actually is | Standard equivalent |
|---|---|---|
| `opda:ValidationContext` (typed node) | a reification of "this profile graph" | the profile's **own `owl:Ontology` node** (already emitted) and/or **`prof:Profile`** |
| `opda:overlaysContext → <context>` | "this profile is a profile of / applies to X" | **`prof:isProfileOf`** (profiles-of-a-base) — see Gandon |
| `opda:profileURI` / `opda:sourcedFrom` | identification + source of the form | **`dct:source`**, **`dct:isFormatOf`**, `prof:hasResource` |
| `opda:requires → <term>` | the set of terms the profile constrains | **REDUNDANT** — it is the set of `sh:path`/`sh:targetClass` objects a SHACL processor can already enumerate from the shapes graph |
| `opda:formVersion "5.0.3"` | version of the source form | `owl:versionInfo` / `pav:version` / `dct:hasVersion` |

The **legitimate** kernel of `ValidationContext` is ODR-0010's defensible point: a `sh:minCount 1` should be "required *under the BASPI5 profile*," not a free-floating axiom — i.e. *which named profile* a constraint belongs to. But SHACL already answers that: **a constraint belongs to the shapes graph (the named profile graph) it is asserted in.** "Required relative to a named context" = "asserted in `profiles/baspi5.ttl`, whose `owl:Ontology`/`prof:Profile` node names it." You do not need a *fourth* bespoke class to say what the graph IRI + `owl:Ontology` header already say.

**My Q1 recommendation.** Keep the shapes exactly as they are (idiomatic). For the profile-as-artefact wrapper: prefer the **bare `owl:Ontology` header + PROF** over `opda:ValidationContext`. At minimum, **drop `opda:requires`** (derivable from the shapes) and **re-type `opda:overlaysContext` as `prof:isProfileOf`** (or `rdfs:subPropertyOf prof:isProfileOf` if a local name is wanted). `ValidationContext` survives only as syntactic sugar with no semantic content the standards lack.

**Vote Q1: AGAINST** "`ValidationContext`/`overlaysContext`/`requires` is idiomatic as designed." The *shapes* are idiomatic; the *wrapper* is a reification of the profile graph that the `owl:Ontology` header + PROF + the shapes' own targets already supply. **FOR** a standard construct (shapes graph + `owl:Ontology`/PROF). Named convention: **SHACL Core §2.1 (targeting IS the association); W3C PROF (profile-of-base description); DCAP/DCTAP→SHACL (Baker).**

---

## Q2 — Metadata on a SHACL definition: what belongs, what does not?

This is the cleanest spec question and the one I can adjudicate most sharply. The W3C-sanctioned and DASH/TopBraid-conventional metadata on a **shape** is:

**LEGITIMATELY on a shape (Core + DASH):**
- **Targeting**: `sh:targetClass` / `sh:targetNode` / `sh:targetSubjectsOf` / `sh:targetObjectsOf` / `sh:target` (Core §2.1) — *the only thing that binds a shape to the model.*
- **Constraint components**: `sh:minCount`, `sh:maxCount`, `sh:datatype`, `sh:class`, `sh:in`, `sh:pattern`, `sh:node`, `sh:xone`/`sh:or`/`sh:and`/`sh:not`, `sh:hasValue` (Core §4).
- **Validation messaging & severity**: `sh:message`, `sh:severity` (`sh:Violation`/`sh:Warning`/`sh:Info`, Core §6.5).
- **UI / form metadata (DASH)**: `sh:name`, `sh:description`, `sh:order`, `sh:group` (+ `sh:PropertyGroup`), `dash:viewer`, `dash:editor`, `dash:propertyRole`, `sh:defaultValue` (Skill 10-SHACL-UI; DASH). All present in `baspi5.ttl` and correct.
- **Shape identification/provenance-of-the-shape**: `rdfs:label`/`rdfs:comment`, `dct:source` pointing at *the form question the shape encodes* (Core is silent but this is universal DASH/EDG practice — `baspi5.ttl`'s `dct:source → …/forms/baspi5#A1.1` is exactly right: it traces *the shape* to *its form question*).

**Does NOT belong on a shape — belongs on the ONTOLOGY TERM:**
- **The meaning/definition of the term** — `rdfs:comment`, `skos:definition`. A shape says what data *looks like*, not what the term *is* ("Shapes describe what things LOOK LIKE, not what they ARE" — Cagle, Skill 12-BEST-PRACTICES §1). The conceptual definition lives on `opda:Address` in the TBox, not on `Baspi5_AddressShape`.
- **The term's provenance / vocabulary-of-origin / conceptual home** — `rdfs:isDefinedBy` (the defining ontology), `dct:source`/`prov:wasDerivedFrom`/`prov:wasAttributedTo` on the *term*. **This is decisive for Q3:** "which context defined this term" is term-provenance, and term-provenance is an ontology-layer annotation, never a shape annotation.
- **Conceptual classification / subject-area / bounded-context membership** — `dct:subject`, `skos:inScheme`-of-the-concept, taxonomy links. In TopBraid EDG the **taxonomy/ontology layer owns conceptual classification** (subject areas, collections, asset metadata); shapes validate *against* it via targeting and **never reverse-engineer the partition from validation requirements.** This is the core EDG separation-of-concerns and it is exactly what S021's `servesContext`-derived-from-`requires` violates the spirit of.

**Crisp rule (the one to ratify):** *A shape carries `target + constraints + message/severity + DASH-UI + dct:source-to-its-form-question`. It never carries the term's meaning, the term's provenance, or the term's conceptual classification — those are TBox annotations on the term.*

**Application to opda.** `baspi5.ttl` obeys this perfectly. The **violation** is one level up: `opda:servesContext` (a classification/membership fact) is *derived from the profile's validation requirements* (`requires`) — i.e. the partition is reverse-engineered from the shapes. EDG convention says classification flows *into* validation (shapes target classified terms), never *out of* it. The architect's instinct here is dead-on.

**Vote Q2: FOR** the rule above (target + constraints + message/severity + DASH + `dct:source`-to-form-question on the shape; meaning + provenance + classification on the term). **AGAINST** putting any context-membership or term-home on shapes, and **AGAINST** deriving a classification *from* shapes. Named convention: **SHACL Core §2.1/§4/§6.5; DASH (`dash:viewer`/`editor`, `sh:order`/`group`); Cagle "shapes describe structure not meaning"; TopBraid EDG taxonomy-owns-classification.**

---

## Q3 — "Which context a term belongs to": bespoke scheme + 2 predicates, or standard?

Two distinct questions hide here. Separate them.

**(3a) The scheme of contexts itself.** `opda:BoundedContextScheme` as a `skos:ConceptScheme` of six `skos:Concept`s (`opda:ConveyancingContext`, …) is **idiomatic and the one new artefact I defend.** It is reference data — a controlled vocabulary of the six DDD communities of practice — and SKOS is precisely the W3C standard for that (SKOS Reference; mirrored on opda's 23 existing value-schemes). TopBraid EDG models subject-areas / collections exactly this way (a taxonomy the model is classified against). No standard "DDD bounded-context vocabulary" exists to reuse, so minting one in SKOS is correct, not reinvention. **Keep it.**

**(3b) Per-term membership via two bespoke predicates.** Here I split:

- **`opda:servesContext` (derived "used-by").** This is **not a SHACL concern and not even stored data** — it is a *rule*. ODR-0020 Rule 5 itself defines it as a SHACL-AF `CONSTRUCT { ?term opda:servesContext ?ctx } WHERE { ?vc opda:overlaysContext ?ctx ; opda:requires ?term }`. That is the textbook **SHACL-AF rule** (SHACL Advanced Features Note, §"Rules" / `sh:rule` / `sh:SPARQLRule`): a derived value materialised on demand from existing triples. The right home for a derived view is a **rule you run when asked**, *not* a stored annotation. The architect's "`used-by` is redundant with `overlaysContext`+`requires` (a rule)" is **correct and is what ODR-0020 already concedes** by shipping it dormant. So: `servesContext` is correctly a SHACL-AF rule; it should **never be hand-authored and never persisted** as ground truth. ODR-0019/0020's "derive-don't-declare, ship dormant" is the right call; S021 left that intact, which is good.

- **`opda:definedInContext` (authored "home").** *This is where reinvention bites.* S021 makes it the **authoritative** home predicate, **generated from each term's `dct:source` provenance**. Read that carefully: it manufactures a *new bespoke predicate* whose value is *computed from `dct:source`* — i.e. it re-expresses provenance that `dct:source` / `rdfs:isDefinedBy` / `prov:wasDerivedFrom` already carry, in a home-grown term. The standards for "where did this term come from / what is its defining vocabulary" are:
  - **`rdfs:isDefinedBy`** — the canonical "vocabulary-of-origin / defining resource" (RDFS). If the "home" is a defining authority, this is the predicate.
  - **`dct:source` / `prov:wasDerivedFrom` / `prov:wasAttributedTo`** — provenance of the term's origin (DCMI / PROV-O), *which S021 says it will read to generate `definedInContext`*. If you already have `dct:source`, you already have the home; minting `definedInContext` to restate it is the reinvention.
  - **`skos:inScheme`** *on the context concept* (not the term) for the scheme membership of the *contexts*.

  The legitimate residue is narrow: "home" as opda means it is *a `skos:Concept` (a bounded context)*, and pointing a TBox term at a SKOS concept to record its conceptual subject is exactly **`dct:subject`** (DCMI: "the topic of the resource"). Baker said as much at S019: term→context is `dct:subject`. **So the standard already exists: `opda:Term dct:subject opda:ConveyancingContext`.** `definedInContext` is `dct:subject` (or `rdfs:isDefinedBy` if it is truly a defining-authority link) wearing a bespoke name.

**Is `definedInContext` reinventing provenance?** **Yes** — by S021's own construction (it is *generated from `dct:source`*). It either (i) duplicates `dct:source`/`rdfs:isDefinedBy` (provenance/origin), or (ii) is a subject-classification, which is `dct:subject`. A bespoke predicate computed from a standard predicate is reinvention with a drift surface.

**My Q3 recommendation.**
- **Keep** the SKOS `BoundedContextScheme` (3a).
- **`servesContext`**: keep it as a **SHACL-AF rule**, dormant, never stored, never authored — exactly as ODR-0019/0020 say. Don't promote it to data.
- **`definedInContext`**: **replace with `dct:subject`** (term → context `skos:Concept`) for the conceptual-home classification; use **`rdfs:isDefinedBy` / `dct:source`** where the relation is genuinely defining-vocabulary/provenance (which S021 admits it is, since it reads `dct:source`). Do not mint a bespoke predicate that is generated from a standard one.

**Vote Q3: AGAINST** the two bespoke predicates as *new vocabulary*. **FOR** standards: SKOS scheme (keep) + **`dct:subject`** for authored term→context home + **`rdfs:isDefinedBy`/`dct:source`/`prov:`** for provenance + **SHACL-AF rule** for the derived `servesContext` view. **`definedInContext` IS reinventing provenance** (it is generated from `dct:source`). Named convention: **SHACL-AF §Rules (`sh:rule`) for `servesContext`; DCMI `dct:subject`/`dct:source`; RDFS `rdfs:isDefinedBy`; PROV-O; SKOS Reference; TopBraid EDG classification-owns-subject-area.**

---

## Q4 — Over-engineering verdict + minimal idiomatic design

**Verdict: over-engineered — in the membership/context layer, not the shapes.** Tally of what is invented vs. standard:

| Layer | Status | Convention |
|---|---|---|
| Form-as-SHACL profile (`baspi5.ttl` shapes) | **Idiomatic — keep verbatim** | SHACL Core + DASH + `dct:source` |
| `BoundedContextScheme` (6 SKOS concepts) | **Idiomatic — keep** | SKOS Reference (reference data) |
| `opda:servesContext` (derived used-by) | **Correctly a rule — keep dormant, never store** | SHACL-AF `sh:rule` |
| `opda:ValidationContext` wrapper | **Reinvention/redundancy — demote** | `owl:Ontology` header + PROF; `requires` derivable from shapes |
| `opda:overlaysContext` | **Home-grown** | `prof:isProfileOf` |
| `opda:definedInContext` (authored home) | **Reinvents provenance — replace** | `dct:subject` / `rdfs:isDefinedBy` / `dct:source` |
| S021 cross-check shape + total-cover CI + F2/F3 firewall guards | **Machinery to police a derived view that shouldn't be stored — once `servesContext` is a rule and home is `dct:subject`, they have nothing to guard** | YAGNI; ODR-0011 §1a integrity-shape pattern is fine *if* anything survives |

**Minimal idiomatic design (what I'd ratify):**

1. **Shapes graph unchanged.** Each form = a named SHACL graph of `sh:NodeShape`s `sh:targetClass`-ing the base terms, with `sh:minCount`/`sh:in`/`sh:xone` + DASH + `dct:source`→form-question. (As emitted.)
2. **Profile-as-artefact = `owl:Ontology` header (already there) + optionally `prof:Profile`/`prof:isProfileOf`** to say "baspi5 is a profile of the OPDA base." Drop `opda:ValidationContext`, `opda:requires` (derivable), `opda:profileURI`/`opda:sourcedFrom` (→ `dct:source`/`prof:hasResource`). Re-point `opda:overlaysContext` → `prof:isProfileOf`.
3. **Context vocabulary = the SKOS `BoundedContextScheme`** (keep).
4. **Term→context (authored home) = `dct:subject`** on the term, pointing at the `skos:Concept`. Term provenance/origin = `rdfs:isDefinedBy`/`dct:source` (already carried). **No `definedInContext`** — it dies on the *invention test* (it restates `dct:source`/`rdfs:isDefinedBy`/`dct:subject`), not on Davis's homonym count. Note (Davis's correction): the home-pass is *replaced* by standards, not *gated* — emitting `dct:subject`/`rdfs:isDefinedBy` is wiring up Recs opda emits on zero terms today, so there is no bespoke artefact left for YAGNI to gate.
5. **Term→context (derived used-by) = a SHACL-AF `CONSTRUCT` rule**, run on demand, **never materialised into the source TTL.** **No stored `servesContext`.**
6. **CI**: the *one* guard worth keeping is the EDG-style firewall "a domain term is not `skos:inScheme BoundedContextScheme`" (terms are classified *against* the scheme via `dct:subject`, not members of it) — this is the ODR-0011 §1a integrity-shape pattern and it is cheap. The cross-check shape, total-cover assertion, and F2/F3 are policing a derived view that shouldn't be stored in the first place; once `servesContext` is a run-on-demand rule and the home is `dct:subject`, most of that machinery has nothing to guard.

**Impact on the records:**
- **S021** (the session under challenge): its central moves — promoting `definedInContext` to *authoritative, generated-from-`dct:source`*, the cross-check shape, total-cover CI, F1/F2/F3 — are **the over-engineering**. They should be **reduced**: `definedInContext`→`dct:subject`; servesContext stays a dormant rule; keep only the `skos:inScheme`-firewall guard. S021's *non*-controversial moves (one-go delivery, the data-dictionary as single source) are orthogonal and fine.
- **ODR-0019**: Rules 1–4, 6, 7 (single namespace, SKOS contexts, homonym-by-local-name, no `owl:sameAs`, naming) are sound and untouched by SHACL convention. **Rule 5** (`definedInContext` as an `owl:AnnotationProperty`) should be **amended to `dct:subject`** (home) + `rdfs:isDefinedBy`/`dct:source` (provenance). **Rule 8** (YAGNI gate) is *correct and should bind harder* — it already says "mint two words, write two comments, stop"; extend it to "use `dct:subject`, don't mint a predicate."
- **ODR-0020**: the *category discipline* (six industry contexts only; upstream = `opda:Organisation` via `consumesFrom`; spanning derived) is good DDD/UFO modelling and not a SHACL matter. **Rule 5's derive-don't-declare is right** — keep `servesContext` as the CONSTRUCT, dormant. The **firewall promoted to CI**: keep F1 (cheap, idiomatic integrity shape); F2/F3 and total-cover become near-trivial once nothing is stored. `opda:consumesFrom` is fine as a DDD-Conformist link (no standard "consumes-from-authority" predicate; arguably `prof:isProfileOf`/`dct:source`+`prov:wasAttributedTo` cover it, but a domain predicate here is defensible).
- **ADR-0026/0028/0029**: the emitter should emit (a) shapes (as now), (b) the SKOS scheme, (c) the dormant SHACL-AF CONSTRUCT. It should **not** emit a stored `servesContext`, and should emit the authored home as **`dct:subject`**, not `definedInContext`. The `profiles.py:250` fix is real either way (point the profile at its context — via `prof:isProfileOf`).

**Vote Q4: OVER-ENGINEERED (in the membership/context layer).** The minimal idiomatic design above. Named convention: **SHACL Core (shapes), DASH (UI), SHACL-AF (`servesContext` as rule), SKOS (the scheme), DCMI `dct:subject`/`dct:source` + RDFS `rdfs:isDefinedBy` (home/provenance), W3C PROF (profile-of-base), TopBraid EDG (classification-owns-subject-area; shapes target, never reverse-engineer the partition).**

---

## Summary of votes

| Q | Vote | Named convention |
|---|---|---|
| Q1 form↔base | **AGAINST** wrapper-as-idiomatic; **FOR** standard (shapes target base; profile = `owl:Ontology`+PROF) | SHACL Core §2.1; W3C PROF; DCAP/DCTAP→SHACL |
| Q2 metadata on a shape | **FOR** target+constraints+message/severity+DASH+`dct:source`-to-form-question; **AGAINST** meaning/provenance/classification on shapes | SHACL Core §2.1/§4/§6.5; DASH; EDG taxonomy-owns-classification |
| Q3 which-context | **AGAINST** 2 bespoke predicates as new vocab; **FOR** SKOS scheme + `dct:subject` (home) + `rdfs:isDefinedBy`/`dct:source` (provenance) + SHACL-AF rule (derived). **`definedInContext` reinvents provenance.** | SHACL-AF §Rules; DCMI `dct:subject`/`dct:source`; RDFS `isDefinedBy`; SKOS |
| Q4 over-engineering | **OVER-ENGINEERED** (membership layer); shapes + SKOS scheme + dormant rule are the keepers | (all of the above) |

**Bottom line for the Queen:** the shapes layer vindicates ODR-0010 and needs no change. The architect is right that the bounded-context membership design reinvents and reverse-engineers: `definedInContext` restates `dct:source` (→ use `dct:subject`/`rdfs:isDefinedBy`), `servesContext` is a rule that shouldn't be stored (keep it as SHACL-AF, dormant), and `ValidationContext`/`overlaysContext`/`requires` is a profile-reification the `owl:Ontology` header + PROF + the shapes' own targets already cover. Keep the one genuinely-new artefact (the SKOS context scheme); delete the reinvention.

**Two axes, kept distinct (Davis's correction, important for the synthesis):** the bespoke predicates (`definedInContext`, `servesContext`, the wrapper) die on the **invention test** — a published W3C/DCMI/SHACL-AF standard already does each job — *not* on YAGNI. Davis's empirical count (PDTF glossary: **0 duplicate-prefLabel domain homonyms**; 1 same-label/two-definition hit, free-text boilerplate) gates the **polysemy machinery** (per-context `skos:scopeNote` registries, SKOS-XL, a sense register; S019 gate = ≥3 attested collisions + a named term-grain consumer) — and S021 correctly *kept* that gate. The home-pass was argued on a *different axis* (home-vs-usage), so the homonym count was never its gate; it is *replaced* by `dct:subject` + `rdfs:isDefinedBy` (Rec-grade), not gated. So the accurate attribution: **Davis's 0-homonym count keeps the polysemy machinery gated; the home-pass and the bespoke predicates fall to the invention test; `servesContext` falls as a stored view of a rule.** Don't frame the home-pass as "killed by Davis's gate" — the carve-out was on a different axis and the cleaner ground is invention-redundancy.

---

## Cross-talk outcomes (rebuttal pass)

**With Gandon (PROF) — converged; full SHACL sign-off on PROF-wraps-SHACL, with two grounded caveats:**
1. **Re-typing `ValidationContext` → `prof:Profile` is inert to ODR-0010's build-step.** Verified against the mechanism: the composition graph-union operates on the property/node *shapes* (`sh:minCount` additive, merged `sh:in`, `sh:xone`, `dct:source`, DASH); it never reads the `ValidationContext` node. No SHACL-Core/AF reason the wrapper breaks — Guarino's "fixed model theory" reification IS `prof:Profile` + the chain axiom `( prof:isProfileOf ∘ dct:conformsTo )`. Gandon is right.
2. **CAVEAT — DASH is not a separable artefact today.** In `baspi5.ttl` the `dash:viewer`/`dash:editor`/`sh:order`/`sh:group` terms live *interleaved on the same property-shape blank nodes* as the SHACL constraints (e.g. `_:b09d940f4830d` carries `sh:in` + `sh:message` + `dash:editor` + `sh:group` together). PROF should map the shapes-graph as **one `role:validation` `ResourceDescriptor`** (DASH rides along), *not* three `prof:hasArtifact`s at files that don't physically exist — unless DASH is split into its own file first. The enum SKOS as a `role:vocabulary` sibling is clean (it lives in `opda-vocabularies.ttl`).
3. **CAVEAT — the conformance chain replaces `servesContext`'s consumer-query, not its output.** The PROF chain has a **payload instance** as subject (data conformsTo baspi5 ⇒ conformsTo base-spec — instance→spec). `servesContext` has a **term** as subject (term required-by a profile-of context X ⇒ term servesContext X — term→SKOS-concept). Different domain, different range — the chain *cannot* produce the term→context index. But the index has no named consumer (Davis's gate), and the consumer-facing question ("what context is this data in?") IS answered by the chain on the payload. So: keep `servesContext` only as a dormant on-demand SHACL-AF rule if a term-grain index is ever wanted; never store it; if ever materialised, target `dct:subject`, not a bespoke predicate.

**Open divergence flagged for the Queen (Knublauch vs Gandon/Davis):** the Q3 *home* arrow. Gandon/Davis map it to `rdfs:isDefinedBy`; I hold `dct:subject`. A bounded context is a `skos:Concept` (community of practice, ODR-0019 Rule 2), not a defining *document* — and `rdfs:isDefinedBy`'s referent is a defining vocabulary/document, which under ODR-0004's single namespace is constant (non-discriminating). So: `rdfs:isDefinedBy`/`dct:isPartOf` for vocabulary/module-of-origin (→ the document); **`dct:subject` for the bounded-context community home (→ the `skos:Concept`)**. Different arrows at different targets; `definedInContext` conflated them; Davis's "sub-property of `rdfs:isDefinedBy`" works only for the document target. (Also Baker's own S019 position and ODR-0019's rejected-alternative wording.) The Queen should issue one answer.

**Converged Q1/Q2 joint position (Knublauch + Gandon), 2nd pass — locked:** SHACL owns the constraints; PROF owns the description-of-the-profile-as-artefact. Adopt option **(b)** — a typed `prof:Profile` node carrying *description only* (`prof:isProfileOf`, `prof:hasResource`/`ResourceDescriptor`/`hasRole`, `prof:hasToken`, `dct:publisher`, `dct:conformsTo`); the SHACL shapes graph (`sh:targetClass` + `sh:minCount`/`sh:in`/`sh:xone` + DASH) is untouched — PROF *wraps*, does not absorb. (b) beats a bare `owl:Ontology` (a) on three structural facts a targeting graph cannot express: profile-grain resource bundling, the profile↔base association + the `( prof:isProfileOf ∘ dct:conformsTo )` chain axiom (vs node-grain `sh:targetClass`), and the conneg token. **`opda:overlaysContext` SPLITS** into `prof:isProfileOf` (→ base ontology) + `dct:publisher` (→ the community concept) — it was conflating two relations; this also moots the `profiles.py:250` bug (no `overlaysContext` left to mis-target). **Delete** `requires` (redundant with the shapes — verified at `profiles.py:244-249`, a loop over the bound classes = the `sh:targetClass` set), `profileURI`/`sourcedFrom` (→ the profile IRI / `dct:source`), and `ValidationContext` (→ `prof:Profile`; the Guarino fixed-model-theory reification IS `prof:Profile ⊑ dct:Standard`). **Precise statement on the derivation** (so the Queen isn't handed an overstatement): killing `requires` removes the `servesContext` derivation's hand-maintained INPUT, and the PROF conformance-chain answers its main CONSUMER query ("what context is this *data* in" — from the payload's own `dct:conformsTo`); but the chain (payload→spec) and the CONSTRUCT (term→`skos:Concept`) compute *different facts*, so the chain removes the *need* for `servesContext`, it does not *produce* its output. Keep `servesContext` only as a dormant on-demand SHACL-AF rule if a term-grain index is ever named — and if so, emit `dct:subject`, not a bespoke predicate. **PROF-is-a-Note caveat:** under a hard veto of `prof:`, the load-bearing predicates (`dct:Standard`, `dct:conformsTo`, `sh:targetClass`) are Rec-grade and carry it; a thin local `subPropertyOf` is *more* reinvention than citing `prof:isProfileOf`, so retreat only under veto.

**With Baker (Queen) — closed the last Q1/Q2 degree of freedom:** Baker conceded the bespoke `opda:ValidationContext` *individual* is redundant and asked whether the profile node should be kept *implicit* (just `sh:targetClass`, untyped) or *typed* `prof:Profile`. **My answer: TYPED `prof:Profile`, folded onto the shapes-graph's existing `owl:Ontology` header node** (`baspi5.ttl:20-26` already has it — this adds a type + PROF predicates to an existing node, not a new artefact). Reasons: (1) an untyped graph has no profile *identity* a consumer can name (conneg needs `prof:hasToken` on a typed `prof:Profile`); (2) the profile↔base association is *profile-grain* and only the typed node carries it (`prof:isProfileOf` + chain axiom) — `sh:targetClass` is node-grain and cannot state "this *profile* profiles that *base spec*"; (3) Guarino's fixed-model-theory is preserved verbatim — the named context IS the `owl:Ontology`/`prof:Profile` node the shape sits under; we retire the *second* node, not the model theory. **The one SHACL guard:** typing the header node `prof:Profile` is *inert to validation* (metadata on the graph, not a shape/target). Keep it that way — do **NOT** also make the profile node a `sh:NodeShape` + `rdfs:Class` (the SHACL *implicit-class-target* / OWL-punning case, 06-TARGETS), which would turn the profile node into a focus-node target and confuse processors expecting pure-OWL or pure-SHACL. So: `owl:Ontology` + `prof:Profile` on the header node (description only); `sh:NodeShape` + `sh:targetClass` on the per-term shapes (constraints only); never merge the two — which keeps the SHACL artefact a clean shapes graph (ODR-0010's graph-separation, preserved). **Q1/Q2 now fully converged across Knublauch + Gandon + Davis + Baker.**
