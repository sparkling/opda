#!/usr/bin/env bash
# Start a local HTTP server for the OPDA Knowledge Base docs.
#
# Why this exists: the resource viewer (docs/resource.html) renders JSON
# files via the JSON Crack widget, which needs to fetch() the file content.
# Modern browsers block fetch() over file:// URLs, so the docs must be
# served over http://. This script starts a Python http.server in the
# project root and opens the docs in your default browser.
#
# Usage:
#   ./serve.sh           # serves on port 8000
#   ./serve.sh 8765      # serves on the port you pass
#
# Stop with Ctrl-C.

set -e
cd "$(dirname "$0")"

PORT="${1:-8000}"
URL="http://localhost:${PORT}/docs/"

echo
echo "OPDA Knowledge Base — local server"
echo "──────────────────────────────────"
echo "  Project root: $(pwd)"
echo "  URL:          ${URL}"
echo "  Stop:         Ctrl-C"
echo

# Try to open the browser (macOS = open, Linux = xdg-open). Non-fatal if neither exists.
if command -v open >/dev/null 2>&1; then
  (sleep 0.5 && open "${URL}") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 0.5 && xdg-open "${URL}") &
fi

# Python 3 ships with macOS. If you don't have it, install via Homebrew: brew install python.
exec python3 -m http.server "${PORT}"
