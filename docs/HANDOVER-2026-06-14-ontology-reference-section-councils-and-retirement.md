# Handover — Programme retirement, two councils, and the multi-page `/ontology` reference section (2026-06-14)

**Author:** Henrik (with Claude). **Scope:** one long session that (1) reconciled the descriptive-layer as complete and **retired the PDTF→ontology programme**, (2) ran **two councils** (session-038 doc-outline, session-039 entailment/EPC) producing ODR-0028/0029 + ADR-0041/0042, (3) **built the multi-page `/ontology` reference section** (16 pages + nav + doc-drift CI gate) and ran the all-tools bake-off, and (4) hit a wall standing up Skosmos. **Status: 5 commits on `main` (`1253a76`…`612f3ab`), all LOCAL — NOT pushed, NOT deployed. Working tree clean except `config/skosmos-config.ttl` (new, this handover commits it) + pre-existing unrelated edits. All gates green: 347 opda-gen pytest · 8 ci-ontology gates · doc-drift gate PASS · `make test` 29/0 · `make build-data` 444 pages.**

> Continues the descriptive-layer arc (ODR-0024 / session-034 / the 2026-06-02 namespace handover, whose stale "What's left" this session corrected).

---

## TL;DR

The descriptive layer was already complete (Category-G 239/239, monetary walk, profile binding) — the 2026-06-02 handover's "held" framing was stale. That reconciliation (**ODR-0028**) discharged the last ODR-0003 retirement condition, so the **programme is RETIRED** (ODR-0016 reviewed-and-waived at the gate, no trigger fired). Then the operator asked for a published HTML ontology reference. **Council session-038** shaped it (Queen Allemang, DA Peroni) → **ADR-0041**; an adversarial review + several operator amendments turned it into a **multi-page section under `/ontology`**, produced by a **bake-off of all tools** (pyLODE, WIDOCO, SHACL Play!, Skosmos, Ontospy, LODE) **woven with custom `opda-gen` scripts + LLM prose** (the "combination principle"), guarded by a **doc-drift CI gate**. A suspicion about the entailment regime spawned **Council session-039** (Queen Allemang, DA Hendler; Guizzardi/Knublauch/Cagle/Hitzler) → **ODR-0029**: the model is correct, the bespoke 7-rule fragment is sound (renamed `opda-rdfs-plus.rules`, **logic frozen**), and domain/range move to **SHACL constraints** (273 new shapes). The `/manual` section was renamed to `/model` (**ADR-0042**). All built, validated, committed locally. **Skosmos is the one unfinished piece** (no working standalone image).

---

## What shipped — 5 commits on `main` (all local; NOT pushed)

| Commit | What |
|---|---|
| `1253a76` | **Programme retirement.** ODR-0028 (descriptive-layer completeness reconciliation) + ODR-0003 RETIRED banner/amendment + ODR-0016 waived (3-trigger adjudication) + 2026-06-02 handover correction. |
| `095c98c` | **`/ontology` reference (v1) + `/manual`→`/model` rename + ODR-0029 fixes.** The single-page composition, the rename (ADR-0042), and the ODR-0029 edge-fixes (ruleset rename, **273 domain/range SHACL shapes**, round-trip flag, dangling EPC shape dropped, prose). |
| `359f780` | **Fix the composition** — dead tool links (Astro dev needs explicit `index.html`, not dir paths), Skosmos made a real link, **custom script+LLM output generated** (`scripts/gen-ontology-custom.mjs` → `public/ontology/tools/custom/index.html`). |
| `9889e9b` | **Multi-page `/ontology` + nav + doc-drift CI gate.** 14 pages + index rewrite; 6-group sidebar; coherence fixes; `scripts/ci-ontology-doc-drift.mjs` + `make ci-ontology-doc` (wired into `make ci`). |
| `612f3ab` | **§16 glossary** — `/ontology/glossary`, the A–Z index of every term, live-parsed. Completes ADR-0041 §0–17. |

