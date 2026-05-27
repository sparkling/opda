# Cagle — Solo position on S011

## Stance summary

ODR-0011 is a **substrate session** (Phase 2.5; Q3 deferred), and my load is the operational underbelly: how do the SKOS schemes actually drive SHACL? My S005 §6a precedent (SHACL-AF rule materialising UPRN succession into the validation report at `sh:Info` severity) re-instantiates here for **code-list lifecycle** (Q5) — when a scheme deprecates a concept, the `sh:in` shape and the deprecation must coexist without either lying to the consumer. Q7 (notation typing) is the other operational hinge: scheme-specific datatypes (`opda:EPCBandLiteral`, `opda:CouncilTaxBandLiteral`) earn their keep ONLY when constraints are checkable at parse-time; for the named schemes, `sh:pattern` on `xsd:string` is sufficient and custom datatypes are over-engineering.

I concur with the ODR-0011 stub's commitment to closed-vs-open SHACL discipline (Q1/Q2 framing — closed schemes get `sh:in`; open schemes do not). My job is to verify it survives **Q5 lifecycle pressure** (deprecation interacts with `sh:in` in a way that is not yet specified) and to push **Q7 notation typing** off the speculative custom-datatype path and onto the operational `sh:pattern` path. Q8 is the B3 typed-output pilot, where my AI-RDF angle (Hellmann et al. DBpedia 2017) reinforces Guizzardi-solo's UFO-category authority: typed scheme-classification is mechanically consumable by `odr-review` lint, SKOS scheme generators, and LLM tooling, in a way that `rdfs:comment` natural-language descriptions are not.

I expect this session clears the gate at the deliberative level. The B3 pilot's load-bearing question (can typed-output drive downstream tooling?) is answerable affirmatively from my operational vantage.

## Per-question positions

### Q1 — Scheme membership criteria

Concur with the ODR-0011 stub: each enum is a `skos:ConceptScheme`; members linked via `skos:inScheme`; one primary scheme per concept (SKOS W3C integrity constraint). Cross-scheme concept identity (e.g. `Freehold` appearing in `ownershipType`, `marketingTenure`, `tenure`) is settled by `skos:exactMatch`/`skos:closeMatch`, NOT by membership in multiple primary schemes.

My operational addition: the SHACL invariant for `skos:inScheme` cardinality MUST be checkable. Sketch:

```turtle
opda:ConceptInExactlyOnePrimarySchemeShape a sh:NodeShape ;
    sh:targetClass skos:Concept ;
    sh:property [
        sh:path skos:inScheme ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Concept {$this} must be in exactly one primary scheme (W3C SKOS integrity constraint)."
    ] .
```

Vote: FOR ODR-0011 stub criteria + SHACL invariant enforcing one primary scheme per concept.

### Q2 — Cardinality (prefLabel / notation / definition)

Concur with the stub: every `skos:Concept` carries `skos:prefLabel @en` (cardinality 1 per language), `skos:notation` (cardinality 1 for the canonical machine code), and `skos:definition` (cardinality 1). SHACL-checkable:

| Predicate | minCount | maxCount per language tag | Severity |
|---|---|---|---|
| `skos:prefLabel` | 1 | 1 | `sh:Violation` |
| `skos:notation` | 1 | 1 (no language tag; `xsd:string` or scheme-specific datatype — see Q7) | `sh:Violation` |
| `skos:definition` | 1 | 1 | `sh:Violation` |
| `skos:altLabel` | 0 | unbounded | (no shape) |

Vote: FOR stub cardinality + the four SHACL shapes above as part of `opda-shapes.ttl`.

### Q4 — Definition source

Concur with stub Rule "Labels and definitions are sourced from the business glossary where the term exists there — adopted verbatim, not paraphrased." The `dct:source` chain (per ODR-0004 §7a five-line precedence) MUST resolve to either a glossary row or a canonical schema-leaf path. Every concept carries `dct:source`; the lint reads it.

My operational additon: the `dct:source` URI for W3C/external-standard concepts (e.g. ISO 3166-1 alpha-3 country codes; SHACL severity terms when used as `notation`) pins the version IRI per ODR-0004 §7a. Generic latest-redirect URIs are forbidden. This applies equally to enum-scheme concepts; the discipline propagates from foundation.

