<script setup lang="ts">
import type { BlogVisual } from "~/assets/data/blog";
import { projects } from "~/assets/data/projects";
import GlitchCard from "~/components/Animation/GlitchCard.vue";

const props = defineProps<{ visual: BlogVisual; active: boolean }>();
const { c } = usePortfolioI18n();
const project = computed(() => {
  const visual = props.visual;
  return visual.kind === "project" ? projects.find(({ id }) => id === visual.projectId) : undefined;
});
</script>

<template>
  <figure class="article-figure" :class="[`article-figure--${visual.kind}`, { 'is-current': active }]">
    <template v-if="visual.kind === 'project' && project?.screenshot">
      <div class="article-figure__bar"><span>{{ project.name }}</span><q-icon name="web_asset" size="18px" aria-hidden="true" /></div>
      <div class="article-figure__image" :style="{ aspectRatio: `${project.screenshot.width || 16} / ${project.screenshot.height || 9}` }">
        <GlitchCard :image="project.screenshot.optimizedSrc || project.screenshot.src" media-only fit="contain" :interval="0">
          <template #image><img :src="project.screenshot.optimizedSrc || project.screenshot.src" :alt="c(project.screenshot.alt)" :width="project.screenshot.width" :height="project.screenshot.height" loading="lazy" decoding="async" /></template>
        </GlitchCard>
      </div>
    </template>
    <template v-else-if="visual.kind === 'flow'">
      <div class="article-figure__bar"><span>{{ visual.title }}</span><q-icon name="account_tree" size="18px" aria-hidden="true" /></div>
      <ol class="article-flow">
        <li v-for="(step, index) in visual.steps" :key="index">
          <span class="article-flow__index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ step.title }}</strong><span>{{ step.detail }}</span>
        </li>
      </ol>
    </template>
    <template v-else-if="visual.kind === 'metrics'">
      <div class="article-figure__bar"><span>{{ visual.title }}</span><q-icon name="speed" size="18px" aria-hidden="true" /></div>
      <dl class="article-metrics">
        <div v-for="(item, index) in visual.items" :key="index"><dt>{{ item.label }}</dt><dd><bdi dir="ltr">{{ item.value }}</bdi></dd></div>
      </dl>
    </template>
    <figcaption>{{ visual.caption }}</figcaption>
  </figure>
</template>
