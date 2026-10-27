import { formatLocalizedDate, formatLocalizedPeriod, type DateValue, type LocalizedDateFormat } from "#shared/localizedDate";

/** Reactive locale policy shared by text animations, aria labels and date components. */
export function useLocalizedDate() {
  const { locale } = usePortfolioI18n();
  return {
    formatDate: (value: DateValue, format: LocalizedDateFormat = "medium") => formatLocalizedDate(value, locale.value, format),
    formatPeriod: (value: string) => formatLocalizedPeriod(value, locale.value),
  };
}
