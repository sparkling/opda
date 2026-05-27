# ADR Programme — Ontology Implementation (JSON Schemas → Turtle)

> **Anchor:** [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../ontology/odr/ODR-0003-pdtf-ontology-programme.md). The Council programme (ODR corpus) ratifies the *modelling decisions*; this ADR programme (ADR corpus) realises those decisions as engineering artefacts — Turtle files, generator code, SHACL shapes, CI hooks. DCAP boundary: ontology-modelling decisions are ODRs; schema-encoding decisions are ADRs.
>
> **Sister plan:** [Council follow-up sessions](../ontology/plan/council-followup-sessions.md) — operationalised the 14-session ODR ratification programme. This plan operationalises the seven-ADR implementation programme that follows.

## 1. Scope and method

**What this plan does.** Specifies the engineering work to convert OPDA's source artefacts (JSON Schemas; data dictionary; business glossary) into the Council-ratified ontology (Turtle), per the ratified ODR corpus (ODR-0001 through ODR-0018). The output is a deployment-survivable ontology: per-module .ttl files emitted by a deterministic generator, SHACL shapes graph with severity tiers, DPV annotation graph, per-overlay profile shapes, diagnostic exemplar harness, and a BASPI5 round-trip MVP demonstration.

**What this plan does NOT do.** Re-deliberate any modelling decision. Every modelling rule applied here is already ratified in the ODR corpus; engineering applies it. If a genuinely novel modelling decision surfaces during implementation, it lands as a new Council session (ODR amendment cycle), not as an ADR amendment.

| This ADR programme (engineering) | Sibling ODR programme (modelling) |
|---|---|
| Realises ratified `## Rules` as code + artefacts | Ratifies `## Rules` (modelling decisions) |
| Output: generator code; .ttl files; SHACL shapes; CI hooks; exemplar harness | Output: ODRs with `status: accepted`; transcripts; track record |
| Corpus: `docs/adr/` | Corpus: `docs/ontology/odr/` |
| Authority: project ADR conventions (MADR 4.x + project extensions) | Authority: ODR-0001 Linked Data Council |

**State at top of programme (2026-05-27).** All 14 original Council sessions ratified + Phase-3.5 audit + Session 003c WG housekeeping. 17 ODRs accepted (0001 thru 0018 minus 0014 superseded + 0016 deferred-until-trigger). Namespace ratified at `https://w3id.org/opda/#` (Session 003b + ADR-0006). Generator specification ratified ([ADR-0007](./ADR-0007-ontology-generator-specification.md)).

This ADR programme **bootstraps the implementation** from ADR-0006 (namespace infrastructure) + ADR-0007 (generator specification) into a working BASPI5 round-trip — the MVP gate that closes [ODR-0003 §"Programme retirement criterion"](../ontology/odr/ODR-0003-pdtf-ontology-programme.md).

## 2. Inputs

| Input | Path | Scale | Authoritative role |
|---|---|---|---|
| **PDTF v3 base schema** | `source/03-standards/schemas/pdtf-transaction.json` | 1,557 unique leaves | Structure + types |
| **PDTF v3 overlay schemas** | `source/03-standards/schemas/<form>/*.json` (BASPI, TA6, NTS, LPE1, etc.) | 8,458 path entries across 10+ overlays | Per-form cardinality + enum variation |
| **Data dictionary (markdown)** | `source/00-deliverables/semantic-models/data-dictionary.md` | 935 annotated leaves | `rdfs:comment` source; per-leaf range/cardinality |
| **Data dictionary (canonical JSON)** | `source/00-deliverables/semantic-models/data-dictionary-canonical.json` | 1,557 leaves; 16 canonical schemas | Generator machine input |
| **Business glossary (Turtle)** | `source/00-deliverables/semantic-models/business-glossary.ttl` | 54 trust-framework terms | `rdfs:label` + `skos:prefLabel` + `skos:definition` source |
| **Business glossary (merged JSON)** | `source/00-deliverables/semantic-models/glossary-merged.json` | 54 + schema-annotation + external-standard terms | Generator machine input |
| **Ratified ODR corpus** | `docs/ontology/odr/ODR-*.md` | 17 accepted | `kind` + `## Rules` + `## Operational specifications` |

Term-sourcing precedence per ODR-0004 §7a five-line rule: W3C-spec > OPDA Trust Framework > business glossary > schema text > external regulator (contextual).

