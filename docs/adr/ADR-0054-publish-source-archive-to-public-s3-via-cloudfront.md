---
status: proposed
date: 2026-06-25
tags: [infrastructure, aws, resources, deploy, hosting]
supersedes: []
depends-on: [ADR-0038]
implements: []
---

# Publish the source/ archive to a public S3 bucket served via CloudFront

## Context and Problem Statement

`source/` is the project's research and working archive: **557 MB** total, **455 MB of which is binary** across 148 files (the bulk being `05-engagement/` videos at **269 MB**). It is gitignored by design — `.gitignore` carries `/source/*` with text-file exceptions, so only ~106 text files are tracked and none of the binaries are in git history.

The webapp links *into* this archive. The resource viewer is reached as `/resource.html?path=source/…`, and the content references **191 distinct `source/`-targeted links** pointing at ~36 MB of on-disk material (of which **48 are already broken** — dangling paths predating this decision).

The problem: `astro.config.mjs` exposes `source/` **only through a dev-only Vite plugin**. Production builds ship `src/` and `public/` into `dist/`; they do **not** ship `source/`. So every one of those `source/` resource links **404s in production**. The archive is reachable while developing and invisible once deployed.

We need the linked material (and, per a prior "all the data lives in S3" steer, the whole archive) to resolve on the live site, without dragging 500 MB of churning binaries into git or the CI build.

## Decision Drivers

* **Functioning production resource links** — the 191 `source/` links must resolve on the deployed site, ideally with no mass link rewrite.
* **Keep ~500 MB of binaries out of git** — history must stay lean; the archive churns (videos, exports) and must not be versioned.
* **CI has no binaries** — the gitignored files are not present in a CI checkout, so whatever serves them cannot depend on the CI build producing them.
* **Cost** — on an open project, storage (~$0.01–0.02/mo) plus CloudFront egress is acceptable; no per-request compute should be introduced.
* **Single domain** — resources should serve from `opda.org.uk` over HTTPS, not a second host or a raw bucket URL.

## Considered Options

