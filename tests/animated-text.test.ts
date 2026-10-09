import test from "node:test";
import assert from "node:assert/strict";
import { graphemes, scrambleCharacters } from "../app/utils/animatedText.ts";

test("prepared scramble preserves emoji, combining marks, Persian joiners and punctuation", () => {
  const source = "A e\u0301 👩‍💻 می\u200cروم!";
  const characters = Object.freeze(graphemes(source));
  assert.equal(scrambleCharacters(characters, 0, ["X"]), "X X\u0301 👩‍💻 XX\u200cXXX!");
  assert.equal(scrambleCharacters(characters, 3, ["X"]), "A e\u0301 👩‍💻 XX\u200cXXX!");
  assert.equal(scrambleCharacters(characters, characters.length, ["X"]), source);
  assert.equal(scrambleCharacters(characters, 0, []), source);
  assert.equal(characters.join(""), source);
});

test("Arabic vowel marks and revealed prefixes remain intact across reused frames", () => {
  const characters = Object.freeze(graphemes("سَلام، دنیا!"));
  assert.equal(scrambleCharacters(characters, 0, ["ب"]), "بَببب، بببب!");
  assert.equal(scrambleCharacters(characters, 1, ["ب"]), "سَببب، بببب!");
  assert.equal(scrambleCharacters(characters, characters.length, ["ب"]), "سَلام، دنیا!");
});
