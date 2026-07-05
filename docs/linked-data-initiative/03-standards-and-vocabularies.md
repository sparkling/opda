# Standards & vocabularies adopted

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> This is the definitive, exhaustive reference behind the "we used a multitude of
> linked-data standards" claim. Every status, count and prefix below was verified
> against the **emitted Turtle** (`source/03-standards/ontology/*.ttl`) and the
> **adoption catalogue** ([ODR-0002](../../docs/ontology/odr/ODR-0002-ontology-language-adoption.md)).
> Where the catalogue says one thing and the shipped TTL says another, the TTL wins and
> the gap is flagged.

## TL;DR

- The ontology stands on **17 external standard vocabularies that actually appear in the emitted Turtle** (verified `@prefix` census), plus a foundational-ontology *theory layer* (UFO / DOLCE / OntoClean) used for **typing and methodology**, not serialised as a vocabulary.
- Adoption is **governed, not ad-hoc**: a three-tier catalogue (**Core / Conditional / Defer**, ODR-0002) bounds the surface area, and **non-adoption is recorded as durably as adoption** — schema.org, FIBO, GeoSPARQL, FOAF, SOSA/SSN, QUDT, BBO, ArchiMate each have a dated rejection with a named re-open trigger. Writing down *why we said no* is itself the audit-trail discipline.
- The **load-bearing five** are SHACL 1.2 (the validation contract — 96 node shapes), SKOS (47 concept schemes / 308 concepts), PROV-O (the claims/evidence backbone), DPV + DPV-PD (GDPR-grade PII typing), and `dct:source` (**1,108 provenance triples** tracing every term/shape to its origin).
- Two honesty points the catalogue and the TTL both confirm: **ODRL is adopted-but-deferred — zero `odrl:` triples are emitted** (🔵); and the **OWL-RL reasoning is shallow today** — the regime *can* do inverse/transitive/symmetric, but the model declares **none** of those properties, so only `rdfs:subClassOf` type-propagation actually fires (🟡).
- The shipped corpus uses **W3C Recommendations first** (RDF 1.2, RDFS, OWL 2, XSD, SHACL 1.2, SKOS, PROV-O, OWL-Time, W3C Org, vCard), **maintained community standards** (DCTERMS, VANN, DASH, gUFO), and **research-grade privacy vocab** (DPV / DPV-PD). Nothing exotic, nothing home-rolled where a standard exists.

---

## 1. The verified prefix census (what is actually in the TTL)

Before any table of *intentions*, here is the ground truth: a count of `@prefix`
declarations across the whole emitted ontology corpus
(`source/03-standards/ontology/**/*.ttl` — modules, shapes, annotations, the 31 form
profiles, and the 34 diagnostic exemplars). This is the honest denominator for the
"multitude" claim.

| Prefix | Files declaring it | Namespace |
|---|---:|---|
| `opda:` | 89 | `https://opda.org.uk/pdtf/` (the minted ontology itself) |
| `dct:` | 87 | `http://purl.org/dc/terms/` |
| `rdf:` | 72 | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` |
| `xsd:` | 61 | `http://www.w3.org/2001/XMLSchema#` |
| `owl:` | 54 | `http://www.w3.org/2002/07/owl#` |
| `sh:` | 40 | `http://www.w3.org/ns/shacl#` |
| `rdfs:` | 36 | `http://www.w3.org/2000/01/rdf-schema#` |
| `skos:` | 25 | `http://www.w3.org/2004/02/skos/core#` |
| `prov:` | 22 | `http://www.w3.org/ns/prov#` |
| `dpv-pd:` | 5 | `https://w3id.org/dpv/pd#` |
| `vcard:` | 3 | `http://www.w3.org/2006/vcard/ns#` |
| `time:` | 2 | `http://www.w3.org/2006/time#` |
| `dpv:` | 2 | `https://w3id.org/dpv#` |
| `vann:` | 1 | `http://purl.org/vocab/vann/` |
| `org:` | 1 | `http://www.w3.org/ns/org#` |
| `gufo:` | 1 | `http://purl.org/nemo/gufo#` |
| `dash:` | 1 | `http://datashapes.org/dash#` |

*(`opda-v:` = `…/pdtf/scheme/` and `opda-x:` = the exemplar/instance namespace are
OPDA-internal sub-namespaces, not external standards, so they are excluded from the
count above.)*

