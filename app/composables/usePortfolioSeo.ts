import { toValue, type MaybeRefOrGetter } from "vue";
import { SITE_NAME, SITE_LOCALES, PAGE_SEO, SOCIAL_IMAGE, canonicalUrl, indexingAllowed, localizedPath, serializeJsonLd, siteOrigin } from "#shared/seo";
import { identity } from "~/assets/data/identity";
import { projectPath } from "#shared/projectRoutes";
import { contactDetails } from "~/assets/data/contact";
import { projects as sourceProjects, type Project } from "~/assets/data/projects";
import { blogCover, blogPosts, type BlogPost, type BlogVersion } from "~/assets/data/blog";
import { blogLocales, blogPath, blogPreview } from "#shared/blogRoutes";

interface PortfolioSeoOptions {
  page?: keyof typeof PAGE_SEO;
  title?: MaybeRefOrGetter<string>;
  description?: MaybeRefOrGetter<string>;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "ContactPage";
  project?: MaybeRefOrGetter<Project | undefined>;
  blogPost?: MaybeRefOrGetter<{ post: BlogPost; version: BlogVersion } | undefined>;
  /** Existing project collections remain the default. */
  collection?: "projects" | "blog";
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
  const canonical = computed(() => canonicalUrl(options.canonicalPath
    ? localizedPath(toValue(options.canonicalPath), locale.value)
    : localeHead.value.link.find((link) => link.rel === "canonical")?.href || route.path));
  const project = computed(() => toValue(options.project));
  const article = computed(() => toValue(options.blogPost));
  const articleLocales = computed(() => article.value ? blogLocales(article.value.post) : SITE_LOCALES);
  const imageRecord = computed(() => {
    if (!article.value) return project.value?.screenshot;
    const cover = blogCover(article.value.post);
    return cover ? { ...cover, alt: article.value.version.coverAlt || c(cover.alt) } : undefined;
  });
  const image = computed(() => `${base}${imageRecord.value?.src || SOCIAL_IMAGE}`);
  const title = () => options.title ? toValue(options.title) : c(PAGE_SEO[options.page || "home"].title);
  const description = () => options.description ? toValue(options.description) : c(PAGE_SEO[options.page || "home"].description);

  useSeoMeta({
    title, description,
    author: SITE_NAME,
    robots: () => indexingAllowed(config.public.seoIndexable)
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow",
    ogType: () => article.value ? "article" : "website", ogSiteName: SITE_NAME,
    articlePublishedTime: () => article.value?.post.publishedAt,
    ogTitle: title, ogDescription: description, ogUrl: () => canonical.value,
    ogImage: () => image.value, ogImageType: () => imageRecord.value?.mimeType || "image/png",
    ogImageWidth: () => imageRecord.value?.width || 1200,
    ogImageHeight: () => imageRecord.value?.height || 630,
    ogImageAlt: () => imageRecord.value?.alt || `${c(identity.name)} — ${c(identity.role)}`,
    twitterCard: "summary_large_image", twitterTitle: title,
    twitterDescription: description, twitterImage: () => image.value,
    twitterImageAlt: () => imageRecord.value?.alt || `${c(identity.name)} — ${c(identity.role)}`,
  });

