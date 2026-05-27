# ADR-0011 implementation report — module TBox emission

**Implementing worker:** Phase 3 module worker
**Implementation date:** 2026-05-27
**Status:** proposed (awaiting independent validation per programme plan §9.3)
**Realises ODRs:** ODR-0005, ODR-0006, ODR-0007, ODR-0008, ODR-0009,
ODR-0012, ODR-0015, ODR-0018

## 1. Per-module summary

| Module | File path | LOC | Classes | ObjectProperty | DatatypeProperty | Ratifying ODR(s) |
|---|---|---|---|---|---|---|
| Property | `source/03-standards/ontology/opda-property.ttl` | 141 | 7 | 3 | 5 | ODR-0005 + ODR-0015 + ODR-0008 |
| Agent | `source/03-standards/ontology/opda-agent.ttl` | 95 | 7 | 1 | 1 | ODR-0006 |
| Transaction | `source/03-standards/ontology/opda-transaction.ttl` | 69 | 3 | 1 | 2 | ODR-0007 |
| Claim | `source/03-standards/ontology/opda-claim.ttl` | 132 | 11 | 2 | 1 | ODR-0009 |
| Governance | `source/03-standards/ontology/opda-governance.ttl` | 73 | 2 | 2 | 0 | ODR-0012 + ODR-0018 |
| Descriptive | `source/03-standards/ontology/opda-descriptive.ttl` | 62 | 5 | 0 | 0 | ODR-0008 |
| **Total (modules only)** | | **572** | **35** | **9** | **9** | |

Foundation expansion (folded into existing `opda-classes.ttl`):

| Foundation classes | Count |
|---|---|
| Pre-ADR-0011 (ADR-0009): DiagnosticExemplar, GeneratorRun | 2 |
| Added by ADR-0011: RoleMixin, Role, Relator | 3 |
| **Total foundation** | **5** |

Grand total: 5 + 35 = 40 `owl:Class` declarations across the OPDA corpus.

## 2. Confirmation criteria status

### ADR-0011 §Confirmation (seven items)

| # | Criterion | Status | Verification |
|---|---|---|---|
| 1 | All six modules emit | PASS | `opda-gen emit-module {property,agent,transaction,claim,governance,descriptive}` each produces the named `.ttl`. `opda-gen emit` umbrella also runs all six. |
| 2 | Byte-identity CI green per module | PASS | `opda-gen ci-byte-identity` returns PASS; second-run regeneration produces zero diff across all 11 files (foundation 4 + vocabularies 1 + modules 6). |
| 3 | A9 discipline output verified | PASS | `test_a9_per_kind_discipline` asserts every `owl:Class` in every module has `dct:source` + `skos:scopeNote` + `rdfs:comment`. 35 module classes pass. |
| 4 | Three-graph isolation verified | PASS | `test_three_graph_isolation_per_module` asserts no `sh:*` triples in any module file; no DPV `owl:imports` in governance. CLI `ci-three-graph` returns PASS. |
| 5 | Per-module `owl:versionIRI` pins to 0.3.0 | PASS | `test_module_has_owl_ontology_header` asserts `<https://w3id.org/opda/{module}/0.3.0/>` for each module. |
| 6 | Diagnostic exemplars validate against modules | PASS | `test_exemplars_parse_against_modules` parses foundation + all six modules + each of 15 exemplars; every `a opda:X` resolves. 15/15 OK. |
| 7 | Core join predicates emit | PASS | `test_core_join_predicates_present` asserts `opda:hasUPRN` (DatatypeProperty), `opda:hasAddress` (ObjectProperty), `opda:identifiesSameProperty` (ObjectProperty) all declared in `opda-property.ttl` with `dct:source`. |

### Programme-wide validation gate (four items, independent of worker)

