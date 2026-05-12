// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

import remarkMath from "remark-math";
import remarkCustomHeaderId from "remark-custom-header-id";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
import rehypeKatex from "rehype-katex";
import rehypeImageSize from "./src/lib/rehype-image-size.mjs";
import remarkHidden from "./src/lib/remark-hidden.mjs";

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
        child.type === "element" &&
        child.properties?.id === "footnote-label"
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
      node.type === "element" &&
      node.tagName === "input" &&
      String(node.properties?.type) === "checkbox"
    );
  }

  /** @param {HastNode} node */
  function getTaskLabel(node) {
    const text = collectText(node).trim().replace(/\s+/g, " ");
    return text ? `Task: ${text}` : "Task list item";
  }

  /**
   * @param {HastNode} node
   * @returns {string}
   */
  function collectText(node) {
    if (node.type === "text") return node.value ?? "";
    if (!node.children) return "";
    return node.children
      .filter((child) => !isTaskCheckbox(child))
      .map(collectText)
      .join("");
  }
}

/** Mark paragraphs that contain only a standalone image or image link. */
function rehypeImageParagraphs() {
  /** @param {HastNode} tree */
  return function (tree) {
    visit(tree);
  };

  /** @param {HastNode} node */
  function visit(node) {
    if (node.type === "element" && node.tagName === "p" && isImageOnlyParagraph(node)) {
      node.properties ??= {};
      const className = node.properties.className;
      node.properties.className = Array.isArray(className)
        ? [...className, "image-block"]
        : className
          ? [String(className), "image-block"]
          : ["image-block"];
    }

    if (!node.children) return;
    for (const child of node.children) {
      visit(child);
    }
  }

  /** @param {HastNode} node */
  function isImageOnlyParagraph(node) {
    const meaningfulChildren = (node.children ?? []).filter((child) => {
      return child.type !== "text" || (child.value ?? "").trim() !== "";
    });

    return meaningfulChildren.length === 1 && isImageOrImageLink(meaningfulChildren[0]);
  }

  /** @param {HastNode} node */
  function isImageOrImageLink(node) {
    if (node.type !== "element") return false;
    if (node.tagName === "img") return true;
    if (node.tagName !== "a") return false;

    const meaningfulChildren = (node.children ?? []).filter((child) => {
      return child.type !== "text" || (child.value ?? "").trim() !== "";
    });
    return meaningfulChildren.length === 1 && meaningfulChildren[0].tagName === "img";
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    allowedHosts: true,
    headers: {
      "Access-Control-Allow-Origin": "https://giscus.app",
    },
  },
  security: {
    allowedDomains: [
      {
        protocol: "https",
        hostname: "giscus.app",
      },
    ],
  },
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
      transformers: [
        {
          name: "lang-label",
          pre(node) {
            const lang = this.options.lang;
            if (lang && lang !== "text" && lang !== "plaintext") {
              node.properties["data-lang"] = lang;
            }
          },
        },
      ],
    },
    smartypants: false,
    remarkPlugins: [
      remarkMath,
      remarkCustomHeaderId,
      remarkHidden, // must run before remarkCjkFriendly
      remarkCjkFriendly,
      remarkCjkFriendlyGfmStrikethrough,
    ],
    rehypePlugins: [
      rehypeRemoveFootnoteLabel,
      rehypeTaskListA11y,
      [rehypeKatex, {}],
      rehypeImageParagraphs,
      rehypeImageSize,
    ],
  },
});
