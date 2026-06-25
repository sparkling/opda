---
status: proposed
date: 2026-06-25
tags: [website, governance, members, provenance, accreditation]
supersedes: []
depends-on: []
implements: []
---

# Stakeholder-review remediation: member parity, propdata.org.uk provenance, Moverly, and accreditation-gap corrections

## Context and Problem Statement

A stakeholder review by **Maria Harris** raised a second batch of corrections — distinct from the terminology/diagram/standards batch in **ADR-0051** — concerning member representation, the provenance of inherited technical content, and the accuracy of accreditation-gap claims on the public OPDA site. Several items are **not code changes in this repository**: they are actions on the WordPress marketing site (run by Darwin) or governance workstreams blocked on external owners. This ADR records all of them so the code-actionable parts can be implemented and the external/blocked parts are tracked rather than lost.

The items:

1. **Member landing-page parity.** On the WordPress member custom post type, only four members have a dedicated landing page — believed to be an incomplete test set-up by Darwin, not a deliberate distinction. All members should be recognised the same way.
2. **propdata.org.uk provenance.** References throughout the site point at draft standards on the legacy developer site `https://propdata.org.uk/`. That site carries OPDA copyright but was **not authored or approved by OPDA**, and OPDA cannot edit it (no domain access). Its content is not necessarily wrong, but specific approaches — e.g. its use of **Decentralised Identifiers (DIDs)** — are **not an official OPDA / MHCLG / DPMSG-approved approach**. Such technical decisions still need to be explored, tested, and certified against the emerging **Smart Data Guidebook** and aligned to the **DSIT Digital Verification Services** standards, and federated with the other smart-data scheme providers.
3. **Moverly representation.** Moverly was a founding member and a key author of the schema, but is **no longer a member** and is therefore not part of OPDA's accreditation or approvals process (and, as far as known, not part of the sandbox project and unlikely to be). References throughout the site must represent this accurately — crediting the historical authorship without implying current membership/endorsement.
4. **Trust & interoperability policy workstream.** This workstream sits with **Tom Treadwell at MHCLG** and cannot progress until the MHCLG consultation response is published — which is why its folder is empty. The emptiness should be explained, not read as an oversight.
5. **RICS-approved surveying firm "gap".** The site implies OPDA lacks a RICS-approved surveying firm. In fact **Connells Group** (which includes **Connells** and **Countrywide Surveyors**) and **MAB** (which includes **Pinnacle Surveyors**) provide this — they are simply not broken out into their individual brand/entity firms. Decomposing the brands narrows (and likely closes) the apparent gap.
6. **Transition-bridging tooling.** The review endorsed the recommendations for bridging the current→new schema transition and providing implementation tooling for industry, and asked what funding/resource would be required to deliver them (project funding may have scope to cover it).

## Decision Drivers

* Fairness and accuracy of member representation (parity; correct current-vs-former status).
* Provenance integrity: the site must not present unratified third-party technical approaches as OPDA-endorsed.
* Federated alignment: technical references point at the cross-scheme canon (Smart Data Guidebook, DSIT Digital Verification Services), not legacy artefacts.
* Honest gap reporting: don't overstate accreditation gaps that are artefacts of brand aggregation.
* Separation of concerns: distinguish this-repo code changes from WordPress/governance actions owned elsewhere.

## Considered Options

* **Implement the code-actionable items now; track the external/blocked items as recorded actions** — fix the in-repo content (provenance caveats, Moverly framing, surveyor decomposition, workstream annotation, tooling/funding note) and hand the WordPress and MHCLG-owned items back as owner-assigned actions.
* **Block the whole batch** until the external items (WordPress access, MHCLG consultation response) resolve.
* **Piecemeal edits** without a recorded decision.

## Decision Outcome

Chosen option: **"Implement the code-actionable items now; track the external/blocked items as recorded actions."** Most of the value is in-repo and unblocked; the two genuinely external items (WordPress member pages; the trust & interoperability workstream) have named owners and clear blockers, so they are recorded as actions rather than gating the rest.

### Implementation tasks (in-repo, code-actionable)

* **Item 2 — propdata.org.uk provenance.** For each live-site reference (≈16 pages incl. `src/pages/glossary.astro`, `src/pages/modelling/{standards-stack,jsonld-mappings,overlays}.astro`, `src/pages/governance/{stakeholder-engagement,opda-members,conformance-scheme,toip-governance,strategic-alignment,uk-initiative}.astro`, `src/pages/implementation/{validation,quickstart}.astro`, `src/pages/adoption/member-implementations.astro`, `src/pages/library/library-overview.astro`, `src/pages/strategy/industrial-strategy.astro`, `src/pages/governance/deferred-work.astro`): add a clear provenance caveat that propdata.org.uk content is **not OPDA-authored/approved**, and re-frame any presentation of its technical approaches (especially **DIDs**) as **exploratory / not yet OPDA- or MHCLG/DPMSG-ratified**, pending the Smart Data Guidebook and DSIT Digital Verification Services. Do **not** edit the archived snapshot under `source/07-website/related-domains/propdata.org.uk/`. Coordinate with **ADR-0051 Thread 4** (which re-anchors the forward-looking standards references) to avoid double-editing the same lines.
  * Exclude dated decision records (`src/generated/odr/ODR-0004.html` and the like) from silent rewrites.
