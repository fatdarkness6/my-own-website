import { projects } from "../app/assets/data/projects.ts";

/** Project records are the source of truth for routes, links and the sitemap. */
export const projectPath = (id: string) => `/projects/${encodeURIComponent(id)}`;

export function findProjectId(value: unknown): string | undefined {
  return typeof value === "string"
    ? projects.find((project) => project.id === value)?.id
    : undefined;
}

export const PROJECT_PATHS = projects.map((project) => projectPath(project.id));
