import { getCurrentInstance, onMounted, onBeforeUnmount, readonly, ref, type App } from "vue";

function createEnvironment() {
  const visible = ref(true);
  const reducedMotion = ref(false);
  let consumers = 0;
  let motion: MediaQueryList | undefined;

  const updateVisibility = () => { visible.value = !document.hidden; };
  const updateMotion = () => { reducedMotion.value = motion?.matches ?? false; };

  return {
    visible: readonly(visible),
    reducedMotion: readonly(reducedMotion),
    acquire() {
      if (consumers++ > 0) return;
      motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      updateVisibility();
      updateMotion();
      document.addEventListener("visibilitychange", updateVisibility);
      motion.addEventListener("change", updateMotion);
    },
    release() {
      if (--consumers > 0) return;
      document.removeEventListener("visibilitychange", updateVisibility);
      motion?.removeEventListener("change", updateMotion);
      motion = undefined;
    },
  };
}

// One listener pair per Vue app, with separate state for every SSR request.
// The WeakMap does not retain applications after they have been disposed.
const environments = new WeakMap<App, ReturnType<typeof createEnvironment>>();

/** Share browser animation preferences without sharing animation timing/state. */
export function useAnimationEnvironment() {
  const instance = getCurrentInstance();
  if (!instance) throw new Error("useAnimationEnvironment must run in component setup");
  const app = instance.appContext.app;
  let environment = environments.get(app);
  if (!environment) {
    environment = createEnvironment();
    environments.set(app, environment);
  }
  const state = environment;
  let acquired = false;
  onMounted(() => {
    state.acquire();
    acquired = true;
  });
  onBeforeUnmount(() => {
    if (acquired) state.release();
  });
  return { visible: state.visible, reducedMotion: state.reducedMotion };
}
