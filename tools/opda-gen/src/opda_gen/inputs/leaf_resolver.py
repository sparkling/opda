"""
Module leaf_resolver.

The S034-ratified **bind-only-what-exists** resolver for ADR-0029 gap-1: the
overlay-profile leaf enumerator. Given an emitted descriptive TBox and an
overlay JSON, it walks the overlay to its ref-bearing leaves and binds each
leaf to its emitted `opda:` predicate IFF that predicate exists with exactly
one `rdfs:domain` (the sound `sh:targetClass`); otherwise the leaf is a GAP.

Council session-034 (Knublauch Queen; Cagle/Davis soundness audit) ruled the
discipline: "full coverage" = full coverage of the *bindable* set + an honest
emitted per-form gap register. NEVER fabricate a predicate; NEVER guess a
domain. A multiple-domain or domain-less predicate → GAP (no sound
`sh:targetClass`). A GAP emits no `sh:path` and no `dct:source`, so the
hard G3 gate stays green (a GAP is neither addressable nor referenced).

PURE + corpus-driven: this module reads the emitted `opda-*.ttl` and the
ODR-0024 `COLLAPSED` register only. It has NO dependency on the gitignored
data dictionary and mints no IRI.

Realises:
- ADR-0029 gap-1 (S034 amendment): the bind-only-what-exists mechanism.
- ODR-0022 §2 G1 (path-aware binning): last-segment names collide
  (`details`×269, `price`×99); a known-collider leaf only binds when its
  path confirms the target — else GAP (soundness over coverage).
- ODR-0024 R3/R4 + the §Rules.1 collapse register (`COLLAPSED`): the resolver
  CONSULTS the register; it does NOT re-decide a mapping.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS

from opda_gen.inputs.category_g_curation import COLLAPSED


# FIX 1 — OPDA is defined inline (no `from ..namespaces import OPDA`; there is
# no such module — ~17 emitter files define it inline; match them).
OPDA = Namespace("https://opda.org.uk/pdtf/")


# --- ref-key map (FIX 2) --------------------------------------------------
# The 12 ref-carrying main forms each key on `f"{form_id}Ref"` (ta6 -> ta6Ref,
# con29R -> con29RRef, …). The 16 NTS2 extensions share the NTS-2023 base
# ref-key `ntsRef` (NOT `{code}Ref`); the `f"{form_id}Ref"` heuristic would
# walk every extension to ZERO leaves (Knublauch, S034 as-built finding 2).
# Verified against the actual overlay JSON before trusting either.
_EXTENSION_CODES: tuple[str, ...] = (
    "as", "dr", "er", "fd", "hi", "hs", "jk", "la",
    "ma", "mc", "oa", "oc", "sb", "sf", "sl", "tf",
)


def ref_key_for(form_id: str) -> str:
    """The overlay JSON ref-key for ``form_id`` (FIX 2).

    `ntsRef` for the 16 NTS2 extensions (shared NTS-2023 base key);
    `f"{form_id}Ref"` for every main form.
    """
    if form_id in _EXTENSION_CODES:
        return "ntsRef"
    return f"{form_id}Ref"


# --- known last-segment colliders (FIX 4) --------------------------------
# Last-segment names that recur across unrelated paths with incompatible
# targets (ODR-0022 G1: `details`×269, `price`×99, `comments`×96, …). A leaf
# whose last segment is a collider MUST NOT bind on the bare name — it binds
# only when the path-aware routing confirms the target; else GAP. The two
# corpus collapse targets these names resolve to (`disclosureDetail`,
# `price`) are both POLYSEMOUS slots, so path-awareness is intrinsic here,
# not upstream-circumstantial.
_COLLIDER_NAMES: frozenset[str] = frozenset(
    {
        "details",
        "comments",
        "comment",
        "summary",
        "summaryDescription",
        "description",
        "notes",
        "price",
        "caption",
        "dimensionDetails",
    }
)

# The Category-D fixtures container (ODR-0022 §4). A `price` leaf binds to the
# Category-D `opda:price` ONLY inside this container; a `priceInformation.price`
# (headline asking price) elsewhere must GAP (it is a deferred monetary leaf,
# ODR-0024 R3) rather than bind to the chattel price.
_FIXTURES_CONTAINER = "fixturesAndFittings"


@dataclass(frozen=True)
class EmittedPredicate:
    """One emitted `opda:` predicate with its (sound) domain + range.

    `domain_iri` is None when the predicate has zero or more-than-one
    `rdfs:domain` — in which case no sound `sh:targetClass` can be chosen and
    the leaf must GAP. `range_iri` is None similarly (only a single-range
    predicate can carry an `sh:in` over a scheme range).
    """

    local_name: str
    iri: URIRef
    kind: str  # "datatype" | "object"
    domain_iri: URIRef | None
    range_iri: URIRef | None


@dataclass(frozen=True)
class ParsedLeaf:
    """One ref-bearing overlay leaf (a node with no child properties/items)."""

    leaf_path: str          # dotted path from propertyPack/participants root
    name: str               # the last path segment
    ref: str                # the overlay ref value (e.g. ta6Ref "4.7a")
    required: bool          # name in its immediate parent's `required` array
    enum: tuple[str, ...] | None  # the leaf's enum value-set, if any


@dataclass(frozen=True)
class ParsedForm:
    """A walked overlay: its leaves + the `$id` authority for the anchor."""

    form_id: str
    schema_id: str          # the overlay `$id` (the JSON-pointer authority base)
    leaves: tuple[ParsedLeaf, ...]


# --------------------------------------------------------------------------
# Emitted-predicate inventory (parse the emitted opda-*.ttl once).
# --------------------------------------------------------------------------
def emitted_predicates(ontology_dir: Path) -> dict[str, EmittedPredicate]:
    """Parse the emitted ``opda-*.ttl`` modules once; return every `opda:`
    term typed `owl:DatatypeProperty`/`owl:ObjectProperty`, keyed by local
    name, with its single `rdfs:domain` (None if zero or >1) and single
    `rdfs:range` (None if zero or >1).
    """
    g = Graph()
    for ttl in sorted(Path(ontology_dir).glob("opda-*.ttl")):
        g.parse(str(ttl), format="turtle")

    out: dict[str, EmittedPredicate] = {}
    for kind, ptype in (("datatype", OWL.DatatypeProperty),
                        ("object", OWL.ObjectProperty)):
        for s in g.subjects(RDF.type, ptype):
            if not isinstance(s, URIRef) or not str(s).startswith(str(OPDA)):
                continue
            local = str(s)[len(str(OPDA)):]
            domains = list(g.objects(s, RDFS.domain))
            ranges = list(g.objects(s, RDFS.range))
            out[local] = EmittedPredicate(
                local_name=local,
                iri=s,
                kind=kind,
                domain_iri=domains[0] if len(domains) == 1 else None,
                range_iri=ranges[0] if len(ranges) == 1 else None,
            )
    return out


# --------------------------------------------------------------------------
# resolve + bind (the bind-only-what-exists contract).
# --------------------------------------------------------------------------
def resolve(leaf_name: str) -> str:
    """Resolve a leaf last-segment name to a candidate `opda:` local name.

    Consults the ODR-0024 `COLLAPSED` register (e.g. `uprn` -> `hasUPRN`,
    `address` -> `hasAddress`, the Category-A prose tails -> `disclosureDetail`).
    Does NOT re-decide a mapping — a name absent from the register resolves to
    itself (the §Q6a flat-default: leaf name IS the term local name).
    """
    return COLLAPSED.get(leaf_name, leaf_name)


def bind(
    leaf: ParsedLeaf, predicates: dict[str, EmittedPredicate]
) -> EmittedPredicate | None:
    """Bind a leaf to its emitted predicate, or return None (a GAP).

    Binds IFF the resolved local-name is an emitted predicate AND it has
    exactly one `rdfs:domain` (`domain_iri is not None`) — exactly one domain
    gives a sound `sh:targetClass`. Else GAP. NEVER fabricate a predicate;
    NEVER guess a domain. A multiple-domain or domain-less predicate → GAP
    (binding to a guessed domain asserts a false inherence — an OntoClean
    violation, Guarino S034).

    FIX 4 (path-aware collider guard): if the leaf's last segment is a known
    collider, do NOT bind on the bare name. Bind only when the path confirms
    the target:
      - `price` binds to the Category-D `opda:price` ONLY under the
        `fixturesAndFittings` container; a headline `priceInformation.price`
        GAPs (a deferred monetary leaf, ODR-0024 R3).
      - the prose tails (`details`/`comments`/…) resolve to `disclosureDetail`
        which is itself domain-less (12 zero-domain corpus predicates), so
        they GAP via the domain-cardinality check anyway — but the collider
        guard makes the GAP intentional, not incidental.
    """
    resolved = resolve(leaf.name)
    pred = predicates.get(resolved)
    if pred is None:
        return None  # GAP: no emitted predicate (no-predicate)
    if pred.domain_iri is None:
        return None  # GAP: zero or >1 domain — no sound sh:targetClass

    if leaf.name in _COLLIDER_NAMES:
        segments = leaf.leaf_path.split(".")
        if resolved == "price":
            # Category-D chattel price only under the fixtures container.
            if _FIXTURES_CONTAINER not in segments:
                return None  # GAP: collider-ambiguous (headline price etc.)
        else:
            # Any other collider that resolved to a single-domain predicate is
            # path-ambiguous unless the resolver register named it explicitly.
            # The register only maps colliders to domain-LESS targets
            # (disclosureDetail), already GAPped above; reaching here means a
            # collider name accidentally matched a single-domain predicate by
            # the flat-default — GAP it (soundness over coverage).
            if resolved == leaf.name:
                return None  # GAP: collider-ambiguous
    return pred


# --------------------------------------------------------------------------
# walk_form — overlay JSON → ref-bearing leaves.
# --------------------------------------------------------------------------
def _is_leaf_node(node: dict) -> bool:
    """A node is a ref-bearing *leaf* when it has no child `properties` and no
    `items.properties` (it does not descend into further named fields)."""
    if "properties" in node and isinstance(node["properties"], dict):
        return False
    items = node.get("items")
    if isinstance(items, dict) and isinstance(items.get("properties"), dict):
        return False
    return True


def _walk(
    node: object, prefix: str, refkey: str,
    parent_required: frozenset[str], out: list[ParsedLeaf],
) -> None:
    """Recursively collect ref-bearing leaves under ``node``.

    Descends `properties` and `items.properties`; the `oneOf` branch
    sub-properties (the discriminator variants) are walked too so a leaf
    that only appears under a `oneOf` branch is still reached. A leaf is a
    node with no further named children (`_is_leaf_node`).
    """
    if not isinstance(node, dict):
        return

    # Descend oneOf branches (discriminated variants) at this level so their
    # extra sub-fields are reached. Branches are anonymous objects carrying
    # their own `properties` and/or `required`.
    for branch in node.get("oneOf", []) or []:
        if isinstance(branch, dict):
            b_required = frozenset(branch.get("required", []) or [])
            for name, child in (branch.get("properties", {}) or {}).items():
                _descend_child(name, child, prefix, refkey, b_required, out)

    props = node.get("properties")
    if isinstance(props, dict):
        req = frozenset(node.get("required", []) or [])
        for name, child in props.items():
            _descend_child(name, child, prefix, refkey, req, out)
        return

    items = node.get("items")
    if isinstance(items, dict):
        # Array-of-objects: descend its properties under the same prefix.
        i_required = frozenset(items.get("required", []) or [])
        i_props = items.get("properties")
        if isinstance(i_props, dict):
            for name, child in i_props.items():
                _descend_child(name, child, prefix, refkey, i_required, out)
        for branch in items.get("oneOf", []) or []:
            if isinstance(branch, dict):
                b_required = frozenset(branch.get("required", []) or [])
                for name, child in (branch.get("properties", {}) or {}).items():
                    _descend_child(name, child, prefix, refkey, b_required, out)


def _descend_child(
    name: str, child: object, prefix: str, refkey: str,
    parent_required: frozenset[str], out: list[ParsedLeaf],
) -> None:
    if not isinstance(child, dict):
        return
    path = f"{prefix}.{name}" if prefix else name
    if _is_leaf_node(child):
        if refkey in child:
            enum = child.get("enum")
            out.append(
                ParsedLeaf(
                    leaf_path=path,
                    name=name,
                    ref=str(child[refkey]),
                    required=name in parent_required,
                    enum=tuple(enum) if isinstance(enum, list) else None,
                )
            )
        return
    _walk(child, path, refkey, parent_required, out)


def walk_form(form_id: str, overlay_path: Path) -> ParsedForm:
    """Walk an overlay JSON to its ref-bearing leaves (FIX 2 ref-key).

    Reads the form's `$id` for the JSON-pointer authority base. Collects each
    ref-bearing leaf's dotted `leaf_path`, last-segment `name`, the ref value,
    `required` (name in its immediate parent's `required` array), and `enum`,
    deduplicated by leaf_path and returned sorted.
    """
    data = json.loads(Path(overlay_path).read_text(encoding="utf-8"))
    schema_id = str(data.get("$id", ""))
    refkey = ref_key_for(form_id)

    out: list[ParsedLeaf] = []
    root = data.get("properties")
    if isinstance(root, dict):
        top_required = frozenset(data.get("required", []) or [])
        for name, child in root.items():
            _descend_child(name, child, refkey=refkey, prefix="",
                           parent_required=top_required, out=out)

    # Dedupe by leaf_path (a leaf can be reached via multiple oneOf branches);
    # keep the first occurrence. Sort deterministically by leaf_path.
    seen: set[str] = set()
    unique: list[ParsedLeaf] = []
    for lf in sorted(out, key=lambda x: x.leaf_path):
        if lf.leaf_path in seen:
            continue
        seen.add(lf.leaf_path)
        unique.append(lf)
    return ParsedForm(form_id=form_id, schema_id=schema_id,
                      leaves=tuple(unique))
