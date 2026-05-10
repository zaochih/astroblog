/**
 * rehype-image-size – inject width/height into local <img> elements at build time,
 * and physically resize large images to save bandwidth.
 *
 * For images whose `src` starts with "/" (i.e. files served from `public/`):
 *   1. Read actual pixel dimensions via sharp.
 *   2. If the width exceeds OPTIMIZED_IMAGE_WIDTH, resize the image to that width,
 *      convert it to WebP, save it to `public/optimized/...`, and update `src`.
 *   3. Cap the declared width to CONTENT_DISPLAY_WIDTH so the browser reserves
 *      a sensible amount of space (the CSS `max-width: 100%; height: auto`
 *      rule takes care of smaller viewports).
 *   4. Add `loading="lazy"` and `decoding="async"` for performance.
 *
 * Remote images (URLs containing "://") are left untouched.
 */

import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import { resolve, parse } from 'node:path';
import { mkdir, stat } from 'node:fs/promises';

/** prose area max-width (px). Matches Tailwind's `max-w-3xl` = 48rem ~= 768px. */
const CONTENT_DISPLAY_WIDTH = 768;
/** Generate larger images than the display slot so high-DPR screens stay sharp. */
const OPTIMIZED_IMAGE_WIDTH = Math.round(CONTENT_DISPLAY_WIDTH * 1.5);
const PHOTO_WEBP_QUALITY = 100;

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
 * @param {string} relPath
 */
function publicFilePath(relPath) {
  return resolve(process.cwd(), 'public', relPath);
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
        const relPath = src.replace(/^\//, '');
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

          if (sourceWidth > OPTIMIZED_IMAGE_WIDTH) {
            const optimizedHeight = Math.round(sourceHeight * (OPTIMIZED_IMAGE_WIDTH / sourceWidth));

            const parsed = parse(decodedRelPath);
            const ext = parsed.ext.toLowerCase();
            const outDir = resolve(process.cwd(), 'public', 'optimized', parsed.dir);
            await mkdir(outDir, { recursive: true });

            const qualitySuffix = ext === '.png' ? 'lossless' : `q${PHOTO_WEBP_QUALITY}`;
            const outName = `${parsed.name}-${OPTIMIZED_IMAGE_WIDTH}w-${qualitySuffix}.webp`;
            const outPath = resolve(outDir, outName);

            let needsOptimization = true;
            try {
              const srcStat = await stat(filePath);
              const outStat = await stat(outPath);
              if (outStat.mtime >= srcStat.mtime) {
                needsOptimization = false;
              }
            } catch (e) {
              // File doesn't exist, proceed with optimization
            }

            if (needsOptimization) {
              const pipeline = sharp(filePath).resize({
                width: OPTIMIZED_IMAGE_WIDTH,
                height: optimizedHeight,
                withoutEnlargement: true,
              });

              if (ext === '.png') {
                await pipeline.webp({ lossless: true }).toFile(outPath);
              } else {
                await pipeline.webp({ quality: PHOTO_WEBP_QUALITY, smartSubsample: true }).toFile(outPath);
              }
            }

            // Update src to the optimized image
            const optimizedSrcPath = parsed.dir ? `${parsed.dir}/${outName}` : outName;
            src = encodeURI(`/optimized/${optimizedSrcPath}`);
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
