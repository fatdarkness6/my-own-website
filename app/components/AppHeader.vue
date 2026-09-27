<script setup>
const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Resume", to: "/resume" },
];

const menuIcon = "M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z";
</script>

<template>
  <header class="app-header">
    <q-toolbar class="app-header__bar">
      <q-btn
        class="lt-md app-header__burger"
        flat
        round
        no-ripple
        :icon="menuIcon"
        aria-label="Open menu"
      >
        <q-menu
          class="app-header-menu"
          anchor="bottom left"
          self="top left"
          :offset="[0, 16]"
        >
          <q-list>
            <q-item
              v-for="link in links"
              :key="link.to"
              v-close-popup
              clickable
              exact
              :to="link.to"
            >
              <q-item-section>
                <AnimationGlitchText :text="link.label" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <nav class="gt-sm app-header__nav" aria-label="Main">
        <q-btn
          v-for="link in links"
          :key="link.to"
          class="nav-link"
          flat
          no-caps
          no-ripple
          exact
          :to="link.to"
        >
          <AnimationGlitchText :text="link.label" />
        </q-btn>
      </nav>

      <q-space />

      <q-btn class="cta" unelevated no-caps no-ripple to="/contact">
        <AnimationGlitchText text="Get in touch" />
      </q-btn>
    </q-toolbar>
  </header>
</template>

<style scoped>
.app-header {
  --header-bg: #161b22;
  --text: #f8fafc;
  --accent: #3b82f6;
  --accent-light: #67a2ff;

  position: sticky;
  top: 16px;
  z-index: 100;
  margin: 16px 12px 0;
  background: var(--header-bg);
  color: var(--text);
  overflow: hidden;

  /* fixed corners */
  border-radius: 0 56px 56px 28px;

  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.app-header__bar {
  position: relative;
  z-index: 1;
  min-height: 72px;
  padding: 0 18px 0 20px;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__burger {
  color: var(--text);
}

.nav-link {
  position: relative;
  min-height: 42px;
  padding: 0 22px;
  border-radius: 0;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-link :deep(.q-focus-helper) {
  display: none;
}

.nav-link::before,
.nav-link::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  transition:
    width 0.2s ease,
    height 0.2s ease,
    opacity 0.2s ease;
  opacity: 0.9;
}

.nav-link::before {
  top: 6px;
  left: 6px;
  border-top: 2px solid var(--accent);
  border-left: 2px solid var(--accent);
}

.nav-link::after {
  right: 6px;
  bottom: 6px;
  border-right: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
}

.nav-link:hover::before,
.nav-link:hover::after,
.nav-link:focus-visible::before,
.nav-link:focus-visible::after,
.nav-link.q-router-link--exact-active::before,
.nav-link.q-router-link--exact-active::after {
  width: 18px;
  height: 18px;
  opacity: 1;
}

/* CTA */
.cta {
  --cut: 14px;
  --bw: 2px;
  --ic: calc(var(--cut) + 1px);

  position: relative;
  min-height: 44px;
  padding: 0 24px;
  margin-right: 6px;
  border-radius: 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  isolation: isolate;
}

.cta :deep(.q-focus-helper) {
  display: none;
}

.cta :deep(.q-btn__content) {
  position: relative;
  z-index: 2;
}

.cta::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  clip-path: polygon(
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut)
  );
  background: linear-gradient(
    180deg,
    var(--accent-light) 0%,
    var(--accent) 100%
  );
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.cta::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #8cb8ff;
  clip-path: polygon(
    evenodd,
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut),
    var(--cut) 0,

    var(--ic) var(--bw),
    calc(100% - var(--bw)) var(--bw),
    calc(100% - var(--bw)) calc(100% - var(--ic)),
    calc(100% - var(--ic)) calc(100% - var(--bw)),
    var(--bw) calc(100% - var(--bw)),
    var(--bw) var(--ic),
    var(--ic) var(--bw),
    var(--cut) 0
  );
  opacity: 0.95;
}

.cta:hover::before,
.cta:focus-visible::before {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

/* Responsive */
@media (min-width: 1024px) {
  .app-header {
    margin: 20px 24px 0 20px;
    border-radius: 0 72px 72px 30px;
  }

  .app-header__bar {
    min-height: 76px;
    padding: 0 28px 0 28px;
  }

  .cta {
    min-height: 46px;
    padding: 0 28px;
  }
}

@media (max-width: 400px) {
  .cta {
    padding: 0 16px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::before,
  .nav-link::after,
  .cta::before {
    transition: none;
  }
}
</style>
<style>
.app-header-menu {
  background: #161b22;
  color: #f8fafc;
  border: 2px solid #3b82f6;
  border-radius: 0 18px 18px 12px;
  min-width: 200px;
}

.app-header-menu .q-item {
  padding: 14px 20px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header-menu .q-item.q-router-link--exact-active {
  color: #3b82f6;
}
</style>
