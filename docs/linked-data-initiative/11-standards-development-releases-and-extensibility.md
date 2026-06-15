# Standards Development, Releases, Modules & Extensibility

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.

This document covers how OPDA **governs and evolves** the PDTF standard *using the linked-data model itself*. It is the operational answer to the project owner's forward requirement — *"we will use this linked-data model to drive our governance and standards development, releases, modules, extensibility."* The model is not a static deliverable; it is the substrate on which change is proposed, deliberated, recorded, versioned, released, and extended, with an audit trail at every step.

For the *methodology* of the AI Linked-Data Council (how a session runs, who the panellists are, the directing-authority override) see KB doc 06; for the *generator and CI pipeline* (byte-identity, three-graph, the deterministic emitter) see KB docs 07/08. This document is about the **governance lifecycle that those mechanisms serve**.

---

## TL;DR

- **Change mechanism ✅** — the standard evolves through **ODRs** (Ontology Decision Records, `docs/ontology/odr/`) for modelling decisions and **ADRs** (`docs/adr/`) for engineering. Each is fed by an **AI-council session** with recorded votes (`N-M-K` for/against/abstain), a mandatory Devil's Advocate, and citations to real authorities — then routed to a real-world ratification flow (Working Group → Modelling Sub-Committee → AGM). 28 ODRs, ~37 council sessions, full provenance.
- **Release management ✅** — the ontology is at **v1.0.0**, carried by `owl:versionInfo` + `owl:versionIRI` → a dated release snapshot under `…/pdtf/harness/release/1.0.0/` (the DPV practice). No version in any term IRI. Releases are **reproducible**: the byte-identity CI gate proves a regeneration is identical to the committed corpus (cross-ref KB doc 07/08).
- **Modularity ✅** — six **concern-modules** (`property`, `agent`, `transaction`, `claim`, `descriptive`, `governance`), each `owl:imports` one flat base ontology. Modular = independently evolvable + composable; the file split is editorial (no per-module URL segment).
- **Extensibility ✅ (the key mechanism, ODR-0010)** — statutory forms (BASPI5, TA6/7/10, NTS2, LPE1, CON29, LLC1, FME1…) are layered as **SHACL overlay profiles** over the base **without forking it**. **31 profiles** ship in `source/03-standards/ontology/profiles/`. A new form or a regional/jurisdictional variant is *a new profile*, not a base change.
- **Conformance ✅** — a SHACL profile **is** a machine-checkable conformance contract: a dataset/system conforms to "BASPI5" iff it validates against `baspi5.ttl`. The standard becomes testable, not merely documentary.
- **Interface contract + change discipline ✅** — a CI gate enforces 3 rules on every profile (`sh:in` semantics · `sh:Violation` floor · no-identity-override). Deprecation follows a SHACL-AF lifecycle pattern (ODR-0017); the deferred-work register (ADR-0005) is the canonical backlog; published `/pdtf/` URIs are never demoted (backward-compatibility discipline, cross-ref KB doc 08).

---

## 1. Standards development driven by the model ✅

### 1.1 ODRs as the formal change mechanism

The standard does not change by edit; it changes by **decision record**. The corpus splits cleanly (DCAP discipline, ODR-0001):

- **Modelling decisions → ODRs** in `docs/ontology/odr/`. A `kind: pattern` ODR must state (a) the UFO/DOLCE meta-category, (b) the identity criterion over named hard cases, and (c) the artefact realisation in Turtle. This is what stops "the AI just made something up" — every modelling move is justified against formal-ontology theory and a concrete emitted artefact.
- **Engineering decisions → ADRs** in `docs/adr/`. Generator behaviour, emission mechanics, namespace/hosting, CI gates.

Each ODR carries machine-checkable frontmatter (`status`, `date`, `kind`, `council`, `depends-on`, `implements`, `supersedes`) linted by the `odr-review` skill against the project DCAP profile. The `depends-on`/`implements` edges make the decision corpus a **graph** — e.g. ODR-0010 (overlay mechanism) `implements:` ODR-0003 (programme) and ODR-0017 (SHACL-AF pattern), and is depended-on by ODRs 0004/0005/0006/0007/0009/0011/0013. A change anywhere has a traceable blast radius.

### 1.2 The AI-council process feeding real-world ratification

A proposed change is **scoped, deliberated, recorded, and emitted** along this path:

```
proposition
  → pre-flight scope-check (ratify / re-scope / retire)
  → convene council (format tier + consensus-mode; scoped panel)
  → one-message parallel spawn of Queen + Devil's Advocate + relevant experts
  → per-question deliberation with N-M-K vote tallies (verbatim dissent retained)
  → Queen synthesis (narrative verdict + tally appendix; "narrative wins")
  → produce / amend the ODR
  → route disposition to real-world ratification
```

The council produces a **proposal**, not a ratified standard. Real-world authority runs:

> **Council verdict** → **OPDA Working Group** → **Modelling Sub-Committee** → **AGM ratification** (`docs/ontology/odr/council/adoption.md`).

A human **directing authority** can override the council on greenfield grounds ("AI proposes, human disposes") — e.g. the council recommended hash URIs 5-2 in session-037; the authority kept slash (ADR-0006). The override is itself recorded, so the audit trail survives the disagreement.

The net effect on standards development: **the standard evolves with an audit trail** — every term, shape, and vocabulary value traces (via `dct:source`) to a data-dictionary leaf, glossary row, ODR section, or regulator, and every contested modelling move traces to a dated council session with recorded votes and dissent. This is the governance story KB doc 06 details; here the point is that *the model is the thing being governed, and the records are themselves data* (sessions are indexed in AgentDB per ADR-0027 for recall before convening).

---

## 2. Release management & versioning ✅

### 2.1 The ontology at v1.0.0

The base ontology header (`foundation.ttl`) carries the release coordinates:

```turtle
<https://opda.org.uk/pdtf/>
    a owl:Ontology ;
    dct:title "OPDA — Open Property Data Association Ontology"@en ;
    dct:issued  "2026-05-27"^^xsd:date ;
    dct:modified "2026-05-30"^^xsd:date ;
    dct:license <https://creativecommons.org/publicdomain/zero/1.0/> ;   # CC0
    vann:preferredNamespacePrefix "opda" ;
    vann:preferredNamespaceUri "https://opda.org.uk/pdtf/"^^xsd:anyURI ;
    owl:versionIRI  <https://opda.org.uk/pdtf/harness/release/1.0.0/> ;
    owl:versionInfo "1.0.0 — foundation + SKOS vocabularies + UFO meta-classes + module shapes + DPV annotations + overlay profiles + ValidationContext + hasSpecialCategoryData + bounded-context scheme (…)" ;
    opda:generatorVersion "opda-gen-1.0.0" .
```

Two load-bearing conventions (ODR-0006 / ADR-0006 namespace scheme):

- **No version segment in any term IRI.** `opda:Property` is `…/pdtf/Property`, *not* `…/pdtf/1.0.0/Property`. A published term URI is stable forever; the version lives in metadata, not the path. This is the DPV practice and it is what makes backward compatibility achievable (§6).
- **Version carried by `owl:versionInfo` + `owl:versionIRI` → a dated release snapshot** under `…/pdtf/harness/release/1.0.0/`. Each module and each profile gets its own `owl:versionIRI` snapshot too — e.g. `opda-property.ttl` → `…/harness/release/property/1.0.0/`; `baspi5.ttl` → `…/harness/release/profiles/baspi5/0.1.0/`. Modules track the ontology release line; profiles version independently (a form can move without bumping the base).

### 2.2 Semver discipline & the generator version

The `1.0.0` is a SemVer string and the generator stamps its own version (`opda-gen-1.0.0`) into every emitted file header. The intended discipline (ADR-0006 + the generator spec):

- **MAJOR** — a breaking change to a published term's meaning or a removed/redefined class/property (avoided by the never-demote rule, §6).
- **MINOR** — additive: new terms, new modules, new profiles, new vocabulary concepts. The common case.
- **PATCH** — non-semantic regeneration (serialisation, annotation text), provable by the byte-identity gate.

> 🟡 **Honest scope:** v1.0.0 is the first cut; the *snapshot directory* `…/harness/release/<v>/` is the published-IRI convention rather than a populated archive of historical releases today (there is one release line). The discipline and the IRI scheme are in place; the multi-release archive accretes as subsequent versions ship.

### 2.3 Relationship to the PDTF JSON-Schema cadence

