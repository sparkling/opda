# Pinned Diagram Design authority

The OPDA adapter delegates diagram authorship to the native Diagram Design skill. Do not vendor, paraphrase, or silently replace it.

## Identity

| Field | Pinned value |
|---|---|
| Repository | `https://github.com/cathrynlavery/diagram-design` |
| Plugin | `diagram-design@diagram-design` |
| Version | `2.4.0` |
| Commit | `09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6` |
| License | `MIT` |
| Codex cache | `~/.codex/plugins/cache/diagram-design/diagram-design/2.4.0` |

The upstream README explicitly supports Claude Code, Codex, and Pi. Native Codex installation at the pinned revision is:

```bash
codex plugin marketplace add cathrynlavery/diagram-design \
  --ref 09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6
codex plugin add diagram-design@diagram-design
```

## Required file hashes

Verify SHA-256 before each OPDA generation. Stop on mismatch and inspect upstream changes rather than accepting drift.

| Relative path | SHA-256 |
|---|---|
| `README.md` | `12d51301d2204fac89375768b7ada26abc6282b324e36fb47543c1a7e802c88b` |
| `skills/diagram-design/SKILL.md` | `8366ef4d11c3a9591556deb55320ea3521c138ccdad834eb087b8062f41d93a1` |
| `commands/import-mermaid.md` | `b4933a5b4dff1a68b7d073e3cf6b126469207b2eba191d456f4146cac261efba` |
| `skills/diagram-design/references/import-mermaid.md` | `491ff83440fc995401b5ba20f63325f976732bf1669003c1840b4137072cc274` |
| `skills/diagram-design/references/output-spec.md` | `d8fa916f523b99ada083a652f4440d3f0d086a8af61ae333bac50153338f42a3` |
| `skills/diagram-design/references/type-architecture.md` | `cb5672b5c69cbe24a0b18d144f8b2e4507a124ebb0dbc0bc898ceafb27612caa` |
| `skills/diagram-design/references/type-er.md` | `61ee3643c9e3a1e2c3a329640132ede2c193bfabaebbbb5fa486be800b6afa29` |
| `skills/diagram-design/references/style-guide.md` | `a122617d3528795c3be8918c50c53bfb758beec735b9d57abecce47e52f1ecbb` |
| `skills/diagram-design/references/onboarding.md` | `7b9ef85e8f79c6f32e7c92c785d65b9abbaa5036e678a4eb056764a04b0f887a` |
| `skills/diagram-design/references/profiles.md` | `51f6d24e40eca1a13dc562b4b33aa76b56172c5c30fc94897e5bb369a34f9886` |
| `skills/diagram-design/scripts/mermaid_extract.py` | `297ff6a8042c33d33df72ac4384bf666b2ab045f74030269adb45a89a7a2e0f8` |

## Invocation contract

- Entrypoint: `$diagram-design`
- Operation: `import-mermaid`
- Output source of truth: self-contained HTML with an accessible SVG
- Runtime status: authoring only; no npm/browser dependency
- Failure policy: extractor, hash, fidelity, accessibility, or geometry failure stops integration

Record the invoked native provider, stable command form, result, input/output hashes, selected profile, dials, type override, and validation results in the diagram receipt. A statement that the method was “followed” is not evidence of invocation.
