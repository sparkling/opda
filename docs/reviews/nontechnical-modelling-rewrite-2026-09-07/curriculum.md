# An illustrated field guide to shared meaning

Proposed curriculum, not implemented website content. Read the [recommendation](proposal.md) and [deliberation](deliberation.md) for scope, evidence and unresolved choices.

## Two audiences, not two levels of technical confidence

The learning side serves people who understand property work but do not practise ontology engineering. This includes practitioners, policy and business specialists, data stewards, analysts, developers and architects who are not ontologists. They should be able to understand the agreement being built, examine it and challenge its meaning without learning formal syntax.

The separate **Ontology modelling** side serves people making formal modelling decisions. Its analytical discipline, languages, profiles and technical references remain there. Being an experienced developer does not automatically make someone an ontology modeller; being unfamiliar with software does not diminish someone's authority about their domain.

On the overall Modelling landing, make that distinction explicit. Within the learning side retain **Understand**, **Explore the model** and **Review and contribute**. Keep the existing `/contribute` route; change its displayed label. These are ways into a reference guide, not sequential enrolment stages.

## The proposed allocation

Twenty-two chapters: five Understand, nine Explore and eight Review and contribute. Eight existing chapter routes remain; fourteen new routes acquire genuinely new teaching. The overall landing and three journey landings are additional to that count. The number is an editorial hypothesis, not an acceptance target or mandatory reading sequence.

All routes below are relative to `/semantic-modelling/`. A route marked **retained** gets a substantive rewrite, not a promise to retain its current composition. Proposed new routes do not exist yet.

Every teaching chapter should contain a recognisable problem, the distinctions needed to understand it, a concrete worked example, a difficult variation and a useful review action. Do not force the same visual layout onto every chapter. Do not turn all answers into “ask an expert”: distinguish cases with sufficient fictional premises, deliberately incomplete cases and actual unresolved candidate content.

## Understand

### U1 · Why shared meaning matters

**Retained:** `understand/shared-meaning`

Reader task: explain why correctly formatted information can still answer the wrong question.

Introduce semantic modelling as making meanings, subjects, relationships and conditions explicit. Explain an ontology as the formal expression of selected distinctions, not a replacement for professional knowledge. Distinguish a model from the actual world, a model definition from a particular record, and agreeing meaning from centralising everybody's data.

Use the existing report-date misunderstanding once, carefully. Show a form, a nested description and a connected account of the same stipulated facts. All three can be useful; a tree can contain references, and a graph neither guarantees correctness nor eliminates duplication. Read “Report version 2 describes the 12 August inspection” as an ordinary sentence before showing any nodes.

Practice: follow three labelled relationships and identify which subject each date describes. Then ask what information an exchange would have to preserve to avoid implying a second visit. A changed example should test that skill rather than recall of the dates.

Visuals: V01 and V02 in the [visual atlas](visual-atlas.md). Optional formal handoff: the existing classes-and-relationships chapter. No RDF syntax in the lesson.

### U2 · What we are building

**New:** `understand/what-we-are-building`

Reader task: recognise the six aligned outputs and know what each helps them inspect.

Show actual readable specimens of a business glossary entry, dictionary element, taxonomy, controlled vocabulary, resource definition and relationship definition. Use three paired spreads instead of six decorative boxes labelled with output names. Explain that these are connected views of one agreement, not six independent specifications or six files every term must produce.

Separate “Resource definition: Inspection” from “Teaching instance: the Harbour Court inspection on 12 August”. A real candidate resource page may describe a class; it is not evidence that the website stores a live inspection record. Also distinguish a class membership statement from a relationship between example instances.

Practice: choose the specimen that answers six ordinary questions. Contrast changing a preferred label with changing the meaning of a definition. Identify potentially affected views without assuming every change must alter all six. C7 owns the later, deeper revision exercise.

Visuals: V03. Mention generated JSON-LD artefacts briefly as a delivery result of the ontology; do not teach their document structure. See the complete prototype in the visual atlas.

### U3 · Benefits, limits and reasonable objections

