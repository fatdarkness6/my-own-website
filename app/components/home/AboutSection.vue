<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useScrollSections } from "~/composables/useScrollSections";

const { sections, currentIndex, isAnimating } = useScrollSections();
const cardRef = ref(null);
const mounted = ref(false);
const activeLine = ref(-1);
const completedLines = ref(new Set());
const typers = new Map();
let hasPlayed = false;
let disposed = false;

const titleLead = "ARCHITECTING HIGH-SPEED WEB SOLUTIONS WITH CLEAN CODE";
const titleAccent = "& MODERN TECH.";
const description =
  "Full-stack developer specializing in reactive Nuxt 3 interfaces and robust Node.js architectures.";
const secondary =
  "Engineered for high performance, smooth animations, and scalable systems.";

function setTyper(index, component) {
  if (component) typers.set(index, component);
  else typers.delete(index);
}

function startLine(index) {
  if (disposed) return;

  // Four copy blocks: eyebrow, title, description, second description.
  if (index >= 4) {
    activeLine.value = -1;
    cardRef.value?.play?.();
    return;
  }

  activeLine.value = index;

  // Wait for v-if to mount YOUR TypewriterText, then call its start().
  nextTick(() => {
    if (!disposed) typers.get(index)?.start?.();
  });
}

function onLineDone(index) {
  if (disposed || index !== activeLine.value) return;
  completedLines.value.add(index);
  startLine(index + 1);
}

watch(
  [() => sections[currentIndex.value]?.id, isAnimating, mounted, cardRef],
  ([id, animating, ready, card]) => {
    if (id !== "about" || animating || !ready || !card || hasPlayed) return;
    hasPlayed = true;
    startLine(0);
  },
  { immediate: true, flush: "post" },
);

onMounted(() => {
  mounted.value = true;
});

onBeforeUnmount(() => {
  disposed = true;
});
</script>

<template>
  <section class="about" aria-labelledby="about-title">
    <div class="about__grid-bg" aria-hidden="true" />

    <div class="about__inner">
      <div class="about__copy">
        <p class="about__eyebrow">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ "// 02. ABOUT" }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeLine === 0"
                :ref="(el) => setTyper(0, el)"
                text="// 02. ABOUT"
                :speed="28"
                prefix=""
                :cursor="true"
                @done="onLineDone(0)"
              />
              <template v-else-if="completedLines.has(0)">
                <AnimationGlitchTextTimer
                  text="// 02. ABOUT"
                  :interval="4200"
                />
              </template>
            </span>
            <span class="typed-text__accessible">{{ "// 02. ABOUT" }}</span>
          </span>
        </p>

        <h2 id="about-title" class="about__title">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ `${titleLead} ${titleAccent}` }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeLine === 1"
                :ref="(el) => setTyper(1, el)"
                :text="`${titleLead} ${titleAccent}`"
                :speed="14"
                prefix=""
                :cursor="true"
                @done="onLineDone(1)"
              />
              <template v-else-if="completedLines.has(1)">
                <!-- Final appearance after the complete heading has typed. -->
                <AnimationGlitchTextTimer :text="titleLead" :interval="5000" />
                {{ " " }}
                <AnimationGlitchTextTimer
                  :text="titleAccent"
                  :interval="6200"
                  class="about__accent"
                />
              </template>
            </span>
            <span class="typed-text__accessible">{{
              `${titleLead} ${titleAccent}`
            }}</span>
          </span>
        </h2>

        <p class="about__desc">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ description }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeLine === 2"
                :ref="(el) => setTyper(2, el)"
                :text="description"
                :speed="12"
                prefix=""
                :cursor="true"
                @done="onLineDone(2)"
              />
              <template v-else-if="completedLines.has(2)">
                <AnimationGlitchTextTimer
                  :text="description"
                  :interval="7000"
                />
              </template>
            </span>
            <span class="typed-text__accessible">{{ description }}</span>
          </span>
        </p>

        <!-- <p class="about__desc about__desc--secondary">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ secondary }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeLine === 3"
                :ref="(el) => setTyper(3, el)"
                :text="secondary"
                :speed="12"
                prefix=""
                :cursor="true"
                @done="onLineDone(3)"
              />
              <template v-else-if="completedLines.has(3)">
                <AnimationGlitchTextTimer :text="secondary" :interval="7600" />
              </template>
            </span>
            <span class="typed-text__accessible">{{ secondary }}</span>
          </span>
        </p> -->
      </div>

      <!-- Keep your current registered card name. -->
      <HomeDetailsAboutInfoCardVue ref="cardRef" class="about__card" />
    </div>
  </section>
