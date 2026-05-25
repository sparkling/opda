---
status: proposed
date: 2026-05-20
tags: [overlays, shacl, profiles, validation-context]
supersedes: []
depends-on: [ONT-0004, ONT-0005]
implements: [ONT-0003]
---

# Overlay Profile Mechanism

## Context and Problem Statement

PDTF v3 is not one schema but a base transaction plus a family of form **overlays** — BASPI4/5, TA6/7/10 (via extensions), NTS/NTS2/NTSL, CON29R/DW, LLC1, LPE1, FME1, and more — composed at runtime by `getTransactionSchema`'s deep-merge into one effective schema. Each overlay does three things on merge: it *unions* `required` arrays (adding mandatory fields), it *unions* `enum` member lists (widening permitted vocabularies), and it carries per-leaf cross-references (`baspi5Ref`, `ntsRef`) tying a field back to a numbered form question (e.g. BASPI `B1.3.2`). The same overlay files also encode `oneOf` discriminated unions — most sharply `participants.items` with `discriminator: { propertyName: "role" }`, and the nested `sellersCapacity` `oneOf` (Legal-Owner/Mortgagee versus Personal-Representative/Attorney, the latter requiring `sellersCapacityDetails` and `attachments`).

The naïve linked-data move — minting a class per overlay (`baspi:PropertyPack`, `ta6:PropertyPack`) — was rejected unanimously in Council Session 001 (Q3, Q5). That nesting is form ergonomics, not ontology (Cagle: "flatten it"); overlays are *views over a fixed TBox*, not vocabularies (Kendall's FIBO jurisdictional-profile pattern: overlays *constrain*, they do not *declare*). The base ontology's classes (Property, Title, Participant, Claim) are fixed; what an overlay changes is *which constraints are active* for a given form context.

The question (Q5, owned by Knublauch): how do we re-express the overlays so that loading a form's requirements activates the right constraints and can re-generate the form, without (a) misusing SHACL constructs so a profile validates the wrong thing, (b) letting closed-world shape semantics leak into the open-world class model (Gandon/Knublauch's Q3 graph-separation), (c) letting an overlay touch a Kind's identity (Guizzardi's gate), or (d) promoting a build-config artefact to ontological status with no fixed model theory (Guarino's Devil's-Advocate objection)?

This is a **cross-cutting** record (Q3), and the BASPI5 slice is part of the MVP: it was chosen precisely because its discriminated `oneOf`/`sellersCapacity` structure stresses every hard construct (`sh:xone`, merged `sh:in`, DASH editors, `dct:source`), so that if it round-trips — JSON → profile → rendered form + validated transaction — the remaining overlays are largely mechanical (Cagle, Knublauch).

## Decision Drivers

