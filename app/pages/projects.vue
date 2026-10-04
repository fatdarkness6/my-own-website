<script setup lang="ts">
const { c, localePath } = usePortfolioI18n();
import { projects as sourceProjects } from "~/assets/data/projects";
const projects = usePortfolioI18n().content(sourceProjects);

useSeoMeta({
  title: () => c("Projects — Arsam Sarkhosh | Full-Stack Engineer"),
  description:
    () => c("Explore Arsam Sarkhosh's project files: multilingual web platforms, full-stack applications and AI document intelligence. Architecture, tools and contributions."),
});
const filters = [
  { id: "all", label: "All files" },
  { id: "web", label: "Web platforms" },
  { id: "ai", label: "AI applications" },
] as const;
const filter = ref<(typeof filters)[number]["id"]>("all");
const route = useRoute();
const router = useRouter();
const selectedId = computed({
  get: () =>
    projects.value.find((project) => project.id === route.query.project)?.id ??
    projects.value[0]!.id,
  set: (id: string) => {
    void router.replace({ query: { ...route.query, project: id } });
  },
});
watch(selectedId, (id) => {
  const project = projects.value.find((item) => item.id === id)!;
  if (filter.value !== "all" && project.category !== filter.value)
    filter.value = "all";
});
const previewOpen = ref(false);
watch(selectedId, () => {
  previewOpen.value = false;
});
const visibleProjects = computed(() =>
  projects.value.filter(
    (project) => filter.value === "all" || project.category === filter.value,
  ),
);
const current = computed(
  () => projects.value.find((project) => project.id === selectedId.value)!,
);
const fileNumber = (id: string) =>
  String(projects.value.findIndex((project) => project.id === id) + 1).padStart(
    2,
    "0",
  );
