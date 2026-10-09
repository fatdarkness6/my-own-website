# Image assets

The interface uses quality-90 WebP images at their original dimensions. Cropping,
transparency, RTL portrait selection and screenshot zoom behavior are unchanged.

- Portrait source PNGs: `assets/images/originals/` (not publicly served).
- Portrait public URLs: `app/assets/data/images.ts`.
- Project screenshots: JPEG `src` for social previews; WebP `optimizedSrc` for
  Home cards, project previews and the enlarged viewer. Both live in `public/images/projects/`.
- Social cards and browser icons remain PNG; compression is lossless.
- Old portrait PNG URLs redirect to their WebP replacements.

To replace a portrait, update its source PNG and regenerate. For a project, update
its JPEG and regenerate. Do not use an already-compressed WebP as the source.

```sh
npm run images:optimize -- /absolute/path/to/sharp
```

The optional argument locates an installed Sharp package. Without it the script
uses `sharp` from the local environment, like `generate-icons.ts` and
`generate-seo-image.ts`. Sharp is only needed for asset maintenance, not deployment.
The script verifies dimensions/transparency, rejects larger WebP outputs and checks
that PNG compression preserves every decoded pixel. Generated assets are committed.
