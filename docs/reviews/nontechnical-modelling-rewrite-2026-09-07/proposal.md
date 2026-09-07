# Re-author the non-technical Modelling section as an illustrated field guide

Status: local proposal following the requested Astra Ultra/Fable swarm rerun. Not adopted, implemented, published or learner-validated.

Source baseline: OPDA commit `bd5f42af`, 7 September 2026. Review branch: `review/modelling-learning-rewrite`.

The review ran across midnight and completed on 8 September 2026. The directory date records the original request and baseline.

## Recommendation

Create a substantial counterpart to **Ontology modelling**, designed for people who know property work but do not practise ontology engineering. Start with **22 chapters: five Understand, nine Explore and eight Review and contribute**. Preserve the full learning breadth, with permission to split compound chapters where drafting demonstrates a real need. Do not make page count or a word total a success measure.

The central change is from a short introduction with repeated inspection-date examples to a field guide in which readers can see the agreement being built, understand the difficult distinctions and practise useful contributions. It should be compelling enough to explain and advocate OPDA's approach, but honest about costs, unresolved evidence and what a model cannot guarantee.

Build around actual specimens of the six aligned outputs, twenty purposeful visual briefs, six differentiated professional illustration briefs and visible worked exercises. Keep Harbour Court as a coherent anchor, then vary subjects and arrangements so people learn judgement rather than character names. Keep the existing three learning route families and show the separate ontology-modeller route clearly.

This is the integration owner's recommendation after cross-critique, **not a unanimous chapter-count vote**. Fable ultimately prefers 26 chapters; Astra supports a smaller initial allocation with justified splits. The first split—measurements versus dates—has already been made in this proposal. See [deliberation](deliberation.md).

## Documents

| Document | Use |
|---|---|
| [Curriculum and route map](curriculum.md) | Every chapter's question, teaching, examples, practice and visual ownership; coverage and migration treatment |
| [Visual atlas and prototype spreads](visual-atlas.md) | Twenty teaching compositions, six professional task briefs, two detailed sample page compositions and accessibility contracts |
| [Deliberation and evidence](deliberation.md) | Actual model roles, competing positions, corrections, held dissent, source authority and recovery of earlier work |
| [Original rerun brief](brief.md) | Scope and discussion questions supplied to the independent reviewer |
| [Fable independent review](fable-review.md) | Preserved first-round response, including findings later corrected |
| [Fable cross-review](fable-cross-review.md) | Preserved second-round response to the initial Astra proposals; subsequent adjudication is in the deliberation |

## Why the current section is insufficient

The source audit covered the overall Modelling landing, three non-technical journey landings and eight existing teaching chapters. The earlier enrichment was real: form/tree/graph comparison, role/state questioning, visible practice, cross-profession prompts and a maintained real-candidate reading scaffold are present. They should not be reported as unfinished additions.

The limitation is allocation and depth. An inspection/report-date correction is explained repeatedly while other important questions receive a paragraph, a callout or no sustained worked example. The six outputs are named but not sufficiently inspectable as a coherent set. Measurements, qualified relationships, rules, uncertainty, practical diagram review and vocabulary review need the same care as identity. Benefits, objections and the participant's view of the method need their own substantial explanations.

Source also reveals design risks: a fixed-canvas figure placed in a half-width comparison; repeated visual compositions; stale disclosure wording; and technical details that can distract from the non-ontologist task. These are source findings, not a claim that the current browser was visually tested.

The answer is not simply larger type, more cards or another decorative illustration. It is richer explanations, carefully chosen visual forms and worked examples that expose what the reader can actually conclude.

## What readers should be able to do

After using the relevant parts—not necessarily every chapter—a reader should be able to:

1. Explain semantic modelling and ontologies in ordinary language, why OPDA uses them and what they do not guarantee.
2. Recognise a glossary, dictionary, taxonomy, vocabulary, resource definition and relationship as aligned views of one agreement.
3. Read a labelled connection, identify its subjects and distinguish identity, containment, classification and reference.
4. Ask about the setting of a role, basis of a measurement, meaning of a date, source of a claim or condition of a rule.
5. Work within the documented contextual boundaries and recognise a proposed mapping that loses or invents meaning.
6. Distinguish absent, unknown, inapplicable, withheld, negative and conflicting information.
7. Explain relevant sensitivity, purpose and permission distinctions without mistaking a model for an enforcement system.
8. Bring a useful question or evidence before a candidate exists; review a definition, diagram, choice, mapping, rule or candidate when one does.
9. Explain why a proposed revision helps, what it leaves unchanged and what remains unresolved.

