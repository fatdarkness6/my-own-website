<script setup lang="ts">
import { copyToClipboard } from "quasar";
import type { BlogVersion } from "~/assets/data/blog";
import ArticleFigure from "~/components/blog/ArticleFigure.vue";

defineProps<{ version: BlogVersion; activeSection?: string }>();
const { c } = usePortfolioI18n();
const feedback = ref("");
async function copyCode(code: string) {
  try { await copyToClipboard(code); feedback.value = c('Code copied'); }
  catch { feedback.value = c('Select the code to copy it.'); }
}
</script>

<template>
  <div class="blog-prose">
    <section v-for="(section, index) in version.sections" :id="section.id" :key="section.id" class="blog-prose__section" :class="{ 'is-current': activeSection === section.id }" :aria-labelledby="`${section.id}-heading`">
      <header class="blog-prose__heading">
        <span class="blog-prose__number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
        <h2 :id="`${section.id}-heading`">{{ section.title }}</h2>
      </header>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      <ul v-if="section.items"><li v-for="item in section.items" :key="item">{{ item }}</li></ul>
      <div v-if="section.code" class="blog-code" dir="ltr">
        <div class="blog-code__bar"><span>{{ section.codeLabel || c('Source code') }}</span><q-btn flat dense no-caps no-ripple :label="c('Copy code')" @click="copyCode(section.code)" /></div>
        <pre><code>{{ section.code }}</code></pre>
      </div>
      <ArticleFigure v-if="section.visual" :visual="section.visual" :active="activeSection === section.id" />
      <aside v-if="section.callout" class="blog-callout"><q-icon name="info_outline" size="20px" aria-hidden="true" /><p>{{ section.callout }}</p></aside>
    </section>
    <span class="blog-feedback" role="status">{{ feedback }}</span>
  </div>
</template>
