---
status: accepted
date: 2026-05-30
tags: [agentdb, memory, council, provenance, reasoningbank, indexing, governance]
supersedes: []
depends-on: [ODR-0001, ADR-0005]
implements: []
---

# Council-Session Indexing in AgentDB

## Context and Problem Statement

Council sessions (the [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) Linked Data Council methodology) are the *deliberation* behind each ODR — named-expert positions, Devil's-Advocate challenges, per-question votes, **held-as-live dissents**, and **re-open triggers**. They live as markdown under `docs/ontology/odr/council/` and are durably preserved in git and rendered on the site. Critically, **a session is not an ODR**: it is an *input* that links to one or more ODRs, and `odr-index` deliberately does **not** index sessions — only ODRs are records in the `odr/*` namespace.

That correct separation leaves three capabilities unserved:

1. **Recall** — you cannot semantically search prior deliberations before convening a new council (a step the ODR-0001 protocol expects), e.g. "what has the Council already argued about namespaces?"
2. **Provenance traversal** — the session↔ODR link is a frontmatter string (`council: session-019`), not a traversable edge, so "trace this rule → its deliberation → the ratifying vote" is a grep, not a query.
3. **Actionable re-open triggers** — the methodology's re-open triggers and held-as-live dissents are *future-conditional by design* ("re-open if a consumer query needs X") but are buried in prose where nothing can check them against a proposed change. This is the ontology-side equivalent of the [ADR-0005](./ADR-0005-deferred-work-register.md) deferred-work register, currently un-indexed.

The question: into which AgentDB store(s) should sessions be indexed — without making them records — and to what end?

## Decision Drivers

- **Operationalise the trigger discipline.** ODR-0001 produces re-open triggers and live dissents that are *meant to be checked later*; today they are inert prose.
- **Recall-before-deliberation** is part of the council protocol.
- **Provenance/audit.** Trace a rule to its deliberation and ratifying vote in one hop.
- **Sessions stay non-records.** Any session store is an *auxiliary index keyed on session id*, never the `odr/*` namespace; ODRs remain the only records.
- **Git is already the durable store.** This decision is about *indexing for recall and reasoning*, not preservation.
- **Three different consumers** (human recall, graph traversal, AI-council learning) want three different access patterns — no single store serves all three.

## Considered Options

- **A — Git only (status quo).** Sessions remain greppable markdown; no index.
- **B — Vector namespace only.** Add a `council-sessions` semantic-memory namespace for recall.
- **C — Vector + provenance edges.** B plus traversable session↔ODR edges.
- **D — All three: vector + edges + ReasoningBank.** C plus ReasoningBank trajectory/verdict capture for learning.
- **E — All four: D + hierarchical `episodic` tier (CHOSEN).** D plus each session filed in the hierarchical store's `episodic` tier under `council/*`, enumerable alongside the `odr/*` and `adr/*` records — total coverage. (Largely redundant with the vector namespace and git; included only for completeness.)

## Decision Outcome

Chosen option: **E — total coverage with all four complementary mechanisms**, because each serves a genuinely distinct access pattern and consumer, and the project wants complete coverage: a **vector namespace** answers *"find the relevant prior deliberation"* (recall), **provenance edges** answer *"which session produced this decision, and what else did it feed?"* (traversal), and a **ReasoningBank trajectory store** answers *"which argument patterns tend to win, so future councils reason better"* (learning), and the **hierarchical `episodic` tier** files each session as a first-class, enumerable event-memory under `council/*` alongside the `odr/*`/`adr/*` records (enumeration) — largely redundant with the vector namespace and git, included only to satisfy total coverage and recorded honestly as the one place where *complete* and *non-redundant* conflict. Sessions are indexed as **auxiliary entries keyed on session id**, never as `odr/*` records — preserving the rule that only ODRs are records and sessions merely link to them.

### Consequences

