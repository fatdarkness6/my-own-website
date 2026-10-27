import { useSelectSound } from "~/composables/useSelectSound";

const SOUND_SRC = "/sound/select-sound.mp3";
const INTERACTIVE_SELECTOR =
  "button, .q-btn, .q-tab, .q-item--clickable, [role='button']";

export default defineNuxtPlugin(() => {
  const { init, play } = useSelectSound();
  let keyboardTab: Element | null = null;
  let keyboardReset: ReturnType<typeof setTimeout> | undefined;

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
    // Use the normal effect level so the click remains audible over the music.
    play({ volume: 0.45, offset: 0, delayMs: 0 });
  }

  function onClick(event: MouseEvent): void {
    if (event.button !== 0) return;
    const control = resolveControl(event.target);
    if (!control || (event.detail === 0 && control === keyboardTab)) return;
    playClick();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const control = resolveControl(event.target);
    // Quasar tabs activate directly on keydown and can prevent the native click.
    if (!control?.matches(".q-tab")) return;
    clearTimeout(keyboardReset);
    keyboardTab = control;
    playClick();
  }

  function onKeyUp(): void {
    if (!keyboardTab) return;
    // Keep the guard through Space's default click action after keyup.
    clearTimeout(keyboardReset);
    keyboardReset = setTimeout(() => { keyboardTab = null; }, 0);
  }

  // Browsers cancel clicks for scrolling gestures. Keyboard activation also
  // produces a click for buttons/items; tabs have the keyboard fallback above.
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keyup", onKeyUp, true);

  const cleanup = () => {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keyup", onKeyUp, true);
    clearTimeout(keyboardReset);
    keyboardTab = null;
  };

  if (import.meta.hot) import.meta.hot.dispose(cleanup);
});
