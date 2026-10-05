import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";
import { graphemes, textDirection, glitchAlphabet, scrambleText, scrambleGrapheme } from "../app/utils/animatedText.ts";
import { translationKey } from "../app/utils/translationKey.ts";
import { catalog } from "../i18n/catalog.ts";
import { createI18n } from "vue-i18n";
import { readFile } from "node:fs/promises";
import postcss from "postcss";
import rtlcss from "postcss-rtlcss";

const jiti = createJiti(import.meta.url);
const { english } = await jiti.import<{ english: Record<string, string> }>("../i18n/english.ts");
const codes = ["es", "de", "fr", "it", "ar", "fa"];
const languages = await Promise.all(codes.map(async (code) => ({
  code,
  ...await jiti.import<{ translations: Record<string, string> }>(`../i18n/locales/${code}.ts`),
})));
const englishLocale = await jiti.import<{ translations: Record<string, string>; default: ReturnType<typeof catalog> }>("../i18n/locales/en.ts");

test("source-text keys do not collide", () => {
  const seen = new Map<string, string>();
  for (const source of Object.values(english)) {
    const key = translationKey(source);
    assert.ok(!seen.has(key) || seen.get(key) === source, `Collision: ${source}`);
    seen.set(key, source);
  }
});

test("every language has the same catalog and valid, non-empty translations", () => {
  const expected = Object.keys(languages[0]!.translations).sort();
  assert.ok(expected.length > 500);
  for (const { code, translations } of languages) {
    assert.deepEqual(Object.keys(translations).sort(), expected, code);
    for (const [key, value] of Object.entries(translations)) {
      assert.equal(typeof english[key], "string", `${code}: unknown key ${key}`);
      assert.ok(value.trim(), `${code}: empty translation ${key}`);
    }
  }
});

test("page titles, descriptions and project summaries are localized", () => {
  const required = Object.entries(english).filter(([key]) =>
    key.startsWith("seo") || /^projects\.[^.]+\.(summary|description|availability)$/.test(key));
  for (const { code, translations } of languages) {
    const translated = new Set(Object.keys(translations).map((key) => translationKey(english[key]!)));
    for (const [key, source] of required) {
      assert.ok(translated.has(translationKey(source)), `${code}: missing ${key}`);
    }
  }
});

test("professional copy is present in every language, including English", async () => {
  for (const { code, translations } of languages) {
    for (const key of Object.keys(englishLocale.translations)) {
      assert.ok(translations[key]?.trim(), `${code}: missing editorial copy ${key}`);
    }
    const language = await jiti.import<{ default: ReturnType<typeof catalog> }>(`../i18n/locales/${code}.ts`);
    const localized = createI18n({ legacy: false, locale: code, messages: { [code]: language.default } });
    for (const key of Object.keys(englishLocale.translations)) {
      assert.equal(localized.global.t(`copy.${translationKey(english[key]!)}`), translations[key], `${code}: ${key}`);
      if (!["ar", "fa"].includes(code)) assert.ok(!/\p{Script=Arabic}/u.test(translations[key]!), `${code}: incorrect script ${key}`);
    }
    if (["ar", "fa"].includes(code)) {
      assert.ok(/\p{Script=Arabic}/u.test(translations["homeCopy.hero.tagline.2.text"]!));
      assert.ok(/\p{Script=Arabic}/u.test(translations.contactDescription!));
    }
  }
  const i18n = createI18n({ legacy: false, locale: "en", messages: { en: englishLocale.default } });
  for (const [key, value] of Object.entries(englishLocale.translations)) {
    assert.equal(i18n.global.t(`copy.${translationKey(english[key]!)}`), value, key);
  }
  const persian = languages.find(({ code }) => code === "fa")!.translations;
  const visibleCopy = Object.values(persian).join("\n");
  for (const phrase of ["و سیستم‌های تحویل‌شده.", "تجربهٔ پشت کد.", "یک کانال ارتباطی باز کنید", "من سیستم را می‌سازم"]) {
    assert.ok(!visibleCopy.includes(phrase), phrase);
  }
  const { homeCopy } = await jiti.import<{ homeCopy: { hero: { technologies: { text: string }[]; tagline: { text: string }[] } } }>("../app/assets/data/homeCopy.ts");
  assert.equal(homeCopy.hero.technologies.map(({ text }) => text).join(""), "Vue • Nuxt • Node.js");
  assert.ok(!homeCopy.hero.tagline.some(({ text }) => text.includes("Vue")));
});

test("graphemes preserve Arabic marks, Persian ZWNJ and emoji", () => {
  for (const text of ["سَلَام", "می‌سازم", "👩‍💻", "é", "e\u0301"]) {
    assert.equal(graphemes(text).join(""), text);
  }
  assert.equal(graphemes("👩‍💻").length, 1);
  assert.equal(graphemes("e\u0301").length, 1);
  assert.equal(textDirection("// مهندس نرم‌افزار"), "rtl");
  assert.equal(textDirection("Vue / Nuxt"), "ltr");
  assert.equal(scrambleGrapheme("ی‌", ["گ"]), "گ‌");
  assert.equal(scrambleGrapheme("سَ", ["ب"]), "بَ");
});

