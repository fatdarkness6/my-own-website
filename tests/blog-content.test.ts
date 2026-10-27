import assert from "node:assert/strict";
import test from "node:test";
import source from "../content/blog.json" with { type: "json" };
import projects from "../content/projects.json" with { type: "json" };
import { validateBlogContent } from "../shared/validateBlogContent.ts";

const projectIds = projects.items.map(({ id }) => id);
const copy = () => structuredClone(source) as any;

test("real English and Persian blog content validates against portfolio projects", () => {
  assert.deepEqual(Object.keys(source.posts[0]!.versions).sort(), ["en", "fa"]);
  assert.deepEqual(validateBlogContent(source, projectIds), []);
});

test("empty archives and articles with only a real Persian translation are supported", () => {
  assert.deepEqual(validateBlogContent({ posts: [] }, projectIds), []);
  const content = copy();
  content.posts = [content.posts[0]];
  delete content.posts[0].versions.en;
  delete content.posts[0].projectId;
  for (const section of content.posts[0].versions.fa.sections) if (section.visual?.kind === "project") delete section.visual;
  content.posts[0].sourcePublishedAt = "2024-02-29";
  content.posts[0].sourceUrl = "https://linkedin.com/feed/update/urn:li:activity:123/";
  assert.deepEqual(validateBlogContent(content, []), []);
});

test("malformed archive, post and version shapes return authoring errors", () => {
  for (const content of [null, [], {}, { posts: null }, { posts: [null] }, { posts: [1] }]) {
    assert.ok(validateBlogContent(content).length, JSON.stringify(content));
  }
  for (const versions of [null, [], {}, { fa: null }]) {
    const content = copy();
    content.posts[0].versions = versions;
    assert.match(validateBlogContent(content).join("\n"), /versions/);
  }
});

test("post slugs must be unique lowercase words separated by hyphens", () => {
  const content = copy();
  content.posts.push(structuredClone(content.posts[0]));
  assert.match(validateBlogContent(content).join("\n"), /id duplicates strapi-nextjs-isr/);
  for (const id of ["", "Blog-Post", "blog_post", "-blog", "blog--post", "blog/"]) {
    content.posts = [structuredClone(source.posts[0])];
    content.posts[0].id = id;
    assert.match(validateBlogContent(content).join("\n"), /id must use lowercase/);
  }
});

test("source links must identify a canonical HTTPS LinkedIn post", () => {
  for (const sourceUrl of [
    "http://www.linkedin.com/posts/example/", "https://linkedin.com.evil.test/posts/example/",
    "https://evil.test/posts/example/", "https://www.linkedin.com/in/arsam/",
    "https://user:password@www.linkedin.com/posts/example/", "https://www.linkedin.com/posts/",
    "https://www.linkedin.com/posts/example/?tracking=1", "https://www.linkedin.com/posts/example/#comment",
    "https://www.linkedin.com:123/posts/example/", "not a URL",
  ]) {
    const content = copy();
    content.posts[0].sourceUrl = sourceUrl;
    assert.match(validateBlogContent(content).join("\n"), /sourceUrl/, sourceUrl);
  }
  for (const sourceUrl of ["https://linkedin.com/posts/example", "https://uk.linkedin.com/posts/example/", "https://www.linkedin.com/feed/update/urn:li:activity:123/"]) {
    const content = copy();
    content.posts[0].sourceUrl = sourceUrl;
    assert.deepEqual(validateBlogContent(content), [], sourceUrl);
  }
});

