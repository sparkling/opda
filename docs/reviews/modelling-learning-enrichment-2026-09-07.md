# Modelling learning enrichment — proposal

Date: 7 September 2026. Status: **recommendation for review, not an adopted decision or implementation plan authorised for execution**.

Evidence baseline: `a56502011226590e8271eeb30bdca1ac0a6ea4c9`. This report is local-only. It changes no website, navigation, ADR, ontology, learning content or external source. Publication, participant contact and implementation require separate instructions.

## Recommendation

Enrich the existing Understand → Explore → Contribute journeys around a practical outcome: **a participant can read a candidate and offer a useful, evidence-aware challenge without learning ontology syntax**. Keep the Harbour Court story, existing distinctions and shared navigation. Add a familiar-form-to-connected-model comparison, short reasoned practice, and one guided candidate-page reading; then test those additions before expanding them.

Provide non-ontologist technical implementers with a separate, optional handoff into Ontology modelling. Do not turn practitioner learning into a compressed ontology-engineering course, or make completing a course a prerequisite for contributing. “Ontology modelling” is the reader-facing section label; its `/method` paths and internal registry keys remain unchanged.

## 1. Purpose, authority and evidence

The governing ADRs were read before synthesis. Their dated amendments control over retained historical wording.

| Source | Governing consequence for learning |
| --- | --- |
| [ADR-0063][D63], accepted, especially §§2, 3a, 5–6 | Domain participants own meaning and contribute through definitions, diagrams, examples, questions and business rules. Facilitators produce formal artefacts. Explain familiar trees and connected graphs. The first group is resource-first, not a live ontology-authoring workshop. |
| [ADR-0064][D64], accepted, 5 September update and revamp scope | Serve plain-language participation and technical method as distinct audiences; preserve model status, provenance and the non-technical review surface. A content change does not authorise publication. |
| [ADR-0067][D67], accepted, §§1–4 and human-promotion boundary | Source fields do not determine ontology structure. Contexts own meanings; a Property Pack is a profile spanning contexts. Technical conformance, domain judgement and authorised promotion are separate. |
| [ADR-0074][D74], implemented with dated amendments | Keep the canonical `/semantic-modelling/**` family and shared templates. The current four journeys implement the broader two-audience intent. Do not revive the removed repeated journey widget or duplicate governance/glossary records. |
| [ADR-0075][D75], accepted, accelerated determination and independent statuses | The Property Pack's Technical Working Group determination precedes later wider domain review under the scoped exception; do not teach an all-domain-review prerequisite for that milestone. Technical Working Group is not the Property Technology group. Determination, domain review, release and external recognition remain separate. |
| [ADR-0065][D65], **proposed** | Useful background on the intended evidence-to-model cycle, not proof that its operating process, bulletin board or approval mechanism is adopted or live. The later accepted scope is eight concerns, not its retained eleven-dimension wording. |

The selected upstream method revision is `67174057e6384b79d0b28b7736fe70a66e112895`, as recorded in ADR-0063 and the [local decision register][decisions]. Local rewritten OPDA ODR numbers and upstream source ODR numbers are different identifiers. This learning proposal neither adopts a newer source revision nor modifies the original `semantic-modelling` project on `hz`.

Evidence grading used in this synthesis:

- **Direct authority:** accepted/implemented ADR requirements, with amendments and scope preserved.
- **Direct observation:** local page, component, navigation and candidate sources at the stated baseline; this establishes authored content, not live service health or rendered usability.
- **Supporting rationale:** repository working-group research and presentation plans. Their historical workflow details are not current operating instructions.
- **Design hypothesis:** proposed exercises, sequencing and expected learning value. No participant research, learning-impact measurement or conversion statistics were obtained; no effectiveness claim follows from the content audit.

Bounded source research preceded synthesis. The integration owner's separate source-informed review challenged the complete proposal for authority, scope, source fidelity and participant accessibility; it found no remaining material issue after the editorial corrections. This is a bounded review, not independent research-agent consensus or participant validation. Ruflo recall produced no usable learning evidence, and explicit user-database continuity was not established. No CLI memory fallback or direct database access was used. This is a repository-grounded proposal, not a learning-science literature review.

