"""
Module inference_closure_test.

Realises:
- ADR-0035 §Confirmation — the `ci-inference-closure` gate. After the
  OWL-RL-safe closure (ODR-0025 §R1) is materialised, assert:
    1. the inferred graph is non-empty;
    2. a known `rdfs:subClassOf` instance gains its parent type; a known
       `owl:inverseOf` is materialised both directions; a known
       `owl:TransitiveProperty` chain closes — *for each construct opda's
       model actually exercises* (see the model-coverage note below);
    3. NO R2-excluded triple appears — no `owl:sameAs`, and (the regression
       guard) no spurious `opda:EPCCertificate rdf:type opda:Property`.
- ODR-0025 §R1/§R2 — the enabled/excluded rule split.
- ADR-0008 §"CI workflow" — invoked by `opda-gen ci-inference-closure`.

Why this gate runs in-process (rdflib) rather than against live Fuseki
=====================================================================
The production loader (`scripts/fuseki-load.mjs::materializeEntailments`)
runs the closure as Jena SPARQL `UPDATE` over a live Fuseki dataset, reading
the `urn:x-arq:UnionGraph` ARQ pseudo-graph. That path needs Docker and a
running container, so it cannot run in the hermetic `opda-gen` pytest/CI
harness alongside the other gates. This gate instead loads the same TBox +
the exemplar ABox into an rdflib `Dataset` and runs the **same seven rule
bodies** (semantically identical INSERT…WHERE…FILTER NOT EXISTS), swapping
the Jena `GRAPH <urn:x-arq:UnionGraph>` read for the portable `GRAPH ?g`
form (rdflib has no ARQ union pseudo-graph). The rule semantics — and the
R2 exclusions — are identical to the loader's; this gate is the static,
Docker-free proof that the closure does what ODR-0025 §R1 specifies and
nothing it forbids.

Model-coverage note (honest scope)
===================================
opda's current ontology + exemplars exercise exactly ONE of the seven safe
rules: `rdfs:subClassOf` type-propagation (rule 4). The model declares NO
`owl:inverseOf`, NO `owl:TransitiveProperty`, NO `owl:SymmetricProperty`,
NO `owl:disjointWith`, and the class hierarchy is flat (no A⊑B⊑C chains).
So the inverse/transitive/symmetric assertions in ADR-0035 §Confirmation #2
are written as *conditional guards*: if the construct is present in the
asserted graph, the gate asserts the rule fired correctly; while the model
exercises none, those guards pass vacuously. The positive non-emptiness
assertion is carried by subclass type-propagation on the exemplar ABox.
The guards start enforcing the moment an inverse/transitive/symmetric
property lands in the model — no gate edit needed.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Dataset, URIRef

# The derived inferred-graph IRI — same as the loader's ENTAILMENT_GRAPH.
ENTAILMENT_GRAPH = "https://w3id.org/opda/graph/inferred/entailment"

_PFX = (
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
    "PREFIX owl: <http://www.w3.org/2002/07/owl#> "
)

# The class-TBox + vocabulary TTLs (the asserted schema). Mirrors the loader's
# upload set, minus the shape/annotation graphs (which carry no entailment
# vocabulary the safe rules key on).
_TBOX_TTLS = (
    "foundation.ttl",
    "opda-classes.ttl",
    "opda-vocabularies.ttl",
    "opda-contexts.ttl",
    "opda-property.ttl",
    "opda-agent.ttl",
    "opda-transaction.ttl",
    "opda-claim.ttl",
    "opda-governance.ttl",
    "opda-descriptive.ttl",
)

# The seven Safe-Group rules (ODR-0025 §R1; config/opda-owl-rl-safe.rules),
# byte-for-byte the same semantics as fuseki-load.mjs::SAFE_RULES, with the
# Jena `urn:x-arq:UnionGraph` read rewritten as the portable `GRAPH ?g`
# pattern. Each is an idempotent INSERT … FILTER NOT EXISTS into the inferred
# graph. Dependency order: schema closure, then propagation, then data rules.
_SAFE_RULES = (
    # 1. rdfs:subClassOf transitivity
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?x rdfs:subClassOf ?z }} }}
        WHERE {{ GRAPH ?ga {{ ?x rdfs:subClassOf ?y }} GRAPH ?gb {{ ?y rdfs:subClassOf ?z }}
                 FILTER(?x != ?z) FILTER NOT EXISTS {{ GRAPH ?gc {{ ?x rdfs:subClassOf ?z }} }} }}""",
    # 2. rdfs:subPropertyOf transitivity
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?p rdfs:subPropertyOf ?r }} }}
        WHERE {{ GRAPH ?ga {{ ?p rdfs:subPropertyOf ?q }} GRAPH ?gb {{ ?q rdfs:subPropertyOf ?r }}
                 FILTER(?p != ?r) FILTER NOT EXISTS {{ GRAPH ?gc {{ ?p rdfs:subPropertyOf ?r }} }} }}""",
    # 3. rdfs:subPropertyOf value propagation
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?x ?q ?y }} }}
        WHERE {{ GRAPH ?ga {{ ?p rdfs:subPropertyOf ?q }} GRAPH ?gb {{ ?x ?p ?y }}
                 FILTER(?p != ?q) FILTER NOT EXISTS {{ GRAPH ?gc {{ ?x ?q ?y }} }} }}""",
    # 4. rdfs:subClassOf type propagation
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?v rdf:type ?y }} }}
        WHERE {{ GRAPH ?ga {{ ?v rdf:type ?x }} GRAPH ?gb {{ ?x rdfs:subClassOf ?y }}
                 FILTER(?x != ?y) FILTER NOT EXISTS {{ GRAPH ?gc {{ ?v rdf:type ?y }} }} }}""",
    # 5a. owl:inverseOf (forward)
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?y ?q ?x }} }}
        WHERE {{ GRAPH ?ga {{ ?p owl:inverseOf ?q }} GRAPH ?gb {{ ?x ?p ?y }}
                 FILTER NOT EXISTS {{ GRAPH ?gc {{ ?y ?q ?x }} }} }}""",
    # 5b. owl:inverseOf (reverse)
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?y ?p ?x }} }}
        WHERE {{ GRAPH ?ga {{ ?p owl:inverseOf ?q }} GRAPH ?gb {{ ?x ?q ?y }}
                 FILTER NOT EXISTS {{ GRAPH ?gc {{ ?y ?p ?x }} }} }}""",
    # 6. owl:SymmetricProperty
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?y ?p ?x }} }}
        WHERE {{ GRAPH ?ga {{ ?p a owl:SymmetricProperty }} GRAPH ?gb {{ ?x ?p ?y }}
                 FILTER NOT EXISTS {{ GRAPH ?gc {{ ?y ?p ?x }} }} }}""",
    # 7. owl:TransitiveProperty
    f"""INSERT {{ GRAPH <{ENTAILMENT_GRAPH}> {{ ?x ?p ?z }} }}
        WHERE {{ GRAPH ?ga {{ ?p a owl:TransitiveProperty }} GRAPH ?gb {{ ?x ?p ?y }} GRAPH ?gc {{ ?y ?p ?z }}
                 FILTER(?x != ?z) FILTER NOT EXISTS {{ GRAPH ?gd {{ ?x ?p ?z }} }} }}""",
)


