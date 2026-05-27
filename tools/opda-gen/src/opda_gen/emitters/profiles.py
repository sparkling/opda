"""
Module profiles.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `emit-profile <overlay>` subcommand surface.
- ADR-0013 — Overlay profile emission (BASPI5 first, TA6 / NTS / LPE1
  incrementally). ADR-0008 ships the stub; ADR-0013 fills in the body.
- ODR-0010 — overlay profile mechanism (full ratified `## Rules`).
"""

from __future__ import annotations

from pathlib import Path


def emit(overlay: str, output_dir: Path) -> Path:
    raise NotImplementedError(
        f"Overlay profile emission for {overlay!r} is realised in ADR-0013 "
        "(Overlay profile emission)."
    )
