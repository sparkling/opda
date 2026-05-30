# Council Session 019 — Bounded-Context Representation

- **Date:** 2026-05-30
- **Convened by:** OPDA semantic-modelling lead
- **Format:** ODR-0001 Linked Data Council with Devil's Advocate (two rounds)
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO modular methodology)
- **Devil's Advocate:** Ian Davis (BBC / UK Government linked-data; ex-Talis)
- **Panel (7 voices):** Eric Evans & Vaughn Vernon (DDD bounded contexts); Fabien Gandon (URI/namespace strategy); Jim Hendler (URI-graph governance); Tom Baker (SKOS / vocabulary catalogue); Kurt Cagle (operational SHACL / AI-consumer); Giancarlo Guizzardi (UFO / OntoClean)
- **`consensus-mode`:** `byzantine` (per-question voting; Queen synthesis)
- **Ratifies:** [ODR-0019 — Bounded-Context Representation](../ODR-0019-bounded-context-representation.md)

## Context

Two open representation questions were routed to Council. **Round 1:** to denote a term's bounded-context membership, should OPDA use a separate namespace per context (Q1), SKOS (Q2), or both (Q3) — and can an entity belong to multiple contexts (Q4, the crux)? **Round 2** (user-pressed re-open trigger #1): how do you differentiate the *same term carrying different meanings* in different contexts, given the single namespace — i.e. how do you say "the property as defined in Context A" vs "in Context B"?

Constraining precedent: single `opda:` namespace fixed 9-0 at S001 Q7 (ODR-0004); `owl:sameAs` forbidden (ODR-0005 Rule 5); spanning leaves collapse to one term + SHACL profiles (ODR-0008 / ODR-0010).

---

## Round 1 — Namespace vs SKOS vs Both; multi-membership crux

### Positions (condensed)

- **Evans & Vernon (DDD).** A bounded context is a boundary around a *model*, not a tag on a shared entity; PDTF is the *unowned* Published Language. Per-context namespaces mistake the PL for the contexts. Q4 YES (multi-membership is the rule). Q1✗ Q2✓ Q3✗.
- **Gandon (URI).** Namespace = minting/governance home (definition), not usage. FIBO's per-module namespaces argue for the by-concern TTL modules, not per-context prefixes. Q4 YES (cross-context table: address ×10, ownership ×10, energyEfficiency ×9). Q1✗ Q2✓ Q3✗.
- **Hendler (governance).** Each namespace is an independent versioning/governance commitment; the 6 contexts share OPDA's single release train. Steward-plurality already captured by `opda:hasSteward`. Q4 YES. Q1✗ Q2✓ Q3✗.
- **Baker (SKOS).** SKOS organises contexts *alongside* the term graph; term→context is `dct:subject` (not a `skos:` relation). Q4 YES. Q1✗ Q2✓ Q3✗.
- **Guizzardi (UFO).** Context membership is anti-rigid/perspectival — never a namespace (fractures identity) nor a subclass. Q4 YES. Q1✗ Q2✓ Q3✗.
- **Cagle (operational).** Membership is already a typed fact via `opda:ValidationContext opda:requires <term>`; derive it, don't hand-tag. Q4 YES. Q1✗ Q2✗ (as hand-authored) Q3✗.
- **Davis (DA).** Both options solve a problem a single-team Published Language lacks; `opda:overlaysContext` already materialises the overlay→context link. Build nothing until a named term-grain consumer query exists. Q4 YES. Q1✗ Q2✗ Q3✗.

### Tally

**Q1 (per-context namespace): 7–0 AGAINST. Q3 (both): 7–0 AGAINST. Q4 (multi-membership): 7–0 YES** — the forcing function (an IRI lives in one namespace; multi-membership → duplication or forbidden `owl:sameAs`). **Q2: 5 FOR a SKOS context scheme, 2 (Cagle, Davis) gating it on derivation/consumer-naming.**

### Queen's synthesis (Kendall)

