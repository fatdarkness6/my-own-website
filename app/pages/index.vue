<template>
  <ScrollContainer>
    <ScrollSection id="hero">
      <HomeHeroSection :portrait-opacity="0.5" />
    </ScrollSection>
    <ScrollSection id="about">
      <HomeAboutSection />
    </ScrollSection>
    <ScrollSection id="projects">
      <HomeProjectsSection />
    </ScrollSection>
    <ScrollSection id="resume">
      <HomeResumeSection />
    </ScrollSection>
    <ScrollSection id="cta">
      <HomeCtaSection />
    </ScrollSection>
  </ScrollContainer>
</template>

<script lang="ts" setup>
definePageMeta({ layout: "scroll" });
const { c } = usePortfolioI18n();

usePortfolioSeo({ page: "home" });
</script>
