import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '@/config';
import { localizeAndSortPosts, getPostHref } from '@/lib/content';
import { languages, defaultLang } from '@/i18n/ui';

export function getStaticPaths() {
  return Object.keys(languages).map(lang => ({
    params: { lang: lang === defaultLang ? undefined : lang },
    props: { lang },
  }));
}

export async function GET(context: APIContext) {
  const { lang } = context.props as { lang: string };
  const allPosts = await getCollection('blog');
  const localizedPosts = localizeAndSortPosts(allPosts, lang);
  const isZh = lang === 'zh-cn';

  return rss({
    title: isZh ? siteConfig.name : `${siteConfig.name} (EN)`,
    description: siteConfig.description[lang as keyof typeof siteConfig.description],
    site: siteConfig.siteUrl,
    items: localizedPosts
      .filter(({ post }) => post.data.date)
      .map(({ post, slug }) => ({
        title: post.data.title,
        pubDate: post.data.date!,
        description: post.data.description,
        link: `${siteConfig.siteUrl}${getPostHref(slug, lang)}`,
      })),
    customData: `<language>${isZh ? 'zh-CN' : 'en-US'}</language>`,
  });
}
