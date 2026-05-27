# Allemang + Hendler — Pragmatic-pair position on S004

*Joint position file. The pair is two voices — where Allemang and Hendler
diverge, both are recorded. Where they converge, the pair signs jointly.*

## Pair summary

The Foundation gate is a `kind: architecture` record (ODR-0001 A9-relaxed):
URI policy, header machinery, graph separation, generator/exemplar harness —
not ontological commitments. The pair's load-bearing depth is **Hendler on
Q1 (hash) and Q2 (layer-segregated naming — the URI-policy carrier)**, and
**Allemang on Q5 (generator-first, his Session 001 Q1 amendment) and Q6
(diagnostic exemplars)**. Q3/Q4/Q7 are joint pair voice: three-graph
separation is build-step graph-union; term-sourcing is W3C-spec > glossary
> schema with glossary winning over data-dictionary on divergence; Q7's
namespace string is WG-owned, the policy is not.

---

## Per-question positions

### Q1 — Hash vs slash (Hendler depth)

**Hendler:** Hash. W3C TAG *Cool URIs Don't Change* (2008) and the W3C
note *Cool URIs for the Semantic Web* (Sauermann & Cyganiak, eds.,
2008) — Hash vs Slash §3 — make the call textbook at this scale: a small
TBox (~hundreds of terms, single document) is the canonical
whole-document-dereference case. One GET on the namespace yields the
entire TBox; the fragment identifier picks out the term. No
content-negotiation infrastructure, no 303 redirect chain, no per-term
server endpoint. The slash pattern earns its complexity only when the
TBox is large enough that per-term dereferencing matters operationally
(FIBO scale; OBO scale; UMLS scale) — and even then, only when a real
consumer is asking for it. PDTF Foundation is at the wrong scale; no
named consumer needs slash. Confirm hash; record the scale-trigger under
which slash would be revisited (TBox > ~1k terms in active dereference
traffic, OR named consumer requesting per-term content negotiation).

**Allemang:** Concur. *Working Ontologist* 3rd ed. Ch. 3 makes the same
case pragmatically — every operational facility you take on is one you
have to maintain. Slash + content negotiation is two facilities (URI
rewriting plus content-negotiation logic) for which OPDA has no consumer
today; hash dereferences trivially with a single static-file deploy.

**Pair vote:** Hash. Slash deferred under named scale + consumer trigger.

---

### Q2 — Layer-segregated naming (Hendler depth)

**Hendler:** Confirm. This is the URI-policy load-bearer of S004 — it
makes the Kind/Role distinction (the ontology's whole reason for existing
post-Session 001 Q4) legible from the URI alone. W3C TAG *URIs as
Identity* finding (and the broader linked-data principle that URIs *are*
the identifying surface — Berners-Lee 2006 §1; Heath & Bizer 2011 Ch. 2)
means anyone curling `opda:Property` vs `opda:Proprietor` should *see*
which carries identity and which borrows it without dereferencing both
and parsing OWL. Convention enforced via review (per Session 001 Q3
Guizzardi gate); UFO-aware naming (Substance Kind vs Role / Phase /
Relator, per Guizzardi 2005, *Ontological Foundations for Conceptual
Modeling with Applications*, Ch. 4) aligns with the category lineage.
The URI-pattern rule does NOT need machinery (no per-layer prefix
namespace); it needs a published naming convention plus review.

**Allemang:** Concur — with the working-ontologist caveat that convention
only holds if drafters internalise it. *Working Ontologist* 3rd ed.
Ch. 12: naming discipline that lives only in a style guide and not in
modellers' heads degrades inside six months. The layer prefix is
editorial; the URI just needs to dereference. Enforcement-by-review
(Council reviews; module-ODR drafters follow the convention) is the
right home, not URI-prefix machinery (which would re-import the
per-form prefix problem rejected in S004 Rule 1 alternatives).

**Pair vote:** Layer-segregated naming confirmed; enforcement via Council
review and module-ODR drafting discipline; no per-layer namespace prefix.

---

### Q3 — Three-graph separation

