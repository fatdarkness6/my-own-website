<script setup>
const { sections, currentIndex, isAnimating } = useScrollSections();

const titleLead = "THE EXPERIENCE";
const titleAccent = "BEHIND THE CODE.";
const title = `${titleLead} ${titleAccent}`;
const description =
  "Explore my experience, technical skills, and education—all in one place.";
const linkText = "View my résumé";

// A contents preview, not invented jobs, qualifications, or achievements.
// Keep these categories in sync with your eventual /resume page.
const entries = [
  {
    id: "experience",
    number: "01",
    title: "Experience",
    detail: "Roles & responsibilities",
  },
  {
    id: "skills",
    number: "02",
    title: "Technical skills",
    detail: "Tools & technologies",
  },
  {
    id: "education",
    number: "03",
    title: "Education",
    detail: "Background & qualifications",
  },
];

const order = [
  "eyebrow",
  "title",
  "desc",
  "document",
  ...entries.flatMap((entry) => [`${entry.id}-title`, `${entry.id}-detail`]),
  "link",
];

const { play, line, isActive, isDone, started, finished } =
  useTypingSequence(order);

const inView = computed(
  () => sections[currentIndex.value]?.id === "resume" && !isAnimating.value,
);
const previewVisible = computed(
  () => isActive("document") || isDone("document"),
);

watch(
  inView,
  (visible) => {
    if (visible && !started.value) play();
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section class="resume" aria-labelledby="resume-title">
    <div class="resume__grid-bg" aria-hidden="true" />

    <div class="resume__inner">
      <header class="resume__copy">
        <p class="resume__eyebrow">
          <AnimationTypedLine
            text="// 04. RESUME"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="resume-title" class="resume__title">
          <AnimationTypedLine :text="title" :speed="18" v-bind="line('title')">
            <AnimationGlitchTextTimer :text="titleLead" :interval="5000" />
            {{ " " }}
            <AnimationGlitchTextTimer
              :text="titleAccent"
              :interval="6200"
              class="resume__accent"
            />
          </AnimationTypedLine>
        </h2>

        <p class="resume__desc">
          <AnimationTypedLine
            :text="description"
            :speed="14"
            :glitch="7000"
            v-bind="line('desc')"
          />
        </p>
      </header>

      <div
        class="resume-index"
        :class="{ 'resume-index--waiting': !previewVisible }"
        :aria-hidden="!previewVisible ? 'true' : undefined"
        :inert="!previewVisible"
      >
        <div class="resume-index__bar">
          <svg
            class="resume-index__document"
            width="18"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"
            />
            <path d="M14 3v5h5M9 12h6M9 16h6" />
          </svg>
          <span class="resume-index__filename">
            <AnimationTypedLine
              text="resume.index"
              :speed="20"
              :glitch="5800"
              v-bind="line('document')"
            />
          </span>
          <span class="resume-index__bar-mark" aria-hidden="true">[ ]</span>
        </div>

        <ol class="resume-index__list" aria-label="Résumé contents">
          <li
            v-for="entry in entries"
            :key="entry.id"
            class="resume-index__row"
          >
            <span
              class="resume-index__number"
              :style="{
                visibility:
                  isActive(`${entry.id}-title`) || isDone(`${entry.id}-title`)
                    ? 'visible'
                    : 'hidden',
              }"
              aria-hidden="true"
            >
              {{ entry.number }}
            </span>
            <div class="resume-index__entry">
              <h3 class="resume-index__heading">
                <AnimationTypedLine
                  :text="entry.title"
                  :speed="18"
                  v-bind="line(`${entry.id}-title`)"
                />
              </h3>
              <p class="resume-index__detail">
                <AnimationTypedLine
                  :text="entry.detail"
                  :speed="12"
                  v-bind="line(`${entry.id}-detail`)"
                />
              </p>
            </div>
          </li>
        </ol>

        <q-btn
          unelevated
          square
          no-caps
          no-ripple
          to="/resume"
          :disable="!finished"
          class="resume-index__link"
        >
          <AnimationTypedLine
            :text="linkText"
            :speed="20"
            v-bind="line('link')"
          />
          <svg
            class="resume-index__arrow"
            :style="{ visibility: finished ? 'visible' : 'hidden' }"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </q-btn>
      </div>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/resumeSection.css"></style>
