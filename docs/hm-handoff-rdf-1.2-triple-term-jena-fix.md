# Hand-off to the hm project — restore RDF 1.2 triple-term syntax; the `rdflib` downgrade was unforced

**Prepared by:** the opda project (sibling), 2026-06-01, while authoring opda **ODR-0025** / **ADR-0036** (which replicate hm's Jena load-time-inference + SHACL 1.2 model). Reviewed against `~/source/hm/semantic-modelling` at that date.

**Audience:** the hm / `semantic-modelling` maintainers.

**Status:** advisory. The file/record pointers below are *leads to verify*, not a merge-ready patch — the hm team owns the final call.

---

## TL;DR

hm formally adopted RDF 1.2 (**ODR-0033**), including triple-term reification `rdf:reifies <<( … )>>` (**ODR-0069 R5 Phase 2**, S168). It then **retired the triple-term concrete syntax** from its live category tree — at least Cat 8 (cross-domain mappings) — migrating to the OWL-2 annotation-axiom pattern. The stated reason, in the file header itself, is **`rdflib` parseability**.

**That reason does not hold: hm's active toolchain does not use `rdflib`.** It parses and validates with Apache Jena (`riot` + `jena-shacl`), which reads RDF 1.2 natively. The model was downgraded to RDF 1.1 to satisfy a parser that is not in the live pipeline.

**Recommendation:** stop treating `rdflib`-parseability as a constraint; keep the toolchain on Jena; restore RDF 1.2 triple-term syntax as the canonical statement-level reification wherever it was retired *for the `rdflib` reason*. (See the one nuance in §4 about SSSOM — that part is a legitimate interop choice, not an `rdflib` capitulation.)

This is the mirror of the decision opda just recorded in **ODR-0025 §R5** / **ADR-0036**: adopt RDF 1.2 in full on a Jena toolchain; do not let a parser's gap dictate the data model.

---

## 1. The finding (verbatim)

`src/ontology/08-cross-domain-mappings/cross-domain-mappings-ontology.ttl`, header lines 34–41:

> **RDF 1.2 NOTE:** the pre-R3 deprecated source file uses RDF 1.2 triple-term reification (`rdf:reifies <<( ... )>>`) per ODR-0069 R5 Phase 2 (S168). **rdflib 7.6 does NOT support RDF 1.2 reification; this successor file uses the SSSOM-canonical OWL 2 annotation axiom pattern (`owl:annotatedSource`/`Property`/`Target`), which is syntactically RDF 1.1 compatible and rdflib-parseable.** ODR-0070 narrative provenance … is superseded on new mappings by SSSOM per the ODR-0087 Amendments section.

The same justification recurs in the ADR corpus (the `hm-shacl-fuseki` review noted ADR-0147 ≈ lines 846/858: "rdflib does not support triple-term syntax").

## 2. Why the justification is stale (evidence, 2026-06-01)

hm's live parse/validate path is **Jena, not `rdflib`**:

| Check | Result |
|---|---|
| `rdflib`/`pyshacl` in any dependency manifest (`requirements*.txt`, `pyproject.toml`, `Pipfile`, `setup.py`) | **none found** |
| `import rdflib` / `from rdflib` in active `src/` or `scripts/` Python | **none** (only `tests/test_generate_governance_shapes.py`, testing the **deprecated** `scripts/deprecated/generate-governance-shapes.py.jena-variant`) |
| `scripts/validate-ontology.sh` engine | Jena `shacl` CLI / Maven `ShaclValidateCli` only — header: *"pyshacl is NOT supported, it silently skips SHACL 1.2 constraints"* |
| RDF 1.2 triple-term parsing in Jena `riot` | supported natively (6.x) |

Conclusion: the only thing that could not read `rdf:reifies <<( … )>>` (`rdflib`) is not part of hm's live tooling. The downgrade traded away a standards-current, single-triple reification for the heavier RDF-1.1 OWL-2 pattern (an `owl:Axiom` node + `annotatedSource`/`Property`/`Target` per reified statement) to satisfy a parser hm doesn't run.

## 3. Why it matters

- RDF 1.2 triple terms are the native, standards-current statement-level annotation mechanism — they *supersede* reification (hm's own ODR-0033 framing). Holding the canonical model at RDF 1.1 for an unused parser is pure carrying cost and blocks the 1.2 features ODR-0033 committed to.
- The justification is self-describing ("rdflib 7.6 does NOT support…"), so it is trivially re-evaluable: no `rdflib` dependency ⇒ the justification lapses.
- SPARQL 1.2 over Jena already gives the query-side accessors for triple terms (`TRIPLE`/`SUBJECT`/`PREDICATE`/`OBJECT`, ODR-0033 F9) — so consuming queries don't need the OWL-2 pattern either.

## 4. The one honest nuance — SSSOM (don't over-revert)

The Cat 8 header gives **two** reasons for the OWL-2 axioms, and only one is stale:

- **"SSSOM-canonical"** — SSSOM's RDF/OWL serialization conventionally reifies mapping metadata with `owl:Axiom` annotation axioms. For the **SSSOM provenance blocks specifically**, the OWL-2 pattern may be the correct *interop* form regardless of `rdflib`. Keep SSSOM as an **additive** layer (its own ODR-0071h R1 / ODR-0087 R1 say "additive, not a replacement") — and if SSSOM-RDF interop genuinely wants the OWL-2 axioms, **generate them as an export**, not as the canonical in-store reification.
- **"rdflib-parseable"** — this is the stale half. It should not appear as a justification anywhere, and it should not have driven the *general* retirement of triple terms beyond the SSSOM case.

So: separate the two. SSSOM-canonical-ness can justify OWL-2 axioms for the mapping-metadata export; `rdflib`-parseability justifies nothing.

## 5. What to change (hm-side)

1. **Confirm the `rdflib` footprint.** Check CI workflows, notebooks, and any `make`-invoked Python for a residual `rdflib`/`pyshacl` step. If one exists, replace it with Jena (`riot` for parse, `jena-shacl` for validate) — don't keep it as the reason to constrain the model. Retire/relocate `tests/test_generate_governance_shapes.py` if its subject is truly deprecated.
2. **Restore RDF 1.2 triple terms as the canonical reification** wherever they were retired *for the `rdflib` reason* (not the SSSOM reason). Prime candidate: **Cat 9 extraction-provenance** (`09-extraction-provenance`), where the per-triple `rdf:reifies` mechanism was kept-but-dormant; and any general statement-level annotation that fell back to OWL-2 axioms or PROV-O reification only to stay RDF-1.1.
3. **Re-scope the records that bake in the stale rationale:**
   - `08-cross-domain-mappings/cross-domain-mappings-ontology.ttl` header — drop the `rdflib`-parseability clause; keep only the SSSOM-canonical rationale if retained.
   - **ODR-0070** (mapping-triple-provenance) — re-examine whether its supersession-by-SSSOM also (wrongly) retired triple terms for non-SSSOM provenance.
   - **ODR-0087** (SSSOM Cat 8) — keep SSSOM as additive interop; decouple the *reification-syntax* choice from `rdflib`-parseability (see §4).
   - **ADR-0147 R3** (Cat-8 seed map) and **ADR-0133** (the `sh:ShapeClass`/`rdf:JSON` Working-Draft maturity-risk note) — the *standards-maturity* caveat is legitimate and independent; the `rdflib` caveat is not. Separate them so the maturity concern isn't used to keep RDF 1.1.
   - `list-mappings.rq` (rewritten in commit `f577469b` off `rdf:reifies` onto SSSOM `owl:annotated*`) — if the underlying data goes back to triple terms, restore the triple-term query (Jena ARQ / SPARQL 1.2 accessors).
4. **Keep the genuinely independent caveats.** RDF 1.2 text-direction (ODR-0033 F4, deferred) and Working-Draft standards-maturity risk (ADR-0133) stand on their own merits — they are not about `rdflib`.

## 6. Caveats before acting

- This is an **external** review from the opda sibling. Verify the pointers against hm's current tree before changing anything.
- The "no `rdflib` dependency" evidence is a manifest + grep snapshot (2026-06-01). Confirm against CI and any out-of-tree tooling.
- **SSSOM adoption (ODR-0087) is sound.** The only thing challenged here is letting **`rdflib`-parseability** dictate the **reification syntax** of the canonical graph.
- **Jena version:** hm's Java/Maven stack pins Jena **6.0.0**; the `shacl`-CLI install lines reference 5.0.0 as an example. RDF 1.2 triple-term round-tripping wants a current (6.x) `riot`/`shacl`. Confirm the installed binaries before relying on it.

## 7. References

**hm:** `src/ontology/08-cross-domain-mappings/cross-domain-mappings-ontology.ttl` (RDF 1.2 NOTE, lines 34–41); `scripts/validate-ontology.sh`; ODR-0033 (RDF/SPARQL 1.2 adoption), ODR-0069 R5 (triple-term phase), ODR-0070 (mapping-triple-provenance), ODR-0087 (SSSOM Cat 8 mapping provenance), ODR-0058 (entailment-aware SPARQL patterns); ADR-0147 (Jena SHACL 1.2), ADR-0133 (`sh:ShapeClass`/`rdf:JSON` Working-Draft maturity risk); `list-mappings.rq` (commit `f577469b`).

**opda (the mirror decision this hand-off derives from):** ODR-0025 §R5 (full RDF 1.2 adoption on a Jena toolchain; no `rdflib` dependency), ADR-0036 (SHACL 1.2 + RDF parsing via Jena; `rdflib`/pyshacl retired).