## 3. Outputs

| Output | Path | Generator-emitted | CI-checked |
|---|---|---|---|
| `foundation.ttl` | `source/03-standards/ontology/foundation.ttl` | ✅ | byte-identity |
| `opda-classes.ttl` | `source/03-standards/ontology/opda-classes.ttl` | ✅ | byte-identity + three-graph CI |
| `opda-shapes.ttl` | `source/03-standards/ontology/opda-shapes.ttl` | ✅ | byte-identity + three-graph CI |
| `opda-annotations.ttl` | `source/03-standards/ontology/opda-annotations.ttl` | ✅ | byte-identity + three-graph CI |
| `opda-vocabularies.ttl` (SKOS) | `source/03-standards/ontology/opda-vocabularies.ttl` | ✅ | byte-identity |
| Per-module `.ttl` × N (property, agent, transaction, claim, governance) | `source/03-standards/ontology/<module>.ttl` | ✅ | byte-identity per module |
| Per-overlay profile shapes × N (baspi5, ta6, nts, lpe1, etc.) | `source/03-standards/ontology/profiles/<overlay>.ttl` | ✅ | byte-identity + three-rule interface contract |
| Derived consumer profiles (validation, ui, inference) | `source/03-standards/ontology/derived/<profile>.ttl` | ✅ (build-step composition) | three-graph CI |
| Diagnostic exemplars + `expected-report.ttl` | `source/03-standards/ontology/exemplars/*.ttl` | (exemplars hand-authored; reports generator-emitted) | pyshacl regression test |
| BASPI5 round-trip harness | `tests/baspi5-round-trip/` | code; not TTL | round-trip equivalence test |

## 4. ADR sequence

Seven engineering ADRs, sequenced by dependency. Each ADR realises one or more ratified ODRs. Per-ADR detail: see the linked record.

| Phase | ADR | Title | Realises (ODRs) | Dependency |
|---|---|---|---|---|
| Phase 1 — Bootstrap | [ADR-0008](./ADR-0008-generator-implementation-infrastructure.md) | Generator implementation infrastructure | ODR-0004 §6a; ADR-0007 | (none — bootstrap) |
| Phase 1 — Bootstrap | [ADR-0009](./ADR-0009-foundation-ttl-emission.md) | Foundation TTL emission | ODR-0004 §3a, §6a; ODR-0001 §What-an-ODR-records | ADR-0008 |
| Phase 2 — Substrate | [ADR-0010](./ADR-0010-skos-vocabulary-emission.md) | SKOS vocabulary emission | ODR-0011; A9 per-kind discipline | ADR-0009 |
| Phase 3 — Modules | [ADR-0011](./ADR-0011-module-tbox-emission.md) | Module TBox emission (Property + Agent + Transaction + Claims + Address + Descriptive Attributes) | ODR-0005 + ODR-0006 + ODR-0007 + ODR-0008 + ODR-0009 + ODR-0015 + ODR-0017 + ODR-0018 | ADR-0009 + ADR-0010 |
| Phase 4 — Validation | [ADR-0012](./ADR-0012-shacl-and-dpv-annotation-emission.md) | SHACL shapes + DPV annotation emission | ODR-0010 §Q1-Q6; ODR-0012; ODR-0013; ODR-0017; ODR-0018 | ADR-0011 |
| Phase 5 — Overlays | [ADR-0013](./ADR-0013-overlay-profile-emission.md) | Overlay profile emission | ODR-0010 (full); three-rule interface contract | ADR-0012 |
| Phase 6 — MVP | [ADR-0014](./ADR-0014-baspi5-round-trip-mvp-harness.md) | BASPI5 round-trip MVP harness + diagnostic exemplar regression | ODR-0010 §Q7 (MVP gate); ODR-0004 §8a; ODR-0003 §Programme retirement criterion | ADR-0013 |

Total: 7 engineering ADRs. With ADR-0006 (namespace infrastructure) + ADR-0007 (generator specification) as upstream, the implementation programme is **9 ADRs end-to-end** from namespace decision to MVP gate.

### Dependency graph

