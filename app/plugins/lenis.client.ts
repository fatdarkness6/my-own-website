import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default defineNuxtPlugin((nuxtApp) => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  // Phones already have native momentum scrolling and Lenis doesn't smooth touch
  // by default, so on touch devices it was just burning a rAF loop for nothing.
  if (reduceMotion || isTouch) {
    nuxtApp.hook("page:finish", () => window.scrollTo(0, 0));
    return { provide: { lenis: null } };
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    autoRaf: false,
  });

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  // Don't spin while the tab is in the background
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      rafId = requestAnimationFrame(raf);
    }
  });

  nuxtApp.hook("page:finish", () => {
    lenis.scrollTo(0, { immediate: true });
    lenis.resize();
  });

  return { provide: { lenis } };
});
