<script setup lang="ts">
const { c, localePath, content } = usePortfolioI18n();
import { aboutPageCopy as sourceCopy } from "~/assets/data/aboutPage";
const aboutPageCopy = content(sourceCopy);
</script>

<template>
  <div class="dossier-capabilities">
    <q-card
      v-for="capability in aboutPageCopy.capabilities"
      :key="capability.code"
      flat
      square
      class="dossier-principle dossier-capability"
    >
      <q-card-section>
        <div class="dossier-principle__meta">
          <span class="dossier-label">{{ c("SCOPE /") }}{{ capability.code }}</span>
          <q-icon :name="capability.icon" size="26px" aria-hidden="true" />
        </div>
        <h3><CommonPageGlitch :text="c(capability.title)" /></h3>
        <ul class="dossier-body dossier-capability__skills">
          <li v-for="skill in capability.skills" :key="skill">{{ skill }}</li>
        </ul>
      </q-card-section>
      <span class="dossier-principle__trace" aria-hidden="true" />
    </q-card>
  </div>
</template>
