<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useMainMusic } from "~/composables/useMainMusic";

const props = defineProps({
  src: { type: String, default: "/sound/main-song.mp3" },
  buttonFlat: { type: Boolean, default: true },
  buttonRound: { type: Boolean, default: true },
  buttonDense: { type: Boolean, default: true },
});

const { state, ensureAudio, toggle, setVolume } = useMainMusic();

const volUi = ref(Math.round(state.value.volume * 100));

watch(
  () => state.value.volume,
  (v) => (volUi.value = Math.round(v * 100)),
);

const icon = computed(() => (state.value.playing ? "pause" : "music_note"));
const label = computed(() => (state.value.playing ? "Pause" : "Play"));

function onToggle() {
  toggle(props.src);
}

function onVolumeChange(v: number) {
  setVolume(v / 100);
}

onMounted(() => {
  ensureAudio(props.src);
});
</script>

<template>
  <div class="music-ctrl row items-center no-wrap">
    <!-- Main toggle button -->
    <q-btn
      class="music-ctrl__btn"
      :flat="buttonFlat"
      :round="buttonRound"
      :dense="buttonDense"
      no-ripple
      :icon="icon"
      aria-label="Toggle background music"
      @click="onToggle"
    >
      <q-tooltip>Background music: {{ label }}</q-tooltip>
    </q-btn>

    <!-- Settings / menu button -->
    <q-btn
      class="music-ctrl__btn q-ml-xs"
      :flat="buttonFlat"
      :round="buttonRound"
      :dense="buttonDense"
      no-ripple
      icon="tune"
      aria-label="Music settings"
    >
      <q-menu
        anchor="bottom right"
        self="top right"
        :offset="[0, 12]"
        class="music-menu"
      >
        <q-card class="music-menu__card" bordered>
          <q-card-section class="music-menu__header">
            <div class="row items-center no-wrap">
              <q-icon
                name="graphic_eq"
                size="18px"
                class="music-menu__icon q-mr-sm"
              />
              <div class="music-menu__title">AUDIO CONTROL</div>
              <q-space />
              <div class="music-menu__percent">{{ volUi }}%</div>
            </div>
          </q-card-section>

          <q-separator class="music-menu__sep" />

          <q-card-section class="music-menu__body">
            <div class="row items-center q-mb-sm">
              <q-icon
                name="volume_up"
                size="18px"
                class="music-menu__icon q-mr-sm"
              />
              <div class="music-menu__label">VOLUME</div>
            </div>

            <q-slider
              v-model="volUi"
              :min="0"
              :max="100"
              :step="1"
              label
              color="primary"
              @update:model-value="onVolumeChange"
              class="music-menu__slider"
            />

            <div class="row items-center q-mt-sm">
              <div class="music-menu__hint">SYS:// main-song.mp3</div>
              <q-space />
              <q-badge outline color="primary" class="music-menu__badge">
                {{ label.toUpperCase() }}
              </q-badge>
            </div>

            <q-separator class="music-menu__sep q-my-md" />

            <q-btn
              unelevated
              no-caps
              class="full-width music-menu__btn"
              color="primary"
              :label="label"
              @click="onToggle"
            />
          </q-card-section>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<style scoped>
:deep(.music-menu) {
  background: transparent;
  box-shadow: none;
}

:deep(.music-menu__card) {
  width: 260px;
  background: rgba(0, 0, 0, 0.92);
  border: 1px solid rgba(59, 130, 246, 0.55);
  border-radius: 0 16px 16px 12px;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.12),
    0 18px 50px rgba(0, 0, 0, 0.55),
    0 0 22px rgba(59, 130, 246, 0.22);
  overflow: hidden;
  position: relative;
}

/* subtle scanlines */
:deep(.music-menu__card::before) {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0 1px,
    transparent 1px 3px
  );
}

/* faint blue glow streak */
:deep(.music-menu__card::after) {
  content: "";
  position: absolute;
  inset: -40% -30%;
  pointer-events: none;
  background: radial-gradient(
    ellipse 55% 60% at 20% 40%,
    rgba(59, 130, 246, 0.22),
    transparent 65%
  );
}

:deep(.music-menu__header) {
  position: relative;
  z-index: 1;
  padding: 12px 14px;
}

:deep(.music-menu__body) {
  position: relative;
  z-index: 1;
  padding: 14px;
}

:deep(.music-menu__sep) {
  background: rgba(59, 130, 246, 0.18);
}

:deep(.music-menu__icon) {
  color: #67a2ff;
}

:deep(.music-menu__title) {
  font-weight: 800;
  letter-spacing: 0.12em;
  font-size: 12px;
  color: #f8fafc;
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
}

:deep(.music-menu__percent) {
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #67a2ff;
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
}

:deep(.music-menu__label) {
  font-weight: 800;
  letter-spacing: 0.1em;
  font-size: 11px;
  color: rgba(248, 250, 252, 0.9);
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
}

:deep(.music-menu__hint) {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.9);
  letter-spacing: 0.03em;
}

:deep(.music-menu__badge) {
  font-weight: 800;
  letter-spacing: 0.08em;
}

:deep(.music-menu__slider .q-slider__track-container) {
  opacity: 0.95;
}

:deep(.music-menu__slider .q-slider__thumb) {
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.7);
}

:deep(.music-menu__btn) {
  font-weight: 800;
  letter-spacing: 0.08em;
  border-radius: 0 14px 14px 10px;
}
</style>