**Reading the census.** Prefix-declaration frequency tracks how *pervasive* a standard
is, not how *important* it is. `dash:` and `gufo:` each declare in a single file but are
load-bearing where they appear (DASH drives form rendering on the profile shapes; gUFO
meta-types the descriptive leaves). Conversely `rdf:`/`xsd:`/`owl:` are everywhere
because they are the substrate. The two privacy prefixes split as expected: `dpv-pd:`
(the personal-data *categories*) is used more than `dpv:` (the upper privacy vocabulary)
because the PII work is overwhelmingly "what category is this field," not "what is the
processing purpose" — the latter is the deferred Phase-2 governance work.

---

## 2. The big table — every standard, with status and evidence

Columns: **Standard · Prefix · Tier** (ODR-0002 Core/Conditional/Defer) · **Status**
(✅ emitted in shipped TTL / 🔵 adopted-but-deferred / ❌ reviewed-and-rejected) · **What
it does HERE** · **Evidence**.

### Core tier — the RDF stack, adopted unconditionally

| Standard | Prefix | Tier | Status | What it's used for HERE | Evidence |
|---|---|---|---|---|---|
| **RDF 1.2** | `rdf` | Core | ✅ | Triples, `rdf:type`, lists; v1.2 pinned for triple-terms (statement-level annotation) on a Jena toolchain that parses them natively | every TTL; pin in ODR-0002, regime in ODR-0025 §R5 |
| **RDFS** | `rdfs` | Core | ✅ | Class/property hierarchy (`subClassOf`/`subPropertyOf`), `rdfs:label`/`comment`/`domain`/`range`. **Domain/range are documentary, not reasoner-enforced** (ODR-0025 §R2) | 27 `rdfs:subClassOf` across modules |
| **OWL 2** | `owl` | Core | ✅ | `owl:Class`, `owl:DatatypeProperty`/`ObjectProperty`, `owl:Ontology` headers, `owl:imports`, `owl:versionIRI`/`versionInfo` | 41 classes · 226 datatype props · 30 object props |
| **OWL 2 RL** | — (regime) | Core | 🟡 | The *entailment regime*: a sound, RL-**incomplete** RDFS-Plus 7-rule subset (NOT an OWL 2 RL reasoner — ODR-0029 R5) materialised at Fuseki load time. **Shallow today** — see §6 | ODR-0025 §R1; ADR-0035; `config/opda-rdfs-plus.rules` |
| **XSD** | `xsd` | Core | ✅ | Literal datatypes (`xsd:string`, `xsd:date`, `xsd:anyURI`, `xsd:boolean`, …) on every property range | 61 files |
| **SHACL 1.2** | `sh` | Core | ✅ | **The validation contract.** Node/property shapes, `sh:targetClass`, `sh:in`/`sh:or`/`sh:xone`, severity tiers, `sh:declare` prefix maps. Validated by **Apache Jena** (ADR-0036) | 96 `sh:NodeShape`; ODR-0013 |
| **SHACL-AF** | `sh` | Core | ✅ | SHACL Advanced Features: SPARQL-based constraints (`sh:sparql`/`sh:select`) and inference rules (`sh:rule`/`sh:construct`) for data-quality + derived triples | 10 `sh:rule`, 5 `sh:sparql`; ODR-0017 |
| **SKOS** | `skos` | Core | ✅ | Every JSON enum → a `skos:ConceptScheme`; controlled vocabularies for roles, statuses, tenure, council-tax bands, perils, capacities… (plain SKOS, no SKOS-XL) | 46 schemes · 304 concepts; ODR-0011 |
| **Dublin Core Terms** | `dct` | Core | ✅ | Admin metadata (`title`/`creator`/`issued`/`modified`/`license`) **and the load-bearing `dct:source` provenance** — every term/shape/concept traces to a data-dictionary leaf, glossary row, ODR section, or regulator URL | **1,108 `dct:source` triples** |
| **VANN** | `vann` | Core | ✅ | `vann:preferredNamespacePrefix`/`Uri` on the `owl:Ontology` header so dereferencers render snippets with the `opda:` prefix | `foundation.ttl` header |

### Conditional tier — adopted where the use-case is present

