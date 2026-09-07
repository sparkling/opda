# Ontology-modelling enrichment proposal

Date: 7 September 2026. Status: **proposal for review; local only**.
OPDA review baseline: `a56502011226590e8271eeb30bdca1ac0a6ea4c9`.
Scope corrected by the operator on 7 September 2026 and recorded in the updated
ADR-0063/0064. Their specification remit governs this revised proposal.

## Recommendation and audience

Enrich **Modelling → Ontology modelling** around authoring a specification, governing
its meaning, and generating the JSON-LD artefacts most implementers will use. Expand
the existing delivery explanation, add a focused vocabulary/classification chapter,
and explain constraint authoring, mapping review and trust-governance recommendations.
Use the established contextual boundaries and their existing documentation throughout.
Linked-data-store and trust implementation guidance is informative.

The primary audience is specification authors, ontology modellers and governance
contributors. Most downstream implementers need to understand the generated JSON-LD
exchange package and its declared requirements. The material should teach **how an
agreed distinction becomes a model statement, a reviewable rule and a generated
artefact**, with reasons and examples. Operating an OPDA data application is outside
this effort; the authoring and generation tools support specification development.
The ODRs guide that authoring method; they do not require consumers to reproduce its
toolchain or run the source project's infrastructure.

| Part of the work | What the documentation should explain |
| --- | --- |
| Specification and formal models | Definitions, identifiers, relationships, constraints and exchange profiles expressed through RDF, RDFS, OWL, SHACL and selected vocabularies. Each requirement retains its adopted scope and status. |
| Specification governance | Ownership, evidence, practitioner review, mapping decisions, change control and approval of specification versions. |
| Generated JSON-LD delivery | Contexts, associated JSON Schemas and examples derived from the formal models, with clear version relationships and the checks each delivery profile covers. This is the main implementer route. |
| Informative implementation guidance | Material for implementing a linked-data store and recommendations for realising trust. Store selection, deployment, enforcement machinery and service operations do not become normative specification requirements. |

The current method already explains identity before equivalence, roles and phases,
property applicability, bounded language profiles, qualified SSSOM records, strategic
context maps, provenance, time and policy boundaries. The gaps below are missing
decision procedures and technical counterexamples, not an absence of those subjects.
The separate learning proposal owns practitioner-facing introductions and participation;
this proposal owns the formal recipes to which those introductions should link.

This artefact changes no website page, navigation, ontology, candidate, source pin or
decision status. It authorises no publication, deployment or push.

## 1. Authority and evidence boundary

| Evidence | Recorded status and date | Consequence for this proposal |
| --- | --- | --- |
| [ADR-0063, §§1–3a][adr63] | Accepted; updated 7 September 2026 | Specification development within established contexts; main generated JSON-LD route; informative store/trust implementation guidance. Selected source-method rules remain normative within eight concerns. |
| [ADR-0064][adr64] | Accepted; updated 7 September 2026 | Two audiences learn participation, specification authoring and delivery. Shared page/navigation templates remain; operational application training is excluded. |
| [ADR-0067, §§2–4 and 5.4][adr67] | Accepted; updated 3 September 2026 | First-principles meaning, one semantic home per OPDA resource, eight concerns and explicit standards/conformance boundaries. |
| [ADR-0074][adr74] | Implemented; updated 5 September 2026 | Preserve the canonical Modelling family and shared information architecture. Historical route descriptions do not supersede later amendments. |
| [ADR-0075][adr75] | Accepted; updated 3 September 2026 | Property Pack is an accelerated SPDTF component, not a universal bounded context. Technical determination, later domain review, release and external recognition remain distinct. |
| [Method-adoption crosswalk][crosswalk] | 29 local records; 5 September 2026 | Local ODR-0036–0064 are OPDA adaptations of selected source records, not same-number aliases or transferred implementation receipts. |
| Original committed source, **S** | `67174057e6384b79d0b28b7736fe70a66e112895`; commit dated 2 September 2026 | The adopted upstream snapshot. Exact source locators and applicable sections appear in §6. |
| Newer committed source, **N** | `5e083c3baf6837ab93698d883a6ff01338565bd8`; ODR-0071k updated 6 September 2026 | A review candidate only. Newer committed content is not silently adopted. See §4. |

