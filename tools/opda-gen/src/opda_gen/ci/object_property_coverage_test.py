"""
Module object_property_coverage_test.

Realises:
- ADR-0048 work-item 4 (the gate, AS AMENDED by Council session-047) + the
  ODR-0032 §Confirmation gate rule — the relationship-layer completeness gate,
  the object-property analogue of how `ci-category-g-coverage` (ADR-0032) gates
  the descriptive datatype-leaf layer. The descriptive layer got a walk *and* a
  gate; this gate brings the relationship layer to parity.

The gate rule (Council session-047 Q2/Q5, implemented EXACTLY)
==============================================================
Every opda: `owl:ObjectProperty` MUST be a DECLARED predicate whose co-domain
is **type-pinned** by EITHER (a) `rdfs:range` OR (b) a SHACL value-type shape
(`sh:class`/`sh:node`, reached via `sh:targetObjectsOf <pred>` or a property
shape `sh:path <pred>` nested in a node shape). The gate FAILs on:

  (a) **rangeless-AND-shapeless** — an `owl:ObjectProperty` with no `rdfs:range`
      *and* no SHACL value-type pin. NOT rangeless per se: `founds`/`mediates`
      are intentionally rangeless-in-OWL but SHACL-pinned (preserving their
      "Design-time, NEVER reasoned" commitment, ODR-0029/0030/0031), so they
      MUST pass via the SHACL limb. This is the real defect the gate exists to
      catch (`mediates` was range-unpinned in BOTH graphs — session-047 Q5).
  (b) **not-universally-true `rdfs:domain`/`rdfs:range`** — a targeted check on
      the council-named multi-bearer predicates (`hasName`/`hasAddress`/
      `playedBy`/`hasParticipant`): they MUST carry NO single `rdfs:domain`
      (bearer-typing belongs in SHACL `sh:or`, else "every addressed Person is
      a Property" / "every name-bearing Organisation is a Person"). RDF Schema
      1.1 §2.3.1/2.3.2: `rdfs:domain`/`range` *infer* a type, they do NOT
      reject a mis-typed node — they MUST NOT be authored as validation.
  (c) a **GATED** §R2 association lacking **one worked SPARQL competency query**
      that traverses it (the ODR-0022 §G3 coverage-by-test discipline carried
      to the relationship layer) — see `competency_query_test`.
  (d) a **residue-register** entry (VALUE-SLOT / PENDING-upstream-IC / DEFERRED)
      with an empty / "TODO" disposition (collapse-by-silence is never
      available; ODR-0032 §R1).

Two-graph separation (ODR-0013 open/closed-world guard)
=======================================================
The **class-graph dead-edge check** (limbs a + the rangeless side) reads the
module class TTLs only. The **shapes-graph bearer check** (limb b's SHACL pin
read + the not-universally-true domain check) reads the `*-shapes.ttl` files.
They are kept SEPARATE — an object property declared in the class graph is
type-pinned EITHER by its own `rdfs:range` (class graph) OR by a shape in the
shapes graph; the two graphs are never conflated into one union for this check.

Boundary: test/CI infrastructure only. Reads object-property + shape facts via
rdflib from the emitted module TTLs and the residue register
(`inputs/object_property_residue`). Mints no IRIs, emits no TTL, re-pins no
byte-identity. The pure `build_report()` is unit-testable on hand-built rdflib
graphs without the live corpus (mirrors `build_coverage_report`).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS

from opda_gen.inputs.object_property_residue import (
    RESIDUE_REGISTER,
    Disposition,
    ResidueEntry,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# The council-named multi-bearer predicates whose BEARER IS THE SUBJECT, so a
# single `rdfs:domain` is not-universally-true and bearer-typing belongs in
# SHACL `sh:or` (Council session-047 Q5; ADR-0048 §4 limb (b)). The decisive
# anti-pattern (Hendler, session-047 Q5): "`rdfs:domain opda:Person` on a
# name/address predicate would entail every name/address-bearing Organisation
# is a Person — the everything-becomes-a-Person anti-pattern." That is a
# SUBJECT-side disjunction (the bearer is the subject of hasName/hasAddress).
#
# `playedBy`/`hasParticipant` are DELIBERATELY EXCLUDED: their bearer
# disjunction (Person∪Organisation / Seller∪Buyer) is on the OBJECT/range side
# (handled by SHACL `sh:or`), while their SUBJECT is single-typed and
# universally true — `playedBy`'s subject is always an opda:Role, and
# `hasParticipant`'s is always an opda:Transaction. A universally-true subject
# `rdfs:domain` on those is legitimate (§R1 "rdfs:domain asserted only where the
# subject-type entailment is universally true" — it IS for these two). Limb (b)
# fires only when the asserted subject `rdfs:domain` is NOT universally true,
# which is the case only for the subject-bearer predicates. Keyed on local name.
MULTI_BEARER_PREDICATES = frozenset({"hasName", "hasAddress"})


# ---------------------------------------------------------------------------
# Fact extraction — class graph (dead-edge) vs shapes graph (bearer), kept
# SEPARATE per ODR-0013. Each returns a plain dataclass of facts so the
# classification in build_report() is pure + unit-testable on synthetic input.
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class ObjectPropertyFacts:
    """Class-graph facts about one opda: `owl:ObjectProperty`.

    `has_range` is the OWL type-pin limb; `domain_classes` feeds the
    not-universally-true `rdfs:domain` check (limb b)."""

    local_name: str
    has_range: bool
    # opda: local names asserted as rdfs:domain (≥1 means a domain is asserted).
    domain_classes: frozenset[str] = frozenset()


@dataclass(frozen=True)
class ShapeFacts:
    """Shapes-graph facts: which predicates are type-pinned by a SHACL
    value-type shape (`sh:class`/`sh:node`), reached via either the
    `sh:targetObjectsOf <pred>` form OR a property shape `sh:path <pred>`
    nested under a node shape. Local names of the SHACL-pinned predicates."""

    shacl_pinned: frozenset[str] = frozenset()


def _module_class_ttls(ontology_dir: Path) -> list[Path]:
    """Top-level module class TTLs — the per-module term-declaration files
    (same enumeration `ci-category-g-coverage`/the dup gate use). Excludes
    `*-shapes.ttl` and `*-annotations.ttl` (the other two graphs) and the
    subdirectories (`profiles/`, `exemplars/`, `derived/`)."""
    return sorted(
        p
        for p in ontology_dir.glob("*.ttl")
        if p.is_file()
        and not p.name.endswith("-shapes.ttl")
        and not p.name.endswith("-annotations.ttl")
    )


def _module_shape_ttls(ontology_dir: Path) -> list[Path]:
    """The `*-shapes.ttl` module files — the shapes graph (ODR-0013), read
    SEPARATELY from the class graph for the SHACL type-pin + bearer checks."""
    return sorted(p for p in ontology_dir.glob("*-shapes.ttl") if p.is_file())


def extract_object_property_facts(class_graph: Graph) -> dict[str, ObjectPropertyFacts]:
    """Pull every opda: `owl:ObjectProperty` and its OWL type-pin facts from a
    class graph. The class-graph dead-edge limb (ODR-0013) — reads `rdfs:range`
    (the OWL type-pin) and `rdfs:domain` (the not-universally-true check); never
    consults the shapes graph."""
    opda_ns = str(OPDA)
    out: dict[str, ObjectPropertyFacts] = {}
    for subj in class_graph.subjects(RDF.type, OWL.ObjectProperty):
        if not (isinstance(subj, URIRef) and str(subj).startswith(opda_ns)):
            continue
        local = str(subj)[len(opda_ns):]
        has_range = (subj, RDFS.range, None) in class_graph
        domains = {
            str(o)[len(opda_ns):]
            for o in class_graph.objects(subj, RDFS.domain)
            if isinstance(o, URIRef) and str(o).startswith(opda_ns)
        }
        out[local] = ObjectPropertyFacts(
            local_name=local,
            has_range=has_range,
            domain_classes=frozenset(domains),
        )
    return out


def extract_shape_facts(shapes_graph: Graph) -> ShapeFacts:
    """Pull the set of predicates type-pinned by a SHACL value-type shape from
    a shapes graph. The shapes-graph limb (ODR-0013) — recognises BOTH SHACL
    targeting patterns so detection matches the emitter byte-for-byte:

    1. `?shape sh:targetObjectsOf <pred>` + the shape carries `sh:class`/
       `sh:node` (the auto RangeShape form / object-targeting node shape).
    2. a property shape `?ps sh:path <pred>` that (directly, or via an `sh:or`/
       `sh:and`/`sh:xone` list it heads) carries `sh:class`/`sh:node` — the
       nested-property-shape form (`founds`/`mediates`/`playedBy` bearer pin).

    Returns the opda: local names so the pin is matched against the
    object-property facts in build_report()."""
    opda_ns = str(OPDA)
    pinned: set[str] = set()

    def _pred_local(node: object) -> str | None:
        if isinstance(node, URIRef) and str(node).startswith(opda_ns):
            return str(node)[len(opda_ns):]
        return None

    def _carries_value_type(node: object) -> bool:
        """True iff `node` (a shape) directly carries a value-type pin
        (`sh:class`/`sh:node`) or carries one through an `sh:or`/`sh:and`/
        `sh:xone` member list (the Person∪Organisation `sh:or` disjunction)."""
        if (node, SH["class"], None) in shapes_graph:
            return True
        if (node, SH.node, None) in shapes_graph:
            return True
        for logic in (SH["or"], SH["and"], SH.xone):
            for lst in shapes_graph.objects(node, logic):
                for member in shapes_graph.items(lst):
                    if (member, SH["class"], None) in shapes_graph:
                        return True
                    if (member, SH.node, None) in shapes_graph:
                        return True
        return False

    # Pattern 1: sh:targetObjectsOf <pred> on a shape that pins a value type.
    for shape, pred in shapes_graph.subject_objects(SH.targetObjectsOf):
        local = _pred_local(pred)
        if local and _carries_value_type(shape):
            pinned.add(local)

    # Pattern 2: a property shape `sh:path <pred>` carrying a value-type pin
    # (the bnode reached from a node shape via sh:property — e.g. SellerShape
    # `sh:targetClass Seller` + `sh:property[sh:path playedBy; sh:or bearer]`, or
    # RolePlayShape `sh:targetSubjectsOf playedBy` + the same property: focus is a
    # class / the predicate's SUBJECTS, the path leads to the OBJECT, and the pin
    # constrains that object — valid).
    #
    # GUARD against the VACUOUS re-traversal anti-pattern (Council session-047
    # as-built — the bug that hid `founds`/`plays` behind a syntactic pin): a node
    # shape whose focus is `sh:targetObjectsOf <pred>` that then nests
    # `sh:property[sh:path <pred>]` re-traverses <pred> FROM its own object node
    # (which has no outgoing <pred>), so it enforces NOTHING yet presents a
    # `sh:path`+`sh:class` pin. Such a property shape MUST NOT count as a co-domain
    # pin — otherwise a rangeless-AND-effectively-shapeless edge false-passes the
    # gate. (The correct co-domain pin for the targetObjectsOf form is `sh:class`/
    # `sh:or` DIRECTLY on the node shape — Pattern 1.)
    for ps, pred in shapes_graph.subject_objects(SH.path):
        local = _pred_local(pred)
        if not (local and _carries_value_type(ps)):
            continue
        enclosing = set(shapes_graph.subjects(SH.property, ps))
        if any(
            (node, SH.targetObjectsOf, pred) in shapes_graph for node in enclosing
        ):
            continue  # vacuous: focus = <pred>'s objects, path re-traverses <pred>
        pinned.add(local)

    return ShapeFacts(shacl_pinned=frozenset(pinned))


# ---------------------------------------------------------------------------
# The report — buckets + the four violation limbs (a)-(d). Mirrors
# CoverageReport: a dataclass with .violations / .is_complete, built by a pure
# function so it is testable on synthetic facts.
# ---------------------------------------------------------------------------
@dataclass
class CoverageReport:
    """Relationship-layer coverage. `is_complete` (no violation on any of the
    four limbs) is the state in which `ci-object-property-coverage --strict`
    PASSES. Mirrors `category_g_coverage_test.CoverageReport`."""

    # False when the class TTLs are absent (mirrors the category-G skip path).
    available: bool = True

    # --- buckets (the honest disposition of every object property) ----------
    # GATED edges: type-pinned in OWL (rdfs:range) or SHACL (local -> "owl"/
    # "shacl"), the emitted relationship layer.
    gated: dict[str, str] = field(default_factory=dict)
    # residue-register dispositions, partitioned by kind (local -> reason).
    residue_pending: dict[str, str] = field(default_factory=dict)
    value_slot: dict[str, str] = field(default_factory=dict)
    deferred: dict[str, str] = field(default_factory=dict)
    # REFERENCE: external co-domain cited reference-not-import — rangeless by
    # design, excused from limb (a) (local -> reason).
    reference: dict[str, str] = field(default_factory=dict)

    # --- limb (a): rangeless-AND-shapeless object properties ----------------
    rangeless_shapeless: set[str] = field(default_factory=set)
    # --- limb (b): a multi-bearer predicate carrying a single rdfs:domain ---
    # local -> the offending domain class local name(s), joined.
    not_universally_true_domain: dict[str, str] = field(default_factory=dict)
    # --- limb (d): malformed residue entries (empty/"TODO") -----------------
    malformed_residue: dict[str, str] = field(default_factory=dict)
    # --- limb (c) is carried by competency_query_test and merged in via
    # `competency_empty` (GATED edge with an empty worked query). local -> note.
    competency_empty: dict[str, str] = field(default_factory=dict)

    @property
    def gated_count(self) -> int:
        return len(self.gated)

    @property
    def violations(self) -> list[str]:
        """The hard gate (under --strict): empty == every object property
        type-pinned (OWL or SHACL), no not-universally-true domain, the residue
        register well-formed, and every GATED edge competency-query-covered."""
        out: list[str] = []
        for name in sorted(self.rangeless_shapeless):
            out.append(
                f"opda:{name} is an owl:ObjectProperty that is rangeless AND "
                "shapeless (no rdfs:range and no SHACL sh:class/sh:node "
                "value-type pin) — ADR-0048 §4 limb (a)"
            )
        for name, dom in sorted(self.not_universally_true_domain.items()):
            out.append(
                f"opda:{name} carries a not-universally-true rdfs:domain "
                f"(opda:{dom}) — a multi-bearer predicate must push bearer-"
                "typing to SHACL sh:or, not rdfs:domain (ADR-0048 §4 limb (b))"
            )
        for name, reason in sorted(self.malformed_residue.items()):
            out.append(
                f"residue-register entry opda:{name} has an empty/\"TODO\" "
                f"disposition ({reason!r}) — collapse-by-silence is never "
                "available (ADR-0048 §4 limb (d))"
            )
        for name, note in sorted(self.competency_empty.items()):
            out.append(
                f"GATED edge opda:{name} has no passing worked SPARQL "
                f"competency query ({note}) — ADR-0048 §4 limb (c)"
            )
        return out

    @property
    def is_complete(self) -> bool:
        return (
            self.available
            and not self.rangeless_shapeless
            and not self.not_universally_true_domain
            and not self.malformed_residue
            and not self.competency_empty
        )


def build_report(
    object_properties: dict[str, ObjectPropertyFacts],
    shapes: ShapeFacts,
    residue: dict[str, ResidueEntry] | None = None,
    competency_empty: dict[str, str] | None = None,
) -> CoverageReport:
    """Pure classification over (object-property facts, shape facts, residue
    register, optional competency-query result). Separated from `run()` so it
    is unit-testable on hand-built rdflib graphs — including the positive
    controls (a rangeless-AND-shapeless property MUST violate; a rangeless-but-
    SHACL-pinned property MUST pass). Mirrors `build_coverage_report`.

    `residue` defaults to the live RESIDUE_REGISTER; pass a synthetic register
    in tests. `competency_empty` is limb (c)'s result (GATED edges whose worked
    query returned empty), injected by `run()` after the competency limb runs;
    None means the competency limb did not run (e.g. exemplars absent)."""
    register = RESIDUE_REGISTER if residue is None else residue
    report = CoverageReport()

    # --- limb (d): the residue register is well-formed ----------------------
    # (Computed over the passed register so synthetic registers are checked.)
    reference_excused: set[str] = set()
    for name, entry in register.items():
        if not entry.is_well_formed:
            report.malformed_residue[name] = entry.reason
        if entry.disposition is Disposition.PENDING_UPSTREAM_IC:
            report.residue_pending[name] = entry.reason
        elif entry.disposition is Disposition.VALUE_SLOT:
            report.value_slot[name] = entry.reason
        elif entry.disposition is Disposition.DEFERRED:
            report.deferred[name] = entry.reason
        elif entry.disposition is Disposition.REFERENCE:
            report.reference[name] = entry.reason
            # A well-formed REFERENCE entry excuses its predicate from limb (a);
            # a malformed one is already a limb-(d) violation above, so it is
            # NOT excused (it must be fixed, not silently passed).
            if entry.is_well_formed:
                reference_excused.add(name)

    # --- limbs (a) + (b): per emitted object property -----------------------
    for name, facts in object_properties.items():
        pinned_in_owl = facts.has_range
        pinned_in_shacl = name in shapes.shacl_pinned
        # (a) rangeless-AND-shapeless — the dead-edge defect. A predicate
        # registered REFERENCE (external co-domain cited reference-not-import)
        # is rangeless by design and excused (the exception is recorded in the
        # reference bucket, never silently excused — ODR-0012/0018).
        if not pinned_in_owl and not pinned_in_shacl:
            if name not in reference_excused:
                report.rangeless_shapeless.add(name)
        else:
            report.gated[name] = "owl" if pinned_in_owl else "shacl"
        # (b) a council-named multi-bearer predicate must carry NO rdfs:domain.
        if name in MULTI_BEARER_PREDICATES and facts.domain_classes:
            report.not_universally_true_domain[name] = ", ".join(
                sorted(facts.domain_classes)
            )

    # --- limb (c): merged-in competency result (None == limb did not run) ---
    if competency_empty:
        report.competency_empty.update(competency_empty)

    return report


def run(ontology_dir: Path) -> CoverageReport:
    """Run the relationship-layer coverage gate against an emission directory.

    Reads the class graph (object-property facts) and the shapes graph (SHACL
    type-pin facts) SEPARATELY (ODR-0013), then the competency-query limb over
    the combined exemplar graph, and classifies via `build_report()`. Returns a
    `CoverageReport`; the caller inspects `report.violations` (the hard gate,
    under --strict) and the bucket counts (the progress tracker). When the
    module class TTLs are absent, returns `available=False` (the caller skips,
    mirroring the category-G gate)."""
    class_ttls = _module_class_ttls(ontology_dir)
    if not class_ttls:
        return CoverageReport(available=False)

    class_graph = Graph()
    for ttl in class_ttls:
        class_graph.parse(str(ttl), format="turtle")
    object_properties = extract_object_property_facts(class_graph)

    shapes_graph = Graph()
    for ttl in _module_shape_ttls(ontology_dir):
        shapes_graph.parse(str(ttl), format="turtle")
    shapes = extract_shape_facts(shapes_graph)

    # Limb (c): competency-query coverage over the combined exemplar graph.
    # Imported lazily to keep build_report() free of the corpus dependency.
    from opda_gen.ci.competency_query_test import competency_empty_gated

    gated_now = {
        name
        for name, facts in object_properties.items()
        if facts.has_range or name in shapes.shacl_pinned
    }
    competency_empty = competency_empty_gated(ontology_dir, gated_now)

    return build_report(object_properties, shapes, competency_empty=competency_empty)
