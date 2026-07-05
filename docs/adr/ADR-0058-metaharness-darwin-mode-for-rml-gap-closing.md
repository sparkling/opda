---
status: accepted
date: 2026-07-04
tags: [metaharness, darwin-mode, evolutionary-search, rml, test-harness, pareto]
supersedes: []
depends-on: [ADR-0057]
implements: []
---

# MetaHarness Darwin Mode for RML Gap-Closing

## Context and Problem Statement

While extending the RML mapping ([ADR-0057](./ADR-0057-rml-mapping-implementation.md)), the question arose of whether `@metaharness/darwin` — a ruflo-integrated evolutionary self-improvement tool ("freeze the model, evolve the harness") — could accelerate authoring the remaining schema-generated resource gaps, either by training the authoring subagent's own operating policy, or by treating candidate RML mappings themselves as an evolvable artefact scored against the real validation harness.

This required determining, empirically, which (if either) of Darwin Mode's two operating modes actually applies here:

1. **`evolve()`, the fixed-seven-surface CLI/MCP tool** (`planner`/`contextBuilder`/`reviewer`/`retryPolicy`/`toolPolicy`/`memoryPolicy`/`scorePolicy`) — designed to evolve the operating policy of an agent harness that is *itself* actively running and consulting those surfaces during real work.
2. **Darwin's lower-level, reusable primitives** (`mapLimit`, `paretoFront`, `Archive`) — usable standalone, independent of the seven-surface allowlist, to build a bespoke evolutionary loop over any custom genome and any custom scorer (the pattern `ruvector`'s MetaBioHacker uses for a numeric reconstruction genome, scored by a frozen Rust engine — not an agent-harness scenario at all).

## Decision Drivers

* Must produce genuine signal (measurable differentiation between candidates), not merely exercise the tooling.
* Must not require inventing PDTF transaction instance data or spinning up a real agent-execution sandbox disproportionate to the actual task (closing RML mapping gaps).
* Any environment fix made in service of testing this (e.g. sandbox portability) should stand on its own merit regardless of whether Darwin Mode itself proves useful.

## Considered Options

