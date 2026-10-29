# Edit your portfolio content

This folder is the editable content source. The `.ts` files under
`app/assets/data/` and `i18n/locales/` are adapters, not places to edit copy.
No database, admin account, runtime fetch or new dependency is needed.

## Where to edit

| File | Controls |
| --- | --- |
| `projects.json` | Project records, their order, URLs, screenshots and Home's `featuredIds` |
| `blog.json` | Verified blog articles, original source links, dates added to this blog and actual language versions |
| `resume.json` | Work experience, skills, education, extra projects and PDF settings |
| `profile.json` | Name, role, public email, GitHub and LinkedIn, shared across pages |
| `images.json` | Home portrait, RTL portrait and About portrait paths |
| `home.json` | Home heading segments, accents and animation timings |
| `about.json` | Shared background/toolkit copy |
| `about-page.json` | About chapters, capabilities, principles and selected systems |
| `contact.json` | Contact enquiry choices, prompts and title segments |
| `seo.json` | Main-page source titles and descriptions; URL policy stays in `shared/seo.ts` |
| `interface.json` | Stable lookup text/readable keys for interface labels (use translation overrides to change their display) |
| `translations/en.json` | Visitor-facing English editorial overrides |
| `translations/es,de,fr,it,ar,fa.json` | The corresponding localized copy |

JSON requires double quotes and no comments or trailing commas. Keep whitespace
segments such as `" "` and `" • "`: animated headings use them intentionally.
Do not put credentials or private information in these files; they are public.

## Edit visible text

For an existing heading/description, search its text in `translations/en.json`
first. If there is an override, edit that value. Otherwise edit its source value
in the relevant data file. Update the corresponding readable key in the other
language files when the meaning changes. The same text can deliberately reuse a
translation from another key. No hash calculation is needed.

For buttons and other interface labels, find the readable key in `interface.json`
and edit/add that key in `translations/en.json` (or the desired language). For
example, add `"source": "View source"` to change the Source code button in English.
Do not rename `interface.json` source strings: components use them as stable lookup
IDs. You do not need to edit a Vue component to add a translation override.

Example: project summaries use `"projects.ghssh.summary"`; an experience uses
`"resumeExperience.arilvo.summary"`. IDs keep those keys stable when you reorder
project/experience arrays. Numeric keys in lists such as `contributions.0` track
list positions: update their translations when inserting/reordering list items.

Changing a source value rebinds the existing translations automatically; it does
**not** translate the new text. Missing copy uses the existing English fallback.
The validation command prevents publishing missing main SEO/project translations.
Brand names and technical tokens such as API remain untranslated.

## Add a project

1. Copy `templates/project.json` as a new object inside `projects.json` → `items`.
   The template itself is not displayed or imported.
2. Set a unique lowercase hyphenated `id`, e.g. `my-cli`. This automatically adds
   `/projects/my-cli`, its six localized variants, metadata, breadcrumbs, source
   schema and sitemap entries. No route or Vue file needs editing.
3. Choose `category`: `web`, `ai` or `tools`. Keep the existing categories; adding
   another category requires updating the UI filters and types.
4. Set `repo` and/or `live`. Omit unused optional fields rather than setting them
   to empty strings. Only set `status: "live"` if there is a real hosted app.
5. Optional screenshot: place actual assets under `public/images/projects/`,
   then set `screenshot.src`, `optimizedSrc`, `alt`, `width`, `height`, `mimeType`.
   No screenshot is required for a CLI. The existing cover/social fallback works.
6. Add the new copy to the six non-English translation files using keys such as
   `projects.my-cli.summary`, `.description`, `.role`, `.headline`, `.ownership`,
   `.note`, `.contributions.0`, `.layers.0.title`, etc. Run the checks below to see
   exactly which required keys are missing. English defaults to the new source.
7. To show it on Home, put its ID in `featuredIds`, in your chosen display order.
   Adding it to `items` alone does not alter the existing Home selection.

The project index and résumé's main project archive derive from this catalog.
Do not duplicate portfolio projects inside `resume.json` → `extraProjects`.
Those are for additional résumé-only entries.

