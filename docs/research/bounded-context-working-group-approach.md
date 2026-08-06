# Research: the case for domain-led bounded-context working groups

**Date:** 2026-07-19
**Purpose:** Evidence and practical rationale for ADR-0063 and ADR-0064.

## Executive finding

The schema-derived ontology was a useful experiment and diagnostic baseline. It should
not be refined into the future domain model by incremental central editing.

The stronger approach is to:

1. develop each bounded context with its own subject-matter experts, using the existing
   corpus as evidence without allowing its document structure to predetermine meaning;
2. produce a complete semantic package for that context;
3. connect contexts through a representative interoperability group;
4. use a non-technical review surface backed by formal machine-readable artefacts;
5. publish the new approach only after the modelling website has been redesigned as a
   coherent whole.

This is supported by established domain-driven design and ontology-engineering
practice. It also directly addresses the weaknesses observed in the current model.

## What the first phase established

The existing JSON Schema conversion demonstrated useful capabilities:

- traceability from fields and overlays into semantic artefacts;
- automated generation of ontology, mapping, glossary, dictionary and validation
  views;
- a website that can expose graphs and term-level detail;
- a concrete corpus against which better modelling choices can be compared.

It also revealed a source-model limitation. A JSON Schema describes the structure and
validation of documents. Its field names, nesting and overlays reflect implementation,
form and exchange needs. Those are important requirements, but they do not by
themselves establish:

- the stable domain things and their identity;
- the meaning and scope of relationships;
- which distinctions matter to practitioners;
- whether a form-specific field belongs in the shared domain model;
- whether missing areas are genuinely out of scope or simply underrepresented.

The lesson is not that the conversion failed or that OPDA is starting again. It worked
well enough to show why the next step needs a different source of authority for meaning.

## Evidence from domain-driven design

Eric Evans defines a bounded context as the boundary within which a particular model is
defined and applicable. His DDD reference makes three points that fit this programme:

- large projects inevitably contain multiple models because different user communities
  have different jobs and need different distinctions;
- domain modelling depends on creative collaboration between domain practitioners and
  software practitioners;
- points of contact between models should be described explicitly, including
  translation and sharing.

Implication for OPDA: one universal property model is not automatically more
interoperable. Interoperability improves when each model has a clear boundary and the
relationships between models are explicit.

Source: Eric Evans,
[Domain-Driven Design Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf),
especially "Bounded Context", "Ubiquitous Language" and "Context Map".

## Evidence from ontology engineering

Stanford's *Ontology Development 101* describes ontology development as necessarily
iterative. It recommends:

- define the domain and scope;
- identify the intended use;
- write competency questions the ontology must answer;
- enumerate important terms;
- define classes and properties;
- create instances and test the model;
- review and revise with domain experts.

It also states that there is no single correct model independent of its intended
application.

Implication for OPDA: the group should begin with scope, real scenarios and competency
questions—not with a pre-populated list of schema fields. The existing artefacts remain
active evidence for coverage, traceability, implementation and migration throughout,
without automatically settling the conceptual model.

Source: Natalya F. Noy and Deborah L. McGuinness,
[Ontology Development 101](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf).

## Why one working group per bounded context

| Observed problem | Working-group response | Expected benefit |
|---|---|---|
| Weak or inherited definitions | Domain experts agree terms through scenarios and examples | Definitions express practitioner meaning |
| Uneven historical engagement | Every context has a dedicated group, scope and backlog | More balanced coverage |
| Form-driven ontology content | Concepts must be justified against domain use cases | Cleaner scope and fewer implementation artefacts |
| One model too large to review | Each group owns a bounded model | Faster review and clearer accountability |
| Central team guesses cross-domain meaning | Delegates negotiate boundary agreements | Explicit, owned interoperability |
| Technical syntax excludes participants | Review uses diagrams and plain definitions | Wider and more effective participation |

The approach avoids the "cathedral" failure mode: attempting to design a comprehensive
central model before individual domains can validate it. It does not reject coherence.
It moves coherence to the right level: within a context first, then across agreed
boundaries.

