"""
Module annotations.

Realises (interface only at ADR-0008):
- ADR-0008 §"Repository structure" — `emitters/annotations.py` stub.
- ADR-0012 — DPV annotation graph emission. ADR-0008 ships the stub;
  ADR-0012 fills in the body.
- ODR-0010 §Q1–Q6 — annotation-graph contract realised here.
"""

from __future__ import annotations

from pathlib import Path


def emit(output_dir: Path) -> Path:
    raise NotImplementedError(
        "DPV annotation emission is realised in ADR-0012 "
        "(SHACL + DPV annotation emission)."
    )
