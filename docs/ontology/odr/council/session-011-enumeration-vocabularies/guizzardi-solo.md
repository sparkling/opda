# Guizzardi — solo position on S011 (UFO meta-category per scheme; B3 pilot)

*Solo position file. UFO/OntoUML voice on Q8 (load-bearing); brief positions on Q1, Q2, Q4, Q5, Q6, Q7 (substrate mode — Q3 deferred per convening). Q8 is the **B3 pilot** with `consensus-mode: hive-mind/typed-output`: my per-scheme verdict IS the structured artefact downstream tooling consumes.*

## Stance summary

I am load-bearing this session on Q8 because Q8 is *my* sub-finding from Scope-Check 1 Q3 (8-1, 2026-05-26) — adopted as A5 in the meta-Council amendments — now operationally tested. The finding: SKOS concepts across PDTF v3's 160 enums are not all the same kind of thing. Some are **Qualia in a Quality Region** (EPC band, council-tax band — values in a banded valuation/efficiency region); some are **Role labels** (Buyer, Seller's Conveyancer); some are **Phase labels** (Proposed/Invited/Active/Removed); some are **method/plan codes** (Personal Representative, Power of Attorney). The four categories are drawn from Guizzardi 2005 Ch. 4 (UFO Substance Kind / Role / Phase / Relator / Mode / Quale taxonomy) and from the UFO 2007/2011/2015 lineage. The per-scheme meta-category declaration is a MUST per the A9 amendment (`kind: pattern` ODRs state UFO/DOLCE meta-category in `## Rules`).

Per the A9 amendment landed 2026-05-27 (Reduced Council, Queen Kendall, DA Guarino — withdrew on all four conditions met), ODR-0011 is `kind: pattern` — and a scheme is a class commitment about what kind of entity the scheme's members are. The A9 §Per-kind discipline requires (a) UFO/DOLCE meta-category commitment, (b) IC over named hard cases, (c) artefact realisation. ODR-0005 §2a discharged (a) for `opda:Property` / `opda:LegalEstate` / `opda:RegisteredTitle` as Substance Kinds; ODR-0015 §2a discharged (a) for `opda:Address` as Substance Kind. S011 must discharge (a) at the *scheme* level — per scheme, not per concept.

The B3 pilot tests whether the typed verdict is **consumable by downstream tooling**. The four-category vocabulary must (i) cover every PDTF v3 scheme observed, (ii) produce a mechanically-readable assignment table the `odr-review` lint and the SKOS generator can consume, (iii) preserve the Substance-Kind-vs-Mode/Role/Phase/Quale distinction load-bearing in S005 + S015. If a scheme genuinely doesn't fit any of the four, I propose a fifth category with explicit UFO grounding rather than mis-categorising. Q1 (scheme membership criteria) asks "is this thing a SKOS scheme at all?"; Q8 asks "if yes, what UFO meta-category?" — the two are orthogonal.

## Per-question positions (Q1-Q7 brief; Q8 load-bearing)

### Q1 — Scheme membership criteria (brief)

**Floor with cross-overlay reuse trigger.** Not every JSON enum becomes a SKOS scheme. Floor: ≥3 members AND (cross-overlay reuse OR governable-by-authority OR cited from `## References` of another ODR). A two-member `yesNoNotKnown` enum is a SHACL `sh:in` literal-list, not a scheme. Per Isaac/Miles SKOS Reference §5, a `skos:ConceptScheme` is a *register* — a scheme of one or two members has no register-value. Per the ODR-0011 §Rules `Indicative schemes` enumeration, all named schemes pass the floor.

**Vote: FOR floor + cross-overlay-reuse trigger.**

### Q2 — Cardinality (brief)

`skos:prefLabel @en` **exactly 1** per concept per language per SKOS integrity constraint (W3C SKOS Reference §S14). `skos:notation` **exactly 1** for the canonical machine code (HMLR `classOfTitleCode`, EPC band letter); secondary notations admitted via `skos:notation` with a `dct:source`-marked typed-literal datatype per Q7. `skos:definition` **exactly 1** per concept per language. Closed schemes carry `sh:in` per ODR-0013; open-ended schemes do not.

**Vote: FOR exactly-1 cardinality for `prefLabel @en` + `notation` + `definition`.**

### Q4 — Definition source (brief)

