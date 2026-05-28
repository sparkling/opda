# Concept-tier entity catalogue

Complete index of OPDA Concept-tier entities. Each row links to the entity's narrative file in this tier; cross-tier traceability follows the convention `/docs/manual/concept/<module>/<entity>.md`.

## Foundation

Cross-cutting kinds reused across every module.

| Entity | Summary |
|---|---|
| [Diagnostic Exemplar](./foundation/diagnostic-exemplar.md) | Minimal worked-example data exposing one Identity-Criterion-bearing surface for Council validation |
| [Generator Run](./foundation/generator-run.md) | A single execution of the opda-gen pipeline that produced a specific set of emitted ontology files |
| [Relator](./foundation/relator.md) | A relational kind that mediates two or more parties and is founded by an external event |
| [Role](./foundation/role.md) | A role borne by a single underlying Kind (e.g. Proprietor borne by Person) |
| [Role Mixin](./foundation/role-mixin.md) | A role borne by *more than one* underlying Kind (e.g. Seller borne by Person or Organisation) |
| [Validation Context](./foundation/validation-context.md) | The named overlay profile (e.g. BASPI5) under which a record was validated |

## Property

The Identity-Criterion crux of OPDA: physical Property, the legal rights vested in it, the registry record documenting it, and the addresses locating it.

| Entity | Summary |
|---|---|
| [Address](./property/address.md) | An authority-issued locator (Royal Mail / OS / HMLR / INSPIRE) for a Property |
| [Lease Extension Event](./property/lease-extension-event.md) | A statutory lease-extension event that mutates a leasehold's term without breaking its identity |
| [Lease Term](./property/lease-term.md) | The time interval bounding a leasehold tenure |
| [Legal Estate](./property/legal-estate.md) | The bundle of legal rights vested in a Property (Freehold / Leasehold / Commonhold) |
| [Property](./property/property.md) | The physical residential property — a house, flat, bungalow, or maisonette |
| [Registered Title](./property/registered-title.md) | The HMLR title-register record documenting a Legal Estate |
| [UPRN Succession Event](./property/uprn-succession-event.md) | An administrative re-numbering of a Property's UPRN — identity persists across the event |

## Agent

People, organisations, and the roles they bear in a property transaction.

| Entity | Summary |
|---|---|
| [Buyer](./agent/buyer.md) | The role borne by the party acquiring a Property in a Transaction |
| [Name Change Event](./agent/name-change-event.md) | A reified record of a Person's name change — Person identity persists |
| [Organisation](./agent/organisation.md) | A corporate or unincorporated organisation party to a Transaction |
| [Person](./agent/person.md) | A natural person — the anchor for PII regimes |
| [Proprietor](./agent/proprietor.md) | The legal owner of a Property as named in a Registered Title |
| [Proprietorship](./agent/proprietorship.md) | The relator binding Proprietors to a Registered Title (joint tenancy or tenants in common) |
| [Seller](./agent/seller.md) | The role borne by the party disposing of a Property in a Transaction |

## Transaction

The Transaction Relator and its lifecycle structure.

| Entity | Summary |
|---|---|
| [Milestone](./transaction/milestone.md) | A point or interval in the Transaction lifecycle (instruction, offer accepted, exchange, completion, registration) |
| [Transaction](./transaction/transaction.md) | A residential-property transaction binding Sellers + Buyers + Legal Estate via a founding event |
| [Transaction Chain](./transaction/transaction-chain.md) | An aggregate of dependent Transactions linked by buyer-also-seller overlap |

## Claim

Verifiable claims, the evidence supporting them, the activity that verified them, and the trust framework + assurance level scoping their validity.

| Entity | Summary |
|---|---|
| [Assurance Level](./claim/assurance-level.md) | A quality grade on a Claim's verification (eIDAS Low / Substantial / High) |
| [Claim](./claim/claim.md) | A verifiable assertion supported by evidence |
| [Document](./claim/document.md) | A short-name alias for Document Evidence (used by worked examples) |
| [Document Evidence](./claim/document-evidence.md) | Paper or scanned artefacts issued by an authoritative source (e.g. grant of probate) |
| [Electronic Record](./claim/electronic-record.md) | A short-name alias for Electronic Record Evidence (used by worked examples) |
| [Electronic Record Evidence](./claim/electronic-record-evidence.md) | API-retrieved structured records from an authoritative source (e.g. HMRC tax-record API) |
| [Evidence](./claim/evidence.md) | The generic evidence supertype — three subtypes: Document, Electronic Record, Vouch |
| [Trust Framework](./claim/trust-framework.md) | A governance regime that scopes claim validity (e.g. the UK Property Data Trust Framework) |
| [Verification Activity](./claim/verification-activity.md) | The activity that produces a verified claim from evidence |
| [Vouch](./claim/vouch.md) | A short-name alias for Vouch Evidence (used by worked examples) |
| [Vouch Evidence](./claim/vouch-evidence.md) | A formal attestation by a regulated professional (e.g. SRA-licensed solicitor) |

## Governance

The DPV (Data Privacy Vocabulary) mapping records that link OPDA Kinds to GDPR personal-data categories.

| Entity | Summary |
|---|---|
| [DPV Mapping Record](./governance/dpv-mapping-record.md) | A mapping from an OPDA Kind to its baseline personal-data category |
| [Special Category Scheme](./governance/special-category-scheme.md) | GDPR Article 10 / DPA 2018 special-category personal-data scheme |

## Descriptive

Authority-issued artefacts that ride alongside a Property in a Transaction.

| Entity | Summary |
|---|---|
| [Comparable](./descriptive/comparable.md) | A comparable-sale or comparable-rental record supporting a Valuation |
| [EPC Certificate](./descriptive/epc-certificate.md) | A DESNZ-governed Energy Performance Certificate for a Property |
| [Search](./descriptive/search.md) | A local-authority or environmental search result (CON29R, LLC1, etc.) |
| [Survey](./descriptive/survey.md) | A professional property survey report |
| [Valuation](./descriptive/valuation.md) | A RICS-regulated professional or automated-model property valuation |