* **Open-world class model must not leak into closed-world shapes** (Gandon, Knublauch, Q3) — OWL/RDFS is monotonic and open-world; SHACL is closed-world. An `sh:minCount 1` is not an `owl:minCardinality`; the commonest abuse is writing one and believing it is the other. Shapes reference classes via `sh:targetClass`, never `owl:imports`.
* **A profile must validate the *right* thing** (Knublauch) — the SHACL constructs must faithfully translate the JSON semantics; a profile that misuses them (stacking two `sh:in`, or using `sh:or` where `oneOf` means exactly-one) silently validates the opposite of intent.
* **Composition is a build step, not an entailment** (Gandon) — RDF/OWL has no operation that unions two `sh:in` lists by entailment; the union is a deep-merge producing a new shapes graph. Conflating build-time merge with run-time entailment is a foundational error.
* **Conditionality needs a fixed model theory** (Guarino, Devil's Advocate) — "required (depending on which files a build call passed)" is not a coherent proposition; "required under the Conveyancer profile" is. Conditional requirement must be reified, not left as a function of build-call arguments.
* **No overlay may touch identity** (Guizzardi's gate) — identity and keys belong to the rigid Kinds (ONT-0005); a form profile constrains presence and vocabulary, never who a thing *is*.
* **Full traceability to the source form** — every constrained leaf must trace back to its numbered form question, so a loaded profile both validates a transaction and re-generates the form with provenance (the canonical round-trip).
* **Standard, conformant SHACL only** — advisory or AI-consumer annotations must not masquerade as constraints inside the shapes graph (Knublauch/Gandon).

## Considered Options

* **A class per overlay** — mint `baspi:PropertyPack`, `ta6:PropertyPack`, etc., recreating the JSON/form tree as an OWL class hierarchy. Rejected unanimously (Q3) — that nesting is form ergonomics, not ontology; it conflates the UI contract with semantics, so the form layout cannot evolve without touching the class model.
* **Overlays as named SHACL profile graphs over a fixed TBox** (chosen) — each overlay is a dereferenceable shapes graph; composition is a documented build-step graph-union; conditional requirement is reified as a first-class `opda:ValidationContext`; DASH drives form rendering; `dct:source` carries traceability to form questions.
* **Inline advisory annotations in the shapes graph** (rejected sub-option, the Cagle/Knublauch fault line) — allow non-standard `opda:aiHint` triples for LLM consumers directly inside the SHACL profile. Rejected (≈7-2) in favour of a separate annotation graph keyed to shape IRIs.

## Decision Outcome

Chosen option: **overlays as named, dereferenceable SHACL profile graphs over a fixed TBox**, because it is the only option that keeps the class model fixed and open-world while making each form's requirements an activatable, checkable, re-generable view — and because the two reservations that could have sunk it (Guarino's "no fixed model theory" and Cagle's advisory-annotation push) were resolved by reification and graph-separation rather than waved away.

**Knublauch's canonical mapping (core unanimous, 12-0).**

1. **required-array union → `sh:minCount 1`.** Each `required` entry becomes a property shape with `sh:minCount 1` on the target node shape (e.g. baspi5's `required: ["uprn", "address", …]` on `propertyPack` → that many `sh:property [ sh:path opda:uprn ; sh:minCount 1 ]` shapes on `opda:PropertyPack`, active only when BASPI5 is loaded). On graph union this is **purely additive** — the composed graph holds the union of `sh:minCount 1` shapes, with no conflict to resolve.
2. **enum union → a single *merged* `sh:in`.** A JSON `enum` → `sh:in ( … )`. The effective `sh:in` is the set-union of base plus every loaded profile's members. This is the single most important strictness point, and it is a **build-step replacement, not an entailment** (Gandon's insistence): at build time you **replace the `sh:in` node with the union list**. You do **not** leave two `sh:in` constraints on one property — two `sh:in`s are conjunctive, i.e. the *intersection*, which is the exact opposite of the union intent. "The loaded profile defines the active permitted vocabulary" (Gandon: *loaded profile = active vocabulary*).
3. **`oneOf` → `sh:xone`.** `oneOf` is faithfully an exactly-one, so the strictly-correct construct is **`sh:xone`** (reserve `sh:or` for "at least one"). baspi5's `participants.items` discriminated on `role` → a node shape `sh:xone ( [non-seller] [seller] )`, with the discriminator expressed via `sh:qualifiedValueShape` keyed on the `role`/`sellersCapacity` value. The nested `sellersCapacity` `oneOf` (Legal-Owner/Mortgagee versus PR/Attorney) → a nested `sh:xone` whose Personal-Representative/Attorney branch carries the extra `sh:minCount 1` shapes for `sellersCapacityDetails` and `attachments`.
4. **per-leaf `baspi5Ref`/`ntsRef` → `dct:source`.** Each annotated shape gets `dct:source` (with `rdfs:isDefinedBy` where appropriate) pointing at a minted, dereferenceable form-question IRI — e.g. `<https://opda.uk/forms/baspi5#B1.3.2>` — forming a shape → question → form chain. SSSOM records are the richer alternative *only if/when* admitted (deferred per Q2; this is the reasoner-poorer trade we accept by deferring it, Cagle's dissent recorded).
5. **DASH for rendering.** Per property shape: `dash:propertyRole dash:KeyRole` on UPRN, `dash:LabelRole` on name leaves; `dash:viewer` (`dash:LabelViewer`/`dash:LiteralViewer` for reads, `dash:URIViewer` for `dct:source` links); `dash:editor` (`dash:EnumSelectEditor` for role/capacity enums driven by `sh:in`, `dash:TextFieldEditor` for `sellersCapacityDetails`, `dash:DetailsEditor` for nested `address`); `sh:order` + `sh:group` reproduce the form's field order and sectioning. Loading the BASPI5 profile yields a graph that both *validates* a transaction and *generates* the BASPI form with full `dct:source` traceability — **the canonical round-trip.**

**`opda:ValidationContext` reification (Guarino's accepted withdrawal condition).** A profile is reified as a first-class `opda:ValidationContext` node. A `sh:minCount 1` is then a constraint *of a named context* — "required under the Conveyancer profile" — not a free-floating axiom whose truth is a function of which files a particular build call passed (and whose `oneOf` ordering could even be perturbed by overlay order). This converts conditionality from an incoherent proposition ("required (depending)") into a coherent one (a requirement *relative to* a named, dereferenceable context), giving the construct the fixed model theory the Devil's Advocate demanded.

**Guizzardi's no-identity-override gate.** A SHACL gate must reject any overlay that declares or overrides a Kind's identity or key. A profile may add presence and vocabulary constraints; it may never restate or alter the identity criterion or key mechanism settled in ONT-0005. Identity belongs to the rigid Kind, not to a form context.

**Advisory annotations exiled to a separate graph (≈7-2).** Advisory LLM-consumer annotations (`opda:aiHint`) do **not** live inside the shapes graph; they live in a separate annotation graph keyed to shape IRIs, consistent with the Q3 class/shapes/annotation separation. A SHACL processor must find only interpretable constraint components plus known annotation properties (`sh:`, `dash:`, `rdfs:`, `dct:`); a constraint-adjacent invented term risks being read as a constraint. Extension is fine *as a documented vocabulary with defined semantics* — that is what DASH is; `opda:aiHint` with no formal semantics is not, so it goes in its own graph (→ ONT-0013).

### Consequences

* Good, because the TBox stays fixed and open-world while each form's requirements become an activatable, checkable view — the UI/requirement contract can evolve without touching the class model (Gandon/Knublauch's graph separation, satisfied).
* Good, because the merged-`sh:in` rule prevents the most damaging silent failure (stacked `sh:in` = intersection), and `sh:xone` faithfully preserves the `oneOf` exactly-one semantics that BASPI's `role`/`sellersCapacity` discriminators depend on.
* Good, because reifying conditionality as `opda:ValidationContext` gives "required under profile X" a fixed model theory, converting the Devil's Advocate's strongest objection into an accepted amendment instead of an unresolved hole.
* Good, because the `dct:source`-to-form-question chain plus DASH rendering delivers the round-trip: one loaded profile validates a transaction *and* re-generates the form with traceability, which is the operational payoff that makes the remaining overlays mechanical.
* Bad, because composition is a build-step graph-union that must be specified and maintained as code (mirroring `getTransactionSchema`'s deep-merge); the "loaded = active" semantics are documentation-and-tooling, not entailment, so a tool that gets the merge wrong (stacking `sh:in`) is silently incorrect with no reasoner to catch it.
* Bad, because the `dct:source` fallback is reasoner-poorer than SSSOM for the per-leaf mappings (no machine-readable justification/confidence), a known trade accepted by deferring SSSOM (Cagle's recorded dissent).
* Neutral, because the enum *members* themselves are owned by ONT-0011 (SKOS) and the annotation-graph and severity tiering by ONT-0013 — this record fixes the profile *mechanism* and delegates the vocabulary fill and the validation severities.

### Confirmation

- A SHACL gate (the no-identity-override gate, Guizzardi) rejects any profile that declares or overrides a Kind's identity or key; this is a structural check on the profile graphs themselves (→ ONT-0013).
- The composition build step is validated by the round-trip on the BASPI5 slice: loading the profile must (a) validate a conformant transaction, (b) report violations on a non-conformant one (e.g. a Seller acting as Attorney with no `sellersCapacityDetails`/`attachments`), and (c) re-generate the BASPI form via the DASH annotations with every field carrying a resolvable `dct:source` to its form question.
- The merged-`sh:in` rule is checked by a build-step test asserting that a composed profile's effective `sh:in` is the set-union (not the intersection) of base and loaded members — the regression guard against stacked `sh:in`.
- Profile and form-question URIs dereference: `…/profiles/baspi5/` returns a working shapes graph and `…/forms/baspi5#B1.3.2` resolves (Hendler/Davis/Gandon: "don't ship URIs you don't serve").
- Shapes target classes via `sh:targetClass`/`sh:targetNode`/`sh:targetObjectsOf` (Knublauch: a shape with no target validates nothing); the class graph and shapes graph remain separate files (Q3).

## Pros and Cons of the Options

### A class per overlay

* Good, because it is a direct, mechanical transliteration of the merged JSON tree.
* Bad, because it recreates form ergonomics as an OWL class hierarchy, conflating the UI contract with semantics so the form cannot be re-laid-out without editing the ontology.
* Bad, because overlays would then *declare* rather than *constrain*, multiplying near-duplicate `…PropertyPack` classes per form and inviting identity drift across them — exactly what Guizzardi's gate forbids.

### Overlays as named SHACL profile graphs

* Good, because each overlay is a dereferenceable, composable shapes graph over one fixed TBox; loading it activates exactly that form's constraints and can re-generate the form (the round-trip).
* Good, because reification as `opda:ValidationContext` gives conditional requirement a fixed model theory, and the build-step graph-union keeps closed-world shape semantics out of the open-world class model.
* Bad, because composition lives in build tooling, not in entailment, so correctness of the merge (notably merged-not-stacked `sh:in`) depends on documented rules and tests rather than a reasoner.

### Inline advisory annotations in the shapes graph

* Good, because LLM-consumer hints would travel inside the same graph as the data they annotate (Cagle's argument).
* Bad, because a shapes graph polluted with `opda:aiHint` is no longer cleanly a SHACL graph: a strict processor carries triples it cannot interpret, and a naïve consumer may read them as constraints (Knublauch/Gandon prevail, ≈7-2).
* Neutral, because the need is real and met another way — a separate annotation graph keyed to shape IRIs preserves the hints without letting them masquerade as constraints.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: SHACL (the profile shapes); DASH (form rendering — `dash:propertyRole`/`viewer`/`editor`, `sh:order`/`sh:group`, adopted unconditionally for form-driving shapes per Q2); Core (`dct:source`/`rdfs:isDefinedBy` traceability); SKOS for the enum members surfaced via `sh:in` (→ ONT-0011); local `opda:ValidationContext` reifying the profile. SSSOM deferred (Q2; `dct:source` now, SSSOM when external mappings arrive — Cagle dissent recorded).
- **Source schema & composition**: the overlays under `source/03-standards/schemas/src/schemas/v3/overlays/` and the deep-merge in `getTransactionSchema` (web app `src/pages/implementation/schema-composition.astro`) are the build-step the SHACL graph-union mirrors. The business glossary notes that `propertyPack` appears in 18 overlays and `address`/`attachments`/`ownership` in ~10 each — the spanning leaves a profile composition must reconcile.
- **Deliverables (when fleshed out)**: `profiles/baspi5.ttl` as the worked MVP slice (chosen for its discriminated `oneOf`/`sellersCapacity` stressing `sh:xone`); the `opda:ValidationContext` pattern; the no-identity-override SHACL gate; the composition build-step specification mirroring `getTransactionSchema`; the separate advisory-annotation graph keyed to shape IRIs (→ ONT-0013).
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation and graph separation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the identity crux whose keys an overlay may not touch [ONT-0005](./ONT-0005-property-land-identity-crux.md); the Seller/Buyer roles and `sellersCapacity` the BASPI discriminator constrains [ONT-0006](./ONT-0006-agents-and-roles.md); enumeration members surfaced via `sh:in` [ONT-0011](./ONT-0011-enumeration-vocabularies.md); SHACL severity, the no-identity-override gate, and the annotation-graph split [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); catalogue [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q5 (owned by Knublauch), with the rule-by-rule mapping in [`working/shacl-trio.md`](./council/working/shacl-trio.md).

## Vote and Dissent

Full deliberation in [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q5 and [`working/shacl-trio.md`](./council/working/shacl-trio.md).

- **Core mapping — 12-0.** Unanimous that overlays are SHACL profiles over a fixed TBox, not classes: required-array union → `sh:minCount 1`; enum union → a single *merged* `sh:in`; `oneOf` → `sh:xone` with `sh:qualifiedValueShape` on the discriminator; per-leaf refs → `dct:source` to a form-question IRI; DASH for rendering.
- **`opda:aiHint` — ≈7-2, Cagle dissent recorded.** Cagle argued for advisory LLM-consumer annotations inline in the shapes graph; Knublauch and Gandon refused any invented term that could masquerade as a SHACL constraint. Resolution: advisory annotations live in a *separate annotation graph* keyed to shape IRIs (consistent with the Q3 class/shapes/annotation separation). Knublauch/Gandon prevailed; Cagle's dissent stands.
- **SSSOM deferred — ≈5-4, Cagle dissent recorded** (Q2). The per-leaf `baspi5Ref` mapping uses `dct:source` now; SSSOM/`semapv:ManualMappingCuration` earns its place when mappings target *external* vocabularies (FIBO, INSPIRE). Cagle pushed to admit SSSOM immediately; the panel deferred.
- **Guizzardi's gate** — accepted: no overlay may declare or override a Kind's identity/key (ties to ONT-0005).
- **Devil's Advocate (Guarino) — DISAGREE, then WITHDRAWN.** Guarino held that "loaded profile = active requirement" promotes a build-config artefact to ontological status with no fixed model theory — `sh:minCount 1` becomes a function of which files a build call passed, and overlay order could even affect `oneOf`. The objection was **not dismissed**: it was resolved by reifying conditionality as a first-class `opda:ValidationContext`/profile node, so "required under the Conveyancer profile" is a coherent proposition rather than "required (depending)". Guarino **withdrew** on that reification amendment.