The original project was inspected read-only through committed Git objects. Its dirty
working tree is not authority. Source-specific organisations, examples, governance
bodies, execution paths and validation receipts are not transferred into OPDA content.
The crosswalk preserves provenance without making those details reader-facing examples.

The selected concerns remain 1, 2, 5, 7, 8, 9, 10 and 11. Process modelling, service
architecture, a governance ontology, capability/intent, executable source mapping and
data-product modelling remain outside this scope. Specification and trust governance
remain central to this effort; excluding a governance ontology does not exclude
governance decisions or recommendations.

RDF 1.2, SPARQL 1.2 and SHACL 1.2 remain OPDA's recorded standards-family baseline.
Selected features, processor support and current candidate use remain separate claims.
This review does not refresh external standards maturity: the [standards register][profile]
records checks dated 20 August 2026. Verify exact primary specification snapshots before
making any new claim about current W3C publication status; an upstream ODR is not that
evidence. Do not widen Property Pack 0.1's recorded feature boundary through teaching text.

## 2. Prioritised content changes

| Priority | Addition and current insertion point | Actual gap | Source basis |
| --- | --- | --- | --- |
| High | **From formal specification to generated JSON-LD**, expand [meaning/checks/delivery, `delivery`][delivery] | The existing projection explanation is generic. Make the main JSON-LD implementer route concrete and identify the informative status of store guidance. | Operator clarification of 7 September; updated [ADR-0063 §2][adr63] and [ADR-0064][adr64]. |
| High | **Vocabularies and classification**, a focused chapter in Ontology modelling; linked from [language profiles, `controlled-choices`][languages] and [scope/package, `assessment`][scope] | Technical closure, dual typing, open populations, infrastructure facets and profile-specific cardinality are dispersed or omitted. The nontechnical [names and choices][choices] chapter should not absorb this syntax. | S: ODR-0010; ODR-0016/0023; ODR-0071b R3–R6; ODR-0071e R3–R6. Local [ODR-0036][odr36], [0039][odr39], [0040][odr40], [0048][odr48], [0049][odr49]. |
| High | **Write reviewable constraints**, following [meaning/checks/delivery, `validation`][checks] | Show how authors establish that a specified constraint expresses the agreed rule, including missing information and contradictory requirements. | S: ODR-0071g R1–R6. Local [ODR-0050, Rules][odr50]. |
| Medium | **Govern mapping decisions**, extending [mapping records, `failure`][mappings] | Explain the review decisions, responsibilities and version changes when evidence changes, including exact-match chains and previously denied mappings. | S: ODR-0098 R5/R6/R8/R11. Local [ODR-0059][odr59]; active field profile in [ODR-0056][odr56]. |
| High | **Trust-governance recommendations**, refocus [sensitivity/policy][policy] | The current page puts operational enforcement alongside required modelling method. Make specification content, governance recommendations and informative implementation examples distinguishable. | Updated [ADR-0063 §2][adr63], [ADR-0064][adr64]; selected policy concepts from local [ODR-0054][odr54]. |
| Medium, within vocabulary chapter | **Administrative description is not classification** | [Language profiles, `evidence-around-the-answer`][metadata] names Dublin Core generically; the exact local Category 5 profile is not shown. | S: ODR-0086 R1–R3/R5. Local [ODR-0055][odr55], including its catalogue exclusion. |
| High adoption review; independent of content work | **Reconcile scheme-valued sensitivity predicates** | [Sensitivity/policy, `dpv`][policy] correctly follows the adopted annotation-first pin, but newer source ODR-0071k changes three property kinds. This is not a current-page defect against S. | N: ODR-0071k R2–R5 and 6 September amendments; contrast local [ODR-0054][odr54]. |

### 2.1 From the formal specification to generated JSON-LD

Expand the existing delivery section and use it as the common reference for both
audiences. Start with the agreed distinction between an inspection and a report version,
show the relevant model statement and constraint, then show how the generated JSON-LD
package carries those meanings into an implementer's exchange.

Use one annotated flow: practitioner agreement → formal models and shapes → generation
→ versioned JSON-LD artefacts → implementer's own system. A separate informative branch
shows that the supplied models can also support a linked-data-store implementation.
The optional branch must not appear as a prerequisite for consuming the JSON-LD package.

Explain the deliverables concretely:

