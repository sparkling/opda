# Council Session 031 — Schema-Accommodation Scope + Held-Trigger Resolution (Author-only)

- **Date:** 2026-05-31
- **Records:** Sets the ontology's scope (directing-authority directive) and **resolves every outstanding held/deferred trigger** by re-expressing it against that scope. Amends ODR-0003 (programme scope), ODR-0023 (R2/R3 re-open triggers), ODR-0016 (VC/DID trigger), ODR-0008 §Q2a (a/b/c), ODR-0024 R4/R10 (subkinds/Room); schedules §G25 (gUFO typing) as the one sound enrichment. **No new ODR.**
- **Queen:** Henrik (convening, Author-only). **DA:** — (none). **Panel:** — (none).
- **`consensus-mode`:** `none` (Author-only). **Format:** Author-only — a directing-authority **scope directive** + an **empirical accommodation check**, not a contested modelling question. (A council would be convened only if a held item required *inventing* an identity criterion the schema cannot supply; the scope directive makes that unnecessary — see §Why Author-only.)

## Context

Across sessions 028–030 several items were left **held-as-live "until a trigger fires"** — `opda:Room`/`opda:Building` class promotion (S030), the `ODR-0008a/b/c` UFO sub-module split (S029), the `opda:School`/`opda:HealthCareFacility` Subkind split (ODR-0024 R4), an `opda:UnitOfLengthScheme` (S030), ODR-0016 W3C-VC/DID compatibility, the gUFO typing pass (S029 Q5 / §G25). Their triggers were phrased as **"a named consumer query"** or **"an identity fact"** — conditions that read as *hanging*: nothing in the project tells a reader when they could ever fire. This record removes the hanging.

## Decision — the accommodation scope (directing-authority directive)

**The OPDA ontology's job is to accommodate the PDTF JSON schemas as they exist today.** It is not to pre-build foundational structure (extra Kinds, namespace splits, identity keys) that the current schema does not exercise. Accordingly, a held/deferred item is **resolved** by exactly one of:

- **(a) Already accommodated** — the schema's structure is covered by an emitted term/shape. Mark resolved; the further "promotion" is an optional foundational nicety, not owed.
- **(b) Schema has structure not yet modelled** — model it now (this is in-scope work).
- **(c) Schema lacks the structure** — re-express the trigger as a concrete **schema-evolution condition**: *re-open when a future PDTF schema version adds the structure.* This is monitorable (a schema version bump), not a hanging deliberation.

## Empirical accommodation check (2026-05-31)

Today's PDTF schema **is fully accommodated** at the model level:

- **Descriptive layer:** Category-G **239/239** emitted-or-collapsed (`ci-category-g-coverage`); Categories A–F handled by the ODR-0022 category treatments (A→`opda:disclosureDetail`; B→ODR-0009 evidence reuse; C→SKOS status schemes; D→fixtures; E→`opda:Search`/`opda:RiskAssessment`/etc.; F→ODR-0015/0006 reuse). BASPI5 round-trips green (`ci-descriptive-roundtrip`); the remaining per-form round-trips are the BASPI5-MVP-demo work item (not a model gap).
- **Other layers:** agents (ODR-0006), transactions (ODR-0007), claims/evidence (ODR-0009), governance (ODR-0012), address/geography (ODR-0015), bounded contexts (ODR-0019/0020) — all ratified + emitted.
- **VC/DID:** **absent from the schema** — 0 of 8,458 data-dictionary rows carry `verifiableCredential`/`did`/`credential` structure. So ODR-0016 has nothing in today's schema to model.

No PDTF schema structure is currently unaccommodated. Every held item is therefore a foundational nicety in class **(a)** or **(c)** — none is an unmodelled-data gap **(b)**.

## Held-trigger resolution table

| Held item | Class | Resolution / re-expressed trigger |
|---|---|---|
| `opda:Room`/`opda:Building` **classes** (S030) | (a)+(c) | Schema's `roomDimensions.rooms[]` is **accommodated** by `opda:RoomDimension` (ADR-0033). Re-open **when the PDTF schema adds a stable room/building identifier** (a token that survives re-survey) — then promote to a Kind with a data-realisable IC. |
| `ODR-0008a/b/c` UFO sub-modules (S029) | (a)+(c) | Leaves **accommodated** by the monolithic descriptive layer. Re-open **when the schema adds structure whose query needs the Quality-vs-Mode entailment as a typed set** (conjunct ii), the gUFO typing (§G25, conjunct i) being in place. |
| `opda:School`/`opda:HealthCareFacility` Subkinds (R4) | (a)+(c) | **Accommodated** by the `opda:NearbyFacility` genus + `opda:schoolType`. Re-open **when the schema adds per-band structural fields** a genus property can't carry. |
| `opda:UnitOfLengthScheme` (S030) | (c) | The schema carries **no length-unit token** for `length`/`width` (metres by convention). Re-open **when the schema adds a units field** on room dimensions. |
| ODR-0016 W3C-VC/DID (S009 Q8) | (c) | The schema has **no VC/DID structure**. Re-open **when a PDTF schema version (or a consuming wallet/DID flow) introduces verifiable-credential / DID fields.** |
| gUFO `rdf:type` typing pass (S029 Q5, §G25) | enrichment | **DO NOW** — the one held item that is pure-additive and sound (gufo:Quality/Mode on the uncontested Property Quale leaves, annotation graph). Realised by ADR-0034. |
| Monetary `opda:price` → `opda:MonetaryAmount` (S028 Q3) | (a) | The fixtures `opda:price` **accommodates** the Category-D fixtures amount as-is; `opda:MonetaryAmount` exists for the Category-G monetary leaves (§G22). No migration owed; re-open only if a consumer needs a multi-currency fixtures price. |

## Why Author-only (no council)

The scope is **directed** (the directing authority set "accommodate the schema as-is"), the accommodation status is **empirical** (verified above), and the trigger re-expression is **mechanical** (rephrase against schema evolution). There is no contested modelling judgement. A council would be warranted only to *invent* an identity criterion the data cannot supply — and the accommodation scope makes that explicitly unnecessary (sessions 029/030 already chose the schema-accommodating models: monolithic ODR-0008, `opda:RoomDimension`). Nothing here reverses those verdicts; it confirms them as the correct accommodation and gives each deferred nicety a concrete re-open condition.

## Consequences

- **The held triggers are no longer hanging** — each carries a concrete schema-evolution re-open condition (table above), recorded in ODR-0023 (R2/R3 run-status), ODR-0016, ODR-0008 §Q2a, ODR-0024 R4/R10.
- **§G25 is scheduled now** — the gUFO typing pass, realised by ADR-0034 (sound, additive).
- **No new Kinds, no namespace splits, no IC-less classes, no reversal of pushed work** — the accommodation scope confirms the S029/S030 models.
- **ODR-0003 (programme)** carries the scope statement: the ontology accommodates the PDTF schema as-is; foundational promotions are schema-evolution-gated.
- No WG (greenfield; the directing authority + council are the ratifying bodies).

## References

- The held verdicts: [session-029](./session-029-r2-ufo-axis-load-bearing.md) (a/b/c), [session-030](./session-030-room-building-modelling.md) (Room/Building), [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) R4/R10, [ODR-0016](../ODR-0016-w3c-vc-did-compatibility.md).
- Scope anchor: [ODR-0003](../ODR-0003-pdtf-ontology-programme.md). Deferred-work register: [ADR-0005 §G](../../adr/ADR-0005-deferred-work-register.md). Coverage: `ci-category-g-coverage` 239/239.
