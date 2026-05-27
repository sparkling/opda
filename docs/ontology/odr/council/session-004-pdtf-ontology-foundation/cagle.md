# Cagle — Solo position on S004

## Stance summary

ODR-0004 is well-aimed; my load on this session is depth on Q3 (three-graph separation — the annotation-graph keying is mine to discharge: my S001 Q5 `aiHint`-exile loss produced the annotation-graph artefact, and S004 is where the keying gets fixed) and Q5 (generator-first — operational reproducibility, deterministic ordering, AI-RDF integration). I ratify Q1, Q2, Q4, Q6, Q7 with brief notes. The Knublauch DA stance against my depth questions is anticipated and addressed inline; I expect to withdraw on most of his attacks if he produces operational checks (the S002 pattern). My S001 SSSOM dissent stays live but is out of scope here.

## Per-question positions

### Q1 — Hash vs slash

Concur. Hash is the textbook whole-document case for a small TBox; I argued this in S001 Q7 (vote 9-0). The DPV-symmetric `w3id.org/opda/` Baker raises is worth WG consideration but doesn't change the hash-vs-slash answer — `w3id.org/dpv` is itself hash-served. Cool URIs for the Semantic Web (W3C TAG 2008) §4.4 — "use hash URIs for small vocabularies served as one document".

Vote: FOR Rule 1.

### Q2 — Layer-segregated naming

Useful only if enforced. Cagle 2017, *The Semantic Web Reborn*, §"Naming and the rigidity contract" — naming conventions documented but not enforced decay within a year as new contributors paper over the discipline. Concur with Pandit's amendment via Baker: the convention is verified by `odr-review` lint against the `kind: pattern` UFO commitment of the originating ODR. Without that hook the convention is decorative.

Vote: FOR Rule 2 + Pandit's enforcement amendment.

### Q3 — Three-graph separation (DEPTH — annotation-graph keying)

This is where my S001 Q5 dissent (the `aiHint` exile, lost 7-2) becomes load-bearing. The panel agreed advisory annotations go to a *separate annotation graph keyed to shape IRIs*. S001 fixed the artefact boundary; **S004 must fix the keying rule and the consumer contract** — otherwise the annotation graph is just a parking lot for terms Knublauch refused to admit into the shapes graph, with no operational semantics.

**Keying rule.** Annotations are keyed to the IRI of the artefact they advise. Three cases:

1. **Annotation-to-shape.** AI consumer hints on a SHACL shape: `opda:aiHint` predicate, subject the shape IRI (e.g. `opda:PropertyShape`), object a literal or a structured hint node. Dereferenceable independently — a consumer that wants only the hint, not the validation graph, fetches the annotation graph alone.
2. **Annotation-to-class.** UI rendering hints on an OWL class (e.g. presentation order, default-view-mode): subject the class IRI, predicate `opda:uiHint` or similar, object the hint.
3. **Annotation-to-property.** Documentation enrichment on a property (e.g. example value, deprecation note that is NOT a SHACL deprecation): subject the property IRI.

**Composition rule.** Build-step graph-union for consumers that want everything; consumer SHOULD honour the graph-typing. The annotation graph is **OPTIONAL** to consume in all consumer profiles:

- **AI consumers** MAY skip the annotation graph if they don't want hints (rare), but typically MUST load it (this is the case the annotation graph exists to serve).
- **Validation consumers** MUST skip the annotation graph — no `sh:` triples appear in the annotation graph; the validator MUST NOT fire on annotation-graph content.
- **Reasoner / OWL consumers** MAY skip the annotation graph; the class graph alone is the open-world model theory.

**Discipline for what lives in the annotation graph:**

