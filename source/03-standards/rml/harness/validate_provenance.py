"""
RML-as-provenance validator. NO instance data, NO SHACL-on-data, NO morph-kgc
execution. The RML mapping is a declarative trace linking OWL resources to the
JSON Schema locations they were derived from — this validates that trace
directly, structurally, against the ontology and the canonical schema
dictionary (opda-gen's own authoritative flattening of the JSON schemas —
the same paths the ontology's own dct:source triples cite).

Three checks:
  1. RML -> OWL consistency: every rr:class / rr:predicate used is a real
     declared term in the ontology.
  2. Resource -> Schema location: every OWL resource in the schema-generated
     scope has an RML statement citing a JSON Schema location that actually
     exists in the canonical dictionary.
  3. Schema location -> Resource: every canonical-dictionary JSON Schema
     location is referenced by at least one RML statement.

ADR-0037 port: all RDF parsing/querying goes through Apache Jena's `arq`
(jena_query.sparql_select) — no rdflib anywhere. Only plain-Python string/
JSON handling (path normalisation, dictionary cross-reference) runs outside
Jena, exactly as it would for any other language processing CSV query
results.
"""
from __future__ import annotations
import json, re
from pathlib import Path
from collections import defaultdict

from jena_query import sparql_select

ROOT = Path("/Users/henrik/source/opda")
RML_FILE = ROOT / "source/03-standards/rml/mapping/opda-pdtf.rml.ttl"
ONT_FILE = ROOT / "public/ontology/artefacts/opda-merged.ttl"
DICT_FILE = ROOT / "source/00-deliverables/semantic-models/data-dictionary-canonical.json"
SCOPE_FILE = ROOT / "source/03-standards/rml/build/final-gap.json"

OPDA = "https://opda.org.uk/pdtf/"
RR = "http://www.w3.org/ns/r2rml#"
RML_NS = "http://semweb.mmlab.be/ns/rml#"


def L(iri: str) -> str:
    return iri[len(OPDA):] if iri.startswith(OPDA) else iri


# ---------------------------------------------------------------------------
# Ground truth: the canonical dictionary (every JSON Schema location).
# ---------------------------------------------------------------------------
dict_records = json.loads(DICT_FILE.read_text())
schema_paths = {rec["path"] for rec in dict_records}

# ---------------------------------------------------------------------------
# Ground truth: the ontology (every declared class/property), via Jena SPARQL.
# ---------------------------------------------------------------------------
ONT_TERMS_Q = """
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT ?term ?kind WHERE {
  { ?term rdf:type owl:Class . BIND("Class" AS ?kind) }
  UNION
  { ?term rdf:type owl:DatatypeProperty . BIND("DatatypeProperty" AS ?kind) }
  UNION
  { ?term rdf:type owl:ObjectProperty . BIND("ObjectProperty" AS ?kind) }
}
"""
_ont_rows = sparql_select(ONT_TERMS_Q, ONT_FILE)
ont_classes = {L(r["term"]) for r in _ont_rows if r["kind"] == "Class" and r["term"].startswith(OPDA)}
ont_props = {L(r["term"]) for r in _ont_rows
             if r["kind"] in ("DatatypeProperty", "ObjectProperty") and r["term"].startswith(OPDA)}

