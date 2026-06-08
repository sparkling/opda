# DCAP Audit Log

Quarterly review record for the ODR Decision-Application Profile at [DCAP.md](DCAP.md). Per the DCAP §Amendment policy, this companion records reviews and amendments. Entries are append-only, newest at the bottom.

## 2026-Q2 — Cross-project unification with semantic-modelling

- **Date:** 2026-06-08
- **Action:** opda's DCAP unified with semantic-modelling onto the shared canonical MADR 4.x body spine + named extensions. (a) §Sections replaced the legacy six-section spine (`## Context / ## Decision / ## Rules / ## Alternatives / ## Consequences / ## References`) with the MADR spine; all 28 ODRs migrated. (b) §Order: a single leading status/supersession admonition blockquote is permitted between the H1 and the first H2. (c) Documented the cross-project `hm <ODR|ADR>-NNNN` prior-art convention and the intentional-non-resolving-token convention (mirroring semantic-modelling's accepted-reference conventions). Frontmatter unchanged — opda retains required `kind` + `scope` and the optional `council` key (the shared schema treats these three as optional; opda requires `kind`/`scope` locally).
- **Drift detected:** none after migration. Corpus CLEAN across O-A..O-G (validation run 2).
- **Undeclared sections found:** none after migration.
- **Next review:** 2026-Q3 (target 2026-08).

<!-- Append future entries below this line, newest at the bottom (chronological order). -->
