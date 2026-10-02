import {
  ref,
  reactive,
  toValue,
  readonly,
  onMounted,
  onBeforeUnmount,
  type MaybeRefOrGetter,
} from "vue";

export interface TypingSequenceOptions {
  /** Called once, after the last step finishes. */
  onFinish?: () => void;
  /** Pause (ms) before the next step. A function gives random pauses. */
  gap?: number | (() => number);
  /** Play once per client visit. A full browser reload starts a fresh visit. */
  onceKey?: string;
}

export interface TypedLineBinding {
  active: boolean;
  done: boolean;
  onDone: () => void;
}

export function useTypingSequence(
  steps: MaybeRefOrGetter<readonly string[]>,
  { onFinish, gap = 0, onceKey }: TypingSequenceOptions = {},
) {
  const current = ref<string | null>(null);
  const completed = reactive(new Set<string>());
  const started = ref(false);
  const finished = ref(false);
  let gapTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const visitComplete = onceKey
    ? useState<boolean>(`typing-sequence:${onceKey}`, () => false)
    : null;

  function finish(): void {
    current.value = null;
    if (finished.value) return;
    finished.value = true;
    if (visitComplete) visitComplete.value = true;
    onFinish?.();
  }

  /** Moves to the first step that isn't done (safe if the order changes). */
  function advance(): void {
    if (disposed) return;
    const nextStep = toValue(steps).find((step) => !completed.has(step));
    if (nextStep) current.value = nextStep;
    else finish();
  }

  function next(id: string): void {
    if (disposed || current.value !== id) return;
    completed.add(id);

    const pause = typeof gap === "function" ? gap() : gap;
    if (!pause) return advance();

    current.value = null;
    gapTimer = setTimeout(advance, pause);
  }

  function play(): void {
    if (started.value || disposed) return;
    started.value = true;
    advance();
  }

  /** Jumps straight to the end state (skip / already played). */
  function complete(): void {
    if (disposed) return;
    clearTimeout(gapTimer);
    started.value = true;
    toValue(steps).forEach((step) => completed.add(step));
    finish();
  }

  const isActive = (id: string): boolean => current.value === id;
  const isDone = (id: string): boolean => completed.has(id);
  const line = (id: string): TypedLineBinding => ({
    active: isActive(id),
    done: isDone(id),
    onDone: () => next(id),
  });

  if (visitComplete?.value) {
    started.value = true;
    toValue(steps).forEach((step) => completed.add(step));
    finished.value = true;
    onMounted(() => onFinish?.());
  }

  onBeforeUnmount(() => {
    disposed = true;
    clearTimeout(gapTimer);
  });

  return {
    play,
    complete,
    line,
    isActive,
    isDone,
    current: readonly(current),
    started: readonly(started),
    finished: readonly(finished),
  };
}
