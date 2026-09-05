---
status: accepted
date: 2026-09-05
updated: 2026-09-05
kind: methodology
tags: [organising-principles, classification, foundational-discipline, register, ownership]
supersedes: []
amends: []
depends-on: [ODR-0036, ODR-0040, ODR-0041, ODR-0042, ODR-0045, ODR-0046, ODR-0055, ODR-0056, ODR-0058, ODR-0059, ODR-0060, ODR-0061]
implements: []
---

# Organise by concern while preserving independent classification and model authority

## Context and Problem Statement

An ontology can be organised by concern, topic, foundational type, owning context
or provenance. Treating all these perspectives as one hierarchy forces unrelated
questions together. Declaring one perspective universally primary can also turn
a useful documentation choice into an unjustified claim about reality.

The source-method deliberation initially concluded that concern-first organisation
and a model with no primary axis were operationally indistinguishable. Later
governing amendments reversed that conclusion: build and governance were organised
by concern, so the concern axis had an actual consumer. Those amendments also
changed the standing of source mapping. A faithful local adaptation must carry
the final decision, rather than the superseded recommendation repeated in its body.

OPDA selects eight concerns under ODR-0046. This decision explains their organising
role, the independent classification axes, the binding foundational discipline and
a register that makes the relationships discoverable. It does not import the
source framework's complete category count or its implementation apparatus.

## Decision Drivers

- Organisation must serve identifiable authoring, review or retrieval needs.
- Foundational classification constrains modelling without becoming every page's navigation hierarchy.
- Context authority and governance accountability must remain distinct.
- Cross-context mappings must not be confused with source-to-model transformation mappings.
- A register should make existing commitments findable without manufacturing ontology structure.
- Governing amendments take precedence over earlier, incompatible recommendations.

## Considered Options

- Use the selected concerns for practical organisation, with orthogonal facets and a binding foundational discipline.
- Make foundational types the universal organising hierarchy.
- Declare all axes co-equal with no primary organisation, even where build and review use concerns.
- Add a new ontology layer or class for every difficult-to-place metadata item.
- Maintain only a minimal list of exceptional artefacts without explaining their relationship to the model.

## Decision Outcome

Use the selected concerns as the primary unit of organisation for OPDA's adopted
modelling method. This is compatible with independent facets and context-specific
models: “primary for organising work” does not mean “determines every other axis”.

Foundational classification remains a binding discipline applied across those
concerns. It helps choose classes, roles and phases and supports explicit quality
checks. It does not require foundational-ontology subsumption or claim an active
description-logic reasoner. Maintain a records-only register of the organising
perspectives and their existing homes.

The eight concerns selected in ODR-0046 are the local scope. Process modelling,
application architecture, motivation/strategy and source mappings are not silently
admitted by adopting this organising principle. Other excluded source-framework
categories likewise remain excluded. Adding a concern requires its own explicit
scope decision, consumer and consequences.

### Consequences

- Good, because the method has a practical organising unit without collapsing the independent questions participants ask.
- Good, because foundational discipline has a clear place as authoring and validation guidance with explicit enforcement requirements.
- Good, because the register improves navigation and accountability without adding artificial domain classes.
- Bad, because a concept or artefact can need several distinct descriptions rather than one convenient domain label.
- Bad, because the register requires maintenance when a governing decision changes.
- Neutral, because adopting an organising method does not prove that its complete build, governance or validation apparatus exists locally.

### Confirmation

Implementation is pending. Confirm that each selected concern has an explicit
scope, locally linked decision and consumer. Check that the register points to
existing or explicitly pending homes without inventing emitted structures. Verify
the separation of subject, model authority, accountability and discovery provenance.
Evaluate OntoClean coverage using ODR-0061's target-aware reporting, not historical
donor fixture results. No external council vote is presented as OPDA ratification.

## Rules

### R1 — Use concern as the organising unit

Concern-based organisation is justified by its use in review, adoption and build
decomposition. A facet may support browsing across concerns without replacing
that decomposition. An entity-oriented or audience-oriented website view can
cross-cut the concern structure; the organisation of source decisions does not
require the same hierarchy in every presentation.

Do not revive the source's superseded assertion that no consumer distinguishes
concern organisation from no primary axis. Equally, do not claim that the source's
specific pipeline, directory count or governance sessions have been implemented
in OPDA. The local implementation must establish its own evidence.

### R2 — Apply foundational classification as a discipline

Use ODR-0041 and ODR-0042 for kind, role, subkind, phase and property placement.
Declare a property's domain at its most specific introducing class where that
modelling rule applies. The foundational perspective supplies authoring criteria;
it is not merely a decorative browsing facet.

Use ODR-0061's identity, rigidity, dependence and unity checks as the intended
quality gate. These are deterministic checks over asserted schema relationships,
with explicit activation conditions. They must not be described as live DL
entailment. Installed constraints with no targets do not demonstrate population
coverage. ODR-0063 governs the limits on foundational grounding.

### R3 — Maintain a register of perspectives and artefact homes

