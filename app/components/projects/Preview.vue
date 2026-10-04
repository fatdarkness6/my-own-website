<script setup lang="ts">
import type { Project, ProjectScreenshot } from "~/assets/data/projects";
defineProps<{
  name: string;
  category: Project["category"];
  screenshot?: ProjectScreenshot;
  compact?: boolean;
  sourceOnly?: boolean;
}>();
</script>

<template>
  <div class="project-preview" :class="{ 'project-preview--compact': compact }">
    <img
      v-if="screenshot"
      :src="screenshot.src"
      :alt="compact ? '' : screenshot.alt"
      width="1270"
      height="714"
      decoding="async"
      :loading="compact ? 'lazy' : 'eager'"
    />
    <div v-else class="project-preview__cover">
      <div class="project-preview__art" aria-hidden="true">
        <span class="project-preview__orbit" />
        <q-icon :name="category === 'ai' ? 'description' : 'web'" />
        <span class="project-preview__cross project-preview__cross--first"
          >+</span
        >
        <span class="project-preview__cross project-preview__cross--last"
          >+</span
        >
      </div>
      <strong>{{ name }}</strong>
      <span class="project-preview__caption">{{
        sourceOnly ? "BACKEND API / SOURCE AVAILABLE" : compact ? "PROJECT COVER" : "PROJECT COVER / SCREENSHOT COMING SOON"
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.project-preview {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  background: #080f1b;
}
.project-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.project-preview__cover {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background:
    radial-gradient(ellipse at center, #193b68, transparent 68%),
    repeating-linear-gradient(0deg, transparent 0 35px, #14243a 36px),
    repeating-linear-gradient(90deg, transparent 0 35px, #14243a 36px);
}
.project-preview__art {
  position: relative;
  display: grid;
  place-items: center;
  width: 100px;
  height: 100px;
  color: #8fbfff;
}
.project-preview__art .q-icon {
  font-size: 48px;
}
.project-preview__orbit {
  position: absolute;
  inset: 0;
  border: 1px solid #5482ba;
  transform: rotate(45deg);
  box-shadow: 0 0 0 16px rgb(59 130 246 / 7%);
}
.project-preview__cross {
  position: absolute;
  font: 20px var(--ui-font);
}
.project-preview__cross--first {
  left: -50px;
  top: 0;
}
.project-preview__cross--last {
  right: -50px;
  bottom: 0;
}
.project-preview__cover strong {
  margin-top: 16px;
  text-align: center;
  color: #dbeafe;
  font: 600 clamp(1rem, 2vw, 1.6rem)/1.3 var(--ui-font);
}
.project-preview__caption {
  color: #a4bad7;
  text-align: center;
  font: 500 0.65rem/1.6 var(--ui-font);
  letter-spacing: 0.06em;
}
.project-preview--compact .project-preview__cover {
  gap: 8px;
  padding: 12px;
}
.project-preview--compact .project-preview__art {
  width: 30px;
  height: 30px;
}
.project-preview--compact .q-icon {
  font-size: 22px;
}
.project-preview--compact strong {
  margin-top: 8px;
  font-size: 0.7rem;
}
.project-preview--compact .project-preview__caption {
  display: none;
}
@media (max-width: 540px) {
  .project-preview__cover {
    gap: 8px;
    padding: 14px;
  }
  .project-preview__art {
    width: 44px;
    height: 44px;
  }
  .project-preview__art .q-icon {
    font-size: 28px;
  }
  .project-preview__cover strong {
    margin-top: 12px;
    font-size: 0.875rem;
  }
  .project-preview__caption {
    font-size: 0.5625rem;
  }
  .project-preview--compact .project-preview__art {
    width: 24px;
    height: 24px;
  }
  .project-preview--compact strong {
    font-size: 0.625rem;
  }
}
</style>
