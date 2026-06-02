"""
Test traceability.

Realises:
- ADR-0014 §"`dct:source` traceability layer" lines 152-172 +
  §Confirmation #5 — SPARQL-driven verification that every minted
  form question + every BASPI5 profile shape has `dct:source`
  resolving per ODR-0010 §Q3 traceability discipline.
- ODR-0010 §Q3 — form-question IRIs MUST be authority-stable
  (`https://www.basp.uk/forms/baspi5#<anchor>`).
- ADR-0007 §"A9 per-kind discipline output" — every emitted term
  MUST carry `dct:source` to a ratified ODR section.
"""

from __future__ import annotations

import re

from rdflib import Graph, URIRef
from rdflib.namespace import DCTERMS, RDF


SH = URIRef("http://www.w3.org/ns/shacl#")
OPDA = URIRef("https://opda.org.uk/pdtf/")


# ---------------------------------------------------------------------------
# Confirmation #5 — dct:source traceability tests pass
# ---------------------------------------------------------------------------
def test_every_baspi5_node_shape_has_dct_source(
    baspi5_profile_graph: Graph,
) -> None:
    """Every Baspi5_*Shape NodeShape MUST carry a dct:source citation
    per ODR-0010 §Q3 (form-question IRI minting).
    """
    SH_NS = "http://www.w3.org/ns/shacl#"
    node_shapes = list(
        baspi5_profile_graph.subjects(
            RDF.type, URIRef(SH_NS + "NodeShape"),
        ),
    )
    assert node_shapes, "BASPI5 profile emitted no NodeShape"
    missing = [
        s for s in node_shapes
        if not list(baspi5_profile_graph.objects(s, DCTERMS.source))
    ]
    assert not missing, (
        f"BASPI5 NodeShapes missing dct:source: {missing}"
    )


def test_baspi5_form_question_iris_resolve_to_baspi_authority(
    baspi5_profile_graph: Graph,
) -> None:
    """Every BASPI5 form-question dct:source MUST follow the
    canonical `https://www.basp.uk/forms/baspi5#<anchor>` pattern.
    """
    pattern = re.compile(
        r"^https://www\.basp\.uk/forms/baspi5#[\w.]+$",
    )
    sources = [
        s for s in baspi5_profile_graph.objects(None, DCTERMS.source)
        if isinstance(s, URIRef)
        and str(s).startswith("https://www.basp.uk/forms/baspi5")
    ]
    assert sources, "BASPI5 profile emitted no form-question IRIs"
    bad = [s for s in sources if not pattern.match(str(s))]
    assert not bad, (
        f"form-question IRIs violating canonical pattern: {bad}"
    )


def test_baspi5_form_question_anchors_exact_match_baspi5_schema(
    baspi5_profile_graph: Graph,
) -> None:
    """Per ADR-0014 G19 closure: every BASPI5 form-question anchor
    MUST exactly match a `baspi5Ref` value in the BASPI5 JSON schema.
    Verified against the source schema (build-time check).
    """
    import json
    from pathlib import Path

    schema_path = (
        Path(__file__).resolve().parents[2]
        / "source" / "03-standards" / "schemas"
        / "src" / "schemas" / "v3" / "overlays" / "baspi5.json"
    )
    with schema_path.open() as f:
        schema = json.load(f)

    refs: set[str] = set()

    def walk(obj):
        if isinstance(obj, dict):
            if "baspi5Ref" in obj:
                refs.add(obj["baspi5Ref"])
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for v in obj:
                walk(v)

    walk(schema)

    profile_anchors: set[str] = set()
    for src in baspi5_profile_graph.objects(None, DCTERMS.source):
        if not isinstance(src, URIRef):
            continue
        s = str(src)
        if s.startswith("https://www.basp.uk/forms/baspi5#"):
            profile_anchors.add(s.split("#", 1)[1])

    mismatches = profile_anchors - refs
    assert not mismatches, (
        f"profile anchors NOT in baspi5.json `baspi5Ref` values "
        f"(G19 acceptance): {sorted(mismatches)}"
    )


def test_every_validation_context_has_dct_source(
    baspi5_profile_graph: Graph,
) -> None:
    """The BASPI5 ValidationContext reification MUST carry dct:source
    per ODR-0010 §Q1.
    """
    OPDA_NS = "https://opda.org.uk/pdtf/"
    contexts = list(
        baspi5_profile_graph.subjects(
            RDF.type, URIRef(OPDA_NS + "ValidationContext"),
        ),
    )
    assert contexts, "BASPI5 profile missing ValidationContext"
    for ctx in contexts:
        sources = list(baspi5_profile_graph.objects(ctx, DCTERMS.source))
        assert sources, f"ValidationContext {ctx} missing dct:source"


def test_every_minted_class_has_dct_source(opda_ontology: Graph) -> None:
    """Per ADR-0007 §A9: every opda:-namespaced owl:Class MUST carry
    dct:source resolving to a ratified ODR section.
    """
    from rdflib.namespace import OWL

    opda_classes = [
        s for s in opda_ontology.subjects(RDF.type, OWL.Class)
        if isinstance(s, URIRef) and str(s).startswith(
            "https://opda.org.uk/pdtf/"
        )
    ]
    assert opda_classes, "no opda: owl:Class declarations found"

    missing = []
    for cls in opda_classes:
        sources = list(opda_ontology.objects(cls, DCTERMS.source))
        if not sources:
            missing.append(str(cls))
    assert not missing, (
        f"opda: owl:Class declarations missing dct:source: {missing}"
    )


def test_every_minted_datatype_property_has_dct_source(
    opda_ontology: Graph,
) -> None:
    """Per ADR-0007 §A9: every opda:-namespaced owl:DatatypeProperty
    MUST carry dct:source. Covers G14 (hasSpecialCategoryData) +
    G18 (role) acceptance.
    """
    from rdflib.namespace import OWL

    dp = [
        s for s in opda_ontology.subjects(RDF.type, OWL.DatatypeProperty)
        if isinstance(s, URIRef) and str(s).startswith(
            "https://opda.org.uk/pdtf/"
        )
    ]
    assert dp, "no opda: owl:DatatypeProperty declarations found"

    missing = []
    for p in dp:
        sources = list(opda_ontology.objects(p, DCTERMS.source))
        if not sources:
            missing.append(str(p))
    assert not missing, (
        f"opda: DatatypeProperties missing dct:source: {missing}"
    )
