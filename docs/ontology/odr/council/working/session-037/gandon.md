# Gandon — Session 037 verdicts (opda/pdtf URL scheme)

Lens: AWWW (Architecture of the World Wide Web, W3C Rec 2004), Cool URIs for the
Semantic Web (Sauermann & Cyganiak, W3C Note 2008), httpRange-14 (TAG resolution,
2005-06-15), OWL 2 Structural Spec §3 (versioning), RDF 1.1. No anonymous "best
practice" — every position below traces to one of these.

Standing reminder for the panel: the proposal **reverses** a council-ratified
decision (ODR-0004 §Rules.1, single `opda:` HASH namespace, 9-0, S004) on
*pre-publication greenfield* grounds. ODR-0004 §Consequences and ADR-0006 §More
Information both recorded a **concrete reopening trigger**: "any single ontology
file exceeds 1,000 terms in active dereference traffic OR a named consumer
requests per-term content negotiation." On the EVIDENCE numbers (147 terms +
enums, no named consumer) **neither limb is met**. The greenfield ground is a
*cost* argument (it's cheap to change now), not a *correctness* argument (that
slash is better). Several of my verdicts below turn on keeping those two apart.

---

**Gandon: Q1 — Org/standard split + base path. AFFIRM. Ballot: 9-0 AFFIRM.**

`https://w3id.org/opda/pdtf/` is web-architecturally clean and I endorse it
without reservation. AWWW §2.2.2.1 (URI ownership) treats the path as a
delegation hierarchy: the authority that owns `w3id.org/opda/` (the
organisation) delegates `…/opda/pdtf/` to a standard it stewards. Org-then-
standard mirrors exactly the structure DPV uses under the *same* PICG host
(`w3id.org/dpv/`, where `dpv` is the standard the DPVCG stewards) — the cited
precedent supports the *shape*, even where it diverges on hash (Q2). A single
`w3id.org/opda/` (no standard segment) would foreclose a future second OPDA
standard sharing the org root; `w3id.org/pdtf/` would couple the persistent
identifier to the standard name and lose the org delegation point that the PICG
persistence guarantee (ADR-0006 driver 1) exists to protect. The chosen base
gets both right. The `/pdtf/` vs `/harness/` partition is a separate question
(Q5) and does not affect dereferenceability of the base itself.

---

**Gandon: Q2 — Hash vs slash. REVISE the proposition / REJECT rule 2. Ballot: REVISE-leaning-REJECT (revert to ODR-0004 hash now).**

Disposition note (sharpened with Baker): the verdict is REJECT *rule 2 of the
proposition* (slash, overriding ODR-0004), not a clean REJECT of the question —
the base path (Q1) and the no-version-in-IRI principle (Q3) survive regardless,
so "REVISE the proposition, reject its rule 2" is the precise marking. **The
decisive ground is that rule 2 fails its own governing test:** ADR-0006
(inheriting ODR-0004 §Consequences) already wrote down when slash earns its keep
— "≥1,000 terms in active dereference traffic OR a named consumer requests
per-term content-negotiation" — and *both limbs are unmet* (147 terms, no named
consumer). The greenfield-cost argument is necessary but not sufficient: it shows
a switch is cheap, not that it is warranted. On the council's own criteria the
override lacks grounds. So: **revert to the ODR-0004 hash namespace now**
(Option H below); adopt slash only when a reopening trigger fires — and then as
DPV's **slash-to-module + hash-within** hybrid, never flat slash (which would
take Recipe 4/6 dereference cost at Recipe 3 scale — the worst trade).

This is my primary lens and the one place the proposal is, as written, not yet
web-architecturally complete.

Slash-per-term is *not wrong* — it is the more scalable shape and many large
W3C vocabularies use it. My objection is narrower and load-bearing: **rule 2 as
drafted adopts slash but is silent on the dereference mechanics that slash
*requires*.** Under httpRange-14 (TAG resolution, 2005-06-15), a slash URI that
denotes a *class or property* (a non-information resource) MUST, on a `GET`,
either (a) return **303 See Other** redirecting to a describing document, or
(b) return **200** if the URI is treated as an information resource — and you do
not get to be ambiguous about which. Cool URIs (W3C Note 2008, §4.1–4.3) names
exactly two conformant patterns:

