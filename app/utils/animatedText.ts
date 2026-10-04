export const LATIN_GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ARABIC_GLITCH_CHARS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
export const PERSIAN_GLITCH_CHARS = `${ARABIC_GLITCH_CHARS}پچژگکی`;
const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : undefined;

/** Segment visible characters, preserving marks, emoji and Persian ZWNJ. */
export function graphemes(text: string): string[] {
  if (segmenter) {
    return Array.from(segmenter.segment(text),
      ({ segment }) => segment);
  }
  // Older mobile browsers: retain marks and joiners with the preceding letter.
  return text.match(/[^\p{Mark}\u200c\u200d](?:\p{Mark}|\u200c|\u200d[^\p{Mark}]\p{Mark}*)*/gu) ?? Array.from(text);
}

export function textDirection(text: string): "rtl" | "ltr" {
  for (const character of text) {
    if (/\p{Script=Arabic}/u.test(character)) return "rtl";
    if (/\p{Letter}/u.test(character)) return "ltr";
  }
  return "ltr";
}

export function glitchAlphabet(text: string, requested = LATIN_GLITCH_CHARS): string[] {
  if (/\p{Script=Arabic}/u.test(text)) {
    return Array.from(/[پچژگکی]/u.test(text) ? PERSIAN_GLITCH_CHARS : ARABIC_GLITCH_CHARS);
  }
  return graphemes(requested);
}

export function scrambleGrapheme(character: string, alphabet: readonly string[]): string {
  const replacement = alphabet[Math.floor(Math.random() * alphabet.length)];
  // Keep Arabic vowel marks and Persian join-control characters on the letter.
  return replacement ? character.replace(/[\p{Letter}\p{Number}]/u, replacement) : character;
}

export function scrambleText(text: string, revealed: number, alphabet: readonly string[]): string {
  return graphemes(text).map((character, index) => {
    if (index < revealed || !/\p{Letter}|\p{Number}/u.test(character)) return character;
    return scrambleGrapheme(character, alphabet);
  }).join("");
}
