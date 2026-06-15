# Namespace, versioning & publishing — the identity contract of the standard

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.

## TL;DR

- **Domain = organisation, path = standard.** `https://opda.org.uk/` is OPDA; `…/pdtf/` is the Property Data Trust Framework ontology. `@prefix opda: <https://opda.org.uk/pdtf/>`. A future second standard would be `…/<other>/` — no term-space collision. ✅
- **Slash, not hash; no version in any IRI; one flat term namespace.** The six TTL modules are *editorial file splits*, never URL segments — a term is `…/pdtf/Property`, full stop. ✅ (The AI council actually voted 5-2 to revert to **hash** at session-037; the directing authority kept **slash** — a deliberate control-vs-simplicity trade, see §3.)
- **Kind sub-segments are the single source of truth in [`namespaces.py`](../../tools/opda-gen/src/opda_gen/namespaces.py).** Terms `/pdtf/…`, SKOS `/pdtf/scheme/…`, SHACL nodes `/pdtf/shape/…`, profiles `/pdtf/shape/profiles/…`, graphs `/pdtf/graph/…`, and **all physical/governance apparatus** under `/pdtf/harness/…`. A **flatten-collision guard** enforces the boundary. ✅
- **`/pdtf/` (normative) vs `/harness/` (physical) is a one-directional boundary:** nothing in core `/pdtf/` may depend on `/harness/`. Placement is decided by **Baker's binding procedure** (council session-037 Q5, 7-0-0). ✅
- **Versioning lives in the triples, not the URL.** Term IRIs are unversioned forever; `owl:versionInfo "1.0.0"` + `owl:versionIRI` point to a dated **release snapshot** under `…/pdtf/harness/release/1.0.0/`. This is the DPV practice. ✅ The ontology version (1.0.0) is **independent** of the PDTF JSON-schema semver (v3.6).
- **OPDA serves RDF from its own domain.** Resolution migrated `w3id.org/opda/#` (hash) → `w3id.org/opda/pdtf/` (slash) → `opda.org.uk/pdtf/` (own domain) — trading the W3C-PICG persistence guarantee for full DNS/hosting control, which is exactly what makes per-term slash dereferencing tractable. ✅

---

## 1. The org-vs-standard split — why the domain is OPDA and the path is PDTF

The first decision is *what the base IRI names*. OPDA chose a two-level shape that separates the **organisation** (the durable steward) from the **standard** (the artefact being published):

| Level | IRI | What it is |
|---|---|---|
| Organisation | `https://opda.org.uk/` | OPDA — the Open Property Data Association; the stewardship/redirect unit |
| Standard | `https://opda.org.uk/pdtf/` | The Property Data Trust Framework ontology; the thing a consumer cites *as* "the PDTF standard" |

```turtle
@prefix opda: <https://opda.org.uk/pdtf/> .
# opda:Property → https://opda.org.uk/pdtf/Property
```

This mirrors DCMI's own `purl.org/dc/ → /dc/terms/` two-level shape (Baker, session-037 Q1, **7-0-0 FOR, DA withdrawn**). The payoff is forward-extensibility without collision: if OPDA later publishes a *second* standard, it takes its own path segment — `https://opda.org.uk/<other>/` — and the two term spaces never overlap. The alternative the council rejected, `w3id.org/pdtf/` (standard-at-the-root), would repeat the `trust.propdata.org.uk` programme-namespace-coupling defect that session-004 had already thrown out: it solders the standard's identity to a single programme name.

`namespaces.py` encodes this split as the base every other IRI is derived from:

```python
# tools/opda-gen/src/opda_gen/namespaces.py
_BASE = "https://opda.org.uk/pdtf/"

OPDA         = Namespace(_BASE)                 # terms
OPDA_SCHEME  = Namespace(_BASE + "scheme/")     # SKOS schemes + concepts
OPDA_SHAPE   = Namespace(_BASE + "shape/")      # SHACL shape nodes (+ profiles)
OPDA_GRAPH   = Namespace(_BASE + "graph/")      # named graphs
OPDA_HARNESS = Namespace(_BASE + "harness/")    # physical + governance apparatus
```

Authoritative sources: [ADR-0006](../../docs/adr/ADR-0006-w3id-opda-ontology-namespace.md) ✅ CURRENT SCHEME block; the emitted `foundation.ttl` header (below).

