<script setup lang="ts">
import { findProjectId } from "#shared/projectRoutes";

const route = useRoute();
const projectId = findProjectId(route.params.slug);
if (!projectId) throw createError({ statusCode: 404, statusMessage: "Project not found" });
</script>

<template>
  <ProjectsArchive :project-id="projectId" />
</template>
