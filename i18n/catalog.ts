import { translationKey } from "../app/utils/translationKey.ts";

export type Translation = readonly [source: string, translated: string];

// Treat punctuation as literal copy, not Vue i18n interpolation/link syntax.
export function catalog(entries: readonly Translation[]) {
  return {
    copy: Object.fromEntries(entries.map(([source, translated]) => [
      translationKey(source),
      translated.replace(/[{}@|]/g, (character) => `{'${character}'}`),
    ])),
  };
}
