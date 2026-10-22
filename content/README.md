# Edit your portfolio content

This folder is the editable content source. The `.ts` files under
`app/assets/data/` and `i18n/locales/` are adapters, not places to edit copy.
No database, admin account, runtime fetch or new dependency is needed.

## Where to edit

| File | Controls |
| --- | --- |
| `projects.json` | Project records, their order, URLs, screenshots and Home's `featuredIds` |
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
SSR, localization, RTL, typing, glitch animations and URL selection keep their
existing behavior.

The downloadable résumé is a generated PDF, not a live view of the JSON. After
editing résumé information, regenerate and visually inspect it using the existing
`npm run resume:pdf -- --python <python-path>` workflow before publishing it.
