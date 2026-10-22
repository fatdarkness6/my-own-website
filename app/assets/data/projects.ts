import data from "../../../content/projects.json" with { type: "json" };

export type ProjectStatus = "live" | "wip" | "archived";

export interface ProjectScreenshot {
  /** JPEG retained for social previews and existing public links. */
  src: string;
  /** Same-resolution compressed image used throughout the interface. */
  optimizedSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: "image/png" | "image/jpeg";
}

export interface Project {
  id: string;
  file: string;
  name: string;
  year?: string;
  role: string;
  status?: ProjectStatus;
  statusLabel?: string;
  summary: string;
  availability?: string;
  stack: string[];
  screenshot?: ProjectScreenshot;
  category: "web" | "ai" | "tools";
  headline: string;
  description: string;
  ownership: string;
  /** Existing products where the record describes a contribution, not authorship. */
  contributionOnly?: boolean;
  layers: { label: string; title: string; tools: string }[];
  contributions: string[];
  note: string;
  live?: string;
  repo?: string;
  programmingLanguage?: string[];
  license?: string;
}

// Shared fallback for projects that do not have a screenshot yet.
export const projectPlaceholder: ProjectScreenshot = {
  src: "/images/projects/project-preview.svg",
  alt: "Project cover — screenshot coming soon",
};

// Edit content/projects.json; all existing consumers keep this shared catalog.
export const projects: Project[] = data.items as Project[];
export const featuredProjects: Project[] = data.featuredIds.map((id) => {
  const project = projects.find((record) => record.id === id);
  if (!project) throw new Error(`Unknown featured project: ${id}. Check content/projects.json.`);
  return project;
});
