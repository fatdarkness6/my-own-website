import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { screenshotWidth } from "../app/utils/screenshotViewport.ts";

const aspect = 1270 / 714;
test("on-demand zoom doubles portrait image size for horizontal panning", () => {
  assert.equal(screenshotWidth(390, 680, aspect, 2), 780);
  assert.equal(screenshotWidth(320, 450, aspect, 2), 640);
});
test("every screenshot opening resets to fit instead of applying automatic mobile zoom", async () => {
  const viewer = await readFile(new URL("../app/components/projects/ScreenshotDialog.vue", import.meta.url), "utf8");
  assert.match(viewer, /function initialize\(\)\s*\{\s*stopObserving\(\);\s*zoom\.value = 1;/);
  assert.doesNotMatch(viewer, /zoom\.value = \$q\.screen/);
});
test("fit mode shows the complete screenshot, even in phone landscape", () => {
  assert.equal(screenshotWidth(390, 680, aspect, 1), 390);
  const width = screenshotWidth(844, 240, aspect, 1);
  assert.ok(width <= 844);
  assert.equal(width / aspect, 240);
});
test("zoom preserves image aspect on desktop and cannot exceed safe limits", () => {
  assert.equal(screenshotWidth(1200, 600, aspect, 0), 600 * aspect);
  assert.equal(screenshotWidth(1200, 600, aspect, 10), 600 * aspect * 4);
  assert.equal(screenshotWidth(390, 680, 0, 1), 0);
  assert.equal(screenshotWidth(0, 0, aspect, 1), 0);
});
