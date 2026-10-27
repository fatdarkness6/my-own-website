import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseSfc } from "@vue/compiler-sfc";
import { NodeTypes, parse as parseTemplate, type ElementNode, type TemplateChildNode } from "@vue/compiler-dom";
import { HOME_SECTIONS, SCENE_IDS, homeSection } from "../shared/homeSections.ts";
import { blogPosts } from "../app/assets/data/blog.ts";
import { blogLocales, blogPath, blogPreview, getBlogPost } from "../shared/blogRoutes.ts";
import { locales } from "../shared/locales.ts";
import { useScrollSections } from "../app/composables/useScrollSections.ts";

function elements(children: TemplateChildNode[]): ElementNode[] {
  return children.flatMap((node) => node.type === NodeTypes.ELEMENT ? [node, ...elements(node.children)] : []);
}

test("Home navigation assigns Blog its own panel and background without renumbering existing scenes", () => {
  assert.equal(new Set(HOME_SECTIONS.map(({ id }) => id)).size, HOME_SECTIONS.length);
  assert.equal(new Set(HOME_SECTIONS.map(({ scene }) => scene)).size, HOME_SECTIONS.length);
  const projectsIndex = HOME_SECTIONS.findIndex(({ id }) => id === "projects");
  assert.equal(HOME_SECTIONS[projectsIndex + 1]?.id, "blog");
  assert.equal(HOME_SECTIONS[projectsIndex + 2]?.id, "resume");
  assert.deepEqual(homeSection("blog"), { id: "blog", label: "Blog", scene: "dispatch" });
  assert.equal(homeSection("missing"), undefined);
  assert.deepEqual(SCENE_IDS, { signal: 0, terminal: 1, rain: 2, circuit: 3, radar: 4, dispatch: 5 });
  for (const section of HOME_SECTIONS) {
    assert.ok(section.label.trim());
    assert.equal(typeof SCENE_IDS[section.scene], "number");
  }
});

test("rendered snap panel order matches the shared scene and accessible-navigation inventory", async () => {
  const file = await readFile(new URL("../app/pages/index.vue", import.meta.url), "utf8");
  const { descriptor, errors } = parseSfc(file);
  assert.deepEqual(errors, []);
  assert.ok(descriptor.template);
  const nodes = elements(parseTemplate(descriptor.template.content).children);
  const panels = nodes.filter(({ tag }) => tag === "ScrollSection");
  const idOf = (node: ElementNode) => {
    const id = node.props.find((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === "id");
    return id?.type === NodeTypes.ATTRIBUTE ? id.value?.content : undefined;
  };
  assert.deepEqual(panels.map(idOf), HOME_SECTIONS.map(({ id }) => id));
  const blogPanel = panels.find((node) => idOf(node) === "blog")!;
  assert.ok(elements(blogPanel.children).some(({ tag }) => tag === "HomeBlogSection"), "the Blog component belongs inside its own snap panel");
});

test("snap navigation reaches Blog between Projects and Resume in both directions", (context) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const timers: (() => void)[] = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
  } });
  const state = useScrollSections();
  assert.equal(state.sections.length, 0);
  for (const { id } of HOME_SECTIONS) state.registerSection({ id, el: { id } as HTMLElement });
  state.resetToTop();
  context.after(() => {
    for (const timer of timers) timer();
    for (const { id } of HOME_SECTIONS) state.unregisterSection(id);
    state.resetToTop();
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  });
  const settle = () => timers.at(-1)?.();
  state.goTo(HOME_SECTIONS.findIndex(({ id }) => id === "projects"));
  settle();
  state.next();
  assert.equal(state.sections[state.currentIndex.value]?.id, "blog");
  assert.equal(state.direction.value, "down");
  assert.equal(state.isAnimating.value, true);
  state.next();
  assert.equal(state.sections[state.currentIndex.value]?.id, "blog", "one transition cannot skip the new panel");
  settle();
  state.next();
  assert.equal(state.sections[state.currentIndex.value]?.id, "resume");
  settle();
  state.prev();
  assert.equal(state.sections[state.currentIndex.value]?.id, "blog");
  assert.equal(state.direction.value, "up");
});

test("every Home article preview can link to a real published language, including RTL interface fallback", () => {
  assert.ok(blogPosts.length > 0);
  for (const post of blogPosts) {
    for (const { code } of locales) {
      const preview = blogPreview(post, code);
      assert.ok(blogLocales(post).includes(preview.language));
      assert.equal(getBlogPost(post.id, preview.language)?.version, preview.version);
      assert.ok(preview.version.title.trim());
      assert.equal(blogPath(post.id), `/blog/${post.id}`);
      if (post.versions[code]) assert.equal(preview.language, code);
      else assert.equal(getBlogPost(post.id, code), undefined, "the Home link must use the actual preview language, not fabricate a translated article route");
    }
  }
});
