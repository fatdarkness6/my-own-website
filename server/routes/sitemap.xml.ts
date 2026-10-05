import { buildSitemap, indexingAllowed } from "../../shared/seo";

export default defineEventHandler((event) => {
  const { public: config } = useRuntimeConfig(event);
  if (!indexingAllowed(config.seoIndexable)) {
    setHeader(event, "X-Robots-Tag", "noindex, nofollow");
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return buildSitemap(String(config.siteUrl));
});
