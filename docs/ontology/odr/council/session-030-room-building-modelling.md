# Council Session 030 (R3) — Room/Building: model as a by-value structure, mint no Kinds (Full panel, 8 voices)

- **Date:** 2026-05-31
- **Records:** Discharges [ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) **R3** (`opda:Building` / `opda:Room` class promotion, [ODR-0008](../ODR-0008-property-descriptive-attributes.md) §Q4a) under a **directing-authority override** of the held re-identification trigger. **No new ODR / no new ADR** — the verdict **amends existing records** (the monetary-walk / R5 precedent: a rule inside ODR-0024 + a register entry in ADR-0005, never a fresh record per decision): revises [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) **R10**, strikes ODR-0023 **R3**, updates [ADR-0005](../../adr/ADR-0005-deferred-work-register.md) **§G24**, notes ODR-0008 §Q4a. **No implementation this session** — the realisation is recorded as a spec for a future emission task.
- **Queen:** Elisa Kendall (FIBO / real-property; class-vs-datum). **Devil's Advocate:** Kurt Cagle ("structured value, not a class" — the roster-named DA for class-promotion propositions).
- **Panel:** Giancarlo Guizzardi (UFO), Nicola Guarino (OntoClean), Holger Knublauch (SHACL), Dean Allemang (reuse-vs-mint / competency-question), Tom Baker (SKOS/units + URI governance), Ian Davis (deployment realism).
- **Voices:** 8 across 8 teammates. **`consensus-mode`:** `agent-fan-out` (no hive-mind). Working files in `working/session-030/`.
- **Format:** Full Council (greenfield first-cut, no WG gate — the council is the ratifying body).
- **Framing.** "No gates" = produce no deferral/trigger; **decide now, on the merits**. But **whether** to model Room/Building as first-class Kinds vs an anonymous by-value structure vs flat properties was **fully open** — decided on the merits, not presumed.

## Context

S026 affirmed the eventual identity criterion is **genuine** via the [ODR-0005](../ODR-0005-property-land-identity-crux.md) §3a-4 "Replacement" witness (a built structure may persist when Property identity changes) — but it **names a building, not a room**, and S026 found it **latent** (no consumer re-identifies a room/building as an individual). The directing authority overruled the *deferral gate*; this council decides the *model* now. The data: `length` / `width` / `roomName` live at `propertyPack.buildInformation.roomDimensions.rooms[]` — a **repeating group with no positional/identity token** — and are the only **3 of 239** candidate-G leaves still uncovered (236/239 after the monetary + R5 walks). `opda:builtForm` / `numberOfFloors` / `opda:area` already work as flat Qualities on `opda:Property`. `opda:MonetaryAmount` (ODR-0024 R3) is the recent **anonymous by-value structure** precedent (no IC, no key, reused as a range).

## Question 1 — Should `opda:Room` be a class, a by-value structure, or flat properties?

**8–0 against a Room class. Model as an anonymous by-value structure.**

All eight: a Room Kind has **no data-realisable identity** — `roomName` is non-rigid (ODR-0024 R10 / OntoClean −I), dimensions can't key it, BASPI5 carries no positional token; a `sh:targetClass opda:Room` key would be inert (Knublauch), an instance asserted without an IC (Guarino's OntoClean prohibition; Cagle DA). But **flat single-valued properties on `opda:Property` are also rejected** (7 of 8) — `rooms[]` is a repeating group, and flat predicates shred the co-variance (which `length` pairs with which `width`/`roomName`) (Allemang, Kendall, Davis, Guarino, Guizzardi, Cagle, Knublauch). The fit is the **`opda:MonetaryAmount` by-value structure** — `opda:RoomDimension`, no IC, no key. (Baker alone preferred flat decimals — see Q5.)

**Vote Q1: 0–8–0 for a Room class** (unanimous: anonymous by-value structure, not a class, not flat).

## Question 2 — Should `opda:Building` be a class now?

**7–1 against minting now. The +O IC is genuine but latent.**

All eight affirm Building's IC is **genuine** (the §3a-4 Replacement witness; Cagle DA concedes it explicitly). Seven hold it is **latent / unexercised** — no Building instance to key, no cross-Property sharing, and `builtForm`/`numberOfFloors` already sit flat on `opda:Property` — so minting now yields a **correct-but-inert empty Kind** (Guarino, Guizzardi, Cagle, Knublauch, Allemang, Baker, Davis). **Kendall (Queen) dissents**: mint a *thin* Building now as the bearer of `RoomDimension`, to avoid a "false mereology" of rooms-directly-on-Property. The seven answer that `RoomDimension` is a **by-value attachment (a value, not a part)**, so attaching it to `opda:Property` asserts no mereology — removing the need for a Building node.

**Vote Q2: 1–7–0 for a Building class now** (Kendall the lone AFFIRM; recorded as held dissent).

## Question 3 — Mereology / attachment + relations

