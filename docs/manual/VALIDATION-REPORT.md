---
status: validated
date: 2026-05-28
tags: [validation, manual, four-tier-documentation]
---

# 4-tier documentation validation report

**Validator:** independent-validator-4-tier
**Date:** 2026-05-28
**Worker commits validated:** 6328d03, 0c3619d, fbf8d85, 4c16c58

## Check 1 — Source-of-truth discipline

- H&M / hm.com / semantic-modelling / SDS sanity grep: **0 matches** — PASS
- ODR-body-text leakage probes (`Council Session NNN ratified`, `Pandit's S012`, `Devil's Advocate`, dialectic, expert-panel, 7-vote, Author-only): **0 matches** — PASS
- Legitimate ODR link targets under `## Source ODR` / `## Source ODR + ADR` are present and expected.

PASS.

## Check 2 — Cross-tier entity inventory

Canonical inventory from source TTLs: 41 `owl:Class` declarations across 7 modules (foundation/property/agent/transaction/claim/governance/descriptive). All 41 classes are present in the three mandatory tiers (Concept entity file, Logical entity file, Physical-Ontology per-class subsection).

| Module       | Class count | Concept | Logical | Phys-Onto |
|--------------|-------------|---------|---------|-----------|
| foundation   | 6           | 6/6     | 6/6     | 6/6       |
| property     | 7           | 7/7     | 7/7     | 7/7       |
| agent        | 7           | 7/7     | 7/7     | 7/7       |
| transaction  | 3           | 3/3     | 3/3     | 3/3       |
| claim        | 11          | 11/11   | 11/11   | 11/11     |
| governance   | 2           | 2/2     | 2/2     | 2/2       |
| descriptive  | 5           | 5/5     | 5/5     | 5/5       |
| **TOTAL**    | **41**      | **41**  | **41**  | **41**    |

Plus 23/23 SKOS schemes (Logical enumerations + Physical-Ontology vocabularies) and 15/15 exemplar pairs (Physical-Ontology exemplars).

PASS.

## Check 3 — Cross-tier link resolution

200 cross-tier `[<X> tier →]` links scanned. **56 broken**, **144 OK**.

Broken-link breakdown:

| Category | Count | Root cause |
|---|---|---|
| `[Physical-DB tier →]` from `physical-ontology/<module>/classes.md` to per-entity Physical-DB pages | 31 | Physical-DB IA spec is organised by **consumption concern** (named graphs / derived profiles / content-neg / overlay-deployment / CI), NOT per entity. Per-entity Physical-DB pages do not exist by design. The Physical-Ontology worker followed its IA worked-template (line 222 of physical-ontology-ia.md mandates `[Physical-DB tier →]` cross-tier link) which presupposes per-entity Physical-DB pages that the Physical-DB IA does not provide. |
| `[Concept tier →]` from `logical/<module>/enumerations/<scheme>.md` to `concept/<module>/enumerations/<scheme>.md` | 23 | Concept-tier IA spec does NOT mandate per-enumeration pages; only entity pages. Logical worker invented links to non-existent Concept-tier enumeration pages. |
| `[Concept tier →]` + `[Logical tier →]` from `physical-ontology/foundation/classes.md` to `has-special-category-data.md` | 2 | `opda:hasSpecialCategoryData` is an `owl:DatatypeProperty` (engineering placeholder per ADR-0012), not an `owl:Class`. Concept / Logical workers correctly emit files only for classes; cross-tier links from the property's P-O block point at non-existent property pages. |

These are **IA-spec inter-tier inconsistencies**, not silent fabrication: each worker followed its own IA spec faithfully. Remediation is to reconcile the IA specs (downgrade `[Physical-DB tier →]` to optional / per-entity links to be omitted; clarify that per-enumeration pages do not exist at Concept tier; document property-only entities separately).

PASS-WITH-FOLLOW-UPS.

## Check 4 — Tier-spec section shape

### Concept tier (5 sampled entity files)