**Joint pair.** Separation IS the discipline that protects open-world (OWL
class graph) from closed-world (SHACL shapes graph) from advisory
(annotation graph). Session 001 Q3 settled this in principle (Gandon +
Knublauch: "the cut that matters operationally is keeping OWL/RDFS class
model and SHACL shapes in separate graphs; open-world vs closed-world
must not leak"); S004 records the operational rule.

Composition is a build-step `graph-union` operation — the consumer
materialises the working graph by reading both the TBox and the shapes
graph and merging them in-memory. This is NOT runtime `owl:imports` from
shapes to classes (which would re-import the closed-world cardinality
into the open-world inference, exactly the leak Gandon flagged).

SHACL targets classes via `sh:targetClass` (SHACL Core §1.1.3 — Knublauch
& Kontokostas, eds., W3C Rec 2017, carried into SHACL 1.2 per ODR-0002
Core pin) — the cross-graph hook that doesn't require import. The shapes
graph *names* classes from the class graph but does not *import* them;
the annotation graph (where the exiled `opda:aiHint` lives, per Session
001 Q5 resolution) is keyed to shape IRIs but again, no import.

ODR-0010 (Overlay Profile Mechanism) inherits the same answer: profile
composition is graph-union over a fixed TBox plus a stack of SHACL profile
graphs, build-step. Foundation fixes the *separation* discipline; ODR-0010
fixes the *composition operator* (the reified `opda:ValidationContext`
per Session 001 Q5 Guarino-amendment).

This is the cross-`architecture` rule-borrowing that ODR-0001 A9's
artefact-identity test would flag as a `pattern`-extraction candidate IF
the rule passed re-instantiability — but graph-union over OWL/SHACL/
annotation is constitutively about *artefact topology*, not about what
kinds of entities exist in the domain. Stays inside `architecture` per A9.

Enforcement (per ODR-0004 Rule 3): no `owl:imports` from shapes to
classes; no property carries an OWL cardinality restriction and a SHACL
count constraint as if equivalent; advisory annotations absent from the
shapes graph. The lint checks these mechanically once the base URI is fixed.

---

### Q4 — Term-sourcing precedence

**Joint pair.** Precedence as stated in ODR-0004 Rule 7: **W3C / external
standard > business glossary > schema text.**

**Hendler frame (URI-authority precedence).** A `Verifiable Credential`
is defined by W3C VCDM 2.0 Rec; `LEI` by ISO 17442 (GLEIF maintained);
`Issuer` / `Verifier` / `Holder` by VCDM and DID Core; `Agent` by PROV-O;
`Concept` by SKOS. The W3C-spec tier reflects that a published, stable,
authoritative URI already exists — minting a parallel definition under
`opda:` would violate Linked Data Principle 3 and the FIBO discipline
(ODR-0002 §Reference-not-import): canonical URIs used; local SHACL
written; no `owl:imports` of the whole external vocabulary, just
reference and local constraint.

**Allemang frame (glossary-vs-dictionary tie-break).** Below the W3C
tier, when the **business glossary** and the **data dictionary** diverge
on the same leaf — the glossary says "Proprietor: the person registered
as legal owner of a title," the dictionary's
`propertyPack.titles[].registeredProprietors[].name` row says "name of
the natural person on the register" — **glossary wins**. The dictionary
documents the *encoding*; the glossary fixes the *meaning*. *Working
Ontologist* 3rd ed. Ch. 6: the glossary is the authority of last resort
for what a term *means*. Divergences land as Change-log rows (per
Session 002 §Change log) with attribution: who flagged, what each says,
which was authoritative.

**Joint enforcement** (ODR-0004 Rule 7): every minted class/property
carries `dct:source` to glossary row OR canonical schema-leaf path;
labels/definitions on glossary-named concepts match the glossary. Lint
enforces `dct:source` presence; review checks glossary-name match.

**Downstream consumers:** ODR-0008 (descriptive attributes — bulk of
generator output), ODR-0011 (enumerations as SKOS schemes), ODR-0013
(SHACL `sh:message` text from glossary). The term-sourcing convention is
the shared substrate.

---

### Q5 — Generator-first policy (Allemang depth)

**Allemang:** This is the Session 001 Q1 amendment landing. Generator-first
for the mechanical slot→property half — a named slot with a scalar datatype
becomes an `opda:` `DatatypeProperty` with the corresponding `xsd:` range,
`rdfs:domain` the enclosing object's class, `rdfs:comment` drawn from the
data dictionary, `rdfs:label` / `skos:prefLabel` drawn from the glossary
if the leaf matches a glossary term, `dct:source` to the canonical
schema-leaf path.

Operational specification:

- **Generator input:** `source/00-deliverables/semantic-models/data-dictionary-canonical.json`
  (1,557-leaf inventory, 935 annotated, per ODR-0004 References) — the
  canonical JSON form. Per-overlay form-question annotations
  (`baspi5Ref`, `ntsRef`, `ta6Ref`) pass through to `dct:source` triples
  but do not drive generator decisions. Dictionary IS canonical input;
  JSON Schema source is recoverable from it.
- **Generator location:** `tools/generator/` under the repo root, peer
  to `source/` and `scripts/` — build infrastructure, not deliverable.
- **Runner:** `npm run ontology:generate` from `package.json`. CI invokes
  on every commit touching the dictionary or generator source;
  regenerated TTL is committed alongside the dictionary diff (PRs show
  both sides of the mapping).
- **Version-control entry:** generator OUTPUT tracked (`foundation.ttl`
  + per-module TTLs); INPUT tracked (canonical dictionary JSON);
  INTERMEDIATE artefacts (parser AST cache, scratch) `.gitignored`.
- **Reviewable diff:** deterministic generator (input → output is a
  function) means PRs show the TTL diff alongside the dictionary diff.
  Reviewers verify the mechanical translation directly — the
  auditability discipline that distinguishes "generator-first" from
  "magic build step."

The Council's job during ratification is the 15% the generator *can't*
do: aggregate boundaries; cross-overlay synonymy; `oneOf` discrimination
(sub-class vs enumerated state vs discriminated union, per Session 001 Q1).

**Hendler:** Concur with one web-architecture caveat — generator MUST be
deterministic. Same input MUST produce byte-identical output (modulo
header timestamps). Reason: `owl:versionIRI` records the generator
version itself, so a consumer fetching `opda:foundation/v2026-q3` can
audit which generator produced it. Non-determinism breaks the audit.
Operationally: generator releases tagged semver; version baked into
build output; `owl:versionIRI` carries both ontology version AND
generator version (e.g. `…/foundation/v2026-q3/gen-1.2.0`).

**Pair vote:** Generator-first confirmed; deterministic generator;
version-recorded `owl:versionIRI`; output tracked, input tracked,
intermediates gitignored.

---

### Q6 — Diagnostic-exemplar policy (Allemang depth)

**Allemang:** Session 001 Q1 amendment (Guarino DA withdrawal condition;
admitted 11-0-1) is the load-bearing precedent. Canonical exemplar set:

1. **Registered freehold house** — the textbook case. UPRN, single title
   number, registered proprietor; all four ODR-0005 IC mechanisms (UPRN
   key, title-number key, INSPIRE polygon, address tuple) resolve
   consistently.
2. **Unregistered house pre-first-registration** — the IC stress case.
   UPRN present (GeoPlace before Land Registry); address present; no
   title number; LegalEstate asserted but no `RegisteredTitle` partner.
   Tests: does Property IC tolerate title-absence? does LegalEstate IC
   tolerate no-RegisteredTitle? does `dash:uniqueValueForClass(opda:uprn)`
   still produce a useful constraint?
3. **Flat whose UPRN was split** — the contingent-identifier stress case.
   Original UPRN retired and re-issued as two UPRNs after subdivision.
   Tests Guarino's deeper objection (Session 001 Q4 — UPRN is
   administrative, not rigid). Forces ODR-0005 to commit: does the new
   UPRN identify the *same* Property as the old (no — physical mereology
   changed)? does `owl:hasKey(opda:uprn)` produce nonsense across the
   split (yes — which is why Session 001 Q4 settled on SHACL/DASH
   uniqueness as the primary, checkable mechanism)?

