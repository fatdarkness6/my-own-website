<script setup>
// components/LoadingScreen.vue
// Converted from the standalone "Glitch Loading v2" HTML/CSS/JS into a Vue component.
// Add it once, at the top of app.vue:  <LoadingScreen />
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  // safety net: force-finish after this many ms even if progress stalls
  maxDuration: { type: Number, default: 8000 },
});

const bursting = ref(false);
const done = ref(false);
const progress = ref(0);
const introReady = useState("introReady", () => false);

let progressTimer = 0;
let maxTimer = 0;
let burstTimer = 0;
let removeTimer = 0;
let restoreScroll = () => {};

function tick() {
  // retro feel: uneven jumps with occasional stalls, same logic as the original script
  const jump = Math.random() < 0.18 ? 2 : 4 + Math.random() * 14;
  progress.value = Math.min(100, progress.value + jump);

  if (progress.value >= 100) {
    finish();
  } else {
    progressTimer = window.setTimeout(tick, 80 + Math.random() * 260);
  }
}

function finish() {
  clearTimeout(progressTimer);
  clearTimeout(maxTimer);
  burstTimer = window.setTimeout(() => {
    bursting.value = true;
    removeTimer = window.setTimeout(() => {
      done.value = true; // triggers the fade-out transition
      introReady.value = true; // tells the page it can start its intro sequence
      restoreScroll();
    }, 320);
  }, 500);
}

onMounted(() => {
  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  html.style.overflow = "hidden"; // no scrolling behind the loader
  restoreScroll = () => {
    html.style.overflow = prevOverflow;
  };

  maxTimer = window.setTimeout(() => {
    progress.value = 100;
    finish();
  }, props.maxDuration);

  progressTimer = window.setTimeout(tick, 400);
});

onBeforeUnmount(() => {
  clearTimeout(progressTimer);
  clearTimeout(maxTimer);
  clearTimeout(burstTimer);
  clearTimeout(removeTimer);
  restoreScroll();
});
</script>

<template>
  <Transition name="loader-fade">
    <div
      v-if="!done"
      id="loader"
      class="loader"
      :class="{ burst: bursting }"
      role="status"
      aria-label="Loading"
    >
      <div class="loader-inner">
        <h1 class="title" data-text="LOADING">LOADING</h1>

        <div class="bar-wrap">
          <div class="bar-fill" :style="{ width: progress + '%' }" />
          <span class="bar-edge bar-edge-l" aria-hidden="true" />
          <span class="bar-edge bar-edge-r" aria-hidden="true" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loader {
  --cyan: #00f0ff;
  --magenta: #ff00d4;
  --red: #e80000;
  --mono: "Courier New", ui-monospace, Menlo, Consolas, monospace;

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

/* faint scanlines */
.loader::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0 1px,
    transparent 1px 3px
  );
}

/* whole-content CRT jitter */
.loader-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: screenJitter 3.2s infinite steps(1);
}

@keyframes screenJitter {
  0%,
  92%,
  100% {
    transform: translate(0, 0);
  }
  93% {
    transform: translate(-4px, 2px);
  }
  95% {
    transform: translate(4px, -2px);
  }
  97% {
    transform: translate(-3px, -2px);
  }
}

/* ---------- title: "LOADING" ---------- */
.title {
  position: relative;
  font-family: var(--mono);
  font-weight: 700;
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  letter-spacing: 0.12em;
  white-space: nowrap;
  color: #fff;
  text-shadow:
    -3px 0 rgba(0, 240, 255, 0.9),
    3px 0 rgba(255, 0, 212, 0.9);
}

.title::before,
.title::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  letter-spacing: inherit;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
}

.title::before {
  color: var(--cyan);
  animation: sliceA 3.3s infinite steps(1) 0.5s;
}

.title::after {
  color: var(--magenta);
  animation: sliceB 2.9s infinite steps(1) 0.2s;
}

