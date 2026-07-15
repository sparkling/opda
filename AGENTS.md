# opda

> Multi-agent orchestration project (Claude Flow / ruflo).
>
> **This file (`AGENTS.md`) is the single CANONICAL, shared instruction source for
> BOTH OpenAI Codex and Claude Code.** Codex reads it directly; Claude Code imports
> it via `@AGENTS.md` at the top of `CLAUDE.md`. Edit SHARED instructions HERE.
> Claude-Code-only guidance lives in `CLAUDE.md` (below its `@AGENTS.md` line).

## Project

opda is a new linked-data project for a new data standard for property data, backed by
government, finance, banking, estate agents, surveyors, etc. They already have a JSON
standard; the first step is to create the linked-data model for these standards. First
comes a plan, roadmap, and presentations for the approach. This also includes setting up
DCAM-based data governance, and engaging with stakeholders in activities such as semantic
modelling: glossaries, taxonomies, dictionaries, data models, etc.

There is a lot of information involved. Follow all links and index them. Transcribe YouTube
videos and recordings if not already done. Find all documentation in the GitHub repos. Scan
the entire company website. Index links to several levels. Download all resources to the
project folder and organise it. Maintain a project README.

## Rules

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary; prefer editing existing files
- NEVER create documentation files unless explicitly requested
- NEVER save working files or tests to root; use `/src`, `/tests`, `/docs`, `/config`, `/scripts`
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or `.env` files
- Do NOT add a `Co-Authored-By` trailer to user commits unless this project explicitly opts in
- Keep files under 500 lines
- Validate input at system boundaries

## Swarm & Coordination

| Setting | Value | Purpose |
|---------|-------|---------|
| Topology | `hierarchical` | Queen-led coordination (anti-drift) |
| Max Agents | 8 | Optimal team size |
| Strategy | `specialized` | Clear role boundaries |
| Consensus | `raft` | Leader-based consistency |

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

### When to use a swarm
- **YES**: 3+ files, new features, cross-module refactoring, API changes with tests, security-related changes, performance optimization
- **NO**: single-file edits, 1–2 line fixes, documentation updates, configuration changes, questions

### Agent types

| Type | Role |
|------|------|
| `researcher` | Requirements analysis, understanding scope |
| `architect` / `system-architect` | System design, planning structure |
| `coder` / `backend-dev` | Implementation |
| `tester` | Test creation, quality assurance |
| `reviewer` | Code review, security and quality |

Also: `security-architect`, `security-auditor`, `performance-engineer`, `perf-analyzer`,
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `pr-manager`,
`code-review-swarm`, `issue-tracker`, `release-manager`. Any string works as a custom agent type.

## MCP Integration

Use MCP tools for coordination, then keep working. Coordination calls return instantly.

| Category | Key tools |
|----------|-----------|
| **Swarm** | `swarm_init`, `swarm_status`, `swarm_health` |
| **Agents** | `agent_spawn`, `agent_list`, `agent_status` |
| **Memory** | `memory_store`, `memory_search`, `memory_search_unified` |
| **Hooks** | `hooks_route`, `hooks_post-task`, `hooks_worker-dispatch` |
| **Security** | `aidefence_scan`, `aidefence_is_safe`, `aidefence_has_pii` |
| **Hive-Mind** | `hive-mind_init`, `hive-mind_consensus`, `hive-mind_spawn` |

## Memory & Learning

### Before any task
```bash
npx @claude-flow/cli@latest memory search --query "[task keywords]" --namespace patterns
npx @claude-flow/cli@latest hooks route --task "[task description]"
```

### After success
```bash
npx @claude-flow/cli@latest memory store --namespace patterns --key "[name]" --value "[what worked]"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true
```

### Background workers

| Worker | When |
|--------|------|
| `audit` | After security changes |
| `optimize` | After performance work |
| `testgaps` | After adding features |
| `map` | Every 5+ file changes |
| `document` | After API changes |

```bash
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit
```

## Code Standards

- File organization: never save to root; use `/src`, `/tests`, `/docs`, `/config`, `/scripts`
- Files under 500 lines
- No hardcoded secrets or API keys
- Input validation at boundaries; typed interfaces for public APIs
- TDD (London School / mock-first) preferred

### Commit messages
```
<type>(<scope>): <description>

[optional body]
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
(Do NOT append a `Co-Authored-By` trailer to user commits unless the project opts in.)

## Security

- NEVER commit secrets, credentials, or `.env` files; NEVER hardcode API keys
- Always validate user input; use parameterized queries for SQL; sanitize output (XSS)
- Path security: validate all file paths, prevent directory traversal (`../`), use absolute paths internally

## Build & Test

Tasks run through the **Makefile** (thin wrappers over npm scripts + the
`opda-gen` CLI). `make help` prints the grouped list. Key targets:

| Target | What it does |
|---|---|
| `make dev` | Astro dev server (auto-picks port 4330–4339) |
| `make build` | Static site → `dist/` (no triplestore) |
| `make build-data` | Full build: Fuseki + GRLC API + astro → `dist/` (what CI deploys; needs JDK 17+) |
| `make serve-data` | Start Fuseki + the GRLC API and keep them running (develop pages/queries against live data) |
| `make jena-load` | Load the ontology TTLs into a running Fuseki |
| `make api` | Run the GRLC SPARQL→REST API alone (needs Fuseki on :3031) |
| `make test` | Remark plugin tests (the JS unit suite) |
| `make verify-ontology` | Byte-identity: re-emit the ontology and diff vs the committed corpus |
| `make ci-ontology` | All `opda-gen` CI gates (byte-identity, three-graph, dup, profile, baspi5) — mirrors the GH workflows |
| `make ci` | Everything CI checks locally (JS + ontology gates) |
| `make deploy` | Push `main` → CI builds & deploys to Cloudflare Pages |

Each JS target wraps a matching npm script (e.g. `npm run serve:data`, `npm run jena:load`).

- There is **no `lint` script** — validation is `make test` (JS) + `make ci-ontology` (ontology).
- `opda-gen` targets run in `tools/opda-gen/` and need `make ontology-install` once first.
- Deploys are **CI-only** (push to `main`); `make deploy-manual` (direct wrangler) is an escape hatch — avoid it.
- ALWAYS run `make test` after code changes; run `make build` (or `make build-data` for triplestore-backed pages) before committing.

### Feature Workflow

1. Create or update tests first
2. Implement the change
3. Run tests — verify pass
4. Run build — verify success
5. Commit

## Codex platform notes

- **Skill syntax**: invoke skills with `$skill-name`. (Claude Code uses `/skill-name`; see `CLAUDE.md`.)
- **Execution model**: `claude-flow` = LEDGER (coordinates memory, routing, swarm state); **Codex = EXECUTOR** (writes code, runs tests, creates files). Coordination commands return instantly, so DON'T STOP after them; continue immediately with the next implementation step.
- Codex config lives in `.agents/config.toml` (project) and `.codex/config.toml` (local overrides, gitignored).

## Links
- Documentation: https://github.com/ruvnet/ruflo
- Issues: https://github.com/ruvnet/ruflo/issues
