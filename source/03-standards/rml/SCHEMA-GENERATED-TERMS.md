# OWL classes & properties generated from the JSON schemas

> **Excludes foundation** — `foundation.ttl`, `opda-classes.ttl` (upper substrate), `opda-vocabularies.ttl` (SKOS), and all ODR-sourced governance terms. A term qualifies iff opda-gen anchored it to a PDTF-schema leaf via `dct:source <…/harness/data-dictionary/{leaf}>`. Classes carry no direct anchor (minted as UFO bearers), so a class qualifies when it is the domain/range/role-enum target of a schema-generated property.

**229 terms**: 17 classes · 195 datatype properties · 17 object properties. RML-mapped today: 11/17 classes, 64/212 properties. `✓`=mapped `·`=gap.

## Classes

**agent**  
✓ `Buyer`, ✓ `Organisation`, ✓ `Person`, · `Proprietorship`, ✓ `Seller`

**property**  
✓ `LegalEstate`, ✓ `Property`, ✓ `RegisteredTitle`

**transaction**  
✓ `Transaction`

**claim**  
✓ `AttachedDocument`

**descriptive**  
· `EPCCertificate`, ✓ `MonetaryAmount`, · `NearbyFacility`, · `RiskAssessment`, · `RoomDimension`, ✓ `Search`, · `Valuation`

## Properties

### agent (13)  
| | property | kind | domain → range | schema leaf |
|--|--|--|--|--|
| · | `accountName` | Dat | Organisation → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.contacts.landlord.bankDetails.accountName (+7)` |
| · | `accountNumber` | Dat | Organisation → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.contacts.landlord.bankDetails.accountNumber (+7)` |
| ✓ | `aged17OrOverNames` | Dat | Seller → xsd:string | `propertyPack.occupiers.othersAged17OrOver.aged17OrOverNames` |
| ✓ | `dateOfBirth` | Dat | Person → xsd:date | `participants[].dateOfBirth` |
| ✓ | `middleNames` | Dat | Person → xsd:string | `propertyPack.legalOwners.namesOfLegalOwners[].middleNames` |
| ✓ | `name` | Dat | — → xsd:string | `contracts[].contract.template.name (+4)` |
| · | `numberOfNonUkResidentSellers` | Dat | Proprietorship → xsd:integer | `propertyPack.ownership.numberOfNonUkResidentSellers` |
| · | `numberOfSellers` | Dat | Proprietorship → xsd:integer | `propertyPack.ownership.numberOfSellers` |
| · | `organisationName` | Dat | Organisation → xsd:string | `propertyPack.legalOwners.namesOfLegalOwners[].organisationName` |
| ✓ | `organisationReference` | Dat | Organisation → xsd:string | `participants[].organisationReference` |
| · | `reference` | Dat | Organisation → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.contacts.landlord.bankDetails.reference (+7)` |
| ✓ | `sellersCapacityDetails` | Dat | Seller → xsd:string | `participants[].sellersCapacity.sellersCapacityDetails` |
| · | `sortCode` | Dat | Organisation → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.contacts.landlord.bankDetails.sortCode (+7)` |