**New:** `understand/benefits-and-limits`

Reader task: explain what this approach can improve, what it costs and what it cannot guarantee.

Develop the case for fewer reinterpretations, clearer evidence, more inspectable agreements, deliberate reuse and better understanding of change. Give each benefit a condition and a failure mode. Maintaining definitions, resolving disagreement, preserving meaning through generation and agreeing mappings require work. An accurate model cannot make an inaccurate source true or compel downstream adoption.

Answer substantial objections in ordinary prose: “We already have a schema”; “Why not one definition of property?”; “Why not import an existing ontology such as FIBO?”; “Is an identifier enough?”; “Will this replace our forms?”; “Is AI deciding the standard?”; “Can we contribute when evidence is restricted?” Explain OPDA's chosen approach without caricaturing all other ontology methods as top-down.

Practice: compare two exchanges, one preserving a distinction and one losing it. State the condition needed for a claimed benefit, and identify the remaining work. No invented time-saving percentages, endorsements or guaranteed commercial gains.

Visuals: V04, a compact consequence comparison. Keep a benefit explanation distinct from a promotional slogan. Source claims about the legacy baseline and FIBO from ADR-0063, not assumptions about their current products or adoption.

### U4 · Harbour Court: follow a question through the model

**Retained:** `understand/a-property-story`

Reader task: combine the distinctions in a coherent, readable situation.

Keep Harbour Court, its dwellings, reports and inspection as a continuing fictional case. Add enough explicit evidence to support meaningful answers: an identified measurement basis, a stated relationship, a corrected report and a clearly stipulated conditional requirement. Extend the sale narrative where it helps professional recognition; do not invent legal or professional rules to make every profession fit the same story.

Build the account progressively. A cast list, a source excerpt and a small map should answer successive questions rather than present a vast graph at the outset. Keep subdivision as a genuinely harder identity variation, not automatically a phase change. Use the story's facts consistently across pages, preferably from one authored scenario record.

Practice: follow one question from the document to its subject, relationship and evidence. Include one warranted conclusion and one missing-information case. The real candidate-reading scaffold moves to C7; Harbour Court is not represented as implemented candidate content.

Visuals: V05 and selected specimens from V03. Related professional variations are distributed throughout Explore and review chapters, not collected in a second mandatory course.

### U5 · How the modelling work is done

**New:** `understand/how-the-work-is-done`

Reader task: understand how practical knowledge becomes a reviewable proposal, and what participants can contribute before one exists.

Explain the resource-first method within the already documented boundaries: questions and authorised evidence; facilitator/AI-assisted drafting; readable candidate outputs; checks and human judgement; explicit agreements at boundaries; visible revision. Do not ask newcomers to rediscover contexts. Distinguish a reviewable proposal from approval, publication or government recognition.

Introduce the eight retained concerns through questions about one small package. A group can model a concern locally, reuse shared meaning, contribute at a boundary or record why it is not applicable. This is a completeness aid, not another numbered mnemonic readers must memorise or an instruction to model everything.

Practice: sort several contributions into domain question, useful evidence, missing modelling distinction and downstream operational request. Show what facilitators can formalise and what practitioners must judge. Explain the kick-off's evidence-led intent without inventing a current meeting schedule or live intake feature.

Visuals: V06. Detailed proposed process controls remain labelled as proposed; link current participation mechanics to the member guide instead of copying them into lessons.

## Explore the model

### E1 · Things, identities and relationships

**Retained:** `explore/things-and-identities`

Reader task: identify what is being described and explain exactly what a connection claims.

Distinguish an individual thing, a kind of thing, an identifier and a representation. Compare physical containment, documentary reference, classification and identity. A dwelling, its building, a title record and an address are not interchangeable merely because records mention the same location. Do not treat topic hierarchy as physical containment or class inheritance.

Show edge direction and why some relationships need qualifications: participant, setting, period, source or purpose. An unnamed line is not self-explanatory. Introduce a qualified relationship through an ordinary statement before choosing a technical representation.

