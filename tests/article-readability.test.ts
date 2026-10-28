import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseSfc } from "@vue/compiler-sfc";
import { NodeTypes, parse as parseTemplate, type ElementNode, type TemplateChildNode } from "@vue/compiler-dom";

async function source(file: string) { return readFile(new URL(`../${file}`, import.meta.url), "utf8"); }
async function nodes(file: string) {
  const { descriptor, errors } = parseSfc(await source(file));
  assert.deepEqual(errors, []);
  function elements(children: TemplateChildNode[]): ElementNode[] {
    return children.flatMap((node) => node.type === NodeTypes.ELEMENT ? [node, ...elements(node.children)] : []);
  }
  return elements(parseTemplate(descriptor.template!.content).children);
}

test("article chapter headings stay readable rather than periodically scrambling during reading", async () => {
  const body = await nodes("app/components/blog/ArticleBody.vue");
  assert.ok(body.some(({ tag }) => tag === "h2"));
  assert.ok(!body.some(({ tag }) => /PageGlitch|TypedLine|GlitchText/.test(tag)), "reading prose must not schedule glitch timers");
  const article = await nodes("app/pages/blog/[slug].vue");
  const h1 = article.find(({ tag }) => tag === "h1")!;
  const heading = h1.children.find((node) => node.type === NodeTypes.ELEMENT && node.tag === "AnimationTypedLine") as ElementNode;
  assert.ok(heading, "keep the existing once-per-visit heading reveal");
  assert.ok(!heading.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE ? prop.name === "glitch" : prop.type === NodeTypes.DIRECTIVE && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION && prop.arg.content === "glitch"));
});

test("cover art and embedded project images reuse the same clean, zoomable image presentation", async () => {
  for (const file of ["app/pages/blog/[slug].vue", "app/components/blog/ArticleFigure.vue"]) {
    const tree = await nodes(file);
    assert.ok(tree.some(({ tag }) => tag === "ArticleImage"));
    assert.ok(!tree.some(({ tag }) => /GlitchCard/.test(tag)), "diagrams must not be dimmed, scan-lined or scrambled while being read");
  }
  const image = await source("app/components/blog/ArticleImage.vue");
  assert.ok(image.includes('~/components/projects/ScreenshotDialog.vue'), "reuse the existing zoom/pan viewer instead of duplicating its logic");
  assert.ok(image.includes('aria-haspopup="dialog"'));
  assert.ok(image.includes(':alt="alt"'));
  assert.ok(image.includes(':width="image.width"'));
  assert.ok(image.includes(':height="image.height"'));
  assert.ok(image.includes("priority ? 'eager' : 'lazy'"));
});

test("shared glitch components retain opt-in reading controls without changing their default elsewhere", async () => {
  const component = await source("app/components/Common/PageGlitch.vue");
  assert.ok(component.includes("enabled: true"));
  assert.ok(component.includes('v-if="enabled && introReady'));
  const article = await source("app/pages/blog/[slug].vue");
  assert.ok(article.includes(':enabled="$q.screen.gt.sm"'), "small-screen article chrome must not periodically scramble");
});