The register is documentation. Recording an item must not itself mint an IRI,
declare an OWL class, create a SHACL constraint or introduce a namespace. A small
table is sufficient until a real consumer requires a governed registry service.

| Register entry | What it records |
|---|---|
| Selected concern | Scope and governing local decision |
| Foundational discipline | Placement criteria and applicable validation rules |
| Classification facets | Independent classification questions under ODR-0036 |
| Bounded context | Definition authority and namespace boundary |
| Content stratum | Whether an artefact concerns material, meta, normative or provenance content where adopted |
| Coupling | Whether a construct is local or cross-cutting where applicable |
| Context mappings | The category containing mappings, with its provenance carrier |
| Validation artefacts | Their layer, targets and owning constraints |
| Presentation artefacts | Their existing view function, without promoting a view into a domain category |
| Administration | Record title, steward, issue/change dates and identifier |

Record explicit exclusions as exclusions. A register may mention an external
integration concern to explain its boundary without adopting its machinery.
Do not create a source-mapping model or platform section through this decision.

The administrative plane is orthogonal to subject classification: title, creator
or steward, issued date, modified date and identifier describe the record, while
facets classify the concept. Apply the selected Dublin Core subset under ODR-0055.
Additional registry lifecycle machinery needs demonstrated value and separate scope.

### R4 — Keep model/metamodel a value

Where content-stratum classification is adopted, use its `Meta` value for the
model/metamodel distinction. Do not promote the distinction into another class
hierarchy that must recursively classify itself. The annotation-property split
and facet exemptions support that boundary; they are not three competing axes.

Consolidate duplicate encodings through a documented canonical value and preserve
references to the rules they implement. Do not silently erase a distinction that
an existing consumer needs. ODR-0040 governs the recursion boundary.

### R5 — Distinguish context mappings from source mappings

Cross-context mappings are a selected concern, not an orphan outside the framework.
Their SKOS mapping assertions and any selected SSSOM provenance carrier remain
within the mapping concern under ODR-0056 and ODR-0058. A mapping assertion is not
automatically a material domain relator.

Source-to-model mappings describe a different relationship. The final source
amendment treated them as a first-class linked model and ultimately counted them
as an additional category. This adaptation does not reinstate the superseded
description “one orphan in a register”. It excludes that additional category from
the present local scope. Exclusion is a scope boundary, not a claim that source
mappings cannot be knowledge or that their source-method amendment never occurred.

### R6 — Preserve authority, accountability, topic and provenance separately

- Discovery-source metadata records where evidence was found; it is not an ownership facet.
- Accountable-owner metadata records stewardship and does not confer model authority.
- Subject-area metadata records intrinsic aboutness and can cross contexts.
- The bounded-context namespace identifies the boundary owning the definition.

ODR-0060 additionally separates the process/use question when analysing a domain
map. These questions must never collapse into one “data domain”. A reader looking
for ownership should find both model authority and accountability, clearly labelled.
Changing an accountable steward cannot silently transfer definition authority.

Promoting governance ownership into an additional organising axis would be a
separate decision. It is not implied by calling facets independent or by adopting
concern-based organisation. A register makes the distinction visible; it does not
settle a different ownership model by implication.

### R7 — Apply a proportionality rule to additional structure

Every proposed structure needs a consumer and a distinction that existing artefacts
cannot express. Documentation and cross-references often suffice for findability.
Do not add a new concern because a view spans categories, or a new foundational
class because a metadata record is difficult to file. A viewpoint may simply be
a selection across existing concerns; excluded viewpoints remain outside this scope.

## More Information

- [ODR-0046](/modelling/odr/odr-0046): selected concern model and adoption boundary.
- [ODR-0036](/modelling/odr/odr-0036): classification facets.
- [ODR-0040](/modelling/odr/odr-0040): model/metamodel and classification recursion.
- [ODR-0041](/modelling/odr/odr-0041), [ODR-0042](/modelling/odr/odr-0042): foundational placement rules.
- [ODR-0045](/modelling/odr/odr-0045), [ODR-0060](/modelling/odr/odr-0060): boundary and ownership decomposition.
- [ODR-0055](/modelling/odr/odr-0055): administrative metadata.
- [ODR-0056](/modelling/odr/odr-0056), [ODR-0058](/modelling/odr/odr-0058): mappings and their carrier.
- [ODR-0061](/modelling/odr/odr-0061): OntoClean checks and coverage limits.
- [ODR-0063](/modelling/odr/odr-0063): foundational-grounding boundary.

## Amendments

### 2026-09-05 — Adopt the amended method within the selected scope

Adapted from source-method decision 0115 at pinned revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its 2026-06-26 governing amendments
take precedence over its original recommendation: concern organisation has a real
consumer; source mappings were promoted beyond a register entry and subsequently
counted as a category. The concern principle is adopted within OPDA's selected
eight concerns; source mappings and other unselected categories remain excluded.

The binding foundational discipline, records-only register, model/metamodel value,
mapping distinction and ownership separation are retained. Private organisational
material, source paths and donor runtime evidence are removed. Historical simulated
expert deliberations are not reproduced as local votes or approvals. This is an
accepted local method with implementation confirmation pending.
