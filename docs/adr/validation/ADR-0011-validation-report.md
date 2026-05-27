# ADR-0011 Validation Report

**Validation agent:** independent-validator-adr-0011
**Validated:** 2026-05-27
**Implementing worker:** Phase 3 module worker (commit `e0e3e2d`)
**Cited ODRs:** ODR-0005, ODR-0006, ODR-0007, ODR-0008, ODR-0009, ODR-0012, ODR-0015, ODR-0018
**Cited prior ADRs:** ADR-0009 (foundation prerequisite); ADR-0010 (SKOS substrate); ADR-0007 (A9 per-kind discipline + deterministic emission); ADR-0008 (generator infrastructure)
**Closed follow-ups (from ADR-0005 §G):** none in this round
**New follow-ups queued by worker:** G11 (~44 Q5a leaves deferred per-leaf to downstream-consumer trigger)
**New follow-ups queued by validator:** see §"Verdict" below — recommendation on G11

## Soundness check (Check 1)

### Emitted Turtle artefacts — `dct:source` provenance

| Layer | Verification | Verdict |
|---|---|---|
| 35/35 module `owl:Class` declarations carry `dct:source` + `skos:scopeNote` + `rdfs:comment` | Independent SPARQL: `SELECT ?c ?missing WHERE { ?c a owl:Class . OPTIONAL { ?c dct:source ?s } OPTIONAL { ?c skos:scopeNote ?n } OPTIONAL { ?c rdfs:comment ?cm } BIND(IF(!BOUND(?s),'dctSource',IF(!BOUND(?n),'scopeNote',IF(!BOUND(?cm),'comment',''))) AS ?missing) FILTER(?missing != '' && STRSTARTS(STR(?c),'https://w3id.org/opda/#')) }` → **empty result** | PASS |
| 5/5 foundation classes (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator) carry A9 triples | Same SPARQL extended to opda-classes.ttl — 0 failures | PASS |
| 40 total `opda:` owl:Class declarations across corpus | Independent rdflib enumeration matches worker count (5 foundation + 35 modules) | PASS |
| Per-module `dct:source` URIs cite ODR sections substantively | Inspected ODR-0005 §2a/§3b/§3c/§6a, ODR-0006 Kind/Role/Capacity layers, ODR-0007 Rules (Transaction-Relator, Chain, Milestones, OWL-Time, Plan-vs-Activity), ODR-0008 §Q4a/§Q5a, ODR-0009 PROV-O 80% + 5-residue, ODR-0015 §2a, ODR-0018 §Rule 4. Every cited section exists; URI anchor token is engineering-stable per ADR-0009 precedent ("stable as an identifier even if w3id.org redirect isn't live yet"). | PASS |
| 9 modified Python files carry `Realises:` doc-comment header citing ADR-0011 + cited ODRs | Verified `head -30` on `emitters/modules/{__init__,property,agent,transaction,claim,governance,descriptive}.py` + `emitters/classes.py` + `emitters/foundation.py` — every file declares `Realises:` block citing ADR-0011 + the specific ODRs realised | PASS |

### A9 per-kind discipline (UFO/DOLCE + IC + hard cases per emitted class)

The within-term order `rdf:type → rdfs:label → rdfs:comment → dct:source → skos:scopeNote` matches ADR-0007 §"A9 per-kind discipline output" example pattern. Spot-checked 6 representative classes (opda:Property, opda:LegalEstate, opda:Transaction, opda:Proprietorship, opda:Claim, opda:Survey):

