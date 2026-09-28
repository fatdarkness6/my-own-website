<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useScrollSections } from "~/composables/useScrollSections";

const props = defineProps({
  transitionDuration: { type: Number, default: 900 },
  wheelThreshold: { type: Number, default: 12 },
  cooldown: { type: Number, default: 900 },
});

const {
  sections,
  currentIndex,
  isAnimating,
  direction,
  setTransitionDuration,
  goTo,
  next,
  prev,
  resetToTop,
} = useScrollSections();

const glitchActive = ref(false);
const bands = ref([]);
const NUM_BANDS = 18;

let wheelAccum = 0;
let lastWheelTime = 0;
let touchStartY = 0;
let lastActionTime = 0;
let glitchTimeoutId = null;

const trackStyle = computed(() => ({
  transform: `translateY(-${currentIndex.value * 100}dvh)`,
  transitionDuration: `${props.transitionDuration}ms`,
}));

function canTrigger() {
  return performance.now() - lastActionTime >= props.cooldown;
}

// ---- Generate a fresh random datamosh pattern every transition ----
function generateBands() {
  const arr = [];
  for (let i = 0; i < NUM_BANDS; i++) {
    const top =
      (i / NUM_BANDS) * 100 + Math.random() * (100 / NUM_BANDS) * 0.25;
    const height = 100 / NUM_BANDS + Math.random() * 1.5;
    const offset = (Math.random() - 0.5) * 2 * 60; // px
    const delay = (Math.random() * 0.15).toFixed(3);
    const duration = (0.26 + Math.random() * 0.26).toFixed(3);

    // Only 3 tones: dim white, accent blue, near-black shadow band
    const roll = Math.random();
    let bg;
    if (roll < 0.45)
      bg = "rgba(59, 130, 246, 0.45)"; // accent blue
    else if (roll < 0.75)
      bg = "rgba(248, 250, 252, 0.18)"; // faint white
    else bg = "rgba(0, 0, 0, 0.55)"; // dark cut band

    arr.push({
      id: `${i}-${Math.random()}`,
      style: {
        top: `${top}%`,
        height: `${height}%`,
        background: bg,
        "--offset": `${offset}px`,
        "--delay": `${delay}s`,
        "--duration": `${duration}s`,
      },
    });
  }
  bands.value = arr;
}

function triggerGlitch() {
  generateBands();
  glitchActive.value = false;
  // force reflow so re-triggering restarts CSS animations even if fired rapidly
  requestAnimationFrame(() => {
    glitchActive.value = true;
  });

  if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
  glitchTimeoutId = window.setTimeout(() => {
    glitchActive.value = false;
  }, 760);
}

function handleWheel(e) {
  // Preserve browser zoom and horizontal scrolling.
  if (e.ctrlKey) return;
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if (e.deltaY === 0) return;

  const section = sections[currentIndex.value]?.el;
  if (!section) return;

  // Don't intercept wheel events outside the active section.
  if (!(e.target instanceof Node) || !section.contains(e.target)) {
    return;
  }

  // Freeze input during the section transition.
  if (isAnimating.value) {
    e.preventDefault();
    wheelAccum = 0;
    return;
  }

  const scrollingDown = e.deltaY > 0;
  const maxScrollTop = Math.max(0, section.scrollHeight - section.clientHeight);

  const epsilon = 2;

  const canScrollInside = scrollingDown
    ? section.scrollTop < maxScrollTop - epsilon
    : section.scrollTop > epsilon;

  // THE FIX:
  // Let the browser scroll the section normally while it has room.
  // Do not call preventDefault() in this branch.
  if (canScrollInside) {
    wheelAccum = 0;
    lastWheelTime = 0;
    return;
  }

  // Only take over the event at the section's top/bottom boundary.
  e.preventDefault();

  if (!canTrigger()) {
    wheelAccum = 0;
    return;
  }

  const targetIndex = currentIndex.value + (scrollingDown ? 1 : -1);

  // No glitch or transition beyond the first/last section.
  if (targetIndex < 0 || targetIndex >= sections.length) {
    wheelAccum = 0;
    return;
  }

  // Normalize wheel deltas to approximately pixels.
  const multiplier =
    e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? section.clientHeight : 1;

  const delta = e.deltaY * multiplier;
  const now = performance.now();

  if (
    now - lastWheelTime > 200 ||
    (wheelAccum !== 0 && Math.sign(wheelAccum) !== Math.sign(delta))
  ) {
    wheelAccum = 0;
  }

  lastWheelTime = now;
  wheelAccum += delta;

  if (Math.abs(wheelAccum) >= props.wheelThreshold) {
    lastActionTime = now;
    wheelAccum = 0;

    triggerGlitch();
    goTo(targetIndex, scrollingDown ? "down" : "up");
  }
}

