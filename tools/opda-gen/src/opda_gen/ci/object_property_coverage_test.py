"""
Module object_property_coverage_test.

Realises:
- ADR-0048 work-item 4 (the gate, AS AMENDED by Council session-047) + the
  ODR-0032 §Confirmation gate rule — the relationship-layer completeness gate,
  the object-property analogue of how `ci-category-g-coverage` (ADR-0032) gates
  the descriptive datatype-leaf layer. The descriptive layer got a walk *and* a
  gate; this gate brings the relationship layer to parity.

The gate rule (Council session-047 Q2/Q5, INVERTED limb (b) by session-050)
===========================================================================
Every opda: `owl:ObjectProperty` MUST be a DECLARED predicate whose co-domain
is **type-pinned** by EITHER (a) `rdfs:range` OR (b) a SHACL value-type shape
(`sh:class`/`sh:node`, reached via `sh:targetObjectsOf <pred>` or a property
shape `sh:path <pred>` nested in a node shape). The gate FAILs on:

  (a) **rangeless-AND-shapeless** — an `owl:ObjectProperty` with no `rdfs:range`
      *and* no SHACL value-type pin. NOT rangeless per se: `founds`/`mediates`
      were intentionally rangeless-in-OWL but SHACL-pinned (session-047); under
      the session-050 amendment they now ALSO carry documentary `rdfs:domain`/
      `rdfs:range`, so they pass via the OWL limb too. This is the real defect
      the gate exists to catch (`mediates` was range-unpinned in BOTH graphs —
      session-047 Q5).
  (b) **a disjunction object property that authors multi-`rdfs:domain` /
      multi-`rdfs:range` WITHOUT a matching SHACL `sh:or` value-type dual, OR
      without the module-header "any-of" convention note** — INVERTED by Council
      [session-050] (ODR-0032 §Confirmation amended; ADR-0049 Q1). The former
      rule "fail on a not-universally-true `rdfs:domain`" is **reversed**:
      documentary repeated-`rdfs:domain` "any-of" (the schema.org `domainIncludes`
      idiom, hm ODR-0014) is now *required*, not forbidden — OPDA never entails
      domain/range (ODR-0026 §R2; the frozen closure adds zero domain/range
      triples, ADR-0035), so the RDFS §3.2 conjunction reading is disarmed by
      construction. The DUAL is what the gate enforces: every disjunction
      predicate (one with >1 `rdfs:domain` or >1 class-valued `rdfs:range`) MUST
      (i) carry a matching SHACL `sh:or` value-type dual (the authoritative
      disjunction — `sh:or` carrying `sh:class`/`sh:node`, reached via
      `sh:targetObjectsOf` / `sh:targetSubjectsOf` / `sh:path <pred>`), AND
      (ii) be declared in a module whose `owl:Ontology` header carries the
      `skos:editorialNote` "any-of" convention note. Plus: any
      `owl:FunctionalProperty` / `owl:InverseFunctionalProperty` authored on an
      object property is a violation (the FP/IFP carve-out — a published IFP
      asserts the negation of ODR-0005's bounded-context-identity ruling;
      ADR-0049 Q2 / Q3).
  (c) a **GATED** §R2 association lacking **one worked SPARQL competency query**
      that traverses it (the ODR-0022 §G3 coverage-by-test discipline carried
      to the relationship layer) — see `competency_query_test`.
  (d) a **residue-register** entry (VALUE-SLOT / PENDING-upstream-IC / DEFERRED)
      with an empty / "TODO" disposition (collapse-by-silence is never
      available; ODR-0032 §R1).

Two-graph separation (ODR-0013 open/closed-world guard)
=======================================================
The **class-graph dead-edge check** (limbs a + the disjunction-predicate
detection + the FP/IFP check + the module-header convention-note read) reads the
module class TTLs only. The **shapes-graph dual check** (limb b's SHACL `sh:or`
dual read) reads the `*-shapes.ttl` files. They are kept SEPARATE — an object
property declared in the class graph is type-pinned EITHER by its own
`rdfs:range` (class graph) OR by a shape in the shapes graph; the two graphs are
never conflated into one union for this check.

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
from rdflib.namespace import OWL, RDF, RDFS, SKOS

from opda_gen.inputs.object_property_residue import (
    RESIDUE_REGISTER,
    Disposition,
    ResidueEntry,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
SH = Namespace("http://www.w3.org/ns/shacl#")


# The OWL constructs EXCLUDED from authoring on an object property (ADR-0049 Q2 /
# Q3; ODR-0030-adopted re-keyed; ODR-0032 §Confirmation amended). A published
# `owl:InverseFunctionalProperty` asserts the negation of ODR-0005's 12-0
# bounded-context-identity ruling (it promotes a contingent identifier to a
# global identity criterion — "shared value ⇒ sameAs everywhere"); FP has no
# general documentary layer (the home is SHACL sh:maxCount 1 /
# dash:uniqueValueForClass scoped within-sortal). Limb (b) fails on either,
# authored as an object-property axiom. Keyed on the OWL class local name.
EXCLUDED_PROPERTY_CONSTRUCTS = frozenset(
    {"FunctionalProperty", "InverseFunctionalProperty"}
)


# ---------------------------------------------------------------------------
# Fact extraction — class graph (dead-edge) vs shapes graph (bearer), kept
# SEPARATE per ODR-0013. Each returns a plain dataclass of facts so the
# classification in build_report() is pure + unit-testable on synthetic input.
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class ObjectPropertyFacts:
    """Class-graph facts about one opda: `owl:ObjectProperty`.

    `has_range` is the OWL type-pin limb (limb a). `domain_classes` /
    `range_classes` are the opda: local names asserted as `rdfs:domain` /
    class-valued `rdfs:range`; a count >1 on EITHER marks the property a
    documentary "any-of" DISJUNCTION predicate, which limb (b) requires to
    carry a SHACL `sh:or` dual + the module convention note.
    `excluded_constructs` are any FP/IFP rdf:type axioms on the predicate
    (limb b — the ADR-0049 carve-out)."""

    local_name: str
    has_range: bool
    # opda: local names asserted as rdfs:domain (≥1 means a domain is asserted).
    domain_classes: frozenset[str] = frozenset()
    # opda: local names asserted as class-valued rdfs:range.
    range_classes: frozenset[str] = frozenset()
    # OWL local names among EXCLUDED_PROPERTY_CONSTRUCTS this predicate is typed.
    excluded_constructs: frozenset[str] = frozenset()

    @property
    def is_disjunction(self) -> bool:
        """A documentary "any-of" predicate: >1 rdfs:domain OR >1 class-valued
        rdfs:range. The schema.org domainIncludes idiom (hm ODR-0014)."""
        return len(self.domain_classes) > 1 or len(self.range_classes) > 1


@dataclass(frozen=True)
class ShapeFacts:
    """Shapes-graph facts. `shacl_pinned`: predicates type-pinned by a SHACL
    value-type shape (`sh:class`/`sh:node`), reached via `sh:targetObjectsOf
    <pred>` OR a property shape `sh:path <pred>` (the limb-(a) pin).
    `sh_or_dual`: predicates carrying a SHACL `sh:or` value-type DISJUNCTION
    (an `sh:or` list whose members carry `sh:class`/`sh:node`), reached via
    `sh:targetObjectsOf` / `sh:targetSubjectsOf` / `sh:path <pred>` — the
    authoritative dual limb (b) requires of every disjunction predicate
    (covers BOTH the object-side range disjunction and the subject-side bearer
    disjunction). Local names."""

    shacl_pinned: frozenset[str] = frozenset()
    sh_or_dual: frozenset[str] = frozenset()


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
    (the OWL type-pin), `rdfs:domain`/class-valued `rdfs:range` (the disjunction
    detection, limb b), and any FP/IFP rdf:type axiom (the excluded-construct
    check, limb b); never consults the shapes graph."""
    opda_ns = str(OPDA)
    owl_ns = str(OWL)
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
        # class-valued rdfs:range only (opda: classes) — a datatype range is a
        # modelling error on an object property but is out of scope for the
        # disjunction count (it is never an "any-of" sortal disjunction).
        ranges = {
            str(o)[len(opda_ns):]
            for o in class_graph.objects(subj, RDFS.range)
            if isinstance(o, URIRef) and str(o).startswith(opda_ns)
        }
        # FP/IFP excluded-construct axioms on this predicate (ADR-0049 carve-out).
        excluded = {
            str(t)[len(owl_ns):]
            for t in class_graph.objects(subj, RDF.type)
            if isinstance(t, URIRef)
            and str(t).startswith(owl_ns)
            and str(t)[len(owl_ns):] in EXCLUDED_PROPERTY_CONSTRUCTS
        }
        out[local] = ObjectPropertyFacts(
            local_name=local,
            has_range=has_range,
            domain_classes=frozenset(domains),
            range_classes=frozenset(ranges),
            excluded_constructs=frozenset(excluded),
        )
    return out


