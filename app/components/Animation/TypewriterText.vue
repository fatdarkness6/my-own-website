<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 45 }, // ms per character
  startDelay: { type: Number, default: 0 },
  prefix: { type: String, default: "> " }, // terminal-style prompt
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  soundVolume: { type: Number, default: 0.35 },
  // minimum time (ms) that must pass between two clicks so each one
  // has room to actually be heard instead of getting stepped on
  soundMinInterval: { type: Number, default: 70 },
  cursor: { type: Boolean, default: true },
});

const emit = defineEmits(["done"]);

const displayed = ref("");
const showCursor = ref(true);
const isTyping = ref(false);

let audioBuffer = null;
let timeouts = [];
let cursorInterval = null;
let lastTickAt = 0;

function playTick() {
  if (!props.sound || !audioBuffer) return;

  const now = performance.now();
  // skip this click if the previous one hasn't had enough time to breathe
  if (now - lastTickAt < props.soundMinInterval) return;
  lastTickAt = now;

  // clone so overlapping keystrokes don't cut each other off
  const node = audioBuffer.cloneNode();
  node.volume = props.soundVolume;
  node.play().catch(() => {}); // ignore autoplay-block errors silently
}

function typeChar(index) {
  if (index >= props.text.length) {
    isTyping.value = false;
    emit("done");
    return;
  }
  displayed.value += props.text[index];
  playTick();
  const t = setTimeout(() => typeChar(index + 1), props.speed);
  timeouts.push(t);
}

function start() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
  displayed.value = "";
  isTyping.value = true;
  lastTickAt = 0;

  const t = setTimeout(() => typeChar(0), props.startDelay);
  timeouts.push(t);
}

/** Instantly completes the text (used by safety-net / force-complete flows) */
function finish() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
  const wasTyping = isTyping.value;
  displayed.value = props.text;
  isTyping.value = false;
  if (wasTyping) emit("done");
}

defineExpose({ start, finish });

onMounted(() => {
  if (props.sound) {
    audioBuffer = new Audio(props.soundSrc);
    audioBuffer.preload = "auto";
  }
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 500);
});

onBeforeUnmount(() => {
  timeouts.forEach(clearTimeout);
  clearInterval(cursorInterval);
});
</script>

<template>
  <span class="typewriter">
    <span class="typewriter__prefix" v-if="prefix">{{ prefix }}</span>
    <span class="typewriter__text">{{ displayed }}</span>
    <span
      v-if="cursor"
      class="typewriter__cursor"
      :class="{ 'is-hidden': !showCursor }"
      >█</span
    >
  </span>
</template>

<style scoped>
.typewriter {
  display: inline-block;
  white-space: pre-wrap;
}

.typewriter__prefix {
  color: var(--eyebrow-color, #3b82f6);
  margin-right: 4px;
}

.typewriter__cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--eyebrow-color, #3b82f6);
  transition: opacity 0.1s;
}

.typewriter__cursor.is-hidden {
  opacity: 0;
}
</style>
