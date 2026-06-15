"""
Module cli.

Realises:
- ADR-0008 §"CLI design" — Click-based subcommand surface (`emit`,
  `emit-foundation`, `emit-vocabularies`, `emit-module`, `emit-shapes`,
  `emit-profile`, `compose`, `ci-byte-identity`, `ci-three-graph`,
  `ci-dup-declaration`, `validate-exemplar`).
- ADR-0008 §"Confirmation" #2 — `opda-gen --version` returns package version
  plus git SHA.
- ADR-0009 §"Confirmation" #1 — `emit-foundation` writes the four
  foundation TTLs to `source/03-standards/ontology/` (default) or to a
  user-supplied output directory.
- ADR-0009 §"Confirmation" #2 — second-run regeneration is byte-identical;
  `emit` umbrella calls `emit-foundation` first so the byte-identity diff
  step exercises a real corpus from Phase 1.
- ADR-0010 §"Confirmation" #1 — `emit-vocabularies` writes
  `opda-vocabularies.ttl` to the same output directory; the `emit` umbrella
  now also invokes it so the byte-identity diff covers the full Phase-2
  corpus.
- ADR-0010 §"Confirmation" #2 — `--output` for `emit-vocabularies` defaults
  to the same canonical ontology directory as `emit-foundation` so an ad
  hoc invocation regenerates the committed file in place.
- ADR-0011 §"Confirmation" #1 — `emit-module <name>` writes
  `opda-<name>.ttl` to the canonical ontology directory (default) or to
  a user-supplied output directory. Six modules accepted: property /
  agent / transaction / claim / governance / descriptive.
- ADR-0011 §"Module emission template" — the `emit` umbrella now also
  invokes `emit-all-modules` after foundation + vocabularies so the
  byte-identity diff covers the full Phase-3 corpus.
- ADR-0012 §Confirmation #1 — `emit-shapes` writes six per-module
  shape TTLs to the canonical ontology directory (default) or to a
  user-supplied output directory; `--module <name>` restricts emission
  to a single module. `emit-annotations` is the sibling subcommand for
  DPV annotation graphs. The `emit` umbrella now also invokes both so
  byte-identity diff covers the full Phase-4 corpus (4 foundation + 1
  vocabularies + 6 module classes + 6 module shapes + 6 module
  annotations = 23 files).
- ADR-0013 §Confirmation #1 — `emit-profile baspi5` writes
  `profiles/baspi5.ttl` to the canonical ontology directory (default).
  The `emit` umbrella now invokes each overlay profile after the
  modules/shapes/annotations so byte-identity diff covers the full
  Phase-5 corpus (Phase-4 plus 1 overlay profile = 24 files).
- ADR-0014 §"Exemplar regression layer" + §Confirmation #2 —
  `emit-exemplar-reports` writes the 15 `<stem>-expected-report.ttl`
  pairings to `source/03-standards/ontology/exemplars/`.
  `validate-exemplar` runs Apache Jena SHACL against a single exemplar and
  compares the actual report to the committed expected report (used
  by the per-exemplar matrix job in
  `.github/workflows/baspi5-round-trip.yml`).
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

    Phase 1 (ADR-0009) emits the four foundation TTLs; Phase 2 (ADR-0010)
    adds `opda-vocabularies.ttl`; Phase 3 (ADR-0011) adds the six
    per-module TBoxes (opda-property / agent / transaction / claim /
    governance / descriptive). All run sequentially under the `emit`
    umbrella so the byte-identity CI step exercises the whole committed
    corpus in one shot. Subsequent phases (ADR-0012..0013) extend this
    umbrella; intermediate phases raise `NotImplementedError` per the
    explicit-deferral discipline of programme plan §9.2.
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.annotations import (
        emit_annotations as _emit_annotations,
    )
    from opda_gen.emitters.classes import emit_all_modules as _emit_modules
    from opda_gen.emitters.contexts import emit_contexts as _emit_contexts
    from opda_gen.emitters.foundation import emit_foundation as _emit_foundation
    from opda_gen.emitters.profiles import (
        PROFILE_FILENAMES,
        emit_profile as _emit_profile,
    )
    from opda_gen.emitters.shapes import emit_shapes as _emit_shapes
    from opda_gen.emitters.vocabularies import (
        emit_vocabularies as _emit_vocabularies,
    )

    written: dict[Path, str] = {}
    written.update(_emit_foundation(target))
    written.update(_emit_vocabularies(target))
    written.update(_emit_contexts(target))
    written.update(_emit_modules(target))
    written.update(_emit_shapes(target))
    written.update(_emit_annotations(target))
    # Phase 5 (ADR-0013) — emit each overlay profile. BASPI5 only for now;
    # ADR-0013 §"Overlay catalogue" Phase 2-3 overlays land as separate
    # commits per the incremental sequencing in the ADR.
    for overlay in sorted(PROFILE_FILENAMES):
        written.update(_emit_profile(overlay, target))
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")
    # Phase 5 (ADR-0020) — emit collection-valid frontmatter to manual markdowns.
    from opda_gen.emitters.manual import _default_manual_dir
    from opda_gen.emitters.manual import emit_manual as _emit_manual

    manual_result = _emit_manual(_default_manual_dir())
    for path in sorted(manual_result.touched):
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
    required=False,
    default=None,
    help=(
        "Output directory for `opda-vocabularies.ttl`. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_vocabularies(output: Path | None) -> None:
    """Emit the SKOS vocabulary substrate (Phase 2; ADR-0010).

    Writes `opda-vocabularies.ttl` with the 16 first-batch SKOS Concept
    Schemes (per ADR-0010 §"Scheme catalogue"). Output is produced by
    the canonical serialiser; second-run regeneration is byte-identical.
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.vocabularies import emit_vocabularies as _emit

    written = _emit(target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-contexts")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for `opda-contexts.ttl`. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_contexts(output: Path | None) -> None:
    """Emit the bounded-context scheme (ADR-0026; ODR-0019/0020).

    Writes `opda-contexts.ttl` with `opda:BoundedContextScheme` + the six
    industry context concepts + the `opda:consumesFrom` annotation
    property. Output is produced by the canonical serialiser; second-run
    regeneration is byte-identical.
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.contexts import emit_contexts as _emit

    written = _emit(target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-module")
@click.argument("name")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for the regenerated module TTL. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_module(name: str, output: Path | None) -> None:
    """Emit one module .ttl (Phase 3; ADR-0011).

    Valid module names: property, agent, transaction, claim, governance,
    descriptive. Output goes to the canonical ontology directory unless
    `--output` overrides it.
    """
    from opda_gen.emitters.classes import emit_module as _emit

    target = output if output is not None else _default_ontology_dir()
    written = _emit(name, target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-shapes")
@click.option(
    "--module",
    "-m",
    type=str,
    required=False,
    default=None,
    help=(
        "Name of a single module to emit (property, agent, transaction, "
        "claim, governance, descriptive). If omitted, emits all six "
        "per-module shape files."
    ),
)
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for shape TTLs. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_shapes(module: str | None, output: Path | None) -> None:
    """Emit per-module SHACL shape TTLs (Phase 4; ADR-0012).

    Writes one or six `opda-<module>-shapes.ttl` files containing per-
    Kind identity-key shapes, IC-breach (anti-pattern) shapes, and
    SHACL-AF non-blocking quality rules. The foundation shapes graph
    (`opda-shapes.ttl`) is emitted separately by `emit-foundation`
    (which now carries the three-rule interface-contract meta-shapes
    + Cat 3 / Cat 5 meta-shapes per ADR-0012).
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.shapes import emit_shapes as _emit

    written = _emit(target, module=module)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-annotations")
@click.option(
    "--module",
    "-m",
    type=str,
    required=False,
    default=None,
    help=(
        "Name of a single module to emit (property, agent, transaction, "
        "claim, governance, descriptive). If omitted, emits all six "
        "per-module annotation files."
    ),
)
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for annotation TTLs. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def emit_annotations(module: str | None, output: Path | None) -> None:
    """Emit per-module DPV annotation TTLs (Phase 4; ADR-0012).

    Writes one or six `opda-<module>-annotations.ttl` files containing
    class-level DPV baselines + variant-conditional refinement maps
    per ODR-0018. Reference-not-import for DPV: DPV terms cited via
    `dct:references` and URIRef triples; no `owl:imports
    <https://w3id.org/dpv/pd>`.
    """
    target = output if output is not None else _default_ontology_dir()
    from opda_gen.emitters.annotations import emit_annotations as _emit

    written = _emit(target, module=module)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-profile")
@click.argument("overlay")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output directory for the regenerated overlay profile. The file "
        "is written under `<output>/profiles/<overlay>.ttl`. Defaults "
        "to source/03-standards/ontology/ relative to the OPDA repo "
        "root."
    ),
)
def emit_profile(overlay: str, output: Path | None) -> None:
    """Emit one overlay profile (Phase 5 — ADR-0013).

    Supported overlays: baspi5. Other overlays (TA6, NTS, LPE1, CON29R,
    etc.) follow incrementally per the catalogue in ADR-0013
    §"Overlay catalogue (initial)" Phase 2-3.
    """
    from opda_gen.emitters.profiles import emit_profile as _emit

    target = output if output is not None else _default_ontology_dir()
    written = _emit(overlay, target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="emit-manual")
