import { translationKey } from "~/utils/translationKey";

const structuralKeys = new Set([
  "id", "projectId", "code", "icon", "class", "src", "href", "live", "repo",
  "file", "filename", "status", "category", "level", "number", "tone",
]);

export function usePortfolioI18n() {
  const { t, te, locale } = useI18n();
  const localePath = useLocalePath();
  const rtl = computed(() => locale.value === "ar" || locale.value === "fa");
  function c(source: string): string {
    const key = `copy.${translationKey(source)}`;
    return te(key, locale.value) || te(key, "en") ? t(key) : source;
  }
  function translate<T>(source: T, key = ""): T {
    if (structuralKeys.has(key)) return source;
    if (typeof source === "string") return c(source) as T;
    if (Array.isArray(source)) return source.map((item) => translate(item)) as T;
    if (source && typeof source === "object") {
      return Object.fromEntries(Object.entries(source).map(([field, value]) => [
        field, translate(value, field),
      ])) as T;
    }
    return source;
  }
  const content = <T>(source: T) => computed(() => translate(source));
  return { c, content, localePath, rtl, locale };
}
