# Cagle — Solo position on S012

## Stance summary

ODR-0012 is the **Data-Governance Layer** session: Phase 2 governance ratification, dense-PII corpus, lawful-basis class vocabulary, Article-10 special-category gating. My load is **Q5 — the PII automation hook**: a SHACL-AF rule that fires when a predicate's domain class is a known PII-bearing Kind but the predicate lacks a `dpv-pd:hasPersonalDataCategory` triple in `opda-annotations.ttl`. This becomes the **10th citing site of ODR-0017** (the SHACL-AF non-blocking-data-quality-rules pattern); same template as my prior nine; ODR-0012 retrofits `implements: [..., ODR-0017]` when the SHACL Turtle lands.

The other six questions are CONCEDE or DEFER from my chair — Q1 (curated-set scope), Q2 (TBox-expressible lawful-basis vocabulary per Pandit + formal-pair), Q3 (Article-10 depth — with one SHACL severity push), Q4 (ODRL deferral), Q6 (defer to ODR-0016), Q7 (closure of ODR-0009 Q6 + ODR-0018 settled). The session's load-bearing operational decision is whether **PII accretion is mechanically detectable** — Pandit's S001 Q7 "standing cost on new PII" rule is unenforceable without a rule that fires on absent co-annotation. That's what Q5 settles.

I expect this session clears the gate on operationalisation. The DBpedia 2017 lesson (Hellmann et al.) applies once more — PII regime in `rdfs:comment` alone is consumed by LLM heuristic fallback; a typed SHACL-AF assertion is consumed mechanically by the lint, validator, and downstream LLM tooling.

## Per-question positions

### Q1 — Curated-set scope

CONCEDE per Pandit + the formal-pair (Guarino/Allemang). The curated set of PII-bearing Kinds is the union across the four ODR-0018 citing sites: `opda:Person` + identifier predicates (ODR-0006), `opda:Address` + variants (ODR-0015), `opda:RegisteredTitle` (ODR-0005 §3c), Evidence subclasses (ODR-0009 §Q6). The PDTF v3 corpus does not warrant an open-ended scope at Phase 2; closed-curated wins on tractability and on auditability.

Vote: FOR closed-curated scope per Pandit's framing.

### Q2 — TBox-expressible lawful-basis vocabulary

CONCEDE per Pandit. ODR-0018's `opda:DPVMappingTable` is the artefact — variant-to-lawful-basis mapping tables (Address-variant, Title-vs-Estate, Evidence-subtype, Person-identifier-regime) live in `opda-annotations.ttl` as TBox data. The lawful-basis assignment is a **modelling fact about the variant**, not an instance-level decision; ODR-0012's Phase-1 dissent (S001 Q2 carrying live) resolves in favour of Pandit. Instance-level `dpv:hasLawfulBasis` lands at generation time, dispatched from the variant tag by ODR-0004 §6a deterministic emission.

Vote: FOR TBox-expressible lawful-basis vocabulary; the mapping tables ARE the TBox artefact.

### Q3 — Article-10 special-category depth

CONCEDE Pandit's Article-10 depth (`cautionOrConviction`, AML outcomes flagged via `dpv:hasSpecialCategoryPersonalData`) AND add a SHACL severity push:

**Special-category lawful-basis SHACL invariant.** Article 9 GDPR requires special-category PII to carry an **explicit** lawful-basis assignment (Article 9(2) conditions; Article 10 cross-references criminal-conviction data into Article 6 + Article 10 dual-gating). A special-category-flagged predicate without an explicit `dpv:hasLawfulBasis` triple in the mapping table is a `sh:Violation` — NOT `sh:Warning`. The discipline differs from Q5's general PII automation hook (which is `sh:Warning`) because Article 9/10 PII has a higher legal floor.

