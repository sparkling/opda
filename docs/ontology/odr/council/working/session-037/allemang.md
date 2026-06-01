# Session 037 — Allemang opinion: the opda/pdtf URL scheme

Lens: pragmatic RDF modelling — the simplest model that works, reuse over mint,
"good enough and shipped" over "elegant and theoretical." Grounding: Allemang &
Hendler, *Semantic Web for the Working Ontologist* (3rd ed., 2020); DPV
(`w3id.org/dpv`); schema.org's single flat namespace; W3C *Cool URIs for the
Semantic Web* (2008) and the TAG httpRange-14 resolution.

Headline: the scheme is **mostly right and shippable**. The two places it drifts
from "simplest thing that works" are Q5 (two coordinate namespaces where a path
prefix does the job) and Q7 (the temptation of a third `/shacl/` namespace). The
flat-namespace and slash decisions are correct and well-grounded.

---

**Allemang Q1 — Org/standard split + base path.** **AFFIRM. Ballot: AFFIRM.**

`https://w3id.org/opda/pdtf/` is the right shape. The org/standard split is not
distinction-mongering here — it is exactly the pattern DPV uses
(`w3id.org/dpv/` as the family, sub-paths for the parts) and the pattern an
organisation that may one day publish a *second* standard wants. *Working
Ontologist* (ch. 3, "The RDF model") is explicit that namespaces are just string
prefixes with no semantics — so the only thing this choice buys or costs is
human navigability and future headroom, and `opda` (authority) `/ pdtf`
(artefact) reads correctly to a working ontologist and leaves room for
`opda/<next-standard>` without re-rooting. A bare `w3id.org/pdtf/` would couple
the persistent identifier to the standard's name rather than the maintaining
authority — the same coupling defect S004 rejected for `trust.propdata`. A bare
`w3id.org/opda/` (no `pdtf`) would force the eventual second standard to either
collide or migrate. Keep it.

---

**Allemang Q2 — Hash vs slash.** **AFFIRM. Ballot: AFFIRM.**

Slash per-term URIs are the correct call for a vocabulary of this size and
shape, and the override of ODR-0004's hash commitment is admissible on the
pre-publication grounds ADR-0006 states. The hash/slash tradeoff is the textbook
one (*Cool URIs*, §4.1–4.4; *Working Ontologist* ch. 3 on dereference): **hash**
is one document fetched whole — cheap when the vocabulary is small and you always
want the lot; **slash** lets each term dereference independently with content
negotiation — right when terms are numerous, independently citable, and you do
*not* want every consumer pulling 147 classes + 582 fields + enums to resolve one
URI. opda has ~147 terms plus a 582-entry data dictionary; that is already past
the size where "fetch the whole document per term" is comfortable, and ODR-0004's
own reopening trigger (the 1,000-term / per-term-content-negotiation criterion)
anticipates exactly this. Note the prior art does **not** uniformly back hash:
DPV uses hash *within* each module, but schema.org — the most-deployed vocabulary
on the open web — is flat **slash** (`schema.org/Person`). The slash choice puts
opda in good, scaled company. One caveat to record, not to block on: slash means
the redirect/host must answer per-term with content negotiation (303 or
200+conneg), which is marginally more hosting work than serving one static
hash document. ADR-0006's redirect infrastructure must actually deliver that —
otherwise you have minted slash URIs that 404. Make that a confirmation gate.

---

**Allemang Q3 — Versioning.** **AFFIRM. Ballot: AFFIRM.**

No version segment in the IRI; version carried by `owl:versionInfo` — this is
correct and is the dominant pattern in the field. *Working Ontologist* and the
OWL 2 design both separate the **ontology IRI** (stable, what you cite and
import) from the **version IRI** (`owl:versionIRI`, the specific release). DPV
does exactly this: unversioned namespace, dated/numbered releases as separate
artefacts. Baking `/1.0.0/` into term URIs is the classic mistake — it means
every term's identity churns on every release, breaking every consumer's
`owl:imports` and every cited URI at each bump, which defeats the entire
persistence rationale that motivated w3id in the first place (ADR-0006 driver 1).
The current scheme's `…/opda/1.0.0/` version-IRI-in-path is precisely what to
retire. One refinement to record: keep `owl:versionInfo` (a human-readable
literal) **and** add a proper `owl:versionIRI` pointing at a release-snapshot
location in the *harness* namespace (e.g. `…/harness/release/1.0.0/`) so there is
a machine-addressable, archivable snapshot without polluting term IRIs. That is
the OWL-idiomatic way to get "stable term IRI + addressable release" at once.

---

**Allemang Q4 — Modules / flat namespace.** **AFFIRM. Ballot: AFFIRM.**

