# Handover: OPDA audience tracking

Prepared 15 September 2026. Repository: `/Users/henrik/source/opda`.

## Outcome required

Finish adding **LinkedIn Insight Tag, HubSpot website tracking and Google Analytics 4** to `opda.org.uk`, while protecting website performance. The user explicitly authorised these three integrations. They want to understand the audience beyond the small percentage of visitors who have registered accounts: age, gender, interests, jobs, sectors and organisations.

**Current status: implementation prepared and committed locally; not activated or deployed.** Do not describe the integrations as live or their real-world performance as verified.

Latest implementation commit: `f1bb4395 feat(analytics): prepare consent-gated audience integrations`.

## User intent and decisions

- User: “lets add lnkedin, hubspot, and google analytics, in a way that doesnt degrade website performance”.
- HubSpot holds known contact/account-related information, but the primary audience-research requirement includes unregistered visitors. Existing authentication is actually Cognito backed by the participant system; HubSpot supplies contact and approval information. Do not replace authentication with an analytics integration.
- GA4 offers aggregate demographics and interests for eligible users, not a complete profile of every visitor. It does not automatically supply job titles/employers.
- LinkedIn is intended to supply aggregate professional audience insights. Verify current reporting availability and thresholds in the actual account.
- Additional trackers were discussed, **not authorised for installation**: Clarity for heatmaps/replay; Leadfeeder/Dealfront for company identification; PostHog for product analytics; Quantcast for estimated demographics/interests. Recommendation was Clarity or Leadfeeder if another capability is needed, not installing all of them.
- No claim that asynchronous/deferred loading makes third-party SDKs cost-free. Their post-load execution still needs measurement.

## Immediate blockers

1. **GA4 measurement ID missing** (`G-…`). No existing ID was found in the inspected site configuration.
2. **LinkedIn partner ID missing**. No existing ID was found in the inspected site configuration.
3. **Provider settings unverified.** Account-level settings affect duplicate page views, incidental form capture, chat and tracking volume.
4. **Real Chrome verification not performed.** The previous session found no applicable bundled Chrome-control skill/binding in its exposed registry. This was a capability-discovery limitation, not evidence of a broken user extension. Rediscover capabilities in the new session and obey the repository Chrome-only rules.

An asynchronous question was sent, with no answer received:

> I found OPDA’s HubSpot portal ID (144765514), but no existing GA4 measurement ID or LinkedIn Insight Tag partner ID in the site configuration. What are the GA4 ID (G-…) and LinkedIn partner ID, or should these be new properties for opda.org.uk?

HubSpot portal **144765514** is established by existing CRM integration source, not guessed. Its correct tracking installation and account settings still need verification. Do not invent IDs or set the verification flag merely to expose the UI.

## Files and implementation

| File | Purpose |
|---|---|
| `src/lib/audience-tracking.mjs` | Public account configuration, consent parsing, URL eligibility, finite provider-loading scheduler |
| `src/scripts/audience-tracking.mjs` | Browser integration, vendor queues, Astro navigation handling, consent persistence and withdrawal |
| `src/components/AudienceTracking.astro` | Per-provider consent choices and explanatory text; fixed panel and footer settings button |
| `src/components/SiteFooter.astro` | Renders the tracking component only when configuration is ready |
| `tests/audience-tracking.test.mjs` | Eight policy, scheduler and simulated browser-runtime tests |
| `config/ci-test-tiers.json` | Registers the test under engagement/application |
| `package.json` | Adds tracking tests to `make test` |

Current configuration:

```js
export const audienceTracking = Object.freeze({
  google: '',
  linkedin: '',
  hubspot: '144765514',
  providerSettingsVerified: false,
});
```

Both valid account IDs and `providerSettingsVerified: true` are required. The current build emits no tracking consent UI or direct vendor script tags on the homepage.

### Intended behaviour implemented locally

