# Evans + Vernon — Bounded-context pair position on S006

## Pair summary (≤120 words)

ODR-0006 lives at a **bounded-context seam**. Evans (*Domain-Driven Design* 2003, esp. Ch. 9 "Making Implicit Concepts Explicit" and Ch. 14 "Maintaining Model Integrity") and Vernon (*Implementing Domain-Driven Design* 2013, Ch. 2 "Domains, Subdomains, and Bounded Contexts" + Ch. 10 "Aggregates") frame the panel's hardest question — Q4 capacity-vs-authority — as a **context-boundary** problem, not a property-multiplicity problem. Asserted capacity lives in the **Sales bounded context** (the seller's self-described basis for the transaction). Evidenced authority lives in the **Conveyancing bounded context** (the regulated-profession verification of an instrument). Collapsing the two into one predicate is the textbook *anomalous context* anti-pattern. We concur with Guizzardi's UFO Kind/Role/Relator framing on Q1–Q3 and Q6–Q7 and concede Q5 to ODR-0015. **Q4 two-predicate split is non-negotiable** — and the authority predicate attaches to the verification activity (PROV-O), not to the seller.

## Per-question positions

### Q1 — Person Kind / Organisation Kind

**Evans:** AGREE Substance Kind framing inherited from ODR-0005. In DDD terms, Person and Organisation are *Entities* with identity (not Value Objects); their identity criteria are domain-significant because they are the **aggregate roots** for KYC verification, AML screening, and PII subject-access (Evans Ch. 5 "A Model Expressed in Software" §Entities and Value Objects). The Person individual persists through name-change, gender-recognition, and address-change because the aggregate root's identity is decoupled from its mutable attributes — exactly the `person-with-name-change.ttl` exemplar's framing (one Person, name-attribute revised via `prov:wasRevisionOf`).

**Vernon:** Concur, with the aggregate-design discipline. In *Implementing DDD* Ch. 10, the aggregate boundary is where invariants are enforced; Person-as-aggregate-root encapsulates the invariant "exactly one Person individual per natural-person-bearer-of-state-issued-ID" (matching the IC the panel will settle here). Organisation-as-aggregate-root encapsulates the invariant "exactly one Organisation individual per regulated-firm registration" — and the merger case (`organisation-with-merger.ttl`) shows the invariant correctly: two predecessor aggregates dissolve; a new successor aggregate forms with `prov:wasDerivedFrom` chains; never `owl:sameAs`.

**Vote (pair):** AGREE — Person and Organisation as UFO Substance Kinds + DDD aggregate roots. Domain-modelling-pattern overlay is consistent with Kendall+Davis's FIBO-anchored framing at S005.

### Q2 — RoleMixin vs Role distinction

**Evans:** AGREE the RoleMixin distinction. This is *Making Implicit Concepts Explicit* (Ch. 9) applied at the type-system level. The implicit concept is "the seller-role admits both Person-bearers and Organisation-bearers without forcing them to share a common ancestor". A RoleMixin lifts that implicit polymorphism into an explicit type — Seller is not a property of Person nor of Organisation; Seller is a role-shape that either Kind can satisfy. The PDTF v3 `privateIndividual`-vs-`organization` enum collapses this distinction by making the bearer's Kind a property of the participant rather than a structural property of the type hierarchy. The RoleMixin moves it back into the type system where DDD says it belongs.

**Vernon:** AGREE, with the operational note that RoleMixin-as-implementation-discipline reduces aggregate coupling. In Ch. 10 the rule is "aggregates should not directly reference one another by type; reference by identity and resolve at the boundary". Seller-as-RoleMixin means the Sales-context code references `Seller` (the role) without committing to whether the bearer is a `Person` or `Organisation` aggregate — the Kind-layer hierarchy stays unaware of the Role hierarchy. This is precisely the loose-coupling Evans's Ch. 14 anti-corruption-layer pattern protects.

**Vote (pair):** AGREE — RoleMixin for Seller/Buyer (admits both Kinds); ordinary Role for Proprietor/Conveyancer/etc. (founded by a specific Relator). The operational distinction is load-bearing for the PDTF-schema-to-ontology bounded-context translation.

