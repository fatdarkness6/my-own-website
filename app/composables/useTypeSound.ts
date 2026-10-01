let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<string, AudioBuffer>();
const loading = new Map<string, Promise<AudioBuffer | null>>();
let unlocked = false;
let lastTickAt = 0;

function getCtx(): AudioContext | null {
  if (!import.meta.client) return null;
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  master.connect(ctx.destination);
  return ctx;
}

async function load(src: string): Promise<AudioBuffer | null> {
  if (buffers.has(src)) return buffers.get(src)!;
  if (loading.has(src)) return loading.get(src)!;

  const p = (async () => {
    const c = getCtx();
    if (!c) return null;
    try {
      const res = await fetch(src);
      const arr = await res.arrayBuffer();
      // callback form for old Safari
      const buf = await new Promise<AudioBuffer>((resolve, reject) =>
        c.decodeAudioData(arr, resolve, reject),
      );
      buffers.set(src, buf);
      return buf;
    } catch (err) {
      console.warn("Type sound failed to load:", err);
      return null;
    } finally {
      loading.delete(src);
    }
  })();

  loading.set(src, p);
  return p;
}

/**
 * MUST be called synchronously inside a user gesture
 * (pointerdown / keydown / click). Safe to call many times.
 */
function unlock() {
  const c = getCtx();
  if (!c) return;

  // Safari 17+: play even when the iPhone silent switch is on
  try {
    const session = (navigator as any).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {}

  if (c.state !== "running") c.resume().catch(() => {});

  if (!unlocked) {
    // iOS needs an actual sound started inside the gesture
    const silent = c.createBuffer(1, 1, 22050);
    const s = c.createBufferSource();
    s.buffer = silent;
    s.connect(c.destination);
    s.start(0);
    unlocked = true;
  }
}

function tick(src: string, volume = 0.35, minIntervalMs = 70) {
  const c = ctx;
  const buf = buffers.get(src);
  if (!c || !buf || !master || c.state !== "running") return;

  // global throttle: several typewriters at once won't machine-gun the speaker
  const now = performance.now();
  if (now - lastTickAt < minIntervalMs) return;
  lastTickAt = now;

  const source = c.createBufferSource();
  source.buffer = buf;
  // tiny pitch variance so it sounds like real keys
  source.playbackRate.value = 0.94 + Math.random() * 0.12;

  const g = c.createGain();
  g.gain.value = volume;
  source.connect(g);
  g.connect(master);
  source.onended = () => {
    source.disconnect();
    g.disconnect();
  };
  source.start();
}

export function useTypeSound() {
  return { load, unlock, tick };
}
