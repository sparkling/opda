# Legal Estate

A Legal Estate is the **bundle of legal rights** vested in a Property — Freehold, Leasehold, Commonhold, or a managed variant. It is the answer to "what does one *own* when one owns this Property?".

## Why it matters

Owning a Property is not a single thing — it is owning a particular set of rights *over* the Property. A Freehold is one bundle; a Leasehold is a different bundle (with a time-bounded term and ground-rent obligations); a Commonhold is a third bundle. Legal Estate makes those bundles first-class so the model can say *which rights are vested* without conflating the rights with either the physical Property or the registry record that documents them.

If you are a conveyancer asking "the tenure changed — is it the same estate?" or "the lease was extended — is it the same lease?", this is the entity whose IC answers you.

## Hard cases

- **Tenure change.** A Leasehold is converted to Freehold. The rights bundle changes substantially — the Legal Estate identity does *not* persist across a tenure change; the new tenure is a new Legal Estate.
- **Lease grant.** A Freehold grants a new long lease. The Freehold persists (it is the reversioner's estate) and a *new* Leasehold Legal Estate is created. Two coexisting Legal Estates over the same Property.
- **Lease termination.** A long lease expires or is surrendered. The Leasehold Legal Estate ceases; the Freehold persists.
- **Commonhold conversion.** A Leasehold building is converted to Commonhold. The Leasehold ceases; new Commonhold Legal Estates come into existence (one per unit).
- **First registration of pre-existing common-law estate.** A long-existing unregistered Freehold enters the HMLR register. The Legal Estate identity precedes registration — registration documents an existing estate, it does not create one.
- **Lease extension.** A leaseholder exercises a statutory right to extend. Per ODR-0005 §3b Rule 1, Legal Estate identity *persists* through extension — the rights bundle is modified, not dissolved.

## Identity Criterion

Two records refer to the same Legal Estate if they describe the same **rights bundle** persisting through grant, transfer, registration, and discharge events. The IC distinguishes a Legal Estate from the coexisting Registered Title (which records it) and from the physical Property (in which it is vested) by the *extent of the rights* it bears. See the [Logical tier →](../../logical/property/legal-estate.md) for the typed structure.

### IC walk-through: tenure-change vs lease-grant vs extension

How the canonical Legal Estate hard cases resolve under the IC — the only event that breaks Legal Estate identity is a *tenure change*; grants create new coexisting estates; extensions persist:

![legal-estate-ic-decision-flow](diagrams/legal-estate/legal-estate-ic-decision-flow.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TD
    accTitle: Legal Estate IC decision flow
    accDescr: Decision tree for Legal Estate identity — tenure change breaks identity; lease grant creates a new coexisting Leasehold while the Freehold persists; lease termination ends the Leasehold but the Freehold persists; lease extension preserves identity per ODR-0005 §3b Rule 1.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef errorState fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C

    Start(["Event affecting<br/>Legal Estate"]):::cls
    Q1{"Tenure change<br/>(Leasehold ↔ Freehold<br/>↔ Commonhold)?"}:::cls
    Q2{"Grant of new lease<br/>from existing Freehold?"}:::cls
    Q3{"Lease termination<br/>or surrender?"}:::cls
    Q4{"Statutory lease<br/>extension?"}:::cls

    Break(["NEW Legal Estate<br/>(identity breaks)"]):::errorState
    NewCoexist(["NEW Leasehold;<br/>Freehold persists"]):::warning
    LeaseEnds(["Leasehold ceases;<br/>Freehold persists"]):::warning
    Persists(["SAME Legal Estate<br/>(identity persists,<br/>new LeaseTerm)"]):::success

    Start --> Q1
    Q1 -->|"Yes"| Break
    Q1 -->|"No"| Q2
    Q2 -->|"Yes"| NewCoexist
    Q2 -->|"No"| Q3
    Q3 -->|"Yes"| LeaseEnds
    Q3 -->|"No"| Q4
    Q4 -->|"Yes"| Persists
```

</details>

## Related Kinds

- [Property](./property.md) — a Legal Estate is vested in a Property (one Property may carry multiple Legal Estates — Freehold + long Leasehold + sub-Leasehold)
- [Registered Title](./registered-title.md) — a Registered Title documents a Legal Estate
- [Lease Term](./lease-term.md) — a leasehold Legal Estate has a Lease Term
- [Lease Extension Event](./lease-extension-event.md) — mutates the Lease Term of a leasehold Legal Estate

### Related-Kinds graph

![legal-estate-related-kinds-neighbourhood-graph](diagrams/legal-estate/legal-estate-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Legal Estate related-Kinds neighbourhood graph
    accDescr: One-hop neighbourhood of Legal Estate — vested in Property, documented by Registered Title, carries Lease Term (if leasehold), mutated by Lease Extension Event, conveyed by Transaction.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    LegalEstate["LegalEstate"]:::centre
    Property["Property"]:::cls
    RegisteredTitle["RegisteredTitle"]:::cls
    LeaseTerm["LeaseTerm"]:::cls
    LeaseExt["LeaseExtensionEvent"]:::cls
    Transaction["Transaction"]:::ext

    LegalEstate -->|"vestedIn"| Property
    LegalEstate -->|"documentedBy"| RegisteredTitle
    LegalEstate -->|"leaseTerm (if leasehold)"| LeaseTerm
    LeaseExt -->|"extends"| LegalEstate
    Transaction -->|"conveys"| LegalEstate
```

</details>

## Source ODR

[ODR-0005 — Property/Land identity crux §3b](../../../ontology/odr/ODR-0005-property-land-identity-crux.md)
