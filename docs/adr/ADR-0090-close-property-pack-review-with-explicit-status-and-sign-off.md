---
status: proposed
date: 2026-10-11
tags: [property-pack, governance, review, evidence, traceability]
supersedes: []
amends: []
depends-on: [ADR-0066, ADR-0067, ADR-0075, ADR-0089]
implements: []
---

# Close Property Pack review with explicit status and sign-off

## Context and Problem Statement

The **451** is the required source-data scope of the **Property Pack**, not a count
of ontology properties or a label for every PDTF schema change. At 10:56 in the
5 October call, Paul says the task is to nail down the 451 fields of the Property
Pack. At 11:54–12:19, the speakers distinguish Maria's Property Pack status request
from the other schema work. At 43:07–43:15, they explicitly correct the expectation:
Maria needed a status update, not a declaration that the work was finished.

Maria's 1 October Teams messages requested status after the original 30 September
determination target and a hard review deadline with a final sign-off process. Her
9 October follow-up asks again about the 451 working group. Henrik subsequently
confirmed in this conversation that Maria's Thursday **8 October** meeting had
already happened and he **did not provide an update for it**. The Fireflies AI
summary's heading “Thursday status update prepared” is not evidence of delivery.

Oliver Goldwait's 4 October email also raises a 442-versus-451 required-field count
question using his v3 combined-schema calculation. That is an unresolved source/
version/counting question; it does not amend the accepted 451-item scope in ADR-0066.

## Considered Options

- Treat publication or model generation as completion and implied approval.
- Keep requesting informal feedback without a defined closing decision.
- Issue an evidence-based status and obtain an explicit review and sign-off plan.

## Decision Outcome

Propose an explicit close-out plan for the existing Property Pack candidate. Henrik
and Paul should identify the candidate version, source scope, unresolved issues,
reviewers, review deadline, decision owner and the record that will demonstrate
the determination. Confirm those assignments with the authorised group; do not
invent a replacement deadline or assume the elapsed September target was met.

Henrik should now give Maria a catch-up status update covering what is ready,
what is awaiting review, what is blocked and the proposed next decision. Record the
missed 8 October update honestly. Do not recast it as a future deadline or conflate
a status message with semantic approval, schema release or external recognition.

Maintain ADR-0066/0075's 451-item evidence boundary and first-principles modelling.
Reconcile Oliver's counting question against identified source versions and required
path rules before asserting equivalence. Use a crosswalk rather than assuming
one source field equals one ontology property.

### Consequences

- Good, because Maria can distinguish model readiness from outstanding governance.
- Good, because the review ends with a recorded determination rather than inferred consent.
- Bad, because coverage and unresolved objections must be assembled before sign-off.
- Neutral, because the original September target remains historical, not silently reset.

### Confirmation

No current model audit or final sign-off was performed by creating this ADR. The
call establishes the intended work; it does not prove delivery. This record remains
proposed until the review plan and decision rights are confirmed.

| Owner | Outstanding action | Completion evidence |
|---|---|---|
| Henrik | Send Maria the overdue Property Pack status and proposed next steps. | Sent update with candidate/version and explicit open issues. |
| Henrik + Paul | Agree how the candidate will be reviewed and signed off. | Named reviewers, agreed deadline and decision route. |
| Henrik | Check source coverage and reconcile Oliver's 442/451 question. | Versioned counting method and item-to-model crosswalk. |
| Authorised reviewers | Record the determination and any conditions or dissent. | Decision linked to the exact candidate and issue dispositions. |

## More Information

- [Call: 451 Property Pack fields](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=656)
- [Call: status update rather than completion](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=2587)
- [Paul, Notes and Actions](https://mail.google.com/mail/u/?authuser=henrik%40sparklingideas.co.uk#all/1a110f9196fac40a)
- Maria's direct Teams messages, 1 and 9 October, read during this research; no durable message link captured.
- Henrik's correction in this conversation, 11 October: no update provided for Maria's Thursday meeting.
- [Oliver, PDTF data modelling, 4 October](https://outlook.office.com/mail/id/AAQkADk3ODRhYThjLTc4ZWMtNDA2Yy1hOWNmLTlkMjhkM2FjNGQ4MAAQADlXrOJiMvlPj786UfVB8Ag%3D)
- [ADR-0066 — closed 451-item source scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0075 — accelerated Property Pack component and review sequence](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md)
