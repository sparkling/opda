# Positions: Cagle + Gandon + Knublauch

Council Session 001 (PDTF v3 → linked-data TBox), Q1–Q7. The genuine fault line is Q5: Knublauch holds SHACL to strict W3C semantics; Cagle wants pragmatic extension for AI consumers. Surfaced, not smoothed.

---

## Expert: Kurt Cagle

*The Ontologist*; SHACL-driven taxonomy, AI-RDF integration. I read this schema the way its data's consumer does — something an AI agent traverses — not as a metaphysics exam.

### Q1 — Namespace / URI strategy

**Position.** One canonical `opda:` namespace (`https://opda.uk/ns/`), **hash URIs**. No per-form namespaces (`baspi:`, `ta6:`) — overlays are *views*, not vocabularies, and a TBox is the textbook whole-document-dereference hash case. Form refs (`baspi5Ref`) belong as properties on shapes, not prefixes (Q5).

**Vote.** Single `opda:` hash namespace. **8-0-1**.

**Challenge.** Slash URIs "for future content negotiation" is speculative this round. Guizzardi's layer-segregated *naming* is fine; I won't pay for it with extra namespaces.

### Q2 — Vocabulary catalogue

**Position.** Endorse mandated Core + DASH + PROV-O + DPV + ODRL; BBO excluded. **Adopt SSSOM/SEMAPV** (for Q5 traceability), defer OWL-Time, DCAT, ArchiMate.

**Reasoning.** I'm the SSSOM dissenter and own it. The per-leaf `baspi5Ref`/`ntsRef` annotations *are* a mapping problem — "this shape = BASPI B1.3.2" — and SSSOM + `semapv:ManualMappingCuration` is the machine-readable way to say it, better than an `rdfs:comment`. DASH earns its place once the schema pages are admitted as form UIs (Q5).

**Vote.** Mandated: **9-0**. SSSOM: I push hard; realistically **5-4**.

**Challenge.** To SSSOM-deferrers: `"baspi5Ref": "B1.3.2"` is in the overlay files *now*. Deferring doesn't remove the mapping, just encodes it less reasoner-friendly. Name the alternative.

### Q3 — Partition of the model

**Position.** Partition by **three consumer-facing concerns**, not the JSON tree: (1) core entity model (Property, Participant, Title, Document, Claim); (2) SHACL shapes layer; (3) mapping/annotation layer. Separate files, one namespace. Mixing the class model with shapes kills working ontologies — you can't evolve the UI contract without touching semantics. An agent loads the entity model; a form generator the shapes; an auditor the mappings.

**Vote.** In favour. **8-1**.

**Challenge.** I resist any partition re-creating the propertyPack mega-tree as a class hierarchy. That nesting is form ergonomics, not ontology. Flatten it.

### Q4 — The Property defect

**Position.** Explicit `opda:Property` class with a SHACL-enforced canonical key on UPRN; the other three UPRN surfaces (`energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`) are the same property reused, joined by that key. Reach for `dash:uniqueValueForClass`, not `owl:hasKey`. Guizzardi/Guarino and I agree on the diagnosis (one referent, four surfaces, zero joins — page 37 says so) but split on cure: they want `owl:hasKey` on a rigid Kind; I want a SHACL constraint because it's *checkable* and degrades gracefully when UPRN is absent — as it often is (new-build, first-registration).

**Vote.** Explicit Property + SHACL uniqueness key. **8-1**; soft dissent against `owl:hasKey` as *primary*.

**Challenge.** To Guizzardi: a rigid Kind with `owl:hasKey` is tidy but inert for a consumer whose record has no UPRN. Mine produces a violation report; what does yours *do*?

### Q5 — Overlays → SHACL profiles *(contested — see Knublauch for the strict counter)*

**Position.** Each overlay becomes a **named SHACL shapes graph (profile)**; loading a profile activates its shapes. On the mechanics I agree with Knublauch below; my departure is allowing profiles to carry **non-standard advisory annotations for AI consumers** (e.g. `opda:aiHint`) — 2026 consumers are increasingly LLM agents that benefit from hints the spec never anticipated.

