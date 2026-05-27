# Gandon + Guizzardi — Formal-pair position on S002

## Pair summary

S002 ratifies ODR-0002, which is `kind: architecture`. Under the A9 amendment we
both helped author (verdict 2-1 BOTH-WITH-BOUNDARY, adopted 2026-05-27), the
catalogue is the **relaxed regime**: it does not require UFO meta-categories or
ICs over named hard cases at the record level, because admission to the
catalogue is *editorial* — what to publish, with what conditions, in what
layer — not foundational-ontology work. Meta-discipline (Q1–Q6) is therefore
not a commitment question; the governance-pair owns the codification. Our load
is **Q11 (OBO RO)** and **Q12 (FOAF reason)**, where genuine deliberation
remains. On Q11 we split: Gandon leans DEFER on Linked-Data-Principles +
named-consumer grounds; Guizzardi leans ADOPT (CONDITIONAL) on
well-founded-mereology grounds. On Q12 we agree: rule-out stands, on two cited
reasons — superseded-by-composition (PROV-O + W3C Org + `dct:`) and
shape-of-the-Web era mismatch.

## Per-question positions

### Q1 — Tier cut

**Gandon:** Three tiers is right; per A9 this is artefact-engineering. The
Linked Data Principles (Berners-Lee 2006; Heath & Bizer 2011, Ch. 2) do not
ask for more apparatus than the survey-grounded cut provides. Closed-set
discipline + published Defer column with "revisit when" matches DCMI / W3C
WG / FIBO catalogue conventions. Do not over-design.

**Guizzardi:** Concur — the catalogue does not declare Kinds; tiers are
editorial scopes, not ontological commitments. IC discipline applies in
ODR-0005 / 0006 / 0011, not here.

**Pair vote:** Three tiers — IN.

### Q2 — Metadata fields

**Gandon:** Pin canonical URI (LDP Principle 1; RDF 1.1 Concepts §1.5) +
`owl:versionIRI` where applicable (PROV-O, DCAT 3, SHACL 1.2, DPV) + prefix
(per `vann:preferredNamespacePrefix`, ODR-0002 §Adoption pattern). The rest
defers to governance-pair.

**Guizzardi:** Defer to governance-pair; note only that the W3C status of a
vocabulary's *commitments* (Rec vs Note vs WD) fixes how much the catalogue
can promise downstream — Note commitments may shift; Rec freezes them. This
links to Q6.

**Pair vote:** Canonical URI + `owl:versionIRI` (where applicable) + prefix.

### Q3 — Promotion / demotion criteria

