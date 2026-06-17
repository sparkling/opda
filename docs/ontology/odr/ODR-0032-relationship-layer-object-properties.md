---
status: proposed
date: 2026-06-17
kind: pattern
tags: [agents, relationships, object-properties, relator, completeness]
scope:
  - pdtf-v3:participants
  - pdtf-v3:propertyPack.ownership
  - pdtf-v3:propertyPack.titlesToBeSold
  - pdtf-v3:chain
supersedes: []
depends-on: [ODR-0005, ODR-0013, ODR-0022]
implements: [ODR-0006, ODR-0007]
council: session-047
---

# Relationship layer — reify inter-entity associations as OWL object properties

## Context and Problem Statement

The OPDA ontology was given a *completeness discipline* for only one of its two layers. The **descriptive datatype-leaf layer** (the `propertyPack` value tree) got a systematic curated walk ([ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md)) and a CI gate (`ci-category-g-coverage`) that proves every in-scope leaf is emitted-or-collapsed (239/239). The **relationship layer** — the inter-entity OWL *object* properties that connect the model's classes — never got an equivalent walk or gate, even though it was explicitly designed.

[ODR-0006](./ODR-0006-agents-and-roles.md) (council session-006) ratified the agent-module relationship layer in its own diagrams and Turtle/SHACL stubs: `opda:plays`/`opda:playedBy` (a Person/Organisation bearer plays a Seller/Buyer/Proprietor role) with an `opda:SellerShape` role-play SHACL shape (§"SHACL constraints"); `founds`/`foundedBy` (a Transaction/Proprietorship relator founds its roles, §"Role-founding relator pattern"); a structured `opda:Name` class and `opda:Person`/`opda:Organisation` → `opda:Address` joins (class diagram + Consequences: "Downstream modules MUST consume `opda:Address` and `opda:Name`"); and `opda:evidencedAuthority` → evidence. [ODR-0007](./ODR-0007-transactions-and-lifecycle.md) likewise specified the Transaction relator's participant/chain joins (`dependsOnTransaction`, `chainMembers`).

Almost none of that relationship layer was emitted. The generator ships the agent/transaction **class skeletons** plus whatever datatype leaves the `propertyPack` walk happened to land on them, and emits `opda:founds`/`opda:mediates` as **rangeless "design-time" stubs** (`emitters/modules/agent.py` — `owl:ObjectProperty` with no `rdfs:domain`/`rdfs:range` and, for `founds`, no SHACL path). `opda:playedBy`/`opda:plays`, the role-play SHACL shape, the structured `opda:Name` class, the Person/Organisation → `opda:Address` join, the Transaction → participant/property joins, and the chain predicates were **never emitted at all**. ODR-0006 left the module's TBox "unfrozen pending the Kind-layer choice," and the freeze-and-emit pass for the relationship layer never happened.

The result: across the corpus only **7 object properties** actually connect two `opda:` classes; ~30 classes (Person, Organisation, Seller, Buyer, Proprietor, Proprietorship, Transaction, Survey, Search, Valuation, Comparable, Milestone, EPCCertificate, …) have **zero incoming or outgoing object properties**. A consumer cannot traverse from a transaction to its parties, from a participant to its address, from a role to its bearer, or from a proprietorship to its title — the edges do not exist as data. Because completeness was only ever *defined and gated* for datatype leaves, nothing detected the omission.

## Decision Drivers

* **Faithfulness to the source.** The PDTF JSON expresses these as containment/reference (a transaction *contains* `participants[]`; a participant *contains* `address`; ownership *binds* owners to titles). Flattening was the right call for descriptive *values*; it is not a licence to discard inter-*entity* relationships.
* **Navigability.** A data model whose entities are islands cannot answer the basic competency questions of the domain ("who are the parties to this transaction?", "what address does this participant have?", "which person bears this proprietor role?").
* **The decisions were already made.** ODR-0006/0007 ratified the relationship layer; this is closing an *implementation* gap, not opening a new modelling debate.
* **No silent regression.** The datatype layer is protected by a coverage gate; the relationship layer must be too, or it will drift again.
* **OWL is the data model.** Per the user's framing, this is about the OWL object-property markup carrying the standard's information value — not UFO annotation or SKOS vocabularies.

