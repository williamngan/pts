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

  it("throws at build time when samples and distribution lengths differ", () => {
    expect(() =>
      Typography.textWidthEstimator(
        (sample: string) => sample.length,
        ["M", "n"],
      ),
    ).toThrow("must have the same length");
  });

  it("truncates overflowing text with or without a tail", () => {
    const width = (text: string) => text.length * 10;
    expect(Typography.truncate(width, "abcdefghij", 55)).toEqual(["abcde", 5]);
    expect(Typography.truncate(width, "abcdefghij", 55, "...")).toEqual([
      "ab...",
      2,
    ]);
    expect(Typography.truncate(width, "short", 100)).toEqual(["short", 5]);
    expect(Typography.truncate(width, "abcdefghij", 100)).toEqual([
      "abcdefghij",
      10,
    ]);
  });

  it("keeps only the tail when only the tail fits", () => {
    const width = (text: string) => text.length * 10;
    expect(Typography.truncate(width, "abcdef", 35, "...")).toEqual(["...", 0]);
  });

  it("returns an empty result when not even the tail fits", () => {
    const width = (text: string) => text.length * 10;
    expect(Typography.truncate(width, "abc", 0, "....")).toEqual(["", 0]);
    expect(Typography.truncate(width, "abc", 15, "....")).toEqual(["", 0]);
    expect(Typography.truncate(width, "abc", 5)).toEqual(["", 0]);
  });

  it("fits the width budget even when glyph widths are non-uniform", () => {
    const measure = (text: string) => {
      let w = 0;
      for (const ch of text) w += ch === "W" ? 20 : 2;
      return w;
    };
    // A proportional guess by average width would keep 7 characters here
    // ("WWWWWii", measuring 104); the search must settle on a fitting prefix.
    const [text, count] = Typography.truncate(measure, "WWWWWiiiiiiiiii", 60);
    expect(text).toBe("WWW");
    expect(count).toBe(3);
    expect(measure(text)).toBeLessThanOrEqual(60);
  });

  it("extends the cut when the proportional guess undershoots", () => {
    const measure = (text: string) => {
      let w = 0;
      for (const ch of text) w += ch === "W" ? 20 : 2;
      return w;
    };
    // Narrow characters first: the average-width guess lands short and the
    // search must walk forward to the true boundary.
    const [text, count] = Typography.truncate(measure, "iiiiiiiiiiWWWWW", 60);
    expect(text).toBe("iiiiiiiiiiWW");
    expect(count).toBe(12);
    expect(measure(text)).toBeLessThanOrEqual(60);
  });

  it("does not split surrogate pairs when truncating", () => {
    const width = (text: string) => text.length * 10;
    // "😀" is two UTF-16 code units; a cut at 3 units would leave a lone
    // high surrogate, so the cut retreats to the pair boundary.
    expect(Typography.truncate(width, "😀😀😀", 30)).toEqual(["😀", 2]);
  });

  it("measures each distinct character once with charWidthCache", () => {
    const calls: string[] = [];
    const cached = Typography.charWidthCache((text) => {
      calls.push(text);
      return text.length * 3;
    });
    expect(cached("aabba")).toBe(15);
    expect(calls).toEqual(["a", "b"]);
    expect(cached("😀😀")).toBe(12); // astral characters measured whole
    expect(calls).toEqual(["a", "b", "😀"]);
  });

  it("scales font size by the target box's height or width", () => {
    const byHeight = Typography.fontSizeToBox(0.2);
    expect(
      byHeight(
        Group.fromArray([
          [0, 0],
          [200, 100],
        ]),
      ),
    ).toBe(20);

    const byWidth = Typography.fontSizeToBox(0.1, false);
    expect(
      byWidth(
        Group.fromArray([
          [0, 0],
          [50, 50],
        ]),
      ),
    ).toBe(5);

    // a degenerate box yields 0, not NaN
    expect(
      byHeight(
        Group.fromArray([
          [0, 0],
          [100, 0],
        ]),
      ),
    ).toBe(0);
  });

  it("accepts the deprecated (box, ratio, byHeight) form with identical results", () => {
    const initial = Group.fromArray([
      [0, 0],
      [100, 50],
    ]);
    const target = Group.fromArray([
      [0, 0],
      [200, 100],
    ]);
    expect(Typography.fontSizeToBox(initial, 0.2)(target)).toBe(
      Typography.fontSizeToBox(0.2)(target),
    );
    expect(
      Typography.fontSizeToBox(
        initial,
        0.1,
        false,
      )(
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

  it("rejects a zero threshold at build time", () => {
    expect(() => Typography.fontSizeToThreshold(0)).toThrow(
      "threshold cannot be 0",
    );
  });
});