**Glossary first; data dictionary second; schema annotation third.** Per ODR-0011 Rule 2 ("Labels and definitions are sourced from the business glossary verbatim where the term exists there"). Where no glossary term exists, the canonical schema leaf's `description` is `skos:definition` source. `dct:source` on every concept resolves to the originating row (per ODR-0004 §7a five-line precedence) — this is Baker DCMI discipline, not paraphrased prose.

**Vote: FOR glossary→data-dictionary→schema-annotation precedence; `dct:source` mandatory per concept.**

### Q5 — Code-list lifecycle (brief)

**`prov:wasDerivedFrom` for succession; `dct:isReplacedBy` for retirement-with-replacement.** Per the PROV-O succession pattern re-instantiated across S005 §6a (UPRN), S009 (Claims/Evidence), S015 §4a (INSPIRE / OS AddressBase) — third site already counted at S015; if S011 produces a fourth scheme-level succession event, that satisfies ODR-0001 A9 §Artefact identity test (third-citing-site criterion) for `pattern`-extraction. Versioning per `owl:versionIRI` on the scheme; deprecation via `owl:deprecated true` on the concept; succession chain via `prov:wasDerivedFrom`.

**Vote: FOR PROV-O succession on concepts; `owl:deprecated` for retirement; `dct:isReplacedBy` only when one concept supersedes another.**

### Q6 — Namespace (brief)

**Single `opda:` namespace with scheme-qualified URIs.** Per ODR-0004 Rule 2 (single hash namespace; layer-segregated naming) and ODR-0011 Rule 6 (`opda:` schemes minted under the single hash namespace per ODR-0004). Scheme-qualified URIs: `opda:role/Buyer`, `opda:councilTaxBand/A` — the scheme is part of the URI path, not the namespace prefix. Per-scheme namespaces fragment the URI graph (Gandon LDP Principle 3 concern) and break the layer-segregated naming convention.

**Vote: FOR single `opda:` namespace + scheme-qualified URI path.**

### Q7 — Notation typing (brief)

**Scheme-specific datatype where the notation carries semantics.** Per SKOS Reference §6 (Notations), `skos:notation` is typed by `rdfs:Datatype`. For EPC band, the datatype is `opda:EPCBandLiteral` (a custom datatype admitting `A`–`G`); for council-tax band, `opda:CouncilTaxBandLiteral` (`A`–`I`, with the Welsh `I` exception). For schemes whose notation is opaque (HMLR `classOfTitleCode` `10/20/30/...`), `xsd:string` is the floor. The typed-datatype distinguishes ordinal-banded notations (Q8 Quale-in-Region) from opaque-code notations (Q8 method/plan code).

**Vote: FOR scheme-specific datatype on `skos:notation` where the notation is banded/ordinal; `xsd:string` otherwise.**

---

### Q8 — UFO meta-category per scheme (B3 pilot — typed output)

**This IS the typed-output verdict.** Per scheme, the UFO meta-category assignment with a one-sentence UFO grounding. The four candidate categories (Quale-in-Region / Role label / Phase label / method/plan code) cover the cases observed in PDTF v3; one named scheme (`opda:assuranceLevel`) requires a **fifth category** I propose with UFO grounding below.

**Typed-output table — downstream tooling (`odr-review` lint extension; the SKOS scheme generator) reads these assignments mechanically. The generator emits `opda:ufoCategory` triples on each `skos:ConceptScheme` declaration per the assignment in column 2.**

