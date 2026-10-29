<script setup lang="ts">
import BlogBackground from "~/components/blog/Background.vue";
import { blogPosts } from "~/assets/data/blog";
import { identity } from "~/assets/data/identity";

definePageMeta({ readingMode: true });
const { c } = usePortfolioI18n();
const titleSegments = useBlogTitle(8500);
usePortfolioSeo({ page: "blog", type: "CollectionPage", collection: "blog" });
const { element, line, started } = useViewportTyping(["label", "title", "description"], {
  onceKey: "blog-introduction", viewport: { threshold: 0 },
});
</script>

<template>
  <div id="blog-main" class="blog-page">
    <BlogBackground :active="started" />
    <div class="blog-filebar"><span><CommonPageGlitch :text="c('ARSAM / ENGINEERING NOTES')" :interval="14000" /></span><span>{{ String(blogPosts.length).padStart(2, '0') }} {{ c('ARTICLE') }}</span></div>
    <header ref="element" class="blog-intro">
      <p class="blog-label"><AnimationTypedLine :text="c('// IDEAS, DECISIONS & LESSONS FROM BUILDING')" :speed="12" :glitch="11000" v-bind="line('label')" /></p>
      <h1><AnimationSegmentedLine :segments="titleSegments" :speed="24" v-bind="line('title')" /></h1>
      <p class="blog-intro__description"><AnimationTypedLine :text="c('Notes on web applications, backend systems and the work behind my projects.')" :speed="10" :glitch="15000" v-bind="line('description')" /></p>
    </header>
    <section class="blog-posts" aria-labelledby="blog-latest">
      <div class="blog-sectionbar"><h2 id="blog-latest"><CommonPageGlitch :text="c('LATEST ARTICLE')" :interval="12000" /></h2><span dir="ltr">{{ String(blogPosts.length).padStart(2, '0') }}</span></div>
      <div class="blog-grid">
        <CommonHackerReveal v-for="(post, index) in blogPosts" :key="post.id" :show="true" :duration="460"><BlogPostCard :post="post" :number="index + 1" /></CommonHackerReveal>
      </div>
    </section>
    <footer class="blog-footer"><p>{{ c('More notes as the work continues.') }}</p><a :href="identity.contact.linkedin" target="_blank" rel="noopener noreferrer">{{ c('LinkedIn') }} <span aria-hidden="true">↗</span><span class="blog-sr-only">{{ c('(opens in a new tab)') }}</span></a></footer>
  </div>
</template>

<style src="~/assets/css/pages/blog.css"></style>
