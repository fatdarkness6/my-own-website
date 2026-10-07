import { PROJECT_PATHS, projectPath } from "./projectRoutes.ts";
import { projects } from "../app/assets/data/projects.ts";

// Vercel already redirects the apex domain to this www host.
export const SITE_URL = "https://www.arsamsarkhosh.ir";
const PRODUCTION_HOSTS = new Set([
  "arsamsarkhosh.vercel.app", "arsamsarkhosh.ir", "www.arsamsarkhosh.ir",
]);
export const SITE_NAME = "Arsam Sarkhosh";
export const SITE_LOCALES = ["en", "es", "de", "fr", "it", "ar", "fa"] as const;
export const SITE_ROUTES = ["/", "/about", "/projects", "/resume", "/contact", ...PROJECT_PATHS] as const;
export const SOCIAL_IMAGE = "/images/og/portfolio.png";

/** One trusted origin, never the incoming Host header or a tracking URL. */
export function siteOrigin(value: string = SITE_URL): string {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Site URL must be an HTTP(S) origin without credentials");
  }
  // Old deployment environment variables must not keep publishing the previous
  // domain in canonicals, hreflang, social previews or the sitemap after the move.
  return PRODUCTION_HOSTS.has(url.hostname) ? SITE_URL : url.origin;
}

export function localizedPath(path: string, locale: string): string {
  return locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
}

export function indexingAllowed(value: unknown): boolean {
  return value !== false && value !== "false";
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character]!);
}

export function buildSitemap(origin: string): string {
  const base = siteOrigin(origin);
  const entries = SITE_ROUTES.flatMap((path) => SITE_LOCALES.map((locale) => {
    const url = `${base}${localizedPath(path, locale)}`;
    const alternatives = [...SITE_LOCALES.map((language) => ({
      language, url: `${base}${localizedPath(path, language)}`,
    })), { language: "x-default", url: `${base}${path}` }];
    // Describe real project screenshots using the same records as the pages.
    const screenshots = projects.filter((project) =>
      path === "/" || path === "/projects" || path === projectPath(project.id),
    ).flatMap((project) => project.screenshot ? [project.screenshot.src] : []);
    return `<url><loc>${escapeXml(url)}</loc>${alternatives.map((alternate) =>
      `<xhtml:link rel="alternate" hreflang="${alternate.language}" href="${escapeXml(alternate.url)}"/>`,
    ).join("")}${screenshots.map((src) =>
      `<image:image><image:loc>${escapeXml(`${base}${src}`)}</image:loc></image:image>`,
    ).join("")}</url>`;
  }));
  // No fabricated lastmod dates or meaningless priority/changefreq values.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join("")}</urlset>`;
}

export function buildRobots(origin: string, indexable: boolean): string {
  return indexable
    ? `User-agent: *\nAllow: /\nSitemap: ${siteOrigin(origin)}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
}

/** Safe inside an HTML script element, even if copy contains HTML-like text. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
