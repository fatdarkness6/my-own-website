import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// PNG is served directly: social crawlers need neither JavaScript nor SVG support.
// Pass a local sharp package path when using a bundled runtime, or install sharp
// locally for maintenance. It is not needed by the website or its builds.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
const input = fileURLToPath(new URL("../assets/seo/social-card.svg", import.meta.url));
const directory = fileURLToPath(new URL("../public/images/og/", import.meta.url));
await mkdir(directory, { recursive: true });
await sharp(input).png().toFile(`${directory}/portfolio.png`);
console.log("Generated public/images/og/portfolio.png (1200 × 630)");
