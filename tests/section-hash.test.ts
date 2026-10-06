import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { createRenderer, h, nextTick, ref } from "vue";
import { useSectionHash } from "../app/composables/useSectionHash.ts";

function mountTracker(t: TestContext, { enabled = true, hash = "", smooth = false, path = "/about" } = {}) {
  const ready = ref(enabled);
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  const calls: { method: string; url: string; state: unknown }[] = [];
  const moves: { top: number; immediate: boolean }[] = [];
  const tops: Record<string, number> = { "about-main": 0, profile: 1000, toolkit: 2200, "about-exit": 3500 };
  const browser = Object.assign(new EventTarget(), {
    scrollY: 0, innerHeight: 800,
    location: { hash, pathname: path, search: "?source=test" },
    history: {
      state: { current: path, position: 3 },
      replaceState(state: unknown, _: string, url: string) { calls.push({ method: "replace", state, url }); browser.location.hash = url.slice(url.indexOf("#")); },
      pushState(state: unknown, _: string, url: string) { calls.push({ method: "push", state, url }); browser.location.hash = url.slice(url.indexOf("#")); },
    },
    getComputedStyle: () => ({ scrollMarginTop: "112px" }),
    requestAnimationFrame(callback: FrameRequestCallback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id: number) { frames.delete(id); },
  });
  const elements = Object.fromEntries(Object.keys(tops).map((id) => [id, {
    id, getBoundingClientRect: () => ({ top: tops[id]! - browser.scrollY }),
  }]));
  const document = { documentElement: { scrollHeight: 3900 }, getElementById: (id: string) => elements[id] ?? null };
  const restorers: (() => void)[] = [];
  for (const [key, value] of Object.entries({ window: browser, document })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    restorers.push(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const renderer = createRenderer({
    createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  });
  let tracker!: ReturnType<typeof useSectionHash>;
  const app = renderer.createApp({
    setup() {
      tracker = useSectionHash(Object.keys(tops), {
        enabled: ready,
        scroll(top, immediate) {
          moves.push({ top, immediate });
          if (!smooth || immediate) browser.scrollY = top;
        },
      });
      return () => h("div");
    },
  });
  app.mount({});
  let unmounted = false;
  const unmount = () => { if (!unmounted) app.unmount(); unmounted = true; };
  t.after(() => { unmount(); restorers.forEach((restore) => restore()); });
  function flushFrame() {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  }
  function scrollTo(top: number) { browser.scrollY = top; browser.dispatchEvent(new Event("scroll")); flushFrame(); }
  return { tracker, ready, browser, frames, calls, moves, unmount, flushFrame, scrollTo };
}

test("scrolling updates chapters in both directions without adding history or navigating", (t) => {
  const { tracker, browser, calls, moves, flushFrame, scrollTo } = mountTracker(t, { path: "/fa/about" });
  flushFrame(); flushFrame();
  scrollTo(1200);
  assert.equal(tracker.activeSection.value, "profile");
  scrollTo(2300);
  assert.equal(browser.location.hash, "#toolkit");
  scrollTo(400);
  assert.equal(browser.location.hash, "#about-main");
  assert.equal(calls.every((call) => call.method === "replace"), true);
  assert.equal(calls.at(-1)!.url, "/fa/about?source=test#about-main");
  assert.equal(calls.at(-1)!.state, browser.history.state);
  assert.equal(moves.length, 0);
});

test("restoration waits for loading to unlock and does not overwrite the incoming hash", async (t) => {
  const { ready, browser, calls, moves, flushFrame, scrollTo } = mountTracker(t, { enabled: false, hash: "#toolkit" });
  scrollTo(0);
  assert.equal(calls.length, 0);
  ready.value = true;
  await nextTick();
  flushFrame();
  assert.equal(calls.length, 0);
  flushFrame();
  assert.deepEqual(moves, [{ top: 2088, immediate: true }]);
  assert.equal(browser.location.hash, "#toolkit");
});

test("the final short section becomes active at the bottom of the page", (t) => {
  const { browser, flushFrame, scrollTo } = mountTracker(t);
  flushFrame(); flushFrame();
  scrollTo(3100);
  assert.equal(browser.location.hash, "#about-exit");
});

test("a button's destination remains bookmarked while smooth scrolling passes other chapters", (t) => {
  const { tracker, browser, calls, flushFrame, scrollTo } = mountTracker(t, { smooth: true });
  flushFrame(); flushFrame();
  const click = new Event("click", { cancelable: true });
  tracker.navigateToSection(click, "toolkit");
  assert.equal(click.defaultPrevented, true);
  assert.equal(calls.at(-1)!.method, "push");
  scrollTo(1200);
  assert.equal(browser.location.hash, "#toolkit");
  scrollTo(2088);
  assert.equal(tracker.activeSection.value, "toolkit");
  scrollTo(400);
  assert.equal(browser.location.hash, "#about-main");
});

test("manual scrolling cancels a button's pending smooth-scroll destination", (t) => {
  const { tracker, browser, flushFrame, scrollTo } = mountTracker(t, { smooth: true });
  flushFrame(); flushFrame();
  tracker.navigateToSection(new Event("click"), "toolkit");
  browser.dispatchEvent(new Event("wheel"));
  scrollTo(1200);
  assert.equal(browser.location.hash, "#profile");
});

test("modified clicks keep their normal native-link behavior", (t) => {
  const { tracker, calls, moves, flushFrame } = mountTracker(t);
  flushFrame(); flushFrame();
  const initialCalls = calls.length;
  const click = Object.assign(new Event("click", { cancelable: true }), { button: 0, ctrlKey: true });
  tracker.navigateToSection(click, "toolkit");
  assert.equal(click.defaultPrevented, false);
  assert.equal(moves.length, 0);
  assert.equal(calls.length, initialCalls);
});

test("Back/Forward or native hash links restore the requested chapter", (t) => {
  const { browser, moves, flushFrame } = mountTracker(t);
  flushFrame(); flushFrame();
  browser.location.hash = "#profile";
  browser.dispatchEvent(new Event("popstate"));
  flushFrame(); flushFrame();
  assert.deepEqual(moves.at(-1), { top: 888, immediate: true });
  assert.equal(browser.location.hash, "#profile");
});

test("malformed and unknown hashes are safe, and unmount cancels all work", (t) => {
  const { browser, calls, frames, unmount, flushFrame, scrollTo } = mountTracker(t, { hash: "#%E0%A4%A" });
  flushFrame(); flushFrame();
  assert.equal(browser.location.hash, "#about-main");
  browser.location.hash = "#missing";
  browser.dispatchEvent(new Event("hashchange"));
  assert.equal(frames.size, 1);
  const count = calls.length;
  unmount();
  scrollTo(2300);
  assert.equal(frames.size, 0);
  assert.equal(calls.length, count);
});

test("outgoing page scroll work cannot overwrite the next page's URL", (t) => {
  const { browser, calls, flushFrame, scrollTo } = mountTracker(t);
  flushFrame(); flushFrame();
  const count = calls.length;
  browser.location.pathname = "/projects";
  scrollTo(2300);
  assert.equal(calls.length, count);
});