- A JSON-LD context relates the exchange's terms to identifiers and value interpretations.
- Associated JSON Schemas describe the generated document structures and mapped checks.
- Worked documents show identifiers, types, references, vocabulary values and versions.
- A short generation map records the formal source of each field and constraint, with
  any requirement needing additional checks made explicit for that delivery profile.

For example, keep report version 2 and its inspection separately identifiable in the
generated document. Show the source of a required inspection reference and a permitted
outcome value. Explain which checks belong to the document and which depend on related
information. A context, schema and shape have distinct jobs; generation must preserve
the agreement rather than imply that every formal rule has the same JSON representation.

Label draft examples and planned generation honestly. Their purpose is to explain the
intended specification package; implementing a generator or claiming current artefact
coverage requires separate evidence. Reader guidance should identify the artefact and
version to use without requiring the reader to operate an RDF store or SPARQL endpoint.

### 2.2 Vocabularies and classification: one coherent technical chapter

Proposed working route: `/semantic-modelling/method/vocabularies-and-classification`.
This is a proposal, not an existing page. A dedicated chapter is justified because
Category 2 and Category 5 need a connected decision procedure, while the current
languages page already carries the complete standards register. Keep that page's
short introduction and `controlled-choices` anchor, then link to the deeper treatment.
No second standards register, duplicate introductory lesson or new navigation system.

Proposed chapter sequence:

1. **What is being enumerated?** Distinguish a domain value, a taxonomy concept, an
   independently identifiable domain resource and metadata classifying a model element.
2. **Is completeness evidenced?** Record Closed, OpenEnded or Classification scheme
   role, scope, owner and version. Absent evidence of closure, use the conservative
   open-ended disposition. A sample containing three values does not prove only three
   are possible. The Classification role describes editorial/policy use; it is not an
   additional ontological kind.
3. **Choose the representation and validation together.** Use the following decision
   matrix, then show short annotated Turtle/SHACL examples under a declared profile.

| Case | Representation | Check and counterexample |
| --- | --- | --- |
| Closed domain enumeration | Each member is both `skos:Concept` and an instance of the domain value class; scheme, label, definition and stable identifier are explicit. This is multi-typing, not punning. | `sh:in` closes the permitted IRI set. A newly typed member outside the list is still rejected. Do not add redundant `sh:class` without a separate requirement. |
| Open taxonomy | `skos:Concept` members with reviewed scheme and broader/top relationships; no invented domain enumeration typing. | Validate the chosen vocabulary profile without claiming the current members are exhaustive or imposing a closed `sh:in` list. |
| Open population of resources | Instances of a relevant domain class, such as individually identified surveyors. | `sh:class` plus scoped constraints; adding a valid new individual must not require editing an enumeration. State how required type information is available. |
| Infrastructure classification facet | Governed annotation property with SKOS values; no recursive stub domain class for every facet value. | Correct scheme, applicability and declared facet/profile cardinality. A subject-area value from the wrong scheme must not pass because it is merely a SKOS concept. |

4. **Make the vocabulary maintainable.** Preferred labels name concepts, `altLabel`
   records recognised alternatives, `notation` preserves codes, and definitions and
   scope notes explain meaning. Assert `skos:broader` child-to-parent; distinguish it
   from subclassing and physical containment. Flat enumeration values are top concepts.
   A label rename does not create a new identity. Extend a closed value list and its
   receiving constraint together; document deliberately narrower delivery profiles.
5. **Separate absence from a value.** “Unknown”, “NotSet” or an empty field ordinarily
   describes missing knowledge, not a domain outcome. A genuinely defined absence
   concept needs semantic justification. Do not infer closure, defaults or exhaustive
   values from a form control. Where relevant, retain primitive bitfield meanings, not
   every composite implementation combination.
6. **Classify without changing identity.** Present the seven facet questions from
   ODR-0036: subject area, data classification, lifecycle stage, governance tier,
   volatility, regulatory relevance and value-chain position. Keep human assignment
   distinct from advisory extraction; a folder path cannot decide subject area or an
   actual regulatory obligation. Keep sensitivity in Category 11.
7. **Declare which completeness profile applies.** In the base pattern, the first
   five facets are required/single-valued, regulatory relevance is required/multi-valued,
   and value-chain position is optional/multi-valued. ODR-0049's stricter generated
   publication profile and ODR-0055's Category 5 profile require the complete seven-facet
   set. Neither silently changes base optionality nor excuses an incomplete profile
   claim. Show a draft finding without lowering severity because a machine authored it.
