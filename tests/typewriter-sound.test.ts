import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { readFile } from "node:fs/promises";
import { parse, compileScript } from "@vue/compiler-sfc";
import { transpileModule, ModuleKind } from "typescript";
import * as Vue from "vue";
import { graphemes, textDirection } from "../app/utils/animatedText.ts";

const source = await readFile(new URL("../app/components/Animation/TypewriterText.vue", import.meta.url), "utf8");
const { descriptor } = parse(source);
const compiled = compileScript(descriptor, { id: "typewriter-sound-test", inlineTemplate: true });
const { outputText } = transpileModule(compiled.content, { compilerOptions: { module: ModuleKind.CommonJS } });

function mountTypewriter(t: TestContext, initiallyVisible: boolean) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const tick = t.mock.fn();
  const done = t.mock.fn();
  const module = { exports: {} as { default?: Vue.Component } };
  const dependencies: Record<string, unknown> = {
    vue: Vue,
    "~/utils/animatedText": { graphemes, textDirection },
    "~/composables/useTypeSound": { useTypeSound: () => ({ load() {}, tick }) },
  };
  new Function("require", "module", "exports", outputText)(
    (id: string) => {
      assert.ok(id in dependencies, `Unexpected component dependency: ${id}`);
      return dependencies[id];
    }, module, module.exports,
  );
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: false }) } });
  let visible = initiallyVisible;
  const renderer = Vue.createRenderer({
    createElement: () => ({ getClientRects: () => visible ? [{}] : [] }),
    createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  });
  const app = renderer.createApp({
    render: () => Vue.h(module.exports.default!, {
      text: "ABCD", autoStart: true, speed: 10, cursor: false, prefix: "", onDone: done,
    }),
  });
  app.mount({});
  t.after(() => {
    app.unmount();
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  });
  return { tick, done, setVisible(value: boolean) { visible = value; } };
}

test("CSS-hidden text finishes its sequence without playing typing sounds", async (t) => {
  const { tick, done } = mountTypewriter(t, false);
  for (let i = 0; i < 6; i++) { t.mock.timers.tick(10); await Vue.nextTick(); }
  assert.equal(tick.mock.callCount(), 0);
  assert.equal(done.mock.callCount(), 1, "hidden text must not block the next animation or card reveal");
});

test("visible text plays normally and becomes silent immediately when a resize hides it", async (t) => {
  const { tick, done, setVisible } = mountTypewriter(t, true);
  t.mock.timers.tick(0);
  await Vue.nextTick();
  assert.equal(tick.mock.callCount(), 1);
  setVisible(false);
  t.mock.timers.tick(10);
  await Vue.nextTick();
  assert.equal(tick.mock.callCount(), 1);
  setVisible(true);
  t.mock.timers.tick(10);
  await Vue.nextTick();
  assert.equal(tick.mock.callCount(), 2);
  for (let i = 0; i < 3; i++) { t.mock.timers.tick(10); await Vue.nextTick(); }
  assert.equal(done.mock.callCount(), 1);
});
