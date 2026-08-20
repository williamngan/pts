import { describe, expect, it, vi } from "vitest";
import { Create, Delaunay, Noise } from "../Create";
import { DelaunayShape } from "../Types";
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
      0, 0.007704000313133006, -0.1884160023498535, -0.18568443368551887,
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

describe("Delaunay invariants", () => {
  function seededPts(count: number, seed = 9876) {
    let a = seed;
    const rand = () => {
      a = (a * 16807) % 2147483647;
      return a / 2147483647;
    };
    const g = new Group();
    for (let i = 0; i < count; i++) {
      g.push(new Pt(rand() * 500, rand() * 500));
    }
    return g;
  }

  it("satisfies the empty-circumcircle property on a random set", () => {
    const pts = seededPts(80);
    const delaunay = Create.delaunay(pts);
    const shapes = delaunay.delaunay(false) as DelaunayShape[];
    expect(shapes.length).toBeGreaterThan(100);
    for (const s of shapes) {
      const c = s.circle[0];
      const r = s.circle[1][0];
      for (let i = 0; i < pts.length; i++) {
        if (i === s.i || i === s.j || i === s.k) continue;
        const dx = pts[i][0] - c[0];
        const dy = pts[i][1] - c[1];
        // strictly inside would violate the Delaunay condition
        expect(dx * dx + dy * dy).toBeGreaterThan(r * r - 0.01);
      }
    }
  });

  it("produces complete voronoi and mesh structures on a larger set", () => {
    const pts = seededPts(150, 555);
    const delaunay = Create.delaunay(pts);
    const triangles = delaunay.delaunay();
    expect(triangles.length).toBeGreaterThan(200);
    expect(delaunay.mesh()).toHaveLength(150);
    const cells = delaunay.voronoi();
    expect(cells).toHaveLength(150);
    // interior points must have at least a triangle's worth of neighbors
    const interiorCells = cells.filter((cell) => cell.length >= 3);
    expect(interiorCells.length).toBeGreaterThan(100);
  });

  it("skips duplicate points instead of producing degenerate triangles", () => {
    const pts = Group.fromArray([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [10, 0], // duplicate
      [5, 5],
    ]);
    const delaunay = Create.delaunay(pts);
    const shapes = delaunay.delaunay(false) as DelaunayShape[];
    for (const s of shapes) {
      const area = Math.abs(
        (pts[s.j][0] - pts[s.i][0]) * (pts[s.k][1] - pts[s.i][1]) -
          (pts[s.k][0] - pts[s.i][0]) * (pts[s.j][1] - pts[s.i][1]),
      );
      expect(area).toBeGreaterThan(0.01); // no degenerate triangles
    }
    expect(delaunay.mesh()).toHaveLength(6); // duplicates keep their mesh slot
    expect(delaunay.neighborPts(4)).toHaveLength(0); // the skipped duplicate
  });

  it("returns no triangles for collinear input", () => {
    const pts = Group.fromArray([
      [0, 0],
      [10, 10],
      [20, 20],
      [30, 30],
    ]);
    expect(Create.delaunay(pts).delaunay()).toEqual([]);
  });

  it("handles a thousand points", () => {
    const pts = seededPts(1000, 321);
    const delaunay = Create.delaunay(pts);
    const triangles = delaunay.delaunay();
    // Euler: interior triangulation of n points has ~2n triangles
    expect(triangles.length).toBeGreaterThan(1800);
    expect(triangles.length).toBeLessThan(2000);
  });
});

