# Handover — Category E/D Emission, WG-Item-1, the `implements:` Correction & the Curated-G Walk Plan (2026-05-31)

**Author:** Henrik (with Claude). **Scope:** one session continuing the 2026-05-30 descriptive-layer arc — emitted Categories **E** and **D**, fixed the G1 binning defect, applied WG recommendation **item 1**, **corrected an `implements:` convention mistake I made**, discovered + recorded the **G11 overlap**, and drafted the **curated Category-G walk execution plan (ADR-0031)**. **Status: all committed + pushed to `main` (deployed via CI); all new records `proposed` pending OPDA WG ratification.**

> Continues [HANDOVER-2026-05-30-descriptive-layer-import-and-followon-councils.md](./HANDOVER-2026-05-30-descriptive-layer-import-and-followon-councils.md) (prior session: the ODR-0022/0023/0008d strategy + the gated, zero-IRI build). **This session did the *emission* + the follow-on.**

---

## TL;DR

The deferred Category E/D emission and the open question *"do we have a plan for parsing the leaves?"* both got resolved. **Category E** (`opda:RiskAssessment` + `opda:PerilScheme` + rating schemes + node shapes + the five-class Information-Object correction) and **Category D** (`opda:inclusionStatus` Mode + `FixturesListShape` + a single shared `opda:price`) are emitted, verified (full `opda-gen` suite + all four CI gates + site build green), and committed. The **G1 binning defect** was fixed first (candidate-G 182 → 188). **WG recommendation item 1** was applied (`riskIndicator` reuses `YesNoNotKnownScheme`), which surfaced + fixed a conflicting-domain duplicate and exposed that **~17 §Q5a leaves were already emitted (G11, 2026-05-28)**, overlapping the candidate-G set. The leaves-parsing question now has an answer: **[ADR-0031](adr/ADR-0031-category-g-curated-walk-execution-plan.md)** — the curated Category-G walk execution plan. **One honest correction:** I initially got the ADR `implements:` convention **backwards** (normalised to `implements:[ODR-…]`, and pushed it), then the `adr-create` skill surfaced the real rule (intra-corpus only) — reverted + fixed all 10 affected ADRs; the corpus is now clean.

---

## What shipped (commits on `main`, all pushed → deployed via CI)

| Commit | What |
|---|---|
| `a051332` | Ontology arc — G1 categoriser fix (182 → 188) + **Category E/D emission** + bounded-context scheme + regenerated TTLs + records |
| `d44cc47` | UI/site arc — ODR content-collection rendering + manual + design-system |
| `5ccf550` | ADR cohort frontmatter (the **wrong** `implements` normalisation — *superseded by `d8bd2a0`*) + WG recommendations recorded + handover refresh |
| `4068204` | **WG item 1** — `riskIndicator` reuses `YesNoNotKnownScheme`; dropped the dedicated `RiskIndicatorScheme`; fixed the conflicting-domain duplicate |
| `d8bd2a0` | **`implements:` convention correction** (intra-corpus only; all 10 ADRs clean) + **ADR-0031** (curated-G walk plan) + ADR-0005 G11 register fix |

---

## The Category E/D emission (green; per ODR-0008d §Rules 1–5 + ODR-0022 §4 / R4)

**Category E** (`opda-descriptive.ttl` / `opda-vocabularies.ttl` / `opda-descriptive-shapes.ttl`):
- `opda:RiskAssessment` — UFO **Information Object**, `rdfs:subClassOf prov:Entity`, IC ⟨activity, peril, subject, generated-time⟩.
- `opda:PerilScheme` — 12 dereferenceable peril concepts, each `dct:source` → governing authority, steward Baker.
- `opda:RiskIndicatorScheme` → **retired** (item 1: reuses `YesNoNotKnownScheme`); `opda:ActionAlertRatingScheme` (1–5) stays.
- Properties `opda:peril` / `opda:riskIndicator` / `opda:actionAlertRating` / `opda:hasSubAssessment`; `datasetAttribution` **reuses `prov:wasAttributedTo`** (not minted, Rule 5).
- `RiskAssessmentShape` (recursive `sh:node`) + 5 internal-structure shapes + the **five classes' Substance-Kind → Information-Object correction** (12× "Information Object" in the TTL, 0 stale "Substance Kind").

**Category D:** `opda:inclusionStatus` as a sale-transaction **Mode** (`FixturesListShape` targets `opda:Transaction`, never `opda:Property`) + single shared `opda:price` over the existing `opda:FixtureItemScheme` (89 items).

**Engineering owner:** [ADR-0030](adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) (amended with the emission update). **Model:** [ODR-0008d](ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) (Lint-8 fixed: §Rule 5 now states the ODR-0017 `sh:Info` / non-blocking / shapes-graph discipline).

---

## ⚠ Three things a reader MUST know

### 1. The `implements:` convention — I got it backwards, then fixed it
**The rule (canonical — `adr-create` skill spec + `adr-review` A3 lint): `implements:` is INTRA-CORPUS ONLY (ADR→ADR).** An ADR realising an **ODR** puts that ODR in **`depends-on:`** (cross-corpus is allowed there, forbidden for `implements`/`supersedes`). I initially dismissed the `adr-review` A3 finding as "generic, doesn't apply", wrongly normalised ADR-0026 + ADR-0009–0014 to `implements:[ODR-…]`, and **pushed it** (`5ccf550`). The `adr-create` skill then surfaced the real rule; I reverted those 7 to `implements:[ADR-0008]` (ODRs back in `depends-on`) and fixed the pre-existing ADR-0028/0029/0030 violations to `implements:[]` (`d8bd2a0`). **`grep "^implements:.*ODR-" docs/adr/*.md` is now empty.** Memory [[opda-odr-format-vs-skills]] corrected with the rule + the lesson: *when the project's own `adr-review`/`adr-create` skill states a rule, it IS the rule.*