Flatten. One flat term namespace, module TTLs as file splits — this is the right
call *for opda specifically*, and I say so knowing both cited precedents
(hm's `/ns/pf/`, `/ns/sds/`; DPV's `/dpv/pd`, `/dpv/legal`) go the other way.
Two pragmatic reasons the precedents do not transfer:

1. **Sub-namespaces are warranted only when the modules have independent
   authority or independent lifecycle.** DPV's `/legal/eu/gdpr` is a genuinely
   separate, separately-governed body of law with its own editors; hm's `pf` vs
   `sds` are separately-owned bounded contexts. opda's six modules are
   *editorial file splits of one standard with one author and one release
   cadence* — they share identity, versioning, and governance. Putting them in
   one flat namespace tells the truth about that; sub-namespacing them would
   manufacture a boundary the governance does not have. *Working Ontologist*
   (ch. 3) is clear that namespace structure should reflect real ownership, not
   filesystem layout.

2. **The most-deployed vocabulary in existence is flat.** schema.org has
   thousands of terms in one flat slash namespace and a working ontologist
   navigates it fine, because navigation is the documentation's job, not the
   URI's. opda has ~147 terms — flat is trivially navigable.

ADR-0006's "one `owl:Ontology` at `/pdtf/`, modules contribute terms, modules not
separately addressable in term space" resolution is exactly right and is the
standard multi-file OWL pattern. AFFIRM, and explicitly *do not* let the hm/DPV
precedents pressure a reversal — they solve a different problem.

---

**Allemang Q5 — Standard-entity vs physical-resource split.** **REVISE.
Ballot: REVISE.**

This is where the scheme over-reaches, and it is the one question I'd ask the
council to amend rather than rubber-stamp.

The **goal** is sound: keep the churny, build-coupled, never-cited-as-the-
standard artefacts (ADRs, ODRs, instance/test data, named graphs) out of the
consumer-facing term namespace, so the published vocabulary stays small, stable,
and clean. Endorse the goal.

The **mechanism** — two *coordinate w3id namespaces* (`/opda/pdtf/` and
`/opda/harness/`) each needing its own PICG redirect rule — is more machinery
than the goal requires, and it half-duplicates a distinction the data model
*already* carries three other ways:

- by `rdf:type` (a `opda:Property` class vs a data-dictionary `opda:DataField`
  instance are already type-distinguished);
- by **graph membership** (ADR-0035/0036/0037's three-graph separation already
  partitions source / derived / instance — the standard-vs-physical line is
  largely the source-graph-vs-instance-graph line);
- by **path** (a `/harness/...` *path prefix under one namespace* separates them
  for humans and for redirect rules just as well as a second namespace root).

*Working Ontologist* (ch. 3) is blunt that the URI string carries no model
meaning — so a distinction the model already expresses via type and graph does
not *need* to be re-encoded in the namespace root. Encoding it once, as a path
prefix, is the simplest thing that works.

**Amendment (exact):** Adopt the standard/physical *distinction* and the
`/harness/` *path*, but treat `harness` as a **path segment under the single
`opda` PICG redirect**, not a second coordinate redirect root. Concretely: one
w3id redirect rule for `/opda/` → host; `/opda/pdtf/...` and `/opda/harness/...`
are paths the host resolves. This keeps the small-stable-published-vocabulary
benefit, keeps the human-legible split, and drops the second PICG submission, the
second redirect to maintain, and the implied claim that "harness" is a peer
authority to "pdtf." If the build genuinely needs two *physically separate* hosts
later, that is a deploy-side redirect-target detail (ADR-0006 already decouples
URI policy from redirect target) — it does not require minting the split at the
namespace root today. Ship the path; do not ship the second root.

**Why the path survives but a third "no path at all" collapse does not**
(the sharp question, from cross-talk with Davis, who lands at the same
one-root-with-`/harness/`-path position via *Linked Data Patterns*' Hierarchical
URIs). If the three-graph separation already makes the standard/physical cut
*queryable*, why keep even the path? Because **queryable is not
dereferenceable.** Graph membership lets a SPARQL engine *with the dataset
loaded* filter standard-vs-physical (`GRAPH ?g {…}`); but the URI scheme must
also serve the consumer who holds only a *string* and dereferences it (Cool
URIs; httpRange-14). At routing time, the only signal in the bare IRI is its
**path** — `rdf:type` can't help (you'd have to fetch the resource to learn its
type, circular), and graph membership isn't in the string. So the `/harness/`
path earns its keep at exactly one layer the graph separation cannot reach: the
**HTTP redirect/caching layer**. `/pdtf/...` can 302 to a stable,
long-cache-TTL vocabulary host; `/harness/...` to the churny build host —
*different stability and caching policy per kind, from the string alone.* Drop
the path and the redirect must treat 300 ADR URIs and 147 class URIs
identically, reintroducing the very instability that (rightly) kills the
"one namespace, period" option. The three-graph cut governs the triplestore;
the path governs the HTTP layer; both are needed, and one path segment is the
minimum that delivers it. So the floor is one root **with** the path — not zero
paths.

