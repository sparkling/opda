"""
Module shapes.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `emit-shapes` subcommand surface.
- ADR-0012 — SHACL shapes graph emission with severity tiers. ADR-0008 ships
  the stub; ADR-0012 fills in the body.
- ODR-0012 + ODR-0013 + ODR-0017 + ODR-0018 — the ratified `## Rules`
  this emitter realises.
"""

from __future__ import annotations

from pathlib import Path


def emit(output_dir: Path) -> Path:
    raise NotImplementedError(
        "SHACL shapes emission is realised in ADR-0012 "
        "(SHACL + DPV annotation emission)."
    )
