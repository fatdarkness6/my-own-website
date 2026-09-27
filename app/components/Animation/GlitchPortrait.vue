<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const props = defineProps({
  src: { type: String, required: true },
  particleColor: { type: String, default: "#F8FAFC" },
  accentColor: { type: String, default: "#3B82F6" },
  backgroundThreshold: { type: Number, default: 30 },
  sampleWidth: { type: Number, default: 220 },
  pointSize: { type: Number, default: 0.95 },
  repelRadius: { type: Number, default: 8 },
  repelStrength: { type: Number, default: 1.8 },
  tilt: { type: Number, default: 0.12 },
  fit: { type: String, default: "cover" },
  zoom: { type: Number, default: 1 },
  opacity: { type: Number, default: 1 },

  // ---- Ambient background dots ----
  ambientDots: { type: Boolean, default: true },
  ambientSpacing: { type: Number, default: 3.2 },
  ambientJitter: { type: Number, default: 0.55 },
  ambientSize: { type: Number, default: 0.4 },
  ambientBrightness: { type: Number, default: 0.35 }, // peak opacity right next to the portrait
  ambientMinOpacity: { type: Number, default: 0.05 }, // opacity far away
  ambientFalloff: { type: Number, default: 22 }, // world units until fade completes
  ambientMarginFactor: { type: Number, default: 1.7 },
});

const containerEl = ref(null);
const canvasEl = ref(null);

let scene, camera, renderer, material, points, geometry, ro;
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

function buildMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(props.particleColor) },
      uAccent: { value: new THREE.Color(props.accentColor) },
      uDotPixelSize: { value: 1 },
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
      varying float vOpacity;
      varying float vHighlight;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.42, dist) * vOpacity;
        vec3 color = mix(uColor, uAccent, vHighlight);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

// ============================================================
// Chamfer distance transform: for every pixel, distance to nearest "subject" pixel
// ============================================================
function computeDistanceTransform(mask, sw, sh) {
  const INF = 1e6;
  const dist = new Float32Array(sw * sh);
  for (let i = 0; i < dist.length; i++) dist[i] = mask[i] ? 0 : INF;

  // forward pass (top-left → bottom-right)
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
  // backward pass (bottom-right → top-left)
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
  // if the point is outside the image rect, add distance to the edge
  const dx = fx - cx;
  const dy = fy - cy;
  return base + Math.sqrt(dx * dx + dy * dy);
}

