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
  interval: { type: Number, default: 5000 },
  randomize: { type: Boolean, default: true },
});

const STYLES = ["rgb", "flicker", "block", "scanline"];

const el = ref(null);
const display = ref(props.text);
const active = ref(false);
const lockedWidth = ref(null);
const currentStyle = ref(STYLES[0]);

let raf = 0;
let timer = null;
let lastStyle = null;

const randomChar = () =>
  props.chars[Math.floor(Math.random() * props.chars.length)];

function pickStyle() {
  let next;
  do {
    next = STYLES[Math.floor(Math.random() * STYLES.length)];
  } while (next === lastStyle && STYLES.length > 1);
  lastStyle = next;
  return next;
}

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

  currentStyle.value = pickStyle();

  const runDuration = props.duration * (0.8 + Math.random() * 0.6);

  const original = Array.from(props.text);
  const total = original.length;
  const start = performance.now();
  let last = 0;

  lockedWidth.value = el.value.getBoundingClientRect().width;
  active.value = true;

  const frame = (now) => {
    const elapsed = now - start;
    if (elapsed >= runDuration) {
      stop();
      return;
    }
    if (now - last >= props.speed) {
      last = now;
      const revealed = Math.floor((elapsed / runDuration) * total);
      display.value = original
        .map((ch, i) => (ch === " " || i < revealed ? ch : randomChar()))
        .join("");
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

function scheduleNext() {
  const jitter = props.randomize ? Math.random() * 1500 : 0;
  timer = setTimeout(() => {
    run();
    scheduleNext();
  }, props.interval + jitter);
}

onMounted(() => {
  scheduleNext();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  clearTimeout(timer);
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
    :class="[
      { 'is-glitching': active },
      active ? `glitch-style--${currentStyle}` : '',
    ]"
    :data-text="text"
    :style="lockedWidth ? { width: lockedWidth + 'px' } : null"
  >
    <span aria-hidden="true">{{ display }}</span>
    <span class="glitch-text__sr">{{ text }}</span>
  </span>
</template>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
  white-space: pre;
  overflow: hidden;
  vertical-align: bottom;
}

.glitch-text__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.glitch-text.is-glitching::before,
.glitch-text.is-glitching::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

/* ============================================================
   STYLE 1: RGB SPLIT — chromatic aberration + slice
============================================================ */
.glitch-style--rgb.is-glitching::before {
  color: #ff004c;
  mix-blend-mode: screen;
  animation: rgb-slice-1 0.5s steps(2, end) infinite;
}
.glitch-style--rgb.is-glitching::after {
  color: #00e5ff;
  mix-blend-mode: screen;
  animation: rgb-slice-2 0.5s steps(2, end) infinite;
}

@keyframes rgb-slice-1 {
  0% {
    clip-path: inset(0 0 85% 0);
    transform: translate(-2px, -1px);
  }
  30% {
    clip-path: inset(30% 0 50% 0);
    transform: translate(2px, 1px);
  }
  60% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(-1px, 2px);
  }
  100% {
    clip-path: inset(10% 0 70% 0);
    transform: translate(2px, -1px);
  }
}
@keyframes rgb-slice-2 {
  0% {
    clip-path: inset(60% 0 5% 0);
    transform: translate(2px, 1px);
  }
  30% {
    clip-path: inset(10% 0 60% 0);
    transform: translate(-2px, -1px);
  }
  60% {
    clip-path: inset(40% 0 30% 0);
    transform: translate(1px, -2px);
  }
  100% {
    clip-path: inset(75% 0 5% 0);
    transform: translate(-2px, 1px);
  }
}

/* ============================================================
   STYLE 2: SHAKE — hard jittery skew, no color split
============================================================ */
.glitch-style--shake.is-glitching {
  animation: shake-jitter 0.15s steps(2, end) infinite;
}

@keyframes shake-jitter {
  0% {
    transform: translate(0, 0) skewX(0deg);
  }
  25% {
    transform: translate(-3px, 2px) skewX(3deg);
  }
  50% {
    transform: translate(3px, -2px) skewX(-3deg);
  }
  75% {
    transform: translate(-2px, -1px) skewX(1deg);
  }
  100% {
    transform: translate(0, 0) skewX(0deg);
  }
}

/* ============================================================
   STYLE 3: FLICKER — opacity strobe like bad signal
============================================================ */
.glitch-style--flicker.is-glitching {
  animation: flicker-strobe 0.12s steps(1, end) infinite;
}

@keyframes flicker-strobe {
  0% {
    opacity: 1;
  }
  20% {
    opacity: 0.2;
  }
  40% {
    opacity: 1;
  }
  55% {
    opacity: 0.3;
  }
  70% {
    opacity: 1;
  }
  85% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

/* ============================================================
   STYLE 4: BLOCK — hard abrupt block displacement jumps
============================================================ */
.glitch-style--block.is-glitching::before {
  color: #f8fafc;
  animation: block-jump-1 0.3s steps(1, end) infinite;
}
.glitch-style--block.is-glitching::after {
  color: #3b82f6;
  animation: block-jump-2 0.3s steps(1, end) infinite;
}

@keyframes block-jump-1 {
  0% {
    clip-path: inset(10% 0 70% 0);
    transform: translate(6px, 0);
  }
  33% {
    clip-path: inset(50% 0 20% 0);
    transform: translate(-6px, 0);
  }
  66% {
    clip-path: inset(80% 0 5% 0);
    transform: translate(4px, 0);
  }
  100% {
    clip-path: inset(20% 0 60% 0);
    transform: translate(-4px, 0);
  }
}
@keyframes block-jump-2 {
  0% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(-5px, 0);
  }
  33% {
    clip-path: inset(15% 0 65% 0);
    transform: translate(5px, 0);
  }
  66% {
    clip-path: inset(40% 0 40% 0);
    transform: translate(-3px, 0);
  }
  100% {
    clip-path: inset(70% 0 15% 0);
    transform: translate(3px, 0);
  }
}

/* ============================================================
   STYLE 5: SCANLINE — CRT-style horizontal sweep + squeeze
============================================================ */
.glitch-style--scanline.is-glitching {
  animation: scanline-squeeze 0.4s steps(4, end) infinite;
}
.glitch-style--scanline.is-glitching::before {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  animation: scanline-sweep 0.6s linear infinite;
  color: transparent;
}

@keyframes scanline-squeeze {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.96) translateX(1px);
  }
  100% {
    transform: scaleY(1);
  }
}
@keyframes scanline-sweep {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
</style>