* **Option A — `evolve()` CLI/MCP tool against the RML repo directly.** Tried first; **rejected** after empirical failure (see Decision Outcome) — confirmed to be a known, documented degenerate case in Darwin Mode's own upstream ADR series, not a project-specific bug.
* **Option B — Build a full Tier-2-style harness** (spawn a real subagent per policy variant, have it attempt the RML-authoring task under that variant's constraints, score by the real harness). The closest thing to genuinely "training the agent," mirroring Darwin's own ADR-106 (Tier-2 agent-executing sandbox) and ADR-133 (real SWE-bench-style evolution). **Rejected as disproportionate** — a real, working engineering investment, but orthogonal to and much larger than the actual task (closing a bounded set of RML gaps), which does not need agent-policy training to succeed.
* **Option C (chosen) — Treat the RML mapping itself as a custom "genome," scored by the already-built real validation harness, using Darwin's generic `mapLimit`+`paretoFront` primitives directly** (not the seven-surface `evolve()` CLI). Mirrors `ruvector`'s MetaBioHacker pattern exactly, applied to a different domain (RML mapping authorship instead of numeric reconstruction parameters).

## Decision Outcome

Chosen option: "Treat the RML mapping as a custom genome, scored by the real validation harness, via Darwin's generic primitives" (Option C), because it is the only option that produced genuine, useful differentiation cheaply, without requiring instance data, a live agent sandbox, or a disproportionate engineering investment.

**Option A was tried and failed as expected.** Running `metaharness_evolve` (1 generation × 3 children, `sandbox: real`) directly against `source/03-standards/rml/` produced a flat, uninformative result: baseline `finalScore 0.985`, all three mutated children tied. Inspecting the actual run trace showed why: `taskId: "run repository test suite"` (Darwin's own generic label, not any task-specific prompt) and the trace stdout was plain `npm test` output against the **unmodified** repo — none of the seven generated policy-surface files (`planner.ts`, `reviewer.ts`, etc.) were ever executed against; they were archived but inert. Grounding this against Darwin Mode's own upstream documentation (via the ruvnet-brain knowledge base, `agent-harness-generator/docs/adrs/ADR-102-darwin-mock-sandbox-manifold-live.md`) confirmed this is a **known, documented degenerate case**, not a bug: `sandbox: 'real'` only differentiates variants when the task genuinely requires code changes to pass; ADR-102's own measured result for this exact scenario is `1 distinct niche, 0 entropy, finalScore [0.985] — flat` — an exact match. The seven-surface allowlist is also a hard, code-enforced safety gate (`inspectVariant`, per ADR-071) — an RML mapping file cannot be smuggled in as an eighth surface; this is by design ("capability expansion is a human decision, not an evolved one"), not a gap.

**Option C, in contrast, produced real signal in two deliberately contrasting trials:**

- **`opda:EPCCertificate`** (a class WITH a hard SHACL shape — `EPCCertificateIdentityKeyShape`, `minCount 1` on `prov:wasGeneratedBy`): 4 candidate genomes (differing in node-keying scheme and whether `opda:disclosureDetail`/`prov:wasGeneratedBy` were bound), scored by materialising each via `morph-kgc` and validating via Jena SHACL. 3 of 4 candidates genuinely violated the shape; `paretoFront` correctly selected the sole conforming candidate. That candidate was folded into the real mapping (§M4a).
- **`opda:NearbyFacility`** (deliberately chosen as the contrast case — verified to have **no** SHACL shape at all): 3 candidates differing in field/sub-array coverage. With no hard constraint to fail, `paretoFront` discriminated on coverage (node count + field count) instead — and along the way caught a genuinely invented test value (`"Rail"`, not a real member of `opda:TransportTypeScheme`; the schema's actual enum has `"National rail station"`). The full-coverage candidate was folded into the real mapping (§M14).

A necessary environment-hardening fix fell out of preparing to run Darwin's sandbox: `validate_shacl.sh` previously resolved `java` via `which java` unless `JAVA_HOME` was set, which would fail identically in a stripped/sandboxed environment lacking the `mise` shim directory on `PATH` — producing a false, uninformative "every variant fails" signal regardless of variant quality. Fixed with a deterministic `JAVA_HOME` auto-discovery fallback in the script; verified against a genuinely stripped `PATH` (mise shims excluded, only `bash`/coreutils present) before and after. This fix stands on its own merit as a portability improvement (CI, sandboxes) independent of whether Darwin Mode itself proved useful.

### Consequences

* Good, because it produced two real, useful defect catches (a missing hard-shape requirement; an invented enum value) that would not otherwise have been caught before folding those two resources into the real mapping.
* Good, because it required no instance data, no live agent-execution sandbox, and no custom function/UDF — reusing infrastructure already built for ADR-0057.
* Good, because the environment-hardening fix (`JAVA_HOME` auto-discovery) improves the harness's portability regardless of Darwin Mode's own outcome.
* Bad, because the pattern (Option C) is currently only demonstrated via two hand-authored, non-idempotent proof-of-concept scripts (see `harness/darwin-poc/README.md`) — not a generalised, reusable tool that can be pointed at an arbitrary new gap without hand-authoring new candidate genomes each time.
* Neutral, because Option A's failure confirms the generic `metaharness_evolve` CLI genuinely does not fit this project's use case; this is now empirically settled and does not need re-investigating for future RML gap-closing work.

### Confirmation

`harness/darwin-poc/darwin-genome-epccertificate.mjs` and `darwin-genome-nearbyfacility.mjs` are the executed records of both trials (see their own README for the important non-idempotency caveat — both APPEND candidate `TriplesMap`s onto the mapping as it stood *before* the winning genome was folded in, so re-running them now against the current mapping will not reproduce the original results).

## More Information

- [ADR-0057](./ADR-0057-rml-mapping-implementation.md) — the RML mapping implementation this ADR's genomes target and score against.
- Upstream references (via ruvnet-brain, `ruvnet/agent-harness-generator`): ADR-070/071 (Darwin Mode head; seven-surface safety allowlist), ADR-102 (the exact degenerate `sandbox:'real'` finding reproduced here), ADR-106 (Tier-2 agent-executing sandbox — the rejected Option B's closest upstream precedent), ADR-133 (real SWE-bench-fitness evolution — the closest upstream precedent for scoring against a real, non-agent-policy objective).
- `ruvector/docs/sonic-ct/OPTIMIZATION.md` (MetaBioHacker) — the precedent this ADR's chosen pattern directly mirrors: a custom genome + a frozen external scorer, using Darwin's `mapLimit`/`paretoFront` primitives standalone, not the seven-surface `evolve()` CLI.
- `source/03-standards/rml/harness/jena_query.py` (ADR-0057) and `harness/validate_shacl.sh` (this ADR's `JAVA_HOME` fix) — the scoring backend both genome trials call.

## Amendments

**2026-07-05 — adversarial re-review: the Decision Outcome's framing of Option A's failure was too strong; corrected, not reversed.** The user challenged the claim "[metaharness_evolve] cannot be pointed at ontology fixes or RML gaps directly," pointing out the ontology can be treated as ordinary source code. Re-grounded via `search_ruvnet` (not memory) rather than defending the original text:

- **The architecture genuinely does support this, contrary to this ADR's original implication.** `rupixel/.metaharness/bench.json` (a real, shipped precedent in another RuvNet repo) is a "repo-native" bench whose single task carries a real `prompt`, real `publicTestCommand`/`hiddenTestCommand`/`regressionTestCommand`, and (in principle) a non-empty `allowedMutationFiles` list naming real target files — i.e. `metaharness_evolve` can mutate an arbitrary repo's own files directly, not only the seven policy surfaces, when the bench task is configured that way. `agent-harness-generator/docs/adrs/ADR-142` independently confirms the same shape end-to-end: a real LLM proposes a search/replace patch on real target-repo files, scored by the project's own real test suite (a real, measured 12% SWE-bench Lite resolve rate) — the seven-surface allowlist governs a *different* mode (evolving an actively-running agent harness's own operating policy), not a hard ceiling on what Darwin Mode can target in general.
- **Option A's actual failure was a configuration gap, not an architectural one.** The original run used the tool's own default scaffold — a generic single task with `prompt: "Keep the repository test suite green"`, `publicTestCommand: "npm test"` (wrong for this repo), and `allowedMutationFiles: []` (nothing mutable). That is a content problem, not proof the mechanism cannot be pointed at OPDA's own files.
- **However, empirically retesting the correction found a REAL, separate, currently-binding limitation**: the MCP tool surface available in this session (`metaharness_bench`, `metaharness_evolve`) has no parameter for authoring custom task content — `metaharness_bench --op create` only ever scaffolds the generic single-task placeholder above, with no way to inject a real prompt/test-command/`allowedMutationFiles` targeting a specific ontology gap. Hand-editing the scaffolded `bench.json` to add real task content was tested directly: `metaharness_bench --op verify` rejects it (exit 1, "tampered"), and — checked further rather than assumed — `metaharness_evolve --confirm` also enforces the same taskHash check at actual run time (not just at explicit `verify`), failing with `taskHash <original> != recomputed <edited>`. This is a genuine, working integrity gate, not a bug to route around.
- **Net correction**: the *mechanism* can, in principle, target arbitrary repo files including this ontology — the original "cannot be pointed at" phrasing overstated a general limitation. But the *specific tool access available in this environment* cannot construct a working custom bench for it right now — every real attempt was legitimately rejected, confirmed empirically, not assumed. This narrows rather than reverses the ADR's practical conclusion: Option C (a hand-authored genome + pareto-style comparison scored directly against the real validation harness, bypassing `@metaharness/darwin`'s own gated bench format entirely) remains the correct, working approach for tasks with genuine multiple-candidate-design shape (e.g. `opda:Survey`, `opda:Proprietorship`'s conditional Relator minting) — it was never blocked by this finding, since it never depended on the gated bench/evolve path in the first place.
