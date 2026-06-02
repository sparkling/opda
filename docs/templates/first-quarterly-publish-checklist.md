---
title: "First quarterly publish — checklist (reusable each quarter)"
purpose: "Pre-publish sign-offs, smoke tests, and comms plan for the Accreditation Directory's quarterly refresh"
source: "ADR-0005 register item C3; ADR-0004 §4 (Update cadence — quarterly)"
owner: "C&R WG + Technical WG (jointly)"
status: "Draft scaffold · awaiting first publish; reusable thereafter"
last_updated: "2026-05-19"
---

# First quarterly publish — checklist (reusable each quarter)

## Purpose

[ADR-0005](../adr/ADR-0005-deferred-work-register.md) register item C3 marks the **first quarterly publish** of the Accreditation Directory as the end-of-quarter milestone where the Directory first holds real, member-submitted data — downstream of A1–A4 (Wave 2 content), C1 (build pipeline), and C2 ([VC submission tooling](./vc-submission-spec.md)). This checklist is the runbook for that publish, and intentionally reusable each subsequent quarter so the first run is not a one-off.

The cadence itself sits in [ADR-0004](../adr/ADR-0004-accreditation-directory.md) §4: VCs in by the 15th of the quarter-end month; Directory refreshed by the 1st of the following quarter. The timeline below pegs to that.

## Pre-flight (T-14 days)

Roughly mid-month of the quarter-end month — i.e. the 15th of March / June / September / December.

- [ ] All member firms notified of submission window opening; reminder of cutoff (per ADR-0004 §4 the cutoff is the 15th of the quarter-end month).
- [ ] Credentials directory `source/04-governance-bodies/accreditation/credentials/{quarter}/` exists and contains the expected VCs (or accepted-late submissions logged).
- [ ] `scripts/build-accreditation-directory.mjs` runs locally without errors against the current credentials directory.
- [ ] Data Quality framework version and Data Security framework version tagged in the Trust Registry — the build pipeline pins to specific framework revs per ADR-0004 §5.
- [ ] OPDA-listed audit-partner roster ([ADR-0005](../adr/ADR-0005-deferred-work-register.md) item C4) is current; any new audit partners added since the last publish are reflected in the Trust Registry's audit-attestation allowlist.
- [ ] Engagement WG has answered any firm-side queries from the prior 4 weeks; outstanding questions logged.

## Smoke tests (T-2 days)

Roughly the 29th–30th of the quarter-end month.

- [ ] `node scripts/build-accreditation-directory.mjs --dry-run` emits a schema-valid `src/data/accreditation/current.json` without writing.
- [ ] Diff between dry-run JSON and last quarter's `current.json` reviewed — large unexpected deltas (e.g. a firm dropping multiple capability scores) flagged for sanity check before publish.
- [ ] `pnpm run build` succeeds against the dry-run JSON (no Astro page errors, no broken links).
- [ ] Local render of `/governance/accreditation-directory` shows the expected firms with the expected AL coverage badges and per-section averages.
- [ ] `scripts/smoke-test.mjs` (Playwright) passes. The script exists; for the first publish there is no dedicated staging URL, so it runs against the local preview (see Decisions §1).
- [ ] Spot-check **3 random firms** by hand: pull each firm's submitted VC from `source/04-governance-bodies/accreditation/credentials/`, eyeball the cards on the staging Directory, confirm scores match exactly. Discrepancy = blocker.
- [ ] Stale-flag logic verified (per ADR-0004 §4): firms whose data is >9 months old are showing the "stale" badge; firms within the freshness window are not.

## Publish day

The 1st of the month following quarter end.

- [ ] Run the build pipeline against the final credentials directory: `node scripts/build-accreditation-directory.mjs`.
- [ ] Commit the generated `src/data/accreditation/current.json` with a message of the form `accreditation: publish YYYY-Qn`.
- [ ] Tag the commit `accreditation-YYYY-Qn` so the published state is recoverable.
- [ ] Deploy the site (existing OPDA deploy path — no special infrastructure per ADR-0004 §1).
- [ ] Verify the live URL `/governance/accreditation-directory` renders the new quarter's data; confirm with one round of "click three firms, check three things" against the staging diff from T-2.
- [ ] Sign-off recorded in the EC decision log per `governance.md` §6.

