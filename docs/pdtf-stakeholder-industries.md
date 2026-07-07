# PDTF Stakeholder Industries — Repo Cross-Reference

> Research note: which industries the Property Data Trust Framework (PDTF) is meant to cover, and
> which artefacts in this repo (JSON Schema, ontology, ADRs/ODRs, website pages) relate to each one.

## Executive summary

PDTF's authoritative stakeholder list is the `role` enum baked directly into the base schema
(`pdtf-transaction.json`) — 12 roles spanning roughly seven industries: estate agency,
conveyancing/legal, surveying, lending, local-authority/search, trading standards, and
landlord/tenant. The repo's own governance chart independently corroborates this via the 13
founding members of the government's Digital Property Market Steering Group (DPMSG).

The canonical role enum (`source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json:165-181`):

```
Seller, Seller's Conveyancer, Prospective Buyer, Buyer, Buyer's Conveyancer,
Estate Agent, Buyer's Agent, Surveyor, Mortgage Broker, Lender, Landlord, Tenant
```

## 1. Estate Agency

**Roles:** `Estate Agent`, `Buyer's Agent`
**Real-world body:** Propertymark (DPMSG founding member)

- **Schema:** `source/03-standards/schemas/src/schemas/v3/overlays/piq.json` (Property Information
  Questionnaire — estate-agent-authored property info)
- **Ontology:** `opda:EstateAgent` role class — `docs/ontology/odr/ODR-0006-agents-and-roles.md`;
  SHACL profile `source/03-standards/ontology/profiles/piq.ttl`
- **ADR/ODR:** ODR-0006 (Agents & Roles); ADR-0028 / ADR-0031 / ADR-0032 (descriptive / Category-G
  emission — material info an agent captures)
