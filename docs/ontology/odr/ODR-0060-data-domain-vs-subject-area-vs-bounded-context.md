---
status: accepted
date: 2026-09-05
updated: 2026-09-05
kind: methodology
tags: [subject-area, bounded-context, data-domain, classification, accountability]
supersedes: []
amends: []
depends-on: [ODR-0036, ODR-0038, ODR-0045, ODR-0059]
implements: []
---

# Distinguish data domains, subject areas and bounded contexts

## Context and Problem Statement

Property participants bring different ways of organising information. A governance
programme may assign a data domain to an accountable owner; a glossary groups terms
by topic; a modelling group defines a bounded context with its own language. These
structures answer different questions, although all three may be called a domain.

Copying a governance partition into the ontology would couple meaning to present
accountability arrangements. Copying an organisation chart into subject areas would
make the meaning of a concept change when responsibility moves. Equating working
groups with contexts would assume that organisational membership determines a
language boundary before that boundary has been examined.

This record consolidates the distinction for OPDA. It adopts the modelling method;
it does not adopt any external organisation's domain map or claim that an OPDA
ownership register has already been populated.

## Decision Drivers

- Meaning must remain intelligible across organisations, systems and changes of owner.
- Model authority, stewardship and topical classification need separate explanations.
- A subject can occur in several bounded contexts without merging their definitions.
- Governance artefacts should inform modelling without dictating entity identity.
- Existing classification and boundary rules should be findable in one place.

## Considered Options

- Decompose domain maps into separate topic, model authority, process and accountability information.
- Leave each distinction scattered across classification and context decisions.
- Adopt a governance domain map as the canonical classification and namespace hierarchy.

## Decision Outcome

OPDA decomposes a domain map into independent questions. A domain map is input to
analysis, not an ontology to import wholesale. The same concept can have a topic,
a defining context, a process-related classification and an accountable steward
without any one of those values determining the others.

| Question | Meaning | Representation in the method |
|---|---|---|
| What is this about? | Intrinsic subject matter | Subject-area classification |
| Who owns this definition and language? | Model authority | Bounded context and its namespace |
| Which activity uses it? | Contingent business use | Process/value-chain metadata where applicable |
| Who is accountable for quality? | Governance responsibility | Informational owner/steward metadata |

The process row preserves the distinction, but does not admit process modelling
as an additional concern in OPDA's selected eight-category scope. It does not
require every concept to receive a process value. Missing evidence remains missing.

### Consequences

- Good, because participants can relate their familiar governance maps to the model without conflating authority and meaning.
- Good, because subject areas can cross context boundaries while local definitions remain accountable.
- Good, because reorganisations need not rename concepts or reissue their identifiers.
- Bad, because a single business label may require several independently maintained annotations.
- Neutral, because this record consolidates rules; it does not establish a new governance organisation or validate a complete domain map.

### Confirmation

Implementation is pending. Review representative property concepts against all four
questions and demonstrate that changing a steward does not change the subject area
or context identity. Check context-specific definitions and mappings against
ODR-0059. Confirm that governance ownership fields cannot grant model authority.
No completed population, validation run or stakeholder ratification is asserted here.

## Rules

### R1 — Define each construct by the question it answers

A **data domain** is a coherent governance grouping placed under accountable
ownership. Its partition may be useful for managing a programme's data estate.
That does not make it a superclass, identity criterion or universal partition of
the concepts used by every participant.

A **subject area** classifies intrinsic subject matter: what a concept is about,
regardless of the organisation managing it, the system storing it or the activity
using it. The test is “this concept is about this subject”. It is an intensional
classification, represented by a SKOS concept in a subject-area scheme and applied
through an annotation such as `opda:subjectArea`. It is not an upper-ontology type
and does not create a subclass relationship.

A **bounded context** is the boundary within which a team can maintain a coherent
ubiquitous language and own its definitions. Its namespace represents model
authority. A browsing concept may describe the context, but entities do not
become instances of an OWL class merely because their definitions belong to that
context. Contexts are not upper-ontology types.

The annotation names in this record express the intended contract. They are not
claims that corresponding terms have already been minted or emitted locally.

### R2 — Do not collapse the independent axes

Topic, model authority, use and accountability can vary independently. An address
is about location; an address description may be used in conveyancing and valuation;
each context may impose different meaning or evidence requirements. A responsible
steward can change without changing what an address is about.

Subject areas therefore cross-cut contexts. A single-owner governance partition
must not be applied as a mutually exclusive, collectively exhaustive partition
of concepts across those contexts. Equal labels do not establish equal identity.

### R3 — Reconcile an external domain map by decomposition

| Entry in a domain map | Treatment |
|---|---|
| Intrinsic topic, such as geography or finance | Consider a subject area after the aboutness test |
| Activity or capability, such as sales progression | Process/use metadata when relevant; not a subject area by default |
| Channel or system, such as a portal | Appropriate system/organisation information or exclusion; not intrinsic topic |
| Team owning a coherent definition | Candidate bounded context, subject to the boundary criteria |
| Accountable data owner or steward | Informational responsibility metadata |

One entry may need decomposition into several rows. Do not manufacture a one-to-one
mapping to make the source map appear adopted. Record uncertainty and unsupported
entries explicitly. Evidence for a governance partition is not evidence for an
ontological partition.

### R4 — Keep model authority separate from provenance

The namespace records the defining model context. Source-system annotations record
where evidence was discovered; they are neither an ownership facet nor permission
for the discovered system to redefine the term. Accountable owner metadata likewise
does not confer ontological authority. Topic and process must not be encoded in
the context namespace as additional hierarchy.

### R5 — Reject recurring anti-patterns

- Do not accept a data-domain label as a subject area without testing intrinsic aboutness.
- Do not use subject-area classification to express system ownership.
- Do not derive stable identifiers from a mutable organisation chart or process map.
- Do not require a concept's subject area to have the same name as its context.
- Do not use cross-context identity assertions to repair a governance-map mismatch.

## More Information

- [ODR-0036](/modelling/odr/odr-0036): faceted classification.
- [ODR-0038](/modelling/odr/odr-0038): bounded-context autonomy.
- [ODR-0045](/modelling/odr/odr-0045): context boundary criteria.
- [ODR-0059](/modelling/odr/odr-0059): cross-context identity protocol.
- [ODR-0062](/modelling/odr/odr-0062): concern organisation and the register.

## Amendments

### 2026-09-05 — Local method adoption

Adapted from source-method decision 0106 at pinned revision
`67174057e6384b79d0b28b7736fe70a66e112895`. The four-question decomposition and
anti-conflation rules are retained. Organisation-specific domain inventories,
private artefacts, source paths and donor implementation evidence are excluded.
Source historical citations are replaced by locally adopted decisions where relevant.
Acceptance applies to the method; implementation and population remain to be confirmed.
