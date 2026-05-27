# Baker + Pandit — Governance-pair position on S004

## Pair summary

ODR-0004 is well-aimed: single `opda:` hash namespace, layer-segregated naming, three-graph separation, `vann:`-headed ontology, generator-first plus diagnostic exemplars, and a glossary-headed term-sourcing rule are the right policies for a Foundation spike. Our pair contributes load-bearing detail on **Q4 (term-sourcing precedence)** — the DCMI Usage Board admission test — and **Q7 (namespace string and version scheme)** — DCMI namespace governance. We ratify Q1/Q2/Q3/Q5/Q6 with small clarifications. Knublauch's anticipated DA attacks on Q3 (graph composition) and Q5 (generator policy) are addressed inline.

## Per-question positions

### Q1 — Hash vs slash namespace

**Baker:** Ratify hash. The DCMI namespaces (`http://purl.org/dc/terms/`, `http://purl.org/dc/dcam/`) are slash-served via PURL because DCMI publishes thousands of terms across multiple schemes with content-negotiated descriptions. OPDA's Foundation TBox is single-document scale (1,556 unique base leaves, 935 annotated — a small TBox). The textbook whole-document hash case applies (Cagle's Session 001 Q7 argument; W3C TAG "Cool URIs for the Semantic Web" 2008, §4.4 — hash is recommended for small vocabularies served as one document). Slash is the speculative case here.

**Pandit:** Ratify hash. DPV uses slash (`https://w3id.org/dpv#` is hash; `dpv-pd`, `dpv-gdpr` follow the same hash convention — Pandit, Polleres, Bos, Brennan, Bos, Lizar, et al., 2024, *DPV 2.0 Specification* §URI policy). The DPV programme switched away from slash for the Core terms once the catalogue stabilised — the operational benefit (one ontology file, one resolver hit) outweighs the slash flexibility we never used. The OPDA Foundation is at the same stage.

**Pair vote draft:** **FOR Rule 1 as drafted (single `opda:` HASH namespace).** Hash is correct at OPDA's corpus size; the WG retains authority over the literal base URI.

### Q2 — Layer-segregated naming

**Baker:** Ratify Rule 2. DCMI's own discipline distinguishes element-set terms (in `/dc/terms/`) from concept-scheme entries (in `/dcmitype/`) — the URI itself signals "vocabulary term" vs "concept-scheme member". The layer signal pays for itself the first time a reviewer needs to know whether `opda:Seller` borrows identity from `opda:Person` or carries its own. We've all seen ontologies where role-as-Kind conflation passes review because the naming convention hid the question.

**Pandit:** Ratify with one clarification. DPV's `dpv:Purpose` / `dpv:LegalBasis` / `dpv:Right` hierarchy is exactly this kind of UFO-aligned naming (Pandit et al. 2024, DPV §Class taxonomy — purposes are Kinds borrowing identity from their owning processing activity). The DPV experience is that the naming convention only works if it is *enforced* by the generator and the SHACL lint, not just documented. Rule 2 should explicitly cite ODR-0001's `kind: pattern` discipline (UFO meta-category commitment) as the enforcement substrate — the lint reads the meta-category from the originating `kind: pattern` ODR and verifies the URI shape matches.

**Pair vote draft:** **FOR Rule 2** with a one-line addition: "The layer signal is verified by the `odr-review` lint against the `kind: pattern` UFO commitment of the originating ODR."

### Q3 — Three-graph separation

**Baker:** Ratify Rule 3. DCMI's separation of namespace terms (the element set) from application profiles (the DCAP layer) and from advisory documentation is the same architectural cut. The Singapore Framework (Nilsson, Baker, Johnston 2008, *Description Set Profiles*) makes this normative: the namespace is open-world (terms may be used anywhere); the application profile is closed-world (this is what *this consumer* requires); the documentation is advisory. They are different artefacts because they carry different model theories and serve different consumers.

