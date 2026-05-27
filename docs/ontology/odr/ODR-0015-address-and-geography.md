---
status: proposed
date: 2026-05-27
kind: pattern
tags: [address, geography, reuse, module, gate, council-cleared, namespace-blocked]
scope:
  - pdtf-v3:propertyPack.address
  - pdtf-v3:propertyPack.uprn
  - pdtf-v3:propertyPack.inspireId
  - pdtf-v3:propertyPack.titleAddress
  - pdtf-v3:propertyPack.marketingAddress
  - pdtf-v3:participants.address
  - pdtf-v3:energyEfficiency.certificate.address
  - pdtf-v3:chain.onwardPurchase.address
  - pdtf-v3:verifiedClaims.verification.evidence.document.issuer.address
council: session-015
supersedes: []
depends-on: [ODR-0004, ODR-0005]
implements: [ODR-0003, ODR-0017, ODR-0018]
---

# Address & Geography

## Context

`Address` is the most-reused subject in the PDTF v3 corpus. The base schema and overlays touch it from at least five distinct contexts — property identification (with UPRN and INSPIRE Identifier), participant contact, evidence-document issuer, chain transactions, EPC certificate location — yet no current ODR declares it. Plan §4.1 routes "Address class location" as a shared question between ODR-0006 (Agents & Roles) and ODR-0008 (Property descriptive attributes); Scope-Check 1 (2026-05-26) ruled 8-1 that this is the wrong forum and that Address requires its own ODR.

The defect mirrors the implicit-Property defect that ODR-0005 cured: a heavily-reused entity with no declaring module produces three risks. (1) Three modules independently invent overlapping `Address` classes and a Phase-2 reconciliation has to merge them. (2) The most-cited URI gets fixed by the first consumer who happens to need it — the URI-persistence failure the W3C TAG explicitly warns against. (3) The relationship between physical address (where post is delivered), legal-title address (what the Land Registry holds), marketing address (how an agent presents the property), and INSPIRE Identifier (a spatial-feature pointer) is collapsed into one slot rather than modelled as the distinct things they are.

The hard question is not "what fields does an Address class carry?" but **what is an Address, ontologically?** Guarino's session-001 Q4 argument about UPRN ("a mode of presentation, not a bearer") applies here at one layer of remove. Three UFO readings are live: Address as **Kind** (a substance with its own identity criteria, independent of any Property it locates — the INSPIRE Address-as-feature position); as **Quale-in-a-Region** (a value in a spatial-presentation region, a structured datatype, no identity, no co-reference across rows — the present 0008 default); as **Mode** (a particularised property inhering in a Property Kind, no identity independent of it but reified enough to bear its own predicates). The three give different answers on multi-address properties, marketing-vs-title-address co-reference, and `uprn`-linked vs `inspireId`-linked records. The choice is gate-shaped: it cascades into ODR-0006 (participant addresses), ODR-0008 (property addresses), ODR-0009 (evidence-issuer addresses), ODR-0012 (DPV PII tags on address fields).

Geography is admitted in the same ODR. GeoSPARQL was deferred in ODR-0002; this ODR is the home for that deferral and for `geoX`/`geoY`/INSPIRE polygons / `titleExtents` GeoJSON / search polygons / plot boundaries when their consumers (overlays beyond BASPI5; Local Land Charges) enter scope.

## Decision

Adopt **`opda:Address` as a UFO Substance Kind / DOLCE NonPhysicalEndurant** (settled by [Council Session 015](./council/session-015-address-and-geography.md); Queen Guizzardi; DA Allemang; Phase 2.6 gate; 5 of 8 questions WITHDRAWN by DA, 3 CONCEDED, 1 HELD as live dissent on Q3 class-structure with named re-open trigger). Each instance carries an **`opda:addressVariant`** property tagging context-of-presentation (`"title" | "marketing" | "inspire"`) as a UFO Quality particularising the instance within the Kind. The Guarino S001 Q4 "address is a mode of presentation, not a bearer" framing is preserved as the *semantic content* of the variant tag, not as the UFO meta-category. The IC is **structural composition + context-tag-scoped persistence** over five named hard cases. Class structure is **class with property shapes** (`opda:line1` / `opda:line2` / `opda:postTown` / `opda:postcode` / `opda:country` as SHACL property constraints, all `sh:minCount 0`); the MUST-have predicates are `opda:addressVariant` and `opda:identifiesSameProperty`. Joined to `opda:Property` via `opda:hasAddress` (pre-committed in ODR-0005 §6b).

