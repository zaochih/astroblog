import { siteConfig } from '@/config';

export const languages = {
  'zh-cn': '简体中文',
  'en-us': 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang = siteConfig.defaultLang as Lang;

/**
 * How to name a language when writing *in* another language.
 * languageNames[uiLang][targetLang] → localized name of targetLang
 */
export const languageNames: Record<Lang, Record<Lang, string>> = {
  'zh-cn': { 'zh-cn': '简体中文', 'en-us': '英语' },
  'en-us': { 'zh-cn': 'Simplified Chinese', 'en-us': 'English' },
};

export const ui = {
  'zh-cn': {
    'nav.home': '文章',
    'nav.about': '关于',
    'nav.archive': '归档',
    'home.empty': '还没有发布任何文章，快去写第一篇吧！',
    'post.back': '← 返回列表',
    'post.wordCount': '{count} 字',
    'post.readingTime': '约 {min} 分钟',
    'post.continueReading': '继续阅读 →',
    'post.toc': '目录',
    'series.previous': '上一篇',
    'series.next': '下一篇',
    'series.inSeries': '同系列',
    'alert.fallback.title': '语言不可用',
    'alert.fallback.desc': '此文章在当前语言下不可用，正在为您展示它的 {lang} 版本。',
    'alert.available': '本文同样在以下语言下可用：',
    'page.fallback.desc': '此页面在当前语言下不可用，正在为您展示它的 {lang} 版本。',
    'page.available': '本页面同样在以下语言下可用：',
    'toast.langAvailable': '本页面有可用的 {lang} 版本，要切换吗？',
    'toast.switch': '切换',
    'toast.dismiss': '关闭',
    'footer.builtWith': 'Built with <a href="https://astro.build" target="_blank" rel="noopener" class="hover:text-primary transition-colors">Astro</a> & <a href="https://tailwindcss.com" target="_blank" rel="noopener" class="hover:text-primary transition-colors">Tailwind CSS</a>.',
    'footer.license': '本站原创内容遵循 {license} 协议，转载请注明出处。',
    'sidebar.tags': '标签',
    'sidebar.categories': '分类',
    'archive.title': '归档',
    'tag.title': '标签：{tag}',
    'category.title': '分类：{category}',
    'listing.empty': '暂无相关文章。',
    'listing.postCount': '{count} 篇文章',
    'stats.posts': '文章',
    'stats.categories': '分类',
    'stats.tags': '标签',
    'nav.friends': '友链',
    'friends.title': '友情链接',
    'friends.empty': '暂无友链。',
    'pagination.prev': '← 上一页',
    'pagination.next': '下一页 →',
    'rss.title': '全部文章',
  },
  'en-us': {
    'nav.home': 'Articles',
    'nav.about': 'About',
    'nav.archive': 'Archive',
    'home.empty': 'No articles yet. Write your first one!',
    'post.back': '← Back to list',
    'post.wordCount': '{count} words',
    'post.readingTime': '{min} min read',
    'post.continueReading': 'Continue Reading →',
    'post.toc': 'Contents',
    'series.previous': 'Previous',
    'series.next': 'Next',
    'series.inSeries': 'In this series',
    'alert.fallback.title': 'Language Unavailable',
    'alert.fallback.desc': 'This article is not available in the current language. Showing the {lang} version instead.',
    'alert.available': 'This article is also available in:',
    'page.fallback.desc': 'This page is not available in the current language. Showing the {lang} version instead.',
    'page.available': 'This page is also available in:',
    'toast.langAvailable': 'This page is available in {lang}. Switch?',
    'toast.switch': 'Switch',
    'toast.dismiss': 'Dismiss',
    'footer.builtWith': 'Built with <a href="https://astro.build" target="_blank" rel="noopener" class="hover:text-primary transition-colors">Astro</a> & <a href="https://tailwindcss.com" target="_blank" rel="noopener" class="hover:text-primary transition-colors">Tailwind CSS</a>.',
    'footer.license': 'Original content on this site is licensed under {license}, unless otherwise noted.',
    'sidebar.tags': 'Tags',
    'sidebar.categories': 'Categories',
    'archive.title': 'Archive',
    'tag.title': 'Tag: {tag}',
    'category.title': 'Category: {category}',
    'listing.empty': 'No articles found.',
    'listing.postCount': '{count} posts',
    'stats.posts': 'Posts',
    'stats.categories': 'Categories',
    'stats.tags': 'Tags',
    'nav.friends': 'Friends',
    'friends.title': 'Friends',
    'friends.empty': 'No links yet.',
    'pagination.prev': '← Previous',
    'pagination.next': 'Next →',
    'rss.title': 'All Posts',
  },
} as const;

type DefaultLang = typeof siteConfig.defaultLang;
type TranslationKey = keyof (typeof ui)[DefaultLang];

export function useTranslations(lang: Lang = defaultLang) {
  return function t(key: TranslationKey): string {
    return ui[lang]?.[key] ?? ui[defaultLang][key];
  };
}
