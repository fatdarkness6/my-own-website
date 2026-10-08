import { SITE_LOCALES, SITE_ROUTES, localizedPath } from "../../shared/seo";

const pages = new Set(SITE_ROUTES.flatMap((path) => SITE_LOCALES.map((locale) => localizedPath(path, locale))));

export default defineEventHandler((event) => {
  if (!["GET", "HEAD"].includes(event.method)) return;
  const url = getRequestURL(event);
  const normalized = url.pathname.replace(/\/+$/, "");
  if (normalized && normalized !== url.pathname && pages.has(normalized)) {
    return sendRedirect(event, `${normalized}${url.search}`, 308);
  }
});
