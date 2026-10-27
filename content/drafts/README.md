# Unpublished blog drafts

Run `npm run blog:new -- my-post --source "https://www.linkedin.com/posts/your-post/"`
to create a JSON draft here. Only `content/blog.json` is imported by the app, so
drafts have no page, SEO metadata, sitemap entry or public image requirement.

Drafts are still repository files: never store private text or credentials here.

Replace every `TODO:` value, check the article, and add it with:

```sh
npm run blog:add -- content/drafts/my-post.json --check
npm run blog:add -- content/drafts/my-post.json
npm run content:check
```

The draft is kept, never silently overwritten or deleted. Review the Git diff,
then commit/push when ready. See `../README.md` for language, image and section
examples. Published articles remain editable directly in `../blog.json`.
