<script setup lang="ts">
import { aboutPageCopy } from "~/assets/data/aboutPage";

const selected = ref(aboutPageCopy.tools[0]!.id);
const current = computed(
  () => aboutPageCopy.tools.find((tool) => tool.id === selected.value)!,
);
</script>

<template>
  <div class="dossier-toolkit">
    <div class="dossier-toolkit__map">
      <div class="dossier-toolkit__hub" aria-hidden="true">
        <span class="dossier-label">ARSAM / STACK</span>
        <strong>INTERFACE → SYSTEM → DELIVERY</strong>
        <span class="dossier-toolkit__hub-line" />
      </div>
      <div class="dossier-toolkit__nodes" role="group" aria-label="Explore my tools">
        <q-btn
          v-for="tool in aboutPageCopy.tools"
          :key="tool.id"
          flat
          no-caps
          no-ripple
          class="dossier-tool"
          :class="{ 'dossier-tool--active': selected === tool.id }"
          :aria-pressed="selected === tool.id"
          aria-controls="toolkit-detail"
          @click="selected = tool.id"
        >
          <q-icon :name="tool.icon" size="22px" aria-hidden="true" />
          <span class="dossier-tool__copy">
            <strong>{{ tool.name }}</strong>
            <small>{{ tool.layer }}</small>
          </span>
          <span class="dossier-tool__indicator" aria-hidden="true" />
        </q-btn>
      </div>
    </div>
    <q-card
      id="toolkit-detail"
      flat
      square
      class="dossier-toolkit__detail"
      aria-live="polite"
      aria-atomic="true"
    >
      <q-card-section>
        <div class="dossier-toolkit__detail-bar">
          <span class="dossier-label">
            {{ current.layer }}
            /
            {{ current.name }}
          </span>
          <q-icon :name="current.icon" size="30px" aria-hidden="true" />
        </div>
        <h3 class="dossier-lead"><CommonPageGlitch :key="current.id" :text="current.title" /></h3>
        <p class="dossier-body"><CommonPageGlitch :text="current.text" :interval="14000" /></p>
        <div class="dossier-tags">
          <q-badge v-for="tag in current.tags" :key="tag" outline>{{ tag }}</q-badge>
        </div>
      </q-card-section>
      <q-separator dark />
      <q-card-section class="dossier-toolkit__evidence">
        <span class="dossier-label">CONTEXT / IN PRACTICE</span>
        <p class="dossier-body">{{ current.evidence }}</p>
      </q-card-section>
    </q-card>
  </div>
</template>
