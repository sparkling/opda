# Historical design archive

This directory preserves the prototype exports and specimen packs that preceded
the OPDA Q3 2026 brand system. They explain earlier implementation history but do
not define the current website.

The live contract is now:

- [`../DESIGN.md`](../DESIGN.md) — normative design decisions and evidence tiers.
- [`../docs/adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md`](../docs/adr/ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md) — adoption and supersession decision.
- `../public/ui/design-tokens.css` — machine-readable token projection.
- `../public/ui/design-system.css` and `../public/ui/design/` — live component and
  layout implementation.
- `../docs/design-system-site/` — standalone local presentation source.

## Archive contents

The specimen packs, token/theme exports and ZIP packages here represent the
earlier cream/terracotta prototype. The old composite stylesheet is recoverable
from Git history and the ZIP packages; its path now contains a non-operative
marker. Do not copy the archive palette, typography or setup instructions into
current work.

Historical examples may contain obsolete paths such as `docs/ui`, old page shells
and earlier deployment commands. Those paths are not operational guidance.

## Using the current system

Start with `DESIGN.md`, use the official assets under `public/ui/brand/`, and reuse
the shared Astro shell and component classes. Any proposed change should identify
whether it replaces supplied brand evidence, an observed implementation pattern or
a derived system decision. Update the contract and tests in the same change.
