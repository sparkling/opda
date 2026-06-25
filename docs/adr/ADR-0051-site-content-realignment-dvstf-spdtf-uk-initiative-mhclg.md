---
status: proposed
date: 2026-06-25
tags: [website, governance, terminology, standards]
supersedes: []
depends-on: []
implements: []
---

# Site content realignment: DVSTF/SPDTF terminology, UK-initiative chart, standards alignment, and the MHCLG roadmap

## Context and Problem Statement

A stakeholder review by **Maria Harris** identified a batch of content corrections the public OPDA site (opda.org.uk) needs so that its terminology, governance diagrams, and external-standards references are accurate and aligned to the live UK Smart Data / Smart Property landscape — in particular ahead of surfacing the MHCLG *Home Buying and Selling Reform Roadmap* announcement.

The corrections fall into five threads:

1. **Trust-framework terminology drift.** The site still uses **DIATF** ("Digital Identity & Attributes Trust Framework"), which the government has renamed. It should read **DVSTF** (Digital Verification Services Trust Framework).
2. **Versioned-spec terminology drift.** References to **"PDTF v2.0"** should read **SPDTF** (Smart Property Data Trust Framework) — consistent with the already-correct "Smart Property Data Trust Framework Sandbox" naming on the UK-initiative page.
3. **Errors in the UK-initiative governance chart** (`/governance/uk-initiative`): the Smart Data Council is mis-placed, an acronym is wrong, and a now-unwanted reference appears in the delivery tier.
4. **Forward-looking standards references** (claims, Verifiable Credentials, API specs) that currently lean on PDTF v2.0 / the legacy propdata.org.uk developer site must instead align to the standards OPDA is authoring for Smart Property and to the **Smart Data Guidebook** (draft) and/or the established **Open Banking** (Open Banking Ltd / Open Banking future entity) and **Open Energy** (Icebreaker One — Perseus) standards.
5. **The MHCLG announcement** (Home Buying and Selling Reform Roadmap, gov.uk) is not yet represented. It should appear as its own page in the strategy **"Wider context"** section beneath the UK Industrial Strategy, and the Industrial Strategy page's **"Reading list"** should be promoted to its own page and extended with the DBT Smart Data Strategy, the Economic Impact Analysis, and the MHCLG consultation response + roadmap.

## Decision Drivers

* Public-facing accuracy: the site is referenced by government and industry stakeholders; stale acronyms and superseded spec names undermine credibility.
* Provenance hygiene: forward-looking technical claims must not silently inherit unratified content from PDTF v2.0 or the legacy propdata.org.uk site (the latter carries OPDA copyright but was neither authored nor approved by OPDA — see the companion ADR).
* Alignment to the federated Smart Data direction: OPDA is one scheme provider among Open Banking / Open Energy; references should point at the cross-scheme canon (Smart Data Guidebook, DSIT Digital Verification Services).
* Timeliness: the MHCLG roadmap is a live, citable government output and the most authoritative anchor for the initiative.

## Considered Options

* **Apply the corrections as a single coordinated content pass** — sweep the terminology, fix the chart, re-scope the standards references, and add the MHCLG/reading-list pages together, recorded under one ADR.
* **Defer the standards-alignment thread (4)** as a separate workstream, applying only the mechanical fixes (terminology, chart, new pages) now.
* **Do nothing / piecemeal edits** without a recorded decision.

## Decision Outcome

Chosen option: **"Apply the corrections as a single coordinated content pass."** The threads are interdependent (the terminology swap touches the same pages as the chart and standards edits) and share one stakeholder source, so a single ADR + one implementation pass keeps them coherent. Thread 4 (standards alignment) is the only thread with an external dependency (Guidebook / Perseus access); it proceeds on the parts that can be done now and records the rest as a tracked open question rather than blocking the batch.

### Implementation tasks

