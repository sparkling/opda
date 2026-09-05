---
status: accepted
date: 2026-09-05
tags: [modelling-method, identity, harmonisation, mappings]
supersedes: []
amends: []
depends-on: [ODR-0041, ODR-0045, ODR-0051, ODR-0056, ODR-0058, ODR-0061]
implements: []
---

# Criterion-based identity across contexts: map before merging

## Context and Problem Statement

Two teams may use similar labels, share identifiers or describe overlapping
populations without identifying the same kind of thing. Treating a score or key as
identity collapses distinctions. Conversely, treating every uncertainty as permanent
separation leaves avoidable silos. The method must govern both errors and make
decisions retractable as evidence changes.

## Decision Drivers

- Similarity nominates a candidate; a warranted identity criterion licenses a relation.
- Preserve autonomous meaning through mappings rather than automatic merging.
- Make both false-positive equivalence and false-negative separation visible.
- Require evidence that can be challenged, versioned and revisited.

## Considered Options

- Accept any of shared keys, similarity thresholds or foundational labels as identity.
- Use `owl:sameAs` whenever a match appears sufficiently confident.
- Apply ordered, falsifiable criterion gates and publish qualified mapping verdicts.

## Decision Outcome

Select the ordered protocol. A validated admissible link key with criterion-sameness
is the only positive equivalence warrant. Rigidity, unity, boundary and coherence
checks can veto or weaken that warrant; passing them cannot manufacture it. Be
conservative at the equivalence tier, while permitting justified weaker mappings
to be asserted, monitored and repaired.

### Consequences

- Good, because identity claims become explicit, falsifiable and auditable.
- Good, because weaker mappings can provide useful integration without collapse.
- Bad, because criterion review costs more than applying a similarity threshold.
- Neutral, because a business key remains useful join evidence without becoming
  an automatic claim of conceptual identity.

### Confirmation

Accepted as method, not an implemented harmonisation service. OPDA delivery must
demonstrate ordered gates, adverse examples, all verdict forms, populated mapping
evidence, retraction and reopening, and pairwise coherence checks. Governance must
name the responsible reviewers and promotion authority before operational use.

## Rules

### R0: Distinguish classes from classification concepts first

Route controlled reference concepts, such as status choices or country schemes,
to SKOS scheme alignment. Do not send them through rigid-sortal merging or promote
them as kinds merely because they appear in structured data.

### R1: A criterion, not a key or score

Conceptual sameness concerns co-typed sortals sharing an identity criterion from a
common kind across possible and temporal instances. Current co-extension is not
enough. A business key raises a candidate and supports the decision only when its
paired properties track that criterion; otherwise it is a population discriminator.

### R2: Ordered gates

1. Check rigidity and category compatibility. The positive merge route requires
   rigid kinds at both ends. Role, phase or mixin merge endpoints invalidate that
   route and require escalation. An asymmetric kind/role case may warrant a
   directionally appropriate broad/narrow correspondence, never exact equivalence.
2. Establish a shared criterion through an admissible validated link key over
   identity-supplying properties, with measured coverage and discriminability,
   satisfying R9. Without it, use a justified taxonomic mapping rather than merge.
3. Check shared unity and boundary. Differences weaken the verdict to close
   correspondence or separation. A supported equivalence needed in at least two
   contexts can become a shared-kind promotion candidate, subject to R7.

Gate 2 supplies the positive warrant; the other gates and R10 only constrain it.
This is an ordered composition, not an additive score or a flat checklist whose
independent passes can substitute for identity evidence.

### R3: Read the predicate from the warrant

| Supported relation | Mapping result |
| --- | --- |
| Universal, bidirectional link with the full criterion contract | Falsifiable `skos:exactMatch` candidate |
| One-directional total relation | Directionally correct `skos:broadMatch` or `skos:narrowMatch` |
| Partial correspondence | `skos:closeMatch` |
| Association without interchangeability | `skos:relatedMatch` |
| No justified correspondence | Recorded separation verdict |

Broad/narrow mappings are SKOS hierarchical relations, not `rdfs:subClassOf`, and
are not themselves transitive properties. Exact match is transitive and means
interchangeability across applications, but remains weaker than `owl:sameAs`.
Close match supports some applications and is non-transitive. Confidence records
evidence quality; it never selects the predicate by threshold.

