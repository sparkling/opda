#!/usr/bin/env python3
"""Build docs/data/schema-er-registry.js from sidecar ER diagrams.

For every entity referenced in any schema-page sidecar's `er_diagram`,
emit a `{ page, anchor, isSection }` triple identifying its canonical home:

  - If a sidecar declares a section h2 id matching (a normalised form of)
    the entity name → the canonical home is that page+section. Clicking
    the node scrolls to the table.
  - Else if the entity has an attribute block (`ENTITY { ... }`) on some
    page → canonical home is that page's #er anchor. Clicking the node
    takes you to the page that defines the entity in its ER diagram.
  - Else: the first page that mentions the entity, anchor=#er.

The JS at runtime tries same-page section ids first (since some local
sections aren't in this registry); the registry is the cross-page
fallback.

Output: docs/data/schema-er-registry.js — sets window.OPDA_ER_REGISTRY.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "source/_content/schema"
THEME_MAP = ROOT / "source/00-deliverables/semantic-models/theme-map.yaml"
OUT = ROOT / "docs/data/schema-er-registry.js"

PAGE_FILES = {
    "34": "34-physical-architecture.html",
    "35": "35-transaction-participants.html",
    "36": "36-chain-milestones-contracts.html",
    "37": "37-property.html",
    "38": "38-legal-estate-title.html",
    "39": "39-built-form-condition-valuation.html",
    "45": "45-utilities-energy.html",
    "46": "46-local-context-searches.html",
    "47": "47-encumbrances-completion.html",
    "48": "48-evidence-documents-declarations.html",
    "49": "49-overlays-tasks-crosscuts.html",
}


def name_forms(entity: str) -> list[str]:
    """Return possible section-id forms for a Mermaid entity name."""
    lower = entity.lower()
    forms = {lower, lower + "s"}
    if lower.endswith("s"):
        forms.add(lower[:-1])
    # Some ER names use underscores; section ids use underscores too in this site.
    forms.add(lower.replace("-", "_"))
    return list(forms)


_ATTR_BLOCK_OPEN = re.compile(r"^([A-Z][A-Z_0-9]*)\s*\{")
# Match an UPPER_SNAKE token that's at least 2 characters and isn't all digits.
_ENTITY_TOKEN = re.compile(r"\b([A-Z][A-Z_0-9]{1,})\b")


def parse_er(mermaid_src: str) -> tuple[set[str], set[str]]:
    """Return (all_entities, entities_with_attribute_block)."""
    all_e: set[str] = set()
    block_e: set[str] = set()
    in_block = False
    for raw in mermaid_src.splitlines():
        line = raw.strip()
        if in_block:
            if line == "}":
                in_block = False
            continue
        m = _ATTR_BLOCK_OPEN.match(line)
        if m:
            ent = m.group(1)
            all_e.add(ent)
            block_e.add(ent)
            in_block = True
            continue
        # Skip header / comments
        if line.startswith("erDiagram") or line.startswith("%%") or line == "":
            continue
        # Anything that looks like an entity token contributes
        for tm in _ENTITY_TOKEN.finditer(line):
            tok = tm.group(1)
            # Skip noise: pure colour-hex tokens (rare), syntax keywords if any
            if re.fullmatch(r"[0-9A-F]{6}", tok):
                continue
            all_e.add(tok)
    return all_e, block_e


def load_sidecar(path: Path) -> dict | None:
    txt = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.+?)\n---", txt, re.DOTALL)
    if not m:
        return None
    return yaml.safe_load(m.group(1))


def main() -> int:
    if not THEME_MAP.exists():
        print(f"theme-map missing: {THEME_MAP}", file=sys.stderr)
        return 1
    theme = yaml.safe_load(THEME_MAP.read_text(encoding="utf-8"))

    # slot → set of section ids
    section_ids: dict[str, set[str]] = {}
    for slot, entry in (theme.get("pages") or {}).items():
        sections = entry.get("sections") or []
        ids = {s.get("id") for s in sections if isinstance(s, dict) and s.get("id")}
        section_ids[str(slot)] = ids

    # slot → (all_entities, block_entities)
    page_entities: dict[str, tuple[set[str], set[str]]] = {}
    for md in sorted(CONTENT.glob("*.md")):
        fm = load_sidecar(md)
        if not fm:
            continue
        slot = str(fm.get("slot") or fm.get("page") or md.stem.split("-")[0])
        er_src = ((fm.get("regions") or {}).get("er_diagram") or "").strip()
        if not er_src:
            continue
        page_entities[slot] = parse_er(er_src)

    # Build registry: entity → canonical home.
    registry: dict[str, dict] = {}
    all_entities: set[str] = set()
    for slot, (all_e, _) in page_entities.items():
        all_entities |= all_e

    for entity in sorted(all_entities):
        target = None

        # 1) Prefer page where a section h2 id matches a name form of the entity.
        forms = name_forms(entity)
        for slot, ids in section_ids.items():
            hit = next((f for f in forms if f in ids), None)
            if hit:
                target = {
                    "page": PAGE_FILES.get(slot),
                    "anchor": hit,
                    "isSection": True,
                }
                break

        # 2) Else page where entity has its attribute block.
        if not target:
            for slot, (_, block_e) in page_entities.items():
                if entity in block_e:
                    target = {
                        "page": PAGE_FILES.get(slot),
                        "anchor": "er",
                        "isSection": False,
                    }
                    break

        # 3) Else first page that mentions the entity (deterministic order).
        if not target:
            for slot in sorted(page_entities.keys()):
                if entity in page_entities[slot][0]:
                    target = {
                        "page": PAGE_FILES.get(slot),
                        "anchor": "er",
                        "isSection": False,
                    }
                    break

        if target and target["page"]:
            registry[entity] = target

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(registry, indent=2, sort_keys=True)
    OUT.write_text(
        "// Auto-generated by scripts/build-er-registry.py. Do not edit.\n"
        "// Maps ER-diagram entity names to their canonical page/anchor.\n"
        "window.OPDA_ER_REGISTRY = " + body + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT.relative_to(ROOT)} — {len(registry)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
