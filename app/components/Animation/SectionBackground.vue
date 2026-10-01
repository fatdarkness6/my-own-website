<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  index: { type: Number, default: 0 },
  scenes: { type: Array, default: () => ["signal", "grid", "rain"] },
  accent: { type: String, default: "#3b82f6" },
  intensity: { type: Number, default: 1 }, // overall brightness 0..1.5
  transitionDuration: { type: Number, default: 900 },
  maxFps: { type: Number, default: 60 },
  mobileMaxFps: { type: Number, default: 30 },
  renderScale: { type: Number, default: 1 }, // fraction of device pixels (desktop)
  mobileRenderScale: { type: Number, default: 0.5 },
});

const SCENE_IDS = { signal: 0, grid: 1, rain: 2, hex: 3 };

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

// transition state
let fromScene = 0;
let toScene = 0;
let mixValue = 1;
let glitchValue = 0;
let transStart = -1;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform float uScale;     // css px -> buffer px
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uGlitch;
uniform vec3  uAccent;
uniform float uIntensity;

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

// 5x7 pseudo glyph inside a cell. cuv in [0,1]^2
float glyph(vec2 cuv, vec2 cellId, float seed) {
  vec2 g = cuv * vec2(7.0, 9.0) - vec2(1.0);          // 1px margin
  if (g.x < 0.0 || g.y < 0.0 || g.x >= 5.0 || g.y >= 7.0) return 0.0;
  vec2 px = floor(g);
  // mirror left/right a bit so it reads like a character, not noise
  vec2 mpx = vec2(px.x > 2.0 ? 4.0 - px.x : px.x, px.y);
  float on = step(0.52, hash21(mpx + cellId * 7.13 + seed * 13.7));
  vec2 f = fract(g);
  float sq = step(0.12, f.x) * step(f.x, 0.88) * step(0.1, f.y) * step(f.y, 0.9);
  return on * sq;
}

/* ---------------- SCENE 0 : SIGNAL (hero) ---------------- */
vec3 sceneSignal(vec2 fc) {
  vec2 p = fc / uScale;                 // css pixels
  float cell = 22.0;
  vec2 c = p / cell;
  vec2 id = floor(c);
  vec2 f = fract(c) - 0.5;
  float d = length(f) * cell;
  float n = vnoise(id * 0.18 + vec2(uTime * 0.12, -uTime * 0.08));
  float tw = step(0.985, hash21(id + floor(uTime * 2.0)));   // random twinkles
  float dotA = (1.0 - smoothstep(0.6, 1.4, d)) * (0.15 + 0.85 * n * n) + tw * (1.0 - smoothstep(0.5, 2.2, d));

  // slow interference band rolling down
  float y = fc.y / uRes.y;
  float band = exp(-pow((fract(1.0 - y - uTime * 0.05) - 0.5) * 18.0, 2.0));
  float bandLines = band * (0.5 + 0.5 * sin(fc.y / uScale * 1.6 + uTime * 20.0));

  vec3 col = uAccent * dotA * 0.55;
  col += uAccent * bandLines * 0.12;
  col += vec3(0.85, 0.92, 1.0) * tw * (1.0 - smoothstep(0.5, 2.2, d)) * 0.4;
  return col;
}

