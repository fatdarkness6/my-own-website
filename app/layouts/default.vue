<template>
  <QLayout view="hHh lpR fff" class="ar-app-layout">
    <AppHeader />

    <QPageContainer>
      <q-page class="app-page">
        <slot />
      </q-page>
    </QPageContainer>
  </QLayout>
</template>
<script lang="ts" setup></script>
<style scoped>
.app-page {
  background: var(--bg);
  display: flex;
  flex-direction: column;
}
</style>