@click.option(
    "--output",
    "-o",
    type=click.Path(file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Root of the manual directory tree. Defaults to docs/manual/ "
        "relative to the OPDA repo root."
    ),
)
@click.option(
    "--tier",
    "-t",
    type=str,
    required=False,
    default=None,
    help=(
        "Restrict emission to a single tier "
        "(concept / logical / physical-database / physical-ontology). "
        "If omitted, all four tiers are processed."
    ),
)
def emit_manual(output: Path | None, tier: str | None) -> None:
    """Emit collection-valid frontmatter to manual markdowns (ADR-0020).

    Walks docs/manual/ (or --output dir) for in-scope .md files and
    inserts or merges YAML frontmatter matching the ADR-0016 Zod schema.
    Tier READMEs, module READMEs, and the umbrella README / VALIDATION-REPORT
    are skipped (G19a option c — preserve Phase 4 editorial content).
    Second run is idempotent: produces zero changes if frontmatter is already
    complete.
    """
    from opda_gen.emitters.manual import _default_manual_dir
    from opda_gen.emitters.manual import emit_manual as _emit

    target = output if output is not None else _default_manual_dir()
    result = _emit(target, tier=tier)
    for path in sorted(result.touched):
        click.echo(f"emitted: {path}")
    click.echo(
        f"emit-manual: {result.touched_count} files updated, "
        f"{result.skipped_count} files skipped."
    )


