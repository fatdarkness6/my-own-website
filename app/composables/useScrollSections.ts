import { ref, shallowReactive } from "vue";

export interface ScrollSectionEntry {
  id: string;
  el: HTMLElement;
}

const sections = shallowReactive<ScrollSectionEntry[]>([]);
const currentIndex = ref(0);
const isAnimating = ref(false);
const direction = ref<"down" | "up">("down");

let transitionDuration = 900;

function registerSection(entry: ScrollSectionEntry) {
  if (sections.find((s) => s.id === entry.id)) return;
  sections.push(entry);
}

function unregisterSection(id: string) {
  const idx = sections.findIndex((s) => s.id === id);
  if (idx !== -1) sections.splice(idx, 1);
}

function setTransitionDuration(ms: number) {
  transitionDuration = ms;
}

function goTo(index: number, dir: "down" | "up" = "down") {
  if (isAnimating.value) return;
  if (index < 0 || index >= sections.length) return;
  if (index === currentIndex.value) return;

  direction.value = dir;
  isAnimating.value = true;
  currentIndex.value = index;

  window.setTimeout(() => {
    isAnimating.value = false;
  }, transitionDuration);
}

function next() {
  goTo(currentIndex.value + 1, "down");
}

function prev() {
  goTo(currentIndex.value - 1, "up");
}

function resetToTop() {
  currentIndex.value = 0;
}

export function useScrollSections() {
  return {
    sections,
    currentIndex,
    isAnimating,
    direction,
    registerSection,
    unregisterSection,
    setTransitionDuration,
    goTo,
    next,
    prev,
    resetToTop,
  };
}
