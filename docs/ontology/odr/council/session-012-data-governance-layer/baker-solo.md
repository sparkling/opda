---
session: session-012-data-governance-layer
expert: baker-solo
role: solo (Pandit is Queen; governance-pair runs solo)
domain: DCMI governance discipline; vocabulary stewardship; verbatim citation discipline
date: 2026-05-27
---

# Tom Baker (baker-solo) — Position on S012 Data-Governance Layer

Pandit (my usual governance-pair partner) is Queen this session. I write solo.
My load: **DCMI governance discipline for DPV co-annotation authoring** — named
stewards per SKOS scheme, verbatim regulator citation, vocabulary framework
registry. ODR-0011 §1a + §4a + ODR-0018 already establish the substrate; my
amendment makes ODR-0012's §Rules name the steward.

## Q1 — Curated-set scope for class-level DPV co-annotation

**FOR.** The class-level baseline (ODR-0018 §Rules 1) is the right ceiling.
DCMI's hard-earned lesson — across DCMI Metadata Terms, DCAT, and the Usage
Board Guidelines (2014) — is that **blanket annotation is governance theatre**.
A `dpv-pd:hasPersonalDataCategory` triple that nobody owns is worse than no
triple: it carries the audit-trail liability of a maintained assertion without
the maintenance.

The curated set ODR-0018 ratifies (`opda:Person`, `opda:Organisation`,
`opda:Address`, `opda:RegisteredTitle`, `opda:LegalEstate`,
`opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`,
`opda:VouchEvidence`) is the right scope: each Kind has been deliberated under a
named `kind: pattern` ODR, each carries a steward-assigned variant table, each
has a regulator-pinned citation. That's a governance act, not an annotation
sprawl.

**Per-Kind steward discipline (DCMI Usage Board precedent + ODR-0011 §1a):**
each Kind in the curated set MUST have a named expert with deputy (FIBO
precedent — Bennett's "one named ontologist, one named deputy" rule). The
deputy carries continuity when the lead is unavailable; both are recorded in
the scheme's `dct:creator` + an `opda:hasDeputyCreator` (or equivalent — I'd
defer the predicate choice to Pandit). Without named stewards, the curated set
drifts into the same un-owned-annotation failure mode the DCMI UB Guidelines
were written to prevent.

## Q2 — Lawful-basis vocabulary as TBox SKOS scheme

**FOR Pandit's position.** The lawful-basis vocabulary is TBox-expressible and
Session 001's Phase-1-only floor was a conservative call that the corpus has
now outgrown. The DCMI precedent is clean: **lawful basis is a SKOS scheme**,
not a per-instance string constraint.

`opda:LawfulBasisScheme` per Article 6 GDPR (the six bases: Consent, Contract,
LegalObligation, VitalInterests, PublicTask, LegitimateInterest) +
Article 9 special-category bases (the ten Art. 9(2) bases). The scheme is
authored at TBox level; instances populate it at generation time per
ODR-0018 §3a's mapping-table dispatch.

Where does it fit in ODR-0011 §8a's seven-category framework? Two viable
candidates:

- **Method/plan code** — lawful basis is a procedural authorisation for a
  processing Activity, parallel to `sellersCapacity` authorising a sale
  Activity. This reading is clean if Pandit treats lawful basis as
  *authorising the processing Activity*.
- **Role label** — lawful basis labels the *Role the controller plays* in a
  processing Relator (data-subject ↔ controller ↔ purpose). This reading is
  clean if Pandit treats lawful basis as *labelling the controller's
  relational stance*.

Pandit owns DPV; Pandit decides which UFO category the scheme binds to. I'll
back either with the DCMI-stewardship discipline either way. My only
non-negotiable: the scheme has a named steward (Pandit, presumably) with a
deputy, per Q1.

## Q3 — Special-category vocabulary depth

**CONCEDE Pandit's Article-10 depth.** `cred:Criminal`-data tags + AML outcomes
+ `cautionOrConviction` need their own DPV scheme structure, not just a
`dpv:hasSpecialCategoryPersonalData` flag. The DCMI lesson: **flat boolean
flags lose audit-trail granularity** the moment a regulator asks "*which*
special category, under *which* Art. 9 sub-paragraph?"

My contribution: **vocabulary stewardship for the special-category SKOS scheme
mirrors Q2's discipline**. `opda:SpecialCategoryScheme` carries:

- Named steward (Pandit, presumably) + deputy.
- `dct:source` verbatim to GDPR Art. 9(1) categories + Art. 10 (criminal
  convictions/offences) per ODR-0011 §4a.
- Sub-scheme structure for AML outcomes (the AML regulations carry their own
  outcome taxonomy distinct from GDPR Art. 9; the scheme needs to model both
  without conflating them).
