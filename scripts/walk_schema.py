#!/usr/bin/env python3
"""Step 1 of the schema-page build pipeline: walk ``pdtf-transaction.json``
and emit ``_build/leaves.json``.

Run from the project root::

    python3 scripts/walk_schema.py

The output is deterministic — same schema in, byte-identical JSON out.
Downstream stages (provenance-classify, theme-assign, examples-bind,
render-pages) consume the leaves list by path.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Make ``scripts/_lib`` importable when run as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from _lib.schema_walker import walk  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = REPO_ROOT / "source" / "03-standards" / "schemas" / "src" / "schemas" / "v3" / "pdtf-transaction.json"
OUT_PATH = REPO_ROOT / "_build" / "leaves.json"


def _top_level_group(path: str) -> str:
    head = path.split(".", 1)[0]
    return head.split("[", 1)[0]


def main() -> int:
    if not SCHEMA_PATH.is_file():
        print(f"ERROR: schema not found at {SCHEMA_PATH}", file=sys.stderr)
        return 2

    leaves = walk(SCHEMA_PATH)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump([l.to_dict() for l in leaves], f, indent=2, ensure_ascii=False)
        f.write("\n")

    # ------- summary -------
    print(f"wrote {OUT_PATH.relative_to(REPO_ROOT)}")
    print(f"total leaves: {len(leaves)}")

    by_group: dict[str, int] = {}
    for l in leaves:
        by_group[_top_level_group(l.path)] = by_group.get(_top_level_group(l.path), 0) + 1
    print("\nleaves per top-level property:")
    for g, n in sorted(by_group.items(), key=lambda kv: -kv[1]):
        print(f"  {g:30s} {n}")

    # ------- smoke test: 5 leaves under propertyPack.councilTax -------
    ct = [l for l in leaves if l.path.startswith("propertyPack.councilTax")]
    print(f"\npropertyPack.councilTax leaves: {len(ct)} (showing first 5)")
    for l in ct[:5]:
        print(json.dumps(l.to_dict(), ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
