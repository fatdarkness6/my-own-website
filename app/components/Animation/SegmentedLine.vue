<script setup>
const props = defineProps({
  segments: { type: Array, required: true },
  active: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
  speed: { type: Number, default: 12 },
  defaultInterval: { type: Number, default: 5000 },
  glitchDuration: { type: Number, default: 600 },
  glitchSpeed: { type: Number, default: 45 },
  chars: {
    type: String,
    default: "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
});

const emit = defineEmits(["done"]);

const text = computed(() => props.segments.map(({ text }) => text).join(""));
const accentTerms = computed(() =>
  props.segments
    .filter(({ accent, text }) => accent && text.trim())
    .map(({ text }) => text),
);

const characters = computed(() =>
  props.segments.flatMap((segment) =>
    Array.from(segment.text).map((character) => ({
      character,
      accent: Boolean(segment.accent),
      glitch: segment.glitch !== false,
    })),
  ),
);
const glitchInterval = computed(() => {
  const intervals = props.segments
    .filter((segment) => segment.glitch !== false)
    .map((segment) => segment.interval ?? props.defaultInterval);
  return intervals.length ? Math.min(...intervals) : props.defaultInterval;
});

const displayedCharacters = ref([]);
const glitching = ref(false);
let timer;
let raf = 0;

const resetCharacters = () => {
  displayedCharacters.value = characters.value.map(({ character }) => character);
};

const randomCharacter = () =>
  props.chars[Math.floor(Math.random() * props.chars.length)];

function stopGlitch() {
  if (raf && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(raf);
  }
  raf = 0;
  glitching.value = false;
  resetCharacters();
}

function runGlitch() {
  if (!props.done || raf) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const start = performance.now();
  let lastScramble = 0;
  glitching.value = true;

  const frame = (now) => {
    const elapsed = now - start;
    if (elapsed >= props.glitchDuration) {
      stopGlitch();
      return;
    }

    if (now - lastScramble >= props.glitchSpeed) {
      lastScramble = now;
      const revealed = Math.floor(
        (elapsed / props.glitchDuration) * characters.value.length,
      );
      displayedCharacters.value = characters.value.map(
        ({ character, glitch }, index) =>
          character === " " || !glitch || index < revealed
            ? character
            : randomCharacter(),
      );
    }

    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
}

function scheduleGlitch() {
  clearTimeout(timer);
  if (!props.done) return;
  timer = setTimeout(() => {
    runGlitch();
    scheduleGlitch();
  }, glitchInterval.value);
}

watch(
  [characters, () => props.done],
  () => {
    stopGlitch();
    scheduleGlitch();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimeout(timer);
  if (raf) cancelAnimationFrame(raf);
});
</script>

<template>
  <AnimationTypedLine
    :text="text"
    :active="active"
    :done="done"
    :speed="speed"
    :accent-terms="accentTerms"
    @done="emit('done')"
  >
    <span
      class="segmented-line__complete"
      :class="{ 'is-glitching': glitching }"
      aria-hidden="true"
    >
      <span
        v-for="(item, index) in characters"
        :key="index"
        class="segmented-line__character"
        :class="{ 'segmented-line__accent': item.accent }"
        >{{ displayedCharacters[index] ?? item.character }}</span
      >
    </span>
  </AnimationTypedLine>
</template>

<style scoped>
.segmented-line__complete {
  font: inherit;
  color: inherit;
  white-space: inherit;
  overflow-wrap: inherit;
}

.segmented-line__character {
  font: inherit;
}

.segmented-line__accent {
  color: var(--eyebrow-color, #3b82f6) !important;
}

.segmented-line__complete.is-glitching {
  text-shadow:
    -1px 0 rgb(255 0 76 / 0.7),
    1px 0 rgb(0 229 255 / 0.7);
}
</style>
