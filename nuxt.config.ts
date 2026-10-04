// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-quasar-ui", "@nuxtjs/i18n"],
  i18n: {
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