- Advisory predicates: `opda:aiHint`, `opda:uiHint`, `opda:presentationOrder`, `opda:exampleValue`, and similar.
- NO `sh:` predicates. The annotation graph cannot carry SHACL — that's the failure mode the S001 Q5 exile was protecting against (`opda:aiHint` masquerading as `sh:severity sh:Info`).
- NO `owl:` axioms with reasoning impact (no class equivalences, no property characteristics).
- `dct:source`, `dct:creator`, `dct:modified` are fine — provenance is annotation by nature.

**Operational test (the one Knublauch will demand):** A SHACL validator running against the shapes graph alone must produce zero violations from annotation-graph content. Specifically:

1. Query `ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` — MUST return false.
2. Query `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` — MUST return false.
3. An AI consumer querying `SELECT ?hint WHERE { GRAPH opda:annotations { opda:PropertyShape opda:aiHint ?hint } }` — MUST return the hints.

This is falsifiable, testable in CI, and converts the S001 verdict from a discipline statement into a build-step contract.

**Concurrence with Baker (DCMI namespace-vs-profile-vs-documentation cut) and Pandit (DPV consumers MAY union, MUST NOT treat union as model theory).** My amendment refines the keying; theirs refines the consumer contract. Both belong in the same enforcement section.

Vote: FOR Rule 3 + the keying rule above + the operational test.

### Q4 — Term-sourcing precedence

Concur with Baker's DCMI Usage Board discipline and Pandit's regulatory-authority insertion. The four-line precedence (W3C > regulatory > glossary > schema) is right.

One AI-RDF concern that didn't get airtime in Baker/Pandit: **when an LLM consumer queries for a term's definition, the `dct:source` link should resolve to the authoritative source, not a project-internal cache**. The DBpedia / Wikidata lesson (Hellmann et al. 2017, *DBpedia 2017 release notes*) — if `dct:source` resolves to a stale local copy, LLM consumers cite the stale copy and the wrong definition propagates. The `dct:source` URI MUST be the authoritative source URI (the W3C spec URL, the GDPR Article URL, the glossary row URL), not a project-internal mirror — even if the mirror is more reliable. The mirror, if needed for resilience, sits behind `dct:isReferencedBy`, not `dct:source`.

Vote: FOR Rule 7 + Baker amendment 1 + Pandit amendment 2 + AI-RDF authority-URI clarification.

### Q5 — Generator-first (DEPTH — operational reproducibility)

The generator is the source of truth; the TTL is the build artefact. The Baker/Pandit pair already nailed the version-control + CI-diff + named-path discipline. My depth contribution is on **reproducibility and AI-RDF integration**, which their amendment leaves underspecified.

**Reproducibility.** The generator MUST be:

1. **Deterministic.** Same input produces same output bit-for-bit. Test: `diff <(generator input) <(generator input)` returns empty. Run twice in CI; fail the build if the two outputs differ.
2. **Triple-ordering deterministic.** This is the operational killer Baker/Pandit don't address. RDF is set-semantic but TTL files are byte-stream artefacts; if the generator emits triples in nondeterministic order (e.g. dict iteration order on Python < 3.7, or hash-map iteration in any language), the diff between regeneration N and N+1 explodes and PR review becomes impossible. **Demand: a deterministic ordering rule.** Candidate: alphabetic by subject IRI; within subject, alphabetic by predicate IRI; within predicate, alphabetic by object lexical form (with `xsd:` literals before IRIs before blank-node IDs). The generator emits triples in this order; the test harness asserts ordering on every regeneration.
3. **Versioned.** The generator's own version is recorded in the output's `owl:versionInfo` or a custom `opda:generatedBy` predicate. Example: `opda:foundation opda:generatedBy "opda-gen 1.2.0"`. This is the BBC `/programmes/` discipline (Davis 2010, *Linked Data Patterns* — every generated dataset records its generator version so downstream consumers can replay the generation).
4. **`owl:versionIRI` discipline.** The output carries `owl:versionIRI` (e.g. `https://opda.uk/ns/foundation/2026-q3`) per ODR-0004 Rule 4; the version-less namespace (`https://opda.uk/ns/foundation`) is the "current" view that resolves to the latest version IRI.

