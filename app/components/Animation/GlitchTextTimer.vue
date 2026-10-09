<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useGlitchText } from "~/composables/useGlitchText";
import { textDirection } from "~/utils/animatedText";

const props = defineProps({
  text: { type: String, required: true },
  duration: { type: Number, default: 600 },
  speed: { type: Number, default: 45 },
  chars: {
    type: String,
    default: "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  interval: { type: Number, default: 5000 },
  randomize: { type: Boolean, default: true },
});

const STYLES = ["rgb", "flicker", "block", "scanline"];
const direction = computed(() => textDirection(props.text));

const { el, display, active, lockedWidth, currentStyle, run } = useGlitchText(
  props,
  { styles: STYLES, durationBase: 0.8, durationSpread: 0.6 },
);
let timer = null;

function scheduleNext() {
  const jitter = props.randomize ? Math.random() * 1500 : 0;
  timer = setTimeout(() => {
    run();
    scheduleNext();
  }, props.interval + jitter);
}

onMounted(() => {
  scheduleNext();
});

onBeforeUnmount(() => {
  clearTimeout(timer);
});
</script>

<template>
  <span
    ref="el"
    class="glitch-text"
    :dir="direction"
    :class="[
      { 'is-glitching': active },
      active ? `glitch-style--${currentStyle}` : '',
    ]"
    :data-text="text"
    :style="lockedWidth ? { width: lockedWidth + 'px' } : null"
  >
    <span class="glitch-text__reserve" aria-hidden="true">{{ text }}</span>
    <span class="glitch-text__visual" aria-hidden="true">{{ display }}</span>
    <span class="glitch-text__sr">{{ text }}</span>
  </span>
</template>

<style scoped src="~/assets/css/components/animations/glitchText.css"></style>

<style scoped>
.glitch-style--shake.is-glitching {
  animation: shake-jitter 0.15s steps(2, end) infinite;
}

@keyframes shake-jitter {
  0% {
    transform: translate(0, 0) skewX(0deg);
  }
  25% {
    transform: translate(-3px, 2px) skewX(3deg);
  }
  50% {
    transform: translate(3px, -2px) skewX(-3deg);
  }
  75% {
    transform: translate(-2px, -1px) skewX(1deg);
  }
  100% {
    transform: translate(0, 0) skewX(0deg);
  }
}
</style>
