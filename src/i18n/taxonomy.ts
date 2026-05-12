import type { Lang } from './ui';

type LocalizedTaxonomy = {
  name: Record<Lang, string>;
  slug: Record<Lang, string>;
};

/**
 * Key = canonical internal value. Content can use the key or a localized name.
 * URLs use the localized slug for the current language.
 */
export const Tags: Record<string, LocalizedTaxonomy> = {
  intro: {
    name: { 'zh-cn': '入门', 'en-us': 'Intro' },
    slug: { 'zh-cn': '入门', 'en-us': 'intro' },
  },
  life: {
    name: { 'zh-cn': '生活', 'en-us': 'Life' },
    slug: { 'zh-cn': '生活', 'en-us': 'life' },
  },
  tech: {
    name: { 'zh-cn': '技术向', 'en-us': 'Tech' },
    slug: { 'zh-cn': '技术向', 'en-us': 'tech' },
  },
  apple: {
    name: { 'zh-cn': 'Apple', 'en-us': 'Apple' },
    slug: { 'zh-cn': 'apple', 'en-us': 'apple' },
  },
  'apple-vision-pro': {
    name: { 'zh-cn': 'Apple Vision Pro', 'en-us': 'Apple Vision Pro' },
    slug: { 'zh-cn': 'apple-vision-pro', 'en-us': 'apple-vision-pro' },
  },
  'google-chrome': {
    name: { 'zh-cn': 'Google Chrome', 'en-us': 'Google Chrome' },
    slug: { 'zh-cn': 'google-chrome', 'en-us': 'google-chrome' },
  },
  git: {
    name: { 'zh-cn': 'Git', 'en-us': 'Git' },
    slug: { 'zh-cn': 'git', 'en-us': 'git' },
  },
  gpg: {
    name: { 'zh-cn': 'GPG', 'en-us': 'GPG' },
    slug: { 'zh-cn': 'gpg', 'en-us': 'gpg' },
  },
  nginx: {
    name: { 'zh-cn': 'NGINX', 'en-us': 'NGINX' },
    slug: { 'zh-cn': 'nginx', 'en-us': 'nginx' },
  },
  windows: {
    name: { 'zh-cn': 'Windows', 'en-us': 'Windows' },
    slug: { 'zh-cn': 'windows', 'en-us': 'windows' },
  },
  'windows-11': {
    name: { 'zh-cn': 'Windows 11', 'en-us': 'Windows 11' },
    slug: { 'zh-cn': 'windows-11', 'en-us': 'windows-11' },
  },
  shanghai: {
    name: { 'zh-cn': '上海', 'en-us': 'Shanghai' },
    slug: { 'zh-cn': '上海', 'en-us': 'shanghai' },
  },
  jinan: {
    name: { 'zh-cn': '济南', 'en-us': 'Jinan' },
    slug: { 'zh-cn': '济南', 'en-us': 'jinan' },
  },
  beijing: {
    name: { 'zh-cn': '北京', 'en-us': 'Beijing' },
    slug: { 'zh-cn': '北京', 'en-us': 'beijing' },
  },
  travel: {
    name: { 'zh-cn': '游', 'en-us': 'Travel' },
    slug: { 'zh-cn': '游', 'en-us': 'travel' },
  },
  'travel-log': {
    name: { 'zh-cn': '游记', 'en-us': 'Travel Log' },
    slug: { 'zh-cn': '游记', 'en-us': 'travel-log' },
  },
  gaokao: {
    name: { 'zh-cn': '高考', 'en-us': 'Gaokao' },
    slug: { 'zh-cn': '高考', 'en-us': 'gaokao' },
  },
  ctf: {
    name: { 'zh-cn': 'CTF', 'en-us': 'CTF' },
    slug: { 'zh-cn': 'ctf', 'en-us': 'ctf' },
  },
  geekgame: {
    name: { 'zh-cn': 'GeekGame', 'en-us': 'GeekGame' },
    slug: { 'zh-cn': 'geekgame', 'en-us': 'geekgame' },
  },
  hackergame: {
    name: { 'zh-cn': 'Hackergame', 'en-us': 'Hackergame' },
    slug: { 'zh-cn': 'hackergame', 'en-us': 'hackergame' },
  },
  'write-up': {
    name: { 'zh-cn': 'Write Up', 'en-us': 'Write Up' },
    slug: { 'zh-cn': 'write-up', 'en-us': 'write-up' },
  },
};

export const Categories: Record<string, LocalizedTaxonomy> = {
  general: {
    name: { 'zh-cn': '通用', 'en-us': 'General' },
    slug: { 'zh-cn': '通用', 'en-us': 'general' },
  },
  life: {
    name: { 'zh-cn': '生活', 'en-us': 'Life' },
    slug: { 'zh-cn': '生活', 'en-us': 'life' },
  },
  tech: {
    name: { 'zh-cn': '技术向', 'en-us': 'Tech' },
    slug: { 'zh-cn': '技术向', 'en-us': 'tech' },
  },
  windows: {
    name: { 'zh-cn': 'Windows', 'en-us': 'Windows' },
    slug: { 'zh-cn': 'windows', 'en-us': 'windows' },
  },
  ctf: {
    name: { 'zh-cn': 'CTF', 'en-us': 'CTF' },
    slug: { 'zh-cn': 'ctf', 'en-us': 'ctf' },
  },
  uncategorized: {
    name: { 'zh-cn': '未分类', 'en-us': 'Uncategorized' },
    slug: { 'zh-cn': '未分类', 'en-us': 'uncategorized' },
  },
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function buildLookup(items: Record<string, LocalizedTaxonomy>): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const [key, item] of Object.entries(items)) {
    lookup.set(normalize(key), key);
    for (const value of [...Object.values(item.name), ...Object.values(item.slug)]) {
      lookup.set(normalize(value), key);
    }
  }

  return lookup;
}

const tagLookup = buildLookup(Tags);
const categoryLookup = buildLookup(Categories);

export function resolveTagKey(value: string): string {
  return tagLookup.get(normalize(value)) ?? value;
}

export function resolveCategoryKey(value: string): string {
  return categoryLookup.get(normalize(value)) ?? value;
}

export function getTagPathSegment(value: string, lang: Lang): string {
  const key = resolveTagKey(value);
  return Tags[key]?.slug[lang] ?? key;
}

export function getCategoryPathSegment(value: string, lang: Lang): string {
  const key = resolveCategoryKey(value);
  return Categories[key]?.slug[lang] ?? key;
}

export function getTagName(value: string, lang: Lang): string {
  const key = resolveTagKey(value);
  return Tags[key]?.name[lang] ?? value;
}

export function getCategoryName(value: string, lang: Lang): string {
  const key = resolveCategoryKey(value);
  return Categories[key]?.name[lang] ?? value;
}
