---
status: proposed
date: 2026-08-03
updated: 2026-08-31
tags: [governance, standards-development, working-groups, consensus, ratification, public-review, interoperability, ai-assisted, provenance, conformance, ipr, maintenance]
supersedes: []
depends-on: [ADR-0039, ADR-0066, ADR-0067]
implements: []
---

# Govern the OPDA standards lifecycle through human consensus and staged ratification

## Context and Problem Statement

The Finance and Banking Working Group established the intended way of working. Participants
provide shareable source material and domain knowledge; a human-directed, AI-assisted process
extracts evidence and authors a model candidate; OPDA publishes the candidate through the
website and Teams; participants challenge it, correct it and add evidence; and that adjudicated
feedback becomes input to the next modelling pass. Iteration continues until the group considers
the work stable enough to advance.

That loop deliberately made AI an accelerator rather than a decision-maker, but left the words
“stable”, “consensus”, “official first draft”, “ratification” and “resolution” undefined. It also
did not settle who is eligible to make which decision, how an objection is handled, when public
review or implementation evidence is required, or how a published standard is maintained.

The gap matters before the greenfield Property Pack ontology can advance beyond candidates.
Without explicit stages, an AI-authored website deployment can look like an approved standard;
silence can be mistaken for consent; a large employer can dominate by headcount; cross-boundary
meaning can be changed by the wrong group; and legal, privacy, security or intellectual-property
issues can surface only after release.

OPDA already has constitutional authority and some technical-process material:

- the General Assembly is the overall member decision-making body;
- the Executive Committee oversees the Smart Property Data Trust Framework and may delegate
  work, while the directors retain the management and delegation powers in the Articles;
- domain working groups provide subject-matter participation;
- Technical Review, Compliance and Risk, Coordination and Engagement functions already exist;
- the current Trust Framework governance document contains a useful issue-to-release SOP, but
  its reviewer counts, consultation periods and some role composition remain placeholders.

This ADR supplies the missing standards-development operating model. It is informed by the
current W3C Process and Patent Policy, ISO/IEC Directives, OASIS Technical Committee process,
IETF working-group practice, NIST AI RMF and UK Government Open Standards Principles. OPDA does
not claim conformity with any one of those processes; it adopts the controls proportionately.

## Decision Drivers

- Preserve the evidence → candidate → discussion → revised-candidate loop presented to the
  Finance and Banking Working Group.
- Keep domain meaning with domain experts and common-boundary decisions with the
  Interoperability Working Group.
- Make every maturity label state what has and has not been approved.
- Prefer reasoned consensus and the weakest substantive objections over popularity or volume.
- Allow asynchronous participation by people who cannot attend meetings.
- Prevent AI agents, editors, chairs, vendors or large organisations from self-authorising a
  standard.
- Give every material comment, dissent and decision a durable, inspectable disposition.
- Require legal, privacy, security, competition, IPR, conformance and implementation evidence
  before normative release.
- Fit OPDA's Constitution and Articles without sending every technical revision to an annual
  General Assembly.
- Keep the process light for early drafts and progressively stronger as normative status rises.

## Considered Options

- **Option A — Informal working-group satisfaction.** Iterate in Teams until the convenor judges
  that the group is happy, then publish the result as a standard.
- **Option B — Majority voting at every iteration.** Put each model change to all invited working-
  group participants and accept the largest vote.
- **Option C — Import one external standards process verbatim.** Adopt the full W3C, ISO or OASIS
  machinery, terminology, membership rules and ballots.
- **Option D — A proportionate staged lifecycle with human consensus and constitutional
  ratification.** Retain the OPDA iteration loop, but add charters, maturity stages, decision
  rights, issue disposition, public review, implementation evidence, appeals and release gates.

## Decision Outcome

Chosen option: **D — a proportionate staged lifecycle with human consensus and constitutional
ratification**.

On 31 August 2026 the canonical kick-off presentation was generalised from its first
Finance and Banking application to all six domain working groups. That editorial
change does not make this proposed lifecycle operative; the Finance and Banking
session plan remains historical evidence of the original method.

AI and editors may author candidates. Working groups determine whether domain proposals have
earned consensus. The Interoperability Working Group determines common-boundary and cross-context
proposals. Independent reviewers verify technical and risk gates. Only the Executive Committee,
the registered Board of Directors or a delegate whose authority is recorded by them may ratify
an OPDA Standard. In the remainder of this ADR, **Board** means that registered Board of Directors.

