import test from "node:test";
import assert from "node:assert/strict";
import { blogCover, blogPosts, blogReadingMinutes, type BlogPost } from "../app/assets/data/blog.ts";
import { projects } from "../app/assets/data/projects.ts";
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

test("all added articles have real EN/FA routes, source links and shared media", () => {
  for (const id of ["ghssh-windows-accounts", "ghssh-github-account-switching", "strapi-vercel-content", "nextjs-architecture-performance", "docintel-document-rag"]) {
    const article = getBlogPost(id, "en")!;
    assert.ok(article, id);
    assert.ok(getBlogPost(id, "fa"), id);
    assert.equal(getBlogPost(id, "ar"), undefined);
    assert.ok(article.post.sourceUrl.startsWith("https://www.linkedin.com/posts/arsam-sarkhosh-3abb40420_"));
    assert.equal(new URL(article.post.sourceUrl).search, "");
    assert.equal(article.post.sourcePublishedAt, undefined);
    assert.ok(blogCover(article.post)?.optimizedSrc, id);
    assert.deepEqual(article.version.sections.map(({ id }) => id), getBlogPost(id, "fa")!.version.sections.map(({ id }) => id));
  }
  const docintel = getBlogPost("docintel-document-rag", "en")!.post;
  assert.equal(docintel.cover, undefined);
  assert.equal(blogCover(docintel), projects.find(({ id }) => id === "docintel")!.screenshot);
  assert.equal(blogCover({ ...docintel, projectId: undefined }), undefined);
  const ownArtwork = blogPosts[0]!;
  assert.equal(blogCover(ownArtwork)?.src, ownArtwork.cover!.src);
});

test("the original ghssh launch stays distinct from the later Windows release", () => {
  const launch = getBlogPost("ghssh-github-account-switching", "en")!;
  const update = getBlogPost("ghssh-windows-accounts", "en")!;
  assert.notEqual(launch.post.sourceUrl, update.post.sourceUrl);
  assert.notEqual(blogCover(launch.post)?.src, blogCover(update.post)?.src);
  assert.equal(launch.post.projectId, update.post.projectId);
  for (const language of ["en", "fa"]) {
    const version = getBlogPost(launch.post.id, language)!.version;
    assert.equal(version.sections.find(({ id }) => id === "switch-and-return")?.code,
      "ghssh switch github_second\nghssh switch --back");
  }
  assert.ok(launch.version.sections.some(({ id }) => id === "safer-changes"));
});
