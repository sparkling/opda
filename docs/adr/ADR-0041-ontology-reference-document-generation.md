---
status: accepted
date: 2026-06-14
tags: [documentation, ontology, generator, ci-gate, multi-page, bake-off, ontology-section, council-038]
supersedes: []
depends-on: [ODR-0004, ODR-0005, ODR-0025, ODR-0026, ODR-0027, ODR-0028, ODR-0029, ADR-0002, ADR-0006, ADR-0007, ADR-0029]
implements: []
---

# Ontology Reference Document — Generation Model and Section Structure

## Context and Problem Statement

The OPDA PDTF ontology is complete enough to document for external consumers (the descriptive layer closed — ODR-0028; the programme retired — ODR-0003). We need a standalone HTML reference covering every aspect: the foundation and six bounded-context modules (~58 OWL classes, 30 object + 226 datatype properties), ~50 SKOS schemes / ~318 concepts, ~58 SHACL shapes, 31 overlay profiles, 17 round-trip exemplars, the OWL-RL inference regime, the three-graph separation, the DPV/PROV-O governance layer, and the ODR/ADR/council provenance.

The hazard: the ontology is generator-emitted and anti-drift by doctrine — every TTL is `DO NOT HAND-EDIT`, byte-identity-gated (ODR-0004 §6a / `make verify-ontology`), `dct:source`-stamped, `owl:versionIRI`-pinned. A hand-authored "every aspect" page would, by construction, have none of those properties and would drift from the corpus on the first commit, with no gate to catch it. Council **session-038** was convened to produce the section outline and validate it sound + complete; it ruled the naive hand-authored monolith out and the hybrid below in.

## Decision Drivers

* Anti-drift parity with the ontology: the reference must not be able to silently diverge from the committed TTL (ODR-0004 §6a discipline).
* Soundness: the document must not misrepresent the model — no inferred-as-asserted, no Roles-as-subclasses (ODR-0027 §R6), no shape without its target graph + the SHACL-AF caveat.
* Honesty/completeness: deferred work and known defects must be visible, not concealed behind a "complete" claim.
* Usability of one page over ~600 addressable terms: navigation and resolved (non-blank-node) rendering are mandatory, not optional.
* The conceptual/rationale/governance layer is editorial judgement a generator cannot produce; the per-term layer is mechanical and must be generated.

## Considered Options

* **Option A (chosen) — Hybrid: hand-authored narrative shell + build-time-injected generated per-term reference, emitted by `opda-gen`, guarded by a doc-drift CI gate, across a small linked set of pages (multi-page — see Amendments rev 1).** Conceptual/identity/classification/governance/known-issues prose is hand-authored; class/property/SKOS/shape/profile reference is generated from the TTL; anchors, prefix table, `dct:source` columns are generated; a CI gate fails the build if the generated block diverges from the corpus.
* **Option B — Hand-authored single-page monolith documenting every aspect.** Rejected (session-038 Q4 0–5–1): drifts on the first commit; un-maintainable against a byte-identity-gated generator; the DA's central indictment.
* **Option C — Fragmented auto-generated per-term pages (raw Widoco/LODE/pyLODE output).** Rejected: fragments the navigational coherence the artefact provides, and renders SHACL blank nodes verbatim (unreadable). The generation *engine* idea is adopted; the fragmented *output* is not.

## Decision Outcome

Chosen option: "Hybrid generated-reference-in-hand-authored-shell", because it is the only configuration that gives anti-drift parity with the ontology (the per-term layer is never hand-touched and is CI-gated) while preserving navigability across the page set (multi-page per the Amendments) and the hand-authored conceptual layer a generator cannot emit. This is the session-038 REVISE outcome; the Devil's Advocate (Peroni) withdrew his rejection once the generated body + doc-drift CI gate were adopted (they are his re-open trigger).

