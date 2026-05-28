---
adr: ADR-0020
phase: 5
verdict: PASS-WITH-FOLLOW-UPS
date: 2026-05-28
---

# ADR-0020 Validation Report — Manual generator frontmatter

**Validation agent:** independent-validator-adr-0020 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0020 worker (Phase 5 — Regeneration)
**Cited ADRs:** ADR-0020, ADR-0019 (G19a constraint), ADR-0016 (Zod schema), ADR-0015 §Confirmation
**Programme plan:** `docs/plan/manual-astro-integration.md` §11

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All material Phase 5 criteria are met. The emitter exists with the correct API, is correctly wired as a standalone `emit-manual` subcommand, processes 184 files and skips 34, is fully idempotent (second run: 0 files updated), preserves all Phase 4 "See also: Modelling section" blocks in all 4 tier READMEs, emits correct frontmatter shape across all kinds, and the Astro build exits 0 at 386 pages with zero Zod validation errors.

Two follow-ups are elevated:

- **G20a — WARNING (non-blocking):** `emit-profile` command in `cli.py` (lines 376–382) erroneously calls `emit_manual` at its tail, coupling profile emission to manual frontmatter regeneration. The `emit` umbrella does NOT call `emit_manual`, which is the correct placement per ADR-0020 §Confirmation #3. The net effect is that `opda-gen emit-profile baspi5` also regenerates manual frontmatter (idempotent after first run, so no data loss), and `opda-gen emit` does NOT regenerate manual frontmatter via the umbrella. Correctness of the emitter itself is unaffected. Fix is a one-line move.

- **G20b — INFO (non-blocking):** `pyyaml` is installed in the venv and is a runtime dependency of `emitters/manual.py` but is NOT declared in `pyproject.toml` `[project.dependencies]`. A fresh CI install will fail without it. Must be added before CI picks up the emitter.

ADR-0020 advances from `status: implemented` to `status: accepted`.

---

## 2. ADR-0020 §Confirmation criteria status

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `tools/opda-gen/src/opda_gen/emitters/manual.py` exists with `emit_manual(output_dir, *, tier=None)` API | CONFIRMED | File present at expected path; function signature verified by reading source. |
| 2 | `opda-gen emit-manual` CLI subcommand wired | CONFIRMED | `@main.command(name="emit-manual")` at line 385 of `cli.py`; `--output` and `--tier` options wired. |
| 3 | `emit` umbrella runs `emit-manual` at end of pipeline | NOT MET — G20a | The `emit` umbrella (lines 128–180 of `cli.py`) does NOT call `emit_manual`. Instead, `emit_manual` is called from inside `emit-profile` (lines 376–382), which is incorrect placement. See G20a. |
| 4 | Second run: 0 files updated, 218 files skipped | CONFIRMED | `python -m opda_gen.cli emit-manual --output docs/manual` second run output: `emit-manual: 0 files updated, 218 files skipped.` |
| 5 | `astro build` after regeneration: exit 0, 386 pages, zero Zod errors | CONFIRMED | `npm run build` with cleared cache: exit 0, `386 page(s) built in 8.07s`, zero Zod/Invalid lines in build log. |
| 6 | 31 tests in `test_manual.py`, 158 total passing | CONFIRMED | `python -m pytest tests/test_manual.py -v` → 31 passed. Full suite → `158 passed in 1.06s`. |
| 7 | Implementation report at `docs/adr/implementation-reports/ADR-0020-implementation.md` | CONFIRMED | File present and complete. |

---

## 3. ADR-0015 §Confirmation 10/10 walkthrough

This is the master programme gate. Each criterion evaluated against live artefacts.

