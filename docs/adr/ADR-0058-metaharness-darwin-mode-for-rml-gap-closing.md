---
status: accepted
date: 2026-07-04
tags: [metaharness, darwin-mode, evolutionary-search, rml, ontology-authoring, test-harness, pareto]
supersedes: []
depends-on: [ADR-0057]
implements: []
---

# MetaHarness Darwin Mode for Ontology Authoring and RML Gap-Closing

## Context and Problem Statement

While extending the RML mapping ([ADR-0057](./ADR-0057-rml-mapping-implementation.md)), the question arose of whether `@metaharness/darwin` — a ruflo-integrated evolutionary self-improvement tool ("freeze the model, evolve the harness") — could accelerate closing the remaining schema-generated resource gaps. The question generalises beyond this one RML session: any ontology-authoring task with a *real, machine-checkable validation harness* (SHACL conformance, a generator's CI gates, a mapping's own test suite) is a candidate for the same treatment. This ADR records what was learned, corrected twice under direct challenge, and finally settled — and states the settled methodology as a general-purpose playbook (`## Rules`, below), not a narrative scoped to one session's RML gaps.

Darwin Mode has two genuinely different operating modes, and conflating them was the root of every correction this ADR went through:

1. **`evolve()` against its own seven fixed harness-policy surfaces** (`planner`/`contextBuilder`/`reviewer`/`retryPolicy`/`toolPolicy`/`memoryPolicy`/`scorePolicy`) — mutates the *operating policy* of an agent harness that is itself actively running and consulting those surfaces during real work. This is a real, narrower mode, code-gated (`inspectVariant`, upstream ADR-071) so arbitrary files cannot be smuggled in as an eighth surface.
2. **`evolve()` (or the package's lower-level `bench`/`mapLimit`/`paretoFront` primitives) against an arbitrary repo's own files** — a properly-authored bench task can carry a real task-specific prompt, real test commands, and a real `allowedMutationFiles` list naming target files anywhere in the repo (proven via a real, shipped precedent in another RuvNet repo, and via `agent-harness-generator`'s own real SWE-bench-style patch-and-test pipeline). This mode targets ontology/mapping files directly, no different in kind from any other source-controlled artefact.

Both modes are real and both are usable. Which one applies — and, within mode 2, whether to reach for the packaged tool or a hand-rolled equivalent — is a judgment call this ADR's `## Rules` section now states directly, so a future session does not have to re-derive it.

## Decision Drivers

* Must produce genuine signal (measurable differentiation between candidates), not merely exercise the tooling.
* Must not require inventing instance data or spinning up a real agent-execution sandbox disproportionate to the actual task.
* Any environment fix made in service of testing this should stand on its own merit regardless of whether Darwin Mode itself proves useful.
* Every claim about what a RuvNet tool can/cannot do must be grounded in `search_ruvnet`-cited real source, not memory or a single prior pass's conclusion — this ADR's own history is the cautionary example of why.

## Considered Options

* **Option A — the generic `metaharness_evolve` MCP tool, run with its default auto-scaffolded bench.** Tried first; produced a flat, uninformative result. Root cause (established only after two further rounds of adversarial review — see `## Rules` §1): not an architectural limitation, but a content gap — the auto-scaffold's `prompt`/test-commands/`allowedMutationFiles` are all generic placeholders with nothing real to differentiate against.
* **Option B — a full Tier-2-style harness** (spawn a real subagent per policy variant, have it attempt the authoring task under that variant's constraints, score by the real harness). The closest thing to genuinely "training the agent." **Rejected as disproportionate** for a bounded set of gaps — a real, working pattern, just orthogonal to and much larger than the actual task.
* **Option C — hand-roll the genome/pareto comparison directly**, bypassing `@metaharness/darwin` entirely: author 2-4 candidates by hand, score each against the real validation harness (SHACL / `make ci-ontology` / `make rml-test`), pick the winner. Zero new dependencies, no bench-authoring format to get right.
* **Option D — properly author a real `bench.json` via `@metaharness/darwin`'s public `bench` library API** (`bench.makeSuite()`/`bench.saveSuite()`, not the CLI's bare `bench create` scaffold and never a hand-edited JSON file), then drive the real `evolve --bench` path. Confirmed working end-to-end (see `## Rules` §3) — this is Option A done correctly, not a different mechanism.

## Decision Outcome

**Both Option C and Option D are valid and now proven; neither supersedes the other — they trade off differently (see `## Rules` §4 for the selection criterion).** Four real trials across two RML-mapping-migration sessions used Option C successfully (`opda:EPCCertificate`, `opda:NearbyFacility`, `opda:Proprietorship`, and the ontology-side half of `opda:Survey`); Option D was proven end-to-end (a real task authored via the public API, verified against the real installed CLI binary) but not yet used for a production fix in this repo — it remains available for a future task where its advantages (native multi-generation search, Pareto-front selection across more than a handful of hand-authored candidates) are worth the setup cost.

**Option A, run naively, fails as expected — this is now a fully-diagnosed, settled finding, not an open question.** `metaharness_evolve`'s own default `bench create` scaffold is a generic single task (`prompt: "Keep the repository test suite green"`, `publicTestCommand: "npm test"`, `allowedMutationFiles: []`) with nothing task-specific and nothing mutable — any repo, scored this way, degenerates to `sandbox: real` running `npm test` against an unmodified tree (matching upstream's own documented degenerate case, `agent-harness-generator/docs/adrs/ADR-102`, byte-for-byte: `1 distinct niche, 0 entropy, finalScore [0.985]`). This was *originally* mis-attributed to the seven-surface allowlist being a hard ceiling on all of Darwin Mode — it is not; see `## Rules` §1-§3 for the full, twice-corrected diagnosis.

**Option C's real trials, in order:**

- **`opda:EPCCertificate`** (a class WITH a hard SHACL shape, `EPCCertificateIdentityKeyShape`): 4 candidate genomes, scored by materialising each and validating via Jena SHACL. 3 of 4 genuinely violated the shape; the sole conforming candidate was folded into the real mapping (§M4a).
- **`opda:NearbyFacility`** (deliberately chosen as the contrast case — no SHACL shape at all): 3 candidates, discriminated on coverage instead of conformance. Caught a genuinely invented test value (`"Rail"`, not a real `opda:TransportTypeScheme` member — the real enum has `"National rail station"`). The full-coverage candidate was folded in (§M14).
- **`opda:Proprietorship`'s `opda:mediates` conditional minting** (2026-07-05): the class's SHACL shape requires `sh:minCount 2` on `opda:mediates`, satisfiable only when 2+ legal owners genuinely exist in the source data. Three candidates: (1, winner) an RMLMapper-specific bracket-index JSONPath null-skip technique — embedding a reference to the *second* array element in the subject template suppresses the whole node when it's absent, which RMLMapper supports but the previously-used engine (morph-kgc) structurally could not (its array-flattening ran before any TriplesMap saw a row, per ADR-0057's Amendments); (2, empirically rejected) a `.length()`/`.size()` JSONPath filter — confirmed to throw a parser error on the actual installed engine, not assumed unsupported; (3, rejected without a code trial on a real, checkable disqualifier) unconditional minting accepting a SHACL violation — this would mechanically fail the harness's own `rml-conformant` gate for a real fixture. Verified against 0/1/2/3-owner cases; folded into the real mapping (§M11b).
- **`opda:Survey`'s join predicate** (2026-07-05, ontology half only so far): the class had no domain/range connection to `opda:Property` anywhere — a deterministic naming-convention match (`opda:hasSurvey`, matching the sibling `opda:hasEPCCertificate` exactly) rather than a genuine multi-candidate question, so implemented directly without a comparison trial. The RML-binding half (multiple candidate field-coverage designs, genuinely Option-C-shaped like `NearbyFacility`) was in progress at the time of this rewrite.

