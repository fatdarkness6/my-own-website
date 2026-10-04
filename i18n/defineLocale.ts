import { english } from "./english.ts";
import { catalog } from "./catalog.ts";

export function defineLocale(translations: Record<string, string>) {
  return catalog(Object.entries(translations).map(([key, translated]) => {
    const source = english[key as keyof typeof english];
    if (source === undefined) throw new Error(`Unknown translation key: ${key}`);
    return [source, translated] as const;
  }));
}