These are editorial learning outcomes, not measured results. Real improvement must later be assessed through what readers can explain or do, not AI agreement or page completion.

## Audience and scope boundaries

“Non-technical” means **not requiring ontology engineering**, not assuming low competence. Domain practitioners, data stewards, analysts and technically experienced non-ontologists all belong here. The formal representation choices and selected RDF/OWL, RDFS, SKOS, SHACL, SPARQL and other profiles belong to the separate Ontology modelling section.

We are developing a specification and relevant trust-governance recommendations, not operating a data application. Within this learning section:

- Focus on domain meaning and ontology modelling, not JSON-LD design. JSON-LD is briefly identified as a generated artefact.
- Treat the context boundaries as established inputs. Profession, working group, system and semantic home are related but distinct.
- Explain model-review governance only as needed to understand participation and status. It is not synonymous with the wider government-related SPDTF Trust Framework.
- Explain relevant privacy, purpose, access, provenance and time semantics. Do not turn the section into scheme accreditation, consent administration, runtime security or service-operations training.
- Keep source evidence, accepted method, proposed processes, candidate implementation, technical determination, domain review, release and external recognition distinct.
- Do not promote the historical schema-derived corpus as an adopted predecessor scheme, discard it as useless, or silently change its identifiers or content.

These boundaries follow [ADR-0063](../../adr/ADR-0063-domain-led-bounded-context-working-groups.md), [ADR-0064](../../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md), [ADR-0067](../../adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md) and their dated clarifications. Broader operational processes in ADR-0065/0068 remain proposed. This review creates no new ADR and changes none of those sources.

## Information architecture

Use one overall Modelling landing that plainly offers two kinds of help: understand and contribute domain meaning, or undertake ontology modelling. Inside the learning side:

| Entry | Chapters | Promise |
|---|---:|---|
| Understand | 5 | Why this matters, what we are building, benefits and limits, a joined-up example, how the work is done |
| Explore the model | 9 | The distinctions that make information usable: subjects, roles, quantities, time, evidence, names, contexts, rules and sensitivity |
| Review and contribute | 8 | Bring a question or evidence; review definitions, diagrams, choices, mappings, rules and candidates; follow a reasoned revision |

Retain `/understand`, `/explore` and `/contribute` beneath `/semantic-modelling`. All eight existing chapter routes remain; fourteen proposed routes add real content. Re-author their content and compositions instead of merely extending the old sections. Maintain one navigation registry and one canonical glossary.

Short descriptive links such as “See what we are building” and “Read a candidate now” can provide direct entry. They do not become four additional rail groups or a second layer of courses. Someone arriving with a candidate page does not have to complete the introductory lessons first.

The chapter map is an editorial ownership record, not a new executable curriculum language. Update it whenever chapters merge or split. Existing navigation data should continue to own routes and titles; do not add automation pretending to prove that a concept is taught well.

## Teaching and visual approach

Explain with a recognisable situation, a real specimen or precise diagram, and a worked review action. Use complete fictional premises where a warranted answer is possible, incomplete cases where identifying evidence is the skill, and real candidate material where unresolved status is part of the task. Do not make every exercise end inconclusively.

The two recommended design prototypes are **What we are building** and **Measurements, amounts and values**. The first exposes the six outputs as three readable paired spreads; the second gives a new, concrete 68 m²/72 m² inclusion-basis example followed by a changed-evidence case. Their complete compositions are in the atlas.

Six professional task briefs supply differentiated imagery: listing state, lending participation, measurement basis, contextual event meaning, source-version evidence and meaning-preserving representations. They are not six automatically mapped contexts. Use the existing colourful ink/watercolour style with matched light/dark compositions. Precise labels and relationships remain in HTML and authored diagrams, never generated raster text.

Preserve the shared 1024px prose measure, left-aligned block, paragraph treatment, semantic callouts, navigation, accessibility and typography contracts. Give the new learning compositions a simpler, sentence-led visual grammar than the technical reference. Do not hide core explanation in accordions, duplicate bottom navigation, impose oversized images or create a wall of decorated cards.

