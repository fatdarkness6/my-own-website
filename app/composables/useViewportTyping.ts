import { computed, watch, type MaybeRefOrGetter } from "vue";
import { useTypingSequence, type TypingSequenceOptions } from "~/composables/useTypingSequence";
import { useViewportEntry, type ViewportEntryOptions } from "~/composables/useViewportEntry";

/** Shared document-page trigger; ordering, RTL and once-per-visit behavior stay unchanged. */
export function useViewportTyping(
  steps: MaybeRefOrGetter<readonly string[]>,
  { viewport, ...options }: TypingSequenceOptions & { viewport?: Omit<ViewportEntryOptions, "enabled"> } = {},
) {
  const sequence = useTypingSequence(steps, options);
  const introReady = useState("introReady", () => false);
  const { element, entered } = useViewportEntry({
    ...viewport,
    enabled: computed(() => introReady.value && !sequence.started.value),
  });

  watch(entered, (visible) => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) sequence.complete();
    else sequence.play();
  });

  return { ...sequence, element };
}
