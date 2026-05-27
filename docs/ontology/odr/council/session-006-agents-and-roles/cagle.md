# Cagle — Solo position on S006

## Stance summary

S006 is the **fifth citing site** of ODR-0017 (the SHACL-AF non-blocking data-quality-rules pattern I extracted at S011 §Consequences fourth-citing-site spawn). The Person/Org exemplars committed between sessions (person-with-name-change, organisation-with-merger) re-instantiate the same template I authored at S005 §6a (UPRN succession) and S011 §5a (deprecation chain): a `sh:rule` / `sh:sparql` on the Substance Kind materialising an identifier-succession assertion into the validation report at `sh:Info` (with substantive succession recorded) or `sh:Warning` (without). The pattern is now load-bearing across four ODRs; S006 is the fifth, and it pressure-tests whether the template generalises from Property identifiers to Agent identifiers without amendment.

My load on this session is **depth on Q1** (Person/Org IC operationalisation via SHACL primary + the fifth-citing-site SHACL-AF succession rule), **depth on Q2/Q3** (RoleMixin and Relator SHACL targeting — Roles are TBox commitments enforced via OntoClean meta-property annotation; the SHACL constraints are role-occupancy and Relator-mediation constraints), and **depth on Q4** (Capacity vs Authority as independent SHACL property shapes with an `sh:Info`/`sh:Warning`/`sh:Violation` three-tier SHACL-AF match rule — a sixth-citing-site candidate for ODR-0017).

I concede Q5 (Address — ODR-0015 owns) and Q7 (`participantStatus` Phase — S011 settled the Phase-label SKOS category; the lifecycle transition is a reified `prov:Activity`). I agree with adopting W3C Org as superclass for `opda:Organisation` on Q6 — SHACL targets inherit upward and the alignment costs nothing operationally.

## Per-question positions

### Q1 — Person Kind, Organisation Kind (DEPTH — SHACL operationalisation + fifth citing site)

The Person IC tuple is **(dateOfBirth + state-issued-ID-set)** — specifically, the date-of-birth combined with the set of state-issued identifiers (NI-number, passport-number, driving-licence-number, NHS-number) the Person carries. Two Person instances are the same iff (i) their dateOfBirth values are equal AND (ii) their state-issued-ID-sets intersect non-emptily on at least one identifier whose issuing scheme is single-valued-per-person. The Organisation IC tuple is **(jurisdiction + statutory-registration-number)** — Companies House CRN for E&W incorporated; LEI for FCA-regulated; equivalent in other jurisdictions.

**SHACL operationalisation.** The IC tuple becomes a SHACL `sh:NodeShape` with `sh:property` constraints on each identifier predicate; `dash:uniqueValueForClass` on each identifier value within its scheme (one NI-number identifies one Person nationally; one CRN identifies one Org in its jurisdiction). The combined IC is a SHACL-SPARQL `sh:select` returning the tuple per Person/Org; equality on tuples = same individual.

```turtle
opda:PersonIdentityShape a sh:NodeShape ;
    sh:targetClass opda:Person ;
    sh:property [
        sh:path opda:niNumber ;
        sh:datatype xsd:string ;
        sh:pattern "^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$" ;
        sh:maxCount 1 ;
        dash:uniqueValueForClass true ;
    ] ;
    sh:property [
        sh:path opda:dateOfBirth ;
        sh:datatype xsd:date ;
        sh:minCount 1 ; sh:maxCount 1 ;
    ] .
```

`dash:uniqueValueForClass true` on `opda:niNumber` fires `sh:Violation` when two Person instances carry the same NI-number; degrades gracefully when NI-number is absent (children, foreign nationals pre-NI-allocation). Same primary-vs-secondary discipline as S005 Q4 — SHACL primary, `owl:hasKey` optional/secondary as semantic annotation.

