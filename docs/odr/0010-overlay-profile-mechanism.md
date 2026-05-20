# ODR 0010 — Overlay Profile Mechanism

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Cross-cutting (the BASPI5 slice is part of MVP)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q5 — owned by Knublauch)
- **Dependencies:** ODR-0004, ODR-0005, ODR-0011, ODR-0013

## Scope

How the JSON Schema form overlays (BASPI4/5, TA6/7/10, NTS/NTS2, CON29R/DW, LLC1, LPE1, FME1) — currently composed by `getTransactionSchema`'s deepmerge — become **named SHACL profiles** over the one fixed TBox. No overlay declares classes; overlays *constrain* (Kendall's FIBO jurisdictional-profile pattern).

### Knublauch's canonical mapping

1. **required-array union → `sh:minCount 1`** property shapes — additive on graph union.
2. **enum union → a single merged `sh:in`** — replace the node with the union list at build time; do **not** stack two `sh:in` (that's intersection, the opposite of intent). Documented as a **profile-composition build rule, not an OWL entailment** (Gandon).
3. **`oneOf` → `sh:xone`** (faithful exactly-one) with `sh:qualifiedValueShape` on the discriminator (`role`, `sellersCapacity`); `sh:or` only for "at least one."
4. **per-leaf `baspi5Ref`/`ntsRef` → `dct:source`** to a minted form-question IRI (`…/forms/baspi5#B1.3.2`); SSSOM only if/when admitted (deferred per Q2; Cagle dissent recorded).
5. **DASH rendering** — `dash:propertyRole`/`viewer`/`editor`, `sh:order`/`sh:group` reproduce the form. Loading BASPI5 yields a graph that both validates a transaction *and* generates the form — the canonical round-trip.

### Council amendments

- **`opda:ValidationContext` reified** (Guarino's withdrawal condition, accepted): a profile is a first-class node; `sh:minCount 1` is a constraint *of a named context* ("required under the Conveyancer profile"), not a free-floating axiom whose truth depends on build-call arguments.
- **No-identity-override gate** (Guizzardi): a SHACL gate must reject any overlay that declares or overrides a Kind's identity/key.
- **Dereferenceable profile URIs** (Hendler/Davis): `…/profiles/baspi5/` returns a working shapes graph; form-question IRIs dereference too.
- **No `opda:aiHint` in the shapes graph** (Knublauch/Gandon prevail over Cagle): advisory LLM-consumer annotations live in a *separate annotation graph* keyed to shape IRIs (→ ODR-0013).

## Vocabularies

SHACL (profiles), DASH (rendering), Core (`dct:source`), SKOS (enum members via ODR-0011); SSSOM deferred.

## Deliverables (when fleshed out)

`profiles/baspi5.ttl` as the worked MVP slice (chosen because its discriminated `oneOf`/`sellersCapacity` stresses `sh:xone`); the `opda:ValidationContext` pattern; the no-identity-override SHACL gate; the composition build-step spec mirroring `getTransactionSchema`.