---

## 2. Slash, not hash; no version-in-IRI; flat term namespace

Three rules govern the *shape* of a term IRI (ADR-0006 amendment 2026-06-01, "four rules"; the org/standard split above is the fourth):

1. **Slash, not hash.** Terms are per-term URIs; no `#` anywhere in the scheme. `opda:Property` is `https://opda.org.uk/pdtf/Property`, not `…/pdtf#Property`.
2. **No version segment** in any IRI — versioning is carried in the triples (§4).
3. **No module segment** in term IRIs. The vocabulary is **one flat term namespace**.

### The six modules are file splits, not URL segments

The ontology ships as six editorial TTL modules — `opda-property.ttl`, `opda-agent.ttl`, `opda-transaction.ttl`, `opda-claim.ttl`, `opda-descriptive.ttl`, `opda-governance.ttl` — but **every term in all six lives in the one flat `…/pdtf/` namespace**. `opda:Property` (declared in `opda-property.ttl`) and `opda:Buyer` (declared in `opda-agent.ttl`) are siblings at `…/pdtf/Property` and `…/pdtf/Buyer`; nothing in the IRI records which file they came from.

The council's reasoning (session-037 Q4, **7-0-0 FOR flat**): sub-namespaces are warranted only by *independent authority or lifecycle* (Allemang, *Working Ontologist* ch. 3), and OPDA's six modules are co-authored, co-versioned splits of one standard with one cadence. Scheme identity is carried by `skos:inScheme`, not by a URI prefix (Baker, SKOS Reference §4) — so flattening loses nothing. Navigation is "the documentation's job, not the URI's." schema.org (flat, thousands of terms) is the scaled precedent that flat is navigable.

The flatness is reversible with a recorded trigger: **a sub-vocabulary earns its own URI segment exactly when it becomes an independent dereference / version / import unit** (the unified Q2+Q4 reopening criterion; Davis withdrew his "premature segmentation" attack once Pandit supplied that finding).

### 🟡 The honest caveat: the council voted to revert to hash

This is the one place the AI Linked Data Council's reasoned majority **opposed** a directing-authority directive, and it belongs in the talk because it is a genuine, well-argued trade — not a rubber stamp.