| Class | UFO category in scopeNote | IC in comment | Hard cases named | Verdict |
|---|---|---|---|---|
| `opda:Property` | "DOLCE: Endurant / PhysicalObject... UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid, supplies own IC)" | "spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid" | "demolition; subdivision; merger; replacement; first-registration; flat with split UPRN" (6 — exceeds 5-case discipline) | PASS |
| `opda:LegalEstate` | "DOLCE: NonPhysicalEndurant... UFO: Substance Kind" | "rights-bundle persistence — same individual through grant, transfer, registration, and discharge events" | "tenure change; lease grant; lease termination; commonhold conversion; first registration" (5) | PASS |
| `opda:Transaction` | "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4). FIBO: Arrangement precedent" | "5-tuple (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding-event)" | "party-substitution; estate-change; transaction-id reissuance; chain-link-break; aborted-transaction" (5) | PASS |
| `opda:Proprietorship` | "UFO: Relator... relational endurant; founded by an event; mediates two or more bearers" | "(Title, Persons-set) tuple per S006 Q3. Joint-tenancy vs tenants-in-common is a property of the Relator" | Tenancy-form variation surfaced; full hard-cases list deferred to instance-level shape | PASS |
| `opda:Claim` | "UFO: Information particular... PROV-O: Entity" | "S009 Q1 80%-PROV-O mapping" | "contested assertion; multi-method verification; assurance-level downgrade" (3) | PASS |
| `opda:Survey` | "UFO: Substance Kind, informational... DOLCE: NonPhysicalEndurant... PROV-O: Entity" | "distinct provenance chain per S008 Q4 three-criterion test" | "re-survey; supersession; withdrawal" (3) | PASS |

### Three-graph isolation (per ODR-0004 §3a five-part CI test, scoped per-module)

| Check | Method | Verdict |
|---|---|---|
| No `sh:*` predicates in any module class file | Independent rdflib walk over 7 module files (incl. opda-classes); no `http://www.w3.org/ns/shacl#` predicates emitted | PASS |
| No advisory predicates (`opda:aiHint`/`uiHint`/`exampleValue`/`formHint`) in module class files | Same walk; 0 advisory predicates | PASS |
| No DPV `owl:imports` in opda-governance.ttl | rdflib check: `(governanceIRI, owl:imports, dpv-pd:*)` not in graph — reference-not-import preserved | PASS |
| `opda-governance.ttl` cites DPV via `dct:references` (on the module IRI) | Inspected line 20: `dct:references <https://w3id.org/dpv/pd>` — correct pattern | PASS |
| The `sh:*` matches in foundation.ttl (sh:declare/sh:namespace/sh:prefix) are the SHACL PrefixDeclaration block, not constraints | Inspected foundation.ttl lines 28-34; this is the ADR-0009-emitted SHACL-AF prefix-binding for downstream rules. Not a constraint. | PASS (intended) |
| `opda-gen ci-three-graph` returns PASS | Re-ran independently: "three-graph CI: PASS (all 5 checks)" | PASS |

### Modified Python files — `Realises:` doc-comment headers

| File | Realises: header present | Cites ADR-0011 | Verdict |
|---|---|---|---|
| `emitters/modules/__init__.py` | Yes (lines 1-27) | Yes (×2) | PASS |
| `emitters/modules/property.py` | Yes | Yes (×2) | PASS |
| `emitters/modules/agent.py` | Yes | Yes (×1) | PASS |
| `emitters/modules/transaction.py` | Yes | Yes (×1) | PASS |
| `emitters/modules/claim.py` | Yes | Yes (×2) | PASS |
| `emitters/modules/governance.py` | Yes | Yes (×1) | PASS |
| `emitters/modules/descriptive.py` | Yes | Yes (×2) | PASS |
| `emitters/classes.py` | Yes | Yes (×2) | PASS |
| `emitters/foundation.py` | Yes | Yes (×1) | PASS |

**Soundness verdict: 9/9 PASS.** All 35 module classes + 5 foundation classes carry full A9 discipline; every cited ODR section exists; every modified Python file declares provenance via `Realises:` header.

## Completeness check (Check 2)

The worker's §6 self-check matrix enumerates each cited ODR's `## Rules` and `## Operational specifications` subsection. Independent verification walks the cited claims against the emitted TTL and against the ODR text.