</template>

<style scoped>
.about {
  --about-space: clamp(1.25rem, 3vw, 3rem);
  position: relative;
  isolation: isolate;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  box-sizing: border-box;
  display: grid;
  align-items: center;
  padding: var(--about-space);
  /* Optional extra clearance for a floating overlay header. */
  padding-block-start: calc(
    var(--about-space) + var(--about-top-clearance, 0px)
  );
  background: var(--bg, #000);
  color: var(--title-color, #f8fafc);
}

.about__grid-bg {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(rgb(59 130 246 / 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgb(59 130 246 / 0.055) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse at 30% 40%, #000, transparent 80%);
  pointer-events: none;
}

.about__inner {
  width: 100%;
  max-width: 80rem;
  min-width: 0;
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 4rem);
}

.about__copy,
.about__card {
  min-width: 0;
  width: 100%;
}

.about__eyebrow {
  margin: 0 0 1rem;
  font-family: var(--eyebrow-font, sans-serif);
  font-size: var(--eyebrow-size, 0.8125rem);
  line-height: 1.5;
  letter-spacing: 0.12em;
  color: var(--eyebrow-color, #3b82f6);
}

.about__title {
  margin: 0 0 clamp(1rem, 2vw, 1.75rem);
  max-width: 21ch;
  font-family: var(--title-font, sans-serif);
  /* A section-specific scale: this heading shares a row with a card. */
  font-size: clamp(1.875rem, 1.4rem + 1.15vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: 0.005em;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

/* Allow the glitch component roots to wrap with the heading. */
.about__title :deep(.glitch-text) {
  display: inline;
  white-space: normal;
  overflow-wrap: anywhere;
}

.about__accent {
  color: var(--eyebrow-color, #3b82f6);
}

.about__desc {
  max-width: 48ch;
  margin: 0;
  font-family: var(--description-font, sans-serif);
  font-size: var(--description-size, 1rem);
  line-height: 1.7;
  color: #cbd5e1;
  overflow-wrap: anywhere;
}

.about__desc--secondary {
  margin-top: 0.75rem;
  color: var(--description-color, #a8b3c4);
}

@media (max-width: 67.49rem) {
  .about__inner {
    grid-template-columns: minmax(0, 1fr);
    max-width: 42rem;
    gap: 1.75rem;
  }

  .about__copy {
    text-align: center;
  }

  .about__title,
  .about__desc {
    margin-inline: auto;
  }

  .about__title {
    max-width: 27ch;
    font-size: clamp(1.875rem, 1.25rem + 2vw, 2.75rem);
  }
}

/* Short desktop windows: trim spacing, not text readability. */
@media (min-width: 67.5rem) and (max-height: 45rem) {
  .about {
    --about-space: 1.25rem;
  }

  .about__inner {
    gap: 2rem;
  }
}

/* Reserve the completed text's space so the layout stays stable. */
.typed-text {
  position: relative;
  display: grid;
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}
.typed-text__reserve,
.typed-text__live {
  grid-area: 1 / 1;
  min-width: 0;
}
.typed-text__reserve {
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}
.typed-text :deep(.typewriter),
.typed-text :deep(.typewriter__text),
.typed-text :deep(.glitch-text) {
  display: inline;
  font: inherit;
  white-space: normal;
  overflow-wrap: anywhere;
}
.typed-text__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
