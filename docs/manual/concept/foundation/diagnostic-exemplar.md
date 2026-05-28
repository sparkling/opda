# Diagnostic Exemplar

A Diagnostic Exemplar is a minimal worked-example dataset that exposes exactly one Identity-Criterion-bearing surface, used as input to a Council session's validation of that Identity Criterion.

## Why it matters

Exemplars are how the Linked Data Council pressure-tests an Identity Criterion before it ratifies it. A modelling proposal that survives a registered freehold house but breaks on an unregistered house pre-first-registration is *not* ratified until the breakage is reconciled. Diagnostic Exemplars are the receipts for that pressure-testing — they exist so a reviewer can replay the original test and confirm the IC still discharges its hard cases.

If you are a Council member, an ontology integrator, or an auditor checking why a particular IC was chosen, you want the Exemplar that ratified it.

## Hard cases

- **Registered freehold house.** The textbook case — title-number lineage holds, UPRN is stable, address is canonical. The Exemplar exists so the IC's behaviour on the boring case is not assumed.
- **Unregistered house pre-first-registration.** No HMLR title number. The Exemplar forces the IC to handle the absence of registry evidence without collapsing identity.
- **Flat with split UPRN.** One physical flat receives a UPRN split into two address-records. The Exemplar forces the IC to choose between collapsing identity (one Property) and splitting it (two Properties).

## Identity Criterion

Each Diagnostic Exemplar is identified by the **named hard case** it exposes — the case-name (e.g. "unregistered house pre-first-registration") plus the minimum data needed to make that case concrete. Two Exemplars are the same Exemplar only if they expose the same named hard case with byte-identical content. See the [Logical tier →](../../logical/foundation/diagnostic-exemplar.md) for the field-level shape.

## Related Kinds

- [Generator Run](./generator-run.md) — the build pipeline emits Exemplars alongside the ontology TTLs, paired so every emission is reproducible from a recorded (version, commit) pair
- [Validation Context](./validation-context.md) — overlay profiles are validated against Exemplars before the profile is ratified

## Source ODR

[ODR-0004 — PDTF ontology foundation §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
