---
status: proposed
date: 2026-05-28
tags: [physical-ontology, catalogue, index]
---

# Class + property + scheme catalogue

Machine-derivable index of every minted term in OPDA's emitted ontology.

## Classes (40 total)

### Foundation (6)

| Class | File | UFO category |
|---|---|---|
| `opda:DiagnosticExemplar` | [foundation/classes.md#opdadiagnosticexemplar](./foundation/classes.md#opdadiagnosticexemplar) | Substance Kind (informational) |
| `opda:GeneratorRun` | [foundation/classes.md#opdageneratorrun](./foundation/classes.md#opdageneratorrun) | Information Particular |
| `opda:Relator` | [foundation/classes.md#opdarelator](./foundation/classes.md#opdarelator) | UFO Relator meta-class |
| `opda:Role` | [foundation/classes.md#opdarole](./foundation/classes.md#opdarole) | UFO Role meta-class |
| `opda:RoleMixin` | [foundation/classes.md#opdarolemixin](./foundation/classes.md#opdarolemixin) | UFO RoleMixin meta-class |
| `opda:ValidationContext` | [foundation/classes.md#opdavalidationcontext](./foundation/classes.md#opdavalidationcontext) | Substance Kind (informational) |

### Property (7)

| Class | File |
|---|---|
| `opda:Address` | [property/classes.md#opdaaddress](./property/classes.md#opdaaddress) |
| `opda:LeaseExtensionEvent` | [property/classes.md#opdaleaseextensionevent](./property/classes.md#opdaleaseextensionevent) |
| `opda:LeaseTerm` | [property/classes.md#opdaleaseterm](./property/classes.md#opdaleaseterm) |
| `opda:LegalEstate` | [property/classes.md#opdalegalestate](./property/classes.md#opdalegalestate) |
| `opda:Property` | [property/classes.md#opdaproperty](./property/classes.md#opdaproperty) |
| `opda:RegisteredTitle` | [property/classes.md#opdaregisteredtitle](./property/classes.md#opdaregisteredtitle) |
| `opda:UPRNSuccessionEvent` | [property/classes.md#opdauprnsuccessionevent](./property/classes.md#opdauprnsuccessionevent) |

### Agent (7)

| Class | File |
|---|---|
| `opda:Buyer` | [agent/classes.md#opdabuyer](./agent/classes.md#opdabuyer) |
| `opda:NameChangeEvent` | [agent/classes.md#opdanamechangeevent](./agent/classes.md#opdanamechangeevent) |
| `opda:Organisation` | [agent/classes.md#opdaorganisation](./agent/classes.md#opdaorganisation) |
| `opda:Person` | [agent/classes.md#opdaperson](./agent/classes.md#opdaperson) |
| `opda:Proprietor` | [agent/classes.md#opdaproprietor](./agent/classes.md#opdaproprietor) |
| `opda:Proprietorship` | [agent/classes.md#opdaproprietorship](./agent/classes.md#opdaproprietorship) |
| `opda:Seller` | [agent/classes.md#opdaseller](./agent/classes.md#opdaseller) |

### Transaction (3)

| Class | File |
|---|---|
| `opda:Milestone` | [transaction/classes.md#opdamilestone](./transaction/classes.md#opdamilestone) |
| `opda:Transaction` | [transaction/classes.md#opdatransaction](./transaction/classes.md#opdatransaction) |
| `opda:TransactionChain` | [transaction/classes.md#opdatransactionchain](./transaction/classes.md#opdatransactionchain) |

### Claim (10)

| Class | File |
|---|---|
| `opda:AssuranceLevel` | [claim/classes.md#opdaassurancelevel](./claim/classes.md#opdaassurancelevel) |
| `opda:Claim` | [claim/classes.md#opdaclaim](./claim/classes.md#opdaclaim) |
| `opda:Document` | [claim/classes.md#opdadocument](./claim/classes.md#opdadocument) |
| `opda:DocumentEvidence` | [claim/classes.md#opdadocumentevidence](./claim/classes.md#opdadocumentevidence) |
| `opda:ElectronicRecord` | [claim/classes.md#opdaelectronicrecord](./claim/classes.md#opdaelectronicrecord) |
| `opda:ElectronicRecordEvidence` | [claim/classes.md#opdaelectronicrecordevidence](./claim/classes.md#opdaelectronicrecordevidence) |
| `opda:Evidence` | [claim/classes.md#opdaevidence](./claim/classes.md#opdaevidence) |
| `opda:TrustFramework` | [claim/classes.md#opdatrustframework](./claim/classes.md#opdatrustframework) |
| `opda:VerificationActivity` | [claim/classes.md#opdaverificationactivity](./claim/classes.md#opdaverificationactivity) |
| `opda:Vouch` | [claim/classes.md#opdavouch](./claim/classes.md#opdavouch) |
| `opda:VouchEvidence` | [claim/classes.md#opdavouchevidence](./claim/classes.md#opdavouchevidence) |

### Descriptive (5)

| Class | File |
|---|---|
| `opda:Comparable` | [descriptive/classes.md#opdacomparable](./descriptive/classes.md#opdacomparable) |
| `opda:EPCCertificate` | [descriptive/classes.md#opdaepccertificate](./descriptive/classes.md#opdaepccertificate) |
| `opda:Search` | [descriptive/classes.md#opdasearch](./descriptive/classes.md#opdasearch) |
| `opda:Survey` | [descriptive/classes.md#opdasurvey](./descriptive/classes.md#opdasurvey) |
| `opda:Valuation` | [descriptive/classes.md#opdavaluation](./descriptive/classes.md#opdavaluation) |

### Governance (2)

| Class | File |
|---|---|
| `opda:DPVMappingRecord` | [governance/classes.md#opdadpvmappingrecord](./governance/classes.md#opdadpvmappingrecord) |
| `opda:SpecialCategoryScheme` | [governance/classes.md#opdaspecialcategoryscheme](./governance/classes.md#opdaspecialcategoryscheme) |

## SHACL shapes (30 total)

### Foundation (5 meta-shapes)

- `opda:NoIdentityOverride_MetaShape` (Cat 3)
- `opda:ShInSemantics_MetaShape` (Cat 5)
- `opda:ShViolationFloor_MetaShape` (Cat 5)
- `opda:MetaShapeOverShapeGraphMetaShape` (Cat 5)
- `opda:DeprecationChainRule`, `opda:PIIWithoutDPVCoAnnotationRule` (SHACL-AF rules — see below)

### Per-module identity-key + IC-breach shapes

| Module | Shapes |
|---|---|
| Property | `AddressIdentityKeyShape`, `LegalEstateIdentityKeyShape`, `PropertyIdentityKeyShape`, `PropertyICBreachShape` |
| Agent | `OrganisationIdentityKeyShape`, `PersonIdentityKeyShape`, `SpecialCategoryPIIWithoutLawfulBasisShape` (Cat 4) |
| Transaction | `MilestoneIdentityKeyShape`, `TransactionIdentityKeyShape` |
| Claim | `ClaimIdentityKeyShape`, `EvidenceIdentityKeyShape`, `UnprovenancedClaimShape` |
| Descriptive | `ComparableIdentityKeyShape`, `EPCCertificateIdentityKeyShape`, `SearchIdentityKeyShape`, `SurveyIdentityKeyShape`, `ValuationIdentityKeyShape` |
| Governance | `DPVMappingRecordIdentityKeyShape` |

See [`severity-tiers.md`](./severity-tiers.md) for severity classification.

## SHACL-AF rules (11 total)

11 non-blocking quality rules per ODR-0017 §1a. Detailed in [`shacl-af-rules.md`](./shacl-af-rules.md).

| Citing site | Rule | Module |
|---|---|---|
| #1 | `opda:UPRNSuccessionRule` | property |
| #2 | `opda:DeprecationChainRule` | foundation |
| #3 | `opda:INSPIRESuccessionRule` | property |
| #4 | `opda:PROVOClaimsRule` | claim |
| #5 | `opda:IdentifierSuccessionRule` | agent |
| #6 | `opda:CapacityAuthorityMatchRule` | agent |
| #7 | `opda:LeaseTermSuccessionRule` | transaction |
| #8 | `opda:MilestoneVarianceRule` | transaction |
| #9 | `opda:VerificationActivitySuccessionRule` | claim |
| #10 | `opda:PIIWithoutDPVCoAnnotationRule` | foundation (cross-cutting) |
| #11 | (placeholder for future emission) | — |

## SKOS schemes (23 total)

See [vocabularies/README.md](./vocabularies/README.md) for the 7-category UFO framework.

| Scheme | UFO category | Members |
|---|---|---|
| `opda:AddressVariantScheme` | Quality Value | 4 |
| `opda:AssuranceLevelScheme` | Quality Value | 4 |
| `opda:BuiltFormScheme` | Quale-in-Region | 5 |
| `opda:CentralHeatingFuelTypeScheme` | Quale-in-Region | 6 |
| `opda:CouncilTaxBandSchemeEW` | Quale-in-Region | 8 |
| `opda:CouncilTaxBandSchemeScotland` | Quale-in-Region | 9 |
| `opda:CurrentEnergyRatingScheme` | Quale-in-Region | 7 |
| `opda:EvidenceMethodScheme` | Quality Value | 3 |
| `opda:HeatingTypeScheme` | Quale-in-Region | 4 |
| `opda:MilestoneKindScheme` | Method/plan code | 5 |
| `opda:OffMainsDrainageSystemTypeScheme` | Quale-in-Region | 6 |
| `opda:OwnerTypeScheme` | Substance Kind label | 2 |
| `opda:OwnershipTypeScheme` | Quale-in-Region | 4 |
| `opda:ParticipantStatusScheme` | Phase label | 4 |
| `opda:PropertyTypeScheme` | Substance Kind label | 6 |
| `opda:RoleScheme` | Role label | 12 |
| `opda:SellersCapacityScheme` | Method/plan code | 5 |
| `opda:TenureKindScheme` | Substance Kind label | 3 |
| `opda:TransactionStatusScheme` | Phase label | 5 |
| `opda:YesNoNotApplicableScheme` | Quale-in-Region | 3 |
| `opda:YesNoNotKnownScheme` | Quale-in-Region | 3 |
| `opda:YesNoNotRequiredScheme` | Quale-in-Region | 3 |
| `opda:YesNoScheme` | Quale-in-Region | 2 |

Total members: 137.

## Overlay profiles

- [`opda:Baspi5OverlayProfile`](./profiles/baspi5.md) — BASPI5 v5.0.3 overlay (7 per-Kind profile shapes; 9 property groups; DASH UI predicates)

## Diagnostic exemplars (15 paired with expected reports)

See [exemplars/README.md](./exemplars/README.md) for the full catalogue.

Property + identity (S005 + S015):
- registered-freehold-house, unregistered-pre-first-registration-house, flat-with-split-uprn
- flat-no-uprn-newly-converted, listed-building-divergent-addresses, rural-plot-inspire-no-uprn

Agent (S006):
- person-with-name-change, organisation-with-merger, proprietorship-relator-multi-proprietor

Claim (S009):
- claim-with-document-evidence, claim-with-electronic-record-evidence, claim-with-vouch-evidence

Transaction (S007):
- simple-transaction-with-milestones, chain-of-transactions, lease-extension-transaction