| # | Gate item | Status | Notes |
|---|---|---|---|
| (a) | Soundness check | OPEN — runs in validation phase | All 35 module classes + 5 foundation classes carry `dct:source` resolving to a ratified ODR section URL pattern `<https://w3id.org/opda/odr/ODR-XXXX#section-Ya>`. All Python source files carry a `Realises:` doc-comment header citing ADR-0011 + cited ODRs. |
| (b) | Completeness check | OPEN — runs in validation phase | Self-check in §6 below enumerates each cited ODR's `## Rules` subsections; deferrals named with G-section follow-up. |
| (c) | Cross-ADR consistency check | OPEN — runs in validation phase | ADR-0012 downstream contract: every class emitted here is `sh:targetClass`-able; the three-graph CI test (which ADR-0012 uses) already passes against this emission. |
| (d) | Validation report committed | NOT YET — independent agent spawn | Report writes to `docs/adr/validation/ADR-0011-validation-report.md` per §9.5. |

ADR-0011 remains `status: proposed` per §"Do NOT" rule until the
independent validator commits its report and all four gate items move
to PASS.

## 3. Foundation expansion — UFO meta-classes

`opda:RoleMixin`, `opda:Role`, `opda:Relator` added to `build_classes_graph()`
in `tools/opda-gen/src/opda_gen/emitters/foundation.py`. Each carries full A9
per-kind discipline:

- `rdf:type owl:Class` + `rdfs:label @en` + `rdfs:comment @en` (UFO category
  + IC + hard cases + named usage).
- `skos:scopeNote @en` (Guizzardi 2005 Ch. 4 §4.4 source citation per class).
- `dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2>` (RoleMixin,
  Role) or `<https://w3id.org/opda/odr/ODR-0006#section-Q3>` (Relator).

Foundation version bumped: `owl:versionIRI 0.2.0 → 0.3.0`; generator
`__version__ 0.2.0 → 0.3.0`; foundation source-commit sentinel
`pinned-by-ADR-0009 → pinned-by-ADR-0011`. `dct:modified` left at
`2026-05-27` (no need to bump within one calendar day).

Test `test_foundation_includes_ufo_meta_classes` asserts all five
foundation classes are declared.

## 4. Exemplar coverage matrix

15 exemplars in `source/03-standards/ontology/exemplars/`; every `a opda:X`
typing resolves to a declared class in the corpus.

| Exemplar | opda:X classes used | Modules supplying them |
|---|---|---|
| `chain-of-transactions.ttl` | Person, Property, RegisteredTitle, Transaction, TransactionChain | agent, property, transaction |
| `claim-with-document-evidence.ttl` | Claim, Document, Person, VerificationActivity | claim, agent |
| `claim-with-electronic-record-evidence.ttl` | Claim, ElectronicRecord, Person, VerificationActivity | claim, agent |
| `claim-with-vouch-evidence.ttl` | Claim, Person, VerificationActivity, Vouch | claim, agent |
| `flat-no-uprn-newly-converted.ttl` | LegalEstate, Property, RegisteredTitle | property |
| `flat-with-split-uprn.ttl` | Property, RegisteredTitle, UPRNSuccessionEvent | property |
| `lease-extension-transaction.ttl` | LegalEstate, LeaseExtensionEvent, LeaseTerm, Property, RegisteredTitle, Transaction | property, transaction |
| `listed-building-divergent-addresses.ttl` | Address, LegalEstate, Property, RegisteredTitle | property |
| `organisation-with-merger.ttl` | Organisation | agent |
| `person-with-name-change.ttl` | NameChangeEvent, Person | agent |
| `proprietorship-relator-multi-proprietor.ttl` | Person, Proprietor, Proprietorship, RegisteredTitle | agent, property |
| `registered-freehold-house.ttl` | LegalEstate, Property, RegisteredTitle | property |
| `rural-plot-inspire-no-uprn.ttl` | Address, LegalEstate, Property, RegisteredTitle | property |
| `simple-transaction-with-milestones.ttl` | Buyer, LegalEstate, Person, Property, RegisteredTitle, Seller, Transaction | agent, property, transaction |
| `unregistered-pre-first-registration-house.ttl` | LegalEstate, Property | property |

**Result: 15/15 PASS.** All exemplar `a opda:X` typings resolve to declared classes.

## 5. Soundness self-check — dct:source URLs

Every emitted `owl:Class` cites a ratifying ODR section. Pattern:
`<https://w3id.org/opda/odr/ODR-XXXX#section-Ya>`.

