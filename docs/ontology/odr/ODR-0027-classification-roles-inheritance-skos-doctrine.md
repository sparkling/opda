---
status: accepted
date: 2026-06-01
kind: architecture
tags: [classification, inheritance, roles, skos, facets, ufo, doctrine]
scope: []
supersedes: []
depends-on: [ODR-0005, ODR-0006, ODR-0008, ODR-0009, ODR-0011, ODR-0025, ODR-0026]
implements: [ODR-0003]
---

# Classification, Roles, Inheritance, and SKOS — opda Modelling Doctrine

## Context and Problem Statement

opda's classification practice had drifted into imprecise vocabulary and an inconsistent mechanism. Council session-036 codified an OntoClean "load-bearing cascade" in ODR-0011 §8a but (a) used "facet" loosely to mean "a coded-value classification," conflating two distinct ideas, and (b) concluded that the evidence sub-types should stay `rdfs:subClassOf opda:Evidence` even though opda's own model calls evidence "a role a document plays." The directing authority directed opda to **adopt an established classification-over-inheritance modelling doctrine wholesale** (the prior-art source is recorded in §More Information) and to record it completely — facets, roles, inheritance, SKOS, and the boundaries between them.

That prior-art corpus settles this with a set of ratified, mutually-reinforcing decisions: multi-faceted classification (classification axes are SKOS-backed coded annotations — a body of work that *fixed 13 `rdfs:subClassOf` hierarchies that incorrectly modelled Roles as Kinds*); domain/range are documentation, never evaluated, SHACL enforces; every enumeration is a SKOS concept scheme, never an OWL subclass enumeration; roles via a `roleOf` relation, not subclassing; a role-specific property is *borne by* the role, not the Kind; and UFO Role/Phase stereotypes are SKOS concept schemes ("encode as OWL classes with subclass relationships" was rejected). This ODR is opda's adoption record and single doctrinal home for the distinctions; the specific prior-art records are cited in §More Information.

## Considered Options

* **Option A (chosen) — Adopt the classification-over-inheritance doctrine wholesale** (from established prior art, §More Information). Classification by coded set-membership by default; `rdfs:subClassOf` only for genuine Kinds; Roles never subclassing; every enumeration a `skos:ConceptScheme`.
* **Option B — Keep the session-036 dual layer (subclasses + coded facet) for evidence.** Rejected by directing authority: it retains `isA` for a Role, contradicting the classification-over-inheritance doctrine being adopted (the prior art holds "evidence is a role"; see §More Information).
* **Option C — Mint one OWL subclass per evidence kind (status quo ante).** Rejected: subclass-per-coded-value is the documented "Role-as-subclass" anti-pattern (the prior-art 13-error fix, §More Information); the kind is an `isMemberOf` axis.
* **Option D — A "facet" property that also asserts the type.** Rejected: conflates classification with attribute-bearing (R2); the type is `isMemberOf`, the attributes are the facet.
* **Option E — Mirror the prior art's seven separate ODRs (one per concern).** Rejected: opda records the doctrine once here, cross-referencing the existing per-concern ODRs rather than forking seven parallel records.

## Decision Outcome

Chosen option: "Option A — Adopt the classification-over-inheritance doctrine wholesale", because it is a ratified, decade-stable practice of the adopted prior-art corpus (§More Information), grounded in ISO 25964 faceted classification, W3C SKOS, FIBO, and OntoClean/UFO.

opda adopts the classification-over-inheritance doctrine: **classification (what type a thing is) is done by coded set-membership (`isMemberOf` a SKOS concept scheme) by default, and by inheritance (`isA` / `rdfs:subClassOf`) only for genuine Kinds that carry their own identity criterion; Roles are anti-rigid and are NEVER `rdfs:subClassOf` a Kind; a *facet* is the type-specific attributes an entity of a given type bears (it presupposes the type, it does not assign it); and every controlled vocabulary / enumeration / classification axis is a `skos:ConceptScheme` coded value, never a subclass tree** — justified because it is the ratified, decade-stable practice of the adopted prior-art corpus (§More Information), grounded in ISO 25964 faceted classification, W3C SKOS, FIBO, and OntoClean/UFO.

### Consequences

