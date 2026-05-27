# OPDA Ontology — Diagnostic Exemplars

Harness for the **diagnostic exemplar policy** ratified by
[ODR-0004 §8a](../../../../docs/ontology/odr/ODR-0004-pdtf-ontology-foundation.md).
Path is in the parent OPDA repo (not the nested `source/03-standards/schemas/` or
`trust-framework/` sub-repos), per ODR-0004 §8a storage discipline.

## Purpose

Each exemplar is **IC-only** — a worked individual used solely to pressure-test
identity criteria and rigidity for one named hard case. The TBox/ABox boundary
is the **deliverable** boundary; exemplars are the **thinking** boundary.
ODR-0005 is the first record to discharge its IC gate against this set.

## Filename convention

Descriptive kebab-case (FIBO test-case-naming discipline — the filename is the
documentation). Small files (≤ ~50 lines) per Davis's BBC test-suite discipline.

## Current canonical set

### Input to S005 — Property & Land Identity Crux ✅ (closed 2026-05-27)

| Exemplar | Hard case it isolates |
|---|---|
| `registered-freehold-house.ttl` | Baseline easy case (UPRN present, title registered, single proprietor). Differentiates the harder cases. |
| `unregistered-pre-first-registration-house.ttl` | Legal layer absent + UPRN absent. Guarino's "IC must work without legal anchor" + Cagle's graceful-degradation challenge. **Will be amended post-S005 to add the common-law LegalEstate individual explicitly** (Kendall+Davis cardinality-test requirement). |
| `flat-with-split-uprn.ttl` | UPRN succession via re-numbering. Rule 6 (UPRN contingent, not IC); physical identity persists across administrative re-issue. |

### Input to S015 — Address & Geography ✅ (closed 2026-05-27)

| Exemplar | Hard case it isolates |
|---|---|
| `flat-no-uprn-newly-converted.ttl` | Address exists without UPRN; subdivision created two new Properties whose UPRN issuance lags AddressBase. Tests Q1 UFO category accommodation of UPRN-absence. Amended post-S015 to use `opda:Address` resource shape (S015 Q1 Kind verdict). |
| `listed-building-divergent-addresses.ttl` | Three divergent address surfaces (title / marketing / INSPIRE) on one Property. Tests Q6 co-reference SHACL shape across address presentations. Amended post-S015 to add `opda:hasAddress` join predicates. |
| `rural-plot-inspire-no-uprn.ttl` | Undeveloped land with INSPIRE Identifier but no UPRN and no postal address. Tests Q5 GeoSPARQL-deferral interface; Q7 different PII regime (no postal delivery). Amended post-S015 to manifest `opda:Address` instance with `addressVariant "inspire"`. |

### Input to S006 — Agents & Roles (pending; between-session prep)

| Exemplar | Hard case it isolates |
|---|---|
| `person-with-name-change.ttl` | Person IC over deed-poll name change. Tests Q1 — is name-mutation the same Person individual (yes; PROV-O captured) or two (no)? |
| `organisation-with-merger.ttl` | Organisation IC over entity merger. Two predecessors dissolve; successor is a new individual with `prov:wasDerivedFrom` chains. Tests Q1 + Q6 (FIBO LegalEntity/LEI pattern vs entity-merger pattern). |
| `proprietorship-relator-multi-proprietor.ttl` | Proprietorship as UFO Relator with multiple Proprietor Role instances. Tests Q3 (joint-tenancy multi-proprietor case) + Q2 (RoleMixin vs Role distinction). |

### Input to S009 — Claims, Evidence & Provenance (pending; between-session prep)

| Exemplar | Hard case it isolates |
|---|---|
| `claim-with-document-evidence.ttl` | PR claim supported by grant of probate. Tests Q1 80%-PROV-O coverage + Q2 `prov:qualifiedAttribution` with `prov:hadRole`. eIDAS Substantial assurance for court-issued instrument; trust-framework conformance via `dct:conformsTo`. |
| `claim-with-electronic-record-evidence.ttl` | Identity claim supported by HMRC API tax-record. Tests electronic-record evidence-type at eIDAS Substantial. Q7 SHACL-over-PROV `sh:xone` evidence-type discrimination. |
| `claim-with-vouch-evidence.ttl` | Residency claim supported by SRA-solicitor vouch. Tests vouch-evidence type at eIDAS Low (corroborative not authoritative regardless of voucher quality). Q2 `prov:hadRole opda:Voucher` for the voucher's qualified attribution alongside the subject's attribution. |

## Expected-report pairing

Per ODR-0004 §8a each exemplar TTL **MUST** be paired with an
`expected-report.ttl` recording the `sh:ValidationReport` the exemplar should
produce when validated against the ratified shapes graph. The exemplar then
becomes a CI regression test, not just documentation
(pattern: DASH `dash:GraphValidationTestCase`; BioPortal SHACL-Test framework).

**Pre-S005 status:** the `expected-report.ttl` companions are deferred. The
shapes graph does not yet exist (ODR-0005 stays `proposed` until the Council
settles the IC). At S005 close the Queen amends each exemplar with its
companion report; the gate clears when each exemplar+report pair drives a CI
regression test.

## Provisional namespace

The literal base URI for `opda:` is **WG-owned** (ODR-0004 Rule 1; Knublauch DA
withdrawal demand). The exemplars use `https://opda.uk/ns/` as the institutional
default placeholder. The `w3id.org/opda/` alternative (operationally-strongest
per ODR-0004 Consequences) and any other WG choice will be substituted
mechanically when ratification lands. Each exemplar header carries
`dct:status "draft"` per ODR-0004's pre-ratification convention.

## Predicate provisionality

The TBox the exemplars instantiate against (`opda:Property`,
`opda:RegisteredTitle`, `opda:identifiesSameProperty`, `opda:uprn`, etc.) is
itself unratified. Names follow ODR-0005's stub plus the layer-segregated naming
of ODR-0004 §Rule 2 (Kinds in CamelCase, etc.) but are **provisional** — S005
will settle classes; downstream module ODRs settle the predicates. Inline
comments in each TTL flag the open questions.

## Citation discipline (from consuming ODR)

Per ODR-0004 §8a + Pandit's amendment, the consuming ODR's `## Rules` cites
each exemplar by path AND one-line description of the named hard case.
ODR-0005 will cite this set; downstream `kind: pattern` ODRs will cite their
own exemplars per ODR-0001 A9 §Per-kind discipline (b).

## Adding an exemplar

1. Name the hard case in one sentence. If you can't, it isn't an exemplar yet.
2. Author the smallest TTL that exposes the IC-bearing surfaces. No SHACL
   shape; no overlay; no decorative metadata.
3. Add a row to the table above with the hard case named.
4. Cite from the consuming ODR's `## Rules`.
5. Pair with `expected-report.ttl` at the consuming ODR's ratification session.
