<script setup lang="ts">
import type { BlogPost } from "~/assets/data/blog";
import { blogPath, blogPreview } from "#shared/blogRoutes";
import { locales } from "#shared/locales";

const props = withDefaults(defineProps<{ post: BlogPost; number?: number }>(), { number: 1 });
const { c, locale, localePath } = usePortfolioI18n();
const preview = computed(() => blogPreview(props.post, locale.value));
const previewDirection = computed(() => locales.find(({ code }) => code === preview.value.language)?.dir ?? "ltr");
const languages = computed(() => locales.filter(({ code }) => props.post.versions[code]));
const destination = computed(() => localePath(blogPath(props.post.id), preview.value.language));
</script>

<template>
  <q-card class="blog-card" flat square>
    <NuxtLink v-if="post.cover" class="blog-card__cover" :to="destination" :aria-label="preview.version.title" tabindex="-1">
      <img :src="post.cover.optimizedSrc" :alt="preview.version.coverAlt"
        :lang="preview.language" :width="post.cover.width" :height="post.cover.height"
        loading="lazy" decoding="async" />
    </NuxtLink>
    <div class="blog-card__bar">
      <span>{{ c('PROJECT NOTE') }}</span>
      <span dir="ltr">{{ String(number).padStart(2, '0') }}</span>
    </div>
    <div class="blog-card__content">
      <div class="blog-card__copy" :lang="preview.language" :dir="previewDirection">
        <div class="blog-tags"><q-badge v-for="tag in post.tags" :key="tag" outline><bdi>{{ tag }}</bdi></q-badge></div>
        <h2><NuxtLink :to="destination">{{ preview.version.title }}</NuxtLink></h2>
        <p class="blog-summary">{{ preview.version.summary }}</p>
      </div>
    </div>
    <div class="blog-card__footer">
      <BlogPostMeta :post="post" :version="preview.version" />
      <div class="blog-card__actions">
        <q-btn class="blog-button blog-button--primary" unelevated no-caps no-ripple :to="destination">
          <AnimationGlitchText :text="c('Read article')" /><q-icon name="arrow_forward" size="18px" aria-hidden="true" />
        </q-btn>
        <nav class="blog-languages" :aria-label="c('Available article languages')">
          <NuxtLink v-for="language in languages" :key="language.code"
            :to="localePath(blogPath(post.id), language.code)" :hreflang="language.code" :lang="language.code">
            {{ language.name }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </q-card>
</template>
