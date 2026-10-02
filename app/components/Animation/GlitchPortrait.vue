<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const props = defineProps({
  src: { type: String, required: true },
  particleColor: { type: String, default: "#F8FAFC" },
  accentColor: { type: String, default: "#3B82F6" },
  backgroundThreshold: { type: Number, default: 30 },
  sampleWidth: { type: Number, default: 300 },
  pointSize: { type: Number, default: 0.95 },
  repelRadius: { type: Number, default: 8 },
  repelStrength: { type: Number, default: 1.8 },
  tilt: { type: Number, default: 0.12 },
  fit: { type: String, default: "cover" },
  zoom: { type: Number, default: 1 },
  opacity: { type: Number, default: 1 },
  mobileOpacity: { type: Number, default: null },
  mobileOffsetX: { type: Number, default: 0 },
  mobileOffsetY: { type: Number, default: 0 },

  // ---- Ambient background dots ----
  ambientDots: { type: Boolean, default: true },
  ambientSpacing: { type: Number, default: 3.2 },
  ambientJitter: { type: Number, default: 0.55 },
  ambientSize: { type: Number, default: 0.4 },
  ambientBrightness: { type: Number, default: 0.35 },
  ambientMinOpacity: { type: Number, default: 0.05 },
  ambientFalloff: { type: Number, default: 22 },
  ambientMarginFactor: { type: Number, default: 1.7 },

  // ---- Reveal / assemble animation (initial load only) ----
  revealed: { type: Boolean, default: true },
  revealDuration: { type: Number, default: 1200 },
  scatterRadius: { type: Number, default: 60 },

  // ---- Random ambient glitch bursts (multi-style) ----
  autoGlitch: { type: Boolean, default: true },
  autoGlitchInterval: { type: Number, default: 8000 },
  autoGlitchRandomness: { type: Number, default: 6000 },
  autoGlitchDuration: { type: Number, default: 800 },
  autoGlitchStyles: {
    type: Array,
    default: () => ["scatter", "wave", "slice", "flicker"],
  },
  autoGlitchScatterRadius: { type: Number, default: 18 },
  autoGlitchWaveAmplitude: { type: Number, default: 2.5 },
  autoGlitchSliceMaxOffset: { type: Number, default: 6 },
  autoGlitchFlashIntensity: { type: Number, default: 0.6 },

  // ---- Mobile performance ----
  mobileSampleScale: { type: Number, default: 0.74 }, // ~220 samples on phones
  mobilePointSizeScale: { type: Number, default: 0.85 },
  mobileAmbientSpacingScale: { type: Number, default: 1.5 }, // sparser bg dots on phones
  desktopAmbientBrightnessScale: { type: Number, default: 0.65 },
  mobileAmbientBrightnessScale: { type: Number, default: 0.3 },
  desktopGlitchStrengthScale: { type: Number, default: 0.65 },
  mobileGlitchStrengthScale: { type: Number, default: 0.55 },
  mobilePixelRatio: { type: Number, default: 2 },
  mobileMaxFps: { type: Number, default: 30 },
});

const containerEl = ref(null);
const canvasEl = ref(null);
const mobileMode = ref(false);
const renderedOpacity = computed(() =>
  mobileMode.value && props.mobileOpacity != null
    ? props.mobileOpacity
    : props.opacity,
);

let scene, camera, renderer, material, points, geometry, ro, io;
let homes = new Float32Array(0);
let raf = 0;
let worldWidth = 100;
let worldHeight = 100;
let hasPointer = false;
let tiltX = 0;
let tiltY = 0;
let dotWorldSize = 1;
let repelRadiusWorld = 1;
let repelStrengthWorld = 1;
let glitchTimer = null;
let disposed = false;

// ---- Perf state ----
let isMobile = false;
let isVisible = true;
let settledFrames = 0;
let lastFrameAt = 0;
let lastWidth = 0;
let lastHeight = 0;
const SETTLE_FRAMES = 90; // ~1.5s of no movement -> stop touching the GPU

// ---- Ambient glitch state ----
const NUM_BANDS = 14;
let glitchActive = null;
let lastGlitchStyle = null;
let bandOffsets = new Float32Array(NUM_BANDS);
let lastBandUpdateTime = 0;
let lastFlickerToggle = 0;
let flashValue = 0;
let flashTarget = 0;

