<script setup>
import PageSignalGlitch from "~/components/PageSignalGlitch.vue";

useHead({ title: "Arsam Sarkhosh — Full-Stack Engineer" });
</script>

<template>
  <LoadingScreen />
  <PageSignalGlitch />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
