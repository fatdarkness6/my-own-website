import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { portraitImages } from "../app/assets/data/images.ts";
import { projects } from "../app/assets/data/projects.ts";

// Maintenance only: generated images are committed; builds need no Sharp dependency.
// Accept a local Sharp package path, like the other asset-generation scripts.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
const publicRoot = new URL("../public/", import.meta.url);
const originals = new URL("../assets/images/originals/", import.meta.url);
const publicFile = (path: string) => new URL(`.${path}`, publicRoot);
const savings: { image: string; before: number; after: number; saved: string }[] = [];

function report(image: string, before: number, after: number) {
  savings.push({ image, before, after, saved: `${((1 - after / before) * 100).toFixed(1)}%` });
}

async function webp(input: URL, path: string) {
  const source = await readFile(input);
  const encoded: Buffer = await sharp(source)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer();
  const before = await sharp(source).metadata();
  const after = await sharp(encoded).metadata();
  assert.equal(after.format, "webp");
  assert.equal(after.width, before.width, `${path}: width changed`);
  assert.equal(after.height, before.height, `${path}: height changed`);
  // Encoders may omit an entirely opaque alpha channel. Compare its actual
  // pixels instead of requiring the same channel layout in the file header.
  const alphaBefore: Buffer = await sharp(source).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  const alphaAfter: Buffer = await sharp(encoded).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  assert.ok(alphaBefore.equals(alphaAfter), `${path}: transparency changed`);
  assert.ok(encoded.length < source.length, `${path}: no size reduction`);
  await writeFile(publicFile(path), encoded);
  report(path, source.length, encoded.length);
}

for (const path of Object.values(portraitImages)) {
  const filename = path.slice(path.lastIndexOf("/") + 1).replace(/\.webp$/, ".png");
  await webp(new URL(filename, originals), path);
}
for (const { screenshot } of projects) {
  if (screenshot?.optimizedSrc) await webp(publicFile(screenshot.src), screenshot.optimizedSrc);
}

// Keep social previews and browser icons in PNG for compatibility. This step is
// lossless and never replaces a file with a larger one; SVG and ICO stay untouched.
const pngs = [
  "/images/og/portfolio.png", "/apple-touch-icon.png", "/icon-maskable-512x512.png",
  ...[16, 32, 48, 96, 192, 512].map((size) => `/favicon-${size}x${size}.png`),
];
for (const path of pngs) {
  const source = await readFile(publicFile(path));
  const encoded: Buffer = await sharp(source)
    .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  if (encoded.length >= source.length) continue;
  const rawBefore: Buffer = await sharp(source).raw().toBuffer();
  const rawAfter: Buffer = await sharp(encoded).raw().toBuffer();
  assert.ok(rawBefore.equals(rawAfter), `${path}: PNG pixels changed`);
  await writeFile(publicFile(path), encoded);
  report(path, source.length, encoded.length);
}

console.table(savings);
const before = savings.reduce((total, item) => total + item.before, 0);
const after = savings.reduce((total, item) => total + item.after, 0);
console.log(`Optimized image payloads: ${before.toLocaleString()} → ${after.toLocaleString()} bytes (${((1 - after / before) * 100).toFixed(1)}% smaller).`);
