<script setup lang="ts">
import { aboutPageCopy } from "~/assets/data/aboutPage";

useSeoMeta({
  title: "About Arsam Sarkhosh — Full-Stack Engineer",
  description:
    "Full-stack engineer specializing in Vue, Nuxt, Node.js and Python. Explore frontend systems, backend APIs, databases, AI integrations and production delivery.",
});

const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(
  ["label", "title", "intro"],
  { onceKey: "about-identity" },
);

watch(
  introReady,
  (ready) => {
    if (!ready || !import.meta.client) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) complete();
    else play();
  },
  { immediate: true },
);
</script>

<template>
  <article id="about-main" class="dossier">
    <a class="dossier-skip" href="#profile">Skip to engineering profile</a>
    <div class="dossier-filebar">
      <span>PERSONNEL FILE / AS-001</span>
      <span class="dossier-filebar__state">
        <i aria-hidden="true" />
        ENGINEERING PROFILE
      </span>
    </div>
    <section class="dossier-identity" aria-labelledby="about-title">
      <div class="dossier-identity__copy">
        <p class="dossier-label">
          <AnimationTypedLine
            :text="aboutPageCopy.label"
            :speed="12"
            v-bind="line('label')"
          />
        </p>
        <h1 id="about-title" class="dossier-title">
          <AnimationSegmentedLine :segments="aboutPageCopy.title" :speed="28" v-bind="line('title')" />
        </h1>
        <p class="dossier-identity__intro">
          <AnimationTypedLine :text="aboutPageCopy.intro" :speed="12" v-bind="line('intro')" />
        </p>
        <p class="dossier-body dossier-identity__summary">{{ aboutPageCopy.summary }}</p>
        <div class="dossier-identity__actions">
          <q-btn
            unelevated
            no-caps
            no-ripple
            href="#profile"
            class="dossier-button dossier-button--primary"
          >
            <AnimationGlitchText text="Explore engineering profile" />
            <q-icon name="south" size="18px" aria-hidden="true" />
          </q-btn>
          <span class="dossier-label dossier-muted">SCROLL TO DECODE</span>
        </div>
      </div>
      <CommonHackerReveal :show="started" :duration="680" class="dossier-identity__visual">
        <AnimationGlitchCard
          image="/images/background.png"
          alt="Stylized portrait of Arsam Sarkhosh with blue light effects"
          :interval="10000"
          class="dossier-portrait"
        >
          <template #media>
            <span class="dossier-portrait__label">SUBJECT / AS-001</span>
            <span class="dossier-portrait__marker" aria-hidden="true">+</span>
          </template>
          <div class="dossier-portrait__caption">
            <div>
              <span class="dossier-label">{{ aboutPageCopy.role }}</span>
              <h2>{{ aboutPageCopy.name }}</h2>
            </div>
            <span class="dossier-barcode" aria-hidden="true" />
          </div>
        </AnimationGlitchCard>
        <div class="dossier-portrait__footnote">
          <span>VUE / NUXT → FULL-STACK DELIVERY</span>
          <span>[ A/S ]</span>
        </div>
      </CommonHackerReveal>
    </section>
    <nav class="dossier-index" aria-label="About page chapters">
      <span class="dossier-label dossier-index__label">FILE CONTENTS</span>
      <q-btn
        v-for="chapter in aboutPageCopy.chapters"
        :key="chapter.id"
        flat
        no-caps
        no-ripple
        :href="`#${chapter.id}`"
        class="dossier-index__link"
      >
        <span class="dossier-accent">{{ chapter.number }}</span>
        <span class="dossier-index__text">{{ chapter.label }}</span>
        <q-icon name="south_east" size="16px" aria-hidden="true" />
      </q-btn>
    </nav>
    <AboutChapter :chapter="aboutPageCopy.chapters.profile">
      <AboutProfile />
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.capabilities">
      <AboutCapabilities />
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.method">
      <div class="dossier-principles">
        <q-card
          v-for="principle in aboutPageCopy.principles"
          :key="principle.code"
          flat
          square
          class="dossier-principle"
        >
          <q-card-section>
            <div class="dossier-principle__meta">
              <span class="dossier-label">
                {{ principle.number }}
                /
                {{ principle.code }}
              </span>
              <q-icon :name="principle.icon" size="26px" aria-hidden="true" />
            </div>
            <h3>{{ principle.title }}</h3>
            <p class="dossier-body">{{ principle.text }}</p>
          </q-card-section>
          <span class="dossier-principle__trace" aria-hidden="true" />
        </q-card>
      </div>
      <p class="dossier-method-note">
        <span class="dossier-accent">↳</span>
        Build from zero. Understand existing systems. Improve what is already running.
      </p>
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.toolkit">
      <p class="dossier-body dossier-section-intro">Select a layer to see how I use its tools across production applications and ongoing development.</p>
      <AboutToolkit />
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.systems">
      <AboutSelectedSystems />
    </AboutChapter>
    <footer class="dossier-exit">
      <div>
        <p class="dossier-label">// PROJECTS / EXPERIENCE / CONTACT</p>
        <h2 class="section-title">
          EXPLORE THE WORK.
          <span class="dossier-accent">LET'S TALK.</span>
        </h2>
      </div>
      <div class="dossier-exit__actions">
        <q-btn
          to="/contact"
          unelevated
          no-caps
          no-ripple
          class="dossier-button dossier-button--primary"
        >
          <AnimationGlitchText text="Contact" />
          <q-icon name="north_east" size="18px" aria-hidden="true" />
        </q-btn>
        <q-btn to="/projects" flat no-caps no-ripple class="dossier-button">
          <AnimationGlitchText text="View projects" />
          <q-icon name="east" size="18px" aria-hidden="true" />
        </q-btn>
        <q-btn to="/resume" flat no-caps no-ripple class="dossier-button dossier-button--quiet">
          <AnimationGlitchText text="View résumé" />
        </q-btn>
      </div>
      <div class="dossier-exit__bottom">
        <span>ARSAM SARKHOSH / FULL-STACK ENGINEER</span>
        <a href="#about-main">BACK TO TOP ↑</a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/about.css"></style>
