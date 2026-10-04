<script setup>
import PageSignalGlitch from "~/components/PageSignalGlitch.vue";
import { INTRO_SESSION_KEY, shouldShowIntro } from "~/utils/introSession";

const showIntro = ref(false);
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
  activateAudio();
}

function rememberEntry() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Private/restricted storage still allows entering and typing normally.
  }
}

onMounted(() => {
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

useHead({ title: "Arsam Sarkhosh — Full-Stack Engineer" });
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
    :inert="!introReady"
    :aria-hidden="!introReady ? 'true' : undefined"
  >
    <NuxtLayout>
      <NuxtPage />
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
</style>
