import { describe, it } from "vitest";
import { Color } from "../../src/Color";
import { ColorType } from "../../src/Types";
import { matchBaseline, renderImage } from "./_visual";

const SIZE = 300;

/** Slices taken along the third axis, as a fraction of that axis' range. */
const SLICES = [0.1, 0.35, 0.6, 0.85];

/**
 * Which two axes of a colour space are plotted (x to the right, y upwards) and
 * which one is sliced. Spaces with a lightness axis always slice on lightness;
 * XYZ slices on Y, its luminance axis.
 */
const PLOTS: {
  mode: ColorType;
  x: number;
  y: number;
  z: number;
  zLabel: string;
}[] = [
  { mode: "rgb", x: 0, y: 1, z: 2, zLabel: "b" },
  { mode: "hsl", x: 0, y: 1, z: 2, zLabel: "l" },
  { mode: "hsb", x: 0, y: 1, z: 2, zLabel: "b" },
  { mode: "lab", x: 1, y: 2, z: 0, zLabel: "l" },
  { mode: "lch", x: 2, y: 1, z: 0, zLabel: "l" },
  { mode: "luv", x: 1, y: 2, z: 0, zLabel: "l" },
  { mode: "xyz", x: 0, y: 2, z: 1, zLabel: "y" },
  { mode: "oklab", x: 1, y: 2, z: 0, zLabel: "l" },
  { mode: "oklch", x: 2, y: 1, z: 0, zLabel: "l" },
];

/**
 * Convert a colour given in normalized (0...1) coordinates of `mode` into
 * full-range sRGB, as a plain `[r, g, b]` triplet (Color's own 4th component is
 * alpha in 0...1, which is not what the image writer expects).
 *
 * Colours outside the sRGB gamut come back clipped per channel, exactly as Pts
 * returns them — the plots record what the library does, artefacts included.
 */
function toRGB(mode: ColorType, values: number[]): number[] {
  const c = Color.from(values[0], values[1], values[2], 1).toMode(mode);
  c.normalized = true;
  const rgb =
    mode === "rgb"
      ? c.$normalize(false)
      : Color[`${mode.toUpperCase()}toRGB`](c, true, false);
  return [rgb[0], rgb[1], rgb[2]];
}

describe("Color space plots", () => {
  const cases = PLOTS.flatMap((plot) =>
    SLICES.map((slice) => ({ plot, slice })),
  );

  it.each(cases)("$plot.mode slice $plot.zLabel=$slice", ({ plot, slice }) => {
    const values = [0, 0, 0];
    values[plot.z] = slice;

    const image = renderImage(SIZE, SIZE, (px, py) => {
      values[plot.x] = (px + 0.5) / SIZE;
      values[plot.y] = 1 - (py + 0.5) / SIZE;
      return toRGB(plot.mode, values);
    });

    const pct = Math.round(slice * 100);
    matchBaseline(`color-${plot.mode}-${plot.zLabel}${pct}`, image);
  });
});
