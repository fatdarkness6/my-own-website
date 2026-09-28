<script setup>
const props = defineProps({
  maxBootDuration: { type: Number, default: 6000 },
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  typeSpeed: { type: Number, default: 14 }, // ms/char, passed to TypewriterText
});

const bootLines = [
  { label: "Initializing kernel modules", tag: "OK" },
  { label: "Mounting virtual filesystem [/dev/sda1]", tag: "OK" },
  { label: "Establishing secure uplink", tag: "OK" },
  { label: "Scanning for intrusions", tag: "WARN" },
  { label: "Decrypting portfolio assets", tag: "OK" },
  { label: "Compiling UI components", tag: "OK" },
  { label: "Starting arsam-sarkhosh.dev", tag: "OK" },
];

const lineStates = reactive(
  bootLines.map((l) => ({ ...l, tagRevealed: false })),
);
const typewriterRefs = ref([]);

const currentLineIndex = ref(0);
const phase = ref("booting"); // 'booting' | 'ready' | 'bursting' | 'done'
const isTouch = ref(false);
const forcing = ref(false);
const done = ref(false);
const introReady = useState("introReady", () => false);

let maxTimer = 0;
let tagTimer = 0;
let advanceTimer = 0;
let burstTimer = 0;
let audioEl = null;
let restoreScroll = () => {};

function setTypewriterRef(el, index) {
  typewriterRefs.value[index] = el;
}

function onLineTyped(index) {
  if (forcing.value) return; // safety-net already took over

  tagTimer = window.setTimeout(
    () => {
      lineStates[index].tagRevealed = true;
      const nextIndex = index + 1;

      if (nextIndex >= lineStates.length) {
        finishBooting();
        return;
      }

      const pause = 120 + Math.random() * 220;
      advanceTimer = window.setTimeout(() => {
        currentLineIndex.value = nextIndex;
        typewriterRefs.value[nextIndex]?.start();
      }, pause);
    },
    160 + Math.random() * 180,
  );
}

function finishBooting() {
  clearTimeout(maxTimer);
  if (phase.value === "booting") phase.value = "ready";
}

function forceComplete() {
  if (phase.value !== "booting") return;

  forcing.value = true;
  clearTimeout(tagTimer);
  clearTimeout(advanceTimer);

  lineStates.forEach((line, i) => {
    typewriterRefs.value[i]?.finish?.();
    line.tagRevealed = true;
  });

  currentLineIndex.value = lineStates.length - 1;
  finishBooting();
  forcing.value = false;
}

function primeAudio() {
  if (!audioEl) return;
  const node = audioEl.cloneNode();
  node.volume = 0;
  node.play().catch(() => {});
}

function triggerBurst() {
  if (phase.value !== "ready") return;
  primeAudio();
  phase.value = "bursting";

  burstTimer = window.setTimeout(() => {
    done.value = true;
    introReady.value = true;
    restoreScroll();
  }, 420);
}

function handleActivate() {
  triggerBurst();
}

onMounted(() => {
  isTouch.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (props.sound) {
    audioEl = new Audio(props.soundSrc);
    audioEl.preload = "auto";
  }

  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  html.style.overflow = "hidden";
  restoreScroll = () => {
    html.style.overflow = prevOverflow;
  };

  window.addEventListener("keydown", handleActivate);
  window.addEventListener("pointerdown", handleActivate);

  maxTimer = window.setTimeout(() => forceComplete(), props.maxBootDuration);

  window.setTimeout(() => {
    typewriterRefs.value[0]?.start();
  }, 500);
});

onBeforeUnmount(() => {
  clearTimeout(tagTimer);
  clearTimeout(advanceTimer);
  clearTimeout(maxTimer);
  clearTimeout(burstTimer);
  window.removeEventListener("keydown", handleActivate);
  window.removeEventListener("pointerdown", handleActivate);
  restoreScroll();
});
</script>

<template>
  <Transition name="loader-fade">
    <div
      v-if="!done"
      class="loader"
      :class="{ burst: phase === 'bursting' }"
      role="status"
      aria-label="Loading"
    >
      <div class="loader-inner">
        <div class="boot-header">
          <p class="boot-header__line">ARSAM_SARKHOSH_OS [v3.11.24]</p>
          <p class="boot-header__line boot-header__line--dim">
            (c) Full-Stack Systems — All rights reserved.
          </p>
        </div>

        <div class="boot-log">
          <div
            v-for="(line, i) in lineStates"
            v-show="i <= currentLineIndex"
            :key="i"
            class="boot-line"
          >
            <AnimationTypewriterText
              :ref="(el) => setTypewriterRef(el, i)"
              :text="line.label"
              :speed="typeSpeed"
              prefix=""
              :sound="sound"
              :sound-src="soundSrc"
              :cursor="i === currentLineIndex && !line.tagRevealed"
              @done="() => onLineTyped(i)"
            />
            <span
              v-if="line.tagRevealed"
              class="boot-line__dots"
              aria-hidden="true"
            />
            <span
              v-if="line.tagRevealed"
              class="boot-line__tag"
              :class="`boot-line__tag--${line.tag.toLowerCase()}`"
            >
              [{{ line.tag }}]
            </span>
          </div>
        </div>

        <div
          v-if="phase === 'ready' || phase === 'bursting'"
          class="boot-prompt"
        >
          <span
            class="boot-prompt__text"
            data-text="PRESS ENTER OR ANY KEY TO CONTINUE"
          >
            {{
              isTouch
                ? "TAP ANYWHERE TO CONTINUE"
                : "PRESS ENTER OR ANY KEY TO CONTINUE"
            }}
          </span>
          <span class="boot-prompt__cursor">_</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loader {
  --accent: #3b82f6;
  --ok: #22c55e;
  --warn: #f59e0b;
  --mono:
    "JetBrains Mono", "Courier New", ui-monospace, Menlo, Consolas, monospace;

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  cursor: default;
}

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

