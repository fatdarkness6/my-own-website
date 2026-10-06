# Search visibility

The canonical site is **https://arsamsarkhosh.vercel.app**. Technical SEO helps
search engines find and understand the portfolio; it cannot guarantee rankings
or indexing. Name searches are a more realistic initial target than competitive
generic queries such as “developer”. No keyword stuffing, paid-link schemes,
invented reviews, or crawler-only content is used.

## Implemented

- Server-rendered, localized titles and descriptions across five main pages,
  five project pages and seven languages.
- Absolute self-canonicals, reciprocal `hreflang` links and an English `x-default`.
- `/sitemap.xml`: 70 canonical URLs with language alternates. No made-up modification dates.
- `/robots.txt`: sitemap discovery for production; Vercel previews are excluded.
- `noindex, nofollow` metadata and HTTP headers for non-indexable deployments.
- Open Graph and Twitter large-image previews, with a static 1200 × 630 PNG.
- JSON-LD: a shared Person and WebSite, localized page entities, About/Résumé
  ProfilePage markup and the Projects collection. Identity links point to the
  real GitHub and LinkedIn profiles; no claims about ratings, certifications or awards.
- Genuine typed text rendered in initial HTML, then enhanced with animations.
- Automatic intro completion without requiring a click, with gesture-only audio.
- No-JavaScript reading fallback and a translated keyboard skip link.
- `font-display: swap` for the custom display fonts.
- Regression tests for canonical URLs, structured-data safety, localized pages,
  robots behavior, unknown-page 404s and social-image availability.

Each project has a permanent `/projects/<id>` URL. The archive and detail pages
reuse `ProjectsArchive` and the existing translated project records, including
screenshots, architecture, contributions and availability. Detail pages show
technical content by default, have their own metadata, and link their project
entity and visible breadcrumbs in JSON-LD. Home, About, Résumé and the archive
use ordinary links to these pages. In the archive, normal project clicks update
`?project=<id>` in place without remounting or resetting scroll; modified clicks
and new tabs still open the permanent project links. Query bookmarks render the
selection directly (200), with no redirect. Archive queries canonicalize to the
collection; detail-page selections canonicalize and localize alternates to the
selected project's permanent URL. Unknown project paths return 404. Tracking
parameters and hashes are excluded from canonical URLs.

## Deployment settings

Set `NUXT_PUBLIC_SITE_URL` to the final HTTPS origin **before building**. This is
used by both Nuxt i18n and the sitemap. Change it and rebuild if a custom domain
is adopted later. Redirect old hostnames to that chosen domain at the hosting
layer; do not redirect users to a guessed domain.

`VERCEL_ENV=preview` disables indexing automatically at build time. Other staging
hosts should set `NUXT_PUBLIC_SEO_INDEXABLE=false`. Never set this flag to false
on the actual public production site.

Use the Nuxt/Nitro SSR deployment (`npm run build` on Vercel). The sitemap and
robots handlers are server routes, so a bare static-file export is not equivalent.

## After deployment: ownership and indexing

The public audit on 2026-10-05 found HTTP 200 responses, indexable metadata,
correct canonicals and a working sitemap on the production site. Google's
`site:arsamsarkhosh.vercel.app` search returned no documents. This indicates a
discovery/indexing issue to investigate in Search Console, not evidence of a
specific penalty. The URL Inspection report is the source for Google's actual
indexing status and exclusion reason.

1. Open [Google Search Console](https://search.google.com/search-console) using
   the Google account that should own the property.
2. Add the URL-prefix property `https://arsamsarkhosh.vercel.app/`. The Vercel
   subdomain is not a domain you control through DNS.
3. Choose HTML-tag verification. The public verification token supplied by the
   owner is configured in `nuxt.config.ts`. After deploying it, click **Verify**.
   If the account/token changes, override `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   with only the new content token and redeploy. An existing Vercel variable
   overrides the code default; remove a stale or empty override if verification fails.
4. Submit `sitemap.xml`. Use URL Inspection on the home, About, Projects and
   Résumé pages and `/projects/docintel` and `/projects/docintel-backend`;
   inspect one Persian and one Arabic URL too. Click **Test live URL**, then
   **Request indexing** on the homepage. Save Google's reported indexing reason
   if it remains excluded; a live test proves access, not inclusion in the index.
5. Check page indexing and Core Web Vitals reports after Google collects data.
   A successful sitemap submission is not a ranking or indexing guarantee.
6. Optional: repeat ownership verification in
   [Bing Webmaster Tools](https://www.bing.com/webmasters) using
   `NUXT_PUBLIC_BING_SITE_VERIFICATION`.

Adding the verification tag does not itself complete ownership verification.
The owner still needs to click Verify, submit the sitemap and request indexing
in their signed-in Search Console account.

## Content and authority work

- Add the portfolio URL to the existing GitHub and LinkedIn profiles.
- Publish factual project case studies: the problem, your contribution,
  implementation decisions, screenshots and outcomes you can substantiate.
- Use the same professional name consistently across public profiles.
- Keep the résumé, contact links and project availability current.
- Do not claim certifications, client results or performance metrics without evidence.
- The intro and long type sequences still carry a speed trade-off. Measure
  real-user LCP, INP and CLS before deciding to shorten the animation further.
  No perfect Lighthouse score or Core Web Vitals result is claimed here.

## Verification

```sh
npm run test:seo
npm run test:i18n
node --test tests/intro-session.test.ts
npm run build
```

Start the built server on a test port, then:

```sh
node scripts/test-seo-http.ts http://127.0.0.1:3001
```

For a second built-server process with `NUXT_PUBLIC_SEO_INDEXABLE=false`:

```sh
node scripts/test-seo-http.ts http://127.0.0.1:3002 --preview
```

Validate a deployed page with Google's
[Rich Results Test](https://search.google.com/test/rich-results) and
[PageSpeed Insights](https://pagespeed.web.dev/). Schema markup can be valid
without qualifying for any particular enhanced search result.

The social preview is generated from `assets/seo/social-card.svg`; the committed
PNG is served directly. To regenerate, run `node scripts/generate-seo-image.ts`
with a locally available `sharp` package (an optional package path can be passed
as the first argument). This maintenance tool is not a runtime dependency.