**Option D was proven end-to-end but not yet used for a shipped fix**, per the diagnosis trail in `## Rules` §3: a properly-authored suite (via the package's public `bench.makeSuite()`/`saveSuite()` API, not the CLI scaffold and never a hand-edited file) verified as genuine — `hash OK`, exit 0 — against the real installed `@metaharness/darwin` CLI.

A necessary environment-hardening fix fell out of preparing to run Darwin's sandbox: `validate_shacl.sh` previously resolved `java` via `which java` unless `JAVA_HOME` was set, which would fail identically in a stripped/sandboxed environment lacking the `mise` shim directory on `PATH` — producing a false, uninformative "every variant fails" signal regardless of variant quality. Fixed with a deterministic `JAVA_HOME` auto-discovery fallback; verified against a genuinely stripped `PATH` before and after. This fix stands on its own merit as a portability improvement, independent of Darwin Mode's own outcome.

### Consequences

* Good, because Option C produced four real, useful outcomes (two defect catches — a missing hard-shape requirement, an invented enum value — plus two genuine gap closures on problems previously misdiagnosed as engine-inexpressible) that would not otherwise have been caught before folding those resources into the real mapping/ontology.
* Good, because neither option required inventing instance data, a live agent-execution sandbox, or a custom function/UDF beyond infrastructure already built for ADR-0057.
* Good, because the `JAVA_HOME` auto-discovery fix improves harness portability regardless of Darwin Mode's own outcome.
* Good, because this ADR's own repeated, adversarially-forced corrections produced a *general*, reusable methodology (`## Rules`) rather than a one-off narrative — the cost of getting it wrong twice was paid once, for every future ontology-authoring session that reaches for this tool.
* Bad, because Option C is currently demonstrated only via hand-authored, non-idempotent proof-of-concept scripts (`harness/darwin-poc/`) — not a generalised, reusable driver that can be pointed at an arbitrary new gap without hand-authoring new candidates each time.
* Neutral, because Option A run naively (the default scaffold, no custom bench) is now conclusively settled as unproductive for this class of work and does not need re-investigating — but this no longer implies Option D (a *properly*-authored bench driving the same `evolve()` machinery) is unproductive; those are different claims, confirmed by two rounds of adversarial review to actually be different.

### Confirmation

`harness/darwin-poc/darwin-genome-epccertificate.mjs` and `darwin-genome-nearbyfacility.mjs` are the executed records of the first two Option C trials (see their own README for the non-idempotency caveat — both APPEND candidate `TriplesMap`s onto the mapping as it stood *before* the winning genome was folded in). The `opda:Proprietorship` and `opda:Survey` trials are recorded in `mapping/opda-pdtf.rml.ttl`'s own M11b/M14/M18 comment blocks, with the rejected candidates' exact failure modes stated inline, not merely in this ADR.

## Rules

These rules are the general-purpose output of this ADR — written for *any* future ontology or mapping-authoring task with a real validation harness, not scoped to RML or to the specific gaps above.

### 1. Classify the task before reaching for any tool

- **Deterministic task** (one correct answer is derivable once you've read the ratifying spec/ODR/schema carefully): just implement it directly. Do not run a candidate comparison — with nothing genuinely competing, `paretoFront`-style selection adds process without adding signal, and forcing it produces the exact "flat, uninformative" failure mode this ADR's Option A hit.
- **Multi-candidate-design task** (a SHACL shape with more than one plausible satisfying structure; a coverage question with no hard constraint; an engine-specific technique whose applicability isn't obvious without testing): this is genuine Darwin Mode territory — proceed to §2.

### 2. For multi-candidate tasks, default to Option C (hand-rolled) unless §4's criterion says otherwise

Author 2-4 real, meaningfully different candidates. Score each against the *real* validation harness — not a mock, not a partial check. Two genuinely different scoring shapes:

- **Hard-constraint scoring** (a SHACL shape, a CI gate, a required test): any candidate that fails the constraint is disqualified outright, full stop — do not let a "mostly good" candidate that violates a hard constraint win on other merits (the `EPCCertificate` trial: 3 of 4 candidates were disqualified this way).
- **Coverage scoring** (no hard constraint exists): discriminate on genuine, checkable coverage (field count, node count, real enum/scheme-member correctness) — and *always* independently verify every literal value a candidate uses against the real, authoritative source (schema enum, SKOS scheme) before accepting it as a winner. The `NearbyFacility` trial's caught-invented-value ("Rail") is the reason this line exists: a candidate can look complete while quietly fabricating a value nothing upstream actually emits.

When a candidate is rejected, record *why*, with the specific evidence (a parser error message, a disqualifying SHACL violation, a real gate it would break) — not just "didn't work." Future readers (including the next Darwin Mode session) need the failure mode, not just the verdict, to avoid re-attempting an already-eliminated candidate for the same reason, or to recognise when a genuinely new angle (a different engine, a different technique) makes an old "impossible" finding worth re-testing.

### 3. If you need Option D (the packaged `evolve()`/`bench` machinery), author the bench correctly the first time

Do not use `metaharness_bench --op create`'s bare output as-is (it is a generic, content-free placeholder) and do not hand-edit the resulting JSON file's text afterward (this breaks `taskHash`, a genuine integrity check, not a bug to route around — confirmed by reading the actual `@metaharness/darwin` source, `packages/darwin-mode/src/bench/suite.ts`: the hash is computed from whatever `tasks` array is passed to `makeSuite()`, and only fails when a suite's stored hash no longer matches its own content, i.e. when someone edits the JSON text without recomputing it).

The correct path: `import { bench } from '@metaharness/darwin'`, construct the task object programmatically with real content (a real, task-specific `prompt` describing the actual gap; real `publicTestCommand`/`hiddenTestCommand`/`regressionTestCommand` pointing at the project's own real verification commands — e.g. `make ci-ontology`, `make rml-test`, not a generic `npm test` guess; a real `allowedMutationFiles` list naming the actual target files), then call `bench.makeSuite(id, version, tasks)` followed by `bench.saveSuite(path, suite)` so the hash is correct from the moment of creation. Verify with the real CLI (`bench verify <path>`) before driving `evolve --bench <path>` — a "hash OK" result confirms the suite is genuine, not that its *content* is good; content quality is still the author's responsibility, same as any test suite.

### 4. Choosing between Option C and Option D

- **Option C (hand-rolled)** when: the candidate count is small (2-4), you already have a fast, scriptable way to materialise-and-validate each candidate (as this project already does via `harness/run_mapping.py` + `validate_shacl.sh`), and you want zero new dependencies. This covers the large majority of ontology-authoring Darwin-Mode-shaped tasks.
- **Option D (packaged `evolve()`)** when: you want native multi-generation search or Pareto-front selection across a candidate space too large to hand-author exhaustively, or you want the run's own provenance/lineage tracking (archive, lineage, statistical promotion gates) that the packaged tool provides for free. This is a real, working, and now-verified path — reach for it when its machinery earns its setup cost, not by default.

### 5. Grounding discipline for any RuvNet/Darwin Mode claim

Never assert what a RuvNet tool can or cannot do from memory or from a single prior session's conclusion — including this ADR's own prior text. Call `search_ruvnet` and cite the actual repo+file path for the claim. If a claim depends on a mechanism's *actual behaviour* (not just its documented intent), test it directly against the real installed package before asserting a limitation exists — this ADR was wrong twice (see the historical Amendments, kept below for the record) precisely because an early pass stopped at "the MCP tool wrapper can't do X" without checking whether the underlying package's own public API could.

## More Information

- [ADR-0057](./ADR-0057-rml-mapping-implementation.md) — the RML mapping implementation Option C's genomes target and score against.
- Upstream references (via `search_ruvnet`, `ruvnet/agent-harness-generator`): ADR-070/071 (Darwin Mode head; seven-surface safety allowlist — governs mode 1 only, see Context above), ADR-102 (the exact degenerate `sandbox:'real'` finding reproduced by this ADR's own Option A attempt), ADR-106 (Tier-2 agent-executing sandbox — Option B's closest upstream precedent), ADR-133/ADR-142 (real SWE-bench-fitness evolution and a measured 12% SWE-bench Lite resolve rate — the closest upstream precedent proving mode 2's real-file-mutation capability end-to-end).
- `rupixel/.metaharness/bench.json` and `rupixel/docs/BENCH.md` — a real, shipped "repo-native" bench precedent in another RuvNet repo, and the independent confirmation that hand-editing a suite's JSON breaks `bench verify` for exactly the reason §3 above explains.
- `packages/darwin-mode/src/bench/suite.ts` and `bench/index.ts` (`@metaharness/darwin`, confirmed against the actually-installed npm package) — the real `taskHash`/`makeSuite`/`saveSuite`/`verifySuite` mechanics behind §3.
- `ruvector/docs/sonic-ct/OPTIMIZATION.md` (MetaBioHacker) — the precedent Option C directly mirrors: a custom genome + a frozen external scorer, using Darwin's `mapLimit`/`paretoFront` primitives standalone.
- `source/03-standards/rml/harness/jena_query.py` (ADR-0057) and `harness/validate_shacl.sh` (this ADR's `JAVA_HOME` fix) — the scoring backend every trial in this ADR calls.
- `source/03-standards/rml/mapping/opda-pdtf.rml.ttl`'s M11b (`opda:Proprietorship`), M14 (`opda:NearbyFacility`/`opda:schoolType`), and M18 (`opda:Survey`) comment blocks — the in-mapping record of each trial's rejected candidates and their exact failure modes, kept alongside the code they concern rather than only in this document.

## Amendments (historical record — superseded by the rewrite above, kept for provenance)

**2026-07-05 — first adversarial re-review.** The user challenged the original Decision Outcome's claim that `metaharness_evolve` "cannot be pointed at ontology fixes or RML gaps directly." Re-grounded via `search_ruvnet`: found real evidence (`rupixel`'s bench precedent, `agent-harness-generator/ADR-142`) that the architecture supports arbitrary-file mutation targeting, not only the seven policy surfaces — the original claim was too strong. Empirically retested rather than just reversing the claim: found the MCP tool wrappers (`metaharness_bench`/`metaharness_evolve`) genuinely could not author custom bench content in this session — every hand-edit attempt was rejected by a real `taskHash` integrity check, confirmed at both `verify` and real `evolve --confirm` run time. Concluded (at the time): the mechanism supports this in principle, but no accessible mechanism existed in this session to use it.

**2026-07-05 (2) — second adversarial re-review.** The user challenged again, asking for a source-code-level (not doc-level) re-check. A dispatched agent read `packages/darwin-mode/src/bench/suite.ts` directly (confirmed against the actually-installed npm package) and found `taskHash` is an ordinary hash-on-write, verify-on-read check, not a content-authorization lock — it fails only when a suite's stored hash no longer matches its own content, exactly what happens when JSON text is hand-edited without recomputing the hash (the same mistake independently documented in `rupixel/docs/BENCH.md`). The legitimate path — `bench.makeSuite()`/`saveSuite()` from the package's public API, constructing the suite programmatically so the hash is correct from creation — was tested live against the real installed CLI and confirmed genuine (`hash OK`, exit 0). The "no accessible mechanism" conclusion from the first re-review was itself too strong; corrected to the final understanding now stated in `## Rules` above.

Both amendments' full original text, including the exact commands and error messages from each round of testing, are preserved in this file's git history (`git log -p -- docs/adr/ADR-0058-metaharness-darwin-mode-for-rml-gap-closing.md`) rather than duplicated here — this rewrite consolidates the *settled* understanding into the main body and `## Rules` so a future reader gets the answer, not the archaeology, on first read.
