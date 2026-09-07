# Fable 5.1 independent review — round one

Local working review, not an adopted decision or published website content. Native Claude Code session `f116799f-f407-4168-b3ac-4a7a3718cbd4`; runtime reported `claude-fable-5-1`, effort max. Source-only review; no rendered or learner testing.

The response below is preserved as returned. Its proposed chapter total and some context/example claims are challenged in the subsequent deliberation; preservation is not endorsement.

**Recommendation.** Keep three reader gateways, retitle the third to "Review and contribute", and grow the non-technical side from eight chapters to fifteen. The additions are the things a domain professional needs before any review makes sense: what the specification is made of, where the established contexts sit and how they differ from professions, groups and systems, why the work is worth doing and where it fails, how a working group actually proceeds, how to write the question a model must answer, and how to read a candidate page. Extend Harbour Court through a sale so every context meets the same case. Replace scattered callout prompts with one visible practice pattern. Move exact diagrams onto the paired light/dark master pipeline the technical rewrite already uses. Hold the four-gateway and five-move ideas as objections with stated withdrawal conditions.

This is a source review at the stated baseline. I read the pages, layout, navigation registry, tests, the design contract, the dated ADR clarifications, the council roster and the earlier proposal. No browser, no edits. Named perspectives below are simulated analytical lenses from the ODR-0001 roster, not participation or endorsement. There are no votes and no measured learning gains.

## What is missing, and the structure I recommend

**Gaps the current pages leave open:**

- **The deliverable itself.** ADR-0063 §2 fixes six outputs per context: business glossary, data dictionary, taxonomies, controlled vocabularies, resources and relationships. Only the technical reference covers them. A reader asked to "review a definition" has never seen a finished entry.
- **The established contexts by name.** The contexts chapter explains the idea of a bounded context and says boundaries are established inputs. It never names the six property contexts, the DBT Smart Data scheme context or the small common boundary. It never links the Property Pack contextual-boundaries register at `/development/property-pack/contexts`. The profession, group, system and context non-equation is asserted in one sentence, not taught.
- **Benefits and limits are hedged into near-invisibility.** Four intended benefits and a short limits section. Nothing says what the ontology gives that the PDTF schema and dictionary did not, what it costs, or how it fails. The "Bad, because" consequences in ADR-0063 are an honest ready source.
- **The domain-led method as participants experience it.** ADR-0063 §5 and §6 describe an evidence-led, resource-first cycle. The site shows a five-node loop and a list. No page tells a participant what a kick-off asks of them, what a candidate is, or what the eight-concern assessment with "not applicable, with rationale" means in plain words.
- **Competency questions.** The most natural contribution from a domain professional is "the model must be able to answer this". It appears only in the technical reference. No non-technical page teaches readers to write one and see the distinctions it forces.
- **Transfer is three callouts.** Finance, conveyancing and agency prompts exist as asides. No worked case exists outside inspection and report. Finance and Banking is the first group and meets no finance act in the story.
- **Practice is thin.** One exercise with three responses, plus several "try it" paragraphs. There is no consistent pattern of prompt, reasoned answer, acceptable alternative and tempting wrong answer.
- **Hard cases** stop at subdivision and the multi-day inspection. Missing: address renumbering with no physical change, two records for one dwelling from two sources, a withdrawn and relisted listing, a valuation citing a report version later corrected, a person who is a client in one context and a data subject in another.
- **Diagram literacy.** The site's visual grammar carries meaning: document-shaped nodes, focal tint, dashed "not same as", containment boxes. No page gives the key, so readers meet a notation they were told they would not need.
- **Sensitivity and permission as one chapter.** ADR-0063 §2a asks practitioners to review personal-data, purpose, permission-versus-role, provenance and time distinctions in business language. Today these are scattered callouts, and the role-is-not-permission figure appears only on technical pages.
- **Objections.** Four questions on the Understand index. Missing: "isn't this the PDTF schema again?", "why not adopt FIBO?", "is AI writing the standard?", "will my forms change?", "is a UPRN not enough?", "what if our definition is commercially sensitive?"
- **Disclaimer density.** The property story carries roughly eight body caveats on top of the layout's claim line. Readers are told the case is fictional more often than they are told what it teaches.

**The six prior hypotheses, judged:**