  useHead(() => {
    const personId = `${base}/#person`;
    const websiteId = `${base}/#website`;
    const pageId = `${canonical.value}#webpage`;
    const isBlogCollection = options.type === "CollectionPage" && options.collection === "blog";
    const collectionId = `${canonical.value}#${isBlogCollection ? "blog" : "projects"}`;
    const person = {
      "@type": "Person", "@id": personId, name: SITE_NAME,
      givenName: identity.givenName, familyName: identity.familyName,
      alternateName: [...identity.alternateNames],
      url: `${base}/`, image: `${base}${identity.image}`,
      jobTitle: c(identity.role),
      sameAs: [contactDetails.github, contactDetails.linkedin],
      knowsAbout: ["Frontend development", "Backend development", "Vue.js", "Nuxt", "TypeScript", "Node.js", "Python", "FastAPI", "PostgreSQL", "Retrieval-Augmented Generation"],
    };
    const graph: Record<string, unknown>[] = [person, {
      "@type": "WebSite", "@id": websiteId, name: SITE_NAME, url: `${base}/`,
      alternateName: [...identity.alternateNames],
      publisher: { "@id": personId }, inLanguage: SITE_LOCALES,
    }, {
      "@type": options.type || "WebPage", "@id": pageId,
      url: canonical.value, name: title(), description: description(),
      inLanguage: locale.value, isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      ...(options.type === "ProfilePage" ? { mainEntity: { "@id": personId } } : {}),
      ...(options.type === "CollectionPage" ? { mainEntity: { "@id": collectionId } } : {}),
      ...(project.value ? {
        mainEntity: { "@id": `${canonical.value}#project` },
        breadcrumb: { "@id": `${canonical.value}#breadcrumbs` },
      } : {}),
      ...(article.value ? {
        mainEntity: { "@id": `${canonical.value}#article` },
        breadcrumb: { "@id": `${canonical.value}#breadcrumbs` },
      } : {}),
      primaryImageOfPage: { "@type": "ImageObject", url: image.value,
        caption: imageRecord.value?.alt || `${c(identity.name)} — ${c(identity.role)}`,
        width: imageRecord.value?.width || 1200,
        height: imageRecord.value?.height || 630 },
    }];
    if (isBlogCollection) {
      const entries = blogPosts.map((post) => blogPreview(post, locale.value));
      graph.push({
        "@type": "Blog", "@id": collectionId,
        url: canonical.value, name: title(), description: description(),
        inLanguage: locale.value, publisher: { "@id": personId },
        mainEntity: { "@id": `${canonical.value}#posts` },
        blogPost: entries.map(({ post, language }) => ({
          "@id": `${base}${localizedPath(blogPath(post.id), language)}#article`,
        })),
      }, {
        "@type": "ItemList", "@id": `${canonical.value}#posts`,
        numberOfItems: entries.length,
        itemListElement: entries.map(({ post, version, language }, index) => ({
          "@type": "ListItem", position: index + 1,
          item: {
            "@type": "BlogPosting", "@id": `${base}${localizedPath(blogPath(post.id), language)}#article`,
            url: `${base}${localizedPath(blogPath(post.id), language)}`,
            headline: version.title, description: version.summary,
            inLanguage: language, datePublished: post.publishedAt,
            author: { "@id": personId }, citation: post.sourceUrl,
            ...(blogCover(post) ? { image: `${base}${blogCover(post)!.src}` } : {}),
          },
        })),
      });
    } else if (options.type === "CollectionPage") {
      graph.push({
        "@type": "ItemList", "@id": `${canonical.value}#projects`,
        numberOfItems: projects.value.length,
        itemListElement: projects.value.map((project, index) => ({
          "@type": "ListItem", position: index + 1,
          item: {
            "@type": "CreativeWork", name: project.name, description: project.summary,
            url: `${base}${localizedPath(projectPath(project.id), locale.value)}`,
            [project.contributionOnly ? "contributor" : "creator"]: { "@id": personId },
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
        [record.contributionOnly ? "contributor" : "creator"]: { "@id": personId },
        mainEntityOfPage: { "@id": pageId },
        inLanguage: locale.value, keywords: record.stack.join(", "),
        ...(record.screenshot ? { image: image.value } : {}),
        ...(record.repo && !record.live ? { codeRepository: record.repo } : {}),
        ...(record.programmingLanguage ? { programmingLanguage: record.programmingLanguage } : {}),
        ...(record.license ? { license: record.license } : {}),
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
    if (article.value) {
      const { post, version } = article.value;
      graph.push({
        "@type": "BlogPosting", "@id": `${canonical.value}#article`,
        url: canonical.value, headline: version.title, description: version.summary,
        inLanguage: locale.value, datePublished: post.publishedAt,
        author: { "@id": personId }, publisher: { "@id": personId },
        mainEntityOfPage: { "@id": pageId },
        isPartOf: { "@id": `${base}${localizedPath("/blog", locale.value)}#blog` },
        image: image.value, keywords: post.tags.join(", "),
        citation: post.sourceUrl, isBasedOn: post.sourceUrl,
      }, {
        "@type": "BreadcrumbList", "@id": `${canonical.value}#breadcrumbs`,
        itemListElement: [
          { name: c("Home"), item: `${base}${localizedPath("/", locale.value)}` },
          { name: c("Blog"), item: `${base}${localizedPath("/blog", locale.value)}` },
          { name: version.title, item: canonical.value },
        ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
      });
    }
    const links = localeHead.value.link
      .filter((link) => !article.value || !("hreflang" in link))
      .map((link) => {
        const language = "hreflang" in link ? link.hreflang : undefined;
        return {
          ...link,
          href: options.canonicalPath && (link.rel === "canonical" || language)
            ? link.rel === "canonical" ? canonical.value
              : `${base}${localizedPath(toValue(options.canonicalPath), language === "x-default" ? "en" : language!)}`
            : canonicalUrl(link.href),
        };
      });
    if (article.value) {
      const path = blogPath(article.value.post.id);
      for (const language of [...articleLocales.value, "x-default"]) links.push({
        rel: "alternate", hreflang: language,
        href: `${base}${localizedPath(path, language === "x-default" ? articleLocales.value.includes("en") ? "en" : articleLocales.value[0]! : language)}`,
      });
    }
    return {
      htmlAttrs: localeHead.value.htmlAttrs,
      link: links,
      meta: [
        ...localeHead.value.meta.filter((meta) => meta.property !== "og:locale:alternate" || !article.value || articleLocales.value.includes(String(meta.content))).map((meta) => meta.property === "og:url"
          ? { ...meta, content: canonical.value } : meta),
        ...(config.public.googleSiteVerification ? [{ name: "google-site-verification", content: String(config.public.googleSiteVerification) }] : []),
        ...(config.public.bingSiteVerification ? [{ name: "msvalidate.01", content: String(config.public.bingSiteVerification) }] : []),
      ],
      script: [{ key: "portfolio-identity", type: "application/ld+json",
        innerHTML: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }) }],
    };
  });
}
