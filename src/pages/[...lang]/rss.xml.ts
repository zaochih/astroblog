import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '@/config';
import { localizeAndSortPosts, getPostHref } from '@/lib/content';
import { defaultLang, getLangProfile, getSupportedLangs } from '@/i18n/ui';
import { getSiteDescription, resolveContentDescription } from '@/lib/seo';

export function getStaticPaths() {
  return getSupportedLangs().map(lang => ({
    params: { lang: lang === defaultLang ? undefined : lang },
    props: { lang },
  }));
}

export async function GET(context: APIContext) {
  const { lang } = context.props as { lang: string };
  const allPosts = await getCollection('blog');
  const localizedPosts = localizeAndSortPosts(allPosts, lang, { includeFallback: false });
  const profile = getLangProfile(lang);

  const response = await rss({
    title: lang === defaultLang ? siteConfig.name : `${siteConfig.name} (${profile.label})`,
    description: getSiteDescription(lang),
    site: siteConfig.siteUrl,
    items: localizedPosts
      .filter(({ post }) => post.data.date)
      .map(({ post, slug }) => ({
        title: post.data.title,
        pubDate: post.data.date!,
        description: resolveContentDescription({
          frontmatterDescription: post.data.description,
          body: post.body,
          title: post.data.title,
          lang,
          kind: 'article',
        }),
        link: `${siteConfig.siteUrl}${getPostHref(slug, lang)}`,
    })),
    customData: `<language>${profile.rssLanguage}</language>`,
  });
  response.headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
  return response;
}
