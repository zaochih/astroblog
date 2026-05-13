import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [, , kind, lang, slug, ...titleParts] = Bun.argv;
const title = titleParts.join(' ').trim();

function usage() {
  console.error('Usage: bun scripts/new-content.js <post|page> <lang> <slug> <title>');
  console.error('Examples: bun new:post zh-cn my-post "标题"');
  console.error('          bun new:page zh-cn about "关于"');
  process.exit(1);
}

function quote(value) {
  return JSON.stringify(value);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

if ((kind !== 'post' && kind !== 'page') || !lang || !slug || !title) {
  usage();
}

if (!/^[a-z]{2}-[a-z]{2}$/i.test(lang)) {
  console.error(`Invalid lang: ${lang}`);
  process.exit(1);
}

const uiSource = await readFile('src/i18n/ui.ts', 'utf8');
const supportedLangs = new Set(
  [...uiSource.matchAll(/^\s*'([a-z]{2}-[a-z]{2})':\s*\{/gim)].map((match) => match[1].toLowerCase()),
);
if (!supportedLangs.has(lang.toLowerCase())) {
  console.error(`Unsupported lang: ${lang}`);
  console.error(`Supported languages: ${[...supportedLangs].join(', ')}`);
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
  console.error(`Invalid slug: ${slug}`);
  process.exit(1);
}

const baseDir = kind === 'post' ? 'src/data/posts' : 'src/data/pages';
const filePath = join(baseDir, lang.toLowerCase(), `${slug}.md`);

if (existsSync(filePath)) {
  console.error(`Already exists: ${filePath}`);
  process.exit(1);
}

const frontmatter = kind === 'post'
  ? [
      '---',
      `title: ${quote(title)}`,
      `date: ${todayIsoDate()}`,
      'description: ""',
      'tags: []',
      'category: ""',
      'draft: true',
      '---',
      '',
      '',
    ].join('\n')
  : [
      '---',
      `title: ${quote(title)}`,
      'description: ""',
      'draft: true',
      '---',
      '',
      '',
    ].join('\n');

await mkdir(dirname(filePath), { recursive: true });
await writeFile(filePath, frontmatter, 'utf8');
console.log(`Created ${filePath}`);
