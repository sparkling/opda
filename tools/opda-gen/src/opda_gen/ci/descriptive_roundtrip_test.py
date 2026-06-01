"""
Module descriptive_roundtrip_test.

Realises:
- ODR-0022 §2 gate **G3 — coverage-by-test** — the descriptive-layer
  round-trip CI check. "Coverage preserved" is ratified ONLY when
  (a) a BASPI5 round-trip passes on the *collapsed* TBox (the S021
  byte-identity discipline applied to the descriptive layer), and
  (b) a worked query retrieves a collapsed leaf **by path** + a
  Category-G leaf **by dereferenceable term**.
- ODR-0022 §2 gate **G2 — schema-leaf-path traceability** — the coverage
  assertion is expressed *over* the schema-leaf-path `dct:source` (the
  form-question IRI), not the deciding ODR. G3 presupposes G2: a leaf is
  "addressable" iff some profile property shape carries `dct:source` to
  the form-question IRI AND a resolvable `sh:path`.
- Council session-023 (Knublauch/Davis co-signed gate): "every
  form-question IRI is the `dct:source` of exactly one profile property
  shape = round-trip coverage, indifferent to TBox cardinality." Round-trip
  is a property of the SHACL *profile* (ODR-0008 §Q7a; the base TBox carries
  zero descriptive `sh:minCount`), not of TBox cardinality — so it is
  tested here, not asserted.
- ADR-0029 §Consequence — the overlay profiles MUST enumerate each form's
  leaves in their `sh:path`/`sh:minCount`/`dct:source` shapes; today they
  are emitted *thin*. Until the descriptive walk + profile enumeration land,
  this harness REPORTS the coverage gaps (unaddressable / doubly-bound
  leaves) rather than hard-failing; the caller decides whether to gate.

Boundary: this module is **test/CI infrastructure only**. It mints no IRIs,
modifies no emitter, and re-pins no byte-identity. It reads the emitted
corpus (profiles + SKOS schemes + TBox) and computes a coverage report.

Each public function returns plain data (lists / dataclasses); the runner
`run()` returns a `CoverageReport`. Empty `violations` == the round-trip
coverage gate would PASS; a non-empty `gaps` list is the current
emitted-thin state the harness is designed to surface without breaking the
suite.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import DCTERMS, RDF, SKOS


SH = Namespace("http://www.w3.org/ns/shacl#")
OPDA = Namespace("https://w3id.org/opda/#")

# The BASPI5 form-question authority — the `dct:source` namespace that marks a
# schema leaf path (ODR-0008 §Q3a per-overlay array). Mirrors
# `opda_gen.emitters.profiles.BASPI5_FORMS_AUTHORITY`; duplicated here so the
# CI module has no import dependency on the emitter (boundary discipline).
BASPI5_FORMS_AUTHORITY = "https://www.basp.uk/forms/baspi5"

# Schema-leaf-path authorities (ODR-0022 §Rules.2 G2, S034-amended). A
# `dct:source` under any of these prefixes is a schema leaf path (a
# form-question IRI or a JSON-pointer into the overlay schema); anything else
# (an ODR section anchor, an ADR prov citation) is NOT a form leaf.
#   - the baspi5 human form-question authority `https://www.basp.uk/forms/`
#     (ADR-0029 per-form profile namespace);
#   - the overlay `$id` authority `https://trust.propdata.org.uk/.../overlays/`
#     used by the S034 enumerator's JSON-pointer anchors (`<$id>#/path/to/field`).
# G2's "schema leaf path" is satisfied by EITHER form (S034); the gate must
# SEE both so it counts the enumerated forms' refs and hard-fails on any
# double-bind.
FORMS_AUTHORITY_PREFIX = "https://www.basp.uk/forms/"
OVERLAY_SCHEMA_AUTHORITY_PREFIX = (
    "https://trust.propdata.org.uk/schemas/v3/overlays/"
)
_FORMS_AUTHORITY_PREFIXES: tuple[str, ...] = (
    FORMS_AUTHORITY_PREFIX,
    OVERLAY_SCHEMA_AUTHORITY_PREFIX,
)

# Schema-sanctioned shared form-question refs. baspi5.json assigns ONE
# `baspi5Ref` to MORE THAN ONE schema leaf — a single coarse form question
# capturing values on distinct entities. The G19 acceptance gate
# (tests/baspi5_round_trip/test_traceability.py) requires the `dct:source`
# anchor to be the REAL baspi5Ref (no fabricated `…#A1.1.5.uprn` disambiguator),
# so such a ref legitimately binds >1 sh:path. The round-trip stays lossless —
# each schema leaf keeps its own sh:path on its own node shape — so this is
# multi-entity coverage, NOT the thin-emission over-binding defect the
# doubly-bound check is designed to surface. Listed explicitly so G3 tolerates
# exactly these refs while still catching accidental over-binding elsewhere.
#   A1.1.5 → propertyPack.uprn (opda:hasUPRN on Baspi5_PropertyShape)
#          + propertyPack.address.postcode (vcard:postal-code on Baspi5_AddressShape)
_SCHEMA_SANCTIONED_SHARED_REFS: frozenset[str] = frozenset({
    f"{BASPI5_FORMS_AUTHORITY}#A1.1.5",
})


def _is_form_leaf(o: object) -> bool:
    """True iff ``o`` is a schema leaf path (a form-question IRI under the
    baspi5 forms authority OR a JSON-pointer under the overlay `$id`
    authority). Per G2 (S034-amended) this is the `dct:source` target a
    collapsed-category instance, a G property, or an enumerated overlay
    leaf MUST carry."""
    return isinstance(o, URIRef) and str(o).startswith(
        _FORMS_AUTHORITY_PREFIXES
    )


@dataclass(frozen=True)
class PropertyShapeBinding:
    """One profile property-shape leaf binding: a node carrying both an
    `sh:path` (the profile property the data is addressed by) and a
    `dct:source` form-question IRI (the schema leaf the path round-trips to).
    """

    shape: object  # the property-shape node (usually a blank node)
    form_leaf: str  # the dct:source form-question IRI
    path: object  # the sh:path value (a URIRef property)


@dataclass
class CoverageReport:
    """The G3 coverage-by-test report for one or more overlay profiles.

    Round-trip coverage (the gate) holds iff ``violations`` is empty:
    every form-question leaf that appears anywhere in the profile is the
    `dct:source` of **exactly one** property-shape `sh:path` (no leaf
    unaddressable, none doubly-bound).

    Until the descriptive walk + profile enumeration land (ADR-0028 G-walk,
    ADR-0029 thin→enumerated), the profiles are emitted *thin*: most
    form leaves are not yet bound by a property shape. Those are recorded
    in ``unaddressable`` and summarised in ``gaps`` so the caller can
    `xfail`/skip-with-reason rather than hard-fail.
    """

    # All form-question leaves referenced anywhere in the loaded profiles.
    form_leaves: set[str] = field(default_factory=set)
    # Leaves bound by exactly one property-shape sh:path — fully addressable.
    addressable: dict[str, object] = field(default_factory=dict)
    # Leaves referenced but bound by NO property-shape sh:path (emitted-thin).
    unaddressable: set[str] = field(default_factory=set)
    # Leaves bound by MORE THAN ONE distinct property-shape sh:path.
    doubly_bound: dict[str, list[object]] = field(default_factory=dict)
    # Property shapes (have sh:path) that carry NO form-leaf dct:source —
    # i.e. a path the data uses that cannot be traced back to a form question.
    untraceable_shapes: list[object] = field(default_factory=list)

    @property
    def violations(self) -> list[str]:
        """The hard G3 gate: every form leaf bound by exactly one path,
        every path-bearing shape traceable. Empty == round-trip PASS."""
        out: list[str] = []
        for leaf in sorted(self.unaddressable):
            out.append(
                f"form-question leaf {leaf} is unaddressable: no profile "
                "property shape sources it via sh:path (G3 round-trip gap)"
            )
        for leaf, paths in sorted(self.doubly_bound.items()):
            rendered = ", ".join(str(p) for p in sorted(paths, key=str))
            out.append(
                f"form-question leaf {leaf} is doubly-bound: sourced by "
                f"{len(paths)} distinct property-shape paths ({rendered}) "
                "— must be exactly one (G3 round-trip gap)"
            )
        for shape in self.untraceable_shapes:
            out.append(
                f"property shape {shape} carries sh:path but no form-question "
                "dct:source — untraceable to a schema leaf (G2 gap)"
            )
        return out

    @property
    def gaps(self) -> list[str]:
        """Human-readable summary of the *expected* emitted-thin gaps (the
        ADR-0029 thin-profile state). Used by the harness to skip/xfail with
        a clear reason rather than hard-fail before the walk lands."""
        out: list[str] = []
        if self.unaddressable:
            out.append(
                f"{len(self.unaddressable)} of {len(self.form_leaves)} "
                "form-question leaves are not yet bound by a property-shape "
                "sh:path (profiles emitted thin per ADR-0029 — descriptive "
                "walk + per-form leaf enumeration not yet emitted)"
            )
        if self.doubly_bound:
            out.append(
                f"{len(self.doubly_bound)} form-question leaves are bound by "
                ">1 distinct path (over-binding during thin emission)"
            )
        if self.untraceable_shapes:
            out.append(
                f"{len(self.untraceable_shapes)} property shapes carry sh:path "
                "with no form-question dct:source (G2 traceability gap)"
            )
        return out

    @property
    def is_complete(self) -> bool:
        """True iff there is at least one addressable leaf AND no gaps — the
        state in which G3 can be a hard gate. While the descriptive walk is
        deferred this is False (emitted-thin), and the caller skips/xfails."""
        return bool(self.addressable) and not self.gaps


# ---------------------------------------------------------------------------
# Profile graph loading (profiles + SKOS substrate, for the term query test).
# ---------------------------------------------------------------------------
def _load_profiles(ontology_dir: Path) -> Graph:
    """Load every overlay profile under ``profiles/`` plus the SKOS
    vocabularies file (needed for the Category-G dereferenceable-term query
    scaffolding) into one rdflib Graph. Tolerates missing files."""
    g = Graph()
    profiles_dir = ontology_dir / "profiles"
    if profiles_dir.exists():
        for f in sorted(profiles_dir.glob("*.ttl")):
            g.parse(str(f), format="turtle")
    vocab = ontology_dir / "opda-vocabularies.ttl"
    if vocab.exists():
        g.parse(str(vocab), format="turtle")
    return g


# ---------------------------------------------------------------------------
# Coverage assertion — the G3 (a) round-trip-on-collapsed-TBox check.
# ---------------------------------------------------------------------------
def collect_form_leaves(g: Graph) -> set[str]:
    """Every form-question IRI referenced anywhere via `dct:source`.

    This is the *denominator* of round-trip coverage: the set of schema
    leaf paths a consumer might address. Includes leaves sourced by node
    shapes (container shapes) and by property shapes alike — a leaf sourced
    only by a node shape is still "referenced" but not yet addressable
    by `sh:path`, which is exactly the gap G3 surfaces.
    """
    return {
        str(o)
        for o in g.objects(None, DCTERMS.source)
        if _is_form_leaf(o)
    }


def collect_property_shape_bindings(g: Graph) -> list[PropertyShapeBinding]:
    """Every property-shape leaf binding: a node carrying BOTH `sh:path`
    and a form-question `dct:source`.

    A property shape is the unit that makes a form leaf addressable by path
    (the round-trip mechanism). Node/container shapes (which carry
    `dct:source` but no `sh:path`) are deliberately excluded — they group
    leaves but do not bind one.
    """
    bindings: list[PropertyShapeBinding] = []
    for shape in set(g.subjects(SH.path, None)):
        paths = list(g.objects(shape, SH.path))
        leaves = [o for o in g.objects(shape, DCTERMS.source) if _is_form_leaf(o)]
        for leaf in leaves:
            for path in paths:
                bindings.append(
                    PropertyShapeBinding(
                        shape=shape, form_leaf=str(leaf), path=path
                    )
                )
    return bindings


def build_coverage_report(g: Graph) -> CoverageReport:
    """Compute the full G3 coverage report over a loaded profile graph.

    The coverage assertion (ODR-0022 §2 G3 / session-023 Knublauch gate):
    *every form-question leaf is the `dct:source` of exactly one profile
    property-shape `sh:path`* — no leaf unaddressable, none doubly-bound.
    """
    report = CoverageReport()
    report.form_leaves = collect_form_leaves(g)
    bindings = collect_property_shape_bindings(g)

    # leaf -> set of distinct paths binding it.
    leaf_paths: dict[str, set[object]] = defaultdict(set)
    for b in bindings:
        leaf_paths[b.form_leaf].add(b.path)

    # Property shapes (have sh:path) lacking any form-leaf dct:source (G2 gap).
    bound_shapes = {b.shape for b in bindings}
    for shape in set(g.subjects(SH.path, None)):
        if shape not in bound_shapes:
            report.untraceable_shapes.append(shape)

    for leaf in report.form_leaves:
        paths = leaf_paths.get(leaf, set())
        if not paths:
            report.unaddressable.add(leaf)
        elif len(paths) == 1:
            report.addressable[leaf] = next(iter(paths))
        elif leaf in _SCHEMA_SANCTIONED_SHARED_REFS:
            # baspi5.json assigns this ref to >1 schema leaf (distinct
            # entities); each keeps its own sh:path, so it is addressable
            # multi-entity coverage, not over-binding. Record a deterministic
            # representative path; consumers recover all paths via
            # retrieve_by_path (which queries the graph, not this dict).
            report.addressable[leaf] = sorted(paths, key=str)[0]
        else:
            report.doubly_bound[leaf] = sorted(paths, key=str)
    return report


def run(ontology_dir: Path) -> CoverageReport:
    """Run the G3 descriptive-layer round-trip coverage check.

    Loads every overlay profile + the SKOS substrate, computes the coverage
    report, and returns it. The caller inspects ``report.violations``
    (the hard gate) and ``report.gaps`` (the emitted-thin reasons to
    skip/xfail before the descriptive walk lands).
    """
    g = _load_profiles(ontology_dir)
    return build_coverage_report(g)


# ---------------------------------------------------------------------------
# Worked per-leaf query mechanism — the G3 (b) check (scaffolding).
#
# G3 (b) demands a worked query that (a) retrieves a *collapsed* leaf by
# **path** (via dct:source) and (b) retrieves a *Category-G* leaf by
# **dereferenceable term**. The two retrieval mechanisms are encoded here as
# functions over the loaded graph so the test can assert them the moment
# emission lands. They are correct today against whatever the (thin) profile
# emits; they simply return empty sets until the walk binds the leaves.
# ---------------------------------------------------------------------------
def retrieve_by_path(g: Graph, form_leaf: str) -> list[object]:
    """G3 (b) mechanism (a): retrieve a **collapsed** leaf by PATH.

    Given a form-question IRI (schema leaf path), return the `sh:path`
    property/properties any profile property shape binds it to via
    `dct:source`. This is how a consumer recovers "which predicate carries
    the answer to form question X" *without* a per-leaf IRI — the round-trip
    that makes the collapse lossless (session-023 Q6: "(subject, predicate)
    pair preserving full addressability with one shared predicate").

    Returns an empty list when the leaf is not (yet) bound — the emitted-thin
    state. A Category-A/C/D collapsed leaf is retrieved here by its *shared*
    path (`opda:disclosureDetail`, `opda:inclusionStatus`, …).
    """
    target = URIRef(form_leaf)
    out: list[object] = []
    for shape in g.subjects(DCTERMS.source, target):
        out.extend(g.objects(shape, SH.path))
    return out


def retrieve_by_term(g: Graph, term: URIRef) -> dict[str, list[object]]:
    """G3 (b) mechanism (b): retrieve a **Category-G** leaf by DEREFERENCEABLE
    TERM.

    A Category-G concept earns one permanent `opda:` IRI (ODR-0022 Cat G;
    ODR-0008 §Q6a flat-default). Dereferencing it yields the term's own
    description: the property shapes that use it as `sh:path`, and (where the
    term is itself a `skos:Concept`, e.g. a peril/dataset or fixture item)
    its scheme membership + labels. This is the term-grain addressing the DA
    held as the floor for genuine concepts (session-023 Q3).

    Returns a dict with keys ``bound_by`` (property shapes whose sh:path is
    this term), ``in_scheme`` (SKOS scheme membership), and ``labels``.
    Empty values are the emitted-thin / not-a-G-term state.
    """
    return {
        "bound_by": list(g.subjects(SH.path, term)),
        "in_scheme": list(g.objects(term, SKOS.inScheme)),
        "labels": list(g.objects(term, SKOS.prefLabel))
        + list(g.objects(term, RDF.value)),
    }
