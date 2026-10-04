<script setup lang="ts">
import type { AboutChapterContent } from "~/assets/data/aboutPage";

const props = defineProps<{
  chapter: AboutChapterContent;
}>();
const { element, entered } = useViewportEntry();
const introReady = useState("introReady", () => false);
const { play, complete, line, started } = useTypingSequence(["label", "title"], {
  onceKey: `about-${props.chapter.id}`,
});

watch(
  [entered, introReady],
  ([visible, ready]) => {
    if (!visible || !ready || !import.meta.client) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) complete();
    else play();
  },
  { immediate: true },
);
</script>

<template>
  <section
    :id="chapter.id"
    ref="element"
    class="dossier-chapter"
    :aria-labelledby="`${chapter.id}-title`"
    tabindex="-1"
  >
    <header class="dossier-chapter__heading">
      <p class="dossier-label">
        <AnimationTypedLine
          :text="`// ${chapter.number}. ${chapter.label.toUpperCase()}`"
          :speed="14"
          v-bind="line('label')"
        />
      </p>
      <h2 :id="`${chapter.id}-title`" class="section-title dossier-chapter__title">
        <AnimationTypedLine :text="chapter.title" :speed="14" v-bind="line('title')" />
      </h2>
    </header>
    <CommonHackerReveal :show="started" :duration="520">
      <slot />
    </CommonHackerReveal>
  </section>
</template>