```
   Phase 1 (Bootstrap):
     ADR-0006 ──┐
                ├──→ ADR-0007 ──→ ADR-0008 ──→ ADR-0009
     ODR-0004 ──┘  (spec)         (code)        (foundation.ttl)
                                                      │
   Phase 2 (Substrate):                                ▼
     ODR-0011  ──────────────────────────────→ ADR-0010
                                                      │
                                                      ▼
   Phase 3 (Modules):                                  
     ODR-0005, 0006, 0007, 0008, 0009, 0015 ──→ ADR-0011
     + ODR-0017, 0018                              │
                                                      ▼
   Phase 4 (Validation):                              
     ODR-0010 §Q1-Q6, 0012, 0013, 0017, 0018 ──→ ADR-0012
                                                      │
                                                      ▼
   Phase 5 (Overlays):                                
     ODR-0010 (full) ──────────────────────────→ ADR-0013
                                                      │
                                                      ▼
   Phase 6 (MVP gate):                                
     ODR-0010 §Q7 + ODR-0004 §8a + ODR-0003   ──→ ADR-0014 ←── MVP
     §retirement criterion                                       gate
```

## 5. Phasing and timeboxing

Honest cost estimates per phase. Each phase is independently shippable (phase output usable even if next phase delayed).

| Phase | ADRs | Engineering days | Output |
|---|---|---|---|
| Phase 1 — Bootstrap | ADR-0008 + ADR-0009 | 3-5 days | Generator package + first foundation.ttl emission; byte-identity CI green |
| Phase 2 — Substrate | ADR-0010 | 2-3 days | SKOS schemes for ~160 enum leaves with UFO meta-category |
| Phase 3 — Modules | ADR-0011 | 5-8 days | Per-module TBox emissions for Property + Agent + Transaction + Claims + Address + Descriptive Attributes |
| Phase 4 — Validation | ADR-0012 | 3-4 days | SHACL shapes with severity tiers + DPV annotation graph |
| Phase 5 — Overlays | ADR-0013 | 2-3 days (BASPI5 first; TA6/NTS/etc. follow incrementally) | BASPI5 profile shapes; TA6 / NTS / LPE1 follow |
| Phase 6 — MVP | ADR-0014 | 3-5 days | BASPI5 round-trip working; diagnostic exemplar regression suite |
| **Total** | **7 ADRs** | **18-28 days** | **BASPI5 round-trip MVP demonstration → ODR-0003 retirement criterion closed** |

This is real engineering, not deliberation. The Council programme produced the ratified rules in ~1 conversation-day; the engineering programme realises them in ~3-4 working weeks at a typical pace.

## 6. CI integration

Per [ADR-0007 §"Byte-identity CI test"](./ADR-0007-ontology-generator-specification.md), `.github/workflows/ontology-byte-identity.yml` runs on every push + PR. Tests:

1. **Byte-identity regeneration.** `opda-gen emit --output /tmp/ontology` → `diff -q` against committed copies → fail on any diff.
2. **Three-graph separation** ([ODR-0004 §3a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) five-part CI test): no `sh:*` in annotation graph; no `owl:imports` from shapes; no advisory annotations in shapes; every `sh:targetClass` resolves; consumer-profile artefacts have no commits outside service account.
3. **Exemplar regression** (per ODR-0004 §8a + ADR-0014): pyshacl validates each exemplar against shapes graph; result matches paired `expected-report.ttl`.
4. **Three-rule interface contract** (per ODR-0010 + ODR-0013 + ADR-0013): `sh:in` semantics; `sh:Violation` floor; no-identity-override gate. Build-step composition produces no surprises.
5. **BASPI5 round-trip** (per ADR-0014): JSON → loaded SHACL profile → rendered DASH form → validated transaction with full `dct:source` traceability. Round-trip equivalence test.

## 7. MVP gate (BASPI5 round-trip)

Per [ODR-0010 §Q7](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) and [ODR-0003 §"Programme retirement criterion"](../ontology/odr/ODR-0003-pdtf-ontology-programme.md):

> **MVP definition:** Load BASPI5 overlay → SHACL profile composition → DASH rendering → validate exemplar transaction → regenerate BASPI5 form with full `dct:source` traceability back to data-dictionary leaves.

The MVP gate is the methodology's operational pressure-test: if BASPI5 round-trips, the ratified ODR stack is coherent end-to-end. Closes the ODR-0003 programme retirement criterion (condition i — MVP round-trip closes; condition ii — every linked ODR is `accepted` — already met).

