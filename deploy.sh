#!/usr/bin/env bash
# OPDA Knowledge Base — end-to-end deploy.
#
#   1. Verify local prereqs (gh, wrangler, node, git)
#   2. Initialise git if needed; ensure remote 'origin' points at GitHub
#   3. Create the GitHub repo if it doesn't exist (under your personal account)
#   4. Commit + push
#   5. Build Astro → dist/
#   6. Deploy dist/ to Cloudflare Pages (project: opda-kb)
#   7. Print the live URL
#
# Run from the project root:
#   ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

REPO_NAME="opda-kb"
CF_PROJECT="opda-kb"
DEFAULT_BRANCH="main"

# ──────────────────────────────────────────────────────────────────────
# Pretty-printer
# ──────────────────────────────────────────────────────────────────────
B() { printf '\n\033[1;34m▸ %s\033[0m\n' "$*"; }
S() { printf '  \033[0;32m✓\033[0m %s\n' "$*"; }
W() { printf '  \033[0;33m!\033[0m %s\n' "$*"; }
E() { printf '  \033[0;31m✗\033[0m %s\n' "$*" 1>&2; exit 1; }

# ──────────────────────────────────────────────────────────────────────
# 1. Prereqs
# ──────────────────────────────────────────────────────────────────────
B "Checking local tools"
need() { command -v "$1" >/dev/null 2>&1 || E "$1 not found. Install: $2"; }
need gh        "brew install gh"
need wrangler  "npm install -g wrangler"
need node      "brew install node"
need npm       "(comes with node)"
need git       "(comes with macOS / Xcode CLT)"

gh auth status >/dev/null 2>&1   || E "gh not authenticated. Run: gh auth login"
S "gh authenticated"

wrangler whoami >/dev/null 2>&1  || E "wrangler not authenticated. Run: wrangler login"
S "wrangler authenticated"

GH_USER=$(gh api user --jq .login)
[[ -n "$GH_USER" ]] || E "Could not read GitHub username"
S "GitHub user: $GH_USER"

REPO_FULL="${GH_USER}/${REPO_NAME}"
REPO_URL="https://github.com/${REPO_FULL}.git"

# ──────────────────────────────────────────────────────────────────────
# 2. Local git
# ──────────────────────────────────────────────────────────────────────
B "Preparing local git repository"
if [[ ! -d .git ]]; then
  git init -b "$DEFAULT_BRANCH" >/dev/null
  S "git init (branch: $DEFAULT_BRANCH)"
else
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [[ "$current_branch" != "$DEFAULT_BRANCH" && -n "$current_branch" ]]; then
    git branch -M "$DEFAULT_BRANCH" 2>/dev/null || true
  fi
  S "git already initialised"
fi

# Stage everything respecting .gitignore
git add -A
if git diff --cached --quiet; then
  S "nothing to commit"
else
  COMMIT_MSG=${1:-"Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"}
  git commit -m "$COMMIT_MSG" >/dev/null
  S "committed: $COMMIT_MSG"
fi

# ──────────────────────────────────────────────────────────────────────
# 3. GitHub remote
# ──────────────────────────────────────────────────────────────────────
B "Ensuring GitHub repo $REPO_FULL exists"
if gh repo view "$REPO_FULL" >/dev/null 2>&1; then
  S "repo exists on GitHub"
else
  gh repo create "$REPO_FULL" \
    --public \
    --description "OPDA Knowledge Base — Property Data Trust Framework documentation and semantic models" \
    --homepage "https://opda-kb.pages.dev" >/dev/null
  S "created $REPO_FULL"
fi

# Set / update origin
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi
S "origin → $REPO_URL"

# ──────────────────────────────────────────────────────────────────────
# 4. Push
# ──────────────────────────────────────────────────────────────────────
B "Pushing to GitHub"
git push -u origin "$DEFAULT_BRANCH"
S "pushed $DEFAULT_BRANCH"

# ──────────────────────────────────────────────────────────────────────
# 5. Build Astro
# ──────────────────────────────────────────────────────────────────────
B "Installing npm deps + building Astro"
if [[ ! -d node_modules ]]; then
  npm install --no-fund --no-audit
fi
npm run build
[[ -d dist ]] || E "Astro build produced no dist/ — aborting"
S "build complete ($(find dist -type f | wc -l | tr -d ' ') files in dist/)"

# ──────────────────────────────────────────────────────────────────────
# 6. Deploy to Cloudflare Pages
# ──────────────────────────────────────────────────────────────────────
B "Deploying to Cloudflare Pages (project: $CF_PROJECT)"
# Create the project if it doesn't already exist
if ! wrangler pages project list 2>/dev/null | grep -q "^${CF_PROJECT}\b"; then
  wrangler pages project create "$CF_PROJECT" --production-branch="$DEFAULT_BRANCH" >/dev/null 2>&1 \
    && S "created Pages project $CF_PROJECT" \
    || W "could not pre-create project (will be created on first deploy)"
fi

# Deploy
DEPLOY_OUT=$(wrangler pages deploy ./dist \
  --project-name="$CF_PROJECT" \
  --branch="$DEFAULT_BRANCH" \
  --commit-dirty=true 2>&1) || E "wrangler pages deploy failed:\n$DEPLOY_OUT"

echo "$DEPLOY_OUT"

# Extract the deployed URL from wrangler's output
LIVE_URL=$(printf '%s\n' "$DEPLOY_OUT" | grep -Eo 'https://[a-z0-9-]+\.opda-kb\.pages\.dev|https://opda-kb\.pages\.dev' | head -1)
[[ -z "$LIVE_URL" ]] && LIVE_URL="https://${CF_PROJECT}.pages.dev"

# ──────────────────────────────────────────────────────────────────────
# 7. Summary
# ──────────────────────────────────────────────────────────────────────
B "Done"
S "GitHub: https://github.com/${REPO_FULL}"
S "Live:   ${LIVE_URL}"
S "Pages:  https://dash.cloudflare.com/?to=/:account/pages/view/${CF_PROJECT}"
