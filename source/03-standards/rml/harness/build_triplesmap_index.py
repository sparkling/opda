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


def iterator_prefix(iterator: str) -> str:
    """The dotted-path prefix implied by a JSONPath iterator, matching this
    project's own leaf_path convention (CONTRACT.md; e.g.
    'propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation...') —
    strips the '$' root marker, collapses '[*]' and filter predicates
    ('[?(@.role=="Buyer")]') down to a bare '[]' (the filter condition selects
    WHICH row, not a distinct structural location), and returns '' for the
    bare root iterator (no prefix needed)."""
    p = iterator.strip()
    if p.startswith("$"):
        p = p[1:]
    p = p.lstrip(".")
    p = re.sub(r"\[\?\([^)]*\)\]", "[]", p)
    p = re.sub(r"\[\*\]", "[]", p)
    return p


def full_json_path(iterator: str, relative: str) -> str:
    """Every rml:reference / rr:template placeholder / FNML input parameter in
    this mapping is relative to its TriplesMap's own iterator context — RML
    semantics, not an assumption (confirmed against real fixtures: the CONTRACT's
    own leaf_path convention combines them the same way). A bare reference like
    'documentDate' is ambiguous on its own — the schema has multiple fields with
    that terminal name at different locations — so linking it anywhere requires
    the FULL combined path, not the bare fragment."""
    prefix = iterator_prefix(iterator)
    return f"{prefix}.{relative}" if prefix else relative


def clean_section_title(raw: str) -> str:
    """Strip engineering-changelog boilerplate from a section header's title
    text, so what a reader sees is a short descriptive label, not a fragment
    of the mapping author's own work-log comment. Section comments carry:
    - the trailing '(opda:Class)' and 'iterator: ...' — shown separately
      elsewhere (the TriplesMap's own asserted class + iterator fields);
    - a trailing status marker + date ('CLOSED 2026-07-05', 'RESOLVED
      2026-07-05') recording when a gap was closed — commit-log metadata,
      not a content description;
    - line-wrapped comments (only the first physical line is captured here),
      which leaves a dangling unmatched '(', trailing hyphen, or trailing
      slash at the cut point."""
    title = re.sub(r"\s*iterator:.*$", "", raw)
    title = re.sub(r"\s*\(opda:[A-Za-z0-9_]+\)\s*$", "", title)
    title = re.sub(r"\s+", " ", title).strip()
    # Truncate a dangling unmatched '(' (a line-wrapped continuation cut off
    # mid-clause) BEFORE stripping the status marker below — otherwise a
    # wrapped continuation after the marker (e.g. "RESOLVED 2026-07-05
    # (Darwin-mode") hides it from the end-of-string match.
    if title.count("(") > title.count(")"):
        title = title.rsplit("(", 1)[0].strip()
    title = re.sub(r"[:\s—-]*(CLOSED|RESOLVED)(\s+\d{4}-\d{2}-\d{2})?\s*$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"[\s/:—-]+$", "", title)
    return title.strip()


def parse_sections(text: str) -> dict[str, dict[str, str]]:
    """Map each TriplesMap local name -> its nearest preceding section header,
    as both the raw 'M<N><letter>' code (kept only for stable ordering — never
    shown to a reader, per operator direction 2026-07-06) and a cleaned,
    human-readable title parsed from the same comment line."""
    section_re = re.compile(r"^#\s*(M\d+[a-z]?)\s*—\s*(.+)$")
    tm_re = re.compile(r"^<#([A-Za-z0-9_]+)>\s+a\s+rr:TriplesMap")
    current_code, current_title = "", ""
    out: dict[str, dict[str, str]] = {}
    for line in text.splitlines():
        m = section_re.match(line)
        if m:
            current_code = m.group(1)
            current_title = clean_section_title(m.group(2))
            continue
        m = tm_re.match(line)
        if m:
            out[m.group(1)] = {"code": current_code, "title": current_title}
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
            "section_code": "",
            "section_title": "",
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
        iterator = triplesmaps[name]["iterator"]

        if ref:
            kind = "reference"
            json_path = full_json_path(iterator, ref)
        elif obj_template:
            placeholders = extract_placeholders(obj_template)
            kind = "template"
            json_path = ", ".join(full_json_path(iterator, p) for p in placeholders) if placeholders else ""
        elif constant or direct_object:
            kind = "constant"
            json_path = ""
            constant = constant or direct_object
        elif fn_ref:
            kind = "function"
            json_path = full_json_path(iterator, fn_ref)
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
            triplesmaps[name]["section_code"] = section["code"]
            triplesmaps[name]["section_title"] = section["title"]

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

    tm_list = sorted(triplesmaps.values(), key=lambda t: (t["section_code"] or "zzz", t["id"]))
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
