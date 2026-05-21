# Positions: Kendall (Queen) + Davis

## Expert: Elisa Kendall (Queen)

### Q1 — Genuine deliberation or mechanical translation?

**Position:** Genuine deliberation, with the caveat that the deliberation is methodologically constrained, not free-form. PDTF v3 is not raw input to ontology engineering — it is a *requirements artefact*. The Council's job is to recover the conceptual model that the JSON Schema *should have expressed* and didn't, then commit it. That is not mechanical because JSON Schema is structurally incapable of expressing the entity types, role hierarchies, and identity criteria that an OWL TBox makes first-class; but it is not unbounded either, because the schema and its sister documents (BASPI, TA6, NTS) constitute the authoritative empirical record of what residential-property transactions in England & Wales actually need to capture.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** In *Ontology Engineering* (Allemang/Hendler/Kendall and Kendall/McGuinness, 2019) the work begins with competency questions and existing artefacts — schemas, glossaries, regulatory texts. FIBO itself was built by taking ISO 20022, ISDA definitions, and member-firm reference data as inputs and re-expressing them in OWL with proper class/role separation, identity criteria, and reuse of upper-ontology distinctions (LCC, BFO 2 ISO alignment). The output is not "the schema in turtle." It is a model that asserts what the schema only implies — that `Participant` is not a class but a *role* played by an `Agent`; that `Property` (the physical thing) is distinct from `OwnershipInterest` (the legal thing) which is distinct from `TitleRegistration` (the recorded thing); that `propertyPack.uprn` and `energyEfficiency.certificate.uprn` co-refer because UPRN is an identifier *for the physical referent*, not a property of the JSON path. The schema does not say any of this. The ontology must. So the Council deliberates over identity criteria, role/kind distinctions, and reuse boundaries — exactly the issues Guarino will press on Q4.

**Vote:** AGREE — but with the recorded amendment that the Council brief should explicitly name the schema as a requirements input, not a translation target. Guarino's anticipated attack on "data-model-only constraint" is partially right: if we treat PDTF v3 as the *thing to be translated*, we replicate its defects. If we treat it as one of several authoritative inputs to a re-expression in OWL, the methodology is sound. I want that distinction in the synthesis.

**Challenge or alternative:** Mechanical translation would produce an ontology with `pdtf:Participant` as an `owl:Class`, `pdtf:role` as a `xsd:string`-typed datatype property, `pdtf:propertyPack` as a class whose members are unidentified blank nodes, and 200+ `pdtf:yesNo` boolean properties with no class anchoring. That is what every published JSON-Schema-to-OWL converter does. None of those outputs would survive a FIBO-style review. The Council exists precisely to prevent that outcome.

### Q2 — Vocabularies IN/OUT?

**Position:** IN: RDF/RDFS/OWL/XSD/SHACL/SKOS/DCT/VANN (the unconditional Core); PROV-O, DASH, ODRL, DPV family. ArchiMate, BBO, OWL-Time, DCAT, SSSOM/SEMAPV — DEFER to second phase. Schema.org and FIBO — defer per ODR-0002. Add to the catalogue: **OBO RO (Relation Ontology)** for the part-of / member-of relations property has with itself (flat → block, parcel → estate), because RDFS subproperty hierarchies alone won't carry the transitivity semantics cleanly.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** FIBO settled the "what's in the kit" question by adopting LCC for upper-level distinctions, SKOS for code lists, and OMG-grade OWL 2 DL for the business model. The OPDA Core is broadly equivalent. Where I push back on ODR-0002 is the eager admission of DPV-GDPR-PD-LEGAL family in the same Conditional tier as PROV-O and DASH. DPV's surface area is *enormous* (300+ classes across the family, multi-year-evolving), and the DPV WG's own examples mix it with PROV-O in non-obvious ways. For a TBox-only first round, DPV should be *referenced by URI* on personal-data-bearing properties (via `dpv:hasPersonalData` or equivalent) but not *imported* — exactly the canonical-URI-plus-local-SHACL pattern ODR-0002 specifies. That's adoption-without-coupling. ODRL is fine for the same reason: it is small enough to import a focussed slice for sale-related licensing without dragging in the whole rights-expression apparatus.

