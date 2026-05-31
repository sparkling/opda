---
status: proposed
date: 2026-05-31
kind: pattern
tags: [descriptive-layer, category-g, curated-walk, monetary, nearby-facility]
scope: [pdtf-v3:propertyPack.residentialPropertyFeatures, pdtf-v3:propertyPack.nearbyFacilities, pdtf-v3:propertyPack.ownership, pdtf-v3:propertyPack.localSearches, pdtf-v3:valuationComparisonData.propertyDetails]
council: session-028
supersedes: []
depends-on: [ODR-0008, ODR-0008d, ODR-0022, ADR-0030, ADR-0031]
implements: [ODR-0022]
---

# Curated Category-G Walk — Leaf Dispositions and Modelling Rules

## Context

The [ADR-0031](../../adr/ADR-0031-category-g-curated-walk-execution-plan.md) curated walk emitted or dispositioned the 188 [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) candidate Category-G descriptive leaves (156 minted as flat properties, 29 collapsed onto shared/existing properties, 3 deferred), via the [ADR-0030](../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) generator. The per-leaf modelling decisions were made directly (greenfield first cut, no WG gate) and then put to the Linked Data Council — [session-028](./council/session-028-category-g-walk-review.md) — a full panel (Queen Allemang; Guizzardi/Kendall/Cagle; DA Hendler) for ratification.

This ODR records the **rules and dispositions** the council settled; the deliberation transcript and per-question verdict tally live in the session record. The council ratified the walk's mechanical spine but returned two corrections that are normative here: the headline monetary leaves had been wrongly collapsed onto the Category-D fixtures `opda:price`, and the nearby-facilities bearer classes had been minted under a citation (§Q4a) that does not license them. Both are corrected below.

## Decision

Adopt the per-family disposition rules in §Rules for the descriptive Category-G leaves: flat datatype properties on the nearest bearer Kind by [ODR-0008](./ODR-0008-property-descriptive-attributes.md) §Q5a/§Q6a, two ratified collapse conventions (free-text → `opda:disclosureDetail`, identity → existing join predicates), monetary leaves **deferred** to a `MonetaryAmount`-based monetary walk rather than collapsed onto the fixtures price, and `opda:NearbyFacility` re-warranted as a UFO Substance-Kind bearer; because the value-space distinctions either already exist in the emitted TTL or are byte-identically recoverable, the walk ships as a greenfield first cut at **honest 179/239 coverage** — R5's structural C-vs-G rule grew the candidate-G set 188→239 by surfacing enum-bearing attributes the old allow-list mis-binned to C, and the 60 uncovered (18 deferred monetary + 3 held `opda:Room` + ~39 newly-surfaced enum attributes) are a reported follow-on, not silent omissions.

## Rules

**R1 — Minting (the 156).** A candidate-G leaf with no ratified collapse mints one flat `opda:` datatype/object property: range from the data-dictionary type (no enum → plain `xsd:` datatype; §Q5a), flat per §Q6a (no `rdfs:subPropertyOf`), `rdfs:domain` the nearest existing bearer Kind (`opda:Property` physical attrs; `opda:LegalEstate` tenure/lease/charge attrs; `opda:Person`/`Organisation`/`Proprietorship` agent attrs; `opda:Search` planning/search results; `opda:Valuation` comparable pricing; `opda:Transaction` completion undertakings; `opda:RiskAssessment` risk fields), and a `dct:source` array of its G2 schema-leaf-paths (§Q3a). The six G11 overlap leaves (`builtForm`, `centralHeatingFuelType`, `currentEnergyRating`, `heatingType`, `ownershipType`, `propertyType`) **STAND** on this rule (ratified, Q8).

**R2 — Collapse (free-text + identity).** Generic prose tails (`details`, `description`, `summaryDescription`, `propertyFullDescription`, `dimensionDetails`, `caption`, `workAlreadyDone`, `workToBeDone`) collapse to the one reusable `opda:disclosureDetail` (ODR-0022 §Rules.1; the question is carried by the subject + instance `dct:source`, never a per-leaf property). Identity leaves collapse onto the existing canonical predicate (`uprn` → `opda:hasUPRN`, `address` → `opda:hasAddress`); minting a duplicate is forbidden (ODR-0005/ODR-0015 own the canonical modelling).

