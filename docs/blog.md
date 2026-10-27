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
| `app/assets/css/pages/blogArticle.css` | Article-only split hero, chapter rail, prose and visual layouts |
| `app/composables/useArticleReading.ts` | One passive-scroll/rAF reading measurement shared by contents and backdrop |
| `content/interface.json`, translations | Seven-language blog UI and SEO copy |
| `usePortfolioSeo.ts`, `shared/seo.ts` | Existing shared SEO extended with Blog/BlogPosting and real locale inventories |
| `shared/validateBlogContent.ts` | Build-time authoring checks |

The implementation reuses Quasar controls, `CommonHackerReveal`,
`AnimationTypedLine`, `AnimationGlitchText`, `CommonPageGlitch`, `useViewportTyping`
and the existing translation/SEO helpers. Headings and short descriptions use the
portfolio's typing/glitch effects; article body paragraphs and code stay steady
for reading. Actual text is present in the initial HTML before enhancement.

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

The index uses compact, cut-corner dispatch cards in a single-column archive.
Desktop/tablet cards place artwork beside the copy; below 768px the image stacks
above the text with a capped image area. Technical tags sit with the illustration,
while the content has a short metadata rail, full title, two-line excerpt and one
action row. The excerpt stays plain to support native CSS clamping without hiding
letters in animated reserve layers. The full summary remains in the HTML and on
the article page; titles are never truncated.

`BlogPostMeta` has an optional compact mode for cards (date and reading estimate).
Article pages retain the full author/date/reading details. Card language links use
short codes with native-language accessible labels and only advertise actual
translations. Existing links, Quasar controls, reveal/title/button animations and
the original article data remain. Hover/focus reuses `AnimationGlitchCard` in
image-only mode (`media-only`, `fit="contain"`, `interval="0"`). The original RGB,
slice and flicker effects live in the shared component/stylesheet; there are no
blog-specific image keyframes. Its optional image slot preserves the native lazy
image, dimensions, translated alt text and uncropped artwork. Homepage cards keep
their default layout, filters and automatic timing. Blog images animate only on
interaction, with the same reduced-motion guard.
The archive still displays only real articles, not invented filler posts.

The first cover is the original 1280 × 853 artwork collected from its LinkedIn
post on 2026-10-27. Its original JPEG is preserved locally, with a WebP generated
for card display. The complete illustration is shown without cropping its text.
Cover metadata/translated alternative text are validated at build time, and the
same original artwork is used for article social metadata and structured data.

This stage does not introduce a CMS, comments, automatic LinkedIn synchronization,
additional articles, dependency changes or a deployment. Add and review further
real posts separately. See `content/README.md` for authoring details.

## Typography and revision-stream background

The blog uses the portfolio's display font only for the short index-page masthead.
Card titles, article titles and section headings use the readable terminal font,
preserving actual upper/lowercase letter shapes rather than the display font's
mixed-case glyphs. Description tokens, Vazirmatn for Persian/Arabic and monospace
code islands remain.
Each header's viewport trigger owns its typing sequence; recurring card and
section-heading glitches reuse `CommonPageGlitch` so off-screen text, hidden tabs
and reduced-motion readers do not keep running effects.

`app/components/blog/Background.vue` is shared by both routes and explicitly
imported, avoiding stale dev-server component discovery. It renders deterministic
SVG diff hunks, revision nodes, a stepped edit cursor and traveling spine packets.
It uses CSS rather than a canvas/WebGL/render loop, stays behind the document and
does not capture pointer input. The central reading area is masked, phone layouts
use a single subdued rail, hidden tabs pause animation and reduced-motion/print
styles remove motion. Decoration is excluded from the accessibility tree and
does not add untranslated article content or SEO text.

Verified with content validation, 77 tests, 14 localization checks, typecheck and
a production build. Browser checks covered EN/FA index and article layouts,
390px and 320px widths, matching reserved/rendered heading heights, section links,
and a clean production console. All 86 HTTP page/SEO cases still pass; the full
HTTP command still stops at the pre-existing invalid RTL WebP asset noted above.

## Article field-note redesign

The detail route keeps its published URL, reading-mode entry behavior, actual
article languages, section anchors, source attribution and existing paragraphs.
Its opening pairs a readable title/summary with the original cover, using the
shared image-only GlitchCard. Numbered chapters sit in a quiet reading column;
desktop gets a sticky, independently scrollable contents/progress rail, while
smaller screens get a compact horizontal contents list. Body paragraphs remain
fully rendered and selectable, with no scroll-jacking, pinning or text reveal gate.

Reading progress scrubs the existing revision-stream background in both scroll
directions: packets travel along its spine, rails shift, and the active diff hunk
changes. Archive mode retains its original autonomous motion. The same reading
measurement marks the current chapter. Work is coalesced to one frame per scroll
burst, updates after resizes/font/image layout changes, skips hidden documents and
removes all observers/listeners on unmount. Reduced motion removes background
translation/packets, without disabling useful reading progress or anchor links.

