import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import yaml from 'js-yaml';
import TurndownService from 'turndown';

const DEFAULT_PRIMARY_LANG = 'zh-cn';
const DEFAULT_SOURCE_LANG = 'en-us';
const DEFAULT_OUT_DIR = 'src/data/posts';

function usage() {
  console.error(`Usage: bun migrate:wp <wordpress-export.xml> [options]

Options:
  --dry-run              Print planned writes without creating files
  --overwrite            Replace existing generated markdown files
  --limit <n>            Migrate only the first n matching posts
  --slug <slug>          Migrate one WordPress slug
  --primary-lang <lang>  Primary draft language directory (default: zh-cn)
  --source-lang <lang>   Source/original language directory (default: en-us)
  --out-dir <dir>        Posts output directory (default: src/data/posts)
  --draft-en             Mark source-language posts as draft too
`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    file: '',
    dryRun: false,
    overwrite: false,
    limit: Number.POSITIVE_INFINITY,
    slug: '',
    primaryLang: DEFAULT_PRIMARY_LANG,
    sourceLang: DEFAULT_SOURCE_LANG,
    outDir: DEFAULT_OUT_DIR,
    draftSource: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--') && !args.file) {
      args.file = arg;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--overwrite') {
      args.overwrite = true;
    } else if (arg === '--draft-en') {
      args.draftSource = true;
    } else if (arg === '--limit') {
      args.limit = Number(argv[++i]);
    } else if (arg === '--slug') {
      args.slug = argv[++i] ?? '';
    } else if (arg === '--primary-lang') {
      args.primaryLang = argv[++i] ?? DEFAULT_PRIMARY_LANG;
    } else if (arg === '--source-lang') {
      args.sourceLang = argv[++i] ?? DEFAULT_SOURCE_LANG;
    } else if (arg === '--out-dir') {
      args.outDir = argv[++i] ?? DEFAULT_OUT_DIR;
    } else {
      usage();
    }
  }

  if (!args.file || Number.isNaN(args.limit) || args.limit <= 0) usage();
  return args;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

turndown.addRule('preCode', {
  filter(node) {
    return node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE';
  },
  replacement(_content, node) {
    const code = node.firstChild;
    const className = code.getAttribute('class') ?? '';
    const lang = className.match(/language-([A-Za-z0-9_-]+)/)?.[1] ?? '';
    return `\n\n\`\`\`${lang}\n${code.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`;
  },
});

turndown.addRule('figureCaption', {
  filter: 'figcaption',
  replacement(content) {
    return content.trim() ? `\n\n_${content.trim()}_\n\n` : '';
  },
});

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.map(item => text(item)).join('');
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return text(value['#text']);
  return '';
}

function cleanHtml(html) {
  return text(html)
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim();
}

function htmlToMarkdown(html) {
  const markdown = turndown
    .turndown(cleanHtml(html))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return markdown ? `${markdown}\n` : '';
}