### property (79)  
| | property | kind | domain → range | schema leaf |
|--|--|--|--|--|
| · | `abilityToResideAtProperty` | Dat | Property → xsd:string | `propertyPack.typeOfConstruction.buildingSafety.abilityToResideAtProperty` |
| · | `accessibilityAndAdaptations` | Dat | Property → xsd:string | `propertyPack.typeOfConstruction.accessibilityAndAdaptations` |
| · | `adHocExpenses` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.adHocExpenses` |
| · | `area` | Dat | Property → xsd:decimal | `propertyPack.buildInformation.internalArea.area (+1)` |
| · | `bathrooms` | Dat | Property → xsd:integer | `propertyPack.residentialPropertyFeatures.bathrooms (+1)` |
| · | `bedrooms` | Dat | Property → xsd:integer | `propertyPack.residentialPropertyFeatures.bedrooms (+1)` |
| · | `buildingsReinstatementCostAssessment` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.buildingsReinstatementCostAssessment` |
| ✓ | `builtForm` | Dat | Property → xsd:string | `propertyPack.buildInformation.building.builtForm` |
| ✓ | `centralHeatingFuelType` | Dat | Property → xsd:string | `propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.centralHeatingFuelType` |
| ✓ | `centralHeatingInstalled` | Dat | Property → xsd:string | `propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingInstalled` |
| · | `consequentialChargingBasis` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.consequentialChargingBasis` |
| ✓ | `councilTaxBand` | Dat | Property → xsd:string | `propertyPack.councilTax.councilTaxBand` |
| · | `currentChargingBasis` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.currentChargingBasis` |
| ✓ | `currentEnergyRating` | Dat | Property → xsd:string | `propertyPack.energyEfficiency.certificate.currentEnergyRating` |
| · | `dateInstalled` | Dat | Property → xsd:date | `propertyPack.electricity.heatPump.dateInstalled (+1)` |
| ✓ | `dateLastEmptied` | Dat | Property → xsd:date | `propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.offMainsDrainageSystem.dateLastEmptied` |
| · | `dateLastServiced` | Dat | Property → xsd:date | `propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.offMainsDrainageSystem.dateLastServiced` |
| ✓ | `dateReplaced` | Dat | Property → xsd:date | `propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.offMainsDrainageSystem.dateReplaced` |
| · | `dateToBeConnected` | Dat | Property → xsd:date | `propertyPack.connectivity.cableSatelliteTV.dateToBeConnected (+8)` |
| · | `diningAreas` | Dat | Property → xsd:integer | `propertyPack.residentialPropertyFeatures.diningAreas` |
| · | `distanceToNearestSewerageTreatment` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.drainage.distanceToNearestSewerageTreatment` |
| · | `entranceFloor` | Dat | Property → xsd:integer | `propertyPack.buildInformation.building.entranceFloor` |
| · | `from` | Dat | LegalEstate → xsd:date | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.lastDemandPeriod.from (+8)` |
| · | `groundRentFrequency` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.groundRent.groundRentFrequency` |
| · | `handoverOnCompletion` | Dat | Property → xsd:boolean | `propertyPack.smartHomeSystems.handoverOnCompletion` |
| · | `hasFixedRentcharge` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].managedFreeholdOrCommonholdInformation.serviceCharge.hasFixedRentcharge` |
| · | `heading` | Dat | Property → xsd:decimal | `propertyPack.location.googleStreetViewPOV.heading` |
| ✓ | `heatingLastServicedDate` | Dat | Property → xsd:date | `propertyPack.heating.heatingSystem.centralHeatingDetails.heatingLastServicedDate` |
| ✓ | `heatingType` | Dat | Property → xsd:string | `propertyPack.heating.heatingSystem.heatingType` |
| · | `kitchens` | Dat | Property → xsd:integer | `propertyPack.residentialPropertyFeatures.kitchens` |
| · | `lastMaintained` | Dat | Property → xsd:date | `propertyPack.electricity.solarPanels.lastMaintained` |
| ✓ | `lengthOfLeaseInYears` | Dat | LegalEstate → xsd:integer | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.leaseTerm.lengthOfLeaseInYears` |
| ✓ | `location` | Dat | Property → xsd:string | `propertyPack.electricity.mainsElectricity.electricityMeter.location (+3)` |
| · | `logbookProvider` | Dat | Property → xsd:string | `propertyPack.completionAndMoving.digitalPropertyLogbook.logbookProvider` |
| · | `mpan` | Dat | Property → xsd:string | `propertyPack.electricity.mainsElectricity.electricityMeter.mpan` |
| · | `mprn` | Dat | Property → xsd:string | `propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.gasMeter.mprn` |
| · | `numberOfFloors` | Dat | Property → xsd:integer | `propertyPack.buildInformation.building.numberOfFloors` |
| · | `numberOfPropertiesSharing` | Dat | Property → xsd:integer | `propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.offMainsDrainageSystem.otherConnectedProperties.numberOfPropertiesSharing` |
| ✓ | `otherCentralHeatingFuelType` | Dat | Property → xsd:string | `propertyPack.heating.heatingSystem.centralHeatingDetails.centralHeatingFuel.otherCentralHeatingFuelType` |
| · | `otherHeatingFeatures` | Dat | Property → xsd:string | `propertyPack.heating.otherHeatingFeatures` |
| · | `otherOwnershipDetails` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].otherOwnershipDetails` |
| · | `otherPropertiesInManagedArea` | Dat | LegalEstate → xsd:decimal | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.general.otherPropertiesInManagedArea` |
| · | `otherType` | Dat | Property → xsd:string | `propertyPack.buildInformation.building.otherType` |
| · | `outsideAreas` | Dat | Property → xsd:string | `propertyPack.residentialPropertyFeatures.outsideAreas` |
| ✓ | `ownershipType` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].ownershipType` |
| · | `parkingArrangements` | Dat | Property → xsd:string | `propertyPack.parking.parkingArrangements` |
| · | `personWhoDealsWithTheDeedOfCovenant` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.transferAndRegistration.deedOfCovenantRequired.personWhoDealsWithTheDeedOfCovenant (+1)` |
| · | `pitch` | Dat | Property → xsd:decimal | `propertyPack.location.googleStreetViewPOV.pitch` |
| · | `procedureForObtainingCertificate` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.transferAndRegistration.procedureForObtainingCertificate (+1)` |
| · | `propertiesContributingToMaintenanceOfManagedArea` | Dat | LegalEstate → xsd:decimal | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.propertiesContributingToMaintenanceOfManagedArea` |
| ✓ | `propertyType` | Dat | Property → xsd:string | `propertyPack.buildInformation.building.propertyType (+1)` |
| · | `publicSewerMapAttached` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.maps.publicSewerMapAttached` |
| · | `receptions` | Dat | Property → xsd:integer | `propertyPack.residentialPropertyFeatures.receptions` |
| ✓ | `rentIncreaseCalculated` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.groundRent.rentSubjectToIncrease.rentIncreaseCalculated` |
| ✓ | `rentReviewFrequency` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.groundRent.rentSubjectToIncrease.rentReviewFrequency` |
| · | `requirements` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.transferAndRegistration.licenceToAssignRequired.requirements` |
| · | `sewerageBills` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.sewerageBills` |
| · | `sewerageProvider` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.sewerageProvider` |
| ✓ | `sharedOwnershipPercentage` | Dat | LegalEstate → xsd:decimal | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.sharedOwnership.sharedOwnershipPercentage` |
| ✓ | `startYearOfLease` | Dat | LegalEstate → xsd:gYear | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.leaseTerm.startYearOfLease` |
| ✓ | `supplier` | Dat | Property → xsd:string | `propertyPack.connectivity.cableSatelliteTV.supplier (+8)` |
| · | `supplyClassification` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.water.supplyClassification` |
| ✓ | `titleExtents` | Dat | LegalEstate → xsd:string | `propertyPack.titlesToBeSold[].titleExtents` |
| ✓ | `titleNumber` | Dat | RegisteredTitle → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].titleNumber (+2)` |
| · | `titlePropertyDescription` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].titlePropertyDescription` |
| · | `to` | Dat | LegalEstate → xsd:date | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.lastDemandPeriod.to (+8)` |
| · | `typeOfFlooding` | Dat | Property → xsd:string | `propertyPack.environmentalIssues.flooding.historicalFlooding.typeOfFlooding` |
| · | `waterBills` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.waterBills` |
| · | `waterProvider` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.charging.waterProvider` |
| · | `waterworksMapAttached` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.maps.waterworksMapAttached` |
| · | `willHandoverLogbook` | Dat | Property → xsd:boolean | `propertyPack.completionAndMoving.digitalPropertyLogbook.willHandoverLogbook` |
| · | `year` | Dat | LegalEstate → xsd:gYear | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.lastDecoratedPeriod.externally.year (+1)` |
| ✓ | `yearCompleted` | Dat | Property → xsd:gYear | `propertyPack.alterationsAndChanges.changeOfUse.yearCompleted (+2)` |
| · | `yearInstalled` | Dat | Property → xsd:gYear | `propertyPack.electricity.solarPanels.yearInstalled` |
| ✓ | `yearOfBuild` | Dat | Property → xsd:gYear | `propertyPack.buildInformation.yearOfBuild (+1)` |
| ✓ | `yearTested` | Dat | Property → xsd:gYear | `propertyPack.electricalWorks.testedByQualifiedElectrician.yearTested` |
| ✓ | `yearWorkCarriedOut` | Dat | Property → xsd:gYear | `propertyPack.electricalWorks.electricalWorkSince2005.yearWorkCarriedOut` |
| · | `zoom` | Dat | Property → xsd:decimal | `propertyPack.location.googleStreetViewPOV.zoom` |
| · | `hasEPCCertificate` | Obj | Property → EPCCertificate | `propertyPack.energyEfficiency.certificate` |

### transaction (14)  
| | property | kind | domain → range | schema leaf |
|--|--|--|--|--|
| · | `authorisationToShare` | Dat | Transaction → xsd:boolean | `propertyPack.saleReadyDeclarations.authorisationToShare` |
| · | `authorisedToActOnBehalfOfAllSellers` | Dat | Transaction → xsd:boolean | `propertyPack.saleReadyDeclarations.authorisedToActOnBehalfOfAllSellers` |
| ✓ | `confirmInformationIsAccurate` | Dat | Transaction → xsd:boolean | `propertyPack.confirmationOfAccuracyByOwners.confirmInformationIsAccurate (+1)` |
| ✓ | `confirmWillProvideAdditionalDocumentation` | Dat | Transaction → xsd:boolean | `propertyPack.confirmationOfAccuracyByOwners.confirmWillProvideAdditionalDocumentation` |
| · | `confirmation` | Dat | Transaction → xsd:boolean | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.confirmationOfAccuracy.confirmation (+1)` |
| ✓ | `consumerProtectionRegulationsResponse` | Dat | Transaction → xsd:boolean | `propertyPack.consumerProtectionRegulationsDeclaration.consumerProtectionRegulationsResponse` |
| ✓ | `leaveKeys` | Dat | Transaction → xsd:boolean | `propertyPack.completionAndMoving.sellerWillEnsure.leaveKeys` |
| ✓ | `removeRubbish` | Dat | Transaction → xsd:boolean | `propertyPack.completionAndMoving.sellerWillEnsure.removeRubbish` |
| ✓ | `replaceLightFittings` | Dat | Transaction → xsd:boolean | `propertyPack.completionAndMoving.sellerWillEnsure.replaceLightFittings` |
| · | `response` | Dat | Transaction → xsd:boolean | `propertyPack.ownership.ownershipsToBeTransferred[].managedFreeholdOrCommonholdInformation.confirmation.response` |
| · | `sellingAgent` | Dat | Transaction → xsd:string | `chain.onwardPurchase[].sellingAgent` |
| ✓ | `signedOn` | Dat | Transaction → xsd:date | `contracts[].signatures[].signedOn (+1)` |
| ✓ | `takeReasonableCare` | Dat | Transaction → xsd:boolean | `propertyPack.completionAndMoving.sellerWillEnsure.takeReasonableCare` |
| ✓ | `transactionId` | Dat | Transaction → xsd:string | `chain.onwardPurchase[].transactionId (+1)` |

