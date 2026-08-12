import { describe, expect, it } from "vitest";
import { Color } from "../Color";

function expectColor(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  precision = 2,
) {
  expect(Array.from(actual)).toHaveLength(expected.length);
  Array.from(expected).forEach((value, index) => {
    expect(actual[index]).toBeCloseTo(value, precision);
  });
}

describe("Color construction and representation", () => {
  it("constructs from partial values and every supported mode", () => {
    expectColor(Color.from(10, 20), [10, 20, 1, 1]);
    const constructors = {
      rgb: Color.rgb,
      hsl: Color.hsl,
      hsb: Color.hsb,
      lab: Color.lab,
      lch: Color.lch,
      luv: Color.luv,
      xyz: Color.xyz,
    };

    for (const mode in constructors) {
      const create = constructors[mode as keyof typeof constructors];
      const color = create(1, 2, 3, 0.5);
      expect(color.mode).toBe(mode);
      expectColor(color, [1, 2, 3, 0.5]);
    }
    expectColor(Color.maxValues("rgb"), [255, 255, 255]);
    expectColor(Color.maxValues("lab"), [100, 127, 127]);
  });

  it.each([
    ["#FFFF00", [255, 255, 0, 1]],
    ["ffff00", [255, 255, 0, 1]],
    ["Ff0", [255, 255, 0, 1]],
    ["A", [170, 255, 255, 1]],
    ["33669980", [51, 102, 153, 1]],
  ])("parses hexadecimal color %s", (hex, expected) => {
    expectColor(Color.fromHex(hex), expected);
  });

  it("exposes channel aliases for each mode", () => {
    const rgb = Color.rgb(1, 2, 3);
    rgb.r = 10;
    rgb.g = 20;
    rgb.b = 30;
    rgb.alpha = 0.25;
    expect([rgb.r, rgb.g, rgb.b, rgb.alpha]).toEqual([10, 20, 30, 0.25]);

    const hsl = Color.hsl(40, 0.5, 0.25);
    hsl.h = 50;
    hsl.s = 0.6;
    hsl.l = 0.3;
    expectColor(hsl, [50, 0.6, 0.3, 1]);

    const lch = Color.lch(60, 40, 120);
    lch.l = 70;
    lch.c = 50;
    lch.h = 180;
    expectColor(lch, [70, 50, 180, 1]);

    const lab = Color.lab(30, 4, 5);
    lab.a = 8;
    expect(lab.a).toBe(8);
    const luv = Color.luv(30, 4, 5);
    luv.u = 6;
    luv.v = 7;
    expect([luv.u, luv.v]).toEqual([6, 7]);

    const threeChannels = new Color(1, 2, 3);
    threeChannels.alpha = 0.1;
    expect(threeChannels.alpha).toBe(1);
  });

  it("clones mode and renders CSS-compatible strings", () => {
    const color = Color.rgb(15.9, 16.2, 255, 0.4);
    expect(color.hex).toBe("#0f10ff");
    expect(color.rgb).toBe("rgb(15,16,255)");
    expect(color.rgba).toBe("rgba(15,16,255,0.4000000059604645)");
    expect(color.toString()).toBe(
      "rgb(15.899999618530273,16.200000762939453,255,0.4000000059604645)",
    );
    const clone = color.clone();
    expect(clone).not.toBe(color);
    expect(clone.mode).toBe("rgb");
    expectColor(clone, color, 5);
  });

  it("normalizes and denormalizes mode-specific ranges", () => {
    const rgb = Color.rgb(0, 127.5, 255);
    expect(rgb.normalize()).toBe(rgb);
    expect(rgb.normalized).toBe(true);
    expectColor(rgb, [0, 0.5, 1, 1]);
    expect(rgb.normalize()).toBe(rgb);
    expectColor(rgb.normalize(false), [0, 127.5, 255, 1]);
    const normalizedCopy = rgb.$normalize();
    expect(normalizedCopy).not.toBe(rgb);
    expectColor(normalizedCopy, [0, 0.5, 1, 1]);

    const lab = Color.lab(50, -128, 127).normalize();
    expectColor(lab, [0.5, 0, 1, 1]);
    lab.normalized = false;
    expect(lab.normalized).toBe(false);
  });

  it("converts through dynamic mode dispatch and rejects unsupported pairs", () => {
    const rgb = Color.rgb(255, 0, 0);
    expect(rgb.toMode("hsl", true).mode).toBe("hsl");
    expectColor(rgb, [0, 1, 0.5, 1]);
    expect(rgb.toMode("rgb", true).mode).toBe("rgb");
    expectColor(rgb, [255, 0, 0, 1]);

    const direct = Color.rgb(1, 2, 3).toMode("luv");
    expect(direct.mode).toBe("luv");
    expect(() => direct.toMode("hsb", true)).toThrow(
      "Cannot convert color with LUVtoHSB",
    );
  });
});