**Gandon:** Promotion needs a *named consumer dereferencing the resource* —
not hypothetical use. LDP Principle 4 ("include links to other URIs so they
can discover more things") presupposes URIs that consumers actually use. The
OWL-Time Session 001 precedent (promoted when proprietorship / lease /
claim-validity intervals named the need) is the discipline.

**Guizzardi:** Defer on workflow. One caveat: distinguish *vocabulary
obsolescence* (upstream Rec retracted) from *commitment shift* (upstream
re-published with materially different commitments). The latter may itself
need Council review.

**Pair vote:** Named-consumer promotion trigger — IN.

### Q4 — Reference-not-import

**Gandon + Guizzardi:** Concur with Kendall's Session 001 amendment. Reference-
by-canonical-URI without `owl:imports` preserves dereferenceable identity
(LDP) without pulling upstream transitive closure into the local TBox; it also
preserves the boundary between our commitments (in `opda:`) and theirs (in
`prov:`, `dct:`, `time:`). H&M ONT-0086 pattern, already in ODR-0002 §Adoption
pattern. Generalise to every catalogued vocabulary.

### Q5 — Profile-pinning ownership

**Gandon:** Profile choice (OWL 2 EL / RL / DL; DPV stack composition; SHACL
Core vs SHACL-SPARQL) is an artefact decision — module owners own it; catalogue
records the pin without adjudicating. LDP Principle 3 leaves profile selection
to the publisher.

**Guizzardi:** Concur with the artefact framing, with one caveat: profile
choice can *import a commitment shadow* (OWL 2 EL silently rules out inverse-
functional object properties that some Kinds may need). That is module-level
`pattern` review (S005/S006/S007), not catalogue work.

**Pair vote:** Module owners pin; catalogue records.

### Q6 — W3C status citation per entry

**Gandon:** YES — ODR-0001 §Citation grounding requires the W3C status of each
catalogued vocabulary be named (Rec / WD / Note / Community Group draft).
Concretely: PROV-O is W3C Rec 2013; DCAT 3 is W3C Rec 2024-02; OWL-Time is
W3C Rec 2017 (rev 2020); SHACL 1.2 is W3C Working Draft; DASH is TopQuadrant-
maintained (not W3C); DPV is W3C Community Group draft (DPVCG, not Rec).

**Guizzardi:** Concurring. A vocabulary's commitments change with its status —
a Note is provisional; a Rec freezes commitments on the version. The catalogue
commits to *the reference identity* of the vocabulary, but reference identity
is unstable for non-Rec vocabularies. Worth saying.

**Pair vote:** W3C status per entry — IN.

### Q7 — OWL-Time demotion trigger

**Gandon:** Demotion only if a published consumer relinquishes the dependency
*and* no other named consumer remains. Symmetrical to Q3: named consumer
brought it in (Session 001 — proprietorship / lease / claim-validity intervals);
named-consumer departure takes it out. Hold for now.

### Q8 — DCAT gate

Defer to governance-pair. DCAT 3 is W3C Rec; catalogue-as-published-dataset is
hypothetical until OPDA actually publishes one. Session 001 outcome
(Conditional, near-zero marginal cost over `dct:`) is sound.

### Q9 — SSSOM re-open

**Gandon:** External mapping work = activation. The Session 001 verdict
(Defer; `dct:source` for single-source internal refs; SSSOM earns its place
mapping to external vocabularies — FIBO, INSPIRE, HMLR) is correct. Cagle's
dissent stands as the live position.

**Guizzardi:** SSSOM mappings carry commitments — `skos:exactMatch` ≠
`skos:closeMatch`; SSSOM's `predicate_id` is a commitment about the source-
target relation. When SSSOM activates, the mapping is `kind: pattern` work at
the *module* level (S006 → external Org-ontology; S015 → INSPIRE / HMLR /
OS land), not catalogue work at S002.

**Pair vote:** Keep deferred; activation = named external mapping work;
mapping discipline lives in the `pattern` ODR that admits SSSOM.

### Q10 — ODRL activation

Defer to governance-pair. Session 001 verdict (vocabulary admitted; policy-
authoring deferred to Phase 2) is sound — Guarino's TBox-without-instances
argument is binding. Activation = consent / policy *instances* enter scope
(ODR-0012 Phase 2).

### Q11 — OBO RO — DEPTH (genuine deliberation; pair split)

This is Session 001 Q2's open question, routed to ODR-0005 (Property Land
identity crux). The question: should OPDA adopt the OBO Foundry's Relation
Ontology (Smith, Ceusters, Klagges, Köhler, Kumar, Lomax, Mungall, Neuhaus,
Rector & Rosse 2005, "Relations in biomedical ontologies", *Genome Biology*
6:R46) as the canonical part-of / has-part vocabulary for OPDA's flat → block
→ estate hierarchy and parcel-of-land modelling?

**Gandon (DEFER — leans no):**

The Linked Data Principles do not endorse vocabulary adoption on theoretical
elegance alone. OBO RO was authored for biology (the Smith et al. 2005 paper
is explicit: the relations were factored out of GO, FMA, ChEBI, SO and other
biomedical ontologies; the worked examples are gene-product / cellular-component
/ anatomical-structure mereology). The naming is biology-flavoured. A
property-data consumer dereferencing `ro:part-of` on an OPDA flat-in-a-block
gets a graph rooted in biology — that is a *Linked Data violation of the
"useful information" principle* (Principle 3: when someone dereferences a URI,
provide useful information using the standards). The information returned is
useful for biology consumers, not property-data consumers.

OPDA's part-of needs are limited:

- flat → block → estate (mereological hierarchy)
- parcel-of-land containment (spatial mereology)
- property-component (subdivision: kitchen → property; room → flat)

`dct:isPartOf` (Dublin Core, already in Core tier) covers these at the
editorial level. Where finer mereology is needed (proper vs improper part;
transitive vs intransitive part), the OPDA-local `opda:hasPart` /
`opda:isPartOf` with stated semantics is reachable in a one-line ODR
amendment and dereferences to *property-data* graphs, not biology graphs.

The Davis Session 001 vote ("biology-flavoured; use `dct:isPartOf`") was the
right call. Defer OBO RO until a named consumer requires its specific
commitments — and even then, prefer composition with `opda:` over wholesale
adoption.

**Gandon verdict:** DEFER. Revisit when a named consumer dereferences OBO RO's
URIs and the commitments cannot be reached via `dct:isPartOf` + `opda:` local
predicates.

**Guizzardi (ADOPT CONDITIONAL — leans yes, with named-consumer trigger):**