```turtle
opda:SpecialCategoryWithoutLawfulBasisShape a sh:NodeShape ;
    sh:targetClass dpv:SpecialCategoryPersonalData ;
    sh:sparql [
        sh:select """
            SELECT $this ?predicate WHERE {
                ?predicate dpv:hasSpecialCategoryPersonalData $this .
                FILTER NOT EXISTS { ?predicate dpv:hasLawfulBasis ?lb }
            }
        """ ;
        sh:severity sh:Violation ;
        sh:message "Special-category PII predicate {?predicate} lacks explicit dpv:hasLawfulBasis (Article 9/10 GDPR requires explicit basis)."
    ] .
```

This shape lives in `opda-shapes.ttl` per ODR-0004 §3a three-graph separation. It is NOT an ODR-0017 instantiation (severity is `sh:Violation`, which ODR-0017 Rule 2 forbids); it is an ordinary SHACL Core constraint. The boundary matters — Q5's PII automation hook (next) IS an ODR-0017 instantiation; this Article-9/10 gate is not.

Vote: FOR Pandit's Article-10 depth + my `sh:Violation` special-category-lawful-basis SHACL invariant.

### Q4 — ODRL deferral

CONCEDE. Phase-1 ODRL adoption is catalogue-only per ODR-0012 §Decision (Guarino's S001 contradiction resolution). No `odrl:Policy`/`odrl:Permission`/`odrl:Duty` triples authored in this session. The CI test `ASK { ?p a odrl:Policy } LIMIT 1` MUST return false for Phase-1 conformance — confirms absence-by-design. Re-open when Phase-2 consent receipts or instance-level policy authoring enters scope.

Vote: FOR ODRL deferral; absence-by-design CI test as conformance confirmation.

### Q5 — PII automation hook (LOAD-BEARING; 10th ODR-0017 citing site)

This is my territory. Pandit's S001 Q7 "standing cost on new PII" rule — any new personal-data-bearing field is a governance event requiring Council review — is **unenforceable** without a mechanical detector. A new PII-bearing predicate slipped into `opda-classes.ttl` without a `dpv-pd:hasPersonalDataCategory` triple in `opda-annotations.ttl` is exactly the failure mode the rule guards against; if the only detection mechanism is human review, the standing cost is theatre. The detector is a SHACL-AF rule.

**The SHACL-AF rule** (re-instantiating the ODR-0017 §1a template):

```turtle
opda:PIIWithoutDPVCoAnnotationRule a sh:NodeShape ;
    sh:targetClass opda:PIIBearingKind ;
    sh:sparql [
        sh:select """
            SELECT $this ?predicate ?domain WHERE {
                ?predicate rdfs:domain $this .
                FILTER NOT EXISTS {
                    GRAPH opda:annotations {
                        ?predicate dpv-pd:hasPersonalDataCategory ?cat
                    }
                }
                FILTER NOT EXISTS {
                    GRAPH opda:annotations {
                        $this dpv-pd:hasPersonalDataCategory ?classCat
                    }
                }
            }
        """ ;
        sh:severity sh:Warning ;
        sh:message "PII-bearing Kind {$this} has predicate {?predicate} without dpv-pd:hasPersonalDataCategory co-annotation (S001 Q7 standing-cost rule; ODR-0018 class-level co-annotation absent)."
    ] .
```

**The `opda:PIIBearingKind` marker class.** The curated set from Q1 is materialised as instances of `opda:PIIBearingKind` in the class graph: `opda:Person a opda:PIIBearingKind`; `opda:Address a opda:PIIBearingKind`; `opda:RegisteredTitle a opda:PIIBearingKind`; `opda:DocumentEvidence a opda:PIIBearingKind`; etc. (the four ODR-0018 citing sites' Kind list). The marker is the rule's targeting hook.

**Why `sh:Warning`, not `sh:Violation`.** Per ODR-0017 Rule 2 three-tier severity decision rule: the absence of a DPV co-annotation on a NEW predicate is a **governance event requiring review** (Pandit's S001 Q7 framing), NOT a normative-breaking violation. The rule's purpose is to **surface the omission for Council ratification**, not to block validation. If the Council decides the predicate IS PII-bearing, the missing annotation gets authored; if the Council decides the predicate is NOT PII-bearing, the marker class assignment gets revisited. Either way, the rule fires once and the resolution is recorded; `sh:Warning` is the right tier.

**Comparison with Q3's `sh:Violation` special-category gate.** Q3 fires `sh:Violation` because Article 9/10 PII without lawful-basis is a **normative-legal** failure (GDPR explicit-basis requirement). Q5 fires `sh:Warning` because the omission of co-annotation on a candidate PII predicate is a **governance-procedural** failure (standing-cost review not triggered). Distinct tiers; distinct purposes.

**ODR-0017 instantiation contract.** This rule re-instantiates the ODR-0017 §1a template — the 10th citing site. The discipline:

1. **Rule placement** — `opda-shapes.ttl` (ODR-0017 Rule 3).
2. **`SELECT $this ?predicate ?domain` SPARQL skeleton** — returns target node + materialised assertion (ODR-0017 Rule 4).
3. **Machine-parseable `sh:message`** — `{$this}`, `{?predicate}`, `{?domain}` placeholders consumed by validator + lint + LLM tooling (ODR-0017 Rule 5).
4. **No `owl:sameAs` materialisation** — ODR-0017 Rule 6 (inherits ODR-0005 anti-pattern). The rule materialises `dpv-pd:hasPersonalDataCategory` absence, NOT identity assertions.
5. **`implements: [..., ODR-0017]` retrofit** — ODR-0012 frontmatter adds ODR-0017 to its `implements:` list when the SHACL Turtle lands (Pandit + Author-only follow-up housekeeping per ODR-0017 §Consequences).

**Three-part operational test for Q5** (falsifiable per ODR-0004 §6a discipline):

1. **PII-Kind-with-co-annotation test.** A `opda:PIIBearingKind` instance with all domain predicates carrying `dpv-pd:hasPersonalDataCategory` MUST produce no validation finding from this rule.
2. **PII-Kind-with-missing-co-annotation test.** A `opda:PIIBearingKind` instance with a new domain predicate lacking the co-annotation MUST produce a `sh:Warning` from this rule, with the predicate URI in `sh:resultMessage`.
3. **Non-PII-Kind test.** A class NOT marked `opda:PIIBearingKind` MUST produce no finding from this rule, even if its domain predicates lack DPV co-annotations.

Vote: FOR `opda:PIIWithoutDPVCoAnnotationRule` SHACL-AF rule at `sh:Warning` severity; FOR `opda:PIIBearingKind` marker class materialising the Q1 curated set; FOR ODR-0017 10th-citing-site `implements:` retrofit on ODR-0012.

### Q6 — VC/DID consent receipts

DEFER to ODR-0016 per S001 Q8 and the council-followup plan §W3C VC / DID activation trigger. Phase-1 governance does not require consent-receipt instances; the W3C Verifiable Credentials Data Model + DID Core bindings activate on the trigger conditions documented in the followup plan (S009 Q8 surfaces VC-side decisions OR S012 Phase-2 consent receipts OR a real wallet/DID consumer arrives). Q6 itself is in S012's question set as a flag-for-Phase-2; the actual deliberation routes to ODR-0016.

Vote: DEFER to ODR-0016; no Phase-1 commitment beyond catalogue admission per ODR-0002 (S002 cred:/did: prefixes already admitted).

### Q7 — ODR-0009 Q6 + ODR-0018 closure

CONCEDE — settled by ODR-0009 §Q6 (Evidence subclasses carry class-level DPV baseline; instance-level lawful-basis varies by Evidence-subtype) AND by ODR-0018 §Rule 4 (property-level + class-level co-annotations both admissible). ODR-0012 inherits both as authoring contracts; no new deliberation here. The Author-only retrofit of ODR-0012's `implements:` list to include ODR-0018 lands when the SHACL Turtle lands (per ODR-0018 §Consequences "ODR-0012 inherits this pattern as authoring contract").

Vote: FOR closure; ODR-0009 §Q6 + ODR-0018 settle the question.

## Replies to anticipated objections

### Gandon DA — "the PII automation hook is gold-plating (again)"

Anticipated attack: *"You re-instantiated the ODR-0017 pattern for a 10th time without a downstream consumer that needs the materialised assertion. Pandit's S001 Q7 standing-cost rule can be enforced by Council review at the ODR-ratification stage; the SHACL-AF rule duplicates work the Council already does."*

Reply: The consumer is named — the **`odr-review` lint** + the **`adr-create` skill workflow** + the **/loop fire that triggers between Council sessions**. Council ratification is a discrete event; PII predicates accrete continuously as ontology drafting proceeds between sessions. Without the rule, a predicate added to `opda-classes.ttl` in a between-session edit goes undetected until the next Council convenes; the standing-cost rule fails to fire on the most common failure mode (mid-drafting PII accretion). The rule consolidates the discipline into a mechanical check that fires on every validation pass. This is the **9th ODR-0017 instantiation** — the pattern is well past pilot phase; gold-plating concerns were exhausted at the 4th-citing-site spawn-rule threshold.

Withdrawal condition (offered): I withdraw the SHACL-AF rule demand if Gandon produces an alternative that (a) detects mid-drafting PII accretion mechanically; (b) does NOT require Council convening to fire; (c) survives the new-predicate-without-co-annotation failure mode without ambiguity. My expectation: he won't; Council review alone fails (a) and (b).

### Pandit — "the marker class `opda:PIIBearingKind` duplicates ODR-0018's curated-Kind list"

Anticipated rebuttal: *"You introduced a marker class that re-states the Q1 curated set. The duplication risks drift — the marker class and the ODR-0018 citing-site list could diverge."*

Reply: Conceded the risk; the mitigation is mechanical. ODR-0018 §Rule 1 already mandates that every PII-bearing Kind declares a class-level `dpv-pd:hasPersonalDataCategory` baseline; the `opda:PIIBearingKind` marker is **derived** from that triple, not authored independently. The generator (per ODR-0004 §6a deterministic emission) reads `opda-annotations.ttl` for the class-level baselines and emits `opda:PIIBearingKind` membership in `opda-classes.ttl` for every Kind whose annotation graph carries the baseline. Drift is impossible by construction; the lint verifies the derivation on every CI run.

## Cross-references

- My Q5 SHACL-AF rule (`opda:PIIWithoutDPVCoAnnotationRule` at `sh:Warning`) is the **10th ODR-0017 citing site** — same template as ODR-0005 §6a (UPRN succession), ODR-0011 §5a (concept deprecation), ODR-0015 §4a (INSPIRE/AddressBase succession), ODR-0009 §Q6 (PROV-O Claims/Evidence), and prior six. The retrofit ODR-0012 `implements: [..., ODR-0017]` lands as Author-only housekeeping when the SHACL Turtle lands.
- My Q3 `opda:SpecialCategoryWithoutLawfulBasisShape` at `sh:Violation` is **NOT** an ODR-0017 instantiation (severity tier differs); it is an ordinary SHACL Core constraint. The boundary protects ODR-0017's three-tier severity discipline.
- ODR-0018 §Rule 1 (class-level `dpv-pd:hasPersonalDataCategory` baseline) is the upstream contract that my Q5 rule consumes. ODR-0018 authors the annotation; my rule fires when the annotation is absent on a PII-bearing-Kind predicate. The two ODRs interlock without overlap.
- ODR-0004 §3a (three-graph separation) constrains placement: my Q5 rule sits in `opda-shapes.ttl`; the `dpv-pd:` triples it queries live in `opda-annotations.ttl`; the CI tests on both graphs (ODR-0018 §4a) verify the separation holds.
- ODR-0011 §5a (concept deprecation rule) is my upstream precedent for **`sh:Warning`-tier omission detection** — the deprecation-without-replacement case fires `sh:Warning` for the same reason: omission of substantive succession is a governance-procedural concern, not a normative-breaking violation. The Q5 PII automation hook re-instantiates the discipline at the DPV co-annotation layer.
