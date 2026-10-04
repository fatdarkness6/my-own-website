<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useTypeSound } from "~/composables/useTypeSound";
import { graphemes, textDirection } from "~/utils/animatedText";

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

const characters = computed(() => graphemes(props.text));
const revealedCount = computed(() => graphemes(displayed.value).length);
const direction = computed(() => textDirection(props.text));
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

// Reserve complete words instead of wrapping each Arabic letter in a span.
// This preserves cursive shaping and keeps word positions stable while typing.
const words = computed(() => {
  let offset = 0;
  let index = 0;
  return (props.text.match(/\S+|\s+/gu) ?? []).map((text) => {
    const count = graphemes(text).length;
    const item = {
      text, start: index, count, whitespace: /^\s+$/u.test(text),
      accent: Array.from({ length: text.length }, (_, i) => offset + i)
        .some((i) => accentIndexes.value.has(i)),
      direction: textDirection(text),
    };
    offset += text.length;
    index += count;
    return item;
  });
});
const visibleWord = (word) => graphemes(word.text)
  .slice(0, Math.max(0, revealedCount.value - word.start)).join("");

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
  if (index >= characters.value.length) {
    isTyping.value = false;
    emit("done");
    return;
  }
  displayed.value += characters.value[index];
  // don't click on spaces, sounds more natural
  if (characters.value[index].trim()) playTick();
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
  if (props.autoStart) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      isTyping.value = true;
      finish();
    } else start();
  }
  // shared + cached: loads once no matter how many typewriters exist
  if (props.sound) load(props.soundSrc);
  if (props.cursor) {
    cursorInterval = setInterval(() => {
      showCursor.value = !showCursor.value;
    }, 500);
  }
});

watch(() => props.text, () => {
  if (isTyping.value) start();
  else displayed.value = props.text;
});

onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(typingTimeout);
  clearInterval(cursorInterval);
});
</script>

<template>
  <span class="typewriter" :dir="direction">
    <bdi class="typewriter__prefix" v-if="prefix" dir="ltr">{{ prefix }}</bdi>
    <span class="typewriter__text">
      <template v-for="(word, index) in words" :key="index">
        <template v-if="word.whitespace">{{ word.text }}</template>
        <span v-else class="typewriter__word" :dir="word.direction" :class="{ 'is-accent': word.accent }">
          <span class="typewriter__word-reserve" aria-hidden="true">{{ word.text }}</span>
          <span class="typewriter__word-live">{{ visibleWord(word) }}<span
            v-if="cursor && revealedCount > word.start && revealedCount <= word.start + word.count"
            class="typewriter__cursor-anchor" aria-hidden="true"
          ><span class="typewriter__cursor" :class="{ 'is-hidden': !showCursor }">█</span></span></span>
        </span>
      </template>
    </span>
  </span>
</template>

<style scoped>
.typewriter {
  display: inline;
  white-space: pre-wrap;
}

.typewriter__word {
  position: relative;
  display: inline-grid;
  max-width: 100%;
  vertical-align: baseline;
  white-space: nowrap;
}

.typewriter__word-reserve {
  visibility: hidden;
}

.typewriter__word-live {
  position: absolute;
  inset: 0;
  text-align: start;
}

.typewriter__word.is-accent {
  color: var(--eyebrow-color, #3b82f6);
}

.typewriter__prefix {
  color: var(--eyebrow-color, #3b82f6);
  margin-inline-end: 4px;
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
