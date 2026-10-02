<script setup>
import { homeCopy } from "~/assets/data/homeCopy";

defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});

const introReady = useState("introReady", () => false);
const introPlayed = useState("introPlayed", () => false);

const eyebrow = "FULL-STACK DEVELOPER";
const taglineSegments = homeCopy.hero.tagline;

const { play, complete, line, finished } = useTypingSequence(
  ["eyebrow", "tagline", "first-name", "last-name"],
  { onFinish: () => (introPlayed.value = true) },
);

if (introPlayed.value) complete();

watch(
  introReady,
  (ready) => {
    if (ready) play();
  },
  { immediate: true },
);
</script>

<template>
  <section class="hero">
    <div class="hero__visual" :class="{ 'is-revealed': finished }">
      <AnimationGlitchPortrait
        :src="portraitSrc"
        :opacity="portraitOpacity"
        :mobile-opacity="Math.min(1, portraitOpacity + 0.1)"
        :mobile-offset-x="10"
        :repel-radius="20"
        :repel-strength="1.5"
        :ambient-dots="true"
        :ambient-spacing="3.2"
        :ambient-size="0.3"
        :ambient-brightness="0.7"
        :ambient-falloff="30"
        :auto-glitch="true"
        :auto-glitch-styles="['scatter', 'slice', 'flicker']"
        :auto-glitch-scatter-radius="10"
        :auto-glitch-interval="4000"
      />
    </div>

    <div class="hero__text">
      <p class="hero__eyebrow eyebrow text-accent">
        <AnimationTypedLine
          :text="eyebrow"
          :speed="45"
          :glitch="4000"
          v-bind="line('eyebrow')"
        />
      </p>

      <p class="hero__tagline description">
        <AnimationSegmentedLine
          :segments="taglineSegments"
          :speed="45"
          class="hero__tagline-line"
          v-bind="line('tagline')"
        />
      </p>

      <h1 class="hero__name title">
        <AnimationTypedLine
          text="ARSAM"
          :speed="45"
          :glitch="4500"
          class="hero__name-row"
          v-bind="line('first-name')"
        />
        <AnimationTypedLine
          text="SARKHOSH"
          :speed="45"
          :glitch="5200"
          :accent-terms="['SARKHOSH']"
          class="hero__name-row text-primary"
          v-bind="line('last-name')"
        />
      </h1>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/heroSection.css"></style>