BBO out — process modelling is not in scope this round, and PDTF v3 does not express workflow as data anyway (status fields, milestone fields, but no formal process model). ArchiMate out — there is no service or capability catalogue task on the table; admitting ArchiMate now is exactly the "vocabulary good-for-no-immediate-task" anti-pattern. OWL-Time and DCAT: OWL-Time only if the ontology needs interval semantics over transaction phases (probably yes, but not in MVP); DCAT only if OPDA publishes the ontology itself as a catalogue entry on a public portal (defer).

SSSOM/SEMAPV will become essential the moment we start mapping to schema.org, FIBO subsets, or the HM Land Registry's own RDF vocabularies — but that work is post-MVP. Listing them now is correct; using them now is premature.

**Vote:** AGREE with the ODR-0002 tiering, conditional on (a) DPV being *referenced not imported*, (b) BBO/ArchiMate explicitly demoted to Defer for this round, (c) OBO RO added to the Conditional tier for transitive part-of relations on property aggregates.

### Q3 — Work partition?

**Position:** Partition along the lines of the FIBO module taxonomy, not along PDTF schema-file boundaries. Four modules: (1) **Agents & Roles** — natural persons, organisations, agents acting in capacities; the role-played-by pattern; PROV-O alignment. (2) **Property & Land** — physical property, UPRN/INSPIRE-ID/address identity, legal estate, registered title. (3) **Transactions & Lifecycle** — transaction-as-event, milestones, status; the verb half of the model. (4) **Claims, Evidence & Provenance** — verifiedClaims as PROV-O-backed assertions; SHACL contracts for evidence shape; DPV for personal-data flags.

Overlays (BASPI, TA6, NTS, LPE1, CON29R, etc.) become **SHACL profiles** layered on the same TBox — they are *contracts*, not *classes*. This is the FIBO module pattern almost line-for-line.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** FIBO partitions along ontological concerns (Foundations, Business Entities, Financial Business and Commerce, Securities, Derivatives, etc.) — *not* along source documents (ISO 20022 chapter, ISDA paper, Basel chapter). The reason is reuse: when an entity like `LegalEntity` is needed in five FIBO modules, it must be declared once, in `BE/LegalEntities`, and reused. The same logic applies here: `Address` is needed in Property identity, Participant contact, and Local Land Charges location. If we partition by `propertyPack.address` vs `participants[].address`, we duplicate. If we partition by ontological concern (Geography & Addressing → reused everywhere), we don't.

Davis will likely push for partitioning along publication URLs / dereferenceability. That's a separable concern: the *module* structure organises the work; the *namespace + URL strategy* organises publication. FIBO does both — modules in source, single canonical namespace per published module. I would adopt the same split here.

**Vote:** AGREE with FIBO-style ontological partition. **DISAGREE** with any partition that mirrors `pdtf-transaction.json` + `overlays/baspi5.json` + … one-to-one — that path leads back to mechanical translation.

### Q4 — Property defect resolution?

