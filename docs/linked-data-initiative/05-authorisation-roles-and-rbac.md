# Authorisation, roles & RBAC

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.

## TL;DR

- 🟡 **What "modelled authorisation (RBAC)" actually means here is a *role + capacity + authority-evidence substrate*, grounded in UFO** — not a permission-policy engine. People and organisations are rigid **Kinds**; being a *Seller*, *Buyer* or *Proprietor* is an anti-rigid **Role/RoleMixin** that the Kind *plays*, founded by a relator (the Transaction or the Proprietorship). A Seller is not a *kind of* Person. (`source/03-standards/ontology/opda-agent.ttl`, ODR-0006.)
- ✅ **The genuine modelling win is the capacity-vs-authority split:** `opda:hasAssertedCapacity` (the sales-side *claim* — "I'm selling under power of attorney", SKOS-typed) is deliberately separated from `opda:hasEvidencedAuthority` (the conveyancing-side *proof* → an `opda:Claim` such as probate or a POA deed). PDTF collapsed both into one free-text enum; OPDA models the gap between asserted and evidenced authority as two predicates on two sides of the transaction.
- ✅ **Enforcement is SHACL, not policy triples.** The BASPI5 profile emits a Violation-severity `sh:xone` shape (`Baspi5_SellersCapacityShape`) that forces a Seller asserting a *regulated* capacity to carry an evidenced-authority link; an Info-severity SHACL-AF rule (`CapacityAuthorityMatchRule`) materialises an `unevidenced-capacity` flag wherever a capacity is asserted without backing evidence.
- ✅ **Controlled vocabularies back the roles:** a SKOS `RoleScheme` (13 members from the BASPI5 `role` enum — Seller, Buyer, Estate Agent, Lender, Surveyor, both Conveyancers…), a `ParticipantStatusScheme` (Proposed / Invited / Active / Removed), a `SellersCapacityScheme` (6 capacities) and an `OwnerTypeScheme` (Private individual / Organisation).
- 🔵 **There is no ODRL policy layer and no classic RBAC permission scheme in the emitted ontology — zero `odrl:` triples** (verified across the whole corpus; the only "permission" strings are *planning* permission). Machine-readable permission/consent policies (ODRL) are **adopted in the catalogue but deferred to Phase 2**, with three named activation triggers owned by ODR-0012 §Q4.
- **Honest one-paragraph framing:** *We modelled the actors, roles, capacities and authority-evidence (UFO + SKOS + SHACL); the machine-readable authorisation policies (ODRL permissions/consent receipts) are an adopted-but-deferred layer that plugs into this substrate.*

---

## 1. Why roles are not subclasses (the anti-rigidity discipline)

PDTF v3 models everyone attached to a transaction as a flat `participants[]` array, discriminated by a `role` enum, with `name`, `address`, `organisation`, `dateOfBirth` and `email` hanging off each entry, and tells `privateIndividual` from `organization` only as two more enum values (ODR-0006 §Context). This is the participant twin of the implicit-Property defect (the identity crux of ODR-0005): identity-supplying things (a person, an organisation) are conflated with anti-rigid, externally-founded things (being a *seller*, a *buyer*, a *conveyancer*).

The fix is the UFO (Unified Foundational Ontology, Guizzardi) Kind / RoleMixin / Role layering. The discipline in one sentence: **put identity where identity actually lives (the person or the organisation), and make role-play anti-rigid and externally founded.** A `Seller` is not a *kind of* `Person` — a person is a seller only contingently, only in the context of a particular transaction, and stops being one when the transaction ends. Subclassing `Seller` under `Person` would assert the opposite (rigid, permanent, identity-defining membership) and is exactly the modelling error OPDA refuses.

Three UFO meta-categories carry this, each emitted as a foundation class in `opda-classes.ttl`:

| Stereotype | Emitted class | What it means | Identity |
|---|---|---|---|
| **Kind** | `opda:Person`, `opda:Organisation` | Rigid, sortal, identity-supplying substance | Carries its own identity criterion |
| **Role** | `opda:Role` (superclass) | Anti-rigid, **sortal** — borne by a *single* substantial Kind | **Borrows** identity from its bearer; never keyed |
| **RoleMixin** | `opda:RoleMixin` (superclass) | Anti-rigid, **cross-sortal** — borne by *more than one* Kind (Person **OR** Organisation) | Parasitic on the (relator, bearer) tuple |
| **Relator** | `opda:Relator` (superclass) | Relational endurant that *founds* the roles and mediates the bearers | The (mediated-bearers, founding-event) tuple |

> **RoleMixin vs Role — the distinction that matters.** A **RoleMixin** is *cross-sortal*: a `Seller` can be a natural person **or** a company, so the role cannot commit to one bearer Kind. A **Role** is *sortal*: a `Proprietor` is borne by a Person (or, under a named specialisation, an Organisation — but never both at once). Both are anti-rigid and both are *externally founded* — they only exist because some **Relator** (a Transaction, a Proprietorship) brought them into being. The emitted `rdfs:comment` on `opda:RoleMixin` states this verbatim: *"borne by a bearer drawn from more than one substantial Kind… Distinguished from `opda:Role` (which is sortal — borne by a single Kind)."*

The emitted `opda:Role` comment also nails the anti-pattern: a Role *"NEVER supplies its own identity; it borrows identity from its bearer (ODR-0005 Anti-pattern §3 — never key a Role)."* This is why `opda:Proprietor`'s comment says it is *"NEVER keyed… a Proprietor has no identity qua Proprietor; identity borrows from bearer."*

---

## 2. The role inventory — what is actually emitted (and what isn't)

This is the highest over-claim risk in the whole knowledgebase, so be precise about the **two surfaces** on which roles exist, because they do not contain the same members.

### 2a. Role *classes* in `opda-agent.ttl` (the OWL/UFO surface) — three only

| Class | UFO stereotype | Founded by | Bearer Kinds |
|---|---|---|---|
| `opda:Seller` | **RoleMixin** (cross-sortal) | `opda:Transaction` relator | Person **or** Organisation |
| `opda:Buyer` | **RoleMixin** (cross-sortal) | `opda:Transaction` relator | Person **or** Organisation |
| `opda:Proprietor` | **Role** (sortal) | `opda:Proprietorship` relator | Person (Org under a named specialisation) |

The bearer Kinds are `opda:Person` and `opda:Organisation` (both UFO Substance Kinds; `opda:Organisation rdfs:subClassOf org:Organization`, the W3C Org ontology, FOAF having been ruled out in ODR-0002/ODR-0006). The founding relators are `opda:Transaction` (`opda-transaction.ttl`) and `opda:Proprietorship` (`opda-agent.ttl`), the latter mediating Property + Proprietor against a `opda:RegisteredTitle`.

> ⚠️ **Honesty flag — do not over-claim the class inventory.** ODR-0006 §Rules *names* a wider Role layer — `opda:Conveyancer`, `opda:EstateAgent`, `opda:Surveyor`, `opda:Lender`, `opda:Insurer` — as the intended design. **Those classes are not in the emitted TTL.** A grep of every emitted module returns only `Seller`, `Buyer` (RoleMixins) and `Proprietor` (Role) as agent role classes. The professional roles (Conveyancer, Estate Agent, Surveyor, Lender, …) exist **only as SKOS concepts** in `RoleScheme` (§2b), not as OWL classes. This is the ODR-as-design vs TTL-as-built gap; the honest claim is "the *pattern* covers all roles; the *emitted classes* are Seller, Buyer, Proprietor, with the rest carried as a controlled vocabulary pending their first modelling driver." (ODR-0006 itself notes the module is frozen behind a gate and Role-layer specialisations land "where downstream use requires".)

### 2b. Role *concepts* in `RoleScheme` (the SKOS surface) — thirteen members