At **session-037 Q2 the council recommended reverting to HASH, ~5-2** (Option H: `…/pdtf#Property`). A four-voice convergence — **Gandon** (Cool URIs / httpRange-14), **Baker** (W3C Best Practice Recipes, Recipe-3 vs Recipe-4), **Pandit** (DPV principal author), **Davis** (Devil's Advocate) — argued that the slash override **fails its own governing test**: ODR-0004/ADR-0006 had fixed *when* slash earns its keep — "≥1,000 terms OR a named per-term-content-negotiation consumer" — and at ~147 terms with no named consumer, **both limbs are unmet**. They added that the cited precedents are *counter-evidence*: DPV is slash-to-module + hash-within (`/dpv/pd#Address`), not flat-slash-per-term, which "takes Recipe-4 dereference cost at Recipe-3 scale — the worst trade." The minority (Allemang on the schema.org flat-slash precedent; Knublauch deferring to the web-architects) held for slash **only if** OPDA commits to building per-term 303/content-negotiation.

**The directing authority kept slash.** The trade, stated plainly:

| | Hash (`…/pdtf#Property`) | Slash (`…/pdtf/Property`) — chosen |
|---|---|---|
| Retrieval model | One document; the fragment resolves client-side in one round-trip. No per-term server config. | Per-term dereferencing — each term URI can resolve to its own description. |
| Server requirement | Trivial: serve one file. | Needs server control (per-term routing / content negotiation). |
| Long-run scaling | Caps the vocabulary at "one document." | Scales to per-term docs and Linked Data Platform patterns. |
| Cost when chosen | None today. | Must own DNS + hosting (the resolution build). |

The override became **defensible precisely because of the resolution migration in §5**: once OPDA moved onto its own domain (`opda.org.uk`) and serves RDF directly, the w3id "flat 302" limitation that was the *last objection to slash* disappears — per-term resolution is now fully in OPDA's hands. ADR-0006 records this explicitly: "opda-controlled hosting means per-term resolution / content-negotiation is fully in opda's hands … the council's slash verdict is reinforced; the hash recommendation's resolution premise no longer applies." The **re-open trigger** survives in the record: if the per-term 303/conneg infrastructure is never delivered and the URIs 404, hash is reinstated.

This is the "AI proposes, human disposes" governance pattern in its sharpest form — a 5-2 council recommendation, overridden on greenfield/pre-publication grounds, with the dissent and its reopening trigger preserved in ADR-0006 §council-dispositions and session-037's DA scorecard.

---

## 3. Kind sub-segments — the single source of truth and the collision guard

A *flat term namespace* does not mean *one undifferentiated bag of IRIs*. Different **kinds** of resource land in their own sub-namespace under `/pdtf/`, and [`namespaces.py`](../../tools/opda-gen/src/opda_gen/namespaces.py) is the **single source of truth** for which constant mints which kind. The migration was executed by changing *which constant emits the IRI*, never by hand-editing TTL.

| Kind | Constant | IRI shape | Concrete emitted example |
|---|---|---|---|
| Class / property (term) | `OPDA` | `…/pdtf/` | `…/pdtf/Property` · `…/pdtf/role` |
| SKOS scheme + concept | `OPDA_SCHEME` | `…/pdtf/scheme/` | `…/pdtf/scheme/role/Buyer` · `…/pdtf/scheme/assuranceLevel/High` |
| SHACL shape node | `OPDA_SHAPE` | `…/pdtf/shape/` | `…/pdtf/shape/PropertyIdentityKeyShape` · `…/pdtf/shape/Baspi5_PropertyShape` |
| Profile (form overlay) | `OPDA_SHAPE` (`+profiles/`) | `…/pdtf/shape/profiles/` | `…/pdtf/shape/profiles/baspi5` · `…/pdtf/shape/profiles/ta6` |
| Named graph (logical) | `OPDA_GRAPH` | `…/pdtf/graph/` | `…/pdtf/graph/foundation` · `…/pdtf/graph/agent` · `…/pdtf/graph/inferred/entailment` |
| Physical + governance | `OPDA_HARNESS` | `…/pdtf/harness/` | data-dictionary, ODR/ADR anchors, exemplar data, release snapshots (§4–5) |

All examples above are grepped live from `source/03-standards/ontology/` ✅.

### The flatten-collision guard — a live, concrete justification

The boundary between "the flat term namespace" and "the kind sub-namespaces" is not cosmetic; it prevents real ambiguity. The single best example is in the emitted corpus right now:

- **`opda:role`** is a real `owl:DatatypeProperty` (a *term*) at **`…/pdtf/role`** — the notation predicate naming a transactional role (`opda-agent.ttl`).
- The **`role` controlled vocabulary** is a SKOS scheme whose concepts are **`…/pdtf/scheme/role/Buyer`**, `…/scheme/role/Seller`, etc. (`opda-vocabularies.ttl`).

Without the `/scheme/` segment, the `role` *scheme* and the `role` *property* would both want `…/pdtf/role` and collide. The `/scheme/` disambiguator is exactly what keeps a property `…/pdtf/role` distinct from the scheme namespace `…/pdtf/scheme/role/…`. ADR-0006 records this as the explicit reason for the 2026-06-02 `/scheme/` ruling: "so a property `opda:role` at `…/pdtf/role` cannot collide with the `role` scheme at `…/pdtf/scheme/role`; applies to all schemes, not just colliding ones."

The guard is enforced in code, not by convention. `namespaces.py` reserves the kind segments and fails the build loudly if any minted term local-name would shadow one:

```python
RESERVED_SEGMENTS = frozenset({
    "scheme", "shape", "graph", "harness", "profiles",
    "release", "data", "odr", "adr", "data-dictionary",
})

def assert_no_segment_collision(local_names):
    """Fail loudly if any minted term local-name collides with a reserved kind
    segment under the flat /pdtf/ namespace (ADR-0006 flatten-collision guard)."""
```

Note the discipline boundary (ADR-0006 As-built + the 2026-06-02 handover): SKOS **instances** (`skos:ConceptScheme` + `skos:Concept`) move to `/scheme/`, but `owl:Class`-typed `*Scheme` classes — `SpecialCategoryScheme`, `BoundedContextScheme` — are *terms* and **stay in the flat term namespace**. The split is by RDF kind, not by name.

### The `/pdtf/` (normative) vs `/harness/` (physical) boundary

The deepest structural decision is the line between **the standard** and **everything used to build, govern, and exercise the standard**:

- **`/pdtf/…`** (incl. `/scheme/`, `/shape/`, `/graph/`) holds *only* the abstract published **standard entities** — the classes, properties, controlled vocabularies, and the SHACL shape nodes co-located with their `sh:targetClass`. These are what a consumer cites, versions, and deprecates *as* the PDTF standard.
- **`/pdtf/harness/…`** holds the **physical apparatus and governance/build machinery**: the data-dictionary's concrete PDTF data-field entries, exemplar/test data, release snapshots, and the ODR/ADR decision-record anchors. The data-dictionary is *not* a standard entity — its entries are the physical PDTF data fields, so they live in the harness.

**Baker's binding placement procedure** (session-037 Q5, **7-0-0, DA fully withdrew** — the session's most durable artefact, forced into existence by Davis's "standing tribunal with no decision procedure" attack):

1. **Placement test** — *"would a consumer cite / version / deprecate this AS part of the normative standard?"* Yes → `/pdtf/`; No → `/harness/`.
2. **Ambiguity fallback** — default to `/harness/` (the re-classifiable side); promote to `/pdtf/` **only by council**; **never demote a published `/pdtf/` URI** (DCMI never-reassign rule).
3. **One-directional dependency** — nothing in `/pdtf/` may `rdfs:isDefinedBy` or otherwise depend on `/harness/`.

The one-directional rule is load-bearing and was honoured carefully in the migration: harness data-dictionary entries *reference* `/pdtf/` terms via `dct:conformsTo`/`rdfs:isDefinedBy` (harness → pdtf), never the reverse. The `dct:source` annotations that point from a *term* at a harness ODR/ADR anchor (e.g. `opda:Buyer dct:source <…/harness/odr/ODR-0006/section-Q2>`) are **provenance comments, not definitional dependencies** — a directing-authority ruling that preserves the invariant. The one genuine definitional `rdfs:isDefinedBy → ODR` (on `opda:consumesFrom`) was repointed to the core ontology during the migration.

The harness reference helpers in `namespaces.py` are the only sanctioned way to mint these (hash→slash conversion baked in):

```python
def odr_ref(odr_id, section):   # …/pdtf/harness/odr/ODR-0011/section-5a
def adr_ref(slug):              # …/pdtf/harness/adr/ADR-0007-ontology-generator-specification
def dd_entry(safe_path):        # …/pdtf/harness/data-dictionary/propertyPack.environmentalIssues.flooding
def release_iri(version):       # …/pdtf/harness/release/1.0.0/
def harness_data(suffix):       # …/pdtf/harness/data/exemplar/<stem>
```

The council also rejected two tempting extra namespaces, on the same "don't put serialisation/tech distinctions in the URI" principle (session-037 Q7, **7-0-0**): **no `/shacl/` namespace** (the shapes-graph/data-graph separation is a *graph-level* partition per SHACL Rec §1.5, not a naming one — so shape nodes sit in `/pdtf/` beside their target class), and the broader rule from the Queen's synthesis: *"put governance/identity boundaries in the URI; put logical, serialisation, and version distinctions in the triples — never in the URI string."*

---

## 4. Versioning — out of the IRI, into the triples

**No version string appears in any term IRI, ever.** A live grep across the emitted corpus for a semver pattern in any non-harness IRI returns **zero hits** ✅. Versioning is carried entirely in the RDF, following the **DPV practice** (Pandit, session-037 Q3, **7-0-0**): *term IRIs are unversioned forever; releases are dated at the artefact level.*

Three handles do the work, all on the ontology header:

1. **`owl:versionInfo`** — a human-readable version literal (`"1.0.0 — …"`).
2. **`owl:versionIRI`** — a *machine-identifiable* version handle (required because `owl:versionInfo` alone "has no machine identity" per OWL 2 §3.1 — Gandon's amendment).
3. The `owl:versionIRI` **resolves to a dated release snapshot** under `…/pdtf/harness/release/<v>/` — a citable, fixed release URI (Davis's demanded "versioned release URI in `/harness/`").

### The core ontology header (emitted, `foundation.ttl`)

```turtle
<https://opda.org.uk/pdtf/>
    rdf:type owl:Ontology ;
    dct:title "OPDA — Open Property Data Association Ontology"@en ;
    dct:description "Linked-data ontology for UK residential property transaction
        data; the Trust Framework's machine-readable vocabulary."@en ;
    dct:license <https://creativecommons.org/publicdomain/zero/1.0/> ;
    vann:preferredNamespacePrefix "opda" ;
    vann:preferredNamespaceUri "https://opda.org.uk/pdtf/"^^xsd:anyURI ;
    owl:versionIRI  <https://opda.org.uk/pdtf/harness/release/1.0.0/> ;
    owl:versionInfo "1.0.0 — foundation + SKOS vocabularies + UFO meta-classes …" .
```

### Per-module version IRIs too — independent clocks

Each module file is one `owl:Ontology` that declares its **graph IRI**, `owl:imports` the single flat ontology, and carries its **own** per-module `owl:versionIRI` into a module-scoped release snapshot:

```turtle
# opda-agent.ttl
<https://opda.org.uk/pdtf/graph/agent>
    rdf:type owl:Ontology ;
    owl:imports    <https://opda.org.uk/pdtf/> ;
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/agent/1.0.0/> .
```

This is what makes the flat-namespace reopening trigger real: the *terms* are flat and unversioned, but each module already has a place to acquire an independent version clock the day it needs one. The release snapshots in use today span the core (`…/release/1.0.0/`), each module (`…/release/agent/1.0.0/`, `…/release/property/1.0.0/`, …) and each profile (`…/release/profiles/baspi5/0.1.0/`) — and the profiles are at **0.1.0** while the modules are at **1.0.0**, demonstrating the independent-clock design in practice ✅.

### Ontology version (1.0.0) vs PDTF JSON-schema semver (v3.6) — independent

The two version numbers describe **different artefacts** and move on **different clocks**:

| | PDTF JSON Schema | OPDA PDTF ontology |
|---|---|---|
| Artefact | The source standard (`pdtf-transaction.json`, ~37,224 lines, Draft-07) + form overlays | The re-expressed RDF/OWL/SHACL/SKOS vocabulary emitted by `opda-gen` |
| Current version | **v3.6** (the version under approval at the 2026-06-05 workshop) | **1.0.0** |
| Owner / cadence | The PDTF schemas repo (`github.com/Property-Data-Trust-Framework/schemas`), semver, frequent point releases (v3.2→v3.6 over months) | OPDA Linked Data Council, dated release snapshots; first formal release |

The relationship is **derivation, not lockstep**: the ontology's `1.0.0` is *its own* first release of the modelling, generated *from* a pinned snapshot of the JSON schema (and its data-dictionary distillation), not a mirror of the source's `3.6`. A new source-schema point release (say v3.7) does **not** force an ontology version bump; it triggers a re-run of the generator, and the ontology re-versions only when *its* modelling changes. Conversely the ontology can iterate (1.0.0 → 1.1.0) against a *frozen* source schema as modelling decisions land. Per-form profiles carry their own semver again (BASPI5 profile `0.1.0`) tracking the maturity of that overlay independently of both the core ontology and the source form. This decoupling is the point of versioning-at-the-artefact-level: each layer (source schema · ontology · per-form profile) versions on its own clock, and none of those numbers ever leaks into a term IRI.

---

## 5. Resolution / dereferencing — and the migration that earned slash

OPDA **controls `opda.org.uk` DNS + hosting and serves RDF directly** from it. The resolution story is a three-step migration, and *why* each step happened is the substance of the namespace-governance trade.

```
w3id.org/opda/#…           →   w3id.org/opda/pdtf/…        →   opda.org.uk/pdtf/…
(hash, W3C-PICG redirect)      (slash, still PICG)             (slash, own domain)   ← live
```

**Step 1 — `w3id.org/opda/#` (hash, via W3C PICG).** ADR-0006's *original* decision (session-004; DA Knublauch's primary demand). The reasoning was **persistence**: `w3id.org` redirects are maintained by the W3C Permanent Identifier Community Group independent of any single organisation's lifecycle — URIs survive an org rebrand, domain lapse, or hosting move. This is exactly Pandit's choice for DPV (`w3id.org/dpv/`), cited as the strongest analogue. Hash terms (`…/opda/#Property`) suited w3id because a fragment resolves client-side off one document — w3id's flat 302 redirect serves a single file and the fragment does the rest.

**Step 2 — `w3id.org/opda/pdtf/` (slash, still on PICG).** The 2026-06-01 directing-authority amendment introduced the org/standard split and switched hash→slash *while still behind w3id*. This is the step the council pushed back on at session-037 (§2): under w3id's flat 302, per-term slash "buys nothing" (a slash URI that can't resolve per-term is worse than an always-resolving hash), so the council recommended reverting to hash.

**Step 3 — `opda.org.uk/pdtf/` (own domain).** The 2026-06-02 amendment moved the base off w3id onto OPDA's **own domain**, and was **executed end-to-end** (15 commits, merged to `main`, deployed; 345 pytest + 8 CI gates green — see [HANDOVER-2026-06-02](../../docs/HANDOVER-2026-06-02-namespace-migration-executed.md)). This is the decisive **control-vs-persistence trade**:

- **What was given up:** the W3C-PICG persistence guarantee — the layer of indirection that survives OPDA organisational changes. ADR-0006 records the cost honestly and names the re-open trigger: *"if opda's organisational continuity becomes a concern, reconsider a PICG redirect layer in front of `opda.org.uk`."*
- **What was gained:** full control of DNS + hosting, which is what makes **per-term slash dereferencing tractable**. The "w3id flat-302 limitation that was the last objection to slash is gone" — OPDA can now serve per-term 303/content-negotiation itself. The slash verdict is *reinforced*, and the hash recommendation's *resolution premise* (that OPDA couldn't control per-term resolution) no longer holds.

