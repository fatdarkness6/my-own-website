<script setup lang="ts">
import { aboutCopy } from "~/assets/data/about";
const expanded = ref<string | null>("curiosity");
</script>

<template>
  <div class="dossier-journey">
    <div class="dossier-journey__intro">
      <p class="dossier-lead">
        A curious mind.
        <br />
        <span class="dossier-accent">An evolving direction.</span>
      </p>
      <p class="dossier-body">From wondering how a system works to building one with my own signature. These are the ideas that connect the dots.</p>
      <span class="dossier-label dossier-muted">SELECT A RECORD TO READ MORE ↓</span>
    </div>
    <q-list class="dossier-records" aria-label="My story">
      <q-expansion-item
        v-for="(entry, index) in aboutCopy.journey"
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
