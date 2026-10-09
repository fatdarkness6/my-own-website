<script setup lang="ts">
const { c, localePath, content } = usePortfolioI18n();
import { aboutPageCopy as sourceCopy } from "~/assets/data/aboutPage";
const aboutPageCopy = content(sourceCopy);
const expanded = ref<string | null>("frontend");
</script>

<template>
  <div class="dossier-profile">
    <div class="dossier-profile__intro">
      <p class="dossier-lead">
        <CommonPageGlitch :text="c('From interface')" />
        <br />
        <span class="dossier-accent"><CommonPageGlitch :text="c('to production.')" :interval="10000" /></span>
      </p>
      <p class="dossier-body">{{ c("Strong Vue/Nuxt experience, backed by work across services, data, integrations and production delivery.") }}</p>
      <div class="dossier-tags">
        <q-badge outline>{{ c("GREENFIELD") }}</q-badge>
        <q-badge outline>{{ c("EXISTING SYSTEMS") }}</q-badge>
      </div>
      <span class="dossier-label dossier-muted">{{ c("EXPAND A RECORD FOR TECHNICAL CONTEXT ↓") }}</span>
    </div>
    <q-list class="dossier-records" :aria-label="c('Engineering responsibilities')">
      <q-expansion-item
        v-for="(entry, index) in aboutPageCopy.profile"
        :key="entry.id"
        :model-value="expanded === entry.id"
        :toggle-aria-label="`${expanded === entry.id ? 'Collapse' : 'Expand'}: ${entry.title}`"
        @update:model-value="expanded = $event ? entry.id : null"
        class="dossier-record"
        :class="{ 'dossier-record--open': expanded === entry.id }"
        expand-icon="add"
        expanded-icon="remove"
        :duration="180"
      >
        <template #header>
          <q-item-section side class="dossier-record__number">{{ String(index + 1).padStart(2, '0') }}</q-item-section>
          <q-item-section>
            <span class="dossier-label">{{ entry.tag }}</span>
            <h3 class="dossier-record__title"><CommonPageGlitch :text="c(entry.title)" /></h3>
            <p class="dossier-body dossier-record__summary"><CommonPageGlitch :text="c(entry.summary)" :interval="14000" /></p>
          </q-item-section>
        </template>
        <div class="dossier-record__detail">
          <p class="dossier-body">{{ entry.detail }}</p>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>
