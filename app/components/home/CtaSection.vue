<script setup>
const { sections, currentIndex, isAnimating } = useScrollSections();

const titleLead = "GOT A MISSION?";
const titleAccent = "LET'S BUILD IT.";
const title = `${titleLead} ${titleAccent}`;
const description =
  "Have a project, a role, or just an idea? Open a secure channel and send me a message.";

// boot log shown inside the terminal card
const logs = [
  { id: "log-1", key: "handshake", value: "OK", tone: "ok" },
  { id: "log-2", key: "encryption", value: "ENABLED", tone: "ok" },
  { id: "log-3", key: "channel", value: "OPEN", tone: "accent" },
  { id: "log-4", key: "awaiting", value: "YOUR MESSAGE", tone: "warn" },
];

const order = [
  "eyebrow",
  "title",
  "desc",
  "prompt",
  ...logs.map((l) => l.id),
  "button",
];

const { play, line, isActive, isDone, finished } = useTypingSequence(order, {
  gap: () => 60 + Math.random() * 120,
});

const inView = computed(
  () => sections[currentIndex.value]?.id === "cta" && !isAnimating.value,
);
const terminalVisible = computed(
  () => isActive("prompt") || isDone("prompt"),
);
const shown = (id) => isActive(id) || isDone(id);

watch(inView, (visible) => visible && play(), {
  immediate: true,
  flush: "post",
});

const year = new Date().getFullYear();
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <div class="cta__inner container">
      <header class="cta__copy">
        <p class="cta__eyebrow eyebrow">
          <AnimationTypedLine
            text="// 05. CONTACT"
            :speed="28"
            :glitch="4200"
            v-bind="line('eyebrow')"
          />
        </p>

        <h2 id="cta-title" class="cta__title title">
          <AnimationTypedLine :text="title" :speed="16" v-bind="line('title')">
            <AnimationGlitchTextTimer :text="titleLead" :interval="5000" />
            {{ " " }}
            <AnimationGlitchTextTimer
              :text="titleAccent"
              :interval="6200"
              class="cta__accent"
            />
          </AnimationTypedLine>
        </h2>

        <p class="cta__desc description">
          <AnimationTypedLine
            :text="description"
            :speed="14"
            :glitch="7000"
            v-bind="line('desc')"
          />
        </p>
      </header>

      <div
        class="cta-term"
        :class="{ 'cta-term--waiting': !terminalVisible }"
        :aria-hidden="!terminalVisible ? 'true' : undefined"
        :inert="!terminalVisible"
      >
        <div class="cta-term__bar" aria-hidden="true">
          <span class="cta-term__dot" />
          <span class="cta-term__dot" />
          <span class="cta-term__dot" />
          <span class="cta-term__name">secure-channel.sh</span>
          <q-icon name="lock" size="14px" class="cta-term__lock" />
        </div>

        <div class="cta-term__body">
          <p class="cta-term__prompt">
            <span class="cta-term__sign" aria-hidden="true">$</span>
            <AnimationTypedLine
              text="./connect --to arsam"
              :speed="22"
              v-bind="line('prompt')"
            />
          </p>

          <ul class="cta-term__log" aria-label="Connection status">
            <li
              v-for="l in logs"
              :key="l.id"
              class="cta-term__row"
              :style="{ visibility: shown(l.id) ? 'visible' : 'hidden' }"
            >
              <span class="cta-term__key">&gt; {{ l.key }}</span>
              <span class="cta-term__dots" aria-hidden="true" />
              <span class="cta-term__value" :class="`is-${l.tone}`">
                <AnimationTypedLine
                  :text="l.value"
                  :speed="24"
                  v-bind="line(l.id)"
                />
              </span>
            </li>
          </ul>

          <q-btn
            unelevated
            square
            no-caps
            no-ripple
            to="/contact"
            :disable="!finished"
            class="cta-term__btn"
          >
            <AnimationTypedLine
              text="> open ./contact"
              :speed="20"
              v-bind="line('button')"
            />
            <q-icon
              name="arrow_forward"
              size="18px"
              class="cta-term__arrow"
              :style="{ visibility: finished ? 'visible' : 'hidden' }"
            />
          </q-btn>
        </div>
      </div>

      <footer class="cta__foot" :class="{ 'is-revealed': finished }">
        <span>// EOF</span>
        <span>© {{ year }} Arsam · built with Nuxt + Quasar</span>
      </footer>
    </div>
  </section>
</template>

<style scoped src="~/assets/css/components/home/ctaSection.css"></style>
