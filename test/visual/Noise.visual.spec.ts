import { describe, it } from "vitest";
import { Noise } from "../../src/Create";
import { matchBaseline, renderImage } from "./_visual";

const SIZE = 300;

/**
 * Plot a noise field: each pixel samples `noise2D` at (x0 + px·scale,
 * y0 + py·scale), mapped from roughly [-1, 1] to grayscale. Noise is pure
 * computation, so these plots pin the exact output of the noise pipeline —
 * gradient hashing, permutation seeding, and cell wrapping included. A
 * repetition artifact (eg, a period-12 gradient cycle) is directly visible
 * as banding.
 */
function noiseField(
  seed: number,
  x0: number,
  y0: number,
  scale: number,
): ReturnType<typeof renderImage> {
  const n = new Noise(0, 0);
  n.seed(seed);
  return renderImage(SIZE, SIZE, (px, py) => {
    n.initNoise(x0 + px * scale, y0 + (SIZE - 1 - py) * scale);
    const v = n.noise2D();
    const g = Math.max(0, Math.min(255, Math.round((v + 1) * 127.5)));
    return [g, g, g];
  });
}

describe("Noise visual", () => {
  it("plots a fine-scale field", async () => {
    await matchBaseline("noise-fine-s42", noiseField(0.42, 0, 0, 0.05));
  });

  it("plots a coarse field spanning many cells", async () => {
    // 0.3/px × 300px = 90 integer cells: gradient-cycle artifacts band here
    await matchBaseline("noise-coarse-s42", noiseField(0.42, 0, 0, 0.3));
  });

  it("plots a second seed", async () => {
    await matchBaseline("noise-coarse-s77", noiseField(0.77, 0, 0, 0.3));
  });

  it("plots a field crossing negative coordinates", async () => {
    await matchBaseline(
      "noise-negative-s42",
      noiseField(0.42, -7.5, -7.5, 0.05),
    );
  });
});
