import assert from "node:assert/strict";
import test from "node:test";
import { createHorizontalSwipe, type SwipeDirection } from "../app/composables/useHorizontalSwipe.ts";

function fixture() {
  const swipes: SwipeDirection[] = [];
  const positions: [number, boolean][] = [];
  const captured = new Set<number>();
  let enabled = true;
  const surface = {
    setPointerCapture: (id: number) => captured.add(id),
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: (id: number) => captured.delete(id),
  };
  const swipe = createHorizontalSwipe({
    onSwipe: (direction) => swipes.push(direction), enabled: () => enabled,
    onDrag: (offset, dragging) => positions.push([offset, dragging]),
  });
  const pointer = (x: number, y = 100, extra: Partial<PointerEvent> = {}) => ({
    pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, buttons: 1,
    clientX: x, clientY: y, currentTarget: surface, target: surface, ...extra,
  }) as unknown as PointerEvent;
  function click(detail = 1) {
    const event = new Event("click", { cancelable: true });
    Object.defineProperty(event, "detail", { value: detail });
    swipe.handlers.clickCapture(event as MouseEvent);
    return event;
  }
  return { ...swipe, pointer, click, swipes, positions, captured, disable: () => { enabled = false; } };
}

test("image swipes select one direction on release, not during dragging", () => {
  const swipe = fixture();
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(190));
  swipe.handlers.pointermove(swipe.pointer(60));
  assert.deepEqual(swipe.swipes, []);
  assert.deepEqual([...swipe.captured], [1]);
  assert.deepEqual(swipe.positions.at(-1), [-63, true]);
  swipe.handlers.pointerup(swipe.pointer(40));
  assert.deepEqual(swipe.swipes, ["left"]);
  assert.deepEqual(swipe.positions.at(-1), [0, false]);
  assert.equal(swipe.captured.size, 0);
  swipe.handlers.pointerup(swipe.pointer(40));
  assert.equal(swipe.swipes.length, 1);
});

test("mobile implicit capture can move from the image to the surface without cancelling the swipe", () => {
  const swipe = fixture();
  const image = {} as HTMLElement;
  swipe.handlers.pointerdown(swipe.pointer(200, 100, { target: image }));
  swipe.handlers.pointermove(swipe.pointer(185, 100, { target: image }));
  // Touchscreens initially capture the <img>. Transferring capture to the
  // artboard sends a bubbling lostpointercapture from that child, not a cancel.
  swipe.handlers.lostpointercapture(swipe.pointer(185, 100, { target: image }));
  swipe.handlers.pointermove(swipe.pointer(90));
  swipe.handlers.pointerup(swipe.pointer(60));
  assert.deepEqual(swipe.swipes, ["left"]);
  assert.equal(swipe.captured.size, 0);
});

test("pen implicit capture and child capture events do not cancel a valid horizontal drag", () => {
  const swipe = fixture();
  const child = {} as HTMLElement;
  swipe.handlers.pointerdown(swipe.pointer(40, 100, { pointerType: "pen", target: child }));
  swipe.handlers.pointermove(swipe.pointer(65, 100, { pointerType: "pen", target: child }));
  swipe.handlers.lostpointercapture(swipe.pointer(65, 100, { pointerType: "pen", target: child }));
  swipe.handlers.pointerup(swipe.pointer(160, 100, { pointerType: "pen" }));
  assert.deepEqual(swipe.swipes, ["right"]);
});

test("taps, vertical scrolls and short or diagonal gestures do not switch articles", () => {
  for (const [x, y] of [[199, 100], [198, 170], [180, 102], [150, 160]]) {
    const swipe = fixture();
    swipe.handlers.pointerdown(swipe.pointer(200));
    swipe.handlers.pointermove(swipe.pointer(x!, y!));
    swipe.handlers.pointerup(swipe.pointer(x!, y!));
    assert.deepEqual(swipe.swipes, []);
    assert.equal(swipe.captured.size, 0);
  }
  const swipe = fixture();
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(198, 110));
  swipe.handlers.pointermove(swipe.pointer(60, 120));
  swipe.handlers.pointerup(swipe.pointer(60, 120));
  assert.deepEqual(swipe.swipes, [], "a vertical gesture must never turn into a horizontal swipe");
});

test("a swipe cannot activate its image link, but the next tap and keyboard click can", () => {
  const swipe = fixture();
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(120));
  swipe.handlers.pointerup(swipe.pointer(100));
  assert.equal(swipe.click().defaultPrevented, true);
  assert.equal(swipe.click(0).defaultPrevented, false);
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointerup(swipe.pointer(200));
  assert.equal(swipe.click().defaultPrevented, false);
});

test("cancel, lost capture, pinch and leaving before a drag release without navigation", () => {
  for (const cancel of ["pointercancel", "lostpointercapture"] as const) {
    const swipe = fixture();
    swipe.handlers.pointerdown(swipe.pointer(200));
    swipe.handlers.pointermove(swipe.pointer(120));
    swipe.handlers[cancel](swipe.pointer(120));
    swipe.handlers.pointerup(swipe.pointer(80));
    assert.deepEqual(swipe.swipes, []);
    assert.equal(swipe.captured.size, 0);
  }
  const swipe = fixture();
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(120));
  swipe.handlers.pointerdown(swipe.pointer(220, 100, { pointerId: 2, isPrimary: false }));
  swipe.handlers.pointerup(swipe.pointer(80));
  assert.deepEqual(swipe.swipes, []);
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointerleave(swipe.pointer(200));
  swipe.handlers.pointerup(swipe.pointer(80));
  assert.deepEqual(swipe.swipes, []);
});

test("desktop dragging works both ways and disabling/resetting cancels stale gestures", () => {
  const swipe = fixture();
  swipe.handlers.pointerdown(swipe.pointer(40, 100, { pointerType: "mouse" }));
  swipe.handlers.pointermove(swipe.pointer(180, 100, { pointerType: "mouse" }));
  swipe.handlers.pointerup(swipe.pointer(200, 100, { pointerType: "mouse" }));
  assert.deepEqual(swipe.swipes, ["right"]);
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(120));
  swipe.disable();
  swipe.handlers.pointerup(swipe.pointer(50));
  assert.deepEqual(swipe.swipes, ["right"]);
  swipe.handlers.pointerdown(swipe.pointer(200));
  swipe.handlers.pointermove(swipe.pointer(50));
  swipe.handlers.pointerup(swipe.pointer(50));
  assert.deepEqual(swipe.swipes, ["right"]);
});
