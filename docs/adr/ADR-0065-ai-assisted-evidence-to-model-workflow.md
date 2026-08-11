---
status: proposed
date: 2026-07-19
updated: 2026-08-11
tags: [ai, ontology, working-groups, evidence, governance, review, provenance, standards-development, human-governance]
supersedes: []
depends-on: [ADR-0027, ADR-0039, ADR-0063, ADR-0064, ODR-0001]
implements: []
---

# AI-assisted evidence-to-model workflow with human-governed review

## Context and Problem Statement

ADR-0063 establishes domain-led working groups and makes subject-matter experts
responsible for domain meaning. Most participants will not be ontology engineers, and
many will be more comfortable with forms, documents, diagrams, business rules and
examples than with RDF, OWL, SKOS or SHACL.

Those familiar tools usually expose data as a document or form-shaped tree. An
ontology expresses the connected business meaning as a graph. Participants need a
plain-language explanation of that distinction, but they do not need to learn graph
technology: OPDA can generate and publish schemas and human-readable documentation
from the governed ontology through tested transformations.

Asking those participants to model an ontology directly would narrow participation and
spend workshop time on notation rather than meaning. Asking a modeller to translate all
feedback manually would create a bottleneck and make it difficult to publish revised
drafts quickly.

OPDA already has an AI Linked Data Council method for evidence-grounded ontology
deliberation. The next phase can extend that capability into a working-group workflow:
stakeholders provide the evidence and judgement; a council of AI agents proposes a
coherent semantic package; and the group challenges successive candidate models until
one is stable enough to publish as the official first draft. Human authority over any
later normative release remains unchanged.

The method must avoid the opposite failure: treating generated content as authoritative
because it was produced quickly or by several models. AI output remains a proposal.
Sources, assumptions, disagreements and review outcomes must remain visible.

The detailed operating model, risks and stakeholder responses are recorded in
[the supporting research note](../research/ai-assisted-working-group-method.md). The
July 2026 presentation and meeting application is recorded in
[the presentation plan](../plan/2026-07-exec-and-finance-banking-presentations.md).

## Decision Drivers

- Let domain experts contribute through the materials and language they already use.
- Increase the speed at which evidence and feedback become reviewable model drafts.
- Use multiple models and expert perspectives to challenge modelling choices.
- Preserve source provenance, uncertainty, dissent and version history.
- Keep accountability with people and reserve any later approval for separately
  defined OPDA governance.
- Make the process understandable to non-technical participants.
- Give participants clear, low-friction channels for sharing sources, asking
  questions and reviewing candidate models.
- Produce formal semantic outputs without making ontology syntax the workshop
  interface.
- Support familiar implementation artefacts so vendors do not need to adopt linked
  data or AI to participate.
- Prefer structured and text-based evidence, including transcripts; accept audio or
  video only when necessary and with explicit consent and appropriate
  information-handling controls.

## Considered Options

- **Option A — Direct collaborative ontology authoring.** Working-group members and
  facilitators edit the model together during meetings.
- **Option B — Single-pass AI generation.** Give the source corpus to one model, publish
  its output and ask the group to approve it.
- **Option C — Human-led, AI-assisted evidence-to-model cycle (chosen).** Stakeholders
  provide evidence and decisions; a governed council of agents and models proposes and
  critiques drafts; drafts are published in accessible form; feedback is incorporated
  visibly; and humans retain authority under a governance mechanism defined separately.

## Decision Outcome

Chosen option: **Option C — a human-led, AI-assisted evidence-to-model cycle.**

The operating principle is:

> **People supply domain knowledge and judgement. AI accelerates modelling. People
> review and govern the result.**

### 1. Stakeholder contribution

Working-group participants are not asked to author ontology code. They contribute:

- existing standards, JSON Schemas, API definitions, database schemas, mappings and
  reference models;
