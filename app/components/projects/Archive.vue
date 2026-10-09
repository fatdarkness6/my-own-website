<script setup lang="ts">
const { c, localePath, rtl, content } = usePortfolioI18n();
import { PAGE_SEO } from "#shared/seo";
import { projects as sourceProjects } from "~/assets/data/projects";
import { findProjectId, projectPath } from "#shared/projectRoutes";
const props = defineProps<{ projectId?: string }>();
const projects = content(sourceProjects);
const filters = [
  { id: "all", label: "All files" },
  { id: "web", label: "Web platforms" },
  { id: "ai", label: "AI applications" },
] as const;
const filter = useState<(typeof filters)[number]["id"]>("projects-filter", () => "all");
const route = useRoute();
const router = useRouter();
const selectedId = computed({
  get: () =>
    findProjectId(route.query.project) ??
    props.projectId ??
    projects.value[0]!.id,
  set: (id: string) => {
    void router.push({ path: route.path, query: { ...route.query, project: id }, hash: route.hash });
  },
});
function selectProject(event: Event, id: string) {
  // Keep real, crawlable links and native open-in-new-tab behavior. An ordinary
  // click changes only the selection query, so the archive never remounts.
  if (event instanceof MouseEvent && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
  event.preventDefault();
  selectedId.value = id;
}
watch(selectedId, (id) => {
  const project = projects.value.find((item) => item.id === id)!;
  if (filter.value !== "all" && project.category !== filter.value)
    filter.value = "all";
}, { immediate: true });
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
const previewLabel = computed(() => `${c('Enlarge')}: ${current.value.name} ${c('/ SCREENSHOT')}`);
function openPreview() {
  if (current.value.screenshot) previewOpen.value = true;
}
usePortfolioSeo({
  type: props.projectId ? "WebPage" : "CollectionPage",
  canonicalPath: props.projectId ? () => projectPath(current.value.id) : undefined,
  project: () => props.projectId ? current.value : undefined,
  title: () => props.projectId
    ? `${current.value.name} | ${c("Arsam Sarkhosh")}`
    : c(PAGE_SEO.projects.title),
  description: () => props.projectId
    ? `${c("Arsam Sarkhosh")}: ${current.value.summary}`
    : c(PAGE_SEO.projects.description),
});
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
const { element, line, started } = useViewportTyping(
  ["label", "title"],
  {
    onceKey: props.projectId ? `project-${props.projectId}` : "projects-archive",
    viewport: { threshold: 0 },
  },
);
const archiveTitle = content([
  { text: "BUILT. ", glitch: false },
  { text: "NOT JUST IMAGINED.", accent: true, interval: 8000 },
]);
const title = computed(() => props.projectId
  ? [{ text: current.value.name, accent: true, interval: 8000 }]
  : archiveTitle.value);
</script>

<template>
  <article id="projects-main" ref="element" class="project-archive">
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
    <nav v-if="projectId" class="archive-breadcrumbs" :aria-label="c('Projects')">
      <q-breadcrumbs :separator="rtl ? '‹' : '›'">
        <q-breadcrumbs-el :label="c('Home')" :to="localePath('/')" />
        <q-breadcrumbs-el :label="c('Projects')" :to="localePath('/projects')" />
        <q-breadcrumbs-el :label="current.name" aria-current="page" />
      </q-breadcrumbs>
    </nav>
    <header class="archive-intro">
      <div>
        <p class="archive-label">
          <AnimationTypedLine
            :text="c('// SELECTED WORK. OPEN FOR INSPECTION.')"
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
            :text="projectId ? current.headline : c('A quick look at what I build. Pick a project. See it in action.')"
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

    <section class="archive-workspace" :aria-label="c('Interactive project archive')">
      <div class="archive-toolbar">
        <span class="archive-path"
          ><span aria-hidden="true">~/</span>{{ c("work /") }}</span
        >
        <div class="archive-filters" role="group" :aria-label="c('Filter projects')">
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
        <nav class="archive-directory" :aria-label="c('Choose a project')">
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
            :to="localePath(projectPath(project.id))"
            :aria-current="selectedId === project.id ? 'true' : undefined"
            @click="selectProject($event, project.id)"
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
                <component
                  :is="current.screenshot ? 'button' : 'div'"
                  :type="current.screenshot ? 'button' : undefined"
                  class="archive-preview-trigger"
                  :aria-label="current.screenshot ? previewLabel : undefined"
                  :aria-haspopup="current.screenshot ? 'dialog' : undefined"
                  @click="openPreview"
                >
                  <ProjectsPreview
                    :name="current.name"
                    :category="current.category"
                    :screenshot="current.screenshot"
                    :source-only="Boolean(current.repo && !current.live)"
                  />
                </component>
                <q-btn
                  v-if="current.screenshot"
                  flat
                  no-caps
                  no-ripple
                  class="archive-enlarge"
                  :aria-label="previewLabel"
                  aria-haspopup="dialog"
                  @click="openPreview"
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
                <div class="archive-tags" :aria-label="c('Project technologies')">
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
                  <AnimationGlitchText :text="c('Explore live project')" /><q-icon
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
                :default-opened="Boolean(projectId)"
                :label="c('Under the hood')"
                :caption="c('My contribution, architecture &amp; tools')"
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
                      <CommonPageGlitch :text="c('01 / SYSTEM MAP')" />
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
                      <CommonPageGlitch :text="c('02 / MY CONTRIBUTION')" />
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
    <ProjectsScreenshotDialog
      v-model="previewOpen"
      :name="current.name"
      :screenshot="current.screenshot"
    />
    <footer class="archive-exit">
      <div>
        <p class="archive-label">{{ c("// THERE'S A PERSON BEHIND THESE BUILDS.") }}</p>
        <h2 class="section-title">
          <CommonPageGlitch :text="c('MEET THE')" />
          <span><CommonPageGlitch :text="c('ENGINEER.')" :interval="10000" /></span>
        </h2>
      </div>
      <q-btn :to="localePath('/about')" flat no-caps no-ripple class="archive-button"
        ><AnimationGlitchText :text="c('Behind the signal')" /><q-icon
          name="east"
          size="20px"
          aria-hidden="true"
      /></q-btn>
      <div class="archive-exit__bottom">
        <span>{{ c("ARSAM SARKHOSH / SOFTWARE DEVELOPER") }}</span
        ><a href="#projects-main">{{ c("BACK TO TOP ↑") }}</a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/projects.css"></style>