**Why this revises the S005 Q6 Mode-only stance.** The exemplar evidence (rural-plot INSPIRE-only locatedness) + external-standards alignment (INSPIRE Annex I models Address as a feature; vCard models it as a class; OS AddressBase Plus is record-based) + DPV class-level dispatch (Baker+Pandit S005 Q6 constraint requires `rdf:type opda:Address` discrimination for ODR-0012 co-annotation) together force a Kind reading that the Mode-only framing could not deliver.

Geography (GeoSPARQL, INSPIRE polygons) is admitted as an *interface* (`opda:hasGeometry`); encoded geometries land via one of four named admission triggers as consumers materialise.

## Rules

**Settled rules** (ratified by [Council Session 015](./council/session-015-address-and-geography.md); per ODR-0001 A9 §Per-kind discipline, the (a)/(b)/(c) operational specifications below are inline in `## Rules` because ODR-0015 is `kind: pattern`):

1. **Explicit Address class.** The most-reused entity in the PDTF v3 corpus is restored to its own class with its own URI. No implicit-Address; no Address-as-key on Property.
2. **`opda:Address` is a UFO Substance Kind / DOLCE NonPhysicalEndurant** (Sortal, Rigid, supplies own IC) — §2a below.
3. **Operational key is SHACL/DASH discipline per variant.** `dash:uniqueValueForClass` on `opda:inspireFeatureId` for the `"inspire"` variant; on `opda:uprn` for variants where AddressBase-issued UPRN is present; structural-composition match for `"marketing"` and `"title"` variants. All fields `sh:minCount 0` (graceful degradation when fields absent — e.g. rural plot INSPIRE-only case).
4. **`opda:identifiesSameProperty` MUST be present** on every Address instance (the S005-ratified co-reference predicate; Address always locates *some* Property).
5. **No `owl:sameAs`** across address surfaces (inherits ODR-0005 Rule 5 anti-pattern).
6. **`opda:addressVariant` MUST be present** on every Address instance (one of `"title" | "marketing" | "inspire"`); the variant tag is a UFO Quality particularising the Address within the Kind, encoding Guarino's S001 Q4 "mode of presentation" framing as the variant's semantic content.

**Anti-patterns (forbidden):**

- `owl:sameAs` between any two `opda:Address` instances (inherits ODR-0005 Rule 5).
- Address-as-IC for `opda:Property` (Guarino S001 Q4 unanimous; ODR-0005 §Rule 6 / 6b).
- Address-as-key for `opda:Property` (would produce false-positive violations on similar-but-not-identical strings, false-negative misses on multi-presentation cases).
- Cross-variant identity-claim — two `opda:Address` instances with different `opda:addressVariant` values can co-refer but are never the same individual, even on byte-identical structural fields (Q2 IC rule 3).

### Operational specifications (added by [Session 015](./council/session-015-address-and-geography.md))

Session 015 (Reduced Council; two-artefact discipline per B2-pilot EXTEND-CAUTIOUSLY recommendation from S005; Queen Guizzardi; DA Allemang — 5 withdrawn / 3 conceded / 1 held-as-live on Q3) discharges A9 §Per-kind discipline (b) inline. The numbered rules above carry; the operational specifications below state (a) UFO/DOLCE meta-category, (b) IC over named hard cases, (c) artefact realisation.

#### 2a. UFO/DOLCE category commitment (S015 Q1)

