import { onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

export type SwipeDirection = "left" | "right";

interface SwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  enabled?: () => boolean;
  onDrag?: (offset: number, dragging: boolean) => void;
}

/** Axis-lock after a small dead zone; never claim vertical scrolling or pinch. */
export function createHorizontalSwipe({ onSwipe, enabled = () => true, onDrag = () => {} }: SwipeOptions) {
  let gesture: { id: number; x: number; y: number; horizontal: boolean; surface: HTMLElement } | undefined;
  let suppressClick = false;

  function cancel() {
    const previous = gesture;
    gesture = undefined;
    onDrag(0, false);
    if (previous?.surface.hasPointerCapture?.(previous.id)) previous.surface.releasePointerCapture(previous.id);
  }

  return {
    cancel,
    handlers: {
      pointerdown(event: PointerEvent) {
        // A second finger cancels the swipe, leaving native pinch zoom alone.
        if (!event.isPrimary) { cancel(); return; }
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return;
        cancel();
        suppressClick = false;
        if (!enabled()) return;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false, surface: event.currentTarget as HTMLElement };
      },
      pointermove(event: PointerEvent) {
        if (!gesture || event.pointerId !== gesture.id) return;
        if (!enabled() || (event.pointerType === "mouse" && event.buttons === 0)) { cancel(); return; }
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (!gesture.horizontal) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
          suppressClick = true;
          // Do not prevent/stop the event: ScrollContainer still owns vertical snaps.
          if (Math.abs(dy) >= Math.abs(dx)) { cancel(); return; }
          gesture.horizontal = true;
          gesture.surface.setPointerCapture?.(event.pointerId);
        }
        onDrag(Math.max(-64, Math.min(64, dx * 0.45)), true);
      },
      pointerup(event: PointerEvent) {
        if (!gesture || event.pointerId !== gesture.id) return;
        const previous = gesture;
        const dx = event.clientX - previous.x;
        const dy = event.clientY - previous.y;
        cancel();
        if (enabled() && previous.horizontal && Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          onSwipe(dx < 0 ? "left" : "right");
        }
      },
      pointercancel(event: PointerEvent) {
        if (event.pointerId === gesture?.id) cancel();
      },
      lostpointercapture(event: PointerEvent) {
        // Touch/pen implicitly capture the image on pointerdown. Moving that
        // capture to our surface bubbles a loss event from the image; only a
        // loss on the surface itself means this swipe has actually been lost.
        if (event.pointerId === gesture?.id && event.target === gesture.surface) cancel();
      },
      pointerleave(event: PointerEvent) {
        if (event.pointerId === gesture?.id && !gesture.horizontal) cancel();
      },
      clickCapture(event: MouseEvent) {
        // Keyboard activations and a fresh tap remain normal links.
        if (suppressClick && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
    },
  };
}

export function useHorizontalSwipe(options: { onSwipe: SwipeOptions["onSwipe"]; enabled?: MaybeRefOrGetter<boolean> }) {
  const offset = ref(0);
  const dragging = ref(false);
  const enabled = () => options.enabled === undefined || toValue(options.enabled);
  const swipe = createHorizontalSwipe({
    onSwipe: options.onSwipe,
    enabled,
    onDrag: (value, active) => { offset.value = value; dragging.value = active; },
  });
  watch(enabled, (active) => { if (!active) swipe.cancel(); });
  onBeforeUnmount(swipe.cancel);
  return { ...swipe, offset, dragging };
}
