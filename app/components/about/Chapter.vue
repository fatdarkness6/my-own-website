<script setup lang="ts">
const { c, localePath } = usePortfolioI18n();
import type { AboutChapterContent } from "~/assets/data/aboutPage";

const props = defineProps<{
  chapter: AboutChapterContent;
}>();
const { element, line, started } = useViewportTyping(["label", "title"], {
  onceKey: `about-${props.chapter.id}`,
});
</script>

<template>
  <section
    :id="chapter.id"
    class="dossier-chapter"
    :aria-labelledby="`${chapter.id}-title`"
    tabindex="-1"
  >
    <header ref="element" class="dossier-chapter__heading">
      <div class="dossier-chapter__index" aria-hidden="true">
        <span>//</span>
        <strong>{{ chapter.number }}</strong>
      </div>
      <div class="dossier-chapter__copy">
        <p class="dossier-label">
          <AnimationTypedLine
            :text="c(`// ${chapter.number}. ${chapter.label.toUpperCase()}`)"
            :speed="14"
            :glitch="11000"
            v-bind="line('label')"
          />
        </p>
        <h2 :id="`${chapter.id}-title`" class="section-title dossier-chapter__title">
          <AnimationTypedLine :text="c(chapter.title)" :speed="14" :glitch="8000" v-bind="line('title')" />
        </h2>
      </div>
      <span class="dossier-chapter__signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </header>
    <CommonHackerReveal :show="started" :duration="520">
      <slot />
    </CommonHackerReveal>
  </section>
</template>
