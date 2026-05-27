# Knublauch + Pandit — Session 008 (ODR-0008 Property Descriptive Attributes)

> Extended-panel paired position. Knublauch — shapes-graph discipline,
> profile composition, DASH. Pandit — DPV per-attribute PII identification
> and class-level co-annotation per ODR-0018. Both have ratified ODRs
> here (Knublauch Queen S010 + S013; Pandit Queen S012 + canonical author
> of ODR-0018). Joint votes where we agree on mechanism.

---

## Q1 — Spanning-leaf threshold N

**Knublauch.** Not a threshold issue. The signal is *shape-target
convergence*: query for `?shape sh:targetClass opda:Property ; sh:path ?p`
and group by `?p`. Every path resolving to two or more profile shapes IS
a spanning leaf, by definition. N drops out of SHACL shape-target
grouping; the 18-count for `propertyPack` and the 5-count long tail
collapse under one discipline. SHACL doesn't care how many overlays a
path appears in, only that the shapes targeting it agree on class.

Cite: SHACL Core §2.1 (shape targets); ODR-0010 §Rules Q1 Rule 1
(`sh:minCount 1` on profile-graph union); ODR-0010 §Q6 no-identity-
override gate ensures reconciliation cannot accidentally override an
identity-key.

**Pandit.** Converge — reject arithmetic threshold; add a PII discovery
hook. *Every* spanning-leaf candidate, independent of N, fires a SHACL-AF
rule (ODR-0017 pattern) querying any new property bearing PII-shaped
data (name/email/phone/DOB patterns; day-precision dates in person
contexts; UPRN-adjacent address leaves) and raising `sh:Warning` if the
property reconciles ≥2 overlays without a DPV co-annotation per ODR-0018
§3a. Per S012 §Rules "Standing cost on new PII" (Pandit Q7 ratified
10-0), the rule is *refusal*, not advisory — silent PII cannot accrete at
reconciliation time.

Cite: ODR-0017 §1a (SHACL-AF `sh:Warning` template); ODR-0018 §3a (DPV
triples in `opda-annotations.ttl`, not shapes); S012 §Rules.

**Joint vote — FOR.** Reject arithmetic threshold; adopt SHACL
shape-target detection gated by ODR-0017 PII discovery rule. 2-0.

---

## Q2 — Sub-module split

**Knublauch.** Shapes-graph organisation follows `sh:targetClass`, not
arbitrary domain partition. The descriptive families in the stub
(built-form / energy / utilities / searches / encumbrances) are
human-readable groupings; they don't carve a shapes-graph cleanly. Split
by target class because profile composition is build-step graph-union
per ODR-0010 §Rules; minimising union-input count is operational
kindness. Sub-modules earn their place only when a sub-Kind crystallises
per Q4 (Survey/Search/Building get their own files because they get
their own `sh:NodeShape` + identity-key shapes per ODR-0010 §Q6).

Cite: ODR-0010 §Rules Q1-Q4 (Knublauch's canonical mapping); ODR-0004
§3a (three-graph separation is shapes-vs-classes-vs-annotations, not
within-shapes partition).

**Pandit.** Governance has its own module — ODR-0012. The descriptive-
attributes module excludes the governance layer outright. DPV co-
annotations for PII-bearing descriptive attributes (occupier names;
survey-report personal data) live in `opda-annotations.ttl` per ODR-0018
§3a, authored by ODR-0012 from ODR-0008-declared mapping tables (ODR-0018
§Rule 7). ODR-0008 declares *which* leaves are PII-bearing; ODR-0012
authors the actual DPV triples. If a sub-module ODR ever spins out
(survey/search/encumbrance), it `implements: [ODR-0018]` automatically
because the PII concentration mandates the class-level pattern.

Cite: ODR-0012 §Rules Phase 1 (Pandit Queen 10-0); ODR-0018 §3a + §Rule
7.

**Joint vote — FOR.** Single descriptive module organised by
`sh:targetClass`; sub-modules only when a Kind crystallises (Q4);
governance excluded per ODR-0012/0018 separation. 2-0.

---

## Q3 — Data-dictionary citation grain (`dct:source`)

**Knublauch.** Per-property `dct:source` with version-pin, per ODR-0004
§7a. The five-line term-sourcing precedence ratified at S004 puts
`dct:source` on the *property*, citing the data-dictionary leaf-path
version-pinned. Per-property is load-bearing because (i) SHACL property
shapes inherit `dct:source` from the property they target; (ii) BASPI5
round-trip (ODR-0010 §Q7 MVP) needs per-property traceability; (iii)
per-section grain breaks the spanning-leaf discipline — a leaf spanning
18 overlays needs 18 `dct:source` triples on one property, not one
section heading erasing overlay distinctness. ODR-0008 §Rules
"Cross-context reconciliation" already operationalises the multi-source-
per-property pattern; per-section grain is rejected.

Cite: ODR-0004 §7a (ratified S004 Q4 9-0); ODR-0008 §Rules; ODR-0010
§Q7.

**Pandit.** Same grain applies to DPV co-annotations. Per ODR-0018 §Rule
6, every DPV co-annotation MUST carry `dct:source` resolving to the
regulator's published text verbatim (DPV-PD §Scope discipline per ODR-
0011 §4a — my S011 Q4 amendment). For property-level DPV (per S009 Q6
amendment, ODR-0018 §Rule 4 — both property-level AND class-level
admissible), per-property grain is mandatory on the DPV side too.
Concretely: `opda:occupierName` carries two `dct:source` triples — one
to the data-dictionary anchor, one to `https://w3id.org/dpv/pd`. Per-
section grain would collapse them and breach DPV-PD §Scope.

