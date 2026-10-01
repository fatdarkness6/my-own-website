<script setup>
const { sections, currentIndex, isAnimating } = useScrollSections();
const cardRef = ref(null);

const titleLead = "ARCHITECTING HIGH-SPEED WEB SOLUTIONS WITH CLEAN CODE";
const titleAccent = "& MODERN TECH.";
const title = `${titleLead} ${titleAccent}`;
const description =
  "Full-stack developer specializing in reactive Nuxt 3 interfaces and robust Node.js architectures.";

const { play, line } = useTypingSequence(["eyebrow", "title", "desc"], {
  onFinish: () => cardRef.value?.play(),
});

const inView = computed(
  () => sections[currentIndex.value]?.id === "about" && !isAnimating.value,
);

watch(
  [inView, cardRef],
  ([visible, card]) => {
    if (visible && card) play();
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section class="about" aria-labelledby="about-title">
    <div class="about__grid-bg" aria-hidden="true" />

    <div class="about__inner">
      <div class="about__copy">
        <p class="about__eyebrow">
          <AnimationTypedLine
            text="// 02. ABOUT"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="about-title" class="about__title">
          <AnimationTypedLine :text="title" :speed="14" v-bind="line('title')">
            <AnimationGlitchTextTimer :text="titleLead" :interval="5000" />
            {{ " " }}
            <AnimationGlitchTextTimer
              :text="titleAccent"
              :interval="6200"
              class="about__accent"
            />
          </AnimationTypedLine>
        </h2>

        <p class="about__desc">
          <AnimationTypedLine
            :text="description"
            :glitch="7000"
            v-bind="line('desc')"
          />
        </p>
      </div>

      <HomeDetailsAboutInfoCard ref="cardRef" class="about__card" />
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/aboutSection.css"></style>