Practice: repair a map with an unnamed edge and an unjustified identity merge. Explain the practical consequence of each repair. Include a different building or document example so success is not simply recognising Harbour Court.

Visuals: V07 and V08, small paired maps with complete sentence equivalents. Formal representation selection belongs in Ontology modelling.

### E2 · People, roles and change

**New:** `explore/people-roles-and-change`

Reader task: identify who participates, in which setting, and what changes while a subject continues.

Cover persons, organisations and multiple participants. Explain roles through relationships: buyer in one transaction, seller in another; borrower or guarantor in a stated arrangement. “Role” does not simply mean short-lived. Separate a change to a document, a recorded state and a new event. Not every status is a formal phase, and not every change preserves identity.

Practice: add the missing arrangement, participant or period to a proposed statement. Compare a report correction with another inspection. Use a second arrangement as the transfer case rather than repeating the original transaction labels.

Visuals: V09 participation map and V10 event/state comparison. Finance and banking supplies a professional question, not a rule that every finance concept shares one semantic home. Permission is treated separately in E9.

### E3 · Measurements, amounts and values

**New:** `explore/measurements-amounts-and-values`

Reader task: identify what a quantity describes and what supports comparing two values.

Measurement needs a subject, value, unit and stated basis; method, precision, source and relevant time can matter. Compare fictional 68 m² and 72 m² accounts where the inclusion difference is explicitly supplied. The lesson is not a professional measuring standard. Give the quantities their own worked explanation instead of compressing them into an introduction to dates.

Also distinguish a fictional asking-price statement, a transaction's agreed-price statement and a valuation opinion made for a stated purpose. Sharing a currency and referring to the same dwelling does not make these the same claim. Do not advise which price to set or which valuation method to use.

Practice: first explain the determinate inclusion difference; then use a variation where both accounts claim the same basis but method or relevant dates are missing. Identify the evidence now needed. Compare the amount statements by maker, subject, purpose and relevant time. A supported difference is not automatically a conflict.

Visual: V11 inclusion diagram, with ordinary HTML amount specimens. This is one of the two recommended design prototypes. The separate time chapter owns the general clock explanation.

### E4 · Dates, periods and applicability

**New:** `explore/dates-periods-and-applicability`

Reader task: explain what a date or period locates before deciding whether records describe the same situation.

Distinguish event occurrence, report issue, recording and applicability. These are not automatically four workflow stages. Include a multi-day inspection, a later record and a report revision that does not establish another visit. An interval is not the same thing as its duration.

Practice: place each supplied statement on its appropriate time lane and explain why two dates need not conflict. Then remove an applicability period or the event date: what can no longer be concluded? Do not invent dates solely to fill all lanes.

Visual: V12 multilane strip and a complete chronological/semantic text account. Repeat only the minimum situation needed from Harbour Court. This chapter was split from measurements during the final review because the two topics already require different premises, explanations and practice.

### E5 · Claims, evidence and uncertainty

**New:** `explore/claims-evidence-and-uncertainty`

Reader task: distinguish what is asserted from why it might be believed, and state what remains unknown.

Separate event, observation, claim, document and source. Explain direct evidence, derivation, currency and authority for a purpose without turning provenance into a truth guarantee. Contrast records about different subjects or periods with genuinely incompatible claims about the same stipulated subject and period.

Treat absent, unknown, not applicable, withheld, explicitly negative and conflicting information as different states of knowledge or recording. Absence alone cannot tell us which explanation applies. A neat confidence percentage is not a substitute for evidence.

Practice: compare two short source passages, record what each supports and identify the precise gap. Include a supported conclusion as well as an unresolved conflict. Do not silently choose the newer record merely because it is newer.

Visuals: V13 evidence trace and V14 uncertainty specimens. Interpretation comes here; C6 teaches preparing evidence for someone else to review.

### E6 · Names, choices and classification

**Retained:** `explore/names-and-choices`

Reader task: inspect agreed words and choices without confusing their labels, meanings and organising structures.

