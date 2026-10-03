import { ref, onMounted, onBeforeUnmount } from "vue";

/** Observe once; disconnect as soon as the content enters the viewport. */
export function useViewportEntry() {
  const element = ref<HTMLElement | null>(null);
  const entered = ref(false);
  let observer: IntersectionObserver | undefined;

  onMounted(() => {
    if (!element.value || !("IntersectionObserver" in window)) {
      entered.value = true;
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        entered.value = true;
        observer?.disconnect();
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0 },
    );
    observer.observe(element.value);
  });

  onBeforeUnmount(() => observer?.disconnect());
  return { element, entered };
}