**AI-consumer-friendliness.** Output TTL is **human-readable AND machine-parseable**:

1. Pretty-printed with blank lines between subjects.
2. Prefix declarations at the top, sorted alphabetically.
3. Comments preserved from the data dictionary as `rdfs:comment` — not stripped.
4. `skos:definition` and `rdfs:label` populated from the glossary; `dct:source` populated from glossary row OR canonical schema-leaf path (per Rule 7).
5. UTF-8, LF line endings (the diff-explosion killer on Windows-checkout teams).

**The PR-review workflow.** The TTL is checked into version control; the data dictionary is the input. PR-review on TTL diff alongside data-dictionary changes — this is exactly the BBC `/programmes/` pattern Davis cites. A typical PR is: "data dictionary row for `RegisteredTitle.titleNumber` definition updated; regenerate; review the diff (one `rdfs:comment` change on `opda:titleNumber`); approve". A bad PR is "regenerate produced 14,000 lines of diff because triple ordering changed" — which is exactly what the deterministic-ordering rule prevents.

**Operational test (the one Knublauch will demand):**

1. Run the generator twice on the same input. Outputs MUST be byte-identical: `diff <(generator input) <(generator input)` returns empty.
2. Run the generator on a known-good input fixture; output MUST match a committed reference fixture (`tests/generator/foundation-expected.ttl`). Hash-compare in CI.
3. Mutate the data dictionary by adding a comment to one leaf; regenerate; diff MUST be exactly one `rdfs:comment` change on the corresponding `opda:` term. Nothing else. (This is the "diff explosion" canary.)
4. Mutate the data dictionary by adding a new leaf; regenerate; diff MUST be exactly one new `opda:DatatypeProperty` declaration block. Nothing else.

This is falsifiable, testable in CI, and converts the Baker/Pandit "generator spec lives at a named path" amendment from a directory-structure rule into a runtime contract.

Vote: FOR Rule 6 + Baker/Pandit operational amendments + my deterministic-ordering rule + the four-part operational test.

### Q6 — Diagnostic-exemplar policy

Concur with Allemang/Baker's three-exemplar set (registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split). Storage at `source/03-standards/ontology/exemplars/exemplar-<slug>.ttl` or equivalent. Concur with Pandit's amendment that exemplars cited from a consuming module ODR carry both the path AND a one-line description of the named hard case. Not in TBox build output — the exemplar `.ttl` files are sibling artefacts to the TBox, NOT included in the `foundation.ttl` deliverable.

Vote: FOR Rule 8 + Pandit's citation amendment.

### Q7 — Namespace string + version scheme

Concur with Davis (S001 Q7) on `opda.uk/ns/` for institutional brand alignment, and with Baker's persistence-first criterion. The `w3id.org/opda/` option is worth WG consideration but is a WG decision, not ours.

Calendar versioning at foundation level (Baker's "safer pre-breaking default"); per-module semantic versioning (Pandit's DPV-family lesson) at module level. The Foundation TBox is a small TBox; calendar suffices. When the Foundation hits a breaking change, the WG re-litigates.

Vote: FOR Rule 4 deferring both decisions to the WG + Baker's six criteria added to "Open questions".

## Operational test demands (Q3 + Q5)

These are the falsifiable checks I demand land in ODR-0004's `### Enforcement` section. They convert disciplines into contracts.

### Q3 annotation-graph operational test

1. `ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` MUST return false. No advisory annotation predicates in the shapes graph.
2. `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` MUST return false. No SHACL types in the annotation graph.
3. `SELECT ?hint WHERE { GRAPH opda:annotations { opda:PropertyShape opda:aiHint ?hint } }` MUST return the hints. The annotation graph is keyed to the shape IRI, dereferenceable independently.

### Q5 generator operational test

