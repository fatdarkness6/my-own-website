<script setup lang="ts">
const { c, localePath, content } = usePortfolioI18n();
import { aboutPageCopy as sourceCopy } from "~/assets/data/aboutPage";
import { projects } from "~/assets/data/projects";
import { projectPath } from "#shared/projectRoutes";

// Keep project identity and deep links aligned with Home and /projects.
const systems = content(sourceCopy.systems.map((system) => ({
  ...system,
  project: projects.find((project) => project.id === system.id)!,
})));
</script>

<template>
  <div class="dossier-systems">
    <q-card v-for="system in systems" :key="system.id" flat square class="dossier-system">
      <q-card-section class="dossier-system__identity">
        <span class="dossier-label">{{ system.mode }}</span>
        <h3><CommonPageGlitch :text="c(system.project.name)" /></h3>
        <p class="dossier-system__role">{{ system.role }}</p>
        <p class="dossier-body"><CommonPageGlitch :text="c(system.context)" :interval="14000" /></p>
      </q-card-section>
      <q-card-section class="dossier-system__work">
        <span class="dossier-label">{{ c("CONTRIBUTIONS") }}</span>
        <ul class="dossier-body">
          <li v-for="item in system.work" :key="item">{{ item }}</li>
        </ul>
        <p class="dossier-system__note">{{ system.note }}</p>
      </q-card-section>
      <q-card-section class="dossier-system__footer">
        <div class="dossier-tags" :aria-label="c('Project technologies')">
          <q-badge v-for="tool in system.stack" :key="tool" outline>{{ tool }}</q-badge>
        </div>
        <q-btn
          :to="localePath(projectPath(system.id))"
          :aria-label="`View ${system.project.name} project`"
          flat
          no-caps
          no-ripple
          class="dossier-button"
        >
          <AnimationGlitchText :text="c('View project')" />
          <q-icon name="north_east" size="18px" aria-hidden="true" />
        </q-btn>
      </q-card-section>
    </q-card>
  </div>
</template>
