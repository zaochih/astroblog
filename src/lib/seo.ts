import { siteConfig } from '@/config';
import { defaultLang, getLocalizedValue, isSupportedLang, useTranslations, type Lang } from '@/i18n/ui';

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
  return isSupportedLang(lang) ? lang : defaultLang;
}

export function getSiteDescription(lang: string): string {
  return getLocalizedValue(siteConfig.description, asLang(lang)) ?? siteConfig.description[siteConfig.defaultLang];
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
  const t = useTranslations(asLang(lang));
  const key = kind === 'article' ? 'seo.article' : 'seo.page';
  return t(key)
    .replace('{site}', siteName)
    .replace('{title}', safeTitle);
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
  const t = useTranslations(lang);
  const replace = (template: string) => template
    .replace('{site}', siteConfig.name)
    .replace('{label}', label ?? '')
    .replace('{page}', String(page));

  switch (options.kind) {
    case 'archive':
      return replace(t('seo.archive'));
    case 'tag':
      return replace(t('seo.tag'));
    case 'category':
      return replace(t('seo.category'));
    case 'paginatedArticles':
      return replace(t('seo.paginatedArticles'));
    case 'friends':
      return replace(t('seo.friends'));
    case 'search':
      return replace(t('seo.search'));
    case 'notFound':
      return replace(t('seo.notFound'));
  }
}

export function descriptionFromTitle(title: string | undefined, lang: string): string {
  const pageTitle = normalizeDescription(title?.replace(new RegExp(`(?:\\s*[|—-]\\s*)?${siteConfig.name}$`), ''));
  return genericContentDescription('page', pageTitle ?? siteConfig.name, lang);
}