- **Harbour Court as a continuing story: support, as one case with more acts, not a case library.** Extend it through a sale so agency, finance, conveyancing, data services and technology each meet the same building, dwellings, reports and people. Use a separate case only where an act would force inventing a professional rule.
- **Six-profession overview as questions: support, with a guard.** Place it on the section landing and in the contexts chapter, beneath a plate separating profession, working group, system and semantic context. Use each profession's own questions, sourced from the published scope lines in `src/data/working-group-campaign.ts`, never as rules.
- **Specimens of six outputs: strong support.** This is the largest missing piece. Specimens stay fictional Harbour Court entries with example.org identifiers and link to the real candidate's vocabulary, dictionary, resource and relationship pages for "what a live page looks like", without duplicating a maintained model record.
- **Four gateways: held against.** The comparison is below.
- **Five-move orientation: against.** Readers already meet a five-node cycle, a ten-step method, six outputs and eight concerns. A fifth numbered scheme is a mnemonic tax. The Understand index's "chapters, then a choice" route does the job.
- **Fewer disclaimers: support.** One claim line in the layout, one "what this rests on" footer, body caveats only where a specific statement needs a specific boundary.

| Criterion | Three gateways, re-cut | Four gateways, adding "Read the model" |
|---|---|---|
| Reader model | Learn, look, act. Intent names stay clear. | "Read" overlaps Explore and Contribute; readers must guess. |
| A reviewer sent a candidate link | Retitle to "Review and contribute"; first chapter "Read a candidate page". | Slightly better label match, at the cost of a fifth landing card. |
| Profession equals context confusion | Avoided; contexts stay in Explore under the non-equation plate. | A profession-named gateway would invite it. |
| Navigation and test cost | Titles and children change; prev/next assertions updated. | Registry, group count and two test files change; landing grid re-balances. |
| Longest gateway | Explore at seven chapters. | Explore at five, Read at four. |
| Recommendation | Adopt. | Hold; withdrawal condition below. |

**Page inventory** (all under `src/pages/semantic-modelling/`):

| Route | Status | Purpose | Reuse |
|---|---|---|---|
| section landing | recompose | One paragraph on what is being built; dossier; six professions as questions; pathways; cycle figure | `DossierPanel`, `PathwaySplit` |
| `understand` | recompose | Route through four chapters; objections move out | existing |
| `understand/shared-meaning` | keep, trim | Date ambiguity, thing versus description, complementary views | existing |
| `understand/what-we-are-building` | new | Six outputs, one agreement, six specimens, one JSON-LD sentence | ADR-0063 §2; scope plate in `ReferencePlate` |
| `understand/a-property-story` | keep; scaffold moves out | Acts one to five | existing |
| `understand/benefits-and-limits` | new | Benefits worth testing, costs, failure modes, objections answered | `shared-meaning#benefits`; ADR-0063 consequences; old `questions` anchors |
| `understand/how-the-work-is-done` | new | Resource-first cycle; candidate, challenge, revise; eight concerns in plain words | ADR-0063 §5–6; `candidate-loop` figure |
| `explore` | keep; add legend | Four aspects, edge as sentence, diagram key | existing |
| `explore/things-and-identities` | keep | | existing |
| `explore/names-and-choices` | keep | | existing |
| `explore/contexts-and-connections` | rewrite | Established contexts by name; non-equation plate; semantic home; map before merge | ADR-0063 §1 and §4; ADR-0067 §2; contexts register |
| `explore/evidence-claims-and-time` | new | Event, claim, evidence; four clocks; correction versus new event | story act three; `method/evidence-and-time` in plain register |
| `explore/sensitivity-and-permission` | new | Personal data, purpose, permission versus role, what the model cannot do | ADR-0063 §2a; `privacy-scope` figure; DBT pages |
| `explore/the-same-case-across-professions` | new | Harbour Court acts six to ten with reasoned answers | campaign scope lines |
| `contribute` | retitle "Review and contribute" | | existing |
| `contribute/read-a-candidate-page` | new | Page anatomy, status literacy, the `common:Property` scaffold | story `#use-the-story` |
| `contribute/ask-the-question-the-model-must-answer` | new | Competency questions from practice | `method/from-question-to-candidate` |
| `contribute/review-a-definition` | expand | Three exercises in the practice pattern | existing |
| `contribute/bring-evidence` | keep | | existing |
| `contribute/what-happens-next` | trim | Link the member guide's authority table instead of restating it | `member-guide/model-review-and-decisions` |

**Lenses applied, all simulated.** A Guarino and Guizzardi lens keeps identity as a question and warns that the four-aspect grid must never read as categories of being. An Allemang lens asks for specimens and finished pages, because the website is the interface to the model. A Kendall lens treats the six outputs as one package driven by competency questions, with FIBO exactly as ADR-0063 §6 states it. A Baker lens says missing versus not applicable versus unknown is vocabulary governance and deserves its own figure. An Evans and Vernon lens supplies the profession-is-not-a-context plate and map before merge. A Cagle lens keeps check versus judgement.

## Outcomes, the practice pattern and two compositions

**What a reader should be able to do after the section:**