**Position:** Resolve in three moves. (1) **Introduce `pdtf:Property`** as an `owl:Class` (kind, in Guarino's terms — identity-bearing physical referent). (2) **Make UPRN the rigid identifier** via `owl:hasKey ( pdtf:uprn )` where present; declare `pdtf:inspireId`, `pdtf:titleAddress`, and `pdtf:marketingAddress` as *alternative* identifiers/aliases (`skos:notation`-style or `dct:identifier` with a typed-literal datatype). (3) **Use SHACL to enforce co-reference**: a property pack's UPRN, an EPC's UPRN, and an onward-purchase's UPRN, when all present and referring to the same instance, must agree. Where they disagree, that is a data-quality finding, not a modelling failure.

The four-leaves-one-referent problem the schema page names is, in ontological terms, the absence of a *kind* with *identity criteria*. The schema's leaves are *attributes of a missing class*. We restore the class.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** FIBO's `LegalEntity` has the same shape: LEI is the rigid identifier; CIK, ISIN-issuer-code, NAIC code, country-of-incorporation registration number are alternative identifiers; SHACL shapes enforce uniqueness and co-reference. The pattern transfers cleanly. *Ontology Engineering* Chapter 7 ("Modelling Identity") explicitly treats this as the canonical pattern for entities with multiple identifier surfaces.

Guarino will attack this on identity-criteria grounds: he'll say UPRN's identity criteria are administrative (assigned by Ordnance Survey/the LA), not metaphysical, and therefore UPRN cannot serve as the rigid identifier of a physical thing. He is right about the philosophical point and wrong about the practical resolution. In FIBO we ran into the same objection about LEI (assigned by GLEIF, not metaphysically grounded in the legal entity's nature). The resolution is: the *identifier* is administrative; the *identity* of the physical thing is recovered by the SHACL co-reference shape over multiple admin identifiers. UPRN, INSPIRE-ID, and registered-title address are independent administrative views; agreement among them is the practical identity criterion. That is also what Davis's UK-gov experience says works at scale.

**Vote:** AGREE with the three-move resolution. I expect Guarino to dissent or abstain; I'd accept an amendment that explicitly says "rigid administrative identifier, not metaphysical identity criterion" in the class definition's `rdfs:comment`.

### Q5 — Overlays → SHACL profiles?

**Position:** Yes. One TBox; many SHACL shape sets. `baspi5-shapes.ttl`, `ta6-shapes.ttl`, `nts2-shapes.ttl` each declare the cardinality and conditional-required constraints that the corresponding JSON-Schema overlay encodes. The `getTransactionSchema(BASE, [overlays])` semantic — deep-merge with union on required, concat on `oneOf` — maps onto SHACL's natural composability: shapes are additive, conflicts surface as validation results.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** FIBO uses exactly this pattern for jurisdictional and regulatory variants: one TBox of `Loan`, `MortgageLoan`; multiple SHACL profiles for US Dodd-Frank disclosures, EU CRR reporting, UK PRA returns. The profiles never re-define classes; they constrain them. That is the discipline that makes the TBox stable across regulator and product-line changes.

The PDTF deep-merge rules (overlay scalar wins, required arrays union) translate almost mechanically into SHACL: each overlay's required field becomes a `sh:minCount 1` property shape; the union semantics is "the conjunction of all property shapes attached to the node shape." `oneOf` branches become `sh:xone` constraints. The custom array-merge logic in `/source/03-standards/schemas/index.js` is essentially recreating SHACL property-shape composition by hand.

**Vote:** AGREE. The SHACL-profile model is also more debuggable: when a TA6 + LPE1 leasehold sale fails validation, the report tells you which shape from which profile failed, with which path. The JSON Schema merge tells you "required property X missing" with no provenance.

### Q6 — verifiedClaims → PROV-O?

**Position:** Yes — and verifiedClaims is the part of PDTF v3 that *most clearly* benefits from RDF re-expression. Each claim becomes a `prov:Entity` (the claimed fact), with `prov:wasGeneratedBy` a `prov:Activity` (the verification), `prov:wasAssociatedWith` a `prov:Agent` (the verifier), with `prov:atTime` (when), and `prov:used` the evidence (`prov:Entity`s of type document/electronic_record/vouch). The OIDC4IDA `evidence` / `validation_method` / `verification_method` distinction maps cleanly onto PROV-O's activity-method pattern.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** FIBO's audit-and-attestation modules use PROV-O for exactly this — attestation-as-activity, attester-as-agent, evidence-as-entity. The pattern is canonical. Moreover, OPDA's pdtf-verified-claims is already in the OIDC4IDA tradition (the `evidence.type` enum of `document | electronic_record | vouch` is OIDC4IDA), and the OIDC4IDA → W3C VC → PROV-O alignment work exists in the wild. We are not inventing; we are joining.

What makes this *more* important than the schema-conversion work is that verifiedClaims is the surface where PDTF will interoperate with VC ecosystems, AML/KYC providers, and DPV-tagged personal-data flows. Getting it onto PROV-O correctly is the difference between "OPDA can publish to VC wallets" and "OPDA is a JSON island."

**Vote:** AGREE strongly. This is the highest-leverage piece of the conversion.

### Q7 — Order of work; MVP?

**Position:** Six phases.
1. **Identity & Naming** (URI strategy, namespace, class-vs-property naming conventions, prefix table). Two weeks.
2. **Core TBox — Agents & Roles + Property & Land**. Six weeks. Includes the Q4 Property-defect fix.
3. **Transactions & Lifecycle**. Three weeks.
4. **Claims, Evidence & Provenance (PROV-O alignment)**. Four weeks.
5. **First SHACL profile — BASPI v5** (one overlay, end-to-end, as proof). Three weeks.
6. **Documentation & publication** (one canonical URL per class, dereferenceable to HTML+Turtle). Two weeks.

MVP = phases 1–4 + phase 5 (BASPI only). TA6 / NTS / LPE1 / CON29R follow the BASPI pattern and can be parallelised once one profile is proven.

**Reasoning (Kendall's methodology — FIBO, EDM Council practice, *Ontology Engineering*):** This is the FIBO incremental-release pattern at smaller scale. FIBO never released a "complete ontology"; it released BE/FBC first, then SEC, then DER, with each release proving the foundations. The OPDA equivalent is: prove the TBox + one SHACL profile end-to-end, then add profiles. Doing all overlays at once is the rookie mistake; the second profile finds the joints in the TBox that the first one couldn't.

**Vote:** AGREE with the phasing. I'd accept an amendment from Davis to publish phase-1 outputs (namespace, class skeleton) on a dereferenceable URL within the first two weeks — that's how UK-gov linked data shipped at speed.

---

## Expert: Ian Davis

### Q1 — Genuine deliberation or mechanical translation?

**Position:** Genuine, but the deliberation should be ruthlessly short. PDTF v3 is what's on the ground. Sellers and conveyancers are filling it in today. The ontology's job is to make that data *dereferenceable and linkable*, not to perfect it. Spend two sessions, not twenty, on conceptual cleanup; then publish.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** At the BBC we converted programme metadata to RDF on a deadline, with running consumers. At data.gov.uk we converted hundreds of departmental datasets to linked data with no time for foundational-ontology debates. The lesson, every time: the value comes from *publishing dereferenceable URIs that resolve to useful representations*, not from getting the upper ontology right. Get the URI strategy right, get one good representation out the door, learn what consumers actually do with it, then improve the model. Kendall's FIBO instinct is to model first and publish later; the UK-gov instinct is the opposite — publish a sketch, iterate. Both are defensible; for OPDA, which has working software depending on the schema, the publish-first discipline is the one that survives contact with reality.

That said: "publish first" is not "model nothing." The Q4 Property defect is the kind of thing that becomes locked-in the moment you publish — better to fix it before there are dereferenceable URIs for the broken pattern. So I'd flag a small number of *blocking* conceptual fixes (Property identity, role-vs-class for Participant, Claims-as-provenance) and publish past everything else.

**Vote:** AGREE that this is genuine deliberation, with the amendment that the deliberation should be *time-boxed* and the bar for "this requires further modelling" should be high. Most of what looks like an ontological problem is just a missing URL.

### Q2 — Vocabularies IN/OUT?

**Position:** Core as listed (RDF/RDFS/OWL/XSD/SHACL/SKOS/DCT/VANN). **Add DCAT-3 to Core, not Conditional** — every OPDA dataset should have a `dcat:Dataset` record on day one; that's the bare minimum for being findable. PROV-O in. DPV in but slim (no `dpv-gdpr` import — use the URIs sparingly on personal-data-bearing properties only). ODRL only on the licensing endpoint. ArchiMate, BBO, OWL-Time, SSSOM, SEMAPV — all out for MVP. FIBO and schema.org out (as per ODR-0002).

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** At BBC and data.gov.uk we used vanishingly few external vocabularies — Dublin Core, FOAF, SKOS, custom domain vocabularies, plus dataset records in DCAT or its predecessors. The principle: every vocabulary you import is one more dependency you'll have to explain to a confused consumer in three years. DCAT is non-negotiable in 2026 because every UK government open-data portal expects it. Beyond that, less is more.

Kendall's instinct to admit DPV / ODRL / DASH on day one is defensible; my instinct is to admit them only when there's a publication on the other side that needs them. DPV for the personal-data tag on names and addresses: yes. DPV for the full GDPR processing-purpose model: not until OPDA publishes a consent record. The "canonical URI + no `owl:imports`" pattern from ODR-0002 is the right discipline; I'd press it harder than the ODR does — the *namespace* is referenced; the *vocabulary* is not adopted unless OPDA is producing instance data that uses it.

I disagree with Kendall on OBO RO. Property aggregation (flat → block → estate) is real and worth modelling, but RDFS subproperty hierarchies and SHACL recursive shapes carry the practical weight. Importing OBO RO drags in a biology-flavoured upper structure that confuses property-data consumers more than it helps. Use `dct:isPartOf` if you must.

**Vote:** DISAGREE with Kendall's OBO RO addition. AGREE otherwise, with DCAT-3 promoted to Core.

### Q3 — Work partition?

**Position:** Partition along URL/namespace lines, not module lines. Each top-level class gets a canonical URL on `https://trust.propdata.org.uk/ontology/` (or similar), serves Turtle + HTML when dereferenced, links to its uses. The "modules" Kendall wants are useful as *editorial* units but should not be reflected in the published URI structure — a flat namespace with conceptual grouping in `rdfs:isDefinedBy` is more navigable in practice than a hierarchy of module URLs.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** BBC's programme ontology, MusicBrainz, the Open Library — the patterns that worked at scale were flat or near-flat namespaces with each class/property at a stable, dereferenceable URL. The patterns that failed (or limped) were the deeply-nested module URL hierarchies, because they constrain editorial reorganisation. FIBO's module URL pattern works *because* FIBO has institutional governance and a release-management discipline that OPDA doesn't have yet. For OPDA's first release, flat-and-flexible beats hierarchical-and-rigid.

The work partition I'd actually do: four parallel streams, each with one author who can ship — (a) Property identity URL skeleton, (b) Participant/Agent role pattern, (c) Transaction lifecycle vocabulary, (d) Claims+PROV-O alignment. Each ships a dereferenceable namespace within four weeks. No grand co-ordination. Cross-class links emerge from the editorial pass at the end.

**Vote:** DISAGREE with Kendall on FIBO-module partition. Modules are an editorial convenience; they should not be in the URLs. AGREE on the conceptual groupings as a working organisation of the team.

### Q4 — Property defect resolution?

**Position:** Yes, declare a `Property` class with UPRN as the primary administrative identifier. But the *first* thing to ship is the URL. Before any of the `owl:hasKey` and SHACL co-reference work, publish a dereferenceable URL for "the Property at UPRN 100023456789" that returns a useful representation. Once URLs exist, the SHACL constraints can be tightened iteratively.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** This is exactly the BBC pattern: every programme had a URL at `bbc.co.uk/programmes/{pid}` from day one, returning HTML + RDF; the *internal* model evolved over years, but the URL contract didn't change. The Property entity's first job is to be addressable: `propdata.org.uk/property/uprn/100023456789` (or however the URI strategy goes) returns the EPC, the title, the marketing record, the consenting parties, the verifiedClaims — all linked. Whether UPRN is "rigid" or "administrative" in Guarino's sense matters less than whether the URL resolves and returns sensible Turtle.

Guarino will press on this. He's right that UPRN identity is administrative. The UK-gov answer is: that's fine. Administrative identity is what 99% of the consumers need; the philosophical purity is a research project, and OPDA isn't a research body. The PROV-O record (who minted the UPRN, when, from what authoritative source) carries the provenance honesty; that is the appropriate response to the Guarino critique.

**Vote:** AGREE on the resolution, with the strong amendment that **URL-first** is the priority. The class declaration is downstream of the URL existing.

### Q5 — Overlays → SHACL profiles?

**Position:** Yes. Each overlay is a SHACL profile. *And* — because conveyancing software consumes overlays at runtime — publish each profile as a dereferenceable shapes graph. A consumer should be able to `GET https://trust.propdata.org.uk/shapes/baspi5.ttl` and get a working SHACL graph. That's a 2026 expectation, not a 2018 one.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** What the JSON Schema overlays *do* is offer a runtime contract for "this is what a BASPI-compliant submission looks like." That's exactly what a SHACL shapes graph is for. The conveyancers and estate agents currently consuming `getTransactionSchema(BASE, ['baspi5'])` over JSON should, in the linked-data world, fetch a shapes graph URL and run it locally. We learned at data.gov.uk that publishing the *artefacts* people need (not just the conceptual model) is what gets uptake. JSON Schema overlays don't dereference; SHACL shapes do.

Kendall and I agree on this. The disagreement might come on how much TBox needs to exist before the first SHACL profile ships. My view: the SHACL profile can ship with a *minimum* TBox — placeholder classes are acceptable in the first cut, as long as they have URLs and clear `rdfs:comment` text. The TBox firms up as profiles drive requirements.

**Vote:** AGREE. Push for shipping shapes graphs as dereferenceable URLs early — they will drive the TBox more efficiently than top-down design.

### Q6 — verifiedClaims → PROV-O?

**Position:** Yes. This is the obvious win and probably the part of the conversion that pays for itself fastest. PROV-O is well-supported in tooling, every linked-data ecosystem understands it, and verifiedClaims is the natural seam between PDTF and the VC/DID ecosystem.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** Provenance was an afterthought at BBC and a core requirement at data.gov.uk — and the data.gov.uk experience was clear: without PROV-O-style provenance, every piece of published data is contestable and untrustable; with it, consumers (especially journalists, researchers, oversight bodies) treat the data as authoritative. OPDA's whole premise is "Trust Framework" — the framework's trustworthiness lives or dies on provenance. PROV-O is the W3C answer; using anything else is reinventing it.

The OIDC4IDA `evidence.type` enum (`document | electronic_record | vouch`) maps onto PROV-O cleanly — Kendall's mapping is right. I'd add: publish a small number of example verifiedClaims as PROV-O Turtle alongside the JSON, so consumers can see the two side by side. That's how data.gov.uk taught the country to read linked data.

**Vote:** AGREE strongly. Highest-leverage piece.

### Q7 — Order of work; MVP?

**Position:** Three phases, aggressive timeline.
1. **URL strategy + namespace + 20 dereferenceable class URLs (placeholders OK).** Two weeks. The point is to *have published* something on day 14.
2. **Property + Participant + Transaction core, plus PROV-O alignment for verifiedClaims.** Four weeks. Each class has Turtle + HTML representations at its URL.
3. **First SHACL profile (BASPI v5) shipped as dereferenceable shapes graph.** Three weeks.

MVP at week 9. Everything else (TA6, NTS, LPE1, CON29R, DPV/ODRL extensions) follows the BASPI pattern and parallelises.

**Reasoning (Davis's practice — BBC linked data, data.gov.uk, Talis):** BBC programme URLs went live with thin metadata and improved continuously over years. data.gov.uk shipped datasets with minimum DCAT records and let consumer demand drive richness. The discipline is: *don't let perfect block the publish*. Kendall's six-phase plan is sensible but front-loads conceptual work that, in my experience, gets refactored anyway once real consumers turn up.

The single most important thing I'd insist on for MVP: every published URL must dereference to *both* HTML and Turtle/JSON-LD via content negotiation. A class URL that only returns Turtle is invisible to half the audience; one that only returns HTML doesn't scale to linked-data consumers. This was the difference between BBC's success and several MoD/government failures.

**Vote:** AGREE with phasing in principle; DISAGREE on six phases over twenty weeks — three phases over nine weeks is achievable and the slippage builds in honestly. The Council's job is to set the schedule that gets ship-discipline, not the schedule that gets ontological completeness.
