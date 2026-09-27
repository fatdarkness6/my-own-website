<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 45 }, // ms per character
  startDelay: { type: Number, default: 0 },
  prefix: { type: String, default: "> " }, // terminal-style prompt
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  cursor: { type: Boolean, default: true },
});

const emit = defineEmits(["done"]);

const displayed = ref("");
const showCursor = ref(true);
const isTyping = ref(false);

let audioBuffer = null;
let timeouts = [];
let cursorInterval = null;

function playTick() {
  if (!props.sound || !audioBuffer) return;
  // clone so overlapping keystrokes don't cut each other off
  const node = audioBuffer.cloneNode();
  node.volume = 0.35;
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
  displayed.value = "";
  isTyping.value = true;
  const t = setTimeout(() => typeChar(0), props.startDelay);
  timeouts.push(t);
}

defineExpose({ start });

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
