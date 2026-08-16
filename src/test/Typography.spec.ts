import { describe, expect, it } from "vitest";
import { Group } from "../Pt";
import { Typography } from "../Typography";

describe("Typography", () => {
  it("builds a weighted text-width estimator", () => {
    const estimate = Typography.textWidthEstimator(
      (sample) => ({ M: 10, n: 5, ".": 2 })[sample],
    );
    expect(estimate("abcd")).toBeCloseTo(19.52);

    const custom = Typography.textWidthEstimator(
      (sample) => sample.length * 2,
      ["xx"],
      [1],
    );
    expect(custom("abc")).toBe(12);
  });

  it("truncates overflowing text with or without a tail", () => {
    const width = (text: string) => text.length * 10;
    expect(Typography.truncate(width, "abcdefghij", 55)).toEqual(["abcde", 5]);
    expect(Typography.truncate(width, "abcdefghij", 55, "...")).toEqual([
      "ab...",
      2,
    ]);
    expect(Typography.truncate(width, "short", 100)).toEqual(["short", 5]);
    expect(Typography.truncate(width, "abc", 0, "....")).toEqual(["....", 0]);
  });

  it("scales font size from box height or width", () => {
    const heightScale = Typography.fontSizeToBox(
      Group.fromArray([
        [0, 0],
        [100, 50],
      ]),
      0.2,
    );
    expect(
      heightScale(
        Group.fromArray([
          [0, 0],
          [200, 100],
        ]),
      ),
    ).toBe(20);

    const widthScale = Typography.fontSizeToBox(
      Group.fromArray([
        [0, 0],
        [100, 50],
      ]),
      0.1,
      false,
    );
    expect(
      widthScale(
        Group.fromArray([
          [0, 0],
          [50, 50],
        ]),
      ),
    ).toBe(5);
  });

  it("applies unrestricted, upper-bound, and lower-bound thresholds", () => {
    expect(Typography.fontSizeToThreshold(100)(20, 50)).toBe(10);
    expect(Typography.fontSizeToThreshold(100, -1)(20, 200)).toBe(20);
    expect(Typography.fontSizeToThreshold(100, 1)(20, 50)).toBe(20);
  });

  // ------------------------------------------------------------------
  // Characterization tests: these pin down the current edge-case behavior,
  // including known limitations, so that any future change to it is a
  // deliberate, visible test update rather than a silent regression.

  it("throws at build time when samples and distribution lengths differ", () => {
    expect(() =>
      Typography.textWidthEstimator(
        (sample: string) => sample.length,
        ["M", "n"],
      ),
    ).toThrow("Array lengths don't match");
  });

  it("can overflow the width budget when glyph widths are non-uniform", () => {
    const measure = (text: string) => {
      let w = 0;
      for (const ch of text) w += ch === "W" ? 20 : 2;
      return w;
    };
    // The proportional guess assumes every character has the average width:
    // "WWWWWiiiiiiiiii" measures 120, so a budget of 60 keeps 7 characters,
    // but those 7 ("WWWWWii") measure 104 — the result does not fit.
    const [text, count] = Typography.truncate(measure, "WWWWWiiiiiiiiii", 60);
    expect(text).toBe("WWWWWii");
    expect(count).toBe(7);
    expect(measure(text)).toBeGreaterThan(60);
  });

  it("splits surrogate pairs when truncating astral characters", () => {
    const width = (text: string) => text.length * 10;
    // "😀" is two UTF-16 code units; trimming at 3 units cuts the second
    // emoji in half, leaving a lone high surrogate at the end.
    const [text, count] = Typography.truncate(width, "😀😀😀", 30);
    expect(count).toBe(3);
    expect(text).toBe("😀\ud83d");
  });

  it("scales by the new box alone — the initial box cancels out", () => {
    const target = Group.fromArray([
      [0, 0],
      [80, 60],
    ]);
    const fromSmall = Typography.fontSizeToBox(
      Group.fromArray([
        [0, 0],
        [10, 10],
      ]),
      0.5,
    );
    const fromLarge = Typography.fontSizeToBox(
      Group.fromArray([
        [0, 0],
        [500, 400],
      ]),
      0.5,
    );
    expect(fromSmall(target)).toBeCloseTo(30);
    expect(fromLarge(target)).toBeCloseTo(30);
  });

  it("returns NaN when the initial box has no height", () => {
    const scale = Typography.fontSizeToBox(
      Group.fromArray([
        [0, 0],
        [100, 0],
      ]),
      1,
    );
    expect(
      scale(
        Group.fromArray([
          [0, 0],
          [100, 50],
        ]),
      ),
    ).toBeNaN();
  });

  it("returns non-finite sizes when the threshold is zero", () => {
    expect(Typography.fontSizeToThreshold(0)(16, 2)).toBe(Infinity);
    expect(Typography.fontSizeToThreshold(0)(16, 0)).toBeNaN();
  });
});
