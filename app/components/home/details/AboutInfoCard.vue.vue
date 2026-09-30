<script setup>
import { useQuasar } from "quasar";

const started = ref(false);
const finished = ref(false);
const activeStep = ref(null);
const completedSteps = ref(new Set());
const visibleNumbers = ref(new Set());
const typers = new Map();
let hasPlayed = false;
let disposed = false;

const $q = useQuasar();
const summary =
  "I don't just write lines of code; I solve complex architectural puzzles. Whether it's crafting SEO-friendly SSR applications in Nuxt or designing high-concurrency Node APIs, I prioritize clean architecture and intuitive UI/UX.";

const codeLines = [
  {
    id: "code-1",
    number: "01",
    indent: false,
    text: "const developer = {",
    parts: [
      { text: "const", class: "c-key" },
      { text: " " },
      { text: "developer", class: "c-var" },
      { text: " = {" },
    ],
  },
  {
    id: "code-2",
    number: "02",
    indent: true,
    text: 'name: "Arsam",',
    parts: [
      { text: "name", class: "c-prop" },
      { text: ": " },
      { text: '"Arsam"', class: "c-str" },
      { text: "," },
    ],
  },
  {
    id: "code-3",
    number: "03",
    indent: true,
    text: 'role: "Full Stack Developer",',
    parts: [
      { text: "role", class: "c-prop" },
      { text: ": " },
      { text: '"Full Stack Developer"', class: "c-str" },
      { text: "," },
    ],
  },
  {
    id: "code-4",
    number: "04",
    indent: true,
    text: "core: ['Nuxt 3', 'Node.js', 'TypeScript'],",
    parts: [
      { text: "core", class: "c-prop" },
      { text: ": [" },
      { text: "'Nuxt 3'", class: "c-str" },
      { text: ", " },
      { text: "'Node.js'", class: "c-str" },
      { text: ", " },
      { text: "'TypeScript'", class: "c-str" },
      { text: "]," },
    ],
  },
  {
    id: "code-5",
    number: "05",
    indent: true,
    text: 'mission: "Building impactful digital tools"',
    parts: [
      { text: "mission", class: "c-prop" },
      { text: ": " },
      {
        text: '"Building impactful digital tools"',
        class: "c-str c-str--accent",
      },
    ],
  },
  {
    id: "code-6",
    number: "06",
    indent: false,
    text: "};",
    parts: [{ text: "};" }],
  },
];

const stats = [
  { value: "NUXT", label: "Core Specialty" },
  { value: "10+", label: "Dedicated Pages" },
  { value: "100%", label: "Type-Safe Code" },
];

const order = [
  "filename",
  ...codeLines.map((line) => line.id),
  "summary-label",
  "summary",
  ...stats.flatMap((_, index) => [
    `stat-${index}-value`,
    `stat-${index}-label`,
  ]),
  "link",
];

function setTyper(id, component) {
  if (component) typers.set(id, component);
  else typers.delete(id);
}

function startStep(index) {
  if (disposed) return;
  if (index >= order.length) {
    activeStep.value = null;
    finished.value = true;
    return;
  }

  const id = order[index];
  activeStep.value = id;
  if (id.startsWith("code-")) visibleNumbers.value.add(id);

  nextTick(() => {
    if (!disposed) typers.get(id)?.start?.();
  });
}

function onStepDone(id) {
  if (disposed || activeStep.value !== id) return;
  completedSteps.value.add(id);
  startStep(order.indexOf(id) + 1);
}

function play() {
  if (hasPlayed || disposed) return;
  hasPlayed = true;
  started.value = true;
  startStep(0);
}

onBeforeUnmount(() => {
  disposed = true;
});

defineExpose({ play });
</script>