## 2. Audiences and observable outcomes

These are design audiences derived from the ADRs, not research-validated personas.

| Audience | Useful outcome | Not required / authority boundary |
| --- | --- | --- |
| Domain practitioner: conveyancing, agency, finance, surveying, data services or technology | Explain a term in its setting; identify the subject of a statement; read one relationship; supply a normal case, exception, evidence or question and its consequence. | No RDF/OWL/SKOS/SHACL, graph editor or ontology-authoring competence. A well-founded question is enough; replacement wording is optional. |
| Occasional reviewer, group lead or governance reader | Locate candidate status, semantic owner, sources and unresolved issues; distinguish a software check from human review and authorised promotion. | Do not infer adoption from a polished page, common-boundary placement, AI agreement, a comment count or government use. |
| Non-ontologist developer, analyst or integrator | Preserve the distinction between business meaning, data shape and validation; explain what an existing payload loses; carry a scoped question into Ontology modelling with examples and uncertainty intact. | Not a second normative method, a universal JSON-to-ontology conversion recipe, or authority to settle domain meaning. |
| Facilitator or content maintainer | Help a participant make a bounded challenge and maintain consistent examples across readable and formal views. | Do not convert a teaching answer, workshop majority or AI recommendation into model approval. |

A successful first contribution is modest: the question or statement being challenged, a practical consequence and a fictional counterexample or permitted source; include page/version when one exists. Evidence-first participants can begin with a scoped question and source before a candidate exists. Context and evidence standing should be clear; the contributor need not fill every specialist field before asking for help. This extends the existing [worked feedback note][review] and [evidence guidance][evidence], not a new submission requirement.

## 3. Existing strengths and specific gaps

The current material already does much of the difficult conceptual work. Preserve its question-led opening, explicit limits, continuing fictional case, readable edges, identity/evidence distinctions, legitimate context differences, actionable contribution guidance and separate required method in Ontology modelling.

| Current source and strength | Observed gap or risk | Bounded enrichment |
| --- | --- | --- |
| [Understand][understand] reassures readers and offers a safe first action; [shared meaning][shared] explains why a formatted date may answer the wrong question. | The `tree-graph` fragment now lands on a dictionary/relationships comparison; no worked familiar form/tree and graph pair shows the same case. | Add one complementary-views example at that existing section, not another ontology introduction. |
| [Property story][story] distinguishes building, dwelling, report versions, claim and role, and leaves subdivision open. | Its final real-model task is a generic link plus questions; readers must translate the story into an unfamiliar candidate page themselves. | Add a region-by-region candidate-reading scaffold at the existing final section. |
| [Things and identities][things] already introduces buyer/seller and identity through change. | The beginner route lacks a worked comparison of identity-bearing category, relational role and identity-preserving state; Ontology modelling supplies the detail. | Extend that existing role section with three questions and one hard case; link the formal [roles and phases][roles] chapter. |
| [Names and choices][names] already separates labels, concepts, open populations, choice lists, taxonomy, facets and matching. | Another vocabulary overview would repeat good material. Its distinctions have no compact transfer task. | Add a question about missing information versus an explicit choice; do not reteach SKOS syntax here. |
| [Contexts and connections][contexts] already rejects organisation-chart boundaries and forced universal definitions. | A single story offers limited practice transferring the habit to other professions. | Add a few explicitly fictional cross-context questions, not an asserted map of professional definitions. |
| [Review a definition][review] has substantive alternative responses and a useful feedback note. | “Before opening an answer” and “disclosures” describe interaction that the always-visible callouts do not provide. | First correct the instructional framing to “write your question, then compare the responses below”; retain visible explanations. Interactivity is optional, not the cure by assumption. |
| [Bring evidence][evidence] and [what happens next][next] distinguish source context, safety, current routes and proposed lifecycle. | Another checklist or new feedback pipeline would duplicate material or overstate operations. | Reuse the current feedback note and evidence envelope; add only a short review-to-next-step prompt. |
| [Canonical glossary][glossary] contains programme and technology abbreviations. | Beginner concepts such as ontology, semantic home, bounded context and role/phase are not provided as a coherent term aid. | Propose a small extension of the canonical glossary, linked at first use; no separate learning glossary or hover-only definitions. |

