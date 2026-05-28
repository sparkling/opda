# Implementation programme — manual Astro integration

> **Anchor:** [ADR-0015 — Integrate 4-tier ontology manual into the Astro site](../adr/ADR-0015-integrate-manual-into-astro-site.md). The architectural decision (content-collection-driven; reuse existing design system + Mermaid + dark-mode; extend `site.ts`). This plan operationalises that decision as a sequence of 5 sub-ADRs.
>
> **Sister precedent:** [Ontology implementation programme](./ontology-implementation.md) — same Queen/worker/validator pattern; same ADR-per-phase discipline; same retirement criterion shape. The implementing session should treat this plan as the analogue.

## 1. Scope and method

**What this plan does.** Sequences the implementation work that realises ADR-0015 as a working `/manual/` section on the Astro site. Each phase lands as one ADR with its own implementation report + independent validation report (mirroring the ontology programme's §9 discipline).

**What this plan does NOT do.** Re-deliberate ADR-0015's chosen approach. If a genuinely new architectural decision surfaces during implementation (e.g. content collections turn out unworkable for a tier), it lands as a new ADR amendment cycle — not a silent deviation.

| This plan (engineering) | ADR-0015 (architecture) |
|---|---|
| Sequences `## Confirmation` work into 5 sub-ADRs | Decides the integration approach (option B) |
| Output: code + commits + green build + working `/manual/` route | Output: `status: accepted` ADR with 10-criterion gate |

**State at top of programme (2026-05-28).**

- ADR-0015 is `status: proposed` at commit `0fa32a1`
- Content surface exists: 228 markdowns at `docs/manual/` (commits `6328d03`/`0c3619d`/`fbf8d85`/`4c16c58`/`b93deb2`)
- Diagrams exist: 239 PNGs + the live `<details>` mermaid sources (commits `99d24eb`/`6cc5aaa`/`f26b3f5`/`862820d`/`1f31f33` for diagram expansion + `4e58bb8` for scale=12 re-render)
- IA blueprint exists: 5 docs at `docs/information-architecture/` (commits `113b43f`/`04c432d`)
- Local HTML export validated: `docs/manual/_export/html/` (218 HTML / 132 MB; gitignored)
- Cross-tier consolidation done: 4 tier READMEs (no index.md per tier), umbrella + sub-tier links coherent (commits `01303db`/`589ff83`/`4e58bb8`)
- Ontology programme retired at commit `d4197f2` per ODR-0003 §"Programme retirement criterion"
- Open Council-routed item carried forward: G14 (Cat 4 `opda:hasSpecialCategoryData` predicate canonical naming — S012 Q3 ratification needed). Not blocking for this plan; will surface as a doc-side note.

## 2. Inputs

| Input | Path | Authoritative role |
|---|---|---|
| Architectural decision | [`docs/adr/ADR-0015-integrate-manual-into-astro-site.md`](../adr/ADR-0015-integrate-manual-into-astro-site.md) | What to build (decided) |
| Manual content | [`docs/manual/`](../manual/) — 228 markdowns | What to render (regenerated from TTLs) |
| IA blueprint | [`docs/information-architecture/`](../information-architecture/) — 5 docs | How content is structured per tier (already authored) |
| Astro site source | `src/` — `Layout.astro`, 9 components, `src/lib/site.ts`, `src/styles/global.css` | What to extend (existing patterns reused as-is) |
| Mermaid loader | `public/ui/client.js:228-269` | What to reuse for diagram rendering (no duplication) |
| Dark/light token system | `src/styles/global.css` + `public/ui/design-system.css` | What to extend with manual-specific accent tokens |
| Source-of-truth TTLs | `source/03-standards/ontology/` (24 files) | Upstream of the manual; the implementing session does NOT read these — content already derived |
| Local-export tooling (reference only) | `~/.claude/tools/markdown-export/convert.js` + `~/.claude/tools/mermaid-renderer/` | Used for offline HTML; the Astro build path does NOT reuse this |

## 3. Outputs

| Output | Path | Owned by |
|---|---|---|
| `manual` section in `site.ts` | `src/lib/site.ts` | ADR-0016 |
| Astro content collection config | `src/content.config.ts` (or `src/content/config.ts` per Astro 5 convention) | ADR-0016 |
| Per-tier dynamic routes | `src/pages/manual/{concept,logical,physical-database,physical-ontology}/[...slug].astro` | ADR-0016 |
| 12 reusable Astro components | `src/components/manual/*.astro` | ADR-0017 |
| Build-time remark/rehype plugins | `src/lib/remark/{unwrap-mermaid-details,frontmatter-uri-extraction}.ts` | ADR-0018 |
| Modelling-section handshake | Edits to `src/pages/modelling/` + `src/lib/site.ts` (decide replace / cross-link / deprecate) | ADR-0019 |
| Generator emission of content-collection frontmatter | `tools/opda-gen/src/opda_gen/emitters/manual.py` (new) + worker re-runs | ADR-0020 |
| 5 static pages | `src/pages/manual/{index,information-architecture,validation-report}.astro` + 2 tier overviews if not collection-driven | ADR-0016 |
| Manual-specific design tokens | Extension of `src/styles/global.css` `:root` + `[data-theme="dark"]` (UFO meta-category + severity-tier accent colours) | ADR-0017 |
| Build verification | `npm run build` green; ~220 manual pages emit alongside existing 158 | ADR-0016 confirmation |
| Visual smoke test | Dark-mode toggle re-renders mermaid on a manual page; ELK diagrams render correctly | ADR-0017 confirmation |

## 4. ADR sequence

Five engineering ADRs, sequenced by dependency. Each ADR realises one or more parts of ADR-0015's `## Confirmation` (10 numbered criteria).

| Phase | ADR | Title | Realises (ADR-0015 §Confirmation criteria) | Dependency |
|---|---|---|---|---|
| Phase 1 — Bootstrap | [ADR-0016](../adr/ADR-0016-manual-content-collection-wiring.md) | Manual content-collection wiring + site nav | §1 (`site.ts` extended), §2 (collection wired), §3 (dynamic routes emit), §10 (build succeeds) | ADR-0015 |
| Phase 2 — Components | [ADR-0017](../adr/ADR-0017-manual-component-library.md) | Manual component library (12 components + accent tokens) | §4 (12 components live), §6 (dark/light works), §9 (no new design tokens beyond accent) | ADR-0016 |
| Phase 3 — Build-time plumbing | [ADR-0018](../adr/ADR-0018-manual-remark-rehype-plugins.md) | Remark + rehype plugins (unwrap mermaid, extract entity URIs) | §5 (`Diagram.astro` unchanged), §7 (ELK renders), §8 (no `_export/` references from `src/`) | ADR-0016 |
| Phase 4 — Handshake | [ADR-0019](../adr/ADR-0019-modelling-manual-handshake.md) | Modelling-section handshake (replace / cross-link / deprecate `/modelling/*` pages) | N/A — orthogonal but required for navigation coherence | ADR-0016 |
| Phase 5 — Regeneration | [ADR-0020](../adr/ADR-0020-manual-generator-frontmatter.md) | Generator emission of content-collection frontmatter (the IA's "docs-gen mode" extension) | Implicit — ADR-0015 §"Bad" item: frontmatter additions ownership | ADR-0017, ADR-0018 |

Total: 5 engineering ADRs. With ADR-0015 as the architectural decision, the integration programme is **6 ADRs end-to-end** from architectural decision to live site.

### Dependency graph

```
   Phase 1 (Bootstrap; sequential):
     ADR-0015 ──→ ADR-0016 (site.ts + content config + dynamic routes)
                       │
                       ▼
   Phase 2 (Components; parallel-safe with Phase 3):
     ADR-0016 ──→ ADR-0017 (component library + accent tokens)
                       │
                       ▼
   Phase 3 (Plumbing; parallel-safe with Phase 2):
     ADR-0016 ──→ ADR-0018 (remark/rehype plugins)
                       │
                       ▼
   Phase 4 (Handshake; gated on Phase 1+2):
     ADR-0016 + ADR-0017 ──→ ADR-0019 (modelling handshake)
                       │
                       ▼
   Phase 5 (Regeneration; gated on Phase 2+3):
     ADR-0017 + ADR-0018 ──→ ADR-0020 (generator frontmatter emission)
                       │
                       ▼
                  ADR-0015 §Confirmation 10/10 green → programme retires
```

## 5. Phasing and timeboxing

| Phase | ADRs | Engineering days | Output |
|---|---|---|---|
| Phase 1 — Bootstrap | ADR-0016 | 2-3 days | Site builds with empty `/manual/` routes; navigation visible; content collection registers 228 entries |
| Phase 2 — Components | ADR-0017 | 3-5 days | 12 components render entries with correct visual + dark/light coherence |
| Phase 3 — Plumbing | ADR-0018 | 1-2 days | Mermaid `<details>` blocks unwrap to live diagrams; entity URIs extracted into frontmatter |
| Phase 4 — Handshake | ADR-0019 | 1-2 days | `/modelling/concept-taxonomy.astro` etc. either deprecated, cross-linked, or replaced; sidebar coherent |
| Phase 5 — Regeneration | ADR-0020 | 1-2 days | `opda-gen` extension emits manual frontmatter; regeneration produces collection-ready markdown without manual edits |
| **Total** | **5 ADRs** | **8-14 days** | **Live `/manual/` section at openpropdata.org.uk with full 4-tier coverage** |

## 6. CI integration

The Astro build path (`npm run build`) is the integration's primary CI gate. Specific checks added per phase:

1. **ADR-0016 §Confirmation**: `astro build` succeeds with `manual` collection populated; emits ≥220 static HTML files under `dist/manual/`; navigation renders.
2. **ADR-0017 §Confirmation**: visual smoke test via Playwright (or manual checklist if Playwright wiring deferred) on 4 sample pages (one per tier).
3. **ADR-0018 §Confirmation**: build-time assertion that no `<details><summary>Mermaid Source</summary>` blocks survive in emitted HTML — every one should be transformed into `<div class="mermaid">`.
4. **ADR-0019 §Confirmation**: link-check across `/modelling/*` ↔ `/manual/*` cross-links resolve (no 404s).
5. **ADR-0020 §Confirmation**: round-trip — regenerate the manual via `opda-gen emit-manual`; the resulting markdown is collection-valid (Zod schema passes); `astro build` still succeeds without manual edits.

## 7. Execution model — swarm orchestration

Mirrors the ontology programme's pattern (per [`docs/plan/ontology-implementation.md` §8](./ontology-implementation.md)):

- **Queen agent** — reads this plan + dependency graph; spawns workers per phase; gates next-phase spawn on prior-phase validator PASS.
- **Worker agents** — one per ADR (or per parallel sub-task within an ADR). Each receives the ADR text + cited prior ADRs + existing site context. Outputs: emitted code + structured implementation report at `docs/adr/implementation-reports/ADR-NNNN-implementation.md`.
- **Validation agents** — one per completed ADR. Independent of the implementing worker; verifies confirmation criteria + soundness + completeness + cross-ADR consistency. Output: `docs/adr/validation/ADR-NNNN-validation-report.md`.

### Concurrency model per phase

```
Phase 1 (Bootstrap; sequential):
  Queen → ADR-0016 worker → ADR-0016 validation agent
            ↓ (gate on PASS)
          Phase 2 + Phase 3 unblock (parallel)

Phase 2 + Phase 3 (parallel):
  Queen spawns concurrently in ONE message:
    ├── ADR-0017 worker ──→ ADR-0017 validation agent
    └── ADR-0018 worker ──→ ADR-0018 validation agent
  Both must PASS before Phase 4

Phase 4 (Handshake; single worker):
  Queen → ADR-0019 worker → ADR-0019 validation agent
            ↓ (gate on PASS)
          Phase 5 unblocks

Phase 5 (Regeneration; single worker):
  Queen → ADR-0020 worker → ADR-0020 validation agent
            ↓ (gate on PASS)
          Programme retires (ADR-0015 §Confirmation 10/10 met)
```

### When to use swarm vs direct execution

Same rule as the ontology programme: **Use swarm** for Phase 2+3 parallel fan-out; **direct execution** for Phase 1 / Phase 4 / Phase 5 (single-worker sequential).

## 8. Validation discipline

Every sub-ADR's `### Confirmation` is augmented with the three programme-wide gates from the ontology programme (per [`docs/plan/ontology-implementation.md` §9](./ontology-implementation.md)):

1. **Soundness** — every emitted code file traces to the ADR + cited prior ADRs via doc-comment header.
2. **Completeness** — every cited ADR-0015 `§Confirmation` criterion realised by an emitted artefact OR explicitly deferred with named follow-up trigger.
3. **Cross-ADR consistency** — emissions don't violate downstream-ADR contracts.

An ADR moves `proposed → accepted` ONLY when all four hold:

1. Its own `### Confirmation` criteria green
2. Soundness check PASS
3. Completeness check PASS
4. Cross-ADR consistency PASS

Validation report committed at `docs/adr/validation/ADR-NNNN-validation-report.md` per the ontology programme's §9 template.

## 9. Out of scope

- **Authoring 227 manual content entries** — already done; they live in `docs/manual/`.
- **PDF export from the site** — local `_export/` workflow handles offline PDF; site is HTML-only.
- **Per-overlay route templates for TA6 / NTS / LPE1 etc.** — defer until those overlay profiles emit (Phase-2/3 of ADR-0013).
- **JSON-LD HTTP content negotiation for `w3id.org/opda/<EntityLocalName>` URI dereference** — separate deployment-layer work; the manual page is the redirect target, but redirect setup is ADR-0006.
- **Migrating existing `src/pages/modelling/` content into content collections** — ADR-0019 decides the handshake but doesn't refactor modelling-section content into collections.
- **The G14 Council-routed item** (opda:hasSpecialCategoryData canonical naming via S012 Q3) — orthogonal to this plan; surfaces as a doc-side note if it lands during the integration.

## 10. Risk and mitigation

| Risk | Mitigation |
|---|---|
| Astro content collections semantics differ subtly across Astro 4 vs 5 | ADR-0016 pins the project's Astro version + uses the version's docs as the spec source |
| `<details>` unwrap remark plugin breaks on edge-case markdown (nested code fences, etc.) | ADR-0018 tests against all 178 diagram-bearing manual markdowns at build time; failure = build-time error, not silent loss |
| Modelling handshake gets contentious (which pages survive?) | ADR-0019 owns this decision standalone; if contention surfaces, route to a Council mini-session per ODR-0001 §"Self-amendment process" (engineering does not re-deliberate) |
| Generator extension scope creeps beyond frontmatter emission | ADR-0020 caps scope at "emit collection-valid frontmatter only; no content changes"; substantive content changes route through the IA spec amendment cycle |
| Dark-mode mermaid re-render races with theme toggle | Existing `client.js:268` debounced re-run already handles; manual tests in ADR-0017 confirmation |
| 220-page build pushes Astro build time over CI budget | Astro static-site builds scale well; if budget exceeded, gate via `astro build --check-only` for the manual collection in CI and full-build only on main-branch merge |

## 11. Programme retirement

This programme retires when ALL hold:

1. **ADR-0015 §Confirmation 10/10 green** — measured + signed off by the implementing session's final validation.
2. **Every sub-ADR (ADR-0016 through ADR-0020) is `status: accepted`** with green validation report at `docs/adr/validation/ADR-NNNN-validation-report.md`.
3. **Site renders `/manual/` end-to-end** — `npm run build` succeeds; `npx serve dist` + browser smoke test passes on 4 sample pages (one per tier).
4. **Production deploy succeeds** — push to main triggers Cloudflare Pages via the existing GitHub Actions workflow (per the `opda-deploys-via-ci-only` memory note); production URL serves the manual.

Once retired, subsequent manual content updates land via regenerator workflow (re-emit from TTL → re-commit `docs/manual/` → next site build picks up); subsequent component / template changes land as fresh ADRs without revisiting this programme's sequencing.

## 12. Handover for the implementing session

The implementing session reads THIS file first. From here:

1. **Read ADR-0015** for the architectural decision (the chosen approach + the 10 confirmation criteria).
2. **Read the 5 sub-ADR shells** (`ADR-0016` through `ADR-0020`) — each is currently `status: proposed` with `Context and Problem Statement` + `Decision Drivers` filled and `Decision Outcome` left as `TBD by implementing session per programme plan §7`.
3. **Skim `docs/manual/README.md`** to see the content surface that drives the integration.
4. **Skim `docs/information-architecture/README.md`** for the source-of-truth discipline (TTLs only; not ODRs; not PDTF JSON).
5. **Inspect a representative manual file** for current frontmatter shape: `head -20 docs/manual/concept/property/property.md` (workers emitted YAML; the implementing session decides what fields to add for the content collection).
6. **Inspect the existing site pattern** to crib from: `src/lib/site.ts` + `src/components/Diagram.astro` + `src/pages/modelling/ontology.astro` (modelling section is the nearest neighbour to /manual/).
7. **Run `git log --oneline 440718b..main`** to see the full session lineage (the ontology programme + the manual-content build + the diagram expansion + the consolidation + this plan).
8. **Spawn the Phase 1 worker** per §7 once the above is read.

### Inherited open items (not blocking)

- **G14** — `opda:hasSpecialCategoryData` canonical predicate name pending S012 Q3 Council ratification (per ADR-0005 §G; also referenced in ADR-0014 amendment). Surfaces as a doc-side note in the manual; does NOT block the Astro integration.
- **G10 follow-up** — ADR-0010 TransactionStatus URI fabrication was closed at ADR-0013 worker, but the underlying naming is still "Listed/Offered/Accepted/Exchanged/Completed" which the manual content shows. No action needed; cross-referenced for completeness.

### Pre-existing session state to preserve

- The `.claude/` directory is tracked; settings + scheduled-task config persist across sessions.
- Cron job `b712ef63` (15-min heartbeat used during the ontology programme) was deleted; do not recreate unless the implementing session needs a similar long-run loop.
- The 4 tier-worker outputs are committed; the local PNG export at `docs/manual/_export/` is gitignored — rebuild on demand via `node ~/.claude/tools/markdown-export/convert.js "docs/manual/**/*.md" --format=html --out=docs/manual/_export`.

## References

- **Anchor ADR:** [ADR-0015 — Integrate 4-tier ontology manual into the Astro site](../adr/ADR-0015-integrate-manual-into-astro-site.md). This plan operationalises its §Confirmation.
- **Sister plan:** [`docs/plan/ontology-implementation.md`](./ontology-implementation.md) — the precedent for this plan's swarm + validation discipline.
- **Predecessor ADRs:** [ADR-0002](../adr/ADR-0002-folder-hierarchy-and-slug-taxonomy.md) (URLs); [ADR-0003](../adr/ADR-0003-idiomatic-astro-refactor.md) (site arch); [ADR-0007](../adr/ADR-0007-ontology-generator-specification.md) (generator); [ADR-0011](../adr/ADR-0011-module-tbox-emission.md) (entity content source).
- **IA blueprint:** [`docs/information-architecture/`](../information-architecture/) — 5 docs governing tier layout.
- **Content surface:** [`docs/manual/`](../manual/) — 228 markdowns + 239 PNGs.
- **Validation report (ontology programme):** [`docs/adr/validation/ADR-0014-validation-report.md`](../adr/validation/ADR-0014-validation-report.md) — sets the pattern this plan's validation reports follow.
