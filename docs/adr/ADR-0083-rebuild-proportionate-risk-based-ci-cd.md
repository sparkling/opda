---
status: proposed
date: 2026-09-07
tags: [ci-cd, testing, deployment, proportionality, performance, reliability]
supersedes: []
amends: [ADR-0073]
depends-on: [ADR-0040]
implements: []
---

# Rebuild proportionate risk-based CI/CD

## Context and Problem Statement

OPDA publishes a mostly static public information, participation and technical
documentation website. Its release workflow has accumulated unit contracts,
generated-file drift checks, a whole-site route and resource crawl, Chromium
installation, browser interaction tests, accessibility scans, responsive checks
and visual snapshots. Many checks are valuable, but too many run as mandatory
publication gates for every presentation or content change.

The 7 September 2026 failed release provides a measured baseline. Contracts
passed in 25 seconds. The static build took 2 minutes 54 seconds, the route and
resource crawl took 7 minutes 45 seconds, and the browser suite ran for 12
minutes before failing. Deployment never started. The same commit subsequently
built and deployed through the audited break-glass path in 5 minutes 44 seconds,
including 2 minutes 44 seconds to synchronise the 3.4 GB `dist/` tree.

The present system confuses broad verification with release safety. Exact prose,
CSS structure, screenshots and every generated route can block publication even
when the changed surface does not affect them. Repeated attempts multiply a
roughly 24-minute feedback cycle into an hour of delivery work. This contradicts
ADR-0040's accepted requirement for deterministic, proportionate releases.

ADR-0040 is accepted and implemented as the current AWS/OIDC deployment
architecture. This proposal retains that architecture. ADR-0073 is implemented,
but its statement that the complete 139-test browser matrix is a release gate is
no longer proportionate; acceptance of this proposal will amend that boundary.

## Decision Drivers

- Keep production credentials short-lived and deployment auditable.
- Preserve strong validation for ontology, schema, authentication, forms and
  infrastructure when those surfaces change.
- Publish routine editorial and presentation changes within minutes.
- Make failures local to the changed surface and straightforward to diagnose.
- Test behaviour and user outcomes rather than incidental wording or markup.
- Build a release candidate once and deploy that exact artefact.
- Keep comprehensive assurance available without making every check synchronous.

## Considered Options

- **Keep the current universal gate.** Simple policy, but slow, brittle and
  demonstrably disproportionate for routine site work.
- **Remove most automated testing.** Fast, but discards valuable evidence and
  weakens high-risk model and operational changes.
- **Use risk-based lanes with scheduled broad assurance (chosen).** Select gates
  deterministically from changed paths, retain a small common release core and
  move exhaustive sweeps out of the publication critical path.
- **Deploy every push immediately and test afterwards.** Fastest, but permits
  known broken builds to reach production and makes rollback routine.

## Decision Outcome

Adopt a change-aware pipeline with four validation lanes and one scheduled
assurance workflow. A deterministic classifier owns lane selection; tests do not
infer their own importance at runtime.

### Lane 1 — editorial and presentation

Applies to prose, images, non-interactive styles and page composition. Required
checks are dependency installation, the static build, generated-design manifest
consistency, changed-route link validation and a maximum of five critical browser
smokes covering the homepage, navigation, join page, search and one technical
document. Exact copy, DOM nesting and broad screenshot baselines are not gates.

Target: production publication at p95 within 8 minutes of a `main` push.

### Lane 2 — application behaviour

Applies to shared components, client scripts, authentication, search, forms and
serverless handlers. It adds focused unit/contract tests and browser journeys
mapped to the affected component. Security-sensitive boundaries retain negative
tests. Unrelated route families and visual snapshots do not run.

Target: pull-request feedback at p95 within 10 minutes.

### Lane 3 — ontology and generated data

Applies to ontology sources, generator code, schemas, mappings and committed
projections. It retains Jena/SHACL validation, generator tests, BASPI5 round-trip,
schema reproducibility, byte identity and generated-model drift. It builds the
site once after those checks and then runs the small critical browser smoke.

Target: complete evidence rather than editorial-lane speed, with p95 below 25
minutes and no duplicated model generation.

### Lane 4 — infrastructure and deployment

Applies to CloudFormation, IAM, AWS workflows and runtime service definitions.
It validates templates and security boundaries independently of the site browser
suite. Site content tests cannot block an infrastructure-only change unless the
change modifies the hosting contract used by the site.

### Scheduled assurance

A nightly workflow runs the complete route/resource crawl, broad WCAG sampling,
all supported viewport checks and a small, curated visual-baseline set. External
link checks run weekly because they depend on third parties. Failures create a
tracked issue or alert and block promotion of the affected test to a release gate
until it is stable; they do not retroactively redefine a deployed release.

