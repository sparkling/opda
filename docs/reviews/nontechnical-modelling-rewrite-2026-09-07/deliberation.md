# Deliberation, provenance and recovery record

This records how the [proposal](proposal.md) was reached. It is an editorial review, not an adopted modelling decision, expert endorsement or claim of learner validation.

## The request being rerun

The original request was for Astra Ultra and Fable to discuss a much broader and deeper rewrite of the **non-ontology-engineering side of Modelling**, with rich infographics, illustrations and diagrams. The user subsequently asked to recover the work and then rerun the swarm.

The [brief](brief.md) therefore limits this run to review, discussion and a saved proposal. It does not authorise implementing the website, publishing a report in its navigation, changing ADRs, recruiting readers or modifying the upstream semantic-modelling project. The existing join-page work and technical ontology rewrite are separate efforts.

## What existed before this rerun

The earlier, narrower review is `docs/reviews/modelling-learning-enrichment-2026-09-07.md` on branch `review/modelling-learning-enrichment`; its worktree was `/private/tmp/opda-learning-enrichment.2IM5TG`. Its constraints favoured bounded enrichment of the three existing learning journeys, not the later extensive counterpart to the technical section.

Relevant history at the inspected baseline:

| Evidence | What it establishes |
|---|---|
| `020d8d4d` — `feat(modelling): enrich participant learning pathway` | Earlier learning enrichment was implemented, not merely planned. |
| `2dce5dbf` — `feat(modelling): integrate illustrated learning and ontology guides` | The earlier illustrated enrichment was integrated. |
| `db5f4e45` — `feat(modelling): add paired analytical illustration and prompt provenance` | A governed paired-illustration contribution exists. |
| `6a28fb47` — `feat(modelling): reauthor ontology judgement course and visual system` | The extensive technical rewrite is a distinct implemented effort. |
| [ADR-0064](../../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md), 7 September amendments | Records the earlier revamp/enrichment scope. It is not proof that this later extensive non-technical proposal has been implemented. |
| Source at `bd5f42af` | Overall landing, three learning landings and eight learning chapters were inspected in this rerun. |

The recovered former visual reviewer confirmed that its later discussion had produced messages, not files, assets or commits. It had received an earlier Fable summary through the integration owner, not that Fable review directly. Its recovery was treated as historical context, not as a substitute for a fresh Fable response.

Recovered ideas included a continuing Harbour Court story, six professional perspectives, six-output specimens, a possible four-gateway structure and a five-move orientation. They were submitted as hypotheses to challenge. The fresh review did not pretend they were already agreed decisions.

## Actual execution and ownership

Ruflo swarm: `swarm-1788818991914-qyxuaj`.
Tracked task: `task-1788819220484-jl9yed`.
Source baseline: `/Users/henrik/source/opda`, commit `bd5f42af`.
Single report writer/integration worktree: `/private/tmp/opda-learning-rewrite.FMKamF`, branch `review/modelling-learning-rewrite`.

| Role | Actual executor | Tracked record |
|---|---|---|
| Integration owner | Root Codex agent; source checks, adjudication and report writing | `learning-recovery-root` |
| Curriculum reviewer | Native `gpt-6-astra`, effort `ultra`, `learning_curriculum_rerun` | `learning-recovery-curriculum` |
| Visual/editorial reviewer | Native `gpt-6-astra`, effort `ultra`, `learning_visual_rerun` | `learning-recovery-visual` |
| Independent reviewer/devil's advocate | Native Claude Code, runtime `claude-fable-5-1`, effort `max` | `learning-recovery-fable` |

The native executors did the reasoning. Ruflo records tracked coordination; they did not launch the models or establish that a requested model had executed. Fable's runtime result identified `claude-fable-5-1` on its first-party provider. No OpenRouter route was used.

Fable's independent review used the following native command in the isolated review worktree:

