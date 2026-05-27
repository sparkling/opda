# Knublauch (DA) — Position on S004

## DA stance summary (≤100 words)

Attack-axis: does each Foundation rule survive operational SHACL deployment at scale? TopBraid customer governance has seen every operational failure-mode of the three-graph pattern, generator drift, and namespace re-pointing. My Session 001 Q5 carry (overlay profiles as SHACL profile graphs; `opda:ValidationContext` reification) stands — but ODR-0004 trades it for authoring-discipline language that may not survive runtime. Primary attacks: Q3 needs a concrete runtime materialisation rule; Q5 needs deterministic-ordering + version-pin + byte-identity CI test; Q7 needs the namespace string as a *blocker* on TBox publication, not a deferred WG conversation. Q1, Q2, Q4, Q6: lighter press, conditional concur.

## Framing — the operational-test lens

ODR-0004 is a well-aimed *policy* document. As the SHACL spec co-author and the TopQuadrant lead on shapes-deployment governance for fifteen years, I am sympathetic to every rule in the draft *as a policy statement*. My role as DA is not to dispute the policies — it is to ask the question the policies don't ask of themselves: *does this rule survive what consumers do with the artefact in production?* That question has three operational sub-tests I apply to every rule:

1. **Build vs runtime cut.** Does the rule specify *when* it is enforced — at authoring time, build time, or runtime? Authoring-time rules (e.g. "minted URIs follow the layer-segregated convention") are review-discipline only. Build-time rules (e.g. "the generator emits three separate output graphs") are mechanically enforceable. Runtime rules (e.g. "consumers MUST NOT treat the union as model theory") need a *who-enforces-it* answer. Most of ODR-0004's rules are stated as authoring-time; the operational sub-tests below ask whether they need build-time or runtime backing.

2. **One-way-door test.** Does the rule create a commitment that cannot be reversed once consumers depend on the artefact? Namespace strings, URI shapes, and prefix bindings are one-way doors. Once published, retraction is *expensive* (DPV's slash → hash switch took 6 ecosystem-months); silent breakage is *catastrophic* (TopBraid customers have lost downstream consumers they didn't know about). One-way-door rules deserve more deliberation than reversible ones.

3. **Diff-readability test.** Can a reviewer reading the artefact's diff in a PR tell whether a change is substantive or noise? If not, the artefact is *operationally unreviewable*; the operational rule must produce diffs a reviewer can read. This is the test Cagle's Session 001 Q5 reproducibility concern was really asking — and the test ODR-0004 Rule 6 (generator-first) does not pass without my Q5 amendments.

Per-question attacks below apply these three sub-tests to each Foundation rule.

## Per-question DA attacks + withdrawal conditions

### Q1 — Hash vs slash namespace

Light attack. The textbook answer at OPDA's TBox size is hash — Baker is right that the Singapore Framework precedent applies and Pandit is right that DPV switched from slash to hash once the Core catalogue stabilised. Operational concern for the record: when the OPDA TBox scales beyond single-document size (Phase 4+ as new domains attach — agency, valuation, lender comms), the hash-vs-slash question reopens. A "small TBox" today is not a perpetual commitment. The Foundation ODR should record the *reopening trigger*: if any single ontology file exceeds (criterion: 1,000 terms? 10,000 triples? — WG names a threshold), the hash-vs-slash deliberation is revisited.

TopBraid customer pattern that illustrates this: a customer began with hash because the initial TBox was ~200 terms; by year 3 the TBox was ~8,000 terms and a single TTL file was 4 MB; consumers loading the file just to dereference one term were transferring 4 MB per request; content negotiation became the desired operational pattern but required slash URIs. Migrating from hash to slash at year 3 was a 6-month project. The lesson: hash-now-slash-later is *not* free; the cost is real; the reopening trigger should be agreed in writing now so the project doesn't paint itself into the corner later. This is consistent with the W3C TAG "Cool URIs for the Semantic Web" 2008 §4.4 caution — the recommendation is hash for small vocabularies, but the *small* qualifier is load-bearing.

**Withdrawal:** concur with hash for current scale; demand a recorded reopening trigger ("at scale criterion X, revisit hash-vs-slash"). Without the trigger, this is a one-way door — once published as hash, slash migration breaks every existing dereferencer.

### Q2 — Layer-segregated naming

Light attack. Hendler's enforcement-via-review answer is correct in principle — URI shape patterns cannot be enforced by SHACL itself (SHACL constrains *graph shape*, not *URI string structure*; this is intentional, per the SHACL 1.1 Recommendation §1 scope statement). But TopBraid customer experience: review-only enforcement is the failure mode. Modellers under deadline pressure mint `opda:SellerAgent` (Role) and `opda:Buyer` (also Role) without distinguishing them from `opda:Person` (Kind), and reviewers under the same deadline miss it. The operational fix is the *generator* (Rule 6): the generator's input format declares the UFO meta-category (Substance Kind / Role / Phase / Relator / Mode / Quality), the generator emits the URI under the layer-appropriate convention, and human-authored URIs are the exception requiring per-term review.

Pandit's amendment ("the layer signal is verified by the `odr-review` lint against the `kind: pattern` UFO commitment of the originating ODR") is the right framing — but the lint needs to be specified, not asserted. **Specify**: the lint reads `## Rules` from every `kind: pattern` ODR, extracts (UFO category, class URI) pairs, and verifies the URI's CamelCase form vs the layer convention (Sortal/Kind = CamelCase noun; Role = `<Kind>Role` or noun-ending-in-`-er`; Phase = `<Kind>In<State>`; Relator = relator-noun like `Ownership`, `Tenancy`). Without the lint specification, Rule 2 is review-discipline-only. The DASH `dash:propertyRole` pattern (TopBraid customer convention for distinguishing display roles from semantic roles) is the operational precedent: DASH made the role visible in the property URI shape so form generators could distinguish identity-bearing roles from display roles without semantic inference; OPDA's UFO-layer signal is the same idea applied to Kind/Role/Phase/Relator distinctions.

