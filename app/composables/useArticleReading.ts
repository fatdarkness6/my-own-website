import { onBeforeUnmount, onMounted, ref, watch } from "vue";

/** One event-driven scroll measurement for chapter navigation and background scrubbing. */
export function useArticleReading(ids: readonly string[]) {
  const element = ref<HTMLElement | null>(null);
  const progress = ref(0);
  const activeSection = ref(ids[0] ?? "");
  let mounted = false;
  let frame = 0;
  let resize: ResizeObserver | undefined;

  function update() {
    frame = 0;
    const root = element.value;
    if (!mounted || !root || document.hidden) return;
    const rect = root.getBoundingClientRect();
    const header = document.querySelector(".q-header")?.getBoundingClientRect().bottom ?? 88;
    const firstSection = document.getElementById(ids[0] ?? "");
    const anchorOffset = firstSection ? Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) || 0 : 0;
    // Native anchor links stop at scroll-margin-top. Use that same reading line
    // so a just-selected chapter isn't incorrectly left on its predecessor.
    const readingLine = Math.min(Math.max(1, window.innerHeight - 40), Math.max(Math.max(0, header) + 40, anchorOffset));
    const distance = Math.max(1, rect.height - window.innerHeight + readingLine + 40);
    progress.value = Math.min(1, Math.max(0, (readingLine - rect.top) / distance));
    let current = ids[0] ?? "";
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section && root.contains(section) && section.getBoundingClientRect().top <= readingLine + 1) current = id;
    }
    if (progress.value === 1) current = ids.at(-1) ?? current;
    activeSection.value = current;
  }
  function schedule() {
    if (mounted && !document.hidden && !frame) frame = window.requestAnimationFrame(update);
  }
  watch(element, (root) => {
    if (!mounted) return;
    resize?.disconnect();
    if (root) resize?.observe(root);
    schedule();
  }, { flush: "post" });
  onMounted(() => {
    mounted = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    if ("ResizeObserver" in window) {
      resize = new ResizeObserver(schedule);
      if (element.value) resize.observe(element.value);
    }
    void document.fonts?.ready.then(schedule);
    schedule();
  });
  onBeforeUnmount(() => {
    mounted = false;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    resize?.disconnect();
  });
  return { element, progress, activeSection };
}