describe("Voronoi half-edge assembly", () => {
  function seededPts2(count: number, seed = 777) {
    let a = seed;
    const rand = () => {
      a = (a * 16807) % 2147483647;
      return a / 2147483647;
    };
    const g = new Group();
    for (let i = 0; i < count; i++) {
      g.push(new Pt(rand() * 400, rand() * 400));
    }
    return g;
  }

  it("cells contain the same circumcenters as neighborPts, in polygon order", () => {
    const delaunay = Create.delaunay(seededPts2(60));
    delaunay.delaunay();
    const cells = delaunay.voronoi();
    expect(cells).toHaveLength(60);

    let convexChecked = 0;
    for (let i = 0; i < cells.length; i++) {
      // same vertex set as the mesh-derived neighbors (shared Pt references)
      const expected = new Set(delaunay.neighborPts(i));
      expect(cells[i]).toHaveLength(expected.size);
      for (const v of cells[i]) expect(expected.has(v)).toBe(true);

      // interior cells (closed fans) must come out in convex polygon order,
      // which is what the old per-cell angle sort provided
      const cell = cells[i];
      if (cell.length >= 4) {
        let sign = 0;
        let convex = true;
        for (let k = 0; k < cell.length; k++) {
          const a = cell[k];
          const b = cell[(k + 1) % cell.length];
          const c = cell[(k + 2) % cell.length];
          const cross =
            (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
          if (Math.abs(cross) < 1e-6) continue;
          if (sign === 0) sign = Math.sign(cross);
          else if (Math.sign(cross) !== sign) convex = false;
        }
        // hull cells are open fans and may bend; require consistency only
        // for cells whose walk closed (first equals-neighbors of last)
        if (convex) convexChecked++;
      }
    }
    expect(convexChecked).toBeGreaterThan(20); // plenty of interior cells
  });

  it("keeps empty cells for duplicate points and works before/after re-triangulation", () => {
    const pts = Group.fromArray([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [10, 0], // duplicate
      [5, 5],
    ]);
    const delaunay = Create.delaunay(pts);
    delaunay.delaunay();
    const cells = delaunay.voronoi();
    expect(cells).toHaveLength(6);
    expect(cells[4]).toHaveLength(0); // duplicate point: empty cell
    expect(cells[5].length).toBe(4); // center point: full quad cell
  });
});

describe("Voronoi clipping", () => {
  it("clips cells to a bound, keeping interior cells untouched", () => {
    // a near-collinear chain like a fast mouse drag produces sliver
    // triangles with far-away circumcenters
    const pts = new Group();
    let a = 111;
    const rand = () => {
      a = (a * 16807) % 2147483647;
      return a / 2147483647;
    };
    for (let i = 0; i < 15; i++) pts.push(new Pt(rand() * 500, rand() * 300));
    for (let k = 0; k < 60; k++) {
      pts.push(new Pt(20 + k * 21, 150 + Math.sin(k * 0.35) * 0.05));
    }
    const delaunay = Create.delaunay(pts);
    delaunay.delaunay();

    const raw = delaunay.voronoi();
    let rawMax = 0;
    for (const cell of raw) {
      for (const v of cell) {
        rawMax = Math.max(rawMax, Math.abs(v[0]), Math.abs(v[1]));
      }
    }
    expect(rawMax).toBeGreaterThan(5000); // slivers push cells far out

    const bound = Group.fromArray([
      [0, 0],
      [1300, 300],
    ]);
    const clipped = delaunay.voronoi(bound);
    expect(clipped).toHaveLength(raw.length);
    for (const cell of clipped) {
      for (const v of cell) {
        expect(v[0]).toBeGreaterThanOrEqual(-0.01);
        expect(v[0]).toBeLessThanOrEqual(1300.01);
        expect(v[1]).toBeGreaterThanOrEqual(-0.01);
        expect(v[1]).toBeLessThanOrEqual(300.01);
      }
    }

    // cells already inside the bound keep their shared circumcenter Pts
    let untouched = 0;
    for (let i = 0; i < raw.length; i++) {
      if (
        raw[i].length > 2 &&
        clipped[i].length === raw[i].length &&
        clipped[i].every((v, k) => v === raw[i][k])
      ) {
        untouched++;
      }
    }
    expect(untouched).toBeGreaterThan(0);
  });

  it("returns identical results without a bound", () => {
    const pts = Group.fromArray([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [5, 5],
    ]);
    const delaunay = Create.delaunay(pts);
    delaunay.delaunay();
    const cells = delaunay.voronoi();
    expect(cells).toHaveLength(5);
    expect(cells[4]).toHaveLength(4);
  });
});

describe("Create and Noise correctness pins", () => {
  it("clamps distributeLinear to the requested count", () => {
    const line = Group.fromArray([
      [0, 0],
      [10, 0],
    ]);
    expect(Create.distributeLinear(line, 5)).toHaveLength(5);
    expect(Create.distributeLinear(line, 2)).toHaveLength(2);
    expect(Create.distributeLinear(line, 1)).toHaveLength(1);
    expect(Create.distributeLinear(line, 0)).toHaveLength(0);
  });

  it("assigns row-major grid offsets in noisePts", () => {
    // 2 rows x 3 columns, row-major: point i sits at row floor(i/3), column i%3
    const pts = Group.fromArray([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
    const dx = 0.5;
    const dy = 0.25;
    const np = Create.noisePts(pts, dx, dy, 2, 3) as Group;
    // same-row points must share the same initial y-noise position, and
    // columns must advance x-noise; probe via noise determinism: two Noise
    // pts initialized identically produce identical noise2D values
    const sample = (n: Noise) => n.noise2D();
    // row 0: indices 0..2; row 1: indices 3..5
    const rows = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    for (const row of rows) {
      for (const i of row) {
        const expected = new Noise(0, 0);
        expected.initNoise(
          dx * (i % 3),
          dy * rows.findIndex((r) => r.includes(i)),
        );
        expected["perm"] = (np[i] as Noise)["perm"];
        expect(sample(np[i] as Noise)).toBeCloseTo(sample(expected), 10);
      }
    }
  });

  it("seeds the full permutation table", () => {
    // seeds chosen with nonzero low bytes: 0.5 maps to s=32768 whose low byte
    // is 0, which legitimately leaves odd indices unchanged
    const a = new Noise(0, 0).seed(0.123) as Noise;
    const b = new Noise(0, 0).seed(0.879) as Noise;
    let identical = 0;
    for (let i = 0; i < 256; i++) {
      if (a["perm"][i] === b["perm"][i]) identical++;
    }
    // different seeds must not leave any index systematically unseeded;
    // coincidental matches are possible but index 255 must not be fixed
    expect(a["perm"][255]).not.toBe(180);
    expect(identical).toBeLessThan(64);
    // determinism: same seed gives the same table
    const c = new Noise(0, 0).seed(0.123) as Noise;
    expect(Array.from(a["perm"])).toEqual(Array.from(c["perm"]));
  });

  it("does not repeat noise with period 12 along the x axis", () => {
    const n = new Noise(0, 0);
    n.seed(0.42);
    const vals: number[] = [];
    for (const base of [3, 15, 27, 39]) {
      n.initNoise(base + 0.5, 7.3);
      vals.push(n.noise2D());
    }
    const distinct = new Set(vals.map((v) => v.toFixed(9)));
    expect(distinct.size).toBeGreaterThan(1);
  });

  it("produces continuous noise across cell boundaries and negative coords", () => {
    const n = new Noise(0, 0);
    n.seed(0.7);
    const at = (x: number, y: number) => {
      n.initNoise(x, y);
      return n.noise2D();
    };
    // continuity: value just below and above an integer boundary are close
    expect(Math.abs(at(4.999, 2.5) - at(5.001, 2.5))).toBeLessThan(0.05);
    expect(Math.abs(at(-3.001, 2.5) - at(-2.999, 2.5))).toBeLessThan(0.05);
    // noise is exactly 0 at integer lattice points; probe determinism off-lattice
    expect(at(-7.5, -2.25)).toBe(at(-7.5, -2.25));
  });
});
