<script setup lang="ts">
const { c, localePath, locale } = usePortfolioI18n();
import { aboutCopy as sourceAbout } from "~/assets/data/about";
import { contactDetails } from "~/assets/data/contact";
import { resumeDocument, resumeProfile as sourceProfile, resumeExperience as sourceExperience, resumeProjects as sourceResumeProjects } from "~/assets/data/resume";
import { projects as sourceProjects } from "~/assets/data/projects";
const { content } = usePortfolioI18n();
const resumeProfile = content(sourceProfile);
const resumeExperience = content(sourceExperience);
const projects = content(sourceProjects);
const extraProjects = content(sourceResumeProjects);
const resumeProjects = computed(() => extraProjects.value.map((project) => {
  const canonical = projects.value.find((item) => item.id === project.projectId);
  return canonical ? { ...project, summary: [canonical.summary, canonical.availability].filter(Boolean).join(' ') } : project;
}));

useSeoMeta({
  title: () => c("Résumé — Arsam Sarkhosh | Full-Stack Engineer"),
  description:
    () => c("Download Arsam Sarkhosh's résumé. A quick overview of Vue, Nuxt, full-stack engineering and AI application experience."),
});

const highlights = content(["vue-nuxt", "backends", "ai"].map(
  (id) => sourceAbout.tools.find((tool) => tool.id === id)!,
));
const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(
  ["label", "title"],
  { onceKey: "resume-profile" },
);
const title = content([
  { text: "ARSAM ", glitch: false },
  { text: "SARKHOSH.", accent: true, interval: 8500 },
]);
watch(
  introReady,
  (ready) => {
    if (!ready || !import.meta.client) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      complete();
    else play();
  },
  { immediate: true },
);
</script>

