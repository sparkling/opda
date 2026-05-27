# Cagle (DA) — Position on S008

*Kurt Cagle, *The Ontologist* — SHACL practitioner, taxonomy design, AI-RDF integration. Devil's Advocate for Session 008 (ODR-0008 Property Descriptive Attributes, `kind: pattern`, A9 per-kind discipline applies). Per ODR-0001 §Roles: attack first; withdraw, hold, or concede explicitly per question; silent DA alignment is a methodology violation.*

## DA stance summary

ODR-0008 is the largest leaf-volume ODR in the programme: 935 annotated leaves (of 1,557 unique in the base; 8,458 path entries across overlays), the bulk of PDTF v3's descriptive mass. The stub's "declare-once-reconcile-overlays" cure is *directionally correct* — the `propertyPack` blank-node defect must go — but it asks the Council to ratify a discipline whose **per-leaf deliberation cost is not bounded**. The cross-context table the stub leans on already names spanning-leaf counts (×18 / ×9 / ×9–10); the stub does not name a threshold for what *triggers* deliberation versus what gets mechanically generated. A 935-leaf reconciliation backlog where every leaf is *potentially* deliberative is operationally a six-month freeze of the property module.

My attack throughout is the same operational angle I brought to S002, S005, and S011: **what is the check that fires when the discipline fails, and what consumer query needs the discipline?** A reconciliation rule that no SHACL shape verifies and no consumer query exercises is, in *Working Ontologist* 3rd ed. Ch. 13 vocabulary, "an ontology that validates beautifully and serves no query." Allemang's DA pattern from S005 generalises: distinctions earn their keep when a SHACL shape would treat the two cases differently. ODR-0008's reconciliation discipline has to earn its keep leaf-by-leaf, not in bulk.

I expect to concede on the broad strokes (flatten `propertyPack`; spanning leaves collapse to one ontology property; per-form variation lives in ODR-0010 profile shapes) — these were settled at S001 Q3 and ODR-0005 §6a precedent confirms the SHACL-AF discipline. The questions where I push hardest: Q1 (spanning-leaf threshold N), Q3 (per-leaf `dct:source` grain), Q5 (Datatype-vs-SKOS line), Q6 (sub-property hierarchies). The questions where I broadly concur but flag operational hazards: Q2 (sub-module split), Q4 (granularity floor), Q7 (overlay handoff to ODR-0010).

## Q1 — Spanning-leaf threshold N — PRIMARY ATTACK

**Attack.** The stub names spanning counts (`propertyPack` ×18; `energyEfficiency`/`heating`/`typeOfConstruction`/`listingAndConservation` ×9; utilities ×9–10) but does NOT fix a threshold N. The session question asks "what is N?" — and *any N is arbitrary*. N=2 over-reconciles (every leaf that happens to co-occur in two overlays gets deliberation cost it does not need); N=9 under-reconciles (leaves that span 3–8 overlays drift into per-form synonymy without anyone noticing). The "spanning-count threshold" frame is the wrong frame.