PDTF's JSON Schema (`github.com/Property-Data-Trust-Framework/schemas`) releases on its own cadence — **v3.6 up for approval this workshop (Fri 2026-06-05)**, including updated TA-form alignment; recent line: v3.4 (`participantStatus`), v3.5 (NTS extensions, milestones, draft survey/valuation). The ontology's relationship to that cadence:

- The JSON Schema is the **authoritative input**; the ontology re-expresses it. The generator's input is the **data dictionary** distilled from the schema (1,557 leaves) plus the business glossary — so a schema release flows in through a regenerate, not a hand-edit.
- The two version lines are **decoupled but linked**: ontology v1.0.0 currently tracks the v3.x line with BASPI v5 support. A schema bump (e.g. v3.6's TA-form alignment) becomes a *minor* ontology release if it is additive — new leaves bind to new SKOS concepts / profile shapes — without disturbing existing `/pdtf/` URIs.
- Because the standard is now machine-readable, schema-vs-ontology drift is itself **testable** — the BASPI5 round-trip harness (ADR-0014) proves a real statutory form still goes JSON → ontology → validated RDF → JSON after a change.

### 2.4 Reproducible releases via the byte-identity gate

A release is only trustworthy if it is **reproducible**. The keystone CI gate (`tools/opda-gen/src/opda_gen/ci/byte_identity.py`) regenerates the entire corpus and diffs it byte-for-byte against the committed TTL. A green build means: *this release is exactly what the generator produces from these inputs* — no manual edits, no drift. The custom canonical N-Triples→Turtle serialiser exists precisely so this determinism holds (rdflib's serialiser is bypassed). Detail in KB docs 07/08; the governance point is that **"reproducible release" is enforced, not asserted**.

---

## 3. Modularity ✅

### 3.1 The six concern-modules + flat import structure

The ontology is partitioned **by ontological concern** (FIBO-style modules reconciled with UFO layering, ODR-0003 Q3), *not* by JSON page. Six emitted modules, each `owl:imports` the one flat base ontology at `https://opda.org.uk/pdtf/`:

| Module | File | Holds |
|---|---|---|
| Property | `opda-property.ttl` | Property / LegalEstate / RegisteredTitle / Address; the identity crux (ODR-0005) |
| Agent | `opda-agent.ttl` | Person/Organisation Kinds; Seller/Buyer/Proprietor/Conveyancer roles (ODR-0006) |
| Transaction | `opda-transaction.ttl` | Transaction-as-Relator; lifecycle/milestones (ODR-0007) |
| Claim | `opda-claim.ttl` | PROV-O evidence/claims/assurance backbone (ODR-0009) |
| Descriptive | `opda-descriptive.ttl` | the collapsed descriptive layer (EPC, council-tax band, built-form…) (ODR-0008) |
| Governance | `opda-governance.ttl` | DPV mapping records; sensitivity gate (ODR-0012) |

The import structure is **flat**: every module imports the base; modules do not import each other. The base in turn carries the foundation, SKOS vocabularies, UFO meta-classes, and (via the namespace scheme) the shape and graph sub-namespaces.

### 3.2 Why modular = independently evolvable + composable

- **Independently evolvable** — a change to the Claims module (PROV-O backbone) does not touch the Property module's identity criterion. Each module is governed by its own ODR(s) and can release on its own `owl:versionIRI`. The `depends-on` graph in the ODR frontmatter makes the coupling explicit where it exists (e.g. Address is a gate before Agents and Descriptive).
- **Composable** — a consumer loads only the modules it needs (a lender's KYC tool may load `agent` + `claim` + `governance` and skip `descriptive`). Because all six import one base, the term namespace is unified — `opda:Property` means the same thing in every module.
- **Editorial, not architectural, file split** — the six files are *not* six URL segments. Terms live in one flat namespace (`…/pdtf/`); the modules are how authors and reviewers navigate, not how the standard is addressed. This keeps the published surface stable even if the internal file layout is reorganised.

---

## 4. Extensibility via overlays/profiles (ODR-0010) — the key mechanism ✅

This is the centre of the "drive extensibility from the model" requirement.

### 4.1 Forms as SHACL profiles over the base — without forking

PDTF is a base transaction plus a family of **form overlays** (BASPI5, TA6/7/10, NTS2/NTSL2, PIQ, CON29R/DW, LLC1, OC1, LPE1, FME1, RDS, SR24…) composed at runtime by the schema's deep-merge. A naïve OWL re-expression would mint a class per form (`baspi:PropertyPack`, `ta6:PropertyPack`) — **rejected unanimously** in council (session-001 Q3/Q5): that nesting is *form ergonomics, not ontology*, and would let a form **declare** rather than **constrain**, multiplying near-duplicate classes and inviting identity drift.

The adopted mechanism (ODR-0010): **each form is a named, dereferenceable SHACL profile graph over a fixed, open-world TBox.** A form *is* its SHACL overlay; the shapes **constrain, they do not declare**. The base class model never forks. **31 profiles** ship under `source/03-standards/ontology/profiles/`:

```
baspi5  nts2  ntsl2  piq  ta6  ta7  ta10  lpe1  fme1  con29R  con29DW
llc1  oc1  rds  sr24                                   ← 15 active main
as dr er fd hi hs jk la ma mc oa oc sb sf sl tf        ← 16 NTS2 extensions
```

(The 3 legacy editions `baspi4`/`nts`/`ntsl` are out of scope — OPDA validates current-edition data only, and CI *asserts them absent* so they can't be silently re-added.)

### 4.2 The canonical mapping (ODR-0010 Rules 1–5)

A form's JSON constructs map to SHACL deterministically:

| Form construct | SHACL output | Note |
|---|---|---|
| `required: [...]` | `sh:property [ sh:path … ; sh:minCount 1 ]` | additive on graph-union |
| `enum` member list | a single **merged** `sh:in (…)` | build-step **replacement**, not two stacked `sh:in` (two are conjunctive — the opposite of the union intent) |
| `oneOf` discriminator | `sh:xone (…)` + `sh:qualifiedValueShape` | exactly-one; needs a SHACL-AF-capable validator |
| per-leaf form ref (`baspi5Ref`) | `dct:source <…form-question IRI>` | shape → question → form traceability chain |
| field order / section | `dash:viewer`/`dash:editor` + `sh:order` + `sh:group` | renders the form from the profile |

A profile is reified as a first-class **`opda:ValidationContext`** (Guarino's withdrawal condition): a `sh:minCount 1` is a constraint *of a named context* — "required under the BASPI5 profile" — not a free-floating axiom whose truth depends on which files a build call passed.

### 4.3 How BASPI5 overlays the base (worked example) ✅

`profiles/baspi5.ttl` is the MVP slice. It targets base classes via `sh:targetClass` (never `owl:imports`) and carries per-form cardinality, enum subsets, DASH render hints, and `dct:source` to each form question. The header:

```turtle
<https://opda.org.uk/pdtf/shape/profiles/baspi5>
    a owl:Ontology ;
    dct:title "BASPI5 overlay profile"@en ;
    dct:subject opda:EstateAgencyContext ;          # form → community (one triple)
    owl:imports <https://opda.org.uk/pdtf/> ;
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/profiles/baspi5/0.1.0/> .

opda:Baspi5ValidationContext
    a opda:ValidationContext ;
    opda:profileURI  <https://opda.org.uk/pdtf/shape/profiles/baspi5> ;
    opda:sourcedFrom <https://www.basp.uk/forms/baspi5> ;
    opda:formVersion "5.0.3" .
```

The sharpest construct is the `sellersCapacity` discriminated union — the `oneOf` that distinguishes a Legal-Owner/Mortgagee seller from a Personal-Representative/Attorney seller (the latter requiring evidenced authority). It becomes a `sh:xone` on `opda:Seller`:

```turtle
<…/shape/Baspi5_SellersCapacityShape>
    a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:severity sh:Violation ;
    sh:xone ( [ sh:property [ sh:path opda:hasAssertedCapacity ;  sh:in ("Legal Owner" "Mortgagee in Possession") ; sh:minCount 1 ] ]
              [ sh:property [ sh:path opda:hasAssertedCapacity ;  sh:in ("Personal Representative…" "Under Power of Attorney" …) ; sh:minCount 1 ] ,
                           [ sh:path opda:hasEvidencedAuthority ; sh:minCount 1 ;   # ← the extra obligation
                             dct:source <https://www.basp.uk/forms/baspi5#B1.3.2> ;
                             sh:message "B1.3.2-3: PR/PoA/Other capacity requires sellersCapacityDetails + attachments." ] ] ) .
```

This is exactly the gap PDTF collapsed into free text — *asserted* capacity (`opda:hasAssertedCapacity`) is separated from *evidenced* authority (`opda:hasEvidencedAuthority → opda:Claim`, e.g. probate / power of attorney), and the profile makes the obligation machine-checkable. The non-conformant exemplar (a Seller acting as Attorney with no evidenced authority) reports a violation that traces `sh:sourceShape` → `dct:source` → `…/forms/baspi5#B1.3.2`. That round-trip — JSON → profile → validated transaction → re-rendered BASPI form — is the **programme's MVP gate** (ODR-0003 termination signal 1, demonstrated by `ci-baspi5-roundtrip`).

### 4.4 Thin vs full profiles, and overlay enumeration ✅/🟡

Most profiles ship **thin today** (header + community `dct:subject`) because their leaves needed `opda:` property paths to constrain. The descriptive TBox now exists, so the **eager-on-bindable + gap-register** discipline (session-034, ADR-0029) enumerates each form's leaves:

- **bind** a leaf when it resolves to exactly one `opda:` property (single domain);
- **GAP** a leaf (emit *no* `sh:path`, *no* `dct:source`) when it has no predicate, no domain, multiple domains, or a ref-collision — and record it in an **emitted per-form gap register** (`dct:description` on the form header).
- Result: **28 forms enumerated, 224 bindable leaves bound, 1095 GAPped**, each form carrying its gap register. `oc1`/`llc1` stay deliberately thin (authority-retrieved-register extracts, held per session-034 Q2). `baspi5.ttl` is unchanged and byte-identical.

This is *not* a YAGNI violation (ODR-0021 §Consequences): enumerating a form's own leaves into its shapes **is** the SHACL overlay's load-bearing job; it *uses* already-committed `opda:` identifiers and mints no new published IRI.

### 4.5 Adding a new form, or a regional/jurisdictional extension 🟡→✅ mechanism

The whole point is that **a new form is a new profile, never a base change**. With the generalised emitter (`ProfileSpec` + `_build_profile`, ADR-0029), per-form variation is *input data*, not code:

1. Walk the new overlay's JSON into a `ProfileSpec` (its `required`, `enum_subset`, `oneOf`, leaf refs, UI hints, community).
2. The emitter produces `profiles/<form>.ttl` — `sh:minCount`/`sh:in`/`sh:xone` + DASH + per-leaf `dct:source` + one `dct:subject` → its bounded-context concept.
3. CI runs the three-rule contract (§5) + the enum-union test + byte-identity on the new profile.
4. Its `owl:versionIRI` snapshots independently; the base `/pdtf/` URIs are untouched.

A **regional/jurisdictional extension** (e.g. a Scotland or Wales variant, or a new statutory search) is the same move: a new SHACL profile (and, if it introduces genuinely new concepts, additive SKOS concepts / descriptive terms via an ODR) layered over the base. The base ontology stays one shared model; the variant is a *constraint context* over it. Because the base term namespace is flat and un-versioned, the extension never has to fork or re-mint the shared vocabulary.

---

## 5. Conformance — profiles ARE machine-checkable contracts ✅

The extensibility mechanism doubles as the **conformance mechanism**: a dataset or system **conforms to a form iff it validates against that form's profile**. "Does this transaction satisfy BASPI5?" is answered by Apache Jena (the production SHACL 1.2 validator, ADR-0036/0037) running `baspi5.ttl` over the data and returning a clean `sh:ValidationReport`. The standard becomes **testable, not just documentary** — the difference between "the spec says a PR-seller needs evidence" (prose) and a validator that *rejects* a PR-seller with no `opda:hasEvidencedAuthority` and points at form question B1.3.2.

### 5.1 The profile interface contract (CI-enforced, 3 rules) ✅

For overlays to stay safe, ODR-0010 §Q8 + ODR-0013 define a **three-rule interface contract** that every profile must satisfy, enforced by `tools/opda-gen/src/opda_gen/ci/profile_contract_test.py` (one function per rule, empty list = pass):

| Rule | CI function | What it forbids |
|---|---|---|
| **`sh:in` semantics** | `check_sh_in_semantics` | a profile `sh:in` member that is **not** in the base SKOS scheme (an overlay may *restrict* to a subset of scheme notations; it may not invent values) |
| **`sh:Violation` floor** | `check_sh_violation_floor` | a profile shape that **downgrades** a base `sh:Violation` to a weaker tier (`Violation > Warning > Info`) |
| **No-identity-override** | `check_no_identity_override` | a profile shape that sets `sh:maxCount 0` on a **base identity-key property** (`opda:hasUPRN`, `opda:hasAddress`, `opda:identifiesSameProperty`, `opda:recordsEstate`) |

The third rule is the structural guarantee that **a form can never touch a Kind's identity** (Guizzardi's gate, ODR-0010 §Q6): a profile may add presence and vocabulary constraints; it may never restate or alter the identity criterion settled in ODR-0005. Identity belongs to the rigid Kind, not to a form context. This is what makes "layer a form over the base" *safe* — the contract is checked at build time, on every profile, so a silent mis-author (e.g. stacking `sh:in` into an intersection, or zeroing UPRN) fails the build rather than corrupting the standard.

---

## 6. Change management & deprecation ✅

### 6.1 SHACL-AF deprecation-lifecycle (ODR-0017 / ODR-0011 §5a)

When a vocabulary concept is retired, the standard does **not** delete it — deletion would orphan historical data and break dereferenceability. Instead a **three-case lifecycle** applies (ODR-0011 §5a):

| Case | Mechanism | Source |
|---|---|---|
| **Deprecation-with-replacement** | `owl:deprecated true` + `dct:isReplacedBy` → successor | DCMI; ISO 25964-1 §8 |
| **Retirement-without-successor** | `owl:deprecated true` + `skos:historyNote` (reason + date) | DCMI |
| **PII-bearing schemes** | deprecated concept stays **dereferenceable for the regulatory retention window** (≈12y post-completion, HMLR); `owl:deprecated` is a *state flag, not a delete signal* | Pandit amendment |

The lifecycle is materialised by a **SHACL-AF non-blocking rule** — the canonical deprecation-chain pattern (ODR-0017, the pattern extracted after a 4th citing site):

```turtle
opda:DeprecatedValueNonBlockingRule a sh:NodeShape ;
    sh:targetClass <…> ;
    sh:sparql [
        sh:select """SELECT $this ?value ?successor WHERE {
            $this ?p ?value . ?value owl:deprecated true .
            OPTIONAL { ?value dct:isReplacedBy ?successor } }""" ;
        sh:severity sh:Info ;     # sh:Warning when no substantive succession
        sh:message "Node {$this} uses deprecated value {?value}; replaced by {?successor} (if substantive succession)."
    ] .
```

The severity discipline is the key governance rule (ODR-0017 Rule 2): **`sh:Info`/`sh:Warning`, never `sh:Violation`.** Historical data using a deprecated value is *correct under its temporal scope* — informative, not normative-breaking. **New** data using a deprecated value, however, *does* trigger `sh:Violation` from the scheme's `sh:in` (the `sh:in` covers **active** concepts only; deprecated concepts are removed from `sh:in` at regeneration, and the byte-identity gate catches drift). So the same retirement simultaneously (a) preserves old records, (b) flags them for downstream awareness, and (c) blocks new use — all machine-checkably.

### 6.2 The deferred-work register as canonical backlog (ADR-0005) ✅

Deferred decisions are tracked in **one** named place so they don't rot. ADR-0005 establishes the **deferred-work register** as a *living ADR* — single document, named **owner** per item (WG / individual / EC), explicit **triggering condition**, items leaving when shipped/superseded/abandoned. (The ontology-programme slice, ADR-0005 §G, is the *retired* register now that the programme closed; the form-layer analogue is **ODR-0021**, a trigger-gated register of profile-layer enhancements like W3C PROF typing, conneg-by-profile, DCTAP-as-artefact — each ratified-as-deferred behind a named consumer trigger so the form layer isn't re-litigated.) Per house discipline this register is the canonical backlog — there is **no parallel project board**; the `/governance/deferred-work` page mirrors it with a Linked-artefact column.

The anti-pattern ODR-0021 codifies is worth stating: *"a standards-grounded 'this is the idiomatic way' argument is not a trigger."* Re-opening a deferred item requires a **named consumer or interop need**, recorded. This is the discipline that keeps the standard from accreting speculative machinery.

### 6.3 Backward-compatibility discipline ✅

The cardinal rule (ADR-0006 namespace scheme, cross-ref KB doc 08): **never demote a published `/pdtf/` URI.** Concretely:

- A term IRI (`…/pdtf/Property`) is **permanent** — no version segment means no excuse to re-mint it.
- A concept is deprecated, never deleted (§6.1) — its URI keeps resolving.
- A new release is **additive** (minor) by default; a breaking change is a major bump *and* a last resort, because the never-demote rule and the deprecation lifecycle exist precisely to avoid it.
- Reproducibility (byte-identity) means a consumer can pin a `owl:versionIRI` snapshot and know exactly what they validated against.

---

## 7. Tying it back to the requirement

> *"We will use this linked-data model to drive our governance and standards development, releases, modules, extensibility."*

| Requirement clause | How the model drives it |
|---|---|
| **governance** | decisions are ODRs/ADRs fed by recorded-vote council sessions → WG → Sub-Committee → AGM; sessions and edges are themselves data (ADR-0027); `dct:source` traceability throughout (KB doc 06) |
| **standards development** | the standard evolves by decision record with an audit trail, not by edit; modelling moves justified against UFO/DOLCE + a concrete emitted artefact |
| **releases** | `owl:versionInfo` v1.0.0 + `owl:versionIRI` → dated snapshots; SemVer; reproducible via the byte-identity gate; decoupled-but-linked to the PDTF JSON-Schema cadence (v3.6) |
| **modules** | six independently-evolvable, composable concern-modules over one flat base |
| **extensibility** | 31 SHACL overlay profiles layer statutory forms (and future regional variants) over the base **without forking**; a new form is a new profile; the interface contract + conformance are CI-enforced |

The linked-data model is not documentation *about* the standard — it **is** the standard, in a form that can be governed, versioned, released, modularised, extended, and conformance-tested by machine.

---

## Built vs planned

| Capability | Status | Evidence |
|---|---|---|
| ODR/ADR change mechanism (28 ODRs; DCAP frontmatter; `odr-review` lint) | ✅ | `docs/ontology/odr/`, `docs/adr/`, ODR-0001 |
| AI-council → WG → Sub-Committee → AGM ratification flow | ✅ | `…/odr/council/adoption.md`, ODR-0001, ODR-0003 |
| Ontology at v1.0.0 (`owl:versionInfo` + `owl:versionIRI`; CC0; no version-in-IRI) | ✅ | `foundation.ttl`, ADR-0006 |
| Per-module + per-profile `owl:versionIRI` release snapshots | ✅ | module headers; `baspi5.ttl` header |
| Populated multi-release historical archive under `…/harness/release/<v>/` | 🟡 | one release line today; IRI scheme + discipline in place |
| SemVer discipline (major/minor/patch) | 🟡 | convention stated (ADR-0006 + generator spec); first cut at 1.0.0 |
| Reproducible releases (byte-identity CI gate) | ✅ | `ci/byte_identity.py` (KB docs 07/08) |
| Six concern-modules + flat import | ✅ | `opda-{property,agent,transaction,claim,descriptive,governance}.ttl` |
| Overlay/profile extensibility (31 profiles, no-fork) | ✅ | `profiles/*.ttl`, ODR-0010, ADR-0013/0029 |
| `opda:ValidationContext` reification | ✅ | `baspi5.ttl`; ODR-0010 §Q1 |
| Profile interface contract (3 rules, CI) | ✅ | `ci/profile_contract_test.py` (`check_sh_in_semantics`/`_violation_floor`/`_no_identity_override`) |
| Eager-on-bindable + per-form gap register | ✅ | `inputs/leaf_resolver.py`; ADR-0029 (28 forms, 224 bound / 1095 GAPped) |
| Conformance = validation against a profile (Apache Jena, SHACL 1.2) | ✅ | ADR-0036/0037; `ci-baspi5-roundtrip` |
| SHACL-AF deprecation lifecycle (3-case; Info/Warning, never Violation) | ✅ | ODR-0017, ODR-0011 §5a |
| Deferred-work register (canonical backlog, named owner+trigger) | ✅ | ADR-0005; form-layer analogue ODR-0021 |
| Never-demote published `/pdtf/` URIs (backward compat) | ✅ | ADR-0006 (KB doc 08) |
| New form authored from a `ProfileSpec` (per-form variation as data) | 🟡 | `_build_profile`/`ProfileSpec` (ADR-0029); baspi5 still a bespoke builder by design |
| Regional/jurisdictional profile extension | 🔵 | mechanism in place (§4.5); no non-England&Wales profile authored yet |

---

## Talking points for the quarterly tech review

*(audience = mixed senior decision-makers + data/technical leads)*

- **"We govern the standard with the standard."** Every change to the PDTF model is a decision record (ODR/ADR) with a recorded-vote AI-council session behind it, routed to your real ratification flow (Working Group → Modelling Sub-Committee → AGM). The standard now evolves with a full audit trail — every field traces to its data-dictionary origin and the decision that shaped it.
- **Forms are extensions, not forks.** BASPI, TA6/7/10, CON29, LPE1, LLC1, FME1 — **31 statutory forms** are layered as SHACL profiles *over one shared base ontology*, never copying or forking it. Adding a new form, or a Scotland/Wales variant, is a new profile — and a CI gate guarantees a form can never break a property's identity or invent a value.
- **Conformance is now testable.** "Does this transaction satisfy BASPI5?" is answered by a validator, not a reading of the spec. A non-conformant case (e.g. a power-of-attorney seller with no evidenced authority) is rejected with a pointer to the exact form question. This is the substrate under *consent-based APIs* and *PDFs→APIs*.
- **Releases are versioned and reproducible.** The ontology is v1.0.0 with permanent, un-versioned term URIs and dated release snapshots; a byte-identity CI gate proves every release is exactly what the generator produces — no drift, no manual edits. It tracks the JSON-Schema cadence (v3.6) without disturbing published identifiers.
- **Change is disciplined.** Concepts are deprecated, never deleted (old records stay valid and resolvable; new use of a retired value is blocked) — and a single deferred-work register with named owners and explicit triggers is the canonical backlog, so the standard doesn't accrete speculative machinery.
- **Honest edges (phased, not gaps):** the multi-release *archive* and full SemVer history accrete as we ship beyond 1.0.0; the new-form `ProfileSpec` path is generalised but BASPI5 keeps its bespoke builder by design; no non-England&Wales profile is authored *yet* — the mechanism is ready for the first one.

---

## Source files

- `docs/ontology/odr/ODR-0010-overlay-profile-mechanism.md` — overlay/profile mechanism; the 5-rule canonical mapping; `opda:ValidationContext`; no-identity-override gate; 3-rule interface contract.
- `docs/ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md` — SHACL-AF non-blocking deprecation/lifecycle pattern (Info/Warning, never Violation).
- `docs/ontology/odr/ODR-0011-enumeration-vocabularies.md` §5a — three-case concept deprecation lifecycle; `sh:in` regeneration discipline.
- `docs/ontology/odr/ODR-0003-pdtf-ontology-programme.md` — programme/work breakdown; MVP round-trip gate; programme retirement criterion.
- `docs/ontology/odr/ODR-0021-deferred-form-profile-layer-enhancements.md` — trigger-gated deferred register for the form/profile layer (PROF, conneg, DCTAP…).
- `docs/adr/ADR-0005-deferred-work-register.md` — the canonical deferred-work register (named owner + triggering condition).
- `docs/adr/ADR-0006-w3id-opda-ontology-namespace.md` — namespace/versioning scheme; slash, no-version-in-IRI; release-snapshot `owl:versionIRI`; never-demote discipline.
- `docs/adr/ADR-0013-overlay-profile-emission.md` — overlay-profile emission + the 3-rule contract's CI enforcement.
- `docs/adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md` — `ProfileSpec`/`_build_profile` generalisation; 31-profile rollout; eager-on-bindable + gap register.
- `source/03-standards/ontology/profiles/` — the 31 emitted SHACL overlay profiles (`baspi5.ttl` worked; `llc1.ttl` thin).
- `source/03-standards/ontology/foundation.ttl` — base ontology header: `owl:versionInfo "1.0.0…"`, `owl:versionIRI …/harness/release/1.0.0/`, CC0 licence, `opda:generatorVersion`.
- `source/03-standards/ontology/opda-{property,agent,transaction,claim,descriptive,governance}.ttl` — the six concern-modules, each importing the flat base.
- `tools/opda-gen/src/opda_gen/ci/profile_contract_test.py` — the 3-rule interface-contract gate (`check_sh_in_semantics`, `check_sh_violation_floor`, `check_no_identity_override`).
- `tools/opda-gen/src/opda_gen/ci/byte_identity.py` — the reproducible-release keystone gate.
