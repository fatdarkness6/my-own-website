import { readonly, ref, watch } from "vue";

type MainMusicState = {
  ready: boolean;
  playing: boolean;
  volume: number; // 0..1
};

const audioEl = ref<HTMLAudioElement | null>(null);
const state = ref<MainMusicState>({
  ready: false,
  playing: false,
  volume: 0.3,
});

const STORAGE_KEY_ENABLED = "mainMusic:enabled";
const STORAGE_KEY_VOLUME = "mainMusic:volume";

// tries to start playback later if autoplay is blocked
let pendingPlay = false;
let unlockListenerAttached = false;

function readStored() {
  if (!import.meta.client) return;
  const vol = Number(localStorage.getItem(STORAGE_KEY_VOLUME));
  if (!Number.isNaN(vol)) state.value.volume = Math.min(1, Math.max(0, vol));
}

function isEnabledStored() {
  if (!import.meta.client) return false;
  return localStorage.getItem(STORAGE_KEY_ENABLED) === "1";
}

function setEnabledStored(v: boolean) {
  if (!import.meta.client) return;
  localStorage.setItem(STORAGE_KEY_ENABLED, v ? "1" : "0");
}

function ensureAudio(src: string) {
  if (!import.meta.client) return null;
  if (audioEl.value) return audioEl.value;

  readStored();

  const a = new Audio(src);
  a.preload = "auto";
  a.loop = true;
  a.volume = state.value.volume;

  a.addEventListener("play", () => (state.value.playing = true));
  a.addEventListener("pause", () => (state.value.playing = false));

  audioEl.value = a;
  state.value.ready = true;

  return a;
}

function attachUnlockListener(src: string) {
  if (!import.meta.client) return;
  if (unlockListenerAttached) return;
  unlockListenerAttached = true;

  const tryPlay = () => {
    unlockListenerAttached = false;
    if (!pendingPlay) return;
    pendingPlay = false;
    play(src);
  };

  window.addEventListener("pointerdown", tryPlay, { once: true });
  window.addEventListener("keydown", tryPlay, { once: true });
}

async function play(src: string) {
  const a = ensureAudio(src);
  if (!a) return;

  setEnabledStored(true);

  try {
    await a.play();
  } catch {
    // autoplay policy blocked it; try again on next user gesture
    pendingPlay = true;
    attachUnlockListener(src);
  }
}

function pause() {
  const a = audioEl.value;
  if (!a) return;
  setEnabledStored(false);
  a.pause();
}

function toggle(src: string) {
  if (state.value.playing) pause();
  else play(src);
}

function setVolume(v: number) {
  const volume = Math.min(1, Math.max(0, v));
  state.value.volume = volume;

  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
  }
  if (audioEl.value) {
    audioEl.value.volume = volume;
  }
}

// keep element volume in sync if state changes
watch(
  () => state.value.volume,
  (v) => {
    if (audioEl.value) audioEl.value.volume = v;
  },
);

export function useMainMusic() {
  return {
    state: readonly(state),
    ensureAudio,
    isEnabledStored,
    play,
    pause,
    toggle,
    setVolume,
  };
}
