let audioCtx: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

export function useSelectSound() {
  async function init(src = "/sound/select-sound.mp3") {
    if (clickBuffer) return;
    if (loading) return loading;

    loading = (async () => {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = audioCtx || new AudioContextClass();

      const res = await fetch(src);
      const arr = await res.arrayBuffer();
      clickBuffer = await audioCtx.decodeAudioData(arr);
    })();

    return loading;
  }

  function play(options?: {
    volume?: number;
    offset?: number; // seconds
    delayMs?: number; // small human feel if you want
  }) {
    if (!audioCtx || !clickBuffer) return;

    const volume = options?.volume ?? 0.45;
    const offset = options?.offset ?? 0; // <-- use 0 to avoid chopping the sound
    const delayMs = options?.delayMs ?? 0;

    // If browser suspended it, resume (async but fast after first gesture)
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

    const when = audioCtx.currentTime + delayMs / 1000;

    const source = audioCtx.createBufferSource();
    source.buffer = clickBuffer;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.start(when, offset);
  }

  return { init, play };
}
