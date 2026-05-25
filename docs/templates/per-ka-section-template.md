---
title: Per-KA section template
purpose: Encode ADR-0001 Wave 1's standard rubric for DAMA Knowledge Area pages — six consistent sections per KA-tagged page
source_adr: docs/adr/0001-adopt-dcam-dmbok-elements.md
---

# Per-KA section template

A consistent rubric for OPDA pages tagged with one or more DAMA-DMBOK2 Knowledge Areas. Established by [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 1 to give member firms' data offices a predictable structure when reading OPDA's framework against their own DAMA / DCAM reference frame.

Apply this template when authoring or revising a KA-tagged page in `src/pages/governance/` or `src/pages/modelling/`. The six sections are: **Purpose · Activities · Deliverables · Roles · Metrics · Maturity**.

## The six sections

| Section | What it answers |
|---|---|
| **Purpose** | Why this KA matters for OPDA. One paragraph. |
| **Activities** | What concrete activities happen under this KA — verbs, not nouns. |
| **Deliverables** | What artefacts the activities produce — docs, schemas, registries, dashboards. |
| **Roles** | Who does what — link to `governance.md` roles or DDS / WG owners. |
| **Metrics** | How OPDA measures whether the KA is working — quantitative where possible. |
| **Maturity** | Where OPDA stands today (gap / partial / established / strong) and what advances maturity. |

## Astro skeleton

Drop into any KA-tagged `.astro` page under `src/pages/`. Each section gets a stable anchor id so the sidebar / TOC can deep-link.

```html
<h2 id="purpose">Purpose</h2>
<section>
  <p>[Why this KA matters for OPDA.]</p>
</section>

<h2 id="activities">Activities</h2>
<section>
  <ul>
    <li>[Activity 1 — verb-led.]</li>
    <li>[Activity 2 — verb-led.]</li>
  </ul>
</section>

<h2 id="deliverables">Deliverables</h2>
<section>
  <ul>
    <li>[Artefact 1 with link.]</li>
    <li>[Artefact 2 with link.]</li>
  </ul>
</section>

<h2 id="roles">Roles</h2>
<section>
  <ul>
    <li><strong>[Role]</strong> — [responsibility, link to governance.md if applicable].</li>
  </ul>
</section>

<h2 id="metrics">Metrics</h2>
<section>
  <ul>
    <li>[Metric 1 — what's measured, what counts as passing.]</li>
  </ul>
</section>

<h2 id="maturity">Maturity</h2>
<section>
  <p>[Gap / Partial / Established / Strong. What advances it.]</p>
</section>
```

## Worked example — Data Quality Management

A partial walkthrough using ADR-0001's framing of DMBOK KA #11. Content authored by Compliance & Risk WG in due course; values below are illustrative only.

```html
<h2 id="purpose">Purpose</h2>
<section>
  <p>
    Define, measure, and report data quality for PDTF claims so that the
    Conformance Scheme can move beyond binary pass/fail to a richer per-dimension
    profile. DQ dimensions map onto UK GDPR Art 5(1)(d) accuracy obligations.
  </p>
</section>

<h2 id="activities">Activities</h2>
<section>
  <ul>
    <li>Define the six DQ dimensions for each PDTF claim type per Assurance Level.</li>
    <li>Author per-claim-type measurement protocols (what counts as a passing value).</li>
    <li>Validate quarterly DQ submissions against the schema and overlay constraints.</li>
    <li>Spot-check sampled scores; flag inflated ratings.</li>
  </ul>
</section>

<h2 id="deliverables">Deliverables</h2>
<section>
  <ul>
    <li>Published DQ framework at <code>/governance/data-quality</code>.</li>
    <li>Measurement-protocol matrix (claim type × dimension).</li>
    <li>Per-firm DQ profile in the Accreditation Directory.</li>
  </ul>
</section>

<h2 id="roles">Roles</h2>
<section>
  <ul>
    <li><strong>Compliance &amp; Risk WG</strong> — owns the framework.</li>
    <li><strong>Technical WG</strong> — provides schema hooks and per-overlay validation rules.</li>
    <li><strong>Domain Data Stewards</strong> — author measurement protocols for their domain.</li>
  </ul>
</section>

<h2 id="metrics">Metrics</h2>
<section>
  <ul>
    <li>% of accredited firms submitting quarterly DQ profiles on time.</li>
    <li>Median DQ score per dimension across the directory.</li>
    <li>Audit-trail-flagged score adjustments per quarter.</li>
  </ul>
</section>

<h2 id="maturity">Maturity</h2>
<section>
  <p>
    Gap → Established once the framework is published and the first quarterly
    DQ profiles land in the Accreditation Directory. Strong once independent
    audit attestations cover ≥ 3 dimensions for ≥ 50% of accredited firms.
  </p>
</section>
```

## Notes on incremental application

Per [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 1, **apply this template incrementally**. Not all pages need every section filled.

- **Existing pages.** When revising a KA-tagged page, add the six section anchors first; fill content as the responsible WG authors it. Empty sections may carry a single line — *"Content pending — \[WG NAME\] to author"* — without breaking the rubric.
- **Wave 2 stubs.** Pages commissioned by ADR-0001 Wave 2 (`/governance/data-quality`, `/governance/data-security`, `/governance/accreditation-directory`, `/governance/overlay-attachments`) already have lead content above the rubric. Append the six sections near the bottom as scaffolding for future WG authoring; don't restructure the existing content.
- **Multi-KA pages.** A page tagged with multiple KAs (e.g. Accreditation Directory tagged Data Governance + Data Quality Management) may merge sections where the substance is shared; split where divergence is material.
- **Out-of-scope KAs.** Pages disclaiming a KA (per ADR-0001's "genuinely out of scope" list) do not need this template — a single disclaiming sentence is sufficient.
- **Skeleton evolution.** If the rubric needs new sections (e.g. Risks, Dependencies), open a follow-up ADR — don't drift the template silently.

## References

- [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) — Wave 1 vocabulary alignment, including this rubric.
- [ADR-0004](../adr/ADR-0004-accreditation-directory.md) — consumes the Metrics + Maturity sections for the Accreditation Directory scoring.
