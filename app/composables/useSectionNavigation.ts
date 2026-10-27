import { useSectionHash, type SectionHashOptions } from "./useSectionHash";

/** The About page's bookmarkable navigation, shared with all document anchors. */
export function useSectionNavigation(ids: readonly string[], options: Omit<SectionHashOptions, "scroll"> = {}) {
  const { $lenis } = useNuxtApp();
  const introReady = useState("introReady", () => false);
  return useSectionHash(ids, {
    track: false,
    enabled: introReady,
    ...options,
    scroll: $lenis ? (top, immediate) => {
      $lenis.resize();
      $lenis.scrollTo(top, { immediate });
    } : undefined,
  });
}
