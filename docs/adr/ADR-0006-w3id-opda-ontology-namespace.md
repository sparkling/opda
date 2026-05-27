---
status: proposed
date: 2026-05-27
tags: [ontology, namespace, infrastructure, w3c, picg, deployment]
supersedes: []
depends-on: [ODR-0004]
implements: []
---

# Ontology namespace at w3id.org/opda/ via W3C PICG redirect

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
