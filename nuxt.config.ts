// https://nuxt.com/docs/api/configuration/nuxt-config
import { SITE_NAME, SITE_URL, siteOrigin } from "./shared/seo";

const canonicalOrigin = siteOrigin(process.env.NUXT_PUBLIC_SITE_URL || SITE_URL);
const indexable = process.env.VERCEL_ENV !== "preview" && process.env.NUXT_PUBLIC_SEO_INDEXABLE !== "false";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: { compressPublicAssets: true },
  routeRules: {
    // These files were JPEGs served under PNG names. Preserve existing image links.
    "/images/projects/arilvo.png": { redirect: { to: "/images/projects/arilvo.jpg", statusCode: 301 } },
    "/images/projects/docintel.png": { redirect: { to: "/images/projects/docintel.jpg", statusCode: 301 } },
    "/images/projects/arvand-termo-tec.png": { redirect: { to: "/images/projects/arvand-termo-tec.jpg", statusCode: 301 } },
    "/images/projects/raymand-group.png": { redirect: { to: "/images/projects/raymand-group.jpg", statusCode: 301 } },
  },
  modules: ["nuxt-quasar-ui", "@nuxtjs/i18n"],
  runtimeConfig: {
    public: {
      siteUrl: canonicalOrigin, seoIndexable: indexable,
      googleSiteVerification: "QqxjGlyiagYJJ7OqLt3hdM-CxlPSf5QQx5VQJI3kl8E",
      bingSiteVerification: "",
    },
  },
  app: {
    head: {
      meta: [
        { name: "theme-color", content: "#050a12" },
        { name: "application-name", content: SITE_NAME },
        { name: "apple-mobile-web-app-title", content: SITE_NAME },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48 256x256" },
        { rel: "icon", href: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  i18n: {
    baseUrl: canonicalOrigin,
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    locales: [
      { code: "en", language: "en", name: "English", dir: "ltr", file: "en.ts" },
      { code: "es", language: "es", name: "Español", dir: "ltr", file: "es.ts" },
      { code: "de", language: "de", name: "Deutsch", dir: "ltr", file: "de.ts" },
      { code: "fr", language: "fr", name: "Français", dir: "ltr", file: "fr.ts" },
      { code: "it", language: "it", name: "Italiano", dir: "ltr", file: "it.ts" },
      { code: "ar", language: "ar", name: "العربية", dir: "rtl", file: "ar.ts" },
      { code: "fa", language: "fa", name: "فارسی", dir: "rtl", file: "fa.ts" },
    ],
    vueI18n: "./config.ts",
  },
  postcss: {
    // Zero-specificity prefixes retain the original mobile/tablet cascade.
    plugins: { "postcss-rtlcss": {
      mode: "override", rtlPrefix: ':where([dir="rtl"])',
      ltrPrefix: ':where([dir="ltr"])', bothPrefix: ':where([dir])',
    } },
  },
  css: [
    "~/assets/css/main.css",
    "~/assets/css/fonts.css",
    "~/assets/css/components/buttons.css",
    "@fontsource-variable/vazirmatn",
    "~/assets/css/localization.css",
  ],
  quasar: {
    sassVariables: "@/assets/css/quasar-variables.scss",
  },
});