8. **Describe the record as well as its classifications.** Show the bounded Category 5
   Dublin Core profile: one language-tagged title; one or more creators; one issued and
   one modified `xsd:date`; at most one external identifier. Preserve each term's local
   severity in ODR-0055, rather than making every omission blocking. `dct:subject` is
   conditional and refers to the backing subject-area scheme. These terms supplement
   facets and do not adopt a catalogue or the whole Dublin Core vocabulary.

Example/visual brief: a fictional inspection-outcome enumeration, a growing surveyor
population and a subject taxonomy appear side by side. Arrows are labelled as value
selection, instance typing and broader concept respectively. Show the same illustrative
report-class metadata under a base profile and a stricter Category 5 profile, with
different, explicitly explained results. All values remain illustrative, not approved
OPDA vocabulary. Use `example.org` IRIs in syntax.

Exercise brief: classify four incoming “lists”, justify closure or its absence, remove
an unjustified sentinel, repair a reversed broader link, and explain why adding a
surveyor does not change a closed report-status profile. Provide visible worked
reasoning, including where a modeller must ask a domain reviewer rather than guess.

### 2.3 Write reviewable constraints

Add a short authoring example after `validation`. Its purpose is to review the
specification's rules and their generated representations. Processor-specific setup
belongs in informative tooling notes, not in the specification's normative contract.

1. Identify the intended input, shape/profile version and information the rule assumes
   available. Make the expected result understandable to the domain reviewer.
2. Choose targets that include incomplete resources. Contrast a class-targeted report
   shape with selecting only subjects that already have the required report link.
   The latter misses the very absence the rule is supposed to catch; untyped missing
   resources also need an explicitly justified targeting rule.
3. Compose constraints deliberately. Requirements are conjunctive: a minimum count of
   two and maximum count of one is contradictory, not “more thorough validation”.
   Meta-validation alone does not prove arbitrary shapes satisfiable; include reviewed
   ordinary and adverse data cases and a scoped contradiction check.
4. Put intended Violation/Warning/Info severity on the owning shape. Explain structural
   failures, governance/documentation review and suggestions in the authoring review.
   Authored and generated content follow the same semantics.
5. Distinguish inline constraints on the selected dual-typed ShapeClass/OWL resource
   pattern from independent NodeShapes for cross-cutting or external targets. Explain
   the actual feature boundary; do not imply arbitrary class inheritance propagates
   shapes, or that the current simple example implements the full authoring profile.
6. Check shape declarations and generated output as well as domain instances, including
   typed NodeShape, PropertyShape and ConstraintComponent declarations, documentation
   and ownership. Preserve deferred concern-specific shape decisions.
7. Keep DASH editor/viewer hints, ordering and grouping in presentation. A widget is not
   a constraint. An explicitly selected DASH constraint component needs its own feature
   justification. Treat editor and processor configuration as informative tooling detail.

Example/visual brief: a small report graph, one intended shape and a result panel trace
focus node → path → source constraint → severity. Include a missing-property failure,
a contradictory shape and a warning that does not become an unexplained blocking error.
Exercise: diagnose an empty “success” report caused by a target that selects no defective
nodes. A corrected target and expected adverse result are the answer, not a green badge.

### 2.4 Govern mapping decisions

Extend the existing drift example; retain its SSSOM record, identity gates and predicate
semantics without restating them. Add a compact verdict table distinguishing:

- a warranted positive correspondence, with the actual predicate;
- positive association through `skos:relatedMatch`;
- a negated **named predicate**, qualified with SSSOM `predicate_modifier: Not`;
- a negative/unrelated decision; and
- no completed review yet, which must not be inferred as an explicit negative.

Relatedness, denial of a particular equivalence and unrelatedness are different claims.
Record denied candidates, not every possible pair. Do not export a negated record as
its unqualified positive assertion.

Use a three-concept exact-match chain to explain mandatory human reinspection of chains
of length two or more. Lowering confidence does not weaken `skos:exactMatch` semantics;
revise the predicate when the warrant does not support exactness.

The change exercise should run in both directions: new evidence falsifies an accepted
link key and prompts a governed retraction; a changed source version, newly
satisfiable key, rigidity retyping or coherence regression reopens a previously denied
candidate. Record versions, trigger, owner, superseded decision and resulting verdict.
Expose unresolved outcomes rather than inventing a mapping to finish the exercise.
Record the governance lifecycle in the specification's mapping register: who reviews,
which evidence was considered, which decision supersedes which, and when a mapping needs
review. ODR-0059 R11's curation and staleness requirements inform those records; they
are not a request to build a running monitoring or curation service.

