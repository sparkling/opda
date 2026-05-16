"""Derive the PDTF object model from the leaf walk.

The Schema section's physical model is the *object* tree, not the leaf list.
Every JSON object in the schema becomes a node in an ER diagram and a table
on its owning page; every scalar leaf becomes a row inside its parent
object's table.

This module reads `_build/leaves.json` (produced by `scripts/walk_schema.py`)
and reconstructs the object tree from the leaves' paths. We don't need to
re-walk the JSON Schema because the leaf paths already encode the full
parent-chain.

Outputs:
  - `objects`   list of object records, keyed by `path`
  - `by_path`   { path → object record } for O(1) lookup

Each object record:
  {
    "path":        "participants[].verification.identity",
    "id":          "ParticipantsVerificationIdentity",      # PascalCase, unique
    "display":     "Identity",                              # last segment, titlecased
    "field_name":  "identity",                              # name on parent
    "is_array":    False,                                    # True iff path ends with []
    "parent":      "participants[].verification",            # parent object path
    "required":    None,                                     # filled in from schema later if needed
    "fields":      [ {leaf record}, ... ],                   # direct scalar leaves on this object
    "children":    [ {field_name, path, is_array}, ... ],    # nested object children
  }
"""

from __future__ import annotations

import re


def parent_object_path(leaf_path: str) -> str:
    """Strip the rightmost dot-segment from a leaf path."""
    if "." in leaf_path:
        return leaf_path.rsplit(".", 1)[0]
    return ""


def last_segment(path: str) -> str:
    """Return the rightmost segment of an object path."""
    seg = path.rsplit(".", 1)[-1] if "." in path else path
    return seg


def is_array_path(path: str) -> bool:
    return path.endswith("[]")


def display_name(path: str) -> str:
    """Last segment, brackets dropped, title-cased."""
    if not path:
        return "Transaction"
    seg = last_segment(path)
    # Drop trailing [] and treat the rest as the conceptual entity name.
    seg = seg.rstrip("[]")
    # camelCase / snake_case → space-separated, then titlecase
    seg = re.sub(r"(?<!^)([A-Z][a-z])", r" \1", seg)
    seg = seg.replace("_", " ").strip()
    return seg[:1].upper() + seg[1:] if seg else "Object"


def field_name_on_parent(path: str) -> str:
    """The name this object appears under on its parent (no brackets)."""
    if not path:
        return ""
    return last_segment(path).rstrip("[]")


_BAD_ID = re.compile(r"[^A-Za-z0-9]")


def er_id(path: str) -> str:
    """A unique, Mermaid-safe identifier derived from the path.

    "" → "Transaction"
    "participants[]" → "Participant"
    "participants[].name" → "ParticipantName"
    "participants[].verification.identity.reports[]" → "ParticipantsVerificationIdentityReport"

    We deliberately drop trailing [] (singularising arrays) and collapse the
    dot path into PascalCase. Singularisation is done by clipping trailing 's'
    when the segment is a plain plural — kept conservative; ambiguous cases
    stay as-is.
    """
    if not path:
        return "Transaction"
    parts = path.split(".")
    out = []
    for p in parts:
        seg = p.rstrip("[]")
        out.append(seg[:1].upper() + seg[1:])
    raw = "".join(out)
    raw = _BAD_ID.sub("", raw)
    # Singularise common arrays (the trailing-[] segment is already the entity)
    if path.endswith("[]") and raw.endswith("s") and not raw.endswith("ss"):
        raw = raw[:-1]
    return raw


