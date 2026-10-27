<script setup lang="ts">
import { blogPosts } from "~/assets/data/blog";
import { identity } from "~/assets/data/identity";

definePageMeta({ readingMode: true });
const { c } = usePortfolioI18n();
usePortfolioSeo({ page: "blog", type: "CollectionPage", collection: "blog" });
const { element, line } = useViewportTyping(["label"], {
  onceKey: "blog-introduction", viewport: { threshold: 0 },
});
</script>

<template>
  <div id="blog-main" ref="element" class="blog-page">
    <div class="blog-filebar"><span>{{ c('ARSAM / ENGINEERING NOTES') }}</span><span>{{ String(blogPosts.length).padStart(2, '0') }} {{ c('ARTICLE') }}</span></div>
    <header class="blog-intro">
      <p class="blog-label"><AnimationTypedLine :text="c('// IDEAS, DECISIONS & LESSONS FROM BUILDING')" :speed="12" v-bind="line('label')" /></p>
      <h1>{{ c('ENGINEERING NOTES.') }}</h1>
      <p class="blog-intro__description">{{ c('Notes on web applications, backend systems and the work behind my projects.') }}</p>
    </header>
    <section class="blog-posts" aria-labelledby="blog-latest">
      <div class="blog-sectionbar"><h2 id="blog-latest">{{ c('LATEST ARTICLE') }}</h2><span dir="ltr">{{ String(blogPosts.length).padStart(2, '0') }}</span></div>
      <div class="blog-grid">
        <CommonHackerReveal v-for="(post, index) in blogPosts" :key="post.id" :show="true" :duration="460"><BlogPostCard :post="post" :number="index + 1" /></CommonHackerReveal>
      </div>
    </section>
    <footer class="blog-footer"><p>{{ c('More notes as the work continues.') }}</p><a :href="identity.contact.linkedin" target="_blank" rel="noopener noreferrer">{{ c('LinkedIn') }} <span aria-hidden="true">↗</span><span class="blog-sr-only">{{ c('(opens in a new tab)') }}</span></a></footer>
  </div>
</template>

<style src="~/assets/css/pages/blog.css"></style>
