import { describe, expect, it, vi } from "vitest";
import { Mat, Vec } from "../LinearAlgebra";
import { Group, Pt } from "../Pt";

function values(value: ArrayLike<number>) {
  return Array.from(value);
}

function matrix(value: ArrayLike<ArrayLike<number>>) {
  return Array.from(value, values);
}

describe("Vec", () => {
  it.each([
    ["add", Vec.add, 2, [3, 4, 5]],
    ["subtract", Vec.subtract, 2, [-1, 0, 1]],
    ["multiply", Vec.multiply, 2, [2, 4, 6]],
    ["divide", Vec.divide, 2, [0.5, 1, 1.5]],
  ])(
    "%s mutates and returns its scalar input vector",
    (_, operation, scalar, expected) => {
      const point = new Pt(1, 2, 3);
      expect(operation(point, scalar)).toBe(point);
      expect(values(point)).toEqual(expected);
    },
  );

  it("performs vector arithmetic and preserves trailing dimensions for add/subtract", () => {
    expect(values(Vec.add(new Pt(1, 2, 3), [4, 5]))).toEqual([5, 7, 3]);
    expect(values(Vec.subtract(new Pt(5, 7, 3), [4, 5]))).toEqual([1, 2, 3]);
    expect(values(Vec.multiply(new Pt(1, 2, 3), [4, 5, 6]))).toEqual([
      4, 10, 18,
    ]);
    expect(values(Vec.divide(new Pt(4, 10, 18), [4, 5, 6]))).toEqual([1, 2, 3]);
  });

  it("rejects invalid arithmetic dimensions and zero divisors", () => {
    expect(() => Vec.multiply([1, 2], [1])).toThrow("lengths don't match");
    expect(() => Vec.divide([1, 2], [1])).toThrow("lengths don't match");
    expect(() => Vec.divide([1, 2], 0)).toThrow("divide by zero");
    expect(() => Vec.dot([1], [1, 2])).toThrow("lengths don't match");
  });

  it("calculates products, magnitudes, and units", () => {
    expect(Vec.dot([5, 4, 3, 2], [1, 2, 3, 4])).toBe(30);
    expect(Vec.cross2D([2, 3], [4, 5])).toBe(-2);
    expect(values(Vec.cross([3, -3, 1], [4, 9, 2]))).toEqual([-15, -2, 39]);
    expect(Vec.magnitude([3, 4])).toBe(5);
    const unit = Vec.unit(new Pt(3, 4), 5);
    expect(unit[0]).toBeCloseTo(0.6);
    expect(unit[1]).toBeCloseTo(0.8);
    expect(values(Vec.unit(new Pt(0, 0)))).toEqual([0, 0]);
  });

  it("maps numeric transforms and reductions", () => {
    expect(values(Vec.abs(new Pt(-1, 2, -3)))).toEqual([1, 2, 3]);
    expect(values(Vec.floor(new Pt(1.9, -1.1)))).toEqual([1, -2]);
    expect(values(Vec.ceil(new Pt(1.1, -1.9)))).toEqual([2, -1]);
    expect(values(Vec.round(new Pt(1.4, 1.6)))).toEqual([1, 2]);
    expect(Vec.max([5, 7, -1, 3, 7])).toEqual({ value: 7, index: 4 });
    expect(Vec.min([5, 7, -1, 3, -1])).toEqual({ value: -1, index: 4 });
    expect(Vec.sum([5, 7, -1])).toBe(11);
    const point = new Pt(2, 3, 4);
    expect(Vec.map(point, (value, index) => value * index)).toBe(point);
    expect(values(point)).toEqual([0, 3, 8]);
  });
});

describe("Mat arithmetic", () => {
  const left = Group.fromArray([
    [1, 2, 3],
    [4, 5, 6],
  ]);

  it("adds scalar and matrix operands", () => {
    expect(matrix(Mat.add(left, 2))).toEqual([
      [3, 4, 5],
      [6, 7, 8],
    ]);
    expect(
      matrix(
        Mat.add(left, [
          [6, 5, 4],
          [3, 2, 1],
        ]),
      ),
    ).toEqual([
      [7, 7, 7],
      [7, 7, 7],
    ]);
    expect(() =>
      Mat.add(left, [
        [1, 2],
        [3, 4],
      ]),
    ).toThrow("size don't match");
    expect(() => Mat.add(left, [[1, 2, 3]])).toThrow("size don't match");
  });

  it("multiplies scalar, element-wise, regular, and transposed operands", () => {
    expect(matrix(Mat.multiply(left, 2))).toEqual([
      [2, 4, 6],
      [8, 10, 12],
    ]);
    expect(
      matrix(
        Mat.multiply(
          left,
          [
            [2, 2, 2],
            [3, 3, 3],
          ],
          false,
          true,
        ),
      ),
    ).toEqual([
      [2, 4, 6],
      [12, 15, 18],
    ]);
    expect(
      matrix(
        Mat.multiply(left, [
          [1, 2],
          [3, 4],
          [5, 6],
        ]),
      ),
    ).toEqual([
      [22, 28],
      [49, 64],
    ]);
    expect(
      matrix(
        Mat.multiply(
          left,
          [
            [1, 3, 5],
            [2, 4, 6],
          ],
          true,
        ),
      ),
    ).toEqual([
      [22, 28],
      [49, 64],
    ]);
  });

  it("rejects incompatible multiplication shapes", () => {
    expect(() => Mat.multiply(left, [[1], [2]], false, true)).toThrow(
      "lengths don't match",
    );
    expect(() =>
      Mat.multiply(left, [
        [1, 2],
        [3, 4],
      ]),
    ).toThrow("rows in matrix-a");
    expect(() =>
      Mat.multiply(
        left,
        [
          [1, 2],
          [3, 4],
        ],
        true,
      ),
    ).toThrow("transposed");
  });

  it("zips ragged matrices with explicit fallback policies", () => {
    const ragged = [[1, 2], [3], [4, 5, 6]];
    expect(values(Mat.zipSlice(ragged, 0))).toEqual([1, 3, 4]);
    expect(() => Mat.zipSlice(ragged, 1)).toThrow("out of bounds");
    expect(values(Mat.zipSlice(ragged, 1, -1))).toEqual([2, -1, 5]);
    expect(matrix(Mat.zip(ragged, -1, true))).toEqual([
      [1, 3, 4],
      [2, -1, 5],
      [-1, -1, 6],
    ]);
    expect(
      matrix(
        Mat.transpose([
          [1, 2],
          [3, 4],
        ]),
      ),
    ).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });
});