function handleKeydown(e) {
  if (isAnimating.value || !canTrigger()) return;
  const downKeys = ["ArrowDown", "PageDown", " "];
  const upKeys = ["ArrowUp", "PageUp"];

  if (downKeys.includes(e.key)) {
    e.preventDefault();
    lastActionTime = performance.now();
    triggerGlitch();
    next();
  } else if (upKeys.includes(e.key)) {
    e.preventDefault();
    lastActionTime = performance.now();
    triggerGlitch();
    prev();
  }
}

function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (isAnimating.value || !canTrigger()) return;
  const delta = touchStartY - e.changedTouches[0].clientY;

  if (Math.abs(delta) > 50) {
    lastActionTime = performance.now();
    triggerGlitch();
    delta > 0 ? next() : prev();
  }
}

function handleDotClick(i) {
  if (isAnimating.value || i === currentIndex.value) return;
  lastActionTime = performance.now();
  triggerGlitch();
  goTo(i, i > currentIndex.value ? "down" : "up");
}

onMounted(() => {
  setTransitionDuration(props.transitionDuration);
  resetToTop();

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd);
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", handleWheel);
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", handleTouchEnd);
  if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
});
</script>

<template>
  <div class="scroll-container">
    <div class="scroll-track" :style="trackStyle">
      <slot />
    </div>

    <!-- Advanced glitch transition overlay -->
    <div
      class="scroll-glitch-overlay"
      :class="{ 'is-active': glitchActive, 'is-up': direction === 'up' }"
    >
      <div class="glitch-noise" />

      <div
        v-for="band in bands"
        :key="band.id"
        class="glitch-band"
        :style="band.style"
      />

      <div class="glitch-flash" />
      <div class="glitch-chroma glitch-chroma--left" />
      <div class="glitch-chroma glitch-chroma--right" />

      <div class="glitch-scanbeam" />
    </div>

    <!-- Section navigation dots -->
    <div class="scroll-dots">
      <button
        v-for="(section, i) in sections"
        :key="section.id"
        class="scroll-dots__dot"
        :class="{ 'is-active': i === currentIndex }"
        :aria-label="`Go to section ${i + 1}`"
        @click="handleDotClick(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.scroll-container {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}

.scroll-track {
  display: flex;
  flex-direction: column;
  width: 100%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  will-change: transform;
}

/* ============================================================
   GLITCH TRANSITION OVERLAY — layered effect
============================================================ */
/* ============================================================
   GLITCH TRANSITION OVERLAY — monochrome / app-color only
============================================================ */
.scroll-glitch-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
}

.scroll-glitch-overlay.is-active {
  opacity: 1;
}

/* ---- Layer 1: TV static noise (desaturated) ---- */
.glitch-noise {
  position: absolute;
  inset: -10%;
  opacity: 0;
  filter: grayscale(1) contrast(1.4);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: overlay;
}

.scroll-glitch-overlay.is-active .glitch-noise {
  animation: glitch-noise-flicker 0.5s steps(6, end);
}

@keyframes glitch-noise-flicker {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 0.4;
    background-position: 0 0;
  }
  30% {
    opacity: 0.25;
    background-position: 45px -25px;
  }
  50% {
    opacity: 0.35;
    background-position: -35px 30px;
  }
  70% {
    opacity: 0.18;
    background-position: 25px 55px;
  }
  90% {
    opacity: 0.28;
    background-position: -45px -15px;
  }
}