### Lessons from earlier explainers and workshop material

The earlier `why-ontologies.astro` and `reading-the-model.astro`, inspected at commit `f1aa9d17c94b0ca177ae6c7e16e05976295217d6` under `src/pages/semantic-modelling/`, were **SPDTF guides**, not an endorsed PDTF training standard. They offered useful compact artefact comparisons, an explicit tree/graph contrast, and a six-step model-page reading scaffold. Their current [replacement map][migration] leads into the present learning journey. Recover those explanatory patterns without restoring their old pages, footer links, terminology shortcuts or diagrams as semantic authority.

The retained PDTF schema-derived corpus is separately attributed evidence, as the [input landing][pdtf] states. It is a useful comparison target for “what this earlier implementation represents”, not the model participants must endorse or a prerequisite learning route. An older catalogue and the newer contextual learning path serve different tasks; adding the catalogue back would not fill the practice gaps.

| Actual retained PDTF explainer | Useful learning pattern | What must not transfer into the new learning path |
| --- | --- | --- |
| [Modelling frameworks][legacy-frameworks], `#representation`, `#ontoclean`, `#honesty` and `#council` | Explain a choice, show its concrete consequence, expose a failure or limit, then link the decision and evidence. Its category-versus-inheritance diagrams make an abstract distinction inspectable. | Its three-graph implementation, narrow foundational scope, legacy classification cascade, council machinery and runtime/benefit claims are not current SPDTF method or measured learning evidence. Recover the explanation pattern, not the recipes or a nine-category terminology lesson. |
| [Identity and classification][legacy-identity], `#crux`, `#uprn` and `#hard-cases` | Separate related subjects; test identity through named changes such as subdivision or replacement; explain why a matching reference is insufficient. | Its Property/LegalEstate/RegisteredTitle identities and resolved hard-case outcomes belong to the schema-derived model. Harbour Court's subdivision stays unresolved; do not borrow the historical answer, “roles never subclass kinds” shortcut or documentary-domain convention. |

The [workshop orientation component][workshop] already pairs a familiar form with a JSON tree, a connected graph, and concept highlighting under `#same-knowledge`. Reuse its explanatory pattern, but adapt to Harbour Court and the website's shared visual system. Its examples and interaction markup are not evidence of learner success or an approved shared Property identity. The [workshop context-lens component][lenses] offers a second reusable pattern, not an authority source for context definitions. The [presentation plan][plan] and [working-group research][research] support complementary views and syntax-free participation; their older workflow descriptions must not be copied as current operational facts.

## 4. A progressive pathway inside the existing pages

The pathway is an editorial sequence, not a new navigation component or mandatory course. Use the existing [journey registry][nav], shared left rail, page contents and [bottom previous/next links][footer]. Retain the direct Contribute entry for experienced participants and the evidence-first path through Bring evidence when no relevant candidate exists. A reader may stop as soon as they can make a useful contribution; no completion time is promised.