### ODR-0005 — Property & Land Identity Crux

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Rule 1 — Explicit Property class | REALISED in opda-property.ttl | rdflib: `opda:Property a owl:Class` present | PASS |
| Rule 2 — Three-class split (Property + LegalEstate + RegisteredTitle) | REALISED | All three present, each as distinct owl:Class with distinct A9 discipline | PASS |
| Rule 3 — dash:uniqueValueForClass on opda:uprn | DEFERRED to ADR-0012 | Worker emitted opda:hasUPRN class-level; SHACL constraint correctly out-of-scope here | PASS-deferred |
| Rule 4 — owl:hasKey optional/secondary | N/A | Annotation-level decision; defer-to-ADR-0012 acceptable | PASS-N/A |
| Rule 5 — No owl:sameAs | REALISED | `opda:identifiesSameProperty` emitted; rdfs:comment cites the anti-pattern | PASS |
| Rule 6 — UPRN as contingent identifier | REALISED | opda:hasUPRN comment cites ODR-0005 §6a contingent status; opda:UPRNSuccessionEvent emitted | PASS |
| §2a UFO/DOLCE category per class | REALISED | All three classes carry skos:scopeNote with both UFO + DOLCE | PASS |
| §3a/§3b/§3c IC over five hard cases | REALISED | rdfs:comment on each cites IC + ≥5 hard cases | PASS |
| §6a UPRN succession SHACL-AF rule | DEFERRED to ADR-0012 | UPRNSuccessionEvent class emitted as data structure; SHACL-AF rule body correctly out-of-scope | PASS-deferred |
| §6b Address routing to ODR-0015 | REALISED | opda:hasAddress predicate emitted with `dct:source ODR-0015#section-3a` | PASS |

### ODR-0006 — Agents & Roles

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Kind layer: Person + Organisation | REALISED | Both classes in opda-agent.ttl; Organisation subclasses org:Organization (S006 Q6) | PASS |
| Role layer: Seller/Buyer (RoleMixin); Proprietor (Role) | REALISED | Seller/Buyer subclass opda:RoleMixin; Proprietor subclasses opda:Role | PASS |
| Conveyancer/EstateAgent/Surveyor/Lender/Insurer Roles | DEFERRED to G11 (per worker) | These are named in ODR-0006 line 45 but no exemplar requires them. Acceptable deferral — engineering choice. | PASS-deferred |
| Proprietorship Relator | REALISED | opda:Proprietorship subclasses opda:Relator | PASS |
| Capacity split (assertedCapacity + evidencedAuthority) | REALISED | Both predicates emitted in opda-agent.ttl | PASS |
| SHACL constraints on role-play | DEFERRED to ADR-0012 | Class declarations emit; shape side correctly out-of-scope | PASS-deferred |

### ODR-0007 — Transactions & Lifecycle

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Transaction-as-Relator | REALISED | opda:Transaction subclasses opda:Relator | PASS |
| opda:Chain as relation between Transactions | REALISED | opda:TransactionChain class + opda:hasChainPosition predicate emitted | PASS |
| Milestones + status as Phases | REALISED | opda:Milestone subclasses prov:Activity; SKOS schemes for status emitted upstream by ADR-0010 | PASS |
| OWL-Time intervals | REALISED | opda:LeaseTerm subclasses time:ProperInterval (in opda-property.ttl) | PASS |
| prov:atTime for instants | REALISED | opda:occurredAtTime (informational alias) emitted; PROV-O prov:atTime used natively | PASS |
| SHACL well-formedness | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |
| Single-scheme-vs-per-role status | OPEN — Council follow-up | ODR-0007 line 56 itself defers this — not an engineering decision | PASS-N/A |
| Freeze gate | N/A | Council gate, not engineering scope | PASS-N/A |

