"""Generate Mermaid erDiagram source from an object-model slice.

Used by build-schema-pages.py to render the per-page physical model:
every object on this page becomes a node, every parent->child relation
becomes an edge with cardinality (||--o{ for arrays, ||--|| for required
1:1, ||--o| for optional 1:1).

Attribute blocks list each object's direct scalar fields. To keep the
diagram parseable, we sanitise field names and cap each block's row count.
"""

from __future__ import annotations

import re

_SAFE_FIELD = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
_BLOCK_CAP = 18  # max rows in any attribute block; overflow rolled into "(+N more)"


def _safe_type(t: str | None) -> str:
    if not t:
        return "string"
    t = str(t).strip().lower()
    t = t.replace(" ", "").replace(",", "_")
    if not t:
        return "string"
    return t


def _safe_field_name(name: str) -> str | None:
    """Return a Mermaid-safe identifier or None if it can't be sanitised."""
    if not name:
        return None
    fixed = name.strip().replace(" ", "_").replace("-", "_")
    if _SAFE_FIELD.match(fixed):
        return fixed
    return None


def _short_comment(s: str | None) -> str:
    if not s:
        return ""
    s = str(s).replace('"', "'").replace("\n", " ").strip()
    if len(s) > 60:
        s = s[:57] + "…"
    return s


def _cardinality(child_is_array: bool, child_required: bool) -> str:
    """Return the Mermaid relation operator between parent and child."""
    if child_is_array:
        return "||--o{"           # one parent : zero-or-more children
    if child_required:
        return "||--||"           # one : one (mandatory)
    return "||--o|"               # one : optional one


def _entity_name(obj: dict) -> str:
    """Mermaid entity name — uses `display_id` if present (the short
    per-page label), otherwise the canonical `id`."""
    return obj.get("display_id") or obj["id"]


def build_er_source(
    objects_for_page: list[dict],
    by_path: dict[str, dict],
) -> str:
    """Produce a Mermaid erDiagram string for a page's object model.

    Objects sharing the same `display_id` (e.g. multiple `reports[]`
    arrays under different parents) collapse into a SINGLE Mermaid
    entity. Edges from each parent still resolve to that one box,
    which is exactly the "shared shape, multiple uses" reading.

    Uses ELK as the layout engine with `direction: DOWN` so the
    diagram flows top-to-bottom rather than Mermaid's default
    left-to-right — far more vertical real estate, better page-fit
    for deep object hierarchies.
    """
    page_paths = {obj["path"] for obj in objects_for_page}
    lines: list[str] = [
        "---",
        "config:",
        "  layout: elk",
        "  elk:",
        "    direction: DOWN",
        "    nodePlacementStrategy: BRANDES_KOEPF",
        "    mergeEdges: false",
        "---",
        "erDiagram",
    ]

    # Relations — emit by display_id so siblings merge into one node.
    for obj in objects_for_page:
        parent_name = _entity_name(obj)
        for c in obj.get("children", []):
            if c["path"] not in page_paths:
                continue
            child_obj = by_path[c["path"]]
            child_required = any(
                f.get("name") == c["field_name"] and f.get("required")
                for f in obj.get("fields", [])
            )
            card = _cardinality(c["is_array"], child_required)
            label = c["field_name"]
            lines.append(f"  {parent_name} {card} {_entity_name(child_obj)} : \"{label}\"")

    # Attribute blocks — one per unique display_id, with the UNION of
    # fields from every object that shares that name. Field names are
    # deduplicated so an identical attribute isn't listed twice.
    emitted: set[str] = set()
    by_display: dict[str, list[dict]] = {}
    for obj in objects_for_page:
        by_display.setdefault(_entity_name(obj), []).append(obj)

    for name, objs in by_display.items():
        if name in emitted:
            continue
        # Union of (name, type) pairs across all objects sharing this name.
        seen_field_names: set[str] = set()
        rows: list[str] = []
        overflow = 0
        for obj in objs:
            for f in obj.get("fields", []):
                if f.get("is_envelope"):
                    continue
                fname = _safe_field_name(f.get("name"))
                if not fname or fname in seen_field_names:
                    continue
                if len(rows) >= _BLOCK_CAP:
                    overflow += 1
                    continue
                seen_field_names.add(fname)
                t = _safe_type(f.get("type"))
                comment = _short_comment(f.get("title") or f.get("description"))
                rows.append(f"    {t} {fname} \"{comment}\"" if comment else f"    {t} {fname}")
        if overflow:
            rows.append(f"    string _more_ \"+{overflow} more — see table\"")
        # ALWAYS emit the block, even when empty. Mermaid renders pure-
        # container objects (no scalar fields, just sub-objects) as bare
        # text without a box outline unless they have an attribute block.
        # An empty `{ }` is enough to force the box.
        lines.append(f"  {name} {{")
        lines.extend(rows)
        lines.append("  }")
        emitted.add(name)

    return "\n".join(lines)