| Existing chapter | Learner action | Evidence of understanding / next connection |
| --- | --- | --- |
| Understand → Why shared meaning matters | Compare a familiar form/tree with the connected Harbour Court account. Explain which question each view answers. | “This field is in the report, but this date describes the inspection.” Continue with the existing property story. |
| A property story | Track one inspection and two report versions; then locate status, meaning and evidence on a candidate page. | Identify what is illustrative, what is proposed and what is unresolved. Keep a page reference before exploring deeper distinctions. |
| Explore → Things and identities | Ask what is being identified, which role needs a setting, and which change assumes continuing identity. | Explain the missing transaction setting or why subdivision remains unresolved. Do not require the correct ontology keyword. |
| Names and choices → Contexts and connections | Distinguish a thing, its label and a permitted choice; compare two contextual interpretations without merging them. | Describe the consequence of “unknown” versus absent information, or identify what must survive an exchange. |
| Contribute → Review a definition | Write a question before comparing the existing alternative responses; then add a counterexample. | Produce one actionable challenge using the existing feedback note. No quiz score or vote. |
| Bring evidence → What happens next | State source/version/purpose/standing/restrictions and what a useful response should explain. | Follow the actual member guidance; distinguish a proposed change, technical check and authorised decision. |
| Ontology modelling, optional technical handoff | Trace the agreed sentence, its candidate relationships and its delivery/checking questions. | Know which technical chapter answers the question and which issue must return to a domain owner. |

Introduce specialist words only after the reader has seen the distinction. Do not give newcomers an upfront list of eight concerns, six outputs, eleven workshop themes and language acronyms to memorise. Those are different organising schemes, not interchangeable levels of a learning ladder. Use them when a review task needs them, and link the existing Ontology modelling explanation.

## 5. Concrete content and exercise briefs

### A. One familiar view, one connected account

Placement: [shared meaning][shared], existing `#connected` / retained `#tree-graph` section. Keep the current date ambiguity as the motivation.

Show a fictional report form with inspection date, report issue date, report version and dwelling reference. Beside it, show an indented document outline for the same information; JSON syntax is optional implementer detail. The connected view identifies Flat 1, the inspection, report v1 and report v2, with labelled “concerns”, “describes” and “revises” relationships. Dates remain visibly attached to their subjects rather than becoming misleading standalone things.

Prompt: “When report v2 is issued on 20 August, which date and relationship change, and which inspection does it still describe?” The explanation must identify the case's assumptions: no second visit; issue date is not occurrence date. Then ask what evidence would change that conclusion.

The lesson is complementarity: a tree gives values a chosen place in one message; a graph makes subjects and relationships explicit across descriptions. Do not imply that JSON cannot use identifiers, a graph automatically removes duplication, every form field becomes a resource, or all meanings belong to one universal Property node. A second compact comparison can label glossary, dictionary, taxonomy/vocabulary, ontology and generated delivery views by the questions they answer; link [the semantic package][package] for the complete six-output account.

Build the static comparison first. If optional highlighting later proves useful, use ordinary keyboard-operable controls, text labels and a visible correspondence list. Every important explanation must remain available without activating a control or running script. No drag-only task, compulsory animation, score, account, stored progress or data submission.

### B. Three questions, not a classification quiz

Placement: extend `#roles` in [things and identities][things]. Use the existing story's person and two transactions.

1. **What is being identified?** The person remains identifiable independently of one sale. Ask what establishes that identity, not whether their name happens to be unchanged.
2. **In what setting does a description apply?** The person acts as seller in transaction A and buyer in B. Which transaction and period make each statement meaningful? These are contextual roles, not different people.
3. **What changes while we assume the same subject continues?** Use a deliberately stipulated transaction-record lifecycle for the example. Ask which subject and classification the state concerns, and what supports continuing identity.

Then challenge the shortcut: subdivision of Flat 1 does not become a phase merely because it happens over time. Likewise a report correction is not automatically a phase of the inspection. These prompts introduce the kind/role/phase distinction without reducing a kind to “something permanent”, a role to “temporary”, or every status to a formal phase. The more exact analysis and encoding stay in [Ontology modelling][roles].

Do not sort “thing / description / evidence / decision” into exclusive buckets: [Explore][explore] correctly explains that one report can be an identifiable thing, a description and evidence for a claim. Ask which aspect a particular sentence uses.

### C. Try, compare, improve the question

Placement: existing exercise in [review a definition][review]. No new exercise engine is needed for the first slice.

