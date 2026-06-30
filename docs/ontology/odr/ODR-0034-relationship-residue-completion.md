---
status: proposed
date: 2026-06-30
kind: pattern
tags: [relationships, object-properties, prov-o, events, information-objects, residue-register, completeness]
scope:
  - pdtf-v3:propertyPack.milestones
  - pdtf-v3:propertyPack.ownership.titlesToBeSold
  - pdtf-v3:chain
  - pdtf-v3:propertyPack.surveys
  - pdtf-v3:propertyPack.searches
  - pdtf-v3:verifiedClaims.verification
supersedes: []
depends-on: [ODR-0005, ODR-0008d, ODR-0009, ODR-0013, ODR-0026, ODR-0029, ODR-0032]
implements: [ODR-0032]
council: session-051
---

# Relationship-residue completion — events, information objects, verification, and the aboutness/provenance boundary

## Context and Problem Statement

[ODR-0032](./ODR-0032-relationship-layer-object-properties.md) (council [session-047](./council/session-047-relationship-layer-object-properties.md)) built the relationship **spine** (the agent/transaction/role/property object properties) and the three-disposition **residue register** (GATED / VALUE-SLOT / RESIDUE-PENDING). It did **not** adjudicate the perdurant **events** (Milestone, LeaseExtensionEvent, UPRNSuccessionEvent, NameChangeEvent), the **Information Objects** (Survey, Search, Comparable, NearbyFacility, AttachedDocument), **VerificationActivity**, **LeaseTerm**, or the **chain** predicates — session-047 had no PROV-O voice, and these classes are overwhelmingly `prov:Activity`/`prov:Entity`.

A 2026-06-30 review of the `/ontology/classes` diagrams surfaced the consequence: **18 of 40 classes render disconnected**, because the diagram draws only object-property class→class edges. The review is the trigger; the residue is the substance.

**The decisive corpus fact (convener-verified).** `opda:partOfTransaction` (Milestone→Transaction), `opda:concerns` (Transaction→LegalEstate), `opda:dependsOnTransaction`, `opda:chainMembers`, `opda:chainStatus`, `opda:appliesTo`, `opda:updatesRegistryRecord` are **used in committed diagnostic exemplars but none is declared `owl:ObjectProperty` in the gated TBox** — the ADR-0048 §As-built "undeclared orphan predicates, left as-is." So the question is not "mint new relations" but "**declare and gate** edges the corpus already commits in its ABox," and the chain exemplar **exists** (the session-047 "no exemplar yet" deferral is stale). The five info-object subject classes appear in **zero** exemplars.

## Decision Drivers

* **Faithfulness without over-reification.** The §R1 endpoint-IC test (both endpoints +I AND a worked competency query) governs; source containment of a −I quality is a value-path, not an edge.
* **Reuse over mint (parsimony).** Where PROV-O already names the relation, declaring a parallel `opda:` predicate duplicates PROV and orphans the existing triples.
* **Aboutness ≠ provenance.** PROV-O expresses derivation, influence, and attribution — **not topical subject-hood**. Substituting `prov:wasDerivedFrom` for "is about" is a *false provenance claim*.
* **No undeclared edges.** An object property used in the ABox but undeclared in the TBox is ungoverned (invisible to the coverage gate, no SHACL value-shape) — the `founds`/`mediates` rangeless defect in another guise.
* **No collapse-by-silence.** A warranted-but-unexercised relation is *registered* (RESIDUE-PENDING), never dropped.

## Considered Options

