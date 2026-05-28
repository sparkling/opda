---
status: proposed
date: 2026-05-28
tags: [physical-ontology, vocabularies, skos, yes-no]
---

# opda:YesNoNotRequiredScheme

## Summary

Mode label register for BASPI5 questions admitting not-required as a third option (Yes / No / Not required).

## Scheme header

```turtle
opda:YesNoNotRequiredScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Yes/No/Not required"@en ;
    skos:definition "Mode label register for BASPI5 questions admitting not-required as a third option (Yes / No / Not required)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-1a-scheme-steward> ;
    dct:title "Yes/No/Not required mode label register"@en ;
    skos:scopeNote "UFO: Quale-in-Region (Guizzardi 2005 Ch. 4). Mode register for BASPI5 form questions where the question itself becomes not-required in some discriminator branches."@en ;
    opda:hasSteward "Allemang (property-qualities sub-module steward per S008 Q2)"@en ;
    opda:ufoCategory "Quale-in-Region" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:yesNoNotRequired/No` | "No" | No |
| `opda:yesNoNotRequired/Not-required` | "Not required" | Not required |
| `opda:yesNoNotRequired/Yes` | "Yes" | Yes |

### Member Turtle

```turtle
<https://w3id.org/opda/#yesNoNotRequired/No>
    rdf:type skos:Concept ;
    skos:prefLabel "No"@en ;
    skos:definition "Negative answer."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotRequiredScheme ;
    skos:notation "No" .

<https://w3id.org/opda/#yesNoNotRequired/Not-required>
    rdf:type skos:Concept ;
    skos:prefLabel "Not required"@en ;
    skos:definition "Answer is not required in this context."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotRequiredScheme ;
    skos:notation "Not required" .

<https://w3id.org/opda/#yesNoNotRequired/Yes>
    rdf:type skos:Concept ;
    skos:prefLabel "Yes"@en ;
    skos:definition "Affirmative answer."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-1a-scheme-steward> ;
    skos:inScheme opda:YesNoNotRequiredScheme ;
    skos:notation "Yes" .
```

## Referenced by

- Per-overlay profile bindings for context-conditional BASPI5 questions where question itself can be marked not required

## Source ODR + ADR

- [ODR-0011 §1a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
