# Council Session A9 — What does an ODR record? Artefact-engineering decision vs ontological commitment

- **Date:** 2026-05-27
- **Record under review:** [ODR-0001 — Linked Data Council: Review Methodology](../ODR-0001-linked-data-council-methodology.md) (amended in-place per ODR-0001 §Self-amendment process).
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO methodology; enterprise modular-ontology programmes).
- **Devil's Advocate:** Nicola Guarino (ISTC-CNR — formal ontology theory, DOLCE, OntoClean, identity criteria).
- **Panel:**

  | Teammate | Standing-panel voice | Position file |
  |---|---|---|
  | gandon-solo | Fabien Gandon (W3C / Inria — RDF/RDFS/OWL standards, linked-data principles) | [gandon.md](./session-a9-gandon-guizzardi-methodology-gap/gandon.md) |
  | guizzardi-solo | Giancarlo Guizzardi (NEMO / UniLu — UFO/OntoUML, Kind/Role/Phase/Relator) | [guizzardi.md](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md) |
  | guarino-da | **Nicola Guarino (DA)** (ISTC-CNR — DOLCE, OntoClean, identity criteria) | [guarino-da.md](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md) |
  | kendall-queen | **Elisa Kendall (Queen)** (synthesis only — no separate position file) | — |
- **Input Documents:**
  - [ODR-0001 §Rules](../ODR-0001-linked-data-council-methodology.md) — Citation grounding, Session protocol, Format tiers, Self-amendment process.
  - [DCAP profile](../DCAP.md) — §Purpose, §Frontmatter (the `kind` enum and its prose), §Sections.
  - [Scope-Check 1 Q6](./scope-check-1-programme.md) (lines 157–187) — the deliberation that opened this gap, including the "Methodology gap surfaced" routing-back note.
  - [Session 001 Q1 and Q4](./session-001-pdtf-schema-to-ontology.md) — the precedent for diagnostic-exemplar discipline (Guarino's accepted amendment) and the UPRN-as-contingent objection (the IC-over-hard-cases precedent that ODR-0005 generalises).
  - Exemplar ODRs in the corpus: [ODR-0001](../ODR-0001-linked-data-council-methodology.md) (`kind: methodology`); [ODR-0003](../ODR-0003-pdtf-ontology-programme.md) (`kind: programme`); [ODR-0004](../ODR-0004-pdtf-ontology-foundation.md) (`kind: architecture`); [ODR-0005](../ODR-0005-property-land-identity-crux.md) (`kind: pattern`); [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) and [ODR-0013](../ODR-0013-shacl-validation-and-severity.md) (the records that triggered Q6).
- **`consensus-mode`:** `agent-fan-out` (per ODR-0001 §Consensus-mode framework: "Votes on each question are *independent* of votes on other questions; verdict reduces to a tally of standalone positions." A9 has one question; the tally is over the three positions submitted.)
- **Format tier:** **Reduced Council.** Per ODR-0001 §Format tiers: "Amendment / ratification-with-targeted-disputes; Queen + DA + 1–2 panel teammates on disputed questions only." A9 amends ODR-0001 in-place per its §Self-amendment process; the dispute is named (Gandon-vs-Guizzardi); the panel is the disputants plus the DA.

## Context

In [Scope-Check 1 Q6](./scope-check-1-programme.md) (combine ODR-0010 Overlay Profiles with ODR-0013 SHACL Severity?), the Council voted 7-2 KEEP SEPARATE. Two of the three dissents revealed a deeper question the panel could not settle within Q6: **what does an ODR record?**

Gandon's COMBINE vote treated the shapes graph as the unit of decision: "From the SHACL 1.2 standpoint, 0010 and 0013 are the same artefact — a shapes graph, its profile slices, severity assignments, DASH UI annotations." Guizzardi's KEEP SEPARATE vote treated the ontological commitment as the unit: "`opda:ValidationContext` reification (0010) is a Relator-class decision — what a profile *is*. Severity tiering (0013) is a regulatory-weight decision — what a violation report should look like. Two ontological commitments expressible in SHACL but distinct in their ontology." The verdict went Guizzardi's way; the *reason* did not get ratified.

Scope-Check 1 routed the gap back to the ODR-0001 amendment queue (the [Q6 transcript](./scope-check-1-programme.md) closing paragraph: "what does an ODR record — an *artefact-engineering* decision (Gandon) or an *ontological commitment* (Guizzardi)? ODR-0001/DCAP have not chosen between these readings. Under Gandon's reading, 0010+0013 → one ODR. Under Guizzardi's reading, they stay two. DCAP currently reads as Guizzardi's, but the read is implicit. **This is the live methodology gap exposed by this scope-check.**")

The stakes are not cosmetic. The OPDA programme has 12 further sessions queued in `docs/plan/council-followup-sessions.md`; ≥7 of those produce `kind: pattern` ODRs whose ratifiability depends on what this gap-closing amendment requires. A loose amendment licenses UFO-labelled artefact bundles without falsifiable commitments; a strict amendment imposes IC-over-named-hard-cases discipline that ODR-0005 already practices but other modules do not yet.

Default reading on convening: Guizzardi's, per Scope-Check 1's "DCAP currently reads as Guizzardi's, but the read is implicit" — the DCAP `kind` enum's `pattern` prose-definition explicitly names "identity criteria" as constitutive content.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is.**

- The proposition is coherent — one question, single methodology amendment, three named expert positions, named DA.
- No retire signal — the gap is real and was explicitly routed to A9 by Scope-Check 1 (8-1 APPROVE).
- No re-scope signal — the amendment target is ODR-0001 §Rules; the boundary is the existing `kind` enum (no new apparatus required). Reduced Council is the correct format (per §Format tiers).

**Procedural caveat acknowledged** (Guarino DA §Procedural #3, §Procedural #4): A9 is a meta-Council on ODR-0001 itself (the methodology). The filename `session-a9-gandon-guizzardi-methodology-gap.md` follows the Scope-Check 1 referent ("amendment A9") rather than the §Meta-Council `scope-check-N-<slug>.md` pattern; this is internally consistent with the convening block's "Session A9" naming and the adoption record's pending-row entry. The Queen accepts the irregularity for this session; file moves are not required. Panel composition lacks a relaxation-side DA (Davis would have pressed for SHOULD over MUST on programme-tractability grounds); the synthesis acknowledges this and proposes the next-two-sessions pressure-test (§Synthesis below).

## Question 1 — Does an ODR record an artefact-engineering decision (Gandon) or an ontological commitment (Guizzardi)? Or some mix — and if mix, where is the boundary?

### Gandon's position (artefact-engineering primary; BOTH-WITH-BOUNDARY as fallback)

Gandon's summary, [gandon.md §Position summary](./session-a9-gandon-guizzardi-methodology-gap/gandon.md): "An ODR records a decision about a **linked-data artefact** — a namespace, a URI policy, a graph (TBox / shapes graph / annotation graph), a profile, a dereferenceable resource on the Web — and the *ontological commitments* surface as constraints **inside that artefact**." The artefact-identity test he proposes is three-part: same dereferenceable resource (URI / `owl:versionIRI` lineage); same prefix and target topology; same dereference act (one `HTTP GET` or two). "Same" on all three → one ODR; "different" on any → separate ODRs.

He grounds the reading in the Linked Data Principles (Berners-Lee 2006; codified in *Linked Data: Evolving the Web into a Global Data Space*, Heath & Bizer 2011, Ch. 2), RDF 1.1 Concepts §1.5, RDFa Primer, SPARQL 1.1 Query §2, and the GRDDL Recommendation he co-authored. His argument summary, [gandon.md §1](./session-a9-gandon-guizzardi-methodology-gap/gandon.md): "an ontology on the Web is a **resource**. It has a URI. It dereferences. It has an `owl:versionIRI`. … These four rules are not ornamentation around an 'underlying' ontological commitment. They *are* the commitment that makes the ontology a thing on the Web rather than a file on a hard drive."

He proposes a concrete amendment to ODR-0001 §Rules titled `### Unit of decision (artefact-cut)` (text in [gandon.md "What I think the methodology should say"](./session-a9-gandon-guizzardi-methodology-gap/gandon.md)), with clarified `kind` enum semantics distinguishing `architecture` (substrate of one or more artefacts) from `pattern` (re-instantiable propositional commitment, cited via `implements`). He explicitly addresses the Guarino-anticipated-objection at [gandon.md "Replies to anticipated objections"](./session-a9-gandon-guizzardi-methodology-gap/gandon.md): "Identity criteria are recorded in `kind: pattern` ODRs (e.g. ODR-0005 already does this) … The pattern → artefact relationship is exactly the `implements` link the DCAP already provides."

**Vote:** Gandon — primary **ARTEFACT-ENGINEERING**; if forced into BOTH-WITH-BOUNDARY, the boundary is the artefact identity test (re-instantiable commitments earn `kind: pattern` ODRs cited via `implements`).

### Guizzardi's position (BOTH-WITH-BOUNDARY, boundary at the `kind` enum)

Guizzardi's summary, [guizzardi.md §Position summary](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md): "An ODR records an **ontological commitment** wherever it declares what *kinds* of entities the domain contains, what their identity criteria are, what Roles or Phases they pass through, what Relators bind them, what Modes or Qualities they bear; it records an **artefact-engineering decision** wherever it fixes encoding choices over a representational artefact." His central claim is that the DCAP's `kind` enum *already* sorts records along this axis — `pattern` and `mapping` are commitment-bearing; `methodology`, `architecture`, and `programme` are predominantly artefact-bearing — but never makes this normative.

He grounds the reading in the UFO programme (Guizzardi 2005 dissertation; Guizzardi 2007; Guizzardi et al. 2015 in *Applied Ontology*), Gruber 1993's "explicit specification of a conceptualization" framing refined by Studer/Benjamins/Fensel 1998, his collaboration with Guarino on OntoClean, his 2020 critique of "pure URI-as-engineering" ontologies in *Data Intelligence*, and the Truth-Maker framing he appended to ODR-0016 (Scope-Check 1 Q7c). His argument summary, [guizzardi.md "What is being conflated"](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md): "The Gandon reading — 'same shapes graph = one ODR' — collapses an *ontology* into its *encoding*. The collapse is the very mistake I have spent two decades trying to repair."

He explicitly acknowledges the Gandon reading's partial correctness ([guizzardi.md "Where Gandon is right"](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md)): "Many ODRs in this corpus are *predominantly* artefact-engineering decisions … ODR-0004 (Foundation) is `kind: architecture` and it is artefact-engineering through and through … ODR-0001 is `kind: methodology` and it is pure protocol engineering." His amendment text proposes a new subsection `### What an ODR records (load-bearing distinction)` in ODR-0001 §Rules, with a table mapping each `kind` value to its load-bearing axis, and five worked examples (ODR-0001, 0003, 0004, 0005, 0010, 0011, 0013) showing the boundary in practice.

His reply to the Guarino-anticipated-objection ([guizzardi.md "Replies to anticipated objections"](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md)): "The test under the proposed boundary is not 'does the record contain any encoding content' — every record does — but 'what is the *load-bearing* content the record exists to settle'. For ODR-0005 that is unambiguously the IC commitment over Endurants with hard cases; the SHACL/DASH mechanics are the enforcement of the commitment."

**Vote:** Guizzardi — **BOTH-WITH-BOUNDARY**, boundary at the `kind` enum made normative.

### Guarino (DA) — attack on both pure readings; conditional withdrawal

Guarino's DA stance, [guarino-da.md §DA stance summary](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md): "Both pure readings are wrong, and both for the same reason: each picks one half of *Formal Ontology and Information Systems* (Guarino 1998) and pretends the other half is decorative. Gandon's pure artefact-engineering reading collapses the conceptualisation onto the ontology — a shapes graph without a committed referent is just URI-flavoured naming, and *naming is not falsifiable*. Guizzardi's pure ontological-commitment reading is the inverse error: a UFO meta-category … assigned to a class without an *identity criterion stated over hard cases* is **typing**, not **committing**."

He grounds the attacks in DOLCE (Masolo et al. 2003, the WonderWeb Library, D18), OntoClean (Guarino & Welty 2002/2009), his founding 1998 paper, and the precedents he established in Session 001 Q1 (diagnostic exemplars admitted) and Q4 (UPRN as contingent administrative identifier). His test against a hypothetical pure-Gandon ODR-0005 ([guarino-da.md "The fatal part: pure artefact-engineering ODRs are unfalsifiable"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md)): "Test it with the three exemplars from Session 001 Q4 … A pure-Gandon ODR-0005 *cannot tell you whether the resulting graph is right or wrong*, because it has not committed to **what `opda:Property` refers to**." His test against a hypothetical pure-Guizzardi ODR-0011 ([guarino-da.md "The fatal part: UFO meta-category without IC is decoration"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md)): "Without an IC, the UFO label is decorative. … The same is true for `role`, for `participantStatus`, and most damningly for `evidence type` and `verification-method`."

He concedes both halves' partial correctness ([guarino-da.md "What Gandon *is* right about"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md), [guarino-da.md "What Guizzardi *is* right about"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md)) and proposes a three-part per-kind discipline:

> For `kind: pattern` and `kind: mapping`, the ODR's `## Rules` MUST include, for every class or scheme it declares or commits to:
> - **(a) A UFO/DOLCE meta-category commitment.**
> - **(b) An identity criterion stated over named hard cases.**
> - **(c) The artefact realisation.**

For `kind: methodology | architecture | programme`, requirements (a) and (b) are relaxed.

His **withdrawal condition** ([guarino-da.md "Withdrawal condition (explicit per ODR-0001 §Roles)"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md)) is four-part: (1) kind-distinction explicit; (2) IC over named hard cases is MUST not SHOULD; (3) hard cases are *named*, not gestured at; (4) `odr-review` lint enforces (a) and (b) as blocker at `status: accepted`.

His procedural concerns: §Procedural #1 (A9 is a `kind: methodology` deliberation — apply relaxed rule to its own output); §Procedural #2 (the existing `kind` enum prose in DCAP §Frontmatter already names "identity criteria" inside the `pattern` definition; A9 strengthens an existing implicit commitment rather than inventing new structure); §Procedural #3 (filename `session-a9-...` vs `scope-check-3-...`); §Procedural #4 (the absence of a relaxation-side DA — Davis — means the amendment is tested only on the strict side).

**Vote:** Guarino (DA) — **BOTH-WITH-BOUNDARY** with IC enforcement discipline. **Withdrawal CONDITIONAL on the amendment meeting all four conditions above.**

### Tally

| Position | Verdict |
|---|---|
| Gandon (panel) | ARTEFACT-ENGINEERING primary; BOTH-WITH-BOUNDARY accepted as fallback with the artefact identity test as the boundary marker |
| Guizzardi (panel) | BOTH-WITH-BOUNDARY, boundary at the `kind` enum |
| Guarino (DA) | BOTH-WITH-BOUNDARY with per-kind discipline (UFO category + IC over named hard cases + artefact realisation; MUST level for `pattern`/`mapping`) |

**Vote (per ODR-0001 §Session protocol rule 6, `N-M-K` over the three options):**

- ARTEFACT-ENGINEERING (only): **1** (Gandon primary)
- ONTOLOGICAL-COMMITMENT (only): **0**
- BOTH-WITH-BOUNDARY: **2** (Guizzardi, Guarino DA)

**Verdict: 2-1 BOTH-WITH-BOUNDARY** at the `kind` enum, with the Guarino-DA per-kind discipline as the load-bearing enforcement layer.

## Synthesis

**Convergence on the boundary.** All three voices independently reach the same locus for the boundary: the existing DCAP `kind` enum. Gandon's amendment ([gandon.md "What I think the methodology should say"](./session-a9-gandon-guizzardi-methodology-gap/gandon.md)) clarifies the `architecture` / `pattern` distinction in his terms (substrate of an artefact vs re-instantiable convention). Guizzardi's amendment ([guizzardi.md "What I think the methodology should say"](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md)) makes the same enum normative as the commitment/artefact axis (`pattern`/`mapping` = commitment; `methodology`/`architecture`/`programme` = artefact). Guarino's withdrawal condition #1 ([guarino-da.md "Withdrawal condition"](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md)) requires the same kind-distinction to be explicit (and names the same five values on each side). The three readings converge — they differ on *what enforcement attaches* to the `pattern | mapping` side, not on where the boundary falls.

**The genuine residue.** Gandon's primary preference is ARTEFACT-ENGINEERING with re-instantiability as the test for extracting `pattern` records ([gandon.md §7](./session-a9-gandon-guizzardi-methodology-gap/gandon.md)): "the discipline I would write into the amendment: when a rule in an `architecture` ODR's `## Rules` is cited by another `architecture` ODR, that is the signal that the rule should have been promoted to a `pattern` ODR. The `odr-review` lint should flag cross-`architecture` rule-borrowing as a candidate `pattern` extraction." Guarino's MUST-level IC discipline is strictly stricter than Gandon's re-instantiability test — both can hold simultaneously, and they hit at different points: Gandon's test fires when an architecture record's content is cited elsewhere (signal to extract); Guarino's test fires before a `pattern`/`mapping` record can be ratified (signal that the record's commitment is falsifiable).

**Adoption.** The amendment text below combines Guarino's per-kind discipline (load-bearing enforcement for `pattern`/`mapping`) with Gandon's re-instantiability test (operational rule for deciding when an `architecture` ODR's content earns extraction to a `pattern` sibling) and Guizzardi's worked-example boundary at the `kind` enum (the kind-prose table making the axis normative). All three voices' amendment proposals fold into one subsection in ODR-0001 §Rules. No `kind` enum changes; no new DCAP machinery; no new frontmatter fields.

**Guarino DA withdrawal verification (explicit per ODR-0001 §Roles).** The amendment text below meets all four of Guarino's withdrawal conditions:

1. **Kind-distinction explicit.** The amendment names `pattern` and `mapping` as the kinds bound by the stricter requirement, and explicitly relaxes the requirement for `methodology`, `architecture`, `programme`. (✓)
2. **MUST level on IC over named hard cases.** Per RFC 2119 / BCP 14 the amendment uses MUST, not SHOULD. (✓)
3. **Hard cases named, not gestured at.** The amendment requires the ODR's `## Rules` to name the hard cases the IC is stated over. (✓)
4. **`odr-review` lint enforces (a) and (b) at `status: accepted`.** The amendment specifies lint behaviour: warning on first commit, blocker on accepted. (✓)

**Guarino (DA) withdraws on A9.** Recorded verbatim per ODR-0001 §Session protocol rule 6: *"Guarino DA withdrew on Q1, accepting that the amendment as adopted meets all four withdrawal conditions: kind-distinction explicit (1); MUST-level IC over named hard cases for `kind: pattern | mapping` (2); hard cases named not gestured at (3); `odr-review` lint as blocker on `status: accepted` (4)."*

**Recorded partial alignment.** Gandon aligned on the verdict (BOTH-WITH-BOUNDARY at the `kind` enum) but holds his primary preference that artefact identity is the *primary* test and that the boundary is best understood through the artefact-cut. His re-instantiability test (cross-`architecture` rule-borrowing → `pattern` extraction candidate) is adopted as the *operational supplement* to Guarino's IC discipline. The amendment carries both.

**Procedural caveats acknowledged in the synthesis** (Guarino DA §Procedural):

- **#1 — A9 is a `kind: methodology` deliberation.** The output (ODR-0001 amendment) is itself relaxed under the new rule — ODR-0001 does not declare UFO categories or ICs and that remains correct.
- **#2 — DCAP §Frontmatter prose is invoked.** The amendment text cites the existing `pattern` prose ("identity criteria, role/view pattern") as the textual precedent the methodology is strengthening, not re-inventing.
- **#3 — Filename irregularity.** A9 transcript remains `session-a9-gandon-guizzardi-methodology-gap.md`; working files remain at `session-a9-gandon-guizzardi-methodology-gap/`. Both are internally consistent and match the Scope-Check 1 / adoption-record "Session A9" referent. No file moves required.
- **#4 — Absence of a relaxation-side DA.** Davis would have pressed for SHOULD over MUST on programme-tractability grounds. Mitigation: pressure-test the amendment against the next two `kind: pattern` sessions (S005 Property IC crux; S011 SKOS substrate). If the IC discipline bites unmanageably on either, a Reduced-Council follow-up amendment (A9b) re-pressure-tests the MUST-level requirement. Default presumption per Guarino's coda: hold the strict reading until empirical evidence of unmanageable bite emerges.

**Downstream record impact.**

- **ODR-0001** is amended in-place: new subsection `### What an ODR records (per-kind discipline)` added to `## Rules` (immediately after §Citation grounding and before §Cross-talk transport — the location both Gandon and Guizzardi proposed independently in their amendment texts). Track-record row added to the adoption record. ODR-0001's `status` stays `accepted`; the methodology-self-amendment lineage continues from the three 2026-05-27 Author-only amendments to this Reduced Council amendment.
- **DCAP.md** stays unchanged. The existing `kind` enum prose already names "identity criteria" inside the `pattern` definition; the amendment invokes this rather than rewriting it.
- **`odr-review`** lint requires a new check (Lint 4 enhancement, or a new Lint 8): for `kind: pattern | mapping` records, verify `## Rules` names (a) a UFO/DOLCE meta-category and (b) at least one identity criterion stated over named hard cases. Warning on `status: proposed`; blocker on `status: accepted`. The lint specification is delegated to the next `odr-review` skill update (not in this session's scope — flagged as a follow-up).
- **Future ODRs.** S005 (Property IC crux — `kind: pattern`) becomes the first ratifiability test of the amendment. S011 (Enumerations — `kind: pattern` under Scope-Check 1 Q3) is the second. Both already practice the discipline; the amendment makes it normative. ODR-0010 and ODR-0013's currently-mixed content (architecture artefact carrying Relator commitments and identity-tied severity rules) is acknowledged as a known seam ([guizzardi.md "Q6 re-stated under the proposed boundary"](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md)): the amendment does not retroactively split these records; future amendments may extract the commitment content to sibling `pattern` records when downstream queries require it.

**Termination-signal evaluation** (per `docs/plan/council-followup-sessions.md` §5 signals 3–6, cumulative at session close):

- Signal 3 (no duplicate constraint authoring) — N/A (no ontology constraints authored).
- Signal 4 (≤3-ODR consumer-query traversal) — N/A.
- Signal 5 (ODR-0003 diff stops moving after Phase 1 closes) — Phase 1 not yet open; diff still moving expectedly (S003 amended it earlier today; this session does not).
- Signal 6 (PII never accretes silently) — N/A.

**Pilot retire-or-extend evaluation:** N/A — A9 is not a pilot (`consensus-mode: agent-fan-out`).

## ODR-0001 amendment text (adopted)

The following text is added to [ODR-0001 §Rules](../ODR-0001-linked-data-council-methodology.md), immediately after §Citation grounding and before §Cross-talk transport, per ODR-0001 §Self-amendment process. The amendment is recorded as **A9** in the meta-Council amendment series:

> ### What an ODR records (per-kind discipline)
>
> *Amendment A9, adopted by Session A9 (2026-05-27, Reduced Council, Queen Kendall, DA Guarino — withdrew). Recorded per the Scope-Check 1 Q6 routing of the Gandon-Guizzardi methodology gap to this self-amendment queue.*
>
> An Ontology Decision Record records one of two kinds of decision:
>
> 1. **An ontological commitment** — a declaration about what *kinds* of entities the domain contains, what their identity criteria are, what Roles or Phases they pass through, what Relators bind them, what Modes they bear, what Qualities they particularise. Ontological commitments are language-independent: the same commitment may be encoded in OWL/RDFS/SHACL, in OntoUML, in Common Logic, or in plain prose, but the commitment persists across encodings. Commitments touch identity, rigidity, existential dependence, or Relator structure.
> 2. **An artefact-engineering decision** — a decision about how to structure, name, govern, sequence, or process the *artefacts* that encode the ontology: URI policies, namespace topology, graph separation, build pipelines, governance workflow, vocabulary catalogue, validation severity schemes, deliverable phasing. Artefact-engineering decisions are language-coupled: changing the representation language would substantively change the decision. They do not touch identity, rigidity, dependence, or Relator structure — they touch encoding, presentation, and process.
>
> The boundary is the existing DCAP `kind` enum, made normative:
>
> | `kind` | Decision category | Load-bearing axis |
> |---|---|---|
> | `pattern` | **Ontological commitment** | Identity, rigidity, dependence, Relator/Role/Phase/Mode/Quale structure |
> | `mapping` | **Ontological commitment** (source→ontology) | Identity preservation across re-expression |
> | `architecture` | Artefact-engineering | URI policy, namespace, graph separation, validation severity, build pipelines |
> | `methodology` | Artefact-engineering (of governance itself) | Protocol, panel, citation, document conventions |
> | `programme` | Artefact-engineering (of workflow) | Sequencing, dependency, work-breakdown, MVP gates |
>
> The DCAP §Frontmatter prose for `pattern` already names "identity criteria, role/view pattern" as constitutive; this amendment makes the implicit discipline normative.
>
> #### Per-kind ODR commitment requirements
>
> For `kind: pattern` and `kind: mapping`, the ODR's `## Rules` MUST include, for every class or scheme the ODR declares or commits to:
>
> - **(a) A UFO/DOLCE meta-category commitment.** State whether the class is a Substance Kind, a Role (RoleMixin / RoleType / Role-instance), a Phase, a Relator, a Mode, a Quality Region (with Qualia members), or an Abstract. The UFO ontological taxonomy (Guizzardi 2005, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4; UFO 2007/2011/2015 lineage) is the canonical reference; equivalent DOLCE commitments (Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies*, D18) are acceptable substitutes. BFO is also acceptable with a one-line equivalence note.
> - **(b) An identity criterion stated over named hard cases.** State the IC of the class or scheme over at least the hard cases the relevant Council session's panel identified or the OPDA WG named. The IC is the *test* of the meta-category commitment; without it, the commitment is decorative (Guarino DA §A9: "a UFO meta-category without IC is decoration"; precedent: Session 001 Q1 amendment admitted diagnostic exemplars on this exact reasoning).
> - **(c) The artefact realisation.** URI minting, shape graph location, SHACL/DASH machinery, namespace, build composition. This remains load-bearing (Gandon's reading captures a real necessary condition — the artefact is what is published, versioned, and dereferenced) but is insufficient by itself.
>
> For `kind: methodology`, `kind: architecture`, and `kind: programme`, requirements (a) and (b) are **relaxed**. These ODRs are constitutively about artefact, process, or organisation — they do not commit to what kinds of entities exist in the modelled domain. ODR-0001 (this methodology) is the `kind: methodology` exemplar — it does not declare a UFO category or an IC and is correct in not doing so. ODR-0003 (programme anchor) and ODR-0004 (foundation / URI policy) are exemplars of the relaxed regime. Where these ODRs incidentally make commitments about modelled-domain entities, those commitments are themselves `pattern`-level content and must satisfy (a)–(c) inline or by reference to a `pattern` ODR cited via `depends-on` or `implements`.
>
> #### Artefact identity test (operational rule for extracting `pattern` records)
>
> Where an `architecture` ODR's `## Rules` contains a rule that is cited by another `architecture` ODR (cross-`architecture` rule-borrowing), that is the signal that the rule should have been promoted to a `pattern` ODR. The `pattern` ODR records the convention abstracted from any specific artefact; the realising `architecture` ODRs cite it via `implements`. The test for `pattern` extraction is three-part:
>
> 1. **Same dereferenceable resource.** Do the candidate rule's instances share a single URI / `owl:versionIRI` lineage across the citing artefacts?
> 2. **Same prefix and target topology.** Do they share namespace prefixes and graph-import topology?
> 3. **Re-instantiability.** Would the rule apply to a *third* artefact not currently cited?
>
> If the answer to (3) is "yes" *and* the rule's content is a load-bearing ontological commitment per requirements (a)–(b) above, extract to a `pattern` record. If the answer to (3) is "no" *or* the content is purely artefact-engineering, leave the rule inside its `architecture` ODR.
>
> #### Worked examples (from the OPDA corpus)
>
> | ODR | `kind` | Load-bearing content | Discipline applied |
> |---|---|---|---|
> | [ODR-0001](../ODR-0001-linked-data-council-methodology.md) | `methodology` | Council protocol, panel composition, citation grounding | Requirements (a)/(b) relaxed; (c) implicit (the methodology *is* the artefact). |
> | [ODR-0003](../ODR-0003-pdtf-ontology-programme.md) | `programme` | Phase ordering, work-breakdown, shared-question routing | Requirements (a)/(b) relaxed; (c) is the programme anchor's structure. |
> | [ODR-0004](../ODR-0004-pdtf-ontology-foundation.md) | `architecture` | URI policy, three-graph separation, term-sourcing, generator policy | Requirements (a)/(b) relaxed; (c) is the foundation artefact substrate. The Kind/Role naming distinction the URI policy encodes is *commitment content* recorded in ODR-0005 (a `pattern` ODR), cited from 0004 via `implements`. |
> | [ODR-0005](../ODR-0005-property-land-identity-crux.md) | `pattern` | DOLCE Endurant commitment + IC over demolition/subdivision/merger/first-registration + UPRN-as-contingent | **All three requirements normative.** (a) Endurant + multi-class split named. (b) IC over hard cases named (demolition / subdivision / merger / rebuild / first-registration). (c) `dash:uniqueValueForClass true` on `opda:uprn` as enforcement. This is the corpus's pattern exemplar. |
> | [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) | `architecture` | SHACL profile composition, `opda:ValidationContext` reification, DASH integration, `dct:source` traceability | Requirements (a)/(b) relaxed at the architecture level; the `opda:ValidationContext` Relator reification is a *commitment* that under stricter reading would extract to a sibling `pattern` ODR. Marked as a **known seam** (Session 001 Q5 Guarino-withdrawal lineage); future amendment may extract if downstream queries require. |
> | [ODR-0011](../ODR-0011-enumeration-vocabularies.md) | `pattern` (under Scope-Check 1 Q3 amendment) | SKOS scheme criteria + UFO meta-category per scheme | **All three requirements normative.** Under Scope-Check 1 Q3 (Guizzardi sub-finding), each scheme declares UFO category (Quale-in-Region / Role label / Phase label / method-plan code). Q8 of S011 (the typed-output pilot per Scope-Check 2 B3) ratifies the per-scheme category assignment. The IC over named hard cases must accompany each category — Band-I-Wales vs Band-A-universal for `councilTaxBand`; Seller-vs-SecondaryTitle-Seller for `role`; supersession-in-fact vs supersession-of-record for `evidenceType`. |
> | [ODR-0013](../ODR-0013-shacl-validation-and-severity.md) | `architecture` | Severity tiers, constraint mapping, annotation-graph separation, DASH UI coverage | Requirements (a)/(b) relaxed at the architecture level; the rule "every `sh:Violation` guards a Kind's identity contract" is commitment content tied to ODR-0005's IC and is cross-cited from ODR-0005 (or its sibling) under the three-rule SHACL interface contract (Scope-Check 1 Q6 / Cagle). |
>
> #### Enforcement
>
> - **`odr-review` lint** (specification updated in the next skill release): for `kind: pattern | mapping` records, verify `## Rules` names (a) a UFO/DOLCE meta-category commitment and (b) at least one identity criterion stated over named hard cases. Warning on `status: proposed`; **blocker on `status: accepted`**. The lint is text-pattern based per DCAP's prose-profile discipline; full SHACL-shape enforcement remains out of scope.
> - **Pre-flight scope check** (per §Pre-flight scope check): the Queen confirms the proposition's `kind` matches its load-bearing content per the table above. A mismatch — a record whose declared `kind` is `architecture` but whose load-bearing content is a Relator declaration or an IC — is grounds for re-scope. The Queen recommends extracting the commitment to a `pattern` record.
> - **Pressure-test schedule.** Sessions S005 (Property IC crux) and S011 (Enumerations) are the first two `kind: pattern` ODRs to ratify under this amendment. If the IC-over-named-hard-cases requirement bites unmanageably on either, a Reduced-Council follow-up amendment A9b re-evaluates the MUST-level requirement (precedent: Scope-Check 2 B8 retire-or-extend evaluation pattern; default presumption: hold the strict reading until empirical evidence of unmanageable bite).
>
> #### Rationale (cited)
>
> The boundary is grounded in: Guarino 1998, *Formal Ontology and Information Systems*, §3 (the conceptualisation/ontology distinction); Guizzardi 2005 dissertation and the UFO 2007/2011/2015 lineage (the meta-category taxonomy); Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies* (DOLCE); Guarino & Welty 2002/2009 (OntoClean meta-properties); Berners-Lee 2006 and Heath & Bizer 2011, Ch. 2 (Linked Data Principles — the artefact-cut side); RDF 1.1 Concepts §1.5 (the resource/dereference framing); the W3C GRDDL Recommendation (Gandon & Hawke, eds., 2007 — engineering act *is* the ontological act, for `kind: architecture`); the Truth-Maker framing (Guizzardi 2018, *ER 2018 Keynote*) — appended to ODR-0016 as the downstream consequence; this corpus's [Session 001 Q1 amendment](session-001-pdtf-schema-to-ontology.md) (diagnostic exemplars admitted) as the load-bearing precedent for the IC-over-hard-cases discipline.

## References

- [ODR-0001 — Linked Data Council: Review Methodology](../ODR-0001-linked-data-council-methodology.md) (the record amended in-place by this session).
- Position files (per ODR-0001 §Session protocol rule 9, the source of every quoted position in this synthesis):
  - [gandon.md](./session-a9-gandon-guizzardi-methodology-gap/gandon.md) — Gandon's position file.
  - [guizzardi.md](./session-a9-gandon-guizzardi-methodology-gap/guizzardi.md) — Guizzardi's position file.
  - [guarino-da.md](./session-a9-gandon-guizzardi-methodology-gap/guarino-da.md) — Guarino DA's position file.
- [Scope-Check 1 — Programme cut](./scope-check-1-programme.md) Q6 — the deliberation that opened the gap and routed it to A9.
- [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q1 (diagnostic exemplars) and Q4 (UPRN as contingent) — the precedents the IC discipline generalises from.
- [DCAP profile](../DCAP.md) — the `kind` enum prose this amendment invokes as the boundary.
- [Council follow-up sessions plan](../../../plan/council-followup-sessions.md) §9 risks — the Gandon-vs-Guizzardi gap routing entry and the Davis Q1/Q5/Q6 held dissents (the absent relaxation-side DA the procedural caveat addresses).
- [OPDA adoption record §Track Record](./adoption.md#track-record) — updated by this session.
- ODR-0005, ODR-0010, ODR-0011, ODR-0013 — the corpus records whose `kind` classifications the amendment uses as worked examples.
