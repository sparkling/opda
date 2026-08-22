---
status: accepted
date: 2026-07-13
updated: 2026-08-22
tags: [information-architecture, navigation, dbt, smart-data, guidebook, policy, astro]
supersedes: []
depends-on: [ADR-0002, ADR-0059]
implements: []
---

# DBT Smart Data implications for SPDTF and PDTF schema lineage

## Context and Problem Statement

The Department for Business and Trade (DBT) is drafting a cross-sector **Smart Data
Guidebook** — a Preamble plus five numbered chapters — that will shape how every UK
Smart Data scheme (open banking, open energy, **property**) is expected to operate
under the Data (Use and Access) Act 2025. It is currently advisory, but it says of
itself that schemes "may, over time, be expected to align with its principles more
formally". This is soft law hardening: what OPDA does not contest now becomes a
de facto requirement later.

OPDA is not a bystander to this. Its Chair sits on the **Smart Data Council** (DBT's
cross-sector advisory body) and chairs the **Smart Property Data delivery group**
within DPMSG. The Guidebook's Preamble uses "Open Property" and "PDTF" when describing
market activity. That is attributed source wording, not evidence that the PDTF schema
was an OPDA-endorsed scheme or that SPDTF has government approval. OPDA is on the review distribution for every chapter, with a
Call for Evidence open and a review deadline of **24 July 2026** for Chapter 5.

The site's current coverage is a single page, `/governance/smart-data-guidebook`,
created when only Chapter 5 had been circulated. All six documents are now in hand
(Preamble + Chapters 1–5, plus a liability scoping paper and the Which? consumer
response). A single page nested under `/governance` cannot carry them, and — more
importantly — nesting it there frames the Guidebook as a *governance reference*, when
its real significance to this project is **the set of data-modelling and scheme
capabilities SPDTF may need**.

**A framing point that governs the whole section: DBT Smart Data, the PDTF schema and
SPDTF are distinct.** DBT Smart Data is a cross-sector government programme under the
DUA Act. The PDTF schema is the existing Digital Property Pack technical input, and its
separately identified schema-derived ontology is an extracted artefact. SPDTF is the
first collaboratively authored scheme draft. None may be presented as a government-
approved statutory property scheme. The relationship is conditional: if and when
property becomes a designated Smart Data scheme, SPDTF may need to express capabilities
the Guidebook assumes.

The first draft of these pages got this wrong — writing "live conformance failure" and
"PDTF fails them today", as though the Guidebook were a specification OPDA is in breach
of. That misrepresents OPDA's position and concedes ground that has not been conceded.
Corrected throughout: gaps are stated as **capability** ("the schema-derived ontology
cannot currently encode X" or "SPDTF needs to decide X"), never as compliance. The one genuine exception is SD8, where OPDA's *own*
`governance.md` publishes a selective-disclosure capability it does not have — that is a
real defect, because it is OPDA failing OPDA's own claim, and it would be wrong even if
the Guidebook did not exist.

That is the crux. The Guidebook repeatedly conflates two different kinds of obligation:

* what a **scheme operator** must *do* (run FAPI-grade APIs, authenticate participants,
  operate incident response); and
* what a **scheme's semantic model** must be able to *encode* (a consent grant, a delegated
  authority chain, an accreditation status, the provenance of a computed output).

SPDTF is being developed as a scheme, with a semantic model and operating-governance
concerns that must be kept distinct. Conflating them either overstates the model's
obligations (implying it must implement a security stack) or understates them (implying
"it's just UX, not our problem" for consent). Both readings are wrong, and neither is
recoverable from a page that merely summarises DBT's text. The site needs to hold the
*separation* — and the gap register that falls out of it.

A complicating fact, established during this work: OPDA has **also** taken on
responsibility for developing prospective property-scheme accreditation criteria and
scheme standards. That market role is not government designation. Chapters 1 and 2
therefore land on OPDA at *both* layers. The layer separation must be an analytical
device applied per ask, not a blanket "we're only a standard" defence.

## Decision Drivers

* Follow the established precedent for adding a global-nav section
  ([ADR-0059](./ADR-0059-rml-mapping-section-positioned-between-ontology-and-schema.md),
  which added `/mapping`): a new top-level section is the right answer when material is
  substantive, has its own audience, and is mis-served by nesting inside a section whose
  purpose is different.