* Good, because the re-open triggers and held-as-live dissents become **queryable** — a proposed change can be checked against recorded triggers before acting, making the ODR-0001 deferral discipline operational (parity with the ADR-0005 register on the engineering side).
* Good, because the deliberation *why* — not just the decision *what* — is recallable before a new council convenes.
* Good, because the session↔ODR provenance link becomes a one-hop graph traversal (`derivedFrom` / `deliberated`).
* Good, because the ReasoningBank layer lets AI-assisted councils improve over time by distilling which argument/DA-challenge patterns succeed.
* Bad, because three stores are three things to keep in sync as sessions are added; an `odr-create`/council-authoring follow-up must also write the session entry, or a periodic re-index must backfill.
* Bad, because the **ReasoningBank layer only pays off at scale** — it adds storage + maintenance now for a benefit that materialises only when many AI-assisted councils read the learned patterns back. Accepted deliberately as the cost of "total coverage."
* Neutral-to-bad, because the **hierarchical episodic tier** (mechanism 4) largely duplicates the vector namespace (mechanism 1) and the git folder; its only unique value is enumerating sessions *in the same store as the records*. Included for total coverage, with the redundancy recorded so it is not mistaken for load-bearing.
* Neutral, because sessions remain durable in git regardless; all three stores are *derived indexes* and can be rebuilt from the markdown.
* Neutral, because no new ontology terms or records are minted — this is an indexing/infrastructure decision, not an ontology-modelling one (hence an ADR, not an ODR).

### Confirmation

- A `council-sessions` namespace query returns the indexed sessions; a trigger query (e.g. semantic search for "re-open trigger" + a candidate change) surfaces matching live dissents.
- `causal-query` traverses `session-NNN ⇄ odr/ODR-NNNN` in both directions.
- The ReasoningBank store returns at least one trajectory per indexed session with its verdict captured.
- The hierarchical `episodic` tier enumerates the sessions under `council/*` (a distinct path *and* tier from the `odr/*`/`adr/*` semantic-tier records).
- Session ids never appear under `odr/*` (sessions stay non-records); `odr-index` still indexes exactly the ODRs.

## Mapping

Concrete per-store mapping (sessions are keyed on **session id** — `session-NNN`, `scope-check-1`, `session-phase-3.5-…` — never `ODR-NNNN`):

| # | Mechanism | Tool | Key / shape |
|---|---|---|---|
| 1 | **Recall** — semantic search | `mcp__ruflo__memory_store`, namespace `council-sessions` | key `session-NNN`; value = `<title> — verdict + named re-open triggers + held-as-live dissents + panel`. The triggers/dissents are the load-bearing, future-conditional content (not the whole transcript). |
| 2 | **Provenance** — graph | `mcp__ruflo__agentdb_causal-edge` | forward `session-NNN —deliberated→ odr/ODR-NNNN`; inverse `odr/ODR-NNNN —derivedFrom→ session-NNN`. One pair per ODR↔session link (incl. one-session-feeds-many, e.g. `scope-check-1 → ODR-0016`). |
| 3 | **Learning** — trajectory | ReasoningBank (`reasoningbank-agentdb` skill; `agentdb_reflexion-store` / `agentdb_experience_record` / `agentdb_sona_trajectory_store`) | one trajectory per session: the position→DA-challenge→vote sequence, tagged with the verdict and DA-withdrawal/dissent outcomes, for pattern distillation. |
| 4 | **Enumeration** — event memory | `mcp__ruflo__agentdb_hierarchical-store`, tier `episodic` | key `council/session-NNN`; value = same summary as #1. Sits alongside `odr/*`/`adr/*` in the hierarchical store, enumerable via `hierarchical-query`. Largely redundant with #1 + git; included for total coverage. |

**Discipline:** the source of truth is the session markdown under `docs/ontology/odr/council/`; all four stores are derived and idempotently rebuildable from it. Adding a new session (or amending one) must update mechanisms 1, 2 and 4 (cheap) and append to 3; a backfill pass re-derives all four from the markdown.

## More Information

- **Methodology**: [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — defines council sessions, held-as-live dissents, and re-open triggers (the content mechanisms 1 and 3 capture).
- **Parallel discipline**: [ADR-0005](./ADR-0005-deferred-work-register.md) — the deferred-work register; mechanism 1's trigger-indexing is the ontology-side equivalent, making latent future-work queryable.
- **Why this is an ADR, not an ODR**: it is an infrastructure/indexing decision (which stores, what mapping) that mints no ontology terms; per the ODR/ADR boundary, "if a fact about the domain changes when stated differently it's an ODR; if only the bytes change it's an ADR."
- **Symmetry**: mirrors the existing `odr-patterns`/`adr-patterns` memory namespaces and the `odr/*`/`adr/*` record + edge graph built by `odr-index`/`adr-index` — this adds the *session* layer those skills intentionally exclude.
- **Downstream**: a follow-up executes the four indexings over the existing council corpus (~20 sessions) and wires session-creation to update the indexes.
