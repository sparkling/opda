---
status: accepted
date: 2026-05-18
tags: [governance, vocabulary, accreditation, dcam, dmbok]
supersedes: []
depends-on: []
implements: []
---

# Selective adoption of DCAM v3 and DAMA-DMBOK2 elements

## Context and Problem Statement

OPDA's governance and standards machinery has grown organically:

- `governance.md` defines GA / Issuer / Holder / Verifier / TRO roles and the four operational functions (Coordination, Technical Review, Compliance & Risk, Engagement) — published as PDTF v2.
- Pages 24, 25, 26 (commit `dfcdb08`) added Domain Data Stewards, a 12-seat Executive Committee, RACI, SLAs, decision log, and stakeholder engagement modes.
- Pages 12–16 cover bounded contexts and the PDTF schemas (1,538 deduplicated data elements across the base transaction plus 16 canonical overlays).
- The Conformance Scheme (page 20) treats compliance as binary: a member firm is compliant against a release tag or it isn't.

OPDA member firms operate inside organisations that already use industry-standard data management frameworks — most commonly **DAMA-DMBOK2** (DAMA International) and increasingly **DCAM v3** (EDM Council). These frameworks are the lingua franca for data management conversations with member firms' data offices, with regulators (FCA, ICO), and with the consumer-advocacy bodies OPDA is engaging.

OPDA's framework has not been mapped to either standard. There is therefore no shared vocabulary when a member firm asks "where does PDTF compliance fit in our DCAM assessment?" or "which DAMA knowledge areas does OPDA address?". The handover dated 2026-05-18 already references DCAM-style stewardship as an aspiration; this ADR makes the alignment explicit and decides how far to take it.

## Decision Drivers

1. **Shared vocabulary with member firms.** Most data offices speak DAMA / DCAM. Aligning lowers the translation cost when explaining PDTF.
2. **Maturity-based accreditation.** Binary pass/fail loses signal. A maturity-scored model differentiates "first attempt" from "operationalised at scale".
3. **Evidence-based conformance.** DCAM's artifact/evidence discipline pushes vague conformance claims toward auditability.
4. **Filling known gaps.** Data Quality and Data Security are weakly addressed today; both frameworks have mature treatments worth borrowing.
5. **Regulator dialogue.** FCA and ICO conversations land more cleanly when OPDA's framework is positioned in their reference frame.
6. **Not reinventing.** Where industry has solved a problem, copying is faster and more credible than rolling our own.
7. **Respect DCAM licensing without hiding the lineage.** DCAM is a commercial framework owned by the EDM Council. OPDA may freely name DCAM as an inspiration or source across any context (published pages, ADRs, academic papers, member-firm comms, conference talks) — naming is not licensing-protected. What does require a license is *verbatim quotation* of capability text, sub-capability descriptions, evidence criteria, or maturity-level definitions. See §"Vote and Dissent" newly-resolved #2 for the rationale.

## Considered Options

* **A — Don't adopt; keep bespoke.** OPDA's framework is substantive and the property-data domain has features (transaction-centric, multi-overlay, statutory data sources like HMLR) that don't sit cleanly in DCAM/DMBOK's general-purpose vocabulary. Maintains full sovereignty over framework structure. Loses vocabulary alignment and forfeits the gap-filling shortcut.
* **B — Wholesale adoption of DCAM v3.** License DCAM v3 from EDM Council, restructure OPDA's published framework around the eight components, run member firms through formal DCAM assessments. Maximum vocabulary alignment with finance-sector data offices. High cost: commercial licensing, full restructure of 24+ governance pages, training overhead.
* **C — Wholesale adoption of DAMA-DMBOK2.** Restructure the Knowledge Base navigation around the 11 knowledge areas (or the seven in scope for OPDA). Use the DAMA Wheel as the top-level information architecture. Disrupts the current numbered-pages structure that has just been established.
* **D — Selective adoption of specific elements from each (chosen).** Adopt the elements that fill identified gaps or align with existing OPDA work, without restructuring around either framework's top-level taxonomy. Continue to publish OPDA's framework in its current information architecture, with cross-references to DCAM components and DAMA KAs.

## Decision Outcome

Chosen option: **D — Selective adoption of specific elements from each**, because wholesale adoption (B or C) would force restructuring 24+ governance pages without sufficient gain. The frameworks are designed for general data-management organisations; some KAs are genuinely out of scope (operating a DW/BI platform; custodying property data) while others are indirect or adjacent rather than fully N/A (see §"More Information" → "Reassessing the four boundaries"). Selective adoption captures the vocabulary win and the gap-filling win without the restructure cost.