| Module | Classes | dct:source URLs used |
|---|---|---|
| `opda-classes.ttl` (foundation) | DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator | ODR-0004#section-8a, ODR-0004#section-6a, ODR-0006#section-Q2 (×2), ODR-0006#section-Q3 |
| `opda-property.ttl` | Property, LegalEstate, RegisteredTitle, Address, UPRNSuccessionEvent, LeaseTerm, LeaseExtensionEvent | ODR-0005#section-2a, ODR-0005#section-3b (×2), ODR-0005#section-3c, ODR-0015#section-2a, ODR-0005#section-6a, ODR-0007#section-Q5-lease-term |
| `opda-agent.ttl` | Person, Organisation, Seller, Buyer, Proprietor, Proprietorship, NameChangeEvent | ODR-0006#section-Q1 (×2), ODR-0006#section-Q6, ODR-0006#section-Q2 (×3), ODR-0006#section-Q3 |
| `opda-transaction.ttl` | Transaction, Milestone, TransactionChain | ODR-0007#section-Q1, ODR-0007#section-Q2, ODR-0007#section-Q4 |
| `opda-claim.ttl` | Claim, Evidence, DocumentEvidence, Document, ElectronicRecordEvidence, ElectronicRecord, VouchEvidence, Vouch, VerificationActivity, AssuranceLevel, TrustFramework | ODR-0009#section-Q1 (×9), ODR-0009#section-Q3, ODR-0009#section-Q5 |
| `opda-governance.ttl` | DPVMappingRecord, SpecialCategoryScheme | ODR-0018#section-Rule4, https://gdpr-info.eu/art-10-gdpr/ |
| `opda-descriptive.ttl` | Survey, EPCCertificate, Search, Valuation, Comparable | ODR-0008#section-Q4a (×5) |

All sources cite either a ratified ODR section (35/40 classes) or a
regulator-cited external URL (1/40 — `SpecialCategoryScheme → gdpr-info.eu/art-10-gdpr/`)
or an ADR-0004 foundation-pattern section (2/40 — DiagnosticExemplar +
GeneratorRun retained from ADR-0009).

All Python source files under `tools/opda-gen/src/opda_gen/emitters/modules/`
+ `emitters/classes.py` + `emitters/foundation.py` (modified) carry a
`Realises:` doc-comment header citing ADR-0011 + the specific ODRs each
file realises.

## 6. Completeness self-check

For each cited ODR's `## Rules` and `## Operational specifications`
subsections: realised / deferred / N/A.

### ODR-0005 — Property & Land Identity Crux

| Subsection | Status | Artefact |
|---|---|---|
| Rule 1 — Explicit Property class | REALISED | opda:Property in opda-property.ttl |
| Rule 2 — Three-class split | REALISED | Property + LegalEstate + RegisteredTitle all emit |
| Rule 3 — `dash:uniqueValueForClass` on opda:uprn | DEFERRED — ADR-0012 (shapes) | `opda:hasUPRN` declared; SHACL constraint emits in ADR-0012 |
| Rule 4 — `owl:hasKey` optional/secondary | N/A | Annotation-level decision; emit in ADR-0012 if/when used |
| Rule 5 — No `owl:sameAs` | REALISED | `opda:identifiesSameProperty` predicate emitted as canonical alternative; `rdfs:comment` documents the anti-pattern |
| Rule 6 — UPRN as contingent identifier | REALISED | `opda:hasUPRN` comment cites the contingent status; `opda:UPRNSuccessionEvent` class emitted |
| §2a UFO/DOLCE category per class | REALISED | All three classes carry skos:scopeNote citing UFO + DOLCE source |
| §3a IC for opda:Property (five hard cases) | REALISED | rdfs:comment cites the IC + names all five hard cases |
| §3b IC for opda:LegalEstate (five hard cases) | REALISED | rdfs:comment cites the IC + names hard cases |
| §3c IC for opda:RegisteredTitle (five hard cases) | REALISED | rdfs:comment cites the IC + names hard cases |
| §6a UPRN succession SHACL-AF rule | DEFERRED — ADR-0012 | UPRNSuccessionEvent class emitted; the SHACL-AF rule body emits to opda-shapes.ttl via ADR-0012 |
| §6b Address routing to ODR-0015 | REALISED | opda:hasAddress predicate emitted; ODR-0015 §2a Address class emitted |

