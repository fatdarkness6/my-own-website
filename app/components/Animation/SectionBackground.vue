<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

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
uniform float uScale;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uGlitch;
uniform vec3  uAccent;
uniform float uIntensity;

#define TAU 6.28318530718

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
  vec2 g = cuv * vec2(7.0, 9.0) - vec2(1.0);
  if (g.x < 0.0 || g.y < 0.0 || g.x >= 5.0 || g.y >= 7.0) return 0.0;
  vec2 px = floor(g);
  vec2 mpx = vec2(px.x > 2.0 ? 4.0 - px.x : px.x, px.y);
  float on = step(0.52, hash21(mpx + cellId * 7.13 + seed * 13.7));
  vec2 f = fract(g);
  float sq = step(0.12, f.x) * step(f.x, 0.88) * step(0.1, f.y) * step(f.y, 0.9);
  return on * sq;
}

float ring(float d, float w) { return 1.0 - smoothstep(w, w + 1.0, abs(d)); }

/* ---------- SCENE 0 : SIGNAL (hero) ---------- */
vec3 sceneSignal(vec2 fc) {
  vec2 p = fc / uScale;
  float cell = 22.0;
  vec2 c = p / cell;
  vec2 id = floor(c);
  vec2 f = fract(c) - 0.5;
  float d = length(f) * cell;
  float n = vnoise(id * 0.18 + vec2(uTime * 0.12, -uTime * 0.08));
  float tw = step(0.985, hash21(id + floor(uTime * 2.0)));
  float dotA = (1.0 - smoothstep(0.6, 1.4, d)) * (0.15 + 0.85 * n * n) + tw * (1.0 - smoothstep(0.5, 2.2, d));
  float y = fc.y / uRes.y;
  float band = exp(-pow((fract(1.0 - y - uTime * 0.05) - 0.5) * 18.0, 2.0));
  float bandLines = band * (0.5 + 0.5 * sin(fc.y / uScale * 1.6 + uTime * 20.0));
  vec3 col = uAccent * dotA * 0.55;
  col += uAccent * bandLines * 0.12;
  col += vec3(0.85, 0.92, 1.0) * tw * (1.0 - smoothstep(0.5, 2.2, d)) * 0.4;
  return col;
}

