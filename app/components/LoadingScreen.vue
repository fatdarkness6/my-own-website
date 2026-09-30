<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useMainMusic } from "~/composables/useMainMusic";

const props = defineProps({
  maxBootDuration: { type: Number, default: 6000 },
  sound: { type: Boolean, default: true },
  soundSrc: { type: String, default: "/sound/type-01.mp3" },
  typeSpeed: { type: Number, default: 14 },
  musicSrc: { type: String, default: "/sound/main-song.mp3" },
  autoplayMusic: { type: Boolean, default: true },
  frameSampleDuration: { type: Number, default: 1500 },
  maxResourceRows: { type: Number, default: 5 },
});

const { play: playMainMusic } = useMainMusic();
const introReady = useState("introReady", () => false);
const phase = ref("booting");
const done = ref(false);
const loaderEl = ref(null);
const terminalOutput = ref(null);
const followOutput = ref(true);
const isTouch = ref(false);
const reduceMotion = ref(false);
const currentLineIndex = ref(0);
const typingFinished = ref(false);
const bootElapsed = ref(0);
const typewriterRefs = new Map();

// Shell-style labels for browser API checks, not commands executed on the visitor's OS.
const lineStates = reactive(
  [
    { id: "runtime", label: "runtime.inspect --viewport --threads" },
    { id: "graphics", label: "graphics.inspect --webgl" },
    { id: "frames", label: "frames.sample --foreground" },
    { id: "storage", label: "storage.estimate --origin" },
    { id: "session", label: "session.create --local" },
    { id: "fonts", label: "fonts.await --document" },
    { id: "resources", label: "resources.observe --buffered" },
  ].map((line) => ({
    ...line,
    status: "PENDING",
    result: "Waiting for browser response…",
    detail: "",
    tagRevealed: false,
  })),
);

const settledCount = computed(
  () => lineStates.filter((line) => line.status !== "PENDING").length,
);
const frame = reactive({
  count: 0,
  average: null,
  slowest: null,
  rate: null,
  samples: [],
});
const resourceRows = ref([]);
const resourceCount = ref(0);
const reportedTransferBytes = ref(0);
const resourcesLive = ref(false);

const resourceRowLimit = computed(() =>
  Math.max(1, Math.min(8, Math.floor(props.maxResourceRows) || 5)),
);
const frameCeiling = computed(() => Math.max(20, ...frame.samples));
const frameSparkline = computed(() => {
  const glyphs = "▁▂▃▄▅▆▇█";
  return frame.samples
    .slice(-28)
    .map((ms) => {
      const index = Math.min(7, Math.floor((ms / frameCeiling.value) * 7));
      return glyphs[index];
    })
    .join("");
});
const resourceTail = computed(() => [...resourceRows.value].reverse());

let disposed = false;
let forcing = false;
let token = 0;
let bootStartedAt = 0;
let maxTimer;
let startTimer;
let advanceTimer;
let burstTimer;
let frameRaf = 0;
let resourceObserver = null;
let restoreScroll = () => {};
let previousFocus = null;
const seenResources = new Set();

function onOutputScroll() {
  const el = terminalOutput.value;
  if (!el) return;
  followOutput.value = el.scrollHeight - el.scrollTop - el.clientHeight < 36;
}

function jumpToLatest() {
  followOutput.value = true;
  const el = terminalOutput.value;
  if (el) el.scrollTop = el.scrollHeight;
}

watch(
  () => [
    currentLineIndex.value,
    phase.value,
    frame.count,
    resourceRows.value.map((row) => row.id).join(","),
    lineStates
      .map(
        (line) =>
          `${line.tagRevealed}|${line.status}|${line.result}|${line.detail}`,
      )
      .join("\n"),
  ],
  () => {
    if (!followOutput.value || window.getSelection()?.isCollapsed === false)
      return;
    nextTick(() => {
      if (!disposed && followOutput.value) jumpToLatest();
    });
  },
  { flush: "post" },
);

