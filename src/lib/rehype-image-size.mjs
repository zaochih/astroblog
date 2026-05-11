/**
 * rehype-image-size – inject width/height into local <img> elements at build time,
 * and physically resize large images to save bandwidth.
 *
 * For images whose `src` starts with "/" (i.e. files served from `public/`):
 *   1. Read actual pixel dimensions via sharp.
 *   2. If the width exceeds OPTIMIZED_IMAGE_WIDTH, resize the image to that width,
 *      convert it to WebP, save it to `public/assets/images/optimized/...`,
 *      and update `src`.
 *   3. Cap the declared width to CONTENT_DISPLAY_WIDTH so the browser reserves
 *      a sensible amount of space (the CSS `max-width: 100%; height: auto`
 *      rule takes care of smaller viewports).
 *   4. Add `loading="lazy"` and `decoding="async"` for performance.
 *
 * Remote images (URLs containing "://") are left untouched.
 */

import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import { resolve, parse, relative } from 'node:path';
import { mkdir, stat } from 'node:fs/promises';

/** prose area max-width (px). Matches Tailwind's `max-w-3xl` = 48rem ~= 768px. */
const CONTENT_DISPLAY_WIDTH = 768;
/** Generate larger images than the display slot so high-DPR screens stay sharp. */
const OPTIMIZED_IMAGE_WIDTH = Math.round(CONTENT_DISPLAY_WIDTH * 1.5);
const PHOTO_WEBP_QUALITY = 100;
const OPT_OUT_QUERY_KEYS = ['hdr', 'raw', 'noopt', 'original'];

/**
 * Determine whether a src string refers to a local (public/) asset.
 * @param {string} src
 */
function isLocalImage(src) {
  if (!src) return false;
  // Remote URLs contain "://"
  if (src.includes('://')) return false;
  // Must start with "/" to be a public/ reference
  return src.startsWith('/');
}

/**
 * Derive a basic alt-text from a filename when none is provided.
 * "/foo/bar/my-screenshot.png" → "my screenshot"
 * @param {string} src
 */
function altFromFilename(src) {
  const base = src.split('/').pop() ?? '';
  const name = base.replace(/\.[^.]+$/, ''); // strip extension
  return name.replace(/[-_]/g, ' ');
}

/**
 * Safely decode Markdown URLs before mapping them to the local filesystem.
 * Static servers decode request paths, so generated files must use decoded
 * directory names even though the emitted HTML URL remains encoded.
 * @param {string} path
 */
function decodePath(path) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

/**
 * Split a URL-ish image path into path/query/hash while preserving the original
 * query/hash for links that opt out of optimization.
 * @param {string} src
 */
function splitImageSrc(src) {
  const hashIndex = src.indexOf('#');
  const beforeHash = hashIndex === -1 ? src : src.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : src.slice(hashIndex);
  const queryIndex = beforeHash.indexOf('?');
  return {
    pathname: queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex),
    query: queryIndex === -1 ? '' : beforeHash.slice(queryIndex),
    hash,
  };
}

/**
 * @param {string} query
 */
function hasOptOutQuery(query) {
  if (!query) return false;
  const params = new URLSearchParams(query.slice(1));
  return OPT_OUT_QUERY_KEYS.some((key) => {
    const value = params.get(key);
    return value !== null && value !== '0' && value !== 'false';
  });
}

/**
 * @param {string} query
 */
function shouldPreserveOriginal(query = '') {
  return hasOptOutQuery(query);
}

/**
 * Remove build-only image control params from the emitted URL while preserving
 * unrelated query params and hashes.
 * @param {string} pathname
 * @param {string} query
 * @param {string} hash
 */
function cleanImageControlParams(pathname, query, hash) {
  if (!query) return `${pathname}${hash}`;
  const params = new URLSearchParams(query.slice(1));
  for (const key of OPT_OUT_QUERY_KEYS) {
    params.delete(key);
  }
  const cleanedQuery = params.toString();
  return `${pathname}${cleanedQuery ? `?${cleanedQuery}` : ''}${hash}`;
}

/**
 * @param {string} relPath
 */
function publicFilePath(relPath) {
  return resolve(process.cwd(), 'public', relPath);
}

/**
 * Place generated images under public/assets/images/optimized while preserving
 * the source image's path below public/assets/images when possible.
 * @param {string} decodedRelPath
 */
function optimizedImagePath(decodedRelPath) {
  const parsed = parse(decodedRelPath);
  const publicRoot = resolve(process.cwd(), 'public');
  const imagesRoot = resolve(publicRoot, 'assets', 'images');
  const sourceDir = resolve(publicRoot, parsed.dir);
  const dirBelowImages = relative(imagesRoot, sourceDir);
  const safeDir =
    dirBelowImages && !dirBelowImages.startsWith('..') && !dirBelowImages.startsWith('/')
      ? dirBelowImages
      : parsed.dir.replace(/^assets\/images\/?/, '');

  return {
    parsed,
    outDir: resolve(imagesRoot, 'optimized', safeDir),
    urlDir: ['assets', 'images', 'optimized', safeDir].filter(Boolean).join('/'),
  };
}

/**
 * Optimize a public/ image and return the URL that should be emitted.
 * By default this re-encodes to WebP, which strips HDR gain maps and other
 * auxiliary metadata. Use ?hdr=1, ?raw=1, ?noopt=1, or ?original=1 to
 * intentionally keep the original; these build-only params are removed from
 * the emitted URL.
 * @param {string} src
 * @param {{ width?: number, force?: boolean }} [options]
 */