Operational specification:

- **Storage:** `source/03-standards/ontology/exemplars/{name}.ttl` per
  ODR-0004 References (peer to `foundation.ttl` and module TTLs).
- **Filename convention:** descriptive kebab-case
  (`registered-freehold-house.ttl`,
  `unregistered-house-pre-first-registration.ttl`,
  `flat-with-split-uprn.ttl`). Names are the discipline; no numbers.
- **Citation:** ODR-0005's `## Rules` cite the exemplar files by path;
  ODR-0004 records the harness location; module ODRs introducing new ICs
  cite exemplars they pressure-tested against (per ODR-0001 A9
  requirement (b): "an identity criterion stated over named hard cases").
- **Build behaviour:** exemplars NOT folded into the TBox deliverable;
  live in their own directory; `.gitignored` from build output but
  tracked in repo. TBox/ABox is the *deliverable* boundary, not the
  *thinking* boundary (Session 001 Q1 framing, now canonical per A9).

**Hendler:** Concur. The exemplar policy is the load-bearing test for
ODR-0005's IC discipline per A9. Without exemplars, ODR-0005's claim
that `opda:Property` has IC "spatial-material continuity defined over
demolition / subdivision / merger" is decorative; with exemplars,
testable — the flat-with-split-UPRN exemplar IS the test of "subdivision."