| Scheme | UFO meta-category | One-sentence UFO grounding |
|---|---|---|
| `role` | **Role label** | Buyer/Seller's Conveyancer/Estate Agent are UFO Role-instance labels — anti-rigid Roles a Person/Organisation plays in a Transaction Relator (per Guizzardi 2005 Ch. 4; founded by the conveyancing Relator declared in ODR-0007). |
| `sellersCapacity` | **Method/plan code** | Personal Representative / Power of Attorney are codes for the *legal-instrument method* by which the seller acts — not the seller's Role (the seller remains Seller), but the procedural plan-code authorising the action (Guizzardi 2005 Ch. 4 on method/plan-codes as Abstract individuals in UFO-A; cf. Guizzardi & Wagner 2010 on action-modelling). |
| `participantStatus` | **Phase label** | Proposed / Invited / Active / Removed are phases of a Participant Role-instance within a Transaction — Phases are intra-Kind partitions of a Kind across time (Guizzardi 2005 Ch. 4; OntoUML Phase stereotype). |
| `ownershipType` | **Quale-in-Region** | Sole / Joint Tenants / Tenants in Common are values in the ownership-structure quality-region of an `opda:LegalEstate` — Qualia particularising the estate's structural quality (Masolo et al. 2003 D18 §4.3 quality regions; cf. ODR-0005 §2a LegalEstate Substance Kind). |
| `builtForm` | **Quale-in-Region** | Detached / Semi-Detached / Terraced / Flat are values in the built-form quality-region of an `opda:Property` — Qualia particularising the physical-form quality (DOLCE quality-region pattern; Detached is not a *kind* of Property, it is a *value* the form-quality of the Property takes — Baker/Knublauch S001 Q5 anti-pattern avoided). |
| `councilTaxBand` | **Quale-in-Region** | A–H (E&W) / A–I (Wales) are values in the valuation-band quality-region of an `opda:Property` — ordinal-banded Qualia particularising the council-tax-valuation quality at a stewardship-authority-fixed point in time (Masolo et al. 2003 D18 §4.3; ordinal Qualia per UFO 2015 lineage). |
| `currentEnergyRating` | **Quale-in-Region** | A–G are values in the energy-efficiency quality-region of an `opda:Property` — ordinal-banded Qualia particularising the energy-performance quality at EPC-issue date (cf. EU Directive 2010/31/EU energy-band definitions; same UFO-Quale grounding as councilTaxBand). |
| `opda:assuranceLevel` | **Quality Region** (proposed fifth category) | Self-asserted / Verified / Vouched are not Qualia *in* a region — they ARE *the region* itself, an ordered range of trust-strengths the underlying `opda:Claim` quality may take values in. A Quality Region is a SKOS-scheme commitment about a UFO Quality space (Masolo et al. 2003 §4.3; per Guizzardi 2005 Ch. 4, Quality Regions are themselves UFO entities of type Abstract — the scheme's `skos:ConceptScheme` IS the Quality Region resource; member concepts are Qualia in it). This collapses to "Quale-in-Region" if the Quality is named separately, but `opda:assuranceLevel`'s scheme commits *both* (the region and the Qualia). |
| `tenureKind` (freehold/leasehold/commonhold) | **Substance Kind label** (proposed fifth category — distinct from method/plan code) | Freehold / Leasehold / Commonhold are *labels for UFO Substance Kinds of `opda:LegalEstate`* — i.e. each scheme member is a label for a sub-Kind (`opda:Freehold`, `opda:Leasehold`, `opda:Commonhold` all `rdfs:subClassOf opda:LegalEstate`). Not Role (a LegalEstate cannot stop being freehold without ceasing to be that estate — rigid); not Phase (intra-Kind not cross-Kind); not Quale (these are full Kinds with their own ICs in ODR-0005 §3b). The scheme is a *labelling vocabulary for sub-Kinds*, governed independently of the OWL sub-class declarations (which live in ODR-0005). Generator emits `opda:ufoCategory "SubstanceKindLabel"`. |
| `addressVariant` (title/marketing/inspire — S015) | **Quality** (UFO Quality particularising a Substance Kind, per S015 §2a) | Title / Marketing / INSPIRE are values of the `opda:addressVariant` UFO Quality that particularises an `opda:Address` Substance Kind within the Kind (per ODR-0015 §2a — "The `opda:addressVariant` property is a UFO Quality particularising the Kind"). The scheme members are *Quality values* (a Quality particularises by taking a value); the scheme itself is the closed value-set of that Quality. **Distinct from Quale-in-Region** — Quale-in-Region values are *positioned within a metric region* (EPC band A is "better than" B by efficiency); `addressVariant` values are *contextual tags* with no ordering (`title` is not "better than" `marketing`). Generator emits `opda:ufoCategory "QualityValue"`. |

**Five categories total** (four candidates plus the two extensions). The B3 pilot's structured output:

```turtle
opda:roleScheme a skos:ConceptScheme ; opda:ufoCategory "RoleLabel" .
opda:sellersCapacityScheme a skos:ConceptScheme ; opda:ufoCategory "MethodPlanCode" .
opda:participantStatusScheme a skos:ConceptScheme ; opda:ufoCategory "PhaseLabel" .
opda:ownershipTypeScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:builtFormScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:councilTaxBandScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:currentEnergyRatingScheme a skos:ConceptScheme ; opda:ufoCategory "QualeInRegion" .
opda:assuranceLevelScheme a skos:ConceptScheme ; opda:ufoCategory "QualityRegion" .
opda:tenureKindScheme a skos:ConceptScheme ; opda:ufoCategory "SubstanceKindLabel" .
opda:addressVariantScheme a skos:ConceptScheme ; opda:ufoCategory "QualityValue" .
```

**Vote on Q8: FOR five-category assignment + `opda:ufoCategory` triple emission per scheme + `odr-review` lint MUST verify `opda:ufoCategory` presence on every `skos:ConceptScheme` declared by a `kind: pattern` ODR.**

The B3 pilot succeeds iff (i) every PDTF v3 scheme observed in `Indicative schemes` (ODR-0011 §Rules) has a category assignment in the table; (ii) `odr-review` lint can mechanically verify `opda:ufoCategory` declarations; (iii) the SKOS generator emits the Turtle above from the table without inference. All three conditions hold under the proposed assignment.

**Why the five categories carve at the joints.** The four candidates I named in Scope-Check 1 Q3 (Quale-in-Region / Role label / Phase label / method/plan code) covered the schemes I had in mind then — `role`, `sellersCapacity`, `participantStatus`, `councilTaxBand`, `currentEnergyRating`. When I pressure-tested against the full PDTF v3 scheme list (`tenureKind`, `ownershipType`, `builtForm`, `opda:assuranceLevel`, `addressVariant`), two schemes did not fit cleanly: `tenureKind` (which labels Substance Kinds, not Qualia) and `addressVariant` (which is a UFO Quality particularising a Kind per S015 §2a, not a Quale in a metric region). Inventing categories rather than mis-categorising preserves the Substance-Kind-vs-Mode-vs-Role-vs-Phase-vs-Quale discipline load-bearing in S005 + S015 — the very discipline A9 made normative for `kind: pattern` ODRs. The fifth-and-sixth categories are explicit; they cite the UFO/DOLCE sources directly; the lint and generator consume them mechanically.

**Q1-vs-Q8 separation.** Q1 asks "is this thing a SKOS scheme at all?" and applies the floor (≥3 members, cross-overlay reuse, or governable-by-authority). Q8 asks "if yes, what UFO meta-category?" and applies the five-category vocabulary. The two are orthogonal — a scheme can pass Q1's floor and require any of the five Q8 categories. A scheme that fails Q1 (e.g. two-member `yesNoNotKnown`) has no Q8 obligation because it has no scheme.

**Cross-scheme consistency check.** The `opda:tenureKind` SKOS scheme members (`Freehold`, `Leasehold`, `Commonhold`) MUST `skos:exactMatch` the OWL sub-classes (`opda:Freehold`, `opda:Leasehold`, `opda:Commonhold`) declared in ODR-0005's downstream OWL realisation. The same discipline applies to any `SubstanceKindLabel` scheme: SKOS label vocabulary on one side, OWL class hierarchy on the other, `skos:exactMatch` (NEVER `owl:sameAs` per ODR-0005 Anti-pattern §5) bridging them. The lint extension verifies the bridge.

---

## DA anticipation (Gandon — SKOS-vs-OWL formal correctness)

**Anticipated DA line.** Gandon's W3C-Recommendation-grounded discipline cuts in two ways on this verdict. **Concern 1: SKOS membership semantics.** Per the SKOS Reference (Isaac/Miles 2009) §S26–S29, `skos:Concept`s are *informal* concepts, not OWL classes. A `skos:Concept` for `Freehold` (`opda:tenureKind/Freehold`) is **not** the same resource as the OWL class `opda:Freehold rdfs:subClassOf opda:LegalEstate`. Treating the scheme as a "Substance Kind label scheme" risks conflation — the lint must enforce that the SKOS concept *labels* the OWL sub-class but the two resources remain distinct (`skos:exactMatch` or `rdfs:isDefinedBy`, not `owl:sameAs`). **Engagement:** Conceded. The generator MUST emit `opda:tenureKind/Freehold skos:exactMatch opda:Freehold` (concept-to-class link as SKOS, never as `owl:sameAs`). The lint extension verifies this for every `SubstanceKindLabel` scheme. The two layers (OWL class hierarchy in ODR-0005 + SKOS scheme in ODR-0011) coexist; the SKOS scheme governs the label vocabulary, the OWL hierarchy governs the membership reasoning. Same discipline as ODR-0005 Anti-pattern §5 (no `owl:sameAs` across surfaces).

**Concern 2: OWL discipline for the proposed fifth/sixth categories.** "Substance Kind label" and "Quality value" are not standard UFO meta-category names — they are scheme-typing tags I have coined. Per Gandon's W3C standards-purist position, novel meta-category vocabulary requires `dct:source` to a published authority. **Engagement:** Conceded. Both are grounded in published UFO sources: SubstanceKindLabel via Guizzardi 2005 Ch. 4 (Kinds vs labels-for-Kinds; the labelling-relation is `rdfs:label`-equivalent SKOS surface, not a Kind itself); QualityValue via Masolo et al. 2003 D18 §4.3 (Quality particularises a Kind; the Quality's value space is the Quality Region; individual values are Qualia or Quality values per region type). The `dct:source` on the `opda:ufoCategory` predicate's `rdfs:comment` cites both verbatim per ODR-0004 §7a precedence.

