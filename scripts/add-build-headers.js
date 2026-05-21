import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const headersPath = 'dist/_headers';
const distDir = 'dist';
const publicDir = 'public';
const generatedSectionStart = '# Generated per-file Last-Modified headers';
const generatedSectionEnd = '# End generated per-file Last-Modified headers';
const rootStaticExtensions = new Set([
  '.css',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.json',
  '.png',
  '.svg',
  '.txt',
  '.webmanifest',
  '.webp',
  '.xml',
]);
const buildLastModified = new Date().toUTCString();

const headers = await readFile(headersPath, 'utf8');
const lines = stripGeneratedSection(headers).split('\n');
const globalRuleIndex = lines.findIndex((line) => line.trim() === '/*');

if (globalRuleIndex === -1) {
  console.error(`Missing /* rule in ${headersPath}`);
  process.exit(1);
}

let nextRuleIndex = lines.findIndex((line, index) => {
  return index > globalRuleIndex && line.trim() !== '' && !line.startsWith(' ');
});
if (nextRuleIndex === -1) nextRuleIndex = lines.length;

const globalRuleLines = lines.slice(globalRuleIndex + 1, nextRuleIndex);
const lastModifiedIndex = globalRuleLines.findIndex((line) => {
  return line.trim().toLowerCase().startsWith('last-modified:');
});

if (lastModifiedIndex === -1) {
  const firstBlankIndex = globalRuleLines.findIndex((line) => line.trim() === '');
  const insertIndex = firstBlankIndex === -1 ? globalRuleLines.length : firstBlankIndex;
  globalRuleLines.splice(insertIndex, 0, `  Last-Modified: ${buildLastModified}`);
} else {
  globalRuleLines[lastModifiedIndex] = `  Last-Modified: ${buildLastModified}`;
}

lines.splice(globalRuleIndex + 1, nextRuleIndex - globalRuleIndex - 1, ...globalRuleLines);

const fileHeaderRules = await getRootStaticFileHeaderRules();
const fileHeaderRuleCount = fileHeaderRules.filter((line) => line.startsWith('/')).length;
const output = [
  lines.join('\n').trimEnd(),
  '',
  generatedSectionStart,
  ...fileHeaderRules,
  generatedSectionEnd,
  '',
].join('\n');

await writeFile(headersPath, output, 'utf8');

console.log(`Added build Last-Modified: ${buildLastModified}`);
console.log(`Added ${fileHeaderRuleCount} per-file Last-Modified rule(s)`);

/**
 * @param {string} content
 * @returns {string}
 */
function stripGeneratedSection(content) {
  const start = content.indexOf(generatedSectionStart);
  if (start === -1) return content;

  const end = content.indexOf(generatedSectionEnd, start);
  if (end === -1) return content.slice(0, start).trimEnd();

  return `${content.slice(0, start)}${content.slice(end + generatedSectionEnd.length)}`.trimEnd();
}

async function getRootStaticFileHeaderRules() {
  const entries = await readdir(distDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && name !== '_headers')
    .filter((name) => rootStaticExtensions.has(extname(name).toLowerCase()))
    .sort((first, second) => first.localeCompare(second));

  return (
    await Promise.all(
      files.map(async (name) => {
        const lastModified = await getFileLastModified(name);
        return [
          `/${name}`,
          '  ! Last-Modified',
          `  Last-Modified: ${lastModified}`,
          '',
        ];
      }),
    )
  ).flat();
}

async function getFileLastModified(name) {
  const publicPath = join(publicDir, basename(name));
  const distPath = join(distDir, name);

  try {
    const publicStats = await stat(publicPath);
    if (publicStats.isFile()) return publicStats.mtime.toUTCString();
  } catch {
    // Generated root files such as RSS only exist in dist.
  }

  const distStats = await stat(distPath);
  return distStats.mtime.toUTCString();
}