## Why the six content outputs belong together

Each group should agree six related kinds of content because no single view answers
every stakeholder question.

| Output | Question it answers |
|---|---|
| Business glossary | What do practitioners mean by each term? |
| Data dictionary | What data is recorded, with what definition, provenance and value expectations? |
| Taxonomies | How are domain concepts organised into broader and narrower meanings? |
| Controlled vocabularies | Which governed terms, labels, codes and values may be used? |
| Resources | What identifiable things and concepts need stable meaning and provenance? |
| Relationships | How do those resources connect, participate and constrain one another? |

These outputs must be governed as one semantic package. OPDA publishes that agreement
as an RDF ontology, generated JSON Schemas, website/PDF/Markdown documentation and,
where useful, an optional ontology-to-schema mapping runtime. Validation constraints
remain part of the model's correctness concerns and can be encoded as SHACL shapes.

## Prior art: the fourteen ontology dimensions

The sibling `semantic-modelling` project has an accepted category framework at:

`~/source/hm/semantic-modelling/docs/ontology/odr/ODR-0071-ontology-modelling-category-framework.md`

That ODR is the authoritative source. The directory-level
`src/ontology/README.md` still describes an earlier 12/13-category state, but ODR-0071
was subsequently amended: Category 13 is now Source Mapping and Category 14 is Data
Product. The fourteen numbered `src/ontology/NN-*` directories corroborate the live
framework.

The framework uses five tests for admitting a category: a distinct domain of
discourse, independent lifecycle, separable query surface, identifiable external
authority and distinct ontological level. It treats the categories as modelling
dimensions, not necessarily as one file each.

### OPDA relevance assessment

Eight of the source framework's fourteen categories are relevant to the OPDA ontology
programme. Their depth varies by working group, so the correct adoption is a required
coverage assessment rather than mandatory local content in every cell.

