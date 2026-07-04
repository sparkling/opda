#!/usr/bin/env python3
"""Layer-1 completeness gate for the PDTF -> OPDA RML mapping.

Walks a PDTF JSON instance to every scalar leaf, partitions those leaves against
the provenance index (leaf_path -> predicate), and checks that every layer-1
mapped leaf actually produced a triple in the materialised output.

Hard gate: DROPPED (a layer-1 leaf with a value in the instance but no triple
using its predicate in the output) is a mapping DEFECT -> non-zero exit.
UNMAPPED / GAP leaves are expected, reported (gap register), and never fail.

Usage:
    check_completeness.py --instance <json> \
        [--index source/03-standards/rml/provenance-index.json] \
        [--triples build/out.nt] \
        [--out-dir build]
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

# Base term namespace (namespaces.py law): CURIE `opda:X` -> this + X.
OPDA_BASE = "https://opda.org.uk/pdtf/"
_KNOWN_PREFIXES = {
    "opda": OPDA_BASE,
    "dct": "http://purl.org/dc/terms/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "sh": "http://www.w3.org/ns/shacl#",
}


def expand_iri(term: str) -> str:
    """Expand a CURIE or bracketed IRI to a bare full IRI string."""
    term = term.strip()
    if term.startswith("<") and term.endswith(">"):
        return term[1:-1]
    if term.startswith("http://") or term.startswith("https://"):
        return term
    if ":" in term:
        prefix, _, local = term.partition(":")
        if prefix in _KNOWN_PREFIXES:
            return _KNOWN_PREFIXES[prefix] + local
    return term  # leave as-is; may already be a bare IRI


def walk_scalar_leaves(node, prefix=""):
    """Yield (leaf_path, value) for every non-null scalar leaf.

    Array indices are collapsed to `[]` appended to the enclosing key, e.g.
    participants[0].name.title -> participants[].name.title. Yields one
    occurrence per element (duplicate leaf_paths are expected for arrays).
    """
    if isinstance(node, dict):
        for key, value in node.items():
            child = f"{prefix}.{key}" if prefix else key
            yield from walk_scalar_leaves(value, child)
    elif isinstance(node, list):
        for item in node:
            yield from walk_scalar_leaves(item, f"{prefix}[]")
    else:
        if node is not None and prefix:
            yield prefix, node


def _find_leaf_map(raw: dict) -> dict:
    """Locate the leaf_path -> entry mapping inside the provenance index JSON.

    Accepts three shapes under a `leaves`/`index`/`map`/`provenance` wrapper
    (or at top level):
      - a dict keyed by leaf_path with dict entries, or
      - a LIST of entry dicts each carrying a `leaf_path` key (A1's shape).
    Metadata-only dicts (e.g. `counts`) must NOT be mistaken for the map, so
    the top-level fallback requires entries to look predicate-bearing.
    """
    def _as_map(val) -> dict | None:
        if isinstance(val, dict) and val and all(isinstance(v, dict) for v in val.values()):
            return val
        if isinstance(val, list) and val and all(
            isinstance(v, dict) and "leaf_path" in v for v in val
        ):
            return {v["leaf_path"]: v for v in val}
        return None

    for key in ("leaves", "index", "map", "provenance"):
        got = _as_map(raw.get(key))
        if got is not None:
            return got
    # Fallback: top-level IS the map — but only accept entry-like dict values
    # (must carry a predicate), so metadata keys like `counts` are dropped.
    top = {
        k: v
        for k, v in raw.items()
        if isinstance(v, dict) and ("predicate" in v or "predicate_iri" in v)
    }
    if top:
        return top
    raise ValueError(
        "could not locate a leaf_path->entry map in the provenance index "
        "(expected a list/dict of predicate-bearing entries under "
        "`leaves`/`index`/`map`/`provenance`)"
    )


def load_index(index_path: Path) -> dict:
    raw = json.loads(index_path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError(f"provenance index must be a JSON object: {index_path}")
    return _find_leaf_map(raw)


def load_output_predicates(triples_path: Path) -> set[str]:
    """Return the set of predicate IRIs present in the N-Triples output."""
    import rdflib

    graph = rdflib.Graph()
    graph.parse(str(triples_path), format="nt")
    return {str(p) for _, p, _ in graph}


def _entry_predicate(entry: dict) -> str | None:
    pred = entry.get("predicate")
    if pred in (None, "", "GAP", "gap"):
        return None
    return str(pred)


def _entry_layer(entry: dict) -> int:
    layer = entry.get("layer", 1)
    try:
        return int(layer)
    except (TypeError, ValueError):
        return 1


def analyse(instance_path: Path, index_path: Path, triples_path: Path) -> dict:
    index = load_index(index_path)
    output_predicates = load_output_predicates(triples_path)

    occurrences = list(walk_scalar_leaves(json.loads(
        instance_path.read_text(encoding="utf-8"))))
    occ_count: dict[str, int] = defaultdict(int)
    for leaf_path, _ in occurrences:
        occ_count[leaf_path] += 1
    distinct_leaves = set(occ_count)

    layer1_mapped: dict[str, str] = {}   # leaf_path -> predicate IRI
    layer2_mapped: dict[str, str] = {}
    gap_leaves: list[str] = []           # in index but no predicate
    unmapped: list[str] = []             # not in index at all

    for leaf_path in sorted(distinct_leaves):
        entry = index.get(leaf_path)
        if entry is None:
            unmapped.append(leaf_path)
            continue
        pred = _entry_predicate(entry)
        if pred is None:
            gap_leaves.append(leaf_path)
            continue
        pred_iri = expand_iri(pred)
        if _entry_layer(entry) == 1:
            layer1_mapped[leaf_path] = pred_iri
        else:
            layer2_mapped[leaf_path] = pred_iri

    dropped = sorted(
        leaf_path
        for leaf_path, pred_iri in layer1_mapped.items()
        if pred_iri not in output_predicates
    )
    covered_l1 = sorted(set(layer1_mapped) - set(dropped))
    covered_l2 = sorted(
        lp for lp, p in layer2_mapped.items() if p in output_predicates
    )

    # Gap register: unmapped leaves grouped by last path segment.
    gap_groups: dict[str, list[str]] = defaultdict(list)
    for leaf_path in unmapped:
        last = leaf_path.rsplit(".", 1)[-1].replace("[]", "")
        gap_groups[last].append(leaf_path)

    return {
        "instance": str(instance_path),
        "index": str(index_path),
        "triples": str(triples_path),
        "totals": {
            "distinct_scalar_leaves": len(distinct_leaves),
            "scalar_leaf_occurrences": len(occurrences),
            "layer1_mapped": len(layer1_mapped),
            "layer1_covered": len(covered_l1),
            "layer1_dropped": len(dropped),
            "layer2_mapped": len(layer2_mapped),
            "layer2_covered": len(covered_l2),
            "gap_in_index": len(gap_leaves),
            "unmapped": len(unmapped),
            "output_predicate_iris": len(output_predicates),
        },
        "layer1_covered": covered_l1,
        "layer1_dropped": dropped,
        "layer2_covered": covered_l2,
        "gap_in_index": sorted(gap_leaves),
        "gap_groups": {k: sorted(v) for k, v in sorted(gap_groups.items())},
    }


def _print_summary(report: dict) -> None:
    t = report["totals"]
    rows = [
        ("distinct scalar leaves", t["distinct_scalar_leaves"]),
        ("scalar occurrences", t["scalar_leaf_occurrences"]),
        ("layer-1 mapped", t["layer1_mapped"]),
        ("layer-1 covered", t["layer1_covered"]),
        ("layer-1 DROPPED (defects)", t["layer1_dropped"]),
        ("layer-2 mapped", t["layer2_mapped"]),
        ("layer-2 covered", t["layer2_covered"]),
        ("gap (declared in index)", t["gap_in_index"]),
        ("unmapped (candidate gaps)", t["unmapped"]),
    ]
    width = max(len(label) for label, _ in rows)
    print("completeness summary")
    print("-" * (width + 8))
    for label, value in rows:
        print(f"{label:<{width}} : {value}")
    if report["layer1_dropped"]:
        print("\nDROPPED layer-1 leaves (mapping defects):")
        for leaf_path in report["layer1_dropped"]:
            print(f"  - {leaf_path}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--instance", required=True, type=Path)
    parser.add_argument(
        "--index",
        type=Path,
        default=Path("source/03-standards/rml/provenance-index.json"),
    )
    parser.add_argument("--triples", type=Path, default=Path("build/out.nt"))
    parser.add_argument("--out-dir", type=Path, default=Path("build"))
    args = parser.parse_args(argv)

    for label, path in (
        ("instance", args.instance),
        ("index", args.index),
        ("triples", args.triples),
    ):
        if not path.exists():
            print(f"error: {label} not found: {path}", file=sys.stderr)
            return 2

    report = analyse(args.instance, args.index, args.triples)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    (args.out_dir / "completeness-report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (args.out_dir / "gap-register.json").write_text(
        json.dumps(
            {
                "instance": report["instance"],
                "unmapped_count": report["totals"]["unmapped"],
                "groups": report["gap_groups"],
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    _print_summary(report)

    dropped = report["totals"]["layer1_dropped"]
    if dropped:
        print(
            f"\nFAIL: {dropped} layer-1 leaf(s) dropped by the mapping.",
            file=sys.stderr,
        )
        return 1
    print("\nOK: 0 layer-1 leaves dropped (layer-1 complete).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