Vote: FOR stub definition-source rule + ODR-0004 §7a URI-discipline carry into concept-level `dct:source`.

### Q5 — Code-list lifecycle (DEPTH — SHACL operationalisation)

This is my territory. The stub commits to closed-vs-open via `sh:in`, but does not specify how deprecation interacts with the `sh:in` shape. Without specification, the operational answer fragments: a closed scheme that deprecates a concept either (a) keeps the deprecated concept in `sh:in`, violating the discipline that NEW data must not use deprecated values; (b) removes the concept from `sh:in`, causing HISTORICAL data carrying the value to fail validation; or (c) does both inconsistently across schemes.

**My push.** The `sh:in` constraint covers **ACTIVE concepts only**. Deprecated concepts are marked `owl:deprecated true` and either:

1. **Substantive succession** (Baker's DCMI "loser is preserved" discipline applied to vocabulary). The deprecated concept carries `dct:isReplacedBy` pointing to the successor concept. Example: if the EPC band scheme were ever re-bucketed (hypothetically — A-G becomes A-F when band G is retired in the 2030s), the deprecated `:EPCBandG` carries `dct:isReplacedBy :EPCBandF`. New data MUST use the successor; historical data carrying the deprecated value is materialised by a SHACL-AF rule (see below) at `sh:Info` severity (not violation — historical data is correct under its temporal scope).

2. **Retirement without succession.** The deprecated concept is removed from `sh:in` outright; no `dct:isReplacedBy`. New data using the retired value is a `sh:Violation`. Historical data carrying the retired value triggers a `sh:Warning`-severity SHACL-AF rule.

**The SHACL-AF rule** (re-instantiating the ODR-0005 §6a pattern for code-list lifecycle):

```turtle
opda:DeprecatedConceptValueRule a sh:NodeShape ;
    sh:targetClass opda:EnumValueBearer ;
    sh:sparql [
        sh:select """
            SELECT $this ?value ?successor WHERE {
                $this ?p ?value .
                ?value owl:deprecated true .
                OPTIONAL { ?value dct:isReplacedBy ?successor }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Node {$this} uses deprecated value {?value}; replaced by {?successor} (if substantive succession)."
    ] .
```

The rule fires `sh:Info` for historical data with substantive succession (`dct:isReplacedBy` present) and `sh:Warning` (variant rule) for historical data with retirement (no `dct:isReplacedBy`). Consumer — LLM or SHACL validator — gets the lifecycle state **as data**, not as natural language buried in `rdfs:comment`. Same DBpedia 2017 lesson as ODR-0005 §6a.

**`sh:in` regeneration discipline.** When a scheme deprecates a concept, the `sh:in` shape MUST be regenerated to exclude the deprecated concept. The generator (per ODR-0004 §6a deterministic emission) does this mechanically: read the scheme's active concepts; emit `sh:in (concept1 concept2 ... conceptN)` excluding any `owl:deprecated true` concept. CI byte-identity test catches drift.

**Three-part operational test for Q5** (falsifiable per ODR-0004 §6a discipline):

1. **Active-concept test.** Data carrying an active concept value MUST produce no violation from the scheme's `sh:in` shape.
2. **Deprecated-with-succession test.** Data carrying a `owl:deprecated true` concept value with `dct:isReplacedBy` MUST produce `sh:Info` from the lifecycle rule (and `sh:Violation` from `sh:in` ONLY for NEW data; historical data scoped via temporal predicate is exempt).
3. **Retired-without-succession test.** Data carrying an `owl:deprecated true` concept value without `dct:isReplacedBy` MUST produce `sh:Warning` from the lifecycle rule + `sh:Violation` from `sh:in` for NEW data.

Vote: FOR closed-vs-open `sh:in` discipline (stub) + my deprecation-vs-`sh:in` operationalisation (active-only `sh:in`; `owl:deprecated true` + `dct:isReplacedBy` for succession; SHACL-AF rule at `sh:Info`/`sh:Warning` for historical traversal).

### Q6 — Namespace

Concur with stub: per-scheme schemes minted under the single `opda:` HASH namespace per ODR-0004 Rule 1. No per-scheme namespaces. Examples: `opda:EPCBandScheme`, `opda:CouncilTaxBandScheme`, `opda:RoleScheme`, etc. Concepts under the same namespace: `opda:EPCBandA`, `opda:CouncilTaxBandI`, `opda:RoleSeller`. No `opda-epc:`, no `opda-ctb:`, no per-form prefixes.

Vote: FOR stub namespace rule.

### Q7 — Notation typing (DEPTH — SHACL operationalisation)

The temptation is to mint scheme-specific datatypes (`opda:EPCBandLiteral` for A-G, `opda:CouncilTaxBandLiteral` for A-I, etc.) so that `skos:notation` carries a typed literal. My position: **decline custom datatypes; use `sh:pattern` on `xsd:string` for lexical-form validation**.

**The discipline.** Scheme-specific datatypes earn their keep ONLY when (a) the lexical form is constrained (regex / `sh:pattern`) AND (b) the constraint is checkable at parse-time (i.e. RDF parsers reject ill-formed literals before SHACL validation runs). For the OPDA stack, condition (b) does not hold: we are not authoring custom datatype parsers, and standard RDF tooling does not support them out of the box. Custom datatypes therefore become decorative — the literal carries an exotic datatype URI, but no parser validates the lexical form, and downstream tooling treats it as `xsd:string` anyway.

**The operational answer.** For EPC band (closed; A-G), `sh:pattern "^[A-G]$"` on `xsd:string`:

```turtle
opda:EPCBandNotationShape a sh:PropertyShape ;
    sh:path skos:notation ;
    sh:datatype xsd:string ;
    sh:pattern "^[A-G]$" ;
    sh:severity sh:Violation ;
    sh:message "EPC band notation must match [A-G]." .
```

For council-tax band (closed; A-I), `sh:pattern "^[A-I]$"` on `xsd:string`. For `ownerType` (closed; {Private/Organisation}), `sh:in` does the work — `sh:pattern` is redundant.

**When custom datatypes WOULD earn their keep.** If the scheme's lexical form encodes a structured value with multiple components (e.g. a date-range, a geographic-coordinate, a code-version-tuple), a custom datatype with a parser is justified. None of ODR-0011's named schemes meet this bar.

**Comparison with `sh:in` for closed schemes.** A closed scheme already has `sh:in` listing the concepts. The `sh:in` constraint targets the concept URI, not the notation literal. The `sh:pattern` constraint targets the notation literal directly. Both fire — `sh:in` for URI membership; `sh:pattern` for notation lexical form. Belt-and-braces; cheap to author; cheap to validate.

**Q7 verdict per scheme** (concur or push):

| Scheme | Stub typing | My recommendation | Rationale |
|---|---|---|---|
| EPC band (A-G; closed) | `xsd:string` | `xsd:string` + `sh:pattern "^[A-G]$"` | Lexical regex sufficient; `opda:EPCBandLiteral` over-engineered |
| Council-tax band (A-I; closed) | `xsd:string` | `xsd:string` + `sh:pattern "^[A-I]$"` | Same |
| `ownerType` ({Private/Organisation}; closed) | `xsd:string` | `xsd:string` + `sh:in` on concept URI (no `sh:pattern` needed) | Set membership over a small enumeration |
| HMLR `classOfTitleCode` (`10`/`20`/`30`/...; closed at any point in time) | `xsd:string` | `xsd:string` + `sh:pattern "^[1-9][0-9]$"` (or `sh:in` on the active set) | Numeric codes; pattern catches lexical errors; `sh:in` catches set drift |
| Fuel types (open) | `xsd:string` | `xsd:string`; no pattern, no `sh:in` | Open-ended; no lexical constraint |

Vote: FOR `xsd:string` + `sh:pattern` (closed lexical-form-constrained schemes); FOR `xsd:string` + `sh:in` on concept URI (closed set-membership schemes); FOR bare `xsd:string` (open schemes). AGAINST scheme-specific custom datatypes.

### Q8 — UFO meta-category per scheme (B3 PILOT — typed-output)

This is the B3 pilot's load-bearing question. The pilot tests whether typed-output (per-scheme UFO category as machine-consumable `opda:ufoCategory` literal) is mechanically consumable by downstream tooling (`odr-review` lint; SKOS scheme generator; LLM consumers). My answer is affirmative on the operational side; I defer to **Guizzardi-solo** on UFO authority for the substantive category assignments.

**My AI-RDF angle.** An LLM consumer querying for "what kind of vocabulary is `role`?" gets a typed answer (`opda:ufoCategory "RoleLabel"`) instead of a natural-language `rdfs:comment`. This is the Hellmann et al. (DBpedia 2017) lesson applied to scheme typing — typed assignments are consumed mechanically; natural-language descriptions are consumed by LLM heuristic fallback, which fails on rename, paraphrase, or translation.

**SHACL operationalisation of Q8.** Each scheme's UFO category drives a different SHACL shape pattern on the data layer (NOT on the scheme itself). The category determines what kind of entity the SHACL targets, where the predicate lives, and what kind of identity criterion applies.

**Per-scheme verdict** (defer to Guizzardi-solo on UFO authority; SHACL angle from me):

| Scheme | UFO category (subject to Guizzardi-solo) | SHACL targeting consequence |
|---|---|---|
| `role` (`Seller`/`Buyer`/`Conveyancer`/...) | `RoleLabel` | SHACL targets the **Role-bearing entity** (the Person/Organisation playing the Role), NOT the scheme itself. The Role concept supplies the Role's label/notation; the Role is an instance of `opda:Role` (per ODR-0006) with `opda:roleNotation` pointing to the SKOS concept |
| `participantStatus` (lifecycle states of a Participant) | `PhaseLabel` | SHACL targets the **Kind in the phase** (the Participant whose current phase is the phase). Lifecycle event records phase entry via reified `prov:Activity` (re-instantiates ODR-0005 §6a PROV-O pattern) |
| EPC band (A-G; quale-in-region) | `QualeInRegion` | SHACL targets the **quale value** (the EPC certificate or property whose efficiency rating is the quale). Range constraints (`sh:pattern "^[A-G]$"`) + region membership (`sh:in` on concept URI) apply |
| Council-tax band (A-I; quale-in-region) | `QualeInRegion` | Same as EPC band; SHACL targets the property whose council-tax band is the quale |
| `verificationMethod` / `evidenceType` codes (provenance methods) | `MethodLabel` / `PlanLabel` | SHACL targets the **activity** (the verification or evidence-collection `prov:Activity`). The method/plan code records which method was used; `prov:used`/`prov:wasGeneratedBy` chains preserve audit trail |
| `tenure` / `ownershipType` (legal-estate kind) | `KindLabel` (subkind discriminator on `opda:LegalEstate`) | SHACL targets the **LegalEstate** (per ODR-0005). The notation refines the LegalEstate's kind without minting a subclass-per-tenure |
| Fuel types / transport types / media types (open; descriptive) | `KindLabel` (open subkind discriminator) | SHACL targets the entity carrying the descriptive attribute (heating system, transport-link, document). Open schemes; no `sh:in` |

**The typed-output contract.** Each `skos:ConceptScheme` carries:

```turtle
opda:RoleScheme
    a skos:ConceptScheme ;
    skos:prefLabel "Role" @en ;
    opda:ufoCategory "RoleLabel" ;
    dct:source <https://path/to/glossary/role-row> ;
    rdfs:comment "..." .  # natural-language gloss; LLM-fallback only
```

The `opda:ufoCategory` literal is the typed assignment. `odr-review` lint reads it. The SKOS scheme generator emits it deterministically per ODR-0004 §6a. LLM consumers query for it via SPARQL. This is the B3 pilot's typed-output verifiable contract.

**B3 verdict criterion.** The pilot succeeds (per ODR-0005 §B2 EXTEND CAUTIOUSLY precedent) if (a) Guizzardi-solo's UFO category assignments per scheme are machine-readable; (b) the `opda:ufoCategory` literal is consumed by at least one downstream tool (lint, generator, or LLM consumer) in the next two sessions; (c) the per-scheme SHACL targeting consequence (my column above) survives an exemplar pass.

Vote: FOR B3 typed-output pilot at the operational level + DEFER to Guizzardi-solo on per-scheme UFO category authority + my SHACL-targeting-consequence column as the operational consumption test.

## Replies to anticipated objections

### Gandon DA — "the SHACL-AF rule for deprecation is gold-plating"

Anticipated attack: *"You re-instantiated the §6a pattern for code-list lifecycle without a consumer that needs the lifecycle materialisation. Deprecation can be expressed inline (`owl:deprecated true` + `dct:isReplacedBy`); a downstream consumer who wants the lifecycle state can SPARQL for it. The SHACL-AF rule adds shape-graph complexity for no operational gain."*

Reply: The consumer is named, and it is the **`odr-review` lint** + **SKOS scheme generator** + **LLM-driven enum-renderer** stack. Without the SHACL-AF rule materialising the deprecation chain into the validation report, the lint must manually SPARQL the deprecation state on every concept check — duplicating work the SHACL validator already does. The rule consolidates the discipline. The DBpedia 2017 lesson applies again: lifecycle state in `rdfs:comment` alone is consumed by LLM heuristics, not by mechanical readers. The rule is the cheapest mechanism to make the discipline checkable AND consumable by downstream tooling.

Withdrawal condition (offered): I withdraw the SHACL-AF rule demand if Gandon produces an operational alternative that (a) makes deprecation state mechanically consumable; (b) does NOT require duplicating SPARQL across each consumer; and (c) survives the historical-data-vs-new-data distinction without ambiguity. (My expectation: he won't; inline `owl:deprecated true` alone fails (b).)

### Guizzardi (potential rebuttal on Q8 SHACL angle)

Possible attack: *"You collapsed the UFO category authority into a SHACL-targeting consequence. The category is ontological; the SHACL targeting is operational. Conflating them undermines the typed-output pilot."*

Reply: Conceded that authority sits with you. My table column is the **operational consequence** of your category assignment, not a substitute for it. The pilot needs both: your typed assignment (substantive — `RoleLabel`/`PhaseLabel`/`QualeInRegion`/`MethodLabel`/`KindLabel`) AND its operational SHACL consumption (mine — what the validator targets, where the predicate lives). One without the other is decorative. Your authority on the category; my contribution on the consumption.

## Cross-references

- My Q5 SHACL-AF rule (deprecation-chain materialisation at `sh:Info`/`sh:Warning`) feeds forward into **ODR-0013** (SHACL Validation & Severity — ratifies severity tier and shape-graph placement) and **ODR-0014** (Vocabulary Catalogue Amendments — the deprecation lifecycle becomes the catalogue's lifecycle template for SKOS vocabularies, not just OPDA-internal schemes).
- My Q7 notation-typing position (`sh:pattern` over custom datatypes) feeds forward into **ODR-0013** (SHACL Validation & Severity — `sh:pattern` shapes per closed scheme) and as a discipline-precedent into **ODR-0008** (Property Descriptive Attributes — when the descriptive-attribute generator encounters a regex-constrained leaf, it emits `sh:pattern` not a custom datatype).
- My Q8 typed-output angle (B3 pilot) feeds forward into **ODR-0010** (Overlay Profile Mechanism — overlay profiles may filter schemes by UFO category) and into the **`odr-review` lint update** flagged in ODR-0004 §Consequences (lint reads `opda:ufoCategory` to verify per-scheme typing).
- ODR-0005 §6a (UPRN succession SHACL-AF rule) is the upstream precedent for both Q5 (lifecycle materialisation) and Q8 (typed-data consumed mechanically by LLM tooling). The discipline propagates: every machine-consumable claim is in a typed predicate, not in `rdfs:comment`.
- ODR-0004 §3a (three-graph separation) constrains where my SHACL-AF rule lives: the `opda:DeprecatedConceptValueRule` sits in `opda-shapes.ttl`, NOT in `opda-annotations.ttl` (the CI test `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns false for it).
