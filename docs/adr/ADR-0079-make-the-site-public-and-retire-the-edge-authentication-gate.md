---
status: accepted
date: 2026-08-27
updated: 2026-09-01
tags: [infrastructure, hosting, authentication, cloudfront, lambda-edge, public-access]
supersedes: []
amends: [ADR-0038, ADR-0040, ADR-0054, ADR-0069]
depends-on: [ADR-0038, ADR-0040, ADR-0069]
implements: [config/aws/site-stack.yaml, config/aws/auth-session-stack.yaml, config/aws/auth-session/index.mjs, config/aws/edge-stack.yaml, .github/workflows/infra.yml]
---

# Make the site public and retire the edge authentication gate

## Amendment: restore explicit member sign-in without restoring a site gate

On 2026-09-01 production verification found implementation drift. The header and
comments client still used the accepted same-origin `/_auth/login`, `callback`,
`me` and `logout` contract, but retiring the edge gate had also removed those
endpoints. Clicking **Sign in** therefore reached the static origin and returned
the site's 404 page.

The site remains fully public. A regional Lambda and HTTP API now implement only
the four `/_auth/*` session routes, and one cache-disabled CloudFront behavior
routes that path prefix to the API. The service cannot match, inspect or redirect
the default content behavior, `/api/v2/*`, `/resources/*` or the public
working-group registration API. The former Lambda@Edge gate and SSM configuration
remain retired; the `us-east-1` edge stack remains certificate-only.

The session service uses Auth0 Authorization Code with PKCE, a nonce, and a
high-entropy state value bound to short-lived `Secure`, `HttpOnly`, `SameSite=Lax`
cookies. It accepts only local return paths, verifies the ID-token signature,
issuer, audience, times, nonce and verified e-mail, and applies the authorised
commenter allowlist before creating a session. `/me` exposes the Auth0 access
token to same-origin client code only because the existing Artalk SSO bridge
requires it. All session responses are non-cacheable.

Auth0 domain, public client ID and commenter allowlist are CI-provided
CloudFormation parameters. They authorise comments only and do not control who
may read the site or register interest in a working group.

## Context and problem statement

ADR-0038 chose a public apex with an otherwise authenticated knowledge base. It
implemented that boundary as a Lambda@Edge viewer-request function running an
Auth0 OAuth/PKCE flow and checking a committed member allowlist through SSM.
ADR-0054 and ADR-0069 later added narrow public CloudFront behaviors for resources
and working-group recruitment.

The site is now intended to be read before a visitor decides whether to register
for a working group. Requiring authentication before the signup journey conflicts
with that public-recruitment purpose and adds an unnecessary redirect, identity,
configuration and globally replicated runtime dependency to otherwise static
delivery. Making only `/join` public would retain the operational gate and turn
public access into an expanding exception list rather than resolve the boundary.

Artalk authentication is a separate runtime concern. The comments service may
continue to use Auth0 for commenter identity; removing the site gate does not make
authenticated comment actions anonymous and does not alter the Artalk API, fork,
container or persistence design.

## Decision drivers

- Let people read the site and signup information before supplying identity data.
- Remove the access boundary itself, not add another path allowlist exception.
- Eliminate Lambda@Edge and gate SSM configuration from the site delivery path;
  keep any member allowlist scoped to explicit authenticated comments.
- Preserve private S3 origins, CloudFront TLS and caching, the public resources
  origin, the working-group interest API and Artalk's own authentication.
- Remove replicated edge resources only after CloudFront no longer associates them.
- Keep infrastructure changes CI-only and reviewable as CloudFormation.

## Considered options

### A — Add `/join` and its assets to the gate allowlist

Rejected. This would make signup reachable but retain the gate, Auth0 client, SSM
configuration, member list and deployment latency. Future public pages would need
more security-sensitive exceptions.

### B — Keep the site gate but authenticate only when the form submits

Rejected. The decision is to remove the site access gate, and the registration API
already has its own validation, bounded capacity and storage controls. Reusing the
member gate would also wrongly equate existing membership with public interest.

### C — Remove viewer authentication from the CloudFront distribution

Accepted. CloudFront continues to serve private S3 origins through OAC, but every
site route is publicly readable. Runtime services keep their own boundaries.

