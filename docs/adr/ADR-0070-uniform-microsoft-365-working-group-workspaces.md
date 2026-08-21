---
status: accepted
date: 2026-08-14
updated: 2026-08-21
tags: [working-groups, microsoft-365, teams, sharepoint, evidence-intake, access-control, technology-review]
supersedes: []
depends-on: [ADR-0063, ADR-0065, ADR-0067, ADR-0068]
implements: [ADR-0063, ADR-0065]
---

# Operate OPDA working groups through a uniform Microsoft 365 workspace pattern

> **Change note — 21 August 2026:** The documentation site now provides one
> public member-guide branch covering access, Teams discussions, isolated SharePoint
> intake, meetings and model review. It publishes the common operating pattern without
> exposing private workspace identifiers, rosters, redemption links or organisation
> folders. The guide labels ADR-0065 and ADR-0068 as proposed and grants no access or
> decision authority.

## Context and Problem Statement

ADR-0063 establishes six property bounded-context groups, the DBT Smart Data scheme group and
the Interoperability Working Group. ADR-0065 describes the evidence-to-model cycle first applied
to Finance and Banking: participants share authorised source material, discuss model candidates
in Teams, and review successive human-governed, AI-assisted drafts.

That method needs an operational workspace that remains manageable with hundreds of external
participants. Teams discussion and source-material intake have different visibility needs:

- working-group discussions should be visible to all invited participants in that group;
- an organisation's submitted source material must not be visible to other participating
  organisations;
- people using a generic email provider may participate in Teams, but cannot safely be granted a
  company-wide SharePoint upload area; and
- OPDA must not maintain several independent participant, company and permission lists.

Finance and Banking already implements a private Team plus a separate SharePoint source-intake
site with isolated organisation folders. When the Technology Working Group was created on
2026-08-14, its Team-connected document library was initially treated as the intake area. That
was inconsistent with the Finance pattern and exposed material to the whole working group. It was
corrected before invitations were sent: Technology now has its own standalone source-intake site
with private organisation folders. The Team-connected library remains ordinary collaboration
storage only.

This ADR records one uniform pattern for every OPDA working group and distinguishes the
cross-cutting Technology Working Group from the Property Technology bounded-context group.

## Decision Drivers

- Give every working group the same understandable participation and intake experience.
- Keep discussions open inside a group while isolating source submissions by organisation.
- Avoid public links, cross-organisation access and accidental permission delegation.
- Keep Teams useful at hundreds of participants through channels and threaded posts.
- Derive SharePoint access from the accepted Team roster and company domain, rather than maintain
  unrelated lists.
- Allow invited people with personal or generic addresses to contribute to discussions.
- Suppress Microsoft welcome messages so OPDA controls the invitation wording and timing.
- Preserve a clear distinction between modelling authority, interoperability and technical
  assurance.

## Considered Options

- **Option A — Team-connected files for all material.** Store submissions in the document library
  created with each Team.
- **Option B — One central intake site shared by every working group.** Put all organisations and
  contexts into a single SharePoint hierarchy.
- **Option C — A private Team plus a separate, per-working-group source-intake site.** Use the Team
  for shared discussion and collaboration, and use isolated organisation folders for evidence.
- **Option D — A separate external upload product.** Add Dropbox, S3 upload software or another
  service alongside Microsoft 365.

## Decision Outcome

Chosen option: **C — a private Team plus a separate, per-working-group source-intake site**.

The Finance and Banking implementation is the reference pattern. Every active working group uses
the same security and interaction model; a Team-connected document library is never the source-
intake boundary.

### 1. Working-group register and authority

The Microsoft workspaces support participation; they do not change the ownership of meaning in
ADR-0063 or activate the proposed ratification process in ADR-0068.

| Group | Role | Microsoft workspace status |
|---|---|---|
| **Finance and Banking** | Property bounded context | Implemented |
| **Conveyancing** | Property bounded context | Planned |
| **Estate Agency** | Property bounded context | Planned |
| **Surveying and Valuation** | Property bounded context | Planned |
| **Property Data Services** | Property bounded context | Planned |
| **Property Technology** | Property bounded context | Planned |
| **DBT Smart Data** | Cross-sector scheme semantics; not a property bounded context | Planned |
| **Interoperability Working Group** | Common boundary, context map, mappings and shared conventions | Planned |
| **Technology Working Group** | Cross-cutting implementation evidence and technical assurance | Implemented |

The **Technology Working Group** is not a ninth modelling context and is not the **Property
Technology Working Group**. It reviews architecture, identifiers, provenance, validation,
generated artefacts, compatibility, conformance and implementation readiness across contexts. It
does not decide a domain's business meaning, own the common boundary or ratify an OPDA Standard.
It may supply participants and evidence for the independent Technical Review envisaged by
ADR-0068, but ADR-0068 remains proposed and is not made operative by this workspace.

