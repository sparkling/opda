#!/usr/bin/env python3
"""A1 (provenance-extractor): build the AUTHORITATIVE leaf_path -> predicate map.

Inverts every OPDA property's `dct:source <.../harness/data-dictionary/{leaf_path}>`
from the merged ontology. This is layer-1 (provenance-anchored) ground truth for the
RML-mapping swarm. See source/03-standards/rml/CONTRACT.md.

Outputs (repo-relative):
  source/03-standards/rml/provenance-index.json
  source/03-standards/rml/provenance-index.md
"""
from __future__ import annotations

import hashlib
import json
import urllib.parse
from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import OWL, RDF, RDFS

REPO = Path(__file__).resolve().parents[4]
MERGED_TTL = REPO / "public/ontology/artefacts/opda-merged.ttl"
DICT_JSON = REPO / "source/00-deliverables/semantic-models/data-dictionary-canonical.json"
OUT_JSON = REPO / "source/03-standards/rml/provenance-index.json"
OUT_MD = REPO / "source/03-standards/rml/provenance-index.md"

OPDA = "https://opda.org.uk/pdtf/"
DD_PREFIX = "https://opda.org.uk/pdtf/harness/data-dictionary/"
DCT_SOURCE = URIRef("http://purl.org/dc/terms/source")


def compact(iri: str) -> str:
    """opda:localName for OPDA-namespace IRIs, else the full IRI."""
    if iri.startswith(OPDA):
        return "opda:" + iri[len(OPDA):]
    return iri


def leaf_from_source(src: str) -> str | None:
    if not src.startswith(DD_PREFIX):
        return None
    return urllib.parse.unquote(src[len(DD_PREFIX):])


