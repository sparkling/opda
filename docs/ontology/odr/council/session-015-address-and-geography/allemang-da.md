# Allemang — Devil's Advocate on S015

## DA framing

ODR-0005 settled the identity-crux that mattered. Property is a Substance Kind with a Stewardship-flavoured IC; UPRN is a contingent Quality; succession is materialised via PROV-O and a SHACL-AF rule. That work clears the gate; the question now is *what does Address have to be, to make every BASPI5 form leaf addressable?* That is not the same question as "what is Address ontologically in UFO terms?" — and conflating the two is exactly the over-modelling failure *Working Ontologist* 3rd ed. Ch. 13 §"Address as a First-Class Citizen" warns against: "address is structurally complex and deserves its own deliberation; folding it into the property-identity gate creates a session that resolves nothing." S005 honoured that warning by routing Address here. S015 must honour it the same way: deliberate *the Address question*, not "the IC discipline applied to Address."

The Kind reading (Address as Substance Kind with its own IC, INSPIRE-feature-as-class) imports the full Endurant discipline onto Address — *including IC authoring over hard cases*. What hard cases? Royal Mail PAF revisions affecting tens of thousands of addresses per quarter? Council street renamings? Building-number-changes from local authorities? Postcode-area splits when Royal Mail subdivides a sector? Under the Kind reading, ODR-0015 has to author identity criteria for every administrative change to UK address-space — a far larger problem than the Property IC that ODR-0005 solved over five named hard cases. I have not seen a workable IC discipline for address-administrative-change in any production ontology programme, and TopQuadrant ran four of them in the UK/Europe local-government segment between 2014 and 2020. Every programme that tried Address-as-Kind ended up running an Address-as-structured-datatype shim in front of the Kind class because the IC could not be cleanly authored.

My DA frame here is the same frame that worked in S005 Q5 and Q6: **show me a consumer query, SHACL validation case, or BASPI5 round-trip leaf that fails under Address-as-structured-datatype (a Quale-in-a-Region) and succeeds under Address-as-Kind.** Without that evidence, the Kind reading is decoration imported from INSPIRE's spatial-feature framing — and INSPIRE alignment is achieved via `opda:inspireId` on Property (a separate predicate, already pre-committed in ODR-0005), not by minting INSPIRE features as Address instances. The three exemplars S015 inherits make this concrete: in `listed-building-divergent-addresses.ttl`, three addresses describe one Property; in `rural-plot-inspire-no-uprn.ttl`, no postal address exists at all; in `flat-no-uprn-newly-converted.ttl`, addresses exist without UPRNs. Under Quale-in-Region, all three exemplars validate as structured-datatype carriers on Property; under Kind, all three force Address-identity tests that the exemplars do not exercise.

## Per-question DA positions

### Q1 — UFO meta-category

**DA position (PRIMARY ATTACK):** AGAINST Kind reading; FOR **Quale-in-a-Region** (Address is a value in the postal-presentation region of UK address-space, structured datatype, no identity, no co-reference). Acceptable fallback: UFO **Mode** if-and-only-if Mode is operationalised as a structured-datatype-with-an-`addressVariant`-tag attached to Property — i.e., Mode-as-tagged-literal-bundle, not Mode-as-reified-resource-with-IC.

**Engagement with Guizzardi (Queen-candidate).** Guizzardi will push UFO Mode — his S005 Q6 position was "Address as Mode of presentation". A Mode in UFO inheres in a Substance and lacks independent identity; on the *operational* surface Guizzardi's Mode and my Quale-in-Region produce nearly identical RDF (structured literals attached to Property, no Address URI needing to be minted). Where Guizzardi and I split is whether the Mode is reified as a resource (with its own URI but no IC) or remains a structured-datatype-shaped Quale. The reification cost is the test: if a SHACL shape or consumer query needs the Address-Mode to bear additional predicates (e.g. `opda:addressVariant`, `opda:asserted-by`, `opda:validFrom`), Mode-as-resource buys something Quale doesn't. If those predicates can attach directly to Property as parallel literals (`opda:titleAddress`, `opda:marketingAddress`, `opda:inspireAddress`), Quale-in-Region is cheaper and the Mode reification is decoration.

