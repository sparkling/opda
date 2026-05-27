# Council Session 004 — PDTF Ontology Foundation (Phase 1 gate)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) (`kind: architecture`; A9-relaxed regime).
- **Queen / Moderator:** Fabien Gandon (W3C / Inria — RDF/RDFS/OWL standards, Linked Data Principles, GRDDL Rec). Gandon sits inside the formal-pair (with Guizzardi) and writes the synthesis.
- **Devil's Advocate:** Holger Knublauch (TopQuadrant / extended panel — SHACL spec co-author, TopBraid customer governance, DASH). DA selected per ODR-0001 DA criterion: Knublauch's published methodology is genuinely opposed to the framing — he ships SHACL to production and has fifteen years of operational failure-mode evidence against discipline-as-policy statements without runtime materialisation rules.
- **Panel (5 teammates + DA + Queen):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | governance-pair | Tom Baker + Harshvardhan Pandit | [baker-pandit.md](./session-004-pdtf-ontology-foundation/baker-pandit.md) |
  | pragmatic-pair | Dean Allemang + Jim Hendler | [allemang-hendler.md](./session-004-pdtf-ontology-foundation/allemang-hendler.md) |
  | enterprise-pair | Elisa Kendall + Ian Davis | [kendall-davis.md](./session-004-pdtf-ontology-foundation/kendall-davis.md) |
  | formal-pair | **Fabien Gandon (Queen)** + Giancarlo Guizzardi | [gandon-guizzardi.md](./session-004-pdtf-ontology-foundation/gandon-guizzardi.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-004-pdtf-ontology-foundation/cagle.md) |
  | da-solo | **Holger Knublauch (DA — extended)** | [knublauch-da.md](./session-004-pdtf-ontology-foundation/knublauch-da.md) |
