---
status: proposed
date: 2026-06-06
tags: [infrastructure, ci-cd, deployment, security]
supersedes: []
depends-on: [ADR-0021, ADR-0037]
implements: [ADR-0038]
---

# AWS hosting CI/CD pipeline

## Context and Problem Statement

ADR-0038 moves the site's hosting to AWS: S3 + CloudFront static delivery in `eu-west-2`, a Lambda@Edge OAuth/PKCE gate against Auth0 (the gate and ACM certificate being the `us-east-1` control-plane exceptions), Artalk comments on ECS Fargate with Litestream→S3 persistence, and all infrastructure declared as **CloudFormation** committed to this repository. That decision needs a deployment pipeline.

The incumbent pipeline (`.github/workflows/deploy.yml`) deploys to Cloudflare Pages: path-filtered on the production bundle, it runs the full data build (`npm run build:data` — self-provisioned Fuseki + build-time GRLC API per ADR-0021/0036/0037, only `dist/` ships), then `wrangler pages deploy`. Deploys are **CI-only** — push to `main` is the only deployment path; manual deploys are an escape hatch to be avoided.

The AWS architecture has **three deployable artefacts** where Cloudflare had one, each with a different cadence and blast radius:

1. **The static site** (`dist/`) — changes often; must reach S3 and be visible through CloudFront promptly.
2. **The infrastructure** (CloudFormation stacks in two regions) — changes rarely; a bad change can take the site down or violate the single-writer SQLite invariant.
3. **The Artalk container image** — built from the `sparkling/Artalk` fork (a *separate repository*); changes rarely; a deploy must never run two writer tasks concurrently.

How do these three artefacts deploy, with what credentials, triggered by what, in what order?

## Decision Drivers

* **CI-only deploys** — preserve the existing discipline: push to `main` deploys; no routine manual `aws` CLI or console deploys.
* **No long-lived AWS credentials** in GitHub repository secrets — standing keys are the dominant CI compromise vector.
* **Keep the data build unchanged** — the Fuseki + GRLC build-time pipeline (ADR-0021, ADR-0037) is orthogonal to where `dist/` is uploaded; only the upload step changes.
* **Everything-as-code** — the pipeline that deploys the CloudFormation stacks must itself be reviewable in this repository (workflows are code), and the IAM role it assumes must be defined in CloudFormation, not hand-built.
* **Single-writer invariant** (ADR-0038): no deployment path may ever run two Artalk tasks concurrently.
* **3-user scale** — no staging environment, no blue/green, no approval gates beyond `main` being green; the cheapest pipeline that is safe.

## Considered Options

* **A — GitHub Actions + IAM OIDC role + CloudFormation deploys** — extend the existing GitHub Actions setup; jobs assume a short-lived role via GitHub's OIDC provider; `aws cloudformation deploy` for infra, `aws s3 sync` + invalidation for the site; the Artalk fork repo pushes to ECR and bumps the service.
* **B — AWS CodePipeline / CodeBuild** — AWS-native pipeline triggered from GitHub via CodeStar connection.
* **C — GitHub Actions + long-lived IAM user access keys** — same workflows as A but authenticated with static keys in repository secrets.

## Decision Outcome

Chosen option: **A — GitHub Actions + IAM OIDC role + CloudFormation deploys**, because it keeps CI where the repository, the existing gates (byte-identity, BASPI5 round-trip), and the path-filter logic already live; eliminates standing credentials entirely (the role is assumable only by this repository's `main` branch, for minutes at a time); and adds no new vendor surface — option B introduces a second CI system for zero gain at this scale, and option C reintroduces exactly the credential class the drivers exclude.

### Pipeline components

**1. Authentication — GitHub OIDC → IAM role.**

* A **bootstrap CloudFormation stack** (`config/aws/bootstrap-stack.yaml`, `eu-west-2`) creates the `token.actions.githubusercontent.com` OIDC identity provider and a single deploy role. This stack is the one deliberate exception to CI-only: it is applied **once, manually**, because the role it creates is what CI authenticates as (chicken-and-egg). Everything after it deploys through CI.
* The role's **trust policy** restricts `sub` to `repo:sparkling/opda:ref:refs/heads/main` (plus the Artalk fork's claim, below) — a workflow run from any other repository, branch, or PR cannot assume it.
* The role's **permissions policy** covers exactly the pipeline's verbs: `cloudformation:*` on the project's stacks, `s3:PutObject`/`DeleteObject`/`ListBucket` on the site bucket, `cloudfront:CreateInvalidation` on the distribution, `ecr:*` push on the Artalk repository, `ecs:UpdateService`/`DescribeServices` on the Artalk service, plus the `iam:PassRole`/regional service permissions CloudFormation needs to manage the declared resources.
* GitHub repository configuration holds only the **role ARN and account ID** — neither is a secret.