Do not promote the separately labelled proposed round-two identity refinement in
source ODR-0098/local ODR-0059 merely because the document header is Accepted.

### 2.5 Explain trust governance and label implementation recommendations

Refocus the existing sensitivity/policy examples on responsibilities and the meaning
the specification must carry: provenance, quality evidence, sensitivity, purpose,
authority, permitted use and obligations. Explain who can propose and approve a policy,
what evidence supports it and how changes are recorded. Keep domain roles distinct
from policy roles and evidence of a claim distinct from authority to use it.

Use a worked governance decision about the fictional report: state the question, record
the accountable reviewer, describe the available evidence and show the resulting policy
recommendation and unresolved issues. Then show which concepts are represented in the
formal model and which information a generated exchange would need to preserve.

Clearly label guidance on how a recipient might enforce a policy or implement a
linked-data store as informative recommendations for downstream implementers. Examples
of evaluators, named graphs, APIs or access checks must not imply that OPDA will operate
them, or make a particular deployment architecture normative. Normative modelling
requirements retain their declared scope; an illustrative trust mechanism does not
acquire that status merely by appearing beside them.

## 3. Integration with existing chapters and the learning track

Retain the shared `ModellingLayout`, callout conventions, 1024px prose measure,
full-width tables/images and existing bottom-page navigation. Use visible subsections,
annotated examples and answer reasoning; do not hide lessons inside accordions.
Proposed new material uses the existing branch, contents and previous/next mechanisms.
No parallel navigation widget or second technical “start here” hub is needed.

Preserve current page routes and fragment anchors. Any eventual chapter addition needs
normal registration in the existing navigation/search model, not a second route family.
The current `method/index` remains the manifesto and orientation; it should link to
the richer decision procedures without becoming another copy of them.

| Existing coverage to preserve | Enrichment boundary |
| --- | --- |
| [Roles and phases][roles]: identity, rigidity, bearer dependence, local role/phase patterns and encoding | Link from the vocabulary exercises; no second kind/role/phase lesson. |
| [Evidence and time][time]: resource/claim provenance, event/document dates, valid/recorded time and scoped history | Reuse its report-version story; no duplicate PROV-O or OWL-Time chapter. |
| [Languages, `mechanisms`][reuse]: reuse/reference/map/mint and import boundaries | Refer to it when selecting terms; add only the missing exact Category 5 profile. |
| [Context maps][contexts]: established contextual boundaries, projection scope, explicit exclusions and exact mapping applicability | Preserve and link this existing account as the fixed context for mappings; do not add another boundary lesson or repeat the ODR-0127 profile. |
| [Names and choices][choices] and the separate learner proposal | Learners distinguish names, values and meanings in ordinary language. The new technical chapter owns SKOS/SHACL recipes. |

Coordinate examples with the existing fictional Harbour Court case. Reuse the building,
dwellings, inspection and report-version distinctions; keep unresolved subdivision
identity unresolved. Learner pages may link directly to a relevant technical section,
but should not acquire its detailed conformance tables or formal authoring exercises.

## 4. Explicit adoption gate: newer sensitivity-policy source

The committed S→N ODR change is ODR-0071k, whose 6 September amendment promotes three
scheme-valued policy predicates from annotation to object properties, leaves five
annotation properties, adds a processing-purpose scheme and uses an entailment-safe
`rdfs:range skos:Concept`. It also requires exact named-scheme membership at Builder
acceptance while general standalone direct-TBox SHACL enforcement remains staged.

| Upstream local name, not a minted OPDA predicate | Change to assess at N |
| --- | --- |
| `applicableRegulation` | Annotation property becomes an object property with `rdfs:range skos:Concept`; acceptance checks its designated scheme. |
| `processingPurpose` | String-valued annotation becomes an object property pointing to a concept in the new `ProcessingPurposeScheme`, with `rdfs:range skos:Concept`. |
| `consentBasis` | Annotation property becomes an object property with `rdfs:range skos:Concept`; acceptance checks its designated scheme. |

