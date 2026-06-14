# Handover — opda.org.uk/pdtf namespace migration EXECUTED + byte-identity CI fixed + docs de-WG-gated (2026-06-02, pm)

**Author:** Henrik (with Claude). **Continues** [HANDOVER-2026-06-02-jena-toolchain-pyshacl-retire-and-url-scheme.md](./HANDOVER-2026-06-02-jena-toolchain-pyshacl-retire-and-url-scheme.md), which left the namespace migration *designed and frozen but NOT run*. **This session ran it** — end to end, merged to `main`, deployed — then fixed a pre-existing red CI gate and swept the docs.

**Status: 15 commits on `main` (`4b30995`…`666aae4`, on top of `ec7b394`), all pushed; deployed (Cloudflare Pages green). Working tree clean. Full verification green: 345 pytest + 8 CI gates (byte-identity now green in CI for the first time since the prior session) + 27 repo-root round-trip + 29 remark + `build:data` (Fuseki load+closure, 427 pages). Working directly on `main` now — no feature branches (Henrik's instruction; [[opda-work-directly-on-main]]).**

---

## TL;DR

The frozen ADR-0006 scheme is **live**: every opda IRI moved `https://w3id.org/opda/#…` → `https://opda.org.uk/pdtf/…` as a **kind-namespace split** (terms `/pdtf/`, SKOS `/pdtf/scheme/`, shapes `/pdtf/shape/`, graphs `/pdtf/graph/`, governance/physical `/pdtf/harness/`). It was done by changing the **emitter code** (a new `opda_gen/namespaces.py` source-of-truth) and re-emitting — never by hand-editing TTL — then re-pinning byte-identity. The migration is complete across **code, corpus, toolchain, loader, tests, and docs**. Two side-quests followed: (1) the **byte-identity CI gate** was red since the prior session — fixed (it was a missing schemas-clone step, not a migration defect); (2) on instruction, **all live "WG decision required" deferrals across the docs were resolved directly** (greenfield — no WG gate), preserving historical council minutes.

---

## What shipped — 15 commits on `main`

| Commit | What |
|---|---|
| `4b30995` | **Phase 0** — `opda_gen/namespaces.py` SoT (`OPDA`/`OPDA_SCHEME`/`OPDA_SHAPE`/`OPDA_GRAPH`/`OPDA_HARNESS` + `odr_ref`/`adr_ref`/`dd_entry`/`release_iri` helpers + `assert_no_segment_collision` flatten-guard) + [PLAN doc](./PLAN-2026-06-02-namespace-migration.md). |
| `c0181ae` | **Phase 1a** — mechanical regex pass: ODR `#`→`/harness/odr/…/section`, ADR→`/harness/adr/`, dd `#`→`/harness/data-dictionary/`, term base `…/#`→`…/pdtf/` (243 changes / 39 files). |
| `eebabde` | **Phase 1b** — structural kind-splits in emitters: foundation (drop version-IRI path → `owl:versionIRI`→harness release; graphs→`/pdtf/graph/`; `targetsClassGraph`→ontology IRI), vocabularies (schemes/concepts→`OPDA_SCHEME`), shapes (shape nodes→`OPDA_SHAPE`, `FixtureItemScheme`→scheme), profiles (`/pdtf/shape/profiles/`, harness versionIRI), modules+annotations (graph IRIs→`/pdtf/graph/`, `owl:imports` deduped to one `/pdtf/`, per-module versionIRI→harness release), `ci/inference_closure_test` graph IRIs, exemplar data→harness, dead `_SCHEMA_LEAF_AUTHORITY` string. |
| `0139851` | **Phase 1-4 GREEN** — fixed hash-assumption local-name extractions (`split('#')`→`rsplit('/')` in `leaf_resolver`, `shapes`, `profiles`, tests); re-emitted full corpus + regenerated 17 exemplar reports; hand-migrated the 17 exemplar **data** files; updated test assertions for the kind-splits. 345 pytest + 8 gates + 27 round-trip PASS. |
| `76abd79` | **Phase 2** — loader (`scripts/fuseki-load.mjs`) graph IRIs → `/pdtf/graph/`. |
| `3288f75` | **Phase 5** — ADR-0006 amended: `/pdtf/scheme/` segment recorded (ruling #1) + an "As-built" block. |
| `d1297aa` | TS fixture + rules-file/astro comments → new scheme. |
| `b3df56a` | IA spec prose (the 6 `REPORT_JOBS` source markdowns) → new scheme (regenerates `src/generated/*.html` on build). |
| `6f5dc6e` | **byte-identity CI fix** — added the PDTF-schemas clone step to `ontology-byte-identity.yml`. |
| `11e1a50` | **Docs migration (swarm)** — ~160 docs: live IRI refs migrated, decision records preserved. |
| `82556ba` | content-negotiation tier rewritten to the opda-direct serving model. |
| `80f36ef`,`844a12d` | accreditation `@context` decided → `https://opda.org.uk/pdtf/harness/accreditation/v1` (governance apparatus, not a term, not a new standard) + vc-submission-spec de-WG-gated. |
| `b35d912`,`666aae4` | remaining live "WG decision required"/"pending WG ratification" deferrals resolved directly across templates + ODR/ADR records. |

---

## ⚠ Things a reader MUST know

1. **The corpus is the new scheme.** `@prefix opda: <https://opda.org.uk/pdtf/>`. Old `w3id.org/opda` is gone from all emitted artefacts + code. The **single source of truth is `tools/opda-gen/src/opda_gen/namespaces.py`** — change IRIs there, never in TTL.
2. **The kind-split is done by which constant mints the IRI**, not by string surgery: `OPDA.Property`→`…/pdtf/Property`, `OPDA_SHAPE.X`→`…/pdtf/shape/X`, `scheme_uri()`/`member_uri()` use `OPDA_SCHEME`→`…/pdtf/scheme/…`. SKOS *instances* move to `/scheme/`; `owl:Class`-typed `*Scheme` (e.g. `SpecialCategoryScheme`, `BoundedContextScheme`) stay term-side.
3. **Modules collapsed.** No per-module ontology IRI — each module file declares its graph IRI `…/pdtf/graph/<module>` and `owl:imports <…/pdtf/>` (the one ontology). Per-module/profile `owl:versionIRI` → `…/pdtf/harness/release/…`.
4. **`dct:source`→harness ODR/ADR/dd kept** (provenance comments, not core→harness dependencies — Henrik's ruling). The single definitional `rdfs:isDefinedBy`→ODR on `opda:consumesFrom` was repointed to the core ontology.
5. **byte-identity CI was red since the prior (Jena) session** — NOT this migration. Cause: `profiles.py` reads the external PDTF overlay JSONs at import; that repo is gitignored & not a submodule; the workflow lacked the clone step `baspi5-round-trip.yml` already had. Fixed in `6f5dc6e` (pinned SHA `996a56a` = the emit basis). It is **green now**.
6. **NO WG GATES — greenfield. Decide everything directly.** Henrik corrected this repeatedly; reinforced in [[opda-greenfield-no-wg-gate]]. All live "WG decision required"/"pending WG ratification" deferrals were resolved as directing-authority decisions. **Historical council minutes were preserved** (they record what was argued/concluded; the override is recorded in adoption.md + ADR-0006). Do not re-introduce WG-deferral framing.
7. **DNS/resolution is a non-issue.** IRIs are identifiers; dereferenceability is optional/aspirational (Henrik confirmed). `opda.org.uk` is owned; per-term DNS unset is fine. The content-negotiation docs now describe **opda-direct** serving (the W3C-PICG redirect chain was removed).
8. **Working on `main` directly now** ([[opda-work-directly-on-main]]) — no feature branches. Push to `main` triggers the Cloudflare deploy ([[opda-deploys-via-ci-only]]).

---

## Decisions made this session (directing-authority, recorded)

- **`/pdtf/scheme/` for all SKOS** schemes+concepts (disambiguates the flat term namespace; ADR-0006 amended).
- **`dct:source` = comment, not dependency** (core→harness invariant holds); fixed the one `rdfs:isDefinedBy`.
- **Logical graph ≠ physical doc** — named graphs `/pdtf/graph/`; physical/governance `/pdtf/harness/`; no document IRIs in core.
- **No `forms` family** — `_SCHEMA_LEAF_AUTHORITY` was dead code; data-dictionary is the real schema-leaf-path target.
- **Accreditation `@context`** → `https://opda.org.uk/pdtf/harness/accreditation/v1` (governance apparatus).
- **VC submission spec** (de-WG-gated): proof type = **Data Integrity**; interface = **PR/commit first**; `validUntil` = **end of following quarter**; key allowlist = **published bundle keys**, warn-and-include unknowns; resubmission = **7d capped at cutoff**.
- **Publish/agenda templates**: same-day comms; sign-off defaults; local-preview staging; Engagement WG owns prep; EC secretary updates ADR-0005; permissive mid-year Wave-3 additions.

---

## What's left (outstanding ENGINEERING — no gates)

> **⚠ CORRECTION 2026-06-14:** Items 1 and 2 below were **stale when written** — carried over from the ADR-0031 *plan* state and never updated. Both walks had in fact already **completed** before this handover (commits `ce7de50`→`37fef4a`→`12a4bb4`→`6e5f6d1`, all on `main`). `ci-category-g-coverage` reports **239/239** (224 minted, 15 collapsed, 0 uncovered) — PASS — and `opda:MonetaryAmount` exists as a value-type class with its own SHACL shape. The corrected items are struck through below; only item 3 (ADR-0005 register) remains genuinely open. The real next descriptive thread is **per-form profile binding** (ODR-0021), not more leaf modelling.

1. ~~**The Category-G curated walk** (ADR-0031 work-item 2) — the ~188 descriptive-concept permanent IRIs are still **held/not-emitted**; per-form profiles stay thin. `ci-descriptive-roundtrip` *passes* (not blocking), but full descriptive-layer fidelity isn't there. **This is the clear next ontology build.** Execute directly (greenfield).~~ **DONE** — walk complete at 239/239 (`ci-category-g-coverage` PASS); see commits `ce7de50`/`37fef4a`/`12a4bb4`/`6e5f6d1` and [ODR-0024](ontology/odr/ODR-0024-curated-category-g-walk-dispositions.md).
2. ~~**Held monetary walk** — no `opda:MonetaryAmount` value type yet; `opda:price` is a single shared property; `category_g_curation.py` defers price-like leaves to it.~~ **DONE** — `opda:MonetaryAmount` value type minted (G22, commit `12a4bb4`); price-like leaves emit as object properties ranging on it.
3. **ADR-0005 register (trigger/readiness-based, not migration):** accreditation directory build C1–C4 (waiting on member-firm VC readiness); **E1** visual smoke test (Henrik); **E2** external-materials audit (old `/pages/NN-*.html` + `openpropdata.org.uk` refs — relevant now the namespace moved); D1–D5 / B1–B2 / F3–F4 governance-policy + DAMA docs (opportunistic).

---

## Key pointers

- **SoT:** `tools/opda-gen/src/opda_gen/namespaces.py`. **Plan:** [PLAN-2026-06-02-namespace-migration.md](./PLAN-2026-06-02-namespace-migration.md). **Scheme:** [ADR-0006](./adr/ADR-0006-w3id-opda-ontology-namespace.md) (definitive block + As-built).
- **Gates** (auto-provisions Jena; JDK on PATH): `cd tools/opda-gen && .venv/bin/python -m pytest -q` (345) · `.venv/bin/python -m opda_gen {ci-byte-identity|ci-three-graph|ci-dup-declaration|ci-profile-contract|ci-descriptive-roundtrip|ci-category-g-coverage|ci-baspi5-roundtrip|ci-inference-closure}` · repo-root: `PYTHONPATH=tools/opda-gen/src tools/opda-gen/.venv/bin/python -m pytest tests/baspi5_round_trip -q` · live: `npm run build:data`.
- **Re-emit/re-pin:** `.venv/bin/python -m opda_gen emit --output ../../source/03-standards/ontology/` then `ci-byte-identity` (+ `emit-exemplar-reports` if shapes/exemplars changed). Exemplar **data** files under `exemplars/` are hand-maintained — not regenerated.
- **External overlay schemas:** the nested `source/03-standards/schemas/` repo (pinned `996a56a`); CI clones it in both `baspi5-round-trip.yml` and `ontology-byte-identity.yml`.
- **`src/generated/*.html`** are gitignored build artefacts (regenerated by the `reportGenerator` Astro integration on `astro build`); their sources are the 6 `REPORT_JOBS` markdowns in `src/lib/generated-reports.mjs`.

## Memory

Reinforced [[opda-greenfield-no-wg-gate]] (recurring slip — never defer to WG). New: [[opda-work-directly-on-main]] (commit straight to main, no branches). Survivors: [[opda-deploys-via-ci-only]], [[opda-schemas-nested-repo]], [[opda-diagram-theming-convention]], [[opda-no-mermaid-export]].

## State

15 commits on `main` (`4b30995`…`666aae4`), pushed, deployed green. Working tree clean. Namespace migration complete + byte-identity CI green + docs de-WG-gated. ~~Next engineering: the Category-G curated walk.~~ **(2026-06-14 correction: the G-walk was already complete at 239/239 — see corrected "What's left" above; next descriptive thread is per-form profile binding, ODR-0021.)**
