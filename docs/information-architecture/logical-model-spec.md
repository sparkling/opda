# Ontology Website Logical Information Model

This document is the specification artefact for [ADR-0002](../adr/ADR-ADR-0002-ontology-website-information-model.md). It visualises and formalises the unified concept-centric information model that the ADR decided upon, in a form that can be handed to a developer or reviewed by a stakeholder. The ADR is the "why"; this document is the "what, precisely".

---

## 1. Entity-Relationship Diagram

![ontology-website-entity-relationship-model](diagrams/information-model-logical/ontology-website-entity-relationship-model.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
erDiagram
    accTitle: Ontology Website Entity-Relationship Model
    accDescr: Shows the thirteen core entities and their relationships in the ontology website information model

    Concept {
        string name
        string context "SDS, PF, or Common"
        string uri
        string summary "rdfs:comment"
        string definition "skos:definition"
        string usageNotes "skos:scopeNote"
        string editorialNotes "skos:editorialNote"
        boolean abstract "dash:abstract"
        string labelProperty "dash:labelProperty"
    }

    Property {
        string name "sh:name from SHACL"
        string technicalName "sh:path URI"
        string description "sh:description"
        string domainInformative "rdfs:domain"
        string rangeInformative "rdfs:range"
        string constraints "sh:pattern, sh:maxLength, etc."
        string severity "sh:Violation or sh:Warning"
        string validationMessage "sh:message"
        boolean required "sh:minCount >= 1"
        boolean derived "populated by SHACL Rule"
        string editorWidget "dash:editor"
        string viewerWidget "dash:viewer"
    }

    Enumeration {
        string name "skos:prefLabel"
        string description "rdfs:comment"
    }

    EnumerationValue {
        string label "skos:prefLabel"
        string abbreviation "skos:notation or skos:altLabel"
        string definition "skos:definition"
    }

    SubjectArea {
        string name "skos:prefLabel"
        string definition "skos:definition"
    }

    ClassificationFacet {
        string name "scheme prefLabel"
        string facetType "one of seven facet types"
    }

    CrossDomainMapping {
        string matchType "exact or close or broad"
        string note
    }

    StatusBadge {
        string badgeType "Deprecated Uncertain New ToDefine"
    }

    PropertyGroup {
        string name "sh:PropertyGroup label"
        int order "sh:order"
    }

    SuggestionGenerator {
        string name "rdfs:label"
        string category "temporal or cleanup or status"
        string sparqlUpdate "dash:update"
    }

    ActionDescription {
        string name "rdfs:label"
        string actionGroup "Data Quality or Governance"
    }

    Rule {
        string name "rdfs:label"
        string ruleType "TripleRule or SPARQLRule"
        string derivedProperty "property materialized"
    }

    InstanceExample {
        string label "rdfs:label"
        string sourceTable "dbo table"
    }

    Concept ||--o| Concept : "has-parent"
    Concept ||--o{ Concept : "has-children"
    Concept }|--|| SubjectArea : "belongs-to"
    Concept }o--o{ ClassificationFacet : "has-classification"
    Concept ||--o{ Property : "has-properties via SHACL"
    Concept ||--o| Enumeration : "has-enumeration"
    Concept ||--o{ StatusBadge : "has-status"
    Concept ||--o{ CrossDomainMapping : "has-mapping"
    Concept ||--o| Concept : "roleOf"
    Concept ||--o| Concept : "phaseOf"
    Concept ||--o{ Concept : "disjoint-with"
    Concept ||--o{ ActionDescription : "has-action"
    Concept ||--o{ Rule : "has-rule"
    Concept ||--o{ InstanceExample : "has-example"
    Property }|--|{ Concept : "used-by"
    Property }o--o| PropertyGroup : "grouped-by"
    Property ||--o{ SuggestionGenerator : "has-suggestion"
    Enumeration ||--|{ EnumerationValue : "contains"
    SubjectArea ||--o{ SubjectArea : "has-subdivision"
    CrossDomainMapping }o--|| Concept : "source"
    CrossDomainMapping }o--|| Concept : "target"
```

</details>

This diagram captures the logical information model for the ontology website, now comprising 13 entities (expanded from the original 8). Each `Concept` corresponds to an OWL class drawn from one of three bounded contexts -- SDS, PF, or Common -- carrying documentation annotations (`rdfs:comment`, `skos:definition`, `skos:scopeNote`, `skos:editorialNote`) that map directly to the four-tier FIBO-aligned documentation strategy defined in ODR-0011. Properties are bound to concepts through SHACL shapes rather than OWL domain/range (which serve only as informative documentation), while enumerations are modelled as SKOS ConceptSchemes containing individual values. The seven classification facets -- Subject Area, Data Classification, Lifecycle, Governance, Volatility, Regulatory Relevance, and Value Chain Position -- attach to every concept as annotation properties, enabling multi-dimensional filtering and navigation across all three bounded contexts.

The DASH vocabulary layer (ODR-0035) introduces three new entities: `PropertyGroup` for organising properties into named form sections with explicit ordering, `SuggestionGenerator` for data correction proposals that applications can offer to users, and `ActionDescription` for bulk operations exposed as UI actions. `Rule` entities (ODR-0036) represent SHACL Rules that automatically materialise derived property values at data load time. `InstanceExample` entities provide concrete data instances sourced from the PostgreSQL `dbo` schema, illustrating how concepts are populated with real values. Disjointness relationships (ODR-0028b) declare that certain classes cannot share instances, enforced via `owl:AllDisjointClasses` and `sh:xone`. Cross-domain mappings between SDS and PF now total 9 (up from 8).

---

## 2. Page Composition Diagrams

Each diagram below shows the section structure and key fields for one page type. Sections appear as subgraphs; fields appear as nodes within them. Links between nodes indicate navigation targets.

### Page 1: Home (Dashboard)

![home-page-composition](diagrams/information-model-logical/home-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Home Page Composition
    accDescr: Dashboard layout with stats bar, subject area cards, search, and featured concepts

    subgraph StatsBar["Stats Bar"]
        S1["Total Concepts"]
        S2["Total Properties"]
        S3["Total Enumerations"]
        S4["Contexts: SDS, PF, Common"]
        S5["DASH UI Coverage"]
    end

    subgraph SubjectAreas["Subject Area Breakdown"]
        SA1["Geography card<br/>(concept count)"]
        SA2["Organization card<br/>(concept count)"]
        SA3["Calendar and Time card<br/>(concept count)"]
        SA4["Finance card<br/>(concept count)"]
        SA5["Product card<br/>(concept count)"]
        SA6["Trade card<br/>(concept count)"]
        SA7["Transport card<br/>(concept count)"]
    end

    subgraph QuickSearch["Quick Search"]
        QS["Text input"] --> QR["Results across<br/>all page types"]
    end

    subgraph Featured["Recent / Featured"]
        F1["Highlighted concepts<br/>or recent changes"]
    end

    StatsBar --> SubjectAreas
    SubjectAreas --> QuickSearch
    QuickSearch --> Featured

    SA1 -->|"click"| SAPage["Subject Area Overview"]
    QR -->|"click"| AnyPage["Concept / Property /<br/>Enumeration Detail"]
```

</details>

The Home page gives users an at-a-glance summary of the ontology. Each subject area card shows its concept count and links to the Subject Area Overview page; the search box provides cross-cutting discovery.

### Page 2: Concept List

![concept-list-page-composition](diagrams/information-model-logical/concept-list-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Concept List Page Composition
    accDescr: Filterable table of all concepts with search, facet filters, and pagination

    subgraph Search["Search"]
        SB["Text search on Name"]
    end

    subgraph Filters["Filter Bar"]
        F1["Context<br/>(SDS / PF)"]
        F2["Subject Area"]
        F3["Data Classification"]
        F4["Lifecycle"]
        F5["Status"]
    end

    subgraph Table["Concept Table"]
        TH["Name | Context | Subject Area | Data Class. | Lifecycle | Status | Definition"]
        R1["ConceptName (link) | SDS | Product | Master Data | Run-Time | badges | truncated def..."]
        R2["... additional rows ..."]
    end

    subgraph Pagination["Pagination"]
        PG["Page controls"]
    end

    Search --> Filters --> Table --> Pagination

    R1 -->|"Name click"| CD["Concept Detail"]
```

</details>

The Concept List is the primary browsing entry point. All five filter dimensions correspond to classification facets from the ontology, letting users narrow by context, subject area, data classification, lifecycle, or status.

### Page 3: Concept Detail

![concept-detail-page-composition](diagrams/information-model-logical/concept-detail-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
flowchart TD
    accTitle: Concept Detail Page Composition
    accDescr: Full detail page for one concept showing all fourteen sections from header to metadata

    subgraph Header["Header"]
        H1["Name"]
        H2["Context badge (SDS / PF)"]
        H3["Status badges:<br/>Deprecated, Uncertain,<br/>New, To Define"]
    end

    subgraph Identity["Identity"]
        I1["Synonyms (tags)"]
        I2["URI (collapsible)"]
    end

    subgraph Docs["Documentation"]
        D1["Summary"]
        D2["Definition"]
        D3["Usage notes"]
        D4["Editorial notes (muted)"]
    end

    subgraph Classification["Classification"]
        C1["Subject Area (link)"]
        C2["Data Classification"]
        C3["Lifecycle"]
        C4["Governance"]
        C5["Volatility"]
        C6["Regulation (tags)"]
        C7["Value Chain (tags)"]
    end

    subgraph Hierarchy["Hierarchy"]
        HI1["Parent (link)"]
        HI2["Children (links)"]
        HI3["Role of (link)"]
        HI4["Roles (links)"]
        HI5["Phase of (link)"]
    end

    subgraph PropGroups["Property Grouping"]
        PG1["Identity group"]
        PG2["Description group"]
        PG3["Relationships group"]
        PG4["Governance group"]
        PG5["Temporal group (conditional)"]
        PG6["Cost group (conditional)"]
    end

    subgraph Props["Properties (table)"]
        PT["Name | Type (link) | Cardinality | Description"]
    end

    subgraph Enums["Enumerations (conditional)"]
        ET["Value | Abbreviation | Definition"]
    end

    subgraph Mappings["Cross-domain Mappings (conditional)"]
        MT["Matched concept (link) | Match type | Note"]
    end

    subgraph Temporal["Temporal Qualifiers (reifier classes only)"]
        TQ1["From season"]
        TQ2["To season"]
        TQ3["Relata (links)"]
        TQ4["Active status (derived)"]
    end

    subgraph Derived["Derived Properties (conditional)"]
        DP1["Property name (computed badge)"]
        DP2["Computed from: rule description"]
    end

    subgraph Actions["Data Quality and Governance (conditional)"]
        AQ1["Suggestions (fix-it actions)"]
        AQ2["Validate action"]
        AQ3["Publish / Unpublish actions"]
    end

    subgraph Examples["Instance Examples (conditional)"]
        EX1["Real data sample<br/>from source system"]
    end

    subgraph Disjoint["Disjointness (conditional)"]
        DJ1["Cannot overlap with:<br/>class links"]
    end

    subgraph Meta["Metadata"]
        M1["Source system"]
        M2["Temporal validity"]
        M3["Shared identifier (link)"]
    end

    Header --> Identity --> Docs --> Classification
    Classification --> Hierarchy --> PropGroups --> Props --> Enums --> Mappings
    Mappings --> Temporal --> Derived --> Actions --> Disjoint --> Examples --> Meta

    C1 -->|"click"| SAP["Subject Area Overview"]
    HI1 -->|"click"| CD1["Concept Detail (parent)"]
    HI2 -->|"click"| CD2["Concept Detail (child)"]
    PT -->|"Type click"| CD3["Concept Detail (target)"]
    MT -->|"Concept click"| CD4["Concept Detail (other context)"]
    TQ3 -->|"click"| CD5["Concept Detail (relatum)"]
    AQ1 -->|"suggestion"| Fix["Apply correction"]
    DJ1 -->|"click"| CD6["Concept Detail (disjoint)"]
```

</details>

The Concept Detail page is the richest page in the model. It unifies data from OWL (hierarchy, labels, classification), SKOS (definitions, synonyms, enumerations), SHACL (properties table), and cross-domain mappings into a single coherent view. Property Groups organize properties into form sections (Identity, Description, Relationships, Governance, Temporal, Cost), providing a structured layout that mirrors the DASH property group definitions. Temporal Qualifiers appear only for RDF 1.2 Reifier classes (17 classes in SDS), showing season ranges and relata links. Derived Properties show computed values with their SHACL Rule source. Data Quality/Governance Actions show available suggestions and workflow operations from DASH. Instance Examples show real data from the PostgreSQL dbo schema, illustrating how concepts are populated with actual values. Disjointness shows non-overlapping class groups from ODR-0028b. Sections appear conditionally: Enumerations only when a matching scheme exists, Cross-domain Mappings only when mappings are defined, Temporal Qualifiers only for reifier classes, and so on.

### Page 4: Property List

![property-list-page-composition](diagrams/information-model-logical/property-list-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Property List Page Composition
    accDescr: Filterable table of all properties with search and pagination

    subgraph Search["Search"]
        SB["Text search on Name"]
    end

    subgraph Filters["Filter Bar"]
        F1["Context<br/>(SDS / PF)"]
        F2["Type<br/>(Datatype / Class)"]
        F3["Property Group"]
    end

    subgraph Table["Property Table"]
        TH["Name | Used by (count) | Type | Context | Group"]
        R1["propertyName (link) | 5 | Text | SDS"]
        R2["... additional rows ..."]
    end

    subgraph Pagination["Pagination"]
        PG["Page controls"]
    end

    Search --> Filters --> Table --> Pagination

    R1 -->|"Name click"| PD["Property Detail"]
```

</details>

The Property List provides a flat inventory of all properties across both contexts. The "Used by" count gives users a quick sense of how widely shared each property is.

### Page 5: Property Detail

![property-detail-page-composition](diagrams/information-model-logical/property-detail-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Property Detail Page Composition
    accDescr: Full detail for one property showing documentation, usage table, and informative domain/range

    subgraph Header["Header"]
        H1["Name"]
        H2["Technical name (IRI local name)"]
    end

    subgraph Docs["Documentation"]
        D1["Description"]
    end

    subgraph Usage["Usage (table)"]
        UT["Concept (link) | Type | Cardinality"]
        UR1["Department | Text | 1..1"]
        UR2["... additional rows ..."]
    end

    subgraph Constraints["Constraints"]
        CN1["Required: Yes/No"]
        CN2["Pattern: regex"]
        CN3["Max length"]
        CN4["Range: min..max"]
        CN5["Severity: Violation/Warning"]
        CN6["Validation message"]
    end

    subgraph UIHints["UI Annotations (from DASH)"]
        UI1["Editor widget"]
        UI2["Viewer widget"]
        UI3["Property group"]
        UI4["Unique: dash:uniqueValueForClass"]
        UI5["Single line: dash:singleLine"]
    end

    subgraph DomainRange["Domain / Range (informative)"]
        DR1["Domain: typically used with (concept links)"]
        DR2["Range: expected value type"]
    end

    Header --> Docs --> Usage --> Constraints --> UIHints --> DomainRange

    UT -->|"Concept click"| CD["Concept Detail"]
```

</details>

The Property Detail page shows every concept that uses a given property, with per-concept cardinality and type. The Domain/Range section is explicitly labelled "informative" to reflect the ontology's design decision that these are documentary, not constraining.

### Page 6: Enumeration Detail

![enumeration-detail-page-composition](diagrams/information-model-logical/enumeration-detail-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Enumeration Detail Page Composition
    accDescr: Value set page showing scheme description, member values, and referencing concepts

    subgraph Header["Header"]
        H1["Name"]
    end

    subgraph Description["Description"]
        D1["Scheme description"]
    end

    subgraph Values["Values (table)"]
        VT["Label | Abbreviation | Definition"]
        VR1["Master Data | MD | Core business entities..."]
        VR2["Reference Data | RD | Standardized lookups..."]
        VR3["... additional values ..."]
    end

    subgraph UsedBy["Used By"]
        UB["Concept links whose shapes<br/>reference this enumeration"]
    end

    Header --> Description --> Values --> UsedBy

    UB -->|"click"| CD["Concept Detail"]
```

</details>

The Enumeration Detail page presents a single value set with all its members. The "Used By" section at the bottom closes the navigation loop back to the concepts that constrain their properties against this enumeration.

### Page 7: Subject Area Overview

![subject-area-overview-page-composition](diagrams/information-model-logical/subject-area-overview-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Subject Area Overview Page Composition
    accDescr: All concepts in one subject area with subdivision cards and classification stats

    subgraph Header["Header"]
        H1["Subject Area name"]
    end

    subgraph Subdivisions["Subdivisions (cards, if any)"]
        SUB1["Reference Data"]
        SUB2["Organization Structure"]
        SUB3["... narrower areas ..."]
    end

    subgraph Concepts["Concepts in this Subject Area"]
        CL["Concept cards / list<br/>(both SDS and PF)"]
        CR1["SDS: Country"]
        CR2["PF: GeographicCountry"]
        CR3["... additional concepts ..."]
    end

    subgraph Stats["Stats"]
        ST1["Count by Data Classification"]
        ST2["Count by Lifecycle"]
        ST3["Count by Governance Tier"]
    end

    Header --> Subdivisions --> Concepts --> Stats

    SUB1 -->|"click"| SUBPage["Subject Area Overview<br/>(narrower)"]
    CR1 -->|"click"| CD1["Concept Detail"]
    CR2 -->|"click"| CD2["Concept Detail"]
```

</details>

The Subject Area Overview aggregates all concepts classified under a given subject area across both bounded contexts. Subdivision cards enable drill-down into narrower areas (e.g., Geography to Reference Data). The stats section provides a structural profile of the subject area.

### Page 8: Mappings

![mappings-page-composition](diagrams/information-model-logical/mappings-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Mappings Page Composition
    accDescr: Table of all nine cross-domain semantic links between SDS and PF concepts

    subgraph Header["Header"]
        H1["Cross-Domain Mappings"]
    end

    subgraph Table["Mappings Table"]
        TH["SDS Concept | Match Type | PF Concept | Note"]
        R1["sds:Country (link) | Exact | pf:GeographicCountry (link) | ..."]
        R2["sds:Department (link) | Broad | pf:Department (link) | ..."]
        R3["... 9 mappings total ..."]
    end

    Header --> Table

    R1 -->|"SDS click"| CD1["Concept Detail (SDS)"]
    R1 -->|"PF click"| CD2["Concept Detail (PF)"]
```

</details>

The Mappings page is a compact table showing all 9 cross-domain semantic links between SDS and PF concepts. Match type badges (Exact, Close, Broad) communicate the strength of each correspondence. Both concept columns are clickable, enabling bidirectional navigation between bounded contexts.

### Page 9: Module Overview

![module-overview-page-composition](diagrams/information-model-logical/module-overview-page-composition.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
flowchart TD
    accTitle: Module Overview Page Composition
    accDescr: Per-module landing page showing classes, files, and DASH coverage for one ontology module

    subgraph Header["Header"]
        H1["Module name"]
        H2["Context badge (SDS / PF)"]
        H3["File count"]
    end

    subgraph Files["Source Files"]
        F1["Core: module.ttl"]
        F2["UI companion: module-ui.ttl (if exists)"]
        F3["Rules: module-rules.ttl (if exists)"]
    end

    subgraph Classes["Classes in Module"]
        CL["Class cards with Kind/Role/Phase badge"]
        CR1["MainPlanningMarketAssignment (Reifier)"]
        CR2["PlanningMarket (Kind)"]
        CR3["... additional classes ..."]
    end

    subgraph DASHCoverage["DASH Coverage"]
        DC1["Tier 1: constraint count"]
        DC2["Tier 2: editor/viewer count"]
        DC3["Tier 3: suggestion count"]
        DC4["Tier 4: action count"]
    end

    subgraph ModuleStats["Module Statistics"]
        MS1["Total classes"]
        MS2["Total properties"]
        MS3["Disjointness groups"]
    end

    Header --> Files --> Classes --> DASHCoverage --> ModuleStats

    CR1 -->|"click"| CD1["Concept Detail"]
    CR2 -->|"click"| CD2["Concept Detail"]
```

</details>

The Module Overview page provides a per-module landing page that mirrors the source file organization. Each module shows its constituent files (the 3-file pattern: core `.ttl`, optional `-ui.ttl`, optional `-rules.ttl`), all classes with their ontological nature badges (Kind, Role, Phase, SubKind, Reifier), DASH coverage statistics, and basic module metrics. This page type was introduced to reflect the modular file organization adopted in ODR-0027 and the 3-file-per-module pattern from ODR-0035/ODR-0036.

---

## 3. Navigation Graph

![ontology-website-navigation-graph](diagrams/information-model-logical/ontology-website-navigation-graph.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E3F2FD", "primaryTextColor": "#0D47A1", "primaryBorderColor": "#1565C0", "lineColor": "#37474F"}}}%%
graph TD
    accTitle: Ontology Website Navigation Graph
    accDescr: All navigation paths between the nine page types plus global search

    Home["Home"]:::external
    CL["Concept List"]:::infra
    CD["Concept Detail"]:::infra
    PL["Property List"]:::infra
    PD["Property Detail"]:::infra
    ED["Enumeration Detail"]:::infra
    SA["Subject Area Overview"]:::external
    MAP["Mappings"]:::external
    SR["Search"]:::external
    MO["Module Overview"]:::external

    Home -->|"browse concepts"| CL
    Home -->|"browse properties"| PL
    Home -->|"browse subject areas"| SA
    Home -->|"browse modules"| MO
    Home -->|"cross-domain mappings"| MAP
    Home -->|"global search"| SR

    CL -->|"click row"| CD

    CD -->|"parent link"| CD
    CD -->|"child link"| CD
    CD -->|"roleOf link"| CD
    CD -->|"phaseOf link"| CD
    CD -->|"click property"| PD
    CD -->|"click enumeration"| ED
    CD -->|"click subject area badge"| SA
    CD -->|"click classification tag"| CL
    CD -->|"cross-domain mapping"| CD
    CD -->|"module badge"| MO
    CD -->|"disjoint class link"| CD
    CD -->|"suggestion action"| CD

    PD -->|"click used-by concept"| CD

    SA -->|"click concept card"| CD

    MO -->|"click class card"| CD

    MAP -->|"click source concept"| CD
    MAP -->|"click target concept"| CD

    SR -->|"result: concept"| CD
    SR -->|"result: property"| PD
    SR -->|"result: enumeration"| ED
    SR -->|"result: subject area"| SA
    SR -->|"result: mapping"| MAP
    SR -->|"result: module"| MO

    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
```

</details>

**Legend:** Blue (infra) = pages showing context-specific data (SDS/PF). Grey (external) = pages spanning both contexts or shared infrastructure.

The navigation graph shows every link path a user can follow between the nine page types plus global search. Concept Detail is the hub of the site: it links outward to Property Detail, Enumeration Detail, Subject Area Overview, Module Overview, and filtered Concept Lists, while also supporting self-referential navigation through parent/child, roleOf, phaseOf, cross-domain mapping, disjointness, and suggestion action links. Module Overview provides a per-module landing page reachable from both the Home page and the module badge on Concept Detail, with class cards linking back into Concept Detail. Search acts as a universal entry point that can land the user on any page type including Module Overview, and the Mappings page provides a dedicated view of the cross-context correspondences between SDS and PF concepts.

---

## 4. Data Flow Diagram

![source-to-page-data-flow](diagrams/information-model-logical/source-to-page-data-flow.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E3F2FD", "primaryTextColor": "#0D47A1", "primaryBorderColor": "#1565C0", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Source-to-Page Data Flow
    accDescr: How modular source files flow through six parsers into nine page entity types

    subgraph sources ["Source Files (per module)"]
        direction TB
        SDS_MOD["SDS modules (9)<br/>sds-country.ttl, sds-market.ttl, ..."]:::infra
        PF_MOD["PF modules (12)<br/>pf-product.ttl, pf-appearance.ttl, ..."]:::service
        COMMON_REF["common/reference-data.ttl"]:::external
        SDS_SKOS["sds-skos.ttl"]:::infra
        PF_SKOS["pf-skos.ttl"]:::service
        SDS_CSV["sds-properties.csv"]:::infra
        PF_CSV["pf-properties.csv"]:::service
        SHARED_CLASS["common/classification-skos.ttl"]:::external
        SHARED_MAP["common/cross-domain-mappings.ttl"]:::external
        SHARED_SHAPES["common/common-shapes.ttl"]:::external
    end

    subgraph uisources ["UI and Rules Files"]
        direction TB
        SDS_UI["SDS -ui.ttl files (10)<br/>sds-country-ui.ttl, ..."]:::infra
        SDS_RULES["SDS -rules.ttl files (1)<br/>sds-market-temporal-rules.ttl"]:::infra
    end

    subgraph examples ["Instance Examples"]
        direction TB
        SDS_EX["SDS example files (5)<br/>country-instances.ttl, ..."]:::infra
    end

    subgraph parsers ["Parsers / Extractors"]
        direction TB
        OWL_P["OWL Parser"]:::process
        SHACL_P["SHACL Parser<br/>(inline ShapeClass)"]:::process
        SKOS_P["SKOS Parser"]:::process
        CSV_P["CSV Parser"]:::process
        DASH_P["DASH Parser"]:::process
        RULES_P["Rules Parser"]:::process
    end

    subgraph pages ["Page Entities"]
        direction TB
        P_CD["Concept Detail"]:::data
        P_CL["Concept List"]:::data
        P_PD["Property Detail"]:::data
        P_PL["Property List"]:::data
        P_ED["Enumeration Detail"]:::data
        P_SA["Subject Area Overview"]:::data
        P_MAP["Mappings"]:::data
        P_MO["Module Overview"]:::data
        P_HOME["Home"]:::data
    end

    SDS_MOD --> OWL_P
    PF_MOD --> OWL_P
    COMMON_REF --> OWL_P
    SDS_MOD --> SHACL_P
    PF_MOD --> SHACL_P
    COMMON_REF --> SHACL_P
    SDS_SKOS --> SKOS_P
    PF_SKOS --> SKOS_P
    SDS_CSV --> CSV_P
    PF_CSV --> CSV_P
    SHARED_CLASS --> SKOS_P
    SHARED_MAP --> OWL_P
    SHARED_SHAPES --> SHACL_P
    SDS_UI --> DASH_P
    SDS_RULES --> RULES_P
    SDS_EX --> OWL_P

    OWL_P -->|"classes, hierarchy,<br/>labels, definitions,<br/>facet annotations"| P_CD
    OWL_P -->|"class list with<br/>context and subject area"| P_CL
    OWL_P -->|"mapping triples"| P_MAP
    OWL_P -->|"module file metadata"| P_MO
    OWL_P -->|"instance examples"| P_CD

    SHACL_P -->|"properties per concept:<br/>name, datatype, cardinality,<br/>severity, message, constraints"| P_CD
    SHACL_P -->|"property identity<br/>and descriptions"| P_PD
    SHACL_P -->|"property inventory<br/>with usage counts"| P_PL

    SKOS_P -->|"enumeration schemes<br/>and values"| P_ED
    SKOS_P -->|"facet filter values"| P_CL
    SKOS_P -->|"subject area hierarchy"| P_SA

    CSV_P -->|"fallback display<br/>names and notes"| P_PD
    CSV_P -->|"domain and<br/>range labels"| P_PL

    DASH_P -->|"editor/viewer widgets,<br/>PropertyGroups,<br/>abstract/labelProperty"| P_CD
    DASH_P -->|"suggestions and<br/>action descriptions"| P_CD
    DASH_P -->|"DASH coverage stats"| P_MO

    RULES_P -->|"derived property<br/>definitions"| P_CD
    RULES_P -->|"rule inventory"| P_MO

    OWL_P -->|"aggregate stats"| P_HOME
    SKOS_P -->|"subject area counts"| P_HOME
    DASH_P -->|"coverage summary"| P_HOME

    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
```

</details>

**Legend:** Blue = SDS sources. Green = PF sources. Grey = shared/common sources. Light blue/teal = UI and Rules sources. Light blue = parsers. Amber = page entities.

This diagram traces how each source file feeds through a formalism-specific parser into the page entities that the website renders. Source files are now modular (9 SDS modules, 12 PF modules, plus common files including `reference-data.ttl` and `common-shapes.ttl`) rather than the original monolithic `*-ontology.ttl` and `*-shapes.ttl` files. The OWL parser extracts class identity, hierarchy, documentation annotations, and the seven classification facet values from all module files, while also reading the cross-domain mapping triples from the shared mappings file and parsing instance examples into their concept types. The SHACL parser now processes inline ShapeClass validation directly from the module files (the standalone `sds-shapes.ttl` and `pf-shapes.ttl` were deleted in Session 39), converting property constraint blocks -- including severity, validation messages, and advanced constraints like `sh:pattern` and `sh:maxLength` -- into the per-concept property tables shown on Concept Detail and the global Property List. The DASH parser is new: it extracts UI/UX metadata from `-ui.ttl` companion files, including PropertyGroups for organising properties into named form sections, editor/viewer widget assignments, suggestion generators for data correction proposals, and action descriptions for bulk operations. The Rules parser is also new: it extracts SHACL Rules from `-rules.ttl` files, identifying derived property definitions that are materialised at data load time. The SKOS parser handles both domain enumerations and the shared classification vocabularies that power faceted filtering and the Subject Area Overview page. The CSV parser serves as a fallback source for human-friendly property display names and domain/range labels where the SHACL shapes lack `sh:name` or `sh:description`. Cross-domain mappings total 9 (up from 8). Common module files (`reference-data.ttl`, `common-shapes.ttl`) are parsed alongside the bounded context modules by the OWL and SHACL parsers respectively.

---

## 5. Classification Facet Diagram

<!-- accTitle: Seven-Facet Classification Framework -->
<!-- accDescr: All seven classification facets from ODR-0010 with their value sets -->

![diagram-12](diagrams/information-model-logical/diagram-12.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
mindmap
    root("Classification Framework<br/>(ODR-0010)")
        Subject Area
            Geography
                Reference Data
            Organization
                Organization Structure
            Calendar and Time
            Finance
                Tax
            Product
                Commercial Product
            Trade
                Customs
                Trade Costs
                Trade Documents and Agreements
                Trade Exceptions
            Transport
                Retail Transport Execution
        Data Classification
            Master Data (MD)
            Reference Data (RD)
            Transactional Data (TD)
            Analytical Data (AD)
        Lifecycle Stage
            Design-Time (DT)
            Run-Time (RT)
            Historical (HI)
        Governance Tier
            Enterprise (ENT)
            Domain (DOM)
            Local (LOC)
        Volatility
            Static (STA)
            Slowly Changing (SCD)
            Volatile (VOL)
        Regulatory Relevance
            GDPR
            EU Digital Product Passport
            Trade and Customs
            Tax
            Sustainability
            None
        Value Chain Position
            Design
            Source
            Buy
            Ship
            Sell
```

</details>

The seven classification facets defined in ODR-0010 form the backbone of the website's filtering and navigation capabilities. Each facet is a SKOS ConceptScheme in `classification-skos.ttl`; every OWL class in both bounded contexts carries an annotation property pointing to one or more values from these schemes.

### Facet-to-UI Mapping

| Facet | Annotation Property | UI Element | Cardinality | Filterable | Values |
|-------|-------------------|-----------|-------------|-----------|--------|
| Subject Area | `hm:subjectArea` | Link badge on Concept Detail; filter on Concept List; dedicated Subject Area Overview page | 1 per concept | Yes | 7 top + 9 subdivisions |
| Data Classification | `hm:dataClassification` | Badge on Concept Detail; filter on Concept List | 1 per concept | Yes | 4 (MD, RD, TD, AD) |
| Lifecycle Stage | `hm:lifecycleStage` | Badge on Concept Detail; filter on Concept List | 1 per concept | Yes | 3 (DT, RT, HI) |
| Governance Tier | `hm:governanceTier` | Badge on Concept Detail | 1 per concept | No | 3 (ENT, DOM, LOC) |
| Volatility | `hm:volatility` | Badge on Concept Detail | 1 per concept | No | 3 (STA, SCD, VOL) |
| Regulatory Relevance | `hm:regulatoryRelevance` | Tags on Concept Detail | 0..* per concept | No | 6 (GDPR, DPP, Trade and Customs, Tax, Sustainability, None) |
| Value Chain Position | `hm:valueChainPosition` | Tags on Concept Detail (optional) | 0..* per concept | No | 5 (Design, Source, Buy, Ship, Sell) |

---

## 6. Glossary of Terms

| Term | Definition | Source | UI Representation | Cardinality |
|------|-----------|--------|-------------------|-------------|
| **Concept** | A business entity or thing in the ontology. Represents a named class from either bounded context. | `owl:Class` from `*-ontology.ttl` | Concept Detail page; row in Concept List | ~218 total (92 SDS + 104 PF + 2 Common) |
| **Property** | An attribute or relationship of a concept. Describes what data a concept carries and how it relates to other concepts or literal values. | `sh:path` from SHACL `*-shapes.ttl`; fallback to `*-properties.csv` | Property Detail page; row in Properties table on Concept Detail | ~300 total (~150 SDS + ~140 PF + ~10 Common annotation) |
| **Enumeration** | A fixed set of allowed values for a property. Represents a controlled vocabulary or code list. | `skos:ConceptScheme` from `*-skos.ttl` | Enumeration Detail page; inline table on Concept Detail | Varies per context |
| **Subject Area** | A topical classification grouping concepts by the part of the business they describe. | `hm:subjectArea` annotation → `skos:Concept` in `SubjectAreaScheme` (`classification-skos.ttl`) | Link badge on Concept Detail; filter on Concept List; dedicated Subject Area Overview page | 1 per concept; 7 top-level + 8 subdivisions |
| **Classification Facet** | One of seven metadata dimensions applied to every concept under the ODR-0010 framework. | Annotation properties (`hm:subjectArea`, `hm:dataClassification`, etc.) in `classification-skos.ttl` | Filter dimensions on Concept List; badge/tag groups on Concept Detail | 7 facet types |
| **Bounded Context** | An independent domain model with its own namespace, classes, properties, and enumerations. SDS, PF, and Common are the three bounded contexts; Common holds shared classification vocabularies, annotation properties, and cross-domain infrastructure. | Namespace prefix (`sds:`, `pf:`, or `hm:`) | Context badge on Concept/Property pages; filter on list pages | 3 (SDS, PF, Common) |
| **Cross-Domain Mapping** | A semantic link between concepts in different bounded contexts, expressing that they represent the same or similar real-world things. | `skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch` in `cross-domain-mappings.ttl` | Section on Concept Detail; dedicated Mappings page | 9 total |
| **Status Badge** | A visual indicator of a concept's editorial status, normalised from context-specific annotation properties. | `sds:deprecated`, `sds:uncertain`, `sds:newConcept`, `pf:diagramStatus`, `pf:uncertain`, `pf:toDefine` → normalised | Coloured badges in Concept Detail header; filter on Concept List | 0..* per concept; 4 types (Deprecated, Uncertain, New, To Define) |
| **Data Classification** | DAMA DMBOK data management type category. Indicates whether a concept represents master data, reference data, transactional data, or analytical data. | `hm:dataClassification` → value from `DataClassificationScheme` | Badge on Concept Detail; filter on Concept List | 1 per concept; 4 values (MD, RD, TD, AD) |
| **Lifecycle Stage** | When in the product/data lifecycle a concept is primarily active. | `hm:lifecycleStage` → value from `LifecycleStageScheme` | Badge on Concept Detail; filter on Concept List | 1 per concept; 3 values (Design-Time, Run-Time, Historical) |
| **Governance Tier** | Level of cross-domain coordination required to change a concept's schema. | `hm:governanceTier` → value from `GovernanceTierScheme` | Badge on Concept Detail | 1 per concept; 3 values (Enterprise, Domain, Local) |
| **Volatility** | How frequently instance data for this concept changes. Drives CDC strategy and pipeline design. | `hm:volatility` → value from `VolatilityScheme` | Badge on Concept Detail | 1 per concept; 3 values (Static, Slowly Changing, Volatile) |
| **Regulatory Relevance** | Which regulatory regimes apply to this concept. Multi-valued. | `hm:regulatoryRelevance` → values from `RegulatoryRelevanceScheme` | Tags on Concept Detail | 0..* per concept; 6 possible values |
| **Value Chain Position** | Position in the fashion retail value chain. Multi-valued, optional. | `hm:valueChainPosition` → values from `ValueChainScheme` | Tags on Concept Detail | 0..* per concept; 5 possible values (Design, Source, Buy, Ship, Sell) |
| **Property Group** | A named grouping of related properties within a concept, used to organize form sections and UI layout. | `sh:PropertyGroup` from SHACL; defined in `-ui.ttl` companion files | Section headers on Concept Detail; form tab groups | 6 standard types (Identity, Description, Relationships, Governance, Temporal, Cost) |
| **Suggestion Generator** | A DASH-defined data correction proposal that an application can offer to a user. Suggestions propose asserted data changes (e.g., complete a missing temporal pair, clean whitespace from a code field). | `dash:SPARQLUpdateSuggestionGenerator` from `-ui.ttl` files | "Fix this" actions on Concept Detail property rows | 11 generators across 3 categories (temporal completion, single-line cleanup, publish status correction) |
| **Action Description** | A DASH-defined operation that an application can expose to users. Actions describe bulk operations like validation, publishing, and unpublishing of data. | `dash:ResourceAction` with `dash:applicableToClass` in `-ui.ttl` files | Action buttons/menus on Concept Detail or Concept List | 15 actions across 3 groups (Data Quality, Governance, Navigation) |
| **Rule** | A SHACL Rule that automatically materializes derived property values. Rules fire at data load time, not interactively. Distinguished from suggestions (which are user-approved) by ODR-0036. | `sh:TripleRule` or `sh:SPARQLRule` from `-rules.ttl` files | "Computed" badge on derived properties in Properties table | 2 rules in SDS (isActive, hasLatestFiscalCountry); more as needed |
| **Instance Example** | A concrete data instance from a real source system, illustrating how concepts are populated with actual values. | Named individuals in `examples/sds/*.ttl`, sourced from PostgreSQL `dbo` schema | Example data panel on Concept Detail (conditional) | ~489 triples across 5 SDS example files |
| **Temporal Reification** | A time-qualified relationship modelled as a named class (RDF 1.2 Reifier) rather than a direct property. Captures assignments, memberships, and periods that vary over season ranges. | `rdf:Reifier`-typed classes in `sds-market-temporal.ttl`, `sds-currency.ttl`, `sds-customs.ttl` | Dedicated "Temporal Qualifiers" section on reifier Concept Detail pages | 17 reifier classes across 4 SDS modules |
| **Disjointness** | A declaration that two or more classes cannot share instances. Enforced via `owl:AllDisjointClasses` (OWL) and `sh:xone` (SHACL). | `owl:AllDisjointClasses` in module files; `sh:xone` in `common-shapes.ttl` | "Cannot overlap with" list on Concept Detail | 4 disjointness groups in SDS |

---

## 7. Bounded Context Handling

### Independence

SDS (Support Data System), PF (Product Framework), and Common are the three contexts in the ontology. SDS and PF are autonomous bounded contexts as defined by ODR-0015, each with its own namespace. Common (`https://hm.com/ns/common/`) is a shared tier containing enterprise-level classes (Channel, Currency) promoted from domain contexts via ODR-0024/ODR-0028. Each bounded context has its own namespace (`https://hm.com/ns/sds/` and `https://hm.com/ns/pf/`), its own set of OWL classes, object/datatype properties, SKOS enumeration schemes, and SHACL validation shapes. A concept in SDS (e.g. `sds:Department`) and a concept in PF (e.g. `pf:Department`) are **distinct entities** even when they share a human-readable name. They may have different properties, different definitions, different editorial statuses, and different classification values.

### Shared Infrastructure

Despite their autonomy, both contexts share common infrastructure from `src/ontology/common/`:

- **Classification facets** (`classification-skos.ttl`): The seven ConceptSchemes (Subject Area, Data Classification, Lifecycle, Governance, Volatility, Regulatory Relevance, Value Chain Position) are shared. Both SDS and PF classes point to the same facet values, which enables cross-context filtering.
- **Subject area vocabulary**: The 7 top-level subject areas and 9 subdivisions are shared. A concept in SDS and a concept in PF can both belong to "Product" or "Geography".
- **Common reference data** (`reference-data.ttl`): Enterprise-governed classes promoted from domain contexts. Channel (3 instances: store, wholesale, online) and Currency (ISO 4217, promoted from sds:Currency per ODR-0028). These are full OWL classes with ShapeClass validation, 7-facet classification, and SKOS enumeration schemes -- not just shared vocabulary.
- **Cross-domain mappings** (`cross-domain-mappings.ttl`): 9 explicit SKOS mapping relationships connect concepts across contexts, expressing exact, close, or broad semantic equivalence.

### UI Implications

![bounded-context-architecture](diagrams/information-model-logical/bounded-context-architecture.svg)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E3F2FD", "primaryTextColor": "#0D47A1", "primaryBorderColor": "#1565C0", "lineColor": "#37474F"}}}%%
flowchart TB
    accTitle: Bounded Context Architecture
    accDescr: SDS, PF, and Common as three contexts connected by shared classification infrastructure and cross-domain mappings

    subgraph SDS ["SDS Bounded Context"]
        direction TB
        SDS_C["92 Classes<br/>(9 modules)"]:::infra
        SDS_P["~150 Properties"]:::infra
        SDS_E["SDS Enumerations<br/>(11 schemes)"]:::infra
        SDS_UI["10 UI companions<br/>(DASH Tiers 1-4)"]:::infra
        SDS_R["1 Rules file"]:::infra
    end

    subgraph Common ["Common (Enterprise Tier)"]
        direction TB
        COM_C["2 Classes<br/>(Channel, Currency)"]:::external
        COM_E["Common Enumerations"]:::external
        COM_SH["Shared Shapes<br/>(ClassificationShape,<br/>OWL linter)"]:::external
    end

    subgraph Shared ["Shared Classification"]
        direction TB
        CF["7 Classification Facets"]:::external
        SA["16 Subject Areas<br/>(7 top + 9 subdivisions)"]:::external
        XM["9 Cross-Domain Mappings"]:::external
    end

    subgraph PF ["PF Bounded Context"]
        direction TB
        PF_C["104 Classes<br/>(12 modules)"]:::service
        PF_P["~140 Properties"]:::service
        PF_E["PF Enumerations<br/>(10 schemes)"]:::service
    end

    SDS_C ---|"hm:subjectArea<br/>hm:dataClassification<br/>..."| CF
    PF_C ---|"hm:subjectArea<br/>hm:dataClassification<br/>..."| CF
    COM_C ---|"hm:subjectArea<br/>..."| CF
    CF --- SA
    XM ---|"skos:exactMatch<br/>skos:closeMatch<br/>skos:broadMatch"| SDS_C
    XM ---|"skos:exactMatch<br/>skos:closeMatch<br/>skos:broadMatch"| PF_C

    classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
```

</details>

**Legend:** Blue = SDS bounded context. Green = PF bounded context. Grey = Common (enterprise) tier and shared infrastructure.

The website reflects this architecture in several ways:

- **Context filter on every list page.** Concept List, Property List, and any search results include a Context filter with options: All, SDS, PF, Common. The default is All.
- **Context badge in headers.** Every Concept Detail and Property Detail page shows the bounded context prominently (e.g. a blue "SDS", green "PF", or amber "Common" badge) so users always know which context they are viewing.
- **Subject Area Overview spans both contexts.** A Subject Area Overview page (e.g. `/subject/Product`) shows all concepts classified under that subject area from **both** SDS and PF, grouped by context. This is one of the key cross-context discovery mechanisms.
- **Cross-domain mappings as bridges.** When a mapping exists (e.g. `sds:RetailSalesChannel exactMatch pf:Channel`), both concept pages display a "Cross-domain Mappings" section with a link to the counterpart in the other context. The Mappings page provides a consolidated table of all 9 mappings.
- **Shared classification facets enable cross-context filtering.** Because both contexts reference the same facet values, a user can filter the Concept List by "Data Classification = Master Data" and see master data concepts from both SDS and PF together.
- **DASH coverage summary on Module Overview.** Each Module Overview page shows DASH tier coverage statistics, making it easy to see which modules have full UI metadata, suggestion generators, and action descriptions.
- **Instance examples as teaching aids.** When real data examples exist (currently 5 SDS files from PostgreSQL dbo), the Concept Detail page shows sample instances with actual values, grounding abstract definitions in concrete reality.

### Data Loading Strategy

The pipeline loads each context independently: parse SDS files into SDS concepts, parse PF files into PF concepts. Each concept carries its namespace prefix as the `context` field. Shared classification data from `classification-skos.ttl` is loaded once and referenced by both contexts. Cross-domain mappings from `cross-domain-mappings.ttl` are applied as a post-processing step, linking concept records across contexts by their full IRIs. UI metadata from `-ui.ttl` companion files is loaded as an optional overlay -- dropping these files degrades presentation but does not break core functionality. SHACL Rules from `-rules.ttl` files are loaded into the materialization pipeline; the website shows derived properties flagged as "computed". Instance examples from `examples/sds/*.ttl` are parsed and linked to their concept types for display on Concept Detail pages.