| Standard | Prefix | Tier | Status | What it's used for HERE | Evidence |
|---|---|---|---|---|---|
| **PROV-O** | `prov` | Conditional | ✅ | Backbone of the claims/evidence/provenance layer (~80% of the eIDAS `verifiedClaims` envelope): `opda:Claim ⊑ prov:Entity`, `opda:Verification ⊑ prov:Activity`, `prov:wasDerivedFrom`, `prov:qualifiedAttribution`/`hadRole`, `prov:Agent` | `opda-claim.ttl`; 31× `wasDerivedFrom`; ODR-0009 |
| **DPV** | `dpv` | Conditional | ✅ | Upper privacy vocabulary — `dpv:hasLegalBasis` referenced by the special-category SHACL gate; the GDPR-grade typing frame | `opda-agent-shapes.ttl`; ODR-0012 |
| **DPV-PD** | `dpv-pd` | Conditional | ✅ | Personal-data *categories* — `dpv-pd:hasPersonalDataCategory` co-annotations: `dpv-pd:Name`, `dpv-pd:OfficialID`, `dpv-pd:Address`, `dpv-pd:EmailAddress`, `dpv-pd:DateOfBirth` | `opda-agent-annotations.ttl`; ODR-0018 |
| **gUFO** | `gufo` | (theory→marker) | ✅ | Lightweight UFO as `rdf:type` **meta-typing markers** on uncontested descriptive leaves (`gufo:Quality` on built-form, heating-fuel, council-tax band, energy rating). Advisory graph only | `opda-descriptive-annotations.ttl`; ADR-0034 |
| **W3C Org** | `org` | (via ODR-0006) | ✅ | `opda:Organisation rdfs:subClassOf org:Organization` — the Kind superclass that **replaced FOAF** | `opda-agent.ttl`; ODR-0006 |
| **vCard** | `vcard` | (via ODR-0015) | ✅ | `opda:Address rdfs:subClassOf vcard:Address` for structural compatibility with vCard consumers | `opda-property.ttl`; ODR-0015 |
| **OWL-Time** | `time` | Conditional | ✅ | `opda:LeaseTerm rdfs:subClassOf time:ProperInterval` for lease-term / proprietorship / claim-validity intervals | `opda-property.ttl`; ODR-0002 §Q7 |
| **DASH** | `dash` | Conditional | ✅ | TopQuadrant UI hints on SHACL shapes — `dash:viewer`/`dash:editor` (89 usages), `dash:uniqueValueForClass` — to drive form rendering | `profiles/*.ttl`, `opda-property.ttl`; ODR-0010 |
| **DCAT 3** | `dcat` | Conditional | 🔵 | Dataset catalogue records (OPDA-published datasets). Gated on a publishing trigger (publish to data.gov.uk / own endpoint / external registration) | ODR-0002 §Q8 — zero `dcat:` in TTL |
| **ODRL** | `odrl` | Conditional | 🔵 | Machine-readable consent / data-licensing **policies**. Vocabulary admitted; **policy-authoring deferred to Phase 2** — a TBox-only ODRL asserts nothing without instances | ODR-0002 §Q10 — **zero `odrl:` in TTL** |
| **SSSOM** | `sssom` | Conditional | 🔵 | Cross-vocabulary mapping *metadata* (justification, confidence, author). Deferred until external mappings (FIBO/INSPIRE/HMLR) are authored | ODR-0002 §Q9 |
| **SEMAPV** | `semapv` | Conditional | 🔵 | Mapping-*process* vocabulary, paired with SSSOM. Deferred alongside it | ODR-0002 §Q9 |

### Defer tier — adopted-but-deferred, activation named

| Standard | Prefix | Tier | Status | Why deferred / where it would plug in | Evidence |
|---|---|---|---|---|---|
| **W3C Verifiable Credentials 2.0** | `cred` | Defer | 🔵 | The `verifiedClaims` envelope is VC-shaped, but no real wallet consumer yet. Activation owned by the deferred ODR-0016 | ODR-0016 (`status: proposed`) |
| **W3C DID Core 1.0** | `did` | Defer | 🔵 | `did:web`/`did:key` resolution — fires with the VC ecosystem when a wallet/DID consumer (OneLogin, eIDAS 2.0) enters scope | ODR-0016 |
| **DPV-GDPR** | `dpv-gdpr` | Defer | 🔵 | GDPR-specific lawful-basis/legal extensions — catalogue-adopted, not emitted (the Phase-2 consent/lawful-basis layer) | ODR-0002 §Q10; ODR-0012 |
| **DPV-Legal** | `dpv-legal` | Defer | 🔵 | Jurisdictional legal extensions — same deferral as `dpv-gdpr` | ODR-0002 §Q10 |

### Defer tier — reviewed and explicitly NOT adopted (the audit-trail discipline)