function getLine(id) {
  return lineStates.find((line) => line.id === id);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "unavailable";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[index]}`;
}

function setTypewriterRef(el, index) {
  if (el) typewriterRefs.set(index, el);
  else typewriterRefs.delete(index);
}

function settle(id, status, result, detail = "") {
  if (disposed || phase.value !== "booting") return;
  const line = getLine(id);
  // Do not overwrite a timeout/skip or accept a stale async result.
  if (!line || line.status !== "PENDING") return;
  Object.assign(line, { status, result, detail });
  maybeReady();
}

async function runProbe(id, fn) {
  const myToken = token;
  try {
    const result = await fn();
    if (disposed || myToken !== token) return;
    settle(id, result.status ?? "OK", result.result, result.detail ?? "");
  } catch (error) {
    if (disposed || myToken !== token) return;
    const restricted = ["SecurityError", "NotAllowedError"].includes(
      error?.name,
    );
    settle(
      id,
      restricted ? "RESTRICTED" : "WARN",
      restricted
        ? "Browser policy blocked this check."
        : "This check could not be completed.",
    );
  }
}

function stopDiagnostics() {
  cancelAnimationFrame(frameRaf);
  frameRaf = 0;
  resourceObserver?.disconnect();
  resourceObserver = null;
  resourcesLive.value = false;
  document.removeEventListener("visibilitychange", onVisibilityChange);
}

function finishBooting() {
  if (disposed || phase.value !== "booting") return;
  phase.value = "ready";
  bootElapsed.value = performance.now() - bootStartedAt;
  clearTimeout(maxTimer);
  clearTimeout(startTimer);
  clearTimeout(advanceTimer);
  stopDiagnostics();
}

function maybeReady() {
  if (
    typingFinished.value &&
    lineStates.every((line) => line.status !== "PENDING")
  ) {
    finishBooting();
  }
}

function onLineTyped(index) {
  if (disposed || forcing || phase.value !== "booting") return;
  if (index !== currentLineIndex.value || lineStates[index].tagRevealed) return;
  lineStates[index].tagRevealed = true;

  if (index === lineStates.length - 1) {
    typingFinished.value = true;
    maybeReady();
    return;
  }

  // Presentation pacing only. This delay does not fabricate a check result.
  advanceTimer = window.setTimeout(() => {
    if (disposed || phase.value !== "booting") return;
    currentLineIndex.value = index + 1;
    nextTick(() => {
      if (!disposed && phase.value === "booting") {
        typewriterRefs.get(index + 1)?.start?.();
      }
    });
  }, 110);
}

function completeTyping() {
  forcing = true;
  clearTimeout(startTimer);
  clearTimeout(advanceTimer);
  currentLineIndex.value = lineStates.length - 1;
  lineStates.forEach((line, index) => {
    typewriterRefs.get(index)?.finish?.();
    line.tagRevealed = true;
  });
  typingFinished.value = true;
  forcing = false;
}

function forceComplete(reason = "TIMEOUT") {
  if (disposed || phase.value !== "booting") return;
  token++; // Ignore promises that resolve after the deadline or user skip.
  stopDiagnostics();
  for (const line of lineStates) {
    if (line.status === "PENDING") {
      line.status = reason;
      line.result =
        reason === "SKIPPED"
          ? "Skipped to enter the site."
          : "No result before the boot deadline.";
      line.detail = "";
    }
  }
  completeTyping();
  finishBooting();
}

function readRuntime() {
  const threads = navigator.hardwareConcurrency;
  const cores =
    Number.isFinite(threads) && threads > 0
      ? `${threads} logical processors exposed`
      : "Processor count not exposed";
  return {
    status: "INFO",
    result: `${window.innerWidth} × ${window.innerHeight} CSS px · ${window.devicePixelRatio || 1}× pixel ratio`,
    detail: `${cores} · ${navigator.maxTouchPoints > 0 ? "Touch-capable" : "No touch points reported"}`,
  };
}

function inspectGraphics() {
  const canvas = document.createElement("canvas");
  let gl = null;
  try {
    const options = {
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    };
    gl = canvas.getContext("webgl2", options);
    const version = gl ? "WebGL 2" : "WebGL 1";
    if (!gl) gl = canvas.getContext("webgl", options);
    if (!gl || gl.isContextLost()) {
      return { status: "UNAVAILABLE", result: "No WebGL context available." };
    }

    const textureLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    let renderer = null;
    let rendererLabel = "WebGL renderer";
    try {
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      if (debug) {
        renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
        rendererLabel = "Exposed renderer";
      }
      if (!renderer) renderer = gl.getParameter(gl.RENDERER);
    } catch {
      // Capability results are still useful when renderer details are blocked.
    }

    return {
      result: `${version} · max texture edge ${Number(textureLimit).toLocaleString()} px`,
      detail: renderer
        ? `${rendererLabel}: ${String(renderer).slice(0, 220)}`
        : "Renderer identity restricted or unavailable.",
    };
  } finally {
    // This is a temporary diagnostic context, not the portrait's renderer.
    try {
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {}
  }
}

async function estimateStorage() {
  if (!navigator.storage?.estimate) {
    return {
      status: "UNAVAILABLE",
      result: "Storage estimates are not exposed.",
    };
  }
  const estimate = await navigator.storage.estimate();
  if (!Number.isFinite(estimate.usage) || !Number.isFinite(estimate.quota)) {
    return {
      status: "UNAVAILABLE",
      result: "No usable storage estimate returned.",
    };
  }
  return {
    status: "INFO",
    result: `≈ ${formatBytes(estimate.usage)} used / ${formatBytes(estimate.quota)} quota`,
    detail:
      "Browser estimate for this origin—not your device's free disk space.",
  };
}

async function makeSessionSignature() {
  if (!window.crypto?.getRandomValues) {
    return {
      status: "UNAVAILABLE",
      result: "Secure random generation is unavailable.",
    };
  }
  const nonce = window.crypto.getRandomValues(new Uint8Array(16));
  let bytes = nonce;
  let usedHash = false;
  if (window.isSecureContext && window.crypto.subtle?.digest) {
    bytes = new Uint8Array(await window.crypto.subtle.digest("SHA-256", nonce));
    usedHash = true;
  }
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const short = `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
  // Only the result returned by runProbe updates reactive state: late results
  // must not modify the interface after a timeout/unmount.
  return {
    status: "INFO",
    result: short,
    detail: usedHash
      ? "SHA-256 of a fresh random nonce · local reference, not a device ID."
      : "Fresh random reference · SHA-256 unavailable in this context.",
  };
}

