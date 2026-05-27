---
status: proposed
date: 2026-05-20
kind: pattern
tags: [property, identity, crux, dolce, shacl, gate]
scope: [pdtf-v3:propertyPack.uprn, pdtf-v3:propertyPack.address, pdtf-v3:energyEfficiency.certificate.uprn, pdtf-v3:chain.onwardPurchase.uprn, pdtf-v3:valuationComparisonData.propertyDetails.uprn, pdtf-v3:propertyPack.isFirstRegistration]
council: session-001
supersedes: []
depends-on: [ODR-0004]
implements: [ODR-0003]
---

# Property & Land: The Identity Crux

## Context

PDTF v3 has no `Property` class. The thing every transaction is *about* is reconstructed at read time from scattered surfaces with zero schema-level joins: UPRN appears in four leaf paths (`propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`); address appears in many more; INSPIRE ID and title-linked address add further surfaces; the data dictionary defines `uprn` only as "a unique identifier for the property" and carries an `isFirstRegistration` leaf. In ontological terms this is a missing class with no identity criterion — the implicit-Property defect.

Council Session 001 (Q4) confirmed the diagnosis unanimously (12-0) and converged on a multi-class split, but explicitly **deferred the identity criterion to this ODR as the programme's gate**. An ontology whose central endurant has no identity criterion is, in Guarino's words, "not an ontology — it is a schema with RDF syntax." Until the IC is settled and validated against ODR-0004's diagnostic exemplars, ODR-0006/0007/0008 stay in planning.

## Decision

Adopt the multi-class Property pattern converged in Q4: an explicit `opda:Property` class distinct from the legal/registered thing (`opda:LegalEstate`/`opda:RegisteredTitle`), keyed operationally by SHACL/DASH uniqueness on UPRN with graceful degradation, joined via co-reference (never `owl:sameAs`), and with UPRN modelled as a contingent scheme-scoped identifier under `prov:wasDerivedFrom` succession — chosen because it is checkable, degrades gracefully for new-builds and pre-first-registration cases, and avoids irreversible cross-context inference propagation.

## Rules

**Settled rules (the cure).** These are normative for the Property module:

1. **Explicit Property class.** The four-surface, zero-join defect is restored to a class. No implicit-Property.
2. **Multi-class split (≥2).** A physical `opda:Property` distinct from the legal `opda:Title`/`opda:LegalEstate`. The physical referent and the registered/legal thing are not the same class. Final cardinality (2 vs 3) is gated — see below.
3. **Operational key is SHACL/DASH uniqueness.** `dash:uniqueValueForClass true` on `opda:uprn` is the **primary, checkable** mechanism: it fires a violation report and degrades gracefully when UPRN is absent.
4. **`owl:hasKey` is optional/secondary** — a semantic annotation valid only where UPRN is truly identifying. Never on a Role.
5. **No `owl:sameAs`** across the UPRN surfaces (unanimous — irreversible inference propagation). Join uses the key + SHACL co-reference, or a controlled `opda:identifiesSameProperty`.
6. **UPRN is a contingent identifier**, not the IC. Model retire/split/merge/re-issue via `prov:wasDerivedFrom` succession.

**Anti-patterns (forbidden):**