### Test policy

Every existing test is assigned exactly one owner and one tier:

1. release blocking — protects a user-visible critical journey or system boundary;
2. pull-request blocking — focused evidence for the changed component;
3. scheduled assurance — broad, slow or externally variable inspection;
4. development aid — useful locally but not authoritative; or
5. delete — duplicates another test or asserts incidental implementation detail.

Tests must assert stable behaviour. Assertions over exact editorial prose,
unimportant CSS declarations, generated page counts and large page screenshots
are removed or narrowed unless the value is itself a governed contract. A flaky
test is moved out of the release tier immediately; retries may collect evidence
but may not disguise instability.

### Artefact and deployment policy

The selected lane produces one immutable `dist/` artefact with the source commit
recorded in its manifest. Deployment downloads that artefact, assumes the
existing OIDC role, synchronises S3 and invalidates CloudFront. It never rebuilds.
The break-glass workflow remains available for an explicitly confirmed,
auditable release when the normal classifier or gate is defective.

The 3.4 GB output is investigated separately. Large source renderings and media
that do not need to ship with every release move to versioned resource storage;
images receive responsive derivatives. The target is a routine site artefact
below 500 MB without deleting public resources or breaking stable URLs.

### Migration Plan

1. **Baseline and classify (one day).** Record median and p95 duration, failure
   rate and artefact size for recent runs. Inventory every test and assign its
   owner, tier, protected behaviour and relevant path set.
2. **Create the fast lane (two days).** Extract build-and-deploy into a reusable
   workflow, implement the deterministic change classifier and replace the full
   browser gate with the five critical smokes for editorial changes.
3. **Split focused suites (two to four days).** Divide the monolithic Node and
   Playwright commands by component and risk. Remove duplicate and incidental
   assertions. Keep ontology and infrastructure suites independently callable.
4. **Move breadth off the critical path (one day).** Add nightly and weekly
   assurance schedules with retained artefacts and issue/alert reporting.
5. **Reduce the release artefact (two to four days).** Produce a size report,
   move heavyweight archives behind stable resource URLs and add responsive
   image generation and cache-friendly immutable names.
6. **Observe for two weeks.** Compare timings, false failures, escaped defects
   and break-glass use. Promote a scheduled test only with evidence that it is
   stable, material and cheaper than the failure it prevents.
7. **Retire the old graph.** Delete obsolete workflow paths and update ADR-0040,
   ADR-0073, README commands and branch-protection checks to the implemented
   names. Mark this ADR implemented only after the confirmation criteria pass.

### Consequences

- Good, because routine website releases should approach the measured 5–6 minute
  build-and-deploy time rather than the current 24-minute failed-gate cycle.
- Good, because ontology and operational risks keep their specialised evidence.
- Good, because failures identify the affected surface instead of presenting a
  large unrelated browser report.
- Good, because broad accessibility and route assurance remains automated.
- Bad, because the path classifier becomes release-critical code and needs small,
  explicit tests of its own.
- Bad, because scheduled failures require ownership and triage rather than simply
  blocking every release.
- Neutral, because break-glass deployment remains possible and auditable; this
  proposal aims to make its use exceptional again.

### Confirmation

This ADR remains proposed until the operator accepts it. Implementation is
complete only when all of the following are demonstrated over at least ten
ordinary releases:

- editorial-lane p95 publication time is 8 minutes or less;
- application-lane p95 feedback time is 10 minutes or less;
- no release candidate is built more than once;
- every test has an owner and tier, with zero unclassified release tests;
- routine releases contain no whole-site crawl or broad screenshot gate;
- ontology-input changes still execute all model and reproducibility evidence;
- the deployed commit and artefact identity are visible in the run record;
- the ordinary release artefact is below 500 MB, or a documented exception names
  the retained large resources and their owner; and
- no escaped severity-one or severity-two defect is attributable to a removed
  gate during the observation period.

Rollback is one workflow-file revert: restore the prior universal dependency
graph while retaining the break-glass path. AWS hosting, OIDC trust, S3 exclusions
and CloudFront invalidation are unchanged by this proposal.

## More Information

- [ADR-0040](./ADR-0040-aws-hosting-ci-cd-pipeline.md) defines AWS hosting,
  GitHub OIDC and exact-artefact deployment.
- [ADR-0073](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
  defines the current design-system and browser-test boundary that this proposal
  narrows.
- Release evidence: GitHub Actions run `34102667225` failed after approximately
  24 minutes; break-glass run `34105283581` deployed commit `1a38bcbb` in 5 minutes
  44 seconds on 7 September 2026.
