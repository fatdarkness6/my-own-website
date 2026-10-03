<script setup>
import PageSignalGlitch from "~/components/PageSignalGlitch.vue";

useHead({ title: "Arsam Sarkhosh — Full-stack Developer" });
</script>

<template>
  <LoadingScreen />
  <PageSignalGlitch />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
