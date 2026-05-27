---
status: accepted
date: 2026-05-18
tags: [tracking, governance, living-document]
supersedes: []
depends-on: [ADR-0001, ADR-0002, ADR-0003, ADR-0004]
implements: []
---

# Deferred work register from the 2026-05-18 implementation push

## Context and Problem Statement

The 2026-05-18 implementation push shipped:

- ADRs [0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) + [0003](./ADR-0003-idiomatic-astro-refactor.md): full migration of 158 pages to bare-slug URLs + idiomatic Astro (build-time chrome composition, typed `src/lib/site.ts`, `src/components/` library, `public/ui/site.js` deleted).
- [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) Wave 1 vocabulary alignment: sidebar restructured into "OPDA's rules" / "Operating Model" / "Quality & security" groups; PageMeta categories updated on 9 pages.
- [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) Wave 2 page scaffolding: four new stub pages at `/governance/{data-quality,data-security,accreditation-directory,overlay-attachments}` with intros, section headings, and "content pending" callouts.
- [ADR-0004](./ADR-0004-accreditation-directory.md): full spec of the Accreditation Directory artefact.

What was *not* done — and explicitly belongs to someone else (a WG, a future session, a contributor with the right access) — needs to be collected somewhere so it doesn't drift out of sight.

Things that aren't named in writing rot. The Wave 1 "DAMA Wheel cross-reference per page" item is exactly the kind of thing that would be forgotten in six months unless somebody can point at it. The handover note from 2026-05-18 already proved this pattern works (the 14→30 chain break was a known item from a prior handover, not a surprise).

## Decision Drivers

1. **Visibility of remaining work.** The next contributor should see the whole picture without archaeology.
2. **Named ownership.** Each item needs a WG / individual / EC responsibility so accountability is not diffuse.
3. **Triggering conditions.** Explicit so items that aren't ready don't waste review cycles.
4. **One source of truth.** Beats the equivalent information being spread across multiple ADRs, handovers, and project boards.

## Considered Options

* **A — No register; track items in handovers and ADR open-question sections.** Minimal new artefact. Risk: items drift across documents and rot when handovers don't propagate.
* **B — Living register as an ADR (chosen).** Single document, ADR-numbered for permanence, with named ownership and explicit triggering conditions. Items leave when promoted / completed / abandoned / superseded.
* **C — External project tracker.** GitHub Projects or Linear. Higher fidelity (states, assignees, due dates) but lives outside the published artefact set. Adds tool dependency.

## Decision Outcome

Chosen option: **B — Living register as an ADR**, because it sits beside the other ADRs (one place to look), is plain markdown (no tool lock-in), and the discipline of ADR review cycles forces periodic re-evaluation. The register itself follows.