The agreed section structure (full per-section detail and the [HAND]/[GEN] split in [session-038](../ontology/odr/council/session-038-ontology-reference-document-outline.md) §"The agreed outline"). **Reconciling the tags with the Combination principle (below):** `[GEN]` = generated from the TTL — by an off-the-shelf tool *or* a custom `opda-gen` script, whichever the bake-off picks for that layer; `[HAND]` = LLM/human-authored prose. The two-letter tags are a generated-vs-authored shorthand, not a single-tool claim. The list:

0. Front matter [HAND] — version, dated status banner (programme retired), generator version + source commit, licence, regeneration-provenance banner.
1. Navigation chrome [GEN] — sticky TOC, per-term anchors (`id` = IRI local name), collapsible default-collapsed modules, search, UFO-category index.
2. Prefix / namespace map [GEN] — incl. the ADR-0006 kind-split + collision-avoidance rationale.
3. Foundational stance & architecture [HAND] — UFO meta-category legend (leads the document), three-graph separation, bounded-context partition, OWL-RL regime + asserted-vs-entailed discipline.
4. Identity criteria & hard cases [HAND] — the implicit-Property crux (ODR-0005); UPRN as contingent Quality, never the IC.
5. Classification doctrine — facets not subclass trees [HAND] (ODR-0027 §R6; evidence as RoleMixin + `evidenceType` facet).
6. Class reference [GEN] · 7. Property reference [GEN] · 8. SKOS vocabularies [GEN] (live counts) · 9. SHACL base shapes [GEN] (target column + severity tier + JSON-Schema→SHACL mapping) · 10. Overlay profiles/forms [GEN index + HAND doctrine] (thin-vs-bound + gap register).
11. Claims / Evidence / Provenance [HAND + GEN] — PROV-O backbone + the three truth-makers.
12. Data governance / PII [HAND + GEN] — DPV referenced-not-imported, `isPIIBearing`, lawful-basis, purpose scheme.
13. Machine / consumer section [HAND recipe + GEN links] — prefix table, SPARQL, dereferenceability, SHACL-validation recipe (**pyshacl `advanced=True` REQUIRED**), TTL downloads.
14. Governance & decision-provenance [HAND + linked transcripts] — `dct:source` term-provenance, ODR/ADR/council lineage, programme retirement, held-as-live dissents + re-open triggers.
15. Known-issues register [HAND, DATED, machine-cross-referenced].
16. Full index & glossary [GEN] · 17. Regeneration footer [HAND + GEN] — the doc-drift CI gate.

### Consequences

