---
status: proposed
date: 2026-05-20
tags: [transactions, lifecycle, owl-time, module]
supersedes: []
depends-on: [ONT-0004, ONT-0005]
implements: [ONT-0003]
---

# Transactions & Lifecycle

## Context and Problem Statement

The PDTF v3 base schema carries the transaction envelope as a flat bundle of leaves with no explicit relational object: `transactionId` (a UUID) and `externalIds` identify the transaction; `participants[]` lists the parties (ONT-0006); `milestones` records `listed`, `started`, `completed` and the `legalForms` progress; `chain` holds "the data through which the chain for this transaction can be built"; and a scatter of date leaves (`listedDate`, `soldDate`, `expected`, `started`, `completed`, official-copy `retrievedOn`) records *when* things happened. The transaction is the verb half of the model (Kendall, Q1) — it is the thing that binds a seller, a buyer, a property and a legal estate into a single homebuying episode — yet the schema gives it no class, no founding semantics, and no way to say that being a *seller* or a *buyer* holds only *for the duration of* this transaction.

Two distinct defects compound here. First, the **role-founding** defect: ONT-0006 models `opda:Seller`/`opda:Buyer` as RoleMixins that are anti-rigid and externally founded, but a RoleMixin is incoherent without the relation that founds it — nothing in `participants[] + role` names the transaction-as-relation that makes a Person a Seller. Second, the **temporal** defect: the schema records instants (`soldDate`, `listedDate`) but has no vocabulary for the *intervals* that dominate the lifecycle — the marketing-to-completion window, lease terms (`startYearOfLease`/`lengthOfLeaseInYears`), the `lastDemandPeriod {from, to}`, proprietorship duration. The milestone/status leaves (`milestones`, `participantStatus` with its `Proposed | Invited | Active | Removed` enum) further conflate a *status phase* — an anti-rigid mode the transaction or a participant passes through — with a plain datatype value.

Council Session 001 (Q3) rejected partitioning the ontology by aggregate page and resolved to partition by **ontological concern**, reconciling Kendall's FIBO modules with Guizzardi's UFO Kind/Role/Relator layering. This ODR is the **Transactions & Lifecycle** module under that partition. It is a Phase-1 module and is **gated by the identity crux** (ONT-0005): the Transaction relator relates Property/Title endurants whose identity criteria are settled in the crux, so it does not start in anger until the crux clears its exemplar gate.

The question: how do we re-express the transaction envelope, its milestones and status phases, and its pervasively interval-valued temporal facts so that the transaction is modelled as the relation that founds the participant roles, status is modelled with the correct anti-rigid category, and intervals are first-class rather than flattened to instants?

## Decision Drivers

* **Role-founding correctness** (Guizzardi) — `opda:Seller`/`opda:Buyer` are RoleMixins (ONT-0006); a RoleMixin must be founded by a Relator. The Transaction is that Relator, and modelling it as a plain class would leave the ONT-0006 roles ungrounded.
* **Temporal coherence** (Guizzardi/Gandon, Q2) — adopting PROV-O's `prov:atTime` (an *instant*) for verification events while proprietorship, lease terms and claim-validity *intervals* go unmodelled is incoherent; the lifecycle is the primary interval-bearing layer.
* **Anti-rigidity of status** — `participantStatus` (`Proposed | Invited | Active | Removed`) and the milestone progression are phases an endurant passes *through*; modelling them as rigid subclasses would be a category error of the same family as the participant/role conflation.
* **Reuse over reinvention** (ONT-0002 adoption pattern) — prefer OWL-Time for intervals/instants and SKOS for status enumerations rather than minting bespoke `opda:` temporal or status machinery.
* **Seam discipline with provenance** — a milestone *transition* is simultaneously a lifecycle fact (here) and a `prov:Activity` (ONT-0009); the boundary must be drawn so the two layers reference rather than duplicate each other.
* **Ubiquitous-language alignment** — transaction, milestone, chain and status terms must align to the business glossary and the schema's `milestones`/`legalForms`/`chain` definitions so the ontology speaks the established vocabulary.

## Considered Options

* **Keep the schema shape** — one `opda:Transaction` class with `status`/`milestone` datatype properties and `prov:atTime`-style instants only. Faithful to the JSON, but leaves the ONT-0006 RoleMixins unfounded and cannot express the interval-valued lifecycle facts.
* **Transaction-as-Relator + Phases + instants-only (no OWL-Time)** — model the founding relation correctly and treat status as anti-rigid Phases, but defer interval modelling and reuse only PROV-O's instants. This is the Allemang/Davis "defer until a concrete consumer" position on OWL-Time.
* **Transaction-as-Relator + Phases + OWL-Time Conditional intervals** (chosen direction) — `opda:Transaction` as a UFO **Relator** founding the Seller/Buyer RoleMixins; milestones and `participantStatus` modelled as anti-rigid **Phases** backed by SKOS status schemes; lifecycle and tenure **intervals** modelled with OWL-Time (`time:Interval`, `time:Instant`, `time:hasBeginning`/`hasEnd`), with `prov:atTime` retained for genuine instants in the provenance layer.