**Engagement with Gandon (Queen-candidate).** Gandon will push Kind for W3C dereferenceability — an Address URI is something a third party can resolve and consume independently of the Property graph. That is the legitimate URI-architecture argument and I respect it. But the dereferenceability requirement is satisfiable under Quale-in-Region too: the Property URI dereferences to a graph containing structured-address literals, which is exactly what `vcard:Address` and `schema:PostalAddress` consumers expect when they fetch a place. The address-as-resource pattern (separate minted URI) is justified only when a consumer needs to *cite the address independently of the Property*. Per *Linked Data Patterns* (Davis & Dodds 2010) §"Resource Description": sub-class only when a predicate or query genuinely partitions the population. No BASPI5 consumer cites Address independent of Property; the marketing portals, conveyancing systems, and EPC registers all join address-to-property at the property level.

**Withdrawal condition:** Withdraw on EITHER (a) a named consumer query of the form *"find all addresses where X"* (not "find all properties at address X") where X cannot be expressed as a literal-pattern filter on Property and the query is required by a real PDTF v3 BASPI5 consumer; OR (b) a named SHACL validation case requiring `rdf:type opda:Address` discrimination — i.e., a constraint that fires for addresses-of-properties but not addresses-of-persons (which is ODR-0006 territory) and requires the type-axis to dispatch the validation. "INSPIRE encodes Address as a feature class" is *not* a withdrawal condition — INSPIRE alignment is a `dct:source` citation under Quale-in-Region too.

**Per-voice vote: AGAINST Kind + withdrawal condition stated.** FOR Quale-in-Region OR Mode-as-tagged-literal-bundle.

### Q2 — Identity criterion

