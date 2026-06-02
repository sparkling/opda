---
status: accepted
date: 2026-05-18
tags: [accreditation, governance, verifiable-credentials]
supersedes: []
depends-on: [ADR-0001]
implements: []
---

# Accreditation Directory spec

## Context and Problem Statement

[ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) Wave 2 commits OPDA to a **Maturity-based Accreditation Directory** that replaces the current binary pass/fail Conformance Scheme with a richer two-axis published view:

- **Assurance Level (existing AL1–AL4)** — describes a *claim*, per-claim property.
- **Capability score (new, three dimensions: Engagement / Process / Evidence)** — describes a *firm*, per-firm property.

The high-level decision was made in [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Wave 2 — Maturity-based accreditation". This ADR specifies the artefact: where it lives, what it contains, who sees it, how member firms feed it.

The directly-related parallel workstreams (per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3):

- **Data Quality framework** (Compliance & Risk WG) — defines the dimensions the directory scores firms on for the DQ capability area.
- **Data Security framework** (Compliance & Risk WG) — same, for the Security capability area.
- **PDTF overlay attachment policy** (Technical WG) — provides attachment-handling rules referenced by the Directory's evidence requirements.

The Directory acts as the **integrator** of these parallel workstreams: it provides the meta-framework into which DQ + Security capabilities are slotted, and exposes member firms' scores against those capabilities.

## Decision Drivers

1. **Replace binary signal with maturity signal.** A list of compliant firms doesn't differentiate between a firm that just-passed and one that's operationalised at scale.
2. **Consumer + regulator legibility.** Buyers, sellers, lenders, FCA, ICO need to be able to read a firm's status without specialist knowledge.
3. **Member-firm comparability.** Firms want to know how they compare; the Directory provides that without needing OPDA to issue a league table.
4. **Audit trail.** Scores must be defensible — backed by artefacts when they matter, not just self-declared.
5. **Operational pragmatism.** OPDA is a small standards body. The Directory must not require a full-time directory manager.
6. **Resolve the parallel-execution cross-dependency.** Since Wave 2's three workstreams run concurrently (per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3), the Directory must define its schema such that DQ + Security fill in their respective capabilities as they ship, without blocking Directory delivery.

## Considered Options

* **A — Extend the existing Conformance Scheme page.** Add maturity scores as columns to the existing Conformance Scheme presentation. Smallest change. Risk: couples two distinct concepts (the scheme vs the directory of accredited firms) into one page that becomes hard to evolve independently.
* **B — Separate Directory page, hybrid scoring (chosen).** New page at `/governance/accreditation-directory`. Per-firm cards showing AL coverage + capability scores. Detailed per-capability data behind each firm; summary roll-ups on the public page. Best for readability + maintainability.
* **C — Separate Directory site.** Standalone site (`directory.opda.org.uk`) outside the Knowledge Base. Maximum independence; significant new infrastructure for OPDA to host. Overkill for current scale.

## Decision Outcome

Chosen option: **B — Separate Directory page, hybrid scoring**, because of clean separation of concerns (Conformance Scheme defines the rules; Directory shows who meets them and at what maturity), reuse of the KB chrome and navigation, and no new infrastructure. The seven sub-decisions follow.

### 1. Hosting

**New KB page at `/governance/accreditation-directory`.** Lives in the Governance section's "OPDA's own rules" group, sibling to Conformance Scheme. Generated as a normal Astro page that consumes data from `src/data/accreditation/` (see §5).

### 2. Scoring granularity — hybrid

**Capabilities scored per-capability; public view rolls up to per-section.**

- **Underlying data:** every capability the framework defines gets a score per firm (Engagement / Process / Evidence). ~30–50 capabilities total once DQ + Security ship.
- **Public view:** firm card shows section averages (~8 sections — Governance, Architecture, DQ, Security, Operating Model, Business Data Knowledge, etc.), with a "drill down" link to the full per-capability detail.
- **Section averages:** simple unweighted mean of capability scores within the section, rounded to one decimal.
- **No overall "firm maturity score".** Resisted explicitly — overall scores invite gaming and obscure trade-offs. Per-section + per-capability is the deepest aggregation.

### 3. Visibility — tiered

| Tier | Audience | Content |
|---|---|---|
| **Public** | Anyone | Firm name, AL coverage badges, per-section average maturity (radar/bar chart per firm), link to drill-down |
| **Drill-down (public)** | Anyone who clicks through | Per-capability scores for that firm, evidence-attachment indicators (without the artefacts themselves) |
| **Member-firm portal** (future, deferred) | Firm + OPDA | Full capability scores, evidence artefacts, audit history, change log |

Public tier suffices for consumers, regulators, comparison-shoppers. Member-firm portal can be added later when needed; this ADR doesn't block on it. Requirements stub at [`docs/specs/member-firm-portal-requirements.md`](../specs/member-firm-portal-requirements.md).

### 4. Update cadence — quarterly, with on-demand re-scoring

- **Default cadence:** quarterly. Firms submit their self-attested scores by the 15th of the quarter-end month; OPDA refreshes the Directory by the 1st of the following quarter.
- **On-demand re-scoring:** a firm can request mid-quarter re-publication when they pass a meaningful milestone (e.g. achieving AL3 issuer status, passing an audit). C&R WG approves the publish.
- **Stale flag:** firms whose data is more than 9 months old (missed two quarters) get a "stale" badge until they submit fresh data. Protects the Directory from showing rotted scores indefinitely.

### 5. Data schema — VC-backed self-attestation, JSON for the render

**Two-format design:**

- **Source of truth:** each firm submits a **W3C Verifiable Credential** signed by their accredited issuer DID, attesting to their capability scores. Stored under `source/04-governance-bodies/accreditation/credentials/{firm-did}/{YYYY-Qn}.json`.
- **Render input:** a build-time aggregator script (`scripts/build-accreditation-directory.mjs`) reads all current-quarter VCs, validates signatures, and produces a flat JSON file at `src/data/accreditation/current.json` consumed by the Directory page.

This means:

- Firms have cryptographic skin-in-the-game for their published scores.
- The Directory cannot diverge from what firms have actually signed.
- Anyone can independently verify a firm's score by checking the VC against the Trust Registry.

**Capability VC payload shape (sketch):**

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1",
               "https://opda.org.uk/pdtf/harness/accreditation/v1"],
  "type": ["VerifiableCredential", "AccreditationStatement"],
  "issuer": "did:web:firm.example.com",
  "issuanceDate": "2026-06-15T00:00:00Z",
  "credentialSubject": {
    "firm": "did:web:firm.example.com",
    "quarter": "2026-Q2",
    "assuranceLevels": ["AL2", "AL3"],
    "capabilities": [
      { "key": "dq.accuracy",
        "engagement": 5, "process": 4, "evidence": 3,
        "evidenceRefs": ["https://firm.example.com/audits/dq-2026-q1.pdf"] }
    ]
  },
  "proof": { }
}
```

### 6. Evidence requirements per score level — three tiers

Maps to the Engagement / Process / Evidence dimension scores (1–6 scale per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) reference to DCAM):

| Dimension score | Evidence requirement |
|---|---|
| 1–2 | Self-asserted only. No artefact required. |
| 3–4 | Self-asserted + artefact link (policy doc, process diagram, runbook). Artefact URL listed in the VC. |
| 5–6 | Self-asserted + artefact link + independent audit attestation. Audit attestation must be a separate VC signed by an audit-eligible DID (initially: OPDA-listed audit partners; future: ISO 19011-aligned firms). |

Member firms self-rate; OPDA spot-checks. A spot-check finding an inflated rating (no artefact backing a score-4 claim, or no audit backing a score-6 claim) drops the score and adds an audit-trail entry visible in the drill-down view.

### 7. Naming — "Accreditation Directory"

**Selected:** "Accreditation Directory". Continuity with the existing "Accreditation Scheme" terminology (from the Articles of Association). Reads naturally: the Scheme defines the rules, the Directory shows who meets them. Alternatives considered:

- "Maturity Register" — too generic; doesn't communicate "this is the list of accredited firms".
- "Conformance Directory" — overloaded with "conformance" which is binary in current usage.
- "Member Capability Profile" — accurate but cumbersome.

### Resolving the parallel-execution cross-dependency

[ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3 committed DQ, Security, and Maturity Accreditation to running in parallel under Compliance & Risk WG. This creates a real cross-dependency:

- Maturity Accreditation defines the *shape* of capability scoring (Engagement / Process / Evidence at 1–6).
- DQ + Security define the *content* — which capabilities exist within their domains, what each measures.

**Resolution:** the Directory ships first with a skeleton schema; DQ and Security each contribute a "capability bundle" PR.

| Phase | Deliverable | Owner |
|---|---|---|
| Phase 0 | This ADR ratified | EC |
| Phase 1 | Directory page rendering with placeholder capabilities (Governance, Architecture, BDK already mappable from existing pages) | C&R WG (Maturity stream) |
| Phase 1 | First C&R WG cohort recruitment for parallel execution | Engagement WG |
| Phase 2 | DQ framework page + capability bundle (6 DQ capabilities: accuracy, completeness, consistency, timeliness, uniqueness, validity) | C&R WG (DQ stream) |
| Phase 2 | Security framework page + capability bundle (TBD count; expect ~5–8 capabilities covering KYC/KYB, key management, signature verification, revocation, audit logging) | C&R WG (Security stream) |
| Phase 3 | Overlay attachment policy referenced by Directory's evidence requirements | Technical WG |
| Phase 4 | First member-firm VC submissions; first quarterly publish | C&R WG + Engagement WG |

Phases 1–3 run in parallel; Phase 4 depends on all three completing.

### Consequences

* Good, because member firms get a quantifiable maturity story — not just a pass/fail badge.
* Good, because consumers + regulators get a richer signal — they can distinguish "early adopter" from "mature operator".
* Good, because self-attestation is cryptographic — VC-signed claims are harder to repudiate or inflate without detection.
* Good, because the spec resolves the parallel-execution cross-dependency — DQ + Security can ship without blocking on Directory finalisation.
* Good, because continuity with existing language — "Accreditation Scheme" + "Accreditation Directory" reads as one coherent governance machinery.
* Bad, because of VC infrastructure dependency. The Directory requires the Trust Registry to be reliable for signature verification. If the Trust Registry has downtime, Directory rebuilds fail. Mitigation: snapshot the most recent valid build state and serve that as a fallback.
* Bad, because of self-attestation gaming. Firms have an incentive to inflate. Mitigation: spot-check process + visible audit-trail when discrepancies are found.
* Bad, because of the recruitment dependency for parallel execution. Cross-references [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3 — if Engagement WG can't recruit C&R members fast enough, the parallelism collapses back to serial.
* Bad, because quarterly cadence may feel slow to high-velocity firms. On-demand re-scoring mitigates; if pressure mounts, can move to monthly later (no ADR needed — just a cadence change).
* Bad, because no "overall maturity score" may frustrate consumers wanting one number. Deliberate. If pressure mounts, a weighted overall could be added — but the weighting becomes politicised. Better to refuse.
* Neutral, because schema design (VC + JSON) is moderate cost to change. Once firms have submitted VCs, the credential format must be backward-compatible or migrated.
* Neutral, because page structure / visibility tiers and cadence are low cost to change; naming is low cost early but high cost once external citations reference "Accreditation Directory".

### Confirmation

- EC ratification of this ADR is Phase 0; subsequent phases (per "Resolving the parallel-execution cross-dependency" table) tracked in [ADR-0005](./ADR-0005-deferred-work-register.md) sections A and C.
- Acceptance test for first quarterly publish: the Directory page renders ≥1 firm card from a verified VC, the drill-down view exposes per-capability scores, and an independent verifier can fetch the VC and reproduce the signature check against the Trust Registry.
- Spot-check process documented as part of Phase 1 (placeholder pending Phase 1 kickoff); spot-check findings logged in the audit-trail surface of the drill-down view.

## More Information

### Open questions

1. **OPDA-listed audit partners.** Phase 4 requires a list of accreditation-audit-eligible DIDs (firms that can sign the score-5-or-6 audit attestations). Who's on the initial list? Likely the Big 4 + a few specialists (e.g. KPMG, Deloitte, BDO + property-data specialists). Engagement WG action — scaffold at [`docs/recruitment/opda-listed-audit-partners.md`](../recruitment/opda-listed-audit-partners.md).
2. **Conformance Scheme integration.** The existing page at `/governance/conformance-scheme` will need an update to point at the Directory and explain the AL × Capability relationship. ADR for the Conformance Scheme update — out of scope for this ADR.
3. **Member-firm portal (deferred tier).** When does the private detailed view get built? Probably triggered by the first member firm asking for it; ADR at that point. Requirements stub at [`docs/specs/member-firm-portal-requirements.md`](../specs/member-firm-portal-requirements.md).
4. **Quarterly publishing automation.** Step 5 of Phase 4 needs an automated pipeline (cron, GitHub Action, etc.) to refresh the Directory. Tooling decision — out of scope for this ADR; an Implementation ADR if needed.
5. **What happens to a firm that leaves OPDA membership mid-quarter?** Stays in Directory as "Former member, last data YYYY-Qn" or drops out immediately? Membership ADR territory — draft scoping at [`docs/adr/_drafts/membership-lifecycle.md`](./_drafts/membership-lifecycle.md).

### References

**Primary sources**

- [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) — selective adoption of DCAM / DAMA-DMBOK; Wave 2 "Maturity-based accreditation" commits to this artefact.
- [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — folder hierarchy under which `/governance/accreditation-directory` will live.
- [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) — Astro architecture this page builds on (typed `site.ts`, build-time chrome).
- [ADR-0005](./ADR-0005-deferred-work-register.md) — Deferred work register; tracks Phase 1–4 progress.

**OPDA source files referenced**

- `src/pages/governance/conformance-scheme.astro` — sibling page; will need update to reference the Directory.
- `source/03-standards/trust-framework/docs/governance.md` — Trust Registry mechanics that VC verification relies on.
- `source/01-organisation/constitution-and-policies/Articles of Association 2026.pdf` — defines the Accreditation Scheme (extends naturally to the Directory).
- `source/01-organisation/accreditation/Accreditation Scheme 2026.docx` — current Scheme document; will need a small update to acknowledge the Directory.

**External references**

- W3C Verifiable Credentials Data Model 2.0 — credential format.
- ISO 19011 — guidelines for auditing management systems (audit-partner eligibility benchmark).

## Amendments

- **2026-05-25 — Refactored to canonical MADR 4.x format.** Bullet-list metadata moved to YAML frontmatter; section names aligned to the MADR vocabulary; "Open questions" preserved under `## More Information`. Filename gained the `ADR-` prefix per the `ruflo-adr` `adr-create` skill. Substance unchanged.
