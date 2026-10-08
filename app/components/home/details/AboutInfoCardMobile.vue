<script setup>
const { c, localePath } = usePortfolioI18n();
// Keep the existing TypedLine, typing sound and sequence composable.
import { identity } from "~/assets/data/identity";
const name = identity.givenName;
const role = identity.role;
const mission = "Building web apps with personality.";
const stack = "Nuxt · Node.js · Python";
const linkText = "More about me";

const details = [
  { id: "frontend", label: "UI", text: "Responsive Nuxt / Vue" },
  { id: "backend", label: "API", text: "Node.js & FastAPI" },
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
          :text="c(name)"
          :speed="22"
          :glitch="5400"
          v-bind="line('name')"
        />
      </h3>
      <p class="mobile-profile__role">
        <AnimationTypedLine :text="c(role)" :speed="14" v-bind="line('role')" />
      </p>
    </div>

    <p class="mobile-profile__mission">
      <AnimationTypedLine
        :text="c(mission)"
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
          {{ c(detail.label) }}
        </dt>
        <dd class="mobile-profile__value">
          <AnimationTypedLine
            :text="c(detail.text)"
            :speed="14"
            v-bind="line(detail.id)"
          />
        </dd>
      </div>
    </dl>

    <p class="mobile-profile__stack">
      <AnimationTypedLine
        :text="c(stack)"
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
      :to="localePath('/about')"
      :disable="!finished"
      class="mobile-profile__link"
    >
      <AnimationTypedLine :text="c(linkText)" :speed="18" v-bind="line('link')" />
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

<style scoped src="~/assets/css/components/home/details/aboutInfoCardMobile.css"></style>
