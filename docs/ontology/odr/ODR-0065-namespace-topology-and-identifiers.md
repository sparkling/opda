---
status: accepted
date: 2026-09-07
kind: methodology
tags: [modelling-method, namespaces, identifiers, bounded-context, vann]
supersedes: []
amends: [ADR-0006, ADR-0067]
depends-on: [ODR-0038, ODR-0040, ODR-0045, ODR-0059, ODR-0060, ODR-0064]
implements: []
---

# OPDA namespace topology and stable identifiers

## Context and Problem Statement

The selected modelling method gives definitions accountable semantic homes, but
the current namespace documentation primarily explains the preserved schema-derived
ontology under `https://opda.org.uk/pdtf/`. The separate machine-proposed Property
Pack candidate still uses `https://w3id.org/opda/candidate/property-pack/0.1/`.
Neither is the namespace policy for the new governed domain model.

On 7 September 2026 the directing authority requested adoption of the source
method's namespace scheme with `opda.org.uk`, and an explanation within Ontology
modelling. This record consolidates the relevant source decisions, adapting their
organisation-specific bindings to OPDA. The source was inspected read-only at
revision `5e083c3baf6837ab93698d883a6ff01338565bd8`; it was not modified.

## Decision Drivers

- Separate vocabulary identity, instance identity and document location.
- Preserve independent meaning within the already established contexts.
- Distinguish the shared modelling infrastructure from shared domain content.
- Keep identifiers stable across label, organisational and file-layout changes.
- Make namespace-policy adoption distinguishable from term approval and migration.

## Considered Options

- Extend the historical flat `/pdtf/` namespace to every new domain context.
- Adopt the source method's `/ns/` topology and `/id/` instance convention on `opda.org.uk`.
- Derive identifiers from website routes, category folders, source systems or releases.

## Decision Outcome

Adopt the second option for the new governed model. Use HTTPS slash IRIs on
`opda.org.uk`, with flat context namespaces, separate shared-content and metamodel
spaces, per-facet/per-enumeration namespaces, and `/id/{type}/{ref}` for OPDA-governed
instance identities. The rules below define their admission and persistence.

This selects the policy and initial namespace bindings. It does not approve any
example term, replace the preserved corpus, migrate the current candidate, create
an identifier service, or claim that the new IRIs already resolve over HTTP.

### Consequences

- Good, because independent contexts can use the same local name without colliding.
- Good, because stable identifiers survive changes to files, labels and representations.
- Good, because a local decision and explainer replace conflicting implied policies.
- Bad, because future migration requires explicit identity-by-identity reconciliation.
- Bad, because namespace bindings and admitted local names need collision review.
- Neutral, because choosing this scheme adds no operating application or Trust service.

### Confirmation

The policy is accepted; implementation in ontology artefacts remains pending.
Documentation delivery requires the explainer, local decision links, the adoption
crosswalk and reconciliation of the prior namespace-pending statements. A later
implementation must separately demonstrate:

- [ ] Registered namespace/ontology declarations and explicit semantic ownership.
- [ ] Collision-free bindings and identifiers, including reserved namespace segments.
- [ ] Syntax-valid examples, enumeration/instance separation and stable identifier tests.
- [ ] An approved disposition for every existing identifier affected by any migration.
- [ ] Release-specific evidence for generated artefacts; separately verified HTTP behaviour if offered.

No source-project checklist, review vote or implementation receipt is inherited.

## Rules

### R1 — The namespace tree separates responsibilities

| Namespace | Admitted content |
| --- | --- |
| `https://opda.org.uk/ns/` | Cross-cutting modelling annotations, classification schemes and shared quality-gate shapes; no property-domain semantics |
| `https://opda.org.uk/ns/common/` | Deliberately small, reviewed cross-context domain content: shared concepts, taxonomies and mappings |
| `https://opda.org.uk/ns/meta/` | Metaclasses and their shapes, only where independently admitted by the selected modelling method |
| `https://opda.org.uk/ns/{bc}/` | Classes, properties, shapes and vocabulary resources defined by one established context |
| `https://opda.org.uk/ns/{facet}/` | Governed classification-facet values, separate from business-domain enumerations |
| `https://opda.org.uk/ns/{bc}/{ValueClass}/` or `…/ns/common/{ValueClass}/` | Ontology-owned domain enumeration members, following ODR-0040 |
| `https://opda.org.uk/id/{type}/{ref}` | OPDA-governed instance identities, not vocabulary terms or delivery documents |

The root namespace is an active metamodel vocabulary, not merely a directory and
not a superclass. Before placing a direct child there, verify all three conditions:
cross-cutting use across the contexts, a modelling/classification responsibility,
and absence of business-domain meaning. A shared business concept belongs in the
reviewed common boundary, not at the root.