- **Hash URIs** (§4.1): `…/pdtf#Property`. One `GET` on `…/pdtf` returns the
  whole document; fragments are resolved **client-side** with **zero extra HTTP
  round-trips and no 303**. The Note states this is the pattern "for **smaller**
  and **stable** sets of resources … that evolve together."
- **303 slash URIs** (§4.2): `…/pdtf/Property` → 303 → a description. Conformant,
  but it costs an **extra HTTP round-trip per term** and requires per-term
  server-side redirect rules (or content negotiation) that the proposal does not
  specify and that w3id.org's flat rewrite (ADR-0006 §Redirect, a single
  `RewriteRule … [R=302,L]`) does **not** by itself provide.

opda is the textbook §4.1 case: ~147 terms, one vocabulary, evolving together,
no consumer asking for per-term negotiation. Cool URIs §4.3 ("Choosing between
303 and hash") explicitly favours hash when "the number of resources is small …
and they are not expected to grow into the millions" and when "you want to
minimise the number of HTTP requests." Adopting bare slash here takes the *more
expensive to serve correctly* option and spends the extra cost to buy a
scalability headroom (millions of terms) the reopening trigger itself says opda
does not have.

DPV is being read in EVIDENCE as a hash precedent; the precise structure
(verified against the DPV serialisations) is **slash-to-the-module, hash-within**:
`w3id.org/dpv/pd#Address`, `w3id.org/dpv/legal/eu/gdpr#A6-1-a`. The hash there is
doing real work — each module is one dereferenceable document. So DPV is a
*counter-precedent* to bare slash-per-term, not support for it.

Baker (DCMI/SKOS) raised the W3C "Best Practice Recipes for Publishing RDF
Vocabularies" (Berrueta & Phipps, W3C WG Note 2008) — Recipe 3 (hash) for small
one-document vocabularies, Recipe 4 (303/slash) for large or partitioned ones —
which corroborates the Cool URIs read and adds the operational point. His
question: does opda's multi-artefact growth (data-dictionary 582 + 31 profiles +
SKOS schemes, all one authority) tip it past Recipe 3's "fits one document"
threshold into Recipe 4 territory? **No — and this is the decisive interaction
with Q5.** The `/pdtf/` vs `/harness/` partition already performs the
partitioning Recipe 4 contemplates: the data-dictionary and instance data live
in `/harness/`, *not* in the term namespace. What actually sits at
`…/opda/pdtf/` is the ~147 classes/properties + the SKOS concept schemes — one
co-evolving document. So the Recipe's "partitioned" branch is satisfied at the
`/pdtf/`–`/harness/` seam, and *inside* the term space we are squarely Recipe 3
(hash). The multi-artefact-ness lives in the harness; `/pdtf/` is
mono-artefact-small. That makes hash on `/pdtf/` the *stronger* call, not merely
the defensible one. (The SKOS schemes are the one watch-item: if they grow large
or get dereferenced selectively, that is the natural future module seam — and
exactly the ODR-0004 reopening trigger.)

**Q2↔Q5 are one move, not two (flag for the synthesis).** The Q5 `/harness/`
split is precisely what keeps the term namespace small enough for Q2's hash. So
the two verdicts mutually reinforce: adopt the `/harness/` split *and* hash —
they are a single coherent design, not two independent calls. The corollary
matters for the vote: if Q5's split were rejected (a flat-everything-namespace
counter), the term space would absorb the data-dictionary's 582 + the 31
profiles + the schemes, and the Recipe-4 threshold argument would come much
closer — so a vote to flatten away the standard-vs-harness partition *also
weakens the hash case*. Anyone proposing to collapse Q5 should be told they are
implicitly reopening Q2.