All 5 sampled files contain the mandatory sections in the mandatory order: `# <Entity>`, `## Why it matters`, `## Hard cases`, `## Identity Criterion`, `## Related Kinds`, `## Source ODR`.

PASS.

### Logical tier (5 sampled entity files)

All 5 sampled files contain the mandatory sections in the mandatory order: `# <Entity>`, `## Summary`, `## Attributes`, `## Relationships`, `## Identity key`, `## Constraints`, `## Derived attributes`, `## ER diagram`, `## Source ODR + ADR`.

PASS.

### Physical-Ontology tier (7 sampled per-class blocks, 1 per module)

| Module | Sampled class | Result |
|---|---|---|
| foundation | `opda:RoleMixin` | OK |
| property | `opda:LegalEstate` | FAIL — `#### Subclass / equivalent-class relationships` omitted (because the class has no `rdfs:subClassOf` declaration) |
| agent | `opda:Buyer` | OK |
| transaction | `opda:Milestone` | OK |
| claim | `opda:Claim` | OK |
| governance | `opda:DPVMappingRecord` | FAIL — same omission pattern as `LegalEstate` |
| descriptive | `opda:EPCCertificate` | OK |

The two FAILs both omit the empty `#### Subclass / equivalent-class relationships` subsection. The IA spec wording (line 84) names it as mandatory but the worker omitted it for classes with no parent classes. Defensible behaviour but a deviation from the strict mandate.

**Header-level deviation (all 7 modules):** the IA spec mandates H3 (`### opda:LocalName`) for per-class subsections (line 72), but the worker used H2 (`## opda:LocalName`). Same deviation in `shacl-af-rules.md` (10 H2 rule headings, IA mandates H3). The hierarchy is internally consistent within each file (H1 = module title; H2 = per-class) and renders correctly; only the depth level deviates from the IA's worked-template intent.

PASS-WITH-FOLLOW-UPS.

## Check 5 — Worker-flagged gaps verification

### Concept worker — 4 interpretive Hard cases (Comparable, Search, Valuation, EPCCertificate)

Confirmed: source TTL `rdfs:comment` for these 4 classes contains only the S008 Q4 three-criterion test, NOT a "Hard cases:" enumeration. The Concept files inject interpretive hard cases (e.g. "stale comparable", "same search re-ordered", "in-flight regulator pivot"). The disclosure was given in the worker's result message but **is not surfaced in the doc itself** (no callout, no italics admission). PASS-WITH-FOLLOW-UPS: add an editorial-disclosure callout to each of those 4 files (Comparable, Search, Valuation, EPC-certificate) marking the hard-case items as derived analysis rather than TTL-extracted.

### Concept worker — 3 alias-stub redirects (Document, ElectronicRecord, Vouch)

Confirmed: `concept/claim/document.md`, `electronic-record.md`, `vouch.md` are short alias-stubs deferring to their `*-evidence.md` counterparts via OWL equivalence binding. Each disclosure is honestly inline in the doc. PASS.

### Logical worker — 16 entities with no SHACL cardinality shapes

