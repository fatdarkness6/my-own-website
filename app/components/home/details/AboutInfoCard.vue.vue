<script setup>
import { ref } from "vue";

const summaryTyper = ref(null);
const hasPlayed = ref(false);

// Exposed to the parent AboutSection — called once when this section
// becomes the active scroll-snap section.
function play() {
  if (hasPlayed.value) return;
  hasPlayed.value = true;
  setTimeout(() => summaryTyper.value?.start(), 400);
}

defineExpose({ play });

const stats = [
  { value: "Nuxt/Node", label: "Core Specialty" },
  { value: "10+", label: "Dedicated Pages" },
  { value: "100%", label: "Type-Safe Code" },
];
</script>

<template>
  <q-card flat class="terminal-card">
    <!-- Window title bar -->
    <q-card-section class="terminal-card__bar">
      <div class="terminal-card__dots">
        <span class="terminal-card__dot terminal-card__dot--red" />
        <span class="terminal-card__dot terminal-card__dot--yellow" />
        <span class="terminal-card__dot terminal-card__dot--green" />
      </div>
      <span class="terminal-card__filename">
        <AnimationGlitchTextTimer text="arsam.config.ts" :interval="5400" />
      </span>
    </q-card-section>

    <q-separator dark />

    <!-- Code body -->
    <q-card-section class="terminal-card__code">
      <div class="code-line">
        <span class="code-line__num">01</span>
        <span class="code-line__content">
          <span class="c-key">const</span>
          <span class="c-var">developer</span> = {
        </span>
      </div>
      <div class="code-line">
        <span class="code-line__num">02</span>
        <span class="code-line__content">
          &nbsp;&nbsp;<span class="c-prop">name</span>:
          <span class="c-str">"Arsam"</span>,
        </span>
      </div>
      <div class="code-line">
        <span class="code-line__num">03</span>
        <span class="code-line__content">
          &nbsp;&nbsp;<span class="c-prop">role</span>:
          <span class="c-str">"Full Stack Developer"</span>,
        </span>
      </div>
      <div class="code-line">
        <span class="code-line__num">04</span>
        <span class="code-line__content">
          &nbsp;&nbsp;<span class="c-prop">core</span>: [
          <span class="c-str">'Nuxt 3'</span>,
          <span class="c-str">'Node.js'</span>,
          <span class="c-str">'TypeScript'</span> ],
        </span>
      </div>
      <div class="code-line">
        <span class="code-line__num">05</span>
        <span class="code-line__content">
          &nbsp;&nbsp;<span class="c-prop">mission</span>:
          <span class="c-str c-str--accent"
            >"Building impactful digital tools"</span
          >
        </span>
      </div>
      <div class="code-line">
        <span class="code-line__num">06</span>
        <span class="code-line__content">};</span>
      </div>

      <div class="code-line code-line--comment">
        <span class="code-line__num">07</span>
        <span class="code-line__content code-line__content--label">
          About Me Summary:
        </span>
      </div>

      <p class="terminal-card__summary">
        <AnimationTypewriterText
          ref="summaryTyper"
          text="I don't just write lines of code; I solve complex architectural puzzles. Whether it's crafting SEO-friendly SSR applications in Nuxt or designing high-concurrency Node APIs, I prioritize clean architecture and intuitive UI/UX."
          :speed="12"
          prefix=""
          :cursor="true"
        />
      </p>
    </q-card-section>

    <q-separator dark />

    <!-- Stats row — Quasar grid handles the responsive stacking -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-4">
          <div class="stat-box">
            <span class="stat-box__value">
              <AnimationGlitchText :text="stat.value" trigger="self" />
            </span>
            <span class="stat-box__label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator dark />

    <!-- Footer link -->
    <q-card-actions>
      <q-btn
        flat
        no-caps
        no-ripple
        dense
        to="/about"
        class="terminal-card__link description"
      >
        <AnimationGlitchText text="Explore Full About Page & Philosophy" />
        <q-icon name="arrow_forward" size="16px" class="q-ml-sm" />
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<style scoped>
.terminal-card {
  position: relative;
  background: #0f141b;
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 0 16px 16px 0;
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.1);
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

/* ---- Title bar ---- */
.terminal-card__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
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
  background: #2a3441;
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
  flex: 1;
  text-align: center;
  font-family: var(--description-font);
  font-size: clamp(11px, 0.5vw + 9px, 13px);
  color: var(--description-color);
}

/* ---- Code section ---- */
.terminal-card__code {
  padding: 18px 16px;
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(10.5px, 0.5vw + 8px, 13px);
  line-height: 1.85;
}

.code-line {
  display: flex;
  gap: 14px;
  white-space: pre;
}

.code-line__num {
  flex-shrink: 0;
  width: 18px;
  color: #4b5563;
  user-select: none;
  text-align: right;
}

.code-line__content {
  color: var(--title-color);
  white-space: pre-wrap;
}

.code-line__content--label {
  font-weight: 700;
  color: var(--title-color);
}

.code-line--comment {
  margin-top: 10px;
}

.c-key {
  color: #ff7ab2;
}
.c-var {
  color: var(--title-color);
}
.c-prop {
  color: #7fdbca;
}
.c-str {
  color: #ecc48d;
}
.c-str--accent {
  color: var(--eyebrow-color, #3b82f6);
}

.terminal-card__summary {
  margin: 10px 0 0;
  padding-left: 32px;
  font-family: var(--description-font);
  color: var(--description-color);
  font-size: clamp(11.5px, 0.5vw + 9px, 14px);
  line-height: 1.7;
  max-width: 62ch;
}

/* ---- Stats ---- */
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 12px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  text-align: center;
}

.stat-box__value {
  font-family: var(--eyebrow-font);
  font-size: clamp(14px, 0.9vw + 10px, 18px);
  font-weight: 700;
  color: var(--eyebrow-color);
}

.stat-box__label {
  font-family: var(--description-font);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--description-color);
}

/* ---- Footer link ---- */
.terminal-card__link {
  font-size: clamp(20px, 0.5vw + 9px, 13px);
  letter-spacing: 0.04em;
}

@media (max-width: 599px) {
  .terminal-card__code {
    padding: 14px 12px;
  }

  .terminal-card__summary {
    padding-left: 0;
    margin-top: 12px;
  }

  .code-line__num {
    width: 14px;
  }
}
</style>
