<template>
  <QLayout view="hHh lpR fff" class="ar-app-layout">
    <AppHeader />

    <QPageContainer>
      <q-page class="app-page">
        <div class="container">
          <slot />
        </div>
      </q-page>
    </QPageContainer>
  </QLayout>
</template>
<script lang="ts" setup>
// Regular pages need document scrolling; the homepage owns a separate snap layout.
useHead({ htmlAttrs: { class: "document-route" } });
</script>
<style scoped>
.app-page {
  background: var(--bg);
  display: flex;
  flex-direction: column;
  overflow: clip;
}
</style>

<style>
html.document-route {
  height: auto;
  overflow-x: clip;
  overflow-y: auto;
}
html.document-route body {
  height: auto;
  overflow: visible;
}
</style>
