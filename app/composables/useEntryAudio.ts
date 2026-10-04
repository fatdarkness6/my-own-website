import { useMainMusic } from "~/composables/useMainMusic";
import { useTypeSound } from "~/composables/useTypeSound";

interface EntryAudioOptions {
  sound?: boolean;
  soundSrc?: string;
  musicSrc?: string;
  autoplayMusic?: boolean;
}

// Both entry paths use the same gesture-driven audio activation.
export function useEntryAudio(options: EntryAudioOptions = {}) {
  const { play } = useMainMusic();
  const { load, unlock, tick } = useTypeSound();
  let soundLoad: ReturnType<typeof load> | undefined;
  const soundSource = () => options.soundSrc ?? "/sound/type-01.mp3";

  function prepare() {
    if (options.sound !== false) soundLoad = load(soundSource());
  }

  function activate() {
    // Keep these calls synchronous with the click/tap for mobile autoplay rules.
    const unlockPromise = unlock();
    if (options.autoplayMusic !== false) {
      void play(options.musicSrc ?? "/sound/main-song.mp3");
    }
    if (options.sound !== false) {
      const source = soundSource();
      void Promise.all([unlockPromise, soundLoad ?? load(source)])
        .then(([unlocked, buffer]) => {
          if (unlocked && buffer) tick(source, 0.35, 0);
        })
        .catch(() => {});
    }
  }

  return { prepare, activate };
}
