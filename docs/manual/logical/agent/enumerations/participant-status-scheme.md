---
entityUri: opda:ParticipantStatusScheme
kind: scheme
module: agent
sourceTtl: source/03-standards/ontology/opda-agent.ttl
tier: logical
title: ParticipantStatusScheme
---

# ParticipantStatusScheme

## Summary

Phase labels for the lifecycle of a Participant Substance Kind (Active / Invited / Proposed / Removed). [UFO Phase label / DOLCE Stage of an Endurant]. Steward: Guizzardi (S006 Q7).
[Concept tier — Agent module →](../../../concept/agent/README.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `Active` | Active | Participant is actively engaged in the transaction | OPDA data dictionary |
| `Invited` | Invited | Participant has been invited to join the transaction | OPDA data dictionary |
| `Proposed` | Proposed | Participant has been proposed but not yet invited | OPDA data dictionary |
| `Removed` | Removed | Participant has been removed from the transaction | OPDA data dictionary |

## Cardinality discipline

No core-tier attribute in the emitted TBox currently binds this scheme directly. Used by overlay-profile participant-status attributes (e.g. BASPI5 `participantStatus`). Closed scheme — strict four-member phase lifecycle.

## Concept hierarchy

![participantstatusscheme--concept-hierarchy](diagrams/participant-status-scheme/participantstatusscheme--concept-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: ParticipantStatusScheme — Concept Hierarchy
    accDescr: Four Phase label members of ParticipantStatusScheme — Active, Invited, Proposed, Removed.

    classDef scheme fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef member fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    S[ParticipantStatusScheme]:::scheme
    Active[Active]:::member
    Invited[Invited]:::member
    Proposed[Proposed]:::member
    Removed[Removed]:::member

    S --> Active
    S --> Invited
    S --> Proposed
    S --> Removed
```

</details>

## Source ODR + ADR

- [ODR-0011 — Enumeration vocabularies](/modelling/odr/odr-0011), §8a UFO meta-category
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — implementation