* **Option A (chosen) — Adjudicate each residue edge by §R1 into one disposition; declare+gate the exemplar-attested edges, reuse PROV where it carries the relation, register the warranted-but-unexercised ones, value-slot the −I endpoints.**
* **Option B — Gate every candidate to "connect" the diagram.** Rejected: over-reifies −I endpoints (LeaseTerm), mints PROV duplicates (VerificationActivity), and gates predicates no exemplar exercises (info-objects) — the §R1(b) violation. The diagram disconnection is fixed by *rendering* `rdfs:subClassOf` (ADR-0055), not by minting.
* **Option C — Mint bespoke `opda:` predicates for the PROV-native relations (`opda:usesEvidence`, `opda:wasInformedBy`).** Rejected: duplicates PROV-O, contradicts the reuse driver, and orphans the exemplars' existing `prov:` triples.
* **Option D — Leave the undeclared exemplar predicates as-is.** Rejected: they are ungoverned (ADR-0048 flagged them for "a future council" — this is it).

## Decision Outcome

Chosen option **A**. The residue resolves under one rule — *declare-and-gate where the corpus already commits the edge; reuse PROV where it names the relation; register-and-defer where the relation is warranted but unexercised; value-slot the −I endpoints* — with full Council convergence and no held-as-live dissent (session-051; DA Davis withdrew on the gated edges, held with register-satisfied triggers elsewhere).

### Consequences

* Good, because the two exemplar-attested orphan predicates become governed, type-pinned, navigable edges (Milestone→Transaction, Transaction→LegalEstate) instead of ungoverned ABox predicates.
* Good, because the PROV-native relations (verification, comparable-informs-valuation, event-revision/derivation) are surfaced as the navigable edges they already are — the model is *not* disconnected, the *diagram* was.
* Good, because the aboutness/provenance boundary is now doctrine (§R5): a future "Survey about Property" edge will be `opda:aboutProperty`, not a mis-stated `prov:wasDerivedFrom`.
* Bad, because it is a byte-identity-affecting regeneration (two new object-property declarations + SHACL shapes + two committed competency queries + regenerated `ontology-model.json`/graph/expected-reports) — delegated to ADR-0056.
* Neutral, because the participant-attribute backlog and the W3C-Org-vs-bespoke Kind-layer choice remain out of scope (ODR-0006/0032).

### Confirmation

Compliance is verified by the `ci-object-property-coverage` gate (ADR-0048, extended by ADR-0056): the two GATED edges are declared, type-pinned (documentary `rdfs:domain`/`rdfs:range` per ODR-0032 §R1 as amended by session-050, **never entailed** — ADR-0035 zero-domain/range-triple proof — plus a SHACL `sh:class` value-shape + subject-guard), and each carries **one worked SPARQL competency query**; every RESIDUE-PENDING register entry carries a named disposition + reason + auto-gate condition (an empty/"TODO" entry fails the gate); no PROV-native relation is shadowed by a bespoke `opda:` predicate. The diagnostic exemplars validate against the new SHACL shapes.

## Rules

### R0 — Endpoint meta-categories and identity criteria (per-kind discipline, ODR-0001 §"What an ODR records")

The classes this ODR newly edge-connects, with their UFO/DOLCE meta-category and IC over the named hard cases:

- **`opda:Milestone`** — UFO **Event** (DOLCE *perdurant*; Guizzardi et al., ER 2013 §3). **IC:** identified by its participation structure + temporal extent within its Transaction; two milestones of the same phase-type in one transaction are distinct iff their temporal extents differ. Hard case: a *re-issued* completion milestone after a fall-through is a **new** Event (new temporal extent), not the same milestone re-dated.
- **`opda:Transaction`** — UFO **Relator** (ODR-0005/0007), well-founded on the Property/Proprietor/participant Kinds it mediates. **IC:** bounded-context identity (ODR-0005, 12–0) — a Transaction is not `owl:sameAs`-collapsible across registries.
- **`opda:LegalEstate`** / **`opda:RegisteredTitle`** — UFO **Substance-Kind** / non-physical endurant (ODR-0005; DOLCE D18 §4.2). **IC:** the estate's identity persists through registry record changes; a re-registration under a new title number is the **same** LegalEstate (the `recordsEstate` arm), a **distinct** RegisteredTitle.
- **`opda:VerificationActivity`** — UFO **Event** (`prov:Activity`). **IC:** participation structure (who verified, what evidence used, when). Hard case: a re-verification is a **new** VerificationActivity (`opda:hasVerificationSuccessionStatus`), not a mutation of the prior one.
- **Information Objects** (`opda:Survey`/`Search`/`Comparable`/`NearbyFacility`/`AttachedDocument`) — UFO **Information Object**, non-physical endurant with **extrinsic IC** ⟨issuing authority, reference, issue date⟩ (ODR-0008d). Reaffirmed here as legitimate +I edge endpoints — but see §R3/§R4.