test("typed text reserves only the final text, without phantom cursor spacing", async () => {
  const component = await readFile(new URL("../app/components/Animation/TypedLine.vue", import.meta.url), "utf8");
  assert.match(component, /class="typed-text__reserve" aria-hidden="true">\{\{ text \}\}<\/span>/);
  assert.match(component, /\.typed-text__accessible\s*\{[^}]*user-select:\s*none/s);
  const heroCss = await readFile(new URL("../app/assets/css/components/home/heroSection.css", import.meta.url), "utf8");
  assert.match(heroCss, /\.hero \.hero__tagline\s*\{\s*display:\s*block/);
  assert.match(heroCss, /\.hero \.hero__tagline--rtl\s*\{\s*display:\s*flex/);
  assert.match(heroCss, /\.hero \.hero__tagline--rtl\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.ok(!/\.hero \.hero__tagline--rtl\s*\{[^}]*flex-direction:\s*column/s.test(heroCss));
  assert.match(heroCss, /\.hero \.hero__tagline > bdi\s*\{[^}]*width:\s*auto/s);
  assert.match(heroCss, /\.hero \.hero__technologies\s*\{[^}]*text-align:\s*end/s);
  assert.match(heroCss, /\.hero \.hero__technologies :deep\(\.typed-text__live\)\s*\{\s*overflow:\s*visible/);
});

test("résumé page omits education and Italian A1, with consecutive section numbers", async () => {
  const { resumeProfile } = await jiti.import<{ resumeProfile: { languages: { name: string; level: string }[] } }>("../app/assets/data/resume.ts");
  assert.deepEqual(resumeProfile.languages, [{ name: "English", level: "C1" }]);
  const page = await readFile(new URL("../app/pages/resume.vue", import.meta.url), "utf8");
  assert.ok(!page.includes("cv-learning-title"));
  assert.equal(english.technical, "03 / TECHNICAL TOOLSET");
  assert.equal(english.projectArchive, "04 / PROJECT ARCHIVE");
  for (const { code, translations } of languages) {
    assert.ok(translations.technical!.startsWith("03 /"), code);
    assert.ok(translations.projectArchive!.startsWith("04 /"), code);
  }
});

test("glitch pools support Arabic/Persian and restore the exact original", () => {
  for (const text of ["سلام، دنیا!", "مرحبا بالعالم", "Vue / Nuxt"]) {
    const alphabet = glitchAlphabet(text);
    if (textDirection(text) === "rtl") assert.ok(alphabet.every((char) => /\p{Script=Arabic}/u.test(char)));
    assert.equal(scrambleText(text, graphemes(text).length, alphabet), text);
    assert.equal(scrambleText(" / • ", 0, alphabet), " / • ");
  }
});

test("Vue i18n syntax is escaped in literal terminal copy", () => {
  const source = "{code} | user@example.com";
  const result = catalog([[source, source]]);
  const escaped = result.copy[translationKey(source)]!;
  assert.ok(escaped.includes("{'@'}"));
  assert.ok(escaped.includes("{'|'}"));
  const i18n = createI18n({ legacy: false, locale: "en", messages: { en: result } });
  assert.equal(i18n.global.t(`copy.${translationKey(source)}`), source);
});

test("RTL CSS keeps code, emails and counters LTR", async () => {
  const css = await readFile(new URL("../app/assets/css/localization.css", import.meta.url), "utf8");
  const result = await postcss([rtlcss({
    mode: "override", rtlPrefix: ':where([dir="rtl"])',
    ltrPrefix: ':where([dir="ltr"])', bothPrefix: ':where([dir])',
  })]).process(css, { from: undefined });
  assert.ok(!/\.projects__count[^{}]*\{[^{}]*direction:\s*rtl/.test(result.css));
  assert.ok(!/input\[type="email"\][^{}]*\{[^{}]*direction:\s*rtl/.test(result.css));
});

test("header progress mirrors as one rail and popup anchors follow locale direction", async () => {
  const header = await readFile(new URL("../app/components/AppHeader.vue", import.meta.url), "utf8");
  const music = await readFile(new URL("../app/components/AppMusicControl.vue", import.meta.url), "utf8");
  assert.ok(header.includes('anchor="bottom start"'));
  assert.ok(music.includes('anchor="bottom end"'));
  assert.ok(header.includes("app-header__progress-track--rtl"));
  assert.ok(!header.includes("[rtl ? 'right' : 'left']"));
  const css = await readFile(new URL("../app/assets/css/components/appHeader.css", import.meta.url), "utf8");
  const result = await postcss([rtlcss({
    mode: "override", rtlPrefix: ':where([dir="rtl"])',
    ltrPrefix: ':where([dir="ltr"])', bothPrefix: ':where([dir])',
  })]).process(css, { from: undefined });
  const railRules: string[] = [];
  result.root.walkRules((rule) => {
    if (/app-header__progress-(bar|node)$/.test(rule.selector)) railRules.push(rule.selector);
  });
  // Physical coordinates stay unchanged inside the mirrored, text-free track.
  assert.deepEqual(railRules, [".app-header__progress-bar", ".app-header__progress-node"]);
  assert.match(result.css, /\.app-header__progress-track--rtl\s*\{\s*transform: scaleX\(-1\)/);
});
