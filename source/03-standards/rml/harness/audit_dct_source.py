"""
Audits every opda: term's dct:source citation into the canonical data
dictionary (opda-gen's own authoritative JSON-Schema-location flattening).

This is DIFFERENT from validate_provenance.py's checks 2/3 (which validate the
RML MAPPING's own path references). This audits the ONTOLOGY's dct:source
triples directly — a term can cite a data-dictionary path in TWO distinct,
both-legitimate forms opda-gen uses:

  (a) a field-location citation: "propertyPack.searches[].productCode"
      -- must match a canonical dictionary path EXACTLY.
  (b) a SKOS-concept-value citation: "{field_path}.{EnumValue}"
      -- documents "this scheme member corresponds to this specific value of
      field_path's enum" (or, for rating scales / object-derived schemes, a
      value that isn't in a literal JSON Schema `enum` array at all). The
      dictionary has NO separate row per enum value, so comparing the WHOLE
      string against the flat path set is a category error, not a defect —
      the ontology's own naming convention concatenates the field path with
      the concept's local name. Strip the trailing segment and check the
      FIELD portion instead.

Confirmed findings after correcting for this: 8 citations with a precise,
locatable path drift (the field exists, just under a different real
nesting); 16 citations with no matching field anywhere in the current v3
schema. Both are findings for the ontology owners to fix at the
generator-input level (opda-merged.ttl is machine-generated — DO NOT
HAND-EDIT the .ttl output).

ADR-0037 port: all RDF querying goes through Apache Jena's `arq`
(jena_query.sparql_select) — no rdflib.
"""
from __future__ import annotations
import json, re
from pathlib import Path
from urllib.parse import unquote

from jena_query import sparql_select

ROOT = Path("/Users/henrik/source/opda")
ONT_FILE = ROOT / "public/ontology/artefacts/opda-merged.ttl"
DICT_FILE = ROOT / "source/00-deliverables/semantic-models/data-dictionary-canonical.json"

OPDA = "https://opda.org.uk/pdtf/"
DD = OPDA + "harness/data-dictionary/"


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


DCT_SOURCE_Q = """
PREFIX dct: <http://purl.org/dc/terms/>
SELECT ?s ?o WHERE { ?s dct:source ?o . }
"""


def main():
    rows = sparql_select(DCT_SOURCE_Q, ONT_FILE)

    dict_recs = json.loads(DICT_FILE.read_text())
    all_paths = {r["path"] for r in dict_recs}
    by_path: dict[str, list] = {}
    for r in dict_recs:
        by_path.setdefault(r["path"], []).append(r)

    cited: dict[str, list[str]] = {}
    for r in rows:
        s, o = r["s"], r["o"]
        if not s.startswith(OPDA):
            continue
        if o.startswith(DD):
            p = unquote(o[len(DD):])
            cited.setdefault(p, []).append(s[len(OPDA):])

    field_matches = {p: terms for p, terms in cited.items() if p in all_paths}
    mismatched = {p: terms for p, terms in cited.items() if p not in all_paths}

    skos_confirmed_enum, skos_confirmed_no_enum, drifted, truly_missing = [], [], [], []
    for path, terms in mismatched.items():
        field_path, _, value = path.rpartition(".")
        recs_here = by_path.get(field_path)
        if recs_here:
            enum_vals = set()
            for r in recs_here:
                enum_vals |= set(r.get("enum") or [])
            if enum_vals and any(norm(value) == norm(v) for v in enum_vals):
                skos_confirmed_enum.append({"path": path, "terms": terms, "real_field": field_path})
            else:
                skos_confirmed_no_enum.append({"path": path, "terms": terms, "real_field": field_path})
            continue
        last = field_path.rstrip("[]").split(".")[-1]
        candidates = sorted({p for p in all_paths if p.rstrip("[]").split(".")[-1] == last})
        top = field_path.split(".")[0]
        candidates = [c for c in candidates if c.split(".")[0] == top] or candidates
        if len(candidates) == 1:
            drifted.append({"path": path, "terms": terms, "cited_field": field_path, "real_field": candidates[0]})
        else:
            truly_missing.append({"path": path, "terms": terms, "cited_field": field_path,
                                   "ambiguous_candidates": candidates[:5]})

    report = {
        "total_citations": len(cited),
        "field_location_citations_ok": len(field_matches),
        "skos_concept_citations_confirmed_enum": skos_confirmed_enum,
        "skos_concept_citations_confirmed_no_enum": skos_confirmed_no_enum,
        "drifted_findings": drifted,
        "unresolved_findings": truly_missing,
    }
    out = ROOT / "source/03-standards/rml/build/dct-source-audit.json"
    out.write_text(json.dumps(report, indent=2))

    print(f"total dct:source data-dictionary citations across ontology: {len(cited)}")
    print(f"  direct field-location match: {len(field_matches)}")
    print(f"  SKOS-concept-value citation, confirmed via enum array: {len(skos_confirmed_enum)}")
    print(f"  SKOS-concept-value citation, confirmed via exact field (no enum array): {len(skos_confirmed_no_enum)}")
    print(f"  DRIFTED (real field exists, citation path is stale): {len(drifted)}")
    for d in drifted:
        print(f"    {d['path']}")
        print(f"      cited:  {d['cited_field']}")
        print(f"      real:   {d['real_field']}")
    print(f"  UNRESOLVED (no matching field found in current v3 schema): {len(truly_missing)}")
    for d in truly_missing:
        print(f"    {d['path']}  (terms: {d['terms']})")


if __name__ == "__main__":
    main()
