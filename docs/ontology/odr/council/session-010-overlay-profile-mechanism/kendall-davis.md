# Kendall + Davis — Enterprise-pair position on S010

## Pair summary (≤100 words)

Knublauch's canonical mapping (required → `sh:minCount 1`; enum-union → merged `sh:in`; `oneOf` → `sh:xone`; `baspi5Ref` → `dct:source`; DASH for rendering) is the correct ruleset. We concede the substantive technical positions to Knublauch and accept Cagle's annotation-graph-exile resolution (S001 §Q5 precedent). We add depth on **Q3 form-question IRI minting** (FIBO Application Profile precedent: minted `<base>/forms/<form>#<question>` with `dct:source` to specification) and **Q7 round-trip (BASPI5 publish-first MVP gate)** — Davis's BBC `/programmes/` precedent makes load → validate → regenerate the right test, and Hendler's LDP P3 dereferenceability concern is non-negotiable.

## Per-question positions

### Q1 — required-array union → `sh:minCount 1`

**Pair joint:** CONCEDE Knublauch. Set-additive on graph union; no conflict to resolve at composition time. The discipline is operationally sound and matches the SHACL Core Recommendation §4.6.3 minCount constraint component. We note for the build-step specification: required-shapes from multiple loaded profiles MUST be union'd into one node-shape with multiple `sh:property` children (each carrying `sh:minCount 1` per profile), NOT collapsed into a single `sh:property` (collapsing loses `dct:source` traceability to the originating form-question per Rule 4). FIBO does the same — when two FIBO modules both constrain `fibo-fnd-rel-rel:hasIssuer` they each carry their own property shape, not a merged one.

### Q2 — enum union → merged `sh:in`

**Pair joint:** CONCEDE Knublauch. Build-step replacement, NOT entailment, is the load-bearing distinction. Two `sh:in` constraints on one property are conjunctive (intersection) under SHACL Core §4.6.6 — exactly the opposite of the union intent. The regression-guard CI test (ODR-0010 §Enforcement) asserting the composed profile's effective `sh:in` is set-union is non-negotiable; a tool that stacks `sh:in`s is silently incorrect with no reasoner to catch the error. This is the most common SHACL composition bug in the wild (FIBO MTP §6.3 noted the same failure mode in early FIBO Production releases). Davis adds: BBC `/programmes/` had the equivalent bug in its early DCAT generator (stacked `dct:language` constraints intersecting to empty set); the fix was a build-step union pass plus a smoke test asserting the union cardinality.

### Q3 — Form-question IRI minting (KENDALL DEPTH)

**Kendall:** FIBO has an Application Profile mechanism analogous to SHACL profiles: `fibo-fnd-utl-av:ApplicationProfile` (FIBO Foundations Annotation Vocabulary, declared in `fibo-fnd-utl-av:AnnotationVocabulary.rdf`) is a first-class class for declaring that a SHACL profile applies to a specific FIBO module, and the profile declaration carries `dct:source` to its governing specification (the FIBO Securities Trading Application Profile, e.g., `dct:source <https://www.omg.org/spec/EDMC-FIBO/SEC/SecuritiesTrading/>`). The precedent transfers directly: `opda:ValidationContext` declares `dct:source` to the form-document — `dct:source <https://opda.uk/forms/baspi5/>` — and individual form-question IRIs hang off that document as fragments.

The IRI minting pattern: **`<https://opda.uk/forms/<form>#<question-id>>`**. For BASPI5: `<https://opda.uk/forms/baspi5#B1.3.2>` resolves to fragment B1.3.2 of the BASPI5 form-document, where the form-document is a dereferenceable HTML+RDF representation listing every question with its leaf-mapping, label, help-text, and `sh:order` metadata. The shape's `dct:source` triple points at this fragment; the fragment dereferences to the form-document's relevant section. FIBO does this for its securities-trading message-schema profiles — each constraint shape carries `dct:source` to the canonical message-field IRI in the OMG specification.

Three operational requirements for the minted form-question IRIs:

