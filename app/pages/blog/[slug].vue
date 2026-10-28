<script setup lang="ts">
import BlogBackground from "~/components/blog/Background.vue";
import ArticleImage from "~/components/blog/ArticleImage.vue";
import { useArticleReading } from "~/composables/useArticleReading";
import { blogCover } from "~/assets/data/blog";
import PostSource from "~/components/blog/PostSource.vue";
import { identity } from "~/assets/data/identity";
import { projects } from "~/assets/data/projects";
import { blogPath, getBlogPost } from "#shared/blogRoutes";
import { projectPath } from "#shared/projectRoutes";
import { locales } from "#shared/locales";

definePageMeta({ readingMode: true });
const { c, locale, localePath, rtl } = usePortfolioI18n();
const $q = useQuasar();
const route = useRoute();
const article = getBlogPost(route.params.slug, locale.value);
if (!article) throw createError({ statusCode: 404, statusMessage: "Article not found" });
const { post, version } = article;
const languages = locales.filter(({ code }) => post.versions[code]);
const project = projects.find(({ id }) => id === post.projectId);
const cover = blogCover(post);
const coverAlt = computed(() => version.coverAlt || c(cover?.alt || ""));
const { element: readingElement, progress, activeSection } = useArticleReading(version.sections.map(({ id }) => id));
const { navigateToSection } = useSectionNavigation(version.sections.map(({ id }) => id));
const progressFormatter = computed(() => new Intl.NumberFormat(locale.value, { style: "percent", maximumFractionDigits: 0 }));
const percentage = computed(() => progressFormatter.value.format(progress.value));
const { element, line, started } = useViewportTyping(["title"], {
  onceKey: `blog-article-${post.id}`, viewport: { threshold: 0 },
});
usePortfolioSeo({
  blogPost: article,
  title: () => `${version.title} | ${c(identity.name)}`,
  description: version.summary,
});
</script>

<template>
  <article id="blog-article" class="blog-page blog-article">
    <BlogBackground :active="started" :reading-progress="progress" />
    <nav class="article-toolbar" :aria-label="c('Blog')">
      <NuxtLink :to="localePath('/blog')" class="article-toolbar__back"><q-icon :name="rtl ? 'arrow_forward' : 'arrow_back'" size="18px" aria-hidden="true" />{{ c('Back to blog') }}</NuxtLink>
      <span class="article-toolbar__file"><CommonPageGlitch :text="c('ARSAM / ENGINEERING NOTES')" :interval="14000" :enabled="$q.screen.gt.sm" /></span>
      <div class="blog-languages" :aria-label="c('Available article languages')"><NuxtLink v-for="language in languages" :key="language.code" :to="localePath(blogPath(post.id), language.code)" :hreflang="language.code" :lang="language.code" :aria-current="language.code === locale ? 'page' : undefined">{{ language.name }}</NuxtLink></div>
    </nav>
    <header ref="element" class="blog-article__header" :class="{ 'blog-article__header--text': !cover }">
      <div class="article-intro">
        <p class="blog-label">// {{ c('PROJECT NOTE') }}</p>
        <div class="blog-tags"><q-badge v-for="tag in post.tags" :key="tag" outline><bdi>{{ tag }}</bdi></q-badge></div>
        <h1><AnimationTypedLine :text="version.title" :speed="12" v-bind="line('title')" /></h1>
        <p class="blog-summary">{{ version.summary }}</p>
        <BlogPostMeta :post="post" :version="version" />
        <q-btn :href="`#${version.sections[0]!.id}`" class="blog-button article-intro__read" flat no-caps no-ripple @click="navigateToSection($event, version.sections[0]!.id)"><AnimationGlitchText :text="c('Read article')" /><q-icon name="south" size="18px" aria-hidden="true" /></q-btn>
        <PostSource v-if="!cover" :source-url="post.sourceUrl" />
      </div>
      <figure v-if="cover" class="article-cover">
        <div class="article-figure__bar"><span>{{ c('PROJECT NOTE') }}</span><span class="article-cover__lights" aria-hidden="true"><i /><i /><i /></span></div>
        <ArticleImage :image="cover" :alt="coverAlt" :label="version.title" priority />
        <PostSource tag="figcaption" :source-url="post.sourceUrl" />
      </figure>
    </header>
    <div ref="readingElement" class="blog-reading">
      <aside class="blog-sidebar">
        <div class="article-progress"><div><span>{{ c('Reading progress') }}</span><bdi>{{ percentage }}</bdi></div><q-linear-progress :value="progress" :aria-label="c('Reading progress')" instant-feedback color="primary" track-color="transparent" /></div>
        <nav :aria-label="c('On this page')"><h2>{{ c('On this page') }}</h2><a v-for="(section, index) in version.sections" :key="section.id" :href="`#${section.id}`" :aria-current="activeSection === section.id ? 'location' : undefined" @click="navigateToSection($event, section.id)"><span aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>{{ section.title }}</a></nav>
        <NuxtLink v-if="project" class="article-project" :to="localePath(projectPath(project.id))"><span>{{ c('Related project') }}</span><strong>{{ project.name }}</strong><q-icon name="north_east" size="22px" aria-hidden="true" /></NuxtLink>
      </aside>
      <BlogArticleBody :version="version" :active-section="activeSection" />
    </div>
    <footer class="blog-article__footer"><NuxtLink :to="localePath('/blog')"><q-icon :name="rtl ? 'arrow_forward' : 'arrow_back'" size="18px" aria-hidden="true" />{{ c('Back to blog') }}</NuxtLink><NuxtLink v-if="project" :to="localePath(projectPath(project.id))">{{ c('Related project') }}: {{ project.name }} <q-icon name="north_east" size="18px" aria-hidden="true" /></NuxtLink></footer>
  </article>
</template>

<style src="~/assets/css/pages/blog.css"></style>
<style src="~/assets/css/pages/blogArticle.css"></style>