Cite: ODR-0018 §Rule 6; ODR-0011 §4a (Pandit S011 Q4); ODR-0009 §Q3
§Rules.

**Joint vote — FOR.** Per-property grain; multi-source per-property
admitted; reject per-section grain; apply equally to DPV co-annotations.
2-0.

---

## Q4 — Granularity floor

**Knublauch.** When a structured value needs `sh:NodeShape` with its own
property shapes, it becomes a Kind. SHACL operational test: if the data
needs its OWN constraints (own identity-key via `dash:uniqueValueForClass`
per ODR-0013 §Rules; own property cardinalities; own enums), the leaf is
under-modelled as datatype property; promote. Otherwise stays datatype-
typed with `sh:datatype` / `sh:pattern`.

Concrete: `opda:Address` already a Kind per ODR-0015 (S015 Q3 2-1 FOR
class with property shapes); `opda:Survey` (surveyor identity + date +
findings + per-defect classification — promote); `opda:LocalSearch`
(provider + reference + findings — promote); `opda:yearOfBuild` (atomic;
stay datatype with `sh:minInclusive` / `sh:maxInclusive`); `opda:heating`
(borderline — datatype + SKOS scheme if closed enum; promote to
`opda:HeatingSystem` if structured per multi-zone). The decision is
binary at SHACL level — `sh:NodeShape` vs `sh:PropertyShape`.

Cite: ODR-0013 §Rules constraint mapping; ODR-0015 §Q3; ODR-0010 §Q6
(no-identity-override gate — promoted Kinds get identity per ODR-0005,
not via overlay override).

**Pandit.** Survey/Search are likely Kinds AND the reason is PII regime.
Converge on the structural criterion; add: when a candidate-leaf-becomes-
Kind bears concentrated PII (per S012 standing cost), class-promotion
warrants DPV co-annotation per ODR-0018 §Rule 1 (class-level baseline
MUST be declared) — the per-attribute parallel to ODR-0006's S006 Q1
amendment (`opda:Person` carries baseline). `opda:Survey`: surveyor name
+ contractor names + occupier disclosure → baseline `dpv-pd:Person` +
variant-conditional refinements (surveyor → PublicTask under RICS;
occupier → Consent/LegitimateInterest by engagement context).
`opda:LocalSearch`: provider identity + third-party named-individual
disclosures → class-level baseline as appropriate. `opda:Building` /
`opda:Room`: atomic; no PII; structural test alone governs. The two
criteria compose at the same gate.

Cite: ODR-0018 §Rule 1, §Rule 2; ODR-0006 §Q1; S012 §Rules.

**Joint vote — FOR.** `sh:NodeShape` criterion as floor;
Survey/Search/Building admitted as Kinds when structural criterion
fires; PII-bearing promoted Kinds retrofit `implements: [ODR-0018]` at
promotion. 2-0.

---

## Q5 — Datatype property vs SKOS

**Knublauch.** SKOS for closed sets that benefit from `sh:in` over the
scheme; DatatypeProperty for opaque strings. Per ODR-0013 §Rules
constraint table: `enum` (closed) → `sh:in` over SKOS scheme members.
Category-like attributes meet the SKOS criterion when (i) the enum is
genuinely closed per ODR-0011 §Rules; (ii) members benefit from
`skos:definition` + `dct:source`; (iii) downstream consumers need
`skos:broader` / `skos:related` navigation. Applies to `councilTaxBand`
(A-H), `currentEnergyRating` (A-G), `builtForm` (4-5 forms),
`centralHeatingFuelType`. Datatype-typed stays default for opaque
strings (`buildInformation`), numbers (`yearOfBuild`, `bedrooms` —
`sh:minInclusive`/`sh:maxInclusive`), booleans, dates. The `sh:in` over
SKOS scheme is the bridge; per ODR-0010 §Q1 Rule 2 profile composition
set-unions members at build, not entailment.

