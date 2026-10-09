# Project structure and performance maintenance

## Responsibilities

| Location | Responsibility |
| --- | --- |
| `app/pages/` | Route composition, page metadata and page-level coordination. |
| `app/layouts/` | Shared shells for document scrolling and Home's snap scrolling. |
| `app/components/home/`, `about/`, `projects/`, `resume/`, `contact/` | UI specific to each page, including its backgrounds. |
| `app/components/Common/` | Reusable reveals and page text effects. |
| `app/components/Animation/` | Reusable animation renderers and their local timing/state. |
| `app/composables/` | Vue lifecycle, state and shared browser integrations. |
| `app/utils/` | Pure text, intro-session and screenshot calculations. |
| `app/graphics/` | Shader source. Rendering lifecycles remain with their owning components. |
| `app/assets/data/` | Canonical identity, project, résumé and page content. |
| `i18n/` | Locale catalogs and translation configuration. |
| `app/assets/css/` | Global styles, page styles and extracted component styles. |
| `shared/` | Locale, route and SEO policies shared with server code. |
| `server/` | HTTP middleware and generated SEO endpoints. |
| `public/` | Served portraits, screenshots, sound, icons and résumé. |
| `scripts/` | Asset generation and integration checks. |
| `tests/` | Behavioral regression checks. |

Keep route files focused on composing sections. Reuse existing components and
composables before adding alternatives. Keep canonical content separate from UI;
translate through a single `usePortfolioI18n()` call per component, including its
`content()` helper. Stable existing paths preserve Nuxt component auto-import names.

## Performance cleanup — 2026-10-09

- `useAnimationEnvironment` shares one visibility listener and one reduced-motion
  listener among page glitch text and the About, Contact and Resume backgrounds.
  State is scoped to the Vue application, so SSR requests remain isolated. Browser
  listeners attach on the first mount, detach on the final unmount, and refresh
  preferences on remount. Each animation retains its own triggers and timing.
- `useGlitchText` segments source text once per burst and reuses those graphemes
  through `scrambleCharacters`. `scrambleText` remains available for ordinary string
  callers. Random replacement order, punctuation, marks and joiners are preserved.
- `TypewriterText` prepares each word's graphemes once when its source changes.
  It no longer splits every word again on every render. Character timing, sound,
  completion events, cursor behavior and accent matching are unchanged.
- `SegmentedLine` shares prepared segment characters between scrambling and
  display assembly. Glitch renderers cache text direction until the text changes.
- Pages and sections reuse their existing localization helper rather than creating
  multiple sets of helper functions and computed refs in the same component.

No stylesheet, shader, audio implementation, navigation policy, text content,
animation duration, dependency or responsive breakpoint was changed in this pass.
The new About portrait was already present before this cleanup and is preserved.

## Verification

Run `npm run typecheck`, `node --test tests/*.test.ts`, `npm run test:i18n`, and
`npm run build`. The unit tests include shared-listener cleanup/remount, isolated
SSR state and Arabic/Persian/emoji scrambling, alongside the existing intro,
scrolling, viewport, screenshot and SEO checks.

Validation for this pass: TypeScript and production build passed, together with
43 unit checks, 11 localization checks and production HTTP checks for all 70
localized routes. Browser review covered desktop About, page navigation and
390×844 mobile English Home, Persian Home/About and Arabic Contact. The completed
Home reveal worked, the new About portrait remained in place, and the inspected
pages had no horizontal overflow or captured hydration/console errors.

A local calculation-only benchmark (5,000 frames, 252 mixed Latin/Persian/Arabic
graphemes, median of five rounds) measured 299 ms when resegmenting every frame
and 141 ms when reusing prepared characters. This measures only scrambling CPU
work; it is not a page-load, frame-rate or Core Web Vitals measurement.

The existing WebGL bundle remains large. Changes to rendering quality, image
appearance, animation scheduling or browser audio activation need their own
focused task and device testing. Keep those changes separate from structural
cleanup so regressions can be attributed and reviewed.

References: [Vue computed caching](https://vuejs.org/guide/essentials/computed),
[Vue composable lifecycle cleanup](https://vuejs.org/guide/reusability/composables).
