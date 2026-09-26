<script setup>
// components/Animation/HeroSection.vue
// Full-width portrait as the background layer, text absolutely positioned on top.
// portraitOpacity is yours to dial in from the outside since "obvious vs hidden"
// depends on your actual image, screen, and taste — no built-in guessing here.

defineProps({
  avatarSrc: { type: String, default: "/images/background.png" },
  portraitSrc: { type: String, default: "/images/background.png" },
  portraitOpacity: { type: Number, default: 0.8 },
});
</script>

<template>
  <section class="hero">
    <!-- background layer: full-width portrait -->
    <div class="hero__visual">
      <AnimationGlitchPortrait
        :src="portraitSrc"
        :opacity="portraitOpacity"
        fit="cover"
      />
    </div>

    <!-- absolutely positioned text, sized to its own content only -->
    <div class="hero__text">
      <p class="hero__eyebrow">
        <AnimationGlitchText text="FULL-STACK DEVELOPER" />
      </p>

      <p class="hero__tagline">
        Vue • <span class="accent">Nuxt</span> • Nodejs
        <span class="accent">Crafting</span> Interactive Experiences.
      </p>

      <q-img
        v-if="avatarSrc"
        class="hero__avatar"
        :src="avatarSrc"
        alt=""
        aria-hidden="true"
      />

      <h1 class="hero__name">
        <AnimationGlitchText
          text="ARSAM"
          class="hero__name-row hero__name-row--light"
        />
        <AnimationGlitchText
          text="SARKHOSH"
          class="hero__name-row hero__name-row--accent"
        />
      </h1>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --bg: #000000;
  --text: #f8fafc;
  --muted: #94a3b8;
  --accent: #3b82f6;

  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--text);
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
  overflow: hidden;
}

/* full-width background layer: mouse events reach it normally, for the
   portrait's own hover interactivity */
.hero__visual {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* sized to its own content, positioned absolutely on top - since it's not
   stretched full-width, its empty space can't block the portrait underneath */
.hero__text {
  position: absolute;
  top: 50%;
  left: clamp(20px, 5vw, 56px);
  transform: translateY(-50%);
  z-index: 2;
  max-width: 640px;
  padding-right: 20px; /* breathing room on narrow screens */
}

.hero__eyebrow {
  margin: 0 0 12px;
  font-size: clamp(0.95rem, 1.6vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text);
}

.hero__tagline {
  margin: 0 0 28px;
  max-width: 46ch;
  font-size: clamp(0.85rem, 1.1vw, 1.05rem);
  color: var(--muted);
}

.hero__tagline .accent {
  color: var(--accent);
  font-weight: 600;
}

.hero__avatar {
  display: block;
  width: 44px;
  height: 44px;
  margin-bottom: 8px;
  border-radius: 999px;
  border: 2px solid var(--accent);
}

.hero__avatar :deep(img) {
  object-position: 50% 15%;
}

.hero__name {
  margin: 0;
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: 0.01em;
}

.hero__name :deep(.hero__name-row) {
  display: block;
  font-size: clamp(2.75rem, 9vw, 6.25rem);
}

.hero__name :deep(.hero__name-row--light) {
  color: var(--text);
}

.hero__name :deep(.hero__name-row--accent) {
  color: var(--accent);
}
</style>
