"""
Tests for the relationship-layer object-property coverage gate (ADR-0048
work-item 4, AS AMENDED by Council session-047).

Realises:
- ADR-0048 §4 + ODR-0032 §Confirmation — the gate FAILs on (a) a
  rangeless-AND-shapeless object property; (b) a not-universally-true
  rdfs:domain on a subject-bearer predicate; (c) a GATED §R2 edge with no
  passing worked competency query; (d) a malformed residue-register entry.

The pure `build_report` logic + the SHACL-pin detection are asserted
unconditionally on hand-built rdflib graphs (no corpus needed) — INCLUDING the
positive controls the brief requires: a rangeless-AND-shapeless property MUST
violate; a rangeless-but-SHACL-pinned property MUST pass. The integration test
over the committed corpus skips when the module TTLs are absent.
"""

from __future__ import annotations

from rdflib import BNode, Graph, Literal, Namespace
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.ci.competency_query_test import (
    R2_GATED_INVENTORY,
    WORKED_QUERIES,
    CompetencyResult,
    competency_empty_gated,
    run_competency,
)
from opda_gen.ci.object_property_coverage_test import (
    ObjectPropertyFacts,
    ShapeFacts,
    build_report,
    extract_object_property_facts,
    extract_shape_facts,
    modules_with_convention_note,
    run,
)
from opda_gen.inputs.object_property_residue import (
    RESIDUE_REGISTER,
    Disposition,
    ResidueEntry,
    deferred_predicates,
    malformed_entries,
    reference_predicates,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# ---------------------------------------------------------------------------
# build_report — limb (a): rangeless-AND-shapeless (the POSITIVE CONTROLS)
# ---------------------------------------------------------------------------
def test_rangeless_and_shapeless_is_a_violation() -> None:
    """POSITIVE CONTROL (brief): a rangeless-AND-shapeless owl:ObjectProperty
    MUST produce a violation (the real founds/mediates defect)."""
    ops = {"badEdge": ObjectPropertyFacts("badEdge", has_range=False)}
    report = build_report(ops, ShapeFacts(shacl_pinned=frozenset()), residue={})
    assert report.rangeless_shapeless == {"badEdge"}
    assert not report.is_complete
    assert any("rangeless AND shapeless" in v for v in report.violations)


def test_rangeless_but_shacl_pinned_passes() -> None:
    """POSITIVE CONTROL (brief): a rangeless-but-SHACL-pinned property MUST pass
    via the SHACL limb (founds/mediates preserve "never reasoned")."""
    ops = {"mediates": ObjectPropertyFacts("mediates", has_range=False)}
    report = build_report(
        ops, ShapeFacts(shacl_pinned=frozenset({"mediates"})), residue={}
    )
    assert report.rangeless_shapeless == set()
    assert report.gated == {"mediates": "shacl"}
    assert report.is_complete


def test_range_pinned_passes_via_owl_limb() -> None:
    """An object property with rdfs:range passes via the OWL type-pin limb."""
    ops = {"concernsProperty": ObjectPropertyFacts("concernsProperty", has_range=True)}
    report = build_report(ops, ShapeFacts(), residue={})
    assert report.gated == {"concernsProperty": "owl"}
    assert report.is_complete


# ---------------------------------------------------------------------------
# build_report — limb (b): INVERTED (Council session-050; ODR-0032 §Confirmation)
# documentary "any-of" multi-domain/range is REQUIRED, with a SHACL sh:or dual
# + the module convention note; FP/IFP are excluded.
# ---------------------------------------------------------------------------
def test_disjunction_predicate_without_sh_or_dual_is_a_violation() -> None:
    """A documentary "any-of" disjunction predicate (multi-domain, e.g. the
    bearer-extended hasAddress) WITHOUT a matching SHACL sh:or value-type dual is
    a limb-(b) violation — the dual is now REQUIRED (the inversion)."""
    ops = {
        "hasAddress": ObjectPropertyFacts(
            "hasAddress",
            has_range=True,
            domain_classes=frozenset({"Property", "Person", "Organisation"}),
        )
    }
    # SHACL-pinned on the range (limb a passes) but NO sh:or disjunction dual.
    report = build_report(
        ops, ShapeFacts(shacl_pinned=frozenset({"hasAddress"})), residue={}
    )
    assert "hasAddress" in report.disjunction_without_sh_or
    assert not report.is_complete
    assert any("NO matching SHACL sh:or" in v for v in report.violations)


def test_disjunction_predicate_with_sh_or_dual_passes() -> None:
    """A documentary "any-of" disjunction predicate (multi-range founds /
    multi-domain hasAddress) WITH its SHACL sh:or dual + the convention note
    PASSES — multi-domain/range is required, not forbidden (the inversion)."""
    ops = {
        "founds": ObjectPropertyFacts(
            "founds",
            has_range=True,
            range_classes=frozenset({"Role", "RoleMixin"}),
        ),
        "hasAddress": ObjectPropertyFacts(
            "hasAddress",
            has_range=True,
            domain_classes=frozenset({"Property", "Person", "Organisation"}),
        ),
    }
    shapes = ShapeFacts(
        shacl_pinned=frozenset({"founds", "hasAddress"}),
        sh_or_dual=frozenset({"founds", "hasAddress"}),
    )
    report = build_report(ops, shapes, residue={}, convention_note_present=True)
    assert report.disjunction_without_sh_or == {}
    assert report.disjunction_without_convention == {}
    assert report.is_complete


def test_disjunction_predicate_without_convention_note_is_a_violation() -> None:
    """A disjunction predicate present while the module-header "any-of"
    convention note is ABSENT is a limb-(b) violation (the CI-gated MUST,
    Council session-050 Q1)."""
    ops = {
        "founds": ObjectPropertyFacts(
            "founds", has_range=True, range_classes=frozenset({"Role", "RoleMixin"})
        )
    }
    shapes = ShapeFacts(
        shacl_pinned=frozenset({"founds"}), sh_or_dual=frozenset({"founds"})
    )
    report = build_report(
        ops, shapes, residue={}, convention_note_present=False
    )
    assert "founds" in report.disjunction_without_convention
    assert not report.is_complete
    assert any("convention note is absent" in v for v in report.violations)


def test_single_domain_predicate_is_not_a_disjunction() -> None:
    """A single-domain / single-range edge (mediates, concernsProperty) is NOT a
    disjunction predicate: it carries a plain rdfs:domain/rdfs:range and needs no
    sh:or dual (the auto-derived single sh:class shape is its dual)."""
    ops = {
        "mediates": ObjectPropertyFacts(
            "mediates",
            has_range=True,
            domain_classes=frozenset({"Proprietorship"}),
            range_classes=frozenset({"Proprietor"}),
        ),
    }
    report = build_report(ops, ShapeFacts(), residue={})
    assert report.disjunction_without_sh_or == {}
    assert report.is_complete


def test_functional_property_is_excluded_construct_violation() -> None:
    """An object property authored owl:FunctionalProperty / IFP is a limb-(b)
    violation (the ADR-0049 FP/IFP carve-out)."""
    ops = {
        "hasUPRN": ObjectPropertyFacts(
            "hasUPRN",
            has_range=True,
            excluded_constructs=frozenset({"InverseFunctionalProperty"}),
        )
    }
    report = build_report(ops, ShapeFacts(), residue={})
    assert report.excluded_construct == {"hasUPRN": "InverseFunctionalProperty"}
    assert not report.is_complete
    assert any("FP/IFP are excluded" in v for v in report.violations)


# ---------------------------------------------------------------------------
# build_report — limb (d): malformed residue + bucket partition
# ---------------------------------------------------------------------------
def test_malformed_residue_entry_is_a_violation() -> None:
    """A residue entry with an empty/"TODO" disposition is a violation —
    collapse-by-silence is never available (limb d)."""
    bad = {"foo": ResidueEntry(Disposition.DEFERRED, "   ")}
    report = build_report({}, ShapeFacts(), residue=bad)
    assert "foo" in report.malformed_residue
    assert not report.is_complete
    assert any('empty/"TODO"' in v for v in report.violations)


def test_residue_buckets_partition_by_disposition() -> None:
    """The register partitions into value_slot / residue_pending / deferred /
    reference buckets by disposition, each accounted-for (never silent)."""
    register = {
        "hasName": ResidueEntry(Disposition.VALUE_SLOT, "−I endpoint"),
        "Address": ResidueEntry(
            Disposition.PENDING_UPSTREAM_IC, "pending", blocking_record="ODR-0015"
        ),
        "chainMembers": ResidueEntry(Disposition.DEFERRED, "no exemplar"),
        "baselineCategory": ResidueEntry(Disposition.REFERENCE, "external IRI"),
    }
    report = build_report({}, ShapeFacts(), residue=register)
    assert report.value_slot == {"hasName": "−I endpoint"}
    assert report.residue_pending == {"Address": "pending"}
    assert report.deferred == {"chainMembers": "no exemplar"}
    assert report.reference == {"baselineCategory": "external IRI"}
    assert report.malformed_residue == {}
    assert report.is_complete


def test_reference_disposition_excuses_rangeless_shapeless() -> None:
    """A REFERENCE-registered predicate (external co-domain cited
    reference-not-import) is rangeless by design and excused from limb (a) —
    accounted-for in the reference bucket, never silently excused."""
    ops = {"baselineCategory": ObjectPropertyFacts("baselineCategory", has_range=False)}
    register = {
        "baselineCategory": ResidueEntry(Disposition.REFERENCE, "DPV not imported")
    }
    report = build_report(ops, ShapeFacts(), residue=register)
    assert report.rangeless_shapeless == set()
    assert report.reference == {"baselineCategory": "DPV not imported"}
    assert report.is_complete


def test_malformed_reference_is_not_excused() -> None:
    """A REFERENCE entry that is itself malformed (empty reason) is a limb-(d)
    violation AND does NOT excuse its predicate from limb (a) — it must be
    fixed, not silently passed."""
    ops = {"baselineCategory": ObjectPropertyFacts("baselineCategory", has_range=False)}
    register = {"baselineCategory": ResidueEntry(Disposition.REFERENCE, "TODO")}
    report = build_report(ops, ShapeFacts(), residue=register)
    assert "baselineCategory" in report.malformed_residue
    assert "baselineCategory" in report.rangeless_shapeless
    assert not report.is_complete


# ---------------------------------------------------------------------------
# build_report — limb (c): competency-empty merged in
# ---------------------------------------------------------------------------
def test_competency_empty_is_a_violation() -> None:
    """A GATED edge whose worked competency query returned empty is a limb-(c)
    violation when merged into the report."""
    ops = {"hasParticipant": ObjectPropertyFacts("hasParticipant", has_range=True)}
    report = build_report(
        ops,
        ShapeFacts(),
        residue={},
        competency_empty={"hasParticipant": "no rows"},
    )
    assert "hasParticipant" in report.competency_empty
    assert not report.is_complete
    assert any("worked SPARQL" in v for v in report.violations)


def test_competency_none_means_limb_did_not_run() -> None:
    """competency_empty=None (limb did not run, e.g. exemplars absent) leaves
    the competency limb empty — the other three limbs still apply."""
    ops = {"concernsProperty": ObjectPropertyFacts("concernsProperty", has_range=True)}
    report = build_report(ops, ShapeFacts(), residue={}, competency_empty=None)
    assert report.competency_empty == {}
    assert report.is_complete


# ---------------------------------------------------------------------------
# extract_shape_facts — the SHACL type-pin detection (BOTH patterns)
# ---------------------------------------------------------------------------
def test_shacl_pin_via_target_objects_of() -> None:
    """Pattern 1: sh:targetObjectsOf <pred> + sh:class on the same shape (the
    founds RangeShape form)."""
    g = Graph()
    shape = OPDA["shape/FoundsRangeShape"]
    g.add((shape, RDF.type, SH.NodeShape))
    g.add((shape, SH.targetObjectsOf, OPDA.founds))
    g.add((shape, SH["class"], OPDA.Role))
    facts = extract_shape_facts(g)
    assert "founds" in facts.shacl_pinned


def test_shacl_pin_via_nested_property_shape_sh_class() -> None:
    """Pattern 2: a property shape sh:path <pred> + sh:class (the mediates
    ProprietorshipMediationShape form)."""
    g = Graph()
    ps = BNode()
    g.add((ps, SH.path, OPDA.mediates))
    g.add((ps, SH["class"], OPDA.Proprietor))
    facts = extract_shape_facts(g)
    assert "mediates" in facts.shacl_pinned


def test_shacl_pin_via_sh_or_disjunction() -> None:
    """Pattern 2 variant: a property shape sh:path <pred> whose value-type pin
    is an sh:or member list (the playedBy Person∪Organisation bearer
    disjunction) — detection follows the rdf:List into the sh:class members."""
    g = Graph()
    ps = BNode()
    g.add((ps, SH.path, OPDA.playedBy))
    # sh:or ( [sh:class Person] [sh:class Organisation] )
    person_member = BNode()
    org_member = BNode()
    g.add((person_member, SH["class"], OPDA.Person))
    g.add((org_member, SH["class"], OPDA.Organisation))
    or_list = BNode()
    tail = BNode()
    g.add((or_list, RDF.first, person_member))
    g.add((or_list, RDF.rest, tail))
    g.add((tail, RDF.first, org_member))
    g.add((tail, RDF.rest, RDF.nil))
    g.add((ps, SH["or"], or_list))
    facts = extract_shape_facts(g)
    assert "playedBy" in facts.shacl_pinned


def test_sh_or_dual_via_target_objects_of() -> None:
    """sh_or_dual: an object-targeting node shape (FoundsRangeShape /
    HasParticipantRangeShape) carrying sh:or [sh:class Role][sh:class RoleMixin]
    is the authoritative disjunction dual."""
    g = Graph()
    shape = OPDA["shape/FoundsRangeShape"]
    g.add((shape, RDF.type, SH.NodeShape))
    g.add((shape, SH.targetObjectsOf, OPDA.founds))
    m1, m2 = BNode(), BNode()
    g.add((m1, SH["class"], OPDA.Role))
    g.add((m2, SH["class"], OPDA.RoleMixin))
    lst, tail = BNode(), BNode()
    g.add((lst, RDF.first, m1))
    g.add((lst, RDF.rest, tail))
    g.add((tail, RDF.first, m2))
    g.add((tail, RDF.rest, RDF.nil))
    g.add((shape, SH["or"], lst))
    facts = extract_shape_facts(g)
    assert "founds" in facts.sh_or_dual


def test_sh_or_dual_via_target_subjects_of() -> None:
    """sh_or_dual: a SUBJECT-targeting node shape (HasAddressBearerShape /
    RolePlaySubjectShape) carrying a node-level sh:or is a disjunction dual — the
    subject-side bearer disjunction limb (b) accepts."""
    g = Graph()
    shape = OPDA["shape/HasAddressBearerShape"]
    g.add((shape, RDF.type, SH.NodeShape))
    g.add((shape, SH.targetSubjectsOf, OPDA.hasAddress))
    m1, m2 = BNode(), BNode()
    g.add((m1, SH["class"], OPDA.Property))
    g.add((m2, SH["class"], OPDA.Person))
    lst, tail = BNode(), BNode()
    g.add((lst, RDF.first, m1))
    g.add((lst, RDF.rest, tail))
    g.add((tail, RDF.first, m2))
    g.add((tail, RDF.rest, RDF.nil))
    g.add((shape, SH["or"], lst))
    facts = extract_shape_facts(g)
    assert "hasAddress" in facts.sh_or_dual


def test_modules_with_convention_note_present_and_absent() -> None:
    """modules_with_convention_note: True when an ontology header carries the
    any-of/documentary editorialNote; False when a header is present without
    it; True (vacuous) when no ontology node exists."""
    present = Graph()
    onto = OPDA["graph/agent"]
    present.add((onto, RDF.type, OWL.Ontology))
    present.add((onto, SKOS.editorialNote, Literal(
        "Documentary domain/range convention: … read as \"any-of\" …", lang="en"
    )))
    assert modules_with_convention_note(present) is True

    absent = Graph()
    absent.add((onto, RDF.type, OWL.Ontology))
    absent.add((onto, SKOS.editorialNote, Literal("some other note", lang="en")))
    assert modules_with_convention_note(absent) is False

    assert modules_with_convention_note(Graph()) is True  # vacuous


def test_vacuous_retraversal_is_not_pinned() -> None:
    """GUARD (Council session-047 as-built): a node shape whose focus is
    sh:targetObjectsOf <pred> that nests sh:property[sh:path <pred>] re-traverses
    <pred> FROM its own object (which has no outgoing <pred>) — vacuous, enforces
    nothing — so it MUST NOT count as a co-domain pin. This is the bug that hid
    rangeless `founds`/`plays` behind a syntactic pin before the fix."""
    g = Graph()
    shape = OPDA["shape/VacuousFoundsRangeShape"]
    ps = BNode()
    g.add((shape, RDF.type, SH.NodeShape))
    g.add((shape, SH.targetObjectsOf, OPDA.founds))
    g.add((shape, SH.property, ps))
    g.add((ps, SH.path, OPDA.founds))  # re-traverses founds from its own object
    g.add((ps, SH["class"], OPDA.Role))
    facts = extract_shape_facts(g)
    assert "founds" not in facts.shacl_pinned


def test_legit_property_pin_under_subject_focus_still_counts() -> None:
    """The guard must NOT reject a legitimate Pattern-2 pin: a subject/class-
    focused node (sh:targetClass Seller / sh:targetSubjectsOf playedBy) whose
    sh:property[sh:path playedBy] constrains the OBJECT (bearer) — focus is not
    the predicate's own objects, so it survives the vacuity guard."""
    g = Graph()
    shape = OPDA["shape/SellerShape"]
    ps = BNode()
    g.add((shape, RDF.type, SH.NodeShape))
    g.add((shape, SH.targetClass, OPDA.Seller))
    g.add((shape, SH.property, ps))
    g.add((ps, SH.path, OPDA.playedBy))
    g.add((ps, SH["class"], OPDA.Person))
    facts = extract_shape_facts(g)
    assert "playedBy" in facts.shacl_pinned


def test_shacl_path_without_value_type_is_not_pinned() -> None:
    """A property shape with sh:path but only sh:minCount (no sh:class/sh:node)
    is NOT a value-type pin — this is exactly the mediates defect session-047
    Q5 caught (ProprietorshipMediationShape had sh:minCount 2 but no
    sh:class)."""
    g = Graph()
    ps = BNode()
    g.add((ps, SH.path, OPDA.mediates))
    g.add((ps, SH.minCount, Literal(2)))
    facts = extract_shape_facts(g)
    assert "mediates" not in facts.shacl_pinned


# ---------------------------------------------------------------------------
# extract_object_property_facts — class-graph extraction
# ---------------------------------------------------------------------------
def test_extract_object_property_facts_range_and_domain() -> None:
    """Pull rdfs:range presence + rdfs:domain/range opda: locals + FP/IFP
    constructs from the class graph; non-opda: subjects ignored."""
    g = Graph()
    g.add((OPDA.concernsProperty, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.concernsProperty, RDFS.domain, OPDA.Transaction))
    g.add((OPDA.concernsProperty, RDFS.range, OPDA.Property))
    # founds: documentary any-of multi-range (the session-050 emission).
    g.add((OPDA.founds, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.founds, RDFS.domain, OPDA.Relator))
    g.add((OPDA.founds, RDFS.range, OPDA.Role))
    g.add((OPDA.founds, RDFS.range, OPDA.RoleMixin))
    facts = extract_object_property_facts(g)
    assert facts["concernsProperty"].has_range is True
    assert facts["concernsProperty"].domain_classes == frozenset({"Transaction"})
    assert facts["concernsProperty"].range_classes == frozenset({"Property"})
    assert facts["concernsProperty"].is_disjunction is False
    assert facts["founds"].has_range is True
    assert facts["founds"].domain_classes == frozenset({"Relator"})
    assert facts["founds"].range_classes == frozenset({"Role", "RoleMixin"})
    assert facts["founds"].is_disjunction is True  # multi-range any-of


def test_extract_object_property_facts_flags_fp_ifp() -> None:
    """An object property typed owl:InverseFunctionalProperty surfaces in
    excluded_constructs (the ADR-0049 carve-out check)."""
    g = Graph()
    g.add((OPDA.hasUPRN, RDF.type, OWL.ObjectProperty))
    g.add((OPDA.hasUPRN, RDF.type, OWL.InverseFunctionalProperty))
    facts = extract_object_property_facts(g)
    assert facts["hasUPRN"].excluded_constructs == frozenset(
        {"InverseFunctionalProperty"}
    )


# ---------------------------------------------------------------------------
# residue register integrity
# ---------------------------------------------------------------------------
def test_live_residue_register_is_well_formed() -> None:
    """Every entry in the shipped residue register carries a real disposition +
    non-empty, non-"TODO" reason (the register passes its own gate-check)."""
    assert malformed_entries() == {}


def test_live_residue_register_seeded_per_council() -> None:
    """The register is seeded with the Council session-047 dispositions: hasName
    VALUE-SLOT, Address PENDING-upstream-IC, chain pair DEFERRED."""
    assert RESIDUE_REGISTER["hasName"].disposition is Disposition.VALUE_SLOT
    assert (
        RESIDUE_REGISTER["Address"].disposition is Disposition.PENDING_UPSTREAM_IC
    )
    assert RESIDUE_REGISTER["Address"].blocking_record == "ODR-0015"
    assert deferred_predicates() == frozenset(
        {"dependsOnTransaction", "chainMembers"}
    )


def test_reference_predicates_helper() -> None:
    """reference_predicates() returns the REFERENCE-dispositioned locals
    (baselineCategory, the DPV reference-not-import predicate)."""
    assert "baselineCategory" in reference_predicates()


# ---------------------------------------------------------------------------
# competency-query limb — scoping + honest partition
# ---------------------------------------------------------------------------
def test_competency_limb_scoped_to_r2_inventory() -> None:
    """A GATED edge OUTSIDE the §R2 inventory (a descriptive value-slot edge
    like builtForm) is NOT subject to the competency bar — limb (c) covers only
    §R2 relationship associations (Council session-047)."""
    assert "builtForm" not in R2_GATED_INVENTORY
    assert "founds" in R2_GATED_INVENTORY
    # every worked-query key is an §R2 edge.
    assert set(WORKED_QUERIES).issubset(R2_GATED_INVENTORY)


def test_competency_unavailable_without_exemplars(tmp_path) -> None:
    """No exemplars/ dir → competency limb reports available=False (the caller
    reports the other limbs, never false-fails every edge)."""
    result = run_competency(tmp_path, {"founds"})
    assert isinstance(result, CompetencyResult)
    assert result.available is False


def test_competency_deferred_edge_routed_to_register(tmp_path) -> None:
    """A DEFERRED §R2 edge (chainMembers) is routed to the register — reported
    as deferred, NOT failed on an empty query (never a silent skip)."""
    # Minimal exemplar dir so the limb runs (graph load succeeds).
    exemplars = tmp_path / "exemplars"
    exemplars.mkdir()
    (exemplars / "stub.ttl").write_text(
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "opda:t1 a opda:Transaction .\n",
        encoding="utf-8",
    )
    result = run_competency(tmp_path, {"chainMembers"})
    assert "chainMembers" in result.deferred
    assert "chainMembers" not in result.uncovered


def test_competency_gated_r2_edge_without_query_is_uncovered(tmp_path) -> None:
    """A GATED §R2 edge with neither a worked query nor a residue disposition is
    uncovered (the gate refuses to pass an edge it cannot retrieve and refuses
    to silently skip it). Synthesised by passing an §R2 name with no
    WORKED_QUERIES entry — none exists today, so we assert the live invariant
    instead: every non-deferred §R2 edge HAS a worked query."""
    non_deferred_r2 = R2_GATED_INVENTORY - deferred_predicates()
    assert non_deferred_r2.issubset(set(WORKED_QUERIES)), (
        "every non-deferred §R2 edge must have a worked competency query"
    )


def test_competency_inverse_of_covered_is_covered_via_inverse(tmp_path) -> None:
    """An edge declared owl:inverseOf a covered edge is covered-via-inverse, NOT
    uncovered (team-lead ruling on opda:plays): the relation is in the graph;
    the inverse query traverses it the other way — no separate ABox assertion
    required, no exemplar denormalisation. Only opda:playedBy is asserted in
    the ABox; opda:plays is covered via it."""
    (tmp_path / "opda-agent.ttl").write_text(
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n"
        "opda:playedBy a owl:ObjectProperty ; owl:inverseOf opda:plays .\n"
        "opda:plays a owl:ObjectProperty ; owl:inverseOf opda:playedBy .\n",
        encoding="utf-8",
    )
    exemplars = tmp_path / "exemplars"
    exemplars.mkdir()
    (exemplars / "x.ttl").write_text(
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "opda:role1 a opda:Seller ; opda:playedBy opda:person1 .\n",
        encoding="utf-8",
    )
    result = run_competency(tmp_path, {"playedBy", "plays"})
    assert "playedBy" in result.covered
    assert result.covered_via_inverse == {"plays": "playedBy"}
    assert "plays" not in result.uncovered  # NOT a violation
    # The limb-(c) violation set (what the gate fails on) excludes it.
    assert "plays" not in competency_empty_gated(tmp_path, {"playedBy", "plays"})


def test_competency_inverse_of_uncovered_is_still_uncovered(tmp_path) -> None:
    """An edge that is owl:inverseOf an UNCOVERED edge is NOT rescued — both are
    genuine gaps. covered-via-inverse only excuses an edge whose inverse partner
    is actually covered-by-query (no free pass)."""
    (tmp_path / "opda-agent.ttl").write_text(
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n"
        "opda:playedBy a owl:ObjectProperty ; owl:inverseOf opda:plays .\n"
        "opda:plays a owl:ObjectProperty ; owl:inverseOf opda:playedBy .\n",
        encoding="utf-8",
    )
    exemplars = tmp_path / "exemplars"
    exemplars.mkdir()
    # NEITHER playedBy NOR plays asserted in the ABox.
    (exemplars / "x.ttl").write_text(
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "opda:role1 a opda:Seller .\n",
        encoding="utf-8",
    )
    result = run_competency(tmp_path, {"playedBy", "plays"})
    assert result.covered == set()
    assert result.covered_via_inverse == {}
    assert "playedBy" in result.uncovered
    assert "plays" in result.uncovered


# ---------------------------------------------------------------------------
# integration over the committed corpus (skips gracefully when absent)
# ---------------------------------------------------------------------------
def test_run_on_committed_corpus_is_well_formed() -> None:
    """run() over the committed corpus returns a report whose residue register
    is well-formed and whose buckets are disjoint. Does NOT pin is_complete
    (that climbs to PASS only once the emitter's regeneration + exemplar
    facets land) — asserts the gate executes end-to-end and the register holds
    its own invariant."""
    from opda_gen.cli import _default_ontology_dir

    ontology_dir = _default_ontology_dir()
    if not list(ontology_dir.glob("*.ttl")):
        import pytest

        pytest.skip("committed ontology corpus absent")
    report = run(ontology_dir)
    assert report.available
    # The shipped register is well-formed (no limb-(d) violation from it).
    assert report.malformed_residue == {}
    # A GATED edge is never simultaneously rangeless-shapeless.
    assert not (set(report.gated) & report.rangeless_shapeless)
