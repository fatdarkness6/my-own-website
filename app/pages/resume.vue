<script setup lang="ts">
import { aboutCopy } from "~/assets/data/about";
import { projects } from "~/assets/data/projects";
import { resumeFocus, resumeSections } from "~/assets/data/resume";

useSeoMeta({
  title: "Résumé — Arsam Sarkhosh | Full-Stack Engineer",
  description:
    "Arsam Sarkhosh's engineering profile: Vue and Nuxt interfaces, full-stack systems, AI applications, and selected project contributions.",
});

const selectedFocus = ref("all");
const focus = computed(
  () => resumeFocus.find((item) => item.id === selectedFocus.value)!,
);
const matchesFocus = (id: string) =>
  selectedFocus.value === "all" || focus.value.projects.includes(id);
const visibleCount = computed(
  () => projects.filter((project) => matchesFocus(project.id)).length,
);
const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(
  ["label", "title"],
  {
    onceKey: "resume-profile",
  },
);
const title = [
  { text: "BUILT ON ", glitch: false },
  { text: "REAL WORK.", accent: true, interval: 8500 },
];
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

const printResume = () => window.print();
</script>

<template>
  <article id="resume-main" class="resume-dossier">
    <div class="cv-filebar">
      <span>ARSAM.SYS / CAREER PROFILE</span><span>DOCUMENT / 001</span>
    </div>
    <header class="cv-intro">
      <div>
        <p class="cv-label">
          <AnimationTypedLine
            text="// RÉSUMÉ. THE ENGINEERING RECORD."
            :speed="12"
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
        <p class="cv-lead">
          The tools I use. The systems I build. The work behind the interface.
        </p>
      </div>
      <q-btn
        unelevated
        no-caps
        no-ripple
        class="cv-button cv-button--primary cv-print-action"
        @click="printResume"
      >
        <q-icon
          name="print"
          size="19px"
          aria-hidden="true"
        /><AnimationGlitchText text="Print / Save PDF" />
      </q-btn>
    </header>

    <div class="cv-layout">
      <aside class="cv-sidebar" aria-label="Engineer profile">
        <CommonHackerReveal :show="started" :duration="560">
          <q-card flat square class="cv-passport">
            <div class="cv-passport__bar">
              <span>ENGINEER ID</span
              ><q-icon name="fingerprint" size="22px" aria-hidden="true" />
            </div>
            <q-card-section class="cv-passport__identity">
              <div class="cv-monogram" aria-hidden="true">
                <span>A/S</span><i /><small>DESIGN → CODE → SYSTEM</small>
              </div>
              <h2>{{ aboutCopy.name }}</h2>
              <p class="cv-role">{{ aboutCopy.role }}</p>
              <p class="cv-body cv-profile-summary">{{ aboutCopy.summary }}</p>
            </q-card-section>
            <q-separator dark />
            <q-card-section class="cv-specialty"
              ><span class="cv-label">PRIMARY TOOLSET</span
              ><strong>Vue / Nuxt</strong
              ><span class="cv-body"
                >Frontend precision.<br />Full-stack thinking.</span
              ></q-card-section
            >
            <div class="cv-passport__footer">
              <span>PROFILE / ARSAM SARKHOSH</span
              ><span class="cv-barcode" aria-hidden="true" />
            </div>
          </q-card>
        </CommonHackerReveal>
        <nav class="cv-contents" aria-label="Résumé sections">
          <q-list>
            <q-item
              v-for="section in resumeSections"
              :key="section.id"
              tag="a"
              clickable
              :href="`#${section.id}`"
              :aria-label="section.title"
            >
              <q-item-section side class="cv-accent">{{
                section.number
              }}</q-item-section>
              <q-item-section>{{ section.title }}</q-item-section>
              <q-item-section side
                ><q-icon name="south_east" size="16px" aria-hidden="true"
              /></q-item-section>
            </q-item>
          </q-list>
        </nav>
        <p class="cv-sidebar-note">
          A record of practical work.<br />Explore the evidence alongside it.
        </p>
      </aside>

      <div class="cv-document">
        <section
          id="experience"
          class="cv-chapter"
          aria-labelledby="cv-experience-title"
        >
          <div class="cv-chapter__heading">
            <span class="cv-chapter__number" aria-hidden="true">01</span>
            <div>
              <p class="cv-label">EXECUTION LOG</p>
              <h2 id="cv-experience-title" class="section-title">
                PROJECT <span>EXPERIENCE.</span>
              </h2>
            </div>
          </div>
          <p class="cv-body cv-section-intro">
            From ground-up builds to existing systems: what I owned, connected,
            and improved.
          </p>
          <div
            class="cv-focus"
            role="group"
            aria-label="Filter project experience"
          >
            <q-btn
              v-for="item in resumeFocus"
              :key="item.id"
              flat
              no-caps
              no-ripple
              :aria-pressed="selectedFocus === item.id"
              :class="{ 'is-active': selectedFocus === item.id }"
              @click="selectedFocus = item.id"
            >
              <q-icon :name="item.icon" size="17px" aria-hidden="true" />{{
                item.label
              }}
            </q-btn>
          </div>
          <p class="cv-result-count" role="status">
            {{ visibleCount }} project records / {{ focus.label }}
          </p>
          <q-timeline color="primary" class="cv-timeline">
            <q-timeline-entry
              v-for="project in projects"
              :key="project.id"
              v-show="matchesFocus(project.id)"
              :subtitle="project.ownership"
              :icon="project.category === 'ai' ? 'psychology' : 'terminal'"
            >
              <h3 class="cv-project-title">{{ project.name }}</h3>
              <div class="cv-entry__meta">
                <span>{{ project.role }}</span
                ><span v-if="project.year">{{ project.year }}</span>
              </div>
              <p class="cv-body">{{ project.summary }}</p>
              <ul class="cv-contributions">
                <li v-for="item in project.contributions" :key="item">
                  {{ item }}
                </li>
              </ul>
              <div class="cv-entry__footer">
                <div class="cv-tags">
                  <q-badge
                    v-for="tech in project.stack.slice(0, 3)"
                    :key="tech"
                    outline
                    >{{ tech }}</q-badge
                  >
                </div>
                <q-btn
                  flat
                  no-caps
                  no-ripple
                  :to="{ path: '/projects', query: { project: project.id } }"
                  class="cv-evidence"
                >
                  View project<q-icon
                    name="north_east"
                    size="16px"
                    aria-hidden="true"
                  /><span class="cv-sr-only">: {{ project.name }}</span>
                </q-btn>
              </div>
            </q-timeline-entry>
          </q-timeline>
        </section>

        <section
          id="skills"
          class="cv-chapter"
          aria-labelledby="cv-skills-title"
        >
          <div class="cv-chapter__heading">
            <span class="cv-chapter__number" aria-hidden="true">02</span>
            <div>
              <p class="cv-label">CAPABILITY MAP</p>
              <h2 id="cv-skills-title" class="section-title">
                TOOLS WITH <span>CONTEXT.</span>
              </h2>
            </div>
          </div>
          <p class="cv-body cv-section-intro">
            Practical capabilities, connected to the work—not arbitrary
            proficiency scores.
          </p>
          <div class="cv-skill-grid">
            <q-card
              v-for="tool in aboutCopy.tools"
              :key="tool.id"
              flat
              square
              class="cv-skill"
            >
              <q-card-section>
                <div class="cv-skill__bar">
                  <span class="cv-label">{{ tool.layer }}</span
                  ><q-icon :name="tool.icon" size="24px" aria-hidden="true" />
                </div>
                <h3>{{ tool.name }}</h3>
                <p class="cv-body">{{ tool.text }}</p>
                <div class="cv-tags">
                  <q-badge v-for="tag in tool.tags" :key="tag" outline>{{
                    tag
                  }}</q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </section>

        <section id="work" class="cv-chapter" aria-labelledby="cv-work-title">
          <div class="cv-chapter__heading">
            <span class="cv-chapter__number" aria-hidden="true">03</span>
            <div>
              <p class="cv-label">EVIDENCE / SELECTED WORK</p>
              <h2 id="cv-work-title" class="section-title">
                SEE THE <span>OUTPUT.</span>
              </h2>
            </div>
          </div>
          <div class="cv-work-grid">
            <NuxtLink
              v-for="project in projects"
              :key="project.id"
              :to="{ path: '/projects', query: { project: project.id } }"
              class="cv-work-link"
            >
              <ProjectsPreview
                :name="project.name"
                :category="project.category"
                :screenshot="project.screenshot"
                compact
                aria-hidden="true"
              />
              <span
                ><strong>{{ project.name }}</strong
                ><q-icon name="north_east" size="18px" aria-hidden="true"
              /></span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>

    <footer class="cv-exit">
      <div>
        <p class="cv-label">// NEXT CHAPTER</p>
        <h2 class="section-title">LET'S BUILD <span>SOMETHING.</span></h2>
      </div>
      <q-btn
        to="/contact"
        no-caps
        no-ripple
        unelevated
        class="cv-button cv-button--primary"
        ><AnimationGlitchText text="Start a conversation" /><q-icon
          name="north_east"
          size="18px"
          aria-hidden="true"
      /></q-btn>
      <div class="cv-exit__bottom">
        <span>{{ aboutCopy.name }} / {{ aboutCopy.role }}</span
        ><a href="#resume-main">BACK TO TOP ↑</a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/resume.css"></style>
