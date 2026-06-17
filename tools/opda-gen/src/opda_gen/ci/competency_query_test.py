"""
Module competency_query_test.

Realises:
- ADR-0048 work-item 4 limb (c) + ODR-0032 §R1 (Council session-047 Q2) — the
  **per-edge worked competency query** discipline: the ODR-0022 §G3
  coverage-by-test bar carried from the descriptive layer to the relationship
  layer. A GATED object property is not merely *asserted*; it must be
  *retrievable* — a worked SPARQL SELECT that traverses the edge against the
  committed exemplar ABox MUST return a non-empty result. An emitted GATED edge
  with an empty worked query is a violation (limb (c)).

This is the relationship-layer analogue of how `inference_closure_test` runs
the closure rules in-process over the TBox + exemplar ABox: same loading idiom
(rdflib, no Docker/Fuseki), one worked query per construct the model actually
exercises, and an HONEST coverage note for the edges the corpus does not yet
exercise.

Honest scope (Council session-047 Q2, recorded — never a silent skip)
=====================================================================
The Council deferred EXACTLY the chain pair (`dependsOnTransaction`/
`chainMembers`) to the residue register: they are GATED-in-principle but have
no ratified worked-query acceptance yet (ODR-0007 comment-ware). Every other
GATED edge gates on its retrieving query. This module therefore:

  - runs a worked SELECT for each GATED edge that has a WORKED_QUERY entry;
  - routes any DEFERRED predicate (per the residue register) AWAY from the
    competency check — it is reported as deferred (logged via the returned
    `CompetencyResult.deferred`), NOT failed on an empty result;
  - for a GATED edge that has NEITHER a worked query NOR a residue disposition,
    reports it as UNCOVERED-BY-QUERY (limb (c) violation) — the gate refuses to
    pass an edge it cannot retrieve, and refuses to silently skip one.

So the coverage reported to the operator is honest: covered-by-query vs
deferred-to-register vs uncovered, each enumerated by name.

Boundary: test/CI infrastructure only. Loads the TBox + the combined exemplar
ABox (every `exemplars/*.ttl` except the `*-expected-report.ttl` SHACL reports)
and runs read-only SPARQL. Mints nothing, emits nothing.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph

from opda_gen.inputs.object_property_residue import deferred_predicates


_PFX = "PREFIX opda: <https://opda.org.uk/pdtf/>\n"


# The ODR-0032 §R2 relationship inventory — the inter-entity object-property
# associations the competency-query bar (limb (c)) governs. Council session-047
# scoped limb (c) to "any GATED **§R2** association", NOT every owl:ObjectProperty
# in the corpus: the descriptive/monetary object properties minted by the
# Category-G walk (e.g. opda:builtForm ranging over a SKOS scheme, opda:rent
# over opda:MonetaryAmount) are value-slots dressed as object properties — they
# are NOT inter-entity relationships and were never put under the competency
# bar (ODR-0032 §R1 "source containment of a −I quality/mode … is a
# datatype/value path on the container"). Limbs (a) rangeless-AND-shapeless and
# (b) not-universally-true-domain DO apply corpus-wide; only limb (c) is scoped
# to this set. Keyed on local name; both directions of an edge are listed where
# the inventory names an inverse.
R2_GATED_INVENTORY: frozenset[str] = frozenset(
    {
        "founds",
        "foundedBy",
        "mediates",
        "playedBy",
        "plays",
        "hasRegisteredTitle",
        "hasParticipant",
        "concernsProperty",
        "hasEvidencedAuthority",
        "hasAddress",
        # The chain pair is in §R2 but DEFERRED (residue register) — listed so
        # it is recognised as §R2, then routed to the register by
        # `deferred_predicates()` rather than gated on.
        "dependsOnTransaction",
        "chainMembers",
    }
)


# Worked SPARQL SELECT per GATED edge — one query that TRAVERSES the edge and
# returns a binding when the edge is present in the exemplar ABox (ODR-0022 §G3
# coverage-by-test). Keyed on the predicate local name. A query returning ≥1
# row == the edge is retrievable (covered). Empty == limb (c) violation.
#
# Seeded for the GATED edges of the ODR-0032 §R2 inventory (Council
# session-047 GATED bucket). Each query is the minimal traversal that a
# consumer answering the edge's competency question would run:
#   - hasEvidencedAuthority: "which Sellers have an evidenced authority Claim?"
#   - mediates: "which Proprietorship relators mediate which Proprietor roles?"
#   - founds: "which Relators found which Roles?"
#   - playedBy: "which Roles are played by which bearer (Person/Organisation)?"
#   - hasParticipant: "who are the participants of a Transaction?"
#   - concernsProperty: "which Property does a Transaction concern?"
#   - hasRegisteredTitle: "which RegisteredTitle does a Proprietorship bind?"
#
# The chain pair (dependsOnTransaction / chainMembers) is DEFERRED in the
# residue register and so is deliberately NOT listed here — `deferred_predicates`
# routes it to the register rather than this check.
WORKED_QUERIES: dict[str, str] = {
    "hasEvidencedAuthority": _PFX
    + "SELECT ?s ?o WHERE { ?s a opda:Seller ; opda:hasEvidencedAuthority ?o . }",
    "mediates": _PFX
    + "SELECT ?s ?o WHERE { ?s a opda:Proprietorship ; opda:mediates ?o . }",
    "founds": _PFX + "SELECT ?s ?o WHERE { ?s opda:founds ?o . }",
    "foundedBy": _PFX + "SELECT ?s ?o WHERE { ?s opda:foundedBy ?o . }",
    "playedBy": _PFX + "SELECT ?s ?o WHERE { ?s opda:playedBy ?o . }",
    "plays": _PFX + "SELECT ?s ?o WHERE { ?s opda:plays ?o . }",
    "hasParticipant": _PFX
    + "SELECT ?s ?o WHERE { ?s a opda:Transaction ; opda:hasParticipant ?o . }",
    "concernsProperty": _PFX
    + "SELECT ?s ?o WHERE { ?s a opda:Transaction ; opda:concernsProperty ?o . }",
    "hasRegisteredTitle": _PFX
    + "SELECT ?s ?o WHERE { ?s a opda:Proprietorship ; opda:hasRegisteredTitle ?o . }",
    "hasAddress": _PFX + "SELECT ?s ?o WHERE { ?s opda:hasAddress ?o . }",
}


@dataclass
class CompetencyResult:
    """Honest per-edge competency-query coverage over the GATED set.

    `uncovered` is the limb (c) violation set (GATED, has-or-needs a query, but
    the worked query returned empty OR no query is defined and it is not
    deferred). `covered` / `deferred` are enumerated for the operator so nothing
    is a silent skip."""

    available: bool = True
    # GATED edge -> the query returned ≥1 row (retrievable).
    covered: set[str] = field(default_factory=set)
    # GATED edge -> the inverse predicate it is covered VIA (local name). An
    # edge declared owl:inverseOf a covered edge is itself exercised by that
    # SAME data — the relation is in the graph, the query just traverses it the
    # other way (team-lead ruling on opda:plays). Recorded explicitly so the
    # coverage is honest/visible, NOT hidden, and so no exemplar is denormalised
    # with a redundant explicit assertion of the inverse direction.
    covered_via_inverse: dict[str, str] = field(default_factory=dict)
    # GATED-in-principle edge routed to the residue register (DEFERRED) — NOT a
    # violation; reported so the deferral is visible (never a silent skip).
    deferred: set[str] = field(default_factory=set)
    # GATED edge -> why its competency query did not pass (the limb (c) gate).
    uncovered: dict[str, str] = field(default_factory=dict)


def _exemplar_ttls(ontology_dir: Path) -> list[Path]:
    """The exemplar ABox files — every `exemplars/*.ttl` EXCEPT the
    `*-expected-report.ttl` SHACL validation reports (those are validation
    output, not ABox)."""
    exemplar_dir = ontology_dir / "exemplars"
    if not exemplar_dir.is_dir():
        return []
    return sorted(
        p
        for p in exemplar_dir.glob("*.ttl")
        if p.is_file() and not p.name.endswith("-expected-report.ttl")
    )


def _inverse_pairs(graph: Graph) -> dict[str, str]:
    """The opda: `owl:inverseOf` pairs from the (TBox-bearing) graph, as a
    symmetric local-name -> local-name map. An edge declared owl:inverseOf a
    covered edge is covered-via-inverse (team-lead ruling): the relation is in
    the graph; the inverse query traverses it the other way — no separate ABox
    assertion required."""
    from rdflib import URIRef
    from rdflib.namespace import OWL

    opda_ns = "https://opda.org.uk/pdtf/"
    out: dict[str, str] = {}
    for s, o in graph.subject_objects(OWL.inverseOf):
        if (
            isinstance(s, URIRef)
            and isinstance(o, URIRef)
            and str(s).startswith(opda_ns)
            and str(o).startswith(opda_ns)
        ):
            sl, ol = str(s)[len(opda_ns):], str(o)[len(opda_ns):]
            out[sl] = ol
            out[ol] = sl  # symmetric — declared both directions, but be robust
    return out


def _load_combined_graph(ontology_dir: Path) -> Graph | None:
    """Load the TBox module class TTLs + the combined exemplar ABox into one
    rdflib graph for the worked queries (mirrors inference_closure_test's
    TBox+ABox load). Returns None when no exemplars are present (the caller
    skips the competency limb rather than false-failing every edge)."""
    exemplars = _exemplar_ttls(ontology_dir)
    if not exemplars:
        return None
    graph = Graph()
    # TBox (class declarations) — so `?s a opda:Seller` etc. resolve. Same
    # enumeration the coverage gate's class-graph limb uses.
    for ttl in sorted(ontology_dir.glob("*.ttl")):
        if ttl.is_file() and not ttl.name.endswith("-annotations.ttl"):
            graph.parse(str(ttl), format="turtle")
    for ttl in exemplars:
        graph.parse(str(ttl), format="turtle")
    return graph


def run_competency(ontology_dir: Path, gated: set[str]) -> CompetencyResult:
    """Run the worked competency query for every GATED **§R2** edge, honestly
    partitioning into covered / deferred / uncovered.

    `gated` is the set of GATED edge local names the coverage gate detected
    (type-pinned in OWL or SHACL). The competency bar (limb (c)) is scoped to
    the §R2 relationship inventory — a GATED object property OUTSIDE §R2 (a
    descriptive value-slot edge like opda:builtForm) is NOT subject to it
    (Council session-047). For each GATED §R2 edge:
      - if it is DEFERRED in the residue register → `deferred` (logged, not
        failed);
      - elif a worked query exists and returns ≥1 row → `covered`;
      - elif it is owl:inverseOf an edge covered above → `covered_via_inverse`
        (the relation is in the graph; the inverse query traverses it the other
        way — team-lead ruling on opda:plays; NO separate ABox assertion);
      - elif a worked query exists and returns 0 rows → `uncovered` (limb (c));
      - else (no worked query, not deferred) → `uncovered` (the gate refuses to
        pass a §R2 edge it cannot retrieve and refuses to silently skip it).
    """
    deferred = deferred_predicates()
    graph = _load_combined_graph(ontology_dir)
    if graph is None:
        return CompetencyResult(available=False)

    inverse_of = _inverse_pairs(graph)
    result = CompetencyResult()
    in_scope = sorted(gated & R2_GATED_INVENTORY)

    # Pass 1 — run each worked query; collect covered + the empties (deferring
    # the uncovered/inverse decision to pass 2, which needs the full covered set).
    empties: dict[str, str] = {}
    for name in in_scope:
        if name in deferred:
            result.deferred.add(name)
            continue
        query = WORKED_QUERIES.get(name)
        if query is None:
            empties[name] = (
                "no worked competency query defined and not deferred in the "
                "residue register — add a WORKED_QUERIES entry or a residue "
                "disposition"
            )
            continue
        if list(graph.query(query)):
            result.covered.add(name)
        else:
            empties[name] = (
                "worked competency query returned no rows against the combined "
                "exemplar ABox — the edge is asserted in the TBox but no "
                "exemplar traverses it (check for a legacy/orphan predicate in "
                "the exemplar ABox, e.g. opda:rolePlayer vs opda:playedBy; the "
                "exemplar must use the ratified predicate to be retrievable)"
            )

    # Pass 2 — an empty edge that is owl:inverseOf a covered edge is
    # covered-via-inverse (team-lead ruling), NOT a violation. The inverse
    # partner's data exercises this edge; requiring a separate assertion would
    # denormalise the exemplar. Anything still empty is a real limb-(c) gap.
    for name, reason in empties.items():
        partner = inverse_of.get(name)
        if partner is not None and partner in result.covered:
            result.covered_via_inverse[name] = partner
        else:
            result.uncovered[name] = reason
    return result


def competency_empty_gated(ontology_dir: Path, gated: set[str]) -> dict[str, str]:
    """Limb (c) adapter for the coverage gate: the GATED edges whose worked
    query did NOT pass (the violation set), as {local -> reason}. Returns {}
    when the competency limb could not run (no exemplars) — the coverage gate
    then reports the other three limbs only, and the competency coverage shows
    as unavailable via `run_competency` when invoked directly by the CLI."""
    return dict(run_competency(ontology_dir, gated).uncovered)
