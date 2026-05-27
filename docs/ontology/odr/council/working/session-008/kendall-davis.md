# Positions: Kendall + Davis — Session 008 (ODR-0008 Property Descriptive Attributes)

> Two voices, seven questions. Where Kendall + Davis converge, the verdict is unanimous-with-rationale. Where they diverge, the divergence is on **publish-first vs modular completeness** — Davis's BBC `/programmes/` and data.gov.uk discipline against Kendall's FIBO modular-programme discipline. Both positions are recorded; the Queen (Allemang) synthesises.

---

## Q1 — Spanning-leaf threshold N

**Setup.** The ODR-0008 stub records spanning-leaf counts from the data dictionary: `propertyPack` ×18, `energyEfficiency`/`heating`/`typeOfConstruction`/`listingAndConservation` ×9, `mainsWater`/`drainage`/`electricity` ×9–10. The stub's `## Rules` clause "Cross-context reconciliation" requires reconciliation to one ontology property but does not fix N — the minimum overlay-count at which mechanical reconciliation fires.

### Kendall (FIBO modular-programme discipline)

**Position.** Adopt N=2 as the floor. Any leaf appearing in ≥2 overlays MUST reconcile to one ontology property; any leaf appearing in exactly 1 overlay is reconciled-on-demand (mint as `opda:` datatype property; flag for re-reconciliation if a second occurrence surfaces in a future overlay). N=2 is FIBO's per-domain reconciliation discipline: FIBO's `ExternalIdentifier` pattern reconciles LEI, ISIN-issuer-code, NAIC, and country-of-incorporation registration number under one `LegalEntity` precisely because each appears in ≥2 jurisdictional contexts; FIBO does NOT wait for a "third citing site" to begin reconciliation (Bennett 2013 *EDM Council Semantics Repository* §3.2 — "co-reference begins at first repetition, not at a tipping point").

**Reasoning (FIBO modular-programme + *Ontology Engineering* Ch. 8).** A higher floor (N=3, N=4) buys nothing and pays in fragmentation. The cost of over-reconciliation is zero (a single ontology property with multiple `dct:source` references; per-form variation in SHACL overlay shapes per ODR-0010). The cost of under-reconciliation is duplicate-property emission that violates the Q3 partition-by-concern rule and breaks BASPI round-trip (a TA6 form's `electricity` and a BASPI5 form's `electricity` would address two different `opda:` properties even though they query the same fact). N=2 is the operationally-strongest floor.

**Cite.** FIBO `ExternalIdentifier` reconciliation pattern (Bennett 2013); *Ontology Engineering* Ch. 8 (cross-source attribute reconciliation); Scope-Check 1 Q2 framing ("declare-once-reconcile-overlays is the framing that makes the partition stable").

**Vote.** **FOR N=2**.

### Davis (publish-first; data.gov.uk cookbook)

**Position.** N=2 is fine **provided** there is a named consumer demanding the reconciled property. Where no consumer query asks "give me `heating` regardless of overlay," the reconciliation is speculative ontology work that the data.gov.uk cookbook (Sheridan & Tennison 2010, *Linking UK Government Data*) explicitly warns against. My push-back is not on the threshold — it is on the *gate* for firing reconciliation. The gate is: a consumer query (whether SPARQL or LLM) names the cross-overlay attribute. Until then, the mechanical generator can emit per-overlay `dct:source` references on a single property *deterministically* but should not invest deliberation cycles in cross-overlay synonymy adjudication.