**Recommend a third, vocabulary-shaped reopening trigger (Baker's suggestion,
which I endorse).** Alongside the ADR's "≥1,000 terms / named per-term-
negotiation consumer" triggers, name explicitly: *"a SKOS concept scheme grows
large enough, or is dereferenced selectively enough, to warrant its own
document."* That is the most likely first mover for opda given its
controlled-vocabulary shape, and it gives the WG a trigger keyed to the actual
artefact rather than only to a global count. When it fires, the response is to
give that scheme its own module document (DPV-style slash-to-module +
hash-within), not to flatten the whole vocabulary to slash.

Baker's closing point is the one I want the synthesis to carry: a slash URI that
does **not** dereference is strictly *worse* than a hash file that always
resolves (AWWW §3.1, availability of representations). w3id.org's single flat
rewrite (ADR-0006 §Redirect) does not provide per-term 303 for free. So the
slash option is not "free to adopt and wire up later" — adopting it *is* a
commitment to build per-term resolution.

**Amendment (REVISE) — pick one of two conformant realisations, do not leave
rule 2 silent:**

> Option H (my recommendation, lowest cost, matches size): retain a **hash**
> within the slash standard segment — `https://w3id.org/opda/pdtf#Property`. One
> 200 GET on `…/opda/pdtf` returns the whole vocabulary; the existing flat
> w3id rewrite suffices; no 303 machinery; httpRange-14 satisfied by
> construction. This also *minimally* disturbs ODR-0004's ratified hash decision
> (the hash survives; only the org/standard path and the `/harness/` split are
> new), which lowers the bar on the greenfield override.
>
> *Scope of Option H (confirmed with Pandit, so the record does not overclaim):*
> the hash applies to **all** standard entities alike — `…/pdtf#Property`,
> `…/pdtf#PropertyShape`, and the SKOS concepts/schemes `…/pdtf#role/Buyer`,
> `…/pdtf#role`. SKOS concepts as fragments is correct: concept-scheme membership
> is carried by `skos:inScheme` / `skos:topConceptOf` triples, **not** by URI
> path or prefix — scheme identity is an assertion, not a slug. Option H composes
> cleanly and orthogonally with the other rulings: `opda` (org, Q1) + `pdtf`
> (standard segment, Q1) + `#term` (fragment, Q2). It does **not** reintroduce a
> module segment, so **Q4's flat namespace is preserved** (all terms + concepts
> are flat fragments of one document); and the hash lives only inside `/pdtf/`,
> so **Q5's standard/harness split is preserved** (`/harness/` resources are
> addressed per their own kind — documents 200-on-GET, fragments-of-documents by
> hash, per my Q5 rider). Honest consequence, not an objection: the single
> `/pdtf` document then carries every term + every SKOS concept + every scheme;
> at ~147 terms plus the enum/concept set that is well inside the one-document
> envelope, and the SKOS-scheme growth trigger above is the pre-agreed exit.
>
> Option S (if the council wants slash terms regardless): keep
> `…/opda/pdtf/Property` **but** add a rule 2a obligating the build to serve
> **303 See Other** (or 200-with-content-negotiation) per term, and amend
> ADR-0006's redirect section to specify the per-term rewrite/negotiation — slash
> term URIs that 302/200 to an HTML page without a `text/turtle` representation
> would be a live httpRange-14 violation and an AWWW §3.1 (representation
> availability) defect.

**Joint dereference-infrastructure rider (co-signed, Gandon + Pandit).** For the
record verbatim, attaching to whichever option the council takes: *"Bare slash
per-term URIs are admissible ONLY if opda builds and maintains per-term content
negotiation at the hosting target; w3id.org's single flat 302 rewrite does not
provide it. Absent that build, slash either wastes a redirect round-trip (the
consumer parses the whole graph anyway) or leaves an httpRange-14 ambiguity about
what the 302 target denotes. Option H (hash within the `/pdtf/` segment) avoids
both with zero added infrastructure and is the recommended form."*

