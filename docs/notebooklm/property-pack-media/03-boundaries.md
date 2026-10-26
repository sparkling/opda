# Semantic homes, shared terms and relationships

Authored OPDA learning reading, 26 October 2026. This account distinguishes the accepted resource-home rule from the current candidate allocations and from mappings that do not yet exist.

## One accountable home

A semantic home identifies who is responsible for the meaning of a model resource. It is not a storage location, software service or rule that only one participant may use the resource. An OPDA-defined class, property, shape or vocabulary has one accountable home even when several contexts use it.

The six property bounded contexts are Finance and Banking, Conveyancing, Estate Agency, Surveying and Valuation, Property Data Services, and Property Technology. They organise meanings around different domain concerns. They do not imply six copies of every property or six competing universal models.

The DBT Smart Data scheme context is separate. It concerns scheme-level trust, consent, authorisation and participation semantics. It is not a seventh property bounded context, and a candidate graph bearing its name is not a government working group or government endorsement.

The common boundary is another distinct semantic home. It is deliberately small and governed through interoperability review. A concept belongs there when multiple contexts require the same identity criterion and stable exchange meaning. Widespread use alone is insufficient. An unresolved term should not be placed there merely to avoid deciding responsibility.

## A connection that crosses homes

The current candidate places Property and UPRN in common, and Address, postcode and hasAddress in Property Data Services. The hasAddress relationship is owned by Property Data Services while its domain is the common Property class. This illustrates that semantic ownership and reuse are different dimensions.

The Property class proposes identity independent of any particular address or transaction. Address is mutable and has unresolved authoritative identity beyond its components. Separating them lets reviewers examine changes of description without silently changing the identity of the subject. It also exposes an open modelling question rather than hiding it inside a flat form.

A context can use a shared concept directly where its meaning is appropriate. The common boundary is not a routing hub between contexts. Direct resource relationships and declared dependencies can connect the model without making every interaction pass through common.

## Different meanings stay visible

The same everyday label can have different meanings in different professional settings. The accepted modelling rule is to preserve distinct resources when identity or meaning differs, then record a justified relationship. A similarity of labels does not warrant owl:sameAs or an automatic equivalence assertion. Externally governed terms retain their external authority; reuse does not transfer ownership to OPDA.

The current context-map projection contains common-boundary dependencies and no governed cross-context mappings. That absence matters: a diagram of contexts must not invent approved SKOS mappings or SSSOM records. A proposed mapping would need identifiable source and target meanings, evidence and a recorded decision. A dependency says that one context reuses something; it does not certify semantic equivalence.

## Scope and counts

The candidate assigns the 451 source items to these homes: Conveyancing 206, Property Data Services 197, Surveying and Valuation 26, Estate Agency 7, Finance and Banking 7, Property Technology 6, common 1 and DBT Smart Data 1. These are source-item allocations, not counts of classes, domain importance, working-group membership or completed review decisions.

The Property Pack itself spans these homes as a delivery profile. It is not a ninth semantic home. Work packages may group related review tasks across contexts; their convenience does not change definition ownership. A reviewer should be able to identify the resource's home, distinguish consuming contexts, see dependencies, and find the evidence supporting any mapping that is actually asserted.
