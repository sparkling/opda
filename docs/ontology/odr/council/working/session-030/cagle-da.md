# Session 030 (R3) — Cagle, Devil's Advocate — "Structured value, not a class"

- **Voice:** Kurt Cagle (*The Ontologist*) — DEVIL'S ADVOCATE, roster-named natural DA for class-promotion.
- **Lens:** SHACL practitioner, taxonomy design. Signature attack: *that's a structured value, not a class.*
- **Proposition under attack:** promote `opda:Room` / `opda:Building` to first-class Kinds (ODR-0023 R3, ODR-0008 §Q4a).
- **Framing honoured:** no deferral, no trigger. I decide NOW on the merits — value-vs-class, not "wait." Where the foundational case (Guizzardi/Guarino) actually warrants a class, I CONCEDE; where it does not, I REJECT the mint and route to a by-value structure or flat datatype properties on a bearer.
- **Scope read:** session-026, ODR-0024 (R3/R10), ODR-0023 (R3), ODR-0005 §3a, ODR-0008 §Q4a. Corpus state verified in `opda-property.ttl` / `opda-descriptive.ttl` / `opda-descriptive-shapes.ttl`.

---

## The case in one paragraph

The corpus already gives me three working precedents that bound this decision, and none of them needs a Room or a Building class. (1) `opda:area`, `opda:bedrooms`, `opda:bathrooms`, `opda:builtForm`, `opda:numberOfFloors` are flat measured/labelled Qualities on `opda:Property` — the comment on `opda:area` even says "the unit of measure is carried alongside in the source structure," i.e. a Quality with a co-located unit does **not** force a bearer class. (2) `opda:MonetaryAmount` (ODR-0024 R3) is the canonical anonymous **by-value structure**: a `sh:NodeShape` with `sh:targetClass` over magnitude + currency, explicitly typed "a quality value / abstract value structure — NOT an endurant … NOT a Quality of any bearer," reused as a `range` across distinct per-bearer properties. (3) `opda:NearbyFacility` (ODR-0024 R4) is the bar a real class must clear — a *mind-independent endurant* warranted because "the same facility neighbours many properties." `rooms[]` is a repeating measurement group at `propertyPack.buildInformation.roomDimensions.rooms[]`; it is shaped like (2), it carries Qualities like (1), and it conspicuously fails the test in (3). The whole proposal must justify itself against that, and on the merits a Room class does not survive.

---

## Q1 — `opda:Room`: **REJECT** (promote-now), route to a by-value `roomDimensions` structure

REJECT the mint. A Room here has **no data-realisable identity criterion**. ODR-0024 R10 already settled that `roomName` is "a non-rigid label, not an identity principle," and the brief confirms BASPI5 carries **no positional token** — so there is nothing in the data by which two `rooms[]` entries are *the same room* or by which a downstream query could re-identify one. That is the definition of a value-tuple, not an endurant: `{length, width, roomName?}` is individuated *by its values*, exactly like `MonetaryAmount` is individuated by `{amount, currency}`. The SHACL realisation is identical — an anonymous `sh:NodeShape` (`opda:RoomDimension`) with `sh:path opda:length`/`opda:width`/`opda:roomName` and `sh:datatype xsd:decimal`/`xsd:string`, reached from the bearer by one object property — and it buys every constraint a class would, with no spurious `owl:Class` asserting endurant-hood the data cannot back. A taxonomy that mints a Kind it cannot key teaches LLM consumers to fabricate `owl:sameAs` across rooms (the DBpedia-2017 failure mode the council already legislates against); the by-value shape forecloses that. Concession boundary: if a panellist produces a *positional* token (storey + grid-ref, a floorplan anchor) that survives re-survey, Room acquires unity+persistence and I would CONCEDE — but that token is not in BASPI5, so today it is a structured value.

## Q2 — `opda:Building`: **REJECT** (promote-now), keep building-facts flat on `opda:Property`