### descriptive (105)  
| | property | kind | domain → range | schema leaf |
|--|--|--|--|--|
| · | `ageRange` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.schools[].ageRange` |
| ✓ | `amount` | Dat | MonetaryAmount → xsd:decimal | `propertyPack.localSearches.localLandCharges[].amount (+2)` |
| · | `applicationDate` | Dat | Search → xsd:date | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingRegulationsApproval[].applicationDate (+1)` |
| · | `applicationType` | Dat | Search → xsd:string | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingRegulationsApproval[].applicationType (+1)` |
| · | `buildingControlStartDate` | Dat | Search → xsd:date | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingControlStartDate` |
| ✓ | `consentsObtained` | Dat | Property → xsd:string | `propertyPack.listingAndConservation.hasTreePreservationOrder.workCarriedOut.consentsObtained` |
| · | `constructionType` | Dat | Property → xsd:string | `propertyPack.surveys[].misc.constructionType` |
| · | `contributionIncludedInServiceCharge` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.reserveFund.contributionIncludedInServiceCharge` |
| · | `councilSearchTurnaroundTimeInWorkingDays` | Dat | Search → xsd:integer | `propertyPack.localAuthority.councilSearchTurnaroundTimeInWorkingDays` |
| ✓ | `countyCouncil` | Dat | Search → xsd:string | `propertyPack.localAuthority.countyCouncil` |
| · | `credibilitySources` | Dat | Valuation → xsd:string | `valuationComparisonData.propertyPricing.priceEstimationDetails.credibilitySources` |
| · | `dangerousCladdingOrDefects` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.dangerousCladdingOrDefects` |
| · | `dateRemedialActionRequired` | Dat | RiskAssessment → xsd:date | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.managedAreasCoveredByPolicy.riskAssessments.dateRemedialActionRequired` |
| · | `dealsWithDayToDayMaintenanceOfManagedArea` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].managedFreeholdOrCommonholdInformation.contactDetails.dealsWithDayToDayMaintenanceOfManagedArea` |
| · | `decision` | Dat | Search → xsd:string | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingRegulationsApproval[].decision (+1)` |
| · | `decisionDate` | Dat | Search → xsd:date | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingRegulationsApproval[].decisionDate (+1)` |
| · | `designationType` | Dat | Search → xsd:string | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.designationsAndProposals.plans[].designations[].designationType` |
| ✓ | `dischargeCompliesWithGBR` | Dat | Property → xsd:string | `propertyPack.waterAndDrainage.drainage.mainsFoulDrainage.offMainsDrainageSystem.plantDrainsIntoWaterway.dischargeCompliesWithGBR` |
| ✓ | `displayName` | Dat | — → xsd:string | `propertyPack.documents[].displayName (+1)` |
| · | `distanceInMiles` | Dat | NearbyFacility → xsd:decimal | `propertyPack.nearbyFacilities.healthCare[].distanceInMiles (+2)` |
| ✓ | `districtCouncil` | Dat | Search → xsd:string | `propertyPack.localAuthority.districtCouncil` |
| ✓ | `documentDate` | Dat | AttachedDocument → xsd:date | `propertyPack.titlesToBeSold[].additionalDocuments[].documentDate (+1)` |
| · | `documentTypeCode` | Dat | AttachedDocument → xsd:string | `propertyPack.titlesToBeSold[].additionalDocuments[].documentTypeCode` |
| ✓ | `expectedDeliveryDate` | Dat | Search → xsd:date | `propertyPack.searches[].expectedDeliveryDate` |
| · | `filedUnder` | Dat | AttachedDocument → xsd:string | `propertyPack.titlesToBeSold[].additionalDocuments[].filedUnder (+1)` |
| · | `forTheManagedAreas` | Dat | LegalEstate → xsd:decimal | `propertyPack.ownership.ownershipsToBeTransferred[].managedFreeholdOrCommonholdInformation.serviceCharge.reserveFund.amount.forTheManagedAreas` |
| · | `freeholdOwner` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.ownershipAndManagement.freeholdOwner` |
| · | `fromTheOwners` | Dat | LegalEstate → xsd:decimal | `propertyPack.ownership.ownershipsToBeTransferred[].managedFreeholdOrCommonholdInformation.serviceCharge.reserveFund.amount.fromTheOwners` |
| · | `hasFloodDefences` | Dat | Property → xsd:string | `propertyPack.environmentalIssues.flooding.floodDefences.hasFloodDefences` |
| ✓ | `hasFloorplan` | Dat | Property → xsd:string | `propertyPack.buildInformation.roomDimensions.hasFloorplan` |
| · | `hasHelpToBuyEquityLoan` | Dat | Property → xsd:string | `propertyPack.ownership.hasHelpToBuyEquityLoan` |
| · | `hasLift` | Dat | Property → xsd:string | `propertyPack.buildInformation.building.hasLift` |
| · | `hasTenantCompanyDissolved` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.ownershipAndManagement.hasTenantCompanyDissolved` |
| · | `headLeaseholderControlled` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.ownershipAndManagement.hasHeadlease.headLeaseholderControlled` |
| · | `isConnectedToNationalGrid` | Dat | Property → xsd:string | `propertyPack.electricity.solarPanels.isConnectedToNationalGrid` |
| · | `isFirstRegistration` | Dat | Property → xsd:string | `propertyPack.ownership.isFirstRegistration` |
| · | `isHMO` | Dat | Property → xsd:string | `propertyPack.buildInformation.isHMO` |
| · | `isLeaseQualifying` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingSafetyAct.isLeaseQualifying` |
| · | `isLimitedCompanySale` | Dat | Property → xsd:string | `propertyPack.ownership.isLimitedCompanySale` |
| · | `isManagingAgentEmployed` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.ownershipAndManagement.isManagingAgentEmployed` |
| · | `isStudentAccommodation` | Dat | Property → xsd:string | `propertyPack.buildInformation.isStudentAccommodation` |
| · | `landlordInsuresIfFlat` | Dat | Property → xsd:string | `propertyPack.insurance.landlordInsuresIfFlat` |
| · | `landlordNotifiedOfSale` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingSafetyAct.landlordNotifiedOfSale` |
| · | `length` | Dat | RoomDimension → xsd:decimal | `propertyPack.buildInformation.roomDimensions.rooms[].length` |
| · | `listedDate` | Dat | Valuation → xsd:date | `valuationComparisonData.propertyDetails[].propertyListingInfo.listedDate` |
| ✓ | `localAuthorityName` | Dat | Search → xsd:string | `propertyPack.localAuthority.localAuthorityName` |
| · | `localAuthorityReference` | Dat | Search → xsd:string | `propertyPack.localAuthority.localAuthorityReference` |
| ✓ | `loftBoarded` | Dat | Property → xsd:string | `propertyPack.typeOfConstruction.loft.loftBoarded` |
| ✓ | `loftInsulated` | Dat | Property → xsd:string | `propertyPack.typeOfConstruction.loft.loftInsulated` |
| · | `managementPlanInPlace` | Dat | Property → xsd:string | `propertyPack.specialistIssues.japaneseKnotweed.managementPlanInPlace` |
| · | `marketingTenure` | Dat | Property → xsd:string | `propertyPack.marketingTenure` |
| · | `mediaUrl` | Dat | — → xsd:anyURI | `propertyPack.media[].mediaUrl (+1)` |
| · | `ofstedRating` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.schools[].ofstedRating` |
| ✓ | `orderDate` | Dat | Search → xsd:date | `propertyPack.searches[].orderDate` |
| · | `organisesBuildingInsurance` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.serviceContactAssignments.organisesBuildingInsurance` |
| · | `otherRating` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.schools[].otherRating` |
| · | `outstandingEnforcementAction` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.managedAreasCoveredByPolicy.riskAssessments.outstandingEnforcementAction` |
| · | `planningStartDate` | Dat | Search → xsd:date | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.planningStartDate` |
| ✓ | `priceQualifier` | Dat | Property → xsd:string | `propertyPack.priceInformation.priceQualifier` |
| · | `pricingMethodology` | Dat | Valuation → xsd:string | `valuationComparisonData.propertyPricing.priceEstimationDetails.pricingMethodology` |
| ✓ | `productCode` | Dat | Search → xsd:string | `propertyPack.searches[].productCode` |
| ✓ | `providerName` | Dat | Search → xsd:string | `propertyPack.searches[].providerName` |
| · | `providerReference` | Dat | Search → xsd:string | `propertyPack.searches[].providerReference` |
| · | `pupils` | Dat | NearbyFacility → xsd:integer | `propertyPack.nearbyFacilities.schools[].pupils` |
| · | `refNumber` | Dat | Search → xsd:string | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.buildingRegulationsApproval[].refNumber (+1)` |
| · | `regulatedSearchTurnaroundTimeInWorkingDays` | Dat | Search → xsd:integer | `propertyPack.localAuthority.regulatedSearchTurnaroundTimeInWorkingDays` |
| · | `religiousCharacter` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.schools[].religiousCharacter` |
| ✓ | `reportDate` | Dat | Search → xsd:date | `propertyPack.searches[].reportDate (+1)` |
| · | `retrievedOn` | Dat | AttachedDocument → xsd:date | `propertyPack.titlesToBeSold[].additionalDocuments[].retrievedOn` |
| · | `roomName` | Dat | RoomDimension → xsd:string | `propertyPack.buildInformation.roomDimensions.rooms[].roomName` |
| · | `saleAtUndervalue` | Dat | Property → xsd:string | `propertyPack.priceInformation.saleAtUndervalue` |
| · | `schoolType` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.schools[].schoolType.college (+4)` |
| · | `sellerCompletedDeedOfCertificate` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingSafetyAct.deedOfCertificateServed.sellerCompletedDeedOfCertificate` |
| · | `sellerOwnedProperty` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.enfranchisement.sellerOwnedProperty` |
| · | `soldDate` | Dat | Valuation → xsd:date | `valuationComparisonData.propertyDetails[].propertyListingInfo.soldDate` |
| · | `specialties` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.healthCare[].specialties` |
| ✓ | `status` | Dat | Search → xsd:string | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.decisionsAndPendingApplications.planningPermission[].status (+2)` |
| · | `statusDate` | Dat | Search → xsd:date | `propertyPack.localSearches.localAuthoritySearches.planningAndBuildingRegulations.designationsAndProposals.plans[].statusDate` |
| · | `subCategory` | Dat | RiskAssessment → xsd:string | `propertyPack.environmentalIssues.climate.climateRisk.riskSubcategories[].subCategory (+1)` |
| · | `transportType` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.transport[].transportType` |
| ✓ | `typeOfConnection` | Dat | Property → xsd:string | `propertyPack.connectivity.broadband.typeOfConnection` |
| · | `typeOfHealthCare` | Dat | NearbyFacility → xsd:string | `propertyPack.nearbyFacilities.healthCare[].typeOfHealthCare` |
| · | `unitaryAuthority` | Dat | Search → xsd:string | `propertyPack.localAuthority.unitaryAuthority` |
| · | `urgentWorksCarriedOut` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.managedAreasCoveredByPolicy.riskAssessments.urgentWorksCarriedOut` |
| · | `urgentWorksRecommended` | Dat | LegalEstate → xsd:string | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.buildingsInsurance.managedAreasCoveredByPolicy.riskAssessments.urgentWorksRecommended` |
| ✓ | `url` | Dat | — → xsd:anyURI | `contracts[].contract.template.url (+1)` |
| · | `width` | Dat | RoomDimension → xsd:decimal | `propertyPack.buildInformation.roomDimensions.rooms[].width` |
| · | `willingToInsure` | Dat | Property → xsd:string | `propertyPack.alterationsAndChanges.unresolvedPlanningIssues.willingToInsure` |
| · | `yield` | Dat | Valuation → xsd:decimal | `valuationComparisonData.propertyPricing.yield` |
| · | `annualCostOfPermit` | Obj | Property → MonetaryAmount | `propertyPack.parking.controlledParking.annualCostOfPermit` |
| ✓ | `annualGroundRent` | Obj | LegalEstate → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.groundRent.annualGroundRent` |
| ✓ | `annualServiceCharge` | Obj | LegalEstate → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.serviceCharge.annualServiceCharge (+1)` |
| · | `certificateOfComplianceFee` | Obj | LegalEstate → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.requiredDocuments.certificateOfComplianceFee` |
| · | `costsApplicableToTheDeed` | Obj | Transaction → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.transferAndRegistration.deedOfCovenantRequired.costsApplicableToTheDeed (+1)` |
| · | `councilTaxAnnualCharge` | Obj | Property → MonetaryAmount | `propertyPack.councilTax.councilTaxAnnualCharge` |
| · | `estimatedAmount` | Obj | Valuation → MonetaryAmount | `valuationComparisonData.propertyPricing.rentalEstimate.estimatedAmount` |
| · | `estimatedPrice` | Obj | Valuation → MonetaryAmount | `valuationComparisonData.propertyPricing.estimatedPrice` |
| · | `feeIncludingVAT` | Obj | Transaction → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.contactDetails.serviceContactAssignments.noticeOfAssignmentAndCharge.landlord.feeIncludingVAT (+13)` |
| · | `holdingDeposit` | Obj | Property → MonetaryAmount | `propertyPack.lettingInformation.holdingDeposit` |
| · | `listPrice` | Obj | Valuation → MonetaryAmount | `valuationComparisonData.propertyDetails[].propertyListingInfo.listPrice` |
| · | `potentialCost` | Obj | Property → MonetaryAmount | `propertyPack.typeOfConstruction.buildingSafety.potentialCost` |
| · | `rent` | Obj | Property → MonetaryAmount | `propertyPack.lettingInformation.rent` |
| · | `securityDeposit` | Obj | Property → MonetaryAmount | `propertyPack.lettingInformation.securityDeposit` |
| ✓ | `sharedOwnershipRent` | Obj | LegalEstate → MonetaryAmount | `propertyPack.ownership.ownershipsToBeTransferred[].leaseholdInformation.sharedOwnership.sharedOwnershipRent` |
| · | `soldPrice` | Obj | Valuation → MonetaryAmount | `valuationComparisonData.propertyDetails[].propertyListingInfo.soldPrice` |

### (merged-only) (1)  
| | property | kind | domain → range | schema leaf |
|--|--|--|--|--|
| ✓ | `organisation` | Dat | Organisation → xsd:string | `participants[].organisation` |
