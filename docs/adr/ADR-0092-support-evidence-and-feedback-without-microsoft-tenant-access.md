---
status: proposed
date: 2026-10-11
tags: [working-groups, evidence-intake, comments, accessibility, provenance]
supersedes: []
amends: []
depends-on: [ADR-0065, ADR-0070, ADR-0085, ADR-0087, ADR-0091]
implements: []
---

# Support evidence and feedback without Microsoft tenant access

## Context and Problem Statement

Paul described Lloyds' restrictions on accessing another organisation's Microsoft
tenant in the 5 October call. At 17:20–17:42 the speakers explicitly require an
external participant to be able to contribute through the knowledge base without
OPDA tenant access. Participation remains controlled: anybody may apply, but
application, approval, access and standards decision authority are distinct.

Mortgage correspondence supplies a concrete example. Lauren Fuller sent NatWest's
purchase/remortgage data dictionary on 14 August because corporate restrictions
prevented direct upload. The mailbox reply on 15 August says it was received and
added to NatWest's organisation area. On 19 August Lauren supplied an illustrative
JSON payload with fictional details, with permission to share that example. This
does not imply permission to publish every submitted artefact or that a JSON Schema
was supplied. The spreadsheet's contents and its current SharePoint location were
not independently inspected during this research.

Other emails ask to invite Jammjar's Karl Griffin and YBS/Accord's Chris Hill.
Invitations and access confirmations do not establish that a schema was received
or incorporated. Maria's 9 October Teams message asks for the mortgage submission
status, making those distinctions necessary for the next update.

## Considered Options

- Require Teams and SharePoint access for every contribution.
- Keep email contributions informal and report invitations as engagement progress.
- Use knowledge-base feedback and an email intake fallback with traceable dispositions.

## Decision Outcome

Propose the third option, reusing the existing website comments and intake services.
Approved participants should be able to suggest model changes through the knowledge
base without redeeming an OPDA Microsoft guest account. Email should remain a route
for authorised material when corporate restrictions block the usual upload path.
Confirm the website's actual access behaviour before calling this route operational;
the call describes the requirement rather than proving tenant-independent access.

Preserve ADR-0070's organisation-isolated source-material boundary. Internal shared
documents and knowledge-base discussion do not become a public source-material
library. Record the source, date, allowed use, artefact version, storage location,
review state and model disposition using the existing source/intake records rather
than creating a competing evidence register. A receipt, upload, review and model
incorporation are separate states.

Henrik should reconcile the Finance and Banking submissions against existing intake
records and model provenance before reporting to Maria. Verify both NatWest items,
check whether Jammjar and other invited contributors actually submitted material,
and explicitly record unavailable or unreviewed items. Do not copy confidential
submissions into cross-project memory or assume an invitation grants publication rights.

### Consequences

- Good, because corporate access restrictions no longer exclude domain expertise.
- Good, because mortgage progress can be reported as received, reviewed and incorporated.
- Bad, because email intake requires manual provenance and permission checks when automation cannot supply them.
- Neutral, because this record specifies the access requirement without redesigning authentication.

### Confirmation

Confirmed by read correspondence: NatWest emailed a dictionary and later a fictional
JSON example; the mailbox acknowledged storing the dictionary. Not verified: current
storage, spreadsheet contents, model incorporation, other contributors' submission
completeness or website participation without an OPDA Microsoft account.

| Owner | Outstanding action | Completion evidence |
|---|---|---|
| Henrik | Reconcile mortgage source material, including both NatWest contributions. | Existing intake entries linked to artefacts, permissions and dispositions. |
| Henrik | Report received/reviewed/incorporated/pending states to Maria. | Status update that distinguishes evidence from invitations. |
| Henrik + technical subgroup | Verify the non-Microsoft feedback route and document the email fallback. | An approved participant can submit feedback without tenant access; handling is traceable. |

## More Information

- [Call: knowledge-base participation](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=904)
- [Call: no Microsoft tenant dependency](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=1040)
- [NatWest Data Dictionary thread, 14–19 August](https://outlook.office.com/mail/id/AAQkADk3ODRhYThjLTc4ZWMtNDA2Yy1hOWNmLTlkMjhkM2FjNGQ4MAAQABTbZMxo0E8ehF9jeVPTQ0c%3D)
- [Maria, Jammjar mortgage modelling contribution request](https://outlook.office.com/mail/id/AAQkADk3ODRhYThjLTc4ZWMtNDA2Yy1hOWNmLTlkMjhkM2FjNGQ4MAAQADuWSPbTMN5Jv035rejB%2BHk%3D)
- [Maria, add Chris Hill, 15 September](https://outlook.office.com/mail/id/AAQkADk3ODRhYThjLTc4ZWMtNDA2Yy1hOWNmLTlkMjhkM2FjNGQ4MAAQAFYper4aQLtCk6WYAilCW6Y%3D)
- Maria's 9 October direct Teams message, read during this research; no durable message link captured.
- [ADR-0070 — isolated source intake](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [ADR-0087 — submission acknowledgements](./ADR-0087-acknowledge-every-submission-independently-of-the-crm.md)
