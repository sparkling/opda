"""
Build a browsable index of every rr:TriplesMap in the RML mapping — the
data source for the website's /mapping/triplesmaps page (ADR-0060).

Jena `arq` only (ADR-0037; reuses harness.jena_query.sparql_select) — no
rdflib. Three SPARQL passes extract, per TriplesMap: its JSONPath
iterator, subject-map template, asserted class(es), and every
predicateObjectMap row (predicate + reference/template/constant). A
predicateObjectMap is counted here only if its owning subject is itself
asserted `a rr:TriplesMap` — this deliberately excludes the ~88
predicateObjectMaps nested inside `fnml:functionValue` blocks (function
parameter bindings, not schema<->ontology correspondences; see
ADR-0060's Context section for the 526-vs-438 finding this guards).

A final, separate text scan (not an RDF parse — Turtle comments are
invisible to any RDF parser) attaches each TriplesMap's nearest
preceding "# M<N><letter>" section-comment label, purely documentary.

Output (repo-relative, COMMITTED — not under the gitignored build/):
  source/03-standards/rml/triplesmap-index.json
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from jena_query import sparql_select  # noqa: E402

REPO = Path(__file__).resolve().parents[4]
RML_DIR = REPO / "source/03-standards/rml"
MAPPING_TTL = RML_DIR / "mapping/opda-pdtf.rml.ttl"
OUT_JSON = RML_DIR / "triplesmap-index.json"

OPDA_NS = "https://opda.org.uk/pdtf/"
RML_BASE = "https://opda.org.uk/pdtf/harness/rml/#"

PREFIXES = """
PREFIX rr: <http://www.w3.org/ns/r2rml#>
PREFIX rml: <http://semweb.mmlab.be/ns/rml#>
PREFIX fnml: <http://semweb.mmlab.be/ns/fnml#>
"""


def compact(iri: str) -> str:
    """opda:localName for OPDA-namespace IRIs, else the bare IRI."""
    if iri.startswith(OPDA_NS):
        return "opda:" + iri[len(OPDA_NS):]
    return iri


def local_name(tm_iri: str) -> str:
    if tm_iri.startswith(RML_BASE):
        return tm_iri[len(RML_BASE):]
    if "#" in tm_iri:
        return tm_iri.rsplit("#", 1)[1]
    return tm_iri


def extract_placeholders(template: str) -> list[str]:
    """Field names inside {...} in an rr:template string, in order, deduped."""
    seen: list[str] = []
    for m in re.finditer(r"\{([^}]+)\}", template):
        name = m.group(1)
        if name not in seen:
            seen.append(name)
    return seen


def parse_sections(text: str) -> dict[str, str]:
    """Map each TriplesMap local name -> its nearest preceding '# M<N>' label."""
    section_re = re.compile(r"^#\s*(M\d+[a-z]?)\b")
    tm_re = re.compile(r"^<#([A-Za-z0-9_]+)>\s+a\s+rr:TriplesMap")
    current = ""
    out: dict[str, str] = {}
    for line in text.splitlines():
        m = section_re.match(line)
        if m:
            current = m.group(1)
            continue
        m = tm_re.match(line)
        if m:
            out[m.group(1)] = current
    return out


def main() -> None:
    raw = MAPPING_TTL.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    text = raw.decode("utf-8")

    # -- pass 1: core TriplesMap info (one row per map) --------------------------
    core_rows = sparql_select(PREFIXES + """
        SELECT ?tm ?iterator ?subjTemplate
        WHERE {
          ?tm a rr:TriplesMap ;
              rml:logicalSource [ rml:iterator ?iterator ] .
          OPTIONAL { ?tm rr:subjectMap [ rr:template ?subjTemplate ] }
        }
        ORDER BY ?tm
    """, MAPPING_TTL)

    triplesmaps: dict[str, dict] = {}
    for row in core_rows:
        name = local_name(row["tm"])
        triplesmaps[name] = {
            "id": name,
            "section": "",
            "iterator": row.get("iterator", ""),
            "subject_template": row.get("subjTemplate", ""),
            "classes": [],
            "rows": [],
        }

    # -- pass 2: asserted class(es) per map (0+ per map) --------------------------
    class_rows = sparql_select(PREFIXES + """
        SELECT ?tm ?class
        WHERE { ?tm a rr:TriplesMap ; rr:subjectMap [ rr:class ?class ] . }
        ORDER BY ?tm
    """, MAPPING_TTL)
    for row in class_rows:
        name = local_name(row["tm"])
        cls = compact(row["class"])
        if name in triplesmaps and cls not in triplesmaps[name]["classes"]:
            triplesmaps[name]["classes"].append(cls)

    # -- pass 3: predicateObjectMap rows, restricted to real TriplesMap subjects --
    # (excludes the fnml:functionValue-nested poms — see module docstring). Covers
    # every object-map shape actually used in this file: rml:reference, rr:template,
    # rr:constant, the R2RML rr:object constant-shortcut (used directly on the pom,
    # not wrapped in an objectMap — e.g. opda:currency/opda:peril), and an FNML
    # function-value whose OWN nested predicateObjectMap carries the real
    # rml:reference input parameter (e.g. opda:ownerType/opda:signedOn) — SPARQL
    # naturally binds only that one nested pom, since the sibling fno:executes /
    # constant-parameter poms have no rml:reference to match.
    pom_rows = sparql_select(PREFIXES + """
        SELECT ?tm ?predicate ?ref ?objTemplate ?constant ?directObject ?fnRef
        WHERE {
          ?tm a rr:TriplesMap ; rr:predicateObjectMap ?pom .
          ?pom rr:predicate ?predicate .
          OPTIONAL { ?pom rr:objectMap [ rml:reference ?ref ] }
          OPTIONAL { ?pom rr:objectMap [ rr:template ?objTemplate ] }
          OPTIONAL { ?pom rr:objectMap [ rr:constant ?constant ] }
          OPTIONAL { ?pom rr:object ?directObject }
          OPTIONAL {
            ?pom rr:objectMap [ fnml:functionValue [ rr:predicateObjectMap [ rr:objectMap [ rml:reference ?fnRef ] ] ] ]
          }
        }
        ORDER BY ?tm
    """, MAPPING_TTL)

    for row in pom_rows:
        name = local_name(row["tm"])
        if name not in triplesmaps:
            continue
        predicate = compact(row["predicate"])
        ref = row.get("ref") or ""
        obj_template = row.get("objTemplate") or ""
        constant = row.get("constant") or ""
        direct_object = row.get("directObject") or ""
        fn_ref = row.get("fnRef") or ""

        if ref:
            kind = "reference"
            json_path = ref
        elif obj_template:
            placeholders = extract_placeholders(obj_template)
            kind = "template"
            json_path = ", ".join(placeholders) if placeholders else ""
        elif constant or direct_object:
            kind = "constant"
            json_path = ""
            constant = constant or direct_object
        elif fn_ref:
            kind = "function"
            json_path = fn_ref
        else:
            kind = "unknown"
            json_path = ""

        triplesmaps[name]["rows"].append({
            "predicate": predicate,
            "kind": kind,
            "json_path": json_path,
            "constant": compact(constant) if constant else "",
        })

    # -- section labels (text scan, documentary only) -----------------------------
    sections = parse_sections(text)
    for name, section in sections.items():
        if name in triplesmaps:
            triplesmaps[name]["section"] = section

    # -- FNML call-site count (excluded from the main rows; recorded separately) --
    fnml_rows = sparql_select(PREFIXES + """
        SELECT (COUNT(*) AS ?n) WHERE { ?om fnml:functionValue ?fv }
    """, MAPPING_TTL)
    fnml_call_sites = int(fnml_rows[0]["n"]) if fnml_rows else 0

    pom_total_triples = sparql_select("""
        PREFIX rr: <http://www.w3.org/ns/r2rml#>
        SELECT (COUNT(*) AS ?n) WHERE { ?tm rr:predicateObjectMap ?pom }
    """, MAPPING_TTL)
    total_pom_triples = int(pom_total_triples[0]["n"]) if pom_total_triples else 0

    tm_list = sorted(triplesmaps.values(), key=lambda t: (t["section"] or "zzz", t["id"]))
    real_pom_count = sum(len(t["rows"]) for t in tm_list)
    distinct_classes = sorted({c for t in tm_list for c in t["classes"]})
    distinct_predicates = sorted({r["predicate"] for t in tm_list for r in t["rows"]})
    distinct_json_paths = sorted({r["json_path"] for t in tm_list for r in t["rows"] if r["json_path"]})

    index = {
        "generated_from": {
            "file": "source/03-standards/rml/mapping/opda-pdtf.rml.ttl",
            "sha256": sha,
        },
        "counts": {
            "triplesmaps": len(tm_list),
            "predicate_object_maps": real_pom_count,
            "predicate_object_map_triples_total": total_pom_triples,
            "fnml_call_sites": fnml_call_sites,
            "fnml_nested_predicate_object_maps": total_pom_triples - real_pom_count,
            "distinct_classes": len(distinct_classes),
            "distinct_predicates": len(distinct_predicates),
            "distinct_json_paths": len(distinct_json_paths),
        },
        "triplesmaps": tm_list,
    }
    OUT_JSON.write_text(json.dumps(index, indent=2) + "\n")
    print(json.dumps(index["counts"], indent=2))


if __name__ == "__main__":
    main()
