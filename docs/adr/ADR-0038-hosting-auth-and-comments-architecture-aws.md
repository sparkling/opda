---
status: proposed
date: 2026-06-06
tags: [infrastructure, hosting, auth, deployment, comments]
supersedes: []
depends-on: []
implements: []
---

# Hosting, auth, and comments architecture (AWS)

## Context and Problem Statement

The OPDA knowledge base is a static Astro site (built to HTML/CSS/JS) with two runtime concerns beyond static delivery:

1. A **public "coming soon" homepage at the apex** (`opda.org.uk/`) while the rest of the site is **gated** to a small set of authenticated members.
2. A self-hosted **Artalk comments backend** — a Go container with a **SQLite** database — that authenticates commenters via the site's OIDC identity (Auth0), through a small fork (`sparkling/Artalk`) that adds an SSO token-exchange endpoint.

The current production stack is **Cloudflare Pages** (static hosting + CDN) gated by **Cloudflare Access** (Auth0 OIDC) at the edge, with Artalk on a single **Fly.io** machine backed by a Fly Volume. Cloudflare Access cannot express "public apex root **and** gated everything-else" on one hostname: its path matching is prefix/inheritance-based, so the root is the *least*-specific prefix and cannot be carved out as public while subpaths stay gated (confirmed against Cloudflare's path-matching documentation and reproduced as an `application_already_exists` conflict when attempting a root-scoped Bypass app). This motivated evaluating a move to a single cloud where the public/gated split is expressed **in code** rather than at an edge-ACL layer.

**Scale is deliberately small: 3 authenticated users, ~20 page-views/day, static content.** Performance and availability requirements are minimal; cost should be near-zero.

## Decision Drivers

* Express "public homepage + gated KB" in code, avoiding the apex-root limitation of edge path-ACLs.
* **Server-side protection**: gated KB HTML must not be fetchable by an anonymous request — a client-side check is insufficient.
* Keep the building blocks that already work: **SQLite** (no managed database), **Auth0** OIDC (the members' existing identities), and the Artalk fork's SSO bridge.
* Consolidate hosting, CDN, DNS, and the comments container under one provider.
* Host in the **London region (`eu-west-2`)** — UK site, UK members; member data and comments stay in the UK.
* Near-zero cost and minimal operational surface at 3-user / 20-view-per-day scale.
* Durable comment persistence **without** a managed-database instance.

## Considered Options

* **A — Stay on Cloudflare Pages; gate in-app.** Keep Pages hosting; delete the Cloudflare Access app; gate KB pages with a client-side Auth0 check; leave Artalk on Fly.io. No migration.
* **B — Google Cloud.** Cloud Run (static + gate), Identity Platform or Auth0, Cloud DNS, GCS-backed SQLite via Litestream.
* **C — Amazon Web Services (this ADR).** S3 + CloudFront static delivery, Route 53 DNS, Auth0 retained for OIDC (social login), Artalk on ECS Fargate, SQLite persisted to S3 via Litestream.

## Decision Outcome

Chosen option: **C — Amazon Web Services**, to consolidate hosting, CDN, DNS, and the comments container on one provider while expressing the public/gated split in code — a **server-side Lambda@Edge gate** running the OAuth 2.0 authorization-code flow against **Auth0** — and to keep SQLite, Auth0, and the Artalk fork unchanged.

Component breakdown:

* **Region — London (`eu-west-2`)** for every regional resource: the site S3 bucket, the Litestream S3 bucket, and the ECS Fargate task. Two CloudFront control-plane exceptions are unavoidable: the **ACM certificate** for the distribution and the **Lambda@Edge** function must be created in `us-east-1` — but both *execute* at edge locations (London PoPs for UK viewers), and no member data is stored in `us-east-1`.
* **CDN + static hosting — Amazon CloudFront over a private S3 bucket** (Origin Access Control). The Astro build is synced to S3; CloudFront serves it globally over TLS (ACM certificate). The public homepage and its assets are served straight from cache.
* **DNS — Amazon Route 53** hosted zone for `opda.org.uk`; alias records to the CloudFront distribution and to the comments endpoint. (DNS may alternatively stay at the current registrar with CNAMEs; Route 53 is chosen for single-provider management.)
* **Auth — Auth0 retained as the OIDC IdP.** All current members are **social-login identities only** (no Auth0 database users exist), signing in through Auth0's shared Google developer keys — no self-registered social-provider credentials exist or are needed. The members' identities, the tenant, and the Artalk SSO bridge are all unchanged; the only new Auth0 artefact is one **SPA application** (public client, PKCE — no secret) for the edge gate's flow. **Membership is enforced at the gate**: Auth0's dev keys authenticate *any* Google account, so the gate checks the ID token's e-mail against the member allowlist (held in the gate's SSM config). *Migrating the IdP to **Amazon Cognito** (direct Google federation + pre-sign-up allowlist) was decided on 2026-06-06 and reverted the same day*: Cognito has no shared developer keys, so it requires a self-registered Google OAuth client — a new manual prerequisite delivering no functional gain at this scale (this ADR's own earlier assessment), while keeping Auth0 needs nothing.
* **Gate — public apex, gated KB, server-side.** `/` and its assets are public; KB paths are protected by a **Lambda@Edge** function on the CloudFront distribution implementing the **OAuth 2.0 authorization-code flow (PKCE)** against Auth0 Universal Login: an anonymous request to a KB path is **302-redirected to Auth0 sign-in**, the callback exchanges the code for tokens, and a signed, HttpOnly session cookie (the Auth0 ID token, signature-verified against the tenant JWKS at the edge on every request, plus the member-allowlist check) authorises subsequent requests. Gated HTML is never served to an unauthenticated request — this is genuine protection, unlike a client-side check. KB pages carry `noindex`. (A client-side-only check was considered and rejected: it leaves the HTML fetchable by a determined anonymous viewer.)
* **Comments container — Artalk on ECS Fargate**, a **single always-on task** (desired count 1; deployment configured `minimumHealthyPercent=0` so the old task stops before the new starts — never two writers). Image is the `sparkling/Artalk` fork (SSO token-exchange endpoint), reachable at `comments.opda.org.uk`.
* **Database — SQLite**, single-writer, on the task's ephemeral local disk.
* **Persistence — Litestream** continuously replicates the SQLite WAL to an **S3 bucket** and restores it on task start. This gives the stateless Fargate task durable storage with no managed database — the "SQLite backed by a bucket" model. Single-writer ⇒ exactly one task.
* **Infrastructure as code — AWS CloudFormation.** All AWS resources are declared in CloudFormation templates committed to this repository; no console-built resources. Stacks are regional, so the split follows the region decision: a **`us-east-1` stack** (ACM certificate + the Lambda@Edge gate function — the two control-plane exceptions) and a **`eu-west-2` stack** (S3 buckets, CloudFront distribution, the gate's Auth0/allowlist config parameter, ECS Fargate service, Route 53 records), with the certificate and function-version ARNs passed across as parameters/exports. Deploys run from GitHub Actions (extending the existing CI-only deploy discipline) via an **IAM OIDC role for GitHub** — no long-lived AWS keys in repository secrets. The full pipeline (bootstrap stack, site/infra/image deploy paths, role trust and permissions) is specified in **ADR-0040**.

### Consequences

* Good, because the public/gated split is expressed in code, eliminating the Cloudflare Access apex-root limitation that triggered this review.
* Good, because SQLite + Litestream → S3 gives durable comments with no managed-database instance and no data-migration step (the database is empty today, so the cutover is a clean redeploy).
* Good, because the gate is **server-side**: gated HTML is never delivered to an unauthenticated request, closing the weakness of a client-side check.
* Good, because retaining Auth0 means **zero member migration** — identities, tenant, and the Artalk SSO bridge (which already verifies via Auth0's `/userinfo`) are all untouched; the IdP swap was the highest-friction, lowest-payoff part of the original plan.
* Neutral, because auth (Auth0) remains a third-party SaaS; full single-provider consolidation (migrating to Cognito) was attempted and reverted — it requires a self-registered Google OAuth client where Auth0's shared dev keys need nothing — and remains available later if membership outgrows the dev keys' limitations.
* Bad, because at 3 users / ~20 views per day this is materially **more infrastructure than the workload requires**. Option A (stay on Cloudflare Pages, gate client-side, leave Artalk on Fly) meets the cost goal with no migration — but it cannot meet the server-side-protection requirement, which now rules it out rather than merely disfavouring it.
* Bad, because an always-on Fargate task (~$7–9/mo for the smallest task) costs more than the current Fly machine (~$2/mo). App Runner (request-scaled toward zero) or a small EC2 instance can lower this, at the cost of cold-start/last-write races or VM patching respectively.
* Bad, because Lambda@Edge adds deployment friction: functions must be authored in `us-east-1`, replicate globally on publish (slow update cycle), cannot use environment variables, and make the auth flow harder to test locally than a client-side check.
* Neutral, because the single-writer SQLite constraint requires deployment care (never two concurrent tasks) on whichever container service is used.

### Confirmation

* `opda.org.uk/` returns **200** for an anonymous request (public homepage); an anonymous request to a KB path (e.g. `/modelling`) returns a **302 to Auth0 sign-in — never the page HTML** (server-side protection confirmed with `curl`, no browser).
* **Each current member** signs in to the KB exactly as before (same Auth0 social login, same e-mail identity); a sign-in with a **non-member e-mail is rejected by the gate's allowlist** even though Auth0 authenticates it.
* A comment posted by a signed-in member — authenticated via the unchanged SSO bridge against Auth0's `/userinfo` — **survives a forced restart** of the Artalk task, proving Litestream restore-from-S3 on boot.
* **Exactly one** Artalk task runs at all times, including across deployments — proving the single-writer invariant.
* The CDN serves the apex over TLS via the ACM certificate and a Route 53 alias.
* All regional resources (both S3 buckets, the Fargate task) report region **`eu-west-2`**; only the ACM certificate and Lambda@Edge function live in `us-east-1`.
* Every AWS resource belongs to one of the project's CloudFormation stacks (no console-built orphans), and all CI-deployed stacks deploy cleanly via the GitHub OIDC role.

## Pros and Cons of the Options

### A — Stay on Cloudflare Pages; gate in-app

* Good, because zero migration; keeps the working CI deploy, Auth0, and Fly Artalk.
* Good, because cheapest and simplest at this scale (~$0–2/mo); dropping Cloudflare Access removes the apex-root problem outright.
* Bad, because a client-side gate leaves KB HTML viewable to a determined viewer — **this fails the server-side-protection requirement and eliminates the option**. (Cloudflare Pages has no server-side per-path auth primitive short of re-introducing Access, whose apex-root limitation is the original problem, or moving to Workers.)
* Neutral, because it does not consolidate providers (Cloudflare + Fly + Auth0 remain).

### C — Amazon Web Services

* Good, because single-provider consolidation of everything except the IdP; server-side code-level gating; standard, well-documented services.
* Good, because the gate is plain OIDC + PKCE — the IdP behind it (Auth0 today, Cognito if ever consolidated) is swappable via one SSM config parameter, not a code change.
* Bad, because it is the **most operational surface** of the options (S3, CloudFront, Route 53, ACM, Lambda@Edge, ECS/Fargate, Litestream, IAM) for a 3-user site.
* Neutral, because IdP consolidation onto Cognito was evaluated and reverted: Cognito requires a self-registered Google OAuth client (it has no shared developer keys, unlike Auth0), and its OIDC-federation pricing tier (50 free MAU vs 10,000 for direct social) would matter only far beyond present scale.

*(Option B — GCP — is the same shape with Cloud Run + GCS-backed Litestream; equivalent cost, marginally simpler single-container model.)*

## More Information

* This is the **first** ADR recording the site's hosting/auth/comments infrastructure; ADRs 0001–0037 cover content and ontology only. It supersedes no prior record.
* **Litestream** streams the SQLite WAL to object storage and restores on boot — the durability mechanism that lets a stateless container use SQLite.
* **Artalk fork** (`sparkling/Artalk`): adds `POST /api/v2/sso/exchange`, which verifies an access token via the IdP's OIDC `/userinfo` and mints an Artalk session JWT. This is why a stock upstream Artalk image is insufficient for seamless, popup-free comment login. The endpoint is IdP-agnostic by design; with Auth0 retained it is entirely unchanged by this migration.
* **IdP decision history**: migrating Auth0 → Cognito (direct Google federation, pre-sign-up allowlist, member e-mails re-provisioned) was decided on 2026-06-06 and **reverted the same day**, before implementation completed. The trigger: Cognito requires a self-registered Google OAuth client for Google federation — Auth0's shared developer keys had been absorbing that prerequisite invisibly — and the consolidation gain was already assessed here as marginal at 3 users. The revert keeps the members' identities and the Artalk bridge untouched; the gate-side e-mail allowlist replaces Cognito's pre-sign-up trigger (necessary because Auth0's dev keys authenticate any Google account).
* Related: **ADR-0003** (idiomatic Astro refactor) — the static-site structure this architecture deploys; **ADR-0040** (AWS hosting CI/CD pipeline) — implements this ADR's deployment and IaC commitments.
* Incumbent stack being moved away from: Cloudflare Pages + Cloudflare Access + Fly.io Artalk (SQLite on a Fly Volume). Auth0 stays.
