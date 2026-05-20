# ODR 0005 — Property & Land: The Identity Crux

- **Status:** Proposed (planning stub — **the gating crux**, flesh out first)
- **Date:** 2026-05-20
- **Phase:** Spike (the gate — ODR-0006/0007/0008 do not start in anger until this clears)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q4 — the crux)

## Scope

Resolve the implicit-Property defect documented on `/schema/property` (page 37): UPRN appears in four leaf paths (`propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`), address in many more, plus INSPIRE ID and title-linked address — with **zero schema-level joins**. In ontological terms this is a missing class with no identity criterion.

The Council confirmed the **diagnosis unanimously** and converged on a **multi-class split**, but explicitly **deferred the identity criterion to this ODR as the programme's gate.** This ODR must settle it, validated against diagnostic exemplars, before downstream modules proceed.

## What this ODR MUST decide (Guarino's gate, Q4)

1. **Class cardinality.** Physical `opda:Property` distinct from the legal/registered thing. Resolve 2-class (Property + LegalEstate, Allemang) vs 3-class (+ separate RegisteredTitle, Hendler) vs Kendall's single-class-with-alternative-identifiers. Guizzardi: Property and RegisteredTitle are distinct **Kinds** (one property may bear multiple titles; extents need not coincide).
2. **DOLCE category commitment.** Commit each class explicitly to **Endurant** (physical thing) vs the legal-institutional object — do not leave it a Kind-pretending-to-be (Guarino).
3. **Identity criteria over the hard cases.** State the IC for the physical thing over **demolition, subdivision, merger, rebuild**; for the legal thing over **first registration** (an unregistered property has no title number yet). This is the OntoClean bar.
4. **UPRN's status.** Resolve the genuine split:
   - **SHACL/DASH uniqueness primary** (Cagle/Knublauch/Gandon): `dash:uniqueValueForClass true` on `opda:uprn` — *checkable*, fires a violation report, **degrades gracefully when UPRN is absent** (new-build, first-registration).
   - **`owl:hasKey` on the rigid Kind** (Guizzardi) — tidy but inert when UPRN is missing; never on a Role.
   - **Guarino:** UPRN is a *contingent administrative identifier* (retired/split/merged) and cannot be the IC; demote it to a scheme-scoped identifier with `prov:wasDerivedFrom` succession.
   - **Likely resolution:** SHACL/DASH uniqueness as operational key; `owl:hasKey` optional/secondary; UPRN modelled as identifier-not-IC with the real IC per (3).
5. **No `owl:sameAs`** to join the UPRN surfaces (unanimous — irreversible inference propagation). Use the key + SHACL co-reference or a controlled `opda:identifiesSameProperty`.

## Vocabularies

Core (OWL, RDFS, XSD), SHACL + DASH (`dash:uniqueValueForClass`), PROV-O (UPRN succession), OWL-Time (if interval-valued tenure enters here).

## Deliverables (when fleshed out)

`property.ttl` (Property + Title/Estate classes, ICs, keys); SHACL co-reference + uniqueness shapes; the **diagnostic-exemplar validation** (registered freehold house; unregistered pre-first-registration house; UPRN-split flat) that clears the gate; a migration note for the four existing UPRN references.

## Gate condition

Guarino withdraws his Q4 dissent **iff** (1)–(4) above are answered and validated against the exemplars. Until then, ODR-0006/0007/0008 stay in planning.
