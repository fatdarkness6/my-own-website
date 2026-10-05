<script setup lang="ts">
const { c, localePath } = usePortfolioI18n();
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
    :aria-label="c(&quot;Background audio controls&quot;)"
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
      :aria-label="c(&quot;Toggle background music&quot;)"
      @click="onToggle"
    >
      <q-tooltip>{{ c("Background music:") }} {{ c(label) }}</q-tooltip>
    </q-btn>

    <!-- Settings / menu button -->
    <q-btn
      class="music-ctrl__btn music-ctrl__btn--settings"
      :flat="buttonFlat"
      :round="buttonRound"
      :dense="buttonDense"
      no-ripple
      icon="tune"
      :aria-label="c(&quot;Music settings&quot;)"
    >
      <q-menu
        anchor="bottom end"
        self="top end"
        :offset="[0, 12]"
        class="music-menu"
      >
        <q-card class="music-menu__card" flat>
          <q-card-section class="music-menu__header">
            <div class="music-menu__heading row items-center no-wrap">
              <div>
                <div class="music-menu__eyebrow">{{ c("SYS://AUDIO") }}</div>
                <div class="music-menu__title">{{ c("SIGNAL CONTROL") }}</div>
              </div>
              <div class="music-menu__status" :class="{ 'is-live': state.playing }">
                <span class="music-menu__status-dot" aria-hidden="true" />
                {{ c(state.playing ? "PLAYING" : "STANDBY") }}
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
                <div class="music-menu__label">{{ c("OUTPUT LEVEL") }}</div>
                <div class="music-menu__channel">{{ c("CH_01 / MAIN") }}</div>
              </div>
              <q-space />
              <output class="music-menu__percent" dir="ltr">{{ volUi }}<small>%</small></output>
            </div>

            <q-slider
              v-model="volUi"
              :min="0"
              :max="100"
              :step="1"
              label
              :aria-label="c(&quot;Background music volume&quot;)"
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
              <span class="music-menu__hint">{{ c("/sound/main-song.mp3") }}</span>
              <q-space />
              <span class="music-menu__codec">{{ c("MP3") }}</span>
            </div>

            <q-btn
              unelevated
              no-caps
              class="full-width music-menu__btn"
              @click="onToggle"
            >
              <span>{{ c(state.playing ? "> PAUSE SIGNAL" : "> INITIALIZE AUDIO") }}</span>
              <q-icon :name="icon" size="18px" />
            </q-btn>
          </q-card-section>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<style scoped src="~/assets/css/components/appMusicControl.css"></style>

<style src="~/assets/css/components/appMusicControlPanel.css"></style>