### R4: No unwarranted `owl:sameAs`

Do not use `owl:sameAs` to harmonise class meanings across contexts or assert
unwarranted TBox identity. Its full property-identity consequences are stronger
than correspondence. The narrow permitted case is ABox co-reference supported by
a validated link key and a single agreed identity criterion. Co-extension alone
does not satisfy that exception. Enforce the scoped prohibition in mapping validation.

### R5: Inspect exact-match chains

Flag every `skos:exactMatch` chain of length two or more for mandatory human
reinspection. Inspect the predicate, not its confidence value. Never encode
uncertainty by lowering confidence on an otherwise unwarranted exact match; select
a justified weaker predicate instead. Local runtime choices do not change SKOS semantics.

### R6: Explicit, distinct verdicts

Conservative separation applies at the equivalence tier, not as a ban on useful
close matches. Preserve three distinct outcomes: a positive associative
`relatedMatch`; a negated named predicate using SSSOM `predicate_modifier: Not`;
and a negative/unrelated decision. Association is not a negative verdict. An absent
triple is not a decision record. Record denied candidates, not all possible pairs.

### R7: Governed promotion

Promotion to shared meaning requires a universal link key, R9 criterion-sameness,
need in at least two contexts, and a promoted endpoint that is itself a kind—not a
role or phase. A named shared-model stewardship authority admits and versions the
change. Review promotion frequency and calibrate the operating point: a bar that
never permits justified promotion produces an empty shared model, not safety.

### R8: Retraction and symmetric reopening

Retract equivalence when new evidence falsifies its link key. Treat retraction as
an explicit governed change, not a silent graph mutation. Denied candidates need
mechanical, queryable reopening triggers: a new context, source-version change,
newly satisfiable link key, rigidity retyping or coherence regression. Report
reopened separations later accepted alongside precision/error evidence so missed
integration is visible too.

### R9: Same criterion, not merely two identity flags

Two endpoints both marked as carrying identity do not establish the same criterion.
Require an admissible validated key over identity-supplying properties for a common
rigid kind, with module coherence. The accepted source rule presumes criterion-
sameness on that validated key, rebuttable by an exhibited possible or temporal
instance individuating differently under the two criteria. Preserve that discharge
rule; the proposed stronger procedure below is not accepted by implication.

### R10: Pairwise repair or reject

Diagnose incoherence and repair or reject the candidate under a pinned profile,
scoped to the two-context module rather than a global graph. Re-run the check at
shared-model admission and on coherence-regression reopening. Promotion itself can
introduce new incoherence.

### R11: Qualified and versioned evidence

Every verdict requires the applicable named SSSOM-profile record, controlled SEMAPV
justification and pinned source/mapping-set versions. Confidence cannot replace
justification. Preserve superseded decisions rather than deleting their history.
Provide queryable staleness signals, a four-stage curation lifecycle with owners
and exit gates, blocking/advisory validation and predicate/justification coherence
checks that detect skipped gates. The local workflow must name these stages and
signals before claiming operational conformance; this record does not invent a
source workflow implementation. Use
[ODR-0056](ODR-0056-sssom-cat8-mapping-provenance.md) for the active field profile.

## More Information

- Source-method record: ODR-0098, revision `67174057e6384b79d0b28b7736fe70a66e112895`.
- [Mapping carrier](ODR-0058-cat8-reification-rdf12-triple-terms.md)

## Amendments

- **2026-09-05 — OPDA adaptation.** Carries accepted R0–R11 and the distinction
  between false-positive and false-negative costs. Removes source council/runtime
  assertions and unrelated execution dependencies. No source ownership decision is
  transferred as an OPDA appointment.

### Proposed refinement retained as non-normative

The source's 11 June round-two proposal would make an active modal-divergence probe
mandatory before discharging Gate 2, rather than leave rebuttal to a later critic.
It addresses the asymmetry between cheap key validation and expensive identity
challenge. It is explicitly **proposed, not adopted**. This rewrite neither makes
that probe a binding requirement nor adopts the excluded source-mapping category
as its implementation. Any future adoption needs a separately authorised amendment
and evidence about the probe's coverage; an empty query cannot casually be treated
as proof that no possible divergence exists.
