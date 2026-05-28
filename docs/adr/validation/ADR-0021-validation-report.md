# ADR-0021 Validation Report — Generate manual entity pages via Fuseki + GRLC SPARQL API

**Validation agent:** independent-validator-adr-0021 (per programme plan §8; ODR-0001 §"Roles for every session")
**Validated:** 2026-05-28
**Implementing worker:** ADR-0021 worker
**Cited ADRs:** ADR-0021, ADR-0015, ADR-0016, ADR-0017, ADR-0011
**Programme plan:** `docs/plan/manual-astro-integration.md` §8 (programme-wide gates a/b/c/d)

---

## 1. Verdict

**PASS-WITH-FOLLOW-UPS**

All six §Confirmation criteria are substantively met. `npm run build:data` exits 0; 391 pages emit; 23 TTLs load into Fuseki (1767 triples in named graphs); the GRLC API serves 41 entities; entity pages carry structured sections (Attributes / Relationships / Constraints / Classification / Sources / cross-tier strip); `deploy.yml` is wired correctly; cross-tier links point only at existing pages. Three named follow-ups (diagnostic count bug, `identityBearing` defaulting, CI action versions) are non-blocking. One warning-grade issue (stale port in embedded CI snippet comment) is cosmetic.

ADR-0021 advances from `status: proposed` to `status: accepted`.

---

## 2. Confirmation criteria #1–#6

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Fuseki loads 23 TTLs; SPARQL smoke query answers | GREEN | `npm run build:data` log: `[fuseki-load] Done: 23 files loaded, 0 errors`. Direct SPARQL count: `SELECT (COUNT(*) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } }` → **1767 triples** across named graphs. Container `opda-fuseki` (`stain/jena-fuseki:latest`) on host port 3031. |
| 2 | GRLC API serves entity JSON at parity with ADR-0021 contract | GREEN | `curl http://localhost:3002/api/entities` → `{"items":[…]}`, **41 entities**. `curl http://localhost:3002/api/entities/logical/property/Property` → `{localName:"Property", summary:281 chars, attributes:17, relationships:1, constraints:2, crossTier:{concept:…, logical:…, physicalOntology:…, physicalDatabase:null}}`. All five contract fields present. `curl …/concept/claim/Claim` returns relationships + constraints. `curl …/concept/agent/Person` returns summary + Classification. |
| 3 | One static page per entity at URI-keyed routes; structured sections | GREEN | `391 page(s) built in 26.14s`. `find dist/manual -name index.html | wc -l` → **224** manual HTML files. Spot-checked: `dist/manual/concept/agent/person/index.html` — sections: Classification, Constraints, Sources, cross-tier strip. `dist/manual/logical/property/legal-estate/index.html` — sections: Classification, Attributes, Constraints, Sources. `dist/manual/concept/claim/claim/index.html` — sections: Classification, Relationships, Constraints, Sources. All rendered via `EntityApiPage.astro` (not raw markdown `<Content />`). `entity-section__heading` + `cross-tier-links__list` CSS classes present in all three pages. ShapeBlock `sh:Violation` text confirmed present without `sh:sh:` double-prefix. |
| 4 | Production ships only `dist/`; Fuseki + API are build-time-only | GREEN | `deploy.yml` structure: (1) pnpm install, (2) `npm --prefix src/api install`, (3) `npm run build:data` (Fuseki on localhost:3031, API on localhost:3002, runs inside ephemeral `ubuntu-latest` runner), (4) `wrangler pages deploy dist`. No Fuseki/API service exposed post-build. `paths:` filter covers `docker-compose.yml`, `scripts/**`, `source/03-standards/ontology/**`, `src/**` — TTL or query changes trigger rebuild. Cannot push-test live deploy (assessed structurally). |
| 5 | Cross-tier links resolve where page exists; absent otherwise | GREEN | `dist/manual/concept/property/legal-estate/index.html` cross-tier aside: Concept (current), Logical → `/manual/logical/property/legal-estate`, Physical — ontology → `/manual/physical-ontology/property/classes#LegalEstate`. Physical — deployment **absent** (not linked, not a 404 href). Both linked pages confirmed present in `dist/`. `dist/manual/concept/agent/person/index.html`: Concept (current), Logical, Physical — ontology. physicalDatabase absent throughout (no physical-DB deployment view modelled — named follow-up FU-01). |
| 6 | Sub-ADR validation-report discipline | N/A | ADR-0021 was not decomposed into sub-ADRs (programme discretion). This report is the single validation document. |

