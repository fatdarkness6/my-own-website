<script setup>
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useScrollSections } from "~/composables/useScrollSections";
import { useSelectSound } from "~/composables/useSelectSound";

const { app } = useRuntimeConfig();

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Resume", to: "/resume" },
];

const menuIcon = "M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z";

const { sections, currentIndex, direction, isAnimating } = useScrollSections();

/* =========================
   dock + progress
========================= */
const isDocked = computed(() => currentIndex.value > 0);

const progress = computed(() => {
  const total = sections.length - 1;
  if (total <= 0) return 0;
  return (currentIndex.value / total) * 100;
});

/* =========================
   (optional) active tab
   - keep ONLY if you're still using v-model on QTabs.
   - if you removed v-model (recommended with QRouteTab), you can delete this block.
========================= */
const route = useRoute();
const activeTab = ref(route.path);
watch(
  () => route.path,
  (p) => (activeTab.value = p),
);

/* =========================
   click sound (shared WebAudio via composable)
========================= */
const { init: initSelectSound, play: playSelect } = useSelectSound();

const SOUND_SRC = `/sound/select-sound.mp3`;
const SOUND_VOLUME = 0.45;

// If your MP3 has leading silence, you can set something like 0.02–0.08
// but start with 0 to avoid chopping the sound.
const SOUND_START_OFFSET = 0;

function playSelectSound() {
  playSelect({
    volume: SOUND_VOLUME,
    offset: SOUND_START_OFFSET,
    delayMs: 0,
  });
}

onMounted(() => {
  // preload/decode once (buffer stays alive across route changes)
  initSelectSound(SOUND_SRC).catch(() => {});
});

/* =========================
   scroll feedback nudge
========================= */
const nudgeActive = ref(false);
const nudgeDir = ref("down");
let nudgeTimer = 0;

watch(isAnimating, (val) => {
  if (!val) return;

  nudgeDir.value = direction.value;

  nudgeActive.value = true;
  clearTimeout(nudgeTimer);
  nudgeTimer = window.setTimeout(() => {
    nudgeActive.value = false;
  }, 220);
});

const headerClasses = computed(() => ({
  "is-docked": isDocked.value,
  "is-nudge": nudgeActive.value,
  "is-nudge--down": nudgeActive.value && nudgeDir.value === "down",
  "is-nudge--up": nudgeActive.value && nudgeDir.value === "up",
}));

onBeforeUnmount(() => {
  clearTimeout(nudgeTimer);
  // IMPORTANT: do NOT close AudioContext here (it will cut sounds on navigation)
});
</script>

