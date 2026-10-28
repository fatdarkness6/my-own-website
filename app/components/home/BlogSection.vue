<script setup lang="ts">
import { blogPosts, blogCover } from "~/assets/data/blog";
import { homeCopy } from "~/assets/data/homeCopy";
import { blogPath, blogPreview } from "#shared/blogRoutes";
import { locales } from "#shared/locales";
import { useHorizontalSwipe } from "~/composables/useHorizontalSwipe";

const { c, locale, localePath, rtl, content } = usePortfolioI18n();
const { sections, currentIndex, isAnimating } = useScrollSections();
const inView = computed(() => sections[currentIndex.value]?.id === "blog" && !isAnimating.value);
const titleSegments = content(homeCopy.blog.title);
const revealed = ref(false);
const { play, line } = useTypingSequence(["eyebrow", "title", "desc"], {
  onceKey: "home-blog",
  onFinish: () => { revealed.value = true; },
});
watch(inView, (visible) => visible && play(), { immediate: true, flush: "post" });

// The published catalog is the only source; adding an article updates both pages.
// One preview at a time keeps the snap panel finite on short and tall phones alike.
const activeIndex = ref(0);
const previews = computed(() => blogPosts.map((post) => blogPreview(post, locale.value)));
// Keep the file rail finite even after future articles are added.
const visiblePreviews = computed(() => {
  const start = Math.max(0, Math.min(activeIndex.value - 2, previews.value.length - 6));
  return previews.value.slice(start, start + 6).map((preview, offset) => ({ ...preview, index: start + offset }));
});
const selected = computed(() => {
  return previews.value[activeIndex.value];
});
const cover = computed(() => selected.value && blogCover(selected.value.post));
const destination = computed(() => selected.value && localePath(blogPath(selected.value.post.id), selected.value.language));
const articleDirection = computed(() => locales.find(({ code }) => code === selected.value?.language)?.dir ?? "ltr");
const imageGlitch = ref<{ run: () => void } | null>(null);
const number = (value: number) => new Intl.NumberFormat(locale.value, { minimumIntegerDigits: 2 }).format(value);
const imageSwipe = useHorizontalSwipe({
  enabled: () => inView.value && revealed.value && blogPosts.length > 1,
  onSwipe: (direction) => select((direction === "left" ? 1 : -1) * (rtl.value ? -1 : 1)),
});

function select(offset: number) {
  selectArticle(activeIndex.value + offset);
}

function selectArticle(index: number) {
  if (index < 0 || index >= blogPosts.length) return;
  if (index === activeIndex.value) return;
  activeIndex.value = index;
  nextTick(() => imageGlitch.value?.run());
}
</script>

