---
adr: ADR-0019
phase: 4
verdict: PASS-WITH-FOLLOW-UPS
date: 2026-05-28
---

# ADR-0019 Validation Report — Modelling-section / manual handshake

**Validation agent:** independent-validator-adr-0019 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0019 worker (Phase 4 — Handshake)
**Cited ADRs:** ADR-0019, ADR-0015, ADR-0007, ADR-0020; programme plan §8 gates (a/b/c/d)
**Programme plan:** `docs/plan/manual-astro-integration.md` §8

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All material Phase 4 criteria are met. The 0 Replace / 8 Cross-link / 1 Keep decision is correctly applied and independently confirmed in the build output. The `callout callout--note` pattern matches the existing convention in pre-existing `ontology.astro`. All four tier READMEs carry bidirectional "See also: Modelling section" blocks. Build exits 0 at 386 pages with no broken modelling or manual links. `standards-stack.astro` is untouched. `src/lib/site.ts` modelling sidebar is unchanged (no entries removed). Scope discipline is clean.

One follow-up is elevated to **material**: the four modified tier READMEs (`docs/manual/concept/README.md`, `logical/README.md`, `physical-database/README.md`, `physical-ontology/README.md`) are Astro content-collection entries with `kind: tier-readme` — path-derived in ADR-0016's `src/lib/manual.ts`. ADR-0020 will re-emit these files from TTLs. The "See also: Modelling section" sections added by Phase 4 are interleaved mid-document (not appended), so a naive re-emit will silently destroy them. ADR-0020 must explicitly account for this. The follow-up is named (G19a) and does not block Phase 4 acceptance — Phase 5 gates on it.

ADR-0019 advances from `status: implemented` to `status: accepted`. Phase 5 (ADR-0020) is unblocked.

---

## 2. Per-page decision verification

Worker claimed: 0 Replace / 8 Cross-link / 1 Keep.

| Modelling page | Claimed decision | Evidence | Verdict |
|---|---|---|---|
| `/modelling/standards-stack` | Keep standalone | `git diff src/pages/modelling/standards-stack.astro` → 0 lines. `dist/modelling/standards-stack/index.html`: `grep -c 'callout--note'` → 0. | CONFIRMED |
| `/modelling/bounded-contexts` | Cross-link → `/manual/concept` | `callout--note` at line 20 + 41 in source. `dist/modelling/bounded-contexts/index.html` exists. | CONFIRMED |
| `/modelling/overlays` | Cross-link → `/manual/physical-database/overlay-deployment/baspi5` | `callout--note` at line 20 in source. `dist/modelling/overlays/index.html` exists. | CONFIRMED |
| `/modelling/data-dictionary` | Cross-link → `/manual/logical` | `callout--note` at line 19 in source. `grep -c 'href="/manual/logical"' dist/modelling/data-dictionary/index.html` → 1. `OPDA.DataBrowser.mount` confirmed present (line 301). | CONFIRMED |
| `/modelling/business-glossary` | Cross-link → `/manual/concept` | `callout--note` at line 19 in source. `OPDA.DataBrowser.mount` confirmed present (line 165), loading `/data/entities.js`. | CONFIRMED |
| `/modelling/concept-taxonomy` | Cross-link → `/manual/physical-ontology/vocabularies` | `callout--note` at lines 15 + 25 in source. | CONFIRMED |
| `/modelling/ontology` | Cross-link → `/manual/physical-ontology` | `callout--note` at line 14 in source (new) + existing Status callout at line 24. `grep -c 'href="/manual/physical-ontology"' dist/modelling/ontology/index.html` → 1. | CONFIRMED |
| `/modelling/shacl-shapes` | Cross-link → `/manual/physical-ontology/severity-tiers` + `.../shacl-af-rules` | `callout--note` at lines 15 + 26 in source. | CONFIRMED |
| `/modelling/jsonld-mappings` | Cross-link → `/manual/physical-database/content-negotiation` | `callout--note` at lines 14 + 26 in source. | CONFIRMED |

**DataBrowser claim verified independently.** `data-dictionary.astro` invokes `OPDA.DataBrowser.mount({...})` (line 301) loading `/data/properties.js` (1,538 schema-derived elements). `business-glossary.astro` invokes `OPDA.DataBrowser.mount({...})` (line 165) loading `/data/entities.js`. Both are interactive JS components. The manual tier READMEs are static markdown; there is no equivalent. Worker's judgment (Cross-link over Replace) is sound.

**Callout convention verified.** Pre-Phase-4 `ontology.astro` line 14: `<div class="callout callout--note">`. All 8 cross-linked pages use the identical `callout callout--note` class. No new CSS class invented.

**grep -l evidence.** `grep -l "callout--note" src/pages/modelling/*.astro` returns exactly 8 files (bounded-contexts, business-glossary, concept-taxonomy, data-dictionary, jsonld-mappings, ontology, overlays, shacl-shapes). `standards-stack.astro` absent from that list.

---

