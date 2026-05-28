---
status: proposed
date: 2026-05-28
tags: [physical-ontology, vocabularies, skos, council-tax]
---

# opda:CouncilTaxBandSchemeEW

## Summary

Valuation Office Agency banding for England & Wales (Bands A–H) assigned to each domestic property for council tax calculation.

## Scheme header

```turtle
opda:CouncilTaxBandSchemeEW
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Council Tax Band (England & Wales)"@en ;
    skos:definition "Valuation Office Agency banding for England & Wales (Bands A–H) assigned to each domestic property for council tax calculation."@en ;
    dct:source <https://www.gov.uk/council-tax-bands> ;
    dct:title "Council Tax Band — Valuation Office Agency banding (England & Wales)"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). DOLCE: Quality-Region (Masolo D18 §4.3). Verbatim source: VOA council-tax bands published at https://www.gov.uk/council-tax-bands."@en ;
    opda:hasSteward "Baker (regulator-cited per ODR-0011 §4a; VOA-governed)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:councilTaxBandEW/A` | "A" | A |
| `opda:councilTaxBandEW/B` | "B" | B |
| `opda:councilTaxBandEW/C` | "C" | C |
| `opda:councilTaxBandEW/D` | "D" | D |
| `opda:councilTaxBandEW/E` | "E" | E |
| `opda:councilTaxBandEW/F` | "F" | F |
| `opda:councilTaxBandEW/G` | "G" | G |
| `opda:councilTaxBandEW/H` | "H" | H |

### Member Turtle (8 bands; identical structure — sample)

```turtle
<https://w3id.org/opda/#councilTaxBandEW/A>
    rdf:type skos:Concept ;
    skos:prefLabel "A"@en ;
    skos:definition "Council tax band A as defined by the Valuation Office Agency for properties in England & Wales."@en ;
    dct:source <https://www.gov.uk/council-tax-bands> ;
    skos:inScheme opda:CouncilTaxBandSchemeEW ;
    skos:notation "A" .

# Bands B-H follow the same pattern.
# See source: opda-vocabularies.ttl lines 401-463.
```

Full per-member Turtle: [`opda-vocabularies.ttl` lines 401–463](../../../../source/03-standards/ontology/opda-vocabularies.ttl).

## Referenced by

- Per-overlay profile bindings (BASPI5 does not surface council tax band in MVP; future GovTech / lender overlays)

## Source ODR + ADR

- [ODR-0011 §4a — regulator-citation discipline](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