<template>
  <!-- Quasar-based header (so QLayout knows it's a header) -->
  <header class="app-header" :class="headerClasses" elevated="false">
    <div class="app-header__glow" />
    <div class="app-header__scanlines" />

    <q-toolbar class="app-header__bar">
      <q-btn
        class="lt-md app-header__burger"
        flat
        round
        no-ripple
        :icon="menuIcon"
        aria-label="Open menu"
        @pointerdown="playSelectSound"
        @click="playSelectSound"
      >
        <q-menu
          class="app-header-menu"
          anchor="bottom left"
          self="top left"
          :offset="[0, 16]"
        >
          <q-list>
            <q-item
              v-for="link in links"
              :key="link.to"
              v-close-popup
              clickable
              exact
              :to="link.to"
              @pointerdown="playSelectSound"
              @click="playSelectSound"
            >
              <q-item-section>
                <AnimationGlitchText :text="link.label" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <nav class="gt-sm" aria-label="Main">
        <q-tabs
          v-model="activeTab"
          class="app-header__nav"
          dense
          inline-label
          narrow-indicator
          no-caps
        >
          <q-route-tab
            v-for="link in links"
            :key="link.to"
            :name="link.to"
            :to="link.to"
            exact
            class="nav-link"
            @pointerdown="playSelectSound"
          >
            <AnimationGlitchText :text="link.label" />
          </q-route-tab>
        </q-tabs>
      </nav>

      <q-space />

      <AppMusicControl class="q-mr-sm" />
      <q-btn
        class="cta"
        unelevated
        no-caps
        no-ripple
        to="/contact"
        @pointerdown="playSelectSound"
        @click="playSelectSound"
      >
        <AnimationGlitchText text="Get in touch" />
      </q-btn>
    </q-toolbar>

    <span class="app-header__corner app-header__corner--tl" />
    <span class="app-header__corner app-header__corner--br" />

    <div class="app-header__progress" aria-hidden="true">
      <div
        class="app-header__progress-bar"
        :style="{ width: progress + '%' }"
      />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  --header-bg: #161b22;
  --text: #f8fafc;
  --accent: #3b82f6;
  --accent-light: #67a2ff;

  position: fixed; /* keep your behavior */
  top: 16px !important;
  left: 12px !important;
  right: 12px !important;

  z-index: 100;
  margin: 0;
  background: rgba(22, 27, 34, 0.72);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  color: var(--text);
  overflow: hidden;

  border-radius: 0 56px 0px 28px !important;
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(59, 130, 246, 0.12),
    0 8px 30px -10px rgba(0, 0, 0, 0.6),
    0 0 24px -6px rgba(59, 130, 246, 0.25);

  /* corner/backdrop-filter rendering fix (doesn't change the look) */
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);

  transition:
    background 0.4s ease,
    box-shadow 0.4s ease,
    transform 0.22s ease;
}

/* little motion on snap scroll */
.app-header.is-nudge--down {
  transform: translateY(-2px) translateZ(0);
}
.app-header.is-nudge--down .app-header__bar {
  min-height: 66px; /* was 72px */
}
.app-header.is-nudge--up {
  transform: translateY(1px) translateZ(0);
}

.app-header.is-docked {
  background: rgba(22, 27, 34, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(59, 130, 246, 0.22),
    0 10px 34px -8px rgba(0, 0, 0, 0.7),
    0 0 30px -4px rgba(59, 130, 246, 0.4);
}

/* glow */
.app-header__glow {
  position: absolute;
  inset: -40% -10%;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 55% 100% at 15% 50%,
    rgba(59, 130, 246, 0.22),
    transparent 70%
  );
  animation: header-glow-breathe 5s ease-in-out infinite;
}

@keyframes header-glow-breathe {
  0%,
  100% {
    opacity: 0.6;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(6%);
  }
}

/* scanlines */
.app-header__scanlines {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.025) 0 1px,
    transparent 1px 3px
  );
  opacity: 0.5;
}

.app-header__bar {
  position: relative;
  z-index: 2;
  min-height: 72px;
  padding: 0 18px 0 20px;
  transition: min-height 0.22s ease; /* needed for the shrink effect */
}

.app-header__nav :deep(.q-tabs__content) {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* hide Quasar tab indicator line (you already have your own active styling) */
.app-header__nav :deep(.q-tab__indicator) {
  display: none;
}

.app-header__burger {
  color: var(--text);
}

/* corners */
.app-header__corner {
  position: absolute;
  z-index: 3;
  width: 14px;
  height: 14px;
  box-sizing: border-box; /* helps prevent border-size corner glitches */
  pointer-events: none;
  opacity: 0.55;
  animation: header-corner-pulse 3.2s ease-in-out infinite;
}

.app-header__corner--tl {
  top: 8px;
  left: 8px;
  border-top: 2px solid var(--accent);
  border-left: 2px solid var(--accent);
}

.app-header__corner--br {
  bottom: 8px;
  right: 8px;
  border-bottom: 2px solid var(--accent);
  border-right: 2px solid var(--accent);
  animation-delay: 1.6s;
}

@keyframes header-corner-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.9;
  }
}