```sh
claude -p --model fable --effort max --no-chrome \
  --permission-mode plan --tools Read,Glob,Grep \
  --allowedTools Read,Glob,Grep --strict-mcp-config \
  --add-dir /private/tmp/opda-learning-enrichment.2IM5TG \
  --add-dir /Users/henrik/source/opda --output-format json \
  < docs/reviews/nontechnical-modelling-rewrite-2026-09-07/brief.md
```

The native session was `f116799f-f407-4168-b3ac-4a7a3718cbd4`. Subsequent cross-critique and adjudication resumed that session with the confirmed full model name and read-only tools. No new login, account inspection or browser was needed. Custom hooks were disabled for the later calls; their review output still came from the same native session.

All reviewers were read-only. Only the integration owner wrote the report documents. Existing unrelated changes in the main worktree were left alone. No new standalone testing, security or browser agent was needed for this source-only editorial review.

## Council grounding and limits

The local [ODR-0001 council record](../../ontology/odr/ODR-0001-linked-data-council-methodology.md) supplies a historical expert roster. Upstream source inspection showed that the old semantic-modelling council records were superseded or relocated. The integration owner read the current `semantic-builder/docs/adr/ADR-0021-council-of-experts.md` on `hz`, read-only. The roster is a pool of analytical lenses, not a claim that the named people participated.

Selected inferred lenses used in the review:

| Lens drawn from the roster | Question put to the proposal |
|---|---|
| Nicola Guarino / Giancarlo Guizzardi | Does accessible language still preserve identity, dependence and change distinctions? |
| Thomas Baker / Antoine Isaac | Are labels, concepts, choice sets, classification and correspondence taught as different judgements? |
| Eric Evans / Vaughn Vernon | Are local meanings and documented boundaries respected without equating them with an organisation chart? |
| Dean Allemang / Elisa Kendall | Can a practitioner inspect the proposed agreement and ask a useful question about it? |
| Luc Moreau | Does the teaching distinguish evidence provenance from a claim's correctness? |