I will REJECT "slash, no hash, no stated dereference mechanics" — that is the
one option that is web-architecturally under-specified. Either H or S is
conformant; my ballot is REVISE toward H.

**Convergence on the record.** Pandit (DPV principal author) confirms DPV's
hash-within-module was driven by exactly this operational reality — one fetch
retrieves the module, the fragment selects the term, no per-term redirect/hosting
config — and reads opda's bare slash as forcing the same dilemma: either a
redirect that 200s a whole-graph document with no per-term negotiation (a paid
round-trip for nothing) or net-new per-term content-negotiation hosting that
w3id.org's flat 302 does not provide. He aligns on hash for opda's size. So on
Q2 the hash position is now held by the original directing-authority decision
(ODR-0004, 9-0), DPV's principal author (Pandit), and two web-architects
(Baker via the W3C Recipes, and me via Cool URIs / httpRange-14). That weight
should bear directly on whether the greenfield-cost override is warranted *for
Q2 specifically* — the override is cheap, but here it spends conformance and
infrastructure simplicity to buy scalability headroom the reopening trigger says
opda does not need.

---

**Gandon: Q3 — Versioning. REVISE. Ballot: REVISE (versionIRI is mandatory).**

The unversioned *namespace* IRI is correct and I affirm it — minting terms at a
version-free IRI (`…/pdtf/Property`, not `…/pdtf/1.0.0/Property`) is the DPV
practice and avoids the slash→hash-class of costly migration the persistence
guarantee exists to prevent. AWWW §3.5.1 (URI persistence): version should not
leak into the resource identity.

But rule 3 as drafted — "version carried by an `owl:versionInfo` literal" — is
**under-specified against OWL 2**. OWL 2 Structural Specification §3.1
distinguishes two annotations with different roles:

- `owl:versionInfo` — an **annotation** carrying a *human-readable* version
  string. It is informative only; it has no machine-actionable identity
  semantics.
- `owl:versionIRI` — the **version identity** of the ontology. OWL 2 §3.1: an
  ontology is identified by its `ontologyIRI` (the persistent
  `…/opda/pdtf/`) **and** optionally an `owl:versionIRI` that names *this
  specific version*. Tools (Protégé, the OWL API, import resolvers) use
  `versionIRI` to distinguish and pin releases; `versionInfo` they ignore for
  identity.

Dropping `versionIRI` entirely means no machine-resolvable handle on a frozen
release — an `owl:imports` cannot pin a version, and a consumer cannot
content-negotiate "give me 1.0.0" vs "give me current." Note ODR-0004 §6a/§Rules
already mandated `owl:versionIRI` in the ontology header; rule 3 would silently
retract that.

**Amendment (REVISE):** keep the version-free **ontology IRI** as the term
namespace; carry version on the header as **both** `owl:versionIRI`
(machine-actionable, e.g. `https://w3id.org/opda/pdtf/1.0.0` — note: the
*ontology* version IRI, not the term namespace) **and** `owl:versionInfo` (human
string `"1.0.0"`). This is the DPV pattern (unversioned term namespace +
per-release versioned ontology IRI + dated release docs) and OWL 2 §3.1
conformant. The harness namespace (Q5) is the natural home for any
dated/snapshot release *documents* the build wants to keep addressable.

---

**Gandon: Q4 — Flat term namespace. AFFIRM (with a recorded caveat). Ballot: 8-1 AFFIRM.**

Web-architecturally a flat term namespace is sound. Cool URIs imposes no
requirement that path structure mirror conceptual modules; AWWW §2.1 treats the
URI as opaque to its consumers — a client dereferencing `…/pdtf/Property` neither
knows nor cares which TTL file contributed it. Flattening does not harm
dereferenceability.

