<!-- diagram-design-profile
name: Open Property Data Association
slug: opda
source-url: https://opda.org.uk
created: 2026-08-16
updated: 2026-08-16
notes: OPDA Design System 1.0 diagram projection
-->
# Style Guide

This complete Diagram Design profile maps the signed OPDA design system to semantic diagram roles. `DESIGN.md` and `public/ui/design-tokens.css` remain the brand authority.

## Tokens

### Semantic roles

| Role | Purpose | Default (light) | Default (dark) |
|---|---|---|---|
| `paper` | Page background, default node fill | `#f9f9f9` | `#131224` |
| `paper-2` | Secondary and raised node fill | `#ffffff` | `#231f2f` |
| `ink` | Primary text and structural stroke | `#2c273b` | `#f9f9f9` |
| `muted` | Secondary text and connector stroke | `#625d72` | `#a5a1b2` |
| `soft` | Sublabels and boundary labels | `#817c90` | `#a5a1b2` |
| `rule` | Hairline borders | `rgba(44,39,59,0.12)` | `rgba(249,249,249,0.12)` |
| `rule-solid` | Strong borders and baselines | `#cbc8d5` | `#56506d` |
| `accent` | Focal entity or relationship, 1–2 max | `#6c5bd4` | `#9a8fe8` |
| `accent-tint` | Fill for accent-bordered entities | `rgba(108,91,212,0.10)` | `rgba(154,143,232,0.14)` |
| `link` | Interactive resource links | `#5b51d8` | `#a9a0ff` |

Brand yellow is reserved for user action and focus. It is not a data-series or status colour.

### Series palette

Use only for genuine multi-series charts. Yellow remains excluded.

| Token | Light | Dark | Notes |
|---|---|---|---|
| `series-1` | `#c77f00` | `#dca23a` | Categorical data 2 |
| `series-2` | `#0e8478` | `#55b7ae` | Categorical data 3 |
| `series-3` | `#a5317f` | `#d77abb` | Categorical data 4 |
| `series-4` | `#4e6e93` | `#7f9dbd` | Categorical data 5 |
| `series-5` | `#58810b` | `#8cad4d` | Categorical data 6 |

### Terminal skin

| Token | Hex | Purpose |
|---|---|---|
| `terminal-page` | `#131224` | Page background |
| `terminal-paper` | `#231f2f` | Window body |
| `terminal-bar` | `#3a3550` | Title bar |
| `terminal-border` | `#56506d` | Borders |
| `terminal-ink` | `#f9f9f9` | Primary text |
| `terminal-muted` | `#a5a1b2` | Secondary text |
| `terminal-soft` | `#817c90` | Tertiary details |
| `terminal-accent` | `#9a8fe8` | One focal accent |
| `terminal-accent-tint` | `rgba(154,143,232,0.14)` | Focal fill |

## Typography

| Role | Family | Size | Weight | Usage |
|---|---|---|---|---|
| `title` | Roboto Slab | 1.75rem | 600 | Page or figure H1 only |
| `node-name` | DM Sans | 12px | 700 | Human-readable names |
| `sublabel` | Roboto Mono | 9px | 400 | IRIs, field types, and sources |
| `eyebrow` | DM Sans | 8px | 700 | Tracked uppercase type tags |
| `arrow-label` | Roboto Mono | 8px | 500 | Relationship annotations |
| `callout` | DM Sans | 14px | 400 | Editorial annotation |

Use locally hosted OPDA fonts in the website projection. A standalone authoring artefact may use system fallbacks; it must not require a remote asset.

## Stroke, radius, spacing

| Token | Value | Use |
|---|---|---|
| `stroke-thin` | `0.8` | Tags and leaf nodes |
| `stroke-default` | `1` | Most strokes |
| `stroke-strong` | `1.2` | Emphasis strokes |
| `radius-sm` | `2` | Labels and controls |
| `radius-md` | `4` | Diagram nodes |
| `radius-lg` | `4` | Containers |
| `grid` | `4` | Every coordinate, size, and gap |

## Node type to treatment

| Type | Fill | Stroke |
|---|---|---|
| `focal` | `accent-tint` | `accent` |
| `backend` | `paper-2` | `ink` |
| `store` | `paper-2` | `muted` |
| `external` | `paper` | `rule-solid` |
| `input` | `paper-2` | `soft` |
| `optional` | `paper` | `rule-solid`, dashed `4,3` |
| `security` | `paper-2` | `accent`, dashed `4,4` |

## OPDA constraints

- Use one violet focal accent. Yellow is reserved for action/focus.
- Use zero shadow, zero decorative gradient, and no ornamental imagery.
- Cards and frames use 0–4px radius; never pill diagram nodes.
- Use DM Sans for labels, Roboto Mono for technical values, and Roboto Slab only for a genuine title.
- Preserve light/dark, reduced-motion, forced-colours, keyboard, and 320px reflow behaviour in the website projection.
- Keep connector meaning redundant with text, line pattern, or arrow form; never colour alone.