/* progress */
.app-header__progress {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 0;
  height: 2px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.app-header__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  box-shadow: 0 0 8px 1px rgba(59, 130, 246, 0.7);
  transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

/* nav links */
.nav-link {
  position: relative;
  min-height: 42px;
  padding: 0 22px;
  border-radius: 0;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  overflow: hidden;
  isolation: isolate;
}

.nav-link :deep(.q-focus-helper) {
  display: none;
}

.nav-link__sweep {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(59, 130, 246, 0.35) 50%,
    transparent 70%
  );
  transform: translateX(-120%);
  transition: transform 0.5s ease;
}

.nav-link:hover .nav-link__sweep,
.nav-link:focus-visible .nav-link__sweep {
  transform: translateX(120%);
}

.nav-link::before,
.nav-link::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  transition:
    width 0.2s ease,
    height 0.2s ease,
    opacity 0.2s ease;
  opacity: 0.9;
}

.nav-link::before {
  top: 6px;
  left: 6px;
  border-top: 2px solid var(--accent);
  border-left: 2px solid var(--accent);
}

.nav-link::after {
  right: 6px;
  bottom: 6px;
  border-right: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
}

.nav-link:hover::before,
.nav-link:hover::after,
.nav-link:focus-visible::before,
.nav-link:focus-visible::after,
.nav-link.q-router-link--exact-active::before,
.nav-link.q-router-link--exact-active::after {
  width: 18px;
  height: 18px;
  opacity: 1;
}

.nav-link.q-router-link--exact-active {
  color: var(--accent-light);
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
}

/* CTA (unchanged) */
.cta {
  --cut: 14px;
  --bw: 2px;
  --ic: calc(var(--cut) + 1px);

  position: relative;
  min-height: 44px;
  padding: 0 24px;
  margin-right: 6px;
  border-radius: 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  isolation: isolate;
  animation: cta-idle-pulse 3.4s ease-in-out infinite;
}

@keyframes cta-idle-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(59, 130, 246, 0));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.55));
  }
}

.cta :deep(.q-focus-helper) {
  display: none;
}

.cta :deep(.q-btn__content) {
  position: relative;
  z-index: 2;
}

.cta::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  clip-path: polygon(
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut)
  );
  background: linear-gradient(
    180deg,
    var(--accent-light) 0%,
    var(--accent) 100%
  );
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.cta::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #8cb8ff;
  clip-path: polygon(
    evenodd,
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut),
    var(--cut) 0,
    var(--ic) var(--bw),
    calc(100% - var(--bw)) var(--bw),
    calc(100% - var(--bw)) calc(100% - var(--ic)),
    calc(100% - var(--ic)) calc(100% - var(--bw)),
    var(--bw) calc(100% - var(--bw)),
    var(--bw) var(--ic),
    var(--ic) var(--bw),
    var(--cut) 0
  );
  opacity: 0.95;
}

.cta:hover::before,
.cta:focus-visible::before {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

/* responsive (unchanged) */
@media (min-width: 1024px) {
  .app-header {
    top: 20px !important;
    left: 20px !important;
    right: 24px !important;
  }

  .app-header__bar {
    min-height: 76px;
    padding: 0 28px 0 28px;
  }

  .cta {
    min-height: 46px;
    padding: 0 28px;
  }
}

@media (max-width: 400px) {
  .cta {
    padding: 0 16px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__glow,
  .app-header__corner,
  .cta {
    animation: none !important;
  }
  .nav-link__sweep {
    transition: none !important;
  }
  .app-header {
    transition: none !important;
  }
  .app-header__bar {
    transition: none !important;
  }
}
</style>

<style>
/* unchanged menu styles */
.app-header-menu {
  background: #161b22;
  color: #f8fafc;
  border: 2px solid #3b82f6;
  border-radius: 0 18px 18px 12px;
  min-width: 200px;
}

.app-header-menu .q-item {
  padding: 14px 20px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header-menu .q-item.q-router-link--exact-active {
  color: #3b82f6;
}
</style>