const mouseNDC = new THREE.Vector2(-10, -10);
const mouseWorld = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function smoothstep(edge0, edge1, x) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function pseudoRandom(n) {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

function wake() {
  settledFrames = 0;
}

function activeGlitchStrength() {
  return isMobile
    ? props.mobileGlitchStrengthScale
    : props.desktopGlitchStrengthScale;
}

function buildMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(props.particleColor) },
      uAccent: { value: new THREE.Color(props.accentColor) },
      uDotPixelSize: { value: 1 },
      uRevealProgress: { value: props.revealed ? 1 : 0 },
      uFlashIntensity: { value: 0 },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aHighlight;
      varying float vOpacity;
      varying float vHighlight;
      uniform float uDotPixelSize;
      void main() {
        vOpacity = aOpacity;
        vHighlight = aHighlight;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uDotPixelSize * (1.0 + aHighlight * 0.9);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      precision mediump float;
      varying float vOpacity;
      varying float vHighlight;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uRevealProgress;
      uniform float uFlashIntensity;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.42, dist) * vOpacity * uRevealProgress;
        alpha = clamp(alpha * (1.0 + uFlashIntensity * 0.7), 0.0, 1.0);
        float mixAmount = clamp(vHighlight + uFlashIntensity * 0.6, 0.0, 1.0);
        vec3 color = mix(uColor, uAccent, mixAmount);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });
}

// ---- Distance Transform ----
function computeDistanceTransform(mask, sw, sh) {
  const INF = 1e6;
  const dist = new Float32Array(sw * sh);
  for (let i = 0; i < dist.length; i++) dist[i] = mask[i] ? 0 : INF;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = y * sw + x;
      let d = dist[i];
      if (y > 0) {
        d = Math.min(d, dist[i - sw] + 1);
        if (x > 0) d = Math.min(d, dist[i - sw - 1] + 1.414);
        if (x < sw - 1) d = Math.min(d, dist[i - sw + 1] + 1.414);
      }
      if (x > 0) d = Math.min(d, dist[i - 1] + 1);
      dist[i] = d;
    }
  }
  for (let y = sh - 1; y >= 0; y--) {
    for (let x = sw - 1; x >= 0; x--) {
      const i = y * sw + x;
      let d = dist[i];
      if (y < sh - 1) {
        d = Math.min(d, dist[i + sw] + 1);
        if (x > 0) d = Math.min(d, dist[i + sw - 1] + 1.414);
        if (x < sw - 1) d = Math.min(d, dist[i + sw + 1] + 1.414);
      }
      if (x < sw - 1) d = Math.min(d, dist[i + 1] + 1);
      dist[i] = d;
    }
  }
  return dist;
}

function sampleDistanceField(distField, sw, sh, wx, wy) {
  const fx = (wx / worldWidth + 0.5) * sw - 0.5;
  const fy = (0.5 - wy / worldHeight) * sh - 0.5;
  const cx = Math.min(Math.max(fx, 0), sw - 1);
  const cy = Math.min(Math.max(fy, 0), sh - 1);
  const ix = Math.round(cx);
  const iy = Math.round(cy);
  const base = distField[iy * sw + ix];
  const dx = fx - cx;
  const dy = fy - cy;
  return base + Math.sqrt(dx * dx + dy * dy);
}