describe("Mat 2D transformations", () => {
  it("constructs and applies primitive matrices", () => {
    expect(values(Mat.transform2D([2, 3], Mat.scale2DMatrix(4, 5)))).toEqual([
      8, 15,
    ]);
    expect(
      values(Mat.transform2D([2, 3], Mat.translate2DMatrix(4, 5))),
    ).toEqual([6, 8]);
    expect(values(Mat.transform2D([1, 0], Mat.rotate2DMatrix(0, 1)))).toEqual([
      0, 1,
    ]);
    expect(values(Mat.transform2D([2, 3], Mat.shear2DMatrix(2, 3)))).toEqual([
      11, 7,
    ]);
    expect(Mat.toDOMMatrix(Mat.translate2DMatrix(4, 5))).toEqual([
      1, 0, 0, 1, 4, 5,
    ]);
  });

  it("constructs scale, rotate, and shear matrices around anchors", () => {
    expect(
      values(Mat.transform2D([2, 2], Mat.scaleAt2DMatrix(2, 3, [1, 1]))),
    ).toEqual([3, 4]);
    expect(
      values(Mat.transform2D([2, 1], Mat.rotateAt2DMatrix(0, 1, [1, 1]))),
    ).toEqual([1, 2]);
    expect(
      values(Mat.transform2D([2, 2], Mat.shearAt2DMatrix(1, 2, [1, 1]))),
    ).toEqual([4, 3]);
  });

  it("chains transformations, exposes a DOMMatrix, and resets", () => {
    class FakeDOMMatrix {
      constructor(public values: number[]) {}
    }
    vi.stubGlobal("DOMMatrix", FakeDOMMatrix);
    const transform = new Mat();
    expect(transform.scale2D([2, 3], [1, 1])).toBe(transform);
    expect(transform.rotate2D(Math.PI / 2)).toBe(transform);
    expect(transform.translate2D([5, 6])).toBe(transform);
    expect(transform.shear2D([0.1, 0.2], [1, 2])).toBe(transform);
    expect(transform.value).toHaveLength(3);
    expect(
      (transform.domMatrix as unknown as FakeDOMMatrix).values,
    ).toHaveLength(6);
    expect(transform.reset()).toBeUndefined();
    expect(matrix(transform.value)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it("reflects across vertical, horizontal, and sloped lines", () => {
    const vertical = Mat.reflectAt2DMatrix([2, 0], [2, 5]);
    expect(values(Mat.transform2D([5, 3], vertical))).toEqual([-1, 3]);
    const horizontal = Mat.reflectAt2DMatrix([0, 2], [5, 2]);
    expect(values(Mat.transform2D([3, 5], horizontal))).toEqual([3, -1]);
    const diagonal = Mat.reflectAt2DMatrix([0, 0], [2, 2]);
    expect(values(Mat.transform2D([3, 1], diagonal))).toEqual([1, 3]);
  });
});

describe("Vec and Mat correctness pins", () => {
  it("finds max/min of all-negative vectors", () => {
    expect(Vec.max([-5, -2])).toEqual({ value: -2, index: 1 });
    expect(Vec.min([-5, -2])).toEqual({ value: -5, index: 0 });
    expect(new Pt(-5, -2).maxValue()).toEqual({ value: -2, index: 1 });
    // ties keep returning the last occurrence
    expect(Vec.max([7, 5, 7])).toEqual({ value: 7, index: 2 });
  });

  it("returns the input vector from Vec.unit on a zero vector", () => {
    const zero = new Pt(0, 0);
    const u = Vec.unit(zero);
    expect(u).toBe(zero);
    expect(values(u)).toEqual([0, 0]);
  });

  it("treats explicit zeros as values in chained scale2D and shear2D", () => {
    const sheared = new Mat().shear2D([0.5, 0]);
    expect(sheared.value[0][1]).toBeCloseTo(Math.tan(0.5));
    expect(sheared.value[1][0]).toBe(0); // no y-shear was requested
    const scaled = new Mat().scale2D([0, 2]);
    expect(scaled.value[0][0]).toBe(0);
    expect(scaled.value[1][1]).toBe(2);
  });

  it("keeps zero values when zipping with a default", () => {
    expect(
      values(
        Mat.zipSlice(
          [
            [0, 1],
            [2, 3],
          ],
          0,
          99,
        ),
      ),
    ).toEqual([0, 2]);
    expect(matrix(Mat.zip([[0, 2], [3]], 99))).toEqual([
      [0, 3],
      [2, 99],
    ]);
    expect(() => Mat.zipSlice([[1]], 5)).toThrow(Error);
  });
});
