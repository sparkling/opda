# Hand-off to the hm project — let the `/council` skill own council mechanism

**Prepared by:** the opda project (sibling), 2026-06-01, after opda performed the same purge. Both projects use the same user-level `/council` skill. **Execute this inside an hm session** — it respects hm's `feedback_never_touch_other_projects`, and an hm session has hm's full context + the `ruflo` CLI on hand. opda changed **nothing** in hm.

**Status:** advisory + analyzed. The CLAUDE.md line numbers and memory keys below were verified against hm on 2026-06-01 (line numbers may drift — match on the verbatim text).

---

## The principle

The `/council` skill (operating procedure) + **ODR-0001** (methodology) are the **single source of truth for how to run a council.** Any instruction in CLAUDE.md or memory that *also* prescribes council mechanism drifts from the skill and gets followed *instead of* it. In opda, two drifted memories literally said *"skip Agent-Teams `SendMessage` cross-talk"* and *"escalate to `hive-mind/byzantine` when a verdict is conditional"* — both overrode the skill and caused a council to be run wrong (seven isolated opinions with no dialectic; then a wrongful hive escalation). The fix is to remove the council-mechanism instructions and let the skill stand alone.

## The model — read this first, to avoid over-removing

Two **distinct layers**; do not conflate them (this is the directing author's model, confirmed 2026-06-01):

- **Orchestration** — swarm/hive coordination + state → **always via the CLI (`npx … ruflo …`).** This is hm's existing rule and it is **valid. Keep it.**
- **Implementation** — the actual agents doing the work; council panelists deliberating → **always Agent Teams (`SendMessage`).**

A **council**, per the skill, is **agent-fan-out** (swarm-shaped orchestration) **+ Agent-Teams cross-talk** (implementation). It is **NOT** a hive-mind — hive is a *reserved exception* the skill escalates to only on a specific trigger (a verdict structurally conditional on another; a typed object consumed by tooling). "The disposition follows from the substantive verdicts" is **normal fan-out, not a hive trigger.**

So **`npx`-CLI-for-orchestration + Agent-Teams-for-implementation is the correct, valid combination.** The *only* thing to fix is anything that routes a **council** to a **hive** (contradicting the skill's fan-out default) or re-states council how-to-run that the skill already owns.

---

## What to change in hm

### CLAUDE.md — remove the 3 council→hive lines; KEEP the CLI section

**REMOVE** (verbatim; ≈ L121, L125, L136) — each routes councils to `hive-mind`, contradicting the skill's fan-out default:

```
| High-stakes decision, ADR ratification, multi-perspective review | `hive-mind_spawn` (or `ruflo hive-mind spawn --claude`) | Treat as anti-sprawl violation |
```
```
- Use `hive-mind_spawn` (or `ruflo hive-mind spawn --claude`) when convening a council: named experts, per-question voting, Byzantine consensus, queen synthesis. (ADR-0115 carve-out — NOT bundled into swarm-sprawl prohibition.)
```
```
| Convene a council on a high-stakes decision | `mcp__ruflo__hive-mind_spawn` (or invoke the `hive-mind-advanced` skill) | `Agent` fan-out (no synthesis) |
```

Do **not** add a replacement — the `/council` skill is discoverable on its own and is the authority. (Removing the first row also drops its "anti-sprawl carve-out"; that's fine — a skill-invoked council is an *explicit* action, not a reflexive `swarm_init`, so the anti-sprawl prohibition doesn't apply to it.)

**KEEP** — the **"Swarms and hives — ALWAYS use the CLI (npx)"** section (≈ L159-164). That is the *orchestration-substrate* rule and it is **valid** (CLI orchestrates; Agent Teams implements). Do **not** remove it. If you want belt-and-braces, add one clause: *"…councils follow the `/council` skill (agent-fan-out + Agent-Teams cross-talk), not a hive."*

### Memory (`~/source/hm/semantic-modelling/.claude/memory/`)

> The auto-memory path is a **symlink** to this in-repo dir, and it is **checked into hm's git.** Per hm's own `feedback_use_memory_tools_not_rm`, **remove entries with `npx -y @sparkleideas/cli@latest memory delete -k <key>` — never `rm` / `Write`** (raw deletes leave orphaned index entries + break search). Confirm exact keys with `… memory list` first, then prune `.claude/memory/MEMORY.md` (the index).

**REMOVE (confident — the skill owns this):**

| Entry | Why |
|---|---|
| `feedback_council_adjacent_storage` | council-transcript storage convention — the skill already specifies the session-record location (`docs/ontology/odr/council/session-NNN`). |

**REVIEW (your call — these are *hive-execution* lessons; remove if the `/council` skill subsumes them, keep if they are valid general-hive discipline used *outside* councils):**

| Entry | Note for the decision |
|---|---|
| `feedback_hive_pushback_on_frame` | "the brief's framing constrains what the hive produces" — does the skill's convening-block guidance cover this? |
| `feedback_hive_queen_must_wait_for_all_panellists` | Queen must not spawn until all panellists report — **mild conflict**: the skill's protocol is "retry a missing worker once, else default to `abstain`." Reconcile or drop. |
| `feedback_wait_for_hive` | "take zero action until the Queen's synthesis arrives" — CLAUDE.md already has a general "after spawning agents, wait for results." |

**KEEP (orchestration guidance / not council-mechanism):**

| Entry | Why keep |
|---|---|
| `feedback_swarm_vs_hive_distinction` | swarm-vs-hive routing on user request — *orchestration*, valid. |
| `feedback_swarm_source_of_truth` | "use ruflo/CLAUDE.md for swarm/hive how-to; never accumulate how-to in memory" — orchestration, and *aligned* with this very purge. |
| `project_council_404_role_filter` | a *record of a council's decision*, not an instruction. |
| `feedback_always_update_adr_after_review` | ADR-update workflow (mentions councils, but isn't council mechanism). |

## Mechanism + hygiene

1. **Memory:** `ruflo memory delete -k <key>` (NOT `rm`), then prune `MEMORY.md`; verify `ruflo memory list` / search still resolves (no orphans).
2. **CLAUDE.md:** a normal text edit; commit per hm's `feedback_commit_often`.
3. **Do it in an hm session** — full hm context + the `ruflo` CLI present.

## Verification (done state)

- `grep -niE 'council|hive-mind' CLAUDE.md` → no instruction routing a council to a hive. (The CLI-for-swarm/hive section may still say "hive" — that's the orchestration rule, and it's fine.)
- `ruflo memory list | grep -iE 'council|hive'` → only the kept items (the decision record; the orchestration memories; any hive-execution lessons you chose to keep).
- The `/council` skill is the **only** place describing *how to run a council.*

## For reference — what opda did

opda removed **3** CLAUDE.md council→hive instructions + **5** council-mechanism memories (including the two that caused its failures), de-indexed `MEMORY.md`, and stripped dangling `[[links]]`. opda's `/council` skill is now its sole council authority. opda **kept** all general swarm/hive *orchestration* guidance — the orchestration layer was never the problem; only the council→hive routing was.
