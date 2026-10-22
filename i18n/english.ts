import { identity } from "../app/assets/data/identity.ts";
import { PAGE_SEO } from "../app/assets/data/pageSeo.ts";
import { homeCopy } from "../app/assets/data/homeCopy.ts";
import { aboutCopy } from "../app/assets/data/about.ts";
import { aboutPageCopy } from "../app/assets/data/aboutPage.ts";
import { projects, projectPlaceholder } from "../app/assets/data/projects.ts";
import { resumeProfile, resumeExperience, resumeProjects, resumeSections } from "../app/assets/data/resume.ts";
import { contactIntents, contactTitle } from "../app/assets/data/contact.ts";

// Editable interface copy lives beside all other content.
import interfaceCopy from "../content/interface.json" with { type: "json" };
export const ui = {
  ...interfaceCopy,
  engineer: identity.role, engineerCaps: identity.role.toUpperCase(),
  homeDescription: identity.summary,
  seoHome: PAGE_SEO.home.title, seoHomeDesc: PAGE_SEO.home.description,
  seoAbout: PAGE_SEO.about.title, seoAboutDesc: PAGE_SEO.about.description,
  seoProjects: PAGE_SEO.projects.title, seoProjectsDesc: PAGE_SEO.projects.description,
  seoResume: PAGE_SEO.resume.title, seoResumeDesc: PAGE_SEO.resume.description,
  seoContact: PAGE_SEO.contact.title, seoContactDesc: PAGE_SEO.contact.description,
};

const structural = new Set(["id", "code", "icon", "class", "src", "optimizedSrc", "href", "live", "repo", "file", "filename", "status", "category", "level", "number", "projectId", "programmingLanguage", "license"]);
export function flatten(source: unknown, prefix = "", result: Record<string, string> = {}) {
  if (typeof source === "string") result[prefix] = source;
  else if (Array.isArray(source)) source.forEach((item, index) => {
    const id = item && typeof item === "object" ? item.id ?? item.code ?? index : index;
    flatten(item, `${prefix}.${id}`, result);
  });
  else if (source && typeof source === "object") Object.entries(source).forEach(([key, value]) => {
    if (!structural.has(key)) flatten(value, prefix ? `${prefix}.${key}` : key, result);
  });
  return result;
}
export const english = {
  ...ui,
  ...flatten({ homeCopy, aboutCopy, aboutPageCopy, projects, projectPlaceholder,
    resumeProfile, resumeExperience, resumeProjects, resumeSections, contactIntents, contactTitle }),
};
