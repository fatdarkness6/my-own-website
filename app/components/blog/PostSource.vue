<script setup lang="ts">
withDefaults(defineProps<{ sourceUrl: string; tag?: "p" | "figcaption" }>(), { tag: "p" });
const { c, locale } = usePortfolioI18n();
</script>

<template>
  <component :is="tag" class="blog-origin">
    {{ c(locale === 'fa' ? 'Originally published in Persian on LinkedIn.' : 'English translation of my original Persian LinkedIn post.') }}{{ ' ' }}
    <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">{{ c('Read the original LinkedIn post') }} ↗<span class="blog-sr-only">{{ c('(opens in a new tab)') }}</span></a>
  </component>
</template>
