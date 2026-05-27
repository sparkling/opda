# ADR Programme — Ontology Implementation (JSON Schemas → Turtle)

> **Anchor:** [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md). The Council programme (ODR corpus) ratifies the *modelling decisions*; this ADR programme (ADR corpus) realises those decisions as engineering artefacts — Turtle files, generator code, SHACL shapes, CI hooks. DCAP boundary: ontology-modelling decisions are ODRs; schema-encoding decisions are ADRs.
>
> **Sister plan:** [Council follow-up sessions](../../ontology/plan/council-followup-sessions.md) — operationalised the 14-session ODR ratification programme. This plan operationalises the seven-ADR implementation programme that follows.

## 1. Scope and method

**What this plan does.** Specifies the engineering work to convert OPDA's source artefacts (JSON Schemas; data dictionary; business glossary) into the Council-ratified ontology (Turtle), per the ratified ODR corpus (ODR-0001 through ODR-0018). The output is a deployment-survivable ontology: per-module .ttl files emitted by a deterministic generator, SHACL shapes graph with severity tiers, DPV annotation graph, per-overlay profile shapes, diagnostic exemplar harness, and a BASPI5 round-trip MVP demonstration.

**What this plan does NOT do.** Re-deliberate any modelling decision. Every modelling rule applied here is already ratified in the ODR corpus; engineering applies it. If a genuinely novel modelling decision surfaces during implementation, it lands as a new Council session (ODR amendment cycle), not as an ADR amendment.

| This ADR programme (engineering) | Sibling ODR programme (modelling) |
|---|---|
| Realises ratified `## Rules` as code + artefacts | Ratifies `## Rules` (modelling decisions) |
| Output: generator code; .ttl files; SHACL shapes; CI hooks; exemplar harness | Output: ODRs with `status: accepted`; transcripts; track record |
| Corpus: `docs/adr/` | Corpus: `docs/ontology/odr/` |
| Authority: project ADR conventions (MADR 4.x + project extensions) | Authority: ODR-0001 Linked Data Council |

**State at top of programme (2026-05-27).** All 14 original Council sessions ratified + Phase-3.5 audit + Session 003c WG housekeeping. 17 ODRs accepted (0001 thru 0018 minus 0014 superseded + 0016 deferred-until-trigger). Namespace ratified at `https://w3id.org/opda/#` (Session 003b + ADR-0006). Generator specification ratified ([ADR-0007](../ADR-0007-ontology-generator-specification.md)).

This ADR programme **bootstraps the implementation** from ADR-0006 (namespace infrastructure) + ADR-0007 (generator specification) into a working BASPI5 round-trip — the MVP gate that closes [ODR-0003 §"Programme retirement criterion"](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md).

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
| Phase 1 — Bootstrap | [ADR-0008](../ADR-0008-generator-implementation-infrastructure.md) | Generator implementation infrastructure | ODR-0004 §6a; ADR-0007 | (none — bootstrap) |
| Phase 1 — Bootstrap | [ADR-0009](../ADR-0009-foundation-ttl-emission.md) | Foundation TTL emission | ODR-0004 §3a, §6a; ODR-0001 §What-an-ODR-records | ADR-0008 |
| Phase 2 — Substrate | [ADR-0010](../ADR-0010-skos-vocabulary-emission.md) | SKOS vocabulary emission | ODR-0011; A9 per-kind discipline | ADR-0009 |
| Phase 3 — Modules | [ADR-0011](../ADR-0011-module-tbox-emission.md) | Module TBox emission (Property + Agent + Transaction + Claims + Address + Descriptive Attributes) | ODR-0005 + ODR-0006 + ODR-0007 + ODR-0008 + ODR-0009 + ODR-0015 + ODR-0017 + ODR-0018 | ADR-0009 + ADR-0010 |
| Phase 4 — Validation | [ADR-0012](../ADR-0012-shacl-and-dpv-annotation-emission.md) | SHACL shapes + DPV annotation emission | ODR-0010 §Q1-Q6; ODR-0012; ODR-0013; ODR-0017; ODR-0018 | ADR-0011 |
| Phase 5 — Overlays | [ADR-0013](../ADR-0013-overlay-profile-emission.md) | Overlay profile emission | ODR-0010 (full); three-rule interface contract | ADR-0012 |
| Phase 6 — MVP | [ADR-0014](../ADR-0014-baspi5-round-trip-mvp-harness.md) | BASPI5 round-trip MVP harness + diagnostic exemplar regression | ODR-0010 §Q7 (MVP gate); ODR-0004 §8a; ODR-0003 §Programme retirement criterion | ADR-0013 |

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

