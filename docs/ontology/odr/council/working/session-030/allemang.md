# Position — Dean Allemang (Session 030, R3: Building/Room class promotion)

> Lens: *is this the simplest model that works?* — derive, don't declare; reuse before mint; a structure earns its keep only when a tabled consumer query needs the distinction it draws (Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist*, 3e, ch. 3 "smallest sufficient vocabulary", ch. 10–11 on identity, ch. 14 on SHACL).
> Scope read: session-026, ODR-0024 (R3/R10), ODR-0023 (R3), ODR-0005 (§3a), ODR-0008 (§Q4a/§Q6a). No generator code; no deferral gate (decide on the merits NOW).

## One-paragraph thesis

The repeating group at `propertyPack.buildInformation.roomDimensions.rooms[]` carries a **co-variance constraint** — each row binds one `length` to one `width` to one `roomName` — and that is the *only* fact the model owes here. Flat single-valued datatype properties on `opda:Property` cannot carry it (they shred which length pairs with which width). A first-class `Room` Kind would carry it, but no tabled query re-identifies a room, so a Kind over-declares. The exact-fit middle term already exists in our corpus: the **by-value structure** ratified five days ago as `opda:MonetaryAmount` (ODR-0024 R3 — magnitude + currency, **no `owl:hasKey`, no IC**, reused as a *datatype*). One mint — `opda:RoomDimension` — and one object property to hang it off `opda:Property` covers all three uncovered leaves. Everything else on the table (a `Building` node, a `UnitOfLengthScheme`, a part-of mereology, transitivity) is structure no tabled query exercises, and is therefore deferred at zero cost behind S026's already-sharpened trigger.

---

### Q1 — Room: class / by-value structure / flat? — **REJECT class; REJECT flat properties; AFFIRM by-value structure (`opda:RoomDimension`).**

**Position.** Three of 239 leaves (`length`/`width`/`roomName`) live inside `rooms[]`, a *repeating group*. The competency-question test asks what query the distinction serves: nothing in the corpus selects a room as an individual, dereferences a room IRI, or re-identifies a room across dated surveys (S026 found exactly this; ODR-0024 R10 confirms `roomName` is non-rigid and barred as an identity principle). So a `Room` Kind buys nothing a consumer observes — it is the decorative commitment ODR-0008 §Q6a's flat-default and ODR-0001 A9 §(b) both warn against. But the *flat* alternative (Davis's interim, three `xsd:` properties straight on `opda:Property`) is **wrong on the data**: single-valued flat predicates scramble co-variance, and even multi-valued ones lose the row-binding (you cannot recover which `length` 4.2 went with `width` 3.1 vs the other room). The honest model of "a repeating group of measured values with no identity" is an **anonymous by-value structure** — `opda:RoomDimension`, blank-node-shaped, `length`+`width`+`roomName` as its fields, **no `owl:hasKey`, no IC**, attached to `opda:Property` by a multi-valued object property `opda:hasRoomDimension`.

**Reasoning (Working Ontologist 3e).** This is the textbook qualified-value / value-object pattern (3e ch. 10's modelling of structured values that are *not* first-class individuals — the same shape as a measurement-with-unit or a money-with-currency). It is exactly our own ratified precedent: ODR-0024 R3's `opda:MonetaryAmount` "reuse the datatype, never the bearer" — a by-value node that binds co-varying fields without claiming identity. Reuse-before-mint says we copy that shape, not invent a Kind.

**Vote:** REJECT class / REJECT flat → **AFFIRM `opda:RoomDimension` by-value structure** (concurs with Kendall on Q1).

---

### Q2 — Building: promote to a class now? — **REJECT promote-now (REVISE Kendall); affirm the eventual IC is genuine; stays gated on S026's re-identification trigger.**

**Position.** I part company with Kendall here. Kendall mints a thin `opda:Building` *now* to serve as the **bearer** for the room-dimension structures. The minimality test refuses this, on a corpus fact: `opda:RoomDimension` attaches **directly to `opda:Property`** via `opda:hasRoomDimension` — `opda:Property` already exists and is already the documented attachment point for built-form facts (ODR-0008 §Rules "Attachment"). Inserting a `Building` node between `Property` and the room structures introduces an intermediate resource that **no tabled query traverses**: it is `declare`, not `derive`. Kendall's competency question — *"do these rooms survive a UPRN/Property re-identification?"* — is **hypothetical**, not tabled (it is precisely the "could be constructed" hard case Guarino as S005 Queen ruled out; S026 codified this as the *re-identification* trigger). I fully grant Kendall (and Guizzardi/Guarino) that the *eventual* IC is **genuine** — the ODR-0005 §3a-4 "Replacement" witness proves a built structure persists through a routine rebuild and can survive a Property re-identification. That is real. But "the IC is genuine" licenses *preserving the option*, not *minting the class*; S026 already affirmed genuineness AND held, and nothing has changed since (no new query landed — the only new event, ODR-0024 R10, re-confirmed the hold). The dormant `PropertyTypeScheme`→subclass `skos:exactMatch` path keeps Building re-homable at zero cost the moment a re-identifying query is tabled.

**Reasoning (Working Ontologist 3e).** 3e ch. 3 — every class you mint is a class you must govern; mint only against a question you can answer now. The book's identity discipline (ch. 11) is that a class earns its keep when membership *answers* something; a bearer-only node that no path selects is the "ontology of everything" drift TopBraid practice exists to resist. And the engineering clincher: with no Building node, there is **no extra migration** if the trigger fires — `opda:hasRoomDimension` moves from `Property` to `Building` as a generator change over un-dereferenced blank nodes (Davis's reversibility point). Minting Building now to hold a bag of by-value structures is the speculative move; not minting it costs nothing.