**Vote.** Overlay → SHACL profile + DASH UI. **7-2** (dissents on the advisory annotations, not the core mapping).

**Challenge — to Knublauch.** Refusing any annotation outside the W3C term set doesn't make the ontology purer — it pushes that metadata into a side-channel the validator ignores. I keep it *in* the graph, clearly `opda:`-namespaced, so it travels with the data. Where's the line between extension and abuse?

### Q6 — verifiedClaims → PROV-O

**Position.** Map `evidence`/`verification_method`/`verifier`/`time` (from `pdtf-verified-claims.json`) onto PROV-O: claim = `prov:Entity`, verification = `prov:Activity`, verifier = `prov:Agent`, `time` → `prov:atTime`/`prov:endedAtTime`, `evidence.type` enum → subclasses of `opda:Evidence`. Near-direct fit — already a who/when/by-what record; `validation_method`/`verification_method` → two `prov:Activity` types in a validate-then-verify chain.

**Vote.** In favour. **9-0**.

**Challenge.** A `vouch` is an Agent attesting (`prov:wasAttributedTo`), not a document-derivation. Don't collapse all three evidence types into one pattern.

### Q7 — Ordering & MVP

**Position.** MVP = core entity model + Property key fix + one worked BASPI5 SHACL profile with DASH hints. Prove the round-trip (JSON → profile → rendered form), then add profiles. Defer SSSOM records and PROV-O claims to phase 2. If the DASH UI reproduces a BASPI page, the pattern scales.

**Vote.** In favour. **8-1**.

**Challenge.** Resist "model everything first, render later" — that's how ontologies die in committee.

---

## Expert: Fabien Gandon

W3C / Inria; RDF 1.1 co-editor; provenance at Wimmics. My job: keep us honest about foundational constructs — flag where the team reaches for `owl:sameAs` or `owl:hasKey` to paper over a structural gap.

### Q1 — Namespace / URI strategy

**Position.** Single `opda:` namespace, hash URIs (with Cagle), but the URIs must be **dereferenceable** to something — even just the TBox this round. Declare `vann:preferredNamespacePrefix` on the `owl:Ontology` header per ODR-0002. A namespace that doesn't plan for dereferenceability violates linked-data principle 3; hash URIs satisfy it trivially for a small TBox.

**Vote.** Single hash namespace + `vann:` header. **9-0**.

**Challenge.** Mint URIs but don't serve the TBox and you've published broken linked data. That's a deployment commitment — record it.

### Q2 — Vocabulary catalogue

**Position.** Endorse mandated set. **Defer SSSOM/SEMAPV** (against Cagle), **adopt OWL-Time conditionally** (with Guizzardi), defer DCAT/ArchiMate. SSSOM is a mapping vocabulary with no target yet — TBox-only, single-source this round; it earns its place mapping to an *external* vocabulary (FIBO, INSPIRE), while `dct:source` handles internal form refs. On OWL-Time I side with Guizzardi: adopting PROV-O's `prov:atTime` (an instant) while lease terms and proprietorship *intervals* go unmodelled is incoherent.

**Vote.** Mandated: **9-0**. SSSOM defer: **5-4** vs Cagle. OWL-Time: **6-3**.

**Challenge.** To Cagle: `dct:source` to a form-question IRI *is* a machine-readable mapping. You don't need SSSOM's record model until you have mapping confidence/justification worth recording — a multi-source problem you don't have yet.

### Q3 — Partition of the model

**Position.** Support partition by concern, but the cut that matters to me: keep OWL assertional semantics and SHACL validation semantics in **separate graphs**. Don't let shapes leak into the TBox as class axioms. OWL is open-world/monotonic; SHACL is closed-world. The commonest abuse is writing `sh:minCount` and believing it's an OWL cardinality restriction — it isn't.

**Vote.** In favour. **8-1**.