Develop preferred and alternative labels, definitions, examples, exclusions, codes, open populations, closed choices, topic taxonomies and independent facets. Give each a readable specimen. Use explicitly fictional report-topic and inspection-access-outcome examples rather than asserting an industry-approved vocabulary.

Explain why a broader topic is not necessarily a superclass, why a roof-topic hierarchy is not a diagram of a building's parts, and why one subject can be described through several independent facets. Do not force source codes into domain meaning without examination.

Practice: improve a circular definition, identify overlapping choices and correct an inappropriate broader relation. An “other” choice and missing information do different jobs. Include a choice set whose scope and completeness can actually be assessed from the supplied premises.

Visuals: V15 annotated vocabulary and classification spreads. C4 applies these ideas; E7 handles their correspondence across contexts.

### E7 · Connect meanings across contexts

**Retained:** `explore/contexts-and-connections`

Reader task: determine what a recipient needs to understand and what a proposed correspondence preserves or loses.

Name and link the documented semantic homes. Explain the difference between profession, working group, system and bounded context with concrete examples. Derive boundaries from the established register and decisions, not campaign copy. Keep the small Common boundary, the scheme working group and the candidate's machine-proposed DBT semantic context distinct.

Compare full definitions, purposes, versions and counterexamples before considering an exact, close, broader, narrower or absent correspondence. Cooperation does not imply equivalence. Insufficient evidence and deliberately keeping meanings separate are valid outcomes.

Practice: examine a source with several dates and a recipient's differently scoped requirement. Identify information lost by a proposed mapping. Use a conveyancing question about different meanings of “completion” as a further comparison, not a claim that a professional phrase already has an accepted mapping.

Visuals: V16 non-equation plate, V17 narrowly scoped bridge. Existing boundary supply arrows are not mappings; the inspected candidate register does not contain accepted cross-context mappings. Never draw example arrows as an adopted map.

### E8 · Rules, requirements and exceptions

**New:** `explore/rules-and-exceptions`

Reader task: explain what a requirement asks for, when it applies and what would demonstrate a problem.

Separate business meaning, a requirement on a particular data profile and evidence about the world. Explain conditions, allowed values, counts, completeness, consistency, exceptions and insufficient information. A check can evaluate a stated condition without deciding professional correctness or adoption.

Use a fictional rule whose scope is explicit: in this teaching profile, a report that says inspection access was limited must identify the limitation being reported. First establish applicability. Where the exercise supplies no evidence about that condition, report “applicability not established”, not an automatic pass, failure or claimed formal-validation result. Where the condition is established, compare a record identifying the limitation with one definitely omitting it. Distinguish failure of the rule's design from failure of a record to meet it.

Practice: change one premise and explain whether the expected result changes. Offer a counterexample which shows that the proposed rule overreaches. No SHACL syntax, blanket policy or “green means true” display.

Visuals: V18 plain rule and case matrix. C5 extends this into a practical review activity.

### E9 · Sensitivity, purpose and permissions

**New:** `explore/sensitivity-purpose-permissions`

Reader task: identify handling distinctions the domain model needs to express without confusing descriptions with enforcement.

Explain personal-data and sensitivity classifications, purpose, transaction roles, scheme roles and permission scope. Consent, a legal basis and a permission are not synonyms. A sale participant's role alone does not establish entitlement to all associated records. Model the relevant distinction or relationship; do not teach an access-control implementation.

Practice: identify what is missing from “the seller may see the report” and what the supplied evidence can establish. Do not invent a valid legal basis or scheme policy for the example. Keep this a modelling exercise, not legal advice.

Visuals: V19 separates participation, scoped permission descriptions and downstream enforcement. Link broader SPDTF Trust explanation to its existing home. The lesson is not a Trust operations or governance course.

## Review and contribute

### C1 · Turn experience into a modelling question

**New:** `contribute/frame-a-modelling-question`

Reader task: contribute useful knowledge before a candidate exists.

