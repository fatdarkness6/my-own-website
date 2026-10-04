<script setup lang="ts">
defineProps<{ active: boolean }>();

const visible = ref(true);
// Deterministic geometry keeps the server and client markup identical.
const traces = Array.from({ length: 12 }, (_, index) => {
  const width = 24 + index * 12;
  const height = 62 + index * 24;
  return {
    path: `M${144 - width} ${450 + height} C${126 - width} ${450 + height * 0.12} ${144 - width} ${450 - height} 144 ${450 - height} S${162 + width} ${450 + height * 0.12} ${144 + width} ${450 + height}`,
    delay: `${index * -0.8}s`,
  };
});
const cells = Array.from({ length: 48 }, (_, index) => ({
  x: 1216 + (index % 6) * 27,
  y: 318 + Math.floor(index / 6) * 31,
  width: 5 + ((index * 13) % 16),
  delay: `${index * -0.37}s`,
}));

function updateVisibility() {
  visible.value = !document.hidden;
}

onMounted(() => {
  updateVisibility();
  document.addEventListener("visibilitychange", updateVisibility);
});
onBeforeUnmount(() =>
  document.removeEventListener("visibilitychange", updateVisibility),
);
</script>

<template>
  <div
    class="about-background"
    :class="{ 'is-running': active && visible }"
    aria-hidden="true"
  >
    <div class="about-background__field">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="about-scan-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#60a5fa" stop-opacity="0" />
            <stop offset="1" stop-color="#60a5fa" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <path
          class="about-background__frame"
          d="M18 70h50m-50 0v76 M270 70h-50m50 0v76 M18 830h50m-50 0v-76 M270 830h-50m50 0v-76 M1170 70h50m-50 0v76 M1422 70h-50m50 0v76 M1170 830h50m-50 0v-76 M1422 830h-50m50 0v-76"
        />
        <path
          class="about-background__ruler"
          d="M8 190h20m-20 52h12m-12 52h12m-12 52h20m-20 52h12m-12 52h12m-12 52h20m-20 52h12m-12 52h12m-12 52h20 M1412 190h20m-12 52h12m-12 52h12m-20 52h20m-12 52h12m-12 52h12m-20 52h20m-12 52h12m-12 52h12m-20 52h20"
        />
        <g class="about-background__identity">
          <g
            v-for="trace in traces"
            :key="trace.path"
            :style="{ '--delay': trace.delay }"
          >
            <path class="about-background__trace" :d="trace.path" />
            <path
              class="about-background__impulse"
              :d="trace.path"
              pathLength="1000"
            />
          </g>
          <path
            class="about-background__trace"
            d="M136 484q-38 42-22 106m30-132q42 52 30 124m-42-72q-14 40 2 74"
          />
        </g>
        <g class="about-background__decode">
          <path
            class="about-background__frame"
            d="M1196 298h24m-24 0v24 M1390 298h-24m24 0v24 M1196 566h24m-24 0v-24 M1390 566h-24m24 0v-24"
          />
          <rect
            v-for="cell in cells"
            :key="`${cell.x}-${cell.y}`"
            class="about-background__cell"
            :x="cell.x"
            :y="cell.y"
            :width="cell.width"
            height="15"
            :style="{ '--delay': cell.delay }"
          />
          <path
            class="about-background__trace"
            d="M1204 618h26l12-18 17 42 15-27h27l10-15 16 29 14-11h39"
          />
          <path
            class="about-background__impulse"
            d="M1204 618h26l12-18 17 42 15-27h27l10-15 16 29 14-11h39"
            pathLength="1000"
          />
        </g>
        <g class="about-background__readout">
          <text x="42" y="104">IDENTITY / AS-001</text>
          <text x="24" y="804">AS / VERIFIED</text>
          <text x="1200" y="104">PROFILE / DECODE</text>
          <text x="1200" y="804">ARSAM.SYS / 01</text>
          <text x="1206" y="270">0101 / 0xA5</text>
          <text x="1206" y="686">SIGNAL / ACTIVE</text>
        </g>
        <g class="about-background__scanner">
          <rect
            x="0"
            y="88"
            width="290"
            height="54"
            fill="url(#about-scan-glow)"
          />
          <rect
            x="1150"
            y="88"
            width="290"
            height="54"
            fill="url(#about-scan-glow)"
          />
          <path d="M0 142h290 M1150 142h290" />
        </g>
      </svg>
      <div class="about-background__interrupt"><i /><i /><i /></div>
    </div>
  </div>
