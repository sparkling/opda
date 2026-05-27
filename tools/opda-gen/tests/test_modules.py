"""
Tests for ADR-0011 module TBox emission.

Realises:
- ADR-0011 §Confirmation #1 — `emit-module property/agent/transaction/
  claim/governance/descriptive` produces six `.ttl` files.
- ADR-0011 §Confirmation #2 — byte-identity CI green per module
  (second-run regeneration produces zero diff).
- ADR-0011 §Confirmation #3 — A9 discipline output verified (every
  owl:Class has dct:source + skos:scopeNote + rdfs:comment).
- ADR-0011 §Confirmation #4 — three-graph isolation verified (no sh:*
  triples in any module file; no DPV owl:imports in governance).
- ADR-0011 §Confirmation #5 — per-module owl:versionIRI pins to
  generator version 0.3.0.
- ADR-0011 §Confirmation #6 — diagnostic exemplars validate against
  the emitted classes (every `a opda:X` typing resolves).
- ADR-0011 §Confirmation #7 — opda:hasUPRN + opda:identifiesSameProperty
  + opda:hasAddress (the core join predicates from S005 + S015) emit
  and resolve.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS


OPDA = Namespace("https://w3id.org/opda/#")
SH = Namespace("http://www.w3.org/ns/shacl#")
DPV = Namespace("https://w3id.org/dpv")


MODULE_NAMES = (
    "property",
    "agent",
    "transaction",
    "claim",
    "governance",
    "descriptive",
)


# Reference path to the diagnostic exemplars (committed under
# source/03-standards/, a nested git repo).
_REPO_ROOT = Path(__file__).resolve().parents[3]
_EXEMPLARS_DIR = _REPO_ROOT / "source" / "03-standards" / "ontology" / "exemplars"


@pytest.fixture(scope="module")
def emitted_modules(tmp_path_factory: pytest.TempPathFactory) -> dict[str, Path]:
    """Emit all six module TTLs into a single tmp directory + return
    the {module_name: file_path} mapping. Foundation + vocabularies are
    also emitted so import resolution can work against the corpus."""
    tmp = tmp_path_factory.mktemp("modules-ttls")
    from opda_gen.emitters.classes import emit_all_modules
    from opda_gen.emitters.foundation import emit_foundation
    from opda_gen.emitters.vocabularies import emit_vocabularies

    emit_foundation(tmp)
    emit_vocabularies(tmp)
    emit_all_modules(tmp)
    return {name: tmp / f"opda-{name}.ttl" for name in MODULE_NAMES}


# ---------------------------------------------------------------------------
# §Confirmation #1 — all six modules emit
# ---------------------------------------------------------------------------
def test_all_six_modules_emit(emitted_modules: dict[str, Path]) -> None:
    """Per ADR-0011 §Confirmation #1: six TTLs produced + each parseable."""
    assert set(emitted_modules) == set(MODULE_NAMES)
    for name, path in emitted_modules.items():
        assert path.exists(), f"module {name} did not emit at {path}"
        g = Graph()
        g.parse(str(path), format="turtle")
        assert len(g) > 0, f"module {name} parsed empty"


# ---------------------------------------------------------------------------
# §Confirmation #5 — owl:Ontology header with imports + versionIRI
# ---------------------------------------------------------------------------
def test_module_has_owl_ontology_header(emitted_modules: dict[str, Path]) -> None:
    """Per ADR-0011 §Module emission template + §Confirmation #5: each
    module declares an owl:Ontology with owl:imports of foundation +
    vocabularies. ADR-0014 bumped the class-graph version IRI to 1.0.0
    (MVP-gate release marker) and added opda:hasSpecialCategoryData
    foundation DatatypeProperty per G14."""
    for name, path in emitted_modules.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        module_iri = URIRef(f"https://w3id.org/opda/{name}/")
        assert (module_iri, RDF.type, OWL.Ontology) in g, (
            f"module {name} missing owl:Ontology header at {module_iri}"
        )
        assert (
            module_iri, OWL.imports, URIRef("https://w3id.org/opda/1.0.0/")
        ) in g, f"module {name} missing foundation owl:imports"
        assert (
            module_iri, OWL.imports, URIRef("https://w3id.org/opda/vocabularies/")
        ) in g, f"module {name} missing vocabularies owl:imports"
        assert (
            module_iri,
            OWL.versionIRI,
            URIRef(f"https://w3id.org/opda/{name}/1.0.0/"),
        ) in g, f"module {name} missing versionIRI 1.0.0"


