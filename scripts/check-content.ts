import { readFile, access } from "node:fs/promises";
import { createJiti } from "jiti";
import { validateProjectContent } from "../shared/validateProjectContent.ts";
import { validateBlogContent } from "../shared/validateBlogContent.ts";
import { translationKey } from "../app/utils/translationKey.ts";
// Allow report output to be piped to tools such as head/Select-Object -First.
process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  else throw error;
});
const root = new URL("../", import.meta.url);
const read = async (file: string) => JSON.parse(await readFile(new URL(file, root), "utf8"));
const errors: string[] = [];
const json = await read("content/projects.json");
errors.push(...validateProjectContent(json));
// Do not import application adapters until the raw JSON has passed validation.
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const blog = await read("content/blog.json");
errors.push(...validateBlogContent(blog, json.items.map((item: { id: string }) => item.id)));
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const resume = await read("content/resume.json");
const profile = await read("content/profile.json");
const aboutPage = await read("content/about-page.json");
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
for (const key of ["name", "givenName", "familyName", "role", "summary"]) if (!text(profile[key])) errors.push(`profile.json: ${key} must be a non-empty string.`);
if (!text(profile.contact?.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contact.email)) errors.push("profile.json: contact.email must be a valid public email address.");
for (const key of ["github", "linkedin"]) {
  try { if (new URL(profile.contact?.[key]).protocol !== "https:") throw new Error(); }
  catch { errors.push(`profile.json: contact.${key} must be an absolute HTTPS URL.`); }
}
for (const key of ["experience", "focus", "extraProjects"]) if (!Array.isArray(resume[key])) errors.push(`resume.json: ${key} must be an array.`);
if (!Array.isArray(aboutPage.systems)) errors.push("about-page.json: systems must be an array.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
for (const [index, record] of resume.experience.entries()) {
  if (!record || typeof record !== "object") { errors.push(`resume.json: experience[${index}] must be an object.`); continue; }
  for (const key of ["id", "company", "role", "location", "period", "employmentType", "summary"]) if (!text(record[key])) errors.push(`resume.json: experience[${index}].${key} must be a non-empty string.`);
  for (const key of ["bullets", "stack"]) if (!Array.isArray(record[key]) || !record[key].length || !record[key].every(text)) errors.push(`resume.json: experience[${index}].${key} must contain non-empty strings.`);
}
const ids = new Set(json.items.map((item: { id: string }) => item.id));
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const jiti = createJiti(import.meta.url);
const { english } = await jiti.import<{ english: Record<string, string> }>("../i18n/english.ts");
const { resumeExperience, resumeFocus } = await jiti.import<{ resumeExperience: { id: string; projectId?: string }[]; resumeFocus: { projects: string[] }[] }>("../app/assets/data/resume.ts");
const experienceIds = resumeExperience.map(({ id }) => id);
if (new Set(experienceIds).size !== experienceIds.length) errors.push("resume.json: experience IDs must be unique.");
for (const record of resumeExperience) if (record.projectId && !ids.has(record.projectId)) errors.push(`resume.json: ${record.id} links to unknown project ${record.projectId}.`);
for (const filter of resumeFocus) {
  if (!filter || !Array.isArray(filter.projects)) { errors.push("resume.json: each focus needs a projects array."); continue; }
  for (const id of filter.projects) if (!ids.has(id)) errors.push(`resume.json: focus references unknown project ${id}.`);
}
for (const record of aboutPage.systems) if (!ids.has(record.id)) errors.push(`about-page.json: systems references unknown project ${record.id}.`);
for (const record of resume.extraProjects) if (ids.has(record.id)) errors.push(`resume.json: extraProjects duplicates portfolio project ${record.id}; it is already derived from projects.json.`);
for (const project of json.items) for (const src of [project.screenshot?.src, project.screenshot?.optimizedSrc].filter(Boolean)) {
  if (src.includes("..") || src.includes("\\")) { errors.push(`projects.json: unsafe image path ${src}.`); continue; }
  try { await access(new URL(`public${src}`, root)); } catch { errors.push(`projects.json: missing image public${src}.`); }
}
for (const post of blog.posts) for (const src of [post.cover?.src, post.cover?.optimizedSrc].filter(Boolean)) {
  try { await access(new URL(`public${src}`, root)); } catch { errors.push(`blog.json: missing cover image public${src}.`); }
}
for (const post of blog.posts) for (const version of Object.values(post.versions) as { sections: { visual?: { kind: string; projectId?: string } }[] }[]) {
  for (const section of version.sections) if (section.visual?.kind === "project" && !json.items.find((item: { id: string }) => item.id === section.visual!.projectId)?.screenshot)
    errors.push(`blog.json: visual references project ${section.visual.projectId} without a screenshot.`);
}
for (const file of ["profile", "images", "home", "about", "about-page", "contact", "seo", "resume", "interface"]) await read(`content/${file}.json`);
const codes = ["en", "es", "de", "fr", "it", "ar", "fa"];
const required = Object.entries(english).filter(([key, source]) => source !== "API" && (key.startsWith("seo") || key.startsWith("blog") || key.startsWith("projectPreview") || /^projects\.[^.]+\.(role|statusLabel|summary|description|availability|headline|ownership|note|contributions\.\d+|layers\.\d+\.(label|title))$/.test(key) || /^resumeExperience\.[^.]+\.(role|location|period|employmentType|workMode|summary|bullets\.\d+)$/.test(key)));
for (const code of codes) {
  const copy = await read(`content/translations/${code}.json`);
  for (const [key, value] of Object.entries(copy)) {
    if (!(key in english)) errors.push(`${code}.json: unknown translation key ${key}; remove it if the content was deleted.`);
    if (typeof value !== "string" || !value.trim()) errors.push(`${code}.json: ${key} must be a non-empty string.`);
  }
  // Shared source text can reuse another key's translation, just like the app.
  const translated = new Set(Object.keys(copy).map((key) => translationKey(english[key] || "")));
  if (code !== "en") for (const [key, source] of required) if (!translated.has(translationKey(source))) errors.push(`${code}.json: missing translation ${key}.`);
  if (code !== "en" && process.argv.includes("--report-translations")) {
    const missing = Object.entries(english).filter(([key, source]) => !translated.has(translationKey(source)) && !/\.(id|name|year|stack\.\d+)$/.test(key));
    console.log(`\n${code}: ${missing.length} keys using source-language fallback (includes technical terms).`);
    for (const [key, source] of missing) console.log(`  ${JSON.stringify(key)}: ${JSON.stringify(source)}`);
  }
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`PASS editable content: ${json.items.length} projects, ${json.featuredIds.length} featured projects, ${blog.posts.length} blog posts, ${resumeExperience.length} experiences and ${codes.length} locales.`);