Adopt the following elements in three waves plus a "genuinely out of scope" list.

### Wave 1 — Vocabulary alignment (low effort, high signalling value)

Per Decision driver 7 (as revised in the second-pass review — see §"Vote and Dissent" newly-resolved #2), OPDA may name DCAM and DAMA-DMBOK as sources in any context. Only verbatim quotation of capability text, sub-capability descriptions, evidence criteria, or maturity-level definitions requires a license. So Wave 1 labels can carry the source names directly.

**From DCAM v3 (named as source; no verbatim quotation):**

- **"Operating Model"** as the published name for what `/governance/data-stewardship`, `/governance/meetings-and-feedback`, and `/governance/stakeholder-engagement` describe. DCAM v3's third component; adopting the name directly. Replaces no content; just labels.
- **"Business Data Knowledge"** as the banner for the dictionary / glossary / ontology workstream (`/modelling/data-dictionary`, `/modelling/business-glossary`, `/modelling/concept-taxonomy`, `/modelling/ontology`, `/modelling/shacl-shapes`, `/modelling/jsonld-mappings`). DCAM v3's eighth component; adopting the name directly. Validates this work as core, not adjacent.

The "DCAM v3-inspired" or "drawn from DCAM v3" attribution can appear on those pages — page intro / footer — without licensing exposure.

**From DAMA-DMBOK2:**

- **DAMA Wheel cross-reference table** — for each existing OPDA page, label the DAMA KA(s) it serves. KAs that are genuinely out of scope (operating a DW/BI platform; custodying property data) explicitly disclaimed in a single sentence each. Indirect / adjacent KAs labelled accordingly so the boundary is auditable rather than hidden.
- **Per-KA template** — establish a consistent rubric for each page: *Purpose · Activities · Deliverables · Roles · Metrics · Maturity*. Apply incrementally.

### Wave 2 — Gap-filling workstreams (higher effort, EC sign-off needed)

**Data Quality framework** (fills DMBOK KA #11):

- **Owner:** Compliance & Risk WG (DQ dimensions map onto UK GDPR Art 5(1)(d) accuracy obligations). Technical WG provides schema hooks and per-overlay validation rules.
- Adopt the six standard DQ dimensions: **accuracy, completeness, consistency, timeliness, uniqueness, validity**.
- Define DQ measurement and reporting for each PDTF claim type at each Assurance Level.
- Extend the Conformance Scheme (`/governance/conformance-scheme`) so a member firm reports a DQ profile, not just a binary compliance flag.
- New page at `/governance/data-quality` (placeholder slug — confirm with C&R WG at kick-off).

**Data Security framework** (fills DMBOK KA #5 beyond crypto):

- **Owner:** Compliance & Risk WG (per `governance.md` §3.C they already own data-protection impact assessment).
- Formalise the implicit security controls (issuer onboarding KYC/KYB, DID key management, signature verification, revocation handling) into a named workstream with policy + checklist + audit profile.
- Anchor on existing `compliance-and-policy-checklist.md` and `Code of Conduct 2026.pdf`.
- New page at `/governance/data-security` (placeholder slug — confirm with C&R WG at kick-off).

**Maturity-based accreditation — two axes:**

OPDA's existing Assurance Levels (AL1–AL4) describe *the claim*; the new capability scoring describes *the firm*. They are orthogonal, and both are published.

- **Axis 1 — Assurance Level (existing):** AL1 self-asserted · AL2 accredited issuer · AL3 accredited issuer with extra controls or proxy authority · AL4 official primary authority. Per-claim property.
- **Axis 2 — Capability score (new):** three dimensions scored per capability the member firm claims compliance against:
  - *Engagement* — governance authority engaged for that capability.
  - *Process* — process established and repeatable.
  - *Evidence* — auditable artifacts exist.

  Per-firm property.
- Each capability gets an **Evidence requirement** in the Conformance Scheme: what artifact proves the claim.
- Output: a new **Accreditation Directory** at `/governance/accreditation-directory` with per-firm cards showing AL coverage + capability scores. Full spec in [ADR-0004](./ADR-0004-accreditation-directory.md).
- Expected EC discussion at the next quarterly meeting.

*Worked example.* Firm X is AL3 + Process 4/6, Evidence 3/6 → high-assurance claims, mid-maturity operations. Firm Y is AL2 + Process 5/6, Evidence 5/6 → medium-assurance claims, mature operations. Both views are useful to a consumer or a regulator; collapsing them into one number loses signal.

**Document-attachment policy for PDTF overlays** (promoted from Wave 3 — see §"Vote and Dissent" resolved #6):

- Several v3 overlays carry unstructured attachments today (TA10 plans, EPCs, leasehold packs, photographs) without a published handling policy. Promoted ahead of broader Document & Content work because the artefacts are already in production overlays.
- **Owner:** Technical WG (the overlays are theirs) with Compliance & Risk WG input on retention and consent.
- Define per-attachment-type: file-format requirements, signing / integrity requirements, retention guidance for issuers, consent semantics for consumers.
- New page at `/governance/overlay-attachments` (placeholder slug — confirm with Technical WG at kick-off).

### Wave 3 — Adjacent and indirect (monitor, or pick up opportunistically)

These come from the reassessment in §"More Information". Each is real OPDA work, but smaller in scope than Wave 2 and not requiring EC sign-off to begin scoping.

- **GARP for OPDA's institutional records (DMBOK #7 — second strand).** Apply GARP principles (accountability, integrity, protection, compliance, availability, retention, disposition, transparency) to the OPDA source tree (markdown, transcripts, briefings, PDFs). Lighter than Wave 2's overlay-attachment policy — mostly a published handling policy plus retention defaults per `source/` subtree. The overlay-attachment strand was promoted to Wave 2 (§"Vote and Dissent" resolved #6).
- **Storage & Operations guidance (DMBOK #4) — retention and disposal.** When the Trust Registry moves toward production, publish member-firm retention/disposal guidance for PDTF claims, anchored on UK GDPR retention requirements. Required for the consumer-trust narrative.
- **AI/ML governance over PDTF data (DCAM Analytics sub-capabilities + Architecture sub-capabilities).** Watching brief on ICO and EU AI Act guidance. Bias/fairness considerations specific to property data are non-trivial (historical red-lining patterns embedded in transaction histories). Pick up when the first member firm publishes a PDTF-trained model and needs a published data-use basis.
- **Data-product discipline for OPDA's meta-analytics outputs (DMBOK #9 carve-out).** Apply data-product discipline (lineage, release plan, versioning) to the Accreditation Directory, Standards Report, Consumer Survey, ecosystem dashboards. Extend `provenance-map.yaml` toward a lineage dictionary as new reports are produced.
- **Annual EC review of Wave 3 items.** ~15-minute agenda item at one EC meeting per year (suggest the one nearest the AGM). Walk each Wave 3 item: has its trigger fired (promote to Wave 2)? Has the item rotted (close out)? Or does the watching brief continue? Belt-and-braces against event-driven triggers that never fire.

### Genuinely out of scope

- **Full DCAM v3 licensing.** Cost / process overhead not justified at OPDA's scale today. Revisit when ≥3 member firms request formal DCAM scoring alignment.
- **Operating a data warehouse or BI platform for OPDA itself.** OPDA is a standards body; analytical infrastructure stays with member firms and regulators.
- **Custodying member-firm property data.** OPDA never takes possession of property-transaction claims. Trust Registry holds DIDs and revocation lists, not property data.
- **DCAM's analytics-platform capabilities** (model lifecycle, MLOps tooling, feature stores). Even within the AI/ML watching brief above, OPDA scopes only the *data-use* governance, not the platform engineering.

### Consequences

* Good, because shared vocabulary with member firms' data offices and with regulators.
* Good, because quantifiable maturity story for the Accreditation Directory — a better marketing artefact than a list of binary compliance flags.
* Good, because identified gaps (DQ, Security) now have framework-anchored remits, not green-field debates.
* Good, because DCAM's evidence/artifact discipline pushes the Conformance Scheme toward auditability.
* Bad, because retrofitting effort. Adding KA labels and per-KA structure to 24+ existing pages is a multi-session task; tempting to do once and drift.
* Bad, because vocabulary creep. Pulling in framework terms without their full context can introduce ambiguity ("Governance" means different things in DCAM, DMBOK, and OPDA's own usage).
* Bad, because Wave 2 expansion. DQ and Security frameworks each merit their own ADR before becoming pages. This ADR commits direction, not page content.
* Bad, because selectivity drift. Each future contributor will be tempted to pull in additional DCAM/DMBOK elements. The "Genuinely out of scope" list is the hard boundary; Wave 3 is the soft boundary (move items into Wave 2 explicitly rather than letting them drift in).
* Bad, because Wave 3 expansion ambiguity. Wave 3 items are "monitor or pick up opportunistically" — that wording is permissive and easy to misread as a backlog commitment. Each Wave 3 item has a triggering condition (inline) plus the annual EC review catches drift.
* Bad, because renumber decoupling. Page numbering was deferred to a separate renumber exercise (§"Vote and Dissent" resolved #4 — subsequently retired by ADRs 0002 + 0003). Risk at the time: Wave 2 drafting stalls waiting for the renumber. Mitigation in place: draft pages under provisional filenames and rename at publication time.
* Neutral, because Wave 1 (vocabulary) is fully reversible — remove the labels, the substance stays. Wave 2 (DQ, Security, maturity scoring) becomes harder to reverse once the Accreditation Directory uses the new maturity scores; expect member firms to anchor on whatever scoring scheme is published first. Wave 3 items are individually reversible at any time before they become published pages.

### Confirmation

- Wave 2 (DQ, Security, Maturity Accreditation, Overlay attachments) requires EC ratification before workstream kickoff. Per-wave progress tracked in [ADR-0005](./ADR-0005-deferred-work-register.md).
- Wave 3 review is a standing ~15-minute agenda item at the AGM-adjacent EC meeting (see §"Wave 3 — Adjacent and indirect"). Annual cadence; outputs minuted.
- Wave 1 vocabulary labels visible in the governance sidebar grouping defined by `src/lib/site.ts`; "DCAM v3-inspired" attribution discoverable on the named pages.

## More Information

### Analysis — coverage matrices

**OPDA framework today**

| Domain | Where documented | Maturity |
|---|---|---|
| Principles | `governance.md` §1, Articles of Association | Established |
| Roles & onboarding | `governance.md` §2, Accreditation Policy | Established |
| Decision rights & voting | Page 24, Code of Conduct §EC | New (draft) |
| Operational cadence & SLAs | Page 25 | New (draft) |
| Stakeholder engagement | Page 26 | New (draft) |
| Schema architecture | Pages 12, 16, 30–34 | Established |
| Data dictionary / business glossary | Pages 13, 14 | Established |
| Trust registry & VC mechanics | `governance.md` §B, PDTF Spec | Established |
| Change management & SOP | `governance.md` §6, page 21 | Established |
| Conformance scheme | Page 20 | Binary (pass/fail) |
| Data quality framework | — | **Gap** |
| Data security policy (beyond crypto) | — | **Gap** |
| Maturity model for accreditation | — | **Gap** |

**DCAM v3 — 8 components**

EDM Council's Data Management Capability Assessment Model, current version v3. 34 capabilities, 101 sub-capabilities, three scoring dimensions (Engagement, Process, Evidence).

| # | DCAM component | OPDA coverage | Notes |
|---|---|---|---|
| 1 | Data Strategy | Partial | Articles + Constitution + DPMSG roadmap; no consolidated "data strategy" doc |
| 2 | Business Case | Partial | Briefing pack to government; no per-member adoption business case |
| 3 | Operating Model | **Strong** | New pages 24–26 — EC, WGs, RACI, SLAs |
| 4 | Funding | Weak | Membership tiers exist; funding model for OPDA itself undocumented |
| 5 | Organizational Collaboration | **Strong** | Page 26 — five engagement modes; DPMSG steering |
| 6 | Governance | **Strong** | Pages 24–26 plus `governance.md` |
| 7 | Architecture | **Strong** | PDTF schemas, overlays, bounded contexts, ontology |
| 8 | Business Data Knowledge | Partial-to-strong | Pages 13, 14; SKOS taxonomy planned |

**DAMA-DMBOK2 — 11 knowledge areas**

| # | DMBOK KA | OPDA coverage | Notes |
|---|---|---|---|
| 1 | Data Governance (centre) | **Strong** | Pages 24–26, EC, RACI |
| 2 | Data Architecture | **Strong** | Pages 12, 30–34 |
| 3 | Data Modeling & Design | **Strong** | JSON Schema, SHACL, OWL planned |
| 4 | Data Storage & Operations | Indirect | OPDA operates Trust Registry + KB infrastructure; should publish retention/disposal guidance. See "Reassessing the four boundaries". |
| 5 | Data Security | Weak | VC crypto + did:web exist; no security framework |
| 6 | Data Integration & Interoperability | **Strong** | W3C VC, JSON-LD, OID4VP |
| 7 | Document & Content Management | Indirect-to-strong | Source tree is a CMS; PDTF overlays include attached documents (TA10 plans, EPCs, leasehold packs). See "Reassessing the four boundaries". |
| 8 | Reference & Master Data | **Strong** | Bounded contexts treat HMLR / AVM as authorities |
| 9 | Data Warehousing & BI | Mostly N/A | Carve-out for OPDA's meta-analytical outputs (Accreditation Directory, Standards Report). See "Reassessing the four boundaries". |
| 10 | Metadata Management | **Strong** | SKOS, ontology, JSON-LD, data dictionary |
| 11 | Data Quality Management | Weak | Conformance scheme is binary pass/fail |

### Reassessing the four "out of scope" boundaries

An initial draft of this ADR placed DCAM Analytics Management and DMBOK KAs #4 (Storage & Operations), #7 (Document & Content Management), #9 (Data Warehousing & BI) flatly out of scope. Reviewing each shows the boundary is less clean than that phrase suggests. Three of the four warrant some form of OPDA position.

#### DCAM Analytics Management — Adjacent

- DCAM v3's eight named components do not include a standalone Analytics component (v2.x had one; v3 folded analytics-and-insights capabilities under Architecture and Business Data Knowledge).
- PDTF data is a downstream training corpus. Member firms use PDTF claim history for AVMs, fraud scoring, comparable-sales analysis and market reports. Schema design choices (granularity of fields, time-series capture, comparable inclusions) materially shape what analytics is possible.
- AI/ML governance is becoming a regulatory expectation (ICO guidance, EU AI Act). The data OPDA standardises feeds into models that affect consumers (valuations, mortgage decisions, listing visibility).
- Property data has well-documented equity hazards: historical red-lining patterns and pricing distortions can be embedded in transaction histories, then propagated by ML systems trained on them.
- **Position:** Adjacent. OPDA does not operate analytics; it shapes the corpus. Watching brief on AI/ML data-use principles for PDTF claims, including bias/fairness considerations specific to property data. Pick up when the first member firm publishes a PDTF-trained model and a data-use basis is needed.

#### DMBOK Data Storage & Operations — Indirect

- OPDA does not hold member firms' property data — correct.
- OPDA *does* operate trust-registry infrastructure (DIDs, status lists, revocation logs) and the Knowledge Base itself. Both have DBA-style operational requirements: backup, key rotation, availability targets, capacity planning.
- More importantly, OPDA should publish **retention and disposal guidance** for member firms holding PDTF claims. UK GDPR requires defined retention policies; "how long does a verified PDTF claim live in a member firm's database after the transaction completes?" is currently undefined. Consumers will ask this. So will the ICO.
- **Position:** Indirect. Not a major workstream now. Pick up when (a) the Trust Registry moves to a production-grade deployment and needs a documented SLA, or (b) the consumer-trust narrative needs an answer to "what happens to my data after my house sale?".

#### DMBOK Document & Content Management — In scope

- DMBOK Chapter 9 covers documents and information in "a range of unstructured media, especially documents needed to support legal and regulatory compliance".
- PDTF v3 overlays embed document attachments throughout: TA10 fittings & contents, leasehold packs, EPCs, plans, photographs. The base `pdtf:Document` type carries unstructured payloads alongside structured claims.
- The Knowledge Base source tree itself is a document and content management system: 200+ markdown files, PDFs of constitutional documents, `.vtt` meeting transcripts, briefings to government, member-firm communications.
- **Generally Accepted Recordkeeping Principles (GARP)** — accountability, integrity, protection, compliance, availability, retention, disposition, transparency — overlap almost perfectly with OPDA's own published principles in `governance.md` §1.
- **Position:** Should be IN scope. The earlier dismissal was wrong. Promote to Wave 3 with two strands: (1) GARP-based handling for OPDA's institutional records; (2) document-attachment policy for the overlays that carry unstructured payloads.

#### DMBOK Data Warehousing & BI — Mostly out, with a small carve-out

- OPDA does not operate a warehouse or BI platform. This part of the original dismissal stands.
- OPDA does, however, produce meta-analytical outputs: the Accreditation Directory, the Spring 2025 Standards Report, the Consumer Survey, ecosystem and conformance trend reports.
- These deserve BI-style discipline: a published data-product spec per output, lineage from source artefacts, a release plan, versioning. DMBOK Chapter 11's "Lineage Dictionary" deliverable is close to OPDA's existing `provenance-map.yaml`.
- **Position:** Mostly out of scope; small carve-out for OPDA's own meta-analytics outputs as data products with lineage and release discipline. Not a major workstream; extend `provenance-map.yaml` opportunistically as new reports are produced.

### Commissioned follow-up

- [ADR-0004 — Accreditation Directory spec](./ADR-0004-accreditation-directory.md) — commissioned by §"Vote and Dissent" newly-resolved #4 below; covers hosting, scoring granularity, visibility, schema, evidence requirements per score level, naming, and how Maturity Accreditation resolves the parallel-execution cross-dependency with DQ + Security.

### References

**Primary sources**

- DCAM v3 — [EDM Council DCAM page](https://edmcouncil.org/frameworks/dcam/) (8 components, 34 capabilities, 3-dimensional scoring)
- DAMA-DMBOK2 — [DAMA International](https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/); [Atlan's DMBOK2 guide](https://atlan.com/dama-dmbok-framework/) (11 KAs, DAMA Wheel, Environmental Factors Hexagon)

**Secondary sources for the boundary reassessment**

- DMBOK Chapter 6 (Storage & Operations) — [Glitchdata wiki](https://wiki.glitchdata.com/index.php/DMBOK:_CHAPTER_9_Document_and_Content_Management) and [DAMA Rocky Mountain context diagram](https://damarmc.org/news/13346019)
- DMBOK Chapter 9 (Document & Content Management) + GARP principles — [Glitchdata wiki](https://wiki.glitchdata.com/index.php/DMBOK:_CHAPTER_9_Document_and_Content_Management) (accountability, integrity, protection, compliance, availability, retention, disposition, transparency)
- DMBOK Chapter 11 (Data Warehousing & BI) activities and Lineage Dictionary deliverable — [DAMA-DK DMBOK2 overview](https://www.dama-dk.org/onewebmedia/DAMA%20DMBOK2_PDF.pdf)
- DCAM v2.x Analytics Management component and v3 consolidation — [Snowflake DCAM explainer](https://www.snowflake.com/en/fundamentals/data-governance/framework/dcam/); [Projective Group DCAM v3.1 review](https://www.projectivegroup.com/dcam-v3-1-the-future-ready-framework-for-strategic-data-management/)

**OPDA source files referenced**

- `source/03-standards/trust-framework/docs/governance.md` — PDTF governance principles, roles, operational functions, 8-step SOP
- `src/pages/governance/data-stewardship.astro` — Domain Data Stewards, EC 12-seat composition, RACI, voting
- `src/pages/governance/meetings-and-feedback.astro` — cadence, SLAs, decision log, consultation windows
- `src/pages/governance/stakeholder-engagement.astro` — five engagement modes
- `src/pages/governance/conformance-scheme.astro` — current (binary) Conformance Scheme
- `source/01-organisation/constitution-and-policies/Articles of Association 2026.pdf` arts. 16, 18
- `source/01-organisation/accreditation/Accreditation Scheme 2026.docx`

**Related ADRs**

- [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — folder hierarchy and slug taxonomy. Surfaced from this ADR's "governance-section renumber" open question.
- [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) — idiomatic Astro refactor. Bundled with ADR-0002.
- [ADR-0004](./ADR-0004-accreditation-directory.md) — Accreditation Directory spec. Commissioned by this ADR; the artefact that operationalises Wave 2 maturity scoring.
- [ADR-0005](./ADR-0005-deferred-work-register.md) — Deferred work register. Tracks Wave 1/2/3 progress against this ADR.

## Amendments

- **2026-05-18 — Renumbered + relocated.** Previously `source/00-deliverables/governance/dcam-framework/0001-adoption-decision.md`. ADR numbering is now global across `docs/adr/`.
- **2026-05-25 — Refactored to canonical MADR 4.x format.** Bullet-list metadata moved to YAML frontmatter; section names aligned to the MADR vocabulary; analysis tables, boundary reassessment, and review outcomes preserved in `## More Information` and `## Vote and Dissent` respectively. Filename gained the `ADR-` prefix per the `ruflo-adr` `adr-create` skill. Substance unchanged.

## Vote and Dissent

### Resolved during review (2026-05-18)

The six open questions in the first draft of this ADR were walked through and decided. Outcomes recorded here so the next reader doesn't re-litigate.

1. **Licensing.** *Originally resolved 2026-05-18 as "vocabulary-only, never cite". Revised same day to "permissive: name freely, no verbatim".* Naming DCAM as a source or inspiration is always fine (it's a fact, not a licensing exposure). Quoting capability text, sub-capability descriptions, evidence criteria, or maturity-level definitions verbatim — or republishing licensed DCAM materials — requires a license. Engagement WG dialogue with EDM Council remains deferred (see "newly resolved" #5).
2. **Maturity scale calibration.** *Resolved: layer the two axes.* AL1–AL4 (per-claim) plus a Capability score with three dimensions (per-firm). See Wave 2 §"Maturity-based accreditation" for the worked example.
3. **Data Quality ownership.** *Resolved: Compliance & Risk WG owns the framework; Technical WG provides schema hooks and per-overlay validation rules.* DQ dimensions sit alongside UK GDPR Art 5(1)(d) accuracy obligations, which Compliance & Risk already covers.
4. **Page numbering.** *Resolved: renumber the whole governance section as a separate exercise — subsequently retired by ADR-0002 + ADR-0003.* This ADR no longer specifies page numbers for new pages; numbers were dropped entirely. The pre-existing 14→30 chain break noted in the 2026-05-18 handover folded into the same migration.
5. **Wave 3 triggering conditions.** *Resolved: both inline triggers and an annual EC review.* Inline triggers for responsiveness; annual review catches drift. See the "Annual EC review" item in Wave 3.
6. **PDTF overlay attachment policy.** *Resolved: partial promotion.* The overlay-attachment strand moved to Wave 2 (artefacts are already in production overlays). The GARP-for-OPDA-records strand stays in Wave 3.

### Newly resolved during review (2026-05-18 second pass)

The four newly-surfaced questions were walked through and decided. Plus a follow-up on item #1 (Licensing) that softened the original "vocabulary-only" stance.

1. **Scope and ordering of the governance-section renumber.** *Resolved: drop numbering entirely.* Addressed by [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) (folder hierarchy and slug taxonomy) + [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) (idiomatic Astro refactor) — both implemented 2026-05-18. URLs are now bare slugs (`/governance/data-stewardship`), no numbering, sidebar ordering controlled by `src/lib/site.ts`. Renumber question can never recur.

2. **DCAM attribution boundary.** *Resolved: permissive — name freely, no verbatim.* Naming DCAM is always fine in any OPDA context (KB pages, ADRs, academic papers, EC meeting papers, member-firm comms, conference talks, regulator submissions). Quoting capability text, sub-capability descriptions, evidence criteria, or maturity-level definitions verbatim requires a license; same for republishing any DCAM-licensed material. This supersedes the originally "vocabulary-only" reading of the original Q1 — see Decision driver 7 (revised) above. The line is the line drawn by copyright law: cite freely, don't reproduce.

3. **Wave 2 timeline.** *Resolved: all three workstreams in parallel from day 1.* Compliance & Risk WG runs DQ + Security + Maturity Accreditation simultaneously. Technical WG runs the Overlay attachment policy independently. *Pre-condition:* Engagement WG to recruit additional C&R members from firms with mature internal DQ / Security functions (large lenders, surveyors, conveyancing platforms) before workstream kick-off. Trade-off accepted: maximum velocity at the cost of recruitment dependency. Maturity Accreditation will need to specify dimensions with placeholders for DQ + Security content that ships in parallel — see [ADR-0004](./ADR-0004-accreditation-directory.md) (commissioned) for how the spec resolves the cross-dependency.

4. **Annual EC review slot.** *Resolved: EC meeting nearest the AGM.* Pairs the Wave 3 review with the annual governance moment (annual report, member ratifications). Q1 / Q4 depending on AGM date. Action: add the 15-minute Wave 3 review item to the AGM-adjacent EC meeting's agenda template.

5. **DCAM licensing dialogue with EDM Council (follow-up to item #1).** *Resolved: stay deferred.* Re-evaluate if a member firm asks for formal DCAM alignment, or if an academic paper / regulator submission directly references the framework, or if OPDA's Accreditation Directory would benefit from EDMC endorsement.