async function inspectFonts() {
  if (!document.fonts?.ready) {
    return {
      status: "UNAVAILABLE",
      result: "Font loading API is not available.",
    };
  }
  await document.fonts.ready;
  const faces = Array.from(document.fonts);
  const failed = faces.filter((face) => face.status === "error").length;
  const loaded = faces.filter((face) => face.status === "loaded").length;
  return failed
    ? {
        status: "WARN",
        result: `${loaded} font faces loaded · ${failed} reported errors`,
      }
    : { result: `Font loading settled · ${loaded} loaded font faces` };
}

function startFrameSample() {
  if (document.hidden) {
    settle(
      "frames",
      "SKIPPED",
      "Tab is hidden; a foreground sample is required.",
    );
    return;
  }
  if (typeof window.requestAnimationFrame !== "function") {
    settle("frames", "UNAVAILABLE", "Animation frame sampling is unavailable.");
    return;
  }
  let first = null;
  let previous = null;
  let count = 0;
  let sum = 0;
  let slowest = 0;
  let lastPublished = 0;
  const samples = [];
  const sampleDuration = Math.max(
    250,
    Number(props.frameSampleDuration) || 1500,
  );

  function publish() {
    if (!count) return;
    frame.count = count;
    frame.average = sum / count;
    frame.slowest = slowest;
    frame.rate = 1000 / frame.average;
    frame.samples = samples.slice(-48);
  }

  function tick(time) {
    if (
      disposed ||
      phase.value !== "booting" ||
      getLine("frames").status !== "PENDING"
    )
      return;
    if (document.hidden) {
      onVisibilityChange();
      return;
    }
    if (first === null) first = time;
    if (previous !== null) {
      const interval = time - previous;
      if (interval > 0 && Number.isFinite(interval)) {
        count++;
        sum += interval;
        slowest = Math.max(slowest, interval);
        samples.push(interval);
        if (samples.length > 48) samples.shift();
      }
    }
    previous = time;
    if (time - lastPublished >= 120) {
      publish();
      lastPublished = time;
    }
    if (time - first >= sampleDuration && count) {
      publish();
      settle(
        "frames",
        "OK",
        `${frame.average.toFixed(1)} ms average · ${frame.rate.toFixed(1)} sampled frames/s`,
        `${count} intervals · slowest ${slowest.toFixed(1)} ms. Page timing, not a GPU benchmark.`,
      );
      frameRaf = 0;
      return;
    }
    frameRaf = requestAnimationFrame(tick);
  }
  frameRaf = requestAnimationFrame(tick);
}

