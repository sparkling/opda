"""
Module shacl_parity_test.

Realises:
- ADR-0036 §Confirmation — the pyshacl↔Jena SHACL-1.2 parity gate. For each
  exemplar, validate under BOTH pyshacl (the incumbent, ADR-0014) and Apache
  Jena `jena-shacl` (the ADR-0036/0037 target) and assert the two engines
  agree on `sh:conforms`. This is the *precondition* to retiring pyshacl
  (ODR-0010 capability-floor discipline): demonstrate the floor before
  removing the incumbent.
- ADR-0037 — Jena is opda's sole RDF/SHACL/SPARQL toolchain; this gate is the
  transition mechanism, not a licence to keep two toolchains.

Jena access
===========
There is NO published Jena 6.x Fuseki Docker image (verified 2026-06-01;
apache/jena-fuseki has no Docker Hub repo, stain tops at 5.1.0, secoresearch
at 5.5.0). But Jena 6.1.0 is a real software release: this harness shells out
to the Apache Jena 6.1.0 *binary* `shacl` CLI. Point `OPDA_JENA_HOME` at an
unpacked apache-jena-6.1.0 distribution (the dir containing bin/shacl). If
Jena is not available the harness reports UNAVAILABLE and the caller decides
whether that blocks (the CLI exits non-zero so CI fails loudly rather than
skipping silently).

Fair-comparison normalisation
=============================
Both engines are handed the SAME effective graph. Two adjustments make the
comparison fair rather than an artefact of engine defaults:
  1. `owl:imports` triples are stripped from the shapes graph. The imported
     content (opda 1.0.0 + vocabularies) is ALREADY merged into the shapes
     graph, so the imports are redundant; pyshacl does not follow them by
     default, while Jena eagerly dereferences them over HTTP (and crashes on
     the unresolvable w3id IRIs). Stripping yields the identical asserted
     graph for both.
  2. RDFS pre-inference: pyshacl runs with `inference="rdfs"`. Jena's `shacl`
     CLI validates the data as-given; the exemplars carry their own rdf:type
     assertions, so for the foundation shapes the conformance verdict does
     not depend on RDFS-materialised parent types. Any divergence this
     introduces is itself a parity finding and is reported, not hidden.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from pyshacl import validate as _pyshacl_validate
from rdflib import Graph
from rdflib.namespace import OWL

from opda_gen.emitters.exemplar_reports import (
    _build_merged_shapes_graph,
    _exemplar_files,
    _ontology_root,
)


@dataclass
class ParityResult:
    """One exemplar's two-engine verdict."""

    name: str
    pyshacl_conforms: bool | None = None
    jena_conforms: bool | None = None
    agree: bool = False
    note: str = ""


@dataclass
class ParityReport:
    available: bool
    unavailable_reason: str = ""
    results: list[ParityResult] = field(default_factory=list)
    jena_home: str = ""

    @property
    def divergences(self) -> list[ParityResult]:
        return [r for r in self.results if not r.agree]


def _resolve_jena_shacl() -> Path | None:
    """Locate the Jena `shacl` CLI. Honours OPDA_JENA_HOME, then PATH."""
    home = os.environ.get("OPDA_JENA_HOME")
    if home:
        cand = Path(home) / "bin" / "shacl"
        if cand.exists():
            return cand
    on_path = shutil.which("shacl")
    return Path(on_path) if on_path else None


def _strip_imports(shapes: Graph) -> Graph:
    """Return a copy of the shapes graph with all owl:imports triples
    removed (the imported content is already merged in)."""
    out = Graph()
    for s, p, o in shapes:
        if p == OWL.imports:
            continue
        out.add((s, p, o))
    for prefix, ns in shapes.namespaces():
        out.bind(prefix, ns)
    return out


def _pyshacl_conforms(shapes: Graph, data_path: Path) -> bool:
    data = Graph()
    data.parse(str(data_path), format="turtle")
    conforms, _report, _text = _pyshacl_validate(
        data,
        shacl_graph=shapes,
        inference="rdfs",
        advanced=True,
        debug=False,
    )
    return bool(conforms)


# Jena's --text report ends with a "conforms"/"does not conform" summary; the
# Turtle report carries `sh:conforms true|false`. We parse stdout for either.
_CONFORMS_RE = re.compile(r"sh:conforms\s+(true|false)", re.IGNORECASE)


def _jena_conforms(
    shacl_cli: Path, shapes_path: Path, data_path: Path
) -> tuple[bool | None, str]:
    """Run Jena `shacl validate`; return (conforms|None, note).

    None signals Jena could not produce a verdict (e.g. a SHACL-SPARQL
    parse failure) — a real parity finding, surfaced in the note.
    """
    env = dict(os.environ)
    env.setdefault("JENA_HOME", str(shacl_cli.parent.parent))
    proc = subprocess.run(
        [str(shacl_cli), "validate", "--shapes", str(shapes_path), "--data", str(data_path)],
        capture_output=True,
        text=True,
        env=env,
    )
    out = proc.stdout
    # An empty report graph with no result triples = conformant.
    m = _CONFORMS_RE.search(out)
    if m:
        return m.group(1).lower() == "true", ""
    # No conforms triple in the Turtle report: a report with zero
    # sh:ValidationResult is a conformant verdict in Jena's serialisation.
    if proc.returncode == 0 and "sh:result" not in out and "ValidationResult" not in out:
        return True, "no sh:result → conformant"
    if proc.returncode == 0 and ("sh:result" in out or "ValidationResult" in out):
        return False, "sh:result present → non-conformant"
    # Non-zero exit: extract the salient error (skip the Bad-IRI warning spam).
    err_lines = [
        ln for ln in proc.stderr.splitlines()
        if "Bad IRI" not in ln and ln.strip()
    ]
    salient = next(
        (ln for ln in err_lines if "Exception" in ln or "Error" in ln),
        err_lines[0] if err_lines else f"exit {proc.returncode}",
    )
    return None, f"Jena no verdict: {salient.strip()}"


def run(ontology_dir: Path | None = None) -> ParityReport:
    """Validate every exemplar under pyshacl and Jena; compare verdicts."""
    ontology_dir = ontology_dir or _ontology_root()
    shacl_cli = _resolve_jena_shacl()
    if shacl_cli is None:
        return ParityReport(
            available=False,
            unavailable_reason=(
                "Jena `shacl` CLI not found — set OPDA_JENA_HOME to an "
                "unpacked apache-jena-6.1.0 distribution (no Jena 6.x Docker "
                "image is published; use the binary)"
            ),
        )

    shapes = _strip_imports(_build_merged_shapes_graph(ontology_dir))
    report = ParityReport(available=True, jena_home=str(shacl_cli.parent.parent))

    with tempfile.TemporaryDirectory() as tmp:
        shapes_path = Path(tmp) / "shapes.ttl"
        shapes.serialize(destination=str(shapes_path), format="turtle")

        for exemplar in _exemplar_files(ontology_dir / "exemplars"):
            r = ParityResult(name=exemplar.stem)
            r.pyshacl_conforms = _pyshacl_conforms(shapes, exemplar)
            r.jena_conforms, r.note = _jena_conforms(
                shacl_cli, shapes_path, exemplar
            )
            r.agree = (
                r.jena_conforms is not None
                and r.pyshacl_conforms == r.jena_conforms
            )
            report.results.append(r)

    return report
