import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { setImmediate } from "node:timers/promises";
import { createJiti } from "jiti";

test("button sounds follow completed activations rather than touch or key presses", async (t) => {
  const document = new EventTarget();
  const played: { volume: number; offset: number }[] = [];

  class Element {
    control: Element | null = this;
    disabled = false;
    soundOff = false;
    tab = false;
    closest(selector: string) {
      return selector.includes("data-click-sound")
        ? this.soundOff ? this : null
        : this.control;
    }
    matches(selector: string) { return selector === ".q-tab" ? this.tab : this.disabled; }
  }

  class AudioContext {
    state = "running";
    currentTime = 0;
    destination = {};
    async decodeAudioData() { return {}; }
    createGain() {
      return { gain: { value: 1 }, connect() {} };
    }
    createBufferSource() {
      let gain: ReturnType<AudioContext["createGain"]>;
      return {
        buffer: null,
        connect(node: typeof gain) { gain = node; },
        start(_when: number, offset: number) {
          played.push({ volume: gain.gain.value, offset });
        },
      };
    }
  }

  const globals = {
    document, Element, window: { AudioContext },
    fetch: async () => ({ arrayBuffer: async () => new ArrayBuffer(0) }),
    defineNuxtPlugin: (setup: () => void) => setup,
  };
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else Reflect.deleteProperty(globalThis, key);
    });
  }

  const jiti = createJiti(import.meta.url, {
    alias: { "~": fileURLToPath(new URL("../app", import.meta.url)) },
    moduleCache: false,
  });
  const { default: setup } = await jiti.import<{ default: () => void }>("../app/plugins/button-sound.client.ts");
  setup();
  await setImmediate(); // Finish the mocked sound fetch/decode before interacting.

  function dispatch(type: string, target: Element, properties: Record<string, unknown> = {}) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, "target", { value: target });
    Object.assign(event, { button: 0, ...properties });
    document.dispatchEvent(event);
  }

  await t.test("scrolling that starts over a button stays silent", () => {
    played.length = 0;
    const button = new Element();
    dispatch("pointerdown", button, { pointerType: "touch" });
    dispatch("pointermove", button, { pointerType: "touch", clientY: 180 });
    dispatch("pointercancel", button, { pointerType: "touch" });
    dispatch("scroll", button);
    dispatch("touchend", button);
    assert.equal(played.length, 0);
  });

  await t.test("a completed tap plays once at the audible effect level", () => {
    played.length = 0;
    const button = new Element();
    dispatch("pointerdown", button, { pointerType: "touch" });
    dispatch("pointerup", button, { pointerType: "touch" });
    assert.equal(played.length, 0, "touching or releasing alone is not activation");
    dispatch("click", button);
    assert.deepEqual(played, [{ volume: 0.45, offset: 0 }]);
  });

  await t.test("keyboard activation plays once when the control emits its click", () => {
    for (const key of ["Enter", " "]) {
      played.length = 0;
      const button = new Element();
      dispatch("keydown", button, { key });
      dispatch("keydown", button, { key, repeat: true });
      assert.equal(played.length, 0);
      dispatch("click", button, { detail: 0 });
      dispatch("keyup", button, { key });
      assert.equal(played.length, 1);
    }
  });

  await t.test("mouse clicks on nested button content play once", () => {
    played.length = 0;
    const icon = new Element();
    icon.control = new Element();
    dispatch("pointerdown", icon, { pointerType: "mouse" });
    dispatch("click", icon);
    assert.equal(played.length, 1);
    dispatch("click", icon, { button: 2 });
    assert.equal(played.length, 1, "secondary clicks stay silent");
  });

  await t.test("Quasar keyboard tabs work with or without a native click", async () => {
    played.length = 0;
    const tab = new Element();
    tab.tab = true;
    dispatch("keydown", tab, { key: "Enter" });
    dispatch("keydown", tab, { key: "Enter", repeat: true });
    dispatch("keyup", tab, { key: "Enter" });
    assert.equal(played.length, 1, "tabs may prevent the native Enter click");
    dispatch("click", tab, { detail: 0 });
    assert.equal(played.length, 1, "a native keyboard click must not double the sound");
    await new Promise((resolve) => setTimeout(resolve, 0));
    dispatch("click", tab, { detail: 0 });
    assert.equal(played.length, 2, "the keyboard guard expires after activation");
  });

  await t.test("disabled, opted-out and non-interactive targets stay silent", () => {
    played.length = 0;
    const disabled = new Element();
    disabled.disabled = true;
    const optedOut = new Element();
    optedOut.soundOff = true;
    const outside = new Element();
    outside.control = null;
    for (const target of [disabled, optedOut, outside]) dispatch("click", target);
    assert.equal(played.length, 0);
  });
});