- policies, guidance, contracts and regulatory material;
- forms, documents, spreadsheets and representative data;
- process diagrams, screenshots and transcripts;
- audio or video only when a useful transcript cannot reasonably be supplied or the
  recording itself provides necessary evidence;
- business definitions, rules, scenarios, edge cases and counterexamples;
- authoritative-source and provenance expectations;
- feedback on diagrams, descriptions, examples and validation outcomes.

The initial priority is breadth of evidence. OPDA will collect as many relevant
resources as participants can supply before asking the group to converge on model
decisions. The intake mechanism and access rules must be communicated to participants
before collection begins.

Preferred intake formats include JSON, YAML, XML/XSD, CSV/TSV, spreadsheets,
non-production SQL/DDL, OpenAPI/Swagger/AsyncAPI, GraphQL schemas, RDF/OWL/JSON-LD,
PDF, Word, Markdown, plain text, diagrams and common image formats. Transcripts should
normally be supplied as plain text, Markdown, Word, PDF, VTT or SRT. Credentials,
connection details, executable content and live personal or transaction data remain
excluded.

External links are not accepted as source submissions, and OPDA will not follow them.
Contributors must upload or export the material itself when their organisation is
authorised to share it. Citations within uploaded material may remain for provenance,
but they do not substitute for submitting the source.

### 2. Participation and communication surfaces

The Finance and Banking group uses an invitation-only **Microsoft Team** as its
communication hub. Its standard channels are:

- **Announcements** for official notices from the working-group leads; other
  participants cannot start posts or reply;
- **Common Topics and Coordination** for cross-cutting questions, coordination and
  whole-model review;
- **Mortgage Advice and Intermediation** for adviser, broker, network, fact-find,
  suitability, sourcing, consent and application-preparation topics;
- **Mortgage Lending and Underwriting** for eligibility, affordability, underwriting,
  valuation, offer, condition, drawdown and lender-decision topics;
- **Mortgage Systems and Integration** for platforms, sourcing, APIs, schemas, status
  exchange, implementation and integration.

Discussion is thread-first so that hundreds of participants do not turn the channels
into an unstructured stream:

- participants reply to an existing thread whenever it covers the subject;
- OPDA starts threads for candidate models, evidence requests and specific questions;
- a participant starts a new post only for a distinct question, ambiguity, conflict,
  evidence gap, correction or model issue that is not already being discussed;
- each new post has a clear subject and covers one issue;
- participants do not create a Teams post merely to announce an upload.

A dedicated **SharePoint source-intake area** is the evidence-submission route. Each
approved company domain has a private company folder. Its contributors may organise
that folder, create, upload, edit, rename, move and delete its contents, but they cannot
see another organisation's material, change permissions or make material public. A
top-level README provides an index and enough context to interpret the submitted
material.

The dedicated **OPDA working-group email address** supports additional invitations,
access problems and administration. It is not a submission route, mailing list or
parallel discussion channel. Substantive group discussion stays in Teams.

Invitation delivery is separated from access provisioning:

- OPDA creates or reuses each external Entra identity through the Microsoft Graph
  invitation flow with `sendInvitationMessage` set to `false`;
- the unique `inviteRedeemUrl` is retained in an access-controlled operational
  manifest and is never placed in a shared document, channel or reusable template;
- OPDA adds the resulting identity to the Team's backing Microsoft 365 group and,
  for approved company-domain accounts, the correct SharePoint company and index
  groups;
- the Team's automatic welcome email remains disabled;
- after a separately approved send step, OPDA sends its own recipient-specific HTML
  message from `smartdata@openpropdata.org.uk`, containing the same participation,
  channel, source-material and access guidance as the canonical announcement; and
- personal or generic-provider accounts may participate in Teams but do not receive
  SharePoint intake access.

The [custom invitation email template](../templates/finance-banking-working-group-invitation-email.html)
uses the recipient's individual access URL and renders the same guidance for every
recipient. It explains that the company-domain restriction applies to SharePoint
uploads, not to Teams participation. Brand images are included as CID inline
attachments rather than externally loaded resources so the message does not depend on
the recipient enabling remote images. Creating access never implies approval to send
the custom email.

