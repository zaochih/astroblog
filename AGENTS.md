# Repository Notes

- Prefer `bun` for local commands. Use `bun install` for dependency updates and `bun run build` for validation.
- Content lives in `src/data/posts/<lang>/<slug>.md` and `src/data/pages/<lang>/<slug>.md`.
- Short content commands:
  - `bun new:post zh-cn my-post "标题"`
  - `bun new:page zh-cn about "关于"`
  - `bun post zh-cn my-post "标题"` and `bun page zh-cn about "关于"` are shorter aliases.
- The default language is `zh-cn`; secondary-language posts inherit reusable metadata such as date, tags, category, cover, series, and canonical URL from the default-language post when omitted.
- KaTeX CSS is opt-in. Set `math: true` in post/page frontmatter when the content contains TeX math.
- Comments use giscus configured in `siteConfig.comments`. Posts default to comments on and can use `comments: false`; pages default to comments off and can use `comments: true`. Use stable terms `posts/<slug>` and `pages/<slug>` so multilingual variants share one discussion.
- Friend links can define optional `i18n.<lang>` overrides for `name`, `description`, `url`, and `links`; unspecified localized fields fall back to the base entry.
- The 404 page is intentionally Chinese-only at `src/pages/404.astro`; keep the footer language switcher hidden there.
- Shadcn is configured with Hugeicons. Prefer `src/components/HugeIcon.tsx` for UI icons before adding inline SVG.
- Explicit language switches write `localStorage["lang-preference"]`; pages with a stored preference should redirect to the preferred language without showing the toast again.
- Avoid `any` in TypeScript. Prefer explicit interfaces, generics, `unknown` with narrowing, or local type aliases; only use `any` when a boundary cannot be typed more precisely and document why.
