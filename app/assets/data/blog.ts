import data from "../../../content/blog.json" with { type: "json" };
import type { locales } from "../../../shared/locales.ts";

export type BlogLocale = (typeof locales)[number]["code"];
export interface BlogSection {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  code?: string;
  callout?: string;
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

export const blogPosts: BlogPost[] = data.posts;

export function blogReadingMinutes(version: BlogVersion) {
  const text = [version.title, version.summary, ...version.sections.flatMap((section) =>
    [section.title, ...(section.paragraphs ?? []), ...(section.items ?? []), section.callout ?? ""],
  )].join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/u).length / 200));
}