REJECT the mint, but on a *different* ground than Room — and I concede the half that is real. Per session-026 (Guarino) and ODR-0005 §3a hard-case 4 "Replacement," Building **does** carry a genuine segregated IC (+O): a built structure can persist when Property identity changes. I CONCEDE the IC is genuine. But genuine-and-latent is not realisable: there is **no Building instance to key** in the data. The facts that would populate it — `opda:builtForm`, `opda:numberOfFloors`, `opda:area` — are already flat Qualities on `opda:Property` and answer every current question losslessly; the data dictionary even sources `builtForm`/`numberOfFloors` from `buildInformation.building.*` yet the council bound them to `opda:Property` with no information loss. Minting a class whose only members would be anonymous nodes bearing the same three datatype properties is **decorative** under entailment-off SPARQL (ODR-0008 §Q6a's own reasoner-independence test): the UNION-over-Building answer-set equals the flat-on-Property answer-set, so the class earns nothing it does not already have. A real-world structure-as-endurant is a `NearbyFacility`-grade commitment; Building has the IC but not the *instance population* that R4 had ("neighbours many properties"). So: HOLD the class against its genuine witness, ship flat.

## Q3 — Mereology / attachment (Room ⊑ part-of Building ⊑ part-of Property): **REJECT**

REJECT minting any `opda:hasRoom` / `opda:hasPart` / `opda:partOfBuilding` relation. A mereological relation must connect two *individuated relata*; with Room a by-value structure (Q1) and Building unminted (Q2), there are no two endurants to stand at the ends of a `partOf` edge — you would be asserting parthood between a Property and a value-tuple, which is a category error (you do not say a price is "part of" a sale; you attach it). The attachment that the data actually supports is one object property from `opda:Property` to the anonymous `roomDimensions` structure — `opda:hasRoomDimension` (or simply reusing the existing `roomDimensions` grouping under `opda:Property`, alongside the already-emitted `opda:hasFloorplan`). No transitive `partOf`, no `gufo:isProperPartOf`: mereology with no consumer query that traverses it is precisely the "decorative hierarchy" §Q6a forbids. Concede trigger: a query that aggregates Qualities *up* a part-hierarchy (sum room areas → building area → property area) would need real mereology — but `opda:area` is already a direct Quality of `opda:Property`, so that query is answered without parts today.

## Q4 — `length` / `width` / `roomName`: **AFFIRM** keep as datatype properties on a by-value structure (REJECT per-Room class fields)

AFFIRM the by-value treatment; this is the heart of the "structured value, not a class" case. These three are the *only* uncovered leaves and they form one repeating measurement tuple. Mint `opda:length` and `opda:width` as flat `owl:DatatypeProperty` (`xsd:decimal`, §Q5a/§Q6a) and `opda:roomName` as flat `xsd:string`, all `rdfs:domain` the anonymous `opda:RoomDimension` value-structure (mirroring `opda:amount`/`opda:currency` on `opda:MonetaryAmount`), with one `sh:NodeShape` carrying their `sh:datatype` and any unit constraint — exactly the MonetaryAmountShape idiom, which needs no overlay. `roomName` stays a **label, not a key** (ODR-0024 R10): the node shape MUST NOT put `dash:uniqueValueForClass` or `sh:maxCount 1`-as-identity on it. This reuses the value type across however many `rooms[]` entries a property has, gives SHACL full per-context control, and asserts zero false endurant-hood. REJECT the alternative of hanging `length`/`width` directly on `opda:Property` as repeated flat properties — that loses the within-room grouping (which `length` pairs with which `width`) and is the one place a bare-datatype-on-Property treatment genuinely under-models; the *by-value structure*, not the *class*, is the correct granularity.

## Q5 — Realisation + minimality: **AFFIRM** minimal (one by-value structure + three datatype properties; zero classes)

AFFIRM the minimal realisation. The ADR should mint: one anonymous-by-value `opda:RoomDimension` structure (node-shape-defined, no `owl:hasKey`, no endurant claim), three datatype properties (`opda:length`, `opda:width`, `opda:roomName`), and one attachment property from `opda:Property`. **Zero new Kinds, zero mereology, zero SKOS** (these are free decimals/strings, not enums — cf. ODR-0024 R6). This closes 3/239 and lands honest coverage at the documented next increment with all six CI gates green, no `ci-dup-declaration` risk, and no byte-identity re-pin. Minimality test (the senior-engineer check): every minted term traces to an uncovered leaf; nothing is speculative. Promoting two classes + a part-hierarchy to cover three measurement leaves is the textbook over-promotion — it adds validation surface, an `owl:sameAs`-temptation for un-keyable rooms, and a Building class with no instances, in exchange for answers the flat+by-value model already gives. The by-value structure is strictly dominant.

---

## Withdraw / hold disposition (per contested question)

I am instructed to WITHDRAW or HOLD on every contested question; a hold carries a named re-open trigger. No deferral is argued — these dispositions stand on the merits NOW.

| Q | Contested point | Disposition | Named re-open trigger (holds only) |
|---|---|---|---|
| **Q1** | `opda:Room` class | **HOLD against** (reject-now, route to by-value `opda:RoomDimension`) | A **data-realisable positional token** for a room (storey + floorplan-anchor / grid-ref) that survives re-survey → Room gains unity+persistence → re-open as a keyed Building-part. *roomName does NOT trip this (R10).* |
| **Q2** | `opda:Building` class | **HOLD against** (reject-now; IC conceded genuine per ODR-0005 §3a "Replacement") | A **Building instance to key** — i.e. a consumer query that *re-identifies* a building across a Property-identity change (the session-026 sharpened re-identification trigger), OR building-level facts that diverge from Property-level facts (multi-building plot). |
| **Q3** | mereology / `partOf` | **WITHDRAW any class-to-class relation; AFFIRM one attachment property** to the by-value structure | A query that **aggregates Qualities up a part-hierarchy** (Σ room area → building → property) where the answer is not already a direct Quality of `opda:Property`. |
| **Q4** | `length`/`width`/`roomName` realisation | **AFFIRM** (by-value structure + flat datatypes; `roomName` = label not key) | — (settled on the merits; no hold) |
| **Q5** | minimality / realisation plan | **AFFIRM minimal** (1 by-value structure + 3 datatype properties + 1 attachment property; 0 classes) | — (settled on the merits; no hold) |

**Net concession:** Building's eventual IC is genuine (I do not contest Guarino's Replacement witness). What I deny is that a *genuine-but-uninstantiated* IC licenses a class *today* — under SHACL/taxonomy practice you mint the bearer when there is something to key, not before.