**Vote:** **REJECT promote-now** (REVISE Kendall's mint-Building-as-bearer); affirm IC genuine; remains gated on the S026 sharpened re-identification trigger.

---

### Q3 — mereology / attachment / transitivity? — **REVISE: de-scope. One direct object property `opda:hasRoomDimension` on `opda:Property`; mint NO part-of relation and NO `owl:TransitiveProperty`.**

**Position.** Transitivity is a question only if there is a Property→Building→Room chain to be transitive *over*. Under Q2 there is no Building node, so there is no chain: `opda:RoomDimension` hangs directly off `opda:Property` by one multi-valued object property `opda:hasRoomDimension`. There is therefore **nothing to declare transitive**, no `dcterms`/mereo part-of to mint, no `owl:TransitiveProperty`. The §Q6a reasoner-independence test settles it: a transitive part-of would only earn its keep if a query needed UNION-over-parts to equal an entailed-whole answer-set — and no such query exists. If Building is ever promoted, *that* session mints the part-of relation and re-evaluates transitivity against the query that fired the trigger — not before.

**Reasoning (Working Ontologist 3e).** 3e ch. 9 on transitivity and property characteristics is explicit that transitivity is a *commitment with entailment cost*, justified by the inferences a consumer draws — not asserted prophylactically. Asserting mereological transitivity over a hierarchy nobody queries is decorative entailment.

**Vote:** **REVISE** — collapse Q3 to a single direct `opda:hasRoomDimension`; mint no part-of, no transitivity.

---

### Q4 — `length` / `width` / `roomName` (units; roomName non-rigid)? — **AFFIRM bare `xsd:decimal` + `xsd:string`; do NOT mint a unit scheme (reuse-before-mint); roomName never a key.**

**Position.** Concur with Kendall, and press the reuse point hardest. The three become fields of `opda:RoomDimension`: `opda:length` and `opda:width` as `xsd:decimal`, `opda:roomName` as `xsd:string`. **No `UnitOfLengthScheme`.** The standing corpus precedent is decisive: `opda:area` already ships as a *bare* `xsd:decimal` on `opda:Property` with `UnitOfAreaScheme` deliberately **unwired** (brief; ODR-0024). Minting a *length* scheme now — while the *area* scheme sits unwired — is inconsistent over-reach against our own precedent and Baker's reuse discipline. Carry length/width as bare `xsd:decimal`, fix the unit (metres, per the data dictionary) in `rdfs:comment` plus an optional SHACL plausible-range bound, and leave it there. If units ever genuinely vary in the data, that is a **single unit-pattern trigger that spans `area` too** — not a room-local mint, and not this session's to make. `roomName` is a non-rigid label inside the value structure, **never a key, never an identity criterion** (ODR-0024 R10; OntoClean anti-rigidity, Allemang/Hendler/Gandon ch. 11).

**Reasoning (Working Ontologist 3e).** 3e ch. 3 + ch. 13's units-of-measure discussion: don't introduce a controlled-vocabulary scheme for a dimension whose value-space the data does not vary; a literal with a documented unit is the smaller sufficient model. Two unwired schemes (area, length) would be governance debt for zero query benefit.

**Vote:** **AFFIRM** the datatype fields; **REJECT** minting `UnitOfLengthScheme`; roomName non-rigid never-key.

---

### Q5 — realisation + minimality? — **AFFIRM minimality, with the tightest realisation: exactly ONE mint pair.**

**Position.** The simplest model that works, end to end:

1. **`opda:RoomDimension`** — anonymous by-value structure (the `opda:MonetaryAmount` template, ODR-0024 R3): **no `owl:hasKey`, no IC, blank-node-shaped.** Fields `opda:length`/`opda:width` (`xsd:decimal`), `opda:roomName` (`xsd:string`, non-rigid, never a key).
2. **`opda:hasRoomDimension`** — multi-valued `owl:ObjectProperty`, `rdfs:domain opda:Property`, `rdfs:range opda:RoomDimension`. (Flat per §Q6a — no `rdfs:subPropertyOf`.)
3. **`dct:source` array** on the three fields → `propertyPack.buildInformation.roomDimensions.rooms[].{length,width,roomName}` (ODR-0008 §Q3a per-leaf-path discipline).
4. **SHACL (Knublauch's territory):** an `opda:RoomDimensionShape` requiring `length`+`width` (`sh:minCount 1`, `sh:datatype xsd:decimal`, plausible `sh:minInclusive`), `roomName` optional `xsd:string`, **blank-node nodeKind (no `sh:nodeKind sh:IRI`)**, and **no uniqueness/key constraint** — the shape *is* the realisation of "structured value, not individual."

**Not minted (deferred at zero cost):** `opda:Building` (no tabled re-identifying query — Q2), `opda:Room` (no IC realisable from this data — Q1), `UnitOfLengthScheme` (reuse precedent — Q4), any part-of relation or `owl:TransitiveProperty` (no node to relate — Q3). This covers all 3 uncovered leaves, takes coverage past the 236/239 mark on the honest count, and leaves the genuine Building IC preserved behind the existing dormant `skos:exactMatch` path. It is one mint of substance, not five.

**Reasoning (Working Ontologist 3e).** This is the whole arc of the book in one decision: model the *thing the data forces* (a bound triple of measurements), reuse the pattern you already ratified for it, and refuse every Kind, scheme, and entailment that no query consumes. "Derive, don't declare" lands here as: derive the room-row binding from a value structure; do not declare a Building hierarchy the queries never walk.

**Vote:** **AFFIRM** the minimal realisation above.

---

## What to mint (or not)

**MINT (exactly two, this session):**

- `opda:RoomDimension` — by-value structure (no `owl:hasKey`, no IC, blank-node), fields `opda:length`/`opda:width` (`xsd:decimal`), `opda:roomName` (`xsd:string`, non-rigid). Pattern-clone of `opda:MonetaryAmount` (ODR-0024 R3).
- `opda:hasRoomDimension` — multi-valued `owl:ObjectProperty`, domain `opda:Property`, range `opda:RoomDimension`, flat (§Q6a).
- (plus the SHACL `opda:RoomDimensionShape` and the `dct:source` paths — realisation, not new vocabulary.)

**DO NOT MINT (deferred at zero cost, options preserved):**

- `opda:Building` — IC genuine (ODR-0005 §3a-4 Replacement) but **latent**; no tabled re-identifying query. Gated on S026's sharpened re-identification trigger; dormant `skos:exactMatch`→subclass path is the zero-cost re-home. (REVISES Kendall, who mints it now as a bearer.)
- `opda:Room` — no realisable IC from this data; `roomName` barred as identity (ODR-0024 R10).
- `UnitOfLengthScheme` — reuse-before-mint; `area`'s `UnitOfAreaScheme` is itself unwired, so a length scheme is inconsistent over-reach. Unit fixed by `rdfs:comment` + SHACL bound.
- any `partOf` mereology / `owl:TransitiveProperty` — no Building node ⇒ no chain to be transitive over.

**Engage:** Cagle (DA) — agree rooms are structured values not individuals, but I go one step tighter than a Building-bearer: attach the value structure straight to `opda:Property`. Knublauch (SHACL) — the lean blank-node `opda:RoomDimensionShape` with no key is the realisation; please confirm `sh:datatype`/plausible-range bounds. Davis (deployment) — this is your reversibility argument carried to its conclusion: no Building IRIs minted ⇒ promotion later is a generator change, not a published-data migration.