function stripHtml(html) {
  return htmlToMarkdown(html)
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return text(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function wpDateToIso(value) {
  const raw = text(value).trim();
  if (!raw || raw.startsWith('0000-00-00')) return undefined;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? `${raw.replace(' ', 'T')}Z`
    : raw;
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().replace('.000Z', 'Z');
}

function unique(values) {
  return [...new Set(values.map(v => v.trim()).filter(Boolean))];
}

function taxonomyTerms(item, domain) {
  return unique(
    asArray(item.category)
      .filter(category => category?.['@_domain'] === domain)
      .map(category => text(category['@_nicename'] || category)),
  );
}

function postMeta(item, key) {
  return asArray(item['wp:postmeta'])
    .find(meta => text(meta['wp:meta_key']) === key);
}

function postMetaValue(item, key) {
  return text(postMeta(item, key)?.['wp:meta_value']).trim();
}

function shouldEnableMath(markdown) {
  return /(^|[^\\])\$\$[\s\S]+?\$\$/.test(markdown)
    || /(^|[^\\])\$[^$\n]+\$/.test(markdown)
    || /\\\(|\\\[|\\begin\{/.test(markdown);
}

function dumpFrontmatter(data) {
  const compact = Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return value !== '';
    }),
  );

  return yaml.dump(compact, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
    sortKeys: false,
  }).trim();
}

function markdownFile(frontmatter, body) {
  return `---\n${dumpFrontmatter(frontmatter)}\n---\n\n${body}`;
}

function buildAttachmentMap(items) {
  const map = new Map();
  for (const item of items) {
    if (text(item['wp:post_type']) !== 'attachment') continue;
    const id = text(item['wp:post_id']).trim();
    const url = text(item['wp:attachment_url']).trim();
    if (id && url) map.set(id, url);
  }
  return map;
}

function getCover(item, attachmentUrlById) {
  const thumbnailId = postMetaValue(item, '_thumbnail_id');
  return thumbnailId ? attachmentUrlById.get(thumbnailId) : undefined;
}

function normalizePost(item, attachmentUrlById, args) {
  const title = text(item.title).trim() || '(untitled)';
  const slug = slugify(item['wp:post_name']) || slugify(title);
  const body = htmlToMarkdown(item['content:encoded']);
  const excerpt = stripHtml(item['excerpt:encoded']);
  const date = wpDateToIso(item['wp:post_date_gmt']) ?? wpDateToIso(item.pubDate);
  const updated = wpDateToIso(item['wp:post_modified_gmt']);
  const tags = taxonomyTerms(item, 'post_tag');
  const categories = taxonomyTerms(item, 'category');
  const status = text(item['wp:status']).trim();
  const cover = getCover(item, attachmentUrlById);
  const math = shouldEnableMath(body);
  const commentsClosed = text(item['wp:comment_status']).trim() === 'closed';
  const canonicalUrl = text(item.link).trim();

  const primaryFrontmatter = {
    title,
    date,
    updated: updated && updated !== date ? updated : undefined,
    description: excerpt,
    tags,
    category: categories[0],
    cover,
    canonicalUrl,
    math: math || undefined,
    comments: commentsClosed ? false : undefined,
    draft: true,
  };

  const sourceFrontmatter = {
    title,
    description: excerpt,
    draft: args.draftSource || status !== 'publish' ? true : undefined,
  };

  return {
    slug,
    status,
    primaryPath: join(args.outDir, args.primaryLang, `${slug}.md`),
    sourcePath: join(args.outDir, args.sourceLang, `${slug}.md`),
    primaryContent: markdownFile(primaryFrontmatter, body),
    sourceContent: markdownFile(sourceFrontmatter, body),
  };
}

async function writeIfAllowed(filePath, content, args) {
  if (existsSync(filePath) && !args.overwrite) {
    return { filePath, status: 'exists' };
  }

  if (!args.dryRun) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf8');
  }

  return { filePath, status: args.dryRun ? 'planned' : 'written' };
}

const rawArgs = Bun.argv.slice(2).filter(arg => arg !== 'migrate:wp');
const args = parseArgs(rawArgs);
const xml = await readFile(args.file, 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '#text',
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  isArray(_name, jpath) {
    return [
      'rss.channel.item',
      'rss.channel.item.category',
      'rss.channel.item.wp:postmeta',
    ].includes(jpath);
  },
});

const wxr = parser.parse(xml);
const items = asArray(wxr?.rss?.channel?.item);
const attachmentUrlById = buildAttachmentMap(items);
const skippedStatuses = new Set(['trash', 'auto-draft', 'inherit']);
let posts = items
  .filter(item => text(item['wp:post_type']) === 'post')
  .filter(item => !skippedStatuses.has(text(item['wp:status']).trim()));

if (args.slug) posts = posts.filter(item => slugify(item['wp:post_name']) === args.slug);
posts = posts.slice(0, args.limit);

let written = 0;
let existing = 0;
for (const item of posts) {
  const post = normalizePost(item, attachmentUrlById, args);
  const primaryResult = await writeIfAllowed(post.primaryPath, post.primaryContent, args);
  const sourceResult = await writeIfAllowed(post.sourcePath, post.sourceContent, args);

  written += [primaryResult, sourceResult].filter(result => result.status !== 'exists').length;
  existing += [primaryResult, sourceResult].filter(result => result.status === 'exists').length;

  console.log(`${post.slug} (${post.status})`);
  console.log(`  ${primaryResult.status}: ${primaryResult.filePath}`);
  console.log(`  ${sourceResult.status}: ${sourceResult.filePath}`);
}

console.log('');
console.log(`${args.dryRun ? 'Planned' : 'Processed'} ${posts.length} posts, ${written} file writes, ${existing} existing files skipped.`);
if (existing > 0 && !args.overwrite) {
  console.log('Use --overwrite to replace existing markdown files.');
}