/* ---------- SCENE 1 : TERMINAL SESSIONS (about) ---------- */
vec3 terminalPane(float px, float py, float pane) {
  float cw = 9.0, lh = 18.0;
  float ps = hash11(pane * 3.7 + 1.0);
  float lineTime = 0.55 + ps * 0.5;
  float tl = (uTime + ps * 40.0) / lineTime;
  float cur = floor(tl);
  float lp = fract(tl);

  float rowsVis = floor(uRes.y / uScale / lh);
  float bottomRow = max(rowsVis - 4.0, 1.0);
  float scrollPx = smoothstep(0.8, 1.0, lp) * lh;
  float yy = py + scrollPx - lh;
  if (yy < 0.0) return vec3(0.0);
  float row = floor(yy / lh);
  float lineId = cur - (bottomRow - row);
  if (lineId > cur) return vec3(0.0);

  float lid = lineId + pane * 977.0 + 100.0;
  float ly = mod(yy, lh);
  float colIdx = floor(px / cw);
  float fx = fract(px / cw);
  vec2 cuv = vec2(fx, 1.0 - (ly - 2.5) / 13.0);
  float isCur = step(abs(lineId - cur), 0.5);

  vec3 col = uAccent * isCur * 0.035;

  if (colIdx >= 1.0 && colIdx < 5.0) {
    return col + uAccent * glyph(cuv, vec2(colIdx, lid), 3.0) * (0.16 + isCur * 0.25);
  }
  float c = colIdx - 7.0;
  if (c < 0.0) return col;

  float h = hash11(lid * 1.731);
  if (h < 0.1) return col;
  float typeP = clamp(lp / 0.75, 0.0, 1.0);

  if (h > 0.22 && h < 0.3) {
    float fill = lineId < cur ? 1.0 : typeP;
    if (c < 24.0) {
      vec2 q = vec2(fx, (ly - 4.0) / 10.0);
      float box = step(0.1, q.x) * step(q.x, 0.9) * step(0.0, q.y) * step(q.y, 1.0);
      float on = step(c, fill * 24.0 - 0.5);
      col += uAccent * box * mix(0.12, 0.85, on);
    } else if (c > 24.5 && c < 28.0) {
      col += vec3(0.85, 0.95, 1.0) * glyph(cuv, vec2(c, floor(fill * 20.0)), lid) * 0.8;
    }
    return col;
  }

  float isStatus = step(0.3, h) * step(h, 0.36);
  float indent = (1.0 - isStatus) * floor(hash11(lid + 7.7) * 4.0) * 2.0;
  float len = 6.0 + floor(hash11(lid + 3.3) * 40.0);
  float typed = lineId < cur ? len : floor(typeP * len);
  float rel = c - indent;

  float vis = step(0.0, rel) * step(rel, typed - 1.0);
  float space = step(hash21(vec2(c, lid * 1.31)), 0.15);
  float g = glyph(cuv, vec2(c, lid), 0.0) * vis * (1.0 - space);

  vec3 ink;
  if (h < 0.22) ink = uAccent * 0.32;
  else if (isStatus > 0.5 && rel < 6.0) ink = vec3(0.35, 1.0, 0.55) * 0.9;
  else {
    float k = hash21(vec2(floor((c + h * 7.0) / 5.0), lid));
    if (k < 0.22) ink = vec3(0.9, 0.95, 1.0);
    else if (k < 0.36) ink = mix(uAccent, vec3(1.0, 0.72, 0.35), 0.65);
    else if (k < 0.45) ink = mix(uAccent, vec3(0.75, 0.45, 1.0), 0.5);
    else ink = uAccent * 0.8;
  }
  col += ink * g;

  float blink = mix(1.0, step(0.5, fract(uTime * 1.8)), step(len, typed));
  float atCur = isCur * step(abs(rel - typed), 0.5);
  vec2 q = vec2(fx, (ly - 2.0) / 14.0);
  float box = step(0.08, q.x) * step(q.x, 0.92) * step(0.0, q.y) * step(q.y, 1.0);
  col += vec3(0.85, 0.95, 1.0) * atCur * box * blink * 0.9;
  return col;
}

vec3 sceneTerminal(vec2 fc) {
  vec2 p = vec2(fc.x, uRes.y - fc.y) / uScale;
  float paneW = 560.0;
  float pane = floor(p.x / paneW);
  float px = mod(p.x, paneW);
  vec3 col = terminalPane(px, p.y, pane);
  col += uAccent * (1.0 - step(1.0, px)) * step(0.5, pane) * 0.12;
  return col;
}

/* ---------- SCENE 2 : DATA RAIN (projects) ---------- */
vec3 sceneRain(vec2 fc) {
  float cell = 16.0 * uScale;
  vec2 p = vec2(fc.x, uRes.y - fc.y) / cell;
  vec2 id = floor(p);
  vec2 cuv = fract(p);
  cuv.y = 1.0 - cuv.y;

  float colSeed = hash11(id.x * 1.37);
  float colOn = step(0.35, colSeed);
  float speed = 5.0 + colSeed * 11.0;
  float rows = uRes.y / cell;
  float trail = 8.0 + hash11(id.x + 3.1) * 18.0;
  float cycle = rows + trail + 10.0 + hash11(id.x + 9.0) * 30.0;
  float head = mod(uTime * speed + hash11(id.x + 5.0) * cycle, cycle);
  float dist = head - id.y;
  float inTrail = step(0.0, dist) * step(dist, trail);
  float b = inTrail * pow(max(1.0 - dist / trail, 0.0), 1.6);

  float swapRate = 6.0 + hash11(id.x + 2.0) * 10.0;
  float seed = floor(uTime * swapRate * (0.3 + hash21(id) * 0.7));
  float g = glyph(cuv, id, seed);

  float isHead = inTrail * (1.0 - step(1.0, dist));
  vec3 col = uAccent * g * b * 0.9 * colOn;
  col += vec3(0.85, 0.95, 1.0) * g * isHead * colOn * 1.1;
  col += uAccent * glyph(cuv, id + 91.0, floor(uTime * 0.5 + hash21(id) * 10.0)) * 0.035;
  return col;
}

