<script setup lang="ts">
const props = defineProps<{ active: boolean; fileNumber: string }>();
const canvasEl = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
let disposed = false;
let initializing = false;
let release = () => {};
let syncRunning = () => {};
let repaint = () => {};

async function initialize() {
  if (initializing || disposed || !canvasEl.value || !props.active) return;
  initializing = true;
  try {
    const THREE = await import("three");
    if (disposed || !canvasEl.value) return;
    const canvas = canvasEl.value;
    const context = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!context) return;
    const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.z = 14;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const box = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(box);
    const faces = new THREE.MeshBasicMaterial({ color: 0x0a2550, transparent: true, opacity: 0.32, depthWrite: false });
    const outlines = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.78 });
    const coreLines = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.68 });
    const chipMaterial = new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.65 });
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const cageMaterial = new THREE.LineDashedMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.28, dashSize: 0.12, gapSize: 0.1 });
    const cageEdges = edges.clone();
    const dummy = new THREE.Object3D();
    const assemblies = [0, 1].map((side) => {
      const group = new THREE.Group();
      scene.add(group);
      const core = new THREE.Group();
      const solid = new THREE.Mesh(box, faces);
      solid.scale.set(1.1, 2, 1.1);
      const wire = new THREE.LineSegments(edges, coreLines);
      wire.scale.copy(solid.scale);
      core.add(solid, wire);
      group.add(core);
      const cage = new THREE.LineSegments(cageEdges, cageMaterial);
      cage.scale.set(2.6, 5.3, 2.4);
      cage.computeLineDistances();
      group.add(cage);
      const layers = Array.from({ length: 5 }, (_, index) => {
        const plate = new THREE.Group();
        const surface = new THREE.Mesh(box, faces);
        surface.scale.set(2.6, 0.08, 2);
        const border = new THREE.LineSegments(edges, outlines);
        border.scale.copy(surface.scale);
        plate.add(surface, border);
        for (let chipIndex = 0; chipIndex < 3; chipIndex++) {
          const chip = new THREE.Mesh(box, chipMaterial);
          chip.scale.set(0.38, 0.16, 0.5);
          chip.position.set(-0.85 + chipIndex * 0.8, 0.11, (index % 2 ? 1 : -1) * 0.45);
          plate.add(chip);
        }
        group.add(plate);
        return plate;
      });
      const particles = new THREE.InstancedMesh(box, particleMaterial, 18);
      particles.frustumCulled = false;
      group.add(particles);
      return { group, core, cage, layers, particles, side };
    });
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let mobile = false;
    let contextLost = false;

    function draw(time: number) {
      const file = Number(props.fileNumber) || 1;
      for (const assembly of assemblies) {
        const { group, core, cage, layers, particles, side } = assembly;
        const direction = side ? -1 : 1;
        const cycle = (time + side * 3 + file * 0.7) % 11;
        const crash = !motion.matches && cycle > 9.6 && cycle < 9.8;
        group.rotation.set(0.22 + Math.sin(time * 0.12 + side) * 0.08, direction * (0.5 + time * 0.075), direction * 0.13);
        core.rotation.y = -time * 0.1;
        core.position.x = crash ? (Math.floor(time * 25) % 2 ? 0.22 : -0.22) : 0;
        cage.rotation.y = -time * 0.04;
        layers.forEach((layer, index) => {
          layer.position.y = (index - 2) * (0.95 + Math.sin(time * 0.35 + side) * 0.1);
          layer.position.x = crash ? (index % 2 ? 0.3 : -0.3) : Math.sin(time * 0.22 + index) * 0.1;
          layer.rotation.y = Math.sin(time * 0.18 + index) * 0.09;
        });
        for (let index = 0; index < 18; index++) {
          dummy.position.set(index % 2 ? 1.18 : -1.18, ((time * 0.7 + index * 0.43) % 5.2) - 2.6, (index % 3 - 1) * 0.8);
          dummy.scale.set(0.035, 0.13, 0.035);
          dummy.updateMatrix();
          particles.setMatrixAt(index, dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;
      }
      renderer.render(scene, camera);
    }

    function resize() {
      const bounds = canvas.parentElement!.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      mobile = bounds.width <= 700;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25));
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
      assemblies.forEach(({ group, side }) => {
        group.position.set((side ? 1 : -1) * halfWidth * 0.85, side ? -0.7 : 1.3, 0);
        group.scale.setScalar(mobile ? 0.72 : 1);
      });
      if (!contextLost) draw(motion.matches ? 0 : elapsed);
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      const interval = 1000 / (mobile ? 20 : 30);
      if (lastFrame && now - lastFrame < interval) return;
      if (lastFrame) elapsed += Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      draw(elapsed);
    }

    syncRunning = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (disposed || contextLost || document.hidden) return;
      draw(motion.matches ? 0 : elapsed);
      if (props.active && !motion.matches) frame = requestAnimationFrame(tick);
    };
    repaint = () => { if (!disposed && !contextLost && !document.hidden) draw(motion.matches ? 0 : elapsed); };
    const onLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      ready.value = false;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onRestored = () => {
      if (disposed) return;
      contextLost = false;
      ready.value = true;
      resize();
      syncRunning();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    document.addEventListener("visibilitychange", syncRunning);
    motion.addEventListener("change", syncRunning);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    release = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncRunning);
      motion.removeEventListener("change", syncRunning);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      assemblies.forEach(({ particles }) => particles.dispose());
      box.dispose();
      edges.dispose();
      cageEdges.dispose();
      [faces, outlines, coreLines, chipMaterial, particleMaterial, cageMaterial].forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
    resize();
    ready.value = true;
    syncRunning();
  } catch {
    // The static CSS assembly stays visible if WebGL is unavailable.
    release();
    ready.value = false;
  }
}