function buildParticlesFromImage(img) {
  const sw = isMobile
    ? Math.round(props.sampleWidth * props.mobileSampleScale)
    : props.sampleWidth;
  const sh = Math.max(
    1,
    Math.round(sw * (img.naturalHeight / img.naturalWidth)),
  );

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, sw, sh);
  const { data } = ctx.getImageData(0, 0, sw, sh);
  // free the offscreen canvas memory right away (matters on iOS)
  off.width = off.height = 0;

  worldWidth = 100;
  worldHeight = worldWidth * (sh / sw);

  const mask = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (data[i + 3] >= 10 && lum >= props.backgroundThreshold)
        mask[y * sw + x] = 1;
    }
  }
  const distField = computeDistanceTransform(mask, sw, sh);
  const worldPerSample = worldWidth / sw;

  const positions = [];
  const sizes = [];
  const opacities = [];

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (!mask[y * sw + x]) continue;
      const i = (y * sw + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const px = (x / sw - 0.5) * worldWidth;
      const py = -(y / sh - 0.5) * worldHeight;
      positions.push(px, py, 0);
      const b01 = lum / 255;
      sizes.push(0.5 + b01 * 1.1);
      opacities.push(0.75 + b01 * 0.25);
    }
  }

  if (props.ambientDots) {
    const halfW = (worldWidth * props.ambientMarginFactor) / 2;
    const halfH = (worldHeight * props.ambientMarginFactor) / 2;
    const spacing = isMobile
      ? props.ambientSpacing * props.mobileAmbientSpacingScale
      : props.ambientSpacing;

    for (let ax = -halfW; ax <= halfW; ax += spacing) {
      for (let ay = -halfH; ay <= halfH; ay += spacing) {
        const wx = ax + (Math.random() - 0.5) * spacing * props.ambientJitter;
        const wy = ay + (Math.random() - 0.5) * spacing * props.ambientJitter;

        const nx = wx / worldWidth + 0.5;
        const ny = 0.5 - wy / worldHeight;
        if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
          const ix = Math.min(sw - 1, Math.max(0, Math.floor(nx * sw)));
          const iy = Math.min(sh - 1, Math.max(0, Math.floor(ny * sh)));
          if (mask[iy * sw + ix]) continue;
        }

        const distWorld =
          sampleDistanceField(distField, sw, sh, wx, wy) * worldPerSample;
        const t = 1 - smoothstep(0, props.ambientFalloff, distWorld);
        const brightnessScale = isMobile
          ? props.mobileAmbientBrightnessScale
          : props.desktopAmbientBrightnessScale;
        const minOpacity = props.ambientMinOpacity * brightnessScale;
        const maxOpacity = props.ambientBrightness * brightnessScale;
        const opacity = minOpacity + (maxOpacity - minOpacity) * t;
        const sizeScale = 0.55 + t * 0.75;

        positions.push(wx, wy, 0);
        sizes.push(
          props.ambientSize * sizeScale * (0.85 + Math.random() * 0.3),
        );
        opacities.push(opacity * (0.75 + Math.random() * 0.25));
      }
    }
  }

  const count = sizes.length;
  const homesArr = new Float32Array(positions);
  const startArr = new Float32Array(homesArr);
  if (!props.revealed) {
    for (let i = 0; i < startArr.length; i++) {
      if (i % 3 === 2) continue;
      startArr[i] += (Math.random() - 0.5) * props.scatterRadius * 2;
    }
  }

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(startArr, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  const hlAttr = new THREE.BufferAttribute(new Float32Array(count), 1);
  hlAttr.setUsage(THREE.DynamicDrawUsage);

  geo.setAttribute("position", posAttr);
  geo.setAttribute(
    "aSize",
    new THREE.BufferAttribute(new Float32Array(sizes), 1),
  );
  geo.setAttribute(
    "aOpacity",
    new THREE.BufferAttribute(new Float32Array(opacities), 1),
  );
  geo.setAttribute("aHighlight", hlAttr);
  // static bounds: skip three's per-frame bounding sphere work
  geo.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(),
    Math.max(worldWidth, worldHeight) * props.ambientMarginFactor,
  );

  return { geo, homes: homesArr, sw };
}

function fitCamera() {
  if (!camera || !renderer || !containerEl.value) return;

  const rect = containerEl.value.getBoundingClientRect();
  const w = Math.round(Math.min(Math.max(rect.width, 1), window.innerWidth));
  const h = Math.round(
    Math.min(Math.max(rect.height, 1), window.innerHeight * 3),
  );

  // Mobile URL bar show/hide changes height by a few px constantly.
  // Ignore tiny height changes so we don't reallocate the canvas every scroll.
  const widthChanged = w !== lastWidth;
  const heightChanged = Math.abs(h - lastHeight) > (isMobile ? 120 : 1);
  if (!widthChanged && !heightChanged && lastWidth) return;
  lastWidth = w;
  lastHeight = h;

  const containerAspect = w / h;
  const imageAspect = worldWidth / worldHeight;

  let viewW, viewH;
  if (props.fit === "cover") {
    if (containerAspect > imageAspect) {
      viewW = worldWidth;
      viewH = viewW / containerAspect;
    } else {
      viewH = worldHeight;
      viewW = viewH * containerAspect;
    }
  } else {
    const pad = 1.08;
    if (containerAspect > imageAspect) {
      viewH = worldHeight * pad;
      viewW = viewH * containerAspect;
    } else {
      viewW = worldWidth * pad;
      viewH = viewW / containerAspect;
    }
  }

  const z = props.zoom || 1;
  viewW /= z;
  viewH /= z;

  const offsetX = isMobile ? props.mobileOffsetX : 0;
  const offsetY = isMobile ? props.mobileOffsetY : 0;
  camera.left = -viewW / 2 + offsetX;
  camera.right = viewW / 2 + offsetX;
  camera.top = viewH / 2 + offsetY;
  camera.bottom = -viewH / 2 + offsetY;
  camera.updateProjectionMatrix();

  const pixelRatio = renderer.getPixelRatio();
  const pixelsPerWorldUnit = w / viewW;
  if (material) {
    material.uniforms.uDotPixelSize.value =
      dotWorldSize * pixelsPerWorldUnit * pixelRatio;
  }

  renderer.setSize(w, h);
  wake();
  if (reduceMotion && points) renderer.render(scene, camera);
}