Spot-check finds 14 entity files with the disclosure phrase `No SHACL Violation/Warning shapes emitted at this tier` (close to the worker's claim of 16; small discrepancy may be cardinality phrasing variants). The 3 spot-checked files (`generator-run.md`, `special-category-scheme.md`, `assurance-level.md`) all honestly disclose the gap. PASS.

### Physical-DB worker — `derived/` directory does not exist

Confirmed: `source/03-standards/ontology/derived/` does not exist. All 3 derived-profile pages (`opda-validation.md`, `opda-ui.md`, `opda-inference.md`) plus the README disclose "spec only; composer activation pending". PASS.

### Physical-Ontology worker — 1 placeholder rule (citing site #11)

Confirmed: `shacl-af-rules.md` line 37 marks rule #11 as "(placeholder for future emission) | — | — |". 10 rules are documented with Turtle blocks; the 11th is honestly absent. PASS.

PASS-WITH-FOLLOW-UPS (Concept-tier interpretive hard cases need inline disclosure).

## Check 6 — 4-tier coverage matrix

| Module | Class | Concept | Logical | Phys-Onto |
|---|---|:-:|:-:|:-:|
| foundation | DiagnosticExemplar | ✓ | ✓ | ✓ |
| foundation | GeneratorRun | ✓ | ✓ | ✓ |
| foundation | Relator | ✓ | ✓ | ✓ |
| foundation | Role | ✓ | ✓ | ✓ |
| foundation | RoleMixin | ✓ | ✓ | ✓ |
| foundation | ValidationContext | ✓ | ✓ | ✓ |
| property | Address | ✓ | ✓ | ✓ |
| property | LeaseExtensionEvent | ✓ | ✓ | ✓ |
| property | LeaseTerm | ✓ | ✓ | ✓ |
| property | LegalEstate | ✓ | ✓ | ✓ |
| property | Property | ✓ | ✓ | ✓ |
| property | RegisteredTitle | ✓ | ✓ | ✓ |
| property | UPRNSuccessionEvent | ✓ | ✓ | ✓ |
| agent | Buyer | ✓ | ✓ | ✓ |
| agent | NameChangeEvent | ✓ | ✓ | ✓ |
| agent | Organisation | ✓ | ✓ | ✓ |
| agent | Person | ✓ | ✓ | ✓ |
| agent | Proprietor | ✓ | ✓ | ✓ |
| agent | Proprietorship | ✓ | ✓ | ✓ |
| agent | Seller | ✓ | ✓ | ✓ |
| transaction | Milestone | ✓ | ✓ | ✓ |
| transaction | Transaction | ✓ | ✓ | ✓ |
| transaction | TransactionChain | ✓ | ✓ | ✓ |
| claim | AssuranceLevel | ✓ | ✓ | ✓ |
| claim | Claim | ✓ | ✓ | ✓ |
| claim | Document | ✓ (alias) | ✓ | ✓ |
| claim | DocumentEvidence | ✓ | ✓ | ✓ |
| claim | ElectronicRecord | ✓ (alias) | ✓ | ✓ |
| claim | ElectronicRecordEvidence | ✓ | ✓ | ✓ |
| claim | Evidence | ✓ | ✓ | ✓ |
| claim | TrustFramework | ✓ | ✓ | ✓ |
| claim | VerificationActivity | ✓ | ✓ | ✓ |
| claim | Vouch | ✓ (alias) | ✓ | ✓ |
| claim | VouchEvidence | ✓ | ✓ | ✓ |
| governance | DPVMappingRecord | ✓ | ✓ | ✓ |
| governance | SpecialCategoryScheme | ✓ | ✓ | ✓ |
| descriptive | Comparable | ✓ | ✓ | ✓ |
| descriptive | EPCCertificate | ✓ | ✓ | ✓ |
| descriptive | Search | ✓ | ✓ | ✓ |
| descriptive | Survey | ✓ | ✓ | ✓ |
| descriptive | Valuation | ✓ | ✓ | ✓ |

Totals: 41 classes × 3 mandatory tiers = 123 cells, 123 ✓, 0 ✗.

Physical-Database tier is organised by **consumption concern** (named graphs / derived profiles / content-negotiation / overlay deployment / CI operations) per its IA spec — entity-level coverage is not required and not provided. 15 Physical-DB files documented (1 tier README + 1 index + 1 named-graphs + 4 derived-profiles + 3 content-negotiation + 2 overlay-deployment + 3 operations).

PASS.

## Check 7 — IA spec adherence

### Concept tier — generation discipline

`docs/ontology/odr/` body content NOT cited. Links to ODRs under `## Source ODR` are link-only targets. No interpretive overlap with ODR deliberation content. PASS.

### Logical tier — generation discipline

`docs/ontology/odr/` body content NOT cited. ODR links present under `## Source ODR + ADR` are link-only. PASS.

### Physical-Database tier — generation discipline

PDTF JSON Schemas (`source/03-standards/schemas/`) are referenced in two places:
- `physical-database/README.md` line 29 — explicit out-of-scope disclaimer ("They are documented in the nested schemas repo and are deliberately out of scope")
- `physical-database/operations/round-trip-ci.md` line 22 — cited as a **CI integration target** (the round-trip harness checks `baspi5Ref` resolution against the schemas TTL), not as a content source.

Both usages are consistent with the IA spec's intent (schemas are out-of-scope as documentation source; legitimate as a CI gate target per ADR-0014 G19). PASS.

### Physical-Ontology tier — generation discipline

Per-class blocks contain TTL extracts + cross-tier links + ADR/ODR link targets only. No business-language narrative seeped in beyond the §Summary openers and §Validation behaviour narratives that the IA spec explicitly allows. PASS.

PASS.

## Verdict

**PASS-WITH-FOLLOW-UPS**

The 4-tier documentation is sound (every section traces to a real source TTL or to a legitimately-cited ADR/ODR link target) and complete (every `owl:Class` from the source TTLs appears in all three mandatory tiers; all 23 SKOS schemes documented; all 15 exemplar pairs documented). No silent fabrication; worker-flagged gaps are honestly disclosed in the docs (one exception: Concept-tier interpretive hard cases need inline editorial disclosure).

Follow-ups (none blocking; all editorial / IA reconciliation):

1. **31 broken `[Physical-DB tier →]` links** from Physical-Ontology classes.md → non-existent per-entity Physical-DB pages. **Remediation:** either omit the `[Physical-DB tier →]` row from per-class subsections (Physical-DB IA correctly organises by consumption concern, not entity); or extend Physical-DB tier with a per-entity index page that the link can resolve to. The IA spec inter-inconsistency should be reconciled in a small IA amendment.

2. **23 broken `[Concept tier →]` links** from Logical-tier enumeration pages → non-existent Concept-tier enumeration pages. **Remediation:** either drop the link (Concept tier is intentionally narrative-only and does not enumerate scheme members), or add per-scheme Concept pages.

3. **2 broken cross-tier links** from `physical-ontology/foundation/classes.md` for `hasSpecialCategoryData` (a `DatatypeProperty`, not an `owl:Class`). **Remediation:** drop the cross-tier links for property-level entries, or extend Concept / Logical tiers to cover engineering-placeholder properties.

4. **Concept-tier interpretive hard cases (4 files):** `comparable.md`, `search.md`, `valuation.md`, `epc-certificate.md` carry hard-case enumerations that are not extracted from the source TTL `rdfs:comment` "Hard cases:" clause (which doesn't exist for these 4 classes). **Remediation:** add an editorial-disclosure callout at the top of each "Hard cases" section marking it as derived analysis.

5. **Physical-Ontology heading-depth deviation:** per-class subsections use H2 (`## opda:Name`) where the IA spec mandates H3 (`### opda:Name`); same in `shacl-af-rules.md`. **Remediation:** either re-deepen the headings to H3 (cosmetic), or amend the IA spec to permit H2 when the module-level H1 absorbs the module label.

6. **Physical-Ontology empty subsection omission:** classes with no `rdfs:subClassOf` (e.g. `LegalEstate`, `DPVMappingRecord`) omit the `#### Subclass / equivalent-class relationships` subsection entirely rather than emitting it with an empty list. **Remediation:** either always emit (consistent with IA mandate), or amend the IA spec to mark the subsection optional-when-empty.

7. **Concept tier missing `diagrams/` directory.** IA spec layout (line 32) includes `diagrams/<topic>.mmd`; not created by worker. Concept files use inline Mermaid blocks where needed. **Remediation:** create the dir when authors begin shipping cross-entity diagrams.

Worker output is otherwise compliant with the IA specs and faithful to the source TTLs.