| Standard | Prefix | Status | Why rejected (recorded reason) | Re-open trigger |
|---|---|---|---|---|
| **schema.org** | `schema` | ❌ | Overlaps SKOS / DCTERMS / DCAT confusingly; no benefit *inside* the ontology core | A concrete open-web/JSON-LD-for-SEO publication use-case — and then only on publication outputs, never the source |
| **DCAT-AP / DCAT-AP EU** | `dcatap` | ❌ | EU-government catalogue-profile constraints that don't match a UK-property scope | OPDA must publish to data.europa.eu or a portal that mandates it |
| **FIBO** | `fibo` | ❌ | Financial Industry Business Ontology — large surface area; PDTF does not depend on it. (Its *modular partitioning style* is borrowed; the *vocabulary* is not imported) | A property-transaction-finance modelling task that would otherwise reinvent FIBO concepts |
| **SOSA/SSN** | — | ❌ | Sensor/observation vocab — no current sensor-data consumer | An EPC/MEES sensor-ingestion pipeline starts |
| **QUDT** | `qudt` | ❌ | Units-of-measurement — no current consumer needing typed quantities | EPC ratings-with-units or similar quantitative ingestion |
| **GeoSPARQL** | `geo` | ❌ (seam named) | Geospatial geometry — deferred behind a named **`opda:hasGeometry`** interface seam with four activation triggers; full encoding not yet shipped | Title-extents, LLC1 search polygons, INSPIRE polygon ingest, or search-radius queries (ODR-0015 §5a) |
| **FOAF** | `foaf` | ❌ (superseded) | **Superseded by composition**: `prov:Agent` + W3C Org + `dct:` + `opda:Person`/`Organisation` cover the surface OPDA needs, *with* UFO category commitments + identity criteria FOAF lacks. FOAF's social-Web semantics are a category mismatch for a regulated trust framework | Not adopted (decided); Kind-layer settled in ODR-0006 |
| **BBO (BPMN-Based Ontology)** | `bbo` | ❌ | Process modelling — no workflow-publishing target (unanimous) | A concrete workflow-publishing use-case |
| **ArchiMate 3.2** | `archimate` | ❌ | Capability/service-architecture modelling — no consumer (unanimous) | A concrete capability / service-catalogue use-case |
| **OBO RO** | `ro` | ❌ | Well-founded mereology — genuine formal split (Guizzardi adopt-conditional vs Gandon defer); use `dct:isPartOf` + `opda:` predicates for now | A SPARQL query gives a wrong answer under `dct:isPartOf` that `ro:part-of` would fix |

> **Why the rejection table is a feature, not filler.** A reader can tell a rigorous
> ontology from a magpie one by what it *refused*. Each ❌ row above is a dated Council
> verdict with a named dissent and a named re-open trigger — so the question "why didn't
> you use FIBO / schema.org / GeoSPARQL?" has a citable answer and nobody re-litigates it
> from scratch. ODR-0002's own rule is **"Defer rows never delete"**: reviewed-and-not-
> adopted is a governance act, and the row stays.

---

## 3. The load-bearing five — how each is actually used (with Turtle)

Five standards do the heavy lifting. Here is the *as-emitted* Turtle for each, copied
from the shipped corpus (blank-node IDs and indentation as serialised).

### 3.1 SHACL 1.2 — the validation contract (96 node shapes)

SHACL is the contract between the ontology and the apps that consume it. A form profile
(here BASPI v5) declares one node shape per class it constrains, each `sh:targetClass`-ed
and traced to the form question via `dct:source`:

```turtle
<https://opda.org.uk/pdtf/shape/Baspi5_PropertyShape>
    rdf:type sh:NodeShape ;
    dct:source <https://www.basp.uk/forms/baspi5#A1.1> ;
    sh:property _:b01568dd0cc19, _:b2e1cb4d29b07, _:b3b6d36307556, … ;
    sh:targetClass opda:Property .
```

Severity is tiered so a profile can *warn* without *blocking* (verified counts across the
corpus): **287 `sh:Violation`** (hard contract breaches), **28 `sh:Info`** (advisory data-
quality), **1 `sh:Warning`**. SHACL-AF carries the non-blocking, SPARQL-shaped rules —
e.g. the special-category PII gate is a `sh:sparql` constraint, not a static cardinality:

```turtle
<https://opda.org.uk/pdtf/shape/SpecialCategoryPIIWithoutLawfulBasisShape>
    sh:select """PREFIX opda: <https://opda.org.uk/pdtf/>
PREFIX dpv: <https://w3id.org/dpv#>
SELECT $this ?path WHERE {
  $this opda:hasSpecialCategoryData true .
  FILTER NOT EXISTS { $this dpv:hasLegalBasis ?basis }
  BIND (opda:hasSpecialCategoryData AS ?path)
}""" .
```

SHACL even carries its own prefix map on the ontology header (`sh:declare` /
`sh:namespace` / `sh:prefix`), so a SHACL processor can resolve `opda:` without an
external prefix file.

### 3.2 SKOS — controlled vocabularies (46 schemes · 304 concepts)