/* ---------- SCENE 3 : CIRCUIT BOARD (resume) ---------- */
float edgeH(vec2 id) { return step(0.5, hash21(id + 17.0)); }
float edgeV(vec2 id) { return step(0.58, hash21(id + 43.0)); }

vec3 sceneCircuit(vec2 fc) {
  vec2 p = fc / uScale;
  float cell = 26.0;
  vec2 id = floor(p / cell);
  vec2 f = (fract(p / cell) - 0.5) * cell;

  float eR = edgeH(id), eL = edgeH(id - vec2(1.0, 0.0));
  float eU = edgeV(id), eD = edgeV(id - vec2(0.0, 1.0));
  float lineH = 1.0 - smoothstep(0.5, 1.5, abs(f.y));
  float lineV = 1.0 - smoothstep(0.5, 1.5, abs(f.x));
  float h = lineH * max(eR * step(0.0, f.x), eL * step(f.x, 0.0));
  float v = lineV * max(eU * step(0.0, f.y), eD * step(f.y, 0.0));
  float trace = max(h, v);

  float deg = eR + eL + eU + eD;
  float d = length(f);
  float pad = step(0.5, deg) * step(deg, 1.5) * ring(d - 3.5, 0.6);
  float via = step(2.5, deg) * (1.0 - smoothstep(1.5, 2.5, d));

  // data pulses running along rows / columns
  float lenPx = cell * 12.0;
  float sh = hash11(id.y * 1.7 + 3.0);
  float dirH = sh > 0.5 ? 1.0 : -1.0;
  float ph = fract(p.x / lenPx * dirH - uTime * (0.12 + sh * 0.18) + sh * 9.0);
  float pulseH = exp(-pow((ph - 0.5) * 16.0, 2.0)) * step(0.6, hash11(id.y + 11.0));

  float sv = hash11(id.x * 2.3 + 5.0);
  float dirV = sv > 0.5 ? 1.0 : -1.0;
  float pv = fract(p.y / lenPx * dirV - uTime * (0.12 + sv * 0.18) + sv * 9.0);
  float pulseV = exp(-pow((pv - 0.5) * 16.0, 2.0)) * step(0.6, hash11(id.x + 23.0));

  // scanner sweeping left -> right
  float sx = fract(uTime * 0.06) * 1.3 - 0.15;
  float scan = exp(-pow((fc.x / uRes.x - sx) * 9.0, 2.0));

  vec3 hot = mix(uAccent, vec3(0.9, 0.97, 1.0), 0.5);
  vec3 col = uAccent * (trace * 0.16 + pad * 0.35 + via * 0.45);
  col += uAccent * trace * scan * 0.35;
  col += hot * (h * pulseH + v * pulseV) * 1.1;
  col += hot * (pad + via) * scan * 0.5;
  return col;
}

