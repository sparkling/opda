# Cagle: Position on Programme Scope-Check

## Framing

Two desks: I run SHACL/DASH in production, and I make RDF consumable by
language models — embeddings, context windows, RAG over shape graphs. The
lens is operational: I ask of each candidate ODR cut, **does this collapse
cleanly into one shape graph or stay cleanly in two**, and **does the cut
help or hurt an LLM consuming the ontology a fragment at a time**.

Two priors. First, I lost session-001's argument on inline `opda:aiHint` —
the panel exiled advisory AI annotations to a separate annotation graph
keyed to shape IRIs. Knublauch and Gandon were right operationally; a
strict processor carrying uninterpretable triples is a real defect. I
still think the third graph adds joins for LLM consumers, but I respect
what that loss taught me. I am a splitter where reuse demands it and a
collapser where two ODRs would produce shapes that should live in one
shape graph.

Second, the "single shape graph" question is not theological. SHACL
graphs compose at build time (ODR-0010 graph-union rule). What matters
is **whose Council session owns the constraint authorship** and
**whether two ODRs authoring constraints in different sessions can trip
over each other**. That is the test I apply below.

---

## Q1 — Is the 13-ODR cut right?

**Position.** Substantially yes, with one split (0008 → leaf + structured-
value sub-ODRs) and two additions (Address; Generator). Thirteen is *not*
too many for a programme that ratifies a TBox plus a shapes contract plus
an assurance graph plus a governance overlay plus an enumeration substrate
plus an overlay profile mechanism. DCAP single-record discipline is
operational — each ODR's `## Rules` must fit a Council session's
deliberative budget. ODR-0009 (Claims) and ODR-0013 (SHACL) push that
limit; 0009 may split further once SHACL-over-PROV is authored.

**Operational evidence.** 935 annotated leaves, 160 enums, three evidence
subtypes, five eIDAS residue items, seven descriptive families are *real*
surface area. A five- or eight-ODR programme means some single ODR carries
800-1500 lines of `## Rules` and reviewer cycles cannot track its
amendments. Thirteen is a reviewability win.

**Vote.** **Keep 13 as the unit-of-decision floor; expect +1 (0008 splits)
and +2 (Address, Generator) for a net 15. Keep 0010 and 0013 separate
(see Q6).**

---

## Q2 — Sub-module split inside 0008?

**Position.** Yes, but not into the seven sub-families. Split along the
**shape-authorship boundary**: descriptive *datatype properties* (one
ODR) versus the *structured value objects* the descriptive layer
attaches to (Survey, Search Report, EPC, Insurance, Guarantee, Local-
Land-Charge entry — another ODR).

**Operational evidence.** Shape graph for `opda:dateOfBuild` (a leaf):
one-liner. Shape graph for `opda:Survey` (structured value, author
Agent, `prov:wasDerivedFrom` to property at survey date, DPV co-
annotations on the surveyor): a node-shape with five-or-six property
shapes and three cross-graph joins. Authoring 1000 leaf shapes and 30
structure shapes in one Council session is unworkable; authoring them
in two sessions is normal.

Allemang's "declare-once-reconcile-overlays" rule survives the split —
the reconciliation question (spanning leaf in 18 overlays → one
property) is a *leaf* question. What *is* a Survey, what does it
carry, how does it relate to the Property over time — that wants
Guizzardi at the table.

**Vote.** **Split 0008 → 0008a (leaf datatype properties) + 0008b
(structured descriptive entities). The Survey-as-Kind question alone
justifies the split.**

---

## Q3 — 0008 vs 0011: combine?

**Position.** **No.** Different shape-graph layers, different reviewer
cohorts, different consumers.

**Operational evidence.** ODR-0011's SKOS schemes ship independently of
the descriptive shape graph — consumed by SHACL `sh:in`, by DASH
`dash:EnumSelectEditor`, by external register alignment via
`skos:exactMatch` (HMLR, ISO 3166, EPC register), and by LLM context-
window retrieval *as a vocabulary unit*. A combined ODR fuses two
artefacts that build, validate, and dereference separately:

| Concern | 0008 | 0011 |
|---|---|---|
| Shape graph | property shapes per leaf | `sh:in` shapes over scheme members |
| Artefact | `property-attributes.ttl` | `vocabularies.ttl` |
| External alignment | mostly internal | `skos:exactMatch` to external registers |
| Council expertise | Allemang's reconciliation | Isaac/Miles SKOS rigour |

The cross-reference (0008's `currentEnergyRating` consumes 0011's
`opda:EpcBandScheme`) is exactly the seam DCAP single-record discipline
handles: one ODR cites the other. LLM-consumer pragmatism reinforces
this: an LLM hits SKOS schemes as *taxonomies* and shapes as
*constraints*; mixing them teaches the LLM (and the reviewer) that the
two are coterminous, when they are not.

**Vote.** **Keep separate. 0008 consumes 0011; no merge.**

---

## Q4 — 0002 vs 0014: retire?

**Position.** **Retire 0014 after the catalogue stabilises (post-MVP),
not now.** The partial-supersession-amendment pattern 0014 carries is
the only honest record of *why* the catalogue moved between session-001
and now. Retiring 0014 today flattens that provenance.

**Operational evidence.** Catalogues *move* — OWL-Time gets adopted
because PROV-O instants need companion intervals; SSSOM reopens when
external mappings arrive; ODRL policy authoring activates when consent
instances land. Each movement needs an attributed Council moment. A
single living-catalogue ODR collapses that into a silently-edited table;
readers cannot tell why DCAT-AP is still Defer or why OWL-Time moved
Conditional → in-active-use.

Retire 0014 once the MVP round-trip lands and the catalogue is stable
enough that the next amendment will be a normal ODR rather than a
continuing thread of 0014-style amendments. At that point fold the
amended rows back into 0002 and mark 0014 superseded-by-0002.

**Vote.** **Retire eventually, not now. 0014 stays through the MVP.**

---

## Q5 — 0009 vs 0012: combine Claims + Governance?

**Position.** **No.** Different vocabularies, different shape graphs,
different ratification cadence. Merging means ratifying the PROV-O
backbone and the DPV co-annotation pattern in one Council session —
the trap session-001 escaped by routing Q2 and Q6 to two owners.

**Operational evidence.** Shape graphs are co-located but not co-
authored: ODR-0009 targets `opda:Claim`, `opda:Verification`, the three
evidence subclasses with `sh:xone` over `evidence.type`; ODR-0012
targets the *same nodes* with `dpv:hasPersonalDataCategory` presence
checks and the sensitivity gate. Collision is real — an evidence entity
that PROV says "was used to verify identity" also bears
`dpv-pd:OfficialID` data on the data subject and (for vouches) third-
party PII on the voucher. Two ODRs authoring shapes against the same
node in the same session is the cross-cutting-amendment-in-one-
transcript mess DCAP forbids.

The plan handles this correctly: 0009 lands first; 0012 follows with
**explicit right to amend 0009's DPV co-annotation** via
`## Supersession scope:`. That is the right mechanism. Merging loses
the explicit handoff and the forward-pointer audit trail.

**Vote.** **Keep separate. The supersession-scope mechanism is the
right collapse-substitute.**

---

## Q6 — 0010 vs 0013: combine Overlay Profiles + SHACL Severity?

This is my home turf. I have been splitting and combining SHACL graphs
for ten years.

**Position. Keep 0010 and 0013 separate at the ODR level, but recognise
they author into the same shape-graph topology and require the same
queen (Knublauch). The plan already does this — same queen for both
sessions, deliberately. That is the right collapse-without-merging move
and the programme should hold it.**

Merging into one ODR is wrong; pretending they do not share a shape
graph is also wrong. The discriminator is **what the constraints are
*for***.

**Operational evidence — what 0010 and 0013 actually produce.**

ODR-0010 produces a **profile-shape graph per overlay**:
`profiles/baspi5.ttl` — node shapes targeting `opda:PropertyPack` with
`sh:property [ sh:minCount 1 ; … ]` for every BASPI5-required leaf,
merged `sh:in` over enum unions, `sh:xone` for `sellersCapacity`, DASH
`dash:viewer`/`editor`, `sh:order`/`sh:group` for sectioning, `dct:source`
to `…/forms/baspi5#…`; reified `opda:ValidationContext`; composition
build-step rule (the merged-`sh:in` regression guard).