@keyframes sliceA {
  0%,
  84%,
  100% {
    opacity: 0;
  }
  85% {
    opacity: 0.95;
    clip-path: inset(10% 0 68% 0);
    transform: translate(-6px, -2px);
  }
  88% {
    opacity: 0.95;
    clip-path: inset(58% 0 22% 0);
    transform: translate(5px, 2px);
  }
  91% {
    opacity: 0.95;
    clip-path: inset(30% 0 48% 0);
    transform: translate(-4px, 1px);
  }
  94% {
    opacity: 0;
  }
}

@keyframes sliceB {
  0%,
  66%,
  100% {
    opacity: 0;
  }
  67% {
    opacity: 0.95;
    clip-path: inset(68% 0 6% 0);
    transform: translate(6px, 2px);
  }
  70% {
    opacity: 0.95;
    clip-path: inset(6% 0 78% 0);
    transform: translate(-5px, -2px);
  }
  73% {
    opacity: 0.95;
    clip-path: inset(42% 0 34% 0);
    transform: translate(4px, -1px);
  }
  76% {
    opacity: 0;
  }
}

/* ---------- progress bar ---------- */
.bar-wrap {
  position: relative;
  margin-top: clamp(1rem, 2.5vh, 1.4rem);
  width: min(65vw, 560px);
  height: clamp(32px, 5.5vh, 46px);
  border: 3px solid #fff;
  background: #000;
  box-shadow:
    -3px 0 0 rgba(0, 240, 255, 0.28),
    3px 0 0 rgba(255, 0, 212, 0.28);
}

.bar-fill {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: 0%;
  background: #fff;
  transition: width 0.18s linear;
}

/* red glitch "head" on the leading edge of the fill */
.bar-fill::after {
  content: "";
  position: absolute;
  right: -4px;
  top: -3px;
  bottom: -3px;
  width: 8px;
  background: var(--red);
  animation: headFlick 1.1s infinite steps(1);
}

@keyframes headFlick {
  0%,
  70%,
  100% {
    opacity: 1;
    transform: translateX(0);
  }
  72% {
    opacity: 0.55;
    transform: translateX(2px);
  }
  76% {
    opacity: 1;
    transform: translateX(-1px);
  }
}

.bar-edge {
  position: absolute;
  top: 3px;
  bottom: 3px;
  width: 4px;
}

.bar-edge-l {
  left: -7px;
  background: var(--cyan);
  animation: edgeFlick 1.6s infinite steps(1);
}

.bar-edge-r {
  right: -7px;
  background: var(--magenta);
  animation: edgeFlick 1.3s infinite steps(1) 0.4s;
}

@keyframes edgeFlick {
  0%,
  80%,
  100% {
    opacity: 0.95;
    transform: translateX(0);
  }
  82% {
    opacity: 0.4;
    transform: translateX(-2px);
  }
  86% {
    opacity: 1;
    transform: translateX(2px);
  }
}

/* final burst before the overlay fades */
.loader.burst .title::before {
  animation-duration: 0.45s;
}
.loader.burst .title::after {
  animation-duration: 0.4s;
}
.loader.burst .loader-inner {
  animation-duration: 0.5s;
}
.loader.burst .bar-wrap {
  box-shadow:
    -6px 0 0 rgba(0, 240, 255, 0.5),
    6px 0 0 rgba(255, 0, 212, 0.5);
}

/* fade-out transition (replaces the original opacity/visibility timing) */
.loader-fade-leave-active {
  transition: opacity 0.45s ease;
}
.loader-fade-leave-to {
  opacity: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .loader-inner,
  .title::before,
  .title::after,
  .bar-edge,
  .bar-fill::after {
    animation: none !important;
  }
  .title {
    text-shadow:
      -2px 0 rgba(0, 240, 255, 0.8),
      2px 0 rgba(255, 0, 212, 0.8);
  }
}
</style>
