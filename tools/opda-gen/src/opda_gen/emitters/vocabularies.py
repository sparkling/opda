"""
Module vocabularies.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `emit-vocabularies` subcommand surface.
- ADR-0010 — SKOS vocabulary emission (concept schemes + ~160 enum leaves
  with UFO meta-category). ADR-0008 ships the stub; ADR-0010 fills in the
  body.
- ODR-0011 — Enumeration vocabularies (ratified `## Rules`).
"""

from __future__ import annotations

from pathlib import Path


def emit(output_dir: Path) -> Path:
    raise NotImplementedError(
        "SKOS vocabulary emission is realised in ADR-0010 "
        "(SKOS vocabulary emission)."
    )
