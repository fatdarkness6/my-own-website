<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    show?: boolean;
    delay?: number;
    duration?: number;
    once?: boolean;
    as?: string;
  }>(),
  {
    show: false,
    delay: 0,
    duration: 680,
    once: true,
    as: "div",
  },
);

const revealed = ref(props.show);
const mounted = ref(false);
onMounted(() => { mounted.value = true; });

watch(
  () => props.show,
  (show) => {
    if (show) revealed.value = true;
    else if (!props.once) revealed.value = false;
  },
  { immediate: true },
);

const revealStyle = computed(() => ({
  "--hacker-reveal-delay": `${Math.max(0, props.delay)}ms`,
  "--hacker-reveal-duration": `${Math.max(0, props.duration)}ms`,
}));
</script>

<template>
  <component
    :is="as"
    class="hacker-reveal"
    :class="{ 'hacker-reveal--shown': revealed, 'hacker-reveal--static': !mounted }"
    :style="revealStyle"
    :aria-hidden="mounted && !revealed ? 'true' : undefined"
    :inert="mounted && !revealed"
  >
    <slot />
    <span class="hacker-reveal__scan" aria-hidden="true" />
  </component>
</template>

<style scoped>
.hacker-reveal {
  position: relative;
  width: 100%;
  min-width: 0;
  opacity: 0;
  visibility: hidden;
  clip-path: inset(0 0 100% 0);
  transform: translate3d(0, 0, 0);
  will-change: clip-path, opacity, transform, filter;
}

.hacker-reveal--shown {
  visibility: visible;
  animation: hacker-reveal-in var(--hacker-reveal-duration) steps(1, end)
    var(--hacker-reveal-delay) both;
}

.hacker-reveal--static {
  visibility: visible;
  opacity: 1;
  clip-path: none;
}

.hacker-reveal__scan {
  position: absolute;
  z-index: 5;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    to bottom,
    transparent 0,
    rgb(96 165 250 / 0.08) 42%,
    rgb(96 165 250 / 0.7) 50%,
    rgb(59 130 246 / 0.1) 58%,
    transparent 100%
  );
  clip-path: inset(0 0 92% 0);
}

.hacker-reveal--shown .hacker-reveal__scan {
  animation: hacker-reveal-scan var(--hacker-reveal-duration) linear
    var(--hacker-reveal-delay) both;
}

@keyframes hacker-reveal-in {
  0% {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
    transform: translate3d(0, 0, 0);
    filter: brightness(1);
  }
  10% {
    opacity: 1;
    clip-path: inset(42% 0 42% 0);
    transform: translate3d(-7px, 0, 0);
    filter: brightness(1.8);
  }
  22% {
    clip-path: inset(8% 0 72% 0);
    transform: translate3d(6px, 0, 0);
  }
  36% {
    clip-path: inset(62% 0 7% 0);
    transform: translate3d(-5px, 0, 0);
  }
  50% {
    opacity: 0.76;
    clip-path: inset(18% 0 48% 0);
    transform: translate3d(4px, 0, 0);
    filter: brightness(1.35) saturate(1.4);
  }
  64% {
    opacity: 1;
    clip-path: inset(0);
    transform: translate3d(-3px, 0, 0);
  }
  78% {
    transform: translate3d(2px, 0, 0);
    filter: brightness(1.1);
  }
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  100% {
    opacity: 1;
    clip-path: inset(0);
    transform: translate3d(0, 0, 0);
    filter: none;
  }
}

@keyframes hacker-reveal-scan {
  0%,
  8% {
    opacity: 0;
    clip-path: inset(0 0 92% 0);
  }
  12% {
    opacity: 1;
  }
  72% {
    opacity: 0.75;
    clip-path: inset(88% 0 4% 0);
  }
  100% {
    opacity: 0;
    clip-path: inset(100% 0 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hacker-reveal--shown {
    opacity: 1;
    clip-path: none;
    transform: none;
    filter: none;
    animation: none;
  }

  .hacker-reveal__scan {
    display: none;
  }
}
</style>
