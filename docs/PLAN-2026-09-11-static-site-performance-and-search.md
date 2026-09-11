# OPDA static-site performance and search plan

Date: 11 September 2026. Baseline: `main` at `2a4de949`.
Status: implemented, deployed and validated live through normal CI.
Scope: desktop first visits, progressive rendering, CDN delivery, fonts and Google discovery.
Publication: local working document. Do not add it to website routes or navigation.

Sections 1–8 retain the original plan and baseline evidence. Section 9 records the
implementation, measured results and unresolved acceptance checks separately.

## 1. Outcome and boundaries

Make useful content appear as early as possible for a first-time UK visitor, then
load nonessential features and media progressively. Keep the current visual design,
typefaces, image proportions, accessible navigation and light/dark themes.

Keep Astro-generated static HTML on S3 behind CloudFront. Public pages and assets
must not wait for authentication, database reads or an application server. Comment
writes and user-specific endpoints retain their authentication and cache boundaries.
Do not replace this architecture with EC2, SSR or a new CDN without evidence of a
material end-to-end benefit. Package-manager changes do not themselves reduce CSS
sent to a visitor; optimise the generated output and request dependencies.

The user's stretch objective is first-visit first paint below 50 ms. Treat that as
an optimisation objective, not a universal promise: DNS, connection establishment,
network distance and browser scheduling can consume the budget before rendering.
Neither a browser-cache hit nor a reused connection proves a completely cold visit.
Report the actual timings and remaining gap instead of redefining success.

This plan does not authorise a redesign, ontology migration, new paid service or
publication of internal working documents. Implementation proceeds in small,
verified commits on the existing `main` checkout through normal CI deployment.

## 2. Evidence already collected

These are the 11 September measurements, not newly rerun benchmarks. The saved
Lighthouse reports were re-read when preparing this plan. HTTP checks of the live
homepage, join, programme and marketing pages also confirmed the metadata findings.

| Measurement | Result | Qualification |
|---|---|---|
| Homepage Lighthouse 13.4.1 | FCP/LCP 147.811 ms; TBT 0; CLS 0; score 100 | No warnings; desktop; browser resource cache unused; no added network/CPU throttling |
| Homepage LCP breakdown | Navigation-to-first-byte 52.300 ms + render delay 95.511 ms | Different from Lighthouse's narrower 15 ms server-response audit |
| Homepage native Chrome trace | FCP/LCP 87.24 ms; TTFB 9 ms; approximately 78 ms after first byte | Fresh resource fetches, but a reused HTTP/3 connection and warm London CDN objects |
| Programme native Chrome trace | LCP 125 ms; TTFB 30 ms; approximately 95 ms render delay | Same desktop diagnostic context |
| Programme Lighthouse | FCP/LCP 121.743 ms; TBT 0; CLS 0.000110 | **Incomplete-load warning: not an accepted clean run**, despite its score of 100 |
| Fresh HTTP/2 connection probes | Homepage TTFB median 31.2 ms across 12 probes; range approximately 25–98 ms | Resolver may be warm; HTTP transport timing, not browser paint timing |
| CDN misses versus repeat requests | Sample TTFBs: programme 94 ms, CSS 77 ms, Tailwind 184 ms, font 74 ms; repeat requests approximately 26–30 ms | Small diagnostic samples, not UK-wide latency percentiles |
| Public comments GET | One probe approximately 609 ms | Deferred service request, not the homepage's first-paint blocker |

The clean homepage Lighthouse run used DevTools throttling with request latency,
download and upload overrides at zero and CPU multiplier 1. It did not reset browser
storage. Do not present it as simulated mobile, a clean profile or cold DNS/TLS.

Local evidence:

- `/Users/henrik/Downloads/opda.org.uk-20260911T124830.json`
- `/Users/henrik/Downloads/opda.org.uk-20260911T125147.json`
- `/Users/henrik/Downloads/Trace-20260911T124554.json.gz`
- Repository memory: `opda-task-state / cdn-and-rendering-breakdown-2026-09-11`.

### Delivery improvements already live

- Static delivery no longer invokes the old edge authentication/database gate.
  CloudFront has no Lambda associations on the audited delivery paths; a
  network-free CloudFront Function rewrites public paths.