`opda-vocabularies.ttl` emits `opda-v:RoleScheme` (`skos:prefLabel "Participant Role"`, `opda:ufoCategory "Role label"`) with members drawn from the BASPI5 `role` enum, each with `skos:prefLabel`, `skos:definition` and `dct:source` back to the data-dictionary leaf:

> Buyer · Buyer's Agent · Buyer's Conveyancer · Estate Agent · Landlord · Lender · Mortgage Broker · Prospective Buyer · Seller · Seller's Conveyancer · Surveyor · Tenant

The relationship between the two surfaces is deliberate and recorded on the `opda:role` predicate's `skos:scopeNote`: *"Both surfaces coexist: `?s a opda:Seller` AND `?s opda:role \"Seller\"` are non-redundant — the typed encoding is the canonical IC; the predicate is the notation surface BASPI5 and other JSON-based overlays consume."* In other words, the OWL class is the principled identity-bearing encoding; the `opda:role` datatype (range `xsd:string`, domain `opda:RoleMixin`) is the JSON-friendly notation that profile SHACL pins with `sh:in`.

> ⚠️ **Sub-flag — the `opda:role` predicate's domain is `opda:RoleMixin`, not `opda:Role`.** So `Proprietor` (a `Role`, not a `RoleMixin`) is technically outside this predicate's declared domain. Given RDFS domains are treated as *documentary, not reasoner-enforced* in this ontology (ODR-0027), this is a documentation imprecision rather than a validation bug — but it is worth knowing before quoting the predicate as a universal role surface.

### 2c. Participant lifecycle — `ParticipantStatusScheme`

`opda-v:ParticipantStatusScheme` (`opda:ufoCategory "Phase label"` — a UFO intra-Kind *phase*, not a role) carries the four lifecycle phases that replaced PDTF's old `isRemoved` boolean (PDTF v3.4 `participantStatus`):

> **Proposed** → **Invited** → **Active** → **Removed**

Modelling these as a SKOS phase-scheme rather than a boolean is the same discipline applied to lifecycle: a participant's *status* is a stage of an endurant, not a property of the role.

---

## 3. The capacity-vs-evidenced-authority split (the real authorisation logic) ✅

This is the closest thing to access-control reasoning in the build, and the cleanest modelling win in the facet. PDTF folds the legal basis on which a seller is *entitled* to sell into a single free-text `sellersCapacity` enum. That conflates two genuinely different things:

- a **claim** made on the sales side ("I am selling under a power of attorney"), and
- the **evidence** that backs it on the conveyancing side (the POA deed; the grant of probate).

OPDA splits them into two predicates that live on two sides of the transaction (`opda-agent.ttl`, ODR-0006 §Q4):

```turtle
opda:hasAssertedCapacity
    a owl:DatatypeProperty ;
    rdfs:label "has asserted capacity"@en ;
    rdfs:comment "Seller-side asserted capacity per opda:SellersCapacityScheme (SKOS). Sales-context
                  seam in the two-predicate Capacity/Authority split per S006 Q4. The assertion lives
                  on the Sales side; the evidence link lives on the Conveyancing side via
                  opda:hasEvidencedAuthority."@en ;
    rdfs:domain opda:Seller ;
    rdfs:range  xsd:string .          # SKOS-typed via SellersCapacityScheme in the profile

opda:hasEvidencedAuthority
    a owl:ObjectProperty ;
    rdfs:label "has evidenced authority"@en ;
    rdfs:comment "Conveyancing-side seam linking a Seller's asserted capacity to an opda:Claim of
                  authority (e.g. probate, power of attorney). The founding grant is modelled as the
                  missing Relator per ODR-0006 §Capacity split + ODR-0009 §Claim."@en ;
    rdfs:domain opda:Seller ;
    rdfs:range  opda:Claim .          # → the PROV-O-backed claims/evidence layer
```