* **Amend ODR-0011 §8a** to state R1–R5 as the governing doctrine (the cascade is the `isA`-admission test); cross-reference this ODR as the doctrinal home.
* **Re-model the evidence domain (ODR-0009 + the emitter, ADR-0011/0012):** retire the three `…Evidence rdfs:subClassOf opda:Evidence` axioms; keep `opda:AttachedDocument` as the genuine Kind; make `opda:evidenceType` the `isMemberOf` classifier; re-home kind-specific attributes as role-borne facets; re-key all SHACL value-keyed; re-type the exemplars; re-point the DPV records onto `opda:evidenceType`. Reverses session-036's keep-the-subclasses disposition (R6).
* **Audit the corpus** for any remaining Role/Phase/enumeration modelled as `rdfs:subClassOf` (the prior-art Role-as-subclass audit applied to opda, §More Information): Seller/Buyer/Proprietor already correct; the evidence tree is the known case; record any others found.
* Genuine Kinds keep `isA`: `opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle`, `opda:AttachedDocument`, `opda:Organisation`/`Person`, `opda:Address`, the activity/relator/interval types — all unaffected.
* Update the session-036 record + adoption.md to note the directing-authority adoption + the R6 reversal. Status `accepted` (directing-authority ratified; greenfield — no WG gate, ODR-0003 programme retired).

## More Information

- Adopted prior art — the source the §Context/§Considered-Options/§Rules prior-art references defer to (hm `~/source/hm/semantic-modelling/docs/ontology/odr/`): hm ODR-0010 (multi-faceted classification; **the 13 Role-as-subclass fixes** cited in §R1/§R3 and the Consequences audit; its title is the "facet = classification axis" usage noted in §R2), hm ODR-0014 (domain/range as documentation — the §R5 anchor), hm ODR-0016 (SKOS for enumerations), hm ODR-0023 (enumeration modelling pattern — the §R4 anchors), hm ODR-0025 (role-view modelling), hm ODR-0026 (property distribution / role-borne properties — the "borne by the role, not the Kind" principle stated in §R2), hm ODR-0092 (UFO stereotypes as SKOS schemes — §R3/§R4 anchor).
- Consolidating doctrine: [ODR-0033](ODR-0033-owl-axioms-as-documentary-ai-signal-doctrine.md) — this record's §R5 (`rdfs:domain`/`range` are documentation; SHACL enforces) is one of the fragments it gathers into the single "author OWL/RDFS axioms as documentary AI-signal, never entailed" doctrine.
- opda records governed/amended: [ODR-0011](ODR-0011-enumeration-vocabularies.md) §8a (the cascade — the `isA`-admission test), [ODR-0009](ODR-0009-claims-evidence-provenance.md) (evidence re-model), [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md)/[ODR-0026](ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md) (domain/range unevaluated; value-keyed), [ODR-0005](ODR-0005-property-land-identity-crux.md) (identity criteria; no `owl:sameAs`), [ODR-0006](ODR-0006-agents-and-roles.md) (RoleMixin/Role precedent), [ODR-0008](ODR-0008-property-descriptive-attributes.md) §Q5a (coded value-spaces).
- Council [session-036](council/session-036-classification-over-inheritance.md) — the cascade + value-keyed enforcement (stand); its keep-the-`…Evidence`-subclasses disposition is superseded here (R6).
- Foundational: Guarino & Welty 2009 (OntoClean); Guizzardi 2005 (UFO); ISO 25964 / W3C SKOS (faceted classification); FIBO (SKOS schemes alongside OWL classes).

## Rules

### R1 — Classification: `isA` vs `isMemberOf` (the two mechanisms)

**Classification** answers *"what type/kind is this entity?"* and has exactly two legitimate mechanisms:

- **`isMemberOf` (set membership / coded SKOS value) — the DEFAULT.** The entity carries a coded value (a `skos:Concept` notation) on a classifier property; the value's vocabulary is a `skos:ConceptScheme`. One class, a value that varies. Enforced by SHACL `sh:in` (typically via `sh:targetSubjectsOf` the classifier property, entailment-free — the `opda:ownerType`/`opda:tenureKind` idiom).
- **`isA` (inheritance / `rdfs:subClassOf`) — the EXCEPTION.** Mint an OWL subclass **only** when the sub-type is a genuine **Kind** carrying **its own identity criterion** (a distinct way its instances are individuated) and/or a distinct relational structure SHACL must enforce per-type. Per ODR-0011 §8a's OntoClean cascade: anti-rigid → never a subclass; `+R∧−I` → classify (coded); `+R∧+I∧+D` → Relator; `+R∧+I∧−D` → subclass.

A type-distinction failing the `isA` test is modelled `isMemberOf` (coded). Minting a subclass per coded value is the anti-pattern (ODR-0011 §Alternatives; ODR-0024 §R4 "namespace landmines"; and the prior-art Role-as-subclass fix cited in §More Information).

### R2 — A facet is NOT a classification