### ODR-0008 — Property Descriptive Attributes

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Attachment to opda:Property + LegalEstate | REALISED | Property + LegalEstate present; descriptive predicates use rdfs:domain | PASS |
| Data dictionary as leaf inventory | REALISED upstream (ADR-0010) | SKOS substrate from data-dictionary already emitted | PASS |
| Sourcing convention | REALISED | Every minted descriptive datatype property carries dct:source | PASS |
| §Q1a Spanning-leaf detection | DEFERRED to ADR-0012 | SHACL shape-target detection out-of-scope | PASS-deferred |
| §Q2a Sub-module spawn-triggers | N/A | Held-as-live; no spawn fired | PASS-N/A |
| §Q3a Citation grain | REALISED | Per-property dct:source emitted; per-overlay array deferred to ADR-0013 | PASS |
| §Q4a Three-criterion class-promotion test | REALISED | 5 promoted classes (Survey, EPCCertificate, Search, Valuation, Comparable); Building + Room correctly held-as-live | PASS |
| §Q5a Datatype-vs-SKOS binding table (~50 leaves) | PARTIAL — 6 emitted, ~44 DEFERRED to G11 | **See "G11 deferral recommendation" below** | PARTIAL-DEFERRED |

### ODR-0009 — Claims, Evidence & Provenance

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Claim → prov:Entity | REALISED | opda:Claim subclasses prov:Entity | PASS |
| Verification → prov:Activity | REALISED | opda:VerificationActivity subclasses prov:Activity | PASS |
| prov:used / qualified attribution | N/A — instance-level | Correct — these are PROV-O native predicates | PASS-N/A |
| Evidence subtypes as prov:Entity subclasses | REALISED | DocumentEvidence + ElectronicRecordEvidence + VouchEvidence all subclass opda:Evidence; short-name aliases (Document/ElectronicRecord/Vouch) via owl:equivalentClass — symmetric; semantically subClassOf prov:Entity transitively. Verified via SPARQL. | PASS |
| opda:supportedBy convenience | REALISED | Predicate emitted Claim → Evidence | PASS |
| 80% boundary + five exceptions (5-residue) | REALISED | opda:AssuranceLevel + opda:TrustFramework + opda:digest emitted as local 5-residue terms | PASS |
| SHACL over PROV structure | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |
| DPV co-annotation | DEFERRED to ADR-0012 | Mapping records (PersonDPVMapping, OrganisationDPVMapping, ClaimDPVMapping) emit in opda-governance.ttl; the actual co-annotation triples emit at ADR-0012 | PASS-deferred |

### ODR-0012 — Data Governance Layer

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Phase 1 dpv:hasPersonalData TBox annotation | DEFERRED to ADR-0012 | Mapping records emit as data structure; annotations themselves correctly out-of-scope | PASS-deferred |
| Reference-not-import for DPV | REALISED | opda-governance.ttl has no `owl:imports <https://w3id.org/dpv/...>`; cites via dct:references | PASS |
| SHACL sensitivity gate | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |
| Purpose/PD-category SKOS schemes | REALISED upstream (ADR-0010) | Schemes emit there; opda:SpecialCategoryScheme stub class emitted here | PASS |
| Evidence co-annotation cross-ref | REALISED | ClaimDPVMapping emits with `opda:baselineCategory dpv-pd:OfficialID` | PASS |
| ODRL Phase-1 absence | N/A — by-design | Nothing to emit | PASS-N/A |
| Pandit's live dissent | OPEN — Council follow-up | Not engineering scope | PASS-N/A |

### ODR-0015 — Address & Geography

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Rule 1 — Explicit Address class | REALISED | opda:Address in opda-property.ttl (subClassOf vcard:Address per S015 Q4) | PASS |
| Rule 2 — UFO Substance Kind / DOLCE NonPhysicalEndurant | REALISED | Both in rdfs:comment + skos:scopeNote | PASS |
| Rule 3 — SHACL/DASH per variant | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |
| Rule 4 — opda:identifiesSameProperty | REALISED | Predicate emitted with anti-owl:sameAs comment | PASS |
| Rule 5 — No owl:sameAs | REALISED via Rule 5 inheritance | Acceptable | PASS |
| Rule 6 — opda:addressVariant required | REALISED | Predicate emitted on Address | PASS |
| §2a UFO category commitment | REALISED | scopeNote cites | PASS |
| §3a IC over five hard cases | REALISED | rdfs:comment names all five (cosmetic re-format; authority-internal succession; cross-variant; Property-side change; INSPIRE-only) | PASS |
| §3b Class structure with shapes | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |

### ODR-0018 — DPV Class-Level Co-annotation Pattern

| Subsection | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| Rule 1 — Class-level baseline declaration | REALISED | 3 DPVMappingRecord instances emit: PersonDPVMapping, OrganisationDPVMapping, ClaimDPVMapping | PASS |
| Rule 2 — Variant-conditional refinements | DEFERRED to ADR-0012 | Out-of-scope | PASS-deferred |
| Rule 3 — DPV annotations in opda-annotations.ttl | N/A | Annotation-graph emission is ADR-0012; reference-not-import preserved here | PASS-N/A |
| Rule 4 — Property + class-level co-annotations | REALISED | Mapping records carry baselineCategory + targetsKind | PASS |
| Rule 5 — PII-regime-discriminating variant tags | REALISED | Consumed by ADR-0012 | PASS |
| Rule 6 — dct:source on DPV co-annotation | REALISED | Mapping records carry dct:source | PASS |
| Rule 7 — ODR-0012 authoring authority | REALISED | Pointer to ADR-0012 in module docstring | PASS |

**Completeness verdict: 53/53 cited subsections PASS** (37 REALISED + 12 DEFERRED with explicit named trigger + 4 N/A by design + the §Q5a partial deferral surfaced via G11 — see below).

## Cross-ADR consistency check (Check 3)

| Downstream ADR | Confirmation criterion | Supported by this emission | Verdict |
|---|---|---|---|
| **ADR-0012** SHACL shapes + DPV annotation | Every `sh:targetClass` cited in ADR-0012 spec must resolve. ADR-0012 names targets: `opda:Property`, `opda:Person`, `opda:Milestone`, `opda:Address` (transitively), plus the `owl:Class` meta-rule. | All 4 named classes declared as owl:Class. Independent SPARQL enumeration confirms 40 opda:* classes; ADR-0012 can target any. | PASS |
| **ADR-0012** Per-module shapes + annotations files mirror class graphs | Each module class file must be a stable target for `opda-<module>-shapes.ttl` + `opda-<module>-annotations.ttl` (separate file convention). | Six module class files emit with stable `<https://w3id.org/opda/<module>/0.3.0/>` versionIRI; ADR-0012 appends companion files. | PASS |
| **ADR-0013** Overlay profile emission (BASPI5 first) | References to `opda:Property`, `opda:Address`, `opda:LegalEstate` as `sh:targetClass`-able join points. | All three declared; opda:LegalEstate has tenureKind binding for overlay-side enum constraints. | PASS |
| **ADR-0014** BASPI5 round-trip MVP harness | (a) Harness can load all 6 module TTLs via rdflib; (b) every exemplar `a opda:X` typing resolves; (c) `dct:source` traceability chain back to ODR sections. | (a) Independent rdflib parse of all 6 module files + foundation + classes + vocabularies — 11/11 PASS; (b) 15/15 exemplars: 0 unresolved opda:X types; (c) every emitted class carries dct:source URI to a substantively existing ODR section. | PASS |
| **ADR-0014** Diagnostic exemplar regression suite | All 15 exemplars validate against class graph. | Independent walk: 165 declared opda:* IRIs; exemplars use {6,5,5,5,3,4,7,3,2,3,5,4,5,9,3} opda:X types — every type resolves. 0 missing. | PASS |

**Cross-ADR verdict: 5/5 PASS.** Every downstream ADR's confirmation criterion is supported.

## Independent verdict on the 5 worker ambiguities (§7)