- Normal HTML, CSS, JavaScript, fonts, illustrations and downloads already use
  CloudFront. No external font host is on the normal page-loading path.
- HTTP/2, HTTP/3, Brotli and gzip are enabled. Source CSS imports are bundled in
  production; they are not 21 separate stylesheet requests.
- Content-addressed `_astro` and `_images` objects have one-year immutable caching.
- Responsive artwork renditions and matching hero preloads have been introduced.
- Initial desktop/mobile contents-rail geometry is reserved before first paint.
- Comments data waits until after page load and proximity to its section.

Preserve these gains. Do not reintroduce the public-site authentication barrier.

## 3. Remaining waste I found

| ID | Evidence | Proposed action | Benefit and caution |
|---|---|---|---|
| P1 | Homepage's shared CSS is 150,517 bytes decoded; Lighthouse reports 86.45% unused on that load, approximately 20,267 transfer bytes | Separate critical/shared layout from route/component styles | First-visit bytes and render dependency; one-page coverage is not permission to delete styles used elsewhere or on interaction |
| P2 | Main stylesheet request blocks rendering for approximately 18 ms in the native homepage trace; around 96 ms remains after first byte in Lighthouse | Trace the complete style/layout/paint chain; test a small critical-CSS delivery path | Shorten a serial dependency, not merely minify an already compressed file |
| P3 | Four homepage WOFF2 files total approximately 129,728 bytes; three are preloaded | Make font priority intentional per template and identify the fourth face's exact consumer | Reduce unnecessary early competition; all three preloaded faces may genuinely be visible |
| P4 | `MethodFlowFigure.astro` creates `new Image()` and sets its URL immediately, fetching approximately 91 KB below the fold despite `loading="lazy"` on the displayed image | Make the actual source selection and decode visibility-lazy | Avoid unnecessary initial transfer; preserve theme changes, geometry and the text alternative |
| P5 | Every release invalidates `/*`, including unchanged immutable assets | Version remaining mutable assets, then narrow invalidation | Protect CDN warmth for first-time visitors after deployments |
| P6 | UI files, fonts, older artwork and HTML lack an explicit browser `Cache-Control` policy; CloudFront still caches them | Give each resource class a deliberate browser/shared-cache policy | Browser TTL mainly helps repeat visits; CDN retention also helps new visitors |
| P7 | Public comment responses mix public content with viewer-specific identity and are `private, no-store` | Consider separating the public feed from identity before enabling a short shared TTL | Faster comments and fewer origin invocations; never cache personalised responses publicly |
| P8 | Programme Lighthouse times out at 45 seconds; only `/_auth/me` is recorded unfinished after a 401, while static resources finish promptly | Reproduce and diagnose request completion and audit lifecycle | Restore trustworthy measurements; correlation is not yet a proven root cause |
| P9 | A Lighthouse unused-JS warning of approximately 226 KiB belongs to injected 1Password code | Attribute browser-extension work separately from OPDA | Do not remove application code or alter the user's extensions to fix an unrelated warning |

Relevant source owners:

- [Shared layout](../src/layouts/Layout.astro), [homepage](../src/pages/index.astro),
  [standalone layout](../src/layouts/StandalonePublicLayout.astro).
- [CSS bundler](../src/integrations/bundle-design-system.mjs),
  [small-style inlining](../src/integrations/asset-inlining.mjs).
- [Font preloads](../src/components/FontPreloads.astro),
  [font faces](../public/ui/fonts.css), [design tokens](../public/ui/design-tokens.css).
- [Method figure](../src/components/home/MethodFlowFigure.astro),
  [responsive artwork publisher](../src/integrations/responsive-artwork.mjs).
- [Release workflow](../.github/workflows/site-release.yml),
  [asset versions](../src/lib/asset-version.mjs).
- [Auth session watcher](../src/scripts/auth-session-watch.mjs),
  [comments component](../src/components/Comments.astro),
  [comments API](../config/aws/comments-api/index.mjs).

## 4. Fonts and progressive loading

**We already self-host fonts.** Files live under `/ui/fonts/`, are served through
CloudFront and use WOFF2 with language-specific `unicode-range` declarations.
All current design-system `@font-face` rules use `font-display: swap`.

