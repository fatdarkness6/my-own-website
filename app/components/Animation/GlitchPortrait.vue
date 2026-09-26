<script setup>
// components/GlitchPortrait.vue
// Turns an image (ideally a halftone/dot portrait like your background.png) into an
// interactive Three.js particle cloud: dots push away from the cursor and glow, and
// the whole portrait tilts slightly toward the mouse, like a cheap parallax "3D" feel.
//
// Requires the "three" package:  npm install three
//
// Usage:
//   <GlitchPortrait src="/images/background.png" />
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const props = defineProps({
  src: { type: String, required: true },
  particleColor: { type: String, default: "#F8FAFC" },
  accentColor: { type: String, default: "#3B82F6" },
  // luminance (0-255) below this is treated as background and skipped
  backgroundThreshold: { type: Number, default: 30 },
  // downscale width used for sampling the image; higher = more particles = heavier
  sampleWidth: { type: Number, default: 220 },
  // dot diameter as a multiple of the gap between dots: below 1 = visible gaps between
  // dots (crisp, Figma-style halftone), 1 = dots just touch, above 1 = dots overlap
  // into a solid look
  pointSize: { type: Number, default: 0.95 },
  // how far (world units) the mouse influence reaches
  repelRadius: { type: Number, default: 26 },
  // how far (world units) a particle gets pushed at the center of that radius
  repelStrength: { type: Number, default: 7 },
  // max tilt in radians for the whole-portrait parallax
  tilt: { type: Number, default: 0.12 },
  // "cover" fills the container edge-to-edge (cropping overflow, like background-size: cover);
  // "contain" keeps the whole portrait visible with letterboxing
  fit: { type: String, default: "cover" },
  // >1 zooms in further on top of the chosen fit mode
  zoom: { type: Number, default: 1 },
  // lets you dial the whole portrait's visibility up or down (0 = invisible, 1 = full)
  opacity: { type: Number, default: 1 },
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
let dotWorldSize = 1; // spacing-derived; set in buildParticlesFromImage, used every fitCamera

const mouseNDC = new THREE.Vector2(-10, -10);
const mouseWorld = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(props.particleColor) },
      uAccent: { value: new THREE.Color(props.accentColor) },
      // pixels-per-world-unit * devicePixelRatio, refreshed by fitCamera on load/resize
      uDotPixelSize: { value: 1 },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aBrightness;
      attribute float aHighlight;
      varying float vBrightness;
      varying float vHighlight;
      uniform float uDotPixelSize;
      void main() {
        vBrightness = aBrightness;
        vHighlight = aHighlight;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uDotPixelSize * (1.0 + aHighlight * 0.9);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vBrightness;
      varying float vHighlight;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.42, dist) * (0.75 + vBrightness * 0.25);
        vec3 color = mix(uColor, uAccent, vHighlight);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

function buildParticlesFromImage(img) {
  // smaller sample width on small screens: fewer particles, better mobile perf
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

  const positions = [];
  const sizes = [];
  const brightness = [];

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a < 10 || lum < props.backgroundThreshold) continue;

      const px = (x / sw - 0.5) * worldWidth;
      const py = -(y / sh - 0.5) * worldHeight;
      positions.push(px, py, 0);
      const b01 = lum / 255;
      brightness.push(b01);
      sizes.push(0.5 + b01 * 1.1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute(
    "aBrightness",
    new THREE.Float32BufferAttribute(brightness, 1),
  );
  geo.setAttribute(
    "aHighlight",
    new THREE.Float32BufferAttribute(new Array(sizes.length).fill(0), 1),
  );

  return { geo, homes: new Float32Array(positions), sw };
}

function fitCamera() {
  if (!camera || !containerEl.value) return;
  // getBoundingClientRect (not clientWidth/Height) avoids a 0-or-huge read
  // before the surrounding layout has fully settled; clamp as a last resort.
  const rect = containerEl.value.getBoundingClientRect();
  const w = Math.min(Math.max(rect.width, 1), window.innerWidth);
  const h = Math.min(Math.max(rect.height, 1), window.innerHeight * 3);
  const containerAspect = w / h;
  const imageAspect = worldWidth / worldHeight;

  let viewW, viewH;
  if (props.fit === "cover") {
    // fill the container completely, cropping whichever axis overflows
    if (containerAspect > imageAspect) {
      viewW = worldWidth;
      viewH = viewW / containerAspect;
    } else {
      viewH = worldHeight;
      viewW = viewH * containerAspect;
    }
  } else {
    // keep the whole portrait visible, with a small margin
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
  if (reduceMotion) renderer.render(scene, camera); // keep the static frame in sync on resize
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
  const R = props.repelRadius;
  const S = props.repelStrength;
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
    dotWorldSize = (worldWidth / built.sw) * props.pointSize;
    points = new THREE.Points(geometry, material);
    scene.add(points);
    fitCamera();

    if (reduceMotion) {
      renderer.render(scene, camera); // static image, no listeners, no rAF loop
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
  overflow: hidden; /* the canvas can never visually escape this box */
}

.glitch-portrait__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
