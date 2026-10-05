<script setup>
import { textDirection } from "~/utils/animatedText";
const props = defineProps({
  text: { type: String, required: true },
  active: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
  speed: { type: Number, default: 12 },
  glitch: { type: Number, default: 0 },
  accentTerms: { type: Array, default: () => [] },
});
const emit = defineEmits(["done"]);
// Render genuine text in the initial HTML; animations are progressive enhancement.
const mounted = ref(false);
onMounted(() => { mounted.value = true; });
</script>

<template>
  <span class="typed-text" :dir="textDirection(text)">
    <span class="typed-text__reserve" aria-hidden="true">{{ text }}</span>
    <span class="typed-text__live" aria-hidden="true">
      <AnimationTypewriterText
        v-if="active"
        :key="text"
        auto-start
        :text="text"
        :speed="speed"
        :accent-terms="accentTerms"
        prefix=""
        @done="emit('done')"
      />
      <template v-else-if="done || !mounted">
        <slot>
          <AnimationGlitchTextTimer
            v-if="glitch"
            :text="text"
            :interval="glitch"
          />
          <span v-else>{{ text }}</span>
        </slot>
      </template>
    </span>
    <span class="typed-text__accessible">{{ text }}</span>
  </span>
</template>

<style scoped>
.typed-text {
  position: relative;
  display: block;
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}

.typed-text__reserve {
  display: block;
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}

.typed-text__live {
  position: absolute;
  inset: 0;
  display: block;
  min-width: 0;
  overflow: hidden;
}

.typed-text :deep(.typewriter),
.typed-text :deep(.typewriter__text),
.typed-text :deep(.glitch-text) {
  display: inline;
  font: inherit;
  white-space: normal;
  overflow-wrap: anywhere;
}

.typed-text__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
  user-select: none;
}
</style>
