# custom `opda-gen` — the composed `/ontology` reference

**Status in this bake-off: the integration target, not a standalone tool
output. No separate artefact is produced under this folder.**

Per ADR-0041 (§Decision Outcome + §Amendments "Combination principle"), the
custom approach is **not** a competing single-file renderer that lands in
`tools/custom/`. It is the **woven `/ontology` section itself** — the
integration target that combines:

1. **off-the-shelf tool renderings** where they win (pyLODE / Widoco for the
   OWL term reference, SHACL Play! for the shapes/profiles layer, Skosmos for
   the SKOS schemes — all bake-off outputs in the sibling `tools/*` folders);
2. **custom `opda-gen` scripts** for the OPDA-specific layers **no
   off-the-shelf tool covers** — the 31 overlay profiles + the GAP register
   (1095 GAPped leaves / 16 thin profiles), the 17 round-trip exemplars, the
   three-graph separation, and the governance / ODR–ADR / council lineage
   (`dct:source` term-provenance); and
3. **LLM/human-authored prose** for the conceptual / identity / classification
   / rationale / known-issues layer that a generator cannot emit (the
   `[HAND]` sections of the session-038 outline).

## Why this folder is a pointer, not an output

The bake-off's job (ADR-0041 execution steps b–f) is to render the ontology
with every off-the-shelf tool and **score each per layer** so the operator can
pick *which method serves each part* (M6 decider = operator, on inspection).
The custom layer is the **answer** to that scoring — the layers the matrix
shows as **None** across all off-the-shelf tools (profiles+gap, exemplars,
three-graph, governance/lineage, known-issues) are exactly what `opda-gen` +
LLM prose must supply. There is therefore nothing to "render" into
`tools/custom/`: the custom output **is** the `/ontology` pages, wired into
`opda-gen` and guarded by the two-tier doc-drift CI gate (ADR-0041
§Confirmation, B1):

- **(i)** custom `opda-gen` HTML → regenerated from the committed TTL and
  **byte-identity** checked (the ODR-0004 §6a equivalent);
- **(ii)** third-party tool output (the `tools/*` renderings) → version-pinned,
  vendored as an input, **semantic/structural-diff** checked (every term /
  shape / concept appears; counts match) — not byte-identity;
- **(iii)** hand/LLM prose → human-reviewed + a lightweight "every `opda:`
  term named in prose resolves in the TTL" check.

## What the bake-off proves for this layer (see `../COMPARISON.md`)

Across pyLODE, Widoco, SHACL Play!, Ontospy, LODE, and Skosmos, the
**overlay-profiles + gap register, round-trip exemplars, three-graph
separation, governance/ODR–ADR lineage, and known-issues** columns are
**None** for every tool. That is the empirical justification for the custom
layer: no off-the-shelf tool touches the OPDA-specific coverage, so the
composed reference is the only configuration that covers all eight layers.
This is the expected-and-now-proven result ADR-0041 anticipated.
