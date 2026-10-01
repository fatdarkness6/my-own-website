<script setup>
defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});

const introReady = useState("introReady", () => false);
const introPlayed = useState("introPlayed", () => false);

const eyebrow = "FULL-STACK DEVELOPER";
const tagline = "Vue • Nuxt • Nodejs Crafting Interactive Experiences.";

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
        <AnimationTypedLine
          :text="tagline"
          :speed="45"
          v-bind="line('tagline')"
        >
          <AnimationGlitchTextTimer text="Vue" :interval="6000" />
          <span class="text-accent"> • </span>
          <AnimationGlitchTextTimer
            text="Nuxt"
            :interval="5500"
            class="text-primary"
          />
          <span class="text-accent"> • </span>
          <AnimationGlitchTextTimer text="Nodejs " :interval="6500" />
          <AnimationGlitchTextTimer
            text="Crafting "
            :interval="5000"
            class="text-primary"
          />
          <AnimationGlitchTextTimer
            text="Interactive Experiences."
            :interval="7000"
          />
        </AnimationTypedLine>
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
          class="hero__name-row text-primary"
          v-bind="line('last-name')"
        />
      </h1>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/heroSection.css"></style>