function onVisibilityChange() {
  if (document.hidden && getLine("frames").status === "PENDING") {
    cancelAnimationFrame(frameRaf);
    frameRaf = 0;
    settle(
      "frames",
      "SKIPPED",
      "Tab became hidden; frame sample was interrupted.",
      frame.count ? "The trace shows only the partial sample collected." : "",
    );
  }
}

function resourceName(raw) {
  try {
    const url = new URL(raw, window.location.href);
    if (!["http:", "https:"].includes(url.protocol))
      return `${url.protocol.replace(":", "")} resource`;
    const name = url.pathname.split("/").filter(Boolean).pop() || "/";
    // Never display query strings or fragments (they can contain tokens).
    try {
      return decodeURIComponent(name).slice(0, 100);
    } catch {
      return name.slice(0, 100);
    }
  } catch {
    return "unnamed resource";
  }
}

function addResources(entries) {
  if (disposed || phase.value !== "booting") return;
  for (const entry of entries) {
    if (entry.entryType !== "resource") continue;
    const key = `${entry.name}|${entry.startTime}|${entry.duration}`;
    if (seenResources.has(key)) continue;
    seenResources.add(key);
    resourceCount.value++;
    const transferred =
      Number.isFinite(entry.transferSize) && entry.transferSize > 0
        ? entry.transferSize
        : null;
    if (transferred !== null) reportedTransferBytes.value += transferred;
    const row = {
      id: resourceCount.value,
      name: resourceName(entry.name),
      type: entry.initiatorType || "resource",
      duration: Number.isFinite(entry.duration)
        ? `${entry.duration.toFixed(0)} ms`
        : "—",
      bytes: transferred === null ? "—" : formatBytes(transferred),
      startTime: entry.startTime,
    };
    resourceRows.value = [...resourceRows.value, row]
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, resourceRowLimit.value);
  }
  const line = getLine("resources");
  if (line.status === "INFO") {
    line.result = `${resourceCount.value} resource timing entries observed`;
  }
}

function observeResources() {
  if (typeof performance.getEntriesByType !== "function") {
    settle("resources", "UNAVAILABLE", "Resource Timing API is not available.");
    return;
  }
  let observing = false;
  if (typeof window.PerformanceObserver === "function") {
    try {
      resourceObserver = new PerformanceObserver((list) =>
        addResources(list.getEntries()),
      );
      try {
        resourceObserver.observe({ type: "resource", buffered: true });
      } catch {
        resourceObserver.observe({ entryTypes: ["resource"] });
      }
      observing = true;
    } catch {
      resourceObserver?.disconnect();
      resourceObserver = null;
    }
  }
  resourcesLive.value = observing;
  addResources(performance.getEntriesByType("resource"));
  settle(
    "resources",
    "INFO",
    `${resourceCount.value} resource timing entries observed`,
    observing
      ? "Includes available buffered entries; watching new entries until diagnostics finish."
      : "Snapshot only; live resource observation is unavailable.",
  );
}

function triggerBurst() {
  if (disposed || phase.value !== "ready") return;
  phase.value = "bursting";
  removeActivationListeners();

  // Keep this call synchronous within the real click/keydown handler.
  // useMainMusic.play must call the audio element's play() before awaiting work.
  if (props.autoplayMusic) {
    try {
      Promise.resolve(playMainMusic(props.musicSrc)).catch((error) => {
        console.warn("Background music could not start:", error);
      });
    } catch (error) {
      console.warn("Background music could not start:", error);
    }
  }

  burstTimer = window.setTimeout(
    () => {
      if (disposed) return;
      done.value = true;
      phase.value = "done";
      introReady.value = true;
      restoreScroll();
    },
    reduceMotion.value ? 0 : 420,
  );
}

function skipAndEnter() {
  forceComplete("SKIPPED");
  triggerBurst();
}

function handleActivate(event) {
  // Keep keyboard focus inside the modal while it is visible.
  if (event.type === "keydown" && event.key === "Tab") {
    const targets = Array.from(
      loaderEl.value?.querySelectorAll(
        "button:not([disabled]), [tabindex='0']",
      ) ?? [],
    );
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (!first) return;
    const current = document.activeElement;
    const outside = !loaderEl.value?.contains(current);
    if (
      outside ||
      (event.shiftKey && current === first) ||
      (!event.shiftKey && current === last)
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
    }
    return;
  }
  if (phase.value !== "ready" || event.defaultPrevented) return;
  if (event.type === "keydown") {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    // Preserve keyboard navigation, scrolling and assistive interactions.
    if (
      [
        "Tab",
        "Escape",
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ].includes(event.key)
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest("input, textarea, select, [contenteditable='true']")
    )
      return;
    event.preventDefault();
    event.stopPropagation();
  } else {
    if (window.getSelection()?.isCollapsed === false) return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        "a, button, input, textarea, select, [data-terminal-output]",
      )
    )
      return;
  }
  triggerBurst();
}

