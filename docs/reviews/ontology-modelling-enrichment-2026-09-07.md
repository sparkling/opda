# Ontology-modelling enrichment proposal

Date: 7 September 2026. Status: **proposal for review; local only**.
OPDA review baseline: `a56502011226590e8271eeb30bdca1ac0a6ea4c9`.

## Recommendation and audience

Enrich **Modelling → Ontology modelling** with one focused chapter on vocabularies
and classification, plus targeted additions on validating the shape-authoring contract
and maintaining mapping decisions. Treat the established contextual boundaries and the
site's existing boundary guidance as fixed inputs; do not reopen their discovery or
duplicate that material. Separately review the newer access-policy decision; do not
present it as already adopted by OPDA.

The audience is ontology modellers, modelling facilitators and technical implementers
who need to turn an evidenced domain distinction into an inspectable model. The
additional material should teach **which decision to make, why its alternatives differ,
and what evidence would show it was implemented correctly**. It is not another
introductory RDF course, a copy of the ODR corpus, or an implementation programme for
the source project's tooling.

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
| [ADR-0063, §3a][adr63] | Accepted; updated 5 September 2026 | Selected source-method rules are normative for OPDA, within eight retained concerns. The whole source programme is not adopted. |
| [ADR-0064][adr64] | Accepted; updated 5 September 2026 | Two-audience modelling content uses the shared page/navigation templates; implementation and publication are separate. |
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
data-product modelling remain outside this scope. Explaining why a process label is
not a semantic boundary does not reinstate a process ontology.

RDF 1.2, SPARQL 1.2 and SHACL 1.2 remain OPDA's recorded standards-family baseline.
Selected features, processor support and current candidate use remain separate claims.
This review does not refresh external standards maturity: the [standards register][profile]
records checks dated 20 August 2026. Verify exact primary specification snapshots before
making any new claim about current W3C publication status; an upstream ODR is not that
evidence. Do not widen Property Pack 0.1's recorded feature boundary through teaching text.

## 2. Prioritised content changes

| Priority | Addition and current insertion point | Actual gap | Source basis |
| --- | --- | --- | --- |
| High | **Vocabularies and classification**, a focused chapter in the existing Method branch; linked from [language profiles, `controlled-choices`][languages] and [scope/package, `assessment`][scope] | Technical closure, dual typing, open populations, infrastructure facets and profile-specific cardinality are dispersed or omitted. The nontechnical [names and choices][choices] chapter should not absorb this syntax. | S: ODR-0010; ODR-0016/0023; ODR-0071b R3–R6; ODR-0071e R3–R6. Local [ODR-0036][odr36], [0039][odr39], [0040][odr40], [0048][odr48], [0049][odr49]. |
| High | **Validate the validator**, following [meaning/checks/delivery, `validation`][checks] | Existing semantic-vs-validation and rule-vs-constraint explanations are strong. Shape satisfiability, severity, absent-property targeting and meta-validation need an authoring procedure. | S: ODR-0071g R1–R6. Local [ODR-0050, Rules][odr50]. |
| Medium | **Reopen, retract and inspect mapping chains**, extending [mapping records, `failure`][mappings] | Versions and definition drift already appear. Mandatory exact-match chain review and symmetric reopening of denied mappings are not yet taught operationally. | S: ODR-0098 R5/R6/R8/R11. Local [ODR-0059][odr59]; active field profile in [ODR-0056][odr56]. |
| Medium, within vocabulary chapter | **Administrative description is not classification** | [Language profiles, `evidence-around-the-answer`][metadata] names Dublin Core generically; the exact local Category 5 profile is not shown. | S: ODR-0086 R1–R3/R5. Local [ODR-0055][odr55], including its catalogue exclusion. |
| High adoption review; independent of content work | **Reconcile scheme-valued sensitivity predicates** | [Sensitivity/policy, `dpv`][policy] correctly follows the adopted annotation-first pin, but newer source ODR-0071k changes three property kinds. This is not a current-page defect against S. | N: ODR-0071k R2–R5 and 6 September amendments; contrast local [ODR-0054][odr54]. |

### 2.1 Vocabularies and classification: one coherent technical chapter

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

### 2.2 Validate the validator

Add a bounded authoring sequence after `validation`, not another introduction to SHACL:

1. Pin the intended graph, applicable shape/profile, processor features and processing
   assumptions, using the existing chapter's contract.
2. Choose targets that include incomplete resources. Contrast a class-targeted report
   shape with selecting only subjects that already have the required report link.
   The latter misses the very absence the rule is supposed to catch; untyped missing
   resources also need an explicitly justified discovery/targeting contract.
