<script setup>
import { projects } from "~/assets/data/projects";

/* ---------- scroll section state ---------- */
const { sections, currentIndex, isAnimating } = useScrollSections();

/* ---------- copy ---------- */
const titleLead = "DEPLOYED PAYLOADS";
const titleAccent = "& SHIPPED SYSTEMS.";
const title = `${titleLead} ${titleAccent}`;
const description = "Production builds, experiments and tools I've shipped.";

const featured = projects.slice(0, 4);

const revealed = ref(false);

const { play, line } = useTypingSequence(["eyebrow", "title", "desc"], {
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
  canPrev.value = el.scrollLeft > 4;
  canNext.value = el.scrollLeft < max - 4;
  progress.value = max > 0 ? el.scrollLeft / max : 1;
  const s = step();
  activeIdx.value = canNext.value
    ? Math.round(el.scrollLeft / (s || 1))
    : featured.length - 1;
}

const go = (dir) =>
  trackRef.value?.scrollBy({ left: dir * step(), behavior: "smooth" });

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
            text="// 03. PROJECTS"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="projects-title" class="projects__title title">
          <AnimationTypedLine :text="title" :speed="14" v-bind="line('title')">
            <AnimationGlitchTextTimer :text="titleLead" :interval="5000" />
            {{ " " }}
            <AnimationGlitchTextTimer
              :text="titleAccent"
              :interval="6200"
              class="projects__accent"
            />
          </AnimationTypedLine>
        </h2>

        <p class="projects__desc description">
          <AnimationTypedLine
            :text="description"
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
          :class="{ 'is-revealed': revealed }"
          @scroll.passive="update"
        >
          <div
            v-for="(p, i) in featured"
            :key="p.id"
            class="projects__slot"
            :style="{ '--i': i }"
          >
            <AnimationGlitchCard
              :image="p.image"
              :alt="p.name"
              :interval="5200 + i * 900"
            >
              <template #media>
                <span class="pcard__index">{{ hex(i) }}</span>
                <span class="pcard__status" :class="`is-${p.status}`">
                  ● {{ p.status.toUpperCase() }}
                </span>
              </template>

              <p class="pcard__meta">{{ p.year }} · {{ p.role }}</p>

              <h3 class="pcard__name">
                <AnimationGlitchTextTimer
                  :text="p.name"
                  :interval="4800 + i * 700"
                />
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
                  <AnimationGlitchText text="> live" />
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
                  <AnimationGlitchText text="> source" />
                </q-btn>
              </div>
            </AnimationGlitchCard>
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
            icon="chevron_left"
            class="projects__arrow gt-xs"
            :disable="!canPrev"
            aria-label="Previous project"
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
            icon="chevron_right"
            class="projects__arrow gt-xs"
            :disable="!canNext"
            aria-label="Next project"
            @click="go(1)"
          />
        </div>

        <q-btn unelevated square no-caps to="/projects" class="projects__cta">
          <AnimationGlitchText text="> cd ./projects --all" />
          <q-icon name="arrow_forward" size="18px" class="q-ml-sm" />
        </q-btn>
      </footer>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/projectsSection.css"></style>