That source change is significant, but local ODR-0054 and the current pages still
describe S's annotation-first contract. Do **not** silently rewrite them from N or claim
the source Builder's acceptance checks run in OPDA. A generic `skos:Concept` range alone
does not enforce membership in one particular scheme.

Recommended separate decision package:

1. Compare the exact committed property declarations, applicability, schemes and
   amendment precedence with local ODR-0054 and its ODR-0037 applicability obligations.
2. Record OPDA adoption, adaptation or deferral for each change, with scope, rationale,
   owner and effects on generated artefacts. Specify the representation and any data
   constraints independently of the source Builder's implementation.
3. If accepted, amend the local decision and provenance crosswalk coherently, preserving
   historical pins. Update the sensitivity chapter, language-profile summary and
   standards/decision register together. Neither a proposal nor a newer Git commit
   constitutes that acceptance.
4. Review illustrative cases for property typing, both-side applicability, correct-scheme
   membership and processing-purpose values before adopting a specification amendment.
   Record impacts on generated JSON-LD artefacts and any constraint coverage still to
   be specified. Runtime enforcement remains downstream implementation guidance.

This gate can proceed alongside the other enrichment work. Deferral does not block
explaining the already adopted vocabulary, validation or mapping rules.

## 5. Coherent work packages and proportional acceptance evidence

The sequence below is for a later authorised implementation, not work performed by
this proposal. Existing adopted rules need explanation; invented vocabulary, additional
normative requirements and the newer source delta need their own approval.

| Package | Deliverable and dependency | Evidence required before the slice is complete |
| --- | --- | --- |
| A — Specification and JSON-LD delivery | Expand the existing delivery section with the formal-source-to-generated-artefact example and informative store branch. | Traceable identifiers and constraints; distinct context/schema/shape responsibilities; no claim that a store is required or the planned generator already exists. |
| B — Values and metadata | Add the proposed vocabulary/classification chapter and precise links from languages and scope/package, using the established contexts and ownership language unchanged. | Four representation cases and their counterexamples; closure evidence; correct broader direction; facet/base/profile separation; exact bounded metadata requirements; all illustrative terms labelled. |
| C — Constraint authoring | Add the reviewable-constraint section, sharing B's examples where useful. | Missing-property and contradiction cases; explain intended severity and what the generated delivery profile checks. |
| D — Mapping governance | Extend mapping records within the established contexts and their documented seams. | Distinct verdicts, an exact-match chain review and both retraction/reopening cases; versions and review ownership; no proposed identity refinement promoted. |
| E — Trust recommendations | Refocus sensitivity/policy on governance and identify informative implementation examples. | Responsibilities and decision evidence are clear; model semantics, recommendations and deployment choices have explicit standing. |
| F — Policy reconciliation | Separate specification decision package from §4. | Exact upstream delta, local dispositions and artefact impacts; accepted amendment before normative model changes. |

For implemented website slices, run the repository's required tests and build, scoped
link/anchor checks and a proportionate rendered review of changed pages through the
approved existing Chrome profile. Check visible meaning, keyboard access, table/code
overflow, narrow/wide layout and existing navigation continuity. Test actual RDF/SHACL
examples with declared processors when they claim executable behaviour; a prose review
does not substitute for those results. Do not replay an unrelated full-site historical
migration programme for a bounded content addition. Publication requires separate
current authorisation after the relevant release gates.

For **this proposal**, acceptance is narrower: original committed-source comparison,
local adoption/status reconciliation, current-page gap assessment, independent source
critique, valid local references, scope/diff review and fewer than 500 lines. No browser,
ontology execution, application test or build result is claimed. This is a review-ready
content plan, not evidence of candidate or website conformance.

Review evidence: committed-source research was followed by a separate source/authority
critique of this draft, including the direct S→N ODR-0071k diff, ODR-0036/0049/0055
cardinality contracts and ODR-0059 verdicts. A later correction removed the proposed
boundary-discovery work because contextual boundaries are already fixed and documented.
The operator also clarified the development remit: specification and trust governance,
main generated JSON-LD delivery, and informative linked-data-store guidance. This
revision applies that scope throughout and does not claim a completed generator.
Local reference targets and explicit page anchors were checked. This review establishes
source fidelity and scope, not implementation or ontology conformance.

## 6. Original-source locator register

