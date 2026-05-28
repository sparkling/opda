# AddressVariantScheme

## Summary

Quality Values for the variant under which an Address is presented (`marketing`, `title`, `inspire`, `postal`). Each variant particularises an underlying Address Substance Kind per ODR-0015 §Q1. [UFO Quality Value]. Steward: Guizzardi (S015 Q1).
[Concept tier →](../../../concept/property/enumerations/address-variant-scheme.md)

## Members

| Notation | Label | Definition | Source |
|---|---|---|---|
| `inspire` | inspire | INSPIRE Directive variant — the regulated postal address structure published by INSPIRE-aligned registers (administrative boundary alignment) | [ODR-0015 §2a](../../../ontology/odr/ODR-0015-address.md) |
| `marketing` | marketing | Marketing-presentation variant (estate-agent advertising format; typically de-formalised street name + town) | [ODR-0015 §2a](../../../ontology/odr/ODR-0015-address.md) |
| `postal` | postal | Royal Mail PAF-formatted variant (the address as recognised by Royal Mail's Postcode Address File) | [ODR-0015 §2a](../../../ontology/odr/ODR-0015-address.md) |
| `title` | title | HM Land Registry registered-title variant (the address as recorded against the title at HMLR) | [ODR-0015 §2a](../../../ontology/odr/ODR-0015-address.md) |

## Cardinality discipline

Bound by [`Address.addressVariant`](../address.md#attributes) (`1..1`, identity-bearing). Closed scheme — overlays may subset (e.g. BASPI5 may restrict to {`marketing`, `title`} for sales-context Address payloads) but may NOT extend beyond the four members ratified at S015 Q1.

## Source ODR + ADR

- [ODR-0015 — Address](../../../ontology/odr/ODR-0015-address.md), §2a Address variant
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md) — implementation