function buildParticlesFromImage(img) {
  const sw =
    window.innerWidth < 640
      ? Math.round(props.sampleWidth * 0.6)
      : props.sampleWidth;
  const sh = Math.max(
    1,
    Math.round(sw * (img.naturalHeight / img.naturalWidth)),
  );

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const ctx = off.getContext("2d");
  ctx.drawImage(img, 0, 0, sw, sh);
  const { data } = ctx.getImageData(0, 0, sw, sh);

  worldWidth = 100;
  worldHeight = worldWidth * (sh / sw);

  // ---- Subject mask + distance field ----
  const mask = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a >= 10 && lum >= props.backgroundThreshold) mask[y * sw + x] = 1;
    }
  }
  const distField = computeDistanceTransform(mask, sw, sh);
  const worldPerSample = worldWidth / sw;

  const positions = [];
  const sizes = [];
  const opacities = [];

  // ---- Foreground dots (portrait itself) ----
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

  // ---- Ambient dots with distance-based gradient ----
  if (props.ambientDots) {
    const halfW = (worldWidth * props.ambientMarginFactor) / 2;
    const halfH = (worldHeight * props.ambientMarginFactor) / 2;
    const spacing = props.ambientSpacing;

    for (let ax = -halfW; ax <= halfW; ax += spacing) {
      for (let ay = -halfH; ay <= halfH; ay += spacing) {
        const wx = ax + (Math.random() - 0.5) * spacing * props.ambientJitter;
        const wy = ay + (Math.random() - 0.5) * spacing * props.ambientJitter;

        // Skip if this dot lands exactly on the portrait
        const nx = wx / worldWidth + 0.5;
        const ny = 0.5 - wy / worldHeight;
        if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
          const ix = Math.min(sw - 1, Math.max(0, Math.floor(nx * sw)));
          const iy = Math.min(sh - 1, Math.max(0, Math.floor(ny * sh)));
          if (mask[iy * sw + ix]) continue;
        }

        // Distance from the portrait silhouette, in world units
        const distWorld =
          sampleDistanceField(distField, sw, sh, wx, wy) * worldPerSample;

        // Gradient: near → bright, far → min opacity
        const t = 1 - smoothstep(0, props.ambientFalloff, distWorld);
        const opacity =
          props.ambientMinOpacity +
          (props.ambientBrightness - props.ambientMinOpacity) * t;

        // Optional: also scale size slightly with distance (near = bigger)
        const sizeScale = 0.55 + t * 0.75;

        positions.push(wx, wy, 0);
        sizes.push(
          props.ambientSize * sizeScale * (0.85 + Math.random() * 0.3),
        );
        opacities.push(opacity * (0.75 + Math.random() * 0.25));
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute("aOpacity", new THREE.Float32BufferAttribute(opacities, 1));
  geo.setAttribute(
    "aHighlight",
    new THREE.Float32BufferAttribute(new Array(sizes.length).fill(0), 1),
  );

  return { geo, homes: new Float32Array(positions), sw };
}

function fitCamera() {
  if (!camera || !containerEl.value) return;

  const rect = containerEl.value.getBoundingClientRect();
  const w = Math.min(Math.max(rect.width, 1), window.innerWidth);
  const h = Math.min(Math.max(rect.height, 1), window.innerHeight * 3);
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

  camera.left = -viewW / 2;
  camera.right = viewW / 2;
  camera.top = viewH / 2;
  camera.bottom = -viewH / 2;
  camera.updateProjectionMatrix();

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelsPerWorldUnit = w / viewW;
  if (material) {
    material.uniforms.uDotPixelSize.value =
      dotWorldSize * pixelsPerWorldUnit * pixelRatio;
  }

  renderer.setSize(w, h);
  if (reduceMotion) renderer.render(scene, camera);
}

function onPointerMove(e) {
  const rect = containerEl.value.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  hasPointer = true;
}

function onPointerLeave() {
  hasPointer = false;
}

function animate() {
  raf = requestAnimationFrame(animate);
  if (document.hidden || !geometry) return;

  let repelActive = false;
  if (hasPointer) {
    raycaster.setFromCamera(mouseNDC, camera);
    repelActive = !!raycaster.ray.intersectPlane(groundPlane, mouseWorld);
  }

  const posAttr = geometry.attributes.position;
  const hlAttr = geometry.attributes.aHighlight;
  const pos = posAttr.array;
  const hl = hlAttr.array;
  const R = repelRadiusWorld;
  const S = repelStrengthWorld;
  const ease = 0.09;

  for (let i = 0, j = 0; i < homes.length; i += 3, j++) {
    const hx = homes[i];
    const hy = homes[i + 1];
    let tx = hx;
    let ty = hy;
    let th = 0;

    if (repelActive) {
      const dx = hx - mouseWorld.x;
      const dy = hy - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < R) {
        const force = 1 - dist / R;
        th = force;
        const invDist = dist > 0.0001 ? 1 / dist : 0;
        tx = hx + dx * invDist * force * S;
        ty = hy + dy * invDist * force * S;
      }
    }

    pos[i] += (tx - pos[i]) * ease;
    pos[i + 1] += (ty - pos[i + 1]) * ease;
    hl[j] += (th - hl[j]) * ease;
  }
  posAttr.needsUpdate = true;
  hlAttr.needsUpdate = true;

  const targetTiltX = hasPointer ? -mouseNDC.y * props.tilt : 0;
  const targetTiltY = hasPointer ? mouseNDC.x * props.tilt : 0;
  tiltX += (targetTiltX - tiltX) * 0.06;
  tiltY += (targetTiltY - tiltY) * 0.06;
  points.rotation.x = tiltX;
  points.rotation.y = tiltY;

  renderer.render(scene, camera);
}

onMounted(() => {
  if (!containerEl.value || !canvasEl.value) return;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  material = buildMaterial();

  const img = new Image();
  img.onload = () => {
    const built = buildParticlesFromImage(img);
    geometry = built.geo;
    homes = built.homes;
    const spacing = worldWidth / built.sw;
    dotWorldSize = spacing * props.pointSize;
    repelRadiusWorld = spacing * props.repelRadius;
    repelStrengthWorld = spacing * props.repelStrength;
    points = new THREE.Points(geometry, material);
    scene.add(points);
    fitCamera();

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      containerEl.value.addEventListener("pointermove", onPointerMove);
      containerEl.value.addEventListener("pointerleave", onPointerLeave);
      animate();
    }
  };
  img.onerror = () => {
    console.error(`GlitchPortrait: could not load image at "${props.src}"`);
  };
  img.src = props.src;

  ro = new ResizeObserver(fitCamera);
  ro.observe(containerEl.value);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  ro?.disconnect();
  containerEl.value?.removeEventListener("pointermove", onPointerMove);
  containerEl.value?.removeEventListener("pointerleave", onPointerLeave);
  geometry?.dispose();
  material?.dispose();
  renderer?.dispose();
});
</script>

<template>
  <div ref="containerEl" class="glitch-portrait" :style="{ opacity }">
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
}

.glitch-portrait__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
