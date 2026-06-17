# Handover — relationship-layer (object-property) gap → ODR-0032/ADR-0048, /ontology/classes + /ontology/graph visualisations, and a broken-deploy fix (2026-06-17)

> Follows `HANDOVER-2026-06-16-councils-045-046-sh-in-migration-and-adr-ratifications.md` (ended at `origin/main = 845ac05`). This session took `main` `845ac05 → bd68471` (**5 commits, all pushed + deployed green**), then produced **5 uncommitted working-tree changes** (two visualisations + two new decision records).

## TL;DR

A multi-part swarm task (ADR-0046 ±I gate · held-dissent sweep · Wave-2 page reconcile · publish+verify) **surfaced and fixed a pre-existing broken AWS deploy** (the prior handover's "live on AWS" was wrong). Then the `/ontology/classes` page was iterated (drop `opda:`, use `rdfs:label`, add **per-section Mermaid class diagrams**) and a **3D force-graph engine** was added to `/ontology/graph`. Finally, a model soundness/completeness audit (3-agent swarm + own verification) found the headline result: **the ontology's object-property / relationship layer was designed in ODR-0006/0007 but never emitted** — only **7** class→class object properties exist corpus-wide; ~30 classes are unconnected. Root-caused (no relationship walk, no object-property coverage gate — completeness was only ever gated for *datatype* leaves) and captured as **ODR-0032 + ADR-0048** (proposed). The descriptive/datatype layer itself is sound and complete-by-design.

## What shipped — PUSHED + LIVE (`origin/main = bd68471`, AWS deploy green)

| Commit | What |
|---|---|
| `c862927` | **ADR-0046 ±I IC-incompatibility gate-limb** — `check_ontoclean_identity_tbox` (9th three-graph check) + `build_ontoclean_identity_tbox_meta_shape`; flags `supplies-IC ⊑ supplies-IC`. Agent-built; **verified by hand** (positive-control test proves non-vacuity; direction correct; full CI re-run green) per last session's "agent green ≠ true" lesson. |
| `81a2ab9` | **Wave-2 page reconcile** — `data-quality` / `data-security` / `accreditation-directory` were already full first-cut drafts (NOT stubs). Removed contradictory "content pending" callouts, filled the trailing DAMA-KA rubric, corrected `governance/index` status table (🚧 Stub → ✅ Draft). |
| `119fc6e` | **Regenerate triplestore model + derived graph** — `src/data/ontology-model.json` + `public/data/ontology-graph-elements.json`; **unblocks the AWS deploy** (see ⚠1). |
| `dccb604` | `/ontology/classes` — drop `opda:` prefix, normal (non-mono) font, fit-width class column. |
| `bd68471` | `/ontology/classes` — show **`rdfs:label`** as the class name (fallback `localName`). |

E3 (DCAM note) was already present in `governance.md`; B1 (DAMA tags) was already 165/165 in sync with `scripts/dama-ka-mapping.json` (schema pages tag via a `page-meta` div, not the `PageMeta damaKa` prop) — both verified, no work needed.

## ⚠1 — The AWS deploy had been RED since last session (now fixed)

`deploy-aws.yml`'s ADR-0044 **model-drift gate** (`git diff --exit-code src/data/ontology-model.json`) had been failing since the council-046 `sh:in` migration: `ontology-model.json` was last regenerated at `82f8514`, *before* the 32→64 object-property retype, so every deploy after `282fe45` failed at that step and **the site silently stopped updating**. `make ci`/`make build` can't catch it (no triplestore). **Fix and rule:** after ANY ontology-corpus change, `npm run build:data` (= `make build-data`, needs JDK17+) regenerates `model.json` from Fuseki *and* re-derives `graph-elements.json` (the latter is derived from `model.json`, not the static TTLs) — **commit BOTH**, then **watch the actual Deploy run** (`gh run watch …`), because green gates ≠ green deploy. Recorded in `[[opda-ci-gate-topology]]` and `[[opda-deploys-via-ci-only]]` (also corrected: deploys are **AWS S3+CloudFront via `deploy-aws.yml`**, not Cloudflare Pages).

## Uncommitted in the working tree (5 files — nothing post-`bd68471` is committed)

### `/ontology/classes` per-section diagrams — `src/pages/ontology/classes.astro` (M)

Per bounded-context section, a **live Mermaid `flowchart LR` (ELK) class diagram** generated at build time from the model (`sectionDiagram()` in the frontmatter): in-context classes `:::user` (purple), cross-context target classes pulled in `:::external` (grey, distinct border), parallel object-properties collapsed to one labelled edge per class pair. **Live client-rendered Mermaid — NOT PNG-exported** (per `[[opda-no-mermaid-export]]`; injected as the `.mermaid` div's text, themed by `public/ui/client.js`). Figures capped **`max-width: 25%`, left-aligned** (`.section-class-diagram` global style). Verified rendering on the `localhost:4330` dev server (DOM-measured + screenshots).

### 3D graph engine — `public/ui/graph-engines/force-graph-3d.js` (new) + `src/pages/ontology/graph.astro` (M)

A new self-registering engine tab **"3D force-graph"** (id `force-graph-3d`, order 45) on the `/ontology/graph` bake-off, using **`3d-force-graph` + `three-spritetext`** (the AtomGraph/3D-Linked-Data stack, requested). `graph.astro` gets the `<script>` line + `clientV` 6→7. Mirrors the 2D `force-graph.js` engine (same `OPDAGraph` contract). Verified rendering WebGL in the browser (sphere nodes, sprite labels, facet/theme chrome, no console errors).

### ODR-0032 + ADR-0048 — the relationship-layer records (new; status `proposed`)

See next section. Registered in the AgentDB graph (`odr/ODR-0032`, `adr/ADR-0048`, tier `semantic`) + `odr-patterns`/`adr-patterns` memory.

## The big finding — the object-property / relationship layer was never emitted

**Symptom (the user's read of the class diagrams):** the Agents & Roles classes "float" — 8 classes, almost no connecting object properties.

**Verified facts:** of 64 object properties only **7 connect two `opda:` classes** (`hasChainPosition`, `hasEPCCertificate`, `hasEvidencedAuthority`, `hasSubAssessment` [reflexive], `identifiesSameProperty` [no domain], `recordsEstate`, `supportedBy`). ~30 classes (Person, Organisation, Seller, Buyer, Proprietor, Proprietorship, Transaction, Survey, Search, Valuation, Comparable, Milestone, EPCCertificate, …) have **0 incoming/outgoing object properties**. `opda:founds`/`opda:mediates` are emitted **rangeless** (`agent.py:309/329` — no `rdfs:domain`/`rdfs:range`); there is no `playedBy`/`roleOf` (role→bearer), no `Person→Address`, no `Transaction→participant/property`, and the chain predicates `dependsOnTransaction`/`chainMembers` exist only in comments.

**Root cause:** **ODR-0006/0007 designed the relationship layer** — `opda:playedBy`/`plays` + a role-play SHACL shape (ODR-0006 §"SHACL constraints"), `founds`/`foundedBy` (§"Role-founding relator pattern"), a structured `opda:Name` class + `Person`/`Org`→`Address` (class diagram + Consequences), the transaction participant/chain joins (ODR-0007) — **but the generator never emitted it.** ODR-0006's TBox was left "unfrozen pending a Kind-layer choice" and the emit pass never happened. And **completeness was only ever defined and gated for the descriptive *datatype-leaf* layer** (`ci-category-g-coverage`, ODR-0022) — there is **no coverage gate over object properties**, so the omission was invisible.

**The two records (proposed, uncommitted):**

- **ODR-0032 — Relationship layer: reify inter-entity associations as OWL object properties** (`docs/ontology/odr/`). Un-freezes ODR-0006/0007's relationship layer; ratifies the object-property inventory (§R2) + role-play/relator SHACL; sets a **relationship-completeness criterion** (every source inter-entity association reified with `domain`+`range`; no silent collapse) — the object-property analogue of ODR-0022. `kind: pattern`, `implements: [ODR-0006, ODR-0007]`.
- **ADR-0048 — Relationship-emission walk + object-property coverage gate** (`docs/adr/`). 5-phase plan: emit the inventory with domain+range + SHACL → `opda:Name`/Address joins → Transaction/chain joins → a new **`ci-object-property-coverage`** gate (fails on rangeless object properties + unreified associations) → regenerate (re-emit TTLs, re-pin byte-identity, regenerate `ontology-model.json`/graph/expected-reports, version bump, wire gate into `make ci` + three-graph CI + deploy). Mirrors ADR-0031/0032.

**Audit corroboration (3-agent swarm + own grep verification):** the descriptive/datatype layer IS sound + complete-by-design (ODR-0022, 239/239 gated; schema→dictionary 100%). The gap is specifically the relationship/object-property layer. Two side-findings: (a) the `ci-category-g-coverage` gate reports **238/239** with a `organisation` "GAP" that is a **false positive** (the leaf is emitted as `opda:organisationName`, an ADR-0044 rename never recorded in the `COLLAPSED` register — a 1-line gate/register fix; effectively 239/239); (b) the data dictionary's **overlay `enum` field is lossy**, but this does NOT reach the ontology (SKOS schemes are hand-curated with full value-sets).

## ⚠ Things a reader MUST know

1. **Deploy model-drift gate** — see ⚠1. The single most important operational fact: regenerate `model.json`+`graph-elements.json` via `build:data` after any corpus change and watch the Deploy run.
2. **ODR-0032 / ADR-0048 are `proposed` + uncommitted; the fix is NOT implemented** — they are the *plan*. ODR-0032 un-freezes ODR-0006, so ratification may warrant a `/council` rather than author-only acceptance.
3. **5 uncommitted files** — none of the post-`bd68471` work (classes diagrams, 3D engine ×2, the two records) is committed or pushed.
4. **S037 watch-item** (held-dissent sweep) — the only live trigger: the flat-slash `/pdtf/` namespace needs per-term content-negotiation wired **before it goes public**, or the council's re-open trigger fires. Currently auth-gated (302→Auth0), so dormant.
5. **`organisation` coverage-gate false positive** — a 1-line fix (register the `organisation→organisationName` rename in `inputs/category_g_curation.COLLAPSED`), independent of ADR-0048.
6. **Don't conflate the layers** — descriptive/datatype = sound + complete-by-design + gated; the gap is object-properties/relationships only.

## What's left / open (operator's call)

- **Implement ADR-0048** — the emitter relationship-pass + `ci-object-property-coverage` gate + regeneration. Sizeable, byte-identity-affecting. Can be done directly or via a swarm once ratified.
- **Ratify ODR-0032** (operator / `/council`).
- **Commit + push** the 5 uncommitted files (visualisations + records) — or split as preferred.
- **Fix the `organisation` coverage-gate false positive** (1-liner).
- **Carried:** the participant *attribute* backlog (`phone`/`email`/structured `name`/`participantStatus`/`verification`) — datatype/PII work, explicitly out of ODR-0032 scope. S037 namespace resolution. The ADR-0046 ±I limb is now done (was an open item last session).

## Key pointers

- **Relationship-gap evidence:** `source/03-standards/ontology/opda-agent.ttl` (`opda:founds`/`opda:mediates` rangeless; no `playedBy`); `tools/opda-gen/src/opda_gen/emitters/modules/agent.py:309/329`; ODR-0006 §"Role-founding relator pattern" / §"SHACL constraints".
- **New records:** `docs/ontology/odr/ODR-0032-relationship-layer-object-properties.md`, `docs/adr/ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md`.
- **Classes viz:** `src/pages/ontology/classes.astro` (`sectionDiagram()` + the `.section-class-diagram` global style). **3D engine:** `public/ui/graph-engines/force-graph-3d.js` + `graph.astro` (`clientV`).
- **Deploy gate:** `.github/workflows/deploy-aws.yml:84-85`; regen = `npm run build:data`; model→graph derivation = `scripts/ontology-graph.mjs`.
- **Coverage gate:** `tools/opda-gen/src/opda_gen/ci/category_g_coverage_test.py` + `inputs/category_g_curation.py`. Full CI mirror = `PATH="$PWD/tools/opda-gen/.venv/bin:$PATH" make ci` + `pytest tests/baspi5_round_trip/` + `emit-exemplar-reports`.

## Memory (cross-session)

Reinforced/updated: `[[opda-ci-gate-topology]]` (extended with the deploy-only triplestore model-drift gate), `[[opda-deploys-via-ci-only]]` (rewritten: AWS S3+CloudFront, not Cloudflare; watch the deploy run), `[[opda-no-mermaid-export]]`, `[[opda-diagram-theming-convention]]`, `[[invoke-skills-via-skill-tool]]`, `[[opda-odr-format-vs-skills]]`, `[[opda-classification-over-inheritance]]`, `[[council-web-verify-citations]]`. New lesson worth keeping: **the model's completeness was gated only for datatype leaves, never object properties** — the relationship layer (ODR-0006/0007) was designed-but-unemitted; ODR-0032/ADR-0048 are the fix.

## State

- `origin/main = bd68471`; local `main` = `bd68471` (**in sync, ahead 0**); AWS deploy **green + live** on `bd68471`.
- **Uncommitted (5):** `src/pages/ontology/classes.astro`, `src/pages/ontology/graph.astro`, `public/ui/graph-engines/force-graph-3d.js`, `docs/ontology/odr/ODR-0032-relationship-layer-object-properties.md`, `docs/adr/ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md`.
- ODR-0032 + ADR-0048 registered in AgentDB (`semantic`) + `odr-patterns`/`adr-patterns` memory; status `proposed`.
- All committed CI green; ADR-0046 ±I limb is implemented + verified (closes last session's open `±I` item).