- Each provider is optional, off before consent, with separate selection and equal reject/accept buttons.
- Consent is stored in `opda-audience-consent-v1` for 180 days; malformed, expired and future-dated records are rejected when read.
- Waits for window load and a visible document, then schedules vendor installation during idle time. Providers are staggered by 750 ms; idle callback has a two-second timeout and a timer fallback.
- No third-party preconnect or pre-consent vendor requests are intentionally added.
- Async script tags have low fetch priority. Installation is attempted once per document without automatic retry loops.
- Pending loads are cancelled when hidden, on navigation and pagehide. This does **not** establish that already-loaded vendor SDKs stop all their own work when hidden.
- GA4 uses consent defaults then updates, `send_page_view: false`, and manual page views. Google consent currently groups analytics and advertising signals under the Google choice; review the scope and wording before activation.
- HubSpot uses its standard embed, `setPath`, its automatic initial page view and subsequent manual page views. No custom `identify(email)` bridge to signed-in users was added.
- LinkedIn uses its standard Insight Tag and subsequent `lintrk()` calls for navigation. Verify real SDK behaviour.
- Local script installation is deduplicated across Astro transitions. Head scripts use Astro persistence attributes.
- Changing consent after a provider is installed disables Google, requests HubSpot opt-out/revocation, clears recognised accessible first-party tracking cookies and reloads the document. This does not delete historical provider records or third-party cookies inaccessible to the site.
- Cross-tab storage changes reload without writing consent back, avoiding a notification loop. BFCache restoration reloads to recheck consent.

### Route eligibility and measurement trade-offs

Only HTTPS `opda.org.uk` and `www.opda.org.uk` are eligible. The current deny list excludes `/auth`, `/account`, `/api`, `/join`, `/subscribe`, `/resource`, `/approval`, `/workspace` and descendants.

Only `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` with short restricted-character values are allowed in query strings. Simple section fragments are allowed; other query/fragment forms are excluded. GA locations and HubSpot paths retain permitted campaign parameters; GA referrers have query/fragment removed.

If any SDK is installed, navigation to an ineligible URL uses a full document load to avoid carrying vendor runtime into that page. Ordinary eligible content navigation retains Astro transitions.

**Consequences to assess:** no tracking on registration forms/resource views; no registration-conversion instrumentation implemented; `gclid`, `li_fat_id` and other query keys currently make a URL ineligible. These conservative implementation choices were not individually approved by the user and should be reviewed against the campaign-measurement requirement. Do not silently call the result complete coverage.

## Validation completed on 12 September

- `node --test tests/audience-tracking.test.mjs`: eight tests passed.
- `make test`: passed (includes existing suite skips).
- `make build`: passed; 2,778 pages built; immutable UI asset integration completed.
- `node scripts/check-ci-test-inventory.mjs`: passed, 122 registered test files.
- `git diff --check`: passed before the implementation commit.
- Static inspection of `dist/index.html`: no tracking UI or direct vendor script tags with the unconfigured gate.

Temporary logs still existed when checked on 15 September:

- `/tmp/opda-audience-tests.log`
- `/tmp/opda-audience-build.log`

These tests use a VM and DOM/timer stubs, **not a real browser and not live vendor SDKs**. No account dashboard receipt, actual request count, consent UI interaction, LCP/INP/CLS measurement, or post-consent CPU profile was verified. A build with activation disabled is not proof that the active integration behaves correctly.

## Review before activation

The code is a prepared implementation, not a production-assured integration. Check in particular:

1. HubSpot readiness: the current runtime uses `!Array.isArray(window._hsq)` to decide whether manual page views are safe. This is an implementation assumption that needs checking against the real loader, including navigation while its nested analytics script is loading.
2. LinkedIn's initial and subsequent page-view behaviour, including navigation before script load, and whether automatic Website Actions is actually disabled.
3. GA4 account-level enhanced history measurement: `send_page_view: false` alone does not disable enhanced history-based views. Avoid duplicates.
4. Account/route exclusions against actual deployed routes, including encoded URLs and protected application boundaries. Do not infer comprehensive privacy protection from the prefix list.
5. Full vendor embed behaviour: HubSpot can load optional features from account configuration; low-priority outer script loading does not bound nested scripts.
6. Consent expiry and changes across long-lived documents, blocked storage, multiple tabs, back/forward navigation and BFCache. Expiry is currently checked when records are read, not continuously.
7. Consent UI keyboard/mobile behaviour and discoverability. The settings container is hidden on ineligible pages; consider how a visitor withdraws there. Review whether visibility events unexpectedly reset an open preferences panel.
8. Google advertising consent scope, provider data-sharing defaults, actual retention and public privacy wording. Do not automatically enable unrelated advertising features or HubSpot data sharing.
9. Measure request bytes, long tasks, LCP, INP and CLS before/after consent, plus idle/hidden behaviour. Set sensible acceptance criteria from the baseline, not a blanket “zero impact” promise.

These are review items, not claims that all are confirmed defects.

## Next-session execution order