Resolve each source filename below beneath `docs/ontology/odr/` in the original
`semantic-modelling` repository at **S**, unless **N** is explicitly stated. The
[crosswalk][crosswalk] binds each to its differently numbered OPDA adaptation. These
are committed-source locators, not mutable `main` links. Read later amendments before
older retained wording; adopted local scope takes precedence over excluded source work.

| Original filename | Sections supporting the proposal | Local adaptation |
| --- | --- | --- |
| `ODR-0010-multi-faceted-classification-framework.md` | Facet framework and cardinality rules | ODR-0036 |
| `ODR-0016-skos-for-enumerations.md` | Rules: core pattern, closure, enumeration/taxonomy distinction | ODR-0039 |
| `ODR-0023-enumeration-modeling-pattern.md` | Rules: closed/open representation and facet exemption | ODR-0040 |
| `ODR-0071b-cat2-vocabulary-taxonomy-pipeline-adoption.md` | Rules R3–R6: closure, exclusions, hierarchy, typing | ODR-0048 |
| `ODR-0071e-cat5-classification-metadata-pipeline-adoption.md` | Rules R3–R6: human assignment, draft/publication gate and profile completeness | ODR-0049 |
| `ODR-0071g-cat7-validation-constraints-pipeline-adoption.md` | Rules R1–R6: shared validation, severity and presentation boundary | ODR-0050 |
| `ODR-0086-dublin-core-cat5-annotation.md` | Rules R1–R3/R5; local adaptation excludes source catalogue coupling | ODR-0055 |
| `ODR-0098-cross-context-identity-criterion-protocol.md` | Rules R5/R6/R8/R11; separate proposed refinement remains non-normative | ODR-0059 |
| `ODR-0071k-cat11-access-control-data-sensitivity-adoption.md` at S and N | Rules R2–R5; N's 6 September XC-13/XC-14 amendments; not adopted by implication | ODR-0054 remains at S |

[adr63]: ../adr/ADR-0063-domain-led-bounded-context-working-groups.md
[adr64]: ../adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md
[adr67]: ../adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md
[adr74]: ../adr/ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md
[adr75]: ../adr/ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md
[crosswalk]: ../ontology/odr/method-adoption-crosswalk.json
[profile]: ../../src/lib/spdtf-standards-profile.mjs
[odr36]: ../ontology/odr/ODR-0036-multi-faceted-classification-framework.md
[odr39]: ../ontology/odr/ODR-0039-skos-for-enumerations.md
[odr40]: ../ontology/odr/ODR-0040-enumeration-modeling-pattern.md
[odr48]: ../ontology/odr/ODR-0048-cat2-vocabulary-taxonomy-pipeline-adoption.md
[odr49]: ../ontology/odr/ODR-0049-cat5-classification-metadata-pipeline-adoption.md
[odr50]: ../ontology/odr/ODR-0050-cat7-validation-constraints-pipeline-adoption.md
[odr54]: ../ontology/odr/ODR-0054-cat11-access-control-data-sensitivity-adoption.md
[odr55]: ../ontology/odr/ODR-0055-dublin-core-cat5-annotation.md
[odr56]: ../ontology/odr/ODR-0056-sssom-cat8-mapping-provenance.md
[odr59]: ../ontology/odr/ODR-0059-cross-context-identity-criterion-protocol.md
[contexts]: ../../src/pages/semantic-modelling/method/context-map-records.astro#two-layers
[languages]: ../../src/pages/semantic-modelling/method/languages-and-profiles.astro#controlled-choices
[scope]: ../../src/pages/semantic-modelling/method/scope-and-package.astro#assessment
[choices]: ../../src/pages/semantic-modelling/explore/names-and-choices.astro
[checks]: ../../src/pages/semantic-modelling/method/meaning-checks-and-delivery.astro#validation
[delivery]: ../../src/pages/semantic-modelling/method/meaning-checks-and-delivery.astro#delivery
[mappings]: ../../src/pages/semantic-modelling/method/mapping-records.astro#failure
[metadata]: ../../src/pages/semantic-modelling/method/languages-and-profiles.astro#evidence-around-the-answer
[policy]: ../../src/pages/semantic-modelling/method/sensitivity-and-policy.astro#dpv
[roles]: ../../src/pages/semantic-modelling/method/roles-and-phases.astro
[time]: ../../src/pages/semantic-modelling/method/evidence-and-time.astro
[reuse]: ../../src/pages/semantic-modelling/method/languages-and-profiles.astro#mechanisms