function removeActivationListeners() {
  window.removeEventListener("keydown", handleActivate, true);
  window.removeEventListener("click", handleActivate);
}

onMounted(() => {
  isTouch.value = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  reduceMotion.value = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  bootStartedAt = performance.now();
  previousFocus = document.activeElement;
  nextTick(() => {
    if (!disposed) terminalOutput.value?.focus({ preventScroll: true });
  });

  const html = document.documentElement;
  const body = document.body;
  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  let restored = false;
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  restoreScroll = () => {
    if (restored) return;
    restored = true;
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;
    if (
      previousFocus instanceof HTMLElement &&
      previousFocus !== body &&
      previousFocus.isConnected
    ) {
      previousFocus.focus({ preventScroll: true });
    }
  };

  window.addEventListener("keydown", handleActivate, true);
  // A completed click/tap is more reliable for touch audio activation than pointerdown.
  window.addEventListener("click", handleActivate);
  document.addEventListener("visibilitychange", onVisibilityChange);

  maxTimer = window.setTimeout(
    () => forceComplete("TIMEOUT"),
    Math.max(1, Number(props.maxBootDuration) || 6000),
  );

  runProbe("runtime", readRuntime);
  runProbe("graphics", inspectGraphics);
  runProbe("storage", estimateStorage);
  runProbe("session", makeSessionSignature);
  runProbe("fonts", inspectFonts);
  startFrameSample();
  observeResources();

  if (reduceMotion.value) {
    completeTyping();
    maybeReady();
  } else {
    startTimer = window.setTimeout(() => {
      if (!disposed && phase.value === "booting")
        typewriterRefs.get(0)?.start?.();
    }, 200);
  }
});

onBeforeUnmount(() => {
  disposed = true;
  token++;
  clearTimeout(maxTimer);
  clearTimeout(startTimer);
  clearTimeout(advanceTimer);
  clearTimeout(burstTimer);
  stopDiagnostics();
  removeActivationListeners();
  restoreScroll();
});
</script>