### 2. `riskIndicator` re-home supersedes part of G11 — flagged for WG (NOT silent)
While applying item 1, `opda:riskIndicator` was found declared in **both** `opda-property.ttl` (the **G11** §Q5a flat-Property emission, 2026-05-28) and `opda-descriptive.ttl` (the ODR-0008d RiskAssessment Quale) — **conflicting `rdfs:domain`**. I removed the Property declaration (it bins to **Category E**, and ODR-0008d models it on `RiskAssessment`). This **supersedes part of the closed G11 item** — recorded in **ADR-0005 §G11 + changelog** and as the first reconciliation-register entry in **ADR-0031 §1**, flagged for **WG ratification** (per the §G1 principle: *engineering does not silently reconcile ratified-rules disagreements*). Defensible (newer, council-ratified, categoriser agrees) but the WG should ratify.

### 3. The three WG-flagged modelling choices on the E/D emission (recorded in ODR-0008d)
- **Item 1** (`RiskIndicatorScheme` reuse) — **APPLIED**.
- **Item 2** (`PerilScheme` `skos:narrower`) — **sound as-is** (no enumerated sub-perils in the data; recursion rides `hasSubAssessment`).
- **Item 3** (`opda:MonetaryAmount`) — **keep shared `opda:price`; deferred** to the Category-G monetary-leaf walk (~225 monetary leaves, no currency sub-field).

---

## The curated Category-G walk plan — the "leaves parsing" answer: [ADR-0031](adr/ADR-0031-category-g-curated-walk-execution-plan.md)

Before this, we had the strategy (ODR-0022), per-leaf rules (§Q5a/§Q6a, the R2 axis framework), the inputs (188 candidate-G), and the emission mechanism (ADR-0030) — but **no execution plan**, and **~17 §Q5a leaves silently already emitted (G11)** overlapping the candidate set. ADR-0031 (`proposed`, a fresh successor to the re-scoped ADR-0028) owns **process + sequencing only** (per-leaf modelling stays the WG's), in five work items:

1. **G11 reconciliation first** — diff the 188 against the ~17 G11-emitted leaves; per overlap leaf the WG decides *stands* vs *re-home* (the `riskIndicator` re-home is the worked template + first register entry).
2. **Per-leaf procedure** — §Q5a → §Q6a → R2 axis → domain → IRI → `dct:source` (G2), emitted via ADR-0030.
3. **Batching** — overlap §Q5a family first, then by overlay/form.
4. **R2 sequencing** — the walk produces the UFO-typed partition R2 needs → walk → R2 → (if load-bearing) ODR-0008a/b/c.
5. **Completion gate** — G3 `ci-descriptive-roundtrip` flips `xfail → PASS` at totality (ADR-0028 totality assertion).

---

## What's open / next steps (suggested order)

1. **WG ratification** of all `proposed` records — ODR-0022 / 0023 / 0008d, ADR-0026 / 0027 / 0028 / 0029 / 0030 / **0031**. (ODR-0008d Lint-8 cleared; the records carry the WG-flagged items.)
2. **Run the curated Category-G walk** per ADR-0031 — **start with the G11 ∩ candidate-G reconciliation** (the `riskIndicator` entry is the template; ratify or re-home each overlap leaf).
3. **ODR-0023 R2** (UFO-axis sub-modules) — gated on the walk; ADR-0031 sequences walk → R2.
4. **Optional housekeeping:** rebuild the ADR dependency index (`adr-index`) so AgentDB reflects the corrected `implements`/`depends-on` graph (the files are canonical; the index is derived + now stale).
5. **Cagle's held dissent** on `opda:RiskAssessment` (alternative-d, reuse-`Search`) rides to the WG with its re-open trigger.
6. **Latent (worth a check):** no CI gate catches **cross-module duplicate declarations** — the `riskIndicator` duplicate passed byte-identity + three-graph. A "every `opda:` term declared in exactly one module TTL" assertion would catch the next one.

---

## Key pointers

- **The leaves-parsing plan:** [ADR-0031](adr/ADR-0031-category-g-curated-walk-execution-plan.md). **The model:** [ODR-0008d](ontology/odr/ODR-0008d-authority-retrieved-artefacts.md). **The strategy:** [ODR-0022](ontology/odr/ODR-0022-descriptive-layer-import-strategy.md). **The engineering:** [ADR-0030](adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md). **The G11 overlap:** [ADR-0005 §G11](adr/ADR-0005-deferred-work-register.md).
- **Run the generator:** `cd tools/opda-gen && PYTHONPATH=src .venv/bin/python -m opda_gen.cli {emit | categorise-leaves | ci-byte-identity | ci-three-graph | ci-profile-contract | ci-descriptive-roundtrip}`; tests `PYTHONPATH=src .venv/bin/python -m pytest -q`; site `npm run build`.
- **The candidate-G set:** `source/00-deliverables/semantic-models/descriptive-category-binning.json` (gitignored build artefact; **188** distinct names — regenerate with `categorise-leaves`).
- **ADR convention (do not repeat my mistake):** `implements:` = intra-corpus ADR→ADR; an ADR realising an ODR puts the ODR in `depends-on:` (see [[opda-odr-format-vs-skills]]).

## Everything is committed + pushed

All work is on `main` (`d8bd2a0` is HEAD), pushed → Cloudflare Pages deployed via CI. No `wrangler` runs (deploys via CI only). All new records are `proposed` pending OPDA WG → Modelling Sub-Committee ratification.
