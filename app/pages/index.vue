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

useSeoMeta({
  title: "Arsam Sarkhosh — Full-Stack Engineer",
  description:
    "Full-stack engineer specializing in Vue, Nuxt, Node.js and Python, building production web applications, backend APIs, interactive experiences and AI-powered systems.",
});
</script>