* The Guidebook is an **external, evolving corpus on someone else's release cadence**.
  It will keep arriving (chapters revise; Chapter 6 is implied; sessions recur). It needs
  a container that grows, not a page that accretes headings.
* The load-bearing artefact is the **schema-to-scheme analysis**, not the chapter summaries.
  A reader — and the Technical WG — needs to know what the existing schema-derived
  ontology can express and what SPDTF must decide.
  That analysis is cross-cutting; it cannot live inside any one chapter page.
* Claims about the schema-derived ontology's current capability must be **verified against the committed TTL
  corpus**, not asserted from the layer plan or projected onto SPDTF. During this work **five** “the current ontology already has
  this” assumptions proved false; a proposed sixth finding was retracted below:
  1. **ODRL, DCAT and DPROD** have zero occurrences in the corpus (they are on the layer
     plan only) — so every "PDTF can already express consent/permissions/datasets" claim
     resting on them is void.
  2. **DPV** is present only for personal-data categories and legal basis.
  3. **Selective disclosure is unsupported** — the only `bbs` string in the repo is inside a
     base64 PNG. The schema-derived corpus uses `Ed25519Signature2020` Linked Data Proofs only.
  4. **`trust-framework/docs/governance.md` published a capability OPDA does not have** —
     "selective disclosure enforced". **Withdrawn** (in the nested trust-framework repo, both
     the markdown and its built HTML mirror) and replaced with an accurate statement: data
     minimisation is enforced; selective disclosure is an objective requiring a BBS/SD-JWT
     proof suite, which is an open Technical WG decision.
  5. **Assurance levels do not exist.** `opda:assuranceLevel` was **deleted on 2026-07-05
     per ODR-0009** ("zero basis in the PDTF schema"); `AL1`–`AL4` have never existed at all.
     The first draft of this section asserted them as a current-model *strength* — i.e. presented a
     council-ratified *removal* to a working group as a capability. Caught only by
     adversarial review. **This is the cautionary tale that justifies the whole
     verify-against-corpus rule: an unverified conformance claim is worse than no page.**

**One claim this ADR previously made, and retracts.** An earlier revision recorded a sixth
"defect": that the legal-basis SHACL shape *can never pass*, because `opda-agent-shapes.ttl`
validates for `dpv:hasLegalBasis` while the corpus asserts `opda:lawfulBasis`. **That was
wrong**, and it is worth recording as an error rather than quietly deleting. The two are
*different layers*, not a mismatch: `opda:lawfulBasis` is the class-level co-annotation
(reference-not-import, [ODR-0012](../ontology/odr/ODR-0012-data-governance-layer.md)), while
`dpv:hasLegalBasis` is the **instance**-level predicate — and ODR-0012 makes instance-level
lawful basis explicitly **Phase-2**, because "a lawful basis is irreducibly an assertion about
a processing *act*". No exemplar carries special-category data, so the shape is simply not yet
exercised. `dpv:hasLegalBasis` stands as the instance-level predicate (operator decision,
2026-07-13). The generator and corpus are unchanged.

The lesson generalises the one above: reading a grep result without reading the ODR that
governs it produces confident, plausible, wrong findings — in *both* directions.
* Preserve the inbound link. `/governance/smart-data-guidebook` has been circulated by
  e-mail to the OPDA chair and to DBT-adjacent stakeholders. It must not 404.

## Considered Options

* **Option A (chosen) — New standalone `/dbt-smart-data` top-level section**, positioned
  after `governance` in `HEADER_ORDER`, with a page per Guidebook document plus a
  cross-cutting schema-to-scheme page and a gap register.
* **Option B — Keep it under `/governance` as a sub-tree** (`/governance/smart-data/*`).
  Rejected: `/governance` is *OPDA's own* governance — its rules, its members, its
  conformance scheme. The Guidebook is an external body's draft policy. Filing them
  together muddles "rules that bind us" with "another department's consultation draft",
  and buries the overlap analysis under a section nobody browses for modelling work.
