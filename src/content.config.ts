import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, pages };
