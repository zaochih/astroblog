/**
 * remark-hidden - convert [hidden]...[/hidden] shortcodes into
 * <span class="hidden-text hidden-text-{blur|background}"> elements.
 */

import { visit } from "unist-util-visit";

const HIDDEN_RE = /\[(hidden|spoiler)([^\]]*)\]([\s\S]*?)\[\/\1\]/g;

export default function remarkHidden() {
  /** @param {import('mdast').Root} tree */
  return function (tree) {
    const targets = [];

    visit(tree, "text", (node, index, parent) => {
      if (!parent || index == null) return;
      if (!node.value.includes("[hidden") && !node.value.includes("[spoiler")) {
        return;
      }
      targets.push({ node, index, parent });
    });

    // Reverse order so splicing doesn't shift earlier indices.
    targets.sort((a, b) => {
      if (a.parent !== b.parent) return 0;
      return b.index - a.index;
    });

    for (const { node, index, parent } of targets) {
      const newNodes = splitHidden(node.value);
      if (newNodes.length === 1 && newNodes[0].type === "text") continue;
      parent.children.splice(index, 1, ...newNodes);
    }
  };
}

function parseAttr(attrStr, name) {
  const m = attrStr.match(new RegExp(`${name}=(["'])(.*?)\\1`));
  return m ? m[2] : null;
}

function splitHidden(text) {
  const nodes = [];
  let lastIndex = 0;
  HIDDEN_RE.lastIndex = 0;
  let match;

  while ((match = HIDDEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const [, , attrStr, content] = match;
    const tip = parseAttr(attrStr, "tip");
    const type = parseAttr(attrStr, "type") ?? "blur";
    const className =
      type === "background"
        ? "hidden-text hidden-text-background"
        : "hidden-text hidden-text-blur";

    const hProperties = { className };
    if (tip) hProperties.title = tip;

    nodes.push({
      type: "hidden",
      data: { hName: "span", hProperties },
      children: [{ type: "text", value: content }],
    });

    lastIndex = match.index + match[0].length;
  }

  if (nodes.length === 0) return [{ type: "text", value: text }];
  if (lastIndex < text.length) {
    nodes.push({ type: "text", value: text.slice(lastIndex) });
  }
  return nodes;
}
