<template>
  <q-layout view="hHh lpR fff" class="ar-app-layout">
    <AppHeader />

    <QPageContainer class="scroll-page-container">
      <q-page class="app-page app-page--scroll">
        <slot />
      </q-page>
    </QPageContainer>
  </q-layout>
</template>

<style scoped>
.scroll-page-container {
  height: 100dvh;
  overflow: hidden;
}

.app-page--scroll {
  min-height: 100dvh;
  padding: 0;
}
</style>
