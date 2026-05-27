# Allemang + Hendler — joint position on S008 (ODR-0008 Property Descriptive Attributes)

*Pragmatic-pair voice restored: Allemang is Queen of this session, Hendler is
panel; the working-ontologist generator-first instinct meets the
"find-all-X / earn-keep-by-named-consumer-query" web-architecture lens.
ODR-0008 ratifies the **mapping discipline** (the rules), not the mechanical
935-leaf walk. We address the seven questions in that light.*

## Stance summary

**Allemang.** Declare-once-reconcile-overlays is the right cut and the
ODR-0008 stub already commits to it (§Decision; §Rules.Cross-context
reconciliation). The 1,556-leaf base + 935 annotated layer is the textbook
*Semantic Web for the Working Ontologist* (3rd ed.) Ch. 6 case for
generator-first: the mechanical half — leaf → datatype property with `xsd:`
range, `rdfs:domain` the attaching class, `dct:source` to the canonical leaf
path — is *generated* per ODR-0004 §6a; deliberation is reserved for the
genuinely ambiguous reconciliations and for which `object`-typed leaves earn
intermediate classes. FIBO's precedent (over 200 modules, single namespace,
mechanically maintained) is the published proof this scales; DPV's 7+
languages of generated artefacts is the second.

**Hendler.** Every modelling decision in this session must earn-keep against
a **named consumer query**. The Scope-Check 1 termination signal I argued
(*Semantic Web Primer* 2nd ed. Ch. 5; Linked Data Principle 1 — Berners-Lee
2006) is the test: *a new consumer's query reads ≤3 ODRs to assemble its
shape*. ODR-0008's 935-leaf walk is acceptable only if the consumer doesn't
have to walk it — the consumer reads the Property class, the Quale-in-Region
SKOS scheme (ODR-0011), and the overlay profile (ODR-0010), and gets the
shape. If a sub-property hierarchy, an intermediate class, or a custom
datatype doesn't earn its keep against a `find all X` query, it doesn't ship.

Where we converge: the **generator-first** rule + **earn-keep-by-named-query**
rule together discipline this module without re-litigation. Where we differ
mildly: Allemang would default to a flat datatype property and lift to
intermediate class only on operational pressure; Hendler would default to
intermediate class for any leaf whose lifecycle the consumer queries
independently (Survey, Search, EPC Certificate). We mark the difference per
question.

---

## Q1 — Spanning-leaf threshold N

**Allemang.** N = **2**, but with a discipline. The reconciliation rule
isn't "appears in ≥N overlays" — it's "appears in ≥2 overlays AND the
data-dictionary `description` text is semantically the same fact about the
same subject." Current counts (`propertyPack` ×18, `energyEfficiency` ×9,
`mainsWater` ×9-10) all clear N=2; setting N=3 would only buy a smaller pool
to deliberate over, which is the opposite of what working-ontologist
discipline wants (*Working Ontologist* Ch. 14, the FIBO modular-merge
discipline — reconcile aggressively, dissent recorded as `skos:scopeNote`).
The 754 leaves appearing in **only one schema** (data-dictionary §Cross-
context table) are out-of-scope for spanning-leaf reconciliation by
construction; they map 1-to-1 mechanically and get their own datatype
property without deliberation. Set N=2.

