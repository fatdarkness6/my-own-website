<script setup lang="ts">
withDefaults(defineProps<{ text: string; interval?: number }>(), {
  interval: 9000,
});

const element = ref<HTMLElement | null>(null);
const visible = ref(false);
const tabVisible = ref(true);
const reducedMotion = ref(false);
const introReady = useState("introReady", () => false);
let observer: IntersectionObserver | undefined;
let motionPreference: MediaQueryList | undefined;

function updateVisibility() {
  tabVisible.value = !document.hidden;
}
function updateMotion() {
  reducedMotion.value = motionPreference?.matches ?? false;
}

onMounted(() => {
  updateVisibility();
  document.addEventListener("visibilitychange", updateVisibility);
  motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  updateMotion();
  motionPreference.addEventListener("change", updateMotion);
  if ("IntersectionObserver" in window && element.value) {
    observer = new IntersectionObserver(([entry]) => {
      visible.value = entry?.isIntersecting ?? false;
    });
    observer.observe(element.value);
  } else visible.value = true;
});

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener("visibilitychange", updateVisibility);
  motionPreference?.removeEventListener("change", updateMotion);
});
</script>

<template>
  <span ref="element" class="page-glitch">
    <AnimationGlitchTextTimer
      v-if="introReady && visible && tabVisible && !reducedMotion"
      :text="text"
      :interval="interval"
      :duration="450"
    />
    <span v-else>{{ text }}</span>
  </span>
</template>

<style scoped>
.page-glitch,
.page-glitch :deep(span) {
  font: inherit;
  color: inherit !important;
}
.page-glitch :deep(.glitch-text) {
  white-space: normal;
  overflow-wrap: inherit;
}
</style>