Per [ADR-0007 §"Byte-identity CI test"](../ADR-0007-ontology-generator-specification.md), `.github/workflows/ontology-byte-identity.yml` runs on every push + PR. Tests:

1. **Byte-identity regeneration.** `opda-gen emit --output /tmp/ontology` → `diff -q` against committed copies → fail on any diff.
2. **Three-graph separation** ([ODR-0004 §3a](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) five-part CI test): no `sh:*` in annotation graph; no `owl:imports` from shapes; no advisory annotations in shapes; every `sh:targetClass` resolves; consumer-profile artefacts have no commits outside service account.
3. **Exemplar regression** (per ODR-0004 §8a + ADR-0014): pyshacl validates each exemplar against shapes graph; result matches paired `expected-report.ttl`.
4. **Three-rule interface contract** (per ODR-0010 + ODR-0013 + ADR-0013): `sh:in` semantics; `sh:Violation` floor; no-identity-override gate. Build-step composition produces no surprises.
5. **BASPI5 round-trip** (per ADR-0014): JSON → loaded SHACL profile → rendered DASH form → validated transaction with full `dct:source` traceability. Round-trip equivalence test.

## 7. MVP gate (BASPI5 round-trip)

Per [ODR-0010 §Q7](../../ontology/odr/ODR-0010-overlay-profile-mechanism.md) and [ODR-0003 §"Programme retirement criterion"](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md):

> **MVP definition:** Load BASPI5 overlay → SHACL profile composition → DASH rendering → validate exemplar transaction → regenerate BASPI5 form with full `dct:source` traceability back to data-dictionary leaves.

The MVP gate is the methodology's operational pressure-test: if BASPI5 round-trips, the ratified ODR stack is coherent end-to-end. Closes the ODR-0003 programme retirement criterion (condition i — MVP round-trip closes; condition ii — every linked ODR is `accepted` — already met).

## 8. Execution model — swarm orchestration

The engineering programme uses **swarm orchestration via `/ruflo-swarm:swarm`** to run independent ADR implementations concurrently while preserving dependency gates. This mirrors the Council programme's Agent fan-out pattern (per [ODR-0001 §"Roles for every session"](../../ontology/odr/ODR-0001-linked-data-council-methodology.md)), adapted for engineering execution. The Council used named-expert teammates; the ADR programme uses scoped-task workers, but the topology is the same shape.

### 8.1 Agent topology

- **Queen agent** — programme coordinator. Reads ADR sequence + dependency graph; spawns worker agents per ADR or per parallel sub-task; tracks completion; gates next-phase spawn on prior-phase confirmation. Equivalent to the Council Queen's synthesis role.
- **Worker agents** — one per ADR implementation (or per parallel sub-task within an ADR). Each receives: the ADR text + cited ODRs (`depends-on:` list) + cited prior ADRs + existing OPDA codebase context. Output: emitted artefacts (TTL files; Python code) + structured implementation report. Worker spawns are background (`run_in_background: true`).
- **Validation agents** — one per completed ADR (per §9 Validation discipline). **Independent of the implementing worker**; verifies soundness + completeness + cross-ADR consistency against the ratified ODR corpus. Mirrors the Council Devil's Advocate role: independent, attack-first, withdraw-on-evidence.

### 8.2 Concurrency model per phase