**DA position:** AGAINST any substantive IC commitment in `## Rules` unless Q1 lands on Kind. Quale-in-Region has no identity (a quale is its own region-position; the IC is the region's metric, which for postal address is line1/line2/postcode/country equivalence under postal-normalisation). Mode-as-tagged-literal-bundle has no independent identity (the bundle's identity collapses into Property's identity + the variant tag). If Q1 lands on Kind, the IC question becomes load-bearing — and at that point I attack on the same shape S005 used: what is the IC over Royal Mail PAF revisions, postcode-area splits, council street renamings, building-numbering changes? Five hard cases minimum per ODR-0001 A9 §Per-kind discipline (b). I have not seen the panel name those hard cases yet, which tells me the Kind reading has not been authored to the discipline ODR-0001 requires.

**Engagement.** Guizzardi's Mode reading sidesteps Q2 cleanly (a Mode inherits IC from its bearer). Gandon's Kind reading owes Q2 the full A9 discipline. That asymmetry is itself a tell about which reading is cheaper.

**Withdrawal condition:** Withdraw if Q1 settles on Quale-in-Region OR Mode-as-tagged-literal-bundle (IC is then either region-metric or bearer-inherited; both off the gate-critical path). If Q1 settles on Kind, hold against any IC verdict that does not state per-hard-case verdicts on the five PAF/postcode/street/numbering/area-split cases.

**Per-voice vote: CONDITIONAL — AGAINST IC commitment unless Q1 = Kind, in which case AGAINST any IC verdict not discharging A9 §(b) over five named hard cases.**

### Q3 — `opda:Address` class structure

**DA position (PRIMARY ATTACK):** FOR **structured datatype** — `opda:line1`, `opda:line2`, `opda:postTown`, `opda:postcode`, `opda:country` as literals borne directly by `opda:Property` (or by the address-bearing Person/Organisation in ODR-0006 territory). The three variants in `listed-building-divergent-addresses.ttl` become three parallel structured-literal-bundles on Property: `opda:titleAddress`, `opda:marketingAddress`, `opda:inspireAddress`, each carrying the five fields. The Property URI dereferences to a graph containing all three; consumers select by predicate name; no Address URI minting; no Address class registered in the TBox; no SHACL shape for `opda:Address` (because no class exists to validate).

**Engagement.** This is the cleanest cut. The data-dictionary already specifies address fields as typed literals on the parent leaf; the PDTF v3 base schema has `propertyPack.titleAddress` and `propertyPack.marketingAddress` as parallel structured-object leaves at the JSON level — *they were never modelled as references to a shared Address resource*. The minimum-change move from PDTF v3 to OPDA-RDF is to lift those structured-object leaves to RDF as structured-literal-bundles on Property; the over-modelling move is to invent an `opda:Address` class that didn't exist in the source schema. *Working Ontologist* 3rd ed. Ch. 7 §"Distinctions that earn their keep": a class earns its keep when it bears predicates the parent class cannot. `opda:Address` bears `opda:line1` etc.; those predicates can attach to Property directly under the variant-prefix discipline.

**Withdrawal condition:** Withdraw on a named **operational necessity** for an Address resource — specifically: a multi-Property-shared-Address case where one Address instance serves multiple `opda:Property` individuals. *If* PDTF v3 has a case where two flats in one block share a building-level address (e.g. mail addressed to "16 Pinewood Apartments" with sub-unit identifier separate), AND a consumer query needs to address-mail the building independent of the flats, AND that query cannot be expressed by a `opda:atBuilding` predicate on Property pointing at another `opda:Property` (a building-Property containing flat-Properties), then the Address-as-resource case is real. I have not seen PDTF v3 model that scenario; the multi-title-flat exemplar from S005 has one flat with two LegalEstates over it, not two flats sharing an Address. The case would need to be named with an exemplar walk-through.

**Per-voice vote: FOR structured datatype + withdrawal condition stated.**

### Q4 — External alignment

**DA position:** CONCEDE most of the question; the alignments are well-understood.

- **INSPIRE alignment via `opda:inspireId` on Property.** Concede — already pre-committed in ODR-0005 §6b and in the exemplars (`rural-plot-inspire-no-uprn.ttl` shows `opda:inspireId` on Property, not on Address). INSPIRE features are spatial-identifiers; OPDA models them as Property Qualities, not as Address instances. This is consistent with the OS AddressBase UPRN-as-Quality pattern from S005.

- **`vcard:Address` for personal-contact use.** Concede — vCard is for personal contact addresses. ODR-0006 (Agents & Roles) territory, not ODR-0015's. The Address-on-Property modelling decided here does NOT carry forward to Person addresses; ODR-0006 makes its own call on `vcard:Address` reuse for participant contact info (which is where vCard belongs).

- **OS AddressBase reuse via UPRN succession.** Concede — already in ODR-0005's §6a reified UPRN succession event. OPDA does not re-author AddressBase identity discipline; it cites AddressBase via `dct:source` on the UPRN predicate.

- **ISO 19160 (Addressing).** Concede — citable as `dct:source` on the structured-datatype field set (line1/line2/postcode/country); doesn't require an Address class.

**Engagement.** No DA attack; the external standards are well-aligned under Quale-in-Region as cleanly as under Kind. The alignment story is *not* the load-bearing question for Q1; the panel should not let "INSPIRE encodes Address as a feature" be the decisive Kind argument when INSPIRE alignment is achieved via `opda:inspireId` on Property either way.

**Withdrawal condition:** none — concede.

**Per-voice vote: FOR draft external-alignment commitments.** Concede.

### Q5 — GeoSPARQL deferral

**DA position:** FOR deferral with `opda:hasGeometry` as the interface predicate; concede the deferral mechanism. No DA attack.

**Engagement.** ODR-0002 deferred GeoSPARQL pending consumer demand. ODR-0015 inherits that deferral and provides the interface (`opda:hasGeometry` on Property) so that when a consumer materialises (Local Land Charges polygons; title extents from HMLR plans), the encoded geometry attaches at a stable seam. The Cagle surrogate-predicate pattern from S005 §3a (geometry as IC-surrogate predicate, deferred to GeoSPARQL) carries forward.

**Withdrawal condition:** none — concede.

**Per-voice vote: FOR the deferral + `opda:hasGeometry` interface.** Concede.

### Q6 — Co-reference SHACL shape

**DA position:** FOR a co-reference SHACL shape; the shape is **much simpler under Quale-in-Region** than under Kind.

Under **Quale-in-Region** (my preferred Q1 verdict), the co-reference shape validates that when a Property has multiple address-variant literals (`opda:titleAddress`, `opda:marketingAddress`, `opda:inspireAddress`), the key sub-fields (postcode normalised; line1 first-token after number) agree across variants. Mismatch fires `sh:Warning` (data-quality finding, not modelling violation — `listed-building-divergent-addresses.ttl`'s exemplar exercise). The shape is a single `sh:NodeShape` on `opda:Property` with `sh:sparql` comparing the parallel literal bundles; ~15 lines of Turtle.

Under **Kind**, the co-reference shape validates that multiple `opda:Address` instances which `opda:identifiesSameProperty` agree on key sub-fields. The shape is a `sh:NodeShape` on `opda:Address` traversing back to Property, comparing siblings under `^opda:identifiesSameProperty`; ~30 lines of Turtle and a SPARQL inverse-traversal — more verbose, more brittle. Both work; Quale-in-Region is cheaper.

**Engagement.** The S005 carry into S015 is the predicate `opda:identifiesSameProperty` (S005's co-reference mechanism). Under Quale-in-Region, that predicate is unchanged but applied between Property and Property (or between Property and RegisteredTitle, per S005); Address is not in the co-reference graph. Under Kind, Address joins the co-reference graph as a third (or fourth) co-referent. The cost of admitting Address into the co-reference graph is the cost of the Kind reading.

**Withdrawal condition:** Withdraw on Kind verdict for Q1 if the SHACL shape is named, tractable (≤30 lines, no inverse-property gymnastics), and exercises the listed-building exemplar correctly with `sh:Warning` on the marketing-vs-title address divergence.

**Per-voice vote: FOR co-reference shape under Quale-in-Region; CONDITIONAL FOR under Kind if shape is tractable.**

### Q7 — PII tagging

**DA position:** CONCEDE routing to ODR-0012. The choice of class-structure (Q3) affects the DPV pattern — Baker+Pandit's S005 Q6 amendment carry is the relevant constraint. Under Quale-in-Region, PII tags attach to the address *predicates* on Property (DPV property-level annotations: `opda:postalAddress dpv-pd:hasPersonalDataCategory dpv-pd:Address`). Under Kind, PII tags attach to the `opda:Address` *class* (DPV class-level annotations on the Address Kind).

**Engagement.** Pandit will likely defer the Q7 verdict to ODR-0012's session; the Q1 verdict is the input to that downstream decision. Either reading is DPV-compatible; the Quale-in-Region version is closer to DPV's actual idiomatic usage (property-level PII tags are the common pattern; class-level tags are an aggregation summary).

**Withdrawal condition:** none — concede routing.

**Per-voice vote: FOR routing to ODR-0012; the Q1 verdict carries as input.**

### Q8 — Exemplar pass

**DA position:** CONDITIONAL on Q1+Q3 settling consistently. The three exemplars exercise different Address-shaped questions, and the per-exemplar verdict must be named in the Queen synthesis (S005 Q7 discipline carried).

**Per-exemplar verdict walk-through (under my preferred Quale-in-Region + structured-datatype reading):**

1. **`listed-building-divergent-addresses.ttl`** — one Property with three parallel structured-literal-bundles (`opda:titleAddress`, `opda:marketingAddress`, `opda:inspireAddress`). The current exemplar models three `opda:Address` resources; under Quale-in-Region the exemplar would be amended (author-only follow-up — non-blocking) to drop the three Address URIs and lift the line1/line2/postcode/country fields to parallel literal bundles on Property. Co-reference SHACL fires `sh:Warning` on marketing-vs-title `line2` divergence. INSPIRE alignment via `opda:inspireId` on Property (already present).

2. **`rural-plot-inspire-no-uprn.ttl`** — Property with `opda:inspireId` but no postal-address literals at all. Under Quale-in-Region, the Property simply has no address-bundle predicates instantiated; no Address URI to mint; no SHACL violation (graceful degradation per S005 Q4 discipline). Under Kind, the absence-of-Address must be modelled (zero-cardinality on `opda:hasAddress`); same operational result but more SHACL surface.

3. **`flat-no-uprn-newly-converted.ttl`** — two new Property individuals (5A, 5B) each with `opda:postalAddress` literal but no UPRN. Under Quale-in-Region, each Property bears a single structured-literal address-bundle; UPRN absence handled per S005's `dash:uniqueValueForClass` graceful degradation; address-bundle validates the structure (`opda:line1` matches "Flat 5A, 5 Linden Road" prefix; `opda:postcode` matches "RG1 4QT"); no Address URI minted. Under Kind, two Address instances minted, two Address-PII tags, two SHACL shapes — more surface for no consumer benefit.

**Withdrawal condition:** Withdraw on (a) Q1 + Q3 settling on Quale-in-Region + structured-datatype OR on Kind + tractable Address class with the per-exemplar walk-through demonstrated for all three exemplars; AND (b) Queen synthesis names the verdict per exemplar (S005 Q7 discipline carried — vague "exemplars pass" not sufficient).

**Per-voice vote: CONDITIONAL — concede iff Q1+Q3 land consistently AND per-exemplar verdict walk-through is in the synthesis.**

## DA scorecard target

Minimum to concede the session: **Q1 lands on Quale-in-Region OR Mode-as-tagged-literal-bundle (NOT Kind), AND Q3 lands on structured datatype (NOT a class with property shapes)**, OR a named consumer query / SHACL validation case forces Kind + Address class.

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| **Q1** | **Yes, with high evidence bar** | **Yes** | **Named consumer query / SHACL case requiring `rdf:type opda:Address` discrimination** |
| Q2 | Conditional on Q1 | Conditional | Q1 = Quale OR Mode (IC then off-path); OR Kind with five-hard-case A9 discipline |
| **Q3** | **Yes, with high evidence bar** | **Yes** | **Named multi-Property-shared-Address exemplar from PDTF v3** |
| Q4 | (already conceded) | — | (INSPIRE/vCard/AddressBase alignments uncontested) |
| Q5 | (already conceded) | — | (GeoSPARQL deferral + `opda:hasGeometry` interface) |
| Q6 | Yes | No | Tractable SHACL shape (≤30 lines, no inverse-property gymnastics) under Kind |
| Q7 | (already conceded) | — | (Routing to ODR-0012; Q1 carries as input) |
| Q8 | (derived) | — | (Per-exemplar verdict walk-through in synthesis) |

**Held-dissent texts (for the Queen's record if my withdrawal conditions are unmet):**

- **Q1 held:** "Kind reading imports the full Endurant IC discipline onto Address — including IC authoring over Royal Mail PAF revisions, postcode-area splits, council street renamings, and building-number changes. No production ontology programme I have led (TopQuadrant 2014-2020, four UK/EU local-government programmes) has authored a workable Address-IC discipline; every programme reverted to a structured-datatype shim. The Kind reading is unsupported by any named consumer query, SHACL validation case, or BASPI5 round-trip leaf. Withdraw on named evidence per A9 §Per-kind discipline (b). (*Working Ontologist* 3rd ed. Ch. 13 §'Address as a First-Class Citizen'.)"

- **Q3 held:** "Address-as-class is unsupported by the source schema. PDTF v3 models `propertyPack.titleAddress` and `propertyPack.marketingAddress` as parallel structured-object leaves at the JSON level — they were never references to a shared Address resource. The minimum-change move to RDF is structured-literal-bundles on Property; the over-modelling move is to invent an `opda:Address` class. *Linked Data Patterns* (Davis & Dodds 2010) §'Resource Description': sub-class only when a predicate or query genuinely partitions the population. No BASPI5 consumer cites Address independent of Property. Withdraw on named multi-Property-shared-Address case from PDTF v3."

- **Q8 held (if Q1 or Q3 unwithdrawn):** "Per-exemplar verdict walk-through not in synthesis. The S005 Q7 discipline requires the Queen to name the verdict per exemplar under the adopted IC and class-structure. Without the walk-through, the gate has not actually closed — only the easier questions (Q4, Q5, Q7) have closed, and downstream sessions (ODR-0006, ODR-0008, ODR-0009, ODR-0012) inherit unresolved Address modelling."

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition, and records "Allemang DA withdrew on Q[n] on condition met: [verbatim condition]" or "Allemang DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Allemang DA aligned with majority" — the alignment must trace to the specific condition that was met.

The Scope-Check 1 Q7a deliberation that spawned this ODR recorded my position as "Strong agree — ODR-0015 gated after 0005, before 0006/0008. Covers: Address class structure, INSPIRE Identifier relation, UPRN's status as a geographic identifier distinct from its Property-key role." I voted to spawn the session; I am the DA for the session because my published methodology pushes back hardest against the Kind reading. Davis's withdraw-conditional position from the same scope-check ("Address-in-Foundation acceptable as alternative; same recognition that Address needs explicit ownership") is closest to mine on the *over-modelling-risk* axis; he and I share the concern that Address can be cheaper than the panel's instinct.

The cited authority for every position above: *Semantic Web for the Working Ontologist* 3rd ed. (Allemang, Hendler, Gandon 2020), Ch. 7 "Identity and Identifiers" and Ch. 13 "Linked Data in the Real World"; Davis & Dodds 2010 *Linked Data Patterns* §"Resource Description" (sub-class only when a predicate or query genuinely partitions the population); TopQuadrant UK/EU local-government deployment record 2014-2020 (four programmes; every one reverted from Address-as-Kind to Address-as-structured-datatype-shim after the IC authoring failed). These citations meet ODR-0001 §Citation grounding ("a named book authored by the expert"; "a documented deployment the expert led or co-authored").