<template>
  <article id="resume-main" class="resume-dossier">
    <ResumeBackground :active="started" />
    <div class="cv-filebar">
      <span>{{ c("ARSAM.SYS / CAREER PROFILE") }}</span><span>{{ c("DOCUMENT / 001") }}</span>
    </div>
    <header class="cv-intro">
      <div class="cv-intro__copy">
        <p class="cv-label">
          <AnimationTypedLine
            :text="c(&quot;// THE ENGINEER. AT A GLANCE.&quot;)"
            :speed="12"
            :glitch="11000"
            v-bind="line('label')"
          />
        </p>
        <h1 class="cv-title">
          <AnimationSegmentedLine
            :segments="title"
            :speed="24"
            v-bind="line('title')"
          />
        </h1>
        <p class="cv-role"><CommonPageGlitch :text="c(resumeProfile.role)" /></p>
        <p class="cv-lead">
          <CommonPageGlitch :text="c(resumeProfile.summary)" :interval="14000" />
        </p>
        <div class="cv-profile-meta">
          <span><q-icon name="location_on" aria-hidden="true" /> {{ resumeProfile.location }}</span>
          <span v-for="language in resumeProfile.languages" :key="language.name">{{ language.name }} / <bdi dir="ltr">{{ language.level }}</bdi></span>
        </div>
        <nav class="cv-contact" :aria-label="c(&quot;Résumé contact links&quot;)">
          <a :href="`mailto:${contactDetails.email}`">{{ contactDetails.email }}</a>
          <a :href="contactDetails.linkedin" target="_blank" rel="noopener noreferrer">{{ c("LinkedIn") }}<span class="cv-sr-only">{{ c("(opens in a new tab)") }}</span></a>
          <a :href="contactDetails.github" target="_blank" rel="noopener noreferrer">{{ c("GitHub") }}<span class="cv-sr-only">{{ c("(opens in a new tab)") }}</span></a>
        </nav>
        <div class="cv-actions">
          <q-btn
            :href="resumeDocument.href"
            :download="resumeDocument.filename"
            unelevated
            no-caps
            no-ripple
            class="cv-button cv-button--primary"
          >
            <q-icon
              name="download"
              size="22px"
              aria-hidden="true"
            /><AnimationGlitchText :text="c(&quot;Download résumé&quot;)" />
          </q-btn>
          <q-btn
            :href="resumeDocument.href"
            target="_blank"
            rel="noopener noreferrer"
            flat
            no-caps
            no-ripple
            class="cv-button cv-button--outline"
          >{{ c("Preview résumé") }}<q-icon
              name="north_east"
              size="18px"
              aria-hidden="true"
            /><span class="cv-sr-only">{{ c("(PDF, opens in a new tab)") }}</span>
          </q-btn>
        </div>
        <p class="cv-download-note"><bdi dir="ltr">PDF / {{ resumeDocument.pages }}</bdi> {{ c("PAGES / READY TO SHARE") }}<span v-if="locale !== 'en'"> · {{ c("Download is in English.") }}</span></p>
      </div>
      <div class="cv-document-mark" aria-hidden="true">
        <div class="cv-document-mark__top">
          <span>{{ c("CV / 001") }}</span><q-icon name="description" size="24px" />
        </div>
        <span class="cv-document-mark__initials">{{ c("A/S") }}</span>
        <div class="cv-document-mark__lines"><i /><i /><i /></div>
        <div class="cv-document-mark__bottom">
          <span>{{ c("ENGINEERING PROFILE") }}</span><span>{{ c("PDF") }}</span>
        </div>
      </div>
    </header>

    <CommonHackerReveal :show="started" :duration="560">
      <section class="cv-strengths" aria-labelledby="cv-strengths-title">
        <div class="cv-section-bar">
          <h2 id="cv-strengths-title">
            <CommonPageGlitch :text="c(&quot;01 / CORE STRENGTHS&quot;)" />
          </h2>
          <span>{{ c("THREE AREAS. ONE ENGINEER.") }}</span>
        </div>
        <div class="cv-strength-grid">
          <q-card
            v-for="tool in highlights"
            :key="tool.id"
            flat
            square
            class="cv-strength"
          >
            <q-card-section>
              <div class="cv-strength__top">
                <span class="cv-label">{{ tool.layer }}</span
                ><q-icon :name="tool.icon" size="24px" aria-hidden="true" />
              </div>
              <h3><CommonPageGlitch :text="c(tool.name)" /></h3>
              <p><CommonPageGlitch :text="c(tool.title)" :interval="13000" /></p>
              <div class="cv-tags">
                <q-badge v-for="tag in tool.tags" :key="tag" outline>{{
                  tag
                }}</q-badge>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>
      <section
        id="experience"
        class="cv-experience"
        aria-labelledby="cv-experience-title"
      >
        <div class="cv-section-bar">
          <h2 id="cv-experience-title">
            <CommonPageGlitch :text="c(&quot;02 / EMPLOYMENT HISTORY&quot;)" />
          </h2>
          <span>{{ resumeExperience.length }} {{ c("EXPERIENCE RECORDS") }}</span>
        </div>
        <p class="cv-section-note">{{ c("The short version. Open a record for the details.") }}</p>
        <q-list class="cv-records">
          <q-expansion-item
            v-for="(experience, index) in resumeExperience"
            :key="experience.id"
            :label="experience.company"
            group="resume-experience"
            class="cv-record"
            expand-icon="add"
            expanded-icon="remove"
            :duration="180"
          >
            <template #header>
              <q-item-section side class="cv-record__number"
                >0{{ index + 1 }}</q-item-section
              >
              <q-item-section>
                <div class="cv-record__title">
                  <h3><CommonPageGlitch :text="c(experience.company)" /></h3>
                  <span>{{ experience.period }}</span>
                </div>
                <p class="cv-record__meta">{{ experience.role }} / {{ experience.location }}</p>
                <p class="cv-record__summary">
                  <CommonPageGlitch :text="c(experience.summary)" :interval="14000" />
                </p>
              </q-item-section>
            </template>
            <div class="cv-record__details">
              <ul>
                <li
                  v-for="contribution in experience.bullets"
                  :key="contribution"
                >
                  {{ contribution }}
                </li>
              </ul>
              <div class="cv-record__footer">
                <div class="cv-tags">
                  <q-badge v-for="tech in experience.stack" :key="tech" outline>{{
                    tech
                  }}</q-badge>
                </div>
                <q-btn
                  v-if="experience.projectId"
                  :to="localePath({ path: '/projects', query: { project: experience.projectId } })"
                  flat
                  no-caps
                  no-ripple
                  class="cv-button cv-evidence"
                  >{{ c("View project") }}<q-icon
                    name="north_east"
                    size="18px"
                    aria-hidden="true"
                  /><span class="cv-sr-only">: {{ experience.company }}</span></q-btn
                >
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </section>
      <section class="cv-experience" aria-labelledby="cv-learning-title">
        <div class="cv-section-bar"><h2 id="cv-learning-title"><CommonPageGlitch :text="c(&quot;03 / EDUCATION &amp; DEVELOPMENT&quot;)" /></h2><span>{{ c("LEARNING BY BUILDING.") }}</span></div>
        <div class="cv-learning-grid">
          <q-card flat square class="cv-strength"><q-card-section>
            <p class="cv-label">{{ c("EDUCATION /") }} {{ resumeProfile.education.period }}</p>
            <h3><CommonPageGlitch :text="c(resumeProfile.education.qualification)" /></h3>
            <p>{{ resumeProfile.education.summary }}</p>
          </q-card-section></q-card>
          <q-card flat square class="cv-strength"><q-card-section>
            <p class="cv-label">{{ c("COURSES / CODING FRONT") }}</p>
            <div v-for="course in resumeProfile.courses" :key="course.title" class="cv-course"><h3>{{ course.title }}</h3><p>{{ course.provider }} / {{ course.period }}</p></div>
            <p class="cv-label cv-language-note">{{ resumeProfile.languages.map(language => `${language.name} ${language.level}`).join(' / ') }}</p>
          </q-card-section></q-card>
        </div>
      </section>
      <section class="cv-experience" aria-labelledby="cv-skills-title">
        <div class="cv-section-bar"><h2 id="cv-skills-title"><CommonPageGlitch :text="c(&quot;04 / TECHNICAL TOOLSET&quot;)" /></h2><span>{{ c("ACROSS THE STACK.") }}</span></div>
        <div class="cv-skill-list"><div v-for="group in resumeProfile.skills" :key="group.label"><h3>{{ group.label }}</h3><div class="cv-tags"><q-badge v-for="skill in group.items" :key="skill" outline>{{ skill }}</q-badge></div></div></div>
      </section>
      <section class="cv-experience" aria-labelledby="cv-work-title">
        <div class="cv-section-bar"><h2 id="cv-work-title"><CommonPageGlitch :text="c(&quot;05 / PROJECT ARCHIVE&quot;)" /></h2><span>{{ resumeProjects.length }} {{ c("PROJECTS / FROM THE RÉSUMÉ") }}</span></div>
        <q-expansion-item class="cv-records cv-project-archive" :label="c(&quot;Explore projects &amp; side projects&quot;)" :caption="c(&quot;The complete list, without crowding the page.&quot;)" expand-icon="add" expanded-icon="remove" :duration="180">
          <q-list separator>
            <q-item v-for="project in resumeProjects" :key="project.id" class="cv-project-item">
              <q-item-section><h3>{{ project.name }}</h3><p>{{ project.summary }}</p></q-item-section>
              <q-item-section side v-if="project.href || project.projectId">
                <q-btn v-if="project.projectId" :to="localePath({ path: '/projects', query: { project: project.projectId } })" flat no-ripple icon="east" :aria-label="`${c('View project')}: ${project.name}`" />
                <q-btn v-else :href="project.href" target="_blank" rel="noopener noreferrer" flat no-ripple icon="north_east" :aria-label="`${c('View project')}: ${project.name} ${c('(opens in a new tab)')}`" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </section>
    </CommonHackerReveal>
    <footer class="cv-exit">
      <div>
        <p class="cv-label">{{ c("// NEXT CHAPTER") }}</p>
        <h2 class="section-title">
          <CommonPageGlitch :text="c(&quot;LET'S WORK&quot;)" />
          <span><CommonPageGlitch :text="c(&quot;TOGETHER.&quot;)" :interval="10000" /></span>
        </h2>
      </div>
      <q-btn
        :to="localePath(&quot;/contact&quot;)"
        no-caps
        no-ripple
        unelevated
        class="cv-button cv-button--primary"
        ><AnimationGlitchText :text="c(&quot;Start a conversation&quot;)" /><q-icon
          name="north_east"
          size="18px"
          aria-hidden="true"
      /></q-btn>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/resume.css"></style>
