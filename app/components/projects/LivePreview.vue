<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{ url?: string; name: string }>();
const { c } = usePortfolioI18n();
const $q = useQuasar();
const playing = ref(false);
const fullscreen = ref(false);
const container = ref<HTMLElement | null>(null);
const startButton = ref<{ $el: HTMLElement } | null>(null);

async function start() {
  if (!props.url) return;
  fullscreen.value = $q.screen.lt.md;
  playing.value = true;
  await nextTick();
  if (!fullscreen.value) container.value?.scrollIntoView({ block: "start", behavior: "instant" });
}

async function stop() {
  playing.value = false;
  fullscreen.value = false;
  await nextTick();
  startButton.value?.$el.focus();
}

watch(() => props.url, stop);
</script>

<template>
  <div ref="container" class="project-live">
    <template v-if="!playing || fullscreen"><slot /></template>
    <div v-if="url && !playing" class="project-live__launcher">
      <q-btn ref="startButton" unelevated no-caps no-ripple icon="play_arrow"
        class="project-live__start" @click="start">{{ c('Try live') }}</q-btn>
      <p>{{ c('Interact with the website here.') }}</p>
    </div>
    <ProjectsLivePreviewFrame v-if="url && playing && !fullscreen" :url="url" :name="name" @stop="stop" />
    <q-dialog :model-value="playing && fullscreen" maximized transition-show="none" transition-hide="none"
      :transition-duration="0" :aria-label="`${name} — ${c('Live preview')}`"
      @update:model-value="value => { if (!value) stop(); }" @hide="stop">
      <q-card class="project-live__dialog" flat square>
        <ProjectsLivePreviewFrame v-if="url && playing && fullscreen" :url="url" :name="name" mobile fill @stop="stop" />
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.project-live { scroll-margin-block-start: 120px; }
.project-live__launcher { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 18px; padding: 14px 20px; border-top: 1px solid #294261; background: #080f1b; }
.project-live__launcher p { margin: 0; color: #a7b7cd; font: 400 .75rem/1.7 var(--ui-font); }
.project-live__start.q-btn { min-height: 44px; padding: 10px 16px; background: #2563eb; color: #fff; font: 600 .8125rem/1.5 var(--ui-font); }
.project-live__start :deep(.q-btn__content) { gap: 8px; }
.project-live__dialog.q-card { width: 100vw; height: 100dvh; max-height: 100dvh; overflow: hidden; background: #050a12; color: #dbeafe; }
</style>