The asserted side is a string typed by `opda-v:SellersCapacityScheme` (`opda:ufoCategory "Method/plan code"` — the codes that *authorise* the act of selling). Its six members:

> Legal Owner · Under Power of Attorney · Personal Representative for a Deceased Owner · Mortgagee in Possession · Assistant · Other

The evidenced side reaches into the claims/evidence module (`opda:Claim`, PROV-O-backed — ODR-0009), so a power-of-attorney *assertion* connects to a power-of-attorney *document* with full provenance. The founding legal grant itself (the act of granting POA, the act of issuing probate) is, in UFO terms, the *missing Relator* — recorded in the comments as the thing the split makes visible.

**Why this is the authorisation story:** RBAC, stripped to essentials, is "is this actor *entitled* to do this thing, and how do we know?" OPDA does not yet answer that with a permission rule, but it does model the two halves an answer needs — the entitlement *claimed* and the entitlement *evidenced* — and (in §4) it makes the mismatch between them machine-detectable.

---

## 4. Enforcement via SHACL (not policy triples) ✅

OPDA expresses constraints on valid role-play and authority-evidence as **SHACL shapes**, not as policy/permission triples. Three emitted shapes carry the authorisation-adjacent logic.

### 4a. Regulated capacity requires evidence — the Violation gate

The BASPI5 overlay profile (`profiles/baspi5.ttl`) emits `Baspi5_SellersCapacityShape` (`sh:targetClass opda:Seller`, `sh:severity sh:Violation`) as an `sh:xone` (exactly-one-of) over two branches — this is the real, emitted enforcement of the asserted→evidenced gate:

```turtle
<…/shape/Baspi5_SellersCapacityShape>
    a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:severity sh:Violation ;
    sh:xone (
        # Branch 1 — self-evidencing capacity: the Seller IS the legal owner
        [ sh:property [ sh:path opda:hasAssertedCapacity ;
                        sh:in ( "Legal Owner" "Mortgagee in Possession" … ) ;
                        sh:minCount 1 ] ]
        # Branch 2 — regulated capacity: MUST carry an evidenced-authority link
        [ sh:property [ sh:path opda:hasEvidencedAuthority ;
                        sh:minCount 1 ;
                        sh:message "BASPI5 B1.3.2-3: Personal Representative / Power of Attorney /
                                    Assistant / Other capacity requires sellersCapacityDetails +
                                    attachments."@en ] … ]
    ) .
```

The effect: a Seller declaring "Legal Owner" satisfies branch 1; a Seller declaring "Under Power of Attorney" or "Personal Representative for a Deceased Owner" can only validate via branch 2, which *requires* `opda:hasEvidencedAuthority` to be present. **A regulated capacity asserted without evidence is a hard validation failure (Violation tier).** That is authorisation logic — "you may claim this capacity only if you can evidence it" — expressed declaratively in SHACL. (The literal branch enums above are reconstructed from the emitted blank-node lists; the shape, target, severity and the `hasEvidencedAuthority sh:minCount 1` requirement are emitted verbatim.)

### 4b. Capacity-authority match — the advisory SHACL-AF rule

`opda-agent-shapes.ttl` emits `CapacityAuthorityMatchRule` (`sh:targetClass opda:Person`, `sh:severity sh:Info`), a SHACL-AF `sh:SPARQLRule` that *materialises* a status triple flagging the gap:

```turtle
CONSTRUCT { ?agent opda:hasCapacityAuthorityMatchStatus ?status . }
WHERE {
  ?agent opda:hasAssertedCapacity ?cap .
  OPTIONAL { ?agent opda:hasEvidencedAuthority ?auth }
  BIND (IF(BOUND(?auth), "matched", "unevidenced-capacity") AS ?status)
}
```

This surfaces, across *all* agents (not just in a strict profile), anyone "declaring a capacity (e.g. 'Director', 'Trustee') without an evidenced authority triple" as a downstream-tooling escalation hook — non-blocking (Info), deliberately, so it reports rather than rejects.

