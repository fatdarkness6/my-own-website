<template>
  <q-page>
    <ScrollContainer>
      <ScrollSection id="hero">
        <HomeHeroSection :portrait-opacity="0.6" />
      </ScrollSection>

      <ScrollSection id="about">
        <HomeAboutSection />
      </ScrollSection>
    </ScrollContainer>
  </q-page>
</template>
<script lang="ts" setup>
definePageMeta({
  layout: "scroll",
});
</script>