A **facet** is the **set of type-specific attributes an entity of a given type bears** — it *presupposes* the entity's type and says nothing about what that type is. `opda:attestedBy` (borne by evidence playing the vouch role), `opda:documentReference`, `opda:apiEndpoint` are facets. **`opda:evidenceType` is NOT a facet — it is an `isMemberOf` classifier** (it states the kind). Do not call a classifier a "facet." A facet's attributes are *borne by* the type/role that bears them — a role-specific property is borne by the role, not the Kind (prior art, §More Information) — declared with `rdfs:domain` on the most-specific class/role that introduces them.

> **Terminology note (overload).** The library-science / ISO-25964 / Ranganathan tradition uses "facet" to mean *an orthogonal classification axis* — the opposite of this rule's sense. **opda's canonical meaning is this rule's: facet = type-borne attributes.** When an orthogonal classification axis is meant, opda says "classification axis" or "coded scheme," never "facet."

### R3 — Roles are anti-rigid → NEVER `rdfs:subClassOf` a Kind

A **Role** is anti-rigid (an instance plays it contingently and can cease to). It is modelled as `opda:Role` / `opda:RoleMixin` borne via a `roleOf` / `playedBy` relation (founded by the relevant Relator/Activity), with a coded `isMemberOf` classifier where the role sub-divides — **never** `rdfs:subClassOf` the bearer Kind (the prior art fixed exactly this error 13 times; §More Information). opda already does this correctly for `opda:Seller`/`opda:Buyer` (`opda:RoleMixin`) and `opda:Proprietor` (`opda:Role`); the doctrine generalises it.

### R4 — SKOS for every controlled vocabulary / enumeration / classification axis

Every closed value-space, enumeration, status set, kind-discriminator, and UFO-stereotype axis is a `skos:ConceptScheme` of `skos:Concept`s, referenced by a coded value — **never** an `owl:oneOf` bag and **never** an `rdfs:subClassOf` subclass enumeration (opda ODR-0011; prior art in §More Information). A scheme member binds to a genuine OWL Kind by `skos:exactMatch` (the dual layer) **only where that Kind independently earns `isA` per R1** — never `owl:sameAs` (ODR-0005 §R5).

### R5 — `rdfs:domain`/`rdfs:range` are documentation; SHACL enforces; enforcement is value-keyed

`rdfs:domain`/`range` are informative (multi-domain reads as union), never evaluated (opda ODR-0025 §R2 / ODR-0026; the consolidated documentary-axiom doctrine is ODR-0033; prior art in §More Information). SHACL is the enforcement layer, and enforcement of per-type obligations is **value-keyed** on the `isMemberOf` classifier (`sh:targetSubjectsOf` + a value-guarded `sh:or(¬P ∨ Q)` material implication, SHACL-Core), **not** keyed on a subclass `sh:targetClass` (which is entailment-relative and silently passes a value-recorded instance — session-036; Knublauch). Class-targeting is correct in **one** place: a type↔value coherence shape (the class MUST carry its matching code).

### R6 — Partial supersession of session-036 for the evidence model (directing-authority adoption)

Council session-036 concluded `opda:DocumentEvidence`/`ElectronicRecordEvidence`/`VouchEvidence` should remain `rdfs:subClassOf opda:Evidence`. **That conclusion is superseded for the inheritance question by this ODR's R1/R3**, on the directing authority's adoption of the classification-over-inheritance doctrine: opda's own model states **"evidence is a role a document plays, not every document's Kind"** — so evidence-hood is a **Role**, and by R3 a Role is never `rdfs:subClassOf`. Therefore:

- `opda:Evidence` is the role target (a `RoleMixin`); **evidence-kind is an `isMemberOf` coded classification** (`opda:evidenceType` → `opda:EvidenceMethodScheme`), not a subclass tree.
- The three `…Evidence` `rdfs:subClassOf opda:Evidence` axioms are **retired**; kind-specific attributes (`opda:attestedBy`, document/record specifics) become **facets borne by the role** (R2), enforced value-keyed on `opda:evidenceType` (R5).
- The one genuine **Kind** in the family — `opda:AttachedDocument` (its own IC: content + issuing activity, ODR-0024 §R7) — **stays an OWL class** (it earns `isA` per R1); a document *plays* the evidence role, it is not sub-classed into it.
- `VouchEvidence`'s attestation, being an Agent-founded **Relator** (`+R∧+I∧+D`), is modelled as a Relator/role-borne structure, not a subclass of Evidence.

session-036's *value-keyed enforcement* finding and the ODR-0011 §8a cascade stand and are reinforced; only its keep-the-`…Evidence`-subclasses disposition is reversed.

