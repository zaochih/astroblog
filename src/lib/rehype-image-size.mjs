/**
 * rehype-image-size – inject width/height into local <img> elements at build time,
 * and physically resize large images to save bandwidth.
 *
 * For images whose `src` starts with "/" (i.e. files served from `public/`):
 *   1. Read actual pixel dimensions via sharp.
 *   2. If the width exceeds MAX_CONTENT_WIDTH, resize the image to that width,
 *      convert it to WebP, save it to `public/optimized/...`, and update `src`.
 *   3. Cap the declared width to MAX_CONTENT_WIDTH so the browser reserves
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

/** prose area max-width (px). Matches Tailwind's `max-w-3xl` = 48rem ≈ 768px. */
const MAX_CONTENT_WIDTH = 768;

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
        const relPath = src.replace(/^\//, '');
        const filePath = resolve(process.cwd(), 'public', relPath);

        try {
          const metadata = await sharp(filePath).metadata();
          if (!metadata.width || !metadata.height) return;

          let w = metadata.width;
          let h = metadata.height;

          // Cap to content area max-width, keeping aspect ratio, and physically resize.
          if (w > MAX_CONTENT_WIDTH) {
            h = Math.round(h * (MAX_CONTENT_WIDTH / w));
            w = MAX_CONTENT_WIDTH;

            const parsed = parse(relPath);
            const outDir = resolve(process.cwd(), 'public', 'optimized', parsed.dir);
            await mkdir(outDir, { recursive: true });

            const outName = `${parsed.name}-${MAX_CONTENT_WIDTH}w.webp`;
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
              await sharp(filePath)
                .resize({ width: MAX_CONTENT_WIDTH, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outPath);
            }

            // Update src to the optimized image
            const optimizedSrcPath = parsed.dir ? `${parsed.dir}/${outName}` : outName;
            src = `/optimized/${optimizedSrcPath}`;
            node.properties.src = src;
          }

          node.properties.width = w;
          node.properties.height = h;
          node.properties.loading ??= 'lazy';
          node.properties.decoding ??= 'async';

          // Accessibility: ensure non-empty alt.
          if (!node.properties.alt) {
            node.properties.alt = altFromFilename(src);
          }
        } catch (err) {
          // Non-fatal: the image will simply render without explicit dimensions.
          console.warn(`[rehype-image-size] Could not read "${src}":`, err.message);
        }
      }),
    );
  };
}
