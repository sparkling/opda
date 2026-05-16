# Schema section — Information Architecture (rev 2)

The Schema section is the physical model of the PDTF schema: every JSON object renders as a table, every container relationship renders as an edge in the section's ER diagrams. Each page is the physical model of one object cluster.

Rev 1 used aggregate cohesion as the page boundary and ended up with 293 objects on page 38, 241 on page 39, 154 on page 46. Rev 2 splits those three pages along their natural sub-clusters. The other six pages are unchanged.

## Page list

```
Schema
├── 34   Section overview
├── 35   Transaction & participants
├── 36   Chain, milestones & contracts
├── 37   Property identity
├── 38   Legal estate & title                 — landing
│   ├── 38a Tenure
│   ├── 38b Title — OC summary
│   ├── 38c Title — OC full register
│   ├── 38d Ownership — freehold transfer
│   ├── 38e Ownership — leasehold transfer
│   ├── 38f Ownership — managed
│   └── 38g Boundaries & rights
├── 39   Built form, condition & valuation    — landing
│   ├── 39a Built form
│   ├── 39b Condition
│   ├── 39c Fixtures & fittings
│   ├── 39d Surveys
│   └── 39e Valuation
├── 45   Utilities & energy
├── 46   Local context & searches             — landing
│   ├── 46a Local authority (CON29R)
│   ├── 46b Drainage & water (CON29DW)
│   ├── 46c Local Land Charges (LLC1)
│   └── 46d Environmental
├── 47   Encumbrances & completion
├── 48   Evidence, documents & declarations
└── 49   Overlays, tasks & cross-cuts
```

Pages 38, 39, 46 become **landing pages**: a short intro, a top-level ER showing only the sub-cluster heads, and links to the sub-pages. No object tables. Sub-pages carry the full physical model of their sub-cluster.

Other pages (35, 36, 37, 45, 47, 48) keep the existing aggregate-page template (one ER, tables for every owned object).

## Path prefix assignments

Sub-page assignments by JSON path prefix (drives the build's leaf/object → page routing in `theme-map.yaml`):

- **38a Tenure** — `propertyPack.marketingTenure`, `propertyPack.legalOwners`
- **38b Title — OC summary** — `propertyPack.titlesToBeSold[].titleNumber`, `.titleExtents`, `.ocSummaryData`
- **38c Title — OC full register** — `propertyPack.titlesToBeSold[].ocSummaryRegister`, `.ocFullRegister`, `.additionalDocuments`
- **38d Ownership — freehold** — `propertyPack.ownership.ownershipsToBeTransferred[].estateRentcharges`, `.wholeFreeholdForSale`, `.titleNumber`, `.titlePropertyDescription`, `.ownershipType`
- **38e Ownership — leasehold** — `propertyPack.ownership.ownershipsToBeTransferred[].lease`, `.sharedOwnership`
- **38f Ownership — managed** — `propertyPack.ownership.ownershipsToBeTransferred[].managementInformation`, `.serviceCharge`, `.buildingsInsurance`, `.disputesAndComplaints`, `.documents`
- **38g Boundaries & rights** — `propertyPack.legalBoundaries`, `propertyPack.rightsAndInformalArrangements`, plus the `ownership.numberOfSellers` etc. summary leaves
- **39a Built form** — `propertyPack.buildInformation`, `.propertyType`, `.constructionMaterials`, `.connectivity`
- **39b Condition** — `propertyPack.condition`, `.energyEfficiency` cladding-related leaves, defects
- **39c Fixtures & fittings** — `propertyPack.fittingsAndContents`
- **39d Surveys** — `propertyPack.surveys`, `propertyPack.priorIssues`
- **39e Valuation** — `propertyPack.valuation`, `propertyPack.pricing`
- **46a CON29R** — `propertyPack.localLandCharges.con29R`
- **46b CON29DW** — `propertyPack.localLandCharges.con29DW`
- **46c LLC1** — `propertyPack.localLandCharges.llc1`
- **46d Environmental** — `propertyPack.environmental`, `propertyPack.flooding`

Exact prefix lists go into `theme-map.yaml`. The build's existing prefix-matching does the rest.

## Non-changes

- The build pipeline (`scripts/build-schema-pages.py` + `scripts/_lib/object_model.py` + the templates) does not change.
- The object-table macro doesn't change.
- The ER generator doesn't change.
- The runtime click handler doesn't change.

Just config edits + a small landing-page template.

## What I'm doing now

1. Update `theme-map.yaml` with the new sub-page entries (slot + title + path prefixes).
2. Update `scripts/build-schema-pages.py` `PAGE_FILES` / `PAGE_IDS` / `PAGE_ORDER` to include the new slots.
3. Add `landing-page.html.j2` template for the three landing pages — intro + top-level ER + sub-page list.
4. Update `docs/ui/site.js` `SECTIONS.schema.groups` to show the nested nav.
5. Build.