export async function optimizeLocalImage(src, options = {}) {
  if (!isLocalImage(src)) return { src, optimized: false };

  const { pathname, query, hash } = splitImageSrc(src);
  const relPath = pathname.replace(/^\//, '');
  const decodedRelPath = decodePath(relPath);
  let filePath = publicFilePath(decodedRelPath);

  try {
    try {
      await stat(filePath);
    } catch {
      if (decodedRelPath !== relPath) {
        const encodedFilePath = publicFilePath(relPath);
        await stat(encodedFilePath);
        filePath = encodedFilePath;
      } else {
        throw new Error(`Input file is missing: ${filePath}`);
      }
    }

    const metadata = await sharp(filePath).metadata();
    if (!metadata.width || !metadata.height) return { src, optimized: false };

    if (shouldPreserveOriginal(query)) {
      return {
        src: cleanImageControlParams(pathname, query, hash),
        optimized: false,
        width: metadata.width,
        height: metadata.height,
      };
    }

    const targetWidth = options.width ?? OPTIMIZED_IMAGE_WIDTH;
    const outputWidth = options.force ? Math.min(metadata.width, targetWidth) : targetWidth;
    if (!options.force && metadata.width <= targetWidth) {
      return { src, optimized: false, width: metadata.width, height: metadata.height };
    }

    const outputHeight = Math.round(metadata.height * (outputWidth / metadata.width));
    const { parsed, outDir, urlDir } = optimizedImagePath(decodedRelPath);
    const ext = parsed.ext.toLowerCase();
    const qualitySuffix = ext === '.png' ? 'lossless' : `q${PHOTO_WEBP_QUALITY}`;
    const outName = `${parsed.name}-${outputWidth}w-${qualitySuffix}.webp`;
    const outPath = resolve(outDir, outName);

    await mkdir(outDir, { recursive: true });

    let needsOptimization = true;
    try {
      const srcStat = await stat(filePath);
      const outStat = await stat(outPath);
      if (outStat.mtime >= srcStat.mtime) {
        needsOptimization = false;
      }
    } catch {
      // File doesn't exist, proceed with optimization
    }

    if (needsOptimization) {
      const pipeline = sharp(filePath).resize({
        width: outputWidth,
        height: outputHeight,
        withoutEnlargement: true,
      });

      if (ext === '.png') {
        await pipeline.webp({ lossless: true }).toFile(outPath);
      } else {
        await pipeline.webp({ quality: PHOTO_WEBP_QUALITY, smartSubsample: true }).toFile(outPath);
      }
    }

    return {
      src: encodeURI(`/${urlDir}/${outName}`),
      optimized: true,
      width: Math.min(metadata.width, outputWidth),
      height: outputHeight,
    };
  } catch (err) {
    console.warn(`[rehype-image-size] Could not read "${src}":`, err.message);
    return { src, optimized: false };
  }
}

/** @returns {import('unified').Plugin} */
export default function rehypeImageSize() {
  /**
   * @param {import('hast').Root} tree
   */
  return async function transformer(tree) {
    /** @type {Array<{node: import('hast').Element}>} */
    const localImages = [];

    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const src = /** @type {string | undefined} */ (node.properties?.src);
      if (isLocalImage(src)) {
        localImages.push({ node });
      }
    });

    // Process all local images concurrently.
    await Promise.all(
      localImages.map(async ({ node }) => {
        let src = /** @type {string} */ (node.properties.src);
        const originalSrc = src;
        const { pathname, query, hash } = splitImageSrc(src);
        const relPath = pathname.replace(/^\//, '');
        const decodedRelPath = decodePath(relPath);
        let filePath = publicFilePath(decodedRelPath);

        try {
          try {
            await stat(filePath);
          } catch {
            if (decodedRelPath !== relPath) {
              const encodedFilePath = publicFilePath(relPath);
              await stat(encodedFilePath);
              filePath = encodedFilePath;
            } else {
              throw new Error(`Input file is missing: ${filePath}`);
            }
          }

          const metadata = await sharp(filePath).metadata();
          if (!metadata.width || !metadata.height) return;

          const sourceWidth = metadata.width;
          const sourceHeight = metadata.height;
          const displayWidth = Math.min(sourceWidth, CONTENT_DISPLAY_WIDTH);
          const displayHeight = Math.round(sourceHeight * (displayWidth / sourceWidth));

          if (shouldPreserveOriginal(query)) {
            src = cleanImageControlParams(pathname, query, hash);
            node.properties.src = src;
          } else if (sourceWidth > OPTIMIZED_IMAGE_WIDTH) {
            const optimized = await optimizeLocalImage(src);
            src = optimized.src;
            node.properties.src = src;
          }

          node.properties.width = displayWidth;
          node.properties.height = displayHeight;
          node.properties.loading ??= 'lazy';
          node.properties.decoding ??= 'async';

          // Accessibility: ensure non-empty alt.
          if (!node.properties.alt) {
            node.properties.alt = altFromFilename(originalSrc);
          }
        } catch (err) {
          // Non-fatal: the image will simply render without explicit dimensions.
          console.warn(`[rehype-image-size] Could not read "${src}":`, err.message);
        }
      }),
    );
  };
}
