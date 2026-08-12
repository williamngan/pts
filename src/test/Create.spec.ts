import { describe, expect, it, vi } from "vitest";
import { Create, Delaunay, Noise } from "../Create";
import { Num } from "../Num";
import { Bound, Group, Pt } from "../Pt";

function expectPt(
  actual: ArrayLike<number>,
  expected: number[],
  precision = 5,
) {
  expected.forEach((value, index) => {
    expect(actual[index]).toBeCloseTo(value, precision);
  });
}

class TestDelaunay extends Delaunay {
  static dedupe(edges: number[]) {
    return this._dedupe(edges);
  }

  superTriangle() {
    return this._superTriangle();
  }

  triangle(i: number, j: number, k: number) {
    return this._triangle(i, j, k);
  }

  circum(i: number, j: number, k: number) {
    return this._circum(i, j, k, false);
  }
}

describe("Create point distributions", () => {
  const bound = Bound.fromGroup(
    Group.fromArray([
      [10, 20, 30],
      [20, 40, 50],
    ]),
  );

  it("distributes deterministic random points in 1D, 2D, and 3D", () => {
    vi.spyOn(Num, "random").mockReturnValue(0.5);
    expectPt(Create.distributeRandom(bound, 1, 1)[0], [15]);
    expectPt(Create.distributeRandom(bound, 1, 2)[0], [15, 30]);
    expectPt(Create.distributeRandom(bound, 1, 3)[0], [15, 30, 40]);
    expect(Create.distributeRandom(bound, 0)).toEqual(new Group());
  });

  it("distributes line endpoints and evenly spaced interior points", () => {
    const points = Create.distributeLinear(
      Group.fromArray([
        [0, 0],
        [10, 20],
      ]),
      5,
    );
    expect(points).toHaveLength(5);
    points.forEach((point, index) => expectPt(point, [index * 2.5, index * 5]));
  });

  it("creates oriented grid points and rectangular cells", () => {
    const gridBound = Bound.fromGroup(
      Group.fromArray([
        [0, 0],
        [11, 7],
      ]),
    );
    const points = Create.gridPts(gridBound, 2, 3, [0, 0]);
    expect(points).toHaveLength(6);
    expectPt(points[0], [0, 0]);
    expectPt(points[5], [5, 4]);

    const centered = Create.gridPts(gridBound, 2, 3);
    expectPt(centered[0], [2.5, 1]);

    const cells = Create.gridCells(gridBound, 2, 3);
    expect(cells).toHaveLength(6);
    expectPt(cells[0][0], [0, 0]);
    expectPt(cells[0][1], [5, 2]);
    expectPt(cells[5][1], [10, 6]);

    expect(() => Create.gridPts(gridBound, 0, 1)).toThrow("cannot be 0");
    expect(() => Create.gridPts(gridBound, 1, 0)).toThrow("cannot be 0");
    expect(() => Create.gridCells(gridBound, 0, 1)).toThrow("cannot be 0");
    expect(() => Create.gridCells(gridBound, 1, 0)).toThrow("cannot be 0");
  });

  it("creates radial points with default and custom angle offsets", () => {
    const cardinal = Create.radialPts([10, 10], 5, 4);
    expectPt(cardinal[0], [10, 5]);
    expectPt(cardinal[1], [15, 10]);
    expectPt(Create.radialPts([0, 0], 2, 1, 0)[0], [2, 0]);
  });

  it("turns an iterable into seeded Noise points with grid coordinates", () => {
    vi.spyOn(Num, "random").mockReturnValue(0.25);
    const points = Create.noisePts(
      new Set([new Pt(1, 2), new Pt(3, 4), new Pt(5, 6), new Pt(7, 8)]),
      0.1,
      0.2,
      2,
      2,
    );
    expect(points).toHaveLength(4);
    expect(points.every((point) => point instanceof Noise)).toBe(true);
    expect(points.map((point: Noise) => point.noise2D())).toEqual([
      0, -0.007704000313133006, -0.1884160023498535, -0.1862594683443733,
    ]);

    const linear = Create.noisePts([new Pt(), new Pt()], 0.1, 0.2);
    expect(linear).toHaveLength(2);
  });
});

describe("Noise", () => {
  it("is deterministic for a seed and changes as its coordinates step", () => {
    const a = new Noise(9, 9).initNoise(0.25, 0.75).seed(0.25);
    const b = new Noise(9, 9).initNoise(0.25, 0.75).seed(0.25);
    expect(a.noise2D()).toBeCloseTo(b.noise2D());
    const before = a.noise2D();
    expect(a.step(0.1, 0.2)).toBe(a);
    expect(a.noise2D()).not.toBeCloseTo(before);

    const lowSeed = new Noise().seed(3);
    const highSeed = new Noise().seed(1000.9);
    expect(Number.isFinite(lowSeed.noise2D())).toBe(true);
    expect(Number.isFinite(highSeed.noise2D())).toBe(true);
    expect(Number.isFinite(new Noise().initNoise(-1, -1).noise2D())).toBe(true);
  });
});

describe("Delaunay", () => {
  const points = Group.fromArray([
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [5, 5],
  ]);

  it("builds triangles, cached mesh, neighbors, and Voronoi cells", () => {
    const delaunay = Create.delaunay(points);
    expect(delaunay).toBeInstanceOf(Delaunay);
    const triangles = delaunay.delaunay();
    expect(triangles).toHaveLength(4);
    expect(
      triangles.every((triangle) => (triangle as Group).length === 3),
    ).toBe(true);
    expect(delaunay.mesh()).toHaveLength(points.length);
    expect(delaunay.neighbors(4)).toHaveLength(4);
    expect(delaunay.neighborPts(4)).toHaveLength(4);
    expect(delaunay.neighborPts(4, true)).toHaveLength(4);
    expect(delaunay.voronoi()).toHaveLength(points.length);

    const shapes = delaunay.delaunay(false);
    expect(shapes).toHaveLength(4);
    expect(shapes[0]).toMatchObject({
      i: expect.any(Number),
      j: expect.any(Number),
      k: expect.any(Number),
    });
  });

  it("returns no triangles for fewer than three points", () => {
    expect(
      Create.delaunay(
        Group.fromArray([
          [0, 0],
          [1, 1],
        ]),
      ).delaunay(),
    ).toEqual([]);
  });

  it("covers protected geometric helpers through a test subclass", () => {
    const delaunay = TestDelaunay.from(points) as TestDelaunay;
    expect(delaunay.superTriangle()).toHaveLength(3);
    expect(delaunay.triangle(0, 1, 2)).toEqual(
      new Group(points[0], points[1], points[2]),
    );
    expect(delaunay.circum(0, 1, 2).circle).toHaveLength(2);
    expect(TestDelaunay.dedupe([0, 1, 1, 0, 1, 2])).toEqual([1, 2]);
  });
});