<template>
  <section class="home-blog" aria-labelledby="home-blog-title">
    <div class="home-blog__inner container">
      <header class="home-blog__head">
        <p class="home-blog__eyebrow eyebrow">
          <AnimationTypedLine :text="c('// 04. BLOG')" :speed="22" :glitch="6000" v-bind="line('eyebrow')" />
        </p>
        <h2 id="home-blog-title" class="section-title">
          <AnimationSegmentedLine :segments="titleSegments" :speed="12" v-bind="line('title')" />
        </h2>
        <p class="home-blog__desc description">
          <AnimationTypedLine :text="c('Notes on web applications, backend systems and the work behind my projects.')"
            :speed="10" :glitch="9000" v-bind="line('desc')" />
        </p>
      </header>

      <CommonHackerReveal :show="revealed" class="home-blog__reveal">
        <q-card v-if="selected && destination" flat square class="home-blog__workbench">
          <div class="home-blog__chrome">
            <span class="home-blog__chrome-label"><q-icon name="terminal" size="16px" aria-hidden="true" />{{ c('ENGINEERING NOTES.') }}</span>
            <span class="home-blog__path" aria-hidden="true" dir="ltr">~/notes/<span>{{ selected.post.id }}</span></span>
            <span class="home-blog__encoding" aria-hidden="true">UTF-8</span>
          </div>

          <div class="home-blog__workspace">
            <nav class="home-blog__files" :aria-label="c('All articles')" :style="{ '--home-blog-files': visiblePreviews.length }">
              <q-btn v-for="preview in visiblePreviews" :key="preview.post.id" flat no-caps no-ripple
                class="home-blog__file" :class="{ 'is-selected': preview.index === activeIndex }"
                :aria-pressed="preview.index === activeIndex" :aria-label="preview.version.title" :title="preview.version.title"
                :lang="preview.language" @click="selectArticle(preview.index)">
                <span class="home-blog__file-number" dir="ltr">{{ String(preview.index + 1).padStart(2, '0') }}</span>
                <span class="home-blog__file-title" :dir="locales.find(({ code }) => code === preview.language)?.dir">
                  {{ preview.version.title }}
                </span>
                <q-icon :name="rtl ? 'north_west' : 'north_east'" size="14px" class="home-blog__file-arrow" aria-hidden="true" />
              </q-btn>
            </nav>

            <CommonHackerReveal :key="selected.post.id" :show="revealed" :duration="420" class="home-blog__stage-reveal">
              <article class="home-blog__stage" @mouseenter="imageGlitch?.run()" @focusin="imageGlitch?.run()">
                <div class="home-blog__artboard" :class="{ 'is-dragging': imageSwipe.dragging.value }"
                  :style="{ '--blog-drag-x': `${imageSwipe.offset.value}px` }"
                  @pointerdown="imageSwipe.handlers.pointerdown" @pointermove="imageSwipe.handlers.pointermove"
                  @pointerup="imageSwipe.handlers.pointerup" @pointercancel="imageSwipe.handlers.pointercancel"
                  @lostpointercapture="imageSwipe.handlers.lostpointercapture" @pointerleave="imageSwipe.handlers.pointerleave"
                  @click.capture="imageSwipe.handlers.clickCapture" @dragstart.prevent>
                  <span class="home-blog__serial" aria-hidden="true" dir="ltr">{{ String(activeIndex + 1).padStart(2, '0') }}</span>
                  <span class="home-blog__cross home-blog__cross--start" aria-hidden="true">+</span>
                  <span class="home-blog__cross home-blog__cross--end" aria-hidden="true">+</span>
                  <span class="home-blog__art-label" aria-hidden="true"><q-icon name="swipe" size="14px" />{{ c('Swipe to browse') }}</span>
                  <NuxtLink class="home-blog__visual" :to="destination" :hreflang="selected.language"
                    :aria-label="selected.version.title" tabindex="-1" draggable="false">
                    <span class="home-blog__plate" aria-hidden="true" />
                    <AnimationGlitchCard v-if="cover" ref="imageGlitch" media-only fit="contain" :interval="0"
                      :image="cover.optimizedSrc || cover.src" :alt="selected.version.coverAlt || c(cover.alt)">
                      <template #image>
                        <img :src="cover.optimizedSrc || cover.src" :alt="selected.version.coverAlt || c(cover.alt)"
                          :width="cover.width" :height="cover.height" loading="lazy" decoding="async" draggable="false" />
                      </template>
                    </AnimationGlitchCard>
                    <q-icon v-else name="terminal" size="64px" aria-hidden="true" />
                  </NuxtLink>
                </div>

                <div class="home-blog__copy">
                  <div class="home-blog__article" :lang="selected.language" :dir="articleDirection">
                    <h3><NuxtLink :to="destination" :hreflang="selected.language">
                      <CommonPageGlitch :text="selected.version.title" :interval="11000" />
                    </NuxtLink></h3>
                    <p>{{ selected.version.summary }}</p>
                  </div>
                  <q-btn flat no-caps no-ripple class="home-blog__read" :to="destination" :hreflang="selected.language"
                    :aria-label="c('Read article')" :title="c('Read article')">
                    <span class="home-blog__read-label"><AnimationGlitchText :text="c('Read article')" /></span>
                    <q-icon :name="rtl ? 'north_west' : 'north_east'" size="26px" aria-hidden="true" />
                  </q-btn>
                  <BlogPostMeta class="home-blog__metadata" :post="selected.post" :version="selected.version" compact />
                </div>
              </article>
            </CommonHackerReveal>
          </div>

          <div class="home-blog__statusbar">
            <div class="home-blog__tags"><q-badge v-for="tag in selected.post.tags.slice(0, 3)" :key="tag" outline><bdi>{{ tag }}</bdi></q-badge></div>
            <span class="home-blog__language">{{ c('Article language') }} <bdi>{{ selected.language.toUpperCase() }}</bdi></span>
          </div>
        </q-card>
      </CommonHackerReveal>

      <footer class="home-blog__footer">
        <div class="home-blog__navigation">
          <q-btn flat square no-ripple :disable="activeIndex === 0" :aria-label="c('Previous article')"
            :icon="rtl ? 'chevron_right' : 'chevron_left'" @click="select(-1)" />
          <span class="home-blog__count" role="status" aria-live="polite" aria-atomic="true">
            <bdi dir="ltr">{{ number(blogPosts.length ? activeIndex + 1 : 0) }} / {{ number(blogPosts.length) }}</bdi>
          </span>
          <q-btn flat square no-ripple :disable="activeIndex >= blogPosts.length - 1" :aria-label="c('Next article')"
            :icon="rtl ? 'chevron_left' : 'chevron_right'" @click="select(1)" />
        </div>
        <q-btn outline no-caps no-ripple class="home-blog__archive" :to="localePath('/blog')">
          <AnimationGlitchText :text="c('All articles')" />
          <q-icon :name="rtl ? 'arrow_back' : 'arrow_forward'" size="20px" aria-hidden="true" />
        </q-btn>
      </footer>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/blogSection.css"></style>