def main() -> None:
    g = Graph()
    g.parse(MERGED_TTL, format="turtle")

    raw = MERGED_TTL.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()

    # -- collect the classes -----------------------------------------------------
    # NB: must match on rdf:type owl:Class explicitly. A bare
    # subjects(object=owl:Class) also catches opda:targetsKind, an ObjectProperty
    # whose rdfs:range is owl:Class (false positive → 41 not 40).
    opda_classes: set[URIRef] = set()
    for s in g.subjects(RDF.type, OWL.Class):
        if isinstance(s, URIRef) and str(s).startswith(OPDA):
            opda_classes.add(s)

    # -- walk every datatype/object property ------------------------------------
    leaves: list[dict] = []
    # map predicate_iri -> record scaffold (kind/domain/range) for class enumeration
    prop_meta: dict[str, dict] = {}

    for kind_uri, kind_label in ((OWL.DatatypeProperty, "Datatype"),
                                 (OWL.ObjectProperty, "Object")):
        for prop in g.subjects(predicate=None, object=kind_uri):
            if not (isinstance(prop, URIRef) and str(prop).startswith(OPDA)):
                continue
            dom = g.value(prop, RDFS.domain)
            rng = g.value(prop, RDFS.range)
            dom_iri = str(dom) if dom is not None else None
            rng_iri = str(rng) if rng is not None else None
            is_monetary = rng_iri == OPDA + "MonetaryAmount"
            is_object_node = (kind_label == "Object" and rng is not None
                              and isinstance(rng, URIRef) and rng in opda_classes)
            prop_meta[str(prop)] = {
                "predicate": compact(str(prop)),
                "kind": kind_label,
                "domain": compact(dom_iri) if dom_iri else None,
                "range": compact(rng_iri) if rng_iri else None,
            }
            for src in g.objects(prop, DCT_SOURCE):
                leaf = leaf_from_source(str(src))
                if leaf is None:
                    continue
                flags: list[str] = []
                if is_monetary:
                    flags.append("monetary")
                if dom is None:
                    flags.append("shared_domainless")
                if is_object_node:
                    flags.append("object_node")
                leaves.append({
                    "leaf_path": leaf,
                    "predicate": compact(str(prop)),
                    "predicate_iri": str(prop),
                    "kind": kind_label,
                    "domain": compact(dom_iri) if dom_iri else None,
                    "range": compact(rng_iri) if rng_iri else None,
                    "layer": 1,
                    "flags": flags,
                })

    leaves.sort(key=lambda r: r["leaf_path"])

    # -- class -> its datatype/object properties by rdfs:domain -----------------
    classes = []
    for cls in sorted(opda_classes, key=str):
        label = g.value(cls, RDFS.label)
        props = []
        for piri, meta in prop_meta.items():
            if meta["domain"] == compact(str(cls)):
                props.append({
                    "predicate": meta["predicate"],
                    "kind": meta["kind"],
                    "range": meta["range"],
                })
        props.sort(key=lambda p: p["predicate"])
        classes.append({
            "iri": str(cls),
            "compact": compact(str(cls)),
            "label": str(label) if label else None,
            "properties": props,
        })

    # -- coverage cross-check vs the 8458 dictionary leaves ---------------------
    dict_records = json.loads(DICT_JSON.read_text())
    indexed_paths = {r["leaf_path"] for r in leaves}
    dict_paths = [r["path"] for r in dict_records]
    matched = [p for p in dict_paths if p in indexed_paths]
    unmatched = [p for p in dict_paths if p not in indexed_paths]

    # provenance leaf_paths that do NOT appear in the dictionary (should be ~0)
    dict_path_set = set(dict_paths)
    prov_orphans = sorted({r["leaf_path"] for r in leaves
                           if r["leaf_path"] not in dict_path_set})

    counts = {
        "total_leaves_indexed": len(leaves),
        "distinct_leaf_paths": len(indexed_paths),
        "datatype": sum(1 for r in leaves if r["kind"] == "Datatype"),
        "object": sum(1 for r in leaves if r["kind"] == "Object"),
        "monetary": sum(1 for r in leaves if "monetary" in r["flags"]),
        "shared_domainless": sum(1 for r in leaves if "shared_domainless" in r["flags"]),
        "object_node": sum(1 for r in leaves if "object_node" in r["flags"]),
        "array_leaves": sum(1 for r in leaves if "[]" in r["leaf_path"]),
        "classes": len(classes),
        "dictionary_leaves_total": len(dict_records),
        "dictionary_leaves_matched": len(matched),
        "dictionary_leaves_unmatched": len(unmatched),
        "provenance_orphans": len(prov_orphans),
    }

    index = {
        "generated_from": {
            "file": "public/ontology/artefacts/opda-merged.ttl",
            "sha256": sha,
        },
        "counts": counts,
        "classes": classes,
        "leaves": leaves,
    }
    OUT_JSON.write_text(json.dumps(index, indent=2) + "\n")

    # -- markdown summary -------------------------------------------------------
    monetary_rows = sorted(
        {(r["predicate"], r["range"]) for r in leaves if "monetary" in r["flags"]}
    )
    monetary_leaf_map: dict[str, list[str]] = {}
    for r in leaves:
        if "monetary" in r["flags"]:
            monetary_leaf_map.setdefault(r["predicate"], []).append(r["leaf_path"])

    # predicates carrying >1 leaf (collapse points, e.g. opda:name)
    pred_leaf_count: dict[str, int] = {}
    for r in leaves:
        pred_leaf_count[r["predicate"]] = pred_leaf_count.get(r["predicate"], 0) + 1
    collapsed = sorted(((p, n) for p, n in pred_leaf_count.items() if n > 1),
                       key=lambda x: -x[1])

    md = []
    md.append("# Provenance index — layer-1 leaf → predicate map (A1)\n")
    md.append(f"Generated by inverting `dct:source` from "
              f"`public/ontology/artefacts/opda-merged.ttl` (sha256 `{sha[:16]}…`).\n")
    md.append("## Counts\n")
    md.append("| metric | value |")
    md.append("|---|---|")
    for k, v in counts.items():
        md.append(f"| {k} | {v} |")
    md.append("")
    md.append("## MonetaryAmount-routed predicates (ObjectProperty → opda:MonetaryAmount)\n")
    md.append("These are NOT plain decimals — RML must build a `opda:MonetaryAmount` "
              "value node (`opda:amount` xsd:decimal + `opda:currency`).\n")
    md.append("| predicate | range | # leaves | example leaf_path |")
    md.append("|---|---|---|---|")
    for pred, rng in monetary_rows:
        ex = monetary_leaf_map.get(pred, [])
        md.append(f"| `{pred}` | `{rng}` | {len(ex)} | `{ex[0] if ex else ''}` |")
    md.append("")
    md.append("## TRAP INVENTORY\n")
    md.append("### 1. MonetaryAmount object-property pattern\n")
    md.append(f"{counts['monetary']} leaves route to `opda:MonetaryAmount` via "
              f"{len(monetary_rows)} distinct ObjectProperties. Each such leaf's JSON "
              "*number* must become a blank/IRI value node bearing `opda:amount` + "
              "`opda:currency`, never a literal decimal on the predicate.\n")
    md.append("### 2. Shared / collapsed predicates (one predicate, many leaves)\n")
    md.append("`opda:name` is domain-less and shared across many dictionary leaves; "
              "`opda:price` is the single Category-D fixtures amount (its `dct:source` is "
              "an ODR, NOT a data-dictionary leaf — so it is intentionally ABSENT from "
              "this layer-1 index; treat as layer-2). Predicates carrying >1 leaf:\n")
    md.append("| predicate | # leaves |")
    md.append("|---|---|")
    for pred, n in collapsed:
        md.append(f"| `{pred}` | {n} |")
    md.append("")
    md.append("### 3. Array `[]` segment leaves (JSONPath iterator strips indices)\n")
    md.append(f"{counts['array_leaves']} indexed leaves contain `[]` array segments "
              "(e.g. `participants[].name`). The RML JSONPath iterator must map over the "
              "array; the index is not part of the predicate.\n")
    md.append("## Coverage cross-check (honest, un-editorialised)\n")
    md.append(f"- Dictionary leaves total: **{counts['dictionary_leaves_total']}**\n")
    md.append(f"- Matched by a layer-1 provenance predicate: "
              f"**{counts['dictionary_leaves_matched']}**\n")
    md.append(f"- NOT matched (candidate GAPs or layer-2 shared/collapsed leaves): "
              f"**{counts['dictionary_leaves_unmatched']}**\n")
    md.append(f"- Provenance leaf_paths absent from the dictionary "
              f"(should be ~0): **{counts['provenance_orphans']}**\n")
    if prov_orphans:
        md.append("Provenance orphans:\n")
        for p in prov_orphans:
            md.append(f"  - `{p}`")
        md.append("")
    OUT_MD.write_text("\n".join(md) + "\n")

    print(json.dumps(counts, indent=2))
    print("prov_orphans:", prov_orphans[:10])


if __name__ == "__main__":
    main()
