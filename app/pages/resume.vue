<script setup lang="ts">
import { aboutCopy } from "~/assets/data/about";
import { projects } from "~/assets/data/projects";
import { resumeDocument } from "~/assets/data/resume";

useSeoMeta({
  title: "Résumé — Arsam Sarkhosh | Full-Stack Engineer",
  description: "Download Arsam Sarkhosh's résumé. A quick overview of Vue, Nuxt, full-stack engineering and AI application experience.",
});

const highlights = ["vue-nuxt", "backends", "ai"].map((id) => aboutCopy.tools.find((tool) => tool.id === id)!);
const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(["label", "title"], { onceKey: "resume-profile" });
const title = [
  { text: "ARSAM ", glitch: false },
  { text: "SARKHOSH.", accent: true, interval: 8500 },
];
watch(introReady, (ready) => {
  if (!ready || !import.meta.client) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) complete();
  else play();
}, { immediate: true });
</script>

<template>
  <article id="resume-main" class="resume-dossier">
    <ResumeBackground :active="started" />
    <div class="cv-filebar"><span>ARSAM.SYS / CAREER PROFILE</span><span>DOCUMENT / 001</span></div>
    <header class="cv-intro">
      <div class="cv-intro__copy">
        <p class="cv-label"><AnimationTypedLine text="// THE ENGINEER. AT A GLANCE." :speed="12" v-bind="line('label')" /></p>
        <h1 class="cv-title"><AnimationSegmentedLine :segments="title" :speed="24" v-bind="line('title')" /></h1>
        <p class="cv-role">{{ aboutCopy.role }}</p>
        <p class="cv-lead">{{ aboutCopy.summary }}</p>
        <div class="cv-actions">
          <q-btn :href="resumeDocument.href" :download="resumeDocument.filename" unelevated no-caps no-ripple class="cv-button cv-button--primary">
            <q-icon name="download" size="22px" aria-hidden="true" /><AnimationGlitchText text="Download résumé" />
          </q-btn>
          <q-btn :href="resumeDocument.href" target="_blank" rel="noopener noreferrer" flat no-caps no-ripple class="cv-button cv-button--outline">
            Preview résumé<q-icon name="north_east" size="18px" aria-hidden="true" /><span class="cv-sr-only">(PDF, opens in a new tab)</span>
          </q-btn>
        </div>
        <p class="cv-download-note">PDF / ONE PAGE / READY TO SHARE</p>
      </div>
      <div class="cv-document-mark" aria-hidden="true">
        <div class="cv-document-mark__top"><span>CV / 001</span><q-icon name="description" size="24px" /></div>
        <span class="cv-document-mark__initials">A/S</span>
        <div class="cv-document-mark__lines"><i /><i /><i /></div>
        <div class="cv-document-mark__bottom"><span>ENGINEERING PROFILE</span><span>PDF</span></div>
      </div>
    </header>

    <CommonHackerReveal :show="started" :duration="560">
      <section class="cv-strengths" aria-labelledby="cv-strengths-title">
        <div class="cv-section-bar"><h2 id="cv-strengths-title">01 / CORE STRENGTHS</h2><span>THREE AREAS. ONE ENGINEER.</span></div>
        <div class="cv-strength-grid">
          <q-card v-for="tool in highlights" :key="tool.id" flat square class="cv-strength">
            <q-card-section>
              <div class="cv-strength__top"><span class="cv-label">{{ tool.layer }}</span><q-icon :name="tool.icon" size="24px" aria-hidden="true" /></div>
              <h3>{{ tool.name }}</h3><p>{{ tool.title }}</p>
              <div class="cv-tags"><q-badge v-for="tag in tool.tags" :key="tag" outline>{{ tag }}</q-badge></div>
            </q-card-section>
          </q-card>
        </div>
      </section>
      <section id="experience" class="cv-experience" aria-labelledby="cv-experience-title">
        <div class="cv-section-bar"><h2 id="cv-experience-title">02 / SELECTED EXPERIENCE</h2><span>{{ projects.length }} PROJECT RECORDS</span></div>
        <p class="cv-section-note">The short version. Open a record for the details.</p>
        <q-list class="cv-records">
          <q-expansion-item v-for="(project, index) in projects" :key="project.id" :label="project.name" group="resume-experience" class="cv-record" expand-icon="add" expanded-icon="remove" :duration="180">
            <template #header>
              <q-item-section side class="cv-record__number">0{{ index + 1 }}</q-item-section>
              <q-item-section>
                <div class="cv-record__title"><h3>{{ project.name }}</h3><span>{{ project.role }}</span></div>
                <p class="cv-record__summary">{{ project.summary }}</p>
              </q-item-section>
            </template>
            <div class="cv-record__details">
              <p class="cv-label">{{ project.ownership }}</p>
              <ul><li v-for="contribution in project.contributions" :key="contribution">{{ contribution }}</li></ul>
              <div class="cv-record__footer">
                <div class="cv-tags"><q-badge v-for="tech in project.stack" :key="tech" outline>{{ tech }}</q-badge></div>
                <q-btn :to="{ path: '/projects', query: { project: project.id } }" flat no-caps no-ripple class="cv-button cv-evidence">View project<q-icon name="north_east" size="18px" aria-hidden="true" /><span class="cv-sr-only">: {{ project.name }}</span></q-btn>
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </section>
    </CommonHackerReveal>
    <footer class="cv-exit">
      <div><p class="cv-label">// NEXT CHAPTER</p><h2 class="section-title">LET'S WORK <span>TOGETHER.</span></h2></div>
      <q-btn to="/contact" no-caps no-ripple unelevated class="cv-button cv-button--primary"><AnimationGlitchText text="Start a conversation" /><q-icon name="north_east" size="18px" aria-hidden="true" /></q-btn>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/resume.css"></style>
