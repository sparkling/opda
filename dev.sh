#!/usr/bin/env bash
# Run Astro dev on the first free port in the range 4321–4329.
#
# Reason this exists: Astro defaults to 4321, but if another tool is already
# bound (a previous run that didn't shut down cleanly, vite from another
# project, etc.) astro will silently fall through to 4322, 4323, … which
# makes the "where is my server" question annoying. This script probes
# explicitly, reports what it finds, then launches astro on a known-free port.
#
# Usage:
#   ./dev.sh
#   ./dev.sh --host       # expose on network (use --host argument to astro)
#
# Stop with Ctrl-C.

set -euo pipefail
cd "$(dirname "$0")"

# Detect a port in the 4330-4339 range that nothing is listening on.
# (4321-4329 historically conflicted with other dev tools on this machine.)
PORT=""
for candidate in 4330 4331 4332 4333 4334 4335 4336 4337 4338 4339; do
  # macOS: lsof. Linux fallback: ss. Either-or; check both.
  if command -v lsof >/dev/null 2>&1; then
    if ! lsof -nP -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
      PORT=$candidate; break
    fi
  elif command -v ss >/dev/null 2>&1; then
    if ! ss -ltn 2>/dev/null | grep -qE ":${candidate}\b"; then
      PORT=$candidate; break
    fi
  else
    # Bash /dev/tcp probe — works without lsof or ss
    (echo > "/dev/tcp/127.0.0.1/$candidate") 2>/dev/null \
      && occupied=1 || occupied=0
    if [ "$occupied" -eq 0 ]; then PORT=$candidate; break; fi
  fi
done

if [ -z "$PORT" ]; then
  echo "✗ All ports 4330–4339 are occupied. Free one or run:"
  echo "    npx astro dev --port <port>"
  exit 1
fi

# Show what's on 4330 if we had to skip it
if [ "$PORT" != "4330" ] && command -v lsof >/dev/null 2>&1; then
  echo "Port 4330 is in use by:"
  lsof -nP -iTCP:4330 -sTCP:LISTEN 2>/dev/null \
    | awk 'NR==1 {print "  " $0; next} {print "  " $1, "pid", $2, $9}' \
    | head -5
  echo
fi

echo "▸ Using port $PORT"
echo "▸ Open http://localhost:${PORT}/ once Astro reports ready"
echo

# Ensure deps are installed before launching
if [ ! -d node_modules/astro ]; then
  echo "▸ Installing npm deps (one-time)…"
  npm install --no-fund --no-audit
fi

exec npx astro dev --port "$PORT" "$@"
