<script setup>
defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});
</script>

<template>
  <section class="hero full-bleed">
    <div class="hero__visual">
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
      />
    </div>

    <div class="hero__text">
      <p class="hero__eyebrow eyebrow text-accent">
        <AnimationGlitchTextTimer
          text="FULL-STACK DEVELOPER"
          :interval="4000"
        />
      </p>

      <p class="hero__tagline description">
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
      </p>

      <h1 class="hero__name title q-pt-xl">
        <AnimationGlitchTextTimer
          text="ARSAM"
          class="hero__name-row"
          :interval="4500"
        />
        <AnimationGlitchTextTimer
          text="SARKHOSH"
          class="text-primary hero__name-row"
          :interval="5200"
        />
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

/* ============================================================
   RESPONSIVE — Quasar breakpoints
   Only adjusting container position/width here.
   Font sizes are fully fluid via clamp() above — no steps needed.
============================================================ */

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
