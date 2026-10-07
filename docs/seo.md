# Search visibility

The canonical site is **https://www.arsamsarkhosh.ir**. Technical SEO helps
search engines find and understand the portfolio; it cannot guarantee rankings
or indexing. Name searches are a more realistic initial target than competitive
generic queries such as “developer”. No keyword stuffing, paid-link schemes,
invented reviews, or crawler-only content is used.

## Implemented

- Server-rendered, localized titles and descriptions across five main pages,
  five project pages and seven languages.
- Absolute self-canonicals, reciprocal `hreflang` links and an English `x-default`.
- `/sitemap.xml`: 70 canonical URLs with language alternates. No made-up modification dates.
- Image sitemap entries use the existing project records, so real screenshots
  are discoverable on all localized project pages without a separate image list.
- `/robots.txt`: sitemap discovery for production; Vercel previews are excluded.
- `noindex, nofollow` metadata and HTTP headers for non-indexable deployments.
- Open Graph and Twitter large-image previews, with a static 1200 × 630 PNG.
- Project social previews and ImageObject markup include actual screenshot
  dimensions; WebSite alternate names reflect the visible multilingual identity.
- Screenshot filenames and HTTP/Open Graph types match their JPEG contents;
  permanent redirects preserve the previous `.png` image URLs without re-encoding.
- A custom AS favicon in SVG, multi-resolution ICO and PNG formats, Apple touch
  icon and a web manifest with standard and maskable Android icons.
- Gzip/Brotli public assets are generated during the production build.
- JSON-LD: a shared Person and WebSite, localized page entities, About/Résumé
  ProfilePage markup and the Projects collection. Identity links point to the
  real GitHub and LinkedIn profiles; no claims about ratings, certifications or awards.
- Genuine typed text rendered in initial HTML, then enhanced with animations.
- A short boot animation followed by manual click/tap or keyboard entry; audio
  unlocks in that gesture. The intro must not dismiss itself on a timer.
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

Set `NUXT_PUBLIC_SITE_URL=https://www.arsamsarkhosh.ir` in Vercel's production
and preview environments, then rebuild. Removing this override also uses the
correct default in `shared/seo.ts`. Known old production origins are normalized
to the new origin, so a stale Vercel environment variable cannot silently keep
the old domain in metadata. Nuxt i18n, canonicals, structured data, social images,
robots and the sitemap share this origin.

The live check on **2026-10-07** confirmed that `https://arsamsarkhosh.ir/`
already redirects permanently to `https://www.arsamsarkhosh.ir/`, which returns
200 over HTTPS. The code follows that existing www preference. At audit time,
the new domain still published canonicals, language alternates, social-image
URLs and a sitemap pointing to the old Vercel domain; the old domain returned
200 independently. These are the migration issues addressed by this update.

`vercel.json` adds hostname-specific permanent (308) redirects from
`arsamsarkhosh.vercel.app` and `arsamsarkhosh.ir` to the corresponding www URLs.
Vercel preserves the path and query string, including localized routes and
project selections. Preview deployment hosts and the canonical www host do not
match these rules. Keep the old production domain attached to the project;
keep redirects for at least a year, preferably indefinitely. Do not add a
conflicting www-to-apex redirect in the Vercel dashboard.

`VERCEL_ENV=preview` disables indexing automatically at build time. Other staging
hosts should set `NUXT_PUBLIC_SEO_INDEXABLE=false`. Never set this flag to false
on the actual public production site.

Use the Nuxt/Nitro SSR deployment (`npm run build` on Vercel). The sitemap and
robots handlers are server routes, so a bare static-file export is not equivalent.

## After deployment: ownership and indexing

The new Google verification TXT record was publicly resolvable at
`arsamsarkhosh.ir` on 2026-10-07. The owner still needs to click Verify in Search
Console if this has not been done; DNS visibility does not confirm account status.
DNS is hosted on Vercel's nameservers, so its records are managed in Vercel's
team-level Domains panel. IRNIC is the registrar.

