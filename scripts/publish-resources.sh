#!/usr/bin/env bash
# OPDA Knowledge Base — publish the source/ archive to the public S3 bucket.
#
# Mirrors the whole source/ tree to the public `opda-resources` bucket, which
# CloudFront serves under https://opda.org.uk/resources/* (ADR-0054). The site
# itself ships only src/ + public/ into dist/, so source/ is otherwise invisible
# in production and every /resource.html?path=source/… link 404s. Publishing
# here is what makes those links resolve on the live site.
#
# WHY THIS RUNS LOCALLY (NOT IN CI):
#   ~500 MB of source/ is binary (videos, PDFs, exports) and gitignored by
#   design. A CI checkout does NOT contain those files, so CI cannot publish
#   them. This is a deliberate, out-of-band step the maintainer runs from a
#   working tree that has the full archive.
#
#   ⇒ Re-run `make publish-resources` after ANY change to source/ — otherwise
#     the live /resources/* mirror drifts behind your working tree.
#
# Usage:
#   make publish-resources
#   RESOURCES_BUCKET=my-bucket make publish-resources   # skip stack lookup
#
# The target performs the REAL sync (a --dryrun preview is printed first).

set -euo pipefail
cd "$(dirname "$0")/.."

# ── Pretty-printer (matches deploy.sh) ────────────────────────────────────
B() { printf '\n\033[1;34m▸ %s\033[0m\n' "$*"; }
S() { printf '  \033[0;32m✓\033[0m %s\n' "$*"; }
W() { printf '  \033[0;33m!\033[0m %s\n' "$*"; }
E() { printf '  \033[0;31m✗\033[0m %s\n' "$*" 1>&2; exit 1; }

# ── Config ────────────────────────────────────────────────────────────────
SRC_DIR="source"
STACK_NAME="opda-site"     # CloudFormation stack that exports ResourcesBucketName
AWS_REGION="eu-west-2"     # region the opda-site stack lives in (see infra.yml)

# ─────────────────────────────────────────────────────────────────────────
# EXCLUSIONS — files held back from the public mirror.
#
# The project owner has confirmed the whole source/ archive is public (ADR-0054
# — OPDA is an open project; all source material already exists publicly), so
# there are NO exclusions: the entire tree is published.
#
# To hold a file back: add an `--exclude "<glob>"` line below. Globs are
# relative to source/ (the sync root), so they carry NO leading "source/".
# ─────────────────────────────────────────────────────────────────────────
EXCLUDES=(
)

# ── 1. Prereqs ────────────────────────────────────────────────────────────
B "Checking prerequisites"
command -v aws >/dev/null 2>&1 || E "aws CLI not found. Install: brew install awscli"
S "aws CLI present"

# source/ must exist and be non-empty — never publish an empty mirror (a stray
# empty source/ + `--delete` would otherwise wipe the live bucket).
[[ -d "$SRC_DIR" ]] || E "$SRC_DIR/ not found — run from a working tree that has the archive."
if [[ -z "$(find "$SRC_DIR" -mindepth 1 -type f -print -quit 2>/dev/null)" ]]; then
  E "$SRC_DIR/ is empty — refusing to publish an empty mirror (would --delete the live bucket)."
fi
S "$SRC_DIR/ present and non-empty"

# ── 1b. Regenerate the committed manifest so it can't drift from the bucket ──
# /library/resources renders from src/data/resources-manifest.json (committed,
# since CI lacks source/). Regenerating it here — right before the sync — keeps
# the index, the page, and the published bucket in lockstep on every publish.
B "Regenerating resources manifest (src/data/resources-manifest.json)"
command -v node >/dev/null 2>&1 || E "node not found — needed to regenerate the resources manifest."
node scripts/resources-manifest.mjs
S "manifest regenerated (commit it alongside any source/ change)"

# AWS credentials must resolve before we try anything.
aws sts get-caller-identity >/dev/null 2>&1 \
  || E "AWS credentials not configured / expired. Configure a profile or run your SSO login."
S "AWS credentials OK"

# ── 2. Resolve the bucket name ────────────────────────────────────────────
B "Resolving target bucket"
if [[ -n "${RESOURCES_BUCKET:-}" ]]; then
  BUCKET="$RESOURCES_BUCKET"
  S "using \$RESOURCES_BUCKET override: $BUCKET"
else
  BUCKET=$(aws cloudformation describe-stacks --region "$AWS_REGION" \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ResourcesBucketName'].OutputValue" \
    --output text 2>/dev/null) \
    || E "could not read stack '$STACK_NAME' in $AWS_REGION (is it deployed? are creds right?)."
  if [[ -z "$BUCKET" || "$BUCKET" == "None" ]]; then
    E "stack '$STACK_NAME' has no ResourcesBucketName output — set \$RESOURCES_BUCKET to override."
  fi
  S "resolved from $STACK_NAME stack: $BUCKET"
fi

# ── 3. Preview, then sync for real ────────────────────────────────────────
B "Previewing sync → s3://$BUCKET/  (dry run; nothing uploaded yet)"
aws s3 sync "$SRC_DIR/" "s3://$BUCKET/" --delete ${EXCLUDES[@]+"${EXCLUDES[@]}"} --dryrun

B "Syncing $SRC_DIR/ → s3://$BUCKET/  (--delete: bucket mirrors source/)"
aws s3 sync "$SRC_DIR/" "s3://$BUCKET/" --delete ${EXCLUDES[@]+"${EXCLUDES[@]}"}

S "published — /resources/* now mirrors the full $SRC_DIR/ archive"