So the seemingly separate decisions — "keep slash" (§2) and "move to our own domain" (§5) — are **two halves of one bet**: own the infrastructure, and slash's per-term dereferencing becomes an asset rather than a liability. The directing authority owns the persistence-vs-control trade for this greenfield build; the PICG escape hatch is recorded, not closed.

How RDF is actually served today (cross-references the publishing/serving facet): `scripts/fuseki-load.mjs` loads the module TTLs into **Apache Fuseki** under their `…/pdtf/graph/<module>` named graphs; a **grlc** layer exposes SPARQL-as-REST; the Astro site renders entity pages from it; CI deploys to **Cloudflare Pages** (✅ live, gated by Cloudflare Access at the edge). Dereferenceability of every individual term URI as content-negotiated RDF is the **🔵 planned** completion of the slash bet — the re-open trigger guards it.

---

## Built vs planned

| Item | Status | Evidence |
|---|---|---|
| Org/standard split `opda.org.uk` ÷ `/pdtf/` | ✅ | `foundation.ttl` header; ADR-0006 |
| Slash, no hash, flat term namespace | ✅ | corpus grep; ADR-0006 4-rules |
| Kind sub-segments (`/scheme/`, `/shape/`, `/graph/`, `/harness/`) | ✅ | `namespaces.py`; live IRI greps |
| Flatten-collision guard (`opda:role` vs `scheme/role`) | ✅ | `assert_no_segment_collision`; emitted `opda:role` + `scheme/role/Buyer` |
| `/pdtf/` vs `/harness/` one-directional boundary | ✅ | Baker's procedure (S037 Q5); harness→pdtf links only |
| No version in any term IRI | ✅ | corpus grep returns zero non-harness semver IRIs |
| `owl:versionInfo` + `owl:versionIRI` → dated release snapshot | ✅ | `foundation.ttl`; `…/harness/release/1.0.0/` |
| Per-module + per-profile independent version clocks | ✅ | module versionIRIs `…/release/agent/1.0.0/`; profiles at `0.1.0` |
| Migration to own domain executed + deployed | ✅ | HANDOVER-2026-06-02 (15 commits, CI green) |
| Council recommended hash; authority kept slash | ✅ (recorded trade) | session-037 Q2 (5-2); ADR-0006 §dispositions |
| Per-term 303 / content-negotiation resolution build | 🔵 | the slash bet's completion; re-open trigger guards it |
| PICG redirect layer in front of `opda.org.uk` | 🔵 (contingent) | re-open trigger if org continuity becomes a concern |
| Profile-normativity policy (`/pdtf/profiles/` promotion) | 🟡 | S037 Q8 default `/harness/`-side; promote per warranted adoption |

