import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

// Generated assets are committed; sharp is only needed when changing the mark.
// Pass a local sharp package path as the first argument, as with generate-seo-image.ts.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
const output = new URL("../public/", import.meta.url);
const svg = await readFile(new URL("favicon.svg", output), "utf8");
const render = (source: string, size: number) => sharp(Buffer.from(source), { density: 384 })
  .resize(size, size).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();

for (const size of [16, 32, 48, 96, 192, 512]) {
  await writeFile(new URL(`favicon-${size}x${size}.png`, output), await render(svg, size));
}

// iOS supplies its own rounded mask; keep the entire tile opaque.
const opaque = svg.replace("<title>", '<rect width="64" height="64" fill="#050a12"/><title>');
await writeFile(new URL("apple-touch-icon.png", output), await render(opaque, 180));

// Put all identifying artwork inside the central maskable safe-zone circle.
const maskable = svg.replace("<title>", '<rect width="64" height="64" fill="#050a12"/><g transform="translate(10 10) scale(.6875)"><title>')
  .replace("</svg>", "</g></svg>");
await writeFile(new URL("icon-maskable-512x512.png", output), await render(maskable, 512));

// Multi-resolution ICO: Windows/browser consumers choose their nearest size.
const sizes = [16, 32, 48, 256];
const images = await Promise.all(sizes.map((size) => render(svg, size)));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image: Buffer, index: number) => {
  const entry = 6 + index * 16;
  directory[entry] = directory[entry + 1] = sizes[index]! % 256;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL("favicon.ico", output), Buffer.concat([directory, ...images]));
console.log("Generated favicon PNGs, multi-size ICO, Apple touch icon and maskable icon from public/favicon.svg");