## Considered Options

* **Option A (chosen) — Reify the relationship layer as OWL object properties with `rdfs:domain`+`rdfs:range`, and establish a relationship-completeness criterion + gate.** The object-property analogue of ODR-0022's leaf-completeness: every inter-entity association the source expresses is emitted as a typed object property (+ SHACL per ODR-0013), and a CI gate proves it.
* **Option B — Leave it as-is / treat the relationship layer as documentary (rangeless `founds`/`mediates`, role-as-typing only).** Rejected: contradicts ODR-0006/0007's ratified design, leaves the model non-navigable, and the "design-time, never reasoned" stance was about *reasoning*, not about whether the edges exist as data.
* **Option C — Hand-add the few obviously-missing properties.** Rejected: patches symptoms without the discipline; nothing prevents the next module from regressing, and it leaves no counted, gated definition of "relationship-complete."
* **Option D — Express relationships only in SHACL, not OWL.** Rejected: SHACL constrains; the object property is the data. A `sh:path` to an undeclared predicate is not a navigable edge, and consumers query the OWL graph.

## Decision Outcome

Chosen option: **"Option A — reify the relationship layer as typed object properties with a completeness criterion + gate"**, because it closes the ratified-but-unbuilt ODR-0006/0007 relationship layer systematically, makes the model navigable, and protects it from silent regression the same way the descriptive layer is protected.

This ODR **un-freezes** the relationship layer of ODR-0006/0007 (the freeze was contingent on a Kind-layer choice that does not block emitting the relationships; the Kind-layer `W3C Org`-vs-bespoke refinement, ODR-0006 §"Freeze gate", remains an independent open item and is NOT a precondition for this layer). It ratifies the object-property inventory and the role-play/relator SHACL shapes (§Rules) and establishes the **relationship-completeness criterion**. The engineering — a relationship-emission walk in `opda-gen`, the `ci-object-property-coverage` gate, and corpus regeneration — is delegated to the companion ADR (see §More Information); this ODR is the modelling decision the ADR realises.

### Consequences

* Good, because the agent/transaction/role classes become connected: the model can answer who-is-party-to, plays-which-role, lives-at-which-address, binds-which-title.
* Good, because relationship completeness becomes a *counted, gated* property of the corpus (no silent omission), exactly as leaf completeness already is.
* Good, because it honours rather than overturns ODR-0006/0007 — it emits what they specified.
* Bad, because it is a breaking, byte-identity-affecting corpus change (new object properties + SHACL shapes + regenerated `ontology-model.json`/graph/expected-reports) and a new CI gate, with the migration cost that implies.
* Bad, because some endpoints require small modelling sub-choices (e.g. should `participants[].address` reuse `opda:Address` directly; should `opda:Name` be a class or stay a structured set of datatype properties) that must be settled during emission.
* Neutral, because `verification` (KYC/AML) and other trust-framework participant data remain out of scope here — this ODR covers entity-to-entity *relationships*, not the participant attribute backlog (tracked separately).

### Confirmation

Compliance is verified by the `ci-object-property-coverage` gate defined in the companion ADR, **as amended by Council [session-047](./council/session-047-relationship-layer-object-properties.md)**: it MUST fail on (a) any `owl:ObjectProperty` that is **rangeless AND shapeless** (no `rdfs:range` *and* no SHACL `sh:class`/`sh:node` value-type shape) — not on rangelessness per se; (b) any `rdfs:domain`/`rdfs:range` that is **not universally true** (e.g. a single `rdfs:domain opda:Person` on a multi-bearer predicate); (c) any **GATED** §R2 association lacking **one worked SPARQL competency query** that traverses it; and (d) any residue-register entry with an empty/"TODO" disposition. The class-graph dead-edge check is kept **separate** from the shapes-graph bearer check (ODR-0013 open/closed-world guard). The diagnostic exemplars (ODR-0005/0015) gain participant-relationship facets that must validate against the new SHACL role-play and relator shapes.