Every JSON enum in PDTF becomes a `skos:ConceptScheme`; every enum value a
`skos:Concept`, traced back to the data-dictionary path it came from:

```turtle
<https://opda.org.uk/pdtf/scheme/role/Buyer>
    rdf:type skos:Concept ;
    skos:prefLabel "Buyer"@en ;
    skos:definition "Party acquiring legal title."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/data-dictionary/participants[].role.Buyer> ;
    skos:inScheme opda-v:RoleScheme ;
    skos:notation "Buyer" .
```

The corpus uses plain SKOS (no SKOS-XL): 355 `skos:prefLabel` + 355 `skos:definition`,
308 `skos:notation`/`inScheme`, 16 `skos:topConceptOf`, and **7 `skos:exactMatch`** (the
first cross-vocabulary mapping points, ahead of any SSSOM activation).

### 3.3 PROV-O — the claims & evidence backbone

PROV-O is not decoration here; it is the spine of the `verifiedClaims` layer. The claim
*is* a `prov:Entity`, the verification *is* a `prov:Activity`, and the verification
method is preserved with the qualified form rather than thrown away:

```turtle
opda:Claim
    rdf:type owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:comment "Verifiable claim entity. UFO Information particular; PROV-O Entity.
      Per S009 Q1 80%-PROV-O mapping…"@en ;
    skos:scopeNote "PROV-O: Entity (W3C PROV-O REC §3.2)…"@en .
```

Usage is real and broad: 31× `prov:wasDerivedFrom`, 23× `prov:wasGeneratedBy`, 15× each
of `prov:wasAttributedTo` / `prov:Activity`, plus `prov:qualifiedAttribution` →
`prov:Attribution` → `prov:hadRole` so an OIDC4IDA `verification_method` survives the
translation into RDF.

### 3.4 DPV + DPV-PD — GDPR-grade privacy typing

PII is typed at the class level (the Kind), reference-not-import (DPV URIs are *cited*,
never `owl:imports`-ed). Two mechanisms work together. First, a **DPV mapping record**
declares the baseline category for each PII-bearing Kind:

```turtle
opda:PersonDPVMapping
    rdf:type opda:DPVMappingRecord ;
    rdfs:label "Person DPV mapping"@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    opda:baselineCategory dpv-pd:Name ;
    opda:targetsKind opda:Person .
```

Second, the actual `dpv-pd:hasPersonalDataCategory` co-annotation lands in the **annotation
graph** (never the class or shapes graph — three-graph separation, ODR-0004 §3a):

```turtle
# in opda-agent-annotations.ttl
opda:Person
    dpv-pd:hasPersonalDataCategory dpv-pd:EmailAddress, dpv-pd:Name .
```

Article-10 / special-category data is flagged with the `opda:hasSpecialCategoryData`
boolean and guarded by the SHACL-AF gate shown in §3.1. **Honest note:** the
`opda:SpecialCategoryScheme` is currently a *class declaration only* — its member concepts
emit when downstream demand activates the scheme (ODR-0011). Lawful-basis / consent /
purpose *instances* are the deferred Phase-2 governance layer (ODR-0012), which is why the
upper `dpv:` prefix appears in only two files.

### 3.5 `dct:source` — provenance traceability (1,108 triples)

The single most pervasive non-substrate predicate. Every minted term, shape and concept
carries a `dct:source` to the artefact that justifies it — a data-dictionary leaf, an ODR
section, a glossary row, or a regulator's URL:

```turtle
opda:councilTaxBand
    rdf:type owl:DatatypeProperty ;
    dct:source <https://opda.org.uk/pdtf/harness/data-dictionary/propertyPack.councilTax.councilTaxBand> ;
    rdfs:domain opda:Property ;
    rdfs:range xsd:string .
```

This is the property that turns the ontology from "a model someone drew" into "a model
every element of which can be traced to its origin" — and it is what makes the BASPI5
round-trip (JSON → ontology → validated RDF → JSON) auditable field-by-field.

---

## 4. The adoption tiering & audit-trail discipline (ODR-0002)

The "multitude" is governed by a single catalogue, [ODR-0002 — Ontology Languages and
Vocabularies Adopted](../../docs/ontology/odr/ODR-0002-ontology-language-adoption.md),
ported from a sibling programme's survey of ~90 ontology files and rescoped for OPDA. The
discipline is a **closed, three-tier set**:

- **Core — adopt unconditionally.** The RDF stack + the vocabularies every OPDA file is
  expected to use (RDF 1.2, RDFS, OWL 2, XSD, SHACL 1.2, SKOS, DCTERMS, VANN). **Core
  never demotes** — every downstream module dereferences it and every header declares its
  prefix, so removing one is a URI-graph break.
