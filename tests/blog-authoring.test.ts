import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { containsDraftPlaceholder, createBlogDraft, prepareBlogAddition, runBlogAuthoring } from "../scripts/blog.ts";
import { validateBlogContent } from "../shared/validateBlogContent.ts";
import type { BlogPost } from "../app/assets/data/blog.ts";

const options = {
  id: "new-article", sourceUrl: "https://www.linkedin.com/posts/verified-new-post/",
  publishedAt: "2026-10-28", projectId: "ghssh",
};
const finishDraft = (draft: BlogPost) => JSON.parse(JSON.stringify(draft).replace(/TODO: [^"\\]+/g, "Author-reviewed article text")) as BlogPost;

test("blog scaffolds are structurally valid independent real-language versions", () => {
  const draft = createBlogDraft({ ...options, languages: "fa,en" }, ["ghssh"]);
  assert.deepEqual(validateBlogContent({ posts: [draft] }, ["ghssh"]), []);
  assert.deepEqual(Object.keys(draft.versions), ["fa", "en"]);
  assert.ok(containsDraftPlaceholder(draft));
  draft.versions.fa!.title = "عنوان فارسی";
  assert.notEqual(draft.versions.en!.title, draft.versions.fa!.title);
  assert.equal(draft.publishedAt, options.publishedAt);
  assert.equal("sourcePublishedAt" in draft, false);
  assert.equal("cover" in draft, false);
  assert.deepEqual(Object.keys(createBlogDraft(options, ["ghssh"]).versions), ["fa"]);
});

test("draft creation rejects unsupported languages, traversal, wrong metadata and unknown projects", () => {
  for (const languages of ["xx", "fa,fa", "", "en,"]) assert.throws(() => createBlogDraft({ ...options, languages }, ["ghssh"]));
  for (const change of [
    { id: "../private" }, { publishedAt: "2026-02-30" }, { projectId: "unknown" },
    { sourceUrl: "https://example.com/posts/post/" },
  ]) assert.throws(() => createBlogDraft({ ...options, ...change }, ["ghssh"]));
});

test("draft addition blocks placeholders and duplicates without mutating the existing archive", () => {
  const unfinished = createBlogDraft(options, ["ghssh"]);
  const ready = finishDraft(unfinished);
  const archive = { posts: [ready] };
  const snapshot = structuredClone(archive);
  assert.throws(() => prepareBlogAddition({ posts: [] }, unfinished, ["ghssh"]), /TODO:/);
  assert.throws(() => prepareBlogAddition(archive, ready, ["ghssh"]), /duplicates/);
  assert.throws(() => prepareBlogAddition(archive, { ...ready, id: "another-article", sourceUrl: ready.sourceUrl.slice(0, -1) }, ["ghssh"]), /source post already/);
  assert.deepEqual(archive, snapshot);
  const result = prepareBlogAddition({ posts: [] }, ready, ["ghssh"]);
  assert.equal(result.posts[0], ready);
});

test("authoring CLI creates unpublished drafts, checks safely, and explicitly adds only ready content", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-blog-authoring-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "content"));
  await writeFile(join(root, "content/projects.json"), JSON.stringify({ items: [{ id: "ghssh" }] }));
  const archivePath = join(root, "content/blog.json");
  const original = '{ "posts": [] }\n';
  await writeFile(archivePath, original);
  assert.match(await runBlogAuthoring(["--help"], root), /unpublished draft/);
  await assert.rejects(runBlogAuthoring(["new", "missing-source"], root), /--source/);
  assert.match(await runBlogAuthoring(["new", options.id, "--source", options.sourceUrl, "--date", options.publishedAt, "--project", "ghssh"], root), /website is unchanged/);
  assert.equal(await readFile(archivePath, "utf8"), original);
  await assert.rejects(runBlogAuthoring(["new", options.id, "--source", options.sourceUrl], root), /EEXIST/);
  const draftPath = `content/drafts/${options.id}.json`;
  await assert.rejects(runBlogAuthoring(["add", draftPath], root), /TODO:/);
  const ready = finishDraft(JSON.parse(await readFile(join(root, draftPath), "utf8")));
  await writeFile(join(root, draftPath), JSON.stringify(ready));
  assert.match(await runBlogAuthoring(["add", draftPath, "--check"], root), /No files changed/);
  assert.equal(await readFile(archivePath, "utf8"), original);
  assert.match(await runBlogAuthoring(["add", draftPath], root), /No commit, push or deployment/);
  assert.deepEqual(JSON.parse(await readFile(archivePath, "utf8")), { posts: [ready] });
  assert.deepEqual(JSON.parse(await readFile(join(root, draftPath), "utf8")), ready);
  await assert.rejects(runBlogAuthoring(["add", draftPath], root), /duplicates/);
});

test("draft addition checks cover files before changing the published catalog", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-blog-authoring-assets-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "content"));
  await writeFile(join(root, "content/projects.json"), JSON.stringify({ items: [{ id: "ghssh" }] }));
  const original = '{ "posts": [] }\n';
  await writeFile(join(root, "content/blog.json"), original);
  const ready = finishDraft(createBlogDraft(options, ["ghssh"]));
  ready.cover = { src: "/images/blog/new.jpg", optimizedSrc: "/images/blog/new.webp", width: 800, height: 600 };
  ready.versions.fa!.coverAlt = "شرح تصویر";
  await writeFile(join(root, "content/ready.json"), JSON.stringify(ready));
  await assert.rejects(runBlogAuthoring(["add", "content/ready.json"], root), /ENOENT/);
  assert.equal(await readFile(join(root, "content/blog.json"), "utf8"), original);
});