def modules_with_convention_note(class_graph: Graph) -> bool:
    """True iff EVERY `owl:Ontology` module header that declares a disjunction
    object property carries the `skos:editorialNote` "any-of" convention note
    (Council session-050 Q1 binding rider; ODR-0032 §R1). Detection is
    deliberately coarse — the note is matched by a case-insensitive
    "any-of" + "documentary" substring on any editorial note of any ontology
    node in the class graph. Because the class graph is the union of all module
    TTLs, this asserts the convention is PRESENT corpus-wide; the per-module
    placement is a byte-identity concern the emitter owns, not this gate.

    Returns True when no ontology node is present (vacuous — e.g. a synthetic
    test graph), so the convention check fires only against a real corpus."""
    notes: list[str] = []
    for onto in class_graph.subjects(RDF.type, OWL.Ontology):
        for note in class_graph.objects(onto, SKOS.editorialNote):
            notes.append(str(note).lower())
    if not notes:
        return True
    return any("any-of" in n and "documentary" in n for n in notes)


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
    or_dual: set[str] = set()

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

    def _carries_sh_or(node: object) -> bool:
        """True iff `node` carries an `sh:or` whose member list pins a value
        type (`sh:class`/`sh:node`) — the authoritative disjunction dual limb
        (b) requires of every documentary "any-of" predicate."""
        for lst in shapes_graph.objects(node, SH["or"]):
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
        # sh:or DISJUNCTION dual reached via the object-targeting node shape
        # (FoundsRangeShape / HasParticipantRangeShape / PlaysRangeShape).
        if local and _carries_sh_or(shape):
            or_dual.add(local)

    # Subject-side disjunction dual: a node shape `sh:targetSubjectsOf <pred>`
    # carrying an `sh:or` on the node (the bearer disjunction —
    # HasAddressBearerShape / RolePlaySubjectShape). limb (b) accepts a subject
    # OR an object `sh:or` dual as "the authoritative disjunction present".
    for shape, pred in shapes_graph.subject_objects(SH.targetSubjectsOf):
        local = _pred_local(pred)
        if local and _carries_sh_or(shape):
            or_dual.add(local)

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
        # A non-vacuous property-shape `sh:path <pred>` carrying an `sh:or`
        # value-type list is a disjunction dual too (RolePlayShape / SellerShape
        # / BuyerShape bearer sh:or on opda:playedBy).
        if _carries_sh_or(ps):
            or_dual.add(local)

    return ShapeFacts(shacl_pinned=frozenset(pinned), sh_or_dual=frozenset(or_dual))


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
    # --- limb (b) — INVERTED (Council session-050; ODR-0032 §Confirmation) ---
    # (b1) a documentary "any-of" disjunction predicate (>1 rdfs:domain or >1
    #      class-valued rdfs:range) lacking the authoritative SHACL sh:or dual.
    #      local -> the offending domain/range class local names, joined.
    disjunction_without_sh_or: dict[str, str] = field(default_factory=dict)
    # (b2) a disjunction predicate present while the module-header "any-of"
    #      convention note is ABSENT corpus-wide. local -> the disjunction arms.
    disjunction_without_convention: dict[str, str] = field(default_factory=dict)
    # (b3) an FP/IFP excluded-construct axiom on an object property (ADR-0049
    #      carve-out). local -> the excluded OWL construct local name(s), joined.
    excluded_construct: dict[str, str] = field(default_factory=dict)
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
        type-pinned (OWL or SHACL), every documentary "any-of" disjunction
        predicate carrying its SHACL sh:or dual + the module convention note, no
        FP/IFP authored, the residue register well-formed, and every GATED edge
        competency-query-covered."""
        out: list[str] = []
        for name in sorted(self.rangeless_shapeless):
            out.append(
                f"opda:{name} is an owl:ObjectProperty that is rangeless AND "
                "shapeless (no rdfs:range and no SHACL sh:class/sh:node "
                "value-type pin) — ADR-0048 §4 limb (a)"
            )
        for name, arms in sorted(self.disjunction_without_sh_or.items()):
            out.append(
                f"opda:{name} authors documentary multi-rdfs:domain/range "
                f"\"any-of\" ({arms}) but has NO matching SHACL sh:or value-type "
                "dual — the authoritative disjunction MUST be present (ODR-0032 "
                "§Confirmation limb (b), inverted; ADR-0049 Q1)"
            )
        for name, arms in sorted(self.disjunction_without_convention.items()):
            out.append(
                f"opda:{name} authors documentary multi-rdfs:domain/range "
                f"\"any-of\" ({arms}) but the module-header skos:editorialNote "
                "\"any-of\" convention note is absent — the CI-gated convention "
                "is a MUST (ODR-0032 §Confirmation limb (b); ADR-0049 Q1)"
            )
        for name, constructs in sorted(self.excluded_construct.items()):
            out.append(
                f"opda:{name} is authored as owl:{constructs} — FP/IFP are "
                "excluded on object properties (a published IFP asserts the "
                "negation of ODR-0005's bounded-context identity; ADR-0049 Q2/Q3 "
                "— ODR-0032 §Confirmation limb (b))"
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
            and not self.disjunction_without_sh_or
            and not self.disjunction_without_convention
            and not self.excluded_construct
            and not self.malformed_residue
            and not self.competency_empty
        )


def build_report(
    object_properties: dict[str, ObjectPropertyFacts],
    shapes: ShapeFacts,
    residue: dict[str, ResidueEntry] | None = None,
    competency_empty: dict[str, str] | None = None,
    convention_note_present: bool = True,
) -> CoverageReport:
    """Pure classification over (object-property facts, shape facts, residue
    register, optional competency-query result, convention-note flag). Separated
    from `run()` so it is unit-testable on hand-built rdflib graphs — including
    the positive controls (a rangeless-AND-shapeless property MUST violate; a
    rangeless-but-SHACL-pinned property MUST pass; an "any-of" disjunction
    predicate WITHOUT its sh:or dual MUST violate). Mirrors `build_coverage_report`.

    `residue` defaults to the live RESIDUE_REGISTER; pass a synthetic register
    in tests. `competency_empty` is limb (c)'s result (GATED edges whose worked
    query returned empty), injected by `run()` after the competency limb runs;
    None means the competency limb did not run (e.g. exemplars absent).
    `convention_note_present` is the limb-(b) module-header "any-of" convention
    flag (defaults True so synthetic fact tests with no module headers are not
    spuriously failed; `run()` computes it from the class graph)."""
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
        # (b) — INVERTED (Council session-050; ODR-0032 §Confirmation; ADR-0049).
        # (b3) FP/IFP carve-out: an excluded-construct axiom is a violation
        # regardless of disjunction status.
        if facts.excluded_constructs:
            report.excluded_construct[name] = ", ".join(
                sorted(facts.excluded_constructs)
            )
        # (b1)/(b2) a documentary "any-of" disjunction predicate (>1 rdfs:domain
        # or >1 class-valued rdfs:range) MUST carry the authoritative SHACL sh:or
        # dual AND be declared under the module-header convention note. The
        # multi-rdfs:domain is now REQUIRED, not forbidden (the inversion).
        if facts.is_disjunction:
            arms = ", ".join(
                f"domain:{c}" for c in sorted(facts.domain_classes)
            ) if len(facts.domain_classes) > 1 else ""
            range_arms = ", ".join(
                f"range:{c}" for c in sorted(facts.range_classes)
            ) if len(facts.range_classes) > 1 else ""
            arms = ", ".join(a for a in (arms, range_arms) if a)
            if name not in shapes.sh_or_dual:
                report.disjunction_without_sh_or[name] = arms
            if not convention_note_present:
                report.disjunction_without_convention[name] = arms

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
    convention_note_present = modules_with_convention_note(class_graph)

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

    return build_report(
        object_properties,
        shapes,
        competency_empty=competency_empty,
        convention_note_present=convention_note_present,
    )