- **Conditional — adopt where the use-case is present.** Admitted only in the layers
  where the concern arises (DASH on form shapes; PROV-O in the claims layer; OWL-Time on
  interval-bearing classes; the DPV family on PII Kinds; DCAT/ODRL/SSSOM/SEMAPV on their
  triggers). Default adoption mode is **reference-only**: cite the canonical URI, write
  local SHACL, **no `owl:imports`** — let external consumers fetch the upstream vocabulary
  themselves (the FIBO `fibo-fnd-utl-av` discipline applied symmetrically to imports).
- **Defer — reviewed and not adopted (yet).** Listed *explicitly* so future modellers
  know the question was asked and answered. **Defer rows never delete.**

**Promotion is hard on purpose.** Conditional → Core requires *all four* of: a named
consumer (terms in published Turtle, not just prose), use in ≥3 modules, a SHACL gate
enforcing the conditional scope, **and** a failure-mode test (a diagnostic exemplar where
*removing* the vocabulary makes a named test fail — proving it is load-bearing, not
decorative). Demotion is asymmetric and one-step-at-a-time (no Defer→Core skip).

**Why explicit rejection is a sign of rigour.** Two worked examples:

- **The GeoSPARQL `opda:hasGeometry` seam.** Rather than either bolting on GeoSPARQL
  speculatively or pretending geometry doesn't exist, ODR-0015 names a single interface
  predicate, `opda:hasGeometry`, as the *future* attachment point and lists four concrete
  triggers (title-extents, LLC1 polygons, INSPIRE ingest, radius queries) that would
  activate full GeoSPARQL encoding. **Honest as-built:** the seam is *documented and
  exemplified* (it appears in the `rural-plot-inspire-no-uprn.ttl` exemplar) but is **not
  yet a declared predicate in the shipped ontology TTL** — it is a named hole, not a built
  feature. That is the discipline: the hole has a name and a trigger, so it can't be
  forgotten and can't be filled by accident.
- **FOAF superseded by composition.** FOAF is the obvious reach for "people and
  organisations," and it is explicitly *ruled out* — not on taste, but because the surface
  OPDA needs is better served by `prov:Agent` (provenance role) + W3C Org
  (`org:Organization` superclass) + `dct:` + `opda:Person`/`opda:Organisation`, a
  composition that carries **UFO category commitments and identity criteria FOAF does not
  provide**, and avoids FOAF's social-acquaintance semantics that mismatch a regulated,
  AML-checked trust framework.

The same logic retired **schema.org** (overlaps Core), **FIBO** (surface area without a
finance task — its *modular style* borrowed, its vocabulary not), and **SOSA/SSN, QUDT,
BBO, ArchiMate** (no consumer). Each rejection is dated, voted, and re-openable.

---

## 5. The foundational-ontology layer — typing/methodology, not a serialised vocabulary

This is the distinction most easily over-claimed, so state it precisely.

