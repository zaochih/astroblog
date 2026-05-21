import { render, type CollectionEntry } from 'astro:content';

export type RouteSkeletonKind =
  | 'feed'
  | 'post-with-toc'
  | 'post-without-toc'
  | 'archive'
  | 'taxonomy'
  | 'friends'
  | 'search'
  | 'page';

export function hasArticleToc(headings: Array<{ depth: number }>): boolean {
  return headings.filter(heading => heading.depth <= 3).length > 2;
}

export function getPostSkeletonKindFromHeadings(headings: Array<{ depth: number }>): Extract<RouteSkeletonKind, 'post-with-toc' | 'post-without-toc'> {
  return hasArticleToc(headings) ? 'post-with-toc' : 'post-without-toc';
}

export async function getPostSkeletonKind(post: CollectionEntry<'blog'>): Promise<Extract<RouteSkeletonKind, 'post-with-toc' | 'post-without-toc'>> {
  const { headings } = await render(post);
  return getPostSkeletonKindFromHeadings(headings);
}