ODR-0013 produces a **base-shape graph plus the severity policy**:
`shapes/base.ttl` — node shapes targeting `opda:Property`,
`opda:RegisteredTitle`, `opda:Claim`, every Kind/Role from 0006-0009,
with `sh:datatype`/`sh:nodeKind`/`sh:pattern`/`sh:minInclusive` from the
data dictionary; severity tiering (`sh:Violation` for identity breach
and unprovenanced claim; `sh:Warning` for overlay-disclosure and
sensitivity-marker gaps; `sh:Info` for optional gaps); open-world/closed-
world drift check; annotation-graph definition (where `opda:aiHint`
lives — my session-001 loss).

**Why they should not be one ODR.** Three concerns:

1. **Different target sets.** 0010 targets *form-overlay* shapes
   (PropertyPack-as-presented-through-BASPI5); 0013 targets *Kind/Role*
   shapes (Property-as-modelled). Shapes compose at build time but
   are authored against different node types.
2. **Different authorship cadence.** 0010 is authored once per overlay
   (BASPI5, then TA6, NTS, CON29R, LPE1, LLC1, FME1 — seven minimum).
   0013 is authored once across the TBox and re-touched only when a
   new Kind/Role lands.
3. **Different reviewer cohorts.** 0010 needs form-domain expertise
   (does this BASPI5 question really require `sh:minCount 1` for a
   leasehold flat with no SoF?). 0013 needs SHACL-rigour expertise
   (is this `sh:Violation` really an identity breach?). Same queen,
   different reviewers.

**Why they share a graph topology.** Both author SHACL shapes consumed
by the same processor against the same instance data. The merged-`sh:in`
regression guard (0010 rule 2) and the severity-misclassification guard
(0013) are both *build-time linters* on the combined shape graph. The
annotation graph (0013) and the form-question dereferenceable IRIs
(0010) flow through the same `dct:source` plumbing.

**The collapse case I rejected.** A combined ODR — "the SHACL contract
programme" with severity in §A, profile mechanism in §B, base-shape
mapping in §C — would fit one DCAP `## Rules` if pruned aggressively.
But the prune destroys either the per-overlay deliberation 0010 owes
the WG (BASPI5 v5.1 changes fields — new `ValidationContext` or
amendment?), or the severity-assignment criteria 0013 owes the
regulators (the rarest-most-damaging-loudest principle). Both want a
full Council session. Compressing means skipping deliberation or
running a 12-question session that breaks ODR-0001.

**The seam, operationally.** Three rules must hold *across* both ODRs;
they are the test of whether the split is correctly cut:

| Cross-cut concern | 0010 says | 0013 says | Risk if separated wrong |
|---|---|---|---|
| `sh:in` semantics | merged at build time | applied to closed schemes | Two `sh:in`s stacked = intersection (silent bug) |
| `sh:Violation` floor | profile cannot add a Violation not already in base | identity-contract breaches only | Profile escalates Warning to Violation; severity policy silently violated |
| No-identity-override gate | profile cannot touch a Kind's key | `dash:uniqueValueForClass` on identity keys is base | Overlay redeclares a key; identity drift |

If the split is honest, those three rows are explicit in both ODRs'
`## References` cross-cite. If dishonest, one ODR carries the rule and
the other silently inherits — exactly the "silently incorrect with no
reasoner to catch it" failure 0010 § Consequences already names.

**Vote.** **Two separate ODRs, same queen (Knublauch) across two
sessions, explicit cross-cite of the three seam rules in both
`## References`. Plan already does this — hold it.**

If a future session shows the seam leaking (build-step composition
produces surprises neither ODR fully specifies), the right move is
**not** to merge 0010 and 0013 but to spawn ODR-0010b/0013b "SHACL
composition semantics" owning the build-step rules in one place.
That spawn is cheaper than a merge and preserves authorship trails.

---

## Q7 — Missing ODRs?

