<script setup lang="ts">
import { aboutCopy } from "~/assets/data/about";

useSeoMeta({
  title: "About Arsam Sarkhosh — Full-Stack Engineer",
  description:
    "Learn how Arsam Sarkhosh builds Vue and Nuxt applications, Node.js and Python APIs, and AI-powered systems with a distinct visual identity.",
});

const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(
  ["label", "title", "intro"],
  { onceKey: "about-identity" },
);
const heroTitle = [
  { text: "BEHIND THE ", glitch: false },
  { text: "SIGNAL.", accent: true, interval: 7400 },
];

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
    <a class="dossier-skip" href="#origin">Skip to my story</a>
    <div class="dossier-filebar">
      <span>PERSONNEL FILE / AS-001</span>
      <span class="dossier-filebar__state">
        <i aria-hidden="true" />
        OPEN FOR EXPLORATION
      </span>
    </div>
    <section class="dossier-identity" aria-labelledby="about-title">
      <div class="dossier-identity__copy">
        <p class="dossier-label">
          <AnimationTypedLine
            text="// ACCESSING THE PERSON BEHIND THE PIXELS"
            :speed="12"
            v-bind="line('label')"
          />
        </p>
        <h1 id="about-title" class="dossier-title">
          <AnimationSegmentedLine :segments="heroTitle" :speed="28" v-bind="line('title')" />
        </h1>
        <p class="dossier-identity__intro">
          <AnimationTypedLine :text="aboutCopy.intro" :speed="12" v-bind="line('intro')" />
        </p>
        <p class="dossier-body dossier-identity__summary">{{ aboutCopy.summary }}</p>
        <div class="dossier-identity__actions">
          <q-btn
            unelevated
            no-caps
            no-ripple
            href="#origin"
            class="dossier-button dossier-button--primary"
          >
            <AnimationGlitchText text="Explore my story" />
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
              <span class="dossier-label">{{ aboutCopy.role }}</span>
              <h2>{{ aboutCopy.name }}</h2>
            </div>
            <span class="dossier-barcode" aria-hidden="true" />
          </div>
        </AnimationGlitchCard>
        <div class="dossier-portrait__footnote">
          <span>IDENTITY: SELF-DEFINED</span>
          <span>[ A/S ]</span>
        </div>
      </CommonHackerReveal>
    </section>
    <nav class="dossier-index" aria-label="About page chapters">
      <span class="dossier-label dossier-index__label">FILE CONTENTS</span>
      <q-btn
        v-for="chapter in aboutCopy.chapters"
        :key="chapter.id"
        flat
        no-caps
        no-ripple
        :href="`#${chapter.id}`"
        class="dossier-index__link"
      >
        <span class="dossier-accent">{{ chapter.number }}</span>
        {{ chapter.label }}
        <q-icon name="south_east" size="16px" aria-hidden="true" />
      </q-btn>
    </nav>
    <AboutChapter :chapter="aboutCopy.chapters[0]!">
      <AboutJourney />
    </AboutChapter>
    <AboutChapter :chapter="aboutCopy.chapters[1]!">
      <div class="dossier-principles">
        <q-card
          v-for="principle in aboutCopy.principles"
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
        The goal: an experience that feels considered, from the first interaction to the code underneath.
      </p>
    </AboutChapter>
    <AboutChapter :chapter="aboutCopy.chapters[2]!">
      <p class="dossier-body dossier-section-intro">Different tools, connected responsibilities. Select a node to see where it fits.</p>
      <AboutToolkit />
    </AboutChapter>
    <AboutChapter :chapter="aboutCopy.chapters[3]!">
      <div class="dossier-human">
        <div class="dossier-human__quote">
          <span class="dossier-label">PERSONAL NOTE / 001</span>
          <blockquote>{{ aboutCopy.personal.quote }}</blockquote>
          <span class="dossier-human__signature">— ARSAM</span>
        </div>
        <div class="dossier-human__copy">
          <p class="dossier-body">{{ aboutCopy.personal.text }}</p>
          <div class="dossier-tags">
            <q-badge v-for="interest in aboutCopy.personal.interests" :key="interest" outline>{{ interest }}</q-badge>
          </div>
          <p class="dossier-label dossier-human__note">{{ aboutCopy.personal.note }}</p>
        </div>
      </div>
    </AboutChapter>
    <footer class="dossier-exit">
      <div>
        <p class="dossier-label">// END OF FILE. START OF A CONVERSATION.</p>
        <h2 class="section-title">
          WHAT DO WE
          <span class="dossier-accent">BUILD NEXT?</span>
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
          <AnimationGlitchText text="Open a channel" />
          <q-icon name="north_east" size="18px" aria-hidden="true" />
        </q-btn>
        <q-btn to="/projects" flat no-caps no-ripple class="dossier-button">
          <AnimationGlitchText text="Explore projects" />
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
