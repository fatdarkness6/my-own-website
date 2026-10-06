import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { createRenderer, h, nextTick, ref } from "vue";
import { useViewportEntry } from "../app/composables/useViewportEntry.ts";

function mountEntry(t: TestContext, { enabled = true, observerSupported = true } = {}) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let rect = { top: 300, bottom: 400, left: 0, right: 300, width: 300, height: 100 };
  const observers: Observer[] = [];
  class Observer {
    disconnected = false;
    callback: IntersectionObserverCallback;
    options: IntersectionObserverInit;
    constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
      this.callback = callback;
      this.options = options;
      observers.push(this);
    }
    observe() {}
    disconnect() { this.disconnected = true; }
    emit(ratio: number) {
      if (!this.disconnected) this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
  }
  const browser = Object.assign(new EventTarget(), { innerHeight: 800, innerWidth: 1200 });
  if (observerSupported) Object.assign(browser, { IntersectionObserver: Observer });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const restoreGlobals: (() => void)[] = [];
  for (const [key, value] of Object.entries({ window: browser, document, IntersectionObserver: Observer })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    restoreGlobals.push(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const renderer = createRenderer({
    createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  });
  const ready = ref(enabled);
  let entry!: ReturnType<typeof useViewportEntry>;
  const app = renderer.createApp({
    setup() {
      entry = useViewportEntry({ enabled: ready });
      entry.element.value = { getBoundingClientRect: () => rect } as HTMLElement;
      return () => h("div");
    },
  });
  app.mount({});
  let unmounted = false;
  function unmount() {
    if (!unmounted) app.unmount();
    unmounted = true;
  }
  t.after(() => {
    unmount();
    restoreGlobals.forEach((restore) => restore());
  });
  return { entry, ready, browser, document, observers, unmount, setTop(top: number) { rect = { ...rect, top, bottom: top + rect.height }; } };
}

test("a heading at the viewport's bottom or only partly visible does not enter", (t) => {
  const { entry, observers, setTop } = mountEntry(t);
  setTop(760);
  observers[0]!.emit(0.1);
  t.mock.timers.tick(1000);
  assert.equal(entry.entered.value, false);
});

test("a readable heading must remain visible for the short dwell time, then enters only once", async (t) => {
  const { entry, observers, browser } = mountEntry(t);
  observers[0]!.emit(1);
  t.mock.timers.tick(139);
  assert.equal(entry.entered.value, false);
  t.mock.timers.tick(1);
  assert.equal(entry.entered.value, true);
  assert.equal(observers[0]!.disconnected, true);
  browser.dispatchEvent(new Event("resize"));
  await nextTick();
  assert.equal(observers.length, 1);
});

test("scrolling past a heading cancels its pending entry", (t) => {
  const { entry, observers } = mountEntry(t);
  observers[0]!.emit(1);
  t.mock.timers.tick(80);
  observers[0]!.emit(0);
  t.mock.timers.tick(1000);
  assert.equal(entry.entered.value, false);
  observers[0]!.emit(1);
  t.mock.timers.tick(140);
  assert.equal(entry.entered.value, true);
});

test("the delayed geometry check prevents entry even if a fast scroll callback arrives late", (t) => {
  const { entry, observers, setTop } = mountEntry(t);
  observers[0]!.emit(1);
  setTop(-200);
  t.mock.timers.tick(140);
  assert.equal(entry.entered.value, false);
});

test("loading-screen readiness gates observation and cancels an entry when disabled", async (t) => {
  const { entry, ready, observers } = mountEntry(t, { enabled: false });
  assert.equal(observers.length, 0);
  ready.value = true;
  await nextTick();
  observers[0]!.emit(1);
  ready.value = false;
  await nextTick();
  t.mock.timers.tick(1000);
  assert.equal(entry.entered.value, false);
  assert.equal(observers[0]!.disconnected, true);
});

test("portrait and landscape trigger margins follow viewport height, and resize cancels stale timers", (t) => {
  const { entry, observers, browser } = mountEntry(t);
  assert.equal(observers[0]!.options.rootMargin, "-112px 0px -200px 0px");
  observers[0]!.emit(1);
  browser.innerHeight = 400;
  browser.dispatchEvent(new Event("resize"));
  t.mock.timers.tick(140);
  assert.equal(entry.entered.value, false);
  assert.equal(observers[0]!.disconnected, true);
  assert.equal(observers[1]!.options.rootMargin, "-80px 0px -100px 0px");
});

test("background tabs cannot start an animation; returning starts a fresh observation", (t) => {
  const { entry, observers, document } = mountEntry(t);
  observers[0]!.emit(1);
  document.hidden = true;
  document.dispatchEvent(new Event("visibilitychange"));
  t.mock.timers.tick(140);
  assert.equal(entry.entered.value, false);
  document.hidden = false;
  document.dispatchEvent(new Event("visibilitychange"));
  observers[1]!.emit(1);
  t.mock.timers.tick(140);
  assert.equal(entry.entered.value, true);
});

test("unmount cancels pending animation work and listeners", (t) => {
  const { entry, observers, unmount, browser } = mountEntry(t);
  observers[0]!.emit(1);
  unmount();
  browser.dispatchEvent(new Event("resize"));
  t.mock.timers.tick(1000);
  assert.equal(entry.entered.value, false);
  assert.equal(observers.length, 1);
});

test("browsers without IntersectionObserver remain readable after the intro", async (t) => {
  const { entry, ready } = mountEntry(t, { enabled: false, observerSupported: false });
  assert.equal(entry.entered.value, false);
  ready.value = true;
  await nextTick();
  assert.equal(entry.entered.value, true);
});
