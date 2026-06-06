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
* Keep the building blocks that already work: **SQLite** (no managed database) and the Artalk fork's SSO bridge.
* Consolidate hosting, CDN, DNS, auth, and the comments container under one provider — including migrating the IdP from Auth0 to **Amazon Cognito**.
* Host in the **London region (`eu-west-2`)** — UK site, UK members; member data and comments stay in the UK.
* Near-zero cost and minimal operational surface at 3-user / 20-view-per-day scale.
* Durable comment persistence **without** a managed-database instance.

## Considered Options

* **A — Stay on Cloudflare Pages; gate in-app.** Keep Pages hosting; delete the Cloudflare Access app; gate KB pages with a client-side Auth0 check; leave Artalk on Fly.io. No migration.
* **B — Google Cloud.** Cloud Run (static + gate), Identity Platform or Auth0, Cloud DNS, GCS-backed SQLite via Litestream.
* **C — Amazon Web Services (this ADR).** S3 + CloudFront static delivery, Route 53 DNS, Cognito for OIDC (migrated from Auth0, social login), Artalk on ECS Fargate, SQLite persisted to S3 via Litestream.

## Decision Outcome

Chosen option: **C — Amazon Web Services**, to consolidate hosting, CDN, DNS, auth, and the comments container on one provider while expressing the public/gated split in code — a **server-side Lambda@Edge gate** running the OAuth 2.0 authorization-code flow against **Amazon Cognito** — and to keep SQLite and the Artalk fork unchanged. Auth0 is **migrated to Cognito**, completing the single-provider consolidation.

Component breakdown:

* **Region — London (`eu-west-2`)** for every regional resource: the site S3 bucket, the Litestream S3 bucket, the ECS Fargate task, and the Cognito user pool. Two CloudFront control-plane exceptions are unavoidable: the **ACM certificate** for the distribution and the **Lambda@Edge** function must be created in `us-east-1` — but both *execute* at edge locations (London PoPs for UK viewers), and no member data is stored in `us-east-1`.
* **CDN + static hosting — Amazon CloudFront over a private S3 bucket** (Origin Access Control). The Astro build is synced to S3; CloudFront serves it globally over TLS (ACM certificate). The public homepage and its assets are served straight from cache.
* **DNS — Amazon Route 53** hosted zone for `opda.org.uk`; alias records to the CloudFront distribution and to the comments endpoint. (DNS may alternatively stay at the current registrar with CNAMEs; Route 53 is chosen for single-provider management.)
* **Auth — Amazon Cognito user pool, migrated from Auth0, with social login.** All current Auth0 members are **social-login identities only** (no Auth0 database users exist). The pool uses **direct social federation** — the social provider(s) are wired into Cognito as IdPs directly, *not* chained through Auth0 or any external OIDC broker — and is **provisioned with the current Auth0 member identities**: because login is social, there are no passwords to migrate — the same member e-mail addresses are pre-created (or allow-listed via a **pre-sign-up Lambda trigger**) so that only existing members can establish an account, and a social sign-in with a matching e-mail links to that membership. Direct social federation also keeps Cognito in its 10,000-free-MAU tier (vs the 50-MAU OIDC-federation tier). The Auth0 tenant is decommissioned after cutover.
* **Gate — public apex, gated KB, server-side.** `/` and its assets are public; KB paths are protected by a **Lambda@Edge** function on the CloudFront distribution implementing the **OAuth 2.0 authorization-code flow** against the Cognito hosted UI: an anonymous request to a KB path is **302-redirected to Cognito sign-in**, the callback exchanges the code for tokens, and a signed, HttpOnly session cookie (the Cognito JWT, signature-verified at the edge on every request) authorises subsequent requests. Gated HTML is never served to an unauthenticated request — this is genuine protection, unlike a client-side check. KB pages carry `noindex`. (A client-side-only check was considered and rejected: it leaves the HTML fetchable by a determined anonymous viewer.)
* **Comments container — Artalk on ECS Fargate**, a **single always-on task** (desired count 1; deployment configured `minimumHealthyPercent=0` so the old task stops before the new starts — never two writers). Image is the `sparkling/Artalk` fork (SSO token-exchange endpoint), reachable at `comments.opda.org.uk`.
* **Database — SQLite**, single-writer, on the task's ephemeral local disk.
* **Persistence — Litestream** continuously replicates the SQLite WAL to an **S3 bucket** and restores it on task start. This gives the stateless Fargate task durable storage with no managed database — the "SQLite backed by a bucket" model. Single-writer ⇒ exactly one task.
* **Infrastructure as code — AWS CloudFormation.** All AWS resources are declared in CloudFormation templates committed to this repository; no console-built resources. Stacks are regional, so the split follows the region decision: a **`us-east-1` stack** (ACM certificate + the Lambda@Edge gate function — the two control-plane exceptions) and a **`eu-west-2` stack** (S3 buckets, CloudFront distribution, Cognito user pool + allowlist trigger, ECS Fargate service, Route 53 records), with the certificate and function-version ARNs passed across as parameters/exports. Deploys run from GitHub Actions (extending the existing CI-only deploy discipline) via an **IAM OIDC role for GitHub** — no long-lived AWS keys in repository secrets. The full pipeline (bootstrap stack, site/infra/image deploy paths, role trust and permissions) is specified in **ADR-0040**.

