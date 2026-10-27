/** One date policy for SSR, components and content adapters. Stored dates stay Gregorian ISO. */
export type LocalizedDateFormat = "short" | "medium" | "long" | "month" | "year";
export type DateValue = string | number | Date;

const languages = ["en", "es", "de", "fr", "it", "ar", "fa"];
const current: Record<string, string> = {
  en: "Present", es: "Actualidad", de: "Heute", fr: "Aujourd’hui", it: "Presente", ar: "حتى الآن", fa: "اکنون",
};
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatters = new Map<string, Intl.DateTimeFormat>();
const language = (locale: string) => {
  const code = locale.toLowerCase().split(/[-_]/)[0]!;
  return languages.includes(code) ? code : "en";
};

function formatter(locale: string, format: LocalizedDateFormat) {
  const code = language(locale);
  const key = `${code}:${format}`;
  let result = formatters.get(key);
  if (!result) {
    result = new Intl.DateTimeFormat(code, {
      timeZone: "UTC", calendar: code === "fa" ? "persian" : "gregory",
      ...(format === "month" ? { month: "short", year: "numeric" }
        : format === "year" ? { year: "numeric" } : { dateStyle: format }),
    });
    formatters.set(key, result);
  }
  return result;
}

/** Reject rollover dates such as February 30 rather than silently changing résumé facts. */
function parse(value: DateValue): { date: Date; precision: "day" | "month" | "year"; iso: string } | undefined {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return;
    return { date: value, precision: "day", iso: value.toISOString() };
  }
  const iso = String(value);
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(iso);
  if (!match) return;
  const year = Number(match[1]), month = Number(match[2] ?? 1), day = Number(match[3] ?? 1);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return;
  const date = new Date(`${match[1]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return;
  return { date, precision: match[3] ? "day" : match[2] ? "month" : "year", iso };
}

export function dateTimeValue(value: DateValue): string | undefined { return parse(value)?.iso; }
export function presentDateLabel(locale: string): string { return current[language(locale)]!; }

export function formatLocalizedDate(value: DateValue, locale: string, format: LocalizedDateFormat = "medium"): string {
  const parsed = parse(value);
  if (!parsed) return String(value);
  const style = parsed.precision === "year" ? "year" : parsed.precision === "month" ? "month" : format;
  const output = formatter(locale, style);
  // A Gregorian month/year can overlap two Persian months/years. Preserve that
  // source precision instead of inventing an exact day or choosing only one month.
  if (language(locale) === "fa" && parsed.precision !== "day") {
    const last = new Date(parsed.date);
    if (parsed.precision === "month") last.setUTCMonth(last.getUTCMonth() + 1, 0);
    else last.setUTCFullYear(last.getUTCFullYear() + 1, 0, 0);
    const startParts = output.formatToParts(parsed.date);
    const endParts = output.formatToParts(last);
    const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
    const startYear = part(startParts, "year"), endYear = part(endParts, "year");
    if (startYear !== endYear) return `${output.format(parsed.date)} – ${output.format(last)}`;
    if (style === "month" && part(startParts, "month") !== part(endParts, "month"))
      return `${part(startParts, "month")}–${part(endParts, "month")} ${startYear}`;
  }
  return output.format(parsed.date);
}

/** Existing editable résumé periods remain supported; new content can use YYYY-MM. */
export function parseDatePeriod(value: string): { start: string; end: string | null } | undefined {
  const endpoints = value.split(/\s+(?:-|–|—)\s+/);
  if (endpoints.length !== 2) return;
  const endpoint = (input: string): string | undefined => {
    if (parse(input)) return input;
    const match = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/.exec(input);
    return match ? `${match[2]}-${String(months.indexOf(match[1]!) + 1).padStart(2, "0")}` : undefined;
  };
  const start = endpoint(endpoints[0]!);
  const end = /^(?:present|current|now)$/i.test(endpoints[1]!) ? null : endpoint(endpoints[1]!);
  if (start && end !== undefined && (end === null || start <= end)) return { start, end };
}

export function formatLocalizedPeriod(value: string, locale: string): string {
  const range = parseDatePeriod(value);
  return range ? `${formatLocalizedDate(range.start, locale)} – ${range.end ? formatLocalizedDate(range.end, locale) : presentDateLabel(locale)}` : value;
}
