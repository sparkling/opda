---
status: accepted
date: 2026-09-05
tags: [modelling-method, privacy, policy]
supersedes: []
amends: []
depends-on: [ODR-0054]
implements: []
---

# Conditional ODRL policy use through the DPV profile

## Context and Problem Statement

Classifying data, its purpose and legal basis does not itself express a permission,
prohibition or duty. Some reviewed use cases need policies about retention, changing
conditions or cross-border transfer. A policy language can express those rules, but
must not replace privacy classification or imply that a website enforces them.

## Considered Options

- Conditionally use ODRL through the DPV Profile of ODRL.
- Adopt standalone ODRL with no DPV target or classification boundary.
- Invent permission and duty primitives within the classification vocabulary.
- Defer every policy representation.

## Decision Outcome

Select the first option, limited to the three cases in R5. DPV remains the
classification authority established by
[ODR-0054](ODR-0054-cat11-access-control-data-sensitivity-adoption.md).
Policy expression is neither a legal determination nor operational enforcement.

### Consequences

- Good, because classification and policy expression retain distinct responsibilities.
- Good, because a bounded common vocabulary avoids incompatible policy dialects.
- Bad, because qualified humans must author and review each policy.
- Neutral, because deploying an enforcement engine is a separate implementation decision.

### Confirmation

Accepted conditionally as method. OPDA must demonstrate the target/classification
boundary, permitted profile and scope, negative validation cases and human approval
before claiming implementation. No source-system shape or council vote proves those
checks here. Neither policy coverage nor regulatory compliance is claimed.

## Rules

### R1: DPV profile required

Use ODRL only through the [DPV Profile of ODRL](https://w3id.org/dpv/dpv-odrl).
A bare policy without a DPV-typed target fails this selected profile. DPV describes
the data and its privacy context; ODRL expresses policy over that data.

### R2: Common Vocabulary only

Use ODRL 2.2 Common Vocabulary. Other profiles, including information-content
management and media-rights profiles, are not implicitly adopted. Extending the
profile requires a separately reviewed amendment.

### R3: Separate vocabulary responsibilities

| Responsibility | Selected vocabulary |
| --- | --- |
| Data classification | DPV |
| Legal basis, purpose, actors and rights context | DPV |
| Policies, permissions, prohibitions, duties and constraints | ODRL |
| Privacy concepts used as policy operand values | DPV terms within the ODRL rule |

Do not use ODRL as a replacement classifier or DPV predicates as policy operators.
The selected composition allows DPV terms as right-operand values; it does not turn
DPV data classes into ODRL left-operand operators. A policy's type alone says nothing
about the nature of its target.

### R4: Validate the boundary

Local SHACL MUST require each policy to have a target resolving to an appropriately
DPV-typed resource and reject the prohibited classification/operator combinations.
Both are violation-level requirements. Checking merely that `odrl:target` exists
does not establish the target's type: the implementation must test that additional
condition explicitly. Validate actual rule paths, not only a convenient illustrative
policy skeleton. Failure blocks a package's conformance claim.

### R5: Exactly three conditional uses

1. Retention policies expressing deadlines or elapsed-time conditions over classified
   storage-duration requirements.
2. Permissions conditioned on dynamic state, such as consent status, an open retention
   window and applicable geography.
3. Cross-border transfer policies composing the applicable reviewed transfer conditions.

Other policy cases require an amendment. The chosen duration or legal basis must come
from qualified review; an example cannot establish either for a real property record.

### R6: Composition, not automatic effect

Describe a target's privacy context first. A human-curated policy then identifies
that target, action and constraints using the selected profile. For example, a
reviewed inspection-contact retention policy may express when further use is
prohibited. Merely publishing that graph does not delete data, revoke access or
execute a deadline. An implementation must separately connect a validated policy to
an enforcement mechanism before claiming those effects.

### R7: Human-curated policy only

Automated extraction and enrichment MUST NOT generate `odrl:Policy`,
`odrl:Permission`, `odrl:Prohibition` or `odrl:Duty` instances. Fields, code and
extraction confidence cannot establish regulatory intent. Policies must be manually
authored for a specific permitted use case by a person with relevant regulatory
context. Document this limit prominently with the implementation. Do not promise
that all data classes have policies or substitute a coverage percentage for evidence.

### R8: No governance-ontology expansion

This decision concerns Category 11 only. Category 6 governance-ontology modelling is
outside the selected OPDA concern set. This record does not authorise ODRL there or
reopen that excluded category through policy examples.

### R9: Reference without imports

Use canonical `http://www.w3.org/ns/odrl/2/` vocabulary IRIs and the canonical DPV
IRIs selected by the adopted profile. Do not import either entire ontology with
`owl:imports`. Local shapes establish the delivery contract; canonical references
do not demonstrate implementation or enforcement.

## More Information

- [ODRL vocabulary](https://www.w3.org/TR/odrl-vocab/)
- Source-method record: ODR-0089, revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Preserves conditional adoption, profile limits,
  the three uses and binding human-curation restriction. Replaces source pipeline,
  council and execution claims with OPDA implementation obligations. Makes explicit
  the gap between a target-presence check and the required target-type validation.
