<script setup lang="ts">
import { identity } from "~/assets/data/identity";
import { projects } from "~/assets/data/projects";
import { blogPath, getBlogPost } from "#shared/blogRoutes";
import { projectPath } from "#shared/projectRoutes";
import { locales } from "#shared/locales";

definePageMeta({ readingMode: true });
const { c, locale, localePath } = usePortfolioI18n();
const route = useRoute();
const article = getBlogPost(route.params.slug, locale.value);
if (!article) throw createError({ statusCode: 404, statusMessage: "Article not found" });
const { post, version } = article;
const languages = locales.filter(({ code }) => post.versions[code]);
const project = projects.find(({ id }) => id === post.projectId);
usePortfolioSeo({
  blogPost: article,
  title: () => `${version.title} | ${c(identity.name)}`,
  description: version.summary,
});
</script>

<template>
  <article id="blog-article" class="blog-page blog-article">
    <div class="blog-filebar"><span>{{ c('ARSAM / ENGINEERING NOTES') }}</span><span>{{ c('PROJECT NOTE') }}</span></div>
    <nav class="blog-breadcrumbs" :aria-label="c('Blog')"><NuxtLink :to="localePath('/blog')">{{ c('Blog') }}</NuxtLink><span aria-hidden="true">/</span><span>{{ version.title }}</span></nav>
    <header class="blog-article__header">
      <div class="blog-tags"><q-badge v-for="tag in post.tags" :key="tag" outline><bdi>{{ tag }}</bdi></q-badge></div>
      <h1>{{ version.title }}</h1>
      <p class="blog-summary">{{ version.summary }}</p>
      <BlogPostMeta :post="post" :version="version" />
      <p class="blog-origin">{{ c(locale === 'fa' ? 'Originally published in Persian on LinkedIn.' : 'English translation of my original Persian LinkedIn post.') }} <a :href="post.sourceUrl" target="_blank" rel="noopener noreferrer">{{ c('Read the original LinkedIn post') }} ↗<span class="blog-sr-only">{{ c('(opens in a new tab)') }}</span></a></p>
      <nav class="blog-languages" :aria-label="c('Available article languages')"><span>{{ c('Article language') }}:</span><NuxtLink v-for="language in languages" :key="language.code" :to="localePath(blogPath(post.id), language.code)" :hreflang="language.code" :lang="language.code" :aria-current="language.code === locale ? 'page' : undefined">{{ language.name }}</NuxtLink></nav>
    </header>
    <div class="blog-reading">
      <aside class="blog-sidebar">
        <nav :aria-label="c('On this page')"><h2>{{ c('On this page') }}</h2><a v-for="section in version.sections" :key="section.id" :href="`#${section.id}`">{{ section.title }}</a></nav>
      </aside>
      <BlogArticleBody :version="version" />
    </div>
    <footer class="blog-article__footer"><NuxtLink :to="localePath('/blog')">← {{ c('Back to blog') }}</NuxtLink><NuxtLink v-if="project" :to="localePath(projectPath(project.id))">{{ c('Related project') }}: {{ project.name }} ↗</NuxtLink></footer>
  </article>
</template>

<style src="~/assets/css/pages/blog.css"></style>
