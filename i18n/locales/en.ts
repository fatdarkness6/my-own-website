import data from "../../content/translations/en.json" with { type: "json" };
import { defineLocale } from "../defineLocale.ts";
import { english } from "../english.ts";
import { catalog } from "../catalog.ts";

export const translations: Record<string, string> = data;

export default {
  copy: {
    ...catalog(Object.values(english).map((source) => [source, source] as const)).copy,
    ...defineLocale(translations).copy,
  },
};