## Rules

### R1 — Relationship-completeness criterion (amended by Council [session-047](./council/session-047-relationship-layer-object-properties.md), 2026-06-17)

**Endpoint-IC keying (not source-containment).** An association is reified as an `owl:ObjectProperty` **iff (a)** both endpoints are first-class entities — each carrying its own identity criterion (+I: a Substance-Kind per [ODR-0005](./ODR-0005-property-land-identity-crux.md), OR a Relator/Role well-founded on such Kinds) — **and (b)** a worked SPARQL competency query motivates the edge (the [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) §G3 coverage-by-test discipline carried to the relationship layer). Source *containment* of a −I quality/mode (a name, an address-value, a monetary amount, a `time:Interval`, a SKOS status) is **not** an inter-entity relationship — it is a datatype/value path on the container. This rekeys the original "every association that links two first-class entities (including containment)" form, which conflated JSON nesting with ontological identity and over-reified.

**Three dispositions — nothing silently dropped.** Every source association resolves to exactly one: **GATED** (both endpoints +I and query-motivated → emit the typed object property); **RESIDUE-PENDING** (an endpoint's IC is undecided upstream → record in the relationship-residue register with the blocking record, e.g. Address pending ODR-0015); **VALUE-SLOT** (a −I endpoint → datatype property / `sh:in`, recorded with a reason). The residue register is **gate-checked**: a registered association MUST carry a named disposition + reason (an empty/"TODO" entry fails the gate). Collapse-by-silence is never available.

**Type-pinning, not blanket domain+range.** A gated object property MUST be a *declared* `owl:ObjectProperty` whose co-domain is type-pinned **either** by `rdfs:range` **or** by a SHACL `sh:class`/`sh:node` value-type shape; an `owl:ObjectProperty` that is **rangeless AND shapeless** is non-conformant (the real `founds`/`mediates` defect). `rdfs:domain` is asserted **only** where the subject-type entailment is universally true (the single-bearer relator spine); multi-bearer characterisations drop `rdfs:domain` and push bearer-typing to SHACL (§Confirmation, ODR-0013). `rdfs:domain`/`rdfs:range` *infer* types — they MUST NOT be authored or relied on as validation.

### R2 — The ratified object-property inventory (initial set)

| Object property (+ inverse) | `rdfs:domain` → `rdfs:range` | Source / current state |
|---|---|---|
| `opda:playedBy` / `opda:plays` | Seller, Buyer, Proprietor (Role) → Person, Organisation | ODR-0006 §SHACL (`SellerShape sh:path opda:playedBy`) — **not emitted** |
| `opda:founds` / `opda:foundedBy` | Transaction, Proprietorship (Relator) → Seller, Buyer, Proprietor (Role) | ODR-0006 §role-founding — emitted **rangeless**; add domain+range |
| `opda:mediates` | Proprietorship → Proprietor | ODR-0006 §Q3 — emitted rangeless (SHACL-only); add range |
| `opda:hasRegisteredTitle` (Proprietorship arm) | Proprietorship → RegisteredTitle | ODR-0006 §Q3 ("mediating … against a RegisteredTitle") — **not emitted** |
| `opda:hasAddress` (extended) | **add** Person, Organisation → Address (currently `Property`-only) | ODR-0006 Consequences ("consume `opda:Address`") — participant address **not linked** |
| `opda:hasName` + `opda:Name` (structured) | Person, Organisation → Name | ODR-0006 §"Kind layer" ("`opda:Name` … declared once") — **not emitted** (`name` is a domain-less string) |
| `opda:hasEvidencedAuthority` | Seller → Claim | ODR-0006 §Q4 — **emitted ✓** (the lone existing inter-class edge) |
| `opda:hasParticipant` (via `founds`) | Transaction → Seller, Buyer | ODR-0007 — **not emitted** |
| `opda:concernsProperty` | Transaction → Property | ODR-0007 (the property the transaction is about) — **not emitted** |
| `opda:dependsOnTransaction` | Transaction → Transaction | ODR-0007 §S007 Q4 (chain) — in comments, **not emitted** |
| `opda:chainMembers` | TransactionChain → Transaction | ODR-0007 §S007 Q4 (chain) — in comments, **not emitted** |

The set is *initial*, not closed: R1 governs, and the gate (companion ADR) surfaces any further source association not reified. Predicate names that clash with class local-names follow the ADR-0044 rename convention already applied to `roleNotation`/`organisationName`.

**Council [session-047](./council/session-047-relationship-layer-object-properties.md) dispositions over this inventory (amends the rows):**

- **GATED** — `founds`/`foundedBy`, `mediates`, `hasRegisteredTitle`, `hasParticipant`, `concernsProperty`, `hasEvidencedAuthority`, and `playedBy`/`plays`. **Carrier (Q5):** `founds`/`mediates` are type-pinned in **SHACL `sh:class`** (not `rdfs:domain`+`rdfs:range`), preserving their "never reasoned" commitment (see §Decision detail); `concernsProperty`/`hasRegisteredTitle`/`hasEvidencedAuthority` (single-domain, no never-reasoned commitment) carry `rdfs:domain`+`rdfs:range`; `playedBy`/`plays` is **OPTIONAL / distinct-node-only** (emit only where the role qua-individual is a node distinct from its bearer; never a self-edge `?x playedBy ?x`), with its bearer disjunction Person∪Organisation in SHACL `sh:or` (and `hasParticipant`'s Seller∪Buyer range likewise), **not** an `rdfs:range`/`owl:unionOf`.
- **VALUE-SLOT — `hasName`+`opda:Name` is STRUCK from this object-property inventory.** A name carries no bearer-independent identity criterion (−I); emit `hasName` as a structured **datatype** value (no `rdfs:domain`; component structure + bearer-typing in a SHACL `NameShape`). Promote to a *dependent* `opda:Name` node (still no independent IC) only on a named consumer that dereferences to a Name node — a trigger **not met in the current corpus** (`opda:NameChangeEvent` associates with the `Person` and carries string-literal names; verified `opda-agent.ttl:34` / `opda-agent-shapes.ttl:75` / `exemplars/person-with-name-change.ttl`).
- **RESIDUE-PENDING — `hasAddress`.** Extend the *predicate* to Person/Organisation (drop its current `Property`-only `rdfs:domain`; bearer-typing → SHACL; keep `rdfs:range opda:Address`), but do **not** settle the `opda:Address` class/IC here — Mode-vs-Resource is ODR-0015's open question (ODR-0005 §6b). The gate MUST NOT manufacture an `opda:Address` class to satisfy coverage.
- **DEFERRED — `dependsOnTransaction`/`chainMembers`.** No exemplar + query yet → residue register with reason, until a chain exemplar lands (honours the ODR-0007 defer-until-a-concrete-consumer dissent).

### R3 — Role-as-typing coexists with `playedBy`

The canonical role encoding remains class co-typing (`?x a opda:Person, opda:Seller`) per ODR-0006 §Q2; `opda:playedBy` is **not** redundant with it — it is the navigable edge for the cases where the bearer and the role-instance are distinct nodes (e.g. a `prov:Agent`-attested participant), and it carries the SHACL `sh:or ([sh:class Person][sh:class Organisation])` bearer constraint ODR-0006 specified.

### R4 — Un-freeze, scoped (clarified by Council [session-047](./council/session-047-relationship-layer-object-properties.md))

This ODR lifts the ODR-0006 freeze **only** as it blocks emitting the relationship layer. The orthogonal `W3C Org`-vs-bespoke-`opda:` Kind-layer refinement (ODR-0006 §"Freeze gate" (b)) remains open. **Council finding (Davis DA, Q1):** the un-freeze *does* touch Kind-layer endpoints (the Person/Organisation `hasName`/`hasAddress` shape), so this is not a pure "implementation gap" — §R1's endpoint test is a Council ruling, not a mechanical detail. It is nonetheless safe to proceed: emitting the relationship layer against the **current bespoke `opda:` Kind layer does NOT foreclose** the future `W3C Org` choice — `hasName` is a datatype/SHACL path (no class minted), `hasAddress` extends a predicate (Address class deferred to ODR-0015), and the relator spine is invariant under the Kind-vocabulary choice. The `W3C Org`-vs-bespoke decision stays with the ODR-0006 §Freeze-gate(b) council. **Predicate-vocabulary record (Davis DA, Q1 abstention condition):** this ODR emits bespoke `opda:` name/address *predicates* (`opda:hasName`, `opda:hasAddress`) against the current Kind layer — a predicate-vocabulary choice that does **not** foreclose the `W3C Org`-vs-bespoke *class* choice; predicate alignment (`vcard:`/`org:`) is revisitable via `owl:equivalentProperty`/rename when the Kind-layer council runs.

## Decision detail — `founds`/`mediates` carrier (Council session-047)

The Council **resolved** the one residual split: `opda:founds`/`opda:mediates` are **type-pinned in SHACL `sh:class` (NOT `rdfs:domain`+`rdfs:range`)**, preserving their shipped `"Design-time, NEVER reasoned"` commitment (ODR-0029/0030/0031; verified `opda-agent.ttl:192`/`214`). Guizzardi moved here on corpus evidence: `opda:mediates` is range-unpinned in **both** OWL and SHACL today (`ProprietorshipMediationShape`, `opda-agent-shapes.ttl:59`, carries `sh:path opda:mediates` + `sh:minCount 2` but **no `sh:class`** on the object) — the gate's first real catch. Fix: add `sh:class opda:Proprietor` to that shape, a Relator→Role `sh:class` shape for `founds`, and a SHACL subject-guard confining their subjects to the relator kinds, so the relator entailment is conservative-by-construction. `rdfs:domain`+`rdfs:range` is reserved for single-domain edges with **no** never-reasoned commitment (`concernsProperty`, `hasRegisteredTitle`, and the chain pair if un-deferred).

**Deferred option (no live dissent).** Asserting `rdfs:domain`+`rdfs:range` on `founds`/`mediates` (the OWL-entailment path) is a future decision a council MAY elect — the entailment is conservative — but **only by explicitly deleting the "never reasoned" comments and overriding ODR-0029/0030/0031**; it is out of scope for ADR-0048. The Council reached full convergence: the DA withdrew every attack after the amendments answered them; there is no held-as-live dissent.

## More Information

* **Companion engineering record:** ADR-0048 (relationship-emission walk + `ci-object-property-coverage` gate + regeneration) — realises this ODR; the object-property analogue of how [ADR-0031](../adr/ADR-0031-category-g-curated-walk-execution-plan.md)/[ADR-0032](../adr/ADR-0032-category-g-walk-emission-and-coverage-gate.md) realised ODR-0022.
* **Ratified-but-unbuilt design:** [ODR-0006](./ODR-0006-agents-and-roles.md) §"Role-founding relator pattern", §"Capacity split", §"SHACL constraints (ODR-0013)", Consequences; [ODR-0007](./ODR-0007-transactions-and-lifecycle.md) participant/chain scope.
* **Precedent (datatype layer):** [ODR-0022](./ODR-0022-descriptive-layer-import-strategy.md) (leaf-completeness + the A–G taxonomy) and its `ci-category-g-coverage` gate — this ODR is its relationship-layer mirror.
* **SHACL home:** [ODR-0013](./ODR-0013-shacl-validation-and-severity.md) (the shapes graph kept separate from the OWL class graph) governs the role-play/relator shapes.
* **Evidence of the gap:** `source/03-standards/ontology/opda-agent.ttl` (`opda:founds`/`opda:mediates` rangeless; no `playedBy`); a corpus-wide count of 7 class→class object properties.
* **Out of scope:** the participant *attribute* backlog (`phone`, `email`, structured `name`, `participantStatus`, `verification`) — datatype/PII work, not inter-entity relationships; and ratification of this proposal (operator).
