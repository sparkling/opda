"""
Module category_g_curation.

The curated Category-G walk's **disposition register** (ADR-0031 work-item 2):
the single source of truth for candidate-G leaves whose disposition is NOT a
straight mint of `opda:<name>`.

Most candidate-G leaves are dispositioned by MINTING a datatype/object property
whose local name IS the leaf name (e.g. `bedrooms` -> `opda:bedrooms`); those
need no entry here -- the `ci-category-g-coverage` gate detects them by
name-match against the emitted corpus. This module records the EXCEPTIONS:

- COLLAPSED: a leaf reused into an existing shared `opda:` property rather than
  minting a per-leaf one. The two ratified collapse patterns are
  ODR-0022 §Rules.1 Category-A free-text collapse to `opda:disclosureDetail`
  (the generic `details`/`comments`/`summary` tails) and the §Q5a/§Q6a identity
  reuse to an existing join predicate (`uprn` -> `opda:hasUPRN`, `address` ->
  `opda:hasAddress`). The value is the local name of the reused `opda:` term,
  which MUST exist in the corpus (the coverage gate flags a collapse whose
  target is not emitted).

A candidate-G leaf is "covered" iff it is minted (name-match) OR present here
with an emitted target. Anything in neither is the walk's remaining work -- the
gate reports it by name, so nothing is silently omitted (ADR-0028 totality;
ODR-0022 §5 residue discipline).

DEFERRED (NOT collapsed): the ~18 economically-distinct Category-G *monetary*
leaves (asking / sold / list / estimate prices, rents, deposits, ground rent,
service charges, fees, deed / permit costs, `potentialCost`) are NOT recorded
here. ODR-0024 R3 (council session-028 Q3) withdrew the earlier collapse of
these onto `opda:price`: `opda:price` is the Category-D *fixtures* amount only
(ODR-0022 §4 / §1 / G1), so reusing it for headline / recurring / refundable
amounts was *false coverage* — it conflated incompatible value semantics (a
one-shot sale price, a recurring ground rent, a refundable deposit) under one
bare `xsd:decimal`. They are deferred to the held Category-G **monetary walk**
(ODR-0008d item-3), where a value-structured `opda:MonetaryAmount` (magnitude +
ISO-4217 currency) is reused as the *datatype* across distinct per-economic-kind
properties, each on its own bearer. Until that walk lands these leaves are
genuinely uncovered — `ci-category-g-coverage` reports them by name (the honest
167/188, not the prior false 185/188).
"""

from __future__ import annotations


# Candidate-G leaf name -> local name of the existing `opda:` term it
# collapses/reuses into. Entries are added as each batch dispositions free-text
# and monetary leaves to their shared property instead of minting a per-leaf
# one (ADR-0031 work-item 2 curated walk).
#
# Two ratified collapse patterns (ODR-0022 + ODR-0024 R3):
#   - §Rules.1 Category-A free-text collapse to `opda:disclosureDetail`: the
#     generic prose tails (`details` / `description` / `summaryDescription` /
#     `propertyFullDescription` / `dimensionDetails` / `caption` + the
#     building-safety remedial-work prose `workAlreadyDone` / `workToBeDone`).
#     The question each elaborates is carried by the subject node + instance-
#     level `dct:source`, NEVER a per-leaf property (§Rules.6).
#   - identity reuse to an existing join predicate (`uprn` -> `opda:hasUPRN`,
#     `address` -> `opda:hasAddress`): collapses onto that predicate rather than
#     minting a duplicate flat property (ODR-0005 / ODR-0015 own the canonical
#     modelling).
# Monetary leaves do NOT collapse here — ODR-0024 R3 withdrew the earlier
# §4-monetary-reuse-to-`opda:price` collapse (see the module docstring): the
# ~18 monetary leaves (asking/sold/list/estimate prices, rents, deposits, ground
# rent, service charges, fees, deed/permit costs, `potentialCost`) are DEFERRED
# to the held Category-G monetary walk (ODR-0008d item-3), not collapsed onto the
# Category-D fixtures price.
COLLAPSED: dict[str, str] = {
    # --- Category-A free-text prose tails -> opda:disclosureDetail ---------
    # (`description` is overwhelmingly survey/planning/search prose; the four
    # *Description tails are property/marketing prose; `caption` is a media
    # caption; the buildingSafety remedial-work tails + licence `requirements`
    # are free-text elaborations of their parent disclosure question.)
    "details": "disclosureDetail",
    "description": "disclosureDetail",
    "summaryDescription": "disclosureDetail",
    "propertyFullDescription": "disclosureDetail",
    "dimensionDetails": "disclosureDetail",
    "caption": "disclosureDetail",
    "workAlreadyDone": "disclosureDetail",
    "workToBeDone": "disclosureDetail",
    # --- schoolType bands -> opda:schoolType (ODR-0024 R4) -----------------
    # The five nearbyFacilities.schools[].schoolType.{college,nursery,primary,
    # secondary,private} bands were previously minted as five range-less
    # generic object properties (opda:primary / private / …) — namespace
    # landmines the council rejected (session-028 Q1). ODR-0024 R4 collapses
    # them to ONE opda:schoolType datatype property over opda:SchoolTypeScheme;
    # each band name stays COVERED via this collapse (target opda:schoolType is
    # emitted in the descriptive module).
    "college": "schoolType",
    "nursery": "schoolType",
    "primary": "schoolType",
    "secondary": "schoolType",
    "private": "schoolType",
    # --- identity leaves already modelled by an existing join predicate ----
    # `uprn` reuses opda:hasUPRN (ODR-0005 §6a — the contingent UPRN
    # identifier predicate); `address` reuses opda:hasAddress (ODR-0015 §3a —
    # the Property→opda:Address join). Minting a second flat opda:uprn /
    # opda:address would duplicate the canonical modelling (ODR-0005
    # Anti-pattern §3 / §5); the leaf is COVERED by the existing predicate.
    "uprn": "hasUPRN",
    "address": "hasAddress",
}
