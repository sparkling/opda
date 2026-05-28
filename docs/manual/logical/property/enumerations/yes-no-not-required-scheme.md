# YesNoNotRequiredScheme

## Summary

Mode label register for BASPI5 questions admitting not-required as a third option (Yes / No / Not required). [UFO Quale-in-Region]. Mode register for BASPI5 form questions where the question itself becomes not-required in some discriminator branches. Steward: Allemang (property-qualities sub-module steward per S008 Q2).
[Concept tier — Property module →](../../../concept/property/README.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `No` | No | Negative answer | [ODR-0011 §1a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md) |
| `Not required` | Not required | Answer is not required in this context | [ODR-0011 §1a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md) |
| `Yes` | Yes | Affirmative answer | [ODR-0011 §1a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md) |

## Cardinality discipline

Bound by BASPI5 questions where the question becomes not-required in some discriminator branches. No core-tier attribute binds this scheme directly; binding lives in BASPI5 and equivalent overlay profiles. Closed scheme — strict three-member.

## Concept hierarchy

![yesnonotrequiredscheme--concept-hierarchy](diagrams/yes-no-not-required-scheme/yesnonotrequiredscheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: YesNoNotRequiredScheme — Concept Hierarchy
    accDescr: Three Quale-in-Region members — No, Not required, Yes.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[YesNoNotRequiredScheme]:::scheme
    No[No]:::member
    NR["Not required"]:::member
    Yes[Yes]:::member

    S --> No
    S --> NR
    S --> Yes
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md), §1a scheme-steward
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) — implementation