```
Phase 1 (Bootstrap; sequential — ADR-0009 imports ADR-0008's package):
  Queen → ADR-0008 worker → ADR-0008 validation agent
            ↓ (gate on PASS)
          ADR-0009 worker → ADR-0009 validation agent
            ↓ (gate on PASS)
          Phase 2 unblocks

Phase 2 (Substrate; single worker):
  Queen → ADR-0010 worker → ADR-0010 validation agent
            ↓ (gate on PASS)
          Phase 3 unblocks

Phase 3 (Modules; six workers in parallel):
  Queen spawns concurrently in ONE message:
    ├── property module worker      ──→  property validation agent
    ├── agent module worker         ──→  agent validation agent
    ├── transaction module worker   ──→  transaction validation agent
    ├── claim module worker         ──→  claim validation agent
    ├── governance module worker    ──→  governance validation agent
    └── descriptive module worker   ──→  descriptive validation agent
  Queen synthesises across module outputs → one ADR-0011 commit.

Phase 4 (Validation layer; six workers in parallel):
  Same fan-out as Phase 3 but emitting shapes + annotations per module.

Phase 5 (Overlays; per-overlay concurrent — BASPI5 first):
  Queen spawns BASPI5 worker first (MVP-blocking).
  On BASPI5 PASS: Queen spawns TA6/NTS/LPE1/etc. workers concurrently.

Phase 6 (MVP harness; single worker):
  Queen → ADR-0014 worker → ADR-0014 validation agent
            ↓ (gate on PASS)
          Programme retires.
```

### 8.3 Spawn discipline (per CLAUDE.md)

- Each phase's worker spawns are issued in ONE message using the `Agent` tool with `run_in_background: true`.
- Worker agents inherit the parent's MCP toolset; `ToolSearch` is available to each worker for loading any additional MCP tools needed.
- Each worker writes its emitted artefacts to canonical paths (`source/03-standards/ontology/...` per ADR-0007 §"Architecture") + writes a structured implementation report to `docs/adr/implementation-reports/ADR-NNNN-implementation.md`.
- After spawning, **stop and wait for results** (per CLAUDE.md "After spawning agents: STOP and wait for results. Do not poll."). The notification system signals completion.

### 8.4 When to use swarm vs direct execution

- **Use swarm:** Phase 3 (six concurrent module workers), Phase 4 (six concurrent shape workers), Phase 5 (multiple concurrent overlay workers).
- **Direct execution:** Phase 1 (sequential bootstrap; one worker at a time), Phase 2 (single substrate worker), Phase 6 (single MVP harness worker).
- **Validation always runs as a separate agent**, even when the implementation worker ran directly. Independence of the verifier is non-negotiable (the Council DA pattern).

### 8.5 Swarm initialisation

The Queen issues `/ruflo-swarm:swarm-init` at programme start with a hierarchical topology + 1 coordinator + N workers + N validators per phase. Memory namespace: `opda-ontology-implementation`. Swarm state persists across phases; per-phase task spawns are issued via `mcp__ruflo__agent_spawn` from the Queen's context.

If `/ruflo-swarm:swarm` is unavailable in the execution environment (e.g. running outside Claude Code), the programme degrades cleanly to direct sequential execution by a single engineer following the ADR sequence. The swarm is an accelerator, not a hard dependency.

## 9. Validation discipline — soundness + completeness per ADR

Every ADR implementation passes a **structural validation gate** before moving `proposed → accepted`. The gate mirrors the Council programme's Devil's Advocate role: independent verification, attack-first, named withdrawal conditions.

### 9.1 Three validation checks per ADR

Every ADR's `### Confirmation` section is augmented with these three checks (in addition to its own ADR-specific criteria). Validation agent runs them; report committed alongside the emission.

**Check 1 — Soundness.** Every emitted artefact MUST trace to a clause in a cited ODR's `## Rules` or `## Operational specifications`. Verification:

- SPARQL/grep: extract `dct:source` URIs from emitted Turtle artefacts; verify each resolves to a ratified ODR section.
- For code artefacts (generator modules; CLI commands): every implementation file has a doc-comment header citing the ADR + cited ODRs realised by that file.
- Soundness FAILS if any emitted artefact lacks a traceable ODR/ADR source.

**Check 2 — Completeness.** Every cited ODR's `## Rules` and `## Operational specifications` subsection MUST be realised by the implementation OR explicitly deferred with a named follow-up trigger. Verification:

- Coverage matrix: enumerate each cited ODR's subsections (`§Q1a`, `§Q2a`, `§3a`, etc.); for each subsection, verify the implementation either:
  - Emits an artefact that realises it (cite by path), OR
  - Defers with named trigger (the deferral lives in the ADR's `### Confirmation` "explicit deferrals" sub-list).
- Completeness FAILS if any cited subsection is silently missing.

**Check 3 — Cross-ADR consistency.** The ADR's emissions MUST not violate downstream-ADR contracts. Verification:

- For each subsequent ADR in the programme whose `depends-on:` list cites this ADR, verify the emission supports the downstream's confirmation criteria.
- Example: ADR-0011 module classes MUST be referenceable by ADR-0012 shapes targeting (`sh:targetClass` resolves); ADR-0012 shapes MUST be composable by ADR-0013 overlay profiles (the three-rule interface contract holds).
- Cross-ADR FAILS if a downstream confirmation criterion cannot be met given current emission.

### 9.2 Validation agent role

An **independent agent** (NOT the implementing worker) runs the three checks. Inputs:

- ADR text (the implementation specification).
- Cited ODRs — read each ODR's frontmatter + `## Rules` + `## Operational specifications`.
- Cited prior ADRs (for cross-ADR consistency).
- Emitted artefacts (from the implementing worker).
- Implementation report (the worker's self-described output).

Output: structured validation report at `docs/adr/validation/ADR-NNNN-validation-report.md`. Format template:

```markdown
# ADR-NNNN Validation Report

**Validation agent:** <agent-id>
**Validated:** <iso-date>
**Implementing worker:** <worker-id>
**Cited ODRs:** <list>
**Cited prior ADRs:** <list>

## Soundness check
- [x] Every emitted opda:Class has dct:source resolving to cited ODR section ✓
- [x] Every emitted SHACL shape has dct:source ✓
- [ ] FAIL: <artefact> missing dct:source (cite the artefact path + line)
- ...

## Completeness check
- [x] ODR-NNNN §Q1a realised by emission of <path> ✓
- [x] ODR-NNNN §Q2a realised by emission of <path> ✓
- [ ] DEFERRED: ODR-NNNN §Q3a — explicit deferral with trigger "<X>" ✓
- [ ] FAIL: ODR-NNNN §Q4a NOT realised — no emission found
- ...

## Cross-ADR consistency check
- [x] ADR-MMMM downstream confirmation criteria supported ✓
- ...

## Verdict
PASS / FAIL / PASS-WITH-FOLLOW-UPS (named items)
```

### 9.3 Pre-`accepted` gate

An ADR moves `proposed → accepted` ONLY when all five hold:

1. All ADR-specific `### Confirmation` criteria green (the ADR's own self-validation).
2. Soundness check PASS.
3. Completeness check PASS (or all gaps recorded as explicit deferrals with named triggers).
4. Cross-ADR consistency check PASS.
5. Validation report committed at `docs/adr/validation/ADR-NNNN-validation-report.md`.

A FAIL on any check blocks `accepted` status. The implementing worker amends; validation re-runs. Two consecutive validation failures escalate to a Council mini-session (per §9.4).

### 9.4 Surfaced ambiguities → Council amendment

If a validation check surfaces a genuine ODR ambiguity (the ratified `## Rules` text underspecifies the engineering decision OR two ODRs cite the same concern with conflicting framings), the engineer routes the ambiguity to an Author-only Council session per [ODR-0001 §Self-amendment process](../../ontology/odr/ODR-0001-linked-data-council-methodology.md) — **NOT** a silent ADR-side interpretation.

Engineering does not re-deliberate. Ambiguity discovery triggers Council; Council ratifies an amendment; engineering re-runs with the amended `## Rules`. This is the structural anti-drift mechanism the Council programme expects (per [ODR-0003 §"Status discipline"](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md)).

### 9.5 Validation directory convention

```
docs/adr/
├── ADR-NNNN-<slug>.md              # the ADR
├── validation/
│   └── ADR-NNNN-validation-report.md   # the validation agent's report
├── implementation-reports/
│   └── ADR-NNNN-implementation.md  # the implementing worker's self-report
└── ADR-programme-ontology-implementation.md  # this plan
```

## 10. Out of scope for this plan

- **Real-world OPDA deployment.** Hosting the generated TTL at `https://openpropdata.org.uk/ontology/` is infrastructure work governed by the Astro site build (ADR-0003) + ADR-0006 (w3id.org redirect) — not a separate ADR in this programme.
- **Ontology editor UI.** Third-party tools (Protégé, TopBraid Composer, VocBench) consume OPDA's TTL output without OPDA-side build integration.
- **JSON-LD context emission.** Deferred until a named consumer requires ld-json (per ODR-0011 Q3 deferral; activates with SSSOM trigger).
- **OWL reasoning beyond inference profile.** OPDA's `derived/opda-inference.ttl` exposes only what's emitted in `opda-classes.ttl`; OWL DL completeness is not a programme requirement.
- **Non-BASPI5 overlays beyond named first batch.** TA6/NTS/LPE1 etc. land as ADR-0013-incremental commits; their MVP demonstrations are post-BASPI5 MVP.
- **S016 W3C VC/DID Compatibility.** Deferred-until-trigger per Scope-Check 1 Q7c (no trigger fired). When triggered, S016 ratifies VC binding (modelling); a future ADR-NNNN realises it.

## 11. Risk and mitigation

| Risk | Mitigation |
|---|---|
| Byte-identity CI brittle to rdflib version drift | Lock rdflib version; custom canonical serialiser bypasses rdflib's own serialiser for final stage (ADR-0008) |
| Module emission discovers ratified-ODR ambiguity | Validation agent surfaces it (§9); spawn Council amendment cycle (ODR amendment); do not mutate ADR programme silently |
| BASPI5 round-trip fails on real data | Diagnostic exemplar harness (ADR-0014) isolates root cause to one of the seven ratified `kind: pattern` ODRs; convene Council remediation |
| Overlay profile composition surfaces three-rule violations | Cagle's S010 Scope-Check 1 Q6 three-rule interface contract is CI-enforced (ADR-0013); violations are detected mechanically |
| DPV annotation graph leakage into shapes or class graphs | ODR-0004 §3a five-part CI test catches at every emission (ADR-0009 ensures it runs from foundation onward) |
| Generator scope creeps beyond ~1200 LOC | ADR-0008 sets scope cap; substantive feature additions land as new ADRs, not in-place scope expansion |
| Validation agent rubber-stamps implementation | Validation agent runs as **independent** spawn (not the implementing worker); two consecutive failures escalate to Council mini-session; FAIL on any check blocks `accepted` (§9.3) |
| Swarm worker silently drifts from cited ODR | Validation Check 1 (Soundness) catches missing `dct:source`; FAIL blocks `accepted`; ambiguities route to Council (§9.4) |

## 12. ADR programme retirement

This programme retires when **all** hold:

1. **MVP gate cleared** — BASPI5 round-trip demonstrates end-to-end coherence (ADR-0014 §Confirmation).
2. **Every ADR in this programme** (ADR-0008 through ADR-0014) is `status: accepted`.
3. **Every ADR has a green validation report** at `docs/adr/validation/ADR-NNNN-validation-report.md` (§9.3 pre-`accepted` gate).

Once retired, subsequent ontology-engineering work in OPDA (overlay additions; module amendments; consumer-profile additions) lands as fresh ADRs in the ADR corpus without revisiting this programme's sequencing.

The retirement closes [ODR-0003 §Programme retirement criterion](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md) jointly with the Council programme's own retirement signal.

## References

- **Anchor ODR:** [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../../ontology/odr/ODR-0003-pdtf-ontology-programme.md). This plan operationalises its §"Programme retirement criterion".
- **Sister plan:** [Council follow-up sessions](../../ontology/plan/council-followup-sessions.md). The Council ratification programme that produced the inputs (ODR `## Rules`) this plan consumes.
- **Foundation ADR:** [ADR-0006 — Ontology namespace at w3id.org/opda/ via W3C PICG redirect](../ADR-0006-w3id-opda-ontology-namespace.md). Phase 0 infrastructure.
- **Specification ADR:** [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md). Specifies what ADR-0008 implements.
- **Methodology:** [ODR-0001 — Linked Data Council methodology](../../ontology/odr/ODR-0001-linked-data-council-methodology.md). Defines `kind: pattern` per-kind discipline + the ODR-vs-ADR corpus boundary.
- **DCAP profile:** [DCAP.md](../../ontology/odr/DCAP.md). Cross-corpus modifying-relations rule (intra-corpus `supersedes`/`implements`; cross-corpus `depends-on`).
- **Adoption record:** [OPDA Council adoption record](../../ontology/odr/council/adoption.md). Track record showing the Council programme is complete at the ratification level.
