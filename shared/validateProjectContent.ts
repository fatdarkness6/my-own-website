/** Authoring-time checks only; no validator is added to the browser bundle. */
export function validateProjectContent(value: unknown): string[] {
  const errors: string[] = [];
  const object = (item: unknown): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item);
  const text = (item: unknown): item is string => typeof item === "string" && item.trim().length > 0;
  const strings = (item: unknown): item is string[] => Array.isArray(item) && item.every(text);
  const url = (item: unknown) => {
    if (!text(item)) return false;
    try { const parsed = new URL(item); return ["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password; }
    catch { return false; }
  };
  if (!object(value) || !Array.isArray(value.items) || !value.items.length) return ["projects.json: items must be a non-empty array."];
  const ids = new Set<string>();
  const required = ["id", "file", "name", "role", "summary", "headline", "description", "ownership", "note"];
  const optional = ["year", "statusLabel", "availability", "live", "previewUrl", "repo", "license"];
  const allowed = new Set([...required, ...optional, "category", "status", "stack", "screenshot", "contributionOnly", "layers", "contributions", "programmingLanguage"]);
  value.items.forEach((item, index) => {
    const at = `projects.json: items[${index}]`;
    if (!object(item)) { errors.push(`${at} must be an object.`); return; }
    for (const key of Object.keys(item)) if (!allowed.has(key)) errors.push(`${at}.${key}: unknown field (check spelling).`);
    for (const key of required) if (!text(item[key])) errors.push(`${at}.${key} must be a non-empty string.`);
    for (const key of optional) if (key in item && !text(item[key])) errors.push(`${at}.${key}: omit unused fields instead of leaving empty strings.`);
    if (text(item.id)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) errors.push(`${at}.id must use lowercase words separated by hyphens.`);
      if (ids.has(item.id)) errors.push(`${at}.id duplicates ${item.id}.`);
      ids.add(item.id);
    }
    if (!["web", "ai", "tools"].includes(String(item.category))) errors.push(`${at}.category must be web, ai or tools.`);
    if ("status" in item && !["live", "wip", "archived"].includes(String(item.status))) errors.push(`${at}.status must be live, wip or archived.`);
    for (const key of ["stack", "contributions"]) if (!strings(item[key]) || !item[key].length) errors.push(`${at}.${key} must be a non-empty array of strings.`);
    if ("programmingLanguage" in item && (!strings(item.programmingLanguage) || !item.programmingLanguage.length)) errors.push(`${at}.programmingLanguage must be an array of language names.`);
    if ("contributionOnly" in item && typeof item.contributionOnly !== "boolean") errors.push(`${at}.contributionOnly must be true or false.`);
    for (const key of ["live", "repo", "license"]) if (key in item && !url(item[key])) errors.push(`${at}.${key} must be an absolute HTTP(S) URL without credentials.`);
    if ("previewUrl" in item && (!item.live || !url(item.previewUrl) || new URL(String(item.previewUrl)).protocol !== "https:"))
      errors.push(`${at}.previewUrl requires a live URL and an HTTPS preview URL without credentials.`);
    if (!item.live && !item.repo) errors.push(`${at} needs a live or repo URL.`);
    if (item.status === "live" && !item.live) errors.push(`${at}: a live project needs a live URL; source-only tools should omit status.`);
    if (!Array.isArray(item.layers) || !item.layers.length || item.layers.some((layer) => !object(layer) || !["label", "title", "tools"].every((key) => text(layer[key])))) errors.push(`${at}.layers needs objects with label, title and tools.`);
    if ("screenshot" in item) {
      const shot = item.screenshot;
      if (!object(shot) || !text(shot.src) || !shot.src.startsWith("/images/") || !text(shot.alt)) errors.push(`${at}.screenshot needs a /images/ src and descriptive alt.`);
      else {
        if (shot.optimizedSrc !== undefined && (!text(shot.optimizedSrc) || !shot.optimizedSrc.startsWith("/images/"))) errors.push(`${at}.screenshot.optimizedSrc must start with /images/.`);
        for (const key of ["width", "height"]) if (key in shot && (typeof shot[key] !== "number" || !Number.isInteger(shot[key]) || shot[key] <= 0)) errors.push(`${at}.screenshot.${key} must be a positive integer.`);
        if (shot.mimeType !== undefined && !["image/jpeg", "image/png"].includes(String(shot.mimeType))) errors.push(`${at}.screenshot.mimeType must be image/jpeg or image/png.`);
      }
    }
  });
  if (!strings(value.featuredIds) || !value.featuredIds.length) errors.push("projects.json: featuredIds must contain at least one project ID.");
  else {
    if (new Set(value.featuredIds).size !== value.featuredIds.length) errors.push("projects.json: featuredIds must not contain duplicates.");
    for (const id of value.featuredIds) if (!ids.has(id)) errors.push(`projects.json: featuredIds references unknown project ${id}.`);
  }
  return errors;
}
