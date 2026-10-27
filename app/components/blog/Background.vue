<script setup lang="ts">
const props = defineProps<{ active: boolean; readingProgress?: number }>();
const { visible, reducedMotion } = useAnimationEnvironment();
const readingStyle = computed(() => {
  const progress = Math.min(1, Math.max(0, props.readingProgress ?? 0));
  return {
    "--blog-scroll-shift": `${-progress * 110}px`,
    "--blog-scroll-return": `${-76 + progress * 110}px`,
    "--blog-scroll-packet": `${-progress * 978}`,
  };
});

// Static diff hunks: identical markup during SSR/hydration, no render loop or WebGL.
const hunks = Array.from({ length: 3 }, (_, index) => ({
  id: index,
  y: 150 + index * 236,
  delay: `${index * -4.3}s`,
  hash: ["a71f09", "c3d82e", "f06b41"][index],
  rows: Array.from({ length: 6 }, (_, row) => ({
    number: String(index * 6 + row + 1).padStart(2, "0"),
    changed: row === 2 || row === 3,
    width: 45 + ((row * 31 + index * 17) % 90),
    indent: row === 1 || row === 4 ? 14 : 0,
  })),
}));
</script>

<template>
  <div class="blog-background" :class="{ 'is-running': active && visible && !reducedMotion, 'is-reading': readingProgress !== undefined }" :style="readingStyle" aria-hidden="true">
    <div class="blog-background__field">
      <div v-for="side in ['left', 'right']" :key="side" class="blog-background__rail" :class="`blog-background__rail--${side}`">
        <svg viewBox="0 0 280 900" preserveAspectRatio="none" focusable="false" direction="ltr">
          <path class="blog-background__spine" d="M22 0v900" />
          <g v-for="hunk in hunks" :key="hunk.id" :transform="`translate(0 ${hunk.y})`" :style="{ '--delay': hunk.delay }" :class="{ 'is-current': readingProgress !== undefined && hunk.id === Math.min(2, Math.floor(readingProgress * 3)) }">
            <path class="blog-background__branch" d="M22 0h14l12 12h202l14 14v144l-14 14H48l-12-12H22" />
            <rect class="blog-background__node" x="18" y="-4" width="8" height="8" />
            <text class="blog-background__hash" x="48" y="-12">{{ hunk.hash }} / .patch</text>
            <g class="blog-background__hunk">
              <text class="blog-background__syntax" x="50" y="34">@@ -18,6 +18,8 @@</text>
              <g v-for="(row, index) in hunk.rows" :key="row.number" :transform="`translate(0 ${52 + index * 19})`" :class="{ 'blog-background__addition': row.changed }">
                <rect v-if="row.changed" class="blog-background__highlight" x="44" y="-5" width="206" height="16" />
                <text class="blog-background__number" x="50" y="5">{{ row.number }}</text>
                <text v-if="row.changed" class="blog-background__plus" x="74" y="5">+</text>
                <path class="blog-background__code" :d="`M${90 + row.indent} 0h${row.width} m6 0h12`" />
              </g>
              <rect class="blog-background__cursor" x="244" y="27" width="3" height="12" />
            </g>
          </g>
          <path class="blog-background__packet" d="M22 0v900" pathLength="1000" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-background { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.blog-background__field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 0 35%, rgb(59 130 246 / 9%), transparent 35%), radial-gradient(ellipse at 100% 75%, rgb(59 130 246 / 7%), transparent 35%);
  mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / 65%) 12%, transparent 34%, transparent 66%, rgb(0 0 0 / 65%) 88%, #000);
}
/* These decorative code islands stay LTR; the actual page follows its locale. */
/*rtl:begin:ignore*/
.blog-background__rail { position: absolute; top: 0; bottom: 0; width: clamp(160px, 24vw, 350px); direction: ltr; }
.blog-background__rail--left { left: 0; }
.blog-background__rail--right { right: 0; transform: translateY(-76px); }
/*rtl:end:ignore*/
.blog-background svg { display: block; width: 100%; height: 100%; }
.blog-background__spine, .blog-background__branch, .blog-background__packet { fill: none; stroke: #3b82f6; vector-effect: non-scaling-stroke; }
.blog-background__spine { stroke-opacity: .24; stroke-dasharray: 2 8; }
.blog-background__branch { stroke-opacity: .42; }
.blog-background__node { fill: #60a5fa; opacity: .65; }
.blog-background__hash, .blog-background__syntax, .blog-background__number, .blog-background__plus { font: 10px ui-monospace, monospace; fill: #93c5fd; }
.blog-background__hash { letter-spacing: 1.5px; opacity: .65; }
.blog-background__syntax { fill: #60a5fa; opacity: .8; }
.blog-background__number { opacity: .4; }
.blog-background__code { stroke: #6383ac; stroke-width: 3; stroke-opacity: .5; vector-effect: non-scaling-stroke; }
.blog-background__addition .blog-background__code { stroke: #60a5fa; stroke-opacity: .8; }
.blog-background__highlight { fill: #3b82f6; opacity: .1; }
.blog-background__cursor { fill: #bfdbfe; animation: blog-revision-cursor 13s steps(1, end) infinite; animation-delay: var(--delay); }
.blog-background__hunk { animation: blog-revision-write 13s steps(1, end) infinite; animation-delay: var(--delay); }
.blog-background__packet { stroke: #93c5fd; stroke-width: 2; stroke-opacity: .65; stroke-dasharray: 22 978; animation: blog-revision-packet 16s linear infinite; }
.blog-background__rail--right :is(.blog-background__hunk, .blog-background__cursor) { animation-direction: reverse; }
.blog-background__rail--right .blog-background__packet { animation-delay: -8s; }
.blog-background :is(.blog-background__hunk, .blog-background__cursor, .blog-background__packet) { animation-play-state: paused; }
.blog-background.is-running :is(.blog-background__hunk, .blog-background__cursor, .blog-background__packet) { animation-play-state: running; }
/* Article mode is scrubbed by the same reading state as its contents rail. */
.is-reading .blog-background__rail--left { transform: translateY(var(--blog-scroll-shift)); }
.is-reading .blog-background__rail--right { transform: translateY(var(--blog-scroll-return)); }
.is-reading .blog-background__hunk { animation: none; opacity: .25; }
.is-reading .is-current .blog-background__hunk { opacity: 1; }
.is-reading .is-current .blog-background__branch { stroke-opacity: .85; }
.is-reading .blog-background__cursor { display: none; }
.is-reading .blog-background__packet { animation: none; stroke-dashoffset: var(--blog-scroll-packet); }
@keyframes blog-revision-write {
  0%, 82%, 100% { opacity: .65; clip-path: inset(0); }
  84% { opacity: .3; clip-path: inset(0 0 75% 0); }
  86% { opacity: 1; clip-path: inset(0 0 50% 0); }
  88% { clip-path: inset(0 0 22% 0); }
  90%, 96% { opacity: 1; clip-path: inset(0); }
}
@keyframes blog-revision-cursor {
  0%, 81%, 97%, 100% { opacity: 0; transform: translateY(0); }
  84% { opacity: 1; transform: translateY(24px); }
  86% { transform: translateY(62px); }
  88% { transform: translateY(100px); }
  90%, 95% { transform: translateY(119px); }
}
@keyframes blog-revision-packet { to { stroke-dashoffset: -1000; } }
@media (max-width: 767px) {
  .blog-background__field { opacity: .7; mask-image: linear-gradient(90deg, #000, transparent 25%, transparent 75%, #000); }
  .blog-background__hash, .blog-background__syntax, .blog-background__number, .blog-background__plus { display: none; }
  .blog-background__rail--right { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .is-reading .blog-background__rail { transform: none; }
  .blog-background :is(.blog-background__hunk, .blog-background__cursor, .blog-background__packet) { animation: none; }
  .blog-background__cursor, .blog-background__packet { display: none; }
}
@media print { .blog-background { display: none !important; } }
</style>