Records created: **ODR-0028, ODR-0029, ADR-0041, ADR-0042, council session-038, session-039** (all registered in AgentDB + `odr-patterns`/`adr-patterns`).

---

## The two councils

- **[session-038](ontology/odr/council/session-038-ontology-reference-document-outline.md)** — Queen **Allemang**, DA **Peroni** (LODE/Widoco auto-generation school), panel Guizzardi/Knublauch/Cagle/Moreau. Outcome **REVISE**: not a hand-typed monolith but a *generated reference body + hand-authored conceptual/governance shell, under a doc-drift CI gate*. → ADR-0041.
- **[session-039](ontology/odr/council/session-039-entailment-regime-and-epc-modelling.md)** — Queen **Allemang**, DA **Hendler** (defends materialised inference), panel Guizzardi/Knublauch/Cagle/Hitzler. Outcome **REVISE**: the model is **correct** (don't re-home `currentEnergyRating`); the 7-rule fragment is **sound but mislabelled** (rename, logic frozen); **domain/range → SHACL** (closes the §R2 blind spot); EPC is **edge-fixes**, not a model defect (the cross-trip only fires under a consumer's full-RDFS, never OPDA's Safe-Group closure). → ODR-0029.

Both used `agent-fan-out` (the `/council` skill), Full Council, with the two-artefact transcript + tally discipline.

---

## ⚠ Things a reader MUST know

1. **NOTHING IS PUSHED.** 5 commits sit on local `main`. Push → Cloudflare deploy ([[opda-deploys-via-ci-only]]). The operator deliberately held the push pending the decisions below.
2. **The entailment RULE LOGIC is frozen (operator constraint, ODR-0029 R2).** The ruleset was renamed `config/opda-owl-rl-safe.rules` → **`config/opda-rdfs-plus.rules`** with an honest header (sound, RL-incomplete; NOT an OWL 2 RL reasoner) — **rule bodies byte-identical**; `ci-inference-closure` byte-identity is the proof. Do not add/remove/edit rules or re-admit domain/range as *entailment*.
3. **`/manual` is now `/model`** (ADR-0042, URL-only rename). Internal `manual` content collection + `docs/manual/` source unchanged; per-tier `/manual/* → /model/*` redirects in `astro.config.mjs`.
4. **The bake-off renders are GITIGNORED** (`public/ontology/tools/{ontospy,widoco,pylode,shaclplay}/` + `artefacts/`) — regenerable, ~96 MB (Ontospy alone 87 MB). They serve on localhost but are **absent from a CI build** → on the *deployed* `/ontology`, those tool iframes would 404. The committed-and-deployable parts: the 16 pages, `custom/index.html`, `COMPARISON.md`, the Skosmos schemes list, the lightweight READMEs.
5. **The bake-off was run ad-hoc by agents, NOT a committed script.** There is no `make ontology-bakeoff` yet, so a regen would need the correct per-tool inputs (see #6). The only committed generator is `scripts/gen-ontology-custom.mjs` (the custom layer; deterministic; guarded by the doc-drift gate).
6. **pyLODE must be fed the OWL-ONLY, single-ontology graph.** The first bake-off fed pyLODE the full `opda-merged.ttl` (14 `owl:Ontology` + 308 SKOS concepts) → it mashed every title/label into a run-on `<h1>` ("missing styling"). Fixed locally by regenerating on `outputs/bakeoff/opda-owl-doc.ttl` (modules only, one `owl:Ontology`, no SKOS). **This fix is in a gitignored file — it will regress if regenerated without the OWL-only input.** Widoco/Ontospy/SHACL-Play/custom render fine.
7. **`/ontology` is `status: draft`; ADR-0041 is `proposed`.** It moves to accepted when the operator settles the **M6 per-layer pick** (which tool wins each layer — `COMPARISON.md` is the inspection aid) and ratifies.
8. **Doc-drift gate scope (ODR-0041 B1).** `make ci-ontology-doc` byte-compares the *custom* output against the corpus; the live-count Astro pages regenerate at `astro build` (can't drift); the third-party renders are pinned/gitignored. The gate is GREEN.
9. **A global behavioural rule was added** to `~/.claude/CLAUDE.md` (outside this repo): *URLs must be fully-qualified + clickable in the VSCode terminal* (scheme always, verified route).

---

## What's left / open decisions (operator's call — none block "complete")

1. **Skosmos — the one unfinished tool.** Fuseki is live with the full SKOS (48 schemes / 314 concepts) at `http://localhost:3031/opda/sparql`, and `config/skosmos-config.ttl` is written — but **no working standalone Skosmos image exists**: the README's `natlibfi/skosmos` is dead; the arm64 community image (`jimfhahn/skosmos`) is a docker-compose component (no standalone web entry — serves an Apache dir-listing). **Decision:** stand up the Skosmos **docker-compose stack** (Skosmos + Varnish + its own Fuseki; ~15–20 min, localhost-only per B2), or keep the **live Fuseki SPARQL endpoint + static `schemes.html`** and defer. The `/ontology` Skosmos link currently points at the static `schemes.html`.
2. **Deploy strategy for the heavy renders** (#4 above) — commit the light ones (pyLODE+SHACL-Play ≈ 1 MB) so they survive deploy, wire a CI bake-off step, or leave them localhost-only.
3. **M6 per-layer pick** — finalise the adopted composition.
4. **Push** — held; push deploys.
5. **Capture the bake-off as `make ontology-bakeoff`** pinning per-tool inputs (pyLODE → OWL-only single-ontology; SHACL Play! → shapes; Skosmos/Ontospy → full) so #6 can't regress.

---

## Running session processes (die on session exit)

- **Fuseki + GRLC** — `make serve-data` (bg) → `http://localhost:3031/opda/sparql` (full corpus + materialised entailment). Restart: `make serve-data`.
- **Astro dev** — `make dev` (bg) → `http://localhost:4330/` (the live review surface; `/ontology` is the new section). Restart: `make dev`. (Plain `make build` is red at HEAD pre-existingly — needs the GRLC API; use `make build-data`.)

---

## Key pointers

- **The section:** `src/pages/ontology/*.astro` (16 pages); nav in `src/lib/site.ts` `SECTIONS.ontology` (6 groups). Review: `http://localhost:4330/ontology`.
- **Bake-off outputs:** `public/ontology/tools/<tool>/` + `COMPARISON.md` (M6 rubric); artefacts `public/ontology/artefacts/`. Generators: `scripts/gen-ontology-custom.mjs`, the merged graphs in `outputs/bakeoff/`.
- **Gates:** `make ci` (= `test` + `ci-ontology` + `ci-ontology-doc`); run ontology gates with `PATH=tools/opda-gen/.venv/bin:$PATH` (the ambient `python` is a mise 3.13 shim that violates the <3.12 pin).
- **Decisions:** ODR-0028/0029, ADR-0041/0042, council session-038/039 (all under `docs/`).

## Memory

Reinforced [[opda-deploys-via-ci-only]], [[opda-work-directly-on-main]]. The ODR-0029 "rule logic frozen + domain/range-as-SHACL" doctrine and the ADR-0041 combination principle are stored in `odr-patterns`/`adr-patterns`. New global rule (clickable URLs) lives in `~/.claude/CLAUDE.md`.

## State

5 commits on `main` (`1253a76`…`612f3ab`), local, NOT pushed. All gates green; `/ontology` multi-page section live + reviewable on localhost. Open: Skosmos (compose-vs-static), deploy of heavy renders, M6 pick, push. Programme retired; descriptive layer complete; entailment regime sound (frozen) + domain/range now validated by SHACL.
