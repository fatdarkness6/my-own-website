import { ref, toValue, watch, onMounted, onBeforeUnmount, type MaybeRefOrGetter } from "vue";

export interface ViewportEntryOptions {
  enabled?: MaybeRefOrGetter<boolean>;
  /** Observe a heading, not an entire tall section, with the default threshold. */
  threshold?: number;
  delay?: number;
}

/** Enter once, after content stays inside the reading area (above the bottom quarter). */
export function useViewportEntry({ enabled = true, threshold = 0.5, delay = 140 }: ViewportEntryOptions = {}) {
  const element = ref<HTMLElement | null>(null);
  const entered = ref(false);
  let observer: IntersectionObserver | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let mounted = false;

  function cancelEntry() {
    clearTimeout(timer);
    timer = undefined;
  }

  function readingArea() {
    return {
      top: Math.min(112, Math.round(window.innerHeight * 0.2)),
      bottom: Math.round(window.innerHeight * 0.25),
    };
  }

  function stop() {
    cancelEntry();
    observer?.disconnect();
    observer = undefined;
  }

  function finish() {
    entered.value = true;
    stop();
    window.removeEventListener("resize", observe);
    document.removeEventListener("visibilitychange", observe);
  }

  function observe() {
    stop();
    if (!mounted || entered.value || !toValue(enabled) || document.hidden || !element.value) return;
    if (!("IntersectionObserver" in window)) return finish();

    const { top, bottom } = readingArea();
    observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || entry.intersectionRatio < threshold) {
        cancelEntry();
        return;
      }
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (!toValue(enabled) || document.hidden || !element.value) return;
        // Recheck after the delay: a fast scroll can move past the heading before
        // the browser delivers another observer callback.
        const rect = element.value.getBoundingClientRect();
        const area = readingArea();
        const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
        const height = Math.max(0, Math.min(rect.bottom, window.innerHeight - area.bottom) - Math.max(rect.top, area.top));
        const ratio = width * height / (rect.width * rect.height);
        if (width > 0 && height > 0 && ratio >= threshold) finish();
      }, delay);
    }, {
      // Pixel margins deliberately use viewport HEIGHT. Percentage root margins
      // are resolved against width, which makes portrait/landscape timing differ.
      rootMargin: `-${top}px 0px -${bottom}px 0px`,
      threshold,
    });
    observer.observe(element.value);
  }

  watch([element, () => toValue(enabled)], observe, { flush: "post" });

  onMounted(() => {
    mounted = true;
    window.addEventListener("resize", observe);
    document.addEventListener("visibilitychange", observe);
    observe();
  });

  onBeforeUnmount(() => {
    mounted = false;
    stop();
    window.removeEventListener("resize", observe);
    document.removeEventListener("visibilitychange", observe);
  });
  return { element, entered };
}
