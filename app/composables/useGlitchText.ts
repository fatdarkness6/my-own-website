import { ref, watch, onBeforeUnmount } from "vue";
import { graphemes, glitchAlphabet, scrambleText } from "~/utils/animatedText";

interface GlitchTextProps {
  text: string;
  chars: string;
  duration: number;
  speed: number;
}

interface GlitchTextOptions {
  styles: readonly string[];
  durationBase: number;
  durationSpread: number;
}

/**
 * Shared scramble renderer. Triggers and scheduling belong to the caller;
 * each instance retains its own animation state and original style preset.
 */
export function useGlitchText(
  props: GlitchTextProps,
  { styles, durationBase, durationSpread }: GlitchTextOptions,
) {
  const el = ref<HTMLElement | null>(null);
  const display = ref(props.text);
  const active = ref(false);
  const lockedWidth = ref<number | null>(null);
  const currentStyle = ref<string>(styles[0]!);

  let raf = 0;
  let lastStyle: string | null = null;

  function pickStyle() {
    let next: string;
    do {
      next = styles[Math.floor(Math.random() * styles.length)]!;
    } while (next === lastStyle && styles.length > 1);
    lastStyle = next;
    return next;
  }

  function stop() {
    if (raf && import.meta.client) cancelAnimationFrame(raf);
    raf = 0;
    active.value = false;
    lockedWidth.value = null;
    display.value = props.text;
  }

  function run() {
    if (raf || !el.value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    currentStyle.value = pickStyle();

    const runDuration =
      props.duration * (durationBase + Math.random() * durationSpread);

    const start = performance.now();
    let lastScramble = 0;
    const original = graphemes(props.text);
    const alphabet = glitchAlphabet(props.text, props.chars);

    lockedWidth.value = el.value!.getBoundingClientRect().width;
    active.value = true;

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= runDuration) {
        stop();
        return;
      }

      if (now - lastScramble >= props.speed) {
        lastScramble = now;
        const revealed = Math.floor((elapsed / runDuration) * original.length);
        display.value = scrambleText(props.text, revealed, alphabet);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  watch(
    () => props.text,
    () => {
      stop();
    },
  );

  onBeforeUnmount(() => cancelAnimationFrame(raf));

  return { el, display, active, lockedWidth, currentStyle, run };
}
