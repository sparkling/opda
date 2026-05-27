# W3C PICG PR — Register `/opda/` redirect

Drafted 2026-05-27 per [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md). Submit as a pull request to [`perma-id/w3id.org`](https://github.com/perma-id/w3id.org) on GitHub. This document records the PR content, submission process, and confirmation criteria so the submission is reproducible and the maintainer-side commitments are clear.

## Submission target

- **Repository:** [`perma-id/w3id.org`](https://github.com/perma-id/w3id.org)
- **Branch:** create a feature branch from `master`, e.g. `add-opda-redirect`.
- **Files added:** one new directory `/opda/` with a single `.htaccess` file.
- **Reviewer pool:** W3C Permanent Identifier Community Group maintainers (volunteer-driven; merge cadence is typically 2-10 days; longer for first-time contributors).

## Files added

### `/opda/.htaccess`

```apacheconf
# OPDA — Open Property Data Association
# Ontology namespace redirect
# Maintainer: Henrik Pettersen (henrik@sparklingideas.co.uk)
# Organisation: OPDA — Open Property Data Association (https://openpropdata.org.uk/)
# Contact: contact@openpropdata.org.uk
# Reference: https://github.com/sparkling/opda/blob/main/docs/adr/ADR-0006-w3id-opda-ontology-namespace.md

Options +FollowSymLinks
RewriteEngine on

# Redirect /opda/ root and /opda/<term> to the OPDA-hosted ontology
RewriteRule ^$ https://openpropdata.org.uk/ontology/ [R=302,L]
RewriteRule ^(.+)$ https://openpropdata.org.uk/ontology/$1 [R=302,L]
```

**Notes on the .htaccess:**

- **302 (temporary) not 301 (permanent).** The redirect target may change as OPDA's hosting infrastructure stabilises (e.g. CDN migration). 302 allows the target to evolve without breaking cached client behaviour. Switch to 301 once the hosting target is fixed for the foreseeable future (ADR-0006 §Decision Outcome).
- **Single-rule redirect.** OPDA does not currently publish multi-format representations (no separate `.ttl` vs `.html` vs `.rdf` variants); a single rewrite is sufficient. If/when OPDA adds content negotiation (Accept-header-based format dispatch), the rule can extend without invalidating any minted URI.
- **No `Options +MultiViews`** — OPDA does not yet need content negotiation at the redirect layer. The hosting target (`openpropdata.org.uk/ontology/`) handles its own serving discipline.

## PR description (draft)

Use the following text as the PR description on `perma-id/w3id.org`:

```markdown
# Add `/opda/` redirect for the OPDA ontology

This PR registers the `/opda/` path under w3id.org as the persistent namespace
for the **OPDA (Open Property Data Association)** linked-data ontology
programme. OPDA is a UK-based industry association establishing a Trust
Framework and open-data standards for residential property transactions.

The ontology covers property identity, agents and roles, transaction
lifecycle, claims and provenance, governance, overlay profiles, and SHACL
validation — published as a single hash namespace following the same
W3C-PICG-redirected pattern adopted by DPV (`w3id.org/dpv/`) at the
recommendation of DPV's principal author Harshvardhan Pandit.

## Maintainers

- **Primary maintainer:** Henrik Pettersen (henrik@sparklingideas.co.uk)
- **Organisation:** OPDA — Open Property Data Association
- **Organisation URL:** https://openpropdata.org.uk/
- **Source repository:** [public OPDA repo — link to be inserted when published]

## Redirect target

`https://openpropdata.org.uk/ontology/`

The target serves the canonical OPDA TTL artefacts (`foundation.ttl`,
`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`, and per-module
`.ttl` files emitted by the OPDA generator) per the ontology's published
[ADR-0006](https://openpropdata.org.uk/adr/ADR-0006-w3id-opda-ontology-namespace).

## Persistence commitment

OPDA commits to maintaining the redirect target indefinitely. The W3C PICG
persistence guarantee insulates consumers from any future change to OPDA's
hosting infrastructure — the redirect can be updated via PR to this
repository without breaking any minted URI.

## License

OPDA ontology artefacts are published under CC0 1.0 Universal (Public
Domain Dedication), consistent with the open-data discipline of the OPDA
Trust Framework.

## Verification

After merge:
- `curl -IL https://w3id.org/opda/` returns 302 → 200
- `curl -L https://w3id.org/opda/foundation.ttl` returns `Content-Type: text/turtle`
- A consumer SPARQL query against `<https://w3id.org/opda/#Property>` resolves to the canonical Property class.
```

## Submission process

1. **Fork** `perma-id/w3id.org` on GitHub.
2. **Create branch** `add-opda-redirect` from `master`.
3. **Add** the `/opda/.htaccess` file per the content above. No other files.
4. **Commit** with message: `Add OPDA — Open Property Data Association ontology redirect`.
5. **Open PR** against `perma-id/w3id.org:master` with the description above. Reference [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md) and [Session 003b](../odr/council/session-003b-namespace-wg-decision.md) for provenance.
6. **Respond** to PICG maintainer questions promptly. Typical clarifications: license disclosure (CC0 confirmed above); active-maintenance commitment (Henrik named as primary maintainer); redirect-target reachability (verifiable once OPDA hosts the canonical TTL).
7. **Wait** for merge. Volunteer-driven; typical 2-10 days. First-time contributor PRs may take longer.

## Pre-submission checklist

Before opening the PR, verify:

- [ ] `https://openpropdata.org.uk/ontology/` resolves (or returns a holding page) — the redirect target must exist or be planned imminently.
- [ ] OPDA Working Group has endorsed the namespace decision — recorded in [Session 003b](../odr/council/session-003b-namespace-wg-decision.md).
- [ ] [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md) is committed and accessible (public-repo URL or temporarily-shared draft).
- [ ] OPDA license position confirmed (CC0 default per open-data discipline; verify before submission).
- [ ] Primary maintainer contact details current.

## Post-merge tasks

After the PR merges:

- [ ] Verify live resolution: `curl -IL https://w3id.org/opda/foundation.ttl` returns 302 → 200 with `Content-Type: text/turtle`.
- [ ] Update [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — `status: proposed → accepted`; record merge date in §"Confirmation"; tick all five confirmation criteria.
- [ ] Update [Session 003b transcript](../odr/council/session-003b-namespace-wg-decision.md) — add a post-merge note recording PR URL + merge date.
- [ ] Optional: switch redirect to **301** once hosting target stabilises (separate small PR to `perma-id/w3id.org`).

## References

- **Decision provenance:** [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md), [Session 003b](../odr/council/session-003b-namespace-wg-decision.md), [Session 004 Q7](../odr/council/session-004-pdtf-ontology-foundation.md).
- **DPV precedent:** [`https://w3id.org/dpv/`](https://w3id.org/dpv/) — Pandit's principal-author choice for identical persistence reasons. Reference for PR review.
- **W3C PICG charter:** https://w3.org/community/perma-id/
- **Repository:** [`perma-id/w3id.org`](https://github.com/perma-id/w3id.org)
- **Sample PRs to review for shape/structure:** check recent merges to the same repository before opening — conventions evolve.
