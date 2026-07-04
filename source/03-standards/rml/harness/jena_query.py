"""
Thin wrapper around Apache Jena's offline SPARQL engine (`arq`) — opda's sole
RDF query path (ADR-0037: pyshacl/rdflib PROHIBITED from opda's parse/
serialise/validate/infer/query paths). Mirrors the shell-out pattern already
used by opda_gen.jena_shacl for SHACL validation, applied to SPARQL SELECT.

No rdflib anywhere in this module: `arq` does the actual parse + query;
results come back as CSV and are read with the stdlib `csv` module.
"""
from __future__ import annotations

import csv
import io
import subprocess
from pathlib import Path

REPO_ROOT = Path("/Users/henrik/source/opda")
ARQ = REPO_ROOT / ".jena/apache-jena-6.1.0/bin/arq"


def sparql_select(query: str, *data_files: Path) -> list[dict[str, str]]:
    """Run a SPARQL SELECT against one or more RDF files via Jena's `arq`.

    Returns one dict per result row, string-valued (CSV has no datatype
    info), unbound variables as absent/empty keys. IRIs come back bare
    (no <>); literals come back as their lexical form only.
    """
    if not ARQ.exists():
        raise RuntimeError(f"arq not found at {ARQ} — is Jena 6.1.0 provisioned under .jena/?")
    args = [str(ARQ)]
    for f in data_files:
        args += ["--data", str(f)]
    args += ["--query", "/dev/stdin", "--results", "CSV"]
    proc = subprocess.run(args, input=query, capture_output=True, text=True, timeout=60)
    if proc.returncode != 0:
        raise RuntimeError(f"arq failed (exit {proc.returncode}):\n{proc.stderr}")
    reader = csv.DictReader(io.StringIO(proc.stdout))
    return list(reader)
