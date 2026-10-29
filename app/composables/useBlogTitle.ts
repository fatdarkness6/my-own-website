import { homeCopy } from "~/assets/data/homeCopy";

/** Keep translated word order and the existing animation; accent only “Notes”. */
export function useBlogTitle(interval?: number) {
  const { c, content } = usePortfolioI18n();
  const title = content(homeCopy.blog.title);
  return computed(() => title.value.flatMap((segment) => {
    const accent = c("NOTES");
    const index = segment.text.indexOf(accent);
    const settings = { ...segment, interval: interval ?? segment.interval };
    if (index < 0) return [{ ...settings, accent: false }];
    return [
      { ...settings, text: segment.text.slice(0, index), accent: false },
      { ...settings, text: accent, accent: true },
      { ...settings, text: segment.text.slice(index + accent.length), accent: false },
    ].filter(({ text }) => text.length > 0);
  }));
}