The `meta/` space is a placement rule, not adoption of the source's governance or
infrastructure ontology. Facet namespaces similarly do not add excluded modelling
categories or require every possible facet to be populated. A classification
scheme's definition may be in the root while its values occupy a dedicated facet
namespace; scheme membership and meaning are explicit RDF, not path inference.

### R2 — Bind the existing contexts; do not discover another hierarchy

The initial tokens reuse the short prefixes already recorded for OPDA's contexts.
Here they become stable namespace segments, independently of future prefix aliases.

| Existing semantic home | Namespace | Initial preferred prefix |
| --- | --- | --- |
| Finance and Banking | `https://opda.org.uk/ns/fb/` | `fb:` |
| Conveyancing | `https://opda.org.uk/ns/conv/` | `conv:` |
| Estate Agency | `https://opda.org.uk/ns/ea/` | `ea:` |
| Surveying and Valuation | `https://opda.org.uk/ns/sv/` | `sv:` |
| Property Data Services | `https://opda.org.uk/ns/pds/` | `pds:` |
| Property Technology | `https://opda.org.uk/ns/pt/` | `pt:` |
| DBT Smart Data scheme context | `https://opda.org.uk/ns/dbt/` | `dbt:` |
| Common boundary | `https://opda.org.uk/ns/common/` | `common:` |

The DBT scheme context is not a seventh property bounded context. It retains only
its existing scheme-level semantic responsibility; namespace selection does not
expand this teaching section into programme Trust operation.

All context namespaces are peers. Do not nest them beneath a business subject,
organisation chart, source system, Property Pack profile or another context.
Tokens are stable identifiers, not descriptions that must track renamed teams.
Namespaces do not replace ODR-0060's independent topic, authority and stewardship
annotations. One resource may be consumed by several contexts without changing its
semantic home.

Reserve `common`, `meta` and admitted facet tokens against context-code collisions.
The source's facet families include `subject`, `dataclass`, `lifecycle`, `gov`,
`vol`, `reg` and `valuechain`; reserve these spellings, but admit only values required
by the local selected method. A value-chain classification does not adopt process
modelling. Any additional space needs an explicit purpose and collision check.

### R3 — Name terms without confusing types, schemes and values

Use UpperCamelCase for classes and facet concepts, lowerCamelCase for properties
and annotations, and a `Shape` suffix for class-oriented shapes. Closed domain
enumeration members use the stable lowercase value under a per-value-class
namespace; labels and `skos:notation` remain separate. Use a dedicated convenience
prefix when the full identifier contains another slash.

For example, in an illustrative inspection vocabulary, `sv:InspectionOutcome` is
the value class; `sv:InspectionOutcomeScheme` is the scheme; a prefix bound to
`https://opda.org.uk/ns/sv/InspectionOutcome/` can abbreviate an `inconclusive` member.
These names demonstrate the convention, not approved local definitions. The
class, scheme, member and `sv:InspectionShape` are distinct resources. This policy
does not transplant the historical `/pdtf/scheme/` or `/pdtf/shape/` split into `/ns/`.

ODR-0040's domain-enumeration typing, closure rules and facet exemption still apply.
A closed value is an RDF individual but remains an ontology-owned vocabulary
resource under `/ns/`; being an individual does not by itself place it under `/id/`.

### R4 — Instance identifiers follow identity, not a source system

Use `/id/{type}/{ref}` for an OPDA-governed instance. The type segment is a stable
lowercase hyphenated token. Prefer an applicable external standard code, then a
stable authoritative business key, then a managed registry code for the reference.
Preserve its canonical spelling; do not derive it from a mutable display label.
Use full angle-bracket IRIs in Turtle where a prefixed local name would contain
unescaped slashes.

This preference is subject to identity, authority, uniqueness and disclosure review.
A key is evidence, not an identity criterion (ODR-0059). Two distinct entities with
the same source key must not collapse into one IRI. Document the key's scope and
choose a safe managed reference where necessary. Do not expose personal or secret
business identifiers merely to make an IRI readable. Reuse an existing governed
external IRI when it denotes the intended entity and is suitable; do not create an
OPDA alias solely to satisfy a naming pattern.

Keep a canonical OPDA identity independent of contributing systems. System origin
belongs in provenance, not in a new per-system instance namespace. This is an
identifier policy, not a promise of automatic identity resolution or an OPDA-run
national instance registry. Open populations may use instance identifiers;
ontology-owned closed values remain in their vocabulary namespaces.

### R5 — Declare bindings; assert authority separately

The initial root prefix is `opda:` and the metaclass prefix is `meta:`. Prefixes
are local abbreviations, not globally unique identifiers. In historical files
`opda:` can still expand to `https://opda.org.uk/pdtf/`; in new-model material it
expands to `https://opda.org.uk/ns/`. Always inspect the declaration. Changing an
alias does not change an expanded IRI; changing its expansion does.

