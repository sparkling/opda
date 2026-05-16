#!/usr/bin/env python3
"""Build the PDTF object model artefacts.

Reads `_build/leaves.json` + the theme map, derives the object tree, assigns
each object to a Schema-section page (same prefix rules as leaves), and
writes:

  _build/objects.json       all objects (path, id, fields, children)
  _build/object-pages.json  page slot -> [object paths owned by that page]

Run via `scripts/build-schema-pages.py build --all`, or stand-alone for
quick inspection.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from _lib import object_model  # noqa: E402

import yaml  # noqa: E402

BUILD = ROOT / "_build"
LEAVES_JSON = BUILD / "leaves.json"
CLASSIFIED_JSON = BUILD / "classified.json"
PAGE_LEAVES_JSON = BUILD / "page-leaves.json"
THEME_MAP = ROOT / "source/00-deliverables/semantic-models/theme-map.yaml"

OUT_OBJECTS = BUILD / "objects.json"
OUT_PAGE_INDEX = BUILD / "object-pages.json"


def main() -> int:
    if not LEAVES_JSON.exists():
        print(f"missing {LEAVES_JSON}; run schema walk first", file=sys.stderr)
        return 1

    leaves = json.loads(LEAVES_JSON.read_text())

    # Build object tree from leaves
    model = object_model.build(leaves)

    # Page assignment: use the existing page-leaves.json (built by
    # build-schema-pages.py) as the canonical leaf->page mapping. Falls back
    # to theme-map prefix matching when page-leaves.json isn't present.
    leaf_to_page: dict[str, str] = {}
    if PAGE_LEAVES_JSON.exists():
        page_data = json.loads(PAGE_LEAVES_JSON.read_text())
        for slot, leaves_for_page in page_data.items():
            for lf in leaves_for_page:
                leaf_to_page[lf["path"]] = slot
    else:
        # Fall back: theme-map prefix match (loose)
        theme = yaml.safe_load(THEME_MAP.read_text())
        index = []
        for slot, cfg in (theme.get("pages") or {}).items():
            for sec in cfg.get("sections") or []:
                for prefix in sec.get("prefixes", []):
                    index.append((prefix, slot))
        index.sort(key=lambda x: -len(x[0]))
        for leaf in leaves:
            for prefix, slot in index:
                p = leaf["path"]
                if p == prefix or p.startswith(prefix + ".") or p.startswith(prefix + "["):
                    leaf_to_page[p] = slot
                    break

    obj_to_page, by_page = object_model.assign_to_pages(
        model["by_path"], None, lambda p: leaf_to_page.get(p)
    )

    # Annotate objects with their page slot for convenience
    for obj in model["objects"]:
        obj["page"] = obj_to_page.get(obj["path"], None)

    OUT_OBJECTS.write_text(
        json.dumps(model["objects"], indent=2, sort_keys=False)
    )
    OUT_PAGE_INDEX.write_text(
        json.dumps(by_page, indent=2, sort_keys=True)
    )

    print(f"wrote {OUT_OBJECTS.relative_to(ROOT)}  ({len(model['objects'])} objects)")
    print(f"wrote {OUT_PAGE_INDEX.relative_to(ROOT)}")
    # Per-page summary
    for slot in sorted(by_page.keys()):
        n = len(by_page[slot])
        leaf_count = sum(model["by_path"][p]["field_count"] for p in by_page[slot])
        print(f"  page {slot}: {n:>4} objects · {leaf_count:>4} scalar fields")
    return 0


if __name__ == "__main__":
    sys.exit(main())