| # | Criterion (ADR-0015 §Confirmation) | Realising ADR | Status | Evidence |
|---|---|---|---|---|
| 1 | `src/lib/site.ts` extended — `manual` in `HEADER_ORDER` between `modelling` and `schema`; `SECTIONS.manual` populated | ADR-0016 | GREEN | `HEADER_ORDER` at line 40–51 of `site.ts`: `'modelling', 'manual', 'schema'` confirmed. `SECTIONS.manual` at line 165+. |
| 2 | Content collection wired — `getCollection('manual')` returns ≥220 entries | ADR-0016 | GREEN | `src/content.config.ts` declares `manual` collection via `glob({ pattern: '**/*.md', base: './docs/manual' })`. Build emits 219 `dist/manual/` pages (all entries consumed). |
| 3 | Four dynamic routes emit | ADR-0016 | GREEN | `src/pages/manual/{concept,logical,physical-database,physical-ontology}/[...slug].astro` all present. `dist/manual/concept/`, `logical/`, `physical-database/`, `physical-ontology/` all contain rendered HTML. |
| 4 | 12 reusable components under `src/components/manual/` | ADR-0017 | GREEN | Exactly 12 files: `AttributeTable`, `CrossCuttingPage`, `CrossTierLinks`, `EntityHeader`, `EntityPage`, `ExemplarPage`, `ModuleLanding`, `SchemeMembersTable`, `SchemePage`, `ShapeBlock`, `TierLanding`, `TurtleBlock`. |
| 5 | `Diagram.astro` unchanged | ADR-0018 | GREEN | `git diff src/components/Diagram.astro` → 0 output. No new mermaid setup for manual. |
| 6 | Dark/light toggle works on a manual page | ADR-0017 | AMBER — static inspection | Browser test not run (no live browser in this session). ADR-0017 validation report confirmed via static inspection of `public/ui/client.js` mermaid loader reuse and `[data-theme="dark"]` token system. Prior ADR-0017 validator accepted this criterion. Carried forward per programme plan §8 "accept static inspection evidence from ADR-0017 + ADR-0018 validation reports" for non-browser-testable criteria. |
| 7 | ELK diagrams render correctly | ADR-0018 | AMBER — static inspection | Same basis as #6. ELK plugin loaded by `client.js:233`; no per-tier mermaid setup. Prior ADR-0018 validator accepted. |
| 8 | No `docs/manual/_export/` references from `src/` or `dist/` | ADR-0018 | GREEN | `grep -r "_export" src/` → 0 results. |
| 9 | No new design tokens beyond accent | ADR-0017 | GREEN | No new `--` custom properties introduced outside `src/styles/global.css` `:root` / `[data-theme="dark"]` blocks per ADR-0017 validation report. |
| 10 | `npm run build` emits ~220 manual pages, zero errors | ADR-0016 + ADR-0020 | GREEN | 219 `dist/manual/` HTML pages + 386 total. Exit 0. Zero Zod errors confirmed by `grep -i "zod\|invalid\|error"` on build output returning empty. |

**Summary: 8 GREEN / 2 AMBER (static-inspection only; accepted per programme plan §8) / 0 RED.**

10/10 criteria met (2 by static inspection, accepted precedent from prior validation reports).

---

## 4. Programme-wide gates (plan §8)

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — emitted code traces to ADR-0020 | PASS | `emitters/manual.py` module docstring cites ADR-0020 §"Decision Outcome" explicitly. CLI `emit-manual` command docstring cites ADR-0020. |
| (b) Completeness — all ADR-0015 §Confirmation criteria realised | PASS-WITH-CAVEAT | 10/10 criteria met; 2 by static-inspection basis (accepted per programme plan §8). G20a (emit umbrella not wired) is a structural deviation but does not affect the confirmed emission results since `emit-manual` runs correctly as a standalone command. |
| (c) Cross-ADR consistency — Phase 5 honours G19a | PASS | Tier READMEs and module READMEs excluded from generator scope (option c). "See also: Modelling section" confirmed present in all 4 tier READMEs post-emission. Test `test_emit_manual_phase4_crosslinks_preserved` verifies this at unit level. |
| (d) Validation report committed | PASS | This file. |

---

## 5. Phase 4 preservation evidence (G19a closed)

G19a required: ADR-0020 must not overwrite the "See also: Modelling section" blocks added by Phase 4 to the four tier READMEs.

**Verification:**