## Comms (publish day + 1)

The 2nd of the month following quarter end. **Decided:** member firms and the public are notified **same-day** (avoids leak risk) — the private member notice goes out first thing, the public announcement later the same day.

- [ ] Member firms — private notice that the Directory has been refreshed; specifically flag any firm whose score changed materially since last quarter so they are not surprised by external questions.
- [ ] Engagement WG announces publicly via the usual channels (OPDA mailing list, openpropdata.org.uk update, member-only Slack if used).
- [ ] Regulators (FCA, ICO) cc'd on the public announcement **only if material changes**. Material = a new capability area shipping (e.g. first quarter that includes Security capability scores), an OPDA-published threshold change, or a member-firm AL coverage change at scale. Routine quarterly refreshes do not warrant regulator cc.
- [ ] DPMSG informed via the existing steering channel.

## Sign-off matrix

**Decided:** the four roles below sign off (defaults adopted); names are filled per cycle.

| Role | Name | Signature / date |
|---|---|---|
| C&R WG chair | _TBC_ | |
| Tech WG chair | _TBC_ | |
| EC chair | _TBC_ | |
| Independent Chair | _TBC_ | |

Each signature represents acceptance that the publish meets the standard from this checklist — not endorsement of any particular firm's score. A firm-specific concern is raised via the audit-trail mechanism in ADR-0004 §6, not by blocking the publish.

## Lessons learned (filled after publish)

This section is empty by design — populated immediately after each publish as a post-mortem block. Capture:

- Anything that broke or nearly broke.
- Anything that took longer than expected.
- Anything a firm reported confusion about.
- Anything the next checklist iteration should add or remove.

The Lessons learned from publish *n* feed the Pre-flight tweaks for publish *n+1*. The checklist itself is intended to evolve.

## Open questions

1. **Staging environment — Decided.** OPDA has no dedicated staging URL for the first publish; the Playwright smoke test runs against the local preview, and the publish-day "verify the live URL" step is the first end-to-end check on real infrastructure. Accepted as the first-publish posture (revisit if a staging URL is stood up).
2. **Material-change threshold for regulator cc.** What counts as material is currently judgement-call. After 2–3 publishes there will be enough precedent to write a rule.
3. **Cutoff enforcement.** ADR-0004 §4 says submissions are due by the 15th. If a firm submits on the 16th, do they make this quarter (and shift Pre-flight forward) or roll to next quarter? Recommend: hard cutoff for the first publish, soften only if firms surface real-world reasons.
4. **Sign-off recording.** Where exactly does the signed checklist live? Options: append to ADR-0005 lifecycle log; new `source/04-governance-bodies/accreditation/publish-log/` directory; EC decision-log row pointing at a stored PDF.
5. **What "first publish" means specifically.** [ADR-0005](../adr/ADR-0005-deferred-work-register.md) C3 is the *first* time the Directory holds real data. Some checklist items above (e.g. diff against last quarter) only apply from publish 2 onwards. The first run skips them — flag with strikethrough rather than removing the line.

## References

- [ADR-0005](../adr/ADR-0005-deferred-work-register.md) §C3 — register entry this checklist operationalises; also §C1 (build pipeline) and §C2 ([VC submission tooling](./vc-submission-spec.md)).
- [ADR-0004](../adr/ADR-0004-accreditation-directory.md) §4 — quarterly cadence; §5 — schema; §6 — evidence requirements per score level.
- [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 2 — the workstreams whose outputs the Directory aggregates.
- [VC submission spec](./vc-submission-spec.md) — what firms submit at T-14.
- `governance.md` §6 — EC decision-log mechanics referenced by the publish-day sign-off step.
