---
status: proposed
date: 2026-10-11
tags: [website, content-governance, review, accreditation, ownership]
supersedes: []
amends: []
depends-on: [ADR-0064, ADR-0089, ADR-0090]
implements: []
---

# Assign content owners and record website approval

## Context and Problem Statement

The 5 October call assigned Henrik modelling-website cleanup to make the material
clearer and support the process demonstration. Paul's written notes subsequently
asked what the website-update action meant. That scope needs a concrete definition.

Maria's 9 October Microsoft email, “Standards, developer and accreditation website
content”, asks the technical/accreditation groups to correct the introduction, add
existing content, name owners for placeholder pages and add missing sitemap pages.
She asks Ben and Matt for an approval control on the sitemap/copy. This is a request,
not evidence that the controls or content are implemented or approved.

Maria's email references a Darwin Labs website and SharePoint sitemap/copy. Their
contents were not inspected. They must not be assumed to be this repository's site,
or used as justification to deploy unrelated OPDA knowledge-base changes.

## Considered Options

- Treat a website deployment as collective content approval.
- Let each editor change pages without a named reviewer or common review record.
- Name page owners and record explicit approval against the relevant copy and site.

## Decision Outcome

Propose the third option. Henrik first clarifies with Paul which modelling pages,
reader problems and process examples constitute his website action. He should supply
or review technical content relevant to Maria's request after confirming the intended
site, responsible owners and the current sitemap/copy. Separate this modelling cleanup
from the broader accreditation/developer-site content programme.

Use the existing sitemap/copy as the review surface for Maria's request, with named
page owners, reviewer, content version, approval outcome and outstanding corrections.
Ben and Matt own her requested approval-control work unless reassigned. Do not
implement a parallel approval service in this repository merely because that request
appeared in an email.

Approval of copy does not approve an ontology, grant accreditation or ratify a
standard. Any later site edit or release must name its actual site/repository and
follow that project's existing delivery process. This ADR authorises no website
reorganisation or publication of the private correspondence used as evidence.

### Consequences

- Good, because page responsibilities and the meaning of “website update” are explicit.
- Good, because content approval remains separate from technical deployment and standards authority.
- Bad, because the site and current review artefacts must be confirmed before work is assigned precisely.
- Neutral, because Ben/Matt's requested control is tracked without inventing its implementation.

### Confirmation

Confirmed: Maria made the content/approval request on 9 October. Not verified: the
referenced site's current state, the SharePoint documents, assigned page owners,
approval-control delivery or completion of Henrik's modelling cleanup.

| Owner | Outstanding action | Completion evidence |
|---|---|---|
| Henrik + Paul | Define the modelling-website cleanup and its intended review audience. | Agreed pages, changes and acceptance criteria. |
| Henrik + relevant technical/accreditation reviewers | Confirm the target site and review the relevant copy. | Versioned comments and named owners for missing content. |
| Ben + Matt, as requested by Maria | Add or agree the sitemap/copy approval control. | Usable review record tied to an identified version. |
| Relevant content owners | Correct and approve their assigned pages. | Recorded outcomes and resolved or explicitly outstanding placeholders. |

## More Information

- [Call: modelling-website cleanup](https://app.fireflies.ai/view/01M45ND5QBCV7GM3ARX5ZJBB5X?t=1228)
- [Paul, Notes and Actions](https://mail.google.com/mail/u/?authuser=henrik%40sparklingideas.co.uk#all/1a110f9196fac40a)
- [Maria, website content, 9 October](https://outlook.office.com/mail/inbox/id/AAQkADk3ODRhYThjLTc4ZWMtNDA2Yy1hOWNmLTlkMjhkM2FjNGQ4MAAQALmBWrhIPaFIp%2B5Zpr7lcf8%3D)
- [ADR-0064 — modelling website and strategy publication](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