The modelling website publishes candidate models and their documentation. A planned
**web bulletin-board discussion system**, similar to Discourse, will let reviewers
discuss relevant model pages in context. SharePoint resources, Teams threads, future
web discussions and other feedback become governed inputs to the same
evidence-to-model cycle.

#### Finance and Banking access rollout — 29 July 2026

The first full access rollout provisioned 369 roster entries. All roster identities
were validated as members of the private Team.
The 365 company-domain roster entries were assigned to 151 isolated SharePoint
organisation areas; four generic-provider entries were deliberately limited to Teams.
The two Leek domains in the roster were treated as one organisation area because
`leekbs.co.uk` is the current domain for Leek Building Society and
`leekunited.co.uk` redirects to it.

Later additions were provisioned through the same silent-invitation workflow. The
current validated totals are 370 roster entries, 370 unique Entra identities, 366 company-domain entries
across 152 isolated SharePoint organisation areas, and four generic-provider entries
limited to Teams.

Validation checked Team identity membership, company-group membership, unique folder
permissions, the no-sharing contributor role, absence of cross-company folder grants,
the SharePoint index, and empty generic-provider SharePoint groups. The rollout
requested zero Microsoft invitation emails. On 29 July, OPDA reset the pilot guest's
redemption status without changing its identity or memberships, sent explicitly
approved custom test emails while iterating the invitation template, verified their
rendered content, sender identity and individual redemption links in Gmail, confirmed
that its CID-embedded logo renders without Gmail's external-image prompt, and completed
redemption successfully during the first test. OPDA then sent 367 custom invitation
messages through Microsoft Graph; the private operational ledger records HTTP 202
acceptance for each request. Participant reports indicate that many messages were not
received, so the staged Postmark rollout is an intentional second delivery attempt.
Wave 1 sent 50 recipient-specific Postmark invitations on 5 August. Postmark later
reported all 50 as `Sent`, with no bounce, complaint or Broadcast suppression recorded
when reconciled on 11 August. Wave 2 is scheduled for 100 recipients at 10:00
Europe/London on 12 August under the controls in the
[rollout plan](../plan/2026-08-postmark-working-group-invitation-rollout.md). The
Postmark population comes from the existing not-accepted mailing list, intersected
with live acceptance and suppression state, and each result is recorded in a private
append-only wave ledger. This Finance and Banking roster is not a recruitment template
for later working groups, which will use a social-media campaign and explicit sign-up.

### 3. Governed capture

Transcripts are the preferred working evidence for meetings and recorded material.
Audio or video may be retained as modelling evidence only when a transcript cannot
reasonably be supplied or the original recording adds necessary evidence, and only
when participants have been informed and consent has been obtained. A transcript
should identify its date, speakers and context where known. Website discussions and
project channels may also become inputs when their expected use and retention are
clear.

Every ingested item must retain sufficient provenance to answer:

- who or what organisation supplied it;
- what type of source it is and when it applied;
- whether it is authoritative, illustrative or disputed;
- what access, confidentiality, retention or reuse restrictions apply;
- which draft propositions and decisions rely on it.

Sensitive or restricted material must not be placed in a public model-review surface.
The programme must agree an information-handling profile before collecting it.

### 4. AI ontology council

The modelling facilitator supplies the governed evidence corpus to a council of AI
agents. The council may use:

- different named expert perspectives grounded in their published work;
- different large language models;
- specialised roles for ontology, vocabulary, validation, provenance, privacy,
  temporal and interoperability review;
- a devil's-advocate role to challenge scope, assumptions and premature equivalence.

The council proposes the ontology and related outputs, records contested points and
links material claims to evidence. Named perspectives are reasoning lenses, not claims
that the real people participated in or endorsed a draft.