**Pair vote:** Three canonical exemplars confirmed; storage in
`source/03-standards/ontology/exemplars/`; kebab-case naming; cited by
path from ODR-0005's `## Rules`; non-deliverable.

---

### Q7 — Namespace string + version scheme

**Joint pair, scoping-only.** The pair does NOT decide this — per
ODR-0004 References, the literal base-namespace URI and versioning scheme
are **WG-owned**. (Session 001 Q7 settled the *policy*: single `opda:`
hash namespace, 9-0. What remains is the *string*.) The pair's role is
to scope the trade-offs so the WG can rule cleanly.

**Namespace string trade-offs:**

- `https://opda.uk/ns/` — project-domain authority. OPDA owns the
  domain; aligns with the existing web property and Cloudflare Pages
  deploy chain. Risk: if OPDA's organisational form changes, the W3C TAG
  cool-URIs discipline says you maintain the redirect, not change the
  URI.
- `https://trust.propdata.org.uk/ontology/` — trust-framework-domain
  authority. The ontology is *of* the trust framework, not *of*
  OPDA-the-organisation; if a successor body inherits the trust
  framework, the namespace stays meaningful. Practical difference today
  is zero — the difference is future-proofing of authority.

**Versioning scheme trade-offs:**

- **Calendar** (`v2026-q3`) — mirrors W3C TR convention
  (`REC-shacl12-20260101/`); aligns with FIBO's quarterly Production
  pattern (Kendall + EDM Council practice).
- **Semantic** (`v1.0.0`) — encodes breaking-vs-additive change
  mechanically; aligns with PDTF schema versioning (`3.4.0`, itself
  semver) and the npm-tooling layer.

**WG criteria (pair recommendation):**

1. **Domain authority over namespace.** Whichever body owns the
   long-term commitment to keeping the URI resolving — that body's name
   goes in the domain.
2. **Alignment with schema 3.4.0 versioning.** The schema is semver; if
   the WG wants compatibility-reasoning from version strings alone,
   match.
3. **Persistence commitment.** Hendler's *Spinning the Semantic Web*
   Ch. 7 — changing URIs after publication is effectively infinite cost.
   Commit to 10 years or scope to local-copy consumption (ODR-0004 Rule 5).

The pair surfaces these; the WG rules. The string is a generator input
(Q5 reproducibility caveat).

---

## Replies to anticipated DA attacks

**Knublauch attacks Q3 composition** ("graph-union as runtime cost").
*Reply:* Build-step graph-union is cheap (file-level operation; consumer
reads N files into one in-memory store). The load-bearing case is
*profile composition* (overlay-on-overlay with `sh:and` and `sh:in`
merge), which is ODR-0010 territory. Foundation's three-graph separation
is structural discipline (open-world ⊥ closed-world ⊥ advisory), not a
runtime engine; composition cost lands in the profile ODR where it
belongs.

**Knublauch attacks Q5** ("generator output is fragile"). *Reply:*
Deterministic generator + test harness = reviewable diffs. Same input
→ same output, byte-identical. Breaking input-format change = generator
version bump (recorded in `owl:versionIRI`). Fragility is real for
non-deterministic generators (LLM-driven; heuristic auto-naming);
deterministic-by-discipline is why the diff is PR-reviewable.

**Possible attack on Q6** ("three exemplars is too few"). *Reply:* Three
is the Session 001 Q1 amendment's canonical set, ratified 11-0-1. The
harness is *append-only* — module ODRs can add exemplars to
pressure-test their own ICs (per ODR-0001 A9 requirement (b)). Foundation
fixes the canonical three and the storage convention; ODR-0005 adds a
fourth if it needs one.

**Possible attack on Q4** ("glossary-wins risks decorative updates").
*Reply:* Change-log discipline (Session 002 §Change log) is the immune
system. Divergent glossary updates land as Change-log rows with
attribution and reason; lint enforces `dct:source` presence; review
enforces divergence-resolution.

---

## Joint pair votes

- **Q1 — Hash vs slash:** Hash. **AGREE.**
- **Q2 — Layer-segregated naming:** Convention via review; no URI-prefix
  machinery. **AGREE.**
- **Q5 — Generator-first:** Confirmed per Session 001 Q1; deterministic;
  `tools/generator/`; output tracked; `npm run ontology:generate`. **AGREE.**
- **Q6 — Diagnostic exemplars:** Three canonical exemplars; storage at
  `source/03-standards/ontology/exemplars/`; kebab-case; non-deliverable;
  cited by path from ODR-0005. **AGREE.**
