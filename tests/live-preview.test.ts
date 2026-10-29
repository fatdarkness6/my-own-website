import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { readFile } from "node:fs/promises";
import { compileScript, parse } from "@vue/compiler-sfc";
import { transpileModule, ModuleKind } from "typescript";
import * as Vue from "vue";
import source from "../content/projects.json" with { type: "json" };
import template from "../content/templates/project.json" with { type: "json" };
import { validateProjectContent } from "../shared/validateProjectContent.ts";

const compiled = await Promise.all(["LivePreview", "LivePreviewFrame"].map(async (name) => {
  const file = await readFile(new URL(`../app/components/projects/${name}.vue`, import.meta.url), "utf8");
  const { descriptor } = parse(file);
  return transpileModule(compileScript(descriptor, { id: name, inlineTemplate: true }).content,
    { compilerOptions: { module: ModuleKind.CommonJS } }).outputText;
}));

type Node = { tag: string; props: Record<string, any>; children: Node[]; parent?: Node; text: string;
  clientWidth: number; clientHeight: number; focus: () => void; scrollIntoView: () => void };

function mountPreview(t: TestContext, mobile = false, url: string | null = "https://www.arvandtermotec.com/en") {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const observers: Observer[] = [];
  class Observer {
    disconnect = t.mock.fn();
    constructor() { observers.push(this); }
    observe() {}
  }
  function component(code: string) {
    const module = { exports: {} as { default: Vue.Component } };
    new Function("require", "module", "exports", "usePortfolioI18n", "useQuasar", "ResizeObserver", code)(
      (id: string) => { assert.equal(id, "vue"); return Vue; }, module, module.exports,
      () => ({ c: (text: string) => text }), () => ({ screen: { lt: { md: mobile } } }), Observer,
    );
    return module.exports.default;
  }
  const make = (tag: string, text = ""): Node => ({ tag, text, props: {}, children: [], clientWidth: 800, clientHeight: 500, focus() {}, scrollIntoView() {} });
  const remove = (node: Node) => {
    if (!node.parent) return;
    const index = node.parent.children.indexOf(node);
    if (index >= 0) node.parent.children.splice(index, 1);
    node.parent = undefined;
  };
  const renderer = Vue.createRenderer<Node, Node>({
    createElement: make, createText: text => make("#text", text), createComment: () => make("#comment"),
    insert(node, parent, anchor) { remove(node); node.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); },
    remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
    patchProp(node, key, _before, after) { node.props[key] = after; },
    parentNode: node => node.parent || null,
    nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
  });
  const currentUrl = Vue.ref(url ?? undefined);
  const root = make("root");
  const Preview = component(compiled[0]!);
  const app = renderer.createApp({ setup: () => () => Vue.h(Preview, { url: currentUrl.value, name: "Arvand" }, () => Vue.h("img", { src: "/poster.webp" })) });
  const button = Vue.defineComponent({ inheritAttrs: false, setup: (_props, { attrs, slots }) => () => Vue.h("button", attrs, slots.default?.()) });
  const card = Vue.defineComponent({ setup: (_props, { slots }) => () => Vue.h("div", slots.default?.()) });
  app.component("QBtn", button);
  app.component("QCard", card);
  app.component("QIcon", Vue.defineComponent({ render: () => Vue.h("i") }));
  app.component("QSpinner", Vue.defineComponent({ render: () => Vue.h("i") }));
  app.component("QDialog", Vue.defineComponent({ props: ["modelValue"], setup: (props, { slots }) => () => props.modelValue ? Vue.h("div", { role: "dialog" }, slots.default?.()) : null }));
  app.component("ProjectsLivePreviewFrame", component(compiled[1]!));
  app.mount(root);
  t.after(() => app.unmount());
  const all = (node = root): Node[] => [node, ...node.children.flatMap(child => all(child))];
  const text = (node: Node): string => node.text + node.children.map(text).join("");
  const frames = () => all().filter(node => node.tag === "iframe");
  async function click(label: string) {
    const target = all().find(node => node.tag === "button" && (node.props["aria-label"] === label || text(node) === label));
    assert.ok(target, `Missing button: ${label}`);
    target.props.onClick();
    await Vue.nextTick();
  }
  return { root, all, frames, click, currentUrl, observers, text };
}

test("preview URLs are opt-in and authoring rejects insecure or source-only embeds", () => {
  assert.deepEqual(source.items.filter(item => "previewUrl" in item).map(item => item.id), ["arilvo", "docintel", "arvand-termo-tec", "raymand-group"]);
  for (const previewUrl of ["http://example.com", "javascript:alert(1)", "https://user:password@example.com", ""]) {
    const item = { ...template, live: "https://example.com", previewUrl };
    assert.match(validateProjectContent({ items: [item], featuredIds: [item.id] }).join("\n"), /previewUrl/);
  }
  const item = { ...template, previewUrl: "https://example.com" };
  assert.match(validateProjectContent({ items: [item], featuredIds: [item.id] }).join("\n"), /previewUrl/);
});

test("explicit activation mounts one iframe; viewport switches preserve it; reload and stop clean up", async (t) => {
  const preview = mountPreview(t);
  assert.equal(preview.frames().length, 0);
  await preview.click("Try live");
  assert.equal(preview.frames().length, 1);
  const first = preview.frames()[0]!;
  assert.equal(first.props.src, "https://www.arvandtermotec.com/en");
  assert.equal(first.props.width, 1280);
  assert.ok(!first.props.sandbox.includes("allow-top-navigation"));
  await preview.click("Mobile");
  assert.equal(preview.frames()[0], first);
  assert.equal(first.props.width, 390);
  first.props.onLoad();
  await Vue.nextTick();
  await preview.click("Reload preview");
  assert.equal(preview.frames().length, 1);
  assert.notEqual(preview.frames()[0], first);
  t.mock.timers.tick(12000);
  await Vue.nextTick();
  assert.ok(preview.text(preview.root).includes("Taking longer than expected?"));
  await preview.click("Stop preview");
  assert.equal(preview.frames().length, 0);
  assert.ok(preview.text(preview.root).includes("Try live"));
  assert.equal(preview.observers[0]!.disconnect.mock.callCount(), 1);
});

test("phones mount one mobile iframe in a dialog and closing it stops the site", async (t) => {
  const preview = mountPreview(t, true);
  await preview.click("Try live");
  assert.equal(preview.all().filter(node => node.props.role === "dialog").length, 1);
  assert.equal(preview.frames().length, 1);
  assert.equal(preview.frames()[0]!.props.width, 390);
  await preview.click("Stop preview");
  assert.equal(preview.frames().length, 0);
});

test("non-enabled projects keep the poster only", (t) => {
  const poster = mountPreview(t, false, null);
  assert.equal(poster.frames().length, 0);
  assert.ok(!poster.text(poster.root).includes("Try live"));
});

test("a changed project URL stops a running preview", async (t) => {
  const preview = mountPreview(t);
  await preview.click("Try live");
  preview.currentUrl.value = undefined;
  await Vue.nextTick();
  assert.equal(preview.frames().length, 0);
});