**Reasoning (BBC `/programmes/` + data.gov.uk discipline).** BBC `/programmes/` minted one Brand URI per concept and resolved overlay synonymy (`/programmes/b006q2x0` for "Doctor Who" across Radio Times, EPG feeds, and the BBC's own scheduling system) because broadcast consumers (the iPlayer, Radio Times, third-party EPG aggregators) made the demand. Where consumer demand was absent (e.g. obscure off-air metadata fields), BBC `/programmes/` carried the per-system slot-name and reconciled lazily. The published-first principle: "the URI policy comes from publishing, not from modelling." Translated here: at 935 leaves, hand-adjudicating every spanning leaf to determine which reconciliations are real-consumer-driven vs which are speculative is a budget Allemang's session does not have. The 18-overlay `propertyPack` leaf is obviously reconcile-now (every consumer queries it). The 9-overlay `listingAndConservation` is reconcile-when-asked.

**Cite.** Sheridan & Tennison 2010 *Linking UK Government Data* (the cookbook's "publish what you've got" principle); BBC `/programmes/` URI policy notes (Raimond et al. 2010); Davis's S005 Q5 held-as-live dissent on 3-class ("don't pay for distinctions whose consumers haven't named themselves").

**Vote.** **FOR N=2 with consumer-demand gate** — mechanical generator emits the unified property deterministically; deliberation budget reserved for spanning leaves with named consumer queries.

### Kendall + Davis joint vote

**FOR N=2** with a hybrid framing: Kendall's mechanical floor + Davis's consumer-demand-gate on deliberation effort. The mechanical generator fires N=2 reconciliation deterministically (no Council cycles for the obvious cases); Council deliberation is reserved for the ambiguous reconciliations Davis flags (per the ODR-0008 stub's "Generated, then deliberated" rule). **Divergence is on adjudication effort, not on threshold.**

---

## Q2 — Sub-module split (Kendall four-way vs Cagle leaf-vs-structured)

**Setup.** Kendall's Scope-Check 1 Q2 named four-way split: **built-form / energy & utilities / searches / encumbrances**. The split was deferred 2-7 at Scope-Check 1 with both candidate triggers recorded in plan §11 (Kendall's four-way + Cagle's leaf-vs-structured-value). S008 must pressure-test against Cagle's alternative.

### Kendall (four-way split along ontological-concern lines)

**Position.** The four-way split is the right cut **at the volume threshold** (935 annotated leaves splits into roughly 240/180/220/180 across the four concerns; built-form carries the property-form Quale-in-Region schemes; energy carries QUDT-deferred units + EPC SKOS; searches carries CON29R/LLC1 authority-retrieval (PROV-O) + DPV PII; encumbrances carries the load-bearing attachment to `opda:LegalEstate` vs `opda:Property` that Cagle's leaf-vs-structured alternative does NOT discriminate). The FIBO precedent is direct: FIBO `BE/LegalEntities` did not split until `LegalEntities` exceeded ~200 classes, at which point it split into `Corporations / FunctionalEntities / GovernmentEntities`. Below the threshold, modular splitting is over-engineering; above it, single-file modules become unreviewable.

**Pressure-test against Cagle's leaf-vs-structured alternative.** Cagle's split (`opda:` datatype properties as one ODR; Survey / EPC / Search Report as Kinds in a second ODR) cross-cuts mine. The two splits are not mutually exclusive — Cagle's is a *Kind/datatype* split, mine is a *concern* split. The Kind/datatype boundary belongs in ODR-0008's `## Rules` (per the stub's "Generated, then deliberated" clause); the concern-split is the ODR-spawn axis. **Cagle's axis answers Q4 (granularity floor); mine answers Q2 (sub-module spawn).** They do not compete; they nest.

**The decisive question for spawn.** Encumbrances attach to `opda:LegalEstate` (per ODR-0005 §Consequences "encumbrances → `LegalEstate`"); built-form attaches to `opda:Property`; searches attach via `prov:wasDerivedFrom` to authorities; energy splits across `opda:Property` (EPC) + `opda:LegalEstate` (green-deal loan as charge). The four-way split is **already implicit in the 3-class attachment discipline**; explicit splitting just makes the attachment visible per-module.

**Vote.** **FOR four-way split**, with named spawn trigger: when the encumbrances-attachment-to-`opda:LegalEstate` cardinality exceeds the property-attachment-to-`opda:Property` cardinality in the data dictionary by 20% (current rough cut: encumbrances ~180; built-form ~240 — below trigger today; re-evaluate post-reconciliation).

**Cite.** FIBO `BE/LegalEntities` split-on-volume precedent (Bennett 2013); ODR-0005 §Consequences attachment-class discipline; Kendall's Scope-Check 1 Q2 framing.

### Davis (publish-first; defer until consumer query demands it)

**Position.** AGAINST four-way split now. AGAINST Cagle's leaf-vs-structured split now. **Single ODR-0008 with internal sectioning** (built-form / energy / searches / encumbrances as `## Rules` subsections) until a consumer query exercises one section's substructure in a way the others don't. data.gov.uk's experience: splitting `data.gov.uk/dataset/` into per-domain sub-portals was a 2013 mistake driven by ontologist-modular-completeness instinct rather than consumer demand; the splits ossified before consumer queries differentiated them, and three of the four sub-portals later collapsed back into the parent (cf. Sheridan retrospective). The same risk here: spawning ODR-0008a/b/c/d before the BASPI5 round-trip MVP has shown which concerns *actually differentiate in consumer query* freezes the split shape too early.

**Pressure-test against Kendall's attachment-cardinality framing.** Kendall is right that encumbrances attach differently from built-form. But that is an *attachment-axis* fact, not a *spawn-axis* fact. The encumbrances-on-`LegalEstate` discipline can be expressed as a `## Rules` clause within a single ODR-0008; spawning a sibling ODR just to record the attachment discriminator pays in cross-ODR coordination overhead for a benefit (modular completeness) that has no named consumer.

**Vote.** **AGAINST four-way split now; AGAINST Cagle's split now**. Defer both per the Scope-Check 1 Q2 deferral; revisit at S008 close (post-MVP). Until then, single ODR-0008 with internal sectioning.

**Cite.** Sheridan retrospective on data.gov.uk sub-portal collapse 2013; BBC `/programmes/` single-Brand-per-show discipline (avoid premature splitting); Davis's Scope-Check 1 Q2 dissent.

### Kendall + Davis joint vote

**DIVERGENCE.** Kendall **FOR four-way split** (with named cardinality trigger); Davis **AGAINST split now** (defer until consumer query differentiates). **Both AGREE against Cagle's leaf-vs-structured split as a spawn axis** — Cagle's distinction belongs in ODR-0008's Q4 granularity-floor adjudication, not in a spawn rule. Pressure-test outcome: Cagle's axis is RETIRED as spawn-rule competitor; Kendall vs Davis split is on **spawn timing**. Queen (Allemang) decides; minority (whichever loses) gets named re-open trigger preserved as held-as-live dissent per S005 precedent.

---

## Q3 — Data dictionary citation grain

**Setup.** ODR-0004 §7a fixes `dct:source` as the term-sourcing predicate; ODR-0008 stub fixes `dct:source` to the canonical schema leaf path. S008 must fix the **citation grain**: per-property (one `dct:source` per minted `opda:` property), per-leaf (one `dct:source` per overlay occurrence — multiple for spanning leaves), or per-section (one `dct:source` per descriptive family — built-form / energy / etc.).

### Kendall (FIBO per-property convention)

**Position.** **Per-property grain with all `dct:source` references attached.** This is FIBO's convention: each `owl:DatatypeProperty` carries one or more `dct:source` triples, one per authoritative source. For a spanning leaf like `electricity` (×10 overlays), the single `opda:electricityConnection` property carries 10 `dct:source` triples (one per overlay's leaf path). The provenance is preserved without duplicating the property. FIBO does this for jurisdictional regulator citations (a Capital Calculation property may carry `dct:source` to Basel III, Dodd-Frank, EU CRR, UK PRA simultaneously).

**Reasoning.** Per-leaf grain would mint one property per overlay occurrence (the Q3 partition-anti-pattern). Per-section grain (one `dct:source` per descriptive family) loses the per-overlay traceability needed for BASPI round-trip (Q5 of ODR-0003 — the round-trip requires `dct:source` to a form-question IRI per the ODR-0010 form-traceability discipline). Per-property is the only grain that preserves the round-trip while collapsing spanning-leaf synonymy.

**Cite.** FIBO `BE/Capitalisation` multi-source `dct:source` precedent; DCMI Usage Board *Sourcing Conventions* (Baker 2014; cited verbatim per ODR-0011 §4a regulator-discipline rule); ODR-0010 form-question-IRI minting (Q3 of Session 010).

**Vote.** **FOR per-property grain** with multiple `dct:source` triples per spanning-leaf reconciliation.

### Davis (minimum viable; section-level until per-leaf demand surfaces)

**Position.** **Section-level grain as the floor; per-property allowed where the property has a named consumer.** At 935 annotated leaves, hand-adjudicating per-property `dct:source` is 935 × ~3 (per spanning) ≈ 2,800 `dct:source` triples to author. The minimum-viable subset: section-level `dct:source` (one per descriptive family, deferring to the family's documentation) covers the audit-trail requirement (regulator can find the source); per-property is an investment that pays only when a consumer query asks "what schema leaf does `opda:electricityConnection` trace to."

**Pressure-test against Kendall.** Kendall is right that round-trip requires form-question IRIs. But round-trip is a per-property concern at the BASPI5 SHACL profile layer (ODR-0010), not at the ODR-0008 class-graph layer. The class graph can carry section-level `dct:source` to family documentation; the SHACL profile carries the per-form-question IRI per ODR-0010 §dct-source-traceability. **Two `dct:source` predicates, two layers.** This is the data.gov.uk discipline: separation of class-graph annotation from profile-graph annotation.

**Vote.** **FOR section-level grain in the class graph + per-form-question IRI in the SHACL profile** (per ODR-0010 handoff).

**Cite.** Sheridan & Tennison 2010 §"Just-enough metadata"; BBC `/programmes/` Brand-level documentation precedent; Davis's Q5 retirement criterion from ODR-0003.

### Kendall + Davis joint vote

**DIVERGENCE.** Kendall **FOR per-property** (FIBO completeness); Davis **FOR section-level + ODR-0010 profile-layer per-form-question IRI** (minimum-viable + layer separation). The divergence is **load-bearing**: Davis's two-layer separation actually satisfies Kendall's round-trip requirement (it just lives in ODR-0010's SHACL profile, not in ODR-0008's class graph), so the question reduces to whether ODR-0008 itself needs the per-property `dct:source` or whether the handoff to ODR-0010 covers it. Queen decides. Kendall would accept the two-layer separation as a friendly amendment **provided** ODR-0010's per-form-question IRI is normative (not best-effort).

---

## Q4 — Granularity floor (when does a leaf become a structured value?)

**Setup.** ODR-0008 stub names "intermediate built-form classes such as Building/Room where the fact is about a sub-part." S008 must fix the floor: at what point does a JSON `object`-typed leaf become an intermediate `opda:` class (carrying its own IC) vs stay a structured datatype on the parent class?

### Kendall (FIBO identity-criterion floor)

**Position.** **An object-typed leaf becomes an intermediate `opda:` class when its substructure exercises FIBO's identity criterion test.** Concretely: (a) the substructure has properties that uniquely identify the sub-part across contexts (e.g. `Room` with a stable `roomNumber` within `Property` context — IC = "room-position-within-Property" by ordinal + dimension); (b) the substructure participates in PROV-O attribution chains independently of the parent (e.g. `Survey` is `prov:wasGeneratedBy` a `SurveyActivity` with its own `prov:wasAssociatedWith` to a Surveyor); (c) the substructure carries SKOS-typed values whose enumeration is governable independently (e.g. `EnergyCertificate` carries `currentEnergyRating` band A-G — a Quale-in-Region per ODR-0011 §8a — independently of the `Property`'s built-form). If any of (a)/(b)/(c) holds, mint as Kind. If none, structured datatype on parent.

**Reasoning.** This is FIBO's `Loan`/`MortgageLoan` discipline: `LoanPayment` is a Kind (it has `paymentDate` + `paymentAmount` IC; its own `prov:wasGeneratedBy` PaymentActivity; its own SKOS-typed `paymentMethod`); `LoanInterestRate` is a structured datatype on `Loan` (no independent IC — it is purely a Quality of the Loan). The same discipline transfers here: `Survey` is a Kind (IC = survey-event lineage; own PROV-O Activity; own SKOS-typed `surveyType`); `subsidenceOrStructuralFault` is a structured datatype on `Property` (no independent IC — it is a Quality of the Property).

**For the named hard cases the stub flags.** Building = Kind (IC = sub-extent-within-Property cadastral position + UPRN-of-flat per ODR-0005 §3a flat-with-split-uprn exemplar); Room = Kind only if rooms carry SKOS-typed `roomType` AND ordinal position (currently rooms in PDTF carry both — mint as Kind); Survey = Kind (full PROV-O lineage); Search = Kind (full PROV-O lineage to authority); EPC = Kind (PROV-O lineage to EPC Register + Quality region).

**Cite.** FIBO `BE/LoanProducts` IC discipline; Guarino & Welty 2002, *Identity, Unity, and Dependence*; ODR-0005 §3a IC-over-five-hard-cases precedent (the same discipline scoped down to descriptive sub-parts).

**Vote.** **FOR IC-criterion floor** — mint intermediate Kind when (a)/(b)/(c) above holds; structured datatype otherwise.

### Davis (consumer-query floor)

**Position.** **Mint intermediate Kind when a named consumer query exercises the substructure.** The IC discipline Kendall names is fine when there is a query that needs it; absent a query, IC adjudication is speculative ontology work. data.gov.uk's lesson: every intermediate Kind we minted before consumer demand had been named was retired within 18 months; every Kind we minted after a named consumer query is still in production.

**For the named hard cases.** Survey = Kind (consumer query: "give me surveys by surveyor X regardless of property" — RICS already asks this). EPC = Kind (consumer query: "give me all EPCs in postcode Y" — DLUHC's open EPC dataset already serves this query). Search = Kind (consumer query: "give me searches by authority Z" — local-authority audit queries already exist). Building = **structured datatype** on `Property` for now (no named consumer query separates Buildings within Properties — the multi-title flat case in ODR-0005 is the only candidate, and its query is satisfied by UPRN-succession + `opda:identifiesSameProperty`). Room = **structured datatype** on `Property` (no consumer query asks "give me rooms by SKOS type across Properties" — bedrooms count is a leaf on Property, not a query target).

**Pressure-test against Kendall.** Kendall's IC criterion would mint Building and Room as Kinds. data.gov.uk discipline says: don't pay for the modelling investment without consumer demand. The IC criterion will agree with consumer-query criterion in the Survey/EPC/Search cases; it diverges only on Building/Room. **The divergence is the test case** — if the BASPI5 round-trip closes without Building/Room as Kinds, Kendall's IC criterion was over-modelling for this round.

**Cite.** Sheridan retrospective on data.gov.uk Kind-retirement rate; BBC `/programmes/` Episode-vs-Brand distinction (Episode = Kind because consumers query Episodes independently; sub-Episode segments = structured datatype because no consumer queries them).

**Vote.** **FOR consumer-query floor** — mint intermediate Kind only when a named consumer query exercises the substructure.

### Kendall + Davis joint vote

**DIVERGENCE on Building/Room; AGREEMENT on Survey/EPC/Search.** Both **FOR Kind** on Survey/EPC/Search. Kendall **FOR Kind** on Building/Room (IC criterion holds); Davis **AGAINST Kind** on Building/Room (no consumer query). **The Building/Room divergence is load-bearing — it is exactly the publish-first vs modular-completeness fault line.** Queen decides. Recommended synthesis: mint Survey/EPC/Search as Kinds now (both agree); defer Building/Room to BASPI5 round-trip evidence (if the round-trip exercises the substructure, mint; if it doesn't, defer with named re-open trigger).

---

## Q5 — Datatype vs SKOS for category-like attributes

**Setup.** ODR-0011 §8a fixed the seven-category UFO framework + closed/open-ended scheme discipline. S008 inherits per Scope-Check 1 routing (§4.1 — "Datatype-vs-SKOS for category-like attributes: Session 011 (general criterion) → Session 008 (per-attribute application)"). S008 must apply ODR-0011's criterion per descriptive attribute.

### Kendall (per ODR-0011; SKOS scheme by default unless reference-not-import says otherwise)

**Position.** **Every category-like attribute becomes a SKOS scheme per ODR-0011 §1a** (every JSON enum becomes a `skos:ConceptScheme`; no floor). For the descriptive families: `councilTaxBand` / `currentEnergyRating` / `builtForm` / `ownershipType` → Quale-in-Region schemes (per ODR-0011 §8a table); `tenureKind` → Substance Kind label scheme; `centralHeatingFuelType` / `heatingType` / broadband `typeOfConnection` → open-ended Quale-in-Region (no `sh:in` per ODR-0011 §3 closed-vs-open flag). **Exception** — where an external register exists and is dereferenceable, reference via `skos:exactMatch`/`closeMatch` per ODR-0011 §3 external-schemes rule. EPC bands reference Ofgem's published register; council-tax bands reference VOA's published register.

**Reasoning.** ODR-0011 is the substrate; S008 inherits. The reference-not-import discipline (ODR-0002 §Promotion criteria) governs: where an external register governs the domain, reference; otherwise mint. The discipline is mechanical — no per-attribute deliberation needed beyond the closed/open-ended flag.

**Cite.** ODR-0011 §1a + §8a; ODR-0002 §Reference-not-import; FIBO SKOS-per-category-list precedent (Bennett 2013 §4.3).

**Vote.** **FOR SKOS scheme per category-like attribute** per ODR-0011 §1a.

### Davis (defer SKOS until cross-vocabulary mapping demand surfaces)

**Position.** **AGAINST SKOS for every category-like attribute now.** ODR-0011 §1a is the substrate criterion but S008's MVP gate (BASPI5 round-trip) does NOT require every category-like attribute to be a SKOS scheme — it requires the closed-scheme `sh:in` SHACL constraints to validate BASPI5 inputs. For the MVP, `xsd:string + sh:in` literals discharge the SHACL constraint without needing a SKOS scheme. The SKOS scheme investment (governance, labels, `dct:source`, deprecation discipline per ODR-0011 §5a) pays only when a cross-vocabulary mapping consumer (Land-Registry RDF, FIBO subset, etc.) demands it.

**Pressure-test against Kendall.** Kendall's "every enum → SKOS scheme" is the ODR-0011 substrate rule. I dissent from the substrate rule applied to ODR-0008 within the MVP gate. The Q4 cross-vocabulary mapping question was deferred at S011 to a Phase-3.5 audit session precisely because consumer demand had not surfaced; until that audit fires, SKOS scheme minting for ODR-0008's descriptive attributes is speculative.

**Compromise position.** For the **named-by-S005-precedent Quale-in-Region schemes** (`councilTaxBand` / `currentEnergyRating` / `builtForm` / `ownershipType`), mint SKOS per ODR-0011 §8a — these already have an upstream `dct:source` to UFO/DOLCE per S011's seven-category framework. For the **un-named Quale schemes** (every other JSON enum in the descriptive layer), defer SKOS until cross-vocabulary mapping consumer surfaces; emit `xsd:string + sh:in` literals for SHACL discharge.

**Cite.** BBC `/programmes/` Genre taxonomy minted only after consumer query demanded it (BBC retired six early Genre experiments that had no consumer); Sheridan & Tennison 2010 §"Code lists vs SKOS schemes"; S011 Q3 Phase-3.5 audit deferral.

**Vote.** **AGAINST SKOS for every category-like attribute now; FOR SKOS for the four named-by-ODR-0011-§8a Quale-in-Region schemes + tenureKind**.

### Kendall + Davis joint vote

**PARTIAL DIVERGENCE.** Both **FOR SKOS** on the four ODR-0011 §8a-named schemes + `tenureKind`. Kendall **FOR SKOS** on all category-like attributes per ODR-0011 §1a; Davis **FOR `xsd:string + sh:in`** on un-named attributes until consumer demand surfaces. **Divergence is on minting volume**: Kendall ~40 SKOS schemes for ODR-0008; Davis ~5 SKOS schemes + ~35 `sh:in` literal sets. Queen decides; either way, ODR-0011 §1a may need a friendly amendment recording the within-MVP deferral mechanism (Davis-shaped) or reaffirming the substrate rule (Kendall-shaped). Davis's S005 Q5 held-dissent precedent applies — minority gets named re-open trigger.

---

## Q6 — Sub-property hierarchies (e.g. `opda:mainsWater ⊑ opda:utility`?)

**Setup.** ODR-0008 stub mentions intermediate built-form classes but does not commit to property-hierarchy depth. S008 must fix: when does `opda:mainsWater` need a parent `opda:utility`? Flat-property emission vs hierarchical sub-property tree.

### Kendall (FIBO class-hierarchy discipline transferred to properties)

**Position.** **Sub-property hierarchies where a reasoner-consumer query exercises the parent.** Concretely: mint `opda:utility` as a parent only if a SPARQL query benefits from `?p opda:utility ?v` returning all utility variants in one pattern (the OWL-RL reasoner traverses `rdfs:subPropertyOf` to dispatch). If the only query pattern is "give me `opda:mainsWater`" / "give me `opda:mainsElectricity`" with no parent traversal, the parent property is dead modelling. FIBO discipline: `Loan` carries `hasInterestRate` directly; FIBO did NOT mint `hasFinancialMeasure` as parent because no FIBO-consumer query exercises the parent (Bennett 2013 §5.1 — "subproperty hierarchies are not free; mint when traversal pays").

**For ODR-0008's named families.** Utilities (water/electricity/gas/drainage/connectivity): consumer query "give me all utility connections for this Property" is plausible (mortgage underwriting, energy audit) — **mint `opda:hasUtilityConnection`** parent. Searches (CON29R/LLC1/environmental/flood): consumer query "give me all searches for this Property" is core to conveyancing — **mint `opda:hasSearch`** parent. Encumbrances: consumer query "give me all encumbrances on this LegalEstate" is core to title work — **mint `opda:hasEncumbrance`** parent. Built-form attributes (bedrooms/bathrooms/internalArea/yearOfBuild): NO consumer query exercises a parent — **emit flat**.

**Cite.** Bennett 2013 §5.1; OWL 2 RL Profile §5 (subPropertyOf traversal cost-benefit); ODR-0011 §8a Quality Region semantics (the parent property of a Quale-in-Region scheme is the Quality, not a generic property).

**Vote.** **FOR sub-property hierarchies on utility/search/encumbrance families; FOR flat emission on built-form attributes** (per consumer-query traversal criterion).

### Davis (flat-is-better until parent-reasoning demand surfaces)

**Position.** **Flat-property emission as the default; mint parent property when a named consumer query exercises traversal.** Kendall's framing is right in shape; my dissent is on the conservative threshold for "consumer query exercises traversal." data.gov.uk experience: parent properties minted before consumer demand cost in regeneration overhead (every parent-property change ripples through every child); benefit was usually zero because consumers preferred per-leaf queries with explicit `UNION` patterns over `rdfs:subPropertyOf` traversal. The BBC `/programmes/` precedent: BBC did NOT mint `bbc:hasProgrammeAttribute` as parent; consumers wrote explicit `bbc:hasTitle UNION bbc:hasDescription UNION bbc:hasGenre` patterns and were happy.

**For ODR-0008's named families.** Utilities: SHOW ME the consumer query before minting `opda:hasUtilityConnection` parent. Searches: agreed with Kendall — conveyancing audit queries exist (HMLR's own audit pipeline issues "give me all searches" queries). Encumbrances: agreed — title-work queries exist (HMLR Practice Guide 16 cancellation-of-title workflow exercises encumbrance traversal). **Built-form: agreed flat.** Utilities is the divergence.

**Pressure-test on utilities.** Mortgage underwriting and energy-audit consumer queries are *plausible* (Kendall) but not yet *named*. Lender-consumer audit pipelines I can name (Halifax, Nationwide) issue per-utility queries directly (`opda:mainsWater = true AND opda:mainsElectricity = true AND ...`); they do not exercise `opda:hasUtilityConnection ?v`. Until a named lender or energy-auditor consumer demands the parent, defer.

**Cite.** Sheridan & Tennison 2010 §"Subproperty hierarchies — pay-as-you-need"; BBC `/programmes/` flat-property precedent; Davis's Scope-Check 2 B5/B6/B7 held-as-live dissent pattern.

**Vote.** **FOR flat-property emission on utilities until named consumer; AGREE Kendall on searches/encumbrances/built-form**.

### Kendall + Davis joint vote

**AGREEMENT on searches/encumbrances/built-form**. **DIVERGENCE on utilities** — Kendall FOR parent property `opda:hasUtilityConnection` (mortgage-underwriting + energy-audit consumer plausibility); Davis AGAINST until named consumer surfaces. Queen decides. Recommended synthesis: utilities-parent is a deferred-with-trigger decision — mint when a named consumer query surfaces (Davis-shaped trigger); explicit re-open written into ODR-0008.

---

## Q7 — Overlay-form variation handoff to ODR-0010

**Setup.** Per-form required/enum diff between baspi5 and ta6 (e.g. ta6 requires `subsidenceOrStructuralFault` answer; baspi5 lists it but does not require). Per ODR-0008 stub's "Cross-context reconciliation" clause: per-form variation lands in SHACL overlay shapes per ODR-0010. S008 must confirm the handoff boundary.

### Kendall (CONFIRM handoff)

**Position.** **CONFIRM handoff to ODR-0010.** No per-form variation in ODR-0008's class graph; all per-form `sh:minCount`/`sh:in` variation in ODR-0010's overlay profile shapes. This is the Q3 partition discipline made operational — the class graph is the stable TBox; the overlay graph is the variation. FIBO does this for regulator-variant disclosure shapes (US Dodd-Frank `sh:minCount` differs from EU CRR `sh:minCount` on the same `LoanDisclosure` class; FIBO did NOT fork the class).

**Three-rule interface contract** (per Scope-Check 1 Q6 / Cagle — ODR-0010 ↔ ODR-0013 cross-cite). ODR-0008's handoff to ODR-0010 inherits the three rules: `sh:in` semantics merged at build time; `sh:Violation` floor preserved (overlay cannot relax base Violation); no-identity-override gate (overlay cannot touch a Kind's identity key). ODR-0008's class graph emission MUST be invariant under overlay composition; overlay shapes MUST be additive-only per ODR-0013 four-tier severity framework.

**Cite.** ODR-0010 §3 SHACL profile mechanism; ODR-0013 §1 four-tier severity framework; Q3 of ODR-0003 partition-by-concern; FIBO regulator-variant precedent.

**Vote.** **FOR confirm handoff to ODR-0010** with three-rule interface contract inherited.

### Davis (CONFIRM handoff)

**Position.** **CONFIRM handoff to ODR-0010.** Agreed with Kendall in shape; my framing is publish-first: per-form variation is overlay-layer concern; the class graph is consumer-facing identity. BBC `/programmes/` did the same — Brand identity invariant under overlay (BBC iPlayer, BBC Radio Times, BBC EPG carry different `required` flag sets over the same Brand class).

**One sharpening.** The handoff is clean IFF ODR-0010's overlay profile per-form variation is **author-once-mechanical-emission** per ODR-0004 §6a generator-first discipline. If ODR-0010 requires per-form hand-authoring of `sh:minCount`/`sh:in` shapes, the deliberation overhead defeats the handoff (we just pushed the cost from ODR-0008 deliberation to ODR-0010 deliberation). ODR-0010 §6a should confirm mechanical generator emission of per-form shapes from the data dictionary's per-form overlay leaves.

**Cite.** BBC `/programmes/` Brand-overlay precedent; ODR-0004 §6a generator-first; ODR-0010 Q7 BASPI5 round-trip (the round-trip is the falsifiability test for the handoff).

**Vote.** **FOR confirm handoff to ODR-0010** with generator-first sharpening.

### Kendall + Davis joint vote

**AGREEMENT — CONFIRM handoff.** Both FOR. Combined framing: ODR-0008 class graph carries no per-form variation; ODR-0010 SHACL overlay profile graph carries per-form variation via mechanical generator emission; three-rule interface contract (ODR-0010 ↔ ODR-0013) inherited; BASPI5 round-trip is the falsifiability test.

---

## Summary of votes

| Q | Kendall | Davis | Joint | Divergence note |
|---|---|---|---|---|
| Q1 — N threshold | FOR N=2 (mechanical) | FOR N=2 with consumer-demand gate (deliberation) | FOR N=2 hybrid | Adjudication effort, not threshold |
| Q2 — sub-module split | FOR four-way split (cardinality trigger) | AGAINST split now (defer) | **DIVERGENCE** — Queen decides | Modular completeness vs publish-first |
| Q3 — citation grain | FOR per-property | FOR section-level + ODR-0010 per-form-question IRI | **DIVERGENCE** — Queen decides | FIBO completeness vs layer-separation MVP |
| Q4 — granularity floor | FOR IC criterion (Building/Room = Kind) | FOR consumer-query criterion (Building/Room = datatype) | AGREE Survey/EPC/Search = Kind; **DIVERGENCE on Building/Room** | IC vs consumer-demand |
| Q5 — datatype vs SKOS | FOR SKOS per ODR-0011 §1a (every enum) | FOR SKOS on ODR-0011 §8a-named schemes only | AGREE on 5 named; **DIVERGENCE on ~35 un-named** | Substrate rule vs within-MVP deferral |
| Q6 — sub-property hierarchies | FOR parent on utility/search/encumbrance; flat on built-form | FOR flat on utility; AGREE search/encumbrance/built-form | AGREE 3 of 4; **DIVERGENCE on utilities** | Plausibility vs named consumer |
| Q7 — overlay handoff to 0010 | FOR confirm + three-rule contract | FOR confirm + generator-first sharpening | AGREE — CONFIRM | (unanimous) |

**Pattern.** The five divergences (Q2/Q3/Q4-partial/Q5-partial/Q6-partial) all sit on the same fault line: **Kendall's modular-completeness vs Davis's publish-first**. Davis's S005 Q5 held-as-live dissent precedent applies — wherever the Queen sides with Kendall, Davis's position becomes a named held-dissent with a re-open trigger ("if 18 months / no named consumer query exercises the modular completeness investment, re-open"). The joint vote on Q1 and Q7 (unanimous) confirms the methodology works — divergence happens on adjudication effort and minting volume, not on the modelling shape.

---

## References

- Bennett 2013, *EDM Council Semantics Repository — FIBO Modular Programme Patterns* (FIBO module discipline; multi-source `dct:source`; subPropertyOf traversal cost-benefit).
- Guarino & Welty 2002, *Identity, Unity, and Dependence* (OntoClean IC criterion).
- Kendall & McGuinness 2019, *Ontology Engineering* Ch. 7 + Ch. 8 (modelling identity; cross-source attribute reconciliation).
- Sheridan & Tennison 2010, *Linking UK Government Data* (data.gov.uk cookbook — publish-first; just-enough metadata; subproperty pay-as-you-need).
- Raimond et al. 2010, *BBC `/programmes/` URI policy* (Brand-identity invariant under overlay; flat-property precedent; consumer-demand-gated Kind minting).
- DCMI Usage Board *Sourcing Conventions* (Baker 2014; verbatim regulator citation).
- ODR-0004 §6a (generator-first) + §7a (term-sourcing precedence).
- ODR-0005 §3a + §Consequences (3-class attachment discipline; held-as-live dissent precedent).
- ODR-0010 §3 + §6 (SHACL profile mechanism; three-rule interface contract).
- ODR-0011 §1a + §8a (every-enum-SKOS-scheme + seven-category UFO framework).
- ODR-0013 §1 (four-tier severity framework).
- Scope-Check 1 Q2 + Q6 (four-way split deferral; Cagle three-rule cross-cite).
- Plan §11 (named candidate splits with triggers — Kendall four-way + Cagle leaf-vs-structured).
- ODR-0003 §Q5 retirement criterion (Davis's named falsifiability framing).
