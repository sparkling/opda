#!/usr/bin/env bash
set -euo pipefail

project_root="${OPDA_INBOX_AGENT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
codex_bin="${CODEX_BIN:-$(command -v codex)}"
prompt_path="$project_root/config/agents/working-group-inbox/automation-prompt.md"

cd "$project_root"

{
  printf '%s\n\n' 'This is an unattended scheduled run. Execute the following policy completely, stop safely at any failed gate, and return the compact run report it specifies.'
  sed -n '1,$p' "$prompt_path"
} | "$codex_bin" exec \
  --ephemeral \
  --json \
  --color never \
  --skip-git-repo-check \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$project_root" \
  -m gpt-5.6-sol \
  -c 'model_reasoning_effort="high"' \
  -
