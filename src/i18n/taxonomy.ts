import type { Lang } from './ui';

/**
 * Taxonomy translation maps.
 * Key = slug (used in URLs and frontmatter).
 * Value = display name per language; falls back to slug if not defined.
 */

export const tagNames: Record<string, Partial<Record<Lang, string>>> = {
  intro: { 'zh-cn': '入门', 'en-us': 'Intro' },
  'life': { 'zh-cn': '生活', 'en-us': 'Life' },
  'windows-11': { 'zh-cn': 'Windows 11', 'en-us': 'Windows 11' },
  'shanghai': { 'zh-cn': '上海', 'en-us': 'Shanghai' },
  'jinan': { 'zh-cn': '济南', 'en-us': 'Jinan' },
  'travel-log': { 'zh-cn': '游记', 'en-us': 'Travel Log' },
  ctf: { 'zh-cn': 'CTF', 'en-us': 'CTF' },
  geekgame: { 'zh-cn': 'GeekGame', 'en-us': 'GeekGame' },
  'write-up': { 'zh-cn': 'Write Up', 'en-us': 'Write Up' },
};

export const categoryNames: Record<string, Partial<Record<Lang, string>>> = {
  general: { 'zh-cn': '通用', 'en-us': 'General' },
  'life': { 'zh-cn': '生活', 'en-us': 'Life' },
  windows: { 'zh-cn': 'Windows', 'en-us': 'Windows' },
  ctf: { 'zh-cn': 'CTF', 'en-us': 'CTF' },
};

export function getTagName(slug: string, lang: Lang): string {
  return tagNames[slug]?.[lang] ?? slug;
}

export function getCategoryName(slug: string, lang: Lang): string {
  return categoryNames[slug]?.[lang] ?? slug;
}