def build(leaves: list[dict]) -> dict:
    """Return { objects: [...], by_path: { ... } }."""
    by_path: dict[str, dict] = {}

    def ensure(path: str) -> dict:
        if path not in by_path:
            by_path[path] = {
                "path":       path,
                "id":         er_id(path),
                "display":    display_name(path),
                "field_name": field_name_on_parent(path),
                "is_array":   is_array_path(path),
                "parent":     None,        # filled below
                "fields":     [],
                "children":   [],
                # Aggregate stats — filled below
                "field_count": 0,
            }
        return by_path[path]

    # Always start with the root object
    ensure("")

    # Walk leaves: each leaf becomes a field on its parent-object path.
    # Also ensure() EVERY ancestor on the path — `participants[].verification`
    # is a real object even though no leaf has it as immediate parent,
    # because `.identity` and `.antiMoneyLaundering` sit beneath it.
    for leaf in leaves:
        path = leaf.get("path") or ""
        if not path:
            continue
        parent = parent_object_path(path)
        # Walk up the ancestor chain so every intermediate object exists.
        cur = parent
        while cur:
            ensure(cur)
            cur = parent_object_path(cur)
        ensure("")
        fname = last_segment(path)
        # Carry every leaf attribute through (overlays, has_example, etc.).
        # The macro can render any of them; we own the field+name additions.
        field_rec = dict(leaf)
        field_rec["name"] = fname
        field_rec["path"] = path
        by_path[parent]["fields"].append(field_rec)

    # Walk all object paths NOW that the full set is known, and link each
    # to its parent + register it as a child on the parent.
    for path in list(by_path.keys()):
        if not path:
            continue
        if "." in path:
            parent_path = path.rsplit(".", 1)[0]
        else:
            parent_path = ""
        by_path[path]["parent"] = parent_path
        by_path[parent_path]["children"].append({
            "field_name": field_name_on_parent(path),
            "path":       path,
            "id":         by_path[path]["id"],
            "display":    by_path[path]["display"],
            "is_array":   by_path[path]["is_array"],
        })

    # Cache field counts
    for obj in by_path.values():
        obj["field_count"] = len(obj["fields"])
        # Deduplicate children that arose from multiple leaves of the same sub-object
        seen = set()
        deduped = []
        for c in obj["children"]:
            if c["path"] in seen:
                continue
            seen.add(c["path"])
            deduped.append(c)
        obj["children"] = deduped

    objects = sorted(by_path.values(), key=lambda o: o["path"])
    return {"objects": objects, "by_path": by_path}


def assign_to_pages(
    by_path: dict[str, dict],
    theme: dict,
    page_assignment_for_leaf,
) -> dict[str, list[str]]:
    """Assign every object to a page (by its FIELDS' page assignment).

    Strategy:
      - For each object, look at the pages assigned to its scalar fields.
      - The object's home page = the modal page among its fields. Ties are
        broken by lowest page slot for determinism.
      - Objects with no scalar fields (rare — pure parent-of-objects)
        inherit their first child's home page.
      - The empty-path root object is always assigned to page 35.

    `page_assignment_for_leaf(leaf_path)` is a callable that returns the
    page slot ("35", "36", ...) for a given leaf path, as already computed
    by the canonical leaf → page assignment.
    """
    obj_page: dict[str, str] = {}

    def home_via_fields(obj):
        votes: dict[str, int] = {}
        for f in obj["fields"]:
            slot = page_assignment_for_leaf(f["path"])
            if not slot:
                continue
            votes[slot] = votes.get(slot, 0) + 1
        if not votes:
            return None
        # Modal page; tie-break by smallest slot.
        return sorted(votes.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]

    # First pass: page from fields
    for path, obj in by_path.items():
        if path == "":
            obj_page[path] = "35"
            continue
        slot = home_via_fields(obj)
        if slot:
            obj_page[path] = slot

    # Second pass: orphan objects inherit from a child
    changed = True
    while changed:
        changed = False
        for path, obj in by_path.items():
            if path in obj_page:
                continue
            for child in obj["children"]:
                if child["path"] in obj_page:
                    obj_page[path] = obj_page[child["path"]]
                    changed = True
                    break

    # Final fallback — should be unreachable, but anchor unknowns to root.
    for path in by_path:
        obj_page.setdefault(path, "35")

    # Invert: page → list of object paths
    by_page: dict[str, list[str]] = {}
    for path, slot in obj_page.items():
        by_page.setdefault(slot, []).append(path)
    for slot in by_page:
        by_page[slot].sort()

    return obj_page, by_page