**Challenge.** An `owl:minCardinality` and a `sh:minCount` on the same property are *not* the same statement — writing both invites conflation. Check for drift.

### Q4 — The Property defect

**Position.** Yes to explicit `opda:Property`. I permit `owl:hasKey` only on a class with genuine identity criteria; I lean to Cagle's SHACL uniqueness as the *operational* mechanism, `owl:hasKey` an optional semantic annotation iff UPRN is truly identifying.

**Reasoning.** This is the construct I police. `owl:hasKey` does **not** assert two same-UPRN individuals *are* identical — it only licenses that inference when both are typed `opda:Property` with equal UPRNs. People misread it as a uniqueness constraint (SHACL's job) or as `owl:InverseFunctionalProperty` (it isn't — class-scoped, named-individuals only). And I will *block* wiring the four UPRN surfaces with `owl:sameAs`: they're four mentions, not one individual; `sameAs` would propagate every EPC-context property onto a valuation-context — classic abuse, irreversible under inference.

**Vote.** Explicit Property + SHACL uniqueness; `owl:hasKey` secondary. **8-1**.

**Challenge.** To anyone proposing `owl:sameAs` for the UPRN join: "same physical thing" is `owl:hasKey` + SHACL, not `sameAs`. I'll record dissent against any `sameAs` here.

### Q5 — Overlays → SHACL profiles

**Position.** Endorse Knublauch's strict mapping as correct. My contribution: the enum-union → `sh:in` "loaded = active" semantics must be **documented as a profile-composition rule, not an OWL entailment** — RDF/OWL has no operation that unions two `sh:in` lists by entailment; the union is a build-step (deepmerge) producing a new shapes graph. Conflating build-time merge with run-time entailment is a foundational error.

**Vote.** With Knublauch. **7-2** (I'm one of the two dissenting on Cagle's advisory annotations).

**Challenge.** To Cagle: a shapes graph polluted with `opda:aiHint` triples is no longer cleanly a *SHACL* graph — a strict processor carries triples it can't interpret; a naïve consumer may read them as constraints. Put advisory annotations in a **separate annotation graph** keyed to shape IRIs — your own Q3 partition argues for exactly this.

### Q6 — verifiedClaims → PROV-O

**Position.** Endorse the PROV-O mapping. Use **qualified forms** (`prov:qualifiedAttribution`, `prov:qualifiedDerivation`), not just binary shortcuts: `prov:wasAttributedTo` alone discards `verification_method`; `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole` keeps the *how/when*.

**Vote.** In favour. **9-0**.

**Challenge.** Binary-only PROV loses the `validation_method`/`verification_method` distinction. Don't lossy-compress provenance.

### Q7 — Ordering & MVP

**Position.** MVP must include the dereferenceability commitment (Q1) and the Property class. Sequence: entity model + Property fix → PROV-O claims → SHACL profiles → mapping annotations last. PROV-O before the full profile build: provenance is foundational to a *trust* framework, the mapping is nearly mechanical, and it's higher integrity-risk than Cagle's BASPI-first.

**Vote.** Mild reorder vs Cagle. **7-2**.

**Challenge.** Don't ship URIs you don't serve — "the namespace dereferences" is part of done.

---

## Expert: Holger Knublauch

TopQuadrant CTO; SHACL spec co-editor; DASH author. Q5 is mine to answer canonically; brief elsewhere.

### Q1 — Namespace / URI strategy

**Position.** Single `opda:` namespace, hash URIs, agreed. Add an `sh:prefixes` declaration node at namespace level so SHACL-SPARQL constraints resolve the prefix — the UPRN uniqueness check likely needs `sh:sparql`, which silently fails to resolve prefixes without it.

**Vote.** In favour. **9-0**.

### Q2 — Vocabulary catalogue