**Concern 3: SKOS integrity vs OWL.** Per Gandon's W3C role, SKOS integrity constraints (S37–S46) require `skos:prefLabel` uniqueness per language; the per-scheme UFO meta-category MUST NOT violate them by introducing OWL-class semantics into SKOS concepts. **Engagement:** Conceded inline. The `opda:ufoCategory` triple is on the `skos:ConceptScheme` (not on member concepts); member concepts remain plain SKOS Concepts; SKOS integrity constraints are preserved.

Net engagement: Gandon's three concerns sharpen the verdict but do not invalidate it. The amendment that lands: (i) per-scheme `opda:ufoCategory` on `skos:ConceptScheme` only (not on concepts); (ii) `skos:exactMatch` (never `owl:sameAs`) when a SKOS concept labels an OWL sub-class; (iii) `dct:source` on the `opda:ufoCategory` predicate citing Guizzardi 2005 Ch. 4 + Masolo et al. 2003 D18 §4.3 for the five-category vocabulary. Gandon DA withdraws on all three conditions met.

**B3 pilot consumability check.** The three downstream consumers of the typed-output table are:

1. **`odr-review` lint extension** — reads the table mechanically; for every `kind: pattern` ODR declaring a `skos:ConceptScheme`, verifies `opda:ufoCategory` triple presence and value-in-vocabulary; blocker on `status: accepted` per A9 enforcement discipline.
2. **SKOS scheme generator** — reads the table; emits `opda:<scheme>Scheme a skos:ConceptScheme ; opda:ufoCategory "<value>" .` per row without further inference; deterministic Turtle output.
3. **LLM tooling** (per ODR-0005 §6a Cagle DBpedia 2017 lesson on fallback heuristics) — the `opda:ufoCategory` triple is the *machine-readable substitute* for prose UFO grounding; an LLM consumer reads the triple, dispatches per category (Quale-in-Region → ordinal-comparison logic; Role label → Relator lookup; etc.), and avoids the fallback-to-`owl:sameAs` heuristic Hellmann et al. 2017 documented.

All three consumers read the same table; the table IS the artefact; the narrative position above is documentation, not data.

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. Ch. 4 (UFO Substance Kind / Role / Phase / Relator / Mode / Quale taxonomy).
- Guizzardi, G. et al. (2015). *Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story*. Applied Ontology 10(3-4) — UFO 2007/2011/2015 lineage.
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*, D18. §4.3 (Quality, Quality Region, Quale).
- Guizzardi, G., Wagner, G. (2010). *Towards an Ontological Foundation of Discrete Event Simulation*. Winter Simulation Conference — action-modelling / method-codes.
- Isaac, A., Miles, A., eds. (2009). *SKOS Simple Knowledge Organization System Reference*. W3C Recommendation. §S14 (prefLabel uniqueness); §S26–S29 (informal concepts); §S37–S46 (integrity).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment 2026-05-27.
- ODR-0005 §2a / §3a-c (UFO Substance Kind precedent + 3-class commitment + IC discipline).
- ODR-0015 §2a (UFO Substance Kind for Address + `addressVariant` as UFO Quality).
- ODR-0011 §Rules (the substantive stub under deliberation).
- Scope-Check 1 Q3 (2026-05-26, Queen Kendall, DA Davis) — my sub-finding adopted as A5 (8-1).