**Hendler.** N = **2** with one qualifier: a leaf appearing in exactly 2
overlays still earns one ontology property *only if* the consumer's
`find all X with energyRating Y` query has to span both overlays in the wild.
The 389 leaves in ≥3 schemas (data-dictionary §Cross-context) trivially pass
this; the borderline-2 cases are reviewed against a named consumer query at
generator-emission time. Linked Data Principle 4 (Berners-Lee 2006 — "useful
information") is satisfied by reconciliation, fractured by per-overlay
synonyms. The stub's defect statement — "must reconcile to one ontology
property, not mint per-form synonyms" — is correctly N=2.

**Joint vote: FOR N=2** (with the dictionary-text-semantically-the-same
discipline as the operational filter; per-leaf adjudication when the text
diverges).

---

## Q2 — Sub-module split

**Allemang.** **Keep ODR-0008 monolithic for the discipline-ratification
session.** The *rules* (declare-once; dictionary as inventory; attach to
ODR-0005 classes; SKOS-or-datatype criterion from ODR-0011; overlay
hand-off to ODR-0010) are one set of rules, not five. Splitting the ODR now
forces five copies of the same `## Rules` block (FIBO learned this the hard
way pre-2014; the modular-merge discipline came *after* the rule
ratification, not before). The stub's §Decision phrasing — "MAY later split
into sub-modules (built-form / energy / searches / encumbrances) once volume
is understood" — has it right; the split is implementation-downstream of
this session, not a deliverable of it.

**Hendler.** Concur, with a re-open trigger. Split fires only when **(a)** a
deliverable TTL exceeds ~1,000 terms in active dereference (the ODR-0004
hash-vs-slash reopening trigger) **OR** **(b)** a downstream consumer
queries one family (energy) with materially different SHACL profiles than
another (searches), forcing the consumer to load constraints it doesn't
need. The 7 candidate families (Built form / Condition / Valuation / Energy
/ Utilities / Local context / Encumbrances / Completion — actually 8 by the
stub's own §Rules.Data-dictionary listing) are already named as *families*;
families become sub-modules only when the consumer's query plan forces it.
This is the `find all X` test: a consumer asking "find all EPC bands ≥ C"
should load the Energy family alone, not the Encumbrances tree.

**Joint vote: FOR monolithic this session**; split-trigger recorded
(generated TTL >1,000 terms OR named consumer-query asymmetry across two
families).

---

## Q3 — Data dictionary as source of truth — `dct:source` citation grain

**Allemang.** **Per-property `dct:source`** is the floor (one URI per minted
`opda:` datatype property, resolving to the canonical schema leaf path) AND
**per-overlay-occurrence `dct:source`** is added for spanning leaves (one
extra `dct:source` per overlay reference for the reconciled property). This
is the literal text of the stub §Rules.Sourcing convention + §Rules.Cross-
context reconciliation — "the differing per-overlay `dct:source` references
attach to the single property." Per-section is too coarse (loses the
form-question chain to BASPI `B1.3.2` etc.); per-leaf-per-occurrence is too
fine (just more triples saying the same thing). The middle grain is the
property-as-subject with one or more `dct:source` triples — the SKOS pattern
adapted to datatype-property metadata.

**Hendler.** Concur. The grain *is* the property; the per-overlay
occurrences are extra `dct:source` triples on the same subject. This is the
SHACL profile mechanism's load-bearing input (ODR-0010 §Rules item 4 —
"`baspi5Ref`/`ntsRef` → `dct:source` pointing at a minted, dereferenceable
form-question IRI"). The `find all leaves sourced from BASPI5 question
B1.3.2` query reads one SPARQL triple-pattern (`?p dct:source <…/baspi5#B1.3.2>`);
per-section grain would force a STRSTARTS filter, which is the
"useful-information" failure mode. ODR-0004 §7a precedence (W3C spec >
glossary > schema text) still rules — the schema-leaf path is the
*fifth-line* `dct:source` when the term has no upstream W3C/glossary anchor.

**Joint vote: FOR per-property `dct:source` with per-overlay-occurrence
additional `dct:source` triples on spanning leaves; per-section
explicitly rejected.**

---

## Q4 — Granularity floor — object-leaf → structured datatype vs intermediate Class

**Allemang.** Default to **structured datatype** (or blank-node sub-tree)
unless the object-leaf carries its own lifecycle, identity, or PROV
provenance. *Working Ontologist* Ch. 8 — "the rule is: if you have to ask,
it's a class; if you don't, it's a structured value." Concretely: `Address`
gets an intermediate class because ODR-0015 already settled that (S015 Q1
3-0 FOR `opda:Address` as UFO Substance Kind); `Survey` and `EPC Certificate`
get intermediate classes because they have authority-issuance lifecycles
(`prov:Activity` with `prov:Agent` the certifier; PROV-O is load-bearing per
ODR-0009); `Search` (CON29R / LLC1) gets an intermediate class for the same
reason. `Room`, `roomDimensions`, `numberOfFloors` stay as flat datatype
properties on Property — no lifecycle, no provenance, no identity-bearing
behaviour. `Building` is borderline: collapse it to flat datatype properties
on Property unless multi-building cases force the split.

**Hendler.** Stronger position: **default to intermediate Class** when the
consumer queries the object-leaf's lifecycle independently. The Scope-Check
1 termination signal is the discriminator — `find all surveys issued by RICS
member X` is a named consumer query (regulator audit); `find all rooms of
size > 20m²` is not (no consumer authority queries this). EPC Certificate
graduates because EPCRegister.gov.uk *is* a dereferenceable consumer
(Linked Data Principle 4 trivially satisfies). Survey graduates because
RICS authority-issuance has a PROV-O footprint. The Allemang default works
for non-lifecycle leaves; my add-on is the lifecycle-query test for the
graduation decision.

**Joint vote: FOR Allemang's default (structured datatype) with Hendler's
graduation discriminator (named consumer query against the
object-leaf's lifecycle). Confirmed graduates: `opda:Address` (per S015),
`opda:Survey`, `opda:EPCCertificate`, `opda:Search`. Confirmed
non-graduates: `Room`, `roomDimensions`, `numberOfFloors`, `Building` (until
multi-building exemplar surfaces).**

---

## Q5 — Datatype property vs SKOS scheme — category-like attributes

**Allemang.** **SKOS scheme** per ODR-0011 — no exception. The four named
category-likes (`builtForm` 5 members; `councilTaxBand` A–I; `currentEnergyRating`
A–G; `centralHeatingFuelType` ~6 members) all fit ODR-0011 §8a's
**Quale-in-Region** UFO category (Masolo et al. 2003 D18 §4.3 — DOLCE
Quality Region). The data-dictionary entries confirm this is the right
category (e.g. `councilTaxBand`: "Band I relates to Wales only" — a
Quale-in-a-metric-region, not a free string). ODR-0011 §8a's per-scheme
typed-output table already lists all four as Quale-in-Region. The
ODR-0008 datatype property carries `sh:in` over the scheme members at
the overlay layer (per ODR-0010 §Rules item 2 — merged `sh:in`), keeping the
class-graph open-world (ODR-0004 §3a) and the closed-world constraint in
shapes.

**Hendler.** Concur — and the SKOS scheme **earns its keep** by the
consumer query `find all properties in council-tax band C with EPC rating
≥ C`. That query joins on two SKOS concept URIs (one per scheme), not on
two free strings; the SKOS scheme delivers Linked Data Principle 4
("useful information") whereas the bare `xsd:string` enum delivers nothing
beyond pattern-match. The Cagle SHACL `sh:in` invariant (ODR-0011 §1a +
§7a's notation typing table — closed lexical-form-constrained: `xsd:string` +
`sh:pattern "^[A-G]$"` + `sh:in` on concept URI) is the operational
realisation. Custom datatypes (`opda:EPCBandLiteral` etc.) are NOT minted
per ODR-0011 §7a's Cagle default.

**Joint vote: FOR SKOS scheme per ODR-0011 — uniform across the four named
category-likes and any sibling category enum. Datatype-property-with-enum
explicitly rejected as the Q5 anti-pattern (it loses the URI, the label,
the definition, the cross-scheme `skos:exactMatch` capacity).**

---

## Q6 — Sub-property hierarchies (when does `opda:mainsWater` need parent `opda:utility`?)

**Allemang.** **Flat — until a named query forces lifting.** *Working
Ontologist* Ch. 9 (RDFS sub-property semantics): `rdfs:subPropertyOf` is
load-bearing only when a SPARQL query exploits the entailment (`?p :utility ?v`
returns mainsWater + electricity + drainage matches). For ODR-0008 this is
asking too early — the 935-leaf walk's mechanical output is flat by
construction (generator emits one `opda:DatatypeProperty` per leaf per
ODR-0004 §6a), and we lift to `opda:utility` parent **only** when a consumer
query needs it. The cost of lifting (more triples; more reasoning surface;
SHACL targeting must follow) is real; the benefit (one query span across
siblings) is not yet evidenced.

**Hendler.** Concur strictly. The S005 Allemang DA "consumer-side query
non-discovery trigger" is the right framework — 18 months of downstream
session evidence determines whether the parent property is needed. The
`find all utility connections of property X` query is the test; if it never
appears in consumer corpora, the parent property never ships. Linked Data
Principle 4 ("useful information") is not satisfied by structure consumers
don't query. Note that ODR-0011's `skos:broader`/`skos:narrower` already
covers genuine taxonomy needs (broadband `typeOfConnection` parent/child);
that's the SKOS-side answer to taxonomy questions that *do* have query
evidence. The `opda:` sub-property hierarchy is a different mechanism (RDFS
entailment), not a substitute.

**Joint vote: FOR flat — no `rdfs:subPropertyOf` hierarchy in ODR-0008's
deliverable TTL this round. Re-open trigger: named consumer query
exercising sibling-span entailment.**

---

## Q7 — Overlay-form variation — handoff boundary to ODR-0010

**Allemang.** **Confirm the handoff.** The stub §Rules.Cross-context
reconciliation already states this — "per-form `sh:minCount`/`sh:in`
variation for reconciled spanning properties" lives in the overlay profiles
(ODR-0010). ODR-0008 declares the property once on the Property/Title class;
ODR-0010 §Rules item 1-2 (Knublauch's canonical mapping) does the rest
(`required` → `sh:minCount 1`; `enum` → merged `sh:in`). The class graph
stays fixed and open-world per ODR-0004 §3a; the closed-world per-form
constraints are profile-layer concerns. This is exactly the cut FIBO
maintains (single TBox + jurisdiction-specific SHACL profiles); the
precedent is well-published (FIBO LCC + jurisdiction modules; Bennett 2013;
SHACL Recommendation §1.4 use-case 2).

**Hendler.** Concur — and underline the load-bearing reciprocal. ODR-0010
§Three-rule interface contract with ODR-0013 already specifies the
`sh:in` semantics (merged at build time, NOT entailment) and `sh:Violation`
floor; ODR-0008 inherits these via the spanning-leaf reconciliation. The
no-identity-override gate (ODR-0010 §Rules.No-identity-override) protects
the ODR-0005 keys — a profile cannot redeclare `opda:uprn` as variant or
remove `dash:uniqueValueForClass`. The Scope-Check 1 termination signal is
satisfied: a consumer reads ODR-0008 (class + property declarations) +
ODR-0010 (profile shapes) + ODR-0011 (SKOS scheme members) = three ODRs to
assemble the validation shape.

**Joint vote: FOR confirming the handoff. ODR-0008 declares datatype
properties once; per-form `sh:minCount`/`sh:in` variation is ODR-0010
territory. No SHACL property shapes in ODR-0008's deliverable TTL.**

---

## Summary tally

| Q | Subject | Allemang | Hendler | Vote |
|---|---|---|---|---|
| 1 | Spanning-leaf threshold N | N=2 + dict-text discipline | N=2 + named-query qualifier | **FOR N=2** |
| 2 | Sub-module split | Monolithic this session | Concur + split-trigger | **FOR monolithic** |
| 3 | `dct:source` grain | Per-property + per-overlay-occurrence | Concur (one triple-pattern query) | **FOR per-property** |
| 4 | Granularity floor | Default structured datatype | Default class on lifecycle-query | **FOR Allemang default + Hendler discriminator** |
| 5 | Datatype-vs-SKOS | SKOS per ODR-0011 | Concur + earn-keep query | **FOR SKOS** |
| 6 | Sub-property hierarchies | Flat unless query forces | Concur strictly | **FOR flat** |
| 7 | Overlay handoff to ODR-0010 | Confirm | Concur + 3-ODR reads | **FOR handoff** |

**Pair direction.** All seven votes FOR ratifying the stub's existing
discipline with operationalisation. ODR-0008 stays `status: proposed`
per the inherited ODR-0004 namespace block AND the S005 cardinality
deferral; this session's contribution is **discipline ratification**, not
the mechanical 935-leaf walk (which is generator-emission-time work
downstream of S006/S007/S009 ratifying the attaching classes).

**Re-open triggers recorded.**

- Q2 split-trigger: TTL >1,000 terms in active dereference OR named
  consumer-query asymmetry across two families.
- Q4 graduation-trigger: new intermediate class admitted when a named
  consumer queries the object-leaf's lifecycle (PROV-O footprint).
- Q6 sub-property-trigger: `rdfs:subPropertyOf` admitted only when a
  named consumer query exercises sibling-span entailment.

**Sources.** Allemang & Hendler 2020 *Semantic Web for the Working
Ontologist* (3rd ed.) Ch. 6 (generator-first), Ch. 8 (class-vs-value),
Ch. 9 (sub-property entailment), Ch. 14 (FIBO modular merge); Antoniou,
Groth, van Harmelen & Hoekstra 2012 *Semantic Web Primer* (2nd ed.) Ch. 5
(Linked Data Principles); Berners-Lee 2006 *Linked Data — Design Issues*
(Principles 1 & 4); Masolo et al. 2003 *WonderWeb D18* §4.3 (DOLCE
Quality Region — Quale-in-Region); Knublauch & Kontokostas eds. 2017
*SHACL Recommendation* §1.4 use-case 2 (profile-per-jurisdiction); FIBO
LCC + jurisdiction modules as precedent. Internal: ODR-0004 §6a
(generator-first) + §3a (graph separation) + §7a (term-sourcing
precedence); ODR-0005 §2a (3-class commitment); ODR-0010 §Rules
(profile mechanism); ODR-0011 §8a (UFO category framework, Quale-in-Region);
data-dictionary §Cross-context table (1,557 leaves; 935 annotated;
389 in ≥3 schemas; 754 in only one schema).