(If a peer shows that PICG/hosting actually *requires* two coordinate roots —
i.e. a single `/opda/` redirect cannot fan out to two hosting targets — then two
rules is a deployment necessity, not over-design. But ADR-0006 explicitly
decouples URI policy from redirect target, so that is a redirect-target concern
and should not drive the namespace scheme. Absent that, REVISE stands.)

---

**Allemang Q6 — data-dictionary placement.** **AFFIRM. Ballot: AFFIRM.**

The 582 data-dictionary entries are concrete PDTF data fields — physical
resources, not the abstract published vocabulary — so they belong under
`/harness/data-dictionary/` (a path; see Q5), not in the term space. This is the
correct application of the standard-vs-physical line and the strongest *concrete*
justification for drawing that line at all: you do not want 582 dotted-path field
identifiers (`propertyPack.environmentalIssues.flooding`) diluting a ~147-term
published ontology that consumers cite *as PDTF*. They are data *described by* the
ontology (each `dct:source`/`rdfs:isDefinedBy` back to the term it instantiates),
not terms *of* it. AFFIRM — with the Q5 caveat that "harness" is a path prefix,
not a separate namespace root.

---

**Allemang Q7 — SHACL shapes placement.** **REVISE. Ballot: REVISE.**

Two sub-questions; keep them apart.

*Shape **documents** (the .ttl files)* → harness path. They are build artefacts.
Uncontroversial.

