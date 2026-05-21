---
status: proposed
date: 2026-05-20
tags: [property, identity, crux, dolce, shacl, gate]
supersedes: []
depends-on: [ONT-0004]
implements: [ONT-0003]
---

# Property & Land: The Identity Crux

## Context and Problem Statement

The PDTF v3 schema has no `Property` class. "The property" — the load-bearing thing every transaction is *about* — is reconstructed at read time from scattered surfaces with **zero schema-level joins**. UPRN appears in **four leaf paths** (`propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`); address appears in many more; there is an INSPIRE ID and a title-linked address; the data dictionary defines `uprn` only as "a unique identifier for the property" and carries an `isFirstRegistration` leaf ("Is this the first time the property is to be registered with HMLR?"). Four mentions of one referent, no join, no class. In ontological terms this is **a missing class with no identity criterion** — the implicit-Property defect documented on schema page 37.

Council Session 001 (Q4) confirmed the **diagnosis unanimously (12-0)** and converged on a **multi-class split** (the physical thing is distinct from the legal/registered thing). But it **explicitly DEFERRED the identity criterion to this ODR as the programme's gate.** This is the deliberate centre of the spike: an ontology whose central endurant has no identity criterion is, in Guarino's words, "not an ontology — it is a schema with RDF syntax." Until the identity criterion is settled and validated against the diagnostic exemplars (ONT-0004's harness), the module ODRs ONT-0006 (Agents & Roles), ONT-0007 (Transactions & Lifecycle), and ONT-0008 (descriptive attributes) stay in planning, because Property identity is shared with the Person/Organisation and Address work.

The question: **what classes carry the Property concept, to which foundational categories are they committed, what individuates each over the hard cases (demolition, subdivision, merger, rebuild; first registration), and what is UPRN — a checkable key or a contingent identifier?** This ODR records the *converged* council position and then states, without resolving, the four things it must still settle to clear the gate.

## Decision Drivers

* **Absent identity criteria are the one thing OntoClean forbids** (Guarino) — a class is a unary property *with an identity criterion*; declaring `opda:Property` responsibly means answering "same property?" over the cases that actually occur.
* **The deliverable must be checkable** (SHACL trio) — a trust framework must *report* a duplicate-UPRN error, not merely license an inference. The operational mechanism must fire a violation and degrade gracefully when UPRN is absent (new-build, pre-first-registration).
* **Identity violations corrupt every downstream join** (Guizzardi) — get the categorisation wrong and key declarations silently corrupt individuation; a Property without a resolvable key, or a Role with a key, is a non-negotiable error.
* **No irreversible inference** (Gandon, Hendler, Allemang, unanimous) — `owl:sameAs` across the UPRN surfaces would propagate every context's properties onto every other, irreversibly under inference. The join must be controlled.
* **UPRN is administratively contingent** (Guarino) — UPRNs are retired, split on subdivision, merged, and re-issued; an identifier that can be retired while its referent persists cannot be the identity criterion.
* **The gate is exemplar-validated** — the resolution is tested against a registered freehold house, an unregistered house pre-first-registration, and a flat whose UPRN was split, per ONT-0004's diagnostic-exemplar policy.

## Considered Options

The genuine fault lines from Q4. Two axes: **how many classes**, and **what is the key (and is UPRN even a key)**.

**(a) Class cardinality:**

* **One `opda:Property` Kind with alternative identifiers + SHACL co-reference** (Kendall) — the FIBO `LegalEntity`/LEI pattern: one class, multiple identifiers, co-reference enforced by shape rather than by multiplying classes.
* **Two classes: `opda:Property` (physical) + `opda:LegalEstate`** (Allemang), related by `opda:hasLegalEstate` — the physical referent and the alienable interest are not the same (leasehold flat over commercial premises: one property, freehold + leasehold + possibly head-leasehold estates).
* **Three classes: + a distinct `opda:RegisteredTitle`** (Hendler; Guizzardi treats Property and RegisteredTitle as distinct **Kinds**) — the Land Registry's record of an estate is a third thing with its own identity (the title number) and its own register lifecycle; one property may bear multiple titles and extents need not coincide. Hendler adds `LegalEstate` as a third entity instantiated on assertion.
* **Two endurants with explicit ICs** (Guarino) — a physical `Site/BuiltStructure` (IC: spatial-material continuity, *explicitly defined over demolition / subdivision / merger*) and a `LegalEstate` (IC: title-register identity), related by a time-indexed `realises`/`vests-in` relation, with UPRN and address demoted to `qua`-identifiers.

**(b) The key — and whether UPRN is one:**

* **`dash:uniqueValueForClass` on `opda:uprn` as the primary, *checkable* mechanism** (Cagle, Knublauch, Gandon) — fires a violation report and **degrades gracefully when UPRN is absent**, which `owl:hasKey` does not. Cagle's challenge to the rigid-Kind camp went unrebutted: "a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation, what does yours *do*?"
* **`owl:hasKey` on the rigid Kind** (Guizzardi) — UPRN keys `opda:Property`, title number keys `opda:RegisteredTitle`; **never on a Role** (a Proprietor has no identity *qua* Proprietor). Tidy, but inert when UPRN is missing (Gandon's caveat: valid only if UPRN is truly identifying).
* **UPRN is a contingent administrative identifier, not an IC** (Guarino) — demote UPRN and address to scheme-scoped identifiers with `prov:wasDerivedFrom` succession; the real IC is spatial-material continuity (physical) / register identity (legal).
* **No `owl:sameAs`** (unanimous) — across the four UPRN surfaces; use the key + SHACL co-reference, or a controlled `opda:identifiesSameProperty`, never `owl:sameAs`.

## Decision Outcome

**The converged council position (what is settled).** The following carried in Q4 and is recorded here as resolved:

- **An explicit Property class is unanimous.** The four-surface, zero-join defect is restored to a class.
- **A multi-class split** (≥2: a physical `opda:Property` distinct from the legal `opda:Title`/`opda:LegalEstate`). The physical referent and the registered/legal thing are not the same class.
- **The operational key is SHACL/DASH uniqueness** — `dash:uniqueValueForClass true` on `opda:uprn` is the **primary, checkable** mechanism: it fires a violation report and degrades gracefully when UPRN is absent. `owl:hasKey` is **optional/secondary**, a semantic annotation valid only where UPRN is truly identifying.
- **NO `owl:sameAs`** to join the UPRN surfaces (unanimous — irreversible inference propagation). The join uses the key + SHACL co-reference, or a controlled `opda:identifiesSameProperty`.
- **UPRN is modelled as a scheme-scoped *contingent* identifier** with `prov:wasDerivedFrom` succession (capturing retire/split/merge/re-issue), **not** as the identity criterion.

**What this ODR MUST still settle (the gate — deliberately not resolved here).** Q4 converged on the cure but **explicitly deferred the identity criterion**. The following four items are the gating requirements; this ODR records them as open and does not pre-empt the deliberation that will discharge them:

1. **Class cardinality: 2 vs 3.** Resolve `opda:Property` + `opda:LegalEstate` (Allemang) versus the addition of a distinct `opda:RegisteredTitle` (Hendler/Guizzardi as distinct Kinds), against Kendall's single-class-with-alternative-identifiers and Guarino's `Site/BuiltStructure` + `LegalEstate`. The exemplars decide: the multi-title flat and the unregistered house stress whether two classes suffice or a third is forced.
2. **Explicit DOLCE category commitment per class.** Commit each class explicitly to **Endurant** (the physical thing, present in full at every moment) versus the legal-institutional object — do not leave it a Kind-pretending-to-be (Guarino). The disjunction Endurant-vs-Quale must be made, not finessed.
3. **The identity criterion over the hard cases.** State the IC for the physical thing over **demolition, subdivision, merger, rebuild**, and for the legal thing over **first registration** (an unregistered property has no title number yet). This is the OntoClean bar and the substance of the gate.
4. **UPRN's precise status.** Confirm UPRN as the checkable operational key (SHACL/DASH) *and* a contingent scheme-scoped identifier under `prov:wasDerivedFrom` succession — and state precisely how that coexists with the real IC from (3), so that the key is operationally load-bearing without being mistaken for the criterion of identity.

These four are **not resolved in this record**. They are the gate. The council convergence sets the cure; the identity criterion is the thing the follow-up session must settle against the exemplars before the cure is sound.

### Consequences

* Good, because the diagnosis and the cure's shape (explicit class, multi-class split, checkable SHACL key, no `owl:sameAs`, UPRN-as-contingent-identifier) are settled unanimously, so the follow-up deliberation is bounded to the identity-criterion question rather than re-opening the whole defect.
* Good, because choosing SHACL/DASH uniqueness as the *primary* mechanism makes the contract checkable — a duplicate UPRN fires a violation — while degrading gracefully for new-builds and pre-first-registration properties that have no UPRN.
* Good, because forbidding `owl:sameAs` prevents the irreversible cross-context inference propagation that all four of the practitioner experts independently warned against.
* Bad, because the identity criterion itself is unresolved, so this ODR **gates** ONT-0006/0007/0008 — they stay in planning until the gate clears, which serialises the programme behind this one question (by design — spike-then-scale, Q7).
* Bad, because the class cardinality (2 vs 3) is genuinely open, so the TBox cannot be frozen until the exemplars force the count; a premature freeze risks either an under-modelled legal layer or a needless third class.
* Neutral, because UPRN succession is modelled with PROV-O (`prov:wasDerivedFrom`), introducing a provenance dependency that is shared with the claims/evidence layer (ONT-0009) rather than local to Property.
* Neutral, because the unrebutted Cagle-vs-Guizzardi challenge (the inert rigid-Kind key) biases the *operational* mechanism toward SHACL without settling the *foundational* category — the two are deliberately decoupled here.

### Confirmation

**This is the gate.** Guarino withdraws his Q4 dissent **if and only if** items (1)–(4) of the Decision Outcome are answered **and validated against the three diagnostic exemplars** (ONT-0004's harness):

- a **registered freehold house** — the straightforward case: physical Property + a registered title with a title number;
- an **unregistered house pre-first-registration** — `isFirstRegistration = Yes`: there is no title number yet, so a title-based IC must not strand it (tests item 3's legal-side IC and item 1's cardinality);
- a **flat whose UPRN was split** — UPRN retired/split by the addressing authority while the physical thing persists (tests item 4: UPRN cannot be the IC; succession must be modelled).

The resolution clears the gate when each exemplar (a) instantiates the committed classes with explicit DOLCE categories, (b) has a stated identity criterion that gives the right answer over its hard case, and (c) keys via `dash:uniqueValueForClass` where a UPRN exists and degrades gracefully where it does not, with UPRN succession captured by `prov:wasDerivedFrom` and no `owl:sameAs` anywhere. **Until the gate clears, ONT-0006, ONT-0007, and ONT-0008 stay in planning.**

## Pros and Cons of the Options

### One Property Kind with alternative identifiers + SHACL co-reference (Kendall)

* Good, because the FIBO LEI pattern is proven enterprise practice and avoids multiplying classes for what consumers think of as one thing.
* Bad, because it strains when the physical referent and the legal interest genuinely diverge (multi-title flat, commonhold), and risks re-conflating physical and legal identity inside one class.

### Two classes: Property (physical) + LegalEstate (Allemang)

* Good, because it cleanly separates the physical referent from the alienable interest, with `owl:hasKey (opda:uprn)` for the physical case and a SHACL `sh:or` for the address fallback, and avoids `owl:sameAs`.
* Bad, because it does not give the Land Registry's *record* (the registered title) its own identity, which Hendler and Guizzardi argue is a third thing with its own lifecycle.

### Three classes: + RegisteredTitle (Hendler / Guizzardi)

* Good, because it models the common edge cases faithfully — first registration (a property with no title yet), multi-title properties, title-by-title chains, commonhold — by giving the title number its own keyed Kind.
* Bad, because the third class adds modelling and validation surface, and the 2-vs-3 boundary is exactly what the exemplars must justify rather than assume.

### Two endurants with explicit ICs: Site/BuiltStructure + LegalEstate (Guarino)

* Good, because it states the identity criterion directly — spatial-material continuity for the physical thing (defined over subdivision/merger), register identity for the legal thing — which is precisely the OntoClean bar the gate demands.
* Bad, because it is the most demanding to author and validate, and the relationship (`realises`/`vests-in`, time-indexed) introduces temporal structure (OWL-Time, ONT-0014) that the simpler splits avoid.

### `dash:uniqueValueForClass` primary vs `owl:hasKey` on the rigid Kind

* Good (DASH), because it is checkable, reports duplicates, and degrades gracefully when UPRN is absent — the unrebutted advantage Cagle pressed on Guizzardi.
* Good (`owl:hasKey`), because it is the strongest identity assertion available in standard OWL 2 tooling for a rigid Kind, and is semantically precise where UPRN is genuinely identifying.
* Bad (`owl:hasKey` as primary), because it only *licenses inference* and is inert for a consumer whose record has no UPRN — it does nothing for the new-build / first-registration case the schema explicitly flags.
* Bad (either as the *criterion*), because UPRN is administratively contingent (retired/split/merged/re-issued); treating any key as the identity criterion confuses an identifier with the bearer (Guarino).

## More Information

- **Vocabularies**: Core (OWL/RDFS/XSD); SHACL + DASH (`dash:uniqueValueForClass` for the checkable uniqueness key); PROV-O (`prov:wasDerivedFrom` for UPRN succession); OWL-Time (Conditional, ONT-0014) **if** interval-valued tenure (lease terms, proprietorship intervals) is modelled here or deferred to ONT-0007. Term semantics and `dct:source` follow the term-sourcing convention in [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) — `uprn` sources its `rdfs:comment` from the data dictionary leaf, INSPIRE/UPRN concepts align to external authorities.
- **The four UPRN surfaces** (the migration target): `propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn` — confirmed in the compact skeleton; address and INSPIRE ID add further surfaces. A migration note records how each existing reference resolves to the new class via the co-reference key.
- **Deliverables (when fleshed out)**: `property.ttl` (Property + Title/LegalEstate classes with their committed DOLCE categories, ICs, and keys); SHACL **co-reference + uniqueness shapes** (`dash:uniqueValueForClass` on `opda:uprn`, co-reference via `opda:identifiesSameProperty`); the **diagnostic-exemplar validation** that clears the gate (registered freehold house; unregistered pre-first-registration house; UPRN-split flat); a **migration note** for the four existing UPRN references.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); the foundation it builds on (URI policy, graph separation, exemplar harness, term-sourcing) is [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the gated modules are [ONT-0006](./ONT-0006-agents-and-roles.md) (shared Person/Organisation identity + Address) and [ONT-0008](./ONT-0008-property-descriptive-attributes.md) (descriptive leaves hang off the Property class). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q4 (the crux).

## Vote and Dissent

- **Diagnosis: 12-0.** All twelve voices hold that the four-surface, zero-join Property is a missing class with no identity criterion. This is settled.
- **Cure converges, but the IC question is explicitly deferred — not closed.** Q4 reached convergence on a multi-class split, SHACL/DASH uniqueness as the primary checkable key, `owl:hasKey` optional/secondary, no `owl:sameAs`, and UPRN-as-contingent-identifier. The **identity criterion itself was deferred to this ODR as the programme's gate** (Guarino's anchor objection was *not dismissed* — it sets the bar).
- **Guarino's anchor objection, held as the gate.** UPRN cannot be a rigid identity criterion (it is retired/split/merged/re-issued); address-as-key is worse (a mode of presentation, not a bearer). The defensible move is two endurants with explicit ICs. **Withdrawal condition:** commit each entity to Endurant + state an IC over the hard cases + demote UPRN to a contingent identifier, validated against the exemplars. This condition is now this ODR's gating requirement (items 1–4).
- **The unrebutted challenge.** Cagle to Guizzardi: "a rigid Kind with `owl:hasKey` is inert for a consumer with no UPRN; mine produces a violation, what does yours *do*?" — recorded as unrebutted, and the reason the *operational* key is SHACL/DASH while `owl:hasKey` is at most a secondary semantic annotation.
- Full transcript and per-expert positions: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q4 and `council/working/{guarino-da,guizzardi,allemang-hendler,shacl-trio,kendall-davis}.md`.
