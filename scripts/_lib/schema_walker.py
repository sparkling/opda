"""Schema walker — step 1 of the page-render pipeline.

Walks ``pdtf-transaction.json`` and produces a flat ordered list of leaves
ready for downstream classification (provenance), theme assignment, and
example binding. The base schema has been verified to contain no ``$ref``,
``$defs``, ``anyOf`` or ``allOf`` constructs — only ``properties``, ``items``
and ``oneOf``. We do not implement reference resolution we don't need.

Definitions
-----------
A **Leaf** is a node that yields no further structural children: a primitive
type (``string`` / ``number`` / ``integer`` / ``boolean`` / ``null``), a
primitive array, an object with no declared ``properties``, or an array of
objects with no declared ``properties``. Each leaf is emitted exactly once
unless it appears under multiple labelled ``oneOf`` branches at the same
host path, in which case each branch-specific occurrence is emitted with its
``branch_label`` distinguishing it.

A **Group** is an intermediate node with ``properties`` or ``items``
(``type: object`` with declared shape, ``type: array`` whose items are
objects). Groups are walked through and never emitted.

oneOf handling
--------------
Two distinct ``oneOf`` patterns appear in the base schema:

1. **Object-branch oneOf** (group-level). Each branch is an object literal
   with its own ``properties`` block. The branches typically share a
   discriminator property (``const`` or single-value ``enum``) and add
   branch-specific properties. We descend into each branch, derive a
   ``branch_label`` from the discriminator (or ``oneOf[N]`` if none), and
   tag every leaf produced under the branch with that label. If the same
   path appears in multiple branches we emit one row per branch; if a leaf
   appears in *every* branch with identical shape (i.e. it is in fact the
   discriminator and lives outside the branch logic) we still emit one row
   per branch — the downstream classifier deduplicates by ``path``.

2. **Field-level oneOf** (type-variant). Each branch is a primitive type
   spec (``{format: 'date'}`` vs ``{enum: ['']}``, or ``{type: 'array', ...}``
   vs ``{type: 'object', properties: ...}``). These do not represent
   branch-distinct sub-graphs of the schema — they describe a single field
   that can be either of two shapes. We collapse them: if any branch has
   ``properties`` we walk that branch; if any has ``items`` we walk that;
   the formats/enums of the simple branches are merged into the parent leaf.

The detection rule we use: if every branch of a oneOf is an object with a
``properties`` block, treat it as Pattern 1 (group-level). Otherwise treat
it as Pattern 2 (field-level) and pick the richest branch.

Envelope passthrough
--------------------
The W3C VC envelope adds wrapper paths (``*.proof.*``, ``*.issuer``,
``*.validFrom``, ``*.validUntil``, ``*.credentialSubject.*``) that should
render second-class. The base schema does not currently contain any
``credentialSubject``/``proof`` paths (verified by audit), so the walker
treats every leaf as non-envelope (``is_envelope = False``) but exposes the
detection logic for later overlay walks. ``canonical_path`` strips any
``.credentialSubject.`` prefix so that a future overlay walk yields the
same path the base walker would emit for the unwrapped claim.
"""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Leaf record
# ---------------------------------------------------------------------------


@dataclass
class Leaf:
    path: str
    name: str
    type: str
    title: str | None = None
    description: str | None = None
    required: bool = False
    enum: list | None = None
    format: str | None = None
    pattern: str | None = None
    examples: list | None = None
    branch_label: str | None = None
    is_envelope: bool = False
    canonical_path: str = ""

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        # Drop None-valued optional fields to keep the artefact compact and
        # diff-friendly — downstream consumers treat missing == None.
        for k in ("title", "description", "enum", "format", "pattern",
                  "examples", "branch_label"):
            if d[k] is None:
                d.pop(k)
        if d["required"] is False:
            d.pop("required")
        if d["is_envelope"] is False:
            d.pop("is_envelope")
        if d["canonical_path"] == d["path"]:
            d.pop("canonical_path")
        return d


# ---------------------------------------------------------------------------
# Envelope detection
# ---------------------------------------------------------------------------


_ENVELOPE_TAIL_RE = re.compile(
    r"(^|\.)(proof(\..*)?|issuer|validFrom|validUntil|credentialSubject(\..*)?)$"
)
_CRED_SUBJECT_RE = re.compile(r"\.credentialSubject(?=\.)")


def _is_envelope(path: str) -> bool:
    return bool(_ENVELOPE_TAIL_RE.search(path))


def _canonical_path(path: str) -> str:
    # ``a.credentialSubject.b.c`` -> ``a.b.c``
    return _CRED_SUBJECT_RE.sub("", path)


# ---------------------------------------------------------------------------
# Walk
# ---------------------------------------------------------------------------


_PRIMITIVE_TYPES = {"string", "number", "integer", "boolean", "null"}


def _is_object_branch(branch: dict) -> bool:
    """A oneOf branch is a 'group-level' object-branch when it declares
    a ``properties`` block (with or without an explicit ``type: object``).
    """
    return isinstance(branch, dict) and isinstance(branch.get("properties"), dict)


