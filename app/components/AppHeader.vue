<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useScrollSections } from "~/composables/useScrollSections";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Resume", to: "/resume" },
];

const menuIcon = "M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z";

const { sections, currentIndex } = useScrollSections();

const isDocked = computed(() => currentIndex.value > 0);

const progress = computed(() => {
  const total = sections.length - 1;
  if (total <= 0) return 0;
  return (currentIndex.value / total) * 100;
});

const route = useRoute();
const activeTab = ref(route.path);
watch(
  () => route.path,
  (p) => (activeTab.value = p),
);

const currentLabel = computed(() => {
  if (route.path !== "/") return route.path.slice(1) || "home";
  return sections[currentIndex.value]?.id || "hero";
});

const sectionCounter = computed(
  () =>
    `${String(currentIndex.value + 1).padStart(2, "0")}/${String(
      sections.length,
    ).padStart(2, "0")}`,
);
</script>

<template>
  <q-header class="app-header" :class="{ 'is-docked': isDocked }">
    <div class="app-header__panel">
      <span class="app-header__corner app-header__corner--tl" aria-hidden="true" />
      <span class="app-header__corner app-header__corner--br" aria-hidden="true" />

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

        <div class="app-header__identity" aria-label="Arsam Sarkhosh portfolio">
          <span class="app-header__monogram" aria-hidden="true">A/S</span>
          <span class="app-header__identity-copy gt-sm">
            <strong>ARSAM.SYS</strong>
            <small>PORTFOLIO NODE</small>
          </span>
        </div>

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
            >
              <AnimationGlitchText :text="link.label" />
            </q-route-tab>
          </q-tabs>
        </nav>

        <q-space />

        <div class="app-header__telemetry gt-md" aria-hidden="true">
          <span class="app-header__telemetry-state">
            <i /> ONLINE
          </span>
          <span class="app-header__telemetry-route">
            {{ sectionCounter }} // {{ currentLabel.toUpperCase() }}
          </span>
        </div>

        <AppMusicControl class="q-mr-sm" />

        <q-btn
          class="cta"
          unelevated
          no-caps
          no-ripple
          to="/contact"
        >
          <AnimationGlitchText text="Get in touch" />
        </q-btn>
      </q-toolbar>

      <div class="app-header__progress" aria-hidden="true">
        <div class="app-header__progress-track">
          <div
            class="app-header__progress-bar"
            :style="{ width: progress + '%' }"
          />
          <span
            v-for="(_, index) in sections"
            :key="index"
            class="app-header__progress-node"
            :class="{ 'is-passed': index <= currentIndex }"
            :style="{ left: `${(index / Math.max(sections.length - 1, 1)) * 100}%` }"
          />
        </div>
      </div>
    </div>
  </q-header>
</template>

<style scoped>
.app-header {
  --header-bg: #050a12;
  --text: #f8fafc;
  --accent: #3b82f6;
  --accent-light: #93c5fd;
  --header-cut: 18px;

  background: transparent;
  color: var(--text);
  font-family: var(--ui-font, "Chakra Petch", monospace);
  padding: 16px 12px 0;
}

.app-header__panel {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(59 130 246 / 0.075) 1px, transparent 1px) 0 0 / 24px 100%,
    linear-gradient(180deg, rgb(147 197 253 / 0.04), transparent 55%),
    rgb(5 10 18 / 0.86);
  backdrop-filter: blur(16px) saturate(135%);
  -webkit-backdrop-filter: blur(16px) saturate(135%);
  border: 1px solid rgb(59 130 246 / 0.32);
  clip-path: polygon(
    var(--header-cut) 0,
    100% 0,
    100% calc(100% - var(--header-cut)),
    calc(100% - var(--header-cut)) 100%,
    0 100%,
    0 var(--header-cut)
  );
  box-shadow:
    inset 0 0 28px rgb(59 130 246 / 0.055),
    0 12px 38px -16px rgb(0 0 0 / 0.9);
  transition:
    background 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

.app-header__panel::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  opacity: 0.32;
  background: repeating-linear-gradient(
    to bottom,
    rgb(255 255 255 / 0.025) 0 1px,
    transparent 1px 4px
  );
}

.app-header__panel::after {
  content: "";
  position: absolute;
  z-index: 0;
  top: 0;
  bottom: 0;
  width: 22%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(59 130 246 / 0.11), transparent);
  transform: translateX(-120%);
  animation: header-scan 7s linear infinite;
}

.app-header.is-docked .app-header__panel {
  background:
    linear-gradient(90deg, rgb(59 130 246 / 0.07) 1px, transparent 1px) 0 0 / 24px 100%,
    linear-gradient(180deg, rgb(147 197 253 / 0.045), transparent 55%),
    rgb(5 10 18 / 0.96);
  border-color: rgb(59 130 246 / 0.52);
  box-shadow:
    inset 0 0 34px rgb(59 130 246 / 0.08),
    0 12px 42px -14px rgb(0 0 0 / 0.92),
    0 0 26px -10px rgb(59 130 246 / 0.65);
}

.app-header__bar {
  position: relative;
  z-index: 2;
  min-height: 72px;
  gap: clamp(8px, 1vw, 16px);
  padding: 0 18px 8px 20px;
}

.app-header__corner {
  position: absolute;
  z-index: 3;
  width: 22px;
  height: 22px;
  pointer-events: none;
}

