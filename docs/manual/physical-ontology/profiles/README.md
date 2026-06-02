---
status: proposed
date: 2026-05-28
tags: [physical-ontology, profiles, overlay]
---

# Overlay profiles

OPDA's foundation + module shape-graph leaves per-form cardinality, per-form enumeration subsets, and per-form UI rendering to **overlay profiles**. Each profile is a separate SHACL graph that composes over the foundation + module TBox + base shapes per ODR-0010.

## Three-rule interface contract

Per ODR-0010 §Q6, every overlay profile MUST satisfy three rules enforced by foundation meta-shapes:

| Rule | Enforced by | Semantics |
|---|---|---|
| 1 — `sh:in` semantics | [`opda:ShInSemantics_MetaShape`](../foundation/meta-shapes.md#opdashinsemanticsmetashape) | Overlay `sh:in` MUST be a subset of base scheme members |
| 2 — Violation floor | [`opda:ShViolationFloor_MetaShape`](../foundation/meta-shapes.md#opdashviolationfloormetashape) | Overlay cannot downgrade base `sh:Violation` severity |
| 3 — No-identity-override | [`opda:NoIdentityOverride_MetaShape`](../foundation/meta-shapes.md#opdanoidentityoverride_metashape) | Overlay cannot suppress Kind's identity-key |

CI-enforced by `opda-gen ci-profile-contract` per ADR-0013.

## Profile catalogue

| Profile | Version | Authority | Status |
|---|---|---|---|
| [`opda:Baspi5OverlayProfile`](./baspi5.md) | 5.0.3 | BASPI (British Association of Surveyors Property Information) | MVP gate (ODR-0010 §Q7) |

Future profiles (planned, not yet emitted):

- Mortgage-lender overlay (lender-specific data requirements)
- HMLR-publication overlay (HMLR-public data subset)
- Insurer overlay (insurance-eligibility data)

## ValidationContext reification

Per ODR-0010 §Q1 (Guarino withdrawal condition), every profile is reified as an `opda:ValidationContext` instance carrying five properties:

| Property | Value |
|---|---|
| `opda:profileURI` | The profile's URI (e.g. `<https://opda.org.uk/pdtf/shape/profiles/baspi5>`) |
| `opda:requires` | The Kind classes the profile constrains |
| `opda:overlaysContext` | The base context the profile overlays (typically `<https://opda.org.uk/pdtf/shape/profiles/foundation>`) |
| `opda:sourcedFrom` | The external authoring source (e.g. BASPI form URL) |
| `opda:formVersion` | The form version (e.g. "5.0.3") |

This reification converts conditionality from "required (depending)" to "required relative to a named, dereferenceable context" — discharging Guarino's withdrawal condition at S010.

## DASH UI integration

Per ODR-0010 §Q4, overlay shapes carry DASH (Data Shapes) editor + viewer predicates:

- `dash:editor` — `dash:EnumSelectEditor` (for `sh:in` enum), `dash:TextFieldEditor` (for literals), `dash:DetailsEditor` (for nested objects)
- `dash:viewer` — `dash:LabelViewer`, `dash:LiteralViewer`, `dash:URIViewer`

These enable TopBraid Composer / DASH-aware tooling to render appropriate form widgets.

## Property groups

Overlay profiles MAY declare `sh:PropertyGroup` instances to group related property shapes for UI rendering. BASPI5 declares 9 groups (Address, Built form, Completion, Drainage, Energy, Environmental, Heating, Ownership, Participants) with `sh:order` for sequencing.

## Source ADR + ODR

- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md)
- [ODR-0010 — Overlay profile mechanism (three-rule interface contract)](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md)
- [ODR-0011 — Enumeration vocabularies (scheme-subset alignment)](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