watch(filter, () => {
  if (
    !visibleProjects.value.some((project) => project.id === selectedId.value)
  ) {
    selectedId.value = visibleProjects.value[0]!.id;
  }
});
const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(
  ["label", "title"],
  {
    onceKey: "projects-archive",
  },
);
const title = usePortfolioI18n().content([
  { text: "BUILT. ", glitch: false },
  { text: "NOT JUST IMAGINED.", accent: true, interval: 8000 },
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
  <article id="projects-main" class="project-archive">
    <ProjectsBackground
      :active="started"
      :file-number="fileNumber(current.id)"
    />
    <div class="archive-filebar">
      <span>{{ c("ARSAM / PROJECT FILESYSTEM") }}</span>
      <span
        ><i aria-hidden="true" />
        {{ String(projects.length).padStart(2, "0") }} {{ c("FILES INDEXED") }}</span
      >
    </div>
    <header class="archive-intro">
      <div>
        <p class="archive-label">
          <AnimationTypedLine
            :text="c(&quot;// SELECTED WORK. OPEN FOR INSPECTION.&quot;)"
            :speed="12"
            :glitch="11000"
            v-bind="line('label')"
          />
        </p>
        <h1 class="archive-title">
          <AnimationSegmentedLine
            :segments="title"
            :speed="24"
            v-bind="line('title')"
          />
        </h1>
        <p class="archive-lead">
          <CommonPageGlitch
            :text="c(&quot;A quick look at what I build. Pick a project. See it in action.&quot;)"
            :interval="14000"
          />
        </p>
      </div>
      <div class="archive-stamp" aria-hidden="true">
        <span>{{ c("WORK ARCHIVE") }}</span
        ><strong>{{ String(projects.length).padStart(2, "0") }}</strong
        ><span>{{ c("IDEA → IMPLEMENTATION") }}</span>
      </div>
    </header>

    <section class="archive-workspace" :aria-label="c(&quot;Interactive project archive&quot;)">
      <div class="archive-toolbar">
        <span class="archive-path"
          ><span aria-hidden="true">~/</span>{{ c("work /") }}</span
        >
        <div class="archive-filters" role="group" :aria-label="c(&quot;Filter projects&quot;)">
          <q-btn
            v-for="option in filters"
            :key="option.id"
            flat
            no-caps
            no-ripple
            :aria-pressed="filter === option.id"
            :class="{ 'is-active': filter === option.id }"
            @click="filter = option.id"
            >{{ c(option.label) }}</q-btn
          >
        </div>
      </div>
      <div class="archive-browser">
        <nav class="archive-directory" :aria-label="c(&quot;Choose a project&quot;)">
          <div class="archive-directory__heading archive-label">
            <span>{{ c("PROJECT INDEX") }}</span
            ><span>{{ visibleProjects.length }} / {{ projects.length }}</span>
          </div>
          <q-btn
            v-for="project in visibleProjects"
            :key="project.id"
            flat
            no-caps
            no-ripple
            class="archive-file"
            :class="{ 'is-selected': selectedId === project.id }"
            :aria-pressed="selectedId === project.id"
            aria-controls="project-file"
            @click="selectedId = project.id"
          >
            <ProjectsPreview
              :name="project.name"
              :category="project.category"
              :screenshot="project.screenshot"
              compact
              aria-hidden="true"
            />
            <span class="archive-file__copy"
              ><span class="archive-file__number">{{
                fileNumber(project.id)
              }}</span
              ><strong>{{ project.name }}</strong></span
            >
          </q-btn>
          <p class="archive-directory__note">
            <span aria-hidden="true">↳</span>{{ c("Select a file. Inspect the build.") }}</p>
        </nav>
        <div
          id="project-file"
          class="archive-detail"
          role="region"
          :aria-label="`${c('View project')}: ${current.name}`"
        >
          <span class="archive-sr-only" role="status"
            >{{ c("Opened") }} {{ current.name }}. {{ current.ownership }}.</span
          >
          <CommonHackerReveal :key="current.id" :show="started" :duration="460">
            <q-card flat square class="archive-record">
              <div class="archive-record__bar">
                <span>{{ c("OPEN /") }} {{ current.file }}</span
                ><q-badge
                  v-if="current.status === 'live'"
                  outline
                  class="archive-live"
                  >{{ current.statusLabel ?? c('LIVE') }}</q-badge
                ><span v-else>{{ current.statusLabel ?? c('PROJECT FILE') }}</span>
              </div>
              <div class="archive-showcase">
                <ProjectsPreview
                  :name="current.name"
                  :category="current.category"
                  :screenshot="current.screenshot"
                  :source-only="Boolean(current.repo && !current.live)"
                />
                <q-btn
                  v-if="current.screenshot"
                  flat
                  no-caps
                  no-ripple
                  class="archive-enlarge"
                  :aria-label="`${c('Enlarge')}: ${current.name} ${c('/ SCREENSHOT')}`"
                  @click="previewOpen = true"
                >
                  <q-icon name="fullscreen" size="20px" aria-hidden="true" />{{ c("Enlarge") }}</q-btn>
              </div>
              <q-card-section class="archive-record__intro">
                <div class="archive-record__identity">
                  <div>
                    <p class="archive-label">
                      {{ current.role
                      }}<template v-if="current.year">
                        / {{ current.year }}</template
                      >
                    </p>
                    <h2><CommonPageGlitch :text="c(current.name)" /></h2>
                  </div>
                  <span class="archive-record__number" aria-hidden="true">{{
                    fileNumber(current.id)
                  }}</span>
                </div>
                <p class="archive-body">
                  <CommonPageGlitch :text="c(current.summary)" :interval="14000" />
                </p>
                <p v-if="current.availability" class="archive-availability">{{ current.availability }}</p>
                <div class="archive-tags" :aria-label="c(&quot;Project technologies&quot;)">
                  <q-badge v-for="tech in current.stack" :key="tech" outline>{{
                    tech
                  }}</q-badge>
                </div>
              </q-card-section>
              <div class="archive-record__footer">
                <q-btn
                  v-if="current.live"
                  :href="current.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  unelevated
                  no-caps
                  no-ripple
                  class="archive-button archive-button--primary"
                >
                  <AnimationGlitchText :text="c(&quot;Explore live project&quot;)" /><q-icon
                    name="north_east"
                    size="18px"
                    aria-hidden="true"
                  /><span class="archive-sr-only">{{ c("(opens in a new tab)") }}</span>
                </q-btn>
                <q-btn
                  v-if="current.repo"
                  :href="current.repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  flat
                  no-caps
                  no-ripple
                  class="archive-button"
                  >{{ c("Source code") }}<span class="archive-sr-only"
                    >{{ c("(opens in a new tab)") }}</span
                  ></q-btn
                >
                <span class="archive-record__end">{{ current.ownership }}</span>
              </div>
              <q-expansion-item
                :key="current.id"
                class="archive-more"
                :label="c(&quot;Under the hood&quot;)"
                :caption="c(&quot;My contribution, architecture &amp; tools&quot;)"
                expand-icon="add"
                expanded-icon="remove"
              >
                <div class="archive-expanded-intro">
                  <p class="archive-record__headline">
                    <CommonPageGlitch :text="c(current.headline)" />
                  </p>
                  <p class="archive-body">{{ current.description }}</p>
                </div>
                <section class="archive-system" aria-labelledby="system-title">
                  <div class="archive-subheading">
                    <h3 id="system-title">
                      <CommonPageGlitch :text="c(&quot;01 / SYSTEM MAP&quot;)" />
                    </h3>
                    <span aria-hidden="true">{{ c("[ CONNECTED LAYERS ]") }}</span>
                  </div>
                  <ol class="archive-nodes">
                    <li
                      v-for="(layer, index) in current.layers"
                      :key="layer.label"
                    >
                      <span class="archive-node__pin" aria-hidden="true">{{
                        index + 1
                      }}</span
                      ><span class="archive-label">{{ layer.label }}</span
                      ><strong>{{ layer.title }}</strong
                      ><span class="archive-node__tools">{{
                        layer.tools
                      }}</span>
                    </li>
                  </ol>
                </section>
                <section
                  class="archive-contribution"
                  aria-labelledby="contribution-title"
                >
                  <div class="archive-subheading">
                    <h3 id="contribution-title">
                      <CommonPageGlitch :text="c(&quot;02 / MY CONTRIBUTION&quot;)" />
                    </h3>
                  </div>
                  <p class="archive-ownership">{{ current.ownership }}</p>
                  <ul class="archive-worklist">
                    <li v-for="item in current.contributions" :key="item">
                      <span aria-hidden="true">+</span>{{ item }}
                    </li>
                  </ul>
                  <p class="archive-note">
                    <q-icon
                      name="subdirectory_arrow_right"
                      size="18px"
                      aria-hidden="true"
                    />{{ current.note }}
                  </p>
                </section>
              </q-expansion-item>
            </q-card>
          </CommonHackerReveal>
        </div>
      </div>
    </section>
    <q-dialog v-model="previewOpen">
      <q-card class="archive-lightbox" flat square>
        <div class="archive-lightbox__bar">
          <span>{{ current.name }} {{ c("/ SCREENSHOT") }}</span
          ><q-btn
            v-close-popup
            flat
            round
            icon="close"
            :aria-label="c(&quot;Close screenshot&quot;)"
          />
        </div>
        <img
          v-if="current.screenshot"
          :src="current.screenshot.src"
          :alt="current.screenshot.alt"
        />
      </q-card>
    </q-dialog>
    <footer class="archive-exit">
      <div>
        <p class="archive-label">{{ c("// THERE'S A PERSON BEHIND THESE BUILDS.") }}</p>
        <h2 class="section-title">
          <CommonPageGlitch :text="c(&quot;MEET THE&quot;)" />
          <span><CommonPageGlitch :text="c(&quot;ENGINEER.&quot;)" :interval="10000" /></span>
        </h2>
      </div>
      <q-btn :to="localePath(&quot;/about&quot;)" flat no-caps no-ripple class="archive-button"
        ><AnimationGlitchText :text="c(&quot;Behind the signal&quot;)" /><q-icon
          name="east"
          size="20px"
          aria-hidden="true"
      /></q-btn>
      <div class="archive-exit__bottom">
        <span>{{ c("ARSAM SARKHOSH / FULL-STACK ENGINEER") }}</span
        ><a href="#projects-main">{{ c("BACK TO TOP ↑") }}</a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/projects.css"></style>