1. **Dereferenceability is non-negotiable.** Per Hendler's LDP Principle 3 (use HTTP URIs that resolve; W3C LDP Note 2012) and per the S001 dereferenceability discipline. `…/forms/baspi5#B1.3.2` MUST return a working representation when fetched. The OPDA web team's commitment: serve `…/forms/baspi5` as a single document (HTML+RDFa or content-negotiated Turtle) containing every fragment; the fragment-identifier resolves client-side. This maps to a single static-file serve, which the OPDA Astro/Cloudflare Pages site already supports trivially (same precedent as ODR-0004 Q1 hash-namespace decision).
2. **Form-document is generator output, NOT hand-authored.** The form-document is generated from the overlay schema (`source/03-standards/schemas/src/schemas/v3/overlays/baspi5.json`) and the leaf-mapping registry. The generator emits an HTML+RDFa document with one section per form-question; each section's `id` attribute IS the form-question identifier. Per ODR-0004 §6a deterministic-emission discipline. Hand-edits to the form-document are forbidden; CI enforces match. This is the BBC `/programmes/` pattern applied to form-documents.
3. **Stability under overlay-schema churn.** The form-question identifiers (B1.3.2, B2.1, etc.) are the BASPI Working Group's namespace, NOT OPDA's. When BASPI WG re-numbers (B1.3.2 → B1.4.1 in BASPI6), the old IRI MUST resolve via 301 redirect to the new fragment, or the dereferenceability commitment breaks. This is the W3C TAG "Cool URIs Don't Change" Note 2008 discipline. The redirect rules are checked into the OPDA repo alongside the form-document generator config; a CI test verifies the redirect chain resolves.

**Davis:** Concur. BBC `/programmes/` minted fragment-IRIs for sub-resources within a programme document (`bbc.co.uk/programmes/{pid}#episode-3` for a specific episode listing) and the discipline was identical: the parent document is generator output; the fragments resolve client-side; the URIs survive renumbering via redirect maintenance. The OPDA form-question IRIs are the same operational pattern.

One BBC operational note worth porting: when the parent document (the programme listing, or here the form-document) grows large, the per-fragment fetch cost dominates over the per-fragment payload. BBC mitigated by paginating at the brand level and ensuring fragment-IRIs were always one HTTP fetch away. OPDA's form-documents — BASPI5 at ~50 questions, TA6 at ~200 — are well under any pagination threshold. Single-document serve is correct for the foreseeable future.

### Q4 — `oneOf` → `sh:xone`

**Pair joint:** CONCEDE Knublauch. `sh:xone` is exactly-one (SHACL Core §4.7.5); `sh:or` is at-least-one (§4.7.3). The semantic distinction matters because BASPI5's `participants.items` discriminated on `role` is exactly-one (a participant is exactly one of Seller/Buyer/Conveyancer, never two), and `sh:or` would admit nonsensical multi-typing. The nested `sellersCapacity` `oneOf` (Legal-Owner/Mortgagee vs Personal-Representative/Attorney) is also exactly-one — a seller has one capacity, not several. The `sh:qualifiedValueShape` discriminator pattern (keyed on the `role`/`sellersCapacity` value) is the correct mechanical encoding; FIBO uses the same pattern for its `fibo-be-le-lp:LegalPerson` natural-vs-legal discriminator.

### Q5 — `opda:ValidationContext` reification