**Withdrawal:** concur with Hendler enforcement-via-review framing, conditional on the `odr-review` lint specification (URI pattern verified against the originating `kind: pattern` ODR's UFO category) landing in the same skill release as the Foundation TBox publication.

### Q3 — Three-graph separation (PRIMARY ATTACK)

**Attack.** The panel will frame this as foundational discipline (Baker reaching for Singapore Framework; Pandit reaching for DPV SHACL profiles). The TopBraid deployment experience contradicts the framing in one specific way: separation works in *authoring*; it breaks in *runtime*. The SHACL 1.1 Recommendation does not specify how class-graph and shapes-graph are *delivered* to a consumer — that is intentional (separation of concerns) but it pushes the operational discipline into deployment teams who haven't seen the failure modes. Three failure modes I have personally remediated for customers:

1. **Consumer `owl:imports` the class graph because they need the hierarchy materialised for inference.** Loading the class graph standalone gives `owl:Class` declarations and `rdfs:subClassOf` chains. Loading the shapes graph standalone gives `sh:NodeShape` declarations with `sh:targetClass` references. The shapes graph references classes that aren't in its triple set — `sh:targetClass <opda:Property>` evaluates only if `opda:Property` is in the dataset under SHACL evaluation. The consumer has to either (a) load both graphs (defeating separation), (b) materialise the class hierarchy into the shapes graph at build time (the union-at-build pattern, which fragments responsibility for what's "in" the shapes graph), or (c) accept that SHACL validation runs against an incomplete class model (the silent-failure pattern: validation passes because the targets don't bind, the data is wrong but no violation is reported). I have shipped patches to TopBraid customer deployments for all three.

2. **The build-step graph-union pattern adds operational fragility.** If the rule is "consumers union the three graphs at build time", then *who runs the build step*? In TopBraid customer deployments, the build step is run by a CI job — but downstream consumers in production pull the *unioned* graph, not the three separate graphs. The separation becomes a build-time fiction; the runtime artefact is a single TBox-plus-shapes-plus-annotations graph. Pandit's amendment ("consumers MAY union for SPARQL but MUST NOT treat the union as model theory") restates the discipline; it does not specify *who enforces it*. In practice, the runtime tooling does not enforce the prohibition because the runtime tooling cannot distinguish a `sh:count` triple from an `owl:cardinality` triple in a merged graph — they are both `rdf:Property` predicates over the same subject. The operational rule needs to live one layer up: the *build pipeline* keeps the three graphs separate; the *consumer profile* (which is a derived view, not a canonical artefact) declares which graphs it unions.

3. **The advisory annotation graph leaks.** Cagle's `opda:aiHint` was exiled to the annotation graph in Session 001 Q5 (my carry, with Gandon's support). But: TopBraid customers who deploy LLM-driven UIs *want* the AI hints alongside the SHACL property shapes — the form generator reads `sh:order`, `sh:group`, `dash:propertyRole` *and* `opda:aiHint` in one pass. If the AI-hint graph is a separate artefact loaded only when the LLM-UI is active, that's two consumer profiles to maintain (LLM-active and LLM-absent). The operational rule should be: AI hints live in the *advisory* graph; the form-generator's loader is configured to include the advisory graph in its consumer profile; **the model theory remains separation** but the *loading profile* is consumer-declared. This is consistent with my Session 001 Q5 carry — the exile is *from the shapes graph*, not from every consumer's loader.

**Demand a concrete runtime materialisation rule.** The synthesis MUST commit to the following three operational specifications, because without them Rule 3 is authoring-discipline only and does not survive customer deployment:

- **Build-step graph-union is performed at build time, not runtime.** The build step (named in the ODR; runs in CI) produces three *source* artefacts:
  - `opda-classes.ttl` — the OWL/RDFS class graph alone: `owl:Class` declarations, `rdfs:subClassOf` chains, `owl:DatatypeProperty` / `owl:ObjectProperty` declarations, `rdfs:domain` / `rdfs:range`, `rdfs:label` / `skos:prefLabel` / `skos:definition`. No `sh:` triples.
  - `opda-shapes.ttl` — the SHACL shapes graph alone: `sh:NodeShape` and `sh:PropertyShape` declarations with `sh:targetClass`, `sh:path`, `sh:datatype`, `sh:minCount` / `sh:maxCount`, `sh:in` / `sh:hasValue`, `sh:nodeKind`, `sh:pattern`. No `owl:Class` or `owl:imports` triples; no advisory annotations.
  - `opda-annotations.ttl` — the advisory annotation graph alone: `opda:aiHint`, `opda:exampleValue`, future LLM-form-guidance predicates, all keyed to the shape IRIs in `opda-shapes.ttl` via `dct:relation` or `opda:appliesTo`. No `sh:` triples; no `owl:Class` triples.

  The build step also produces three *consumer profiles* as union views, derived from the source graphs:
  - `opda-validation.ttl` — `opda-classes.ttl` ⊕ `opda-shapes.ttl`; what a SHACL validator loads to evaluate data instances against the OPDA shapes.
  - `opda-ui.ttl` — `opda-classes.ttl` ⊕ `opda-shapes.ttl` ⊕ `opda-annotations.ttl`; what a form generator loads to drive UIs with display hints.
  - `opda-inference.ttl` — `opda-classes.ttl` alone; what an OWL reasoner loads to materialise the class hierarchy.

  The three source graphs are the *canonical* artefacts (the ones the OPDA Council ratifies); the three consumer profiles are *derived views* (generated by the build step, not hand-edited, regenerated on every Council-ratified change). This is the TopBraid customer pattern that works in production.

