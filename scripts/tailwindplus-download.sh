#!/usr/bin/env bash
# Run the TailwindPlus downloader using credentials sourced from .env.
#
# Reads TAILWINDPLUS_EMAIL + TAILWINDPLUS_PASSWORD from .env, writes them
# to a temporary downloader-credentials JSON file (chmod 600), invokes
# the downloader, and removes the JSON file on exit. The downloader's
# own session.json is kept inside .tailwindplus/ for subsequent
# re-authentication. Everything in .tailwindplus/ is gitignored.
#
# Usage: pnpm tailwindplus:download
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
WORK_DIR="$ROOT/.tailwindplus"
CRED_FILE="$WORK_DIR/.tailwindplus-downloader-credentials.json"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found. Copy .env.template to .env and fill in TAILWINDPLUS_EMAIL + TAILWINDPLUS_PASSWORD." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${TAILWINDPLUS_EMAIL:?TAILWINDPLUS_EMAIL is unset in .env}"
: "${TAILWINDPLUS_PASSWORD:?TAILWINDPLUS_PASSWORD is unset in .env}"

mkdir -p "$WORK_DIR"

cleanup() {
  rm -f "$CRED_FILE"
}
trap cleanup EXIT INT TERM

# Materialise the credentials JSON the downloader expects, with restrictive perms.
umask 077
node -e '
  const fs = require("fs");
  const out = JSON.stringify({
    email: process.env.TAILWINDPLUS_EMAIL,
    password: process.env.TAILWINDPLUS_PASSWORD,
  });
  fs.writeFileSync(process.argv[1], out);
' "$CRED_FILE"

cd "$WORK_DIR"
npx github:richardkmichael/tailwindplus-downloader#latest "$@"