- **Website (upstream PDTF marketing site, nested repo):**
  `source/07-website/source/src/pages/for-industry.astro` (`#estate-agents` section — "Digital Sale
  Ready" / Connells case study)

## 2. Conveyancing & Legal Services

**Roles:** `Seller's Conveyancer`, `Buyer's Conveyancer`
**Real-world bodies:** Law Society, Council for Licensed Conveyancers (CLC), Society of Licensed
Conveyancers (SLC), SRA, CILEX, CILEx Regulation

- **Schemas:** `ta6.json`, `ta7.json` (leasehold), `ta10.json` (fittings & contents) — Law Society
  standard forms; `oc1.json` (requisitions on title); `legal-information.json`, `title-deed.json`,
  `freehold-information.json`, `leasehold-information.json` (v1 base schemas)
- **Ontology:** `opda:Conveyancer` role; `opda-agent.ttl` capacity split
  (`opda:hasAssertedCapacity` / `opda:hasEvidencedAuthority`); profiles `ta6.ttl`, `ta7.ttl`,
  `ta10.ttl`, `oc1.ttl`
- **ADR/ODR:** ODR-0006; ODR-0009 (Claims, Evidence, Provenance — evidenced authority for
  POA/probate); ADR-0014 (BASPI5 round-trip harness runs conveyancing-side validation)
- **Website:** governance chart names CLC as a Trust Framework Sandbox delivery partner
  (`src/pages/governance/uk-initiative.astro`, Tier 4)

## 3. Surveying

**Role:** `Surveyor`
**Real-world body:** RICS (Royal Institution of Chartered Surveyors, DPMSG founding member)

- **Schema:** `source/03-standards/schemas/src/schemas/v3/overlays/sr24.json` (Sustainability
  Report); the v3.5 changelog in `docs/linked-data-initiative/01-context-problem-and-market.md` §5
  notes "draft survey & valuation schemas" as roadmap
- **Ontology:** `opda:Surveyor` role — ODR-0006; profile
  `source/03-standards/ontology/profiles/sr24.ttl`
- **Website:** RICS appears in the DPMSG founding-members list,
  `src/pages/governance/uk-initiative.astro` (Tier 3)

## 4. Lending / Mortgage

**Roles:** `Lender`, `Mortgage Broker`
**Real-world bodies:** UK Finance, Building Societies Association (BSA) — both DPMSG founding
members

- **Schema:** `energy-performance-certificate.json` and title/legal schemas feed lender risk
  assessment (per `for-industry.astro` `#lenders` section: "verified valuation inputs — trusted
  EPC, searches, and title data")
- **Ontology:** `opda:Lender` role — ODR-0006; governance layer `opda-governance.ttl`
  (role-based access / visibility model referenced in the lender data-visibility matrix)
- **ADR/ODR:** ODR-0012 (Data Governance Layer — role-based access, AML status visibility)
- **Website:** `for-industry.astro` `#lenders` section (fraud reduction via cryptographic
  provenance, access-control matrix)

## 5. Local Authority / Property Search Providers

No dedicated role-enum value — represented at the organisation level, not the participant level.
**Real-world body:** CoPSO (Council of Property Search Organisations, DPMSG founding member); HMLR
Local Land Charges Programme

- **Schemas:** `con29R.json` (local authority search), `con29DW.json` (drainage & water),
  `llc1.json` (local land charges), `lpe1.json` (leasehold enquiries), `fme1.json` (freehold
  management enquiries), plus `oc1.json`
- **Ontology:** profiles `con29R.ttl`, `con29DW.ttl`, `llc1.ttl`, `lpe1.ttl`, `fme1.ttl`
- **ADR/ODR:** ODR-0022 (Descriptive Layer import strategy covers search-derived data);
  `source/03-standards/rml/` mapping directory (RML mappings from these overlay JSON leaves to RDF)
- **Website:** `src/pages/governance/uk-initiative.astro` Tier 4 — "HMLR Local Land Charges
  Programme — migrating 200+ council registers"

## 6. Trading Standards / Consumer Material-Information Disclosure

**Real-world body:** National Trading Standards Estate and Letting Agency Team (NTS/NTSELAT), Tier
2 in the governance chart

- **Schemas:** `nts.json` (2023), `nts2.json` (2025, material information), `ntsl.json` /
  `ntsl2.json` (leasehold variants), plus the `extensions/` sub-schemas (`as.json` asbestos,
  `jk.json` Japanese knotweed, `sb.json` subsidence, `hs.json` health & safety, etc.)
- **Ontology:** profiles `nts2.ttl`, `ntsl2.ttl`, and the extension profiles (`as.ttl`, `dr.ttl`,
  `jk.ttl`, `sb.ttl`, `hs.ttl`, `la.ttl`, `sf.ttl`, `mc.ttl`, `er.ttl`, `ma.ttl`, `tf.ttl`,
  `sl.ttl`, `hi.ttl`, `fd.ttl`, `oa.ttl`, `oc.ttl`)
- **ADR/ODR:** ADR-0028 (Descriptive-layer walk / Home-pass emission); ADR-0030 (Category-based
  descriptive emission pipeline)
- **Website:** `src/pages/governance/uk-initiative.astro` Tier 2 table — NTS/NTSELAT row, with a
  live resource link to `nts.json`

## 7. Land Registry / Title Registration

**Real-world body:** HM Land Registry (HMLR) — the one body present at every governance tier
(Tier 2 policy lead, Tier 3 hosts DPMSG, Tier 4 delivery)

- **Schema:** `title-deed.json`, `freehold-information.json`, `leasehold-information.json`
- **Ontology:** the headline `opda:Property` / `opda:LegalEstate` / `opda:RegisteredTitle` split —
  `source/03-standards/ontology/opda-property.ttl`; `opda:hasRegisteredTitle` predicate
  (`opda-agent.ttl`)
- **ADR/ODR:** ODR-0005 (Property & Land Identity Crux — the UPRN-joins-nothing defect,
  HMLR-relevant); ADR-0006 (w3id namespace); ADR-0039 (linked-data model as PDTF standards
  foundation)

## 8. Landlord / Tenant (Lettings)

**Roles:** `Landlord`, `Tenant` — present in the base role enum but with no dedicated overlay
form. This is a genuine coverage gap in the current schema, not an oversight in this research.

## 9. Government / Policy & Regulatory

**Bodies:** MHCLG (policy lead), DSIT (Smart Data Scheme, DVSTF), DBT (Smart Data Council host),
FCA, ICO

- **Docs:** `docs/linked-data-initiative/01-context-problem-and-market.md` §3 (DMCC Act 2024,
  Smart Data, Digital Property Packs); ADR-0051 (site realignment to DVSTF/SPDTF terminology,
  MHCLG roadmap page)
- **Website:** `src/pages/governance/uk-initiative.astro` (full 5-tier chart);
  `src/pages/governance/departments.astro`; strategy section pages (MHCLG roadmap, DBT Smart Data
  Strategy)

## 10. Proptech / Integrators / API Consumers

**Real-world body:** Raidiam (Trust Framework Sandbox delivery partner, Open Banking infra
provider)

- **Schema/API:** `source/03-standards/api/` (OpenAPI specs); `index.js` merge engine
  (`getTransactionSchema`, `getValidator`)
- **Website:** `for-industry.astro` `#proptech` section ("one integration, infinite connections");
  `src/pages/pdtf/[...name].astro` — dereferenceable ontology term pages consumed by tooling

## 11. Identity / Trust Verification

**Standard:** OIDC4IDA/eIDAS, W3C DID, DVSTF (renamed from DIATF)

- **Schema:** `source/03-standards/schemas/src/schemas/verifiedClaims/pdtf-verified-claims.json`
- **ODR:** ODR-0016 (W3C VC/DID compatibility — deferred pending a real wallet/DID consumer)
- **Trust framework docs:** `source/03-standards/trust-framework/docs/` (governance, conformance,
  release register)

## Caveats

1. `source/07-website/source/` (the "for-industry" marketing page cited above) is a **separate
   upstream repo** (its own `.git`), not the live OPDA knowledge-base site — treat its stakeholder
   framing as illustrative/upstream, not an OPDA-authored artefact.
2. Landlord/Tenant and surveyor/lending overlays are the thinnest-covered industries in the schema
   layer today — full survey/valuation schemas are marked roadmap (🔵) in
   `docs/linked-data-initiative/01-context-problem-and-market.md`, not yet shipped.