### ODR-0006 — Agents & Roles

| Subsection | Status | Artefact |
|---|---|---|
| Kind layer: Person + Organisation | REALISED | opda:Person + opda:Organisation in opda-agent.ttl |
| Role layer: Seller + Buyer (RoleMixin); Proprietor (Role) | REALISED | All four; Seller + Buyer subclass opda:RoleMixin; Proprietor subclasses opda:Role |
| Conveyancer, EstateAgent, Surveyor, Lender, Insurer roles | DEFERRED — G11 | Same RoleMixin pattern, not yet exemplar-needed |
| Proprietorship Relator | REALISED | opda:Proprietorship subclasses opda:Relator |
| Capacity split: assertedCapacity + evidencedAuthority | REALISED | Both predicates in opda-agent.ttl |
| SHACL constraints on Seller/Buyer role-play | DEFERRED — ADR-0012 | Class declarations emit; shape constraints emit per ADR-0012 |

### ODR-0007 — Transactions & Lifecycle

| Subsection | Status | Artefact |
|---|---|---|
| Transaction-as-Relator | REALISED | opda:Transaction subclasses opda:Relator |
| Chain as relation between Transactions | REALISED | opda:TransactionChain class; opda:hasChainPosition predicate |
| Milestones + status as Phases | REALISED | opda:Milestone subclasses prov:Activity; status Phase pattern emits as schemes in opda-vocabularies.ttl (ADR-0010) |
| OWL-Time intervals | REALISED | opda:LeaseTerm subclasses time:ProperInterval (in opda-property.ttl) |
| prov:atTime for instants | REALISED | opda:occurredAtTime predicate emitted (informational alias); native prov:atTime used in exemplars |
| SHACL well-formedness | DEFERRED — ADR-0012 | Class declarations emit; shapes per ADR-0012 |
| Single-scheme-vs-per-role status | OPEN — Council follow-up | Per ODR-0007 §Rules itself: "deferred to this ODR's own follow-up council session" |
| Freeze gate | N/A | Council gate, not engineering scope |

### ODR-0008 — Property Descriptive Attributes

| Subsection | Status | Artefact |
|---|---|---|
| Attachment to opda:Property + LegalEstate | REALISED | Property in opda-property.ttl; LegalEstate too; descriptive predicates use `rdfs:domain` to attach |
| Data dictionary as leaf inventory | REALISED upstream | ADR-0010 emits SKOS substrate from data-dictionary-canonical.json |
| Sourcing convention | REALISED | Every minted descriptive datatype property carries dct:source |
| Cross-context reconciliation | REALISED upstream — ADR-0010 vocabularies; this module emits subset of bindings |
| §Q1a — Spanning-leaf detection | DEFERRED — ADR-0012 SHACL shape-target detection |
| §Q2a — Sub-module spawn-triggers | N/A — held-as-live trigger, no spawn fired |
| §Q3a — Citation grain | REALISED | Per-property dct:source emitted; per-overlay array deferred to ADR-0013 |
| §Q4a — Three-criterion class-promotion test | REALISED | Survey, EPCCertificate, Search, Valuation, Comparable all class-promoted in opda-descriptive.ttl; Building + Room held-as-live (commented stubs in source) |
| §Q5a — Datatype-vs-SKOS binding table | PARTIAL — DEFERRED to G11 | builtForm, currentEnergyRating, tenureKind emitted (minimum for exemplars); remaining ~47 leaves DEFERRED to G11 with trigger "as downstream module ADR or overlay profile needs each leaf" |

### ODR-0009 — Claims, Evidence & Provenance