**The right cut is consumer-query driven, not count-driven.** A leaf needs reconciliation iff a named consumer query joins across the overlays it spans. Two leaves with identical names in two overlays that NO consumer query joins are NOT spanning leaves for ontology purposes — they are coincidentally-named per-form properties whose reconciliation is decoration. Conversely, two leaves with *different names* in two overlays that a consumer query DOES join (the cross-context table's hidden synonymy) ARE spanning leaves regardless of count.

**Counter-proposal: declare-on-consumer-demand with mechanical default.** Mechanical default per Allemang's "generator-first" rule (S001 Q1): every annotated leaf collapses to one `opda:` datatype property keyed by the leaf-name + JSON-Schema type signature. Reconciliation deliberation fires ONLY when (a) two distinct leaf names with different signatures are claimed by a named consumer query as the same ontology property (the genuinely-ambiguous synonymy case the stub names); OR (b) a named consumer query produces a wrong answer-set under the mechanical default. Threshold N is replaced by a **deliberation trigger list** maintained as the module accretes consumer queries.

**Operational check demanded.** ODR-0008's `## Rules` MUST replace "spanning leaf above threshold N reconciles to one property" with: "(i) mechanical generation: every annotated leaf emits one `opda:` datatype property per leaf-name + signature; (ii) deliberation trigger: a named consumer query joining two distinct leaf surfaces, OR a query producing a wrong answer-set under (i); (iii) deliberation outcome recorded in a per-leaf reconciliation register with the query that triggered it." Without the register, "spanning leaf above threshold N" becomes honour-system reconciliation that drifts.

**Withdrawal condition.** WITHDRAW IF the panel adopts mechanical-default + consumer-query-trigger + reconciliation-register (or equivalent operational substitute that defers per-leaf deliberation cost until a query needs it). PARTIAL WITHDRAW if N is set with an explicit consumer-query-trigger override (e.g. "N=9 default; trigger override for ≥3 overlays where any named consumer query joins"). HELD-AS-LIVE if Q1 lands with a fixed N alone — that locks in 935 deliberations, most of which no consumer query will exercise.

## Q2 — Sub-module split

**Attack (lighter).** My S008 Scope-Check candidate was **leaf-vs-structured-value split** along the line where leaves become Kinds: Survey, EPC, Search Report all carry PROV-O `prov:wasDerivedFrom` chains (authority retrieval, regulator-issued, time-stamped), and treating them as datatype property bags loses the chain. The stub flags this in `## Rules > Generated, then deliberated` ("which `object`-typed leaves become intermediate classes — Building, Room, Survey, Search") but punts the cardinality call to drafting.

That punt is acceptable for the simple cases (Building, Room are clearly structured values with no provenance need). It is NOT acceptable for the **authority-retrieval cases**: Survey, EPC, Search Report, Title Plan. Each is a regulator-issued or professional-issued artefact with a `prov:Agent` (the surveyor, the EPC assessor, the search-provider, the HMLR), a `prov:Activity` (the inspection or query), and a temporal extent. Treating these as flat datatype bags forces ODR-0009's PROV-O backbone to either (a) re-discover the structure later, OR (b) attach provenance to the *property's leaf-set as a whole*, which loses the artefact-instance identity.

**Spawn-trigger candidate.** ODR-0008 SHOULD spawn a sub-module ODR-0008a (suggested: "Authority-Retrieved Artefacts") iff Sessions 008 or 009 surface that any of {Survey, EPC, Search Report, Title Plan} cannot be modelled as a single `opda:` datatype property bag without losing (a) the artefact's `prov:wasGeneratedBy` chain, OR (b) the artefact's regulator-issued versioning (EPC re-issue, search-report refresh, survey supersession). The trigger fires per ODR-0001 A9 §Artefact identity test.

**Engagement with stub.** The stub's `## Open questions` line — "whether to split into sub-module ODRs (built-form / energy / searches / encumbrances) once volume is understood" — is the right placeholder. My push: don't defer the trigger; name it.

**Withdrawal condition.** WITHDRAW IF ODR-0008's `## Consequences` names the authority-retrieval spawn-trigger explicitly (Survey / EPC / Search Report / Title Plan with provenance-loss criterion). PRIMARY VIGILANCE otherwise: I'll watch S009 and the BASPI5 vertical slice for the spawn signal; if S009 cannot attach PROV-O to a flat EPC bag, the spawn fires.

## Q3 — Data dictionary citation grain

**Attack.** Per-leaf `dct:source` for 935 leaves is verbose, and the verbosity is operationally expensive: every generator emission carries a per-leaf URI; every `odr-review` lint pass dereferences 935 entries; every Turtle file is fatter than it needs to be. The stub commits to per-leaf citation in `## Rules > Sourcing convention` ("each descriptive `opda:` datatype property is sourced from a data-dictionary leaf, carries `dct:source` to its canonical schema leaf path").

That commitment is right *for the per-leaf cases the BASPI round-trip exercises*. It is over-engineering for the regular cases where a section of the data dictionary (e.g. "Energy / EPC" section with 18 leaves clustered under `energyEfficiency`) maps 1:1 to a contiguous block of ontology properties. A **section-level `dct:source` with leaf-anchors** is the operational compromise: the SKOS-style scope-note pattern, citing the section once with `#leaf-name` anchors for the specific leaves.

**Operational check.** Three-part discipline:

1. **Section-level default.** Where ≥N (suggest N=3) leaves from one data-dictionary section map to a contiguous block of ontology properties, the block carries one section-level `dct:source` to the section header with leaf-anchors recorded in `rdfs:isDefinedBy` (or equivalent per-property anchor predicate).
2. **Per-leaf override.** Where a leaf is genuinely cross-cutting (the spanning-leaf cases from Q1's register) OR a leaf's `dct:source` cites a *different* upstream source from its section's default, per-leaf `dct:source` overrides.
3. **Round-trip equivalence.** Section-level + leaf-anchor MUST be equivalent to per-leaf `dct:source` under SPARQL: `SELECT ?leaf ?src WHERE { ?leaf dct:source ?src } UNION { ?leaf rdfs:isDefinedBy ?anchor . ?anchor <leaf-of> ?section . ?section dct:source ?src }` returns the same `(leaf, src)` pairs as the per-leaf form.

If round-trip equivalence holds, the citation grain is operational engineering, not ontological commitment. The stub framing locks in per-leaf without considering the round-trip equivalence test.

**Engagement.** Allemang as Queen will likely default to per-leaf because it is the lowest-cognition form for a maintainer reading one leaf. My counter: maintainers read sections, not leaves, when onboarding; section-level is the right cognitive grain for the 935-leaf onboarding cost.

**Withdrawal condition.** WITHDRAW IF the panel adopts section-level-with-leaf-anchor as the default for clustered sections (the BASPI5 + TA6 sections most amenable) AND per-leaf override for cross-cutting spanning leaves AND round-trip-equivalence SPARQL test in `## Enforcement`. HOLD IF per-leaf is locked in without the section-level option — that is verbose engineering, not principled commitment.

## Q4 — Granularity floor (Datatype property vs structured value)

**Attack (lighter — broad concur).** The stub's framing — "structured value (e.g. an `Address` instance) vs stay as a datatype property" — is the right question. My AI-integration lens: a structured value with PROV-O `wasDerivedFrom` chains earns its keep when LLM consumers query for the *artefact's provenance* alongside the artefact's value. The threshold for class-promotion is the **provenance-query test**: would a consumer query of the form "what is the X *and* who derived it *and* when?" return useful triples under a flat datatype property?

For **Surveys**: the answer is yes-with-class-promotion. A `opda:Survey` instance carries `prov:wasGeneratedBy` (the inspection event), `prov:wasAttributedTo` (the surveyor), `dct:issued` (the survey date), and the survey's claims (defects, recommendations, condition rating). Flat datatype properties lose all this; consumers see only the leaf values without the lineage.

For **EPC**: similar. `opda:EPCRecord` with `prov:wasGeneratedBy` (the assessment), `prov:wasAttributedTo` (the assessor), `dct:source` (the EPC Register URI), `dct:issued` (the lodge date). Plus succession: EPC re-issue on extension or recommendation-implementation needs the §6a SHACL-AF pattern (this is the fifth citing site I anticipated in ODR-0017 §Consequences — the spawn rule does not re-fire, but the pattern re-instantiates).

For **single-value descriptive leaves** (built-form code, EPC band, council-tax band, room count, bedroom count): the answer is no-class-promotion. These are Quale-in-Region values per ODR-0011 §8a; a SKOS notation on the Property is sufficient.

**Threshold for class-promotion.** A leaf or leaf-cluster promotes to a Kind iff (a) it carries authority-retrieved provenance the consumer queries for, OR (b) it has its own temporal lifecycle (issued, superseded, re-issued, withdrawn), OR (c) it bears a distinct PII regime per ODR-0012 (Surveys carry surveyor-PII + survey-subject-PII distinct from the Property's PII; EPCs carry assessor-PII distinct from EPC-Register-published-PII).

**Operational check.** The promotion call is per-leaf-cluster, NOT per-leaf. The cluster-criterion is named (provenance OR lifecycle OR PII-regime distinct).

**Engagement.** This concurs with Allemang's S005 DA discipline ("a distinction earns its keep when a SHACL shape would treat the two cases differently") — Survey and EPC trigger different SHACL shapes than flat datatype property bags would.

**Withdrawal condition.** WITHDRAW IF the panel adopts the three-criterion class-promotion test (provenance OR lifecycle OR PII-regime) AND names the candidate promotions (Survey, EPC, Search Report, Title Plan) explicitly in `## Rules` or `## Consequences`. CONCEDED if the panel makes the per-cluster call mechanically (with the criterion) and I don't need to attack further.

## Q5 — Datatype vs SKOS (per-attribute application of ODR-0011 §8a)

**Attack.** ODR-0011's seven-category UFO framework gives Quale-in-Region as the right SKOS category for the descriptive enums (`builtForm`, `councilTaxBand`, `currentEnergyRating`, `centralHeatingFuelType`). My S011 Q7 position was: `xsd:string` + `sh:pattern` + `sh:in` on concept URI is the operational discipline for closed schemes; custom datatypes are over-engineering. That position propagates here.

But: **every category-like attribute promoted to SKOS adds query indirection** — a SPARQL consumer asking "find all properties with built-form Detached" must traverse `?p opda:builtForm/skos:notation "Detached"` instead of `?p opda:builtForm "Detached"`. The indirection is cheap per query but accumulates over 935 leaves. Some category-like attributes are **one-shot enums with no cross-vocab mapping potential** — they will never carry `skos:exactMatch` to an external register, will never need scope-notes, will never deprecate. For those, the SKOS layer is decorative.

**Where's the line.** A category-like attribute promotes to SKOS iff (a) it appears in ODR-0011 §8a's named seven categories with substantive `dct:source` to UFO/DOLCE (Quale-in-Region, Role label, Phase label, Method/plan code), OR (b) it has cross-vocab mapping potential (external register exists, e.g. council-tax bands governed by VOA), OR (c) it is regulator-governed and the verbatim-citation discipline per ODR-0011 §4a applies. For everything else — one-shot internal enums, transient lifecycle codes, form-ergonomics flags — `owl:DatatypeProperty` with `sh:in` over `xsd:string` literals is sufficient.

**Per-attribute application.** ODR-0008's `## Rules` MUST defer to ODR-0011 §8a for the named categories AND explicitly NOT promote one-shot enums to SKOS. The discipline: every `xsd:string` enum is presumed `sh:in`-constrained unless ODR-0011 §8a names it; the burden of SKOS promotion is on the proposer (per leaf), not the burden of staying-as-datatype on the resister.

**Concrete candidates for stay-as-datatype:**

- `yesNoNotKnown` (and the dozens of leaves carrying it as enum) — three values, no cross-vocab, no lifecycle. `sh:in ("Yes" "No" "Not known")`.
- `priceQualifier` (`Asking price`, `Offers in excess of`, `Offers in region of`, `Fixed price`) — closed, no external register, no UFO category (it's not a Quale; it's a marketing-state flag).
- `mediaType` per-leaf one-shot (where it appears as a form-ergonomic flag, not the registered IANA media-type register). ODR-0011 §5a deprecation lifecycle is over-engineering for a four-value flag.

**Engagement.** Allemang's S005 "distinctions that earn their keep" applies again: an enum's SKOS-promotion earns its keep when a SHACL shape, SPARQL query, or downstream consumer treats SKOS-membership differently from `sh:in`-membership. For one-shot enums, no consumer does.

**Withdrawal condition.** WITHDRAW IF the panel adopts (a) ODR-0011 §8a as the SKOS-promotion criterion AND (b) explicit stay-as-datatype default for non-§8a enums AND (c) per-leaf SKOS-promotion proposal discipline (burden on the proposer). HOLD IF Q5 lands with "everything category-like is SKOS" — that adds query indirection for the 70%+ of enums that are one-shot internal flags.

## Q6 — Sub-property hierarchies

**Attack.** The stub poses this as "when does `opda:mainsWater` need a parent `opda:utility`?" My answer: **defer until a named consumer query requires parent-level reasoning**. Sub-property hierarchies (`rdfs:subPropertyOf` chains) multiply query paths — a SPARQL consumer asking for "all utilities of this property" under a hierarchical model must either (a) entail the parent via reasoning (which not every SPARQL endpoint runs), OR (b) UNION over all known children. Both forms confuse SPARQL authors, and (a) introduces reasoner-dependence that breaks the no-`owl:sameAs`-equivalent-propagation discipline ODR-0005 Rule 5 established.

Flat is better at this scale. The 935-leaf reconciliation is already a high-cognition surface; adding 50+ parent-property abstractions ("utility", "lifestyle-amenity", "construction-feature") creates an additional 50+ deliberations and 50+ query paths consumers must navigate.

**The legitimate case for hierarchy.** Sub-property hierarchies earn their keep ONLY when a named consumer query asks for the parent-level reasoning — e.g. a SPARQL query of the form "find properties with any utility issue" where "utility issue" is a hierarchy ancestor over `mainsWater`, `electricity`, `drainage`, etc. If such a query is named AND its consumer cites the parent-level reasoning, the hierarchy fires for that branch. If no such query exists, the branch stays flat.

**Operational check.** Three-part discipline:

1. **Flat default.** Every descriptive datatype property is `owl:DatatypeProperty` with no `rdfs:subPropertyOf`.
2. **Hierarchy trigger.** A named consumer query asking for parent-level entailment, with the query text reviewable in the proposing session's synthesis.
3. **Reasoner-independence test.** The hierarchy MUST produce the same answer-set under (a) entailment-on (reasoner runs) and (b) entailment-off (consumer UNIONs over named children). If they differ, the hierarchy is decorative under (b) — and most SPARQL consumers run (b).

**Engagement.** This concurs with my S005 anti-`owl:sameAs` framing: reasoner-dependent constructs that propagate irreversibly under inference are inadmissible without consumer evidence. Sub-property hierarchies are the same pattern, weaker form.

**Withdrawal condition.** WITHDRAW IF the panel adopts flat-default + named-consumer-query trigger + reasoner-independence test. HELD-AS-LIVE if Q6 lands with "hierarchies authored at drafting discretion" — that is honour-system hierarchy authoring that produces 50+ parent-properties no consumer queries.

## Q7 — Overlay-form variation (handoff boundary to ODR-0010)

**Attack (vigilance — concur on substance, push on boundary).** My S001 Q5 `aiHint` exile won 7-2 on the three-graph separation principle: shapes graph holds SHACL constraints; annotation graph holds advisory LLM-consumer terms; never mix. ODR-0008's handoff to ODR-0010 must respect the same separation — and the handoff is currently underspecified.

**What's clean.** The stub says: "per-form required/enum variation is expressed as SHACL property shapes in the overlay profiles (ODR-0010), not as duplicate datatype properties." Correct. Per-form `sh:minCount`/`sh:in` variation lives in ODR-0010's profile shapes graph; the base TBox in ODR-0008 carries one `opda:` datatype property per spanning leaf with no per-form modifier.

**What's not yet clean.** Three boundary cases the handoff must explicitly resolve:

1. **Cardinality conflicts.** If BASPI5 requires `opda:builtForm` and TA6 makes it optional, ODR-0010's profile shapes carry `sh:minCount 1` for the BASPI5 profile and not for TA6. Fine. But: the BASE TBox must NOT carry `sh:minCount` — that would mean every consumer must populate it regardless of overlay. The stub doesn't say this explicitly. ODR-0008's `## Rules > Sourcing convention` MUST add: "Base TBox cardinality is `0..*` for every descriptive property; per-form `sh:minCount` lives in ODR-0010 profile shapes."

2. **Enum union vs per-form `sh:in`.** Spanning leaves whose enum set differs across overlays (BASPI5's `builtForm` vs TA6's `builtForm`) — the BASE TBox carries the SKOS scheme from ODR-0011 with the union of all overlay members; per-form `sh:in` restriction lives in ODR-0010. Cagle's three-rule interface contract (Scope-Check 1 A6, also cited in ODR-0010 Q8): `sh:in` semantics merged at build-time, applied to closed schemes. ODR-0008 MUST cite this contract; ODR-0010 enforces it.

3. **Advisory annotations.** If a descriptive leaf carries form-ergonomic guidance (e.g. "show this field only when builtForm = 'Detached'" — typical form-overlay UX hint), that guidance lives in the annotation graph (per my S001 Q5 win), NOT in either ODR-0008's TBox or ODR-0010's profile shapes. ODR-0008's `## Consequences` should explicitly route this to the annotation graph.

**Operational check.** The handoff is verified by three SHACL CI tests:

1. **Base-cardinality test.** `ASK { ?p a opda:DescriptiveProperty . ?p sh:minCount ?n . FILTER (?n > 0) }` returns FALSE in the base TBox (`opda-shapes.ttl` minus profile shapes).
2. **Profile-`sh:in`-merge test.** For each spanning leaf, the union of per-profile `sh:in` members equals the SKOS scheme's `skos:Concept` set.
3. **Annotation-graph isolation test.** `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns FALSE (per ODR-0004 §3a; re-affirms my S001 Q5 win).

**Engagement.** Knublauch in ODR-0010 will likely concur; he authored the three-graph discipline. The vigilance is that ODR-0008 ratifies the boundary explicitly so a future drafter cannot drift cardinality or `sh:in` into the base TBox.

**Withdrawal condition.** WITHDRAW IF ODR-0008's `## Rules` adds the three boundary clauses (base 0..* cardinality; SKOS-union for enums; advisory annotations to annotation graph) AND `## Enforcement` adds the three SHACL CI tests above. PRIMARY VIGILANCE: I will not vote against ODR-0008 on Q7 even if the explicit clauses are deferred to ODR-0010's session — but I will RE-OPEN at S010 if the boundary leaks.

## Withdrawal summary (per ODR-0001 §DA explicit withdraw-or-hold)

| Q | Position | Withdrawal status | Trigger / condition |
|---|---|---|---|
| Q1 | PRIMARY ATTACK | HELD-AS-LIVE | Re-open: any fixed N without consumer-query-trigger override AND without reconciliation-register. Mechanical default + register satisfies withdrawal |
| Q2 | LIGHT ATTACK | PRIMARY VIGILANCE | Vigilance on S009 + BASPI5 vertical slice; spawn-trigger named for Survey/EPC/Search/Title-Plan provenance loss |
| Q3 | ATTACK | HELD-AS-LIVE | Re-open: per-leaf locked-in without section-level-with-leaf-anchor option + round-trip-equivalence SPARQL test |
| Q4 | LIGHT ATTACK | CONCEDED (if 3-criterion test adopted) | Withdraws on three-criterion class-promotion test (provenance OR lifecycle OR PII-regime) with candidates named |
| Q5 | ATTACK | HELD-AS-LIVE | Re-open: "everything category-like is SKOS" without §8a-gate + stay-as-datatype default for non-§8a enums |
| Q6 | ATTACK | HELD-AS-LIVE | Re-open: hierarchy authoring at drafting discretion without named-consumer-query trigger + reasoner-independence test |
| Q7 | VIGILANCE | PRIMARY VIGILANCE | Vigilance commitment; re-open at S010 if three-boundary-clause handoff leaks; not a vote against ODR-0008 |

## Cross-references

- **ODR-0001** §A9 Per-kind discipline + §DA explicit withdraw-or-hold — methodology gate for this position.
- **ODR-0005** §6a SHACL-AF pattern — the precedent my Q4 EPC-succession case re-instantiates as a fifth citing site (no spawn re-fire; ODR-0017 covers it).
- **ODR-0010** §No-identity-override + my Scope-Check 1 A6 three-rule interface contract — load-bearing for Q7's handoff boundary.
- **ODR-0011** §8a seven-category UFO framework + §4a verbatim regulator citation + §5a deprecation lifecycle — Q5's stay-as-datatype default depends on §8a's bounded category set.
- **ODR-0017** SHACL-AF non-blocking quality rules — Q4's Survey/EPC succession re-instantiates the pattern.
- **Hellmann et al. 2017** DBpedia release notes — LLM-fallback failure mode; cited throughout my SHACL-AF rule discipline (Q1 reconciliation register, Q6 sub-property hierarchy reasoner-independence test).
- **Working Ontologist 3rd ed.** Ch. 7 (Identity and Identifiers) + Ch. 13 (Linked Data in the Real World) — "distinctions that earn their keep" + "an ontology that validates beautifully and serves no query" framings used across Q1/Q4/Q5/Q6.
- **SHACL Recommendation** §4 (Core); SHACL-AF (`sh:rule`/`sh:sparql`); DASH (`dash:uniqueValueForClass`) — operational substrate for every withdrawal-condition check above.