---

## What NOT to mint (the operative list)

1. **NOT `opda:Room` as an `owl:Class`** — no data-realisable IC (roomName non-rigid per R10; no positional token in BASPI5). It is a value-tuple; realise as the anonymous `opda:RoomDimension` by-value structure (the `MonetaryAmount` idiom).
2. **NOT `opda:Building` as an `owl:Class`** — IC genuine but latent; no instance to key. Building-facts (`builtForm`/`numberOfFloors`/`area`) stay flat Qualities on `opda:Property` (already emitted, lossless).
3. **NOT any `opda:hasRoom` / `opda:partOfBuilding` / `gufo:isProperPartOf` mereology** — no two individuated endurants to relate; no traversing consumer query. Attach the value-structure with **one** object property from `opda:Property`.
4. **NOT `roomName` as a key** — no `dash:uniqueValueForClass`, no identity-bearing `sh:maxCount`. It is a `sh:datatype xsd:string` label (R10).
5. **NOT a SKOS scheme for room data** — `length`/`width` are free `xsd:decimal`; `roomName` is free text (cf. R6 — mint SKOS only where the data carries an enum).
6. **NOT `owl:hasKey` / `owl:sameAs` anywhere on room nodes** — un-keyable nodes under `owl:sameAs` propagate irreversibly (ODR-0005 anti-pattern; DBpedia-2017 LLM-fallback lesson). By-value structural identity only.

**Mint instead:** `opda:RoomDimension` (anonymous by-value structure, node-shape-defined) + `opda:length` + `opda:width` + `opda:roomName` (flat datatype properties on that structure) + one attachment property on `opda:Property`. Closes the 3/239 leaves; zero classes; all gates green.