* **Option C — Fold the chapters into `/modelling` as modelling inputs.** Rejected:
  loses the policy/engagement half entirely (review deadlines, Call for Evidence, who
  sits where), and most chapters are substantially *not* modelling obligations.
* **Option D — One page per chapter, no synthesis page.** Rejected: the synthesis is the
  entire point. Six faithful summaries of DBT's text, with no layer separation and no gap
  register, is work DBT has already done for us.

## Decision Outcome

Chosen option: **Option A — a new `/dbt-smart-data` top-level section.**

**Nav position** — `src/lib/site.ts`: insert `'dbt-smart-data'` into `HEADER_ORDER`
immediately after `'governance'`:

```
['strategy', 'governance', 'dbt-smart-data', 'engagement', 'modelling', ...]
```

and add a `dbt-smart-data` entry to `SECTIONS` with `title: 'DBT Smart Data'`.

**Page structure** — nine pages in three groups:

*Overview*
1. `/dbt-smart-data` — what the Guidebook is, DBT's role, OPDA's seat (Smart Data
   Council + DPMSG Smart Property Data delivery group), the shared six-part chapter
   template, a live status/deadline table, and a card grid into the corpus.

*The Guidebook*
2. `/dbt-smart-data/preamble` — 10 cross-cutting principles, the 8-category risk
   taxonomy and its use-case stress-test method, and how DBT governs the Guidebook.
3. `/dbt-smart-data/identity` — Ch.1, Digital Identity, Roles and Trust Frameworks.
4. `/dbt-smart-data/governance-compliance` — Ch.2, Governance, Compliance and Legal
   Framework (+ the accountability/liability scoping paper).
5. `/dbt-smart-data/user-lifecycle` — Ch.3, User Lifecycle and Experience (+ the Which?
   consumer response).
6. `/dbt-smart-data/stewardship-privacy-ethics` — Ch.4, Data Stewardship, Privacy and
   Ethics.
7. `/dbt-smart-data/security-risk-fraud` — Ch.5, Security, Risk and Fraud Management
   (the content migrated from `/governance/smart-data-guidebook`).

*Schema-to-scheme alignment*
8. `/dbt-smart-data/schema-to-scheme` — **the centrepiece.** The layer separation
   (scheme-operator obligation vs data-standard obligation vs both), applied ask-by-ask
   across all six documents. States plainly where an ask creates *no* data-modelling
   obligation, rather than manufacturing one.
9. `/dbt-smart-data/gap-register` — the ranked register of asks the schema-derived
   ontology **cannot currently encode** and requirements SPDTF may need to decide, each
   current-state claim verified against the committed TTL corpus, with the closing move
   for each.

**Gap numbering — `SD1`–`SD13`, and why not `G1`–`G13`.** The first draft numbered these
`G1`–`G13` and thereby **collided head-on with [ADR-0005](./ADR-0005-deferred-work-register.md)**,
whose deferred-work register already uses `G1`–`G25` for entirely unrelated items. "G4"
would have meant two different things in the same project. Renumbered to `SD*` (Smart
Data), which is unused.

The deeper point the collision exposed: ADR-0005 is this project's **single canonical
register of committed work**, and a parallel board is explicitly disallowed. The gap
register is therefore scoped as **analysis, not deferred work** — findings against an
external *draft* document, carrying no owner and no triggering condition. An item becomes
deferred work only when a council or WG adopts it, at which point it **moves to ADR-0005**.
Both pages now state this reciprocally, so the boundary cannot quietly erode.

**Migration + redirect** — `/governance/smart-data-guidebook` is removed; its Chapter 5
content moves to `/dbt-smart-data/security-risk-fraud`. `astro.config.mjs` gains
`'/governance/smart-data-guidebook': '/dbt-smart-data'` so the circulated link resolves
(following the ADR-0042 redirect precedent). The two inbound site links
(`/governance/departments#dbt`, `/engagement/meetings-decisions#sdGuidebook`) are
repointed at the new section.