1. Name the six outputs and describe what a finished entry looks like.
2. Locate a term's semantic home among the established contexts and explain why the profession, group, system and context differ.
3. Read a definition and a labelled diagram edge as a sentence and identify its subject.
4. Separate thing, description, evidence, claim and event, and separate event time, issue time, recording time and applicability.
5. Separate kind, role and phase in a case without using the terminology, and separate role from permission.
6. Write a competency question and list the distinctions it forces.
7. Separate missing, explicitly stated and not applicable, and closed list from open population.
8. Decide whether two contexts' terms should be mapped, kept separate or resolved locally, and refuse premature equivalence.
9. Read a candidate page's status and evidence, then write a bounded, evidence-aware challenge.
10. Say what a passing check does and does not establish, and what happens next.

**The practice pattern.** One "Try it" block, fully visible: the case facts, the question, then a "Reasoned answer" that walks subject, context, statement, ordinary case, counterexample, evidence needed and review question. It closes with "Also defensible" and "Tempting, but wrong, because". No details element, no form, no script, which keeps the existing enrichment test that forbids those on the review exercise. Build it as one component taking a data prop so pages stay under the five-hundred-line limit. Two or three blocks per chapter.

**Harbour Court, continued through a sale.** Each act poses a question and stops short of a professional rule:

- **Act six, agency.** The listing for Flat 1 shows "under offer", is withdrawn, then relisted. Is the relisting the same listing? What is absent versus stated? The dwelling's identity is untouched; the listing's identity is a decision for its context.
- **Act seven, finance.** A second person applies to borrow; a data service delivers report version two on 21 August; the valuation cites "the survey". Which version, which date? Does the seller's role let the seller read the valuation? Role is not permission.
- **Act eight, conveyancing.** "Completion" as a transaction event versus a system task; the title record versus the building; a search carries a request date and a result date.
- **Act nine, data services.** Two sources give different addresses for Flat 1 after renumbering. Matching is evidence, not identity; each source has its own currency.
- **Act ten, technology.** A platform holds one "property" record for the building and the flat. What must its exchange preserve? A system is not a context.

**Composition A, `understand/what-we-are-building`:**

1. Title, deck, layout claim "guide", an audience line saying no notation is needed.
2. Opening: the specification is an agreement about meaning, published as six aligned outputs; the ontology is its formal statement; one sentence says JSON-LD artefacts are generated from it.
3. Figure: "What the specification is made of", a master diagram with the six outputs around one agreement.
4. Six specimen plates, each fictional: glossary entry "Inspection"; dictionary entry "Report issue date"; taxonomy fragment "Dwelling form"; controlled vocabulary "Inspection outcome", closed for one profile; resource "Report version 2"; relationship "describes". Each states the sentence it lets you say and links the real candidate page type for "what a live page looks like".
5. Contrast pair: what changes when a label changes versus when a definition changes.
6. Try it: a field called "survey date" arrives; which outputs must change to fix it? Reasoned answer in the pattern.
7. What this rests on: ADR-0063 §2, ADR-0067 §4, and the technical scope chapter.

**Composition B, `explore/contexts-and-connections` rewritten:**

1. Title and deck.
2. Opening, kept: the same word can be doing different work.
3. Plate: profession, working group, system, context, with one example row each, and the rule that none of them stands in for another.
4. Figure: the established contexts map, with the scheme context and the small common boundary, linked to the register.
5. Six questions, one per context, from the campaign scope lines, each pointing at the Harbour Court act that meets it.
6. Semantic home, kept: how to locate it, what to ask within and across contexts.
7. Figure: map, keep separate, or resolve locally.
8. Harbour Court bridge, kept, plus the "completion" prompt rewritten into the practice pattern.
9. Common agreements earn their place, kept and trimmed.
10. Implementer note, kept as the visible detail callout.
11. What this rests on.

## Visuals, design register, sequencing and held objections

**Prioritised visual inventory.** Exact diagrams use the standalone HTML master format in `docs/working/modelling-judgement/` with light and dark SVG plus a text-equivalent list. New masters go in a sibling `modelling-plain/` folder in a plain register: at most six nodes, sentence-case edge labels so each edge reads as the sentence the text teaches, and larger type.

