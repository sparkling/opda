---
status: proposed
date: 2026-05-28
tags: [physical-ontology, property, annotations, dpv]
---

# Property annotations

DPV co-annotations + 3 variant refinements, emitted into `opda-property-annotations.ttl`. Per ODR-0018 §Rule 3, DPV is **referenced** via `dct:references` (NOT imported via `owl:imports`) — preserves Tarski-grade TBox semantics while surfacing the regulatory mapping.

## Header

```turtle
<https://w3id.org/opda/property-annotations/>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Property Annotations"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/1.0.0/> .
```

## Class-level DPV baselines (3)

### opda:Address

```turtle
opda:Address
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-7a> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:PostalAddress .
```

Per ODR-0015 §7a — Address instances carry a `dpv-pd:PostalAddress` PII baseline.

### opda:Property

```turtle
opda:Property
    dct:source <https://w3id.org/opda/odr/ODR-0018#section-Rule1> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:PostalAddress .
```

Per ODR-0018 §Rule 1 — Property instances inherit `PostalAddress` baseline (the property's address surface).

### opda:RegisteredTitle

```turtle
opda:RegisteredTitle
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-3c> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:PublicData .
```

Per ODR-0005 §3c — Registered title records are HMLR `PublicData` (published register).

## Variant refinements (3)

Per ODR-0015 §7a, three `opda:DPVMappingRefinement` instances refine the Address class-level baseline by `opda:addressVariant`:

### opda:AddressVariantInspireRefinement

```turtle
opda:AddressVariantInspireRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-7a> ;
    dct:references <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32007L0002> ;
    opda:lawfulBasis dpv:PublicTask ;
    opda:targetsKind opda:Address ;
    opda:variantPredicate opda:addressVariant ;
    opda:variantValue "inspire" .
```

INSPIRE-variant Addresses use `dpv:PublicTask` lawful basis (EU Directive 2007/2/EC).

### opda:AddressVariantMarketingRefinement

```turtle
opda:AddressVariantMarketingRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-7a> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv:Consent ;
    opda:targetsKind opda:Address ;
    opda:variantPredicate opda:addressVariant ;
    opda:variantValue "marketing" .
```

Marketing-variant Addresses use `dpv:Consent` lawful basis (ICO guidance).

### opda:AddressVariantTitleRefinement

```turtle
opda:AddressVariantTitleRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-7a> ;
    dct:references <https://www.gov.uk/government/organisations/land-registry> ;
    opda:lawfulBasis dpv:PublicTask ;
    opda:targetsKind opda:Address ;
    opda:variantPredicate opda:addressVariant ;
    opda:variantValue "title" .
```

Title-variant Addresses use `dpv:PublicTask` lawful basis (HMLR public register).

## Source ODR + ADR

- [ODR-0015 §7a — Address PII per-variant refinement](../../../ontology/odr/ODR-0015-address-and-geography.md)
- [ODR-0018 — DPV co-annotation pattern (reference-not-import)](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ODR-0005 §3c — RegisteredTitle as PublicData](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