**Address & Geography — yes, add now.** ODR-0006 §Q5 names this as the
question to settle, and the plan's §4.1 punts it to session 006. But
Address is consumed by 0006 (participant), 0007 (completion address),
0008 (`marketingAddress`/`titleAddress`/`inspireAddress`), 0009 (evidence
addresses), and 0012 (DPV co-annotation on Person). Five consumers
deserves its own ODR. The hard question is not "what is an Address
class" — it is **Guarino's property-identity question one layer down**:
what is the IC for an Address (UPRN-anchored? UDPRN-anchored? mode of
presentation, with the property as bearer)? Guarino's transcript Q4
argument that address is a *mode of presentation* applies here. At
least a Reduced Council.

**Geometry / GeoSPARQL — defer.** Title plans, search polygons,
INSPIRE geometries are real but deferred per ODR-0002. The Address ODR
ratifies the *interface* (`opda:hasGeometry`) without the encoding.

**Generator ODR — yes, add now.** ODR-0004 carries the generator-first
policy in two lines; the actual generator — input format, run location,
version-control entry, regression tests — is a programme commitment
0004 cannot fully carry. Allemang's "mechanical leaf → datatype-property
generated" (Q1) is *the* throughput multiplier for 0008. If the
generator is wrong, 935 properties are wrong.

**W3C VC alignment — defer; already routed.** ODR-0009 §Q8 in the plan
owns this within 0009. Spawn 0009b only if it overruns (W3C VC Data
Model alignment, DID method commitment, signature-suite choice).

**Vote.** **Add Address (ODR-0015) and Generator (ODR-0016) now. Defer
GeoSPARQL and W3C VC.**

---

## Q8 — What signals the cut is right?

Five operational signals, in priority order:

1. **No ODR authors a constraint another ODR also authors.** If 0010
   and 0013 both author `sh:in` on `opda:EpcBand`, the cut is wrong.
   Verify by grepping produced TTL for duplicate property-shape
   targets per constraint type.

2. **Every ODR's deliverable shape graph builds standalone.** If
   `property-attributes.ttl` cannot load without `vocabularies.ttl`,
   that is fine (consumer); if it cannot load without
   `claims-provenance.ttl`, the cut is wrong (no genuine relationship).

3. **Each ODR's `## Rules` fits one Council session's deliberative
   budget** — empirically under ~700 lines, ~12 rules, ~8 questions.
   0009 and 0013 push this; watch them.

4. **An LLM ingesting one ODR at a time summarises its decision with
   ≤2 cross-references.** Tested informally on the 13 stubs: 0008
   needs 0005 + 0011 (two, passes). 0010 needs 0005, 0006, 0007, 0008,
   0009, 0011, 0013 — seven, fails. That is the strongest signal 0010
   is doing too much, but it is also the inevitable shape of overlay-
   profile work. Mitigation is explicit phasing (010 runs after the
   TBox lands), not a smaller ODR.

5. **The DA's withdrawal condition per ODR is statable in 1-2
   sentences.** Session-001 track record: Guarino withdrew on Q1
   (exemplars), Q5 (ValidationContext), Q6 (assurance layer) — each a
   single named rule. If a future session needs a paragraph to state
   the DA's withdrawal condition, the ODR is carrying too much.

**Vote.** **Adopt these five; review at mid-programme (post-MVP).**

---

## SHACL graph topology — how many shape graphs and who owns them

Everything above only makes sense if the underlying shape-graph topology
is explicit. The programme produces **four shape-graph layers** plus the
**annotation graph**:

**Layer 1 — base shapes (TBox-aligned, severity-tiered).** Owned by
**ODR-0013**. Targets `opda:Property`, `opda:RegisteredTitle`, every
Kind/Role from 0006, the Transaction relator from 0007, the descriptive
properties from 0008, the Claim/Verification entities from 0009, the
SKOS schemes from 0011, the DPV-co-annotated nodes from 0012. Carries
datatype, nodeKind, pattern, identity-key (`dash:uniqueValueForClass`),
severity tiering. Built into `shapes/base.ttl`.