**UFO** (Guizzardi's Unified Foundational Ontology), **DOLCE** (Masolo et al.), and
**OntoClean** (Guarino & Welty) are used as a **typing and methodology discipline**, *not*
as imported, serialised vocabularies. They supply:

- the **stereotypes** that drive the modelling — Kind / SubKind / RoleMixin / Role /
  Relator / Mode / Quality (so a `Seller` is an anti-rigid *Role* a `Person` Kind plays,
  not a subclass of Person), and
- the **OntoClean rigidity/identity discipline** that forces every `kind: pattern` ODR to
  state an explicit identity criterion over named hard cases (the property/estate/title
  split in ODR-0005 is the flagship application).

How they appear **in the artefacts** is the key point:

1. **As `skos:scopeNote` / `rdfs:comment` citations** — the prose that records *which*
   meta-category a class commits to, with a chapter-and-section citation. Example
   (verbatim from `opda-property.ttl`):
   `skos:scopeNote "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2…). UFO:
   Substance Kind (Guizzardi 2005 Ch. 4 §4.2)…"@en`.
2. **Via gUFO, as `rdf:type` markers** — `gufo:` (a *lightweight, OWL-serialised*
   reflection of UFO) is the one foundational vocabulary that does touch the RDF, as
   advisory meta-type markers on uncontested descriptive leaves (`gufo:Quality`), and even
   then only in the **annotation graph**, never as an `owl:Class` declaration.

So: **DOLCE and OntoClean are cited but never instantiated; UFO is cited as prose and,
only through gUFO, lands as a handful of advisory `rdf:type` triples.** None of the three
is `owl:imports`-ed. The model is reasoned over by OWL-RL on its *own* class hierarchy; the
foundational ontologies govern *how that hierarchy was drawn*, not what the triplestore
computes.

---

## 6. Honest framing — where the standards are shallow or deferred

The KB must carry these into any talk; both are defensible phased-roadmap points, not
gaps, and both are verifiable in the TTL.

- **🔵 ODRL is adopted-but-deferred — zero triples emitted.** The catalogue admits ODRL
  for machine-readable consent/licensing policies, but a grep of the entire corpus returns
  **no `odrl:` triples**. This is correct, not an oversight: ODRL `Policy`/`Permission`
  bite only on *instances*, and the policy-authoring trigger (a consent receipt, a
  VC-tied policy, or an external policy consumer) has not fired. The role/capacity/
  authority *substrate* those policies will attach to **is** built (UFO roles + SKOS
  schemes + SHACL); the policies themselves are Phase-2. See `05-authorisation-roles-and-
  rbac.md`.
- **🟡 OWL-RL reasoning is real but shallow today.** The entailment regime (ODR-0025)
  defines a 7-rule OWL-RL-safe set that *can* propagate `subClassOf`/`subPropertyOf`
  transitivity-and-type, `owl:inverseOf`, `owl:TransitiveProperty`, and
  `owl:SymmetricProperty`. But the model declares **zero** inverse, transitive, symmetric,
  or functional properties (verified: every such grep returns nothing), and the hierarchy
  is flat (27 `rdfs:subClassOf` edges, mostly one level). So in practice **only `subClassOf`
  type-propagation fires** — roughly 30 inferred triples. The regime is *built to be
  extended safely*, not *deeply exercised yet*. (It also deliberately **excludes**
  `owl:sameAs`, Functional/InverseFunctional, `equivalentClass`/`Property`, and
  `domain`/`range` entailment — the constructs that cause identity-merging and triple
  explosion in master data; `owl:sameAs` appears in the corpus **only inside SHACL
  `sh:message` and `rdfs:comment` text that forbids it**, never as an asserted triple.)
- **🟡 DPV special-category & DCAT are scaffolded, not populated.** `opda:Special­Category­Scheme`
  is a class declaration with member-emission deferred; `dcat:` has no triples (publishing
  trigger unfired). Both are named, both are reference-only when they land.

---

## Built vs planned

| Capability | Status | Note |
|---|---|---|
| Core RDF stack (RDF 1.2, RDFS, OWL 2, XSD) emitted | ✅ | substrate of every file |
| SHACL 1.2 + SHACL-AF validation contract | ✅ | 96 node shapes; Jena-validated (ADR-0036) |
| SKOS controlled vocabularies | ✅ | 46 schemes / 304 concepts; plain SKOS |
| DCTERMS admin + `dct:source` provenance | ✅ | 1,108 provenance triples |
| VANN namespace header | ✅ | on the ontology header |
| PROV-O claims/evidence backbone | ✅ | `Claim ⊑ Entity`, qualified attribution |
| DPV + DPV-PD class-level PII typing | ✅ | reference-not-import; annotation graph |
| gUFO advisory meta-typing | ✅ | `gufo:Quality` markers, annotation graph |
| W3C Org / vCard / OWL-Time superclass hooks | ✅ | `org:Organization`, `vcard:Address`, `time:ProperInterval` |
| DASH UI hints on profile shapes | ✅ | drives form rendering (89 usages) |
| OWL-RL safe entailment regime | 🟡 | defined + materialised, but only subclass rule fires today |
| ODRL consent/policy layer | 🔵 | adopted-but-deferred; **0 triples** |
| DCAT 3 catalogue records | 🔵 | gated on a publishing trigger |
| SSSOM / SEMAPV mapping metadata | 🔵 | gated on external mappings |
| W3C VC 2.0 / DID Core compatibility | 🔵 | deferred-named (ODR-0016, `proposed`) |
| DPV-GDPR / DPV-Legal lawful-basis vocab | 🔵 | Phase-2 governance layer |
| GeoSPARQL geometry | 🔵 | seam named (`opda:hasGeometry`), exemplar-only, 4 triggers |
| schema.org · DCAT-AP · FIBO · SOSA/SSN · QUDT · FOAF · BBO · ArchiMate · OBO RO | ❌ | reviewed, rejected with recorded reasons + re-open triggers |

---

## Talking points for the quarterly tech review

*(Audience = mixed senior decision-makers + data/technical leads.)*

- **"We didn't pick standards — we ran a governed catalogue."** Every vocabulary is in one
  of three tiers (Core/Conditional/Defer, ODR-0002), and **what we rejected is recorded as
  carefully as what we adopted** — schema.org, FIBO, GeoSPARQL and FOAF each have a dated
  reason and a named re-open trigger. That is the difference between a standards *strategy*
  and a pile of namespaces.
- **The five that do the work, in one breath:** SHACL is the machine-checkable contract,
  SKOS is the controlled vocabulary for every enum, PROV-O is the chain of evidence behind
  every claim, DPV/DPV-PD is the GDPR-grade privacy typing, and `dct:source` makes all
  **1,108** of those decisions traceable to their origin. Those map one-to-one onto what
  the room cares about: validation (proptech), trust/provenance (lenders + HMLR), consent/
  privacy (everyone), and auditability (regulators).
- **W3C Recommendations first, nothing home-rolled.** The shipped corpus is built on W3C
  Recs (RDF 1.2, OWL 2, SHACL 1.2, SKOS, PROV-O, OWL-Time, Org, vCard) plus maintained
  community standards (DCTERMS, VANN, DASH, gUFO). Where a standard exists, we used it;
  where two overlapped, we recorded which one won and why.
- **Be honest about the roadmap edges** (this builds credibility, it doesn't cost it):
  the **consent/permission policy layer (ODRL) is adopted-but-deferred — zero triples
  today** — but the role/authority substrate it plugs into is already built; and our
  **OWL reasoning is deliberately shallow and safe** rather than deep, because in master
  data the dangerous reasoning (identity-merging) is exactly what you switch off.
- **The forward ask:** the standards surface is *deliberately extensible* — VC/DID
  (ODR-0016) and GeoSPARQL (`opda:hasGeometry`) are pre-named seams waiting on a real
  consumer. If a member organisation brings a wallet, a DID method, or a title-boundary
  dataset, the catalogue already knows where it attaches.

---

## Source files

**Adoption catalogue & decisions (`docs/ontology/odr/`):**
- `ODR-0002-ontology-language-adoption.md` — the Core/Conditional/Defer catalogue, canonical URIs, promotion/demotion discipline, every rejection reason
- `ODR-0009-claims-evidence-provenance.md` — PROV-O backbone for the claims layer
- `ODR-0011-enumeration-vocabularies.md` — the SKOS scheme/concept pattern
- `ODR-0012-data-governance-layer.md` — DPV adoption; deferred lawful-basis/consent
- `ODR-0014-vocabulary-catalogue-amendments.md` — retired; folded into ODR-0002 §Change log
- `ODR-0015-address-and-geography.md` — vCard subclassing; the GeoSPARQL `opda:hasGeometry` seam + triggers
- `ODR-0016-w3c-vc-did-compatibility.md` — deferred-named VC/DID layer (`status: proposed`)
- `ODR-0018-dpv-class-level-coannotation-pattern.md` — the class-level DPV co-annotation pattern
- `ODR-0025-entailment-regime-and-inference-semantics.md` — OWL-RL-safe regime, RDF 1.2 in full, the excluded set
- `ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md` — the 7-rule contract

**Emitted Turtle (`source/03-standards/ontology/`):**
- `foundation.ttl` — `owl:Ontology` header (VANN, `owl:versionIRI`/`versionInfo`, DCTERMS admin, `sh:declare`)
- `opda-classes.ttl` · `opda-property.ttl` · `opda-agent.ttl` · `opda-transaction.ttl` · `opda-claim.ttl` · `opda-descriptive.ttl` · `opda-governance.ttl` — the six modules + flat class graph (OWL 2, RDFS, PROV-O, vCard, Org, OWL-Time)
- `opda-vocabularies.ttl` — all 47 SKOS schemes / 308 concepts
- `opda-*-shapes.ttl`, `opda-shapes.ttl` — SHACL 1.2 + SHACL-AF (severity tiers, `sh:sparql`, `sh:rule`)
- `opda-*-annotations.ttl` — DPV-PD co-annotations + gUFO markers (the annotation graph)
- `profiles/*.ttl` — 31 form profiles (DASH UI hints; `dct:source` to form questions)
- `exemplars/*.ttl` — 34 diagnostic exemplars (incl. the `opda:hasGeometry` seam exemplar)

**Rule contract (`config/`):** `opda-rdfs-plus.rules` — the governed sound, RL-incomplete RDFS-Plus rule set (renamed from `opda-owl-rl-safe.rules`, ODR-0029 R5).

**Knowledgebase seeds:** `_research-synthesis.md`, `_fact-sheet.md`, `_external-research.md`.
