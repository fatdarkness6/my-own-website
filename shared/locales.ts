/** Routing, hreflang and sitemap languages share this configuration. */
export const locales = [
  { code: "en", language: "en", name: "English", dir: "ltr", file: "en.ts" },
  { code: "es", language: "es", name: "Español", dir: "ltr", file: "es.ts" },
  { code: "de", language: "de", name: "Deutsch", dir: "ltr", file: "de.ts" },
  { code: "fr", language: "fr", name: "Français", dir: "ltr", file: "fr.ts" },
  { code: "it", language: "it", name: "Italiano", dir: "ltr", file: "it.ts" },
  { code: "ar", language: "ar", name: "العربية", dir: "rtl", file: "ar.ts" },
  { code: "fa", language: "fa", name: "فارسی", dir: "rtl", file: "fa.ts" },
] as const;
