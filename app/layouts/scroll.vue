<template>
  <q-layout view="hHh lpR fff" class="ar-app-layout">
    <AppHeader />
    <q-page-container>
      <q-page :style-fn="fitViewport" class="app-page--scroll">
        <slot />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
const fitViewport = (offset, height) => ({ height: `${height - offset}px` });
</script>

<style scoped>
.app-page--scroll {
  padding: 0;
  overflow: hidden;
}
</style>
