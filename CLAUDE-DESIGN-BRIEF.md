# Historical prototype brief

This file previously described how to recreate an earlier OPDA Knowledge Base
prototype in an external prototyping tool. That visual system and its setup paths
were superseded by ADR-0073 on 16 August 2026.

Fable 5 at maximum effort is the operator-delegated visual-design authority for
this replacement. Its adopted decisions are persisted so implementation does not
depend on continued access to a model or prototyping vendor:

- `DESIGN.md` is the normative web design contract.
- `public/ui/brand/` contains the original OPDA vectors.
- `public/ui/design-tokens.css` and `public/ui/design/` implement the contract.
- `docs/design-system-site/` is the standalone presentation source.

Future tools may propose changes, but they do not silently override Fable's adopted
contract; evidence classification, accessibility gates and human approval remain
the governance boundary.

Do not use obsolete `docs/ui`, static-site injection or direct deployment steps
from earlier revisions of this file.
