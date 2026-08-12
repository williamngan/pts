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
});