test("publication dates must be real calendar dates in YYYY-MM-DD format", () => {
  for (const field of ["publishedAt", "sourcePublishedAt"]) {
    for (const invalid of ["", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-10", "2026-1-01", "2026-10-27T00:00:00Z", 20261027]) {
      const content = copy();
      content.posts[0][field] = invalid;
      assert.match(validateBlogContent(content).join("\n"), new RegExp(`${field} must be a valid`), String(invalid));
    }
  }
  const content = copy();
  delete content.posts[0].publishedAt;
  assert.match(validateBlogContent(content).join("\n"), /publishedAt must be a valid/);
});

test("optional project references must identify an existing portfolio project", () => {
  const content = copy();
  content.posts[0].projectId = "missing-project";
  assert.match(validateBlogContent(content, projectIds).join("\n"), /unknown project missing-project/);
  assert.deepEqual(validateBlogContent(content), []);
  content.posts[0].projectId = "";
  assert.match(validateBlogContent(content, projectIds).join("\n"), /projectId must be a project ID/);
});

test("tags must contain non-empty unique technical names", () => {
  for (const tags of [null, [], "ISR", [""], ["Strapi", " strapi "]]) {
    const content = copy();
    content.posts[0].tags = tags;
    assert.match(validateBlogContent(content).join("\n"), /tags/);
  }
});

test("cover images use local JPEG/WebP assets and positive dimensions", () => {
  const withoutCover = copy();
  delete withoutCover.posts[0].cover;
  assert.deepEqual(validateBlogContent(withoutCover), []);
  for (const cover of [null, {},
    { ...source.posts[0]!.cover, src: "https://media.licdn.com/temporary.jpg" },
    { ...source.posts[0]!.cover, src: "/images/blog/../private.jpg" },
    { ...source.posts[0]!.cover, optimizedSrc: "/images/blog/cover.jpg" },
    { ...source.posts[0]!.cover, width: 0 },
    { ...source.posts[0]!.cover, height: 1.5 },
  ]) {
    const content = copy();
    content.posts[0].cover = cover;
    assert.match(validateBlogContent(content).join("\n"), /cover/);
  }
});

test("each real article language describes the cover image", () => {
  for (const language of ["en", "fa"]) {
    const content = copy();
    delete content.posts[0].versions[language].coverAlt;
    assert.match(validateBlogContent(content).join("\n"), new RegExp(`versions.${language}.coverAlt`));
  }
});

test("unknown fields and unsupported article languages are rejected", () => {
  const content = copy();
  content.typo = true;
  content.posts[0].publishedDate = "2026-10-27";
  content.posts[0].versions.en.summery = "Misspelled";
  content.posts[0].versions.en.sections[0].paragraph = "Misspelled";
  content.posts[0].versions.xx = structuredClone(content.posts[0].versions.en);
  const errors = validateBlogContent(content).join("\n");
  for (const field of ["typo", "publishedDate", "summery", "paragraph"]) assert.match(errors, new RegExp(`${field}: unknown field`));
  assert.match(errors, /versions.xx is not a supported locale/);
});

test("article titles, summaries and sections must contain readable content", () => {
  for (const field of ["title", "summary"]) {
    const content = copy();
    content.posts[0].versions.en[field] = " ";
    assert.match(validateBlogContent(content).join("\n"), new RegExp(`${field} must be a non-empty`));
  }
  for (const sections of [null, [], [null], [{ id: "empty", title: "" }]]) {
    const content = copy();
    content.posts[0].versions.en.sections = sections;
    assert.match(validateBlogContent(content).join("\n"), /sections/);
  }
});

test("section bodies accept each supported field and reject empty or malformed fields", () => {
  for (const body of [{ paragraphs: ["Content"] }, { items: ["Item"] }, { code: "const x = 1;" }, { callout: "A useful detail." }]) {
    const content = copy();
    delete content.posts[0].cover;
    content.posts[0].versions = { en: { title: "Title", summary: "Summary", sections: [{ id: "section", title: "Heading", ...body }] } };
    assert.deepEqual(validateBlogContent(content), []);
  }
  for (const body of [{}, { paragraphs: [] }, { paragraphs: [""] }, { items: "Item" }, { code: 1 }, { callout: " " }]) {
    const content = copy();
    content.posts[0].versions = { en: { title: "Title", summary: "Summary", sections: [{ id: "section", title: "Heading", ...body }] } };
    assert.ok(validateBlogContent(content).length, JSON.stringify(body));
  }
});

test("section anchors must be valid, unique and present across translations", () => {
  const content = copy();
  content.posts[0].versions.en.sections.push(structuredClone(content.posts[0].versions.en.sections[0]));
  assert.match(validateBlogContent(content).join("\n"), /id duplicates the-problem/);
  content.posts[0].versions.en.sections[0].id = "Invalid ID";
  assert.match(validateBlogContent(content).join("\n"), /id must use lowercase/);
  const missingAnchor = copy();
  missingAnchor.posts[0].versions.fa.sections[0].id = "different-anchor";
  assert.match(validateBlogContent(missingAnchor).join("\n"), /same section IDs/);
});

test("code labels describe real samples and cannot be empty or stand alone", () => {
  for (const sample of [{ codeLabel: "" }, { codeLabel: 1 }, { codeLabel: "Shell" }]) {
    const content = copy();
    Object.assign(content.posts[0].versions.en.sections[0], sample);
    assert.match(validateBlogContent(content).join("\n"), /codeLabel/);
  }
  const content = copy();
  Object.assign(content.posts[0].versions.en.sections[0], { code: "ghssh accounts", codeLabel: "Shell" });
  assert.deepEqual(validateBlogContent(content, projectIds), []);
});

test("article visuals validate their kind, localized text and shared project references", () => {
  const invalid = [null, {}, { kind: "video", caption: "Caption" },
    { kind: "project", projectId: "missing", caption: "Caption" },
    { kind: "project", projectId: "arvand-termo-tec", caption: "" },
    { kind: "flow", title: "Flow", steps: [], caption: "Caption" },
    { kind: "flow", title: "Flow", steps: [{ title: "A", detail: "A" }, { title: "B", detail: "" }], caption: "Caption" },
    { kind: "metrics", title: "Local test", items: [{ value: "1", label: "A" }, { value: 2, label: "B" }], caption: "Caption" },
    { kind: "metrics", title: "Local test", items: [null, null], caption: "Caption" },
  ];
  for (const visual of invalid) {
    const content = copy();
    content.posts[0].versions.en.sections[0].visual = visual;
    assert.match(validateBlogContent(content, projectIds).join("\n"), /visual/, JSON.stringify(visual));
  }
  const content = copy();
  content.posts[0].versions.en.sections[0].visual.typo = true;
  assert.match(validateBlogContent(content, projectIds).join("\n"), /visual.typo: unknown field/);
});

test("visual-only chapters are supported without inventing paragraph content", () => {
  const content = copy();
  delete content.posts[0].cover;
  content.posts[0].versions = { en: { title: "Note", summary: "Summary", sections: [{ id: "visual", title: "Project", visual: { kind: "project", projectId: "arvand-termo-tec", caption: "The related project." } }] } };
  assert.deepEqual(validateBlogContent(content, projectIds), []);
});