`opda:Address` commits to **UFO Substance Kind / DOLCE NonPhysicalEndurant** (Searle 1995 legal-institutional-like object — Address is a socially-recognised locator constructed by an authority and persists as a record-entity in that authority's stewardship). The `opda:addressVariant` property is a UFO Quality particularising the Kind. `dct:source` on the class commitment resolves to Guizzardi 2005 Ch. 4 (UFO) + Masolo et al. 2003 D18 §4.2 (DOLCE) per Baker DCMI discipline from S005.

**Machine-readable binding** (Cagle amendment from S005 Q1):

```turtle
opda:Address a owl:Class ;
    rdfs:subClassOf dolce:NonPhysicalEndurant , vcard:Address ;
    opda:ufoCategory "SubstanceKind" ;
    dct:source <http://www.loa.istc.cnr.it/dolce/dolce-ultralite.owl> ,
               <https://www.w3.org/TR/vcard-rdf/> ,
               <https://www.inf.ufes.br/~gguizzardi/ufo.owl> ;
    rdfs:comment "A socially-recognised locator constructed by an authority (Royal Mail / OS AddressBase / HMLR / INSPIRE) and persisting as a record-entity in that authority's stewardship; particularised by addressVariant context-tag." .
```

#### 3a. IC for `opda:Address` over five named hard cases (S015 Q2)

IC = **structural composition + context-tag-scoped persistence**. Authoritative source: the authority of the `opda:addressVariant` (HMLR for `"title"`; listing agent for `"marketing"`; OS AddressBase / Land Registry INSPIRE polygon feed for `"inspire"`).

An `opda:Address` `a₁` at time `t₁` and a candidate-individual `a₂` at time `t₂ > t₁` are the same individual iff (i) their `opda:addressVariant` values are equal AND (ii) their authoritative source's record asserts continuity from `a₁` to `a₂`, under these rules:

1. **Cosmetic re-format.** Same authority, same record-lineage, different presentation (punctuation, capitalisation, line breaks) → same individual. IC reads authority's lifecycle judgement, not lexical form.
2. **Authority-internal succession.** Same authority, new record with `prov:wasDerivedFrom` to predecessor (HMLR title-plan correction; OS AddressBase row-replacement; agent's listing re-issue) → new individual with `prov:wasDerivedFrom` to predecessor.
3. **Cross-variant identity-claim.** Two instances with *different* `opda:addressVariant` values are **never** the same individual, even on byte-identical structural fields — they co-refer (`opda:identifiesSameProperty` the same Property) but remain distinct (distinct provenance, lifecycle, PII regime).
4. **Property-side change.** Bearer Property undergoes a ODR-0005 §3a hard-case event (demolition / subdivision / merger / replacement) → Address instances persist or cease per authority's response (OS AddressBase retires UPRN and issues new; HMLR amends title-address descriptor; etc.).
5. **INSPIRE-only locatedness.** Property with INSPIRE Identifier but no postal address has **one** `opda:Address` instance: `addressVariant "inspire"`, `opda:inspireFeatureId` populated, structural fields empty or sparse (cadastral feature may have no derivable line1/postcode), `opda:hasGeometry` interface live, no marketing/title variants.

#### 3b. Class structure with property shapes (S015 Q3)

`opda:Address` is a resource class with its own URI; structural fields are SHACL property shapes constraining the resource. **Rejected:** structured-datatype-as-primary (admissible only as derived denormalised convenience via `opda:formattedString xsd:string` computed from structural fields).

```turtle
opda:AddressShape a sh:NodeShape ;
    sh:targetClass opda:Address ;
    sh:property [ sh:path opda:line1     ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:line2     ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:postTown  ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:postcode  ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:country   ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:addressVariant ; sh:in ("title" "marketing" "inspire") ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:identifiesSameProperty ; sh:class opda:Property ; sh:minCount 1 ; sh:maxCount 1 ] .
```

**All structural fields `sh:minCount 0`** to accommodate INSPIRE-only-locatedness (Q2 rule 5) and AddressBase-lag cases (rural plot, newly-converted flats with pending UPRN issuance).

**Held-as-live dissent (Allemang DA on Q3).** Recorded in §Consequences with named re-open trigger.

#### 4a. External alignment (S015 Q4)

Three alignments adopted:

- **INSPIRE Identifier as contingent identifier.** `opda:inspireFeatureId` on `opda:Address` (variant `"inspire"`) — re-instantiating ODR-0005 §6a UPRN-as-Quality pattern. `dash:uniqueValueForClass` on `opda:inspireFeatureId` for the variant; `prov:wasDerivedFrom` for succession (rare per HMLR INSPIRE polygon feed governance).
- **`vcard:Address` for personal-contact reuse.** `opda:Address rdfs:subClassOf vcard:Address`. Reuse one-directional: vCard consumers read OPDA addresses; OPDA does not consume vCard-only structural extensions (`vcard:hasGeo` superseded by `opda:hasGeometry` interface).
- **OS AddressBase Plus as authority-source.** `dct:source` resolves to OS AddressBase Plus record (URN-shaped per ODR-0004 §7a version-pin). Address-lifecycle events (UPRN issuance / retirement / split / merger) captured via same reified `opda:UPRNSuccessionEvent` pattern as ODR-0005 §6a. **Re-instantiation flagged for `pattern`-extraction per ODR-0001 A9 §Artefact identity test** — third citing site if S006 produces fourth.

#### 5a. GeoSPARQL deferral with four admission triggers (S015 Q5)

`opda:hasGeometry` declared as interface predicate; GeoSPARQL encoded geometries deferred until any one of four triggers fires:

1. Title-extents enter scope (ODR-0007 / ODR-0008 commits to materialising HMLR `titleExtents` GeoJSON polygons).
2. LLC1 / Local Land Charges searches enter scope (search-area polygons).
3. INSPIRE polygon-feed direct ingest (consumer requires polygon-feed's geometric content directly rather than via identifier dereferencing).
4. Search-radius queries on Property (`geof:within` / `geof:nearby` for property search).

Until a trigger fires, the interface is sufficient.

#### 6a. Co-reference SHACL shape (S015 Q6)

**Two-tier shape:**

- **`sh:Info` cross-variant disagreement.** Multiple `opda:Address` instances with different `addressVariant` values `opda:identifiesSameProperty` the same Property and structural fields disagree → `sh:Info` data-quality finding (legitimate per Q2 IC rule 3 — marketing-vs-title postcode-area-presentation differences are real-world).
- **`sh:Warning` same-variant disagreement.** Two `addressVariant` values agree but structural fields disagree → `sh:Warning` (same authority cannot consistently say two contradictory things; may be in mid-correction).
- **Neither tier is `sh:Violation`** — disagreement is data-quality, not modelling-failure.

Both shapes live in `opda-shapes.ttl` per ODR-0004 §3a (not annotation graph). Direct property traversal via sibling `?a1 / ?a2 opda:identifiesSameProperty $this`; no SPARQL inverse-property gymnastics (Allemang DA Q6 condition met). Severity tier ratified by ODR-0013.

#### 7a. PII tagging (S015 Q7)

Class-level baseline: `opda:Address dpv-pd:hasPersonalDataCategory dpv-pd:Address` (every instance bears the DPV tag). Variant-conditional refinements routed to ODR-0012 (Data-Governance Layer):

- **`addressVariant "title"`** — `dpv:hasLawfulBasis dpv:PublicTask` (HMLR open-register; ICO public-task lawful basis per ODR-0005 §3c PII regime).
- **`addressVariant "marketing"`** — `dpv:hasLawfulBasis dpv:Consent | dpv:LegitimateInterest` (listing-agent processing; ODR-0012 owns specifics).
- **`addressVariant "inspire"`** — `dpv:hasLawfulBasis dpv:PublicTask` (INSPIRE Directive open-data).

DPV co-annotations live in `opda-annotations.ttl` per ODR-0004 §3a (advisory annotations, not shape constraints). ODR-0012 owns instance-level authoring.

#### 8a. Diagnostic exemplar set with per-exemplar verdict walkthrough (S015 Q8)

Three exemplars authored 2026-05-27 between-session prep per ODR-0004 §8a:

| Exemplar (path + one-line hard case description) | Verdict under adopted IC |
|---|---|
| [`source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl`](../../source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl) — Address without UPRN; subdivision succession | Two `opda:Property` (5A/5B) with `prov:wasDerivedFrom` to predecessor; one `opda:Address` per Property with `addressVariant "marketing"` (amendment scheduled: refactor from literal `opda:postalAddress` to resource shape); UPRN absent → `dash:uniqueValueForClass` vacuously passes |
| [`source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl`](../../source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl) — multi-variant co-reference (load-bearing for Q1 Kind commitment) | Three `opda:Address` instances with `addressVariant` tags, co-referring via `opda:identifiesSameProperty`; Q2 IC rule 3 makes cross-variant `line2` disagreement legitimate; Q6 shape fires `sh:Info` for the disagreement |
| [`source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl`](../../source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl) — INSPIRE-only locatedness (Q2 IC rule 5) | One `opda:Address` instance to add with `addressVariant "inspire"` + `opda:inspireFeatureId` populated; structural fields empty/sparse; `opda:hasGeometry` interface live (Q5 deferral honoured); no marketing/title variants |

**Exemplar amendments scheduled** (next author-only follow-up; non-blocking):

- Refactor exemplar 1 to `opda:Address` resource shape (drop literal `opda:postalAddress` on Property).
- Add `opda:Address` instance to exemplar 3 manifesting INSPIRE-only-locatedness.
- `expected-report.ttl` pairing deferred until SHACL shapes graph crystallises.

## Alternatives

- **Address-in-Foundation (Davis's withdraw-conditional position)** — declare `opda:Address` inside ODR-0004 as part of URI policy. Rejected by scope-check majority (7-1): Address has its own identity-criterion work that ODR-0004's Foundation scope (URI + graph separation) cannot carry; routing it into 0004 buries it under namespace concerns.
- **Routed to Session 006 (the current plan's §4.1 routing)** — Address class location decided in Agents & Roles. Rejected by scope-check (8-1): wrong forum (Guizzardi optimising for Kind/Role/Phase, not for INSPIRE/ISO 19160/OS AddressBase relations).
- **Routed to Session 008 (Property descriptive attributes)** — Address as a sub-section of property attrs. Rejected: orphans the four non-property consumers (participants, evidence issuers, EPC certificate, search authorities).

## Consequences

**Added by [Session 015](./council/session-015-address-and-geography.md) — 5 of 8 questions WITHDRAWN by Allemang DA; 3 CONCEDED; 1 HELD as live dissent (Q3).**

- **Namespace block carries forward.** ODR-0015 stays `status: proposed` per inherited ODR-0004 namespace block (Knublauch DA primary demand from S004). Generator output for `opda:Address`, `opda:line1` etc. predicates carries `dct:status "draft"` until WG ratifies the namespace string.
- **Held-as-live dissent on Q3 (Allemang DA — class structure).** Verbatim: *"Address-as-class is unsupported by the source schema. PDTF v3 models `propertyPack.titleAddress` and `propertyPack.marketingAddress` as parallel structured-object leaves at the JSON level — they were never references to a shared Address resource. The minimum-change move to RDF is structured-literal-bundles on Property; the over-modelling move is to invent an `opda:Address` class."* Named re-open trigger: **"If 18 months of downstream sessions produce zero multi-Property-shared-Address cases from PDTF v3, AND no consumer query is named that genuinely requires Address-as-resource graph identity beyond what S015 Q1 already established, the Q3 structured-datatype reading becomes a re-open consideration."** The dissent does not block the verdict (Q3 follows Q1 by logical entailment — Substance Kind requires its own URI); it preserves a falsifiable re-open path.
- **A9 pressure-test passes (second `kind: pattern` ODR to discharge).** ODR-0015 §Operational specifications 2a/3a/3b/4a/5a/6a/7a/8a discharge A9 (a) UFO/DOLCE meta-category + (b) IC over five named hard cases + (c) artefact realisation inline. The methodology continues to operate as expected.
- **B2 pilot second site verdict observation:** the two-artefact discipline (narrative + structured tally) caught the Q3 held-as-live dissent + DA scorecard mechanical-check as machine-readable data; supports the EXTEND-CAUTIOUSLY recommendation from S005. **S011 Q8 is the third pilot site; three-pilot threshold confirms EXPAND (full adoption) consideration.**

**Downstream ODR inheritance (deliberative level, irrespective of namespace block):**

- **ODR-0006 (Agents & Roles).** Unblocked. Inherits `opda:Address` class for participant contact addresses; `vcard:Address` superclass enables ODR-0006's personal-contact reuse (a Person's contact address inherits both OPDA discipline and vCard consumer surface). The "Address class location" shared question (plan §4.1) is **removed** — ODR-0015 owns it.
- **ODR-0008 (Property Descriptive Attributes).** Unblocked. The Address-attachment ambiguity for `propertyPack.address` / `titleAddress` / `marketingAddress` is settled here (all three are `opda:Address` instances with `addressVariant` tags, co-referring via `opda:identifiesSameProperty`). **Note:** ODR-0008 also requires the 3-class cardinality from S005 to settle before its leaf-to-class mapping work begins (S005 Q5+Q8 Kendall+Davis joint amendment); S015 closes the Address-side question, not the descriptive-attributes question.
- **ODR-0009 (Claims, Evidence & Provenance).** Inherits `opda:Address` for evidence-issuer addresses; the PROV-O succession pattern (§Q4 above) is consistent with ODR-0009's PROV-O backbone.
- **ODR-0012 (Data-Governance Layer).** Inherits **class-level `dpv-pd:hasPersonalDataCategory dpv-pd:Address` baseline** + **three variant-conditional refinements** (`title` → PublicTask HMLR; `marketing` → Consent/LegitimateInterest; `inspire` → PublicTask INSPIRE) as load-bearing input. ODR-0012's DPV co-annotation authoring (per Scope-Check 1 Q5 refinement) consumes the class-level baseline + the variant-conditional refinements.
- **ODR-0013 (SHACL Validation & Severity).** Inherits the two-tier co-reference shape severity (`sh:Info` cross-variant + `sh:Warning` same-variant) as part of the severity-tier ratification.

**Cross-cutting: PROV-O succession pattern third-site count + `pattern`-extraction candidate.**

PROV-O succession patterns now appear in ODR-0005 §6a (UPRN succession), ODR-0009 (Claims/Evidence — Moreau S001 Q6), and ODR-0015 §Q4 (INSPIRE / OS AddressBase succession via re-instantiated SHACL-AF rule). Per ODR-0001 A9 §Artefact identity test, this satisfies the third-citing-site criterion. **If ODR-0006 (Phase 3a) produces a fourth citing site** (e.g. NI-number succession, passport-renumbering for Person identity), spawn a shared "contingent-identifier-succession" `pattern` ODR per §6 spawn rule; ODR-0005 §6a + ODR-0009 + ODR-0015 §4a all `implements:` it.

**GeoSPARQL deferral retained with named admission triggers.** ODR-0002's GeoSPARQL Conditional adoption carries forward; the four named triggers (title-extents / LLC1 polygons / INSPIRE direct ingest / search-radius queries) make the deferral reversible without an ODR-0002 amendment cycle.

**Re-open triggers (recorded for future sessions):**

- Allemang DA Q3 trigger: 18 months / zero multi-Property-shared-Address cases / no new consumer query → structured-datatype reverter reconsideration.
- Davis-from-Scope-Check-1-Q7a (Address-in-Foundation alternative): if URI policy substantively changes in ODR-0004 such that Address modelling moves there, ODR-0015 may be superseded.

## References

- Council methodology: [ODR-0001 §What an ODR records (per-kind discipline)](./ODR-0001-linked-data-council-methodology.md) — A9 amendment landed 2026-05-27. ODR-0015 is the **second** `kind: pattern` ODR to discharge under it.
- Programme anchor: [ODR-0003](./ODR-0003-pdtf-ontology-programme.md).
- Foundation: [ODR-0004 §8a](./ODR-0004-pdtf-ontology-foundation.md) (exemplar policy); §Rule 2 (layer-segregated naming); §3a (three-graph separation — shape in `opda-shapes.ttl`, DPV co-annotations in `opda-annotations.ttl`); §7a (term-sourcing five-line precedence — `dct:source` discipline for external authorities).
- Identity-crux precedent: [ODR-0005 §6a](./ODR-0005-property-land-identity-crux.md) (UPRN-as-Quality + SHACL-AF succession-chain rule, **re-instantiated** here for INSPIRE / OS AddressBase succession — second citing site; third if S009 counted; flagged for `pattern`-extraction); §6b (Address routed to ODR-0015 with `opda:hasAddress` pre-committed); §Consequences (PII regime distinction; B2 pilot EXTEND-CAUTIOUSLY recommendation now applied here).
- Foundational ontology: Guizzardi 2005, *Ontological Foundations for Conceptual Modeling*, Ch. 4 (UFO Substance Kind / Mode / Quality / Quale); Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *WonderWeb D18* §4.2 (DOLCE NonPhysicalEndurant); Searle 1995, *The Construction of Social Reality* (institutional facts / collective acceptance — operationalised here as authority-record continuity); Guarino & Welty 2002, 2009, *OntoClean* (Rigidity, Identity, Unity, Dependence meta-properties).
- W3C standards: SHACL Core (Knublauch & Kontokostas eds. 2017) + SHACL-AF (`sh:rule` / `sh:sparql`); PROV-O Recommendation (Moreau & Missier 2013) §3 (`prov:wasDerivedFrom`); vCard Ontology (Iannella & McKinney eds. 2014); RDF 1.1 Semantics (Hayes & Patel-Schneider 2014).
- Authoritative external sources (cited via `dct:source` with version pin per ODR-0004 §7a): INSPIRE Directive (2007/2/EC) Annex I Theme: Addresses; ISO 19160 (Addressing); Ordnance Survey *AddressBase Plus Technical Specification* §address lifecycle; HM Land Registry *Practice Guide 40 — HM Land Registry plans* (title-address descriptor lifecycle); ICO Guidance on Public Authorities Lawful Bases 2023 §INSPIRE Directive (for `addressVariant "inspire"` PII regime).
- DPV: Pandit et al., *Data Privacy Vocabulary (DPV)*, W3C Community Group Report (2024 stable cut) — `dpv-pd:Address` baseline + `dpv:hasLawfulBasis` instance-level refinements.
- Diagnostic exemplars (per ODR-0004 §8a; authored 2026-05-27 between-session prep; commit `b559088`):
  - [`source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl`](../../source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl) — Address without UPRN; subdivision case (refactor amendment scheduled).
  - [`source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl`](../../source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl) — multi-variant co-reference (load-bearing for Q1 Kind commitment; already authored under Kind shape).
  - [`source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl`](../../source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl) — INSPIRE-only locatedness (Q2 IC rule 5; manifest amendment scheduled).
- Downstream consumers: [ODR-0006](./ODR-0006-agents-and-roles.md) (participant contact addresses; `vcard:Address` reuse); [ODR-0008](./ODR-0008-property-descriptive-attributes.md) (`propertyPack.address` / `titleAddress` / `marketingAddress` attachment via `opda:hasAddress`); [ODR-0009](./ODR-0009-claims-evidence-provenance.md) (evidence-issuer addresses); [ODR-0012](./ODR-0012-data-governance-layer.md) (class-level DPV baseline + three variant-conditional refinements); [ODR-0013](./ODR-0013-shacl-validation-and-severity.md) (`sh:Info` cross-variant + `sh:Warning` same-variant severity-tier ratification).
- Deliberation provenance: [Scope-Check 1](./council/scope-check-1-programme.md) Q7a (the 8-1 spawn deliberation); **[Session 015](./council/session-015-address-and-geography.md)** (2026-05-27; Reduced Council; two-artefact discipline; Queen Guizzardi; DA Allemang — 5 withdrawn / 3 conceded / **1 held-as-live on Q3**). Per-expert working notes under [`council/session-015-address-and-geography/`](./council/session-015-address-and-geography/).
- Source inputs: `pdtf-transaction.json` (address surfaces across 9+ leaf paths); data dictionary entries for `address`, `uprn`, `inspireId`, `titleAddress`, `marketingAddress`.
- **Ratification provenance**: [session-015](./council/session-015-address-and-geography.md) (2026-05-27; Reduced Council; Queen Guizzardi; DA Allemang — partial withdrawal). Phase 2.6 gate cleared substantively at deliberative level; formal `status: accepted` awaits WG namespace ratification (inherited from ODR-0004).
