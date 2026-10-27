import data from "../../../content/blog.json" with { type: "json" };
import type { locales } from "../../../shared/locales.ts";
import { projects, type ProjectScreenshot } from "./projects.ts";

export type BlogLocale = (typeof locales)[number]["code"];
export type BlogVisual =
  | { kind: "project"; projectId: string; caption: string }
  | { kind: "flow"; title: string; steps: { title: string; detail: string }[]; caption: string }
  | { kind: "metrics"; title: string; items: { value: string; label: string }[]; caption: string };
export interface BlogSection {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  code?: string;
  codeLabel?: string;
  callout?: string;
  visual?: BlogVisual;
}
export interface BlogVersion {
  title: string;
  summary: string;
  coverAlt?: string;
  sections: BlogSection[];
}
export interface BlogPost {
  id: string;
  sourceUrl: string;
  sourcePublishedAt?: string;
  /** Date this adaptation was added to the blog, not the LinkedIn post's date. */
  publishedAt: string;
  projectId?: string;
  tags: string[];
  cover?: { src: string; optimizedSrc: string; width: number; height: number };
  versions: Partial<Record<BlogLocale, BlogVersion>>;
}

export const blogPosts = data.posts as BlogPost[];

/** Reuse a related project's media when a LinkedIn post has no image of its own. */
export function blogCover(post: BlogPost): ProjectScreenshot | undefined {
  return post.cover ? { ...post.cover, alt: "", mimeType: "image/jpeg" } : projects.find(({ id }) => id === post.projectId)?.screenshot;
}

export function blogReadingMinutes(version: BlogVersion) {
  const text = [version.title, version.summary, ...version.sections.flatMap((section) =>
    [section.title, ...(section.paragraphs ?? []), ...(section.items ?? []), section.callout ?? "",
      section.visual?.caption ?? "", ...(section.visual?.kind === "flow" ? section.visual.steps.flatMap(({ title, detail }) => [title, detail])
        : section.visual?.kind === "metrics" ? section.visual.items.flatMap(({ value, label }) => [value, label]) : [])],
  )].join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/u).length / 200));
}
