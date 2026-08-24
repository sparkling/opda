"""Focused contracts for the schema generator and drift boundary.

These tests import pure helpers only; they never run a schema build or write to
the repository tree.
"""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_script(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


generator = load_script("build_schema_pages", ROOT / "scripts/build-schema-pages.py")
drift = load_script("drift_check", ROOT / "scripts/drift_check.py")


class SchemaReproducibilityTests(unittest.TestCase):
    def test_schema_generator_uses_the_hierarchical_route_and_source_root(self):
        self.assertEqual(
            generator.SCHEMA_ROUTE_ROOT,
            "/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema",
        )
        self.assertEqual(
            generator.OUT_PAGES,
            ROOT / "src/pages/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema",
        )
        self.assertEqual(
            generator.page_url("38b"),
            "/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema/legal-estate/title/oc-summary",
        )

    def test_source_date_epoch_is_repeatable_and_utc(self):
        first = generator.deterministic_generated_on("1704067200")
        second = generator.deterministic_generated_on("1704067200")
        self.assertEqual(first, "2024-01-01")
        self.assertEqual(first, second)

    def test_source_date_epoch_is_fail_closed(self):
        original = os.environ.pop("SOURCE_DATE_EPOCH", None)
        try:
            with self.assertRaises(ValueError):
                generator.deterministic_generated_on()
            for value in ("", "-1", "2024-01-01", "999999999999999999999"):
                with self.subTest(value=value), self.assertRaises(ValueError):
                    generator.deterministic_generated_on(value)
        finally:
            if original is not None:
                os.environ["SOURCE_DATE_EPOCH"] = original

    def test_generated_page_coverage_includes_nested_schema_paths_only(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            nested = (
                root
                / "src/pages/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema/legal-estate/title/page.astro"
            )
            nested.parent.mkdir(parents=True)
            nested.write_text("<!-- generated -->")
            retired = root / "src/pages/schema/legal-estate/title/page.astro"
            retired.parent.mkdir(parents=True)
            retired.write_text("<!-- retired route; must not be inspected -->")
            self.assertEqual(drift.generated_page_files(root), [nested])

    def test_dama_mapping_has_no_retired_pdtf_documentation_roots(self):
        mapping = generator.load_dama_ka()
        retired_paths = (
            "src/pages/adoption/",
            "src/pages/implementation/",
            "src/pages/modelling/",
            "src/pages/schema/",
        )
        self.assertFalse(
            [path for path in mapping if path.startswith(retired_paths)],
            "DAMA records must follow the canonical PDTF schema page hierarchy",
        )
        schema_page = (
            "src/pages/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema/"
            "built-form/built-form-form.astro"
        )
        self.assertIn(schema_page, mapping)

    def test_missing_gitignored_inputs_are_unavailable(self):
        with tempfile.TemporaryDirectory() as directory:
            missing = drift.missing_required_inputs(Path(directory))
        self.assertIn(
            Path("source/00-deliverables/semantic-models/data-dictionary-canonical.json"),
            missing,
        )
        self.assertIn(
            Path("source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json"),
            missing,
        )

    def test_strict_date_boundary_requires_explicit_epoch(self):
        original = os.environ.pop("SOURCE_DATE_EPOCH", None)
        try:
            self.assertIsNotNone(drift.source_date_epoch_error())
            os.environ["SOURCE_DATE_EPOCH"] = "1704067200"
            self.assertIsNone(drift.source_date_epoch_error())
        finally:
            if original is None:
                os.environ.pop("SOURCE_DATE_EPOCH", None)
            else:
                os.environ["SOURCE_DATE_EPOCH"] = original


if __name__ == "__main__":
    unittest.main()