**No part-of, no transitivity.** With no Room/Building Kinds, there is no part-whole chain. `opda:RoomDimension` attaches to `opda:Property` via a single object property `opda:hasRoomDimension` (0..*) — characterisation/inherence of a value, **not** componenthood (Guizzardi: functional componenthood is non-transitive anyway; Guarino: parthood is not transitive across differing ICs — a future transitive `partOf` would be the bug). The dormant `PropertyTypeScheme`→subclass path is untouched.

**Vote Q3: resolved — one attachment predicate, no mereology, no transitivity.**

## Question 4 — `length` / `width` / `roomName` + units

**Datatype typing unanimous; unit-scheme split 5–3 against minting one.**

`length` / `width` → `xsd:decimal`; `roomName` → `xsd:string`, **non-rigid, never a key** (ODR-0024 R10). **No `opda:UnitOfLengthScheme`** — **Baker (the SKOS steward, whose domain this is) rules decisively**: the data carries no unit token (unlike `area`, whose `UnitOfAreaScheme` was lifted from a live `units` enum and is itself not even wired onto `opda:area`), so there is nothing to lift; fix metres by `rdfs:comment`, reuse-before-mint (Kendall, Cagle, Knublauch, Allemang, Baker). **Dissent (3): Guizzardi, Davis** (mint a small `UnitOfLengthScheme` — the unit is the Quale Region) and **Guarino** (a length-unit scheme, reuse-first). No stored `area` (derivable).

**Vote Q4: datatype typing 8–0; unit-of-length scheme 3–5 → NOT minted (metres-by-comment).**

## Question 5 — Realisation spec (for the future emission task)

**Mint an anonymous by-value `opda:RoomDimension` — the MonetaryAmount template. 7–1 over flat properties.**

The realisation the eventual emission records (NOT implemented this session): `opda:RoomDimension` (a by-value quality-value structure, no IC, no key) bearing `opda:length` + `opda:width` (`xsd:decimal`, metres) + `opda:roomName` (`xsd:string`, non-rigid), attached to `opda:Property` via `opda:hasRoomDimension` (0..*); one **keyless** `opda:RoomDimensionShape` (mirroring `opda:MonetaryAmountShape`; `length`/`width` `sh:datatype`, no `sh:minCount` in base per ODR-0010 §Q7a, no uniqueness); `dct:source` → the `roomDimensions.rooms[]` leaf-paths. When emitted, closes the last 3 leaves → **239/239**. **Baker dissents** (flat decimals on `opda:Property`, no structure) — defeated by the repeating-group co-variance (Q1).

**Vote Q5: 7–1–0** for the by-value structure (Baker for flat properties).

## Synthesis (Queen — Kendall)

Reopening the *whether* gave the asymmetric, merits-based answer the gate framing obscured: **mint no Kinds.** `opda:Room` fails the identity test outright (8–0) — no data-realisable IC, and `roomName` is non-rigid; `opda:Building` has a *genuine* +O IC (the Replacement witness, conceded by all including the DA) but it is **latent/unexercised**, so minting it now is an inert empty Kind (7–1). The room data is a **repeating group**, which forces a *structure* but not an *endurant* — exactly the anonymous by-value pattern `opda:MonetaryAmount` set last week. So: **`opda:RoomDimension`**, a keyless by-value structure on `opda:Property`, carrying `length`/`width`/`roomName`; no Room class, no Building class, no mereology, no transitivity, no unit scheme. The DA (Cagle) prevailed — "structured value, not a class" is the verdict — while conceding Building's IC is real. My own Q2 dissent (a thin bearer-Building) is recorded but outvoted: a value attaches to `opda:Property` without asserting parthood, so no Building node is needed. This decides R3 **now, on the merits, with no gate** — and, per the monetary/R5 precedent, it **amends ODR-0024 R10 + ADR-0005 §G24** rather than spawning a duplicate ODR/ADR. The realisation is a recorded spec; **emission is a separate task, not done here.**

## Tally appendix

| Voice | Q1 Room-class | Q2 Building-class | Q3 mereology | Q4 unit scheme | Q5 realisation |
|---|---|---|---|---|---|
| Kendall (Queen) | REJECT → by-value | **AFFIRM (thin)**¹ | no part-of | no scheme | RoomDimension |
| Cagle (DA) | REJECT → by-value | REJECT (latent) | no part-of | no scheme | RoomDimension |
| Guizzardi | REJECT → by-value | REJECT-now (latent) | non-transit | **mint scheme**² | RoomDimension |
| Guarino | REJECT → by-value | REJECT (latent) | non-transit | scheme (reuse-first)² | RoomDimension (keyless) |
| Knublauch | REVISE → by-value | REJECT | no part-of | no scheme | RoomDimension |
| Allemang | REJECT → by-value | REJECT-now (latent) | de-scope | no scheme | RoomDimension |
| Baker | REJECT (class) | REJECT (latent) | no premature pred | **no scheme (decisive)** | **flat properties**³ |
| Davis | REJECT → by-value | REJECT | no part-of | **mint scheme**² | RoomDimension |
| **Tally** | **0–8–0** (no class) | **1–7–0** (no mint now) | **resolved** | **scheme 3–5 → no** | **7–1** (by-value) |

