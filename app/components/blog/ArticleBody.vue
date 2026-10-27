<script setup lang="ts">
import { copyToClipboard } from "quasar";
import type { BlogVersion } from "~/assets/data/blog";

defineProps<{ version: BlogVersion }>();
const { c } = usePortfolioI18n();
const feedback = ref("");
async function copyCode(code: string) {
  try { await copyToClipboard(code); feedback.value = c('Code copied'); }
  catch { feedback.value = c('Select the code to copy it.'); }
}
</script>

<template>
  <div class="blog-prose">
    <section v-for="section in version.sections" :id="section.id" :key="section.id" class="blog-prose__section">
      <h2>{{ section.title }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      <ul v-if="section.items"><li v-for="item in section.items" :key="item">{{ item }}</li></ul>
      <div v-if="section.code" class="blog-code" dir="ltr">
        <div class="blog-code__bar"><span>Next.js / TypeScript</span><q-btn flat dense no-caps no-ripple :label="c('Copy code')" @click="copyCode(section.code)" /></div>
        <pre><code>{{ section.code }}</code></pre>
      </div>
      <aside v-if="section.callout" class="blog-callout">{{ section.callout }}</aside>
    </section>
    <span class="blog-feedback" role="status">{{ feedback }}</span>
  </div>
</template>
