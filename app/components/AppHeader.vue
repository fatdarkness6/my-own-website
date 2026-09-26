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
          class="nav-link q-mr-md"
          flat
          exact
          :to="link.to"
        >
          <AnimationGlitchText :text="link.label" />
        </q-btn>
      </nav>

      <q-space />

      <q-btn class="cta" flat no-ripple to="/contact">
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

  position: sticky;
  top: 16px;
  z-index: 100;
  margin: 16px 12px 0;
  background: var(--header-bg);
  color: var(--text);
  border-radius: 0 40px 0 20px;
  font-family: "Chakra Petch", "Rajdhani", system-ui, sans-serif;
}

.app-header__bar {
  min-height: 64px;
  padding: 0 16px;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  position: relative;
  padding: 14px 26px;
  border-radius: 0;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.nav-link :deep(.q-focus-helper) {
  display: none;
}
.nav-link::before,
.nav-link::after {
  content: "";
  position: absolute;
  inset: auto;
  box-shadow: none;
  border: 0 solid var(--accent);
  border-radius: 0;
  width: 10px;
  height: 10px;
  transition:
    width 0.2s ease,
    height 0.2s ease;
}

.nav-link::before {
  top: 0;
  right: 0;
  border-top-width: 3px;
  border-right-width: 3px;
}

/* bottom-left */
.nav-link::after {
  bottom: 0;
  left: 0;
  border-bottom-width: 3px;
  border-left-width: 3px;
}

.nav-link:hover::before,
.nav-link:focus-visible::before,
.nav-link.q-router-link--exact-active::before {
  right: auto;
  left: 0;
  border-right-width: 0;
  border-left-width: 3px;
  width: 22px;
  height: 22px;
}

.nav-link:hover::after,
.nav-link:focus-visible::after,
.nav-link.q-router-link--exact-active::after {
  left: auto;
  right: 0;
  border-left-width: 0;
  border-right-width: 3px;
  width: 22px;
  height: 22px;
}

.cta {
  --cut: 12px;
  --bw: 3px;
  --ic: calc(var(--cut) + 1.24px);

  position: relative;
  padding: 10px 28px;
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.cta :deep(.q-focus-helper) {
  display: none;
}

.cta :deep(.q-btn__content) {
  position: relative;
  z-index: 1;
}
.cta::before {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: none;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.2s ease;
  clip-path: polygon(
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut)
  );
}
.cta::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--accent);
  clip-path: polygon(
    evenodd,
    /* outer */ var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut),
    var(--cut) 0,
    /* seam to inner */ var(--ic) var(--bw),
    /* inner */ calc(100% - var(--bw)) var(--bw),
    calc(100% - var(--bw)) calc(100% - var(--ic)),
    calc(100% - var(--ic)) calc(100% - var(--bw)),
    var(--bw) calc(100% - var(--bw)),
    var(--bw) var(--ic),
    var(--ic) var(--bw),
    /* seam back */ var(--cut) 0
  );
}

.cta:hover::before,
.cta:focus-visible::before {
  opacity: 1;
}

/* ---------- Responsive ---------- */
@media (min-width: 1024px) {
  .app-header {
    margin: 20px 40px 0 20px;
    border-radius: 0 76px 0 28px;
  }

  .app-header__bar {
    min-height: 76px;
    padding: 0 28px 0 32px;
  }
}

@media (max-width: 400px) {
  .cta {
    padding: 8px 18px;
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
  border-radius: 0 20px 0 12px;
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