### Consequences

* Good, because the public/gated split is expressed in code, eliminating the Cloudflare Access apex-root limitation that triggered this review.
* Good, because SQLite + Litestream → S3 gives durable comments with no managed-database instance and no data-migration step (the database is empty today, so the cutover is a clean redeploy).
* Good, because the gate is **server-side**: gated HTML is never delivered to an unauthenticated request, closing the weakness of a client-side check.
* Good, because migrating Auth0 → Cognito completes the single-provider consolidation (hosting, CDN, DNS, auth, comments — one provider, one bill, one console), and the Artalk fork's SSO bridge needs only an issuer/configuration change: it verifies tokens via the IdP's OIDC `/userinfo`, which Cognito exposes as standard.
* Neutral, because the member migration itself is trivial at this scale: social-login identities carry no passwords, so "migration" is re-provisioning the same member e-mail addresses in the Cognito pool (pre-created or pre-sign-up allow-listed) — no Auth0 password-hash export is needed.
* Bad, because at 3 users / ~20 views per day this is materially **more infrastructure than the workload requires**. Option A (stay on Cloudflare Pages, gate client-side, leave Artalk on Fly) meets the cost goal with no migration — but it cannot meet the server-side-protection requirement, which now rules it out rather than merely disfavouring it.
* Bad, because an always-on Fargate task (~$7–9/mo for the smallest task) costs more than the current Fly machine (~$2/mo). App Runner (request-scaled toward zero) or a small EC2 instance can lower this, at the cost of cold-start/last-write races or VM patching respectively.
* Bad, because Lambda@Edge adds deployment friction: functions must be authored in `us-east-1`, replicate globally on publish (slow update cycle), cannot use environment variables, and make the auth flow harder to test locally than a client-side check.
* Neutral, because Cognito's hosted sign-in UI is less polished/customisable than Auth0's Universal Login — acceptable for 3 known members.
* Neutral, because the single-writer SQLite constraint requires deployment care (never two concurrent tasks) on whichever container service is used.

### Confirmation

