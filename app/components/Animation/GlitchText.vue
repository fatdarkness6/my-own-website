<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useGlitchText } from "~/composables/useGlitchText";

const props = defineProps({
  text: { type: String, required: true },
  duration: { type: Number, default: 600 },
  speed: { type: Number, default: 45 },
  chars: {
    type: String,
    default: "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  trigger: { type: String, default: "auto" }, // "auto" | "self"
});

const INTERACTIVE = 'a, button, [role="button"], .q-btn, .q-item';

// 🎲 Pool of glitch visual styles
const STYLES = ["rgb", "shake", "flicker", "block", "scanline"];

const { el, display, active, lockedWidth, currentStyle, run } = useGlitchText(
  props,
  { styles: STYLES, durationBase: 0.85, durationSpread: 0.3 },
);
let target = null;

onMounted(() => {
  target =
    props.trigger === "self"
      ? el.value
      : el.value.closest(INTERACTIVE) || el.value;
  target.addEventListener("mouseenter", run);
  target.addEventListener("focusin", run);
});

onBeforeUnmount(() => {
  if (target) {
    target.removeEventListener("mouseenter", run);
    target.removeEventListener("focusin", run);
  }
});
</script>

<template>
  <span
    ref="el"
    class="glitch-text"
    :class="[
      { 'is-glitching': active },
      active ? `glitch-style--${currentStyle}` : '',
    ]"
    :data-text="text"
    :style="lockedWidth ? { width: lockedWidth + 'px' } : null"
  >
    <span class="glitch-text__reserve" aria-hidden="true">{{ text }}</span>
    <span class="glitch-text__visual" aria-hidden="true">{{ display }}</span>
    <span class="glitch-text__sr">{{ text }}</span>
  </span>
</template>

<style scoped src="~/assets/css/components/animations/glitchText.css"></style>
