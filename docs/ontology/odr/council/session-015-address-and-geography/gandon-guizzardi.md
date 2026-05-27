# Gandon + Guizzardi — formal-pair on S015 (Guizzardi as Queen)

*Joint pair voice. **Guizzardi-led (Queen)** on Q1, Q2, Q6, Q7 (UFO meta-category, IC, co-reference shape, PII routing — the gate questions hinge on UFO/DOLCE commitment + Mode-of-presentation framing). **Gandon-led** on Q3, Q4, Q5 (class structure, external alignment, GeoSPARQL deferral — the URI-architecture and W3C-standards-alignment questions). **Pair-joint throughout.** Guizzardi sits inside the standing-pair per ODR-0001's "Queen sits inside her standing-panel pair" rule; Gandon supplies the W3C-grounded artefact discipline that operationalises the UFO commitment.*

## Stance summary

ODR-0015 is `kind: pattern`. Per ODR-0001 A9 §Per-kind discipline, `## Rules` MUST state (a) a UFO/DOLCE meta-category commitment, (b) an IC over named hard cases, (c) the artefact realisation. ODR-0005 §6b pre-committed the join predicate (`opda:hasAddress`) and routed Address modelling here; this session discharges the rest. The substantive ask is: **what is Address, ontologically?** The three exemplars exist to decide. Our position from S005 Q6 was "Address-as-Mode of presentation" — three UFO Modes (marketingAddress / titleAddress / inspireAddress) inhering in `opda:Property`. **We revise that position here, on exemplar evidence.**