- `skos:scopeNote` for OPDA-context elaboration (per S011 Q4 amendment —
  paraphrase NEVER in `skos:definition`).

The DCMI framework registry analogue: each special-category Kind gets a
glossary row + canonical-schema-leaf path + regulator citation. ODR-0009's
evidence subclasses already carry this pattern at the Kind level; the
special-category scheme extends it to the *category values*.

## Q4 — ODRL deferral

**CONCEDE Iannella's deferral.** Authoring `odrl:Policy`/`odrl:Permission`/
`odrl:Duty` requires instances OPDA has not made; the catalogue admission
(ODR-0014 amendment) is sufficient for Phase 1. Guarino's contradiction stands:
ODRL TBox without instances asserts nothing. Pandit's brief permits no
instance authoring this round.

No DCMI angle to push back from. The catalogue admission preserves the option;
the deferral preserves the brief.

## Q5 — Cagle SHACL automation hook

**CONCEDE Cagle.** SHACL sensitivity gate per ODR-0012 §Rules + ODR-0013
already does the work. My only stewardship note: the SHACL shape itself MUST
be authored under a named expert (Cagle, presumably, per his S013 SHACL load)
+ deputy. Shape graphs are vocabularies in disguise — they need governance.
This is a tangential observation, not an amendment.

## Q6 — Defer to ODR-0016 (jurisdiction tagging)

**DEFER.** UK-GDPR + DPA 2018 jurisdiction tagging per
`dpv-legal:UK-GDPR` + `dpv-legal:DPA-2018` already carries in ODR-0012 §Rules.
ODR-0016 (Sequencing & Lifecycle, when ratified) is the right venue for the
phasing question. No DCMI amendment needed here.

## Q7 — DPV class-level co-annotation contract

**CONCEDE — settled.** ODR-0009 Q6 + ODR-0018 already cover the pattern.
ODR-0018 is the canonical mechanism; ODR-0012's role is to *consume* the
pattern + author the actual triples + variant mapping tables. My amendment
(below) constrains the authoring step.

---

## Baker amendment — Scheme-steward declaration in ODR-0012 §Rules

ODR-0012 §Rules MUST name a **scheme steward (lead + deputy)** for every SKOS
scheme it authors. The schemes presently in scope:

1. **`opda:LawfulBasisScheme`** (Article 6 GDPR) — proposed lead: Pandit (DPV
   owner); deputy: TBD per S013 expert assignment.
2. **`opda:SpecialCategoryScheme`** (Article 9 + Article 10 GDPR) — proposed
   lead: Pandit; deputy: TBD.
3. **`opda:PIICategoryExtensionsScheme`** (if any OPDA-specific extensions to
   `dpv-pd:` are needed beyond the canonical DPV-PD taxonomy) — proposed
   lead: Pandit; deputy: Baker (DCMI stewardship continuity).

**Mechanism (DCMI Usage Board Guidelines + ODR-0011 §1a):**

```turtle
opda:LawfulBasisScheme a skos:ConceptScheme ;
    dct:creator <https://opda.example/people/pandit> ;
    opda:hasDeputyCreator <https://opda.example/people/baker> ;
    dct:source <https://eur-lex.europa.eu/eli/reg/2016/679/oj#article-6> ;
    skos:scopeNote "OPDA application of GDPR Art. 6 lawful bases for processing PDTF transaction data."@en .
```

**Rationale:** Per ODR-0011 §1a, every SKOS scheme declares a steward
(`dct:creator`/`dct:publisher`); the DCMI UB Guidelines (2014) require named
ownership for vocabulary maintenance; FIBO's lead+deputy precedent gives
continuity. ODR-0012 authoring three new SKOS schemes without naming their
stewards repeats the un-owned-annotation failure mode the DCMI framework was
written to prevent.

**Enforcement:** `odr-review` lint extension — any ODR authoring a
`skos:ConceptScheme` MUST carry `dct:creator` + `opda:hasDeputyCreator` on
each scheme. Blocker on `status: accepted` per A9 enforcement discipline.

## What this position does NOT cover

- The `opda:hasDeputyCreator` predicate choice — Pandit's call (DPV owner +
  Queen).
- The specific Article 6 / Article 9 / Article 10 concept lists — Pandit's
  call. I provide the stewardship contract; Pandit provides the vocabulary.
- ODR-0018's variant-mapping-table generator emission — Cagle's load
  (SHACL/SHACL-AF operationalisation).
- The PII-category-extensions scheme — only if Pandit determines OPDA needs
  extensions beyond canonical `dpv-pd:`. If not, the scheme is dropped from
  the steward list; my amendment scope reduces to the two GDPR-pinned
  schemes.

Per ODR-0001 §Two-artefact discipline + S011 B3 EXPAND default.
