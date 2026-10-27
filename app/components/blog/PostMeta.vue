<script setup lang="ts">
import { identity } from "~/assets/data/identity";
import { blogReadingMinutes, type BlogPost, type BlogVersion } from "~/assets/data/blog";

const props = defineProps<{ post: BlogPost; version: BlogVersion }>();
const { c, locale, localePath } = usePortfolioI18n();
const date = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: "medium", timeZone: "UTC",
}).format(new Date(`${props.post.publishedAt}T00:00:00Z`)));
</script>

<template>
  <div class="blog-meta">
    <NuxtLink :to="localePath('/about')">{{ c(identity.name) }}</NuxtLink>
    <span>{{ c('Added to this blog') }} <time :datetime="post.publishedAt">{{ date }}</time></span>
    <span>{{ blogReadingMinutes(version) }} {{ c('min read') }}</span>
  </div>
</template>
