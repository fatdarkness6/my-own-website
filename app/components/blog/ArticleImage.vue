<script setup lang="ts">
import type { ProjectScreenshot } from "~/assets/data/projects";
import ImageDialog from "~/components/projects/ScreenshotDialog.vue";

const props = withDefaults(defineProps<{
  image: ProjectScreenshot;
  alt: string;
  label: string;
  priority?: boolean;
}>(), { priority: false });
const { c } = usePortfolioI18n();
const open = ref(false);
const localizedImage = computed(() => ({ ...props.image, alt: props.alt }));
</script>

<template>
  <div class="article-media">
    <button type="button" class="article-media__open" :aria-label="`${c('Enlarge')}: ${label}`"
      aria-haspopup="dialog" @click="open = true">
      <img :src="image.optimizedSrc || image.src" :alt="alt" :width="image.width" :height="image.height"
        :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" decoding="async" />
      <span class="article-media__action"><q-icon name="open_in_full" size="17px" aria-hidden="true" />{{ c('Enlarge') }}</span>
    </button>
    <ImageDialog v-model="open" :name="label" :screenshot="localizedImage" />
  </div>
</template>

<style scoped>
.article-media { min-width: 0; }
.article-media__open { position: relative; display: block; width: 100%; padding: 0; border: 0; background: #02060b; color: #dbeafe; cursor: zoom-in; text-align: inherit; }
.article-media__open img { display: block; width: 100%; height: auto; max-height: 70svh; object-fit: contain; filter: none; }
.article-media__action { position: absolute; inset-inline-end: 10px; inset-block-end: 10px; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 8px 12px; border: 1px solid #638fc4; background: #07111ff2; color: #e2efff; font: 500 .75rem/1.5 var(--ui-font); }
.article-media__open:hover .article-media__action { background: #153357; }
.article-media__open:focus-visible { outline: 2px solid #93c5fd; outline-offset: -3px; }
@media print { .article-media__action { display: none; } .article-media__open img { max-height: none; } }
</style>
