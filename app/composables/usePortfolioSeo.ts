import { toValue, type MaybeRefOrGetter } from "vue";
import { SITE_NAME, SOCIAL_IMAGE, indexingAllowed, localizedPath, serializeJsonLd, siteOrigin } from "#shared/seo";
import { projectPath } from "#shared/projectRoutes";
import { contactDetails } from "~/assets/data/contact";
import { projects as sourceProjects, type Project } from "~/assets/data/projects";

interface PortfolioSeoOptions {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "ContactPage";
  project?: MaybeRefOrGetter<Project | undefined>;
  /** In-place project selections still identify their permanent localized URL. */
  canonicalPath?: MaybeRefOrGetter<string>;
}

/** One SSR-safe metadata and identity system, used by all localized pages. */
export function usePortfolioSeo(options: PortfolioSeoOptions) {
  const { c, content, locale } = usePortfolioI18n();
  const projects = content(sourceProjects);
  const config = useRuntimeConfig();
  const route = useRoute();
  const base = siteOrigin(String(config.public.siteUrl));
  const localeHead = useLocaleHead({ seo: { canonicalQueries: [] } });
  const canonical = computed(() => options.canonicalPath
    ? `${base}${localizedPath(toValue(options.canonicalPath), locale.value)}`
    : new URL(
    localeHead.value.link.find((link) => link.rel === "canonical")?.href || `${base}${route.path}`,
    base,
  ).href);
  const project = computed(() => toValue(options.project));
  const image = computed(() => `${base}${project.value?.screenshot?.src || SOCIAL_IMAGE}`);
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
    ogImage: () => image.value, ogImageType: "image/png",
    ogImageWidth: () => project.value?.screenshot ? undefined : 1200,
    ogImageHeight: () => project.value?.screenshot ? undefined : 630,
    ogImageAlt: () => project.value?.screenshot?.alt || `${c("Arsam Sarkhosh")} — ${c("Full-Stack Engineer")}`,
    twitterCard: "summary_large_image", twitterTitle: title,
    twitterDescription: description, twitterImage: () => image.value,
    twitterImageAlt: () => project.value?.screenshot?.alt || `${c("Arsam Sarkhosh")} — ${c("Full-Stack Engineer")}`,
  });

  useHead(() => {
    const personId = `${base}/#person`;
    const websiteId = `${base}/#website`;
    const pageId = `${canonical.value}#webpage`;
    const person = {
      "@type": "Person", "@id": personId, name: SITE_NAME,
      givenName: "Arsam", familyName: "Sarkhosh",
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
      ...(options.type === "CollectionPage" ? { mainEntity: { "@id": `${canonical.value}#projects` } } : {}),
      ...(project.value ? {
        mainEntity: { "@id": `${canonical.value}#project` },
        breadcrumb: { "@id": `${canonical.value}#breadcrumbs` },
      } : {}),
      primaryImageOfPage: { "@type": "ImageObject", url: image.value,
        ...(!project.value?.screenshot ? { width: 1200, height: 630 } : {}) },
    }];
    if (options.type === "CollectionPage") {
      graph.push({
        "@type": "ItemList", "@id": `${canonical.value}#projects`,
        numberOfItems: projects.value.length,
        itemListElement: projects.value.map((project, index) => ({
          "@type": "ListItem", position: index + 1,
          item: {
            "@type": "CreativeWork", name: project.name, description: project.summary,
            url: `${base}${localizedPath(projectPath(project.id), locale.value)}`,
            creator: { "@id": personId },
            ...(project.screenshot ? { image: `${base}${project.screenshot.src}` } : {}),
          },
        })),
      });
    }
    if (project.value) {
      const record = project.value;
      graph.push({
        "@type": record.repo && !record.live ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${canonical.value}#project`, url: canonical.value,
        name: record.name, description: record.description,
        creator: { "@id": personId }, mainEntityOfPage: { "@id": pageId },
        inLanguage: locale.value, keywords: record.stack.join(", "),
        ...(record.screenshot ? { image: image.value } : {}),
        ...(record.repo && !record.live ? { codeRepository: record.repo } : {}),
        sameAs: [record.live, record.repo].filter(Boolean),
      }, {
        "@type": "BreadcrumbList", "@id": `${canonical.value}#breadcrumbs`,
        itemListElement: [
          { name: c("Home"), item: `${base}${localizedPath("/", locale.value)}` },
          { name: c("Projects"), item: `${base}${localizedPath("/projects", locale.value)}` },
          { name: record.name, item: canonical.value },
        ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
      });
    }
    return {
      htmlAttrs: localeHead.value.htmlAttrs,
      link: localeHead.value.link.map((link) => ({
        ...link,
        href: options.canonicalPath && (link.rel === "canonical" || link.hreflang)
          ? link.rel === "canonical" ? canonical.value
            : `${base}${localizedPath(toValue(options.canonicalPath), link.hreflang === "x-default" ? "en" : link.hreflang!)}`
          : new URL(link.href, base).href,
      })),
      meta: [
        ...localeHead.value.meta.map((meta) => meta.property === "og:url"
          ? { ...meta, content: canonical.value } : meta),
        ...(config.public.googleSiteVerification ? [{ name: "google-site-verification", content: String(config.public.googleSiteVerification) }] : []),
        ...(config.public.bingSiteVerification ? [{ name: "msvalidate.01", content: String(config.public.bingSiteVerification) }] : []),
      ],
      script: [{ key: "portfolio-identity", type: "application/ld+json",
        innerHTML: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }) }],
    };
  });
}
