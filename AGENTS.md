# Repository Notes

- Prefer `bun` for local commands. Use `bun install` for dependency updates and `bun run build` for validation.
- Content lives in `src/data/posts/<lang>/<slug>.md` and `src/data/pages/<lang>/<slug>.md`.
- Short content commands:
  - `bun new:post zh-cn my-post "标题"`
  - `bun new:page zh-cn about "关于"`
  - `bun post zh-cn my-post "标题"` and `bun page zh-cn about "关于"` are shorter aliases.
- The default language is `zh-cn`; secondary-language posts inherit reusable metadata such as date, tags, category, cover, series, and canonical URL from the default-language post when omitted.
- The 404 page is intentionally Chinese-only at `src/pages/404.astro`; keep the footer language switcher hidden there.
- Shadcn is configured with Hugeicons. Prefer `src/components/HugeIcon.tsx` for UI icons before adding inline SVG.
- Explicit language switches write `localStorage["lang-preference"]`; pages with a stored preference should redirect to the preferred language without showing the toast again.
