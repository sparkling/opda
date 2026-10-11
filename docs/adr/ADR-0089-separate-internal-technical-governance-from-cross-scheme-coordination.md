---
status: proposed
date: 2026-10-11
tags: [governance, working-groups, teams, decision-rights]
supersedes: []
amends: []
depends-on: [ADR-0063, ADR-0068, ADR-0070]
implements: []
---

# Separate internal technical governance from cross-scheme coordination

## Context and Problem Statement

The 5 October Paul/Henrik call distinguished OPDA's internal technical subgroup
from the wider DPMSG technology coordination group. Confusion about their purposes
was obstructing decisions on the Property Pack and PDTF schema. Paul described the
internal subgroup as responsible for schema approvals, chaired by Cong and Nigel.
The wider group's purpose was described provisionally and still needed Maria's
confirmation. Neither group should be confused with the Property Technology domain
working group in ADR-0063.

Paul's 6 October action email assigned him the internal workspace and clarification
with Maria. His 7 October reply confirmed workspace creation. Teams inspection found
**OPDA Tech (member) Working Group**, with **General Comms**, **Documents** and
**PDTF Standard** channels. General Comms describes monthly meetings before the OPDA
executive meeting; Documents contains commented Terms of Reference and roadmap drafts.
Those documents were located, but their contents and approval status were not reviewed.

## Considered Options

- Use one technology group for internal approvals and cross-scheme coordination.
- Maintain separate groups with an explicit purpose and authority statement for each.
- Leave the distinction implicit in invitations and individual explanations.

## Decision Outcome

Propose separate, documented purposes and decision boundaries, using the internal
workspace Paul has already created. Document membership, chairs, deliverables,
review responsibilities and escalation separately from cross-scheme coordination.
Paul and Maria must confirm the wider group's remit before it is described as settled.

Creating a Team, uploading draft Terms of Reference or inviting participants does
not itself establish delegated standards-ratification authority. ADR-0068 remains
proposed; this record does not adopt that entire lifecycle or alter constitutional
authority. Reuse ADR-0070's collaboration pattern without moving private source
submissions into the internal Team's shared Documents channel.

### Consequences

- Good, because participants know where to discuss internal releases and wider alignment.
- Good, because the existing workspace is reused rather than duplicated.
- Bad, because purpose statements and hand-offs still need explicit confirmation.
- Neutral, because observed workspace setup is distinct from approval of this proposal.

### Confirmation

Observed: Paul confirmed setup on 7 October and the three channels were inspected.
Not established: adopted Terms of Reference, the wider group's confirmed remit, or
approval of this ADR. The dated monthly meeting and weekly catchup invitations show
scheduling, not that a governance or ratification session has taken place.

| Owner | Outstanding action | Completion evidence |
|---|---|---|
| Paul, with Maria | Confirm the wider technology group's purpose and post the distinction. | Agreed purpose statement and link to its owning group. |
| Paul / chairs | Confirm the internal group's authority and Terms of Reference status. | Recorded decision and approved document version. |
| Henrik | Align process/training material with the confirmed responsibilities. | Material reviewed by the internal subgroup. |

## More Information

- [5 October call, group distinction](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=51)
- [Paul, Notes and Actions, 6–7 October](https://mail.google.com/mail/u/?authuser=henrik%40sparklingideas.co.uk#all/1a110f9196fac40a)
- Teams: Paul, General Comms announcement, 7 October; channel inspection during this research. No durable message link was captured.
- [Terms of Reference draft located in Documents](https://openpropertydataassociation.sharepoint.com/sites/OPDATechmemberWorkingGroup/Shared%20Documents/Documents/Terms%20of%20Reference%20(with%20PA%20and%20MH%20comments).docx)
- [ADR-0070 — working-group workspace pattern](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [ADR-0068 — proposed standards lifecycle](./ADR-0068-govern-opda-standards-lifecycle.md)
