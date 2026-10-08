import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { SITE_URL, SITE_LOCALES, SITE_ROUTES, buildRobots, buildSitemap, canonicalUrl, indexingAllowed, localizedPath, serializeJsonLd, siteOrigin } from "../shared/seo.ts";
import { projects } from "../app/assets/data/projects.ts";
import { projectPath } from "../shared/projectRoutes.ts";

test("canonical origins ignore paths, queries and fragments; reject unsafe schemes", () => {
  assert.equal(siteOrigin(`${SITE_URL}/about?utm_source=test#bio`), SITE_URL);
  assert.throws(() => siteOrigin("javascript:alert(1)"));
  assert.throws(() => siteOrigin("https://user:password@example.com"));
});

test("production domain aliases and stale deployment settings resolve to the new HTTPS origin", () => {
  assert.equal(SITE_URL, "https://arsamsarkhosh.ir");
  for (const origin of [
    "https://arsamsarkhosh.vercel.app", "https://arsamsarkhosh.ir",
    "http://www.arsamsarkhosh.ir", "https://ARSAMSARKHOSH.IR/about?ref=old#profile",
  ]) assert.equal(siteOrigin(origin), SITE_URL);
  assert.equal(siteOrigin("http://localhost:3000"), SITE_URL);
  assert.equal(siteOrigin("https://another-portfolio.example"), SITE_URL);
  assert.equal(canonicalUrl("http://localhost:3000/fa/about/?ref=test#profile"), `${SITE_URL}/fa/about`);
  assert.equal(canonicalUrl("/"), `${SITE_URL}/`);
  const sitemap = buildSitemap("https://arsamsarkhosh.vercel.app");
  assert.ok(!sitemap.includes("vercel.app"));
  assert.ok(sitemap.includes(`<loc>${SITE_URL}/fa</loc>`));
});

test("domain redirect configuration targets only the old production hosts and keeps page paths", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const matching = (hostname: string) => config.redirects.filter((rule: { has: { type: string; value: string }[] }) =>
    rule.has.some((condition) => condition.type === "host" && new RegExp(`^(?:${condition.value})$`).test(hostname)));
  for (const hostname of ["arsamsarkhosh.vercel.app"]) {
    const rules = matching(hostname);
    assert.equal(rules.length, 1);
    assert.equal(rules[0].source, "/:path*");
    assert.equal(rules[0].destination, `${SITE_URL}/:path*`);
    assert.equal(rules[0].permanent, true);
  }
  // Vercel's dashboard must switch the primary domain before adding a www redirect.
  for (const hostname of ["arsamsarkhosh.ir", "www.arsamsarkhosh.ir", "localhost", "my-own-website-git-test.vercel.app", "arsamsarkhoshXvercelXapp"])
    assert.equal(matching(hostname).length, 0, hostname);
});

test("all 70 localized pages have unique URLs and reciprocal sitemap alternates", () => {
  const xml = buildSitemap(SITE_URL);
  const entries = [...xml.matchAll(/<url>(.*?)<\/url>/g)].map((match) => match[1]!);
  assert.equal(entries.length, 70);
  const locations = entries.map((entry) => entry.match(/<loc>(.*?)<\/loc>/)![1]);
  assert.equal(new Set(locations).size, 70);
  for (const path of SITE_ROUTES) for (const locale of SITE_LOCALES) {
    const location = `${SITE_URL}${localizedPath(path, locale)}`;
    const entry = entries.find((value) => value.includes(`<loc>${location}</loc>`))!;
    assert.ok(entry, location);
    for (const language of SITE_LOCALES) {
      assert.ok(entry.includes(`hreflang="${language}" href="${SITE_URL}${localizedPath(path, language)}"`));
    }
    assert.ok(entry.includes(`hreflang="x-default" href="${SITE_URL}${path}"`));
  }
  assert.ok(!xml.includes("lastmod"));
  assert.ok(locations.every((location) => !location?.includes("?")));
});

