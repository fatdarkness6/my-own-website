<script setup lang="ts">
const { c, localePath, content } = usePortfolioI18n();
import { aboutPageCopy as sourceCopy } from "~/assets/data/aboutPage";
const aboutPageCopy = content(sourceCopy);
const { $lenis } = useNuxtApp();
const introReady = useState("introReady", () => false);
const { activeSection, navigateToSection: scrollToAboutSection } = useSectionHash(
  ["about-main", ...Object.values(sourceCopy.chapters).map((chapter) => chapter.id), "about-exit"],
  {
    enabled: introReady,
    scroll: $lenis ? (top, immediate) => {
      $lenis.resize();
      $lenis.scrollTo(top, { immediate });
    } : undefined,
  },
);

usePortfolioSeo({
  page: "about",
  type: "ProfilePage",
});

const { element, line, started } = useViewportTyping(
  ["label", "title", "intro"],
  { onceKey: "about-identity", viewport: { threshold: 0 } },
);
</script>

<template>
  <article id="about-main" ref="element" class="dossier">
    <AboutBackground :active="started" />
    <a class="dossier-skip" href="#profile" @click="scrollToAboutSection($event, 'profile')">{{ c("Skip to engineering profile") }}</a>
    <div class="dossier-filebar">
      <span>{{ c("PERSONNEL FILE / AS-001") }}</span>
      <span class="dossier-filebar__state">
        <i aria-hidden="true" />{{ c("ENGINEERING PROFILE") }}</span>
    </div>
    <section class="dossier-identity" aria-labelledby="about-title">
      <div class="dossier-identity__copy">
        <p class="dossier-label">
          <AnimationTypedLine
            :text="c(aboutPageCopy.label)"
            :speed="12"
            :glitch="11000"
            v-bind="line('label')"
          />
        </p>
        <h1 id="about-title" class="dossier-title">
          <AnimationSegmentedLine
            :segments="aboutPageCopy.title"
            :speed="28"
            v-bind="line('title')"
          />
        </h1>
        <p class="dossier-identity__intro">
          <AnimationTypedLine
            :text="c(aboutPageCopy.intro)"
            :speed="12"
            :glitch="12000"
            v-bind="line('intro')"
          />
        </p>
        <p class="dossier-body dossier-identity__summary">
          <CommonPageGlitch :text="c(aboutPageCopy.summary)" :interval="14000" />
        </p>
        <div class="dossier-identity__actions">
          <q-btn
            unelevated
            no-caps
            no-ripple
            href="#profile"
            class="dossier-button dossier-button--primary"
            @click="scrollToAboutSection($event, 'profile')"
          >
            <AnimationGlitchText :text="c('Explore engineering profile')" />
            <q-icon name="south" size="18px" aria-hidden="true" />
          </q-btn>
          <span class="dossier-label dossier-muted">{{ c("SCROLL TO DECODE") }}</span>
        </div>
      </div>
      <CommonHackerReveal
        :show="started"
        :duration="680"
        class="dossier-identity__visual"
      >
        <AnimationGlitchCard
          image="/images/arsam-sarkhosh-about.png"
          :alt="c('Stylized portrait of Arsam Sarkhosh with blue light effects')"
          :interval="10000"
          class="dossier-portrait"
        >
          <template #media>
            <span class="dossier-portrait__label">{{ c("SUBJECT / AS-001") }}</span>
            <span class="dossier-portrait__marker" aria-hidden="true">+</span>
          </template>
          <div class="dossier-portrait__caption">
            <div>
              <span class="dossier-label">{{ aboutPageCopy.role }}</span>
              <h2><CommonPageGlitch :text="c(aboutPageCopy.name)" /></h2>
            </div>
            <span class="dossier-barcode" aria-hidden="true" />
          </div>
        </AnimationGlitchCard>
        <div class="dossier-portrait__footnote">
          <span>{{ c("INTERFACES / APIs / DEPLOYMENT") }}</span>
          <span>{{ c("[ A/S ]") }}</span>
        </div>
      </CommonHackerReveal>
    </section>
    <nav class="dossier-index" :aria-label="c('About page chapters')">
      <span class="dossier-label dossier-index__label">{{ c("FILE CONTENTS") }}</span>
      <q-btn
        v-for="chapter in aboutPageCopy.chapters"
        :key="chapter.id"
        flat
        no-caps
        no-ripple
        :href="`#${chapter.id}`"
        :aria-current="activeSection === chapter.id ? 'location' : undefined"
        class="dossier-index__link"
        @click="scrollToAboutSection($event, chapter.id)"
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
            <h3><CommonPageGlitch :text="c(principle.title)" /></h3>
            <p class="dossier-body">{{ principle.text }}</p>
          </q-card-section>
          <span class="dossier-principle__trace" aria-hidden="true" />
        </q-card>
      </div>
      <p class="dossier-method-note">
        <span class="dossier-accent">↳</span>{{ c("Build from zero. Understand existing systems. Improve what is already running.") }}</p>
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.toolkit">
      <p class="dossier-body dossier-section-intro">{{ c("Select a layer to see how I use its tools across production applications and ongoing development.") }}</p>
      <AboutToolkit />
    </AboutChapter>
    <AboutChapter :chapter="aboutPageCopy.chapters.systems">
      <AboutSelectedSystems />
    </AboutChapter>
    <footer id="about-exit" class="dossier-exit">
      <div>
        <p class="dossier-label">{{ c("// PROJECTS / EXPERIENCE / CONTACT") }}</p>
        <h2 class="section-title">
          <CommonPageGlitch :text="c('EXPLORE THE WORK.')" />
          <span class="dossier-accent"
            ><CommonPageGlitch :text="c('LET\'S TALK.')" :interval="10000"
          /></span>
        </h2>
      </div>
      <div class="dossier-exit__actions">
        <q-btn
          :to="localePath('/contact')"
          unelevated
          no-caps
          no-ripple
          class="dossier-button dossier-button--primary"
        >
          <AnimationGlitchText :text="c('Contact')" />
          <q-icon name="north_east" size="18px" aria-hidden="true" />
        </q-btn>
        <q-btn :to="localePath('/projects')" flat no-caps no-ripple class="dossier-button">
          <AnimationGlitchText :text="c('View projects')" />
          <q-icon name="east" size="18px" aria-hidden="true" />
        </q-btn>
        <q-btn
          :to="localePath('/resume')"
          flat
          no-caps
          no-ripple
          class="dossier-button dossier-button--quiet"
        >
          <AnimationGlitchText :text="c('View résumé')" />
        </q-btn>
      </div>
      <div class="dossier-exit__bottom">
        <span>{{ c("ARSAM SARKHOSH / SOFTWARE DEVELOPER") }}</span>
        <a href="#about-main" @click="scrollToAboutSection($event, 'about-main')">
          {{ c("BACK TO TOP ↑") }}
        </a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/about.css"></style>