### 2. Microsoft 365 group and Team baseline

Each workspace uses a Microsoft 365 group and Team configured as follows:

- private membership;
- hidden from Outlook clients and address lists;
- external senders disabled;
- automatic welcome email disabled and new-member email subscription disabled;
- `smartdata@openpropdata.org.uk` and Maria Harris as owners;
- standard channels using the Posts layout so each subject can remain in a reply thread;
- channels shown by default to new members where Microsoft supports the setting; and
- no browser automation for administration: use Microsoft MCP, Graph or the approved CLI.

The group mailbox is an operational Microsoft identity, not an open mailing list. Discussion
belongs in Teams. Access requests and private administration go to
`smartdata@openpropdata.org.uk`. Controlled invitations and later operational notices are sent
separately from that account using the approved recipient register and template.

Microsoft's platform-created General channel may remain visible even when the working group uses
more specific channels. Channel membership is inherited from the Team; standard channels are not
separate permission silos.

### 3. Channel pattern

Every Team has:

- **General** — the platform-created landing channel, used for orientation and the channel
  directory and, where no separate Announcements channel is retained, official notices;
- **Common Topics and Coordination** — cross-cutting questions, shared issues and coordination
  that span contexts or concern the working group as a whole;
- one or more **discussion channels** — participants can start a post and reply, with one subject
  per post and replies kept in the existing thread; and
- optionally, **Announcements** — a separate owner/moderator notice channel where the group needs
  one, with participant posting restricted and bots and connectors disabled.

The implemented Finance and Banking channels are:

1. Announcements;
2. Mortgage Advice and Intermediation;
3. Mortgage Lending and Underwriting;
4. Mortgage Systems and Integration; and
5. Common Topics and Coordination.

The implemented Technology channels are:

1. General, for orientation, the channel directory and official notices;
2. Common Topics and Coordination, for cross-cutting technical topics;
3. Finance and Banking;
4. Conveyancing;
5. Estate Agency;
6. Surveying and Valuation;
7. Property Data Services; and
8. Property Technology.

The six context channels let the Technology Working Group review context-specific implementation
issues without confusing technical assurance with domain ownership. Future groups start with
General and Common Topics and Coordination; stable context channels are added when the group's
scope requires them, and a separate Announcements channel is retained only where it adds value.

> **Technology workspace update — 14 August 2026:** the separate Announcements channel was
> consolidated into General, its presentation-and-recording post was recreated there, and Common
> Topics and Coordination was added as the cross-cutting discussion channel.

### 4. SharePoint source-intake pattern

Every active working group receives a standalone SharePoint communication site, separate from
the Team-connected site. It contains one document library named **Incoming Source Material** and
an index folder named **By Organisation**.

The permissions are derived from the accepted Team roster:

1. normalise each accepted participant's sign-in address;
2. identify its approved company domain;
3. add the participant to the organisation index group and that domain's contributor group;
4. create one canonical company folder per approved domain; and
5. break inheritance on that folder so only OPDA administrators, processors and the matching
   company group have access.

The site is restricted to existing external users. Anonymous links and public sharing are not
allowed. A participant receives index browsing plus access to the folder for their company
domain; they do not receive SharePoint permission-management rights.

Inside its folder, an organisation may create folders and supporting documents, upload, edit,
rename, move and delete its own material. Each submission area should contain a README with an
index, provenance, version, context and any restrictions or interpretation notes. OPDA
administrators and processors can screen and organise submissions.

Other organisations cannot view the folder or its contents. The Team-connected Shared Documents
library remains visible to the whole Team and may be used for ordinary collaborative material,
but it is not an intake route for organisation-isolated evidence.

### 5. Company domains and generic-provider accounts

The company-domain rule applies only to SharePoint intake. A person invited through Gmail,
Outlook.com, Hotmail, Yahoo, iCloud or another generic provider may still join the Team and take
part in discussions and review.

OPDA does not create a folder whose permission boundary is a generic provider domain, because
that would incorrectly group unrelated users. A participant who needs upload access must use an
approved company-domain account or arrange another authorised company contributor through
`smartdata@openpropdata.org.uk`.

Domain approval is enforced through the generated Entra/SharePoint groups and unique folder
permissions, not through a tenant-wide SharePoint domain allowlist. The Team roster is the
participant authority; company groups and folders are derived operational views. They must be
reconciled after accepted membership changes so OPDA does not maintain competing source lists.

### 6. Invitation and onboarding

Provisioning and communication are separate operations:

1. OPDA approves the roster and resolves identity aliases;
2. Entra guest invitations and Team membership are provisioned without Microsoft invitation or
   welcome email;
