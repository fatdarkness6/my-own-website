import { buildRobots, indexingAllowed } from "../../shared/seo";

export default defineEventHandler((event) => {
  const { public: config } = useRuntimeConfig(event);
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=300");
  return buildRobots(String(config.siteUrl), indexingAllowed(config.seoIndexable));
});
