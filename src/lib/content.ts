import type { CollectionEntry } from 'astro:content';
import { defaultLang } from '@/i18n/ui';

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
): LocalizedPost[] {
  const bySlug = new Map<string, Record<string, CollectionEntry<'blog'>>>();
  for (const post of allPosts.filter(isPublishedEntry)) {
    const postLang = getLangFromId(post.id);
    const slug = getSlugFromId(post.id);
    if (!bySlug.has(slug)) bySlug.set(slug, {});
    bySlug.get(slug)![postLang] = post;
  }

  return [...bySlug.entries()]
    .map(([slug, langsMap]) => {
      const post = langsMap[lang] ?? langsMap[defaultLang];
      if (!post) return null;
      const primary = langsMap[defaultLang];
      // Secondary-lang posts inherit date/tags/category/cover from primary
      const merged = primary && post !== primary
        ? { ...post, data: mergeWithPrimary(post.data, primary.data) } as CollectionEntry<'blog'>
        : post;
      return { post: merged, slug, isFallback: !langsMap[lang] };
    })
    .filter((x): x is LocalizedPost => x !== null)
    .sort((a, b) => (b.post.data.date?.valueOf() ?? 0) - (a.post.data.date?.valueOf() ?? 0));
}

export function getPostHref(slug: string, lang: string): string {
  return lang === defaultLang ? `/posts/${slug}` : `/${lang}/posts/${slug}`;
}

export function getTagHref(tag: string, lang: string): string {
  return lang === defaultLang ? `/tags/${tag}` : `/${lang}/tags/${tag}`;
}

export function getCategoryHref(category: string, lang: string): string {
  return lang === defaultLang ? `/categories/${category}` : `/${lang}/categories/${category}`;
}

export function getArchiveHref(lang: string): string {
  return lang === defaultLang ? '/archive' : `/${lang}/archive`;
}

/** Format a Date as a human-readable datetime string in the given page language (UTC). */
export function formatDate(date: Date, lang: string): string {
  if (lang === 'zh-cn') {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}年${m}月${d}日`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatTime(date: Date, lang: string): string {
  if (lang === 'zh-cn') {
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
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
  if (lang === 'zh-cn') {
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
