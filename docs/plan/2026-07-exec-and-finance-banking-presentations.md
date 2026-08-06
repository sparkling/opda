# July 2026 OPDA presentation and meeting plan

**Prepared:** 2026-07-19
**Scope:** OPDA Exec briefing on Monday 20 July and Finance and Banking working-group
kick-off on Wednesday 22 July.

This note captures the audience analysis, goals, narrative decisions, presentation
outlines, source inventory and final Gamma artefacts developed during the session. It
does not publish the new modelling strategy to the current OPDA website.

## Evidence base

The preparation drew on:

- the calendar invitations and agenda context for both meetings;
- the related OPDA email threads, including Maria's requested ontology deep dive,
  workshop framing and initial mortgage source areas;
- the current OPDA website:
  [ontology](https://opda.org.uk/ontology),
  [mapping](https://opda.org.uk/mapping),
  [schema](https://opda.org.uk/schema/) and
  [modelling](https://opda.org.uk/modelling/);
- the existing PDTF and OPDA presentation inventory in
  `source/05-engagement/presentations`, working-group and regulator folders,
  `source/06-research`, SharePoint, Gmail attachments and Gamma;
- the latest prior Gamma deck,
  [From document standard to data standard — the linked-data evolution of PDTF](https://gamma.app/docs/9dyweg9ntjrt5cw);
- [ADR-0063](../adr/ADR-0063-domain-led-bounded-context-working-groups.md),
  [ADR-0064](../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md)
  and [ADR-0065](../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md);
- the bounded-context and AI-method research notes.

Private meeting links, passcodes, attendee details and restricted email or attachment
contents are deliberately not reproduced here.

### Website style-guide finding

The mailbox audit found no OPDA email delivering a formal website style guide, brand
guide or design-system document. The relevant July website-review thread contains only
high-level direction to use the OPDA brand identity rather than an AI-generated poster,
plus an offer to supply what the project needs. The website revamp should therefore
request the current brand assets and explicit visual guidance rather than treating that
thread as a complete style specification. This dependency is recorded in ADR-0064.

## Shared communication guardrails

Both presentations should:

- describe the current work as a valuable foundation and input;
- avoid "starting again", "from scratch" and "built from the ground up";
- explain ontology in plain business language;
- make clear that participants provide evidence and judgement rather than ontology
  code;
- distinguish AI acceleration from human authority and approval;
- explain `AI → ontology → better AI` without making AI adoption a condition of
  participation;
- say that an ontology **plus tested generators, templates and transformations** can
  support schemas, APIs, forms, web pages, documents, PDFs, emails and integrations;
- avoid claiming the ontology alone automatically generates correct artefacts;
- keep FIBO to a one-line description as an ontology for the finance domain;
- describe controlled vocabularies, taxonomies and validation as practical outputs
  without teaching SKOS or SHACL syntax;
- introduce a data model before introducing an ontology, using a single familiar
  mortgage example to contrast a form or JSON tree with a connected graph;
- describe tree and graph views as complementary: schemas and forms remain useful
  publication and exchange views, while the ontology governs shared meaning;
- distinguish what a working group agrees from the technical artefacts OPDA publishes;
- describe the eleven modelling lenses as business questions and a completeness
  checklist, not eleven separate models;
- introduce AI only after the contribution model is clear, and state that participants
  do not need to use AI or supply unrestricted material to it;
- distinguish live services from planned ones, and never invent a Teams channel,
  working-group email address or website-discussion URL;
- distinguish DBT Smart Data from PDTF and from the property bounded contexts;
- use the current website only as a demonstration of model presentation and review.

## Monday: OPDA Exec Committee

### Meeting context

- **Date and time:** Monday 20 July 2026, 14:00–15:30.
- **Agenda evidence:** the invitation asks for a deep dive into the ontology work;
  related correspondence also covers technology-workstream structure and governance.
- **Presentation allocation:** no precise allocation was found. The deck is modular:
  approximately 30–35 minutes of presentation, 8–10 minutes of website demonstration
  and 10–15 minutes of discussion, leaving time for Maria and other business.

### Audience profile

The Exec audience is responsible for organisational direction, governance, stakeholder
confidence and practical delivery. It needs enough conceptual depth to understand why
the method is changing, but should not be asked to follow ontology notation or AI
architecture.

Likely concerns are continuity, credibility, governance, cost, delivery pace, vendor
adoption, accountability and whether the proposal creates another technical programme.

### Goal

Build confidence that OPDA is moving from a valuable schema-derived foundation to a
more balanced, domain-led and governable modelling programme; show how non-technical
stakeholders participate; and demonstrate how AI can accelerate the work without
displacing human authority.

Maria will handle decisions requested from the Exec. The deck therefore does not
contain a separate decisions slide. Finance and Banking is also not elevated into a
standalone pilot slide.

### Final 17-card narrative

1. **Title and promise** — make property data easier to understand, exchange and reuse.
2. **The industry problem** — meaning is lost across organisational and system
   boundaries.
3. **The existing foundation** — schemas, ontology, mappings, glossary, dictionary,
   validation and website.
4. **What the first phase taught us** — document structure is not sufficient authority
   for domain meaning.
5. **Ontology in plain English** — agreed things, meanings, relationships, rules and
   provenance.
6. **One governed source, familiar outputs** — model-driven artefacts with explicit
   tooling and validation.
7. **A family of bounded domain models** — six property contexts and the DBT Smart
   Data scheme group.
8. **The interoperability layer** — a small common boundary ontology, context map and
   mappings.
9. **Five views of one semantic agreement** — ontology, glossary, dictionary,
   vocabulary/taxonomy and validation.
10. **Nine completeness dimensions** — meaning, trust, correctness and exchange.
11. **How stakeholders participate** — evidence and review, not ontology syntax.
12. **AI-assisted modelling** — multiple agents, expert perspectives and models turn
    evidence into a challenged draft.
13. **AI → ontology → better AI** — faster modelling followed by better-grounded future
    automation.
14. **Human governance** — visible drafts, feedback disposition, release candidate and
    vote.
15. **Website demonstration** — review interactions, with the current content clearly
    labelled as today's model.
16. **Delivery rhythm** — bounded increments, parallel working groups and visible
    revisions.
17. **Close** — preserve continuity, widen participation, accelerate delivery and
    prepare for future implementation.

### Adversarial review incorporated

The final narrative removes:

- any implication that the existing work is being abandoned;
- a single universal-model or central-cathedral framing;
- a separate "Decisions requested from the Exec" slide;
- a separate "Finance and Banking is the first pilot" slide;
- magical downstream-generation claims;
- AI-as-replacement language.

It restores strengths from the previous Gamma presentation: the structure-versus-
meaning distinction, linked data in plain language, stakeholder value, established
sector precedent, model-driven generation and AI potential.

### Gamma versions

**Latest Gamma-led version:**
[Building a Shared Language for Property Data](https://gamma.app/docs/Building-a-Shared-Language-for-Property-Data-qvh7x24s9hpx4yv)

- 17 cards, 16:9.
- Sprout theme.
- Gamma generated the card structure, copy, Smart Layouts and visual treatment from
  the audience, narrative and content guardrails.

**Earlier tightly steered version:**
[Making OPDA standards easier to build, use and evolve](https://gamma.app/docs/Making-OPDA-standards-easier-to-build-use-and-evolve-pbqdg10ny6exrtu)

- 17 cards, 16:9.
- Copy and card boundaries were authored before generation.
- Native Smart Layouts and Smart Diagrams with restricted imagery.

## Finance and Banking working-group kick-off: revised presentation brief

### Meeting context and timing

- **Duration:** 1 hour 40 minutes in total, including questions during and after the
  presentation.
- **Opening and close:** Maria opens with a 10-minute introduction and delivers the
  final wrap-up.
- **Meeting character:** a free-flowing working-group orientation. Questions are
  welcomed throughout; there is no separate facilitated-discussion exercise.
- **Date handling:** the previous deck's date and 90-minute label are stale. The new
  decks should not print a date until the final invitation has been verified.

The content is designed for approximately 60–65 minutes of explanation and website
demonstration, with 15–20 minutes of questions distributed naturally through the
session and the remaining time reserved for Maria's opening and close. The presenter
should pause after the tree-versus-graph explanation, after the working-group map and
after the ways-of-working section rather than adding question-prompt slides.

### Audience profile

The audience is expected to include mortgage lenders, brokers and distributors,
technology vendors, data providers, property and conveyancing professionals, and
government or industry bodies. Technical literacy will be mixed. Most participants
will not have encountered ontologies, and many vendors and stakeholders will not be
focused on AI.

Likely concerns are whether they need specialist skills, whether OPDA is discarding
work, whether AI can be trusted, whether participation creates technology obligations,
how confidential sources are handled, and how their feedback changes the result.

### Goal

By the end, participants should:

- understand what a data model is and how a graph-based ontology differs from a
  tree-shaped form or JSON Schema;
- understand that the ontology and tested mappings/generators can publish the schemas,
  documents and website views they already recognise;
- feel confident that they do not need ontology or AI expertise;
- know where discussion, source intake and page-specific feedback will happen;
- be ready to supply relevant source material once the intake route is confirmed; and
- understand how successive model candidates become a first official working-group
  draft without implying that the final consensus mechanism is already settled.

The central message is:

> **You bring the domain knowledge. Henrik turns it into a reviewable model with
> AI assistance. The working group challenges the meaning and remains accountable for
> the result.**

### Gamma content: 19-card narrative

1. **You bring the expertise; OPDA makes it reviewable.** Immediate reassurance: no
   ontology knowledge, graph tooling or AI adoption is required.
2. **Meaning is lost at the hand-offs.** Forms and schemas carry data, but unstated
   definitions and assumptions are repeatedly translated.
3. **What is a data model?** An agreed map of the important business things, their
   descriptions, relationships and rules.
4. **Forms and JSON are usually tree-shaped views.** They are excellent for a chosen
   workflow, document or exchange contract.
5. **An ontology is a connected graph of shared meaning.** It links the same concepts
   across several views and contexts without asking members to learn its notation.
6. **One governed model can support familiar outputs.** Show the ontology plus
   mappings, generators, templates and tests producing schemas, forms and documents.
7. **Evolution, not replacement.** Existing schemas, mappings, glossary, dictionary,
   validation and website remain valuable evidence and compatibility inputs.
8. **From schema-led derivation to domain-led evidence.** Explain the domain-led,
   evidence-up method without implying a restart or ungoverned decentralisation.
9. **One word can carry several legitimate meanings.** Use “property” to show why
   Finance, Conveyancing, Surveying and Valuation, Estate Agency and Data Services need
   explicit contextual distinctions and mappings.
10. **A family of working groups.** Finance and Banking; Conveyancing; Estate Agency;
    Surveying and Valuation; Property Data Services; Property Technology; and DBT Smart
    Data as a cross-sector scheme group.
11. **Interoperability aligns boundaries.** Selected representatives maintain a small
    common boundary ontology, mappings and shared conventions without controlling each
    domain's internal meaning.
12. **What this group will define.** Business glossary, data dictionary, taxonomies,
    controlled vocabularies, resources and relationships.
13. **What OPDA will publish.** RDF ontology, generated JSON Schemas,
    website/PDF/Markdown documentation and a possible optional ontology-to-schema
    runtime.
14. **Eleven lenses, four outcomes.** Meaning: domain structure, controlled vocabulary,
    taxonomy, classification. Trust: governance and compliance, provenance and quality,
    sensitivity and access. Correctness: validation constraints, time and history.
    Exchange: cross-domain mappings, common ontology. This is a checklist, not eleven
    models.
15. **First, collect the evidence.** Schemas, forms, standards, policies, rules,
    examples, data, diagrams, screenshots and exceptions, with provenance, permission
    and sensitivity recorded before ingestion or publication.
16. **One collaboration space, clear channel roles.** Teams is the discussion hub and
    members should use topic threads. The forthcoming working-group email is for source
    intake and contact, not a mailing list. A planned page-level discussion system will
    attach feedback to web model pages. All material feedback feeds one issue and
    disposition record.
17. **AI helps produce candidates; people remain accountable.** Henrik leads modelling
    and publication. AI accelerates extraction, comparison, drafting and checking from
    several perspectives. Sources, uncertainty, dissent, tests and human judgement stay
    visible; participants do not need to operate AI.
18. **Candidate, publish, review, revise.** Iterate model candidates and generated
    schemas/site views until stable enough for a first official working-group draft.
    Consensus and resolution mechanisms must be defined before normative approval and
    are not presented as settled.
19. **What happens next.** Maria will communicate the agreed collection route, Teams
    channel and email details. Participants share resources. Henrik produces the first
    model candidate and publishes it in Teams for review.

The closing formulation is:

> **You do not need to become an ontologist or adopt AI. Bring the evidence, challenge
> the meaning and help us decide when the model represents Finance and Banking well.**

### Web presentation content: 22-screen narrative

The web version uses the larger canvas for connected explanations and purposeful
interaction. It is not a transcription of the Gamma cards.

1. **Welcome** — the promise, working-group identity and a calm opening visual.
2. **What today is and is not** — no technical prerequisite, ontology authoring or AI
   adoption; questions welcome throughout.
3. **Handoffs** — an interactive mortgage-information journey showing translation,
   re-keying, ambiguity and lost provenance.
4. **Evolution, not replacement** — existing assets feed a domain-led, evidence-up
   process.
5. **What is a data model?** — a plain definition grounded in one mortgage example.
6. **Forms and schemas organise data as a tree** — a familiar electronic form beside
   its JSON-shaped hierarchy.
7. **An ontology connects knowledge as a graph** — the same applicant, mortgage,
   property and evidence with labelled relationships.
8. **Same knowledge, different views** — selecting a concept highlights it across the
   graph, JSON tree and form.
9. **Members do not work with the graph** — OPDA uses governed mappings, generators,
   templates and tests to publish familiar views.
10. **Why separate domain models?** — selectable legitimate meanings of “property”
    connected by mappings and a small shared boundary.
11. **A governed family of working groups** — six property groups and DBT Smart Data,
    with Interoperability shown as an alignment band rather than a controlling hub.
12. **What this group defines** — business glossary, data dictionary, controlled
    vocabularies, taxonomies, resources and relationships.
13. **What OPDA publishes and generates** — RDF, JSON Schemas, web/PDF/Markdown and an
    optional runtime, with current/planned/optional status labels.
14. **One completeness lens, eleven themes** — four information-rich outcome panels
    with selectable business questions.
15. **The website becomes the working surface** — graph, definitions, glossary,
    dictionary, schema, change history and discussion; current demonstration and future
    candidate surfaces are clearly separated.
16. **First step: share what already exists** — source categories and examples.
17. **Resources become the first model candidate** — source register and handling gate
    before Henrik-led, AI-assisted modelling, generated views and group review.
18. **What AI helps with and what it cannot decide** — an explicit responsibility
    split with no robots or hype imagery.
19. **Publish, review, revise, repeat** — stop at a stable, versioned first official
    working-group draft; consensus and normative approval remain separate decisions.
20. **Where each conversation belongs** — Teams threads, intake email and page
    discussions converge on one issue and feedback-disposition record.
21. **What happens after this session** — OPDA confirms logistics, participants share
    resources, Henrik publishes the first candidate and feedback starts the next cycle.
22. **You bring the knowledge; OPDA makes it reviewable** — questions and hand-back to
    Maria.

### Pre-build adversarial review incorporated

The Gamma and web narratives above already incorporate the following corrections:

- ontology and AI no longer precede the familiar data-model/tree explanation;
- graph and tree are complementary views rather than competing technologies;
- every generation claim names mappings, generators, templates and tests;
- “bottom-up” is paired with continuity, domain governance and interoperability;
- domain-specific property meanings are paired with mappings to avoid endorsing
  fragmentation;
- model content and published artefacts are presented separately;
- the eleven lenses are phrased as questions, not as a technical bureaucracy;
- AI is a supervised drafting aid rather than a decision-maker, endorsement or
  technology obligation;
- broad resource collection has a provenance, permission and sensitivity gate;
- Teams, email and web feedback have distinct purposes and converge on one tracked
  disposition record;
- all not-yet-created channels and tools are labelled forthcoming or planned;
- the current website is disclosed as a schema-derived demonstration before it is
  shown; and
- the candidate lifecycle does not pretend that consensus, resolution or normative
  approval mechanisms have already been agreed.

The revised narrative deliberately removes the initial mortgage discussion starter,
facilitated discussion, prioritisation text areas and “three things from each
organisation” ask.

### Final web-deck adversarial review incorporated

The implemented 22-screen web deck was reviewed independently from the Gamma
content and then checked in the browser at both a 2133 × 1200 presentation viewport
and a narrower 952 × 1094 viewport. The final pass:

- made the working-group email's “not a mailing list” role visible without requiring
  interaction;
- connected AI-assisted ontology development to better-governed future AI while
  retaining the explicit no-adoption requirement;
- changed the first-candidate wording so it does not imply publication into the
  current schema-derived website before the future review surface is ready;
- kept all forthcoming Teams, email and website-discussion details visibly
  provisional;
- prevented native hash navigation from horizontally scrolling the clipped slide
  canvas when a deep link opens a slide that was previously translated off-screen;
- verified 22 unique slide identifiers, direct hash navigation, overview search,
  keyboard controls and the model, channel and completeness-lens interactions; and
- confirmed that dense widescreen slides fit the canvas without content overflow.

Repository validation passed with 29 tests and a complete ontology-backed static
build (`make build-data`, 1,852 pages).

### Previous Gamma retained as historical input

[OPDA Finance and Banking workshop presentation](https://gamma.app/docs/Making-mortgage-data-easier-to-understand-exchange-and-reuse-0gp6nq21z11msdq)

- 17 cards, 16:9.
- This deck is retained and is not overwritten. The revised 19-card content above is
  the fact-locked source for three new Gamma-led alternatives.

### Corrected Gamma regenerations

The three alternatives were regenerated as new 19-card, 16:9 Gamma files after the
final report-only review of their predecessors:

- [Reassurance-led](https://gamma.app/docs/64dx6p1m6prg01m)
- [Familiar-tools-led](https://gamma.app/docs/zswcxp2sjzt2b26)
- [Participation-led](https://gamma.app/docs/oiim1s3zxbf2bsr)

The regeneration fact-locks correct the group taxonomy, contextual “property” example,
candidate-governance wording, participation model, eleven-lens scope and future-site
publication status. They also require native editable Gamma layouts for the
working-group structure and eleven-lens checklist. A post-generation content check
confirmed 19 cards in each deck, no generated infographic elements, and no recurrence
of the reported factual errors. Earlier Gamma files remain untouched.

## Demonstration checklist

Use the current website to demonstrate interaction patterns:

- an ontology graph;
- a class or term page;
- semantic descriptions and examples;
- glossary and data-dictionary views;
- mappings and validation in business language.

State before the demonstration that the site documents the current schema-derived
model. It is not the draft Finance and Banking ontology and is not being presented for
approval at the workshop.

Prepare a static backup for the demonstration. Do not rely on a live ontology build
unless the local generator and validation environment have been verified beforehand.

## Supporting analysis

The detailed stakeholder pushback and responses are maintained in
[AI-assisted working-group ontology development](../research/ai-assisted-working-group-method.md).
The working-group structure, six content outputs and eleven modelling lenses are maintained in
[the bounded-context research note](../research/bounded-context-working-group-approach.md).