**2. Site deploys — `deploy.yml` (rewritten at cutover).**

* Trigger: unchanged — push to `main` filtered to the production-bundle paths (`src/`, `public/`, ontology TTLs, build scripts, the workflow itself), plus `workflow_dispatch` as the manual escape hatch.
* Build: unchanged — pnpm install, JDK for Fuseki, `npm run build:data` producing `dist/` (ADR-0021/0036/0037 comments carried over verbatim).
* Deploy: replace the wrangler step with `aws s3 sync dist/ s3://<site-bucket> --delete` followed by `aws cloudfront create-invalidation --paths '/*'` (at ~20 views/day, a full invalidation is simpler than hashed-path bookkeeping and within the 1,000 free invalidation paths/month).
* Permissions: `id-token: write` (OIDC), `contents: read`.

**3. Infrastructure deploys — `infra.yml` (new).**

* Trigger: push to `main` filtered to `config/aws/**` and the workflow itself, plus `workflow_dispatch`.
* Steps: validate (`aws cloudformation validate-template` + `cfn-lint`), then deploy in dependency order — a small **`us-east-1` artifacts stack** (one private S3 bucket: Lambda@Edge code exceeds CloudFormation's 4&nbsp;KB inline limit, so the gate is staged via `aws cloudformation package`, and the packaging bucket must live in `us-east-1` with the function), then the **`us-east-1` edge stack** (ACM certificate + Lambda@Edge function, publishing a new numbered function version when the code changed) **before** the **`eu-west-2` site stack** (which consumes the certificate and function-version ARNs as parameters).
* `aws cloudformation deploy` (change-set based) with `--no-fail-on-empty-changeset`, so a run that touches only one stack is a no-op for the other.
* Concurrency: the workflow declares a `concurrency` group so two infra runs never interleave change sets.

**4. Artalk image deploys — in the `sparkling/Artalk` fork repository.**

* The image is built where its source lives: a workflow **in the fork** builds the image, pushes it to the **ECR repository** in this account (authenticating via the same OIDC provider — the deploy role's trust policy carries a second `sub` claim for `repo:sparkling/Artalk:ref:refs/heads/main`), then runs `aws ecs update-service --force-new-deployment`.
* The service's deployment configuration (`minimumHealthyPercent=0`, `maximumPercent=100`, desired count 1 — declared in the site stack per ADR-0038) is what enforces stop-old-then-start-new, so **no deployment path can ever run two writer tasks**; the pipeline relies on the declared configuration rather than scripting the invariant.
* This replaces the current `flyctl deploy` flow from the fork.

**5. Ordering and coupling.**

* `deploy.yml` and `infra.yml` are **independent** — a site deploy never touches CloudFormation and vice versa. The one coupled case (an infra change that renames/replaces the site bucket or distribution) requires an infra run followed by a site run; both expose `workflow_dispatch` precisely so the operator can sequence them. This is accepted as a manual-coordination case rather than automated, because it is rare and automation would couple the workflows for every run.
* The existing quality gates (`ontology-byte-identity.yml`, `baspi5-round-trip.yml`) are untouched; they remain push/PR checks, not deploy steps.

### Consequences

* Good, because no standing AWS credentials exist anywhere — a leaked GitHub secret yields a non-secret role ARN; assuming the role requires a workflow run on `sparkling/opda@main` (or the fork's `main` for ECR/ECS verbs only).
* Good, because the pipeline itself is code in this repository: the bootstrap stack, both workflows, and the deploy role's permissions are all reviewable and diffable.
* Good, because the data-build pipeline (ADR-0021/0037) carries over byte-for-byte; only the final upload step changes, so cutover risk concentrates in infrastructure, not the build.
* Good, because the single-writer invariant is enforced declaratively (ECS deployment configuration in the stack) rather than by pipeline scripting that could be bypassed.
* Bad, because three artefacts mean three deploy paths (site, infra, image) where Cloudflare had one — more workflows to understand, though each is individually simpler.
* Bad, because the bootstrap stack is a manual one-time step that must be documented (in the stack's own header comment) or it becomes invisible tribal knowledge.
* Bad, because Lambda@Edge function updates are slow to converge (publish in `us-east-1`, global replication — ADR-0038) so an infra run that changes the gate takes materially longer than a site deploy, and rollback of a bad gate version has the same latency.
* Neutral, because cross-repository coupling (the fork deploys into this account's ECR/ECS) mirrors the current Fly arrangement — the fork already owns the comments deploy today.
* Neutral, because there is no staging environment: `main` deploys straight to production. At 3 users this is the existing, accepted posture.

### Confirmation

* GitHub repository secrets contain **no AWS access keys** — only the role ARN / account ID variables.
* A push to `main` touching `src/**` deploys the site: the change is visible through CloudFront within minutes, and the run log shows OIDC role assumption (no static credentials).
* A push to `main` touching `config/aws/**` updates the stacks via change sets, edge stack before site stack, and a no-op template produces an empty-change-set success, not a failure.
* A workflow run from a branch other than `main`, or from a PR, **fails to assume the deploy role** (trust-policy rejection) — verified once deliberately.
* An Artalk image push from the fork results in exactly one running task throughout the rollout (`aws ecs describe-services` shows `runningCount` ≤ 1 at all times).
* The bootstrap stack is the only resource set not deployed by CI, and its template lives at `config/aws/bootstrap-stack.yaml` with the manual-application instruction in its header.

## Pros and Cons of the Options

### A — GitHub Actions + IAM OIDC role + CloudFormation deploys

* Good, because zero standing credentials; trust scoped to repo + branch.
* Good, because CI stays in one place (GitHub) with the existing gates and path filters.
* Good, because `aws cloudformation deploy` + change sets give idempotent, diffable infra updates with no extra tooling.
* Bad, because the OIDC provider + role need a manually-applied bootstrap stack before the first CI deploy.
* Bad, because IAM trust/permission policies are easy to over-scope; the role policy needs review discipline.

### B — AWS CodePipeline / CodeBuild

* Good, because deploy credentials never leave AWS at all (no OIDC bridge needed).
* Bad, because it splits CI across two systems — the quality gates stay in GitHub Actions, deploys move to CodePipeline — doubling the operational surface for a 3-user site.
* Bad, because pipeline definition, GitHub connection, and build images are all additional AWS resources to declare and maintain.

### C — GitHub Actions + long-lived IAM access keys

* Good, because simplest to set up (no OIDC provider, no bootstrap ordering).
* Bad, because static keys in GitHub secrets are standing credentials with no expiry — the exact risk class OIDC was designed to remove; rotation becomes a recurring manual chore that will be skipped.

## More Information

* **Implements ADR-0038** (hosting, auth, and comments architecture — AWS): this ADR realises its "Infrastructure as code — AWS CloudFormation" and CI-deploy commitments; the stack split (`us-east-1` edge / `eu-west-2` site) and the single-writer ECS configuration are decided there.
* **Depends on ADR-0021** (entity pages generated via build-time Fuseki + GRLC SPARQL API) and **ADR-0037** (Apache Jena toolchain): the site-deploy workflow runs `npm run build:data` unchanged, including the JDK provisioning these require.
* Cutover sequence: bootstrap stack (manual, once) → `infra.yml` deploys edge + site stacks → rewritten `deploy.yml` ships the site to S3 → fork's workflow ships Artalk to ECR/Fargate → ADR-0038's confirmation checklist → decommission Cloudflare Pages deploy (the wrangler step and its `CLOUDFLARE_*` secrets), Fly.io, and the Auth0 tenant.
* The current Cloudflare deploy workflow is not recorded in any ADR (ADR-0038 is the first infrastructure ADR), so this ADR supersedes no record; it *replaces* `.github/workflows/deploy.yml`'s deploy step in implementation.
* GitHub OIDC federation reference: [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).