- State “Write a question in your own notes; then compare the responses below.” Leave the flawed definition, three alternatives and explanatory feedback visible in ordinary reading order.
- Ask for a consequence, not a guessed technical term: “Could the receiver think a new inspection happened?”
- After the worked answer, change one feature: the inspection spans two days, or the system records the report later than issue. Ask which assumption now needs review.
- Make the feedback explain both what the response preserves and what remains undecided. A sensible alternative question can be useful; this is not a scored test of an approved business rule.

### D. A first candidate page, read with appropriate scepticism

Placement: the existing final `#use-the-story` section of [the property story][story]. Make this the single maintained first-page scaffold; other chapters link to it.

Use `/development/property-pack/resources/common/Property` as a provisional candidate-page target, supported by the current [candidate source][candidate] and [resource template][resource-page]. At implementation, verify the route and version before linking. Do not copy its definition into a second maintained model record.

| Page region | Reader task | Essential qualification |
| --- | --- | --- |
| Candidate status and version | Identify the artefact being read before judging its content. | Candidate, technical determination, later domain review, release and external recognition are different statuses. |
| Identity and meaning | Read the definition and proposed identity criterion; say what the term includes and excludes. | The current source links candidate continuity to an assigned UPRN and leaves lifecycle rules for review. Ask what supports that criterion; do not teach it as settled identity or proof of conformance to the required method. |
| Semantic home | Find the stated semantic home and its recorded owner; if responsibility is not identified, ask who should review the question. | Placement in `common` is a candidate assignment, not evidence of an approved shared definition or a constituted decision body. |
| Model structure / constraints | Read one relationship or requirement in plain language; note what is missing or not specified. | The page's technical “Kind” field identifies a construct such as class; it is not a verdict that the construct is an identity-bearing kind in foundational analysis. An absent constraint or absent direct source trace is not evidence of approval. |
| Source evidence | Follow one direct or structural trace and explain the distinction. | A source link establishes provenance, not semantic truth or domain endorsement. |
| Contribution handoff | Keep page/version, one question, its consequence and permitted evidence. | Use only the current available discussion/intake route; no simulated posting, approval or response-time promise. |

Prefer a semantic reading guide with anchor links over a screenshot whose labels will drift. If a later authorised implementation needs annotated captures, date and version them and provide equivalent text; browser verification must use the user's existing OPDA Chrome binding. A screenshot is not needed for this proposal.

### E. Transfer beyond the Harbour Court story

Add three small optional prompts across the existing relevant chapters, not a case-study library. All names, dates, organisations and cases must be invented and explicitly illustrative.

- **Finance / participation:** one person is a borrower in one arrangement and a guarantor in another. What relationship, time and evidence must accompany the role? This asks a modelling question, not for a lending-policy conclusion.
- **Conveyancing / exchange:** one sender uses “completion” for a transaction event; another label concerns completion of a system task. What definitions and consequences would establish whether the meanings correspond? Do not assert these as agreed industry definitions.
- **Agency / classification:** a listing shows “under offer”, while a related transaction has another state and a report field is absent. Which subject does each statement concern; what is absent versus explicitly stated? No approved status vocabulary or transition sequence is being invented.

Use a common answer habit: subject → context → statement → ordinary case → counterexample → evidence needed → review question. Learners can give more than one justified answer or identify insufficient evidence. Reuse the existing feedback note and evidence envelope rather than imposing a longer mandatory form.

### F. A narrow implementer bridge

Place a short, clearly labelled optional handoff at the boundary between Contribute and Ontology modelling, using an existing chapter rather than creating a fifth journey. Follow one sentence through three representations: “Report v2 describes the 12 August inspection”; a labelled relationship diagram; then links to the relevant formal example and declared checking profile in Ontology modelling.

The implementer's task is to name what must survive a payload: distinct subjects, the date's meaning, references, source/version and applicable checks. A structurally valid message can still conflate issue time and event time; an ontology alone does not generate correct interfaces. Generated schemas, APIs or forms need their own tested transformation contracts.

