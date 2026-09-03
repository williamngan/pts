import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BASELINE_DIR, matchBaseline, renderImage } from "./_visual";

describe.skipIf(process.env.UPDATE_VISUAL === "1")(
  "Visual baseline safety",
  () => {
    it("fails without recording an unreviewed missing baseline", () => {
      const name = "missing-baseline-regression";
      const file = join(BASELINE_DIR, `${name}.png`);
      expect(existsSync(file)).toBe(false);
      expect(() =>
        matchBaseline(
          name,
          renderImage(1, 1, () => [255, 0, 0]),
        ),
      ).toThrow('Missing visual baseline "missing-baseline-regression.png"');
      expect(existsSync(file)).toBe(false);
    });
  },
);