Begin with a decision, misunderstanding or exception. Identify the subject, setting, ordinary case, difficult case and evidence. Turn “our data is wrong” and an implementation feature request into questions the agreed model must help answer. Introduce “competency question” only after the ordinary-language idea makes sense.

Practice: write a bounded question without prescribing a field, a class name or a software feature. Show a reasoned worked response and a defensible alternative, not a single answer key claiming authority.

Visual: an annotated contribution note. No submission simulation or new intake form; the existing participation route remains separate.

### C2 · Review a definition

**Retained:** `contribute/review-a-definition`

Reader task: test what wording includes, excludes and leaves ambiguous.

Keep the existing report-date exercise but add different faults: circular wording, mixed subjects, hidden conditions and one organisation's convention generalised beyond its evidence. Show plausible competing revisions, not a cartoonishly bad option beside an obvious answer.

Practice: write a proposed clarification, test it with an ordinary case and then challenge it with a counterexample. Explain what changed in meaning and what remains a decision for the appropriate reviewers. The worked response must say why, not merely mark a choice correct.

Visual: two definition versions with semantic changes identified. Link back to the relevant Explore explanation instead of repeating it in full.

### C3 · Review a diagram and its relationships

**New:** `contribute/review-diagrams-and-relationships`

Reader task: turn a visual concern into an actionable statement about meaning.

Read edge direction and scope, check identity versus connection, parts versus wholes, omitted subjects and qualified participation. Give the reader a flawed diagram which cannot distinguish two report versions or roles in different arrangements.

Practice: identify the offending statement, explain the resulting misunderstanding and propose the missing distinction. Do not require a graph editor or knowledge of how to encode a qualified relation.

Visual: compact before/after maps with numbered edges and complete sentence equivalents. Numbering locates feedback; it is not an ontology identifier scheme.

### C4 · Review choices and mappings

**New:** `contribute/review-vocabularies-and-mappings`

Reader task: review a governed choice or proposed correspondence using its definitions and intended use.

Work through an ambiguous list, a missing case, overlapping choices and two near-matching terms from different contexts. Inspect definitions, exclusions, source versions and the practical consequence of the proposed mapping. Explain why a spelling match is insufficient.

Practice: propose a distinction, ask for evidence or reject an unsupported equivalence. Include a justified correspondence under complete fictional premises as well as a case where no mapping is supported.

Visual: readable vocabulary and two-sided mapping specimens. This applies E6/E7; it is not another basic vocabulary overview.

### C5 · Test a rule with ordinary and difficult cases

**New:** `contribute/review-rules-and-exceptions`

Reader task: provide cases that reveal whether a requirement expresses the intended meaning.

Teach ordinary cases, boundaries, repeated values, conditional applicability and missing evidence. Use a complete fictional requirement and records that meet it, fail it and cannot be assessed. State the reason for each outcome in text.

Practice: vary one condition and predict whether the result changes. Write a review note explaining whether the problem lies in the rule, the record or absent evidence. Unknown is not automatically success or failure.

Visual: case matrix with a small change comparison. No scoring, certification or automated adoption claim.

### C6 · Bring evidence others can interpret

**Retained:** `contribute/bring-evidence`

Reader task: make a source's relevance, limitations and handling conditions inspectable.

Retain the evidence envelope, permissions discipline and version distinction. Add actual fictional excerpts showing a discrepancy and an interpretation gap. Identify the relevant passage, source and version, intended use, what it supports and what it does not.

Practice: distinguish source wording, your interpretation, proposed meaning and the unresolved question. Prepare a restriction-aware description without copying material that cannot be shared. Link current upload mechanics to the canonical member guide; do not duplicate volatile instructions.

Visual: annotated source excerpt and envelope. Readability and provenance do not establish semantic truth.

### C7 · Read a candidate and compare a change

**New:** `contribute/read-and-compare-a-candidate`

Reader task: use a real candidate page, then assess whether a proposed revision preserves a coherent agreement.

Move the one maintained candidate scaffold here, checking its route, version, anchors and actual status. Explain resource definition versus teaching instance. Teach the difference between technical determination, later domain review, release and external recognition. A diagram used for teaching does not prove the candidate implements that example.

