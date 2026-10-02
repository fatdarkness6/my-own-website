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
  <div
    class="music-ctrl row items-center no-wrap"
    :class="{ 'music-ctrl--playing': state.playing }"
    role="group"
    aria-label="Background audio controls"
  >
    <span class="music-ctrl__signal" aria-hidden="true" />

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
      class="music-ctrl__btn music-ctrl__btn--settings"
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
        <q-card class="music-menu__card" flat>
          <q-card-section class="music-menu__header">
            <div class="music-menu__heading row items-center no-wrap">
              <div>
                <div class="music-menu__eyebrow">SYS://AUDIO</div>
                <div class="music-menu__title">SIGNAL CONTROL</div>
              </div>
              <div class="music-menu__status" :class="{ 'is-live': state.playing }">
                <span class="music-menu__status-dot" aria-hidden="true" />
                {{ state.playing ? "LIVE" : "STANDBY" }}
              </div>
            </div>

            <div
              class="music-menu__meter"
              :class="{ 'is-live': state.playing }"
              aria-hidden="true"
            >
              <span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" />
            </div>
          </q-card-section>

          <q-separator class="music-menu__sep" />

          <q-card-section class="music-menu__body">
            <div class="music-menu__volume-head row items-end no-wrap">
              <div>
                <div class="music-menu__label">OUTPUT LEVEL</div>
                <div class="music-menu__channel">CH_01 / MAIN</div>
              </div>
              <q-space />
              <output class="music-menu__percent">{{ volUi }}<small>%</small></output>
            </div>

            <q-slider
              v-model="volUi"
              :min="0"
              :max="100"
              :step="1"
              label
              aria-label="Background music volume"
              @update:model-value="onVolumeChange"
              class="music-menu__slider"
            />

            <div class="music-menu__scale" aria-hidden="true">
              <span>00</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>

            <div class="music-menu__source row items-center no-wrap">
              <q-icon name="memory" size="15px" class="music-menu__icon" />
              <span class="music-menu__hint">/sound/main-song.mp3</span>
              <q-space />
              <span class="music-menu__codec">MP3</span>
            </div>

            <q-btn
              unelevated
              no-caps
              class="full-width music-menu__btn"
              @click="onToggle"
            >
              <span>{{ state.playing ? "> PAUSE SIGNAL" : "> INITIALIZE AUDIO" }}</span>
              <q-icon :name="icon" size="18px" />
            </q-btn>
          </q-card-section>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<style scoped>
.music-ctrl {
  --audio-accent: #3b82f6;
  --audio-accent-light: #93c5fd;
  --audio-panel: rgb(5 10 18 / 0.88);

  position: relative;
  flex: none;
  height: 42px;
  padding: 2px;
  overflow: hidden;
  isolation: isolate;
  color: var(--audio-accent-light);
  background: var(--audio-panel);
  border: 1px solid rgb(59 130 246 / 0.3);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow:
    inset 0 0 14px rgb(59 130 246 / 0.05),
    0 0 16px rgb(59 130 246 / 0.08);
}

.music-ctrl::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--audio-accent), transparent);
  opacity: 0.55;
  pointer-events: none;
}

.music-ctrl__signal {
  position: absolute;
  z-index: 2;
  top: 5px;
  left: 5px;
  width: 4px;
  height: 4px;
  background: #64748b;
  box-shadow: 0 0 0 transparent;
  transition: background-color 0.16s, box-shadow 0.16s;
  pointer-events: none;
}

.music-ctrl--playing .music-ctrl__signal {
  background: #22c55e;
  box-shadow: 0 0 7px rgb(34 197 94 / 0.9);
  animation: music-signal-pulse 1.1s steps(2, end) infinite;
}

.music-ctrl__btn {
  position: relative;
  z-index: 1;
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border-radius: 0;
  color: var(--audio-accent-light);
  transition: color 0.16s, background-color 0.16s;
}

.music-ctrl__btn--settings {
  border-left: 1px solid rgb(59 130 246 / 0.2);
}

.music-ctrl__btn:hover,
.music-ctrl__btn:focus-visible,
.music-ctrl--playing .music-ctrl__btn:first-of-type {
  color: #f8fafc;
  background: rgb(59 130 246 / 0.16);
}

.music-ctrl__btn:focus-visible {
  outline: 1px solid var(--audio-accent-light);
  outline-offset: -3px;
}

.music-ctrl__btn :deep(.q-focus-helper) {
  display: none;
}

@keyframes music-signal-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 420px) {
  .music-ctrl {
    height: 38px;
  }

  .music-ctrl__btn {
    width: 32px;
    min-width: 32px;
    height: 32px;
    min-height: 32px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .music-ctrl--playing .music-ctrl__signal {
    animation: none;
  }
}
</style>

<style>
.music-menu {
  --audio-accent: #3b82f6;
  --audio-accent-light: #93c5fd;
  --audio-text: #f8fafc;
  --audio-muted: #94a3b8;

  max-width: calc(100vw - 20px) !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: var(--ui-font, "Chakra Petch", monospace);
}

.music-menu__card {
  position: relative;
  width: min(320px, calc(100vw - 20px));
  overflow: hidden;
  color: var(--audio-text);
  background:
    linear-gradient(135deg, rgb(59 130 246 / 0.1), transparent 58%),
    rgb(3 8 15 / 0.98) !important;
  border: 1px solid rgb(59 130 246 / 0.46) !important;
  border-top: 2px solid var(--audio-accent) !important;
  border-radius: 0 !important;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
  box-shadow:
    0 22px 55px rgb(0 0 0 / 0.72),
    0 0 24px rgb(59 130 246 / 0.18) !important;
}

.music-menu__card::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0;
  opacity: 0.28;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 4px);
}

