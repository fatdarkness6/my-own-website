<script setup lang="ts">
defineProps<{ active: boolean }>();

const visible = ref(true);
const tracks = [
  "M24 900V660L100 584V370L42 312V0",
  "M112 900V750L176 686V448L116 388V160L180 96V0",
  "M214 900V814L264 764V562L204 502V270L264 210V0",
  "M1416 900V660L1340 584V370L1398 312V0",
  "M1328 900V750L1264 686V448L1324 388V160L1260 96V0",
  "M1226 900V814L1176 764V562L1236 502V270L1176 210V0",
];

function updateVisibility() {
  visible.value = !document.hidden;
}

onMounted(() => {
  updateVisibility();
  document.addEventListener("visibilitychange", updateVisibility);
});
onBeforeUnmount(() => document.removeEventListener("visibilitychange", updateVisibility));
</script>

<template>
  <div class="contact-background" :class="{ 'is-running': active && visible }" aria-hidden="true">
    <div class="contact-background__viewport">
      <svg class="contact-background__traffic" viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">
        <g v-for="(track, index) in tracks" :key="track" :style="{ '--delay': `${index * -1.7}s`, '--duration': `${9 + index}s` }">
          <path class="contact-background__track" :d="track" />
          <path class="contact-background__packet" :d="track" pathLength="1000" />
        </g>
        <g class="contact-background__nodes">
          <path d="M94 578h12v12H94z M198 496h12v12H198z M1334 578h12v12h-12z M1230 382h12v12h-12z" />
          <path d="M26 96h52m-26-26v52 M1352 764h52m-26-26v52" fill="none" />
        </g>
        <g class="contact-background__readouts">
          <text x="24" y="220">TX / 0xA5</text>
          <text x="144" y="820">1010 0110</text>
          <text x="1280" y="140">RX / 0x0F</text>
          <text x="1300" y="720">0101 1001</text>
        </g>
      </svg>
      <div class="contact-background__cuts"><i /><i /><i /></div>
    </div>
  </div>
</template>

<style scoped>
.contact-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.contact-background__viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.85) 18%, rgb(0 0 0 / 0.15) 34%, rgb(0 0 0 / 0.15) 66%, rgb(0 0 0 / 0.85) 82%, #000);
}
.contact-background__traffic { display: block; width: 100%; height: 100%; }
.contact-background__track { fill: none; stroke: #3b82f6; stroke-opacity: 0.32; stroke-width: 1.25; vector-effect: non-scaling-stroke; }
.contact-background__packet {
  fill: none;
  stroke: #60a5fa;
  stroke-width: 2.5;
  stroke-opacity: 0.85;
  stroke-dasharray: 22 478;
  vector-effect: non-scaling-stroke;
  animation: contact-packet var(--duration) linear infinite;
  animation-delay: var(--delay);
}
.contact-background__nodes { fill: #3b82f6; fill-opacity: 0.32; stroke: #60a5fa; stroke-opacity: 0.55; }
.contact-background__readouts { fill: #60a5fa; opacity: 0.45; font: 11px var(--ui-font); letter-spacing: 2px; }
.contact-background__cuts { position: absolute; inset: 0; animation: contact-cuts 11s steps(1, end) infinite; }
.contact-background__cuts i { position: absolute; width: 15%; height: 3px; background: #3b82f6; opacity: 0.4; }
.contact-background__cuts i:nth-child(1) { left: 0; top: 28%; }
.contact-background__cuts i:nth-child(2) { right: 0; top: 63%; width: 22%; }
.contact-background__cuts i:nth-child(3) { left: 8%; top: 85%; width: 7%; }
.contact-background__packet, .contact-background__cuts { animation-play-state: paused; }
.is-running .contact-background__packet, .is-running .contact-background__cuts { animation-play-state: running; }
@keyframes contact-packet { to { stroke-dashoffset: -1000; } }
@keyframes contact-cuts {
  0%, 92%, 96%, 100% { opacity: 0; transform: translateX(0); }
  93%, 97% { opacity: 1; transform: translateX(-8px); }
  94%, 98% { opacity: 0.3; transform: translateX(6px); }
}
@media (max-width: 700px) {
  .contact-background__viewport { opacity: 0.9; mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.7) 18%, transparent 32%, transparent 68%, rgb(0 0 0 / 0.7) 82%, #000); }
  .contact-background__readouts { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .contact-background__packet, .contact-background__cuts { animation: none; }
  .contact-background__cuts { display: none; }
}
</style>