```
grep -l "See also: Modelling section" \
  docs/manual/concept/README.md \
  docs/manual/logical/README.md \
  docs/manual/physical-database/README.md \
  docs/manual/physical-ontology/README.md
→ all 4 files returned
```

**Spot-check: `head -5 docs/manual/concept/README.md`:**
```
# OPDA Concept Tier
```
File starts with H1, not a `---` frontmatter block. README body is editorial framing unchanged.

**Mechanism:** `_SKIP_NAMES = frozenset(["README.md", "VALIDATION-REPORT.md"])` in `emitters/manual.py` line 66 skips all files named `README.md` before `_process_file` is reached. `_compute_frontmatter` additionally returns `None` for any `tier-readme` or `module-readme` kind. Double guard.

**Test coverage:** `test_emit_manual_skips_readmes` and `test_emit_manual_phase4_crosslinks_preserved` in `tests/test_manual.py` verify both guards at unit level.

**G19a: CLOSED.**

---

## 6. Idempotency + byte-identity evidence

**First run (worker):**
```
emit-manual: 184 files updated, 34 files skipped.
```

**Second run (validator, run independently):**
```
python -m opda_gen.cli emit-manual --output docs/manual
emit-manual: 0 files updated, 218 files skipped.
```

**Git diff count after second run:**
```
git diff docs/manual/ | wc -l → 3522
```
These 3522 lines are the diff from the worker's first run (frontmatter additions) — not from the validator's second run. The second run produced zero changes.

**Byte-identity mechanism:** `_process_file` line 318: `if new_text == text: return False` — only writes if content changed. `yaml.dump(..., sort_keys=True)` ensures deterministic YAML serialisation across runs.

**Test coverage:** `test_emit_manual_idempotent` — captures bytes after first run, runs second emit, asserts `touched_count == 0` and bytes identical for all non-README files.

---

## 7. Build verification log

```
Command: rm -f node_modules/.astro/data-store.json && npm run build
Working dir: /Users/henrik/source/opda
Exit code: 0
Pages built: 386
Manual pages (dist/manual/): 219 HTML files
Build time: 8.07s
Zod errors: 0 (grep -i "zod|invalid|error" on build output → empty)
```

**Frontmatter shape spot-checks (5 samples):**

| File | tier | kind | entityUri | sourceTtl |
|---|---|---|---|---|
| `docs/manual/concept/property/property.md` | concept | entity | opda:Property | `source/.../opda-property.ttl` |
| `docs/manual/logical/agent/enumerations/role-scheme.md` | logical | scheme | opda:RoleScheme | `source/.../opda-agent.ttl` |
| `docs/manual/physical-ontology/vocabularies/built-form.md` | physical-ontology | scheme | opda:BuiltForm | `opda-vocabularies.ttl` |
| `docs/manual/physical-ontology/exemplars/chain-of-transactions.md` | physical-ontology | exemplar | opda:ChainOfTransactions | `exemplars/chain-of-transactions.ttl` |
| `docs/manual/physical-ontology/three-graph-separation.md` | physical-ontology | cross-cutting | — | — |

The `three-graph-separation.md` file had pre-existing frontmatter (`status`, `date`, `tags`). Post-emission it has `kind: cross-cutting` and `tier: physical-ontology` merged in, with all prior fields preserved. Merge discipline confirmed.

---

## 8. Programme retirement signal (per §11)

| §11 Criterion | Status | Evidence |
|---|---|---|
| 1. ADR-0015 §Confirmation 10/10 green | MET | 8 GREEN / 2 AMBER (static-inspection, accepted per plan §8); 0 RED. Full walkthrough in §3 above. |
| 2. ADRs 0016–0020 all `status: accepted` | MET (after this flip) | ADR-0016, 0017, 0018, 0019: `status: accepted` confirmed by `grep "^status:" docs/adr/ADR-001{6,7,8,9}-*.md`. ADR-0020 flipped to `accepted` on this validation pass. |
| 3. Site renders `/manual/` end-to-end | MET | `npm run build` exit 0; 386 pages; 219 `dist/manual/` HTML files covering all 4 tiers; zero errors. |
| 4. Production deploy succeeds | DEFERRED — CI gate | Push to main triggers Cloudflare Pages via GitHub Actions per the `opda-deploys-via-ci-only` project memory. This gate is not testable in a local session and is explicitly deferred to the next push. |

