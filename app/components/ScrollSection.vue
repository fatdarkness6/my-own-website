<script setup>
import { useScrollSections } from "~/composables/useScrollSections";

const props = defineProps({
  id: { type: String, required: true },
});

const { registerSection, unregisterSection } = useScrollSections();
const el = ref(null);

onMounted(() => {
  if (el.value) {
    registerSection({ id: props.id, el: el.value });
  }
});

onBeforeUnmount(() => {
  unregisterSection(props.id);
});
</script>

<template>
  <section
    ref="el"
    class="scroll-section"
    :data-section-id="id"
    data-lenis-prevent
  >
    <slot />
  </section>
</template>

<style scoped>
.scroll-section {
  position: relative;
  width: 100%;
  height: 100dvh;
  flex: 0 0 100dvh;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: pan-y pinch-zoom;
}
</style>
