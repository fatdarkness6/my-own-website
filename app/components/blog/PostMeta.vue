<script setup lang="ts">
import { identity } from "~/assets/data/identity";
import { blogReadingMinutes, type BlogPost, type BlogVersion } from "~/assets/data/blog";

const props = withDefaults(defineProps<{ post: BlogPost; version: BlogVersion; compact?: boolean }>(), { compact: false });
const { c, locale, localePath } = usePortfolioI18n();
const date = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: "medium", timeZone: "UTC",
}).format(new Date(`${props.post.publishedAt}T00:00:00Z`)));
</script>

<template>
  <div class="blog-meta" :class="{ 'blog-meta--compact': compact }">
    <NuxtLink v-if="!compact" :to="localePath('/about')">{{ c(identity.name) }}</NuxtLink>
    <span><template v-if="!compact">{{ c('Added to this blog') }}{{ ' ' }}</template><time :datetime="post.publishedAt" :aria-label="compact ? `${c('Added to this blog')} ${date}` : undefined">{{ date }}</time></span>
    <span><q-icon v-if="compact" name="schedule" size="14px" aria-hidden="true" /> {{ blogReadingMinutes(version) }} {{ c('min read') }}</span>
  </div>
</template>