These are the agents' analytical applications, not quotations, simulated personal speech or endorsements. Primary references checked for the conceptual distinctions include Guarino and Welty's [OntoClean paper](https://www.loa.istc.cnr.it/old/Papers/CACM2002.pdf) on identity/unity, the W3C [SKOS Primer](https://www.w3.org/TR/skos-primer/) on concepts/labels/relations, and Evans's [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) on contextual language. None supplies evidence that this proposed page layout improves learning.

The discussion used independent positions, cross-critique and reasoned final positions. It did not reinstate the historical council voting machinery or adopt a new normative ontology decision. A default consensus label in a coordination ledger is not evidence of a vote, unanimous agreement or user approval.

## The actual discussion

### Round one: independent positions

Astra curriculum identified 26 substantial learning tasks. Its first allocation was five Understand, thirteen Explore and eight Contribute chapters. It emphasised missing treatment of relationships, measurements, time, uncertainty, rules and applied review beyond definitions.

Astra visual proposed an illustrated field guide with seven composition families, meaningful six-output specimens, differentiated professional situations, restrained sentence-labelled diagrams and full responsive/print equivalents. It preferred preserving the existing three route families with optional task-entry links.

Fable's [independent review](fable-review.md) initially favoured fewer, longer chapters, a new benefits/limits chapter, an explicit explanation of how modelling work proceeds and a more sustained Harbour Court sale narrative. Its introduction said fifteen chapters, but its table contained sixteen: five Understand, six Explore and five Contribute. That arithmetic error was challenged and corrected.

### Round two: substantive changes, not a tally

Astra accepted Fable's criticism that benefits, costs, objections and the participant's experience of the method needed explicit owners. It consolidated its 26-route proposal into 21 chapters while retaining the teaching tasks: five Understand, eight Explore and eight Contribute. It opposed dropping measurement, relationship and rule depth merely to keep Explore short.

After seeing Astra's original detailed proposal, Fable's [cross-review](fable-cross-review.md) moved in the other direction: it accepted a 26-chapter scale, but with six Understand, twelve Explore and eight Contribute. It withdrew its standalone cross-profession chapter, the ten-act Harbour-only restriction and the preference for just three generic illustrations. It retained concern about overlong compound chapters and rejected a word-count target.

Astra visual withdrew 26 routes and six separate image files as requirements. It retained 26 learning tasks and six differentiated professional task briefs as the coverage/design baseline. Both three paired professional compositions and six separate illustrations could satisfy the latter. It held against a generic market-stalls analogy and against copying the technical section's visual grammar wholesale.

The apparent exchange of preferred counts is important: the reviewers revised their ideas after critique. It would be inaccurate to report that they independently agreed on 26 or that they all preferred 21.

### Round three: adjudication and final source checks

The root proposed 21 as a drafting allocation and asked Fable to read the actual syllabus. Fable said it was defensible with conditions but explicitly **did not withdraw its preference for 26**. It identified roles/change, measurements/time and claims/uncertainty as pressure points and called out the missing distinction between asking price, transaction price and valuation opinion.

Astra's final review agreed that measurements/time was the weakest grouping and allowed early splitting when manuscript structure demonstrated separate tasks. Root made that split immediately and assigned the amount distinctions to the measurement chapter. The final recommendation is consequently **22 chapters: 5 + 9 + 8**, not the earlier 21 or either initial 26.

Astra curriculum then read the actual 22-chapter document, verified its counts and cross-references, and found no serious coverage omission. It corrected the conditional-rule example: absent evidence of the trigger does not automatically mean a rule is inapplicable, failing or unassessable. The exercise now states its applicability convention explicitly.

Astra visual read the actual atlas and syllabus and found no severe design/semantic conflict. It caught inconsistent versions of the changed measurement case and the need for a nonempty inspection scope in the all/some/none choices. Both were corrected. These are proposal-level checks, not rendered or learner testing.

## Dispositions and held dissent

| Issue | Final proposal | Reason or remaining condition |
|---|---|---|
| 16, 21 or 26 chapters | Start with 22 | Preserve all tasks; split measurement/time now. Fable's 26 preference remains recorded. Further splits require a real teaching/findability reason, not a page-count target. |
| Three or four gateways | Keep three learning route families | Optional intention links help direct entry without four competing courses. Revisit only if actual navigation or manuscript evidence demonstrates a problem. |
| Separate diagram-reading chapter | Teach in U1; apply in C3 | A substantive sentence-to-diagram lesson is required, not a token legend. A later split remains possible if this cannot be delivered clearly. |
| Harbour Court only | Anchor plus substantive variations | Retain continuity without teaching only recall of names and dates. No separate case library is required. |
| Three or six illustrations | Six distinct professional task briefs | May be six images or fewer paired compositions. No profession/context visual equation. |
| Technical visual grammar | Share production/accessibility contracts, not the teaching grammar | Beginner visuals use ordinary sentences, smaller explanations and real specimens. |
| Five-move mnemonic | Do not add it | It adds another numbered scheme without a demonstrated reader need. |
| Repeated standing caveats | Consolidate, retain specific limitations | A useful caveat belongs beside the inference it limits; it should not drown the explanation. |
| Automatically tested semantic ownership | Do not introduce it | A source assertion cannot establish teaching quality. Maintain this editorial map with changes and use existing route/structural tests appropriately. Fable records a risk of drift if the map is not maintained. |
| Word-count goal | No target or gate | The capacity estimate is planning context only; it must not drive padding or copy quotas. |
| Practitioner testing | Optional later, user-arranged | No contact or recruitment is authorised by this review. Manuscript review can trigger a split without waiting for participants. |

Compound-chapter split conditions remain live. Split E1 if identity crowds out full relationship reasoning; split E2 if role participation and event/change need unrelated explanations or cannot be found directly; split E5 if uncertainty becomes an appended terminology list. Do not freeze the initial 22 for tidy navigation.

Root also rejected overly literal review suggestions: no assertion that each definition/specimen pair must have identical composition; no categorical ban on candidate identifiers in links explaining a real candidate; no automatic requirement to recruit one reader; no attempt to make an added test prove that conceptual ownership is unique.

## Factual corrections that constrain later writing

1. Professional questions come from campaign scope descriptions; semantic boundaries come from their register and governing decisions. One is not evidence for the other.
2. The candidate register's Common supply arrows are not cross-context mappings. It does not establish accepted mappings. The example bridge must not imply otherwise.
3. The candidate's machine-proposed DBT Smart Data semantic context is not the external programme, a working-group decision or another property-domain bounded context.
4. A resource/class definition and an illustrative instance are different things. The website's candidate definition pages do not demonstrate a store of live property records.
5. Adding an old fragment ID on a new page does not repair an old page URL. Retain the old fragment's useful entry point with a direct link.
6. A fictional revision must not be presented as an actual candidate change, history or live comparison feature.
7. Conditional-rule applicability must be established under explicit teaching premises; missing evidence is not automatically a formal validation result.
8. The supplied area inclusion difference permits a determinate fictional answer; the changed case deliberately needs different evidence. Neither chooses an industry measuring standard.

## Source authority and scope

| Source inspected | Standing and use |
|---|---|
| [ADR-0063](../../adr/ADR-0063-domain-led-bounded-context-working-groups.md), especially §§1–3a and 5–6 | Accepted; audience, six outputs, retained concerns, established boundaries and resource-first working method |
| [ADR-0064](../../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md), scope and amendments | Accepted; website teaching remit and history of the earlier enrichment |
| [ADR-0065](../../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md) | Proposed; possible workflow controls, not proof of full live operation |
| [ADR-0067](../../adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md), §§1–4 | Accepted; evidence hierarchy, semantic home, selected categories and output package |
| [ADR-0068](../../adr/ADR-0068-govern-opda-standards-lifecycle.md) | Proposed; do not import its response cadence, thresholds or ratification mechanics as adopted facts |
| [ADR-0075](../../adr/ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md) | Accepted; candidate/version boundaries and independent status dimensions |
| [Context register source](../../../src/pages/development/property-pack/contexts/index.astro) | Maintained description of current candidate homes, DBT standing and mapping limits |
| [Current navigation](../../../src/lib/modelling-navigation.ts) and all learning page sources | Baseline route inventory, teaching content, source risks and compatibility obligations |
| [Design contract](../../../DESIGN.md) and modelling layout/styles | Existing typography, visual/accessibility contracts and governed illustration language |
| Existing modelling, enrichment and navigation tests | Location-sensitive assertions and useful invariants, not proof of pedagogical quality or rendered output |

Ruflo memory did not return useful evidence for recovering this curriculum. Cross-project recall was unavailable through the permitted structured interface, and the repository prohibits switching to a CLI memory driver. Work continued from explicit source and history evidence; no managed database was opened directly.

## Verification and handoff boundary

The report-only slice receives local file, link, scope and whitespace checks, plus the peer reviews above. Full site tests, a site build and browser checks would not verify changes to pages because no pages are being changed in this run. Later implementation has its own proportionate validation described in the proposal.

Completed local checks on 8 September: seven Markdown files all below 500 lines; 35 local document links resolve; the chapter inventory contains 22 unique routes with eight verified existing routes and fourteen proposed new routes; no prohibited source-business names or trailing whitespace were found. The main worktree still contained only its two pre-existing unrelated modifications. No website build or application test result is claimed.

The output is this local document set on the isolated review branch, to be committed as a coherent review slice. No website route or navigation entry exposes these reports. No push, deployment, upstream change or publication is part of this rerun.