**Layer 2 — profile shapes (overlay-specific).** Owned by **ODR-0010**,
one per overlay (`profiles/baspi5.ttl`, …). Targets the same TBox
classes as Layer 1 but adds presence (`sh:minCount`), enum membership
(merged `sh:in`), `sh:xone` for discriminated `oneOf`, DASH rendering,
`dct:source` to form-question IRIs. Composed with Layer 1 at build time.

**Layer 3 — provenance shapes (PROV-O over evidence).** Owned by
**ODR-0009**. Targets the PROV-O backbone — `opda:Claim`,
`opda:Verification`, three evidence subclasses. Carries `sh:xone` over
`evidence.type`, `sh:minCount 1` on `prov:wasDerivedFrom`
(unprovenanced-claim violation), SHACL-over-PROV conditionals
(`electronic_record` requires `record.source.name`). Could arguably live
inside Layer 1, but PROV-shape authorship is dense enough that 0009
ships `shapes/claims-provenance.ttl` separately. Consumed by Layer 1
for severity tiering.

**Layer 4 — governance shapes (DPV co-annotation).** Owned by
**ODR-0012**. Targets *the same nodes as Layers 1 and 3* with DPV PII
tags, sensitivity-marker gate, and (if the dissent carries) lawful-
basis/purpose class vocabulary. Built into `shapes/governance.ttl`.
Consumed by Layer 1 for severity.

**Annotation graph.** Owned by **ODR-0013** (substrate) and consumed by
**ODR-0010** (overlay-specific). `opda:aiHint`, UI rendering hints,
presentation-order advisory, LLM-consumer metadata. Keyed to shape IRIs.
**Built and dereferenced separately.** This is my session-001 loss made
operational — the third graph honours AI-consumer concerns without
polluting SHACL.

**Composition rule.** A consumer materialises Layers 1-4 plus selected
profile graphs from Layer 2 via documented graph-union (ODR-0010 rule 2).
The annotation graph composes via separate retrieval (LLM retrieves
it; SHACL processor does not). Layers 1, 3, 4 always loaded; Layer 2
profile-selected.

**Ownership matrix.**

| Graph | ODR | Artefact |
|---|---|---|
| Layer 1 — base shapes | 0013 | `shapes/base.ttl` |
| Layer 2 — profile shapes | 0010 | `profiles/<overlay>.ttl` (×7+) |
| Layer 3 — provenance shapes | 0009 | `shapes/claims-provenance.ttl` |
| Layer 4 — governance shapes | 0012 | `shapes/governance.ttl` |
| Annotation graph | 0013 (substrate), 0010 (overlay) | `annotations/ai-hints.ttl` |

**Consequence for Q6.** This vindicates the split: 0010 owns Layer 2;
0013 owns Layer 1 and the annotation graph. The Q6 cross-cut concerns
(merged `sh:in`, `sh:Violation` floor, no-identity-override gate) are
the **interface contract** between the two ODRs. Each `## References`
must explicitly cite the three interface rules. If interface drift
appears, harden the rules in *both* ODRs — do not merge.

**Consequence for Q5.** Layers 3 and 4 share targets (evidence
entities). The forward-supersession mechanism (0012 may supersede a
slice of 0009 via `## Supersession scope:`) is operationally correct
because the shape graphs are *additive on the same nodes*, not
contradictory. SHACL runs both against the same target; conflicts
surface as duplicate violation reports, not silent inconsistency.

**Consequence for Q3.** ODR-0011 does **not** own a shape-graph layer.
It owns a vocabulary graph that Layers 1 and 2 consume via `sh:in`.
Different artefact kinds, different build pipelines, different external
consumers. 0008 and 0011 stay separate for the same reason.

**Closing.** The 13-ODR cut is right because it tracks this layered
topology with appropriate granularity. The adjustments I press for
(split 0008; add Address + Generator) get Layer 1 right. The merge
case I rejected (0010+0013) would flatten Layers 1 and 2 into one
authorship cadence — the operational mistake the plan correctly avoids.

I lost on `aiHint` in session-001 and the loss made the annotation
graph explicit. That is what an operational ODR programme looks like:
every ODR earns its split by surviving an adversary who would collapse
it. Q6 should survive the same test, and it does.
