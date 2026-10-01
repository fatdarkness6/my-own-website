<script setup>
const props = defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: "" },
  interval: { type: Number, default: 6000 },
  duration: { type: Number, default: 420 },
});

const STYLES = ["rgb", "slice", "flicker"];
const active = ref(false);
const style = ref("rgb");

let timer = null;
let off = null;
let last = null;

function pick() {
  let n;
  do n = STYLES[Math.floor(Math.random() * STYLES.length)];
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
  <q-card
    flat
    square
    class="gcard"
    :class="[{ 'is-glitching': active }, active ? `gcard--${style}` : '']"
    @mouseenter="run"
    @focusin="run"
  >
    <div class="gcard__media">
      <q-img
        :src="image"
        :alt="alt"
        fit="cover"
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

    <div class="gcard__body">
      <slot />
    </div>

    <span class="gcard__corner gcard__corner--tl" aria-hidden="true" />
    <span class="gcard__corner gcard__corner--tr" aria-hidden="true" />
    <span class="gcard__corner gcard__corner--bl" aria-hidden="true" />
    <span class="gcard__corner gcard__corner--br" aria-hidden="true" />
  </q-card>
</template>

<style scoped src="~/assets/css/components/animations/glitchCard.css"></style>
