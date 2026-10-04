<script setup>
const { c, localePath } = usePortfolioI18n();
import { homeCopy } from "~/assets/data/homeCopy";

const $q = useQuasar();
const { sections, currentIndex, isAnimating } = useScrollSections();
const cardRef = ref(null);
const copyFinished = ref(false);
let copyStarted = false;
const playedCards = new WeakSet();

const titleSegments = usePortfolioI18n().content(homeCopy.about.title);
const description =
  "Full-stack engineer building production apps, APIs and interactive experiences with Vue, Nuxt, Node.js and Python.";

const { play, line } = useTypingSequence(["eyebrow", "title", "desc"], {
  onceKey: "home-about-copy",
  onFinish: () => {
    copyFinished.value = true;
  },
});

const inView = computed(
  () => sections[currentIndex.value]?.id === "about" && !isAnimating.value,
);

// Only the mounted card is played. If the breakpoint changes after the
// copy completes, the newly mounted card can start without retyping the copy.
watch(
  [inView, cardRef, copyFinished],
  ([visible, card, ready]) => {
    if (!visible || !card) return;
    if (!copyStarted) {
      copyStarted = true;
      play();
    }
    if (ready && !playedCards.has(card)) {
      playedCards.add(card);
      card.play();
    }
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
            :text="c(&quot;// 02. ABOUT&quot;)"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="about-title" class="about__title section-title">
          <AnimationSegmentedLine
            :segments="titleSegments"
            :speed="14"
            v-bind="line('title')"
          />
        </h2>

        <p class="about__desc">
          <AnimationTypedLine
            :text="c(description)"
            :glitch="7000"
            v-bind="line('desc')"
          />
        </p>
      </div>

      <CommonHackerReveal :show="copyFinished" class="about__card-reveal">
        <HomeDetailsAboutInfoCardMobile
          v-if="$q.screen.lt.sm"
          ref="cardRef"
          class="about__card"
        />
        <HomeDetailsAboutInfoCard v-else ref="cardRef" class="about__card" />
      </CommonHackerReveal>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/aboutSection.css"></style>
