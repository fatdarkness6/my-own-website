import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dateTimeValue, formatLocalizedDate, formatLocalizedPeriod, parseDatePeriod, presentDateLabel } from "../shared/localizedDate.ts";
import resume from "../content/resume.json" with { type: "json" };

test("full dates use the selected calendar and UTC consistently", () => {
  const source = "2026-10-28";
  for (const locale of ["en", "es", "de", "fr", "it", "ar", "fa"]) {
    const expected = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium", calendar: locale === "fa" ? "persian" : "gregory", timeZone: "UTC",
    }).format(new Date(`${source}T00:00:00Z`));
    assert.equal(formatLocalizedDate(source, locale), expected, locale);
  }
  assert.match(formatLocalizedDate(source, "fa"), /آبان.*۱۴۰۵/);
  assert.equal(dateTimeValue(source), source);
  assert.equal(formatLocalizedDate(source, "fa-IR"), formatLocalizedDate(source, "fa"));
  assert.equal(formatLocalizedDate(source, "bad_locale"), formatLocalizedDate(source, "en"));
});

test("partial dates preserve their precision across calendar boundaries", () => {
  assert.equal(formatLocalizedDate("2026-07", "en"), "Jul 2026");
  assert.equal(formatLocalizedDate("2026-07", "fa"), "تیر–مرداد ۱۴۰۵");
  assert.equal(formatLocalizedDate("2026-03", "fa"), "اسفند ۱۴۰۴ – فروردین ۱۴۰۵");
  assert.equal(formatLocalizedDate("2026", "fa"), "۱۴۰۴ – ۱۴۰۵");
  assert.equal(formatLocalizedDate(2026, "en"), "2026");
  assert.equal(dateTimeValue("2026-07"), "2026-07");
  assert.equal(dateTimeValue("2026"), "2026");
});

test("invalid dates never roll over or throw during rendering", () => {
  for (const value of ["2026-02-29", "2024-02-30", "2026-13", "2026-00", "2026-01-32", "tomorrow", "", "2026-1-2"]) {
    assert.equal(dateTimeValue(value), undefined, value);
    assert.equal(formatLocalizedDate(value, "fa"), value);
  }
  assert.ok(dateTimeValue("2024-02-29"));
  assert.equal(dateTimeValue(new Date("invalid")), undefined);
  assert.equal(dateTimeValue(new Date("2026-10-28T00:00:00Z")), "2026-10-28T00:00:00.000Z");
});

test("all existing résumé periods localize without editing the factual source", () => {
  for (const record of [...resume.experience, resume.profile.education, ...resume.profile.courses]) {
    const parsed = parseDatePeriod(record.period);
    assert.ok(parsed, record.period);
    assert.match(parsed.start, /^\d{4}-\d{2}$/);
    assert.match(formatLocalizedPeriod(record.period, "fa"), /[۰-۹]/);
    assert.ok(!/[A-Za-z]/.test(formatLocalizedPeriod(record.period, "fa")));
  }
  assert.deepEqual(parseDatePeriod("Jul 2026 - Present"), { start: "2026-07", end: null });
  assert.equal(formatLocalizedPeriod("Jul 2026 - Present", "fa"), "تیر–مرداد ۱۴۰۵ – اکنون");
  assert.equal(formatLocalizedPeriod("Jul 2026 - Present", "en"), "Jul 2026 – Present");
  for (const locale of ["en", "es", "de", "fr", "it", "ar", "fa"])
    assert.ok(formatLocalizedPeriod("2026-07 - Present", locale).endsWith(presentDateLabel(locale)));
});

test("period parsing supports ISO endpoints and safely leaves unsupported copy alone", () => {
  assert.deepEqual(parseDatePeriod("2024-12 – 2025-03"), { start: "2024-12", end: "2025-03" });
  assert.deepEqual(parseDatePeriod("2026-07-01 — Current"), { start: "2026-07-01", end: null });
  for (const value of ["Unknown", "2026-12 - 2026-01", "Fake 2026 - Present", "2026-02-30 - Present"])
    assert.equal(parseDatePeriod(value), undefined, value);
  assert.equal(formatLocalizedPeriod("Unknown", "fa"), "Unknown");
});

test("blog and résumé render the common semantic date component", async () => {
  const post = await readFile(new URL("../app/components/blog/PostMeta.vue", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/pages/resume.vue", import.meta.url), "utf8");
  assert.match(post, /<CommonLocalizedDate :value="post\.publishedAt"/);
  assert.match(page, /<CommonLocalizedDate :value="sourceExperience\[index\]!\.period" range/);
  const component = await readFile(new URL("../app/components/common/LocalizedDate.vue", import.meta.url), "utf8");
  assert.match(component, /:datetime="dateTimeValue\(value\)"/);
  assert.match(component, /unicode-bidi: isolate/);
});

test("project year metadata and copyright use the same locale policy", async () => {
  for (const [file, value] of [
    ["home/ProjectsSection.vue", "p.year"], ["projects/Archive.vue", "current.year"], ["home/CtaSection.vue", "copyrightDate"],
  ]) {
    const component = await readFile(new URL(`../app/components/${file}`, import.meta.url), "utf8");
    assert.ok(component.includes(`<CommonLocalizedDate :value="${value}"`), file);
  }
  assert.equal(formatLocalizedDate("2026-10-28", "fa", "year"), "۱۴۰۵");
  assert.equal(formatLocalizedDate("2026-10-28", "en", "year"), "2026");
});