/* ---------------- SCENE 1 : GRID TUNNEL (about) ---------------- */
float gridLine(float v, float w) {
  float dist = 0.5 - abs(fract(v) - 0.5);
  return 1.0 - smoothstep(0.0, w, dist);
}
vec3 sceneGrid(vec2 fc) {
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;          // centered, aspect-correct
  float horizon = 0.04;
  float ay = abs(uv.y - horizon);
  float isFloor = step(uv.y, horizon);
  float z = 0.35 / max(ay, 0.0015);              // depth
  float x = uv.x * z;
  float zz = z + uTime * 1.6;

  // analytic line width (~1.2 screen px) so it stays crisp without derivatives
  float pxw = 1.2 * uScale / uRes.y;
  float wX = 6.0 * z * pxw;
  float wZ = 2.0 * 0.35 / (ay * ay) * pxw;
  float lx = gridLine(x * 6.0, min(wX, 0.5)) * (1.0 - smoothstep(0.2, 0.5, wX));
  float lz = gridLine(zz * 2.0, min(wZ, 0.5)) * (1.0 - smoothstep(0.2, 0.5, wZ));
  float lines = max(lx, lz);
  float fade = exp(-z * 0.09) * smoothstep(0.0, 0.06, ay);
  float strength = mix(0.35, 1.0, isFloor);      // ceiling dimmer
  vec3 col = uAccent * lines * fade * strength * 0.9;

  // horizon glow line
  col += uAccent * exp(-ay * 60.0) * 0.55;
  col += vec3(0.8, 0.9, 1.0) * exp(-ay * 220.0) * 0.25;

  // radar / scan beam sweeping across
  float sx = fract(uTime * 0.08) * 1.6 - 0.8;
  float beam = exp(-pow((uv.x * (uRes.y / uRes.x) * 1.0 - sx) * 14.0, 2.0));
  col += uAccent * beam * fade * 0.6 + uAccent * beam * 0.04;

  // data packets travelling along the floor
  float laneId = floor(x * 6.0 + 0.5);
  float lane = step(0.8, hash11(laneId + 4.0));
  float packet = lane * lx * exp(-pow(fract(zz * 0.12 + hash11(laneId)) - 0.5, 2.0) * 300.0);
  col += vec3(0.85, 0.95, 1.0) * packet * fade * isFloor * 1.2;
  return col;
}

/* ---------------- SCENE 2 : DATA RAIN (projects) ---------------- */
vec3 sceneRain(vec2 fc) {
  float cell = 16.0 * uScale;
  vec2 p = vec2(fc.x, uRes.y - fc.y) / cell;   // y from top
  vec2 id = floor(p);
  vec2 cuv = fract(p);
  cuv.y = 1.0 - cuv.y;

  float colSeed = hash11(id.x * 1.37);
  float colOn = step(0.35, colSeed);                     // not every column
  float speed = 5.0 + colSeed * 11.0;
  float rows = uRes.y / cell;
  float trail = 8.0 + hash11(id.x + 3.1) * 18.0;
  float cycle = rows + trail + 10.0 + hash11(id.x + 9.0) * 30.0;
  float head = mod(uTime * speed + hash11(id.x + 5.0) * cycle, cycle);
  float dist = head - id.y;                               // 0 at head, grows up the trail
  float inTrail = step(0.0, dist) * step(dist, trail);
  float b = inTrail * pow(1.0 - dist / trail, 1.6);

  float swapRate = 6.0 + hash11(id.x + 2.0) * 10.0;
  float seed = floor(uTime * swapRate * (0.3 + hash21(id) * 0.7));
  float g = glyph(cuv, id, seed);

  float isHead = inTrail * (1.0 - step(1.0, dist));
  vec3 col = uAccent * g * b * 0.9 * colOn;
  col += vec3(0.85, 0.95, 1.0) * g * isHead * colOn * 1.1;
  // faint static glyph field behind the rain
  col += uAccent * glyph(cuv, id + 91.0, floor(uTime * 0.5 + hash21(id) * 10.0)) * 0.035;
  return col;
}

/* ---------------- SCENE 3 : HEX DUMP (spare) ---------------- */
vec3 sceneHex(vec2 fc) {
  float cellW = 9.0 * uScale, cellH = 14.0 * uScale;
  float scroll = uTime * 22.0 * uScale;
  vec2 p = vec2(fc.x / cellW, (uRes.y - fc.y + scroll) / cellH);
  vec2 id = floor(p);
  vec2 cuv = fract(p); cuv.y = 1.0 - cuv.y;
  float group = mod(id.x, 3.0);                 // "AB " spacing
  float blockCol = mod(floor(id.x / 3.0), 9.0); // gaps between dump blocks
  float visible = step(group, 1.0) * step(0.5, blockCol) * step(blockCol, 7.5);
  float g = glyph(cuv, id, floor(hash21(id) * 4.0 + uTime * 0.2));
  float hot = step(0.97, hash21(vec2(id.y, floor(uTime * 3.0))));    // highlighted row
  float lum = 0.18 + hot * 0.7;
  return uAccent * g * visible * lum;
}

