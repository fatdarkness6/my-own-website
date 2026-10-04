<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useTypeSound } from "~/composables/useTypeSound";

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 45 }, // ms per character
  startDelay: { type: Number, default: 0 },
  autoStart: { type: Boolean, default: false },
  prefix: { type: String, default: "> " }, // terminal-style prompt
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  soundVolume: { type: Number, default: 0.35 },
  // minimum time (ms) between two clicks so each one is actually heard
  soundMinInterval: { type: Number, default: 70 },
  cursor: { type: Boolean, default: true },
  accentTerms: { type: Array, default: () => [] },
});

const emit = defineEmits(["done"]);

const displayed = ref("");
const showCursor = ref(true);
const isTyping = ref(false);

const { load, tick } = useTypeSound();

const characters = computed(() => Array.from(props.text));
const revealedCount = computed(() => Array.from(displayed.value).length);
const accentIndexes = computed(() => {
  const indexes = new Set();

  for (const term of props.accentTerms) {
    if (!term) continue;
    let from = 0;
    let match = props.text.indexOf(term, from);
    while (match !== -1) {
      for (let index = match; index < match + term.length; index += 1) {
        indexes.add(index);
      }
      from = match + term.length;
      match = props.text.indexOf(term, from);
    }
  }

  return indexes;
});

let typingTimeout = null;
let cursorInterval = null;
let disposed = false;

function playTick() {
  if (!props.sound) return;
  tick(props.soundSrc, props.soundVolume, props.soundMinInterval);
}

function typeChar(index) {
  typingTimeout = null;
  if (disposed) return;
  if (index >= props.text.length) {
    isTyping.value = false;
    emit("done");
    return;
  }
  displayed.value += props.text[index];
  // don't click on spaces, sounds more natural
  if (props.text[index] !== " ") playTick();
  typingTimeout = setTimeout(() => typeChar(index + 1), props.speed);
}

function start() {
  if (disposed) return;
  clearTimeout(typingTimeout);
  displayed.value = "";
  isTyping.value = true;

  typingTimeout = setTimeout(() => typeChar(0), props.startDelay);
}

/** Instantly completes the text (used by safety-net / force-complete flows) */
function finish() {
  clearTimeout(typingTimeout);
  typingTimeout = null;
  const wasTyping = isTyping.value;
  displayed.value = props.text;
  isTyping.value = false;
  if (wasTyping) emit("done");
}

defineExpose({ start, finish });

onMounted(() => {
  // Start from the child's lifecycle, never from an unbound parent ref.
  if (props.autoStart) start();
  // shared + cached: loads once no matter how many typewriters exist
  if (props.sound) load(props.soundSrc);
  if (props.cursor) {
    cursorInterval = setInterval(() => {
      showCursor.value = !showCursor.value;
    }, 500);
  }
});

onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(typingTimeout);
  clearInterval(cursorInterval);
});
</script>

<template>
  <span class="typewriter">
    <span class="typewriter__prefix" v-if="prefix">{{ prefix }}</span>
    <span class="typewriter__text">
      <template v-for="(character, index) in characters" :key="index">
        <span
          v-if="cursor && index === revealedCount"
          class="typewriter__cursor-anchor"
          aria-hidden="true"
        >
          <span
            class="typewriter__cursor"
            :class="{ 'is-hidden': !showCursor }"
            >█</span
          >
        </span>
        <span
          class="typewriter__char"
          :class="{
            'is-visible': index < revealedCount,
            'is-accent': accentIndexes.has(index),
          }"
          >{{ character }}</span
        >
      </template>
      <span
        v-if="cursor && revealedCount >= characters.length"
        class="typewriter__cursor-anchor"
        aria-hidden="true"
      >
        <span
          class="typewriter__cursor"
          :class="{ 'is-hidden': !showCursor }"
          >█</span
        >
      </span>
    </span>
  </span>
</template>

<style scoped>
.typewriter {
  display: inline;
  white-space: pre-wrap;
}

.typewriter__char {
  visibility: hidden;
}

.typewriter__char.is-visible {
  visibility: visible;
}

.typewriter__char.is-accent {
  color: var(--eyebrow-color, #3b82f6);
}

.typewriter__prefix {
  color: var(--eyebrow-color, #3b82f6);
  margin-right: 4px;
}

.typewriter__cursor-anchor {
  position: relative;
  display: inline;
  width: 0;
}

.typewriter__cursor {
  position: absolute;
  inset-inline-start: 0.08em;
  bottom: 0;
  line-height: 1;
  color: var(--eyebrow-color, #3b82f6);
  transition: opacity 0.1s;
}

.typewriter__cursor.is-hidden {
  opacity: 0;
}
</style>
