---
status: accepted
date: 2026-09-05
updated: 2026-09-05
kind: methodology
tags: [ontoclean, shacl, validation, identity, rigidity, unity, dependence]
supersedes: []
amends: []
depends-on: [ODR-0041, ODR-0042, ODR-0044, ODR-0059]
implements: []
---

# Check identity, rigidity, dependence and unity with explicit OntoClean constraints

## Context and Problem Statement

A hierarchy can look plausible while placing a permanent kind beneath a temporary
role, mixing incompatible identity criteria, or declaring a dependent entity with
no bearer. Checking only the rigid/anti-rigid relationship covers one rule on one
axis. It does not establish that the remaining modelling commitments are coherent.

OPDA adopts four axes of OntoClean checking: identity, rigidity, existential
dependence and unity. The method uses explicit classifications and asserted model
relationships. It must remain distinguishable from automated ontological discovery,
complete philosophical conformance or an OWL reasoner inferring missing assertions.

The source decision described an implementation elsewhere. Those results are not
evidence of OPDA implementation. This local record states the required checks,
activation conditions and confirmation obligations.

## Decision Drivers

- Derive checks from justified modelling facets rather than duplicate manual tags.
- Connect identity checks to the cross-context identity protocol.
- Use deterministic SHACL/SPARQL over the asserted schema graph.
- Make inactive targets and missing population visible in coverage reporting.
- Keep material domain relators distinct from mappings between descriptions.
- Separate human judgement about tags from automated checking of declared tags.

## Considered Options

- Adopt all four axes, with typed targets and explicit positive and negative examples.
- Check rigidity alone and leave identity, dependence and unity unchecked.
- Ask a language model to infer metaproperties and treat its resulting classification as validation.

## Decision Outcome

Adopt all four axes as constraints over the schema graph. Modellers supply or
justify the relevant classification; deterministic constraints check consistency.
Automated suggestions do not establish an identity criterion, rigidity or unity.

Checks target only relevant typed classes. A check with no applicable targets can
be installed and syntactically valid while exercising no production data. Such a
result must be reported as awaiting applicable data, never as comprehensive coverage.

### Consequences

- Good, because the validation contract covers more than the familiar anti-rigid subsumption rule.
- Good, because asserted facets make a failed check explainable to its modeller.
- Good, because the constraints do not require live description-logic entailment.
- Bad, because dependable tagging and emitted bearer relationships remain prerequisites for meaningful coverage.
- Bad, because unity requires a declared vocabulary and justified classification before its gate can act.
- Neutral, because four-axis checking is a selected operationalisation; it is not a claim that every possible OntoClean rule has been implemented.

### Confirmation

Implementation is pending. For every constraint, provide a violating example and a
conforming example, plus a non-target example that remains outside its scope.
Inspect emitted model data for the relevant classifications and bearer predicates.
Report the number of eligible targets and evaluated cases separately from fixture
results. Validate asserted hierarchy traversal under ODR-0044's reasoner-free
discipline. No donor test count, framework or build success is a local result.

## Rules

### R1 — Declare the relationships used by the checks

| Intended predicate | Role |
|---|---|
| `opda:mediates` | A material relator connects its bearer classes |
| `opda:inheresIn` | A mode or quality identifies a bearer on which it depends |
| `opda:unity` | A class states its unity criterion through a controlled vocabulary |

These names specify the intended local contract, not an assertion of current
emission. They are object properties in the adopted design. A unity scheme is a
closed SKOS concept scheme with four choices: functional complex, collective,
amount of matter and no unity. Functional complexes and collectives carry positive
unity; amounts of matter carry anti-unity. No unity must not silently be treated
as positive unity or as an unknown value that the validator invents.

### R2 — Check rigidity across the asserted hierarchy

An anti-rigid type must not subsume a rigid type. Traverse the asserted
`rdfs:subClassOf+` hierarchy so that the check covers indirect inheritance.
Use the declared, justified ontological classification to determine the applicable
rigidity. Role and phase classifications must not shelter an identity-bearing
rigid subtype simply because its nearest parent uses a different label.

The source implementation used a particular target set including relator-labelled
classes. This local contract does not infer anti-rigidity merely from the English
word “relator”: activation must follow the adopted stereotype and explicit facet
contract. A property relation and a material relator are not interchangeable targets.

### R3 — Check identity-supplying kinds

A kind supplies its own identity criterion. A kind must not be placed beneath
two distinct identity-supplying kinds in the asserted hierarchy. The constraint
must detect the distinct ancestors, explain the conflicting identity commitments
and refer the modeller to the classification and identity decisions.

An identity conflict is not repaired by merging contexts or asserting
`owl:sameAs`. Cross-context reconciliation remains governed by ODR-0059. The
check consumes explicit kind/identity classification rather than guessing identity
from equal names, overlapping attributes or a shared source identifier.

### R4 — Check relational dependence

A material relator must have at least one own attribute and mediate at least two
bearers. Both requirements matter: a bare association label does not demonstrate
a relator with its own dependent characteristics, and an attributed class without
the required bearers does not demonstrate the relational dependence.

Recognise candidate relators from evidenced material relations in the domain.
An agreement between parties may be a candidate; the evidence must justify the
relator interpretation. Do not transform a cross-context mapping, SKOS match or
founded relation between descriptions into a material relator to satisfy this rule.

### R5 — Check inherence dependence

A mode or quality must identify at least one bearer through the inherence
relationship. The constraint checks the explicit modelling commitment; it does
not infer a bearer from an adjacent class or a suggestive property name.
Report absent bearer assertions as failures on eligible targets.

### R6 — Check unity across subsumption

An anti-unity class must not subsume a class with positive unity. Traverse the
asserted hierarchy and interpret the closed unity vocabulary consistently.
Aggregate-root information and existing part/whole relationships may support
the modeller's classification, but a software aggregate is not automatic proof
of a philosophical unity criterion. Record the justification for the chosen value.

### R7 — Constrain activation and claims of coverage

All checks operate on schema-level declarations and asserted relationships.
They do not introduce reasoning rules or silently repair the model. Missing
classification must be distinguishable from a conforming classified target.

The implementation must expose, for each gate, whether it is installed, whether
its fixtures pass, whether eligible data exists and whether that data was actually
checked. Builder emission of mediation, inherence, unity and applicable types is
a separate obligation. A successful empty-target run does not discharge it.

## More Information

- [ODR-0041](/modelling/odr/odr-0041) and [ODR-0042](/modelling/odr/odr-0042): class, role, phase and property-placement discipline.
- [ODR-0044](/modelling/odr/odr-0044): SHACL and inference boundary.
- [ODR-0059](/modelling/odr/odr-0059): cross-context identity criteria.
- [ODR-0062](/modelling/odr/odr-0062): foundational discipline in the organising method.
- [ODR-0063](/modelling/odr/odr-0063): limits on foundational grounding.

## Amendments

### 2026-09-05 — Local method adoption

Adapted from source-method decision 0112 at pinned revision
`67174057e6384b79d0b28b7736fe70a66e112895`. The four axes, predicate contracts,
material-relator distinction and typed-target activation boundary are retained.
Donor runtime names, source paths, historical test counts and emission claims
are excluded. The source's later implementation-ownership warning is preserved
as the requirement for separately verified local emission and real target coverage.
