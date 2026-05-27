# Gandon — Devil's Advocate on S011

## DA framing

SKOS is the right framework for the 160-leaf enumeration register, and ODR-0011's stub frames it correctly: each enum becomes a `skos:ConceptScheme`, members carry `skos:prefLabel` / `skos:notation` / `skos:definition`, hierarchy via `skos:broader`/`skos:narrower`, closed-vs-open flagged for `sh:in` downstream. The stub is well-aimed; Baker/Isaac/Miles convergence on SKOS-as-mechanism is W3C-grounded (SKOS Reference 2009; W3C Rec) and the Core-tier admission in ODR-0002 already locks in the vocabulary surface. My job as DA is not to relitigate SKOS-vs-OWL — that battle was settled at SKOS Rec stage and Baker/Knublauch reaffirmed it at S001 Q5. My job is to ask: *where does SKOS's weaker formal semantics bite operationally, and where does the panel reach for OWL-grade discipline when SKOS will not deliver it?*

The DA frame I bring is the **SKOS-vs-OWL boundary**. SKOS is intentionally weaker than OWL on formal semantics — the SKOS Reference §1.4 calls it out explicitly: "SKOS is not an ontology language" in the OWL DL sense; `skos:Concept` is not `owl:Class`; `skos:broader` is not `rdfs:subClassOf`. That weakness is the *feature* — it admits messy real-world vocabularies (folksonomies, glossaries, ISO-25964 thesauri) that OWL would reject — but the same weakness means SKOS gives no formal disjointness, no consequence-derivation, no membership-policing. Where the panel needs *guarantees* the W3C SKOS Reference does not provide, the panel either (a) reaches for OWL discipline (which breaks the SKOS framing) or (b) reaches for SHACL-grade discipline written outside the SKOS layer (which is fine, but must be named explicitly).

My respect for the stub's framing is real. ODR-0011 is a clean `kind: pattern` record that names the SKOS-vs-OWL choice, names the closed-vs-open `sh:in` boundary, and routes domain-specific concept content to module ODRs (ODR-0005, 0006, 0009, 0012). The seven questions in scope after S015 routing are mostly settled by published SKOS / Dublin Core authority — I concur on Q1, Q2, Q4, Q6, Q7. My pressure-test concentrates on Q5 (PROV-O vs `dct:isReplacedBy` disambiguation) and Q8 (the per-kind discipline application — does the four-category framework attribute correctly to upstream UFO, or is it Council-authored?).

## Per-question DA positions

### Q1 — Scheme membership criteria

**DA position:** Concur. Every JSON `enum` array in the PDTF v3 corpus becomes a `skos:ConceptScheme`, members linked via `skos:inScheme`. This is the *only* answer SKOS Reference §3 admits: a Concept lives in at least one Scheme via `skos:inScheme`, and the scheme-as-organisational-unit is the SKOS commitment. There is no published alternative.

**Engagement:** The 160-leaf count is a drafting concern, not a methodological one. Whether a given leaf gets its own scheme or shares a scheme with a near-synonym (e.g. `tenure` and `marketingTenure` sharing a scheme) is a per-scheme concept-deduplication decision deferred to drafting per the stub's `## Consequences`. The methodology is settled at Q1.

**Per-voice vote: FOR.** Concur with no withdrawal condition.

### Q2 — Cardinality

**DA position:** Concur with Baker. W3C SKOS Reference §S14 (a Concept SHOULD have at most one `skos:prefLabel` per language tag) and §S15 (a Concept SHOULD have at most one `skos:notation` per datatype) settle the cardinality discipline. The "exactly one prefLabel per language tag" rule has been the DCMI / SKOS reviewers' position since SKOS Rec; there is no methodological dispute.

**Engagement:** The SKOS Reference uses SHOULD (not MUST) for SKOS Integrity Conditions S13–S15 deliberately — to admit broken-but-recoverable vocabularies during migration. ODR-0011 should likewise express these as SHACL `sh:maxCount` shapes at `sh:Violation` severity (closed schemes) or `sh:Warning` (open schemes during migration), with the discipline tightened at the SHACL gate per ODR-0013. The cardinality discipline itself is not contested.

**Per-voice vote: FOR.** Concur with no withdrawal condition.

### Q4 — Definition source

**DA position:** Concur with the five-line precedence Baker proposes. Business glossary verbatim where the term exists; canonical schema leaf `description` otherwise; `dct:source` on every concept tracing to either origin. This applies ODR-0004's provenance convention without re-defining it.

