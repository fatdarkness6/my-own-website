<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
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
  <section ref="el" class="scroll-section" :data-section-id="id">
    <slot />
  </section>
</template>

<style scoped>
.scroll-section {
  width: 100%;
  height: 100dvh;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
@media (max-width: 660px) {
  .scroll-section {
    height: 100%;
  }
}
</style>