@main.command(name="categorise-leaves")
@click.option(
    "--output",
    "-o",
    type=click.Path(dir_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Output path for the binning report. Defaults to "
        "source/00-deliverables/semantic-models/descriptive-category-binning.json "
        "relative to the OPDA repo root."
    ),
)
def categorise_leaves(output: Path | None) -> None:
    """Bin annotated base descriptive leaves into categories A–G (ODR-0022 §G1).

    Runs the path-aware classifier over `data-dictionary-canonical.json` and
    writes `descriptive-category-binning.json`: per-category counts, the
    candidate Category-G distinct-name set (the WG curation target), the
    residue register, and the full per-leaf assignment. Mints no IRIs and
    emits no TTL — this command produces data only (ODR-0022 §Rules boundary).
    """
    import json

    from opda_gen.inputs import leaf_categoriser as _lc

    data_path = _lc._default_data_dictionary()
    out_path = output if output is not None else _lc._default_output()
    report = _lc.categorise_all(_lc.load_records(data_path))
    out_path.write_text(
        json.dumps(_lc.report_to_dict(report), indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    counts = report.counts
    line = "  ".join(f"{c}={counts[c]}" for c in "ABCDEFG")
    click.echo(f"categorised {sum(counts.values())} annotated base leaves: {line}")
    click.echo(
        f"candidate Category-G distinct names: {len(report.candidate_g_names)}"
    )
    click.echo(f"residue register: {len(report.residue)} leaves")
    click.echo(f"emitted: {out_path}")


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
    click.echo("three-graph CI: PASS (all 7 checks)")


@main.command(name="ci-dup-declaration")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the module TTLs (foundation + vocabularies + "
        "contexts + per-module class/shape/annotation files). Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def ci_dup_declaration(ontology_dir: Path | None) -> None:
    """Fail if any `opda:` term is declared in more than one module TTL.

    Each `opda:` term that is the subject of a defining `rdf:type` (owl:Class,
    owl:Datatype/Object/AnnotationProperty, rdf:Property, owl:NamedIndividual,
    skos:Concept, skos:ConceptScheme) MUST be so typed in exactly one module.
    Guards against the `opda:riskIndicator` regression (declared in both
    opda-property.ttl and opda-descriptive.ttl with conflicting rdfs:domain).
    """
    from opda_gen.ci.dup_declaration_test import run_all

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    violations = run_all(target)
    if violations:
        for v in violations:
            click.echo(f"DUP-DECLARATION VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo("dup-declaration CI: PASS (every opda: term in one module)")


@main.command(name="ci-profile-contract")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the foundation/module TTLs + profiles/. "
        "Defaults to source/03-standards/ontology/ relative to the OPDA "
        "repo root."
    ),
)
def ci_profile_contract(ontology_dir: Path | None) -> None:
    """Run the ADR-0013 three-rule interface contract checks.

    Three rules per overlay profile: sh:in semantics; sh:Violation
    floor; no-identity-override gate. Failure on any rule blocks commit.
    """
    from opda_gen.ci.profile_contract_test import run_all

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    violations = run_all(target)
    if violations:
        for v in violations:
            click.echo(f"PROFILE-CONTRACT VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo("profile contract CI: PASS (all 3 rules)")


@main.command(name="ci-descriptive-roundtrip")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the overlay profiles/ + opda-vocabularies.ttl. "
        "Defaults to source/03-standards/ontology/ relative to the OPDA repo "
        "root."
    ),
)
@click.option(
    "--strict",
    is_flag=True,
    default=False,
    help=(
        "Fail (exit 1) on any coverage gap. Default is report-only: gaps are "
        "printed but the command exits 0 while the descriptive walk + per-form "
        "leaf enumeration are still deferred (ADR-0028/0029, profiles emitted "
        "thin)."
    ),
)
def ci_descriptive_roundtrip(ontology_dir: Path | None, strict: bool) -> None:
    """Run ODR-0022 §2 gate G3 — the descriptive-layer round-trip coverage
    check.

    Asserts every form-question leaf is the `dct:source` of exactly one
    profile property-shape `sh:path` (no leaf unaddressable, none
    doubly-bound). While the descriptive walk is deferred the profiles are
    emitted thin, so this reports a coverage REPORT and (without `--strict`)
    exits 0. With `--strict` it gates on `report.violations`.
    """
    from opda_gen.ci.descriptive_roundtrip_test import run

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    report = run(target)
    click.echo(
        f"descriptive round-trip (G3): {len(report.addressable)} addressable, "
        f"{len(report.unaddressable)} unaddressable, "
        f"{len(report.doubly_bound)} doubly-bound "
        f"of {len(report.form_leaves)} form-question leaves."
    )
    for gap in report.gaps:
        click.echo(f"  COVERAGE GAP: {gap}")
    if strict and report.violations:
        for v in report.violations:
            click.echo(f"DESCRIPTIVE-ROUNDTRIP VIOLATION: {v}", err=True)
        sys.exit(1)
    if not report.gaps:
        click.echo("descriptive round-trip CI: PASS (full coverage)")


@main.command(name="ci-category-g-coverage")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the emitted module TTLs. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
@click.option(
    "--strict",
    is_flag=True,
    default=False,
    help=(
        "Fail (exit 1) on any uncovered candidate-G leaf or broken collapse "
        "disposition. Default is report-only: prints coverage and exits 0 "
        "while the curated Category-G walk is in progress (ADR-0031)."
    ),
)
def ci_category_g_coverage(ontology_dir: Path | None, strict: bool) -> None:
    """Run the ADR-0031 candidate-G walk coverage gate.

    Reports how much of the curated Category-G walk has landed: every
    candidate-G leaf (ODR-0022 gate G1) is either minted as an `opda:` term or
    collapsed into a shared property; uncovered leaves are the remaining work.
    Local-only: needs the (gitignored) canonical data dictionary, so on a CI
    checkout without it the command reports UNAVAILABLE and exits 0. Orthogonal
    to ci-descriptive-roundtrip (which gates SHACL profile round-trip, not TBox
    emission coverage).
    """
    from opda_gen.ci.category_g_coverage_test import run

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    report = run(target)
    if not report.available:
        click.echo(
            "category-G coverage: UNAVAILABLE (canonical data dictionary "
            "absent — gitignored; run locally)"
        )
        return
    click.echo(
        f"category-G walk coverage: {report.covered}/{report.candidate_total} "
        "candidate-G leaves emitted-or-collapsed "
        f"({len(report.minted)} minted, {len(report.collapsed)} collapsed, "
        f"{len(report.uncovered)} uncovered)."
    )
    shown = report.violations[:15]
    for v in shown:
        click.echo(f"  GAP: {v}")
    if len(report.violations) > len(shown):
        click.echo(f"  ... and {len(report.violations) - len(shown)} more")
    if strict and report.violations:
        for v in report.violations:
            click.echo(f"CATEGORY-G-COVERAGE VIOLATION: {v}", err=True)
        sys.exit(1)
    if report.is_complete:
        click.echo(
            "category-G walk coverage: PASS (every candidate-G leaf "
            "emitted-or-collapsed)"
        )


@main.command(name="ci-baspi5-roundtrip")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the base shape TTLs + profiles/baspi5.ttl + "
        "exemplars/ + the class TBox. Defaults to source/03-standards/"
        "ontology/ relative to the OPDA repo root."
    ),
)
def ci_baspi5_roundtrip(ontology_dir: Path | None) -> None:
    """Run the ODR-0003 signal-1 BASPI5 MVP round-trip gate.

    Loads base shapes + the BASPI5 overlay profile + the TBox and validates
    the two committed transaction exemplars, asserting: (a) the conformant
    transaction conforms with zero violations; (b) the non-conformant
    transaction (PoA seller with no evidenced authority) trips a violation
    that traces to form-question B1.3.2 via the SellersCapacity xone; (c)
    every BASPI5 property shape carrying a form-question dct:source also
    carries a DASH render hint (the in-scope half of the round-trip; the UI
    render is the documented consumer boundary). Exits non-zero on any
    failure (ADR-0014; ODR-0010 §Rules).
    """
    from opda_gen.ci.baspi5_roundtrip_test import run

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    report = run(target)
    if not report.available:
        click.echo(
            f"baspi5 round-trip: UNAVAILABLE ({report.unavailable_reason})",
            err=True,
        )
        sys.exit(1)
    click.echo(
        "baspi5 round-trip (ODR-0003 signal 1): "
        f"(a) conformant conforms={report.conformant_conforms}; "
        f"(b) non-conformant violations={report.nonconformant_violation_count}, "
        f"B1.3.2-traceable={report.nonconformant_traces_to_b132}; "
        f"(c) {report.render_summary}."
    )
    if report.violations:
        for v in report.violations:
            click.echo(f"BASPI5-ROUNDTRIP VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo(
        "baspi5 round-trip CI: PASS (conformant + non-conformant + "
        "B1.3.2 traceability + render-contract)"
    )