**Engagement:** The DCMI Usage Board test (Baker, Bechhofer, Isaac, Miles 2013, *On Becoming a Linked Open Data Vocabulary*) prescribes precisely this provenance discipline — definitions trace to source. ODR-0011's draft Rule ("Labels and definitions are sourced from the business glossary... adopted verbatim, not paraphrased") aligns. The only sub-question worth flagging is the paraphrase boundary — what counts as "verbatim"? — but that is a drafting concern owned by the per-scheme drafter, not a methodological dispute. Concede.

**Per-voice vote: FOR.** Concur with no withdrawal condition.

### Q5 — Code-list lifecycle (MILD ATTACK)

**DA position:** Mild attack on `prov:wasDerivedFrom` vs `dct:isReplacedBy` disambiguation. The stub's Rule mentions `prov:wasDerivedFrom` as the succession mechanism, but PROV-O is over-engineering for simple deprecation. SKOS already admits `skos:related` for non-hierarchical concept relation, and Dublin Core supplies `dct:isReplacedBy` / `dct:replaces` for the canonical replacement pattern. Reaching for PROV-O when SKOS + DCT cover the case is the kind of vocabulary-sprawl the W3C TAG cautions against (TAG "Cool URIs Don't Change" 2008 §"Preserving lineage" — use the minimal vocabulary that captures the case).

The discipline should be:

- **Deprecation-with-replacement** (e.g. an old `ownershipType` code retired in favour of a new one, same-domain succession): `dct:isReplacedBy` on the retired concept, `dct:replaces` on the successor. SKOS Reference admits this pattern via DCT integration; it is the canonical answer.
- **Substantive redefinition** (e.g. a notation's *meaning* changed across a programme revision; the new concept is genuinely derived from the old but not a replacement): `prov:wasDerivedFrom` is appropriate because PROV-O's `Derivation` captures the "X was produced from Y by some process" structure that DCT does not. This is the case PROV-O exists for.
- **Minor edit** (label rephrase, definition tightening, no semantic change): no relation; just `dct:modified` timestamp update on the concept's metadata. PROV-O is excessive here.

**Engagement with the stub.** ODR-0011's current draft Rule ("Every concept carries `dct:source` to its origin") is correct; the *succession* mechanism is what needs disambiguation. The stub does not currently name the three cases. Without that disambiguation, drafters will reach for PROV-O reflexively (because it sounds more formal) and Dublin Core's intended mechanism for replacement will be bypassed.

**Withdrawal condition:** ODR-0011 §Rules explicitly names the three cases above and which mechanism applies to which. The Queen synthesis records the three-case discipline; PROV-O is reserved for substantive-redefinition, `dct:isReplacedBy` is reserved for deprecation-with-replacement, minor-edit is `dct:modified` only.

**Per-voice vote: AGAINST current PROV-O-default framing + withdrawal condition stated.** AGAINST blanket PROV-O succession; withdrawal on three-case discipline named.

### Q6 — Namespace

**DA position:** Concur. Single `opda:` hash namespace per ODR-0004 Rule 1 settles this. Hash-namespace SKOS is the H&M precedent and the W3C TAG "Cool URIs" pattern; no per-scheme namespace fragmentation. The W3C SKOS examples in the Reference use the same single-namespace pattern (e.g. `http://www.example.org/animals#mammal`, `http://www.example.org/animals#carnivore`).

**Engagement:** The alternative — per-scheme namespaces (`opda-role:`, `opda-tenure:`, etc.) — was tried in early DCMI experiments and abandoned because cross-scheme dereferenceability becomes a fragmentation problem. ODR-0004 Rule 1's single-namespace commitment is correct. Concede.

**Per-voice vote: FOR.** Concur with no withdrawal condition.

### Q7 — Notation typing

**DA position:** Concur with Cagle's `xsd:string` + `sh:pattern` default. Declining custom datatypes (e.g. minting `opda:UPRNType` as a custom `xsd:datatype`) is the right call: SHACL `sh:pattern` regex on the literal value handles the discriminator, and `xsd:string` keeps the vocabulary surface clean for non-SHACL consumers. The W3C SKOS Reference does not pre-decide notation datatype — §S15 leaves it open — so the default falls to operational practice. Cagle's published SHACL discipline (TopQuadrant deployment record) names the pattern.

**Engagement:** The one case where custom datatypes earn their place is when the regex is genuinely structural and the literal type is reused across schemes (e.g. ISO 3166 alpha-3 country codes). Even there, the SHACL community's emerging consensus is to use `xsd:string` + `sh:pattern` (Knublauch position from S001) rather than mint custom datatypes. Concede.

**Per-voice vote: FOR.** Concur with no withdrawal condition.

### Q8 — UFO meta-category per scheme (PRIMARY ATTACK)

**DA position (PRIMARY ATTACK):** This is the load-bearing question of the session and the B3 pilot. Per ODR-0001 A9 §What an ODR records (per-kind discipline), `kind: pattern` ODRs MUST state UFO/DOLCE meta-category for every class or scheme. ODR-0011 *is* `kind: pattern`. The A9 requirement applies. Guizzardi's four candidate categories — Quale-in-Region, Role label, Phase label, Method-plan code — are reasonable as a taxonomy for SKOS-scheme-typing, and the per-scheme assignments are mostly defensible. *But here is the attack:* SKOS-scheme-typing under UFO is **novel work**. UFO does not have a published, formal SKOS-binding. Guizzardi's 2005 dissertation and the UFO 2007/2011/2015 lineage type *Substances*, *Relators*, *Modes*, *Qualities*, *Phases*, *Roles*, *Kinds* — but the act of typing a *SKOS concept scheme* with a UFO category is a Council-side extension. The category framework is being *applied to SKOS* in this Council, not *imported from a published source*.

This matters for A9's discipline. A9 §(a) says UFO/DOLCE meta-category, citing Guizzardi 2005 Ch. 4 and the UFO 2007/2011/2015 lineage. Those publications type ontology classes; they do not type SKOS schemes. If ODR-0011's Rules state "scheme X is a Quale-in-Region scheme per UFO" without distinguishing that this is a **Council-authored binding of UFO categories to SKOS schemes** rather than an upstream UFO commitment, the discipline gets imported as if it were authoritative when it is in fact a Council extension. A future maintainer reading ODR-0011 will trace `dct:source` to UFO and find no published SKOS-binding there — at which point the IC discipline collapses.

The B3 pilot (`consensus-mode: hive-mind/typed-output`) tests whether the typed-output discipline is consumable by downstream tooling. That is fine — the typed output is data. But the meta-question (is the four-category framework itself the right typology?) is logically prior to the per-scheme assignments. The typed output is only meaningful if the typology is authoritative.

**Engagement with Guizzardi's anticipated position.** Guizzardi will likely defend the four categories as a natural application of UFO to SKOS — Quale-in-Region for ordinal/cardinal Quality scales (EPC band, council-tax band), Role label for relational-Role enumerations (party-to-transaction roles), Phase label for lifecycle-Phase enumerations (participant status across a transaction), Method/plan code for procedural enumerations (capacity-in-which-a-seller-acts). The application is reasonable; my objection is not to the categories per se but to their **attribution**. If Guizzardi cites a published source for the SKOS-binding (a paper, a UFO release with explicit SKOS treatment, an OntoUML SKOS-extension document), the discipline imports correctly. If no such source exists — and to my knowledge, in the UFO literature post-2015, none does — then the four-category framework must be attributed to ODR-0011 itself with `dct:source <ODR-0011>`, not to UFO.

**My per-scheme verdicts** (concur with Guizzardi-solo on most assignments; contest the META-question of upstream attribution):

| Scheme | UFO category (my view) | DA challenge |
|---|---|---|
| `role` | Role label | concur if Guizzardi cites UFO authority for the SKOS-binding |
| `sellersCapacity` | Method/plan code | concur |
| `participantStatus` | Phase label | concur — closest to UFO Phase as Guizzardi defines it |
| `councilTaxBand` | Quale-in-Region | concur — ordinal scale over a property-value Quality |
| `currentEnergyRating` | Quale-in-Region | concur — ordinal A–G scale |
| `ownershipType` | ? | demand Guizzardi name UFO authority for the assignment — is `{Private individual, Organisation}` a Kind enumeration? A Role enumeration? UFO does not unambiguously answer |
| `tenureKind` | ? | demand Guizzardi name UFO authority — the tenure scheme straddles Kind (freehold-as-legal-institution) and Phase (currently-tenured-leasehold); UFO does not pre-decide |
| `addressVariant` | Phase label OR Role label? | demand consistency with S015 verdict — Address as Mode-of-Presentation routes to ODR-0015; whatever S015 decides on Address Kind determines the variant scheme's UFO category here |
| `opda:assuranceLevel` | Quale-in-Region OR Method/plan? | the eIDAS Substantial/Low/High bands suggest ordinal Quale; the per-band validation-methods suggest Method/plan code; the assignment is contested at the modelling level, not just at the attribution level |

**Engagement with Baker.** Baker may push back that SKOS-scheme-typing under UFO is *over-determining* a SKOS scheme — that SKOS's intentional looseness on formal semantics is the *point*, and forcing UFO categories on schemes that SKOS deliberately admits as messy ISO-25964-style thesauri is a methodology mismatch. Baker would be right if A9 did not apply. But A9 *does* apply to `kind: pattern` records, and ODR-0011 is `kind: pattern`. The Baker pushback is a meta-Council question about whether A9 should apply to SKOS-scheme records at all — a real question, but one for the methodology corpus, not this session. For this session, A9 applies; my objection is to the source-attribution, not the application.

**Withdrawal condition:** Q8 withdraws on EITHER (a) Guizzardi cites a published source for the UFO-SKOS-binding framework (paper, UFO release, OntoUML SKOS-extension) authoring the four-category typology, with the citation verifiable per ODR-0001 §Citation grounding, OR (b) the four-category framework is committed as a **Council-authored extension** to the per-kind discipline with explicit `dct:source <ODR-0011>` on each scheme's UFO-category assertion — not imported as if from upstream UFO. The Queen synthesis records which path was taken.

**Per-voice vote: CONDITIONAL — FOR per-scheme assignments (mostly) + AGAINST upstream UFO attribution unless cited.** Withdrawal on either citation-of-published-source OR explicit Council-authored attribution.

## DA scorecard target

**Target: 7 of 8 withdrawn.**

| Q | Concession status | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | Already conceded | — | (W3C SKOS Reference §3) |
| Q2 | Already conceded | — | (W3C SKOS Reference §S14, S15) |
| Q4 | Already conceded | — | (DCMI Baker/Bechhofer/Isaac/Miles 2013) |
| Q5 | Negotiable (mild attack) | No | Three-case discipline named in §Rules |
| Q6 | Already conceded | — | (ODR-0004 Rule 1; W3C TAG Cool URIs) |
| Q7 | Already conceded | — | (Cagle/Knublauch SHACL practice) |
| **Q8** | **Negotiable (PRIMARY ATTACK)** | **Yes** | **Cited published source for UFO-SKOS-binding OR explicit Council-authored attribution with `dct:source <ODR-0011>`** |

**Held-dissent text (if Q8 withdrawal condition unmet):**

"The UFO four-category framework (Quale-in-Region / Role label / Phase label / Method-plan code) applied to SKOS schemes is not from a published source in the UFO literature I can locate. The A9 §(b) discipline requires UFO/DOLCE meta-category for `kind: pattern` ODRs, citing Guizzardi 2005 Ch. 4 and the UFO 2007/2011/2015 lineage — those publications type ontology classes, not SKOS schemes. Guizzardi's per-scheme assignments depend on the four-category framework being authoritative, but without published-source citation, the typed-output is **Council-authored** rather than upstream-inherited. The B3 pilot's typed-output is only consumable by downstream tooling if the typology is attributed correctly; mis-attributing Council-authored discipline as upstream UFO breaks the audit trail. Demand: ODR-0011 §Rules explicitly attributes the four-category framework to ODR-0011 itself with `dct:source <ODR-0011>`, not to UFO. The per-scheme assignments are mostly defensible (concur on Quale-in-Region for EPC and council-tax bands; concur on Role label for `role`; concur on Phase label for `participantStatus`; concur on Method/plan for `sellersCapacity`); the META-question is what the source field cites." — *W3C SKOS Reference 2009 §1.4 (SKOS-as-not-an-OWL-ontology); W3C TAG "Cool URIs Don't Change" 2008 (provenance discipline on URI minting); GRDDL Recommendation 2007 (Gandon & Hawke, eds.) — the engineering act is the ontological act, and the source attribution is part of the engineering.*

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition, and records "Gandon DA withdrew on Q[n] on condition met: [verbatim condition]" or "Gandon DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Gandon DA aligned with majority" — the alignment must trace to the specific condition that was met.

The B3 pilot status of Q8 (`consensus-mode: hive-mind/typed-output`) means the typed-output verdict is a structured object consumed by downstream tooling (linters, ODR-review skills, generator pipelines). The verdict is data, not decoration. Whatever Q8 settles on — the four-category framework as upstream UFO OR as Council-authored — must propagate cleanly through the typed output. The Queen's synthesis records the attribution explicitly so the downstream tooling reads it correctly.

The cited authority for every position above: W3C SKOS Reference 2009 (Miles & Bechhofer, eds.) §§1.4, S14, S15, and §3; W3C TAG "Cool URIs Don't Change" 2008; W3C GRDDL Recommendation 2007 (Gandon & Hawke, eds.); DCMI Usage Board admission test (Baker, Bechhofer, Isaac, Miles 2013); ODR-0001 A9 §What an ODR records (per-kind discipline, requirements (a)–(c) for `kind: pattern`). These citations meet ODR-0001 §Citation grounding ("a W3C Recommendation, named spec + section number"; "a peer-reviewed paper authored by the expert").