def _discriminator(branch: dict) -> str | None:
    """Find the single-value property in a oneOf branch that distinguishes
    it from siblings. We look for ``const`` first, then a length-1 ``enum``.
    Returns ``"propName=value"`` or ``None`` if no discriminator is visible.
    """
    for pname, pdef in (branch.get("properties") or {}).items():
        if not isinstance(pdef, dict):
            continue
        if "const" in pdef:
            return f"{pname}={pdef['const']}"
        enum = pdef.get("enum")
        if isinstance(enum, list) and len(enum) == 1:
            return f"{pname}={enum[0]}"
    return None


def _merge_field_variants(branches: list[dict]) -> dict:
    """Collapse a field-level oneOf (type-variant) down to a single node.

    We pick the richest branch as the base and merge in any ``enum`` /
    ``format`` from other branches. If one branch is an object with
    ``properties`` and another is an array with ``items``, we keep the
    object branch — the array variant is generally an alternate empty
    container and adds no leaves.
    """
    # Prefer a branch with properties; else with items; else first.
    obj_branch = next((b for b in branches if isinstance(b, dict) and "properties" in b), None)
    arr_branch = next((b for b in branches if isinstance(b, dict) and "items" in b), None)
    chosen = obj_branch or arr_branch or branches[0]

    # Merge enums and formats across simple-type branches so the leaf row
    # surfaces "Yes/No" even if Yes lives in one branch and No in another.
    merged = dict(chosen)
    enums: list = []
    formats: list = []
    for b in branches:
        if not isinstance(b, dict):
            continue
        e = b.get("enum")
        if isinstance(e, list):
            enums.extend(e)
        f = b.get("format")
        if isinstance(f, str):
            formats.append(f)
    if enums and "enum" not in merged:
        merged["enum"] = enums
    if formats and "format" not in merged:
        merged["format"] = formats[0]
    return merged


def _node_type(node: dict) -> str:
    """JSON-Schema type string, or a sensible fallback when type is missing."""
    t = node.get("type")
    if isinstance(t, str):
        return t
    if isinstance(t, list):
        # Multi-typed leaf — take the first non-null type.
        non_null = [x for x in t if x != "null"]
        return non_null[0] if non_null else "null"
    # Untyped node — infer.
    if "properties" in node:
        return "object"
    if "items" in node:
        return "array"
    if "enum" in node:
        return "string"
    return "object"


def _make_leaf(
    path: str,
    name: str,
    node: dict,
    *,
    type_override: str | None = None,
    required: bool,
    branch_label: str | None,
) -> Leaf:
    t = type_override or _node_type(node)
    return Leaf(
        path=path,
        name=name,
        type=t,
        title=node.get("title"),
        description=node.get("description"),
        required=required,
        enum=node.get("enum"),
        format=node.get("format"),
        pattern=node.get("pattern"),
        examples=node.get("examples"),
        branch_label=branch_label,
        is_envelope=_is_envelope(path),
        canonical_path=_canonical_path(path),
    )


def _walk(
    node: Any,
    path: str,
    name: str,
    *,
    required: bool,
    branch_label: str | None,
    out: list[Leaf],
) -> None:
    if not isinstance(node, dict):
        return

    # Field-level oneOf collapse happens here BEFORE we look at type/properties:
    # the merged variant may bring properties into scope.
    if "oneOf" in node and isinstance(node["oneOf"], list):
        branches = node["oneOf"]
        if branches and all(_is_object_branch(b) for b in branches):
            # Group-level branching — descend into each branch under the same
            # host path, labelling leaves by discriminator.
            _walk_object_branches(node, branches, path, name, required, branch_label, out)
            return
        else:
            # Field-level type variant — collapse and continue walking.
            merged = _merge_field_variants(branches)
            # Preserve the parent's title/description/required which the
            # merged branch normally lacks.
            for k in ("title", "description", "examples"):
                if k in node and k not in merged:
                    merged[k] = node[k]
            node = merged

    t = _node_type(node)

    if t == "object":
        props = node.get("properties")
        if not isinstance(props, dict) or not props:
            # Object with no declared shape — emit as a leaf bag (e.g.
            # ``externalIds``). Downstream consumers can render these as
            # "free-form object" rows.
            out.append(_make_leaf(path, name, node, required=required, branch_label=branch_label))
            return
        req_set = set(node.get("required") or [])
        for pname, pdef in props.items():
            _walk(
                pdef,
                f"{path}.{pname}" if path else pname,
                pname,
                required=pname in req_set,
                branch_label=branch_label,
                out=out,
            )
        return

    if t == "array":
        items = node.get("items")
        if not isinstance(items, dict):
            # Untyped array — emit as primitive-array leaf.
            out.append(
                _make_leaf(
                    path, name, node,
                    type_override="array",
                    required=required,
                    branch_label=branch_label,
                )
            )
            return
        # Resolve a oneOf on items the same way: object-branch vs field-level.
        if "oneOf" in items and isinstance(items["oneOf"], list):
            branches = items["oneOf"]
            if branches and all(_is_object_branch(b) for b in branches):
                # array-of-object with branched items
                _walk_object_branches(
                    items, branches, f"{path}[]", name, required=False,
                    parent_branch_label=branch_label, out=out,
                )
                return
            else:
                items = _merge_field_variants(branches)

        item_type = _node_type(items)
        if item_type == "object":
            iprops = items.get("properties")
            if not isinstance(iprops, dict) or not iprops:
                out.append(
                    _make_leaf(
                        f"{path}[]", name, items,
                        type_override="object[]",
                        required=required,
                        branch_label=branch_label,
                    )
                )
                return
            req_set = set(items.get("required") or [])
            for pname, pdef in iprops.items():
                _walk(
                    pdef,
                    f"{path}[].{pname}",
                    pname,
                    required=pname in req_set,
                    branch_label=branch_label,
                    out=out,
                )
            return
        else:
            # Array of primitives — single leaf with composite type.
            out.append(
                _make_leaf(
                    path, name, node,
                    type_override=f"{item_type}[]",
                    required=required,
                    branch_label=branch_label,
                )
            )
            return

    # Primitive leaf
    if t in _PRIMITIVE_TYPES or t == "any":
        out.append(_make_leaf(path, name, node, required=required, branch_label=branch_label))
        return

    # Unknown / fallthrough — emit as leaf so downstream can flag it.
    out.append(_make_leaf(path, name, node, required=required, branch_label=branch_label))