3. applicable company-domain SharePoint access and the organisation folder are provisioned;
4. OPDA validates the Team, channels, intake tab and folder isolation; and
5. only after explicit send approval, OPDA sends one custom invitation per recipient with that
   identity's unique redemption URL.

The invitation tells the recipient to sign in using the account that received it and not to
forward the unique access URL. It links to the common **By Organisation** index; SharePoint shows
only the folders the signed-in identity may browse. Where a Source Material Intake tab is used,
it points to the same standalone library; its hosting channel is an interface choice rather than
the permission boundary. Finance and Banking currently hosts the tab in Announcements. Technology
removed its separate Announcements channel on 2026-08-14, so General is its durable directory and
notice surface and the standalone intake site remains available through its direct link.

No invitation or channel post is authorised merely by creating or updating this ADR.

### 7. Implemented workspace register

| Workspace | Team | Source-intake site |
|---|---|---|
| Finance and Banking | `5f9b7675-328a-44fd-8df7-4755096b7629` | `https://openpropertydataassociation.sharepoint.com/sites/FinanceBankingSourceIntake` |
| Technology | `286b29b1-163d-4cb5-aaec-39b1c5ceef4b` | `https://openpropertydataassociation.sharepoint.com/sites/TechnologySourceIntake` |

On 2026-08-14 the Technology intake was validated with 18 Team members, 11 company-domain areas,
no cross-organisation folder grants, restricted external sharing and a Source Material Intake
tab initially hosted in Announcements. The Announcements channel and its tab were removed later
that day when notices were consolidated into General; the standalone intake site and its access
controls were not removed. These counts are point-in-time validation evidence, not a membership
baseline. Participant identities and subsequent roster changes remain in the private operational
register, not this ADR.

### 8. Scheduled inbox operations

ADR-0072 automates the bounded membership, intake and access-support operations described here.
The automation does not create a second roster: it reads the live Team membership and derives
company-domain SharePoint access exactly as sections 4 and 5 require. Ambiguous working-group
requests produce a clarification reply, and only workspaces listed as implemented in section 7
may receive automatic writes.

Emailed attachments are an approved fallback when an authorised participant cannot use
SharePoint. They must pass the ADR-0072 file-policy gate and are stored in the same isolated
organisation folder; a successful reply is sent only after SharePoint readback. Email content is
treated as untrusted evidence and cannot alter workspace configuration or tool policy.

### Consequences

- Good, because every group has the same discussion and evidence-intake model.
- Good, because organisations can manage material inside their own area without seeing another
  organisation's submissions.
- Good, because generic-address participants can still join discussions without creating unsafe
  domain-wide SharePoint groups.
- Good, because the Team roster remains the participant authority and derived access can be
  reconciled rather than manually duplicated.
- Good, because Technology and Property Technology cannot be mistaken for the same authority.
- Bad, because each working group requires a separate SharePoint site and permission validation.
- Bad, because accepted membership changes require a reconciliation step for derived company
  groups and folders.
- Neutral, because the Team's ordinary document library remains available but is deliberately not
  the controlled source-intake area.

### Confirmation

This ADR is accepted. Finance and Banking and Technology implement the pattern; the other
workspaces remain planned until separately provisioned and validated.

For each implementation, confirmation requires:

- the group and Team settings match section 2;
- the official-notice surface is clearly identified and discussion channels use the Posts layout;
- every current channel intended for participation is visible by default where supported;
- any Source Material Intake tab targets the standalone intake site, not Shared Documents;
- every approved company folder has unique permissions and no foreign company group;
- no folder is created for a generic email-provider domain;
- a test external identity can browse the index, open its own folder, create and delete content,
  and cannot open another organisation's folder;
- the invitation HTML and text describe the actual permissions and routes;
- no Microsoft welcome email or custom invitation is sent before explicit approval; and
- the reconciliation report accounts for every accepted Team member without placing participant
  personal data in the repository.
- the scheduled inbox agent passes the ADR-0072 content, authority, plan and postcondition gates
  before it changes membership, stores evidence or sends a success reply.
- the public member guide distinguishes implemented infrastructure from group convening and
  accepted workspace rules from proposed modelling or ratification processes.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0067 — first-principles Property Pack ontology](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [ADR-0068 — proposed standards governance lifecycle](./ADR-0068-govern-opda-standards-lifecycle.md)
- [Technology Working Group invitation, HTML](../templates/technology-working-group-invitation-email.html)
- [Technology Working Group invitation, plain text](../templates/technology-working-group-invitation-email.txt)
- [Finance and Banking invitation rollout plan](../plan/2026-08-postmark-working-group-invitation-rollout.md)
- [Microsoft Graph invitation resource](https://learn.microsoft.com/en-us/graph/api/resources/invitation?view=graph-rest-1.0)
- [ADR-0072 — scheduled working-group inbox agent](./ADR-0072-scheduled-working-group-inbox-agent.md)