## 8. Out of scope for this plan

- **Real-world OPDA deployment.** Hosting the generated TTL at `https://openpropdata.org.uk/ontology/` is infrastructure work governed by the Astro site build (ADR-0003) + ADR-0006 (w3id.org redirect) — not a separate ADR in this programme.
- **Ontology editor UI.** Third-party tools (Protégé, TopBraid Composer, VocBench) consume OPDA's TTL output without OPDA-side build integration.
- **JSON-LD context emission.** Deferred until a named consumer requires ld-json (per ODR-0011 Q3 deferral; activates with SSSOM trigger).
- **OWL reasoning beyond inference profile.** OPDA's `derived/opda-inference.ttl` exposes only what's emitted in `opda-classes.ttl`; OWL DL completeness is not a programme requirement.
- **Non-BASPI5 overlays beyond named first batch.** TA6/NTS/LPE1 etc. land as ADR-0013-incremental commits; their MVP demonstrations are post-BASPI5 MVP.
- **S016 W3C VC/DID Compatibility.** Deferred-until-trigger per Scope-Check 1 Q7c (no trigger fired). When triggered, S016 ratifies VC binding (modelling); a future ADR-NNNN realises it.

## 9. Risk and mitigation

| Risk | Mitigation |
|---|---|
| Byte-identity CI brittle to rdflib version drift | Lock rdflib version; custom canonical serialiser bypasses rdflib's own serialiser for final stage (ADR-0008) |
| Module emission discovers ratified-ODR ambiguity | Spawn Council amendment cycle (ODR amendment); do not mutate ADR programme silently |
| BASPI5 round-trip fails on real data | Diagnostic exemplar harness (ADR-0014) isolates root cause to one of the seven ratified `kind: pattern` ODRs; convene Council remediation |
| Overlay profile composition surfaces three-rule violations | Cagle's S010 Scope-Check 1 Q6 three-rule interface contract is CI-enforced (ADR-0013); violations are detected mechanically |
| DPV annotation graph leakage into shapes or class graphs | ODR-0004 §3a five-part CI test catches at every emission (ADR-0009 ensures it runs from foundation onward) |
| Generator scope creeps beyond ~1200 LOC | ADR-0008 sets scope cap; substantive feature additions land as new ADRs, not in-place scope expansion |

## 10. ADR programme retirement

This programme retires when **both** hold:

1. **MVP gate cleared** — BASPI5 round-trip demonstrates end-to-end coherence (ADR-0014 §Confirmation).
2. **Every ADR in this programme** (ADR-0008 through ADR-0014) is `status: accepted`.

Once retired, subsequent ontology-engineering work in OPDA (overlay additions; module amendments; consumer-profile additions) lands as fresh ADRs in the ADR corpus without revisiting this programme's sequencing.

The retirement closes [ODR-0003 §Programme retirement criterion](../ontology/odr/ODR-0003-pdtf-ontology-programme.md) jointly with the Council programme's own retirement signal.

## References

- **Anchor ODR:** [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../ontology/odr/ODR-0003-pdtf-ontology-programme.md). This plan operationalises its §"Programme retirement criterion".
- **Sister plan:** [Council follow-up sessions](../ontology/plan/council-followup-sessions.md). The Council ratification programme that produced the inputs (ODR `## Rules`) this plan consumes.
- **Foundation ADR:** [ADR-0006 — Ontology namespace at w3id.org/opda/ via W3C PICG redirect](./ADR-0006-w3id-opda-ontology-namespace.md). Phase 0 infrastructure.
- **Specification ADR:** [ADR-0007 — Ontology generator specification](./ADR-0007-ontology-generator-specification.md). Specifies what ADR-0008 implements.
- **Methodology:** [ODR-0001 — Linked Data Council methodology](../ontology/odr/ODR-0001-linked-data-council-methodology.md). Defines `kind: pattern` per-kind discipline + the ODR-vs-ADR corpus boundary.
- **DCAP profile:** [DCAP.md](../ontology/odr/DCAP.md). Cross-corpus modifying-relations rule (intra-corpus `supersedes`/`implements`; cross-corpus `depends-on`).
- **Adoption record:** [OPDA Council adoption record](../ontology/odr/council/adoption.md). Track record showing the Council programme is complete at the ratification level.