---

## Talking points for the quarterly tech review

- **"The domain is who we are; the path is what we publish."** `https://opda.org.uk/pdtf/` cleanly separates OPDA-the-organisation from PDTF-the-standard — so a future second standard slots in beside it without ever colliding term spaces. This is the same shape DCMI uses for Dublin Core.
- **"Identity is permanent; versions live in the data, not the URL."** A term like `…/pdtf/Property` never changes and never carries a version number; the release (1.0.0) is a *dated snapshot* the ontology header points at. That means downstream consumers can pin to a fixed release **and** dereference a stable term — the two things a standard must offer to be safe to build on.
- **"The ontology version is independent of the schema version."** Ontology `1.0.0` is derived *from* — not locked to — PDTF JSON Schema `v3.6`. A new schema point-release re-runs the generator; the ontology re-versions only when the *modelling* changes. Each layer (source schema · ontology · per-form profile) has its own clock.
- **"Even the AI council didn't get a free pass."** The Linked Data Council voted 5-2 to switch the URIs to a hash scheme; the directing authority overrode them and kept slash — *because* we then moved onto our own domain, which gives us the per-term resolution control that makes slash worthwhile. The dissent and its reversal-trigger are recorded. This is "AI proposes, human disposes" working exactly as designed.
- **"We traded a persistence guarantee for control — with eyes open."** Moving off `w3id.org` onto `opda.org.uk` means we own DNS and hosting (and can serve RDF directly), at the cost of the W3C-PICG guarantee that survives org changes. The escape hatch — a PICG redirect *in front of* our domain — is documented and ready if organisational continuity ever becomes a concern.
- **"A single Python file is the source of truth for every IRI we mint."** `namespaces.py` decides the shape of every term, scheme, shape, graph, and harness URI, and *fails the build* if a term name would shadow a reserved kind segment. The whole domain-move was executed by changing that file and re-emitting under a byte-identity gate — never by hand-editing the Turtle.