describe("Color-space conversions", () => {
  const samples = [
    Color.rgb(255, 0, 0, 0.75),
    Color.rgb(0, 255, 0, 0.75),
    Color.rgb(0, 0, 255, 0.75),
    Color.rgb(128, 128, 128, 0.75),
    Color.rgb(12, 34, 56, 0.75),
    Color.rgb(250, 240, 10, 0.75),
  ];

  it("round-trips RGB through HSL across hue and achromatic branches", () => {
    for (const sample of samples) {
      const hsl = Color.RGBtoHSL(sample);
      expect(hsl.mode).toBe("hsl");
      expect(hsl.alpha).toBeCloseTo(0.75);
      expectColor(Color.HSLtoRGB(hsl), sample, 3);
    }

    expectColor(
      Color.HSLtoRGB(Color.hsl(0, 0, 0.25)),
      [63.75, 63.75, 63.75, 1],
    );
    expectColor(Color.RGBtoHSL(Color.rgb(1, 0, 0), true, true), [0, 1, 0.5, 1]);
    expectColor(
      Color.HSLtoRGB(Color.hsl(0.5, 1, 0.5), true, true),
      [0, 1, 1, 1],
    );
  });

  it("round-trips RGB through every HSB sector", () => {
    for (let hue = 0; hue < 360; hue += 60) {
      const hsb = Color.hsb(hue, 0.8, 0.9, 0.6);
      const rgb = Color.HSBtoRGB(hsb);
      const result = Color.RGBtoHSB(rgb);
      expect(result.h).toBeCloseTo(hue, 2);
      expect(result.s).toBeCloseTo(0.8, 2);
      expect(result.b).toBeCloseTo(0.9, 2);
    }
    expectColor(Color.RGBtoHSB(Color.rgb(0, 0, 0)), [0, 0, 0, 1]);
    expectColor(Color.HSBtoRGB(Color.hsb(0.5, 1, 1), true, true), [0, 1, 1, 1]);
  });

  it.each([
    ["LAB", Color.RGBtoLAB, Color.LABtoRGB],
    ["LCH", Color.RGBtoLCH, Color.LCHtoRGB],
    ["LUV", Color.RGBtoLUV, Color.LUVtoRGB],
    ["XYZ", Color.RGBtoXYZ, Color.XYZtoRGB],
  ])(
    "round-trips representative RGB colors through %s",
    (_, forward, reverse) => {
      for (const sample of samples.slice(0, 5)) {
        const converted = forward(sample);
        const result = reverse(converted);
        expectColor(result, sample, 0);
        expect(result.alpha).toBeCloseTo(sample.alpha);
      }
    },
  );

  it("covers normalized conversion inputs and outputs", () => {
    const normalized = Color.rgb(0.2, 0.4, 0.6);
    normalized.normalized = true;
    for (const forward of [
      Color.RGBtoLAB,
      Color.RGBtoLCH,
      Color.RGBtoLUV,
      Color.RGBtoXYZ,
    ]) {
      const result = forward(normalized, true, true);
      expect(Array.from(result).every(Number.isFinite)).toBe(true);
    }
  });

  it("converts XYZ and LAB on both sides of their piecewise thresholds", () => {
    for (const xyz of [Color.xyz(0.1, 0.1, 0.1), Color.xyz(95, 100, 108)]) {
      const lab = Color.XYZtoLAB(xyz);
      expectColor(Color.LABtoXYZ(lab), xyz, 2);
    }
    const normalized = Color.xyz(0.2, 0.3, 0.4).normalize();
    expect(Color.XYZtoLAB(normalized, true, true).normalized).toBe(true);
    expect(
      Color.LABtoXYZ(Color.lab(0.5, 0.5, 0.5).normalize(), true, true)
        .normalized,
    ).toBe(true);
  });

  it("converts XYZ/LUV and LAB/LCH directly", () => {
    const xyz = Color.xyz(20, 30, 40, 0.5);
    const luv = Color.XYZtoLUV(xyz);
    expectColor(Color.LUVtoXYZ(luv), xyz, 2);

    const lab = Color.lab(60, 30, -40, 0.5);
    const lch = Color.LABtoLCH(lab);
    expect(lch.c).toBeCloseTo(50);
    expectColor(Color.LCHtoLAB(lch), lab, 3);

    const normalizedLab = Color.lab(0.5, 0.5, 0.5).normalize();
    expect(
      Array.from(Color.LABtoLCH(normalizedLab, true, true)).every(
        Number.isFinite,
      ),
    ).toBe(true);
    const normalizedLch = Color.lch(0.5, 0.5, 0.5).normalize();
    expect(
      Array.from(Color.LCHtoLAB(normalizedLch, true, true)).every(
        Number.isFinite,
      ),
    ).toBe(true);
  });
});