---

## 3. Programme-wide gates

| Gate | Status | Evidence |
|---|---|---|
| (a) Soundness — emitted files trace to ADR-0021 + cited ADRs | PASS | `docker-compose.yml`, `scripts/fuseki-load.mjs`, `scripts/build-with-data.mjs`, `src/api/`, `src/lib/entity-api.ts`, `src/lib/cross-tier.ts`, `src/components/manual/EntityApiPage.astro`, `deploy.yml` — all carry ADR-0021 doc-comment headers. `[...slug].astro` dispatchers extend ADR-0016 routes. No files outside ADR-0021 scope were mutated. |
| (b) Completeness — all §Confirmation criteria realised or deferred | PASS | Criteria #1–#5 GREEN above. #6 N/A (no sub-ADR decomposition). Three named follow-ups are documented, none block the criteria. |
| (c) Cross-ADR consistency | PASS | (1) ADR-0015: `git diff HEAD src/components/Diagram.astro` clean — invariant holds. (2) ADR-0016: non-entity pages (`dist/manual/concept/index.html` etc.) carry zero `entity-section` classes — markdown rendering path intact. (3) ADR-0017: `EntityApiPage.astro` wires `EntityHeader`, `AttributeTable`, `ShapeBlock` — G17 closed. (4) ADR-0018: no remark plugin modifications. (5) ADR-0020: frontmatter generation pipeline untouched. |
| (d) Validation report | PASS | This file. |

---

## 4. Invariants + cosmetic fixes + non-entity page integrity

- **`src/components/Diagram.astro` unchanged** — `git diff HEAD` empty. PASS.
- **`sh:sh:` double-prefix bug** — `grep -r "sh:sh:" dist/manual | wc -l` = **0**. PASS.
- **Severity badges** — `sh:Violation` appears in entity pages without double-prefix; `severity-badge--violation` CSS class present in ShapeBlock output. PASS.
- **Non-entity pages render from markdown** — `dist/manual/concept/index.html`, `dist/manual/physical-ontology/index.html` contain no `entity-section__heading` elements; `class="entity-` count = 0. PASS.
- **Validation-report page** — `dist/manual/validation-report/index.html` present; `<h1>4-tier documentation validation report</h1>` confirmed. PASS (Separate task 1 "Done").
- **IA pages** — `dist/manual/information-architecture/` directory exists with `index.html` + five sub-pages (`overview`, `concept-model`, `logical-model`, `physical-database`, `physical-ontology`). PASS (Separate task 1 "Done").
- **TOC on overview pages** — noted as "To do" in ADR §"Separate tasks". Not assessed here.

---

## 5. Separate tasks status

| Task | Status | Evidence |
|---|---|---|
| Report generator → validation-report + IA pages serve static HTML | DONE | Confirmed above; 7 pages in `dist/manual/{validation-report,information-architecture/**}` all render structured HTML. |
| TOC on overview/tier/module landing pages | TO DO | Not implemented; `renderToc()` hook not yet wired. Named follow-up FU-04. |

---

## 6. Open follow-ups

