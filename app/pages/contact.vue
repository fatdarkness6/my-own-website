<script setup lang="ts">
const { c, localePath } = usePortfolioI18n();
import { copyToClipboard } from "quasar";
import {
  contactDetails,
  contactIntents as sourceIntents,
  contactTitle as sourceTitle,
  type ContactIntent,
} from "~/assets/data/contact";
const contactIntents = usePortfolioI18n().content(sourceIntents);
const contactTitle = usePortfolioI18n().content(sourceTitle);

usePortfolioSeo({
  type: "ContactPage",
  title: () => c("Contact — Arsam Sarkhosh | Full-Stack Engineer"),
  description:
    () => c("Discuss a web application, an engineering role or a collaboration with Arsam Sarkhosh. Vue, Nuxt, backend systems and AI-powered applications."),
});

const { element, line, started } = useViewportTyping(
  ["label", "title"],
  { onceKey: "contact-channel", viewport: { threshold: 0 } },
);

const intentId = ref<ContactIntent>("project");
const intent = computed(
  () => contactIntents.value.find((item) => item.id === intentId.value)!,
);
const draft = reactive({ name: "", email: "", message: "" });
const prepared = ref(false);
const feedback = ref("");
const hasEmail = computed(() => Boolean(contactDetails.email));
const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const completedFields = computed(
  () =>
    [
      Boolean(draft.name.trim()),
      validEmail(draft.email),
      Boolean(draft.message.trim()),
    ].filter(Boolean).length,
);
const subject = computed(
  () => `${intent.value.subject} — ${draft.name.trim() || c("Portfolio enquiry")}`,
);
const message = computed(() =>
  [
    c("Hi Arsam,"),
    "",
    draft.message.trim(),
    "",
    `${c("From")}: ${draft.name.trim()}`,
    `${c("Reply to")}: ${draft.email.trim()}`,
    `${c("Regarding")}: ${intent.value.label}`,
  ].join("\n"),
);
const emailHref = computed(
  () =>
    `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(message.value)}`,
);

watch(
  [intentId, () => draft.name, () => draft.email, () => draft.message],
  () => {
    prepared.value = false;
    feedback.value = "";
  },
);

function prepareMessage() {
  prepared.value = true;
  feedback.value = hasEmail.value
    ? "Draft ready. Open your email app to review and send it."
    : "Your brief is ready to copy and share.";
}

async function copyText(text: string, success: string) {
  try {
    await copyToClipboard(text);
    feedback.value = success;
  } catch {
    feedback.value =
      "Couldn’t copy automatically. You can select and copy the text in the message preview.";
  }
}
</script>