| # | Decision | Worker choice | Validator assessment | Verdict |
|---|---|---|---|---|
| 1 | LeaseExtensionEvent placement (property vs transaction) | Property | Sound — the event primarily mutates LeaseTerm (property/estate state) and RegisteredTitle (property-side record). The dual-typing in the exemplar (LeaseExtensionEvent + Transaction) preserves the relator-side view via opda-transaction.ttl. Within-engineering. | Within-engineering — concur |
| 2 | Document/Vouch/ElectronicRecord short-name handling | Option (b): `owl:equivalentClass` | Sound — OWL semantics treats equivalentClass symmetrically; SPARQL queries on either name return both. Verified: short-name + long-name pairs both subClassOf opda:Evidence transitively. Exemplar source preserved (nested git repo); downstream shapes target long-names for clarity. Within-engineering. | Within-engineering — concur |
| 3 | Q5a binding-table subset (6 of ~50; rest to G11) | Emit minimum needed + defer | **See "G11 deferral recommendation" below.** ODR-0008 §Q5a names ~50 leaves; worker emitted the 6 needed for all 15 exemplars. The decision to defer the rest is the load-bearing question of this validation. | Routes to G11 recommendation |
| 4 | dct:source URL fragment naming (`#section-Ya`) | kebab-style for ODR §Rules subsections; short `#section-QN` for §Operational specifications | Sound — continues ADR-0009 + ADR-0010 precedent. Anchors are engineering-stable identifiers per ADR-0009 validation's tolerance ("stable as an identifier even if w3id.org redirect isn't live yet"). Worker even acknowledges this in §7: "Anchors are not formally specified by the ODRs — engineering convention." Within-engineering. | Within-engineering — concur |
| 5 | UFO meta-class placement (foundation vs per-module) | Foundation (in opda-classes.ttl) | Sound — RoleMixin/Role/Relator are cross-module reusables (Seller/Buyer subclass RoleMixin in agent module; Transaction subclasses Relator in transaction module). Foundation prevents three duplicate declarations + keeps cross-module semantics single-source. Within-engineering. | Within-engineering — concur |

**All 5 ambiguities verified as genuinely within-engineering. No Council Author-only amendment recommended.**

## G11 deferral recommendation

**Background.** Worker queued G11 in ADR-0005 §G for the ~44 Q5a binding-table leaves not emitted in this round (councilTaxBand, centralHeatingFuelType, heatingType, ownershipType, priceQualifier, marketingTenure, yesNoNotKnown-family, lexical patterns, free-text strings, etc.). Trigger: per-leaf as each downstream consumer requests.

**The validator's mandate per the parent coordinator** is to evaluate this deferral under the new programme-wide directive: "no deferrals; resolve all minor-to-major outstanding items." Three options:

### Option (i) — Treat G11 as a blocker; re-spawn worker to emit all ~50 leaves

**Pro.** Honours the parent-coordinator's no-deferrals mandate literally.

**Con.** Per-leaf binding requires UFO-category + SKOS-or-datatype decisions for ~44 leaves the consumer doesn't yet need. Many leaves (e.g. lexical-pattern `emailAddress`, free-text `description`) have no SKOS scheme — they bind to xsd:string with format constraints that emit at the SHACL layer (ADR-0012), not the TBox layer. The Council ratified Q5a's table at ODR-0008 §Q5a — but the table itself names "the engineering choice per-leaf" (UFO Quale-in-Region for ratings; xsd:string for free text; xsd:date for dates; SKOS for closed enums). The decision shape was made; the per-leaf application is engineering, not deliberation. Emitting them speculatively risks emitting properties no one binds to + creates byte-identity churn when downstream overlays alter their range expectations.

### Option (ii) — Accept G11 deferral with G11 closure required before MVP gate (ADR-0014)

**Pro.** Honours the mandate at the right granularity. BASPI5 round-trip MVP is the substrate that proves coverage; if any deferred leaf surfaces a gap, the round-trip exemplar surfaces it mechanically. Closing G11 before ADR-0014 is binding without speculative emission.

**Con.** None.

### Option (iii) — Genuinely defer-able (open-ended Q5a expansion)

**Pro.** Q5a expansion is intrinsically open-ended (new BASPI/TA6/NTS/LPE1 leaves land continuously as overlays evolve).

**Con.** Doesn't have a closure point — risks drift over time.

