<script setup lang="ts">
defineProps<{ active: boolean }>();

const visible = ref(true);
const records = Array.from({ length: 11 }, (_, index) => ({
  y: 92 + index * 68,
  width: 60 + ((index * 29) % 120),
  delay: `${index * -1.3}s`,
  number: String(index + 1).padStart(2, "0"),
}));

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
  <div class="resume-background" :class="{ 'is-running': active && visible }" aria-hidden="true">
    <div class="resume-background__field">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">
        <path class="resume-background__ruler" d="M28 0V900 M1412 0V900" />
        <g v-for="record in records" :key="record.number" :style="{ '--delay': record.delay }">
          <path class="resume-background__tick" :d="`M18 ${record.y}h20 M1402 ${record.y}h20`" />
          <g class="resume-background__record">
            <path class="resume-background__bracket" :d="`M64 ${record.y - 12}h-8v38h8 M246 ${record.y - 12}h8v38h-8 M1194 ${record.y - 12}h-8v38h8 M1376 ${record.y - 12}h8v38h-8`" />
            <rect class="resume-background__bar" x="76" :y="record.y" :width="record.width" height="3" />
            <rect class="resume-background__bar" :x="1364 - record.width" :y="record.y" :width="record.width" height="3" />
            <path class="resume-background__detail" :d="`M76 ${record.y + 12}h34m8 0h16m8 0h48 M1238 ${record.y + 12}h48m8 0h16m8 0h46`" />
            <text class="resume-background__index" x="34" :y="record.y + 4">{{ record.number }}</text>
          </g>
        </g>
        <path class="resume-background__ruler" d="M0 46h290 M1150 46h290 M0 854h290 M1150 854h290" />
        <text class="resume-background__caption" x="76" y="36">CV / ARCHIVE</text>
        <text class="resume-background__caption" x="1206" y="876">RECORD / A.S</text>
      </svg>
      <div class="resume-background__scan" />
      <div class="resume-background__glitch"><i /><i /></div>
    </div>
  </div>
</template>

<style scoped>
.resume-background { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.resume-background__field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.8) 16%, transparent 29%, transparent 71%, rgb(0 0 0 / 0.8) 84%, #000);
}
.resume-background svg { display: block; width: 100%; height: 100%; }
.resume-background__ruler, .resume-background__tick { fill: none; stroke: #3b82f6; stroke-opacity: 0.35; vector-effect: non-scaling-stroke; }
.resume-background__tick { stroke-opacity: 0.65; }
.resume-background__bracket { fill: none; stroke: #60a5fa; stroke-opacity: 0.4; vector-effect: non-scaling-stroke; }
.resume-background__bar { fill: #60a5fa; fill-opacity: 0.65; }
.resume-background__detail { stroke: #3b82f6; stroke-opacity: 0.45; stroke-width: 2; vector-effect: non-scaling-stroke; }
.resume-background__index, .resume-background__caption { fill: #93c5fd; opacity: 0.4; font: 10px var(--ui-font); letter-spacing: 2px; }
.resume-background__record { animation: resume-record 12s steps(1, end) infinite; animation-delay: var(--delay); }
.resume-background__scan {
  position: absolute;
  inset: -100% 0 100%;
  background: linear-gradient(transparent 45%, rgb(59 130 246 / 0.07) 49.5%, rgb(96 165 250 / 0.5) 50%, transparent 50.3%);
  animation: resume-scan 16s linear infinite;
}
.resume-background__glitch { position: absolute; inset: 0; animation: resume-archive-cut 13s steps(1, end) infinite; }
.resume-background__glitch i { position: absolute; left: 0; top: 34%; width: 18%; height: 4px; background: #60a5fa; opacity: 0.35; }
.resume-background__glitch i:last-child { left: auto; right: 0; top: 71%; width: 12%; }
.resume-background__record, .resume-background__scan, .resume-background__glitch { animation-play-state: paused; }
.is-running .resume-background__record, .is-running .resume-background__scan, .is-running .resume-background__glitch { animation-play-state: running; }
@keyframes resume-record {
  0%, 38%, 100% { opacity: 0.45; }
  39%, 48% { opacity: 1; }
  42%, 45% { opacity: 0.65; }
  70%, 74% { opacity: 0.7; }
}
@keyframes resume-scan { to { transform: translateY(200%); } }
@keyframes resume-archive-cut {
  0%, 93%, 97%, 100% { opacity: 0; transform: translateX(0); }
  94%, 98% { opacity: 1; transform: translateX(5px); }
  95%, 99% { opacity: 0.3; transform: translateX(-4px); }
}
@media (max-width: 700px) {
  .resume-background__field { opacity: 0.85; mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 0.6) 17%, transparent 28%, transparent 72%, rgb(0 0 0 / 0.6) 83%, #000); }
  .resume-background__index, .resume-background__caption { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .resume-background__record, .resume-background__scan, .resume-background__glitch { animation: none; }
  .resume-background__scan, .resume-background__glitch { display: none; }
}
@media print { .resume-background { display: none !important; } }
</style>