/* ---------- SCENE 4 : RADAR LOCK (cta) ---------- */
vec3 sceneRadar(vec2 fc) {
  vec2 p = (fc - 0.5 * uRes) / uScale;
  float r = length(p);
  float a = atan(p.y, p.x + 1e-4);
  float R = min(uRes.x, uRes.y) / uScale * 0.42;
  float inside = step(r, R);

  float sp = R / 4.0;
  float rings = ring(mod(r + sp * 0.5, sp) - sp * 0.5, 0.4) * inside;
  float cross = (1.0 - smoothstep(0.4, 1.4, min(abs(p.x), abs(p.y)))) * inside;

  float ang = uTime * 1.1;
  float behind = mod(ang - a, TAU);
  float trail = exp(-behind * 3.0) * inside;
  float edge = exp(-behind * 60.0) * inside;

  float bc = 38.0;
  vec2 bid = floor(p / bc);
  vec2 bpos = (bid + 0.2 + 0.6 * vec2(hash21(bid + 3.0), hash21(bid + 7.0))) * bc;
  float exists = step(0.86, hash21(bid + 1.0)) * step(length(bpos), R - 6.0);
  float since = mod(ang - atan(bpos.y, bpos.x + 1e-4), TAU);
  float bd = length(p - bpos);
  float blip = exists * exp(-since * 1.1) * (1.0 - smoothstep(1.5, 3.5, bd));
  float blipRing = exists * exp(-since * 2.0) * ring(bd - since * 9.0, 0.5);

  float ticks = step(fract(a / TAU * 72.0), 0.12) * step(R + 2.0, r) * step(r, R + 8.0);
  float dashes = step(0.5, fract(a / TAU * 40.0 - uTime * 0.15)) * ring(r - R - 16.0, 0.8);
  float outer = ring(r - R, 0.5);

  float pt = fract(uTime * 0.35);
  float pulse = ring(r - pt * R * 1.5, 1.0) * (1.0 - pt);

  vec3 hot = mix(uAccent, vec3(0.9, 0.97, 1.0), 0.55);
  vec3 col = uAccent * (rings * 0.22 + cross * 0.14 + outer * 0.4 + ticks * 0.3 + dashes * 0.35);
  col += uAccent * trail * 0.28 + hot * edge * 0.6;
  col += hot * (blip * 1.2 + blipRing * 0.5);
  col += uAccent * pulse * 0.35;
  return col;
}

vec3 scene(float s, vec2 fc) {
  if (s < 0.5) return sceneSignal(fc);
  if (s < 1.5) return sceneTerminal(fc);
  if (s < 2.5) return sceneRain(fc);
  if (s < 3.5) return sceneCircuit(fc);
  return sceneRadar(fc);
}

vec3 composite(vec2 fc) {
  if (uMix <= 0.001) return scene(uFrom, fc);
  if (uMix >= 0.999) return scene(uTo, fc);
  vec2 blk = floor(fc / (uScale * vec2(48.0, 12.0)));
  float k = step(hash21(blk + floor(uTime * 24.0)), uMix * 1.15 - 0.075);
  float m = mix(uMix, k, 0.75);
  return mix(scene(uFrom, fc), scene(uTo, fc), m);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / uRes;

  // transition glitch: slice tearing
  float g = uGlitch;
  if (g > 0.001) {
    float bandId = floor(uv.y * 26.0);
    float r = hash11(bandId + floor(uTime * 30.0) * 7.0);
    float tear = step(1.0 - g * 0.55, r) * (r - 0.5) * 0.25 * g;
    fc.x += tear * uRes.x;
  }

  // the scene is rendered ONCE per pixel (multiple passes crashed the GPU)
  vec3 col = composite(fc);
  if (g > 0.02) {
    float sh = (hash11(floor(uv.y * 26.0) + floor(uTime * 30.0)) - 0.5) * g;
    col = vec3(col.r * (1.0 + sh * 1.5), col.g, col.b * (1.0 - sh * 1.5) + col.b * 0.3 * g);
    vec2 blk = floor(uv * vec2(18.0, 40.0));
    float bn = step(1.0 - g * 0.12, hash21(blk + floor(uTime * 20.0)));
    col += uAccent * bn * 0.35 + vec3(bn * 0.1);
  }

  // CRT finish
  float scan = 0.82 + 0.18 * sin(fc.y / uScale * 3.14159 * 0.5);
  col *= scan;
  float grain = (hash21(fc + fract(uTime) * 100.0) - 0.5) * 0.05;
  col += grain * uAccent;
  vec2 v = uv - 0.5;
  float vig = 1.0 - smoothstep(0.2, 0.85, length(v * vec2(1.0, 1.2)));
  col *= vig;
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
