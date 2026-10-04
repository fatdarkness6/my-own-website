<script setup>
const { c, localePath } = usePortfolioI18n();
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
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
  resetToTop,
} = useScrollSections();
const containerEl = ref(null);
const glitchActive = ref(false);
const bands = ref([]);
const NUM_BANDS = 18;
const EDGE_EPSILON = 2;

let lastActionTime = -Infinity;
let wheelAccum = 0;
let lastWheelTime = 0;
let wheelAxis = null;
let wheelConsumed = false;
let touch = null;
let glitchTimeoutId;
let glitchRaf = 0;

// Percentages reference the track's explicit height: exactly one panel.
// Resizing changes that reference height without changing the section index.
const trackStyle = computed(() => ({
  transform: `translate3d(0, -${currentIndex.value * 100}%, 0)`,
  transitionDuration: `${props.transitionDuration}ms`,
}));

watch(
  () => props.transitionDuration,
  (ms) => setTransitionDuration(ms),
);

function canTrigger() {
  return performance.now() - lastActionTime >= props.cooldown;
}
function activeSection() {
  return sections[currentIndex.value]?.el ?? null;
}
function insideActive(target) {
  return target instanceof Node && !!activeSection()?.contains(target);
}
function canScroll(el, dir) {
  const max = el.scrollHeight - el.clientHeight;
  if (max <= EDGE_EPSILON) return false;
  return dir > 0
    ? el.scrollTop < max - EDGE_EPSILON
    : el.scrollTop > EDGE_EPSILON;
}
function findScrollable(target, dir) {
  const section = activeSection();
  if (!section) return null;
  let node =
    target instanceof Element && section.contains(target) ? target : section;
  while (node) {
    if (node instanceof HTMLElement) {
      const allowsScroll = /^(auto|scroll|overlay)$/.test(
        getComputedStyle(node).overflowY,
      );
      if ((node === section || allowsScroll) && canScroll(node, dir))
        return node;
    }
    if (node === section) break;
    node = node.parentElement;
  }
  return null;
}
function navigateTo(index) {
  if (isAnimating.value || !canTrigger()) return false;
  if (index < 0 || index >= sections.length || index === currentIndex.value)
    return false;
  const dir = index > currentIndex.value ? "down" : "up";
  const target = sections[index].el;
  // Forward navigation enters at the top; backward navigation at the bottom
  // of any section-level overflow. Nested project card positions are retained.
  target.scrollTop =
    dir === "down" ? 0 : Math.max(0, target.scrollHeight - target.clientHeight);
  lastActionTime = performance.now();
  wheelAccum = 0;
  goTo(index, dir);
  triggerGlitch();
  return true;
}

function generateBands() {
  bands.value = Array.from({ length: NUM_BANDS }, (_, i) => {
    const roll = Math.random();
    return {
      id: `${i}-${Math.random()}`,
      style: {
        top: `${(i / NUM_BANDS) * 100 + Math.random() * (100 / NUM_BANDS) * 0.25}%`,
        height: `${100 / NUM_BANDS + Math.random() * 1.5}%`,
        background:
          roll < 0.45
            ? "rgba(59, 130, 246, 0.45)"
            : roll < 0.75
              ? "rgba(248, 250, 252, 0.18)"
              : "rgba(0, 0, 0, 0.55)",
        "--offset": `${(Math.random() - 0.5) * 120}px`,
        "--delay": `${(Math.random() * 0.15).toFixed(3)}s`,
        "--duration": `${(0.26 + Math.random() * 0.26).toFixed(3)}s`,
      },
    };
  });
}
function triggerGlitch() {
  generateBands();
  glitchActive.value = false;
  cancelAnimationFrame(glitchRaf);
  glitchRaf = requestAnimationFrame(() => {
    glitchActive.value = true;
  });
  clearTimeout(glitchTimeoutId);
  glitchTimeoutId = window.setTimeout(() => {
    glitchActive.value = false;
  }, 760);
}

function handleWheel(e) {
  if (e.defaultPrevented || e.ctrlKey || (!e.deltaX && !e.deltaY)) return;
  const now = performance.now();
  if (now - lastWheelTime > 180) {
    wheelAxis = null;
    wheelConsumed = false;
    wheelAccum = 0;
  }
  lastWheelTime = now;
  if (!wheelAxis)
    wheelAxis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y";
  // Keep sideways trackpad gestures native, including diagonal tails.
  if (wheelAxis === "x" || !e.deltaY) return;
  if (isAnimating.value || wheelConsumed) {
    e.preventDefault();
    return;
  }
  if (!insideActive(e.target)) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  // A card body or oversized section gets to consume scrolling first.
  if (findScrollable(e.target, dir)) {
    wheelAccum = 0;
    return;
  }
  e.preventDefault();
  if (!canTrigger()) {
    wheelAccum = 0;
    return;
  }
  const multiplier =
    e.deltaMode === 1
      ? 16
      : e.deltaMode === 2
        ? activeSection().clientHeight
        : 1;
  const delta = e.deltaY * multiplier;
  if (wheelAccum && Math.sign(delta) !== Math.sign(wheelAccum)) wheelAccum = 0;
  wheelAccum += delta;
  if (Math.abs(wheelAccum) >= props.wheelThreshold) {
    wheelConsumed = navigateTo(currentIndex.value + dir);
    wheelAccum = 0;
  }
}