*Shape **nodes** (`sh:NodeShape` / `sh:PropertyShape` IRIs in the `opda:`
namespace)* → **`/pdtf/`, the term namespace — NOT a dedicated `/shacl/`
namespace.** Minting a third namespace root to hold shapes is the same
over-reach as Q5, one level smaller. The decisive point (Knublauch's, and I
adopt it): the shapes-graph/data-graph distinction (SHACL Rec §1.5) is a
**graph-level partition, not a naming partition** — conflating "which graph the
triples live in" with "which namespace the IRI carries" is a category error. A
SHACL shape is just an RDF node typed `sh:NodeShape`/`sh:PropertyShape` (Rec
§2.1; ODR-0002 pins SHACL 1.2), not a separate metamodel that warrants its own
vocabulary namespace. Base shapes that express the published standard's
*conformance contract* are **part of** what a consumer validates against — they
are as much "the PDTF standard" as the classes, and they co-locate with the
class they constrain via `sh:targetClass`, sharing its authority, lifecycle, and
release cadence. So they share its namespace. A separate `/shacl/` root would
assert a separate authority that does not exist (DASH/SPIN/TopBraid all keep app
shapes in the app's own namespace, not a generic shapes namespace). The
working-ontologist test (*WO* ch. 3) and the part-of/about test agree: for base
shapes, no separate ownership boundary exists.

**Amendment (exact):** base/standard shape nodes live in `/pdtf/` alongside the
classes they constrain (e.g. `opda:PropertyShape` at
`https://w3id.org/opda/pdtf/PropertyShape`); shape *documents* live under the
`/harness/` path. Do **not** mint `/shacl/`. (Profile-overlay shape *nodes*
follow the same rule — see Q8: nodes → `/pdtf/`, graphs → `/harness/`.)

---

**Allemang Q8 — Profiles.** **REVISE. Ballot: REVISE.**

*Position revised in cross-talk with Knublauch — conceding the shape-node level,
holding the graph level.* The clean line splits node from graph:

- **Profile shape NODES → `/pdtf/`** (the `opda:` term namespace), co-namespaced
  with the base shapes they overlay and the classes they target.
- **Profile GRAPHS / documents → `/harness/profiles/<form>`** (physical,
  separately versioned by `owl:versionIRI`).

My initial lean was "profiles are external-form adapter glue → all of it to
`/harness/profiles/`." Knublauch corrected the node-level half, and after working
the disagreement to its base I concede — on the identity-stability argument, the
one that survives scrutiny:

1. **Provenance ≠ subject matter.** The `dct:source` link to an external form
   question (`basp.uk/forms/baspi5#A1.1`) records *where the constraint came
   from*; it does not make the constraint *about* the form rather than *part of*
   the standard. Under ODR-0010/0013 a profile's shapes are **normative**: they
   define what conformance to *PDTF-as-submitted-via-BASPI5* means (cardinality,
   enum subsets, the three-rule interface contract). A normative conformance
   definition authored by opda *is* part of the standard's deliverable — opda
   authors the mapping; the externality of the *target* does not externalise the
   opda-authored *constraint*. I had misapplied my own part-of/about test by
   treating the external target as if it tainted the constraint.

2. **The identity-stability test (decisive — Knublauch's, and it cuts in his
   favour).** Test case: BASPI revises form question A1.1 tomorrow. Does the
   profile shape node change identity? **No** — opda keeps the IRI, re-points
   `dct:source`, adjusts the constraint if needed; it is the same node continuing
   to express opda's evolving ruling. A resource whose identity *survives
   mutation of its `dct:source` target* is not parasitic on that target — its
   identity is opda-owned, the external form is merely cited provenance. That is
   the operational signature of part-of, and it is a cleaner criterion than my
   weaker "the target is external" instinct (which conflated the externality of a
   *referent* with externality of *identity*). So profile shape nodes are
   opda-owned standard entities → `/pdtf/`.

   *(Note for the record: an earlier round of this exchange leaned on a
   `NoIdentityOverride_MetaShape` "don't fracture the shape space" argument.
   Knublauch correctly **withdrew** it and I endorse the withdrawal — namespace
   does not partition the SHACL validation graph; **graph membership** does (Rec
   §1.5). A meta-shape with `sh:targetClass sh:NodeShape` selects its targets by
   `rdf:type` membership in the validated graph (Rec §2.1.3), **not** by IRI
   namespace — so a `/pdtf/`-vs-`/harness/` *naming* split never drops coverage;
   only a *graph* split (a graph-assembly decision, not a naming one) would. The
   meta-shape is therefore irrelevant to the namespace question; it was never
   load-bearing. The conclusion stands on identity stability, not on the
   meta-shape.)*

**Amendment (exact):** profile shape *nodes* live in `/pdtf/` (e.g.
`opda:Baspi5_AddressShape` at `https://w3id.org/opda/pdtf/Baspi5_AddressShape`),
co-namespaced with base shapes and target classes; profile *graphs/documents*
(the loadable `owl:Ontology`, `owl:versionIRI`-versioned) live under
`/harness/profiles/baspi5`. This unifies with Q7 into one rule for the whole
council: **shape nodes follow their targets into `/pdtf/`; shape/profile
documents and named graphs are physical resources → `/harness/`.** Node identity
and document identity stay cleanly separable — which the slash scheme (Q2)
enables and which the old hash scheme would have muddied.

**Generalizable test to hand the Queen** (so this is not a one-off ruling): a
shape node belongs in `/pdtf/` iff its identity is opda-owned and **survives
mutation of its `dct:source` target**. Base shapes pass trivially (no external
target). Profile shapes pass (the A1.1 test). The only thing that would *fail* —
land in `/harness/` — is a shape node that would have to be **retired** when a
foreign artefact changes, i.e. a node whose very existence is contingent on the
external thing. Nothing in the 31 profiles is like that, so the whole shape space
goes to `/pdtf/`. Knublauch and I are fully converged here — no split for the
Queen to referee, just the test recorded for the next profile.

---

## Summary ballot

| Q | Verdict | One-line |
|---|---|---|
| Q1 org/standard + base | AFFIRM | `opda/pdtf/` correct; authority/artefact split = DPV pattern, future-headroom. |
| Q2 hash vs slash | AFFIRM | Slash right at this size; schema.org precedent; gate on conneg actually working. |
| Q3 versioning | AFFIRM | No version in term IRI; `owl:versionInfo` + add `owl:versionIRI` → harness release path. |
| Q4 flat namespace | AFFIRM | Flatten; hm/DPV sub-namespaces solve independent-authority, which opda lacks. |
| Q5 std-vs-physical split | REVISE | Keep the distinction + `/harness/` path; drop the *second coordinate namespace root*. |
| Q6 data-dictionary | AFFIRM | Physical fields → `/harness/data-dictionary/` path. |
| Q7 shape nodes | REVISE | Base shape nodes → `/pdtf/`; documents → harness; do NOT mint `/shacl/`. |
| Q8 profiles | REVISE | Profile shape *nodes* → `/pdtf/` (meta-shape invariant); profile *graphs* → `/harness/profiles/`. |

The through-line: **AFFIRM the modelling decisions (slash, flat, version-out-of-
IRI, org/standard), REVISE the namespace-proliferation decisions (one redirect
root with `/harness/` and `/profiles/` as paths; no `/shacl/`).** Simplest model
that works: one PICG redirect, one flat `/pdtf/` term space holding exactly the
publishable standard (classes, properties, SKOS, base shapes), and a `/harness/`
path holding everything that is about-it-but-not-it. Ship that.