@main.command(name="ci-inference-closure")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing the TBox TTLs + exemplars/. Defaults to "
        "source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def ci_inference_closure(ontology_dir: Path | None) -> None:
    """Run the ADR-0035 §Confirmation OWL-RL-safe inference-closure gate.

    Loads the TBox + exemplar ABox in-process (rdflib), materialises the
    ODR-0025 §R1 safe closure with the same seven rule bodies as
    `scripts/fuseki-load.mjs`, and asserts: the inferred graph is
    non-empty; subclass type-propagation is present (with conditional
    inverse/transitive guards); NO R2-excluded triple appears (no
    owl:sameAs, no spurious opda:EPCCertificate a opda:Property); and the
    disjointness consistency check is satisfiable. Exits non-zero on any
    violation.
    """
    from opda_gen.ci.inference_closure_test import run

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    violations = run(target)
    if violations:
        for v in violations:
            click.echo(f"INFERENCE-CLOSURE VIOLATION: {v}", err=True)
        sys.exit(1)
    click.echo("inference closure CI: PASS (ADR-0035 §Confirmation)")


@main.command(name="emit-exemplar-reports")
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing foundation + module TTLs + exemplars/. "
        "Defaults to source/03-standards/ontology/ relative to the OPDA "
        "repo root."
    ),
)
def emit_exemplar_reports(ontology_dir: Path | None) -> None:
    """Emit `<stem>-expected-report.ttl` for each diagnostic exemplar.

    Realises ADR-0014 §"Exemplar regression layer" lines 101-150 +
    §Confirmation #2.
    """
    from opda_gen.emitters.exemplar_reports import (
        emit_exemplar_reports as _emit,
    )

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    written = _emit(target)
    for path in sorted(written.keys()):
        click.echo(f"emitted: {path}")


@main.command(name="validate-exemplar")
@click.argument("path", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option(
    "--ontology-dir",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    required=False,
    default=None,
    help=(
        "Directory containing foundation + module shape TTLs. Defaults "
        "to source/03-standards/ontology/ relative to the OPDA repo root."
    ),
)
def validate_exemplar(path: Path, ontology_dir: Path | None) -> None:
    """Run Apache Jena SHACL against an exemplar; compare to expected-report.

    Realises ADR-0014 §"Exemplar regression layer" + §Confirmation #4.
    Exit code: 0 = report matches committed expected; 1 = differs.
    """
    from opda_gen.emitters.exemplar_reports import (
        validate_exemplar as _validate,
    )

    target = ontology_dir if ontology_dir is not None else _default_ontology_dir()
    ok, msg = _validate(path, target)
    click.echo(msg)
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