## Decision Outcome

Chosen option: **Transaction-as-Relator + Phases + OWL-Time Conditional intervals**, because it is the only option that founds the ONT-0006 participant roles in an explicit relation, models status with the correct anti-rigid category, and resolves the instant-vs-interval incoherence that Q2 identified — while reusing standard vocabularies rather than re-minting temporal or status machinery.

- **`opda:Transaction`** — a UFO **Relator** (a relational endurant that mediates the parties), carrying `transactionId` (`dct:identifier`, sourced from the schema's `transactionId` UUID leaf) and `externalIds`. It is the relation that **founds the `opda:Seller`/`opda:Buyer` RoleMixins of ONT-0006** (the role-founding relationship is described here in prose rather than as a frontmatter `depends-on` to keep the dependency graph acyclic — ONT-0006 already cites this module for its founding Relators). Other founding Relators that surfaced in ONT-0006 (`opda:Proprietorship` founding `opda:Proprietor`, the conveyance/transfer relator founding the transfer roles) sit at this relational layer alongside the Transaction.
- **`opda:Chain`, chain linkage** — the chain is modelled as a relation linking dependent transactions, sourced from the `chain` leaf and the `otherPropertyInChain` / `propertyDependencyType` (`Sale | Purchase | Remortgage`) leaves. A dependent purchase or onward sale is a related Transaction relator, not a property of a single transaction.
- **Milestones and status as Phases** — `milestones` (`listed`, `started`, `completed`, `legalForms`) and `participantStatus` (`Proposed | Invited | Active | Removed`) are modelled as anti-rigid **Phases** of the Transaction (or of a participant's role-play), backed by SKOS status/milestone concept schemes delegated to ONT-0011. A transaction is "in marketing", "under offer", "exchanged", "completed" the way a phase is entered and left, not the way a Kind is instantiated. The `legalForms` progress (TA6/TA7/TA10 completion) is a sub-phase scheme under the same treatment.
- **OWL-Time intervals** — lifecycle and tenure facts that are interval-valued use OWL-Time: the marketing-to-completion window (`listed`/`started`/`completed` as `time:Instant` bounds of a `time:Interval`), lease terms (`startYearOfLease` + `lengthOfLeaseInYears` → a `time:Interval` / `time:DurationDescription`), the `lastDemandPeriod {from, to}`, `moveRestrictionDates`, and proprietorship duration. Use `time:hasBeginning`/`time:hasEnd`/`time:hasDuration`; **reserve Allen-interval relations** (`time:intervalDuring`, `time:intervalBefore`) for where temporal ordering is genuinely asserted, not as decoration.
- **`prov:atTime` retained for instants** — genuine instants in the verification/claims layer (ONT-0009) keep `prov:atTime`; OWL-Time supplies the interval vocabulary that PROV-O lacks. The two are complementary, which is precisely the coherence argument from Q2.

The **single-scheme-vs-per-role status** question (is there one status state-machine across the transaction and all roles, or one per role?) is carried from the participants analysis and **deferred to this ODR's own follow-up council session**; the SKOS scheme(s) it resolves to live in ONT-0011 either way.

### Consequences

* Good, because modelling `opda:Transaction` as a Relator founds the ONT-0006 Seller/Buyer RoleMixins in an explicit relation, eliminating the ungrounded-role defect in `participants[] + role`.
* Good, because adopting OWL-Time for intervals resolves the Q2 incoherence — proprietorship, lease terms and claim-validity intervals are now expressible in the same model that uses `prov:atTime` for instants.
* Good, because modelling milestones and `participantStatus` as anti-rigid Phases (not rigid subclasses) keeps the status machinery in the correct UFO category and delegates the enumerations cleanly to ONT-0011.
* Bad, because OWL-Time was adopted *Conditional* over a recorded Allemang/Davis "defer until a concrete consumer" dissent; if the lifecycle interval consumers do not materialise, the temporal layer carries cost without a proven downstream user.
* Bad, because the single-scheme-vs-per-role status question is left open, so the status SKOS scheme(s) cannot be frozen until a second deliberation.
* Neutral, because status and milestone enumerations are delegated to ONT-0011 (SKOS concept schemes) and the milestone-transition-as-`prov:Activity` mapping is delegated to ONT-0009 rather than resolved here.

### Confirmation

- SHACL shapes (ONT-0013) constrain a `time:Interval` to carry a beginning and (where the schema supplies one) an end, and constrain lease-term intervals derived from `startYearOfLease`/`lengthOfLeaseInYears` to be well-formed.
- The module is validated against the lifecycle facets of the diagnostic exemplars (ONT-0005): a property mid-marketing (open-ended interval), a completed sale (closed interval), and a leasehold whose lease term is an interval with a computed end.
- Status and milestone SKOS concepts (ONT-0011) carry `skos:prefLabel`/`skos:definition` sourced from the business glossary and the schema's `milestones`/`legalForms`/`participantStatus` definitions, and `dct:source` back to the canonical schema leaf path, per the term-sourcing convention defined in ONT-0004.
- The lifecycle/provenance seam is verified by checking that a milestone transition is represented once as a lifecycle Phase change here and referenced (not re-modelled) as a `prov:Activity` in ONT-0009.
- **Gate**: this module's TBox is not frozen until (a) ONT-0005 clears its identity-criterion gate (the Transaction relator relates Property/Title endurants) and (b) the single-scheme-vs-per-role status question is resolved in council.

## Pros and Cons of the Options

### Keep the schema shape

* Good, because it is a mechanical, low-effort translation faithful to the JSON.
* Bad, because it leaves the ONT-0006 Seller/Buyer RoleMixins unfounded — nothing names the relation that makes a Person a Seller.
* Bad, because it cannot express the interval-valued lifecycle facts (lease terms, marketing windows, demand periods) that the schema's date-pair leaves clearly imply.

### Transaction-as-Relator + Phases + instants-only (no OWL-Time)

* Good, because it founds the roles correctly and treats status as anti-rigid Phases, fixing the structural defects without adopting a new vocabulary.
* Good, because it honours the Allemang/Davis "don't ship a vocabulary until a concrete consumer exists" caution.
* Bad, because it reproduces the Q2 incoherence: using `prov:atTime` instants while leaving proprietorship and lease intervals unmodelled was the exact position the Council reversed (≈6-3).

### Transaction-as-Relator + Phases + OWL-Time Conditional intervals

* Good, because UFO categories place the founding relation and the anti-rigid phases correctly, and OWL-Time supplies the interval vocabulary the lifecycle demands.
* Good, because it reuses OWL-Time and SKOS rather than re-minting temporal/status machinery under `opda:`.
* Bad, because OWL-Time is adopted Conditional over a recorded dissent, and the status-scheme cardinality question still requires a second council pass before freeze.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: Core (OWL/RDFS/XSD); **OWL-Time** (intervals/instants — adopted Conditional, Q2, catalogued in ONT-0014); SKOS for status/milestone/legal-forms schemes (→ ONT-0011); PROV-O for the milestone-transition cross-link and `prov:atTime` instants (→ ONT-0009); DCAT Conditional where the transaction references published datasets (→ ONT-0014).
- **Glossary & schema as inputs**: the transaction envelope draws its load-bearing nouns from the business glossary and the schema annotations — `milestones` ("Transaction Milestones"), `listed` ("the date the property commenced marketing by being publicly listed for sale"), `legalForms` ("the progress of the legal forms completion, including TA6, TA7… and TA10"), `chain` ("the data through which the chain for this transaction can be built"), `participants`/`participantStatus`. Lifecycle interval leaves are sourced from `startYearOfLease`, `lengthOfLeaseInYears`, `lastDemandPeriod {from, to}`, `moveRestrictionDates`, `listedDate`, `soldDate`, `started`, `completed`, `expected`. Each derived concept carries `dct:source` to its schema leaf path; see ONT-0004 for the general term-sourcing and provenance convention.
- **Capacity cross-link**: `sellersCapacity` and the asserted-vs-evidenced split are owned by ONT-0006; the Transaction relator is the relation within which a capacity is asserted, so the evidence attachment point (ONT-0009) reaches the transaction through the founded role.
- **Deliverables (when fleshed out)**: `transactions-lifecycle.ttl`; status/milestone/legal-forms SKOS schemes (→ ONT-0011); an OWL-Time usage-pattern note (interval construction from the schema's date-pair and lease-term leaves); SHACL interval-well-formedness shapes (→ ONT-0013).
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the gating crux [ONT-0005](./ONT-0005-property-land-identity-crux.md); agents & roles whose RoleMixins this module's Relator founds [ONT-0006](./ONT-0006-agents-and-roles.md); provenance [ONT-0009](./ONT-0009-claims-evidence-provenance.md); enumerations [ONT-0011](./ONT-0011-enumeration-vocabularies.md); validation [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); vocabulary catalogue [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (OWL-Time adopted Conditional), Q3 (partition by concern).

## Vote and Dissent

This module ODR records no vote of its own — it is a planning record to be deliberated in its own follow-up session. The Council Session 001 positions it inherits:

- **Q2 OWL-Time** — **adopted Conditional (≈6-3), reversing the earlier exclusion.** Decisive argument (Guizzardi/Gandon): adopting PROV-O's `prov:atTime` (an instant) while proprietorship, lease terms and claim-validity intervals go unmodelled is incoherent. **Recorded dissent (Allemang/Davis): "defer until a concrete consumer."** The lifecycle is the primary OWL-Time consumer, which is why the conditional adoption lands in this module.
- **Q3 partition** — consensus against the by-aggregate-page partition; partition by ontological concern (UFO/FIBO). This module is the "Transactions & Lifecycle" concern; Evidence/Claims promoted to cross-cutting (ONT-0009).
- **Open question carried into this ODR's session**: status as a single state-machine across roles, or per-role; and the precise lifecycle/provenance seam for milestone transitions (ONT-0009). No recorded dissent specific to Transactions & Lifecycle beyond the OWL-Time conditionality.