* `opda.org.uk/` returns **200** for an anonymous request (public homepage); an anonymous request to a KB path (e.g. `/modelling`) returns a **302 to Cognito sign-in — never the page HTML** (server-side protection confirmed with `curl`, no browser).
* **Each current Auth0 member** can sign in to the KB via Cognito social login using their existing e-mail identity; a social sign-in with a **non-member e-mail is rejected** by the pre-sign-up allowlist.
* A comment posted by a signed-in member — authenticated via the SSO bridge against **Cognito's** `/userinfo` — **survives a forced restart** of the Artalk task, proving both the issuer cutover and Litestream restore-from-S3 on boot.
* **Exactly one** Artalk task runs at all times, including across deployments — proving the single-writer invariant.
* The CDN serves the apex over TLS via the ACM certificate and a Route 53 alias.
* All regional resources (both S3 buckets, the Fargate task, the Cognito pool) report region **`eu-west-2`**; only the ACM certificate and Lambda@Edge function live in `us-east-1`.
* Every AWS resource belongs to one of the two CloudFormation stacks (no console-built orphans), and both stacks deploy cleanly from CI via the GitHub OIDC role.
* The Auth0 tenant is decommissioned (or emptied) after the above pass.

## Pros and Cons of the Options

### A — Stay on Cloudflare Pages; gate in-app

* Good, because zero migration; keeps the working CI deploy, Auth0, and Fly Artalk.
* Good, because cheapest and simplest at this scale (~$0–2/mo); dropping Cloudflare Access removes the apex-root problem outright.
* Bad, because a client-side gate leaves KB HTML viewable to a determined viewer — **this fails the server-side-protection requirement and eliminates the option**. (Cloudflare Pages has no server-side per-path auth primitive short of re-introducing Access, whose apex-root limitation is the original problem, or moving to Workers.)
* Neutral, because it does not consolidate providers (Cloudflare + Fly + Auth0 remain).

### C — Amazon Web Services

* Good, because full single-provider consolidation (including the IdP); server-side code-level gating; standard, well-documented services.
* Good, because Cognito is a near drop-in for the Auth0-based SSO bridge (standard OIDC `/userinfo`), and direct social federation sits in the generous free tier.
* Bad, because it is the **most operational surface** of the options (S3, CloudFront, Route 53, ACM, Cognito, Lambda@Edge, ECS/Fargate, Litestream, IAM) for a 3-user site.
* Bad, because Cognito's post-Nov-2024 pricing is the least predictable of the IdP options (though free at this scale: 10,000 MAU for direct social logins, only 50 for OIDC-federated — another reason the pool federates the social providers directly rather than chaining to an external OIDC IdP).

*(Option B — GCP — is the same shape with Cloud Run + GCS-backed Litestream; equivalent cost, marginally simpler single-container model.)*

## More Information

* This is the **first** ADR recording the site's hosting/auth/comments infrastructure; ADRs 0001–0037 cover content and ontology only. It supersedes no prior record.
* **Litestream** streams the SQLite WAL to object storage and restores on boot — the durability mechanism that lets a stateless container use SQLite.
* **Artalk fork** (`sparkling/Artalk`): adds `POST /api/v2/sso/exchange`, which verifies an access token via the IdP's OIDC `/userinfo` and mints an Artalk session JWT. This is why a stock upstream Artalk image is insufficient for seamless, popup-free comment login. The endpoint is IdP-agnostic by design — the Auth0 → Cognito cutover is a configuration (issuer/userinfo URL) change, not a code change.
* **Auth0 → Cognito member migration**: the membership is 3 social-login identities — the Auth0 tenant holds **no database (e-mail/password) users**. No password-hash export from Auth0 is required (social logins carry no Auth0-held credentials); the same e-mail addresses are provisioned in the Cognito pool, with a pre-sign-up Lambda allowlist preventing non-member sign-ups. Members sign in exactly as before, with the same social account — only the broker behind the redirect changes.
* Related: **ADR-0003** (idiomatic Astro refactor) — the static-site structure this architecture deploys; **ADR-0040** (AWS hosting CI/CD pipeline) — implements this ADR's deployment and IaC commitments.
* Incumbent stack being moved away from: Cloudflare Pages + Cloudflare Access + Auth0 (OIDC IdP) + Fly.io Artalk (SQLite on a Fly Volume).
