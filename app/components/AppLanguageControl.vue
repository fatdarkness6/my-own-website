<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const { c } = usePortfolioI18n();
const switching = ref(false);
async function choose(code: Parameters<typeof setLocale>[0]) {
  if (switching.value || code === locale.value) return;
  switching.value = true;
  try { await setLocale(code); }
  finally { switching.value = false; }
}
</script>

<template>
  <q-btn class="language-control" flat dense no-caps no-ripple
    :aria-label="c('Choose language')" :loading="switching">
    <span dir="ltr">{{ locale.toUpperCase() }}</span>
    <q-menu class="language-menu" anchor="bottom middle" self="top middle" :offset="[0, 12]">
      <q-list role="menu" :aria-label="c('Choose language')">
        <q-item v-for="language in locales" :key="language.code" clickable v-close-popup
          role="menuitemradio" :aria-checked="locale === language.code"
          :active="locale === language.code" @click="choose(language.code)">
          <q-item-section><bdi :lang="language.code">{{ language.name }}</bdi></q-item-section>
          <q-item-section side><span dir="ltr">{{ language.code.toUpperCase() }}</span></q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style>
.language-control { color: #b9d7ff; font: 700 0.8125rem var(--ui-font); min-width: 36px; min-height: 36px; }
.language-menu { background: #080f1b; color: #dbeafe; border: 1px solid #315787; min-width: 185px; }
.language-menu .q-item { min-height: 44px; }
.language-menu .q-item__section--side { color: #8fbfff; }
.language-menu .q-item--active { color: #93c5fd; background: rgb(59 130 246 / 12%); }
</style>
