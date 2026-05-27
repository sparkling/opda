"""
Module composer.

Realises (interface only at ADR-0008):
- ADR-0008 §"CLI design" — `compose` subcommand surface.
- ADR-0013 (build-step) — derived consumer profile composition
  (`opda-validation.ttl` = classes ⊕ shapes; `opda-ui.ttl` = classes ⊕ shapes
  ⊕ annotations; `opda-inference.ttl` = classes alone). ADR-0008 ships the
  stub; ADR-0013 fills in the body.
- ODR-0004 §3a — derived consumer profile contract.
"""

from __future__ import annotations

from pathlib import Path


def compose(output_dir: Path) -> Path:
    raise NotImplementedError(
        "Derived consumer profile composition is realised in ADR-0013 "
        "(build-step composition)."
    )
