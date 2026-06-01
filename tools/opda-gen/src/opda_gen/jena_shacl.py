"""
Apache Jena 6.1.0 SHACL validation — opda's sole SHACL engine (ADR-0036/0037).

Replaces pyshacl. Shells out to the Jena ``shacl`` CLI from the Apache Jena
6.1.0 binary distribution and parses its Turtle ``sh:ValidationReport`` into an
rdflib graph. The distribution is resolved from ``OPDA_JENA_HOME`` (the dir
containing ``bin/shacl``), then ``PATH``, else auto-provisioned (downloaded +
sha512-verified) into ``.jena/`` at the repo root — so dev and CI need only a
JDK 17+ and network access, mirroring scripts/build-with-data.mjs for Fuseki.

No Jena 6.x Fuseki *container* is published (verified 2026-06-01), but Jena
6.1.0 is a real software release; this uses the binary ``shacl`` CLI directly.
"""

from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import tarfile
import tempfile
from pathlib import Path

from rdflib import Graph, URIRef
from rdflib.namespace import OWL

JENA_VERSION = "6.1.0"
_TARBALL = f"apache-jena-{JENA_VERSION}.tar.gz"
_DOWNLOAD = f"https://archive.apache.org/dist/jena/binaries/{_TARBALL}"
_SHA512 = (
    "6aa4bb8eeb41c0d05c30f3c91a7eb065bd867af00a6a95fd10f7873b90271c62"
    "734b28aebd7ae648d5be6b1e185c9037df90633c471a68b791b19026fd03ea3a"
)

_SH = "http://www.w3.org/ns/shacl#"


def _repo_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent
    raise RuntimeError("could not resolve OPDA repo root")


def _provision(cache_dir: Path) -> None:
    """Download + verify + unpack the Apache Jena 6.1.0 dist into cache_dir."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    tarball = cache_dir / _TARBALL
    print(f"[jena] provisioning Apache Jena {JENA_VERSION} (one-time download)")
    # Use curl rather than urllib: it uses the system CA bundle reliably on both
    # macOS (Python.framework ships none) and the ubuntu CI runner.
    subprocess.run(
        ["curl", "-fsSL", "-o", str(tarball), _DOWNLOAD],
        check=True,
    )
    digest = hashlib.sha512(tarball.read_bytes()).hexdigest()
    if digest != _SHA512:
        tarball.unlink(missing_ok=True)
        raise RuntimeError(f"Jena {_TARBALL} sha512 mismatch — refusing to use")
    with tarfile.open(tarball) as tar:
        tar.extractall(cache_dir, filter="data")
    tarball.unlink(missing_ok=True)
    (cache_dir / f"apache-jena-{JENA_VERSION}" / "bin" / "shacl").chmod(0o755)


def resolve_jena_shacl() -> Path:
    """Locate the Jena ``shacl`` CLI; auto-provision if absent.

    Resolution order: ``OPDA_JENA_HOME`` → ``PATH`` → cached ``.jena/`` →
    download. Raises if a JDK-runnable dist cannot be obtained.
    """
    home = os.environ.get("OPDA_JENA_HOME")
    if home:
        cand = Path(home) / "bin" / "shacl"
        if cand.exists():
            return cand
        raise RuntimeError(f"OPDA_JENA_HOME set but {cand} not found")

    on_path = shutil.which("shacl")
    if on_path:
        return Path(on_path)

    cache = _repo_root() / ".jena"
    cand = cache / f"apache-jena-{JENA_VERSION}" / "bin" / "shacl"
    if not cand.exists():
        _provision(cache)
    if not cand.exists():
        raise RuntimeError("Jena shacl CLI unavailable after provisioning")
    return cand


def strip_imports(shapes: Graph) -> Graph:
    """Return a copy of the shapes graph without ``owl:imports`` triples.

    The imported content (opda 1.0.0 + vocabularies) is already merged into
    the shapes graph, so the imports are redundant; Jena would otherwise
    eagerly dereference the unresolvable w3id IRIs over HTTP and fail.
    """
    out = Graph()
    for s, p, o in shapes:
        if p == OWL.imports:
            continue
        out.add((s, p, o))
    for prefix, ns in shapes.namespaces():
        out.bind(prefix, ns)
    return out


def validate(shapes_graph: Graph, data: Path | Graph) -> tuple[bool, Graph]:
    """Validate ``data`` against ``shapes_graph`` with Jena ``shacl``.

    ``data`` is an exemplar TTL path, or a pre-merged rdflib ``Graph`` (e.g.
    instance data unioned with a TBox so class types are present — Jena's CLI
    does no RDFS pre-inference, so the caller materialises what it needs).

    Returns ``(conforms, report_graph)`` where report_graph is the parsed
    ``sh:ValidationReport``. Raises on a Jena parse/execution failure (so CI
    fails loudly rather than silently passing).
    """
    cli = resolve_jena_shacl()
    env = dict(os.environ)
    env.setdefault("JENA_HOME", str(cli.parent.parent))
    with tempfile.TemporaryDirectory() as tmp:
        shapes_path = Path(tmp) / "shapes.ttl"
        strip_imports(shapes_graph).serialize(destination=str(shapes_path), format="turtle")
        if isinstance(data, Graph):
            data_path = Path(tmp) / "data.ttl"
            data.serialize(destination=str(data_path), format="turtle")
        else:
            data_path = data
        proc = subprocess.run(
            [str(cli), "validate", "--shapes", str(shapes_path), "--data", str(data_path)],
            capture_output=True,
            text=True,
            env=env,
        )
    if proc.returncode != 0:
        err = [ln for ln in proc.stderr.splitlines() if "Bad IRI" not in ln and ln.strip()]
        raise RuntimeError(f"Jena shacl validate failed: {' '.join(err[-3:]) or proc.returncode}")

    report = Graph()
    report.parse(data=proc.stdout, format="turtle")
    conforms_objs = list(report.objects(predicate=URIRef(_SH + "conforms")))
    if conforms_objs:
        conforms = bool(conforms_objs[0].toPython())
    else:
        # A report with no sh:result is conformant.
        conforms = not any(report.subject_objects(URIRef(_SH + "result")))
    return conforms, report
