<script setup lang="ts">
import { aboutPageCopy } from "~/assets/data/aboutPage";
const expanded = ref<string | null>("frontend");
</script>

<template>
  <div class="dossier-profile">
    <div class="dossier-profile__intro">
      <p class="dossier-lead">
        From interface
        <br />
        <span class="dossier-accent">to production.</span>
      </p>
      <p class="dossier-body">Strong Vue/Nuxt experience, backed by work across services, data, integrations and production delivery.</p>
      <div class="dossier-tags">
        <q-badge outline>GREENFIELD</q-badge>
        <q-badge outline>EXISTING SYSTEMS</q-badge>
      </div>
      <span class="dossier-label dossier-muted">EXPAND A RECORD FOR TECHNICAL CONTEXT ↓</span>
    </div>
    <q-list class="dossier-records" aria-label="Engineering responsibilities">
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
            <h3 class="dossier-record__title">{{ entry.title }}</h3>
            <p class="dossier-body dossier-record__summary">{{ entry.summary }}</p>
          </q-item-section>
        </template>
        <div class="dossier-record__detail">
          <p class="dossier-body">{{ entry.detail }}</p>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>
