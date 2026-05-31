"""
Module dup_declaration_test.

Realises:
- ODR-0004 §3a — module-separation discipline. The three-graph gate
  enforces that shapes/annotations/classes live in separate graphs; this
  sibling gate enforces the orthogonal invariant that each `opda:` term is
  *declared* in exactly one module TTL. A term split across two modules with
  conflicting `rdfs:domain` (or any conflicting axioms) is a latent
  modelling defect that byte-identity + three-graph cannot detect.
- ADR-0011 §"Module emission template" — the six per-module TBoxes
  (opda-property / agent / transaction / claim / governance / descriptive)
  partition the OPDA term space; a term belongs to exactly one module.

Motivating regression (caught by hand 2026-05-30, not by CI):
`opda:riskIndicator` was declared in BOTH `opda-property.ttl` (a flat
`owl:DatatypeProperty` with `rdfs:domain opda:Property`) and
`opda-descriptive.ttl` (a Quale on `opda:RiskAssessment`) — with conflicting
`rdfs:domain`. This passed `ci-byte-identity` and `ci-three-graph`
undetected. This gate fails CI on the next such duplicate.

Scope decision: this gate scopes strictly to the `opda:` namespace
(`https://w3id.org/opda/#`). "Declared in exactly one module" is a claim
about *our* terms; re-asserting an external term's `rdf:type` across two
files (e.g. typing an imported DPV concept) is a different concern and out
of scope here. See `OPDA` below.

A *declaration* is the term appearing as the **subject** of an
`rdf:type`/`a` triple whose object is one of `DECLARATION_TYPES`. A mere
*reference* — the term used as an object, or in `rdfs:domain` / `rdfs:range`
/ `skos:broader` / `sh:path` / `sh:targetClass`, etc. — is NOT a declaration
and does NOT trigger the gate.

`run_all(ontology_dir)` parses each top-level module TTL into its own graph,
collects per-module `opda:` declaration-sets, and reports every term that
appears in ≥2 modules' sets. Empty list == PASS.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL, RDF, SKOS


OPDA = Namespace("https://w3id.org/opda/#")


# ---------------------------------------------------------------------------
# Declaration types that count as a *defining* rdf:type triple.
#
# `owl:Ontology` is deliberately EXCLUDED — it is the module header (every
# module TTL types its own ontology IRI as owl:Ontology), so counting it
# would flag every module against every other. Per the brief, the counted
# types are: owl:Class, owl:DatatypeProperty, owl:ObjectProperty,
# owl:AnnotationProperty, rdf:Property, owl:NamedIndividual, skos:Concept,
# skos:ConceptScheme.
# ---------------------------------------------------------------------------
DECLARATION_TYPES: frozenset[URIRef] = frozenset(
    {
        OWL.Class,
        OWL.DatatypeProperty,
        OWL.ObjectProperty,
        OWL.AnnotationProperty,
        RDF.Property,
        OWL.NamedIndividual,
        SKOS.Concept,
        SKOS.ConceptScheme,
    }
)


def declared_opda_terms(graph: Graph) -> dict[URIRef, set[URIRef]]:
    """Collect the `opda:` terms *declared* in a single module graph.

    Returns a mapping ``term -> {counted rdf:type objects}``. A term is
    included iff it is the **subject** of at least one ``rdf:type`` triple
    whose object is in ``DECLARATION_TYPES`` (so an `opda:` subject that only
    appears in `rdfs:domain` / `sh:path` / as an object is excluded). The
    type-set is retained so the violation message can surface the conflicting
    declaration types per module (e.g. owl:DatatypeProperty vs the Quale).
    """
    opda_ns = str(OPDA)
    declared: dict[URIRef, set[URIRef]] = {}
    for subj, _p, obj in graph.triples((None, RDF.type, None)):
        if not isinstance(subj, URIRef) or not str(subj).startswith(opda_ns):
            continue
        if obj in DECLARATION_TYPES:
            declared.setdefault(subj, set()).add(obj)  # type: ignore[arg-type]
    return declared


def _module_ttls(ontology_dir: Path) -> list[Path]:
    """Enumerate the module TTLs that partition the OPDA term space.

    Uses the same file set the byte-identity gate regenerates: the top-level
    `*.ttl` files in the ontology directory (foundation + vocabularies +
    contexts + the six per-module class/shape/annotation TTLs). Subdirectories
    are deliberately skipped — `profiles/` only *references* terms (no
    declarations), `exemplars/` holds ABox instances, and `derived/` is
    composed output. Discovering files (rather than hardcoding) keeps the gate
    correct as modules are added, mirroring `byte_identity.run`'s
    `out_dir.iterdir()` walk.
    """
    return sorted(p for p in ontology_dir.glob("*.ttl") if p.is_file())


def check_cross_module_duplicates(
    declarations_by_module: dict[str, dict[URIRef, set[URIRef]]],
) -> list[str]:
    """Enforce the single-module-declaration invariant.

    ``declarations_by_module`` maps a module label (the TTL filename) to that
    module's `opda:` declaration map (as produced by `declared_opda_terms`).
    Any `opda:` term present in ≥2 modules' maps is a violation.

    Returns a list of violation strings (empty == PASS). Each string names
    the term IRI, the modules it is declared in, and the conflicting
    `rdf:type`(s) per module — so the failure is actionable, as the
    riskIndicator case would have been.
    """
    # term -> {module label -> type-set}
    term_sites: dict[URIRef, dict[str, set[URIRef]]] = {}
    for module_label, declared in declarations_by_module.items():
        for term, types in declared.items():
            term_sites.setdefault(term, {})[module_label] = types

    violations: list[str] = []
    for term in sorted(term_sites, key=str):
        sites = term_sites[term]
        if len(sites) < 2:
            continue
        detail = "; ".join(
            f"{module}: {{{', '.join(sorted(str(t) for t in types))}}}"
            for module, types in sorted(sites.items())
        )
        violations.append(
            f"{term} declared in {len(sites)} modules — {detail}"
        )
    return violations


def run_all(ontology_dir: Path) -> list[str]:
    """Run the cross-module duplicate-declaration check against a directory.

    Parses each top-level module TTL into its own graph, collects per-module
    `opda:` declaration-sets, and returns every term declared in ≥2 modules
    (empty == PASS). A missing ontology directory yields a single violation
    so the caller knows the corpus could not be inspected.
    """
    if not ontology_dir.exists():
        return [f"missing ontology directory: {ontology_dir}"]

    declarations_by_module: dict[str, dict[URIRef, set[URIRef]]] = {}
    for ttl in _module_ttls(ontology_dir):
        graph = Graph()
        graph.parse(str(ttl), format="turtle")
        declarations_by_module[ttl.name] = declared_opda_terms(graph)

    return check_cross_module_duplicates(declarations_by_module)
