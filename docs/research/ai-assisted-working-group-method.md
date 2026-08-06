# Research: AI-assisted working-group ontology development

**Date:** 2026-07-19
**Purpose:** Operating rationale, controls and stakeholder case for ADR-0065.

## Executive finding

The most inclusive and scalable division of work is:

- domain experts provide evidence, language, decisions and feedback;
- AI agents convert heterogeneous evidence into coherent, reviewable model drafts;
- ontology specialists configure and supervise the process;
- OPDA working groups challenge successive candidates until one is stable enough to
  become the first official working-group draft; later approval rules are defined
  separately.

This keeps domain authority with practitioners while removing ontology syntax as a
participation barrier. It also uses OPDA's existing AI-council experience to shorten
the interval between feedback and a visible revised model.

The current schema-derived work is not discarded. It is one of the most important
inputs: a traceability baseline, an inventory of present exchange requirements, a
source of test cases and a bridge to familiar implementation formats.

## Why direct modelling is the wrong workshop activity

Most participants know mortgage, conveyancing, agency, valuation, data services,
property technology or Smart Data—not ontology languages. Their scarce contribution is
their judgement about:

- what exists in the domain;
- which distinctions affect decisions;
- where organisations use the same word differently;
- which rules and exceptions matter;
- which source is authoritative;
- which information may be shared, with whom and under what conditions.

A session centred on class hierarchies or SHACL syntax would make participation depend
on an irrelevant technical skill. The formal model should be produced from the group's
business evidence, then returned as diagrams, definitions, examples and validation
outcomes that the group can challenge.

## Evidence the process can ingest

The corpus can include structured, unstructured and multimodal material:

| Evidence type | Examples | Modelling contribution |
|---|---|---|
| Existing standards | PDTF schemas, mappings, reference ontologies | Coverage, compatibility and reusable concepts |
| Business documents | Policies, guidance, contracts, handbooks | Definitions, obligations and scope |
| Operational artefacts | Forms, spreadsheets, API payloads, reports | Data elements, constraints and implementation needs |
| Scenarios | Journey descriptions, edge cases, failure cases | Competency questions and identity tests |
| Visual material | Process diagrams, screenshots, whiteboards | Relationships, states and hand-offs |
| Discussion | Meeting transcripts, online threads, comments | Rationale, disagreements and corrections |
| Representative data | Valid and invalid examples | Validation and regression tests |

An item must be labelled as authoritative, normative, informative, illustrative or
disputed. Its origin, applicable period, access conditions and relationship to model
claims must remain traceable.

## What the AI council adds

A single language model is useful for extraction but weak as a governance mechanism.
A council allows the same evidence to be challenged from several perspectives:

- domain structure and identity;
- vocabulary, classification and taxonomy;
- provenance and data quality;
- validation and business rules;
- temporal state and history;
- privacy, sensitivity and access;
- cross-context interoperability;
- implementation practicality.

Different models can reduce dependence on one system's habitual framing. Named expert
personas can bring established published approaches into the discussion. Neither
mechanism guarantees truth: models may share training errors, fabricate citations or
converge too readily. The safeguards are source retrieval, citation verification,
structured dissent, automated tests and human review.

The existing
[AI Linked Data Council methodology](../linked-data-initiative/06-ai-linked-data-council-methodology.md)
provides the rigorous path for material ontology decisions. Lighter drafting and
feedback incorporation should be proportionate, but must still preserve sources,
uncertainty and review history.

## End-to-end operating cycle

| Stage | Human responsibility | AI and tooling responsibility | Reviewable artefact |
|---|---|---|---|
| 1. Frame | Agree scope, exclusions and competency questions | Detect ambiguity and missing evidence | Charter and evidence request |
| 2. Collect | Supply and classify sources | Extract terms, claims, rules and examples | Source register |
| 3. Deliberate | Clarify contested domain questions | Council proposes alternatives and challenges assumptions | Draft decisions and open issues |
| 4. Model | Confirm intended meaning | Produce the six linked content outputs and publication artefacts | Versioned model candidate |
| 5. Check | Confirm tests reflect the business | Run consistency, provenance, validation and coverage checks | Test and coverage report |
| 6. Publish | Decide what can be shared | Render diagrams, definitions, examples and change views | Review website increment |
| 7. Review | Comment, challenge and provide counterexamples | Classify and trace feedback | Comment disposition log |
| 8. Revise | Confirm resolutions | Incorporate accepted feedback and explain changes | New version and changelog |
| 9. Stabilise | Confirm the candidate is ready to become the first official working-group draft | Package evidence, checks and unresolved questions | Official first draft or another candidate iteration |

This is an iterative standards-development method inspired by W3C's use of visible
drafts, issue resolution and consensus. OPDA remains responsible for its own governance
and must not imply W3C approval.

## Working-group content, artefacts and completeness

Every iteration keeps six kinds of content aligned:

1. business glossary;
2. data dictionary;
3. taxonomies;
4. controlled vocabularies;
5. resources;
6. relationships.

They are published as an RDF ontology, generated JSON Schemas,
website/PDF/Markdown documentation and an optional ontology-to-schema mapping runtime.
Validation constraints remain a model concern and may be encoded as SHACL shapes.

The eleven OPDA lenses from ADR-0063 are the completeness checklist:

- **Meaning:** domain structure; controlled vocabulary; taxonomy; classification.
- **Trust:** governance and compliance; provenance and quality; access control and
  sensitivity.
- **Correctness:** validation and constraints; temporal state and history.
- **Exchange:** cross-domain mappings; common ontology.

The labels are presentation shorthand. The authoritative names, standards and four
permitted dispositions remain those in ADR-0063.