The General Assembly retains its powers under the Constitution and Articles, including its
overall decision-making and reserve powers and its authority over constitutional change. It does
not become the routine approval body for individual terms or releases.

### 1. Constitutional and delegated authority

| Actor | Authority in this process |
|---|---|
| General Assembly | Changes constitutional rules, exercises member and reserve powers, and may direct or overturn the Executive Committee as the governing documents allow. |
| Executive Committee / Board | Charters working groups, adopts this process, appoints accountable roles, accepts residual organisational risk and ratifies or withdraws OPDA Standards. Any delegation must name its scope, holder and duration in a decision record. |
| Domain Working Group | Owns consensus on meaning inside its bounded context and recommends stage advancement. It is not a corporate ratification body. |
| Interoperability Working Group | Owns the common boundary, context map, cross-domain mappings and shared conventions. It does not control a domain's internal meaning. |
| Technical Review | Independently verifies architecture, identifiers, provenance, generated artefacts, conformance tests, compatibility and release completeness. It does not decide business truth. |
| Compliance and Risk | Reviews privacy, security, law, competition, IPR, accessibility and evidence-handling risks. A substantiated block remains until remediated or explicitly accepted by the Executive Committee / Board. |
| Standards Secretariat | Maintains charters, rosters, notices, minutes, issue and disposition records, stage registers, review windows, release manifests and the appeals log. This is a function and need not be a new corporate body. |
| Chair | Facilitates fairly, calls consensus and records reasons. The Chair does not substitute personal preference for group consensus. |
| Editor / modelling lead | Converts evidence and adjudicated feedback into candidates and publishes diffs. The editor has no unilateral semantic or ratification authority. |
| AI agents and councils | Extract, compare, challenge, draft and test. They have no membership, vote, consensus, approval or ontology authority. |

One person may hold several operational roles while OPDA is small, but every stage transition
requires an independent human reviewer who did not author the candidate. A conflicted person must
declare the interest and withdraw from the affected consensus call, review or ratification.

### 2. Every working group is chartered

The Executive Committee / Board must approve a short, public charter before a working group may
advance a standards-track deliverable. Each charter states:

- mission, bounded-context scope, exclusions and success criteria;
- deliverables, milestones, duration and maintenance responsibility;
- Chair, editor/modelling lead, secretariat contact and accountable Executive Committee sponsor;
- participant eligibility, expected contribution, materially affected stakeholder categories and
  any default active-support threshold;
- dependencies and hand-offs to other domain groups and the Interoperability Working Group;
- communication channels, meeting cadence, decision method and escalation route;
- confidentiality of proceedings and artefacts;
- contribution, copyright and patent terms; and
- the process used to approve intermediate and final deliverables.

Invited participants may submit evidence, join discussions, review drafts and raise objections.
Formal corporate voting rights remain governed by OPDA membership documents. For working-group
consensus, each participant must disclose their name, affiliation and material interests; several
people from one organisation do not become several independent stakeholder interests.

The Code of Conduct, Competition Compliance Policy, Data and GDPR Policy and Conflict of Interest
Register apply to all standards work. Meetings and channels must not be used to discuss prohibited
competitive information such as pricing, market allocation or customer strategy.

### 3. Standards maturity lifecycle

| Stage | Meaning | Advancement gate |
|---|---|---|
| **Evidence record** | Submitted source, transcript, comment or observation. It is not model content and may remain access-controlled. | Rights, provenance, sensitivity and security screening complete. |
| **Editor's candidate** | AI/editor-authored branch or website preview. It has no official standing and may be incomplete or wrong. | Deterministic validation passes sufficiently for review; assumptions and uncertainties are visible. |
| **Working Draft** | The domain group has adopted the candidate as a basis for work. It may be unstable and does not imply consensus or OPDA endorsement. | Recorded group decision to publish; scope, status, open issues, provenance and changes are published. |
| **Public Review Draft** | The domain group has consensus that the work is complete enough for wide review. Cross-boundary material has Interoperability Working Group concurrence. | Consensus record, complete review package and Executive Committee / delegated permission to open review. |
| **Release Candidate** | Public comments are disposed, the model is technically complete, and implementation/conformance evidence is being finalised. | All release gates in section 9 pass; no unresolved blocking objection. |
| **OPDA Standard** | Normative, versioned release ratified by the Executive Committee / Board or its recorded delegate. | Ratification decision and immutable release publication. |
| **Errata / superseded / withdrawn** | Post-release correction or lifecycle state; the historical release remains available and labelled. | Applicable change-class and maintenance rules pass. |

