"""
Module cli.

Realises:
- ADR-0008 §"CLI design" — Click-based subcommand surface (`emit`,
  `emit-foundation`, `emit-vocabularies`, `emit-module`, `emit-shapes`,
  `emit-profile`, `compose`, `ci-byte-identity`, `ci-three-graph`,
  `validate-exemplar`).
- ADR-0008 §"Confirmation" #2 — `opda-gen --version` returns package version
  plus git SHA.
- ADR-0009 §"Confirmation" #1 — `emit-foundation` writes the four
  foundation TTLs to `source/03-standards/ontology/` (default) or to a
  user-supplied output directory.
- ADR-0009 §"Confirmation" #2 — second-run regeneration is byte-identical;
  `emit` umbrella calls `emit-foundation` first so the byte-identity diff
  step exercises a real corpus from Phase 1.
- ADR-0007 §"Architecture" — generator entry point in the data flow.
- ODR-0004 §6a — generator-first contract surface exposed to CI.

Bodies that depend on later ADRs raise `NotImplementedError` and name the
realising ADR explicitly per programme plan §9.2 completeness discipline.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import click

from opda_gen import __version__


def _git_sha() -> str:
    """Resolve the short git SHA of the current HEAD.

    Returns the literal string ``"unknown"`` when not inside a git
    working tree or when git is not on PATH. Pure side-effect-free
    invocation; never raises.
    """
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            check=False,
            text=True,
            cwd=Path(__file__).resolve().parent,
        )
        if result.returncode == 0:
            return result.stdout.strip() or "unknown"
    except (FileNotFoundError, OSError):
        pass
    return "unknown"


def _print_version(ctx: click.Context, _param: click.Parameter, value: bool) -> None:
    """Click callback realising ADR-0008 §Confirmation #2."""
    if not value or ctx.resilient_parsing:
        return
    click.echo(f"opda-gen {__version__} ({_git_sha()})")
    ctx.exit()


def _default_ontology_dir() -> Path:
    """Resolve the default output directory ``source/03-standards/ontology/``.

    Walks upward from this module looking for a directory that contains both
    ``.git`` and ``source/03-standards/`` — the OPDA repo root. Falls back
    to the current working directory if no match is found.
    """
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "03-standards").exists():
            return parent / "source" / "03-standards" / "ontology"
    return Path.cwd() / "source" / "03-standards" / "ontology"


@click.group(
    help="OPDA ontology generator. Realises ADR-0007 spec per ADR-0008 infrastructure.",
)
@click.option(
    "--version",
    is_flag=True,
    is_eager=True,
    expose_value=False,
    callback=_print_version,
    help="Show generator version + git SHA.",
)
def main() -> None:
    """Top-level Click group for the opda-gen CLI."""


@main.command(name="emit")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for the regenerated corpus. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit(output: Path | None) -> None:
    """Emit the full ontology corpus (ADR-0007 §Architecture target).

    At Phase 1 (ADR-0009) the corpus consists of the four foundation TTLs.
    Subsequent phases (ADR-0010..0013) append vocabularies, module TBoxes,
    shapes + annotations, and overlay profiles. Each new phase extends this
    umbrella; intermediate phases raise `NotImplementedError` per the
    explicit-deferral discipline of programme plan §9.2.
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.foundation import emit_foundation as _emit_foundation

    written = _emit_foundation(target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-foundation")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for foundation TTLs. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_foundation(output: Path | None) -> None:
    """Emit the four foundation TTLs (Phase 1; ADR-0009).

    Writes: foundation.ttl, opda-classes.ttl, opda-shapes.ttl,
    opda-annotations.ttl. Output is produced by the canonical serialiser
    (ADR-0007); second-run regeneration is byte-identical (ADR-0009
    §Confirmation #2).
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.foundation import emit_foundation as _emit

    written = _emit(target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-vocabularies")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=True,
)
def emit_vocabularies(output: Path) -> None:
    """Emit SKOS schemes only (Phase 2)."""
    from opda_gen.emitters.vocabularies import emit as _emit

    _emit(output)


@main.command(name="emit-module")
@click.argument("name")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=True,
)
def emit_module(name: str, output: Path) -> None:
    """Emit one module .ttl (Phase 3)."""
    from opda_gen.emitters.classes import emit_module as _emit

    _emit(name, output)


@main.command(name="emit-shapes")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=True,
)
def emit_shapes(output: Path) -> None:
    """Emit shapes graph (Phase 4)."""
    from opda_gen.emitters.shapes import emit as _emit

    _emit(output)


@main.command(name="emit-profile")
@click.argument("overlay")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=True,
)
def emit_profile(overlay: str, output: Path) -> None:
    """Emit one overlay profile (Phase 5)."""
    from opda_gen.emitters.profiles import emit as _emit

    _emit(overlay, output)


@main.command(name="compose")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=True,
)
def compose(output: Path) -> None:
    """Build-step compose derived consumer profiles."""
    from opda_gen.composer import compose as _compose

    _compose(output)


@main.command(name="ci-byte-identity")
@click.option(
    "--reference",
    "-r",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Reference directory containing committed TTLs to diff against. "
        "Defaults to source/03-standards/ontology/ relative to the OPDA repo "
        "root."
    ),
)
def ci_byte_identity(reference: Path | None) -> None:
    """Run byte-identity check (regenerate + diff against committed)."""
    from opda_gen.ci.byte_identity import run

    target = reference if reference is not None else _default_ontology_dir()
    violations = run(target)
    if violations:
        for v in violations:
            click.echo(f"BYTE-IDENTITY VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo("byte-identity: PASS")


@main.command(name="ci-three-graph")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing opda-classes.ttl, opda-shapes.ttl, "
        "opda-annotations.ttl. Defaults to source/03-standards/ontology/ "
        "relative to the OPDA repo root."
    ),
)
def ci_three_graph(ontology_dir: Path | None) -> None:
    """Run ODR-0004 §3a five-part CI test against an emission directory."""
    from opda_gen.ci.three_graph_test import run_all

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    violations = run_all(target)
    if violations:
        for v in violations:
            click.echo(f"THREE-GRAPH VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo("three-graph CI: PASS (all 5 checks)")


@main.command(name="validate-exemplar")
@click.argument("path", type=click.Path(exists=True, dir_okay=False, path_type=Path))
def validate_exemplar(path: Path) -> None:
    """Run pyshacl against an exemplar; compare to expected-report."""
    raise NotImplementedError(
        "Exemplar regression harness is realised in ADR-0014 (BASPI5 round-trip MVP)."
    )


if __name__ == "__main__":
    main()
