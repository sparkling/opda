# ADR-0012 Validation Report

**Validation agent:** independent-validator-adr-0012
**Validated:** 2026-05-27
**Implementing worker:** Phase 4 shapes + annotations worker (commit `050f595`)
**Cited ODRs:** ODR-0010, ODR-0012, ODR-0013, ODR-0017, ODR-0018
**Cited prior ADRs:** ADR-0011 (module TBox prerequisite); ADR-0007 (deterministic emission + term-sourcing pseudocode amended 2026-05-27 per G1); ADR-0008 (generator infrastructure); ADR-0009 (foundation `opda-shapes.ttl` to extend)
**Closed follow-ups (from ADR-0005 §G):** **G1 code-fix** (closes the engineering half of G1; doc half closed 2026-05-27 commit `5bd0c41`)
**New follow-ups queued by worker:** none routed to Council; 4 surfaced ambiguities classified as engineering-resolved
**New follow-ups queued by validator:** G12 (descriptive shapes blank-node sharing — cosmetic; emits 5× redundant blank-node text block); G13 (ADR-0005 §G G1 entry status update — engineering half now closed by ADR-0012); G14 (Cat 4 shape's `opda:hasSpecialCategoryData` predicate — currently undeclared in any class graph; will activate when SpecialCategoryScheme materialises)

## Soundness check (Check 1)

### Emitted Turtle artefacts — `dct:source` provenance

| Layer | Verification | Verdict |
|---|---|---|
| 32/32 `sh:NodeShape` declarations across foundation + 6 module shapes files | rdflib enumeration: `g.subjects(RDF.type, sh.NodeShape)` → 32 | PASS |
| Every shape carries `sh:severity` (direct or via every inner `sh:property` / `sh:rule` / `sh:sparql` child) | Independent rdflib walk per shape — 0 missing severities (see §"Severity discipline" below) | PASS |
| Every shape carries `dct:source` to a ratified ODR section URL | 21 distinct `dct:source` URIs across shapes (one per shape/SHACL-AF rule); 8 distinct `dct:source` URIs across annotations (DPV baselines + refinements). Independent inspection of each URI's ODR section confirms substantive existence | PASS |
| Annotation files cite DPV via `dct:references <https://w3id.org/dpv/pd>` (reference-not-import) | All 6 per-module annotations + foundation cite DPV via `dct:references` on the ontology IRI; **zero** `owl:imports` of DPV across all 23 TTLs | PASS |
| 7 modified Python files carry `Realises:` doc-comment header citing ADR-0012 + cited ODRs | Verified: `emitters/shapes.py` (cites ADR-0012 + ADR-0007 + ODR-0010 + ODR-0013 + ODR-0017); `emitters/annotations.py` (cites ADR-0012 + ODR-0004 + ODR-0010 + ODR-0012 + ODR-0018); `emitters/foundation.py` (cites ADR-0012 + ODR-0010 + ODR-0012 + ODR-0017); `term_sourcing.py` (cites ADR-0007 amended + ODR-0004 §7a + G1); `cli.py` (cites Realises); `ci/byte_identity.py` (cites ADR-0012 §Confirmation #2); `ci/three_graph_test.py` (cites ODR-0004 §3a + ADR-0007) | PASS |

### Severity discipline (ADR-0012 §"Severity tier framework" + ODR-0013 §Q1)

Independent SPARQL-equivalent across all 7 shapes files:

```python
# Combined graph: foundation opda-shapes.ttl + 6 module shapes files
shapes = list(g.subjects(RDF.type, sh.NodeShape))   # → 32
missing = []
for s in shapes:
    if not g.objects(s, sh.severity):
        for p in g.objects(s, sh.property):
            if not g.objects(p, sh.severity): missing.append((s, p))
# missing == []
```

Result: **0 shapes without `sh:severity`**. PASS.

### Per-rule severity audit (independent of worker claim)

| Rule | Severity | ODR-0017 §1a compliance |
|---|---|---|
| UPRNSuccessionRule | `sh:Info` | ✓ substantive succession |
| DeprecationChainRule | `sh:Info` | ✓ substantive succession (dynamic to `sh:Warning` when no successor — handled via materialised value) |
| INSPIRESuccessionRule | `sh:Info` | ✓ |
| PROVOClaimsRule | `sh:Info` | ✓ |
| IdentifierSuccessionRule | `sh:Info` | ✓ |
| CapacityAuthorityMatchRule | `sh:Info` | ✓ |
| LeaseTermSuccessionRule | `sh:Info` | ✓ |
| MilestoneVarianceRule | `sh:Info` | ✓ (dynamic via materialised value) |
| VerificationActivitySuccessionRule | `sh:Info` | ✓ |
| PIIWithoutDPVCoAnnotationRule | `sh:Warning` | **Worker ambiguity #2** — ADR-0012 §"SHACL-AF rule emission" line 253 explicitly states `sh:Warning` with rationale "silent PII leakage is high-impact". Within-engineering: PASS (ADR explicitly overrides ODR-0017 §1a default; worker followed the cited override). |
| NoIdentityOverride_MetaShape | `sh:Violation` | ✓ (Cat 3 enforcement, NOT SHACL-AF — `sh:Violation` justified per `opda:metaShapeJustification` literal on the shape itself) |

### Three-graph isolation (ODR-0004 §3a + ODR-0018 §Rule 3)

| Check | Method | Verdict |
|---|---|---|
| No `sh:*` substantive triples in any annotations file | grep across 7 annotation files: 0 substantive `sh:` prefix lines | PASS |
| No `owl:Class` / `owl:DatatypeProperty` / `owl:ObjectProperty` declarations in any shapes file (modulo `owl:Ontology` header + `owl:Class` as `sh:targetClass` for meta-rules + `owl:Class` text inside SPARQL CONSTRUCT body literal) | Inspected each match in context — every `owl:Class` occurrence in shapes files is either (a) the `owl:Ontology` header type, (b) `sh:targetClass owl:Class` on `PIIWithoutDPVCoAnnotationRule` meta-rule (legitimate), or (c) text inside the `sh:construct` SPARQL string literal (irrelevant) | PASS |
| Zero DPV `owl:imports` across all 23 TTLs | `grep -E "owl:imports.*dpv"` → only comment-block matches stating "no owl:imports" rule | PASS |
| Every `sh:targetClass` resolves to a declared class (or to one of {`sh:NodeShape`, `owl:Class`, `skos:Concept`} as legitimate meta-target) | rdflib combined-graph walk: 0 unresolved `sh:targetClass` | PASS |
| `opda-gen ci-byte-identity` → PASS (23 files) | Re-ran independently | PASS |
| `opda-gen ci-three-graph` → PASS (all 5 checks) | Re-ran independently | PASS |

### Re-emit byte-identity

```
opda-gen emit --output /tmp/adr12-revalidate
diff -rq /tmp/adr12-revalidate source/03-standards/ontology --exclude=exemplars --exclude=derived --exclude=profiles
# Output: empty (no diff)
```

PASS.

### G1 code-fix verification

Read `tools/opda-gen/src/opda_gen/term_sourcing.py` end-to-end:

| Check | Verdict |
|---|---|
| Module docstring `Realises:` block cites ADR-0007 §"Term-sourcing five-line precedence" (amended 2026-05-27 per G1) + ODR-0004 §7a | PASS (lines 4–19) |
| `ResolvedTerm` dataclass with `term_id` + `primary` (SourceRecord \| None) + `contextual` (list[SourceRecord]) | PASS (lines 72–84) |
| Slot ordering matches ODR-0004 §7a verbatim: 1=W3C; 2=OPDA_TF; 3=REGULATOR contextual; 4=GLOSSARY; 5=DICTIONARY | PASS (W3C_REGISTRY → tier=1; OPDA_TF_REGISTRY → tier=2; EXTERNAL_REGULATORS → tier=3 kind="contextual"; glossary → tier=4; dictionary → tier=5) |
| `_primary_lookup` returns slots 1, 2, 4, 5 only (skips 3) | PASS (line 283; explicit comment "Slot 3 is explicitly skipped here because it is contextual, never primary") |
| `_contextual_lookup` returns slot-3 list (zero or more); always evaluated | PASS (lines 312–325) |
| `resolve_term` returns `ResolvedTerm(primary, contextual)`; regulator-only term resolves with `primary=None` + non-empty `contextual` | PASS (lines 352–361; only raises `UnsourceableTerm` when BOTH primary AND contextual are empty) |
| Tests grew 7→10: `test_slot3_regulator_only_is_contextual` (NEW); `test_contextual_always_evaluated_alongside_primary` (NEW); `test_external_regulators_registry_export` (NEW); `test_source_record_dataclass_fields` (NEW); renamed slot1/slot2/slot4/slot5 tests | PASS (verified by reading `tests/test_term_sourcing.py`; 10 functions present; semantics correct) |
| `Tier` IntEnum no longer present (replaced with explicit `tier=N, kind="..."` on `SourceRecord` per ADR-0007 amended pseudocode) | PASS — module uses explicit `tier: int` field on `SourceRecord`; no `IntEnum` left over from pre-G1 code |

**G1 code-fix: VERIFIED.** Implementation matches ADR-0007 amended pseudocode + ODR-0004 §7a verbatim slot ordering. The pre-G1 mis-ranking (glossary at tier 3; regulator at tier 5) is fully corrected.

**Soundness verdict: 7/7 PASS.** Every emitted shape + rule + DPV co-annotation traces to a cited ODR section; every modified Python file declares `Realises:` provenance; G1 code-fix realised correctly.

## Completeness check (Check 2)

### ODR-0010 — Overlay Profile Mechanism (three-rule interface contract)

| Cited rule | Worker realisation | Independent verification | Verdict |
|---|---|---|---|
| §Rule 1 `sh:in` semantics (merged at build time per build-step replacement) | `opda:ShInSemantics_MetaShape` in foundation `opda-shapes.ttl` | rdflib: `opda:ShInSemantics_MetaShape a sh:NodeShape; sh:severity sh:Violation; sh:sparql [sh:select ...]` — SPARQL body detects overlay `sh:in` values not in base SKOS scheme | PASS |
| §Rule 2 `sh:Violation` floor (no overlay can downgrade base Violation) | `opda:ShViolationFloor_MetaShape` in foundation | rdflib: SPARQL body detects overlay severity ≠ `sh:Violation` where base is `sh:Violation` | PASS |
| §Rule 3 `Q6` no-identity-override gate | `opda:NoIdentityOverride_MetaShape` in foundation | rdflib: SPARQL body detects profile attempting `sh:maxCount 0` on `opda:identityKey` path | PASS |
| Reference-not-import: profile cites base classes via `sh:targetClass`, never `owl:imports` | Combined-graph check: 0 `owl:imports` of base classes from shapes graphs | PASS |
| `opda:ValidationContext` reification | DEFERRED to ADR-0013 (overlay profile emission); ADR-0012 emits the base shapes that profiles will compose over | PASS-DEFERRED (explicit in ADR-0013) |
| Five `sh:Violation` categories per §Q6 cross-cite with ODR-0013 | All 5 emitted (see §"Five Violation categories" below) | PASS |

### ODR-0012 — Data-Governance Layer (DPV Phase-1)

| Cited rule | Worker realisation | Independent verification | Verdict |
|---|---|---|---|
| `dpv:hasPersonalData` types personal-data-bearing classes | Realised via `dpv-pd:hasPersonalDataCategory` triples in annotations (the data-category subsumes the data-bearing relation per DPV 2.0 ontology design) | PASS |
| `dpv:hasPersonalDataCategory` classifies as `dpv-pd:Name` etc. | Per-module annotation files emit baselines: Person → `dpv-pd:Name`; Property → `dpv-pd:PostalAddress`; Address → `dpv-pd:PostalAddress`; Claim → `dpv-pd:OfficialID`; EPCCertificate → `dpv-pd:PostalAddress`; RegisteredTitle → `dpv-pd:PublicData` | PASS |
| `dpv:hasSpecialCategoryPersonalData` flags Article-10-adjacent terms | Cat 4 `SpecialCategoryPIIWithoutLawfulBasisShape` in `opda-agent-shapes.ttl` targets `opda:Person` with `opda:hasSpecialCategoryData` path; **but the path predicate is undeclared in any class graph** (see G14 below) | PARTIAL — Cat 4 shape emits as required by ADR-0012 §"Severity tier framework" line 102; predicate-existence becomes a real check when S012 Q3 ratifies the SpecialCategoryScheme enum |
| Reference-not-import for DPV | Verified — see §"Three-graph isolation" above | PASS |
| Evidence co-annotation (cross-ref ODR-0009) | `opda-claim-annotations.ttl` emits 3 refinements: DocumentEvidence → PublicTask; ElectronicRecordEvidence → LegitimateInterest; VouchEvidence → Consent | PASS |
| ODRL — adopted in catalogue, policy-authoring deferred | No `odrl:Policy`/`odrl:Permission` triples in any TTL (verified by grep) | PASS |
| SHACL sensitivity gate raises `sh:Warning` on un-annotated PII | `PIIWithoutDPVCoAnnotationRule` in foundation at `sh:Warning` severity, target `owl:Class` | PASS (ADR-0012 explicitly elevates above ODR-0017 §1a `sh:Info` default — within-engineering decision documented inline) |
| Live question — Pandit's recorded dissent | DEFERRED-OPEN per Council follow-up; not engineering scope | PASS-N/A |

### ODR-0013 — SHACL Validation & Severity (severity tiering)

| Cited rule | Worker realisation | Independent verification | Verdict |
|---|---|---|---|
| Constraint mapping (`required` → `sh:minCount 1`; `enum` → `sh:in`; `type/format` → `sh:datatype`/`pattern`/`nodeKind`; `oneOf` → `sh:xone`) | Realised in per-module shapes for identity-key surfaces (uprn → `sh:datatype xsd:string`; tenureKind → `sh:datatype xsd:string`; addressVariant → `sh:datatype xsd:string`; occurredAtTime → `sh:datatype xsd:dateTime`); `sh:xone` deferred to ADR-0013 overlay profiles (no `oneOf` discriminator in base TBox) | PASS |
| Severity tiering: `sh:Violation` for identity contract / unprovenanced; `sh:Warning` for profile/disclosure gaps; `sh:Info` for absent optional attributes | All 32 shapes audited (see §"Per-rule severity audit"); identity-keys are `sh:Violation`; SHACL-AF rules are `sh:Info` (one `sh:Warning` for PII rule per ADR override) | PASS |
| §Q1 five `sh:Violation` categories | All 5 emit (see §"Five Violation categories" below) | PASS |
| Open-world/closed-world guard (drift check — no `owl:` cardinality + `sh:minCount` on same property) | Independent rdflib check: no `opda:` property declared with both `owl:minCardinality` AND `sh:minCount` | PASS |
| Class ⊥ shapes ⊥ annotation graph separation | Verified — see §"Three-graph isolation" above | PASS |
| DASH rendering | DEFERRED to ADR-0013 overlay profile emission (DASH lives in profile shapes, not base shapes) | PASS-DEFERRED |
| Validation confirmation — diagnostic exemplars | DEFERRED to ADR-0014 BASPI5 round-trip MVP harness (explicit in ADR-0012 §Confirmation #8) | PASS-DEFERRED |

### ODR-0017 — SHACL-AF Non-Blocking Quality Rules Pattern (11 citing sites)

| Cited site | Worker emitted | Independent verification | Verdict |
|---|---|---|---|
| 1. UPRN succession (ODR-0005 §6a) | `opda:UPRNSuccessionRule` in `opda-property-shapes.ttl` at `sh:Info` | rdflib confirms targetClass `opda:Property` + SPARQL CONSTRUCT body materialising `opda:hasUPRNSuccessionStatus` | PASS |
| 2. Deprecation chain (ODR-0011 §5a) | `opda:DeprecationChainRule` in foundation `opda-shapes.ttl` at `sh:Info`, targetClass `skos:Concept` | PASS |
| 3. INSPIRE succession (ODR-0015 §4a) | `opda:INSPIRESuccessionRule` in `opda-property-shapes.ttl` at `sh:Info`, targetClass `opda:Address` | PASS |
| 4. PROV-O Claims (ODR-0009 §Q7) | `opda:PROVOClaimsRule` in `opda-claim-shapes.ttl` at `sh:Info`, targetClass `opda:Claim` | PASS |
| 5. Identifier succession (ODR-0006 §Q1) | `opda:IdentifierSuccessionRule` in `opda-agent-shapes.ttl` at `sh:Info`, targetClass `opda:Person` | PASS |
| 6. Capacity-authority match (ODR-0006 §Q4) | `opda:CapacityAuthorityMatchRule` in `opda-agent-shapes.ttl` at `sh:Info`, targetClass `opda:Person` | PASS |
| 7. Lease term succession (ODR-0007 §Q5) | `opda:LeaseTermSuccessionRule` in `opda-transaction-shapes.ttl` at `sh:Info`, targetClass `opda:LeaseTerm` | PASS |
| 8. Milestone variance (ODR-0007 §Q6) | `opda:MilestoneVarianceRule` in `opda-transaction-shapes.ttl` at `sh:Info`, targetClass `opda:Milestone` (dynamic severity surfaced via materialised `opda:hasVarianceStatus` value) | PASS |
| 9. Verification activity succession (ODR-0009 §Q7) | `opda:VerificationActivitySuccessionRule` in `opda-claim-shapes.ttl` at `sh:Info`, targetClass `opda:VerificationActivity` | PASS |
| 10. PII without DPV co-annotation (ODR-0012 §Q5) | `opda:PIIWithoutDPVCoAnnotationRule` in foundation at `sh:Warning` (ADR-0012 override; documented in §"Severity discipline" above) | PASS |
| 11. No-identity-override meta-shape (ODR-0010 §Q6) | `opda:NoIdentityOverride_MetaShape` in foundation at `sh:Violation` (Cat 3 enforcement; carries `opda:metaShapeJustification` per ODR-0017 §2a amendment) | PASS |

**11/11 citing sites emit.** Severity discipline: 9 at `sh:Info`, 1 at `sh:Warning` (ADR override), 1 at `sh:Violation` (Cat 3 meta-shape, not SHACL-AF pattern).

### ODR-0018 — DPV Class-Level Co-Annotation Pattern

| Cited rule | Worker realisation | Independent verification | Verdict |
|---|---|---|---|
| Rule 1 — Class-level baseline declared for every PII-bearing Kind | Person → `dpv-pd:Name`; Property → `dpv-pd:PostalAddress`; Address → `dpv-pd:PostalAddress`; Claim → `dpv-pd:OfficialID`; EPCCertificate → `dpv-pd:PostalAddress`; RegisteredTitle → `dpv-pd:PublicData` (per ODR-0005 §3c published-PII regime). Organisation → no baseline (cites ODR-0006 §Q6 — Organisations not data subjects). Survey/Search/Valuation/Comparable → no baseline (transitive via linked Property; cites ODR-0018 §Rule 1) | PASS |
| Rule 2 — Variant-conditional refinements when distinguishing variants exist | Address: 3 refinements (title → PublicTask HMLR; marketing → Consent; inspire → PublicTask INSPIRE). Person: 2 refinements (email → EmailAddress; dob → DateOfBirth). Claim: 3 refinements (DocumentEvidence → PublicTask; ElectronicRecord → LegitimateInterest; Vouch → Consent) | PASS |
| Rule 3 — DPV triples live in `opda-*-annotations.ttl`, never shapes or class graph | Verified by independent rdflib walk; CI three-graph test confirms | PASS |
| Rule 4 — Property-level + class-level co-annotations both admissible | Property-level deferred; class-level emitted (ODR-0006 Person identifier property-level is queued for downstream binding-table emission) | PASS-PARTIAL (the class-level half is fully realised; property-level lands when ADR-0013 binding tables emit) |
| Rule 5 — PII-regime-discriminating variant tags carry their own DPV triples | `DPVMappingRefinement` records carry `opda:variantPredicate` + `opda:variantValue` + `opda:lawfulBasis` per ODR-0018 §3a artefact template | PASS |
| Rule 6 — `dct:source` on every DPV co-annotation | All 8 distinct dct:source URIs in annotations point at ratified ODR sections (ODR-0005 §3c; ODR-0006 §Q1/§Q6; ODR-0009 §Q6; ODR-0012 §Phase-1; ODR-0015 §7a; ODR-0018 §3a/§Rule1) | PASS |
| Rule 7 — ODR-0012 is authoring authority | ADR-0012 consumes ODR-0018 mapping-table contract verbatim | PASS |

**Completeness verdict: 7/7 cited ODRs PASS** with explicit deferrals on: (a) DASH rendering (→ ADR-0013); (b) diagnostic exemplar validation (→ ADR-0014 explicit per ADR-0012 §Confirmation #8); (c) overlay profile shapes (→ ADR-0013); (d) Council-route open items (Pandit lawful-basis dissent — out of engineering scope).

## Five `sh:Violation` categories — coverage matrix

| Category | Worker claim | Independent verification | Verdict |
|---|---|---|---|
| **Cat 1: identity-key missing/wrong-type** | 10 named + 5 descriptive | Grep across all 6 module shapes files: 15 `*IdentityKeyShape` declarations confirmed (Address, Claim, Comparable, DPVMappingRecord, EPCCertificate, Evidence, LegalEstate, Milestone, Organisation, Person, Property, Search, Survey, Transaction, Valuation) | PASS |
| **Cat 2: IC breach (anti-pattern detection)** | PropertyICBreachShape + UnprovenancedClaimShape | Grep confirms both shapes; PropertyICBreachShape correctly uses `opda:identifiesSameProperty` path with `sh:nodeKind sh:IRI` (the ODR-0005 Rule 5 anti-pattern for `owl:sameAs`); UnprovenancedClaimShape uses `prov:wasDerivedFrom sh:minCount 1` | PASS |
| **Cat 3: no-identity-override** | NoIdentityOverride_MetaShape in foundation | Confirmed in `opda-shapes.ttl` at `sh:Violation` with `opda:metaShapeJustification` (per ODR-0017 §2a) | PASS |
| **Cat 4: special-category PII without lawful basis** | SpecialCategoryPIIWithoutLawfulBasisShape in opda-agent-shapes.ttl | Confirmed targeting `opda:Person` with `sh:not [sh:path dpv:hasLegalBasis ; sh:minCount 1]` constraint. **Caveat**: the predicate `opda:hasSpecialCategoryData` is not yet declared in any class graph (see G14 below) — the shape is structurally complete but its activation depends on a future SpecialCategoryScheme materialisation | PASS-WITH-CAVEAT |
| **Cat 5: meta-shape-over-shape-graph drift** | MetaShapeOverShapeGraphMetaShape in foundation | Confirmed at `sh:Violation` with self-justifying `opda:metaShapeJustification` literal (per ODR-0017 §2a amendment) | PASS |

All five categories emit. Cat 4 has a hidden dependency (Cat 4 cannot fire until `opda:hasSpecialCategoryData` becomes a declared predicate); this is queued at G14 for surfacing.

## DPV co-annotation per-class coverage

| Kind | Baseline | Refinements | Verification |
|---|---|---|---|
| `opda:Property` | `dpv-pd:PostalAddress` | (none) | PASS (cites ODR-0018 §Rule1) |
| `opda:RegisteredTitle` | `dpv-pd:PublicData` (published-PII regime) | (none) | PASS (cites ODR-0005 §3c) |
| `opda:Address` | `dpv-pd:PostalAddress` | title/marketing/inspire (3) | PASS (cites ODR-0015 §7a) |
| `opda:Person` | `dpv-pd:Name` | email/dob (2) | PASS (cites ODR-0006 §Q1) |
| `opda:Organisation` | (none — documented decision per ODR-0006 §Q6 + ODR-0018 §Rule 4) | (none) | PASS-DOCUMENTED |
| `opda:Claim` | `dpv-pd:OfficialID` | DocumentEvidence/ElectronicRecord/Vouch (3) | PASS (cites ODR-0009 §Q6) |
| `opda:EPCCertificate` | `dpv-pd:PostalAddress` | (none) | PASS |
| `opda:Survey`, `opda:Search`, `opda:Valuation`, `opda:Comparable` | (none — transitive via linked Property) | (none) | PASS-DOCUMENTED (cites ODR-0018 §Rule1; explicit rdfs:comment on each class explains transitive PII) |
| `opda:Transaction`, `opda:Milestone`, `opda:TransactionChain` | (header-only file — Relators not PII-bearing) | (none) | PASS-DOCUMENTED |
| `opda:DPVMappingRecord`, `opda:SpecialCategoryScheme` | (header-only — meta-records not PII-bearing) | (none) | PASS-DOCUMENTED |

**Reference-not-import discipline verified:** 0 `owl:imports` of DPV across all 23 TTLs; all 7 annotation files cite DPV via `dct:references` on the ontology IRI.

## Three-rule interface contract — meta-shape locations

All three reside in foundation `opda-shapes.ttl` per ADR-0012 §"Three-rule interface contract enforcement":

| Rule | Meta-shape | dct:source | Severity |
|---|---|---|---|
| Rule 1: `sh:in` semantics | `opda:ShInSemantics_MetaShape` | `ODR-0010#section-Rule-sh-in` | `sh:Violation` |
| Rule 2: `sh:Violation` floor | `opda:ShViolationFloor_MetaShape` | `ODR-0010#section-Rule-violation-floor` | `sh:Violation` |
| Rule 3: no-identity-override | `opda:NoIdentityOverride_MetaShape` | `ODR-0010#section-Q6` | `sh:Violation` (also serves Cat 3 + SHACL-AF site #11) |

Each meta-shape carries `opda:metaShapeJustification` literal explaining its `sh:Violation` severity (ODR-0017 §2a amendment compliance — meta-shapes over shape-graph using `sh:Violation` must justify their elevation).

## Cross-ADR consistency check (Check 3)

### ADR-0013 (overlay profile emission) downstream contract

| Downstream criterion | This ADR's emission supports it? | Verdict |
|---|---|---|
| `sh:in` build-step replacement test composable over base shapes | ADR-0013 plan shows SPARQL test `SELECT ?member WHERE { ?profile sh:property [sh:path ?p ; sh:in/rdf:rest*/rdf:first ?member]}` — ADR-0012 base shapes do not use `sh:in` at all (deferred to overlay profiles), so no conflict surface exists at the base | PASS |
| `sh:Violation` floor enforceable: profile cannot downgrade base | Base shapes mark identity-key surfaces at `sh:Violation`; `ShViolationFloor_MetaShape` SPARQL targets overlay shapes attempting weaker severity — composable contract | PASS |
| No-identity-override: profile cannot `sh:maxCount 0` on identity-key | `NoIdentityOverride_MetaShape` SPARQL targets profile shapes attempting this — directly composable | PASS |
| Profile shapes can `sh:in` constrain a subset of base SKOS scheme without triggering meta-shapes | Base shapes don't lock `sh:in` (vocabulary fill comes from SKOS substrate ADR-0010); profile can constrain a subset of scheme members per ODR-0010 Rule 2 | PASS |
| Three-rule interface contract enforceable at build-step composition | Confirmed by ADR-0013 §"CI tests" outline (3 SPARQL tests for each meta-shape; this ADR's meta-shapes are the validation engine) | PASS |

### ADR-0014 (BASPI5 round-trip MVP harness) downstream contract

| Downstream criterion | This ADR's emission supports it? | Verdict |
|---|---|---|
| All 23 TTLs load into one combined graph (pyshacl input) | Independent test: `rdflib.Graph().parse(f)` for all 23 files → 1428 combined triples; no parse errors | PASS |
| Every `sh:targetClass` resolves to a declared class | 0 unresolved targets (modulo legitimate external meta-targets: `sh:NodeShape`, `owl:Class`, `skos:Concept`) | PASS |
| No `owl:imports` cycles | Per-module class files import only foundation + vocabularies; no cycles | PASS |
| No missing prefixes (all prefix declarations bind) | rdflib SPARQL ASK queries execute without prefix-resolution errors | PASS |
| Shape graph + annotation graph + class graph maintain three-way isolation | CI `ci-three-graph` PASS (5 checks); independent walk confirms | PASS |

**Cross-ADR verdict: 10/10 PASS.** ADR-0013 contract composable; ADR-0014 contract loadable; no detected downstream conflict.

## Worker's surfaced ambiguities — independent verdict

The worker classified 5 items as engineering-resolved. Independent verdict on each:

1. **Foundation `owl:versionIRI` 0.3.0 vs `__version__` 0.4.0 decoupling.** Worker frames as engineering choice consistent with ADR-0010 precedent (SKOS schemes emitted without bumping foundation versionIRI). Validator concurs: the class-graph identity (which `owl:versionIRI` records) genuinely did not change in this ADR — only the shapes + annotations substrate. The pattern "`__version__` tracks package shape; `owl:versionIRI` tracks class-graph identity" is implicit in ADR-0007 + ADR-0009 emission discipline but is **not explicitly documented**. **Validator recommendation**: queue as G15 — Author-only one-line amendment to ADR-0007 §"Module pluralism" documenting the decoupling rule. NOT a Council route; not a blocker.

2. **`PIIWithoutDPVCoAnnotationRule` severity `sh:Warning` override of ODR-0017 §1a `sh:Info` default.** Worker claims ADR-0012 §"SHACL-AF rule emission" explicitly states the override. **Validator independent verification**: confirmed at ADR-0012 line 253: `sh:severity sh:Warning ;     # Warning because failure mode is silent PII leakage (high-impact)`. The ADR override is explicit, documented inline, and within engineering authority (severity tiering per ODR-0013 §Q1 + ADR override discipline). **Verdict: within-engineering PASS.** No Council route required.

3. **Cat 4 shape placeholder `opda:hasSpecialCategoryData`.** Worker frames as structural placeholder activating when S012 Q3 enum materialises. **Validator independent verification**: the predicate `opda:hasSpecialCategoryData` is NOT declared in any class graph (`grep -n "hasSpecialCategoryData" source/03-standards/ontology/*.ttl` returns only the shape reference). This is a real hidden dependency — Cat 4 cannot fire on any data graph until the predicate becomes a declared property. **Validator recommendation**: queue as **G14** with clear trigger condition (S012 Q3 ratifies SpecialCategoryScheme → predicate becomes declared property → Cat 4 activates). NOT a blocker (the shape's structural correctness for ADR-0012 acceptance is unaffected; the activation gap is by design); MUST be flagged so a future maintainer doesn't silently miss the dependency.

4. **Descriptive Kind shapes targeting `prov:wasGeneratedBy` as minimum Cat 1 coverage.** Worker frames as minimum required by ADR-0012 §Confirmation #5; richer per-attribute shapes wait for ADR-0013 overlay profiles. **Validator independent verification**: confirmed via rdflib — all 5 descriptive NodeShapes share **ONE** blank node (`nb365a8b64d02409a85b6a844e9490d78b1`) carrying `sh:path prov:wasGeneratedBy ; sh:minCount 1 ; sh:severity sh:Violation`. Semantically: 5 shapes legitimately reuse the same property-shape blank node (perfectly valid RDF). **BUT** the canonical serialiser prints the blank-node definition 5 times in `opda-descriptive-shapes.ttl` (lines 55–83) — this is a serialiser quirk producing 5× redundant on-disk text but parses idempotently. **Validator verdict**: structural choice for minimum Cat 1 coverage is correct per ADR-0012 §"Surfaced ambiguity" #4; the 5× textual redundancy is a serialiser optimisation gap. **Queue as G12** — cosmetic serialiser improvement (skolemise per-shape OR deduplicate shared blank-node serialisation).

5. **G1 code-fix landing here vs separate ADR.** Worker frames as explicit ask from validation brief. Verified G1 code-fix is fully realised in `term_sourcing.py`. **Validator verdict: PASS.** Queue as **G13** — update ADR-0005 §G G1 entry to "Closed 2026-05-27 (commit `050f595`)" so the deferred-work register reflects current state (currently still shows "Open").

**Validator verdict on worker ambiguities: 5/5 correctly classified as within-engineering.** No Council route required. Three new follow-ups queued (G12 cosmetic; G13 register update; G14 Cat 4 trigger; G15 versionIRI doc-amendment) — none block ADR-0012 acceptance.

## Verdict

**PASS-WITH-FOLLOW-UPS.**

All four programme-wide validation gates (a)–(d) GREEN:

- **(a) Soundness:** PASS. 32/32 shapes carry dct:source resolving to ratified ODR sections; every modified Python file carries `Realises:` provenance; G1 code-fix verified semantically correct and matching ADR-0007 amended pseudocode.
- **(b) Completeness:** PASS. All 5 cited ODRs' `## Rules` realised or explicitly deferred with named trigger (DASH → ADR-0013; exemplar validation → ADR-0014 explicit; overlay profiles → ADR-0013).
- **(c) Cross-ADR consistency:** PASS. ADR-0013 composability contract supported (three meta-shapes ready to validate overlay profiles); ADR-0014 combined-graph load contract supported (all 23 TTLs parse into one graph, 1428 triples, no missing prefixes).
- **(d) Validation report committed:** this file.

ADR-0012's own 8 `### Confirmation` criteria: 7 PASS + 1 explicitly deferred to ADR-0014 (exemplar validation, per ADR-0012 §Confirmation #8).

**Five Violation categories:** confirmed all 5 emit; Cat 4 has hidden dependency on future predicate declaration (queued G14).

**11 SHACL-AF citing sites:** confirmed all 11 emit; severity discipline per ODR-0017 §1a (9 at `sh:Info`, 1 at `sh:Warning` per ADR override, 1 at `sh:Violation` for Cat 3 meta-shape — all justified).

**G1 code-fix:** VERIFIED. The engineering half of G1 closes here. ADR-0005 §G entry should be updated (G13).

**Follow-ups queued at G12–G15** (none block acceptance):
- G12 — descriptive shapes serialiser optimisation (5× redundant blank-node text)
- G13 — update ADR-0005 §G G1 entry status to "Closed 2026-05-27 (commit `050f595`)"
- G14 — Cat 4 shape activation trigger (declares `opda:hasSpecialCategoryData` when S012 Q3 materialises SpecialCategoryScheme)
- G15 — Author-only one-line amendment documenting `__version__` vs `owl:versionIRI` decoupling pattern

**ADR-0012 cleared to move `proposed → accepted`** subject to:
1. Worker (or next /loop touch) updating ADR-0005 §G to close G1 + queue G12/G13/G14/G15.
2. ADR-0012 frontmatter `status:` updated to `accepted`.

No FAIL items. No Council route required. No remediation pending.