The detailed ODR-0001 council rules remain applicable to formal ontology decisions.
Routine extraction, drafting and feedback incorporation should use proportionate
review rather than convening a full formal council for every edit.

### 5. Draft and review cycle

Each modelling increment follows this lifecycle:

1. collect and classify a broad corpus of participant resources, subject to agreed
   evidence-handling conditions;
2. use those resources, existing OPDA work and the group's initial scope to frame
   competency questions and identify evidence gaps;
3. let the modelling facilitator and AI council propose and challenge the first
   candidate semantic package;
4. run automated consistency, validation, provenance and source-coverage checks;
5. once the redesigned review surface is available, publish the candidate through the
   website and announce it in Teams, using diagrams, definitions, examples, glossary,
   dictionary, vocabularies, validation outcomes and unresolved questions;
6. collect stakeholder comments in business language through Teams threads and, once
   available, discussions attached to the model website;
7. record how each material comment was accepted, rejected, deferred or clarified;
8. ingest feedback, discussions and additional resources and publish a new candidate
   with visible changes;
9. repeat until the group considers the model stable enough to publish as its official
   first draft.

This is inspired by the visible, iterative development of W3C standards. OPDA must not
describe its process as W3C endorsement or imply that every W3C procedural rule is
adopted.

OPDA has not yet defined the consensus threshold or resolution and escalation
mechanisms for disputed model decisions. Those mechanisms are deliberately deferred
while the group concentrates on evidence collection and candidate-model iteration.
“Official first draft” means the first stable, reviewed programme draft; it does not
mean that the model is final, normative or ratified. A further governance decision is
required before any later release is described as approved or adopted.

### 6. One semantic package

The cycle maintains the six content outputs required by ADR-0063 as consistent parts
of the same agreement: the business glossary, data dictionary, taxonomies, controlled
vocabularies, resources and relationships. It publishes them as an RDF ontology,
generated JSON Schemas, website/PDF/Markdown documentation and, where useful, an
optional ontology-to-schema mapping runtime.

The AI council also assesses all eleven OPDA ontology dimensions. A draft is incomplete
until each dimension is recorded as `model here`, `reuse shared`, `boundary
contribution` or `not applicable` with a rationale.

### 7. Familiar downstream artefacts

The ontology is the governed semantic source, not the only format stakeholders must
use. With tested generators, templates and transformation rules, it can support:

- JSON Schemas and APIs;
- forms and user interfaces;
- web pages, documents, PDFs and emails;
- validation services;
- code, database and integration artefacts;
- an optional runtime that applies governed ontology-to-schema mappings and validation.

This is a model-driven engineering direction, not a claim that the ontology alone
automatically produces correct artefacts. Each generator needs an explicit contract,
tests and release controls. Participants and vendors may keep using familiar
technologies and are not required to operate AI systems.

### 8. The reinforcing AI cycle

The strategic relationship is:

> **AI → ontology → better AI**

AI accelerates the conversion of heterogeneous stakeholder evidence into a governed
model. The resulting ontology gives later AI systems explicit terminology,
relationships, constraints, provenance and context, improving grounding,
interoperability, explainability and reuse. The ontology also benefits non-AI
implementations, so the value case does not depend on every stakeholder adopting AI.

### 9. Working cadence

Meetings focus on scope, evidence, decisions, contested meanings and review. Much of
the formal modelling happens between meetings. New website deployments should make the
result of each feedback cycle visible quickly enough to sustain participation.

Teams threads are the day-to-day discussion record. Participants reply to an existing
thread wherever possible and use a new post only for a genuinely new issue. SharePoint
READMEs carry upload-level inventory and interpretation context, so uploads do not
generate a parallel stream of Teams posts. The working-group email address is an
invitation, access and administration route, not a submission route or discussion
list. Once available, the web bulletin board provides page-specific discussion without
displacing Teams as the communication hub.