### R1 — GATED: declare the exemplar-attested orphan predicates

The following edges are **GATED** — declared `owl:ObjectProperty`, documentary `rdfs:domain`/`rdfs:range` (ODR-0032 §R1 / S050; AI-signal, never entailed), a SHACL `sh:class` value-shape + relator/event subject-guard (ODR-0013), and **one committed worked SPARQL competency query** each:

| Object property | `rdfs:domain` → `rdfs:range` | Competency query (bar b) | Endpoints (§R1 a) |
|---|---|---|---|
| `opda:partOfTransaction` | `opda:Milestone` → `opda:Transaction` | "the milestones of transaction T" | Event (+I) → Relator (+I) — event-mereology (ER 2013 §4); PROV has no part-of-activity (PROV-DM §5.3) |
| `opda:concerns` | `opda:Transaction` → `opda:LegalEstate` | "the estate transaction T conveys" | Relator (+I) → Substance-Kind (+I) — founded participation (Guizzardi 2005 §4.3.2); distinct from `opda:concernsProperty` (→Property, already GATED) |

Both predicates already occur on instances in `exemplars/simple-transaction-with-milestones.ttl` and `exemplars/chain-of-transactions.ttl`; this rule **declares and governs** them, it does not mint them. `opda:concerns` ≠ `opda:concernsProperty`: the former conveys the legal interest (LegalEstate), the latter the physical Property (ADR-0048 §As-built named both).

### R2 — USE-EXISTING-PROV: the relation is PROV-native, no `opda:` mint

