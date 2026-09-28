<script setup>
import { ref, watch, nextTick } from "vue";
import { useScrollSections } from "~/composables/useScrollSections";

const { sections, currentIndex } = useScrollSections();

const cardRef = ref(null);
watch(currentIndex, () => {
  const active = sections[currentIndex.value];
  if (active?.id === "about") {
    nextTick(() => cardRef.value?.play());
  }
});
</script>

<template>
  <section class="about container">
    <div class="about__grid-bg" />

    <div class="about__inner column q-px-md q-py-xl q-px-sm-xl">
      <p class="about__eyebrow eyebrow">
        <AnimationGlitchTextTimer text="// 02. ABOUT" :interval="4200" />
      </p>

      <h2 class="about__title title">
        <AnimationGlitchTextTimer
          text="ARCHITECTING HIGH-SPEED WEB"
          :interval="5000"
          class="about__title-row"
        />
        <AnimationGlitchTextTimer
          text="SOLUTIONS WITH CLEAN CODE"
          :interval="5600"
          class="about__title-row"
        />
        <AnimationGlitchTextTimer
          text="& MODERN TECH."
          :interval="6200"
          class="about__title-row text-primary"
        />
      </h2>

      <p class="about__desc description">
        <AnimationGlitchTextTimer
          text="Full-stack developer specializing in reactive Nuxt 3 interfaces and robust Node.js architectures."
          :interval="7000"
        />
        <AnimationGlitchTextTimer
          text=" Engineered for high performance, smooth animations, and scalable systems."
          :interval="7600"
        />
      </p>
      <HomeDetailsAboutInfoCardVue ref="cardRef" />
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  align-items: safe center;
}

.about__grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse at 20% 30%, black 20%, transparent 70%);
  pointer-events: none;
}

/* ---- Eyebrow ---- */
.about__eyebrow {
  margin: 0 0 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* ---- Title ---- */
.about__title {
  margin: 0 0 18px;
  line-height: 1.02;
}

.about__title :deep(.about__title-row) {
  display: block;
}

/* ---- Description ---- */
.about__desc {
  margin: 0 0 28px;
  line-height: 1.65;
  max-width: 62ch;
}

@media (max-width: 599px) {
  .about__inner {
    padding-block: 16px;
  }

  .about__desc {
    margin-bottom: 20px;
  }
}
</style>