The separately scoped companion, `docs/reviews/ontology-modelling-enrichment-2026-09-07.md` at commit `6327372f`, owns detailed vocabulary/closure, boundary discovery, SHACL authoring assurance and mapping-lifecycle guidance. It was produced on a separate branch and is not part of this report's evidence baseline. Keep those recipes there; this report supplies intuitive prerequisites and the handoff, not competing syntax, new modelling rules or candidate-conformance claims.

## 6. Presentation and interaction constraints

- Use shared `ModellingLayout`, callout variants, diagram vocabulary and colour tokens. Teaching examples and method claims retain distinct labelled standing; colour alone must not carry meaning.
- Preserve ordinary prose with a maximum 1024px reading container; diagrams and tables flow within the available article width and remain readable at narrow widths. Avoid making text wide merely to accommodate a diagram.
- Preserve current bottom-page navigation and the existing heading/rail mechanisms. No parallel course navigation, progress dashboard, duplicated next/previous controls or new section landing.
- Core explanations, answers and evidence warnings stay visible. The [current detail component][detail] is deliberately an always-visible callout despite its historical name; do not reintroduce accordions or hover-only lessons.
- Respect the user's removal of marketing-style panels and decorative scaffolding. Reuse useful explanatory relationships from older components or decks, not their panel-heavy composition. No “benefit” statistics, slogans, stock imagery or regenerated story merely to make the page feel new.
- Reader controls, if later justified, are local explanatory aids with keyboard/touch access, meaningful focus, text equivalents and no persistence or submission. Do not add an account, survey, feedback service, workshop booking, certificate or LMS by implication.

## 7. Small work packages and proportional evidence

These are prioritised recommendations, not authorised implementation. Recheck the live branch because concurrent visual work may already resolve presentation details. Content review verifies faithful explanation; it does not approve the model used in an illustration.

| Priority / package | Coherent scope and dependency | Evidence before acceptance |
| --- | --- | --- |
| P0.1 — truthful practice framing | Update the existing choose/compare copy and add one transfer question; no script, new page or workflow. | Editorial read-through against actual interaction, visible-answer check, no false submission/approval language. |
| P0.2 — complementary views | One Harbour Court form/tree/graph comparison in shared meaning; reuse existing visual primitives. | Sentence-to-edge correspondence; identical subjects/dates across views; explicit complementarity; text alternative, narrow-width and keyboard checks if controls exist. |
| P0.3 — intuitive classification | Extend one Explore section; depend on the existing Ontology modelling definitions, not new ontology rules. | Targeted ontology reviewer checks permanence/rigidity, role context and state/phase caveats; a domain reader can explain the issue without the terminology. |
| P0.4 — guided candidate reading | One scaffold in the property story; select and verify one actual candidate/version. | Exact route/anchor/source checks; distinguish structural/direct evidence and all relevant statuses; confirm candidate wording is questioned, not adopted. |
| P1.1 — transfer and terms | Three fictional cross-profession prompts and a small canonical term-aid extension. | No real data or asserted professional rules; no duplicate glossary; each prompt elicits a reason or open question rather than keyword recall. |
| P1.2 — optional implementer handoff | One short bridge plus canonical Ontology modelling links; coordinate with technical enrichment. | Same meaning across sentence/diagram/formal example; no duplicate technical recipe, false inheritance rule or generator claim. |
| P1.3 — task-based learning check | After a local prototype, seek approval for a small, consented mixed-role read-through; define handling and recruitment separately. | Observed comprehension and failure modes, not invented success rates or automatic publication readiness. |

For any later source changes, use the repository's normal slice-appropriate tests, build and source/link checks before committing. Rendered checks must use the approved existing OPDA Chrome session only. Do not run ontology regeneration, a full council or a release-equivalent programme merely because prose changed; changes to formal rules, candidate data or shared components require their own risk-appropriate gates. Publication remains a separate decision.