# ---------------------------------------------------------------------------
# §Confirmation #3 — A9 per-kind discipline output
# ---------------------------------------------------------------------------
def test_a9_per_kind_discipline(emitted_modules: dict[str, Path]) -> None:
    """Per ADR-0011 §Confirmation #3 + ADR-0007 §A9 per-kind discipline
    output: every owl:Class in every module carries dct:source +
    skos:scopeNote + rdfs:comment (the A9 triple set)."""
    for name, path in emitted_modules.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        # Find every owl:Class subject in this module file (i.e. those
        # the module mints — module IRIs themselves are owl:Ontology,
        # not owl:Class, so they don't appear here).
        for cls in g.subjects(RDF.type, OWL.Class):
            assert (cls, DCTERMS.source, None) in g, (
                f"module {name}: class {cls} missing dct:source"
            )
            assert (cls, RDFS.comment, None) in g, (
                f"module {name}: class {cls} missing rdfs:comment"
            )
            # skos:scopeNote required for every minted class. Short-name
            # aliases (Document/ElectronicRecord/Vouch) in opda-claim
            # also carry skos:scopeNote per the alias documentation.
            assert (cls, SKOS.scopeNote, None) in g, (
                f"module {name}: class {cls} missing skos:scopeNote"
            )


# ---------------------------------------------------------------------------
# §Confirmation #4 — three-graph isolation per module
# ---------------------------------------------------------------------------
def test_three_graph_isolation_per_module(
    emitted_modules: dict[str, Path],
) -> None:
    """Per ADR-0011 §Confirmation #4 + ODR-0004 §3a: no sh:* triples in
    any module classes file; no DPV owl:imports in governance."""
    for name, path in emitted_modules.items():
        g = Graph()
        g.parse(str(path), format="turtle")
        # No sh:* predicates anywhere in module class graphs.
        for _s, p, _o in g:
            assert not str(p).startswith(str(SH)), (
                f"module {name}: sh:* triple ({p}) leaked into class graph"
            )
        # Governance specifically: no owl:imports of any DPV namespace.
        if name == "governance":
            for _s, _p, o in g.triples((None, OWL.imports, None)):
                assert not str(o).startswith("https://w3id.org/dpv"), (
                    f"governance: owl:imports {o} violates reference-not-"
                    "import (ODR-0018 §Rule 4)"
                )


# ---------------------------------------------------------------------------
# §Confirmation #6 — diagnostic exemplars validate
# ---------------------------------------------------------------------------
def test_exemplars_parse_against_modules(emitted_modules: dict[str, Path]) -> None:
    """Per ADR-0011 §Confirmation #6: for each of the 15 exemplars,
    parse foundation + all six modules + the exemplar; every
    `a opda:X` typing resolves to a declared class."""
    if not _EXEMPLARS_DIR.exists():
        pytest.skip(f"exemplars dir not present at {_EXEMPLARS_DIR}")
    exemplars = sorted(_EXEMPLARS_DIR.glob("*.ttl"))
    assert exemplars, "expected ≥1 exemplar"

    # Build the corpus graph once.
    corpus = Graph()
    base = next(iter(emitted_modules.values())).parent
    for fname in (
        "foundation.ttl",
        "opda-classes.ttl",
        "opda-shapes.ttl",
        "opda-annotations.ttl",
        "opda-vocabularies.ttl",
        "opda-property.ttl",
        "opda-agent.ttl",
        "opda-transaction.ttl",
        "opda-claim.ttl",
        "opda-governance.ttl",
        "opda-descriptive.ttl",
    ):
        corpus.parse(str(base / fname), format="turtle")

    declared_classes = {str(c) for c in corpus.subjects(RDF.type, OWL.Class)}

    missing_per_exemplar: dict[str, set[str]] = {}
    for ex_path in exemplars:
        eg = Graph()
        eg.parse(str(ex_path), format="turtle")
        used = {
            str(o)
            for o in eg.objects(predicate=RDF.type)
            if str(o).startswith("https://w3id.org/opda/#")
        }
        missing = used - declared_classes
        if missing:
            missing_per_exemplar[ex_path.name] = missing

    assert not missing_per_exemplar, (
        f"exemplars reference undeclared opda: classes: {missing_per_exemplar}"
    )