* **A — Git LFS.** Track the binaries via Git LFS so they travel with the repo.
* **B — Commit the linked subset into `public/`.** Copy just the ~36 MB of referenced files into `public/`, where Astro already pipes `public/ → dist/ → served`.
* **C — Dedicated public S3 bucket fronted by the existing CloudFront distribution.** Mirror `source/` to a new bucket and expose it through a new public `/resources/*` cache behaviour. Two sub-variants:
  * **C1 — raw public S3 bucket** (objects served directly from the bucket's website/REST endpoint).
  * **C2 — private bucket + CloudFront with Origin Access Control (OAC)**, served via the existing distribution.

## Decision Outcome

Chosen option: **"C2 — a dedicated public-served S3 bucket fronted by the existing CloudFront distribution with OAC."**

Concretely:

* Create a **new, dedicated bucket `opda-resources`**, kept **separate from the site bucket**. This separation is load-bearing: the deploy runs `aws s3 sync dist/ s3://<site-bucket> --delete`, and `--delete` would wipe a resources prefix that shared the site bucket. A distinct bucket is immune to the site sync.
* Add a **new `/resources/*` cache behaviour** on the **existing** CloudFront distribution that is **public** — it carries **no Lambda@Edge gate association**, unlike the gated default behaviour from ADR-0038. The bucket origin uses **Origin Access Control**, so the bucket stays private to direct access while CloudFront serves it publicly over HTTPS on `opda.org.uk`.
* Publishing is a **local, out-of-band `make publish-resources`** (`aws s3 sync source/ s3://opda-resources/`). It is **not** a CI step, because CI does not have the gitignored binaries. The maintainer runs it from a working tree that does.
* The resource viewer (`src/pages/resource.astro`) **resolves `source/…` → `/resources/…` in production** while keeping the dev-only Vite-plugin `/source/…` path in development. Existing links therefore work unchanged — **no mass rewrite** of the 191 links.

**Scope — the whole archive is public.** The project owner has confirmed OPDA is an open project and that all source material — including two internal exec-meeting Teams transcripts titled "…private + confidential…" (`source/05-engagement/videos-internal/transcripts/`), which were flagged and explicitly cleared — is to be published. There are **no exclusions**: `make publish-resources` mirrors the entire `source/` tree. The exclusion mechanism (an `EXCLUDES` array in `scripts/publish-resources.sh`) is retained, empty, so any future hold-back is a one-line change.

**Why C2 over C1 (the sub-variant).** CloudFront + OAC gives HTTPS, serving under the `opda.org.uk` domain (one host, one TLS cert), edge caching, and a bucket that is **not directly listable or fetchable** — only CloudFront can read it. A raw public bucket (C1) would expose a second hostname, a publicly listable bucket, and no shared caching/TLS story. C2 is strictly better for the same data with negligible extra setup (one behaviour + one OAC).

**Why not A (Git LFS).** Rejected. GitHub's free LFS tier is **1 GB storage / 1 GB-month bandwidth**; ~500 MB of churning binaries blows the quota, and **every CI checkout pays bandwidth**. Worse, it would **still not serve in production** — Astro ships `src/` and `public/`, not `source/` — so LFS solves the storage question while leaving the actual 404 unfixed.

**Why not B (commit the subset to `public/`).** Rejected for the long term. It *works* mechanically (`public/ → dist/ → served`), but it pulls churning binaries into git history with **no upper bound** — every re-export of a linked asset re-bloats the repo permanently. It also only covers the ~36 MB referenced subset, not the "all data in S3" steer. Acceptable as an emergency stop-gap for a single asset; wrong as the standing answer.

### Consequences

* **Good** — the 191 `source/` links resolve on the live site (via the viewer's prod path rewrite), git stays free of the ~500 MB binary archive, and the running cost is ~$0.01–0.02/mo storage plus modest CloudFront egress.
* **Good** — reuses the existing CloudFront distribution and domain; no new host, cert, or auth surface. The `/resources/*` behaviour is additive and explicitly ungated.
* **Neutral** — publishing is a **manual, local** step (`make publish-resources`), since CI lacks the binaries. The maintainer must run it to (re)publish.
* **Neutral** — the full archive is mirrored, so ~465 MB of currently **unreferenced** material is also uploaded, per the "all the data lives in S3" decision. This is intentional, not waste to be pruned now.
* **Bad** — public CloudFront egress on the **269 MB of video** is **unbounded** if those assets are heavily downloaded; there is no gate and no per-object cap. Acceptable for an open project but worth watching on the AWS bill.
* **Bad** — the **48 pre-existing broken links** still 404; this decision does not fix them (they point at paths absent from `source/` itself). A separate content cleanup owns that.
* **Bad** — the manual publish can **drift** from `source/`: if the maintainer edits the archive and forgets to re-run `make publish-resources`, the live `/resources/*` lags the working tree.

### Confirmation

* A representative `/resources/<path>` URL resolves **publicly** post-publish — HTTP 200, **no auth redirect** (proving the `/resources/*` behaviour is ungated, unlike the default behaviour).
* `source/…` links on the **live** site resolve through the resource viewer (the prod `source/… → /resources/…` rewrite is in effect).
* The `opda-resources` bucket is **absent from the gated default behaviour** — it is only reachable via the dedicated public `/resources/*` behaviour, and the bucket itself is not directly listable (OAC).

## More Information

* Builds on **ADR-0038** (AWS hosting + the Lambda@Edge auth gate). This decision adds a *second, deliberately ungated* CloudFront behaviour alongside the gated default that ADR-0038 established — hence the light `depends-on: [ADR-0038]` edge: the distribution/gate topology this extends is defined there.
* Relates in spirit to **ADR-0021** (the build-time generation pipeline) and **ADR-0044** (the dereferenceable resource/entity-detail viewer) — the viewer those decisions shaped is where the prod `source/… → /resources/…` resolution lives. Not authored as formal `depends-on:` edges; this is an asset-hosting change, not a correctness dependency on the build pipeline.
* Key surfaces: `src/pages/resource.astro` (viewer prod/dev path resolution), `astro.config.mjs` (the existing dev-only `source/` Vite plugin, retained for dev), the deploy's `aws s3 sync dist/ s3://<site-bucket> --delete` (the reason the resources bucket must be separate), and a new `make publish-resources` target (`aws s3 sync source/ s3://opda-resources/`).
* Out of scope: fixing the 48 pre-existing broken links (separate content cleanup); and automating publication (CI cannot, lacking the binaries).
