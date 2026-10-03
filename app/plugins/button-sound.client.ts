import { useSelectSound } from "~/composables/useSelectSound";

const SOUND_SRC = "/sound/select-sound.mp3";
const INTERACTIVE_SELECTOR =
  "button, .q-btn, .q-tab, .q-item--clickable, [role='button']";

export default defineNuxtPlugin(() => {
  const { init, play } = useSelectSound();

  void init(SOUND_SRC).catch(() => {});

  function resolveControl(target: EventTarget | null): Element | null {
    if (!(target instanceof Element)) return null;
    const control = target.closest(INTERACTIVE_SELECTOR);
    if (!control || control.closest('[data-click-sound="off"]')) return null;
    if (
      control.matches(
        ":disabled, [disabled], [aria-disabled='true'], .disabled, .q-btn--disabled",
      )
    ) {
      return null;
    }
    return control;
  }

  function playClick(): void {
    play({ volume: 0.6, offset: 0, delayMs: 0 });
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (resolveControl(event.target)) playClick();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    if (resolveControl(event.target)) playClick();
  }

  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("keydown", onKeyDown, true);

  const cleanup = () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
  };

  if (import.meta.hot) import.meta.hot.dispose(cleanup);
});