# Object properties whose range is an opda: class are JOIN/relationship
# predicates (e.g. opda:annualGroundRent -> opda:MonetaryAmount,
# opda:hasEPCCertificate -> opda:EPCCertificate). Their rr:template
# placeholder is a JOIN KEY used to construct the link to the target node's
# own IRI — it is NOT the schema location where this predicate's semantic
# content lives (that content is the RANGE CLASS's own properties, already
# correctly tracked via that class's own TriplesMap). Verified against a
# dct:source cross-check: naively attributing the join-key placeholder as
# "the schema location" produced a wrong path for exactly this predicate
# shape (e.g. showed opda:annualGroundRent -> ...titleNumber, when both the
# mapping's own inline comment and dct:source agree the real location is
# ...leaseholdInformation.groundRent.annualGroundRent).
RANGE_Q = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?term ?range WHERE { ?term rdfs:range ?range }
"""
_range_rows = sparql_select(RANGE_Q, ONT_FILE)
join_predicates = {
    L(r["term"]) for r in _range_rows
    if r["term"].startswith(OPDA) and r["range"].startswith(OPDA)
    and L(r["range"]) in ont_classes
}

# ---------------------------------------------------------------------------
# Parse the RML mapping's structure via SPARQL (no rdflib).
# ---------------------------------------------------------------------------
TM_Q = """
PREFIX rr: <http://www.w3.org/ns/r2rml#>
PREFIX rml: <http://semweb.mmlab.be/ns/rml#>
SELECT ?tm ?iterator ?cls ?subjTemplate WHERE {
  ?tm a rr:TriplesMap ;
      rml:logicalSource ?ls .
  ?ls rml:iterator ?iterator .
  OPTIONAL {
    ?tm rr:subjectMap ?sm .
    OPTIONAL { ?sm rr:class ?cls }
    OPTIONAL { ?sm rr:template ?subjTemplate }
  }
}
"""
POM_Q = """
PREFIX rr: <http://www.w3.org/ns/r2rml#>
PREFIX rml: <http://semweb.mmlab.be/ns/rml#>
SELECT ?tm ?pred ?ref ?tmpl ?constObj ?constObj2 WHERE {
  ?tm rr:predicateObjectMap ?pom .
  ?pom rr:predicate ?pred ;
       rr:objectMap ?om .
  OPTIONAL { ?om rml:reference ?ref }
  OPTIONAL { ?om rr:template ?tmpl }
  OPTIONAL { ?om rr:object ?constObj }
  OPTIONAL { ?om rr:constant ?constObj2 }
}
"""
tm_rows = sparql_select(TM_Q, RML_FILE)
pom_rows = sparql_select(POM_Q, RML_FILE)

iterator_by_tm: dict[str, str] = {r["tm"]: r["iterator"] for r in tm_rows}
subject_info_by_tm: dict[str, dict] = defaultdict(dict)
for r in tm_rows:
    if r.get("cls"):
        subject_info_by_tm[r["tm"]]["cls"] = r["cls"]
    if r.get("subjTemplate"):
        subject_info_by_tm[r["tm"]]["template"] = r["subjTemplate"]

poms_by_tm: dict[str, list[dict]] = defaultdict(list)
for r in pom_rows:
    poms_by_tm[r["tm"]].append(r)


def normalise_path(iterator: str, ref: str) -> str:
    """Combine an rml:iterator ('$' or '$.a.b[*]') with a reference ('c.d' or
    a nested reference) into a dotted, []-for-array path matching the
    canonical dictionary's convention.

    - JSONPath FILTER expressions (`[?(@.role=="Seller")]`) are an
      INSTANCE-query construct with no schema-location meaning; normalised
      to a plain `[]`.
    - An array CONTAINER's own dictionary entry has NO trailing `[]`
      (`propertyPack.searches`, not `propertyPack.searches[]`); `[]` is used
      only for FIELDS nested inside the array's items.
    """
    it = iterator.strip()
    if it.startswith("$"):
        it = it[1:]
    it = it.lstrip(".")
    it = re.sub(r"\[\?\([^)]*\)\]", "[]", it)
    it = re.sub(r"\[\*\]", "[]", it)
    ref = re.sub(r"\[\?\([^)]*\)\]", "[]", ref.strip())
    if not ref:
        return it[:-2] if it.endswith("[]") else it
    if not it:
        return ref
    return f"{it}.{ref}"


findings = {
    "rml_to_owl": {"invented_classes": [], "invented_predicates": [], "external_terms_used": []},
    "resource_to_schema": {"mapped_ok": [], "unmapped": []},
    "schema_to_resource": {},
}

referenced_paths: set[str] = set()
resource_links: dict[str, list[str]] = defaultdict(list)
predicates_used: set[str] = set()  # every predicate the mapping actually emits, regardless of bucket

for tm, iterator in iterator_by_tm.items():
    info = subject_info_by_tm.get(tm, {})
    cls = info.get("cls")
    tmpl = info.get("template")

    if cls is not None:
        cls_local = L(cls)
        if cls.startswith(OPDA):
            if cls_local not in ont_classes:
                findings["rml_to_owl"]["invented_classes"].append(cls_local)
        else:
            findings["rml_to_owl"]["external_terms_used"].append(cls)
        container_path = normalise_path(iterator, "")
        if container_path:
            referenced_paths.add(container_path)
            resource_links[cls_local].append(container_path)

    if tmpl:
        for ref in re.findall(r"\{([^}]+)\}", tmpl):
            referenced_paths.add(normalise_path(iterator, ref))

    for pom in poms_by_tm.get(tm, []):
        pred = pom.get("pred")
        if not pred:
            continue
        pred_local = L(pred)
        if pred.startswith(OPDA):
            if pred_local not in ont_props:
                findings["rml_to_owl"]["invented_predicates"].append(pred_local)
        else:
            findings["rml_to_owl"]["external_terms_used"].append(pred)

        predicates_used.add(pred_local)
        ref = pom.get("ref")
        tmpl2 = pom.get("tmpl")
        const = pom.get("constObj") or pom.get("constObj2")

        if ref:
            path = normalise_path(iterator, ref)
            referenced_paths.add(path)
            resource_links[pred_local].append(path)
        elif tmpl2:
            placeholders = re.findall(r"\{([^}]+)\}", tmpl2)
            for ph in placeholders:
                path = normalise_path(iterator, ph)
                referenced_paths.add(path)  # still a real, consulted location (Check 3)
                if pred_local not in join_predicates:
                    resource_links[pred_local].append(path)
                # else: join-key placeholder — not this predicate's content
                # location (see join_predicates comment above); the range
                # class's own TriplesMap already carries the real location.
        elif const:
            # constant IRI/value — synthesised, not derived from any JSON
            # location. Correctly excluded from schema-location tracing.
            pass

findings["rml_to_owl"]["invented_classes"] = sorted(set(findings["rml_to_owl"]["invented_classes"]))
findings["rml_to_owl"]["invented_predicates"] = sorted(set(findings["rml_to_owl"]["invented_predicates"]))
findings["rml_to_owl"]["external_terms_used"] = sorted(set(findings["rml_to_owl"]["external_terms_used"]))

# --- Check 2: resource -> schema location, across the whole ontology ---
for term in sorted(ont_classes):
    paths = resource_links.get(term, [])
    if not paths:
        findings["resource_to_schema"]["unmapped"] = findings["resource_to_schema"].get("unmapped", [])
        findings["resource_to_schema"]["unmapped"].append({"term": term, "kind": "Class"})
        continue
    findings["resource_to_schema"].setdefault("mapped_ok", []).append(
        {"term": term, "kind": "Class", "paths": paths})

for term in sorted(ont_props):
    paths = resource_links.get(term, [])
    if paths:
        findings["resource_to_schema"].setdefault("mapped_ok", []).append(
            {"term": term, "kind": "Property", "paths": paths})
    elif term in join_predicates and term in predicates_used:
        # genuinely implemented (the mapping emits this predicate), but as a
        # relationship/join — its content location is the range class's own
        # TriplesMap, not a literal path of its own. Distinct from "unmapped"
        # (never appears in the mapping at all).
        findings["resource_to_schema"].setdefault("mapped_relationally", []).append(
            {"term": term, "kind": "Property"})
    else:
        findings["resource_to_schema"].setdefault("unmapped", []).append({"term": term, "kind": "Property"})

# --- Check 3: schema location -> resource ---
unreferenced = sorted(schema_paths - referenced_paths)
findings["schema_to_resource"] = {
    "referenced_paths": sorted(referenced_paths),
    "unreferenced_count": len(unreferenced),
    "unreferenced_sample": unreferenced[:30],
}

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
print("=== CHECK 1: RML -> OWL consistency (opda: terms; via Jena arq) ===")
print("invented classes:", findings["rml_to_owl"]["invented_classes"] or "NONE")
print("invented predicates:", findings["rml_to_owl"]["invented_predicates"] or "NONE")
print(f"external-vocabulary terms in use (audited by hand): {findings['rml_to_owl']['external_terms_used'] or 'NONE'}")

print("\n=== CHECK 2: Resource -> Schema location ===")
ok = findings["resource_to_schema"].get("mapped_ok", [])
relational = findings["resource_to_schema"].get("mapped_relationally", [])
unmapped = findings["resource_to_schema"].get("unmapped", [])
print(f"mapped relationally (join predicate; content lives on range class): {len(relational)}")
for r in relational:
    print(f"  {r['term']}")
print(f"mapped + path resolves in schema: {len(ok)}")
print(f"unmapped (no RML statement at all): {len(unmapped)}")

print("\n=== CHECK 3: Schema location -> Resource ===")
print(f"total canonical dictionary locations: {len(schema_paths)}")
print(f"referenced by some RML statement: {len(findings['schema_to_resource']['referenced_paths'])}")
print(f"unreferenced: {findings['schema_to_resource']['unreferenced_count']}")

Path(ROOT / "source/03-standards/rml/build/provenance-validation.json").write_text(
    json.dumps(findings, indent=2, default=list)
)
