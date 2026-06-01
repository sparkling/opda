---
status: accepted
date: 2026-05-27
amended: 2026-06-01
tags: [ontology, namespace, infrastructure, w3c, picg, deployment, pdtf, slash, harness]
supersedes: []
depends-on: [ODR-0004]
implements: []
---

# Ontology namespace at w3id.org/opda/ via W3C PICG redirect

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
> A second namespace, **`https://w3id.org/opda/harness/`**, replaces `openpropdata.org.uk` for every **non-term build/governance artefact** (ADRs, ODRs, exemplars, named graphs, instance/test data). The **standard's content** (terms, SKOS schemes, the data-dictionary) lives under `…/pdtf/`; the **harness** holds everything that is *about* the standard rather than *part of* it.
>
> ### Canonical mapping (old → new)
> | Kind | Old | New |
> |---|---|---|
> | Ontology term | `…/opda/#Property` | `…/opda/pdtf/Property` |
> | SKOS concept | `…/opda/#role/Buyer` | `…/opda/pdtf/role/Buyer` |
> | Concept scheme | `…/opda/vocabularies/role` | `…/opda/pdtf/role` |
> | data-dictionary entry | `…/opda/data-dictionary#propertyPack.x.y` | `…/opda/pdtf/data-dictionary/propertyPack.x.y` |
> | Version IRI | `…/opda/1.0.0/` | *removed* → `…/opda/pdtf/` + `owl:versionInfo "1.0.0"` |
> | Per-module ontology IRIs | `…/opda/property`, `…/opda/property-shapes`, `…/opda/property/1.0.0/` | single flat `…/opda/pdtf/` namespace (no module segment) |
> | Profile | `…/opda/profiles/baspi5/0.1.0/` | `…/opda/pdtf/profiles/baspi5` |
> | Named graph | `…/opda/graph/foundation` | `…/opda/harness/graph/foundation` |
> | Instance/test data | `…/opda/data/baspi5-conformant/…` | `…/opda/harness/data/baspi5-conformant/…` |
> | ADR citation | `openpropdata.org.uk/adr/ADR-NNNN-slug` | `…/opda/harness/adr/ADR-NNNN-slug` |
> | ODR anchor | `…/opda/odr/ODR-NNNN#section-5a` | `…/opda/harness/odr/ODR-NNNN/section-5a` |
> | Exemplar anchor | `openpropdata.org.uk/data/exemplar/<stem>` | `…/opda/harness/data/exemplar/<stem>` |
>
> ### Implementation note — multi-file ontology identity
> With no module segment, the six module TTLs can no longer each carry a distinct `…/opda/<module>` `owl:Ontology` IRI. Resolution: the published ontology is **one** `owl:Ontology` at `https://w3id.org/opda/pdtf/` (declared once); the module files contribute terms to it and are **not separately addressable** in the term URL scheme. Any document-level identity the build needs (e.g. per-file provenance) uses the **harness** namespace, never the `/pdtf/` term space.
>
> ### Redirect infrastructure (revised)
> Two W3C PICG redirects: **`/opda/pdtf/`** (the standard) and **`/opda/harness/`** (governance/build) → the hosting target(s). The bare `/opda/` redirect may remain for the organisation. The original single `/opda/ → openpropdata.org.uk/ontology/` rule below is superseded.

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