**Fifth citing site of ODR-0017 — Person/Org identifier-succession rule.** The person-with-name-change exemplar shows that names are mutable, identifiers are stable. But identifiers themselves can succeed (NI-number renumbering — rare but documented per HMRC; passport-renewal carries forward issuing-authority data but the document number changes; LEI succession via FIBO `hasPredecessorLEI` on Organisation merger; CRN preservation across merger differs — predecessors keep their CRNs and are dissolved, successor gets a new CRN). When succession occurs, the data is correct under its temporal scope; the assertion is *informative*, not normative-breaking. ODR-0017's three-tier severity discipline applies unchanged:

```turtle
opda:PersonIdentifierSuccessionRule a sh:NodeShape ;
    sh:targetClass opda:Person ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentName ?formerName ?changeMechanism WHERE {
                $this opda:currentName ?currentName .
                OPTIONAL { $this opda:formerName ?formerName .
                           $this opda:nameChangeMechanism ?changeMechanism }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Person {$this} carries name succession: {?currentName} ← {?formerName} (mechanism {?changeMechanism})"
    ] .

opda:OrganisationLEISuccessionRule a sh:NodeShape ;
    sh:targetClass opda:Organisation ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentLEI ?predecessor WHERE {
                $this opda:lei ?currentLEI .
                OPTIONAL { $this prov:wasDerivedFrom ?predecessor .
                           ?predecessor opda:lei ?predLEI }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Organisation {$this} (LEI {?currentLEI}) prov:wasDerivedFrom {?predecessor}"
    ] .
```

Both rules sit in `opda-shapes.ttl` per ODR-0004 §3a three-graph separation; both `implements: [ODR-0017]`; both produce `sh:Info` when substantive succession recorded (orphan name-change with no `nameChangeMechanism` declared → `sh:Warning`; this discharges the §1a/2a discipline of ODR-0017 unchanged).

**ODR-0017 implements: retrofit.** ODR-0006 frontmatter MUST add `ODR-0017` to its `implements:` list once the SHACL-AF rules above land. This is the housekeeping retrofit ODR-0017 §Consequences flagged.