</template>

<style scoped>
.about-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.about-background__field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 0 50%, rgb(59 130 246 / 0.08), transparent 30%),
    radial-gradient(
      ellipse at 100% 50%,
      rgb(59 130 246 / 0.06),
      transparent 30%
    );
  mask-image: linear-gradient(
    90deg,
    #000,
    rgb(0 0 0 / 0.8) 9%,
    transparent 22%,
    transparent 78%,
    rgb(0 0 0 / 0.8) 91%,
    #000
  );
}
.about-background svg {
  display: block;
  width: 100%;
  height: 100%;
}
.about-background__frame,
.about-background__ruler,
.about-background__trace,
.about-background__impulse,
.about-background__scanner path {
  fill: none;
  stroke: #60a5fa;
  vector-effect: non-scaling-stroke;
}
.about-background__frame {
  stroke-opacity: 0.45;
}
.about-background__ruler {
  stroke-opacity: 0.3;
}
.about-background__trace {
  stroke-opacity: 0.3;
  stroke-width: 1.25;
}
.about-background__impulse {
  stroke-width: 2;
  stroke-opacity: 0.75;
  stroke-dasharray: 60 940;
  animation: about-identity-pulse 10s linear infinite;
  animation-delay: var(--delay, -2s);
}
.about-background__cell {
  fill: #3b82f6;
  animation: about-decode 7s steps(1, end) infinite;
  animation-delay: var(--delay);
}
.about-background__readout {
  fill: #93c5fd;
  opacity: 0.45;
  font: 10px var(--ui-font);
  letter-spacing: 1.5px;
}
.about-background__scanner {
  animation: about-identity-scan 9s linear infinite;
}
.about-background__scanner path {
  stroke-opacity: 0.7;
}
.about-background__interrupt {
  position: absolute;
  inset: 0;
  animation: about-signal-cut 12s steps(1, end) infinite;
}
.about-background__interrupt i {
  position: absolute;
  left: 0;
  top: 37%;
  width: 17%;
  height: 3px;
  background: #60a5fa;
  opacity: 0.55;
}
.about-background__interrupt i:nth-child(2) {
  left: auto;
  right: 0;
  top: 65%;
  width: 15%;
  height: 6px;
}
.about-background__interrupt i:nth-child(3) {
  top: 73%;
  width: 8%;
  height: 1px;
}
.about-background__impulse,
.about-background__cell,
.about-background__scanner,
.about-background__interrupt {
  animation-play-state: paused;
}
.is-running
  :is(
    .about-background__impulse,
    .about-background__cell,
    .about-background__scanner,
    .about-background__interrupt
  ) {
  animation-play-state: running;
}
@keyframes about-identity-pulse {
  to {
    stroke-dashoffset: -1000;
  }
}
@keyframes about-decode {
  0%,
  100% {
    opacity: 0.2;
  }
  18%,
  56% {
    opacity: 0.8;
  }
  22%,
  64% {
    opacity: 0.35;
  }
  24%,
  60% {
    opacity: 0.95;
  }
  72% {
    opacity: 0.15;
  }
}
@keyframes about-identity-scan {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  8%,
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(640px);
    opacity: 0;
  }
}
@keyframes about-signal-cut {
  0%,
  91%,
  95%,
  100% {
    opacity: 0;
    transform: translateX(0);
  }
  92%,
  96% {
    opacity: 1;
    transform: translateX(8px);
  }
  93%,
  97% {
    opacity: 0.3;
    transform: translateX(-5px);
  }
}
@media (max-width: 700px) {
  .about-background__field {
    opacity: 0.75;
    mask-image: linear-gradient(
      90deg,
      #000,
      rgb(0 0 0 / 0.4) 8%,
      transparent 18%,
      transparent 82%,
      rgb(0 0 0 / 0.4) 92%,
      #000
    );
  }
  .about-background__readout {
    display: none;
  }
  .about-background__trace {
    stroke-opacity: 0.4;
  }
}
@media (prefers-reduced-motion: reduce) {
  .about-background__impulse,
  .about-background__cell,
  .about-background__scanner,
  .about-background__interrupt {
    animation: none;
  }
  .about-background__cell {
    opacity: 0.4;
  }
  .about-background__scanner,
  .about-background__interrupt {
    display: none;
  }
}
@media print {
  .about-background {
    display: none !important;
  }
}
</style>