.app-header__corner--tl {
  top: 5px;
  left: 5px;
  border-top: 1px solid var(--accent-light);
  border-left: 1px solid var(--accent-light);
  clip-path: polygon(8px 0, 100% 0, 100% 1px, 9px 1px, 1px 9px, 1px 100%, 0 100%, 0 8px);
}

.app-header__corner--br {
  right: 5px;
  bottom: 5px;
  border-right: 1px solid var(--accent-light);
  border-bottom: 1px solid var(--accent-light);
}

.app-header__identity {
  display: flex;
  align-items: center;
  flex: none;
  gap: 10px;
}

.app-header__monogram {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  color: var(--accent-light);
  background: rgb(59 130 246 / 0.1);
  border: 1px solid rgb(59 130 246 / 0.42);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-shadow: 0 0 10px rgb(59 130 246 / 0.7);
}

.app-header__identity-copy {
  display: grid;
  line-height: 1.05;
}

.app-header__identity-copy strong {
  font-family: var(--title-font, sans-serif);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.app-header__identity-copy small {
  margin-top: 5px;
  font-size: 0.5625rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  color: #64748b;
}

.app-header__telemetry {
  display: grid;
  justify-items: end;
  gap: 4px;
  flex: none;
  padding-right: 4px;
  line-height: 1;
}

.app-header__telemetry-state,
.app-header__telemetry-route {
  font-size: 0.5625rem;
  font-weight: 650;
  letter-spacing: 0.12em;
}

.app-header__telemetry-state {
  color: #22c55e;
}

.app-header__telemetry-state i {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 5px;
  background: currentColor;
  box-shadow: 0 0 7px currentColor;
  animation: header-status 1.4s steps(2, end) infinite;
}

.app-header__telemetry-route {
  color: #64748b;
}

.app-header__nav :deep(.q-tabs__content) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__nav :deep(.q-tab__indicator) {
  display: none;
}

.app-header__burger {
  --button-cut: 8px;

  width: 40px;
  min-width: 40px;
  height: 40px;
  color: var(--accent-light);
  background: rgb(59 130 246 / 0.08);
  border: 1px solid rgb(59 130 246 / 0.3);
}

.app-header__progress {
  position: absolute;
  z-index: 3;
  left: 24px;
  right: 24px;
  bottom: 4px;
  height: 6px;
  pointer-events: none;
}

.app-header__progress-track {
  position: relative;
  top: 2px;
  height: 1px;
  background: rgb(148 163 184 / 0.17);
}

.app-header__progress-bar {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  box-shadow: 0 0 8px rgb(59 130 246 / 0.75);
  transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.app-header__progress-node {
  position: absolute;
  top: 50%;
  width: 5px;
  height: 5px;
  background: #172033;
  border: 1px solid #475569;
  transform: translate(-50%, -50%) rotate(45deg);
  transition: background-color 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.app-header__progress-node.is-passed {
  background: var(--accent);
  border-color: var(--accent-light);
  box-shadow: 0 0 7px rgb(59 130 246 / 0.8);
}

/* nav links: corner brackets that swap and grow on hover/active */
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
}

.nav-link :deep(.q-focus-helper) {
  display: none;
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
}

/* CTA: cut-corner shape with a 2px border ring */
.cta {
  --cut: 14px;
  --bw: 2px;
  --ic: calc(var(--cut) + 1px);
  --button-cut: var(--cut);

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

@keyframes header-scan {
  0%,
  14% {
    transform: translateX(-120%);
  }
  42%,
  100% {
    transform: translateX(560%);
  }
}

@keyframes header-status {
  50% {
    opacity: 0.35;
  }
}

@media (min-width: 1024px) {
  .app-header {
    padding: 20px 24px 0 20px;
  }

  .app-header__bar {
    min-height: 76px;
    padding: 0 28px;
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

@media (max-width: 599px) {
  .app-header {
    --header-cut: 12px;
    padding: 10px 8px 0;
  }

  .app-header__bar {
    min-height: 62px;
    gap: 8px;
    padding: 0 10px 7px;
  }

  .app-header__identity {
    display: none;
  }

  .app-header__progress {
    left: 16px;
    right: 16px;
  }

  .app-header__corner {
    width: 16px;
    height: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__panel,
  .app-header__telemetry-state i {
    transition: none !important;
    animation: none !important;
  }

  .app-header__panel::after {
    display: none;
  }
}
</style>

<style>
.app-header-menu {
  min-width: min(230px, calc(100vw - 20px));
  overflow: hidden;
  background:
    linear-gradient(135deg, rgb(59 130 246 / 0.12), transparent 60%),
    #050a12;
  color: #f8fafc;
  border: 1px solid rgb(59 130 246 / 0.5);
  border-top: 2px solid #3b82f6;
  border-radius: 0;
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  box-shadow:
    0 20px 45px rgb(0 0 0 / 0.72),
    0 0 24px rgb(59 130 246 / 0.16);
}

.app-header-menu .q-item {
  min-height: 48px;
  padding: 12px 18px;
  border-bottom: 1px solid rgb(59 130 246 / 0.12);
  font-family: var(--ui-font, monospace);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header-menu .q-item:hover,
.app-header-menu .q-item:focus-visible {
  color: #93c5fd;
  background: rgb(59 130 246 / 0.12);
}

.app-header-menu .q-item.q-router-link--exact-active {
  color: #93c5fd;
  background: rgb(59 130 246 / 0.09);
  box-shadow: inset 3px 0 #3b82f6;
}
</style>