**R3 — Monetary leaves DEFER; they do NOT collapse onto the fixtures price.** The headline/recurring monetary leaves (asking/sold/list/estimate prices, rents, deposits, ground rent, service charges, fees, deed/permit costs, `potentialCost` — ~18 here, ~225 across the corpus) are **deferred** to the Category-G monetary walk (ODR-0008d item-3). They MUST NOT be collapsed onto `opda:price`, which is the Category-D **fixtures** amount only (ODR-0022 §4); ODR-0022 §1/G1 keeps the headline price distinct. At the monetary walk: a value-structured **`opda:MonetaryAmount`** (magnitude + currency over an ISO-4217 SKOS scheme; currency-defaulting-GBP via the overlay profile, never absent on the value type), reused as the **datatype** across **distinct per-economic-kind properties** (`askingPrice`/`groundRent`/`serviceCharge`/`deposit`/`fee`…) each bound to its **own bearer** — reuse the datatype, never the bearer. The fixtures `opda:price` stands as a single-currency interim; its `rdfs:comment` MUST drop the "reuses a MonetaryAmount pattern" claim until that type exists.

**R4 — Nearby facilities.** A referenced nearby facility is a UFO **Substance Kind** (a mind-independent social-physical endurant with its own identity — not a Quality of `opda:Property`, since the same facility neighbours many properties). `opda:NearbyFacility` is warranted on **that UFO basis, not ODR-0008 §Q4a** (§Q4a is a provenance/lifecycle/PII test and does not license it). For the first cut, `opda:School` / `opda:HealthCareFacility` collapse into the genus bearer (band-specific properties SHACL-scoped per overlay); the precise-bearer Subkind split (+ `opda:TransportNode`) is **held-as-live** (Guizzardi dissent) with re-open trigger: a consumer query needing per-band typing (the "ODR-0023 R2 axis review" arm is now **spent** — R2 was adjudicated [session-029](./council/session-029-r2-ufo-axis-load-bearing.md) and did NOT spawn the UFO sub-modules, so per-band typing rides only on a consumer query). The `schoolType` bands are modelled as one `opda:schoolType` datatype property over an `opda:SchoolTypeScheme` — NOT five range-less generic object properties (`opda:primary`/`private`/… are namespace landmines).

**R5 — C-vs-G categoriser rule (structural, replacing the allow-list).** The Category-C vs Category-G boundary is: a value-space that is a **cross-cutting status flag reused across unrelated contexts → C**; a **substantive Property/estate Quality or Substance-Kind-label whose value-space is enumerated → G**, with the enum as its SKOS range. Replace the 7-name `_G_PROPERTY_QUALE_TAILS` allow-list in `leaf_categoriser.py` with this structural signal, re-run `categorise-leaves` so the candidate-G count is honest (~200+, not 188), and add a regression test asserting no new enum-leaf under a Property/estate path lands in C unexamined. This corrects a **report/curation-scope miscount only** — the emitted terms (`propertyType`, `hasBeenFlooded`, `isInsured`, …) are already correct G-grade in the TTL; no byte-identity re-pin is required.

**R6 — SKOS from live enums (Q-SKOS).** Mint a SKOS scheme where the data **actually carries** an enum: `opda:ConstructionTypeScheme`, `opda:PriceQualifierScheme`, `opda:TransportTypeScheme`, `opda:BroadbandConnectionTypeScheme`, `opda:OfstedRatingScheme` (Ofsted-authority `dct:source`); re-range `ownerType` → `opda:OwnerTypeScheme` and `marketingTenure` → the existing tenure scheme (reuse-before-mint; do not mint a third tenure scheme). Leaves that are genuinely free strings in the data (`documentTypeCode`, `pricingMethodology`, `typeOfHealthCare`, `religiousCharacter`, `supplyClassification`) stay bare `xsd:string`.

**R7 — Attached documents vs evidence.** Registry-attached document filing-metadata (`documentDate`, `documentTypeCode`, `filedUnder`, `retrievedOn` on `titlesToBeSold[].additionalDocuments[]`) binds to a neutral `opda:AttachedDocument`; `opda:DocumentEvidence` (ODR-0009) is reserved for artefacts actually standing as evidence (its `owl:equivalentClass` alias `opda:Document` MUST NOT be the bearer, or every attached doc is entailed eIDAS-assured evidence). Give the document Kind an explicit IC (content + issuing activity, not `documentTypeCode`/`documentDate`).

