<script setup lang="ts">
import type { ProjectScreenshot } from "~/assets/data/projects";
import { screenshotWidth } from "~/utils/screenshotViewport";

const props = defineProps<{ name: string; screenshot?: ProjectScreenshot }>();
const open = defineModel<boolean>({ default: false });
const { c } = usePortfolioI18n();
const $q = useQuasar();
const viewer = ref<HTMLElement | null>(null);
const zoom = ref(1);
const aspect = ref(1270 / 714);
const viewport = reactive({ width: 0, height: 0 });
const imageWidth = computed(() => screenshotWidth(viewport.width, viewport.height, aspect.value, zoom.value));
let observer: ResizeObserver | undefined;

function measure() {
  if (!viewer.value) return;
  viewport.width = viewer.value.clientWidth;
  viewport.height = viewer.value.clientHeight;
}

function stopObserving() {
  observer?.disconnect();
  observer = undefined;
}

function initialize() {
  stopObserving();
  zoom.value = 1;
  measure();
  if (viewer.value) {
    viewer.value.scrollTo(0, 0);
    observer = new ResizeObserver(measure);
    observer.observe(viewer.value);
  }
}

function loaded(event: Event) {
  const image = event.target as HTMLImageElement;
  if (image.naturalHeight) aspect.value = image.naturalWidth / image.naturalHeight;
  measure();
}

async function setZoom(value: number) {
  const target = viewer.value;
  if (!target) return;
  const centerX = (target.scrollLeft + target.clientWidth / 2) / target.scrollWidth;
  const centerY = (target.scrollTop + target.clientHeight / 2) / target.scrollHeight;
  zoom.value = Math.max(1, Math.min(4, value));
  await nextTick();
  if (viewer.value !== target || !open.value) return;
  target.scrollTo({
    left: centerX * target.scrollWidth - target.clientWidth / 2,
    top: centerY * target.scrollHeight - target.clientHeight / 2,
    behavior: "instant",
  });
}

onBeforeUnmount(stopObserving);
</script>

<template>
  <q-dialog
    v-model="open"
    :maximized="$q.screen.lt.md"
    transition-show="none"
    transition-hide="none"
    :transition-duration="0"
    aria-labelledby="project-screenshot-title"
    @show="initialize"
    @hide="stopObserving"
  >
    <q-card class="archive-lightbox" flat square>
      <CommonHackerReveal :show="open" :once="false" :duration="340" class="archive-lightbox__reveal">
        <div class="archive-lightbox__bar">
          <span id="project-screenshot-title">{{ name }} {{ c("/ SCREENSHOT") }}</span>
          <q-btn v-close-popup flat round icon="close" :aria-label="c('Close screenshot')" />
        </div>
        <div
          ref="viewer"
          class="archive-lightbox__viewer"
          dir="ltr"
          tabindex="0"
          role="region"
          :aria-label="screenshot?.alt"
          aria-describedby="project-screenshot-hint"
        >
          <div class="archive-lightbox__canvas" :style="{ width: imageWidth ? `${Math.max(viewport.width, imageWidth)}px` : '100%' }">
            <img
              v-if="screenshot"
              :src="screenshot.optimizedSrc || screenshot.src"
              :alt="screenshot.alt"
              :style="{ width: imageWidth ? `${imageWidth}px` : '100%' }"
              width="1270"
              height="714"
              draggable="false"
              @load="loaded"
              @dblclick="setZoom(zoom === 1 ? 2 : 1)"
            />
          </div>
        </div>
        <div class="archive-lightbox__controls">
          <span id="project-screenshot-hint">{{ c('Swipe or scroll to explore') }}</span>
          <div class="archive-lightbox__zoom">
            <q-btn flat round icon="remove" :disable="zoom <= 1" :aria-label="c('Zoom out')" @click="setZoom(zoom - 0.5)" />
            <span class="archive-lightbox__scale" role="status">{{ Math.round(zoom * 100) }}%</span>
            <q-btn flat round icon="add" :disable="zoom >= 4" :aria-label="c('Zoom in')" @click="setZoom(zoom + 0.5)" />
            <q-btn flat round icon="fit_screen" :aria-label="c('Fit image')" @click="setZoom(1)" />
          </div>
        </div>
      </CommonHackerReveal>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.archive-lightbox.q-card {
  width: 1200px;
  max-width: 94vw;
  height: 88dvh;
  max-height: 88dvh;
  overflow: hidden;
  box-sizing: border-box;
  background: #070c13;
  color: #dbeafe;
  border: 1px solid #294261;
}
.archive-lightbox__reveal { height: 100%; display: flex; flex-direction: column; }
.archive-lightbox__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 16px; border-bottom: 1px solid #294261; font: 500 .75rem/1.6 var(--ui-font); }
.archive-lightbox__bar > span { overflow-wrap: anywhere; }
.archive-lightbox .q-btn { flex-shrink: 0; min-width: 44px; min-height: 44px; color: #93c5fd; }
.archive-lightbox__viewer { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; background: #030609; }
.archive-lightbox__viewer:focus-visible { outline: 2px solid #93c5fd; outline-offset: -2px; }
.archive-lightbox__canvas { min-height: 100%; display: grid; place-items: center; }
.archive-lightbox__canvas img { display: block; flex-shrink: 0; max-width: none; height: auto; max-height: none; object-fit: contain; user-select: none; }
.archive-lightbox__controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding: 8px 16px; border-top: 1px solid #294261; font: 500 .75rem/1.6 var(--ui-font); color: #a7b7cd; }
.archive-lightbox__zoom { display: flex; align-items: center; gap: 4px; }
.archive-lightbox__scale { min-width: 5ch; text-align: center; font-variant-numeric: tabular-nums; direction: ltr; }
@media (max-width: 1023px) {
  .archive-lightbox.q-card { width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; border: 0; }
  .archive-lightbox__bar { padding: max(8px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) 8px max(12px, env(safe-area-inset-left)); }
  .archive-lightbox__controls { justify-content: center; gap: 4px; padding: 8px max(12px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)); }
  .archive-lightbox__controls > span { width: 100%; text-align: center; }
}
</style>