That gives progressive **text rendering**: fallback text can appear before the
web font arrives, then the browser substitutes the chosen face. It is not an
image-like progressive refinement of a partially downloaded font file. CSS can
still hold up the first styled paint. Google recommends careful font preloading:
it discovers fonts early but can compete with other essential downloads.
[Google web-font loading guidance](https://web.dev/learn/performance/optimize-web-fonts).

Planned work:

1. Keep self-hosting and the approved typefaces. Do not switch to Google-hosted
   CSS, introduce another connection or replace the typography as an optimisation.
2. Measure which faces actually render above the fold on each template. Retain
   justified preloads; avoid preloading below-fold or unused variants.
3. Investigate why Roboto Mono loads on the homepage. Do not assume a declared
   face is downloaded: the network evidence, not the font-file inventory, counts.
4. Define and measure appropriate fallback metrics using `size-adjust`, ascent,
   descent and line-gap overrides where needed. Verify heading wraps, buttons,
   paragraphs and the contents rail under deliberately delayed font responses.
   [Chrome font-display guidance](https://developer.chrome.com/docs/performance/insights/font-display).
5. Compare current variable subsets with genuinely smaller necessary subsets or
   weight ranges. Preserve licences, italics, punctuation, mathematical symbols
   and non-English names; do not remove glyph coverage just for a smaller score.
   [Google font best practices](https://web.dev/articles/font-best-practices).
6. Keep `swap` as the default. Do not silently choose `optional`, which can leave
   a slow first visit in the fallback face. Any such experiment needs visual review.
7. Content-hash font filenames before assigning immutable browser caching.

Acceptance: readable text with font responses delayed or unavailable; no font-ready
page gate; no avoidable preload; correct chosen face when available; no visible
font-induced layout jump across the representative desktop pages.

## 5. Further Chrome guidance worth applying

Chrome's [Performance Insights](https://developer.chrome.com/docs/performance/insights)
cover document latency, request dependency chains, font display, image discovery,
layout shifts, forced reflow, DOM size, CSS selector cost, duplicate/legacy JS,
third parties, interaction latency and cache lifetimes. These are investigation
categories, not proof that OPDA currently has every problem.

| Area | Concrete OPDA investigation | Evidence required before changing it |
|---|---|---|
| Critical rendering | Reduce shared CSS; trial small inline critical rules and deferred noncritical styles | Faster cold-resource FCP with unchanged themes and no unstyled flash |
| Image priority | Keep the actual LCP image discoverable immediately; defer lower illustrations and previews | Network waterfall shows one correct theme/size rendition and no duplicate fetch |
| Main-thread work | Audit `client.js`, router initialisation, search, diagrams, tables and export viewers by page | Actual long tasks, duplicate listeners or unnecessary modules, not a speculative rewrite |
| Long documentation pages | Examine layout cost, DOM size and expensive selectors | Measured benefit before considering containment or `content-visibility` |
| Layout stability | Stress delayed fonts/images, rail expansion, auth labels and comment loading | Filmstrip/trace plus CLS; no lost anchors, find-in-page, printing or accessibility |
| Deferred services | Keep comments, auth state and optional integrations out of the paint dependency chain | Useful page content remains visible if the API is slow, offline or errors |
| Connections | Confirm no avoidable redirect chain or external render dependency | Navigation/DNS/connect/TLS/request breakdown from comparable UK tests |

Chrome recommends deferring noncritical requests, reducing critical payloads and,
where justified, inlining small critical resources. It also warns that critical-CSS
inlining can introduce bugs. Preserve the shared design system rather than copying
hand-maintained style fragments into every page.
[Render-blocking guidance](https://developer.chrome.com/docs/performance/insights/render-blocking).

Do not count every post-TTFB millisecond as CSS execution: the native homepage trace
showed about 0.6 ms stylesheet parsing and 9.5 ms first layout, plus browser scheduling,
other work and presentation delay. Avoid adding independent potential savings together
as if network, font and rendering work never overlap.

## 6. Google crawler and page-head findings

Google does not require a magic RDF block in every header. Its minimum technical
requirements are crawler access, a successful page response and indexable content;
meeting them does not guarantee indexing.
[Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical).

### Baseline audit

Parsed the 2,776 URLs in the locally built `sitemap-0.xml`, each with a corresponding
HTML file. These raw counts include utility and legacy alias pages; classify those
first rather than treating every missing field as a missing editorial page.

| Finding | Count / detail |
|---|---|
| Missing descriptions | 661 sitemap entries |
| Missing canonical links | 2,756 sitemap entries |
| JSON-LD blocks | None across the 2,776 sitemap entries |
| Missing Open Graph metadata | 2,774 entries; social-sharing consistency, not a Google indexing requirement |
| Missing titles | Three header-preview utilities, not ordinary content pages |
| `noindex` pages in sitemap | 20: nineteen legacy `/semantic-modelling/*` aliases and `/under-development` |
| Preview utilities in sitemap | `/ui/header-preview-controls/home`, `/join` and `/kb` beneath that prefix |
| Robots file | Allows crawling and advertises the generated sitemap; its comment incorrectly describes the retired member gate |

Live homepage, programme and marketing HTML confirms absent canonical links and
JSON-LD. Join has a canonical and social tags but no JSON-LD. The homepage currently
uses the title `OPDA Knowledge Base`. Source metadata is split between the shared
layout, standalone layout and bespoke homepage.

### Shared page-head contract

Introduce one reusable build-time SEO component for those templates, fed by page
metadata and the existing navigation hierarchy. It must add no client-side runtime.

- Every intended indexable page: one meaningful, concise `<title>`, a useful
  page-specific description, UTF-8, mobile viewport and an absolute canonical URL.
  Unique titles are Google's recommendation; a canonical is a preference signal,
  not a compulsory indexing prerequisite or a guarantee Google selects that URL.
  [Titles](https://developers.google.com/search/docs/appearance/title-link),
  [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
- Use the canonical route without configuration or tracking parameters. Preserve
  meaningful resource/query distinctions and stable ontology identifiers; do not
  blindly canonicalise every parameterised resource viewer to unrelated content.
- Emit robots directives for deliberate exceptions. `index,follow` is already the
  default. Preserve appropriate `noindex` behaviour for utility/error/alias pages;
  do not ship the under-development page's directives on public content.
- Keep `lang="en"` for accessibility. Google identifies language from text; the
  attribute is not a special ranking instruction. Do not add meta keywords or
  arbitrary OPDA meta tags expecting Google to interpret the domain model.
  [Supported and ignored metadata](https://developers.google.com/search/docs/crawling-indexing/special-tags).
- Keep the `<head>` valid and metadata in the delivered HTML. Do not insert visible
  images or iframes there: invalid elements can stop Google reading later metadata.
  [Valid head markup](https://developers.google.com/search/docs/crawling-indexing/valid-page-metadata).
- Add consistent Open Graph/social-card metadata using existing page artwork and
  explicit public URLs. This serves link sharing, not a compulsory Google feature.
  Social renditions may use the artwork for that same placement; do not reuse it
  as another section's illustration. Check favicon and logo links at the same time.

### RDF and structured data

JSON-LD can express RDF; it is not an alternative to having a semantic model.
[W3C JSON-LD](https://www.w3.org/TR/json-ld11/).
For Google Search features, use the supported Schema.org vocabulary in static
`<script type="application/ld+json">` blocks. Google also supports RDFa and Microdata,
but recommends JSON-LD for maintainability; head or body placement is supported.
OPDA's OWL, RDFS and SHACL artefacts serve a different purpose and are not a substitute
for this page-specific search markup.
[Google structured-data formats](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

Start with a small, accurate set:

1. `Organization` on the homepage or organisation-information page, using verified
   OPDA identity, logo, URL and genuine official profiles. Google explicitly says
   it need not be on every page.
   [Organisation guidance](https://developers.google.com/search/docs/appearance/structured-data/organization).
2. `WebSite` on the homepage for the preferred site name and URL. Keep visible
   naming consistent; do not invent separate site identities for sections.
   [Site-name guidance](https://developers.google.com/search/docs/appearance/site-names).
3. `BreadcrumbList` on pages with a meaningful hierarchy, generated from the same
   navigation data as the visible breadcrumbs, not a blind split of the URL path.
   [Breadcrumb guidance](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).
4. Evaluate further types only when the content genuinely qualifies. Do not label
   every reference page an article, invent reviews, or treat every page with a
   comments widget as a discussion forum. Generic `WebPage` markup alone is not a
   promised rich-result feature.

Represent visible, accurate content; do not fabricate approval, ratings, dates or
government status. Valid markup creates eligibility, not guaranteed rich results.
[Structured-data quality rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

### Crawling and publication hygiene

- Remove noindex/redirect/preview utility URLs from the sitemap, not the historical
  files themselves. Include the canonical public destinations and accurate update
  dates when available, not a fabricated new modification date on every build.
  [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Keep required CSS/images accessible to crawlers. Use real HTML links and useful
  nearby text/alt descriptions; do not rely solely on CSS backgrounds or click-only
  JavaScript for meaningful illustrations. Audit theme-selected image placeholders
  for real crawlable image URLs while preserving lazy loading.
  [Image discovery guidance](https://developers.google.com/search/docs/appearance/google-images).
- Validate canonical/redirect behaviour for slash variants, legacy aliases, query
  parameters and resource routes. Do not perform a broad URL or namespace migration.
- Use Search Console URL Inspection and the Page Indexing report after publication.
  Validate eligible markup with Rich Results Test. `WebSite` site-name markup needs
  Schema Markup Validator/URL Inspection; Rich Results Test does not support it.
  Search Console ownership/access has not been verified in this task.

## 7. Implementation order and acceptance

| Slice | Work | Acceptance evidence |
|---|---|---|
| 0. Reliable baseline | Preserve the existing reports; obtain a clean Programme audit; attribute the unfinished auth request without guessing | No Lighthouse incomplete-load warning; saved settings, route, release SHA, cache and connection conditions |
| 1. Genuine deferred artwork | Fix P4, then inspect other theme-image/previews for the same pattern | The method image is absent from the initial distant-below-fold request set and appears correctly on approach; no duplicate theme requests |
| 2. Critical rendering and fonts | Address P1–P3 with separate CSS and font commits; minimise the initial style dependency and fit fallbacks | Paired cold-resource waterfall/filmstrip; reduced early bytes or repeatable paint saving; unchanged design and stable layout |
| 3. Cache-safe releases | Hash UI/fonts before immutable TTLs; preserve historical hash assets; replace blanket invalidation | Unchanged assets remain CDN hits after deploy; changed HTML loads the correct new assets; rollback still works |
| 4. Deferred API efficiency | Resolve any proven auth lifecycle defect; assess separate public comments feed | Auth/identity never shared-cacheable; comment writes still protected; public feed faster if caching is introduced; page paints during API failure |
| 5. Search head and sitemap | Shared metadata component, descriptions, canonical mapping, selective JSON-LD, utility exclusions | Build-output audit has no unexpected indexability conflicts; correct metadata on live representative pages; valid supported structured data |
| 6. Evidence-led second pass | DOM/layout/JS/image audit, then a UK CDN comparison only if delivery still dominates | Named bottleneck and measured before/after benefit; no speculative framework/CDN migration |

Slice 0 should not hold up the independent artwork fix. Font and CSS changes share
rendering contracts and must be integrated serially. Search work is a separate
deliverable: better metadata is not a first-paint improvement.

### Cache policy details for slice 3

Use filename content hashes, not only `?v=` parameters: the audited CloudFront cache
key ignores query strings. Upload new hashes before HTML and keep old hashes for
cached pages and rollback. Give immutable files one-year browser caching; give HTML
an explicit revalidation policy and deliberate shared TTL. Invalidate changed HTML
and genuinely mutable public objects without purging unchanged hashed resources.
Check extensionless route rewrites when determining invalidation paths.

Do not simply remove `/*` invalidation while mutable CSS still reuses the same path.
Likewise, do not assign a year-long immutable policy to mutable filenames. Verify
headers on actual GET responses and perform a two-release test before claiming the
release/cache interaction is fixed.

## 8. Measurement and proportionate verification

Use only the existing OPDA Chrome connection for browser work. No separate browser,
headless profile, standalone automation fallback or clearing of account/session data.
Keep automatic rendering and trace collection bounded, and restore changed diagnostic
settings afterwards.

For each relevant slice:

1. Use fixed desktop viewport/DPR and documented Lighthouse settings. Test homepage,
   join, programme, marketing and representative long pages from both modelling tracks.
2. Run at least three paired before/after cold-resource measurements for the affected
   template; use five when differences are small. Report median and range, not a
   cherry-picked fastest result or an unreliable percentile from a tiny sample.
3. Label browser cache, connection reuse and CDN hit/miss independently. Use separate
   fresh-connection HTTP probes for transport; do not claim they measure paint or
   prove a cold DNS resolver. A warm CDN with an empty browser cache is a valid
   first-visitor scenario, but not the only one.
4. Record navigation TTFB, FCP, LCP, render delay, CLS, TBT, early request count/bytes,
   actual selected images/fonts, errors and the first useful-content filmstrip.
5. Aim to reduce the current approximately 96 ms post-TTFB render interval toward
   50 ms or less on the controlled desktop baseline, while continuing toward the
   stricter end-to-end first-visit objective. This is a target, not an achieved result.
6. Require no visible layout regressions; keep CLS near zero and investigate any
   material increase. Exercise delayed/failed fonts, delayed comments, direct entry,
   client navigation, light/dark themes and one narrow-screen smoke test.
7. Run `make test` after code changes and `make build` after site changes, with focused
   contracts for the changed behaviour. Do not add a brittle whole-site timing gate
   or require ontology regeneration for font/CSS/metadata changes.
8. Commit each verified slice, push and deploy through normal CI, then verify the
   exact published revision. No direct/manual deployment shortcut is part of this plan.

Use field data when available to check that lab gains reach visitors; low traffic may
not produce route-level CrUX data. Do not add an analytics SDK or subscription just to
obtain another score. Google's LCP guidance explicitly distinguishes lab and field
results and breaks down delivery versus rendering delays.
[LCP measurement guidance](https://web.dev/articles/optimize-lcp).

Stop a proposed optimisation when repeatable evidence shows no useful benefit or it
creates more maintenance/visual risk than the saving justifies. Record investigated
non-issues as well as wins. Keep an explicit measured-versus-unproven status for each
finding; do not describe this plan itself as a deployed optimisation.

## 9. Implementation and validation record

### Delivered changes

The tracked Ruflo swarm used three native executor lanes: rendering, delivery and
search metadata, with the main agent integrating changes and operating the existing
OPDA Chrome session. All work stayed in the existing `main` checkout.

| Finding | Implementation / outcome |
|---|---|
| P1–P2, critical CSS | One generated campaign bundle excludes eight KB-only modules and is inlined through a shared component. KB pages retain their complete cascade. Campaign CSS is 98,601 bytes decoded / 14,474 Brotli, versus 152,361 / 20,650 for the complete new bundle. This is not a manually copied critical-style fragment. |
| P3, fonts | Existing self-hosted WOFF2 faces, `swap` and justified preloads remain. Arial/Georgia fallback metrics are fitted. Roboto Mono has a real below-fold consumer in the homepage presentation feature, so its presence is not an unused-font defect. All font URLs are now filename-hashed. |
| P4, method artwork | Removed immediate off-DOM image loading. The actual image source is selected near the viewport, with reserved dimensions, theme handling, small-screen/forced-colour text alternatives and teardown. Original illustrations remain. |
| P5–P6, delivery | Content-addressed `/_ui/` CSS, JS, fonts and icons join the retained `/_astro/` and `/_images/` histories. Immutable objects publish first. Mutable-object hashes select uploads and targeted invalidations; unknown existing objects are not silently adopted for deletion. |
| P7, comments | Explicit `public=1` reads contain only public comments/count and omit cookies. A separate shared in-memory identity view controls the composer. Writes retain credentials and current approval checks. A post ID keeps refresh/pagination clear of stale feed entries. |
| P8, request lifecycle | Non-success identity-response streams are explicitly cancelled; signed-out responses do not schedule repeated polling. Tests verify closure, cancellation, outage handling and stale-response rejection. Live Programme Lighthouse now completes without warnings or unfinished requests; the signed-out identity request completed in 38.234 ms. |
| P9, extension work | Injected 1Password work remains separately attributed. No extension was removed or disabled to improve the reported site score. |
| Search head | Shared static descriptions, canonicals, Open Graph and appropriate Organization, WebSite and BreadcrumbList JSON-LD cover the page templates. No client runtime or ontology-identifier migration was introduced. |
| Search utilities | Sitemap excludes 24 deliberate utility/alias entries. The three standalone header-control responses now have valid `noindex` document heads; only the controls are imported into configuration pages, never their metadata. |

HTML and mutable originals use `public,max-age=0,s-maxage=86400,must-revalidate`.
Hashed assets use `public,max-age=31536000,immutable`. Public comment feeds use
`public,max-age=0,s-maxage=30,must-revalidate`; identity, legacy personalised reads,
errors and writes remain private/non-cacheable. A proposed five-minute HTML shared
TTL was rejected because it would cause unnecessary origin misses on a low-traffic site.

ADRs 0040 and 0079 have dated amendments describing the changed release and comment
contracts. Historical decision text and historical asset files were preserved.

### Validation and defects caught

- `make test`, `make build`, CloudFormation lint, ADR registry, design-system drift
  and test-inventory checks passed for their changed slices.
- Build-output SEO audit: 2,752 indexable pages, zero failures, one Organization,
  one WebSite, 2,735 BreadcrumbLists and 58 valid local social-image references.
- Chrome inspection covered home, join, marketing and both modelling tracks in
  light/dark mode, plus a narrow join-page viewport. No horizontal overflow was
  observed in those checks. Existing image proportions and reading widths remained.
- With all local WOFF2 requests blocked, fallback text remained readable. The
  sampled homepage heading retained identical bounds before/after font availability;
  button heights were unchanged and width differences stayed below 2.2 CSS pixels.
  This is bounded geometry evidence, not a universal delayed-font CLS claim.
- A distant method image retained its placeholder until entering the 300-pixel
  approach margin, then loaded the appropriate artwork. Small-screen text remained.
- The first frontend CI run caught an obsolete browser test expecting cookies on
  public reads. Its replacement verifies anonymous GETs, authenticated deliberate
  POSTs and post-ID refresh. The following run passed all 36 browser journeys.
- Deployment then correctly refused a manifest mismatch before mutable publication.
  Exact artifact inspection found one added file: `artifact-size-report.json`,
  written after manifest generation. Sealing now occurs after all artifact writers
  and browser checks. The strict integrity check remains, with a regression test.
- Independent review also fixed retry cache-key persistence, denied-composer state,
  first-adoption inventory preservation and shared normal/emergency publication locking.

Backend commit `3f87de9f` is live. Public comment GETs returned no viewer identity
or Set-Cookie and produced London CloudFront hits of 8–100 ms after a 2.2-second
uncached request. That origin cold-start cost remains; comments are deferred and
do not hold up useful static content. Legacy personalised reads and `/_auth/me`
retained their private/no-store responses.

Frontend commits include `904fa225`, `03f5f10a`, `d33d6c24` and `69a8c0d0`.
Normal releases `34603430574` and `34604326426` succeeded at `69a8c0d0`.

### Repeatable desktop baseline

Five homepage Lighthouse reports before frontend publication used Chrome 152,
Lighthouse 13.4.1, a 3,200 × 1,332 CSS-pixel viewport at DPR 2, no added throttling,
and Network **Disable cache** enabled. Account/session storage was not cleared.
All OPDA requests were full network transfers, not disk-cache or 304 substitutes.
DNS/connection reuse was not reset; these are cold-resource, not cold-DNS/TLS tests.

Reports in `/Users/henrik/Downloads/`, named `opda.org.uk-20260911T<time>.json`:

| Local report time | FCP = LCP | Navigation TTFB | Render delay | CLS / TBT |
|---|---:|---:|---:|---:|
| 14:05:17 | 328.903 ms | 95.506 ms | 233.397 ms | 0 / 0 |
| 14:06:47 | 205.607 ms | 51.904 ms | 153.703 ms | 0 / 0 |
| 14:08:02 | 124.868 ms | 24.505 ms | 100.363 ms | 0 / 0 |
| 14:09:42 | 172.898 ms | 86.926 ms | 85.972 ms | 0 / 0 |
| 14:11:00 | 140.940 ms | 43.632 ms | 97.308 ms | 0 / 0 |

Median FCP/LCP is **172.898 ms**, range **124.868–328.903 ms**. Median render delay
is **100.363 ms**. Each run fetched nine OPDA resources, approximately 268 KB total.
All five completed without warnings. Runs at 13:51:39 and 13:52:53 were excluded
after JSON inspection revealed cached/revalidated resources; their attractive
108/150 ms results are not accepted first-visitor evidence.

Five post-release reports used the same settings and width/DPR. Chrome's available
viewport height was 1,348 rather than 1,332 pixels; the heading's bounds were identical.

| Local report time | FCP = LCP | Navigation TTFB | Render delay | CLS / TBT |
|---|---:|---:|---:|---:|
| 14:26:05 | 164.535 ms | 29.464 ms | 135.071 ms | 0 / 0 |
| 14:28:46 | 114.537 ms | 24.544 ms | 89.993 ms | 0 / 0 |
| 14:30:07 | 125.875 ms | 40.018 ms | 85.857 ms | 0 / 0 |
| 14:31:28 | 124.914 ms | 46.005 ms | 78.909 ms | 0 / 0 |
| 14:32:48 | 196.664 ms | 39.509 ms | 157.155 ms | 0 / 0 |

Median FCP/LCP fell from **172.898 to 125.875 ms**; render delay from **100.363 to
89.993 ms**. Median transferred bytes fell from 268,243 to 258,332 and requests
from nine to eight. Network timing also varied; the whole paint difference cannot
be attributed to code. All resources transferred in full and all five runs were clean.
Programme report `14:34:30`: FCP 127.876 ms, LCP 144.537 ms, CLS 0.000293, TBT zero,
no warnings or unfinished requests. Its previous incomplete runs are not valid paired
speed baselines. Browser diagnostics were restored; no extension or account was changed.

### Font alternatives assessed, not deployed

Installed FontTools 4.65 was used in memory; approved binaries were not overwritten.
Restricting variable axes to the weights already declared by CSS could reduce the
three Latin preload files from 96,976 to 71,232 bytes, saving 25,744 bytes. All
original character mappings and required intermediate weights survived, but retained
outlines changed by up to 1.43 font units and advances by up to two units. This is
not lossless and has not passed visual/paint comparison as replacement font files.
Keep the current files for this release. Static per-weight files cost more overall;
further character subsetting saves only 208–720 bytes per face and risks combining marks.

### Live delivery and remaining boundaries

The first normal release invalidated 54 changed route paths in bounded batches,
never `/*` or a hashed-asset prefix. The second uploaded only the search index and
`release.json`: 4,849 mutable files stayed unchanged, zero deletions, two exact
invalidation paths. London hits retained unchanged home/CSS/font/image ETags, origin
dates and cache age. Published HTML matched the artifact manifest; old hashes remained
accessible. The bootstrap inventory retained all 5,438 pre-existing keys.

That second release exposed an unnecessary search-index build timestamp. Follow-up
`1b70212d` removes it, retaining record dates, counts and schema version. A regression
runs the actual build hook at two different dates and proves byte-identical output.
Normal CI run `34606407041` passed and published `1b70212d`; live `release.json`
confirms it. The timestamp-free live index matches the local 2,752-record payload.

Public comments were also read in live Chrome; signed-out users see the sign-in action
for posting. No test comment or membership change was created. The Schema.org URL
validator reports zero errors/warnings for the homepage WebSite and linked Organization.
Google's live Rich Results Test on `/semantic-modelling/method/languages-and-profiles`
detected one valid BreadcrumbList at 14:49:47 BST. Homepage/Programme crawl successfully
but report no eligible rich-result items; Programme has no multi-level breadcrumb.
Site names are [not supported by Google's Rich Results Test](https://developers.google.com/search/docs/appearance/site-names#test-structured-data).
Search Console ownership, URL Inspection, indexing and ranking are not verified.
There are 104 repeated-title groups across resource/reference views and no newly supplied
square favicon; neither is silently claimed fixed. The sub-50-ms end-to-end first-visit
objective remains unachieved and unpromised; font-binary savings above are not live savings.
