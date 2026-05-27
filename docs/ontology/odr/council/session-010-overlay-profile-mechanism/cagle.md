# Cagle — Solo position on S010 (extended `shacl-solo` pair with Knublauch)

## Stance summary

ODR-0010 is **already well-developed** — Knublauch's canonical five-rule SHACL mapping from S001 Q5 (required → `sh:minCount`; enum → merged `sh:in`; `oneOf` → `sh:xone`; per-leaf ref → `dct:source`; DASH for rendering) plus the `opda:ValidationContext` reification (Guarino's accepted withdrawal condition) plus the no-identity-override gate (Guizzardi) plus graph separation plus advisory-annotation exile. My load on this extended-panel pair is **overlay traceability** — the operational underbelly of how a profile graph (a) reifies as a first-class node, (b) composes deterministically, (c) traces back to the form question that drove each constraint, and (d) is checkable as a profile rather than as a free-floating SHACL graph.

Three of the eight S010 questions are LOAD-BEARING for me: **Q1** (`opda:ValidationContext` reification properties — completes Guarino's withdrawal condition); **Q3** (`dct:source` form-question IRI minting + page-anchor stability — operational discipline that ODR-0017 §1a expects); **Q6** (no-identity-override gate — the SHACL meta-shape mechanism that becomes my **eleventh ODR-0017 citing site** at `sh:Violation` floor, NOT `sh:Info`/`sh:Warning` — a profile touching identity is a category error, not informative-quality drift). **Q8** is the three-rule interface contract with ODR-0013 (my Scope-Check 1 Q6 amendment) — both ODRs cross-cite three shared rules, ODR-0013 owns the rules, ODR-0010 inherits and enforces.

My ODR-0017 `pattern`-extraction (now ratified post-S011 with four citing sites at `sh:Info`/`sh:Warning`) intersects S010 at Q6: the no-identity-override check is the **first `sh:Violation`-severity SHACL meta-shape that targets profile graphs themselves**, not data graphs. This is a different consumption pattern — meta-shape over shape-graph, not shape over data-graph — and I want it cross-cited in ODR-0010 §References + ODR-0013 §References + ODR-0017 §References (the eleventh site is structurally novel enough to warrant the cross-cite).

I expect this session clears at the deliberative level; the load-bearing questions resolve to operational mechanisms that ODR-0010 already anticipates.

## Per-question positions

### Q1 — `opda:ValidationContext` reification properties (LOAD-BEARING — completes Guarino S001 withdrawal condition)

The reification was accepted at S001 to convert "required (depending on which files the build passed)" into "required relative to a named, dereferenceable context" — giving Guarino's "no fixed model theory" demand a fixed model theory. S010 must specify the reification's **properties** so the context is actually dereferenceable, machine-readable, and composable.

**The properties** (Cagle commitment):

| Predicate | Range | Cardinality | Purpose |
|---|---|---|---|
| `opda:profileURI` | `xsd:anyURI` | 1 | The profile's dereferenceable URI (e.g. `https://opda.uk/profiles/baspi5/`). Resolves to the SHACL profile graph |
| `opda:requires` | `rdf:List` of `opda:profileURI` | 0..1 | Composition declaration — list of profile URIs this profile composes with (e.g. BASPI5 requires the base PDTF profile) |
| `opda:overlaysContext` | `rdf:List` of `xsd:anyURI` | 1..n | What TBox the profile overlays (the base class graph URI(s) — `https://opda.uk/ontology/`). Allows multi-TBox overlays in future |
| `opda:profileVersion` | `xsd:string` | 1 | Per ODR-0004 §6a generator-version discipline — `0.1.0` semver string |
| `dct:source` | `xsd:anyURI` | 1 | Form-document URI (e.g. `https://opda.uk/forms/baspi5`). The form this profile expresses; resolves to the form PDF/page |

**Why these and not others.** Five is the minimum for completeness: profile identity (`profileURI`), composition declaration (`requires`), TBox target (`overlaysContext`), version pin (`profileVersion`), form provenance (`dct:source`). Adding more (e.g. `opda:profileScope`, `opda:profileSeverity`) is premature; the named-but-deferred property `opda:effectiveDate` (when the profile becomes active) defers to ODR-0009 (lifecycle predicates).

**Guarino DA reply.** The S001 concession was conditional on reification being **complete** — a context that is just a label-on-a-graph is no better than the original "loaded = active" pseudoseam. The five properties above make the context a first-class node with its own dereferenceable URI, composition contract, version, and form-source; SPARQL `DESCRIBE` on the profileURI returns the full reified description. Guarino's "no fixed model theory" demand is met when every constraint's truth condition can be SPARQL'd to a named, dereferenceable context node — these five properties make that operational.

Vote: FOR five-property `opda:ValidationContext` reification with the named ranges and cardinalities above.

### Q2 — Composition semantics (NOT commutative in general; commutative by build-step design)

The naïve answer is "graph-union is commutative" — and at the RDF level, it is. But composition is not raw graph-union; it is the build-step that **replaces** `sh:in` nodes with merged member lists and **wraps** `oneOf` branches in `sh:xone`. The semantics depend on the build-step's design.

**Order-sensitivity breakdown:**

| Construct | Build-step behaviour | Commutative? |
|---|---|---|
| `sh:minCount` accumulation | Profile A adds `sh:minCount 1` on `opda:uprn`; Profile B adds same on `opda:address`; result: both shapes present | YES (additive; set-union of property shapes) |
| `sh:in` merged union | Profile A declares `sh:in (Freehold Leasehold)`; Profile B declares `sh:in (Freehold Commonhold)`; build-step replaces with `sh:in (Freehold Leasehold Commonhold)` | YES (set-union is commutative by definition; build-step replacement makes it commutative under the union semantics, NOT under raw graph-union which would yield TWO `sh:in` constraints = intersection = opposite of union intent) |
| `sh:xone` for merged `oneOf` | Profile A declares `sh:xone (Branch1 Branch2)`; Profile B declares `sh:xone (Branch1 Branch3)`; build-step needs a merge policy | **DEPENDS ON BUILD-STEP DESIGN**. `sh:xone` is symmetric so commutativity holds on a per-profile basis, but cross-profile `sh:xone` merging is not specified — flagged as **operational risk** for the ODR-0010 build-step spec |
| `dct:source` per-leaf | Profile A adds `dct:source <form-A#Q3>`; Profile B adds `dct:source <form-B#Q5>`; both retained | YES (multi-source is admissible per ODR-0004 §7a; downstream consumer picks the cited authority) |

**My commitment.** **Build-step explicit: profile load order does NOT affect final shape graph**, by design. The build-step's contract is: given a set of loaded profiles (unordered), produce a deterministic shape graph. Implementation MUST sort the input profile list (canonical order: alphabetical by `profileURI`) before merging, so two build runs over the same profile set yield byte-identical output. CI byte-identity test catches drift (per ODR-0004 §6a deterministic-emission discipline).

**Cross-profile `sh:xone` flag.** If two profiles BOTH declare `sh:xone` on the SAME path (e.g. BASPI5 and TA6 both constrain `participants.role`), the build-step needs a merge policy. Three options: (a) take the LATER profile's `sh:xone` (last-wins); (b) take the UNION of branches (open-ended); (c) take the INTERSECTION of branches (closed). My recommendation: **option (c) — INTERSECTION** for closed schemes (`role` is closed; the intersection is the safest discipline; if intersection is empty, the build fails loudly). Option (b) for open-ended `sh:xone` (rare). Option (a) is silent and dangerous; rejected.

Vote: FOR commutative-by-build-step design (canonical sort; deterministic emission); FOR intersection-merge policy on cross-profile `sh:xone` on the same path with build-fail-on-empty-intersection.

### Q3 — `dct:source` form-question IRI minting (LOAD-BEARING — page-anchor stability)

The pattern is settled at the macro level (Knublauch S001 Q5 Rule 4): per-leaf `baspi5Ref` / `ntsRef` becomes `dct:source` pointing at a minted, dereferenceable form-question IRI. S010 specifies the **syntax + minting + stability** discipline.

**IRI pattern:**

```
<https://opda.uk/forms/<form-name>#<question-id>>
```

Examples:
- BASPI5 question B1.3.2 → `https://opda.uk/forms/baspi5#B1.3.2`
- TA6 question 4.5 → `https://opda.uk/forms/ta6#4.5`
- NTS question 12 → `https://opda.uk/forms/nts#12`

**Minting authority.** The form-question IRIs are minted by the **OPDA generator** (per ODR-0004 §6a deterministic emission), reading the form-source JSON's `baspi5Ref` / `ntsRef` strings and templating them into the pattern. No human author mints these; the generator owns the namespace under `https://opda.uk/forms/<form-name>#`. Cross-references **ODR-0017 §1a `dct:source` URI discipline** + ODR-0011 §4a regulator citation verbatim.

**Page-anchor stability across form versions.** Form versions get a `?v=<version>` query parameter, NOT a new IRI. Example:
- BASPI5 v4.5 question B1.3.2: `https://opda.uk/forms/baspi5?v=4.5#B1.3.2`
- BASPI5 v5.0 question B1.3.2 (renumbered/reworded but same question): `https://opda.uk/forms/baspi5?v=5.0#B1.3.2`

When a question is genuinely deprecated (removed across versions), the page-anchor remains dereferenceable but returns a "deprecated" content-negotiated view; succession is recorded via `dct:isReplacedBy` per ODR-0017 §1a pattern. When a question is **renumbered** (B1.3.2 in v4.5 becomes B1.4.1 in v5.0 with same semantic content), BOTH anchors dereference; the v5.0 anchor carries `dct:isReplacedBy <v4.5-anchor>` for backward traceability.

**The discipline propagates from foundation.** ODR-0004 §7a five-line precedence (W3C/external spec > OPDA Trust Framework > regulators > glossary > schema annotation) applies: the form-question IRI is OPDA-internal (line 2 of precedence; OPDA Trust Framework owns the form catalogue). Generic latest-redirect URIs (e.g. `https://opda.uk/forms/baspi5/latest#B1.3.2`) are FORBIDDEN — version pin is mandatory.

Vote: FOR `https://opda.uk/forms/<form-name>?v=<version>#<question-id>` IRI pattern; FOR generator-owned minting; FOR `dct:isReplacedBy` succession on renumbered questions; FOR version-pin mandatory (no latest-redirect).

### Q4 — DASH coverage (BASPI5 audit — operational; not a Council question)

Knublauch's S001 Q5 Rule 5 specifies DASH viewers/editors: `dash:LabelViewer` / `dash:LiteralViewer` / `dash:URIViewer` for reads; `dash:EnumSelectEditor` / `dash:TextFieldEditor` / `dash:DetailsEditor` for edits; `sh:order` + `sh:group` for form-order and sectioning. The question is whether BASPI5 fully expresses via these constructs.

**My position: this is an OPERATIONAL TASK, not a Council deliberation question.** A field-by-field audit of the BASPI5 PDF against the DASH viewer/editor catalogue is a generator-validation pass, not a deliberative decision. The Council should rule on the **discipline** (the audit must be done; the audit results land in a `profiles/baspi5/audit.md` file), not on individual field decisions.

**Best-effort gloss.** BASPI5's fields are all expressible: text fields → `dash:TextFieldEditor`; enum fields (role, sellersCapacity, councilTaxBand) → `dash:EnumSelectEditor` driven by `sh:in`; nested objects (address, attachments) → `dash:DetailsEditor`; URIs (dct:source-linked content) → `dash:URIViewer`; read-only labels → `dash:LabelViewer` / `dash:LiteralViewer`. No field requires a viewer/editor outside the DASH spec's catalogue.

**Edge case.** The `sellersCapacity` nested `oneOf` (Personal-Representative / Attorney branch carrying `sellersCapacityDetails` + `attachments`) needs `dash:DetailsEditor` nested inside `dash:EnumSelectEditor` — supported by DASH but requires the build-step to emit the right `sh:group` nesting. Flagged for the BASPI5 audit pass.

Vote: FOR DASH coverage discipline (audit pass mandatory; results in `profiles/baspi5/audit.md`); DEFER per-field decisions to the operational audit.

### Q5 — `oneOf` → `sh:xone` with `sh:qualifiedValueShape` (pattern complete for nested `sellersCapacity`)

Knublauch's S001 Q5 Rule 3 specifies `oneOf` → `sh:xone`; the BASPI5 `participants.items` discriminated on `role` plus the nested `sellersCapacity` `oneOf` is the worked MVP. The pattern is correct.

**For the nested `sellersCapacity` two-level `sh:xone`:**

```turtle
opda:ParticipantShape a sh:NodeShape ;
    sh:targetClass opda:Participant ;
    sh:xone (
        [ sh:property [ sh:path opda:role ; sh:hasValue opda:Buyer ] ;
          # ... non-seller branch ... ]
        [ sh:property [ sh:path opda:role ; sh:hasValue opda:Seller ] ;
          sh:property [
              sh:path opda:sellersCapacity ;
              sh:xone (
                  [ sh:qualifiedValueShape [ sh:hasValue opda:LegalOwner ] ;
                    sh:qualifiedMinCount 1 ; sh:qualifiedMaxCount 1 ]
                  [ sh:qualifiedValueShape [ sh:hasValue opda:Mortgagee ] ;
                    sh:qualifiedMinCount 1 ; sh:qualifiedMaxCount 1 ]
                  [ sh:qualifiedValueShape [ sh:hasValue opda:PersonalRepresentative ] ;
                    sh:qualifiedMinCount 1 ; sh:qualifiedMaxCount 1 ;
                    # branch carries extra sh:minCount 1 on sellersCapacityDetails + attachments
                    sh:property [ sh:path opda:sellersCapacityDetails ; sh:minCount 1 ] ;
                    sh:property [ sh:path opda:attachments ; sh:minCount 1 ] ]
                  [ sh:qualifiedValueShape [ sh:hasValue opda:Attorney ] ;
                    sh:qualifiedMinCount 1 ; sh:qualifiedMaxCount 1 ;
                    sh:property [ sh:path opda:sellersCapacityDetails ; sh:minCount 1 ] ;
                    sh:property [ sh:path opda:attachments ; sh:minCount 1 ] ]
              )
          ] ]
    ) .
```

The `sh:qualifiedMinCount 1` / `sh:qualifiedMaxCount 1` discriminate on `opda:sellersCapacity` value; the Personal-Representative / Attorney branches carry the conditional `sh:minCount 1` on `sellersCapacityDetails` + `attachments`. Idiomatic SHACL 1.2; passes the W3C SHACL 1.2 spec §4.7 (`sh:qualifiedValueShape`).

Vote: FOR two-level `sh:xone` with `sh:qualifiedValueShape` pattern as above for nested `sellersCapacity`.

### Q6 — No-identity-override gate (LOAD-BEARING — eleventh ODR-0017 citing site at `sh:Violation`)

Guizzardi's S001 demand: a profile may not touch a Kind's identity or key. ODR-0010 §Rules state this as a discipline; S010 specifies the **check mechanism**.

**My push: the check is a SHACL meta-shape — `opda:ProfileShapeShape` — targeting profile graphs (NOT data graphs).**

```turtle
opda:ProfileIdentityOverrideCheckRule a sh:NodeShape ;
    sh:targetClass opda:ValidationContext ;
    sh:sparql [
        sh:select """
            SELECT $this ?propShape ?path WHERE {
                $this opda:profileURI ?profileURI .
                GRAPH ?profileURI {
                    ?propShape sh:path ?path .
                    FILTER(?path IN (opda:uprn, opda:titleNumber, opda:legalEstateIdentifier))
                    # ^^ identity-key predicates from ODR-0005
                }
            }
        """ ;
        sh:severity sh:Violation ;
        sh:message "Profile {?profileURI} declares property shape {?propShape} on identity-key predicate {?path} — profiles MAY NOT touch a Kind's identity (ODR-0005 / ODR-0010 §No-identity-override)."
    ] .
```

**Why `sh:Violation`, NOT `sh:Info`/`sh:Warning` (deviates from ODR-0017's normal severity floor).** This is the **first `sh:Violation`-severity SHACL meta-shape under ODR-0017's pattern** — and it deviates intentionally. ODR-0017 §Rules 2 reserves `sh:Violation` for normative-breaking; a profile touching identity IS normative-breaking — it would corrupt downstream consumers by allowing a form-context to override the rigid Kind's identity criterion (ODR-0005 Rule 5 anti-pattern: `owl:sameAs` propagation; identity-override is the analogous corruption at the profile layer). This is a **category error**, not informative-quality drift.

**Eleventh ODR-0017 citing site candidate.** ODR-0017's four ratified citing sites are all `sh:Info`/`sh:Warning` (UPRN succession; INSPIRE succession; deprecation chain; PROV-O Claims/Evidence anticipated). Plus six additional citing sites have appeared across S005/S007/S015 amendments (mapped in my Scope-Check 2 carry-over). The eleventh site — this no-identity-override gate — is structurally novel: it is the first `sh:Violation`-severity rule under the pattern, AND it targets **profile graphs**, not data graphs. This warrants:
1. A new ODR-0017 §2a table row for `sh:Violation` severity (category-error use case);
2. Cross-cite in ODR-0010 §References, ODR-0013 §References, ODR-0017 §References;
3. Flag for next /loop fire to retrofit ODR-0017 §2a to admit `sh:Violation` as a third severity tier UNDER a constraint (only for meta-shapes targeting shape-graphs, not data-graphs).

**Alternative considered: static lint.** A pre-build lint that grep's profile sources for `sh:path opda:uprn` declarations would also catch the override. Rejected: the SHACL meta-shape is mechanically consumable by the same SHACL validator the rest of the stack uses; the lint duplicates work and lives outside the validation chain. Single mechanism, single source of truth.

Vote: FOR SHACL meta-shape `opda:ProfileIdentityOverrideCheckRule` at `sh:Violation` severity targeting `opda:ValidationContext`; FOR cross-cite in ODR-0010/0013/0017 §References; FOR ODR-0017 §2a amendment admitting `sh:Violation` for meta-shape-over-shape-graph use case.

### Q7 — Round-trip test (operational — flagged for ODR-0013 closing session)

S001 Q5 Rule 5 (DASH for rendering) plus the §Enforcement clause already commits to the round-trip: loading the BASPI5 profile yields (a) a graph that validates a conformant transaction, (b) reports violations on a non-conformant one, (c) re-generates the BASPI form with `dct:source` traceability.

**The SHACL test suite** (operational; ODR-0013's confirmation criterion):

1. **Validating round-trip.** Load `profiles/baspi5.ttl` + conformant `instances/baspi5-conformant.ttl` → SHACL validator produces empty `sh:ValidationReport` (no violations). Byte-identity assertion: report's `sh:conforms true`.
2. **Reporting round-trip.** Load `profiles/baspi5.ttl` + non-conformant `instances/baspi5-violation.ttl` (Seller acting as Attorney without `sellersCapacityDetails`) → SHACL validator produces `sh:ValidationReport` with at least one `sh:Violation` result whose `sh:resultPath` is `opda:sellersCapacityDetails` and `sh:resultMessage` cites the form-question via `dct:source`.
3. **Form-regeneration round-trip.** Load `profiles/baspi5.ttl` → DASH-consuming form renderer produces a BASPI5 form whose fields all carry resolvable `dct:source` links AND whose field order matches the BASPI5 PDF (per `sh:order`).
4. **`sh:in` union build-test.** Load `profiles/baspi5.ttl` + `profiles/ta6.ttl` (both declaring `sh:in` on `role`) → composed shape's `sh:in` is the SET-UNION of base + BASPI5 + TA6 members (NOT the intersection — the regression guard against stacked `sh:in`).
5. **Identity-gate test.** Load a synthetic `profiles/bad-baspi5.ttl` that declares `sh:property [ sh:path opda:uprn ]` → SHACL meta-shape `opda:ProfileIdentityOverrideCheckRule` produces `sh:Violation` (the Q6 gate fires).

**Operational placement.** The five tests live in `tests/profiles/baspi5/` under the OPDA ontology repo; CI runs them on every shape-graph commit per ODR-0004 §6a deterministic-emission discipline. Flagged for **ODR-0013 closing session** ratification (ODR-0013 owns the validation severity discipline).

Vote: FOR five-part round-trip test suite as confirmation criterion; FOR `tests/profiles/baspi5/` placement; FOR ODR-0013 ratification of the test discipline.

### Q8 — Three-rule interface contract with ODR-0013 (Scope-Check 1 Q6 / Cagle)

This is my Scope-Check 1 Q6 amendment, carried forward. Both ODRs cross-cite three shared rules; ODR-0013 owns the rules; ODR-0010 inherits and enforces.

**The three rules:**

1. **`sh:in` semantics — merged at build time (ODR-0010) applied to closed schemes (ODR-0013).** ODR-0010 §Rules Rule 2 declares the build-step replacement-not-stacking discipline; ODR-0013 declares which schemes are closed (eligible for `sh:in` membership-validation). The rules compose: ODR-0010's build-step produces the `sh:in` shape; ODR-0013's closed-scheme discipline determines whether the shape applies. Either ODR can author a rule; the other inherits via cross-cite.

2. **`sh:Violation` floor — profile cannot add a Violation not already in base (ODR-0013 owns the floor; ODR-0010 inherits).** ODR-0013 declares which constraints are `sh:Violation`-severity (the floor); ODR-0010 enforces the floor by build-time check that a profile does not introduce a NEW `sh:Violation` shape (it can only inherit existing ones from the base). A profile MAY add `sh:Warning` / `sh:Info` shapes; it MAY NOT raise the floor. Cross-cite mandatory.

3. **No-identity-override gate — profile cannot touch a Kind's key (ODR-0013 owns the keys; ODR-0010 enforces the gate).** ODR-0013 declares which predicates are identity-keys (per ODR-0005 IC); ODR-0010 enforces the gate via the SHACL meta-shape `opda:ProfileIdentityOverrideCheckRule` (Q6 above). My Q6 mechanism IS the enforcement for this rule; ODR-0013 owns the predicate list; ODR-0010 owns the gate-mechanism.

**Cross-cite content for ODR-0010 §References:**

```markdown
- **SHACL interface contract with ODR-0013** (per Scope-Check 1 Q6 / Cagle): three rules cross-cited — `sh:in` semantics (build-step replacement; closed-scheme applicability); `sh:Violation` floor (profile cannot raise; profile inherits); no-identity-override gate (SHACL meta-shape at `sh:Violation`; eleventh ODR-0017 citing site with category-error severity deviation).
```

**Cross-cite content for ODR-0013 §References:**

```markdown
- **SHACL interface contract with ODR-0010** (per Scope-Check 1 Q6 / Cagle): three rules cross-cited — see above. ODR-0013 owns the rules; ODR-0010 enforces them.
```

**If the seam leaks** (build-step composition produces surprises): spawn ODR-0010b/0013b "SHACL composition semantics" per plan §S010 Q8. Not anticipated; the three rules above cover the named seam points.

Vote: FOR three-rule interface contract; FOR cross-cite in BOTH §References sections; FOR ODR-0013-owns-rules + ODR-0010-enforces-rules division.

## Replies to anticipated objections

### Guarino DA — "the ValidationContext reification is still under-specified"

Anticipated attack: *"Five properties is the minimum; you've not addressed (a) profile-precedence when two profiles disagree on a shape, (b) lifecycle of the context (when does a profile become active/deprecated), (c) inheritance — can a profile extend another profile, and if so, how is the extension graph related to the base via `opda:requires`?"*

Reply (a) profile-precedence: ODR-0010 §Rules Rule 2 + my Q2 commitment (canonical-sort + intersection-merge for cross-profile `sh:xone`) covers this. (b) Lifecycle: defers to ODR-0009 (PROV-O lifecycle predicates) — `opda:effectiveDate` / `opda:retirementDate` named-but-deferred. (c) Extension-vs-composition: `opda:requires` IS the extension mechanism; a profile that `opda:requires` another profile is composed with it at build time. No separate extension graph needed; composition graph-union does the work.

Withdrawal condition (offered): I withdraw the five-property minimum if Guarino produces a sixth property whose absence breaks Guarino's "no fixed model theory" demand (he won't; the five cover the truth conditions for every constraint in the reified context).

### Knublauch (Queen, extended-panel pair) — "Cagle's no-identity-override gate at `sh:Violation` violates ODR-0017's severity floor"

Anticipated attack: *"ODR-0017 §Rules 2 reserves `sh:Violation` for normative-breaking. Your Q6 mechanism is a meta-shape rule, not a normative-breaking constraint. You're stretching the pattern beyond its discipline."*

Reply: The Q6 mechanism IS normative-breaking — a profile touching identity corrupts downstream consumers in the same way `owl:sameAs` propagation does (ODR-0005 Rule 5 anti-pattern). The severity is `sh:Violation` because the failure mode is identical to a normative-constraint violation. What's novel is the **target** — the meta-shape targets profile graphs (the `opda:ValidationContext` reification) not data graphs. I'm proposing an **amendment to ODR-0017 §2a** that admits `sh:Violation` for meta-shape-over-shape-graph use cases — not a violation of ODR-0017's discipline, but an extension of it.

Withdrawal condition (offered): I withdraw the `sh:Violation` severity for Q6 if Knublauch produces an alternative mechanism that (a) is mechanically consumable by the same SHACL validator; (b) does NOT require duplicating SPARQL across each consumer; (c) catches identity-override at build time with the same fail-loudly discipline. (My expectation: he agrees; the SHACL meta-shape is the cheapest mechanism.)

## Cross-references

- My Q1 ValidationContext five-property reification feeds forward into **ODR-0013** (validates the `opda:ProfileShapeShape` meta-shape targeting `opda:ValidationContext`) and into **ODR-0009** (PROV-O lifecycle predicates for the named-but-deferred `opda:effectiveDate` / `opda:retirementDate`).
- My Q3 `dct:source` form-question IRI minting feeds into **ODR-0017 §1a** (`dct:source` URI discipline; version pin) and into **ODR-0011 §4a** (regulator citation verbatim — form-questions cite the form's regulator-source).
- My Q6 no-identity-override gate (SHACL meta-shape at `sh:Violation`) becomes the **eleventh ODR-0017 citing site** with category-error severity deviation; flagged for ODR-0017 §2a amendment admitting `sh:Violation` for meta-shape-over-shape-graph use cases.
- My Q7 round-trip test suite feeds into **ODR-0013** (validation severity ratification) and into **ODR-0008** (when descriptive-attribute profiles need their own round-trip tests, re-instantiate the five-part suite).
- My Q8 three-rule interface contract is the Scope-Check 1 Q6 amendment carry — cross-cited in BOTH ODR-0010 §References and ODR-0013 §References.
- ODR-0004 §3a (three-graph separation) constrains where my Q6 meta-shape lives: `opda:ProfileIdentityOverrideCheckRule` sits in `opda-shapes.ttl` (shape graph), NOT in `opda-annotations.ttl`; the CI test `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns false.
- ODR-0018 (DPV class-level co-annotation pattern) intersects with overlays — a profile MAY filter by DPV co-annotation (e.g. BASPI5's PII-sensitive fields trigger DPV-PD lawful-basis annotations at the profile level). Profile-level DPV filtering is NOT in scope for S010; flagged for ODR-0012 (Data-Governance Layer) ratification.
