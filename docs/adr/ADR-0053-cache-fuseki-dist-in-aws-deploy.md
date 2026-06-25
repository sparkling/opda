---
status: accepted
date: 2026-06-25
tags: [ci, performance, infrastructure, deploy]
supersedes: []
depends-on: []
implements: []
---

# Cache the Apache Jena Fuseki dist in the AWS deploy

## Context and Problem Statement

The `Deploy site to AWS` workflow takes ~13 minutes for what is, at the edge, a static site — prompting the question "what is eating the time?". Profiling the per-step and per-phase timings of a representative successful run (`28156114864`) gives a clear answer.

Top-level steps:

| Step | Duration |
|---|---:|
| `npm run build:data` | **656s** |
| Sync `dist/` to S3 | 98s |
| everything else (checkout, installs, gates, OIDC, CloudFront invalidation) | ~30s |

Breaking `build:data` down by its own phase markers:

| Phase | Duration |
|---|---:|
| **1. Start Apache Jena Fuseki (provision + JVM start)** | **613s** |
| 2. Load TTLs into Fuseki | 2s |
| 3. Start GRLC API | 2s |
| 3.5 Extract ontology model (SPARQL → `ontology-model.json`) | 1s |
| 3.6 Derive graph elements | 0s |
| 4. `astro build` (all 1,574 pages) | ~38s |

So **613 of the 656 seconds — 94% of `build:data`, ~80% of the whole deploy — is phase 1**, which downloads the **49 MB** Fuseki tarball from `archive.apache.org`. That host (the permanent cold archive, not a CDN mirror) throttles to ~80 KB/s, so the download alone is ~10 minutes, **on every deploy**. The retry wrapper added previously makes the download *robust* but still re-fetches it each run.

The `astro build` itself is only ~38s for 1,574 pages — the build is not slow.

## Decision Drivers

* Deploy latency — 13 min for a content tweak is a poor iteration loop and a poor incident-response time.
* The cost is a *cache miss*, not computation: the same 49 MB artifact is re-downloaded every run.
* Precedent: the sibling `ontology-byte-identity.yml` workflow already caches the Jena dist (`actions/cache`, key `jena-6.1.0`); the deploy workflow simply never did.

## Considered Options

* **A — Cache the Fuseki dist with `actions/cache`** (keyed on the Fuseki version, path `.fuseki/`). On a hit, `ensureFuseki()` finds the extracted jar and skips the download + extract.
* **B — Cut the per-entity SPARQL cost at build time** (batch/parallelise/snapshot the entity-detail queries). This was the original hypothesis for "the slow part".
* **C — Switch the download to a faster mirror** (`dlcdn.apache.org`) instead of `archive.apache.org`.
* **D — Eliminate Fuseki from the build entirely** — generate every page from the committed `ontology-model.json` so no triplestore is needed at build time.

## Decision Outcome

Chosen option: **"A — Cache the Fuseki dist."** It targets the actual 94% bottleneck, is a four-line workflow change, mirrors an existing in-repo pattern, and carries no correctness risk (the dist is sha512-verified by `ensureFuseki()` regardless of source). Expected effect: phase 1 drops from ~613s to ~5s on cache hits, taking the deploy from ~13 min to **~2–3 min** (the next-largest item becomes the 98s S3 sync). The first run after this change still pays the full download once to prime the cache; the key is pinned to the Fuseki version so a bump re-primes it.

**Option B is explicitly rejected — it is not the bottleneck.** The profiling shows `astro build` is ~38s total, and the `/pdtf/{Term}` resource pages (the bulk, ~300+ pages) were migrated to pure SSG under ADR-0044 — they read the committed `ontology-model.json` in `getStaticPaths`, with *no* runtime query (`src/pages/pdtf/[...name].astro`). Only three surfaces still hit the live GRLC API at build time (`src/pages/model/logical/[...slug].astro`, `src/pages/model/concept/[...slug].astro`, and their shared `EntityApiPage.astro`), and they are a small minority of the 38s. A query-batching/snapshotting refactor would add complexity to save a few seconds. Recording this here so the "optimise the SPARQL" instinct is not re-attempted without re-profiling.

Options C and D are not taken now: C (faster mirror) is made moot by the cache — the slow archive download becomes a once-per-version event — and `dlcdn.apache.org` only hosts current releases, so it is an unreliable source for a pinned older version; D (drop Fuseki from the build) is a larger architectural change that contradicts ADR-0021's build-time-API generation of the `/model/*` tiers and the model-extraction step (3.5) that keeps `ontology-model.json` fresh, and is unnecessary once the dist is cached.

### Consequences

* Good, because the deploy drops from ~13 min to ~2–3 min on cache hits — the download (94% of `build:data`) is eliminated except on a version bump or cache eviction.
* Good, because it reuses an existing, understood pattern (`actions/cache`, as in `ontology-byte-identity.yml`) and adds no new failure mode — the cached dist is still sha512-verified.
* Neutral, because the first run after merge (and after any `FUSEKI_VERSION` bump) still pays the full ~600s download to prime the cache.
* Neutral, because the S3 sync (98s) becomes the next-largest item; addressing it is a separate, smaller future lever if needed.
* Bad, because GitHub Actions caches can be evicted (7-day idle / 10 GB repo budget); an evicted cache silently falls back to the slow download — recognisable as a one-off slow deploy, self-healing on the next run.

### Confirmation

* The second deploy after this lands (first primes the cache) shows the `build:data` "1. Start Apache Jena Fuseki" phase at a few seconds rather than ~600s, and a total wall-clock under ~4 min.
* The cache step reports a hit in the run log (`Cache restored from key: fuseki-6.1.0`).
* `ensureFuseki()` still verifies sha512 on any (re)download, so a corrupt/evicted cache cannot ship a bad binary.

## More Information

* Profiled run: `Deploy site to AWS` #`28156114864` (2026-06-25).
* Implementation: `.github/workflows/deploy-aws.yml` — `actions/cache@v4`, `path: .fuseki`, `key: fuseki-6.1.0`. The cache dir and version are defined in `scripts/build-with-data.mjs` (`CACHE_DIR = .fuseki`, `FUSEKI_VERSION = '6.1.0'`).
* Depends in spirit on ADR-0021 (build-time GRLC API / `build:data` pipeline) and ADR-0044 (the `/pdtf` SSG migration that already removed the per-entity query cost lever B assumed). Not authored as a formal `depends-on:` edge — this is a CI-perf change, not a correctness dependency.
* Next lever if further speedup is wanted: the 98s S3 sync (`aws s3 sync` flags / changed-only upload). Out of scope here.
