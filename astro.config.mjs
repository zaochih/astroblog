// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeImageSize from './src/lib/rehype-image-size.mjs';

/**
 * @typedef {object} HastNode
 * @property {string} [type]
 * @property {string} [tagName]
 * @property {{ id?: unknown, type?: unknown, checked?: unknown, [key: string]: unknown }} [properties]
 * @property {string} [value]
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

/** Add accessible names to generated Markdown task-list checkboxes. */
function rehypeTaskListA11y() {
  /** @param {HastNode} tree */
  return function (tree) {
    visit(tree);
  };

  /** @param {HastNode} node */
  function visit(node) {
    if (!node.children) return;

    for (const child of node.children) {
      if (isTaskCheckbox(child)) {
        child.properties ??= {};
        child.properties.ariaLabel = getTaskLabel(node);
      }
      visit(child);
    }
  }

  /** @param {HastNode} node */
  function isTaskCheckbox(node) {
    return (
      node.type === 'element' &&
      node.tagName === 'input' &&
      String(node.properties?.type) === 'checkbox'
    );
  }

  /** @param {HastNode} node */
  function getTaskLabel(node) {
    const text = collectText(node).trim().replace(/\s+/g, ' ');
    return text ? `Task: ${text}` : 'Task list item';
  }

  /**
   * @param {HastNode} node
   * @returns {string}
   */
  function collectText(node) {
    if (node.type === 'text') return node.value ?? '';
    if (!node.children) return '';
    return node.children
      .filter((child) => !isTaskCheckbox(child))
      .map(collectText)
      .join('');
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
  image: {
    layout: 'constrained',
    responsiveStyles: true,
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
    rehypePlugins: [rehypeRemoveFootnoteLabel, rehypeTaskListA11y, [rehypeKatex, {}], rehypeImageSize],
  },
});