| Priority | Visual | Teaches | Form | Page |
|---|---|---|---|---|
| 1 | What the specification is made of | The six outputs as one agreement | Master diagram | what-we-are-building |
| 1 | Profession, group, system, context | The non-equation | HTML plate | contexts, landing |
| 1 | Established contexts map | Where meaning lives; common stays small | Master diagram | contexts |
| 1 | Read an edge as a sentence | Key to the site's diagram grammar | Master diagram | explore index |
| 1 | Harbour Court storyline | Ten acts, which context each concerns | Master diagram, wide | landing, cross-professions |
| 1 | Four clocks | Event, issue, recording, applicability | Master diagram | evidence-claims-and-time |
| 2 | From a question to a distinction | The competency-question habit | Master diagram | ask-the-question |
| 2 | Missing, stated, not applicable | Absence versus statement | HTML plate | names-and-choices |
| 2 | Map, keep separate, resolve locally | Map before merge | Master diagram | contexts |
| 2 | Anatomy of a candidate page | Reading order and status regions | Annotated HTML figure with anchors, no screenshot | read-a-candidate-page |
| 2 | Role is not permission | Reuse the existing `privacy-scope` figure | Existing | sensitivity-and-permission |
| 3 | Migrate the ten existing figures to masters | Consistency and print | Master diagrams | existing pages |

**Illustrations.** Three new paired watercolours at the established 2172 by 724 geometry, light generated first and dark edited from it, provenance recorded in a manifest like the existing enrichment one. "Six desks, one street": the same Harbour Court elevation seen from six professions' desks, for the landing. "The question": a notebook with a circled question beside a report, for the competency-question chapter. "Stalls and a notice board": distinct market stalls with one small shared board, for the contexts chapter, drawn with equal stalls so it implies no hierarchy. No text in images, no people identifiable, never used as evidence. Reuse the existing property-story and workbench pairs.

**Design register, different from the technical reference:**

- **Opening.** The technical layout carries a red "Technical modelling guide" mark, kicker, chapter number and method-basis line. The plain layout keeps its title, deck and one claim line, adds a calm audience line, and moves "what this rests on" to a muted footer.
- **Narrative devices.** Dossier panel, practice block, contrast pair used sparingly and never as a strawman, and a plain-register margin note with tones "in plain words", "boundary", "worked example" and "try it".
- **Diagrams.** Same pipeline, plain register as above. Masters print; the retired `ModellingVisual` grammar hides in print, which is a defect for readers who print a guide.
- **Shared contracts unchanged.** Shell, rails, breadcrumbs, prev/next, the 1024px text measure, justified paragraphs with the last line left, left-aligned 960px figures, focus rings, forced colours, reduced motion, dark parity, canonical glossary links, no accordions, no duplicate bottom navigation, no card walls.

**Implement first.** Landing recomposition and the retitle; the six-specimen chapter; the contexts rewrite with the plate and map; the candidate-page chapter with the scaffold moved; the practice component with three exercises; the diagram key. Then benefits and limits, how the work is done, competency questions, cross-profession acts, sensitivity, the four-clocks chapter. Last, illustrations and the migration of existing figures.

**Risks to test before merge:**

- **Registry contracts.** The docs test pins the four journey slugs and requires every registry route to exist, use the learning layout, caption every figure with a semantic equivalent, and avoid details, style and h1 tags. The navigation test pins five groups and specific prev/next links, which every added chapter shifts.
- **Pinned strings.** The enrichment test requires the candidate scaffold, its anchors, the version pin and the status phrases inside the property story. Moving the scaffold means moving those assertions in the same commit.
- **Fragment continuity.** The story page carries alias anchors for retired routes. The moved scaffold needs alias spans on the new page and a link from the old section.
- **Glossary first.** New terms such as competency question, common boundary, data dictionary and controlled vocabulary need rows in `src/pages/glossary.astro` before any page links them, because the visuals test fails on missing anchors.
- **Content fidelity.** Context scopes quote ADR-0063 §1; profession questions come from the campaign register; FIBO and UPRN appear only as the ADR and candidate state them; no act asserts a professional rule.
- **Illustration geometry.** Extend the PNG dimension test to the new set.
- **Rendered checks** require the existing OPDA Chrome binding, which this session could not use.

**From the earlier proposal, not to be lost:** the complementary-views comparison, the three role questions, truthful practice framing, the single maintained candidate scaffold, the evidence-first route for participants with no candidate yet, canonical glossary linking, the short formal handoff, the no-account, no-progress, no-certificate constraints, the still-open ownership question for glossary and candidate freshness, and the consented read-through, which remains a separate decision and not a website task.

**Held objections, with withdrawal conditions:**

- **Four gateways.** Held. Withdraw if drafting leaves Explore above seven chapters, or if the read-through shows reviewers arriving from Teams cannot find the candidate-page chapter under "Review and contribute".
- **Five-move orientation.** Held. Withdraw only if the five moves are the five nodes of the existing cycle figure, in which case they are its caption, not a new scheme.
- **Uppercase mono edge labels in the plain register.** Held against. Withdraw if the design owner rules that one label style must hold across both registers.
- **A separate case library.** Held against. Withdraw for any single act that cannot be told inside Harbour Court without inventing a rule.
- **Keeping the retired figure grammar indefinitely.** Held against. Withdraw if migration cost is judged to outweigh the print and consistency gain after the first six masters ship.
