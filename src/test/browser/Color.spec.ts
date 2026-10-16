import { describe, expect, it } from "vitest";
import { Color } from "../../Color";

describe("D50 colors in CSS", () => {
  it.each([
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [64, 156, 180],
    [80, 90, 100],
    [10, 10, 10],
    [255, 255, 255],
  ])("renders RGB (%s,%s,%s) through CSS lab() and lch()", (r, g, b) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    const rgb = Color.rgb(r, g, b);
    for (const color of [Color.RGBtoLAB(rgb), Color.RGBtoLCH(rgb)]) {
      const css = `${color.mode}(${color[0]}% ${color[1]} ${color[2]})`;
      expect(CSS.supports("color", css)).toBe(true);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      [r, g, b].forEach((channel, i) =>
        expect(Math.abs(pixel[i] - channel)).toBeLessThanOrEqual(1),
      );
    }
  });
});
