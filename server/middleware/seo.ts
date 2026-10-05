import { indexingAllowed } from "../../shared/seo";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  if (!indexingAllowed(config.public.seoIndexable)) {
    setHeader(event, "X-Robots-Tag", "noindex, nofollow");
  }
});
