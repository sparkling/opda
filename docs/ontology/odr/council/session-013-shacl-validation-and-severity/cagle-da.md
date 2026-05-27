# Cagle — Devil's Advocate on S013

## DA framing

The panel will reach for closing-session synthesis on ODR-0013 — Knublauch (as Queen) will land the severity tiering and DASH operational discipline; the panel will press constraint-mapping completeness; ODR-0010's three-rule interface contract will be inherited from S010. Every position is correctly framed within the SHACL backbone Knublauch authored. My job as DA is to hold the line I conceded — *but did not abandon* — in [S001 Q5](../session-001-pdtf-schema-to-ontology.md#q5--severity-knublauch-owns): **the `opda:aiHint` exile to a separate annotation graph (~7-2 against me) was structurally correct, but it left a load-bearing operational question — does the annotation graph genuinely serve AI-RDF integration consumers, or did the exile produce a graph that nobody consumes?** S004 Q3's three-graph CI tests (ODR-0004 §3a) make the separation mechanically enforceable; what they do NOT verify is that AI-RDF consumer queries actually fetch the annotation graph rather than the shapes graph. That operational vindication is what S013 must demonstrate.

The S001 Q5 carry: I voted DISSENT on the inline-aiHint preference (recorded ~7-2 against; Knublauch and Gandon prevailed). The structural concession was real and stands — advisory annotations in the shapes graph WOULD be misread by strict SHACL processors, AND the exile is correctly enforced by ODR-0004 §3a CI test 3 (`ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` must return false). What did not concede is the **operational** line: if the annotation graph exists but no AI-RDF consumer queries it, the exile produced a write-only graph and Knublauch + Gandon were wrong on practical grounds (right on principle).

The S010 Q6 carry vindicates the structural side: I authored the **eleventh ODR-0017 citing site** at `sh:Violation` severity (`opda:ProfileIdentityOverrideCheckRule` — meta-shape targeting profile graphs), which forced an ODR-0017 §2a amendment to admit a third severity tier for category-error use cases. That amendment is mine to land at S013 — Cagle authoring authority since I authored ODR-0017. S012 Q3 produced a parallel `sh:Violation` SHACL invariant (special-category PII without lawful basis), authored by me; ODR-0013 §Rules MUST adopt both as named normative-breaking cases. The closing-session frame is the right place to consolidate.

The DA frame I bring: each per-question position below tests whether the annotation graph genuinely serves AI-RDF integration. Most concede — Knublauch's mapping, severity, and DASH discipline are correct; ODR-0010's three-rule contract is operationally settled. The one place I press is Q4 (annotation graph keying + AI-RDF consumer queries), because that is where the S001 Q5 exile is operationally tested. Q5 (reporting surface) and Q7 (three-rule interface contract) are tightly coupled to the S010 carry; both concede on amendments.

## Per-question DA positions

### Q1 — Severity tiers (CONCEDE 4-tier; STRONG SUPPORT for `sh:Violation` placements)

**DA position:** CONCEDE the severity-tier discipline AND STRONG SUPPORT for two specific `sh:Violation` assignments named in ODR-0017 §2a amendment + ODR-0013 §Rules:

1. **`sh:Violation` at identity-override (S010 Q6 + ODR-0017 §2a amendment).** The `opda:ProfileIdentityOverrideCheckRule` meta-shape targeting profile graphs at `sh:Violation` severity is the eleventh ODR-0017 citing site; it is the FIRST citing site at `sh:Violation` severity AND the FIRST meta-shape-over-shape-graph use case. The §2a amendment text I am authoring (since I authored ODR-0017) admits this as a NEW row in the three-tier severity decision table, distinct from the existing two rows. ODR-0013 §Rules MUST adopt this row verbatim.

