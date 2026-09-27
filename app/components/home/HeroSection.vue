<script setup>
import { ref, nextTick, watch } from "vue";

defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});
const introReady = useState("introReady", () => false);
const introPlayed = useState("introPlayed", () => false);

const phase = ref(introPlayed.value ? 4 : 0);

const eyebrowTyper = ref(null);
const taglineTyper = ref(null);
const nameTyper1 = ref(null);
const nameTyper2 = ref(null);

watch(
  introReady,
  (ready) => {
    if (ready && !introPlayed.value) {
      nextTick(() => eyebrowTyper.value?.start());
    }
  },
  { immediate: true },
);

function onEyebrowDone() {
  phase.value = 1;
  nextTick(() => taglineTyper.value?.start());
}
function onTaglineDone() {
  phase.value = 2;
  nextTick(() => nameTyper1.value?.start());
}
function onName1Done() {
  phase.value = 3;
  nextTick(() => nameTyper2.value?.start());
}
function onName2Done() {
  phase.value = 4;
  introPlayed.value = true;
}
</script>

<template>
  <section class="hero full-bleed">
    <div class="hero__visual" :class="{ 'is-revealed': phase >= 4 }">
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
        <AnimationTypewriterText
          v-if="phase === 0"
          ref="eyebrowTyper"
          text="FULL-STACK DEVELOPER"
          @done="onEyebrowDone"
        />
        <AnimationGlitchTextTimer
          v-else-if="phase >= 1"
          text="FULL-STACK DEVELOPER"
          :interval="4000"
        />
      </p>

      <p v-if="phase >= 1" class="hero__tagline description">
        <AnimationTypewriterText
          v-if="phase === 1"
          ref="taglineTyper"
          text="Vue • Nuxt • Nodejs Crafting Interactive Experiences."
          @done="onTaglineDone"
        />
        <template v-else>
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
        </template>
      </p>

      <h1 v-if="phase >= 2" class="hero__name title q-pt-xl">
        <AnimationTypewriterText
          v-if="phase === 2"
          ref="nameTyper1"
          text="ARSAM"
          class="hero__name-row"
          @done="onName1Done"
        />
        <AnimationGlitchTextTimer
          v-else
          text="ARSAM"
          class="hero__name-row"
          :interval="4500"
        />

        <template v-if="phase >= 3">
          <AnimationTypewriterText
            v-if="phase === 3"
            ref="nameTyper2"
            text="SARKHOSH"
            class="text-primary hero__name-row"
            @done="onName2Done"
          />
          <AnimationGlitchTextTimer
            v-else
            text="SARKHOSH"
            class="text-primary hero__name-row"
            :interval="5200"
          />
        </template>
      </h1>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--title-color);
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
  overflow: hidden;
}

.hero__visual {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.hero__visual.is-revealed {
  animation: hero-portrait-in 0.6s steps(1, end) both;
}

@keyframes hero-portrait-in {
  0% {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
  }
  10% {
    opacity: 1;
    clip-path: inset(40% 0 40% 0);
    transform: translateX(-6px);
  }
  20% {
    clip-path: inset(10% 0 70% 0);
    transform: translateX(5px);
  }
  35% {
    clip-path: inset(60% 0 5% 0);
    transform: translateX(-4px);
  }
  50% {
    clip-path: inset(0 0 0 0);
    opacity: 0.75;
    transform: translateX(3px);
  }
  70% {
    opacity: 1;
    transform: translateX(-2px);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
  }
}

.hero__text {
  position: absolute;
  top: 50%;
  left: clamp(100px, 5vw, 56px);
  transform: translateY(-50%);
  z-index: 2;
  max-width: 640px;
  padding-right: 20px;
}

.hero__eyebrow {
  margin: 0 0 12px;
  font-size: clamp(16px, 2.5vw + 8px, 40px);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero__tagline {
  margin: 0 0 28px;
  max-width: 46ch;
  font-size: clamp(15px, 1.6vw + 9px, 30px);
}

.hero__name {
  margin: 0;
  line-height: 0.92;
  letter-spacing: 0.01em;
}

.hero__name :deep(.hero__name-row) {
  display: block;
  font-size: clamp(48px, 10vw + 8px, 150px);
}

@media (max-width: 1023px) {
  .hero__text {
    left: clamp(40px, 5vw, 56px);
    max-width: 520px;
  }
}

@media (max-width: 599px) {
  .hero__text {
    left: 20px;
    right: 20px;
    max-width: none;
    padding-right: 0;
  }

  .hero__tagline {
    max-width: none;
  }
}
</style>