**Thread 1 — DIATF → DVSTF.** Replace every reference to "DIATF" and the expansion "Digital Identity & Attributes Trust Framework" (and "Digital Identity and Attributes Trust Framework") with **DVSTF** / "Digital Verification Services Trust Framework". Known occurrences (verify exhaustively at implementation time): `src/pages/glossary.astro`, `src/pages/modelling/standards-stack.astro`, `src/pages/library/external-references.astro`, `src/pages/modelling/bounded-contexts.astro`, `src/pages/governance/{departments,index,toip-governance,legislation,strategic-alignment,uk-initiative}.astro`, `src/pages/strategy/{index,industrial-strategy}.astro`, `docs/linked-data-initiative/02-linked-data-model-architecture.md`, `docs/ontology/odr/ODR-0020-*.md`, `docs/manual/**`, `source/03-standards/ontology/opda-contexts.ttl`.
  * **Scope guard:** do NOT edit anything under `source/07-website/related-domains/propdata.org.uk/` (archived third-party snapshot — see companion ADR) and treat the ontology corpus (`source/03-standards/ontology/**`) carefully — a corpus edit requires the full ontology CI gates + `build:data` model regeneration. If a `.ttl` glossary/scope-note edit is in scope, run `make ci-ontology` and regenerate `src/data/ontology-model.json`.
  * Update the glossary entry itself (definition + acronym) so the canonical definition leads.

**Thread 2 — PDTF v2.0 → SPDTF.** Replace "PDTF v2.0" / "PDTF v2" with **SPDTF** (Smart Property Data Trust Framework) in site pages: `src/pages/modelling/{shacl-shapes,ontology,bounded-contexts,standards-stack}.astro`, `src/pages/glossary.astro`, `src/pages/governance/{data-stewardship,strategic-alignment,uk-initiative}.astro`, `src/pages/strategy/project-roadmap.astro`.
  * **Do NOT** rewrite historical ADR/ODR records (`docs/adr/ADR-0001-*.md`, `docs/ontology/odr/ODR-0002-*.md`, `src/generated/odr/*`) — they are dated decisions; a superseding note is the correct mechanism, not silent edits.
  * **Do NOT** edit `source/03-standards/trust-framework/**` (the imported PDTF spec is an upstream artefact in a nested git repo).

**Thread 3 — UK-initiative chart corrections** (`src/pages/governance/uk-initiative.astro`):
  * **Smart Data Council** — remove from the Tier 3 box (the "five tiers at a glance" `flowchart TB`, currently `T3 … Smart Data Council · HBSG`) and reposition it between Tier 1 and Tier 2, or as an offshoot of Tier 1, framed as the **engagement entity for Legislation & Policy**. Reflect the same correction in the detailed Tier-3 `flowchart LR` and surrounding prose where the Council is described as a Tier-3 forum.
  * **HBSG → HBSC** — rename every occurrence (the two flowcharts, edge labels `OPDA -.represented on.-> HBSG` / `HBSG -.feeds BASPI into.-> OPDA`, and prose/table cells). Confirm the intended expansion of HBSC with the stakeholder.
  * **Tier 4 box** — remove the "Smart Data Challenge" reference from the T4 box (`Smart Data Challenge · HMLR LLC Programme` → `HMLR LLC Programme`). (Broader Smart Data Challenge / Moverly references elsewhere on the page are handled by the companion ADR.)
  * Diagrams are authored bare per the project Mermaid convention — keep `:::paletteName` classes, do not hardcode theme.

**Thread 4 — Forward-looking standards references.** Audit references to emerging/future standards for **claims, Verifiable Credentials, and API specs** and re-anchor them away from PDTF v2.0 and propdata.org.uk content toward: (a) the Smart Property standards OPDA is authoring; (b) the **Smart Data Guidebook** (draft); and/or (c) **Open Banking** (Open Banking Ltd / future entity) and **Open Energy** (Icebreaker One — Perseus, open source) standards.
  * **Open question / external dependency:** Guidebook draft-chapter access and the Open Finance standards/architecture from Open Banking are pending (the stakeholder will supply the Guidebook chapters as documents if direct access fails; Perseus is open source and reachable). Implement re-anchoring only where the target canon is available; flag the remainder in the deferred-work register rather than inventing alignment.