function handleKeydown(e) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (
    e.target instanceof Element &&
    e.target.closest(
      'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"]',
    )
  )
    return;
  if (
    e.target !== document.body &&
    e.target !== document.documentElement &&
    !insideActive(e.target)
  )
    return;
  let dir;
  if (["ArrowDown", "PageDown"].includes(e.key)) dir = 1;
  else if (["ArrowUp", "PageUp"].includes(e.key)) dir = -1;
  else if (e.key === " ") dir = e.shiftKey ? -1 : 1;
  else return;
  e.preventDefault();
  if (isAnimating.value) return;
  const scroller = findScrollable(e.target, dir);
  if (scroller) {
    scroller.scrollBy({
      top: dir * (e.key.startsWith("Arrow") ? 48 : scroller.clientHeight * 0.9),
      behavior: "instant",
    });
    return;
  }
  if (!e.repeat) navigateTo(currentIndex.value + dir);
}

function handleTouchStart(e) {
  touch = null;
  if (e.touches.length !== 1 || !insideActive(e.target)) return;
  const point = e.touches[0];
  touch = {
    x: point.clientX,
    y: point.clientY,
    target: e.target,
    mode: null,
    canUp: !!findScrollable(e.target, -1),
    canDown: !!findScrollable(e.target, 1),
    blocked: isAnimating.value,
  };
}
function handleTouchMove(e) {
  if (!touch) return;
  if (e.touches.length !== 1) {
    touch = null;
    return;
  }
  const dx = touch.x - e.touches[0].clientX;
  const dy = touch.y - e.touches[0].clientY;
  if (!touch.mode) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
    if (Math.abs(dx) > Math.abs(dy)) touch.mode = "horizontal";
    else if (touch.blocked) touch.mode = "blocked";
    else
      touch.mode = (dy > 0 ? touch.canDown : touch.canUp) ? "native" : "snap";
  }
  // Never cancel a horizontal card swipe or native internal scrolling.
  if (touch.mode === "horizontal" || touch.mode === "native") return;
  if (e.cancelable) e.preventDefault();
}
function handleTouchEnd(e) {
  const gesture = touch;
  touch = null;
  if (!gesture || gesture.mode !== "snap" || !e.changedTouches.length) return;
  const dy = gesture.y - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 50) return;
  const dir = dy > 0 ? 1 : -1;
  if (!findScrollable(gesture.target, dir))
    navigateTo(currentIndex.value + dir);
}
function handleTouchCancel() {
  touch = null;
}
function handleDotClick(index) {
  navigateTo(index);
}

onMounted(() => {
  setTransitionDuration(props.transitionDuration);
  resetToTop();
  const root = containerEl.value;
  root.addEventListener("wheel", handleWheel, { passive: false });
  root.addEventListener("touchstart", handleTouchStart, { passive: true });
  root.addEventListener("touchmove", handleTouchMove, { passive: false });
  root.addEventListener("touchend", handleTouchEnd);
  root.addEventListener("touchcancel", handleTouchCancel);
  window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
  const root = containerEl.value;
  root?.removeEventListener("wheel", handleWheel);
  root?.removeEventListener("touchstart", handleTouchStart);
  root?.removeEventListener("touchmove", handleTouchMove);
  root?.removeEventListener("touchend", handleTouchEnd);
  root?.removeEventListener("touchcancel", handleTouchCancel);
  window.removeEventListener("keydown", handleKeydown);
  clearTimeout(glitchTimeoutId);
  cancelAnimationFrame(glitchRaf);
});
</script>

<template>
  <div ref="containerEl" class="scroll-container" data-lenis-prevent>
    <!-- one shared hacker background for every section -->
    <AnimationSectionBackground
      :index="currentIndex"
      :scenes="['signal', 'terminal', 'rain', 'circuit', 'radar']"
      :transition-duration="transitionDuration"
      :intensity="0.9"
    />
    <div class="scroll-track" :style="trackStyle"><slot /></div>
    <div
      class="scroll-glitch-overlay"
      :class="{ 'is-active': glitchActive, 'is-up': direction === 'up' }"
      aria-hidden="true"
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
    <div class="scroll-dots">
      <button
        v-for="(section, i) in sections"
        :key="section.id"
        type="button"
        class="scroll-dots__dot"
        :class="{ 'is-active': i === currentIndex }"
        :aria-label="`${c(['Home', 'About', 'Projects', 'Resume', 'Contact'][i] || 'Home')} — ${i + 1}`"
        :aria-current="i === currentIndex ? 'true' : undefined"
        @click="handleDotClick(i)"
      />
    </div>
  </div>
</template>

<style scoped src="~/assets/css/components/scrollContainer.css"></style>
