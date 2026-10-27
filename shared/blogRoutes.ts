import { blogPosts, type BlogPost, type BlogLocale } from "../app/assets/data/blog.ts";
import { locales } from "./locales.ts";

export function blogPath(id: string): string {
  return `/blog/${id}`;
}

/** A translated interface does not imply that an article translation exists. */
export function blogLocales(post: BlogPost): string[] {
  return locales.filter(({ code }) => Boolean(post.versions[code])).map(({ code }) => code);
}

export function getBlogPost(slug: unknown, locale: string) {
  if (!locales.some(({ code }) => code === locale)) return undefined;
  const post = typeof slug === "string" ? blogPosts.find((post) => post.id === slug) : undefined;
  const version = post?.versions[locale as BlogLocale];
  return post && version ? { post, version } : undefined;
}

/** The index may recommend an available version; detail routes never fall back. */
export function blogPreview(post: BlogPost, locale: string) {
  const available = blogLocales(post);
  const language = (available.includes(locale) ? locale : available.includes("en") ? "en" : available[0]!) as BlogLocale;
  return { post, version: post.versions[language]!, language };
}

export const BLOG_PAGES = blogPosts.map((post) => ({ path: blogPath(post.id), locales: blogLocales(post) }));