1. Read `AGENTS.md`, check current Git state and recall relevant Ruflo lessons through supported tools. Work on existing `main` only.
2. Obtain/discover the real GA4 and LinkedIn IDs and confirm ownership/domain. Reuse the pending question rather than assuming the user answered it.
3. Rediscover the authorised Chrome capability. Use only the existing **OPDA** Chrome profile and its required documentation. Never fall back to Playwright, a fresh browser or another profile.
4. Verify/configure provider settings within the authorised integration scope. Record exactly what was checked. Current code comments propose: GA signals enabled, automatic history views/form capture disabled; HubSpot optional form/chat features disabled; LinkedIn Website Actions disabled. Confirm these are appropriate and supported, and adjust implementation if necessary.
5. Review and correct the runtime issues above, with meaningful tests. Validate activated behaviour using a controlled environment without polluting production analytics with fabricated users or sensitive data. Current hostname restriction intentionally blocks localhost; use an explicit test approach rather than permanently weakening it.
6. Update the real IDs and only then mark provider settings verified. Run `make test`, `make build`, test inventory and appropriate active browser checks.
7. Commit the verified slice. Resolve pending local-only preview commits/publication scope before pushing; see Git section below. Use normal CI release on `main`, verify actual deployed version and provider receipts. User already authorised deployment of completed verified product changes; no second approval is needed solely for deployment.
8. Report which services are actually active, consent behaviour, observed performance and remaining measurement limitations.

## Git and publication constraints

At handover inspection, `main` was **ahead of the locally recorded `origin/main` by six commits**. No fetch was performed; this is not a current remote-state guarantee. Remote: `git@github.com:sparkling/opda.git`.

Unrelated dirty work must be preserved:

- Modified `.agents/skills/security-audit/SKILL.md`
- Untracked `.agentic-qe/`

The six existing local commits include earlier image-preview work as well as analytics. Inspect outgoing history before pushing. Image previews were treated as local exploration and were not added to the product site. Do not accidentally integrate or publish working artefacts, and do not rewrite accepted history or create a branch/worktree to sidestep main-only instructions.

This handover is a local working document. Do not add it to site routes/navigation or deploy it as product documentation.

## Relevant primary references

References were consulted on 12 September; recheck changed provider interfaces/settings before use.

- [Google basic versus advanced consent](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 manual views and enhanced history duplication](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Google signals](https://support.google.com/analytics/answer/9445345?hl=en)
- [Google 2026 data-control changes](https://support.google.com/analytics/answer/17016975?hl=en)
- [HubSpot tracking API and SPA tracking](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/overview)
- [HubSpot consent APIs](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api)
- [LinkedIn Insight Tag](https://business.linkedin.com/advertise/ads/insight-tag)
- [LinkedIn collection and aggregate reporting](https://www.linkedin.com/help/linkedin/answer/a7157958)
- [Astro transitions](https://docs.astro.build/en/guides/view-transitions/)
- [ICO storage/access exceptions](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)

## Earlier completed work: image comparison galleries

Keep this separate from the analytics task. The user requested matching API and subscription previews for “From evidence to shared meaning,” including **Collect feedback** between Working-group review and Prepare candidate. Both galleries contain 20 styles, one landscape image per row, with model-generated arrows and text (no SVG overlay). Homepage infographic was not changed.

- API page: `docs/previews/evidence-shared-meaning-11-styles.html` (historic filename, now 20 styles).
- Subscription page: `docs/previews/evidence-shared-meaning-subscription.html`.
- Shared prompts and API originals: `docs/previews/evidence-2-5/`.
- Subscription originals, reviews and manifest: `docs/previews/evidence-subscription/`.
- Builder: `scripts/build-evidence-style-preview.py`; run with `uv run --with pillow python scripts/build-evidence-style-preview.py`, or add `--route subscription`.
- Prior local URLs used port 4387 on 127.0.0.1 with `docs/previews` as server root. Server availability was **not rechecked for this handover**.
- All 40 selected images were 1983 × 793, embedded as 1280 × 512 WebP renditions in the galleries. Originals preserved; image and HTML checks passed in the earlier session.
- API requests explicitly used **`gpt-image-2.5-sunburst`**, high quality and automatic size. The built-in subscription image tool exposed no model selector. Both routes' original files recorded C2PA softwareAgent `gpt-image` version `2.0`; this was not proven to identify the effective generation model. Do not equate that metadata with confirmed backend model identity. C2PA was parsed, not cryptographically verified.
- The API diorama received one targeted arrow correction; the subscription set was fresh first-pass generation. Pages disclose the asymmetry and other style deviations.
- Related commits: `8e2c178b`, `df7199ae`, `1c82a240`, `d1e031ed` and earlier preview history.
- No further image generation is needed for the current analytics task.
