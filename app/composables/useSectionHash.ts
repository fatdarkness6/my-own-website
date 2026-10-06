import { onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

interface SectionHashOptions {
  enabled?: MaybeRefOrGetter<boolean>;
  /** Smooth-scroll adapters (such as Lenis) must also support immediate restoration. */
  scroll?: (top: number, immediate: boolean) => void;
}

/** Keep document chapters bookmarkable without routing, jumping or filling history. */
export function useSectionHash(ids: readonly string[], { enabled = true, scroll }: SectionHashOptions = {}) {
  const activeSection = ref(ids[0] ?? "");
  let mounted = false;
  let tracking = false;
  let pathname = "";
  let frame = 0;
  let destination: string | undefined;

  function section(id: string) {
    return ids.includes(id) ? document.getElementById(id) : null;
  }

  function margin(target: HTMLElement) {
    return Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  }

  function targetTop(target: HTMLElement) {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(max, window.scrollY + target.getBoundingClientRect().top - margin(target)));
  }

  function writeHash(id: string, push = false) {
    const hash = `#${encodeURIComponent(id)}`;
    if (window.location.hash === hash) return;
    // Preserve Vue Router's history state, query parameters and localized pathname.
    window.history[push ? "pushState" : "replaceState"](
      window.history.state, "", `${window.location.pathname}${window.location.search}${hash}`,
    );
  }

  function moveTo(target: HTMLElement, immediate: boolean) {
    const top = targetTop(target);
    if (scroll) scroll(top, immediate);
    else window.scrollTo({
      top,
      behavior: immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function update() {
    frame = 0;
    if (!tracking || !toValue(enabled) || window.location.pathname !== pathname) return;
    if (destination) {
      const target = section(destination);
      if (target && Math.abs(window.scrollY - targetTop(target)) > 2) return;
      destination = undefined;
    }
    const targets = ids.map(section).filter((target): target is HTMLElement => Boolean(target));
    if (!targets.length) return;
    const readingLine = Math.min(window.innerHeight * 0.45, margin(targets[0]!) + window.innerHeight * 0.2);
    let current = targets[0]!;
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= readingLine) current = target;
    }
    // The final chapter may be too short to reach the reading line.
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2)
      current = targets.at(-1)!;
    activeSection.value = current.id;
    writeHash(current.id);
  }

  function schedule() {
    if (tracking && !frame) frame = window.requestAnimationFrame(update);
  }

  function restore() {
    if (!mounted) return;
    tracking = false;
    destination = undefined;
    window.cancelAnimationFrame(frame);
    if (!toValue(enabled)) return;
    // Wait for the intro's scroll lock and the responsive layout to settle.
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!mounted || !toValue(enabled) || window.location.pathname !== pathname) return;
        let id = "";
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* Ignore malformed links. */ }
        const target = section(id);
        if (target) moveTo(target, true);
        tracking = true;
        update();
      });
    });
  }

  function navigateToSection(event: Event, id: string) {
    if ("button" in event && (
      (event as MouseEvent).button !== 0 || (event as MouseEvent).metaKey || (event as MouseEvent).ctrlKey
      || (event as MouseEvent).shiftKey || (event as MouseEvent).altKey
    )) return;
    const target = section(id);
    if (!target) return;
    event.preventDefault();
    destination = id;
    activeSection.value = id;
    writeHash(id, true);
    moveTo(target, false);
    schedule();
  }

  function interrupt(event: Event) {
    if (event.type === "keydown" && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes((event as KeyboardEvent).key)) return;
    destination = undefined;
    schedule();
  }

  watch(() => toValue(enabled), restore, { flush: "post" });
  onMounted(() => {
    mounted = true;
    pathname = window.location.pathname;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    restore();
  });
  onBeforeUnmount(() => {
    mounted = false;
    tracking = false;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("wheel", interrupt);
    window.removeEventListener("touchstart", interrupt);
    window.removeEventListener("keydown", interrupt);
    window.removeEventListener("popstate", restore);
    window.removeEventListener("hashchange", restore);
  });
  return { activeSection, navigateToSection };
}