The register is **explicitly a living document** — items leave when they ship, get superseded, or get formally abandoned. It is not an immutable record of intent (that's what the other ADRs are for); it is the to-do list with named ownership. The MADR `status: accepted` refers to the meta-decision (to maintain a register); the register *contents* mutate.

### A. Wave 2 content authoring (substantive — months of WG work)

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| A1 | `/governance/data-quality` content | C&R WG | Workstream kickoff (per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3 — runs in parallel with A2 and A3) | Stub has section headings for the 6 DQ dimensions, measurement protocols, AL mapping, reporting. WG fleshes out each section. |
| A2 | `/governance/data-security` content | C&R WG | Workstream kickoff (parallel with A1, A3) | Stub has 5 controls (KYC/KYB, key mgmt, signature verification, revocation, audit logging) + policy / checklist / audit framing. |
| A3 | `/governance/accreditation-directory` content | C&R WG | Workstream kickoff (parallel with A1, A2); depends on [ADR-0004](./ADR-0004-accreditation-directory.md) Phase 1 (skeleton schema) | Stub describes the how-it-works flow, scoring, evidence tiers; first publish target is end of quarter following all four Wave 2 ADRs ratified. |
| A4 | `/governance/overlay-attachments` content | Technical WG (with C&R WG input on retention + consent) | Workstream kickoff (parallel with A1–A3) | Stub lists 11 v3 overlay attachment types; sections for file formats / signing / retention / consent. |
| A5 | C&R WG recruitment to support parallel A1–A3 | Engagement WG | Before A1/A2/A3 kickoff (per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #3 pre-condition) | Target firms with mature internal DQ / Security functions — see [`docs/recruitment/cr-wg-candidate-firms.md`](../recruitment/cr-wg-candidate-firms.md). |

### B. Wave 1 leftover tagging (mechanical, but per-page work)

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| B1 | DAMA Wheel cross-reference per page | Whoever picks up the Wave 1 leftovers | Opportunistic | For each existing page, tag the DAMA KA(s) it serves. KAs out of scope (DW/BI, Storage & Ops, Document & Content) explicitly disclaimed once each. ~24+ pages. |
| B2 | Per-KA template applied per page | Same | Opportunistic | Consistent rubric: *Purpose · Activities · Deliverables · Roles · Metrics · Maturity*. Apply incrementally; not all pages need every section filled. |

### C. Accreditation Directory build pipeline ([ADR-0004](./ADR-0004-accreditation-directory.md) Phase 4)

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| C1 | `scripts/build-accreditation-directory.mjs` | Technical WG | Member firms ready to submit first VCs (downstream of A1–A4 shipping capability bundles) | Build-time aggregator: reads all current-quarter VCs from `source/04-governance-bodies/accreditation/credentials/`, validates signatures against Trust Registry, emits `src/data/accreditation/current.json` for the Directory page render. |
| C2 | Member-firm VC submission tooling | Technical WG + Engagement WG | After C1 ships | Firms need a clear way to mint and submit their quarterly VCs. CLI helper? Web form? Out of scope for the script itself. |
| C3 | First quarterly publish | C&R WG + Technical WG | After A1–A4 + C1 + C2 | End-of-quarter milestone for the first time the Directory has real data. |
| C4 | OPDA-listed audit-partner list | Engagement WG | Before any firm claims an evidence-tier score 5–6 | Initial list likely Big 4 + property-data specialists. Scaffold lives at [`docs/recruitment/opda-listed-audit-partners.md`](../recruitment/opda-listed-audit-partners.md). |

### D. Wave 3 watching briefs (per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Wave 3")

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| D1 | GARP for OPDA institutional records | TBD | Opportunistic | Apply Generally Accepted Recordkeeping Principles to OPDA's `source/` tree. Mostly a published handling policy + retention defaults per subtree. |
| D2 | Storage & Ops — retention/disposal guidance | TBD | Trust Registry to production OR consumer-trust narrative needs it | Member-firm guidance: how long does a verified PDTF claim live in a firm's database after a transaction completes? UK GDPR alignment. |
| D3 | AI/ML governance over PDTF data | TBD | First member firm publishes a PDTF-trained model OR ICO/EU AI Act guidance solidifies | Bias/fairness considerations specific to property data (historical red-lining patterns). Data-use governance, not platform engineering. |
| D4 | Data-product discipline for OPDA's meta-analytics | TBD | Opportunistic | Apply data-product discipline (lineage, release plan, versioning) to Accreditation Directory, Standards Report, Consumer Survey. Extend `provenance-map.yaml` toward a lineage dictionary as new reports are produced. |
| D5 | Annual Wave 3 review (AGM-adjacent EC meeting) | EC | Every AGM-adjacent EC meeting | ~15-min agenda item walking D1–D4 (and successors): trigger fired? rotted? watching brief continues? |

### E. Pre-deploy + ops

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| E1 | Visual smoke test in browser | Henrik (next session) | Before push to production | Theme toggle, sidebar collapse, tree-folder toggle, mobile menu, Mermaid diagrams across sections, data tables on `/modelling/data-dictionary` + `/modelling/business-glossary`. |
| E2 | External materials audit | Engagement WG | Before announcing the URL change | OPDA-controlled materials pointing to old `/pages/NN-…html` URLs will hard-break. Scan briefings PDFs in `source/02-policy-and-positioning/briefings-to-government/`, openpropdata.org.uk content, propdata.org.uk content, DPMSG decks, member-firm comms, regulator submissions. Checklist at [`docs/external-materials-audit-checklist.md`](../external-materials-audit-checklist.md). |
| E3 | DCAM attribution note in `governance.md` | Technical WG | When time allows | Per [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) §"Vote and Dissent" newly-resolved #2 (permissive): one-paragraph note in `source/03-standards/trust-framework/docs/governance.md` defining the "name freely, no verbatim" boundary so future contributors don't re-litigate. |

### F. Open items in other ADRs

Tracked here so the register is comprehensive; details live in the originating ADRs.

| # | Item | Originating ADR | Notes |
|---|---|---|---|
| F1 | OPDA-listed audit partners | [ADR-0004](./ADR-0004-accreditation-directory.md) Q1 | Same as C4 above; cross-listed. |
| F2 | Conformance Scheme integration with Directory | [ADR-0004](./ADR-0004-accreditation-directory.md) Q2 | The existing `/governance/conformance-scheme` page needs updating to reference the Directory and explain the AL × Capability relationship. Own ADR when work begins. |
| F3 | Member-firm portal (deferred tier of the Directory) | [ADR-0004](./ADR-0004-accreditation-directory.md) Q3 | Private detailed view for firms + OPDA. Triggers on first member-firm request. Requirements stub at [`docs/specs/member-firm-portal-requirements.md`](../specs/member-firm-portal-requirements.md). |
| F4 | Quarterly publishing automation | [ADR-0004](./ADR-0004-accreditation-directory.md) Q4 | Cron / GitHub Action to refresh the Directory; tooling decision deferred. |
| F5 | Ex-member handling in the Directory | [ADR-0004](./ADR-0004-accreditation-directory.md) Q5 | "Former member, last data YYYY-Qn" vs immediate drop-out. Membership ADR territory — draft scoping at [`docs/adr/_drafts/membership-lifecycle.md`](./_drafts/membership-lifecycle.md). |

### G. Ontology implementation programme — surfaced by validation discipline

Per [`docs/plan/ontology-implementation.md` §9.3 + §9.4](../plan/ontology-implementation.md), every ADR in the ontology programme passes a structural validation gate before moving `proposed → accepted`. Validation may surface (a) genuine ratified-rules ambiguity needing Council amendment, or (b) named follow-ups that are not blockers but must be explicitly queued. Items below are queued from the ADR-0008 validation report at [`docs/adr/validation/ADR-0008-validation-report.md`](./validation/ADR-0008-validation-report.md).

| # | Item | Owner | Triggering condition / dependency | Notes |
|---|---|---|---|---|
| G1 | Council Author-only session — reconcile term-sourcing precedence between ODR-0004 §7a and ADR-0007 §"Term-sourcing five-line precedence" | OPDA Author (per [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) §"Self-amendment process") | Before any emitter branches on `tier == 3` semantics (currently no caller does; safe to defer one cycle) | ODR-0004 §7a lists tier 3 as "Other regulatory authorities (contextual, not authoritative)"; ADR-0007 pseudocode places "business glossary" at tier 3 and regulator at tier 5. ADR-0008 implementation follows ADR-0007. Engineering does not silently reconcile — Author-only amendment needed to either reorder ODR-0004 §7a or amend ADR-0007 pseudocode. |
| G2 | Prefix-filter heuristic refinement in `serialiser/canonical.py` | ADR-0009 worker | ADR-0009 implementation start (Phase 1, gated on ADR-0008 acceptance) | Current filter `iri.startswith(ns_str) for iri in referenced_iris` only inspects URIRef objects. ADR-0009 foundation header may bind `sh:namespace "https://..."^^xsd:anyURI` as Literal — if so, namespace gets filtered out. Remediation: scan Literal lexical values for IRI-shaped strings OR bind only namespaces that have URIRef references OR add placeholder triples. Decision belongs in ADR-0009 implementation report. |
| G3 | `check_derived_provenance` git-blame implementation + regression test (ODR-0004 §3a clause #5) | ADR-0009 worker | ADR-0009 implementation start | `tools/opda-gen/src/opda_gen/ci/three_graph_test.py:check_derived_provenance` is currently a stub returning `[]`. ADR-0009 wires git-blame inspection to ensure files under `derived/` have no commits outside the service account, and adds a positive + negative regression test. |
| G4 | Split CI workflow comment block by activation ADR | ADR-0009 or ADR-0014 worker (cosmetic) | Opportunistic | `.github/workflows/ontology-byte-identity.yml` currently has a single ADR-0009 unblock comment covering four commented-out steps. Steps 35–44 (regenerate / byte-identity diff / ci-three-graph) activate at ADR-0009; step 47–48 (validate-exemplar) activates at ADR-0014. Split the comment block to differentiate. |
| G5 | Mirror Section G to `/governance/deferred-work` Astro page | Technical WG / next contributor touching the mirror | Before next quarterly publish OR when next Section G item lands | The Astro mirror at `src/pages/governance/deferred-work.astro` has columns Status + Linked artefact; Section G needs a corresponding table. Mechanical sync work; not a blocker for the ADR programme. |

### Lifecycle — how items leave this register

1. **Promoted to its own ADR.** Item gets a dedicated ADR (typical for substantive workstreams). The register entry is updated to point at the new ADR and marked "promoted". Two reviews later it can be removed.
2. **Completed.** Item ships. Entry marked "completed YYYY-MM-DD", remains for one review cycle as evidence, then removed.
3. **Abandoned.** Item is explicitly declared out of scope (new ADR or annual review). Entry marked "abandoned YYYY-MM-DD, rationale: …", remains permanently as a "considered and rejected" record.
4. **Superseded.** Item is replaced by a different approach. Entry marked "superseded by [link]", remains permanently.

Items that don't progress for 12 months get flagged at the annual review (D5) for a "still relevant?" check.

### Consequences

* Good, because known state of remaining work — the next contributor sees the whole picture without archaeology.
* Good, because named ownership — accountability is not diffuse. Each item has a WG / individual / EC responsibility.
* Good, because triggering conditions are explicit, so items that aren't ready don't waste review cycles.
* Good, because one source of truth for "what's left" — beats the equivalent information being spread across multiple ADRs, handovers, and project boards.
* Bad, because the register can rot — if the annual review (D5) doesn't actually walk this register, items become outdated. Mitigation: the review owner reads this ADR top to bottom each year.
* Bad, because comprehensive lists invite overcommitment — reading the register might create pressure to do all of it. Trigger conditions exist for a reason; respect them.
* Bad, because some items belong in tickets, not ADRs — the register is for items with architectural / governance weight. Pure implementation tickets (e.g. "fix typo on page X") belong in a tracker, not here. If the register fills with trivia, prune.
* Neutral, because the register is mutable by design. Items can be added, edited, removed; rationale changes are part of the normal annual review. No "this ADR is wrong" problem.

### Confirmation

- Annual Wave 3 EC review (item D5) walks this register top to bottom — the AGM-adjacent EC meeting agenda template includes the review item.
- "Last review:" date maintained at the top of the register section as it gets revisited; updated on each pass to confirm the register has been re-walked.
- Inter-review checks: items promoted to ADRs leave a `promoted` mark with a link; items completed are dated and pruned after one cycle. Auditable by diffing this file against the prior release.

## More Information

### Open questions

1. **Where does pre-deploy item E1 (visual smoke test) actually live operationally?** Right now it's just a register entry. Could become a `scripts/smoke-test.mjs` Playwright script or stay as a manual checklist in this ADR.
2. **Does B1 + B2 (DAMA Wheel + per-KA template) need its own ADR?** Currently a Wave 1 leftover; might warrant a dedicated ADR if anyone is going to systematically apply it. For now, opportunistic / informal.
3. **Should F1–F5 entries be duplicated here or just linked?** Duplicating risks drift; linking risks the register feeling incomplete. Current compromise: lightweight cross-reference table with the originating ADR for detail.
4. **Promotion threshold.** When does an A/B/C/D item warrant its own ADR vs. staying in this register? Loose rule: if the item has its own sub-decisions to make, promote. If it's just "do this thing", leave it.

### References

- [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) — Wave 1/2/3 commitments.
- [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — folder + URL migration.
- [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) — idiomatic Astro refactor.
- [ADR-0004](./ADR-0004-accreditation-directory.md) — Accreditation Directory spec.
- `HANDOVER-2026-05-18-governance.md` — earlier-session record showing the value of named ownership for deferred items (e.g. the 14→30 chain break).
- [`docs/recruitment/cr-wg-candidate-firms.md`](../recruitment/cr-wg-candidate-firms.md) — operationalises item A5.
- [`docs/recruitment/opda-listed-audit-partners.md`](../recruitment/opda-listed-audit-partners.md) — operationalises items C4 / F1.
- [`docs/external-materials-audit-checklist.md`](../external-materials-audit-checklist.md) — operationalises item E2.
- [`docs/specs/member-firm-portal-requirements.md`](../specs/member-firm-portal-requirements.md) — operationalises item F3.
- [`docs/adr/_drafts/membership-lifecycle.md`](./_drafts/membership-lifecycle.md) — scoping for item F5 future ADR.

## Amendments

- **2026-05-18 — Created as living register for the 2026-05-18 implementation push.**
- **2026-05-25 — Refactored to canonical MADR 4.x format.** Bullet-list metadata moved to YAML frontmatter; status changed from "Living register" to `accepted` with the living-document nature recorded in the introduction and lifecycle subsection. Filename gained the `ADR-` prefix per the `ruflo-adr` `adr-create` skill. Substance unchanged.
- **2026-05-27 — Added Section G (Ontology implementation programme).** Five follow-ups (G1–G5) surfaced by the ADR-0008 validation report; queued as the named-acceptance condition for ADR-0008 moving `proposed → accepted`. Per programme plan §9.4, item G1 routes to a Council Author-only session (engineering does not silently reconcile ratified-rules disagreements).