def _load_asserted(ontology_dir: Path) -> tuple[Dataset, list[str]]:
    """Load the TBox + exemplar ABox into a fresh rdflib Dataset.

    Each TTL goes into its own named graph (faithful to the loader's
    per-module graph identity). Returns the dataset and a list of
    missing-file violation strings.
    """
    ds = Dataset()
    missing: list[str] = []
    for name in _TBOX_TTLS:
        path = ontology_dir / name
        if not path.exists():
            missing.append(f"missing TBox file: {path}")
            continue
        ds.graph(URIRef(f"https://w3id.org/opda/graph/{name}")).parse(
            str(path), format="turtle"
        )
    exemplars_dir = ontology_dir / "exemplars"
    if exemplars_dir.exists():
        for ex in sorted(exemplars_dir.glob("*.ttl")):
            if ex.name.endswith("-expected-report.ttl"):
                continue
            ds.graph(URIRef(f"urn:opda:exemplar:{ex.stem}")).parse(
                str(ex), format="turtle"
            )
    else:
        missing.append(f"missing exemplars dir: {exemplars_dir}")
    return ds, missing


def materialise(ds: Dataset) -> int:
    """Run the seven safe rules to a fixpoint into the inferred graph.

    Idempotent rebuild (DROP first), fixpoint loop guarded at 10 passes —
    the same shape as the loader. Returns the inferred-graph triple count.
    """
    inferred = ds.graph(URIRef(ENTAILMENT_GRAPH))
    ds.update(f"DROP SILENT GRAPH <{ENTAILMENT_GRAPH}>")
    for _pass in range(10):
        before = len(inferred)
        for rule in _SAFE_RULES:
            ds.update(_PFX + rule)
        if len(inferred) == before:
            break
    return len(inferred)


def _q_count(ds: Dataset, where: str) -> int:
    """COUNT(*) over the dataset for a WHERE body (prefixes prepended)."""
    rows = list(ds.query(_PFX + "SELECT (COUNT(*) AS ?c) WHERE { " + where + " }"))
    return int(rows[0][0]) if rows else 0