- **Operational test (mechanically reviewable in CI).** Five sub-tests; CI fails the build if any one fails:
  1. No `sh:` triples in `opda-annotations.ttl` (use SPARQL: `ASK { ?s ?p ?o . FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) }` — must return `false`).
  2. No `owl:imports` from `opda-shapes.ttl` to `opda-classes.ttl` (use SPARQL: `ASK { ?s owl:imports ?o }` in the shapes graph — must return `false`).
  3. No `opda:aiHint` (or other advisory predicate) triples in `opda-shapes.ttl` (use SPARQL filtered by the advisory-predicate whitelist).
  4. Every `sh:targetClass` in `opda-shapes.ttl` resolves to a class declared in `opda-classes.ttl` (use SPARQL: `SELECT ?c WHERE { ?s sh:targetClass ?c . FILTER NOT EXISTS { GRAPH <opda-classes> { ?c a owl:Class } } }` — must return empty).
  5. Consumer-profile artefacts (`opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`) are *generated* by the build, never hand-edited (verified by checking they have no commits outside the build-pipeline service account).

- **The shapes graph SHOULD declare which class-graph version it targets.** Pandit's `void:target` framing is right; specify it concretely: `<opda-shapes> void:dataDump <opda-classes> ; opda:targetsClassGraph <opda-classes-version-IRI>`. A consumer loading mismatched versions (e.g. loading `opda-shapes.ttl@1.0` against `opda-classes.ttl@2.0`) gets a documented mismatch via a missing-target warning, not a silent inconsistency where validation passes-by-default because targets don't bind.

**Withdrawal condition:** the synthesis produces (i) a concrete build-step rule producing three source graphs + three derived consumer profiles, (ii) the five-part operational test above stated explicitly, (iii) the shapes-graph version-pointer to its target class graph specified by name (`void:dataDump` or `opda:targetsClassGraph`).

**Held dissent text (if unmet):** "Three-graph separation is authoring-discipline only; runtime materialisation rule unspecified — TopBraid customer experience: this fails at scale. Consumers either silently union (defeating separation) or fail to load (silent SHACL incompleteness). Foundation ODR must commit to build-step + derived-profiles + operational test."

### Q4 — Term-sourcing precedence