## 3. Bidirectional cross-link sweep

**Modelling → manual (callouts):** 8 callouts emitted across 8 files. All confirmed via `grep -l "callout--note"` and per-page spot-checks above.

**Manual → modelling (tier READMEs):** 4 READMEs each carry a `## See also: Modelling section` heading.

| README | Line | Links to modelling pages | Status |
|---|---|---|---|
| `docs/manual/concept/README.md` | 13 | `/modelling/bounded-contexts`, `/modelling/business-glossary` | CONFIRMED |
| `docs/manual/logical/README.md` | 17 | `/modelling/data-dictionary` | CONFIRMED |
| `docs/manual/physical-database/README.md` | 19 | `/modelling/overlays`, `/modelling/jsonld-mappings` | CONFIRMED |
| `docs/manual/physical-ontology/README.md` | 52 | `/modelling/ontology`, `/modelling/shacl-shapes`, `/modelling/concept-taxonomy` | CONFIRMED |

Total manual → modelling links across 4 files: 7 named links (concept: 2, logical: 1, physical-database: 2, physical-ontology: 3). Worker claimed "4 of 4 tier READMEs" — confirmed. Worker also claimed "2 mentions per file = 8 total" (likely counting heading + prose paragraph as 2); the actual unique modelling-page link count is 7, which is consistent with the prose confirmed in dist.

Bidirectional resolution spot-checked in dist:
- `dist/modelling/ontology/index.html` → `href="/manual/physical-ontology"` → `dist/manual/physical-ontology/index.html` exists.
- `dist/modelling/data-dictionary/index.html` → `href="/manual/logical"` → `dist/manual/logical/index.html` exists.
- `dist/manual/concept/index.html` → `href="/modelling/bounded-contexts"` + `href="/modelling/business-glossary"` → both dist pages exist.
- `dist/manual/physical-ontology/index.html` → all three `/modelling/*` hrefs on one paragraph line, confirmed present.

---

## 4. Programme-wide gates (plan §8)

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — every emitted code file traces to ADR-0019 | PASS | ADR-0019 §Decision Outcome is the explicit spec for every callout and tier-README edit. Programme plan §8 notes this gate is "accept inline modifications without per-file headers since they extend existing files" — which is the case here. No new source files were created; all edits extend existing `.astro` and `.md` files. |
| (b) Completeness — 9-row decision table applied | PASS | All 9 modelling pages have a decision applied per §2 above. Appendix A in programme plan is fully populated (9 rows). |
| (c) Cross-ADR consistency — Phase 4 does not foreclose Phase 5 | PASS-WITH-CAVEAT | Callouts in `src/pages/modelling/*.astro` are not generator-managed and will not be overwritten by ADR-0020. However, Phase 4's additions to `docs/manual/*/README.md` are in files the ADR-0020 generator will re-emit (kind: `tier-readme`; see §6). This is the G19a follow-up. It does not foreclose Phase 5 — it names a contract ADR-0020 must honour. |
| (d) Validation report committed | PASS | This file. |

---

## 5. Scope discipline check

| File / path | Change | Verdict |
|---|---|---|
| `src/pages/modelling/bounded-contexts.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/overlays.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/data-dictionary.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/business-glossary.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/concept-taxonomy.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/ontology.astro` | Callout block added (one new callout; existing Status callout unchanged) | IN SCOPE |
| `src/pages/modelling/shacl-shapes.astro` | Callout block added | IN SCOPE |
| `src/pages/modelling/jsonld-mappings.astro` | Callout block added | IN SCOPE |
| `docs/manual/concept/README.md` | `## See also: Modelling section` section added | IN SCOPE |
| `docs/manual/logical/README.md` | `## See also: Modelling section` section added | IN SCOPE |
| `docs/manual/physical-database/README.md` | `## See also: Modelling section` section added | IN SCOPE |
| `docs/manual/physical-ontology/README.md` | `## See also: Modelling section` section added | IN SCOPE |
| `src/pages/modelling/standards-stack.astro` | NOT MODIFIED | CORRECT — Keep decision honoured |
| `src/lib/site.ts` | `manual` section added to HEADER_ORDER + SECTIONS (Phase 1/2 work carried forward); modelling entries NOT removed | CORRECT — no Replace decisions; 0 sidebar entries removed |
| `astro.config.mjs` | NOT MODIFIED | CORRECT — no Replace decisions; no redirect block needed |
| `docs/manual/**/*.md` (entity files, module files) | NOT MODIFIED — `git diff --name-only \| grep "docs/manual/" \| grep -v "README.md" \| wc -l` → 0 | CORRECT |

**Protected territory — no Phase 4 violations:**
- `src/content.config.ts` — clean (Phase 1)
- `src/components/manual/*.astro` — clean (Phase 2)
- `src/pages/manual/*.astro` — clean (Phase 1)
- `tools/opda-gen/` — clean (Phase 5)
- `src/lib/remark/*.ts` — clean (Phase 3)

---

## 6. Open items / follow-ups