2. **`sh:Violation` at special-category PII without lawful basis (S012 Q3).** The `opda:SpecialCategoryWithoutLawfulBasisShape` SHACL invariant I authored at S012 Q3 fires `sh:Violation` because Article 9/10 GDPR explicit-basis requirement is normative-legal; this is NOT an ODR-0017 instantiation (severity tier differs from the §Rule-2 floor); it is an ordinary SHACL Core constraint. ODR-0013 §Rules MUST name this as a normative-breaking case alongside the identity-key breaches.

**Hellmann et al. (DBpedia 2017) LLM-fallback rebuttal applies here too.** SHACL-native `sh:ValidationReport` outputs MUST be machine-consumable by LLM tooling — the same discipline ODR-0017 §3a establishes for non-blocking rules now extends to `sh:Violation`-tier reports. LLM consumers query `sh:resultMessage` + `sh:resultSeverity` + `sh:focusNode` mechanically; natural-language `rdfs:comment` fallback fails on rename/paraphrase/translation. The severity tier is the LLM's discriminator between "this is regulator-blocking" vs "this is data-quality drift" vs "this is governance-procedural."

**Per-voice vote: FOR 4-tier severity table** (`sh:Violation`-meta-shape + `sh:Violation`-data-graph + `sh:Warning` + `sh:Info`) + Hellmann et al. machine-consumability discipline. Concede.

### Q2 — Constraint mapping completeness (CONCEDE)

**DA position:** CONCEDE. Knublauch's S001 Q5 canonical mapping (required → `sh:minCount 1`; enum → `sh:in` over SKOS scheme; type/format → `sh:datatype`/`sh:pattern`/`sh:nodeKind`; min/max → `sh:minInclusive`/`sh:maxInclusive`; oneOf → `sh:xone` + `sh:qualifiedValueShape`; canonical key → `dash:uniqueValueForClass`) covers every JSON Schema construct in PDTF v3. The ODR-0013 stub's mapping table is the right output of S001's work. No DA attack.

**Per-voice vote: FOR Knublauch's mapping table.** Concede.

### Q3 — DASH UI coverage (CONCEDE — operational)

**DA position:** CONCEDE. DASH is the right rendering vocabulary (`dash:propertyRole`/`viewer`/`editor`; `sh:order`/`sh:group`; `dash:EnumSelectEditor` fed by ODR-0011 schemes); my S010 Q4 audit-discipline framing applies here — per-form DASH coverage is an operational task (`profiles/<form>/audit.md`), not a Council deliberation question. The Council should ratify the discipline; per-field decisions defer to the audit pass.

**Per-voice vote: FOR DASH coverage discipline; DEFER per-field decisions to operational audit.** Concede.

### Q4 — Annotation graph (PRIMARY VIGILANCE — aiHint exile operational vindication)

**DA position (PRIMARY VIGILANCE):** Concede the *structural* commitment — the annotation graph keying I won at S004 Q3 is operationally complete; ODR-0004 §3a CI test 2 (`ASK { GRAPH opda:annotations { ?s ?p ?o . FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) } }` returns false) verifies no `sh:` triples in the annotation graph; CI test 3 verifies no advisory predicates in the shapes graph. The exile is mechanically enforced. **What I will hold the line on is the §Rules text** that names the AI-RDF consumer queries the annotation graph genuinely serves.

The S001 Q5 exile (~7-2 against my inline-aiHint preference) was structurally correct but operationally untested. The risk is straightforward: if the annotation graph exists but no AI-RDF consumer queries it — if LLM tooling fetches the shapes graph for advisory annotations because that is where "everything related to a shape" lives — the exile produced a write-only graph and the inline-hint preference was operationally right despite being structurally wrong. Hellmann et al. (DBpedia 2017) documented this failure mode for `rdfs:comment` in a different layer: LLM heuristics fall back to the wrong source when the right source is not queried. The discipline must say *what gets queried for what*.