**R8 — `titleNumber` domain.** `rdfs:domain opda:RegisteredTitle` — a title number identifies the HMLR register record, not the legal estate; reach the estate via the existing `opda:recordsEstate` join. (Allemang dissent: estate-side cited identifier — if wanted, a separate co-reference predicate, never an overload of the identifier's domain.)

**R9 — Bank-account leaves.** `accountName`/`accountNumber`/`sortCode` are flat `xsd:string` datatype properties on `opda:Organisation` (leading-zero-significant — never `xsd:integer`). Promote to an `opda:BankAccount` Kind only on a named trigger: an account shared across organisations, account-level lifecycle/validation (IBAN/BIC/mandate), or a query retrieving accounts independent of holder.

**R10 — `opda:Room` held.** `length`/`width`/`roomName` stay deferred candidate-G; `opda:Room` is held-as-live per ODR-0008 §Q4a, re-open trigger "first named BASPI5 round-trip query exercising sub-Property reasoning." When activated: a Building-part bearing measured Qualities; `roomName` is a non-rigid label, not an identity principle.

**R11 — Domain-less convention.** `name`, `displayName`, `mediaUrl`, `url` stay `rdfs:domain`-less (genuinely cross-artefact; forcing a bearer would assert false inherence). SHACL property-shapes carry their per-context constraint; add `sh:datatype xsd:anyURI` + a URI `sh:pattern` for `mediaUrl`/`url`. Mint a common superclass only on a named query quantifying over all referenceable artefacts.

**R12 — Coverage accounting.** After remediation, honest coverage is **164 minted + 15 collapsed = 179/239** — R5's structural C-vs-G rule grew the candidate-G set 188→239 by surfacing enum-bearing attributes the old 7-name allow-list mis-binned to C. The **60 uncovered** are the 18 deferred monetary leaves + the 3 held `opda:Room` leaves + ~39 newly-surfaced enum attributes (a reported follow-on walk, not silent omissions). `ci-category-g-coverage` is the local-only tracker (the data dictionary is gitignored); collapsing the 18 monetary leaves onto `opda:price` was false coverage and is withdrawn from the register.

## Alternatives

* **Collapse all amenity leaves to the bare genus / domain-less** — rejected: loses the precise bearer (a transport node has no `pupils`); the genus + SHACL-per-band keeps the bearer honest without the held Subkind cost.
* **Mint one price property per monetary leaf** — rejected: ODR-0022 §4 forbids per-item price proliferation; the value type is shared, the bearer is not.
* **Reuse the fixtures `opda:price` for headline amounts** — rejected: conflates Category-D and Category-G (ODR-0022 §1/G1) and erases incompatible value semantics (one-shot vs recurring vs refundable) under one bare decimal.
* **Mint `School`/`HealthCareFacility` subkinds now** — rejected for the first cut: no consumer query forces the split; held-as-live (Guizzardi dissent preserved).
* **Reuse `opda:DocumentEvidence` for attached registry documents** — rejected: the `owl:equivalentClass` binding entails eIDAS-Substantial evidence on every attached document.
* **Keep the 7-name C-vs-G allow-list** — rejected: it silently drops every future enum-bearing Quale whose tail is not listed.

## Consequences

Remediation before this leaves `proposed` — **blocking** (DA blockers): re-warrant `opda:NearbyFacility` + collapse subkinds + `schoolType`→SKOS (R4); withdraw the 18 monetary collapses → defer + fix the `opda:price` comment (R3), honest coverage 185 → 179/239 (R5 grows the denominator 188→239). **Should-fix follow-ups**: `titleNumber`→`RegisteredTitle` (R8); mint `opda:AttachedDocument` + break the `Document`≡`DocumentEvidence` conflation (R7); structural C-vs-G rule + re-run + regression test (R5); mint ~5 SKOS schemes + re-range (R6); SHACL `mediaUrl`/`url` + `hasSubAssessment` acyclicity (R11). The Category-G **monetary walk** (with `opda:MonetaryAmount`) is the next deferred chunk and owns the ODR-0008d item-3 deferral. All emitter changes regenerate through ADR-0030; `ci-byte-identity`, `ci-dup-declaration`, and `ci-category-g-coverage` continue to gate. No byte-identity re-pin is forced by R5.

## References

* [ODR-0008](./ODR-0008-property-descriptive-attributes.md) §Q4a/§Q5a/§Q6a/§Q3a — the descriptive-attribute binding rules this walk applies.
* [ODR-0008d](./ODR-0008d-authority-retrieved-artefacts.md) item-3 — the deferred `opda:MonetaryAmount` value-type question (R3 answers it).
* [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) §1/§3/§4/§Rules.1/.6 — Category-G curation strategy + the C↔D↔G boundary this ODR implements.
* [ADR-0030](../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) — the emission generator + gates. [ADR-0031](../../adr/ADR-0031-category-g-curated-walk-execution-plan.md) — the walk execution plan.
* [Council session-028](./council/session-028-category-g-walk-review.md) — the deliberation, per-question verdicts, and DA scorecard behind these rules.
