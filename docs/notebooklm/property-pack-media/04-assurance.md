# What validation proves, and what still needs a decision

Authored OPDA learning reading, 26 October 2026. Evidence is the current candidate validation report, accepted Property Pack decisions and the explicitly proposed October review and migration decisions.

## Several questions need different evidence

The Property Pack candidate can be technically inspectable while its meaning and adoption remain undecided. Source coverage, syntactic validity, constraint behaviour, semantic adequacy, governance determination, implementation release and external recognition are separate claims. Evidence for one is not automatically evidence for the others.

The recorded validation report checks 451 unique source items, one recognised semantic home per item, references from every item to at least one construct, topic closure for consolidated controlled subjects, and traceability from resources back to source items. It also records exclusion of legacy ontology imports, absence of unreviewed default equivalence assertions and parse checks over the generated Turtle files.

These checks make omissions and broken references visible. They do not establish that a consolidation is professionally sound, a definition is unambiguous, every important real-world case is covered or all practitioners agree.

## An observable constraint example

The valid fixture represents a property with a string UPRN and a linked address with a postcode. The invalid fixture deliberately omits the postcode and uses NOT-A-UPRN. The validator reports the missing postcode cardinality and the UPRN pattern failure. This is useful evidence that these constraints are exercised, rather than merely written down.

A digit-only UPRN can still refer to the wrong property. An address with a postcode can still be outdated. A source can be complete but disputed. A technically valid claim can lack an appropriate consent or authority basis. Assessing those questions requires real evidence and accountable judgement beyond these shapes.

The recorded Apache Jena 6.1.0 run accepts RDF 1.2 Basic syntax, tests an implementation-supported SHACL Core subset and a portable SPARQL subset. It does not claim full RDF 1.2 or SHACL 1.2 Union conformance. The report records four competency-query outcomes, including address separation, fixture consolidation, property identity and absence of default same-as. These are bounded tests, not exhaustive certification.

## Human review and release

The accepted accelerated sequence calls for a Technical Working Group determination followed by wider domain review and controlled changes. The original target was 30 September 2026. The current repository records no completed determination, no ratified Property Pack ontology release and no government approval or delegated authority. The candidate remains machine-proposed and non-normative.

Proposed ADR-0090 asks for explicit candidate/version identification, unresolved issues, named reviewers, a deadline, a decision owner and a durable sign-off record. It also preserves an unresolved 442-versus-451 counting question raised against a different schema calculation. That question does not change the accepted 451-item scope. It needs identified source versions and counting rules, rather than a casual replacement of the headline number.

Proposed ADR-0091 describes a possible ontology-first schema-change process: source request, semantic impact, proposed ontology change, review, draft schema generation, validation, independent approval and versioned release. This is a proposed transition. It does not approve existing pull requests, demonstrate generated-schema equivalence or settle compatibility, coexistence or cutover. Current schema work remains subject to its existing process until an authorised transition decision changes it.

## Productive disagreement

A reviewer can accept the value of explicit meaning and still challenge a particular resource boundary, identity criterion, controlled response or source constraint. An implementer can value the model and still need migration evidence. A domain expert can prefer distinct terms where a candidate consolidates them. These are useful disagreements if tied to concrete examples and recorded consequences.

The practical review unit is an identifiable claim about a particular candidate: the source item, proposed construct, evidence, disputed meaning, alternative and expected effect. Deterministic checks can be repeated against the revised package. Human judgement and release authority remain visible. The result is a better basis for a decision, without confusing a generated explanation, a passed test or silence from reviewers with approval.