* Good, because the per-term reference cannot drift from the TTL — it is generated and CI-gated, matching the ontology's own byte-identity discipline.
* Good, because the conceptual model is represented soundly: UFO legend leads, asserted-vs-entailed is marked, Roles are never shown as subclasses, and shapes always state their target graph + the SHACL-AF caveat.
* Good, because completeness is honest — the EPC-certificate inference defect (ODR-0028 R3), the 1095 GAPped leaves / 16 thin profiles, and the retired-programme status are surfaced, not concealed.
* Good, because one navigable page (sticky TOC, anchors, collapsible modules, search, resolved constraints) serves a reader better than fragmented per-term pages for this corpus size.
* Bad, because it requires building a new `opda-gen` emitter (HTML reference + doc-drift gate) — non-trivial engineering beyond writing prose.
* Bad, because the hand-authored layer still needs discipline: stale conceptual prose can drift even though the generated layer cannot (ODR-0004's own namespace prose drift, logged as known-issue (v), is the cautionary precedent).
* Neutral, because the document carries `status: draft` until the CI gate is green; the operator ratifies publication.

### Confirmation

* The HTML reference is emitted by `opda-gen` (per ADR-0007/ADR-0008 generator discipline), not hand-written.
* A **doc-drift CI gate** with **two tiers (B1 adopted, 2026-06-14)**: (i) **custom `opda-gen` output** is regenerated from the committed TTL and **byte-identity** checked — the exact ODR-0004 §6a equivalent; (ii) **third-party tool output** (pyLODE / Widoco / SHACL Play! / Skosmos exports) is **version-pinned and vendored as an input**, checked by a **semantic/structural diff** (every TTL term/shape/concept appears; counts match), **not** byte-identity — so a tool upgrade is a deliberate, reviewed input bump, not a spurious build break. (iii) Hand/LLM-authored prose is **not** gate-covered — it is human-reviewed, with a lightweight check that every `opda:` term named in prose resolves in the TTL. This is the form in which DA Peroni's withdrawal condition holds: the deterministic layer is byte-gated, the tool layer is pinned, and the limits of the guarantee are stated rather than oversold.
* CI asserts per-term anchors equal IRI local names (deep-link stability) and that no SHACL constraint renders as a raw blank node.
* Acceptance against session-038: the must-fix soundness conditions (Roles not in a subclass tree; asserted-vs-entailed marked; shape target + SHACL-AF caveat; evidence RoleMixin+facet) and the DA re-open gate (no hand-authored term reference; no suppressed gate) are checked before the doc moves `draft → accepted`.

## More Information

* Ratifying deliberation: [Council session-038](../ontology/odr/council/session-038-ontology-reference-document-outline.md) — Queen Allemang, DA Peroni (withdrawn), panel Guizzardi / Knublauch / Cagle / Moreau. It ratified the *original single-page hybrid*; the plan has been **substantially amended since** (Amendments rev 1–4 + Council [session-039](../ontology/odr/council/session-039-entailment-regime-and-epc-modelling.md)) — read §Decision Outcome **together with** the Amendments, not in isolation.
* Inference/validation + EPC disposition (affects §Confirmation, the entailment rendering, and the known-issues register): [ODR-0029](../ontology/odr/ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) (Council session-039). The `/manual`→`/model` rename is split out to [ADR-0042](./ADR-0042-rename-manual-section-to-model.md).
* Generator discipline: [ADR-0007](./ADR-0007-ontology-generator-specification.md), [ADR-0008](./ADR-0008-generator-implementation-infrastructure.md); byte-identity gate ODR-0004 §6a.
* Namespace/kind-split rendered in §2: [ADR-0006](./ADR-0006-w3id-opda-ontology-namespace.md) (note: ODR-0004 prose still cites the pre-migration `w3id.org/opda/#` base — known-issue (v), a separate cleanup).
* Model content the document represents: [ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), [ODR-0005](../ontology/odr/ODR-0005-property-land-identity-crux.md), [ODR-0027](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md), [ODR-0025](../ontology/odr/ODR-0025-entailment-regime-and-inference-semantics.md)/[ODR-0026](../ontology/odr/ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md), [ODR-0028](../ontology/odr/ODR-0028-descriptive-layer-completeness-reconciliation.md); overlay profiles [ADR-0029](./ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) + session-034.

## Amendments

### 2026-06-14 — Operator amendment: multi-tool bake-off, multi-page allowed, host under a new `/ontology` section (and rename `/manual`→`/model`)

Post-session operator direction (Henrik, directing authority — the Council shapes proposals; the operator ratifies and may amend adoption). Three changes to the §Decision Outcome. The generated-not-hand-typed principle, the soundness must-fixes, the honesty/known-issues requirement, and the **doc-drift CI gate** are **unchanged and remain binding** on all generated output.

**1. Single-page constraint RELAXED → multi-page permitted.** The reference may be a small set of linked pages (e.g. one per bounded-context module, plus shapes / vocabularies / profiles / exemplars / governance), not necessarily one HTML file. Section §1's mandatory navigation (sticky TOC, deep anchors `id` = IRI local name, search, collapsible blocks) now applies *across* the page set; deep-link stability and the doc-drift gate are unchanged.

**2. Production model BROADENED from "one custom hybrid" → a documented tool BAKE-OFF using ALL tools, then adopt the best (likely composed) per layer.** **Every** tool below is to be used to render the full ontology — each produces a complete rendering as a bake-off candidate — and the renderings are then compared against OPDA's actual coverage needs (OWL terms · SKOS schemes · SHACL shapes · overlay profiles + gap register · round-trip exemplars · three-graph separation · governance/ODR-ADR lineage · known-issues). **Execution status: NOT STARTED — this records the plan; no rendering has been produced or adopted yet.**

  | Approach | Layer | Note |
  |---|---|---|
  | **pyLODE** | OWL term reference | Python CLI; best single-file OWL ref; weak SHACL |
  | **WIDOCO** | OWL + metadata + VOWL diagrams | Java jar (headless); richest publishable shell; weak SHACL |
  | **SHACL Play! (Sparna)** | SHACL shapes/profiles → HTML | the only tool that documents SHACL |
  | **Skosmos** | the ~50 SKOS schemes | NatLibFi; best SKOS browser; heavier (PHP app over the existing Fuseki endpoint) |
  | **Ontospy** | OWL + viz | Python CLI; multi-page alt to pyLODE |
  | **OnToology** | automation pattern | wraps Widoco+OOPS! on git push — informs the CI-gate design, not a renderer |
  | **LODE** | OWL term reference (baseline) | dated XSLT/web-service; the DA's own tool — kept as the comparison baseline |
  | **custom `opda-gen` + LLM** | profiles, exemplars, three-graph, governance lineage, known-issues | the **only** approach covering the OPDA-specific layers no off-the-shelf tool touches |

  Expected (to be *proven* by the bake-off, not assumed): no single off-the-shelf tool suffices — the OWL generators skip SHACL and treat SKOS unevenly — so the adopted artefact **combines all three production methods into one woven reference**: off-the-shelf tool renderings where they win (e.g. pyLODE/Widoco for the OWL term reference, SHACL Play! for shapes/profiles, Skosmos for the schemes), custom `opda-gen` scripts for the layers no tool covers (overlay profiles + gap register, exemplars, three-graph, governance lineage, known-issues), and LLM-authored prose for the conceptual/rationale layer. The bake-off determines *which method serves each part* with a recorded rationale; the combined result is wired into `opda-gen` and the doc-drift CI gate and themed into the Astro `/ontology` section. The output is integrated, not a per-tool silo.

**3. Hosting (corrected IA — three sections).** A new top-level **`/ontology`** global nav item hosts the generated renderings; the existing `/manual` section is renamed to `/model`; `/modelling` is unchanged. (Earlier drafting of this amendment put the generated reference under `/model`; operator direction 2026-06-14 corrects that — the generated reference is `/ontology`, and `/model` is the renamed manual.) Edits land in `src/lib/site.ts` (`HEADER_ORDER` + `SECTIONS`); the rename crosses the slug taxonomy, so note against [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md).
  - **`/modelling`** (unchanged) — the *working / process* pages: how the model was built (standards stack, bounded contexts, data dictionary, business glossary, the ODR index, the curated `ontology`/`shacl-shapes` summary pages).
  - **`/model`** (RENAME of `/manual`) — the DAMA four-tier presentation of the model (concept → logical → physical-ontology → physical-database/relational). The section's nav title is *already* "Model"; only its URL/key is wrong. **Migration footprint: split into its own record — [ADR-0042](./ADR-0042-rename-manual-section-to-model.md)** (review M5; the rename is IA cleanup unrelated to doc generation). URL-only rename (routes + `site.ts` section key + ~38 link refs + the `remarkRewriteManualLinks` plugin + a `/manual/*→/model/*` redirect); the internal `manual` collection + `docs/manual/` source stay unchanged; `make build` green is the acceptance gate.
  - **`/ontology`** (NEW global nav item) — the *published, generated reference of the ontology itself*: **everything generated goes here** — the bake-off outputs and the adopted composed reference (term reference, SHACL shapes, SKOS schemes, overlay profiles, exemplars, governance/provenance, known-issues). The canonical "spec you link people to." Add to `HEADER_ORDER` + `SECTIONS` + a `src/pages/ontology/` route; the doc-drift CI gate guards its generated content.

  **Runtime/server tools — localhost + link-out (B2 resolved, 2026-06-14).** Tools that need a live runtime (Skosmos; the interactive web modes of LODE / SHACL Play! if used live) are **not** embedded in the static build — they **run from localhost** via a `make` target alongside the existing build-time Fuseki/GRLC (the `make serve-data` pattern), and the `/ontology` webapp **links out to the localhost instance** rather than hosting it. So the static deploy stays static: it carries the **static-generated renderings** (and static snapshots/exports where a tool can emit them), while the live, browsable server tools are local-only, launched on demand and linked. Document the launch command + port next to each link; the link is understood to resolve only when the reader has the local stack running (same contract as `make serve-data` today).

  > **Combination principle (not a production-method split).** `/ontology` is **not** a "generated reference" set in opposition to a "hand-authored manual" — that distinction is artificial and contradicts this plan. The `/ontology` content is a **single woven artefact that COMBINES all three production methods**: (a) renderings from the off-the-shelf documentation tools (pyLODE / Widoco / SHACL Play! / Skosmos / …), (b) the custom generation scripts we build into `opda-gen`, and (c) the LLM-authored prose (the conceptual / rationale / governance layer). The bake-off decides *which method best serves each part*, but the result is one integrated reference, not siloed by who produced what. The three nav sections differ by **audience/purpose**, not by production method: `/modelling` = the working pages that show how the model was built; `/model` = the DAMA tiered presentation for different reader tiers; `/ontology` = the combined, authoritative reference. `/modelling/ontology` and `/model/physical-ontology` link into `/ontology` as that authoritative surface.

**Supersession scope:** only the *single-HTML-file* clause of §Decision Outcome and the *one-custom-hybrid* framing are superseded by this amendment. Every other ratified element of session-038 (the section structure, the [HAND]/[GEN] split, the soundness must-fixes, the honesty/known-issues register, the doc-drift CI gate, and the DA's withdrawal conditions) survives intact and applies per-page across the multi-page set.

**Execution sequence (proposed):** (a) merge the module/vocabulary/annotation TTLs into one TBox graph (OWL+SKOS) and the `*-shapes.ttl` into a shapes graph; (b) render with the static generators — pyLODE + Ontospy (pip), Widoco + SHACL Play! (Java jars), LODE (hosted service / Widoco-embedded baseline); (c) stand up Skosmos against Fuseki for the SKOS layer; (d) produce the custom `opda-gen` rendering for the OPDA-specific layers; (e) score each rendering per layer against the coverage matrix; (f) record the bake-off result (a short comparison page under `/ontology`); (g) wire the adopted composition into `opda-gen` + the doc-drift CI gate; (h) theme into the Astro `/ontology` section. (Separately, rename `/manual` → `/model` as a build-verified pass — see §Hosting.)

**Known runtime constraints (for the executor):** Java 17+ and Python are available locally. Ontospy 2.1.1 is **incompatible with Python ≥3.12** (imports the removed `SafeConfigParser`) — needs a 3.11 interpreter or a patched fork. Widoco and SHACL Play! ship as downloadable Java jars (network required). Skosmos is a standalone PHP web app requiring a SPARQL endpoint (the existing Fuseki) — the only non-static tool; run it from localhost and link out per §Hosting "Runtime/server tools". The OWL generators (pyLODE/Widoco/LODE/Ontospy) do **not** document SHACL, so the shapes/profiles layer depends on SHACL Play! and/or the custom generator.

### 2026-06-14 (rev 2) — Adversarial-review dispositions

Dispositions from an adversarial review of this plan:

* **B1 ADOPTED — doc-drift gate rescoped.** Byte-identity over the custom `opda-gen` output only; third-party tool output is version-pinned + semantic-diffed (not byte-gated); prose is human-reviewed with a term-resolves check. See the revised §Confirmation. This is the form in which DA Peroni's withdrawal condition actually holds (byte-identity over heterogeneous third-party renderers — which embed timestamps/version strings — was infeasible and would have broken on every tool bump).
* **B2 RESOLVED — runtime tools on localhost + link-out.** Skosmos and any live web-mode tool run from localhost (the `make serve-data` pattern); the static `/ontology` site links out to the local instance and carries static-generated renderings/exports. The deploy stays static; no runtime SPARQL server is hosted in production. See §Hosting "Runtime/server tools".
* **B3 — see rev 4 (DOWNGRADED by Council session-039 / ODR-0029).** The EPC is not a model error; `/ontology` is not blocked by a model defect. Superseded below.
* **All remaining items settled in rev 4 (below):** M5 (split → ADR-0042), M6 (rubric + decider), the single-page self-drift reconciliation, and the B3 downgrade.

### 2026-06-14 (rev 3) — Operator dispositions: standalone `/ontology`, all-tools execution authorized, two-version entailment

* **M1 DISMISSED — redundancy is accepted; `/ontology` is standalone.** Operator: "I don't care about creating redundancy. Consider the `/ontology` page standalone, and do not take other pages into account." `/ontology` is designed in isolation; overlap with `/modelling/ontology` and `/model/physical-ontology` is **intended and fine**. Drop the earlier "link into `/ontology`" reconciliation — those pages are simply not in scope for this work.
* **M2 OVERRULED — "use ALL tools" is deliberate, not padding; execution is AUTHORIZED.** Operator wants to **inspect each tool's output personally before settling** on the composition. So the bake-off **installs and runs every tool** (pyLODE, WIDOCO, SHACL Play!, Skosmos, Ontospy, LODE, custom) — the inspection *is* the value, and LODE/Ontospy are run too (Ontospy needs a Python ≤3.11 interpreter — provision one). This is no longer plan-only: **proceed to execute.**
* **M4 RESOLVED — two renderings per tool: non-entailed + entailed.** Rather than asking the OWL tools to mark asserted-vs-entailed (which they cannot — see review), produce **two complete renderings for each tool**: (1) **non-entailed** from the asserted merged TBox; (2) **entailed** from the asserted graph **+ OPDA's own materialised closure**. The entailed graph is produced by OPDA's custom SPARQL entailment — **not** a generic RDFS reasoner.

  **OPDA's entailment (the doc + how it works — confirmed in code):** `scripts/fuseki-load.mjs::materializeEntailments` (ADR-0035; ODR-0025 §R1 / ODR-0026), driven by the canonical ruleset `config/opda-rdfs-plus.rules` (a sound, RL-incomplete RDFS-Plus fragment — ODR-0029 R5; NOT an OWL 2 RL reasoner). It runs the **7 "Safe Group" rules** as idempotent SPARQL `INSERT … FILTER NOT EXISTS` statements, over Jena's `urn:x-arq:UnionGraph`, to a fixpoint (re-run until a pass adds 0 triples; guard 10), materialising into the derived graph `…/pdtf/graph/inferred/entailment`. The 7 rules: (1) `rdfs:subClassOf` transitivity, (2) `rdfs:subPropertyOf` transitivity, (3) `rdfs:subPropertyOf` value propagation, (4) `rdfs:subClassOf` type propagation, (5a/5b) `owl:inverseOf` both directions, (6) `owl:SymmetricProperty`, (7) `owl:TransitiveProperty`. **Deliberately EXCLUDED (ODR-0025 §R2; authored-but-not-evaluated per ODR-0026):** `rdfs:domain`, `rdfs:range`, `owl:FunctionalProperty`, `owl:InverseFunctionalProperty`, `owl:equivalentClass`, `owl:equivalentProperty`. So the "entailed" rendering MUST be built from this Safe-Group closure (run the loader against Fuseki and export the union, or replicate the 7 rules locally) — **never** a default RDFS profile.

  **EPC/B3 nuance discovered:** the rules header states the domain/range exclusion is *exactly what prevents the EPCCertificate false positive* (ODR-0025 §R7). So OPDA's own load-time closure does **not** mis-infer `EPCCertificate ⊑ Property`. The ODR-0028 R3 defect bites only a consumer who runs a **full RDFS/OWL reasoner** (or the ADR-0014 round-trip translator) instead of the Safe Group. The entailed rendering (built from the Safe Group) will therefore be correct on this point; the known-issue note should say "a naive full-RDFS consumer mis-infers this; OPDA's regime does not." (This refines B3: it is a *consumer-side* trap and a modelling smell, not an error in OPDA's materialised graph.)

### 2026-06-14 (rev 4) — Adversarial review fully settled

Closes every remaining open finding from the adversarial review, folding in Council [session-039](../ontology/odr/council/session-039-entailment-regime-and-epc-modelling.md) / [ODR-0029](../ontology/odr/ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md).

* **B3 DOWNGRADED (was OPEN).** The council established the EPC is **not a model error** — the model is correct; the cross-trip is a consumer-side full-RDFS trap that OPDA's own Safe-Group closure does not produce. `/ontology` is **not blocked by a model defect**, and no EPC fix gates `draft → accepted`. The entailed rendering (Safe-Group, per ODR-0029) is correct on this point; the known-issues register carries the consumer-side caveat only. The genuine edge-fixes (round-trip flag, dangling shape, ODR-0028 R3 wording, domain-as-SHACL) live in ODR-0029, not here.
* **M4 RECONCILED.** The council confirmed the Safe-Group closure adds **0 triples over the TBox** (only subClassOf type-propagation fires; ~30 trivially-recoverable over instance data). So the rev-3 "two renderings per tool" is **near-moot for the schema reference** (entailed ≡ non-entailed for the TBox). Disposition: a **single** rendering per tool for the TBox; produce the entailed variant **only** where instance data (exemplars) is rendered, noting OPDA's closure is minimal-by-design (ODR-0027/ODR-0029).
* **M5 SETTLED — split done.** The `/manual`→`/model` rename is its own record: [ADR-0042](./ADR-0042-rename-manual-section-to-model.md). §Hosting points to it; this ADR's scope is doc generation only.
* **M6 SETTLED — bake-off rubric + decider defined.** Score each tool per coverage-matrix layer (OWL terms · SKOS · SHACL · profiles+gap · exemplars · three-graph · governance/lineage · known-issues) on **Full / Partial / None**, plus two cross-cutting notes per tool: **fidelity** (does it misrepresent — raw blank nodes, asserted-as-entailed, SHACL ignored) and **integration cost** (effort to theme + wire into `opda-gen` + the gate). **Decider: the operator, on inspection** (rev-3 M2 — the operator inspects each); the rubric structures the inspection + the per-layer pick. Tie-break toward the tool needing least custom post-processing for fidelity. Captured as the `/ontology` bake-off comparison page (execution step f).
* **Single-page self-drift RECONCILED.** §Considered Options A, §Decision Outcome, and §Option C are reworded to multi-page; the `[HAND]/[GEN]` tags carry a note reconciling them with the Combination principle. The decision body no longer contradicts the amendments.
* **session-038 citation RE-FRAMED.** §More Information now states session-038 ratified the *original* single-page hybrid and the plan is substantially amended since — read with the Amendments.

All adversarial-review findings (B1–B3, M1–M6, hygiene) are now dispositioned.

- **2026-06-16 — RATIFIED (operator).** Status `proposed` → `accepted`. The hybrid generated-reference-in-hand-authored-shell + the consuming doc-drift CI gate are implemented and live (`scripts/gen-ontology-custom.mjs` + `scripts/ci-ontology-doc-drift.mjs`, the `make ci-ontology-doc` gate); Peroni's re-open trigger (generated body + gate that consumes it) is satisfied.
