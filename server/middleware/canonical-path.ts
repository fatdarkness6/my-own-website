import { SITE_PAGES, localizedPath } from "../../shared/seo";

const pages = new Set(SITE_PAGES.flatMap(({ path, locales }) => locales.map((locale) => localizedPath(path, locale))));

export default defineEventHandler((event) => {
  if (!["GET", "HEAD"].includes(event.method)) return;
  const url = getRequestURL(event);
  const normalized = url.pathname.replace(/\/+$/, "");
  if (normalized && normalized !== url.pathname && pages.has(normalized)) {
    return sendRedirect(event, `${normalized}${url.search}`, 308);
  }
});
