import test from "node:test";
import assert from "node:assert/strict";
import { blogPosts, blogReadingMinutes, type BlogPost } from "../app/assets/data/blog.ts";
import { blogPreview, getBlogPost } from "../shared/blogRoutes.ts";

test("article lookup accepts only published translations and rejects inherited object keys", () => {
  const id = blogPosts[0]!.id;
  assert.equal(getBlogPost(id, "en")?.version, blogPosts[0]!.versions.en);
  assert.equal(getBlogPost(id, "fa")?.version, blogPosts[0]!.versions.fa);
  for (const locale of ["de", "zz", "constructor", "toString", "__proto__"])
    assert.equal(getBlogPost(id, locale), undefined, locale);
  for (const slug of ["missing", [id], undefined]) assert.equal(getBlogPost(slug, "en"), undefined);
});

test("an index recommends an available version without creating fallback article routes", () => {
  const post = blogPosts[0]!;
  assert.equal(blogPreview(post, "fa").language, "fa");
  assert.equal(blogPreview(post, "de").language, "en");
  assert.equal(blogPreview(post, "constructor").language, "en");
  const persianOnly: BlogPost = { ...post, versions: { fa: post.versions.fa } };
  assert.equal(blogPreview(persianOnly, "en").language, "fa");
  assert.equal(blogPreview(persianOnly, "en").version, post.versions.fa);
  assert.equal(getBlogPost(post.id, "de"), undefined);
});

test("reading estimates are calculated from real content and do not require extra metadata", () => {
  const version = blogPosts[0]!.versions.en!;
  assert.ok(blogReadingMinutes(version) >= 1);
  assert.equal(blogReadingMinutes({ ...version, sections: [{ id: "long", title: "Long", paragraphs: ["word ".repeat(1000)] }] }), 6);
  assert.equal(blogPosts[0]!.sourcePublishedAt, undefined, "a relative LinkedIn timestamp is not an exact publication date");
});
