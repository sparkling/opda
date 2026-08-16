---
status: superseded
date: 2026-05-29
updated: 2026-08-16
tags: [design-system, css, tailwind, build-pipeline, governance, reference]
superseded-by: [ADR-0073]
supersedes: []
depends-on: []
implements: []
---

# Keep the hand-authored design above Tailwind Preflight

## Historical context

In May 2026 the Knowledge Base used a hand-authored editorial interface alongside
Tailwind v4 and TailwindPlus controls. Enabling Tailwind Preflight removed prose
list markers because the stylesheet coloured markers but relied on the browser's
default `list-style-type`. The repository also contained an earlier design export,
which made the live implementation path unclear.

## Decision at the time

The live stylesheet stayed unlayered, while Tailwind emitted named layers. CSS
cascade rules therefore gave declared live styles precedence over Preflight. The
stylesheet explicitly restored defaults it depended on:

```css
.prose ul { list-style-type: disc; }
.prose ul ul { list-style-type: circle; }
.prose ul ul ul { list-style-type: square; }
.prose ol { list-style-type: decimal; }
```

The `public/ui` files were identified as the implementation in use, while the
earlier `design/` export was retained as historical evidence.

## Supersession

ADR-0073 replaces the visual system, source hierarchy and governance described by
this record. It retains the useful technical finding: when Preflight is enabled,
components must explicitly declare any reset browser defaults they depend on.

The current system may continue to use unlayered modules where that makes the
Tailwind boundary predictable. That arrangement is tested and may be changed by a
later architectural decision; it is not a constraint on future visual design.

## Consequences retained by ADR-0073

- Tailwind Preflight remains enabled for TailwindPlus controls.
- Content styling remains scoped so document elements and application chrome can
  use different semantics.
- Browser defaults affected by Preflight are declared explicitly.
- `DESIGN.md`, tokens and live CSS modules are kept consistent by contract tests.

## More information

- [ADR-0073 — adopt the OPDA brand and replace the website design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [ADR-0017 — manual component library](./ADR-0017-manual-component-library.md)
