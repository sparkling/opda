---
status: proposed
date: 2026-10-11
tags: [ontology, pdtf-schema, governance, compatibility, migration, training]
supersedes: []
amends: []
depends-on: [ADR-0039, ADR-0065, ADR-0068, ADR-0077, ADR-0089]
implements: []
---

# Ratify an ontology-first schema-change and migration process

## Context and Problem Statement

The 5 October call distinguishes the existing schema-first GitHub pull-request
process from the intended future flow: ontology proposal, human review and approval,
then generation and release of a schema. Paul asked Henrik to use the outstanding
PRs as a worked example and training package. Treating their content as hypothetical
approved input for an exercise was not permission to approve or merge them.

Paul said other knowledgeable technical subgroup members should approve the current
PRs. Henrik should not click approve without the necessary context. The new process
needs subgroup ownership and sign-off so it does not depend on Henrik continuing
as modeller. Compatibility and cutover must also be agreed by the wider technology
team; the call did not settle a migration design or transition duration.

Rick Saville's 8 October email proposes comparing LMS's modular PDTF schemas against
ontology outputs. This is concrete evidence for the transition exercise, not proof
that either the modular schema or a generated replacement has been adopted.

## Considered Options

- Continue schema-first changes indefinitely.
- Switch immediately to generated schemas on the modeller's authority.
- Demonstrate and ratify ontology-first changes, with explicit transition controls.

## Decision Outcome

Propose the third option. Henrik prepares the workflow and a worked example using
identified PRs: source request, semantic impact, proposed ontology change, review,
draft schema generation, validation, independent approval and versioned release.
Show the exact artefacts and approval boundaries; draft generation is not release.

The internal technical subgroup should own the process and record its approval
before cutover. Paul convenes the review and obtains current PR reviews from the
appropriate members. Existing PR handling remains under the existing process until
an authorised transition decision says otherwise.

Henrik and Rick should compare modular schema outputs and ontology-derived outputs,
recording structural differences, semantic coverage, constraints and mappings.
The technology team then determines compatibility obligations, any adapters,
coexistence period, deprecation criteria and release responsibility. Do not promise
byte-identical schemas, automatic equivalence or a painless migration without evidence.
Preserve ADR-0077's distinction between the third-party PDTF input, its technical
derivation and the collaboratively authored SPDTF candidate.

### Consequences

- Good, because the proposed process is understandable and owned by its human reviewers.
- Good, because real PRs and LMS material make compatibility differences testable.
- Bad, because generation and migration need evidence beyond a convincing demonstration.
- Neutral, because this proposal does not approve current PRs or retire existing schemas.

### Confirmation

No generation implementation, PR approval, merge, migration or process ratification
is claimed here. Rick offered Tuesday or Friday the following week, 09:00–11:00;
Henrik replied that Tuesday works. The read thread does not confirm a time.

| Owner | Outstanding action | Completion evidence |
|---|---|---|
| Henrik | Prepare process documentation and a PR-based demonstration/training package. | Versioned example reviewed by the technical subgroup. |
| Henrik + Rick | Confirm a meeting time and compare the modular PDTF with ontology outputs. | Agreed time, identified input versions and recorded differences. |
| Paul + appropriate reviewers | Review existing PRs and convene process sign-off. | PR reviews and a recorded process decision. |
| Technology team, with Henrik supplying analysis | Choose and approve the compatibility/cutover approach. | Tested migration proposal and explicit approval. |

## More Information

- [Call: future ontology-to-schema direction](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=752)
- [Call: ownership and training](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=1098)
- [Call: PR reviews and process ratification](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=2669)
- [Call: migration is a technology-team decision](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=2780)
- [Paul, Notes and Actions](https://mail.google.com/mail/u/?authuser=henrik%40sparklingideas.co.uk#all/1a110f9196fac40a)
- [Rick, comparison of ontology outputs and modular PDTF, 8 October](https://mail.google.com/mail/u/?authuser=henrik%40sparklingideas.co.uk#all/1a11b461c3106eed)
- [ADR-0077 — PDTF as a third-party input](./ADR-0077-place-pdtf-schema-beneath-spdtf-as-third-party-input.md)