1. Open [Google Search Console](https://search.google.com/search-console) using
   the Google account that should own the property.
2. Add a **Domain property** named `arsamsarkhosh.ir` (no protocol or path).
   Copy Google's exact TXT verification value to your domain's DNS provider,
   at the root (`@` or the provider's equivalent). Keep any existing TXT records.
   Once DNS has propagated, click **Verify**. This covers www and non-www.
3. If you cannot edit DNS, add a **URL-prefix property** for
   `https://www.arsamsarkhosh.ir/` and use Google's HTML-tag option instead.
   Put its content token in `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy,
   then click **Verify**. The existing tag was supplied for the old property;
   its presence alone does not prove ownership of the new domain.
4. After deployment, submit **https://www.arsamsarkhosh.ir/sitemap.xml**.
   Use URL Inspection on the home, About, Projects and
   Résumé pages and `/projects/docintel` and `/projects/docintel-backend`;
   inspect one Persian and one Arabic URL too. Click **Test live URL**, then
   **Request indexing** on the homepage. Save Google's reported indexing reason
   if it remains excluded; a live test proves access, not inclusion in the index.
5. If the old `https://arsamsarkhosh.vercel.app/` property is verified, retain it
   and use its **Settings → Change of Address** flow to move to the verified
   new property after the redirects are live. Follow Google's eligibility checks.
6. Check page indexing and Core Web Vitals reports after Google collects data.
   A successful sitemap submission is not a ranking or indexing guarantee.
7. Optional: repeat ownership verification in
   [Bing Webmaster Tools](https://www.bing.com/webmasters) using
   `NUXT_PUBLIC_BING_SITE_VERIFICATION`.

Verification, sitemap submission and indexing requests require the owner's
signed-in account; they have not been completed by changing the source code.
Google's selected canonical and exclusion reason in URL Inspection are the
reliable way to investigate indexing. Moving domains can cause temporary
ranking fluctuations while the new URLs are processed.

Migration guidance: [Google's site-move checklist](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
and [Vercel's production-domain redirects](https://vercel.com/docs/routing/redirects#choose-a-canonical-production-domain).

## Content and authority work

- Update the existing GitHub and LinkedIn profile links to
  `https://www.arsamsarkhosh.ir/` and update links you control elsewhere.
- Publish factual project case studies: the problem, your contribution,
  implementation decisions, screenshots and outcomes you can substantiate.
- Use the same professional name consistently across public profiles.
- Keep the résumé, contact links and project availability current.
- Do not claim certifications, client results or performance metrics without evidence.
- The intro and long type sequences still carry a speed trade-off. Measure
  real-user LCP, INP and CLS before deciding to shorten the animation further.
  No perfect Lighthouse score or Core Web Vitals result is claimed here.
- A custom domain supports a consistent professional identity, but buying one
  is not an automatic ranking boost. `.ir` is a country-code domain, a signal
  of relevance to Iran. Keep the seven language versions and reciprocal
  `hreflang`; do not force visitors into a language based on location.
  See [Google's international-site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

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

Also run the HTTP checks with the legacy `NUXT_PUBLIC_SITE_URL` override to
confirm old deployment settings cannot bring back the previous canonical host.
After deploying, run the same checks against `https://www.arsamsarkhosh.ir` and
verify these production redirects (local Nitro does not execute `vercel.json`):

```sh
curl -I 'https://arsamsarkhosh.vercel.app/fa/projects?project=docintel'
curl -I 'https://arsamsarkhosh.ir/fa/projects?project=docintel'
curl -I 'https://www.arsamsarkhosh.ir/fa/projects?project=docintel'
```

The first two should return 308 with the same path/query on the www domain;
the final URL should return 200, without a redirect loop or `noindex`.

Validate a deployed page with Google's
[Rich Results Test](https://search.google.com/test/rich-results) and
[PageSpeed Insights](https://pagespeed.web.dev/). Schema markup can be valid
without qualifying for any particular enhanced search result.

The social preview is generated from `assets/seo/social-card.svg`; the committed
PNG is served directly. To regenerate, run `node scripts/generate-seo-image.ts`
with a locally available `sharp` package (an optional package path can be passed
as the first argument). This maintenance tool is not a runtime dependency.

## Icon source and regeneration

`public/favicon.svg` is the source for the official AS monogram. It uses the
site's cut corners, dark background and electric blue, with a small static
glitch interruption. It uses paths rather than fonts, so it renders consistently.
Run `node scripts/generate-icons.ts` with `sharp` locally available, or pass the
path to a local `sharp` package as its first argument. No image package is required
at runtime or on Vercel: the generated files are committed.

The set includes 16, 32, 48, 96, 192 and 512 px PNGs, a 16/32/48/256 px ICO,
an opaque 180 px Apple touch icon and a 512 px maskable icon. The manifest keeps
normal browser navigation and introduces no service worker or offline behavior.
Icon URLs are root-relative and stable across languages. The 96 px PNG gives
Google a supported, crawlable raster favicon; see
[Google's favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search).
After deployment, request a homepage recrawl in Search Console; favicon display
can take time and is controlled by Google.