.loader-inner {
  position: relative;
  z-index: 2;
  width: min(90vw, 620px);
  font-family: var(--mono);
  /* animation: screenJitter 3.4s infinite steps(1); */
}

@keyframes screenJitter {
  0%,
  92%,
  100% {
    transform: translate(0, 0);
  }
  93% {
    transform: translate(-3px, 1px);
  }
  95% {
    transform: translate(3px, -1px);
  }
  97% {
    transform: translate(-2px, -1px);
  }
}

/* ---------- header ---------- */
.boot-header {
  margin-bottom: 18px;
}

.boot-header__line {
  margin: 0 0 4px;
  color: #f8fafc;
  font-size: clamp(12px, 1vw + 8px, 15px);
  letter-spacing: 0.02em;
}

.boot-header__line--dim {
  color: #4b5563;
  font-size: clamp(10px, 0.6vw + 8px, 12px);
}

/* ---------- boot log ---------- */
.boot-log {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 190px;
}

.boot-line :deep(.typewriter__text) {
  color: #e5e7eb;
}

.boot-line :deep(.typewriter__cursor) {
  color: var(--accent);
}
.boot-line :deep(.typewriter) {
  display: inline-flex;
  align-items: baseline;
  flex-shrink: 0;
  white-space: nowrap; /* override the pre-wrap behavior in this context */
}

.boot-line__caret {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 2px;
  background: var(--accent);
  vertical-align: text-bottom;
  animation: caret-blink 0.9s steps(1) infinite;
}

@keyframes caret-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.boot-line__dots {
  flex: 1 1 auto;
  overflow: hidden;
  color: #2a3441;
  letter-spacing: 2px;
}

.boot-line__dots::after {
  content: ".........................................................................";
}

.boot-line__tag {
  flex-shrink: 0;
  font-weight: 700;
  animation: tag-flicker 0.3s steps(2, end);
}

.boot-line__tag--ok {
  color: var(--ok);
}

.boot-line__tag--warn {
  color: var(--warn);
}

@keyframes tag-flicker {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  60% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

/* ---------- prompt ---------- */
.boot-prompt {
  position: relative;
  margin-top: 22px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.boot-prompt__text {
  position: relative;
  font-size: clamp(12px, 1vw + 8px, 15px);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #fff;
  text-shadow:
    -2px 0 rgba(59, 130, 246, 0.8),
    2px 0 rgba(248, 250, 252, 0.3);
}

.boot-prompt__cursor {
  color: var(--accent);
  font-weight: 700;
  animation: caret-blink 0.9s steps(1) infinite;
}

/* burst: quick intensify before fade-out */
.loader.burst .loader-inner {
  animation-duration: 0.5s;
}

.loader.burst .boot-prompt__text {
  text-shadow:
    -4px 0 rgba(59, 130, 246, 1),
    4px 0 rgba(248, 250, 252, 0.6);
}

/* fade-out transition */
.loader-fade-leave-active {
  transition: opacity 0.45s ease;
}
.loader-fade-leave-to {
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 599px) {
  .boot-log {
    min-height: 210px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-inner,
  .boot-line__caret,
  .boot-prompt__cursor,
  .boot-line__tag {
    animation: none !important;
  }
}

.boot-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  width: 100%;
  white-space: nowrap;
  font-size: clamp(11px, 0.8vw + 8px, 14px);
}

.boot-line :deep(.typewriter) {
  display: inline-flex;
  align-items: baseline;
  flex: 0 0 auto;
  white-space: nowrap;
}

.boot-line :deep(.typewriter__text) {
  color: #e5e7eb;
  white-space: nowrap;
}

.boot-line :deep(.typewriter__cursor) {
  color: var(--accent);
}

.boot-line__dots {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  color: #2a3441;
  letter-spacing: 2px;
}

.boot-line__tag {
  flex: 0 0 auto;
  font-weight: 700;
  animation: tag-flicker 0.3s steps(2, end);
}
</style>