The Gandon objection conflates *naming surface* with *commitment content*.
OBO RO is biology-named, but its *commitments* are well-founded mereology:
proper part vs improper part; transitive vs intransitive containment; part-of
vs has-part as inverses with stated cardinality; participates-in / occurs-in
as event-mereology distinctions. These are commitments that `dct:isPartOf`
does **not** carry. `dct:isPartOf` is editorial-strength mereology — the
Dublin Core specification (Brickley 2008, DCMI Metadata Terms) defines it as
"a related resource in which the described resource is physically or
logically included". No transitivity commitment; no proper-vs-improper
distinction; no inverse cardinality.

For OPDA's flat → block → estate hierarchy, the mereological commitments
*do matter*. A flat in a block in an estate: is "flat is part of estate"
derivable by transitive closure? `dct:isPartOf` does not commit. OBO RO's
`ro:part_of` does (it is transitive). For parcel-of-land subdivision: is
"parcel A is part of parcel B" *proper* part (A ≠ B and A ⊂ B), or could
A = B under improper-part semantics? `dct:isPartOf` does not commit. OBO RO
distinguishes.

This matters for ODR-0005's identity crux. The unrebutted Cagle challenge in
Session 001 Q4 ("a rigid Kind with `owl:hasKey` is inert for a consumer
whose record has no UPRN") cascades: if a flat's UPRN is absent but its
parent block's UPRN is known, can the flat's identity be derived from the
mereological chain? `dct:isPartOf` cannot answer; well-founded mereology
can (if part-of is transitive and the proper-part hierarchy chains, the
identity carries through the chain with stated graceful-degradation
semantics). This is the same line of reasoning that brought OWL-Time into
ODR-0002 — coherence with the foundational layer.

That said, the Gandon objection on Linked Data is partially correct: the
biology-flavoured naming does impose a dereference-cost on consumers. The
right move is **CONDITIONAL adoption with explicit re-prefixing** — pull
the commitments OPDA needs (`ro:part_of`, `ro:has_part`, `ro:proper_part_of`),
admit them under `opda:` re-aliases with `owl:equivalentProperty` to the
canonical OBO RO URIs, and document the commitment-import in the ODR-0005
follow-up. This is the H&M ONT-0071c pattern (canonical-URI reference with
local SHACL).

**Guizzardi verdict:** ADOPT CONDITIONAL with named-consumer trigger
(named consumer = ODR-0005's IC over the flat→block→estate hierarchy when
flat UPRN is absent). Re-alias OBO RO predicates under `opda:` to preserve
dereferenceability; cite OBO RO via `owl:equivalentProperty`; commitment
documented in ODR-0005's IC discipline.

**Pair verdict on Q11 (honest split recorded):**

| Position | Vote |
|---|---|
| Gandon | DEFER (revisit when consumer + commitments-not-reachable-via-`opda:`-local) |
| Guizzardi | ADOPT CONDITIONAL (with named-consumer trigger = ODR-0005 IC + re-alias under `opda:`) |

We agree on the routing (the question is owned by ODR-0005, not S002) and on
the architecture if adoption happens (re-alias + `owl:equivalentProperty`).
We disagree on whether the ODR-0005 IC discipline *forces* adoption or whether
`dct:isPartOf` + `opda:` local predicates suffice.

The pair's recommendation to the Queen: record the split honestly; the
Council vote at S002 should be **CONDITIONAL adoption deferred to ODR-0005's
follow-up session**, where the IC discipline + diagnostic exemplars + the
flat → block → estate hard case can adjudicate. S002 ratifies the existing
Change Log entry ("OBO RO — Question raised … No consensus; left open;
routed to ODR-0005") without forcing the issue.

If the Council insists on a vote at S002, our pair-vote (averaged) is
**ADOPT CONDITIONAL with the ODR-0005 follow-up as gate** — Guizzardi's
position carries on the merits; Gandon withdraws-conditional-on-re-aliasing
preserving dereferenceability.

### Q12 — FOAF reason — DEPTH (pair joint verdict)

Session 001 Q2 raised FOAF; the entry has since been "ruled out programme-wide"
per the Change Log. Q12's task is to *record the reason* — the catalogue
currently says "Person/Agent modelling — superseded by `prov:Agent` + Dublin
Core for our purposes. Not in H&M `src/`. Session 001 Q2 briefly reopened
this; ruled out (programme decision)". This is too thin. The pair proposes
two cited reasons.

**Reason 1: Superseded by composition.**

FOAF (Brickley & Miller 2014, *FOAF Vocabulary Specification 0.99*, paragraph
on `foaf:Person` / `foaf:Organization` / `foaf:Agent`) authored the
person/organisation/agent distinction in the 2000–2014 era. The Web has moved
on. Three subsequent W3C compositions cover the FOAF surface OPDA needs:

- `prov:Agent` (W3C PROV-O Rec 2013, §3.2.1) — the provenance role; used in
  ODR-0009 (claims / evidence / provenance). Adopted in Session 001 Q2 as the
  provenance-role Agent.
- W3C Org Ontology (Reynolds 2014, W3C Rec) — the organisational-structure
  layer; provides `org:Organization`, `org:OrganizationalUnit`, `org:Membership`,
  `org:hasMember`, `org:hasPost`. Adopted in ODR-0006 as the Kind-layer
  organisation type alongside bespoke `opda:` predicates.
- `dct:` (Dublin Core Terms; Core tier) — `dct:creator`, `dct:contributor`,
  `dct:publisher` for editorial agency; covers FOAF's "who authored this"
  surface.

Plus OPDA's bespoke `opda:Person`, `opda:Organisation` Kinds (ODR-0006) with
UFO category commitments and ICs (per A9 discipline) — which FOAF does not
provide (FOAF is editorial; it has no UFO category commitment, no IC over
named hard cases).

The composition `prov:Agent + W3C Org + dct: + opda:Person/Organisation` is
what modern Linked Data does (Linked Data Principles + the W3C Rec
composition pattern Heath & Bizer 2011 Ch. 6 describes). FOAF was the
2000–2014 baseline; the 2013–2014 W3C compositions superseded it.

**Reason 2: Shape-of-the-Web era + category mismatch.**

FOAF was authored under "Friend of a Friend" semantics — the *social Web*
metaphor of the 2003–2010 era (Brickley & Miller 2007, "FOAF: an experiment
in machine-readable home pages"; the FOAF spec's own historical preamble).
Naming a vocabulary "Friend of a Friend" inside a *property-data trust
framework* — where the agents are licensed conveyancers, lenders, surveyors,
proprietors, AML-checked individuals, regulated estate agents — is a
category mismatch (Guizzardi UFO Kind-level argument: the Kind-level
ontological commitment FOAF carries is *social acquaintance network*; OPDA's
Kind is *regulated property-transaction participant*). The vocabularies'
truth-makers are different.

This is the same logic that ruled out BBO and ArchiMate in Session 001 (no
process- or capability-modelling task). It is the H&M Session 371 logic
(schema.org deferred because the use case was open-web publication, not
ontology core). It is the Linked Data Principle 4 reasoning ("include links
to other URIs so they can discover more things") — dereferencing
`foaf:Person` returns the FOAF graph, which is shaped for social-Web
discovery, not property-data trust.

**Proposed Change Log row text for Q12:**

> | 2026-05-XX | [Session 002](./council/session-002-vocabulary-catalogue.md) Q12 | FOAF | Rule-out reason recorded. (1) **Superseded by composition**: `prov:Agent` (PROV-O Rec 2013) + W3C Org Ontology (Reynolds 2014, W3C Rec) + `dct:` (Core tier) + `opda:Person`/`opda:Organisation` (ODR-0006) covers the FOAF surface OPDA needs with UFO category commitments and ICs FOAF does not provide. (2) **Shape-of-the-Web era + Kind-level category mismatch**: FOAF's "Friend of a Friend" social-Web semantics (Brickley & Miller 2014, FOAF 0.99 spec) is a category mismatch for property-data trust framework (regulated conveyancers, lenders, AML-checked participants — not a social acquaintance network). Defer-row negative on FOAF stands; reason now cited in catalogue. |

**Pair vote on Q12:** Rule-out — IN, with both reasons recorded per the
proposed Change Log text above. (Cited grounding: Brickley & Miller 2014;
Reynolds 2014; Berners-Lee 2006; Heath & Bizer 2011 Ch. 6; Guizzardi 2005
UFO Kind-level argument.)

### Q13 — `cred:` / `did:`

Brief — concur with Scope-Check 1 Q7c admission (W3C VCDM 2.0; DID Core 1.0;
both W3C Rec). Activation pointer to ODR-0016 is correct. Catalogue's job is
admission with named activation trigger; ODR-0016's job is to adjudicate the
PROV-O / VC / DID composition (the Guizzardi-appended Truth-Maker question:
what makes true a VC — derivation, signature, or assurance level?).

**Pair vote:** Concur with the existing Scope-Check 1 Q7c admission as
recorded in the Change Log.

## Proposed amendment text

Two concrete Change Log rows for the Session 002 ratification.

**Q11 — OBO RO row (revised):**

> | 2026-05-XX | Session 002 Q11 | OBO RO | Pair-split recorded (Gandon DEFER on Linked-Data-Principles + named-consumer grounds; Guizzardi ADOPT CONDITIONAL on well-founded mereology + ODR-0005 IC discipline grounds). Routing stands: question owned by ODR-0005's follow-up session, where the flat → block → estate hard case + diagnostic exemplars adjudicate. If adoption: re-alias OBO RO predicates (`ro:part_of`, `ro:has_part`, `ro:proper_part_of`) under `opda:` with `owl:equivalentProperty` to canonical OBO RO URIs; local SHACL; no `owl:imports` (per ODR-0002 §Adoption pattern). Cited grounding: Smith, Ceusters, Klagges, Köhler, Kumar, Lomax, Mungall, Neuhaus, Rector & Rosse 2005, "Relations in biomedical ontologies", *Genome Biology* 6:R46; Brickley 2008, DCMI Metadata Terms (`dct:isPartOf`); Guizzardi 2005, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 5 (mereology). |

**Q12 — FOAF row (revised):** see proposed text under Q12 above.

## Replies to anticipated objections

**Allemang will say (on Q11):** "biology-flavoured; use `dct:isPartOf`".

*Gandon's reply:* I agree. The Linked Data Principles do not endorse adopting
biology-flavoured vocabularies for property-data uses unless the
commitments-not-reachable-elsewhere argument holds — and `dct:isPartOf` +
`opda:` local predicates with stated mereology semantics covers the property
case at editorial-strength. Defer until the named-consumer / commitments-not-
elsewhere conjunction is met.

*Guizzardi's reply:* Allemang and Gandon are pragmatically right at S002 *for
the catalogue level*. But the question at ODR-0005's follow-up is whether
the IC discipline over the flat → block → estate hard case (when flat UPRN
is absent) can be satisfied without well-founded mereology. If the answer
is "yes, via `opda:` local predicates with stated transitivity / proper-part
commitments", the OBO RO adoption is not needed. If the answer is "no, OPDA
ends up reinventing OBO RO's commitments under `opda:` predicates", then
we have reinvented OBO RO without citing it — the discipline cost of
re-stating well-founded mereology in OPDA-local prose exceeds the
dereference cost of citing the canonical vocabulary. The pragmatist case
collapses at the *commitment* level even if it holds at the *naming* level.
The ODR-0005 follow-up adjudicates.

**Cagle (DA) will attack (Q12 reason):** "FOAF is still widely deployed; the
rule-out reason should cite a deployment fail, not a theoretical mismatch."

*Pair reply:* The deployment fail and the theoretical mismatch are not
exclusive — they are the same fact at different levels. FOAF *is* widely
deployed, but **not in property-data trust frameworks**. The deployments
are: social Web profiles, academic homepage graphs, open-data publisher
metadata (e.g. Europeana). None of these is the OPDA use case. The category
mismatch is empirically observable in the deployment record: FOAF's
production graph topology is shaped for social-acquaintance traversal
(`foaf:knows` chains; `foaf:Person` aggregation across heterogeneous
publishers), not for regulated-participant identity (which is what AML,
KYC, conveyancer-licensing, and proprietorship requires). The theoretical
mismatch is the *reason* the deployment record diverges; citing the
mismatch is citing the deployment fail's explanation, not substituting for
it.

Additionally: the W3C composition (PROV-O + Org Ontology + `dct:`) *is*
the deployment-fail-corrected successor — Reynolds 2014 (W3C Rec Org
Ontology) was authored explicitly to fill the organisational-structure gap
FOAF left, citing FOAF's social-Web origins as the reason a successor was
needed (see Reynolds 2014 §1, "Status of This Document" and §2,
"Introduction"). Citing the composition is citing the deployment-tested
successor.

**Davis (DA, if convened) will press (on Q12):** "Are you sure `prov:Agent` +
Org Ontology + `dct:` covers the *name-structure* gap? FOAF has
`foaf:firstName` / `foaf:familyName` / `foaf:givenName`."

*Pair reply:* `opda:Name` (ODR-0006: "structured datatype, declared once here
and reused by ODR-0005/0008") fills the gap. FOAF's name predicates are
editorial-strength — no IC over hard cases (name changes, marriage,
transliteration, dual-citizen multi-name); `opda:Name` under A9 discipline
carries the IC and the UFO-Mode commitment (Mode of a Person; bears a
Quality; Quality's value is the literal) that property-data trust requires.
Reynolds 2014 W3C Org Ontology's incidental FOAF re-use was 2014-era
compatibility; ODR-0006's `opda:Name` supersedes that pattern.