**Position.** Endorse mandated set. **Adopt DASH unconditionally** for form-driving shapes (I authored it; once the schema pages are accepted as form generators per Q5, `dash:viewer`/`dash:editor`/`dash:propertyRole` are the vocabulary for it). On SSSOM: **defer**, with Gandon — internal form-refs are `dct:source`; SSSOM is overkill for single-source annotations.

**Vote.** Mandated + DASH: **9-0**. SSSOM defer: **5-4** vs Cagle.

**Challenge.** To Cagle: SSSOM's value is justification + confidence + author on a mapping between *independent* vocabularies. `baspi5Ref` references the *same* governed source — you're paying for machinery you won't use.

### Q3 — Partition of the model

**Position.** Separate the SHACL shapes graph from the OWL/RDFS class model (with Gandon), shapes referencing classes via `sh:targetClass`, not `owl:imports` (per ODR-0002). Every well-formed SHACL deployment I've shipped is structured this way; it keeps OWA and CWA cleanly separated.

**Vote.** In favour. **9-0**.

**Challenge.** Every shape needs `sh:targetClass` (or `sh:targetNode`/`sh:targetObjectsOf`), or it validates nothing.

### Q4 — The Property defect

**Position.** Explicit `opda:Property`; enforce the canonical key with `dash:uniqueValueForClass true` on `opda:uprn` (with Cagle); add `owl:hasKey (opda:uprn)` only if the OWL semantics are wanted (Gandon's caveat). `dash:uniqueValueForClass` produces a violation report where `owl:hasKey` only licenses inference — and a trust framework must *report* duplicate-UPRN errors.

**Vote.** SHACL/DASH key primary. **8-1**.

**Challenge.** To Guizzardi: I respect the rigid-Kind analysis, but the deliverable is a *checkable* contract. Give me the constraint that fires a violation.

### Q5 — Overlays → SHACL profiles *(canonical answer — owned)*

**Position.** Each overlay is a **named SHACL shapes graph (profile)**. Composition = graph union of base + loaded profiles *as a build step* (mirroring `getTransactionSchema`'s deepmerge), yielding one effective shapes graph to validate against. I'll be strict — a profile that misuses these constructs validates the wrong thing.

**Reasoning — rule by rule:**

1. **Required-array union → `sh:minCount`.** Each `required` entry becomes a property shape with `sh:minCount 1`. Deep-merge unions the arrays (`["a","b"]` + `["b","c"]` → `["a","b","c"]`); in SHACL this is purely **additive** — the composed graph holds the union of `sh:minCount 1` shapes, no conflict to resolve. baspi5's `required: ["uprn","address",…]` on `propertyPack` becomes that many `sh:property [ sh:path opda:uprn ; sh:minCount 1 ]` shapes on the `opda:PropertyPack` node shape, active only when BASPI is loaded.

2. **Enum union → `sh:in` (with explicit "loaded = active" semantics).** A JSON `enum` → `sh:in ( … )`. Deep-merge unions members. The canonical semantic — **documented as a profile-composition rule, per Gandon, not an entailment** — is: *the effective `sh:in` is the set-union of base + every loaded profile's members; the loaded profile defines the active permitted vocabulary.* This is a **replacement of the `sh:in` node** with the union list at build time — you do **not** leave two `sh:in` constraints on one property (two `sh:in`s are conjunctive, i.e. the *intersection* — the opposite of union intent). The single most important strictness point: **union requires one merged `sh:in`, not two stacked.**

3. **`oneOf` concatenation → `sh:or`/`sh:xone`.** `oneOf` branches append, so the composed `sh:or` list is the concatenation. baspi5's `participants.items` has `discriminator: { propertyName: "role" }` over two branches (non-seller roles vs `Seller` with `sellersCapacity`) → a node shape `sh:or ( [non-seller] [seller] )`. Where the discriminator makes branches mutually exclusive, the strictly-correct construct is **`sh:xone`** (exactly-one — the faithful translation of `oneOf`); reserve `sh:or` for "at least one." Express the discriminator via `sh:qualifiedValueShape` keyed on the `role`/`capacity` value. The nested `sellersCapacity` `oneOf` (Legal-Owner/Mortgagee vs PR/Attorney, the latter requiring `sellersCapacityDetails` + `attachments`) → a nested `sh:xone` whose second branch carries the extra `sh:minCount 1` shapes.

4. **Per-leaf `baspi5Ref`/`ntsRef` → machine-readable mappings.** If SSSOM is admitted (Cagle's Q2): an SSSOM record per annotation — `subject_id` = shape IRI, `object_id` = form-question IRI (BASPI `B1.3.2`), `mapping_justification` = `semapv:ManualMappingCuration`. **Since SSSOM is deferred (my Q2 vote), the fallback** is `rdfs:isDefinedBy` / `dct:source` on each shape pointing at a minted form-question IRI (`<https://opda.uk/forms/baspi5#B1.3.2>`), a chain shape → question → form. Standard and conformant, reasoner-poorer than SSSOM — the trade we accept by deferring it. Cagle's "less AI-friendly" objection is fair.

5. **DASH for UI rendering.** This is what DASH is for. Per property shape: `dash:propertyRole dash:KeyRole` on UPRN, `dash:LabelRole` on `name.firstName`/`lastName`; `dash:viewer` `dash:LabelViewer`/`dash:LiteralViewer` for reads, `dash:URIViewer` for `dct:source` links; `dash:editor` `dash:EnumSelectEditor` for role/capacity enums (driven by `sh:in`), `dash:TextFieldEditor` for `sellersCapacityDetails`, `dash:DetailsEditor` for nested `address`. `sh:order` + `sh:group` reproduce the form's field order and sectioning.

The result: loading the BASPI5 profile yields a graph that both *validates* a transaction and *generates* the BASPI form, with full `dct:source` traceability. That is the canonical round-trip.

**Vote.** Overlay → named SHACL profile with strict `sh:minCount` / merged-`sh:in` / `sh:xone` + DASH + `dct:source`. **7-2**.

**Challenge — to Cagle.** I will *not* endorse `opda:aiHint` triples inside the shapes graph. A processor must find only interpretable constraint components plus known annotation properties (`sh:`, `dash:`, `rdfs:`, `dct:`). Constraint-adjacent invented terms risk being treated as constraints, or read as validation rules. Author hints as a **separate annotation graph** referencing shape IRIs — Gandon's point, consistent with the Q3 partition we all voted for. The line: **extend via new graphs and documented annotation properties; never via terms that masquerade as SHACL constraints.** DASH proves extension is fine *as a documented vocabulary with defined semantics* — `opda:aiHint` with no formal semantics is not that.

### Q6 — verifiedClaims → PROV-O

**Position.** Endorse the PROV-O mapping; add **SHACL shapes over the PROV structure** so provenance is itself validated (e.g. `electronic_record` → `sh:minCount 1` on `record.source.name`, mirroring the JSON `required`). The schema's conditional requirements (`allOf`/`if`/`then` on `evidence.type`) map to `sh:xone` / conditional `sh:property` over the PROV-O entities — so we don't just describe provenance, we validate it. That's the trust-framework deliverable.

**Vote.** In favour. **9-0**.

**Challenge.** Translate the `if/then` on evidence type faithfully (`sh:xone` over per-type shapes) — don't flatten the conditionality.

### Q7 — Ordering & MVP

**Position.** MVP = entity model + Property/UPRN SHACL key + one fully-worked BASPI5 profile with DASH rendering and `dct:source` traceability — with Cagle's vertical slice, after Gandon's dereferenceability commitment. The BASPI5 slice exercises every Q5 construct (`sh:minCount`, merged `sh:in`, `sh:xone`, DASH editors, `dct:source`); if it round-trips, the remaining 15 overlays are mechanical.

**Vote.** In favour. **8-1**.

**Challenge.** Pick BASPI5 specifically — its discriminated `oneOf`/`sellersCapacity` structure stresses `sh:xone`; a trivial overlay wouldn't prove the hard part.
