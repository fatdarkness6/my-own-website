import data from "../../../content/resume.json" with { type: "json" };
import { aboutCopy } from "./about.ts";
import { projects } from "./projects.ts";

export const resumeDocument = data.document;
export const resumeProfile = { name: aboutCopy.name, role: aboutCopy.role, ...data.profile };
export interface ResumeExperience {
  id: string; company: string; role: string; location: string; period: string;
  employmentType: string; workMode?: string; summary: string; bullets: string[];
  stack: string[]; projectId?: string;
}
export const resumeExperience: ResumeExperience[] = data.experience;

interface ResumeProject {
  id: string;
  name: string;
  summary: string;
  href?: string;
  projectId?: string;
}
// Portfolio records are derived, never duplicated in the editable résumé JSON.
export const resumeProjects: ResumeProject[] = [
  ...projects.map(({ id, name, summary, availability, live, repo }) => ({
    id, name, summary: availability ? `${summary} ${availability}` : summary,
    href: live ?? repo, projectId: id,
  })),
  ...data.extraProjects,
];
export const resumeSections = data.sections;
export const resumeFocus = data.focus;
