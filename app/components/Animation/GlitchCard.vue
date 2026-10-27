<script setup lang="ts">
import { QCard } from "quasar";

const props = withDefaults(defineProps<{
  image: string;
  alt?: string;
  /** Zero disables automatic bursts, leaving hover/focus and exposed run(). */
  interval?: number;
  duration?: number;
  mediaOnly?: boolean;
  fit?: "cover" | "contain";
}>(), {
  alt: "",
  interval: 6000,
  duration: 420,
  mediaOnly: false,
  fit: "cover",
});

const STYLES = ["rgb", "slice", "flicker"];
const active = ref(false);
const style = ref("rgb");

let timer: ReturnType<typeof setTimeout> | undefined;
let off: ReturnType<typeof setTimeout> | undefined;
let last: string | undefined;

function pick() {
  let n: string;
  do n = STYLES[Math.floor(Math.random() * STYLES.length)]!;
  while (n === last);
  last = n;
  return n;
}

function run() {
  if (active.value) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  style.value = pick();
  active.value = true;
  clearTimeout(off);
  off = setTimeout(
    () => (active.value = false),
    props.duration * (0.8 + Math.random() * 0.6),
  );
}

function schedule() {
  if (props.interval <= 0) return;
  timer = setTimeout(
    () => {
      run();
      schedule();
    },
    props.interval + Math.random() * 2500,
  );
}

onMounted(schedule);
onBeforeUnmount(() => {
  clearTimeout(timer);
  clearTimeout(off);
});

defineExpose({ run });
</script>

<template>
  <component
    :is="mediaOnly ? 'div' : QCard"
    v-bind="mediaOnly ? {} : { flat: true, square: true }"
    class="gcard"
    :class="[{ 'is-glitching': active, 'gcard--media-only': mediaOnly }, active ? `gcard--${style}` : '']"
    :style="{ '--gcard-image-fit': fit }"
    @mouseenter="run"
    @focusin="run"
  >
    <div class="gcard__media">
      <div v-if="$slots.image" class="gcard__img"><slot name="image" /></div>
      <q-img
        v-else
        :src="image"
        :alt="alt"
        :fit="fit"
        no-spinner
        class="gcard__img"
      />
      <div
        class="gcard__ghost gcard__ghost--r"
        :style="{ backgroundImage: `url(${image})` }"
        aria-hidden="true"
      />
      <div
        class="gcard__ghost gcard__ghost--c"
        :style="{ backgroundImage: `url(${image})` }"
        aria-hidden="true"
      />
      <div class="gcard__scan" aria-hidden="true" />
      <slot name="media" />
    </div>

    <div v-if="!mediaOnly" class="gcard__body">
      <slot />
    </div>

    <template v-if="!mediaOnly">
      <span class="gcard__corner gcard__corner--tl" aria-hidden="true" />
      <span class="gcard__corner gcard__corner--tr" aria-hidden="true" />
      <span class="gcard__corner gcard__corner--bl" aria-hidden="true" />
      <span class="gcard__corner gcard__corner--br" aria-hidden="true" />
    </template>
  </component>
</template>

<style scoped src="~/assets/css/components/animations/glitchCard.css"></style>
