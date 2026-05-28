---
status: proposed
date: 2026-05-28
tags: [physical-ontology, exemplars]
---

# Diagnostic exemplars

15 IC-only diagnostic exemplars per [ODR-0004 §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), each paired with an `expected-report.ttl` SHACL validation report. The pair drives a CI regression test (semantic-equivalence comparison via `tests/baspi5_round_trip/compare_reports.py`).

## What an exemplar is

Per ODR-0004 §8a, an exemplar is the **smallest TTL that exposes one IC-bearing surface** for a named hard case. It is **IC-only** — no SHACL shape, no overlay, no decorative metadata. The filename is the documentation (FIBO test-case-naming discipline).

The paired `expected-report.ttl` records the `sh:ValidationReport` the exemplar should produce when validated against the ratified shapes graph. The exemplar becomes a CI regression test, not just documentation (DASH `dash:GraphValidationTestCase` pattern; BioPortal SHACL-Test framework precedent).

## Catalogue

### Input to S005 — Property and land identity crux

| Exemplar | Hard case | sh:conforms |
|---|---|---|
| [registered-freehold-house](./registered-freehold-house.md) | Baseline easy case (UPRN present, title registered, single proprietor) | true |
| [unregistered-pre-first-registration-house](./unregistered-pre-first-registration-house.md) | LegalEstate-without-RegisteredTitle cardinality test | true |
| [flat-with-split-uprn](./flat-with-split-uprn.md) | UPRN succession via re-numbering | true |

### Input to S015 — Address and geography

| Exemplar | Hard case | sh:conforms |
|---|---|---|
| [flat-no-uprn-newly-converted](./flat-no-uprn-newly-converted.md) | Address exists without UPRN (post-subdivision lag) | true |
| [listed-building-divergent-addresses](./listed-building-divergent-addresses.md) | Three divergent address surfaces (title / marketing / INSPIRE) | true |
| [rural-plot-inspire-no-uprn](./rural-plot-inspire-no-uprn.md) | Undeveloped land with INSPIRE Identifier but no UPRN | true |

### Input to S006 — Agents and roles

| Exemplar | Hard case | sh:conforms |
|---|---|---|
| [person-with-name-change](./person-with-name-change.md) | Person IC over deed-poll name change | true |
| [organisation-with-merger](./organisation-with-merger.md) | Organisation IC over entity merger (predecessors → successor) | true |
| [proprietorship-relator-multi-proprietor](./proprietorship-relator-multi-proprietor.md) | Proprietorship as UFO Relator with multiple Proprietor Role instances | true |

### Input to S009 — Claims, evidence and provenance

| Exemplar | Hard case | sh:conforms |
|---|---|---|
| [claim-with-document-evidence](./claim-with-document-evidence.md) | PR claim supported by grant of probate (eIDAS Substantial) | **false** (Violation: claim missing `prov:wasDerivedFrom`) |
| [claim-with-electronic-record-evidence](./claim-with-electronic-record-evidence.md) | Identity claim supported by HMRC API tax-record (eIDAS Substantial) | **false** (same Violation) |
| [claim-with-vouch-evidence](./claim-with-vouch-evidence.md) | Residency claim supported by SRA-solicitor vouch (eIDAS Low) | **false** (same Violation) |

The three claim exemplars deliberately omit the `prov:wasDerivedFrom` triple to demonstrate `opda:UnprovenancedClaimShape` (Cat 2 Violation) firing. Production claim instances would carry the predicate; the exemplars exercise the validation gate.

### Input to S007 — Transactions and lifecycle

| Exemplar | Hard case | sh:conforms |
|---|---|---|
| [simple-transaction-with-milestones](./simple-transaction-with-milestones.md) | Five canonical milestones with PROV-O Plan-vs-Activity variance reification | true |
| [chain-of-transactions](./chain-of-transactions.md) | Three-link chain via buyer-also-seller participants | true |
| [lease-extension-transaction](./lease-extension-transaction.md) | Statutory lease extension under LRHUDA 1993 | true |

## Pairing discipline

Per ODR-0004 §8a:

- Each exemplar TTL **MUST** be paired with an `<name>-expected-report.ttl` recording the `sh:ValidationReport` the exemplar produces when validated against the ratified shapes graph.
- The pair drives a CI regression test (`compare_reports.py` performs semantic-equivalence comparison on focusNode / resultPath / severity / constraint / message).

## Namespace conventions

- Class graph: `https://w3id.org/opda/#` (WG-ratified 2026-05-27 per Session 003b + ADR-0006)
- Per-exemplar instance prefix: `https://openpropdata.org.uk/data/exemplar/<name>/`

## Source ODR + ADR

- [ODR-0004 §8a — Diagnostic exemplar policy](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ADR-0014 — BASPI5 round-trip MVP harness](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