1. `diff <(generator input) <(generator input)` returns empty. Two invocations on the same input produce byte-identical output.
2. `sha256sum $(generator input) == sha256sum tests/generator/foundation-expected.ttl`. Output matches the committed reference fixture.
3. Adding one comment to the data dictionary produces exactly one `rdfs:comment` diff in the TTL output. (The "diff explosion canary".)
4. Adding one new leaf to the data dictionary produces exactly one new `opda:DatatypeProperty` block in the TTL output. Triple ordering remains deterministic.

## Replies to anticipated objections

### Knublauch (DA) on Q3 composition

Anticipated attack: *"The annotation graph is just SHACL with `sh:severity sh:Info`. Three-graph separation is over-engineering — fold the annotations into the shapes graph with `sh:severity sh:Info` and the validator can simply ignore them."*

Reply: `sh:severity sh:Info` is still a SHACL validation-graph entry. The validator still parses it, still walks the shape, still produces a (suppressed) result. The annotation graph exists for content that is **not validation at all** — AI-consumer hints, UI rendering hints, presentation order, example values. These are not "validation with low severity"; they are not validation. Conflating them with `sh:severity sh:Info` was exactly the S001 Q5 failure mode — Knublauch himself rejected `opda:aiHint` inline because "any invented term that could masquerade as a SHACL constraint" is a category error. The separation IS the protection.

Withdrawal condition (offered): I withdraw the keying rule if Knublauch produces an operational counter-rule that prevents annotation-graph content from being mistaken for SHACL by a naive consumer. (My expectation: he won't, and the annotation-graph keying rule lands as drafted.)

### Knublauch (DA) on Q5 reproducibility

Anticipated attack: *"Generator output drift is the operational killer; checked-in TTL with non-deterministic order is worse than no generator at all — PRs become unreviewable, the build artefact masquerades as the source of truth, and regenerations silently corrupt the corpus."*

Reply: **Concede the premise, demand the remedy.** Knublauch is right that non-deterministic generator output is worse than no generator. The remedy is the deterministic-ordering rule + the four-part operational test above. The test harness MUST run in CI; failure to produce byte-identical output on consecutive regenerations MUST fail the build. The "diff explosion canary" test is specifically designed to catch ordering drift before it reaches PR review.

Withdrawal condition (offered): I withdraw the generator-first stance if the deterministic-ordering rule cannot be operationalised. (My expectation: the rule is trivially operationalisable — every mature RDF library supports sorted serialisation; rdflib has `serialize(format='turtle')` with sortable triple stores; the only cost is the test harness, which is a one-day implementation.)

### Knublauch (DA) on Q4 source-URI

Possible attack: *"`dct:source` resolving to the authoritative external URL means OPDA's term semantics break if the W3C decommissions a Recommendation page — fragility through external dependency."*

Reply: This is the Cool URIs persistence argument inverted. The W3C does not decommission Recommendation URIs (TAG 2008, *Cool URIs Don't Change*); the GDPR text URL is similarly stable; the OPDA glossary URL is OPDA's own commitment. The `dct:source` chain is no more fragile than the dereferenceability commitment in Rule 5. If Knublauch's concern is resilience, the `dct:isReferencedBy` mirror chain handles it; `dct:source` MUST stay authoritative.

## Cross-references

My Q3 depth (annotation-graph keying + operational test) feeds forward into **ODR-0010** (overlay/profile mechanism — the annotation graph composes alongside profile shape graphs) and **ODR-0013** (SHACL validation — the validator MUST NOT fire on annotation-graph content; the test enforces this).

My Q5 depth (generator determinism + AI-RDF readability) feeds forward into **ODR-0008** (descriptive attributes — the generator produces the `DatatypeProperty` skeleton from the data dictionary), **ODR-0011** (enumeration vocabularies — the generator produces SKOS concept schemes from the data dictionary's `enum` arrays with deterministic ordering), and **ODR-0013** (the generator-produced shape graphs must also be byte-deterministic and PR-reviewable).