The term **draft** must always carry one of these stage labels and a prominent non-normative status
notice. A website deployment is a publication surface, not a maturity transition.

### 4. Evidence-to-model iteration

For each bounded context, OPDA uses this repeatable loop:

1. **Intake.** Collect permitted source files, transcripts, standards, examples and participant
   knowledge. Record submitter, organisation, date, rights, confidentiality, context and stable
   evidence identifier. A link alone is not evidence in the controlled corpus.
2. **Scope.** Freeze a work order containing the target source items, competency questions,
   bounded context, applicable modelling dimensions, standards profile and acceptance checks.
3. **Draft.** The human-directed Semantic-Builder-inspired process uses qualified model routes,
   specialist lenses and escalation-convened councils to produce a candidate and explicit
   uncertainties. AI agreement is evidence about robustness, never consensus about meaning.
4. **Check.** Run deterministic RDF, OWL, SKOS, SHACL, provenance, coverage, duplication,
   authorisation and profile tests. A passing tool check proves conformance to encoded rules, not
   that the domain meaning is true.
5. **Publish for review.** Deploy the exact candidate, human-readable definitions, diagrams,
   data dictionary, business glossary, shapes, generated familiar artefacts, source citations,
   open questions and a change diff to the website; announce the review in Teams.
6. **Discuss and dispose.** Keep one canonical issue per question. Feedback from meetings, Teams,
   website discussions and email is linked to that issue and assigned a disposition.
7. **Re-run.** Only accepted feedback, resolved evidence requests and recorded corrections enter
   the next frozen work order. Publish the new candidate and its diff; do not silently rewrite a
   reviewed draft.
8. **Advance or continue.** Continue the loop, publish a Working Draft, or open a recorded call for
   consensus when the exit criteria for Public Review Draft appear satisfied.

Recorded meetings and transcripts are evidence inputs only when participants have been notified
and the recording, retention and modelling use are lawful and permitted. No decision made only in
a live meeting is final until its proposal and rationale have been posted to the persistent record
for asynchronous review.

### 5. Canonical issue and decision record

Teams is the discussion hub and the website is the review surface, but neither is the system of
record by itself. Every substantive question has one durable record containing:

- stable ID, title, bounded context and affected artefact/version;
- proposer, affiliation, date, source/evidence links and rights classification;
- problem, options, candidate change and expected interoperability/compatibility impact;
- linked discussion and meeting references;
- reviewer comments, declared interests and AI-assistance disclosure;
- disposition: `accepted`, `needs-evidence`, `deferred`, `duplicate/out-of-scope` or
  `not-accepted`, with rationale and owner;
- dissent or Formal Objection, proposed remedy and response;
- decision type, eligible decision set, consensus call or vote result, Chair and date; and
- implementation commit/release link and validation result.

Reaction counts, meeting attendance, model votes and message volume are never decision records.

### 6. Consensus and exceptional voting

Consensus means substantial active support and no unresolved sustained objection after all
legitimate views have been considered. It does not require unanimity. Silence is abstention, not
support; one persistent participant or one large employer cannot manufacture or veto consensus.

The default call for consensus is open for **10 working days** in the group's persistent channel
and identifies the exact proposal, diff, evidence, open risks and response deadline. Unless its
charter sets a stronger threshold, advancement requires explicit support from at least three
independent organisations spanning at least two materially affected stakeholder categories. The
Chair records the support, abstentions, objections and reasons for the determination.

A decision first discussed in a meeting receives at least **5 working days** of asynchronous
confirmation. The Chair may use lazy consensus only for clearly identified editorial or
procedural matters; it may not be used for semantic, cross-boundary, breaking or normative
decisions.

If good-faith technical discussion cannot resolve a deadlock, the Chair may call an exceptional
recorded vote. Each represented organisation has at most one vote; passage requires at least
two-thirds of votes cast. The vote and all negative rationales are advisory to the authorised
stage gate and cannot waive a legal, security, privacy, competition or IPR block. The Chair must
explain why consensus failed and why voting was necessary.

### 7. Objections, dissent and appeals

A **Formal Objection** identifies the proposal or decision, the substantial technical or
procedural harm, supporting evidence and, where possible, a remedy. Mere preference is ordinary
feedback. A Formal Objection is not a veto, but must receive formal consideration and a response
at the same visibility as the objection.

The route is:

1. the Chair and a neutral facilitator attempt resolution and update the issue record;
2. unresolved domain meaning returns to the Domain Working Group; common-boundary or mapping
   matters go to the Interoperability Working Group; process/conformance matters go to Technical
   Review; and legal, privacy, security, competition or IPR matters go to Compliance and Risk;
