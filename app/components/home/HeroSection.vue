<script setup>
const { c, content, rtl } = usePortfolioI18n();
import { homeCopy as sourceCopy } from "~/assets/data/homeCopy";
import { identity } from "~/assets/data/identity";

const props = defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  rtlPortraitSrc: { type: String, default: "/images/background-rtl-languages.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});

const activePortraitSrc = computed(() =>
  rtl.value ? props.rtlPortraitSrc : props.portraitSrc,
);

const introReady = useState("introReady", () => false);
const introPlayed = useState("introPlayed", () => false);

const eyebrow = identity.role.toUpperCase();
// Keep Latin technology names separate from localized prose for stable bidi layout.
const technologySegments = sourceCopy.hero.technologies;
const taglineSegments = content(sourceCopy.hero.tagline);
const inlineTaglineSegments = computed(() => [
  ...technologySegments,
  { text: " ", glitch: false },
  ...taglineSegments.value,
]);
const typingOrder = computed(() => [
  "eyebrow",
  ...(rtl.value ? ["technologies"] : []),
  "tagline",
  "first-name",
  "last-name",
]);

const { play, complete, line, finished } = useTypingSequence(
  typingOrder,
  { onceKey: "home-hero", onFinish: () => (introPlayed.value = true) },
);

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
    <div class="hero__visual" :class="{ 'is-revealed': finished }" role="img" :aria-label="c('Stylized portrait of Arsam Sarkhosh with blue light effects')">
      <AnimationGlitchPortrait
        :key="activePortraitSrc"
        :src="activePortraitSrc"
        :opacity="portraitOpacity"
        :mobile-opacity="Math.min(1, portraitOpacity + 0.1)"
        :mobile-offset-x="10"
        :ambient-dots="true"
        :ambient-spacing="3.2"
        :ambient-size="0.3"
        :ambient-brightness="0.7"
        :ambient-falloff="30"
        :auto-glitch="true"
        :auto-glitch-styles="['crash', 'slice', 'flicker']"
        :auto-glitch-duration="320"
        :auto-glitch-scatter-radius="12"
        :auto-glitch-slice-max-offset="10"
        :auto-glitch-flash-intensity="0.85"
        :auto-glitch-interval="4000"
      />
    </div>

    <div class="hero__text">
      <p class="hero__eyebrow eyebrow text-accent">
        <AnimationTypedLine
          :text="c(eyebrow)"
          :speed="45"
          :glitch="4000"
          v-bind="line('eyebrow')"
        />
      </p>

      <p class="hero__tagline description" :class="{ 'hero__tagline--rtl': rtl }">
        <bdi v-if="rtl" dir="ltr" class="hero__technologies">
          <AnimationSegmentedLine
            :segments="technologySegments"
            :speed="45"
            v-bind="line('technologies')"
          />
        </bdi>
        <bdi v-if="rtl" dir="rtl" class="hero__tagline-copy">
          <AnimationSegmentedLine
            :segments="taglineSegments"
            :speed="45"
            v-bind="line('tagline')"
          />
        </bdi>
        <AnimationSegmentedLine
          v-else
          :segments="inlineTaglineSegments"
          :speed="45"
          v-bind="line('tagline')"
        />
      </p>

      <h1 class="hero__name title" :aria-label="c(identity.name)">
        <AnimationTypedLine
          :text="c('ARSAM')"
          :speed="45"
          :glitch="4500"
          class="hero__name-row"
          v-bind="line('first-name')"
        />
        <AnimationTypedLine
          :text="c('SARKHOSH')"
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
