---
status: accepted
date: 2026-05-27
amended: 2026-06-02
tags: [ontology, namespace, infrastructure, w3c, picg, deployment, pdtf, slash, harness, opda-org-uk]
supersedes: []
depends-on: [ODR-0004]
implements: []
---

# Ontology namespace at w3id.org/opda/ via W3C PICG redirect

> ## ✅ CURRENT SCHEME (definitive — 2026-06-02)
>
> This block is authoritative; it supersedes every amendment, council placement, and the body below wherever they differ. Base **`https://opda.org.uk/`**; the PDTF standard family lives under **`/pdtf/`** with role/kind sub-segments. **Slash, no hash, no version-in-IRI** (version via `owl:versionInfo` + `owl:versionIRI` → release snapshot). `@prefix opda: <https://opda.org.uk/pdtf/> .`
>
> | Resource | IRI |
> |---|---|
> | Ontology IRI | `https://opda.org.uk/pdtf/` (+ `owl:versionInfo "1.0.0"`) |
> | Class / property | `…/pdtf/Property`, `…/pdtf/evidenceType` |
> | SKOS scheme / concept | `…/pdtf/scheme/role` · `…/pdtf/scheme/role/Buyer` |
> | SHACL shape node | `…/pdtf/shape/EvidenceFacetShape`, `…/pdtf/shape/Baspi5_PropertyShape` |
> | Profile (form overlay) | `…/pdtf/shape/profiles/baspi5` |
> | Named graph | `…/pdtf/graph/foundation`, `…/pdtf/graph/inferred/entailment` |
> | data-dictionary entry | `…/pdtf/harness/data-dictionary/propertyPack.environmentalIssues.flooding` |
> | ODR anchor | `…/pdtf/harness/odr/ODR-0011/section-5a` |
> | ADR link | `…/pdtf/harness/adr/ADR-0007-ontology-generator-specification` |
> | instance / test data | `…/pdtf/harness/data/…`, `…/pdtf/harness/data/exemplar/<stem>` |
> | release snapshot | `…/pdtf/harness/release/1.0.0/` |
>
> **Directing-authority overrides of the council (greenfield):** everything nests under the `/pdtf/` family root; SHACL shapes get a **`/pdtf/shape/`** segment (overrides Q7's no-`/shacl/` — milder: under pdtf authority, an organisational sub-namespace not a separate standard); named graphs get **`/pdtf/graph/`**; SKOS schemes + concepts get a **`/pdtf/scheme/`** segment (ruling 2026-06-02 — disambiguates the scheme namespace from the flat term namespace, so a property `opda:role` at `…/pdtf/role` cannot collide with the `role` scheme at `…/pdtf/scheme/role`; applies to all schemes, not just colliding ones); **`/pdtf/harness/`** nests (was a sibling). **Profiles → `/pdtf/shape/profiles/` — treated as normative standard SHACL (resolves Q8 toward normative).** **Retained from the council:** slash, flat term namespace (no domain-module segments), no version segment, the standard-vs-physical distinction (now core+`scheme`+`shape`+`graph` vs `harness`), Baker's placement procedure, one-directional dependency (nothing in core `/pdtf/` depends on `/pdtf/harness/`).
>
> **As-built (2026-06-02):** the migration is **implemented and green** — `opda_gen.namespaces` is the single source of truth (`OPDA`, `OPDA_SCHEME`, `OPDA_SHAPE`, `OPDA_GRAPH`, `OPDA_HARNESS` + `odr_ref`/`adr_ref`/`dd_entry`/`release_iri` helpers + a flatten-collision guard). Per-module ontology IRIs collapsed to `…/pdtf/graph/<module>` importing the one ontology `…/pdtf/`; per-module/per-profile `owl:versionIRI` → `…/pdtf/harness/release/…`. `dct:source` → harness ODR/ADR/dd retained as provenance comments (not core→harness dependencies; the one definitional `rdfs:isDefinedBy`→ODR on `opda:consumesFrom` repointed to the core ontology). `owl:Class`-typed `*Scheme` (e.g. `SpecialCategoryScheme`, `BoundedContextScheme`) stay in the term namespace; only `skos:ConceptScheme` instances move to `/pdtf/scheme/`. Verified: 345 pytest + 8 CI gates (incl. byte-identity) + 27 repo-root round-trip. See `docs/PLAN-2026-06-02-namespace-migration.md`.

> ## ⚠ Amendment (2026-06-02) — base domain → `https://opda.org.uk/` (supersedes the w3id/PICG choice)
>
> On directing-authority instruction the base moves from the W3C-PICG path `https://w3id.org/opda/` to **opda's own domain `https://opda.org.uk/`**. This **reverses this ADR's core decision** (and S004's choice of w3id over an institutional domain for PICG persistence — the old Option A/C). Admissible on the same greenfield/pre-publication grounds as the 2026-06-01 amendment; the directing authority owns the persistence-vs-control trade for this build.
>
> **Mechanical effect:** everywhere below (body + the 2026-06-01 amendment) read `https://w3id.org/opda/` as **`https://opda.org.uk/`** — the `opda` org path-segment is absorbed into the domain. The org/standard split is preserved as **domain = organisation, path = standard**:
> - standard entities → **`https://opda.org.uk/pdtf/`** (prefix `@prefix opda: <https://opda.org.uk/pdtf/> .`)
> - physical resources + governance → **`https://opda.org.uk/harness/`**
> - future second standard → `https://opda.org.uk/<other>/`
>
> **Infrastructure:** the W3C PICG redirect (the original subject of this ADR) is **no longer needed** — opda controls `opda.org.uk` DNS + hosting directly and serves RDF from it. **Bearing on session-037 Q2:** opda-controlled hosting means per-term resolution / content-negotiation is fully in opda's hands (the w3id flat-302 limitation that was the last objection to slash is gone) — the council's slash verdict is reinforced; the hash recommendation's resolution premise no longer applies.
>
> *(The redirect-target persistence trade — losing the PICG guarantee that survives org changes — is the cost; opda accepts it. Re-open trigger: if opda's organisational continuity becomes a concern, reconsider a PICG redirect layer in front of `opda.org.uk`.)*

> ## ⚠ Amendment (2026-06-01) — `opda/pdtf` slash-based scheme
>
> On **directing-authority instruction** the namespace scheme is revised. This supersedes the **hash** commitment and the **`openpropdata.org.uk`** hosting/citation references in the body below (retained for provenance). The override is admissible because the ontology is **pre-publication** — no ecosystem-propagation cost yet applies (cf. the DPV slash→hash six-month precedent that motivated the original hash choice) — and the directing authority ratifies modelling decisions directly for this greenfield build. Where the body conflicts with this amendment, **the amendment governs**. Cross-corpus: **ODR-0004 §Rules.1's "single `opda:` HASH namespace" is correspondingly overridden** and must be amended to match.
>
> ### The scheme — four rules
> 1. **`opda` is the organisation; `pdtf` is the standard.** The ontology (Property Data Trust Framework) lives under `https://w3id.org/opda/pdtf/`.
> 2. **Slash, not hash.** Terms are per-term URIs; no `#` anywhere in the scheme.
> 3. **No version segment** in any IRI. Versioning is carried by an `owl:versionInfo` literal on the ontology, not the URL.
> 4. **No module segment** in term IRIs. One flat term namespace; the per-module TTL files are organisational splits, not URL segments.
>
> Prefix: `@prefix opda: <https://w3id.org/opda/pdtf/> .` — so `opda:Property` → `https://w3id.org/opda/pdtf/Property`.
>
> A second namespace, **`https://w3id.org/opda/harness/`**, replaces `openpropdata.org.uk`. The dividing line is **standard entities vs physical resources**:
> - **`…/pdtf/`** holds *only* the abstract published **standard entities** — the ontology classes and properties, and the SKOS concept schemes + concepts the standard defines. These are what a consumer cites *as* the PDTF standard.
> - **`…/harness/`** holds everything else: **physical resources** (the data-dictionary's concrete PDTF data-field entries; instance/test data; named graphs) and the **governance/build apparatus** (ADRs, ODRs, exemplars). The data-dictionary is *not* a standard entity — its entries are the physical PDTF data fields, so they live in the harness, not `/pdtf/`.
>
> ### Canonical mapping (old → new)
> | Kind | Old | New |
> |---|---|---|
> | Ontology term | `…/opda/#Property` | `…/opda/pdtf/Property` |
> | SKOS concept | `…/opda/#role/Buyer` | `…/opda/pdtf/role/Buyer` |
> | Concept scheme | `…/opda/vocabularies/role` | `…/opda/pdtf/role` |
> | data-dictionary entry *(physical PDTF data field — **not** a standard entity)* | `…/opda/data-dictionary#propertyPack.x.y` | `…/opda/harness/data-dictionary/propertyPack.x.y` |
> | Version IRI | `…/opda/1.0.0/` | *removed* → `…/opda/pdtf/` + `owl:versionInfo "1.0.0"` |
> | Per-module ontology IRIs | `…/opda/property`, `…/opda/property-shapes`, `…/opda/property/1.0.0/` | single flat `…/opda/pdtf/` namespace (no module segment) |
> | Profile | `…/opda/profiles/baspi5/0.1.0/` | `…/opda/pdtf/profiles/baspi5` |
> | Named graph | `…/opda/graph/foundation` | `…/opda/harness/graph/foundation` |
> | Instance/test data | `…/opda/data/baspi5-conformant/…` | `…/opda/harness/data/baspi5-conformant/…` |
> | ADR citation | `openpropdata.org.uk/adr/ADR-NNNN-slug` | `…/opda/harness/adr/ADR-NNNN-slug` |
> | ODR anchor | `…/opda/odr/ODR-NNNN#section-5a` | `…/opda/harness/odr/ODR-NNNN/section-5a` |
> | Exemplar anchor | `openpropdata.org.uk/data/exemplar/<stem>` | `…/opda/harness/data/exemplar/<stem>` |
> | SHACL shape *node* (base + profile) | `…/opda/#PropertyShape` | `…/opda/pdtf/PropertyShape` (co-normative; **no `/shacl/`**) — *session-037 Q7* |
> | SHACL shape / profile *document* | `…/opda/property-shapes`, `…/opda/profiles/baspi5` (doc IRI) | `…/opda/harness/…` (graph/document) — *session-037 Q7/Q8* |
> | Profile (form overlay) | `…/opda/profiles/baspi5/0.1.0/` | default `…/opda/harness/profiles/baspi5`; `…/opda/pdtf/profiles/baspi5` only on warranted adoption — *session-037 Q8, operator call* |
>
> ### Implementation note — multi-file ontology identity
> With no module segment, the six module TTLs can no longer each carry a distinct `…/opda/<module>` `owl:Ontology` IRI. Resolution: the published ontology is **one** `owl:Ontology` at `https://w3id.org/opda/pdtf/` (declared once); the module files contribute terms to it and are **not separately addressable** in the term URL scheme. Any document-level identity the build needs (e.g. per-file provenance) uses the **harness** namespace, never the `/pdtf/` term space.
>
> ### Redirect infrastructure (revised)
> **One** W3C PICG redirect on the owner directory — **`/opda/` → the hosting target** — with `/opda/pdtf/…` (standard entities) and `/opda/harness/…` (physical resources + governance/build) as **paths the host resolves** (council session-037 Q5: the harness is co-stewarded with pdtf, not separately delegable, so it is a path not a second coordinate namespace). Two coordinate redirects only if hosting genuinely requires pdtf and harness on different targets — a deploy-side detail this ADR already decouples from URI policy. The original single `/opda/ → openpropdata.org.uk/ontology/` rule below is superseded. *(If the directing authority accepts the council's Q2 hash recommendation, the host serves the single `pdtf` document and per-term hash fragments resolve client-side — no per-term resolution build needed.)*
>
> ### Council session-037 dispositions (2026-06-01) — proposed, operator ratifies
>
> [Session 037](../ontology/odr/council/session-037-url-scheme.md) (Full Council; Queen Kendall, DA Davis; Baker, Gandon, Allemang, Knublauch, Pandit) reviewed this scheme against best practice + the hm and DPV prior art. Decisive criterion (Baker, all-voices): **governance/identity boundaries in the URI; logical/serialisation/version distinctions in the triples — never in the URI string.** The base path (Q1, 7-0-0), version-out-of-IRI (Q3), flat namespace (Q4, 6-1-0), and the standard/physical distinction + data-dictionary→harness (Q5/Q6) are **affirmed**. Six amendments fold in:
>
> 1. **Q2 (hash vs slash) — REVISE toward HASH, ~5-2 (the council's strongest pushback; ⚠ contradicts directing-authority rule 2).** After full cross-talk a four-voice convergence — **Gandon (Cool URIs/httpRange-14) + Baker (W3C Best Practice Recipes 3-vs-4) + Pandit (DPV principal author) + Davis (DA)** — recommends **Option H: a hash within the standard segment, `https://w3id.org/opda/pdtf#Property`**, on a ground stronger than preference: **rule 2's slash override fails its OWN governing test.** ODR-0004 §Consequences / ADR-0006 already fixed *when* slash earns its keep — "≥1,000 terms OR a named per-term-content-negotiation consumer" — and **both limbs are unmet** (~147 terms, no named consumer). The greenfield-cost argument shows a switch is *cheap*, not *warranted*. And the cited precedents are **counter-evidence**: DPV is slash-to-module + `#`-within (`/dpv/pd#Address`), hm is slash-to-module — both license hash for the core, neither supports flat-slash-per-term (which takes Recipe-4 dereference cost at Recipe-3 scale — the worst trade). The Q5 `/harness/` split *keeps the term vocabulary small* (data-dictionary + profiles + instance data leave `/pdtf/`), which strengthens the hash case. **Council recommendation: revert to the ODR-0004 hash now (Option H); adopt slash only when a reopening trigger fires, and then as slash-to-module + hash-within, never flat slash.** Minority (Allemang on the schema.org flat-slash precedent; Knublauch deferring to the web-architects) holds for slash *if* opda commits to building per-term 303/content-negotiation (which w3id's flat 302 does not provide). **⚠ DIRECTING-AUTHORITY CALL:** rule 2 (no hash) was an explicit directive; the council's reasoned majority is *against* it. The operator ratifies — accept Option H (hash), or override the council and keep slash *with* a committed per-term resolution build.
> 2. **Q3 (versioning).** Keep the version-free term IRI **and** carry both `owl:versionIRI` and `owl:versionInfo` on the ontology header (OWL 2 §3.1 — `versionInfo` alone has no machine identity), plus a dated release snapshot under `/harness/release/<v>/`.
> 3. **Q4 (flat).** Flat now, with a recorded reopening criterion: *introduce a module segment only when a sub-vocabulary acquires an independent versioning clock OR is adopted/imported independently of the whole.*
> 4. **Q5 (split) — 7-0-0 (Davis fully withdrew).** Keep `/pdtf/` vs `/harness/`, governed by **Baker's binding placement procedure** (the session's most durable artefact, forced by Davis's "standing tribunal" attack): **(a)** placement test — *"would a consumer cite/version/deprecate this AS part of the normative standard?"* Yes → `/pdtf/`, No → `/harness/` (deterministic on all live cases + future kinds); **(b)** ambiguity fallback — default to `/harness/` (the re-classifiable side), promote to `/pdtf/` only by council, **never demote a published `/pdtf/` URI** (DCMI: a published term URI is never reassigned); **(c)** one-directional dependency — nothing in `/pdtf/` may `rdfs:isDefinedBy`/depend on `/harness/`. **Realisation (settled): `/harness/` is a PATH segment under ONE `/opda/` PICG redirect, NOT a second coordinate namespace** — the harness is definitionally opda-about-pdtf (co-stewarded, not separately delegable; Baker), and only a path segment is in the cold URI string at routing time (Allemang, httpRange-14). This is a REVISE of the proposal's "two coordinate redirects" → one redirect, two paths. *(Davis's mechanical "published-graph + `rdf:type`" test aligns with ODR-0027 and is the membership heuristic behind the placement test.)*
> 5. **Q7 (SHACL shapes) — 7-0-0.** Shape **nodes** (base + profile, `opda:` namespace) → `/pdtf/` (co-located with their `sh:targetClass`; co-normative with the ontology). Shape **documents** (serialised files / named graphs) → `/harness/`. **No `/shacl/` namespace** — the shapes-graph/data-graph separation (SHACL Rec §1.5) is a graph-level partition, not a naming one. *(This resolves the directing-authority's `/shacl/` question: rejected.)*
> 6. **Q8 (profiles) — disaggregate + WARRANTY test.** Profile **documents + conformant-submission fixtures** → `/harness/`. Profile **shape-node/resource** placement is governed by **warranty, not subject-matter** (Pandit): a profile opda governs and warrants as a normative PDTF conformance target → `/pdtf/profiles/<form>`; an overlay that merely maps to an externally-owned form (`dct:source` → third-party instrument: BASPI/TA6/CON29/LLC1) → `/harness/profiles/<form>`. **Default the 31 form overlays to `/harness/profiles/`; promote individually on a recorded warranted adoption.** ⚠ **OPERATOR POLICY CALL (open):** does opda publish the overlay profiles AS normative parts of the PDTF standard (→ promote to `/pdtf/profiles/`), or as opda's mapping-views onto externally-owned forms (→ `/harness/profiles/`)? The council defaults to harness pending this ruling.
>
> **Framing correction (record):** opda diverges from **both** DPV (slash-module + `#`-terms) and hm (`/ns/pf/`, `/ns/sds/` context modules) on hash (Q2) and modules (Q4) — *deliberately, on pre-publication + single-context grounds*. DPV is a **counter-precedent** to flat-slash-per-term, not an endorsement of it; do not cite it as supporting slash.

## Context and Problem Statement

[ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §Rules.1 (ratified at Council [Session 004](../ontology/odr/council/session-004-pdtf-ontology-foundation.md), 2026-05-27) commits the OPDA ontology to a **single `opda:` HASH namespace** but deliberately defers the literal base URI to the OPDA Working Group. The Council named three candidates (S004 Q7):

- `https://opda.uk/ns/` — institutional, OPDA-org-lifecycle-dependent.
- `https://w3id.org/opda/` — W3C Permanent Identifier Community Group (PICG); survives org changes.
- `https://trust.propdata.org.uk/ontology/` — rejected at S004 on programme-namespace-coupling grounds.

Knublauch's DA primary demand at S004 was specifically `w3id.org/opda/` for the **PICG persistence guarantee**: w3id.org redirects are maintained by the W3C community independent of any single organisation's lifecycle. Pandit cited the same reason as principal author of DPV's adoption of `https://w3id.org/dpv/`.

The WG decision was taken on 2026-05-27: **adopt `w3id.org/opda/` with hash suffix**, i.e. terms resolve as `https://w3id.org/opda/#Property`, `https://w3id.org/opda/#LegalEstate`, etc.

w3id.org does not itself host content — it issues HTTP redirects to the actual ontology hosting. The infrastructure work this ADR records is therefore distinct from the modelling decision: it commits OPDA to (a) submitting the redirect rule to the W3C PICG repository, (b) hosting the actual ontology artefacts at a stable target the redirect points at, and (c) maintaining the redirect-target pairing across future moves.

This is the first cross-corpus ADR connecting the ADR programme (engineering decisions) to the ODR programme (ontology-modelling decisions). DCAP boundary: ODR-0004 owns the *namespace string*; this ADR owns the *redirect infrastructure*.

## Decision Drivers

* **PICG persistence guarantee.** URIs stay stable independent of OPDA's organisational survival, rebrand, or domain changes — the costly-to-fix problem (DPV slash→hash precedent: six ecosystem-months to propagate).
* **DPV precedent.** Pandit's choice for DPV (`w3id.org/dpv/`) is the closest analogue and the principal-author endorsement.
* **OPDA already controls `openpropdata.org.uk`.** The institutional web domain exists and can serve as the redirect target without new DNS work.
* **w3id.org submission is one PR.** Onboarding cost is small; ongoing cost is near-zero (only edit the redirect target when hosting moves).
* **Single point of failure mitigation.** PICG-maintained redirects are infrastructure OPDA does not have to operate.

## Considered Options

* **A — `https://opda.uk/ns/` (institutional only).** Direct, no external dependency. Rejected because OPDA-org persistence is weaker than W3C PICG.
* **B — `https://w3id.org/opda/#` via W3C PICG redirect (chosen).** PICG persistence; redirect to OPDA-hosted TTL.
* **C — `https://openpropdata.org.uk/ns/#` (institutional, opda's actual domain).** Briefly chosen 2026-05-27 then reverted in favour of B on the persistence-guarantee argument.
* **D — `https://trust.propdata.org.uk/ontology/`.** Rejected at S004 on programme-namespace-coupling grounds (no champion).

## Decision Outcome

Chosen option: **B — `https://w3id.org/opda/#` via W3C PICG redirect**, because it satisfies all four decision drivers and meets Knublauch's S004 DA primary demand. The redirect target is `https://openpropdata.org.uk/ontology/` — the OPDA institutional domain serves the actual TTL; w3id.org issues the persistent URIs that consumers cite.

The literal prefix declaration in all OPDA TTL artefacts will be:

```turtle
@prefix opda: <https://w3id.org/opda/#> .
```

The redirect rule submitted to [`perma-id/w3id.org`](https://github.com/perma-id/w3id.org) is shaped:

```apacheconf
# /opda/.htaccess (or equivalent)
RewriteRule ^(.*)$ https://openpropdata.org.uk/ontology/$1 [R=302,L]
```

(302 not 301 — leaves the redirect editable without breaking cached consumers. Switch to 301 once the hosting target stabilises.)

The hosting target itself (`https://openpropdata.org.uk/ontology/`) is provisioned by the Astro site build (see [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md)); the generator emits `opda-classes.ttl`, `opda-shapes.ttl`, and `opda-annotations.ttl` into a `public/ontology/` tree per ODR-0004 §6a.

### Consequences

* Good, because URIs stay persistent independent of OPDA's organisational lifecycle (W3C PICG persistence guarantee — DPV precedent).
* Good, because Knublauch DA primary demand at S004 Q7 is met; ODR-0004 can move `status: proposed → accepted` once the literal string lands in §Rules.1.
* Good, because OPDA-side maintenance is reduced to a single redirect line in a public W3C-managed repository.
* Good, because the redirect target (`openpropdata.org.uk/ontology/`) is on a domain OPDA already controls — no new DNS work, no new domain registration.
* Good, because the choice of redirect target is decoupled from URI policy: future moves (e.g. content-delivery-network hosting) are deploy-side concerns and do not invalidate any minted URI.
* Bad, because resolution now depends on W3C PICG infrastructure; a w3id.org outage breaks all OPDA URI dereferencing for the duration.
* Bad, because the PR to `perma-id/w3id.org` is asynchronous: merge time is community-paced (typically days to a week). Mitigation: TTL emission can proceed in parallel; consumers loading local copies are unaffected.
* Bad, because the redirect must be maintained in two places (the perma-id PR + the OPDA-side hosting target). Mitigation: redirect target rarely changes; OPDA-side hosting is part of the existing Astro build pipeline.
* Neutral, because the hash-vs-slash decision (ODR-0004's hash commitment) is preserved — terms are addressed as fragments of the ontology document, not per-term URIs. Reopening trigger stays as ODR-0004 §Consequences records it.

### Confirmation

The ADR is honoured when all five hold:

1. **PR submitted.** A pull request against [`perma-id/w3id.org`](https://github.com/perma-id/w3id.org) adding `/opda/` redirect to `https://openpropdata.org.uk/ontology/`.
2. **PR merged.** W3C PICG community-merge completes (typically 2-10 days).
3. **Live resolution.** `curl -IL https://w3id.org/opda/foundation.ttl` returns 302 → 200 with `Content-Type: text/turtle`.
4. **ODR-0004 amended.** §Rules.1 placeholder ("WG-owned open question") replaced with the literal string `https://w3id.org/opda/#`; §References cites this ADR.
5. **Status sweep complete.** Every ODR with `depends-on: [ODR-0004]` moves `status: proposed → accepted` per the dependency chain (ODR-0002 through ODR-0018 inclusive).

CI test (deploy pipeline): byte-identity of regenerated TTL against committed sources (ODR-0004 §6a) plus a `curl` probe asserting both `https://w3id.org/opda/foundation.ttl` and `https://openpropdata.org.uk/ontology/foundation.ttl` return the same byte-identical document.

## Pros and Cons of the Options

### A — `https://opda.uk/ns/` (institutional only)

* Good, because direct: one URL, no external dependency, full OPDA control.
* Bad, because OPDA must commit to keeping `opda.uk` resolving forever, including across organisational changes — Knublauch's S004 primary attack.
* Bad, because no DPV-style precedent; pure institutional persistence is weaker than W3C PICG.

### B — `https://w3id.org/opda/#` via W3C PICG redirect (chosen)

* Good, because PICG persistence guarantee survives OPDA org changes (the costly-to-fix problem).
* Good, because aligns with DPV's choice (Pandit's principal-author endorsement).
* Good, because OPDA-side maintenance cost lowered to a single redirect line.
* Bad, because resolution depends on w3id.org availability (a W3C-community-operated service).
* Bad, because PR-to-merge cycle is community-paced — short asynchronous delay before resolution goes live.

### C — `https://openpropdata.org.uk/ns/#` (OPDA institutional, full domain)

* Good, because uses OPDA's actual existing domain (`openpropdata.org.uk`) rather than the `opda.uk` shortened form.
* Bad, because still institutional persistence — same critique as Option A.
* Bad, because no W3C PICG layer of indirection; future moves invalidate URIs.

### D — `https://trust.propdata.org.uk/ontology/` (programme-namespace)

* Bad, because couples the namespace string to a programme name (`trust.propdata`) — rejected at S004 on lack-of-champion grounds.

## More Information

* **Modelling decision** (ODR corpus, cross-corpus dependency): [ODR-0004 — PDTF Ontology Foundation](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), §Rules.1 (single `opda:` HASH namespace) and §References (Open questions: namespace string). This ADR records the engineering realisation of that rule.
* **Ratification provenance** (ODR corpus): [Session 004](../ontology/odr/council/session-004-pdtf-ontology-foundation.md), Q7 (namespace-as-blocker; w3id.org alternative named by Knublauch). Vote 9-0 with full Knublauch DA withdrawal on all four primary attacks.
* **Author-only Session 003b** (planned): records the WG namespace decision into ODR-0004's `## Rules` and the [adoption record](../ontology/odr/council/adoption.md) track record. Pairs with this ADR.
* **DPV precedent**: W3C Data Privacy Vocabulary at [`https://w3id.org/dpv/`](https://w3id.org/dpv/) — Pandit's principal-author choice, cited by Knublauch as the operationally-strongest analogue. DPV's slash→hash transition in 2019 took approximately six ecosystem-months to propagate; the persistence guarantee is what makes that recoverable.
* **W3C PICG repository**: [`https://github.com/perma-id/w3id.org`](https://github.com/perma-id/w3id.org). Submission process: open a PR adding the `/opda/` directory with redirect rules. Community review by PICG maintainers.
* **Hosting target**: `https://openpropdata.org.uk/ontology/` — see [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) for the Astro build pipeline that emits and serves the TTL artefacts.
* **Reopening trigger** (inherited from ODR-0004 §Consequences): the hash decision is reversible only at high cost. The WG SHOULD record a concrete reopening criterion (suggested: any single ontology file exceeds 1,000 terms in active dereference traffic OR a named consumer requests per-term content negotiation).
* **First cross-corpus ADR**. This ADR is the bootstrap of the ontology-implementation ADR programme referenced in [`docs/plan/council-followup-sessions.md`](../plan/council-followup-sessions.md) §1 ("Implementation is handled by a separate ADR programme"). Subsequent ADRs will realise additional ratified ODRs.