3. a participant may appeal the resulting decision within **10 working days** to the Executive
   Committee / Board, which appoints reviewers not materially involved in the original decision;
4. the appeal decision affirms, varies, remands or overturns the decision and records rationale,
   mitigations and any held dissent. Constitutional member rights remain unaffected.

Work on unrelated issues may continue during an appeal. A deliverable cannot advance to Release
Candidate or OPDA Standard while a blocking Formal Objection is unresolved, unless the authorised
appeal body expressly overrules it with reasons.

### 8. Public review and implementation evidence

The first Public Review Draft review lasts at least **30 calendar days**. Every material comment
is acknowledged, linked to an issue and given a reasoned disposition. If responding to review
introduces a material change, the affected text and artefacts receive a further review of at
least **15 calendar days**. Editorial corrections do not restart review.

Before ratification, every normative feature must have a conformance test or a documented reason
why objective testing is impossible. The release must have evidence from at least **two
independent organisations**, including one not responsible for authoring the feature, showing
successful use as a producer, consumer, validator, schema/form generator or interoperable
exchange. Difficulties and failed trials are part of the implementation report, not discarded.

The Executive Committee / Board may grant a narrowly scoped implementation-evidence exception
only through a public rationale that identifies the residual risk and a dated follow-up gate.

### 9. Release and ratification gates

A Release Candidate and its ratification pack must include:

1. approved charter, scope and applicable requirements;
2. immutable artefact versions and content digests, with normative and informative parts marked;
3. traceability from the Property Pack/source requirements to model constructs and exclusions;
4. ontology, vocabulary, SHACL, generated artefact and conformance-test results;
5. issue/comment disposition log, consensus record and all held objections/appeals;
6. Interoperability Working Group review of common-boundary and cross-context effects;
7. Technical Review confirmation from at least two reviewers, including one non-author;
8. Compliance and Risk sign-off or an explicit Executive Committee / Board risk acceptance;
9. IPR, copyright, patent-disclosure, privacy, security and competition checks;
10. implementation report from independent organisations;
11. compatibility classification, migration/deprecation plan and release notes; and
12. named owners for maintenance, incident handling and the next systematic review.

The Secretariat verifies completeness; it does not approve content. Ratification identifies the
exact pack and version. Released artefacts are immutable; a stable `latest` pointer may move, but
must never make an older version disappear.

### 10. Change classes, versions and maintenance

- **Editorial:** no change to normative meaning. Editor plus one independent reviewer; recorded
  in the change log.
- **Compatible substantive:** adds or clarifies normative meaning without invalidating conforming
  uses. Domain consensus, affected-context review and minor-version release.
- **Breaking/material:** removes, redefines or makes a previously conforming use invalid. Full
  public review, implementation evidence, migration/deprecation plan and major-version
  ratification.
- **Urgent legal/security erratum:** the Executive Committee / Board may publish a clearly marked
  provisional correction after Compliance and Risk plus Technical Review. It expires after 90
  days unless completed through the ordinary applicable route.

Every OPDA Standard receives a systematic review at least every **24 months**, and may be reviewed
earlier on new evidence, law, implementation difficulty or stakeholder request. The outcome is
confirm, revise, supersede or withdraw. This governance process itself is reviewed annually.

### 11. Contributions, IPR and source confidentiality

Before the first Public Review Draft, the Executive Committee / Board must adopt a contribution
and output-licensing policy with a royalty-free implementation objective. It must cover copyright,
patent disclosure/essential claims, feedback from non-members, attribution, permitted AI use and
the licence for normative and software artefacts. No Release Candidate may advance without it.

Every submitter attests that their organisation may share the material for the stated purpose.
External links do not transfer rights. Source files may remain confidential evidence and are not
published merely because they informed a model. Public specifications paraphrase and cite rather
than reproduce protected material. Restricted evidence is disclosed only to authorised reviewers,
while the public decision record states enough provenance and rationale to audit the outcome.

### 12. AI-specific governance

ADR-0067 governs the modelling harness; this ADR governs how its output enters a standard:

- AI receives only screened, purpose-authorised evidence and an immutable work order.
- Each material run records evidence snapshot, route/provider/model identity, role, prompt or
  task envelope, tool/standards versions, output digest, disagreements and validation results.
- A candidate cannot write directly to an accepted branch, close its own issue, call consensus,
  dispose of human feedback, approve a risk or advance a maturity stage.
- High-risk claims receive independent model-family challenge where the qualified portfolio
  allows it and independent human review in every case.
