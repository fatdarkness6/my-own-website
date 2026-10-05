<script setup>
import PageSignalGlitch from "~/components/PageSignalGlitch.vue";
import { INTRO_SESSION_KEY, shouldShowIntro } from "~/utils/introSession";

const showIntro = ref(false);
const mounted = ref(false);
const { c, locale, rtl } = usePortfolioI18n();
const introReady = useState("introReady", () => false);
const { prepare: prepareAudio, activate: activateAudio } = useEntryAudio();

function removeAudioGesture() {
  document.removeEventListener("click", resumeAudio, true);
  document.removeEventListener("keydown", resumeAudio, true);
}

function resumeAudio(event) {
  if (
    event.type === "keydown" &&
    (event.repeat ||
      event.key === "Tab" ||
      event.key === "Escape" ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey)
  )
    return;
  removeAudioGesture();
  // Let an explicit Play/Pause button handle its own playback exactly once.
  const handlesPlayback = event.target instanceof Element &&
    event.target.closest("[data-audio-toggle]");
  activateAudio({ autoplayMusic: !handlesPlayback });
}

function rememberEntry({ audioActivated = true } = {}) {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Private/restricted storage still allows entering and typing normally.
  }
  if (!audioActivated) {
    document.addEventListener("click", resumeAudio, true);
    document.addEventListener("keydown", resumeAudio, true);
  }
}

onMounted(() => {
  mounted.value = true;
  const navigation = performance.getEntriesByType("navigation")[0];
  let enteredThisSession = false;
  try {
    enteredThisSession = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    // Fall back to the normal intro when session storage is unavailable.
  }

  showIntro.value = shouldShowIntro(navigation?.type, enteredThisSession);
  introReady.value = !showIntro.value;
  if (!showIntro.value) {
    // A new document needs a new audio gesture even during the same tab visit.
    // Typing/reading starts immediately; audio resumes on the next interaction.
    prepareAudio();
    document.addEventListener("click", resumeAudio, true);
    document.addEventListener("keydown", resumeAudio, true);
  }
});

onBeforeUnmount(removeAudioGesture);

useHead(() => ({ htmlAttrs: { lang: locale.value, dir: rtl.value ? "rtl" : "ltr" } }));

// A usable, readable version for visitors without JavaScript. No alternate SEO copy.
useHead({ noscript: [{ innerHTML: `<style>
  .app-boot-cover { display: none !important; }
  .app-content--pending { visibility: visible !important; pointer-events: auto !important; }
  html, body, .q-layout, .app-page--scroll { height: auto !important; overflow: visible !important; }
  .scroll-container, .scroll-track { height: auto !important; overflow: visible !important; transform: none !important; }
  .scroll-track { display: block !important; }
  .scroll-section { height: auto !important; min-height: 100vh; overflow: visible !important; }
  .hero { min-height: 90vh !important; }
  .hero__visual, .scroll-dots, .scroll-glitch-overlay, .page-signal { display: none !important; }
  .hacker-reveal, .terminal-card--waiting, .mobile-profile--waiting, .resume-index--waiting, .cta-term--waiting { visibility: visible !important; opacity: 1 !important; clip-path: none !important; }
</style>` }] });
</script>

<template>
  <!-- Present in SSR too: never expose the layout before the entry decision. -->
  <div v-if="!introReady" class="app-boot-cover" aria-hidden="true" />
  <ClientOnly>
    <LoadingScreen v-if="showIntro" @entered="rememberEntry" />
  </ClientOnly>
  <PageSignalGlitch />
  <div
    class="app-content"
    :class="{ 'app-content--pending': !introReady }"
    :inert="mounted && !introReady"
    :aria-hidden="mounted && !introReady ? 'true' : undefined"
  >
    <a class="skip-link" href="#main-content">{{ c("Skip to content") }}</a>
    <NuxtLayout>
      <NuxtPage :page-key="(route) => route.path" />
    </NuxtLayout>
  </div>
</template>

<style scoped>
.app-boot-cover {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: #000;
}

.app-content {
  display: contents;
}

.app-content--pending {
  visibility: hidden;
  pointer-events: none;
}

.skip-link {
  position: fixed;
  z-index: 10000;
  top: 8px;
  inset-inline-start: 12px;
  padding: 12px 18px;
  color: #fff;
  background: #1d4ed8;
  transform: translateY(-150%);
}

.skip-link:focus-visible {
  transform: translateY(0);
}
</style>
