import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().int().optional(),
    canonicalUrl: z.url().optional(),
    redirectUrl: z.url().optional(),
    math: z.boolean().optional().default(false),
    comments: z.boolean().optional(),
    weixinName: z.string().optional(),
    weixinLink: z.url().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/pages' }),
  schema: z.object({
    title: z.string(),
    navTitle: z.string().optional(),
    description: z.string().optional(),
    math: z.boolean().optional().default(false),
    comments: z.boolean().optional(),
    updated: z.coerce.date().optional(),
    order: z.number().int().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, pages };