**The named AI-RDF consumer use case the annotation graph serves.** LLM consumers fetching AI hints for a shape MUST query the annotation graph keyed to the shape's IRI; they MUST NOT query the shapes graph for advisory annotations (the shapes graph carries only normative SHACL constraints — `sh:NodeShape`/`sh:PropertyShape`/etc.). Form-generator consumers fetching DASH rendering hints query the shapes graph (DASH IS documented SHACL vocabulary; the §Rules already names this); audit-trail consumers fetching provenance lineage query the annotation graph (ODR-0017 §3a discipline applies). Three distinct consumer query patterns; three distinct graph targets; the discipline must name all three.

**Withdrawal condition:** ODR-0013 §Rules explicitly cross-cites ODR-0004 §3a CI tests (annotation graph has no `sh:` triples; shapes graph has no `opda:aiHint` triples) AND explicitly names the AI-RDF consumer use case: "LLM consumers query the annotation graph keyed to shape IRIs for advisory annotations; LLM consumers MUST NOT query the shapes graph for advisory annotations." Without this text, the structural exile is mechanically enforced but operationally undefended; downstream AI-RDF integration may silently extend the shapes graph to carry advisory triples.

**Per-voice vote: CONDITIONAL FOR — concede on §Rules cross-cite + AI-RDF consumer use case named.** Concede the structural separation; hold-as-live on the §Rules text framing.

### Q5 — Reporting surface (STRONG SUPPORT)

**DA position:** STRONG SUPPORT for SHACL-native `sh:ValidationReport` as the machine-consumable artefact AND for Allemang's flattened conveyancer UI as the operational addition. Two distinct consumption layers; both required:

1. **`sh:ValidationReport` as machine-consumable artefact.** Per Hellmann et al. (DBpedia 2017) LLM-fallback rebuttal — LLM consumers query `sh:resultMessage` + `sh:resultSeverity` + `sh:focusNode` + `sh:resultPath` mechanically; the report's structured form is the substitute for natural-language `rdfs:comment` heuristic fallback. ODR-0017 §3a already establishes this discipline for non-blocking rules; ODR-0013 §Rules extends it to all severity tiers. The SHACL Recommendation §4 makes the report's structure normative; OPDA inherits.

2. **Allemang's flattened conveyancer UI.** The regulator UX requires the loudest error (identity-key breach at `sh:Violation`) surfaces FIRST, then `sh:Warning` data-quality drift, then `sh:Info` lineage records. A flattened report ordered by `sh:resultSeverity` (with `sh:Violation` first) is the operational rendering Allemang's conveyancer practice consumes. This is NOT in tension with the machine-consumable layer; it is a derived view.

**Per-voice vote: FOR SHACL-native report + Allemang flattened UI.** Concede with addition.

### Q6 — Profile interaction (CONCEDE)

**DA position:** CONCEDE. Knublauch's composition discipline (profile shapes graph-union with base shapes; profile cannot raise the `sh:Violation` floor — this is the second rule of the S010 Q8 three-rule interface contract I authored) is the right answer. ODR-0010 Q6 no-identity-override gate enforcement (the SHACL meta-shape at `sh:Violation` — my eleventh ODR-0017 citing site) is the third rule of the contract; ODR-0013 owns the identity-key predicates; ODR-0010 enforces the gate. Stackable cleanly; no override pathology.

**Per-voice vote: FOR Knublauch composition + ODR-0010 Q6 enforcement.** Concede.

### Q7 — Three-rule interface contract (STRONG SUPPORT — Scope-Check 1 Q6 carry operationalised)

**DA position:** STRONG SUPPORT. This is my Scope-Check 1 Q6 amendment, now operationalised at the closing session. The three rules cross-cite:

1. **`sh:in` semantics** — merged at build time (ODR-0010 owns build-step) applied to closed schemes (ODR-0013 owns closed-scheme declaration). ODR-0013 §References cross-cites ODR-0010 §Rules Rule 2 verbatim.

