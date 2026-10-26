# A property pack carries information across a transaction

Authored OPDA learning reading, 26 October 2026. This reading explains the accepted scope and the current machine-proposed candidate. It is educational source material, not an approved exchange contract.

## The shared subject

A Property Pack is a standardised bundle of information about a property for a transaction. A seller, estate agent, conveyancer, surveyor, lender and data provider can need different parts of that information. The useful connection is the property and the evidence about it. Each participant still has a particular professional question and responsibility.

Consider an illustrative sale of a house. The estate agent needs an accurate description; a conveyancer examines legal interests and obligations; a lender assesses lending information; a surveyor considers condition and valuation; a data provider supplies address or utility information. This situation illustrates why a connected account is useful. It is not a claim that the candidate already operates a live transaction service, reduces completion times by a measured amount or replaces professional judgement.

The accepted initial scope is 451 required source items. That number identifies the business-data boundary. It does not prescribe 451 ontology properties, 451 mandatory answers on every transaction, or 451 independent facts. A conditional question can belong to the required scope even when it is inapplicable to a particular property. Repeated source structures and controlled responses need to retain their conditions.

## A source definition and a model do different jobs

The original workbook and the PDTF JSON schema identify fields and paths. The new ontology asks what those fields mean: which real-world thing is described, how it is identified, which relationship connects it to the property, and who owns the definition. The accepted approach uses the source items as a coverage boundary, then models from first principles. Legacy structures remain attributed evidence rather than an automatic blueprint.

One source item can require several constructs: a resource, the link to that resource, an attribute and a controlled value. Conversely, several source items can be expressed through one coherent class and a set of properties. The item-to-model crosswalk records those choices. This makes consolidation inspectable instead of silently dropping detail.

The current candidate gives Property its own identity and treats an Address as a related description. The property does not become a new property merely because its recorded address changes. Its proposed identity criterion is continuity of the unit associated with the same assigned Unique Property Reference Number (UPRN); lifecycle rules remain for review. UPRN is represented as a string identifier, not a number on which to calculate. Address identity is still unresolved beyond its structural components.

## Information keeps its context

The pack draws on several semantic homes. Conveyancing and surveying can describe the same property while retaining distinct professional meanings. A shared term belongs in the common boundary only when its identity and exchange meaning really are shared. That boundary supplies reusable concepts; it is not a hub through which all communication must pass.

Provenance connects a proposed term back to its source item, source path, workbook location and modelling rationale. A consumer can therefore ask both what a statement means and why the model represents it that way. Proposed provenance or consent semantics do not themselves implement a consent service or authorise data disclosure.

## What exists today

Candidate property-pack-0.1, version 0.1.0-draft, is machine-proposed and non-normative. Its recorded summary has 451 source items, 159 ontology resources and 14 controlled vocabularies. These are different kinds of count. Passing model checks does not make it a ratified standard.

The Property Pack ontology is an independent delivery intended to become a future component of the Smart Property Data Trust Framework (SPDTF). It is neither the entire future SPDTF ontology nor a renamed version of the third-party PDTF schema. The original 30 September 2026 technical-determination target has passed; the current repository records no determination, adopted release or external government approval. Subsequent review needs a decision tied to the exact candidate.
