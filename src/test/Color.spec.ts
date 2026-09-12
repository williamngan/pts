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
  it("converts HSL before formatting the documented rendering example", () => {
    const color = Color.hsl(268, 0.37, 0.51);
    const original = Array.from(color);
    const rgb = Color.HSLtoRGB(color);
    expect(rgb.rgb).toBe("rgb(126,83,176)");
    expect(rgb.hex).toBe("#7e53b0");
    expect(rgb.rgba).toBe("rgba(126,83,176,1)");
    expect(color.mode).toBe("hsl");
    expect(Array.from(color)).toEqual(original);
  });

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
      oklab: Color.oklab,
      oklch: Color.oklch,
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
    ["33669980", [51, 102, 153, 128 / 255]],
    ["#f008", [255, 0, 0, 136 / 255]],
  ])("parses hexadecimal color %s", (hex, expected) => {
    expectColor(Color.fromHex(hex), expected, 3);
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
    const raw = Color.rgb(51, 102, 153);
    for (const forward of [
      Color.RGBtoLAB,
      Color.RGBtoLCH,
      Color.RGBtoLUV,
      Color.RGBtoXYZ,
    ]) {
      const result = forward(normalized, true, true);
      expect(result.normalized).toBe(true);
      expectColor(result, forward(raw, false, true), 3);
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

describe("Color-space reference values", () => {
  // Independently computed via CIE 15 / IEC 61966-2-1 (sRGB, D65, 2° observer)
  const references: [string, number[], Record<string, number[]>][] = [
    [
      "red",
      [255, 0, 0],
      {
        xyz: [41.2456, 21.2673, 1.9334],
        lab: [53.2408, 80.0925, 67.2032],
        lch: [53.2408, 104.5518, 39.999],
        luv: [53.2408, 175.015, 37.7564],
      },
    ],
    [
      "blue",
      [0, 0, 255],
      {
        xyz: [18.0437, 7.2175, 95.0304],
        lab: [32.297, 79.1875, -107.8602],
        lch: [32.297, 133.8076, 306.2849],
        luv: [32.297, -9.4054, -130.3423],
      },
    ],
    [
      "teal",
      [64, 156, 180],
      {
        xyz: [22.2377, 28.1599, 47.4346],
        lab: [60.0329, -19.6313, -20.5237],
        lch: [60.0329, 28.4008, 226.2732],
        luv: [60.0329, -36.1258, -28.5162],
      },
    ],
    [
      "white",
      [255, 255, 255],
      {
        xyz: [95.047, 100, 108.883],
        lab: [100, 0, 0],
        luv: [100, 0, 0],
      },
    ],
  ];

  const forwards = {
    xyz: Color.RGBtoXYZ,
    lab: Color.RGBtoLAB,
    lch: Color.RGBtoLCH,
    luv: Color.RGBtoLUV,
  };

  it.each(references)("matches CIE values for %s", (_, rgb, expected) => {
    for (const mode in expected) {
      const result = forwards[mode as keyof typeof forwards](Color.rgb(rgb));
      expectColor(result, [...expected[mode], 1], 2);
    }
  });

  // Anchor values published in Ottosson's OKLAB reference (CSS Color 4)
  it.each([
    ["white", [255, 255, 255], [1, 0, 0]],
    ["red", [255, 0, 0], [0.62796, 0.22486, 0.12585]],
    ["green", [0, 255, 0], [0.86644, -0.23389, 0.1795]],
    ["blue", [0, 0, 255], [0.45201, -0.03246, -0.31153]],
  ])("matches OKLAB reference values for %s", (_, rgb, expected) => {
    const oklab = Color.RGBtoOKLAB(Color.rgb(rgb));
    expectColor(oklab, [...expected, 1], 3);
    expectColor(Color.OKLABtoRGB(oklab), [...rgb, 1], 0);

    const oklch = Color.RGBtoOKLCH(Color.rgb(rgb));
    expect(oklch[0]).toBeCloseTo(expected[0], 3);
    expect(oklch[1]).toBeCloseTo(Math.hypot(expected[1], expected[2]), 3);
    expectColor(Color.OKLCHtoRGB(oklch), [...rgb, 1], 0);
  });

  it("exposes l/c/h accessors for oklch", () => {
    const oklch = Color.RGBtoOKLCH(Color.rgb(64, 156, 180));
    expect(oklch.mode).toBe("oklch");
    expect(oklch.l).toBe(oklch[0]);
    expect(oklch.c).toBe(oklch[1]);
    expect(oklch.h).toBe(oklch[2]);
    const viaLab = Color.OKLABtoOKLCH(
      Color.RGBtoOKLAB(Color.rgb(64, 156, 180)),
    );
    expectColor(oklch, viaLab, 3);
  });

  it("converts black without NaN in every space", () => {
    const black = Color.rgb(0, 0, 0);
    for (const mode in forwards) {
      const converted = forwards[mode as keyof typeof forwards](black);
      expectColor([converted[0], converted[1], converted[2]], [0, 0, 0], 3);
    }
    expectColor(Color.LUVtoRGB(Color.luv(0, 0, 0)), [0, 0, 0, 1]);
    expectColor(Color.LUVtoXYZ(Color.luv(0, 0, 0)), [0, 0, 0, 1]);
  });
});

describe("Color conversion flags", () => {
  const conversionNames = Object.getOwnPropertyNames(Color)
    .filter(
      (key) =>
        typeof (Color as any)[key] === "function" &&
        /^[A-Z]+to[A-Z]+$/.test(key),
    )
    .sort();

  const sourceFor = (mode: string): Color => {
    const rgb = Color.rgb(64, 156, 180, 0.75);
    if (mode === "rgb") return rgb;
    return (Color as any)[`RGBto${mode.toUpperCase()}`](rgb);
  };

  it.each(conversionNames)(
    "%s normalizedOutput maps the plain result through Color.ranges",
    (name) => {
      const source = sourceFor(name.split("to")[0].toLowerCase());
      const plain: Color = (Color as any)[name](source.clone());
      const normalized: Color = (Color as any)[name](
        source.clone(),
        false,
        true,
      );
      expect(normalized.normalized).toBe(true);
      expectColor(normalized, plain.clone().normalize(), 2);
    },
  );

  it.each(conversionNames)(
    "%s normalizedInput accepts flagged and unflagged 0...1 values",
    (name) => {
      const source = sourceFor(name.split("to")[0].toLowerCase());
      const expected: Color = (Color as any)[name](source.clone());

      const flagged = source.$normalize();
      expectColor((Color as any)[name](flagged, true), expected, 2);

      // The flag argument is authoritative even when the color was
      // constructed directly from 0...1 values and never flagged.
      const unflagged = (Color as any)[source.mode](
        flagged[0],
        flagged[1],
        flagged[2],
        source.alpha,
      );
      expectColor((Color as any)[name](unflagged, true), expected, 2);
    },
  );

  it("keeps hue consistent between normalized and plain HSL/HSB", () => {
    const rgb = Color.rgb(64, 156, 180);
    expect(Color.RGBtoHSL(rgb, false, true)[0]).toBeCloseTo(
      Color.RGBtoHSL(rgb)[0] / 360,
      3,
    );
    expect(Color.RGBtoHSB(rgb, false, true)[0]).toBeCloseTo(
      Color.RGBtoHSB(rgb)[0] / 360,
      3,
    );
  });

  it("honors normalizedOutput for achromatic HSL colors", () => {
    expectColor(
      Color.HSLtoRGB(Color.hsl(0, 0, 0.5), false, true),
      [0.5, 0.5, 0.5, 1],
    );
  });

  it("wraps out-of-range hues in HSB", () => {
    expectColor(
      Color.HSBtoRGB(Color.hsb(-60, 1, 1)),
      Color.HSBtoRGB(Color.hsb(300, 1, 1)),
    );
    expectColor(
      Color.HSBtoRGB(Color.hsb(420, 1, 1)),
      Color.HSBtoRGB(Color.hsb(60, 1, 1)),
    );
  });

  it("preserves the normalized flag through clone and toMode conversion", () => {
    const norm = Color.rgb(255, 0, 0).normalize();
    expect(norm.clone().normalized).toBe(true);

    norm.toMode("lab", true);
    expect(norm.normalized).toBe(true);
    expectColor(
      norm,
      [53.2408 / 100, (80.0925 + 128) / 255, (67.2032 + 128) / 255, 1],
      2,
    );

    norm.toMode("rgb", true);
    expectColor(norm, [1, 0, 0, 1], 2);
  });

  it("treats same-mode conversion as a no-op", () => {
    const rgb = Color.rgb(10, 20, 30);
    expect(rgb.toMode("rgb", true)).toBe(rgb);
    expectColor(rgb, [10, 20, 30, 1]);
  });

  it("renders CSS strings from normalized colors", () => {
    const norm = Color.rgb(255, 0, 128).normalize();
    expect(norm.hex).toBe("#ff0080");
    expect(norm.rgb).toBe("rgb(255,0,128)");
    expect(norm.rgba).toBe("rgba(255,0,128,1)");
    // the "mode" format keeps raw (normalized) values
    expect(norm.toString()).toContain("rgb(1,0,");
    // formatting must not mutate the color
    expect(norm.normalized).toBe(true);
    expectColor(norm, [1, 0, 128 / 255, 1], 3);
  });

  it("wraps out-of-range hues in HSL", () => {
    expectColor(
      Color.HSLtoRGB(Color.hsl(-300, 1, 0.5)),
      Color.HSLtoRGB(Color.hsl(60, 1, 0.5)),
    );
    expectColor(
      Color.HSLtoRGB(Color.hsl(780, 1, 0.5)),
      Color.HSLtoRGB(Color.hsl(60, 1, 0.5)),
    );
  });
});
