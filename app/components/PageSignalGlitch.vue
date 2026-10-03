<script setup lang="ts">
type Phase = "idle" | "closing" | "covered" | "opening";

const BREAK_MS = 210;
const RECOVER_MS = 170;
const STUCK_MS = 2500;

const phase = ref<Phase>("idle");
const router = useRouter();
const nuxtApp = useNuxtApp();
const introReady = useState("introReady", () => false);

let coverTimer: ReturnType<typeof setTimeout> | undefined;
let revealTimer: ReturnType<typeof setTimeout> | undefined;
let safetyTimer: ReturnType<typeof setTimeout> | undefined;
let releaseCover: (() => void) | undefined;
let removeBefore: (() => void) | undefined;
let removeAfter: (() => void) | undefined;
let removeError: (() => void) | undefined;
let removeFinish: (() => void) | undefined;

function reveal() {
  if (phase.value === "idle" || phase.value === "opening") return;
  clearTimeout(coverTimer);
  clearTimeout(safetyTimer);
  releaseCover?.();
  releaseCover = undefined;
  phase.value = "opening";
  revealTimer = setTimeout(() => {
    phase.value = "idle";
  }, RECOVER_MS);
}

onMounted(() => {
  removeBefore = router.beforeEach((to, from) => {
    // Do not interrupt chapter anchors or the initial loading screen.
    if (to.path === from.path || !introReady.value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (phase.value !== "idle") return;

    phase.value = "closing";
    return new Promise<void>((resolve) => {
      releaseCover = resolve;
      coverTimer = setTimeout(() => {
        phase.value = "covered";
        releaseCover = undefined;
        resolve();
      }, BREAK_MS);
    });
  });

  removeAfter = router.afterEach((_to, _from, failure) => {
    if (failure) {
      reveal();
    } else if (phase.value === "covered") {
      // The page hook normally clears this; avoid trapping the user on errors.
      safetyTimer = setTimeout(reveal, STUCK_MS);
    }
  });

  removeError = router.onError(reveal);
  removeFinish = nuxtApp.hook("page:finish", reveal);
});

onBeforeUnmount(() => {
  clearTimeout(coverTimer);
  clearTimeout(revealTimer);
  clearTimeout(safetyTimer);
  releaseCover?.();
  removeBefore?.();
  removeAfter?.();
  removeError?.();
  removeFinish?.();
});
</script>

<template>
  <div class="page-signal" :class="`page-signal--${phase}`" aria-hidden="true">
    <div class="page-signal__blackout" />
    <div class="page-signal__tears">
      <span v-for="slice in 7" :key="slice" class="page-signal__tear" />
    </div>
    <div class="page-signal__flash" />
  </div>
</template>

<style scoped src="~/assets/css/components/pageSignalGlitch.css"></style>
