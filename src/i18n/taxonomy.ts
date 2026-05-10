import type { Lang } from './ui';

/**
 * Taxonomy translation maps.
 * Key = slug (used in URLs and frontmatter).
 * Value = display name per language; falls back to slug if not defined.
 */

export const tagNames: Record<string, Partial<Record<Lang, string>>> = {
  intro: { 'zh-cn': '入门', 'en-us': 'Intro' },
  '生活': { 'zh-cn': '生活', 'en-us': 'Life' },
  'windows-11': { 'zh-cn': 'Windows 11', 'en-us': 'Windows 11' },
  '上海': { 'zh-cn': '上海', 'en-us': 'Shanghai' },
  '济南': { 'zh-cn': '济南', 'en-us': 'Jinan' },
  '游记': { 'zh-cn': '游记', 'en-us': 'Travel Log' },
};

export const categoryNames: Record<string, Partial<Record<Lang, string>>> = {
  general: { 'zh-cn': '通用', 'en-us': 'General' },
  '生活': { 'zh-cn': '生活', 'en-us': 'Life' },
  'Windows': { 'zh-cn': 'Windows', 'en-us': 'Windows' },
};

export function getTagName(slug: string, lang: Lang): string {
  return tagNames[slug]?.[lang] ?? slug;
}

export function getCategoryName(slug: string, lang: Lang): string {
  return categoryNames[slug]?.[lang] ?? slug;
}