| Subsection | Status | Artefact |
|---|---|---|
| Claim → prov:Entity | REALISED | opda:Claim subclasses prov:Entity |
| Verification → prov:Activity | REALISED | opda:VerificationActivity subclasses prov:Activity |
| prov:used (evidence) | N/A — instance-level; uses PROV-O directly |
| Qualified attribution | N/A — instance-level; uses PROV-O directly |
| Evidence subtypes as prov:Entity subclasses | REALISED | DocumentEvidence + ElectronicRecordEvidence + VouchEvidence emit, plus short-name aliases (Document/ElectronicRecord/Vouch) via owl:equivalentClass |
| prov:wasDerivedFrom + opda:supportedBy convenience | REALISED | opda:supportedBy emitted as Claim → Evidence predicate; PROV-O wasDerivedFrom used natively in exemplars |
| prov:wasInformedBy (chaining) | N/A — instance-level |
| prov:hadPlan (standardised process) | N/A — instance-level |
| 80% boundary + five exceptions (S009 5-residue) | REALISED | opda:AssuranceLevel + opda:TrustFramework + opda:digest emitted as local 5-residue terms |
| SHACL over PROV structure | DEFERRED — ADR-0012 |
| DPV co-annotation | DEFERRED — ADR-0012 emits triples; this module emits mapping records via opda-governance.ttl |

### ODR-0012 — Data Governance Layer

| Subsection | Status | Artefact |
|---|---|---|
| Phase 1 — dpv:hasPersonalData TBox annotation | DEFERRED — ADR-0012 | opda:DPVMappingRecord class in opda-governance.ttl is the data-bearing structure; ADR-0012 emits the actual co-annotation triples into opda-annotations.ttl |
| Reference-not-import for DPV | REALISED | opda-governance.ttl does NOT add `owl:imports <https://w3id.org/dpv/...>`; cites DPV via `dct:references` (on the module IRI) and per-record `opda:baselineCategory` |
| SHACL sensitivity gate | DEFERRED — ADR-0012 |
| Purpose/PD-category SKOS schemes | REALISED upstream — ADR-0010 emits the schemes; opda:SpecialCategoryScheme stub class emitted here |
| Evidence co-annotation cross-ref | REALISED — ClaimDPVMapping individual emits with baselineCategory dpv-pd:OfficialID |
| ODRL Phase-1 absence | N/A — by-design absence; nothing to emit |
| Pandit's live dissent | OPEN — Council follow-up |
| Standing cost on new PII | N/A — governance-process rule, not modelling rule |

### ODR-0015 — Address & Geography

| Subsection | Status | Artefact |
|---|---|---|
| Rule 1 — Explicit Address class | REALISED | opda:Address in opda-property.ttl (with vcard:Address subclass) |
| Rule 2 — UFO Substance Kind / DOLCE NonPhysicalEndurant | REALISED | rdfs:comment + skos:scopeNote cite both |
| Rule 3 — SHACL/DASH discipline per variant | DEFERRED — ADR-0012 |
| Rule 4 — opda:identifiesSameProperty | REALISED | predicate emitted with comment citing |
| Rule 5 — No owl:sameAs | REALISED via Rule 5 inheritance from ODR-0005 |
| Rule 6 — opda:addressVariant required | REALISED | predicate emitted on Address |
| §2a UFO category commitment | REALISED | scopeNote cites |
| §3a IC for opda:Address (five hard cases) | REALISED | rdfs:comment cites all five |
| §3b Class structure with property shapes | DEFERRED — ADR-0012 emits shapes; this module emits class |

### ODR-0018 — DPV Class-Level Co-annotation Pattern

| Subsection | Status | Artefact |
|---|---|---|
| Rule 1 — Class-level baseline declaration | REALISED | PersonDPVMapping, OrganisationDPVMapping, ClaimDPVMapping emitted as mapping records |
| Rule 2 — Variant-conditional refinements | DEFERRED — ADR-0012 emits the triples |
| Rule 3 — DPV annotations in opda-annotations.ttl | N/A — annotation-graph emission is ADR-0012; reference-not-import preserved here |
| Rule 4 — Property-level + class-level co-annotations | REALISED via mapping records |
| Rule 5 — PII-regime-discriminating variant tags | REALISED via mapping records; consumed by ADR-0012 |
| Rule 6 — dct:source on DPV co-annotation | REALISED | Mapping records carry dct:source |
| Rule 7 — ODR-0012 authoring authority | REALISED — pointer to ADR-0012 in module docstring |
| §1a UFO Quality discharge | REALISED — module docstring documents |
| §2a IC over five hard cases | REALISED via DPVMappingRecord class with comment |
| §3a Artefact realisation | REALISED — mapping records emit as the data-bearing structure |

