import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { SITE_URL, SITE_LOCALES, SITE_ROUTES, buildRobots, buildSitemap, indexingAllowed, localizedPath, serializeJsonLd, siteOrigin } from "../shared/seo.ts";

test("canonical origins ignore paths, queries and fragments; reject unsafe schemes", () => {
  assert.equal(siteOrigin(`${SITE_URL}/about?utm_source=test#bio`), SITE_URL);
  assert.throws(() => siteOrigin("javascript:alert(1)"));
  assert.throws(() => siteOrigin("https://user:password@example.com"));
});

test("all 35 localized pages have unique URLs and reciprocal sitemap alternates", () => {
  const xml = buildSitemap(SITE_URL);
  const entries = [...xml.matchAll(/<url>(.*?)<\/url>/g)].map((match) => match[1]!);
  assert.equal(entries.length, 35);
  const locations = entries.map((entry) => entry.match(/<loc>(.*?)<\/loc>/)![1]);
  assert.equal(new Set(locations).size, 35);
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

test("production robots advertises the sitemap; previews are excluded", () => {
  assert.match(buildRobots(SITE_URL, true), /Allow: \/\nSitemap: https:\/\/arsamsarkhosh.vercel.app\/sitemap.xml/);
  assert.equal(buildRobots(SITE_URL, false), "User-agent: *\nDisallow: /\n");
  for (const value of [false, "false"]) assert.equal(indexingAllowed(value), false);
  for (const value of [true, "true"]) assert.equal(indexingAllowed(value), true);
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
  assert.ok(loader.includes("window.setTimeout(triggerBurst"));
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