| Area | Lens | OPDA relevance | Standards profile |
|---|---|---|---|
| Meaning | Domain structure | **Core.** Identify domain things, identity, relationships and rules. | [RDF](https://www.w3.org/TR/rdf12-concepts/), [RDFS](https://www.w3.org/TR/rdf-schema/), [OWL 2](https://www.w3.org/TR/owl2-overview/) |
| Meaning | Vocabulary and taxonomy | **Core.** Govern values, preferred terms, alternative labels, codes and broader/narrower concept hierarchies. | [SKOS](https://www.w3.org/TR/skos-reference/) |
| Meaning | Classification metadata | **Core.** Record subject, status, lifecycle and regulatory relevance. | [Dublin Core Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/), DCAT 3, SKOS |
| Trust | Provenance and quality | **Core.** Preserve source, attribution, derivation, confidence, currency, lineage and quality evidence. | PROV-O, DQV |
| Trust | Access control and data sensitivity | **Core.** Represent personal data, purpose, consent, access roles and authorisation semantics. | [DPV](https://w3id.org/dpv), DPV-PD, DPV-LEGAL, [ODRL](https://www.w3.org/TR/odrl-model/) where justified |
| Correctness | Validation constraints | **Core.** Turn agreed business rules into testable shapes and checks. | [SHACL](https://www.w3.org/TR/shacl/), [SHACL-AF](https://www.w3.org/TR/shacl-af/), DASH where justified |
| Correctness | Time and history | **Core.** Distinguish valid time, recording time, state change and version history. | [OWL-Time](https://www.w3.org/TR/owl-time/), PROV-O |
| Exchange | Cross-domain mappings | **Core, interoperability-led.** Identify and govern meaning-preserving boundary mappings. | SKOS Mapping, [SSSOM](https://mapping-commons.github.io/sssom/) |

The remaining six source categories were reviewed and excluded from OPDA's required
ontology dimensions:

| # | Source-framework category | Reason for exclusion from OPDA ontology coverage |
|---|---|---|
| 3 | Process modelling | Business-process documentation is adjacent operational work, not a dimension every OPDA ontology must capture. |
| 4 | Service architecture | Application and service architecture belongs to implementation and enterprise architecture, outside the domain ontology. |
| 6 | Governance and compliance | Standards governance belongs in ADRs, operating procedures and decision records rather than the property ontology. |
| 12 | Capability and intent | Goals, capabilities, KPIs and programme intent belong to strategy and programme management rather than domain semantics. |
| 13 | Source mapping | Mappings from current schemas, forms and systems are migration or implementation artefacts, not a required dimension of the domain ontologies. Existing mappings remain useful evidence. |
| 14 | Data product | Packaging and delivery of governed data products is an operational design concern, not a required domain-ontology dimension. |

The six content outputs, publication artefacts and eight modelling categories are
orthogonal:

- the **content outputs** say what the group agrees;
- the **publication artefacts** say how different audiences consume it; and
- the **lenses** say what kinds of meaning and control the model must consider.

Each group should classify every category as `model here`, `reuse shared`, `boundary
contribution` or `not applicable with rationale`. This makes omissions visible while
avoiding eight parallel mini-ontologies.

## Working-group structure

The proposed programme has six bounded-context working groups:

1. Finance and Banking;
2. Conveyancing;
3. Estate Agency;
4. Surveying and Valuation;
5. Property Data Services;
6. Property Technology.

The seventh modelling group is a **DBT Smart Data scheme working group**. It is not
asserted to be another property bounded context. It warrants its own group because its
source authority, terminology and change lifecycle are cross-sector and policy-led.
Its initial scope is scheme participants and roles, trust and accreditation, consent
and authorisation, liability, data-sharing obligations, exchange expectations and the semantic
implications of the DBT Smart Data Guidebook. It supplies property-specific
requirements to the other groups but does not own their internal domain meanings.

An eighth, cross-cutting **Interoperability Working Group** contains representatives
from all seven. It owns boundary agreements, the common ontology, cross-context
mappings, the shared standards profile and the consolidated eight-category coverage
matrix.

## The limited role of SKOS

The W3C SKOS model is suitable for publishing and connecting knowledge-organisation
systems such as controlled vocabularies, thesauri, classifications and taxonomies. It
also provides mapping relationships for concepts in different schemes.

For OPDA, SKOS has two practical jobs:

1. represent the controlled vocabularies and taxonomies produced by each domain group;
2. express mappings between concept schemes when bounded contexts use overlapping but
   non-identical concepts.

SKOS complements the ontology. It is not a substitute for modelling domain entities,
relationships or validation rules.

Source: W3C,
[SKOS Simple Knowledge Organization System Primer](https://www.w3.org/TR/skos-primer/).

## The role of SHACL

SHACL is the W3C language for validating RDF graphs against conditions expressed as
shapes. A shapes graph can also describe the data that satisfies those conditions.

For OPDA, SHACL translates agreed business rules into testable data conditions. Domain
experts need to agree the rule and understand the validation outcome; they do not need
to author SHACL syntax.

Source: W3C,
[Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/).

## Why the interoperability group is separate

A domain group should not be forced to generalise every term for every possible user.
That tends to erase distinctions that matter locally. Conversely, independent groups
without a boundary process will drift and duplicate.

The interoperability group resolves this tension by owning only:

- the context map;
- the minimum common boundary ontology;
- cross-context vocabulary and taxonomy mappings;
- common identifier, provenance, versioning and change conventions where required.

Representation from every domain group is essential. A central modelling team cannot
reliably decide that two terms are equivalent without the domains that own those
meanings.

## A non-technical review surface

The website should let participants review:

- diagrams showing concepts and relationships;
- a semantic description and examples for each term;
- glossary and dictionary views;
- controlled vocabularies and taxonomies;
- representative data and validation results in business language;
- provenance, status, owner and change history;
- feedback and unresolved questions.

The formal RDF/OWL/SKOS/SHACL remains available underneath. The user experience should
ask, "Is this true in your domain?" rather than, "Can you read this syntax?"

This aligns with W3C Data on the Web Best Practices, which recommends reusable
vocabularies, an appropriate formalisation level, complementary presentations and a
discoverable feedback mechanism. Those practices associate feedback and complementary
presentations with comprehension, reuse and trust.

Source: W3C,
[Data on the Web Best Practices](https://www.w3.org/TR/dwbp/).

## Finance and Banking pilot

Finance and Banking is a good first pilot because it is a bounded domain with
recognisable practitioners, decisions and data exchanges.

FIBO—the Financial Industry Business Ontology—is a global standardised ontology for
financial concepts, terms and relationships. It is maintained with financial-sector
subject-matter experts and can be explored graphically.

That is the level of FIBO knowledge needed for the kick-off. It establishes that a
reusable finance-domain ontology exists. The group should first agree its property
finance scope and competency questions, then assess which FIBO concepts are relevant.

Source: EDM Association,
[Financial Industry Business Ontology overview](https://edmcouncil.org/frameworks/industry-models/fibo/).

## The case to make to stakeholders

### 1. The first phase was useful because it exposed the problem

The generated model is not wasted work. It is an x-ray of the current standard:
valuable for traceability, migration and showing where meaning is weak, uneven or
form-driven.

### 2. Domain meaning cannot be recovered from document structure alone

Forms and schemas tell us what has been exchanged. Practitioners tell us what the
things mean, which distinctions matter and what rules govern them.

### 3. Bounded groups make participation and accountability practical

People can review a model of their own work. Each group has a scope, an owner and a
complete set of outputs.

### 4. Federation is not fragmentation

The interoperability group makes boundaries and translations explicit. This is more
honest and maintainable than assuming one term has exactly the same meaning everywhere.

### 5. Formal outputs turn agreement into an implementable standard

The ontology records meaning, SKOS records classifications and cross-scheme mappings,
and SHACL makes agreed data rules testable. The glossary and dictionary keep the same
agreement accessible to people and implementers.

### 6. The website broadens the modelling community

Participants can challenge diagrams, definitions and examples without learning
ontology languages. Technical artefacts remain generated and inspectable underneath.

## Revised Finance and Banking kick-off sequence

1. **Reassurance and the practical problem** — members bring finance and banking
   knowledge; they do not need ontology or AI expertise.
2. **Data-model basics** — show one familiar mortgage example as a form/JSON tree and
   then as a connected ontology graph; treat them as complementary views.
3. **Continuity and method change** — keep the current corpus as evidence and move from
   schema-led derivation to domain-led, evidence-up modelling.
4. **Bounded contexts and interoperability** — show legitimate contextual meanings of
   “property”, the full working-group family and the limited boundary remit of the
   Interoperability Working Group.
5. **What the group agrees and OPDA publishes** — separate the six content outputs
   from the RDF, JSON Schema, documentation and optional-runtime artefacts.
6. **Coverage without overload** — present the eight categories as plain business
   questions, not standards acronyms or eight separate models.
7. **Resource-first participation** — collect broad evidence through a governed intake
   with provenance, permission and sensitivity checks.
8. **Ways of working** — Teams threads are the discussion hub; the forthcoming email
   is an intake route, not a mailing list; planned page-level discussions feed the same
   tracked issue and disposition record.
9. **Candidate cycle and next step** — Henrik uses AI assistance to build and publish
   successive candidates for human review. Consensus and resolution rules remain to be
   defined before normative approval.

The operational design and controls for this cycle are set out in
[AI-assisted working-group method](./ai-assisted-working-group-method.md).

## Publication implication

The current website is an integrated account of today's schema-derived model. Changing
individual pages to describe the new strategy would mix current and future states.

Research and decisions should therefore remain in `docs/research` and `docs/adr` until
the project approves:

- a new information architecture;
- an explicit status and provenance model;
- treatment of the current corpus as baseline, archive or parallel version;
- a complete page inventory and migration plan;
- a coordinated release gate.

This is the basis for ADR-0064.