Cite: ODR-0013 §Rules; ODR-0011 §Rules; ODR-0010 §Q1 Rule 2.

**Pandit.** Special-category vocabularies (Article-10) MUST be SKOS with
explicit dpv-pd tags per ODR-0018. Converge on the general criterion;
amend for special-category: per S012 §Rules Phase 1 + ODR-0018 §Rule 1,
any attribute whose enum includes Article-10 territory MUST be a SKOS
scheme with the scheme node co-annotated
`dpv:hasSpecialCategoryPersonalData true` AND each special-category
member co-annotated at concept level (ODR-0011 §4a DPV-PD §Scope
discipline — my S011 Q4 amendment). Concretely: `cautionOrConviction` →
SKOS `opda:CautionOrConvictionScheme`; scheme node
`dpv:hasSpecialCategoryPersonalData true`; per-concept baseline
`dpv-spc:CriminalOffencePersonalData`; `dct:source` to ICO Special
Category guidance + GDPR Art. 10 verbatim. AML outcome enum likewise.
`councilTaxBand` / `currentEnergyRating` / `builtForm` are non-PII —
ordinary SKOS, no Article-10 trigger.

Cite: ODR-0018 §Rule 1; ODR-0011 §4a (S011 Q4); S012 §Rules Phase 1;
ODR-0012 §Rules (Pandit Q3 10-0 Article-10 depth + Cagle `sh:Violation`
SHACL).

**Joint vote — FOR.** Closed-set criterion for SKOS (per ODR-0011);
ordinary SKOS for non-PII categoricals; SKOS + class-level DPV co-
annotation mandatory for special-category enums per ODR-0018. 2-0.

---

## Q6 — Sub-property hierarchies

**Knublauch.** Only when SHACL `sh:property` constraints can usefully
target the parent. Operational test is one-way: define
`rdfs:subPropertyOf` IFF a single `sh:property` constraint on the parent
meaningfully covers all child variants. Otherwise the hierarchy is
decorative — RDFS open-world inheritance does NOT propagate through
SHACL (per ODR-0010 §Rules graph-separation), so a shape on
`opda:utility` does not automatically constrain `opda:mainsWater`
instances unless explicitly targeted.

Concrete: `opda:utility` parent with `mainsWater`/`mainsElectricity`/
`mainsGas`/`mainsDrainage` children — admit IF a uniform shape
(`sh:datatype xsd:boolean`, `sh:minCount 0`, uniform `dct:source` family)
pays for itself; reject if each utility has its own quirks (gas meter-
number; electricity supplier; water hardness). `opda:identifier` parent
with `opda:uprn` / `opda:titleNumber` children REJECTED — per ODR-0005
§3c the identity-key discipline is per-Kind; a generic parent shape
would collide with `dash:uniqueValueForClass` and breach ODR-0010 §Q6
no-identity-override gate. Test: write the `sh:property` shape you'd put
on the parent. If substantive and shared, parent earns its place.

Cite: ODR-0010 §Rules graph-separation; ODR-0013 §Rules; ODR-0010 §Q6;
ODR-0013 §Q1.

**Pandit.** Hierarchies risk silent PII leakage if a parent class auto-
inherits PII-bearing children's tags. Add a governance vigilance: a
property hierarchy MUST NOT cause a parent to acquire DPV co-annotations
from its children automatically — per-property DPV (ODR-0018 §Rule 4) is
per-property, and a parent's PII regime may differ. `opda:identifier`
parent of non-PII `opda:uprn` AND PII-bearing `opda:passportNumber`
REJECTED on PII grounds in addition to Holger's identity-key grounds —
SPARQL traversal would leak Person-identity OfficialID into property-
identity context. `opda:contactDetail` parent of `opda:email` /
`opda:telephone` / `opda:address` admissible only if parent and all
children share the SAME DPV regime; break hierarchy if any child
diverges. `opda:utility` — no PII; PII vigilance does not fire; Holger's
test alone governs. Rule: parent + children must share the same DPV
regime per ODR-0018 §Rule 1 baseline criterion.

Cite: ODR-0018 §Rule 4; ODR-0005 §3c (PII regime as class-level
discriminator); ODR-0006 §Q1.

**Joint vote — FOR.** Hierarchies admitted only when substantive parent
`sh:property` shape covers all variants AND parent and children share
the same DPV regime; identifier-parent rejected on identity-key + PII
grounds. 2-0.

---

## Q7 — Overlay-form variation (handoff to ODR-0010)

**Knublauch.** The three-rule interface contract with ODR-0010 (per S010
§Q8 + S013 §Q7) applies here too.

1. **`sh:in` semantics** — per ODR-0010 §Q1 Rule 2, merged at build via
   build-step replacement, NOT entailment. ODR-0008's descriptive
   properties whose SKOS schemes span overlay-specific subsets emit one
   `sh:in` per profile-graph union (stacked-`sh:in` regression-guard test
   per ODR-0010 §Enforcement applies directly).