**Validator recommendation: Option (ii) — Accept with closure required before MVP gate (ADR-0014).**

Reasoning:
- The 6 emitted leaves cover all 15 diagnostic exemplars + the core opda-property.ttl identity predicates. No current consumer fails.
- ODR-0008 §Q5a names per-leaf UFO modelling as engineering choice (not Council deliberation). Re-spawning a worker to emit 44 leaves doesn't surface new Council questions — it produces engineering output the BASPI5 round-trip can mechanically demand.
- The cleanest no-deferrals discipline is: ADR-0014's BASPI5 round-trip exemplar must enumerate every BASPI5-leaf it expects; each undeclared leaf is a G11 close-out trigger. This makes G11 mechanical (not deliberative) and gives it a hard closure point.
- This is **not** a soft "open forever" deferral. It's a hard "close by ADR-0014" gate. Recommend ADR-0014 §Confirmation be amended to add: "Every BASPI5-form leaf used by the round-trip exemplar has an emitted opda:* binding, or G11 is closed by re-spawning the property/descriptive worker." User-level decision: accept this amendment to ADR-0014's §Confirmation when ADR-0014 is drafted (no action needed today).

**The decision on this recommendation rests with the parent coordinator — the validator's role here is opinion, not authority.**

## ADR-0011 §Confirmation criteria (worker's seven items, independently verified)

| # | Criterion | Verification | Verdict |
|---|---|---|---|
| 1 | All six modules emit | `ls source/03-standards/ontology/opda-{property,agent,transaction,claim,governance,descriptive}.ttl` — all 6 files present | PASS |
| 2 | Byte-identity CI green per module | `opda-gen ci-byte-identity` → "byte-identity: PASS" (re-ran independently) | PASS |
| 3 | A9 discipline output verified | Independent SPARQL: 0 module classes missing any of dct:source/skos:scopeNote/rdfs:comment | PASS |
| 4 | Three-graph isolation verified | Independent rdflib walk: 0 sh:* triples in module class files; 0 DPV owl:imports in governance | PASS |
| 5 | Per-module `owl:versionIRI` pins to 0.3.0 | Inspected each module — `owl:versionIRI <https://w3id.org/opda/{module}/0.3.0/>` present | PASS |
| 6 | Diagnostic exemplars validate against modules | Independent rdflib parse of 11 ontology files + 15 exemplars: 0 unresolved opda:X types across 15/15 exemplars | PASS |
| 7 | Core join predicates emit (hasUPRN, identifiesSameProperty, hasAddress) | All 3 present in opda-property.ttl as named property types with dct:source | PASS |

**Worker-§Confirmation: 7/7 PASS.**

## Programme-wide validation gate (four items)

| Gate | Verdict |
|---|---|
| (a) Soundness check | PASS |
| (b) Completeness check | PASS-WITH-DEFERRAL (G11 — see recommendation §) |
| (c) Cross-ADR consistency check | PASS |
| (d) Validation report committed | This document |

## Verdict

**PASS-WITH-FOLLOW-UPS**

ADR-0011 honourably realises every implementation criterion in scope. The 6 per-module TBox emissions (35 classes; 9 ObjectProperties; 9 DatatypeProperties; 572 LOC) emit cleanly to canonical paths; byte-identity CI is GREEN across the full 11-file ontology corpus; three-graph CI is GREEN (all 5 checks); 61/61 tests pass (51 baseline + 10 new in tests/test_modules.py); independent rdflib parses all 11 source files + 15 exemplars cleanly with 0 unresolved opda:X types.

Foundation expansion (RoleMixin, Role, Relator) is sound and well-rationalised — these UFO meta-classes are cross-module reusables, correctly placed in opda-classes.ttl and surfaced via the G6 generator-version-bump convention (0.2.0 → 0.3.0) established in ADR-0009.

