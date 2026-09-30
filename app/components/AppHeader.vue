<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useScrollSections } from "~/composables/useScrollSections";
import { useSelectSound } from "~/composables/useSelectSound";

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

const { init: initSelectSound, play: playSelect } = useSelectSound();
const SOUND_SRC = "/sound/select-sound.mp3";

function playSelectSound() {
  playSelect({ volume: 0.45, offset: 0, delayMs: 0 });
}

onMounted(() => {
  initSelectSound(SOUND_SRC).catch(() => {});
});
</script>

<template>
  <q-header class="app-header" :class="{ 'is-docked': isDocked }">
    <div class="app-header__panel">
      <q-toolbar class="app-header__bar">
        <q-btn
          class="lt-md app-header__burger"
          flat
          round
          no-ripple
          :icon="menuIcon"
          aria-label="Open menu"
          @pointerdown="playSelectSound"
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
        >
          <AnimationGlitchText text="Get in touch" />
        </q-btn>
      </q-toolbar>

      <div class="app-header__progress" aria-hidden="true">
        <div
          class="app-header__progress-bar"
          :style="{ width: progress + '%' }"
        />
      </div>
    </div>
  </q-header>
</template>

<style scoped>
.app-header {
  --header-bg: #161b22;
  --text: #f8fafc;
  --accent: #3b82f6;
  --accent-light: #67a2ff;

  background: transparent;
  color: var(--text);
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
  padding: 16px 12px 0;
}

.app-header__panel {
  position: relative;
  background: rgba(22, 27, 34, 0.72);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-radius: 0 56px 0 28px;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(59, 130, 246, 0.12),
    0 8px 30px -10px rgba(0, 0, 0, 0.6);
  transition:
    background 0.4s ease,
    box-shadow 0.4s ease;
}

.app-header.is-docked .app-header__panel {
  background: rgba(22, 27, 34, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(59, 130, 246, 0.22),
    0 10px 34px -8px rgba(0, 0, 0, 0.7),
    0 0 30px -4px rgba(59, 130, 246, 0.4);
}

.app-header__bar {
  min-height: 72px;
  padding: 0 18px 0 20px;
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
  color: var(--text);
}

.app-header__progress {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.app-header__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
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

@media (prefers-reduced-motion: reduce) {
  .app-header__panel {
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