2. **`sh:Violation` floor** — per ODR-0013 §Rules.Q1 OWNS the floor;
   ODR-0008 INHERITS. Descriptive attributes never carry `sh:Violation`
   directly — that severity is reserved for the five categories in
   ODR-0013 §Q1 (identity-contract breach + IC breach + no-identity-
   override + special-category PII without lawful-basis + meta-shape-
   over-shape-graph drift). Descriptive gaps carry `sh:Warning` (profile-
   required) or `sh:Info` (optional). Floor reaffirmed.
3. **No-identity-override gate** — per ODR-0010 §Q6 OWNS; ODR-0008
   INHERITS. No descriptive property may declare or override an identity
   criterion (`opda:builtForm` cannot become a Property key;
   `opda:yearOfBuild` cannot become a Building key). The gate's SHACL
   meta-shape (per ODR-0017 §2a amendment landed at S013) applies
   automatically.

Handoff: ODR-0008 declares descriptive properties once on
`opda:Property`/`opda:LegalEstate`/etc.; ODR-0010 owns profile-graph
composition activating per-form variation. The three rules are the
mechanical interface.

Cite: ODR-0010 §References "Three-rule interface contract with ODR-0013"
(Cagle Scope-Check 1 Q6); ODR-0010 §Q1 Rules 1-5 (ratified S010 12-0);
ODR-0013 §Q1 + ODR-0017 §2a amendment landed inline at S013.

**Pandit.** Per-form variation must preserve DPV tags across overlays.
Converge on the three-rule interface; add: a descriptive property's DPV
co-annotation (per ODR-0018 §Rule 4) MUST be invariant across profile
overlays. Loading baspi5 vs ta6 vs nts2 may change required/enum
constraints; it must NEVER change DPV regime. Per ODR-0018 §3a the DPV
co-annotations live in `opda-annotations.ttl` (not shapes graph), and
the CI test `ASK { GRAPH opda:shapes { ?s ?p ?o . FILTER(STRSTARTS(STR(?p),
"https://w3id.org/dpv")) } }` MUST return false — overlays cannot author
DPV in profile shape graphs even if they wanted to. The architecture
enforces DPV invariance.

Corollary: if a descriptive property's PII regime genuinely varies by
overlay, split the property into two; cite ODR-0018 §3a; route the
variant-conditional refinement through ODR-0012's mapping-table
mechanism — per ODR-0018 §Rule 2 variant-conditional refinements apply
to *variant tags* (e.g. `addressVariant` per ODR-0015 §7a precedent),
not to *overlay membership*.

Cite: ODR-0018 §3a; ODR-0018 §Rule 2; S012 §Rules; ODR-0015 §7a.

**Joint vote — FOR.** Three-rule interface contract with ODR-0010
applies; DPV co-annotations invariant across overlays per ODR-0018 §3a
CI test; variant-conditional PII refinements via ODR-0012 mapping
tables, not via overlay membership. 2-0.

---

## Synthesis

Seven joint FOR votes; zero split. Pattern across all seven:

1. **Knublauch names the operational mechanism** — SHACL shape-target
   detection; `sh:targetClass` partition; per-property `dct:source`;
   `sh:NodeShape` floor; `sh:in` over SKOS; parent `sh:property` test;
   three-rule interface.
2. **Pandit names the governance trigger that gates the mechanism** —
   ODR-0017 PII discovery rule; governance-module exclusion; per-property
   DPV `dct:source`; class-level co-annotation at Kind promotion;
   ODR-0018 §Rule 1 for special-category enums; DPV regime invariance
   across hierarchies; DPV invariance across overlays.
3. **Composition** — each governance trigger applies AT the operational
   mechanism's decision point, not post-hoc. The ODR-0018 §3a three-graph
   CI test makes mis-composition mechanically impossible.

ODR-0008 should ratify with this composition explicit in §Rules:
Knublauch's mechanism-side cites ODR-0010 / ODR-0013 / ODR-0011;
Pandit's governance-side cites ODR-0012 / ODR-0018 / ODR-0017. The
session output unblocks the 935-leaf-to-class mapping work the S005
Q5+Q8 joint amendment deferred S008 on — the framework is here; the
cardinality crystallisation can begin.

**Vote tally (Knublauch + Pandit, paired):**

| Q | Vote |
|---|---|
| Q1 spanning-leaf threshold | FOR |
| Q2 sub-module split | FOR |
| Q3 `dct:source` grain | FOR |
| Q4 granularity floor | FOR |
| Q5 datatype vs SKOS | FOR |
| Q6 sub-property hierarchies | FOR |
| Q7 overlay-form variation | FOR |

**7 FOR, 0 AGAINST, 0 ABSTAIN.**
