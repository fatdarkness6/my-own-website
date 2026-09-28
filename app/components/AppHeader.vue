<script setup>
import { computed } from "vue";
import { useScrollSections } from "~/composables/useScrollSections";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Resume", to: "/resume" },
];

const menuIcon = "M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z";

// tie the header's "docked" intensity + progress bar to the scroll system
const { sections, currentIndex } = useScrollSections();

const isDocked = computed(() => currentIndex.value > 0);

const progress = computed(() => {
  const total = sections.length - 1;
  if (total <= 0) return 0;
  return (currentIndex.value / total) * 100;
});
</script>

<template>
  <header class="app-header" :class="{ 'is-docked': isDocked }">
    <!-- ambient glow blob that breathes behind the bar -->
    <div class="app-header__glow" />

    <!-- fine scanline texture overlay, matches the loader's CRT vibe -->
    <div class="app-header__scanlines" />

    <q-toolbar class="app-header__bar">
      <q-btn
        class="lt-md app-header__burger"
        flat
        round
        no-ripple
        :icon="menuIcon"
        aria-label="Open menu"
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
            >
              <q-item-section>
                <AnimationGlitchText :text="link.label" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <nav class="gt-sm app-header__nav" aria-label="Main">
        <q-btn
          v-for="link in links"
          :key="link.to"
          class="nav-link"
          flat
          no-caps
          no-ripple
          exact
          :to="link.to"
        >
          <span class="nav-link__sweep" aria-hidden="true" />
          <AnimationGlitchText :text="link.label" />
        </q-btn>
      </nav>

      <q-space />

      <q-btn class="cta" unelevated no-caps no-ripple to="/contact">
        <AnimationGlitchText text="Get in touch" />
      </q-btn>
    </q-toolbar>

    <!-- animated corner brackets on the whole header shell -->
    <span class="app-header__corner app-header__corner--tl" />
    <span class="app-header__corner app-header__corner--br" />

    <!-- scroll-section progress indicator -->
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

  position: fixed;
  top: 16px;
  left: 12px;
  right: 12px;
  z-index: 100;
  margin: 0;
  background: rgba(22, 27, 34, 0.72);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  color: var(--text);
  overflow: hidden;

  border-radius: 0 56px 56px 28px;
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(59, 130, 246, 0.12),
    0 8px 30px -10px rgba(0, 0, 0, 0.6),
    0 0 24px -6px rgba(59, 130, 246, 0.25);

  transition:
    background 0.4s ease,
    box-shadow 0.4s ease;
}

/* once the user scrolls past hero, the header "docks" and intensifies */
.app-header.is-docked {
  background: rgba(22, 27, 34, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(59, 130, 246, 0.22),
    0 10px 34px -8px rgba(0, 0, 0, 0.7),
    0 0 30px -4px rgba(59, 130, 246, 0.4);
}

/* ---- ambient breathing glow behind the bar ---- */
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

/* ---- subtle CRT scanline texture ---- */
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

/* ---- corner brackets framing the whole header ---- */
.app-header__corner {
  position: absolute;
  z-index: 1;
  width: 14px;
  height: 14px;
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

/* ---- scroll-section progress bar ---- */
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

.app-header__bar {
  position: relative;
  z-index: 2;
  min-height: 72px;
  padding: 0 18px 0 20px;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__burger {
  color: var(--text);
}

/* ---- nav links ---- */
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

/* light sweep that slides across on hover — "power up" feel */
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

/* CTA */
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

.cta__sweep {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: linear-gradient(
    110deg,
    transparent 40%,
    rgba(255, 255, 255, 0.45) 50%,
    transparent 60%
  );
  transform: translateX(-140%);
  transition: transform 0.55s ease;
  mix-blend-mode: overlay;
}

.cta:hover .cta__sweep,
.cta:focus-visible .cta__sweep {
  transform: translateX(140%);
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

/* Responsive */
@media (min-width: 1024px) {
  .app-header {
    top: 20px;
    left: 20px;
    right: 24px;
    border-radius: 0 72px 72px 30px;
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
  .nav-link::before,
  .nav-link::after,
  .cta::before,
  .app-header__glow,
  .app-header__corner,
  .cta {
    animation: none !important;
  }
  .nav-link__sweep,
  .cta__sweep {
    transition: none !important;
  }
}
</style>

<style>
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
