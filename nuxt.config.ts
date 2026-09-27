// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-quasar-ui"],
  css: ["~/assets/css/main.css", "~/assets/css/fonts.css"],
  quasar: {
    sassVariables: "@/assets/css/quasar-variables.scss",
  },
});
