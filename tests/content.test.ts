import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import source from "../content/projects.json" with { type: "json" };
import template from "../content/templates/project.json" with { type: "json" };
import resume from "../content/resume.json" with { type: "json" };
import profile from "../content/profile.json" with { type: "json" };
import { projects, featuredProjects } from "../app/assets/data/projects.ts";
import { resumeExperience, resumeProfile, resumeProjects } from "../app/assets/data/resume.ts";
import { identity } from "../app/assets/data/identity.ts";
import { contactDetails } from "../app/assets/data/contact.ts";
import { validateProjectContent } from "../shared/validateProjectContent.ts";

test("JSON is the shared source of project records and explicit Home selection", () => {
  assert.deepEqual(projects, source.items);
  assert.deepEqual(featuredProjects.map(({ id }) => id), source.featuredIds);
  for (const project of featuredProjects) assert.strictEqual(project, projects.find(({ id }) => id === project.id));
  assert.deepEqual(validateProjectContent(source), []);
});

test("the copyable project template is structurally valid", () => {
  assert.deepEqual(validateProjectContent({ items: [template], featuredIds: [template.id] }), []);
});

test("authoring validation rejects duplicate IDs and broken featured references", () => {
  const copy = structuredClone(source);
  copy.items.push(copy.items[0]!);
  copy.featuredIds.push("missing-project");
  copy.featuredIds.push(copy.featuredIds[0]!);
  const errors = validateProjectContent(copy).join("\n");
  assert.match(errors, /duplicates arilvo/);
  assert.match(errors, /unknown project missing-project/);
  assert.match(errors, /must not contain duplicates/);
});

test("authoring validation rejects invalid shapes, categories, links and misleading live status", () => {
  const copy: any = { items: [structuredClone(template)], featuredIds: [template.id] };
  Object.assign(copy.items[0], { category: "unknown", repo: "javascript:alert(1)", status: "live", contributions: "not an array", contributionOnly: "false", typo: "ignored?" });
  const errors = validateProjectContent(copy).join("\n");
  for (const pattern of [/category must/, /absolute HTTP/, /live project needs/, /contributions must/, /contributionOnly must/, /unknown field/]) assert.match(errors, pattern);
  assert.ok(validateProjectContent(null).length);
  assert.ok(validateProjectContent({ items: [] }).length);
});

test("optional project media and strings must be valid when provided", () => {
  const copy: any = { items: [structuredClone(template)], featuredIds: [template.id] };
  copy.items[0].availability = "";
  copy.items[0].screenshot = { src: "/images/example.jpg", alt: "Example", width: -1, mimeType: "text/html" };
  const errors = validateProjectContent(copy).join("\n");
  assert.match(errors, /omit unused fields/);
  assert.match(errors, /positive integer/);
  assert.match(errors, /mimeType/);
});

test("identity/contact and résumé records are derived without duplicated project data", () => {
  assert.equal(identity.name, profile.name);
  assert.equal(resumeProfile.name, identity.name);
  assert.equal(resumeProfile.role, identity.role);
  assert.strictEqual(contactDetails, identity.contact);
  assert.deepEqual(resumeExperience, resume.experience);
  assert.equal(resumeProjects.length, projects.length + resume.extraProjects.length);
  for (const project of projects) assert.equal(resumeProjects.find(({ id }) => id === project.id)?.projectId, project.id);
  assert.ok(!resume.extraProjects.some(({ id }) => projects.some((project) => project.id === id)));
});

test("locale adapters expose the editable JSON dictionaries without modification", async () => {
  for (const code of ["en", "es", "de", "fr", "it", "ar", "fa"]) {
    const adapter = await readFile(new URL(`../i18n/locales/${code}.ts`, import.meta.url), "utf8");
    assert.ok(adapter.includes(`../../content/translations/${code}.json`));
    assert.ok(adapter.includes("export const translations: Record<string, string> = data"));
  }
});