function onPointerMove(e) {
  const rect = containerEl.value.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  hasPointer = true;
  wake();
}

function onPointerLeave() {
  hasPointer = false;
  wake();
}

// Touch: pointerleave often never fires, so drop the "mouse" when the finger lifts
function onPointerUp(e) {
  if (e.pointerType !== "mouse") onPointerLeave();
}

// ---- Ambient glitch helpers ----
function randomizeBandOffsets() {
  const strength = activeGlitchStrength();
  for (let b = 0; b < NUM_BANDS; b++) {
    bandOffsets[b] =
      Math.random() > 0.55
        ? (Math.random() - 0.5) *
          2 *
          props.autoGlitchSliceMaxOffset *
          strength
        : 0;
  }
}

function pickGlitchStyle() {
  const pool = props.autoGlitchStyles.length
    ? props.autoGlitchStyles
    : ["scatter"];
  let next;
  do {
    next = pool[Math.floor(Math.random() * pool.length)];
  } while (next === lastGlitchStyle && pool.length > 1);
  lastGlitchStyle = next;
  return next;
}

function triggerGlitchBurst(styleOverride) {
  if (!homes.length) return;
  const style = styleOverride || pickGlitchStyle();
  const now = performance.now();

  glitchActive = {
    style,
    start: now,
    duration: props.autoGlitchDuration,
    freq: 0.1 + Math.random() * 0.12,
    speed: 0.015 + Math.random() * 0.015,
    phase: Math.random() * Math.PI * 2,
  };

  lastBandUpdateTime = 0;
  lastFlickerToggle = 0;

  if (style === "slice") randomizeBandOffsets();
  if (style === "flicker") {
    flashTarget =
      props.autoGlitchFlashIntensity * activeGlitchStrength();
  }
  wake();
}

function scheduleNextGlitch() {
  if (!props.autoGlitch || reduceMotion || disposed) return;
  const jitter = Math.random() * props.autoGlitchRandomness;
  glitchTimer = setTimeout(() => {
    // don't glitch something nobody can see
    if (isVisible && !document.hidden) triggerGlitchBurst();
    scheduleNextGlitch();
  }, props.autoGlitchInterval + jitter);
}

function startLoop() {
  if (raf || disposed || reduceMotion) return;
  raf = requestAnimationFrame(animate);
}

function stopLoop() {
  cancelAnimationFrame(raf);
  raf = 0;
}

