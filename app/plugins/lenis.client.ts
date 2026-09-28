import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default defineNuxtPlugin((nuxtApp) => {
  // Respect users who prefer reduced motion
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const lenis = new Lenis({
    duration: 1.2, // scroll smoothness (higher = smoother/slower)
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduceMotion,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  // Animation loop
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Scroll to top on every page navigation
  nuxtApp.hook("page:finish", () => {
    lenis.scrollTo(0, { immediate: true });
    lenis.resize();
  });

  return {
    provide: { lenis },
  };
});