.music-menu__header,
.music-menu__body {
  position: relative;
  z-index: 1;
}

.music-menu__header {
  padding: 15px 16px 12px !important;
}

.music-menu__body {
  padding: 16px !important;
}

.music-menu__heading {
  justify-content: space-between;
  gap: 12px;
}

.music-menu__eyebrow,
.music-menu__channel,
.music-menu__scale,
.music-menu__codec {
  font-size: 0.625rem;
  font-weight: 650;
  line-height: 1.4;
  letter-spacing: 0.12em;
  color: var(--audio-accent-light);
}

.music-menu__title {
  margin-top: 2px;
  font-family: var(--title-font, "Chakra Petch", sans-serif);
  font-size: 0.875rem;
  font-weight: 750;
  letter-spacing: 0.11em;
  color: var(--audio-text);
}

.music-menu__status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
}

.music-menu__status-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
}

.music-menu__status.is-live {
  color: #22c55e;
}

.music-menu__status.is-live .music-menu__status-dot {
  box-shadow: 0 0 8px rgb(34 197 94 / 0.8);
}

.music-menu__meter {
  display: flex;
  align-items: end;
  gap: 3px;
  height: 18px;
  margin-top: 12px;
  overflow: hidden;
}

.music-menu__meter span {
  flex: 1 1 0;
  height: 42%;
  min-height: 2px;
  background: rgb(59 130 246 / 0.28);
  transform-origin: bottom;
}

.music-menu__meter span:nth-child(3n + 1) {
  height: 68%;
}

.music-menu__meter span:nth-child(4n + 2) {
  height: 100%;
}

.music-menu__meter span:nth-child(5n) {
  height: 26%;
}

.music-menu__meter.is-live span {
  background: var(--audio-accent);
  animation: music-meter 0.8s steps(4, end) infinite alternate;
  animation-delay: calc(var(--bar) * -67ms);
}

.music-menu__sep {
  background: rgb(59 130 246 / 0.22) !important;
}

.music-menu__volume-head {
  min-width: 0;
  margin-bottom: 8px;
}

.music-menu__label {
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.1em;
  color: var(--audio-text);
}

.music-menu__channel {
  margin-top: 3px;
  color: var(--audio-muted);
}

.music-menu__percent {
  flex: none;
  font-family: var(--title-font, "Chakra Petch", sans-serif);
  font-size: 1.75rem;
  font-weight: 750;
  line-height: 1;
  color: var(--audio-accent-light);
}

.music-menu__percent small {
  margin-left: 2px;
  font-size: 0.6875rem;
}

.music-menu__slider {
  width: 100%;
  min-height: 34px;
  color: var(--audio-accent) !important;
}

.music-menu__slider .q-slider__track {
  background: rgb(148 163 184 / 0.2) !important;
}

.music-menu__slider .q-slider__selection {
  background: var(--audio-accent) !important;
  box-shadow: 0 0 10px rgb(59 130 246 / 0.5);
}

.music-menu__slider .q-slider__thumb {
  color: var(--audio-accent-light) !important;
  filter: drop-shadow(0 0 5px rgb(59 130 246 / 0.9));
}

.music-menu__scale {
  display: flex;
  justify-content: space-between;
  margin-top: -3px;
  color: #64748b;
}

.music-menu__source {
  gap: 8px;
  min-width: 0;
  margin: 16px 0 12px;
  padding: 9px 10px;
  background: rgb(15 23 42 / 0.7);
  border: 1px solid rgb(59 130 246 / 0.16);
}

.music-menu__icon {
  flex: none;
  color: var(--audio-accent-light);
}

.music-menu__hint {
  min-width: 0;
  overflow: hidden;
  font-size: 0.6875rem;
  letter-spacing: 0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--audio-muted);
}

.music-menu__codec {
  flex: none;
  padding-left: 8px;
  color: var(--audio-accent-light);
  border-left: 1px solid rgb(59 130 246 / 0.25);
}

.music-menu__btn {
  min-height: 44px;
  padding-inline: 14px;
  border-radius: 0 !important;
  color: #020617 !important;
  background: var(--audio-accent) !important;
  font-family: var(--ui-font, monospace);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.075em;
}

.music-menu__btn .q-btn__content {
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 12px;
}

.music-menu__btn:hover,
.music-menu__btn:focus-visible {
  background: #60a5fa !important;
  box-shadow: 0 0 18px rgb(59 130 246 / 0.35);
}

@keyframes music-meter {
  0% {
    transform: scaleY(0.32);
    opacity: 0.55;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .music-menu__card {
    width: min(294px, calc(100vw - 16px));
  }

  .music-menu__header {
    padding: 13px 14px 10px !important;
  }

  .music-menu__body {
    padding: 14px !important;
  }

  .music-menu__source {
    margin-top: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .music-menu__meter.is-live span {
    animation: none;
  }
}
</style>
