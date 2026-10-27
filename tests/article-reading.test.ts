import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { createRenderer, h } from "vue";
import { useArticleReading } from "../app/composables/useArticleReading.ts";

function mountReading(t: TestContext) {
  let scroll = 0;
  let height = 3000;
  let frameId = 0;
  let anchorMargin = 140;
  const frames = new Map<number, FrameRequestCallback>();
  const sections = ["one", "two", "three"].map((id, index) => ({
    id, getBoundingClientRect: () => ({ top: 1000 + index * 1000 - scroll }),
  }));
  const root = {
    getBoundingClientRect: () => ({ top: 1000 - scroll, height }),
    contains: (section: unknown) => sections.includes(section as typeof sections[number]),
  } as unknown as HTMLElement;
  let observed = false;
  let disconnected = false;
  let resizeCallback = () => {};
  class Observer {
    constructor(callback: () => void) { resizeCallback = callback; }
    observe() { observed = true; }
    disconnect() { disconnected = true; }
  }
  const browser = Object.assign(new EventTarget(), {
    innerHeight: 800, ResizeObserver: Observer,
    getComputedStyle: () => ({ scrollMarginTop: `${anchorMargin}px` }),
    requestAnimationFrame(callback: FrameRequestCallback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id: number) { frames.delete(id); },
  });
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 100 }) }),
    getElementById: (id: string) => sections.find((section) => section.id === id),
  });
  const originals = Object.entries({ window: browser, document, ResizeObserver: Observer }).map(([key, value]) => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    return () => previous ? Object.defineProperty(globalThis, key, previous) : Reflect.deleteProperty(globalThis, key);
  });
  const renderer = createRenderer({
    createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  });
  let state!: ReturnType<typeof useArticleReading>;
  const app = renderer.createApp({ setup() {
    state = useArticleReading(sections.map(({ id }) => id));
    state.element.value = root;
    return () => h("div");
  } });
  app.mount({});
  let disposed = false;
  function unmount() { if (!disposed) app.unmount(); disposed = true; }
  t.after(() => { unmount(); originals.forEach((restore) => restore()); });
  function flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback(0)); }
  function move(top: number) { scroll = top; browser.dispatchEvent(new Event("scroll")); flush(); }
  return { state, frames, browser, document, move, flush, unmount,
    observed: () => observed, disconnected: () => disconnected,
    anchorMargin(value: number) { anchorMargin = value; },
    resize(value: number) { height = value; resizeCallback(); flush(); },
  };
}

test("reading progress starts at zero, scrubs both ways and selects the visible chapter", (t) => {
  const { state, move, flush } = mountReading(t);
  flush();
  assert.equal(state.progress.value, 0);
  assert.equal(state.activeSection.value, "one");
  move(1900);
  assert.equal(state.activeSection.value, "two");
  assert.ok(state.progress.value > 0 && state.progress.value < 1);
  move(3240);
  assert.equal(state.progress.value, 1);
  assert.equal(state.activeSection.value, "three");
  move(0);
  assert.equal(state.progress.value, 0);
  assert.equal(state.activeSection.value, "one");
});

test("scroll bursts share one pending frame and image/layout resizes recompute progress", (t) => {
  const reading = mountReading(t);
  reading.flush();
  assert.equal(reading.observed(), true);
  for (let index = 0; index < 10; index++) reading.browser.dispatchEvent(new Event("scroll"));
  assert.equal(reading.frames.size, 1);
  reading.flush();
  reading.move(2000);
  const before = reading.state.progress.value;
  reading.resize(4000);
  assert.ok(reading.state.progress.value < before);
});

test("a native anchor's scroll margin selects its own chapter, not the previous one", (t) => {
  const reading = mountReading(t);
  reading.anchorMargin(160);
  reading.move(1840);
  assert.equal(reading.state.activeSection.value, "two");
});

test("hidden tabs do not update and unmount releases observers, listeners and pending work", (t) => {
  const reading = mountReading(t);
  reading.flush();
  reading.document.hidden = true;
  reading.move(1900);
  assert.equal(reading.state.progress.value, 0);
  reading.document.hidden = false;
  reading.document.dispatchEvent(new Event("visibilitychange"));
  reading.flush();
  assert.equal(reading.state.activeSection.value, "two");
  reading.browser.dispatchEvent(new Event("scroll"));
  reading.unmount();
  assert.equal(reading.frames.size, 0);
  assert.equal(reading.disconnected(), true);
  reading.browser.dispatchEvent(new Event("scroll"));
  assert.equal(reading.frames.size, 0);
});