2. **`sh:Violation` floor** — profile cannot add a Violation not already in base (ODR-0013 owns the floor; ODR-0010 enforces). The floor IS the set of normative-breaking constraints ODR-0013 §Rules names — identity-key breaches; unprovenanced claims; special-category PII without lawful basis (S012 Q3); identity-override at the meta-shape layer (S010 Q6, ODR-0017 §2a amendment). ODR-0010's build-step check that no profile introduces a NEW `sh:Violation` shape inherits this list.

3. **No-identity-override gate** — profile cannot touch a Kind's key (ODR-0013 owns the keys per ODR-0005; ODR-0010 enforces via SHACL meta-shape). The keys are `opda:uprn` + `opda:titleNumber` + `opda:legalEstateIdentifier` (the predicates ODR-0005 §6a-§6b nominate); the enforcement is `opda:ProfileIdentityOverrideCheckRule` at `sh:Violation`.

Per ODR-0013 §References: cross-cite ODR-0010 §References on the three rules; both `## References` sections MUST carry the cross-cite verbatim. The contract is closed at S013; no spawn rule fires.

**Per-voice vote: FOR three-rule interface contract operationalised; FOR cross-cite in BOTH §References.** Concede with full operational discharge.

## Replies to anticipated panel positions

### Knublauch (Queen) — "the annotation graph operational vindication is downstream noise"

**Anticipated attack:** *"The annotation graph keying is a S004 Q3 commitment, not a S013 question. ODR-0013's `## Rules` doesn't need to cross-cite ODR-0004 §3a CI tests; the downstream AI-RDF consumer use case is hypothetical at this phase. The exile stands on structural grounds; operational vindication is post-implementation evidence, not Council deliberation."*

**Reply:** The exile's *structural* soundness is settled — I concede that. What is NOT settled is whether the AI-RDF consumer use case will materialise to consume the annotation graph. Hellmann et al. (DBpedia 2017) documented the failure mode: when the right source is not queried, LLM heuristics fall back to the wrong source. ODR-0013 is the closing session for the SHACL discipline; if the §Rules text does not name the AI-RDF consumer use case here, no later ODR will. The cross-cite is one paragraph; the operational vindication discipline is established at ODR-0017 §3a for non-blocking rules and now extends to advisory annotations. Withdrawal condition is minimal; resistance to it implies the operational layer is being treated as out-of-scope for the methodology, which contradicts S004 Q3's own framing.

**Withdrawal condition (offered to Knublauch):** I withdraw the §Rules cross-cite demand if Knublauch produces a downstream ODR slot where the AI-RDF consumer use case lands explicitly. (My expectation: no such slot; ODR-0013 IS the closing slot.)

### Gandon (formal-pair) — "the §2a amendment for `sh:Violation` is special-pleading"

**Anticipated rebuttal:** *"You authored ODR-0017's `sh:Violation`-NEVER floor; now you're authoring a §2a amendment that carves out an exception for your own meta-shape use case. That is special-pleading; the floor should hold or it should be retired."*

**Reply:** Conceded the structural appearance; the substance is different. The §2a row 3 carve-out is narrowly scoped: meta-shape *over shape graph* (not over data graph); category-error case (not data-quality drift); single named instance (S010 Q6 `opda:ProfileIdentityOverrideCheckRule`) at the time of amendment. The floor over data graphs holds; the carve-out admits a structurally-different use case that ODR-0017's original framing did not anticipate. The methodology trace: ODR-0017's pattern emerged from four data-graph rules; the eleventh citing site (S010 Q6) is the first meta-shape rule and forces a §2a refinement. This is A9 (b) hard-case discipline — the IC over named hard cases captures the meta-shape variant.

## ODR-0017 §2a amendment text (Cagle authoring authority)