# ---------------------------------------------------------------------------
# §Confirmation #7 — core join predicates emit
# ---------------------------------------------------------------------------
def test_core_join_predicates_present(emitted_modules: dict[str, Path]) -> None:
    """Per ADR-0011 §Confirmation #7: opda:hasUPRN, opda:hasAddress,
    opda:identifiesSameProperty (the core S005 + S015 join predicates)
    are all declared in opda-property.ttl."""
    g = Graph()
    g.parse(str(emitted_modules["property"]), format="turtle")
    for predicate, expected_type in (
        (OPDA.hasUPRN, OWL.DatatypeProperty),
        (OPDA.hasAddress, OWL.ObjectProperty),
        (OPDA.identifiesSameProperty, OWL.ObjectProperty),
    ):
        assert (predicate, RDF.type, expected_type) in g, (
            f"opda-property.ttl missing {predicate} declared as "
            f"{expected_type}"
        )
        # Each predicate also carries dct:source (A9 discipline for
        # properties, by convention with classes).
        assert (predicate, DCTERMS.source, None) in g, (
            f"opda-property.ttl: {predicate} missing dct:source"
        )


# ---------------------------------------------------------------------------
# Byte-identity for module emission
# ---------------------------------------------------------------------------
def test_byte_identity_modules() -> None:
    """Second-run regeneration produces byte-identical module TTLs."""
    from opda_gen.emitters.classes import emit_all_modules

    with tempfile.TemporaryDirectory() as a_dir, tempfile.TemporaryDirectory() as b_dir:
        a = Path(a_dir)
        b = Path(b_dir)
        a_written = emit_all_modules(a)
        b_written = emit_all_modules(b)
        assert sorted(p.name for p in a_written) == sorted(
            p.name for p in b_written
        )
        for a_path in sorted(a_written):
            b_path = b / a_path.name
            assert a_path.read_bytes() == b_path.read_bytes(), (
                f"byte mismatch between two runs: {a_path.name}"
            )


# ---------------------------------------------------------------------------
# Foundation expansion — three UFO meta-classes folded into opda-classes.ttl
# ---------------------------------------------------------------------------
def test_foundation_includes_ufo_meta_classes() -> None:
    """Per ADR-0011 + ODR-0006 §Q2/§Q3: foundation declares
    opda:RoleMixin + opda:Role + opda:Relator (5 classes initially).
    ADR-0013 adds opda:ValidationContext (per ODR-0010 §Q1) — 6 total."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        from opda_gen.emitters.foundation import emit_foundation
        emit_foundation(out)
        g = Graph()
        g.parse(str(out / "opda-classes.ttl"), format="turtle")
        classes = set(g.subjects(RDF.type, OWL.Class))
        for cls in (
            OPDA.DiagnosticExemplar,
            OPDA.GeneratorRun,
            OPDA.RoleMixin,
            OPDA.Role,
            OPDA.Relator,
            OPDA.ValidationContext,
        ):
            assert cls in classes, f"foundation missing class {cls}"
        # Exactly six foundation classes after ADR-0013 expansion.
        assert len(classes) == 6, (
            f"expected 6 foundation classes, got {len(classes)}: {classes}"
        )


# ---------------------------------------------------------------------------
# Module dispatch validation
# ---------------------------------------------------------------------------
def test_emit_module_rejects_unknown_name(tmp_path: Path) -> None:
    """Per ADR-0011 + CLI design: unknown module names raise ValueError."""
    from opda_gen.emitters.classes import emit_module
    with pytest.raises(ValueError, match="unknown module"):
        emit_module("nonexistent", tmp_path)


def test_each_module_self_documents_via_catalogue() -> None:
    """Each module's CLASSES tuple is non-empty + matches the owl:Class
    declarations in its emitted graph. Defends the brief's instruction
    that per-module catalogues exist for testability."""
    from opda_gen.emitters.modules import MODULE_REGISTRY
    for name, builder in MODULE_REGISTRY.items():
        assert hasattr(builder, "CLASSES"), (
            f"module {name} missing CLASSES catalogue"
        )
        # OBJECT_PROPERTIES + DATATYPE_PROPERTIES may be empty (e.g.
        # opda-descriptive.ttl currently emits classes only, properties
        # deferred to G11). But they must exist as attributes.
        assert hasattr(builder, "OBJECT_PROPERTIES")
        assert hasattr(builder, "DATATYPE_PROPERTIES")
        g = builder.build_graph()
        declared = set(g.subjects(RDF.type, OWL.Class))
        catalogued = set(builder.CLASSES)
        # Catalogue must match owl:Class declarations exactly
        # (extras would indicate a stale catalogue; missing would
        # indicate undeclared classes the catalogue claims).
        assert catalogued == declared, (
            f"module {name}: catalogue {catalogued} != declared {declared}"
        )
