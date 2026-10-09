<script setup lang="ts">
withDefaults(defineProps<{ text: string; interval?: number }>(), {
  interval: 9000,
});

const element = ref<HTMLElement | null>(null);
const visible = ref(false);
const { visible: tabVisible, reducedMotion } = useAnimationEnvironment();
const introReady = useState("introReady", () => false);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  if ("IntersectionObserver" in window && element.value) {
    observer = new IntersectionObserver(([entry]) => {
      visible.value = entry?.isIntersecting ?? false;
    });
    observer.observe(element.value);
  } else visible.value = true;
});

onBeforeUnmount(() => {
  observer?.disconnect();
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