## Decision outcome

The OPDA site is public. The CloudFront default behavior and `/api/v2/*` comments
behavior carry no `LambdaFunctionAssociations`. The existing `/resources/*`
CloudFront Function remains because it rewrites origin paths and is not an
authentication mechanism. The working-group interest behavior remains cache
disabled and continues to forward only its deliberately minimal request surface.

The following gate-only resources and inputs are removed:

- the Lambda@Edge function, published version and IAM execution role;
- the `/opda/gate/config` SSM parameter;
- `GateFunctionVersionArn`, gate-side Auth0 client inputs and member-email inputs;
- the committed gate member allowlist and edge-gate source;
- the `us-east-1` Lambda packaging step and artifacts-bucket dependency.

The `opda-edge` stack remains in `us-east-1` as a certificate-only stack because
CloudFront still requires its ACM certificate there. The `eu-west-2` artifacts
bucket remains because the site stack still packages the nested working-group
interest Lambda application.

Auth0 remains an input to the independent comments stack and the path-scoped
session service. This ADR does not change Artalk SSO, API authorization,
SQLite/Litestream persistence, the single-writer service invariant or
comments-origin cookie stripping.

### Safe rollout order

For an existing deployment, CI must:

1. read the certificate ARN from the existing edge stack without first updating it;
2. deploy the site stack without any Lambda@Edge association or gate parameter;
3. wait for the CloudFront distribution update performed by CloudFormation;
4. reconcile the edge stack to its certificate-only template.

Lambda@Edge replica deletion is eventually consistent. If AWS has not yet released
the replicated function version when step 4 runs, the edge-stack reconciliation
may be retried later; the site is already public after step 2 and retrying does not
reintroduce the association. A new installation creates the certificate-only edge
stack before the site stack.

## Consequences

### Positive

- Every documentation and recruitment route is directly readable without an
  Auth0 redirect or pre-existing member identity.
- The highest-friction part of the hosting architecture—globally replicated
  viewer-request code and its cross-region configuration—is removed.
- Public access is one distribution invariant rather than a route allowlist.
- The static origin remains non-public at S3; CloudFront OAC is unchanged.

### Negative

- Knowledge-base HTML is now intentionally public and must not contain material
  that relies on the former gate for confidentiality.
- Removing already-replicated Lambda@Edge versions may require a later cleanup
  retry after AWS completes replica retirement.
- Existing Auth0 SPA callback configuration and the old `us-east-1` artifacts
  stack may require operator cleanup after the infrastructure change converges.
- The explicit comments session adds a small regional Lambda and HTTP API, plus
  an authorised-commenter configuration input, while public page delivery stays
  static and independent of them.

### Neutral

- Search-engine indexing and page-level publication policy are separate concerns;
  this ADR changes network access, not editorial authority.
- Artalk still authenticates commenter actions through its own Auth0 integration.
- The working-group interest API retains its independent abuse, validation,
  encryption, retention and least-privilege controls.

## Confirmation

- `config/aws/site-stack.yaml` contains no Lambda@Edge association, gate parameter
  or gate-specific Auth0/member input.
- `config/aws/edge-stack.yaml` contains only the CloudFront ACM certificate.
- `config/aws/site-stack.yaml` routes only `/_auth/*` to the regional session
  API; the default and all other API/resource behaviors carry no auth function.
- Anonymous `/_auth/me` returns cache-disabled JSON `401`, and
  `/_auth/login?return=%2Fprogramme` redirects to the configured Auth0 tenant.
- The infrastructure workflow deploys the ungated site before reconciling an
  existing edge stack and passes Auth0 inputs only to the comments stack and
  the path-scoped session application.
- Anonymous requests to representative site routes return content rather than an
  Auth0 redirect after deployment.
- Authenticated Artalk actions and public working-group registration continue to
  work through their unchanged runtime services.

## Links

- [ADR-0038](./ADR-0038-hosting-auth-and-comments-architecture-aws.md) — AWS hosting
  and comments architecture; its site-authentication clauses are superseded here.
- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md) — CI/CD sequencing amended
  by the certificate-only edge rollout.
- [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md) — public
  registration service retained without a special gate bypass.
