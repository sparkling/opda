"""
Module classes.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `emit-module <name>` subcommand surface.
- ADR-0011 — Module TBox emission (Property + Agent + Transaction + Claim +
  Address + Descriptive Attributes). ADR-0008 ships the stub; ADR-0011 fills
  in the body, including the A9 per-kind discipline output (UFO meta-category
  as `dct:source` + `skos:scopeNote` per ADR-0007 §"A9 per-kind discipline
  output").
- ODR-0005 + ODR-0006 + ODR-0007 + ODR-0008 + ODR-0009 + ODR-0015 + ODR-0017
  + ODR-0018 — the ratified `## Rules` corpus this emitter realises.
"""

from __future__ import annotations

from pathlib import Path


def emit_module(name: str, output_dir: Path) -> Path:
    raise NotImplementedError(
        f"Module class emission for {name!r} is realised in ADR-0011 "
        "(Module TBox emission)."
    )