The caveat (why I do not give a clean AFFIRM): both cited prior arts segment
(hm `…/ns/pf/`, `…/ns/sds/`; DPV `/dpv/pd`, `/dpv/legal`), and in both, the
module segment is what makes each module a *separately dereferenceable
document*. Flattening forfeits that — there is then no URL at which "just the
property-facts terms" can be fetched. ADR-0006's implementation note already
accepts this (one `owl:Ontology` at `…/pdtf/`, module files "not separately
addressable"). That is a coherent choice for a vocabulary that evolves as one
unit, which opda's does. So: AFFIRM the flat term space, but **record** that
per-module dereferenceability is being deliberately surrendered, and that this
is reversible only by re-introducing a segment (a costly-to-fix move once
published — same class of risk as Q2). For 147 co-evolving terms the trade is
right. My one-vote reservation is purely that the surrender be recorded, not
silent.

---

**Gandon: Q5 — Standard-entity vs physical-resource split. AFFIRM. Ballot: 9-0 AFFIRM.**

The `/pdtf/` (standard entities) vs `/harness/` (physical resources +
governance) partition is good web architecture, not over-engineering. AWWW
§2.2.2.1: distinct authorities/lifecycles deserve distinct URI ownership. The
two namespaces have genuinely different **persistence guarantees** — `/pdtf/`
terms are what consumers cite *as the standard* and must be as stable as the
PICG guarantee allows; `/harness/` resources (ADRs, ODRs, test data, named
graphs) are build/governance apparatus that may churn freely. Collapsing them
into one namespace + `rdf:type` discrimination (the "over-engineering"
alternative the question raises) would entangle two persistence regimes under
one redirect rule and make it impossible to give the standard stronger URL
stability than the scaffolding. Two PICG redirects (ADR-0006 revised §Redirect)
is the correct realisation. This is the same instinct as `purl`/`w3id`
separating a vocabulary from its documentation host.

One web-architecture rider: whatever dereference discipline Q2 settles on for
`/pdtf/` **does not** automatically bind `/harness/`. Harness resources that are
*information resources* (an ADR is a document, an exemplar file is a document)
are legitimately 200-on-GET with no httpRange-14 concern; harness resources that
denote *non-information* things (a named graph as an abstraction, an ODR
*section* as a fragment of a doc) should use hash fragments of their containing
document rather than bare slash, for the same §4.1 reason as Q2. The proposed
`…/harness/odr/ODR-0011/section-5a` (slash) would, taken literally, denote a
sub-resource needing its own 200/303; `…/harness/odr/ODR-0011#section-5a` (hash)
makes it a fragment of the ODR document, which is what it actually is. Minor —
flag for Q7-adjacent cleanup.

---

**Gandon: Q6 — data-dictionary placement. AFFIRM. Ballot: 9-0 AFFIRM.**

`/harness/data-dictionary/…` is correct on my lens. The 582 entries are
*physical PDTF data-field* descriptors — they describe concrete information
artefacts (the fields that appear in a data pack), not the abstract published
standard concepts. Under AWWW's information-resource notion (§2.2) and the
standard-vs-harness line drawn in Q5, they belong with physical resources. They
are also a different persistence class: data-dictionary entries track the
evolving data-pack shape and will churn; the `/pdtf/` standard terms should not.
Keeping them out of the cited-standard namespace prevents a consumer from
mistaking a physical field descriptor for a normative ontology term. Consistent
with the Q5 partition; no web-architecture objection.

---

**Gandon: Q7 — SHACL shape placement. REVISE. Ballot: REVISE.**

Distinguish the *shape entities* (the `sh:NodeShape` / `sh:PropertyShape` RDF
resources, minted in the `opda:` namespace) from the shape *documents* (the TTL
files). The proposal already routes documents to `/harness/`; the live question
is where the shape **nodes** resolve.

Web-architecture view: a SHACL shape is part of *the standard's normative
content* — conforming to opda's shapes is part of conforming to PDTF. By the Q5
criterion (what a consumer cites *as* the standard), base shapes are standard
entities and belong under `…/pdtf/`. A separate `/shacl/` top-level namespace
would fragment the standard's identity across two roots for no persistence-
regime reason (they share `/pdtf/`'s persistence class) and would re-introduce
the kind of namespace scatter ODR-0004 §Alternatives rejected. So: **shape nodes
under `…/pdtf/` (alongside the classes/properties they constrain), shape
documents under `…/harness/`.** I do not support a dedicated `/shacl/`.

The REVISE (not AFFIRM) is to nail the realisation: shape nodes minted with the
**same hash-or-303 discipline chosen in Q2** — if Q2 lands on Option H
(`…/pdtf#…`), shapes are `…/pdtf#PropertyShape`; if Option S, they are
`…/pdtf/PropertyShape` with 303. Whichever — shapes and terms must share one
scheme, not diverge. Profile-specific *overlay* shapes are Q8.

---

**Gandon: Q8 — Profiles. REVISE. Ballot: REVISE.**

The EVIDENCE frames a binary (profiles are standard entities `…/pdtf/profiles/`
*or* physical resources `…/harness/profiles/`). On my lens the honest answer
splits the profile into its two faces, because they have different persistence
regimes:

- A per-form overlay profile (baspi5, ta6, …) is a **SHACL document** — a
  validation artefact, one per external form, `dct:source`-linked to a form
  question that opda does **not** own. Its lifecycle is coupled to an external
  form's revisions, not to the PDTF standard's. By the Q5/Q6 criterion that is a
  **physical/harness** persistence class: the *profile document* → `/harness/`.
- But a profile a consumer is asked to *conform to* is, like a base shape (Q7),
  normative-content-the-standard-publishes. If opda intends "PDTF-baspi5-
  conformant" to be a citable conformance target, the *profile entity* (the
  named shape collection / `sh:NodeShape` graph head) is a standard entity and
  its IRI belongs under `…/pdtf/profiles/baspi5`.

**Amendment (REVISE):** profile **entity IRIs** under `…/pdtf/profiles/<form>`
(citable conformance targets, Q2 dereference discipline), profile **documents**
(the overlay TTL files, the `dct:source` provenance to external forms) under
`…/harness/profiles/<form>`. This mirrors exactly the shape-node-vs-shape-
document split I argued in Q7 and keeps the externally-coupled, churning
provenance out of the cited-standard namespace while still letting a consumer
cite "conforms to opda:profiles/baspi5." If the council judges that profiles are
*purely* internal validation scaffolding with no citable-conformance intent,
then the simpler all-`/harness/` placement is defensible — but that is a
modelling call (do we publish conformance targets?) on which I defer to the
profile-mechanism owners (ODR-0010/0013); web architecture only requires that
*whatever* is citable-as-standard sit under `/pdtf/` with the Q2 scheme.

---

## Summary ballot

| Q | Verdict | One-line |
|---|---|---|
| Q1 | AFFIRM | org/standard path = clean AWWW delegation; DPV precedent on shape. |
| Q2 | REVISE/REJECT rule 2 | rule 2 fails its own reopening test (147 terms, no named consumer); revert to ODR-0004 hash (Option H); slash only on a fired trigger, then DPV-style module-slash+term-hash. |
| Q3 | REVISE | versionInfo alone violates OWL 2 §3.1; add `owl:versionIRI`. |
| Q4 | AFFIRM* | flat term space sound; record the surrendered per-module dereferenceability. |
| Q5 | AFFIRM | two persistence regimes → two namespaces; not over-engineering. |
| Q6 | AFFIRM | data-dictionary = physical fields → `/harness/`. |
| Q7 | REVISE | shape *nodes* → `/pdtf/` (no `/shacl/`); docs → `/harness/`; share Q2 scheme. |
| Q8 | REVISE | profile *entities* → `/pdtf/profiles/`, profile *documents* → `/harness/profiles/`. |

The through-line on every REVISE: the proposal is sound on **partitioning**
(Q1/Q5/Q6) and right to drop version-from-IRI (Q3), but it leaves the
**dereference contract under-specified** (Q2, propagating to Q7/Q8) and
**retracts an OWL 2 conformance affordance** (Q3 versionIRI). None of these
block the greenfield migration; all are cheap to fix now and costly after
publication — which is precisely the window the directing-authority override
opens.