## From ontology to familiar technology

An ontology records shared meaning independently of one exchange format. Combined with
explicit generators, templates and transformation rules, it can drive familiar
artefacts:

- JSON Schema and API contracts;
- forms and web interfaces;
- documents, PDFs and emails;
- validation services;
- code, database definitions and integrations.

This is strategically important for vendors. They can consume outputs in technologies
they already use; they do not have to deploy a triple store or adopt AI. It is also
important not to make a magical-generation claim. Correct output depends on a tested
transformation contract, target-specific design choices and release gates.

The existing
[model-driven generation vision](../linked-data-initiative/09-model-driven-generation-vision.md)
distinguishes built, partial and planned capabilities.

## AI → ontology → better AI

The cycle has two directions:

1. **AI → ontology:** AI helps extract, compare and formalise meaning from large,
   heterogeneous stakeholder evidence.
2. **Ontology → better AI:** the governed model gives later AI systems an explicit
   vocabulary, relationships, constraints, provenance and context.

The second direction improves grounding and interoperability and can reduce repeated
prompt engineering, mapping and bespoke integration. It also makes AI behaviour easier
to test against agreed concepts and rules. These are direction-of-travel benefits, not
an assertion that every present AI system requires an ontology or becomes effortless
merely because one exists.

## Likely pushback and response

| Pushback | Response and design implication |
|---|---|
| **"Are we throwing away the work already done?"** | No. The schemas, generated ontology, mappings, glossary, dictionary, validation and website remain evidence, traceability and implementation inputs. Authority for domain meaning changes; the assets are not discarded. |
| **"This sounds like starting again."** | The programme is changing method after learning from a successful first phase. Existing artefacts seed coverage, test compatibility and support migration. Avoid "from scratch" and "built from the ground up" language. |
| **"We are not ontologists."** | Participants review diagrams, terms, examples and rules. They contribute domain evidence and judgement, not ontology code. |
| **"AI will hallucinate or make unsafe decisions."** | AI produces proposals. Sources, uncertainty, dissent, validation and comment dispositions remain visible; only people may approve a later release under the governance agreed for it. Multiple models are useful challenge, not proof. |
| **"AI is replacing the subject-matter experts."** | The experts decide whether the model represents the domain. AI reduces transcription and modelling latency; it cannot supply missing industry judgement. |
| **"Our organisation is not adopting AI."** | Participation and consumption do not require AI. The same model supports familiar schemas, APIs, forms, documents and integrations. |
| **"An ontology cannot generate all those things."** | Correct: the ontology supplies governed meaning. Tested generators, templates and target-specific transformation rules produce downstream artefacts. State what is built and what is planned. |
| **"FIBO already models finance."** | FIBO is a valuable finance-domain ontology and reuse candidate. The group still needs to define the property-finance boundary, UK context, competency questions and integration needs before deciding what to reuse. |
| **"Separate groups will fragment the standard."** | Each group owns local meaning; the interoperability group owns boundary agreements, the common boundary ontology and mappings. Federation makes differences explicit rather than hiding them. |
| **"More groups will make this slower."** | Bounded groups can work in parallel and review smaller increments. The main coordination cost is explicit and belongs to the interoperability group. |
| **"Recorded meetings and uploaded documents may be confidential."** | Recording is consent-based. Sources require classification, access control, retention and publication rules before ingestion. Public drafts must not expose restricted evidence. |
| **"An AI council of named experts sounds like endorsement."** | Named perspectives are grounded reasoning roles. They must never be presented as participation or endorsement by the real individuals. |
| **"Who is accountable when the model is wrong?"** | The working group and OPDA governance remain accountable. Candidates retain sources, stewardship, review evidence, open issues and change history. The consensus and resolution mechanism for later normative approval is still to be defined. |

## Finance and Banking application

The first workshop should not attempt to model the full mortgage journey in the room.
It should:

- explain the practical problem and the contribution model;
- explain a data model, then contrast familiar form/JSON trees with the connected
  ontology graph without presenting either as a replacement for the other;
- demonstrate the current website as a review interaction, not as the draft mortgage
  ontology;
- show the complete working-group and interoperability structure;
- distinguish the six content outputs from the publication artefacts;
- explain Teams threads, the forthcoming intake email and planned page-level discussion
  system as complementary surfaces;
- begin a broad, governed collection of sources rather than a live modelling or
  prioritisation exercise; and
- explain that Henrik will use the resulting evidence, with AI assistance, to publish
  the first candidate for review.

The exact intake route, Teams details and working-group email will be communicated once
established. The email is not a mailing list and Teams remains the discussion hub.

The initial activity map is:

- advice and fact-find;
- product sourcing and criteria;
- applications and underwriting;
- servicing and product switching;
- lenders' conveyancer requirements.

FIBO needs only a short orientation as an established ontology for the finance domain.
Detailed assessment comes after the group has agreed its scope.

## Sources and related decisions

- [ADR-0063 — domain-led bounded-context working groups](../adr/ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow](../adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ODR-0001 — Linked Data Council methodology](../ontology/odr/ODR-0001-linked-data-council-methodology.md)
- [AI Linked Data Council methodology](../linked-data-initiative/06-ai-linked-data-council-methodology.md)
- [Model-driven generation vision](../linked-data-initiative/09-model-driven-generation-vision.md)
- [W3C Process Document](https://www.w3.org/policies/process/)
- [W3C Data on the Web Best Practices](https://www.w3.org/TR/dwbp/)
- [Financial Industry Business Ontology overview](https://edmcouncil.org/frameworks/industry-models/fibo/)