**Pandit:** Ratify, with the operational concern Knublauch will raise. DPV's SHACL profiles (Pandit et al. 2024, DPV §Validation) keep the OWL class graph and the SHACL shapes graph separate — `dpv-pd`'s SHACL constraints target `dpv-pd:Identifier` via `sh:targetClass`, never `owl:imports`. **The composition rule consumers need is: load the class graph, load the shape graph(s) for the active validation context, treat advisory annotations as out-of-band documentation.** Materialising "as one graph for query" is a consumer choice — and is dangerous (it leaks closed-world cardinality into open-world reasoning). The ODR-0004 rule should explicitly say: **consumers MAY union the graphs for SPARQL but MUST NOT treat the union as the model theory** — that is the DPV-validation lesson translated to the OPDA setting.

**Pair vote draft:** **FOR Rule 3** with a one-line addition under "Enforcement": "Consumers materialising the three graphs as one for query purposes MUST document the union as a query-time view, not as the canonical model theory; SHACL `sh:count` constraints MUST NOT be interpreted as OWL cardinality restrictions even when both target the same property."

### Q4 — Term-sourcing precedence (DEPTH)

**Baker (DCMI Usage Board lead — load-bearing on this question):** Rule 7's three-line precedence — **W3C spec > business glossary > schema text** — is the right order; the substantive question is *how a conflict is recorded*. The DCMI Usage Board admission test (Baker, Bechhofer, Isaac, Miles 2013, *Key Choices in the Design of Simple Knowledge Organization System (SKOS)*, §Design choices; DCMI Usage Board *Guidelines for Dublin Core Application Profiles*, 2009 §3.2) treats precedence conflicts as **first-class governance events**, not editorial cleanups.

The DCMI discipline has four parts:

1. **Provenance attribution on every term.** Every minted class/property carries `dct:source` resolving to the authoritative source (W3C spec section, glossary row, or canonical schema-leaf path). ODR-0004 Rule 7 says this; ratify.
2. **Conflict is recorded, not silently resolved.** When the business glossary and the data-dictionary leaf disagree on a definition (e.g. the glossary says `Buyer` = "the party acquiring beneficial title" and the schema leaf comment says "the party named in the contract of sale"), the conflict is recorded as a `## Change log` row in the *consuming* module ODR (per ODR-0002 §Change log discipline — Session 002 Q3 retired the parallel-amendment-ODR pattern; conflicts now live in-record). The row attributes the resolution to the Council session that authored it.
3. **External spec wins, but the loser is preserved.** Where the W3C spec definition prevails over the glossary or schema text, the glossary/schema definition is preserved as `skos:note` or `rdfs:isDefinedBy` pointing at the local-context note — not deleted. The DCMI lesson (from the SKOS admission negotiations, 2003–2009): "the definition you reject this round becomes the definition someone re-litigates in five years' time unless you record why it was rejected".
4. **Glossary is the ubiquitous-language authority *within* OPDA; the data dictionary is the canonical *schema-leaf* source.** When they appear to conflict (e.g. glossary `Trust Framework` vs schema text `TrustFramework`), the conflict is editorial (label form) not semantic (definition); editorial conflicts default to glossary preference because the glossary is the project-wide ubiquitous-language authority and the data dictionary is per-leaf scope.

The DCMI Usage Board's procedural discipline (single record, change-log governance, named voter on every admission) is *exactly* what ODR-0002 Session 002 Q3 adopted for OPDA's vocabulary catalogue. Apply the same pattern here: every term-sourcing conflict is a Change Log row in the consuming module ODR, attributed to the Council session that resolved it.

**Pandit:** Ratify Baker's depth. From the DPV side, the personal-data class hierarchy (`dpv-pd:Identifier`, `dpv-pd:OfficialID`, `dpv-pd:FinancialInformation`) was assembled by exactly this discipline (Pandit et al. 2024, DPV §History): where the GDPR text (regulatory authority — W3C-equivalent for the legal domain) named a category, the DPV definition was bound to the regulation's wording; where the GDPR was silent, DPV's editorial-process decision was the source. The audit trail of which terms came from where is what makes DPV defensible in front of a Data Protection Authority. The same audit-trail requirement applies to OPDA's term-sourcing — the trust framework consumers (lenders, conveyancers, ICO) will want to know which terms came from W3C, which from glossary, which from schema.