/* ---- Layer 2: Datamosh bands (blue / white / black only) ---- */
.glitch-band {
  position: absolute;
  left: 0;
  width: 100%;
  mix-blend-mode: screen;
  opacity: 0;
  transform: translateX(0);
}

.scroll-glitch-overlay.is-active .glitch-band {
  animation: glitch-band-move var(--duration) steps(2, end) var(--delay);
}

@keyframes glitch-band-move {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  15% {
    opacity: 1;
    transform: translateX(var(--offset));
  }
  40% {
    opacity: 0.75;
    transform: translateX(calc(var(--offset) * -1));
  }
  70% {
    opacity: 0.4;
    transform: translateX(calc(var(--offset) * 0.4));
  }
  100% {
    opacity: 0;
    transform: translateX(0);
  }
}

/* ---- Layer 3: single accent flash pulse (no rainbow) ---- */
.glitch-flash {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: var(--eyebrow-color, #3b82f6);
  mix-blend-mode: screen;
}

.scroll-glitch-overlay.is-active .glitch-flash {
  animation: glitch-flash-pulse 0.45s ease-out;
}

@keyframes glitch-flash-pulse {
  0% {
    opacity: 0;
  }
  8% {
    opacity: 0.22;
  }
  20% {
    opacity: 0.05;
  }
  100% {
    opacity: 0;
  }
}

/* ---- Layer 4: subtle chromatic edge split (very faint, blue-only) ---- */
.glitch-chroma {
  position: absolute;
  inset: 0;
  opacity: 0;
  mix-blend-mode: screen;
  background: var(--eyebrow-color, #3b82f6);
}

.glitch-chroma--left {
  clip-path: inset(0 60% 0 0);
}
.glitch-chroma--right {
  clip-path: inset(0 0 0 60%);
}

.scroll-glitch-overlay.is-active .glitch-chroma--left {
  animation: glitch-chroma-shift-left 0.4s steps(3, end);
}
.scroll-glitch-overlay.is-active .glitch-chroma--right {
  animation: glitch-chroma-shift-right 0.4s steps(3, end);
}

@keyframes glitch-chroma-shift-left {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  30% {
    opacity: 0.12;
    transform: translateX(-6px);
  }
  60% {
    opacity: 0.06;
    transform: translateX(4px);
  }
  100% {
    opacity: 0;
    transform: translateX(0);
  }
}

@keyframes glitch-chroma-shift-right {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  30% {
    opacity: 0.12;
    transform: translateX(6px);
  }
  60% {
    opacity: 0.06;
    transform: translateX(-4px);
  }
  100% {
    opacity: 0;
    transform: translateX(0);
  }
}

/* ---- Layer 5: CRT scan beam sweep (unchanged, already on-brand) ---- */
.glitch-scanbeam {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  top: -5%;
  opacity: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--eyebrow-color, #3b82f6),
    transparent
  );
  box-shadow: 0 0 24px 5px var(--eyebrow-color, #3b82f6);
}

.scroll-glitch-overlay.is-active .glitch-scanbeam {
  animation: glitch-scanbeam-sweep 0.7s cubic-bezier(0.6, 0, 0.4, 1);
}

.scroll-glitch-overlay.is-active.is-up .glitch-scanbeam {
  animation-direction: reverse;
}

@keyframes glitch-scanbeam-sweep {
  0% {
    top: -5%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    top: 50%;
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 105%;
    opacity: 0;
  }
}

/* ---- Section nav dots ---- */
.scroll-dots {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.scroll-dots__dot {
  width: 8px;
  height: 8px;
  border: 1px solid var(--eyebrow-color, #3b82f6);
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
}

.scroll-dots__dot.is-active {
  background: var(--eyebrow-color, #3b82f6);
  height: 22px;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
}

@media (max-width: 768px) {
  .scroll-dots {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-track {
    transition: none;
  }
  .scroll-glitch-overlay {
    display: none;
  }
}
</style>