<template>
  <article id="contact-main" ref="element" class="channel">
    <ContactBackground :active="started" />
    <div class="channel-filebar">
      <span>{{ c("ARSAM / COMMUNICATIONS") }}</span
      ><span>{{ c("CHANNEL 05") }}<i aria-hidden="true" /></span>
    </div>

    <header class="channel-hero">
      <div>
        <p class="channel-label">
          <AnimationTypedLine
            :text="c(&quot;// A DIRECT LINE TO THE ENGINEER&quot;)"
            :speed="14"
            :glitch="11000"
            v-bind="line('label')"
          />
        </p>
        <h1 class="channel-title">
          <AnimationSegmentedLine
            :segments="contactTitle"
            :speed="24"
            v-bind="line('title')"
          />
        </h1>
        <nav class="channel-socials" :aria-label="c(&quot;Connect with Arsam&quot;)">
          <q-btn
            :href="contactDetails.github"
            target="_blank"
            rel="noopener noreferrer"
            unelevated
            no-caps
            no-ripple
            class="channel-social"
          >
            <svg
              class="channel-social__logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"
              /></svg
            ><span>{{ c("GitHub") }}</span
            ><q-icon name="north_east" size="18px" aria-hidden="true" /><span
              class="channel-sr"
              >{{ c("(opens in a new tab)") }}</span
            >
          </q-btn>
          <q-btn
            :href="contactDetails.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            unelevated
            no-caps
            no-ripple
            class="channel-social"
          >
            <svg
              class="channel-social__logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M20.45 0H3.55A3.55 3.55 0 0 0 0 3.55v16.9A3.55 3.55 0 0 0 3.55 24h16.9A3.55 3.55 0 0 0 24 20.45V3.55A3.55 3.55 0 0 0 20.45 0ZM7.12 20.45H3.56V9h3.56ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm15.11 13.02h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45Z"
              /></svg
            ><span>{{ c("LinkedIn") }}</span
            ><q-icon name="north_east" size="18px" aria-hidden="true" /><span
              class="channel-sr"
              >{{ c("(opens in a new tab)") }}</span
            >
          </q-btn>
        </nav>
      </div>
      <div class="channel-hero__aside">
        <span class="channel-label"
          ><CommonPageGlitch :text="c(&quot;HAVE SOMETHING IN MIND?&quot;)"
        /></span>
        <p>
          <CommonPageGlitch
            :text="c(&quot;A product to build, a system to improve, or a team to join. Tell me where you want to take it.&quot;)"
            :interval="14000"
          />
        </p>
        <a href="#compose" class="channel-jump"
          >{{ c("START A CONVERSATION") }}<q-icon name="south_east" size="20px" aria-hidden="true"
        /></a>
      </div>
    </header>

    <CommonHackerReveal :show="started" :duration="560">
      <section class="channel-routes" aria-labelledby="channel-route-title">
        <div class="channel-section-bar">
          <h2 id="channel-route-title">
            <CommonPageGlitch :text="c(&quot;01 / WHAT BRINGS YOU HERE?&quot;)" />
          </h2>
          <span>{{ c("CHOOSE A DIRECTION") }}</span>
        </div>
        <div
          class="channel-route-grid"
          role="group"
          :aria-label="c(&quot;Conversation topic&quot;)"
        >
          <q-btn
            v-for="item in contactIntents"
            :key="item.id"
            flat
            no-caps
            no-ripple
            :aria-pressed="intentId === item.id"
            aria-controls="compose"
            class="channel-route"
            :class="{ 'is-selected': intentId === item.id }"
            @click="intentId = item.id"
          >
            <span class="channel-route__top"
              ><span>{{ item.number }} /</span
              ><q-icon :name="item.icon" size="24px" aria-hidden="true" /><span
                class="channel-route__indicator"
                aria-hidden="true"
            /></span>
            <strong><CommonPageGlitch :text="c(item.label)" /></strong>
            <span class="channel-route__summary">{{ item.summary }}</span>
          </q-btn>
        </div>
      </section>

      <div class="channel-workspace">
        <q-card
          id="compose"
          flat
          square
          class="channel-composer"
          aria-labelledby="compose-title"
        >
          <div class="channel-terminal-bar">
            <span class="channel-terminal-dots" aria-hidden="true"
              ><i /><i /><i /></span
            ><span>{{ c("new-conversation.msg") }}</span
            ><span class="channel-terminal-state">{{ c("DRAFT") }}</span>
          </div>
          <q-card-section class="channel-composer__body">
            <div class="channel-composer__heading">
              <span class="channel-label">{{ c("02 / WRITE THE BRIEF") }}</span
              ><span
                class="channel-progress"
                :aria-label="`${completedFields}/3 — ${c('02 / WRITE THE BRIEF')}`"
                ><i
                  v-for="step in 3"
                  :key="step"
                  :class="{ 'is-complete': completedFields >= step }"
                  aria-hidden="true"
                />{{ completedFields }}/3</span
              >
            </div>
            <h2 id="compose-title">
              <CommonPageGlitch :key="intentId" :text="c(intent.prompt)" />
            </h2>
            <p class="channel-body channel-composer__intro">
              <CommonPageGlitch
                :text="c(&quot;A few useful details are enough to get started.&quot;)"
                :interval="14000"
              />
            </p>

            <q-form class="channel-form" @submit="prepareMessage">
              <div class="channel-form__identity">
                <q-input
                  v-model="draft.name"
                  dark
                  outlined
                  square
                  stack-label
                  :label="c(&quot;Your name&quot;)"
                  :placeholder="c(&quot;What should I call you?&quot;)"
                  autocomplete="name"
                  name="name"
                  maxlength="100"
                  lazy-rules
                  :rules="[
                    (value: string) =>
                      Boolean(value.trim()) || c('Please enter your name.'),
                  ]"
                />
                <q-input
                  v-model="draft.email"
                  dark
                  outlined
                  square
                  stack-label
                  :label="c(&quot;Your email&quot;)"
                  :placeholder="c(&quot;you@company.com&quot;)"
                  type="email"
                  autocomplete="email"
                  name="email"
                  maxlength="254"
                  lazy-rules
                  :rules="[
                    (value: string) =>
                      validEmail(value) || c('Enter a valid email address.'),
                  ]"
                />
              </div>
              <q-input
                v-model="draft.message"
                dark
                outlined
                square
                stack-label
                :label="c(&quot;Your message&quot;)"
                :placeholder="intent.placeholder"
                type="textarea"
                name="message"
                :rows="6"
                maxlength="4000"
                counter
                lazy-rules
                :rules="[
                  (value: string) =>
                    Boolean(value.trim()) ||
                    c('Tell me a little about what you have in mind.'),
                ]"
              />
              <q-expansion-item
                class="channel-preview"
                :label="c(&quot;Preview your message&quot;)"
                expand-icon="add"
                expanded-icon="remove"
                :duration="180"
              >
                <div class="channel-preview__body">
                  <span class="channel-label">{{ subject }}</span>
                  <pre>{{ message }}</pre>
                </div>
              </q-expansion-item>
              <div class="channel-form__actions">
                <q-btn
                  type="submit"
                  unelevated
                  no-caps
                  no-ripple
                  class="channel-button channel-button--primary"
                >
                  <AnimationGlitchText
                    :text="c(hasEmail ? 'Prepare email' : 'Prepare message')"
                  /><q-icon name="east" size="20px" aria-hidden="true" />
                </q-btn>
                <p>
                  {{
                    c(hasEmail
                      ? "Prepare a draft, then review and send it from your email app."
                      : "Create a brief you can copy and share.")
                  }}
                </p>
              </div>
              <div v-if="prepared" class="channel-ready">
                <q-icon name="task_alt" size="24px" aria-hidden="true" />
                <div>
                  <strong>{{ c("Ready for the next step.") }}</strong
                  ><span>{{ c("No message has been sent yet.") }}</span>
                </div>
                <q-btn
                  v-if="hasEmail"
                  :href="emailHref"
                  unelevated
                  no-caps
                  no-ripple
                  class="channel-button channel-button--primary"
                  >{{ c("Open email draft") }}<q-icon name="north_east" size="18px" aria-hidden="true"
                /></q-btn>
                <q-btn
                  flat
                  no-caps
                  no-ripple
                  class="channel-button"
                  @click="
                    copyText(
                      `${subject}\n\n${message}`,
                      'Message copied. You can paste it into your email app.',
                    )
                  "
                  >{{ c("Copy message") }}<q-icon name="content_copy" size="18px" aria-hidden="true"
                /></q-btn>
              </div>
              <p class="channel-feedback" role="status" aria-live="polite">
                {{ c(feedback) }}
              </p>
            </q-form>
          </q-card-section>
        </q-card>

        <aside
          class="channel-sidebar"
          :aria-label="c(&quot;Contact details and conversation guide&quot;)"
        >
          <q-card flat square class="channel-endpoint">
            <ContactSignal />
            <q-card-section>
              <span class="channel-label">{{ c("THE OTHER END OF THE LINE") }}</span>
              <h2>
                <CommonPageGlitch :text="c(&quot;Arsam Sarkhosh&quot;)" /><span
                  class="channel-accent"
                  >.</span
                >
              </h2>
              <p class="channel-body">{{ c("Full-Stack Engineer") }}<br />{{ c("Vue / Nuxt / Node.js / Python") }}</p>
              <div v-if="hasEmail" class="channel-email">
                <a :href="`mailto:${contactDetails.email}`">{{
                  contactDetails.email
                }}</a>
                <q-btn
                  flat
                  no-ripple
                  icon="content_copy"
                  :aria-label="c(&quot;Copy email address&quot;)"
                  @click="
                    copyText(contactDetails.email, 'Email address copied.')
                  "
                />
              </div>
            </q-card-section>
          </q-card>
          <div class="channel-guide">
            <span class="channel-label">{{ c("A USEFUL STARTING POINT") }}</span>
            <h2><CommonPageGlitch :text="c(&quot;Give me the context.&quot;)" /></h2>
            <ul>
              <li v-for="(pointer, index) in intent.pointers" :key="pointer">
                <span aria-hidden="true">0{{ index + 1 }}</span
                >{{ pointer }}
              </li>
            </ul>
            <p>{{ c("No perfect pitch needed. Plain language works.") }}</p>
          </div>
        </aside>
      </div>
    </CommonHackerReveal>

    <footer class="channel-footer">
      <div>
        <span class="channel-label">{{ c("MORE CONTEXT BEFORE WE TALK") }}</span>
        <p>
          <CommonPageGlitch
            :text="c(&quot;See the work behind the conversation.&quot;)"
            :interval="13000"
          />
        </p>
      </div>
      <nav :aria-label="c(&quot;Explore more&quot;)">
        <q-btn :to="localePath(&quot;/projects&quot;)" flat no-caps no-ripple class="channel-button"
          ><AnimationGlitchText :text="c(&quot;View projects&quot;)" /><q-icon
            name="east"
            size="18px"
            aria-hidden="true" /></q-btn
        ><q-btn :to="localePath(&quot;/resume&quot;)" flat no-caps no-ripple class="channel-button"
          ><AnimationGlitchText :text="c(&quot;View résumé&quot;)" /><q-icon
            name="east"
            size="18px"
            aria-hidden="true"
        /></q-btn>
      </nav>
      <div class="channel-footer__end">
        <span>{{ c("ARSAM SARKHOSH / LET'S BUILD.") }}</span
        ><a href="#contact-main">{{ c("BACK TO TOP ↑") }}</a>
      </div>
    </footer>
  </article>
</template>

<style src="~/assets/css/pages/contact.css"></style>