Verdict: **one `opda:` namespace; bounded contexts as a SKOS `skos:ConceptScheme` in `opda:`; term→context membership DERIVED from the overlay profiles (single source of truth), gated on a named consumer; context-specific constraints stay in SHACL overlay profiles.** FIBO, properly read, namespaces by *module-of-definition* (one home), never *context-of-use* (many homes) — so it demands the by-concern modules and forbids per-context prefixes. The 5-vs-2 split dissolves once two artefacts are separated: **(A)** the context vocabulary (reference data — model now) and **(B)** term→context membership (derive from profiles; ship the materialisation dormant per Davis's gate; hand-tag only profile-invisible terms per Baker/Cagle). Context concepts in `opda:`; predicate `opda:servesContext` (derived) / `dct:subject` (asserted exception); contexts are `skos:Concept`s, not `owl:Class`es (Guizzardi).

---

## Round 2 — Same term, different meaning across contexts (homonyms)

User challenge: "To disambiguate a term across contexts you need different identifiers; if the namespace does not follow the context, how can I say *this is the property as defined in Context A* vs *Context B*?"

### Positions (condensed)

- **Evans & Vernon (DDD).** The canonical DDD homonym ("Customer in Sales vs Support"). Homonymy → distinct **local name**, never distinct namespace; the namespace is the unowned PL. Real PDTF case found: `registeredCharge` (HMLR title entry vs mortgage instrument). Neutral supertype where contexts share an IC; two siblings + `skos:related` where none. **CONFIRM.**
- **Gandon (URI).** IRI is opaque (RFC 3986); local-name qualification disambiguates 100%; namespace adds only per-module docs/version surface, already supplied. `opda:Valuation` already exists as the Red-Book Kind with sibling sense-terms; FIBO never re-mints a homonym in a fresh namespace. "As defined in A" = a query. **CONFIRM.**
- **Hendler (governance).** Identifier = whole IRI; discriminator = local name. Different *meaning* never amounts to *independent governance commitment* while OPDA is the single minting authority — siblings version together. **CONFIRM.**
- **Baker (SKOS).** Live PDTF homonym `charge` (estate **rentcharge** vs **Notice of Transfer & Charge**). Load-bearing nuance: **two SKOS concepts ≠ two OWL classes** — split the OWL term only when reasoning/SHACL needs different kinds; SKOS-XL is over-build. **CONFIRM.**
- **Cagle (operational).** Disambiguation is automatic from payload provenance — the overlay *is* the context (`piq`→RICS, `fme1`→lender); the profile binds the context-correct term. Found no payload carrying two senses on one path. **CONFIRM.**
- **Guizzardi (UFO / OntoClean) — the decision rule.** A shared *label* is not a shared *Universal*. Supply an identity criterion: different IC → two Kinds → two local names. Worked table: *valuation* → 3 Kinds (Mortgage/RedBook/AVM ⊑ Valuation); *charge* → 3 Kinds (LegalCharge/Fee/LocalLandCharge). Never `owl:sameAs`; never `rdfs:subClassOf` a context; never the perspective in the namespace. **CONFIRM.**
- **Davis (DA) — empirical.** Counted: duplicate-prefLabel domain homonyms in the glossary = **0**; same-label/two-definition dictionary hits = **1**, and it is free-text boilerplate ("please outline the reasons why"). PDTF already disambiguates at local-name grain (`registeredCharge`/`serviceCharge`, `buildingRegulationsCompletion`/`completionAndMoving`). Build NO polysemy machinery; activation gate = ≥3 attested collisions AND a named consumer. **CONFIRM.**

### Tally

**7–0 CONFIRM** the Round-1 verdict, no revision. Premise split: "different meaning → different identifier" TRUE; "→ different namespace" FALSE (identifier = namespace + local name; the local name is the seat of identity).

### Queen's synthesis (Kendall)

Different meaning needs a different **identifier** — and a different identifier is a different **local name**, not a different namespace. A per-context namespace adds zero disambiguating power and re-imports the multi-membership break (+ forbidden `owl:sameAs`) onto the non-homonym majority. The **Identity-Criterion decision rule** (3-way: two local names / one term + SHACL profile / one term + SKOS gloss), Baker's concept-vs-class firewall, and Cagle's provenance short-circuit are ratified. The `opda:definedInContext` predicate records context-of-definition; "as defined in A" is a SPARQL query. The pattern is **ratified now** but the context-scoped-definition machinery is **gated** on Davis's threshold (≥3 attested collisions + a named consumer); the corpus attests ~0 genuine homonyms, so below the gate the rule is "mint two words, write two comments, stop." Folds into ODR-0019 (not a separate record); `depends-on` gains ODR-0006; ODR-0005 cited as the reason a per-context namespace fails.

## Outcome

[ODR-0019 — Bounded-Context Representation](../ODR-0019-bounded-context-representation.md), `status: accepted`, `kind: pattern`. Both rounds 7–0. Davis's dissent-from-building (not from the verdict) preserved as the binding activation gate (Rule 8). Re-open triggers recorded: IC-fracture → a second Kind (not namespace); independent-release-train → a namespace question for that sub-vocabulary only; Baker's OWL-split; Davis's ≥3-collision-plus-named-consumer.