Show a separate, explicitly fictional revision across relevant glossary, dictionary, vocabulary, resource and relationship views. Identify views correctly left unchanged. Never present this invented comparison as actual repository history.

Practice: produce a version-linked issue describing a consequence, evidence and question. Readers arriving with a candidate link should be able to enter here directly; introductory lessons are references, not prerequisites.

Visual: V20 annotated page anatomy and change specimen. Preserve one source of truth for candidate freshness rather than copying live records throughout the course.

### C8 · Follow feedback, disagreement and revision

**Retained:** `contribute/what-happens-next`

Reader task: recognise a reasoned response and identify what remains unresolved.

Follow a worked question through a request for evidence, proposed correction, checks, human disposition and subsequent challenge. Contrast a wording problem, a source conflict and a legitimate contextual difference. A retained distinction can be a successful outcome; agreement need not erase every difference.

Practice: examine an inadequate “resolved” response and state what it omits: reason, changed meaning, evidence, remaining limitation or follow-up. Explain adopted authority boundaries while keeping proposed processes visibly proposed.

Visual: a compact question/response/revision sequence. No invented response deadlines, ratification thresholds or promise that a website comment automatically becomes a decision.

## Coverage, not quotas

The [eight retained concerns](../../adr/ADR-0063-domain-led-bounded-context-working-groups.md) have explicit explanation and practice owners:

| Concern | Explanation | Applied review |
|---|---|---|
| Domain structure | E1–E3 | C2–C3 |
| Vocabulary and taxonomy | E6 | C4 |
| Classification metadata | E6, E9 | C4, C7 |
| Validation and constraints | E8 | C5 |
| Cross-context mappings | E7 | C4 |
| Provenance and quality | E5 | C6–C7 |
| Temporal state and history | E2, E4–E5 | C5–C7 |
| Sensitivity and access semantics | E9 | C6–C7 |

The original 26-task Astra inventory is preserved through consolidation: relationship/part/whole joins identity in E1; events/state joins roles in E2; dates and quantities have separate owners E4 and E3; claims and uncertainty share E5; taxonomy/facets joins names and choices in E6. Diagram reading starts in U1 and is applied in C3. Six-output recognition belongs to U2, while cross-view revision belongs to C7. Benefits and the working method gain explicit owners U3/U5.

Expected writing scale is substantial: roughly 900–1,400 words for many chapters, with integrated Explore chapters potentially longer. Astra's 24,000–30,000-word capacity estimate is not an authoring target, minimum, budget or completion gate. Explanation, examples and findability decide the final length. The final recommendation and any dissent about page count are recorded in the deliberation.

## Selective reading

- Understand the idea: U1 → U2 → U3, then U4 if a joined-up example helps.
- Contribute before a model exists: C1, with C6 for evidence.
- Review a candidate now: C7 → the relevant review chapter; consult Explore as needed.
- Investigate a difficult distinction: enter the relevant Explore chapter directly.
- Make formal modelling decisions: choose the separate Ontology modelling route.

Provide these as concise descriptive links on relevant landings. Do not add another global navigation system, duplicate the bottom page navigation, introduce five new mnemonic moves or require a progress account.

## Current-route and fragment treatment

All eight existing chapter routes remain. Re-authoring is not constrained to their existing component compositions. Inventory old fragment identifiers before moving sections. Keep a meaningful short explanation and direct link at an old fragment when its detailed teaching moves; adding an anchor only to the new page does not repair an old URL fragment.

In particular, move the candidate scaffold from the property story to C7 without duplicating its mutable evidence. Retain the old story entry point and link directly to the new scaffold. Where U1's benefits or landing FAQs move to U3, preserve useful entry anchors and concise summaries. Update the single navigation registry, search entries, related links and location-sensitive tests together.

Retain one canonical glossary. New teaching terms must link to real, verified anchors; do not add a second “beginner glossary”. Avoid asserting a new route or link exists until implementation creates and validates it.