### 4c. Role value-space pinning — `sh:in` over the controlled vocabularies

Profiles constrain the *notation* surfaces with `sh:in`. In the BASPI5 Seller context the `opda:role` value is pinned to exactly `("Seller")` (`sh:minCount 1`, `sh:maxCount 1`, Violation) — correct, because a BASPI5 form is the seller's own disclosure. The `opda:ownerType` value is pinned to the `OwnerTypeScheme` members (`"Private individual"` / `"Organisation"`) by `OwnerTypeValueShape` (`sh:targetSubjectsOf opda:ownerType`, Violation). The general pattern: the *full* RoleScheme is the canonical value-space; each overlay profile pins a *subset* of it with `sh:in`, never minting a parallel scheme (ODR-0011 §1a).

> **Why SHACL and not OWL axioms for this?** Domain/range and `owl:sameAs` are deliberately *not* reasoner-enforced here (ODR-0025/0027): uniqueness and valid role-play are *closed-world, data-shape* questions, which is SHACL's job, not OWL's. So "a Seller must be played by a Person or Organisation" and "a regulated capacity must be evidenced" are validation constraints, exactly where they belong.

---

## 5. What is deliberately NOT here: the ODRL policy layer 🔵

**There is no ODRL policy layer and no classic RBAC permission scheme in the emitted ontology.** This is verified, not assumed:

- **Zero `odrl:` triples** across `source/03-standards/ontology/*.ttl`; **no `@prefix odrl`** declared anywhere in the ontology tree.
- The only "permission" strings in the entire corpus are **planning** permission (`planningPermission` ×7, plus comment text) — nothing to do with authorisation.

So the facet has **no** `odrl:Policy`, `odrl:Permission`, `odrl:Prohibition`, `odrl:Duty`, no consent receipts, and no role→permission grant table. What is built (🟡) is the *substrate* underneath such a layer: the actors, the roles, the capacities, and the authority-evidence link.

### 5a. Why deferred — and it's a decision, not an omission

ODRL is **adopted in the vocabulary catalogue but its policy-authoring is deferred to Phase 2.** The reasoning is recorded twice:

- **ODR-0002** (catalogue) places ODRL in the **Conditional** tier: *"Vocabulary admitted; policy-authoring deferred to Phase 2… ODRL `Policy`/`Permission` bite only on instances — TBox alone asserts nothing (Guarino)."* The PDTF brief constrained this round to **data-model-only — TBox, no instance data** — and an ODRL policy is irreducibly an *instance* ("this actor may do this action under this constraint"). Authoring a TBox-only ODRL would emit inert triples that assert nothing.
- **ODR-0012 §Q4** (governance) owns the activation trigger and confirms the deferral *"by the absence of any authored policy in the Phase-1 deliverable."*

The three named activation triggers (any one fires; ODR-0002 Change Log Q10 / ODR-0012 §Q4):

1. ODR-0012 authors a **consent-receipt** instance in published Turtle;
2. ODR-0009 authors a **VC-tied policy** instance (`cred:VerifiableCredential` + `odrl:Policy`);
3. an external policy-authoring consumer (a data licensor; FCA / ICO / EU RTS / UK MEES guidance) cites OPDA or requests ODRL-typed Turtle.

### 5b. How ODRL would plug into this substrate

The substrate is built so the deferred layer slots in cleanly, without re-modelling:

- **Policies bind to the roles + the data shapes.** An `odrl:Policy` would carry `odrl:Permission` / `odrl:Prohibition` rules whose `odrl:assignee` is a role from `RoleScheme` (e.g. *Buyer's Conveyancer*) and whose `odrl:target` is a class or SHACL-shaped slice of the data model (e.g. the PII-bearing leaves DPV already types). The roles and the targets already exist and are already dereferenceable; the policy is the only new artefact.
- **Consent receipts ride on the governance layer.** The DPV governance work (ODR-0012/0018) already types every PII-bearing leaf with `dpv:hasPersonalDataCategory` and flags special-category terms. A consent receipt would bind a lawful basis to a *processing act* over exactly those typed leaves — the `dpv:hasLegalBasis`-bound-to-an-event that ODR-0012 §Q4(c) explicitly reserves for Phase 2. (Note the emitted `SpecialCategoryPIIWithoutLawfulBasisShape` already *requires* a `dpv:hasLegalBasis` triple on special-category PII at Violation severity — the hook is in place.)
- **It connects to the trust framework's consent-based APIs.** OPDA's published 2026 vision commits to "universal trust-framework implementation incl. **mandatory consent-based APIs**." Machine-readable ODRL policies over these roles and data shapes are the formal substrate that turns "consent-based API" from a contract clause into something a machine can evaluate — the authorisation layer the role/capacity/evidence model is built to receive.

---

## Built vs planned

| Capability | Status | Evidence |
|---|---|---|
| Roles as UFO RoleMixins/Roles, not subclasses (anti-rigidity) | ✅ | `opda-classes.ttl` (`opda:Role`, `opda:RoleMixin`, `opda:Relator`); ODR-0006 |
| `opda:Seller`, `opda:Buyer` as **RoleMixins** founded by the Transaction relator | ✅ | `opda-agent.ttl` |
| `opda:Proprietor` as a **Role** founded by the Proprietorship relator | ✅ | `opda-agent.ttl` |
| `opda:Conveyancer / EstateAgent / Surveyor / Lender / Insurer` as **OWL classes** | 🔵 | Named in ODR-0006 §Rules; **NOT emitted** — exist only as SKOS RoleScheme concepts |
| `RoleScheme` (13 members), `ParticipantStatusScheme` (4), `SellersCapacityScheme` (6), `OwnerTypeScheme` (2) | ✅ | `opda-vocabularies.ttl` |
| Capacity-vs-authority split (`hasAssertedCapacity` / `hasEvidencedAuthority`) | ✅ | `opda-agent.ttl`; ODR-0006 §Q4 |
| `hasEvidencedAuthority` → `opda:Claim` (probate / POA, PROV-O-backed) | ✅ | `opda-agent.ttl` range; ODR-0009 |
| SHACL Violation gate: regulated capacity requires evidence | ✅ | `profiles/baspi5.ttl` `Baspi5_SellersCapacityShape` (`sh:xone`) |
| SHACL-AF advisory: `unevidenced-capacity` flag | ✅ | `opda-agent-shapes.ttl` `CapacityAuthorityMatchRule` (Info) |
| Role/owner-type value pinning via `sh:in` over the schemes | ✅ | `profiles/baspi5.ttl` (`opda:role`, `OwnerTypeValueShape`) |
| ODRL `Policy` / `Permission` / `Prohibition` / `Duty` triples | 🔵 | **Zero `odrl:` triples** emitted; ODR-0002 (Conditional), ODR-0012 §Q4 |
| Consent receipts / lawful-basis bound to a processing act | 🔵 | ODR-0012 §Q4(c), Phase 2; DPV hooks emitted (`SpecialCategoryPIIWithoutLawfulBasisShape`) |
| Classic role→permission RBAC grant matrix | 🔵 | Not modelled; would be ODRL policies over roles + shapes |

---

## Talking points for the quarterly tech review

- **"Modelled authorisation" = a principled substrate, honestly.** We model *who can act and on what authority* in three layers — Kinds (Person/Organisation) that *play* anti-rigid Roles (Seller, Buyer, Proprietor) founded by the transaction — and we keep the machine-readable *policy* layer (ODRL) as an explicit, triggered Phase-2 plug-in. That is a phased roadmap, not a gap; say it plainly.
- **The fraud-and-trust hook for lenders and HM Land Registry:** PDTF puts "selling under power of attorney" in a free-text box. We split the *asserted* capacity from the *evidenced* authority and emit a SHACL **Violation** that blocks a regulated capacity unless the evidence (probate, POA) is attached — and a non-blocking flag that surfaces every "capacity claimed, authority not evidenced" case across the dataset. That is exactly the asserted-vs-evidenced gap that conveyancing fraud lives in.
- **Roles are not subclasses — and that's a feature.** A Seller is not a *kind of* Person; it's a role a person (or a company) plays for one transaction and stops playing afterwards. Modelling it as a subclass would bake in a falsehood; the UFO RoleMixin/Role discipline keeps identity on the person and role-play on the transaction.
- **The vocabularies are the interoperability surface.** Thirteen participant roles, four participant-status phases, six seller capacities — all SKOS, all `dct:source`-traceable to the BASPI5 enum, all pinnable per-form with SHACL `sh:in`. Every system can agree on the same role IRIs without agreeing on each other's code.
- **Precision for the technical leads (so we don't over-claim):** three role *classes* are emitted (Seller, Buyer, Proprietor); the other professional roles are SKOS concepts today, with class promotion deferred to their first modelling driver. And there are **zero ODRL triples** — verified — so when someone asks "is the RBAC done?", the honest answer is "the actors, roles, capacities and authority-evidence are; the permission policies are the next layer."
- **The forward path to consent-based APIs is short.** OPDA's published 2026 mandate is mandatory consent-based APIs. The DPV governance layer already types the PII; the roles and data shapes already exist. ODRL policies over `assignee = role`, `target = shaped data` plus consent receipts are the only new artefacts needed — the substrate was built to receive them.

---

## Source files

**Emitted ontology (verified against these):**

- `source/03-standards/ontology/opda-agent.ttl` — `opda:Person`, `opda:Organisation` (Kinds); `opda:Seller`, `opda:Buyer` (RoleMixins); `opda:Proprietor` (Role); `opda:Proprietorship` (Relator); `opda:hasAssertedCapacity`, `opda:hasEvidencedAuthority`, `opda:role`.
- `source/03-standards/ontology/opda-classes.ttl` — the UFO foundation classes `opda:Role`, `opda:RoleMixin`, `opda:Relator`.
- `source/03-standards/ontology/opda-vocabularies.ttl` — `RoleScheme`, `ParticipantStatusScheme`, `SellersCapacityScheme`, `OwnerTypeScheme` and their concept members.
- `source/03-standards/ontology/opda-agent-shapes.ttl` — `CapacityAuthorityMatchRule` (SHACL-AF, Info), `OwnerTypeValueShape`, identity-key shapes, `SpecialCategoryPIIWithoutLawfulBasisShape`.
- `source/03-standards/ontology/profiles/baspi5.ttl` — `Baspi5_SellersCapacityShape` (the regulated-capacity-requires-evidence `sh:xone` Violation gate); `opda:role` / `opda:ownerType` `sh:in` pins.

**Decision records:**

- `docs/ontology/odr/ODR-0006-agents-and-roles.md` — agents & roles pattern (Kind/RoleMixin/Role, capacity split, SHACL constraints). *Note: §Rules names a wider Role-class layer than is emitted — see §2a flag.*
- `docs/ontology/odr/ODR-0002-ontology-language-adoption.md` — ODRL in the Conditional tier (adopted, policy-authoring deferred); Change Log Q10 (three activation triggers).
- `docs/ontology/odr/ODR-0012-data-governance-layer.md` — §Q4 ODRL deferral ownership; the DPV substrate consent policies would build on.
- `docs/ontology/odr/ODR-0009-claims-evidence-provenance.md` — `opda:Claim` / evidence layer that `hasEvidencedAuthority` targets.
- `docs/ontology/odr/ODR-0011-enumeration-vocabularies.md` — SKOS scheme mechanism for the role/capacity/status vocabularies.

**Backbone:** `docs/linked-data-initiative/_research-synthesis.md` §2(c), `_fact-sheet.md` (caveat 1).
