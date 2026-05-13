import { siteConfig } from '@/config';
import { defaultLang, type Lang } from '@/i18n/ui';

const DESCRIPTION_MAX_LENGTH = 160;
const DESCRIPTION_MIN_CUT_LENGTH = 110;

type ContentDescriptionKind = 'article' | 'page';
type ListingDescriptionKind = 'archive' | 'tag' | 'category' | 'paginatedArticles' | 'friends' | 'search' | 'notFound';

interface ContentDescriptionOptions {
  frontmatterDescription?: string;
  body?: string;
  title: string;
  lang: string;
  kind: ContentDescriptionKind;
}

interface ListingDescriptionOptions {
  kind: ListingDescriptionKind;
  lang: string;
  label?: string;
  page?: number;
}

function asLang(lang: string): Lang {
  return lang in siteConfig.description ? lang as Lang : defaultLang;
}

export function getSiteDescription(lang: string): string {
  const safeLang = asLang(lang);
  return siteConfig.description[safeLang] ?? siteConfig.description[defaultLang];
}

export function normalizeDescription(value?: string | null): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---')) return markdown;
  const end = markdown.indexOf('\n---', 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[hidden\]([\s\S]*?)\[\/hidden\]/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[*_~#>]/g, '')
    .replace(/\[\^[^\]]+\]/g, '');
}

function isSkippableMarkdownLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed === '' ||
    /^#{1,6}\s/.test(trimmed) ||
    /^!\[[^\]]*\]\([^)]*\)$/.test(trimmed) ||
    /^[-*_]{3,}$/.test(trimmed) ||
    /^<[^>]+>\s*$/.test(trimmed) ||
    /^<\/[^>]+>\s*$/.test(trimmed) ||
    /^import\s/.test(trimmed) ||
    /^export\s/.test(trimmed) ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed)
  );
}

function truncateDescription(value: string): string {
  if (value.length <= DESCRIPTION_MAX_LENGTH) return value;

  const slice = value.slice(0, DESCRIPTION_MAX_LENGTH + 1);
  const punctuationIndex = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('！'),
    slice.lastIndexOf('？'),
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?'),
  );

  if (punctuationIndex >= DESCRIPTION_MIN_CUT_LENGTH) {
    return slice.slice(0, punctuationIndex + 1).trim();
  }

  const whitespaceIndex = slice.lastIndexOf(' ');
  if (whitespaceIndex >= DESCRIPTION_MIN_CUT_LENGTH) {
    return `${slice.slice(0, whitespaceIndex).trim()}…`;
  }

  return `${value.slice(0, DESCRIPTION_MAX_LENGTH - 1).trim()}…`;
}

export function excerptFirstParagraph(body?: string): string | undefined {
  if (!body) return undefined;

  const lines = stripFrontmatter(body).split(/\r?\n/);
  const paragraphs: string[] = [];
  let paragraph: string[] = [];
  let inCodeFence = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    const text = normalizeDescription(stripMarkdown(paragraph.join(' ')));
    if (text) paragraphs.push(text);
    paragraph = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```|^~~~/.test(trimmed)) {
      inCodeFence = !inCodeFence;
      flushParagraph();
      continue;
    }
    if (inCodeFence) continue;

    if (isSkippableMarkdownLine(line)) {
      flushParagraph();
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  const firstParagraph = paragraphs.find(Boolean);
  return firstParagraph ? truncateDescription(firstParagraph) : undefined;
}

export function genericContentDescription(kind: ContentDescriptionKind, title: string, lang: string): string {
  const siteName = siteConfig.name;
  const safeTitle = normalizeDescription(title) ?? siteName;

  if (asLang(lang) === 'zh-cn') {
    return kind === 'article'
      ? `${siteName} 的《${safeTitle}》文章。`
      : `${siteName} 的“${safeTitle}”页面。`;
  }

  return kind === 'article'
    ? `Article “${safeTitle}” on ${siteName}.`
    : `Page “${safeTitle}” on ${siteName}.`;
}

export function resolveContentDescription(options: ContentDescriptionOptions): string {
  return (
    normalizeDescription(options.frontmatterDescription) ??
    excerptFirstParagraph(options.body) ??
    genericContentDescription(options.kind, options.title, options.lang)
  );
}

export function describeListingPage(options: ListingDescriptionOptions): string {
  const lang = asLang(options.lang);
  const label = normalizeDescription(options.label);
  const page = options.page ?? 1;

  if (lang === 'zh-cn') {
    switch (options.kind) {
      case 'archive':
        return `浏览 ${siteConfig.name} 的文章归档。`;
      case 'tag':
        return `浏览 ${siteConfig.name} 中带有“${label}”标签的文章。`;
      case 'category':
        return `浏览 ${siteConfig.name} 中“${label}”分类下的文章。`;
      case 'paginatedArticles':
        return `浏览 ${siteConfig.name} 的文章列表第 ${page} 页。`;
      case 'friends':
        return `浏览 ${siteConfig.name} 的友情链接页面。`;
      case 'search':
        return `搜索 ${siteConfig.name} 的文章和页面。`;
      case 'notFound':
        return `${siteConfig.name} 的 404 页面，提示当前链接没有找到可用内容。`;
    }
  }

  switch (options.kind) {
    case 'archive':
      return `Browse the article archive on ${siteConfig.name}.`;
    case 'tag':
      return `Browse articles tagged “${label}” on ${siteConfig.name}.`;
    case 'category':
      return `Browse articles in the “${label}” category on ${siteConfig.name}.`;
    case 'paginatedArticles':
      return `Browse page ${page} of the article list on ${siteConfig.name}.`;
    case 'friends':
      return `Browse the friends and links page on ${siteConfig.name}.`;
    case 'search':
      return `Search articles and pages on ${siteConfig.name}.`;
    case 'notFound':
      return `The 404 page for ${siteConfig.name}, shown when no content is available at the current link.`;
  }
}

export function descriptionFromTitle(title: string | undefined, lang: string): string {
  const pageTitle = normalizeDescription(title?.replace(new RegExp(`(?:\\s*[|—-]\\s*)?${siteConfig.name}$`), ''));
  return genericContentDescription('page', pageTitle ?? siteConfig.name, lang);
}
