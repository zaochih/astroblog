import type { CollectionEntry } from 'astro:content';
import { defaultLang, getLangProfile } from '@/i18n/ui';
import { getCategoryPathSegment, getTagPathSegment } from '@/i18n/taxonomy';
import type { Lang } from '@/i18n/ui';

export function getSlugFromId(id: string): string {
  return id.split('/').slice(1).join('/');
}

export function getLangFromId(id: string): string {
  return id.split('/')[0];
}

export interface LocalizedPost {
  post: CollectionEntry<'blog'>;
  slug: string;
  isFallback: boolean;
}

interface LocalizePostsOptions {
  includeFallback?: boolean;
}

export function isPublishedEntry<T extends { data: { draft?: boolean } }>(entry: T): boolean {
  return !entry.data.draft;
}

/**
 * Given all posts, return one de-duplicated post per slug for `lang`.
 * Falls back to defaultLang if the target lang has no version of that post.
 * Result is sorted newest-first.
 */
export function localizeAndSortPosts(
  allPosts: CollectionEntry<'blog'>[],
  lang: string,
  options: LocalizePostsOptions = {},
): LocalizedPost[] {
  const includeFallback = options.includeFallback ?? true;
  const bySlug = new Map<string, Record<string, CollectionEntry<'blog'>>>();
  for (const post of allPosts) {
    const postLang = getLangFromId(post.id);
    const slug = getSlugFromId(post.id);
    if (!bySlug.has(slug)) bySlug.set(slug, {});
    bySlug.get(slug)![postLang] = post;
  }

  return [...bySlug.entries()]
    .map(([slug, langsMap]) => {
      const localizedPost = langsMap[lang];
      const fallbackLang = getLangProfile(lang).fallbackLang;
      const fallbackPost = langsMap[fallbackLang];
      const post = localizedPost && isPublishedEntry(localizedPost)
        ? localizedPost
        : includeFallback && fallbackLang !== lang && fallbackPost && isPublishedEntry(fallbackPost)
          ? fallbackPost
          : undefined;
      if (!post) return null;
      const primary = langsMap[defaultLang];
      // Secondary-lang posts inherit date/tags/category/cover from primary
      const merged = primary && post !== primary
        ? { ...post, data: mergeWithPrimary(post.data, primary.data) } as CollectionEntry<'blog'>
        : post;
      return { post: merged, slug, isFallback: post !== localizedPost };
    })
    .filter((x): x is LocalizedPost => x !== null)
    .sort((a, b) => (b.post.data.date?.valueOf() ?? 0) - (a.post.data.date?.valueOf() ?? 0));
}

export function getPostHref(slug: string, lang: string): string {
  return lang === defaultLang ? `/post/${slug}` : `/${lang}/post/${slug}`;
}

export function getTagHref(tag: string, lang: string): string {
  const segment = getTagPathSegment(tag, lang as Lang);
  return lang === defaultLang ? `/tags/${segment}` : `/${lang}/tags/${segment}`;
}

export function getCategoryHref(category: string, lang: string): string {
  const segment = getCategoryPathSegment(category, lang as Lang);
  return lang === defaultLang ? `/categories/${segment}` : `/${lang}/categories/${segment}`;
}

export function getArchiveHref(lang: string): string {
  return lang === defaultLang ? '/archive' : `/${lang}/archive`;
}

function fallbackTimeZone(lang: string): string {
  return getLangProfile(lang).timeZone;
}

function dateParts(date: Date, lang: string): { year: string; month: string; day: string; hour: string; minute: string } {
  const profile = getLangProfile(lang);
  const parts = new Intl.DateTimeFormat(profile.dateLocale, {
    timeZone: fallbackTimeZone(lang),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const value = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour') === '24' ? '00' : value('hour'),
    minute: value('minute'),
  };
}

export function getPostYear(date: Date, lang: string): number {
  return Number(dateParts(date, lang).year);
}

/** Format a Date as a human-readable date string in the language's fallback timezone. */
export function formatDate(date: Date, lang: string): string {
  const profile = getLangProfile(lang);
  if (profile.wordCountStyle === 'cjk') {
    const { year, month, day } = dateParts(date, lang);
    return `${year}年${month}月${day}日`;
  }
  return date.toLocaleDateString(profile.dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: fallbackTimeZone(lang),
  });
}

export function formatTime(date: Date, lang: string): string {
  const profile = getLangProfile(lang);
  if (profile.wordCountStyle === 'cjk') {
    const { hour, minute } = dateParts(date, lang);
    return `${hour}:${minute}`;
  }
  return date.toLocaleTimeString(profile.dateLocale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: fallbackTimeZone(lang),
  });
}

export function formatDateTime(date: Date, lang: string): string {
  return `${formatDate(date, lang)} ${formatTime(date, lang)}`;
}

/**
 * Merge a secondary-language post's data with the primary (default-lang) post.
 * Fields that are undefined in the secondary post inherit from the primary.
 */
export function mergeWithPrimary(
  data: CollectionEntry<'blog'>['data'],
  primaryData?: CollectionEntry<'blog'>['data'],
): CollectionEntry<'blog'>['data'] {
  if (!primaryData) return data;
  return {
    ...data,
    date: data.date ?? primaryData.date,
    updated: data.updated ?? primaryData.updated,
    tags: data.tags ?? primaryData.tags,
    category: data.category ?? primaryData.category,
    cover: data.cover ?? primaryData.cover,
    coverAlt: data.coverAlt ?? primaryData.coverAlt,
    series: data.series ?? primaryData.series,
    seriesOrder: data.seriesOrder ?? primaryData.seriesOrder,
    canonicalUrl: data.canonicalUrl ?? primaryData.canonicalUrl,
    redirectUrl: data.redirectUrl ?? primaryData.redirectUrl,
    weixinName: data.weixinName ?? primaryData.weixinName,
    weixinLink: data.weixinLink ?? primaryData.weixinLink,
  };
}

/** Count words in raw markdown body (CJK chars + Latin tokens). */
export function countWords(body: string): number {
  const stripped = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]+`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[.*?\]\(.*?\)/g, ' ');
  const cjk = (stripped.match(/[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/g) ?? []).length;
  const latin = (stripped.match(/\b[a-zA-Z0-9]+\b/g) ?? []).length;
  return cjk + latin;
}

/** Estimate reading time in minutes (assumes ~300 units/min). */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 300));
}

/**
 * Format a word count with the appropriate CJK unit (百字 / 千字 / 万字)
 * or English abbreviation (words / k words).
 */
export function formatWordCount(count: number, lang: string): string {
  if (getLangProfile(lang).wordCountStyle === 'cjk') {
    if (count < 1000) return `${count} 字`;
    if (count < 10000) {
      const v = (count / 1000).toFixed(1).replace(/\.0$/, '');
      return `${v} 千字`;
    }
    const v = (count / 10000).toFixed(1).replace(/\.0$/, '');
    return `${v} 万字`;
  }
  // English
  if (count < 1000) return `${count} words`;
  const v = (count / 1000).toFixed(1).replace(/\.0$/, '');
  return `${v}k words`;
}