vec3 scene(float s, vec2 fc) {
  if (s < 0.5) return sceneSignal(fc);
  if (s < 1.5) return sceneGrid(fc);
  if (s < 2.5) return sceneRain(fc);
  return sceneHex(fc);
}

vec3 composite(vec2 fc) {
  if (uMix <= 0.001) return scene(uFrom, fc);
  if (uMix >= 0.999) return scene(uTo, fc);
  // glitchy dissolve: blocks flip between scenes instead of a soft fade
  vec2 blk = floor(fc / (uScale * vec2(48.0, 12.0)));
  float k = step(hash21(blk + floor(uTime * 24.0)), uMix * 1.15 - 0.075);
  float m = mix(uMix, k, 0.75);
  return mix(scene(uFrom, fc), scene(uTo, fc), m);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / uRes;

  // ---- transition glitch: slice tearing ----
  float g = uGlitch;
  if (g > 0.001) {
    float bandId = floor(uv.y * 26.0);
    float r = hash11(bandId + floor(uTime * 30.0) * 7.0);
    float tear = step(1.0 - g * 0.55, r) * (r - 0.5) * 0.25 * g;
    fc.x += tear * uRes.x;
  }

  vec3 col;
  if (g > 0.02) {
    float off = (6.0 + 22.0 * g) * uScale;
    vec3 c0 = composite(fc);
    float rr = composite(fc + vec2(off, 0.0)).r;
    float bb = composite(fc - vec2(off, 0.0)).b;
    col = vec3(rr, c0.g, bb) + vec3(0.0, 0.0, c0.b * 0.3);
    // block noise
    vec2 blk = floor(uv * vec2(18.0, 40.0));
    float bn = step(1.0 - g * 0.12, hash21(blk + floor(uTime * 20.0)));
    col += uAccent * bn * 0.35 + vec3(bn * 0.1);
  } else {
    col = composite(fc);
  }

  // ---- CRT finish ----
  float scan = 0.82 + 0.18 * sin(fc.y / uScale * 3.14159 * 0.5);
  col *= scan;
  float grain = (hash21(fc + fract(uTime) * 100.0) - 0.5) * 0.05;
  col += grain * uAccent;
  vec2 v = uv - 0.5;
  float vig = 1.0 - smoothstep(0.2, 0.85, length(v * vec2(1.0, 1.2)));
  col *= vig;
  // subtle refresh flicker
  col *= 0.97 + 0.03 * sin(uTime * 60.0);

  col *= uIntensity;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

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
  if (!vs || !fs) return false;

  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("SectionBackground link:", gl.getProgramInfoLog(program));
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
  pixelScale = Math.max(0.5, Math.min(dpr * scale, 1.5));
  const w = Math.max(1, Math.round(rect.width * pixelScale));
  const h = Math.max(1, Math.round(rect.height * pixelScale));
  if (canvasEl.value.width === w && canvasEl.value.height === h) return;
  canvasEl.value.width = w;
  canvasEl.value.height = h;
  gl.viewport(0, 0, w, h);
  if (reduceMotion) draw(performance.now());
}

function draw(now) {
  if (!gl) return;
  const t = reduceMotion ? 12.0 : (now - startTime) / 1000;

  // transition progress
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
  if (disposed || document.hidden) return;
  raf = requestAnimationFrame(loop);
  const fps = isMobile ? props.mobileMaxFps : props.maxFps;
  if (now - lastFrame < 1000 / fps - 1) return;
  lastFrame = now;
  draw(now);
}

function start() {
  if (raf || disposed || reduceMotion) return;
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
    // if a transition is mid-way, jump from whatever is mostly visible
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

  if (!initGL()) return; // no WebGL -> CSS fallback background stays visible

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
