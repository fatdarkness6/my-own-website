export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  const onScroll = () => {
    document.documentElement.classList.add("is-scrolling");

    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.documentElement.classList.remove("is-scrolling");
    }, 300); // how long after you stop scrolling the glitch settles
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      document.documentElement.classList.remove("is-scrolling");
    });
  }
});
