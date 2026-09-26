<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  duration: { type: Number, default: 600 },
  speed: { type: Number, default: 45 },
  chars: {
    type: String,
    default: "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  trigger: { type: String, default: "auto" },
});

const INTERACTIVE = 'a, button, [role="button"], .q-btn, .q-item';

const el = ref(null);
const display = ref(props.text);
const active = ref(false);
const lockedWidth = ref(null);

let target = null;
let raf = 0;

const randomChar = () =>
  props.chars[Math.floor(Math.random() * props.chars.length)];

function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
  active.value = false;
  lockedWidth.value = null;
  display.value = props.text;
}

function run() {
  if (raf) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const original = Array.from(props.text);
  const total = original.length;
  const start = performance.now();
  let last = 0;

  lockedWidth.value = el.value.getBoundingClientRect().width;
  active.value = true;

  const frame = (now) => {
    const elapsed = now - start;
    if (elapsed >= props.duration) {
      stop();
      return;
    }
    if (now - last >= props.speed) {
      last = now;
      const revealed = Math.floor((elapsed / props.duration) * total);
      display.value = original
        .map((ch, i) => (ch === " " || i < revealed ? ch : randomChar()))
        .join("");
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

onMounted(() => {
  target =
    props.trigger === "self"
      ? el.value
      : el.value.closest(INTERACTIVE) || el.value;
  target.addEventListener("mouseenter", run);
  target.addEventListener("focusin", run);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  if (target) {
    target.removeEventListener("mouseenter", run);
    target.removeEventListener("focusin", run);
  }
});

watch(
  () => props.text,
  () => {
    if (!raf) display.value = props.text;
  },
);
</script>

<template>
  <span
    ref="el"
    class="glitch-text"
    :class="{ 'is-glitching': active }"
    :style="lockedWidth ? { minWidth: lockedWidth + 'px' } : null"
  >
    <span aria-hidden="true">{{ display }}</span>
    <!-- screen readers always get the real text, never the scrambled one -->
    <span class="glitch-text__sr">{{ text }}</span>
  </span>
</template>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
  white-space: pre;
}

.glitch-text.is-glitching {
  text-shadow:
    1px 0 rgba(59, 130, 246, 0.9),
    -1px 0 rgba(248, 250, 252, 0.35);
}

.glitch-text__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