function animate(now) {
  raf = 0;
  if (disposed) return;
  // Fully stop the loop when hidden/offscreen (resumed by observers)
  if (document.hidden || !isVisible || !geometry) return;
  raf = requestAnimationFrame(animate);

  // Cap FPS on phones: halves the CPU + GPU upload cost
  if (isMobile) {
    const minDelta = 1000 / props.mobileMaxFps;
    if (now - lastFrameAt < minDelta - 1) return;
  }
  lastFrameAt = now;

  // Nothing moving and everything is home -> skip the work entirely
  const busy =
    hasPointer || !!glitchActive || flashValue > 0.005 || flashTarget > 0;
  if (busy) settledFrames = 0;
  else if (++settledFrames > SETTLE_FRAMES) return;

  let repelActive = false;
  if (hasPointer) {
    raycaster.setFromCamera(mouseNDC, camera);
    repelActive = !!raycaster.ray.intersectPlane(groundPlane, mouseWorld);
  }

  // ---- Update ambient glitch per-frame state ----
  let glitchEnvelope = 0;
  let glitchStyle = null;
  if (glitchActive) {
    const tNorm = Math.min(
      1,
      (now - glitchActive.start) / glitchActive.duration,
    );
    glitchEnvelope = Math.sin(Math.PI * tNorm);
    glitchStyle = glitchActive.style;

    if (glitchStyle === "slice" && now - lastBandUpdateTime > 70) {
      randomizeBandOffsets();
      lastBandUpdateTime = now;
    }
    if (glitchStyle === "flicker" && now - lastFlickerToggle > 90) {
      flashTarget =
        Math.random() > 0.4
          ? props.autoGlitchFlashIntensity *
            activeGlitchStrength()
          : 0;
      lastFlickerToggle = now;
    }

    if (tNorm >= 1) {
      glitchActive = null;
      glitchStyle = null;
      glitchEnvelope = 0;
      flashTarget = 0;
    }
  }
  flashValue += (flashTarget - flashValue) * 0.25;
  if (flashValue < 0.001) flashValue = 0;
  if (material) material.uniforms.uFlashIntensity.value = flashValue;

  const posAttr = geometry.attributes.position;
  const hlAttr = geometry.attributes.aHighlight;
  const pos = posAttr.array;
  const hl = hlAttr.array;
  const R = repelRadiusWorld;
  const R2 = R * R;
  const S = repelStrengthWorld;
  const ease = isMobile ? 0.16 : 0.09; // fewer frames on mobile -> bigger steps
  const mx = mouseWorld.x;
  const my = mouseWorld.y;
  const glitchStrength = activeGlitchStrength();
  const scatterR = props.autoGlitchScatterRadius * glitchStrength;
  const waveA = props.autoGlitchWaveAmplitude * glitchStrength;
  const seed = glitchActive ? glitchActive.start * 0.001 : 0;

  for (let i = 0, j = 0; i < homes.length; i += 3, j++) {
    const hx = homes[i];
    const hy = homes[i + 1];
    let tx = hx;
    let ty = hy;
    let th = 0;

    if (repelActive) {
      const dx = hx - mx;
      const dy = hy - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const dist = Math.sqrt(d2);
        const force = 1 - dist / R;
        th = force;
        const invDist = dist > 0.0001 ? 1 / dist : 0;
        tx = hx + dx * invDist * force * S;
        ty = hy + dy * invDist * force * S;
      }
    }

    if (glitchStyle) {
      switch (glitchStyle) {
        case "scatter": {
          const rx = pseudoRandom(j * 12.9898 + seed);
          const ry = pseudoRandom(j * 78.233 + seed);
          tx += (rx - 0.5) * 2 * scatterR * glitchEnvelope;
          ty += (ry - 0.5) * 2 * scatterR * glitchEnvelope;
          break;
        }
        case "wave": {
          ty +=
            Math.sin(
              hx * glitchActive.freq +
                now * glitchActive.speed +
                glitchActive.phase,
            ) *
            waveA *
            glitchEnvelope;
          break;
        }
        case "slice": {
          const band = Math.min(
            NUM_BANDS - 1,
            Math.max(
              0,
              Math.floor(((hy + worldHeight / 2) / worldHeight) * NUM_BANDS),
            ),
          );
          tx += bandOffsets[band] * glitchEnvelope;
          break;
        }
        case "flicker": {
          tx += (Math.random() - 0.5) * 0.6 * glitchEnvelope;
          ty += (Math.random() - 0.5) * 0.6 * glitchEnvelope;
          break;
        }
      }
    }

    pos[i] += (tx - pos[i]) * ease;
    pos[i + 1] += (ty - pos[i + 1]) * ease;
    hl[j] += (th - hl[j]) * ease;
  }
  posAttr.needsUpdate = true;
  hlAttr.needsUpdate = true;

  // tilt only makes sense with a real mouse
  if (!isMobile) {
    const targetTiltX = hasPointer ? -mouseNDC.y * props.tilt : 0;
    const targetTiltY = hasPointer ? mouseNDC.x * props.tilt : 0;
    tiltX += (targetTiltX - tiltX) * 0.06;
    tiltY += (targetTiltY - tiltY) * 0.06;
    points.rotation.x = tiltX;
    points.rotation.y = tiltY;
  }

  renderer.render(scene, camera);
}

// ---------- REVEAL (initial load assemble) ----------
let revealRaf = 0;