One DPV-specific addition: where a term originates from a regulatory or trust-framework authority that is *not* a W3C spec but is normative for the OPDA context (e.g. the FCA Consumer Duty, HMLR Practice Guide 1, the ICO Personal Data Guidance, the Property Data Trust Framework v3 itself), that authority sits **between W3C spec and business glossary** in the precedence order. The two-line precedence becomes a four-line precedence:

**Refined precedence:** W3C spec > regulatory/trust-framework authority > business glossary > schema text.

This is the DPV ordering (Pandit 2024, *EuroSec'24 keynote on DPV governance* — "the trust framework is normative within its domain even where the W3C is silent").

**Pair vote draft on Q4:** **FOR Rule 7 as drafted, with two amendments:**

- **Amendment 1 (Baker — DCMI Usage Board discipline):** Conflicts between glossary and schema text are recorded as a `## Change log` row in the consuming module ODR, attributed to the resolving Council session. Rejected definitions are preserved as `skos:note` / `rdfs:isDefinedBy`, not deleted.
- **Amendment 2 (Pandit — DPV governance discipline):** Refine the precedence to four lines: **W3C spec > regulatory/trust-framework authority > business glossary > schema text**. Where a regulatory or trust-framework authority is normative for the OPDA context, it sits between W3C and the OPDA glossary.

Vote: FOR Rule 7 + Amendments 1 + 2.

### Q5 — Generator-first

**Baker:** Ratify Rule 6. DCMI's own tooling discipline — the generator producing the `dcterms.ttl` file from the upstream source documents — is the textbook precedent. The mechanical half (named slot → `DatatypeProperty` with `xsd:` range, `rdfs:domain` the enclosing object's class, `rdfs:comment` drawn from the data-dictionary canonical schema-leaf path) is *generated* in DCMI; the editorial half (label tightening, definition reconciliation, scope-note authoring) is hand-authored by the Usage Board. ODR-0004 inherits the right architecture.

**Pandit:** Ratify. DPV's `dpv-pd` taxonomy is generated from the DPV editorial source (Pandit 2024, DPV §Tooling); the generator is version-controlled, the input format is documented, the runner is invoked by CI. One operational addition Knublauch will demand: **the generator's input format, runner version, and output diff must be version-controlled and reviewable** — otherwise the generator becomes a black box. ODR-0004 should explicitly say the generator spec lives at a named path (candidate: `source/03-standards/ontology/generator/`) with: (i) input format documentation, (ii) runner version pin, (iii) CI hook that regenerates and diffs against the committed TTL, (iv) the diff reviewable in PR.

**Pair vote draft:** **FOR Rule 6** with a one-line addition under "Enforcement": "The generator spec, input format, runner version pin, and CI regenerate-and-diff hook are version-controlled at a named path (candidate: `source/03-standards/ontology/generator/`). The TTL diff is reviewable in PR; unreviewed regenerations are a methodology violation."

### Q6 — Diagnostic-exemplar policy

**Baker:** Ratify Rule 8. The exemplar set (registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split) is the right three-or-four canonical case base for stressing identity criteria. DCMI's analogue is the *test description set* used in the DCAP profile authoring (Singapore Framework §3 — test description sets are admitted, non-deliverable, used to validate the profile against named worked cases). Stored alongside the ontology source, filename convention `exemplar-<slug>.ttl` (or analogue), cited from the consuming module ODR's `## References` via path.

**Pandit:** Ratify. DPV's worked-instance exemplars (the consent-receipt instances exercised against the SHACL profile in Pandit et al. 2024, *DPV 2.0 Reference Manual* §Examples) are the DPV analogue. One operational addition: **exemplars are cited from the IC-discharging ODR (ODR-0005) by path AND by the named hard case they stress**, so a reviewer can see "this exemplar validates IC over UPRN-split hard case" without having to read the TTL.

