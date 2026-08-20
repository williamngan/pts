/**
 * Visual regression harness.
 *
 * A test renders an RGBA image, then [`matchBaseline`](#link) compares it byte
 * for byte against a committed PNG in `test/visual/baselines`. Mismatches write
 * the rendered image and a diff mask into `test/visual/output` for inspection.
 *
 * Run `pnpm test:visual` to check, `pnpm test:visual:update` to re-record.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePNG, encodePNG, RGBAImage } from "./_png";

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_DIR = join(HERE, "baselines");
export const OUTPUT_DIR = join(HERE, "output");

const UPDATE = process.env.UPDATE_VISUAL === "1";
const CI = !!process.env.CI;

export type MatchOptions = {
  /** Per-channel difference a pixel may have before it counts as changed. Default 1, to absorb last-bit float noise. */
  tolerance?: number;
  /** Max allowed fraction of pixels exceeding `tolerance`. Default 0 — one such pixel fails. */
  maxDiffRatio?: number;
  /**
   * Max allowed fraction of pixels differing at all (by 1 or more). Default
   * 0.01: scattered rounding noise passes, but a change that nudges the whole
   * image by a single level still fails.
   */
  maxSoftDiffRatio?: number;
};

/**
 * Build an image by evaluating `fn` at every pixel. `fn` returns `[r, g, b]` or
 * `[r, g, b, a]` in 0...255; values are clamped and rounded.
 */
export function renderImage(
  width: number,
  height: number,
  fn: (x: number, y: number) => ArrayLike<number>,
): RGBAImage {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const c = fn(x, y);
      pixels[i] = Math.round(c[0]);
      pixels[i + 1] = Math.round(c[1]);
      pixels[i + 2] = Math.round(c[2]);
      pixels[i + 3] = c.length > 3 ? Math.round(c[3]) : 255;
    }
  }
  return { width, height, pixels };
}

function write(dir: string, name: string, image: RGBAImage): string {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.png`);
  writeFileSync(file, encodePNG(image));
  return file;
}

/**
 * Paint differing pixels red over a dimmed copy of the baseline.
 */
function diffImage(
  baseline: RGBAImage,
  actual: RGBAImage,
  tolerance: number,
): { image: RGBAImage; count: number; softCount: number; maxDelta: number } {
  const { width, height } = baseline;
  const pixels = new Uint8ClampedArray(width * height * 4);
  let count = 0;
  let softCount = 0;
  let maxDelta = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    let delta = 0;
    for (let c = 0; c < 4; c++) {
      delta = Math.max(
        delta,
        Math.abs(baseline.pixels[i + c] - actual.pixels[i + c]),
      );
    }
    maxDelta = Math.max(maxDelta, delta);
    if (delta > 0) softCount++;

    if (delta > tolerance) {
      count++;
      pixels[i] = 255;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
    } else {
      const gray =
        (baseline.pixels[i] + baseline.pixels[i + 1] + baseline.pixels[i + 2]) /
        3;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 110 + gray * 0.45;
    }
    pixels[i + 3] = 255;
  }

  return { image: { width, height, pixels }, count, softCount, maxDelta };
}

/**
 * Compare a rendered image against its committed baseline PNG.
 * @param name baseline file name without extension, eg `"color-lab-l35"`
 * @param image the rendered image
 * @param opts optional tolerances
 */
export function matchBaseline(
  name: string,
  image: RGBAImage,
  opts: MatchOptions = {},
): void {
  const tolerance = opts.tolerance ?? 1;
  const maxDiffRatio = opts.maxDiffRatio ?? 0;
  const maxSoftDiffRatio = opts.maxSoftDiffRatio ?? 0.01;
  const file = join(BASELINE_DIR, `${name}.png`);

  if (UPDATE || !existsSync(file)) {
    if (!existsSync(file) && CI) {
      throw new Error(
        `Missing visual baseline "${name}.png". Run \`pnpm test:visual:update\` and commit it.`,
      );
    }
    write(BASELINE_DIR, name, image);
    if (!UPDATE) {
      console.warn(`[visual] recorded new baseline ${name}.png`);
    }
    return;
  }

  const baseline = decodePNG(readFileSync(file));
  if (baseline.width !== image.width || baseline.height !== image.height) {
    write(OUTPUT_DIR, name, image);
    throw new Error(
      `Visual baseline "${name}" size changed: expected ${baseline.width}x${baseline.height}, got ${image.width}x${image.height}`,
    );
  }

  const diff = diffImage(baseline, image, tolerance);
  const total = image.width * image.height;
  const ratio = diff.count / total;
  const softRatio = diff.softCount / total;
  if (ratio > maxDiffRatio || softRatio > maxSoftDiffRatio) {
    write(OUTPUT_DIR, name, image);
    write(OUTPUT_DIR, `${name}.diff`, diff.image);
    throw new Error(
      `Visual mismatch in "${name}": ${diff.count}/${total} pixels differ by more than ${tolerance} (${(ratio * 100).toFixed(3)}%), ` +
        `${diff.softCount}/${total} differ at all (${(softRatio * 100).toFixed(3)}%), max channel delta ${diff.maxDelta}.\n` +
        `See ${join(OUTPUT_DIR, `${name}.png`)} and ${join(OUTPUT_DIR, `${name}.diff.png`)}. If the change is intended, run \`pnpm test:visual:update\`.`,
    );
  }
}
