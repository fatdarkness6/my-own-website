<script setup>
const { c, localePath, rtl, content } = usePortfolioI18n();
import { projects, projectPlaceholder } from "~/assets/data/projects";
import { projectPath } from "#shared/projectRoutes";
import { homeCopy } from "~/assets/data/homeCopy";

/* ---------- scroll section state ---------- */
const { sections, currentIndex, isAnimating } = useScrollSections();

/* ---------- copy ---------- */
const titleSegments = content(homeCopy.projects.title);
const description = "Selected platforms and systems I've built or worked on.";

const featured = content(projects.slice(0, 4));
const projectLocation = (id) => localePath(projectPath(id));
let cardPointerStart = null;
function openProject(event, id) {
  // Preserve the live/source links and do not navigate after swiping the rail.
  if (event.target.closest("a, button, input, [role='button']")) return;
  if (cardPointerStart && Math.hypot(
    event.clientX - cardPointerStart.x,
    event.clientY - cardPointerStart.y,
  ) > 10) return;
  navigateTo(projectLocation(id));
}

const revealed = ref(false);

const { play, line } = useTypingSequence(["eyebrow", "title", "desc"], {
  onceKey: "home-projects",
  onFinish: () => {
    revealed.value = true;
    nextTick(update);
  },
});

const inView = computed(
  () => sections[currentIndex.value]?.id === "projects" && !isAnimating.value,
);

watch(inView, (visible) => visible && play(), {
  immediate: true,
  flush: "post",
});

/* ---------- rail navigation ---------- */
const trackRef = ref(null);
const canPrev = ref(false);
const canNext = ref(false);
const activeIdx = ref(0);
const progress = ref(0);

const pad = (n) => String(n).padStart(2, "0");
const hex = (i) => `0x${pad(i + 1)}`;

function step() {
  const el = trackRef.value;
  const slot = el?.querySelector(".projects__slot");
  if (!slot) return 0;
  return slot.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
}

function update() {
  const el = trackRef.value;
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  const position = Math.abs(el.scrollLeft);
  canPrev.value = position > 4;
  canNext.value = position < max - 4;
  progress.value = max > 0 ? position / max : 1;
  const s = step();
  activeIdx.value = canNext.value
    ? Math.round(position / (s || 1))
    : featured.value.length - 1;
}

const go = (dir) =>
  trackRef.value?.scrollBy({ left: dir * step() * (rtl.value ? -1 : 1), behavior: "smooth" });

let ro = null;

onMounted(() => {
  update();
  ro = new ResizeObserver(update);
  if (trackRef.value) ro.observe(trackRef.value);
});

onBeforeUnmount(() => ro?.disconnect());
</script>

<template>
  <section class="projects" aria-labelledby="projects-title">
    <div class="projects__grid-bg" aria-hidden="true" />

    <div class="projects__inner container">
      <!-- ============ HEAD ============ -->
      <header class="projects__head">
        <p class="projects__eyebrow eyebrow">
          <AnimationTypedLine
            :text="c('// 03. PROJECTS')"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="projects-title" class="projects__title section-title">
          <AnimationSegmentedLine
            :segments="titleSegments"
            :speed="14"
            v-bind="line('title')"
          />
        </h2>

        <p class="projects__desc description">
          <AnimationTypedLine
            :text="c(description)"
            :glitch="7000"
            v-bind="line('desc')"
          />
        </p>
      </header>

      <!-- ============ CARDS RAIL ============ -->
      <div class="projects__rail">
        <div
          ref="trackRef"
          class="projects__track"
          @scroll.passive="update"
        >
          <div
            v-for="(p, i) in featured"
            :key="p.id"
            class="projects__slot"
          >
            <CommonHackerReveal
              :show="revealed"
              :delay="i * 110"
              class="projects__card-reveal"
            >
              <AnimationGlitchCard
                class="projects__clickable-card"
                @pointerdown="cardPointerStart = { x: $event.clientX, y: $event.clientY }"
                @click="openProject($event, p.id)"
                :image="p.screenshot?.optimizedSrc || (p.screenshot ?? projectPlaceholder).src"
                :alt="(p.screenshot ?? projectPlaceholder).alt"
                :interval="5200 + i * 900"
              >
                <template #media>
                  <span class="pcard__index">{{ hex(i) }}</span>
                  <span v-if="p.status" class="pcard__status" :class="`is-${p.status}`">
                    ● {{ c(p.status.toUpperCase()) }}
                  </span>
                </template>

                <p class="pcard__meta">
                  <template v-if="p.year">{{ p.year }} · </template>{{ p.role }}
                </p>

                <h3 class="pcard__name">
                  <NuxtLink :to="projectLocation(p.id)" :aria-label="`${c('View project')}: ${p.name}`" class="pcard__detail-link">
                  <AnimationGlitchTextTimer
                    :text="c(p.name)"
                    :interval="4800 + i * 700"
                  />
                  </NuxtLink>
                </h3>

                <p class="pcard__summary">{{ p.summary }}</p>

                <div class="pcard__stack">
                  <q-chip
                    v-for="s in p.stack.slice(0, 3)"
                    :key="s"
                    dense
                    square
                    outline
                    class="pcard__chip"
                  >
                    {{ s }}
                  </q-chip>
                </div>

                <div class="pcard__links">
                  <q-btn
                    v-if="p.live"
                    flat
                    dense
                    no-caps
                    square
                    :href="p.live"
                    target="_blank"
                    class="pcard__link"
                  >
                    <AnimationGlitchText :text="c('> live')" />
                  </q-btn>
                  <q-btn
                    v-if="p.repo"
                    flat
                    dense
                    no-caps
                    square
                    :href="p.repo"
                    target="_blank"
                    class="pcard__link"
                  >
                    <AnimationGlitchText :text="c('> source')" />
                  </q-btn>
                </div>
              </AnimationGlitchCard>
            </CommonHackerReveal>
          </div>
        </div>
      </div>

      <!-- ============ FOOTER ============ -->
      <footer class="projects__foot" :class="{ 'is-revealed': revealed }">
        <div v-show="canPrev || canNext" class="projects__nav">
          <q-btn
            flat
            square
            dense
            :icon="rtl ? 'chevron_right' : 'chevron_left'"
            class="projects__arrow gt-xs"
            :disable="!canPrev"
            :aria-label="c('Previous project')"
            @click="go(-1)"
          />

          <span class="projects__count">
            {{ pad(activeIdx + 1) }}
            <span class="projects__count-sep">/</span>
            {{ pad(featured.length) }}
          </span>

          <q-linear-progress
            :value="progress"
            instant-feedback
            track-color="transparent"
            class="projects__progress"
          />

          <q-btn
            flat
            square
            dense
            :icon="rtl ? 'chevron_left' : 'chevron_right'"
            class="projects__arrow gt-xs"
            :disable="!canNext"
            :aria-label="c('Next project')"
            @click="go(1)"
          />
        </div>

        <q-btn unelevated square no-caps :to="localePath('/projects')" class="projects__cta">
          <AnimationGlitchText :text="c('> cd ./projects --all')" />
          <q-icon name="arrow_forward" size="18px" class="q-ml-sm" />
        </q-btn>
      </footer>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/projectsSection.css"></style>
