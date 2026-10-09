import test from "node:test";
import assert from "node:assert/strict";
import { createRenderer, createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { useAnimationEnvironment } from "../app/composables/useAnimationEnvironment.ts";

test("animation consumers share listeners and release them across route unmount/remount", async (t) => {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const motion = Object.assign(new EventTarget(), { matches: false });
  const matchMedia = t.mock.fn(() => motion);
  const visibilityAdds = t.mock.method(document, "addEventListener");
  const visibilityRemoves = t.mock.method(document, "removeEventListener");
  const motionAdds = t.mock.method(motion, "addEventListener");
  const motionRemoves = t.mock.method(motion, "removeEventListener");
  const originals = ["window", "document"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });

  const states: ReturnType<typeof useAnimationEnvironment>[] = [];
  const count = ref(2);
  const Consumer = {
    setup() {
      states.push(useAnimationEnvironment());
      return () => h("span");
    },
  };
  const renderer = createRenderer({
    createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  });
  const app = renderer.createApp({
    setup: () => () => h("div", Array.from({ length: count.value }, (_, key) => h(Consumer, { key }))),
  });
  app.mount({});
  t.after(() => app.unmount());

  assert.equal(visibilityAdds.mock.callCount(), 1);
  assert.equal(motionAdds.mock.callCount(), 1);
  assert.equal(matchMedia.mock.callCount(), 1);
  assert.equal(states[0]!.visible, states[1]!.visible);
  document.hidden = true;
  motion.matches = true;
  document.dispatchEvent(new Event("visibilitychange"));
  motion.dispatchEvent(new Event("change"));
  for (const state of states) {
    assert.equal(state.visible.value, false);
    assert.equal(state.reducedMotion.value, true);
  }

  count.value = 1;
  await nextTick();
  assert.equal(visibilityRemoves.mock.callCount(), 0);
  count.value = 0;
  await nextTick();
  assert.equal(visibilityRemoves.mock.callCount(), 1);
  assert.equal(motionRemoves.mock.callCount(), 1);
  document.hidden = false;
  motion.matches = false;
  document.dispatchEvent(new Event("visibilitychange"));
  motion.dispatchEvent(new Event("change"));
  assert.equal(states[0]!.visible.value, false, "disposed consumers receive no browser updates");

  count.value = 1;
  await nextTick();
  assert.equal(visibilityAdds.mock.callCount(), 2);
  assert.equal(states[2]!.visible.value, true, "remount reads the current browser state");
  assert.equal(states[2]!.reducedMotion.value, false);
  count.value = 0;
  await nextTick();
  assert.equal(visibilityRemoves.mock.callCount(), 2);
  assert.equal(motionRemoves.mock.callCount(), 2);
});

test("SSR environments are isolated and need no browser globals", async () => {
  const states: ReturnType<typeof useAnimationEnvironment>[] = [];
  const component = {
    setup() {
      const state = useAnimationEnvironment();
      states.push(state);
      return () => h("span", `${state.visible.value}/${state.reducedMotion.value}`);
    },
  };
  assert.equal(await renderToString(createSSRApp(component)), "<span>true/false</span>");
  assert.equal(await renderToString(createSSRApp(component)), "<span>true/false</span>");
  assert.notEqual(states[0]!.visible, states[1]!.visible);
  assert.notEqual(states[0]!.reducedMotion, states[1]!.reducedMotion);
});
