<script setup>
import {
  ref,
  reactive,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";

import { useMainMusic } from "~/composables/useMainMusic";
import { useTypeSound } from "~/composables/useTypeSound";

const props = defineProps({
  maxBootDuration: { type: Number, default: 2200 },
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  typeSpeed: { type: Number, default: 10 },

  musicSrc: { type: String, default: "/sound/main-song.mp3" },
  autoplayMusic: { type: Boolean, default: true },
});

const { play: playMainMusic } = useMainMusic();

const {
  load: loadTypeSound,
  unlock: unlockAudio,
  tick: playTypeTick,
} = useTypeSound();

const introReady = useState("introReady", () => false);

/* ---------------- data ---------------- */

const bootLines = [
  { label: "Initializing kernel modules", tag: "OK" },
  { label: "Mounting filesystem [/dev/sda1]", tag: "OK" },
  { label: "Bypassing firewall [:443]", tag: "OK" },
  { label: "Scanning for intrusions", tag: "WARN" },
  { label: "Establishing secure uplink", tag: "OK" },
  { label: "Decrypting portfolio assets", tag: "OK" },
  { label: "Compiling UI components", tag: "OK" },
  { label: "Starting arsam-sarkhosh.dev", tag: "OK" },
];

const lines = reactive(
  bootLines.map((l) => ({
    ...l,
    shown: false,
    tagRevealed: false,
  })),
);

const typers = [];

const phase = ref("booting");
// booting | granted | ready | bursting

const current = ref(-1);
const done = ref(false);
const isTouch = ref(false);

const audioActivated = ref(false);
const bootStarted = ref(false);

const grantedText = ref("");
const welcomeText = ref("");

const hexRows = ref([]);
const rainCanvas = ref(null);

/*
 * Promise created while preloading the typing sound.
 * Calling load() again returns the same cached/in-progress request.
 */
let typeSoundLoadPromise = null;

/* ---------------- progress bar ---------------- */

const BAR_CELLS = 22;

const progress = computed(() =>
  Math.round((lines.filter((l) => l.tagRevealed).length / lines.length) * 100),
);

const bar = computed(() => {
  const filled = Math.round((progress.value / 100) * BAR_CELLS);

  return "█".repeat(filled) + "░".repeat(BAR_CELLS - filled);
});

/* ---------------- timer bookkeeping ---------------- */

const timeouts = new Set();

let disposed = false;

let maxTimer = 0;
let hexTimer = 0;

let stopRain = () => {};
let restoreScroll = () => {};

function later(fn, ms) {
  const id = window.setTimeout(() => {
    timeouts.delete(id);

    if (!disposed) {
      fn();
    }
  }, ms);

  timeouts.add(id);

  return id;
}

function clearAllTimeouts() {
  timeouts.forEach(clearTimeout);
  timeouts.clear();
}

/* ---------------- boot sequence ---------------- */

function startBoot() {
  if (bootStarted.value || disposed || phase.value !== "booting") {
    return;
  }

  bootStarted.value = true;

  clearTimeout(maxTimer);

  maxTimer = window.setTimeout(forceComplete, props.maxBootDuration);

  later(() => typeLine(0), 250);
}

function typeLine(i) {
  if (i >= lines.length) {
    grant();
    return;
  }

  current.value = i;

  lines[i].shown = true;

  nextTick(() => {
    if (!disposed && phase.value === "booting") typers[i]?.start?.();
  });
}

function onLineTyped(i) {
  if (phase.value !== "booting") {
    return;
  }

  later(
    () => {
      lines[i].tagRevealed = true;

      later(() => typeLine(i + 1), 120 + Math.random() * 220);
    },
    160 + Math.random() * 180,
  );
}

function forceComplete() {
  if (phase.value !== "booting") {
    return;
  }

  /*
   * Set phase FIRST so TypewriterText finish events
   * cannot continue the normal boot sequence.
   */
  phase.value = "granted";

  clearAllTimeouts();
  clearTimeout(maxTimer);

  lines.forEach((line, i) => {
    line.shown = true;

    typers[i]?.finish?.();

    line.tagRevealed = true;
  });

  current.value = -1;

  grant();
}

/* ---------------- access granted ---------------- */

const GLYPHS = "!<>-_\\\\/[]{}=+*^?#@$%&01ABCDEF";

function scramble(target, text, duration, onDone) {
  const start = performance.now();

  const step = (now) => {
    if (disposed || done.value || phase.value === "bursting") {
      return;
    }

    const t = Math.min((now - start) / duration, 1);

    const revealed = Math.floor(t * text.length);

    target.value = Array.from(text)
      .map((ch, i) => {
        if (ch === " " || i < revealed) {
          return ch;
        }

        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      })
      .join("");

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };

  requestAnimationFrame(step);
}

function grant() {
  clearTimeout(maxTimer);

  phase.value = "granted";
  current.value = -1;

  later(() => {
    scramble(grantedText, "ACCESS GRANTED", 350, () => {
      later(() => {
        scramble(welcomeText, "WELCOME, OPERATOR", 300, () => {
          phase.value = "ready";
        });
      }, 80);
    });
  }, 100);
}

/* ---------------- exit ---------------- */

function triggerBurst() {
  if (done.value || phase.value === "bursting") {
    return;
  }

  phase.value = "bursting";

  clearAllTimeouts();
  clearTimeout(maxTimer);
  clearInterval(hexTimer);
  current.value = -1;

  typers.forEach((typer) => typer?.finish?.());

  later(() => {
    done.value = true;
    introReady.value = true;

    stopRain();
    restoreScroll();
  }, 360);
}

/* ---------------- activation ---------------- */

function activateAndEnter() {
  if (audioActivated.value) {
    return;
  }

  audioActivated.value = true;

  const unlockPromise = unlockAudio();

  if (props.autoplayMusic) {
    void playMainMusic(props.musicSrc);
  }

  // Give immediate audio feedback once the small typing sample is ready.
  // This never blocks the loader from closing.
  if (props.sound) {
    const soundPromise =
      typeSoundLoadPromise || loadTypeSound(props.soundSrc);

    void Promise.all([Promise.resolve(unlockPromise), soundPromise]).then(
      ([unlocked, buffer]) => {
        if (unlocked && buffer) {
          playTypeTick(props.soundSrc, 0.35, 0);
        }
      },
    );
  }

  triggerBurst();
}

function handleActivate(event) {
  if (event?.type === "keydown" &&
      (event.repeat || event.key === "Tab" || event.key === "Escape" ||
       event.ctrlKey || event.metaKey || event.altKey)) return;

  if (done.value || phase.value === "bursting") {
    return;
  }

  activateAndEnter();
}

/* ---------------- hex dump ---------------- */

const hex = (n) =>
  Math.floor(Math.random() * 16 ** n)
    .toString(16)
    .toUpperCase()
    .padStart(n, "0");

function startHex() {
  hexTimer = window.setInterval(() => {
    const row =
      `0x${hex(4)}  ` + Array.from({ length: 6 }, () => hex(2)).join(" ");

    hexRows.value = [...hexRows.value.slice(-15), row];
  }, 90);
}

/* ---------------- matrix rain ---------------- */

function startRain(el) {
  if (!el) {
    return () => {};
  }

  const ctx = el.getContext("2d");

  if (!ctx) {
    return () => {};
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chars = "アカサタナハマヤラワ0123456789ABCDEF<>/{}[]#$";

  const size = 16;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let cols = [];

  let w = 0;
  let h = 0;

  let raf = 0;
  let last = 0;

  function resize() {
    w = el.clientWidth;
    h = el.clientHeight;

    el.width = w * dpr;
    el.height = h * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Array.from(
      {
        length: Math.ceil(w / size),
      },
      () => Math.random() * -(h / size),
    );
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);

    if (now - last < 50) {
      return;
    }

    last = now;

    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";

    ctx.fillRect(0, 0, w, h);

    ctx.font = `${size}px "JetBrains Mono", monospace`;

    cols.forEach((y, i) => {
      const ch = chars[(Math.random() * chars.length) | 0];

      ctx.fillStyle =
        Math.random() > 0.97 ? "#e0f2fe" : "rgba(59, 130, 246, 0.55)";

      ctx.fillText(ch, i * size, y * size);

      cols[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 1;
    });
  }

  resize();

  window.addEventListener("resize", resize);

  if (!reduce) {
    raf = requestAnimationFrame(draw);
  }

  return () => {
    cancelAnimationFrame(raf);

    window.removeEventListener("resize", resize);
  };
}

/* ---------------- lifecycle ---------------- */

onMounted(() => {
  isTouch.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  /*
   * Start fetching/decoding the typing sound early.
   *
   * AudioContext may be suspended on iOS here,
   * which is fine. A completed click/tap will resume it.
   */
  if (props.sound) {
    typeSoundLoadPromise = loadTypeSound(props.soundSrc);
  }

  const html = document.documentElement;

  const prevOverflow = html.style.overflow;

  html.style.overflow = "hidden";

  restoreScroll = () => {
    html.style.overflow = prevOverflow;
  };

  window.addEventListener("keydown", handleActivate);

  stopRain = startRain(rainCanvas.value);

  startHex();

  startBoot();
});

onBeforeUnmount(() => {
  disposed = true;

  clearAllTimeouts();

  clearTimeout(maxTimer);
  clearInterval(hexTimer);

  stopRain();

  window.removeEventListener("keydown", handleActivate);

  restoreScroll();
});
</script>

<template>
  <Transition name="loader-fade">
    <div
      v-if="!done"
      class="loader"
      :class="`is-${phase}`"
      role="status"
      aria-label="Loading"
      @click="handleActivate"
    >
      <canvas ref="rainCanvas" class="loader__rain" aria-hidden="true" />

      <div class="loader__vignette" aria-hidden="true" />

      <div class="loader__scanlines" aria-hidden="true" />

      <div class="loader__flash" aria-hidden="true" />

      <div class="term">
        <header class="term__bar">
          <span class="term__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <span class="term__cmd">
            root@arsam-sarkhosh:~# ./breach --target=portfolio
          </span>

          <span class="term__rec"> ● REC </span>
        </header>

        <div class="term__body">
          <section class="boot">
            <p class="boot__head">ARSAM_SARKHOSH_OS [v3.11.24]</p>

            <p class="boot__head boot__head--dim">
              (c) Full-Stack Systems. All rights reserved.
            </p>

            <div class="boot__log">
              <div
                v-for="(line, i) in lines"
                v-show="line.shown"
                :key="i"
                class="boot-line"
              >
                <span class="boot-line__prompt" aria-hidden="true"> $ </span>

                <AnimationTypewriterText
                  :ref="(el) => (typers[i] = el)"
                  :text="line.label"
                  :speed="typeSpeed"
                  prefix=""
                  :sound="sound"
                  :sound-src="soundSrc"
                  :cursor="i === current && !line.tagRevealed"
                  @done="onLineTyped(i)"
                />

                <span
                  v-if="line.tagRevealed"
                  class="boot-line__dots"
                  aria-hidden="true"
                />

                <span
                  v-if="line.tagRevealed"
                  class="boot-line__tag"
                  :class="`boot-line__tag--${line.tag.toLowerCase()}`"
                >
                  [{{ line.tag }}]
                </span>
              </div>
            </div>

            <div class="progress" aria-hidden="true">
              <span class="progress__label"> BREACH </span>

              <span class="progress__bar">
                {{ bar }}
              </span>

              <span class="progress__pct"> {{ progress }}% </span>
            </div>
          </section>

          <aside class="hex" aria-hidden="true">
            <p class="hex__title">// PACKET STREAM</p>

            <p v-for="(row, i) in hexRows" :key="i" class="hex__row">
              {{ row }}
            </p>
          </aside>
        </div>

        <p v-if="phase === 'booting'" class="term__enter">
          {{
            isTouch
              ? "TAP ONCE TO ENTER"
              : "CLICK OR PRESS ANY KEY TO ENTER"
          }}
        </p>

        <Transition name="granted">
          <div v-if="phase !== 'booting'" class="granted">
            <p class="granted__title" :data-text="grantedText">
              {{ grantedText }}
            </p>

            <p class="granted__sub">
              {{ welcomeText }}
            </p>

            <p
              v-if="phase === 'ready' || phase === 'bursting'"
              class="granted__prompt"
            >
              {{ isTouch ? "TAP ONCE TO ENTER" : "PRESS ANY KEY TO ENTER" }}
              <span class="caret"> _ </span>
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped src="~/assets/css/components/LoadingScreen.css"></style>
