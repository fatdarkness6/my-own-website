import { readonly, ref } from "vue";

type MainMusicState = {
  ready: boolean;
  playing: boolean;
  volume: number; // 0..1
};

const STORAGE_KEY_VOLUME = "mainMusic:volume";
const DEFAULT_VOLUME = 0.3; // 50% for first-time visitors

const state = ref<MainMusicState>({
  ready: false,
  playing: false,
  volume: DEFAULT_VOLUME,
});

// Module-level audio: keeps playing when the header remounts during navigation.
let audioEl: HTMLAudioElement | null = null;
let volumeRestored = false;

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
    await audio.play();
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
    audioEl.volume = volume;
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