**Pair vote draft:** **FOR Rule 8** with a one-line addition: "Exemplars cited from a consuming module ODR (first: ODR-0005) carry both the path to the exemplar TTL AND a one-line description of which named hard case the exemplar stresses (e.g. `exemplar-uprn-split.ttl — stresses IC over UPRN merger/split hard case`)."

### Q7 — Namespace string and version scheme (DEPTH)

**Baker (DCMI namespace policy — load-bearing on this question):** ODR-0004 correctly **does not decide** the literal namespace string or versioning scheme — it scopes them as WG-owned open questions. Our role is to surface the trade-offs the WG must rule on, not to pre-empt them. DCMI's own namespace history (Baker 2013, *Dublin Core Application Profiles: A Current View*, §History; DCMI Usage Board *Namespace Policy*, 2009 revision) carries the relevant precedent.

**Namespace string — trade-offs:**

| Option | Pros | Cons |
|---|---|---|
| `https://opda.uk/ns/` | OPDA institutional brand; short; aligns with the consortium's web domain; symmetric with W3C / FIBO / DPV (institutional roots) | Bound to OPDA's continued ownership of `opda.uk`; if the consortium re-branded or dissolved, the URI persistence commitment requires a successor body |
| `https://trust.propdata.org.uk/ontology/` | Domain-descriptive (trust framework name visible in URI); aligns with the trust framework's public-facing name | Longer; bound to the trust framework's name persistence; conflates the trust-framework brand with the ontology namespace (DCMI lesson — keep the namespace stable across brand changes) |
| `https://w3id.org/opda/` (third option not in ODR-0004) | W3C Community Group neutral resolver (the DPV pattern — `https://w3id.org/dpv`); namespace persistence guaranteed by the W3C Permanent Identifier Community Group; survives consortium re-branding | Requires opening a `w3id.org` repo PR; adds an upstream dependency on the W3C PICG; OPDA-brand visibility lower in the URI |

**Baker's recommendation to the WG (criteria, not decision):**

1. **Persistence guarantee comes first.** Whichever namespace is chosen, the OPDA WG must commit (in writing, in the OPDA constitution or equivalent) to maintaining dereferenceability for ≥10 years, with a documented succession plan. DCMI's 1995-onwards persistence of `http://purl.org/dc/elements/1.1/` is the bar.
2. **Brand-stability test.** The chosen URI must survive a consortium re-brand. The DCMI history (Dublin → DCMI → DCMI/ASIS&T affiliation) shows that namespace strings outlive the institutions that minted them; choose one that won't embarrass the project in a decade.
3. **Symmetry with peer programmes.** `https://w3id.org/opda/` is the DPV-symmetric option and lowers the OPDA-side maintenance burden. Worth WG consideration even if not in ODR-0004's draft list.

**Versioning scheme — trade-offs:**

| Scheme | Pros | Cons |
|---|---|---|
| **Calendar** (`opda:2026/`, `opda:2026-05/`) | Plain; matches programme cadence; aligns with Cool URIs persistence (the version IRI is stable forever; the version-less namespace is the "current" view) | Versions are not semantically meaningful (`2026-05` ≠ `breaking change`); consumer can't predict compatibility from version string alone |
| **Semantic** (`opda:3.4.0/`, mirroring PDTF schema 3.4.0) | Semantically meaningful breaks (`3.x → 4.0` = breaking; `3.4.x → 3.5.0` = additive); aligns with PDTF schema version (one number, two domains) | Risk of conflating ontology version with schema version when they evolve at different cadences; semantic versioning requires a published change-classification rule (what counts as breaking?) |
| **Hybrid** (calendar + semantic — DCMI uses this: `dc/elements/1.1/` is semantic, `dcterms/` is undated stable) | Allows the namespace itself to be stable (no version in the URI) and version IRIs to be calendar or semantic by choice | More machinery; harder to explain |

**Baker's recommendation to the WG (criteria):**