---

## Source files

- [`docs/adr/ADR-0006-w3id-opda-ontology-namespace.md`](../../docs/adr/ADR-0006-w3id-opda-ontology-namespace.md) — the definitive ✅ CURRENT SCHEME block, the 2026-06-01 (slash) and 2026-06-02 (own-domain) amendments, and the full session-037 council dispositions.
- [`tools/opda-gen/src/opda_gen/namespaces.py`](../../tools/opda-gen/src/opda_gen/namespaces.py) — the single source of truth: the five kind-namespace constants, the `RESERVED_SEGMENTS` flatten-collision guard, and the `odr_ref`/`adr_ref`/`dd_entry`/`release_iri`/`harness_data` helpers.
- [`source/03-standards/ontology/foundation.ttl`](../../source/03-standards/ontology/foundation.ttl) — the emitted ontology header (prefix, `vann:` preferred namespace, `owl:versionInfo` + `owl:versionIRI`).
- `source/03-standards/ontology/opda-agent.ttl`, `opda-vocabularies.ttl`, `profiles/*.ttl` — live IRI examples (term `opda:role`, scheme `…/scheme/role/Buyer`, shape nodes, profile `…/shape/profiles/baspi5`, per-module/per-profile version IRIs).
- [`docs/HANDOVER-2026-06-02-namespace-migration-executed.md`](../../docs/HANDOVER-2026-06-02-namespace-migration-executed.md) — the executed migration (15 commits, CI green, DNS/resolution notes).
- [`docs/ontology/odr/council/session-037-url-scheme.md`](../../docs/ontology/odr/council/session-037-url-scheme.md) — the Full Council session: Q1 split, Q2 hash-vs-slash (5-2), Q3 versioning, Q4 flat, Q5 `/harness/` placement procedure, Q6 data-dictionary, Q7 `/shacl/` rejection, Q8 profiles.
- Builds on [`_research-synthesis.md`](./_research-synthesis.md) §5, [`_fact-sheet.md`](./_fact-sheet.md), [`_external-research.md`](./_external-research.md) (PDTF v3.6 / workshop context).