¹ Kendall: a thin Building as bearer (held dissent — re-open if a multi-building / per-building consumer query appears). ² Guizzardi/Davis (+ Guarino, reuse-first): mint a `UnitOfLengthScheme` (held dissent — re-open if a unit token enters the data or a unit-typed comparison query appears). ³ Baker: flat decimals, no structure (defeated by the repeating-group co-variance).

### DA scorecard (Kurt Cagle)

| Q | DA disposition | Note |
|---|---|---|
| Q1 Room | **REJECT — prevailed** | "structured value, not a class" became the unanimous verdict |
| Q2 Building | **REJECT — prevailed (7–1)**; **IC conceded genuine** | held the value-not-class line; conceded the §3a-4 +O IC is real but latent |
| Q3 | aligned | one attachment predicate, no mereology |
| Q4 | no scheme | aligned with the majority |
| Q5 | RoomDimension | aligned |

**Cagle's holds (re-open triggers):** Q1 (Room class) — a data-realisable positional token surviving re-survey (not `roomName`); Q2 (Building class) — a Building instance to key (the S026 re-identification / building-vs-property divergence). The DA's case became the verdict; no dissent against it.

### Per-question count

Q1 0–8–0 · Q2 1–7–0 · Q3 resolved · Q4 (typing 8–0; unit-scheme 3–5) · Q5 7–1–0. The contested points (Q2 Building, Q4 unit-scheme, Q5 flat-vs-structure) are recorded as held minorities with concrete re-open conditions.

## A9 note

No `kind: pattern` ODR is produced and **no Substance Kind with an identity criterion is minted** — A9's "UFO meta-category + IC over hard cases" obligation is discharged by *declining*: neither Room nor Building carries a data-realisable IC today. `opda:RoomDimension` is an **anonymous by-value structure** (a quality-value bundle, no IC, no key — the `opda:MonetaryAmount` precedent, ODR-0024 R3), not an endurant Kind; `length`/`width` are Quale-in-Region Qualities and `roomName` a non-rigid (−I) label, all owned by `opda:Property`'s existing ODR-0005 §3a identity. The held Building/Room ICs (genuine but latent) stay owned by ODR-0005 / ODR-0008 §Q4a. The disposition is recorded as a **revision of ODR-0024 R10** (where the Room leaves' disposition already lives), not a new pattern record.

## Consequences (routing — amend, do not spawn)

- **Revise [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) R10**: Room/Building are NOT promoted to classes; `length`/`width`/`roomName` are modelled as an anonymous by-value `opda:RoomDimension` structure on `opda:Property` (the R3 MonetaryAmount pattern). The realisation spec is recorded; emission is a future task.
- **Strike [ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) R3** (resolved — no longer gated; decided on the merits, not deferred).
- **Update [ADR-0005](../../adr/ADR-0005-deferred-work-register.md) §G24**: the 3 leaves' disposition is decided (model as `opda:RoomDimension`); **emission EXECUTED 2026-05-31 via [ADR-0033](../../adr/ADR-0033-room-dimension-value-structure-emission.md)** (239/239 — curated Category-G walk complete; all 6 gates green, 266 tests).
- **Note ODR-0008 §Q4a**: the conditional Building/Room promotion was adjudicated (S030) and ruled not-promoted (value structure instead); the held-minority "would-earn" identity-fact conditions recorded.
- **Held-as-live:** (a) Kendall — a thin `opda:Building` now (re-open: a per-building / multi-building consumer query); (b) Guizzardi/Davis/Guarino — an `opda:UnitOfLengthScheme` (re-open: a unit token in source, or a unit-typed comparison query); (c) Building promotion would-earn — a fact exercising the §3a-4 Replacement witness (a shared building across Properties, or a building re-identified across dated surveys); (d) Room promotion would-earn — a stable room positional/structural token in source + a re-identifying query.
- **No new ODR, no new ADR. No implementation.** No WG-pending tag (greenfield; the council ratifies).
- Track-record row added to [adoption.md](./adoption.md).

## References

- [ODR-0023 R3](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) (the gated promotion this discharges) · [session-026](./session-026-building-room-promotion.md) (the prior hold + Guarino's IC test) · [ODR-0024 R10](../ODR-0024-curated-category-g-walk-dispositions.md) (the Room-leaf disposition this revises) · [ODR-0024 R3](../ODR-0024-curated-category-g-walk-dispositions.md) (the `opda:MonetaryAmount` by-value precedent reused) · [ODR-0005 §3a](../ODR-0005-property-land-identity-crux.md) (the Replacement witness) · [ODR-0008 §Q4a](../ODR-0008-property-descriptive-attributes.md) · [ADR-0005 §G24](../../adr/ADR-0005-deferred-work-register.md).
- Grounding: Kendall & McGuinness *Ontology Engineering* (2019) + FIBO (Bennett 2013); Guizzardi UFO/OntoUML (2005) + gUFO; Guarino & Welty OntoClean (2009) + DOLCE features; SHACL/DASH (W3C 2017); DCMI vocabulary governance (Baker); Allemang/Hendler/Gandon (2020).
- Working positions: `working/session-030/{kendall,cagle-da,guizzardi,guarino,knublauch,allemang,baker,davis}.md`.