## Suggested implementation sequence — not executed

Each future slice should be a coherent, verified local commit. A small first slice is a way to test the design, not the entire requested ambition.

### 1. Prove the teaching and visual direction

Draft U2 and E3 completely, including specimens, exercises and purposeful visuals. Establish the shared reading and practice treatment from these real pages, rather than building all seven visual families in advance. Check definition/instance separation, controlled-choice scope, the determinate measurement answer and the changed-case evidence gap.

At the same time, perform the source/authority checks needed by C7 and E7: actual candidate version and page structure, old scaffold anchors, established boundary sources, Common supply arrows and candidate mapping status. These checks do not require drawing every chapter first.

Allow further splits when a manuscript needs separate introductions, unrelated worked premises and separate practice to discharge its tasks. No reader recruitment is required to identify that editorial problem. Watch E1 identity/relationships, E2 roles/change and E5 evidence/uncertainty especially. A preferred route count must not bury teaching.

### 2. Deliver the complete conceptual offer

Rewrite the overall and journey landings, U1/U3/U4/U5 and the remaining Explore chapters. Use one consistent scenario record where facts recur and distinct changed-feature cases where transfer matters. Add professional art to its actual learning task, not as a block of generic pictures.

For each retained concern, verify that a reader can find a substantive explanation and a worked case. Keep the technical method separate, with a short optional handoff where useful. Link authoritative references without filling beginner pages with source-decision mechanics.

### 3. Deliver the practical review offer

Complete C1–C8. Move and verify the real candidate scaffold once. Supply definition revisions, diagram repairs, choice/mapping comparisons, rule cases, evidence excerpts and a worked feedback disposition. Link volatile participation mechanics to their existing canonical guidance.

Where a section moves, keep a useful summary and direct destination link at its former fragment. Merely putting the old ID on a new page cannot repair the old URL. Update route, navigation, search, glossary and fragment assertions with the content change.

### 4. Check the whole section and hand it over

Review light/dark, narrow content tracks, zoom, keyboard use, complete text equivalents and representative print output using the existing OPDA Chrome session. A source test is not visual verification. If that binding is unavailable, report the exact limitation; do not launch another browser.

Future code/site changes follow the repository's `make test` and `make build` requirements. Extend relevant existing checks for route existence, fragments, glossary links, candidate status, safe rendering and accessible figure equivalents. Prefer structural/behavioural checks to exact paragraph strings or fixed page-count assertions. Do not rebuild CI/CD, add a heavyweight harness or test the whole ontology merely to approve a prose change.

An optional user-arranged practitioner read-through would provide valuable evidence of findability and understanding. It is not authorised contact, a recruited study or a prerequisite for drafting. Record actual hesitations and reasoning if it later occurs; do not invent learning gains.

## Acceptance criteria for the later rewrite

- Both audiences are recognisable on the landing and each page has a clear reader task.
- Every retained modelling concern has substantial plain-language explanation and applied practice, as mapped in the curriculum.
- The six outputs are inspectable specimens, with resource definitions distinct from example instances and no second maintained candidate corpus.
- Benefits have conditions and limits; the treatment of alternative methods, existing schemas and AI is accurate rather than promotional caricature.
- Cases include supported conclusions, difficult variations and evidence gaps. A missing conditional antecedent is not automatically a validation failure.
- Context boundaries, candidate status and real participation mechanisms agree with maintained sources. Example mappings and revisions do not become claims of current implementation.
- Explanations survive absent images, narrow tracks, dark/light, print and keyboard use. No essential content requires a disclosure or special interaction.
- Current routes, useful fragments, search entries and glossary links remain navigable. Existing generated content and upstream projects are untouched.
- The user receives the rewritten pages, local verification evidence and a clear status of what has and has not been published. Publication requires a separate explicit instruction.

## What this rerun did and did not do

It recovered the prior proposal's intent, audited the current source, ran two actual Astra Ultra reviewers and an independent native Fable 5.1 reviewer, exchanged critiques, corrected the resulting proposal and saved this local document set. The [deliberation](deliberation.md) distinguishes the older implemented enrichment from the new ambition.

It did not modify website pages, generate illustrations, change ADRs or ontologies, contact participants, inspect Teams, use a browser, deploy or push. It does not claim the non-technical rewrite is implemented. The review documents are the deliverable of the user's request to rerun the discussion swarm.
