<script setup>
// Keep the existing TypedLine, typing sound and sequence composable.
const name = "Arsam";
const role = "Full Stack Developer";
const mission = "Building impactful digital tools.";
const stack = "Nuxt 3 · Node.js · TypeScript";
const linkText = "More about me";

const details = [
  { id: "frontend", label: "UI", text: "SEO-friendly Nuxt SSR" },
  { id: "backend", label: "API", text: "High-concurrency Node APIs" },
  { id: "focus", label: "Focus", text: "Clean architecture · UI/UX" },
];

const { play, line, isActive, isDone, started, finished } = useTypingSequence(
  [
    "name",
    "role",
    "mission",
    ...details.map((detail) => detail.id),
    "stack",
    "link",
  ],
  { onceKey: "home-about-card" },
);

defineExpose({ play });
</script>

<template>
  <q-card
    flat
    square
    class="mobile-profile"
    :class="{ 'mobile-profile--waiting': !started }"
    :aria-hidden="!started ? 'true' : undefined"
    :inert="!started"
  >
    <div class="mobile-profile__identity">
      <h3 class="mobile-profile__name">
        <AnimationTypedLine
          :text="name"
          :speed="22"
          :glitch="5400"
          v-bind="line('name')"
        />
      </h3>
      <p class="mobile-profile__role">
        <AnimationTypedLine :text="role" :speed="14" v-bind="line('role')" />
      </p>
    </div>

    <p class="mobile-profile__mission">
      <AnimationTypedLine
        :text="mission"
        :speed="12"
        :glitch="7000"
        v-bind="line('mission')"
      />
    </p>

    <dl class="mobile-profile__details">
      <div
        v-for="detail in details"
        :key="detail.id"
        class="mobile-profile__detail"
      >
        <dt
          class="mobile-profile__label"
          :style="{
            visibility:
              isActive(detail.id) || isDone(detail.id) ? 'visible' : 'hidden',
          }"
        >
          {{ detail.label }}
        </dt>
        <dd class="mobile-profile__value">
          <AnimationTypedLine
            :text="detail.text"
            :speed="14"
            v-bind="line(detail.id)"
          />
        </dd>
      </div>
    </dl>

    <p class="mobile-profile__stack">
      <AnimationTypedLine
        :text="stack"
        :speed="14"
        :glitch="6400"
        v-bind="line('stack')"
      />
    </p>

    <q-btn
      unelevated
      square
      no-caps
      no-ripple
      to="/about"
      :disable="!finished"
      class="mobile-profile__link"
    >
      <AnimationTypedLine :text="linkText" :speed="18" v-bind="line('link')" />
      <svg
        class="mobile-profile__arrow"
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
  </q-card>
</template>

<style scoped>
.mobile-profile {
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 14px;
  display: grid;
  gap: 8px;
  direction: ltr;
  text-align: left;
  color: var(--title-color, #f8fafc);
  background:
    linear-gradient(125deg, rgb(59 130 246 / 0.08), transparent 65%), #050a12;
  border: 1px solid rgb(59 130 246 / 0.3);
  border-left: 2px solid var(--eyebrow-color, #3b82f6);
  border-radius: 0;
  box-shadow: none;
}

/* Reserve the card's footprint while the About copy types. */
.mobile-profile--waiting {
  visibility: hidden;
  pointer-events: none;
}

.mobile-profile__identity {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  min-width: 0;
}

.mobile-profile__name,
.mobile-profile__role,
.mobile-profile__mission,
.mobile-profile__stack {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.mobile-profile__name {
  font-family: var(--title-font, sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--title-color, #f8fafc);
}

.mobile-profile__role {
  font-family: var(--description-font, sans-serif);
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--description-color, #a8b3c4);
}

.mobile-profile__mission {
  font-family: var(--description-font, sans-serif);
  font-size: 0.875rem;
  line-height: 1.5;
  color: #cbd5e1;
}

.mobile-profile__details {
  min-width: 0;
  margin: 0;
  padding-block: 8px;
  display: grid;
  gap: 6px;
  border-block: 1px solid rgb(59 130 246 / 0.18);
}

.mobile-profile__detail {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.mobile-profile__label {
  min-width: 0;
  margin: 0;
  font-family: var(--eyebrow-font, sans-serif);
  font-size: 0.625rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--eyebrow-color, #3b82f6);
  overflow-wrap: anywhere;
}

.mobile-profile__value {
  min-width: 0;
  margin: 0;
  font-family: var(--description-font, sans-serif);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #cbd5e1;
  overflow-wrap: anywhere;
}

.mobile-profile__stack {
  font-family: var(--eyebrow-font, sans-serif);
  font-size: 0.75rem;
  line-height: 1.5;
  letter-spacing: 0.025em;
  color: var(--eyebrow-color, #3b82f6);
}

.mobile-profile__link {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  margin-top: 4px;
  padding: 8px 12px;
  font-family: var(--eyebrow-font, sans-serif);
  font-size: 0.8125rem;
  line-height: 1.4;
  letter-spacing: 0.035em;
  color: var(--title-color, #f8fafc);
  background: rgb(59 130 246 / 0.14);
  border: 1px solid rgb(59 130 246 / 0.35);
}

.mobile-profile__link :deep(.q-btn__content) {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.mobile-profile__link :deep(.q-btn__content > :first-child) {
  min-width: 0;
}

.mobile-profile__link:focus-visible {
  outline: 2px solid var(--eyebrow-color, #3b82f6);
  outline-offset: 3px;
}

.mobile-profile__arrow {
  flex: none;
}

/* Do not clip text or impose a fixed height on the card. */
.mobile-profile :deep(.glitch-text) {
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (max-height: 600px) {
  .mobile-profile {
    padding: 12px;
    gap: 6px;
  }

  .mobile-profile__details {
    padding-block: 4px;
    gap: 4px;
  }

  .mobile-profile__value {
    font-size: 0.75rem;
  }
}
</style>