**Source archive** — all 30 source files (21 `.docx` originals, every draft version rather
than just the latest, plus 9 rendered PDFs)
are filed under `source/02-policy-and-positioning/dbt-smart-data-guidebook/{preamble,
chapter-1..5}/`, absorbing the previous `opda-reports/sd-guidebook-chapter-5/` folder.
The latest version of each is converted to PDF (pandoc → headless Chrome) so it renders
in the in-site resource viewer; the `.docx` originals are retained alongside. Version
history is kept deliberately: Chapter 1 is at V7 and Chapter 2 at V5, and the drift
between drafts is itself evidence of where DBT's position is unsettled.

### Consequences

* Good, because the Guidebook gets a container that matches how it will actually
  arrive — chapter by chapter, revision by revision — instead of one page that grows
  unboundedly.
* Good, because the layer separation (scheme-operator vs data-standard) is given a
  first-class home. This is the analytical contribution; it is what turns DBT's
  consultation text into an OPDA work item.
* Good, because every "the schema-derived ontology already has this" claim on the
  schema-to-scheme and gap pages is checked against the committed TTL corpus rather than
  the aspirational layer plan — which caught five false capability claims and one live
  defect in OPDA's own artefacts: a published selective-disclosure claim that was untrue.
* Good, because the circulated `/governance/smart-data-guidebook` link keeps working.
* Bad, because `HEADER_ORDER` grows to twelve items. The global nav is now dense, and
  this ADR does not solve that; it is noted as a real IA debt to be addressed when a
  thirteenth section is proposed, not before.
* Bad, because the section documents an *external, unratified draft*. Its content will
  go stale on DBT's cadence, not ours. Mitigated by dating every chapter page with the
  draft version it summarises (V7, V5, V2, V1…) so staleness is visible rather than
  silent.
* Neutral, because cross-section redundancy with `/governance/data-security` (OPDA's
  own security framework) is accepted, per the ADR-0041 M1 precedent. The two are linked
  reciprocally and disambiguated: one is *our* control framework, the other is *DBT's*
  guidance.

### Confirmation

* `make build` succeeds with the new `/dbt-smart-data/*` routes; `make test` stays green.
* The rendered header shows "DBT Smart Data" immediately after "Governance".
* `/governance/smart-data-guidebook` redirects to `/dbt-smart-data` rather than 404ing.
* Every chapter page names the exact draft version it summarises, and links its source
  `.pdf` + `.docx` via `resource-link`.
* Every "does the schema-derived ontology have this?" cell on `/dbt-smart-data/schema-to-scheme` and
  `/dbt-smart-data/gap-register` is traceable to the committed TTL corpus — no claim
  rests on the layer plan alone. **This was NOT true on first draft** and was caught by
  the adversarial review: the pages asserted the current ontology "has AL1–AL4" assurance levels, which
  have *zero* occurrences in the corpus — `opda:assuranceLevel` was **deleted on
  2026-07-05 per ODR-0009** ("zero basis in the PDTF schema"). A ratified *removal* was being
  presented to a working group as a *strength*. Corrected: it is now gap SD13. The lesson
  is recorded here deliberately — an unverified conformance claim is worse than no page.
* `make resources-manifest` indexes all 30 guidebook files under "Policy & positioning";
  `make publish-resources` mirrors them so every `resource-link` resolves on the live site.

## More Information

* [ADR-0059](./ADR-0059-rml-mapping-section-positioned-between-ontology-and-schema.md) —
  the precedent this ADR follows for adding a top-level nav section.
* [ADR-0042](./ADR-0042-rename-manual-section-to-model.md) — the redirect precedent for
  keeping externally-circulated URLs alive across an IA move.
* [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — the slug taxonomy the
  new `/dbt-smart-data/*` routes follow.
* [`/governance/data-security`](../../src/pages/governance/data-security.astro) — OPDA's
  own security control framework, which Chapter 5 sits alongside (not above).

## Amendments

- **2026-08-22 — Chair-authority terminology correction.** The Guidebook's use of
  "PDTF" is retained only as attributed source wording. The existing OPDA technical
  input is the PDTF schema; the committed TTL is its separately identified
  schema-derived ontology. Neither is an OPDA-endorsed predecessor scheme. SPDTF is the
  first collaboratively authored scheme draft, so the section now analyses the
  schema-to-scheme transition and never treats current TTL capability as SPDTF approval.
  Source documents, evidence and stable `/pdtf/**` identifiers are unchanged.
