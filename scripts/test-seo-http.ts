import assert from "node:assert/strict";
import { SITE_URL, SITE_ROUTES, SITE_LOCALES, SOCIAL_IMAGE, localizedPath } from "../shared/seo.ts";
import { projects } from "../app/assets/data/projects.ts";
import { projectPath } from "../shared/projectRoutes.ts";

const origin = process.argv[2] || "http://127.0.0.1:3001";
const preview = process.argv.includes("--preview");
const attributes = (html: string, tag: string) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "g"))].map(([element]) =>
  Object.fromEntries([...element.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key!, value!])),
);
const pageTitles = new Map<string, Set<string>>();
for (const language of SITE_LOCALES) for (const path of SITE_ROUTES) {
  const project = projects.find((record) => projectPath(record.id) === path);
  const route = localizedPath(path, language);
  const response = await fetch(`${origin}${route}`);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  const expectedUrl = `${SITE_URL}${route}`;
  const links = attributes(html, "link");
  const canonical = links.filter((link) => link.rel === "canonical");
  assert.equal(canonical.length, 1, `${route}: canonical count`);
  assert.equal(canonical[0]!.href, expectedUrl);
  const alternates = links.filter((link) => link.rel === "alternate" && link.hreflang);
  assert.equal(alternates.length, 8, `${route}: language alternates`);
  for (const locale of SITE_LOCALES) assert.ok(alternates.some((link) => link.hreflang === locale && link.href === `${SITE_URL}${localizedPath(path, locale)}`));
  const metadata = attributes(html, "meta");
  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    assert.equal(metadata.filter((meta) => meta.property === property).length, 1, `${route}: ${property}`);
  }
  // A bare origin and its trailing-slash root represent the same HTTP URL.
  assert.equal(new URL(metadata.find((meta) => meta.property === "og:url")!.content!).href, expectedUrl);
  assert.equal(metadata.find((meta) => meta.property === "og:image")?.content, `${SITE_URL}${project?.screenshot?.src || SOCIAL_IMAGE}`);
  assert.equal(metadata.find((meta) => meta.name === "google-site-verification")?.content, "QqxjGlyiagYJJ7OqLt3hdM-CxlPSf5QQx5VQJI3kl8E");
  assert.equal(metadata.find((meta) => meta.name === "twitter:card")?.content, "summary_large_image");
  assert.ok(metadata.find((meta) => meta.name === "description")?.content);
  const robots = metadata.find((meta) => meta.name === "robots")?.content;
  assert.ok(robots?.startsWith(preview ? "noindex" : "index"), `${route}: robots`);
  if (preview) assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.ok(html.includes(`lang="${language}"`));
  assert.ok(html.includes(`dir="${["fa", "ar"].includes(language) ? "rtl" : "ltr"}"`));
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${route}: one primary heading`);
  assert.ok(/<main\b[^>]*id="main-content"/.test(html), `${route}: main landmark`);
  const title = html.match(/<title>(.*?)<\/title>/)![1]!;
  const titles = pageTitles.get(language) || new Set<string>();
  assert.ok(!titles.has(title), `${route}: duplicated page title`);
  titles.add(title); pageTitles.set(language, titles);
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  assert.equal(scripts.length, 1, `${route}: JSON-LD count`);
  const graph = JSON.parse(scripts[0]![1]!)["@graph"];
  assert.ok(graph.some((entry: { "@type": string; name: string }) => entry["@type"] === "Person" && entry.name === "Arsam Sarkhosh"));
  assert.ok(graph.some((entry: { "@id": string }) => entry["@id"] === `${expectedUrl}#webpage`));
  if (project) {
    const record = graph.find((entry: { "@id": string }) => entry["@id"] === `${expectedUrl}#project`);
    assert.ok(record, `${route}: project entity`);
    assert.equal(record.creator["@id"], `${SITE_URL}/#person`);
    assert.ok(graph.some((entry: { "@type": string }) => entry["@type"] === "BreadcrumbList"));
    const content = html.replace(/<script\b[^>]*>.*?<\/script>/gs, "");
    assert.ok(content.includes(project.name), `${route}: rendered project name`);
    assert.ok(content.includes('q-expansion-item--expanded'), `${route}: visible technical details`);
  }
  if (path === "/projects") {
    const anchors = attributes(html, "a");
    for (const record of projects) assert.ok(anchors.some((anchor) =>
      anchor.href === localizedPath(projectPath(record.id), language)), `${route}: crawlable ${record.id} link`);
  }
  console.log(`PASS ${route}`);
}
const robots = await (await fetch(`${origin}/robots.txt`)).text();
assert.ok(robots.includes(preview ? "Disallow: /" : `${SITE_URL}/sitemap.xml`));
const sitemap = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemap.status, preview ? 404 : 200);
if (!preview) assert.equal([...(await sitemap.text()).matchAll(/<loc>/g)].length, SITE_ROUTES.length * SITE_LOCALES.length);
const unknown = await fetch(`${origin}/this-page-does-not-exist`);
assert.equal(unknown.status, 404);
for (const locale of SITE_LOCALES) {
  const legacy = await fetch(`${origin}${localizedPath("/projects", locale)}?project=docintel&utm_source=test`, { redirect: "manual" });
  assert.equal(legacy.status, 301, `${locale}: legacy project redirect`);
  assert.equal(legacy.headers.get("location"), localizedPath("/projects/docintel", locale));
  const missing = await fetch(`${origin}${localizedPath("/projects/not-a-real-project", locale)}`);
  assert.equal(missing.status, 404, `${locale}: unknown project`);
}
const queryHtml = await (await fetch(`${origin}/projects/docintel?utm_source=test`)).text();
assert.equal(attributes(queryHtml, "link").find((link) => link.rel === "canonical")?.href, `${SITE_URL}/projects/docintel`);
const image = await fetch(`${origin}${SOCIAL_IMAGE}`);
assert.equal(image.status, 200);
assert.ok(image.headers.get("content-type")?.includes("image/png"));
console.log(`PASS ${preview ? "preview" : "production"} SEO across ${SITE_ROUTES.length * SITE_LOCALES.length} routes, project links, redirects, verification, sitemap, robots, 404s and social image`);
