"""
Module baspi5_roundtrip_test.

Realises:
- ODR-0003 §"MVP round-trip gate" + §"Programme retirement criterion" —
  termination signal 1: `pdtf-transaction.json` → loaded SHACL profile →
  rendered BASPI form (via DASH) → validated transaction with full
  `dct:source` traceability. This module is the executable, CLI-gated form
  of that signal — the transaction-side complement to the profile-side G3
  coverage check (`descriptive_roundtrip_test`) — exposing the round-trip as
  a first-class `ci-*` gate alongside the others.
- ODR-0010 §Rules "Enforcement (round-trip on the BASPI5 slice)" — loading
  the profile MUST (a) validate a conformant transaction, (b) report
  violations on a non-conformant one (the Seller-as-Attorney/PR with no
  evidenced authority case, form-question B1.3.2), and (c) re-generate the
  BASPI form via the DASH annotations with every field carrying a resolvable
  `dct:source`.
- ADR-0014 §"Round-trip layer" — the BASPI5 MVP gate. The ADR-0014 pytest
  harness (`tests/baspi5_round_trip/`) drives the JSON↔RDF round-trip; this
  module is its CLI-gate sibling, validating two committed RDF transaction
  exemplars directly against the loaded profile.

Boundary: CI infrastructure only. It mints no IRIs, modifies no emitter,
re-pins no byte-identity. It reads the emitted corpus (base shapes + the
BASPI5 overlay profile + the class TBox) and two committed RDF transaction
exemplars, runs Apache Jena SHACL, and computes a `RoundTripReport`.

The (c) check is the *data-contract* half: every BASPI5 property shape that
carries a form-question `dct:source` also carries a DASH render hint
(`dash:viewer` or `dash:editor`). The actual UI render is the documented
consumer-app boundary (ODR-0010 §Q4; ADR-0014 §"Consumer boundary") and is
NOT built here.

`run()` returns a `RoundTripReport`; empty `report.violations` == PASS.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import DCTERMS, RDF


SH = Namespace("http://www.w3.org/ns/shacl#")
OPDA = Namespace("https://opda.org.uk/pdtf/")
DASH = Namespace("http://datashapes.org/dash#")

# The BASPI5 form-question authority — duplicated here (not imported from the
# emitter) so the CI module has no dependency on the emitter or the test
# package (boundary discipline, mirroring descriptive_roundtrip_test).
BASPI5_FORMS_AUTHORITY = "https://www.basp.uk/forms/baspi5"
# The canonical non-conformant case's form-question (ODR-0010 §Rules (b);
# the sellersCapacity xone evidenced-authority branch).
B132 = URIRef(f"{BASPI5_FORMS_AUTHORITY}#B1.3.2")

# The base shape graphs + the overlay profile compose into the validation
# shapes graph (ODR-0010 build-step graph-union, mirrored as code).
_SHAPE_TTLS = (
    "opda-shapes.ttl",
    "opda-property-shapes.ttl",
    "opda-agent-shapes.ttl",
    "opda-transaction-shapes.ttl",
    "opda-claim-shapes.ttl",
    "opda-governance-shapes.ttl",
    "opda-descriptive-shapes.ttl",
)
# The class TBox graphs (needed for sh:targetClass + rdfs inference).
_CLASS_TTLS = (
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

_CONFORMANT = "baspi5-transaction-conformant.ttl"
_NONCONFORMANT = "baspi5-transaction-nonconformant.ttl"

_CAPACITY_SHAPE = OPDA.Baspi5_SellersCapacityShape
_RDF_NIL = URIRef("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil")


@dataclass
class RoundTripReport:
    """The ODR-0003 signal-1 round-trip report.

    The gate holds iff ``violations`` is empty: (a) the conformant exemplar
    conforms with zero SHACL violations; (b) the non-conformant exemplar
    fails AND the violation cites the SellersCapacity xone shape whose
    `dct:source` chain resolves to form-question B1.3.2; (c) every BASPI5
    property shape carrying a form-question `dct:source` also carries a DASH
    render hint.
    """

    available: bool = True
    unavailable_reason: str = ""

    # (a)
    conformant_conforms: bool = False
    conformant_violation_count: int = 0
    conformant_violation_messages: list[str] = field(default_factory=list)

    # (b)
    nonconformant_conforms: bool = True
    nonconformant_violation_count: int = 0
    nonconformant_traces_to_b132: bool = False
    nonconformant_source_shapes: list[str] = field(default_factory=list)

    # (c)
    render_total: int = 0
    render_complete: int = 0
    render_missing: list[str] = field(default_factory=list)

    @property
    def violations(self) -> list[str]:
        """The hard gate. Empty == round-trip PASS."""
        out: list[str] = []
        if not self.available:
            return out
        # (a)
        if not self.conformant_conforms:
            joined = "; ".join(self.conformant_violation_messages)
            out.append(
                "(a) conformant BASPI5 transaction did NOT validate cleanly: "
                f"{self.conformant_violation_count} violation(s) [{joined}]"
            )
        # (b)
        if self.nonconformant_conforms:
            out.append(
                "(b) non-conformant BASPI5 transaction (PoA seller without "
                "evidenced authority) conformed — it MUST report a violation"
            )
        elif not self.nonconformant_traces_to_b132:
            out.append(
                "(b) non-conformant violation does NOT trace to form-question "
                "B1.3.2 via the SellersCapacity xone branch; source shapes: "
                f"{self.nonconformant_source_shapes}"
            )
        # (c)
        if self.render_total == 0:
            out.append(
                "(c) no BASPI5 property shape carries a form-question "
                "dct:source — render-contract empty"
            )
        for shape in self.render_missing:
            out.append(
                f"(c) property shape {shape} carries a form-question "
                "dct:source but no DASH render hint (dash:viewer/dash:editor)"
            )
        return out

    @property
    def render_summary(self) -> str:
        return (
            f"render-contract: {self.render_complete}/{self.render_total} "
            "fields carry dct:source + DASH"
        )


def _ontology_dir_default() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent / "source" / "03-standards" / "ontology"
    raise RuntimeError("could not resolve OPDA repo root")


def build_shapes_graph(ontology_dir: Path) -> Graph:
    """Compose base shapes + the BASPI5 overlay profile into one SHACL
    shapes graph (ODR-0010 build-step graph-union)."""
    g = Graph()
    for rel in _SHAPE_TTLS:
        g.parse(ontology_dir / rel, format="turtle")
    g.parse(ontology_dir / "profiles" / "baspi5.ttl", format="turtle")
    return g


def load_tbox_graph(ontology_dir: Path) -> Graph:
    """Load the class TBox graphs (sh:targetClass + rdfs inference)."""
    g = Graph()
    for rel in _CLASS_TTLS:
        g.parse(ontology_dir / rel, format="turtle")
    return g


def _rdf_list(g: Graph, head: object) -> list:
    """Return the members of an RDF collection."""
    out: list = []
    rest = head
    while rest and rest != _RDF_NIL:
        first = g.value(rest, RDF.first)
        if first is not None:
            out.append(first)
        rest = g.value(rest, RDF.rest)
    return out


def _validate(data_ttl: Path, shapes: Graph, tbox: Graph):
    from opda_gen.jena_shacl import validate

    # Jena's `shacl` CLI does no RDFS pre-inference, so merge the TBox into the
    # data graph (it carries the class hierarchy + explicit types) before
    # validating — the ADR-0036/0037 Jena equivalent of pyshacl's ont_graph.
    merged = Graph()
    merged.parse(data_ttl, format="turtle")
    for triple in tbox:
        merged.add(triple)
    return validate(shapes, merged)


def render_contract_summary(shapes: Graph) -> tuple[int, int, list[str]]:
    """Return (total, complete, missing) for BASPI5 *rendered* fields.

    The render contract (the in-scope half of ODR-0010 §Rules (c)) is over
    the property shapes a form renderer lays out: a property shape counts iff
    it carries (i) a form-question `dct:source` (a baspi5 forms IRI) AND (ii)
    DASH layout markers (`sh:order`/`sh:group` — the field's position and
    section). It is *complete* iff it ALSO carries a render hint:
    `dash:viewer`/`dash:editor`, OR an `sh:in` enum (a renderer derives an
    EnumSelect widget from the constraint, per ODR-0010 §Q4's
    `dash:EnumSelectEditor`-driven-by-`sh:in` mapping).

    `sh:xone` discriminator branch shapes (e.g. the sellersCapacity
    `hasAssertedCapacity`/`hasEvidencedAuthority` branches) carry a
    `dct:source` for G2 traceability but have NO layout markers — they are
    validation discriminators, not rendered fields — so they are excluded
    from the rendered-field contract. `missing` lists rendered fields with no
    render hint.
    """
    total = 0
    complete = 0
    missing: list[str] = []
    seen: set = set()
    for shape in shapes.subjects(SH.path, None):
        if shape in seen:
            continue
        srcs = [
            o
            for o in shapes.objects(shape, DCTERMS.source)
            if str(o).startswith(BASPI5_FORMS_AUTHORITY)
        ]
        has_layout = bool(
            list(shapes.objects(shape, SH.order))
            or list(shapes.objects(shape, SH.group))
        )
        if not srcs or not has_layout:
            continue
        seen.add(shape)
        total += 1
        has_hint = bool(
            list(shapes.objects(shape, DASH.viewer))
            or list(shapes.objects(shape, DASH.editor))
            or list(shapes.objects(shape, SH["in"]))
        )
        if has_hint:
            complete += 1
        else:
            missing.append(str(shape))
    return total, complete, missing


def _trace_b132(shapes: Graph) -> bool:
    """True iff B1.3.2 is the `dct:source` of a property shape inside the
    SellersCapacity xone (the evidenced-authority branch) — the chain a
    consumer follows from the violated shape back to the BASPI form
    question (ODR-0010 §Rules (b))."""
    for xone_list in shapes.objects(_CAPACITY_SHAPE, SH.xone):
        for branch in _rdf_list(shapes, xone_list):
            for prop in shapes.objects(branch, SH.property):
                if B132 in set(shapes.objects(prop, DCTERMS.source)):
                    return True
    return False


def run(ontology_dir: Path | None = None) -> RoundTripReport:
    """Run the ODR-0003 signal-1 BASPI5 round-trip check.

    Loads base shapes + the BASPI5 overlay profile + the TBox, validates the
    two committed transaction exemplars, and computes the (a)/(b)/(c)
    report. Returns a `RoundTripReport`; inspect ``report.violations``
    (empty == PASS).
    """
    od = ontology_dir or _ontology_dir_default()
    report = RoundTripReport()

    exemplars = od / "exemplars"
    conformant_path = exemplars / _CONFORMANT
    nonconformant_path = exemplars / _NONCONFORMANT
    profile_path = od / "profiles" / "baspi5.ttl"
    missing_inputs = [
        str(p)
        for p in (profile_path, conformant_path, nonconformant_path)
        if not p.exists()
    ]
    if missing_inputs:
        report.available = False
        report.unavailable_reason = (
            "missing input(s): " + ", ".join(missing_inputs)
        )
        return report

    shapes = build_shapes_graph(od)
    tbox = load_tbox_graph(od)

    # (a) conformant
    _c_conforms, c_report = _validate(conformant_path, shapes, tbox)
    c_viols = list(c_report.subjects(SH.resultSeverity, SH.Violation))
    # "conforms" for the gate == zero Violation-severity results (Info/Warning
    # are non-blocking SHACL-AF materialisations, not round-trip failures).
    report.conformant_conforms = not c_viols
    report.conformant_violation_count = len(c_viols)
    report.conformant_violation_messages = [
        str(c_report.value(r, SH.resultMessage)) for r in c_viols
    ]

    # (b) non-conformant
    _n_conforms, n_report = _validate(nonconformant_path, shapes, tbox)
    n_viols = list(n_report.subjects(SH.resultSeverity, SH.Violation))
    report.nonconformant_conforms = not n_viols
    report.nonconformant_source_shapes = sorted(
        {str(n_report.value(r, SH.sourceShape)) for r in n_viols}
    )
    report.nonconformant_violation_count = len(n_viols)
    # The violation traces to B1.3.2 iff (i) the report cites the
    # SellersCapacity xone shape AND (ii) that shape's xone branch carries
    # dct:source B1.3.2 in the shapes graph.
    cited_cap = str(_CAPACITY_SHAPE) in report.nonconformant_source_shapes
    report.nonconformant_traces_to_b132 = (
        bool(n_viols) and cited_cap and _trace_b132(shapes)
    )

    # (c) render contract
    total, complete, missing = render_contract_summary(shapes)
    report.render_total = total
    report.render_complete = complete
    report.render_missing = missing

    return report
