#!/usr/bin/env python3
"""Generate .js wrappers for selected JSON files so they load over file://.

Each wrapper sets window.__OPDA_RESOURCE[<canonical path>] = <parsed JSON>
so the resource viewer can <script>-tag it in when fetch() is blocked.

Run from the project root:
    python3 scripts/build-json-bundles.py
"""
import json
import sys
from pathlib import Path

ROOT     = Path(__file__).resolve().parent.parent
OUT_BASE = ROOT / "public" / "data" / "resources"

# Only bundle JSON files in these subtrees — the ones the docs actually link to.
INCLUDE_PREFIXES = [
    "source/00-deliverables/",
    "source/03-standards/schemas/src/schemas/v3/",
]

# Skip these: derived/redundant or unlinked.
EXCLUDE_NAMES   = {"combined.json"}   # derived: base + every overlay merged
EXCLUDE_SUFFIX  = (".tsbuildinfo",)
MAX_SIZE        = 4 * 1024 * 1024     # 4 MB cap — fits pdtf-transaction.json (1.6 MB), drops bigger files

def main():
    bundled = 0
    skipped = 0
    total_bytes = 0

    for json_path in (ROOT / "source").rglob("*.json"):
        rel = str(json_path.relative_to(ROOT))
        if not any(rel.startswith(p) for p in INCLUDE_PREFIXES):
            continue
        if json_path.name in EXCLUDE_NAMES or any(rel.endswith(s) for s in EXCLUDE_SUFFIX):
            skipped += 1; continue
        size = json_path.stat().st_size
        if size > MAX_SIZE:
            print(f"  skip (too large, {size//1024} KB): {rel}")
            skipped += 1; continue

        try:
            content = json.loads(json_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  skip (parse error): {rel} — {e}")
            skipped += 1; continue

        # Mirror the path under docs/data/resources/, with .json → .json.js
        out_path = OUT_BASE / Path(rel).with_suffix(".json.js")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("window.__OPDA_RESOURCE=window.__OPDA_RESOURCE||{};\n")
            f.write(f"window.__OPDA_RESOURCE[{json.dumps(rel)}]=")
            json.dump(content, f, separators=(",", ":"), ensure_ascii=False)
            f.write(";\n")
        bundled += 1
        total_bytes += out_path.stat().st_size

    print()
    print(f"Bundled {bundled} JSON files into {OUT_BASE.relative_to(ROOT)}/")
    print(f"Total wrapper size: {total_bytes/1024/1024:.2f} MB")
    print(f"Skipped: {skipped}")

if __name__ == "__main__":
    main()