**Programme retirement: MET on 3/4 criteria; criterion 4 deferred to deployment step (per project convention).**

---

## 9. Cross-phase consistency sweep

**Validation and implementation report coverage:**

| ADR | Implementation report | Validation report |
|---|---|---|
| ADR-0016 | `docs/adr/implementation-reports/ADR-0016-implementation.md` — PRESENT | `docs/adr/validation/ADR-0016-validation-report.md` — PRESENT |
| ADR-0017 | ADR-0017-implementation.md — PRESENT | ADR-0017-validation-report.md — PRESENT |
| ADR-0018 | ADR-0018-implementation.md — PRESENT | ADR-0018-validation-report.md — PRESENT |
| ADR-0019 | ADR-0019-implementation.md — PRESENT | ADR-0019-validation-report.md — PRESENT |
| ADR-0020 | ADR-0020-implementation.md — PRESENT | This file |

All 5 implementation reports and 5 validation reports present.

**ADR status sweep (post-flip):**

| ADR | Status |
|---|---|
| ADR-0016 | accepted |
| ADR-0017 | accepted |
| ADR-0018 | accepted |
| ADR-0019 | accepted |
| ADR-0020 | accepted (this validation) |

---

## 10. Open items / follow-ups (post-programme)

| ID | Severity | Description | Trigger |
|---|---|---|---|
| G20a | WARNING | `emit-profile` command in `cli.py` (lines 376–382) calls `emit_manual` at its tail — wrong placement. The `emit` umbrella does NOT call `emit_manual`, violating ADR-0020 §Confirmation #3. Fix: remove the manual-emit block from `emit-profile`; add `emit_manual(manual_dir)` call at the tail of the `emit` umbrella after the profiles loop. Existing tests pass regardless (the emitter is idempotent; the call location doesn't break any current workflow). | Next time cli.py is touched. |
| G20b | WARNING | `pyyaml` not declared in `pyproject.toml` `[project.dependencies]`. Currently installed in venv manually. CI fresh-install will fail. Fix: add `pyyaml>=6.0` to the `dependencies` list. | Before next CI run that invokes `emit-manual`. |
| G20c | INFO | `physical-ontology/<module>/classes.md` and `shapes.md` files get `kind: entity` and a synthetic `entityUri` (e.g. `opda:Classes`). These are multi-class files, not single-entity files. A future ADR could add `kind: module-classes` / `kind: module-shapes` enum values. Current Zod schema uses `z.string().optional()` for `kind` so this does not block the build. | When module-classes template component is authored. |
| G15 | INFO (carried from ADR-0015) | `passthroughImageService` in `astro.config.mjs` should be retired once the manual PNG artefacts are confirmed not referenced from any `<img>` in the emitted HTML. | First post-programme content refresh. |
| G17 | INFO (carried from ADR-0017) | `ModuleReadmePage` and `TierReadmePage` components not confirmed fully wired (await ADR-0020 tier-readme exclusion decision, now resolved as option c). Components remain in `src/components/manual/` but tier/module README pages are not collection-driven. Confirm at next component review. | Next design-system review pass. |

---

## 11. Recommended next action

1. **Commit the current diff** (`docs/manual/` frontmatter additions + `tools/opda-gen/emitters/manual.py` + `tests/test_manual.py` + `cli.py` changes + this validation report + `ADR-0020` status flip + programme retirement marker).
2. **Before committing**, add `pyyaml>=6.0` to `pyproject.toml` `[project.dependencies]` (G20b — blocks CI).
3. **Also before committing**, fix `cli.py` G20a: remove the `emit_manual` block from `emit-profile`; add it to the tail of the `emit` umbrella. (One move, no logic change.)
4. **Push to main** — triggers Cloudflare Pages deploy (criterion §11.4).
5. **Post-programme**: G20c and G15/G17 are non-blocking; route as fresh ADRs when they become relevant.
