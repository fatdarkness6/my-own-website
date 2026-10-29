<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

const props = defineProps<{ url: string; name: string; mobile?: boolean; fill?: boolean }>();
const emit = defineEmits<{ stop: [] }>();
const { c } = usePortfolioI18n();
const device = ref<"desktop" | "mobile">(props.mobile ? "mobile" : "desktop");
const stage = ref<HTMLElement | null>(null);
const bounds = reactive({ width: 0, height: 0 });
const request = ref(0);
const loaded = ref(false);
const slow = ref(false);
const host = computed(() => new URL(props.url).hostname);
const frameWidth = computed(() => device.value === "mobile" ? 390 : 1280);
const scale = computed(() => bounds.width ? Math.min(1, bounds.width / frameWidth.value) : 1);
const frameHeight = computed(() => Math.max(1, Math.round((bounds.height || 600) / scale.value)));
let observer: ResizeObserver | undefined;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;

function measure() {
  if (!stage.value) return;
  bounds.width = stage.value.clientWidth;
  bounds.height = stage.value.clientHeight;
}

function startLoading() {
  clearTimeout(loadingTimer);
  loaded.value = false;
  slow.value = false;
  loadingTimer = setTimeout(() => { slow.value = true; }, 12000);
}

function reload() {
  startLoading();
  request.value++;
}

function frameLoaded() {
  loaded.value = true;
  slow.value = false;
  clearTimeout(loadingTimer);
}

watch(() => props.url, reload);
onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  if (stage.value) observer.observe(stage.value);
  if (!loaded.value) startLoading();
});
onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(loadingTimer);
});
</script>

<template>
  <section class="project-live-frame" :class="{ 'project-live-frame--fill': fill }"
    :aria-label="`${name} — ${c('Live preview')}`">
    <header class="project-live-frame__toolbar">
      <span class="project-live-frame__host" dir="ltr"><q-icon name="language" size="16px" aria-hidden="true" />{{ host }}</span>
      <div class="project-live-frame__devices" role="group" :aria-label="c('Preview size')">
        <q-btn flat no-caps no-ripple icon="desktop_windows" :aria-pressed="device === 'desktop'"
          @click="device = 'desktop'">{{ c('Desktop') }}</q-btn>
        <q-btn flat no-caps no-ripple icon="smartphone" :aria-pressed="device === 'mobile'"
          @click="device = 'mobile'">{{ c('Mobile') }}</q-btn>
      </div>
      <div class="project-live-frame__actions">
        <q-btn flat round no-ripple icon="refresh" :aria-label="c('Reload preview')" :title="c('Reload preview')" @click="reload" />
        <q-btn flat round no-ripple icon="close" :aria-label="c('Stop preview')" :title="c('Stop preview')" @click="emit('stop')" />
      </div>
    </header>
    <div ref="stage" class="project-live-frame__stage" dir="ltr">
      <div class="project-live-frame__canvas" :style="{ width: `${frameWidth * scale}px` }">
        <iframe :key="request" :src="url" :title="`${name} — ${c('Live preview')}`"
          :width="frameWidth" :height="frameHeight"
          :style="{ width: `${frameWidth}px`, height: `${frameHeight}px`, transform: `scale(${scale})`, transformOrigin: '0 0' }"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="autoplay 'none'; camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'"
          referrerpolicy="no-referrer" @load="frameLoaded" />
      </div>
      <div v-if="!loaded" class="project-live-frame__loading" role="status">
        <q-spinner v-if="!slow" size="24px" aria-hidden="true" />
        {{ c(slow ? 'Taking longer than expected? Open the website below.' : 'Loading live preview…') }}
      </div>
    </div>
    <footer class="project-live-frame__footer">
      <span>{{ c('Blank preview? Open the website directly.') }}</span>
      <a :href="url" target="_blank" rel="noopener noreferrer">{{ c('Open website') }} ↗<span class="project-live-frame__sr-only">{{ c('(opens in a new tab)') }}</span></a>
    </footer>
  </section>
</template>

<style scoped>
.project-live-frame { display: flex; flex-direction: column; min-width: 0; background: #050a12; color: #dbeafe; }
.project-live-frame--fill { height: 100%; }
.project-live-frame__toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; padding: 8px 14px; border-bottom: 1px solid #294261; background: #080f1b; }
.project-live-frame__host { display: inline-flex; align-items: center; gap: 8px; min-width: 0; margin-inline-end: auto; overflow-wrap: anywhere; color: #93c5fd; font: 500 .75rem/1.5 var(--ui-font); }
.project-live-frame__devices, .project-live-frame__actions { display: flex; align-items: center; gap: 4px; }
.project-live-frame .q-btn { min-height: 44px; min-width: 44px; color: #a7bad4; font: 500 .75rem/1.5 var(--ui-font); }
.project-live-frame__devices .q-btn { padding: 8px; }
.project-live-frame__devices :deep(.q-btn__content) { gap: 6px; }
.project-live-frame__devices .q-btn[aria-pressed="true"] { color: #dbeafe; background: #173052; }
.project-live-frame__stage { position: relative; display: flex; justify-content: center; min-width: 0; height: clamp(360px, 65dvh, 700px); overflow: hidden; background: #020508; }
.project-live-frame--fill .project-live-frame__stage { flex: 1; min-height: 0; height: auto; }
.project-live-frame__canvas { position: relative; height: 100%; flex: none; overflow: hidden; background: #fff; }
/* The iframe viewport is physical LTR geometry, regardless of portfolio locale. */
/*rtl:begin:ignore*/
.project-live-frame iframe { position: absolute; top: 0; left: 0; display: block; max-width: none; border: 0; background: #fff; }
/*rtl:end:ignore*/
.project-live-frame__loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px; padding: 24px; color: #bfdbfe; background: #050a12e8; font: 400 .8125rem/1.8 var(--ui-font); pointer-events: none; text-align: center; }
.project-live-frame__footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding: 12px 16px; border-top: 1px solid #294261; color: #91a6c4; font: 400 .75rem/1.7 var(--ui-font); }
.project-live-frame__footer a { color: #bfdbfe; text-underline-offset: 4px; padding-block: 6px; }
.project-live-frame :is(a, button):focus-visible { outline: 2px solid #93c5fd; outline-offset: -3px; }
.project-live-frame__sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 767px) {
  .project-live-frame__toolbar { gap: 6px; padding: max(6px, env(safe-area-inset-top)) 8px 6px; }
  .project-live-frame__host { flex-basis: 100%; font-size: .6875rem; }
  .project-live-frame__devices { margin-inline-end: auto; }
  .project-live-frame__footer { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
}
</style>
