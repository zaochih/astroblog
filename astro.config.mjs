// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * @typedef {object} HastNode
 * @property {string} [type]
 * @property {{ id?: unknown }} [properties]
 * @property {HastNode[]} [children]
 */

/** Remove the auto-generated "Footnotes" h2 from the hast tree at build time. */
function rehypeRemoveFootnoteLabel() {
  /** @param {HastNode} tree */
  return function (tree) {
    removeNode(tree);
  };
  /** @param {HastNode} node */
  function removeNode(node) {
    if (!node.children) return;
    node.children = node.children.filter((child) => {
      if (
        child.type === 'element' &&
        child.properties?.id === 'footnote-label'
      ) {
        return false;
      }
      removeNode(child);
      return true;
    });
  }
}

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
    rehypePlugins: [rehypeRemoveFootnoteLabel, [rehypeKatex, {}]],
  },
});