def _walk_object_branches(
    node: dict,
    branches: list[dict],
    path: str,
    name: str,
    required: bool,
    parent_branch_label: str | None,
    out: list[Leaf],
) -> None:
    """Descend into each branch of a group-level oneOf. Properties that the
    branches share with identical shape get emitted under each branch — the
    downstream classifier will deduplicate by ``path``. Branch labels are
    composed with the parent's so deeply-nested branching reads cleanly.
    """
    # Walk through any sibling properties declared alongside the oneOf.
    # (Rare in this schema but supported by JSON Schema.) These are unconditional.
    sibling_props = node.get("properties") if isinstance(node, dict) else None
    sibling_required = set(node.get("required") or []) if isinstance(node, dict) else set()

    # Collect property names that appear in *every* branch so we can emit them
    # once at the host (un-branched) — these are typically the discriminator
    # property itself or other unconditional fields.
    branch_propsets = [set((b.get("properties") or {}).keys()) for b in branches]
    common = set.intersection(*branch_propsets) if branch_propsets else set()

    # Emit unconditional sibling-level properties.
    if isinstance(sibling_props, dict):
        for pname, pdef in sibling_props.items():
            if pname in common:
                # Walked under each branch (which share it) — skip the
                # sibling-level walk to avoid duplication; the branch walk
                # will produce one row per branch and the merger picks one.
                continue
            _walk(
                pdef,
                f"{path}.{pname}" if path else pname,
                pname,
                required=pname in sibling_required,
                branch_label=parent_branch_label,
                out=out,
            )

    # Walk each branch with its own label.
    for idx, branch in enumerate(branches):
        disc = _discriminator(branch)
        local_label = f"oneOf[{idx}]"
        if disc:
            local_label = f"oneOf[{idx}] / {disc}"
        label = (
            f"{parent_branch_label} > {local_label}" if parent_branch_label else local_label
        )

        bprops = branch.get("properties") or {}
        breq = set(branch.get("required") or [])
        for pname, pdef in bprops.items():
            # Common properties become single rows attributed to the branch
            # only if they carry a discriminator value here — otherwise
            # they're true sibling-style fields and we emit them once under
            # the first branch as a "shared" row.
            is_common = pname in common
            if is_common:
                # We need to emit the discriminator with the branch label so
                # the reader sees ``yesNo=Yes`` and ``yesNo=No`` as
                # distinguishable rows. Detection: if the property has a
                # single-value enum or const here, the value IS what makes
                # the branch unique — emit with branch label. If not, only
                # emit on the first branch to avoid N duplicates.
                pinfo = pdef if isinstance(pdef, dict) else {}
                pinfo_enum = pinfo.get("enum")
                if "const" in pinfo or (
                    isinstance(pinfo_enum, list) and len(pinfo_enum) == 1
                ):
                    pass  # fall through, branch-labelled emission below
                else:
                    if idx != 0:
                        continue
                    _walk(
                        pdef,
                        f"{path}.{pname}" if path else pname,
                        pname,
                        required=pname in breq,
                        branch_label=parent_branch_label,
                        out=out,
                    )
                    continue
            _walk(
                pdef,
                f"{path}.{pname}" if path else pname,
                pname,
                required=pname in breq,
                branch_label=label,
                out=out,
            )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def walk(schema_path: str | Path) -> list[Leaf]:
    """Walk a JSON Schema file and return the flat list of Leaf records in
    deterministic order (declaration order from the schema, depth-first).
    """
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    out: list[Leaf] = []
    root_required = set(schema.get("required") or [])
    for pname, pdef in (schema.get("properties") or {}).items():
        _walk(
            pdef,
            pname,
            pname,
            required=pname in root_required,
            branch_label=None,
            out=out,
        )
    return out


__all__ = ["Leaf", "walk"]
