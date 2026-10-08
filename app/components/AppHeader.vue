<script setup>
const { c, localePath, rtl } = usePortfolioI18n();
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useScrollSections } from "~/composables/useScrollSections";

const routeBaseName = useRouteBaseName();
const links = computed(() => [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Resume", to: "/resume" },
].map((link) => ({ ...link, label: c(link.label), to: localePath(link.to) })));

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
  const name = String(routeBaseName() || "index");
  if (name.startsWith("projects-")) return c("Projects");
  if (name !== "index") return c({ about: "About", projects: "Projects", resume: "Resume", contact: "Contact" }[name] || "Home");
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
          :aria-label="c('Open menu')"
        >
          <q-menu
            class="app-header-menu"
            anchor="bottom start"
            self="top start"
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
                  <AnimationGlitchText :text="c(link.label)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <div class="app-header__identity" :aria-label="c('Arsam Sarkhosh portfolio')">
          <span class="app-header__monogram" aria-hidden="true">{{ c("A/S") }}</span>
          <span class="app-header__identity-copy gt-sm">
            <strong>{{ c("Arsam Sarkhosh") }}</strong>
            <small>{{ c("PORTFOLIO NODE") }}</small>
          </span>
        </div>

        <nav class="gt-sm" :aria-label="c('Main')">
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
              :exact="link.to !== localePath('/projects') && (route.path !== link.to || !route.hash)"
              class="nav-link"
            >
              <AnimationGlitchText :text="c(link.label)" />
            </q-route-tab>
          </q-tabs>
        </nav>

        <q-space />

        <div class="app-header__telemetry gt-md" aria-hidden="true">
          <span class="app-header__telemetry-state">
            <i />{{ c("ONLINE") }}</span>
          <span class="app-header__telemetry-route">
            <template v-if="routeBaseName() === 'index' && sections.length"><bdi dir="ltr">{{ sectionCounter }}</bdi> </template>// {{ currentLabel.toUpperCase() }}
          </span>
        </div>

        <AppLanguageControl />
        <AppMusicControl />

        <q-btn
          class="cta"
          unelevated
          no-caps
          no-ripple
          :to="localePath('/contact')"
          :aria-label="c('Get in touch')"
        >
          <span class="gt-xs"><AnimationGlitchText :text="c('Get in touch')" /></span>
          <q-icon class="lt-sm" name="mail_outline" size="22px" aria-hidden="true" />
          <q-tooltip class="lt-sm">{{ c("Get in touch") }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <div class="app-header__progress" aria-hidden="true">
        <div class="app-header__progress-track" :class="{ 'app-header__progress-track--rtl': rtl }">
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
