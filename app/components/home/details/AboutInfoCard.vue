<script setup>
const $q = useQuasar();

const summary =
  "I don't just write lines of code; I solve complex architectural puzzles. Whether it's crafting SEO-friendly SSR applications in Nuxt or designing high-concurrency Node APIs, I prioritize clean architecture and intuitive UI/UX.";
const linkText = "Explore my full story & philosophy";

const codeLines = [
  {
    id: "code-1",
    number: "01",
    indent: false,
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
    parts: [
      { text: "mission", class: "c-prop" },
      { text: ": " },
      {
        text: '"Building impactful digital tools"',
        class: "c-str c-str--accent",
      },
    ],
  },
  { id: "code-6", number: "06", indent: false, parts: [{ text: "};" }] },
].map((l) => ({ ...l, text: l.parts.map((p) => p.text).join("") }));

const stats = [
  { value: "NUXT", label: "Core Specialty" },
  { value: "10+", label: "Dedicated Pages" },
  { value: "100%", label: "Type-Safe Code" },
];

const showStats = computed(() => !$q.screen.lt.sm);

const order = computed(() => [
  "filename",
  ...codeLines.map((l) => l.id),
  "summary-label",
  "summary",
  ...(showStats.value
    ? stats.flatMap((_, i) => [`stat-${i}-value`, `stat-${i}-label`])
    : []),
  "link",
]);

const { play, line, isActive, isDone, started, finished } =
  useTypingSequence(order, { onceKey: "home-about-card" });

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
        <AnimationTypedLine
          text="arsam.config.ts"
          :speed="18"
          :glitch="5400"
          v-bind="line('filename')"
        />
      </span>
    </q-card-section>

    <q-separator dark />

    <q-card-section class="terminal-card__code">
      <div v-for="l in codeLines" :key="l.id" class="code-line">
        <span
          class="code-line__num"
          :style="{
            visibility: isActive(l.id) || isDone(l.id) ? 'visible' : 'hidden',
          }"
          aria-hidden="true"
          >{{ l.number }}</span
        >
        <code
          class="code-line__content"
          :class="{ 'code-line__content--indent': l.indent }"
        >
          <AnimationTypedLine :text="l.text" :speed="10" v-bind="line(l.id)">
            <span v-for="(p, i) in l.parts" :key="i" :class="p.class">{{
              p.text
            }}</span>
          </AnimationTypedLine>
        </code>
      </div>

      <h3 class="terminal-card__summary-label">
        <AnimationTypedLine
          text="About me summary"
          :speed="16"
          v-bind="line('summary-label')"
        />
      </h3>

      <p class="terminal-card__summary">
        <AnimationTypedLine :text="summary" v-bind="line('summary')" />
      </p>
    </q-card-section>

    <q-separator dark />

    <q-card-section v-show="showStats" class="terminal-card__stats">
      <div v-for="(stat, i) in stats" :key="stat.label" class="stat-box">
        <span class="stat-box__value">
          <AnimationTypedLine
            :text="stat.value"
            :speed="16"
            :glitch="6500 + i * 400"
            v-bind="line(`stat-${i}-value`)"
          />
        </span>
        <span class="stat-box__label">
          <AnimationTypedLine
            :text="stat.label"
            v-bind="line(`stat-${i}-label`)"
          />
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
        <AnimationTypedLine :text="linkText" v-bind="line('link')" />
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

<style
  scoped
  src="~/assets/css/components/home/details/aboutInfoCard.css"
></style>
