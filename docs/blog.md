# Blog — first implementation stage

The blog adds `/blog` in all seven interface languages and one verified article,
`/blog/strapi-nextjs-isr`, in English and Persian. It adapts the latest post visible
in the owner's LinkedIn activity feed on 2026-10-27:

[Original LinkedIn post](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_nextjs-isr-webperformance-share-7520066003934928906-xBHQ/).

The adaptation preserves the distinction between the original CMS request's time
to first byte and the local production test's complete page retrieval times.
The 23 ms / 11 ms figures are explicitly local results, not live-site benchmarks.
No performance improvement multiplier or production measurement was inferred.
The visible date is when this adaptation was added to the blog; LinkedIn showed
only a relative time, so no exact source publication date was guessed.

## Owners

| Location | Responsibility |
| --- | --- |
| `content/blog.json` | Source provenance, post metadata and real EN/FA article text |
| `app/assets/data/blog.ts` | Content types, JSON adapter and computed reading estimate |
| `shared/blogRoutes.ts` | Article paths, actual languages, strict detail lookup and index previews |
| `app/pages/blog/` | Index and article composition, using the default document layout |
| `app/components/blog/` | Shared post card, metadata and safe article body/code rendering |
| `app/assets/css/pages/blog.css` | Responsive terminal-inspired index and quiet reading layout |
| `content/interface.json`, translations | Seven-language blog UI and SEO copy |
| `usePortfolioSeo.ts`, `shared/seo.ts` | Existing shared SEO extended with Blog/BlogPosting and real locale inventories |
| `shared/validateBlogContent.ts` | Build-time authoring checks |

The implementation reuses Quasar controls, `CommonHackerReveal`,
`AnimationTypedLine`, `AnimationGlitchText`, `useViewportTyping` and the existing
translation/SEO helpers. Body paragraphs and the article title remain immediately
readable, with no per-paragraph typing or recurring article-text glitches.

The `readingMode` page metadata skips the entry overlay for direct blog visits,
including reloads. Music is opt-in there and its MP3 is not preloaded on a fresh
blog visit. Existing portfolio entry behavior stays intact; music the visitor
already started is not forcibly stopped when navigating to the blog.

Article language choices are limited to actual versions. The shared sitemap now
uses `SITE_PAGES`, whose per-page locale lists represent 86 canonical URLs at this
stage. Other pages retain seven languages. Unknown articles and missing article
translations return 404 rather than rendering English under another language URL.

Header navigation uses the existing Quasar button links with native link
semantics. The Blog link stays highlighted on article pages; the same section
matching also applies to project details. These pages are sibling Nuxt routes,
so Quasar's route-tab record matching cannot reliably select their index links.

## Verification

Content validation, all 14 localization checks and 77 tests across 11 test files
passed. The production build and Nuxt typecheck passed. Browser checks covered
English and Persian index/article pages, narrow-screen RTL sizing, language
switching, contents anchors, code copy and direct reading without the entry gate.

HTTP verification passed all 86 page/SEO cases in both production and noindex
preview configurations, including actual article-language alternates, structured
data and missing-translation 404s. The full command then fails the existing asset
signature check: the independently modified
`public/images/background-rtl-languages.webp` contains JPEG bytes. This image was
already modified before the blog work and was left untouched.

## Card design update

The index uses image-first vertical cards in a three-column desktop grid, two
columns below 1024px and one below 768px. It still displays only the one real
article; empty columns are not filled with invented posts. Shared card/metadata,
Quasar controls, reveal animation, localized copy and actual-language links remain.

The first cover is the original 1280 × 853 artwork collected from its LinkedIn
post on 2026-10-27. Its original JPEG is preserved locally, with a WebP generated
for card display. The complete illustration is shown without cropping its text.
Cover metadata/translated alternative text are validated at build time, and the
same original artwork is used for article social metadata and structured data.

This stage does not introduce a CMS, comments, automatic LinkedIn synchronization,
additional articles, dependency changes or a deployment. Add and review further
real posts separately. See `content/README.md` for authoring details.
