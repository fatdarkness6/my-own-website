import data from "../../content/translations/fr.json" with { type: "json" };
import { defineLocale } from "../defineLocale.ts";

export const translations: Record<string, string> = data;

export default defineLocale(translations);