These relations are carried by **existing PROV-O properties** and MUST NOT be shadowed by a bespoke `opda:` predicate. They are emitted on the exemplars (where absent, per ODR-0009's design) and surfaced by the diagram's PROV layer (ADR-0055); the model is navigable through them:

- **VerificationActivity → Evidence / AttachedDocument:** `prov:used` (PROV-O §2). **VerificationActivity → verifier Agent:** `prov:qualifiedAttribution` / `prov:wasAssociatedWith` (PROV-O §3). Realises the ODR-0009-designed PROV backbone (§"PROV-O mapping").
- **Comparable → Valuation:** `prov:wasInformedBy` (ODR-0008d Rule 3 — already designed).
- **NameChangeEvent → Person:** `prov:wasRevisionOf` / `prov:wasAssociatedWith`. **UPRNSuccessionEvent → prior Address/Property:** `prov:wasDerivedFrom` (ODR-0005 §6a).

`opda:AttachedDocument`'s evidentiary tie remains **role-via-`opda:evidenceType`** (ODR-0027 §R6 / ODR-0024 R7 — "not evidence by mere attachment"); no new edge.

### R3 — RESIDUE-PENDING: warranted, but bar (b) unmet — register, do not gate

Added to the ODR-0032 relationship-residue register with a named auto-gate condition:

| Register entry | Reason | Auto-gate condition |
|---|---|---|
| `opda:aboutProperty` (Survey / Search / Comparable / NearbyFacility → Property) — one subject-guarded predicate (`sh:targetSubjectsOf opda:aboutProperty`; `sh:or` of `sh:class` bearers; `sh:class opda:Property`) | About-relation **warranted** (PROV is silent on aboutness — §R5); but **zero** committed info-object exemplars → no worked query (§R1 b unmet) | first committed exemplar instantiating an info-object subject **+** a worked "the surveys/searches/comparables about Property P" query → promote to GATED |
| `opda:dependsOnTransaction` / `opda:chainMembers` (chain) | Exemplar **exists** (`chain-of-transactions.ttl`) — the session-047 "no exemplar yet" deferral is **stale**; endpoints +I (Transaction/TransactionChain) | a committed recursive-cascade query ("all transactions upstream of T in the chain") → promote to GATED |
| `opda:appliesTo` / `opda:updatesRegistryRecord` (LeaseExtensionEvent / UPRNSuccessionEvent → Title/registry record) | Exemplar-attested but undeclared, like §R1; no committed competency query yet | a committed "what does this lease-extension apply to / which registry record does it update" query → promote to GATED |

### R4 — VALUE-SLOT: −I endpoints carry no inter-entity edge

- **`opda:LeaseTerm`** (`rdfs:subClassOf time:ProperInterval`) — a DOLCE temporal/quality-region (−I; D18 §4.2); the `opda:leaseTerm` join is a datatype/value path (`time:hasBeginning`/`hasEnd`), not an object property. (Unanimous, 7–0.)
- **The name in `opda:NameChangeEvent`** — −I; reaffirms ODR-0032 §R2's struck `hasName` (string-literal datatype; the Person tie is `prov:wasRevisionOf`).
- **NearbyFacility proximity** — `opda:distanceInMiles` is a −I quality; only an explicit `opda:aboutProperty` "near Property P" edge is RESIDUE-PENDING (§R3), the distance itself is a value-slot.

### R5 — Aboutness is not provenance (doctrine)

PROV-O carries **derivation** (`prov:wasDerivedFrom`), **influence** (`prov:wasInformedBy`), **generation** (`prov:wasGeneratedBy`), **attribution** (`prov:qualifiedAttribution`), and **specialization** (`prov:specializationOf`, entity→more-general-entity) — it does **not** carry **topical subject-hood** ("this Information Object *is about* subject X"); PROV-DM §5 has no topic/`isAbout` term. Therefore:

- A topical aboutness relation (e.g. a Survey *about* a Property) is modelled as a bespoke `opda:` predicate (`opda:aboutProperty`), **not** as `prov:wasDerivedFrom`/`wasInformedBy` — substituting a provenance term for aboutness asserts a **false provenance claim** (a Survey is generated by an inspection Activity, not *derived from* the Property).
- Conversely, a genuine derivation/influence/attribution relation MUST reuse the PROV term (§R2), not a parallel `opda:` predicate.

This is the boundary that resolves the session's central split (Moreau, conceded by Kendall): *reuse PROV for provenance; mint `opda:` for aboutness; never conflate the two.*

## More Information

* **Council:** [session-051](./council/session-051-relationship-residue-completion.md) (Full Council; Queen Kendall, DA Davis; Moreau/Guizzardi/Guarino/Allemang/Cagle). Full convergence, no held-as-live dissent.
* **Realises / extends:** [ODR-0032](./ODR-0032-relationship-layer-object-properties.md) §R1 endpoint-IC test + residue register (this ODR adds §R3 entries and the §R5 aboutness/provenance boundary).
* **Companion engineering record:** ADR-0056 (declare `partOfTransaction`/`concerns`, the SHACL shapes + competency queries, the residue-register + `ci-object-property-coverage` extension, regeneration). The diagram realisation (`rdfs:subClassOf` render layer + the shipped cross-section links) is ADR-0055.
* **Source designs:** [ODR-0009](./ODR-0009-claims-evidence-provenance.md) (the VerificationActivity PROV backbone), [ODR-0008d](./ODR-0008d-authority-retrieved-artefacts.md) (Information Objects + `prov:wasInformedBy`), [ODR-0007](./ODR-0007-transactions-and-lifecycle.md) (chain).
* **Governance:** per the OPDA handoff, this record stays `proposed` until the Modelling Sub-Committee draft-adopts; `accepted` only after AGM ratification.
* **Out of scope:** the participant-attribute backlog; the W3C-Org-vs-bespoke Kind-layer choice (ODR-0006 §Freeze-gate(b)).
