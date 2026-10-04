import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowIntro } from "../app/utils/introSession.ts";

test("a fresh tab shows the intro on any initial route", () => {
  assert.equal(shouldShowIntro("navigate", false), true);
});

test("changing the address-bar route within a visit skips the intro", () => {
  assert.equal(shouldShowIntro("navigate", true), false);
});

test("an explicit reload replays the intro even after entry", () => {
  assert.equal(shouldShowIntro("reload", true), true);
  assert.equal(shouldShowIntro("reload", false), true);
});

test("browser history within an entered visit skips the intro", () => {
  assert.equal(shouldShowIntro("back_forward", true), false);
});

test("missing navigation timing uses the tab's entry state", () => {
  assert.equal(shouldShowIntro(undefined, true), false);
  assert.equal(shouldShowIntro(undefined, false), true);
});