test("the sitemap route inventory stays synchronized with actual page files", async () => {
  const files = await readdir(new URL("../app/pages/", import.meta.url), { recursive: true });
  const routes = files.filter((file) => file.endsWith(".vue") && !file.includes("["))
    .map((file) => `/${file.replace(/\\/g, "/").replace(/\.vue$/, "")}`.replace(/\/index$/, "") || "/");
  assert.deepEqual([...SITE_ROUTES].sort(), [...routes, ...projects.map(({ id }) => projectPath(id))].sort());
});

test("production robots advertises the sitemap; previews are excluded", () => {
  assert.equal(buildRobots(SITE_URL, true), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  assert.equal(buildRobots(SITE_URL, false), "User-agent: *\nDisallow: /\n");
  for (const value of [false, "false"]) assert.equal(indexingAllowed(value), false);
  for (const value of [true, "true"]) assert.equal(indexingAllowed(value), true);
});

test("image sitemap associates only real screenshots with their localized project pages", () => {
  const xml = buildSitemap(SITE_URL);
  assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
  for (const locale of SITE_LOCALES) for (const project of projects) {
    const url = `${SITE_URL}${localizedPath(projectPath(project.id), locale)}`;
    const entry = [...xml.matchAll(/<url>(.*?)<\/url>/g)].find((match) => match[1]!.includes(`<loc>${url}</loc>`))![1]!;
    const images = [...entry.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((match) => match[1]);
    assert.deepEqual(images, project.screenshot ? [`${SITE_URL}${project.screenshot.src}`] : []);
  }
});

test("favicon package contains valid PNG sizes and a complete multi-resolution ICO", async () => {
  const readAsset = (file: string) => readFile(new URL(`../public/${file}`, import.meta.url));
  for (const [file, size] of [
    ...[16, 32, 48, 96, 192, 512].map((size) => [`favicon-${size}x${size}.png`, size] as const),
    ["apple-touch-icon.png", 180], ["icon-maskable-512x512.png", 512],
  ] as [string, number][]) {
    const png = await readAsset(file);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", file);
    assert.equal(png.readUInt32BE(16), size, file);
    assert.equal(png.readUInt32BE(20), size, file);
  }
  const ico = await readAsset("favicon.ico");
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 4);
  for (const [index, size] of [16, 32, 48, 256].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry] || 256, size);
    assert.equal(ico[entry + 1] || 256, size);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset + length <= ico.length);
    assert.equal(ico.subarray(offset, offset + 8).toString("hex"), "89504e470d0a1a0a");
  }
});

test("JSON-LD cannot close its script tag or inject HTML", () => {
  const data = { name: "</script><script>alert(1)</script>", text: "<>&\u2028\u2029" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});

test("initial HTML includes typed copy and reveals without bot-specific markup", async () => {
  const typed = await readFile(new URL("../app/components/Animation/TypedLine.vue", import.meta.url), "utf8");
  assert.ok(typed.includes('v-else-if="done || !mounted"'));
  const loader = await readFile(new URL("../app/components/LoadingScreen.vue", import.meta.url), "utf8");
  assert.ok(loader.includes('emit("entered", { audioActivated: audioActivated.value })'));
  const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");
  assert.ok(app.includes("if (!audioActivated)"));
  assert.ok(app.includes("noscript:"));
  assert.ok(!app.includes("Googlebot"));
});

test("the first gesture unlocks audio without double-toggling explicit playback", async () => {
  const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");
  const audio = await readFile(new URL("../app/composables/useEntryAudio.ts", import.meta.url), "utf8");
  const control = await readFile(new URL("../app/components/AppMusicControl.vue", import.meta.url), "utf8");
  assert.ok(app.includes('event.target.closest("[data-audio-toggle]")'));
  assert.ok(app.includes("activateAudio({ autoplayMusic: !handlesPlayback })"));
  assert.ok(audio.includes("activation.autoplayMusic !== false && options.autoplayMusic !== false"));
  assert.equal(control.match(/data-audio-toggle/g)?.length, 2);
});
