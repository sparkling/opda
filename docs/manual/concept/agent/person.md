# Person

A Person is a natural person — an individual human being. Person is the anchor for PII (Personally Identifiable Information) regimes in OPDA: it is where GDPR Article 5–10 lawful-basis discipline lands.

## Why it matters

Person identity must persist across every transaction, every title, every role the individual appears in. A naive design that creates a new Person record whenever the data feed changes (a renamed Person; a Person who appears under a slightly different state-issued ID; a Person who has died and whose estate is being administered) shatters the audit trail. OPDA explicitly uses a **multi-identifier persistence** approach — drawn from FIBO — so a single Person can be carried through name changes, register-of-electors updates, and gender-recognition events without forking.

If you are a data protection officer, an integrator implementing AML/KYC, or a conveyancer reconciling identity across documents, this is the entity whose IC matters most.

## Hard cases

- **Name change.** A Person changes their name (deed-poll, marriage, gender recognition). The Person identity *persists*; the name change is a reified [Name Change Event](./name-change-event.md), not a new Person record.
- **Gender recognition.** A Gender Recognition Certificate updates the Person's recorded gender. Same individual, with a provenance-tracked attribute change.
- **Death.** The Person ceases as a living individual but persists as a record-entity bearing post-mortem properties (estate administration, probate). The IC does not erase the Person at death.

## Identity Criterion

Two records refer to the same Person if they describe the same individual via **a FIBO-style multi-identifier match** — date of birth, state-issued ID (passport, driving licence, NI number), and name (with name changes traced via reified Events). The IC is deliberately tolerant of single-identifier mismatches (a name change on its own does not break the match) but intolerant of date-of-birth + state-ID mismatch. See the [Logical tier →](../../logical/agent/person.md) for the typed structure.

### IC walk-through: multi-identifier match

How the IC tolerates single-identifier mismatches while still rejecting incompatible records:

![person-ic-multi-identifier-match-decision-flow](diagrams/person/person-ic-multi-identifier-match-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Person IC multi-identifier match decision flow
    accDescr: Decision tree for Person identity — date-of-birth plus state-issued ID is the gating combination; name mismatch alone is tolerated when traced via a Name Change Event; date-of-birth plus state-ID mismatch always rejects.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Two candidate<br/>Person records"]):::cls
    Q1{"Date of birth<br/>matches?"}:::cls
    Q2{"State-issued ID<br/>matches<br/>(passport / DL / NINO)?"}:::cls
    Q3{"Name matches?"}:::cls
    Q4{"Name change traced<br/>via Name Change Event?"}:::cls

    Same(["SAME Person"]):::success
    SameViaEvent(["SAME Person<br/>(name change traced)"]):::success
    Different(["DIFFERENT Person<br/>(IC rejects)"]):::errorState
    Inconclusive(["Inconclusive<br/>(needs more data)"]):::warning

    Start --> Q1
    Q1 -->|"Yes"| Q2
    Q1 -->|"No"| Different
    Q2 -->|"Yes"| Q3
    Q2 -->|"No"| Different
    Q3 -->|"Yes"| Same
    Q3 -->|"No"| Q4
    Q4 -->|"Yes"| SameViaEvent
    Q4 -->|"No"| Inconclusive
```

</details>

## Related Kinds

- [Organisation](./organisation.md) — the other party Kind that can bear transactional roles
- [Proprietor](./proprietor.md) — the Role a Person bears when registered as legal owner of a Property
- [Seller](./seller.md) — the Role Mixin a Person (or Organisation) bears when disposing of a Property
- [Buyer](./buyer.md) — the Role Mixin a Person (or Organisation) bears when acquiring a Property
- [Name Change Event](./name-change-event.md) — records a Person's name change

### Related-Kinds graph

![person-related-kinds-neighbourhood-graph](diagrams/person/person-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Person related-Kinds neighbourhood graph
    accDescr: Person as the bearer of three transactional roles — Seller, Buyer, Proprietor — and the subject of Name Change Events; mirrored by Organisation as the alternative bearer.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Person["Person"]:::centre
    Organisation["Organisation"]:::cls
    Seller["Seller"]:::cls
    Buyer["Buyer"]:::cls
    Proprietor["Proprietor"]:::cls
    NameChange["NameChangeEvent"]:::cls

    Seller -->|"borneBy"| Person
    Buyer -->|"borneBy"| Person
    Proprietor -->|"borneBy"| Person
    NameChange -->|"affects"| Person
    Person -.->|"alternative bearer"| Organisation
```

</details>

## Source ODR

[ODR-0006 — Agents and roles §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