<template>
  <Transition name="loader-fade">
    <div
      v-if="!done"
      ref="loaderEl"
      class="loader"
      :class="{ 'is-entering': phase === 'bursting' }"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-title"
    >
      <div class="terminal">
        <header class="terminal__bar">
          <div class="terminal__lights" aria-hidden="true">
            <span /><span /><span />
          </div>
          <h1 id="terminal-title">arsam@browser: ~/portfolio</h1>
          <span class="terminal__mode">LOCAL</span>
        </header>

        <div
          ref="terminalOutput"
          class="terminal__output"
          tabindex="0"
          data-terminal-output
          aria-label="Scrollable command-line diagnostics"
          @scroll="onOutputScroll"
        >
          <div class="terminal__intro">
            <p class="terminal__wordmark">
              ARSAM<span>_</span>SARKHOSH<span>_</span>OS
            </p>
            <p>
              Browser diagnostics
              <span class="cli-dim">/ session bootstrap</span>
            </p>
            <p class="cli-dim">
              Browser APIs only. No external lookup. No diagnostic upload.
            </p>
          </div>

          <p class="cli-launch" aria-label="Starting local diagnostics">
            <span class="cli-host">visitor@arsam</span
            ><span class="cli-dim">:~</span><span class="cli-dollar">$</span>
            <span>diagnostics --local</span>
          </p>

          <div class="cli-log" aria-label="Diagnostic command output">
            <section
              v-for="(line, i) in lineStates"
              v-show="i <= currentLineIndex"
              :key="line.id"
              class="cli-entry"
              :data-probe="line.id"
            >
              <div class="cli-command">
                <span class="cli-dollar" aria-hidden="true">$</span>
                <AnimationTypewriterText
                  :ref="(el) => setTypewriterRef(el, i)"
                  :text="line.label"
                  :speed="typeSpeed"
                  prefix=""
                  :sound="false"
                  :cursor="
                    i === currentLineIndex && !line.tagRevealed && !reduceMotion
                  "
                  @done="onLineTyped(i)"
                />
              </div>

              <div v-if="line.tagRevealed" class="cli-response">
                <p class="cli-result">
                  <span
                    class="cli-tag"
                    :class="`cli-tag--${line.status.toLowerCase()}`"
                    >[{{ line.status }}]</span
                  >
                  <span>{{ line.result }}</span>
                </p>
                <p v-if="line.detail" class="cli-detail">{{ line.detail }}</p>

                <div
                  v-if="line.id === 'frames' && frame.count"
                  class="cli-trace"
                >
                  <p>
                    <span class="cli-dim">trace</span>
                    <span class="cli-sparkline" aria-hidden="true">{{
                      frameSparkline
                    }}</span>
                  </p>
                  <p class="cli-detail">
                    {{ frame.count }} intervals · trace scale 0–{{
                      frameCeiling.toFixed(1)
                    }}
                    ms ·
                    {{
                      line.status === "OK"
                        ? "sample complete"
                        : "partial sample"
                    }}
                  </p>
                </div>

                <div v-if="line.id === 'resources'" class="cli-resource-log">
                  <p class="cli-detail">
                    {{ resourcesLive ? "observing" : "snapshot" }} / latest
                    {{ resourceRowLimit }} entries /
                    {{
                      reportedTransferBytes
                        ? formatBytes(reportedTransferBytes)
                        : "—"
                    }}
                    reported transfer
                  </p>
                  <ul v-if="resourceTail.length" class="cli-resources">
                    <li v-for="resource in resourceTail" :key="resource.id">
                      <span class="cli-resource-name"
                        ><span class="cli-dim" aria-hidden="true">↳ </span
                        >{{ resource.name }}</span
                      >
                      <span class="cli-resource-meta"
                        >{{ resource.type }} · {{ resource.duration }} ·
                        {{ resource.bytes }}</span
                      >
                    </li>
                  </ul>
                  <p v-else class="cli-detail">
                    {{
                      phase === "booting"
                        ? "Waiting for resource entries…"
                        : "No resource entries were exposed."
                    }}
                  </p>
                  <p class="cli-footnote">
                    “—” = zero or unexposed transfer size; not necessarily
                    cached.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div v-if="phase !== 'booting'" class="cli-complete">
            <p>
              <span class="cli-tag cli-tag--info">[DONE]</span>
              {{ settledCount }}/{{ lineStates.length }} checks settled in
              {{ (bootElapsed / 1000).toFixed(2) }}s.
            </p>
            <p class="cli-dim">
              {{
                phase === "bursting"
                  ? "Opening portfolio interface…"
                  : "Diagnostics ended. You may enter the portfolio."
              }}
            </p>
          </div>
        </div>

        <footer class="terminal__footer">
          <div class="terminal__status-row">
            <span role="status" aria-live="polite"
              >{{
                phase === "booting"
                  ? "RUNNING"
                  : phase === "bursting"
                    ? "ENTERING"
                    : "READY TO ENTER"
              }}
              <span class="cli-dim"
                >· {{ settledCount }}/{{ lineStates.length }} settled</span
              ></span
            >
            <button
              v-if="!followOutput"
              type="button"
              class="cli-follow"
              @click.stop="jumpToLatest"
            >
              ↓ latest output
            </button>
          </div>
          <div class="terminal__prompt-row">
            <p class="terminal__prompt">
              <span class="cli-host">visitor@arsam</span
              ><span class="cli-dim">:~</span><span class="cli-dollar">$</span>
              <span>{{
                phase === "booting"
                  ? "diagnostics --running"
                  : phase === "bursting"
                    ? "entering…"
                    : "enter"
              }}</span
              ><span class="cli-cursor" aria-hidden="true">█</span>
            </p>
            <button
              v-if="phase === 'booting'"
              type="button"
              class="cli-action cli-action--skip"
              @click.stop="skipAndEnter"
            >
              [ skip & enter ]
            </button>
            <button
              v-else
              type="button"
              class="cli-action"
              :disabled="phase === 'bursting'"
              @click.stop="triggerBurst"
            >
              {{ isTouch ? "[ tap to enter ]" : "[ press enter ↵ ]" }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@import "~/assets/css/components/LoadingScreen.css";
</style>
