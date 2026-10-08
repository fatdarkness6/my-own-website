import en from "quasar/lang/en-US.js";
import es from "quasar/lang/es.js";
import de from "quasar/lang/de.js";
import fr from "quasar/lang/fr.js";
import it from "quasar/lang/it.js";
import ar from "quasar/lang/ar.js";
import fa from "quasar/lang/fa.js";
import type { QVueGlobals } from "quasar";
import type { Composer } from "vue-i18n";

const packs = { en, es, de, fr, it, ar, fa };

export default defineNuxtPlugin({
  name: "portfolio-quasar-language",
  dependsOn: ["quasar", "i18n:plugin"],
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n as Composer;
    const quasar = nuxtApp.$q as QVueGlobals;
    const locale = computed(() => i18n.locale.value);
    // $q.lang.set is bound to this request's SSR context by nuxt-quasar-ui.
    // Never mutate Quasar's global server language across concurrent requests.
    watch(locale, (code) => {
      quasar.lang.set(packs[code as keyof typeof packs] ?? en);
    }, { immediate: true });
  },
});