* **Item 3 — Moverly.** Across the ≈10 referencing pages (`src/pages/adoption/{adoption-overview,index,smart-data-challenge,member-implementations}.astro`, `src/pages/modelling/{bounded-contexts,standards-stack}.astro`, `src/pages/glossary.astro`, `src/pages/library/transcript-archive.astro`, `src/pages/engagement/{video-library,engagement-overview}.astro`): reword so Moverly's **historical** role (founding member, key schema author) is credited in the past tense and current references do **not** imply present membership, accreditation, approvals participation, or sandbox involvement. This composes with ADR-0051's removal of "Smart Data Challenge" from the UK-initiative Tier-4 chart box (the Challenge entry described the Moverly+OPDA prototype).
* **Item 4 — Trust & interoperability workstream.** Where the empty workstream surfaces (`src/pages/governance/{steering-forums,meetings-and-feedback,stakeholder-engagement}.astro` and any workstream folder/index): add a short note that it is **owned by Tom Treadwell (MHCLG)** and **blocked pending publication of the MHCLG consultation response**, so the absence of material reads as intentional.
* **Item 5 — Surveyor decomposition.** In the member/coverage data (`src/lib/site.ts`) and any accreditation-coverage / gap-analysis surface that asserts a missing RICS-approved surveyor: break **Connells Group → Connells + Countrywide Surveyors** and **MAB → Pinnacle Surveyors** into their constituent brand/entity firms, and correct any "no RICS-approved surveying firm" claim. Review other aggregated brands for the same pattern and decompose where a regulated entity firm exists.
* **Item 6 — Transition tooling + funding.** Keep the transition-bridging tooling recommendations; add a note (e.g. in the relevant adoption/roadmap surface and/or the deferred-work register `src/pages/governance/deferred-work.astro` + ADR-0005) capturing that **funding/resource needs should be surfaced to the stakeholder**, since existing project funding may have scope to deliver them.

### Recorded actions (external / not implementable in this repo)

* **Item 1 — WordPress member landing pages.** OWNER: **Ben Kansy, Darwin (ben@wearedarwin.co.uk)**. Action: confirm whether the four existing member landing pages were an incomplete Darwin test, and roll dedicated landing pages out to **all** members for parity. This is on the WordPress marketing site, not this repository — surface to the stakeholder; if it turns out to need a config/content change Henrik can make in WP, request specifics.
* **Item 4 — Workstream content.** OWNER: **Tom Treadwell (MHCLG)**. Blocked until the MHCLG consultation response is published; only the explanatory annotation (above) is actionable now.
* **Item 6 — Funding ask.** Surface the funding/resource requirement for transition tooling to the stakeholder for a decision against existing project funding.

### Consequences

* Good, because member representation becomes fair and current (parity intent recorded; Moverly correctly framed as a former member).
* Good, because the site stops implying OPDA endorsement of unratified third-party technical approaches (propdata.org.uk / DIDs), reducing governance risk.
* Good, because the RICS-surveyor "gap" is corrected, improving the accuracy of accreditation-coverage claims.
* Good, because the empty trust & interoperability workstream is explained rather than appearing neglected.
* Neutral, because two items (WordPress parity, workstream content) are owned externally and only trackable, not implementable, here.
* Bad, because the propdata.org.uk and Moverly reword touches many pages and overlaps ADR-0051; the two implementation passes must be coordinated/sequenced to avoid conflicting edits.

### Confirmation

* No live page presents a propdata.org.uk technical approach (esp. DIDs) without a provenance/not-yet-ratified caveat.
* No live page implies Moverly is a current member / accredited / in the approvals or sandbox process; historical authorship is credited in the past tense.
* The trust & interoperability workstream surface carries the owner + blocker note.
* The accreditation-coverage surface lists Connells, Countrywide Surveyors, and Pinnacle Surveyors (via Connells Group / MAB) and no longer claims a missing RICS-approved surveyor.
* Recorded actions (WordPress parity; workstream content; funding ask) are captured and assigned to their named owners.
* `make test` green; `make build` clean for edited pages.

## More Information

* **Stakeholder source:** Maria Harris (site review). Companion decision: **ADR-0051** (site content realignment — DVSTF/SPDTF, UK-initiative chart, standards alignment, MHCLG roadmap), which shares this review's provenance and overlaps on the propdata.org.uk and Smart Data Challenge / Moverly threads. The two implementation passes **must be coordinated or sequenced** (shared files: `glossary.astro`, `modelling/standards-stack.astro`, `governance/uk-initiative.astro`, `strategy/industrial-strategy.astro`, several adoption pages).
* **External owners:** Ben Kansy — Darwin, ben@wearedarwin.co.uk (WordPress member CPT landing pages). Tom Treadwell — MHCLG (trust & interoperability policy workstream, blocked on the MHCLG consultation response).
* **Alignment targets** (per Item 2): emerging Smart Data Guidebook (draft), DSIT Digital Verification Services standards, federation with other smart-data scheme providers (Open Banking, Open Energy/Perseus) — see ADR-0051 Thread 4 for the pending external inputs.