watch(() => props.active, (active) => {
  if (active) void initialize();
  syncRunning();
});
watch(() => props.fileNumber, () => repaint());
onMounted(() => { if (props.active) void initialize(); });
onBeforeUnmount(() => {
  disposed = true;
  release();
});
</script>

<template>
  <div class="projects-background" :class="{ 'is-ready': ready }" aria-hidden="true">
    <div class="projects-background__field">
      <canvas ref="canvasEl" />
      <div class="projects-background__fallback"><i /><i /></div>
      <div class="projects-background__readout projects-background__readout--left"><span>ARTIFACT / {{ fileNumber }}</span><i /><small>SOURCE → SYSTEM</small></div>
      <div class="projects-background__readout projects-background__readout--right"><span>BUILD / ASSEMBLY</span><i /><small>[ ARSAM.SYS ]</small></div>
    </div>
  </div>
</template>

<style scoped>
.projects-background { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.projects-background__field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 0 35%, rgb(29 78 216 / 0.12), transparent 28%), radial-gradient(ellipse at 100% 60%, rgb(29 78 216 / 0.12), transparent 28%);
  mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.9) 14%, transparent 31%, transparent 69%, rgb(0 0 0 / 0.9) 86%, #000);
}
.projects-background canvas { display: block; width: 100%; height: 100%; opacity: 0; }
.is-ready canvas { opacity: 1; }
.projects-background__fallback { position: absolute; inset: 0; }
.projects-background__fallback i { position: absolute; left: -20px; top: 22%; width: 180px; height: 280px; border: 1px solid #3b82f6; transform: skewY(-18deg); background: repeating-linear-gradient(0deg, transparent 0 52px, rgb(96 165 250 / 0.25) 53px 54px); opacity: 0.4; }
.projects-background__fallback i:last-child { left: auto; right: -20px; top: 48%; transform: skewY(18deg); }
.is-ready .projects-background__fallback { display: none; }
.projects-background__readout { position: absolute; color: #60a5fa; font: 500 10px/1.8 var(--ui-font); letter-spacing: 0.1em; opacity: 0.65; }
.projects-background__readout--left { top: 18%; left: 2%; }
.projects-background__readout--right { bottom: 14%; right: 2%; text-align: right; }
.projects-background__readout i { display: block; height: 3px; width: 72px; margin: 8px 0; background: repeating-linear-gradient(90deg, #3b82f6 0 8px, transparent 8px 11px); }
.projects-background__readout--right i { margin-left: auto; }
.projects-background__readout small { font: inherit; color: #8aa8d0; font-size: 9px; }
@media (max-width: 700px) {
  .projects-background__field { mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.55) 18%, transparent 31%, transparent 69%, rgb(0 0 0 / 0.55) 82%, #000); }
  .projects-background__readout { display: none; }
}
@media print { .projects-background { display: none !important; } }
</style>