**Pair joint:** CONCEDE Knublauch (and Guarino's withdrawal condition). Reification converts "required (depending)" into "required relative to a named, dereferenceable context" — giving the fixed model theory the Devil's Advocate demanded. Each profile is a first-class `opda:ValidationContext` node with `dct:source` to its form-document (per Q3 above), `owl:versionIRI` to its release snapshot, and a stable IRI consumers can pin against. This is structurally the same as FIBO's `fibo-fnd-utl-av:ApplicationProfile` declaration pattern — a profile is a thing, not a build-flag.

### Q6 — DASH for rendering

**Pair joint:** CONCEDE Knublauch. DASH (`http://datashapes.org/dash`) is the right vocabulary for form-rendering metadata — it's TopBraid's published convention, widely supported by SHACL tooling, and avoids OPDA having to invent a parallel rendering vocabulary. The `dash:propertyRole` / `dash:viewer` / `dash:editor` / `sh:order` / `sh:group` annotations enable the round-trip (Q7); without DASH, the form-regeneration test cannot run. Davis adds one BBC operational note: when we used a custom rendering vocabulary at BBC (the `po:displayHint` predicate), tooling support never materialised and the predicate ended up as documentation accident. DASH has TopBraid Composer, Apache Jena SHACL, and pyshacl integration — the tooling is there.

### Q7 — Round-trip on the BASPI5 slice (DAVIS DEPTH)

**Davis:** BASPI5 is the right MVP because its discriminated `oneOf`/`sellersCapacity` structure stresses every hard construct (`sh:xone`, merged `sh:in`, DASH editors, `dct:source`). If it round-trips, the remaining overlays are largely mechanical. Hendler concurs (S001 §Q7 publish-first framing); BBC `/programmes/` shipped exactly this way — pick one programme genre (Drama), prove the load + validate + regenerate cycle works end-to-end, then scale to the remaining genres. The publish-first gate is non-negotiable: a profile mechanism that passes synthetic tests but fails on the real BASPI5 input is not a profile mechanism, it's a wishful sketch.

Three operational tests the round-trip MUST pass:

1. **Validate a conformant transaction.** Load `profiles/baspi5.ttl` + the class graph + `foundation-shapes.ttl`; submit a hand-authored conformant BASPI5 transaction (Seller acting as Legal-Owner, all required leaves populated, valid enum members); the SHACL validator returns conformant (`sh:conforms true`). Counter-test: submit the same transaction without the BASPI5 profile loaded; the validator returns conformant (the base TBox doesn't require BASPI5-specific fields). This proves "loaded = active" is operationally real.
2. **Report violations on a non-conformant transaction.** Load profile; submit a Seller acting as Attorney with no `sellersCapacityDetails` and no `attachments`; the validator returns non-conformant with a specific `sh:ValidationResult` pointing at the missing `sellersCapacityDetails` shape, the `dct:source` resolving to `…/forms/baspi5#<sellers-capacity-question>`. This proves the `sh:xone` discriminator + nested `sh:minCount 1` shapes actually fire.
3. **Re-generate the BASPI5 form via DASH annotations.** Run the form-generator over the loaded profile + class graph; the output is an HTML+RDFa document with every BASPI5 question rendered in `sh:order`, grouped by `sh:group`, each field carrying a resolvable `dct:source` link to the corresponding `…/forms/baspi5#<question>` fragment. A maintainer reading the regenerated form should be unable to tell it apart from the BASPI WG's published form (modulo OPDA branding). This is the BBC `/programmes/` reverse-direction test: prove the RDF can be projected back to its source representation.

**Profile graph dereferenceability** (Hendler's LDP P3 concern, non-negotiable): `<https://opda.uk/profiles/baspi5/>` MUST return a working SHACL shapes graph when fetched (Turtle or RDF/XML, content-negotiated). `<https://opda.uk/forms/baspi5#B1.3.2>` MUST resolve to the form-document fragment. A profile mechanism with broken dereferenceability fails the linked-data principles (Berners-Lee 2006 P3) and breaks downstream tooling that resolves `dct:source` for traceability. The OPDA web team's commitment: serve both URLs from the Astro/Cloudflare Pages site with proper content negotiation; a CI test fetches each URL and verifies the response. data.gov.uk's experience: dereferenceability is the most commonly-broken linked-data discipline (catalogue records resolved, but the per-record property URIs didn't); the fix was a CI smoke test fetching every published URI on every release. OPDA should adopt the same discipline from day one.

**Kendall:** Concur with Davis. FIBO's release-acceptance criterion for a new Application Profile is functionally identical — every minted IRI must resolve, every constraint shape must fire on a designed non-conformant input, and every release publishes a smoke-test report demonstrating both. FIBO MTP §5.3 Release Acceptance. Same pattern, port wholesale.

### Q8 — Annotation-graph exile (Cagle resolution)

**Pair joint:** CONCEDE Cagle resolution per S001 §Q5. Advisory annotations (`opda:aiHint`, future LLM-consumer hints) live in `opda-annotations.ttl`, NOT the shapes graph. This is the same pattern ODR-0017 §1a and ODR-0018 §3a operationalise — the three-graph separation from ODR-0004 §3a applies uniformly. A SHACL processor must find only interpretable constraint components plus known annotation properties; invented constraint-adjacent terms in the shapes graph risk being read as constraints. The fix is graph-separation, not vocabulary-discipline.

## Replies to anticipated DA attacks

- **Guarino (DA) will attack Q5 reification as still-not-quite-fixed model theory.** Reply: the `opda:ValidationContext` is a named individual with a stable IRI (per Q3 minting discipline); its identity is fixed by IC (Q5 hard cases — version-bump preserves; scope-bump is new individual). The model theory IS fixed once the IC is published. Guarino's S001 withdrawal accepted this; we don't reopen the question.

- **Knublauch (DA) will attack Q3 form-question IRI minting as out-of-scope for ODR-0010.** Reply: the IRI minting is the operational expression of Rule 4 (`baspi5Ref` → `dct:source`). Without dereferenceable form-question IRIs, `dct:source` resolves to nothing and the traceability chain breaks. The minting discipline IS the rule; it's in-scope for the mechanism ODR. FIBO does the same: the Application Profile ODR specifies how form/message-field IRIs are minted, because the `dct:source` chain depends on it.

- **Cagle (DA) may reopen the SSSOM-vs-`dct:source` question.** Reply: deferred per Q2 (Cagle dissent recorded in ODR-0010). The pair endorses deferral — SSSOM is the richer alternative for per-leaf mappings (machine-readable justification/confidence), but `dct:source` is operationally sufficient for the MVP and the migration to SSSOM is mechanical when the time comes. Re-opening here delays the MVP without buying meaningful capability. The trade is documented as known.

- **Hendler (DA) may attack Q7 round-trip as too narrow a gate (one overlay, not five).** Reply: publish-first discipline — ship BASPI5, learn from the round-trip, scale to the remaining overlays. BBC shipped one programme genre before scaling to twelve; data.gov.uk shipped one departmental DCAT before scaling to twenty. The MVP gate IS one overlay done well; the alternative (five overlays sketched badly) is the failure mode publish-first guards against.

- **Guizzardi (DA) may attack Q3 IRI minting as letting overlays touch identity.** Reply: form-question IRIs are NOT Kind identifiers — they're presentation/traceability anchors. The no-identity-override SHACL gate (ODR-0010 Rules) explicitly rejects any overlay that declares or overrides a Kind's identity or key. A form-question IRI is a `dct:source` target; it carries no identity assertions about the Kind under validation. Guizzardi's gate is structurally separate.

## Pair cross-talk: where Kendall and Davis converge

We are aligned on every question. The two perspectives reinforce each other:

- **Convergence on substance.** Both endorse Knublauch's canonical mapping (Q1, Q2, Q4, Q5, Q6), Cagle's annotation-graph-exile resolution (Q8), and joint depth on the form-question IRI minting (Q3) and round-trip MVP gate (Q7).
- **Mutual reinforcement on dereferenceability.** Kendall's FIBO Application Profile precedent (minted IRIs MUST resolve) and Davis's BBC `/programmes/` precedent (LDP P3 dereferenceability) converge on the same operational discipline. Both perspectives independently arrive at: serve from a static-file site with content negotiation, generate the form-documents, CI-test the resolution, maintain redirect chains on rename.
- **No divergence to record.** Unlike S004 where we split on cycle-time and hand-authoring-vs-generator, S010 is a mechanism question where the FIBO and BBC precedents say the same thing in different vocabulary. The convergence is genuine, not papered-over.

## Pair recommendations for ODR-0010 amendments

We endorse the draft as written and suggest one textual amendment the Queen may carry into synthesis:

1. **Rule 4 (per-leaf `dct:source`): add IRI minting specification.** Append after the existing rule: *"Form-question IRIs are minted at `<base>/forms/<form>#<question-id>` per FIBO Application Profile precedent. The form-document at `<base>/forms/<form>` is generator output (per ODR-0004 §6a deterministic-emission); fragment-IRIs resolve client-side. Dereferenceability is enforced by CI smoke test fetching every published URI on each release (data.gov.uk precedent)."*

We do NOT recommend changing the other rules — they are correctly drafted and our positions are endorsements.

## Pair votes

| Question | Vote | Note |
|---|---|---|
| Q1 — required → `sh:minCount 1` | **AGREE** | Set-additive on graph union; per-profile property-shapes preserve `dct:source` traceability |
| Q2 — enum union → merged `sh:in` | **AGREE** | Build-step replacement; CI regression-guard against stacked `sh:in` non-negotiable |
| Q3 — Form-question IRI minting | **AGREE with amendment** | `<base>/forms/<form>#<question>` per FIBO Application Profile precedent; dereferenceability CI-enforced |
| Q4 — `oneOf` → `sh:xone` | **AGREE** | Exactly-one semantics; `sh:qualifiedValueShape` discriminator on `role`/`sellersCapacity` |
| Q5 — `opda:ValidationContext` reification | **AGREE** | Guarino withdrawal condition satisfied; profile IS a thing, not a build-flag |
| Q6 — DASH for rendering | **AGREE** | TopBraid/Jena/pyshacl tooling exists; custom vocabulary would be documentation accident |
| Q7 — Round-trip on BASPI5 slice | **AGREE** | Publish-first MVP gate; three operational tests (validate-conformant, report-violation, regenerate-form); LDP P3 dereferenceability non-negotiable |
| Q8 — Annotation-graph exile | **AGREE** | S001 §Q5 Cagle resolution; ODR-0004 §3a three-graph separation applies uniformly |