### Q3 — Proprietorship as UFO Relator

**Evans:** AGREE. The Proprietorship-as-Relator pattern is the DDD *Aggregate boundary* drawn around the joint-tenancy invariant. From Ch. 5 ("Modeling Domain Concepts" §Associations) and Ch. 10 ("Supple Design" §Conceptual Contours): when an invariant spans multiple entities, the invariant lives on the relating object, not on the entities. Joint-tenancy carries the invariant "all Proprietors must consent to disposal" (HMLR Practice Guide 24); that invariant cannot live on `opda:Person` (a Person could be a Proprietor in one title and not in another) — it lives on the `opda:Proprietorship` Relator that binds the Persons to a specific Title.

**Vernon:** Concur, and the Aggregate-boundary framing is exact. In *Implementing DDD* Ch. 10, aggregates encapsulate invariants and enforce them transactionally; the `proprietorship-relator-multi-proprietor.ttl` exemplar shows the pattern correctly — one Proprietorship Relator binds two Proprietor Roles (one per Person) to one RegisteredTitle, with `opda:tenancyKind "joint-tenancy"` as a property of the Relator. Disposal-consent is enforced at the Relator boundary; the individual Proprietor Roles inherit identity from their Person bearers (S005 Anti-pattern §3 — never key a Role).

**Vote (pair):** AGREE — Proprietorship as UFO Relator + DDD Aggregate. The Aggregate-boundary framing reinforces Hendler/Guizzardi's S001 modelling argument.

### Q4 — Capacity vs Authority (BOUNDED-CONTEXT SEAM — DEPTH)

**This is the question the pair owns.** Evans + Vernon load on Q4 because the panel's draft (one property with status; two properties; sub-relator) reads as a *property-multiplicity* problem, when it is in fact a **bounded-context-boundary** problem.

**Evans (load):** The PDTF v3 `sellersCapacity` enum is a single string-typed property authored from one viewpoint. But the panel's discussion exposes two *distinct* viewpoints with different model-integrity discipline:

1. **The Sales bounded context.** A seller (or seller's agent) submits a property pack; one field on the form asks "in what capacity are you selling?". The answer — *estate-on-deceased-owner / power-of-attorney / sole-trustee / personal-sale* — is the seller's **asserted capacity**, the *Sales* domain's representation of why they are selling. This is the Sales context's model: a property of the participant record, an enumerated value from a SKOS scheme (ODR-0011 Method/plan code per §8a), recorded at the moment of pack-creation.

2. **The Conveyancing bounded context.** A conveyancer (regulated profession; SRA-supervised) reads the Sales context's asserted capacity and asks "is this asserted capacity matched by appropriate legal instrument?" — grant of probate for estate-on-deceased; lasting power of attorney for POA; trust deed and unanimous-trustee-consent for sole-trustee. The conveyancer's verification activity attaches **evidenced authority** — *the* legal warrant for the sale — to the transaction. This is the *Conveyancing* domain's representation, modelled by evidence resources (ODR-0009) + PROV-O verification activities + `prov:qualifiedAttribution`.

These are **two contexts with their own ubiquitous languages**. In the Sales context "capacity" means "what the seller said"; in the Conveyancing context "authority" means "what the regulated profession verified the seller has". A single predicate that collapses them is the *Anomalous Context* anti-pattern from Ch. 14 — code reads "capacity" and cannot tell whether it is asserting a claim or verifying one. The semantic distinction is lost; the integration risks are exactly what Ch. 14 warns against ("the most insidious problems are not the obvious bugs but the subtle ambiguities that infect every component").

**Vernon (operational):** Two predicates, with the *authority* predicate attaching to the **verification activity, not to the seller**. The seller asserts capacity; capacity does **not** become authority just by assertion. The transformation from "asserted" to "evidenced" is **an act of the regulated profession** — and acts belong in the activity layer (PROV-O), not the participant layer (Agents & Roles).

The operational shape:

```turtle
# Sales context — seller asserts capacity
opda:participant-seller-X
    a opda:Seller ;
    opda:rolePlayer opda:person-Y ;
    opda:assertedCapacity opda:capacityScheme/estate-on-deceased .

# Conveyancing context — verification activity attaches authority
opda:verification-activity-Z
    a prov:Activity, opda:CapacityVerification ;
    prov:used opda:grant-of-probate-evidence ;
    prov:wasAssociatedWith opda:conveyancer-W ;
    opda:verifies opda:participant-seller-X ;
    opda:attestsAuthority opda:capacityScheme/estate-on-deceased ;
    prov:qualifiedAttribution [
        prov:agent opda:conveyancer-W ;
        prov:hadRole opda:capacityVerifier
    ] .
```

`opda:assertedCapacity` is a property of the **Seller** (Sales context, ODR-0006). `opda:attestsAuthority` (or `opda:evidencedAuthority` per the ODR-0006 stub draft) is a property of the **verification activity** (Conveyancing context, ODR-0009), pointing back to the SKOS Method/plan code the verification covers. This matches ODR-0009 Q2's PROV-O verification pattern; it preserves the bounded-context boundary; it gives the regulated-profession audit trail a clean home.

The *sub-relator* alternative the stub names (a CapacityRelator binding seller-to-evidence) is over-modelling at this scale: the verification activity already binds Seller, Evidence, and Conveyancer through PROV-O; a separate Relator adds machinery without buying boundary-discipline that PROV-O does not already provide.

**Vote (pair):** AGREE — **two predicates, non-negotiable**. `opda:assertedCapacity` on `opda:Seller` (Sales context). `opda:evidencedAuthority` (or equivalent) as a property of the PROV-O verification Activity (Conveyancing context). The evidenced-authority predicate **is not a property of the seller** — the seller asserts, the regulated profession evidences. Cross-references ODR-0009 Q2 (verification-activity pattern) + S006 exemplars (Person/Org + Proprietorship). Collapsing into one property is a bounded-context-leakage anti-pattern (Evans Ch. 14; Vernon Ch. 2).

### Q5 — Address reuse

CONCEDE — ODR-0015 owns. S015 closed 2026-05-27 with `opda:Address` as a UFO Substance Kind / DOLCE NonPhysicalEndurant + `opda:hasAddress` join predicate + `opda:addressVariant` Quality. ODR-0006 consumes; no new ground for the bounded-context pair to break here.

**Vote (pair):** CONCEDE.

### Q6 — W3C Org Ontology vs bespoke `opda:Organisation`

**Evans:** AGREE adopt W3C Org Ontology as superclass; specialise `opda:Organisation` for OPDA-specific invariants. In DDD terms (Ch. 14 "Maintaining Model Integrity" §Shared Kernel) the W3C Org Ontology is a **Shared Kernel** — a small, stable, externally-governed model that multiple bounded contexts can rely on. OPDA's specialisation is the *Sales/Conveyancing* domain layer atop the kernel: regulated-firm classification, FCA-registration constraints, AML-relevant invariants. The kernel stays unaware of OPDA-specific Sales-domain concerns; OPDA's specialisation stays unaware of the kernel's identification-domain concerns. The boundary is clean.

**Vernon:** Concur. The Shared Kernel pattern is precisely what the *Identification* bounded context (W3C Org Ontology's territory — `org:Organization`, `org:OrganizationalUnit`, `org:Membership`) earns. The Sales/Conveyancing context's specialisation (`opda:Organisation rdfs:subClassOf org:Organization`) inherits the kernel's identification semantics and adds sales-specific invariants (regulated-status flag; AML-screening attestation cardinality; SDLT-buyer-Org constraints). FOAF was correctly ruled out at S001 — it conflates Person and Organisation; the Shared Kernel discipline requires the kernel be *small and stable*, which FOAF is not at OPDA's scope.

**Vote (pair):** AGREE — `opda:Organisation rdfs:subClassOf org:Organization` (Shared Kernel pattern). OPDA's specialisation carries Sales/Conveyancing-domain invariants.

### Q7 — `participantStatus` as UFO Phase

**Evans:** AGREE Phase label (per ODR-0011 §8a seven-category framework, `participantStatus` = Phase label). Phases-as-state-transitions are *Domain Events* in DDD terms (Ch. 8 "Refactoring Toward Deeper Insight" §Specification + Vernon Ch. 8 "Domain Events"). A Participant entering `Active` is an event — `ParticipantInvited`, `ParticipantActivated`, `ParticipantRemoved` — and the event carries the transition's domain-significance.

**Vernon:** Concur, and the bounded-context cross-context note is load-bearing. Phase transitions are events that **cross bounded contexts**: a Participant in the *Sales* context transitions to `Invited` by an action originating in the Sales aggregate (the seller's conveyancer issues an invitation); the transition is recorded as a `prov:Activity` (PROV-O reification per ODR-0009) consumed by the *Conveyancing* context (the buyer's conveyancer reads the invitation and progresses the transaction). The Phase apparatus (UFO) gives the *intra-Kind state semantics*; the Domain Event apparatus (DDD) gives the *inter-context propagation semantics*; PROV-O gives the *cross-cutting audit-trail semantics*. Three lenses, one mechanism — and they reinforce rather than compete.

**Vote (pair):** AGREE — Phase label per ODR-0011 §8a; phase transitions reified as `prov:Activity` per ODR-0009; cross-bounded-context propagation discipline noted.

## DA anticipation (Allemang)

We anticipate three Allemang pressure points and pre-address:

1. **"Bounded-context jargon is DDD vocabulary the Council does not need."** Counter: the framing is **mechanically operational**, not jargon. The Sales/Conveyancing distinction maps directly to two existing PDTF v3 *roles* (seller's conveyancer; buyer's conveyancer) with distinct regulatory regimes (SRA supervision varies by transaction phase). The bounded-context labels make the two-predicate-split argument **falsifiable** — point to one phase where collapsing the predicates does not produce a regulated-profession-audit-trail defect, and the case fails. We can produce two from PDTF v3's existing structure without effort.

2. **"Two predicates is over-modelling; the schema's one-field-with-status pattern works for downstream consumers."** Counter: downstream consumers explicitly *include* regulated-profession audit pipelines (SRA, FCA, ICO under HMLR-open-register lawful basis). For these consumers, "the seller said X" and "the conveyancer verified X" are not interchangeable — one is a claim, the other is an evidenced finding. The schema's one-field collapse is a model-integrity defect that downstream consumers have to *work around* (by inferring from adjacent evidence triples whether a capacity is asserted-only or evidenced). Two predicates removes the inferential burden.

3. **"What about pre-completion sales where capacity is asserted but no verification has yet happened?"** Counter: this is the textbook *legitimate-asymmetry* case. The Sales-context predicate (`opda:assertedCapacity`) is populated at pack-creation; the Conveyancing-context predicate (`opda:evidencedAuthority` on the verification Activity) is absent until verification completes. A SHACL shape conditions on the transaction phase (per ODR-0007 phase apparatus): pre-completion phases require only `opda:assertedCapacity` (`sh:Violation` if missing); completion-and-onward phases require both (`sh:Violation` on missing `opda:evidencedAuthority`). The asymmetry is precisely what the two-predicate split lets us model.

## Cross-reference to ODR-0007

The Q3 Proprietorship-as-Relator pattern is **structurally parallel** to ODR-0007's Transaction-as-Relator pattern. Both Relators:

- Bind multiple Roles to a specific bearer (Proprietorship binds Proprietor Roles to a RegisteredTitle; Transaction binds Seller/Buyer RoleMixins to a LegalEstate-disposal).
- Carry invariants that span the bound Roles (Proprietorship: unanimous-consent-to-disposal under joint-tenancy; Transaction: chain-dependency consistency per `propertyDependencyType`).
- Are DDD Aggregates with the Relator as the Aggregate boundary (Vernon Ch. 10).

The S006 Council should record this parallel **explicitly** in ODR-0006's `## Consequences` so ODR-0007 inherits the bounded-context discipline cleanly: Transaction-as-Relator founds Seller/Buyer in the Sales context; Proprietorship-as-Relator founds Proprietor in the Property-Registration context; both Relators are Aggregate boundaries for their respective invariants; both compose with PROV-O verification activities at the regulated-profession seam without collapsing the bounded-context boundaries.