Suggested learning-check tasks: explain the two dates; read one graph edge; spot the missing role setting; distinguish missing information from a declared choice; locate candidate standing and evidence; write one useful counterexample. Record task outcome, misconception, hesitation and the reader's explanation, with permission and without customer data. Have both a domain reviewer and a non-ontologist implementer attempt the relevant paths; include keyboard/narrow-screen use. Report actual observations and sample limits. Completion, confidence and domain agreement are different measures; no numerical target is asserted as evidence here.

## 8. Decisions still required and limits

1. Which package should be implemented first, and on which exact post-visual-change baseline? Recommended first slice: P0.1 plus P0.2; then classification and candidate reading.
2. Is `common:Property` the preferred teaching review target despite its unresolved identity criterion, or should a less loaded candidate be chosen? Keep the honest status/evidence exercise either way.
3. Should optional highlighting be added after static review, or is the static comparison sufficient? Essential learning must not depend on interaction.
4. Who owns the canonical beginner term definitions and ongoing candidate-walkthrough freshness? A learning guide must not become another semantic authority.
5. Is a consented learning read-through authorised, with whom and under what information-handling arrangements? This report does not recruit, contact, record or survey anyone.

No existing intake, commenting, account access, moderation, notification or tracking system was exercised. Current source wording is not live availability evidence. No browser review, usability study, ontology conformance run or publication occurred. The first-principles method, context boundaries and human authority remain unchanged; every new example above is a proposal for teaching, never approved OPDA model content.

## Source handling

Source links throughout this report resolve within the repository; historical and companion-report Git evidence is explicitly pinned. Section names locate the supporting claim. Implementation must recheck sources against its chosen baseline.

[D63]: ../adr/ADR-0063-domain-led-bounded-context-working-groups.md
[D64]: ../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md
[D65]: ../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md
[D67]: ../adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md
[D74]: ../adr/ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md
[D75]: ../adr/ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md
[decisions]: ../../src/pages/semantic-modelling/method/standards-and-decisions.astro
[understand]: ../../src/pages/semantic-modelling/understand/index.astro
[shared]: ../../src/pages/semantic-modelling/understand/shared-meaning.astro
[story]: ../../src/pages/semantic-modelling/understand/a-property-story.astro
[explore]: ../../src/pages/semantic-modelling/explore/index.astro
[things]: ../../src/pages/semantic-modelling/explore/things-and-identities.astro
[names]: ../../src/pages/semantic-modelling/explore/names-and-choices.astro
[contexts]: ../../src/pages/semantic-modelling/explore/contexts-and-connections.astro
[review]: ../../src/pages/semantic-modelling/contribute/review-a-definition.astro
[evidence]: ../../src/pages/semantic-modelling/contribute/bring-evidence.astro
[next]: ../../src/pages/semantic-modelling/contribute/what-happens-next.astro
[roles]: ../../src/pages/semantic-modelling/method/roles-and-phases.astro
[package]: ../../src/pages/semantic-modelling/method/scope-and-package.astro
[glossary]: ../../src/pages/glossary.astro
[pdtf]: ../../src/pages/development/inputs/pdtf-schema/schema-derived-ontology/index.astro
[legacy-frameworks]: ../../src/pages/development/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture/modelling-frameworks.astro
[legacy-identity]: ../../src/pages/development/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture/identity.astro
[candidate]: ../../src/data/property-pack/candidate-model/contexts/common.toml
[resource-page]: ../../src/pages/development/property-pack/resources/[context]/[id].astro
[nav]: ../../src/lib/modelling-navigation.ts
[footer]: ../../src/components/PageFooter.astro
[detail]: ../../src/components/modelling/DetailDisclosure.astro
[migration]: ../../src/lib/modelling-route-migrations.mjs
[workshop]: ../../src/components/presentations/WorkshopOrientationSlides.astro
[lenses]: ../../src/components/presentations/WorkshopArchitectureSlides.astro
[plan]: ../plan/2026-07-exec-and-finance-banking-presentations.md
[research]: ../research/ai-assisted-working-group-method.md
