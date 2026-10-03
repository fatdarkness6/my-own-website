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
              :exact="route.path !== link.to || !route.hash"
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
            <template v-if="route.path === '/' && sections.length">{{ sectionCounter }} </template>// {{ currentLabel.toUpperCase() }}
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

<style scoped src="~/assets/css/components/appHeader.css"></style>

<style src="~/assets/css/components/appHeaderMenu.css"></style>
