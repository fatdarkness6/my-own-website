<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useScrollSections } from "~/composables/useScrollSections";

const props = defineProps({ id: { type: String, required: true } });
const { sections, currentIndex, registerSection, unregisterSection } =
  useScrollSections();
const el = ref(null);
const isActive = computed(() => sections[currentIndex.value]?.id === props.id);

onMounted(() => {
  if (el.value) registerSection({ id: props.id, el: el.value });
});
onBeforeUnmount(() => unregisterSection(props.id));
</script>

<template>
  <section
    ref="el"
    class="scroll-section"
    :data-section-id="id"
    :inert="!isActive"
    :aria-hidden="!isActive ? 'true' : undefined"
  >
    <slot />
  </section>
</template>

<style scoped>
.scroll-section {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  flex: 0 0 100%;
  box-sizing: border-box;
  background: var(--bg, #000);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scroll-behavior: auto;
  touch-action: pan-x pan-y pinch-zoom;
}
/* No mobile height override. The track has a definite height at every size. */
</style>
