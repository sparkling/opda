# Davis (Devil's Advocate) — session-051 working file

Citations: BBC Programmes Ontology deployment (2009; reuse `po:`/FOAF/`dc:` over re-minting); data.gov.uk linked-data cookbook ("don't mint what you can reuse"); ODR-0007 "defer until a concrete consumer" dissent; ODR-0022 §G3 coverage-by-test (folded into §R1(b) at session-047).

## Opening (attack)

The §R1(b) worked-query bar is unmet for every candidate — `src/api/queries/` holds only generic list/get endpoints; not one competency query traverses any proposed edge. A diagram rendering "disconnected" is not a consumer (YAGNI). Initial votes AGAINST gating; per-question withdrawal conditions stated.

## Cross-talk — convener correction ACCEPTED + verified

I verified directly: none of `partOfTransaction`/`concerns`/`dependsOnTransaction`/`chainMembers`/`appliesTo` is declared `owl:ObjectProperty` in the gated TBox (no emitted TTL exists for any; cf. `concernsProperty.ttl:9`, which *is* declared). My "already-emitted renderer artefact" frame conflated exemplar-use with TBox-declaration. **I withdraw it.** An undeclared exemplar predicate is the exact ungoverned defect §R1 closes.

- **Q1 Milestone→Transaction — WITHDRAW to GATE.** My withdrawal condition (a worked query over a committed exemplar PROV can't answer) is MET: `partOfTransaction` fires in `simple-transaction-with-milestones.ttl`, is TBox-undeclared, and "milestones of this transaction" is trivially writable. Allemang's exemplar+query pairing is the §R1(b) bar I folded back in at session-047; I can't demand it then reject it when met. Moreau is right PROV has no part-of-activity, so this is not PROV-redundant. Other events HOLD (VALUE-SLOT/RESIDUE-PENDING); re-open trigger: a committed query needing an `opda:` hop `prov:wasRevisionOf`/`wasDerivedFrom` cannot serve.
- **Q2 — HOLD for DEFER**, with Guarino and Kendall. Survey/Search/Comparable/NearbyFacility appear as subjects in **zero** exemplars — §R1(b) structurally unmet; no instance to write the query over. The aboutness camp may be right PROV is silent, but YAGNI binds: mint on a committed consumer. Re-open trigger: a committed exemplar instantiates the class AND a query traverses the aboutness hop. *(Accepts RESIDUE-PENDING as the register form of the defer — named, not dropped.)*
- **Q3 LeaseTerm — concede VALUE-SLOT** (`time:ProperInterval`, −I; the Name precedent decides it). No withdrawal reachable.
- **Q4 — HOLD.** VerificationActivity already navigates via `prov:used`→document, `prov:wasGeneratedBy`←claim in three committed exemplars (`claim-with-document-evidence.ttl:39,59`); emit ODR-0009's PROV and render it — a bespoke `opda:` is redundant (BBC reuse precedent). Re-open: an attachment a committed query needs that PROV cannot express.
- **Q5 concerns — WITHDRAW to GATE** (`opda:concerns` exemplar-attested `simple-transaction-with-milestones.ttl:82`/`chain-of-transactions.ttl:46`, TBox-undeclared, "estate this transaction conveys" trivially writable). **chain — accept RESIDUE-PENDING**: my session-047 "no exemplar yet" is verified stale (`dependsOnTransaction`/`chainMembers`/`chainStatus` live in `chain-of-transactions.ttl:52,64,65`); sole remaining bar is the worked recursion query. Re-open-to-GATE: commit the recursive cascade query.
- **Q6 — FOR** rendering subclass edges; AGAINST any minting motivated by a renderer.

**Held-as-live dissent: none unconditional.** Q1-Milestone & Q5-concerns WITHDRAWN-to-GATE (conditions met); chain RESIDUE-PENDING; Q2/Q4 HELD for DEFER with named re-open triggers.