Optional `section.visual` records in each real article language support project
screenshots, architecture flows and labeled metrics. The Arvand note reuses its
existing project screenshot, adds a build-time flow and presents the original
local-test timings with explicit scope warnings. No new benchmark, production
claim, article, dependency, remote image request or guessed publication date was
introduced. See the authoring guide for the three validated visual shapes.

Verification: content validation, 83 automated tests plus 14 localization checks,
Nuxt typecheck and production build passed. Browser checks covered desktop and
EN/FA phone reading, 320px containment, image aspect/alt text, chapter anchors,
forward/backward progress, 100% completion and code copy. All 86 HTTP page/SEO
cases passed; the full HTTP command still flags the existing unrelated invalid
RTL WebP asset described above.

## Shared smooth chapter navigation

Article contents links and the Read article button now use `useSectionNavigation`,
which reuses the About page's existing `useSectionHash` controller and shared
Lenis instance. About retains its scroll-driven chapter bookmarks. Article,
Contact and Projects anchors use navigation-only mode: clicking updates the hash
without a router transition, but ordinary scrolling does not rewrite their URL
or add another scroll spy. Sticky-header offsets, native mobile smooth scrolling,
reduced-motion preferences, modified clicks, intro-gated restoration and history
state/query preservation are handled in the same controller. The homepage's snap
scrolling and the accessibility skip link remain unchanged.

## Additional LinkedIn articles

On 2026-10-27, after the owner signed into the connected browser, four additional
posts were read in full from their own activity feed and adapted into Persian and
English. Permanent links were obtained using LinkedIn's Copy link to post action;
tracking query parameters were removed. No LinkedIn posts were edited or published.

| Blog ID | Original post |
| --- | --- |
| `ghssh-windows-accounts` | [ghssh 0.4.0](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_python-github-opensource-share-7519003674216603648-Ylbz/) |
| `strapi-vercel-content` | [Strapi content migration](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_strapi-vercel-neon-share-7517660971092545536-AT7Q/) |
| `nextjs-architecture-performance` | [Arvand refactor](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_nextjs-react-webperformance-share-7498392399484751873-mET_/) |
| `docintel-document-rag` | [DocIntel introduction](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_python-fastapi-artificialintelligence-ugcPost-7494457730058018816-tE9M/) |

The adaptations preserve release context and the CMS migration's then-next step.
The 25 articles / 50 language variants are not conflated, and no speedup, model
accuracy, user count or production benchmark was invented. Dates shown are when
the adaptations were added to the blog; relative LinkedIn timestamps were not
converted into guessed original publication dates.

The first three covers are the actual attached artwork/screenshots delivered by
LinkedIn (480 × 599, 480 × 480 and 480 × 216). JPEG originals and compressed WebP
versions are hosted locally; nothing is hotlinked. DocIntel's original post uses a
video, so `blogCover` reuses the existing project screenshot instead. This shared
resolver serves cards, article headers and social/structured metadata without
duplicating the project asset or its path. Source attribution is also shared and
remains available on text-only articles. Code samples have an optional validated
label, so Shell commands are no longer presented as Next.js code.

The five real articles have matching EN/FA chapter IDs and complete actual
translations. Canonicals, BlogPosting records, the index and sitemap derive the
new inventory automatically: 94 canonical page/language URLs. The other five
interface languages recommend the English version without inventing translations.

Verification for this update: content validation, 91 automated tests, all 14 i18n
checks, Nuxt typecheck and the production build passed. All 94 HTTP page/SEO cases
passed, including the new article canonicals, language alternates, source links,
shared DocIntel image metadata and sitemap inventory. The full HTTP command still
stops at the pre-existing invalid RTL portrait WebP signature noted above.
The three new WebPs preserve their JPEG dimensions and are smaller than their
sources. Browser checks covered desktop, Persian/English 390px and 320px layouts,
smooth chapter transitions, correct offsets/restoration, LTR Shell samples in RTL
prose and a clean production console.

## Original ghssh launch and grid cards

Added only the owner's requested original Linux v0.1.0 launch post as
`ghssh-github-account-switching`, in Persian and English. Its canonical source is
[the original launch](https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_github-python-opensource-share-7516578675329314816-vIHn/),
verified against the signed-in post and the owner's pasted text. The switch/back
commands, key-management features, confirmations and pipx context are preserved.
The later Windows release remains a separate article. Its own 800 × 999 artwork
is hosted locally as JPEG and a smaller WebP; the other unselected LinkedIn posts
were not imported. There are now six articles and 96 canonical page/language URLs.

Archive cards use three columns from 1200px, two from 768px, and one below 768px.
Each cut-corner Quasar card has a numbered file bar, uncropped image, readable full
title, two-line excerpt, technical tags and aligned language/action footer. Grid
rows stretch their existing reveal wrappers; no fixed title height, new animation
implementation or dependency was introduced. Shared image-hover glitch, text
glitch, reveal, locale links, RTL and reduced-motion handling remain in use.

Content validation, 92 tests, 14 i18n checks and Nuxt typecheck passed. Browser
checks confirmed three/two/one columns, equal desktop row heights, complete loaded
artwork, and no page/footer overflow at 390px or 320px in Persian. The new article
retains the original commands, source attribution and real EN/FA routes.
