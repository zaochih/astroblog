// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(), 
    mdx()
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      transformers: [
        {
          name: 'lang-label',
          pre(node) {
            const lang = this.options.lang;
            if (lang && lang !== 'text' && lang !== 'plaintext') {
              node.properties['data-lang'] = lang;
            }
          },
        },
      ],
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, {}]],
  },
});