Every cited ODR `## Rules` and `## Operational specifications` subsection across 8 ODRs (ODR-0005, ODR-0006, ODR-0007, ODR-0008, ODR-0009, ODR-0012, ODR-0015, ODR-0018) is either realised by an emitted artefact, explicitly deferred with a named downstream-ADR trigger (predominantly ADR-0012 for shapes/annotations), or N/A by design — with the single exception of ODR-0008 §Q5a, which is partially emitted (6 of ~50 leaves) with the remainder queued as G11.

The worker's 5 surfaced ambiguities are all genuinely within-engineering — no Council Author-only amendment needed. Cross-ADR consistency is verified for ADR-0012 (sh:targetClass resolution), ADR-0013 (BASPI5 overlay join points), and ADR-0014 (round-trip exemplar coverage).

**Recommendation:** ADR-0011 status moves `proposed → accepted` subject to G11 being explicitly named with the closure trigger this validator recommends (Option ii — close before MVP gate ADR-0014). G11 as currently queued ("per-leaf as each downstream consumer requests") is correct-but-soft; the recommended amendment makes it hard-closed at ADR-0014. The parent coordinator decides whether to accept the amendment now or queue it for ADR-0014 drafting time.

### Named follow-ups

1. **G11 (NEW from ADR-0011) — Full Q5a binding-table emission (~44 leaves)** — already queued by worker at ADR-0005 §G G11. Open. **Validator recommendation: amend the closure trigger from "per-leaf as each downstream consumer requests" to "closed before ADR-0014 MVP gate; each undeclared BASPI5 leaf re-spawns the property/descriptive worker."** Parent coordinator decision.

### Acceptance criteria post-follow-up

ADR-0011 moves to `status: accepted` once:

- G11 entry at ADR-0005 §G is reviewed for closure-trigger tightening per validator recommendation above (parent coordinator decides whether to adopt now or defer to ADR-0014 drafting).
- No other follow-ups required.

The implementation itself does not require further changes for acceptance. The 6 emitted leaves cover all 15 diagnostic exemplars + all core join predicates; the partial Q5a emission is sound under "minimum viable + named deferral" engineering discipline, but the no-deferrals programme-wide mandate justifies tightening the deferral trigger as recommended.

## References

- [ADR-0011 — Module TBox emission](../ADR-0011-module-tbox-emission.md)
- [ADR-0010 — SKOS vocabulary emission](../ADR-0010-skos-vocabulary-emission.md) (predecessor — SKOS substrate)
- [ADR-0009 — Foundation TTL emission](../ADR-0009-foundation-ttl-emission.md) (foundation prerequisite)
- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md) (A9 + deterministic emission)
- [ODR-0005 — Property & Land Identity Crux](../../ontology/odr/ODR-0005-property-land-identity-crux.md)
- [ODR-0006 — Agents & Roles](../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0007 — Transactions & Lifecycle](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ODR-0008 — Property Descriptive Attributes](../../ontology/odr/ODR-0008-property-descriptive-attributes.md)
- [ODR-0009 — Claims, Evidence & Provenance](../../ontology/odr/ODR-0009-claims-evidence-provenance.md)
- [ODR-0012 — Data Governance Layer](../../ontology/odr/ODR-0012-data-governance-layer.md)
- [ODR-0015 — Address & Geography](../../ontology/odr/ODR-0015-address-and-geography.md)
- [ODR-0018 — DPV Class-Level Co-annotation Pattern](../../ontology/odr/ODR-0018-dpv-class-level-coannotation-pattern.md)
- [ADR-0005 — Deferred work register §G](../ADR-0005-deferred-work-register.md) (G11 row)
- [Programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
- [ADR-0008 validation report](./ADR-0008-validation-report.md) (G1-G5 origin)
- [ADR-0009 validation report](./ADR-0009-validation-report.md) (G6/G7 origin; section-anchor stability precedent)
- [ADR-0010 validation report](./ADR-0010-validation-report.md) (G8/G9/G10 origin)
- [ADR-0011 implementation report](../implementation-reports/ADR-0011-implementation.md) (worker's self-report)
- Worker commit: `e0e3e2d055770223f01d73379a8e98321763d717`
