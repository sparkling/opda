"""
Module category_g_coverage_test.

Realises:
- ADR-0031 work-items 2 & 5 — the curated Category-G walk's HONEST completion
  gate. ODR-0022 re-scoped the descriptive import so that only Category G (the
  188 candidate names) receives per-leaf curation; this gate measures how much
  of that walk has actually landed: every candidate-G leaf is either MINTED as
  an `opda:` term (local-name match in the corpus) or COLLAPSED into a shared
  property (recorded in `inputs/category_g_curation`). Uncovered leaves are the
  walk's remaining work — reported by name, never silently omitted (ADR-0028
  totality assertion; ODR-0022 §5 residue discipline).

Distinct from `descriptive_roundtrip_test` (gate G3): that gate measures whether
the emitted SHACL *profiles* round-trip their form-question leaves (a property
of the BASPI5 overlay — the one non-thin profile). THIS gate measures TBox
candidate-G *emission coverage*. The two are orthogonal: a profile can
round-trip cleanly while most candidate-G leaves remain unemitted, which is
exactly the state the curated walk starts from (the conflation of the two was
the 2026-05-31 over-claim this gate exists to prevent).

Boundary: test/CI infrastructure only. Reads the candidate-G name set from the
categoriser (`inputs/leaf_categoriser` — reproducible, no dependency on the
gitignored binning artefact) and the emitted module TTLs. Mints no IRIs, emits
no TTL, re-pins no byte-identity. When the (gitignored) canonical data
dictionary is absent — e.g. a CI checkout that does not carry it —
`candidate_g_names()` returns None and `run()` reports an `available=False`
state so the caller skips rather than false-failing.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL, RDF

from opda_gen.inputs.category_g_curation import COLLAPSED


OPDA = Namespace("https://opda.org.uk/pdtf/")

# rdf:type objects that count as a candidate-G leaf being "minted": a property
# (the overwhelming majority) or a class (a Q4a promotion). SKOS concepts /
# schemes are deliberately EXCLUDED — a scheme is a leaf's value-space, not the
# leaf's own emission; the leaf is covered by the property that ranges over it.
_EMITTED_TYPES = frozenset(
    {
        OWL.Class,
        OWL.DatatypeProperty,
        OWL.ObjectProperty,
        OWL.AnnotationProperty,
        RDF.Property,
    }
)


def candidate_g_names(data_dictionary: Path | None = None) -> tuple[str, ...] | None:
    """The candidate Category-G leaf names (ODR-0022 gate G1), via the categoriser.

    Returns None when the (gitignored) canonical data dictionary is absent — so
    a checkout without it (CI) skips rather than false-failing. Reproducible:
    derives the set from the categoriser, never from the gitignored
    `descriptive-category-binning.json` build artefact.
    """
    from opda_gen.inputs import leaf_categoriser as lc

    dd = data_dictionary or lc._default_data_dictionary()
    if not dd.exists():
        return None
    report = lc.categorise_all(lc.load_records(dd))
    return report.candidate_g_names


def _module_ttls(ontology_dir: Path) -> list[Path]:
    """Top-level module TTLs (the same enumeration the dup-declaration gate
    uses): the per-module class/property files. Subdirectories (`profiles/`,
    `exemplars/`, `derived/`) hold references/ABox/composed output, not
    term declarations, so they are skipped."""
    return sorted(p for p in ontology_dir.glob("*.ttl") if p.is_file())


def emitted_opda_local_names(ontology_dir: Path) -> set[str]:
    """Local names of every `opda:` term *declared* (subject of a counted
    `rdf:type`) across the module TTLs — the set a candidate-G leaf name is
    matched against to decide it has been minted."""
    opda_ns = str(OPDA)
    names: set[str] = set()
    for ttl in _module_ttls(ontology_dir):
        graph = Graph()
        graph.parse(str(ttl), format="turtle")
        for subj, _p, obj in graph.triples((None, RDF.type, None)):
            if (
                isinstance(subj, URIRef)
                and str(subj).startswith(opda_ns)
                and obj in _EMITTED_TYPES
            ):
                names.add(str(subj)[len(opda_ns):])
    return names


@dataclass
class CoverageReport:
    """Candidate-G walk coverage. `is_complete` (no uncovered, no broken
    collapse) is the state in which `ci-category-g-coverage --strict` PASSES."""

    # False when the canonical data dictionary is absent (categoriser can't run).
    available: bool = True
    candidate_total: int = 0
    # candidate-G names matched to an emitted opda: term by local name.
    minted: set[str] = field(default_factory=set)
    # candidate-G names collapsed into a shared property (name -> target local).
    collapsed: dict[str, str] = field(default_factory=dict)
    # candidate-G names neither minted nor collapsed — the walk's remaining work.
    uncovered: set[str] = field(default_factory=set)
    # collapse dispositions whose target term is NOT emitted (a broken register).
    broken_collapse: dict[str, str] = field(default_factory=dict)

    @property
    def covered(self) -> int:
        return len(self.minted) + len(self.collapsed)

    @property
    def violations(self) -> list[str]:
        """The hard gate (under --strict): empty == every candidate-G leaf
        emitted-or-collapsed with a sound disposition."""
        out: list[str] = []
        for name in sorted(self.uncovered):
            out.append(
                f"candidate-G leaf '{name}' is not yet emitted or collapsed "
                "(curated walk incomplete)"
            )
        for name, target in sorted(self.broken_collapse.items()):
            out.append(
                f"candidate-G leaf '{name}' collapses to opda:{target}, but "
                "that term is not emitted (broken disposition register)"
            )
        return out

    @property
    def is_complete(self) -> bool:
        return self.available and not self.uncovered and not self.broken_collapse


def build_coverage_report(
    names: tuple[str, ...] | None, emitted: set[str]
) -> CoverageReport:
    """Pure coverage computation over a candidate-G name set + the emitted
    local-name set. Separated from `run()` so it is unit-testable without a
    corpus on disk."""
    if names is None:
        return CoverageReport(available=False)
    report = CoverageReport(candidate_total=len(names))
    for name in set(names):
        if name in emitted:
            report.minted.add(name)
        elif name in COLLAPSED:
            target = COLLAPSED[name]
            report.collapsed[name] = target
            if target not in emitted:
                report.broken_collapse[name] = target
        else:
            report.uncovered.add(name)
    return report


def run(ontology_dir: Path) -> CoverageReport:
    """Run the candidate-G walk coverage check against an emission directory.

    Returns a `CoverageReport`. When the canonical data dictionary is absent
    the report carries `available=False` (the caller skips). The caller
    inspects `report.violations` (the hard gate, under --strict) and the
    minted/collapsed/uncovered counts (the progress tracker).
    """
    names = candidate_g_names()
    if names is None:
        return CoverageReport(available=False)
    emitted = emitted_opda_local_names(ontology_dir)
    return build_coverage_report(names, emitted)
