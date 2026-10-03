<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { VERT, FRAG } from "~/graphics/sectionBackgroundShaders";

const props = defineProps({
  index: { type: Number, default: 0 },
  scenes: {
    type: Array,
    default: () => ["signal", "terminal", "rain", "circuit", "radar"],
  },
  accent: { type: String, default: "#3b82f6" },
  intensity: { type: Number, default: 1 }, // overall brightness 0..1.5
  transitionDuration: { type: Number, default: 900 },
  maxFps: { type: Number, default: 60 },
  mobileMaxFps: { type: Number, default: 30 },
  renderScale: { type: Number, default: 1 }, // fraction of device pixels (desktop)
  mobileRenderScale: { type: Number, default: 0.5 },
});

// hero, about, projects, resume, cta
const SCENE_IDS = { signal: 0, terminal: 1, rain: 2, circuit: 3, radar: 4 };

const canvasEl = ref(null);

let gl = null;
let program = null;
let buffer = null;
let uniforms = {};
let raf = 0;
let ro = null;
let disposed = false;
let isMobile = false;
let reduceMotion = false;
let lastFrame = 0;
let startTime = 0;
let pixelScale = 1;
let restoreAttempts = 0;

// transition state
let fromScene = 0;
let toScene = 0;
let mixValue = 1;
let glitchValue = 0;
let transStart = -1;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function sceneFor(i) {
  const list = props.scenes.length ? props.scenes : ["signal"];
  const name = list[((i % list.length) + list.length) % list.length];
  return SCENE_IDS[name] ?? 0;
}

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("SectionBackground shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function initGL() {
  gl = canvasEl.value.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl) return false;

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    gl = null;
    return false;
  }

  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("SectionBackground link:", gl.getProgramInfoLog(program));
    gl = null;
    return false;
  }
  gl.useProgram(program);

  // one big triangle covering the screen
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  for (const name of [
    "uRes",
    "uTime",
    "uScale",
    "uFrom",
    "uTo",
    "uMix",
    "uGlitch",
    "uAccent",
    "uIntensity",
  ]) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  gl.uniform3fv(uniforms.uAccent, hexToRgb(props.accent));
  gl.uniform1f(uniforms.uIntensity, props.intensity);
  return true;
}

function resize() {
  if (!gl || !canvasEl.value) return;
  const rect = canvasEl.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const scale = isMobile ? props.mobileRenderScale : props.renderScale;
  pixelScale = Math.max(0.5, Math.min(dpr * scale, 1.25));
  const w = Math.max(1, Math.round(rect.width * pixelScale));
  const h = Math.max(1, Math.round(rect.height * pixelScale));
  if (canvasEl.value.width === w && canvasEl.value.height === h) return;
  canvasEl.value.width = w;
  canvasEl.value.height = h;
  gl.viewport(0, 0, w, h);
  if (reduceMotion) draw(performance.now());
}

function draw(now) {
  if (!gl || !canvasEl.value) return;
  const t = reduceMotion ? 12.0 : (now - startTime) / 1000;

  if (transStart >= 0) {
    const p = Math.min(1, (now - transStart) / props.transitionDuration);
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    mixValue = eased;
    glitchValue = Math.pow(Math.sin(Math.PI * p), 0.8);
    if (p >= 1) {
      transStart = -1;
      fromScene = toScene;
      mixValue = 1;
      glitchValue = 0;
    }
  }

  gl.uniform2f(uniforms.uRes, canvasEl.value.width, canvasEl.value.height);
  gl.uniform1f(uniforms.uTime, t % 3600);
  gl.uniform1f(uniforms.uScale, pixelScale);
  gl.uniform1f(uniforms.uFrom, fromScene);
  gl.uniform1f(uniforms.uTo, toScene);
  gl.uniform1f(uniforms.uMix, mixValue);
  gl.uniform1f(uniforms.uGlitch, glitchValue);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function loop(now) {
  raf = 0;
  if (disposed || document.hidden || !gl) return;
  raf = requestAnimationFrame(loop);
  const fps = isMobile ? props.mobileMaxFps : props.maxFps;
  if (now - lastFrame < 1000 / fps - 1) return;
  lastFrame = now;
  draw(now);
}

function start() {
  if (raf || disposed || reduceMotion || !gl) return;
  raf = requestAnimationFrame(loop);
}

function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
}

function onVisibility() {
  if (document.hidden) stop();
  else start();
}

function onContextLost(e) {
  e.preventDefault();
  stop();
  gl = null;
}

function onContextRestored() {
  // if the GPU keeps dying, give up and keep the black CSS fallback
  if (++restoreAttempts > 2) return;
  if (initGL()) {
    canvasEl.value.width = 0; // force resize
    resize();
    start();
  }
}

watch(
  () => props.index,
  (i) => {
    const next = sceneFor(i);
    if (next === toScene && transStart < 0) return;
    fromScene = mixValue > 0.5 ? toScene : fromScene;
    toScene = next;
    mixValue = 0;
    if (reduceMotion) {
      fromScene = next;
      mixValue = 1;
      draw(performance.now());
      return;
    }
    transStart = performance.now();
  },
);

watch(
  () => [props.accent, props.intensity],
  () => {
    if (!gl) return;
    gl.uniform3fv(uniforms.uAccent, hexToRgb(props.accent));
    gl.uniform1f(uniforms.uIntensity, props.intensity);
    if (reduceMotion) draw(performance.now());
  },
);

onMounted(() => {
  isMobile =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!initGL()) return; // no WebGL -> CSS fallback stays visible

  fromScene = toScene = sceneFor(props.index);
  startTime = performance.now();

  canvasEl.value.addEventListener("webglcontextlost", onContextLost, false);
  canvasEl.value.addEventListener(
    "webglcontextrestored",
    onContextRestored,
    false,
  );

  ro = new ResizeObserver(resize);
  ro.observe(canvasEl.value);
  resize();

  document.addEventListener("visibilitychange", onVisibility);
  if (reduceMotion) draw(performance.now());
  else start();
});

onBeforeUnmount(() => {
  disposed = true;
  stop();
  ro?.disconnect();
  document.removeEventListener("visibilitychange", onVisibility);
  canvasEl.value?.removeEventListener("webglcontextlost", onContextLost);
  canvasEl.value?.removeEventListener(
    "webglcontextrestored",
    onContextRestored,
  );
  if (gl) {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    // free the context right away (iOS has a hard limit)
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  gl = null;
});
</script>

<template>
  <div class="section-bg" aria-hidden="true">
    <canvas ref="canvasEl" class="section-bg__canvas" />
  </div>
</template>

<style scoped>
.section-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #000; /* fallback if WebGL is unavailable */
}

.section-bg__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