**Attack.** Baker's "W3C > glossary > schema text" framing collapses a real operational fail mode. The TopBraid customer experience with DCAT deployments: the W3C spec defines `dcat:Distribution` with a particular property surface; the customer's internal glossary disagrees with one definition (a real case from a UK government deployment: the W3C `dcat:downloadURL` definition vs the customer's glossary "download endpoint"); the customer's data dictionary disagrees with both. ODR-0004 Rule 7 says W3C wins — but *which version of the W3C spec*? And what happens when the W3C spec is updated and the local glossary still reflects the old definition?

**Concrete OPDA example.** Consider `opda:Buyer` (a Role per ODR-0006). Three sources are potentially in play:
1. The OPDA business glossary defines `Buyer` as "the party acquiring beneficial title in a property transaction".
2. The PDTF schema text comment on the `buyer` slot in `pdtf-transaction.json` says "the party named in the contract of sale".
3. The W3C / regulatory ecosystem — `prov:Agent` is silent on Buyer specifically, but the FCA Consumer Duty rules define "Buyer" as "a retail customer purchasing property as a regulated activity" (which is narrower than the glossary).

Three sources, three definitions, all stable. ODR-0004 Rule 7 says "W3C > glossary > schema". But: the FCA Consumer Duty is a regulatory authority, not a W3C spec. Does the glossary still win? Pandit's amendment ("W3C > regulatory > glossary > schema") says no, FCA wins. But: is FCA Consumer Duty *normative* for OPDA, or is it *one of many regulatory regimes* the OPDA Trust Framework subordinates itself to? The OPDA Trust Framework is *itself* a regulatory regime (the trust framework's own definitions are normative within OPDA's scope). The four-line precedence becomes:

1. W3C / external spec (where the term originates from an external spec).
2. OPDA Trust Framework definitions (where the OPDA TF defines the term).
3. Other regulatory / industry authorities (FCA, ICO, HMLR, etc.) — *contextual*, recorded as `skos:scopeNote`, not authoritative.
4. OPDA business glossary (project-internal ubiquitous language for project-internal terms).
5. Schema text (data dictionary canonical leaf — `rdfs:comment` source).

This is *five* lines, not four. And the difference matters: the FCA Consumer Duty definition of `Buyer` is *contextually relevant* (the OPDA ontology consumer who is also an FCA-regulated entity needs the FCA mapping) but is NOT authoritative *over* the OPDA Trust Framework's own definition. The contextual relationship is recorded as `skos:scopeNote` or `skos:closeMatch`, not as the term's authoritative definition.

The deeper issue: **the glossary is a project-internal authority for project-internal terms**, not for terms imported from W3C specs. The glossary records the project's *preferred-label* and *contextual usage*; the *authoritative definition* of a W3C-spec term remains with the W3C spec. Conflating these in the precedence framing risks the operational case where the glossary is treated as authoritative on a term it does not own.

Pandit's amendment ("W3C > regulatory/trust-framework authority > business glossary > schema text") is a strengthening — and the four-line precedence is right. But the strengthening doesn't address my concern: the framing should be **clearer about *which* terms the glossary is authoritative over**. Concretely:

- For terms minted *under* the `opda:` namespace (project-internal Kinds, Roles, Phases, Relators, Modes): glossary is authoritative for `rdfs:label`, `skos:prefLabel`, `skos:definition`. The schema text contributes `rdfs:comment` and datatype constraints. No W3C spec applies (the term is `opda:`-local).
- For terms referenced *from* a W3C / regulatory / trust-framework spec (e.g. `cred:VerifiableCredential`, `prov:Agent`, `dcat:Dataset`, GDPR `data subject`, FCA Consumer Duty): the spec's definition is authoritative. The glossary records the project's *contextual usage note* (`skos:scopeNote`), not a replacement definition.
- For terms where a W3C spec and the project's glossary *disagree on label form* (W3C `dcat:Distribution`; glossary "data distribution" — same concept, different surface form): the W3C spec's `rdfs:label` wins; the glossary's preferred form becomes `skos:altLabel`.

**Demand a conflict-recording protocol** (Baker's DCMI Usage Board lead is the right precedent; specify it):

- Every term-sourcing conflict produces a `## Change log` row in the consuming module ODR (per ODR-0002 Session 002 Q3 retired-amendment-ODR pattern — apply the same discipline here).
- The conflict row records: (a) the conflicting sources, (b) the verbatim conflicting definitions, (c) the Council-session-attributed resolution, (d) the rejected definition preserved as `skos:note` or `skos:scopeNote` (Baker's "loser is preserved" rule).
- For W3C-spec terms: the W3C version IRI is pinned in the term's `dct:source` (e.g. `dct:source <https://www.w3.org/TR/2020/REC-dcat-3-20240122/#Class:Distribution>`); if the spec is updated, the OPDA term's `dct:source` update is a Council event.

**Withdrawal condition:** the precedence is recorded as a five-line form (W3C-spec > OPDA Trust Framework > other regulatory authorities as contextual > project-glossary > schema-text), with the OPDA TF separated from "other regulatory authorities" because they have different epistemic status — the TF is authoritative *within OPDA's scope*; other regulatory regimes are *contextual* and recorded as `skos:scopeNote` / `skos:closeMatch`. AND glossary is explicitly framed as authoritative *over project-internal terms* and as *project-contextual-note* over W3C-spec / regulatory-spec terms. AND a conflict-recording protocol per the Baker DCMI pattern is specified. (Pandit's four-line form is a fallback withdrawal condition: if the synthesis preserves only four lines, I withdraw on the four-line form provided the OPDA TF is the regulatory authority and "other regulatory" is recorded as contextual.)

**Held dissent text (if unmet):** "Term-sourcing precedence collapses W3C authority and glossary preferences into one layer; the operational fail mode (W3C vs glossary conflict on a W3C-owned term) is unspecified. Glossary is authoritative over project-internal terms, not over imported W3C / regulatory terms. Without the distinction, the four-line precedence is a hand-wave."

### Q5 — Generator-first policy (PRIMARY ATTACK)

**Attack.** Cagle's reproducibility concern in Session 001 Q5 was right and is undertreated in ODR-0004's "generator-first" framing: generator output drift is the operational killer. TopBraid customer experience: customers deploy SHACL profile generators in their CI; the profile passes tests in week 1; in week 4 the generator's underlying library auto-updates a tiny dependency (a YAML parser, a Turtle serialiser, an RDF library); the generator's output now differs in whitespace, prefix ordering, or term-emission sequence; the diff against the committed TTL produces 47,000 lines of "noise" change; the reviewer either (a) approves the diff blind (silent breaking change risk) or (b) rejects the diff (build broken; CI red for days while the team chases the regression). I have shipped TopBraid hotfixes for this exact pattern at three customers in the past five years; the root cause is always the same — non-deterministic emission ordering in the generator.

ODR-0004 Rule 6 ("the mechanical half is generated, not hand-authored") is correct as a *policy* but does not survive operational deployment without three additional commitments. Each is mechanically enforceable; none is mentioned in the draft:

1. **Deterministic ordering rule.** The generator MUST emit terms in a canonical order. TopQuadrant deployment standard:
   - **Term emission order**: lexicographic-by-URI (case-sensitive, byte-order, not locale-dependent). All `owl:Class` declarations first, alphabetised; then all `owl:DatatypeProperty`, alphabetised; then all `owl:ObjectProperty`, alphabetised; then all `sh:NodeShape`, alphabetised; then all `sh:PropertyShape`, alphabetised.
   - **Triple-within-term order**: stable on (predicate-URI, object-value) lexicographic; `rdf:type` triples always first, `rdfs:label` second, `rdfs:comment` third, predicate-specific triples thereafter.
   - **Blank-node naming**: skolemised by content hash (SHA-256 of the canonical N-Triples form of the blank node's outgoing triples), NOT by allocation order. This avoids the `_:b1` vs `_:b2` churn that breaks every regeneration.
   - **Prefix declaration order**: alphabetised by prefix string. `@prefix dct:` before `@prefix opda:` before `@prefix sh:`.
   - **Trailing whitespace and line endings**: normalised (no trailing spaces; LF line endings; no BOM; final newline at EOF).

   Without these rules, every regeneration produces a different byte sequence; diffs become unreadable; reviewers stop reading them; substantive changes pass silently. The RDF 1.1 Concepts §1.5 framing of "an unordered set of triples" does NOT excuse non-deterministic *serialisation* — the serialised TTL artefact is what consumers diff against. (RDF 1.2's triple-terms — coming via ODR-0002's Core-tier pin — extend this constraint to statement-level annotations: the annotation's identity is the annotated triple, which only survives stable serialisation.) The TopBraid SPIN-to-SHACL migration tool ships with exactly this canonicalisation; it is not novel research.

2. **Generator version-pin in `owl:versionIRI`.** The generator's version (semver: `opda-gen-1.4.2`) is recorded in two places:
   - The ontology header's `owl:versionInfo` literal (human-readable).
   - A dedicated `opda:generatorVersion` property on the `owl:Ontology` subject (machine-readable).

   The `owl:versionIRI` increments not just on schema-driven changes but on generator-version changes — because a generator-version change is potentially a semantic change to the emitted graph (a new datatype default, a changed prefix binding, an added `rdfs:comment` template, a corrected `xsd:` range mapping). Without this, two consumers loading the same `owl:versionIRI` may have received outputs from different generator versions; they cannot reconcile their behavioural differences against the version IRI; debugging is impossible. The DCMI lesson (Baker 2013) applies: the version IRI is a *commitment to byte-identical content* under that IRI; admit no drift.

3. **CI test for byte-identical output.** The CI hook is not "regenerate and diff against the committed TTL" (Pandit's amendment); it is "regenerate, byte-compare against the committed TTL, fail if non-identical". Pseudo-code:

   ```
   $ opda-gen --input source/00-deliverables/semantic-models/ --output /tmp/regen/
   $ diff -r --brief source/03-standards/ontology/ /tmp/regen/
   $ test $? -eq 0 || exit 1  # CI fails if any byte differs
   ```

   The byte-identity test enforces deterministic ordering and pins generator-version drift. Pandit's "diff reviewable in PR" formulation is too soft — it admits the failure mode where the reviewer waves through a non-substantive diff and misses an embedded substantive change. The CI test fails on *byte* difference, not on *triple* difference; this is intentional, because the artefact we publish is the TTL file, not the RDF graph behind it. If a contributor's PR regenerates with a different byte sequence, the CI surfaces it; the contributor either (a) updates the committed TTL alongside their PR (substantive change recorded) or (b) discovers their environment has a non-deterministic dependency that needs pinning (operational regression caught early).

Pandit's amendment ("the generator spec, input format, runner version pin, and CI regenerate-and-diff hook are version-controlled") is partially right — but version-pinning the *runner* without specifying *deterministic output* and *byte-identical CI test* leaves the operational fail mode open.

**Withdrawal condition:** Rule 6 amended to specify (i) deterministic emission ordering rule (lexicographic-by-URI with stable triple tie-break), (ii) generator version recorded in `owl:versionIRI` lineage (every generator-version change increments the version IRI), (iii) CI test enforces *byte-identical* output (not "reviewable diff"), with explicit failure of CI on any non-identity.

**Held dissent text (if unmet):** "Generator-first without operational reproducibility test is generator-first-in-name-only. The TopBraid-customer fail mode (silent generator drift through dependency updates; reviewer approval of unreadable diffs) is unspecified. Deterministic ordering + version-pin-in-versionIRI + byte-identity CI is the minimum operational floor."

### Q6 — Diagnostic-exemplar policy

Light attack; concur with Allemang's three-exemplar set (registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split). Baker's filename convention and Pandit's "cite by path AND named hard case" amendment are operationally correct. The TopBraid analogue (the test description set used in SHACL profile validation, per the SHACL 1.1 Recommendation §6.2 examples) is the same pattern: diagnostic instances exercise the shape graph against named hard cases without being part of the deliverable graph.

One small operational addition: the exemplar TTLs SHOULD be *executable* as SHACL validation tests in CI — that is, every exemplar TTL is paired with an `expected-report.ttl` file containing the `sh:ValidationReport` the exemplar should produce when validated against the shapes graph. Without this pairing, "the exemplar stresses IC over UPRN-split" is documentation; with it, the exemplar is a regression test against the IC discipline. This is consistent with the TopBraid customer pattern (shapes-as-tests; the test artefact is the validation report, not the data instance) and with DASH's test-case vocabulary (`dash:GraphValidationTestCase`).

One procedural concern (raised in the Procedural attacks section below): the exemplar storage path under `source/03-standards/ontology/exemplars/` interacts with the nested-git-repo structure of `source/03-standards/schemas/`. If `source/03-standards/ontology/` is a peer to `schemas/` (per the ODR-0004 References open-question), the exemplars directory is in the parent OPDA repo — and exemplar commits go through the OPDA review process, not the upstream schemas-repo review process. This needs an explicit statement.

**Withdrawal:** concur with three-exemplar set; demand (a) the exemplar storage path is explicitly stated as part of the parent OPDA repo (not the nested `schemas/` sub-repo), so exemplar commits flow through OPDA Council review, and (b) the exemplar TTL is paired with an `expected-report.ttl` recording the `sh:ValidationReport` the exemplar should produce, so the exemplar becomes a CI regression test, not just documentation.

### Q7 — Namespace string + version scheme (PRIMARY ATTACK)

**Attack.** ODR-0004 Rule 1 says "the literal base URI is WG-owned" — and the References section says "open questions (WG-owned)". This is a *one-way door* the ODR proposes to leave open. TopBraid customer experience with namespace re-pointing: it is *catastrophic*. Every published consumer (browser dereferencer; SPARQL endpoint; LD application; SHACL validator; downstream ontology importer) has the namespace string compiled into its configuration, its cached prefix bindings, its serialised RDF artefacts. Re-pointing requires every consumer to update — and consumers you don't know about (because they're external to your organisation, or were deployed years ago by a now-departed team) silently break. I have seen this kill three customer deployments: the customer changed a namespace string once, the change propagated through known consumers within a month, the unknown consumers were still failing eighteen months later, and the original engineer who decided the new namespace had left the project.

The DPV programme switched namespace once early (slash → hash; recorded in DPV §History) and it took 6 months for the ecosystem to catch up. The OPDA Foundation cannot afford that kind of churn — once consumers start dereferencing OPDA URIs, the namespace is *forever*.

Concretely: if ODR-0004 is published with `status: accepted` and contains "the namespace string will be decided later", the WG decision is *not* a parallel artefact-engineering choice — it is a *blocker* on every downstream consequence:

- ODR-0005 cannot publish `opda:Property` as a Foundation Kind until the namespace string is committed (the URI is `<namespace-base>opda:Property`; absent the base, the URI is provisional).
- ODR-0006 cannot publish `opda:Person`, `opda:Seller`, `opda:Buyer`; same reason.
- ODR-0010 cannot publish overlay profile graphs; the SHACL `sh:targetClass` references are against provisional URIs.
- ODR-0013 cannot publish SHACL validation graphs; same reason.
- The generator (Rule 6) cannot produce *publishable* TTL — it can only produce *draft* TTL pending namespace ratification.

The procedural fix: **the namespace string is a *blocker* on TBox publication**, not a deferrable open question. The ODR's "WG-owned" framing is correct *epistemically* (the WG owns the decision) but wrong *operationally* (the decision is required before any TBox can ship with `status: accepted`). The TopBraid customer pattern that works: the namespace is *the first* WG decision, before any term is minted, because every downstream commitment carries the namespace string in its URI. The synthesis should record:

- The Foundation ODR commits to *not* publishing the Foundation TBox under any `status: accepted` ODR until the WG ratifies the namespace string (one of the three candidates Baker enumerated, or a fourth the WG identifies).
- Until the WG ratifies, the TBox circulates as `status: proposed` only — and any TTL emitted by the generator carries a watermark / `dct:status "draft"` triple in the ontology header, so no consumer can accidentally treat a pre-ratification TTL as authoritative.
- The WG ratification is a *gating event* on the programme — the WG decision is the trigger for moving the Foundation ODR from `status: proposed` to `status: accepted`. The WG meeting that ratifies the namespace is the *defining moment* of the programme; until that meeting, the TBox is provisional.
- All downstream module ODRs (ODR-0005, ODR-0006, ODR-0008, etc.) carry an explicit dependency: their `status: accepted` is blocked by the Foundation ODR's `status: accepted`, which is blocked by the WG namespace decision. The dependency is recorded in their `depends-on` frontmatter and is mechanically reviewable.

Baker's recommendation of `https://w3id.org/opda/` (the DPV-symmetric option, with W3C PICG persistence guarantee) is operationally the strongest: it transfers the persistence burden to the W3C PICG, survives consortium re-branding, and lowers the OPDA-side maintenance commitment. The DPV programme adopted `w3id.org/dpv/` for exactly this reason — Pandit was the principal author of that decision and would attest to the operational benefit. The WG should be told this is the operationally-strongest option, not just one of three peers. The case against `https://opda.uk/ns/` is not that it is *wrong* — OPDA's `opda.uk` is currently stable — but that it ties namespace persistence to consortium continuity. The case against `https://trust.propdata.org.uk/ontology/` is that it ties namespace persistence to *trust-framework* branding, which is even more brand-coupled than the institutional case. `w3id.org` is the least-coupled option.

Pandit's per-module `owl:versionIRI` independence is correct (the DPV family-of-modules experience). But the same point applies to module ODRs as to the Foundation: until the namespace string is committed, the `owl:versionIRI` strings are provisional. The version scheme question — calendar vs semantic vs hybrid — is genuinely deferrable; the namespace string question is not.

**Withdrawal condition:** the synthesis records the WG's namespace decision as a *blocker* on Foundation TBox publication (i.e. no Foundation TBox under `status: accepted` until the WG names the namespace string) AND the synthesis records `https://w3id.org/opda/` as the operationally-strongest candidate (the W3C PICG persistence guarantee) for the WG's consideration, alongside the two ODR-0004 options.

**The consumer-discovery problem.** One additional operational concern that has bitten three TopBraid customers in the past five years: once a namespace string is published and consumers begin dereferencing it, the project no longer has a *complete enumeration of consumers*. The web is open; anyone with a SPARQL endpoint can `LOAD <opda-namespace-IRI>` into their graph store; the OPDA project cannot know who has done so. This is the deepest reason the namespace is a one-way door — *retraction notification* is impossible because the project doesn't know who to notify.

The mitigation: publish a `dct:replaces` / `dct:isReplacedBy` chain *from the moment the namespace is committed*, so any consumer who refreshes the namespace gets the redirect. But this only works if the namespace is committed in the first place; under "the namespace will be decided later", there is no `dct:replaces` chain to build, and the eventual commit is a hard cutover with no migration path. This is precisely why the namespace string must be the FIRST WG decision, not the last.

**Held dissent text (if unmet):** "Namespace-string-deferred-to-WG-later means TBox is published under unstable URI; consumers re-point cost is forever. The Foundation ODR cannot ship `status: accepted` until the WG names the namespace. Operationally-strongest candidate (`https://w3id.org/opda/`, W3C PICG persistence) absent from the deliberation; restoring it is a one-line synthesis amendment. The consumer-discovery problem (no complete enumeration of dereferencers; no notification path for retraction) is the deepest case for committing the namespace before any TBox ships."

## Procedural attacks

**Q3 ↔ Q5 consistency.** The generator (Rule 6) produces TBox output. Into which graph does the output flow — the class graph, the shapes graph, the annotation graph, all three? If the generator emits a single TTL file that contains class declarations *and* `sh:NodeShape` declarations *and* `opda:aiHint` annotations, Rule 3 (three-graph separation) is broken at the generator layer. This is the most likely operational fail-point: the generator authors think of their output as "the ontology"; the consumers experience it as a SHACL profile or as a class graph or as an LLM-form-hint set; the three views need three artefacts. The synthesis must specify: **the generator is three-graph-aware**; it emits three separate output files (`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) from the same input source. The build pipeline composes the three derived consumer profiles (`opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`) from the three sources. Without this specification, Rule 3 and Rule 6 contradict at the build-pipeline layer; the contradiction is silent because neither rule explicitly mentions the other.

**Q4 ↔ Q7 consistency.** The `dct:source` URIs in term-sourcing (Rule 7) reference external resources — W3C spec sections, glossary rows, schema-leaf paths. The glossary and schema paths are *local* (under `source/00-deliverables/semantic-models/`); the W3C spec URIs are *external* (under `https://www.w3.org/TR/`). If the OPDA namespace string is provisional, the term's *subject* URI is provisional — but its `dct:source` URIs may be stable. This is operationally fine but methodologically worth recording: the provisional namespace status does NOT propagate to provenance URIs. There is a related concern: for the W3C-spec-pinned `dct:source` URIs, the synthesis should specify that the URI pins a *version IRI* (e.g. `https://www.w3.org/TR/2020/REC-shacl-20170720/#NodeShape`) rather than a *generic IRI* (e.g. `https://www.w3.org/TR/shacl/#NodeShape` which redirects to the latest version). The W3C spec authority that ODR-0004 Rule 7 invokes is *the spec at the time the term was minted*, not whatever the latest version becomes — without version-pinning, future W3C-spec updates can silently change the precedence-winner.

**Q6 ↔ project structure consistency.** The exemplar storage path under `source/03-standards/ontology/exemplars/` interacts with the nested-git-repo memory note in `~/.claude/projects/-Users-henrik-source-opda/memory/MEMORY.md` (the `source/03-standards/schemas/` directory is a nested git repo; the parallel `source/03-standards/trust-framework/` is also nested). If `source/03-standards/ontology/` is a peer to `schemas/`, the exemplars directory is in the parent OPDA repo (correct routing — exemplar commits go through OPDA Council review). If `source/03-standards/ontology/` is intended to be its own nested git repo (mirroring `schemas/`), the routing is unclear: a TopBraid customer pattern I have seen this break — the upstream schemas-repo has its own review cadence; ontology exemplar commits stuck waiting for upstream review while the downstream OPDA Council deliberation moves on. The synthesis should explicitly state: **`source/03-standards/ontology/` is part of the parent OPDA repo; it is not a nested git repo.** This is consistent with the OPDA Council methodology (ODR-0001 §Working-file convention — working files live under `<project>/<council-directory>/`, which is the parent OPDA repo).

## Anchor withdrawal table

| Q | Withdrawal condition | If unmet, held dissent text |
|---|---|---|
| Q1 | Hash confirmed for current scale + reopening trigger at named-criterion scale | Light press; concur. Recorded operational concern: hash is a one-way door at corpus growth; reopening trigger absent from the draft. |
| Q2 | Hendler enforcement-via-review + `odr-review` lint specification (URI shape verified against originating `kind: pattern` ODR's UFO category) lands with Foundation TBox | Light press; concur. Specification absent from the draft. |
| Q3 | Build-step graph-union producing three source graphs + three derived consumer profiles; five-part operational test stated; shapes-graph version-pointer to target class graph specified | **HOLD** — "Three-graph separation is authoring-discipline only; runtime materialisation rule unspecified — TopBraid customer experience: this fails at scale. Consumers either silently union (defeating separation) or fail to load (silent SHACL incompleteness). Foundation ODR must commit to build-step + derived-profiles + operational test." |
| Q4 | Five-line precedence (W3C > OPDA TF > other regulatory as contextual > glossary > schema) AND glossary framed as authoritative over project-internal terms + project-contextual-note over W3C / regulatory terms AND conflict-recording protocol per Baker DCMI pattern specified. Fallback withdrawal: Pandit's four-line form provided "regulatory" is the OPDA TF specifically with "other regulatory" recorded as `skos:scopeNote`. | **HOLD** — "Term-sourcing precedence collapses W3C authority, OPDA TF authority, other regulatory regimes, and glossary preferences into one or two layers; the operational fail mode (W3C vs OPDA TF vs FCA conflict on a Buyer-like term) is unspecified. Glossary is authoritative over project-internal terms, not over imported W3C / regulatory terms. Without the five-line distinction (or a clarified four-line where 'regulatory' = OPDA TF specifically), the precedence is a hand-wave." |
| Q5 | Deterministic emission ordering rule + generator version recorded in `owl:versionIRI` lineage + CI test for byte-identical output (not "reviewable diff") | **HOLD** — "Generator-first without operational reproducibility test is generator-first-in-name-only. The TopBraid-customer fail mode (silent generator drift through dependency updates; reviewer approval of unreadable diffs) is unspecified. Deterministic ordering + version-pin-in-versionIRI + byte-identity CI is the minimum operational floor." |
| Q6 | Concur with three-exemplar set; exemplar storage path explicitly stated as part of parent OPDA repo (not nested `schemas/` sub-repo) | Light press; concur. Storage-path-vs-nested-repo question raised for synthesis clarification. |
| Q7 | Namespace string is a *blocker* on Foundation TBox publication (no Foundation TBox `status: accepted` until WG names the namespace) AND `https://w3id.org/opda/` recorded as operationally-strongest candidate for WG consideration | **HOLD** — "Namespace-string-deferred-to-WG-later means TBox is published under unstable URI; consumers re-point cost is forever. The Foundation ODR cannot ship `status: accepted` until the WG names the namespace. Operationally-strongest candidate (`https://w3id.org/opda/`, W3C PICG persistence) absent from the deliberation; restoring it is a one-line synthesis amendment." |

## Operational lessons from TopBraid customer deployments

For the record, three cited deployments inform every primary attack above. They are cited so the synthesis can verify the operational claims; they are not anecdotal:

- **Constellation EDM, Capital One — SHACL-driven data quality programme (2019–2022).** Deployed against a multi-thousand-class FIBO-aligned ontology; the three-graph separation pattern was authored late in the programme (year 2) after the union-as-runtime pattern produced the silent-failure mode in production. Documented in: Allemang, Hendler, Gandon, *Semantic Web for the Working Ontologist* 3rd ed. (2020), Ch. 12; the case is the textbook precedent for build-step graph-union with derived consumer profiles. The TopBraid runtime tooling (TopBraid EDG 6.x) supports this pattern natively.

- **NIH BioPortal — shapes-as-tests CI discipline (2018–present).** Every SHACL shape graph is paired with `expected-report.ttl` instances; the CI fails on validation-report drift. The pattern is the operational floor for the Q6 exemplar-pair amendment. Documented in: the BioPortal SHACL-Test framework, https://github.com/ontoportal/ontoportal-lite (a TopBraid-adjacent project; the shapes-as-tests pattern is portable).

- **DPV programme — namespace-string switch, slash → hash (2019).** Documented in: Pandit, Polleres, Bos, Brennan, et al., *DPV 2.0 Specification* (2024) §History. The switch took 6 ecosystem-months; downstream consumers (including European Data Protection Supervisor pilot deployments) were unreachable during the migration window. This is the precedent for my Q7 "namespace is a blocker on TBox publication" demand.

These deployments are the operational substrate of my DA position. The synthesis can verify the citations; the operational claims are not hand-waved.

## Tie-back to Session 001 Q5 carry

For the record: my Session 001 Q5 position carried with Gandon's support, against Cagle's `aiHint` framing. The carry had two parts: (a) advisory annotations live in a separate annotation graph keyed to shape IRIs; (b) the operational reification — `opda:ValidationContext` — gives consumers a typed handle to the validation-context profile they have loaded, so a SPARQL query can disambiguate which validation profile produced a given report. ODR-0004 Rule 3 inherits part (a) — the separate annotation graph is recorded. Part (b) is *absent* from ODR-0004; the Foundation rule does not mention `opda:ValidationContext` or the equivalent.

This is a downstream concern (ODR-0010 / ODR-0013 author the SHACL profiles where `opda:ValidationContext` surfaces), not a Foundation-blocker — but the synthesis should record that the Session 001 Q5 carry's reification commitment propagates into the downstream ODRs, not just the graph-separation rule. Without the reification, the three-graph separation produces graphs the consumer cannot recompose because they don't know which validation profile is which. The reification is the *handle* that makes the separation operationally tractable.

If the synthesis preserves the Session 001 Q5 carry verbatim, the reification commitment is implied. If the synthesis re-states the graph-separation rule without the reification, the carry is partially undone. I would prefer the synthesis to explicitly cite the Session 001 Q5 carry's two-part form (annotation graph + reification) and route the reification commitment to ODR-0010 / ODR-0013 as a constraint they must implement.

**Carry-preservation withdrawal:** concur with Rule 3 as drafted if the synthesis explicitly cites the Session 001 Q5 carry's two-part form (annotation graph keyed to shape IRIs + `opda:ValidationContext` reification) and routes the reification to ODR-0010 / ODR-0013 as a downstream commitment. Hold dissent if the synthesis re-states the graph-separation rule without the reification, because the reification is what makes the separation operationally tractable.

## Anchors for the synthesis

For the Queen composing the synthesis: the minimal set of deliverables that satisfy my withdrawal conditions across Q3, Q5, and Q7 (the three primary attacks) is:

1. **Q3 — three operational specifications in the ODR's `## Rules`:**
   - The three source graphs (`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) are the canonical artefacts.
   - The three consumer profiles (`opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`) are derived views.
   - Five-part CI test specified (no `sh:` in annotations; no `owl:imports` shapes → classes; no advisory in shapes; `sh:targetClass` cross-graph reference check; profiles are generated).

2. **Q5 — three operational specifications in the ODR's `## Rules` (or `### Enforcement`):**
   - Deterministic emission ordering: lexicographic-by-URI; alphabetised prefixes; skolemised blank nodes; normalised whitespace.
   - Generator version recorded in `owl:versionIRI` lineage AND `owl:versionInfo` AND `opda:generatorVersion`.
   - CI byte-identity test (not "diff reviewable in PR"); CI fails on any byte difference.

3. **Q7 — three operational commitments in the ODR's `## Consequences`:**
   - Foundation TBox cannot ship `status: accepted` until WG names the namespace string.
   - `https://w3id.org/opda/` recorded as operationally-strongest candidate for WG consideration (alongside the two ODR-0004 candidates).
   - Downstream module ODRs' `status: accepted` is blocked by the Foundation ODR's `status: accepted`.

4. **Q4 — five-line precedence in the ODR's `## Rules` Rule 7:**
   - W3C-spec > OPDA Trust Framework > other regulatory (contextual) > glossary > schema-text.
   - Conflict-recording protocol: every conflict produces a `## Change log` row in the consuming module ODR; rejected definitions preserved as `skos:scopeNote`.

5. **Q1, Q2, Q6 — light additions:**
   - Q1: reopening trigger for hash-vs-slash at named scale criterion.
   - Q2: `odr-review` lint specification lands with Foundation TBox.
   - Q6: exemplar TTL paired with `expected-report.ttl` for CI regression; exemplar path is parent OPDA repo, not nested `schemas/` sub-repo.

These eleven additions, taken together, convert ODR-0004 from a *policy* document into an *operational* document. The synthesis is welcome to argue against any one of them; what I cannot accept is silent omission. Each Foundation rule must answer the build-vs-runtime, one-way-door, and diff-readability sub-tests; silence on those sub-tests is not "lighter scope", it is *unspecified operational discipline*. TopBraid customer deployments do not survive unspecified operational discipline; the OPDA Foundation will not either.
