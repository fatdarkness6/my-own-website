# Arsam Sarkhosh — portfolio

A Nuxt 4 / Vue 3 portfolio with Quasar, snap-scrolling homepage sections,
typed text, WebGL backgrounds, a Three.js portrait, and shared audio.

## Development

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

## Code organization

| Location | Responsibility |
| --- | --- |
| `app/pages/` | Route entry points; `index.vue` composes the homepage sections. |
| `app/layouts/` | Shared page shells for normal and snap-scrolling pages. |
| `app/components/home/` | Homepage sections; `details/` contains supporting cards. |
| `app/components/Animation/` | Animation components, their props, and lifecycle wiring. |
| `app/components/Common/` | Reusable presentation components such as `HackerReveal`. |
| `app/composables/` | Shared typing, text scrambling, scroll state, and audio behavior. |
| `app/graphics/` | Shader sources, separate from Vue lifecycle and rendering code. |
| `app/assets/css/` | Global styles and component styles, grouped by feature. |
| `app/assets/data/` | Editable homepage headings and project content. |
| `app/plugins/` | Client-wide scrolling and button-sound integrations. |
| `public/` | Images and sounds addressed by public URL. |

## Where to make changes

- Headings and accent segments: `app/assets/data/homeCopy.ts`.
- Translations, RTL and localized routes: see [i18n/README.md](i18n/README.md).
- Project cards: `app/assets/data/projects.ts`.
- About-page story, principles, and toolkit: `app/assets/data/about.ts`.
- About-page sections: `app/components/about/`; styling: `app/assets/css/pages/about.css`.
- Global typography: `app/assets/css/main.css` and `fonts.css`.
- Button geometry and fallback hover: `app/assets/css/components/buttons.css`.
- Header and music-control appearance: their styles in `app/assets/css/components/`.
- Background scenes and portrait shaders: `app/graphics/`.

## Behavior boundaries

- `useGlitchText` owns the shared scrambling renderer. `GlitchText` owns hover/focus
  triggers; `GlitchTextTimer` owns recurring scheduling. Their style pools and
  duration ranges intentionally differ.
- Shared glitch CSS stays scoped at each component import. Keep scoped and global
  styles separate: the header menu and music panel use global styles for teleported
  Quasar content.
- `useTypingSequence` controls ordering and completion per client visit. A full
  reload begins a fresh visit. `TypewriterText` owns a single pending typing timeout.
- The loading-screen gesture unlocks music and typing audio. Keep audio unlock/play
  calls inside that gesture; their ordering matters on mobile browsers.
- `ScrollContainer` owns homepage snap navigation. Background transitions and
  section typing visibility follow its shared state.
- The default layout enables document scrolling for long pages. About chapters
  reveal on first viewport entry and reuse the existing typing sequence behavior.
- Components release timers, observers, and render loops on unmount. Client plugins
  also release their listeners and loops during hot replacement.

When refactoring, preserve component props, template structure, CSS scope, animation
timing, and audio gesture ordering. Run the production build after changes; use a
real mobile browser when changing touch, audio, or loading-screen behavior.