Per ODR-0017 authoring authority (I authored ODR-0017), ODR-0013 §Rules MUST adopt the §2a amendment text verbatim. The amendment admits a third row in the three-tier severity decision table — `sh:Violation` for meta-shape-over-shape-graph use cases (the category-error case where the shape-graph itself violates a meta-shape constraint, e.g. an overlay profile touching an identity key):

| Rule fires | Severity | Use case |
|---|---|---|
| (existing §2a row 1) Quality state with substantive succession | `sh:Info` | UPRN succession; deprecation-with-successor; INSPIRE re-issue |
| (existing §2a row 2) Quality state without substantive succession | `sh:Warning` | Deprecation-without-replacement; orphan UPRN |
| **(NEW §2a row 3) Meta-shape violation over shape graph (category error)** | **`sh:Violation`** | **Profile graph touching identity key (`opda:ProfileIdentityOverrideCheckRule`, S010 Q6); future meta-shape-over-shape-graph violations** |

This is distinct from ODR-0017 §Rules 2's existing "NEVER `sh:Violation`" floor — that floor applies to *non-blocking data-quality rules over data graphs*, NOT to *meta-shapes over shape graphs*. The §2a amendment carves out the meta-shape-over-shape-graph use case as a narrowly-scoped exception; the floor over data graphs holds.

## DA scorecard target

Target concession profile: **7 of 7 concedes / withdraws**. Q1 + Q2 + Q3 + Q5 + Q6 + Q7 outright; Q4 conditional concede on §Rules cross-cite to ODR-0004 §3a CI tests + AI-RDF consumer use case named. If the Queen synthesis adopts the Q4 withdrawal condition, the scorecard lands at 7-of-7 concedes (full withdrawal on every question). **Held-as-live ONLY if Q4 aiHint exile operational vindication is unclear** (annotation graph CI tests not cited; AI-RDF consumer use case not named in §Rules).

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | (concede) | Severity table operationalised | 4-tier table with both `sh:Violation` placements named |
| Q2 | (concede) | — | Knublauch mapping table |
| Q3 | (concede) | — | DASH discipline + operational audit |
| **Q4** | **Yes** | **Yes (§Rules cross-cite)** | **§Rules cross-cites ODR-0004 §3a CI tests + names AI-RDF consumer use case** |
| Q5 | (concede with addition) | — | SHACL-native report + Allemang flattened UI |
| Q6 | (concede) | — | Knublauch composition + ODR-0010 Q6 enforcement |
| Q7 | (concede) | Three-rule contract operationalised | Cross-cite in BOTH §References + contract closed |

**Held-dissent text (Q4 — for the Queen's record if the withdrawal condition is unmet):**

- **Q4 held:** "The annotation graph keying I won at S004 Q3 is structurally complete (CI tests 1-3 enforce the three-graph separation), but ODR-0013 §Rules does not explicitly cross-cite ODR-0004 §3a CI tests AND does not explicitly name the AI-RDF consumer use case the annotation graph serves. Without this text, the S001 Q5 exile is mechanically enforced but operationally undefended; downstream AI-RDF integration may silently extend the shapes graph to carry advisory triples, recapitulating the inline-hint pathology the exile was meant to prevent. Withdraw on §Rules cross-cite + AI-RDF consumer use case named. (Hellmann et al. 2017 *DBpedia 2017 release notes* — LLM fallback to wrong source when right source is not queried; SHACL Recommendation §4; ODR-0004 §3a CI tests 1-3.)"

## Citations

Per ODR-0001 §Citation grounding: Hellmann et al. 2017 *DBpedia 2017 release notes* (LLM-fallback failure mode, also cited in ODR-0017 §3a + ODR-0005 §6a + ODR-0011 §5a); SHACL 1.2 Recommendation §4 (Validation Report structure) + §6.5 (severity); Allemang & Hendler 2020 *Semantic Web for the Working Ontologist* 3rd ed. Ch. 13 ("Linked Data in the Real World") — conveyancer-flattened-UI consumer practice.