1. **The namespace string MUST NOT carry the version.** The DCMI lesson (Baker 2013, §History — `http://purl.org/dc/elements/1.1/` is a stable URI; the `1.1` is the namespace's *identity*, not a version). The `owl:versionIRI` carries the version; the namespace is undated.
2. **If aligning to PDTF schema versions, declare the alignment rule explicitly.** "When PDTF schema 3.4.0 → 3.5.0 (additive), the ontology `owl:versionIRI` increments minor; when PDTF 3.x → 4.0 (breaking), the ontology increments major" — that rule must be in the ODR or it will be re-litigated.
3. **Calendar is the safer default for a programme that hasn't yet shipped a breaking change.** The Foundation spike is by definition pre-breaking; calendar versioning (`owl:versionIRI` = year-month of issue) gives the WG room to commit to semantic versioning later without breaking the namespace.

**Pandit:** Ratify Baker's depth. DPV's experience (Pandit 2024, DPV §Versioning) is that semantic versioning under `https://w3id.org/dpv/<version>/` works for the Core ontology, but is brittle for the family (`dpv-pd`, `dpv-gdpr`, `dpv-legal`) when sub-modules evolve at different cadences. The OPDA programme has the same family-of-modules shape (Foundation + 11 modules + cross-cutting). The DPV lesson: **version each module independently**; the umbrella namespace is undated; per-module `owl:versionIRI` carries the per-module version. This survives module-cadence divergence.

**Pair vote draft on Q7:** **FOR ODR-0004 deferring both decisions to the WG** (per the current draft). We are **NOT voting on the WG-owned strings**; we are recommending criteria for the WG to apply. The criteria: (1) persistence guarantee + succession plan; (2) brand-stability test; (3) symmetry with peer programmes (`w3id.org` consideration); (4) namespace MUST NOT carry the version; (5) per-module `owl:versionIRI` independence; (6) calendar is the safer default pre-breaking, semantic if and only if a change-classification rule is published.

Vote: FOR Rule 1 + 4 as drafted (WG retains authority); FOR the criteria above being added to ODR-0004's "References — Open questions (WG-owned)" section as guidance for the WG.

## Replies to anticipated DA (Knublauch) attacks

### Knublauch on Q3 — graph composition is operationally underspecified

We anticipate Knublauch attacks Rule 3 on operational grounds: *"separate graphs is correct as a discipline, but ODR-0004 doesn't say how a consumer materialises the union for query, how `sh:targetClass` resolves prefixes across graphs, and what happens when the shapes graph references an OWL class that hasn't loaded yet"*.

**Our pair reply:** Ratify Knublauch's attack as a strengthening amendment. The Q3 amendment above (Pandit's contribution) addresses part of it: consumers MAY union for SPARQL but MUST NOT treat the union as model theory; SHACL `sh:count` ≠ OWL cardinality. **Additional clarification:** the `sh:prefixes` declaration node (Rule 4) ensures SHACL-SPARQL prefix resolution; the shapes graph SHOULD declare which class-graph version it targets via `void:target` or a comparable predicate, so a consumer loading the shapes graph against a stale class graph gets a documented mismatch rather than a silent inconsistency. This is operational specification, not a substantive change to Rule 3.

### Knublauch on Q5 — generator policy is too soft

We anticipate Knublauch attacks Rule 6 on operational grounds: *"generator-first is correct, but ODR-0004 doesn't pin the input format, the runner version, the CI hook, or the review discipline; without those, the generator is a hand-wave"*.

**Our pair reply:** Ratify Knublauch's attack as a strengthening amendment. The Q5 amendment above (Pandit's contribution) addresses it directly: the generator spec lives at a named path, with input-format documentation, runner version pin, CI regenerate-and-diff hook, PR-reviewable diff. The amendment makes Rule 6 operational rather than aspirational.

---

**Cross-references.** Our pair positions on Q4 (term-sourcing precedence with regulatory-authority insertion) and Q5 (generator audit trail) feed forward into ODR-0008 (descriptive attributes — `dct:source` discipline), ODR-0011 (enumeration vocabularies — SKOS `prefLabel` sourcing), ODR-0012 (data-governance layer — DPV-specific term-sourcing for regulatory authority), and ODR-0013 (SHACL validation — generator-produced shape graphs). Our Q7 namespace criteria feed forward into whatever WG record ratifies the literal base URI.
