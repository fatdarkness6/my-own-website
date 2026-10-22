import data from "../../content/translations/ar.json" with { type: "json" };
import { defineLocale } from "../defineLocale.ts";

export const translations: Record<string, string> = data;

export default defineLocale(translations);
