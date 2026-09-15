@AGENTS.md

# Claude Code overlay for opda

> **The shared, canonical instructions are in `AGENTS.md`, imported above.**
> Edit shared rules THERE: they apply to both Claude Code and Codex.
> This file carries ONLY what has no bearing on Codex. If a rule would also be
> true under Codex, it belongs in `AGENTS.md`, not here.

## Skill syntax

Claude Code invokes skills with `/skill-name`. (Codex uses `$skill-name`.)

**ruflo-managed:claude-agents:v2**

## Agent comms

The `Agent` tool and `SendMessage` are Claude Code features; Codex uses its own native agent surface. Named native agents coordinate by messaging, not by polling shared state. Native agents are not automatically Ruflo-tracked.

- Name every agent and tell it who receives which result.
- Launch independent agents together; give writers isolated worktrees and non-overlapping ownership.
- For Ruflo-tracked work, create the structured swarm/agent records before launching matching native agents.
- After spawning, continue independent work. Wait only when a real dependency blocks progress.
- Do not poll repeatedly; agents message back or complete through the native host.

## Model routing

Claude's model lineup, so it lives here and not in `AGENTS.md`. Route by complexity, not by habit:
the cheapest tier that can do the job correctly. While Codex is unavailable (see `AGENTS.md`),
every tier below is a Claude model; there is no Codex handoff.

| Tier | Handler | Model ID | Use cases |
|------|---------|----------|-----------|
| 1 | Agent Booster (WASM) | none | Mechanical transforms; skip the LLM and use an edit directly |
| 2 | Haiku 4.5 | `claude-haiku-4-5-20251001` | Simple, low-complexity tasks; ruflo routing decisions |
| 3 | Sonnet 5 | `claude-sonnet-5` | Everyday implementation, tests, refactors, read-only exploration |
| 4 | Opus 5 | `claude-opus-5` | Architecture, security review, adversarial verification |
| 5 | Fable 5.1 | `claude-fable-5-1` | Main session, orchestration, the hardest reasoning |

Subagents default to tier 3 unless the task needs tier 4 reasoning; reserve tier 5 for the lead
session. `ruflo` model stats show 57/79 past decisions routed to opus at an average complexity of
0.30: bias downward, not upward.

## Commit attribution

The Bash tool's default commit-message template suggests a `Co-Authored-By` trailer. Ignore it.
The rule itself, and its rationale, are in `AGENTS.md`.

**ruflo-managed:claude-setup:v2**

## Setup

`ruflo-core` owns the Claude MCP server when the plugin is installed. Do not register a duplicate standalone `claude-flow` server because both would write the same project state.

Direct diagnostics remain valid:

```bash
npx ruflo@latest doctor --fix
```