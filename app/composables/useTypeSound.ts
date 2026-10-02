let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const buffers = new Map<string, AudioBuffer>();

const loading = new Map<string, Promise<AudioBuffer | null>>();

let unlocked = false;
let lastTickAt = 0;

function getCtx(): AudioContext | null {
  if (!import.meta.client) {
    return null;
  }

  /*
   * Don't reuse a closed AudioContext.
   */
  if (ctx && ctx.state !== "closed") {
    return ctx;
  }

  const AC = window.AudioContext || (window as any).webkitAudioContext;

  if (!AC) {
    return null;
  }

  try {
    ctx = new AC({
      latencyHint: "interactive",
    });

    master = ctx.createGain();

    master.gain.value = 1;

    master.connect(ctx.destination);

    unlocked = false;

    return ctx;
  } catch (error) {
    console.warn("Could not create AudioContext:", error);

    ctx = null;
    master = null;

    return null;
  }
}

async function load(src: string): Promise<AudioBuffer | null> {
  if (buffers.has(src)) {
    return buffers.get(src)!;
  }

  if (loading.has(src)) {
    return loading.get(src)!;
  }

  const promise = (async () => {
    const c = getCtx();

    if (!c) {
      return null;
    }

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while loading ${src}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      /*
       * Callback form keeps compatibility with
       * older Safari versions.
       */
      const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
        c.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      });

      buffers.set(src, buffer);

      return buffer;
    } catch (error) {
      console.warn("Type sound failed to load:", error);

      return null;
    } finally {
      loading.delete(src);
    }
  })();

  loading.set(src, promise);

  return promise;
}

/**
 * Unlock Web Audio.
 *
 * IMPORTANT:
 * Call this directly inside:
 *
 * pointerdown
 * touchstart
 * click
 * keydown
 *
 * Do NOT wait/setTimeout before calling it.
 */
function unlock(): Promise<boolean> {
  const c = getCtx();

  if (!c) {
    return Promise.resolve(false);
  }

  if (c.state === "closed") {
    return Promise.resolve(false);
  }

  /*
   * Safari / iOS audio-session hint.
   *
   * This also helps audio behave more like
   * normal media playback on supported Safari
   * versions.
   */
  try {
    const session = (navigator as any).audioSession;

    if (session && session.type !== "playback") {
      session.type = "playback";
    }
  } catch {
    // Unsupported browser.
  }

  /*
   * iOS has historically behaved more reliably
   * when an actual AudioBufferSourceNode is started
   * inside the real user gesture.
   *
   * We start a silent buffer BEFORE resume().
   */
  if (!unlocked) {
    try {
      const silent = c.createBuffer(1, 1, c.sampleRate || 44100);

      const source = c.createBufferSource();

      source.buffer = silent;

      source.connect(c.destination);

      source.start(0);

      source.onended = () => {
        try {
          source.disconnect();
        } catch {}
      };
    } catch (error) {
      console.warn("Silent audio unlock failed:", error);
    }
  }

  /*
   * Already running.
   */
  if (c.state === "running") {
    unlocked = true;

    return Promise.resolve(true);
  }

  /*
   * IMPORTANT:
   *
   * resume() itself is called synchronously from
   * the user gesture.
   *
   * Only AFTER it resolves do we mark Web Audio
   * as actually unlocked.
   */
  try {
    const resumePromise = c.resume();

    return Promise.resolve(resumePromise)
      .then(() => {
        unlocked = c.state === "running";

        return unlocked;
      })
      .catch((error) => {
        unlocked = false;

        console.warn("AudioContext could not be resumed:", error);

        return false;
      });
  } catch (error) {
    unlocked = false;

    console.warn("AudioContext resume failed:", error);

    return Promise.resolve(false);
  }
}

function tick(src: string, volume = 0.35, minIntervalMs = 70) {
  const c = ctx;
  const buffer = buffers.get(src);

  if (!c || !buffer || !master) {
    return;
  }

  /*
   * Never attempt playback while Safari still
   * considers the AudioContext suspended.
   */
  if (c.state !== "running") {
    return;
  }

  /*
   * Multiple typewriters can fire at almost
   * the same time. Prevent machine-gun audio.
   */
  const now = performance.now();

  if (now - lastTickAt < minIntervalMs) {
    return;
  }

  lastTickAt = now;

  try {
    const source = c.createBufferSource();

    source.buffer = buffer;

    /*
     * Tiny pitch variation makes repeated key
     * sounds feel less robotic.
     */
    source.playbackRate.value = 0.94 + Math.random() * 0.12;

    const gain = c.createGain();

    gain.gain.value = Math.max(0, Math.min(volume, 1));

    source.connect(gain);
    gain.connect(master);

    source.onended = () => {
      try {
        source.disconnect();
      } catch {}

      try {
        gain.disconnect();
      } catch {}
    };

    source.start(0);
  } catch (error) {
    console.warn("Type sound playback failed:", error);
  }
}

export function useTypeSound() {
  return {
    load,
    unlock,
    tick,
  };
}
