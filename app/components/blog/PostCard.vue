<script setup lang="ts">
import { blogCover, type BlogPost } from "~/assets/data/blog";
import { blogPath, blogPreview } from "#shared/blogRoutes";
import { locales } from "#shared/locales";
import GlitchCard from "~/components/Animation/GlitchCard.vue";

const props = withDefaults(defineProps<{ post: BlogPost; number?: number }>(), { number: 1 });
const { c, locale, localePath, rtl } = usePortfolioI18n();
const preview = computed(() => blogPreview(props.post, locale.value));
const previewDirection = computed(() => locales.find(({ code }) => code === preview.value.language)?.dir ?? "ltr");
const languages = computed(() => locales.filter(({ code }) => props.post.versions[code]));
const destination = computed(() => localePath(blogPath(props.post.id), preview.value.language));
const imageGlitch = ref<{ run: () => void } | null>(null);
const cover = computed(() => blogCover(props.post));
const coverAlt = computed(() => preview.value.version.coverAlt || c(cover.value?.alt || ""));
</script>

<template>
  <q-card tag="article" class="blog-card" flat square @mouseenter="imageGlitch?.run()" @focusin="imageGlitch?.run()">
    <div class="blog-card__visual">
      <div class="blog-card__index"><span dir="ltr" aria-hidden="true">{{ String(number).padStart(2, '0') }}</span><span class="blog-card__signal"><i aria-hidden="true" />{{ c('PROJECT NOTE') }}</span></div>
      <NuxtLink v-if="cover" class="blog-card__cover" :to="destination" :aria-label="preview.version.title" tabindex="-1">
        <GlitchCard ref="imageGlitch" :image="cover.optimizedSrc || cover.src" :alt="coverAlt" media-only fit="contain" :interval="0">
          <template #image>
            <img :src="cover.optimizedSrc || cover.src" :alt="coverAlt"
              :lang="preview.language" :width="cover.width" :height="cover.height"
              loading="lazy" decoding="async" />
          </template>
        </GlitchCard>
      </NuxtLink>
      <div v-else class="blog-card__placeholder" aria-hidden="true"><q-icon name="terminal" size="64px" /></div>
    </div>
    <div class="blog-card__content">
      <BlogPostMeta class="blog-card__metadata" :post="post" :version="preview.version" compact />
      <div class="blog-card__copy" :lang="preview.language" :dir="previewDirection">
        <h2><NuxtLink :to="destination"><CommonPageGlitch :text="preview.version.title" :interval="11000" /></NuxtLink></h2>
        <p class="blog-summary blog-card__excerpt">{{ preview.version.summary }}</p>
      </div>
      <div class="blog-tags blog-card__tags"><q-badge v-for="tag in post.tags" :key="tag" outline><bdi>{{ tag }}</bdi></q-badge></div>
      <footer class="blog-card__footer">
        <nav class="blog-languages" :aria-label="c('Available article languages')">
          <NuxtLink v-for="language in languages" :key="language.code"
            :to="localePath(blogPath(post.id), language.code)" :hreflang="language.code" :lang="language.code"
            :aria-label="language.name" :title="language.name" :class="{ 'is-current': language.code === preview.language }">
            <bdi>{{ language.code.toUpperCase() }}</bdi>
          </NuxtLink>
        </nav>
        <q-btn class="blog-button blog-card__read" flat no-caps no-ripple :to="destination">
          <AnimationGlitchText :text="c('Read article')" /><q-icon :name="rtl ? 'arrow_back' : 'arrow_forward'" size="20px" aria-hidden="true" />
        </q-btn>
      </footer>
    </div>
  </q-card>
</template>