**Do not rename a published project ID** just to change its title. IDs are URLs;
renaming one requires redirect handling to preserve old links and SEO.
Removing a project also requires removing its featured/focus/experience references
and old translation keys. Decide on an appropriate redirect for its old URL.

## Checks and publication

```sh
npm run content:check
npm run content:translations
npm run test:i18n
npm run typecheck
npm run build
```

`content:check` catches malformed project data, duplicate IDs, invalid links,
missing screenshots, broken references, unknown translation keys and missing
required SEO/project translations. It also runs automatically before `npm run build`.
`content:translations` additionally lists fallback keys, including technical copy
that may intentionally stay English. It never invents or overwrites translations.

Content is bundled at build time. The dev server reloads changes; the public site
needs a commit/push and a successful deployment. These JSON files are not a live CMS.

## Blog articles

### Quick workflow — no Vue or route edits

```sh
npm run blog:new -- my-post --source "https://www.linkedin.com/posts/your-original-post/" --lang fa,en
```

This creates **only** `content/drafts/my-post.json`, using the editable
`templates/blog.json`. It does not add a public page. Replace every `TODO:` value
with your title, summary, tags and article sections. Remove languages you have not
actually written; `--lang fa` is the default, and any site language is supported.
An optional `--project ghssh` reuses that project's image and related-project link.
No image or project is required. The date defaults to today's date in Tehran;
use `--date 2026-10-28` to explicitly set the date this adaptation joins the blog.
The original LinkedIn post's date is never guessed.

When the article is ready:

```sh
npm run blog:add -- content/drafts/my-post.json --check
npm run blog:add -- content/drafts/my-post.json
npm run content:check
```

`--check` validates without changing anything. The second command adds the article
to the end of `blog.json` → `posts` (the array controls display order). It refuses
unfinished placeholders, duplicate IDs/sources, invalid dates/links, missing cover
files, broken project references and mismatched translated section IDs. It never
overwrites an existing draft, removes your draft, commits, pushes or deploys.
The app, blog cards, actual-language routes and SEO continue to derive from this
one published catalog. To edit a published article, edit its existing entry in
`blog.json`; do not add it again. Review the diff and run the normal checks before
publishing. You can still copy `templates/blog.json` into the catalog manually,
but remove every placeholder and run `content:check` first.

خلاصه: دستور اول یک پیش‌نویس جدا می‌سازد. متن‌های `TODO:` را جایگزین کنید،
سپس با `blog:add --check` بررسی و با `blog:add` به فهرست مقاله‌ها اضافه کنید.
فقط زبان‌هایی را نگه دارید که متن کاملشان آماده است؛ نیازی به تغییر کامپوننت،
مسیر یا فایل سئو نیست. پیش‌نویس روی سایت نمایش داده نمی‌شود.

### Article fields and optional visuals

The articles adapt the owner's verified LinkedIn posts. Their actual text and
translations are stored in `blog.json`.
The source URL links to the original post. `publishedAt` is the date the adaptation
was added to this blog; it is not a guessed LinkedIn publication date. Only add
`sourcePublishedAt` when an exact original date is known.

Each post has a stable `id`, an HTTPS LinkedIn `sourceUrl`, `publishedAt`, technical
`tags`, an optional existing `projectId` and a `versions` object. Each actual
language version contains `title`, `summary` and `sections`. Sections support
`paragraphs`, `items`, `code` and `callout`, rendered as escaped Vue text. An optional
`codeLabel` (for example `Shell` or `Next.js / TypeScript`) describes a code sample;
omit it on sections without code. Keep
section IDs identical across translations so bookmarks survive language changes.
No HTML, database, Markdown parser or additional runtime dependency is required.