| ID | Severity | Description | Closed by |
|---|---|---|---|
| G19a | WARNING — Phase 5 contract | The four modified tier READMEs (`docs/manual/*/README.md`) are content-collection entries with `kind: tier-readme` (path-derived via `src/lib/manual.ts:66`). ADR-0020 §Decision Outcome defines the generator as emitting these files from TTLs (`opda-gen emit-manual`). The "See also: Modelling section" sections added by Phase 4 are interleaved mid-document (concept/README.md line 13, logical/README.md line 17, physical-database/README.md line 19, physical-ontology/README.md line 52) — a naive re-emit will overwrite them. ADR-0020 must choose one of: (a) emit the "See also" block as a template variable in the generator's tier-README template; (b) designate a protected zone (e.g. a `<!-- begin-manual-edits -->` marker convention) the generator skips; (c) explicitly exclude tier READMEs from re-emission scope and treat them as manually-maintained files. Option (c) aligns with the observation that tier READMEs contain editorial framing (`## What is not in this tier`, `## Provenance`, etc.) that no TTL drives. This is not blocking Phase 4 acceptance but is a hard gate for Phase 5 validation. | ADR-0020 worker (must resolve before Phase 5 PASS) |
| G19b | INFO | `grep -l "callout--note"` check yields exactly 8 files — no accidental callout on `standards-stack.astro`. This check should be added to CI link-check per programme plan §6 criterion 4 (ADR-0019 confirmation: no broken cross-links). | CI tooling (non-blocking) |

---

## 7. Build + link-check verification log

**Build:**

```
Command:  npm run build  (from /Users/henrik/source/opda)
Exit code: 0
Key output:
  [build] ✓ Completed in 6.83s.
  [build] 386 page(s) built in 7.12s
  [build] Complete!
```

**Standards-stack unchanged:**

```
git diff src/pages/modelling/standards-stack.astro → 0 output
dist/modelling/standards-stack/index.html: grep -c 'callout--note' → 0
```

**Callout grep:**

```
grep -l "callout--note" src/pages/modelling/*.astro
→ 8 files (bounded-contexts, business-glossary, concept-taxonomy,
   data-dictionary, jsonld-mappings, ontology, overlays, shacl-shapes)
standards-stack.astro absent — PASS
```

**Tier README "See also" sweep:**

```
grep "Modelling section" docs/manual/*/README.md → 4 files, 1 heading + 1 prose match each
```

**Scope check (entity files untouched):**

```
git diff --name-only | grep "docs/manual/" | grep -v "README.md" | wc -l → 0
```

**Link-check spot-checks (dist):**

| Check | Result |
|---|---|
| `dist/modelling/ontology/index.html` → `href="/manual/physical-ontology"` | PRESENT |
| `dist/manual/physical-ontology/index.html` exists | EXISTS |
| `dist/modelling/data-dictionary/index.html` → `href="/manual/logical"` | PRESENT (count: 1) |
| `dist/manual/logical/index.html` exists | EXISTS |
| `dist/manual/concept/index.html` → `href="/modelling/bounded-contexts"` | PRESENT (count: 1) |
| `dist/manual/concept/index.html` → `href="/modelling/business-glossary"` | PRESENT (count: 1) |
| `dist/modelling/bounded-contexts/index.html` exists | EXISTS |
| `dist/modelling/business-glossary/index.html` exists | EXISTS |
| `dist/manual/physical-ontology/index.html` → all 3 modelling hrefs on one paragraph line | CONFIRMED |
| `dist/modelling/standards-stack/index.html` — `callout--note` count | 0 — PASS |

**DataBrowser claim:**

```
grep -n "OPDA.DataBrowser" src/pages/modelling/data-dictionary.astro → line 301
grep -n "OPDA.DataBrowser" src/pages/modelling/business-glossary.astro → line 165
grep -n "properties.js\|entities.js" src/pages/modelling/data-dictionary.astro → lines 153, 157, 269
grep -n "entities.js" src/pages/modelling/business-glossary.astro → lines 123, 131
```

Interactive data browsers confirmed present; static markdown manual pages have no equivalent. Cross-link over Replace is validated.

---

## 8. Recommended next action

ADR-0019 moves `status: implemented → accepted` on this commit.

**Phase 5 (ADR-0020) unblocked**, subject to G19a contract being resolved in the ADR-0020 Decision Outcome. The Phase 5 worker must address how tier-README re-emission interacts with the "See also: Modelling section" sections before Phase 5 validation can PASS.

**ADR-0020 worker must note:**

1. G19a (above) — choose and document a tier-README preservation strategy before emitting.
2. G18a (from ADR-0018) — `entityUri` idempotency guard means generator-emitted frontmatter takes precedence automatically.
3. G18c (from ADR-0018) — `jiti` hardcoded path in tests; worth fixing when test suite is next touched.
4. G18b (from ADR-0018) — cache-clear caveat for `node_modules/.astro/data-store.json`; add as CI pre-build step.