## 7. Surfaced ambiguity

All ambiguities surfaced during implementation were resolved
within-engineering (no Council route required). Per ADR-0011
§"Surfaced ambiguity routing":

| Decision | Choice | Rationale |
|---|---|---|
| LeaseExtensionEvent placement (property vs transaction) | Property | Event mutates LeaseTerm (property/estate attribute) and RegisteredTitle (property-side record); both domains are property-level. The exemplar also co-types the same node as opda:Transaction; that typing is captured by opda-transaction.ttl. |
| Document / Vouch / ElectronicRecord short-name vs long-name | Option (b): `owl:equivalentClass` | Cleanest UFO-aligned binding without touching exemplar source (which is a nested git repo). Long-names (DocumentEvidence etc.) are preserved for downstream shapes + annotations clarity. |
| Q5a binding-table subset | Emit 5 (builtForm, currentEnergyRating, tenureKind, addressVariant + hasUPRN); defer rest to G11 | Sufficient for all 15 exemplars; defer ~47 remaining leaves to G11 trigger "as downstream module ADR or overlay profile needs each leaf" (queued in ADR-0005 §G as new item) |
| dct:source URL fragment naming | `section-Ya` (kebab-style) for ODR §Rules subsections (per ADR-0009 precedent); short `section-Q1` form for ODR §Operational specifications | Matches the ADR-0009 + ADR-0010 precedent. Anchors are not formally specified by the ODRs — engineering convention. |
| Foundation expansion vs per-module emission of UFO meta-classes | Foundation (in `opda-classes.ttl`) | Classes used cross-module belong in foundation; modules then subclass uniformly. Saves three duplicate declarations. |

No Council Author-only amendment recommended.

## 8. Q5a binding-table coverage

ODR-0008 §Q5a names a binding table of ~50 descriptive leaves with
SHACL modelling per UFO category. This module emits the minimum needed
for the 15 diagnostic exemplars + the core opda-property.ttl identity
predicates:

| Leaf | Emitted | Module | Status |
|---|---|---|---|
| `builtForm` | YES | opda-property.ttl | A9 discipline observed |
| `currentEnergyRating` | YES | opda-property.ttl | A9 discipline observed |
| `tenureKind` | YES | opda-property.ttl | A9 discipline observed |
| `addressVariant` | YES | opda-property.ttl | A9 discipline observed (per ODR-0015 Rule 6) |
| `hasUPRN` | YES | opda-property.ttl | A9 discipline observed (per ODR-0005 §6a) |
| `hasAddress` | YES | opda-property.ttl | A9 discipline observed (per ODR-0015 §3a) |
| `councilTaxBand` | NO | DEFERRED — G11 | Trigger: BASPI5 round-trip needs it |
| `centralHeatingFuelType` | NO | DEFERRED — G11 | Trigger: TA6/LPE1 overlay needs it |
| `heatingType` | NO | DEFERRED — G11 | Trigger: TA6/LPE1 overlay needs it |
| `ownershipType` | NO | DEFERRED — G11 | Trigger: TA6 overlay needs it |
| `priceQualifier`, `marketingTenure` | NO | DEFERRED — G11 | Trigger: BASPI5 listing overlay |
| `yesNoNotKnown` (dozens of leaves) | NO | DEFERRED — G11 | Trigger: per leaf as overlay needs |
| `emailAddress`, `postcode` (lexical) | NO | DEFERRED — G11 | Trigger: per leaf as overlay needs |
| `description`, `summary` (free text) | NO | DEFERRED — G11 | Trigger: per leaf as overlay needs |
| ~37 further leaves | NO | DEFERRED — G11 | |

**Coverage: 6 of ~50 emitted (≈12%); 44 of ~50 deferred to G11.**

G11 to queue in `docs/adr/ADR-0005-deferred-work-register.md §G`
post-validation (validator may surface additional items). Recommended
G11 wording:

> **G11.** Full Q5a binding-table emission (~44 leaves). Worker:
> next downstream module ADR or overlay profile. Trigger: as each
> downstream consumer requests a specific leaf. Notes: opda-property.ttl
> currently emits 6 of ~50 leaves. Engineering choice, not Council
> route — engineering decides per-leaf binding (UFO category +
> SHACL modelling) using the §Q5a table as authority.

## 9. Test results

Total tests: 51 (baseline) → 61 (+10 new in `tests/test_modules.py`).
All pass.

```text
tests/test_blank_nodes.py: 4
tests/test_byte_identity.py: 3
tests/test_modules.py: 10  (NEW)
tests/test_serialiser.py: 10
tests/test_term_sourcing.py: 7
tests/test_three_graph.py: 12
tests/test_vocabularies.py: 15
Total: 61
```

New tests in `tests/test_modules.py`:

1. `test_all_six_modules_emit` — §Confirmation #1
2. `test_module_has_owl_ontology_header` — §Confirmation #5
3. `test_a9_per_kind_discipline` — §Confirmation #3
4. `test_three_graph_isolation_per_module` — §Confirmation #4
5. `test_exemplars_parse_against_modules` — §Confirmation #6
6. `test_core_join_predicates_present` — §Confirmation #7
7. `test_byte_identity_modules` — §Confirmation #2
8. `test_foundation_includes_ufo_meta_classes` — foundation expansion
9. `test_emit_module_rejects_unknown_name` — CLI input-validation
10. `test_each_module_self_documents_via_catalogue` — testability discipline

CI: `opda-gen ci-byte-identity` PASS; `opda-gen ci-three-graph` PASS (all 5 checks).

GitHub Actions workflow `.github/workflows/ontology-byte-identity.yml`
extended with per-module byte-identity gates (one per six modules) plus
the existing umbrella diff covering the full corpus.

## 10. Handoff to validator

The validator should spawn independently (NOT the implementing worker
per programme plan §9.2) and verify:

**(a) Soundness check.** Walk every emitted owl:Class + property in the
six module TTLs + the three new foundation classes. For each:

- Extract `dct:source` URI.
- Verify the URI resolves to a ratified ODR section. URL pattern is
  `<https://w3id.org/opda/odr/ODR-XXXX#section-Ya>`; anchors are not
  formally indexed by the ODRs, so verification is by inspection: the
  cited section exists in the ODR document.
- Verify every Python source file under `tools/opda-gen/src/opda_gen/`
  modified by this implementation carries a `Realises:` doc-comment
  header citing ADR-0011 + the specific ODRs.

**(b) Completeness check.** Walk the §6 self-check matrix above. For
each `## Rules` and `## Operational specifications` subsection in each
of the 8 cited ODRs:

- Verify the claimed REALISED items are reflected in the emitted TTL
  (parse `source/03-standards/ontology/opda-<module>.ttl` and check the
  named class/predicate exists).
- Verify the claimed DEFERRED items have named trigger conditions.
- Surface any subsection the worker missed.

**(c) Cross-ADR consistency check.** Simulate ADR-0012's downstream
contract: every class declared by this emission MUST be `sh:targetClass`-
addressable (any future SHACL shape can target it without raising
"unresolved target" violations in the three-graph CI). Test by attempting
the three-graph CI check today (passes); ADR-0012 will populate the
shapes graph against this corpus.

**(d) Validation report.** Write `docs/adr/validation/ADR-0011-validation-report.md`
following the §9.2 template. Verdict: PASS / FAIL / PASS-WITH-FOLLOW-UPS.

Two consecutive FAIL outcomes escalate to a Council Author-only
amendment cycle per ODR-0001 §Self-amendment process.

## Provenance

- Generator version: `opda-gen-0.3.0`.
- Foundation `owl:versionIRI`: `<https://w3id.org/opda/0.3.0/>`.
- Per-module `owl:versionIRI`: `<https://w3id.org/opda/{module}/0.3.0/>`.
- Source commit sentinel: `pinned-by-ADR-0011`.
- Emission date: `2026-05-27`.