Optional `cover` metadata supplies a locally hosted JPEG `src`, its WebP
`optimizedSrc`, and the original `width`/`height`. Save post artwork under
`public/images/blog/`; retain the original JPEG and generate its WebP with the
existing image-maintenance script. Every actual language version then needs a
`coverAlt` description in that language. Do not hotlink expiring LinkedIn CDN URLs.
The first cover is the original artwork attached to the linked Strapi/ISR post.
When `cover` is omitted, cards, article headers and social metadata reuse the
related project's screenshot through `blogCover`. Do not copy that image into the
blog folder. A localized `coverAlt` can describe the reused image; otherwise its
existing project translation is used. Text-only posts still show their source link.

Sections can include an optional localized `visual`:

- `{ "kind": "project", "projectId": "arvand-termo-tec", "caption": "..." }`
  reuses the screenshot/alt text from `projects.json` without copying image paths.
- `{ "kind": "flow", "title": "...", "steps": [{ "title": "...", "detail": "..." }, { "title": "...", "detail": "..." }], "caption": "..." }`
  renders a numbered architecture flow.
- `{ "kind": "metrics", "title": "...", "items": [{ "value": "...", "label": "..." }, { "value": "...", "label": "..." }], "caption": "..." }`
  renders labeled measurements. Describe their actual test context; do not turn
  local results into production claims or compare unlike measurements.

Keep all visual titles, labels and captions in the article's actual language
version. Validation checks visual shapes, required text and project references;
the content check also requires referenced projects to have screenshots.

The blog interface has all seven site languages. Article URLs, hreflang and the
sitemap contain only the versions supplied in `versions`; there is no detail-page
language fallback. The index may link to an available English or original version
and labels the available languages. Add a translation only when its complete
article text is ready. Published IDs are permanent URLs, so renames need redirects.

Run the normal content/type/localization/build checks after edits. `content:check`
also validates article shape, dates, clean LinkedIn source links, related project
IDs, language availability and shared section anchors. Never add invented posts,
results, publication dates or translations as layout filler.
SSR, localization, RTL and URL selection keep their existing behavior. Article
titles type once, while chapter headings and reading text stay stable. The Home
and blog archive retain their glitch styling. Article images use the shared
`ArticleImage` presentation and the existing zoom/pan viewer, without scanline or
color filters over diagram text.

### Home preview

The Home Blog snap panel uses `blog.json` too, in the same article order as the
blog page. There is no second list to maintain. It displays one article at a time
with Previous/Next and All articles controls. The workbench also provides direct
selection through up to six numbered files; the visible file window follows the
current article as the catalog grows. Titles use `home.json` → `blog`;
interface translations remain in `translations/`. Article links always point to
an actual supplied language version, not a missing translated page.
The artwork also supports horizontal touch swipes and mouse dragging. Swipe
direction follows the interface's LTR/RTL direction; vertical gestures keep their
normal Home section navigation. A tap still opens the selected article.

### Dates

Keep stored dates Gregorian: `YYYY-MM-DD` for an exact day, `YYYY-MM` when only
the month is known, or `YYYY` for a year. Existing résumé periods such as
`Jul 2026 - Present` are supported without rewriting their source data.

The common `CommonLocalizedDate` component follows the selected site language:

```vue
<CommonLocalizedDate value="2026-10-28" />
<CommonLocalizedDate value="Jul 2026 - Present" range />
```

Persian uses the Persian calendar; the other supported languages use localized
Gregorian dates. Partial dates display one label: a month-only value is converted
using its first day (`2026-07` → `تیر ۱۴۰۵`), while a year-only value uses midyear
to select the Persian year covering most of that Gregorian year (`2026` → `۱۴۰۵`).
These are display conventions for incomplete dates. Supply `YYYY-MM-DD` when an
exact conversion is needed. A period such as `Jul 2026 - Present` therefore reads
`تیر ۱۴۰۵ – اکنون`, with one separator between its actual endpoints.
For animated text, use `useLocalizedDate().formatDate(value)` or
`.formatPeriod(period)`. SEO dates and `<time datetime>` stay machine-readable ISO.

The downloadable résumé is a generated PDF, not a live view of the JSON. After
editing résumé information, regenerate and visually inspect it using the existing
`npm run resume:pdf -- --python <python-path>` workflow before publishing it.