<template>
  <q-card
    flat
    class="terminal-card"
    :class="{ 'terminal-card--waiting': !started }"
    :aria-hidden="!started ? 'true' : undefined"
    :inert="!started"
  >
    <q-card-section class="terminal-card__bar">
      <div class="terminal-card__dots" aria-hidden="true">
        <span class="terminal-card__dot terminal-card__dot--red" />
        <span class="terminal-card__dot terminal-card__dot--yellow" />
        <span class="terminal-card__dot terminal-card__dot--green" />
      </div>
      <span class="terminal-card__filename">
        <span class="typed-text">
          <span class="typed-text__reserve" aria-hidden="true"
            >{{ "arsam.config.ts" }}█</span
          >
          <span class="typed-text__live" aria-hidden="true">
            <AnimationTypewriterText
              v-if="activeStep === 'filename'"
              :ref="(el) => setTyper('filename', el)"
              text="arsam.config.ts"
              :speed="18"
              prefix=""
              :cursor="true"
              @done="onStepDone('filename')"
            />
            <template v-else-if="completedSteps.has('filename')">
              <AnimationGlitchTextTimer
                text="arsam.config.ts"
                :interval="5400"
              />
            </template>
          </span>
          <span class="typed-text__accessible">{{ "arsam.config.ts" }}</span>
        </span>
      </span>
    </q-card-section>

    <q-separator dark />

    <q-card-section class="terminal-card__code">
      <div v-for="line in codeLines" :key="line.id" class="code-line">
        <span
          class="code-line__num"
          :style="{
            visibility: visibleNumbers.has(line.id) ? 'visible' : 'hidden',
          }"
          aria-hidden="true"
          >{{ line.number }}</span
        >
        <code
          class="code-line__content"
          :class="{ 'code-line__content--indent': line.indent }"
        >
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ line.text }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeStep === line.id"
                :ref="(el) => setTyper(line.id, el)"
                :text="line.text"
                :speed="10"
                prefix=""
                :cursor="true"
                @done="onStepDone(line.id)"
              />
              <template v-else-if="completedSteps.has(line.id)">
                <!-- Restore syntax colors after this line finishes typing. -->
                <span
                  v-for="(part, index) in line.parts"
                  :key="index"
                  :class="part.class"
                  >{{ part.text }}</span
                >
              </template>
            </span>
            <span class="typed-text__accessible">{{ line.text }}</span>
          </span>
        </code>
      </div>

      <h3 class="terminal-card__summary-label">
        <span class="typed-text">
          <span class="typed-text__reserve" aria-hidden="true"
            >{{ "About me summary" }}█</span
          >
          <span class="typed-text__live" aria-hidden="true">
            <AnimationTypewriterText
              v-if="activeStep === 'summary-label'"
              :ref="(el) => setTyper('summary-label', el)"
              text="About me summary"
              :speed="16"
              prefix=""
              :cursor="true"
              @done="onStepDone('summary-label')"
            />
            <template v-else-if="completedSteps.has('summary-label')">
              <span>{{ "About me summary" }}</span>
            </template>
          </span>
          <span class="typed-text__accessible">{{ "About me summary" }}</span>
        </span>
      </h3>

      <p class="terminal-card__summary">
        <span class="typed-text">
          <span class="typed-text__reserve" aria-hidden="true"
            >{{ summary }}█</span
          >
          <span class="typed-text__live" aria-hidden="true">
            <AnimationTypewriterText
              v-if="activeStep === 'summary'"
              :ref="(el) => setTyper('summary', el)"
              :text="summary"
              :speed="12"
              prefix=""
              :cursor="true"
              @done="onStepDone('summary')"
            />
            <template v-else-if="completedSteps.has('summary')">
              <span>{{ summary }}</span>
            </template>
          </span>
          <span class="typed-text__accessible">{{ summary }}</span>
        </span>
      </p>
    </q-card-section>

    <q-separator dark />

    <q-card-section class="terminal-card__stats" v-show="!$q.screen.lt.sm">
      <div v-for="(stat, index) in stats" :key="stat.label" class="stat-box">
        <span class="stat-box__value">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ stat.value }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeStep === `stat-${index}-value`"
                :ref="(el) => setTyper(`stat-${index}-value`, el)"
                :text="stat.value"
                :speed="16"
                prefix=""
                :cursor="true"
                @done="onStepDone(`stat-${index}-value`)"
              />
              <template v-else-if="completedSteps.has(`stat-${index}-value`)">
                <AnimationGlitchTextTimer
                  :text="stat.value"
                  :interval="6500 + index * 400"
                />
              </template>
            </span>
            <span class="typed-text__accessible">{{ stat.value }}</span>
          </span>
        </span>
        <span class="stat-box__label">
          <span class="typed-text">
            <span class="typed-text__reserve" aria-hidden="true"
              >{{ stat.label }}█</span
            >
            <span class="typed-text__live" aria-hidden="true">
              <AnimationTypewriterText
                v-if="activeStep === `stat-${index}-label`"
                :ref="(el) => setTyper(`stat-${index}-label`, el)"
                :text="stat.label"
                :speed="12"
                prefix=""
                :cursor="true"
                @done="onStepDone(`stat-${index}-label`)"
              />
              <template v-else-if="completedSteps.has(`stat-${index}-label`)">
                <span>{{ stat.label }}</span>
              </template>
            </span>
            <span class="typed-text__accessible">{{ stat.label }}</span>
          </span>
        </span>
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-actions class="terminal-card__actions">
      <q-btn
        flat
        no-caps
        no-ripple
        :disable="!finished"
        to="/about"
        class="terminal-card__link"
      >
        <span class="typed-text">
          <span class="typed-text__reserve" aria-hidden="true"
            >{{ "Explore my full story & philosophy" }}█</span
          >
          <span class="typed-text__live" aria-hidden="true">
            <AnimationTypewriterText
              v-if="activeStep === 'link'"
              :ref="(el) => setTyper('link', el)"
              text="Explore my full story & philosophy"
              :speed="12"
              prefix=""
              :cursor="true"
              @done="onStepDone('link')"
            />
            <template v-else-if="completedSteps.has('link')">
              <span>{{ "Explore my full story & philosophy" }}</span>
            </template>
          </span>
          <span class="typed-text__accessible">{{
            "Explore my full story & philosophy"
          }}</span>
        </span>
        <q-icon
          name="arrow_forward"
          size="18px"
          :style="{ visibility: finished ? 'visible' : 'hidden' }"
          aria-hidden="true"
        />
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<style scoped>
.terminal-card {
  --card-pad: clamp(0.875rem, 1.5vw, 1.25rem);
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: #0f141b;
  color: var(--title-color, #f8fafc);
  border: 1px solid rgb(59 130 246 / 0.28);
  border-radius: 0 16px 0px 16px;
  box-shadow: 0 16px 48px rgb(0 0 0 / 0.22);
  overflow: hidden;
}

.terminal-card::before,
.terminal-card::after {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--eyebrow-color, #3b82f6);
  border-style: solid;
  pointer-events: none;
  z-index: 2;
}

.terminal-card::before {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
}

.terminal-card::after {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
}

.terminal-card__bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  padding: 0.75rem var(--card-pad);
  background: #161b22;
}

