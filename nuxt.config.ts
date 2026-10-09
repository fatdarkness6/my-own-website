// https://nuxt.com/docs/api/configuration/nuxt-config
import { SITE_NAME, SITE_URL, siteOrigin } from "./shared/seo";
import { locales } from "./shared/locales";
import { portraitImages } from "./app/assets/data/images";

const canonicalOrigin = siteOrigin(process.env.NUXT_PUBLIC_SITE_URL || SITE_URL);
const indexable = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview" && process.env.NUXT_PUBLIC_SEO_INDEXABLE !== "false";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: {
    compressPublicAssets: true,
    typescript: { tsConfig: { compilerOptions: { allowImportingTsExtensions: true } } },
  },
  typescript: {
    // Shared data also runs directly in Node's TypeScript maintenance scripts.
    tsConfig: { compilerOptions: { allowImportingTsExtensions: true } },
    sharedTsConfig: { compilerOptions: { allowImportingTsExtensions: true } },
    nodeTsConfig: { compilerOptions: { allowImportingTsExtensions: true, types: ["node"] } },
  },
  routeRules: {
    // Keep published portrait URLs working after migrating their payloads to WebP.
    "/images/background.png": { redirect: { to: portraitImages.home, statusCode: 301 } },
    "/images/background-rtl-languages.png": { redirect: { to: portraitImages.homeRtl, statusCode: 301 } },
    "/images/arsam-sarkhosh-about.png": { redirect: { to: portraitImages.about, statusCode: 301 } },
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
    locales: locales.map((locale) => ({ ...locale })),
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