3. Compose constraints deliberately. Requirements are conjunctive: a minimum count of
   two and maximum count of one is contradictory, not “more thorough validation”.
   Meta-validation alone does not prove arbitrary shapes satisfiable; include reviewed
   ordinary and adverse data cases and a scoped contradiction check.
4. Put intended Violation/Warning/Info severity on the owning shape. Explain structural
   failures, governance/documentation review and suggestions, plus explicit local
   escalation policy. Authored and generated content follow the same semantics.
5. Distinguish inline constraints on the selected dual-typed ShapeClass/OWL resource
   pattern from independent NodeShapes for cross-cutting or external targets. Explain
   the actual feature boundary; do not imply arbitrary class inheritance propagates
   shapes, or that the current simple example implements the full authoring profile.
6. Check shape declarations and generated output as well as domain instances, including
   typed NodeShape, PropertyShape and ConstraintComponent declarations, documentation
   and ownership. Preserve deferred concern-specific shape decisions.
7. Keep DASH editor/viewer hints, ordering and grouping in presentation. A widget is not
   a constraint. An explicitly selected DASH constraint component needs its own feature
   justification; DASH is not a W3C standard. Keep materialisation receipts separate.

Example/visual brief: a small report graph, one intended shape and a result panel trace
focus node → path → source constraint → severity. Include a missing-property failure,
a contradictory shape and a warning that does not become an unexplained blocking error.
Exercise: diagnose an empty “success” report caused by a target that selects no defective
nodes. A corrected target and expected adverse result are the answer, not a green badge.

### 2.3 Mapping decisions have a lifecycle

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
link key and triggers a governed retraction; a new context, source version, newly
satisfiable key, rigidity retyping or coherence regression reopens a previously denied
candidate. Record versions, trigger, owner, superseded decision and resulting verdict.
Expose unresolved outcomes rather than inventing a mapping to finish the exercise.
ODR-0059 R11 also requires a locally named curation lifecycle and queryable staleness;
an illustrative sequence is not proof that this workflow operates today.

Do not promote the separately labelled proposed round-two identity refinement in
source ODR-0098/local ODR-0059 merely because the document header is Accepted.

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
but should not acquire its conformance tables or normative implementation training.

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
   owner and effects on consumers. Define OPDA's enforcement boundary independently of
   the source Builder; do not import a runtime dependency.
3. If accepted, amend the local decision and provenance crosswalk coherently, preserving
   historical pins. Update the sensitivity chapter, language-profile summary and
   standards/decision register together. Neither a proposal nor a newer Git commit
   constitutes that acceptance.
4. Before claiming implementation, supply positive and negative evidence for property
   typing, both-side applicability, correct-scheme membership and processing-purpose
   values under the selected local processor/profile. Keep deferred SHACL surfaces,
   human policy decisions and actual access enforcement explicitly separate.

This gate can proceed alongside the other enrichment work. Deferral does not block
explaining the already adopted vocabulary, validation or mapping rules.

## 5. Coherent work packages and proportional acceptance evidence

The sequence below is for a later authorised implementation, not work performed by
this proposal. Existing adopted rules need explanation; invented vocabulary, additional
normative requirements and the newer source delta need their own approval.

| Package | Deliverable and dependency | Evidence required before the slice is complete |
| --- | --- | --- |
| A — Values and metadata | Add the proposed vocabulary/classification chapter and precise links from languages and scope/package, using the established contexts and ownership language unchanged. | Four representation cases and their counterexamples; closure evidence; correct broader direction; facet/base/profile separation; exact bounded metadata requirements; all illustrative terms labelled. |
| B — Validation authoring | Add the authoring/assurance section, sharing A's fixtures where useful. | Shape declarations checked; expected conforming and nonconforming outcomes for required features; absent-property target case, contradiction case and intended severity checked. Unsupported/not-run features remain visible, not passed. |
| C — Mapping maintenance | Extend mapping records within the established contexts and their documented seams. | Distinct verdicts, an exact-match chain review and both retraction/reopening cases; pinned endpoint/mapping-set versions; no proposed identity refinement promoted. |
| D — Policy reconciliation | Separate human decision package from §4; independent of A–C. | Exact upstream delta and local dispositions; an accepted amendment before normative page changes; OPDA-specific conformance evidence before implementation claims. |

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
[mappings]: ../../src/pages/semantic-modelling/method/mapping-records.astro#failure
[metadata]: ../../src/pages/semantic-modelling/method/languages-and-profiles.astro#evidence-around-the-answer
[policy]: ../../src/pages/semantic-modelling/method/sensitivity-and-policy.astro#dpv
[roles]: ../../src/pages/semantic-modelling/method/roles-and-phases.astro
[time]: ../../src/pages/semantic-modelling/method/evidence-and-time.astro
[reuse]: ../../src/pages/semantic-modelling/method/languages-and-profiles.astro#mechanisms
