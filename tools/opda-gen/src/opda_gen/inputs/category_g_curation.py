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
  (the generic `details`/`comments`/`summary` tails) and the §4 monetary-reuse
  to `opda:price` (one shared monetary-amount property, never one per item).
  The value is the local name of the reused `opda:` term, which MUST exist in
  the corpus (the coverage gate flags a collapse whose target is not emitted).

A candidate-G leaf is "covered" iff it is minted (name-match) OR present here
with an emitted target. Anything in neither is the walk's remaining work -- the
gate reports it by name, so nothing is silently omitted (ADR-0028 totality;
ODR-0022 §5 residue discipline).
"""

from __future__ import annotations


# Candidate-G leaf name -> local name of the existing `opda:` term it
# collapses/reuses into. Entries are added as each batch dispositions free-text
# and monetary leaves to their shared property instead of minting a per-leaf
# one (ADR-0031 work-item 2 curated walk).
#
# Two ratified collapse patterns (ODR-0022):
#   - §Rules.1 Category-A free-text collapse to `opda:disclosureDetail`: the
#     generic prose tails (`details` / `description` / `summaryDescription` /
#     `propertyFullDescription` / `dimensionDetails` / `caption` + the
#     building-safety remedial-work prose `workAlreadyDone` / `workToBeDone` /
#     `potentialCost`). The question each elaborates is carried by the subject
#     node + instance-level `dct:source`, NEVER a per-leaf property (§Rules.6).
#   - §4 monetary reuse to `opda:price`: ONE shared monetary-amount property
#     across every priced item — asking/sold/list/estimate prices, rents,
#     deposits, ground rent, service charges, fees, reserve-fund contributions,
#     council-tax charge, permit cost, deed costs. Never one price property per
#     item.
# A third, narrower reuse also lands here: an identity leaf already modelled by
# an existing join predicate (`uprn` -> `opda:hasUPRN`, `address` ->
# `opda:hasAddress`) collapses onto that predicate rather than minting a
# duplicate flat property (ODR-0005 / ODR-0015 own the canonical modelling).
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
    "potentialCost": "disclosureDetail",
    "workAlreadyDone": "disclosureDetail",
    "workToBeDone": "disclosureDetail",
    # --- §4 monetary amounts -> opda:price (one shared property) -----------
    "amount": "price",
    "annualCostOfPermit": "price",
    "annualGroundRent": "price",
    "annualServiceCharge": "price",
    "certificateOfComplianceFee": "price",
    "costsApplicableToTheDeed": "price",
    "councilTaxAnnualCharge": "price",
    "estimatedAmount": "price",
    "estimatedPrice": "price",
    "feeIncludingVAT": "price",
    "forTheManagedAreas": "price",
    "fromTheOwners": "price",
    "holdingDeposit": "price",
    "listPrice": "price",
    "rent": "price",
    "securityDeposit": "price",
    "sharedOwnershipRent": "price",
    "soldPrice": "price",
    # --- identity leaves already modelled by an existing join predicate ----
    # `uprn` reuses opda:hasUPRN (ODR-0005 §6a — the contingent UPRN
    # identifier predicate); `address` reuses opda:hasAddress (ODR-0015 §3a —
    # the Property→opda:Address join). Minting a second flat opda:uprn /
    # opda:address would duplicate the canonical modelling (ODR-0005
    # Anti-pattern §3 / §5); the leaf is COVERED by the existing predicate.
    "uprn": "hasUPRN",
    "address": "hasAddress",
}