- **Input Documents:**
  - [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) (the stub; 8 numbered rules).
  - [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) — A9 amendment landed 2026-05-27 (this conversation); `kind: architecture` is the relaxed regime.
  - [ODR-0002 §Reference-not-import (normative)](../ODR-0002-ontology-language-adoption.md) — S002 amendment landed 2026-05-27 (this conversation); `adoption-mode` field; reference-only default MUST.
  - [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q1 (genuine modelling + generator-first), Q3 (partition + three-graph separation), Q5 (advisory-annotations-exiled-to-annotation-graph; Knublauch+Gandon prevail ~7-2; Cagle dissent recorded), Q7 (single `opda:` hash 9-0; spike-then-scale).
  - W3C foundational: TAG "Hash vs Slash" Note (Berners-Lee & Connolly eds. 2008; *Cool URIs for the Semantic Web*, Sauermann & Cyganiak 2008); TAG "Cool URIs Don't Change" (1998); RDF 1.1 Concepts §1.5; SHACL Core §6.5 (Knublauch & Kontokostas eds. 2017); Linked Data Principles (Berners-Lee 2006; Heath & Bizer 2011 Chs. 2–6).
- **`consensus-mode`:** `agent-fan-out` (per ODR-0001 — votes on each question are independent of votes on other questions).
- **Format tier:** **Full Council.** Phase 1 gate session.

## Context

ODR-0004 is the Foundation spike — the substrate every module and cross-cutting ODR inherits. Per plan §5 Phase 1, ODR-0004 must clear before ODR-0005 (Identity crux gate), ODR-0015 (Address gate), and module sessions S006–S013. The stub is well-developed (eight numbered Rules covering URI policy, layer-segregated naming, three-graph separation, ontology header, dereferenceability commitment, generator-first, term-sourcing, diagnostic exemplars); S004's task is operational hardening — making each policy survive deployment.

A9 (ratified earlier this same day) confirms ODR-0004 is `kind: architecture` (relaxed regime — no UFO/IC commitments inline). S002 (ratified earlier this same day) confirms reference-not-import as normative MUST with the `adoption-mode` field. These two prior amendments are the substrate this session builds on.

The Knublauch DA stance is build-vs-runtime-aware: a rule stated as authoring discipline must specify whether it is enforced at build time or runtime, what consumer profile materialises it, and what operational test verifies the rule held. Cagle's parallel attack on Q3 (annotation-graph keying — discharging his S001 Q5 `aiHint`-exile loss) and Q5 (generator reproducibility — operational determinism) carries the same operational-test discipline. Together they convert ODR-0004 from a policy document into a deployment-survivable contract.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is**.

- Coherent proposition (Foundation spike; 7 named questions; A9-relaxed regime correctly applied).
- No retire signal (the gate is load-bearing for all downstream ODRs).
- No re-scope signal (questions are foundational; none belongs in a different corpus).
- A9 application: ODR-0004 makes no inline UFO/IC commitments; layer-segregated naming labels the Kind/Role distinction that ODR-0005 (`kind: pattern`) will commit to; cited via `implements` per A9's artefact identity test.

## Question-by-question verdicts

### Q1 — Hash vs slash namespace

**Positions (full citations in position files):**

- **Hendler ([allemang-hendler.md Q1](./session-004-pdtf-ontology-foundation/allemang-hendler.md)):** Hash. W3C TAG "Cool URIs Don't Change" (2008) and *Cool URIs for the Semantic Web* (Sauermann & Cyganiak 2008) §3: small TBox is the textbook whole-document-dereference case. PDTF Foundation is at the wrong scale for slash.
- **Allemang:** Concur. *Working Ontologist* 3rd ed. Ch. 3 — every operational facility you take on is one you have to maintain.
- **Kendall ([kendall-davis.md Q1](./session-004-pdtf-ontology-foundation/kendall-davis.md)):** Hash. FIBO `fnd-utl-av` precedent (hash-fragmented; OMG 2024-Q4 §AnnotationVocabulary).
- **Davis:** Concur stronger. BBC `/programmes/` used slash *because* it served tens of millions of resources; OPDA TBox is orders of magnitude below that threshold.
- **Baker+Pandit ([baker-pandit.md Q1](./session-004-pdtf-ontology-foundation/baker-pandit.md)):** Hash. Pandit notes DPV's slash → hash switch precedent.
- **Gandon (Queen) + Guizzardi ([gandon-guizzardi.md Q1](./session-004-pdtf-ontology-foundation/gandon-guizzardi.md)):** Hash. LDP Principles 1–3; fragment-vs-303 distinction (*Cool URIs* §4.1–4.2) makes hash operationally cheaper for OPDA's static-site deployment.
- **Cagle ([cagle.md Q1](./session-004-pdtf-ontology-foundation/cagle.md)):** Concur hash for small TBox.
- **Knublauch (DA) ([knublauch-da.md Q1](./session-004-pdtf-ontology-foundation/knublauch-da.md)):** Concur hash for current scale. **Demand: reopening trigger recorded.** TopBraid customer evidence — a customer beginning with hash and reaching 8,000 terms by year 3 paid 6 months of slash-migration cost. Foundation ODR should record the reopening trigger ("at scale criterion X, revisit hash-vs-slash").

**Verdict: 9-0 HASH confirmed**; reopening trigger amendment adopted — "if any single ontology file exceeds [WG-named threshold; suggested: 1,000 terms in active dereference traffic OR named consumer requesting per-term content negotiation], the hash-vs-slash deliberation is revisited."

**Knublauch DA status: WITHDRAWN** (reopening-trigger amendment adopted).

### Q2 — Layer-segregated naming

**Positions:**

- **Hendler:** URI-pattern legibility is good Web design; enforcement-via-review (no per-layer prefix machinery).
- **Allemang:** Concur with naming convention via Council review; *Working Ontologist* Ch. 12 — discipline that lives only in a style guide degrades inside six months.
- **Kendall+Davis:** Concur. FIBO uses module-prefix layer separation (e.g. `fibo-fnd-rel-rel:`); OPDA at flat-namespace scale uses CamelCase Kind/Role distinction with role-name-not-`<X>Role`-suffix.
- **Baker+Pandit:** Endorse with one-line addition: layer signal verified by `odr-review` lint against the `kind: pattern` UFO commitment of the originating ODR.
- **Gandon+Guizzardi:** Endorse. Per A9 §Per-kind discipline, the UFO commitment lives in ODR-0005 (`pattern`); ODR-0004 just encodes how the URI labels it.
- **Cagle:** Concur with Pandit's amendment.
- **Knublauch (DA):** Concur with Hendler enforcement-via-review framing **conditional on `odr-review` lint specification landing with Foundation TBox** ([knublauch-da.md Q2](./session-004-pdtf-ontology-foundation/knublauch-da.md)): "the lint reads `## Rules` from every `kind: pattern` ODR, extracts (UFO category, class URI) pairs, and verifies the URI's CamelCase form vs the layer convention (Sortal/Kind = CamelCase noun; Role = `<Kind>Role` or noun-ending-in-`-er`; Phase = `<Kind>In<State>`; Relator = relator-noun)."

**Verdict: 9-0 ENDORSE Rule 2 as drafted** with Pandit's `odr-review` lint hook and Knublauch's lint specification. The lint update is flagged for the next `odr-review` skill release (consistent with the A9 amendment's deferred `odr-review` Lint 4 update).

**Knublauch DA status: WITHDRAWN** (lint specification adopted as a deferred follow-up).

### Q3 — Three-graph separation — DEPTH

**Positions:**

- **Hendler+Allemang ([allemang-hendler.md Q3](./session-004-pdtf-ontology-foundation/allemang-hendler.md)):** Separation IS the discipline. Build-step graph-union; `sh:targetClass` not `owl:imports`; advisory annotations keyed to shape IRIs (S001 Q5).
- **Kendall ([kendall-davis.md Q3](./session-004-pdtf-ontology-foundation/kendall-davis.md) — DEPTH):** FIBO Production reasoning profile precedent. Three artefacts: `foundation.ttl` (class graph), `foundation-shapes.ttl` (shapes), `foundation-annotations.ttl` (advisory). Validator input = class ∪ shapes (concatenation; no `owl:imports`). The third graph (advisory) is the load-bearing separation FIBO learned the hard way.
- **Davis:** Concur with build-step composition; runtime `owl:imports` added operational fragility BBC/data.gov.uk never tolerated.
- **Baker+Pandit:** Endorse with Singapore Framework framing. Pandit's amendment: "consumers materialising the three graphs as one for query MUST document the union as a query-time view, not as the canonical model theory."
- **Gandon (Queen) ([gandon-guizzardi.md Q3](./session-004-pdtf-ontology-foundation/gandon-guizzardi.md) — DEPTH):** This is W3C composition methodology, not OPDA invention. SHACL Core §6.5 — `sh:targetClass` is the only relation between shapes and class graphs. Mixing graphs = SHACL-1.0-era mistake. Composition discipline (`sh:targetClass` not `owl:imports`) is the discipline that prevents closed-world cardinality leaking into open-world reasoning.
- **Guizzardi:** Three-graph separation maps to UFO class/instance/Mode separation (Guizzardi 2005 Ch. 4).
- **Cagle ([cagle.md Q3](./session-004-pdtf-ontology-foundation/cagle.md) — DEPTH):** S004 must fix the **annotation-graph keying rule** (his S001 Q5 dissent loss to discharge). Three falsifiable SPARQL tests: `ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` MUST return false; `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` MUST return false; `SELECT ?hint WHERE { GRAPH opda:annotations { opda:PropertyShape opda:aiHint ?hint } }` MUST return the hints. Validator MUST NOT fire on annotation-graph content.
- **Knublauch (DA) ([knublauch-da.md Q3](./session-004-pdtf-ontology-foundation/knublauch-da.md) — PRIMARY ATTACK):** TopBraid customer evidence — three failure modes for "separation as authoring discipline": (1) consumer `owl:imports` class graph because they need hierarchy materialised; (2) build-step graph-union becomes a runtime artefact and runtime tooling can't distinguish `sh:count` from `owl:cardinality` in a merged graph; (3) annotation graph leaks (TopBraid customers want AI hints alongside SHACL property shapes). **Demand:** concrete runtime materialisation rule — three source graphs (`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) as canonical artefacts + three derived consumer profiles (`opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`) as build-step views; **five-part CI test**; shapes graph carries `void:dataDump` / `opda:targetsClassGraph` version-pointer to its target class graph.

**Synthesis adopts Knublauch's full operational specification** (build-step source-graphs / derived-consumer-profiles model is the FIBO Production-profile pattern Kendall cites; the five-part CI test makes the separation mechanically reviewable; Cagle's three annotation-graph SPARQL tests are folded in):

**Three source graphs** (canonical artefacts, Council-ratified):

| Artefact | Contents |
|---|---|
| `opda-classes.ttl` | OWL/RDFS class graph: `owl:Class`, `rdfs:subClassOf`, `owl:DatatypeProperty`/`ObjectProperty`, `rdfs:domain`/`range`, `rdfs:label`/`skos:prefLabel`/`skos:definition`. **No `sh:` triples.** |
| `opda-shapes.ttl` | SHACL shapes: `sh:NodeShape`/`sh:PropertyShape` with `sh:targetClass`/`sh:path`/`sh:datatype`/`sh:minCount`/etc. **No `owl:Class` or `owl:imports` triples; no advisory annotations.** |
| `opda-annotations.ttl` | Advisory graph: `opda:aiHint`, `opda:uiHint`, `opda:exampleValue`, `dct:source`, generator notes, **keyed by shape/class IRI via `dct:relation` or `opda:appliesTo`**. **No `sh:` triples; no `owl:Class` triples.** |

**Three derived consumer profiles** (generated by build step, never hand-edited):

| Profile | Composition | Consumed by |
|---|---|---|
| `opda-validation.ttl` | `opda-classes.ttl` ⊕ `opda-shapes.ttl` | SHACL validators |
| `opda-ui.ttl` | `opda-classes.ttl` ⊕ `opda-shapes.ttl` ⊕ `opda-annotations.ttl` | Form generators / LLM UIs |
| `opda-inference.ttl` | `opda-classes.ttl` alone | OWL reasoners |

**Five-part CI test (build fails on any):**

1. `ASK { GRAPH opda:annotations { ?s ?p ?o . FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) } }` — MUST return false.
2. `ASK { GRAPH opda:shapes { ?s owl:imports ?g } }` — MUST return false.
3. `ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` and equivalent for the advisory-predicate whitelist — MUST return false.
4. `SELECT ?c WHERE { ?s sh:targetClass ?c . FILTER NOT EXISTS { GRAPH opda:classes { ?c a owl:Class } } }` — MUST return empty.
5. Consumer-profile artefacts have no commits outside the build-pipeline service account.

**Shapes-graph version-pointer:** `<opda-shapes> opda:targetsClassGraph <opda-classes-version-IRI>`. A consumer loading mismatched versions gets a documented mismatch warning, not silent inconsistency.

**Session 001 Q5 carry preserved** ([knublauch-da.md §Tie-back](./session-004-pdtf-ontology-foundation/knublauch-da.md)): annotation graph + `opda:ValidationContext` reification. Reification commitment is **routed to ODR-0010 / ODR-0013** as a downstream `pattern`-extraction candidate per A9's artefact identity test — `opda:ValidationContext` is re-instantiable across profile artefacts and would be the canonical `pattern` extraction from the shared SHACL profile machinery.

**Verdict: 9-0 ADOPT three-graph separation** with the operational specification (source graphs + derived profiles + five-part CI test + shapes-graph version-pointer + annotation-graph SPARQL tests).

**Knublauch DA status: WITHDRAWN** (all three withdrawal conditions met — concrete materialisation rule + five-part operational test + shapes-graph version-pointer to target class graph).

### Q4 — Term-sourcing precedence — DEPTH

**Positions:**

- **Baker (DEPTH — [baker-pandit.md Q4](./session-004-pdtf-ontology-foundation/baker-pandit.md)):** DCMI Usage Board admission test discipline. Four-part: provenance attribution; conflict-recording-in-Change-Log; external-spec-wins-but-loser-preserved-as-`skos:note`; glossary is ubiquitous-language authority within OPDA.
- **Pandit (DEPTH):** Refine to four-line precedence — W3C spec > regulatory/trust-framework authority > business glossary > schema text (DPV governance pattern).
- **Allemang+Hendler:** Endorse Rule 7 + Allemang's "glossary wins over data-dictionary divergence" tie-break.
- **Kendall (DEPTH — [kendall-davis.md Q4](./session-004-pdtf-ontology-foundation/kendall-davis.md)):** FIBO MTP Ch. 4 (Term Provenance) names the precedence rule verbatim. Worked examples — `opda:Issuer` (W3C VCDM 2.0 wins); `opda:TrustFramework` (glossary wins); `opda:LEI` (ISO 17442 wins).
- **Davis:** data.gov.uk linked-data cookbook §2 precedent. Conflicts recorded; departmental refinement as glossary extension never as redefinition.
- **Gandon+Guizzardi:** Endorse Rule 7 with one Guizzardi caveat — W3C label conflicts with OPDA ubiquitous language recorded via `skos:altLabel`.
- **Cagle:** Endorse + AI-RDF clarification — `dct:source` URI resolves to authoritative source (W3C URL / GDPR Article URL / glossary row URL), **not** project-internal mirror; mirror sits behind `dct:isReferencedBy`.
- **Knublauch (DA — [knublauch-da.md Q4](./session-004-pdtf-ontology-foundation/knublauch-da.md) — PRIMARY):** **Demand five-line precedence** — W3C-spec > OPDA Trust Framework > other regulatory authorities (as `skos:scopeNote`, not authoritative) > project glossary (for project-internal terms; project-contextual-note over W3C/regulatory terms) > schema text. Conflict-recording protocol per Baker's DCMI pattern. `dct:source` URIs pin **version IRIs** of W3C specs (e.g. `https://www.w3.org/TR/2020/REC-shacl-20170720/#NodeShape`), not generic IRIs that redirect.

**Synthesis adopts the five-line precedence** (Knublauch's five-line refinement of Pandit's four-line refinement of Baker's three-line; OPDA Trust Framework is separated from "other regulatory authorities" because they have different epistemic status):

> **Term-sourcing precedence** (Rule 7 refined):
>
> 1. **W3C / external spec** (where the term originates from a W3C, OMG, ISO, IETF, or equivalent standards-body spec). Authoritative.
> 2. **OPDA Trust Framework** (authoritative within OPDA's scope; treated as W3C-equivalent for terms the TF defines).
> 3. **Other regulatory authorities** (FCA, ICO, HMLR, EU eIDAS, etc.). **Contextual, not authoritative** — recorded as `skos:scopeNote` or `skos:closeMatch`, not as the term's primary definition.
> 4. **OPDA business glossary** (project-internal ubiquitous language for project-internal terms; project-contextual-note via `skos:scopeNote` for W3C/regulatory-imported terms).
> 5. **Schema-leaf annotation** (data-dictionary canonical leaf path; supplies `rdfs:comment` and datatype constraints; lowest-trust definition layer).

**Conflict-recording protocol:** every term-sourcing conflict produces a `## Change log` row in the consuming module ODR (per ODR-0002 §Change log discipline from S002 Q3 retirement framing). Row records: conflicting sources, verbatim conflicting definitions, Council-attributed resolution, rejected definition preserved as `skos:note`/`skos:scopeNote` (Baker's "loser is preserved" rule).

**`dct:source` URI discipline:** for W3C-spec terms, the URI pins the version IRI (e.g. `https://www.w3.org/TR/2020/REC-shacl-20170720/#NodeShape`); generic IRIs that redirect to "latest" are forbidden. AI-RDF concern (Cagle): `dct:source` resolves to authoritative source, never project-internal mirror; mirrors sit behind `dct:isReferencedBy`.

**Verdict: 9-0 ADOPT five-line precedence** with conflict-recording protocol + version-IRI pinning + authoritative-source `dct:source` discipline.

**Knublauch DA status: WITHDRAWN** (five-line precedence with OPDA TF separated from "other regulatory" as `skos:scopeNote`; glossary scoped to project-internal terms; conflict-recording protocol specified).

### Q5 — Generator-first policy — DEPTH

**Positions:**

- **Allemang (DEPTH — [allemang-hendler.md Q5](./session-004-pdtf-ontology-foundation/allemang-hendler.md)):** S001 Q1 amendment landing. Operational spec: generator input = `data-dictionary-canonical.json`; location = `tools/generator/`; runner = `npm run ontology:generate`; output = `foundation.ttl` (tracked); intermediates gitignored.
- **Hendler:** Concur with web-architecture caveat — generator MUST be deterministic; `owl:versionIRI` carries both ontology version AND generator version.
- **Davis (DEPTH — [kendall-davis.md Q5](./session-004-pdtf-ontology-foundation/kendall-davis.md)):** BBC `/programmes/` PIPS precedent. Three operational disciplines: output checked into version control; generator human-edited but output not; generator handles mechanical, humans handle ambiguous.
- **Kendall:** Concedes FIBO ontology-IDE-driven authoring underdelivers for OPDA's 935-annotated-leaf mechanical half; generator-first is correct.
- **Baker+Pandit:** Endorse + Pandit operational addition — generator spec at named path (`source/03-standards/ontology/generator/`); input format documentation; runner version pin; CI regenerate-and-diff hook.
- **Gandon+Guizzardi:** Concur with operational shape; deterministic generator + version-pinned input = reproducible output.
- **Cagle (DEPTH — [cagle.md Q5](./session-004-pdtf-ontology-foundation/cagle.md)):** Four-part operational test — `diff <(gen input) <(gen input)` returns empty; output matches committed reference fixture; adding one dictionary comment produces exactly one `rdfs:comment` diff (diff-explosion canary); adding one dictionary leaf produces exactly one new `DatatypeProperty` block.
- **Knublauch (DA — [knublauch-da.md Q5](./session-004-pdtf-ontology-foundation/knublauch-da.md) — PRIMARY):** TopBraid customer evidence — generator output drift through dependency updates is the operational killer; non-deterministic emission produces unreviewable diffs. **Demand three operational specifications:** (1) deterministic ordering rule (lexicographic-by-URI; predicates ordered with `rdf:type` first; blank-node skolemisation by SHA-256 of content; prefix-decl alphabetical; normalised whitespace); (2) generator version recorded in `owl:versionIRI` lineage + `owl:versionInfo` + `opda:generatorVersion`; (3) CI byte-identity test (not "reviewable diff" — fails on any byte difference).

**Synthesis adopts Knublauch's three operational specifications** integrated with Cagle's four-part test (Cagle's tests operationalise Knublauch's deterministic-ordering demand):

> **Rule 6 refined — Generator-first with operational reproducibility:**
>
> The mechanical half (named slot → `opda:` `DatatypeProperty` with `xsd:` range from the data dictionary) is generated, not hand-authored. The generator MUST satisfy three operational disciplines:
>
> 1. **Deterministic emission ordering.** Triples emitted in canonical order: `owl:Class` declarations alphabetised; then `owl:DatatypeProperty` alphabetised; then `owl:ObjectProperty` alphabetised; then `sh:NodeShape`/`sh:PropertyShape` alphabetised. Within-term order: `rdf:type` first, `rdfs:label` second, `rdfs:comment` third, then predicate-specific triples lexicographic. Blank nodes skolemised by SHA-256 of canonical N-Triples form. Prefix declarations alphabetised. Whitespace and line endings normalised (LF; no trailing spaces; no BOM; final newline). Source: TopQuadrant SPIN-to-SHACL canonicalisation; RDF 1.1 Concepts §1.5's unordered-triples framing does NOT excuse non-deterministic serialisation.
> 2. **Generator version recorded.** Output's `owl:Ontology` header carries `owl:versionIRI` (increments on every generator-version change OR schema-driven change), `owl:versionInfo` (human-readable), and `opda:generatorVersion` (machine-readable; e.g. `"opda-gen-1.4.2"`).
> 3. **CI byte-identity test.** Build pipeline: `opda-gen --input <dictionary> --output /tmp/regen/ && diff -r --brief source/03-standards/ontology/ /tmp/regen/ && test $? -eq 0 || exit 1`. CI fails on any byte difference. Reviewable PR diff is the consequence, not the primary check.

**Plus four sub-tests** (Cagle's operational test — falsifiable per regeneration):

1. `diff <(gen input) <(gen input)` returns empty.
2. `sha256sum $(gen input) == sha256sum tests/generator/foundation-expected.ttl`.
3. Mutate dictionary by adding one comment → diff is exactly one `rdfs:comment` change (diff-explosion canary).
4. Mutate dictionary by adding one leaf → diff is exactly one new `opda:DatatypeProperty` block.

**Generator is three-graph-aware** (per Knublauch's Q3 procedural P1): emits three separate output files (`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) from one input source; build pipeline composes the three derived consumer profiles.

**Verdict: 9-0 ADOPT generator-first with operational reproducibility** (deterministic ordering + version-pin + byte-identity CI + three-graph-aware emission).

**Knublauch DA status: WITHDRAWN** (all three operational specifications + byte-identity CI adopted).

### Q6 — Diagnostic-exemplar policy

**Positions:** All voices concur with S001 Q1 amendment (three canonical exemplars: registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split). Operational refinements:

- **Allemang+Hendler+Gandon+Guizzardi+Cagle+Baker+Pandit+Kendall+Davis:** Storage at `source/03-standards/ontology/exemplars/`; descriptive kebab-case filenames; not in TBox build; cited from ODR-0005 `## Rules` by path.
- **Pandit amendment:** Citation carries path AND one-line description of the named hard case.
- **Knublauch (DA — [knublauch-da.md Q6](./session-004-pdtf-ontology-foundation/knublauch-da.md)):** Two operational additions — (a) exemplar storage path explicitly in the parent OPDA repo, **not** the nested `schemas/` git sub-repo (per the [OPDA memory note](../../../../../.claude/projects/-Users-henrik-source-opda/memory/opda-schemas-nested-repo.md) on nested sub-repos); (b) each exemplar TTL paired with `expected-report.ttl` (a `sh:ValidationReport` the exemplar should produce) so the exemplar is a CI regression test, not just documentation.
- **Kendall:** FIBO test-suite filename-as-documentation discipline. **Davis:** small files (under 50 lines) read like worked examples.

**Verdict: 9-0 ADOPT three-exemplar set** with the operational additions (storage in parent OPDA repo, not nested schemas sub-repo; paired with `expected-report.ttl` for CI regression; filename-as-documentation; small self-contained files).

**Knublauch DA status: WITHDRAWN** (storage-path-in-parent-repo + `expected-report.ttl` pairing adopted).

### Q7 — Namespace string + version scheme — DEPTH; SUBSTANTIVE

**Positions on namespace string:**

- **Davis+Kendall+Cagle+Gandon+Guizzardi+Allemang+Hendler:** **`https://opda.uk/ns/`** — institutional namespace. OPDA owns the domain; FIBO publisher-owns-namespace discipline; institutional outlasts programme.
- **Baker+Knublauch (DA):** Recommend **`https://w3id.org/opda/`** be considered as an alternative — W3C PICG persistence guarantee; survives consortium re-brand; lowest coupling. DPV-symmetric option.
- **None** champions `https://trust.propdata.org.uk/ontology/` (rejected on programme-namespace-coupling grounds — programme outlives consortium re-branding only with aggressive 301 maintenance).

**Knublauch DA — PRIMARY DEMAND:** namespace string is a **blocker** on Foundation TBox `status: accepted`. DPV precedent — namespace switch (slash→hash 2019) took 6 ecosystem-months. TopBraid customer evidence — namespace re-pointing is catastrophic; consumer-discovery problem is unsolvable (the open web means complete consumer enumeration is impossible). Until WG ratifies, ODR-0004 stays `status: proposed`; downstream module ODRs are blocked on Foundation acceptance.

**Positions on version scheme:**

- **Gandon+Pandit+Guizzardi+Davis+Kendall+Baker+Hendler+Allemang+Cagle:** Calendar versioning on `owl:versionIRI` for Foundation (`opda.uk/ns/2026-q3`); semantic versioning permitted for stabilised modules (per FIBO release-manifest pattern + DPV per-module independence).
- **Knublauch:** Concur on calendar+semver split; conditional on Q7 primary demand.

**Synthesis adopts:**

1. **Namespace recommendation: `https://opda.uk/ns/`** as primary (institutional namespace; 7 voices). **`https://w3id.org/opda/`** recorded as named alternative the WG must consider (W3C PICG persistence guarantee; 2 voices including DA — strong recommendation).
2. **Namespace-as-blocker (Knublauch DA primary):** ODR-0004 cannot move `status: proposed` → `status: accepted` until the WG ratifies the namespace string. Downstream module ODRs (ODR-0005, ODR-0006, ODR-0008, etc.) carry `depends-on: [ODR-0004]` and inherit the block. Until ratification, generator output carries `dct:status "draft"` triple in the ontology header (no consumer can mistake pre-ratification TTL for authoritative). The WG decision is the gating event for the programme.
3. **Versioning:** Calendar (`owl:versionIRI = opda:.../<year>-q<quarter>`) for Foundation; semantic versioning permitted for stabilised modules at module-ODR discretion. Release manifest pattern (FIBO precedent) — each release publishes a manifest enumerating module versions.
4. **Consumer-discovery mitigation:** publish `dct:replaces` / `dct:isReplacedBy` chain from the moment the namespace is committed; until ratified, no such chain exists, which is precisely why ratification cannot wait.

**Verdict: 9-0 RECOMMEND namespace `opda.uk/ns/` + `w3id.org/opda/` recorded as named alternative + namespace-as-blocker discipline + calendar/semver split.** Knublauch DA primary demand adopted in full.

**Knublauch DA status: WITHDRAWN** (namespace-as-blocker; `w3id.org/opda/` recorded as operationally-strongest candidate).

## Synthesis

**Seven questions land 9-0 with full Knublauch DA withdrawal.** No held dissents on any question. The Foundation gate clears.

The session's substantive output is the conversion of ODR-0004 from **policy statement** to **deployment-survivable contract**. Five operational specifications added inline:

1. **Q3** — three source graphs + three derived consumer profiles + five-part CI test + shapes-graph version-pointer + annotation-graph SPARQL tests.
2. **Q4** — five-line term-sourcing precedence + conflict-recording protocol + `dct:source` version-IRI pinning + authoritative-source discipline.
3. **Q5** — deterministic generator ordering + version-pin in `owl:versionIRI` lineage + CI byte-identity test + diff-explosion canary tests + three-graph-aware emission.
4. **Q6** — exemplar storage in parent OPDA repo (not nested `schemas/`) + `expected-report.ttl` pairing for CI regression.
5. **Q7** — namespace-as-blocker on Foundation TBox publication + `w3id.org/opda/` recorded as named alternative + calendar/semver split.

Three operational additions remain as deferred follow-ups:
- **Q2** — `odr-review` lint specification for URI-shape verification against `kind: pattern` UFO commitments (consistent with the A9 amendment's deferred Lint 4 update — both flagged for the next `odr-review` skill release).
- **Q1** — hash-vs-slash reopening trigger threshold (WG names the specific scale criterion).
- **Q7** — WG ratification of the namespace string (the blocker on `status: accepted`).

**Session 001 Q5 carry preserved verbatim:** annotation graph + `opda:ValidationContext` reification. The reification commitment is routed to **ODR-0010** and **ODR-0013** as a `pattern`-extraction candidate per A9's artefact identity test — `opda:ValidationContext` is re-instantiable across profile artefacts and qualifies for extraction to its own `kind: pattern` ODR (likely as part of ODR-0010's overlay-mechanism ratification).

**Cross-references to ODR-0001 / ODR-0002 amendments (this conversation):**

- ODR-0001 A9 §What an ODR records — confirms ODR-0004 (`kind: architecture`) is the relaxed regime. The layer-segregated naming (Q2) labels Kind/Role distinctions; the commitment lives in ODR-0005 (`kind: pattern`), cited via `implements`.
- ODR-0002 §Reference-not-import (normative) — the three-graph separation (Q3) is the intra-OPDA application of the same discipline. Shapes graph references class graph via `sh:targetClass` (`reference-only` adoption mode); no `owl:imports` (per ODR-0002 MUST).

**Termination-signal evaluation** (plan §5 signals 3–6):

- Signal 3 (no duplicate constraint authoring) — N/A (no ontology constraints).
- Signal 4 (≤3-ODR consumer-query traversal) — supported: the three derived consumer profiles (validation / UI / inference) bound the query traversal at 1 file per consumer.
- Signal 5 (ODR-0003 diff stops moving after Phase 1 closes) — Phase 1 is now closing with S004 acceptance; the next sessions enter Phase 2 (S005 Identity crux gate).
- Signal 6 (PII never accretes silently) — preserved via Pandit's Q4 amendment routing DPV concerns to ODR-0012 and the `slice-import` discipline.

**Pilot retire-or-extend evaluation:** N/A (S004 is not a pilot; `consensus-mode: agent-fan-out`).

**Downstream record impact:**

- **ODR-0004** amended in-place: frontmatter `council: session-001` → `session-004`; new operational subsections (three-graph operational specification; generator operational disciplines; term-sourcing five-line precedence + conflict protocol; exemplar pairing); new `## Consequences` entries on namespace-as-blocker and `w3id.org/opda/` alternative.
- **Status:** ODR-0004 stays `status: proposed` per Knublauch DA's primary demand — moves to `accepted` when WG ratifies the namespace string. This is the documented gating event for the programme.
- **Plan §5 Phase 1:** ODR-0004 has cleared the Council gate substantively; the formal Phase-1 close (and unblocking of S005 / S015 / module sessions) awaits WG namespace ratification.
- **Adoption record:** track-record row added for Session 004.

**Open items for Session 004b** (Author-only follow-up):

- WG namespace ratification — when delivered, 004b moves ODR-0004 to `status: accepted` and updates the namespace string in all relevant places (ontology header template, generator output, downstream `depends-on` references).
- WG hash-vs-slash reopening-trigger threshold — if WG names a concrete criterion (1,000 terms? 10,000 triples?), 004b records it in ODR-0004 Rule 1.

## ODR-0004 amendment summary

The amendments below land in ODR-0004:

1. **Frontmatter:** `council: session-001` → `session-004`; `status: proposed` retained (per Knublauch DA Q7 namespace-as-blocker primary demand).
2. **Rule 3 expanded** — three-graph operational specification (source graphs + derived consumer profiles + five-part CI test + shapes-graph version-pointer + annotation-graph SPARQL contract).
3. **Rule 6 expanded** — generator operational disciplines (deterministic ordering + version-pin + CI byte-identity + diff-explosion canary tests + three-graph-aware emission).
4. **Rule 7 expanded** — five-line precedence + conflict-recording protocol + `dct:source` version-IRI pinning + authoritative-source rule.
5. **Rule 8 expanded** — exemplar storage in parent repo (not nested `schemas/`); `expected-report.ttl` pairing for CI regression; filename-as-documentation discipline.
6. **New `## Consequences` entries:** namespace-as-blocker on `status: accepted`; `w3id.org/opda/` recorded as named alternative; downstream module ODRs inherit the namespace-string block.
7. **References updated:** Session 004 transcript added; deferred follow-ups recorded (WG namespace ratification; hash-vs-slash reopening-trigger threshold; `odr-review` lint specification).

## References

- [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) (the record amended by this session).
- Position files (per ODR-0001 §Session protocol rule 9 — Queen composes, does not fabricate):
  - [baker-pandit.md](./session-004-pdtf-ontology-foundation/baker-pandit.md) — governance-pair.
  - [allemang-hendler.md](./session-004-pdtf-ontology-foundation/allemang-hendler.md) — pragmatic-pair.
  - [kendall-davis.md](./session-004-pdtf-ontology-foundation/kendall-davis.md) — enterprise-pair.
  - [gandon-guizzardi.md](./session-004-pdtf-ontology-foundation/gandon-guizzardi.md) — formal-pair (Gandon as Queen).
  - [cagle.md](./session-004-pdtf-ontology-foundation/cagle.md) — shacl-solo.
  - [knublauch-da.md](./session-004-pdtf-ontology-foundation/knublauch-da.md) — DA (extended panel).
- [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) — A9 amendment (2026-05-27).
- [ODR-0002 §Reference-not-import (normative)](../ODR-0002-ontology-language-adoption.md) — S002 Q4 amendment (2026-05-27).
- [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q1 / Q3 / Q5 / Q7 — substantive precedents.
- [Council follow-up sessions plan](../../../plan/council-followup-sessions.md) §4 Session 004 blueprint; §5 Phase 1 gate.
- [OPDA adoption record §Track Record](./adoption.md#track-record) — updated by this session.
- **Cited grounding:** W3C TAG "Hash vs Slash" Note (Berners-Lee & Connolly eds. 2008); *Cool URIs for the Semantic Web* (Sauermann & Cyganiak 2008); "Cool URIs Don't Change" (Berners-Lee 1998); RDF 1.1 Concepts §1.5; SHACL Core §6.5 (Knublauch & Kontokostas eds. 2017); Linked Data Principles (Berners-Lee 2006; Heath & Bizer 2011); FIBO Modelling Team Process Chs. 4, 5, 6; *Working Ontologist* 3rd ed. Chs. 3, 6, 8, 12, 13 (Allemang, Hendler, Gandon 2020); GRDDL Rec (Gandon & Hawke eds. 2007); BBC `/programmes/` ontology (Raimond, Smethurst, McParland 2009); data.gov.uk linked-data cookbook (Davis 2010s); DPV 2.0 Specification (Pandit et al. 2024); DCMI Namespace Policy (Baker, Bechhofer, Isaac, Miles 2013); Singapore Framework (Nilsson, Baker, Johnston 2008); Guizzardi 2005 *Ontological Foundations for Conceptual Modeling* Ch. 4.
