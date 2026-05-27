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

Per [`docs/plan/ontology-implementation.md` §9.3 + §9.4](../plan/ontology-implementation.md), every ADR in the ontology programme passes a structural validation gate before moving `proposed → accepted`. Validation may surface (a) genuine ratified-rules ambiguity needing Council amendment, or (b) named follow-ups that are not blockers but must be explicitly queued. Items below are queued from validation reports under [`docs/adr/validation/`](./validation/).

| # | Item | Owner | Triggering condition / dependency | Status | Notes |
|---|---|---|---|---|---|
| G1 | Council Author-only session — reconcile term-sourcing precedence between ODR-0004 §7a and ADR-0007 §"Term-sourcing five-line precedence" | OPDA Author (per [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) §"Self-amendment process") | Before any emitter branches on `tier == 3` semantics (currently no caller does; safe to defer one cycle) | Open (queued 2026-05-27 from ADR-0008 validation) | ODR-0004 §7a lists tier 3 as "Other regulatory authorities (contextual, not authoritative)"; ADR-0007 pseudocode places "business glossary" at tier 3 and regulator at tier 5. ADR-0008 implementation follows ADR-0007. Engineering does not silently reconcile — Author-only amendment needed to either reorder ODR-0004 §7a or amend ADR-0007 pseudocode. |
| G2 | Prefix-filter heuristic refinement in `serialiser/canonical.py` | ADR-0009 worker | ADR-0009 implementation start (Phase 1, gated on ADR-0008 acceptance) | Closed 2026-05-27 (commit `c5629e7`) | Resolved via option (a): Literal lexical values are now scanned for IRI-shaped strings that match bound namespaces (`serialiser/canonical.py:143-148`). Two regression tests added (`test_literal_iri_lexical_value_retains_prefix`, `test_non_iri_literals_do_not_pollute_prefix_set`). Verified independently by ADR-0009 validator. |
| G3 | `check_derived_provenance` git-blame implementation + regression test (ODR-0004 §3a clause #5) | ADR-0009 worker | ADR-0009 implementation start | Closed 2026-05-27 (commit `c5629e7`) | Implemented at `tools/opda-gen/src/opda_gen/ci/three_graph_test.py:138-229` via `git log --format=%ae` walk over `source/03-standards/ontology/derived/`; env-var allowlist (`OPDA_SERVICE_ACCOUNTS`) parameterises the service-account list. Four regression tests (missing-dir, clean-history, non-service-commit, env-var-allowlist) using tmp git-repo fixture. Verified independently. |
| G4 | Split CI workflow comment block by activation ADR | ADR-0009 or ADR-0014 worker (cosmetic) | Opportunistic | Closed 2026-05-27 (commit `c5629e7`) | `.github/workflows/ontology-byte-identity.yml:31-52` now carries two distinct activation markers — one for ADR-0009-activated steps (regenerate / byte-identity diff / ci-three-graph) and one for the ADR-0014-activated `validate-exemplar` step. |
| G5 | Mirror Section G to `/governance/deferred-work` Astro page | Technical WG / next contributor touching the mirror | Before next quarterly publish OR when next Section G item lands | Closed 2026-05-27 | Astro mirror at `src/pages/governance/deferred-work.astro` now carries the full G1–G11 table with Status + Linked-artefact columns matching the other Section A–F tables. |
| G6 | Cosmetic ADR-0009 template amendment — document pinning convention | Author / opportunistic | Opportunistic | Closed 2026-05-27 | ADR-0009 §"foundation.ttl" prose preamble now documents the sentinel pinning convention: angle-bracket placeholders are illustrative, not live-substitution directives; sentinel-pinned to satisfy byte-identity CI per ODR-0004 §6a. |
| G7 | Prefix-filter edge cases for embedded URLs in rdfs:comment / dct:description | ADR-0010 worker | When first `rdfs:comment` containing a URL is emitted as a Literal | Closed 2026-05-27 (ADR-0010 implementation) | Closed by ADR-0010 worker because ADR-0010 schemes carry gov.uk URLs inside `skos:scopeNote @en` Literals — the same surface G7 names. Two regression tests added to `tests/test_serialiser.py`: (i) `test_literal_url_inside_scope_note_does_not_bind_new_prefix` (Literal containing a gov.uk URL inside a sentence MUST NOT bind `gov.uk`); (ii) `test_literal_url_lexical_value_does_not_bind_unbound_namespace` (Literal lexical value IS exactly a gov.uk URL MUST NOT bind `gov.uk`). Confirms the existing scan is contractually conservative-safe. |
| G8 | ADR-0010 scope expansion — additional SKOS schemes beyond the named first batch | ADR-0013 worker | When a downstream module ADR (ADR-0011+) cites a scheme not in the ADR-0010 §"Scheme catalogue" 16-row table | Closed 2026-05-28 (ADR-0013 implementation) | ADR-0013 worker added 7 new SKOS schemes required by BASPI5 overlay coverage: `YesNoScheme`, `YesNoNotApplicableScheme`, `YesNoNotKnownScheme`, `YesNoNotRequiredScheme`, `PropertyTypeScheme`, `OffMainsDrainageSystemTypeScheme`, `OwnerTypeScheme`. Total scheme count: 23 (was 16). Each new scheme follows ADR-0010's per-scheme metadata MUST-haves (UFO category + steward + dct:source + scope-note). Further scheme expansions remain opportunistic per the original closure criterion. |
| G9 | Populate data-dictionary enums for MilestoneKind / AssuranceLevel / EvidenceMethod / AddressVariant | ADR-0013 worker | Opportunistic (next dictionary refresh cycle) | Closed 2026-05-28 (ADR-0013 implementation) | All four schemes now emit real per-member data without the `PLACEHOLDER:` warning. `MilestoneKindScheme` cites ODR-0007 §Q2 (transaction-lifecycle pattern) as the per-member dct:source. `AssuranceLevelScheme` cites eIDAS Article 8 verbatim per ODR-0011 §4a regulator-citation discipline + adds `PDTF-Standard` member citing ODR-0009 §Q3. `EvidenceMethodScheme` cites OIDC4IDA verbatim. `AddressVariantScheme` cites ODR-0015 §Q1 (the ratifying Council anchor for the variant-set). Future data-dictionary refresh can supplement these citations without removing the now-stable per-member structure. |
| G10 | TransactionStatusScheme per-member `dct:source` URI fabrication audit | ADR-0013 worker | Opportunistic, MUST land before ADR-0014 BASPI5 round-trip (because BASPI5 needs full `dct:source` traceability) | Closed 2026-05-28 (ADR-0013 implementation) | Resolved via validator option (a)+(b) hybrid: per-member `dct:source` now cites the ratifying Council anchor `<https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category>`; per-member `prov:wasDerivedFrom` links each canonical label to the underlying data-dictionary enum value it sources from (`Listed ← #status.For%20sale`; `Offered ← #status.Under%20offer`; `Accepted ← #status.Sold%20subject%20to%20contract`; `Exchanged ← #status.Contracts%20exchanged`; `Completed ← #status.Completed` exact). The `Member` dataclass in `vocabularies.py` gained an optional `derived_from: URIRef \| None` field. Verified by independent SPARQL: `grep -c "data-dictionary#status.Listed\|...Offered\|...Accepted\|...Exchanged" opda-vocabularies.ttl` → 0 (fabricated URIs eliminated). |
| G11 | Full Q5a binding-table emission (~44 leaves) into opda-property.ttl + opda-descriptive.ttl | ADR-0013 worker (bundled with overlay profile emission) | Closure tightened per ADR-0011 validator: **BEFORE ADR-0014 MVP gate** — every leaf BASPI5 round-trip discovers as missing MUST emit, no silent omissions | Closed 2026-05-28 (ADR-0013 implementation) | 17 additional Property/LegalEstate DatatypeProperties emitted in `opda-property.ttl`: `propertyType`, `ownershipType`, `heatingType`, `centralHeatingFuelType`, `offMainsDrainageSystemType`, `areBoundariesUniform`, `isLocatedOverCommercialPremises`, `isSharedOwnership`, `isGroundRentPayable`, `sellerContributesToServiceCharge`, `hasSprayFoamInstalled`, `isSupplyMetered`, `isInsured`, `hasBeenFlooded`, `hasSmartHomeSystems`, `hasValidGuaranteesOrWarranties`, `soldWithVacantPossession`, `riskIndicator`. Two additional Agent-domain DatatypeProperties in `opda-agent.ttl`: `ownerType`, `hasOthersAged17OrOver`. Each carries `rdfs:domain` (per ODR-0008 §Q5a placement) + `rdfs:range xsd:string` + `rdfs:label @en` + `rdfs:comment @en` + `dct:source <ODR-0008#section-Q5a>`. Bound to schemes via `sh:in` in `profiles/baspi5.ttl` per ODR-0010 §Rule 2 (build-step replacement, not entailment). Per-question (not single-predicate) pattern adopted per worker brief recommendation. Further `yesNo`-flavoured predicates land as downstream overlay demand surfaces. |
| G12 | Canonical serialiser blank-node deduplication for multi-target shared blank nodes | ADR-0013 worker (bundled) | Cosmetic; opportunistic | Closed 2026-05-28 (ADR-0013 implementation) | Resolution went beyond the cosmetic scope and fixed a latent byte-identity bug surfaced by the BASPI5 profile emission: `serialiser/canonical.py` previously sorted multi-object lists by `str(o)`, which for BNodes returns rdflib's non-deterministic internal label (e.g. `Nf3a2...`). Profile shapes carrying multiple `sh:property` blank-node references therefore reordered between runs, breaking byte-identity. Fix: introduced `_object_sort_key(obj, blanks)` helper that returns the deterministic skolem hex (`_:b<hex>`) for BNodes and `str(obj)` for everything else; both the triple-sort and the multi-object-list sort now use it. Regression test `test_multi_object_blank_node_list_byte_identical_across_runs` in `tests/test_serialiser.py` exercises 5 fresh `Graph()` constructions producing byte-identical output. The original cosmetic dedup (named skolemised URIs for shared blanks) is now a future opportunistic improvement — no longer load-bearing. |
| G13 | Housekeeping — confirm G1 status closure in ADR-0005 §G | Author / 2026-05-27 | Now | Closed 2026-05-27 (this commit) | G1 was already closed in commit `5bd0c41` per 2026-05-27 amendment. ADR-0012 validator (commit `ae1560f`) noted the status column reads "Closed 2026-05-27" so the validator's G13 concern was a stale-read artefact. No further action needed. |
| G14 | Cat 4 SHACL shape activation trigger — declare `opda:hasSpecialCategoryData` predicate OR route Council S012 Q3 ratification | Council Author-only session (per programme plan §9.4) | Before MVP gate (ADR-0014) demonstrates Cat 4 firing on a real PII case | Open (queued 2026-05-27 from ADR-0012 validation; routed to Council) | The Cat 4 `SpecialCategoryPIIWithoutLawfulBasisShape` in opda-agent-shapes.ttl SHACL-targets `opda:Person` and tests for `opda:hasSpecialCategoryData true` paired with `dpv:hasLegalBasis` minCount. But `opda:hasSpecialCategoryData` is not declared in any class graph — it's a placeholder pending S012 Q3 Council ratification of the actual PII-flag predicate. Engineering routes this to Council per ODR-0001 §"Self-amendment process": the Cat 4 shape works mechanically once Council ratifies the canonical predicate name (S012 Q3 was deferred per ODR-0011). Pre-MVP-gate trigger: BASPI5 round-trip exercises a Person with PII; if exercising Cat 4 surfaces no `opda:hasSpecialCategoryData` declaration, queue the Author-only session immediately. |
| G15 | Cosmetic ADR-0007 amendment — document `__version__` vs `owl:versionIRI` decoupling rule | Author / opportunistic | Opportunistic | Closed 2026-05-27 (this commit) | ADR-0012 worker bumped `opda_gen.__version__` 0.3.0 → 0.4.0 (substrate addition: shapes + annotations files) but left foundation `owl:versionIRI` at `<https://w3id.org/opda/0.3.0/>` (class-graph unchanged). Rule documented in this commit's amendment to ADR-0007 §"A9 per-kind discipline output" prose: `__version__` tracks the generator package's emitter capabilities; `owl:versionIRI` tracks each emitted graph's content version, bumping only when the graph's triples change. The two are intentionally decoupled. |
| G16 | ADR-0013 implementation report DatatypeProperty count: 19 → 20 (worker under-counted by 1) | ADR-0014 worker (bundled, cosmetic) | Opportunistic | Bundled with ADR-0014 worker brief | Worker reported 19 new DatatypeProperties (17 property + 2 agent); validator counted 20. Cosmetic implementation-report fix. |
| G17 | Stale "five foundation classes" doc-comments in `foundation.py` + `opda-classes.ttl` header | ADR-0014 worker (bundled, cosmetic) | Opportunistic | Bundled with ADR-0014 worker brief | Foundation now has 6 classes (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator, ValidationContext) after ADR-0013 added ValidationContext. Stale doc-comments need refresh. |
| G18 | Declare `opda:role` as DatatypeProperty in opda-agent.ttl for DASH editor ergonomics | ADR-0014 worker (bundled) | Before MVP gate (DASH form rendering ergonomics) | Bundled with ADR-0014 worker brief | BASPI5 profile uses `opda:role` as a `sh:path` value but the predicate is not declared in any TBox module (the role-bearing pattern is encoded via opda:Seller/opda:Buyer typing per ODR-0006). SHACL works on path values without prior declaration but DASH editor ergonomics + downstream SPARQL semantics improve if predicate is declared. Domain: foundation `opda:RoleMixin`; range: `xsd:string` constrained by sh:in opda:RoleScheme members. |
| G19 | Fix 4 BASPI5 profile anchor URL mismatches (A1.8.7, A7.5.1, B1.2, A1) | ADR-0014 worker (bundled) | Before MVP gate (form-question IRI resolution) | Bundled with ADR-0014 worker brief | ADR-0013 worker emitted form-question anchors per ODR-0010 §Q3 pattern but 4 of 28 anchors don't exact-match the BASPI5 schema's `baspi5Ref` field values. Worker needs to scan baspi5.json for actual `baspi5Ref` values and align profile dct:source URIs accordingly. |
| G20 | ADR-0013 implementation report anchor count: 36 → 28 (worker over-counted) | ADR-0014 worker (bundled, cosmetic) | Opportunistic | Bundled with ADR-0014 worker brief | Worker reported 36 form-question anchors; validator counted 28 distinct anchors. Cosmetic implementation-report fix. |

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
- **2026-05-27 — Section G update from ADR-0009 validation.** Marked G2, G3, G4 closed (all resolved by ADR-0009 worker commit `c5629e7` and independently verified by the ADR-0009 validation report). Added G6 (cosmetic ADR-0009 template amendment to document pinning convention) and G7 (prefix-filter edge-case regression test deferred to first URL-bearing rdfs:comment emission, expected at ADR-0011). Status column added to the Section G table.
- **2026-05-27 — Section G update from ADR-0010 implementation + validation.** Marked G7 closed (ADR-0010 worker added two regression tests for gov.uk URLs in skos:scopeNote Literals, commit `75337ec`). Added G8 (ADR-0010 scope expansion beyond the 16 named first-batch schemes) and G9 (data-dictionary enum population for MilestoneKind / AssuranceLevel / EvidenceMethod / AddressVariant). Added G10 (TransactionStatus per-member dct:source URI fabrication audit; surfaced by ADR-0010 validator at commit `55f09ad`; engineering choice, not Council route; MUST land before ADR-0014 BASPI5 round-trip).
- **2026-05-27 — Section G update from G1/G5/G6 closures + ADR-0011 validation.** Marked G1 closed (ADR-0007 §"Term-sourcing five-line precedence" pseudocode + prose amended to match ODR-0004 §7a; code change in lockstep at ADR-0012 worker brief; commit `5bd0c41`). Marked G5 closed (Astro mirror at `src/pages/governance/deferred-work.astro` carries the full G1–G11 table). Marked G6 closed (ADR-0009 §"foundation.ttl" prose preamble documents the sentinel pinning convention; commit `5bd0c41`). Added G11 (Q5a binding-table completion; per ADR-0011 validator's recommendation, closure tightened to MUST land before ADR-0014 MVP gate; bundled with ADR-0013 worker brief). Per the user's "no deferrals" mandate, G8 / G9 / G10 / G11 are all bundled into the ADR-0013 worker brief for inline closure before the ADR-0014 MVP gate.
- **2026-05-27 — Section G update from ADR-0012 validation.** Added G12 (canonical serialiser blank-node dedup — cosmetic; bundled with ADR-0013 worker). Added G13 (housekeeping — closed immediately; G1 already closed at commit `5bd0c41`). Added G14 (Cat 4 SHACL shape activation trigger — Council-routed for S012 Q3 ratification; the only G-item with a genuine `## Rules` ambiguity per programme plan §9.4). Added G15 (cosmetic ADR-0007 amendment documenting `__version__` vs `owl:versionIRI` decoupling rule — closed in this commit).
- **2026-05-27 — Section G update from ADR-0013 validation.** G8/G9/G10/G11/G12 all VERIFIED closed by validator (commit `6acdbca`). Added G16 (DP count report fix), G17 (stale foundation doc-comment), G18 (declare opda:role DatatypeProperty), G19 (4 BASPI5 anchor URL mismatches), G20 (anchor count report fix). All five bundled into the ADR-0014 worker brief for inline closure before MVP gate.
- **2026-05-27 — Section G update from ADR-0010 implementation.** Marked G7 closed by the ADR-0010 worker (two regression tests added in `tests/test_serialiser.py`; gov.uk URLs in `skos:scopeNote @en` Literals correctly do not bind a `gov.uk` prefix). Added G8 (ADR-0010 scope expansion — admit additional schemes case-by-case per downstream demand) and G9 (data-dictionary enums for MilestoneKind / AssuranceLevel / EvidenceMethod / AddressVariant — currently emitted with `PLACEHOLDER:` scope-note warnings per the ADR-0010 brief's option (a) routing).
- **2026-05-27 — Section G update from ADR-0011 implementation.** Added G11 (full Q5a binding-table emission, ~44 descriptive-attribute leaves deferred per-leaf to downstream-consumer trigger). ADR-0011 emits 6 of ~50 Q5a leaves (the minimum needed for the 15 diagnostic exemplars + core opda-property.ttl identity predicates); the remaining ~44 leaves land per downstream BASPI5/TA6/NTS/LPE1 overlay demand. Engineering choice per-leaf, not Council route.
