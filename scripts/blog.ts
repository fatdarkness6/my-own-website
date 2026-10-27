import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import template from "../content/templates/blog.json" with { type: "json" };
import { locales } from "../shared/locales.ts";
import { validateBlogContent } from "../shared/validateBlogContent.ts";
import type { BlogPost } from "../app/assets/data/blog.ts";

const usage = `Create an unpublished draft:
  npm run blog:new -- my-post --source "https://www.linkedin.com/posts/your-post/"
  npm run blog:new -- my-post --source "https://www.linkedin.com/posts/your-post/" --lang fa,en --project ghssh

Check a completed draft, then add it locally:
  npm run blog:add -- content/drafts/my-post.json --check
  npm run blog:add -- content/drafts/my-post.json

Options: --lang fa,en (default: fa), --project existing-id, --date YYYY-MM-DD,
         --check (validate without adding), --help.
Drafts are not imported by the website. Adding edits content/blog.json only;
it does not commit, push or deploy. All TODO: placeholders must be replaced.`;

interface DraftOptions {
  id: string;
  sourceUrl: string;
  languages?: string;
  projectId?: string;
  publishedAt: string;
}

/** Metadata is supplied by the author; placeholders never reach the live catalog. */
export function createBlogDraft(options: DraftOptions, projectIds: string[]): BlogPost {
  const requested = (options.languages ?? "fa").split(",").map((code) => code.trim());
  const supported = new Set<string>(locales.map(({ code }) => code));
  if (requested.some((code) => !supported.has(code)) || new Set(requested).size !== requested.length) {
    throw new Error(`Choose unique languages from: ${[...supported].join(", ")}.`);
  }
  const draft = {
    id: options.id,
    sourceUrl: options.sourceUrl,
    publishedAt: options.publishedAt,
    ...(options.projectId ? { projectId: options.projectId } : {}),
    tags: structuredClone(template.tags),
    versions: Object.fromEntries(requested.map((code) => [code, structuredClone(template.versions.en)])),
  } as BlogPost;
  const errors = validateBlogContent({ posts: [draft] }, projectIds);
  if (errors.length) throw new Error(errors.join("\n"));
  return draft;
}

export function containsDraftPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return value.includes("TODO:");
  if (Array.isArray(value)) return value.some(containsDraftPlaceholder);
  return !!value && typeof value === "object" && Object.values(value).some(containsDraftPlaceholder);
}

/** Check the complete proposed archive before writing anything. */
export function prepareBlogAddition(archive: { posts: BlogPost[] }, draft: BlogPost, projectIds: string[]) {
  if (containsDraftPlaceholder(draft)) throw new Error("Replace every TODO: placeholder before adding the draft.");
  const result = { posts: [...archive.posts, draft] };
  const errors = validateBlogContent(result, projectIds);
  if (errors.length) throw new Error(errors.join("\n"));
  const cleanSource = (url: string) => url.replace(/\/$/, "");
  if (archive.posts.some((post) => cleanSource(post.sourceUrl) === cleanSource(draft.sourceUrl))) {
    throw new Error("This source post already has an article. Edit its existing entry instead of adding a duplicate.");
  }
  return result;
}

export async function runBlogAuthoring(args: string[], root = fileURLToPath(new URL("../", import.meta.url))) {
  const { values, positionals } = parseArgs({
    args, allowPositionals: true,
    options: {
      source: { type: "string" }, lang: { type: "string" }, project: { type: "string" },
      date: { type: "string" }, check: { type: "boolean" }, help: { type: "boolean" },
    },
  });
  if (values.help) return usage;
  const [command, input, ...extra] = positionals;
  if (!input || extra.length || !["new", "add"].includes(command ?? "")) throw new Error(usage);
  if ((command === "new" && values.check) || (command === "add" && [values.source, values.lang, values.project, values.date].some(Boolean))) {
    throw new Error("Use source/lang/project/date with blog:new, and --check with blog:add only.");
  }
  const readJson = async (path: string) => JSON.parse(await readFile(resolve(root, path), "utf8"));
  const projects = await readJson("content/projects.json") as { items: { id: string; screenshot?: unknown }[] };
  const projectIds = projects.items.map(({ id }) => id);
  const archivePath = resolve(root, "content/blog.json");
  const original = await readFile(archivePath, "utf8");
  const archive = JSON.parse(original) as { posts: BlogPost[] };
  const archiveErrors = validateBlogContent(archive, projectIds);
  if (archiveErrors.length) throw new Error(archiveErrors.join("\n"));

  if (command === "new") {
    if (!values.source) throw new Error("Provide the original LinkedIn post with --source. No source URL is guessed.");
    if (archive.posts.some(({ id }) => id === input)) throw new Error(`Article ${input} already exists. Edit it in content/blog.json.`);
    const draft = createBlogDraft({
      id: input, sourceUrl: values.source, languages: values.lang, projectId: values.project,
      // This is the date added to the blog, not a guessed original post date.
      publishedAt: values.date ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
    }, projectIds);
    // ID validation runs before constructing this path, preventing traversal.
    const path = resolve(root, "content/drafts", `${draft.id}.json`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(draft, null, 2)}\n`, { flag: "wx" });
    return `Draft created: content/drafts/${draft.id}.json\nReplace TODO: text, then run npm run blog:add -- content/drafts/${draft.id}.json --check\nThe website is unchanged.`;
  }

  const draft = await readJson(input) as BlogPost;
  const result = prepareBlogAddition(archive, draft, projectIds);
  for (const image of [draft.cover?.src, draft.cover?.optimizedSrc].filter(Boolean)) {
    await access(resolve(root, `public${image}`));
  }
  for (const version of Object.values(draft.versions)) {
    for (const section of version!.sections) {
      const visual = section.visual;
      if (visual?.kind === "project" && !projects.items.find(({ id }) => id === visual.projectId)?.screenshot) {
        throw new Error(`Project visual ${visual.projectId} needs an existing project screenshot.`);
      }
    }
  }
  if (values.check) return `Draft valid: ${draft.id}. No files changed.`;
  if (await readFile(archivePath, "utf8") !== original) throw new Error("blog.json changed during validation. Retry without overwriting the newer edit.");
  await writeFile(archivePath, `${JSON.stringify(result, null, 2)}\n`);
  return `Added ${draft.id} to content/blog.json. Your draft remains available.\nRun npm run content:check before committing/deploying. No commit, push or deployment was performed.`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(await runBlogAuthoring(process.argv.slice(2))); }
  catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
}
