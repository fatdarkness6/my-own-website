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
  assert.ok(links.some((link) => link.rel === "icon" && link.href === "/favicon-96x96.png" && link.sizes === "96x96"), `${route}: crawlable PNG favicon`);
  assert.ok(links.some((link) => link.rel === "icon" && link.href === "/favicon.svg"), `${route}: vector favicon`);
  assert.ok(links.some((link) => link.rel === "apple-touch-icon" && link.href === "/apple-touch-icon.png"), `${route}: iOS icon`);
  assert.ok(links.some((link) => link.rel === "manifest" && link.href === "/site.webmanifest"), `${route}: manifest`);
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
  assert.equal(metadata.find((meta) => meta.property === "og:image:type")?.content, project?.screenshot?.mimeType || "image/png");
  assert.equal(metadata.find((meta) => meta.property === "og:image:width")?.content, String(project?.screenshot?.width || 1200));
  assert.equal(metadata.find((meta) => meta.property === "og:image:height")?.content, String(project?.screenshot?.height || 630));
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
  assert.ok(!JSON.stringify(graph).includes("arsamsarkhosh.vercel.app"), `${route}: old domain in structured data`);
  assert.equal(graph.find((entry: { "@type": string }) => entry["@type"] === "WebSite")?.url, `${SITE_URL}/`);
  assert.equal(graph.find((entry: { "@type": string }) => entry["@type"] === "Person")?.url, `${SITE_URL}/`);
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
if (!preview) {
  const xml = await sitemap.text();
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, SITE_ROUTES.length * SITE_LOCALES.length);
  assert.ok(!xml.includes("arsamsarkhosh.vercel.app"));
  for (const language of SITE_LOCALES) for (const path of SITE_ROUTES)
    assert.ok(locations.includes(`${SITE_URL}${localizedPath(path, language)}`));
  for (const [, href] of xml.matchAll(/href="([^"]+)"/g)) assert.equal(new URL(href!).origin, SITE_URL);
  const imageUrls = new Set([...xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((match) => match[1]!));
  assert.equal(imageUrls.size, projects.filter((project) => project.screenshot).length);
  for (const url of imageUrls) {
    assert.equal(new URL(url).origin, SITE_URL);
    const response = await fetch(`${origin}${new URL(url).pathname}`);
    assert.equal(response.status, 200, `sitemap image: ${url}`);
    assert.ok(response.headers.get("content-type")?.startsWith("image/"));
    const record = projects.find((project) => project.screenshot?.src === new URL(url).pathname)!;
    assert.ok(response.headers.get("content-type")?.startsWith(record.screenshot!.mimeType!));
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff", `${url}: actual JPEG content`);
    const legacy = await fetch(`${origin}${new URL(url).pathname.replace(/\.jpg$/, ".png")}`, { redirect: "manual" });
    assert.equal(legacy.status, 301, `${url}: legacy image redirect`);
    assert.equal(legacy.headers.get("location"), new URL(url).pathname);
  }
}
const manifestResponse = await fetch(`${origin}/site.webmanifest`);
assert.equal(manifestResponse.status, 200);
const manifest = await manifestResponse.json();
assert.equal(manifest.name, "Arsam Sarkhosh");
for (const file of ["/favicon.ico", "/favicon.svg", "/favicon-96x96.png", "/apple-touch-icon.png", ...manifest.icons.map((icon: { src: string }) => icon.src)]) {
  const response = await fetch(`${origin}${file}`);
  assert.equal(response.status, 200, `icon: ${file}`);
  assert.ok(response.headers.get("content-type")?.startsWith("image/"), `icon content type: ${file}`);
}
const unknown = await fetch(`${origin}/this-page-does-not-exist`);
assert.equal(unknown.status, 404);
for (const locale of SITE_LOCALES) {
  const selected = await fetch(`${origin}${localizedPath("/projects", locale)}?project=docintel&utm_source=test`, { redirect: "manual" });
  assert.equal(selected.status, 200, `${locale}: query selection without redirect`);
  const selectedHtml = await selected.text();
  assert.ok(/<div[^>]*id="project-file"[^>]*aria-label="[^"]*DOCINTEL/.test(selectedHtml), `${locale}: selected query project`);
  assert.equal(attributes(selectedHtml, "link").find((link) => link.rel === "canonical")?.href, `${SITE_URL}${localizedPath("/projects", locale)}`);
  const switched = await fetch(`${origin}${localizedPath("/projects/arilvo", locale)}?project=docintel&utm_source=test`, { redirect: "manual" });
  assert.equal(switched.status, 200, `${locale}: detail query selection`);
  const switchedHtml = await switched.text();
  const switchedLinks = attributes(switchedHtml, "link");
  const selectedUrl = `${SITE_URL}${localizedPath("/projects/docintel", locale)}`;
  assert.equal(switchedLinks.find((link) => link.rel === "canonical")?.href, selectedUrl);
  assert.equal(attributes(switchedHtml, "meta").find((meta) => meta.property === "og:url")?.content, selectedUrl);
  const selectedGraph = JSON.parse(switchedHtml.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)![1]!)["@graph"];
  assert.ok(selectedGraph.some((entry: { "@id": string; name: string }) => entry["@id"] === `${selectedUrl}#project` && entry.name === "DOCINTEL"));
  for (const language of SITE_LOCALES) assert.ok(switchedLinks.some((link) => link.hreflang === language && link.href === `${SITE_URL}${localizedPath("/projects/docintel", language)}`), `${locale}: selected project alternate ${language}`);
  const missing = await fetch(`${origin}${localizedPath("/projects/not-a-real-project", locale)}`);
  assert.equal(missing.status, 404, `${locale}: unknown project`);
}
for (const query of ["project=unknown", "project=", "project=arilvo&project=docintel"]) {
  const response = await fetch(`${origin}/projects?${query}`, { redirect: "manual" });
  assert.equal(response.status, 200, `${query}: invalid query stays usable`);
  const html = await response.text();
  assert.ok(/<div[^>]*id="project-file"[^>]*aria-label="[^"]*ARILVO/.test(html), `${query}: safe default selection`);
}
const queryHtml = await (await fetch(`${origin}/projects/docintel?utm_source=test`)).text();
assert.equal(attributes(queryHtml, "link").find((link) => link.rel === "canonical")?.href, `${SITE_URL}/projects/docintel`);
const image = await fetch(`${origin}${SOCIAL_IMAGE}`);
assert.equal(image.status, 200);
assert.ok(image.headers.get("content-type")?.includes("image/png"));
console.log(`PASS ${preview ? "preview" : "production"} SEO across ${SITE_ROUTES.length * SITE_LOCALES.length} routes, project links, query selections, verification, sitemap, robots, 404s and social image`);