def run(ontology_dir: Path) -> list[str]:
    """Run the ADR-0035 §Confirmation inference-closure checks.

    Returns a flat list of violation strings (empty == PASS). The five
    confirmation clauses, in order:

      1. inferred graph non-empty;
      2. subclass type-propagation present; inverse-both-directions and
         transitive-chain guards (conditional on the construct existing in
         the asserted model — see module docstring);
      3. NO `owl:sameAs` anywhere;
      3b. NO spurious `opda:EPCCertificate rdf:type opda:Property`
          (the ODR-0025 §R7 regression guard);
      4. the disjointness consistency check is satisfiable (0 violations).
    """
    ds, missing = _load_asserted(ontology_dir)
    if missing:
        return missing

    inferred_count = materialise(ds)
    violations: list[str] = []
    inf = f"GRAPH <{ENTAILMENT_GRAPH}>"

    # --- Clause 1: inferred graph non-empty ---
    if inferred_count == 0:
        violations.append(
            "inferred graph is empty — the OWL-RL-safe closure produced no "
            "triples (expected at least subclass type-propagation from the "
            "exemplar ABox)"
        )

    # --- Clause 2a: subclass type-propagation present (positive) ---
    # A subclassed instance must gain its parent type in the inferred graph:
    #   ?v a ?sub (asserted) . ?sub rdfs:subClassOf ?super  ⊢  ?v a ?super
    propagated = _q_count(
        ds,
        f"{inf} {{ ?v rdf:type ?super }} "
        "GRAPH ?ga { ?v rdf:type ?sub } GRAPH ?gb { ?sub rdfs:subClassOf ?super } "
        "FILTER(?sub != ?super)",
    )
    if propagated == 0:
        violations.append(
            "no rdfs:subClassOf type-propagation materialised — rule 4 "
            "should type every subclassed instance with its parent class"
        )

    # --- Clause 2b: owl:inverseOf both directions (conditional guard) ---
    # If any inverse pair is asserted AND used, both directions must close.
    inverse_used = _q_count(
        ds,
        "GRAPH ?ga { ?p owl:inverseOf ?q } GRAPH ?gb { ?x ?p ?y }",
    )
    if inverse_used > 0:
        missing_inverse = _q_count(
            ds,
            "GRAPH ?ga { ?p owl:inverseOf ?q } GRAPH ?gb { ?x ?p ?y } "
            f"FILTER NOT EXISTS {{ {inf} {{ ?y ?q ?x }} }} "
            "FILTER NOT EXISTS { GRAPH ?gc { ?y ?q ?x } }",
        )
        if missing_inverse > 0:
            violations.append(
                f"{missing_inverse} owl:inverseOf usage(s) did not "
                "materialise the inverse direction"
            )

    # --- Clause 2c: owl:TransitiveProperty chain closes (conditional guard) ---
    transitive_chains = _q_count(
        ds,
        "GRAPH ?ga { ?p a owl:TransitiveProperty } "
        "GRAPH ?gb { ?x ?p ?y } GRAPH ?gc { ?y ?p ?z } FILTER(?x != ?z)",
    )
    if transitive_chains > 0:
        unclosed = _q_count(
            ds,
            "GRAPH ?ga { ?p a owl:TransitiveProperty } "
            "GRAPH ?gb { ?x ?p ?y } GRAPH ?gc { ?y ?p ?z } FILTER(?x != ?z) "
            f"FILTER NOT EXISTS {{ {inf} {{ ?x ?p ?z }} }} "
            "FILTER NOT EXISTS { GRAPH ?gd { ?x ?p ?z } }",
        )
        if unclosed > 0:
            violations.append(
                f"{unclosed} owl:TransitiveProperty chain(s) did not close"
            )

    # --- Clause 3: NO owl:sameAs anywhere (R2 exclusion) ---
    sameas = _q_count(ds, "GRAPH ?g { ?s owl:sameAs ?o }")
    if sameas > 0:
        violations.append(
            f"R2 violation: {sameas} owl:sameAs triple(s) present — the safe "
            "closure must never entail owl:sameAs (ODR-0025 §R2)"
        )

    # --- Clause 3b: NO spurious EPCCertificate a Property (R7 regression) ---
    epc = _q_count(
        ds,
        f"{inf} {{ <https://w3id.org/opda/#EPCCertificate> "
        f"rdf:type <https://w3id.org/opda/#Property> }}",
    )
    if epc > 0:
        violations.append(
            "R7 regression: opda:EPCCertificate was typed opda:Property in "
            "the inferred graph — domain/range entailment must stay excluded "
            "(ODR-0025 §R2/§R7)"
        )

    # --- Clause 4: disjointness consistency satisfiable ---
    # Validation-not-materialisation: any instance of two owl:disjointWith
    # classes is a consistency failure (the loader's post-load gate).
    disjoint = _q_count(
        ds,
        "GRAPH ?g1 { ?c1 owl:disjointWith ?c2 } "
        "GRAPH ?g2 { ?x rdf:type ?c1 } GRAPH ?g3 { ?x rdf:type ?c2 } "
        "FILTER(?c1 != ?c2)",
    )
    if disjoint > 0:
        violations.append(
            f"consistency: {disjoint} owl:disjointWith violation(s) — an "
            "instance holds two disjoint types"
        )

    return violations