Vote: FOR distinct Person/Org ICs (NOT reuse of ODR-0005's `opda:Property` spatial-material IC) + SHACL primary via `dash:uniqueValueForClass` on each identifier predicate + Q1 fifth-citing-site SHACL-AF rule per ODR-0017 template.

### Q2 — RoleMixin vs Role (DEPTH — TBox commitment + SHACL targeting)

RoleMixin is a TBox commitment (the class IS anti-rigid; this is what the OntoClean meta-property annotation declares). The class declaration carries `opda:rigidity "-R"` (anti-rigid) and `opda:ontoCleanIdentity "borrows-from-bearer"`; downstream consumers reading the OntoClean annotations know not to key the class.

```turtle
opda:Seller a owl:Class ;
    rdfs:label "Seller"@en ;
    ufo:isRoleMixin true ;
    ufo:foundedBy opda:Transaction ;
    opda:rigidity "-R" ;
    opda:ontoCleanIdentity "borrows-from-bearer" ;
    dct:source <https://w3id.org/...guizzardi-2005-ch4> .
```

**SHACL enforcement.** `sh:targetClass opda:Seller`; the constraints are **role-occupancy** constraints. Per ODR-0006 stub draft: a Seller MUST have a `prov:wasAttributedTo` link to its bearer Person or Organisation (or equivalently `opda:rolePlayer`); cardinality exactly 1 on the bearer link.

```turtle
opda:SellerRoleShape a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:property [
        sh:path opda:rolePlayer ;
        sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] ) ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Seller {$this} MUST be played by exactly one Person or Organisation bearer."
    ] .
```

The "operational vs noise" framing in the question is wrong — the RoleMixin/Role distinction IS operational at SHACL targeting: a RoleMixin (cross-sortal Role played by Person OR Organisation) has `sh:or` in its role-player shape; a single-sortal Role (Proprietor — natural-or-legal-person-on-title) has a single `sh:class` in its role-player shape. The distinction shows up in the shapes.

Vote: FOR RoleMixin/Role distinction as TBox commitment + OntoClean meta-property annotation + SHACL role-occupancy shapes with `sh:or` for RoleMixin / single `sh:class` for Role.

### Q3 — Proprietorship Relator (DEPTH — SHACL targeting the Relator)

The Proprietorship Relator MUST mediate at least one Proprietor Role; each Proprietor Role MUST have a `rolePlayer` link to a Person or Organisation. The Relator itself has no independent identity beyond the (Title, Persons-set) tuple per the proprietorship-relator-multi-proprietor exemplar.

```turtle
opda:ProprietorshipRelatorShape a sh:NodeShape ;
    sh:targetClass opda:Proprietorship ;
    sh:property [
        sh:path opda:mediates ;
        sh:class opda:Proprietor ;
        sh:minCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Proprietorship {$this} MUST mediate at least one Proprietor Role."
    ] ;
    sh:property [
        sh:path opda:proprietorshipOf ;
        sh:class opda:RegisteredTitle ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Proprietorship {$this} MUST be bound to exactly one RegisteredTitle."
    ] .

opda:ProprietorRoleShape a sh:NodeShape ;
    sh:targetClass opda:Proprietor ;
    sh:property [
        sh:path opda:rolePlayer ;
        sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] ) ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
    ] .
```

Joint-tenancy vs tenants-in-common is a property of the Relator (`opda:tenancyKind` per the exemplar); a SKOS scheme per ODR-0011 §1a (closed-set, two members; flat enum).

Vote: FOR Relator + Role layering with SHACL targeting both; Relator's IC = (Title, Persons-set) tuple; tenancy-kind as Relator property (NOT Role property).

### Q4 — Capacity vs Authority (DEPTH — independent properties + SHACL-AF match rule)

Two property shapes on the role-bearing entity: `opda:assertedCapacity` (cardinality 1; range a SKOS Method/plan code scheme per ODR-0011 §8a — `sellersCapacity` scheme), `opda:evidencedAuthority` (cardinality 0..1; range Evidence with PROV-O attribution per ODR-0009). **No `sh:in` constraint between them at the SHACL Core level** — they are independent at the SHACL Core level.

```turtle
opda:CapacityAuthorityShape a sh:NodeShape ;
    sh:targetClass opda:Seller ;  # also opda:Proprietor in regulated contexts
    sh:property [
        sh:path opda:assertedCapacity ;
        sh:node opda:SellersCapacityScheme ;  # SKOS-typed per ODR-0011
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
    ] ;
    sh:property [
        sh:path opda:evidencedAuthority ;
        sh:class opda:Evidence ;
        sh:minCount 0 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
    ] .
```

The IC of *evidenced authority matching asserted capacity* is a SHACL-AF rule (sixth-citing-site candidate for ODR-0017) firing `sh:Info` when matched (Personal Representative → grant of probate; Power of Attorney → registered LPA; Receiver → court appointment); `sh:Warning` when mismatched (PR claimed but evidence is power-of-attorney form); `sh:Violation` when `assertedCapacity` is non-null but `evidencedAuthority` is null AND the Seller is in a regulated context (Conveyancing-Solicitor's-Code obligation — a transaction cannot complete without authority evidence).

```turtle
opda:CapacityAuthorityMatchRule a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:sparql [
        sh:select """
            SELECT $this ?capacity ?authority ?evidenceKind WHERE {
                $this opda:assertedCapacity ?capacity .
                OPTIONAL { $this opda:evidencedAuthority ?authority .
                           ?authority opda:evidenceKind ?evidenceKind }
            }
        """ ;
        sh:severity sh:Info ;  # or sh:Warning on mismatch; sh:Violation when capacity-in-regulated-set + no authority
        sh:message "Seller {$this} asserts capacity {?capacity}; evidenced by {?authority} (kind {?evidenceKind})"
    ] .
```

The mismatch table (capacity → required evidence-kind) is authored as a separate SKOS mapping scheme owned by ODR-0009 (claims/evidence); ODR-0006 references the scheme via `dct:source`.

**Sixth citing site of ODR-0017 — flagged.** When ODR-0009 ratifies its PROV-O Claims/Evidence rule (anticipated S009), the Capacity-Authority match rule joins that as the sixth and seventh ODR-0017 citing sites. The pattern is generalising beyond identifier-succession into match-constraint territory; ODR-0017's §1a template covers it unchanged (target class + SPARQL SELECT + severity ladder).

Vote: FOR independent SHACL property shapes for `opda:assertedCapacity` and `opda:evidencedAuthority` + Capacity-Authority match SHACL-AF rule per ODR-0017 template + three-tier severity (`sh:Info` matched / `sh:Warning` mismatched / `sh:Violation` null-evidence-in-regulated-context).

### Q5 — Address reuse

Concede to ODR-0015 ownership. Address is declared in ODR-0015's `pattern` (Address & Geography Reduced Council, ratified 2026-05-27); ODR-0006 reuses `opda:Address` and `opda:hasAddress` per the S015 Q6 ODR-0015-owns ruling. No SHACL shape for Address authored here; `opda:Person opda:hasAddress` and `opda:Organisation opda:hasAddress` inherit ODR-0015's shapes.

Vote: CONCEDE — ODR-0015 owns Address class + IC + SHACL targeting.

### Q6 — W3C Org Ontology vs bespoke `opda:Organisation`

AGREE adopt W3C Org as superclass: `opda:Organisation rdfs:subClassOf org:FormalOrganization`. SHACL targets `opda:Organisation`; the W3C Org Ontology constraints (org membership, sub-organisation relations) inherit upward and become available to OPDA consumers without re-authoring. The alignment is via `rdfs:subClassOf` (NEVER `owl:sameAs` per ODR-0005 Rule 5); the SHACL targeting strategy is `sh:targetClass opda:Organisation` so OPDA's own constraints fire on OPDA instances, with W3C Org's constraints inherited via the subclass relation.

Cost is zero (W3C Org is well-maintained, OWL DL, no licensing issue); benefit is interoperability with FIBO-LegalEntity and the broader W3C-Org-aligned ecosystem.

Vote: FOR W3C Org as superclass + `rdfs:subClassOf` alignment + SHACL targeting unchanged.

### Q7 — `participantStatus` as a UFO Phase

Concede to S011 settled framework. Per ODR-0011 §8a seven-category framework, `participantStatus` is a **Phase label** — labels for intra-Kind phases a Substance Kind (Person/Organisation in their role-bearing capacity) passes through. SKOS scheme per ODR-0011 §1a; closed-set; `sh:in` constraint on the values. The lifecycle transition itself is a **reified `prov:Activity`** (NOT a SHACL violation, NOT a status-mutation in place) — the Activity is the participation-state-change event; `prov:wasGeneratedBy` chains the Person/Organisation-in-phase to the Activity.

SHACL targets the Person/Organisation in the phase (`sh:targetClass opda:Person`; `sh:property [ sh:path opda:participantStatus ; sh:node opda:ParticipantStatusScheme ]`). No Phase apparatus beyond the SKOS scheme; the formal UFO Phase machinery is overkill at this scale (Allemang DA would attack it as over-modelling, correctly).

Vote: CONCEDE — `participantStatus` as Phase label SKOS scheme per S011 §8a; lifecycle transition as reified `prov:Activity`; no formal Phase apparatus.

## Replies to anticipated objections

### Allemang DA on Q1 (anticipated) — "another SHACL-AF rule for a consumer that doesn't exist"

Anticipated attack: *"You've shipped four SHACL-AF rules in four ODRs and now you want a fifth for Person/Org succession. The PDTF v3 schema has no consumer that queries for name-change succession or LEI succession. You're spinning up pattern instantiations without consumer demand."*

Reply: The consumer is again the **LLM consumer** (DBpedia 2017 / Hellmann et al. lesson, same argument as S005 §6a). Every AI-driven transaction-summarisation tool reading the PDTF record sees `opda:formerName` and has to decide whether the former name identifies the same Person. Without the SHACL-AF rule materialising the chain, the LLM falls back on heuristics — `owl:sameAs` heuristic conflation is the failure mode Rule 5 was created to prevent. ODR-0017 §3a (machine-consumability requirement) makes this explicit; the rule is not speculative, it is the canonical operationalisation of an identifier-succession discipline that already exists in the exemplar data.

Withdrawal condition (offered): I withdraw the Q1 SHACL-AF rules if Allemang produces an operational alternative that prevents an LLM consumer from treating `opda:currentName` and `opda:formerName` as different Persons. (Expectation: he won't; the natural-language `rdfs:comment` alternative is exactly the failure mode.)

### Guizzardi as Queen on Q2 (anticipated) — "RoleMixin needs more formal apparatus"

Anticipated attack: *"You've collapsed RoleMixin into a TBox annotation + SHACL role-occupancy shape. The UFO formal apparatus says RoleMixin is anti-rigid and externally founded — your SHACL shape doesn't enforce externally-founded-ness."*

Reply: External-foundation IS the `ufo:foundedBy` predicate per the ODR-0006 Turtle stub; the SHACL shape can target this directly (`sh:property [ sh:path ufo:foundedBy ; sh:minCount 1 ]`). The OntoClean meta-property annotation declares the anti-rigidity; the SHACL shape enforces the cardinality of foundation. The combination discharges the UFO formal commitment at both TBox (annotation) and instance (SHACL) levels. The Queen's apparatus is preserved; my contribution is the operational shape that fires on instance data.

## Cross-references

- **ODR-0017 (SHACL-AF non-blocking data-quality-rules pattern).** This session is the **fifth citing site** of ODR-0017 (Q1 Person/Org succession rules) and contains a **sixth citing site candidate** (Q4 Capacity-Authority match rule). ODR-0006 frontmatter MUST add `ODR-0017` to its `implements:` list on Council ratification; the SHACL-AF rules land in `opda-shapes.ttl` per ODR-0017 §3a placement discipline. Per ODR-0017 §5a IC hard case 1 (rule extension), the Q4 match rule extends the pattern from identifier-succession to match-constraint — same individual under the §5a IC test (same template, severity ladder preserved, target class shifts).
- **ODR-0009 (Claims, Evidence & Provenance).** The Capacity-Authority match rule (Q4) consumes the Evidence class and `evidenceKind` SKOS scheme owned by ODR-0009. When S009 runs, my Q4 rule joins their PROV-O rule as cross-references; the Capacity → Evidence-kind mapping table is owned by ODR-0009 with `dct:source` reference from ODR-0006.
- **ODR-0011 §1a/§8a.** All SHACL `sh:property` shapes targeting SKOS values (`assertedCapacity`, `participantStatus`, `tenancyKind`, `role`) reference the SKOS schemes per ODR-0011 §1a discipline + UFO category per ODR-0011 §8a seven-category framework.
- **ODR-0013 (SHACL Validation & Severity).** ODR-0013 ratifies the `sh:Info`/`sh:Warning`/`sh:Violation` three-tier discipline I propose for Q4; the same `sh:Info` severity that S005 §6a and S011 §5a use for ODR-0017 rules carries through to S006.
- **ODR-0005 §6a (UPRN succession SHACL-AF rule).** Direct precedent for Q1 Person/Org succession rules; same template (`SELECT $this ?currentX ?priorX` + `sh:severity sh:Info` + `sh:message` with placeholders); same machine-consumability rationale (Hellmann et al. DBpedia 2017 LLM-fallback rebuttal).
- **ODR-0011 §5a (deprecation-chain SHACL-AF rule).** Cross-domain precedent for Q1 — the template generalises from concept-scheme deprecation to Person/Org identifier succession without amendment.