function reveal() {
  if (!material) return;
  cancelAnimationFrame(revealRaf);
  const start = performance.now();
  const duration = props.revealDuration;
  wake();

  function tick(now) {
    if (disposed) return;
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);

    let flicker = 1;
    if (t < 0.35) {
      flicker = Math.random() > 0.25 ? 1 : 0.15;
    } else if (t < 0.55) {
      flicker = Math.random() > 0.15 ? 1 : 0.45;
    }

    material.uniforms.uRevealProgress.value = eased * flicker;
    wake(); // keep rendering while revealing

    if (t < 1) {
      revealRaf = requestAnimationFrame(tick);
    } else {
      material.uniforms.uRevealProgress.value = 1;
      if (reduceMotion && points) renderer.render(scene, camera);
    }
  }
  revealRaf = requestAnimationFrame(tick);
}

defineExpose({ reveal, triggerGlitchBurst });

watch(
  () => props.revealed,
  (val) => {
    if (val) reveal();
  },
);

function onVisibilityChange() {
  if (!document.hidden && isVisible) {
    wake();
    startLoop();
  }
}

function onContextLost(e) {
  // let the browser restore it instead of killing the page
  e.preventDefault();
  stopLoop();
}

function onContextRestored() {
  wake();
  lastWidth = 0;
  fitCamera();
  startLoop();
}

onMounted(() => {
  if (!containerEl.value || !canvasEl.value) return;

  isMobile =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  mobileMode.value = isMobile;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    alpha: true,
    antialias: !isMobile, // dots are round in the shader anyway
    powerPreference: isMobile ? "low-power" : "high-performance",
    stencil: false,
    depth: false,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      isMobile ? props.mobilePixelRatio : 2,
    ),
  );

  canvasEl.value.addEventListener("webglcontextlost", onContextLost, false);
  canvasEl.value.addEventListener(
    "webglcontextrestored",
    onContextRestored,
    false,
  );

  material = buildMaterial();

  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    if (disposed) return;
    const built = buildParticlesFromImage(img);
    geometry = built.geo;
    homes = built.homes;
    const spacing = worldWidth / built.sw;
    dotWorldSize =
      spacing * props.pointSize * (isMobile ? props.mobilePointSizeScale : 1);
    repelRadiusWorld = spacing * props.repelRadius;
    repelStrengthWorld = spacing * props.repelStrength;
    points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    lastWidth = 0; // force a full refit now that world size + dot size are known
    fitCamera();

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      containerEl.value.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      containerEl.value.addEventListener("pointerleave", onPointerLeave);
      containerEl.value.addEventListener("pointerup", onPointerUp);
      containerEl.value.addEventListener("pointercancel", onPointerLeave);
      startLoop();
      scheduleNextGlitch();
    }
  };
  img.onerror = () => {
    console.error(`GlitchPortrait: could not load image at "${props.src}"`);
  };
  img.src = props.src;

  ro = new ResizeObserver(() => fitCamera());
  ro.observe(containerEl.value);

  // Pause completely when the hero is scrolled out of view
  io = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        wake();
        startLoop();
      } else {
        stopLoop();
      }
    },
    { threshold: 0.01 },
  );
  io.observe(containerEl.value);

  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  disposed = true;
  stopLoop();
  cancelAnimationFrame(revealRaf);
  clearTimeout(glitchTimer);
  ro?.disconnect();
  io?.disconnect();
  document.removeEventListener("visibilitychange", onVisibilityChange);

  const el = containerEl.value;
  el?.removeEventListener("pointermove", onPointerMove);
  el?.removeEventListener("pointerleave", onPointerLeave);
  el?.removeEventListener("pointerup", onPointerUp);
  el?.removeEventListener("pointercancel", onPointerLeave);
  canvasEl.value?.removeEventListener("webglcontextlost", onContextLost);
  canvasEl.value?.removeEventListener(
    "webglcontextrestored",
    onContextRestored,
  );

  if (points) scene?.remove(points);
  geometry?.dispose();
  material?.dispose();
  // THE important one: actually release the WebGL context.
  // Without this, every navigation back to "/" leaks a context and iOS reloads the tab.
  renderer?.forceContextLoss();
  renderer?.dispose();
  renderer = null;
  scene = null;
  geometry = null;
  points = null;
  homes = new Float32Array(0);
});
</script>

<template>
  <div
    ref="containerEl"
    class="glitch-portrait"
    :style="{ opacity: renderedOpacity }"
  >
    <canvas ref="canvasEl" class="glitch-portrait__canvas" />
  </div>
</template>

<style scoped>
.glitch-portrait {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  /* let the page scroll vertically on touch while still getting pointer events */
  touch-action: pan-y;
}

.glitch-portrait__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
