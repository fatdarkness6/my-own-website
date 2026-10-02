import { readonly, ref } from "vue";
import { useTypeSound } from "~/composables/useTypeSound";

type MainMusicState = {
  ready: boolean;
  playing: boolean;
  volume: number; // 0..1
};

const STORAGE_KEY_VOLUME = "mainMusic:volume";
const DEFAULT_VOLUME = 0.3;

const state = ref<MainMusicState>({
  ready: false,
  playing: false,
  volume: DEFAULT_VOLUME,
});

// Module-level audio: keeps playing when the header remounts during navigation.
let audioEl: HTMLAudioElement | null = null;
let volumeRestored = false;

const {
  unlock: unlockAudio,
  connectMediaElement,
  setMediaElementVolume,
} = useTypeSound();

function restoreVolume() {
  if (!import.meta.client || volumeRestored) return;
  volumeRestored = true;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_VOLUME);

    // Important: Number(null) is 0, so check for a missing value first.
    if (saved === null || saved.trim() === "") return;

    const value = Number(saved);
    if (Number.isFinite(value)) {
      state.value.volume = Math.max(0, Math.min(1, value));
    }
  } catch {
    // Storage unavailable: keep the default volume.
  }
}

function ensureAudio(src: string) {
  if (!import.meta.client) return null;

  restoreVolume();

  if (audioEl) return audioEl;

  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = true;
  audio.volume = state.value.volume;
  audio.muted = state.value.volume === 0;

  audio.addEventListener("play", () => {
    state.value.playing = true;
  });

  audio.addEventListener("pause", () => {
    state.value.playing = false;
  });

  audioEl = audio;
  state.value.ready = true;

  // Creating/preloading audio does NOT start playback.
  return audio;
}

async function play(src: string) {
  const audio = ensureAudio(src);
  if (!audio) return;

  try {
    // Both calls happen before the first await so mobile browsers see them as
    // part of the user's tap. Music and typing sounds share this one context.
    const unlockPromise = unlockAudio();
    const mediaGain = connectMediaElement(audio, state.value.volume);

    if (mediaGain) {
      // The GainNode owns volume after routing. Keeping the native media
      // element unmuted avoids iOS applying a second, uncontrollable volume.
      audio.volume = 1;
      audio.muted = false;
    }

    const playPromise = audio.play();

    await Promise.all([unlockPromise, playPromise]);
  } catch (error) {
    // Don't retry on a random future click elsewhere on the website.
    // The user can press Play again if playback fails.
    console.warn("Background music could not start:", error);
  }
}

function pause() {
  audioEl?.pause();
}

function toggle(src: string) {
  const audio = ensureAudio(src);
  if (!audio) return;

  if (audio.paused) {
    void play(src);
  } else {
    pause();
  }
}

function setVolume(value: number) {
  if (!Number.isFinite(value)) return;

  restoreVolume();

  const volume = Math.max(0, Math.min(1, value));
  state.value.volume = volume;

  if (audioEl) {
    if (setMediaElementVolume(audioEl, volume)) {
      audioEl.volume = 1;
      audioEl.muted = false;
    } else {
      // Native fallback for browsers without Web Audio support.
      audioEl.volume = volume;
      audioEl.muted = volume === 0;
    }
  }

  if (import.meta.client) {
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
    } catch {
      // Volume still works for this session if storage is unavailable.
    }
  }
}

export function useMainMusic() {
  return {
    state: readonly(state),
    ensureAudio,
    play,
    pause,
    toggle,
    setVolume,
  };
}