| ID | Severity | Description | Trigger |
|---|---|---|---|
| FU-01 | INFO | `physicalDatabase` cross-tier is always `null` — no physical-DB deployment view has been modelled in the ontology. The `cross-tier.ts` scheme is correct; the gap is in the RDF. | When a physical-DB deployment view is modelled for any entity, add its presence flag to `list-entities.rq` and a URL builder in `cross-tier.ts`. |
| FU-02 | WARNING | `attributes[].identityBearing` defaults to `false` in `EntityApiPage.astro` (line 35, `// INTEGRATION POINT (Phase 2)`). The ontology likely carries an identity-bearing annotation; this field should be sourced from a SPARQL query. Until wired, the Attributes table silently omits IC attribution. | Phase 2 integration: add `identityBearing` predicate to `get-entity.rq` attribute rows and propagate through `grlc-handler.js` → `entity-api.ts` contract. |
| FU-03 | INFO | `fuseki-load.mjs` `countTriples()` query (`SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }`) counts the **default graph** only, which is empty because all TTLs are loaded into named graphs. It reports `Total triples in dataset: 0` even when 1767 triples are present. This is a diagnostic-only bug (the actual data loading succeeds). | **FIXED this session** — query now uses `GRAPH ?g { ?s ?p ?o }`. |
| FU-04 | RESOLVED — FALSE POSITIVE | The claim that `@v6` does not exist is incorrect. Verified via the GitHub API: `actions/checkout@v6.0.2`, `actions/setup-node@v6.4.0`, `pnpm/action-setup@v6.0.8` all exist, and the deploy on commit `c54b7e9` ran **green** on exactly these versions earlier this session. `@v6` are the Node-24 majors; downgrading to `@v4` would re-introduce the Node-20 deprecation fixed earlier. | None — keep `@v6`. (Correction by the coordinator post-validation.) |
| FU-05 | INFO | `scripts/build-with-data.mjs` embedded CI comment fragment (lines 32–46) shows `OPDA_API: http://localhost:3000` — stale; the actual default is `localhost:3002`. Cosmetic (the real code path sets the variable correctly). | **FIXED this session** — comment rewritten to point at `deploy.yml` + correct ports. |
| FU-06 | INFO | Five entities (`Comparable`, `Organisation`, `Search`, `Survey`, `Valuation`) have two `rdfs:comment` triples each. The `get-entity.rq` UNION query returns the first binding per SPARQL solution order; subsequent values are silently dropped. No visible breakage, but the second comment text is lost. | Deduplicate in `grlc-handler.js` or use `GROUP_CONCAT` in the query. |
| FU-07 | INFO | CI push-test not performed (cannot push from local validation). `deploy.yml` structural analysis is positive and FU-04 is a false positive — the action versions are valid. The genuinely-unproven part is the **new `build:data` Fuseki-in-CI deploy** (only the old `astro build` deploy has run in CI). | The next push tests it; monitor that deploy run (build:data must bring up Fuseki + load + serve + build on the runner). |

---

## 7. Build:data verification log

**Command:** `npm run build:data` from `/Users/henrik/source/opda`

**Exit code:** 0

**Key log lines:**
```
build:data — Phase 2 full pipeline (ADR-0021)
1. docker compose up fuseki -d
   Container opda-fuseki Started
   [ready] Fuseki :3031
2. Load TTLs into Fuseki
   [fuseki-load] Done: 23 files loaded, 0 errors
   [fuseki-load] Total triples in dataset: 0   ← FU-03 (default graph; 1767 in named graphs)
3. Start GRLC API
   [grlc] GET /api/entities → list-entities (listing)
   [grlc] GET /api/entities/:tier/:module/:localName → get-entity (detail)
   [opda-api] Listening on port 3002
   [ready] GRLC API /api/entities
4. astro build (OPDA_API=http://localhost:3002)
   [build] 391 page(s) built in 26.14s
   [build] Complete!
build:data complete — dist/ is ready for deployment.
Stopping GRLC API
Container opda-fuseki Stopped + Removed
Network opda_default Removed
```

**Named-graph triple count (manual verification):**
```
SELECT (COUNT(*) AS ?n) WHERE { GRAPH ?g { ?s ?p ?o } } → 1767
```

**API smoke tests:**
```
curl http://localhost:3002/api/entities → 41 items
curl http://localhost:3002/api/entities/logical/property/Property
  → localName=Property, attributes=17, relationships=1, constraints=2
```

**dist/ counts:**
```
find dist -name "index.html" | wc -l  → 391 total pages
find dist/manual -name "index.html" | wc -l → 224 manual pages
```

**Exit-code propagation:** `build-with-data.mjs` uses `main().catch(err => { process.exitCode = 1 })`. The `run()` helper rejects on any non-zero child exit. If `astro build` fails, main() rejects, `.catch()` sets `process.exitCode = 1`, `.finally()` runs teardown, then Node exits with code 1. Propagation is **correct** — CI will fail on a broken build.

---

## 8. Recommended next action

**Correction (coordinator, post-validation):** FU-04 is a FALSE POSITIVE — the `@v6` action versions exist (verified via the GitHub API) and the deploy ran green on them at `c54b7e9`. Do NOT downgrade to `@v4` — that would reintroduce the Node-20 deprecation. FU-03 (diagnostic count query) and FU-05 (stale CI comment) were fixed this session.

Next action: **commit + push.** The push is the first real test of the new `build:data` Fuseki-in-CI deploy (FU-07) — monitor that run. FU-01 (physical-DB cross-tier), FU-02 (`identityBearing`), FU-06 (multi-value annotations), and the TOC task are non-blocking Phase-2 follow-ups.

ADR-0021 is `status: accepted` — sound and complete; no blockers.
