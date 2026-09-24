<script setup>
// components/LoadingScreen.vue
// Full-screen glitch loader shown when the site is first opened.
// Add it once, in app.vue:  <LoadingScreen />
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  text: { type: String, default: "LOADING" },
  // the loader stays at least this long (ms) so the effect is actually seen
  minDuration: { type: Number, default: 2200 },
  // safety net: never wait longer than this (ms) for the page to finish loading
  maxDuration: { type: Number, default: 8000 },
});

const visible = ref(true);
const progress = ref(0);
const dotCount = ref(3);

// Fixed width (padded with non-breaking spaces) so the text never jumps while the dots cycle
const label = computed(
  () =>
    props.text +
    ".".repeat(dotCount.value) +
    "\u00A0".repeat(3 - dotCount.value),
);

let raf = 0;
let dotTimer = 0;
let maxTimer = 0;
let doneTimer = 0;
let restoreScroll = () => {};

const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

onMounted(() => {
  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  html.style.overflow = "hidden"; // no scrolling behind the loader
  restoreScroll = () => {
    html.style.overflow = prevOverflow;
  };

  let loaded = document.readyState === "complete";
  const markLoaded = () => {
    loaded = true;
  };
  if (!loaded) window.addEventListener("load", markLoaded, { once: true });
  maxTimer = window.setTimeout(markLoaded, props.maxDuration);

  dotTimer = window.setInterval(() => {
    dotCount.value = (dotCount.value + 1) % 4;
  }, 350);

  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / props.minDuration, 1);
    // waits at 92% until the page has really finished loading
    const cap = loaded ? 100 : 92;
    progress.value = Math.min(easeInOut(t) * 100, cap);

    if (progress.value >= 100) {
      doneTimer = window.setTimeout(() => {
        visible.value = false;
        restoreScroll();
      }, 300);
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  clearInterval(dotTimer);
  clearTimeout(maxTimer);
  clearTimeout(doneTimer);
  restoreScroll();
});
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="loading">
      <div class="loading__box" aria-hidden="true">
        <span class="glitch" :data-text="label">{{ label }}</span>
        <span class="scan" />
      </div>

      <div
        class="loading__bar"
        role="progressbar"
        aria-label="Loading"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(progress)"
      >
        <div class="loading__fill" :style="{ width: progress + '%' }" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading {
  --bg: #000000;
  --text: #f8fafc;
  --glitch-a: #00e5ff; /* cyan split */
  --glitch-b: #ff2bd6; /* magenta split */

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(28px, 6vw, 56px);
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: "Share Tech Mono", "Courier New", ui-monospace, monospace;
}

/* CRT scanlines over the whole screen */
.loading::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05) 0 1px,
    transparent 1px 3px
  );
}

/* ---------- Glitch text ---------- */
.loading__box {
  position: relative;
  padding: 0.35em 0.5em;
  font-size: clamp(30px, 8.5vw, 88px);
  background: rgba(255, 255, 255, 0.07);
  animation: ld-box 3.2s steps(1, end) infinite;
}

.glitch {
  position: relative;
  display: inline-block;
  white-space: pre;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  text-shadow:
    -3px 0 var(--glitch-a),
    3px 3px 0 var(--glitch-b);
  animation: ld-jitter 2.6s steps(1, end) infinite;
}

/* sliced colour layers that jump around */
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  white-space: pre;
  text-shadow: none;
}

.glitch::before {
  color: var(--glitch-a);
  animation: ld-slice-a 1.8s steps(1, end) infinite;
}

.glitch::after {
  color: var(--glitch-b);
  animation: ld-slice-b 2.2s steps(1, end) infinite;
}

/* horizontal scan line running through the text */
.scan {
  position: absolute;
  left: -8%;
  right: -8%;
  height: 4px;
  background: #e5e7eb;
  box-shadow: 6px 0 0 var(--glitch-b);
  animation: ld-scan 2.4s steps(1, end) infinite;
}

/* ---------- Loading bar ---------- */
.loading__bar {
  position: relative;
  box-sizing: border-box;
  width: min(720px, 86vw);
  height: clamp(36px, 6vw, 60px);
  padding: 6px;
  border: 3px solid var(--text);
  animation: ld-bar 3.6s steps(1, end) infinite;
}

/* tiny glitch notches on the left / right edges */
.loading__bar::before,
.loading__bar::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 6px;
  height: 14px;
  transform: translateY(-50%);
}

.loading__bar::before {
  left: -6px;
  background: var(--glitch-a);
}

.loading__bar::after {
  right: -6px;
  background: var(--glitch-b);
}

.loading__fill {
  height: 100%;
  background: var(--text);
  box-shadow: 3px 0 0 var(--glitch-b);
}

/* ---------- Animations ---------- */
@keyframes ld-jitter {
  0%,
  100% {
    transform: none;
  }
  12% {
    transform: translate(2px, -1px);
  }
  13% {
    transform: translate(-4px, 1px) skewX(-6deg);
  }
  14% {
    transform: none;
  }
  62% {
    transform: translate(3px, 0);
  }
  63% {
    transform: none;
  }
}

@keyframes ld-slice-a {
  0%,
  100% {
    clip-path: inset(0 0 62% 0);
    transform: translate(-3px, 0);
  }
  15% {
    clip-path: inset(24% 0 46% 0);
    transform: translate(-12px, 0);
  }
  30% {
    clip-path: inset(62% 0 8% 0);
    transform: translate(7px, 0);
  }
  55% {
    clip-path: inset(10% 0 70% 0);
    transform: translate(-5px, 0);
  }
  75% {
    clip-path: inset(48% 0 30% 0);
    transform: translate(10px, 0);
  }
}

@keyframes ld-slice-b {
  0%,
  100% {
    clip-path: inset(60% 0 0 0);
    transform: translate(3px, 0);
  }
  20% {
    clip-path: inset(8% 0 66% 0);
    transform: translate(12px, 0);
  }
  45% {
    clip-path: inset(38% 0 36% 0);
    transform: translate(-8px, 0);
  }
  70% {
    clip-path: inset(72% 0 4% 0);
    transform: translate(6px, 0);
  }
}

@keyframes ld-scan {
  0%,
  100% {
    top: 40%;
  }
  30% {
    top: 72%;
  }
  55% {
    top: 18%;
  }
  80% {
    top: 55%;
  }
}

@keyframes ld-box {
  0%,
  88%,
  100% {
    transform: none;
  }
  90% {
    transform: skewX(-3deg);
  }
  94% {
    transform: translateX(6px) skewX(1deg);
  }
}

@keyframes ld-bar {
  0%,
  70%,
  100% {
    transform: none;
  }
  72% {
    transform: translateX(-5px);
  }
  74% {
    transform: translateX(4px);
  }
}

/* ---------- Leave transition ---------- */
.loading-fade-leave-active {
  transition: opacity 0.5s ease;
}

.loading-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .loading__box,
  .glitch,
  .glitch::before,
  .glitch::after,
  .scan,
  .loading__bar {
    animation: none;
  }
}
</style>