Describe each admitted vocabulary on its logical `owl:Ontology` resource with
`vann:preferredNamespacePrefix` and `vann:preferredNamespaceUri`. These declarations
provide the vocabulary binding, rather than competing hand-maintained application
maps. Derived conveniences are not another source of model meaning. Do not import
the source project's API, caching or triplestore architecture as a requirement.

For context-map applicability, ODR-0064 separately requires explicit, named
`IdentifierSystem` resources and governance links. A namespace-based system has
exactly one `vann:preferredNamespaceUri` value typed `xsd:anyURI` in that profile.
The ontology resource, context registry resource, identifier-system resource and
named graph are not interchangeable. A context may govern multiple systems;
prefix parsing, string matching and graph placement do not establish authority.

### R6 — Stable identity is independent of files and versions

Do not put a release version, file extension, repository folder or website route in
the new stable term namespace. Moving, splitting or merging source files must not
change term or logical graph identities. A namespace may span files; a file may
contain several namespaces. Namespace nesting does not assert RDF subclassing,
SKOS hierarchy or an OWL import.

Keep an ontology's logical IRI distinct from its document representations and any
version-specific ontology IRI. `owl:versionInfo` supplies version information;
`owl:versionIRI`, when used, identifies a particular ontology version rather than
renaming all its terms. A release or document address may legitimately be versioned.
This record does not invent a mandatory release, graph or `/doc/` URL template.

An HTTP-shaped IRI does not prove that a web representation currently exists.
Publication and content negotiation are separate delivery decisions. Use the exact
external namespace when reusing external vocabulary, including its original HTTP
scheme or hash delimiter; OPDA's slash rule applies to newly minted OPDA identifiers,
not to rewriting RDF, RDFS, SKOS, SHACL, PROV-O or other governed terms.

### R7 — Shared meaning needs a decision, not a path rewrite

The common boundary is governed by Interoperability. ODR-0059's identity-criterion
review and ADR-0067's shared-meaning conditions govern admission. Matching labels,
multiple consumers or an unexamined `skos:exactMatch` are not sufficient.
Shared content must not acquire a dependency on a domain ontology merely because
its evidence originated there. Preserve reviewed mappings where meanings differ.

Do not silently move an existing term to `common/`, another context or a new local
name. Record whether meaning is unchanged, the old and proposed identifiers,
consumer impact and the required disposition. A new IRI does not prove a new real
entity, and a reused IRI must not silently acquire incompatible meaning.

### R8 — Preserve existing corpora and record the remaining implementation

ADR-0006 continues to govern the preserved schema-derived `/pdtf/` family, including
its kind-split and release snapshots. The current Property Pack 0.1 candidate keeps
its versioned `w3id.org/opda/candidate/property-pack/0.1/` identifiers and
machine-proposed status. Those sources are not edited by this adoption.

This record refines ADR-0067's former discretion about separate context namespaces
for the new governed model only. It resolves the namespace-policy prerequisite;
term approval, declaration population, candidate reconciliation and any publication
remain separate work. A future migration is not a global domain-string replacement
and requires explicit authorisation and evidence.

## More Information

- [ODR-0038](ODR-0038-bounded-context-autonomy.md) and [ODR-0045](ODR-0045-bounded-context-boundary-criteria.md): context autonomy and flat boundaries.
- [ODR-0040](ODR-0040-enumeration-modeling-pattern.md): closed enumerations and open populations.
- [ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md): identity criteria and common promotion.
- [ODR-0060](ODR-0060-data-domain-vs-subject-area-vs-bounded-context.md) and [ODR-0064](ODR-0064-sparql-queryable-ddd-context-maps.md): authority and explicit identifier systems.
- [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md) and [ADR-0067](../../adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md): preserved identifiers and first-principles scope.
- [Method adoption crosswalk](./method-adoption-crosswalk.json): exact source records and revision.
- Source-method records 0013, 0020, 0023, 0024, 0040, 0055, 0065 and 0097 were inspected at revision `5e083c3baf6837ab93698d883a6ff01338565bd8`. Their namespace rules are consolidated here; the active identity and identifier-system refinements remain governed by the local decisions above.
- [VANN vocabulary](https://vocab.org/vann/): namespace annotation terms; not a W3C Recommendation.
- [OWL ontology and version IRIs](https://www.w3.org/TR/owl2-syntax/#Ontology_IRI_and_Version_IRI): logical identity and versions.

## Amendments

- **2026-09-07 — Directing-authority adoption.** Selects the source method's namespace
  responsibilities on `opda.org.uk`, reusing OPDA's existing context codes. It does
  not transplant source business terms, operational architecture, governed KB
  subtrees, review votes or implementation claims. Documentation and policy only;
  no corpus reminting or upstream change.
