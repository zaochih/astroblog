/**
 * @typedef {object} CalloutType
 * @property {string} label
 * @property {string} icon
 */

/**
 * @typedef {object} MdastNode
 * @property {string} type
 * @property {string} [value]
 * @property {MdastNode[]} [children]
 * @property {{ hName?: string, hProperties?: Record<string, unknown>, [key: string]: unknown }} [data]
 */

/**
 * @typedef {object} CalloutMarker
 * @property {keyof typeof calloutTypes} type
 * @property {string | boolean | undefined} icon
 * @property {boolean} collapsible
 * @property {boolean} open
 * @property {MdastNode[]} titleChildren
 */

/**
 * @typedef {object} ParsedTitle
 * @property {boolean} collapsible
 * @property {boolean} open
 * @property {string} text
 */

/** @typedef {Record<string, string | boolean>} CalloutOptions */

/** @satisfies {Record<string, CalloutType>} */
const calloutTypes = {
  note: {
    label: "Note",
    icon: "info",
  },
  tip: {
    label: "Tip",
    icon: "sparkles",
  },
  success: {
    label: "Success",
    icon: "circle-check",
  },
  important: {
    label: "Important",
    icon: "circle-alert",
  },
  warning: {
    label: "Warning",
    icon: "triangle-alert",
  },
  caution: {
    label: "Caution",
    icon: "circle-x",
  },
  info: {
    label: "Info",
    icon: "info",
  },
  error: {
    label: "Error",
    icon: "circle-x",
  },
};

const iconAliases = {
  alert: "triangle-alert",
  caution: "circle-x",
  check: "circle-check",
  error: "circle-x",
  important: "circle-alert",
  info: "info",
  note: "info",
  sparkles: "sparkles",
  success: "circle-check",
  tip: "sparkles",
  warning: "triangle-alert",
};

/**
 * Convert GitHub-style blockquote alerts into structured callout markup.
 *
 * Supported:
 *   > [!NOTE]
 *   > Content
 *
 *   > [!NOTE] Custom title
 *   > Content
 *
 *   > [!NOTE icon=sparkles] Custom icon
 *   > Content
 *
 *   > [!NOTE]- Collapsed by default
 *   > Content
 *
 *   > [!NOTE]+ Open by default
 *   > Content
 */
export default function remarkCallouts() {
  /** @param {MdastNode} tree */
  return function transform(tree) {
    visit(tree);
  };
}

/** @param {MdastNode} node */
function visit(node) {
  if (!node.children) return;

  for (const child of node.children) {
    visit(child);
    transformBlockquote(child);
  }
}

/** @param {MdastNode} node */
function transformBlockquote(node) {
  if (node.type !== "blockquote") return;

  const firstChild = node.children?.[0];
  if (!firstChild || firstChild.type !== "paragraph") return;

  const marker = readMarker(firstChild);
  if (!marker) return;

  const config = calloutTypes[marker.type] ?? calloutTypes.note;
  const icon = normalizeIcon(marker.icon ?? config.icon);
  /** @type {MdastNode[]} */
  const titleChildren = marker.titleChildren.length > 0
    ? marker.titleChildren
    : [{ type: "text", value: config.label }];

  firstChild.data = {
    ...firstChild.data,
    hName: marker.collapsible ? "summary" : "div",
    hProperties: {
      ...firstChild.data?.hProperties,
      className: ["callout-title", ...(marker.collapsible ? ["callout-summary"] : [])],
    },
  };
  firstChild.children = [
    {
      type: "text",
      value: "",
      data: {
        hName: "span",
        hProperties: {
          "aria-hidden": "true",
          className: ["callout-icon", `callout-icon-${icon}`],
        },
      },
    },
    ...titleChildren,
  ];

  const className = [
    "callout",
    `callout-${marker.type}`,
    ...(marker.collapsible ? ["animated-details", "callout-collapsible"] : []),
  ];

  node.data = {
    ...node.data,
    hName: marker.collapsible ? "details" : "aside",
    hProperties: {
      ...node.data?.hProperties,
      className,
      "data-callout": marker.type,
      ...(marker.open ? { open: true } : {}),
    },
  };
}

/**
 * @param {MdastNode} paragraph
 * @returns {CalloutMarker | null}
 */
function readMarker(paragraph) {
  const children = paragraph.children ?? [];
  const first = children[0];
  if (!first || first.type !== "text") return null;

  const match = first.value.match(/^\s*\[!([A-Za-z][\w-]*)([^\]]*)\](?:[ \t]*(.*))?$/s);
  if (!match) return null;

  const type = match[1].toLowerCase();
  if (!calloutTypes[type]) return null;

  const options = parseOptions(match[2] ?? "");
  const title = parseTitle(match[3] ?? "", options);
  /** @type {MdastNode[]} */
  const titleChildren = [];

  if (title.text) {
    titleChildren.push({ type: "text", value: title.text });
  }

  if (children.length > 1) {
    titleChildren.push(...children.slice(1));
  }

  return {
    type,
    icon: options.icon,
    collapsible: title.collapsible,
    open: title.open,
    titleChildren: trimInlineChildren(titleChildren),
  };
}

/**
 * @param {string} raw
 * @returns {CalloutOptions}
 */
function parseOptions(raw) {
  /** @type {CalloutOptions} */
  const options = {};
  for (const match of raw.matchAll(/\b([A-Za-z][\w-]*)=(?:"([^"]+)"|'([^']+)'|([^\s]+))/g)) {
    options[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  for (const flag of raw.trim().split(/\s+/)) {
    if (!flag || flag.includes("=")) continue;
    options[flag.toLowerCase()] = true;
  }
  return options;
}

/**
 * @param {string} raw
 * @param {CalloutOptions} options
 * @returns {ParsedTitle}
 */
function parseTitle(raw, options) {
  let text = raw;
  let collapsible = Boolean(options.collapse || options.collapsed || options.fold || options.folded || options.open);
  let open = Boolean(options.open);
  const marker = text.match(/^\s*([+-])(?:\s+|$)/);

  if (marker) {
    collapsible = true;
    open = marker[1] === "+";
    text = text.slice(marker[0].length);
  }

  return { collapsible, open, text };
}

/** @param {unknown} icon */
function normalizeIcon(icon) {
  const key = String(icon).toLowerCase();
  return iconAliases[key] ?? (isSupportedIcon(key) ? key : "info");
}

/** @param {string} icon */
function isSupportedIcon(icon) {
  return ["circle-alert", "circle-check", "circle-x", "info", "sparkles", "triangle-alert"].includes(icon);
}

/**
 * @param {MdastNode[]} children
 * @returns {MdastNode[]}
 */
function trimInlineChildren(children) {
  const result = [...children];
  trimTextNode(result, 0, "start");
  trimTextNode(result, result.length - 1, "end");
  return result.filter((child) => child.type !== "text" || child.value !== "");
}

/**
 * @param {MdastNode[]} children
 * @param {number} index
 * @param {"start" | "end"} side
 */
function trimTextNode(children, index, side) {
  const child = children[index];
  if (!child || child.type !== "text") return;
  child.value = side === "start" ? child.value.trimStart() : child.value.trimEnd();
}
