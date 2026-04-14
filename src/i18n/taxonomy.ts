import type { Lang } from './ui';

/**
 * Taxonomy translation maps.
 * Key = slug (used in URLs and frontmatter).
 * Value = display name per language; falls back to slug if not defined.
 */

export const tagNames: Record<string, Partial<Record<Lang, string>>> = {
  intro: { 'zh-cn': '入门', 'en-us': 'Intro' },
};

export const categoryNames: Record<string, Partial<Record<Lang, string>>> = {
  general: { 'zh-cn': '通用', 'en-us': 'General' },
};

export function getTagName(slug: string, lang: Lang): string {
  return tagNames[slug]?.[lang] ?? slug;
}

export function getCategoryName(slug: string, lang: Lang): string {
  return categoryNames[slug]?.[lang] ?? slug;
}
