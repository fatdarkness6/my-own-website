<template>
  <ScrollContainer>
    <ScrollSection id="hero"
      ><HomeHeroSection :portrait-opacity="0.5"
    /></ScrollSection>
    <ScrollSection id="about"><HomeAboutSection /></ScrollSection>
  </ScrollContainer>
</template>

<script lang="ts" setup>
definePageMeta({ layout: "scroll" });
</script>