- `owl:sameAs` between any two UPRN-bearing nodes.
- `owl:hasKey (opda:uprn)` as the *sole* identity mechanism (inert when UPRN is absent — Cagle's unrebutted challenge to Guizzardi).
- A keyed Role (a Proprietor has no identity *qua* Proprietor).
- Treating UPRN or address as the identity criterion (they are administratively contingent / a mode of presentation).

**Gate conditions (this ODR's load-bearing precondition).** Four items are deliberately not resolved here; the follow-up session discharges them against ODR-0004's exemplars before the cure is sound:

1. **Class cardinality: 2 vs 3.** Resolve `opda:Property` + `opda:LegalEstate` versus the addition of a distinct `opda:RegisteredTitle`. The multi-title flat and the unregistered house decide.
2. **Explicit DOLCE category commitment per class.** Commit each class to Endurant vs legal-institutional object — no Kind-pretending-to-be.
3. **The identity criterion over the hard cases.** State the IC for the physical thing over demolition, subdivision, merger, rebuild; for the legal thing over first registration.
4. **UPRN's precise status.** Confirm UPRN as the checkable operational key *and* a contingent scheme-scoped identifier under `prov:wasDerivedFrom`, and state precisely how that coexists with the real IC from (3).

**Gate-clearance criteria (enforcement).** The gate clears when each of the three diagnostic exemplars — a registered freehold house, an unregistered house pre-first-registration (`isFirstRegistration = Yes`), and a flat whose UPRN was split — satisfies:

- (a) instantiates the committed classes with explicit DOLCE categories;
- (b) has a stated identity criterion that gives the right answer over its hard case;
- (c) keys via `dash:uniqueValueForClass` where a UPRN exists and degrades gracefully where it does not, with UPRN succession captured by `prov:wasDerivedFrom` and no `owl:sameAs` anywhere.

**Until the gate clears, ODR-0006, ODR-0007, and ODR-0008 stay in planning.** Guarino's Q4 dissent is withdrawn iff items (1)–(4) are answered and exemplar-validated.

## Alternatives

- **One `opda:Property` Kind with alternative identifiers + SHACL co-reference (Kendall, FIBO-LEI pattern)** — strains when physical referent and legal interest diverge (multi-title flat, commonhold), risking re-conflation of physical and legal identity in one class.
- **Two classes: Property (physical) + LegalEstate (Allemang)** — does not give the Land Registry's *record* its own identity, which Hendler/Guizzardi argue is a third thing with its own lifecycle.
- **Three classes: + RegisteredTitle (Hendler / Guizzardi)** — adds modelling and validation surface; the 2-vs-3 boundary is exactly what the exemplars must justify rather than assume.
- **Two endurants with explicit ICs: Site/BuiltStructure + LegalEstate (Guarino)** — most demanding to author and validate; the time-indexed `realises`/`vests-in` relation introduces OWL-Time dependency (ODR-0014) the simpler splits avoid.
- **`owl:hasKey` on the rigid Kind as primary** — only *licenses inference* and is inert for a consumer whose record has no UPRN; does nothing for the new-build / first-registration case.
- **`owl:sameAs` across UPRN surfaces** — propagates every context's properties onto every other, irreversibly under inference (unanimous rejection).

## Consequences

- The follow-up deliberation is bounded to the IC question — do not re-open the diagnosis or the cure's shape.
- Implement `dash:uniqueValueForClass` on `opda:uprn` and verify a duplicate UPRN fires a SHACL violation; verify graceful degradation when UPRN is absent.
- ODR-0006, ODR-0007, ODR-0008 remain in planning until the gate clears (programme is serialised behind this question — by design, spike-then-scale).
- Do not freeze the TBox before the exemplars force class cardinality; a premature freeze risks an under-modelled legal layer or a needless third class.
- UPRN succession introduces a PROV-O dependency shared with the claims/evidence layer (ODR-0009).
- Person/Organisation identity (ODR-0006) and Address modelling inherit this ODR's identity discipline — apply the same SHACL-primary, no-`owl:sameAs` rule.
- Deliverables to produce on gate clearance: `property.ttl` (classes with DOLCE categories, ICs, keys); SHACL co-reference + uniqueness shapes; the three-exemplar validation; a migration note for the four existing UPRN references.

## References

- **Target versions**: RDF 1.2 and SHACL 1.2, per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: Core (OWL/RDFS/XSD); SHACL + DASH (`dash:uniqueValueForClass`); PROV-O (`prov:wasDerivedFrom`); OWL-Time (Conditional, [ODR-0014](./ODR-0014-temporal-modelling-policy.md)) if interval-valued tenure is modelled here or deferred to ODR-0007. Term semantics and `dct:source` follow the term-sourcing convention in [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md).
- **The four UPRN surfaces**: `propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`; address and INSPIRE ID add further surfaces.
- **Related**: programme anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md); gated modules [ODR-0006](./ODR-0006-agents-and-roles.md) (shared Person/Organisation identity + Address) and [ODR-0008](./ODR-0008-property-descriptive-attributes.md) (descriptive leaves).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q4 (the crux); per-expert working notes under `council/working/{guarino-da,guizzardi,allemang-hendler,shacl-trio,kendall-davis}.md`.