The revised pair position: **`opda:Address` is a UFO Substance Kind** (DOLCE NonPhysicalEndurant; Sortal; Rigid; supplies its own IC). Each instance carries an `opda:addressVariant` property tagging the context-of-presentation (`"title" | "marketing" | "inspire"`). This preserves the Guarino S001 Q4 *mode-of-presentation* distinction as a **property of the Kind instance** rather than as a separate Kind taxonomy or as a UFO Mode hanging off Property. The IC is **structural composition + context-tag-scoped persistence** (the address-as-presented-by-context-X persists as the same individual while X's source-record asserts continuity, regardless of cosmetic re-format). Co-reference to the bearer Property is via `opda:identifiesSameProperty` (the S005 predicate), and `opda:Property opda:hasAddress` is the join (pre-committed S005 §6b).

Three reasons the Mode-only reading from S005 Q6 fails the exemplars:

1. **`rural-plot-inspire-no-uprn.ttl` is decisive against pure-Mode.** The grazing plot has *no postal address* — only an INSPIRE Identifier. Under a UFO Mode reading, the Property has no Address-Mode (nothing to inhere). But the Property still has a *locatedness* that the INSPIRE Identifier encodes; the Q1 verdict must accommodate INSPIRE-only locatedness as a coherent surface. Treating Address as a Kind with INSPIRE-derived instances handles this natively (INSPIRE Address as a Kind instance with `opda:addressVariant "inspire"`); the Mode reading must either invent a vacuous Mode or claim the Property has no Address at all (loses the cadastral surface).
2. **INSPIRE Annex I treats Address as a feature** (a first-class spatial object with its own identifier and lifecycle). `vcard:Address` is a class. OS AddressBase Plus is a record-based model where each address is a row with its own UPRN-lineage. Mapping `opda:Address` to a UFO Mode forces the external-alignment story to claim "all three external standards modelled Address as a Mode-inhering-in-Property" — which they did not. The Kind reading aligns the modelling with the standards we are aligning to.
3. **`listed-building-divergent-addresses.ttl` works under both Mode and Kind**, but the exemplar's already-authored shape uses `opda:Address` instances with `opda:addressVariant` tags. Three separate URIs (`opda-x:title-address`, `opda-x:marketing-address`, `opda-x:inspire-address`) each typed `a opda:Address` and co-referring via `opda:identifiesSameProperty` is unambiguous Kind shape; reading it as Mode requires reinterpretation. The exemplar's authored discipline matches the Kind reading.

The depth questions we own are Q1 (the gate — UFO Substance Kind commitment with structured-composition IC + context-tag), Q2 (the IC — structural composition + context-tag-scoped persistence over named hard cases), Q6 (co-reference SHACL shape — context-tag-aware, with disagreement as `sh:Info` data-quality finding not `sh:Violation`), and Q7 (the DPV-pattern routing to ODR-0012 per Baker+Pandit S005 §6b constraint). Gandon-led: Q3 (class with property shapes, not structured datatype — INSPIRE/vCard alignment requires resource identity), Q4 (INSPIRE Identifier as contingent identifier per UPRN pattern; `vcard:Address` for personal-contact reuse; OS AddressBase as authority-source for `dct:source`), Q5 (GeoSPARQL interface via `opda:hasGeometry` deferred; trigger = title-extents or LLC1 search polygons enter scope). Q8 (exemplar pass) is the mechanical IC test; all three pass under the verdicts.

## Per-question positions

### Q1 — UFO meta-category for `opda:Address` (the gate)

**Guizzardi (lead, Queen).** **`opda:Address` commits to UFO Substance Kind / DOLCE NonPhysicalEndurant — Sortal, Rigid, supplies its own IC.** This revises the S005 Q6 Mode-only position on exemplar evidence and external-standards-alignment evidence.

The three live readings, evaluated against the exemplars:

- **Mode reading (S005 Q6 carry).** Address is a particularised quality inhering in its bearer Property; per Guizzardi 2005 Ch. 4, Modes "are particulars that inhere in their bearer with their own existence-dependence on the bearer but their own particular identity within that dependence." Each variant (marketing / title / INSPIRE) is a Mode instance with identity = (bearer + context-tag). **Fails on `rural-plot-inspire-no-uprn.ttl`**: a Property with INSPIRE locatedness but no postal address has no Mode-of-Address to inhere; the Mode reading is silent on cadastral-only surfaces.

- **Quale-in-Region reading (Allemang DA anticipated position).** Address is a value in a structured-address quality-region (a DOLCE *quale*, per Masolo et al. 2003 §4); no identity beyond lexical form; no URI; literal-only. Each variant is a different point in the address-quality-space. **Operationally collapses Q3** — picks structured datatype by definition — and **collapses Q6** — co-reference is impossible without identity. Loses INSPIRE/vCard alignment. Loses the DPV co-annotation handoff (the PII tag attaches to *what*?). Inadmissible as the modelling commitment though admissible as a *literal-encoding sub-pattern* for cases where a downstream consumer wants the structured-value form (e.g. PAS 1192 schema mappings).

- **Kind reading (our revised position).** Address is a UFO Substance Kind — Sortal (provides a counting principle: "how many addresses does this Property have?" answers determinately), Rigid (an instance cannot cease to be an Address without ceasing to exist), supplies its own IC (Q2 below). DOLCE NonPhysicalEndurant per Searle 1995 (legal-institutional-like objects: an Address is a *socially-recognised locator* constructed by an authority — Royal Mail / OS AddressBase / HMLR / INSPIRE — and persists as a record-entity in that authority's stewardship). Each context-tagged variant is a *separate instance of the same Kind*, not a separate sub-Kind. The instance carries `opda:addressVariant` as a UFO Quality particularising it within the Kind (analogous to UPRN-as-Quality on Property per ODR-0005 Q4).

**Why this is not a regression on the Guarino S001 Q4 framing.** Guarino's "address is a mode of presentation, not a bearer" is preserved: the *variant tag* on each instance records the context of presentation. The framing said "address is not the IC of Property"; we agree — it is not. It said "address is contingent on context"; we agree — the variant tag encodes context. The framing did *not* say "address must be a UFO Mode in the technical OntoUML sense"; reading it as that mandate over-constrains it. The Kind-with-variant-tag pattern is the correct technical realisation of the conceptual point.

**Gandon.** Concur with the Substance Kind commitment. The URI-architecture grounding: a Substance Kind gets a dereferenceable URI (per *Cool URIs Don't Change*, Berners-Lee 1998; Heath & Bizer 2011 Ch. 2 Principle 3); a Mode of Property does not have a stable URI of its own (its URI shape would have to encode bearer + context, making it a derived URI, not a primary one). INSPIRE Annex I treats Address as a feature with a feature URI; vCard treats Address as a class with class-level URIs; OS AddressBase Plus is record-based with row-level identifiers. All three external standards model Address with its own resource identity; the Kind reading aligns; the Mode reading does not.

**Pair vote on Q1.**

- **Guizzardi vote: FOR `opda:Address` as UFO Substance Kind / DOLCE NonPhysicalEndurant** — Sortal, Rigid, supplies own IC; `opda:addressVariant` property tags context-of-presentation as UFO Quality within the Kind. Revises S005 Q6 Mode-only position on `rural-plot-inspire-no-uprn.ttl` evidence + external-standards alignment.
- **Gandon vote: FOR `opda:Address` as UFO Substance Kind / DOLCE NonPhysicalEndurant** — Substance Kind gets dereferenceable URI per LDP Principle 3; INSPIRE Annex I / vCard / OS AddressBase Plus all model Address with resource identity; Kind reading aligns with all three external standards.

---

### Q2 — Identity criterion for `opda:Address`

**Guizzardi (lead).** The IC is **structural composition + context-tag-scoped persistence**, stated over named hard cases drawn from the three exemplars.

The IC, stated:

> An `opda:Address` `a₁` at time `t₁` and a candidate-individual `a₂` at time `t₂ > t₁` are the same individual iff (i) their `opda:addressVariant` values are equal (same context-of-presentation), AND (ii) their authoritative source's record asserts continuity from `a₁` to `a₂` (the authority's own lifecycle judgement; for `"title"` variant the authority is HMLR, for `"marketing"` it is the listing agent, for `"inspire"` it is OS AddressBase / Land Registry INSPIRE polygon feed), under the following rules over the hard cases:
>
> 1. **Cosmetic re-format.** Same authority, same record-lineage, different presentation (punctuation, capitalisation, abbreviation, line-break placement, county-name inclusion/omission) → same individual. The IC reads the authority's lifecycle judgement, not the lexical form.
> 2. **Authority-internal succession.** Same authority, new record with `prov:wasDerivedFrom` to the predecessor (HMLR title-plan correction; OS AddressBase row-replacement; agent's listing re-issue) → new individual `a₂` with `prov:wasDerivedFrom a₁`. The predecessor persists in the authority's audit trail; the current address is the successor.
> 3. **Cross-variant identity-claim.** Two instances with *different* `opda:addressVariant` values are *never* the same individual — even if their structured fields agree byte-for-byte. They are co-referring (both `opda:identifiesSameProperty` the same Property) but they are not equal. The marketing-address-of-X and the title-address-of-X may be identical strings yet remain distinct individuals because they carry distinct provenance, lifecycle, and PII regime.
> 4. **Property-side change.** When the bearer Property undergoes a Q5-hard-case event (demolition / subdivision / merger / replacement per ODR-0005 §3a), the Address instance persists or ceases per the authority's response: OS AddressBase retires the UPRN and (eventually) issues new UPRNs to successors — each new Address is a new individual; HMLR amends the title's "location-of-land" descriptor at registry events — new title-address individual `prov:wasDerivedFrom` predecessor.
> 5. **INSPIRE-only locatedness.** A Property with INSPIRE Identifier but no postal address has one Address instance: `opda:addressVariant "inspire"`, structured fields populated from the cadastral feature (or empty if the feature has no derivable line1/postcode), `opda:hasGeometry` interface live, no marketing-address-instance and no title-address-instance (those authorities do not assert continuity on this Property). This is the canonical answer for `rural-plot-inspire-no-uprn.ttl`.

This IC is testable: any maintainer reading the rule and a candidate case produces a determinate answer. It handles the three exemplars: `listed-building-divergent-addresses.ttl` has three Address instances (one per variant) co-referring via the Property; `flat-no-uprn-newly-converted.ttl` has each flat's `"marketing"`-variant address authored even though OS AddressBase has not yet issued a UPRN (the agent's listing is the authority for the marketing variant; the agent has asserted the address); `rural-plot-inspire-no-uprn.ttl` has one `"inspire"`-variant address derived from the cadastral feature, no others.

**The DOLCE grounding.** Masolo et al. 2003 §4.2 (NonPhysicalEndurant — socially-constructed objects persist by the lifecycle judgement of their constructing institution, not by physical continuity). Searle 1995 (institutional facts persist by collective acceptance — operationalised here as authority-record continuity). The IC reads the authority's stewardship, not the data itself.

**Gandon.** Concur on the IC content. The W3C-side artefact-encoding requirement (per the S005 Q2 discipline we established): the IC is encoded in two places — (i) `rdfs:comment` on `opda:Address` stating the IC verbatim with `dct:source` to ODR-0015 §3a; (ii) the SHACL shapes graph references the IC via `dct:references` and the exemplar-harness wires the three exemplars as CI regression tests per ODR-0004 §8a. The IC becomes part of the artefact's persistent semantic surface.

**Pair vote on Q2.**

- **Guizzardi vote: FOR the five-rule IC** — structural composition + context-tag-scoped persistence; cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness over five hard cases; DOLCE NonPhysicalEndurant grounding (Masolo et al. 2003 §4.2 + Searle 1995); tested against the three S015 exemplars.
- **Gandon vote: FOR the five-rule IC + artefact-encoding requirement** — IC stated as `rdfs:comment` on `opda:Address` with `dct:source` to this ODR; exemplars wired as CI regression tests per ODR-0004 §8a (matches the S005 Q2 pattern).

---

### Q3 — Class structure: structured datatype or class with property shapes?

**Gandon (lead).** **Class with property shapes** — `opda:Address` is a resource class with its own URI; structural fields are SHACL property shapes constraining the resource. Reject the structured-datatype alternative.

The W3C-side analysis. RDF supports both literal-typed values (the structured datatype path — Address as a custom `xsd:` datatype with lexical-form parsing) and resource-typed values (the class-with-property-shapes path — Address as `owl:Class`, fields as `owl:DatatypeProperty`s). The choice is driven by what the resource needs to *do*:

- **Does Address have its own URI?** Q1 says yes (Substance Kind). Structured datatype precludes it (literals do not have URIs).
- **Does Address dereference?** Q1 says yes (LDP Principle 3). Structured datatype precludes it.
- **Does Address bear its own predicates (PII tag, variant tag, authority source, provenance)?** Yes — Q7 requires `dpv-pd:Address` co-annotation per ODR-0012; the variant tag is `opda:addressVariant`; the authority is `dct:source`; the succession is `prov:wasDerivedFrom`. Structured datatype precludes all four (literals do not bear predicates).
- **Does Address co-refer to Property?** Yes — `opda:identifiesSameProperty` (the S005 predicate). Structured datatype precludes it (literals cannot be subjects of triples).
- **Does Address have a lifecycle (creation, succession, retirement)?** Yes — Q2 IC §rule 2. Structured datatype precludes it.

The structured-datatype reading is admissible *only* as a denormalised convenience pattern for downstream consumers that want a single literal value (e.g. CSV exports, address-formatting routines). It is realised as a derived property (`opda:Address opda:formattedString xsd:string`) computed from the structural fields, not as the primary representation.

**The structural fields, as SHACL property shapes.**

```turtle
opda:AddressShape a sh:NodeShape ;
    sh:targetClass opda:Address ;
    sh:property [ sh:path opda:line1     ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:line2     ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:postTown  ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:postcode  ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ; sh:pattern "..." ] ;
    sh:property [ sh:path opda:country   ; sh:datatype xsd:string ; sh:minCount 0 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:addressVariant ; sh:in ("title" "marketing" "inspire") ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:identifiesSameProperty ; sh:class opda:Property ; sh:minCount 1 ; sh:maxCount 1 ] .
```

Note: all structural fields are `sh:minCount 0`. The `rural-plot-inspire-no-uprn.ttl` case has *no* `opda:line1` (no postal locator exists); the SHACL shape must accommodate that without firing violations. The single MUST-have predicate is `opda:addressVariant` (the variant tag is the resource's defining attribute) and `opda:identifiesSameProperty` (every Address must locate *some* Property). All other fields are presence-optional.

**Guizzardi.** Concur. The UFO reading is consistent: a Substance Kind has its own URI; its qualities (the structural fields, the variant tag) are encoded as `owl:DatatypeProperty`s domain-restricted to the Kind. The DOLCE quale framing applies to *each field* (postcode is a quale in a postcode-region; country is a quale in a country-code-region) — the qualia are properties of the Address, not the Address itself. The class structure is correct.

**Pair vote on Q3.**

- **Gandon vote: FOR class with property shapes** — `opda:Address` as `owl:Class` with SHACL `sh:NodeShape` constraining structural fields + variant tag + Property co-reference; reject structured-datatype as primary (admissible only as derived denormalised convenience for downstream consumers); all structural fields `sh:minCount 0` to accommodate INSPIRE-only-locatedness cases; `opda:addressVariant` and `opda:identifiesSameProperty` are the MUST-have predicates.
- **Guizzardi vote: FOR class with property shapes** — Substance Kind requires its own URI; qualia are properties on the Kind, not the Kind itself; matches ODR-0005 §6b's `opda:hasAddress` pre-commitment to a resource target.

---

### Q4 — External alignment (INSPIRE / vCard / OS AddressBase Plus)

**Gandon (lead).** Three external alignments, each with a precise discipline drawn from ODR-0005 Q4's UPRN-as-contingent-identifier pattern.

**INSPIRE Identifier as contingent identifier.** Per ODR-0005's UPRN pattern: the INSPIRE Identifier is a *Quality* of `opda:Address` (for variant `"inspire"`) and of `opda:Property` (the spatial-feature pointer per ODR-0005 §3a's `parcelIdentifier` surrogate). It is not the IC of either; it is an authority-assigned identifier under PROV-O succession. The shape:

```turtle
opda:Property opda:parcelIdentifier "urn:opda:inspire:HMLR:200033333" .
opda:Address  opda:inspireFeatureId "urn:opda:inspire:HMLR:200033333" .   # variant: "inspire"
```

INSPIRE feature succession (rare — INSPIRE Identifiers are relatively stable per HMLR INSPIRE polygon feed governance) is captured via `prov:wasDerivedFrom` chains on the Address instance; `dash:uniqueValueForClass` on `opda:inspireFeatureId` is the operational key for the `"inspire"` variant (same Cagle-discipline as UPRN per S005 Q4).

**`vcard:Address` for personal-contact use.** `vcard:Address` (W3C vCard Ontology, Iannella & McKinney eds. 2014) is the canonical class for an address-as-property-of-a-person-or-organisation. ODR-0015 declares `opda:Address rdfs:subClassOf vcard:Address` for personal-contact reuse cases (per ODR-0006 Agents & Roles, when a Person/Organisation has a contact address — that Address inherits both `opda:Address` discipline and `vcard:Address` consumer surface). Reuse is one-directional: vCard consumers can read OPDA addresses; OPDA does not consume vCard-only structural extensions (e.g. `vcard:hasGeo` is superseded by our `opda:hasGeometry` interface per Q5).

**OS AddressBook / OS AddressBase Plus relations.** OS AddressBase Plus is the authoritative source for UK postal addresses (Ordnance Survey *AddressBase Plus Technical Specification* §address lifecycle — already cited in ODR-0005 §3a). The discipline:

- `dct:source` on `opda:Address` (variant `"marketing"` or `"title"` derived from postal-delivery-point lineage) resolves to the OS AddressBase Plus record (URN-shaped per ODR-0004 §7a version-pin discipline).
- `opda:Address opda:uprn xsd:string` carries the UPRN-of-the-address (distinct from the Property's UPRN — addresses can be UPRN-bearing even when the Property's other surfaces do not carry the UPRN directly; this matters for the flat-with-no-UPRN case where the *predecessor* freehold had a UPRN but the *successor* flats do not yet).
- OS AddressBase's address-lifecycle events (UPRN issuance / retirement / split / merger) are captured via the same reified `opda:UPRNSuccessionEvent` pattern as ODR-0005 §6a — the pattern is re-instantiated, not duplicated. Per ODR-0001 A9 §Artefact identity test, this is a third citing artefact (S015 alongside S005) and the SHACL-AF rule is candidate for `pattern`-extraction to a shared UPRN-succession-pattern record. Recorded as a follow-up: extract `opda:UPRNSuccessionRule` from ODR-0005 §6a into a Cross-cutting Pattern ODR when a third citing site (S006 participant addresses with their own UPRN exposure) materialises.

**Guizzardi.** Concur. The UFO reading is consistent across the three: each external standard provides an authority-source for the variant tag (`"inspire"` → INSPIRE; `"marketing" | "title"` derived from OS AddressBase or HMLR record; `vcard:Address` for personal-contact subclassing). The class hierarchy is `opda:Address rdfs:subClassOf vcard:Address` only — INSPIRE features and OS AddressBase records are *sources* (`dct:source`), not parent classes. The Substance Kind commitment is preserved.

**Pair vote on Q4.**

- **Gandon vote: FOR INSPIRE-as-contingent-identifier + vCard-as-superclass + OS-AddressBase-as-source** — INSPIRE Identifier modelled as `opda:inspireFeatureId` Quality with `dash:uniqueValueForClass` + PROV-O succession (re-instantiating ODR-0005 §6a discipline); `opda:Address rdfs:subClassOf vcard:Address` for personal-contact reuse; OS AddressBase Plus resolved via `dct:source` with version-pin per ODR-0004 §7a.
- **Guizzardi vote: FOR all three alignments + recommendation to extract UPRN-succession-pattern** — the re-instantiation of the SHACL-AF succession rule from ODR-0005 §6a here is the second citing site; if S006 produces a third, extract to a shared `pattern` ODR per ODR-0001 A9 §Artefact identity test.

---

### Q5 — GeoSPARQL deferral

**Gandon (lead).** Declare `opda:hasGeometry` as the *interface*; defer GeoSPARQL encoded geometries until a named consumer materialises. The pattern follows ODR-0002's GeoSPARQL Conditional adoption and ODR-0015's §Decision commitment to interface-first.

The interface, stated:

```turtle
opda:Address opda:hasGeometry opda:Geometry .       # range is the interface placeholder
opda:Property opda:hasGeometry opda:Geometry .
opda:Geometry a owl:Class ;
    rdfs:comment "Interface placeholder. GeoSPARQL encoded geometries (geo:asWKT, geo:asGeoJSON, geo:hasGeometry shape) land here when a consumer enters scope." ;
    dct:source <ODR-0015> .
```

**Triggers for admitting GeoSPARQL encoded geometries** (any one fires):

1. **Title-extents enter scope.** HMLR title plans / `titleExtents` GeoJSON in the PDTF v3 base schema (`propertyPack.titleExtents`) — when ODR-0007 or ODR-0008 commits to materialising title-extent polygons, the GeoSPARQL encoding lands here.
2. **LLC1 / Local Land Charges searches enter scope.** Search-area polygons in the LLC1 overlay — when the LLC1 overlay enters scope (likely Phase 3+), the GeoSPARQL encoding lands here.
3. **INSPIRE polygon-feed direct ingest.** Currently INSPIRE Identifiers are carried as opaque URN-shaped identifiers (`urn:opda:inspire:HMLR:200033333`). When a consumer requires the polygon-feed's geometric content directly (rather than via dereferencing the identifier), GeoSPARQL encoding lands here.
4. **Search-radius queries on Property.** When a downstream consumer needs SPARQL-side geo-radius queries (`geof:within`, `geof:nearby`) for property search — GeoSPARQL is admitted.

Until a trigger fires, the interface is sufficient: consumers that need geometric content dereference the INSPIRE Identifier upstream (HMLR's INSPIRE polygon feed serves WKT/GeoJSON on the identifier); consumers that do not need geometric content ignore the interface. The deferral is honest — we are not minting `geo:asWKT` placeholder predicates that imply a commitment we haven't made.

**Guizzardi.** Concur. The UFO reading is consistent: `opda:hasGeometry` is an interface predicate to a Quality (geometric extent) that the Property and Address can bear; the Quality-region (set of admissible geometric extents) is what GeoSPARQL would encode. Deferring the encoding does not defer the *commitment* — the commitment is that Properties and Addresses *have* geometric extent (a UFO Quality); the encoding is the artefact-engineering question of *how* we serialise it.

**Pair vote on Q5.**

- **Gandon vote: FOR `opda:hasGeometry` interface + four-trigger GeoSPARQL admission rule** — title-extents OR LLC1 search polygons OR INSPIRE direct ingest OR search-radius queries fires GeoSPARQL admission; until then, interface is sufficient; honest deferral matches ODR-0002 Conditional adoption.
- **Guizzardi vote: FOR interface + four-trigger** — geometric extent is a UFO Quality on Property and Address; the commitment is made; the encoding is deferred to consumer materialisation.

---

### Q6 — Co-reference SHACL shape

**Guizzardi (lead).** **Multi-address co-reference is `sh:Info` data-quality finding, not `sh:Violation`.** When multiple Address instances `opda:identifiesSameProperty` the same Property and their structural fields disagree, the disagreement is informative (downstream consumers and conveyancers should be aware) but not normative-breaking (the Q1 Substance Kind commitment + Q2 IC explicitly tolerates cross-variant non-agreement — see Q2 IC rule 3).

The shape, stated:

```turtle
opda:AddressCoReferenceShape a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:sparql [
        sh:select """
            SELECT $this ?postcode1 ?postcode2 WHERE {
                ?a1 opda:identifiesSameProperty $this ;
                    opda:postcode ?postcode1 .
                ?a2 opda:identifiesSameProperty $this ;
                    opda:postcode ?postcode2 .
                FILTER(?a1 != ?a2 && ?postcode1 != ?postcode2)
            }
        """ ;
        sh:message "Property {$this} has co-referring Addresses with disagreeing postcodes ({?postcode1} vs {?postcode2}). Data-quality finding."
    ] ;
    sh:severity sh:Info .
```

The shape fires `sh:Info` (not `sh:Violation`) because the Q2 IC explicitly admits cross-variant non-agreement as legitimate (the marketing-address may legitimately differ from the title-address in postcode-area presentation, e.g. when the title's plan was filed before postcode-area boundary changes). The conveyancer or data-quality-reviewer interprets the finding; the SHACL engine does not block.

**A second-tier shape** at `sh:Warning` severity fires when the *same-variant* addresses disagree — e.g. two `"title"`-variant Address instances on the same Property with disagreeing postcodes. Same-variant disagreement is a stricter issue (the same authority cannot consistently say two contradictory things) and warrants Warning, but still not Violation (the data may be in mid-correction; the authority may have a pending update).

**The three exemplar verdicts under the shape.**

- `listed-building-divergent-addresses.ttl`: three Address instances with different `addressVariant` tags; structural fields disagree across variants (`opda:line2 "Glebe Lane"` for `title` vs `"near Wothorpe"` for `marketing`); shape fires `sh:Info` (different variants, legitimate disagreement); no Warning, no Violation. **Pass.**
- `flat-no-uprn-newly-converted.ttl`: each flat (5A and 5B) has one `marketing`-variant `opda:postalAddress` (note: this exemplar uses the literal `opda:postalAddress` predicate, predating S015's class-with-property-shapes commitment; on gate clearance, refactor to `opda:Address` instances with `addressVariant "marketing"`); no co-reference disagreement (one address per Property); shape silent. **Pass.**
- `rural-plot-inspire-no-uprn.ttl`: no `opda:Address` instances at all (INSPIRE-only locatedness; Q2 IC rule 5); the Property has `opda:inspireId` but no co-referring Address yet; shape silent (vacuously satisfied — no addresses to compare). On gate clearance, the exemplar should add an explicit `opda:Address` instance with `addressVariant "inspire"` and `opda:inspireFeatureId` populated, to make the Q1 Kind commitment manifest. **Pass with amendment.**

**Gandon.** Concur. The W3C-side: the shape lives in `opda-shapes.ttl` (the SHACL shapes graph per ODR-0004 §3a, not the annotation graph). The severity tier (`sh:Info` for cross-variant, `sh:Warning` for same-variant) is ratified by ODR-0013 (SHACL Validation & Severity). Per ODR-0001 A9 §Artefact identity test, this is the *third* SHACL-AF rule sitting in `opda-shapes.ttl` at non-Violation severity (alongside ODR-0005 §6a `opda:UPRNSuccessionRule` at `sh:Info`); a `pattern`-extraction candidate for a shared "non-blocking-data-quality-rules" pattern record may materialise downstream.

**Pair vote on Q6.**

- **Guizzardi vote: FOR `sh:Info` cross-variant + `sh:Warning` same-variant co-reference shape** — disagreement across `addressVariant` values is legitimate per Q2 IC rule 3, not a Violation; same-variant disagreement warrants Warning (authority cannot consistently say two things) but not Violation (pending corrections legitimate).
- **Gandon vote: FOR two-tier shape in `opda-shapes.ttl`** — `sh:Info` and `sh:Warning` severities ratified by ODR-0013; shape lives in shapes graph per ODR-0004 §3a; `pattern`-extraction candidate (alongside ODR-0005 §6a) for a shared "non-blocking-data-quality-rules" pattern record.

---

### Q7 — PII tagging (DPV co-annotation handoff to ODR-0012)

**Guizzardi (lead).** Every `opda:Address` bears `dpv-pd:Address` as a baseline DPV co-annotation; stricter category tags depend on Q1's Substance Kind commitment + Q2's IC. The handoff to ODR-0012 (Data-Governance Layer) is mechanical given the Q1 verdict.

Per Baker+Pandit's S005 §6b constraint ("Address-as-mode means PII attaches to mode-instances; Address-as-resource means PII attaches to resource-instances"), our Q1 Substance Kind verdict resolves the constraint: **PII attaches to resource-instances**. Each `opda:Address` instance bears its own `dpv-pd:Address` tag; PII regime is class-level for `opda:Address` (every instance MUST be tagged) and instance-level refinements track the variant:

- **`addressVariant "title"`** — bears `dpv-pd:Address` (the address) AND `dpv:hasLawfulBasis dpv:PublicTask` (HMLR open-register lawful basis per ODR-0005 §3c's `RegisteredTitle` PII regime — Pandit's Q3+Q5 amendments). The title-address is published on the HMLR open register; its PII regime is ICO-public-task-lawful-basis territory.
- **`addressVariant "marketing"`** — bears `dpv-pd:Address` AND `dpv:hasLawfulBasis dpv:Consent` OR `dpv:LegitimateInterest` (the listing-agent's processing basis; ODR-0012 owns the specifics).
- **`addressVariant "inspire"`** — bears `dpv-pd:Address` AND `dpv:hasLawfulBasis dpv:PublicTask` (INSPIRE Directive open-data lawful basis; analogous to HMLR open-register for the cadastral surface).

The class-level baseline (`opda:Address` always bears `dpv-pd:Address`) discharges Baker+Pandit's constraint at the Q1 level. The variant-conditional refinements are tracked at instance authoring; ODR-0012's DPV co-annotation harness consumes them.

**Routing decision.** The DPV co-annotation authoring authority is ODR-0012 (Data-Governance Layer) per Scope-Check 1 Q5 refinement. ODR-0015 *declares* that PII tagging attaches at the resource level (per Q1) and identifies the three variant-conditional refinements; ODR-0012 *authors* the DPV co-annotation triples + the lawful-basis-per-variant assignments. The boundary matches ODR-0005's Pandit-amendment routing.

**Gandon.** Concur. The W3C-side: DPV (Pandit et al., *Data Privacy Vocabulary*, W3C Community Group, 2024 stable cut) is consumed via `dpv-pd:` prefix declarations in the annotation graph (`opda-annotations.ttl` per ODR-0004 §3a) — DPV co-annotations are advisory annotations, not shape constraints; they do not live in `opda-shapes.ttl`. ODR-0012 owns the annotation-graph authoring; ODR-0015 owns the class-level commitment (every `opda:Address` MUST bear `dpv-pd:Address`). The two-layer split (class commitment here; instance authoring there) matches ODR-0004 §3a's three-graph separation.

**Pair vote on Q7.**

- **Guizzardi vote: FOR class-level `dpv-pd:Address` baseline + variant-conditional refinements routed to ODR-0012** — Q1's Substance Kind commitment resolves Baker+Pandit's S005 §6b constraint (PII attaches to resource-instances); three variant-conditional refinements identified (`title` → `PublicTask` HMLR open-register; `marketing` → `Consent`/`LegitimateInterest`; `inspire` → `PublicTask` INSPIRE Directive); ODR-0012 owns specifics.
- **Gandon vote: FOR class-level baseline + ODR-0012 routing** — DPV co-annotations live in `opda-annotations.ttl` per ODR-0004 §3a; ODR-0015 commits at the class level; ODR-0012 authors at the instance/variant level.

---

### Q8 — Exemplar pass

**Guizzardi (lead) and Gandon (joint).** All three exemplars survive the proposed cure with named amendments. Walking through each:

**Exemplar 1: `flat-no-uprn-newly-converted.ttl` (Flats 5A and 5B Linden Road).**

- **(a) Class instantiation.** Two `opda:Property` instances (5A and 5B) with `prov:wasDerivedFrom` to predecessor (subdivision per ODR-0005 §3a rule 2). Currently uses literal `opda:postalAddress` predicate (predating S015); **amendment**: refactor to `opda:Address` resource instances with `addressVariant "marketing"`, `opda:line1`/`opda:postTown`/`opda:postcode`/`opda:country` populated, joined to each Property via `opda:hasAddress`.
- **(b) IC over the hard case.** UPRN absent fires Q2 IC rule 5 partially (no `"inspire"` variant either — purely `"marketing"`); each new Address is a new individual (authority = listing agent has issued the marketing-presentation; no predecessor at the marketing-variant level because the predecessor freehold's `"marketing"` variant retired with the freehold). IC gives the right answer.
- **(c) SHACL key.** `opda:uprn` absent on both Property and Address; `dash:uniqueValueForClass` vacuously passes (Cagle graceful-degradation pattern from ODR-0005 §6a); Q6 co-reference shape silent (one Address per Property, no co-reference disagreement). No `owl:sameAs`.

Pass with refactor amendment.

**Exemplar 2: `listed-building-divergent-addresses.ttl` (The Old Rectory).**

- **(a) Class instantiation.** Already correctly authored under Q1 Kind commitment — three `opda:Address` instances each typed `a opda:Address`, each with `opda:addressVariant`, each co-referring via `opda:identifiesSameProperty`. The exemplar's authored discipline matches the Kind reading natively. **No amendment needed.**
- **(b) IC over the hard case.** Three variants on one Property; cross-variant non-agreement (different `opda:line2` values for `title` vs `marketing`); Q2 IC rule 3 makes this legitimate (cross-variant identity-claim never collapses); each Address is its own individual.
- **(c) SHACL key.** UPRN present on Property (`100070888000`); `dash:uniqueValueForClass` fires no violation; Q6 co-reference shape fires `sh:Info` for cross-variant `opda:line2` disagreement (legitimate finding); no Warning, no Violation. No `owl:sameAs`.

**Pass — load-bearing for the Q1 Kind commitment.** This exemplar exists to test multi-variant co-reference; the Q1 Kind verdict + Q2 IC + Q6 shape together give the right answer; the Mode-only reading would have struggled (would have needed three Modes hanging off Property with their own URI shape — workable but operationally heavier).

**Exemplar 3: `rural-plot-inspire-no-uprn.ttl` (Hereford grazing plot).**

- **(a) Class instantiation.** `opda:Property` with `opda:inspireId` but no `opda:Address` instance currently authored; `opda:RegisteredTitle` present. **Amendment**: add an explicit `opda:Address` instance with `addressVariant "inspire"`, `opda:inspireFeatureId "urn:opda:inspire:HMLR:200033333"`, structural fields empty or sparse (the cadastral feature may have no derivable `opda:line1`/`opda:postcode`), `opda:identifiesSameProperty opda-x:property`. This makes the Q1 Kind commitment manifest for the INSPIRE-only-locatedness case.
- **(b) IC over the hard case.** Q2 IC rule 5 (INSPIRE-only locatedness) fires directly: one Address instance with `addressVariant "inspire"`, no `"marketing"` or `"title"` variants (those authorities do not assert continuity here); `opda:hasGeometry` interface live (Q5 deferral; no GeoSPARQL encoding yet). IC gives the determinate answer.
- **(c) SHACL key.** UPRN absent on Property; `dash:uniqueValueForClass` vacuously passes; `opda:inspireFeatureId` Q4 operational key on the Address fires no violation (unique per `"inspire"` variant); Q6 co-reference shape silent (one Address, no co-reference disagreement). No `owl:sameAs`. **`opda:hasGeometry` interface declared but not encoded** — Q5 deferral honoured.

Pass with amendment.

**Summary verdict on Q8.** All three exemplars pass under the proposed cure (Q1 Substance Kind + Q2 five-rule IC + Q3 class with property shapes + Q4 external alignment + Q5 interface deferral + Q6 two-tier `sh:Info`/`sh:Warning` shape + Q7 class-level `dpv-pd:Address` baseline). Two amendments scheduled: refactor exemplar 1 from literal `opda:postalAddress` to `opda:Address` resource shape; add `opda:Address` instance with `addressVariant "inspire"` to exemplar 3 to make the INSPIRE-only-locatedness case manifest. Exemplar 2 already authored correctly under the Q1 Kind commitment (load-bearing test of multi-variant co-reference).

The exemplars become CI regression tests against the IC per ODR-0004 §8a; when a future change to Q1/Q2/Q3 breaks an exemplar, CI fails.

**Pair vote on Q8.**

- **Guizzardi vote: FOR pass on all three exemplars + two amendments scheduled** — refactor exemplar 1 to `opda:Address` resource shape; add `opda:Address` instance to exemplar 3 for INSPIRE-only-locatedness manifest. Exemplar 2 authored correctly under Q1 Kind commitment.
- **Gandon vote: FOR pass on all three + amendments + CI wire-up** — exemplars become CI regression tests per ODR-0004 §8a discipline; `expected-report.ttl` pairings authored in follow-up author-only session when SHACL shapes graph crystallises.

---

## Cross-cutting concerns

**Thread 1: The per-kind discipline contract from A9.** ODR-0015 is the *second* `kind: pattern` ODR to discharge under ODR-0001 A9 (ODR-0005 was first). The pressure-test is that `## Rules` names (a) UFO Substance Kind / DOLCE NonPhysicalEndurant for `opda:Address`, (b) IC over five named hard cases (cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness), (c) artefact realisation via class with property shapes + variant-tag SHACL + co-reference shape + DPV co-annotation handoff. All three legs present; the A9 amendment continues to operate as expected. The "first `pattern` ODR sets the template" claim from ODR-0005's S005 Q8 verdict holds: S015 inherits the template and discharges in the same shape.

**Thread 2: Substance-Kind-vs-Mode revisited.** In S005 Q6 our pair carried "Address-as-Mode of presentation"; in S015 Q1 we revise to "Address-as-Substance Kind with `addressVariant` Quality." The revision is exemplar-driven (the rural-plot case forces it) and external-standards-driven (INSPIRE/vCard/OS AddressBase all model Address as a feature/class/record). The Guarino S001 Q4 framing ("address is a mode of presentation, not a bearer") is preserved as the *semantic content* of `opda:addressVariant`, not as the UFO meta-category. This is a *refinement* of the S005 Q6 position, not a contradiction: the conceptual point Guarino named is rendered technically as a Quality on a Kind, not as a UFO Mode in the OntoUML sense. We record this clearly so future panellists can re-open if they disagree with the revision; the held-as-live dissent path is open.

**Thread 3: PROV-O succession as cross-cutting substrate.** Q2 (Address IC rule 2), Q4 (INSPIRE feature succession; OS AddressBase row-replacement), and Q6 (multi-variant co-reference) all interface with `prov:wasDerivedFrom`. The pattern is consistent with ODR-0005 §6a (UPRN succession) and ODR-0009's PROV-O backbone (S001 Q6, Moreau's analysis). ODR-0015 contributes the *Address-side* PROV usage; the cumulative weight of PROV-O re-use across S005, S009, and S015 makes this a strong candidate for `pattern`-extraction per ODR-0001 A9 §Artefact identity test — a shared "contingent-identifier-succession" pattern record that S005, S009, S015 all `implements:`. Recorded as a follow-up scope-check candidate.

**Thread 4: The W3C alignment story.** The Q1–Q8 verdicts cohere as a single W3C-and-foundational-ontology-grounded modelling:

- UFO Substance Kind + DOLCE NonPhysicalEndurant grounding ↔ A9 §(a) discipline.
- IC over five hard cases ↔ A9 §(b) discipline + OntoClean (Guarino & Welty 2002/2009) lineage.
- Class with property shapes ↔ RDF 1.1 + SHACL Core (Knublauch & Kontokostas eds. 2017) §4 + LDP Principle 3 (Heath & Bizer 2011 Ch. 2).
- INSPIRE Identifier as contingent identifier ↔ ODR-0005 Q4 UPRN-as-Quality pattern + PROV-O Rec (Moreau & Missier 2013).
- `vcard:Address` superclass ↔ W3C vCard Ontology (Iannella & McKinney eds. 2014).
- GeoSPARQL interface ↔ ODR-0002 Conditional adoption + OGC GeoSPARQL.
- `sh:Info` / `sh:Warning` co-reference shape ↔ SHACL Recommendation §4 + ODR-0013 severity tier.
- DPV co-annotation routing ↔ DPV Community Group + ODR-0012 authoring authority.

The Substance Kind commitment discharges what A9 requires; the artefact realisation discharges what LDP requires; the external alignment discharges what INSPIRE/vCard/OS AddressBase require. The verdicts cohere.

**Thread 5: B2 pilot — extending the consensus-mode hive-mind/byzantine discipline to S015.** Per ODR-0005 §Consequences, the B2 pilot recommended EXTEND CAUTIOUSLY to S011 Q8 + S015. This session is the S015 leg of the B2 pilot's three-pilot threshold for EXPAND (full adoption). The convening as Reduced Council with structured per-question votes from each voice (FOR/AGAINST/ABSTAIN with verdict-shape) is the B2-discipline narrative + structured-tally form. Pair-internal alignment on Q1–Q8 is high (Guizzardi-led + Gandon-concur on Q1/Q2/Q6/Q7; Gandon-led + Guizzardi-concur on Q3/Q4/Q5); the third-pilot evidence for full EXPAND adoption depends on the Queen synthesis recording the structured tally cleanly.

---

## DA anticipation

**The Devil's Advocate for S015 is Dean Allemang** (per the ODR-0015 §Convening constraints). We anticipate his published methodology's central attack and engage head-on.

### Allemang's "working ontologist" structured-datatype push-back

**Anticipated position.** "Three classes is over-modelling. Address is a structured datatype. The pragmatic enterprise-KG move is `opda:Address` as a complex literal — line1/line2/postcode/country as string components of one value, no separate URI, no SHACL shape on the Address-as-resource, no PII tag at the Address level (the tag is on the Property's `opda:hasAddress` predicate). Per Allemang & Hendler 2020, *Semantic Web for the Working Ontologist*, 3rd ed., Ch. 8 (Minimal modeling) and Ch. 11 (Patterns for Data Modeling — *RDF Lists*, *Tuples as Blank Nodes*), the discipline is to model the minimum that supports the use cases. Show me a consumer query that fails if Address is a structured datatype. The S015 Q1–Q8 cure is 200-line ontology-theatre for what a single `xsd:anyURI`-keyed string field handles in practice. The exemplars do not force a Substance Kind commitment — they force a structural commitment, which a structured datatype provides for free."

**Engagement.** Allemang's challenge is right on the minimal-modeling discipline; the question is what is minimal *here*. The structured-datatype reading is *not* minimal for the use cases we have committed to. Five consumer queries fail under the structured-datatype reading:

1. **The DPV co-annotation query.** "Find all Addresses tagged `dpv-pd:Address` under `dpv:hasLawfulBasis dpv:PublicTask`." Under structured datatype, the tag attaches to the predicate `opda:hasAddress`, not to the value; the value is a literal with no graph identity. The query has no `?x dpv-pd:Address` binding to return. The Q7 PII routing to ODR-0012 collapses.
2. **The multi-variant co-reference query.** "For Property P, list the three address variants and flag postcodes that disagree." Under structured datatype, the variant tag would need to be encoded in the literal's lexical form (e.g. `"title|The Old Rectory|Glebe Lane|PE9 2RW|GB"` parsed); the SHACL co-reference shape (Q6) requires SPARQL over the literal's parsed structure, which `sh:sparql` cannot do without a custom datatype parser. The literal-encoded approach is not SHACL-checkable.
3. **The INSPIRE feature query.** "For Address A with `addressVariant 'inspire'`, return the INSPIRE feature ID." Under structured datatype, the INSPIRE ID would need to be a *separate* property on Property (not on Address), because the Address-as-literal cannot bear `opda:inspireFeatureId`. The Q4 external alignment story collapses — the INSPIRE Identifier is no longer an Address-side identifier; it becomes a Property-side identifier, conflating the spatial-feature pointer with the postal-locator-of-the-Property.
4. **The authority-succession query.** "Trace this Address's lineage back through OS AddressBase row-replacements." Under structured datatype, succession is impossible — the literal has no graph identity to chain. The Q2 IC rule 2 (authority-internal succession) collapses; we lose the ability to audit address-record provenance.
5. **The vCard reuse query.** "For Person P, return their vCard-formatted contact address." Under structured datatype, `opda:Address rdfs:subClassOf vcard:Address` is impossible (literals are not classes). The Q4 personal-contact reuse story collapses.

Five consumer queries fail; the structured-datatype reading is not minimal-for-the-use-cases. **The minimum is class with property shapes** — three from the published Q1–Q8 cure, two from the standing OPDA programme (DPV from ODR-0012; INSPIRE from ODR-0005 Q4 alignment). The Substance Kind commitment is the floor for what works, not the floor for what compiles.

The pragmatic enterprise-KG concern Allemang raises (Ch. 8 minimal modeling) is real but addressed: the class with property shapes is *not* a heavy commitment. Six structural properties + two MUST-have predicates (variant tag + co-reference) + one DPV tag at the class level. The artefact cost is modest; the consumer-query coverage is decisive.

The Allemang-anticipated structured-datatype DA position therefore loses on five named consumer queries. We expect him to either (i) concede on the consumer-query evidence (the canonical DA arc, matches the S005 Q5 8-of-8 withdrawal pattern); or (ii) hold a partial dissent on the "minimum-versus-modelling-overhead" framing with a named re-open trigger ("if 18 months of downstream sessions produce zero consumer queries that actually exercise the Address-as-resource graph identity, the S015 Q1 Substance Kind commitment becomes a re-open consideration"). Either is acceptable per ODR-0001 §Roles DA discipline. The held-as-live dissent path is open.

### Anticipated secondary attack: Guarino S001 Q4 mode-of-presentation framing

**Anticipated position (not the formal DA; an absent-Guarino S001 carry).** "Address is a mode of presentation, not a bearer. Your Q1 Substance Kind commitment treats Address as if it had its own identity beyond presentation. The S001 Q4 framing said it doesn't; you are now contradicting your earlier framing."

**Engagement.** Addressed inline in Q1 and in Cross-cutting concern Thread 2. The Guarino S001 Q4 framing is preserved as the *semantic content* of `opda:addressVariant` (the context-tag), not as the UFO meta-category. "Address is a mode of presentation" means: each Address is presented under a context (title / marketing / INSPIRE); the variant tag records that. It does *not* mean: Address must be a UFO Mode in the technical OntoUML sense. Reading it as the latter over-constrains it and produces the failures the rural-plot exemplar makes manifest. Our Q1 revision is a *refinement* of the S001 Q4 framing, not a contradiction. We expect Guarino (in absentia at this Reduced Council) to either concur with the refinement or hold a principled dissent on the technical-Mode-vs-Quality-on-Kind boundary; the held-as-live path is preserved.

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind, Role, Phase, Relator, Mode, Quale taxonomy).
- Guizzardi, G. et al. (2015). *Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story*. Applied Ontology 10(3-4).
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18. §4.2 (NonPhysicalEndurant; socially-constructed objects).
- Searle, J. (1995). *The Construction of Social Reality*. (Institutional facts; collective acceptance — operationalised here as authority-record continuity for `opda:Address` IC.)
- Guarino, N., Welty, C. (2002, 2009). *An Overview of OntoClean*. In *Handbook on Ontologies*. (Meta-properties Rigidity / Identity / Unity / Dependence — applied here to confirm Substance Kind commitment for `opda:Address`.)
- Hayes, P., Patel-Schneider, P. (2014). *RDF 1.1 Semantics*. W3C Recommendation. §6 (`owl:sameAs` semantics).
- Moreau, L., Missier, P., eds. (2013). *PROV-O: The PROV Ontology*. W3C Recommendation. §3 (`prov:wasDerivedFrom`).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §4 (Core Constraint Components).
- Iannella, R., McKinney, J., eds. (2014). *vCard Ontology — for describing People and Organizations*. W3C Interest Group Note.
- Berners-Lee, T. (1998). W3C TAG Note: "Cool URIs Don't Change".
- Heath, T., Bizer, C. (2011). *Linked Data: Evolving the Web into a Global Data Space*. Ch. 2 (Linked Data Principles).
- Allemang, D., Hendler, J. (2020). *Semantic Web for the Working Ontologist*, 3rd ed. Ch. 8 (Minimal modeling); Ch. 11 (Patterns for Data Modeling); Ch. 13 (FIBO and Enterprise Ontologies).
- INSPIRE Directive (2007/2/EC) Annex I, Theme: Addresses — Address-as-feature with feature URI.
- Ordnance Survey *AddressBase Plus Technical Specification* §address lifecycle (UPRN issuance / retirement / split / merger).
- HM Land Registry *Practice Guide 40 — HM Land Registry plans* (title-address descriptor lifecycle).
- Pandit, H. et al. *Data Privacy Vocabulary (DPV)*. W3C Community Group Report. (DPV co-annotations.)
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment landed 2026-05-27. MUST-level (a)/(b)/(c) discipline for `kind: pattern` ODRs.
- ODR-0004 §Rules 1–8 + §3a/6a/7a/8a — URI namespace, three-graph separation, term-sourcing, exemplar harness.
- ODR-0005 §6a (UPRN succession pattern, re-instantiated here for INSPIRE/OS AddressBase succession); §6b (Address modelling routing to ODR-0015 + `opda:hasAddress` pre-commitment + Baker+Pandit DPV-pattern constraint).
- S001 Q4 transcript — Guarino's "address is a mode of presentation, not a bearer" framing (refined in S015 Q1 as `opda:addressVariant` Quality on `opda:Address` Substance Kind).
- Scope-Check 1 §Q7a — the 8-1 spawn deliberation that produced ODR-0015.
- Diagnostic exemplars (authored 2026-05-27 between-session prep, per ODR-0004 §8a):
  - `source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl` — Address modelling when UPRN absent (refactor amendment scheduled).
  - `source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl` — multi-variant co-reference (load-bearing for Q1 Kind commitment).
  - `source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl` — INSPIRE-only locatedness (Q2 IC rule 5; manifest amendment scheduled).
