import { locales } from "./locales.ts";

/** Authoring-time checks only; application adapters consume validated JSON. */
export function validateBlogContent(value: unknown, projectIds?: Iterable<string>): string[] {
  const errors: string[] = [];
  const object = (item: unknown): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item);
  const text = (item: unknown): item is string => typeof item === "string" && item.trim().length > 0;
  const strings = (item: unknown): item is string[] => Array.isArray(item) && item.length > 0 && item.every(text);
  const slug = (item: unknown): item is string => typeof item === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item);
  const date = (item: unknown) => {
    if (typeof item !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item)) return false;
    const parsed = new Date(`${item}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === item;
  };
  const sourceUrl = (item: unknown) => {
    if (!text(item)) return false;
    try {
      const parsed = new URL(item);
      return parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.port &&
        (parsed.hostname === "linkedin.com" || parsed.hostname.endsWith(".linkedin.com")) &&
        /^\/(?:posts|feed\/update)\/[^/]+\/?$/.test(parsed.pathname) && !parsed.search && !parsed.hash;
    } catch { return false; }
  };
  const fields = (item: Record<string, unknown>, allowed: string[], at: string) => {
    for (const key of Object.keys(item)) if (!allowed.includes(key)) errors.push(`${at}.${key}: unknown field (check spelling).`);
  };

  if (!object(value)) return ["blog.json must be an object with a posts array."];
  fields(value, ["posts"], "blog.json");
  if (!Array.isArray(value.posts)) return [...errors, "blog.json: posts must be an array."];

  const postIds = new Set<string>();
  const projects = projectIds === undefined ? undefined : new Set(projectIds);
  const languages = new Set<string>(locales.map(({ code }) => code));
  value.posts.forEach((post, index) => {
    const at = `blog.json: posts[${index}]`;
    if (!object(post)) { errors.push(`${at} must be an object.`); return; }
    fields(post, ["id", "sourceUrl", "publishedAt", "sourcePublishedAt", "projectId", "tags", "cover", "versions"], at);
    if (!slug(post.id)) errors.push(`${at}.id must use lowercase words separated by hyphens.`);
    if (text(post.id)) {
      if (postIds.has(post.id)) errors.push(`${at}.id duplicates ${post.id}.`);
      postIds.add(post.id);
    }
    if (!sourceUrl(post.sourceUrl)) errors.push(`${at}.sourceUrl must be an HTTPS LinkedIn post URL without credentials, query parameters or a fragment.`);
    for (const key of ["publishedAt", "sourcePublishedAt"]) {
      if ((key === "publishedAt" || key in post) && !date(post[key])) errors.push(`${at}.${key} must be a valid YYYY-MM-DD calendar date.`);
    }
    if ("projectId" in post) {
      if (!slug(post.projectId)) errors.push(`${at}.projectId must be a project ID; omit it when no project is related.`);
      else if (projects && !projects.has(post.projectId)) errors.push(`${at}.projectId references unknown project ${post.projectId}.`);
    }
    if (!strings(post.tags)) errors.push(`${at}.tags must be a non-empty array of non-empty technical tags.`);
    else if (new Set(post.tags.map((tag) => tag.trim().toLowerCase())).size !== post.tags.length) errors.push(`${at}.tags must not contain duplicates.`);
    if ("cover" in post) {
      if (!object(post.cover)) errors.push(`${at}.cover must contain local image paths and dimensions.`);
      else {
        fields(post.cover, ["src", "optimizedSrc", "width", "height"], `${at}.cover`);
        if (typeof post.cover.src !== "string" || !/^\/images\/blog\/[a-z0-9-]+\.jpg$/.test(post.cover.src)) errors.push(`${at}.cover.src must be a local /images/blog/ JPEG path ending in .jpg.`);
        if (typeof post.cover.optimizedSrc !== "string" || !/^\/images\/blog\/[a-z0-9-]+\.webp$/.test(post.cover.optimizedSrc)) errors.push(`${at}.cover.optimizedSrc must be a local /images/blog/ WebP path.`);
        for (const key of ["width", "height"]) if (!Number.isSafeInteger(post.cover[key]) || Number(post.cover[key]) <= 0) errors.push(`${at}.cover.${key} must be a positive integer.`);
      }
    }
    if (!object(post.versions) || !Object.keys(post.versions).length) {
      errors.push(`${at}.versions must contain at least one supported language.`);
      return;
    }
    let expectedSectionIds: string[] | undefined;
    for (const [language, version] of Object.entries(post.versions)) {
      const translatedAt = `${at}.versions.${language}`;
      if (!languages.has(language)) errors.push(`${translatedAt} is not a supported locale.`);
      if (!object(version)) { errors.push(`${translatedAt} must be an object.`); continue; }
      fields(version, ["title", "summary", "coverAlt", "sections"], translatedAt);
      if (("cover" in post || "coverAlt" in version) && !text(version.coverAlt)) errors.push(`${translatedAt}.coverAlt must describe the cover image in this article's language.`);
      for (const key of ["title", "summary"]) if (!text(version[key])) errors.push(`${translatedAt}.${key} must be a non-empty string.`);
      if (!Array.isArray(version.sections) || !version.sections.length) {
        errors.push(`${translatedAt}.sections must be a non-empty array.`);
        continue;
      }
      const sectionIds = new Set<string>();
      for (const [sectionIndex, section] of version.sections.entries()) {
        const sectionAt = `${translatedAt}.sections[${sectionIndex}]`;
        if (!object(section)) { errors.push(`${sectionAt} must be an object.`); continue; }
        fields(section, ["id", "title", "paragraphs", "items", "code", "callout"], sectionAt);
        if (!slug(section.id)) errors.push(`${sectionAt}.id must use lowercase words separated by hyphens.`);
        if (text(section.id)) {
          if (sectionIds.has(section.id)) errors.push(`${sectionAt}.id duplicates ${section.id}.`);
          sectionIds.add(section.id);
        }
        if (!text(section.title)) errors.push(`${sectionAt}.title must be a non-empty heading.`);
        for (const key of ["paragraphs", "items"]) {
          if (key in section && !strings(section[key])) errors.push(`${sectionAt}.${key} must be a non-empty array of non-empty strings.`);
        }
        for (const key of ["code", "callout"]) {
          if (key in section && !text(section[key])) errors.push(`${sectionAt}.${key} must be a non-empty string.`);
        }
        if (!strings(section.paragraphs) && !strings(section.items) && !text(section.code) && !text(section.callout)) {
          errors.push(`${sectionAt} needs paragraphs, items, code or a callout.`);
        }
      }
      const ids = [...sectionIds].sort();
      if (expectedSectionIds && JSON.stringify(ids) !== JSON.stringify(expectedSectionIds)) {
        errors.push(`${translatedAt}.sections must use the same section IDs as the other translations to preserve anchors.`);
      }
      expectedSectionIds ??= ids;
    }
  });
  return errors;
}