- Prompt injection, unsupported claims, privacy leakage, provider substitution, model drift and
  failed validation are incidents or evidence-quality failures, not material to hide.
- Public drafts disclose that AI assisted authoring and how humans controlled it; sensitive run
  detail may remain access-controlled, but the decision rationale and accountable humans do not.

### 13. Transparency, retention and measures

OPDA publishes, subject to lawful confidentiality: charters; role holders and affiliations;
meeting notices and minutes; draft status; changes; issue dispositions; consensus and vote
records; objections and appeals; validation and implementation reports; release manifests; and
maintenance status. Board/Executive Committee and standards stage-decision records are retained
for at least **10 years**, matching the Articles' decision-record baseline.

The Secretariat reports cycle time, unresolved blocking issues, comment-disposition age,
participating organisations and stakeholder breadth, coverage, conformance results,
implementation evidence, appeals and overdue reviews. It must not use raw message volume, AI
agreement or majority sentiment as a quality metric.

### Consequences

- Good, because participants can see the difference between an AI candidate, a working draft and
  a ratified standard.
- Good, because Domain and Interoperability Working Groups have distinct, bounded authority.
- Good, because the Finance and Banking iteration remains rapid while controls strengthen only
  when a draft advances.
- Good, because asynchronous consensus, organisational balancing and reasoned objection handling
  reduce dominance by meetings, headcount or persistence.
- Good, because public review, conformance and independent use test whether a standard works
  before OPDA labels it normative.
- Good, because AI is deeply useful without becoming a hidden authorising institution.
- Good, because the ratification path fits the Constitution and Articles while preserving the
  General Assembly's reserve authority.
- Bad, because issue disposition, release packs, public review and implementation evidence add
  work and will slow promotion of immature drafts.
- Bad, because OPDA must adopt contribution/IPR terms before the first public-review milestone.
- Neutral, because invited non-members may shape the technical work but do not acquire corporate
  member voting rights.
- Neutral, because a held objection may remain in the record after an authorised reasoned
  decision; consensus does not guarantee unanimity.

### Confirmation

This ADR is **proposed**. It becomes operative only when the Executive Committee / Board records
its acceptance or a constitutionally valid delegate does so. Acceptance must name the initial
Standards Secretariat and accountable sponsor.

Before the Property Pack work is called a Public Review Draft, OPDA must have:

- an approved Finance and Banking / Property Pack charter and Interoperability Working Group
  charter;
- a canonical issue/disposition register and maturity-stage register;
- contribution, feedback, copyright and patent terms;
- consensus-call, Formal Objection, public-review and release-manifest templates; and
- a dry run showing that one candidate can be traced from evidence through feedback, re-run,
  validation and a human stage decision.

No change to the current public ontology or website status is authorised by this ADR.

## More Information

### OPDA evidence and authority

- [Working-group kick-off participation slides](../../src/components/presentations/WorkshopParticipationSlides.astro)
- [Working-group kick-off architecture slides](../../src/components/presentations/WorkshopArchitectureSlides.astro)
- [Presentation content and session plan](../plan/2026-07-exec-and-finance-banking-presentations.md)
- [ADR-0039 — linked-data standards direction for SPDTF](./ADR-0039-linked-data-model-as-spdtf-foundation.md)
- [ADR-0066 — Property Pack seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — first-principles bounded-context modelling](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [OPDA Constitution 2026](../../source/01-organisation/constitution-and-policies/OPDA%20Constitution%202026.pdf)
- [Articles of Association 2026](../../source/01-organisation/constitution-and-policies/Articles%20of%20Association%202026.pdf)
- [Current Trust Framework governance material](../../source/03-standards/trust-framework/docs/governance.md)

### External primary sources

- [W3C Process Document](https://www.w3.org/policies/process/)
- [W3C Patent Policy](https://www.w3.org/policies/patent-policy/)
- [ISO/IEC Directives, Part 1 and consolidated ISO Supplement](https://www.iso.org/sites/directives/current/consolidated/)
- [OASIS Technical Committee Handbook and policy links](https://docs.oasis-open.org/TChandbook/TChandbookIndex.html)
- [IETF Working Group Guidelines and Procedures, BCP 25](https://www.rfc-editor.org/info/rfc2418/)
- [IETF rough-consensus guidance, RFC 7282](https://www.rfc-editor.org/info/rfc7282/)
- [NIST AI Risk Management Framework Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)
- [UK Government Open Standards Principles](https://www.gov.uk/government/publications/open-standards-principles/open-standards-principles)
