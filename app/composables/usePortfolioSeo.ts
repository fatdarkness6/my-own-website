import { toValue, type MaybeRefOrGetter } from "vue";
import { SITE_NAME, SOCIAL_IMAGE, indexingAllowed, serializeJsonLd, siteOrigin } from "#shared/seo";
import { contactDetails } from "~/assets/data/contact";
import { projects as sourceProjects } from "~/assets/data/projects";

interface PortfolioSeoOptions {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "ContactPage";
}

/** One SSR-safe metadata and identity system, used by all localized pages. */
export function usePortfolioSeo(options: PortfolioSeoOptions) {
  const { c, content, locale } = usePortfolioI18n();
  const projects = content(sourceProjects);
  const config = useRuntimeConfig();
  const route = useRoute();
  const base = siteOrigin(String(config.public.siteUrl));
  const localeHead = useLocaleHead({ seo: { canonicalQueries: [] } });
  const canonical = computed(() => new URL(
    localeHead.value.link.find((link) => link.rel === "canonical")?.href || `${base}${route.path}`,
    base,
  ).href);
  const image = `${base}${SOCIAL_IMAGE}`;
  const title = () => toValue(options.title);
  const description = () => toValue(options.description);

  useSeoMeta({
    title, description,
    author: SITE_NAME,
    robots: () => indexingAllowed(config.public.seoIndexable)
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow",
    ogType: "website", ogSiteName: SITE_NAME,
    ogTitle: title, ogDescription: description, ogUrl: () => canonical.value,
    ogImage: image, ogImageType: "image/png", ogImageWidth: 1200, ogImageHeight: 630,
    ogImageAlt: () => `${c("Arsam Sarkhosh")} — ${c("Full-Stack Engineer")}`,
    twitterCard: "summary_large_image", twitterTitle: title,
    twitterDescription: description, twitterImage: image,
    twitterImageAlt: () => `${c("Arsam Sarkhosh")} — ${c("Full-Stack Engineer")}`,
  });

  useHead(() => {
    const personId = `${base}/#person`;
    const websiteId = `${base}/#website`;
    const pageId = `${canonical.value}#webpage`;
    const person = {
      "@type": "Person", "@id": personId, name: SITE_NAME,
      alternateName: ["آرسام سرخوش", "أرسام سارخوش"],
      url: `${base}/`, image: `${base}/images/background.png`,
      jobTitle: c("Full-Stack Engineer"),
      sameAs: [contactDetails.github, contactDetails.linkedin],
      knowsAbout: ["Frontend development", "Backend development", "Vue.js", "Nuxt", "TypeScript", "Node.js", "Python", "FastAPI", "PostgreSQL", "Retrieval-Augmented Generation"],
    };
    const graph: Record<string, unknown>[] = [person, {
      "@type": "WebSite", "@id": websiteId, name: SITE_NAME, url: `${base}/`,
      publisher: { "@id": personId }, inLanguage: ["en", "es", "de", "fr", "it", "ar", "fa"],
    }, {
      "@type": options.type || "WebPage", "@id": pageId,
      url: canonical.value, name: title(), description: description(),
      inLanguage: locale.value, isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      ...(options.type === "ProfilePage" ? { mainEntity: { "@id": personId } } : {}),
      primaryImageOfPage: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
    }];
    if (options.type === "CollectionPage") {
      graph.push({
        "@type": "ItemList", "@id": `${canonical.value}#projects`,
        numberOfItems: projects.value.length,
        itemListElement: projects.value.map((project, index) => ({
          "@type": "ListItem", position: index + 1,
          item: {
            "@type": "CreativeWork", name: project.name, description: project.summary,
            url: `${canonical.value}?project=${encodeURIComponent(project.id)}`,
            creator: { "@id": personId },
            ...(project.screenshot ? { image: `${base}${project.screenshot.src}` } : {}),
          },
        })),
      });
    }
    return {
      htmlAttrs: localeHead.value.htmlAttrs,
      link: localeHead.value.link.map((link) => ({ ...link, href: new URL(link.href, base).href })),
      meta: [
        ...localeHead.value.meta,
        ...(config.public.googleSiteVerification ? [{ name: "google-site-verification", content: String(config.public.googleSiteVerification) }] : []),
        ...(config.public.bingSiteVerification ? [{ name: "msvalidate.01", content: String(config.public.bingSiteVerification) }] : []),
      ],
      script: [{ key: "portfolio-identity", type: "application/ld+json",
        innerHTML: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }) }],
    };
  });
}