**Thread 5 — MHCLG roadmap + reading list:**
  * Add a **new page** for the MHCLG *Home Buying and Selling Reform Roadmap* announcement, sourced from gov.uk (`https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap`). The PDF is committed at `source/08-external-references/uk-government/MHCLG-Home-Buying-and-Selling-Reform-Roadmap.pdf` (62pp) — link it via the project resource viewer (`/resource.html?path=source/08-external-references/uk-government/MHCLG-Home-Buying-and-Selling-Reform-Roadmap.pdf`). Surface the page as a **card in the strategy "Wider context" grid** (`src/pages/strategy/index.astro`) positioned **directly beneath the UK Industrial Strategy card**.
  * Promote the Industrial Strategy **"Reading list"** (`src/pages/strategy/industrial-strategy.astro` `#readingList`) into its **own page**, linked from where the section currently sits, and extend it with: **DBT Smart Data Strategy** (`https://assets.publishing.service.gov.uk/media/69c11f9ed588c92c483e4b66/smart-data-strategy.pdf` — not yet committed; download into `source/08-external-references/uk-government/` and link locally, or cite the gov.uk URL), **Economic Impact Analysis** (already committed at `source/08-external-references/uk-government/understanding-the-costs-and-benefits-of-smart-data-use-cases-research-report.pdf` — link locally), and the **MHCLG consultation response + roadmap** (the roadmap PDF above).

### Consequences

* Good, because the public site stops citing renamed/superseded frameworks (DIATF, PDTF v2.0) and stale forward-looking claims, improving credibility with government and industry stakeholders.
* Good, because the MHCLG roadmap — the most authoritative current anchor — becomes a first-class, citable page.
* Good, because forward-looking standards references are re-pointed at the federated Smart Data canon rather than unratified legacy content.
* Neutral, because the acronym swaps are mechanical but wide-reaching; care is needed not to edit dated decision records or upstream/nested-repo artefacts.
* Bad, because Thread 4 cannot be fully completed until the Smart Data Guidebook chapters and Open Banking Open Finance materials are available, leaving a tracked residue.

### Confirmation

* `grep -rEi "DIATF|Digital Identity (and|&) Attributes Trust Framework"` over `src/` returns no live-page hits (archived `source/07-website/related-domains/**` and dated ADR/ODR records excluded).
* `grep -rE "PDTF v2"` over `src/pages/` returns no hits.
* `/governance/uk-initiative` renders with the Smart Data Council at Tier 1↔2, "HBSC" throughout, and no "Smart Data Challenge" in the Tier 4 box.
* `/strategy` shows an MHCLG roadmap card beneath the Industrial Strategy card; the reading list resolves as its own page containing the four added documents.
* `make test` green; `make build` clean for the edited pages; if any ontology `.ttl` was touched, `make ci-ontology` green and `src/data/ontology-model.json` regenerated.

## More Information

* **Stakeholder source:** Maria Harris (site review). Companion decision: **ADR-0052** (stakeholder-review remediation — member parity, propdata.org.uk provenance, Moverly, accreditation gaps), which shares this review's provenance and overlaps on the propdata.org.uk and Smart Data Challenge / Moverly threads.
* **Terminology expansions (confirm with stakeholder):** DVSTF = Digital Verification Services Trust Framework (the government rename of DIATF under the DSIT digital-verification regime); SPDTF = Smart Property Data Trust Framework (rebrand of "PDTF v2.0", consistent with the existing "Smart Property Data Trust Framework Sandbox" usage).
* **External sources:**
  * MHCLG roadmap (gov.uk): https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap — local copy: `Home buying and selling reform roadmap 3.pdf`.
  * DBT Smart Data Strategy: https://assets.publishing.service.gov.uk/media/69c11f9ed588c92c483e4b66/smart-data-strategy.pdf
  * Economic Impact Analysis: https://assets.publishing.service.gov.uk/media/6a2194968e85b4e5346abf72/understanding-the-costs-and-benefits-of-smart-data-use-cases-research-report.pdf
* **Pending external inputs (Thread 4):** Smart Data Guidebook draft chapters (stakeholder to supply if direct access unavailable); Open Banking Open Finance standards/architecture (awaited); Icebreaker One — Perseus (Open Energy, open source).
