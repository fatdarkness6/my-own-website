# Content positioning and technical SEO

Audit: 2026-10-08. Canonical production origin: **https://arsamsarkhosh.ir**.

This pass preserves the visual identity, layouts, navigation, responsive rules,
manual entry screen, audio, typed text, glitch effects and Three.js work.
It improves factual content and crawlability; it does not promise indexing or rankings.

## Stack and language URLs

Inspected installed Nuxt 4.4.8, Vue 3.5.40 and Nuxt i18n 10.6.0, with Quasar,
Three.js, Lenis and postcss-rtlcss. No new SEO module or runtime dependency was added.

The existing `prefix_except_default` strategy remains:
English at `/`, then Spanish `/es`, German `/de`, French `/fr`,
Italian `/it`, Arabic `/ar` and Persian `/fa`.
Explicit URLs determine language; there are no browser-language redirects.
Arabic and Persian retain SSR language/direction, joined-script typing, localized
glitch character pools, Quasar language packs and their existing RTL layouts.

There are five main pages and five permanent project pages per language:
**70 indexable canonical URLs**. The sitemap derives project paths from the shared
project catalog, and a regression test compares its route inventory with page files.

## Positioning and evidence

The primary identity is **Software Developer**. Home introduces web applications,
backend systems and AI-assisted tools. The name, role and professional links live
in `app/assets/data/identity.ts`; page metadata source strings live in
`app/assets/data/pageSeo.ts`. The locale catalogs provide natural localized copy.

- Arilvo: frontend built from scratch for an MEP/BIM engineering company; responsive
  Nuxt/Vue/TypeScript/Quasar interfaces, GSAP, Italian/English/German, SEO and deployment.
- DocIntel: frontend and backend application work, document extraction and processing,
  embeddings, retrieval, summaries and answers with references. Its frontend is live;
  the backend source is public, but the API is not deployed. No personal AI-engineer claim.
- Raymand Group: spelling checked against the live company title. Corporate website
  design/development, Persian/English/German, responsive presentation and deployment;
  Nuxt, Vue, TypeScript and Quasar. Removed claims that this website is a Node/MongoDB
  backend or a procurement application. The independently linked backend repository
  remains a separate résumé record, not evidence of corporate-site backend ownership.
- Arvand Termo Tec: a contribution to an existing Next.js/Strapi application,
  including CMS integration, 250+ refactored files, a custom hero, responsive sections,
  localization/routing and image/Swiper fixes. Schema identifies a contributor,
  not the sole creator of the existing product.
- This portfolio: an experimental frontend project with animation, Three.js and
  performance work. No invented awards, seniority, business outcomes or metrics.

The downloadable English résumé and existing social-card artwork were regenerated
to match. Both résumé pages were rendered and visually checked. The historical
course title “Junior Front-End Developer” is retained as the user's supplied course
name, not a professional positioning statement. Generic engineering-company and
technical architecture references remain where factual.

## SEO implementation

`usePortfolioSeo` remains the single SSR head/schema implementation. It uses
Nuxt i18n's `useLocaleHead`, rather than a parallel hreflang system.

- Unique localized titles/descriptions on all main and project pages, with real-name
  identity and concise project titles. No meta-keywords or hidden SEO paragraphs.
- Exactly one primary H1 per page. The Home name is semantic HTML, not canvas-only,
  with a localized full-name accessible label. Its nearby role remains visible.
- Self-canonicals on each language URL, never all localized pages pointing to English.
  Every canonical uses the exact non-www HTTPS origin, including preview/local builds.
  A stale environment override or incoming hostname cannot change it.
- Reciprocal, fully qualified hreflang links for all seven versions, including each
  page itself, plus English x-default. The sitemap uses the same locale inventory.
- Known page URLs with trailing slashes return a 308 to the no-slash path, preserving
  queries. The root retains its slash. Unknown pages/projects return real 404s.
- Open Graph and Twitter card titles, descriptions, image alternatives, URLs and
  locale/alternate-locale metadata. Project previews use real project screenshots;
  dimensions and MIME types match their actual files.
- Stable Person and WebSite IDs, actual GitHub/LinkedIn profiles, real portrait and
  truthful technologies. Name variants include Persian and Arabic. About and résumé
  use ProfilePage with the same Person as mainEntity. Projects use ItemList,
  CreativeWork/SoftwareSourceCode and BreadcrumbList where appropriate.
- Production robots allows public pages/assets and advertises the apex sitemap.
  The sitemap includes all 70 URLs, reciprocal alternates and real project images,
  without made-up lastmod values. Previews/development are noindex; their sitemap
  returns 404 and robots disallows crawling.
- Crawlable project/navigation anchors remain intact. Selecting a project still
  updates `?project=` in place without resetting scroll. Archive selections
  canonicalize to the collection; selections on a detail route identify the
  selected project's permanent URL and its matching alternates.
- Initial SSR HTML contains real headings, descriptions, project content and metadata.
  Animation reserve/accessibility copies remain functional, not keyword blocks.

The existing favicon family, PNG/ICO/SVG icons, Apple icon, manifest, gzip/Brotli
asset compression, lazy project thumbnails and font-display settings were retained.
Project preview dimensions were corrected and the portrait loads Three.js dynamically
on mount, with an unmount guard; its visual behavior was not redesigned.

## Code and validation maintenance

Main changed areas:

- `app/assets/data/{identity,pageSeo,about,aboutPage,homeCopy,projects,resume,contact}.ts`
- `i18n/english.ts` and all seven `i18n/locales/*.ts`
- `shared/{seo,locales}.ts`, `usePortfolioSeo.ts`, `nuxt.config.ts`,
  `server/middleware/canonical-path.ts` and `vercel.json`
- Page/Home identity consumers, Header, project Archive/Preview and GlitchPortrait
- Existing social SVG/PNG and generated résumé PDF
- SEO/localization tests, deployment documentation and environment example

TypeScript, vue-tsc and Node/Three type declarations were added as **development-only**
dependencies, with `npm run typecheck`. Existing template expressions used HTML
quote entities that Vue's type checker could not parse; these were converted to
equivalent JavaScript quotes. Plugin provider types and Quasar event/value types
were corrected without changing normal scrolling, selection or volume behavior.
No suppression comments or reduced strictness were introduced.

Checks:

```sh
npm run typecheck
npm run test:i18n
node --test tests/*.test.ts
npm run build
# Start the resulting production server on port 3001, then:
npm run test:seo:http -- http://127.0.0.1:3001
# Start a second server with NUXT_PUBLIC_SEO_INDEXABLE=false on port 3002, then:
npm run test:seo:http -- http://127.0.0.1:3002 --preview
```

HTTP assertions cover all 70 routes in each mode: localized page and social copy,
canonical/hreflang/x-default, lang/dir, one H1, Person/ProfilePage/project JSON,
crawlable links, images/icons, slash redirects, queries, 404s, robots and sitemap.
Preview validation also supplies a deliberately different site URL to catch leaks.
Browser review covers desktop and phone layouts, LTR/RTL copy, entry, hydration,
project navigation and preserved portrait/animation rendering.

Final results: production build and TypeScript passed, along with 11 localization
checks and 39 unit tests. HTTP validation passed for all 70 production routes and
all 70 preview/noindex routes. Browser checks covered 1280×720 desktop and 390×844
mobile layouts, including Persian and Arabic; no hydration warnings were observed.
An actual project-thumbnail click preserved the current scroll position while
updating the query string. These are local production-build checks, not a claim
that the new revision has been deployed or indexed by Google.

## Required coordinated release — avoid opposing redirects

A live check on **2026-10-08** still showed:

`https://arsamsarkhosh.ir/ → 308 → https://www.arsamsarkhosh.ir/`

That is the reverse of the requested canonical policy. Repository metadata alone
cannot change an existing Vercel dashboard domain redirect.

The previous deployed repository also contains an apex-to-www rule. Do not turn
on a www-to-apex dashboard redirect while that old rule is still deployed.

1. Remove an obsolete `NUXT_PUBLIC_SITE_URL` override, or set it to
   `https://arsamsarkhosh.ir`. Do not set production SEO_INDEXABLE to false.
2. Deploy this reviewed revision to remove the old repository apex-to-www rule.
   Leave the dashboard's existing redirect unchanged during that deployment.
3. In Vercel → Project → Settings → Domains, remove the dashboard apex-to-www
   redirect and assign **arsamsarkhosh.ir** directly to Production. Verify it
   returns **200 directly**, without a Location header.
4. Only then set **www.arsamsarkhosh.ir** to permanently redirect to the apex,
   preserving paths. Verify www and the old Vercel URL reach the corresponding
   apex page with no loop. Complete these steps in one release window: the new
   canonical temporarily points through the old redirect until step 3 is done.
5. Keep the old public Vercel domain attached. The repository includes only a
   hostname-specific permanent redirect from that old public host to the apex;
   it does not redirect every preview host. No www-to-apex repository rule was
   added while the live inverse dashboard redirect remains active. This pass
   does not publish changes or alter Vercel settings.

## Search Console and external work

- Complete verification of the **arsamsarkhosh.ir Domain property** in Search Console.
  The supplied DNS TXT record was observed publicly; DNS publication alone is not
  proof that Google verification or indexing has completed.
- Submit **https://arsamsarkhosh.ir/sitemap.xml** after the canonical host serves
  production directly. Inspect the home, About and selected project URLs, including
  Persian. Check Google's chosen canonical and indexing exclusions.
- Retain access to the old Vercel property. For the hostname migration, use Google's
  Change of Address workflow where eligible after permanent redirects are live.
- Update public GitHub/LinkedIn and other links you control to the apex URL.
- Review Core Web Vitals and crawl/indexing reports using real production data.
  Search Console, Google's rendering/indexing decisions and real-user metrics cannot
  be certified by local tests.
- A native-speaker editorial review remains useful for localized nuance.
- The dependency installer reported 30 audit advisories (including high/critical).
  No force-upgrades or unrelated dependency migration were attempted in this
  design-preserving SEO pass; review them as a separate maintenance task.

## Intentional tradeoffs

The manual entry gate can delay visible content for visitors and automated renderers.
It was explicitly preserved: the site is not auto-entered for bots or users.
The same content exists in SSR, with the existing no-JavaScript reading fallback.
Glitch/typed motion, snap scrolling, the display fonts and the large WebGL chunk
remain part of the requested design. No claim of a perfect Lighthouse score is made.
The PDF remains English and is labeled as such on translated pages. The original
social-card design remains shared; the metadata around it is localized.

Further search visibility depends on indexing, useful content, legitimate references
and competition. None of these changes guarantees first place for a name or a broad
term such as “developer”.

References: [Nuxt i18n SEO](https://i18n.nuxtjs.org/docs/guide/seo),
[Google multilingual guidance](https://developers.google.com/search/docs/specialty/international/localized-versions),
[Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
