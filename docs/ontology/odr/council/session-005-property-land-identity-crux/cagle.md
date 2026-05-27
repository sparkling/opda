# Cagle — Solo position on S005

## Stance summary

ODR-0005 is in part **my** session. My S001 Q4 challenge to Guizzardi — *"a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation, what does yours actually do?"* — went unrebutted by name in the S001 transcript (Q4, twelve-voice diagnosis, cure converged with the IC explicitly deferred to this ODR). That challenge stands, it shapes Rule 3 (SHACL/DASH uniqueness primary, checkable) and Rule 4 (`owl:hasKey` optional/secondary), and the unregistered-pre-first-registration exemplar is the proof-by-exemplar I anchored the challenge on.

My load on this session is **depth on Q4** (UPRN's precise operational status — what the validator *fires*, not what reasons), **depth on Q6** (address-as-mode-of-presentation; Guarino's theoretical purity vs SHACL's triple-validating operational reality), and an **amendment on Rule 6** (the literal-pair-vs-reified-event form for UPRN succession is decorative unless backed by a SHACL rule that materialises the succession-chain into the validation report — Hellmann et al. (DBpedia 2017) on LLM consumer fallback to `owl:sameAs` heuristics is the lesson).

I concur with Guarino's framing on Q1 (Endurant commitment) and Q2 (physical IC = spatial-material continuity) with brief notes. I concur with Allemang DA pressure on Q5 (two-class default; raise to three only on exemplar demand) over Hendler-Guizzardi 3-class. I expect this session clears the gate at the deliberative level — the operational mechanisms are implementable now; the namespace-string block from ODR-0004 (`dct:status "draft"` per S004 Knublauch DA primary) remains but does not impede S005's `## Rules` from being mechanically correct.

## Per-question positions

### Q1 — Endurant commitment

Concur with Guarino as Queen. Both classes are Endurants — `opda:Property` is a physical/material Endurant (DOLCE: physical object); `opda:RegisteredTitle` is a legal/institutional Endurant (DOLCE: non-physical endurant; Guarino's "legal-institutional object" subcategory). The Property class is **NOT a process, NOT an event, NOT a quality** — it persists in time and changes its properties without changing identity. The RegisteredTitle class persists across mortgage charges, restrictions, ownership transfers — same title number throughout — making it equally endurant, just in the legal layer rather than the physical layer.

My operational note: the DOLCE category commitment must produce a **machine-readable annotation**, not just a `rdfs:comment`. Specifically: `opda:Property rdfs:subClassOf dolce:PhysicalObject` (or whatever the chosen DOLCE binding is) — so that an LLM consumer querying for "is this a process or a thing?" gets the right answer without parsing natural-language comments. This is the Hellmann et al. (DBpedia 2017) lesson applied to category commitment: if the DOLCE category is in `rdfs:comment` alone, downstream consumers (especially LLMs) fall back on heuristic class-name matching, which fails the moment the class is renamed.

Vote: FOR Endurant commitment + machine-readable DOLCE binding (subclass triple or equivalent).

### Q2 — Identity criterion for physical Property

Concur with Guarino's draft: spatial-material continuity, defined over demolition, subdivision, merger, and rebuild. Spatial extent (the parcel footprint) and material continuity (the same physical structure or the same parcel substrate when the structure is replaced) jointly identify the Property. UPRN is **not** the IC — UPRN is a contingent administrative identifier, as Rule 6 already records.

My operational concern: **spatial-material continuity is not directly SHACL-checkable**. SHACL doesn't reason about spatial continuity; SHACL validates triples. So the IC must be *operationalised* by surrogate predicates the validator can fire on. Candidates:

1. `opda:hasGeometry` (deferred to GeoSPARQL — ODR-0014 / ODR-0015) — when geometry lands, spatial-extent matching becomes a SPARQL-AF rule.
2. `opda:parcelIdentifier` (INSPIRE ID) as a stable proxy for parcel-footprint identity (Land Registry parcel boundaries change rarely; INSPIRE IDs survive demolition + rebuild).
3. UPRN succession (`opda:previousUPRN` + the reified `opda:UPRNSuccessionEvent` from the flat-with-split exemplar) as the explicit reification of "the administrative identifier changed but the physical thing did not".

The IC is **conceptually** spatial-material continuity; the operational checks are these three surrogates. The IC narrative MUST say this explicitly so that downstream sessions (S015 on Address & Geography, S007 on lifecycle/temporal) inherit the surrogate list.

Vote: FOR Guarino's draft IC + surrogate-predicate list.

### Q3 — Identity criterion for RegisteredTitle

Title-register identity is the draft. Concur with the title-number-anchored IC (as recorded in the registered-freehold-house exemplar: `opda:titleNumber "BM123456"`). Three hard cases the IC must answer:

1. **Title closure on first registration of a superior estate.** A leasehold title may be closed when the freehold is later registered and the leasehold falls in; identity ends, not transfers.
2. **Title merger.** Two titles merged into one (HMLR permits this when same registered proprietor consolidates parcels): identity of the merged title is *new*; the two predecessors end. Capture via `prov:wasDerivedFrom` (multiple predecessors).
3. **Transfer between registers.** A title moves from one jurisdiction's register to another (rare in E&W; relevant for cross-border purchases): treat as a `prov:wasInvalidatedBy` on the source register + new identity in the target register.

The operational rule (mine to demand): every title-lifecycle event MUST be captured as a `prov:Activity` with `prov:wasDerivedFrom`/`prov:wasInvalidatedBy` triples — NOT as a `rdfs:comment` describing what happened. The IC over title-closure is then SHACL-checkable: a title with `prov:wasInvalidatedBy` MUST NOT appear as the object of `opda:identifiesSameProperty` to a current Property.

Vote: FOR title-register identity + PROV-O lifecycle reification.

### Q4 — UPRN's status (DEPTH — operational primary)

This is the question where my S001 Q4 challenge to Guizzardi sits. The cure ODR-0005 already names is correct in Rule 3 (`dash:uniqueValueForClass true` on `opda:uprn` is the primary, checkable mechanism) and Rule 4 (`owl:hasKey` optional/secondary). My job this session is to push the **operational primacy** into machine-readable territory.

**My operational primary.** `dash:uniqueValueForClass true` on `opda:uprn` is what the validator *fires* — it produces a violation report when two `opda:Property` instances carry the same UPRN, and it produces **no violation** (graceful degradation) when UPRN is absent. This is the discipline that survives a new-build with no UPRN yet assigned, an unregistered house pre-first-registration (the exemplar), and any case where AddressBase has not yet caught up to the physical reality.

**My `owl:hasKey`-secondary stance.** `owl:hasKey (opda:uprn)` on `opda:Property` is permitted as a **semantic annotation** when UPRN is truly identifying. It is NEVER the sole or primary mechanism. The unregistered-pre-first-registration exemplar (no UPRN at all) is my proof-by-exemplar: a UPRN-keyed Kind whose `owl:hasKey` is empty for half its real-world instances is operationally inert under standard OWL reasoning. Guizzardi himself never rebutted this in S001; the panel converged on the SHACL-primary cure precisely because of it.

**The challenge restated for this session.** A reasoner running against an `owl:hasKey` declaration produces zero output on the unregistered-house exemplar — the key has nothing to bind to. A SHACL validator running `dash:uniqueValueForClass` on the same exemplar produces a clean validation report (no violation, no warning). The SHACL report is *information* — the consumer knows the Property is uniquely identified within the validation scope (because if there were a duplicate, the report would fire). The `owl:hasKey` declaration produces no equivalent information.

**Operational test demands.** Three falsifiable checks that MUST land in ODR-0005's enforcement section:

1. **Duplicate-UPRN test.** Two `opda:Property` instances with the same `opda:uprn` literal MUST produce a `sh:ValidationResult` with `sh:resultSeverity sh:Violation`. Exemplar to add (not in the current three): `duplicate-uprn-data-error.ttl` — two Properties, same UPRN. Expected: one violation.
2. **Graceful-degradation test.** A `opda:Property` with no `opda:uprn` triple MUST produce **no** SHACL violation from `dash:uniqueValueForClass`. The unregistered exemplar already covers this; its `expected-report.ttl` (per ODR-0004 §8a) records an empty `sh:ValidationReport`.
3. **UPRN-succession-chain test.** A `opda:Property` carrying `opda:uprn "100000000222"` AND `opda:previousUPRN "100000000111"` (the flat-with-split exemplar's literal-pair form) MUST be traversable by a SPARQL query that returns both UPRNs as identifying the SAME Property. This is my **amendment proposal** for Rule 6 — see below.

**Amendment proposal for Rule 6 (UPRN succession).** The current Rule 6 says "Model retire/split/merge/re-issue via `prov:wasDerivedFrom` succession." That is correct as far as it goes, but it is **decorative** unless the succession-chain is captured by a SHACL rule that materialises it into the validation report. When the LLM consumer sees `opda:uprn "100070123456"` AND `opda:previousUPRN "100070111111"` on the same Property node:

- (a) The LLM treats both UPRNs as identifying the SAME Property → correct (Rule 6's intent).
- (b) The LLM treats them as identifying DIFFERENT Properties → wrong; the cure fails.

To force case (a), the IC narrative MUST be machine-readable. Concretely: a SHACL-AF `sh:rule` or a SHACL-SPARQL `sh:sparql` constraint on `opda:Property` that materialises the succession-chain. Sketch:

```turtle
opda:UPRNSuccessionRule a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentUPRN ?previousUPRN WHERE {
                $this opda:uprn ?currentUPRN .
                OPTIONAL { $this opda:previousUPRN ?previousUPRN }
            }
        """ ;
        sh:message "Property {$this} has UPRN succession chain: {?currentUPRN} ← {?previousUPRN}"
    ] .
```

The result appears in the validation report as an `sh:Info`-severity entry (NOT a violation — succession is correct behaviour). The consumer — LLM or otherwise — gets the chain *as data*, not as natural language buried in `rdfs:comment`. Hellmann et al. (DBpedia 2017) — when an IC is stated in `rdfs:comment` alone, LLM consumers fall back on `owl:sameAs` heuristics, which is the failure mode Rule 5 (NO `owl:sameAs`) was created to prevent. Without the SHACL rule, the literal-pair form (`opda:previousUPRN` as a bare literal) is decorative against an LLM consumer.

Vote: FOR Rules 3, 4, 6 as drafted + my amendment on Rule 6 (SHACL rule materialising the succession-chain) + the three-part operational test.

### Q5 — Two- vs three-class split

Concur with Allemang DA: default to **two classes** (`opda:Property` + `opda:RegisteredTitle`, where `opda:RegisteredTitle` carries both the legal-estate semantics AND the register-record semantics in one class). Hendler / Guizzardi propose a third class (`opda:LegalEstate` distinct from `opda:RegisteredTitle` — the legal interest as an institutional object distinct from the register's record of it).

My push-back against the three-class option:

1. **Exemplar cost.** Each of the three exemplars adds a third individual + its co-references + its lifecycle properties. Three more triples per exemplar; three more SHACL shapes; three more `expected-report.ttl` rows. The flat-with-split exemplar (already the hardest) becomes substantially harder to author.
2. **Validator cost.** A three-class split adds another `opda:identifiesSame*` predicate, which means more SHACL co-reference shapes, more `sh:targetClass` resolution, more `sh:in` membership checks. The validator cost is non-trivial.
3. **AI-RDF consumer cost.** An LLM querying for "the legal interest in this Property" must now disambiguate `LegalEstate` from `RegisteredTitle` — and the distinction is subtle (the LegalEstate is the *interest*; the RegisteredTitle is the *record of* the interest). LLM consumers will conflate them and produce wrong answers half the time. Better to have one class with a clear definition than two classes with a subtle distinction.

**Demand for raising to three classes.** Show me an exemplar where the two-class split produces a wrong answer that the three-class split corrects. The current three exemplars do not produce such a case — the registered-freehold-house exemplar has one title + one Property + one freehold interest (the legal interest IS the title, for practical purposes); the unregistered exemplar has no legal layer at all; the flat-with-split exemplar has one leasehold title + one Property (the legal interest is the leasehold). None of the three exemplars forces the distinction.

The hard case (Hendler-Guizzardi citing it) is **commonhold** — where a single commonhold parcel has both a unit-title (the flat) and a community-title (the common parts), and the LegalEstate of the unit is distinct from the RegisteredTitle that records it. This case is real but not in our exemplar set. Without the exemplar, the three-class split is speculative.

Vote: **DEFAULT TO TWO CLASSES** + record Hendler-Guizzardi's three-class proposal as a Spawn Rule (per the session-005 plan) — if commonhold or another exemplar forces the third class, spawn ODR-0005a / 0005b. For now, two classes is correct.

### Q6 — Address-as-mode-of-presentation (DEPTH — operational answer to Guarino)

Guarino's framing (S001 Q4): address is "a mode of presentation, not a bearer" — `marketingAddress`, `titleAddress`, `inspireAddress` are not co-identifiers of the Property; they are different ways of presenting/referring to the same physical place. Theoretically clean (this is Frege's sense-vs-reference applied to identifiers); operationally messy.

**My operational push.** SHACL doesn't reason about modes. SHACL validates triples. If `marketingAddress "24 Acacia Avenue"`, `titleAddress "24, Acacia Avenue, Birmingham"`, `inspireAddress "24 ACACIA AVE, BIRMINGHAM B12 9XY"` are all bare literals on the Property node (or on different nodes), the validator cannot tell they refer to the same physical place. The "mode" is invisible to the validator. So Guarino's theoretical purity, taken literally, gives the validator nothing to fire on.

**The operational answer.** Mint `opda:Address` as a resource class (per ODR-0015 — Address & Geography — which is exactly the gate Scope-Check 1 Q7a spawned for this reason). The "mode" is then a property of the address resource, not a separate Kind. Sketch:

```turtle
opda-x:property opda:hasAddress opda-x:address-marketing , opda-x:address-title , opda-x:address-inspire .

opda-x:address-marketing
    a opda:Address ;
    opda:addressLine "24 Acacia Avenue, Birmingham, B12 9XY" ;
    opda:addressVariant "marketing" .

opda-x:address-title
    a opda:Address ;
    opda:addressLine "24, Acacia Avenue, Birmingham" ;
    opda:addressVariant "title" .
```

This makes the "mode of presentation" a **validated** property of the address resource. SHACL can fire on it (`sh:in ("marketing" "title" "inspire" "epc" "billing")`). LLM consumers can query for "all marketing addresses for this Property" via SPARQL. The theoretical purity (Guarino) is preserved because the Address is a resource, not a Kind in its own right — it inherits identity from the Property it presents.

**This is ODR-0015's question, not ODR-0005's.** My contribution here is to push the operational answer into the IC narrative of ODR-0005: **Property does not have an address as a literal; Property `opda:hasAddress` an `opda:Address` resource**. ODR-0015 settles the IC and class commitment for Address; ODR-0005 settles the relation.

Vote: FOR Guarino's mode-of-presentation framing + operational answer via ODR-0015's `opda:Address` resource class + `opda:hasAddress` predicate.

### Q7 — Exemplar pass

Concur with the gate-clearance criteria as written. My operational additions (per Q4):

- **(a) Duplicate-UPRN case.** Not modelled in the current three exemplars, worth noting. Recommendation: add `duplicate-uprn-data-error.ttl` as a fourth diagnostic exemplar (not gate-critical but useful for validating Rule 3's primary mechanism fires correctly). Its `expected-report.ttl` records one `sh:Violation`. Scope this as a deferred amendment; do not block the gate on it.
- **(b) Unregistered case.** The current `unregistered-pre-first-registration-house.ttl` exemplar passes if `dash:uniqueValueForClass true` on `opda:uprn` produces no violation when UPRN is absent (graceful degradation). Expected report: empty `sh:ValidationReport`. This works.
- **(c) UPRN-succession case.** The current `flat-with-split-uprn.ttl` exemplar passes if the SHACL rule from my Q4 amendment fires and materialises the succession-chain into the validation report. **Without my amendment, this case is decorative** — the literal-pair form (`opda:previousUPRN`) appears in the graph but is invisible to the validator and to LLM consumers. With my amendment, the chain is in the report as `sh:Info`.

Vote: FOR exemplar pass criteria + recommend adding `duplicate-uprn-data-error.ttl` as a fourth exemplar + DEMAND my Q4 amendment (SHACL rule for succession-chain materialisation) lands as a Rule 6 refinement.

### Q8 — Gate clearance check

Gate clears at the **deliberative level** with my Q4 amendment landing. The operational mechanisms (`dash:uniqueValueForClass`, the SHACL rule for succession-chain materialisation, the `prov:wasDerivedFrom` chain for UPRN succession) are all implementable now — the W3C SHACL 1.2 spec covers all of them; DASH 0.10 covers `dash:uniqueValueForClass`; SHACL-AF / SHACL-SPARQL covers the rule.

**The namespace-string block stands.** ODR-0004 stays `status: proposed` per Knublauch DA's primary demand (S004 Consequences §"Namespace string is a blocker on `status: accepted`"). ODR-0005 inherits the block via `depends-on: [ODR-0004]`. The generator output for ODR-0005's `opda:Property`, `opda:RegisteredTitle`, etc. carries `dct:status "draft"` in the ontology header until the WG ratifies the namespace string. The deliberative gate (this session's verdict) clears at the `pattern`-level content; the artefact-level acceptance waits on the WG.

**Consequence for downstream sessions.** ODR-0006 (Agents & Roles), ODR-0007 (Transactions & Lifecycle), ODR-0008 (Property descriptive attributes), ODR-0015 (Address & Geography) all unblock at the deliberative level. They can proceed in their planned order (per the followup-sessions plan §5) once this session closes. ODR-0008 inherits the `opda:Property` class and the SHACL primary key from this ODR; ODR-0006 inherits the identity-discipline pattern (SHACL primary; no `owl:sameAs`) for Person/Organisation; ODR-0015 inherits the `opda:hasAddress` relation drafted in Q6.

Vote: **FOR gate clearance at deliberative level** + namespace-string blocker remains per ODR-0004 + downstream sessions unblock at deliberative level.

## Replies to anticipated objections

### Allemang DA on Q4 — "show me a consumer that fails"

Anticipated attack: *"You're spinning up SHACL-AF rules and `dash:uniqueValueForClass` for a consumer that doesn't exist. The PDTF v3 schema has no consumer that actually queries for UPRN succession chains today. This is speculative engineering for a use case nobody has named."*

Reply: The consumer is named, and it is the **LLM consumer** that any AI-RDF-integrated downstream tool will produce. The PDTF v3 record-set is already being consumed by AI tools (transaction-summarisation, due-diligence assistants, valuation comparables). Every one of those tools sees the `previousUPRN` literal and has to decide whether the previous UPRN identifies the same Property. Without the SHACL rule materialising the chain, the LLM falls back on heuristics — most commonly an `owl:sameAs` heuristic — which is exactly what Rule 5 was created to prevent. The DBpedia (Hellmann et al. 2017) lesson is that this failure mode is documented and replicable. The SHACL rule is not speculative; it is the operationalisation of a discipline the ODR already commits to.

Withdrawal condition (offered): I withdraw the SHACL-AF rule demand if Allemang produces an operational alternative that prevents an LLM consumer from treating `opda:uprn` and `opda:previousUPRN` as different identifiers. (My expectation: he won't; the natural-language `rdfs:comment` alternative is exactly the failure mode.)

### Allemang DA on Q5 — "two-class is just dodging"

Possible attack: *"Defaulting to two classes is dodging the hard question. Commonhold is in the PDTF v3 schema; the LegalEstate-vs-RegisteredTitle distinction is real and you're punting it to a spawn rule that may never fire."*

Reply: The spawn rule is the right mechanism precisely because **the third class costs every downstream session and every consumer** if it lands prematurely. The session plan (§Spawn rule) explicitly admits spawning ODR-0005a / 0005b on commonhold-class demand. If commonhold appears in an exemplar within the next two sessions (S006, S007), the spawn fires and we get ODR-0005a for LegalEstate. If it does not, the two-class split is correct for the deliverable scope. Two-class is not dodging; two-class is the smallest commitment that covers the named cases, with an explicit reversion path.

### Guizzardi (rebuttal carryover from S001 Q4)

Anticipated attack: *"`owl:hasKey` is the rigid-Kind discipline; the SHACL primary is operationally fine but it abandons the formal-ontology rigour."*

Reply: I concede the formal-ontology rigour. `owl:hasKey` on a rigid Kind is the cleanest UFO-style commitment. The cure (Rule 4: `owl:hasKey` optional/secondary) preserves it as an annotation where UPRN is truly identifying. The SHACL primary is what *fires* when the rigour fails (no UPRN, duplicate UPRN, succession). Both mechanisms coexist; the primary/secondary ordering is the deliberate hybrid the panel converged on in S001 Q4. My challenge from S001 ("what does yours *do*?") is not a rejection of the rigour; it is a demand that the operational answer be specified alongside it. Rule 3 + Rule 4 + my Q4 amendment together discharge both.

## Cross-references

- My Q4 amendment (SHACL rule materialising the succession-chain) feeds forward into **ODR-0013** (SHACL Validation & Severity — the rule is `sh:Info`-severity by my drafting; ODR-0013 ratifies the severity tier) and **ODR-0010** (Overlay Profile Mechanism — the rule may be included or excluded by profile; the consumer chooses whether it wants the succession chain in its report).
- My Q6 operational answer (`opda:hasAddress` to an `opda:Address` resource) feeds forward into **ODR-0015** (Address & Geography — the IC and Kind/Quale/Mode decision for `opda:Address`) and **ODR-0008** (Property descriptive attributes — the address-bearing property is `opda:hasAddress`, not bare `opda:postalAddress` literals).
- My S001 Q5 dissent (annotation-graph keying, won at S004 Q3) is upstream substrate for the SHACL rule's severity placement — the rule is in the shapes graph (it has `sh:Info` severity, which is still a SHACL result), NOT in the annotation graph. The S004 Q3 keying rule applies: `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns false; the succession-rule sits in `opda:shapes`.