The current website remains a demonstration of possible review interactions until the
coherent redesign required by ADR-0064 is approved. Candidate Finance and Banking
models must be clearly separated from the current schema-derived model when they are
published on `opda.org.uk`.

### Consequences

- Good, because people can contribute without learning ontology languages.
- Good, because multimodal evidence and feedback can become drafts more quickly.
- Good, because multiple agents, models and adversarial roles reduce dependence on one
  model's framing.
- Good, because source provenance and visible feedback disposition make generated
  proposals reviewable.
- Good, because familiar schemas, forms and integrations remain supported outputs.
- Good, because the ontology improves future AI while retaining value for non-AI
  users.
- Bad, because model diversity does not eliminate shared training-data errors or
  hallucinations; evidence gates, automated checks and human review remain mandatory.
- Bad, because recording, transcription and broad evidence ingestion create privacy,
  confidentiality and retention risks.
- Bad, because rapid revisions can exhaust reviewers unless increments are bounded and
  changes are presented clearly.
- Bad, because consensus and dispute-resolution mechanisms remain open and must be
  decided before the first normative release.
- Bad, because model-driven generation can be over-sold before generators and tests
  exist; capability claims must distinguish built, partial and planned work.
- Neutral, because final authority remains with existing OPDA governance rather than
  the AI council.

### Confirmation

- Every working-group charter names its evidence intake, information-handling rules
  and review channels; the later approval route is added once OPDA has decided its
  consensus and resolution mechanisms.
- Finance and Banking communications list all five Team channels, identify threaded
  replies as the expected practice, explain when a new post is appropriate, and direct
  cross-cutting and domain-specific discussion to the right channel.
- Finance and Banking communications identify SharePoint as the source-intake route,
  require a top-level README, and describe the company-folder access boundary
  accurately.
- Finance and Banking communications identify the group email as an invitation,
  access and administration route rather than a submission route or mailing list, and
  describe the web bulletin board as planned rather than already operational.
- Every published draft identifies its version, sources, unresolved questions and
  material changes from the previous draft.
- Every material feedback item has a visible disposition.
- AI-generated propositions are never marked adopted without recorded human review
  and the governance mechanism agreed for that release. Until then they remain
  candidates or an official first draft, not a ratified standard.
- A formal council decision satisfies ODR-0001 citation, dissent and provenance rules.
- Meeting recording and transcription are opt-in and follow an agreed retention and
  access policy.
- Intake guidance lists preferred structured, document, diagram and transcript
  formats; it discourages audio and video when a transcript can be supplied.
- Every claimed downstream artefact names the generator or transformation contract and
  its validation status; roadmap items are not described as shipped.
- Participants can complete the normal contribution and review workflow without
  reading or editing RDF, OWL, SKOS, SHACL or JSON Schema.
- The redesigned website implements the lifecycle and status requirements in
  ADR-0064 before the new process is presented as the live public standard.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0064 — modelling website revamp before publication](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
- [Research — AI-assisted working-group method](../research/ai-assisted-working-group-method.md)
- [Presentation plan — July 2026 Exec and Finance and Banking workshop](../plan/2026-07-exec-and-finance-banking-presentations.md)
- [ADR-0039 — linked-data model as the PDTF standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0027 — council-session indexing in AgentDB](./ADR-0027-council-session-indexing-in-agentdb.md)
- [ODR-0001 — Linked Data Council methodology](../ontology/odr/ODR-0001-linked-data-council-methodology.md)
- [AI Linked Data Council methodology](../linked-data-initiative/06-ai-linked-data-council-methodology.md)
- [Model-driven generation vision](../linked-data-initiative/09-model-driven-generation-vision.md)
- [Microsoft Graph invitation resource](https://learn.microsoft.com/en-us/graph/api/resources/invitation?view=graph-rest-1.0)
- [Microsoft Graph create invitation](https://learn.microsoft.com/en-us/graph/api/invitation-post?view=graph-rest-1.0)
