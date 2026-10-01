export interface TypingSequenceOptions {
  /** Called once, after the last step finishes typing. */
  onFinish?: () => void;
}

/** Props + listener spread onto <AnimationTypedLine v-bind="line(id)" />. */
export interface TypedLineBinding {
  active: boolean;
  done: boolean;
  onDone: () => void;
}

export function useTypingSequence(
  steps: MaybeRefOrGetter<readonly string[]>,
  { onFinish }: TypingSequenceOptions = {},
) {
  const current = ref<string | null>(null);
  const completed = reactive(new Set<string>());
  const started = ref(false);
  const finished = ref(false);
  let disposed = false;

  /** Moves to the first step that hasn't completed yet (safe if the order changes). */
  function advance(): void {
    if (disposed) return;

    const nextStep = toValue(steps).find((step) => !completed.has(step));

    if (!nextStep) {
      current.value = null;
      if (!finished.value) {
        finished.value = true;
        onFinish?.();
      }
      return;
    }

    current.value = nextStep;
  }

  function complete(): void {
    if (disposed) return;
    started.value = true;
    toValue(steps).forEach((step) => completed.add(step));
    current.value = null;
    if (!finished.value) {
      finished.value = true;
      onFinish?.();
    }
  }

  /** Marks a step done and starts the next one. Ignores stale/duplicate events. */
  function next(id: string): void {
    if (disposed || current.value !== id) return;
    completed.add(id);
    advance();
  }

  /** Starts the sequence. Only runs once. */
  function play(): void {
    if (started.value || disposed) return;
    started.value = true;
    advance();
  }

  const isActive = (id: string): boolean => current.value === id;
  const isDone = (id: string): boolean => completed.has(id);

  const line = (id: string): TypedLineBinding => ({
    active: isActive(id),
    done: isDone(id),
    onDone: () => next(id),
  });

  onBeforeUnmount(() => {
    disposed = true;
  });

  return {
    play,
    line,
    isActive,
    isDone,
    complete,
    current: readonly(current),
    started: readonly(started),
    finished: readonly(finished),
  };
}