.terminal-card__dots {
  display: flex;
  gap: 6px;
}

.terminal-card__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.terminal-card__dot--red {
  background: #ff5f56;
}
.terminal-card__dot--yellow {
  background: #ffbd2e;
}
.terminal-card__dot--green {
  background: #27c93f;
}

.terminal-card__filename {
  min-width: 0;
  text-align: right;
  font-family: var(--description-font, sans-serif);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #b8c3d3;
  overflow-wrap: anywhere;
}

.terminal-card__code {
  padding: var(--card-pad);
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: clamp(0.8125rem, 0.75rem + 0.15vw, 0.9375rem);
  line-height: 1.7;
}

.code-line {
  display: grid;
  grid-template-columns: 2ch minmax(0, 1fr);
  column-gap: 0.75rem;
  align-items: start;
}

.code-line__num {
  color: #8492a6;
  text-align: right;
  user-select: none;
}

.code-line__content {
  min-width: 0;
  font: inherit;
  color: #f1f5f9;
  white-space: normal;
  overflow-wrap: anywhere;
}

.code-line__content--indent {
  padding-inline-start: 1ch;
}
.c-key {
  color: #ff8cbd;
}
.c-var {
  color: #f1f5f9;
}
.c-prop {
  color: #8de3d2;
}
.c-str {
  color: #f2d398;
}
.c-str--accent {
  color: #83b5ff;
}

.terminal-card__summary-label {
  margin: 1rem 0 0.5rem;
  font-family: var(--description-font, sans-serif);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5;
  color: #e2e8f0;
}

.terminal-card__summary {
  min-width: 0;
  margin: 0;
  font-family: var(--description-font, sans-serif);
  font-size: clamp(0.875rem, 0.825rem + 0.15vw, 1rem);
  line-height: 1.7;
  color: #bcc7d6;
  overflow-wrap: anywhere;
}

/* Keep the card's space reserved until its turn in the sequence. */
.terminal-card--waiting {
  visibility: hidden;
  pointer-events: none;
}

.terminal-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.875rem var(--card-pad);
}

.stat-box {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 0.375rem;
  text-align: center;
  background: rgb(59 130 246 / 0.055);
  border: 1px solid rgb(59 130 246 / 0.17);
}

.stat-box__value {
  font-family: var(--eyebrow-font, sans-serif);
  font-size: clamp(0.9375rem, 0.8rem + 0.35vw, 1.125rem);
  font-weight: 700;
  line-height: 1.3;
  color: #83b5ff;
  overflow-wrap: anywhere;
}

.stat-box__label {
  font-family: var(--description-font, sans-serif);
  font-size: 0.75rem;
  line-height: 1.45;
  color: #b8c3d3;
  overflow-wrap: anywhere;
}

.terminal-card__actions {
  padding: 0.5rem;
}

.terminal-card__link {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.625rem;
  font-family: var(--description-font, sans-serif);
  font-size: 0.875rem;
  line-height: 1.5;
  letter-spacing: normal;
  color: #c5dcff;
}

.terminal-card__link :deep(.q-btn__content) {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
}

.terminal-card__link:focus-visible {
  outline: 2px solid #83b5ff;
  outline-offset: -2px;
}

/* At very narrow/zoomed widths, prioritize readability over compactness. */
@media (max-width: 22rem) {
  .terminal-card__stats {
    grid-template-columns: minmax(0, 1fr);
  }
  .stat-box {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    text-align: left;
    padding: 0.625rem;
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
